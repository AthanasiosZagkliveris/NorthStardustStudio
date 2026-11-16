import { describe, expect, it, test } from "vitest";

import {
    asBusinessCapabilityValue,
    asBusinessEngagementValue,
    asLegalEntityValue,
    createBusinessPartner,
    createBusinessResourceSlot
} from "./AnswerUtils";
import { calculatedLines, channelFeeFor, channelFeeRowFor, monthIndexOf, revenueFractions } from "./CalculatedLines";
import { createDemand, createDemandSource } from "./DemandCapacity";
import { financialForecast, type ForecastTable } from "./FinancialForecast";
import {
    asFinancialFoundationValue,
    asFinancialSustainabilityValue,
    consolidateCosts,
    createRevenueStream
} from "./FinancialModel";
import { channelFeeOf, createGlobalSettings, type GlobalSettingsValue } from "./GlobalSettings";

/* I5: the calculated lines (on-costs, fees, royalties, commissions, depreciation, amortisation, inventory, the accumulated start-up row, income tax). */

const cost = (price: string, frequency: string, unit = "") => ({ price, frequency, frequencyOther: "", unit, currency: "" });
const slot = (id: string, category: string, group: string, fields: Record<string, unknown> = {}) =>
    ({ ...createBusinessResourceSlot(), id, name: id, status: "costs", category, group, offeringIds: ["o1"], ...fields });
const supplier = (id: string, group: string, fields: Record<string, unknown> = {}) =>
    ({ ...createBusinessPartner(id, "suppliers"), id, name: id, group, offeringIds: ["o1"], ...fields });

const PLAN = { month: "01", year: "2027" };
const OPENING = "2027-04-01";

function scenario(capability: object, settings: Partial<GlobalSettingsValue> = {}, options: { price?: string; volume?: string; drawings?: boolean; taxRate?: string } = {}) {
    const base = asBusinessCapabilityValue(undefined);
    const value = asBusinessCapabilityValue({ ...base, ...capability, offering: { ...base.offering, ...(capability as { offering?: object }).offering } });
    const foundation = { ...asFinancialFoundationValue(options.taxRate ? { incomeTax: "rate", incomeTaxRate: options.taxRate } : {}), planStart: PLAN, planYears: "1" };
    const stream = { ...createRevenueStream(), offeringId: "o1", price: options.price ?? "100", volume: options.volume ?? "100", start: { month: "04", year: "2027" }, frequency: "one-time" as const, itemsPerOrder: "1" };
    const revenuePage = asFinancialSustainabilityValue({ streams: [stream] });
    const lines = consolidateCosts(foundation, {
        legalEntity: asLegalEntityValue({}), capability: value, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: false
    });
    const merged = { ...createGlobalSettings(), ...settings };
    const result = calculatedLines({ foundation, revenuePage, lines, capability: value, settings: merged, openingDate: OPENING, drawings: options.drawings ?? false }, options.taxRate ? Number(options.taxRate) / 100 : null);
    return { value, foundation, revenuePage, lines, result, settings: merged };
}

const sum = (values: number[]) => Math.round(values.reduce((total, amount) => total + amount, 0) * 100) / 100;

describe("month positions", () => {

    it("a date falls in a plan month, counted from the plan start", () => {
        expect(monthIndexOf("2027-01-15", PLAN)).toBe(0);
        expect(monthIndexOf("2027-04-01", PLAN)).toBe(3);
        expect(monthIndexOf("2026-12-31", PLAN)).toBe(-1);
        expect(monthIndexOf("", PLAN)).toBeNull();
    });

});

