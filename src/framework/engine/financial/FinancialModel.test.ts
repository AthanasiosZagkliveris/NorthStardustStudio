import { workspacesOf } from "../answers/AnswerUtils.ts";
import { describe, expect, test } from "vitest";
import { asBusinessCapabilityValue, asLegalEntityValue, brandInventorySectionsEmpty, strategyFoundationSectionsEmpty, legalEntitySectionsEmpty, legalEntityTotalCapital, legalEntityTotalOwnership, resourceUnitCount, titleWithPeriod } from "../answers/AnswerUtils.ts";
import { asFinancialFoundationValue, breakEvenInputs, consolidateCosts, costSchedule, createFundingSource, createRevenueStream, financialPlanPeriod, offeringCosts, financialPosition, similarCostNames, fundingStanding, loanSchedule, monthlyPrice, numberAsText, parsePercent, parseAmount, planMonth, streamVolumes, type CostSources, type FinancialFoundationValue } from "./FinancialModel.ts";
import { createOwnCost } from "../../../test/financialTestUtils.ts";

const START = { month: "01", year: "2027" };

const month = (m: number, y = 2027) => ({ month: String(m).padStart(2, "0"), year: String(y) });

const format = (amount: number) => String(Math.round(amount));

function sources(overrides: Partial<CostSources> = {}): CostSources {
    return {
        legalEntity: asLegalEntityValue(undefined),
        capability: asBusinessCapabilityValue({ founders: [], professionals: [] }),
        resourceGroupLabels: { utilities: "Utilities" },
        subsectionLabels: { "premises-utilities": "Premises Utilities" },
        currency: "EUR",
        foundersLinked: true,
        ...overrides
    };
}

function foundation(patch: Partial<FinancialFoundationValue> = {}): FinancialFoundationValue {
    return { ...asFinancialFoundationValue({}), planStart: START, ...patch };
}

describe("numbers written back as text", () => {
    test("half a unit is never five hundred", () => {
        expect(parseAmount("0.505")).toBe(0.505);
        expect(parseAmount("1.200")).toBe(1200);
        expect(numberAsText(1.545)).toBe("1.5450");
        expect(parseAmount(numberAsText(1.545))).toBe(1.545);
    });
});

describe("percentages, counts and decimal-only boxes read as decimals", () => {
    test("12.500% is twelve and a half, 33.333% a third", () => {
        expect(parsePercent("12.500")).toBe(12.5);
        expect(parsePercent("33.333")).toBe(33.333);
    });

    test("three owners of 33.333%, 33.333% and 33.334% own it all", () => {
        const entity = asLegalEntityValue({ founders: [
            { id: "a", name: "A", ownership: "33.333" },
            { id: "b", name: "B", ownership: "33.333" },
            { id: "c", name: "C", ownership: "33.334" }
        ] });
        expect(legalEntityTotalOwnership(entity)).toBeCloseTo(100, 6);
    });

    test("money saved as 1.200 or 12.500 keeps its thousands reading", () => {
        expect(monthlyPrice({ ...createRevenueStream(), price: "1.200" })).toBe(1200);
        expect(monthlyPrice({ ...createRevenueStream(), price: "12.500" })).toBe(12500);
        const value = foundation({ costs: [{ ...createOwnCost("operating"), name: "Rent", amount: "1.200", frequency: "monthly" }] });
        expect(consolidateCosts(value, sources()).find(entry => entry.name === "Rent")!.amount).toBe(1200);
    });
});

describe("months", () => {
    test("Month 1 is the plan start; earlier months count as Month 1", () => {
        expect(planMonth(START, month(1))).toBe(1);
        expect(planMonth(START, month(4))).toBe(4);
        expect(planMonth(START, month(2, 2028))).toBe(14);
        expect(planMonth(START, month(11, 2026))).toBe(1);
        expect(planMonth(START, { month: "", year: "" })).toBeNull();
    });
});

