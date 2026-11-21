import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import BusinessCapabilityEditor from "../editors/BusinessCapabilityEditor";
import { closeAllTiles, closeTile, infrastructureCard, offeringCard, openBox, openTile, tileButton, topDialog } from "../../../test/interviewTestUtils";
import { asBusinessCapabilityValue, createBusinessPartner, createBusinessResourceSlot } from "../../../framework/engine/answers/AnswerUtils";
import { stylesheet } from "../../../test/stylesheet";
import { tableRows } from "./CapabilityOverview";
import { belongsLines, floorSubgroups, filterFloor, DEFAULT_FLOOR_FILTER, subgroupKey } from "./capabilityFloor";

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
        expect(tilesOf("Offering's Capability sections")).toEqual(["Resources", "Activities", "Partners & Suppliers", "Capacity & Delivery"]);
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
        expect(tilesOf("Offering's Capability sections")).toEqual(["Resources", "Activities", "Partners & Suppliers", "Capacity & Delivery"]);
        expect(tilesOf("Infrastructure sections")).toEqual(["Founders", "Resources", "Activities", "Partners & Suppliers"]);
        // (Infrastructure's Resources view holds the one card in the Utilities category where it was made: the category's one group has its tile, which lists it.)
        openTile("Resources", "Utilities", undefined, infrastructureCard());
        const tile = topDialog().querySelector<HTMLElement>("button.section-tile")!;
        expect(tile.getAttribute("aria-label")).toContain("Card reader");
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
        fireEvent.click(within(legend()).getAllByRole("button").find(button => /supplier/i.test(button.getAttribute("aria-label") ?? ""))!);
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

describe("the Inventory funnel menu", () => {

    const openFunnel = () => {
        fireEvent.click(tileButton(/^Inventory/));
        fireEvent.click(screen.getByRole("button", { name: /Sort all tiles/i }));
        return document.querySelector<HTMLElement>(".strategy-sort-menu-wide")!;
    };

    it("stands in three groups -- Show, Order, Table (the Table in the Table view only) -- with From / To only while Costs is ticked, and the tick Linked (owner, 2026-11-14 18:17)", () => {
        render(<Harness />);
        const menu = openFunnel();
        // (The tiles: no Table group.)
        expect([...menu.querySelectorAll(".capability-overview-menu-section-title")].map(title => title.textContent)).toEqual(["Show", "Order"]);
        expect(menu.querySelectorAll(".capability-overview-costs-range label")).toHaveLength(0);
        fireEvent.click(within(menu).getByLabelText("Costs: Costs"));
        expect([...menu.querySelectorAll(".capability-overview-costs-range label")].map(label => label.firstChild!.textContent!.trim())).toEqual(["From", "To"]);
        // (The tick Linked stands only where a card is linked: these cards are not; owner, 2026-11-14 13:54.)
        expect(within(menu).queryByLabelText("Connected: Linked")).toBeNull();
    });

    it("orders its blocks Include, Sort, Belongs to, then Status / Linked / Costs, all three labelled blocks folded at first, each arrow right after its label", () => {
        render(<Harness />);
        const menu = openFunnel();
        const heads = [...menu.querySelectorAll<HTMLElement>(".capability-overview-menu-head")];
        expect(heads.map(head => head.querySelector("strong")!.textContent)).toEqual(["Include", "Belongs to", "Sort"]);
        // (The arrow is the label's next sibling in one row that starts at the left.)
        expect(heads.every(head => head.querySelector("strong")!.nextElementSibling === head.querySelector("button"))).toBe(true);
        expect(stylesheet("capability-overview.css").includes(".capability-overview-menu-head { justify-content: flex-start; }")).toBe(true);
        const arrows = heads.map(head => head.querySelector<HTMLElement>(".label-arrow")!);
        expect(arrows.map(arrow => arrow.getAttribute("aria-label"))).toEqual(["Unfold Include", "Unfold Belongs to", "Unfold Sort"]);
        expect(arrows.every(arrow => arrow.tagName === "BUTTON" && arrow.getAttribute("aria-expanded") === "false")).toBe(true);
        expect(within(menu).queryByLabelText("Include: Founders")).toBeNull();
        expect(menu.querySelectorAll(".menu-option")).toHaveLength(0);
        expect(within(menu).queryByLabelText("Belongs to: Infrastructure")).toBeNull();
        // The other blocks stay: Linked, Costs.
        expect(within(menu).getByLabelText("Costs: Costs")).toBeTruthy();
        fireEvent.click(within(menu).getByRole("button", { name: "Unfold Include" }));
        expect(within(menu).getByLabelText("Include: Founders")).toBeTruthy();
        expect(within(menu).getByRole("button", { name: "Fold Include" }).getAttribute("aria-expanded")).toBe("true");
        fireEvent.click(within(menu).getByRole("button", { name: "Unfold Sort" }));
        expect(menu.querySelectorAll(".menu-option").length).toBeGreaterThan(0);
        // (The orders stand in the Order group, after the Show group's blocks.)
        const order = [...menu.querySelectorAll<HTMLElement>("strong, .menu-option")].map(node => node.textContent);
        expect(order.indexOf("Sort")).toBeGreaterThan(order.indexOf("Belongs to"));
        expect(order.findIndex(text => (text ?? "").includes("Page order"))).toBeGreaterThan(order.indexOf("Sort"));
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
        expect(css.includes(".capability-overview-costs-order, .capability-overview-costs-range { display: flex; flex-wrap: nowrap; align-items: flex-end; gap: var(--space-cell); }")).toBe(true);
        expect(stylesheet("conversation.css").includes("width:max-content;")).toBe(true);
    });

});