describe("employer on-costs and insurance per employee (X3)", () => {

    const team = { resources: { hr: [{ id: "admin-team", name: "", slots: [slot("clerk", "hr", "admin-team", { startDate: "2027-01-01", offeringIds: [], quantity: "2", cost: cost("3000", "monthly") })] }] } };

    it("gross salaries x the coefficient: 6,000 at 25% is 1,500 a month", () => {
        const { result } = scenario(team, { onCostRate: "25" });
        expect(result.onCosts.values.slice(0, 3)).toEqual([1500, 1500, 1500]);
    });

    it("nothing while no coefficient is set, and it says so", () => {
        const { result } = scenario(team, { onCostRate: "" });
        expect(sum(result.onCosts.values)).toBe(0);
        expect(result.notes.join(" ")).toMatch(/on-cost coefficient/);
    });

    it("no on-costs on owners' drawings", () => {
        const founderPay = { founders: [{ id: "f1", name: "Ann", salary: "2000", period: "month", startDate: "2027-01-01", roles: [""], extras: {} }] };
        const { result } = scenario(founderPay, { onCostRate: "25" }, { drawings: true });
        expect(sum(result.onCosts.values)).toBe(0);
    });

    it("insurance per employee: the headcount x the amount, when a key-person card exists", () => {
        const withCard = {
            ...team,
            resources: {
                ...team.resources,
                documents: [{ id: "insurances", name: "", slots: [slot("kp", "documents", "insurances", { costOption: "key-person-health", offeringIds: [], cost: cost("40", "monthly") })] }]
            }
        };
        const { result } = scenario(withCard, { insurancePerEmployee: "30" });
        expect(result.employeeInsurance.values[0]).toBe(60);
        expect(result.replaced).toContain("kp");
        expect(sum(scenario(team, { insurancePerEmployee: "30" }).result.employeeInsurance.values)).toBe(0);
    });

});

describe("channel fees, royalties and partner commissions (X4, X5)", () => {

    const gateway = (name: string, price: string) => ({
        offering: { providers: [supplier(name, "platforms-payments", { costOption: "payment-gateway", startDate: "2027-01-01", cost: cost(price, "percent-revenue") })] }
    });

    it("the Channel Fee Table, by the card's name: Stripe on 100,000 of revenue and 4,000 orders is 2,800", () => {
        const { result } = scenario(gateway("Stripe", "9"), {}, { price: "25", volume: "4000" });
        // (April: revenue 100,000, 4,000 orders: 1,500 + 500 + 800, at the UK rate checked 14/11/2026.)
        expect(result.percentageLines[0].values[3]).toBe(2800);
        expect(result.percentageLines[0].kind).toBe("channel-fee");
    });

    it("a payment service's card with no price is charged from its fee row; with a price, still once (owner, 2026-11-15 16:37)", () => {
        const priceless = scenario(gateway("Stripe", ""), {}, { price: "25", volume: "4000" }).result.percentageLines;
        expect(priceless).toHaveLength(1);
        expect(priceless[0].values[3]).toBe(2800);
        const priced = scenario(gateway("Stripe", "9"), {}, { price: "25", volume: "4000" }).result.percentageLines;
        expect(priced).toHaveLength(1);
        expect(priced[0].values[3]).toBe(2800);
        // (No price and no row of its name: nothing is charged, as before.)
        expect(scenario(gateway("Local gateway", ""), {}, { price: "25", volume: "4000" }).result.percentageLines).toEqual([]);
    });

    it("a card of no channel in the table uses its own rate, on the revenue of its Offerings", () => {
        const { result } = scenario(gateway("Local gateway", "2.5"), {}, { price: "100", volume: "100" });
        expect(result.percentageLines[0].values[3]).toBe(250);
        expect(result.percentageLines[0].values[2]).toBe(0);
    });

    it("a royalty on sales: the revenue x the rate, the card's override first, then its price, then the default of the Global Settings", () => {
        const royalty = (fields: Record<string, unknown>) => ({
            offering: { resources: [slot("roy", "documents", "royalties", { costOption: "royalty-on-sales", startDate: "2027-01-01", cost: cost("", "percent-revenue"), ...fields })] }
        });
        expect(scenario(royalty({ rateOverride: "12.5", cost: cost("8", "percent-revenue") })).result.percentageLines[0].values[3]).toBe(1250);
        const byPrice = scenario(royalty({ cost: cost("8", "percent-revenue") }));
        expect(byPrice.result.percentageLines[0].values[3]).toBe(800);
        expect(byPrice.result.percentageLines[0].kind).toBe("royalty");
    });

    it("a partner commission follows the revenue of its Offerings and stops at its End date", () => {
        const agent = { offering: { professionals: [{ ...createBusinessPartner("Agent", "partners"), id: "agent", name: "Agent", group: "revenue-partners", costOption: "sales-agents", offeringIds: ["o1"], startDate: "2027-01-01", endDate: "2027-05-31", cost: cost("10", "percent-revenue") }] } };
        const { result } = scenario(agent);
        expect(result.percentageLines[0].kind).toBe("commission");
        expect(result.percentageLines[0].values.slice(3, 7)).toEqual([1000, 1000, 0, 0]);
    });

    it("finds the row of the table by the channel's name", () => {
        const table = createGlobalSettings().channelFees;
        expect(channelFeeRowFor("Stripe payments", table)?.channel).toBe("Stripe");
        expect(channelFeeRowFor("Amazon", table)?.channel).toBe("Amazon");
        expect(channelFeeRowFor("Amazon Handmade shop", table)?.channel).toBe("Amazon Handmade");
        expect(channelFeeRowFor("My own shop", table)).toBeUndefined();
    });

});

