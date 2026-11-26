import { inwardOrigin } from "./CardTile";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import BusinessCapabilityEditor from "../editors/BusinessCapabilityEditor";
import { cardBoxes, closeAllTiles, closeTile, descendSole, infrastructureCard, offeringCard, openBox, openCard, openTile, tileButton, topDialog } from "../../../test/interviewTestUtils";
import { asBusinessCapabilityValue, createBusinessActivity, createBusinessPartner, createBusinessResourceSlot } from "../../../framework/engine/answers/AnswerUtils";
import { stylesheet } from "../../../test/stylesheet";
import SectionTiles, { drawnTitle, gridColumns, tileName } from "./SectionTiles";

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
        expect(tilesOf("Offering's Capability sections")).toEqual(["Resources", "Activities", "Partners & Suppliers", "Capacity & Delivery"]);
        // Only "Inventory" until an activity is completed.
        expect(within(document.querySelector(".section-tiles-completed") as HTMLElement).getAllByRole("button").map(button => button.getAttribute("aria-label")?.split(",")[0])).toEqual(["Inventory"]);
        cleanup();
        render(<Harness initial={{ ...base, offering: { ...base.offering, activities: [{ ...createBusinessActivity(), name: "Finished", completed: true }] } }} />);
        // Still four tiles in the section; the Completed tile is not in either section's group.
        expect(tilesOf("Offering's Capability sections")).toEqual(["Resources", "Activities", "Partners & Suppliers", "Capacity & Delivery"]);
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
        expect(tilesOf("Offering's Capability sections")).toEqual(["Resources", "Activities", "Partners & Suppliers", "Capacity & Delivery"]);
        expect(across("Offering's Capability sections")).toBe("2");
    });

});

describe("MASTER TILES NEVER CHANGE THEIR SIZES, AND LAYOUT (owner, 2026-11-09)", () => {

    const masters = (count: number, large = true) => Array.from({ length: count }, (_, at) => ({ id: "t" + at, title: "Tile " + at, items: [], large, content: () => null }));
    const box = () => document.querySelector<HTMLElement>(".section-tiles-box")!;
    const places = () => [...document.querySelectorAll<HTMLElement>(".section-tile-slot")].map(slot => slot.getAttribute("data-row") + ":" + slot.getAttribute("data-column"));

    it("draws a chapter of three large tiles as the 2 x 2 of four, its fourth place empty, at the size of four", () => {
        render(<SectionTiles hue={150} label="Three" tiles={masters(3)} />);
        expect(box().classList.contains("section-tiles-quad")).toBe(true);
        expect(across("Three")).toBe("2");
        expect(places()).toEqual(["0:0", "0:1", "1:0"]);
        cleanup();
        render(<SectionTiles hue={150} label="Four" tiles={masters(4)} />);
        expect(box().classList.contains("section-tiles-quad")).toBe(true);
        expect(across("Four")).toBe("2");
    });

    it("keeps three tiles that are not master tiles in one row of the page's small size", () => {
        render(<SectionTiles hue={150} label="Small" tiles={masters(3, false)} />);
        expect(box().classList.contains("section-tiles-quad")).toBe(false);
        expect(across("Small")).toBe("3");
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
        const delivery = tileButton("Capacity & Delivery");
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
        for (const [none, card] of [["Founders", infrastructureCard()], ["Capacity & Delivery", offeringCard()]] as const) {
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
        expect(within(dialog).queryByRole("button", { name: /Maximise|Minimise/ })).toBeNull();
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
        // (And never less than its words with 12px round them: owner, 2026-11-26.)
        expect(css).toMatch(/\.add-card-slot \{[^}]*width: max\(calc\(var\(--section-tile-size\) \/ 2\), var\(--add-card-room\)\);[^}]*height: max\(calc\(var\(--section-tile-size\) \/ 2\), var\(--add-card-room\)\);/);
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
        expect([...box.querySelectorAll(".section-tile-list > li")].map(item => item.textContent).slice(1)).toEqual(["Offering", "No category", "No group", "Costs"]);
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
        for (const sheet of ["section-tiles.css", "global.css", "capability-edges.css"]) {
            expect(stylesheet(sheet)).not.toMatch(/\.workspace-(form|card)\b|--workspace-form-width/);
        }
    });

});

describe("the marks on the lines of a tile's list", () => {

    const linesOf = (name: string, card = infrastructureCard()) => [...tileButton(name, card).parentElement!.querySelectorAll<HTMLElement>(".section-tile-list > li")];

    it("draws a category with no card in the muted ink (4.5:1 on every tile ground, never by opacity) (its text and bullet), and not one that holds a card", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{ ...base, activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity("operational"), name: "Dye" }] }] }} />);
        const lines = linesOf("Activities");
        expect(lines.map(line => [line.textContent, line.classList.contains("section-tile-list-empty")]).sort()).toEqual([
            ["Operational", false], ["Pre-Operational", true]
        ]);
        const css = stylesheet("section-tiles.css");
        expect(css).toMatch(/\.section-tile-list > li\.section-tile-list-empty,\s*\.section-tile-list > li\.section-tile-list-empty \.section-tile-link \{ color: var\(--text-muted\);/);
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
        expect(css.includes("li.section-tile-list-channel::before { top: calc((var(--tile-row) - var(--bullet-size) * 2 - 2px) / 2);")).toBe(true);
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
        // (In a dialog one line, sliding (owner, 2026-10-15); a Master Tile's title on the page wraps to three lines: layout rules sections 8 and 9.)
        const quad = css.slice(css.indexOf(".section-tiles-quad .section-tile-title {"), css.indexOf("}", css.indexOf(".section-tiles-quad .section-tile-title {")));
        expect(quad).toMatch(/white-space: normal;/);
        expect(quad).toMatch(/-webkit-line-clamp: 3;/);
    });

});