describe("cost consolidation", () => {

    test("reads Legal Entity expenses and Page 3 costs, with their sources", () => {

        const legalEntity = asLegalEntityValue({
            expenses: [
                { id: "e1", name: "Registration", cost: "300", frequency: "One time" },
                { id: "e2", name: "Accountant", cost: "80", frequency: "Monthly" },
                { id: "e3", name: "Nothing typed", cost: "", frequency: "Monthly" }
            ]
        });

        const capability = asBusinessCapabilityValue({
            founders: [{ id: "f1", name: "Jean", roles: [], salary: "1500" }],
            workspace: { kind: "office", status: "costs", cost: { price: "400", frequency: "monthly" } },
            resources: {
                utilities: [{
                    id: "internet",
                    slots: [
                        { id: "s1", name: "Fibre", status: "costs", cost: { price: "30", frequency: "monthly" } },
                        { id: "s2", name: "Free wifi", status: "exists", cost: { price: "10" } },
                        { id: "s3", name: "US tool", status: "costs", cost: { price: "20", frequency: "monthly", currency: "USD" } }
                    ]
                }]
            },
            professionals: [],
            providers: [],
            offering: {
                resources: [{ id: "o1", name: "Clay", status: "costs", offeringId: "off-1", cost: { price: "5", frequency: "monthly" } }],
                activities: [], professionals: [], providers: []
            }
        });

        const lines = consolidateCosts(foundation(), sources({ legalEntity, capability }));
        const byId = Object.fromEntries(lines.map(line => [line.id, line]));

        expect(Object.keys(byId).sort()).toEqual(
            ["legal-e1", "legal-e2", "o1", "s1", "s3", "salary-f1", "workspace"].sort());

        expect(byId["legal-e1"].group).toBe("establishment");
        expect(byId["legal-e2"].group).toBe("operating");
        expect(byId["salary-f1"].frequency).toBe("monthly");
        expect(byId.s1.sourceLabel).toBe("Infrastructure → Utilities → Premises Utilities");
        expect(byId.o1.group).toBe("offering");
        expect(byId.o1.offeringId).toBe("off-1");
        expect(byId.s3.counted).toBe(false);
        expect(byId.s1.counted).toBe(true);

    });

    test("the page's classification is laid over a read cost, within its limits", () => {

        const legalEntity = asLegalEntityValue({
            expenses: [{ id: "e2", name: "Accountant", cost: "80", frequency: "Monthly" }]
        });

        const lines = consolidateCosts(
            foundation({ classified: { "legal-e2": { group: "operating", behaviour: "variable" } } }),
            sources({ legalEntity })
        );

        expect(lines[0].group).toBe("operating");
        // Only an Offering's cost can vary with sales, or move into its group.
        expect(lines[0].behaviour).toBe("fixed");
        const moved = consolidateCosts(
            foundation({ classified: { "legal-e2": { group: "offering", offeringId: "o1" } } }),
            sources({ legalEntity })
        );
        expect(moved[0].group).toBe("operating");
        expect(moved[0].offeringId).toBe("");

    });

    test("costs fall in the months their frequency says", () => {

        const cost = { ...createOwnCost("operating"), amount: "120", frequency: "quarterly" as const, month: month(2) };
        const [line] = consolidateCosts(foundation({ costs: [cost] }), sources());
        const schedule = costSchedule(line, START);

        expect(schedule.slice(0, 8)).toEqual([0, 120, 0, 0, 120, 0, 0, 120]);

    });

});

