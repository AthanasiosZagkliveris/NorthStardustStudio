import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import { AnswerType } from "../enums/AnswerType.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { InterviewValidator } from "./InterviewValidator.ts";
import { pageStatuses } from "./PageStatus.ts";
import { sectionStatuses } from "./SectionStatus.ts";
import { businessPlan, confirmedText } from "./BusinessDocuments.ts";
import { MarkdownExporter } from "./MarkdownExporter.ts";
import { hasOpenFlag, isNotApplicable, normalizeAnnotations, type Annotations, type ReviewMarks } from "./Annotations.ts";
import { sectionRailItems } from "../../components/interview/rails/railItems.ts";
import exampleText from "../../../docs/examples/lumen-and-loom-studio.json?raw";

const example = JSON.parse(exampleText) as { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };
const load = (number: number, id: string) => InterviewSession.fromJSON(example.systems[String(number)], frameworkRegistry.getFramework(id));

const flagged = (annotations: Annotations): ReviewMarks => ({ systemNumber: 1, annotations });
const note = (flag: "research" | "not-applicable", extra: object = {}) => ({ flag, label: "x", pageTitle: "x", ...extra });

describe("flags on fields", () => {

    test("Doesn't apply counts a column as answered, for the validator and the page status", () => {

        const session = new InterviewSession(frameworkRegistry.getFramework("identity"));
        const definition = session.getSections()[0];
        const parts = definition.answer!.parts!;

        // Every column answered but one, which does not apply.
        session.saveResponse(definition.number, Object.fromEntries(parts.slice(1).map(part => [part.id, "Answered."])));
        const marks = flagged({ ["1." + definition.number + ":" + parts[0].id]: note("not-applicable") });

        expect(pageStatuses(session).get(definition.number)).toBe("in-progress");
        expect(pageStatuses(session, undefined, marks).get(definition.number)).toBe("defined");
        expect(new InterviewValidator().validate(session, undefined, marks).issues
            .some(issue => issue.sectionTitle === parts[0].label)).toBe(false);
        expect(isNotApplicable(marks, definition.number, parts[0].id)).toBe(true);

    });

    test("Doesn't apply counts a bespoke page's section as answered", () => {

        const session = load(1, "identity");
        const legal = session.getSections().find(section => section.answer?.type === AnswerType.LegalEntity)!;
        const value = session.getResponse(legal.number) as { organisation: Record<string, unknown> };
        session.saveResponse(legal.number, { ...value, organisation: { ...value.organisation, mainActivity: "" } });

        expect(pageStatuses(session).get(legal.number)).toBe("in-progress");

        const marks = flagged({ ["1." + legal.number + ":organization"]: note("not-applicable") });

        expect(pageStatuses(session, undefined, marks).get(legal.number)).toBe("defined");
        const ids = sectionRailItems(legal.answer).map(item => item.id);
        expect(sectionStatuses(legal.answer, session.getResponse(legal.number), { railIds: ids, sectionNumber: legal.number, marks }).get("organization"))
            .toBe("defined");

    });

    test("Needs investigation puts the page and its section in review", () => {

        const session = load(1, "identity");
        const legal = session.getSections().find(section => section.answer?.type === AnswerType.LegalEntity)!;
        const marks = flagged({
            ["1." + legal.number + ":organization/legal-form"]: note("research", { section: "organization" })
        });

        expect(hasOpenFlag(marks, legal.number)).toBe(true);
        expect(pageStatuses(session, undefined, marks).get(legal.number)).toBe("needs-review");
        const ids = sectionRailItems(legal.answer).map(item => item.id);
        const statuses = sectionStatuses(legal.answer, session.getResponse(legal.number), { railIds: ids, sectionNumber: legal.number, marks, pageDefined: true });
        expect(statuses.get("organization")).toBe("needs-review");
        expect(statuses.get("founders-ownership")).toBe("defined");

        // Doesn't apply is not an open question.
        expect(hasOpenFlag(flagged({ ["1." + legal.number + ":organization/legal-form"]: note("not-applicable") }), legal.number)).toBe(false);

    });

});

describe("an older flag", () => {

    test("Not sure yet, retired, reads as Needs investigation", () => {
        const stored = { "1.3:organization/legal-form": { flag: "not-sure", label: "Legal Form", pageTitle: "3. Legal Entity" } } as unknown as Annotations;
        expect(normalizeAnnotations(stored)["1.3:organization/legal-form"].flag).toBe("research");
        const current: Annotations = { "1.3:x": note("research") };
        expect(normalizeAnnotations(current)).toBe(current);
    });

});

describe("flags in the documents", () => {

    test("say what is to be confirmed, and leave out what does not apply", () => {
        expect(confirmedText("Ltd", note("research"))).toBe("Ltd (to be confirmed)");
        expect(confirmedText("", note("research", { research: "Ask the accountant" }))).toBe("To be confirmed: needs investigation (Ask the accountant)");
        expect(confirmedText("", note("research"))).toBe("To be confirmed: needs investigation");
        expect(confirmedText("Ltd", note("not-applicable"))).toBe("");
        expect(confirmedText("Ltd")).toBe("Ltd");
    });

    test("the Business Plan prints a flagged legal form and a flagged column", () => {

        const identity = load(1, "identity");
        const legal = identity.getSections().find(section => section.answer?.type === AnswerType.LegalEntity)!;
        const definition = identity.getSections()[0];
        const sessions = {
            identity,
            brand: load(2, "brand"),
            business: load(3, "business"),
            strategy: load(4, "strategy"),
            organisationName: "Lumen & Loom Studio",
            annotations: {
                ["1." + legal.number + ":organization/legal-form"]: note("research"),
                ["1." + definition.number + ":vision"]: note("not-applicable")
            }
        };

        const md = new MarkdownExporter().toMarkdown(sessions.business, "Foundation", businessPlan(sessions));

        expect(md).toContain("(Ltd) (to be confirmed)");
        expect(md).not.toMatch(/\*\*Vision:\*\*/);

        // Without flags, as it was.
        const plain = new MarkdownExporter().toMarkdown(sessions.business, "Foundation", businessPlan({ ...sessions, annotations: {} }));
        expect(plain).toMatch(/\*\*Vision:\*\*/);
        expect(plain).not.toContain("(to be confirmed)");

    });

});
