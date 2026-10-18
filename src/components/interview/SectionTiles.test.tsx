import { inwardOrigin } from "./CardTile";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { cardBoxes, closeAllTiles, closeTile, descendSole, floatingCardHost, infrastructureCard, offeringCard, openBox, openCard, openTile, tileButton, toggles, topDialog } from "../../test/interviewTestUtils";
import { asBusinessCapabilityValue, createBusinessActivity, createBusinessPartner, createBusinessResourceSlot } from "../../framework/engine/AnswerUtils";
import { stylesheet } from "../../test/stylesheet";
import { tableRows } from "./CapabilityOverview";
import { belongsLines, floorSubgroups, filterFloor, DEFAULT_FLOOR_FILTER, subgroupKey } from "./capabilityFloor";
import { dialogFrame, drawnTitle, gridColumns, tailPlacement, tileName } from "./SectionTiles";

afterEach(cleanup);

const founder = (id: string, name: string) => ({ id, name, ownership: "50", capital: "", roles: [""], experience: "" });

function Harness({ initial, engagement, founders }: { initial?: unknown; engagement?: unknown; founders?: number }) {
    const [value, setValue] = useState<unknown>(initial ?? asBusinessCapabilityValue(undefined));
    const list = founders === undefined
        ? [founder("f1", "Ann"), founder("f2", "Bo")]
        : Array.from({ length: founders }, (_, index) => founder("f" + (index + 1), "Founder Name " + (index + 1)));
    return (
        <BusinessCapabilityEditor
            value={value}
            onChange={setValue}
            engagement={engagement}
            legalEntityFounders={list}
        />
    );
}

/** The titles of the tiles in the group named `label`, in order. */
const tilesOf = (label: string) => [...screen.getByRole("group", { name: label }).querySelectorAll<HTMLElement>(".section-tile")]
    // (The drawn title joins an "&" to the word after it with a no-break space; the tile's list and "+" are its slot's other parts.)
    .map(tile => tile.querySelector(".section-tile-title")?.textContent?.replace(/ /g, " "));

/** How many tiles stand across in the group named `label` (the shape's number). */
const across = (label: string) => (screen.getByRole("group", { name: label }) as HTMLElement).style.getPropertyValue("--tile-columns");

/** A resource card of that name. */
const utilitySlot = (name: string) => ({ ...createBusinessResourceSlot(), name });

/**
 * A value whose Utilities, Workstation, Equipment, Vehicles, Digital Infrastructure and Documents & Rights each hold two cards (a category with two cards or
 * more is a category tile in the Resources view), all in one group: Premises Utilities, Furniture & Fittings, Devices & Tools, Company Vehicles, Software & Web, Insurances.
 */
const twoInEach = () => ({
    ...asBusinessCapabilityValue(undefined),
    resources: {
        utilities: [{ id: "premises-utilities", name: "", slots: [utilitySlot("Mains"), utilitySlot("Generator")] }],
        workstation: [{ id: "furniture-fittings", name: "", slots: [utilitySlot("Desk"), utilitySlot("Chair")] }],
        equipment: [{ id: "devices-tools", name: "", slots: [utilitySlot("Monitor"), utilitySlot("Printer")] }],
        digital: [{ id: "software-web", name: "", slots: [utilitySlot("Editor"), utilitySlot("Ledger")] }],
        vehicles: [{ id: "company-vehicles", name: "", slots: [utilitySlot("Van"), utilitySlot("Bike")] }],
        documents: [{ id: "insurances", name: "", slots: [utilitySlot("Cover"), utilitySlot("Policy")] }]
    }
});

describe("the section tiles of 3. Infrastructure & Capability", () => {

    it("places Infrastructure's four tiles two by two, with no group headings", () => {
        render(<Harness />);
        expect(tilesOf("Infrastructure sections")).toEqual(["Founders", "Resources", "Activities", "Partners & Suppliers"]);
        expect(across("Infrastructure sections")).toBe("2");
        expect(document.body.textContent).not.toMatch(/Organizational Resources|Operational Resources/);
        // The sections' contents are drawn only in a dialog.
        expect(screen.queryByText("1. Founders")).toBeNull();
    });

    it("shows a section's view as one category tile per category (whatever it holds, the empty ones too), ending with the section's add tile", () => {
        const base = asBusinessCapabilityValue(undefined);
        const activity = (name: string) => ({ ...createBusinessActivity(), name });
        render(<Harness initial={{
            ...base,
            activities: [
                { id: "operational", name: "", activities: [activity("One"), activity("Two")] },
                { id: "pre-operational", name: "", activities: [activity("Solo")] }
            ]
        }} />);
        // The page tile lists every category.
        expect(tileButton("Activities", infrastructureCard()).getAttribute("aria-label")).toBe("Activities, Pre-Operational, Operational");
        fireEvent.click(tileButton("Activities", infrastructureCard()));
        const dialog = topDialog();
        const tiles = [...dialog.querySelectorAll("button.section-tile")].map(button => button.getAttribute("aria-label"));
        // Every category is a category tile with its own + Add (Pre-Operational's one card too); the section's Add ends the grid.
        expect(tiles).toEqual(["Pre-Operational, Solo", "Operational, One, Two"]);
        expect(within(dialog).getByRole("button", { name: "Add Card" }).title).toBe("Add Activity");
        expect(within(dialog).getByRole("button", { name: "Add Activity to Operational" }).classList.contains("plus-box")).toBe(true);
        // A tile that is a category opens that category's own cards.
        fireEvent.click(tileButton("Operational", dialog));
        expect(cardBoxes()).toEqual(["Activity 1: One", "Activity 2: Two"]);
    });

    it("gives Offering's Capability four tiles, two by two, and, outside both sections (under Offering's Capability's card), the Inventory tile and ONE grey Completed tile once an activity is completed", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness />);
        expect(tilesOf("Offering's Capability sections")).toEqual(["Resources", "Activities", "Partners & Suppliers", "Delivery"]);
        // Only "Inventory" until an activity is completed.
        expect(within(document.querySelector(".section-tiles-completed") as HTMLElement).getAllByRole("button").map(button => button.getAttribute("aria-label")?.split(",")[0])).toEqual(["Inventory"]);
        cleanup();
        render(<Harness initial={{ ...base, offering: { ...base.offering, activities: [{ ...createBusinessActivity(), name: "Finished", completed: true }] } }} />);
        // Still four tiles in the section; the Completed tile is not in either section's group.
        expect(tilesOf("Offering's Capability sections")).toEqual(["Resources", "Activities", "Partners & Suppliers", "Delivery"]);
        const wrapper = document.querySelector(".section-tiles-completed") as HTMLElement;
        expect(wrapper).toBeTruthy();
        // It stands after both cards, as the page grid's last child; there is exactly one Completed tile on the page.
        expect(wrapper.previousElementSibling).toBe(offeringCard());
        expect(infrastructureCard().contains(wrapper) || offeringCard().contains(wrapper)).toBe(false);
        expect(screen.getAllByRole("button", { name: /^Completed/ }).filter(button => button.classList.contains("section-tile"))).toHaveLength(1);
    });

    it("measures its tiles in a box of its own, the tiles' size container", () => {
        render(<Harness />);
        const group = screen.getByRole("group", { name: "Infrastructure sections" });
        expect(group.parentElement!.classList.contains("section-tiles-box")).toBe(true);
    });

    it("keeps a category the founder added earlier as a category tile beside the standard ones", () => {
        const base = asBusinessCapabilityValue(undefined);
        const file = (id: string, name: string) => ({ id, name, description: "", performerIds: [], responsibleId: "", completed: false, offeringIds: [] });
        render(<Harness initial={{
            ...base,
            activities: [{ id: "custom-1", name: "Legal", activities: [file("a1", "File"), file("a2", "Review")] }]
        }} />);
        // (The page keeps its four tiles: the category is inside the Activities view.)
        expect(tilesOf("Infrastructure sections")).toEqual(["Founders", "Resources", "Activities", "Partners & Suppliers"]);
        fireEvent.click(tileButton("Activities", infrastructureCard()));
        const dialog = topDialog();
        expect([...dialog.querySelectorAll("button.section-tile")].map(button => button.getAttribute("aria-label"))).toEqual(["Pre-Operational", "Operational", "Legal, File, Review"]);
    });

});

describe("ONE SHAPE for every set of tiles, boxes and card boxes", () => {

    it("puts 1 to 3 in a single row, exactly 4 in a 2 x 2 square, and 5 or more in two rows", () => {
        const shape = [1, 2, 3, 4, 5, 6, 7, 9, 12].map(count => [count, gridColumns(count), Math.ceil(count / gridColumns(count))]);
        expect(shape).toEqual([
            [1, 1, 1], [2, 2, 1], [3, 3, 1],
            [4, 2, 2],
            [5, 3, 2], [6, 3, 2], [7, 4, 2], [9, 5, 2], [12, 6, 2]
        ]);
    });

    it("sizes a group on the page from the three-across rule up to three across, and from its own count beyond", () => {
        const global = stylesheet("global.css");
        expect(global).toMatch(/--section-tile-size: max\(var\(--section-tile-min\), calc\(\(100cqw - \(max\(var\(--tile-columns, 3\), 3\) - 1\) \* var\(--space-card\)\) \/ max\(var\(--tile-columns, 3\), 3\) - 0\.01px\)\);/);
    });

    it("keeps Offering's Capability at four tiles, two by two, however many cards and channel-made cards it holds", () => {
        const base = asBusinessCapabilityValue(undefined);
        const resources = [1, 2].map(index => ({ ...createBusinessResourceSlot(), name: "Res " + index }));
        const partners = [1, 2].map(index => createBusinessPartner("Agency " + index));
        const engagement = {
            segments: [{ segmentId: "s1", channels: [{ id: "c1", category: "Online", name: "Shop", actionIds: {} }] }],
            channelResources: [
                { id: "l1", segmentId: "s1", channelId: "c1", resourceId: resources[1].id, actionIds: [] },
                { id: "l2", segmentId: "s1", channelId: "c1", resourceId: partners[1].id, actionIds: [] }
            ]
        };
        render(<Harness
            initial={{ ...base, offering: { ...base.offering, resources, professionals: partners } }}
            engagement={engagement}
        />);
        // Resources, Activities, Partners & Suppliers, Delivery: the channel-made cards stand inside the views, not as tiles of their own.
        expect(tilesOf("Offering's Capability sections")).toEqual(["Resources", "Activities", "Partners & Suppliers", "Delivery"]);
        expect(across("Offering's Capability sections")).toBe("2");
    });

});

