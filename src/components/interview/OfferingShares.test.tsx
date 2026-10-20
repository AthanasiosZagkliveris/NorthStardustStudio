import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./editors/BusinessCapabilityEditor";
import { openBox, openCard, openTile } from "../../test/interviewTestUtils";
import { incompleteCards, offeringLinksMissing } from "../../framework/engine/CardCompleteness";
import {
    asBusinessCapabilityValue,
    asLegalEntityValue,
    createBusinessResourceSlot,
    equalOfferingShares,
    offeringFractions,
    offeringSharesIncomplete,
    offeringSharesTotal
} from "../../framework/engine/AnswerUtils";
import { asFinancialFoundationValue, consolidateCosts, offeringCosts, type CostSources } from "../../framework/engine/FinancialModel";

/* G10: an Offering card is linked to an Offering (required), with a percent for each when it is linked to several; they total 100%. */

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

    it("equal to start; typed ones total 100% or the card is incomplete; one Offering carries all", () => {
        expect(equalOfferingShares(["a", "b", "c"])).toEqual({ a: "33", b: "33", c: "34" });
        expect(equalOfferingShares(["a"])).toEqual({ a: "100" });
        expect(offeringSharesTotal(["a", "b"], { a: "70", b: "30" })).toBe(100);
        expect(offeringSharesIncomplete(["a", "b"], { a: "70", b: "30" })).toBe(false);
        expect(offeringSharesIncomplete(["a", "b"], { a: "70", b: "20" })).toBe(true);
        expect(offeringSharesIncomplete(["a", "b"], { a: "100" })).toBe(true);
        expect(offeringSharesIncomplete(["a"], {})).toBe(false);
        expect(offeringSharesIncomplete([], {})).toBe(false);
        expect(offeringFractions(["a", "b"], { a: "70", b: "30" })).toEqual({ a: 0.7, b: 0.3 });
        expect(offeringFractions(["a", "b"], { a: "70", b: "20" })).toEqual({ a: 0.5, b: 0.5 });
    });

    it("a card linked to several Offerings before there were shares keeps being shared equally; stray shares are dropped", () => {
        const read = asBusinessCapabilityValue({
            formatVersion: 3,
            offering: { resources: [{ id: "r", offeringIds: ["off-a", "off-b"] }, { id: "s", offeringIds: ["off-a", "off-b"], offeringShares: { "off-a": "70", "off-b": "30", "off-z": "5" } }] }
        });
        expect(read.offering.resources[0].offeringShares).toEqual({ "off-a": "50", "off-b": "50" });
        expect(read.offering.resources[1].offeringShares).toEqual({ "off-a": "70", "off-b": "30" });
        expect(asBusinessCapabilityValue(read)).toEqual(read);
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
                    card("Split", { id: "split", offeringIds: ["off-a", "off-b"], offeringShares: { "off-a": "60", "off-b": "40" } }),
                    card("Off", { id: "off", offeringIds: ["off-a", "off-b"], offeringShares: { "off-a": "60", "off-b": "30" } })
                ]
            }
        });
        const missing = incompleteCards(value);
        expect(missing.get("none")).toEqual(["Linked Offerings"]);
        expect(missing.has("one")).toBe(false);
        expect(missing.has("split")).toBe(false);
        expect(missing.get("off")).toEqual(["Offering shares"]);
        expect(missing.has("infra")).toBe(false);
        expect(offeringLinksMissing({ offeringIds: [], offeringShares: {} })).toEqual(["Linked Offerings"]);
    });

});

describe("the cost of a card shared by Offerings", () => {

    it("is shared out by the shares of the card, equally where it gives none", () => {
        const capability = asBusinessCapabilityValue({
            ...asBusinessCapabilityValue(undefined),
            offering: { resources: [card("Kiln", { id: "kiln", offeringIds: ["off-a", "off-b"], offeringShares: { "off-a": "70", "off-b": "30" } })] }
        });
        const sources: CostSources = { legalEntity: asLegalEntityValue(undefined), capability, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: true };
        const lines = consolidateCosts({ ...asFinancialFoundationValue({}), planStart: { month: "01", year: "2027" } }, sources);
        expect(lines.find(line => line.id === "kiln")!.offeringShares).toEqual({ "off-a": 0.7, "off-b": 0.3 });
        expect(offeringCosts(lines, "off-a").fixedMonthly).toBe(210);
        expect(offeringCosts(lines, "off-b").fixedMonthly).toBe(90);
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

    it("one Offering shows no percent; two start equal and total 100%", () => {
        const slot = setup();
        fireEvent.click(tick("Alpha"));
        expect(slot().offeringIds).toEqual(["off-a"]);
        expect(screen.queryByLabelText(/share of/)).toBeNull();
        fireEvent.click(tick("Beta"));
        expect(slot().offeringShares).toEqual({ "off-a": "50", "off-b": "50" });
        expect((screen.getByLabelText("Resource 1 linked Offerings share of Alpha") as HTMLInputElement).value).toBe("50");
        expect(screen.getByText("Total 100%")).toBeTruthy();
    });

    it("a share typed that leaves the total off says so", () => {
        const slot = setup({ offeringIds: ["off-a", "off-b"], offeringShares: { "off-a": "50", "off-b": "50" } });
        fireEvent.change(screen.getByLabelText("Resource 1 linked Offerings share of Alpha"), { target: { value: "70" } });
        expect(slot().offeringShares).toEqual({ "off-a": "70", "off-b": "50" });
        expect(screen.getByText("Total 120%: the shares must total 100%")).toBeTruthy();
        fireEvent.change(screen.getByLabelText("Resource 1 linked Offerings share of Beta"), { target: { value: "30" } });
        expect(screen.getByText("Total 100%")).toBeTruthy();
    });

    it("ticking a third Offering starts the shares again, equal", () => {
        const slot = setup({ offeringIds: ["off-a", "off-b"], offeringShares: { "off-a": "70", "off-b": "30" } });
        fireEvent.click(tick("Gamma"));
        expect(slot().offeringShares).toEqual({ "off-a": "33", "off-b": "33", "off-c": "34" });
    });

});
