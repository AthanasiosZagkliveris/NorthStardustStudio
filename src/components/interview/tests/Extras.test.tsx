import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "../editors/BusinessCapabilityEditor";
import { openCard, openTile } from "../../../test/interviewTestUtils";
import {
    asBusinessCapabilityValue,
    asLegalEntityValue,
    createBusinessPartner,
    createBusinessResourceSlot,
    partnerExtraKeys,
    slotExtraKeys,
    supplierConnections
} from "../../../framework/engine/AnswerUtils";
import { asFinancialFoundationValue, consolidateCosts, type CostSources } from "../../../framework/engine/FinancialModel";

/* G7: the extras, all optional: where each is offered, how it is kept, and which are costs. */

afterEach(cleanup);

type Value = ReturnType<typeof asBusinessCapabilityValue>;

function Harness({ initial, onValue }: { initial: unknown; onValue?: (value: Value) => void }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); onValue?.(next as Value); }} legalEntityFounders={[{ id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""], experience: "" }]} />;
}

const base = () => asBusinessCapabilityValue(undefined);
const cost = (price: string, frequency: string) => ({ price, frequency, frequencyOther: "", unit: "", currency: "" });
const card = (name: string, fields: Record<string, unknown> = {}) => ({ ...createBusinessResourceSlot(), name, status: "buy", ...fields });
const supplier = (id: string, name: string, group: string, fields: Record<string, unknown> = {}) => ({ ...createBusinessPartner(name, "suppliers"), id, group, cost: cost("900", "monthly"), ...fields });
const labelsOf = () => [...document.querySelectorAll(".optional-field .field-label")].map(node => node.textContent?.replace(/i$/, "").trim()).filter(label => label !== "Notes");

describe("where an extra is offered", () => {

    it("a bought space has its tax and charge, a bought vehicle its road tax, a person Allowance, Commission and Bonus", () => {
        expect(slotExtraKeys("premises", "buy")).toEqual(["property-tax", "service-charge"]);
        expect(slotExtraKeys("workshop-storage", "buy")).toEqual(["property-tax", "service-charge"]);
        expect(slotExtraKeys("premises", "rent")).toEqual([]);
        expect(slotExtraKeys("company-vehicles", "buy")).toEqual(["road-tax"]);
        expect(slotExtraKeys("delivery-vehicles", "exists")).toEqual([]);
        expect(slotExtraKeys("admin-team", "costs")).toEqual(["allowance", "commission", "bonus"]);
        expect(slotExtraKeys("delivery-team", "exists")).toEqual(["allowance", "commission", "bonus"]);
        expect(slotExtraKeys("devices-tools", "costs")).toEqual([]);
    });

    it("a producer has its duties; a landlord or lessor those of what is connected to it", () => {
        const none = { space: false, workshop: false, vehicle: false };
        expect(partnerExtraKeys("producers-wholesalers", none)).toEqual(["minimum-order", "customs-duty", "clearance-handling", "other-duties"]);
        expect(partnerExtraKeys("property-vehicles-facilities", none)).toEqual([]);
        expect(partnerExtraKeys("property-vehicles-facilities", { ...none, space: true })).toEqual(["deposit", "service-charge", "property-tax"]);
        expect(partnerExtraKeys("landlords-leasing-warehouses", { space: true, workshop: true, vehicle: true })).toEqual(["deposit", "service-charge", "property-tax", "handling-pallet", "road-tax"]);
        // (Handling per pallet is the Offering\x27s warehouses\x27 only.)
        expect(partnerExtraKeys("property-vehicles-facilities", { space: true, workshop: true, vehicle: false })).not.toContain("handling-pallet");
        expect(partnerExtraKeys("business-services", { space: true, workshop: true, vehicle: true })).toEqual([]);
    });

    it("what is connected is what rents from the supplier", () => {
        const value = asBusinessCapabilityValue({
            ...base(),
            providers: [supplier("land", "Harbour", "property-vehicles-facilities")],
            resources: {
                workspace: [{ id: "premises", name: "", slots: [card("Studio", { status: "rent", providerId: "land" })] }],
                vehicles: [{ id: "company-vehicles", name: "", slots: [card("Van", { status: "exists", providerId: "land" })] }]
            }
        });
        expect(supplierConnections(value, "land")).toEqual({ space: true, workshop: false, vehicle: false });
        expect(supplierConnections(value, "other")).toEqual({ space: false, workshop: false, vehicle: false });
    });

});