describe("depreciation and amortisation (X1, X2)", () => {

    const machine = (fields: Record<string, unknown> = {}) => ({
        offering: { resources: [slot("loom", "equipment", "production-machinery", { quantity: "1", startDate: "2027-02-01", cost: cost("12000", "per-unit", "machine"), ...fields })] }
    });

    it("an asset bought before the opening wears from the Opening Date: 12,000 over 10 years is 100 a month, into COGS (it helps to make the offering)", () => {
        const { result } = scenario(machine(), { capitalisationLimit: "500", usefulLife: { "production-machinery": "10" } });
        expect(result.assets[0]).toMatchObject({ id: "loom", cost: 12000, years: 10, toCogs: true });
        expect(result.depreciation.cogs.slice(0, 5)).toEqual([0, 0, 0, 100, 100]);
        expect(sum(result.depreciation.opex)).toBe(0);
    });

    it("an Infrastructure asset goes to OpEx; the card's own useful life beats the group's default", () => {
        const laptop = { resources: { equipment: [{ id: "devices-tools", name: "", slots: [slot("laptop", "equipment", "devices-tools", { quantity: "1", startDate: "2027-06-01", usefulLife: "2", offeringIds: [], cost: cost("2400", "per-unit", "item") })] }] } };
        const { result } = scenario(laptop, { capitalisationLimit: "500" });
        // (Bought after the opening: from the month it is ready, June: 2,400 / 24.)
        expect(result.depreciation.opex.slice(4, 8)).toEqual([0, 100, 100, 100]);
        expect(sum(result.depreciation.cogs)).toBe(0);
    });

    it("the services bundled into the asset are depreciated with it: an oven of 4,000 and an installation of 800 over 4 years", () => {
        const oven = {
            resources: { equipment: [{ id: "devices-tools", name: "", slots: [slot("oven", "equipment", "devices-tools", {
                quantity: "1", startDate: "2027-06-01", usefulLife: "4", offeringIds: [], cost: cost("4000", "per-unit", "item"),
                extraStatuses: [{ id: "x", status: "partners-suppliers", providerId: "elec", activityId: "" }]
            })] }] },
            providers: [{ ...supplier("elec", "technical-support", { offeringIds: [], startDate: "2027-06-01", cost: cost("800", "per-project") }) }]
        };
        const { result } = scenario(oven, { capitalisationLimit: "4500" });
        expect(result.assets.map(asset => [asset.id, asset.cost])).toEqual([["oven", 4800]]);
        expect(result.depreciation.opex[5]).toBe(100);
    });

    it("an asset with no useful life of its own or its group's is not depreciated, and it says so", () => {
        const chair = { resources: { workstation: [{ id: "furniture-fittings", name: "", slots: [slot("chair", "workstation", "furniture-fittings", { quantity: "1", startDate: "2027-06-01", offeringIds: [], cost: cost("900", "per-unit", "item") })] }] } };
        const { result } = scenario(chair, { capitalisationLimit: "500", usefulLife: {} });
        expect(sum(result.depreciation.opex)).toBe(0);
        expect(result.notes.join(" ")).toMatch(/chair.*useful life/);
    });

    it("an End date stops the line", () => {
        const { result } = scenario(machine({ endDate: "2027-06-30" }), { capitalisationLimit: "500", usefulLife: { "production-machinery": "10" } });
        expect(result.depreciation.cogs.slice(3, 8)).toEqual([100, 100, 100, 0, 0]);
    });

    it("an upfront franchise fee is amortised over the period the user gives, from the Opening Date: 20,000 over 8 years is 208.33 a month", () => {
        const franchise = { offering: { resources: [slot("fran", "documents", "royalties", { costOption: "franchise-fee", amortisationYears: "8", startDate: "2027-02-01", cost: cost("20000", "one-time") })] } };
        const { result } = scenario(franchise, { capitalisationLimit: "500" });
        expect(result.assets[0]).toMatchObject({ kind: "intangible", years: 8 });
        expect(result.amortisation.cogs[3]).toBe(208.33);
        expect(sum(result.depreciation.cogs)).toBe(0);
    });

    it("a franchise fee with no period of its own takes the Global Settings' years for franchise rights: 10 by default, 20,000 is 166.67 a month", () => {
        const franchise = { offering: { resources: [slot("fran", "documents", "royalties", { costOption: "franchise-fee", amortisationYears: "", startDate: "2027-02-01", cost: cost("20000", "one-time") })] } };
        const { result } = scenario(franchise, { capitalisationLimit: "500" });
        expect(result.assets[0]).toMatchObject({ kind: "intangible", years: 10 });
        expect(result.amortisation.cogs[3]).toBe(166.67);
    });

});

