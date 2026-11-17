import { describe, expect, it } from "vitest";
import { asBusinessFoundationValue } from "./AnswerBusinessFoundation";
import { offeringStartsById } from "./EffectiveAnswers";
import { createDemand, demandFieldShown, marketShareLine, NOT_READY_NOTES } from "./DemandCapacity";
import { demandSuggestions } from "./JourneySuggestions";
import { withDemand } from "./FinancialModel";
import type { SegmentIdentity } from "./SegmentContext";

/* Demand & Conversion reads the answers (the open decisions and gaps, Group 4d, item 23; owner, 2026-11-17). */

const foundation = (o2: string) => ({
    segments: [{ id: "s", name: "Makers", questions: {}, profiles: [], offerings: [{ id: "o", name: "Kit", category: "Product", questions: { o2: [o2] } }] }]
});

describe("the typical ranges in a rate's i", () => {
    const buy = { key: "buy", help: "The share of visitors who buy.", placeholder: "e.g. 2" };
    it("gives online shop visitors the shops' range, its reference last, and the typical figure as the placeholder", () => {
        const shown = demandFieldShown("marketplace", buy, [{ category: "Website", name: "Online Store" }]);
        expect(shown.placeholder).toBe("e.g. 1.3");
        expect(shown.help).toHaveLength(3);
        expect(shown.help[2]).toMatch(/^Based on: Littledata/);
    });
    it("gives a shop's visitors none", () => {
        expect(demandFieldShown("marketplace", buy, [{ category: "In Person", name: "Studio / Shop" }])).toEqual({ help: [buy.help], placeholder: "e.g. 2" });
    });
    it("gives the funnel's buy rate and the tenders won theirs", () => {
        expect(demandFieldShown("funnel", { key: "buy", help: "h", placeholder: "e.g. 25" }, []).placeholder).toBe("e.g. 20");
        expect(demandFieldShown("contracts", { key: "win", help: "h", placeholder: "e.g. 25" }, []).help[1]).toBe("Small firms win about 1 tender in 4.");
    });
});

describe("the market-size check", () => {
    it("says the customers a year as a share of the market's band, never changing a figure", () => {
        expect(marketShareLine({ expected: 100, joining: null, recurring: false }, "boutique")).toBe("Your expected customers are 2% of the market you described.");
        expect(marketShareLine({ expected: 2, joining: null, recurring: false }, "mass")).toBe("Your expected customers are under 1% of the market you described.");
        expect(marketShareLine({ expected: 20, joining: 5, recurring: true }, "micro")).toBe("Your expected customers are 6% of the market you described.");
        expect(marketShareLine({ expected: 5, joining: null, recurring: false }, undefined)).toBeNull();
    });
});

describe("the Identity answers in the source suggestions", () => {
    it("proposes Contracts or tenders where the business sells to government", () => {
        const segment = asBusinessFoundationValue(foundation("now")).segments[0];
        const government: SegmentIdentity = { relationships: ["b2g"], marketType: "single", audience: [], stage: "manage" };
        expect(demandSuggestions(segment, "o", [], { sources: [] }, government).map(row => row.type)).toContain("contracts");
        expect(demandSuggestions(segment, "o", [], { sources: [] }).map(row => row.type)).not.toContain("contracts");
    });
});

describe("Ready from", () => {
    it("is asked of an Offering still an idea or being built, with its note", () => {
        expect(offeringStartsById(asBusinessFoundationValue(foundation("idea")).segments, "o").notReady).toBe("idea");
        expect(offeringStartsById(asBusinessFoundationValue(foundation("now")).segments, "o").notReady).toBeUndefined();
        expect(NOT_READY_NOTES.idea).toBe("This Offering is still an idea. Its sales start once it is ready.");
    });
    it("moves Begins to the month it is ready, only while O2 says it is not", () => {
        const page = { streams: [{ offeringId: "o", start: { month: "1", year: "2027" } }] } as never;
        const demand = { o: { ...createDemand(), readyFrom: { month: "6", year: "2027" } } };
        const start = (o2: string) => (withDemand(page, demand, foundation(o2)) as { streams: { start: { month: string } }[] }).streams[0].start.month;
        expect(start("idea")).toBe("6");
        expect(start("now")).toBe("1");
    });
});
