import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import CapabilityOverview, { tableRows } from "../tiles/CapabilityOverview";
import { DEFAULT_FLOOR_FILTER, filterFloor, floorRows, type FloorRow } from "../tiles/capabilityFloor";
import { asBusinessCapabilityValue, createBusinessActivity, createBusinessPartner, createBusinessResourceSlot } from "../../../framework/engine/AnswerUtils";

/* G11: Inventory for the new structure: category and group paths, completed activities hidden unless asked for, the currency in the column header,
   costs right aligned, and the tooltip above its circle. */

afterEach(cleanup);

const cost = (price: string, frequency: string, currency = "") => ({ price, frequency, frequencyOther: "", unit: "", currency });
const value = () => asBusinessCapabilityValue(undefined);
const rowsOf = (capability: ReturnType<typeof value>) => floorRows(capability);
const byId = (rows: FloorRow[], id: string) => rows.find(row => row.id === id)!;

describe("where a tile belongs", () => {

    it("an Offering resource is filed like Infrastructure's: its category and its group, 'No category' / 'No group' while it has none", () => {
        const rows = rowsOf({
            ...value(),
            offering: {
                ...value().offering,
                resources: [
                    { ...createBusinessResourceSlot(), id: "a", name: "Kiln", status: "exists", category: "equipment", group: "production-machinery" },
                    { ...createBusinessResourceSlot(), id: "b", name: "Yarn", status: "exists", category: "materials", group: "" },
                    { ...createBusinessResourceSlot(), id: "c", name: "Loose", status: "exists" }
                ]
            }
        });
        expect(byId(rows, "a").path).toEqual(["Offering's Capability", "Equipment", "Production Machinery"]);
        expect(byId(rows, "b").path).toEqual(["Offering's Capability", "Materials & Inventory", "No group"]);
        expect(byId(rows, "c").path).toEqual(["Offering's Capability", "No category", "No group"]);
    });

    it("a partner or supplier shows its type and its group; a Workspace card its group, Premises", () => {
        const rows = rowsOf({
            ...value(),
            providers: [{ ...createBusinessPartner("Acme", "suppliers"), id: "s", group: "technical-support" }, { ...createBusinessPartner("Loose", "suppliers"), id: "t" }],
            offering: { ...value().offering, professionals: [{ ...createBusinessPartner("Guild", "partners"), id: "p", group: "accreditation-bodies" }] },
            resources: { workspace: [{ id: "premises", name: "", slots: [{ ...createBusinessResourceSlot(), id: "w", name: "Studio", status: "exists" }] }] }
        });
        expect(byId(rows, "s").path).toEqual(["Infrastructure", "Suppliers", "Technical Support"]);
        expect(byId(rows, "t").path).toEqual(["Infrastructure", "Suppliers", "No group"]);
        expect(byId(rows, "p").path).toEqual(["Offering's Capability", "Partners", "Accreditation Bodies"]);
        expect(byId(rows, "w").path).toEqual(["Infrastructure", "Workspace", "Premises"]);
    });

});

describe("completed activities", () => {

    const rows = () => rowsOf({
        ...value(),
        activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity(), id: "open", name: "Open", performerIds: [] }, { ...createBusinessActivity(), id: "done", name: "Done", completed: true }] }]
    });

    it("are hidden by default and shown with the Completed status filter", () => {
        expect(filterFloor(rows(), DEFAULT_FLOOR_FILTER).filter(row => row.kind === "activity").map(row => row.id)).toEqual(["open"]);
        expect(filterFloor(rows(), { ...DEFAULT_FLOOR_FILTER, status: "completed" }).map(row => row.id)).toEqual(["done"]);
    });

});

describe("the table", () => {

    const resource = (fields: Record<string, unknown>) => ({ ...createBusinessResourceSlot(), name: "Kiln", status: "costs", category: "equipment", group: "devices-tools", ...fields });

    it("writes the currency once, in the header of the Cost column, and the cost as a number", () => {
        const rows = rowsOf({ ...value(), offering: { ...value().offering, resources: [resource({ id: "a", cost: cost("1250.5", "annually") })] } });
        expect(byId(rows, "a").currency).toBe("");
        const [line] = tableRows(byId(rows, "a"), amount => String(amount), "EUR");
        expect(line.cost).toBe("1250.5");
        render(<CapabilityOverview rows={rows} currency="EUR" format={amount => "€" + amount} />);
        fireEvent.click(screen.getByRole("radio", { name: "Table" }));
        const heads = [...document.querySelectorAll("th[scope=col]")];
        const costHead = heads.find(head => head.textContent?.startsWith("Cost"))!;
        // (The currency's symbol beside the label, as every amount's label: labelWithCurrency.)
        expect(costHead.textContent).toBe("Cost (€)");
        expect(costHead.classList.contains("capability-overview-number")).toBe(true);
        const cell = [...document.querySelectorAll("tbody td")].find(td => td.textContent === (1250.5).toLocaleString(undefined, { minimumFractionDigits: 2 }))!;
        expect(cell.classList.contains("capability-overview-number")).toBe(true);
    });

    it("a cost in another currency says its own code in its cell", () => {
        const rows = rowsOf({ ...value(), offering: { ...value().offering, resources: [resource({ id: "a", cost: cost("20", "annually", "USD") })] } });
        expect(byId(rows, "a").currency).toBe("USD");
        expect(tableRows(byId(rows, "a"), String, "EUR")[0].cost).toBe("USD 20");
        expect(tableRows(byId(rows, "a"), String, "USD")[0].cost).toBe("20");
    });

});

