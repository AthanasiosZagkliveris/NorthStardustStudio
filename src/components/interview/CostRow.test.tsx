import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { offeringCard, openBox, openCard, openTile } from "../../test/interviewTestUtils";
import {
    asBusinessCapabilityValue,
    createBusinessPartner,
    createBusinessResourceSlot,
    frequencyIdsOf,
    normalCostOf,
    soleUnitOf,
    unitsOf
} from "../../framework/engine/AnswerUtils";

/* G6: the cost row (Qty, Price, currency, Frequency, Unit), the frequencies and units of each group, useful life, warranty and the rate override. */

afterEach(cleanup);

type Value = ReturnType<typeof asBusinessCapabilityValue>;

function Harness({ initial, onValue }: { initial: unknown; onValue?: (value: Value) => void }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); onValue?.(next as Value); }} />;
}

const base = () => asBusinessCapabilityValue(undefined);
const cost = (price: string, frequency: string, unit = "") => ({ price, frequency, frequencyOther: "", unit, currency: "" });
const card = (name: string, fields: Record<string, unknown> = {}) => ({ ...createBusinessResourceSlot(), name, status: "costs", ...fields });
const options = () => screen.getAllByRole("option").map(option => option.textContent);

describe("the frequencies and units of a group", () => {

    it("a group offers its own frequencies; one it does not know offers all seven", () => {
        expect(frequencyIdsOf("infrastructure", "premises-utilities")).toEqual(["monthly"]);
        expect(frequencyIdsOf("infrastructure", "devices-tools")).toEqual(["monthly", "per-unit"]);
        expect(frequencyIdsOf("offering", "devices-tools")).toEqual(["annually", "per-unit"]);
        expect(frequencyIdsOf("offering", "royalties")).toEqual(["one-time", "monthly", "annually", "percent-revenue"]);
        expect(frequencyIdsOf("infrastructure", "unassigned")).toHaveLength(7);
    });

    it("a group has its units, \"unit\" always among them; one unit besides \"unit\" is text", () => {
        expect(unitsOf("infrastructure", "furniture-fittings")).toEqual(["item", "set", "unit"]);
        expect(unitsOf("infrastructure", "premises-utilities")).toEqual(["unit"]);
        expect(soleUnitOf("infrastructure", "company-vehicles")).toBe("vehicle");
        expect(soleUnitOf("offering", "delivery-team")).toBe("hour");
        expect(soleUnitOf("infrastructure", "furniture-fittings")).toBe("");
    });

    it("fills what the group fixes, once a price is typed: the one frequency, and a Per unit price\x27s unit; and keeps what is there", () => {
        expect(normalCostOf(cost("", ""), "infrastructure", "premises-utilities").frequency).toBe("");
        expect(normalCostOf(cost("40", ""), "infrastructure", "premises-utilities").frequency).toBe("monthly");
        expect(normalCostOf(cost("40", "per-unit"), "infrastructure", "company-vehicles").unit).toBe("vehicle");
        expect(normalCostOf(cost("40", "per-unit"), "infrastructure", "furniture-fittings").unit).toBe("unit");
        expect(normalCostOf(cost("40", "per-unit", "set"), "infrastructure", "furniture-fittings").unit).toBe("set");
        expect(normalCostOf(cost("40", "annually"), "infrastructure", "premises-utilities").frequency).toBe("annually");
        const read = asBusinessCapabilityValue({ formatVersion: 3, resources: { utilities: [{ id: "premises-utilities", slots: [{ id: "u", cost: { price: "40" } }] }] } });
        expect(read.resources.utilities[0].slots[0].cost.frequency).toBe("monthly");
        expect(asBusinessCapabilityValue(read)).toEqual(read);
    });

});