describe("the Inventory table", () => {

    const row = (fields: Record<string, unknown>) => ({
        id: "r", tone: "infrastructure", kind: "resource", name: "Loom", path: ["Infrastructure", "Equipment", "Specialised"],
        status: "costs", statusLabel: "Costs", frequency: "one-time", frequencyLabel: "One-time", amount: 7200, links: [], ...fields
    }) as never;

    it("maps a card to Section, Category, Group, Cost and Frequency, one line for one cost", () => {
        expect(tableRows(row({}))).toEqual([{ type: "Resource", section: "Infrastructure", category: "Equipment", group: "Specialised", status: "Costs", cost: "7200", frequency: "One-time", nature: "", behaviour: "", offering: "", journey: "", actions: "", share: "" }]);
        expect(tableRows(row({ tone: "offering", path: ["Offering", "Resources"] }))[0]).toMatchObject({ section: "Offering", category: "Resources", group: "" });
    });

    it("gives every card one line: a Workspace's deposit and extras are rows of their own (owner, 2026-11-13 16:50)", () => {
        expect(tableRows(row({}))).toHaveLength(1);
    });

    it("fills a Legal Entity expense with the funnel's names -- Section Legal, Type Legal expense --, name, cost and frequency only", () => {
        const [line] = tableRows(row({ kind: "legal", tone: "legal", path: ["Identity System", "Legal Entity", "Expenses"], status: "", statusLabel: "", amount: 120, frequency: "annually", frequencyLabel: "Annually" }));
        expect(line).toEqual({ type: "Legal expense", section: "Legal", category: "", group: "", status: "", cost: "120", frequency: "Annually", nature: "", behaviour: "", offering: "", journey: "", actions: "", share: "" });
    });

    it("shows the eleven columns in order, the second cost's line dimmed with the name repeated, the links as bullets only (their text a tooltip)", () => {
        const base = asBusinessCapabilityValue(undefined);
        const loom = { ...createBusinessResourceSlot(), name: "Loom", status: "partners-suppliers", providerId: "p1" };
        render(<Harness initial={{ ...base, providers: [{ ...createBusinessPartner("Hackney"), id: "p1", category: "suppliers", group: "business-services" }], resources: { equipment: [{ id: "devices-tools", name: "", slots: [loom] }] } }} />);
        fireEvent.click(tileButton(/^Inventory/));
        fireEvent.click(screen.getByRole("radio", { name: "Table" }));
        const table = document.querySelector(".capability-overview-table")!;
        // (A column no row fills is not drawn: the Loom has no cost of its own, so no Cost, Frequency, Cost Nature or Behaviour; owner, 2026-11-14 13:54.)
        expect([...table.querySelectorAll("th[scope=col]")].map(head => head.textContent)).toEqual(["Name", "Type", "Section", "Category", "Group", "Status", "Linked"]);
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
        id: "r", kind: "provider", name: "DPD", path: ["Offering", "Providers"], status: "", statusLabel: "", frequency: "", frequencyLabel: "", amount: 5, links: []
    };
    const channel = { ...base, tone: "channel" } as never;
    const own = { ...base, id: "q", name: "Flame", tone: "offering" } as never;

    it("reads Channel in the Group column and as the last line of a tile for a card of the Customer Channel (Section, Type and Category keep their values)", () => {
        expect(tableRows(channel)[0]).toMatchObject({ type: "Supplier", section: "Offering", category: "Providers", group: "Channel" });
        expect(tableRows(own)[0]).toMatchObject({ category: "Providers", group: "" });
        expect(belongsLines(channel)).toEqual(["Offering", "Providers", "Channel"]);
        expect(belongsLines(own)).toEqual(["Offering", "Providers"]);
        // (An activity's third line is its category: Channel follows it.)
        expect(belongsLines({ ...base, kind: "activity", path: ["Offering", "Activities", "Production"], tone: "channel" } as never)).toEqual(["Offering", "Activities", "Production", "Channel"]);
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
        fireEvent.click(screen.getByRole("radio", { name: "Table" }));
        return document.querySelector<HTMLElement>(".capability-overview-table")!;
    };
    const heads = (table: HTMLElement) => [...table.querySelectorAll("thead th")].map(head => head.textContent);

    it("hides and shows the columns from the COLUMNS block (Name always shown), Status and Linked off while the Costs isolation is on", () => {
        const base = asBusinessCapabilityValue(undefined);
        const priced = { ...createBusinessResourceSlot(), name: "Loom", status: "costs", cost: { price: "10", frequency: "monthly", frequencyOther: "", currency: "" } };
        render(<Harness initial={{ ...base, resources: { equipment: [{ id: "devices-tools", name: "", slots: [priced] }] } }} />);
        const table = openTable();
        // (No card is linked: no Linked column, and none to choose; owner, 2026-11-14 13:54.)
        expect(heads(table)).toEqual(["Name", "Type", "Section", "Category", "Group", "Cost", "Frequency", "Cost Nature", "Behaviour", "Status"]);
        fireEvent.click(screen.getByRole("button", { name: /Sort all tiles/i }));
        const menu = document.querySelector<HTMLElement>(".strategy-sort-menu-wide")!;
        fireEvent.click(within(menu).getByRole("button", { name: "Unfold Columns" }));
        expect(within(menu).queryByLabelText("Column: Name")).toBeNull();
        expect(within(menu).queryByLabelText("Column: Linked")).toBeNull();
        fireEvent.click(within(menu).getByLabelText("Column: Group"));
        expect(heads(document.querySelector<HTMLElement>(".capability-overview-table")!)).not.toContain("Group");
        fireEvent.click(within(menu).getByLabelText("Costs: Costs"));
        const costs = heads(document.querySelector<HTMLElement>(".capability-overview-table") ?? table);
        expect(costs).not.toContain("Status");
        expect(costs).not.toContain("Linked");
        fireEvent.click(within(menu).getByLabelText("Column: Status"));
        expect(heads(document.querySelector<HTMLElement>(".capability-overview-table") ?? table)).toContain("Status");
    });

    it("sizes the table's text in three steps of the type scale with the S / M / L toggle, 14px by default below 1900 wide", () => {
        Object.defineProperty(window, "innerWidth", { configurable: true, value: 1366 });
        render(<Harness />);
        const table = openTable();
        const size = () => document.querySelector<HTMLElement>(".capability-overview-table")!.getAttribute("data-size");
        expect(size()).toBe("small");
        expect(table.style.getPropertyValue("--table-font")).toBe("var(--font-small)");
        fireEvent.click(screen.getByRole("radio", { name: "Standard text" }));
        expect(size()).toBe("body");
        fireEvent.click(screen.getByRole("radio", { name: "Larger text" }));
        expect(size()).toBe("large");
        fireEvent.click(screen.getByRole("radio", { name: "Standard text" }));
        expect(size()).toBe("body");
        fireEvent.click(screen.getByRole("radio", { name: "Smaller text" }));
        expect(size()).toBe("small");
    });

    it("draws the table on an opaque calm surface per theme with a sticky heading, a band of the card's hue", () => {
        const css = stylesheet("capability-overview.css");
        for (const theme of ["dark", "sepia"]) {
            expect(css.includes(":root[data-theme=\"" + theme + "\"] { --table-ground:")).toBe(true);
        }
        expect(css.includes(".capability-overview-table-mode .capability-overview-scroll { padding: 0 0 12px; border-radius: var(--radius-lg); background: var(--table-ground); color: var(--table-ink); }")).toBe(true);
        expect(css.includes(".capability-overview-table thead th { position: sticky; top: 0; z-index: 2; background: color-mix(in srgb, hsl(var(--strategy-theme-hue, 0) var(--theme-bg-hover)) var(--theme-ground-weight), var(--table-ground));")).toBe(true);
        expect(css.includes(".capability-overview-table tbody tr:nth-child(even) > * { background: var(--table-tint); }")).toBe(true);
    });

    it("keeps the fixed Name column on top and opaque in every row state, its heading fixed to the left too (owner, 2026-11-12 23:54)", () => {
        const css = stylesheet("capability-overview.css");
        expect(css.includes(".capability-overview-table tbody tr > th[data-col=\"name\"] { background: var(--table-ground); }")).toBe(true);
        expect(css.includes(".capability-overview-table tbody tr:nth-child(even) > th[data-col=\"name\"] { background: linear-gradient(var(--table-tint), var(--table-tint)), var(--table-ground); }")).toBe(true);
        expect(css.includes(".capability-overview-table tbody tr:hover > th[data-col=\"name\"] { background: linear-gradient(var(--table-hover), var(--table-hover)), var(--table-ground); }")).toBe(true);
        expect(css.includes(".capability-overview-table thead th[data-col=\"name\"] { left: 0; z-index: 3; }")).toBe(true);
        // (The hover rule comes before the Name column's own, so the Name column's wins.)
        expect(css.indexOf(".capability-overview-table tbody tr:hover > * {")).toBeLessThan(css.indexOf(".capability-overview-table tbody tr:hover > th[data-col=\"name\"]"));
    });

});
