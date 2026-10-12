import { describe, expect, it } from "vitest";

import {
    asBusinessCapabilityValue,
    asLegalEntityValue,
    createBusinessPartner,
    createBusinessResourceSlot
} from "./AnswerUtils";
import {
    asFinancialFoundationValue,
    assetUnitCostsOf,
    consolidateCosts,
    natureSplitOf,
    preOperationalSchedule,
    type CostLine,
    type NatureContext
} from "./FinancialModel";

/* I4: the cost nature rules (C1 to C16), the capitalisation limit on one unit, services bundled into the asset, Startup and Pre-Operating Expenses. */

const cost = (price: string, frequency: string, unit = "") => ({ price, frequency, frequencyOther: "", unit, currency: "" });
const slot = (id: string, category: string, group: string, fields: Record<string, unknown> = {}) =>
    ({ ...createBusinessResourceSlot(), id, name: id, status: "costs", category, group, offeringIds: ["*"], ...fields });

function linesOf(capability: object, legalExpenses: object[] = []) {
    // (Starting from a current value: a bare object reads as an earlier answer and is migrated.)
    const value = asBusinessCapabilityValue({ ...asBusinessCapabilityValue(undefined), ...capability });
    const lines = consolidateCosts(asFinancialFoundationValue({}), {
        legalEntity: asLegalEntityValue({ expenses: legalExpenses }),
        capability: value,
        resourceGroupLabels: {},
        subsectionLabels: {},
        currency: "EUR",
        foundersLinked: false
    });
    return { value, lines, line: (id: string) => lines.find(entry => entry.id === id) as CostLine };
}

const infra = (category: string, group: string, slots: object[]) => ({ resources: { [category]: [{ id: group, name: "", slots }] } });
const offering = (resources: object[], rest: object = {}) => ({ offering: { ...asBusinessCapabilityValue(undefined).offering, resources, ...rest } });

const context = (value: ReturnType<typeof asBusinessCapabilityValue>, openingDate: string, capitalisationLimit: number | null): NatureContext =>
    ({ openingDate, capitalisationLimit, assetUnitCosts: assetUnitCostsOf(value) });

describe("rule C1: a card split around the Opening Date", () => {

    it("rent of 1,500 from 3 months before the opening is 4,500 of Pre-Operating Expense, then OpEx", () => {
        const { value, line } = linesOf(infra("utilities", "premises-utilities", [slot("rent", "utilities", "premises-utilities", { startDate: "2027-01-01", cost: cost("1500", "monthly") })]));
        const split = natureSplitOf(line("rent"), context(value, "2027-04-01", null));
        expect(split.before).toEqual({ nature: "pre-operating", amount: 4500 });
        expect(split.after).toBe("opex");
    });

    it("a one-time cost dated before the opening is wholly a Startup Expense", () => {
        const { value, line } = linesOf({}, [{ id: "inc", name: "Incorporation fee", cost: "1200", frequency: "One time", date: "2027-01-15" }]);
        const split = natureSplitOf(line("legal-inc"), context(value, "2027-04-01", null));
        expect(split).toEqual({ before: { nature: "startup", amount: 1200 }, after: null });
    });

    it("the same one-time cost dated from the opening is OpEx (C15), and a cost with no date follows the rules from the opening", () => {
        const { value, line } = linesOf({}, [{ id: "inc", name: "Agent fee", cost: "300", frequency: "One time", date: "2027-05-01" }]);
        expect(natureSplitOf(line("legal-inc"), context(value, "2027-04-01", null))).toEqual({ before: null, after: "opex" });
        expect(natureSplitOf(line("legal-inc"), context(value, "", null))).toEqual({ before: null, after: "opex" });
    });

    it("a manual change applies from the opening only: the months before it stay in the budget (C13)", () => {
        const { value, line } = linesOf(infra("utilities", "premises-utilities", [slot("rent", "utilities", "premises-utilities", { startDate: "2027-01-01", cost: cost("1500", "monthly") })]));
        const split = natureSplitOf(line("rent"), context(value, "2027-04-01", null), "cogs");
        expect(split.before).toEqual({ nature: "pre-operating", amount: 4500 });
        expect(split.after).toBe("cogs");
    });

});

