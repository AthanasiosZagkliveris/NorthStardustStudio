import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import CapabilityOverview, { tableRows } from "../tiles/CapabilityOverview";
import { DEFAULT_FLOOR_FILTER, filterFloor, floorRows, type FloorRow } from "../tiles/capabilityFloor";
import { asBusinessCapabilityValue, createBusinessActivity, createBusinessPartner, createBusinessResourceSlot } from "../../../framework/engine/answers/AnswerUtils";

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

describe("the Cost per Offering column of the Inventory (owner, 2026-11-14 09:31 and 13:54)", () => {
    it("is a choice under Offering, shown with it, and gives each Offering's share of the cost as the card shares it, with the cost it comes to", () => {
        const row = (id: string, offeringIds: string[], offeringShares?: Record<string, number>, amount: number | null = null): FloorRow => ({ id, tone: "offering", kind: "resource", name: id, path: ["Offering's Capability", "Equipment"], status: "", statusLabel: "", frequency: amount === null ? "" : "monthly", frequencyLabel: amount === null ? "" : "Monthly", amount, links: [], offeringIds, offeringShares } as unknown as FloorRow);
        const rows = [row("Loom", ["o1", "o2"], { o1: 0.6, o2: 0.4 }, 50), row("Kit", ["o2"], { o2: 1 })];
        render(<CapabilityOverview rows={rows} offerings={[{ id: "o1", name: "Collection" }, { id: "o2", name: "Workshops" }]} />);
        fireEvent.click(screen.getByRole("radio", { name: "Table" }));
        fireEvent.click(screen.getByRole("button", { name: /Sort all tiles/i }));
        fireEvent.click(screen.getByRole("button", { name: "Unfold Columns" }));
        // (Offering off: no % to choose.)
        expect(screen.queryByLabelText("Column: Cost per Offering")).toBeNull();
        fireEvent.click(screen.getByLabelText("Column: Offering"));
        fireEvent.click(screen.getByLabelText("Column: Cost per Offering"));
        const shares = [...document.querySelectorAll(".capability-overview-table tbody td[data-col=share]")].map(cell => cell.textContent);
        expect(shares).toEqual(["60% · 3040% · 20", "100%"]);
        // (Offering off again takes the % with it.)
        fireEvent.click(screen.getByLabelText("Column: Offering"));
        expect(document.querySelector(".capability-overview-table thead th[data-col=share]")).toBeNull();
    });
});

describe("an Offering chosen under Belongs to (owner, 2026-11-14 11:15)", () => {
    it("lists only the chosen Offering, with its share, in the Offering and % columns", () => {
        const row = (id: string, offeringIds: string[], offeringShares: Record<string, number>): FloorRow => ({ id, tone: "offering", kind: "resource", name: id, path: ["Offering's Capability", "Equipment"], status: "", statusLabel: "", frequency: "", frequencyLabel: "", amount: null, links: [], offeringIds, offeringShares } as unknown as FloorRow);
        render(<CapabilityOverview rows={[row("Loom", ["o1", "o2"], { o1: 0.7, o2: 0.3 })]} offerings={[{ id: "o1", name: "Collection" }, { id: "o2", name: "Workshops" }]} />);
        fireEvent.click(screen.getByRole("radio", { name: "Table" }));
        fireEvent.click(screen.getByRole("button", { name: /Sort all tiles/i }));
        fireEvent.click(screen.getByRole("button", { name: "Unfold Columns" }));
        fireEvent.click(screen.getByLabelText("Column: Offering"));
        fireEvent.click(screen.getByLabelText("Column: Cost per Offering"));
        fireEvent.click(screen.getByRole("button", { name: "Unfold Belongs to" }));
        fireEvent.click(screen.getByLabelText("Belongs to: Offering"));
        const cells = () => [...document.querySelectorAll(".capability-overview-table tbody td[data-col=offering], .capability-overview-table tbody td[data-col=share]")].map(cell => cell.textContent);
        expect(cells()).toEqual(["CollectionWorkshops", "70%30%"]);
        fireEvent.click(screen.getByLabelText("Offerings: Collection"));
        expect(cells()).toEqual(["Collection", "70%"]);
    });
});