describe("recording costs once, and in the right shape", () => {

    test("a Page 3 price per unit is a variable cost per unit", () => {
        const capability = asBusinessCapabilityValue({
            founders: [],
            offering: {
                resources: [{ id: "kit", name: "Materials kit", status: "costs", offeringId: "off", cost: { price: "12", frequency: "per-unit" } }],
                activities: [], professionals: [], providers: []
            }
        });
        const [line] = consolidateCosts(foundation(), sources({ capability }));
        expect(line.frequency).toBe("per-unit");
        expect(line.behaviour).toBe("variable");
    });

    test("an 'Other' cost can be reclassified on Page 4", () => {
        // (Page 3 has no Other frequency any more; the Legal Entity's expenses can still be recorded as one.)
        const legalEntity = asLegalEntityValue({ expenses: [{ id: "kit", name: "Materials kit", cost: "12", frequency: "Per participant" }] });
        const [line] = consolidateCosts(foundation({ classified: { "legal-kit": { frequency: "per-unit" } } }), sources({ legalEntity }));
        expect(line.frequency).toBe("per-unit");
        expect(line.sourceFrequency).toBe("other");
    });

    test("an old Other frequency on Page 3 is cleared (the card is incomplete till one is chosen) and its words are kept in the description", () => {
        const capability = asBusinessCapabilityValue({
            founders: [],
            offering: {
                resources: [{ id: "kit", name: "Materials kit", status: "costs", offeringId: "off", cost: { price: "12", frequency: "other", frequencyOther: "per participant" } }],
                activities: [], professionals: [], providers: []
            }
        });
        expect(capability.offering.resources[0].cost.frequency).toBe("");
        expect(capability.offering.resources[0].description).toBe("Earlier frequency: per participant.");
    });

    describe("a possible duplicate needs a similar name, the same price and frequency, and the same source", () => {

        const duplicatesOf = (legalEntity: ReturnType<typeof asLegalEntityValue>, capability: ReturnType<typeof asBusinessCapabilityValue>) => {
            const lines = consolidateCosts(foundation(), sources({ legalEntity, capability }));
            return { lines, position: financialPosition(foundation(), lines, legalEntity, "EUR", format) };
        };
        const empty = asLegalEntityValue(undefined);
        const professional = (id: string, name: string, price: string, frequency = "monthly") =>
            ({ id, name, cost: { price, frequency } });

        test("the same name, price and frequency in the same section is flagged, with its text", () => {
            const capability = asBusinessCapabilityValue({
                founders: [],
                professionals: [professional("a", "Accountant", "120"), professional("b", "Accountant (annual accounts)", "120")]
            });
            const { position } = duplicatesOf(empty, capability);
            expect(position.duplicates).toHaveLength(1);
            expect(position.signals.some(signal => signal.title === "Possible Duplicate")).toBe(true);
        });

        test("the same name, price and frequency on two pages, named the same, is flagged", () => {
            const legalEntity = asLegalEntityValue({ expenses: [{ id: "e", name: "Accountant", cost: "120", frequency: "Monthly" }] });
            const capability = asBusinessCapabilityValue({ founders: [], professionals: [professional("p", "Accountant", "120")] });
            expect(duplicatesOf(legalEntity, capability).position.duplicates).toHaveLength(1);
        });

        test("the same name with a different amount is not flagged", () => {
            const legalEntity = asLegalEntityValue({ expenses: [{ id: "e", name: "Accountant (annual accounts)", cost: "150", frequency: "Monthly" }] });
            const capability = asBusinessCapabilityValue({ founders: [], professionals: [professional("p", "Accountant", "120")] });
            expect(duplicatesOf(legalEntity, capability).position.duplicates).toHaveLength(0);
            const same = asBusinessCapabilityValue({ founders: [], professionals: [professional("a", "Accountant", "120"), professional("b", "Accountant", "130")] });
            expect(duplicatesOf(empty, same).position.duplicates).toHaveLength(0);
        });

        test("the same name and amount at a different frequency is not flagged", () => {
            const capability = asBusinessCapabilityValue({
                founders: [],
                professionals: [professional("a", "Accountant", "120"), professional("b", "Accountant", "120", "annually")]
            });
            expect(duplicatesOf(empty, capability).position.duplicates).toHaveLength(0);
        });

        test("Trade mark registration £220 and Trade fair stand £3,000 are not flagged", () => {
            const legalEntity = asLegalEntityValue({ expenses: [{ id: "e", name: "Trade mark registration", cost: "220", frequency: "One time" }] });
            const capability = asBusinessCapabilityValue({ founders: [], professionals: [professional("p", "Trade fair stand", "3000", "one-time")] });
            expect(duplicatesOf(legalEntity, capability).position.duplicates).toHaveLength(0);
            expect(similarCostNames("Trade mark registration", "Trade fair stand")).toBe(false);
        });

        test("similar names, same price, but unconnected sources (different pages, different names) are not flagged", () => {
            const legalEntity = asLegalEntityValue({ expenses: [{ id: "e", name: "Insurance", cost: "50", frequency: "Monthly" }] });
            const capability = asBusinessCapabilityValue({ founders: [], professionals: [professional("p", "Insurance broker fees", "50")] });
            expect(duplicatesOf(legalEntity, capability).position.duplicates).toHaveLength(0);
        });

        test("name similarity is conservative", () => {
            expect(similarCostNames("Accountant (annual accounts)", "Accountant")).toBe(true);
            expect(similarCostNames("Workspace", "Workspace deposit")).toBe(true);
            expect(similarCostNames("Adobe Creative Cloud", "Creative Cloud")).toBe(true);
            expect(similarCostNames("Accountant", "Accounting software")).toBe(false);
            expect(similarCostNames("Adobe Creative Cloud", "Creative Cloud subscription")).toBe(false);
            expect(similarCostNames("Salary: Jean", "Salary: Maya")).toBe(false);
            expect(similarCostNames("", "")).toBe(false);
        });

    });

    test("in-kind contributions are not cash", () => {
        const value = foundation({
            funding: [
                { ...createFundingSource("other"), type: "existing-funds", amount: "1000", status: "received" },
                { ...createFundingSource("other"), type: "in-kind", amount: "1500", status: "received" }
            ]
        });
        const position = financialPosition(value, [], asLegalEntityValue(undefined), "EUR", format);
        expect(position.availableNow).toBe(1000);
        expect(position.nonCash).toBe(1500);
        expect(position.timeline[0].balance).toBe(1000);
    });

    test("only significant obligations are listed", () => {
        const value = foundation({
            costs: [
                { ...createOwnCost("operating"), amount: "2000", frequency: "monthly" },
                { ...createOwnCost("establishment"), name: "Loom", amount: "7200", frequency: "one-time" },
                { ...createOwnCost("operating"), name: "Domain", amount: "14", frequency: "annually" }
            ]
        });
        const lines = consolidateCosts(value, sources());
        const position = financialPosition(value, lines, asLegalEntityValue(undefined), "EUR", format);
        expect(position.obligations.map(entry => entry.what)).toEqual(["Loom"]);
    });

});