describe("tile anatomy: the title at a third of the height, underlined, a list of what the section includes", () => {

    it("lists what each tile includes and says it again in the tile's accessible name", () => {
        const base = asBusinessCapabilityValue(undefined);
        const slot = { ...createBusinessResourceSlot(), name: "Mains" };
        render(<Harness initial={{ ...base, resources: { utilities: [{ id: "premises-utilities", name: "", slots: [slot] }] } }} />);
        // (Infrastructure's tiles; Offering's carry some of the same names.)
        const tile = tileButton("Resources", infrastructureCard());
        // A tile lists every category of its view (the Workspace first), and says it again in its name.
        expect(tile.getAttribute("aria-label")).toBe("Resources, Workspace, Utilities, Workstation, Equipment, Vehicles, Digital Infrastructure, and more");
        const listOf = (name: string) => tileButton(name, infrastructureCard()).parentElement!.querySelectorAll<HTMLElement>(".section-tile-list > li");
        expect([...listOf("Resources")].map(item => item.textContent)).toEqual(["Utilities", "Workspace", "Workstation", "Equipment", "Vehicles", "Digital Infrastructure", "Materials & Inventory", "Documents & Rights", "Human Resources"]);
        // (Utilities holds the unfinished card Mains, so its line comes first in the list; the name keeps the view's order.)
        expect([...listOf("Resources")].map(item => item.querySelectorAll(".section-tile-list-line").length)).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1]);
        // The list is INSIDE the tile's square (its slot), each item a button of its own -- the tile's name above says it all again.
        expect(tile.parentElement!.classList.contains("section-tile-slot")).toBe(true);
        expect(tile.querySelector(".section-tile-list")).toBeNull();
        expect([...listOf("Resources")].every(item => item.querySelector("button.section-tile-link") !== null)).toBe(true);
        expect(tile.parentElement!.querySelector(".section-tile-list")!.getAttribute("aria-hidden")).toBeNull();
        // Delivery's list is decoration, as it was: no link, hidden from assistive technology.
        const delivery = tileButton("Delivery");
        expect(delivery.parentElement!.querySelector(".section-tile-list")?.getAttribute("aria-hidden") ?? "true").toBe("true");
        // The Founders tile: each name.
        expect(tileButton("Founders").getAttribute("aria-label")).toBe("Founders, Ann, Bo");
        // A tile holding no card still lists its categories: Activities.
        expect(tileButton("Activities", infrastructureCard()).getAttribute("aria-label")).toBe("Activities, Pre-Operational, Operational");
    });

    it("draws a group's title on ONE line, whole in its tooltip, inside its category's view", () => {
        const base = asBusinessCapabilityValue(undefined);
        const slots = ["Mains", "Lamp"].map(name => ({ ...createBusinessResourceSlot(), name }));
        render(<Harness initial={{ ...base, resources: { documents: [{ id: "insurances", name: "", slots }] } }} />);
        openTile("Resources", undefined, undefined, infrastructureCard());
        fireEvent.click(tileButton("Documents & Rights", topDialog()));
        // "Tickets & Trip Costs" is drawn on ONE line (no forced break, no size step); the tooltip holds it whole.
        const title = tileButton("Tickets & Trip Costs", topDialog()).querySelector(".section-tile-title")!;
        expect(title.querySelectorAll("br")).toHaveLength(0);
        expect(title.textContent!.replace(/\s/g, " ")).toBe("Tickets & Trip Costs");
        expect(title.closest("button")!.hasAttribute("data-title-small")).toBe(false);
        // A group tile lists the names of its cards.
        expect(tileButton("Insurances", topDialog()).getAttribute("aria-label")).toBe("Insurances, Mains, Lamp");
    });

    it("cuts a long accessible name sensibly", () => {
        expect(tileName("Utilities")).toBe("Utilities");
        expect(tileName("Utilities", ["Electricity", "Internet"])).toBe("Utilities, Electricity, Internet");
        const long = Array.from({ length: 12 }, (_, index) => "A rather long item number " + index);
        const name = tileName("Resources", long);
        expect(name.length).toBeLessThanOrEqual(141);
        expect(name.endsWith("…")).toBe(true);
        expect(name.startsWith("Resources, A rather long item number 0")).toBe(true);
    });

    it("draws the title ending on the line a third down the tile, underlined by a rule of its own, the list centred under it", () => {
        const css = stylesheet("section-tiles.css");
        expect(stylesheet("global.css")).toMatch(/--tile-title-top: 0\.25;/);
        // Two rows: the title's, ending on the line one third down the square (its LAST line, so a long title grows upward), and the rest.
        expect(css).toMatch(/\.section-tile \{[^}]*display: grid;[^}]*grid-template-rows: var\(--tile-title-row\) minmax\(0, 1fr\);/);
        expect(css).toMatch(/--tile-title-row: calc\(var\(--section-tile-size\) \* var\(--tile-title-top\) - 1px \+ 5px \+ var\(--section-tile-line-height\) \* 0\.5em\);/);
        // The list starts 12px under the underline, whatever the lift (TileTitle writes the tile's --tile-lift).
        expect(css).toMatch(/\.section-tile-list \{[^}]*margin: calc\(var\(--space-card\) - var\(--tile-lift, 0px\)\) 0 0;/);
        expect(css).toMatch(/\.section-tile-title \{[^}]*align-self: start;/);
        expect(css).toMatch(/\.section-tile-list \{[^}]*width: fit-content;[^}]*max-width: 100%;/);
        expect(css).toMatch(/\.section-tile-title \{[^}]*border-bottom: 1px solid color-mix\(in srgb, currentColor 40%, transparent\);/);
        expect(css).toMatch(/\.section-tile-list \{[^}]*font-size: var\(--font-small\);[^}]*color: var\(--text-muted\);/);
        expect(css).toMatch(/\.section-tile-list > li \{[^}]*text-overflow: ellipsis;[^}]*white-space: nowrap;/);
    });

});

describe("an empty section shows a small + under its title", () => {

    it("draws no small + on a page tile that has the + box (the box is its +), only the note 'No items yet'; the group tiles of a dialog, which have one too, do the same", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{ ...base, resources: { digital: [{ id: "software-web", name: "", slots: [utilitySlot("Mains"), utilitySlot("Lamp")] }] } }} />);
        const glyph = (name: string) => tileButton(name, infrastructureCard()).querySelector(".section-tile-empty");
        const slotOf = (name: string) => tileButton(name, infrastructureCard()).parentElement!;
        // An empty section with the + box: the box, not the glyph. It lists its categories, so there is no "No items yet" note on the page tile.
        expect(glyph("Activities")).toBeNull();
        expect(tileButton("Activities", infrastructureCard()).querySelector(".section-tile-empty-note")).toBeNull();
        expect(slotOf("Activities").querySelector(".plus-box")).toBeTruthy();
        // A section that holds cards lists them (no note) and has its + box too.
        expect(glyph("Resources")).toBeNull();
        expect(slotOf("Resources").querySelector(".section-tile-list")).toBeTruthy();
        expect(slotOf("Resources").querySelector(".plus-box")).toBeTruthy();
        // Founders and Delivery are not lists of cards: no glyph, no box.
        for (const [none, card] of [["Founders", infrastructureCard()], ["Delivery", offeringCard()]] as const) {
            expect(tileButton(none, card).querySelector(".section-tile-empty")).toBeNull();
            expect(tileButton(none, card).parentElement!.querySelector(".plus-box")).toBeNull();
        }
        // An empty category of the Activities view is a tile of its own: the + box is its +, so no glyph, only the note.
        openTile("Activities");
        const marketing = tileButton("Marketing", topDialog());
        expect(marketing.querySelector(".section-tile-empty")).toBeNull();
        expect(marketing.querySelector(".section-tile-empty-note")!.textContent).toBe("No items yet");
        expect(within(topDialog()).getByRole("button", { name: "Add Activity to Marketing" }).classList.contains("plus-box")).toBe(true);
        closeTile();
        // Inside the Digital Infrastructure view a group tile has its own + box (like a page tile): the box is its +, so no small glyph under its title, only the note.
        openTile("Digital Infrastructure");
        const internet = tileButton("Cloud & Security", topDialog());
        expect(internet.querySelector(".section-tile-empty")).toBeNull();
        expect(internet.querySelector(".section-tile-empty-note")!.textContent).toBe("No items yet");
        expect(within(topDialog()).getByRole("button", { name: "Add Digital Infrastructure to Cloud & Security" }).classList.contains("plus-box")).toBe(true);
    });

    it("marks a subcategory box with no cards yet, and not one that holds some", () => {
        const base = asBusinessCapabilityValue(undefined);
        const lamp = { ...createBusinessResourceSlot(), name: "Desk lamp" };
        const fan = { ...createBusinessResourceSlot(), name: "Desk fan" };
        render(<Harness initial={{ ...base, resources: { digital: [{ id: "software-web", name: "", slots: [lamp, fan] }] } }} />);
        // (Two cards: the tile is a grid to choose from. With ONE card the tile opens that card at once.)
        openTile("Digital Infrastructure");
        const dialog = topDialog();
        expect(dialog.classList.contains("section-tile-dialog")).toBe(true);
        expect(tileButton("Cloud & Security", dialog).querySelector(".section-tile-empty-note")).toBeTruthy();
        expect(tileButton("Software & Web", dialog).querySelector(".section-tile-empty-note")).toBeNull();
        // A box lists its cards' names.
        expect(tileButton("Software & Web", dialog).getAttribute("aria-label")).toBe("Software & Web, Desk lamp, Desk fan");
    });

    it("opens an empty category on ONE new blank card, FLOATING, its name focused; left blank, the card is removed again and the + stays", () => {
        render(<Harness />);
        openTile("Operational");
        // No dialog around it: the card floats on its section part, under the section's name.
        const card = screen.getByRole("dialog", { name: "Activities" });
        expect(card.classList.contains("floating-card-host")).toBe(true);
        expect(document.querySelector(".floating-card-host")).not.toBeNull();
        const name = screen.getByRole("textbox", { name: "Activity 1 name" }) as HTMLTextAreaElement;
        expect(document.activeElement).toBe(name);
        expect(name.value).toBe("");
        // The card is the creation interface: its normal fields.
        expect(screen.getByRole("checkbox", { name: /Notes/ })).toBeTruthy();

        // Back from the blank card removes it: the page again, the section still holds no card.
        closeAllTiles();
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(tileButton("Operational").getAttribute("data-holds") ?? "").toBe("");
    });

    it("also removes a blank card when its floating card is closed with Escape", () => {
        render(<Harness />);
        openTile("Activities", "Production");
        expect(screen.getByRole("textbox", { name: "Activity 1 name" })).toBeTruthy();
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(tileButton("Activities", offeringCard()).getAttribute("data-holds") ?? "").toBe("");
    });

    it("keeps the card once anything is written in it: the tile lists it, and pressing the tile opens that one card floating", () => {
        render(<Harness />);
        openTile("Operational");
        fireEvent.change(screen.getByRole("textbox", { name: "Activity 1 name" }), { target: { value: "Weave samples" } });
        closeAllTiles();
        expect(screen.queryByRole("dialog")).toBeNull();
        // The section tile holds the card now.
        expect((tileButton("Operational").getAttribute("data-holds") ?? "").split(" ").filter(Boolean)).toHaveLength(1);
        expect(tileButton("Operational").querySelector(".section-tile-empty-note")).toBeNull();
        // Pressed, the section opens its view, the category its card tile, and that opens the one card floating.
        openTile("Operational", undefined, "Weave samples");
        expect(document.querySelector(".floating-card-host")).not.toBeNull();
        expect((screen.getByRole("textbox", { name: "Activity 1 name" }) as HTMLTextAreaElement).value).toBe("Weave samples");
    });

    it("keeps a card that holds any input other than its name", () => {
        render(<Harness />);
        openTile("Activities", "Marketing");
        fireEvent.click(screen.getByRole("checkbox", { name: /Notes/ }));
        fireEvent.change(screen.getByLabelText("Activity 1 description"), { target: { value: "Plan the autumn mailing" } });
        closeTile();
        expect((tileButton("Activities", offeringCard()).getAttribute("data-holds") ?? "").split(" ").filter(Boolean)).toHaveLength(1);
    });

    it("adds a card with the add box of the grid, which closes the grid and opens the new card floating", () => {
        render(<Harness initial={{
            ...asBusinessCapabilityValue(undefined),
            activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity(), name: "First" }, { ...createBusinessActivity(), name: "Second" }] }]
        }} />);
        openTile("Operational");
        expect(cardBoxes()).toEqual(["Activity 1: First", "Activity 2: Second"]);
        fireEvent.click(screen.getByRole("button", { name: "Add Card" }));
        expect(document.querySelector(".floating-card-host")).not.toBeNull();
        const name = screen.getByRole("textbox", { name: "Activity 3 name" });
        expect(document.activeElement).toBe(name);
        fireEvent.change(name, { target: { value: "Third" } });
        // (The category's one group has its tile, one level between the card and the page.)
        closeAllTiles();
        expect((tileButton("Operational").getAttribute("data-holds") ?? "").split(" ").filter(Boolean)).toHaveLength(3);
    });

    it("opens an empty group tile on a blank card, floating under the group's name, and keeps it once written", () => {
        render(<Harness initial={{ ...asBusinessCapabilityValue(undefined), resources: { digital: [{ id: "software-web", name: "", slots: [utilitySlot("Mains"), utilitySlot("Generator")] }] } }} />);
        openTile("Digital Infrastructure");
        expect(tileButton("Cloud & Security", topDialog()).querySelector(".section-tile-empty-note")).toBeTruthy();
        openBox("Cloud & Security");
        const card = screen.getByRole("dialog", { name: "Resources" });
        expect(card.classList.contains("floating-card-host")).toBe(true);
        expect(card.querySelector(".floating-card-caption")!.textContent).toContain("Resources");
        const name = screen.getByRole("textbox", { name: "Resource 1 name" });
        expect(document.activeElement).toBe(name);
        fireEvent.change(name, { target: { value: "Fibre" } });
        closeAllTiles();
        expect(screen.queryByRole("dialog")).toBeNull();
        // The group holds exactly one card now: its tile (inside the Utilities view) lists it and opens it directly.
        openTile("Digital Infrastructure");
        expect(tileButton("Cloud & Security", topDialog()).getAttribute("aria-label")).toBe("Cloud & Security, Fibre");
        openBox("Cloud & Security");
        expect(document.querySelector(".floating-card-host")).not.toBeNull();
        expect((screen.getByRole("textbox", { name: /^Resource [0-9]+ name$/ }) as HTMLTextAreaElement).value).toBe("Fibre");
    });

    it("lets a link to a card press its tile, its category tile, its group tile and the card's tile: the last one opens the card floating", () => {
        const base = asBusinessCapabilityValue(undefined);
        const slot = { ...createBusinessResourceSlot(), name: "Desk lamp" };
        const other = { ...createBusinessResourceSlot(), name: "Desk fan" };
        render(<Harness initial={{ ...base, resources: { digital: [{ id: "software-web", name: "", slots: [slot, other] }] } }} />);
        const tile = document.querySelector("[data-tile='resources']") as HTMLElement;
        expect(tile.getAttribute("data-holds")).toContain(slot.id);
        fireEvent.click(tile);
        // (Two cards in Digital Infrastructure: the Resources view shows it as a category tile, which holds the group tiles.)
        const category = topDialog().querySelector("[data-anchor='category-digital']") as HTMLElement;
        expect(category.hasAttribute("data-opens")).toBe(true);
        fireEvent.click(category);
        const box = topDialog().querySelector("[data-anchor='subsection-digital-software-web']") as HTMLElement;
        expect(box.hasAttribute("data-opens")).toBe(true);
        fireEvent.click(box);
        const cardBox = topDialog().querySelector("[data-anchor='resource-" + slot.id + "'], [data-anchor='" + slot.id + "']") as HTMLElement;
        expect(cardBox.hasAttribute("data-opens")).toBe(true);
        fireEvent.click(cardBox);
        // The grid is gone; the card floats (its anchor is the card itself now, no box to press).
        expect(document.querySelector(".floating-card-host")).not.toBeNull();
        expect(topDialog().querySelector("[data-anchor='" + slot.id + "']")!.hasAttribute("data-opens")).toBe(false);
        expect((screen.getByLabelText("Resource 1 name") as HTMLTextAreaElement).value).toBe("Desk lamp");
    });

});

