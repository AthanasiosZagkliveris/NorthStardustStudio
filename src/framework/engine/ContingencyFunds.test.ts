import { describe, expect, it } from "vitest";

import { contingencyFunds, monthlyOpExOf } from "./ContingencyFunds";
import { createGlobalSettings, type GlobalSettingsValue } from "./GlobalSettings";
import type { CostLine, NatureContext } from "./FinancialModel";

/* I6: the Startup Contingency Fund, the cash to raise before the opening, the Operational Contingency Fund (rules F1 to F6). */

const CONTEXT: NatureContext = { openingDate: "2027-04-01", capitalisationLimit: 500 };

const line = (fields: Partial<CostLine>): CostLine => ({
    id: "x", name: "x", origin: "infrastructure", sourceLabel: "", group: "operating", behaviour: "fixed", offeringIds: [], offeringId: "",
    amountText: "", amount: 0, quantity: null, unitAmount: null, currency: "EUR", counted: true, frequency: "one-time", frequencyOther: "",
    sourceFrequency: "one-time", month: { month: "", year: "" }, fixedPart: null, variablePerUnit: null, asset: "", own: null, sourcePath: [],
    startDate: "2027-02-01", endDate: "", place: "infrastructure", ...fields
} as CostLine);

/** The cost model's example: CapEx 30,000, pre-operational expenses 5,000 and fixed costs 9,000 make 44,000. */
const BUDGET: CostLine[] = [
    line({ id: "machine", groupId: "devices-tools", physicalAsset: true, amount: 30000, unitAmount: 30000, frequency: "one-time" }),
    line({ id: "fees", groupId: "business-services", amount: 5000, frequency: "one-time" }),
    line({ id: "works", groupId: "premises-utilities", amount: 3000, frequency: "monthly", startDate: "2027-01-01", endDate: "2027-03-31" })
];

const settings = (patch: Partial<GlobalSettingsValue> = {}) => ({ ...createGlobalSettings(), ...patch });

describe("the Startup Contingency Fund (F2) and the cash to raise (F6)", () => {

    it("10% of a Total Pre-operational Budget of 44,000 is 4,400, and 15% is 6,600", () => {
        expect(contingencyFunds(BUDGET, CONTEXT, settings({ startupContingencyRate: "10" })).startupFund).toBe(4400);
        expect(contingencyFunds(BUDGET, CONTEXT, settings({ startupContingencyRate: "15" })).startupFund).toBe(6600);
    });

    it("the cash to raise is the budget + the contingency + the opening inventory, which is outside the contingency base: 44,000 + 4,400 + 8,000 = 56,400", () => {
        const stock = line({ id: "stock", groupId: "materials-stock", place: "offering", frequency: "per-unit", amount: 2, unitAmount: 2, cardQuantity: "4000", startDate: "2027-03-01" });
        const funds = contingencyFunds([...BUDGET, stock], CONTEXT, settings({ startupContingencyRate: "10" }));
        expect(funds.schedule).toMatchObject({ total: 44000, openingInventory: 8000 });
        expect(funds.startupFund).toBe(4400);
        expect(funds.cashToRaise).toBe(56400);
    });

    it("with no Opening Date there is no budget before it", () => {
        const funds = contingencyFunds(BUDGET, { ...CONTEXT, openingDate: "" }, settings());
        expect(funds.schedule.total).toBe(0);
        expect(funds.cashToRaise).toBe(0);
    });

});

describe("the Operational Contingency Fund (F3, F4)", () => {

    const running = [line({ id: "rent", amount: 4000, frequency: "monthly", startDate: "2027-04-01" })];

    it("takes the monthly OpEx of the lines that are OpEx from the opening", () => {
        expect(monthlyOpExOf(running, CONTEXT)).toBe(4000);
        expect(monthlyOpExOf([line({ id: "yarn", amount: 2, frequency: "per-unit", place: "offering" }), ...running], CONTEXT)).toBe(4000);
        expect(monthlyOpExOf([line({ id: "annual", amount: 1200, frequency: "annually", startDate: "2027-04-01" }), ...running], CONTEXT)).toBe(4100);
    });

    it("a target of 3 months of OpEx 4,000 is 12,000", () => {
        const funds = contingencyFunds(running, CONTEXT, settings({ targetReserveMonths: "3" }));
        expect(funds.monthlyOpEx).toBe(4000);
        expect(funds.target).toBe(12000);
    });

    it("months to reach the target: startup fund 4,400, OpEx 4,000, target 12,000 takes 64 months at 3%, 38 at 5%, 19 at 10%", () => {
        const withFund = [...BUDGET.slice(0, 2), line({ id: "works", amount: 3000, frequency: "monthly", startDate: "2027-01-01", endDate: "2027-03-31" }), ...running];
        for (const [rate, months] of [["3", 64], ["5", 38], ["10", 19]] as const) {
            const funds = contingencyFunds(withFund, CONTEXT, settings({ startupContingencyRate: "10", operationalContingencyRate: rate }));
            expect(funds.startupFund).toBe(4400);
            expect(funds.monthsToTarget).toBe(months);
        }
    });

    it("startup fund 6,600 at 3% takes 45 months", () => {
        const withFund = [...BUDGET.slice(0, 2), line({ id: "works", amount: 3000, frequency: "monthly", startDate: "2027-01-01", endDate: "2027-03-31" }), ...running];
        expect(contingencyFunds(withFund, CONTEXT, settings({ startupContingencyRate: "15", operationalContingencyRate: "3" })).monthsToTarget).toBe(45);
    });

    it("nothing is set aside when the startup fund already equals the target", () => {
        const funds = contingencyFunds([...BUDGET, ...running], CONTEXT, settings({ startupContingencyRate: "15", targetReserveMonths: "1" }));
        expect(funds.monthsToTarget).toBe(0);
        expect(funds.contributions.every(amount => amount === 0)).toBe(true);
    });

    it("the fund starts at the opening with the startup fund and grows by the monthly share until it reaches the target (4,000 at 4% is 160 a month)", () => {
        const withFund = [...BUDGET.slice(0, 2), line({ id: "works", amount: 3000, frequency: "monthly", startDate: "2027-01-01", endDate: "2027-03-31" }), ...running];
        const funds = contingencyFunds(withFund, CONTEXT, settings({ startupContingencyRate: "10", operationalContingencyRate: "4", targetReserveMonths: "3" }), {}, undefined);
        // (The opening is April, the model's index 3 from a January start; without the calculated result the opening month is taken as the first.)
        const first = funds.contributions.findIndex(amount => amount > 0);
        expect(funds.contributions[first]).toBe(160);
        expect(Math.max(...funds.balance)).toBe(12000);
        expect(funds.contributions.filter(amount => amount > 0).length).toBe(48);
    });

    it("cannot be reached with no OpEx or no rate", () => {
        expect(contingencyFunds([], CONTEXT, settings()).monthsToTarget).toBe(0);
        expect(contingencyFunds(running, CONTEXT, settings({ operationalContingencyRate: "" })).monthsToTarget).toBeNull();
    });

});
