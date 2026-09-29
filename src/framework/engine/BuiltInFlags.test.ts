import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import { AnswerType } from "../enums/AnswerType.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { pageStatuses } from "./PageStatus.ts";
import { businessPlan } from "./BusinessDocuments.ts";
import { MarkdownExporter } from "./MarkdownExporter.ts";
import { builtInFlags, withBuiltInFlags } from "./BuiltInFlags.ts";
import { asBusinessCapabilityValue } from "./AnswerUtils.ts";
import exampleText from "../../../docs/examples/lumen-and-loom-studio.json?raw";

const example = JSON.parse(exampleText) as { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };
const load = (number: number, id: string) => InterviewSession.fromJSON(example.systems[String(number)], frameworkRegistry.getFramework(id));

/** The example's Business System, with its first resource set to Needs Investigation. */
function investigating() {
    const business = load(3, "business");
    const page = business.getSections().find(section => section.answer?.type === AnswerType.BusinessCapability)!;
    const capability = asBusinessCapabilityValue(business.getResponse(page.number));
    const groupId = Object.keys(capability.resources).find(id => capability.resources[id].some(subsection => subsection.slots.some(slot => slot.name.trim())))!;
    const subsection = capability.resources[groupId].find(entry => entry.slots.some(slot => slot.name.trim()))!;
    const slot = subsection.slots.find(entry => entry.name.trim())!;
    business.saveResponse(page.number, {
        ...capability,
        resources: {
            ...capability.resources,
            [groupId]: capability.resources[groupId].map(entry => entry.id === subsection.id
                ? { ...entry, slots: entry.slots.map(candidate => candidate.id === slot.id ? { ...candidate, status: "investigation" } : candidate) }
                : entry)
        }
    });
    return { business, page, slot };
}

describe("a Resource that Needs Investigation", () => {

    test("is a built-in Needs investigation flag on its Status", () => {
        const { business, page, slot } = investigating();
        const marks = builtInFlags(3, business);
        const key = "3." + page.number + ":infrastructure/" + slot.id + "/status";
        expect(marks[key]).toMatchObject({ flag: "research", label: slot.name.trim(), builtIn: true, section: "infrastructure" });
        expect(marks[key].anchors?.[0]).toBe(slot.id);
        expect(builtInFlags(3, load(3, "business"))[key]).toBeUndefined();
    });

    test("puts its page in review", () => {
        const { business, page } = investigating();
        expect(pageStatuses(business, undefined, { systemNumber: 3, annotations: {} }).get(page.number)).not.toBe("needs-review");
        expect(pageStatuses(business, undefined, { systemNumber: 3, annotations: withBuiltInFlags({}, 3, business) }).get(page.number)).toBe("needs-review");
    });

    test("prints as to be confirmed in the Business Plan", () => {
        const { business, slot } = investigating();
        const sessions = {
            identity: load(1, "identity"),
            brand: load(2, "brand"),
            business,
            strategy: load(4, "strategy"),
            organisationName: "Lumen & Loom Studio"
        };
        const md = new MarkdownExporter().toMarkdown(business, "Foundation", businessPlan(sessions));
        expect(md).toMatch(new RegExp(slot.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ".*to be confirmed: needs investigation"));
        expect(md).not.toContain("Needs Investigation");
    });

});