describe("a section tile's dialog", () => {

    it("opens the section's content in a modal dialog named after the section, and the page behind is inert", () => {
        render(<Harness />);
        openTile("Founders");
        const dialog = screen.getByRole("dialog", { name: "Founders" });
        expect(dialog.getAttribute("aria-modal")).toBe("true");
        // (One founder: the tile opens that founder's card floating at once, as a tile of one card does; no fold arrow on it.)
        expect(within(dialog).queryByRole("button", { name: /Maximize|Minimize/ })).toBeNull();
        // Only one dialog at a time, and everything else on the page is inert.
        expect(screen.getAllByRole("dialog")).toHaveLength(1);
        const inert = [...document.body.children].filter(child => child.hasAttribute("inert"));
        expect(inert.length).toBeGreaterThan(0);
        expect(inert.some(child => child.contains(dialog))).toBe(false);
    });

    it("puts the Back button at the lower left: the last thing in the dialog, after the content", () => {
        render(<Harness initial={twoInEach()} />);
        openTile("Utilities");
        const dialog = topDialog();
        const back = within(dialog).getByRole("button", { name: "Back" });
        expect(dialog.lastElementChild?.contains(back)).toBe(true);
        expect(dialog.querySelector(".section-tile-dialog-body")!.compareDocumentPosition(back) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("closes with Back and returns the focus to the tile that opened it", () => {
        render(<Harness />);
        const tile = tileButton("Workspace");
        tile.focus();
        fireEvent.click(tile);
        expect(topDialog()).toBeTruthy();
        closeTile();
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(document.activeElement).toBe(tile);
        expect([...document.body.children].some(child => child.hasAttribute("inert"))).toBe(false);
    });

    it("closes with Escape, returns the focus to its tile, and the key goes no further (it is the page's Back)", () => {
        render(<Harness />);
        const page = vi.fn();
        window.addEventListener("keydown", page);
        const tile = tileButton("Workspace");
        fireEvent.click(tile);
        fireEvent.keyDown(topDialog(), { key: "Escape" });
        window.removeEventListener("keydown", page);
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(document.activeElement).toBe(tile);
        expect(page).not.toHaveBeenCalled();
    });

    it("lets an open list take Escape first, then the dialog", () => {
        render(<Harness />);
        openTile("Workspace", undefined, "Workspace");
        fireEvent.click(screen.getAllByRole("button", { name: /Workspace/ }).find(button => button.classList.contains("option-picker-trigger"))!);
        expect(screen.getAllByRole("option").length).toBeGreaterThan(0);
        fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
        expect(screen.queryAllByRole("option")).toHaveLength(0);
        expect(topDialog()).toBeTruthy();
        fireEvent.keyDown(topDialog(), { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("keeps the page as it was: a card written in its floating card is still there when the tile is pressed again, nothing is re-created", () => {
        render(<Harness />);
        openTile("Resources", "Equipment", undefined);
        openBox("Production Machinery");
        fireEvent.change(screen.getByRole("textbox", { name: "Resource 1 name" }), { target: { value: "Loom" } });
        closeAllTiles();
        openTile("Resources", "Equipment", undefined);
        openBox("Production Machinery");
        expect(screen.getAllByRole("textbox", { name: /^Resource [0-9]+ name$/ })).toHaveLength(1);
        expect((screen.getByRole("textbox", { name: "Resource 1 name" }) as HTMLTextAreaElement).value).toBe("Loom");
    });

    it("is editable as the section was: a card written in the dialog is saved", () => {
        let saved: unknown;
        function Saving() {
            const [value, setValue] = useState<unknown>(asBusinessCapabilityValue(undefined));
            return <BusinessCapabilityEditor value={value} onChange={(next) => { saved = next; setValue(next); }} />;
        }
        render(<Saving />);
        openTile("Operational");
        fireEvent.change(screen.getByRole("textbox", { name: "Activity 1 name" }), { target: { value: "Plan" } });
        expect(asBusinessCapabilityValue(saved).activities[0].activities).toHaveLength(1);
        expect(asBusinessCapabilityValue(saved).activities[0].activities[0].name).toBe("Plan");
    });

});

describe("cards made from a Customer Channel", () => {

    const base = asBusinessCapabilityValue(undefined);
    const own = { ...createBusinessResourceSlot(), name: "Own stall", category: "equipment", group: "production-machinery" };
    const made = { ...createBusinessResourceSlot(), name: "Shopify plan" };
    const professional = { ...createBusinessPartner("Courier"), name: "Courier" };
    const channelPartner = { ...createBusinessPartner("Agency"), name: "Agency" };

    const value = {
        ...base,
        offering: { ...base.offering, resources: [own, made], professionals: [professional, channelPartner] }
    };

    const engagement = {
        segments: [{
            segmentId: "s1",
            channels: [{ id: "c1", category: "Online", name: "Shop", actionIds: {} }]
        }],
        channelResources: [
            { id: "l1", segmentId: "s1", channelId: "c1", resourceId: made.id, actionIds: [] },
            { id: "l2", segmentId: "s1", channelId: "c1", resourceId: channelPartner.id, actionIds: [] }
        ]
    };

    it("a card made from a template lives in its own category and group, in the channel's colour; only blank ones stay in the Channel tile", () => {
        const filed = { ...createBusinessResourceSlot(), name: "Platform or tool subscription", status: "costs", category: "digital", group: "sales-delivery-tools" };
        render(<Harness
            initial={{ ...base, offering: { ...base.offering, resources: [filed] } }}
            engagement={{ ...engagement, channelResources: [{ id: "l1", segmentId: "s1", channelId: "c1", resourceId: filed.id, actionIds: [] }] }}
        />);
        openTile("Resources");
        const categories = [...topDialog().querySelectorAll<HTMLElement>("button.section-tile-category")];
        expect(categories.map(tile => tile.getAttribute("aria-label"))).toContain("Digital Infrastructure, Platform or tool subscription");
        expect(categories.map(tile => tile.getAttribute("aria-label")).some(label => label?.startsWith("Channel"))).toBe(false);
    });

    it("stand among the section's cards as tiles of a hue of their own: the Resources and Partners & Suppliers views, not tiles on the page", () => {
        render(<Harness initial={value} engagement={engagement} />);
        // (Offering keeps its four tiles; the channel's cards stand in a 'Channel' category inside the views.)
        expect(tilesOf("Offering's Capability sections")).toEqual(["Resources", "Activities", "Partners & Suppliers", "Delivery"]);
        expect(across("Offering's Capability sections")).toBe("2");
        // The page tile lists the categories (cut after the first few: "and more"); the channel's own is in the view.
        expect(tileButton("Resources").getAttribute("aria-label")).toBe("Resources, Workspace, Utilities, Workstation, Equipment, Vehicles, Digital Infrastructure, and more");
        openTile("Resources");
        // The view: the nine categories (the user's own card stands in Equipment) and the Channel category (the cards a Customer Channel made), in the channel's hue.
        const categories = [...topDialog().querySelectorAll<HTMLElement>("button.section-tile-category")];
        expect(categories.map(tile => tile.getAttribute("aria-label"))).toEqual([
            "Workspace", "Utilities", "Workstation", "Equipment, Own stall", "Vehicles", "Digital Infrastructure", "Materials & Inventory", "Documents & Rights", "Human Resources", "Channel, Shopify plan"
        ]);
        expect(categories.map(tile => tile.classList.contains("section-tile-channel"))).toEqual([false, false, false, false, false, false, false, false, false, true]);
        expect(categories[9].parentElement!.getAttribute("style")).toMatch(/--strategy-theme-hue: 172/);
        openBox("Equipment");
        openBox("Production Machinery");
        // (The group holds the one card, so it floats at once.)
        expect((screen.getByRole("textbox", { name: "Resource 1 name" }) as HTMLTextAreaElement).value).toBe("Own stall");
        closeAllTiles();
        openTile("Resources");
        openBox("Channel");
        const tiles = [...topDialog().querySelectorAll<HTMLElement>("button.card-tile")];
        expect(tiles.map(tile => tile.getAttribute("aria-label"))).toEqual(["Resource 1: Shopify plan"]);
        expect(tiles.map(tile => tile.classList.contains("section-tile-channel"))).toEqual([true]);
        closeTile();
        closeTile();
        openTile("Partners & Suppliers");
        openBox("Partners");
        const partners = [...topDialog().querySelectorAll<HTMLElement>("button.card-tile")];
        expect(partners.map(tile => tile.getAttribute("aria-label"))).toEqual(["Partner 1: Courier"]);
        closeTile();
        openBox("Channel");
        const channelPartners = [...topDialog().querySelectorAll<HTMLElement>("button.card-tile")];
        expect(channelPartners.map(tile => tile.getAttribute("aria-label"))).toEqual(["Partner 1: Agency"]);
        expect(channelPartners.map(tile => tile.classList.contains("section-tile-channel"))).toEqual([true]);
    });

    it("open floating from their tile, as auto-generated cards: the name is the link to the channel, there is no x, and the rest is editable", () => {
        render(<Harness initial={value} engagement={engagement} />);

        openTile("Resources", "Equipment");
        openBox("Production Machinery");
        expect(document.querySelector(".floating-card-host")).not.toBeNull();
        expect((screen.getByRole("textbox", { name: "Resource 1 name" }) as HTMLTextAreaElement).value).toBe("Own stall");
        closeAllTiles();

        openTile("Resources", "Channel", "Shopify plan");
        const card = screen.getByRole("dialog", { name: "Resources" });
        expect(card.classList.contains("floating-card-host")).toBe(true);
        expect(within(card).queryByRole("button", { name: /^Add (?!Status)/ })).toBeNull();
        // The card, with the way back to its channel -- auto-generated: its name is plain text (no name cell) and it has no x; the rest is editable.
        // The card's title is the link to its channel.
        expect(within(card).getByRole("button", { name: /Open Channel “Online › Shop”/ }).textContent).toBe("Shopify plan");
        const head = card.querySelector(".business-capability-slot .strategy-box-head")!;
        expect(head.querySelector("textarea, input")).toBeNull();
        expect(head.querySelector(".strategy-box-remove")).toBeNull();
        expect(head.querySelector(".business-capability-child-name")!.textContent).toBe("Shopify plan");
        const status = card.querySelector<HTMLButtonElement>(".business-capability-slot .option-picker-trigger")!;
        expect(status.disabled).toBe(false);
        closeAllTiles();

        openTile("Partners & Suppliers", "Partners", "Courier");
        expect((screen.getByRole("textbox", { name: "Professional 1 name" }) as HTMLTextAreaElement).value).toBe("Courier");
        closeAllTiles();

        openTile("Partners & Suppliers", "Channel", "Agency");
        expect(screen.getByRole("dialog", { name: "Partners & Suppliers" }).querySelector(".business-capability-child-name")!.textContent).toBe("Agency");
    });

    it("are not tiled in Infrastructure: a card linked from a channel stays where it is", () => {
        const infra = { ...createBusinessResourceSlot(), name: "Card reader", status: "costs" };
        render(<Harness
            initial={{ ...base, resources: { utilities: [{ id: "premises-utilities", name: "", slots: [infra] }] } }}
            engagement={{ ...engagement, channelResources: [{ id: "l3", segmentId: "s1", channelId: "c1", resourceId: infra.id, actionIds: [] }] }}
        />);
        expect(tilesOf("Offering's Capability sections")).toEqual(["Resources", "Activities", "Partners & Suppliers", "Delivery"]);
        expect(tilesOf("Infrastructure sections")).toEqual(["Founders", "Resources", "Activities", "Partners & Suppliers"]);
        // (Infrastructure's Resources view holds the one card in the Utilities category where it was made: the category's one group has its tile, which lists it.)
        openTile("Resources", "Utilities", undefined, infrastructureCard());
        const tile = topDialog().querySelector<HTMLElement>("button.section-tile")!;
        expect(tile.getAttribute("aria-label")).toContain("Card reader");
    });

});

describe("the tiles' stylesheet", () => {

    const css = stylesheet("section-tiles.css");

    it("draws every tile a true square of one size token, left-aligned in a 12px grid of the one shape", () => {
        const global = stylesheet("global.css");
        expect(global).toMatch(/--section-tile-min: 120px;/);
        // 100cqw is the width of the tiles' own box.
        expect(css).toMatch(/\.section-tiles-box \{[^}]*container: section-tiles \/ inline-size;/);
        expect(css).toMatch(/\.section-tiles \{[^}]*grid-template-columns: repeat\(auto-fill, var\(--section-tile-size\)\);[^}]*justify-content: start;[^}]*gap: var\(--space-card\);[^}]*max-width: calc\(var\(--tile-columns, 3\) \* var\(--section-tile-size\) \+ \(var\(--tile-columns, 3\) - 1\) \* var\(--space-card\)\);/);
        expect(css).toMatch(/\.section-tile \{[^}]*width: var\(--section-tile-size\);[^}]*height: var\(--section-tile-size\);[^}]*aspect-ratio: 1 \/ 1;/);
        // The title wraps inside the square.
        expect(css).toMatch(/\.section-tile-title \{[^}]*overflow-wrap: anywhere;/);
    });

    it("sizes every dialog as the page's card area, scrolling only inside its body", () => {
        expect(css).toMatch(/width: var\(--section-dialog-width, min\(92vw, 1400px\)\);[^}]*min-height: var\(--section-dialog-height, 88vh\);/);
        expect(css).not.toMatch(/aspect-ratio: 1 \/ 1;\s*\n\s*background: color-mix/);
        expect(css).toMatch(/\.section-tile-dialog-body \{[^}]*overflow-y: auto;/);
    });

    it("draws a tile title that wraps with room between its lines (1.45), a single line unchanged", () => {
        expect(stylesheet("global.css")).toMatch(/--section-tile-line-height: 1\.45;/);
        expect(css).toMatch(/\.section-tile-title \{[^}]*line-height: var\(--section-tile-line-height\);/);
    });

    it("gives every dialog ONE solid ground, and the cards in it the same: no transparency on a frame with text", () => {
        expect(css).toMatch(/\.section-tile-dialog\.business-foundation-card \{[^}]*backdrop-filter: none;/);
        expect(css).not.toMatch(/\.section-tile-dialog\.business-foundation-card \{[^}]*transparent\);/);
        expect(css).toMatch(/\.section-tile-dialog \.business-foundation-card \{[^}]*backdrop-filter: none;/);
        // No dialog of its own look: no wide exception any more.
        expect(css).not.toMatch(/section-tile-dialog-wide/);
    });

    it("keeps page 3's heading and the cards' title rows in place and scrolls each card's body on its own", () => {
        const page = stylesheet("conversation.css");
        // The page no longer locks to the window: the area grows down and the page scrolls; no card scrolls inside.
        expect(page).toMatch(/@media \(min-width: 1212px\) and \(min-height: 560px\) ?\{[^@]*\.conversation-page:has\(\.answer-columns\.business-capability\) ?\{ ?min-height: ?100vh;/);
        expect(page).not.toMatch(/\.conversation-page:has\(\.answer-columns\.business-capability\) ?\{[^}]*overflow: ?hidden;/);
        expect(page).toMatch(/\.conversation-card \.answer-columns\.business-capability ?\{[^}]*grid-template-rows: ?auto;/);
        expect(page).toMatch(/\.answer-columns\.business-capability > \.business-foundation-card ?\{ ?max-height: ?none;/);
        expect(page).toMatch(/\.business-capability > \.business-foundation-card > \.card-scroll ?\{ ?flex: ?1 1 auto;[^}]*overflow: ?visible;/);
    });

    it("sets the page's two cards side by side in the page's two equal columns, stacked only under 1100px", () => {
        const page = stylesheet("conversation.css");
        expect(page).toMatch(/\.business-capability > \.business-foundation-card ?\{ ?grid-column: ?auto;[^}]*align-self: ?start; ?\}/);
        expect(page).toMatch(/@container page-card \(max-width: 1099\.98px\) ?\{ ?[^}]*\.business-capability > \.business-foundation-card:is\(:nth-child\(1\), :nth-child\(2\)\) ?\{ ?grid-column: ?1 \/ -1;/);
    });

    it("draws no rule down the left of a group of sections any more", () => {
        expect(stylesheet("conversation.css")).not.toMatch(/\.business-capability-group\s*\{/);
    });

    it("centres the content of every dialog across it, starting at the top", () => {
        expect(css).toMatch(/\.section-tile-dialog-body \{[^}]*justify-content: flex-start;/);
        expect(css).toMatch(/\.section-tile-dialog \.section-tiles \{[^}]*justify-content: center;[^}]*max-width: none;/);
        expect(css).toMatch(/\.card-box-open \{[^}]*width: min\(100%, var\(--open-card-width\)\);[^}]*margin-inline: auto;/);
        expect(css).not.toMatch(/\.workspace-card/);
        expect(css).toMatch(/\.founder-row \{[^}]*margin-inline: auto;/);
    });

});

describe("the page's cards and titles", () => {

    it("gives each card its column title as its one label, with no head of its own, and nothing in it folds", () => {
        render(<Harness />);
        expect(document.querySelector(".business-capability-card-head")).toBeNull();
        const cards = [...document.querySelectorAll(".business-capability > .business-foundation-card")];
        expect(cards).toHaveLength(2);
        // The title is the first thing in its card (no title row outside the cards).
        expect(cards.map(card => card.querySelector(":scope > .card-title-block .answer-column-label")?.textContent))
            .toEqual(["1.Infrastructure", "2.Offering's Capability"]);
        expect(document.querySelector(".business-capability > .answer-column-label")).toBeNull();
        // No fold arrow at all on the page itself (the tiles are the grouping), nor "Expand all".
        expect(toggles(/.*/).filter(b => !/^(Show|Hide) help for /.test(b.getAttribute("aria-label") ?? ""))).toHaveLength(0);
        expect(screen.queryByRole("button", { name: /Expand all|Collapse all/ })).toBeNull();
        // The sections have no headings on the page (their tiles stand in for them); the heading is drawn in the section's dialog.
        expect(document.querySelectorAll(".business-capability-section > .business-engagement-section-head .business-foundation-subhead")).toHaveLength(0);
        expect(document.querySelector("[data-anchor='capability-infrastructure']")).toBeTruthy();
        expect(document.querySelector("[data-anchor='capability-offering-capability']")).toBeTruthy();
    });

    it("lines up the first tile rows of the two cards with a heading-height row in Capability", () => {
        render(<Harness />);
        const spacer = document.querySelector(".business-capability-heading-spacer")!;
        expect(spacer.getAttribute("aria-hidden")).toBe("true");
        expect(spacer.nextElementSibling!.querySelector(".section-tile")).toBeTruthy();
        // (No heading-height row between the title and the tiles of the two page cards any more: the spacer is not drawn.)
        expect(stylesheet("conversation.css")).toMatch(/\.business-capability-heading-spacer ?\{\s*display: ?none;/);
        expect(stylesheet("global.css")).toMatch(/--section-head-height: 36px;/);
    });

    it("hides every title's guidance to begin with, and opens one at a time with its own arrow", () => {
        render(<Harness />);
        expect(document.querySelector(".answer-column-questions")).toBeNull();

        const first = screen.getByRole("button", { name: "Show help for Infrastructure" });
        const second = screen.getByRole("button", { name: "Show help for Offering's Capability" });
        expect(first.getAttribute("aria-expanded")).toBe("false");
        expect(second.getAttribute("aria-expanded")).toBe("false");

        fireEvent.click(first);
        const open = screen.getByRole("button", { name: "Hide help for Infrastructure" });
        expect(open.getAttribute("aria-expanded")).toBe("true");
        const help = document.getElementById(open.getAttribute("aria-controls")!)!;
        expect(help.textContent).toMatch(/Record the resources, activities, partners and suppliers/);
        // The other title is untouched.
        expect(screen.getByRole("button", { name: "Show help for Offering's Capability" }).getAttribute("aria-expanded")).toBe("false");
        expect(document.querySelectorAll(".answer-column-questions")).toHaveLength(1);

        // Opening the other closes this one: one panel at a time.
        fireEvent.click(second);
        expect(document.querySelectorAll(".answer-column-questions")).toHaveLength(1);
        expect(screen.getByRole("button", { name: "Show help for Infrastructure" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Hide help for Offering's Capability" })).toBeTruthy();

        // The arrow closes it.
        fireEvent.click(screen.getByRole("button", { name: "Hide help for Offering's Capability" }));
        expect(document.querySelectorAll(".answer-column-questions")).toHaveLength(0);
    });

    it("drops the guidance over the card, taking no room: it is absolutely positioned under the title", () => {
        render(<Harness />);
        fireEvent.click(screen.getByRole("button", { name: "Show help for Infrastructure" }));
        const panel = document.querySelector(".card-title-help")!;
        expect(panel.parentElement!.classList.contains("card-title-block")).toBe(true);
        const css = stylesheet("title-arrow.css");
        expect(css).toMatch(/\.card-title-block \{[^}]*position: relative;/);
        expect(css).toMatch(/\.card-title-block > \.card-title-help \{[^}]*position: absolute;[^}]*left: 0;[^}]*right: 0;[^}]*z-index: 20;/);
    });

    it("closes the guidance with Escape (the key goes no further) and with a press outside it", () => {
        render(<Harness />);
        const page = vi.fn();
        window.addEventListener("keydown", page);
        const arrow = () => screen.getByRole("button", { name: /help for Infrastructure/ });

        fireEvent.click(arrow());
        expect(document.querySelector(".card-title-help")).toBeTruthy();
        fireEvent.keyDown(document.body, { key: "Escape" });
        expect(document.querySelector(".card-title-help")).toBeNull();
        expect(page).not.toHaveBeenCalled();
        window.removeEventListener("keydown", page);

        fireEvent.click(arrow());
        // A press inside the panel keeps it; one outside closes it.
        fireEvent.mouseDown(document.querySelector(".card-title-help")!);
        expect(document.querySelector(".card-title-help")).toBeTruthy();
        fireEvent.mouseDown(document.body);
        expect(document.querySelector(".card-title-help")).toBeNull();
    });

    it("sizes the title arrow from the title (not the 36px fold arrow), with a hit area of at least 24px", () => {
        const css = stylesheet("title-arrow.css");
        // Three quarters of the column title's size (--font-h2, 28px on this page).
        expect(stylesheet("global.css")).toMatch(/--title-arrow-size: calc\(var\(--font-h2\) \* 0\.75\);/);
        expect(css).toMatch(/\.title-arrow \{[^}]*width: 28px;[^}]*height: 28px;/);
        expect(css).toContain("var(--title-arrow-size)");
        expect(css).toMatch(/\.card-title-row \{[^}]*gap: var\(--gap-8\);/);
    });

    it("sets the tile titles one step up the type scale, the body size (18px)", () => {
        expect(stylesheet("section-tiles.css")).toMatch(/\.section-tile \{[^}]*font-size: var\(--font-body\);/);
    });

    it("sizes every title on the type scale, in a hierarchy: page 36, column title 28, dialog title and section heading 24, tile / box / card name 18", () => {
        const global = stylesheet("global.css");
        expect(global).toMatch(/--font-h1: 36px;/);
        expect(global).toMatch(/--font-h2: 28px;/);
        expect(global).toMatch(/--font-h3: 24px;/);
        expect(global).toMatch(/--font-body: 18px;/);
        expect(global).toMatch(/--font-small: 14px;/);
        const css = stylesheet("section-tiles.css");
        expect(css).toMatch(/\.business-capability > \.business-foundation-card:not\(\.section-tile-dialog\) \.answer-column-label \{[^}]*font-size: var\(--font-h2\);/);
        expect(css).toMatch(/\.business-capability-tiles-section > \.business-engagement-section-head \.field-group-title,\s*\.section-tile-dialog-body > div > \.business-engagement-section-head \.field-group-title \{[^}]*font-size: var\(--font-h3\);/);
    });

});

describe("the dialog's square and backdrop", () => {

    it("is the page's width for every section, from the page heading's underline to the footer", () => {
        const css = stylesheet("section-tiles.css");
        expect(css).toMatch(/width: var\(--section-dialog-width, min\(92vw, 1400px\)\);[^}]*min-height: var\(--section-dialog-height, 88vh\);/);
        expect(css).toMatch(/\.section-tile-overlay-measured \{[^}]*align-items: flex-start;[^}]*padding: 0;/);
    });

    it("measures its frame from the underline of the page heading to the top of the footer, the page card area's width, at most 92% of the window's", () => {
        const line = document.createElement("div");
        line.className = "interview-divider";
        const footer = document.createElement("footer");
        footer.className = "workspace-footer";
        document.body.append(line, footer);
        line.getBoundingClientRect = () => ({ bottom: 200, top: 198 } as DOMRect);
        footer.getBoundingClientRect = () => ({ top: 900, bottom: 964 } as DOMRect);
        Object.defineProperty(window, "innerWidth", { value: 1600, configurable: true });
        Object.defineProperty(window, "innerHeight", { value: 964, configurable: true });
        // No card area: 92% of the window.
        expect(dialogFrame()).toEqual({ width: 1472, height: 688, top: 200 });
        const area = document.createElement("div");
        area.className = "conversation-card";
        area.getBoundingClientRect = () => ({ width: 1400 } as DOMRect);
        document.body.append(area);
        expect(dialogFrame()).toEqual({ width: 1400, height: 688, top: 200 });
        Object.defineProperty(window, "innerWidth", { value: 1000, configurable: true });
        expect(dialogFrame()).toEqual({ width: 920, height: 688, top: 200 });
        area.remove();
        Object.defineProperty(window, "innerWidth", { value: 1600, configurable: true });
        // Without the lines the CSS fallback applies.
        line.remove();
        expect(dialogFrame()).toBeNull();
        footer.remove();
    });

    it("closes on a click on the dimmed backdrop, not on one inside the dialog or a drag that began inside", () => {
        render(<Harness />);
        const tile = tileButton("Workspace");
        fireEvent.click(tile);
        const dialog = topDialog();
        const overlay = dialog.parentElement!;

        fireEvent.mouseDown(dialog);
        fireEvent.click(dialog);
        expect(screen.queryByRole("dialog")).toBeTruthy();

        // A press that starts inside and is released on the backdrop (a text drag) stays open.
        fireEvent.mouseDown(dialog);
        fireEvent.click(overlay);
        expect(screen.queryByRole("dialog")).toBeTruthy();

        fireEvent.mouseDown(overlay);
        fireEvent.click(overlay);
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(document.activeElement).toBe(tile);
    });

});