describe("how extras are kept", () => {

    it("only a figure typed is kept, cleaned to its kind; an unknown extra is dropped", () => {
        const read = asBusinessCapabilityValue({
            formatVersion: 3,
            founders: [{ id: "f", name: "A", roles: [], extras: { bonus: "£1,200", allowance: "", nonsense: "5" } }],
            providers: [{ id: "p", category: "suppliers", group: "producers-wholesalers", extras: { "minimum-order": "12.5", "customs-duty": "5.5.5" } }]
        });
        expect(read.founders[0].extras).toEqual({ bonus: "1200" });
        expect(read.providers[0].extras).toEqual({ "minimum-order": "125", "customs-duty": "5.55" });
        expect(asBusinessCapabilityValue(read)).toEqual(read);
    });

    it("a Deposit on a rented Premises card moves to its landlord; one with no landlord stays", () => {
        const read = asBusinessCapabilityValue({
            ...base(),
            providers: [supplier("land", "Harbour", "property-vehicles-facilities"), supplier("other", "Other Estates", "property-vehicles-facilities", { extras: { deposit: "100" } })],
            resources: {
                workspace: [{ id: "premises", name: "", slots: [
                    card("Studio", { id: "a", status: "rent", providerId: "land", deposit: "3750" }),
                    card("Shop", { id: "b", status: "rent", providerId: "other", deposit: "900" }),
                    card("Barn", { id: "c", status: "buy", deposit: "500" })
                ] }]
            }
        });
        const [studio, shop, barn] = read.resources.workspace[0].slots;
        expect(read.providers.find(partner => partner.id === "land")!.extras.deposit).toBe("3750");
        expect(read.providers.find(partner => partner.id === "other")!.extras.deposit).toBe("100");
        expect([studio.deposit, shop.deposit, barn.deposit]).toEqual(["", "900", "500"]);
        expect(asBusinessCapabilityValue(read)).toEqual(read);
    });

});

describe("the extras that are costs", () => {

    const sources = (capability: Value): CostSources => ({
        legalEntity: asLegalEntityValue(undefined), capability, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: true
    });
    const lines = (capability: Value) => consolidateCosts({ ...asFinancialFoundationValue({}), planStart: { month: "01", year: "2027" } }, sources(capability));

    it("a bought space\x27s tax is Annually and its charge Monthly; a person\x27s Bonus is Annually and Allowance Monthly; a commission is a calculated line, a duty is the goods' own kind, a minimum is no line", () => {
        const capability = asBusinessCapabilityValue({
            ...base(),
            founders: [{ id: "f", name: "Ann", roles: [], salary: "2000", extras: { bonus: "1000", allowance: "50", commission: "5" } }],
            resources: {
                workspace: [{ id: "premises", name: "", slots: [card("Studio", { id: "s", cost: cost("90000", "one-time"), extras: { "property-tax": "600", "service-charge": "80" } })] }]
            },
            offering: { ...base().offering, providers: [supplier("prod", "Wool Mill", "producers-wholesalers", { cost: cost("", ""), extras: { "customs-duty": "5", "clearance-handling": "40", "minimum-order": "100" } })] }
        });
        const byId = Object.fromEntries(lines(capability).map(line => [line.id, line]));
        expect(byId["s:property-tax"]).toMatchObject({ frequency: "annually", amount: 600 });
        expect(byId["s:service-charge"]).toMatchObject({ frequency: "monthly", amount: 80 });
        expect(byId["founder-f:bonus"]).toMatchObject({ frequency: "annually", amount: 1000 });
        expect(byId["founder-f:allowance"]).toMatchObject({ frequency: "monthly", amount: 50 });
        // (A commission is a percent of revenue: a calculated line of it, a partner's way.)
        expect(byId["founder-f:commission"]).toMatchObject({ frequency: "usage-based", amount: 5, billing: "percentage" });
        expect(byId["prod:clearance-handling"]).toMatchObject({ frequency: "per-project", amount: 40 });
        expect(byId["prod:customs-duty"]).toBeUndefined();
        expect(byId["prod:minimum-order"]).toBeUndefined();
    });

    it("a landlord\x27s Deposit is an asset returned later, and counts only while a space is rented from it", () => {
        const capability = asBusinessCapabilityValue({
            ...base(),
            providers: [supplier("land", "Harbour", "property-vehicles-facilities", { extras: { deposit: "3750", "service-charge": "50" } })],
            resources: { workspace: [{ id: "premises", name: "", slots: [card("Studio", { id: "a", status: "rent", providerId: "land" })] }] }
        });
        const byId = Object.fromEntries(lines(capability).map(line => [line.id, line]));
        expect(byId["land:deposit"]).toMatchObject({ amount: 3750, asset: "deposit", frequency: "one-time" });
        expect(byId["land:service-charge"]).toMatchObject({ frequency: "monthly", amount: 50 });
        const unrented = asBusinessCapabilityValue({ ...capability, resources: { workspace: [] } });
        expect(lines(unrented).some(line => line.id === "land:deposit")).toBe(false);
    });

    it("a lessor connected to a rented vehicle prices it for the Qty", () => {
        const capability = asBusinessCapabilityValue({
            ...base(),
            providers: [supplier("lease", "Car Lease", "property-vehicles-facilities", { quantity: "3", cost: cost("400", "monthly") })],
            resources: { vehicles: [{ id: "company-vehicles", name: "", slots: [card("Van", { status: "rent", providerId: "lease" })] }] }
        });
        expect(lines(capability).find(line => line.id === "lease")).toMatchObject({ amount: 1200, quantity: 3 });
    });

});

