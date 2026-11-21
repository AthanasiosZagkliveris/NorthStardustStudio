import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

import BusinessCapabilityEditor from "../editors/BusinessCapabilityEditor";
import { openBox, openCard, openTile } from "../../../test/interviewTestUtils";
import { incompleteCards, offeringLinksMissing } from "../../../framework/engine/cards/CardCompleteness";
import {
    asBusinessCapabilityValue,
    asLegalEntityValue,
    createBusinessResourceSlot,
    equalOfferingShares,
    offeringFractions,
    offeringSharesIncomplete,
    offeringSharesTotal,
    shareBasisOf
} from "../../../framework/engine/answers/AnswerUtils";
import { withInheritedOfferings, withoutGoneOfferings } from "../../../framework/engine/cards/GeneratedCards";
import { asFinancialFoundationValue, consolidateCosts, offeringCosts, type CostSources } from "../../../framework/engine/financial/FinancialModel";

/* G10: an Offering card is linked to an Offering (required). A fixed or one-time cost linked to several is shared by a basis -- by hours, by revenue, in equal
   parts, or the user's own split, which totals 100% (owner, 2026-11-16; Research 2, R3). A cost paid per unit or as a share of revenue is each Offering's in full. */

afterEach(cleanup);

type Value = ReturnType<typeof asBusinessCapabilityValue>;

const FOUNDATION = { segments: [{ offerings: [{ id: "off-a", name: "Alpha" }, { id: "off-b", name: "Beta" }, { id: "off-c", name: "Gamma" }] }] };

function Harness({ initial, onValue }: { initial: unknown; onValue?: (value: Value) => void }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); onValue?.(next as Value); }} foundation={FOUNDATION} />;
}

const cost = (price: string, frequency: string) => ({ price, frequency, frequencyOther: "", unit: "", currency: "" });
const card = (name: string, fields: Record<string, unknown> = {}) => ({ ...createBusinessResourceSlot(), name, status: "costs", startDate: "2027-01-01", cost: cost("300", "monthly"), category: "equipment", group: "devices-tools", ...fields });

describe("the shares of the Offerings a card is linked to", () => {

    it("by default, by the hours each uses where the Offerings have delivery hours, else by revenue; the user's own split totals 100% or the card is incomplete", () => {
        const weights = { hours: { a: 30, b: 10 }, revenue: { a: 1000, b: 3000 } };
        expect(shareBasisOf(["a", "b"], {}, weights)).toBe("hours");
        expect(offeringFractions(["a", "b"], {}, weights)).toEqual({ a: 0.75, b: 0.25 });
        expect(shareBasisOf(["a", "b"], {}, { hours: {}, revenue: weights.revenue })).toBe("revenue");
        expect(offeringFractions(["a", "b"], {}, { hours: {}, revenue: weights.revenue })).toEqual({ a: 0.25, b: 0.75 });
        expect(offeringFractions(["a", "b"], { "~basis": "revenue" }, weights)).toEqual({ a: 0.25, b: 0.75 });
        expect(offeringFractions(["a", "b"], { "~basis": "equal" }, weights)).toEqual({ a: 0.5, b: 0.5 });
        // (Nothing known yet: equal parts.)
        expect(offeringFractions(["a", "b"], { "~basis": "hours" })).toEqual({ a: 0.5, b: 0.5 });
        // The user's own split.
        expect(offeringSharesTotal(["a", "b"], { a: "70", b: "30" })).toBe(100);
        expect(offeringSharesIncomplete(["a", "b"], { a: "70", b: "30", "~basis": "own" })).toBe(false);
        expect(offeringSharesIncomplete(["a", "b"], { a: "70", b: "20", "~basis": "own" })).toBe(true);
        expect(offeringSharesIncomplete(["a", "b"], { a: "70", b: "20" })).toBe(false);
        expect(offeringSharesIncomplete(["a"], {})).toBe(false);
        expect(offeringFractions(["a", "b"], { a: "70", b: "30", "~basis": "own" })).toEqual({ a: 0.7, b: 0.3 });
        expect(offeringFractions(["a", "b"], { a: "70", b: "20", "~basis": "own" })).toEqual({ a: 0.5, b: 0.5 });
        expect(equalOfferingShares(["a", "b", "c"])).toEqual({ a: "33", b: "33", c: "34" });
    });

    it("saved splits are read once: Units become the user's own split in percents; a typed split stays the user's; equal parts take the default; stray shares are dropped", () => {
        const read = asBusinessCapabilityValue({
            formatVersion: 3,
            offering: { resources: [
                { id: "r", offeringIds: ["off-a", "off-b"] },
                { id: "s", offeringIds: ["off-a", "off-b"], offeringShares: { "off-a": "70", "off-b": "30", "off-z": "5" } },
                { id: "u", offeringIds: ["off-a", "off-b"], offeringShares: { "off-a": "3", "off-b": "1", "~units": "1" } }
            ] }
        });
        // (An untouched split saved before the bases: no shares of its own, the default stands.)
        expect(read.offering.resources[0].offeringShares).toEqual({});
        expect(read.offering.resources[1].offeringShares).toEqual({ "off-a": "70", "off-b": "30", "~basis": "own" });
        expect(read.offering.resources[2].offeringShares).toEqual({ "off-a": "75", "off-b": "25", "~basis": "own" });
        expect(asBusinessCapabilityValue(read)).toEqual(read);
    });

    it("a deleted Offering takes its share with it; a generated card gains an Offering at 0, never over 100%", () => {
        const value = asBusinessCapabilityValue({
            ...asBusinessCapabilityValue(undefined),
            offering: { resources: [card("Kiln", { id: "kiln", offeringIds: ["off-a", "off-b", "off-gone"], offeringShares: { "off-a": "60", "off-b": "30", "off-gone": "10", "~basis": "own" } })] }
        });
        const pruned = withoutGoneOfferings(value, ["off-a", "off-b"]);
        expect(pruned.offering.resources[0].offeringIds).toEqual(["off-a", "off-b"]);
        expect(pruned.offering.resources[0].offeringShares).toEqual({ "off-a": "60", "off-b": "30", "~basis": "own" });
        expect(withoutGoneOfferings(pruned, ["off-a", "off-b"])).toBe(pruned);
        expect(withoutGoneOfferings(value, [])).toBe(value);
        expect(withInheritedOfferings).toBeTypeOf("function");
    });

});