describe("the Founders tile: the founders are tiles, and a card opens floating, the width of any card", () => {

    it("is no exception: every dialog has the one frame, so none carries a wide class", () => {
        render(<Harness founders={3} />);
        openTile("Founders");
        expect(screen.getByRole("dialog", { name: "Founders" }).className).not.toMatch(/wide/);
        closeTile();
        // (A section view of tiles has the same frame: Infrastructure's Resources, with Utilities holding two cards.)
        cleanup();
        render(<Harness initial={twoInEach()} />);
        fireEvent.click(tileButton("Resources", infrastructureCard()));
        expect(topDialog().className).not.toMatch(/wide/);
    });

    it("shows the founders as card tiles (name and role), however many there are, with no open cards in the dialog", () => {
        for (const count of [2, 4, 9]) {
            const { unmount } = render(<Harness founders={count} />);
            openTile("Founders");
            const dialog = topDialog();
            expect(dialog.querySelector(".founder-row")).toBeNull();
            const boxes = within(dialog).getAllByRole("button", { name: /Founder Name/ });
            expect(boxes).toHaveLength(count);
            expect(boxes.every(box => box.classList.contains("section-tile"))).toBe(true);
            expect(within(dialog).queryByText("Salary")).toBeNull();
            unmount();
        }
    });

    it("pressing a founder tile opens that founder's card floating, in the card width of every other card", () => {
        render(<Harness founders={9} />);
        openTile("Founders");
        fireEvent.click(within(topDialog()).getAllByRole("button", { name: /Founder Name/ })[2]);
        const card = floatingCardHost()!;
        expect(card).toBeTruthy();
        expect(card.querySelector(".business-founder-open")).toBeTruthy();
        expect(within(card).getAllByText("Salary")).toHaveLength(1);
        expect(within(card).queryByRole("button", { name: /Maximize|Minimize/ })).toBeNull();
        // (The card is the width of any card, not a founder's own 297px.)
        expect(card.getAttribute("data-card-kind") ?? "card").toBe("card");
    });

    it("names a founder's tile for a link to it, which presses it (data-opens)", () => {
        render(<Harness founders={9} />);
        openTile("Founders");
        const box = topDialog().querySelector("[data-anchor='f4']")!;
        expect(box.hasAttribute("data-opens")).toBe(true);
    });

    it("lists each founder with the rate of their responsibilities on the Founders tile", () => {
        render(<Harness founders={3} />);
        expect(tileButton("Founders").getAttribute("aria-label")).toBe("Founders, Founder Name 1, Founder Name 2, Founder Name 3");
    });

    it("stands every text of a founder's card at ONE left edge, the numbers, bullets and fold arrows hanging left of it in a marker column", () => {
        const css = stylesheet("section-tiles.css");
        // The marker column is a single-digit head number (tabular figures, 18.3px) and the head's 8px gap; the inset keeps the 36px arrow's ring inside.
        expect(stylesheet("global.css")).toMatch(/--founder-marker: 35\.5px;/);
        expect(stylesheet("global.css")).toMatch(/--founder-inset: 4\.5px;/);
        expect(css).toMatch(/\.business-foundation-card\.business-founder-open \{[^}]*padding-left: calc\(var\(--card-padding\) \+ var\(--founder-inset\) \+ var\(--founder-marker\)\);/);
        expect(css).toMatch(/\.business-founder-open > \.strategy-box-head \{[^}]*margin-left: calc\(-1 \* var\(--founder-marker\)\);/);
        expect(css).toMatch(/\.business-founder-open > \.strategy-box-head > \.strategy-box-number > \.list-number \{[^}]*font-variant-numeric: tabular-nums;[^}]*line-height: 28px;/);
        expect(css).toMatch(/\.business-founder-open :is\(\.bullet-list-static, \.numbered-list-static\) \{[^}]*row-gap: var\(--space-row\);[^}]*line-height: var\(--section-tile-line-height\);/);
        expect(css).toMatch(/\.business-founder-open :is\(\.bullet-list-static, \.numbered-list-static\) \{[^}]*margin-left: 0;/);
        expect(css).toMatch(/\.business-founder-open \.bullet-list-static > li \{[^}]*padding-left: calc\(var\(--bullet-size\) \+ var\(--bullet-gap\)\);/);
        expect(css).toMatch(/\.business-founder-open \.numbered-list-static \{[^}]*grid-template-columns: minmax\(var\(--founder-marker\), max-content\) minmax\(0, 1fr\) auto;/);
        expect(css).toMatch(/\.business-founder-open \.numbered-list-static-text \{[^}]*padding-left: 0;/);
        // The fold arrows are the STANDARD 36px arrow (size and reactions untouched), hung so the glyph's left edge is the markers' x:
        // its box reaches 12.5px left of a closed glyph (9px of an open one).
        expect(css).toMatch(/:is\(\.business-founder-open, \.business-capability-links\) \.business-capability-responsibilities-head > \.strategy-box-toggle \{[^}]*margin-left: -12\.5px;/);
        expect(css).not.toMatch(/\.business-founder-open \.business-capability-responsibilities-head > \.strategy-box-toggle \{[^}]*width: 24px/);
        // One position for both states: the arrow does not move when it is toggled.
        expect(css).not.toMatch(/\.business-founder-open \.business-capability-responsibilities-head > \.strategy-box-toggle\[aria-expanded="true"\]/);
        // The four cells are one size (--founder-cell) in two equal columns 12px apart; the two hours labels are two lines.
        expect(stylesheet("global.css")).toMatch(/--card-cell-narrow: 108px;/);
        expect(css).toMatch(/\.business-founder-open \.business-founder-grid \{[^}]*justify-content: start;/);
        expect(css).toMatch(/\.business-founder-open \.business-founder-grid \{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
        expect(css).toMatch(/\.business-founder-open \.business-founder-grid > \.business-foundation-field:nth-child\(n\+3\) > :first-child \{[^}]*width: var\(--founder-cell\);[^}]*white-space: normal;/);
        expect(css).not.toMatch(/translate: min\(0px, calc\(var\(--founder-cell\)/);
        // "Completed N" is a block of its own, a field gap under the list above it.
        expect(css).toMatch(/\.business-founder-open \.numbered-list-static \+ \.business-capability-completed \{[^}]*margin-top: var\(--space-field\);/);
    });

});

describe("tile and dialog titles: an & never ends a line", () => {

    it("joins an & to the word after it with a no-break space, only in what is drawn", () => {
        expect(drawnTitle("Partners & Suppliers")).toBe("Partners & Suppliers");
        expect(drawnTitle("Sales & Customer")).toBe("Sales & Customer");
        expect(drawnTitle("Workspace")).toBe("Workspace");
        render(<Harness />);
        const tile = tileButton("Partners & Suppliers");
        // The accessible name starts with the plain title; the drawn text has the no-break space.
        expect(tile.getAttribute("aria-label")!.startsWith("Partners & Suppliers")).toBe(true);
        expect(tile.querySelector(".section-tile-title")!.textContent).toBe("Partners & Suppliers");
    });

});

describe("a category with several groups opens on tiles", () => {

    // (The groups are a fixed list, with no "Other" to add: a category with ONE group -- Utilities, Workstation, Equipment -- has no group tiles to choose
    // from, so it opens on that group's card tiles, numbered, directly.)
    const kinds = {
        Utilities: ["1. Mains", "2. Generator"],
        Workstation: ["1. Desk", "2. Chair"],
        Equipment: ["1. Monitor", "2. Printer"],
        Vehicles: ["Company Vehicles", "Vehicle Running Costs"],
        "Digital Infrastructure": ["Software & Web", "Cloud & Security"],
        "Documents & Rights": ["Insurances", "Licences", "Certificates", "Tickets & Trip Costs"]
    };

    /** Infrastructure's Resources view, and in it the category tile of that name (which has two cards or more). */
    const openCategory = (name: string) => {
        fireEvent.click(tileButton("Resources", infrastructureCard()));
        fireEvent.click(tileButton(name, topDialog()));
    };

    // The group tiles only (the add tile is the last one, named "Add Card"): their titles.
    const boxesIn = () => [...topDialog().querySelectorAll(".card-tile-grid > .section-tile-slot > .section-tile > .section-tile-title")]
        .map(title => title.textContent?.replace(/ /g, " "));

    it("shows a tile for each group of every category with cards, inside the category tile of the Resources view", () => {
        render(<Harness initial={twoInEach()} />);
        for (const [tile, names] of Object.entries(kinds)) {
            openCategory(tile);
            // (A category with one group shows that group's tile first: the cards are one press further in.)
            const deeper = descendSole();
            const dialog = topDialog();
            expect(boxesIn()).toEqual(names);
            // The tile component in a left-aligned 12px grid; no card is drawn yet.
            expect(dialog.querySelector(".business-capability-subsection") === null).toBe(!["Utilities", "Workstation", "Equipment"].includes(tile));
            // (Back returns to the Resources view first, then closes the dialog.)
            for (let back = 0; back < deeper; back += 1) {
                closeTile();
            }
            closeTile();
            expect(tileButton(tile)).toBeTruthy();
            closeTile();
            expect(screen.queryByRole("dialog")).toBeNull();
        }
        const css = stylesheet("section-tiles.css");
        // The founders' closed boxes keep the fixed box size; the group tiles are the page tile's size.
        expect(css).toMatch(/\.section-tiles-founders \{[^}]*--section-tile-size: var\(--section-box-size\);/);
        expect(stylesheet("global.css")).toMatch(/--section-box-size: 160px;/);
    });

    it("opens a group's card tiles in place of the grid, named as the dialog's subtitle; a card tile closes the grid and opens its card floating; Back and Escape return to the grid first, then close", () => {
        const base = asBusinessCapabilityValue(undefined);
        const slot = { ...createBusinessResourceSlot(), name: "Desk lamp" };
        const chair = { ...createBusinessResourceSlot(), name: "Chair" };
        render(<Harness initial={{ ...base, resources: { digital: [{ id: "software-web", name: "", slots: [slot, chair] }] } }} />);
        openTile("Digital Infrastructure");
        openBox("Software & Web");
        const dialog = screen.getByRole("dialog", { name: "Resources, Digital Infrastructure, Software & Web" });
        expect(dialog.querySelector(".dialog-heading-sub")!.textContent).toBe("Digital Infrastructure");
        expect(within(dialog).getByRole("button", { name: "Add Card" })).toBeTruthy();
        expect(cardBoxes()).toEqual(["Resource 1: Desk lamp", "Resource 2: Chair"]);

        // Back returns to the group tiles.
        closeTile();
        expect(screen.getByRole("dialog", { name: "Resources, Digital Infrastructure" })).toBeTruthy();
        expect(boxesIn()).toEqual(kinds["Digital Infrastructure"]);
        openBox("Software & Web");

        // A card tile: the grid closes and THAT card floats on its section part -- a card is never shown inside the dialog.
        openCard("Desk lamp");
        expect(document.querySelector(".floating-card-host")).not.toBeNull();
        const card = screen.getByRole("dialog", { name: "Resources" });
        expect(card.classList.contains("floating-card-host")).toBe(true);
        expect((screen.getByRole("textbox", { name: "Resource 1 name" }) as HTMLTextAreaElement).value).toBe("Desk lamp");
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("starts on the tiles each time the dialog opens", () => {
        render(<Harness initial={twoInEach()} />);
        // (Cloud & Security holds none: its tile makes a blank card and opens it floating; Back takes the blank card away again.)
        openTile("Digital Infrastructure", "Cloud & Security");
        closeAllTiles();
        expect(screen.queryByRole("dialog")).toBeNull();
        openTile("Digital Infrastructure");
        expect(boxesIn()).toEqual(kinds["Digital Infrastructure"]);
    });

    it("lays the tiles out as the page's tile size, the add tile (half size) apart: Utilities 1, Documents & Rights 4, the Partners category and Suppliers", () => {
        const base = asBusinessCapabilityValue(undefined);
        // (Two partners; Suppliers has its category tile too, empty.)
        render(<Harness initial={{ ...twoInEach(), offering: { ...base.offering, professionals: [createBusinessPartner("Ann"), createBusinessPartner("Bo")] } }} />);
        const tiles = () => [...topDialog().querySelectorAll<HTMLElement>(".card-tile-grid > .section-tile-slot > .section-tile")];
        const grid = () => topDialog().querySelector(".card-tile-grid") as HTMLElement;
        // (Utilities has the one group: its tile first, then its two cards as tiles.)
        openCategory("Utilities");
        expect(tiles()).toHaveLength(1);
        descendSole();
        expect(tiles()).toHaveLength(2);
        expect(grid().style.getPropertyValue("--section-tile-size")).toBe("215px");
        closeTile();
        closeTile();
        closeTile();
        openCategory("Documents & Rights");
        expect(tiles()).toHaveLength(4);
        closeTile();
        closeTile();
        // Offering's Partners & Suppliers: the Partners category tile, then the Suppliers one.
        openTile("Partners & Suppliers");
        expect(tiles().map(tile => tile.getAttribute("aria-label"))).toEqual(["Partners, Ann, Bo", "Suppliers"]);
    });

    it("has no 'Add other' tile: the groups are a fixed list, so the group tiles end with the last group, and the add tile of a group's cards (the same size) adds a card", () => {
        render(<Harness initial={twoInEach()} />);
        // A category of several groups: group tiles only, no add tile, no Other group.
        openTile("Digital Infrastructure");
        expect(within(topDialog()).queryByRole("button", { name: "Add Card" })).toBeNull();
        expect(within(topDialog()).queryByRole("button", { name: /Other/ })).toBeNull();
        expect(boxesIn()).toEqual(kinds["Digital Infrastructure"]);
        closeTile();
        closeTile();
        // A category of one group opens on that group's tile; inside it, the cards end with the add tile: it adds a card, not a group.
        openTile("Equipment");
        descendSole();
        const dialog = topDialog();
        const grid = dialog.querySelector(".card-tile-grid")!;
        const add = within(dialog).getByRole("button", { name: "Add Card" });
        expect(add.title).toBe("Add Resource");
        expect(add.classList.contains("add-card-tile")).toBe(true);
        expect(add.parentElement!.classList.contains("add-card-slot")).toBe(true);
        // After the last tile in the grid flow; no old button.
        expect(grid.lastElementChild).toBe(add.parentElement);
        expect(within(dialog).queryByRole("button", { name: "+ Add Card" })).toBeNull();
        const css = stylesheet("card-tile.css");
        // (Half of the page tile's size; no transform on hover, on hover the stroke goes and the ground is a dark tint, the + does not scale.)
        expect(css).toMatch(/\.add-card-slot \{[^}]*width: calc\(var\(--section-tile-size\) \/ 2\);[^}]*height: calc\(var\(--section-tile-size\) \/ 2\);/);
        expect(css).not.toMatch(/\.add-card-tile:focus-visible \{[^}]*transform/);
        expect(css).toMatch(/\.add-card-tile:hover:not\(:disabled\),[^{]*\{[^}]*border-color: transparent;[^}]*background: color-mix/);

        fireEvent.click(add);
        // The new card is opened at once, floating; Back takes the blank card away again while it has no name: no stray, unnamed tile is left behind.
        expect(document.querySelector(".floating-card-host")).not.toBeNull();
        expect(screen.getByRole("dialog", { name: "Resources" }).classList.contains("floating-card-host")).toBe(true);
        closeAllTiles();
        expect(screen.queryByRole("dialog")).toBeNull();
        openTile("Equipment");
        descendSole();
        expect(boxesIn()).toEqual(kinds.Equipment);
    });

    it("shows Offering's Partners as a category tile, and Infrastructure's Operational activities as one, each opening its cards", () => {
        const base = asBusinessCapabilityValue(undefined);
        const activity = (name: string) => ({ ...createBusinessActivity(), name });
        render(<Harness initial={{
            ...base,
            offering: { ...base.offering, professionals: [createBusinessPartner("Ann"), createBusinessPartner("Bo")] },
            activities: [{ id: "operational", name: "", activities: [activity("One"), activity("Two")] }]
        }} />);
        openTile("Partners & Suppliers");
        expect([...topDialog().querySelectorAll("button.section-tile")].map(tile => tile.getAttribute("aria-label"))).toEqual(["Partners, Ann, Bo", "Suppliers"]);
        // (No Channel tile while no channel made a card.)
        fireEvent.click(tileButton("Partners", topDialog()));
        expect(cardBoxes()).toEqual(["Partner 1: Ann", "Partner 2: Bo"]);
        closeTile();
        closeTile();
        // Infrastructure's Activities: Operational is a category holding ONE list of cards: no group tiles.
        openTile("Operational");
        expect(topDialog().querySelector(".section-tiles-boxes")).toBeNull();
        expect(cardBoxes()).toEqual(["Activity 1: One", "Activity 2: Two"]);
    });

});

describe("a list of cards as closed square boxes", () => {

    const many = (count: number) => Array.from({ length: count }, (_, index) => ({ ...createBusinessResourceSlot(), name: "Card " + (index + 1), status: "costs" }));
    const withResources = (count: number) => ({
        ...asBusinessCapabilityValue(undefined),
        offering: { ...asBusinessCapabilityValue(undefined).offering, resources: many(count) }
    });

    /** Offering's Resources view, and inside it the "No category" tile that holds the user's own resources with no category yet (two cards or more). */
    const openOwn = () => {
        openTile("Resources");
        fireEvent.click(tileButton("No category", topDialog()));
    };

    it("draws each card as a box with its number and name, and opens that card, fully editable, FLOATING, on pressing it", () => {
        render(<Harness initial={withResources(3)} />);
        openOwn();
        expect(cardBoxes()).toEqual(["Resource 1: Card 1", "Resource 2: Card 2", "Resource 3: Card 3"]);
        const box = topDialog().querySelector(".card-tile") as HTMLElement;
        expect(box.getAttribute("data-opens")).toBe("");
        // (An incomplete card says what it lacks after its name.)
        expect(box.getAttribute("title")).toMatch(/^Card 1. Missing: Price, Payment Frequency/);
        expect(box.classList.contains("section-tile")).toBe(true);
        // Its lines: the dates, where it belongs, then the status (Costs, no price yet).
        expect([...box.querySelectorAll(".section-tile-list > li")].map(item => item.textContent).slice(1)).toEqual(["Offering's Capability", "No category", "No group", "Costs"]);
        openCard("Card 2");
        expect(document.querySelector(".floating-card-host")).not.toBeNull();
        expect((screen.getByRole("textbox", { name: "Resource 2 name" }) as HTMLTextAreaElement).value).toBe("Card 2");
        // The x stays in the opened card; deleting closes the floating card, and the tile lists what is left.
        fireEvent.click(screen.getByRole("button", { name: /Remove Resource 2/ }));
        expect(document.querySelector(".floating-card-host")).toBeNull();
        closeAllTiles();
        expect(tileButton("Resources").getAttribute("aria-label")).toBe("Resources, Workspace, Utilities, Workstation, Equipment, Vehicles, Digital Infrastructure, and more");
        openOwn();
        expect(cardBoxes()).toEqual(["Resource 1: Card 1", "Resource 2: Card 3"]);
    });

    it("ends the boxes with the add box, which adds a card and opens it at once", () => {
        render(<Harness initial={withResources(2)} />);
        openOwn();
        const dialog = topDialog();
        const add = within(dialog).getByRole("button", { name: "Add Card" });
        expect(dialog.querySelector(".card-tile-grid")!.lastElementChild).toBe(add.parentElement);
        expect(within(dialog).queryByRole("button", { name: /^\+ Add/ })).toBeNull();
        fireEvent.click(add);
        expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Resource 3 name" }));
    });

    it("styles a completed activity as inactive, after the active ones, its number carrying on", () => {
        const initial = {
            ...asBusinessCapabilityValue(undefined),
            activities: [{
                id: "operational", name: "", activities: [
                    { ...createBusinessActivity(), name: "Done one", completed: true },
                    { ...createBusinessActivity(), name: "Open one" }
                ]
            }]
        };
        const more = { ...initial, activities: [{ ...initial.activities[0], activities: [...initial.activities[0].activities, { ...createBusinessActivity(), name: "Done two", completed: true }, { ...createBusinessActivity(), name: "Open two" }] }] };
        render(<Harness initial={more} />);
        // The category tile and its dialog hold the active ones only; the finished ones are filed under Completed.
        openTile("Operational");
        expect(cardBoxes()).toEqual(["Activity 1: Open one", "Activity 2: Open two"]);
        closeTile();
        closeTile();
        openTile("Completed");
        expect(cardBoxes()).toEqual(["Activity 1: Done one", "Activity 2: Done two"]);
        const boxes = [...topDialog().querySelectorAll(".card-tile")];
        expect(boxes.map(box => box.classList.contains("section-tile-completed"))).toEqual([true, true]);
    });

    it("shows every card as the one card tile: the page's size, in one grid from the left, the page tile's lines", () => {
        const css = stylesheet("card-tile.css");
        expect(css).toMatch(/\.card-tile-grid\.section-tiles \{[^}]*grid-template-columns: repeat\(auto-fill, var\(--section-tile-size\)\);[^}]*justify-content: start;/);
        // No parallel version of the tile is left in the section tiles' sheet.
        const tiles = stylesheet("section-tiles.css");
        expect(tiles).not.toMatch(/\.card-box-name|\.card-box-summary|\.card-boxes-grid|\.card-box-inactive|\.card-box-movable/);
    });

    it("grows a card tile 110% INWARDS from the side of its grid it stands on", () => {
        expect(inwardOrigin(0, 12, 6)).toBe("0% 0%");
        expect(inwardOrigin(5, 12, 6)).toBe("100% 0%");
        expect(inwardOrigin(2, 12, 6)).toBe("50% 0%");
        expect(inwardOrigin(6, 12, 6)).toBe("0% 100%");
        expect(inwardOrigin(8, 18, 6)).toBe("50% 50%");
        expect(inwardOrigin(0, 3, 6)).toBe("0% 50%");
    });

});

describe("a Workspace is one tidy resource card", () => {

    const seed = () => ({
        ...asBusinessCapabilityValue(undefined),
        resources: { workspace: [{ id: "premises", name: "", slots: [{ ...createBusinessResourceSlot(), id: "workspace", name: "Dedicated Workspace", workspaceKind: "dedicated" }] }] }
    });

    it("holds the Workspace fields in the normal card flow, below its name and its Category cell, with no form or card of its own", () => {
        render(<Harness initial={seed()} />);
        openTile("Workspace", undefined, "Resource 1");
        const card = topDialog();
        expect(card.querySelector(".workspace-form, .workspace-card")).toBeNull();
        const labels = () => [...card.querySelectorAll(".business-foundation-field")].map(field => field.querySelector(":scope > .business-foundation-label-info, :scope > .field-label")?.textContent?.replace(/i$/, "") ?? "");
        expect(labels()).toContain("Category");
        // (The kind list of the old form is gone: the card is the common one.)
        expect(labels()).not.toContain("Workspace");
        expect(labels()).toContain("Status");
        // (Premises, the one group of the Workspace, is shown as text under the Category.)
        expect(labels()).toContain("Group");
        // The Status-dependent fields come and go inside the card.
        fireEvent.click(within(card).getByRole("button", { name: /Resource 1 status/ }));
        fireEvent.click(screen.getByRole("option", { name: "Buy" }));
        expect(within(card).getByLabelText("Resource 1 price")).toBeTruthy();
        // (A space is bought One-time, which is implied: no Frequency is shown.)
        // (The extras of a space bought, all optional: a tick and its amount. A Deposit is the landlord's extra, not this card's.)
        expect(labels()).toEqual(expect.arrayContaining(["Price", "Commercial property tax", "Service charge"]));
        expect(labels()).not.toContain("Deposit");
        expect(labels()).not.toContain("Frequency");
        fireEvent.click(within(card).getByRole("checkbox", { name: "Commercial property tax" }));
        expect(within(card).getByLabelText("Resource 1 commercial property tax")).toBeTruthy();
    });

    it("is styled by the resource card's rules: no stylesheet rule names a Workspace form or card any more", () => {
        for (const sheet of ["section-tiles.css", "global.css", "page-3-edges.css"]) {
            expect(stylesheet(sheet)).not.toMatch(/\.workspace-(form|card)\b|--workspace-form-width/);
        }
    });

});


describe("Inventory: a tile's circle and the legend's circles never add up", () => {

    function seededProvider() {
        const base = asBusinessCapabilityValue(undefined);
        const provider = createBusinessPartner("Hackney");
        const loom = { ...createBusinessResourceSlot(), name: "Loom", status: "partners-suppliers", providerId: provider.id };
        const kettle = { ...createBusinessResourceSlot(), name: "Kettle", status: "exists" };
        return {
            ...base,
            providers: [{ ...provider, category: "suppliers", group: "business-services" }],
            resources: { equipment: [{ id: "devices-tools", name: "", slots: [loom, kettle] }] }
        };
    }
    const names = () => [...document.querySelectorAll<HTMLElement>('[aria-label="Inventory"] .card-tile')].map(tile => tile.getAttribute("aria-label")!.replace(/^[^:]*: /, "").split(",")[0]);

    it("shows the provider tile and its connected resources when its circle is pressed, even after a legend circle was pressed; the legend then clears the chip", () => {
        render(<Harness initial={seededProvider()} />);
        fireEvent.click(tileButton(/^Inventory/));
        expect(names().sort()).toEqual(["Ann", "Bo", "Hackney", "Kettle", "Loom"]);
        // A legend circle first: only the tiles connected to a provider (the Loom).
        const legend = () => screen.getByRole("group", { name: "Show only tiles with a connection" });
        fireEvent.click(within(legend()).getAllByRole("button").find(button => /supplier/i.test(button.title))!);
        expect(names()).toEqual(["Loom"]);
        const pressedLegend = () => within(legend()).getAllByRole("button").filter(button => button.getAttribute("aria-pressed") === "true");
        expect(pressedLegend()).toHaveLength(1);
        // Then the Loom tile's circle: the legend isolation goes, the tile and what it is connected to (its provider) show.
        fireEvent.click(document.querySelector<HTMLElement>('[aria-label="Inventory"] button.card-tile-symbol')!);
        expect(screen.getByText(/^Connected to /).textContent).toContain("Connected to ");
        expect(pressedLegend()).toHaveLength(0);
        const shown = names().sort();
        expect(shown).toEqual(["Hackney", "Loom"]);
        // A legend circle then clears the chip (the two are never ANDed).
        fireEvent.click(within(legend()).getAllByRole("button")[0]);
        expect(screen.queryByText(/^Connected to /)).toBeNull();
    });

});

describe("the marks on the lines of a tile's list", () => {

    const linesOf = (name: string, card = infrastructureCard()) => [...tileButton(name, card).parentElement!.querySelectorAll<HTMLElement>(".section-tile-list > li")];

    it("draws a category with no card at --list-empty-opacity (.7: 3:1 in every theme) (its text and bullet), and not one that holds a card", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{ ...base, activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity("operational"), name: "Dye" }] }] }} />);
        const lines = linesOf("Activities");
        expect(lines.map(line => [line.textContent, line.classList.contains("section-tile-list-empty")]).sort()).toEqual([
            ["Operational", false], ["Pre-Operational", true]
        ]);
        const css = stylesheet("section-tiles.css");
        expect(css.includes(".section-tile-list > li.section-tile-list-empty { opacity: var(--list-empty-opacity);")).toBe(true);
    });

    it("sets Offering's Channel line (Resources) in the channel teal, no frame, and two stacked bullets (own on top, teal under) on a Partners line holding a channel's cards", () => {
        const base = asBusinessCapabilityValue(undefined);
        const resources = [1, 2].map(index => ({ ...createBusinessResourceSlot(), name: "Res " + index }));
        const partners = [1, 2].map(index => createBusinessPartner("Agency " + index));
        const engagement = {
            segments: [{ segmentId: "s1", channels: [{ id: "c1", category: "Online", name: "Shop", actionIds: {} }] }],
            channelResources: [
                { id: "l1", segmentId: "s1", channelId: "c1", resourceId: resources[1].id, actionIds: [] },
                { id: "l2", segmentId: "s1", channelId: "c1", resourceId: partners[1].id, actionIds: [] }
            ]
        };
        render(<Harness initial={{ ...base, offering: { ...base.offering, resources, professionals: partners } }} engagement={engagement} />);
        const resourceLines = linesOf("Resources", offeringCard());
        // (The cards with no category stand in "No category", then the Channel line, then the nine categories, which hold no card.)
        expect(resourceLines.map(line => line.textContent)).toEqual([
            "No category", "Channel", "Workspace", "Utilities", "Workstation", "Equipment", "Vehicles", "Digital Infrastructure", "Materials & Inventory", "Documents & Rights", "Human Resources"
        ]);
        expect(resourceLines.map(line => line.classList.contains("section-tile-list-teal"))).toEqual([false, true, false, false, false, false, false, false, false, false, false]);
        const partnerLines = linesOf("Partners & Suppliers", offeringCard());
        expect(partnerLines.some(line => line.classList.contains("section-tile-list-channel"))).toBe(true);
        // Infrastructure's lists carry neither mark.
        expect(linesOf("Resources").some(line => line.classList.contains("section-tile-list-teal") || line.classList.contains("section-tile-list-channel"))).toBe(false);
        const css = stylesheet("section-tiles.css");
        // (Teal text and bullet; the second bullet right under the first in the one bullet column, taking no room: no padding rule for it.)
        expect(css.includes(".section-tile-list > li.section-tile-list-teal .section-tile-link { color: var(--channel-marker);")).toBe(true);
        expect(css.includes("li.section-tile-list-channel::after { content: \"\"; position: absolute; left: 0;")).toBe(true);
        expect(css.includes("li.section-tile-list-channel::before { top: calc((var(--section-tile-line-height) * 1em - var(--bullet-size) * 2 - 2px) / 2);")).toBe(true);
        expect(css).not.toMatch(/data-markers/);
    });

});