describe("opening inventory (C14, X11)", () => {

    const stock = { offering: { resources: [slot("stock", "materials", "materials-stock", { quantity: "4000", startDate: "2027-03-01", cost: cost("2", "per-unit", "kg") })] } };

    it("the cash is a purchase before the opening, and it reaches COGS as units are sold: 8,000 of stock, 100 units a month at 2 is 200", () => {
        const { result } = scenario(stock);
        expect(result.inventoryLineIds).toEqual(["stock"]);
        expect(result.inventory.purchased[2]).toBe(8000);
        expect(result.inventory.released.slice(0, 5)).toEqual([0, 0, 0, 200, 200]);
    });

    it("never more than the stock held", () => {
        const { result } = scenario(stock, {}, { volume: "1000000" });
        expect(sum(result.inventory.released)).toBe(8000);
    });

});

describe("which lines are written off at the opening (X12)", () => {

    it("a Startup or Pre-Operating Expense before the opening is listed; a cost from the opening is not", () => {
        const early = { resources: { utilities: [{ id: "premises-utilities", name: "", slots: [slot("works", "utilities", "premises-utilities", { startDate: "2027-01-01", offeringIds: [], cost: cost("1500", "monthly") })] }] } };
        const { result } = scenario(early);
        expect(result.startupLineIds).toEqual(["works"]);
        const late = { resources: { utilities: [{ id: "premises-utilities", name: "", slots: [slot("power", "utilities", "premises-utilities", { startDate: "2027-05-01", offeringIds: [], cost: cost("100", "monthly") })] }] } };
        expect(scenario(late).result.startupLineIds).toEqual([]);
    });

});

describe("income tax: Page 4's Plan Settings own the rate (doc 5, section 5.5.6)", () => {

    it("is the Financial Foundation's rate, whatever the Global Settings hold", () => {
        const ready = scenario({});
        const input = { foundation: ready.foundation, revenuePage: ready.revenuePage, lines: ready.lines, capability: ready.value, settings: { ...ready.settings, incomeTaxRate: "21" } as typeof ready.settings, openingDate: OPENING, drawings: false };
        expect(calculatedLines(input, 0.25).incomeTaxRate).toBe(0.25);
        expect(calculatedLines(input, null).incomeTaxRate).toBeNull();
    });

});