describe("the extras on the cards", () => {

    it("a bought space offers its tax and charge as ticks; a figure typed is kept; unticking clears it", () => {
        let latest: Value | undefined;
        const value = base();
        render(<Harness initial={{ ...value, resources: { workspace: [{ id: "premises", name: "", slots: [card("Studio", { cost: cost("90000", "one-time") })] }] } }} onValue={(next) => { latest = next; }} />);
        openTile("Workspace");
        openCard("Studio");
        expect(labelsOf()).toEqual(["Commercial property tax", "Service charge"]);
        fireEvent.click(screen.getByRole("checkbox", { name: "Commercial property tax" }));
        fireEvent.change(screen.getByLabelText("Resource 1 commercial property tax"), { target: { value: "600" } });
        expect(latest!.resources.workspace[0].slots[0].extras).toEqual({ "property-tax": "600" });
        fireEvent.click(screen.getByRole("checkbox", { name: "Commercial property tax" }));
        expect(latest!.resources.workspace[0].slots[0].extras).toEqual({});
    });

    it("a landlord\x27s card shows the extras of what is connected; nothing connected, nothing", () => {
        const value = base();
        render(<Harness initial={{
            ...value,
            providers: [supplier("land", "Harbour", "property-vehicles-facilities"), supplier("idle", "Idle Estates", "property-vehicles-facilities")],
            resources: { workspace: [{ id: "premises", name: "", slots: [card("Studio", { status: "rent", providerId: "land" })] }] }
        }} />);
        openTile("Suppliers");
        openCard("Harbour");
        expect(labelsOf()).toEqual(["Deposit", "Service charge", "Commercial property tax"]);
        cleanup();
        render(<Harness initial={{ ...value, providers: [supplier("idle", "Idle Estates", "property-vehicles-facilities")] }} />);
        openTile("Suppliers");
        openCard("Idle Estates");
        expect(labelsOf()).toEqual(["Deposit", "Service charge", "Commercial property tax"]);
        expect(screen.queryByLabelText("Idle Estates quantity")).toBeNull();
    });

    it("a lessor connected to a rented vehicle shows a Qty before its price, and Road tax", () => {
        let latest: Value | undefined;
        const value = base();
        render(<Harness
            initial={{
                ...value,
                providers: [supplier("lease", "Car Lease", "property-vehicles-facilities")],
                resources: { vehicles: [{ id: "company-vehicles", name: "", slots: [card("Van", { status: "rent", providerId: "lease" })] }] }
            }}
            onValue={(next) => { latest = next; }}
        />);
        openTile("Suppliers");
        openCard("Car Lease");
        expect(labelsOf()).toEqual(["Road tax"]);
        fireEvent.change(screen.getByLabelText("Car Lease quantity"), { target: { value: "3" } });
        expect(latest!.providers[0].quantity).toBe("3");
    });

    it("a producer offers its minimum and duties; a people card and a founder Allowance, Commission and Bonus", () => {
        const value = base();
        render(<Harness initial={{ ...value, offering: { ...value.offering, providers: [supplier("prod", "Wool Mill", "producers-wholesalers", { cost: cost("", "") })] } }} />);
        openTile("Partners & Suppliers", "Suppliers", "Wool Mill");
        expect(labelsOf()).toEqual(["Minimum order", "Customs duty", "Clearance and handling", "Other duties"]);
        cleanup();
        render(<Harness initial={{ ...value, resources: { hr: [{ id: "admin-team", name: "", slots: [card("Bookkeeper", { status: "costs" })] }] } }} />);
        openTile("Human Resources");
        openCard("Bookkeeper");
        expect(labelsOf()).toEqual(["Allowance", "Commission", "Bonus"]);
    });

    it("a founder card offers Allowance, Commission and Bonus", () => {
        const value = base();
        render(<Harness initial={{ ...value, founders: [{ id: "f1", name: "Ann", roles: [], salary: "2000", hours: "160", deliveryHours: "100" }] }} />);
        openTile("Founders");
        expect(labelsOf()).toEqual(["Allowance", "Commission", "Bonus"]);
    });

});