describe("the slide of a long title", () => {

    const title = () => tileButton("Activities", infrastructureCard()).querySelector<HTMLElement>(".section-tile-title")!;

    const cut = (node: HTMLElement) => {
        Object.defineProperty(node, "scrollWidth", { configurable: true, value: 250 });
        Object.defineProperty(node, "clientWidth", { configurable: true, value: 200 });
    };

    // (Each frame runs at once, a full second on: the slide is over.)
    const instantFrames = () => {
        vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(performance.now() + 5000); return 1; });
        vi.stubGlobal("cancelAnimationFrame", () => undefined);
    };

    it("slides a title cut by an ellipsis to its end while the pointer is over its tile, and back when it leaves", () => {
        instantFrames();
        render(<Harness />);
        const node = title();
        cut(node);
        const slot = node.closest<HTMLElement>(".section-tile-slot")!;
        fireEvent.pointerEnter(slot);
        // (Exactly the cut part: the last letter ends at the title's right edge, with no ellipsis while it is there.)
        expect(node.scrollLeft).toBe(50);
        expect(node.style.textOverflow).toBe("clip");
        fireEvent.pointerLeave(slot);
        expect(node.scrollLeft).toBe(0);
        expect(node.style.textOverflow).toBe("");
        vi.unstubAllGlobals();
    });

    it("does not move a title that fits; one that is cut slides whatever the motion setting (it moves only under the pointer, and is the one way to read it)", () => {
        instantFrames();
        vi.stubGlobal("matchMedia", (query: string) => ({ matches: query.includes("reduce"), media: query, addEventListener: () => undefined, removeEventListener: () => undefined }));
        render(<Harness />);
        const node = title();
        const slot = node.closest<HTMLElement>(".section-tile-slot")!;
        fireEvent.pointerEnter(slot);
        expect(node.scrollLeft).toBe(0);
        cut(node);
        fireEvent.pointerEnter(slot);
        expect(node.scrollLeft).toBe(50);
        expect(node.title).toBe("Activities");
        vi.unstubAllGlobals();
    });

    it("keeps the title's box: the slide is a scroll, so its size and place are the same", () => {
        const css = stylesheet("section-tiles.css");
        const rule = css.slice(css.indexOf(".section-tile-title {"), css.indexOf("}", css.indexOf(".section-tile-title {")));
        expect(rule).toMatch(/overflow: hidden;/);
        expect(rule).toMatch(/white-space: nowrap;/);
    });

});

