import { describe, expect, it } from "vitest";

import {
    asBusinessCapabilityValue,
    asLegalEntityValue,
    createBusinessPartner,
    createBusinessResourceSlot,
    instalmentLines
} from "./AnswerUtils";
import { calculatedLines } from "./CalculatedLines";
import { financialForecast } from "./FinancialForecast";
import {
    asFinancialFoundationValue,
    asFinancialSustainabilityValue,
    breakEvenInputs,
    consolidateCosts,
    costSchedule,
    createRevenueStream,
    isProjectPayment,
    isScheduled,
    natureSplitOf,
    projectPayments,
    spentBeforePlan
} from "./FinancialModel";
import { createGlobalSettings } from "./GlobalSettings";

/* I8: a Per project card is paid by its payment plan (rule X9); a Per unit cost follows the units sold. */

const cost = (price: string, frequency: string, unit = "") => ({ price, frequency, frequencyOther: "", unit, currency: "" });
const PLAN = { month: "01", year: "2027" };

const plan = (type: string, lines: { percent: string; date?: string; title?: string }[], count = "") =>
    ({ on: true, type, count, lines: lines.map((line, at) => ({ id: "p" + at, title: line.title ?? "", percent: line.percent, date: line.date ?? "" })) });

const venue = (fields: Record<string, unknown> = {}) =>
    ({ ...createBusinessPartner("Venue", "suppliers"), id: "venue", name: "Venue", group: "venues-organisers", offeringIds: ["o1"], startDate: "2027-03-10", cost: cost("2000", "per-project"), ...fields });

function linesFor(partner: object, extra: object = {}) {
    const base = asBusinessCapabilityValue(undefined);
    const capability = asBusinessCapabilityValue({ ...base, ...extra, offering: { ...base.offering, ...(extra as { offering?: object }).offering, providers: [partner] } });
    const foundation = { ...asFinancialFoundationValue({}), planStart: PLAN, planYears: "1" };
    const lines = consolidateCosts(foundation, { legalEntity: asLegalEntityValue({}), capability, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: false });
    return { capability, foundation, lines, line: lines.find(entry => entry.id === "venue")! };
}

describe("a Per project card, paid in full or by its plan", () => {

    it("not ticked: the whole price on its Start date", () => {
        const { line } = linesFor(venue());
        expect(isProjectPayment(line)).toBe(true);
        expect(isScheduled(line)).toBe(true);
        const schedule = costSchedule(line, PLAN);
        expect(schedule[2]).toBe(2000);
        expect(schedule.reduce((sum, amount) => sum + amount, 0)).toBe(2000);
    });

    it("Deposit & Balance: a percent on the Start date, the rest on the End date (or its own date)", () => {
        const { line } = linesFor(venue({ endDate: "2027-06-20", paymentPlan: plan("deposit-balance", [{ percent: "50" }, { percent: "50" }]) }));
        const schedule = costSchedule(line, PLAN);
        expect([schedule[2], schedule[5]]).toEqual([1000, 1000]);
        const own = linesFor(venue({ paymentPlan: plan("deposit-balance", [{ percent: "30" }, { percent: "70", date: "2027-08-01" }]) })).line;
        expect(projectPayments(own, PLAN)).toEqual([{ index: 2, amount: 600 }, { index: 7, amount: 1400 }]);
    });

    it("Instalments: equal payments from the Start date to the End date", () => {
        const dated = instalmentLines(3, "2027-03-10", "2027-05-10");
        const { line } = linesFor(venue({ endDate: "2027-05-10", paymentPlan: { on: true, type: "instalments", count: "3", lines: dated } }));
        const schedule = costSchedule(line, PLAN);
        expect(schedule.slice(2, 5).map(amount => Math.round(amount))).toEqual([666, 666, 668]);
        expect(Math.round(schedule.reduce((sum, amount) => sum + amount, 0) * 100) / 100).toBe(2000);
    });

    it("Milestones: a percent on each stage's date", () => {
        const { line } = linesFor(venue({ paymentPlan: plan("milestones", [
            { title: "Application", percent: "20", date: "2027-03-10" },
            { title: "Audit", percent: "30", date: "2027-05-02" },
            { title: "Issue", percent: "50", date: "2027-09-30" }
        ]) }));
        expect(projectPayments(line, PLAN)).toEqual([{ index: 2, amount: 400 }, { index: 4, amount: 600 }, { index: 8, amount: 1000 }]);
    });

    it("the plan moves the cash, not the cost: the total is the same, and Qty counts the projects", () => {
        const { line } = linesFor(venue({ cost: cost("2000", "per-project"), paymentPlan: plan("milestones", [{ percent: "50", date: "2027-03-10" }, { percent: "50", date: "2027-07-01" }]) }));
        const total = (x: typeof line) => costSchedule(x, PLAN).reduce((sum, amount) => sum + amount, 0);
        expect(total(line)).toBe(2000);
    });

    it("a plan that is not complete (the percents do not total 100%) leaves the price paid in full on the Start date", () => {
        const { line } = linesFor(venue({ paymentPlan: plan("milestones", [{ percent: "50", date: "2027-03-10" }, { percent: "30", date: "2027-07-01" }]) }));
        expect(projectPayments(line, PLAN)).toEqual([{ index: 2, amount: 2000 }]);
    });

    it("a payment dated before the plan is already spent", () => {
        const { line } = linesFor(venue({ startDate: "2026-11-05", endDate: "2027-02-10", paymentPlan: plan("deposit-balance", [{ percent: "40" }, { percent: "60" }]) }));
        expect(spentBeforePlan([line], PLAN)).toBe(800);
        const schedule = costSchedule(line, PLAN);
        expect(schedule[1]).toBe(1200);
        expect(schedule.reduce((sum, amount) => sum + amount, 0)).toBe(1200);
    });

    it("a Per project card of Qty 3 is three projects", () => {
        const slot = { ...createBusinessResourceSlot(), id: "venue", name: "Pitch", status: "costs", category: "workspace", group: "site-hire", offeringIds: ["o1"], quantity: "3", startDate: "2027-03-10", cost: cost("500", "per-project") };
        const base = asBusinessCapabilityValue(undefined);
        const capability = asBusinessCapabilityValue({ ...base, offering: { ...base.offering, resources: [slot] } });
        const foundation = { ...asFinancialFoundationValue({}), planStart: PLAN };
        const lines = consolidateCosts(foundation, { legalEntity: asLegalEntityValue({}), capability, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: false });
        expect(costSchedule(lines.find(entry => entry.id === "venue")!, PLAN)[2]).toBe(1500);
    });

    it("a card with no Start date and no plan is still a cost of each project sold, as in an earlier answer", () => {
        const { line, foundation, lines } = linesFor(venue({ startDate: "" }));
        expect(isProjectPayment(line)).toBe(false);
        expect(isScheduled(line)).toBe(false);
        expect(breakEvenInputs(foundation, lines, []).variableByOffering).toEqual({ o1: 2000 });
    });

    it("a project dated before the opening is wholly in the Total Pre-operational Budget, for all its projects", () => {
        const { line } = linesFor(venue({ startDate: "2027-02-01" }));
        const split = natureSplitOf(line, { openingDate: "2027-04-01", capitalisationLimit: null }, "");
        expect(split.before).toEqual({ nature: "startup", amount: 2000 });
        expect(split.after).toBeNull();
    });

});

