/*
    The financial forecast a lender asks for, drawn from the two
    Financial pages: a cash-flow statement, a profit and loss forecast
    and a balance sheet, month by month over the plan, and added up by
    plan year.

    The cash figures are the ones cashTimeline and sustainability
    calculate, so the spreadsheet agrees with the pages. The profit and
    loss and the balance sheet follow the usual conventions on top:
    - equipment (Page 3's Workstation and Equipment groups, or a
      one-time cost marked Equipment) is an asset, spread over
      DEPRECIATION_MONTHS rather than counted as a cost when paid; a
      deposit is an asset that is never a cost;
    - an annual or quarterly cost is a cost a month at a time; what is
      paid ahead is a prepaid cost;
    - revenue counts when earned; what is earned and not yet paid is
      money owed by customers;
    - a grant is income, whenever it arrives; loans are owed until
      repaid; capital put in is the owners' equity;
    - one-time costs paid before the plan are spent already: a loss
      before the plan starts;
    - where the owners take drawings rather than a salary (a sole
      trader, a partnership, an LLC), founders' pay is drawings, not a
      cost;
    - tax on profit, and VAT or sales tax, are not calculated.

    The balance sheet balances by construction: every flow above lands
    on exactly one line of it.
*/

import type { LegalEntityValue } from "./AnswerUtils.ts";
import {
    COST_GROUPS,
    monthlyEquivalent,
    scheduledAmount,
    spentBeforePlan,
    type CostGroup,
    type CostLine,
    type FinancialFoundationValue,
    type FinancialSustainabilityValue,
    MODEL_MONTHS,
    allFunding,
    costSchedule,
    fundingStanding,
    fundingType,
    isNonCash,
    loanSchedule,
    planLength,
    planMonthLabel,
    statusStanding,
    streamRevenue,
    streamVolumes,
    sustainability
} from "./FinancialModel.ts";

export type ForecastPeriod = "monthly" | "annual";

/** "flow" adds up over a period; "opening"/"closing" take its first/last month. */
type RowKind = "flow" | "opening" | "closing";

export interface ForecastRow {
    label: string;
    kind: RowKind;
    /** A subtotal or total, set apart in a table. */
    total?: boolean;
    values: number[];
}

export interface ForecastTable {
    title: string;
    rows: ForecastRow[];
}

export interface Forecast {
    /** "Oct 2026", one per plan month. */
    months: string[];
    cashFlow: ForecastTable;
    profitAndLoss: ForecastTable;
    balanceSheet: ForecastTable;
    notes: string[];
}

/** Three years: a common life for computers, furniture and small equipment. */
export const DEPRECIATION_MONTHS = 36;

/** Page 3's groups whose one-time purchases are things the business owns. */
const ASSET_GROUPS = ["resource-group-workstation", "resource-group-equipment"];

/** Founders' pay, as Page 3 records it. */
const FOUNDER_PAY = "resource-group-founders";

/**
 * Whether the owners take drawings rather than a salary: a sole trader
 * or sole proprietor, a partnership, or an LLC (taxed as its owners
 * unless it elects otherwise). A company pays its founders a salary.
 */
export function ownersTakeDrawings(legalForm: string): boolean {
    return /sole|trader|proprietor|individu|einzel|enkeltmand|toiminimi|autónomo|ατομική|microempreendedor|partnership|partnerschaft|\bLLP\b|\bLLC\b|eenmanszaak|micro-entreprise/i
        .test(legalForm);
}

/** A cost bought once that the business keeps: equipment, or a deposit. */
function assetOf(line: CostLine): "equipment" | "deposit" | "" {
    if (line.frequency !== "one-time") {
        return "";
    }
    if (line.asset) {
        return line.asset;
    }
    return line.sourcePath.some(token => ASSET_GROUPS.includes(token)) ? "equipment" : "";
}

const GROUP_PAYMENT_LABELS: Record<CostGroup, string> = {
    establishment: "Establishment costs",
    operating: "Operating costs",
    offering: "Offering costs (fixed)",
    other: "Other costs"
};

function zeros(): number[] {
    return new Array<number>(MODEL_MONTHS).fill(0);
}