describe("the cost row of a card", () => {

    it("a group with several frequencies lists only its own", () => {
        const value = base();
        render(<Harness initial={{ ...value, offering: { ...value.offering, resources: [card("Loom", { category: "equipment", group: "devices-tools", cost: cost("5", "annually") })] } }} />);
        openTile("Resources", undefined, undefined, offeringCard());
        openBox("Equipment");
        openBox("Devices & Tools");
        openCard("Loom");
        fireEvent.click(screen.getByLabelText(/Resource 1 payment frequency: /));
        expect(options()).toEqual(["Annually", "Per unit"]);
    });

    it("a group with one frequency shows it as text; a One-time one is not shown at all", () => {
        const value = base();
        render(<Harness initial={{ ...value, resources: { utilities: [{ id: "premises-utilities", name: "", slots: [card("Power")] }] } }} />);
        openTile("Utilities");
        openCard("Power");
        expect(screen.queryByLabelText(/payment frequency/)).toBeNull();
        expect([...document.querySelectorAll(".business-capability-static-value")].map(node => node.textContent)).toContain("Monthly");
        cleanup();
        render(<Harness initial={{ ...value, resources: { workspace: [{ id: "premises", name: "", slots: [card("Studio", { status: "buy" })] }] } }} />);
        openTile("Workspace");
        openCard("Studio");
        expect(screen.getByLabelText("Resource 1 price")).toBeTruthy();
        expect(screen.queryByLabelText(/payment frequency/)).toBeNull();
        expect(screen.queryByText("One-time")).toBeNull();
    });

    it("Per unit shows the group\x27s units beside the Frequency, with no label; another frequency shows none", () => {
        const value = base();
        let latest: Value | undefined;
        render(<Harness
            initial={{ ...value, resources: { workstation: [{ id: "furniture-fittings", name: "", slots: [card("Desk", { cost: cost("90", "per-unit", "item") })] }] } }}
            onValue={(next) => { latest = next; }}
        />);
        openTile("Workstation");
        openCard("Desk");
        fireEvent.click(screen.getByLabelText(/Resource 1 unit: /));
        expect(options()).toEqual(["item", "set", "unit"]);
        fireEvent.click(screen.getByRole("option", { name: "set" }));
        expect(latest!.resources.workstation[0].slots[0].cost).toMatchObject({ frequency: "per-unit", unit: "set" });
        // (The Unit has no label of its own.)
        expect([...document.querySelectorAll(".field-label")].map(node => node.textContent)).not.toContain("Unit");
    });

    it("one unit besides \"unit\" is text", () => {
        const value = base();
        render(<Harness initial={{ ...value, resources: { vehicles: [{ id: "company-vehicles", name: "", slots: [card("Van", { cost: cost("9000", "per-unit", "vehicle") })] }] } }} />);
        openTile("Vehicles", "Company Vehicles");
        openCard("Van");
        expect(screen.queryByLabelText(/Resource 1 unit: /)).toBeNull();
        expect([...document.querySelectorAll(".business-capability-static-value")].map(node => node.textContent)).toContain("vehicle");
    });

    it("a quantity takes whole numbers, and decimals when the unit is an hour, a metre, a litre or kWh", () => {
        const value = base();
        let latest: Value | undefined;
        render(<Harness
            initial={{ ...value, resources: { vehicles: [{ id: "vehicle-running-costs", name: "", slots: [card("Diesel", { cost: cost("1.5", "per-unit", "litre"), quantity: "1" })] }] } }}
            onValue={(next) => { latest = next; }}
        />);
        openTile("Vehicles", "Vehicle Running Costs");
        openCard("Diesel");
        fireEvent.change(screen.getByLabelText("Resource 1 quantity"), { target: { value: "2.5" } });
        expect(latest!.resources.vehicles[0].slots[0].quantity).toBe("2.5");
        fireEvent.click(screen.getByLabelText(/Resource 1 unit: /));
        fireEvent.click(screen.getByRole("option", { name: "km" }));
        fireEvent.change(screen.getByLabelText("Resource 1 quantity"), { target: { value: "3.5" } });
        expect(latest!.resources.vehicles[0].slots[0].quantity).toBe("35");
    });

});

describe("the lower rows", () => {

    it("Useful life is asked of an asset bought, in whole years", () => {
        const value = base();
        let latest: Value | undefined;
        render(<Harness
            initial={{ ...value, resources: { equipment: [{ id: "devices-tools", name: "", slots: [card("Laptop", { cost: cost("1500", "per-unit", "item") })] }] } }}
            onValue={(next) => { latest = next; }}
        />);
        openTile("Equipment");
        openCard("Laptop");
        fireEvent.change(screen.getByLabelText("Resource 1 useful life in years"), { target: { value: "3.5y" } });
        expect(latest!.resources.equipment[0].slots[0].usefulLife).toBe("35");
        cleanup();
        // (Not asked of what is rented or of a utility.)
        render(<Harness initial={{ ...value, resources: { utilities: [{ id: "premises-utilities", name: "", slots: [card("Power", { cost: cost("40", "monthly") })] }] } }} />);
        openTile("Utilities");
        openCard("Power");
        expect(screen.queryByLabelText("Resource 1 useful life in years")).toBeNull();
    });

    it("a Warranty is a tick on equipment, with its date in a Calendar beside it once ticked", () => {
        const value = base();
        let latest: Value | undefined;
        render(<Harness
            initial={{ ...value, resources: { equipment: [{ id: "devices-tools", name: "", slots: [card("Laptop")] }] } }}
            onValue={(next) => { latest = next; }}
        />);
        openTile("Equipment");
        openCard("Laptop");
        expect(screen.queryByLabelText("Resource 1 warranty until")).toBeNull();
        fireEvent.click(screen.getByRole("checkbox", { name: "Resource 1 warranty" }));
        expect(latest!.resources.equipment[0].slots[0].warranty).toBe(true);
        const until = screen.getByLabelText("Resource 1 warranty until");
        fireEvent.change(until, { target: { value: "12/12/2030" } });
        fireEvent.blur(until);
        expect(latest!.resources.equipment[0].slots[0].warrantyUntil).toBe("2030-12-12");
        fireEvent.click(screen.getByRole("checkbox", { name: "Resource 1 warranty" }));
        expect(latest!.resources.equipment[0].slots[0]).toMatchObject({ warranty: false, warrantyUntil: "" });
    });

    it("a Rate override is a contract\x27s own percent, for a % of revenue price of Royalties and of a Revenue Partner", () => {
        const value = base();
        let latest: Value | undefined;
        render(<Harness
            initial={{ ...value, offering: { ...value.offering, resources: [card("Author royalty", { category: "documents", group: "royalties", cost: cost("8", "percent-revenue") })] } }}
            onValue={(next) => { latest = next; }}
        />);
        openTile("Resources", undefined, undefined, offeringCard());
        openBox("Documents & Rights");
        openBox("Royalties");
        openCard("Author royalty");
        fireEvent.change(screen.getByLabelText("Resource 1 rate override in percent"), { target: { value: "12.5" } });
        expect(latest!.offering.resources[0].rateOverride).toBe("12.5");
        cleanup();
        render(<Harness initial={{ ...value, offering: { ...value.offering, providers: [{ ...createBusinessPartner("Shop", "partners"), group: "revenue-partners", cost: cost("10", "percent-revenue") }], professionals: [] } }} />);
        openTile("Partners & Providers", "Partners", "Shop");
        expect(screen.getByLabelText("Shop rate override in percent")).toBeTruthy();
    });

});