describe("resource quantities", () => {

    test("a count other than 1 multiplies the price; empty, 1 or 0 does not", () => {
        expect(resourceUnitCount("8", "one-time")).toBe(8);
        expect(resourceUnitCount(" 2.5 ", "monthly")).toBe(2.5);
        expect(resourceUnitCount("0.5", "monthly")).toBe(0.5);
        expect(resourceUnitCount("1", "one-time")).toBeNull();
        expect(resourceUnitCount("3 tables", "one-time")).toBeNull();
        expect(resourceUnitCount("", "one-time")).toBeNull();
        expect(resourceUnitCount("0", "one-time")).toBeNull();
        expect(resourceUnitCount("8", "per-unit")).toBeNull();
        expect(resourceUnitCount("8", "per-project")).toBeNull();
    });

    test("a saved quantity that is not a number moves into the description", () => {
        const saved = {
            founders: [{ id: "f", name: "A", roles: [], salary: "£1,200" }],
            workspace: { cost: { price: "30 GBP" } },
            resources: {
                workstation: [{
                    id: "furniture",
                    slots: [
                        { id: "a", quantity: "3 tables, 6 shelving units", description: "Oak.", cost: { price: "£30" } },
                        { id: "b", quantity: "6 lamps", description: "" },
                        { id: "c", quantity: "4", cost: { price: "12,5" } }
                    ]
                }]
            }
        };
        const once = asBusinessCapabilityValue(saved);
        const [a, b, c] = once.resources.workstation[0].slots;
        expect(a.quantity).toBe("");
        expect(a.description).toBe("Quantity: 3 tables, 6 shelving units. Oak.");
        expect(a.cost.price).toBe("30");
        expect(b.quantity).toBe("");
        expect(b.description).toBe("Quantity: 6 lamps.");
        expect(c.quantity).toBe("4");
        expect(c.cost.price).toBe("12,5");
        expect(once.founders[0].salary).toBe("1200");
        expect(workspacesOf(once)[0].cost.price).toBe("30");
        expect(asBusinessCapabilityValue(once)).toEqual(once);
    });

});

