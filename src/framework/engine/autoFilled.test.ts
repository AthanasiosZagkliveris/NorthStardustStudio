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
