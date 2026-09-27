import { describe, expect, test } from "vitest";

import {
    asBusinessCapabilityValue,
    asLegalEntityValue,
    brandInventorySectionsEmpty,
    strategyFoundationSectionsEmpty,
    legalEntitySectionsEmpty,
    legalEntityTotalCapital,
    legalEntityTotalOwnership,
    resourceUnitCount
} from "./AnswerUtils.ts";

import {
    asFinancialFoundationValue,
    asFinancialSustainabilityValue,
    breakEvenInputs,
    consolidateCosts,
    costSchedule,
    createFundingSource,
    createOwnCost,
    createRevenueStream,
    fundingNeeds,
    offeringCosts,
    planMonthLabel,
    financialPosition,
    fundingStanding,
    loanSchedule,
    monthlyPrice,
    numberAsText,
    parsePercent,
    parseAmount,
    planMonth,
    streamRevenue,
    streamVolumes,
    sustainability,
    withWhatIf,
    type CostSources,
    type FinancialFoundationValue
} from "./FinancialModel.ts";

const START = { month: "01", year: "2027" };

/** €100 each project costs the Offering "off", recorded as its cost. */
const PROJECT_COST = { ...createOwnCost("offering"), amount: "100", frequency: "per-project" as const, offeringId: "off" };
const month = (m: number, y = 2027) => ({ month: String(m).padStart(2, "0"), year: String(y) });
const format = (amount: number) => String(Math.round(amount));

