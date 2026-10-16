import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { cardBoxes, closeTile, floatingCardHost, infrastructureCard, offeringCard, openBox, openCard, openTile, tileButton } from "../../test/interviewTestUtils";
import { asBusinessCapabilityValue, createBusinessActivity, createBusinessPartner, createBusinessResourceSlot } from "../../framework/engine/AnswerUtils";
import { stylesheet } from "../../test/stylesheet";
import { scaleOrigin } from "./SectionTiles";

afterEach(cleanup);

const founder = (id: string, name: string) => ({ id, name, ownership: "50", capital: "", roles: [""], experience: "" });

function Harness({ initial }: { initial?: unknown }) {
    const [value, setValue] = useState<unknown>(initial ?? asBusinessCapabilityValue(undefined));
    return (
        <BusinessCapabilityEditor
            value={value}
            onChange={setValue}
            legalEntityFounders={[founder("f1", "Ann"), founder("f2", "Bo")]}
        />
    );
}

/** One Operational activity ("First"): every category has its own tile, so the page tile's list names the categories, never the cards. */
const seeded = () => ({
    ...asBusinessCapabilityValue(undefined),
    activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity(), name: "First" }] }]
});

/** Two Operational activities: the category is a tile of the Activities view, and the page tile lists the category. */
const seededTwo = () => ({
    ...asBusinessCapabilityValue(undefined),
    activities: [{
        id: "operational",
        name: "",
        activities: [{ ...createBusinessActivity(), name: "First" }, { ...createBusinessActivity(), name: "Second" }]
    }]
});

/** The slot of a page tile of Infrastructure: its button, its list, its + box (the page tile of a CATEGORY is its section's tile). */
const slotOf = (name: string) => tileButton(name, infrastructureCard()).parentElement as HTMLElement;

/** An Offering resource slot filed in Equipment > Production Machinery (the Capability > Resources view is grouped like Infrastructure's). */
const filed = <T extends object>(slot: T) => ({ ...slot, category: "equipment", group: "production-machinery" });

/** Opens an Offering resource card through its category tile and group box. */
function openOfferingResource(name: string) {
    openTile("Resources", undefined, undefined, offeringCard());
    openBox("Equipment");
    openBox("Production Machinery");
    openCard(name);
}

/** The slot of a page tile of Offering's Capability. */
const offeringSlotOf = (name: string) => tileButton(name, offeringCard()).parentElement as HTMLElement;

/** Presses an item of a page tile's list (a category's name), then the card tile (and the group's, when it has one) in the view it opens. */
function openItem(tile: string, item: string, ...inside: string[]) {
    fireEvent.click(within(slotOf(tile)).getByRole("button", { name: item }));
    for (const name of inside) {
        if (name === inside[inside.length - 1]) {
            openCard(name);
        } else {
            openBox(name);
        }
    }
}

/** Closes the floating card alone: a press outside it (it has no Back button). */
const cardBack = () => { expect(floatingCardHost()!.querySelector(".floating-card-back")).toBeNull(); fireEvent.mouseDown(document.body); };

/** The card tiles of the open view, without the blank card an empty category opens floating over its view. */
const realCards = () => cardBoxes().filter(name => !/: Unnamed /.test(name ?? ""));

/** The items of a page tile's list. */
const listOf = (name: string) => [...slotOf(name).querySelectorAll(".section-tile-list > li")].map(item => item.textContent);

