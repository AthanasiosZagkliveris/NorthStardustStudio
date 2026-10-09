import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { openCard, openTile } from "../../test/interviewTestUtils";
import { asBusinessCapabilityValue, createBusinessPartner, createBusinessResourceSlot } from "../../framework/engine/AnswerUtils";

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

    it("shows the Category first, the Group once the Category is picked and the Name once the Group is", () => {
        setup();
        expect(screen.getByLabelText(/Resource 1 supplier category: /)).toBeTruthy();
        expect(screen.queryByLabelText(/Resource 1 supplier group: /)).toBeNull();
        expect(screen.queryByLabelText(/Resource 1 supplier: /)).toBeNull();
        fireEvent.click(screen.getByLabelText(/Resource 1 supplier category: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Partners", "Suppliers"]);
        fireEvent.click(screen.getByRole("option", { name: "Suppliers" }));
        fireEvent.click(screen.getByLabelText(/Resource 1 supplier group: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Goods & Equipment", "Business Services", "Creative & IT Services", "Property, Vehicles & Facilities", "Technical Support"]);
        expect(screen.queryByLabelText(/Resource 1 supplier: /)).toBeNull();
        fireEvent.click(screen.getByRole("option", { name: "Technical Support" }));
        fireEvent.click(screen.getByLabelText(/Resource 1 supplier: /));
        // Only the cards of that group.
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Acme Installers", "Bolt Ltd", "Other…"]);
    });

    it("the link symbol appears beside the chosen name and opens that card with this one; there is no 'Open …' line", () => {
        const value = setup();
        fireEvent.click(screen.getByLabelText(/Resource 1 supplier category: /));
        fireEvent.click(screen.getByRole("option", { name: "Suppliers" }));
        fireEvent.click(screen.getByLabelText(/Resource 1 supplier group: /));
        fireEvent.click(screen.getByRole("option", { name: "Technical Support" }));
        expect(screen.queryByRole("button", { name: /^Open Supplier/ })).toBeNull();
        fireEvent.click(screen.getByLabelText(/Resource 1 supplier: /));
        fireEvent.click(screen.getByRole("option", { name: "Bolt Ltd" }));
        expect(value().resources.equipment[0].slots[0].providerId).toBe("bolt");
        const symbol = screen.getByRole("button", { name: "Open Supplier “Bolt Ltd”" });
        expect(symbol.textContent).toBe("🔗");
        expect(document.querySelector(".business-capability-card-link")).toBeNull();
        fireEvent.click(symbol);
        expect(document.querySelector("[data-pair]")).toBeTruthy();
    });

    it("a chosen name shows its own Category and Group; changing the Group clears the name", () => {
        const value = setup({ resources: { equipment: [{ id: "devices-tools", name: "", slots: [{ ...oven(), providerId: "clerk" }] }] } });
        expect(screen.getByLabelText(/Resource 1 supplier category: /).getAttribute("aria-label")).toMatch(/Suppliers$/);
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
        fireEvent.click(screen.getByLabelText(/Resource 1 supplier category: /));
        fireEvent.click(screen.getByRole("option", { name: "Partners" }));
        // (Infrastructure has the one group of Partners: a list of one is text, and the Name follows at once.)
        expect(screen.queryByLabelText(/Resource 1 supplier group: /)).toBeNull();
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

    it("shows the Group of its Category, and files a card in the one group when the Category has just one", () => {
        const base = asBusinessCapabilityValue(undefined);
        let latest: Value | undefined;
        render(<Harness initial={{ ...base, providers: [supplier("acme", "Acme Installers", "technical-support")] }} onValue={(next) => { latest = next; }} />);
        openTile("Suppliers");
        openCard("Acme Installers");
        expect(screen.getByLabelText(/Acme Installers group: /).getAttribute("aria-label")).toMatch(/Technical Support$/);
        // No Category row: the tile says whether it is a Supplier.
        expect(screen.queryByLabelText(/Acme Installers category: /)).toBeNull();
        fireEvent.click(screen.getByLabelText(/Acme Installers group: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Goods & Equipment", "Business Services", "Creative & IT Services", "Property, Vehicles & Facilities", "Technical Support"]);
        fireEvent.click(screen.getByRole("option", { name: "Business Services" }));
        expect(latest!.providers[0]).toMatchObject({ category: "suppliers", group: "business-services" });
    });

});
