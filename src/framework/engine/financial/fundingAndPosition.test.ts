import { workspacesOf } from "../answers/AnswerUtils.ts";
import { describe, expect, test } from "vitest";
import { asBusinessCapabilityValue, asLegalEntityValue } from "../answers/AnswerUtils.ts";
import { asFinancialFoundationValue, FUNDING_CATEGORIES, asFinancialSustainabilityValue, consolidateCosts, costSchedule, createFundingSource, createOwnCost, createRevenueStream, fundingNeeds, planMonthLabel, financialPosition, fundingStanding, hasLoans, loanRepaymentNotes, loanSchedule, LOAN_REPAYMENTS_RULE, streamRevenue, streamVolumes, sustainability, withWhatIf, type CostSources, type FinancialFoundationValue } from "./FinancialModel.ts";
import lumenText from "../../../data/examples/lumen-and-loom-studio.json?raw";

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
        subsectionLabels: { "premises-utilities": "Premises Utilities" },
        currency: "EUR",
        foundersLinked: true,
        ...overrides
    };
}

function foundation(patch: Partial<FinancialFoundationValue> = {}): FinancialFoundationValue {
    return { ...asFinancialFoundationValue({}), planStart: START, ...patch };
}

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
                { ...createFundingSource("other"), type: "existing-funds", amount: "10000", status: "received" },
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
            funding: [{ ...createFundingSource("other"), type: "existing-funds", amount: "6000", status: "received" }]
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
            funding: [{ ...createFundingSource("other"), type: "existing-funds", amount: "10000", status: "received" }]
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
            funding: [{ ...createFundingSource("other"), type: "existing-funds", amount: "10000", status: "received" }]
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
            funding: [{ ...createFundingSource("other"), type: "existing-funds", amount: "3000", status: "received" }]
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
            funding: [{ ...createFundingSource("other"), type: "existing-funds", amount: "3000", status: "received" }]
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

describe("the Loan Repayments note", () => {

    const loan = (overrides: object, terms: object = {}) => ({
        ...createFundingSource("external"),
        type: "microloan",
        amount: "12000",
        ...overrides,
        loan: {
            ...createFundingSource("external").loan,
            repaymentStart: month(3), payments: "24", frequency: "monthly" as const, method: "equal-principal" as const,
            ...terms
        }
    });
    const dollars = (amount: number) => "$" + Math.round(amount).toLocaleString("en-US");

    test("a pending loan's repayments are not counted until it is approved", () => {
        expect(loanRepaymentNotes([loan({ name: "SBA Microloan", status: "requested" })], START, dollars)).toEqual([
            "SBA Microloan (Requested / Applied): its $500 monthly repayments are not counted until it is approved.",
            LOAN_REPAYMENTS_RULE
        ]);
    });

    test("a confirmed loan's repayments are counted from their first month", () => {
        expect(loanRepaymentNotes([loan({ name: "Start Up Loan", status: "approved" })], START, dollars)).toEqual([
            "Start Up Loan (Approved / Agreed): $500 a month from Mar 2027, counted here.",
            LOAN_REPAYMENTS_RULE
        ]);
    });

    test("a loan without a name is named by its type, and quarterly repayments say so", () => {
        expect(loanRepaymentNotes([loan({ status: "" }, { frequency: "quarterly", payments: "8" })], START, dollars)[0])
            .toBe("Microloan (Planned): its $1,500 quarterly repayments are not counted until it is approved.");
    });

    test("with no loan there is nothing to explain, and no column", () => {
        const grant = { ...createFundingSource("external"), type: "grant", amount: "5000", status: "received" as const };
        expect(loanRepaymentNotes([grant], START, dollars)).toEqual([]);
        expect(hasLoans([grant])).toBe(false);
        expect(hasLoans([grant, loan({ status: "planned" })])).toBe(true);
    });

    test("the rule names where a pending loan's repayments are counted", () => {
        expect(LOAN_REPAYMENTS_RULE).toContain("Approved / Agreed, Received / Available or Completed / Closed");
        expect(LOAN_REPAYMENTS_RULE).toContain("Financial Position");
        expect(LOAN_REPAYMENTS_RULE).toContain("Stress Test on Financials");
    });
});

