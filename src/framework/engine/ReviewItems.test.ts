import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import { AnswerType } from "../enums/AnswerType.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { systems } from "../../data/systems";
import { asBusinessCapabilityValue, asBusinessFoundationValue, createBusinessActivity } from "./AnswerUtils.ts";
import { nothingOpen, headerCount, reviewCount, reviewCountText, reviewItems } from "./ReviewItems.ts";
import lumenText from "../../data/examples/lumen-and-loom-studio.json?raw";
import quillText from "../../data/examples/quillfield-automation-llc.json?raw";

type Saved = { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };
const examples: Record<string, Saved> = { Lumen: JSON.parse(lumenText), Quillfield: JSON.parse(quillText) };
const ids: Record<number, string> = { 1: "identity", 2: "brand", 3: "business", 4: "strategy" };
const titles = { 1: "1. Identity System", 2: "2. Brand System", 3: "3. Business System", 4: "4. Strategy System" };

function load(which: "Lumen" | "Quillfield" = "Lumen") {
    return Object.fromEntries([1, 2, 3, 4].map(number => [number,
        InterviewSession.fromJSON(examples[which].systems[String(number)], frameworkRegistry.getFramework(ids[number]))])) as Record<number, InterviewSession | null>;
}

const pageOf = (session: InterviewSession, type: AnswerType) => session.getSections().find(section => section.answer?.type === type)!;