describe("the forecast with the calculated lines", () => {

    const capability = {
        resources: {
            utilities: [{ id: "premises-utilities", name: "", slots: [slot("rent", "utilities", "premises-utilities", { startDate: "2027-01-01", offeringIds: [], cost: cost("1500", "monthly") })] }],
            hr: [{ id: "admin-team", name: "", slots: [slot("clerk", "hr", "admin-team", { startDate: "2027-01-01", offeringIds: [], cost: cost("3000", "monthly") })] }],
            documents: [{ id: "insurances", name: "", slots: [] }]
        },
        offering: {
            resources: [
                slot("loom", "equipment", "production-machinery", { quantity: "1", startDate: "2027-02-01", cost: cost("12000", "per-unit", "machine") }),
                slot("stock", "materials", "materials-stock", { quantity: "4000", startDate: "2027-03-01", cost: cost("2", "per-unit", "kg") }),
                slot("fran", "documents", "royalties", { costOption: "franchise-fee", amortisationYears: "8", startDate: "2027-02-01", cost: cost("20000", "one-time") })
            ],
            providers: [supplier("Stripe", "platforms-payments", { costOption: "payment-gateway", startDate: "2027-01-01", cost: cost("2", "percent-revenue") })]
        }
    };

    function run(withCalculated: boolean) {
        const ready = scenario(capability, { onCostRate: "25", capitalisationLimit: "500" }, { taxRate: "20" });
        const forecast = financialForecast(ready.foundation, ready.revenuePage, ready.lines, asLegalEntityValue({}), String, withCalculated ? ready.result : undefined);
        return { forecast, ready };
    }

    const row = (table: ForecastTable, label: string) => table.rows.find(entry => entry.label === label);

    it("the balance sheet balances in every month, and the cash flow ties to cash", () => {
        const { forecast } = run(true);
        const assets = row(forecast.balanceSheet, "Total assets")!.values;
        const claims = row(forecast.balanceSheet, "Total liabilities and equity")!.values;
        assets.forEach((amount, index) => expect(Math.abs(amount - claims[index])).toBeLessThan(0.01));
    });

    it("shows the calculated lines: on-costs, fees, depreciation and amortisation, the opening inventory sold, the accumulated start-up row", () => {
        const { forecast } = run(true);
        const labels = forecast.profitAndLoss.rows.map(entry => entry.label);
        for (const label of ["Employer on-costs", "Channel fees", "Cost of opening inventory sold", "Depreciation (cost of sales)", "Amortisation (cost of sales)", "Accumulated Start-up & Pre-Operating Expenses"]) {
            expect(labels).toContain(label);
        }
        // (Written off in April, the first operating month; not in the months before.)
        const accumulated = row(forecast.profitAndLoss, "Accumulated Start-up & Pre-Operating Expenses")!.values;
        expect(accumulated.slice(0, 3)).toEqual([0, 0, 0]);
        expect(accumulated[3]).toBeGreaterThan(0);
        expect(forecast.balanceSheet.rows.map(entry => entry.label)).toEqual(expect.arrayContaining(["Inventory", "Intangible assets (net of amortisation)", "Equipment (net of depreciation)"]));
    });

    it("keeps the cash of the Startup Expenses in the months they fall", () => {
        const { forecast } = run(true);
        const rent = row(forecast.cashFlow, "Utilities")!.values;
        expect(rent.slice(0, 3).every(amount => amount < 0)).toBe(true);
    });

    it("income tax uses the rate of Page 4's Plan Settings", () => {
        const { forecast } = run(true);
        expect(forecast.profitAndLoss.rows.map(entry => entry.label)).toContain("Income tax");
        expect(forecast.notes.join(" ")).toMatch(/20%/);
    });

    it("without the calculated lines the forecast is as it was", () => {
        const { forecast } = run(false);
        const labels = forecast.profitAndLoss.rows.map(entry => entry.label);
        expect(labels).not.toContain("Employer on-costs");
        expect(labels).not.toContain("Accumulated Start-up & Pre-Operating Expenses");
    });

});

describe("the fees a subchannel pays (doc 50, section 1.4; owner, 2026-11-14 12:00)", () => {
    const table = createGlobalSettings().channelFees;

    test("the defaults start from the checked rates, Stripe Terminal before Stripe, each country its own row (owner, 2026-11-15 15:10)", () => {
        expect(channelFeeRowFor("Stripe Terminal reader", table)?.commission).toBe("1.4");
        expect(channelFeeRowFor("Stripe", table)).toMatchObject({ commission: "1.5", fixedFee: "0.20", country: "GB" });
        expect(channelFeeRowFor("PayPal", table)).toMatchObject({ commission: "2.9", fixedFee: "0.30" });
        expect(channelFeeRowFor("PayPal", table)?.note).toContain("checked 15/11/2026");
        expect(channelFeeRowFor("Stripe", table, "US")).toMatchObject({ commission: "2.9", fixedFee: "0.30", currency: "USD" });
        expect(channelFeeRowFor("PayPal", table, "NZ")).toMatchObject({ commission: "3.4", fixedFee: "0.45", currency: "NZD" });
        expect(table.filter(row => row.status === "checked").every(row => row.note.includes("checked 15/11/2026"))).toBe(true);
    });

    test("a row with no rate, or not available in the country, is never charged", () => {
        expect(channelFeeRowFor("TikTok Shop", table, "GB")).toBeUndefined();
        expect(channelFeeRowFor("Amazon", table, "NZ")).toBeUndefined();
        expect(channelFeeRowFor("Wolt", table, "US")).toBeUndefined();
        expect(channelFeeRowFor("Amazon", table, "AU")?.commission).toBe("13");
    });

    test("a subchannel is matched by its own name, else by its expense cards' names", () => {
        expect(channelFeeFor(["Etsy", "Etsy listing fees"], table)?.by).toBe("Etsy");
        expect(channelFeeFor(["Card", "Card reader", "SumUp card reader"], table)).toMatchObject({ by: "SumUp card reader", row: { channel: "SumUp" } });
        expect(channelFeeFor(["Online Store", "Shopify Basic"], table)).toBeUndefined();
    });

    test("the fee on a sale: the sale x (commission + chargeback) + the fixed fee (Etsy on a £95 sale: about £10.18)", () => {
        const etsy = channelFeeRowFor("Etsy", table)!;
        expect(channelFeeOf(etsy, 95, 1)).toBeCloseTo(10.18, 1);
    });
});

