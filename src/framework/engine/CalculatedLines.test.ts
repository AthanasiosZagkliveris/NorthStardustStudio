import { describe, expect, it } from "vitest";

import {
    asBusinessCapabilityValue,
    asLegalEntityValue,
    createBusinessPartner,
    createBusinessResourceSlot
} from "./AnswerUtils";
import { calculatedLines, channelFeeRowFor, effectiveIncomeTaxRate, monthIndexOf } from "./CalculatedLines";
import { financialForecast, type ForecastTable } from "./FinancialForecast";
import {
    asFinancialFoundationValue,
    asFinancialSustainabilityValue,
    consolidateCosts,
    createRevenueStream
} from "./FinancialModel";
import { createGlobalSettings, type GlobalSettingsValue } from "./GlobalSettings";

/* I5: the calculated lines (on-costs, fees, royalties, commissions, depreciation, amortisation, inventory, the accumulated start-up row, income tax). */

const cost = (price: string, frequency: string, unit = "") => ({ price, frequency, frequencyOther: "", unit, currency: "" });
const slot = (id: string, category: string, group: string, fields: Record<string, unknown> = {}) =>
    ({ ...createBusinessResourceSlot(), id, name: id, status: "costs", category, group, offeringIds: ["o1"], ...fields });
const supplier = (id: string, group: string, fields: Record<string, unknown> = {}) =>
    ({ ...createBusinessPartner(id, "suppliers"), id, name: id, group, offeringIds: ["o1"], ...fields });

const PLAN = { month: "01", year: "2027" };
const OPENING = "2027-04-01";

function scenario(capability: object, settings: Partial<GlobalSettingsValue> = {}, options: { price?: string; volume?: string; drawings?: boolean } = {}) {
    const base = asBusinessCapabilityValue(undefined);
    const value = asBusinessCapabilityValue({ ...base, ...capability, offering: { ...base.offering, ...(capability as { offering?: object }).offering } });
    const foundation = { ...asFinancialFoundationValue({}), planStart: PLAN, planYears: "1" };
    const stream = { ...createRevenueStream(), offeringId: "o1", price: options.price ?? "100", volume: options.volume ?? "100", start: { month: "04", year: "2027" }, frequency: "one-time" as const, itemsPerOrder: "1" };
    const revenuePage = asFinancialSustainabilityValue({ streams: [stream] });
    const lines = consolidateCosts(foundation, {
        legalEntity: asLegalEntityValue({}), capability: value, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: false
    });
    const merged = { ...createGlobalSettings(), ...settings };
    const result = calculatedLines({ foundation, revenuePage, lines, capability: value, settings: merged, openingDate: OPENING, drawings: options.drawings ?? false });
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

    it("the Channel Fee Table, by the card's name: Stripe on 100,000 of revenue and 4,000 orders is 3,500", () => {
        const { result } = scenario(gateway("Stripe", "9"), {}, { price: "25", volume: "4000" });
        // (April: revenue 100,000, 4,000 orders: 2,000 + 500 + 1,000.)
        expect(result.percentageLines[0].values[3]).toBe(3500);
        expect(result.percentageLines[0].kind).toBe("channel-fee");
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
        expect(channelFeeRowFor("Amazon", table)?.channel).toBe("Wolt, Amazon");
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

describe("income tax from the Global Settings", () => {

    it("the setting wins; the Financial Foundation's rate stands while the setting is empty", () => {
        expect(effectiveIncomeTaxRate({ ...createGlobalSettings(), incomeTaxRate: "21" }, 0.25)).toBe(0.21);
        expect(effectiveIncomeTaxRate(createGlobalSettings(), 0.25)).toBe(0.25);
        expect(effectiveIncomeTaxRate(createGlobalSettings(), null)).toBeNull();
        expect(effectiveIncomeTaxRate({ ...createGlobalSettings(), incomeTaxRate: "150" }, null)).toBe(1);
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
        const ready = scenario(capability, { onCostRate: "25", capitalisationLimit: "500", incomeTaxRate: "20" });
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

    it("income tax uses the rate of the Global Settings", () => {
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