function sources(overrides: Partial<CostSources> = {}): CostSources {
    return {
        legalEntity: asLegalEntityValue(undefined),
        capability: asBusinessCapabilityValue({ founders: [], professionals: [] }),
        resourceGroupLabels: { utilities: "Utilities" },
        subsectionLabels: { internet: "Internet" },
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

describe("parseAmount", () => {
    test("reads amounts as founders type them", () => {
        expect(parseAmount("1200")).toBe(1200);
        expect(parseAmount("1,200")).toBe(1200);
        expect(parseAmount("1.200")).toBe(1200);
        expect(parseAmount("1.200,50")).toBe(1200.5);
        expect(parseAmount("1,200.50")).toBe(1200.5);
        expect(parseAmount("12,5")).toBe(12.5);
        expect(parseAmount("€ 30")).toBe(30);
        expect(parseAmount("")).toBeNull();
        expect(parseAmount("abc")).toBeNull();
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
                resources: [{ id: "o1", name: "Clay", status: "costs", offeringId: "off-1", cost: { price: "5", frequency: "other" } }],
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
        expect(byId.s1.sourceLabel).toBe("Infrastructure → Utilities → Internet");
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
            foundation({ classified: { "legal-e2": { group: "other", behaviour: "variable" } } }),
            sources({ legalEntity })
        );

        expect(lines[0].group).toBe("other");
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

describe("funding", () => {

    test("Expected ≠ Confirmed ≠ Available: the specification's grant", () => {

        const grant = {
            ...createFundingSource("external"),
            type: "grant",
            amount: "12000",
            status: "approved" as const,
            received: "4000",
            schedule: {
                ...createFundingSource("external").schedule,
                kind: "milestone" as const,
                milestones: [
                    { id: "a", amount: "4000", month: month(1), condition: "" },
                    { id: "b", amount: "4000", month: month(4), condition: "" },
                    { id: "c", amount: "4000", month: month(8), condition: "" }
                ]
            }
        };

        const standing = fundingStanding(grant, START);

        expect(standing.received).toBe(4000);
        expect(standing.confirmedFuture).toBe(8000);
        expect(standing.pending).toBe(0);
        expect(standing.future).toEqual([{ month: 4, amount: 4000 }, { month: 8, amount: 4000 }]);

    });

    test("planned money is pending, not available", () => {
        const source = { ...createFundingSource("external"), type: "grant", amount: "5000", status: "planned" as const };
        expect(fundingStanding(source, START)).toMatchObject({ received: 0, confirmedFuture: 0, pending: 5000 });
    });

    test("an equal-payment loan: payment, interest and the last payment clearing it", () => {

        const loan = {
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
                method: "annuity" as const
            }
        };

        const schedule = loanSchedule(loan, START);

        expect(schedule).not.toBeNull();
        expect(schedule!.payments).toHaveLength(24);
        expect(schedule!.payments[0].month).toBe(7);
        expect(schedule!.firstPayment).toBeCloseTo(443.21, 1);
        expect(schedule!.totalInterest).toBeCloseTo(637.03, 0);
        expect(schedule!.payments[23].remaining).toBeCloseTo(0, 6);

    });

    test("an interest-free, equal-principal loan divides evenly", () => {
        const loan = {
            ...createFundingSource("external"),
            type: "microloan",
            amount: "1200",
            loan: {
                ...createFundingSource("external").loan,
                repaymentStart: month(1), payments: "12", method: "equal-principal" as const
            }
        };
        const schedule = loanSchedule(loan, START)!;
        expect(schedule.payments.every(payment => Math.abs(payment.payment - 100) < 1e-9)).toBe(true);
        expect(schedule.totalInterest).toBe(0);
    });

});

describe("financial position", () => {

    test("the specification's gap: €20,000 needed, €15,000 confirmed", () => {

        // The need is calculated: a €20,000 one-time establishment cost.
        const value = foundation({
            costs: [{ ...createOwnCost("establishment"), amount: "20000", frequency: "one-time" as const }],
            funding: [
                { ...createFundingSource("internal"), type: "existing-funds", amount: "10000", status: "received" },
                { ...createFundingSource("external"), type: "grant", amount: "5000", status: "approved", schedule: { ...createFundingSource("external").schedule, month: month(3) } },
                { ...createFundingSource("external"), type: "grant", amount: "8000", status: "requested" }
            ]
        });

        const lines = consolidateCosts(value, sources());
        const position = financialPosition(value, lines, asLegalEntityValue(undefined), "EUR", format);

        expect(position.need).toBe(20000);
        expect(position.needs.find(need => need.id === "establishment")?.amount).toBe(20000);
        expect(position.availableNow).toBe(10000);
        expect(position.confirmedFuture).toBe(5000);
        expect(position.pending).toBe(8000);
        expect(position.gap).toBe(5000);
        expect(position.signals[0]).toMatchObject({ title: "Funding Gap", text: "Additional financing of 5000 is required." });

    });

    test("the operating need: running costs until revenue covers them", () => {

        // €1,000 a month to run; €1,500 a month of revenue from month 4.
        const value = foundation({
            costs: [{ ...createOwnCost("operating"), amount: "1000", frequency: "monthly" as const }]
        });
        const lines = consolidateCosts(value, sources());
        const revenue = asFinancialSustainabilityValue({
            streams: [{ ...createRevenueStream(), price: "1500", volume: "1", frequency: "per-sale", start: month(4) }]
        });

        const operating = fundingNeeds(value, lines, asLegalEntityValue(undefined), revenue)
            .find(need => need.id === "initial-operating")!;

        // Three months at €1,000 before revenue exceeds the costs.
        expect(operating.amount).toBe(3000);
        expect(operating.when).toBe(planMonthLabel(START, 1) + " – " + planMonthLabel(START, 3));
        // Month by month, for the first year: what each month adds.
        expect(operating.months).toHaveLength(12);
        expect(operating.months!.slice(0, 4).map(entry => entry.needed)).toEqual([1000, 1000, 1000, 0]);

    });

    test("a one-time cost paid before the plan starts is not in it", () => {

        const value = foundation({
            costs: [
                { ...createOwnCost("establishment"), amount: "500", frequency: "one-time" as const, month: { month: "12", year: "2026" } },
                { ...createOwnCost("establishment"), amount: "700", frequency: "one-time" as const, month: month(2) }
            ]
        });
        const lines = consolidateCosts(value, sources());
        const establishment = fundingNeeds(value, lines, asLegalEntityValue(undefined))
            .find(need => need.id === "establishment")!;

        expect(establishment.amount).toBe(700);
        expect(costSchedule(lines[0], START).every(amount => amount === 0)).toBe(true);

    });

    test("a cost per order is shared by the items in an order", () => {

        // A €100 product; €6 delivery per order of 2 items; the customer pays €4 of it.
        const capability = asBusinessCapabilityValue({
            offering: { professionals: [], providers: [{ id: "courier", name: "Courier", offeringId: "o1",
                cost: { price: "6", frequency: "per-order", frequencyOther: "", currency: "" } }], resources: [], activities: [] }
        });
        const lines = consolidateCosts(foundation(), sources({ capability }));
        const stream = { ...createRevenueStream(), offeringId: "o1", price: "100", volume: "10",
            frequency: "per-sale" as const, itemsPerOrder: "2", deliveryCharge: "4" };
        const result = sustainability(asFinancialSustainabilityValue({ streams: [stream] }), foundation(), lines,
            asLegalEntityValue(undefined), format);

        expect(result.streams[0].variable).toBe(3);
        expect(result.streams[0].price).toBe(102);

    });

    test("runway: €6,000 against €1,000 a month lasts six months", () => {

        const value = foundation({
            costs: [{ ...createOwnCost("operating"), amount: "1000", frequency: "monthly" }],
            funding: [{ ...createFundingSource("internal"), type: "existing-funds", amount: "6000", status: "received" }]
        });

        const lines = consolidateCosts(value, sources());
        const position = financialPosition(value, lines, asLegalEntityValue(undefined), "EUR", format);

        expect(position.runwayMonths).toBe(6);
        expect(position.timeline[5].balance).toBe(0);
        expect(position.timeline[6].balance).toBe(-1000);

    });

    test("founders' capital is read from the Legal Entity as available", () => {

        const legalEntity = asLegalEntityValue({
            capitalApplies: true,
            founders: [{ id: "f1", name: "Jean", ownership: "100", capital: "2500", roles: [] }]
        });

        const position = financialPosition(foundation(), [], legalEntity, "EUR", format);

        expect(position.availableNow).toBe(2500);
        expect(position.mix[0]).toMatchObject({ nature: "capital", confirmed: 2500 });

    });

    test("an other-currency cost stays out of the timeline", () => {

        const capability = asBusinessCapabilityValue({
            founders: [],
            resources: { utilities: [{ id: "internet", slots: [
                { id: "s3", name: "US tool", status: "costs", cost: { price: "20", frequency: "monthly", currency: "USD" } }
            ] }] }
        });

        const value = foundation();
        const lines = consolidateCosts(value, sources({ capability }));
        const position = financialPosition(value, lines, asLegalEntityValue(undefined), "EUR", format);

        expect(position.timeline.every(entry => entry.outflow === 0)).toBe(true);
        expect(position.uncounted.currency).toHaveLength(1);

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
        const capability = asBusinessCapabilityValue({
            founders: [],
            offering: {
                resources: [{ id: "kit", name: "Materials kit", status: "costs", offeringId: "off", cost: { price: "12", frequency: "other", frequencyOther: "per participant" } }],
                activities: [], professionals: [], providers: []
            }
        });
        const [line] = consolidateCosts(foundation({ classified: { kit: { frequency: "per-unit" } } }), sources({ capability }));
        expect(line.frequency).toBe("per-unit");
        expect(line.sourceFrequency).toBe("other");
    });

    test("the same cost in two places is flagged", () => {
        const legalEntity = asLegalEntityValue({ expenses: [{ id: "e", name: "Accountant (annual accounts)", cost: "150", frequency: "Monthly" }] });
        const capability = asBusinessCapabilityValue({
            founders: [],
            professionals: [{ id: "p", name: "Accountant", cost: { price: "120", frequency: "monthly" } }]
        });
        const lines = consolidateCosts(foundation(), sources({ legalEntity, capability }));
        const position = financialPosition(foundation(), lines, legalEntity, "EUR", format);
        expect(position.duplicates).toHaveLength(1);
        expect(position.signals.some(signal => signal.title === "Possible Duplicate")).toBe(true);
    });

    test("in-kind contributions are not cash", () => {
        const value = foundation({
            funding: [
                { ...createFundingSource("internal"), type: "existing-funds", amount: "1000", status: "received" },
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

describe("revenue and break even", () => {

    test("a gradual build-up reaches the normal volume", () => {
        const stream = {
            ...createRevenueStream(), price: "800", volume: "4", start: month(2),
            development: "gradual" as const, initialVolume: "1", rampMonths: "4"
        };
        expect(streamVolumes(stream, START).slice(0, 7)).toEqual([0, 1, 2, 3, 4, 4, 4]);
    });

    test("month by month: each entry holds until the next", () => {
        const stream = {
            ...createRevenueStream(), development: "detailed" as const,
            detailed: [
                { id: "a", month: month(2), volume: "1" },
                { id: "b", month: month(4), volume: "3" }
            ]
        };
        expect(streamVolumes(stream, START).slice(0, 6)).toEqual([0, 1, 1, 3, 3, 3]);
    });

    test("a split payment moves half of each sale to later", () => {
        const stream = {
            ...createRevenueStream(), price: "3000", volume: "1", start: month(1),
            paymentTiming: "split" as const, firstPercent: "50", paymentDelay: "2"
        };
        const { earned, received } = streamRevenue(stream, START);
        expect(earned.slice(0, 4)).toEqual([3000, 3000, 3000, 3000]);
        expect(received.slice(0, 4)).toEqual([1500, 1500, 3000, 3000]);
    });

    test("the specification's break even: ≈2.86 projects on €2,000 fixed", () => {

        const value = foundation({
            costs: [{ ...createOwnCost("operating"), amount: "2000", frequency: "monthly" }, PROJECT_COST]
        });
        const lines = consolidateCosts(value, sources());

        const page = asFinancialSustainabilityValue({
            streams: [{ ...createRevenueStream(), offeringId: "off", price: "800", volume: "3", frequency: "per-project" }]
        });

        const result = sustainability(page, value, lines, asLegalEntityValue(undefined), format);

        expect(result.inputs.fixed).toBe(2000);
        expect(result.streams[0].contribution).toBe(700);
        expect(result.streams[0].breakEvenAlone).toBeCloseTo(2.857, 2);
        expect(result.breakEvenScale! * 3).toBeCloseTo(2.857, 2);
        expect(result.breakEvenRevenue).toBeCloseTo(2285.7, 0);

    });

    test("per-unit costs on Page 4 become the stream's variable cost", () => {

        const value = foundation({
            costs: [
                { ...createOwnCost("operating"), amount: "2000", frequency: "monthly" },
                { ...createOwnCost("offering"), amount: "100", frequency: "per-project", behaviour: "variable", offeringId: "off" }
            ]
        });
        const lines = consolidateCosts(value, sources());
        const page = asFinancialSustainabilityValue({
            streams: [{ ...createRevenueStream(), offeringId: "off", price: "800", volume: "3" }]
        });

        const result = sustainability(page, value, lines, asLegalEntityValue(undefined), format);

        expect(result.inputs.fixed).toBe(2000);
        expect(result.streams[0].variable).toBe(100);

    });

    test("break-even time, exhaustion and the buffer between them", () => {

        // €2,000 a month fixed; €10,000 in the bank; one project a
        // month more each month from Month 1, at €800 with €100
        // variable cost. Contribution: 700, 1400, 2100 -> Month 3.
        const value = foundation({
            costs: [{ ...createOwnCost("operating"), amount: "2000", frequency: "monthly" }, PROJECT_COST],
            funding: [{ ...createFundingSource("internal"), type: "existing-funds", amount: "10000", status: "received" }]
        });
        const lines = consolidateCosts(value, sources());
        const page = asFinancialSustainabilityValue({
            streams: [{
                ...createRevenueStream(), offeringId: "off", price: "800", variableCost: "100",
                volume: "3", development: "detailed",
                detailed: [
                    { id: "a", month: month(1), volume: "1" },
                    { id: "b", month: month(2), volume: "2" },
                    { id: "c", month: month(3), volume: "3" }
                ]
            }]
        });

        const result = sustainability(page, value, lines, asLegalEntityValue(undefined), format);

        expect(result.breakEvenMonth).toBe(3);
        expect(result.fundingRunway).toBe(5);
        // Revenue-adjusted: the balance falls only in Months 1-2 and
        // then grows, so it never runs out within the plan.
        expect(result.exhaustionMonth).toBeNull();
        expect(result.status).toBe("sustainable");

    });

    test("what-if: a higher price brings break even forward", () => {

        const value = foundation({
            costs: [{ ...createOwnCost("operating"), amount: "2000", frequency: "monthly" }, PROJECT_COST],
            funding: [{ ...createFundingSource("internal"), type: "existing-funds", amount: "10000", status: "received" }]
        });
        const lines = consolidateCosts(value, sources());
        const page = asFinancialSustainabilityValue({
            streams: [{ ...createRevenueStream(), offeringId: "off", price: "800", volume: "3",
                development: "gradual", initialVolume: "1", rampMonths: "5" }]
        });

        const base = sustainability(page, value, lines, asLegalEntityValue(undefined), format);
        const dearer = sustainability(withWhatIf(page, { price: 25, volume: 0, delay: 0 }, START), value, lines, asLegalEntityValue(undefined), format);
        const later = sustainability(withWhatIf(page, { price: 0, volume: 0, delay: 2 }, START), value, lines, asLegalEntityValue(undefined), format);

        expect(dearer.breakEvenMonth!).toBeLessThan(base.breakEvenMonth!);
        expect(later.breakEvenMonth).toBe(base.breakEvenMonth! + 2);

    });

    test("zero revenue is a valid model, and exhaustion is still found", () => {

        const value = foundation({
            costs: [{ ...createOwnCost("operating"), amount: "1000", frequency: "monthly" }],
            funding: [{ ...createFundingSource("internal"), type: "existing-funds", amount: "3000", status: "received" }]
        });
        const lines = consolidateCosts(value, sources());

        const result = sustainability(
            asFinancialSustainabilityValue({ streams: [] }), value, lines, asLegalEntityValue(undefined), format);

        expect(result.status).toBe("no-revenue");
        expect(result.breakEvenMonth).toBeNull();
        expect(result.exhaustionMonth).toBe(4);

    });

    test("exhaustion before break even is a financial risk", () => {

        const value = foundation({
            costs: [{ ...createOwnCost("operating"), amount: "2000", frequency: "monthly" }],
            funding: [{ ...createFundingSource("internal"), type: "existing-funds", amount: "3000", status: "received" }]
        });
        const lines = consolidateCosts(value, sources());
        const page = asFinancialSustainabilityValue({
            streams: [{ ...createRevenueStream(), offeringId: "off", price: "800", volume: "3", start: month(8) }]
        });

        const result = sustainability(page, value, lines, asLegalEntityValue(undefined), format);

        expect(result.breakEvenMonth).toBe(8);
        expect(result.exhaustionMonth).toBe(2);
        expect(result.status).toBe("risk");

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
        expect(once.workspace.cost.price).toBe("30");
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

describe("fixes from the financial review", () => {

    const loanOf = (patch: Record<string, unknown>) => ({
        ...createFundingSource("external"),
        type: "bank-loan",
        amount: "12000",
        status: "received" as const,
        loan: { ...createFundingSource("external").loan, rate: "12", method: "annuity" as const, ...patch }
    });

    test("a loan charges interest from the month it is drawn", () => {
        const schedule = loanSchedule(loanOf({
            start: month(1), repaymentStart: month(7), payments: "12", frequency: "monthly" as const
        }), START)!;
        // Interest only in months 2 to 6, then the first repayment in 7.
        const interestOnly = schedule.payments.filter(payment => payment.principal === 0);
        expect(interestOnly.map(payment => payment.month)).toEqual([2, 3, 4, 5, 6]);
        interestOnly.forEach(payment => expect(payment.interest).toBeCloseTo(120, 6));
        expect(schedule.firstRepayment!.month).toBe(7);
        expect(schedule.firstRepayment!.interest).toBeCloseTo(120, 6);
        expect(schedule.payments.reduce((sum, payment) => sum + payment.principal, 0)).toBeCloseTo(12000, 6);
    });

    test("a first quarterly repayment one month after drawing carries one month's interest", () => {
        const schedule = loanSchedule(loanOf({
            start: month(1), repaymentStart: month(2), payments: "4", frequency: "quarterly" as const
        }), START)!;
        expect(schedule.payments[0].month).toBe(2);
        expect(schedule.payments[0].interest).toBeCloseTo(120, 6);
    });

    test("periodic funding stops at its total", () => {
        const grant = {
            ...createFundingSource("external"),
            type: "grant",
            amount: "10000",
            status: "approved" as const,
            schedule: {
                ...createFundingSource("external").schedule,
                kind: "periodic" as const,
                start: month(1),
                frequency: "monthly" as const,
                periodAmount: "1000",
                periods: "12"
            }
        };
        const future = fundingStanding(grant, START).future;
        expect(future.reduce((sum, arrival) => sum + arrival.amount, 0)).toBe(10000);
    });

    test("an annual cost first paid before the plan keeps its month", () => {
        const value = foundation({
            costs: [{ ...createOwnCost("operating"), name: "Insurance", amount: "1200", frequency: "annually", month: month(9, 2026) }]
        });
        const line = consolidateCosts(value, sources()).find(entry => entry.name === "Insurance")!;
        const schedule = costSchedule(line, START);
        expect(schedule[0]).toBe(0);
        expect(schedule[8]).toBe(1200);
        expect(schedule[20]).toBe(1200);
    });

    test("an annual charge: its cost per unit is spread with its price", () => {
        const value = foundation({
            costs: [{ ...createOwnCost("offering"), amount: "120", frequency: "per-unit", offeringId: "off" }]
        });
        const lines = consolidateCosts(value, sources());
        const page = asFinancialSustainabilityValue({
            streams: [{ ...createRevenueStream(), offeringId: "off", price: "1200", volume: "10", frequency: "annually" }]
        });
        const result = sustainability(page, value, lines, asLegalEntityValue(undefined), format);
        expect(result.streams[0].contribution).toBeCloseTo(90, 6);
    });

    test("an annual charge paid upfront arrives at the start of each year", () => {
        const stream = {
            ...createRevenueStream(), price: "1200", volume: "10", frequency: "annually" as const,
            start: month(1), paymentTiming: "upfront" as const
        };
        const { earned, received } = streamRevenue(stream, START);
        expect(earned[0]).toBeCloseTo(1000, 6);
        expect(received[0]).toBeCloseTo(12000, 6);
        expect(received.slice(1, 12).every(amount => amount === 0)).toBe(true);
        expect(received[12]).toBeCloseTo(12000, 6);
    });

    test("a month-by-month stream has a normal level and breaks even", () => {
        const value = foundation({ costs: [{ ...createOwnCost("operating"), amount: "1000", frequency: "monthly" }] });
        const lines = consolidateCosts(value, sources());
        const page = asFinancialSustainabilityValue({
            streams: [{
                ...createRevenueStream(), offeringId: "off", price: "100", frequency: "per-sale",
                development: "detailed", detailed: [{ id: "a", month: month(1), volume: "20" }]
            }]
        });
        const result = sustainability(page, value, lines, asLegalEntityValue(undefined), format);
        expect(result.expectedRevenue).toBe(2000);
        expect(result.breakEvenMonth).toBe(1);
    });

    test("no revenue is not break even, even with no costs", () => {
        const value = foundation();
        const lines = consolidateCosts(value, sources());
        const page = asFinancialSustainabilityValue({
            streams: [{ ...createRevenueStream(), offeringId: "off", price: "100", volume: "5", frequency: "per-sale", start: month(3) }]
        });
        const result = sustainability(page, value, lines, asLegalEntityValue(undefined), format);
        expect(result.breakEvenMonth).toBe(3);
    });

});

describe("the Legal Entity, read as the financial pages read it", () => {

    test("capital of 10,000 is ten thousand", () => {
        const entity = asLegalEntityValue({ founders: [{ id: "a", name: "A", capital: "10,000" }, { id: "b", name: "B", capital: "2.500,50" }] });
        expect(legalEntityTotalCapital(entity)).toBeCloseTo(12500.5, 6);
    });

    test("an organization not yet registered can be complete without a date or numbers", () => {
        const base = {
            formation: { status: "planned", authority: "Companies House", date: "", registrationNumber: "" },
            tax: { identificationNumber: "" }
        };
        const [, , formationEmpty, taxEmpty] = legalEntitySectionsEmpty(base);
        expect(formationEmpty).toBe(false);
        expect(taxEmpty).toBe(false);
        const [, , registeredEmpty, registeredTaxEmpty] = legalEntitySectionsEmpty({ ...base, formation: { ...base.formation, status: "registered" } });
        expect(registeredEmpty).toBe(true);
        expect(registeredTaxEmpty).toBe(true);
    });

});

describe("the Brand Inventory is complete as its help asks", () => {
    const file = { dataUrl: "data:image/png;base64,AA", fileName: "mark" };
    test("an icon and a logo, each as a PNG and an SVG", () => {
        const logoOnly = { icon: {}, logo: { png: file, svg: file }, images: [] };
        expect(brandInventorySectionsEmpty(logoOnly)[0]).toBe(true);
        const noSvgIcon = { icon: { png: file }, logo: { png: file, svg: file }, images: [] };
        expect(brandInventorySectionsEmpty(noSvgIcon)[0]).toBe(true);
        const all = { icon: { png: file, svg: file }, logo: { png: file, svg: file }, images: [] };
        expect(brandInventorySectionsEmpty(all)[0]).toBe(false);
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