/* A SHARE OF REVENUE IS A RATE, NOT A SPLIT, in the forecast as in the Inventory (owner, 2026-11-14 23:30 and 20:25; 2026-11-15 15:32). */
describe("a share of revenue charged on each Offering's own revenue", () => {

    function twoOfferings(shares: Record<string, string>) {
        const base = asBusinessCapabilityValue(undefined);
        const agent = { ...createBusinessPartner("Agent", "partners"), id: "agent", name: "Agent", group: "revenue-partners", costOption: "sales-agents", offeringIds: ["o1", "o2"], offeringShares: shares, startDate: "2027-01-01", cost: cost("2", "percent-revenue") };
        const value = asBusinessCapabilityValue({ ...base, offering: { ...base.offering, professionals: [agent] } });
        const foundation = { ...asFinancialFoundationValue({}), planStart: PLAN, planYears: "1" };
        const stream = (offeringId: string, price: string) => ({ ...createRevenueStream(), offeringId, price, volume: "100", start: { month: "04", year: "2027" }, frequency: "one-time" as const, itemsPerOrder: "1" });
        const revenuePage = asFinancialSustainabilityValue({ streams: [stream("o1", "60"), stream("o2", "40")] });
        const lines = consolidateCosts(foundation, { legalEntity: asLegalEntityValue({}), capability: value, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: false });
        return { lines, revenuePage, result: calculatedLines({ foundation, revenuePage, lines, capability: value, settings: createGlobalSettings(), openingDate: OPENING, drawings: false }) };
    }

    it("2% of A's 6,000 and B's 4,000 is 120 and 80, whatever the 70/30 shares say", () => {
        const { lines, revenuePage, result } = twoOfferings({ o1: "70", o2: "30" });
        const line = lines.find(entry => entry.id === "agent")!;
        expect(line.offeringShares).toEqual({ o1: 0.7, o2: 0.3 });
        expect(revenueFractions(line.id, ["o1", "o2"], undefined, revenuePage)).toEqual({ o1: 1, o2: 1 });
        expect(result.percentageLines[0].values[3]).toBe(200);
    });

    it("with no shares saved, both carry the full rate", () => {
        expect(twoOfferings({}).result.percentageLines[0].values[3]).toBe(200);
    });

    it("a channel's share of revenue: only what each Offering sells through the expense's own subchannels", () => {
        const revenuePage = asFinancialSustainabilityValue({ streams: [{ ...createRevenueStream(), offeringId: "o1", price: "10" }, { ...createRevenueStream(), offeringId: "o2", price: "10" }] });
        const sources = (online: string, market: string) => ({ ...createDemand(), sources: [{ ...createDemandSource("other"), id: "s1", channelId: "web", estimate: online }, { ...createDemandSource("other"), id: "s2", channelId: "market", estimate: market }] });
        const engagement = asBusinessEngagementValue({
            segments: [{ segmentId: "seg", channels: [{ id: "web", category: "Website", name: "Online Store", offerings: ["*"], stages: [] }, { id: "market", category: "In Person", name: "Market / Pop-up", offerings: ["*"], stages: [] }] }],
            channelResources: [{ id: "link", segmentId: "seg", channelId: "web", resourceId: "shopify" }],
            demand: { o1: sources("30", "10"), o2: sources("0", "20") }
        });
        // (o1 sells 30 of its 40 through the Online Store, o2 none of its 20: the Online Store's payment fees fall on 75% of o1's revenue and none of o2's.)
        expect(revenueFractions("shopify", ["o1", "o2"], engagement, revenuePage)).toEqual({ o1: 0.75, o2: 0 });
        // (An expense no subchannel holds: each Offering's whole revenue.)
        expect(revenueFractions("other", ["o1", "o2"], engagement, revenuePage)).toEqual({ o1: 1, o2: 1 });
    });

});
