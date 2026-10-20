import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./editors/BusinessCapabilityEditor";
import { cardBoxes, infrastructureCard, openBox, openCard, openTile } from "../../test/interviewTestUtils";
import { asBusinessCapabilityValue, createBusinessResourceSlot } from "../../framework/engine/AnswerUtils";

/* G1: Offering's Resources are grouped like Infrastructure's (nine categories, fixed groups), and no group or category can be added with "Other…". */

afterEach(cleanup);

function Harness({ initial, onValue }: { initial: unknown; onValue?: (value: unknown) => void }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); onValue?.(next); }} />;
}

const base = () => asBusinessCapabilityValue(undefined);
const card = (name: string, fields: Record<string, unknown> = {}) => ({ ...createBusinessResourceSlot(), name, status: "exists", ...fields });

describe("Offering's Resources are filed by category and group", () => {

    it("opens a category on a box for each of its fixed groups, and a group on its cards", () => {
        const value = base();
        render(<Harness initial={{ ...value, offering: { ...value.offering, resources: [
            card("Kiln", { category: "equipment", group: "production-machinery" }),
            card("Loom", { category: "equipment", group: "production-machinery" }),
            card("Card reader", { category: "equipment", group: "devices-tools" })
        ] } }} />);
        openTile("Resources", "Equipment");
        openBox("Production Machinery");
        expect(cardBoxes()).toEqual(["Resource 1: Kiln", "Resource 2: Loom"]);
    });

    it("keeps the cards with no category yet in a No category tile", () => {
        const value = base();
        render(<Harness initial={{ ...value, offering: { ...value.offering, resources: [card("Yarn"), card("Wool")] } }} />);
        openTile("Resources", "No category");
        expect(cardBoxes()).toEqual(["Resource 1: Yarn", "Resource 2: Wool"]);
    });

    it("gives an Offering resource a Category, then a Group, from the fixed lists and without Other…", () => {
        const value = base();
        let latest: ReturnType<typeof asBusinessCapabilityValue> | undefined;
        render(<Harness initial={{ ...value, offering: { ...value.offering, resources: [card("Yarn")] } }} onValue={(next) => { latest = next as typeof latest; }} />);
        openTile("Resources", "No category");
        openCard("Yarn");
        expect(screen.queryByLabelText(/Resource Yarn group: /)).toBeNull();
        fireEvent.click(screen.getByLabelText(/Resource Yarn category: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Workspace", "Utilities", "Workstation", "Equipment", "Vehicles", "Digital Infrastructure", "Materials & Inventory", "Documents & Rights", "Human Resources"]);
        fireEvent.click(screen.getByRole("option", { name: "Equipment" }));
        expect(latest!.offering.resources[0]).toMatchObject({ category: "equipment", group: "" });
        fireEvent.click(screen.getByLabelText(/Resource Yarn group: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Production Machinery", "Devices & Tools"]);
        fireEvent.click(screen.getByRole("option", { name: "Devices & Tools" }));
        expect(latest!.offering.resources[0]).toMatchObject({ category: "equipment", group: "devices-tools" });
        // A category with the one group files the card in it, and its Group is text.
        fireEvent.click(screen.getByLabelText(/Resource Yarn category: /));
        fireEvent.click(screen.getByRole("option", { name: "Materials & Inventory" }));
        expect(latest!.offering.resources[0]).toMatchObject({ category: "materials", group: "materials-stock" });
        expect((screen.getByLabelText(/Resource Yarn group: /) as HTMLButtonElement).disabled).toBe(true);
    });

    it("offers no Other… for an Infrastructure resource's Group, and no Other tile in a category", () => {
        const value = base();
        const slot = card("Fibre");
        render(<Harness initial={{ ...value, resources: { digital: [{ id: "software-web", name: "", slots: [slot, card("Backup")] }] } }} />);
        openTile("Resources", "Digital Infrastructure", undefined, infrastructureCard());
        expect(screen.queryByRole("button", { name: /Add other|Add Other/ })).toBeNull();
        openBox("Software & Web");
        openCard("Fibre");
        fireEvent.click(screen.getByLabelText(/Resource Fibre group: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Software & Web", "Cloud & Security"]);
    });

});