describe("costs shared by Offerings", () => {

    test("a per-unit cost is paid by each; a fixed one is shared out", () => {

        const capability = asBusinessCapabilityValue({
            offering: {
                resources: [
                    { id: "yarn", name: "Yarn", status: "costs", offeringIds: ["a", "b"],
                        cost: { price: "5", frequency: "per-unit", frequencyOther: "", currency: "" } },
                    { id: "stall", name: "Stall", status: "costs", offeringIds: ["a", "b"],
                        cost: { price: "100", frequency: "monthly", frequencyOther: "", currency: "" } }
                ],
                activities: [], professionals: [], providers: []
            }
        });
        const lines = consolidateCosts(foundation(), sources({ capability }));
        const inputs = breakEvenInputs(foundation(), lines, []);

        expect(inputs.variableByOffering).toEqual({ a: 5, b: 5 });
        expect(offeringCosts(lines, "a").fixedMonthly).toBe(50);
        expect(offeringCosts(lines, "b").recurring[0].name).toBe("Stall (shared)");
        // Counted once for the organization, whatever it serves.
        expect(inputs.fixed).toBe(100);

    });

    test("an Offering saved before the list is still linked", () => {
        const capability = asBusinessCapabilityValue({
            offering: { resources: [{ id: "r", name: "Old", offeringId: "a" }], activities: [], professionals: [], providers: [] }
        });
        expect(capability.offering.resources[0].offeringIds).toEqual(["a"]);
    });

});

describe("the Legal Entity, read as the financial pages read it", () => {

    test("capital of 10,000 is ten thousand", () => {
        const entity = asLegalEntityValue({ founders: [{ id: "a", name: "A", capital: "10,000" }, { id: "b", name: "B", capital: "2.500,50" }] });
        expect(legalEntityTotalCapital(entity)).toBeCloseTo(12500.5, 6);
    });

    test("an organisation not yet registered can be complete without a date or numbers", () => {
        const base = {
            formation: { status: "planned", authority: "Companies House", date: "", registrationNumber: "" },
            tax: { identificationNumber: "" }
        };
        const [, , formationEmpty, taxEmpty] = legalEntitySectionsEmpty(base);
        expect(formationEmpty).toBe(false);
        expect(taxEmpty).toBe(false);
        // (A registration number registers it: then the date is asked, and is empty.)
        const [, , registeredEmpty, registeredTaxEmpty] = legalEntitySectionsEmpty({ ...base, formation: { ...base.formation, registrationNumber: "16234587" } });
        expect(registeredEmpty).toBe(true);
        expect(registeredTaxEmpty).toBe(true);
    });

});

describe("the Brand Inventory is complete as its help asks", () => {
    const file = { dataUrl: "data:image/png;base64,AA", fileName: "mark" };
    test("one icon and one logo, each an SVG or a PNG", () => {
        const logoOnly = { icon: {}, logo: { file }, images: [] };
        expect(brandInventorySectionsEmpty(logoOnly)[0]).toBe(true);
        const both = { icon: { file }, logo: { file }, images: [] };
        expect(brandInventorySectionsEmpty(both)[0]).toBe(false);
        // Saved by the page's earlier two-file version: either file counts.
        const earlier = { icon: { png: file }, logo: { svg: file }, images: [] };
        expect(brandInventorySectionsEmpty(earlier)[0]).toBe(false);
        // Removed by hand: an older file still saved does not count.
        const removed = { icon: { file: null, png: file }, logo: { file }, images: [] };
        expect(brandInventorySectionsEmpty(removed)[0]).toBe(true);
    });
});

describe("Strategic Themes are optional", () => {
    test("1.4 is complete with a Strategic Period and no Themes", () => {
        const period = { start: { month: "01", year: "2027" }, end: { month: "12", year: "2029" } };
        expect(strategyFoundationSectionsEmpty({ period, themes: [] })[3]).toBe(false);
        expect(strategyFoundationSectionsEmpty({ themes: [] })[3]).toBe(true);
    });
});