function add(into: number[], from: number[]) {
    from.forEach((amount, index) => { into[index] += amount; });
}

/** The whole forecast, month by month over the plan. */
export function financialForecast(
    foundation: FinancialFoundationValue,
    revenuePage: FinancialSustainabilityValue,
    lines: CostLine[],
    legalEntity: LegalEntityValue,
    format: (amount: number) => string
): Forecast {

    const start = foundation.planStart;
    const length = planLength(foundation);
    const cut = (values: number[]) => values.slice(0, length);

    /* Revenue, and the variable costs its sales bring. */
    const outlook = sustainability(revenuePage, foundation, lines, legalEntity, format);
    const earned = zeros();
    const received = zeros();
    const variable = zeros();
    outlook.streams.forEach(entry => {
        const revenue = streamRevenue(entry.stream, start);
        add(earned, revenue.earned);
        add(received, revenue.received);
        add(variable, streamVolumes(entry.stream, start).map(units => units * entry.variable));
    });

    /* Costs paid, by group. */
    const byGroup = Object.fromEntries(COST_GROUPS.map(group => [group.id, zeros()])) as Record<CostGroup, number[]>;
    lines.forEach(line => add(byGroup[line.group], costSchedule(line, start)));

    /* Funding: what is in hand at the start, what arrives, what is repaid.
       Kept apart by what it is, for the balance sheet: a loan is owed,
       a grant received during the plan is income, the rest is capital. */
    // One-time costs paid before the plan: out of the opening money,
    // and a loss before the plan starts.
    const spentBefore = spentBeforePlan(lines, start);
    let opening = -spentBefore;
    let openingLoans = 0;
    let openingCapital = 0;
    let openingRetained = -spentBefore;
    const fundingIn = zeros();
    const loansIn = zeros();
    const grantsIn = zeros();
    const capitalIn = zeros();
    const loanPrincipal = zeros();
    const loanInterest = zeros();

    allFunding(foundation, legalEntity).forEach(source => {

        if (isNonCash(source)) {
            return;
        }

        const standing = fundingStanding(source, start);
        const nature = fundingType(source.type)?.nature ?? "other";
        opening += standing.received;
        // In hand before the plan: owed if a loan, income if a grant,
        // the owners' otherwise.
        if (nature === "debt") {
            openingLoans += standing.received;
        } else if (nature === "non-repayable") {
            openingRetained += standing.received;
        } else {
            openingCapital += standing.received;
        }

        if (standing.confirmedFuture > 0) {
            standing.future.forEach(arrival => {
                if (arrival.month <= MODEL_MONTHS) {
                    fundingIn[arrival.month - 1] += arrival.amount;
                    const into = nature === "debt" ? loansIn : nature === "non-repayable" ? grantsIn : capitalIn;
                    into[arrival.month - 1] += arrival.amount;
                }
            });
        }

        if (fundingType(source.type)?.nature === "debt" &&
            statusStanding(source.status || "planned") === "confirmed") {
            loanSchedule(source, start)?.payments.forEach(payment => {
                if (payment.month <= MODEL_MONTHS) {
                    loanPrincipal[payment.month - 1] += payment.principal;
                    loanInterest[payment.month - 1] += payment.interest;
                }
            });
        }

    });

    /* Founders' pay, where it is the owners' drawings. */
    const drawingsTaken = ownersTakeDrawings(legalEntity.organisation.legalForm);
    const drawings = zeros();
    const drawingsByGroup = Object.fromEntries(COST_GROUPS.map(group => [group.id, zeros()])) as Record<CostGroup, number[]>;
    if (drawingsTaken) {
        lines.filter(line => line.sourcePath.includes(FOUNDER_PAY)).forEach(line => {
            const paid = costSchedule(line, start);
            add(drawings, paid);
            add(drawingsByGroup[line.group], paid);
        });
    }

    /* The cash-flow statement. */
    const groupRows = COST_GROUPS.map(group => ({
        label: GROUP_PAYMENT_LABELS[group.id],
        values: cut(byGroup[group.id].map((amount, index) => amount - drawingsByGroup[group.id][index]))
    })).filter(row => row.values.some(amount => Math.abs(amount) > 0.005));

    const receiptsTotal = cut(received).map((amount, index) => amount + fundingIn[index]);
    const paymentsTotal = cut(variable).map((amount, index) =>
        amount + loanPrincipal[index] + loanInterest[index] +
        COST_GROUPS.reduce((sum, group) => sum + byGroup[group.id][index], 0));
    const net = receiptsTotal.map((amount, index) => amount - paymentsTotal[index]);

    const openings: number[] = [];
    const closings: number[] = [];
    let balance = opening;
    net.forEach(amount => {
        openings.push(balance);
        balance += amount;
        closings.push(balance);
    });

    const cashFlow: ForecastTable = {
        title: "Cash-Flow Forecast",
        rows: [
            { label: "Opening balance", kind: "opening", values: openings },
            { label: "Revenue received", kind: "flow", values: cut(received) },
            { label: "Funding received", kind: "flow", values: cut(fundingIn) },
            { label: "Total receipts", kind: "flow", total: true, values: receiptsTotal },
            ...groupRows.map(row => ({ ...row, kind: "flow" as const })),
            ...(drawingsTaken && drawings.some(amount => amount > 0.005)
                ? [{ label: "Owner's drawings", kind: "flow" as const, values: cut(drawings) }] : []),
            { label: "Variable costs of sales", kind: "flow", values: cut(variable) },
            { label: "Loan repayments (capital)", kind: "flow", values: cut(loanPrincipal) },
            { label: "Loan interest", kind: "flow", values: cut(loanInterest) },
            { label: "Total payments", kind: "flow", total: true, values: paymentsTotal },
            { label: "Net cash flow", kind: "flow", total: true, values: net },
            { label: "Closing balance", kind: "closing", total: true, values: closings }
        ]
    };

    /* Equipment bought: an asset, used up over DEPRECIATION_MONTHS.
       A deposit: an asset, never used up. Neither is a cost when paid. */
    const assetsBought = zeros();
    const depositsPaid = zeros();
    const keptByGroup = Object.fromEntries(COST_GROUPS.map(group => [group.id, zeros()])) as Record<CostGroup, number[]>;
    lines.forEach(line => {
        const kind = assetOf(line);
        if (!kind) {
            return;
        }
        const paid = costSchedule(line, start);
        add(kind === "equipment" ? assetsBought : depositsPaid, paid);
        add(keptByGroup[line.group], paid);
    });

    /* An annual or quarterly cost: a cost a month at a time, from its
       first payment; what is paid ahead is a prepaid cost. */
    const spreadByGroup = Object.fromEntries(COST_GROUPS.map(group => [group.id, zeros()])) as Record<CostGroup, number[]>;
    const prepaidChange = zeros();
    lines
        .filter(line => line.frequency === "annually" || line.frequency === "quarterly")
        .forEach(line => {
            const paid = costSchedule(line, start);
            const first = paid.findIndex(amount => amount > 0);
            if (first < 0) {
                return;
            }
            const monthly = monthlyEquivalent(scheduledAmount(line), line.frequency);
            paid.forEach((amount, index) => {
                const spread = index >= first ? monthly : 0;
                spreadByGroup[line.group][index] += spread - amount;
                prepaidChange[index] += amount - spread;
            });
        });
    const depreciation = zeros();
    assetsBought.forEach((amount, month) => {
        for (let index = month; index < Math.min(MODEL_MONTHS, month + DEPRECIATION_MONTHS); index++) {
            depreciation[index] += amount / DEPRECIATION_MONTHS;
        }
    });

    /* The profit and loss forecast: revenue when earned, not when paid. */
    const revenue = cut(earned);
    const costOfSales = cut(variable);
    const gross = revenue.map((amount, index) => amount - costOfSales[index]);
    // What each group costs in the profit and loss: what it paid, less
    // equipment and deposits, with annual costs spread, and without the
    // owners' drawings.
    const expensed = (group: CostGroup) => byGroup[group].map((amount, index) =>
        amount - keptByGroup[group][index] + spreadByGroup[group][index] - drawingsByGroup[group][index]);
    const overheads = COST_GROUPS.map(group => ({
        label: GROUP_PAYMENT_LABELS[group.id],
        values: cut(expensed(group.id))
    })).filter(row => row.values.some(amount => Math.abs(amount) > 0.005));
    const interest = cut(loanInterest);
    const spread = cut(depreciation);
    const grants = cut(grantsIn);
    const profit = gross.map((amount, index) =>
        amount - interest[index] - spread[index] + grants[index] -
        overheads.reduce((sum, row) => sum + row.values[index], 0));

    const profitAndLoss: ForecastTable = {
        title: "Profit and Loss Forecast",
        rows: [
            { label: "Revenue", kind: "flow", values: revenue },
            { label: "Cost of sales (variable costs)", kind: "flow", values: costOfSales },
            { label: "Gross profit", kind: "flow", total: true, values: gross },
            ...overheads.map(row => ({ ...row, kind: "flow" as const })),
            ...(spread.some(amount => amount > 0.005)
                ? [{ label: "Depreciation of equipment", kind: "flow" as const, values: spread }] : []),
            { label: "Loan interest", kind: "flow", values: interest },
            ...(grants.some(amount => amount > 0.005)
                ? [{ label: "Grant income", kind: "flow" as const, values: grants }] : []),
            { label: "Profit before tax", kind: "flow", total: true, values: profit },
            ...(drawingsTaken && drawings.some(amount => amount > 0.005)
                ? [
                    { label: "Owner's drawings (not a cost)", kind: "flow" as const, values: cut(drawings) },
                    { label: "Profit kept in the business", kind: "flow" as const, total: true,
                        values: profit.map((amount, index) => amount - drawings[index]) }
                ]
                : [])
        ]
    };

    /* The balance sheet, at the end of each month. */
    const running = (values: number[], from = 0) => {
        let total = from;
        return values.map(amount => (total += amount));
    };
    const cash = closings;
    const owedByCustomers = running(cut(earned).map((amount, index) => amount - received[index]));
    const equipment = running(cut(assetsBought).map((amount, index) => amount - depreciation[index]));
    const deposits = running(cut(depositsPaid));
    const prepaid = running(cut(prepaidChange));
    const assets = cash.map((amount, index) =>
        amount + owedByCustomers[index] + prepaid[index] + equipment[index] + deposits[index]);
    const loansOwed = running(cut(loansIn).map((amount, index) => amount - loanPrincipal[index]), openingLoans);
    const capital = running(cut(capitalIn), openingCapital);
    const profitToDate = running(profit, openingRetained);
    const drawingsToDate = running(cut(drawings).map(amount => -amount));
    const equity = capital.map((amount, index) => amount + profitToDate[index] + drawingsToDate[index]);
    const liabilitiesAndEquity = loansOwed.map((amount, index) => amount + equity[index]);

    const balanceSheet: ForecastTable = {
        title: "Balance Sheet",
        rows: [
            { label: "Cash", kind: "closing", values: cash },
            { label: "Money owed by customers", kind: "closing", values: owedByCustomers },
            ...(prepaid.some(amount => Math.abs(amount) > 0.005)
                ? [{ label: "Prepaid costs", kind: "closing" as const, values: prepaid }] : []),
            { label: "Equipment, after depreciation", kind: "closing", values: equipment },
            ...(deposits.some(amount => amount > 0.005)
                ? [{ label: "Deposits paid", kind: "closing" as const, values: deposits }] : []),
            { label: "Total assets", kind: "closing", total: true, values: assets },
            { label: "Loans outstanding", kind: "closing", values: loansOwed },
            { label: "Total liabilities", kind: "closing", total: true, values: loansOwed },
            { label: "Capital put in", kind: "closing", values: capital },
            { label: "Profit to date", kind: "closing", values: profitToDate },
            ...(drawingsTaken && drawings.some(amount => amount > 0.005)
                ? [{ label: "Owner's drawings to date", kind: "closing" as const, values: drawingsToDate }] : []),
            { label: "Total equity", kind: "closing", total: true, values: equity },
            { label: "Total liabilities and equity", kind: "closing", total: true, values: liabilitiesAndEquity }
        ]
    };

    return {
        months: Array.from({ length }, (_, index) => planMonthLabel(start, index + 1)),
        cashFlow,
        profitAndLoss,
        balanceSheet,
        notes: [
            "Figures are estimates from the Business System's Financial Foundation and Financial Sustainability pages.",
            "The opening balance is funding already received, less one-time costs paid before the plan (a loss before it starts); confirmed funding is counted when it arrives, and pending funding is not counted.",
            "Equipment is an asset, depreciated evenly over " + DEPRECIATION_MONTHS / 12 +
                " years; a deposit is an asset and never a cost; other one-time costs count when they are paid.",
            "Annual and quarterly costs count a month at a time in the profit and loss; what is paid ahead is a prepaid cost.",
            "A grant is income, whenever it arrives; capital put in is the owners' equity.",
            ...(drawingsTaken
                ? ["As a " + legalEntity.organisation.legalForm + ", founders' pay is the owners' drawings, taken from profit, not a cost."]
                : []),
            "A negative cash figure is money still to be found: the funding gap.",
            "Tax on profit, and VAT or sales tax, are not calculated."
        ]
    };

}

