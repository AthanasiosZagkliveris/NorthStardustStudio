import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import { AnswerType } from "../enums/AnswerType.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { sectionStatuses } from "./SectionStatus.ts";
import { sectionRailItems } from "../../components/interview/rails/railItems.ts";
import { asLegalEntityValue, asStrategyFoundationValue } from "./AnswerUtils.ts";
import quillfieldText from "../../data/examples/quillfield-automation-llc.json?raw";

type SavedState = Parameters<typeof InterviewSession.fromJSON>[0];

const quill = JSON.parse(quillfieldText) as { systems: Record<string, SavedState> };

function page(id: string, type: AnswerType) {
    return frameworkRegistry.getFramework(id).sections.find(section => section.answer?.type === type)!;
}

function columnsPage(id: string, number: number) {
    return frameworkRegistry.getFramework(id).sections.find(section => section.number === number)!;
}

const idsOf = (answer: Parameters<typeof sectionRailItems>[0]) => sectionRailItems(answer).map(item => item.id);

describe("section status", () => {

    test("a columns page: each column not started, in progress or defined on its own", () => {

        const definition = columnsPage("identity", 1);
        const [first, second] = definition.answer!.parts!;

        const statuses = sectionStatuses(definition.answer, { [first.id]: "We automate small offices." });

        expect(statuses.get(first.id)).toBe("defined");
        expect(statuses.get(second.id)).toBe("not-started");
        expect(statuses.size).toBe(definition.answer!.parts!.length);

    });

    test("a bespoke page: a required section half answered is in progress", () => {

        const legal = page("identity", AnswerType.LegalEntity);
        const ids = idsOf(legal.answer);

        const statuses = sectionStatuses(legal.answer, { organisation: { name: "Quillfield" } }, { railIds: ids });

        expect(ids).toHaveLength(6);
        expect(statuses.get(ids[0])).toBe("in-progress");
        expect(statuses.get(ids[1])).toBe("not-started");

    });

    test("a saved legal-item \"not applicable\" tick is ignored, and VAT's old value reads as not registered", () => {

        const legal = page("identity", AnswerType.LegalEntity);
        const ids = idsOf(legal.answer);

        const statuses = sectionStatuses(legal.answer, { requirementsNotApplicable: true, expensesNotApplicable: true }, { railIds: ids, pageDefined: false });
        expect(statuses.get(ids[4])).toBe("not-started");
        expect(statuses.get(ids[5])).toBe("not-started");
        expect("requirementsNotApplicable" in asLegalEntityValue({ requirementsNotApplicable: true })).toBe(false);
        // VAT has no "Not applicable" of its own: its tick says it (unticked, not registered).
        expect(asLegalEntityValue({ tax: { consumptionTaxStatus: "not-applicable" } }).tax.consumptionTaxStatus).toBe("no");

    });

    test("optional sections are never in progress for being empty, and defined with their page", () => {

        const profile = page("identity", AnswerType.FoundersProfile);
        const ids = idsOf(profile.answer);

        expect(sectionStatuses(profile.answer, undefined, { railIds: ids, pageDefined: false }).get(ids[1])).toBe("not-started");
        expect(sectionStatuses(profile.answer, undefined, { railIds: ids, pageDefined: true }).get(ids[1])).toBe("defined");
        expect(sectionStatuses(profile.answer, { teamGaps: "An accountant, by contract." }, { railIds: ids }).get(ids[1])).toBe("defined");

        const legal = page("identity", AnswerType.LegalEntity);
        const legalIds = idsOf(legal.answer);
        const statuses = sectionStatuses(legal.answer, undefined, { railIds: legalIds });

        expect(statuses.get(legalIds[4])).toBe("not-started");
        expect(statuses.get(legalIds[5])).toBe("not-started");

    });

    test("a complete example page has every section defined", () => {

        const session = InterviewSession.fromJSON(quill.systems["1"], frameworkRegistry.getFramework("identity"));
        const legal = page("identity", AnswerType.LegalEntity);
        const ids = idsOf(legal.answer);

        const statuses = sectionStatuses(legal.answer, session.getResponse(legal.number), { railIds: ids, pageDefined: true });

        expect(ids.map(id => statuses.get(id))).toEqual(ids.map(() => "defined"));

    });

    test("the Strategic Period's Themes, each from its own Goals and Objectives", () => {

        const session = InterviewSession.fromJSON(quill.systems["4"], frameworkRegistry.getFramework("strategy"));
        const foundation = page("strategy", AnswerType.StrategyFoundation);
        const period = page("strategy", AnswerType.StrategicPeriod);
        const themes = asStrategyFoundationValue(session.getResponse(foundation.number)).themes;

        const done = sectionStatuses(period.answer, session.getResponse(period.number), { themes });

        expect(themes.length).toBeGreaterThan(0);
        expect(themes.map(theme => done.get(theme.id))).toEqual(themes.map(() => "defined"));

        const untouched = sectionStatuses(period.answer, undefined, { themes });

        expect(themes.map(theme => untouched.get(theme.id))).toEqual(themes.map(() => "not-started"));

        // The Roadmap takes the same, from the Period's value.
        const roadmap = page("strategy", AnswerType.StrategicRoadmap);

        expect(sectionStatuses(roadmap.answer, undefined, { themes, periodValue: session.getResponse(period.number) }).get(themes[0].id))
            .toBe("defined");

    });

});
