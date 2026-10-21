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
        expect(costHead.textContent).toBe("Cost (EUR)");
        expect(costHead.classList.contains("capability-overview-number")).toBe(true);
        const cell = [...document.querySelectorAll("tbody td")].find(td => td.textContent === "1,250.5")!;
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