describe("what an Offering card lacks", () => {

    it("a link to an Offering, and shares that total 100%; a card of Infrastructure needs neither", () => {
        const value = asBusinessCapabilityValue({
            ...asBusinessCapabilityValue(undefined),
            resources: { equipment: [{ id: "devices-tools", name: "", slots: [card("Laptop", { id: "infra" })] }] },
            offering: {
                resources: [
                    card("Unlinked", { id: "none" }),
                    card("One", { id: "one", offeringIds: ["off-a"] }),
                    card("Split", { id: "split", offeringIds: ["off-a", "off-b"], offeringShares: { "off-a": "60", "off-b": "40", "~basis": "own" } }),
                    card("Off", { id: "off", offeringIds: ["off-a", "off-b"], offeringShares: { "off-a": "60", "off-b": "30", "~basis": "own" } }),
                    // (A cost paid per unit shares nothing: its split is never short.)
                    card("Yarn", { id: "yarn", offeringIds: ["off-a", "off-b"], offeringShares: { "off-a": "60", "off-b": "30", "~basis": "own" }, cost: cost("2", "per-unit"), category: "materials", group: "raw-materials" })
                ]
            }
        });
        const missing = incompleteCards(value);
        expect(missing.get("none")).toEqual(["Linked Offerings"]);
        expect(missing.has("one")).toBe(false);
        expect(missing.has("split")).toBe(false);
        expect(missing.get("off")).toEqual(["Offering shares"]);
        expect(missing.has("infra")).toBe(false);
        expect(missing.has("yarn")).toBe(false);
        expect(offeringLinksMissing({ offeringIds: [], offeringShares: {} })).toEqual(["Linked Offerings"]);
    });

});

describe("the cost of a card shared by Offerings", () => {

    it("a fixed cost is shared by the card's basis; a cost paid per unit carries no shares, each Offering paying it in full", () => {
        const capability = asBusinessCapabilityValue({
            ...asBusinessCapabilityValue(undefined),
            offering: { resources: [
                card("Kiln", { id: "kiln", offeringIds: ["off-a", "off-b"], offeringShares: { "off-a": "70", "off-b": "30", "~basis": "own" } }),
                card("Yarn", { id: "yarn", offeringIds: ["off-a", "off-b"], offeringShares: { "off-a": "70", "off-b": "30", "~basis": "own" }, cost: cost("2", "per-unit"), category: "materials", group: "raw-materials" })
            ] }
        });
        const sources: CostSources = { legalEntity: asLegalEntityValue(undefined), capability, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: true };
        const lines = consolidateCosts({ ...asFinancialFoundationValue({}), planStart: { month: "01", year: "2027" } }, sources);
        expect(lines.find(line => line.id === "kiln")!.offeringShares).toEqual({ "off-a": 0.7, "off-b": 0.3 });
        expect(offeringCosts(lines, "off-a").fixedMonthly).toBe(210);
        expect(offeringCosts(lines, "off-b").fixedMonthly).toBe(90);
        // (By hours: the hours each uses a month.)
        const byHours = consolidateCosts({ ...asFinancialFoundationValue({}), planStart: { month: "01", year: "2027" } }, { ...sources, capability: { ...capability, offering: { ...capability.offering, resources: [{ ...capability.offering.resources[0], offeringShares: { "~basis": "hours" } }] } }, shareWeights: { hours: { "off-a": 20, "off-b": 60 }, revenue: {} } });
        expect(byHours.find(line => line.id === "kiln")!.offeringShares).toEqual({ "off-a": 0.25, "off-b": 0.75 });
        const yarn = lines.find(line => line.id === "yarn");
        expect(yarn === undefined || yarn.offeringShares === undefined).toBe(true);
    });

});

