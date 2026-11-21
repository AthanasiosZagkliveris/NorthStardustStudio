import { describe, expect, it } from "vitest";
import { capacityCeiling, createDemand, createDemandSource, demandBasisDraft } from "./DemandCapacity";

/* The fields that start from earlier answers, P1 to P9 (owner, 2026-11-18 03:01: "All, P1 to P9"). */

describe("P1 and P2: a source's Basis draft and what the founders' hours allow", () => {
    it("drafts the Basis from the source's own working", () => {
        const demand = { ...createDemand(), sources: [{ ...createDemandSource("other"), id: "s1", estimate: "10" }] };
        expect(demandBasisDraft(demand, "s1")).toMatch(/^[A-Z].*10.*\.$/);
        expect(demandBasisDraft({ ...createDemand(), sources: [{ ...createDemandSource("other"), id: "s2" }] }, "s2")).toBe("");
    });
    it("says how many a month the founders' delivery hours allow of one Offering", () => {
        const founders = [{ id: "f1", name: "A", hours: "160", deliveryHours: "80", deliveryShare: "" }, { id: "f2", name: "B", hours: "160", deliveryHours: "40", deliveryShare: "" }];
        const delivery = { hours: { f1: "4", f2: "2", partner: "5" } } as never;
        expect(capacityCeiling(founders, delivery)).toBe(20);
        expect(capacityCeiling(founders, undefined)).toBeNull();
    });
});

describe("P9: an Objective's drafts", () => {
    it("names an Objective from each open item and each uncovered skill", async () => {
        const { openItemObjective } = await import("./choices/OfferingQuestions");
        expect(openItemObjective({ kind: "Unmet value", text: "", about: "Good support" })).toBe("Lead on good support");
        expect(openItemObjective({ kind: "Worry left open", text: "", about: "The price or their budget" })).toBe("Answer the worry about the price or their budget");
        expect(openItemObjective({ kind: "Unwanted benefit", text: "" })).toBeNull();
        const { InterviewSession } = await import("../interview");
        const { frameworkRegistry } = await import("./FrameworkRegistry");
        const { strategyObjectiveDrafts } = await import("./BusinessDocuments");
        const quill = (await import("../../data/examples/quillfield-automation-llc.json")).default as unknown as { systems: Record<string, never> };
        const load = (number: number, id: string) => InterviewSession.fromJSON(quill.systems[String(number)] ?? ({ responses: [] } as never), frameworkRegistry.getFramework(id));
        const drafts = strategyObjectiveDrafts({ identity: load(1, "identity"), brand: load(2, "brand"), business: load(3, "business"), strategy: load(4, "strategy"), organisationName: "Quillfield" } as never);
        // (Quillfield's Value Propositions are complete and its skills covered: nothing to draft, so no link shows.)
        expect(drafts).toEqual([]);
        expect(new Set(drafts).size).toBe(drafts.length);
    });
});

describe("K15 and P7: what competitors charge", () => {
    it("keeps From and To as typed, or Not known yet, and spans the Segment's competitors", async () => {
        const { competitorSettle, competitorsPriceRange, competitorTable } = await import("./choices/CompetitorQuestions");
        expect(competitorSettle({ k15: ["40", "120"] }, "direct").k15).toEqual(["40", "120"]);
        expect(competitorSettle({ k15: ["40", "120"], "k15-unknown": ["yes"] }, "direct")).toEqual({ "k15-unknown": ["yes"] });
        // (Not asked of the status quo: its answer goes.)
        expect(competitorSettle({ k15: ["40", "120"] }, "status-quo").k15).toBeUndefined();
        expect(competitorsPriceRange([{ type: "direct", questions: { k15: ["40", "120"] } }, { type: "indirect", questions: { k15: ["90", "300"] } }, { type: "direct", questions: { "k15-unknown": ["yes"] } }]))
            .toMatchObject({ low: 40, high: 300, byNeeds: false });
        expect(competitorsPriceRange([{ type: "direct", questions: {} }])).toBeNull();
        // K16 (doc 48, 15.3): only the competitors meeting at least one of the Offering's needs count; while none ticks K16, every one does.
        const rivals = [
            { type: "direct", name: "Loomcraft", questions: { k15: ["1800", "5000"], k16: ["need-a"] } },
            { type: "indirect", name: "Market stall", questions: { k15: ["15", "60"], k16: ["need-b"] } },
            { type: "direct", name: "Atelier", questions: { k15: ["2000", "6000"], k16: ["need-a", "need-b"] } }
        ];
        expect(competitorsPriceRange(rivals, ["need-a"])).toEqual({ low: 1800, high: 6000, names: ["Loomcraft", "Atelier"], byNeeds: true });
        expect(competitorsPriceRange(rivals, ["need-b"])).toEqual({ low: 15, high: 6000, names: ["Market stall", "Atelier"], byNeeds: true });
        expect(competitorsPriceRange(rivals, ["need-c"])).toBeNull();
        expect(competitorsPriceRange(rivals.map(rival => ({ ...rival, questions: { k15: rival.questions.k15 } })), ["need-a"])).toMatchObject({ low: 15, high: 6000, byNeeds: false });
        expect(competitorsPriceRange(rivals, [])).toMatchObject({ low: 15, high: 6000, byNeeds: false });
        // (K16 is kept through saving, as ids; not asked of the status quo.)
        expect(competitorSettle({ k16: ["need-a", "need-a", "need-b"] }, "direct").k16).toEqual(["need-a", "need-b"]);
        expect(competitorSettle({ k16: ["need-a"] }, "status-quo").k16).toBeUndefined();
        const table = competitorTable([{ name: "A", type: "direct", questions: { k15: ["40", "120"] } }], { profiles: [], reach: undefined, currencySymbol: "£" });
        expect(table.rows.find(row => row[0] === "What they charge")).toEqual(["What they charge", "£40 to £120"]);
    });
});

describe("a draft is added once (owner, 2026-11-18 10:38)", () => {
    it("fills an empty field, adds after the text once, and adds nothing the field holds", async () => {
        const { withDraft, draftAdds } = await import("./choices/CompetitorQuestions");
        const draft = "625 visitors a month, 1.6% buy: about 10 a month.";
        expect(withDraft("", draft)).toBe(draft);
        const once = withDraft("About 625 visitors a month.", draft);
        expect(once).toBe("About 625 visitors a month.\n\n" + draft);
        expect(withDraft(once, draft)).toBe(once);
        expect(draftAdds(once, draft)).toBe(false);
        expect(draftAdds("", "")).toBe(false);
    });
});