describe("rule C4 and the capitalisation limit on one unit", () => {

    const laptops = (quantity: string, price: string, startDate: string) => linesOf(infra("equipment", "devices-tools", [slot("laptop", "equipment", "devices-tools", { quantity, startDate, cost: cost(price, "per-unit", "item") })]));

    it("a laptop at 1,500 with a limit of 500 is CapEx; 3 stools at 120 each are OpEx", () => {
        const one = laptops("1", "1500", "2027-06-01");
        expect(natureSplitOf(one.line("laptop"), context(one.value, "2027-04-01", 500), "").after).toBe("capex");
        const stools = linesOf(infra("workstation", "furniture-fittings", [slot("stools", "workstation", "furniture-fittings", { quantity: "3", startDate: "2027-06-01", cost: cost("120", "per-unit", "item") })]));
        expect(natureSplitOf(stools.line("stools"), context(stools.value, "2027-04-01", 500), "").after).toBe("opex");
    });

    it("before the opening an asset below the limit is a Startup Expense, not OpEx", () => {
        const stools = linesOf(infra("workstation", "furniture-fittings", [slot("stools", "workstation", "furniture-fittings", { quantity: "3", startDate: "2027-02-01", cost: cost("120", "per-unit", "item") })]));
        expect(natureSplitOf(stools.line("stools"), context(stools.value, "2027-04-01", 500), "").before).toEqual({ nature: "startup", amount: 360 });
        const laptop = laptops("1", "1500", "2027-02-01");
        expect(natureSplitOf(laptop.line("laptop"), context(laptop.value, "2027-04-01", 500), "").before).toEqual({ nature: "capex", amount: 1500 });
    });

    it("with no limit set, a purchase of a physical asset is an asset", () => {
        const one = laptops("1", "20", "2027-06-01");
        expect(natureSplitOf(one.line("laptop"), context(one.value, "2027-04-01", null), "").after).toBe("capex");
    });

});

describe("rule C2: a service linked to an asset is added to it", () => {

    const oven = (limit: number) => {
        const technician = { ...createBusinessPartner("Electrician", "suppliers"), id: "elec", name: "Electrician", group: "technical-support", startDate: "2027-06-01", cost: cost("800", "per-project") };
        const capability = {
            ...infra("equipment", "devices-tools", [slot("oven", "equipment", "devices-tools", {
                quantity: "1", startDate: "2027-06-01", cost: cost("4000", "per-unit", "item"),
                extraStatuses: [{ id: "x", status: "partners-suppliers", providerId: "elec", activityId: "" }]
            })]),
            providers: [technician]
        };
        const found = linesOf(capability);
        return { ...found, limit, ctx: context(found.value, "2027-04-01", limit) };
    };

    it("an oven of 4,000 and an installation of 800 are one asset of 4,800: CapEx at a limit of 4,500, though the oven alone is below it", () => {
        const { line, ctx } = oven(4500);
        expect(ctx.assetUnitCosts).toEqual({ oven: 4800 });
        expect(natureSplitOf(line("oven"), ctx, "").after).toBe("capex");
        expect(natureSplitOf(line("elec"), ctx, "").after).toBe("capex");
    });

    it("the installation is bundled whatever its own invoice size", () => {
        const { line, ctx } = oven(100000);
        expect(natureSplitOf(line("elec"), ctx, "").after).toBe("capex");
        expect(natureSplitOf(line("oven"), ctx, "").after).toBe("opex");
    });

    it("a service with no link is a Startup Expense before the opening and OpEx after it", () => {
        const technician = { ...createBusinessPartner("Plumber", "suppliers"), id: "plumb", name: "Plumber", group: "technical-support", cost: cost("300", "per-project") };
        const early = linesOf({ providers: [{ ...technician, startDate: "2027-02-01" }] });
        expect(natureSplitOf(early.line("plumb"), context(early.value, "2027-04-01", 500), "")).toEqual({ before: { nature: "startup", amount: 300 }, after: null });
        const late = linesOf({ providers: [{ ...technician, startDate: "2027-06-01" }] });
        expect(natureSplitOf(late.line("plumb"), context(late.value, "2027-04-01", 500), "")).toEqual({ before: null, after: "opex" });
    });

});

describe("rule C3: a lump sum by its cost option", () => {

    const licence = (option: string, group: string, category: string) => linesOf(offering([slot("l1", category, group, { costOption: option, startDate: "2027-02-01", cost: cost("20000", "one-time") })]));

    it("an upfront franchise fee is an intangible asset: CapEx, the limit never applies to it", () => {
        const { value, line } = licence("franchise-fee", "royalties", "documents");
        expect(natureSplitOf(line("l1"), context(value, "2027-04-01", 500_000), "").before).toEqual({ nature: "capex", amount: 20000 });
    });

    it("a set-up fee or an initial licence is a Startup Expense, never amortised", () => {
        const { value, line } = licence("initial-permit", "licences", "documents");
        expect(natureSplitOf(line("l1"), context(value, "2027-04-01", 500), "").before).toEqual({ nature: "startup", amount: 20000 });
    });

    it("from the opening a set-up fee is a one-time OpEx and a franchise fee stays an asset (amortised from its purchase date)", () => {
        const set = linesOf(offering([slot("l1", "documents", "licences", { costOption: "initial-permit", startDate: "2027-06-01", cost: cost("300", "one-time") })]));
        expect(natureSplitOf(set.line("l1"), context(set.value, "2027-04-01", 500), "").after).toBe("opex");
        const franchise = linesOf(offering([slot("l1", "documents", "royalties", { costOption: "franchise-fee", startDate: "2027-06-01", cost: cost("20000", "one-time") })]));
        expect(natureSplitOf(franchise.line("l1"), context(franchise.value, "2027-04-01", 500), "").after).toBe("capex");
    });

});

