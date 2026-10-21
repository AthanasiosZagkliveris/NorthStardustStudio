import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "../editors/BusinessCapabilityEditor";
import { infrastructureCard, openBox, openCard, openTile } from "../../../test/interviewTestUtils";
import {
    asBusinessCapabilityValue,
    createBusinessActivity,
    createBusinessPartner,
    createBusinessResourceSlot
} from "../../../framework/engine/AnswerUtils";

/* G2: Start date and End date after the name of every card, a one-option dropdown shown as text, and the status "+". */

afterEach(cleanup);

type Value = ReturnType<typeof asBusinessCapabilityValue>;

function Harness({ initial, onValue }: { initial: unknown; onValue?: (value: Value) => void }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); onValue?.(next as Value); }} />;
}

const base = () => asBusinessCapabilityValue(undefined);
const card = (name: string, fields: Record<string, unknown> = {}) => ({ ...createBusinessResourceSlot(), name, status: "exists", ...fields });

describe("Start date and End date, straight after the name", () => {

    it("a resource card asks for both, and keeps what is typed as an ISO date", () => {
        const value = base();
        let latest: Value | undefined;
        render(<Harness initial={{ ...value, resources: { equipment: [{ id: "devices-tools", name: "", slots: [card("Laptop")] }] } }} onValue={(next) => { latest = next; }} />);
        openTile("Equipment");
        openCard("Laptop");
        const start = screen.getByRole("textbox", { name: "Resource 1 start date" });
        // The End date is optional: it comes with its tick.
        expect(screen.queryByRole("textbox", { name: "Resource 1 end date" })).toBeNull();
        fireEvent.click(screen.getByRole("checkbox", { name: "Resource 1 has an end date" }));
        const end = screen.getByRole("textbox", { name: "Resource 1 end date" });
        expect(start).toBeTruthy();
        // (They stand straight after the name: before the Category.)
        expect(start.compareDocumentPosition(screen.getByLabelText(/Resource Laptop category: /)) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        // (A date is committed when its box is left.)
        fireEvent.change(start, { target: { value: "12/12/2027" } });
        fireEvent.blur(start);
        fireEvent.change(end, { target: { value: "11/11/2028" } });
        fireEvent.blur(end);
        expect(latest!.resources.equipment[0].slots[0]).toMatchObject({ startDate: "2027-12-12", endDate: "2028-11-11" });
        // Unticked, the date goes.
        fireEvent.click(screen.getByRole("checkbox", { name: "Resource 1 has an end date" }));
        expect(latest!.resources.equipment[0].slots[0].endDate).toBe("");
        expect(screen.queryByRole("textbox", { name: "Resource 1 end date" })).toBeNull();
    });

    it("a partner card asks for both", () => {
        const value = base();
        let latest: Value | undefined;
        render(<Harness initial={{ ...value, professionals: [{ ...createBusinessPartner("Acme", "partners"), group: "alliances-networks" }] }} onValue={(next) => { latest = next; }} />);
        openTile("Partners");
        openCard("Acme");
        const start = screen.getByRole("textbox", { name: "Acme start date" });
        fireEvent.change(start, { target: { value: "01/02/2027" } });
        fireEvent.blur(start);
        expect(latest!.professionals[0].startDate).toMatch(/^2027-0[12]-0[12]$/);
        fireEvent.click(screen.getByRole("checkbox", { name: "Acme has an end date" }));
        expect(screen.getByRole("textbox", { name: "Acme end date" })).toBeTruthy();
    });

    it("an activity card asks for both", () => {
        const value = base();
        render(<Harness initial={{ ...value, activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity(), name: "Open the shop" }] }] }} />);
        openTile("Operational");
        openCard("Open the shop");
        expect(screen.getByRole("textbox", { name: "Activity 1 start date" })).toBeTruthy();
        fireEvent.click(screen.getByRole("checkbox", { name: "Activity 1 has an end date" }));
        expect(screen.getByRole("textbox", { name: "Activity 1 end date" })).toBeTruthy();
    });

    it("is read as a real day or not at all; a founder has a start date only", () => {
        const read = asBusinessCapabilityValue({
            formatVersion: 3,
            founders: [{ id: "f", name: "Maya", roles: [], startDate: "2027-03-01", endDate: "2030-01-01" }],
            offering: { resources: [{ id: "r", startDate: "2027-02-30", endDate: "2027-02-28" }] }
        });
        expect(read.founders[0].startDate).toBe("2027-03-01");
        expect(read.founders[0]).not.toHaveProperty("endDate");
        expect(read.offering.resources[0]).toMatchObject({ startDate: "", endDate: "2027-02-28" });
    });

});