describe("the Review page's items", () => {

    test.each(["Lumen", "Quillfield"] as const)("%s, fully answered, is ready: nothing still open or missing", (which) => {
        const items = reviewItems({ sessions: load(which), titles, organisationName: which });
        expect(items.filter(item => item.group === "open" || item.group === "missing")).toEqual([]);
        expect(nothingOpen(items)).toBe(true);
    });

    test("a System not started is one item, with the way to it", () => {
        const sessions = load();
        sessions[4] = null;
        const items = reviewItems({ sessions, titles, organisationName: "Lumen" });
        expect(items).toContainEqual({ group: "open", text: "4. Strategy System is not started yet.", place: { systemNumber: 4, sectionNumber: 1 }, capability: "foundation" });
    });

    test("a card with information missing is one item, naming the card and what it lacks", () => {
        const sessions = load();
        const business = sessions[3]!;
        const page = pageOf(business, AnswerType.BusinessFoundation);
        const foundation = asBusinessFoundationValue(business.getResponse(page.number));
        const segment = foundation.segments[0];
        business.saveResponse(page.number, { ...foundation, segments: [{ ...segment, valueProposition: "" }, ...foundation.segments.slice(1)] });
        const items = reviewItems({ sessions, titles, organisationName: "Lumen" }).filter(item => item.group === "open");
        expect(items).toEqual([{
            group: "open",
            capability: "foundation",
            text: "3. Business System → " + page.number + ". Foundation: " + segment.name.trim() + ": value proposition.",
            place: { systemNumber: 3, sectionNumber: page.number, key: "3." + page.number + ":value-proposition", anchors: [segment.id] }
        }]);
    });

    test("an empty Mission is said where it is drawn, Purpose, and keeps its saved key in Definition (doc 45)", () => {
        const sessions = load();
        const identity = sessions[1]!;
        identity.saveResponse(1, { ...(identity.getResponse(1) as object), mission: "" });
        expect(reviewItems({ sessions, titles, organisationName: "Lumen" }).filter(item => item.group === "open")).toEqual([{
            group: "open",
            capability: "foundation",
            text: "1. Identity System → 2. Purpose: Mission: not answered yet.",
            place: { systemNumber: 1, sectionNumber: 1, key: "1.1:mission" }
        }]);
    });

    test("no founder named is said on Definition, where Founders & Ownership is drawn, and opens that page (2026-11-09)", () => {
        const sessions = load();
        const identity = sessions[1]!;
        const legal = pageOf(identity, AnswerType.LegalEntity);
        identity.saveResponse(legal.number, { ...(identity.getResponse(legal.number) as object), founders: [] });
        const founders = reviewItems({ sessions, titles, organisationName: "Lumen" }).filter(item => item.text.includes("a founder's name"));
        expect(founders).toEqual([{
            group: "open",
            capability: "foundation",
            text: "1. Identity System → 1. Definition: Founders & Ownership: a founder's name.",
            place: { systemNumber: 1, sectionNumber: 1, anchors: ["legal-section-1"] }
        }]);
    });

    test("income tax, asked above the Financial Foundation's sections, is said as itself", () => {
        const sessions = load();
        const business = sessions[3]!;
        const financial = pageOf(business, AnswerType.FinancialFoundation);
        business.saveResponse(financial.number, { ...(business.getResponse(financial.number) as object), incomeTax: "" });
        expect(reviewItems({ sessions, titles, organisationName: "Lumen" }).filter(item => item.group === "open")).toEqual([{
            group: "open",
            capability: "foundation",
            text: "3. Business System → " + financial.number + ". Financial Foundation: Income Tax: not chosen yet.",
            place: { systemNumber: 3, sectionNumber: financial.number, key: "3." + financial.number + ":income-tax" }
        }]);
    });

    test("with several founders, an activity nobody is responsible for is open", () => {
        const sessions = load("Quillfield");
        const business = sessions[3]!;
        const page = pageOf(business, AnswerType.BusinessCapability);
        const capability = asBusinessCapabilityValue(business.getResponse(page.number));
        // A second founder beside Quillfield's one.
        const founders = [...capability.founders, { ...capability.founders[0], id: "founder-2", name: "Sam Ortega" }];
        const activity = { ...createBusinessActivity(), name: "Register the trademark" };
        business.saveResponse(page.number, { ...capability, founders, activities: [{ id: "cat-x", name: "Legal", activities: [activity] }, ...capability.activities] });
        expect(reviewItems({ sessions, titles, organisationName: "Quillfield" }).filter(item => item.group === "open")).toContainEqual({
            group: "open",
            capability: "foundation",
            text: "3. Business System → " + page.number + ". Infrastructure & Capability: Register the trademark: responsible founder.",
            place: { systemNumber: 3, sectionNumber: page.number, key: "3." + page.number + ":infrastructure/" + activity.id, anchors: [activity.id] }
        });
    });

    test("an activity whose Responsible tick is off is not open: no responsible by choice", () => {
        const sessions = load("Quillfield");
        const business = sessions[3]!;
        const page = pageOf(business, AnswerType.BusinessCapability);
        const capability = asBusinessCapabilityValue(business.getResponse(page.number));
        const founders = [...capability.founders, { ...capability.founders[0], id: "founder-2", name: "Sam Ortega" }];
        const activity = { ...createBusinessActivity(), name: "Register the trademark", responsibleOff: true };
        business.saveResponse(page.number, { ...capability, founders, activities: [{ id: "cat-x", name: "Legal", activities: [activity] }, ...capability.activities] });
        expect(reviewItems({ sessions, titles, organisationName: "Quillfield" }).filter(item => item.group === "open" && /Register the trademark: responsible/.test(item.text))).toEqual([]);
    });

    test("an Offering with no Type, or no terms (O3), is open, as the later pages read them (phase 5f)", () => {
        const sessions = load("Quillfield");
        const business = sessions[3]!;
        const page = pageOf(business, AnswerType.BusinessFoundation);
        const foundation = asBusinessFoundationValue(business.getResponse(page.number));
        const segment = foundation.segments[0];
        const [first, ...rest] = segment.offerings;
        const { o3: _terms, ...questions } = first.questions ?? {};
        business.saveResponse(page.number, { ...foundation, segments: [{ ...segment, offerings: [{ ...first, category: "", questions }, ...rest] }, ...foundation.segments.slice(1)] });
        const at = "3. Business System → " + page.number + ". Foundation: ";
        const place = { systemNumber: 3, sectionNumber: page.number, key: "3." + page.number + ":offering", anchors: [first.id] };
        expect(reviewItems({ sessions, titles, organisationName: "Quillfield" }).filter(item => item.group === "open")).toEqual([
            { group: "open", capability: "foundation", text: at + first.name.trim() + ": Type: not chosen yet.", place },
            { group: "open", capability: "foundation", text: at + first.name.trim() + ": the terms they pay on: not chosen yet.", place }
        ]);
    });

    test("a second named Segment with no Offering and no competitor of its own is open; one with either is not (phase 5f)", () => {
        const sessions = load("Quillfield");
        const business = sessions[3]!;
        const page = pageOf(business, AnswerType.BusinessFoundation);
        const foundation = asBusinessFoundationValue(business.getResponse(page.number));
        const empty = { ...foundation.segments[0], id: "segment-x", name: "Accountants", profiles: foundation.segments[0].profiles, offerings: [], competitors: [] };
        business.saveResponse(page.number, { ...foundation, segments: [...foundation.segments, empty] });
        const open = () => reviewItems({ sessions, titles, organisationName: "Quillfield" }).filter(item => item.group === "open" && /Accountants: a named Offering/.test(item.text));
        expect(open().map(item => item.text)).toEqual(["3. Business System → " + page.number + ". Foundation: Accountants: a named Offering and a named competitor or alternative."]);
        business.saveResponse(page.number, { ...foundation, segments: [...foundation.segments, { ...empty, competitors: foundation.segments[0].competitors }] });
        expect(open()).toEqual([]);
    });

    test("lists nothing the Foundation never asks for", () => {
        const items = reviewItems({ sessions: load(), titles, organisationName: "Lumen" }).filter(item => item.group === "missing");
        expect(items.some(item => /Intellectual Property/.test(item.text))).toBe(false);
        expect(items.every(item => item.place)).toBe(true);
    });

    test("counts what is still open or worth a second look", () => {
        const open = { group: "open" as const, text: "y", place: { systemNumber: 1, sectionNumber: 1 } };
        expect(reviewCount([{ group: "missing", text: "x" }, open])).toBe(1);
        expect(headerCount([open, { group: "second-look", text: "z" }, { group: "missing", text: "w" }])).toBe(2);
        expect(reviewCountText(0)).toBe("Nothing open");
        expect(reviewCountText(1)).toBe("1 item to look at");
        expect(reviewCountText(3)).toBe("3 items to look at");
    });

});