describe("the tooltip of a circle", () => {

    it("stands above the circle, as the app\x27s tooltip, on pointing at it or focusing it; Escape closes it; the title is gone", () => {
        const capability = {
            ...value(),
            providers: [{ ...createBusinessPartner("Acme", "suppliers"), id: "s", group: "technical-support" }],
            resources: { equipment: [{ id: "devices-tools", name: "", slots: [{ ...createBusinessResourceSlot(), id: "r", name: "Oven", status: "partners-suppliers", providerId: "s" }] }] }
        };
        render(<CapabilityOverview rows={rowsOf(capability)} format={String} />);
        const circle = document.querySelector<HTMLElement>("[aria-label=\"Inventory\"] .card-tile-symbol")!;
        expect(circle.getAttribute("title")).toBeNull();
        expect(screen.queryByRole("tooltip")).toBeNull();
        fireEvent.mouseEnter(circle);
        const tip = screen.getByRole("tooltip");
        expect(tip.classList.contains("app-tooltip")).toBe(true);
        expect(tip.textContent).toMatch(/Acme/);
        fireEvent.keyDown(circle, { key: "Escape" });
        expect(screen.queryByRole("tooltip")).toBeNull();
        fireEvent.focus(circle);
        expect(screen.getByRole("tooltip")).toBeTruthy();
        fireEvent.blur(circle);
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

});

describe("the Offerings list of Belongs to (owner, 2026-11-13 16:12)", () => {
    it("starts at All; an Offering ticked leaves All and shows its rows alone; All, or no Offering ticked, shows every row again", () => {
        const row = (id: string, offeringIds: string[]): FloorRow => ({ id, tone: "offering", kind: "resource", name: id, path: ["Offering's Capability", "Equipment", "Devices & Tools"], status: "", statusLabel: "", frequency: "", frequencyLabel: "", amount: null, links: [], offeringIds } as unknown as FloorRow);
        const rows = [row("Loom", ["o1"]), row("Kit", ["o2"]), row("Shared", ["o1", "o2"])];
        render(<CapabilityOverview rows={rows} offerings={[{ id: "o1", name: "Collection" }, { id: "o2", name: "Workshops" }]} />);
        fireEvent.click(screen.getByRole("radio", { name: "Table" }));
        fireEvent.click(screen.getByRole("button", { name: /Sort all tiles/i }));
        fireEvent.click(screen.getByRole("button", { name: "Unfold Belongs to" }));
        fireEvent.click(screen.getByLabelText("Belongs to: Offering"));
        const names = () => [...document.querySelectorAll(".capability-overview-table tbody th")].map(cell => cell.textContent);
        const tick = (label: string) => screen.getByLabelText("Offerings: " + label) as HTMLInputElement;
        expect(tick("All").checked).toBe(true);
        expect(names()).toEqual(["Loom", "Kit", "Shared"]);
        fireEvent.click(tick("Workshops"));
        expect(tick("All").checked).toBe(false);
        expect(names()).toEqual(["Kit", "Shared"]);
        fireEvent.click(tick("All"));
        expect(tick("Workshops").checked).toBe(false);
        expect(names()).toEqual(["Loom", "Kit", "Shared"]);
        fireEvent.click(tick("Collection"));
        fireEvent.click(tick("Collection"));
        expect(tick("All").checked).toBe(true);
    });
});

describe("the % column of the Inventory (owner, 2026-11-14 09:31)", () => {
    it("is a choice under Offering, shown with it, and gives each Offering's share of the cost as the card shares it", () => {
        const row = (id: string, offeringIds: string[], offeringShares?: Record<string, number>): FloorRow => ({ id, tone: "offering", kind: "resource", name: id, path: ["Offering's Capability", "Equipment"], status: "", statusLabel: "", frequency: "", frequencyLabel: "", amount: null, links: [], offeringIds, offeringShares } as unknown as FloorRow);
        const rows = [row("Loom", ["o1", "o2"], { o1: 0.6, o2: 0.4 }), row("Kit", ["o2"], { o2: 1 })];
        render(<CapabilityOverview rows={rows} offerings={[{ id: "o1", name: "Collection" }, { id: "o2", name: "Workshops" }]} />);
        fireEvent.click(screen.getByRole("radio", { name: "Table" }));
        fireEvent.click(screen.getByRole("button", { name: /Sort all tiles/i }));
        fireEvent.click(screen.getByRole("button", { name: "Unfold Columns" }));
        // (Offering off: no % to choose.)
        expect(screen.queryByLabelText("Column: %")).toBeNull();
        fireEvent.click(screen.getByLabelText("Column: Offering"));
        fireEvent.click(screen.getByLabelText("Column: %"));
        const shares = [...document.querySelectorAll(".capability-overview-table tbody td[data-col=share]")].map(cell => cell.textContent);
        expect(shares).toEqual(["60%40%", "100%"]);
        // (Offering off again takes the % with it.)
        fireEvent.click(screen.getByLabelText("Column: Offering"));
        expect(document.querySelector(".capability-overview-table thead th[data-col=share]")).toBeNull();
    });
});
