import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { offeringCard, openBox, openCard, openTile } from "../../test/interviewTestUtils";
import {
    asBusinessCapabilityValue,
    billingOf,
    costOptionsOf,
    costWithOption,
    createBusinessPartner,
    createBusinessResourceSlot,
    optionFrequenciesOf
} from "../../framework/engine/AnswerUtils";
import { incompleteCards } from "../../framework/engine/CardCompleteness";
import { createGlobalSettings } from "../../framework/engine/GlobalSettings";

/* I3: the cost option and billing type of Platforms & Payments, Revenue Partners, Royalties, Insurances and Licences (and the courier's and the campaign's options). */

afterEach(cleanup);

type Value = ReturnType<typeof asBusinessCapabilityValue>;

function Harness({ initial, onValue }: { initial: unknown; onValue?: (value: Value) => void }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); onValue?.(next as Value); }} globalSettings={createGlobalSettings()} />;
}

const base = () => asBusinessCapabilityValue(undefined);
const cost = (price: string, frequency: string, unit = "") => ({ price, frequency, frequencyOther: "", unit, currency: "" });
const offeringSlot = (group: string, category: string, fields: Record<string, unknown> = {}) =>
    ({ ...createBusinessResourceSlot(), id: "r1", name: "Thing", status: "costs", startDate: "2027-02-01", category, group, offeringIds: ["*"], ...fields });
const withSlot = (slot: object) => ({ ...base(), offering: { ...base().offering, resources: [slot] } });

describe("the options of the cost model", () => {

    it("each group has its own, and each option its billing type", () => {
        expect(costOptionsOf("offering", "platforms-payments").map(option => [option.label, option.billing])).toEqual([
            ["Payment gateway", "percentage"], ["Marketplace or delivery platform", "percentage"], ["SaaS e-commerce platform", "fixed"]
        ]);
        expect(costOptionsOf("offering", "royalties").map(option => option.billing)).toEqual(["percentage", "fixed", "lump-sum"]);
        expect(costOptionsOf("offering", "revenue-partners").map(option => option.billing)).toEqual(["percentage", "percentage"]);
        expect(costOptionsOf("infrastructure", "insurances").map(option => option.label)).toEqual(["Commercial property and liability", "Key-person or employee health"]);
        expect(costOptionsOf("infrastructure", "licences").map(option => option.billing)).toEqual(["lump-sum", "fixed"]);
        expect(costOptionsOf("offering", "logistics-fulfilment").map(option => option.label)).toEqual(["Flat per parcel", "By weight or zone", "Monthly flat fee", "Fulfilment per item"]);
        expect(costOptionsOf("offering", "agencies-influencers").map(option => option.label)).toEqual(["Campaign fee", "Monthly budget", "Retainer", "Per post"]);
        expect(costOptionsOf("offering", "materials-stock")).toEqual([]);
    });

    it("a courier's or a campaign's option has no billing type", () => {
        expect(billingOf("offering", "logistics-fulfilment", "flat-per-parcel")).toBe("");
        expect(billingOf("offering", "royalties", "fixed-royalty")).toBe("fixed");
    });

    it("the billing type locks the driver: Percentage is % of Rev, a Lump sum is One-time, a Fixed amount Monthly or Annually", () => {
        expect(optionFrequenciesOf("offering", "royalties", "royalty-on-sales")).toEqual(["percent-revenue"]);
        expect(optionFrequenciesOf("offering", "royalties", "franchise-fee")).toEqual(["one-time"]);
        expect(optionFrequenciesOf("offering", "royalties", "fixed-royalty")).toEqual(["monthly", "annually"]);
        expect(optionFrequenciesOf("offering", "insurances", "property-liability")).toEqual(["annually"]);
        expect(optionFrequenciesOf("infrastructure", "insurances", "property-liability")).toEqual(["monthly", "annually"]);
        expect(optionFrequenciesOf("infrastructure", "insurances", "key-person-health")).toEqual(["monthly"]);
        expect(optionFrequenciesOf("offering", "platforms-payments", "saas-platform")).toEqual(["monthly"]);
        expect(optionFrequenciesOf("offering", "royalties", "")).toBeNull();
    });

    it("choosing an option sets the driver, keeps one it allows, and sets the unit of a Per unit option", () => {
        expect(costWithOption(cost("5", "annually"), "offering", "royalties", "royalty-on-sales").frequency).toBe("percent-revenue");
        expect(costWithOption(cost("5", "annually"), "offering", "royalties", "fixed-royalty").frequency).toBe("annually");
        expect(costWithOption(cost("5", "percent-revenue"), "offering", "royalties", "franchise-fee").frequency).toBe("one-time");
        expect(costWithOption(cost("5", ""), "offering", "agencies-influencers", "per-post")).toMatchObject({ frequency: "per-unit", unit: "post" });
        expect(costWithOption(cost("5", "per-unit", "post"), "offering", "agencies-influencers", "retainer")).toMatchObject({ frequency: "monthly", unit: "" });
    });

    it("a saved option is kept only when it is one of the group's", () => {
        const kept = asBusinessCapabilityValue(withSlot(offeringSlot("royalties", "documents", { costOption: "fixed-royalty" })));
        expect(kept.offering.resources[0].costOption).toBe("fixed-royalty");
        const dropped = asBusinessCapabilityValue(withSlot(offeringSlot("royalties", "documents", { costOption: "payment-gateway" })));
        expect(dropped.offering.resources[0].costOption).toBe("");
    });

});