describe("the lists on the page tiles are real controls", () => {

    it("makes each item a button of its own, the tile's own button still opening the section", () => {
        render(<Harness initial={seededTwo()} />);
        const list = within(slotOf("Activities"));
        // (Every category is one item: the category's name.)
        expect(list.getByRole("button", { name: "Operational" })).toBeTruthy();
        // (The tile's accessible name still says the title and the list.)
        expect(tileButton("Activities", infrastructureCard()).getAttribute("aria-label")).toMatch(/^Activities, Pre-Operational, Operational/);
        fireEvent.click(tileButton("Activities", infrastructureCard()));
        expect(screen.getByRole("dialog").classList.contains("section-tile-dialog")).toBe(true);
    });

    it("opens THAT card alone, floating, when an item is pressed: Back closes it", () => {
        render(<Harness initial={seeded()} />);
        openItem("Activities", "Operational", "First");
        const card = floatingCardHost()!;
        expect(card.getAttribute("aria-label")).toBe("Activities");
        expect((within(card).getByRole("textbox", { name: "Activity 1 name" }) as HTMLTextAreaElement).value).toBe("First");
        // The category's view stays under the card; Back closes the card alone and returns to that view.
        expect(document.querySelector(".section-tile-dialog")).not.toBeNull();
        cardBack();
        expect(floatingCardHost()).toBeNull();
        expect(document.querySelector(".section-tile-dialog")).not.toBeNull();
        expect(cardBoxes()).toEqual(["Activity 1: First"]);
        // The dialog's own Back goes one level up (the category's view to the section's), then up again to the page.
        fireEvent.click(document.querySelector(".section-tile-back")!);
        expect(document.querySelector(".section-tile-dialog .dialog-heading-sub")).toBeNull();
        fireEvent.click(document.querySelector(".section-tile-back")!);
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("opens a category's view in the Activities dialog when its name is pressed and it holds several cards", () => {
        render(<Harness initial={seededTwo()} />);
        fireEvent.click(within(slotOf("Activities")).getByRole("button", { name: "Operational" }));
        const dialog = screen.getByRole("dialog");
        expect(dialog.classList.contains("section-tile-dialog")).toBe(true);
        expect(dialog.querySelector(".dialog-heading-sub")!.textContent).toBe("Operational");
        expect(cardBoxes()).toEqual(["Activity 1: First", "Activity 2: Second"]);
    });

    it("lets the floating card go when its x removes the card", () => {
        render(<Harness initial={seeded()} />);
        openItem("Activities", "Operational", "First");
        fireEvent.click(within(floatingCardHost()!).getByRole("button", { name: /^Remove Activity 1/ }));
        expect(floatingCardHost()).toBeNull();
        // (The view it came from is back, without the card.)
        expect(cardBoxes()).toEqual([]);
        fireEvent.keyDown(document, { key: "Escape" });
        openTile("Operational");
        expect(realCards()).toEqual([]);
    });

    it("has no Back button; the tiles area stays usable: a press on another tile replaces the card, a press on empty space closes only the card", () => {
        render(<Harness initial={seededTwo()} />);
        fireEvent.click(tileButton("Activities", infrastructureCard()));
        fireEvent.click(tileButton("Operational", document.querySelector<HTMLElement>(".section-tile-dialog")!));
        openCard("First");
        expect(floatingCardHost()).not.toBeNull();
        expect(document.querySelector(".floating-card-back")).toBeNull();
        expect(screen.queryAllByRole("button", { name: /^Back$/ }).some(button => button.closest(".floating-card-host") !== null)).toBe(false);
        // A press on another tile goes on to open it in the card's place.
        const second = [...document.querySelectorAll<HTMLElement>(".section-tile-dialog .card-tile")].find(tile => (tile.getAttribute("aria-label") ?? "").includes("Second"))!;
        fireEvent.mouseDown(second);
        fireEvent.click(second);
        expect(screen.getAllByRole("dialog")).toHaveLength(2);
        expect(floatingCardHost()!.textContent).toContain("Second");
        expect(floatingCardHost()!.querySelectorAll(".floating-card-item")).toHaveLength(1);
        // A press on empty space closes the card alone; the dialog stays.
        fireEvent.mouseDown(document.body);
        expect(floatingCardHost()).toBeNull();
        expect(document.querySelector(".section-tile-dialog")).not.toBeNull();
        // The dialog's backdrop does nothing while a card floats over it.
        openCard("First");
        fireEvent.mouseDown(document.querySelector(".section-tile-backdrop, .section-tile-dialog")!.parentElement as HTMLElement);
        fireEvent.mouseDown(document.body);
        expect(floatingCardHost()).toBeNull();
        expect(document.querySelector(".section-tile-dialog")).not.toBeNull();
    });

    it("closes a floating card with Escape (with the view under it) and with a click on the dimmed space (the card alone)", () => {
        render(<Harness initial={seeded()} />);
        openItem("Activities", "Operational", "First");
        expect(screen.getAllByRole("dialog")).toHaveLength(2);
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
        openItem("Activities", "Operational", "First");
        // A press inside the overlay or the card does nothing; one outside closes the card.
        fireEvent.mouseDown(document.querySelector(".floating-overlay") as HTMLElement);
        expect(floatingCardHost()).not.toBeNull();
        fireEvent.mouseDown(document.body);
        // The press outside closes the card alone: the view the card was opened from stays.
        expect(floatingCardHost()).toBeNull();
        expect(document.querySelector(".section-tile-dialog")).not.toBeNull();
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("returns Back from a card to the view it came from, Escape from a card closes the card and the dialog under it, and the dialog's Back goes one level up", () => {
        render(<Harness initial={seededTwo()} />);
        // Activities > Operational (a view of two cards) > the card "First".
        fireEvent.click(tileButton("Activities", infrastructureCard()));
        fireEvent.click(tileButton("Operational", document.querySelector<HTMLElement>(".section-tile-dialog")!));
        const subs = () => [...document.querySelectorAll(".section-tile-dialog .dialog-heading-sub")].map(node => node.textContent);
        expect(subs()).toEqual(["Operational"]);
        openCard("First");
        expect(screen.getAllByRole("dialog")).toHaveLength(2);
        // Back: the card alone goes; the category view is as it was.
        cardBack();
        expect(floatingCardHost()).toBeNull();
        expect(subs()).toEqual(["Operational"]);
        expect(cardBoxes()).toEqual(["Activity 1: First", "Activity 2: Second"]);
        // The dialog's Back: one level up (the category to the Activities view), then another (the page).
        fireEvent.click(document.querySelector(".section-tile-back")!);
        expect(subs()).toEqual([]);
        expect(document.querySelector(".section-tile-dialog")).not.toBeNull();
        fireEvent.click(document.querySelector(".section-tile-back")!);
        expect(screen.queryByRole("dialog")).toBeNull();
        // Escape from a card with the dialog under it closes both, straight to the page.
        fireEvent.click(tileButton("Activities", infrastructureCard()));
        fireEvent.click(tileButton("Operational", document.querySelector<HTMLElement>(".section-tile-dialog")!));
        openCard("Second");
        expect(screen.getAllByRole("dialog")).toHaveLength(2);
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("opens a founder's card alone, in the look and width of any card", () => {
        render(<Harness />);
        fireEvent.click(within(slotOf("Founders")).getByRole("button", { name: "Bo" }));
        const card = screen.getByRole("dialog", { name: "Founders" });
        expect(card.classList.contains("floating-card-founder")).toBe(false);
        expect(card.querySelector(".business-founder-open")).toBeTruthy();
        expect(card.querySelector(".strategy-name-static")!.textContent).toBe("Bo");
        expect(card.querySelectorAll(".business-founder-open")).toHaveLength(1);
    });

    it("opens the ONE card of a resource group alone, floating, when its name is pressed", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{ ...base, resources: { utilities: [{ id: "premises-utilities", name: "", slots: [{ ...createBusinessResourceSlot(), name: "Fibre" }] }] } }} />);
        openItem("Resources", "Utilities", "Premises Utilities", "Fibre");
        const card = floatingCardHost()!;
        expect(card.getAttribute("aria-label")).toBe("Resources");
        expect((within(card).getByRole("textbox", { name: "Resource 1 name" }) as HTMLTextAreaElement).value).toBe("Fibre");
        cardBack();
        expect(floatingCardHost()).toBeNull();
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("opens a category's view in the section dialog when its name is pressed, and a group's view inside it when the group holds several cards", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{ ...base, resources: { digital: [{ id: "software-web", name: "", slots: [{ ...createBusinessResourceSlot(), name: "Website" }, { ...createBusinessResourceSlot(), name: "Backup" }] }] } }} />);
        fireEvent.click(within(slotOf("Resources")).getByRole("button", { name: "Digital Infrastructure" }));
        const dialog = screen.getByRole("dialog");
        expect(dialog.classList.contains("section-tile-dialog")).toBe(true);
        expect(dialog.querySelector(".dialog-heading-sub")!.textContent).toBe("Digital Infrastructure");
        fireEvent.click(tileButton("Software & Web", dialog));
        const subs = screen.getByRole("dialog").querySelectorAll(".dialog-heading-sub");
        expect(subs[subs.length - 1].textContent).toBe("Software & Web");
        expect(cardBoxes()).toEqual(["Resource 1: Website", "Resource 2: Backup"]);
        // Back returns to the groups (the group was not the dialog's first view).
        closeTile();
        expect(tileButton("Software & Web", screen.getByRole("dialog"))).toBeTruthy();
    });

    it("leaves Delivery's list as plain text, as it was", () => {
        render(<Harness />);
        expect(offeringSlotOf("Delivery").querySelector(".section-tile-link")).toBeNull();
        expect(offeringSlotOf("Delivery").querySelector(".section-tile-plus")).toBeNull();
    });

});

describe("a Workspace card opens alone, like any resource card", () => {

    const withWorkspace = () => ({
        ...asBusinessCapabilityValue(undefined),
        resources: { workspace: [{ id: "premises", name: "", slots: [{ ...createBusinessResourceSlot(), id: "workspace", name: "Dedicated Workspace", workspaceKind: "dedicated", status: "exists" }] }] }
    });

    it("floats the one card (the view it came from stays under it) when the Workspace category tile and its card tile are pressed; it is a plain resource card, not a form of its own", () => {
        render(<Harness initial={withWorkspace()} />);
        openTile("Workspace", undefined, "Resource 1");
        const card = floatingCardHost()!;
        expect(card.getAttribute("aria-label")).toBe("Resources");
        expect(card.classList.contains("floating-card-workspace")).toBe(false);
        expect(card.querySelector(".workspace-card, .workspace-form")).toBeNull();
        // The card is the common one: its Category cell, and the statuses of a space (the kind list of the old form is gone).
        expect(within(card).getByLabelText(/Resource Dedicated Workspace category: /).getAttribute("aria-label")).toMatch(/Workspace$/);
        expect(within(card).getByLabelText(/Resource 1 status: /)).toBeTruthy();
        expect(within(card).queryByRole("button", { name: /^Workspace: / })).toBeNull();
        expect(document.querySelector(".section-tile-dialog")).not.toBeNull();
        // A press outside closes the card alone; Escape closes the view under it as well.
        cardBack();
        expect(floatingCardHost()).toBeNull();
        expect(screen.getAllByRole("dialog")).toHaveLength(1);
        openTile("Workspace", undefined, "Resource 1");
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("opens the same card from the Workspace item of the tile's list", () => {
        render(<Harness initial={withWorkspace()} />);
        openItem("Resources", "Workspace", "Resource 1");
        expect(floatingCardHost()).not.toBeNull();
        expect(within(floatingCardHost()!).getByLabelText(/Resource 1 status: /)).toBeTruthy();
    });

});

describe("the + box of a tile that takes new cards", () => {

    const withPlus = [
        ["Resources", "Add Resource to Resources"],
        ["Activities", "Add Activity to Activities"],
        ["Partners & Suppliers", "Add Partner to Partners & Suppliers"]
    ] as const;

    it("is on the Resources, Activities and Partners & Suppliers tiles of Infrastructure and of Offering's Capability, and only there", () => {
        render(<Harness />);
        for (const [tile, label] of withPlus) {
            expect(within(slotOf(tile)).getByRole("button", { name: label })).toBeTruthy();
            expect(within(offeringSlotOf(tile)).getByRole("button", { name: label })).toBeTruthy();
        }
        expect(document.querySelectorAll(".section-tile-plus")).toHaveLength(withPlus.length * 2);
        expect(slotOf("Founders").querySelector(".section-tile-plus")).toBeNull();
        expect(offeringSlotOf("Delivery").querySelector(".section-tile-plus")).toBeNull();
    });

    it("adds a card of no category yet (Select) and opens it floating, its name focused; it waits in the No category tile till a Category is chosen", () => {
        render(<Harness initial={seeded()} />);
        fireEvent.click(within(infrastructureCard()).getByRole("button", { name: "Add Activity to Activities" }));
        const card = screen.getByRole("dialog", { name: "Activities" });
        const name = within(card).getByRole("textbox", { name: "Activity 1 name" });
        expect(document.activeElement).toBe(name);
        // (The Category cell starts at its default, "Select".)
        expect(card.querySelector(".option-picker-value")?.textContent).toBe("Select");
        fireEvent.change(name, { target: { value: "Third" } });
        cardBack();
        // (The page tile lists every category and the new card's; the lines with an incomplete card come first.)
        expect(listOf("Activities")).toEqual(["Operational", "No category", "Pre-Operational"]);
        fireEvent.click(within(infrastructureCard()).getByRole("button", { name: /^Activities,/ }));
        fireEvent.click([...document.querySelectorAll<HTMLElement>("button.section-tile")].find(button => (button.getAttribute("aria-label") ?? "").startsWith("No category"))!);
        expect(cardBoxes()).toEqual(["Activity 1: Third"]);
    });

    it("removes the card again when it is left completely blank, and keeps the + of an empty tile", () => {
        render(<Harness />);
        // (A tile that has the box does not draw the small "+" glyph as well: the box is its "+". Its categories are listed even when empty.)
        expect(tileButton("Activities", infrastructureCard()).querySelector(".section-tile-empty")).toBeNull();
        expect(listOf("Activities")).toEqual(["Pre-Operational", "Operational"]);
        fireEvent.click(within(infrastructureCard()).getByRole("button", { name: "Add Activity to Activities" }));
        expect(screen.getByRole("textbox", { name: "Activity 1 name" })).toBeTruthy();
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
        openTile("Operational");
        expect(realCards()).toEqual([]);
    });

    it("gives each group tile of a resource category a + that makes a blank resource in THAT group and opens it floating, under the Resources name", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{ ...base, resources: { vehicles: [{ id: "company-vehicles", name: "", slots: [{ ...createBusinessResourceSlot(), name: "Fibre" }, { ...createBusinessResourceSlot(), name: "Backup" }] }, { id: "vehicle-running-costs", name: "", slots: [{ ...createBusinessResourceSlot(), name: "Fuel" }, { ...createBusinessResourceSlot(), name: "Tyres" }] }] } }} />);
        // (A category of one group shows that group's cards directly, with no group tile: Vehicles has two.)
        openTile("Vehicles");
        const dialog = screen.getByRole("dialog");
        // One "+" per group tile, in the tile's own slot.
        const pluses = [...dialog.querySelectorAll<HTMLElement>(".section-tile-plus")];
        expect(pluses.map(plus => plus.getAttribute("aria-label"))).toEqual([
            "Add Vehicles to Company Vehicles",
            "Add Vehicles to Vehicle Running Costs"
        ]);
        for (const plus of pluses) {
            expect(plus.classList.contains("plus-box")).toBe(true);
        }
        fireEvent.click(within(dialog).getByRole("button", { name: "Add Vehicles to Company Vehicles" }));
        // The card floats over the dialog, which stays under it; its name cell is focused.
        const card = floatingCardHost()!;
        expect(card.getAttribute("aria-label")).toBe("Resources");
        expect(document.querySelector(".section-tile-dialog")).not.toBeNull();
        const name = within(card).getByRole("textbox", { name: /^Resource [0-9]+ name$/ });
        expect(document.activeElement).toBe(name);
        // Written in, the card stays: in the Company Vehicles group.
        fireEvent.change(name, { target: { value: "Gas lamp" } });
        expect(within(card).getByLabelText(/Resource Gas lamp group: /).getAttribute("aria-label")).toMatch(/Company Vehicles$/);
        cardBack();
        expect(floatingCardHost()).toBeNull();
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("takes the blank resource of a group's + away again when it is left blank, and leaves the group", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{ ...base, resources: { vehicles: [{ id: "company-vehicles", name: "", slots: [{ ...createBusinessResourceSlot(), name: "Fibre" }, { ...createBusinessResourceSlot(), name: "Backup" }] }, { id: "vehicle-running-costs", name: "", slots: [{ ...createBusinessResourceSlot(), name: "Fuel" }, { ...createBusinessResourceSlot(), name: "Tyres" }] }] } }} />);
        openTile("Vehicles");
        fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add Vehicles to Company Vehicles" }));
        const card = screen.getByRole("dialog", { name: "Resources" });
        expect(card.classList.contains("floating-card-host")).toBe(true);
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
        // (Vehicles first: its Fibre has no Status yet, which lights its line.)
        expect(listOf("Resources")).toEqual(["Vehicles", "Workspace", "Utilities", "Workstation", "Equipment", "Digital Infrastructure", "Materials & Inventory", "Documents & Rights", "Human Resources"]);
        openTile("Vehicles");
        expect(tileButton("Company Vehicles", screen.getByRole("dialog")).getAttribute("aria-label")).toBe("Company Vehicles, Fibre, Backup");
    });

    it("adds a partner, a provider and a resource the same way", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{
            ...base,
            offering: { ...base.offering, resources: [{ ...createBusinessResourceSlot(), name: "Loom" }], professionals: [createBusinessPartner("Agency")] }
        }} />);
        fireEvent.click(within(offeringCard()).getByRole("button", { name: "Add Resource to Resources" }));
        expect(screen.getByRole("textbox", { name: "Resource 2 name" })).toBeTruthy();
        fireEvent.keyDown(document, { key: "Escape" });
        fireEvent.click(within(offeringCard()).getByRole("button", { name: "Add Partner to Partners & Suppliers" }));
        expect(screen.getByRole("textbox", { name: /^(Professional|Partner) [0-9]+ name$/ })).toBeTruthy();
    });

});