describe("the Inventory funnel menu", () => {

    const openFunnel = () => {
        fireEvent.click(tileButton(/^Inventory/));
        fireEvent.click(screen.getByRole("button", { name: /Sort all tiles/i }));
        return document.querySelector<HTMLElement>(".strategy-sort-menu-wide")!;
    };

    it("has the cost order as two small arrow buttons beside Costs (up: low to high, down: high to low), From / To cells, and the tick Linked", () => {
        render(<Harness />);
        const menu = openFunnel();
        const order = [...menu.querySelectorAll<HTMLElement>(".capability-overview-costs-head .capability-overview-costs-order button")];
        expect(order.map(button => [button.textContent, button.getAttribute("aria-label"), button.title])).toEqual([["↑", "Low to high", "Low to high"], ["↓", "High to low", "High to low"]]);
        expect(order.map(button => button.getAttribute("aria-pressed"))).toEqual(["false", "false"]);
        fireEvent.click(order[1]);
        expect(order.map(button => button.getAttribute("aria-pressed"))).toEqual(["false", "true"]);
        expect(menu.querySelector(".capability-overview-costs-head")!.textContent).toContain("Costs");
        expect([...menu.querySelectorAll(".capability-overview-costs-range label")].map(label => label.firstChild!.textContent!.trim())).toEqual(["From", "To"]);
        expect(within(menu).getByLabelText("Connected: Linked")).toBeTruthy();
    });

    it("orders its blocks Include, Sort, Belongs to, then Status / Linked / Costs, all three labelled blocks folded at first, each arrow right after its label", () => {
        render(<Harness />);
        const menu = openFunnel();
        const heads = [...menu.querySelectorAll<HTMLElement>(".capability-overview-menu-head")];
        expect(heads.map(head => head.querySelector("strong")!.textContent)).toEqual(["Include", "Sort", "Belongs to", "Columns"]);
        // (The arrow is the label's next sibling in one row that starts at the left.)
        expect(heads.every(head => head.querySelector("strong")!.nextElementSibling === head.querySelector("button"))).toBe(true);
        expect(stylesheet("capability-overview.css").includes(".capability-overview-menu-head { justify-content: flex-start; }")).toBe(true);
        const arrows = heads.map(head => head.querySelector<HTMLElement>(".label-arrow")!);
        expect(arrows.map(arrow => arrow.getAttribute("aria-label"))).toEqual(["Unfold Include", "Unfold Sort", "Unfold Belongs to", "Unfold Columns"]);
        expect(arrows.every(arrow => arrow.tagName === "BUTTON" && arrow.getAttribute("aria-expanded") === "false")).toBe(true);
        expect(within(menu).queryByLabelText("Include: Founders")).toBeNull();
        expect(menu.querySelectorAll(".strategy-sort-option")).toHaveLength(0);
        expect(within(menu).queryByLabelText("Belongs to: Infrastructure")).toBeNull();
        // The other blocks stay: Linked, Costs.
        expect(within(menu).getByLabelText("Costs: Costs")).toBeTruthy();
        fireEvent.click(within(menu).getByRole("button", { name: "Unfold Include" }));
        expect(within(menu).getByLabelText("Include: Founders")).toBeTruthy();
        expect(within(menu).getByRole("button", { name: "Fold Include" }).getAttribute("aria-expanded")).toBe("true");
        fireEvent.click(within(menu).getByRole("button", { name: "Unfold Sort" }));
        expect(menu.querySelectorAll(".strategy-sort-option").length).toBeGreaterThan(0);
        // (The orders come right after Include in the menu, before Belongs to.)
        const order = [...menu.querySelectorAll<HTMLElement>("strong, .strategy-sort-option")].map(node => node.textContent);
        expect(order.indexOf("Sort")).toBeGreaterThan(order.indexOf("Include"));
        expect(order.indexOf("Belongs to")).toBeGreaterThan(order.findIndex(text => (text ?? "").includes("Page order")));
        fireEvent.click(within(menu).getByRole("button", { name: "Unfold Belongs to" }));
        expect(within(menu).getByLabelText("Belongs to: Infrastructure")).toBeTruthy();
    });

    it("lays out the tick boxes on their label's centre line (no margin of their own)", () => {
        const css = stylesheet("capability-overview.css");
        expect(css.includes(".capability-overview-menu .business-foundation-tick { align-items: center; }")).toBe(true);
        expect(css.includes(".capability-overview-menu label.business-foundation-tick > input[type=\"checkbox\"] { margin-top: 0; margin-bottom: 0; }")).toBe(true);
    });

    it("spaces its rows with the rulebook's two tokens only: 12px between blocks and around labels, 6px between ticks, label and control", () => {
        const css = stylesheet("capability-overview.css");
        expect(css.includes(".capability-overview-menu { gap: var(--space-field); padding: var(--space-field); }")).toBe(true);
        expect(css.includes(".capability-overview-menu-body, .capability-overview-menu-sub, .capability-overview-menu-fields, .capability-overview-costs { display: flex; flex-direction: column; gap: var(--space-label); }")).toBe(true);
        expect(css.includes(".capability-overview-costs-order, .capability-overview-costs-range { display: flex; flex-wrap: nowrap; align-items: flex-end; gap: var(--space-label); }")).toBe(true);
        expect(stylesheet("conversation.css").includes("width:250px;")).toBe(true);
    });

});