/** A table cut to a period and a last plan year. */
export interface ForecastView {
    columns: string[];
    tables: { title: string; rows: { label: string; total?: boolean; values: number[] }[] }[];
}

/**
 * The forecast as columns: every month, or every plan year, up to and
 * including plan year `untilYear` (1 = the plan's first twelve months).
 */
export function forecastView(forecast: Forecast, period: ForecastPeriod, untilYear: number): ForecastView {

    const months = Math.min(forecast.months.length, Math.max(1, untilYear) * 12);

    if (period === "monthly") {
        return {
            columns: forecast.months.slice(0, months),
            tables: [forecast.cashFlow, forecast.profitAndLoss, forecast.balanceSheet].map(table => ({
                title: table.title,
                rows: table.rows.map(row => ({ label: row.label, total: row.total, values: row.values.slice(0, months) }))
            }))
        };
    }

    const years = Math.ceil(months / 12);
    const yearRange = (year: number) => [year * 12, Math.min(months, year * 12 + 12)] as const;

    return {
        columns: Array.from({ length: years }, (_, year) => {
            const [from, to] = yearRange(year);
            return "Year " + (year + 1) + " (" + forecast.months[from] + " – " + forecast.months[to - 1] + ")";
        }),
        tables: [forecast.cashFlow, forecast.profitAndLoss, forecast.balanceSheet].map(table => ({
            title: table.title,
            rows: table.rows.map(row => ({
                label: row.label,
                total: row.total,
                values: Array.from({ length: years }, (_, year) => {
                    const [from, to] = yearRange(year);
                    const slice = row.values.slice(from, to);
                    return row.kind === "opening" ? slice[0]
                        : row.kind === "closing" ? slice[slice.length - 1]
                            : slice.reduce((sum, amount) => sum + amount, 0);
                })
            }))
        }))
    };

}

function csvCell(value: string | number): string {
    const text = typeof value === "number" ? (Math.round(value * 100) / 100).toFixed(2) : value;
    return /[",\n]/.test(text) ? "\"" + text.replace(/"/g, "\"\"") + "\"" : text;
}

/**
 * The forecast as a spreadsheet: one block per table, plain numbers
 * (two decimals, no currency symbol) so a spreadsheet can sum them.
 */
export function forecastCsv(
    view: ForecastView,
    heading: { organization: string; currency: string; notes: string[] }
): string {

    const lines: string[] = [];
    const row = (cells: (string | number)[]) => lines.push(cells.map(csvCell).join(","));

    row([heading.organization + ": Financial Forecast"]);
    row(["Amounts in " + (heading.currency || "the organization's currency")]);
    lines.push("");

    view.tables.forEach(table => {
        row([table.title, ...view.columns]);
        table.rows.forEach(entry => row([entry.label, ...entry.values]));
        lines.push("");
    });

    row(["Notes"]);
    heading.notes.forEach(note => row([note]));

    // A byte-order mark, so a spreadsheet opens "£" and "–" correctly.
    return "﻿" + lines.join("\r\n") + "\r\n";

}