describe("a resource's links to the cards it is connected with", () => {

    it("shows, under the Status, one line per connected card (the activity it made, the partner or provider it uses); a click opens that card above/below this one", () => {
        const base = asBusinessCapabilityValue(undefined);
        const provider = createBusinessPartner("Hackney Wick Maker Yard", "suppliers");
        const slot = filed({ ...createBusinessResourceSlot(), name: "Loom", status: "partners-suppliers", providerId: provider.id });
        render(<Harness initial={{ ...base, offering: { ...base.offering, resources: [slot], providers: [provider] } }} />);
        openOfferingResource("Loom");
        // The link is the symbol beside the chosen name (no "Open ..." line); a click opens that card.
        const symbol = screen.getByRole("button", { name: "Open Supplier “Hackney Wick Maker Yard”" });
        expect(symbol.textContent).toBe("🔗");
        expect(symbol.getAttribute("title")).toBe("Open Supplier “Hackney Wick Maker Yard”");
        expect([...document.querySelectorAll<HTMLElement>(".business-capability-card-link")].some(node => /^S[.]/.test(node.textContent ?? ""))).toBe(false);
        fireEvent.click(symbol);
        // The resource above, the provider's card below it.
        expect(document.querySelector("[data-pair]")).toBeTruthy();
        const pair = document.querySelector<HTMLElement>("[data-pair]")!;
        expect(within(pair).getByRole("textbox", { name: "Resource 1 name" })).toBeTruthy();
        expect((within(pair).getByRole("textbox", { name: "Provider 1 name" }) as HTMLTextAreaElement).value).toBe("Hackney Wick Maker Yard");
    });

    it("shows, on a provider's card, one line per resource that uses it; a click opens that resource with the card", () => {
        const base = asBusinessCapabilityValue(undefined);
        const provider = createBusinessPartner("Hackney Wick Maker Yard", "suppliers");
        const slot = filed({ ...createBusinessResourceSlot(), name: "Loom", status: "partners-suppliers", providerId: provider.id });
        render(<Harness initial={{ ...base, offering: { ...base.offering, resources: [slot], providers: [provider] } }} />);
        openTile("Partners & Suppliers", "Suppliers", "Hackney");
        const line = [...document.querySelectorAll<HTMLElement>(".business-capability-card-link")].find(node => /^R[.]/.test(node.textContent ?? ""))!;
        expect(line.textContent).toBe("R.Loom");
        fireEvent.click(within(line).getByRole("button", { name: "Open Resource “Loom”" }));
        expect(document.querySelector("[data-pair]")).toBeTruthy();
        expect((screen.getByRole("textbox", { name: "Resource 1 name" }) as HTMLTextAreaElement).value).toBe("Loom");
    });

    it("gives a Partners & Suppliers card no Category row (its tile says Partner or Supplier): its Group comes first", () => {
        const base = asBusinessCapabilityValue(undefined);
        const partner = createBusinessPartner("Accountant", "suppliers");
        render(<Harness initial={{ ...base, providers: [{ ...partner, id: "acct", name: "Accountant", group: "business-services" }] }} />);
        openTile("Suppliers");
        openCard("Accountant");
        expect(screen.queryByLabelText(/category: /i)).toBeNull();
        expect(screen.getByLabelText(/Accountant group: /).getAttribute("aria-label")).toMatch(/Business Services$/);
    });

    it("gives an Activity card a Group under its name; changing it files the activity in that group (Infrastructure) or sets it (Offering), no Other… under its name; changing it files the activity in that category (Infrastructure) or sets it (Offering), no Other…", () => {
        const base = asBusinessCapabilityValue(undefined);
        const first = { ...createBusinessActivity(), name: "Set up bookkeeping" };
        const own = { ...createBusinessActivity(), name: "Sample panels" };
        render(<Harness initial={{ ...base, activities: [{ id: "operational", name: "", activities: [first] }], offering: { ...base.offering, activities: [own] } }} />);
        openTile("Operational", undefined, "Set up bookkeeping");
        const trigger = () => screen.getByLabelText(/Activity 1 group: /);
        expect(trigger().getAttribute("aria-label")).toMatch(/Operational$/);
        expect(trigger().closest(".business-foundation-field")!.classList.contains("business-field-side")).toBe(true);
        fireEvent.click(trigger());
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Pre-Operational", "Operational"]);
        fireEvent.click(screen.getByRole("option", { name: "Pre-Operational" }));
        expect(trigger().getAttribute("aria-label")).toMatch(/Pre-Operational$/);
        // The list is fixed: no Other… to make a new category.
        fireEvent.click(trigger());
        expect(screen.queryByRole("option", { name: "Other…" })).toBeNull();
    });

    it("a resource that is Partners & Suppliers picks a Group (of any of the two types) and then a Name from that group; changing the Group above clears the name", () => {
        const base = asBusinessCapabilityValue(undefined);
        const partner = createBusinessPartner("Accountant", "partners");
        const provider = createBusinessPartner("DPD Local", "suppliers");
        const slot = filed({ ...createBusinessResourceSlot(), name: "Courier", status: "partners-suppliers", providerId: provider.id });
        render(<Harness initial={{ ...base, offering: { ...base.offering, resources: [slot], professionals: [partner], providers: [provider] } }} />);
        openOfferingResource("Courier");
        // The chosen supplier's own Group leads to it (it has no group yet); its Name lists the cards of that group only.
        expect(screen.getByLabelText(/Resource 1 supplier group: /).getAttribute("aria-label")).toMatch(/No group$/);
        fireEvent.click(screen.getByLabelText(/Resource 1 supplier: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["DPD Local", "Other…"]);
        fireEvent.keyDown(document, { key: "Escape" });
        // Another Group (a Partners one): the name is no longer one of the list, so it is cleared; the Name then lists that group's cards.
        fireEvent.click(screen.getByLabelText(/Resource 1 supplier group: /));
        fireEvent.click(screen.getByRole("option", { name: "Revenue Partners" }));
        expect(screen.getByLabelText(/Resource 1 supplier group: /).getAttribute("aria-label")).toMatch(/Revenue Partners$/);
        expect(screen.getByLabelText(/Resource 1 partner: /).getAttribute("aria-label")).toMatch(/Select$/);
        expect(screen.queryByRole("button", { name: /^Open (Supplier|Partner) / })).toBeNull();
    });

    it("a resource at the status Activity shows, below its Status, the activity it chose with its category, and the link symbol that opens it", () => {
        const base = asBusinessCapabilityValue(undefined);
        const activity = { ...createBusinessActivity(), name: "Test the vault", category: "production" };
        const slot = filed({ ...createBusinessResourceSlot(), name: "Vault", status: "activity", activityId: activity.id });
        render(<Harness initial={{ ...base, offering: { ...base.offering, resources: [slot], activities: [activity] } }} />);
        openOfferingResource("Vault");
        expect(screen.getByLabelText(/Resource 1 activity: /).getAttribute("aria-label")).toMatch(/Test the vault$/);
        expect(screen.getByRole("button", { name: "Open Activity “Test the vault”" })).toBeTruthy();
    });

    it("gives an Infrastructure resource a Category and a Group; moving it files the card there and it stays open", () => {
        const base = asBusinessCapabilityValue(undefined);
        const slot = { ...createBusinessResourceSlot(), name: "Power", status: "exists" };
        render(<Harness initial={{ ...base, resources: { vehicles: [{ id: "company-vehicles", name: "", slots: [slot] }] } }} />);
        // (Vehicles is not among the categories the test helpers know: the section tile first, then the category's and the group's.)
        openTile("Resources", "Vehicles", undefined, infrastructureCard());
        openBox("Company Vehicles");
        openCard("Power");
        const group = () => screen.getByLabelText(/Resource Power group: /);
        expect(screen.getByLabelText(/Resource Power category: /).getAttribute("aria-label")).toMatch(/Vehicles$/);
        expect(group().getAttribute("aria-label")).toMatch(/Company Vehicles$/);
        fireEvent.click(group());
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Company Vehicles", "Vehicle Running Costs"]);
        fireEvent.click(screen.getByRole("option", { name: "Vehicle Running Costs" }));
        expect(group().getAttribute("aria-label")).toMatch(/Vehicle Running Costs$/);
        fireEvent.click(screen.getByLabelText(/Resource Power category: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Workspace", "Utilities", "Workstation", "Equipment", "Vehicles", "Digital Infrastructure", "Materials & Inventory", "Documents & Rights", "Human Resources"]);
        fireEvent.click(screen.getByRole("option", { name: "Equipment" }));
        expect(screen.getByLabelText(/Resource Power category: /).getAttribute("aria-label")).toMatch(/Equipment$/);
        // (Equipment has the one group: a dropdown with one option is text, and the card is filed in it.)
        expect((screen.getByLabelText(/Resource Power group: /) as HTMLButtonElement).disabled).toBe(true);
        expect(group().getAttribute("aria-label")).toMatch(/Devices & Tools$/);
    });

    it("flags an incomplete card: its tile glows (with what it lacks in its tooltip), its line in the page tile is red and first", () => {
        const base = asBusinessCapabilityValue(undefined);
        const done = { ...createBusinessResourceSlot(), name: "Complete one", status: "exists", startDate: "2027-01-01" };
        const lacking = { ...createBusinessResourceSlot(), name: "Lacking one", status: "costs", startDate: "2027-01-01" };
        render(<Harness initial={{ ...base, resources: { utilities: [{ id: "premises-utilities", name: "", slots: [done] }], workstation: [{ id: "furniture-fittings", name: "", slots: [{ ...lacking, status: "" }, { ...done, name: "Complete too" }] }] } }} />);
        const slot = slotOf("Resources");
        const items = [...slot.querySelectorAll<HTMLElement>(".section-tile-list > li")];
        expect(items.map(item => item.textContent)).toEqual(["Workstation", "Workspace", "Utilities", "Equipment", "Vehicles", "Digital Infrastructure", "Materials & Inventory", "Documents & Rights", "Human Resources"]);
        expect(items[0].classList.contains("section-tile-list-alert")).toBe(true);
        expect(items[0].getAttribute("title")).toContain("Missing: Status (not counted until it is fixed)");
        expect(items[0].getAttribute("title")).toContain("Workstation");
        expect(items[1].classList.contains("section-tile-list-alert")).toBe(false);
        expect(slot.classList.contains("card-tile-incomplete")).toBe(true);
        // (The card tiles are in the group's view inside the category's: a group of two cards or more is a tile there.)
        openTile("Workstation", "Furniture & Fittings");
        const tileOf = (name: string) => [...document.querySelectorAll<HTMLElement>(".card-tile-slot")].find(tile => tile.querySelector(".card-tile")?.getAttribute("aria-label")?.includes(name))!;
        expect(tileOf("Complete too").classList.contains("card-tile-incomplete")).toBe(false);
        expect(tileOf("Lacking one").classList.contains("card-tile-incomplete")).toBe(true);
        expect(tileOf("Lacking one").querySelector(".card-tile")!.getAttribute("title")).toMatch(/Lacking one. Missing: Status/);
        // Motion off: steady red.
        expect(stylesheet("card-tile.css")).toContain("@media (prefers-reduced-motion: reduce)");
        expect(stylesheet("card-tile.css").split("@media (prefers-reduced-motion: reduce)")[1]).toMatch(/\.card-tile-incomplete > \.section-tile \{[^}]*animation: none;/);
    });

    it("passes an incomplete card up: its group tile, its category tile, its section tile and the Inventory tile glow and open with a red first line", () => {
        const base = asBusinessCapabilityValue(undefined);
        const lacking = { ...createBusinessResourceSlot(), name: "Lacking one", status: "" };
        const other = { ...createBusinessResourceSlot(), name: "Other", status: "exists", startDate: "2027-01-01" };
        render(<Harness initial={{ ...base, resources: { vehicles: [{ id: "company-vehicles", name: "", slots: [lacking, other] }, { id: "vehicle-running-costs", name: "", slots: [{ ...other, name: "Desk" }, { ...other, name: "Chair" }] }] } }} />);
        const glows = (el: Element | null | undefined) => el?.closest(".section-tile-slot")?.classList.contains("card-tile-incomplete") ?? false;
        // The section tile glows, its Vehicles line is the red first one.
        expect(slotOf("Resources").classList.contains("card-tile-incomplete")).toBe(true);
        expect(slotOf("Resources").querySelector(".section-tile-list > li")!.classList.contains("section-tile-list-alert")).toBe(true);
        // The Inventory tile glows too.
        const allTiles = tileButton(/^Inventory/);
        expect(glows(allTiles)).toBe(true);
        // The category tile (in the section's view) glows, the one without a lacking card does not.
        fireEvent.click(tileButton("Resources", infrastructureCard()));
        const dialog = document.querySelector<HTMLElement>(".section-tile-dialog")!;
        const category = tileButton("Vehicles", dialog);
        expect(glows(category)).toBe(true);
        expect(glows(tileButton("Utilities", dialog))).toBe(false);
        // The group tile (in the category's view) glows, the complete group does not.
        fireEvent.click(category);
        const view = document.querySelector<HTMLElement>(".section-tile-dialog")!;
        expect(glows(tileButton("Company Vehicles", view))).toBe(true);
        expect(glows(tileButton("Vehicle Running Costs", view))).toBe(false);
    });

    it("offers, beside the providers, only the workspace type chosen on a Workspace card (none when none is chosen)", () => {
        const base = asBusinessCapabilityValue(undefined);
        const provider = createBusinessPartner("Hackney Wick Maker Yard", "suppliers");
        const slot = filed({ ...createBusinessResourceSlot(), name: "Loom", status: "partners-suppliers", providerId: provider.id });
        const options = (kind: string) => {
            cleanup();
            const space = { ...createBusinessResourceSlot(), id: "workspace", name: "Space", workspaceKind: kind };
            render(<Harness initial={{ ...base, resources: { workspace: [{ id: "workspace", name: "", slots: [space] }] }, offering: { ...base.offering, resources: [slot], providers: [provider] } }} />);
            openOfferingResource("Loom");
            fireEvent.click(screen.getByLabelText(/Resource 1 supplier: /));
            return screen.getAllByRole("option").map(option => option.textContent);
        };
        expect(options("dedicated")).toEqual(["Hackney Wick Maker Yard", "Dedicated Workspace", "Other…"]);
        expect(options("")).toEqual(["Hackney Wick Maker Yard", "Other…"]);
        expect(options("other")).toEqual(["Hackney Wick Maker Yard", "Other…"]);
    });

});

describe("the Founders tile", () => {

    it("lists the founders' names alone, with no rate of their responsibilities", () => {
        render(<Harness />);
        expect(tileButton("Founders").getAttribute("aria-label")).toBe("Founders, Ann, Bo");
        expect(listOf("Founders")).toEqual(["Ann", "Bo"]);
    });

});

describe("activities are ordered by dragging a box", () => {

    it("moves a box onto another in the Activities dialog, and renumbers", () => {
        render(<Harness initial={seededTwo()} />);
        openTile("Operational");
        const boxes = () => [...screen.getByRole("dialog").querySelectorAll<HTMLElement>(".card-tile-slot")];
        expect(boxes()[0].getAttribute("draggable")).toBe("true");
        const dataTransfer = { setData: vi.fn(), effectAllowed: "", dropEffect: "" };
        fireEvent.dragStart(boxes()[0], { dataTransfer });
        fireEvent.dragOver(boxes()[1], { dataTransfer });
        fireEvent.drop(boxes()[1], { dataTransfer });
        expect(cardBoxes()).toEqual(["Activity 1: Second", "Activity 2: First"]);
    });

    it("does not make other lists draggable", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{ ...base, offering: { ...base.offering, resources: [filed({ ...createBusinessResourceSlot(), name: "Loom" }), filed({ ...createBusinessResourceSlot(), name: "Press" })] } }} />);
        openTile("Resources", undefined, undefined, offeringCard());
        // (Offering's Resources: the category and its group of two cards are tiles of the views; the cards inside.)
        openBox("Equipment");
        openBox("Production Machinery");
        expect(cardBoxes()).toEqual(["Resource 1: Loom", "Resource 2: Press"]);
        expect(document.querySelector(".card-tile-slot[draggable]")).toBeNull();
    });

});