describe("the Workspace's optional Deposit", () => {

    const withDeposit = (workspace: Record<string, unknown>) => asBusinessCapabilityValue({
        founders: [], professionals: [],
        workspace: { kind: "dedicated", status: "costs", cost: { price: "1250", frequency: "monthly" }, ...workspace }
    });

    test("reads tolerantly: absent is none, and no line is gathered", () => {
        const capability = withDeposit({});
        expect(workspacesOf(capability)[0].deposit).toBe("");
        expect(workspacesOf(asBusinessCapabilityValue(undefined))).toEqual([]);
        const lines = consolidateCosts(foundation(), sources({ capability }));
        expect(lines.map(line => line.id)).toEqual(["workspace"]);
    });

    test("flows once as a one-time Establishment Deposit line, at the plan's start, from Infrastructure → Workspace", () => {
        const capability = withDeposit({ deposit: "3750" });
        const lines = consolidateCosts(foundation(), sources({ capability }));
        const deposits = lines.filter(line => line.id === "workspace-deposit");
        expect(deposits).toHaveLength(1);
        const [line] = deposits;
        expect(line.name).toBe("Workspace deposit");
        expect(line.amount).toBe(3750);
        expect(line.frequency).toBe("one-time");
        expect(line.group).toBe("establishment");
        expect(line.asset).toBe("deposit");
        expect(line.month).toEqual(START);
        expect(line.sourceLabel).toBe("Infrastructure → Workspace");
        // The rent beside it is untouched, and the two are not a duplicate.
        expect(lines.find(entry => entry.id === "workspace")!.amount).toBe(1250);
        expect(financialPosition(foundation(), lines, asLegalEntityValue(undefined), "EUR", format).duplicates).toHaveLength(0);
    });

    test("SEVERAL Workspaces: each costs its own rent and deposit, the first keeping its old ids; the old single workspace is read as the first", () => {
        const one = withDeposit({ deposit: "3750" });
        expect(workspacesOf(one)).toHaveLength(1);
        expect(workspacesOf(one)[0].id).toBe("workspace");
        expect(workspacesOf(one)[0].cost.price).toBe("1250");
        // Reading what is read again changes nothing.
        expect(asBusinessCapabilityValue(one)).toEqual(one);
        const first = one.resources.workspace[0].slots[0];
        const second = { ...first, id: "workspace-b", cost: { ...first.cost, price: "400" }, deposit: "800" };
        const two = { ...one, resources: { ...one.resources, workspace: [{ ...one.resources.workspace[0], slots: [first, second] }] } };
        expect(workspacesOf(asBusinessCapabilityValue(two)).map(entry => entry.id)).toEqual(["workspace", "workspace-b"]);
        const lines = consolidateCosts(foundation(), sources({ capability: two }));
        const amount = (id: string) => lines.find(line => line.id === id)?.amount;
        expect([amount("workspace"), amount("workspace-b"), amount("workspace-deposit"), amount("workspace-b-deposit")]).toEqual([1250, 400, 3750, 800]);
        // The first alone is what it always was.
        const alone = consolidateCosts(foundation(), sources({ capability: one }));
        expect(alone.filter(line => /^workspace/.test(line.id)).map(line => [line.id, line.amount])).toEqual([["workspace", 1250], ["workspace-deposit", 3750]]);
    });

    test("only while the Workspace costs money, and the founder can still reclassify it", () => {
        expect(consolidateCosts(foundation(), sources({ capability: withDeposit({ deposit: "500", status: "provided" }) }))
            .some(line => line.id === "workspace-deposit")).toBe(false);
        const reclassified = consolidateCosts(
            foundation({ classified: { "workspace-deposit": { asset: "" } } as FinancialFoundationValue["classified"] }),
            sources({ capability: withDeposit({ deposit: "500" }) })
        ).find(line => line.id === "workspace-deposit")!;
        expect(reclassified.asset).toBe("");
    });

    test("Lumen's £3,750 rent deposit is the landlord's, once: no manual 'Rent deposit' beside it", () => {
        const responses = (JSON.parse(lumenText) as { systems: Record<string, { responses: { value: Record<string, unknown> }[] }> })
            .systems["3"].responses.map(response => response.value ?? {});
        const capability = asBusinessCapabilityValue(responses.find(value => value.resources && (value.resources as Record<string, unknown>).workspace));
        const own = asFinancialFoundationValue(responses.find(value => Array.isArray(value.costs) && "planStart" in value));
        // (The Dedicated Workspace is rented: the rent, the service charge and the deposit sit on the landlord's supplier card.)
        expect(workspacesOf(capability)[0].status).toBe("rent");
        expect(own.costs.some(cost => /deposit/i.test(cost.name))).toBe(false);
        const lines = consolidateCosts(own, sources({ capability, currency: "GBP", foundersLinked: false }));
        const deposits = lines.filter(line => line.asset === "deposit");
        expect(deposits.map(line => [line.id, line.amount])).toEqual([["partner-3grgyco6:deposit", 3750]]);
    });

});

describe("a funding source saved under Internal", () => {
    test("is read under Other, its type, amount and status kept", () => {
        const value = asFinancialFoundationValue({ funding: [{ id: "savings", category: "internal", type: "founder-capital", name: "Owner's savings", amount: "10700", status: "received" }] });
        expect(value.funding[0]).toMatchObject({ id: "savings", category: "other", type: "founder-capital", name: "Owner's savings", amount: "10700", status: "received" });
        expect(FUNDING_CATEGORIES.map(category => category.id)).toEqual(["external", "other"]);
    });
});
