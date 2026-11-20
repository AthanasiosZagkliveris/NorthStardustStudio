import { describe, expect, it } from "vitest";

import { asBusinessCapabilityValue, asLegalEntityValue } from "./AnswerUtils";
import { survivalMinimum } from "./AnswerLegal";
import { asFinancialFoundationValue, consolidateCosts } from "./FinancialModel";
import { expenseNature } from "./FinancialForecast";
import { salariedFounderIds } from "./LegalStarts";

/* THE OWNER'S MINIMUM PAY AND THE PERSONAL SURVIVAL BUDGET (doc 48, section 13, step 2 and decision (d); Start Up Loans). */

const legalFounder = (id: string, name: string, extra: object = {}) => ({ id, name, ownership: "100", capital: "", roles: [""], experience: "", ...extra });

function linesFor(salary: string, budget: object) {
    const legalEntity = asLegalEntityValue({ founders: [legalFounder("ann", "Ann Lee", budget)] });
    const capability = asBusinessCapabilityValue({ ...asBusinessCapabilityValue(undefined), founders: [{ id: "ann", name: "Ann Lee", salary, period: "", startDate: "2027-01-01" }] });
    return consolidateCosts(asFinancialFoundationValue({}), { legalEntity, capability, resourceGroupLabels: {}, subsectionLabels: {}, currency: "GBP", foundersLinked: true });
}

describe("the Personal Survival Budget", () => {

    it("gives the household's costs less its income, never below nothing, and nothing with no costs typed", () => {
        expect(survivalMinimum({ householdIncome: "900", householdCosts: "2,100" })).toBe(1200);
        expect(survivalMinimum({ householdCosts: "1500" })).toBe(1500);
        expect(survivalMinimum({ householdIncome: "3000", householdCosts: "2000" })).toBe(0);
        expect(survivalMinimum({ householdIncome: "900", householdCosts: "" })).toBeNull();
        expect(survivalMinimum({})).toBeNull();
    });

    it("is kept on the Legal Entity's founder only once typed: a founder saved before stays as it was", () => {
        const before = asLegalEntityValue({ founders: [legalFounder("ann", "Ann Lee")] }).founders[0];
        expect("householdIncome" in before).toBe(false);
        const typed = asLegalEntityValue({ founders: [legalFounder("ann", "Ann Lee", { householdIncome: "900", householdCosts: "2100" })] }).founders[0];
        expect([typed.householdIncome, typed.householdCosts]).toEqual(["900", "2100"]);
    });

    it("is asked only of a founder the business pays no salary", () => {
        const capability = { ...asBusinessCapabilityValue(undefined), founders: [{ id: "ann", name: "Ann Lee", salary: "1800", period: "" }, { id: "bo", name: "Bo Park", salary: "", period: "" }] };
        expect(salariedFounderIds(capability)).toEqual(["ann"]);
        expect(salariedFounderIds(undefined)).toEqual([]);
    });
});

describe("the owner's minimum pay in Costs", () => {

    it("is a monthly line of its own, under Founders, read as founders' pay, where no salary is set", () => {
        const line = linesFor("", { householdIncome: "900", householdCosts: "2100" }).find(entry => entry.id === "owner-pay-ann");
        expect(line?.name).toBe("Owner's minimum pay: Ann Lee");
        expect(line?.amount).toBe(1200);
        expect(line?.frequency).toBe("monthly");
        expect(line?.startDate).toBe("2027-01-01");
        expect(line && expenseNature(line)).toBe("Salaries");
    });

    it("is not counted where the founder has a salary, nor where the household needs nothing from the business", () => {
        expect(linesFor("1800", { householdCosts: "2100" }).some(entry => entry.id === "owner-pay-ann")).toBe(false);
        expect(linesFor("", { householdIncome: "3000", householdCosts: "2100" }).some(entry => entry.id === "owner-pay-ann")).toBe(false);
        expect(linesFor("", {}).some(entry => entry.id.startsWith("owner-pay-"))).toBe(false);
    });
});