describe("the point a page tile scales from", () => {

    const box = { left: 100, right: 200, top: 100, bottom: 200, width: 100, height: 100 };

    it("is the corner, edge or centre its place in the group sets", () => {
        expect(scaleOrigin(box, null, { row: 0, column: 0 }, 3, 2)).toBe("0% 0%");
        expect(scaleOrigin(box, null, { row: 0, column: 1 }, 3, 2)).toBe("50% 0%");
        expect(scaleOrigin(box, null, { row: 1, column: 2 }, 3, 2)).toBe("100% 100%");
        expect(scaleOrigin(box, null, { row: 0, column: 0 }, 1, 1)).toBe("50% 50%");
        expect(scaleOrigin(box, null, { row: 0, column: 0 }, 2, 1)).toBe("0% 50%");
    });

    it("moves toward the centre as far as it takes to keep the scaled tile inside a narrow card", () => {
        // 10px of growth in all (100% x 0.1); only 2px of room to the left: the middle column is aimed to grow 20% of it that way.
        expect(scaleOrigin(box, { left: 98, right: 400, top: 0, bottom: 400 }, { row: 0, column: 1 }, 3, 2)).toBe("20% 0%");
        // The same on the right.
        expect(scaleOrigin(box, { left: 0, right: 202, top: 0, bottom: 400 }, { row: 0, column: 1 }, 3, 2)).toBe("80% 0%");
    });

});

