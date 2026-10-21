import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "../editors/BusinessCapabilityEditor";
import { openCard, openTile } from "../../../test/interviewTestUtils";
import { asBusinessCapabilityValue, createBusinessPartner, createBusinessResourceSlot } from "../../../framework/engine/AnswerUtils";

/* G3: a status row\x27s partner or supplier is reached in three steps (Category, Group, Name), and the link symbol beside the name opens its card. */

afterEach(cleanup);

type Value = ReturnType<typeof asBusinessCapabilityValue>;

function Harness({ initial, onValue }: { initial: unknown; onValue?: (value: Value) => void }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); onValue?.(next as Value); }} />;
}

const supplier = (id: string, name: string, group: string) => ({ ...createBusinessPartner(name, "suppliers"), id, group });
const oven = () => ({ ...createBusinessResourceSlot(), id: "oven", name: "Oven", status: "partners-suppliers" });

function setup(extra: Record<string, unknown> = {}) {
    const base = asBusinessCapabilityValue(undefined);
    let latest: Value | undefined;
    render(<Harness
        initial={{
            ...base,
            resources: { equipment: [{ id: "devices-tools", name: "", slots: [oven()] }] },
            providers: [supplier("acme", "Acme Installers", "technical-support"), supplier("bolt", "Bolt Ltd", "technical-support"), supplier("clerk", "Clerk & Co", "business-services")],
            ...extra
        }}
        onValue={(next) => { latest = next; }}
    />);
    openTile("Equipment");
    openCard("Oven");
    return () => latest!;
}

describe("Category, Group, Name", () => {

    it("shows the Group first, with every group in the list, and the Name once the Group is picked", () => {
        setup();
        // (No Category: the group picked says whether the card is a Partner or a Supplier.)
        expect(screen.queryByLabelText(/Resource 1 supplier category: /)).toBeNull();
        expect(screen.getByLabelText(/Resource 1 supplier group: /)).toBeTruthy();
        expect(screen.queryByLabelText(/Resource 1 supplier: /)).toBeNull();
        fireEvent.click(screen.getByLabelText(/Resource 1 supplier group: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Alliances & Networks", "Goods & Equipment", "Business Services", "Creative & IT Services", "Property, Vehicles & Facilities", "Technical Support"]);
        expect(screen.queryByLabelText(/Resource 1 supplier: /)).toBeNull();
        fireEvent.click(screen.getByRole("option", { name: "Technical Support" }));
        fireEvent.click(screen.getByLabelText(/Resource 1 supplier: /));
        // Only the cards of that group.
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Acme Installers", "Bolt Ltd", "Other…"]);
    });

    it("the link symbol appears beside the chosen name and opens that card with this one; there is no 'Open …' line", () => {
        const value = setup();
        fireEvent.click(screen.getByLabelText(/Resource 1 supplier group: /));
        fireEvent.click(screen.getByRole("option", { name: "Technical Support" }));
        expect(screen.queryByRole("button", { name: /^Open Supplier/ })).toBeNull();
        fireEvent.click(screen.getByLabelText(/Resource 1 supplier: /));
        fireEvent.click(screen.getByRole("option", { name: "Bolt Ltd" }));
        expect(value().resources.equipment[0].slots[0].providerId).toBe("bolt");
        const symbol = screen.getByRole("button", { name: "Open Supplier “Bolt Ltd”" });
        expect(symbol.querySelector("svg.business-link-symbol-icon")).not.toBeNull();
        expect(document.querySelector(".business-capability-card-link")).toBeNull();
        fireEvent.click(symbol);
        expect(document.querySelector("[data-pair]")).toBeTruthy();
    });

    it("a chosen name shows its own Group; changing the Group clears the name", () => {
        const value = setup({ resources: { equipment: [{ id: "devices-tools", name: "", slots: [{ ...oven(), providerId: "clerk" }] }] } });
        expect(screen.getByLabelText(/Resource 1 supplier group: /).getAttribute("aria-label")).toMatch(/Business Services$/);
        expect(screen.getByLabelText(/Resource 1 supplier: /).getAttribute("aria-label")).toMatch(/Clerk & Co$/);
        fireEvent.click(screen.getByLabelText(/Resource 1 supplier group: /));
        fireEvent.click(screen.getByRole("option", { name: "Technical Support" }));
        expect(value().resources.equipment[0].slots[0].providerId).toBe("");
        expect(screen.getByLabelText(/Resource 1 supplier: /).getAttribute("aria-label")).toMatch(/Select$/);
        expect(screen.queryByRole("button", { name: /^Open Supplier/ })).toBeNull();
    });

    it("'Other…' makes a new card in the Category and Group picked, and chooses it", () => {
        const value = setup();
        // (A Partners group: the card made is a Partner.)
        fireEvent.click(screen.getByLabelText(/Resource 1 supplier group: /));
        fireEvent.click(screen.getByRole("option", { name: "Alliances & Networks" }));
        fireEvent.click(screen.getByLabelText(/Resource 1 partner: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Other…"]);
        fireEvent.click(screen.getByRole("option", { name: "Other…" }));
        const made = value().professionals.find(partner => partner.category === "partners")!;
        expect(made).toMatchObject({ group: "alliances-networks" });
        expect(value().resources.equipment[0].slots[0].providerId).toBe(made.id);
        // The name is typed in the box that appears.
        fireEvent.change(screen.getByRole("textbox", { name: /Name the partner/i }) ?? screen.getByLabelText(/Name the partner/i), { target: { value: "Makers Guild" } });
        expect(value().professionals.find(partner => partner.id === made.id)!.name).toBe("Makers Guild");
    });

});

describe("a partner or supplier card has its Group", () => {

    it("shows its Group, with every group of the place in the list; the group picked decides whether it is a Partner or a Supplier", () => {
        const base = asBusinessCapabilityValue(undefined);
        let latest: Value | undefined;
        render(<Harness initial={{ ...base, providers: [supplier("acme", "Acme Installers", "technical-support")] }} onValue={(next) => { latest = next; }} />);
        openTile("Suppliers");
        openCard("Acme Installers");
        expect(screen.getByLabelText(/Acme Installers group: /).getAttribute("aria-label")).toMatch(/Technical Support$/);
        // No Category row: the tile says whether it is a Supplier.
        expect(screen.queryByLabelText(/Acme Installers category: /)).toBeNull();
        fireEvent.click(screen.getByLabelText(/Acme Installers group: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Alliances & Networks", "Goods & Equipment", "Business Services", "Creative & IT Services", "Property, Vehicles & Facilities", "Technical Support"]);
        fireEvent.click(screen.getByRole("option", { name: "Business Services" }));
        expect(latest!.providers[0]).toMatchObject({ category: "suppliers", group: "business-services" });
        // A Partners group makes it a Partner.
        fireEvent.click(screen.getByLabelText(/Acme Installers group: /));
        fireEvent.click(screen.getByRole("option", { name: "Alliances & Networks" }));
        const moved = [...latest!.professionals, ...latest!.providers].find(partner => partner.id === "acme")!;
        expect(moved).toMatchObject({ category: "partners", group: "alliances-networks" });
    });

});