describe("Review across the whole app", () => {

    /** A System beyond the Foundation with a free-text page, opened, and answered there or not. */
    function project(answered: boolean) {
        const candidates = systems.filter(system => system.capability !== "foundation" && frameworkRegistry.exists(system.id));
        for (const system of candidates) {
            const framework = frameworkRegistry.getFramework(system.id);
            const first = framework.sections.find(section => section.answer?.type === AnswerType.FreeText);
            if (first && framework.sections.length > 1) {
                const session = new InterviewSession(framework);
                if (answered) {
                    session.saveResponse(first.number, "A first answer.");
                }
                return { session, first, system };
            }
        }
        throw new Error("no such System");
    }

    test("lists a System beyond the Foundation once it holds an answer, under its Capability", () => {
        const { session, first, system } = project(true);
        const n = system.number;
        const sessions = { ...load(), [n]: session };
        const items = reviewItems({
            sessions,
            titles: { ...titles, [n]: n + ". " + system.title },
            capabilities: { 1: "foundation", 2: "foundation", 3: "foundation", 4: "foundation", [n]: system.capability },
            order: [1, 2, 3, 4, n],
            organisationName: "Lumen"
        }).filter(item => item.group === "open");
        expect(items.length).toBeGreaterThan(0);
        expect(items.every(item => item.capability === system.capability && item.text.startsWith(n + ". " + system.title + " → "))).toBe(true);
        expect(items.some(item => item.text.includes(first.number + ". " + first.title + ":"))).toBe(false);
    });

    test("leaves out a System never answered", () => {
        const { session, system } = project(false);
        const n = system.number;
        const items = reviewItems({
            sessions: { ...load(), [n]: session },
            titles: { ...titles, [n]: n + ". " + system.title },
            capabilities: { 1: "foundation", 2: "foundation", 3: "foundation", 4: "foundation", [n]: system.capability },
            order: [1, 2, 3, 4, n],
            organisationName: "Lumen"
        });
        expect(items.filter(item => item.group === "open")).toEqual([]);
    });

});