describe("a dropdown with one option is shown as text", () => {

    it("the Group of a category that has the one group is text, and the card is filed in it", () => {
        const value = base();
        render(<Harness initial={{ ...value, resources: { equipment: [{ id: "devices-tools", name: "", slots: [card("Laptop")] }] } }} />);
        openTile("Equipment");
        openCard("Laptop");
        // (The one group stays a cell, as the Category's is: set, and not to be pressed.)
        const group = screen.getByLabelText(/Resource Laptop group: /) as HTMLButtonElement;
        expect(group.getAttribute("aria-label")).toMatch(/Devices & Tools$/);
        expect(group.disabled).toBe(true);
        expect(screen.getByLabelText(/Resource Laptop category: /)).toBeTruthy();
    });

    it("a card of a category with several groups keeps its Group dropdown", () => {
        const value = base();
        render(<Harness initial={{ ...value, resources: { vehicles: [{ id: "company-vehicles", name: "", slots: [card("Van")] }] } }} />);
        openTile("Resources", "Vehicles", undefined, infrastructureCard());
        openBox("Company Vehicles");
        openCard("Van");
        expect(screen.getByLabelText(/Resource Van group: /)).toBeTruthy();
    });

});

describe("the status \"+\" adds another status row", () => {

    const supplier = { ...createBusinessPartner("Acme Installers", "suppliers"), id: "acme", group: "technical-support" };

    it("adds a row of Partners & Suppliers beside the first status, names its supplier, and takes it away with the ×", () => {
        const value = base();
        let latest: Value | undefined;
        render(<Harness initial={{ ...value, providers: [supplier], resources: { equipment: [{ id: "devices-tools", name: "", slots: [card("Oven", { status: "costs" })] }] } }} onValue={(next) => { latest = next; }} />);
        openTile("Equipment");
        openCard("Oven");
        expect(screen.queryByLabelText(/Resource 1 status 2/)).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Add Status to Resource 1" }));
        expect(latest!.resources.equipment[0].slots[0].extraStatuses).toHaveLength(1);
        // The row's status is chosen: Partners & Suppliers or Activity. Its supplier is picked from the section's partners and suppliers.
        fireEvent.click(screen.getByLabelText(/Resource 1 status 2: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Partners & Suppliers", "Activity"]);
        fireEvent.click(screen.getByRole("option", { name: "Partners & Suppliers" }));
        // Group, then Name.
        fireEvent.click(screen.getByLabelText(/Resource 1 status 2 supplier group: /));
        fireEvent.click(screen.getByRole("option", { name: "Technical Support" }));
        fireEvent.click(screen.getByLabelText(/Resource 1 status 2 supplier: /));
        fireEvent.click(screen.getByRole("option", { name: "Acme Installers" }));
        expect(latest!.resources.equipment[0].slots[0].extraStatuses[0]).toMatchObject({ status: "partners-suppliers", providerId: "acme" });
        // ... and the link symbol beside the name opens the supplier's card.
        expect(screen.getByRole("button", { name: "Open Supplier “Acme Installers”" })).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: /Remove Resource 1 status 2/ }));
        expect(latest!.resources.equipment[0].slots[0].extraStatuses).toEqual([]);
    });

    it("a status row is saved and read back", () => {
        const read = asBusinessCapabilityValue({
            formatVersion: 3,
            offering: { resources: [{ id: "r", extraStatuses: [{ id: "s1", status: "partners-suppliers", providerId: "acme" }, { id: "s2", status: "nonsense" }] }] }
        });
        expect(read.offering.resources[0].extraStatuses).toEqual([
            { id: "s1", status: "partners-suppliers", providerId: "acme", activityId: "" },
            { id: "s2", status: "", providerId: "", activityId: "" }
        ]);
    });

});