describe("the stylesheet of the page tiles, the floating cards and the dialog ground", () => {

    const css = stylesheet("section-tiles.css");
    const global = stylesheet("global.css");

    it("scales a page tile to 110% on HOVER only, about its aimed corner, above its neighbours, with no motion when reduced", () => {
        expect(css).toMatch(/\.section-tile-slot \{[^}]*position: relative;[^}]*transform-origin: 50% 50%;[^}]*transition: transform \.15s ease;/);
        expect(css).toMatch(/\.section-tile-slot:hover \{[^}]*transform: scale\(1\.1\);[^}]*z-index: 6;/);
        expect(css).toMatch(/\.section-tile-slot:hover > \.section-tile \{[^}]*box-shadow: var\(--box-inset\), 0 10px 22px var\(--shadow-18\)/);
        // Never with the focus: a tile that holds the focus has its ring, it does not grow.
        expect(css).not.toMatch(/\.section-tile-slot:[^{]*focus[^{]*\{[^}]*transform: scale/);
        // Closed, the page is the default page until the pointer really moves.
        expect(css).toMatch(/\[data-tiles-settled\] \.section-tile-slot:hover \{[^}]*transform: none;/);
        expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.section-tile-slot,[^}]*transition: none;/);
        // Not the boxes of a dialog.
        // The card tiles of a dialog and of Inventory have their own hover (110%, growing inwards), from card-tile.css.
        expect(stylesheet("card-tile.css")).toMatch(/\.card-tile-slot:hover \{[^}]*transform: scale\(1\.1\);/);
    });

    it("draws the + box a square of the library's size at the tile's lower right, 12px from the edges, with its own hover", () => {
        expect(css).toMatch(/\.section-tile-plus \{[^}]*position: absolute;[^}]*right: var\(--card-padding\);[^}]*bottom: var\(--card-padding\);/);
        expect(css).toMatch(/\.plus-box \{[^}]*--plus-size: var\(--size-box-button\);[^}]*width: var\(--plus-size\);[^}]*height: var\(--plus-size\);/);
        // A swap of two colours. At rest: the ground of what it stands on, a 2px stroke and the "+" in the darker tone;
        // under the pointer or the focus: filled with the tone, no stroke, the "+" in the ground.
        expect(css).toMatch(/\.plus-box \{[^}]*border: 2px solid var\(--plus-fill\);[^}]*background: var\(--plus-ground\);[^}]*color: var\(--plus-fill\);[^}]*transition: background-color \.15s ease, border-color \.15s ease, color \.15s ease;/);
        expect(css).toMatch(/\.plus-box:hover:not\(:disabled\),\s*\.plus-box:focus-visible \{[^}]*border-color: transparent;[^}]*background: var\(--plus-fill\);[^}]*color: var\(--plus-ground\);/);
        expect(css).not.toMatch(/\.plus-box[^{]*\{[^}]*transform: scale/);
        // The "+" is two bars drawn from the middle of the box (an even length, 2px thick): its centre is the box's.
        expect(css).toMatch(/\.plus-box::before,\s*\.plus-box::after \{[^}]*top: 50%;[^}]*left: 50%;[^}]*transform: translate\(-50%, -50%\);/);
        expect(css).toMatch(/\.plus-box\.plus-box-small \{[^}]*--plus-size: var\(--size-box-button\);/);
    });

    it("underlines a list item under the pointer and the focus", () => {
        expect(css).toMatch(/\.section-tile-link:hover,\s*\.section-tile-link:focus-visible \{[^}]*text-decoration-color: currentColor;/);
    });

    it("floats a card over the dimmed page with a drop shadow, 492px wide unless it is a founder's or the Workspace's", () => {
        expect(stylesheet("page-3-edges.css")).toMatch(/\.floating-card-host :is\([^)]*\) \{[^}]*--card-drop: 0 24px 56px var\(--shadow-18\)/);
        expect(css).toMatch(/\.floating-card-card \{[^}]*width: min\(var\(--open-card-width\), calc\(100vw - 16px\)\);/);
        expect(css).toMatch(/\.floating-card-founder \{[^}]*width: min\(var\(--founder-card-min\), calc\(100vw - 16px\)\);/);
        expect(global).toMatch(/--open-card-width: 492px;/);
    });

    it("makes the dialog's ground solid, and the cards in it too: nothing of the page shows through a frame with text", () => {
        expect(css).toMatch(/\.section-tile-dialog\.business-foundation-card \{[^}]*backdrop-filter: none;/);
        expect(css).toMatch(/\.section-tile-dialog \.business-foundation-card \{[^}]*backdrop-filter: none;/);
    });

    it("sets an Activity card's Performer and Responsible rows with their dropdowns next to the labels, 12px apart", () => {
        expect(css).toMatch(/\.card-box-open \.business-capability-stack\.business-capability-activity-fields \{[^}]*grid-template-columns: var\(--activity-label-column\) minmax\(0, 1fr\);[^}]*column-gap: var\(--space-cell\);/);
        expect(css).toMatch(/\.card-box-open \.business-capability-activity-fields > \.business-field-inline \{[^}]*grid-template-columns: subgrid;[^}]*align-items: center;/);
        // The Responsible's row (a tick, its words, the dropdown) shares those two columns, so the two dropdowns start at one x.
        expect(css).toMatch(/:not\(\.optional-field\):has\(> \.business-foundation-label-info > \.business-foundation-tick-inline\) \{[^}]*grid-template-columns: subgrid;/);
    });

});

