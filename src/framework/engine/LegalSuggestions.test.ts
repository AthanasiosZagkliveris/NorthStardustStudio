import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { reviewItems } from "./ReviewItems.ts";
import { thresholdMonth } from "./LegalSuggestions.ts";
import { paidStaffOf } from "./LegalStarts.ts";
import { asBusinessCapabilityValue, createBusinessResourceSlot } from "./AnswerUtils.ts";
import lumenText from "../../data/examples/lumen-and-loom-studio.json?raw";
import quillText from "../../data/examples/quillfield-automation-llc.json?raw";

/* THE LEGAL SUGGESTIONS, STAGE 2 (doc 53, section 6, decisions 1 (b) and (c), 5 and 6). */
type Saved = { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };
const examples: Record<string, Saved> = { Lumen: JSON.parse(lumenText), Quillfield: JSON.parse(quillText) };
const ids: Record<number, string> = { 1: "identity", 2: "brand", 3: "business", 4: "strategy" };
const titles = { 1: "1. Identity System", 2: "2. Brand System", 3: "3. Business System", 4: "4. Strategy System" };
const load = (which: "Lumen" | "Quillfield") => Object.fromEntries([1, 2, 3, 4].map(number => [number,
    InterviewSession.fromJSON(examples[which].systems[String(number)], frameworkRegistry.getFramework(ids[number]))])) as Record<number, InterviewSession | null>;
const legal = (which: "Lumen" | "Quillfield", today = new Date("2026-11-20T12:00:00")) => reviewItems({ sessions: load(which), titles, organisationName: which, today })
    .filter(item => item.group === "second-look" && item.text.startsWith("1. Identity System → "));

describe("the legal suggestions", () => {

    test("find the month turnover passes a threshold, over 12 months or in one month alone", () => {
        expect(thresholdMonth([10, 10, 10], 100)).toBeNull();
        expect(thresholdMonth(new Array(14).fill(10), 100)).toBe(10);
        expect(thresholdMonth([0, 0, 150], 100)).toBe(2);
    });

    test("say Lumen's VAT is already registered, and suggest only what its answers leave open", () => {
        const texts = legal("Lumen").map(item => item.text);
        // (Lumen is registered for VAT and holds an ICO requirement: neither is said; its studio's business rates and the place to go are.)
        expect(texts.some(text => text.includes("VAT:"))).toBe(false);
        expect(texts.some(text => text.includes("Data protection fee"))).toBe(false);
        expect(texts.some(text => text.startsWith("1. Identity System → 3. Legal Entity: Business rates:"))).toBe(true);
        expect(legal("Lumen")[0].place).toEqual({ systemNumber: 1, sectionNumber: 3 });
    });

    test("say nothing for Quillfield, a New York sole proprietorship, a year on, and the fees' check once over a year old", () => {
        expect(legal("Quillfield")).toEqual([]);
        expect(legal("Lumen", new Date("2028-01-01T12:00:00")).some(item => item.text.includes("official fees were last checked on 19 Nov 2026"))).toBe(true);
    });


    test("ask employers' liability of a paid Staff card only, a contractor never, with HSE40's words for a limited company (GB11)", () => {
        const staff = (status: string, price: string) => ({ ...createBusinessResourceSlot(), id: "s-" + status + price, name: "Assistant", category: "hr", group: "delivery-team", startDate: "2026-10-01", status, cost: { price, frequency: "monthly", frequencyOther: "", unit: "", currency: "" } });
        const capability = (slots: unknown[], providers: unknown[] = []) => asBusinessCapabilityValue({ offering: { resources: slots, providers } });
        expect(paidStaffOf(capability([staff("costs", "1200")])).map(entry => entry.name)).toEqual(["Assistant"]);
        expect(paidStaffOf(capability([staff("costs", ""), staff("exists", "1200")]))).toEqual([]);
        expect(paidStaffOf(capability([], [{ id: "p", name: "Freelance tutor", category: "suppliers", group: "contractors-advisers", cost: { price: "40", frequency: "per-unit" } }]))).toEqual([]);
        // (Lumen, a limited company, with a paid assistant on Offering's Capability: the suggestion, in HSE40's words for a company.)
        const saved = JSON.parse(lumenText) as { systems: Record<string, { responses: { sectionNumber: number; value: { offering: { resources: unknown[] } } }[] }> };
        // (A card of Offering's Capability serves an Offering: Lumen's first.)
        const offeringId = (saved.systems["3"].responses.find(response => response.sectionNumber === 1)!.value as unknown as { segments: { offerings: { id: string }[] }[] }).segments[0].offerings[0].id;
        saved.systems["3"].responses.find(response => response.sectionNumber === 3)!.value.offering.resources.push({ ...staff("costs", "1200"), offeringIds: [offeringId] });
        const sessions = Object.fromEntries([1, 2, 3, 4].map(number => [number, InterviewSession.fromJSON(saved.systems[String(number)] as never, frameworkRegistry.getFramework(ids[number]))])) as Record<number, InterviewSession | null>;
        const text = reviewItems({ sessions, titles, organisationName: "Lumen", today: new Date("2026-11-20T12:00:00") }).find(item => item.text.includes("Employers' liability"))?.text ?? "";
        expect(text).toContain("A limited company needs it for family members too");
        expect(text).toContain("https://www.hse.gov.uk/pubns/hse40.pdf");
    });


    test("suggest the music licence where Lumen's Market / Pop-up channel holds public gatherings, with no question (GB18)", () => {
        expect(legal("Lumen").some(item => item.text.includes("TheMusicLicence (PPL PRS)"))).toBe(true);
    });

});