describe("the Inventory table", () => {

    const row = (fields: Record<string, unknown>) => ({
        id: "r", tone: "infrastructure", kind: "resource", name: "Loom", path: ["Infrastructure", "Equipment", "Specialized"],
        status: "costs", statusLabel: "Costs", frequency: "one-time", frequencyLabel: "One-time", amount: 7200, links: [], ...fields
    }) as never;

    it("maps a card to Section, Category, Group, Cost and Frequency, one line for one cost", () => {
        expect(tableRows(row({}))).toEqual([{ type: "Resource", section: "Infrastructure", category: "Equipment", group: "Specialized", status: "Costs", cost: "7200", frequency: "One-time", nature: "", behaviour: "" }]);
        expect(tableRows(row({ path: ["Offering's Capability", "Resources"] }))[0]).toMatchObject({ section: "Offering", category: "Resources", group: "" });
    });

    it("gives a card with a second cost (a Workspace deposit) a second line: the deposit, \"Deposit\" after its amount, one-time", () => {
        const lines = tableRows(row({ deposit: 3750 }));
        expect(lines).toHaveLength(2);
        expect(lines[1]).toMatchObject({ cost: "3750 Deposit", frequency: "One-time", category: "Equipment" });
        // (A deposit with no price is the card's only line.)
        expect(tableRows(row({ amount: null, deposit: 3750 }))).toHaveLength(1);
    });

    it("fills a Legal Entity expense with Section Legal Entity, Type Expense, name, cost and frequency only", () => {
        const [line] = tableRows(row({ kind: "legal", path: ["Identity System", "Legal Entity", "Expenses"], status: "", statusLabel: "", amount: 120, frequency: "annually", frequencyLabel: "Annually" }));
        expect(line).toEqual({ type: "Expense", section: "Legal Entity", category: "", group: "", status: "", cost: "120", frequency: "Annually", nature: "", behaviour: "" });
    });

    it("shows the eleven columns in order, the second cost's line dimmed with the name repeated, the links as bullets only (their text a tooltip)", () => {
        const base = asBusinessCapabilityValue(undefined);
        const loom = { ...createBusinessResourceSlot(), name: "Loom", status: "partners-suppliers", providerId: "p1" };
        render(<Harness initial={{ ...base, providers: [{ ...createBusinessPartner("Hackney"), id: "p1", category: "suppliers", group: "business-services" }], resources: { equipment: [{ id: "devices-tools", name: "", slots: [loom] }] } }} />);
        fireEvent.click(tileButton(/^Inventory/));
        fireEvent.click(screen.getByRole("button", { name: "Table" }));
        const table = document.querySelector(".capability-overview-table")!;
        expect([...table.querySelectorAll("th[scope=col]")].map(head => head.textContent)).toEqual(["Name", "Type", "Section", "Category", "Group", "Cost", "Frequency", "Cost Nature", "Behaviour", "Status", "Linked"]);
        const linked = table.querySelector("tbody tr td:last-child")!;
        expect(linked.textContent).toBe("");
        const bullets = [...linked.querySelectorAll<HTMLElement>(".card-tile-symbol")];
        expect(bullets.length).toBeGreaterThan(0);
        // (Their text is the app's tooltip above the circle, not a title.)
        expect(bullets[0].getAttribute("title")).toBeNull();
        fireEvent.mouseEnter(bullets[0]);
        expect(screen.getByRole("tooltip").textContent).toMatch(/Hackney/);
        fireEvent.mouseLeave(bullets[0]);
        expect(screen.queryByRole("tooltip")).toBeNull();
        const css = stylesheet("capability-overview.css");
        expect(css).toMatch(/\.capability-overview-table-extra td \{\s*color: color-mix\(in srgb, var\(--table-ink\) 72%, transparent\);/);
    });

});

describe("the lines of channel-made cards", () => {

    it("sets the line of a card a Customer Channel made (its text and bullet) in the channel teal in a category tile's list, and not the others", () => {
        const base = asBusinessCapabilityValue(undefined);
        const partners = [1, 2].map(index => ({ ...createBusinessPartner("Courier " + index), category: "suppliers", group: "contractors-advisers" }));
        const engagement = {
            segments: [{ segmentId: "s1", channels: [{ id: "c1", category: "Online", name: "Shop", actionIds: {} }] }],
            channelResources: [{ id: "l1", segmentId: "s1", channelId: "c1", resourceId: partners[1].id, actionIds: [] }]
        };
        render(<Harness initial={{ ...base, offering: { ...base.offering, providers: partners } }} engagement={engagement} />);
        fireEvent.click(tileButton("Partners & Suppliers", offeringCard()));
        const lines = [...document.querySelectorAll<HTMLElement>(".section-tile-dialog .section-tile-category ~ .section-tile-links-layer .section-tile-list > li")];
        const teal = lines.filter(line => line.classList.contains("section-tile-list-teal")).map(line => line.textContent);
        expect(teal).toContain("Courier 2");
        expect(teal).not.toContain("Courier 1");
        const css = stylesheet("section-tiles.css");
        expect(css.includes(".section-tile-list > li.section-tile-list-teal:not(.section-tile-list-alert) { color: var(--channel-marker);") || css.includes(".section-tile-list > li.section-tile-list-teal:not(.section-tile-list-alert), .section-tile-list > li.section-tile-list-teal:not(.section-tile-list-alert) .section-tile-link { color: var(--channel-marker);")).toBe(true);
    });

});

describe("the Channel group", () => {

    const base = {
        id: "r", kind: "provider", name: "DPD", path: ["Offering's Capability", "Providers"], status: "", statusLabel: "", frequency: "", frequencyLabel: "", amount: 5, links: []
    };
    const channel = { ...base, tone: "channel" } as never;
    const own = { ...base, id: "q", name: "Flame", tone: "offering" } as never;

    it("reads Channel in the Group column and as the last line of a tile for a card of the Customer Channel (Section, Type and Category keep their values)", () => {
        expect(tableRows(channel)[0]).toMatchObject({ type: "Supplier", section: "Offering", category: "Providers", group: "Channel" });
        expect(tableRows(own)[0]).toMatchObject({ category: "Providers", group: "" });
        expect(belongsLines(channel)).toEqual(["Offering's Capability", "Providers", "Channel"]);
        expect(belongsLines(own)).toEqual(["Offering's Capability", "Providers"]);
        // (An activity's third line is its category: Channel follows it.)
        expect(belongsLines({ ...base, kind: "activity", path: ["Offering's Capability", "Activities", "Production"], tone: "channel" } as never)).toEqual(["Offering's Capability", "Activities", "Production", "Channel"]);
    });

    it("offers Channel as a Group under the category of the channel's cards, and narrows to them when ticked", () => {
        const rows = [channel, own];
        expect(floorSubgroups(rows, "offering", ["Providers"])).toEqual([{ key: subgroupKey("Providers", "Channel"), label: "Channel" }]);
        const shown = (subgroups: string[]) => filterFloor(rows, { ...DEFAULT_FLOOR_FILTER, place: "offering", categories: ["Providers"], subgroups }).map(row => row.name);
        expect(shown([])).toEqual(["DPD", "Flame"]);
        expect(shown([subgroupKey("Providers", "Channel")])).toEqual(["DPD"]);
    });

});

describe("the table mode: surface, columns, sizes", () => {

    const openTable = () => {
        fireEvent.click(tileButton(/^Inventory/));
        fireEvent.click(screen.getByRole("button", { name: "Table" }));
        return document.querySelector<HTMLElement>(".capability-overview-table")!;
    };
    const heads = (table: HTMLElement) => [...table.querySelectorAll("thead th")].map(head => head.textContent);

    it("hides and shows the columns from the COLUMNS block (Name always shown), Status and Linked off while the Costs isolation is on", () => {
        const base = asBusinessCapabilityValue(undefined);
        const priced = { ...createBusinessResourceSlot(), name: "Loom", status: "costs", cost: { price: "10", frequency: "monthly", frequencyOther: "", currency: "" } };
        render(<Harness initial={{ ...base, resources: { equipment: [{ id: "devices-tools", name: "", slots: [priced] }] } }} />);
        const table = openTable();
        expect(heads(table)).toEqual(["Name", "Type", "Section", "Category", "Group", "Cost", "Frequency", "Cost Nature", "Behaviour", "Status", "Linked"]);
        fireEvent.click(screen.getByRole("button", { name: /Sort all tiles/i }));
        const menu = document.querySelector<HTMLElement>(".strategy-sort-menu-wide")!;
        fireEvent.click(within(menu).getByRole("button", { name: "Unfold Columns" }));
        expect(within(menu).queryByLabelText("Column: Name")).toBeNull();
        fireEvent.click(within(menu).getByLabelText("Column: Group"));
        expect(heads(document.querySelector<HTMLElement>(".capability-overview-table")!)).not.toContain("Group");
        fireEvent.click(within(menu).getByLabelText("Costs: Costs"));
        const costs = heads(document.querySelector<HTMLElement>(".capability-overview-table") ?? table);
        expect(costs).not.toContain("Status");
        expect(costs).not.toContain("Linked");
        fireEvent.click(within(menu).getByLabelText("Column: Status"));
        expect(heads(document.querySelector<HTMLElement>(".capability-overview-table") ?? table)).toContain("Status");
    });

    it("sizes the table's text in three steps of the type scale with the A- / A+ buttons, 14px by default below 1600 wide", () => {
        Object.defineProperty(window, "innerWidth", { configurable: true, value: 1366 });
        render(<Harness />);
        const table = openTable();
        const size = () => document.querySelector<HTMLElement>(".capability-overview-table")!.getAttribute("data-size");
        expect(size()).toBe("small");
        expect(table.style.getPropertyValue("--table-font")).toBe("var(--font-small)");
        fireEvent.click(screen.getByRole("button", { name: "Larger text" }));
        expect(size()).toBe("body");
        fireEvent.click(screen.getByRole("button", { name: "Larger text" }));
        expect(size()).toBe("large");
        expect((screen.getByRole("button", { name: "Larger text" }) as HTMLButtonElement).disabled).toBe(true);
        fireEvent.click(screen.getByRole("button", { name: "Smaller text" }));
        expect(size()).toBe("body");
    });

    it("draws the table on an opaque calm surface per theme with a sticky heading", () => {
        const css = stylesheet("capability-overview.css");
        for (const theme of ["dark", "sepia"]) {
            expect(css.includes(":root[data-theme=\"" + theme + "\"] { --table-ground:")).toBe(true);
        }
        expect(css.includes(".capability-overview-table-mode .capability-overview-scroll { padding: 0 0 12px; border-radius: var(--radius-lg); background: var(--table-ground); color: var(--table-ink); }")).toBe(true);
        expect(css.includes(".capability-overview-table thead th { position: sticky; top: 0; z-index: 2; background: var(--table-ground);")).toBe(true);
        expect(css.includes(".capability-overview-table tbody tr:nth-child(even) > * { background: var(--table-tint); }")).toBe(true);
    });

});

describe("the app header over the page's layers", () => {

    it("is never made inert by a dialog, though the page around it is, and the header z-order rule is in the stylesheet", () => {
        const root = document.createElement("div");
        const header = document.createElement("header");
        header.className = "app-header";
        const page = document.createElement("div");
        root.append(header, page);
        document.body.append(root);
        render(<Harness />, { container: page });
        fireEvent.click(tileButton("Activities", infrastructureCard()));
        expect(document.querySelector(".section-tile-dialog")).not.toBeNull();
        expect(header.closest("[inert]")).toBeNull();
        expect(root.hasAttribute("inert")).toBe(false);
        expect(page.hasAttribute("inert")).toBe(true);
        expect(stylesheet("app-header.css").includes("body:has(.section-tile-overlay) .app-header { z-index: 1001; }")).toBe(true);
        closeAllTiles();
        expect(page.hasAttribute("inert")).toBe(false);
        root.remove();
    });

    it("lets a press or an Escape in the header alone: a press there does not close a floating card, an Escape typed there with Notes open is Notes\u2019", () => {
        const root = document.createElement("div");
        const header = document.createElement("header");
        header.className = "app-header";
        const panel = document.createElement("section");
        panel.className = "notepad-panel";
        const note = document.createElement("textarea");
        panel.append(note);
        header.append(panel);
        const page = document.createElement("div");
        root.append(header, page);
        document.body.append(root);
        render(<Harness initial={{ ...asBusinessCapabilityValue(undefined), activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity("operational"), name: "Dye" }] }] }} />, { container: page });
        fireEvent.click(tileButton("Activities", infrastructureCard()));
        fireEvent.click(screen.getAllByRole("button").find(button => /Dye/.test(button.textContent ?? "") && button.classList.contains("section-tile-link"))!);
        expect(document.querySelector(".floating-overlay")).not.toBeNull();
        fireEvent.mouseDown(note);
        expect(document.querySelector(".floating-overlay")).not.toBeNull();
        fireEvent.keyDown(note, { key: "Escape" });
        expect(document.querySelector(".floating-overlay")).not.toBeNull();
        // (With nothing open in the header, the same key closes the layers.)
        panel.remove();
        fireEvent.keyDown(header, { key: "Escape" });
        closeAllTiles();
        root.remove();
    });

});