describe("a card that lacks its option or its period", () => {

    it("is incomplete without a cost option, in a group that asks for one", () => {
        const value = asBusinessCapabilityValue(withSlot(offeringSlot("licences", "documents", { cost: cost("100", "annually") })));
        expect(incompleteCards(value).get("r1")).toEqual(["Cost option"]);
        const chosen = asBusinessCapabilityValue(withSlot(offeringSlot("licences", "documents", { costOption: "annual-renewal", cost: cost("100", "annually") })));
        expect(incompleteCards(chosen).has("r1")).toBe(false);
    });

    it("a card of a group with no options is not asked for one", () => {
        const value = asBusinessCapabilityValue(withSlot(offeringSlot("materials-stock", "materials", { cost: cost("2", "per-unit", "kg") })));
        expect(incompleteCards(value).has("r1")).toBe(false);
    });

    it("an upfront franchise fee also needs its amortisation period", () => {
        const slot = offeringSlot("royalties", "documents", { costOption: "franchise-fee", cost: cost("20000", "one-time") });
        expect(incompleteCards(asBusinessCapabilityValue(withSlot(slot))).get("r1")).toEqual(["Amortisation period"]);
        expect(incompleteCards(asBusinessCapabilityValue(withSlot({ ...slot, amortisationYears: "8" }))).has("r1")).toBe(false);
    });

    it("a supplier or partner is asked for its option from the start", () => {
        const value = asBusinessCapabilityValue({ ...base(), offering: { ...base().offering, providers: [{ ...createBusinessPartner("Stripe", "suppliers"), id: "p1", group: "platforms-payments", cost: cost("2", "percent-revenue") }] } });
        expect(incompleteCards(value).get("p1")).toContain("Cost option");
    });

});

describe("the cost option on the card", () => {

    function openRoyalties(initial: unknown, onValue?: (value: Value) => void) {
        render(<Harness initial={initial} onValue={onValue} />);
        openTile("Resources", undefined, undefined, offeringCard());
        openBox("Documents & Rights");
        openBox("Royalties");
        openCard("Thing");
    }

    it("shows the Cost option, then its Billing type as text, and the choice locks the Frequency", () => {
        let latest: Value | undefined;
        openRoyalties(withSlot(offeringSlot("royalties", "documents", { cost: cost("8", "monthly") })), (next) => { latest = next; });
        expect(screen.queryByText("Billing type")).toBeNull();
        fireEvent.click(screen.getByLabelText(/Resource 1 cost option/));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Royalty on sales", "Fixed royalty", "Upfront franchise or master licence fee"]);
        fireEvent.click(screen.getByRole("option", { name: "Royalty on sales" }));
        expect(latest!.offering.resources[0]).toMatchObject({ costOption: "royalty-on-sales", cost: { frequency: "percent-revenue" } });
        expect(screen.getByText("Percentage")).toBeTruthy();
        // (One driver: shown as text, not a dropdown.)
        expect(screen.queryByLabelText("Resource 1 payment frequency")).toBeNull();
    });

    it("a Percentage option shows the Rate override with the default rate of the Global Settings beside it", () => {
        openRoyalties(withSlot(offeringSlot("royalties", "documents", { costOption: "royalty-on-sales", cost: cost("8", "percent-revenue") })));
        fireEvent.click(screen.getByLabelText("Rate override"));
        expect((screen.getByLabelText("Resource 1 rate override in percent") as HTMLInputElement).placeholder).toBe("10%");
    });

    it("a Fixed amount shows no Rate override and offers Monthly or Annually", () => {
        openRoyalties(withSlot(offeringSlot("royalties", "documents", { costOption: "fixed-royalty", cost: cost("8", "monthly") })));
        expect(screen.queryByLabelText("Resource 1 rate override in percent")).toBeNull();
        fireEvent.click(screen.getByLabelText("Resource 1 payment frequency: Monthly"));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Monthly", "Annually"]);
    });

    it("an upfront franchise fee is One-time (not shown) and asks for the amortisation period", () => {
        let latest: Value | undefined;
        openRoyalties(withSlot(offeringSlot("royalties", "documents", { costOption: "franchise-fee", cost: cost("20000", "one-time") })), (next) => { latest = next; });
        fireEvent.change(screen.getByLabelText("Resource 1 amortisation period in years"), { target: { value: "8" } });
        expect(latest!.offering.resources[0].amortisationYears).toBe("8");
    });

    it("a supplier's card has the Cost option above its price", () => {
        const initial = { ...base(), offering: { ...base().offering, providers: [{ ...createBusinessPartner("Stripe", "suppliers"), id: "p1", name: "Stripe", group: "platforms-payments", costOption: "payment-gateway", cost: cost("2", "percent-revenue") }] } };
        render(<Harness initial={initial} />);
        openTile("Partners & Suppliers", "Suppliers", "Stripe");
        const option = screen.getByLabelText(/Stripe cost option/);
        const price = screen.getByLabelText("Stripe price");
        expect(option.compareDocumentPosition(price) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(screen.getByText("Percentage")).toBeTruthy();
        fireEvent.click(screen.getByLabelText("Rate override"));
        expect((screen.getByLabelText("Stripe rate override in percent") as HTMLInputElement).placeholder).toBe("%");
    });

});