describe("a share of revenue's Cost per Offering (owner, 2026-11-14 14:17 and 23:30)", () => {
    it("is the rate on each Offering's revenue, a line each; with a revenue still to come, the rate and 'when sales are set'", async () => {
        const { shareLines, costPerOfferingText } = await import("../tiles/CapabilityOverview.tsx");
        const row = { id: "fees", tone: "offering", kind: "provider", name: "Shopify Payments", path: [], status: "", statusLabel: "", frequency: "percent-revenue", frequencyLabel: "% of Rev", amount: 2, links: [], offeringIds: ["o1", "o2"], offeringShares: { o1: 0.7, o2: 0.3 } } as unknown as FloorRow;
        const offerings = [{ id: "o1", name: "Collection" }, { id: "o2", name: "Workshops" }];
        expect(shareLines(row, offerings, { o1: 2240, o2: 2720 }).map(line => costPerOfferingText(row, line))).toEqual(["2% · 44.80", "2% · 54.40"]);
        expect(shareLines(row, offerings, { o1: 2240 }).map(line => costPerOfferingText(row, line))).toEqual(["2% · 44.80", "2% · when sales are set"]);
    });
});

describe("a channel's share of revenue (owner, 2026-11-14 20:25)", () => {
    it("is split by what each Offering sells through the expense's subchannels; one that sells nothing there has no line; with no source there, by the whole revenue", async () => {
        const { shareLines, costPerOfferingText } = await import("../tiles/CapabilityOverview.tsx");
        const row = { id: "fees", tone: "channel", kind: "provider", name: "Shopify Payments", path: [], status: "", statusLabel: "", frequency: "percent-revenue", frequencyLabel: "% of Rev", amount: 2, links: [], offeringIds: ["o1", "o2"], offeringShares: { o1: 0.5, o2: 0.5 }, channel: { places: [{ channel: "Online Store", sub: "Own website" }], offerings: [], stages: [], actions: [], colour: 0, linkIds: [], behaviour: "" } } as unknown as FloorRow;
        const offerings = [{ id: "o1", name: "Homeware" }, { id: "o2", name: "Weaving" }];
        const whole = { o1: 2240, o2: 2720 };
        expect(shareLines(row, offerings, whole, { o1: { "Online Store\u0001Own website": 1344 }, o2: { "Social Media\u0001Instagram": 2720 } }).map(line => line.name + " " + costPerOfferingText(row, line))).toEqual(["Homeware 2% · 26.88"]);
        expect(shareLines(row, offerings, whole, { o1: { "Online Store\u0001Own website": 1000 }, o2: { "Online Store\u0001Own website": 3000 } }).map(line => costPerOfferingText(row, line))).toEqual(["2% · 20", "2% · 60"]);
        expect(shareLines(row, offerings, whole, { o2: { "Social Media\u0001Instagram": 2720 } }).map(line => costPerOfferingText(row, line))).toEqual(["2% · 44.80", "2% · 54.40"]);
    });

    it("a fee is split by what is paid at its subchannels, a referral commission by its sources (owner, 2026-11-17 09:09, option (a))", async () => {
        const { shareLines, costPerOfferingText } = await import("../tiles/CapabilityOverview.tsx");
        const row = { id: "fees", tone: "channel", kind: "provider", name: "Shopify Payments", path: [], status: "", statusLabel: "", frequency: "percent-revenue", frequencyLabel: "% of Rev", amount: 2, links: [], offeringIds: ["o1"], channel: { places: [{ channel: "Website", sub: "Online Store" }], offerings: [], stages: [], actions: [], colour: 0, linkIds: [], behaviour: "" } } as unknown as FloorRow;
        const referral = { ...row, id: "partner", name: "Referral partners", channel: { ...row.channel!, places: [{ channel: "Referral & Affiliates", sub: "Referral Partner" }] } } as FloorRow;
        const offerings = [{ id: "o1", name: "Homeware" }];
        const sources = { o1: { "Referral & Affiliates\u0001Referral Partner": 500, "Social Media\u0001Instagram": 1500 } };
        const paying = { o1: { "Website\u0001Online Store": 1000, "In Person\u0001Market / Pop-up": 1000 } };
        expect(shareLines(row, offerings, { o1: 2000 }, sources, null, {}, paying).map(line => costPerOfferingText(row, line))).toEqual(["2% · 20"]);
        expect(shareLines(referral, offerings, { o1: 2000 }, sources, null, {}, paying).map(line => costPerOfferingText(referral, line))).toEqual(["2% · 10"]);
    });
});