describe("the shares on the card", () => {

    const tick = (offering: string) => document.querySelector<HTMLInputElement>("input[aria-label='Resource 1 linked Offerings: " + offering + "']")!;

    function setup(fields: Record<string, unknown> = {}) {
        let latest: Value | undefined;
        const value = asBusinessCapabilityValue(undefined);
        render(<Harness
            initial={{ ...value, offering: { ...value.offering, resources: [card("Kiln", { offeringIds: [], ...fields })] } }}
            onValue={(next) => { latest = next; }}
        />);
        openTile("Resources");
        openBox("Equipment");
        openBox("Devices & Tools");
        openCard("Kiln");
        return () => latest!.offering.resources[0];
    }

    it("one Offering shows no percent and no question; two ask \"How is it shared?\", by revenue while no Offering has delivery hours, each percent a record", () => {
        const slot = setup();
        fireEvent.click(tick("Alpha"));
        expect(slot().offeringIds).toEqual(["off-a"]);
        expect(screen.queryByLabelText(/share of/)).toBeNull();
        expect(screen.queryByText("How is it shared?")).toBeNull();
        fireEvent.click(tick("Beta"));
        expect(screen.getByRole("button", { name: "Resource 1 linked Offerings how it is shared: By the revenue each one brings" })).toBeTruthy();
        // (No revenue known yet: equal parts, shown, not typed.)
        expect(screen.getByLabelText("Resource 1 linked Offerings share of Alpha").textContent).toBe("50%");
        expect(screen.queryByText(/Total/)).toBeNull();
    });

    it("My own split starts from the split shown and says what is left to share", () => {
        const slot = setup({ offeringIds: ["off-a", "off-b"], offeringShares: { "off-a": "50", "off-b": "50" } });
        fireEvent.click(screen.getByRole("button", { name: /how it is shared:/ }));
        fireEvent.click(screen.getByRole("option", { name: "My own split" }));
        expect(slot().offeringShares).toEqual({ "off-a": "50", "off-b": "50", "~basis": "own" });
        fireEvent.change(screen.getByLabelText("Resource 1 linked Offerings share of Alpha"), { target: { value: "30" } });
        expect(screen.getByText("Total 80%: 20% left to share")).toBeTruthy();
        expect(incompleteCards(slot() && { ...asBusinessCapabilityValue(undefined), offering: { ...asBusinessCapabilityValue(undefined).offering, resources: [slot()] } }).get(slot().id)).toEqual(["Offering shares"]);
        fireEvent.change(screen.getByLabelText("Resource 1 linked Offerings share of Beta"), { target: { value: "70" } });
        expect(screen.getByText("Total 100%")).toBeTruthy();
    });

    it("a cost paid per unit shows the ticks alone: each Offering pays it in full", () => {
        setup({ offeringIds: ["off-a", "off-b"], cost: cost("2", "per-unit"), category: "materials", group: "raw-materials" });
        expect(screen.queryByText("How is it shared?")).toBeNull();
        expect(screen.queryByLabelText(/share of/)).toBeNull();
    });

    it("ticking a third Offering keeps the typed shares and starts it at 0; unticking one takes its share away", () => {
        const slot = setup({ offeringIds: ["off-a", "off-b"], offeringShares: { "off-a": "70", "off-b": "30", "~basis": "own" } });
        fireEvent.click(tick("Gamma"));
        expect(slot().offeringShares).toEqual({ "off-a": "70", "off-b": "30", "off-c": "0", "~basis": "own" });
        fireEvent.click(tick("Beta"));
        expect(slot().offeringShares).toEqual({ "off-a": "70", "off-c": "0", "~basis": "own" });
        expect(within(document.body).getByText("Total 70%: 30% left to share")).toBeTruthy();
    });

});
