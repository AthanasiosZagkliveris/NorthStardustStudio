import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { openBox, openCard, openTile } from "../../test/interviewTestUtils";
import { incompleteCards } from "../../framework/engine/CardCompleteness";
import { asBusinessCapabilityValue, createBusinessPartner, createBusinessResourceSlot } from "../../framework/engine/AnswerUtils";

/* G4: Rent and Buy for spaces and vehicles in both places; the Workspace form is the common card. */

afterEach(cleanup);

type Value = ReturnType<typeof asBusinessCapabilityValue>;

function Harness({ initial, onValue }: { initial: unknown; onValue?: (value: Value) => void }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); onValue?.(next as Value); }} />;
}

const base = () => asBusinessCapabilityValue(undefined);
const card = (name: string, fields: Record<string, unknown> = {}) => ({ ...createBusinessResourceSlot(), name, ...fields });
const supplier = (id: string, name: string, group: string) => ({ ...createBusinessPartner(name, "suppliers"), id, group });
const statusOptions = () => screen.getAllByRole("option").map(option => option.textContent);

describe("a space or a vehicle", () => {

    it("offers Exists / Free, Rent, Activity and Buy", () => {
        render(<Harness initial={{ ...base(), resources: { workspace: [{ id: "premises", name: "", slots: [card("Studio", { status: "exists" })] }] } }} />);
        openTile("Workspace");
        openCard("Studio");
        fireEvent.click(screen.getByLabelText(/Resource 1 status: /));
        expect(statusOptions()).toEqual(["Exists / Free", "Rent", "Activity", "Buy"]);
    });

    it("any other card keeps Exists / Free, Partners & Suppliers, Activity and Costs", () => {
        render(<Harness initial={{ ...base(), resources: { equipment: [{ id: "devices-tools", name: "", slots: [card("Laptop", { status: "exists" })] }] } }} />);
        openTile("Equipment");
        openCard("Laptop");
        fireEvent.click(screen.getByLabelText(/Resource 1 status: /));
        expect(statusOptions()).toEqual(["Exists / Free", "Partners & Suppliers", "Activity", "Costs"]);
    });

    it("Rent names a supplier of the ONE group of the place, with a link symbol, and 'Other…' makes one in that group", () => {
        let latest: Value | undefined;
        const value = base();
        render(<Harness
            initial={{
                ...value,
                providers: [supplier("land", "Harbour Estates", "property-vehicles-facilities"), supplier("acc", "Acme Accounts", "business-services")],
                resources: { workspace: [{ id: "premises", name: "", slots: [card("Studio", { status: "rent" })] }] }
            }}
            onValue={(next) => { latest = next; }}
        />);
        openTile("Workspace");
        openCard("Studio");
        // No Category / Group steps: the one group is fixed. Only its cards are offered.
        expect(screen.queryByLabelText(/supplier category: /)).toBeNull();
        fireEvent.click(screen.getByLabelText(/Resource 1 rent: /));
        expect(statusOptions()).toEqual(["Harbour Estates", "Other…"]);
        fireEvent.click(screen.getByRole("option", { name: "Harbour Estates" }));
        expect(latest!.resources.workspace[0].slots[0].providerId).toBe("land");
        expect(screen.getByRole("button", { name: "Open Supplier “Harbour Estates”" }).textContent).toBe("🔗");
        // "Other…" makes a new card of that group and chooses it.
        fireEvent.click(screen.getByLabelText(/Resource 1 rent: /));
        fireEvent.click(screen.getByRole("option", { name: "Other…" }));
        const made = latest!.providers.find(partner => partner.id !== "land" && partner.id !== "acc")!;
        expect(made).toMatchObject({ category: "suppliers", group: "property-vehicles-facilities" });
        expect(latest!.resources.workspace[0].slots[0].providerId).toBe(made.id);
    });

    it("in the Offering the Rent group is Landlords, Leasing & Warehouses", () => {
        const value = base();
        render(<Harness initial={{
            ...value,
            offering: {
                ...value.offering,
                providers: [supplier("whs", "Depot Ltd", "landlords-leasing-warehouses"), supplier("prop", "Harbour Estates", "property-vehicles-facilities")],
                resources: [card("Bay", { status: "rent", category: "workspace", group: "workshop-storage" })]
            }
        }} />);
        openTile("Resources", "Workspace");
        openBox("Workshop & Storage");
        openCard("Bay");
        fireEvent.click(screen.getByLabelText(/Resource 1 rent: /));
        expect(statusOptions()).toEqual(["Depot Ltd", "Other…"]);
    });

    it("Buy asks for the price its group buys with: a space One-time with no Qty, a vehicle Per unit with a Qty", () => {
        let latest: Value | undefined;
        const value = base();
        render(<Harness
            initial={{
                ...value,
                resources: {
                    workspace: [{ id: "premises", name: "", slots: [card("Studio", { status: "exists" })] }],
                    vehicles: [{ id: "company-vehicles", name: "", slots: [card("Van", { status: "exists" }), card("Bike", { status: "exists" })] }]
                }
            }}
            onValue={(next) => { latest = next; }}
        />);
        openTile("Workspace");
        openCard("Studio");
        fireEvent.click(screen.getByLabelText(/Resource 1 status: /));
        fireEvent.click(screen.getByRole("option", { name: "Buy" }));
        expect(latest!.resources.workspace[0].slots[0]).toMatchObject({ status: "buy", cost: { frequency: "one-time" } });
        expect(screen.getByLabelText("Resource 1 price")).toBeTruthy();
        expect(screen.queryByLabelText("Resource 1 quantity")).toBeNull();
        fireEvent.keyDown(document, { key: "Escape" });
        cleanup();
        render(<Harness
            initial={{ ...value, resources: { vehicles: [{ id: "company-vehicles", name: "", slots: [card("Van", { status: "exists" })] }] } }}
            onValue={(next) => { latest = next; }}
        />);
        openTile("Vehicles", "Company Vehicles");
        openCard("Van");
        fireEvent.click(screen.getByLabelText(/Resource 1 status: /));
        fireEvent.click(screen.getByRole("option", { name: "Buy" }));
        expect(latest!.resources.vehicles[0].slots[0]).toMatchObject({ status: "buy", cost: { frequency: "per-unit", unit: "unit" } });
        expect(screen.getByLabelText("Resource 1 quantity")).toBeTruthy();
    });

    it("moving a card into a space group turns its Partners & Suppliers into Rent and its Costs into Buy, and back", () => {
        let latest: Value | undefined;
        const value = base();
        render(<Harness
            initial={{ ...value, resources: { equipment: [{ id: "devices-tools", name: "", slots: [card("Hall", { status: "costs", cost: { price: "10", frequency: "monthly", frequencyOther: "", unit: "", currency: "" } })] }] } }}
            onValue={(next) => { latest = next; }}
        />);
        openTile("Equipment");
        openCard("Hall");
        fireEvent.click(screen.getByLabelText(/Resource Hall category: /));
        fireEvent.click(screen.getByRole("option", { name: "Workspace" }));
        expect(latest!.resources.workspace[0].slots[0].status).toBe("buy");
        fireEvent.click(screen.getByLabelText(/Resource Hall category: /));
        fireEvent.click(screen.getByRole("option", { name: "Equipment" }));
        expect(latest!.resources.equipment.flatMap(subsection => subsection.slots)[0].status).toBe("costs");
    });

    it("a rented space is incomplete until its supplier is named; a bought one until its price is", () => {
        const value = base();
        const read = asBusinessCapabilityValue({ ...value, providers: [supplier("land", "Harbour Estates", "property-vehicles-facilities")], resources: { workspace: [{ id: "premises", name: "", slots: [card("Studio", { id: "a", status: "rent" }), card("Shop", { id: "b", status: "rent", providerId: "land" }), card("Yard", { id: "c", status: "buy" })] }] } });
        const missing = incompleteCards(read);
        expect(missing.get("a")).toEqual(["Rent"]);
        expect(missing.has("b")).toBe(false);
        expect(missing.get("c")).toEqual(["Price", "Payment Frequency"]);
    });

});