describe("rule C5: a Percentage cost is COGS, whatever its date", () => {

    it("a gateway at 2.5% on pre-orders before the opening is COGS and is never charged to the startup fund", () => {
        const { value, line, lines } = linesOf({
            offering: { ...asBusinessCapabilityValue(undefined).offering, providers: [{ ...createBusinessPartner("Stripe", "suppliers"), id: "stripe", name: "Stripe", group: "platforms-payments", costOption: "payment-gateway", startDate: "2027-02-01", offeringIds: ["*"], cost: cost("2.5", "percent-revenue") }] }
        });
        const ctx = context(value, "2027-04-01", 500);
        expect(natureSplitOf(line("stripe"), ctx, "")).toEqual({ before: null, after: "cogs" });
        expect(preOperationalSchedule(lines, ctx).total).toBe(0);
    });

});

describe("rules C6 to C8 and C15 from the opening", () => {

    it("an Offering card with a Per unit or Per project driver, or in Materials, Delivery Team, Delivery Running Costs or Site Hire, is COGS", () => {
        const found = linesOf(offering([
            slot("yarn", "materials", "materials-stock", { startDate: "2027-06-01", cost: cost("2", "per-unit", "kg") }),
            slot("weaver", "hr", "delivery-team", { startDate: "2027-06-01", cost: cost("2000", "monthly") }),
            slot("pitch", "workspace", "site-hire", { startDate: "2027-06-01", cost: cost("100", "per-project") })
        ], {
            providers: [{ ...createBusinessPartner("Dye works", "suppliers"), id: "dye", name: "Dye works", group: "contractors-advisers", startDate: "2027-06-01", offeringIds: ["*"], cost: cost("500", "per-project") }]
        }));
        const ctx = context(found.value, "2027-04-01", 500);
        for (const id of ["yarn", "weaver", "pitch", "dye"]) {
            expect(natureSplitOf(found.line(id), ctx, "").after).toBe("cogs");
        }
    });

    it("a recurring fixed cost is OpEx, in Infrastructure and in the Offering", () => {
        const found = linesOf({
            ...infra("utilities", "premises-utilities", [slot("power", "utilities", "premises-utilities", { startDate: "2027-06-01", cost: cost("100", "monthly") })]),
            offering: { ...asBusinessCapabilityValue(undefined).offering, resources: [slot("shop", "digital", "sales-delivery-tools", { startDate: "2027-06-01", cost: cost("39", "monthly") })] }
        });
        const ctx = context(found.value, "2027-04-01", 500);
        expect(natureSplitOf(found.line("power"), ctx, "").after).toBe("opex");
        expect(natureSplitOf(found.line("shop"), ctx, "").after).toBe("opex");
    });

    it("an Infrastructure card with a Per unit driver is OpEx (C15)", () => {
        const found = linesOf(infra("vehicles", "vehicle-running-costs", [slot("fuel", "vehicles", "vehicle-running-costs", { startDate: "2027-06-01", cost: cost("1.5", "per-unit", "km") })]));
        expect(natureSplitOf(found.line("fuel"), context(found.value, "2027-04-01", 500), "").after).toBe("opex");
    });

});

describe("rule C14: opening stock", () => {

    it("a Materials & Stock card dated before the opening is a separate cash line outside the budget", () => {
        const found = linesOf(offering([slot("stock", "materials", "materials-stock", { startDate: "2027-03-01", cost: cost("8000", "one-time") })]));
        const ctx = context(found.value, "2027-04-01", 500);
        expect(natureSplitOf(found.line("stock"), ctx, "").before).toEqual({ nature: "inventory", amount: 8000 });
        expect(preOperationalSchedule(found.lines, ctx)).toMatchObject({ openingInventory: 8000, total: 0 });
    });

});

describe("rule F1: the Total Pre-operational Budget", () => {

    it("is CapEx + Startup Expenses + Pre-Operating Expenses: 30,000 + 5,000 + 9,000 = 44,000", () => {
        const found = linesOf({
            resources: {
                ...infra("equipment", "devices-tools", [slot("machine", "equipment", "devices-tools", { quantity: "1", startDate: "2027-02-01", cost: cost("30000", "per-unit", "item") })]).resources,
                ...infra("utilities", "premises-utilities", [slot("rent", "utilities", "premises-utilities", { startDate: "2027-01-01", endDate: "2027-03-31", cost: cost("3000", "monthly") })]).resources
            }
        });
        const lines = [
            found.line("machine"),
            { ...found.line("rent") },
            { ...found.line("machine"), id: "fees", amount: 5000, frequency: "one-time", physicalAsset: false, startDate: "2027-02-10" } as CostLine
        ];
        const schedule = preOperationalSchedule(lines, context(found.value, "2027-04-01", 500));
        expect(schedule).toMatchObject({ capex: 30000, startup: 5000, preOperating: 9000, total: 44000, openingInventory: 0 });
    });

});