void openCard;

describe("tailPlacement", () => {
    it("puts the tail tile right of the last tile of a 2 x 2 square, in a third column", () => {
        expect(tailPlacement(4, 2)).toEqual({ row: 2, column: 3, columns: 3 });
    });
    it("fills the first free cell of a short last row", () => {
        expect(tailPlacement(5, 3)).toEqual({ row: 2, column: 3, columns: 3 });
    });
    it("starts a new row when the last row is full and wide", () => {
        expect(tailPlacement(6, 3)).toEqual({ row: 3, column: 1, columns: 3 });
    });
});

describe("THE CAROUSEL ARROWS beside the card or the section opened last", () => {

    it("goes to the next and the previous card of the tile, round its ends", () => {
        render(<Harness initial={twoInEach()} />);
        openTile("Utilities");
        openCard("Mains");
        const name = () => (screen.getByRole("textbox", { name: /Resource \d+ name/ }) as HTMLTextAreaElement).value;
        expect(name()).toBe("Mains");
        fireEvent.click(screen.getByRole("button", { name: "Next card" }));
        expect(name()).toBe("Generator");
        fireEvent.click(screen.getByRole("button", { name: "Next card" }));
        expect(name()).toBe("Mains");
        fireEvent.click(screen.getByRole("button", { name: "Previous card" }));
        expect(name()).toBe("Generator");
    });

    it("goes through the sections from an opened section, and leaves the dialog's own arrows out of sight under a card", () => {
        render(<Harness initial={twoInEach()} />);
        openTile("Resources");
        const title = () => document.querySelector(".section-tile-dialog-name")?.textContent;
        expect(title()).toBe("Resources");
        fireEvent.click(screen.getByRole("button", { name: "Next section" }));
        expect(title()).toBe("Activities");
        fireEvent.click(screen.getByRole("button", { name: "Previous section" }));
        expect(title()).toBe("Resources");
    });

});