describe("the point a page tile scales from is set once while the pointer stays", () => {

    const rectOf = (left: number, top: number, width: number, height: number) =>
        ({ left, top, right: left + width, bottom: top + height, width, height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;

    it("is not measured again when a press moves the focus: the tile (already grown) would be taken for its size and slide from under the pointer", () => {
        render(<Harness initial={seeded()} />);
        const slot = slotOf("Activities");
        const room = slot.closest(".card-scroll") as HTMLElement;
        room.getBoundingClientRect = () => rectOf(0, 0, 800, 800);
        // The tile at rest reaches below the bottom of its card's scrolling body: its origin is moved to keep it inside.
        slot.getBoundingClientRect = () => rectOf(0, 700, 100, 200);
        fireEvent.pointerEnter(slot);
        const first = slot.style.transformOrigin;
        expect(first).not.toBe("");
        expect(first).not.toBe("0% 0%");
        // A press on a list item moves the focus; the tile's rect (as the browser would have it at that moment) is another one.
        slot.getBoundingClientRect = () => rectOf(0, 600, 150, 300);
        fireEvent.focus(within(slot).getByRole("button", { name: "Operational" }));
        fireEvent.pointerMove(slot);
        expect(slot.style.transformOrigin).toBe(first);
        // Once the pointer has left, the next stay is measured afresh.
        fireEvent.pointerLeave(slot);
        slot.getBoundingClientRect = () => rectOf(0, 100, 100, 200);
        fireEvent.pointerEnter(slot);
        expect(slot.style.transformOrigin).not.toBe(first);
    });

});

describe("closing a card or a dialog returns to the default page", () => {

    it("gives the opener back its focus WITHOUT a ring after Escape or Back, however it was opened", () => {
        render(<Harness initial={seeded()} />);
        const link = () => within(slotOf("Activities")).getByRole("button", { name: "Operational" });
        // Opened with the pointer (a click has a detail).
        fireEvent.click(link(), { detail: 1 });
        // (Escape closes every layer at once, straight to the page.)
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(document.activeElement).toBe(link());
        expect(link().hasAttribute("data-focus-quiet")).toBe(true);
        // The keyboard takes the quiet away: the ring is the keyboard's.
        fireEvent.keyDown(window, { key: "Tab" });
        expect(link().hasAttribute("data-focus-quiet")).toBe(false);
        // Opened with the keyboard (Enter on a button is a click with no detail): no ring either, until the next key.
        fireEvent.click(link(), { detail: 0 });
        fireEvent.keyDown(document, { key: "Escape" });
        expect(document.activeElement).toBe(link());
        expect(link().hasAttribute("data-focus-quiet")).toBe(true);
    });

    it("does the same for a tile opened into its dialog", () => {
        render(<Harness initial={seeded()} />);
        const tile = tileButton("Activities", infrastructureCard());
        fireEvent.click(tile, { detail: 1 });
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(document.activeElement).toBe(tile);
        expect(tile.hasAttribute("data-focus-quiet")).toBe(true);
    });

    it("lets no tile grow under a resting pointer after the close, until the pointer really moves", () => {
        render(<Harness initial={seeded()} />);
        fireEvent.click(within(slotOf("Activities")).getByRole("button", { name: "Operational" }), { detail: 1 });
        fireEvent.keyDown(document, { key: "Escape" });
        expect(document.documentElement.hasAttribute("data-tiles-settled")).toBe(true);
        expect(stylesheet("section-tiles.css")).toMatch(/\[data-tiles-settled\] \.section-tile-slot:hover \{[^}]*transform: none;/);
        expect(stylesheet("section-tiles.css")).toMatch(/\[data-focus-quiet\]:focus-visible \{[^}]*outline: none !important;/);
    });

});