describe("guards for figures saved before the limits", () => {

    const loan = (patch: Record<string, string>) => ({
        ...createFundingSource("external"),
        type: "bank-loan",
        amount: "10000",
        status: "received" as const,
        loan: {
            ...createFundingSource("external").loan,
            rate: "6",
            repaymentStart: month(7),
            payments: "24",
            frequency: "monthly" as const,
            method: "annuity" as const,
            ...patch
        }
    });

    const periodic = (patch: Record<string, string>) => ({
        ...createFundingSource("external"),
        type: "grant",
        amount: "1000000",
        status: "approved" as const,
        schedule: {
            ...createFundingSource("external").schedule,
            kind: "periodic" as const,
            start: month(1),
            frequency: "monthly" as const,
            periodAmount: "",
            periods: "",
            ...patch
        }
    });

    test("a loan of 999999 payments is repaid in at most 600", () => {
        const schedule = loanSchedule(loan({ payments: "999999" }), START)!;
        expect(schedule.payments.length).toBeLessThanOrEqual(600);
    });

    test("a negative interest rate charges no interest, never a negative one", () => {
        const schedule = loanSchedule(loan({ rate: "-5" }), START)!;
        expect(schedule.totalInterest).toBe(0);
        schedule.payments.forEach(payment => expect(payment.interest).toBeGreaterThanOrEqual(0));
    });

    test("periodic funding arrives at most 600 times", () => {
        expect(fundingStanding(periodic({ periods: "999999" }), START).future.length).toBeLessThanOrEqual(600);
        // 600 periods of 0.01, the rest of the total folded into the last.
        const future = fundingStanding(periodic({ periodAmount: "0.01" }), START).future;
        expect(future.length).toBe(600);
        expect(future.reduce((sum, arrival) => sum + arrival.amount, 0)).toBeCloseTo(1000000, 2);
    });

    test("a negative milestone, cost or capital counts as nothing", () => {
        const grant = {
            ...periodic({}),
            amount: "1000",
            schedule: {
                ...createFundingSource("external").schedule,
                kind: "milestone" as const,
                milestones: [
                    { id: "m1", condition: "", month: month(2), amount: "-500" },
                    { id: "m2", condition: "", month: month(3), amount: "1000" }
                ]
            }
        };
        const future = fundingStanding(grant, START).future;
        future.forEach(arrival => expect(arrival.amount).toBeGreaterThan(0));
        expect(future.find(arrival => arrival.month === 2)).toBeUndefined();
        expect(future.find(arrival => arrival.month === 3)?.amount).toBe(1000);

        const value = foundation({ costs: [{ ...createOwnCost("operating"), name: "Refund", amount: "-50", frequency: "monthly" }] });
        const line = consolidateCosts(value, sources()).find(entry => entry.name === "Refund")!;
        expect(line.amount ?? 0).toBeGreaterThanOrEqual(0);

        const entity = asLegalEntityValue({ founders: [{ id: "a", name: "A", capital: "-100" }, { id: "b", name: "B", capital: "200" }] });
        expect(legalEntityTotalCapital(entity)).toBe(200);
    });

    test("an ownership share is read within 0 to 100%", () => {
        const entity = asLegalEntityValue({ founders: [{ id: "a", name: "A", ownership: "150" }] });
        expect(legalEntityTotalOwnership(entity)).toBe(100);
    });

    test("items per order below 1 count as 1", () => {
        const stream = { ...createRevenueStream(), price: "10", itemsPerOrder: "0.5", deliveryCharge: "4" };
        expect(monthlyPrice(stream)).toBe(14);
    });

    test("items per order and months to normal stop at their limits", () => {
        const stream = { ...createRevenueStream(), price: "10", itemsPerOrder: "999999", deliveryCharge: "100000" };
        // 100,000 shared by at most 10,000 items: 10 each.
        expect(monthlyPrice(stream)).toBe(20);

        const gradual = { ...createRevenueStream(), volume: "100", development: "gradual" as const,
            initialVolume: "0", rampMonths: "1000", start: month(1) };
        // Normal by Month 60 at the latest.
        expect(streamVolumes(gradual, START)[59]).toBe(100);
    });

});

describe("the financial plan's months in the Financial pages' titles", () => {
    test("run from the Plan Start for the Plan Length", () => {
        expect(financialPlanPeriod({ planStart: { month: "01", year: "2027" }, planYears: "3" }))
            .toEqual({ start: { month: "01", year: "2027" }, end: { month: "12", year: "2029" } });
        expect(titleWithPeriod("Financial Foundation MM/YY - MM/YY",
            financialPlanPeriod({ planStart: { month: "04", year: "2027" }, planYears: "1" })))
            .toBe("Financial Foundation · Apr 2027 – Mar 2028");
    });
    test("say nothing until a Plan Start is chosen", () => {
        expect(titleWithPeriod("Sustainability MM/YY - MM/YY", financialPlanPeriod(undefined)))
            .toBe("Sustainability");
    });
});
