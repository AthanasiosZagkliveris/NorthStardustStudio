import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import { AnswerType } from "../enums/AnswerType.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { asBusinessCapabilityValue } from "./AnswerUtils.ts";
import { reviewCount, reviewCountText, reviewItems } from "./ReviewItems.ts";
import exampleText from "../../../docs/examples/lumen-and-loom-studio.json?raw";

const example = JSON.parse(exampleText) as { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };
const ids: Record<number, string> = { 1: "identity", 2: "brand", 3: "business", 4: "strategy" };
const load = (number: number) => InterviewSession.fromJSON(example.systems[String(number)], frameworkRegistry.getFramework(ids[number]));
const titles = { 1: "1. Identity System", 2: "2. Brand System", 3: "3. Business System", 4: "4. Strategy System" };

function lumen() {
    return { 1: load(1), 2: load(2), 3: load(3), 4: load(4) } as Record<number, InterviewSession | null>;
}

describe("the Review page's items", () => {

    test("a System not started is one item, with the way to it", () => {
        const sessions = lumen();
        sessions[4] = null;
        const items = reviewItems({ sessions, titles, organisationName: "Lumen & Loom Studio" });
        expect(items).toContainEqual({ group: "open", text: "4. Strategy System is not started yet.", place: { systemNumber: 4, sectionNumber: 1 } });
    });

    test("an unfinished section says which, and opens it", () => {
        const sessions = lumen();
        const business = sessions[3]!;
        const financial = business.getSections().find(section => section.answer?.type === AnswerType.FinancialFoundation)!;
        business.saveResponse(financial.number, {});
        const open = reviewItems({ sessions, titles, organisationName: "Lumen" }).filter(item => item.group === "open" && item.place?.sectionNumber === financial.number);
        // Income tax, asked above the sections, is said as itself.
        expect(open[0]).toEqual({
            group: "open",
            text: "3. Business System → " + financial.number + ". Financial Foundation: Income Tax: not chosen yet.",
            place: { systemNumber: 3, sectionNumber: financial.number, key: "3." + financial.number + ":income-tax" }
        });
        const sections = open.slice(1);
        expect(sections.length).toBeGreaterThan(0);
        expect(sections[0].text).toMatch(/^3\. Business System → \d+\. Financial Foundation: .+ (is not answered yet|is not finished)\.$/);
        expect(sections[0].place?.key).toMatch(new RegExp("^3\\." + financial.number + ":"));
    });

    test("a Resource that Needs Investigation is still open", () => {
        const sessions = lumen();
        const business = sessions[3]!;
        const page = business.getSections().find(section => section.answer?.type === AnswerType.BusinessCapability)!;
        const capability = asBusinessCapabilityValue(business.getResponse(page.number));
        business.saveResponse(page.number, { ...capability, workspace: { ...capability.workspace, status: "investigation" } });
        const items = reviewItems({ sessions, titles, organisationName: "Lumen" });
        expect(items).toContainEqual(expect.objectContaining({
            group: "open",
            text: "3. Business System → " + page.number + ". " + page.title + ": The Workspace needs investigation.",
            place: expect.objectContaining({ key: "3." + page.number + ":infrastructure/resource-group-workspace/status" })
        }));
    });

    test("says what the Business Plan does not cover, and where to answer it when it can be", () => {
        const items = reviewItems({ sessions: lumen(), titles, organisationName: "Lumen" }).filter(item => item.group === "missing");
        expect(items).toContainEqual({ group: "missing", text: "The Business Plan's Intellectual Property and Product Lifecycle is not asked for by the Foundation." });
    });

    test("counts what can be acted on", () => {
        expect(reviewCount([{ group: "missing", text: "x" }, { group: "open", text: "y", place: { systemNumber: 1, sectionNumber: 1 } }])).toBe(1);
        expect(reviewCountText(0)).toBe("Nothing open");
        expect(reviewCountText(1)).toBe("1 item to look at");
        expect(reviewCountText(3)).toBe("3 items to look at");
    });

});