describe("a Per unit cost follows the units sold", () => {

    it("is charged on the units of the Offerings it is linked to, month by month, as a cost of sales", () => {
        const yarn = { ...createBusinessResourceSlot(), id: "yarn", name: "Yarn", status: "costs", category: "materials", group: "materials-stock", offeringIds: ["o1"], startDate: "2027-04-01", cost: cost("2", "per-unit", "kg") };
        const base = asBusinessCapabilityValue(undefined);
        const capability = asBusinessCapabilityValue({ ...base, offering: { ...base.offering, resources: [yarn] } });
        const foundation = { ...asFinancialFoundationValue({}), planStart: PLAN, planYears: "1" };
        const stream = { ...createRevenueStream(), offeringId: "o1", price: "100", volume: "100", start: { month: "04", year: "2027" }, frequency: "one-time" as const, itemsPerOrder: "1" };
        const revenuePage = asFinancialSustainabilityValue({ streams: [stream] });
        const lines = consolidateCosts(foundation, { legalEntity: asLegalEntityValue({}), capability, resourceGroupLabels: {}, subsectionLabels: {}, currency: "EUR", foundersLinked: false });
        const forecast = financialForecast(foundation, revenuePage, lines, asLegalEntityValue({}), String);
        const sales = forecast.profitAndLoss.rows.find(row => row.label === "Cost of sales (variable costs)")!;
        expect(sales.values.slice(0, 5)).toEqual([0, 0, 0, 200, 200]);
    });

});

describe("the forecast with a payment plan", () => {

    function run(fields: Record<string, unknown>) {
        const found = linesFor(venue(fields));
        const revenuePage = asFinancialSustainabilityValue({ streams: [] });
        const calculated = calculatedLines({ foundation: found.foundation, revenuePage, lines: found.lines, capability: found.capability, settings: createGlobalSettings(), openingDate: "2027-04-01", drawings: false });
        return financialForecast(found.foundation, revenuePage, found.lines, asLegalEntityValue({}), String, calculated);
    }
    const row = (forecast: ReturnType<typeof run>, table: "profitAndLoss" | "balanceSheet" | "cashFlow", label: string) => forecast[table].rows.find(entry => entry.label === label);

    it("counts the whole cost in the month of the Start date, and the cash on the plan's dates", () => {
        const forecast = run({ startDate: "2027-05-10", endDate: "2027-08-10", paymentPlan: plan("deposit-balance", [{ percent: "50" }, { percent: "50" }]) });
        const expense = row(forecast, "profitAndLoss", "Outsourced services")!.values;
        expect(expense[4]).toBe(2000);
        const cash = row(forecast, "cashFlow", "Outsourced services")!.values;
        expect([cash[4], cash[7]]).toEqual([-1000, -1000]);
    });

    it("owes what is not yet paid under the plan, and the balance sheet still balances", () => {
        const forecast = run({ startDate: "2027-05-10", endDate: "2027-08-10", paymentPlan: plan("deposit-balance", [{ percent: "50" }, { percent: "50" }]) });
        const due = row(forecast, "balanceSheet", "Payments due under payment plans")!.values;
        expect(due[4]).toBe(1000);
        expect(due[6]).toBe(1000);
        expect(due[7]).toBe(0);
        const assets = row(forecast, "balanceSheet", "Total assets")!.values;
        const claims = row(forecast, "balanceSheet", "Total liabilities and equity")!.values;
        assets.forEach((amount, index) => expect(Math.abs(amount - claims[index])).toBeLessThan(0.01));
    });

    it("holds as prepaid what is paid before the cost is incurred", () => {
        const forecast = run({ startDate: "2027-05-10", paymentPlan: plan("milestones", [{ percent: "50", date: "2027-03-01" }, { percent: "50", date: "2027-05-10" }]) });
        const prepaid = row(forecast, "balanceSheet", "Prepaid expenses")!.values;
        expect(prepaid[2]).toBe(1000);
        expect(prepaid[4]).toBe(0);
    });

});