describe("a share of revenue's whole fee, as the forecast charges it (owner, 2026-11-16)", () => {
    it("is the fee row's rate and its fixed fee on each order; a fixed fee in another currency is shown in it, left out, and said so", async () => {
        const { shareLines, costPerOfferingText, tableRows } = await import("../tiles/CapabilityOverview.tsx");
        const { chargedFeeFor } = await import("../../../framework/engine/financial/CalculatedLines.ts");
        const { createGlobalSettings } = await import("../../../framework/engine/GlobalSettings.ts");
        const row = { id: "fees", tone: "offering", kind: "provider", name: "Stripe", path: [], status: "", statusLabel: "", frequency: "percent-revenue", frequencyLabel: "% of Rev", amount: 2, links: [], offeringIds: ["o1"] } as unknown as FloorRow;
        const offerings = [{ id: "o1", name: "Collection" }];
        const own = { ...createGlobalSettings(), channelFees: [{ id: "f1", country: "GB", channel: "Stripe", commission: "1.5", fixedFee: "0.20", chargeback: "0", currency: "GBP", status: "checked", checked: "", note: "" }] };
        const fee = chargedFeeFor("Stripe", own as never, "GB", "GBP")!;
        // (1,000 a month in orders of 50: 1.5% is 15, and 20 orders at 0.20 is 4.)
        expect(fee).toMatchObject({ percent: 1.5, perOrder: 0.2, text: "1.5% + 0.20 an order", note: null });
        expect(shareLines(row, offerings, { o1: 1000 }, {}, fee, { o1: 50 }).map(line => costPerOfferingText(row, line))).toEqual(["1.5% + 0.20 an order · 19"]);
        expect(tableRows(row, String, "GBP", fee)[0].cost).toBe("1.5% + 0.20 an order");

        const dollars = { ...own, channelFees: [{ ...own.channelFees[0], channel: "Gumroad", commission: "10", fixedFee: "0.50", currency: "USD" }] };
        const foreign = chargedFeeFor("Gumroad", dollars as never, "GB", "GBP")!;
        expect(foreign).toMatchObject({ perOrder: 0, text: "10% + USD 0.50 an order", note: "The US$0.50 per order is in US dollars, so the totals leave it out." });
        expect(shareLines({ ...row, name: "Gumroad" } as FloorRow, offerings, { o1: 1000 }, {}, foreign, { o1: 50 }).map(line => costPerOfferingText(row, line))).toEqual(["10% + USD 0.50 an order · 100"]);
    });
});

describe("the Inventory's smart options (owner, 2026-11-14 20:08)", () => {
    it("offers a journey stage only where, with the Offering chosen, a card is used at it; a ticked one stays", () => {
        const row = (id: string, offeringIds: string[], stages: string[]): FloorRow => ({ id, tone: "channel", kind: "resource", name: id, path: ["Offering's Capability", "Resources"], status: "", statusLabel: "", frequency: "", frequencyLabel: "", amount: null, links: [], offeringIds, channel: { places: [], offerings: [], stages, actions: [], colour: 0, linkIds: [], behaviour: "" } } as unknown as FloorRow);
        render(<CapabilityOverview rows={[row("Stall kit", ["o1"], ["Discover", "Delivery"]), row("Booking app", ["o2"], ["Purchase"])]} offerings={[{ id: "o1", name: "Collection" }, { id: "o2", name: "Workshops" }]} />);
        fireEvent.click(screen.getByRole("button", { name: /Sort all tiles/i }));
        fireEvent.click(screen.getByRole("button", { name: "Unfold Belongs to" }));
        fireEvent.click(screen.getByLabelText("Belongs to: Offering"));
        const stages = () => [...document.querySelectorAll("input[aria-label^='Journey Stages: ']")].map(input => input.getAttribute("aria-label")!.replace("Journey Stages: ", ""));
        expect(stages()).toEqual(["All", "Discover", "Purchase", "Delivery"]);
        fireEvent.click(screen.getByLabelText("Offerings: Workshops"));
        expect(stages()).toEqual(["All", "Purchase"]);
    });
});
