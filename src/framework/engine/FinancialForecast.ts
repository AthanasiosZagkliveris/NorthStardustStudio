/*
    The financial forecast a lender asks for, drawn from the two
    Financial pages: a profit and loss forecast, a balance sheet and a
    cash-flow statement, month by month over the plan, and added up by
    quarter or plan year.

    The cash figures are the ones cashTimeline and sustainability
    calculate, so the spreadsheet agrees with the pages. The statements
    are laid out as an accountant expects them (IFRS for SMEs, Sections
    4, 5 and 7):
    - the profit and loss analyses its expenses by nature, down to an
      operating profit, then other income and finance costs, to a
      profit before tax; income tax is estimated only where the
      Financial Foundation page gives a rate on profit (see
      incomeTaxRate), and a pass-through business pays none;
    - the balance sheet is classified: current and non-current assets
      and liabilities, the part of a loan due within 12 months current;
    - the cash flow is grouped into operating, investing and financing
      activities (direct method): equipment and deposits are
      investing, capital, loans and the owners' drawings financing.
    The figures follow the usual conventions:
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
      cost: never a line of the profit and loss, but set against its
      profit in a reconciliation below it (Profit Kept in the
      Business), which is Financial Sustainability's result;
    - income tax at a rate is a flat rate on each plan year's profit
      before tax (none on a loss, no loss carried forward), accrued
      month by month and paid in the first month of the next plan
      year; the Financial pages' own results stay before tax;
    - VAT or sales tax is not calculated, and every cost is paid when
      due (no trade payables): the answers hold no supplier terms.

    The balance sheet balances by construction: every flow above lands
    on exactly one line of it.
*/

import type { LegalEntityValue } from "./AnswerUtils.ts";
import {
    monthlyEquivalent,
    scheduledAmount,
    spentBeforePlan,
    type CostLine,
    type FinancialFoundationValue,
    type FinancialSustainabilityValue,
    MODEL_MONTHS,
    allFunding,
    costSchedule,
    fundingStanding,
    incomeTaxRate,
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

export type ForecastPeriod = "monthly" | "quarterly" | "annual";

/** "flow" adds up over a period; "opening"/"closing" take its first/last month. */
type RowKind = "flow" | "opening" | "closing";

interface ForecastRow {
    label: string;
    kind: RowKind;
    /** A subtotal or total, set apart in a table. */
    total?: boolean;
    /** A label over the rows below it ("Current assets"), with no figures. */
    heading?: boolean;
    /** Words in place of figures ("Not estimated"), in every column. */
    text?: string;
    values: number[];
    /** The balance sheet's figure at the plan's start, before its first month. */
    opening?: number;
}

export interface ForecastTable {
    title: string;
    /** A line under the title, saying what the table is. */
    note?: string;
    rows: ForecastRow[];
    /** Whether the table has an Opening column (the balance sheet). */
    opening?: boolean;
}

export interface Forecast {
    /** "Oct 2026", one per plan month. */
    months: string[];
    profitAndLoss: ForecastTable;
    /**
     * Where the owners take drawings: the profit for the period less
     * the drawings, which is Financial Sustainability's result. Null
     * where founders are paid a salary (a cost already).
     */
    profitKept: ForecastTable | null;
    balanceSheet: ForecastTable;
    cashFlow: ForecastTable;
    /** Equipment bought and deposits paid: the capital-expenditure budget. */
    capitalExpenditure: ForecastTable;
    notes: string[];
}

/** The statements, in the order they are read: profit, what is kept of it, position, cash. */
export function forecastTables(forecast: Forecast): ForecastTable[] {
    return [
        forecast.profitAndLoss,
        ...(forecast.profitKept ? [forecast.profitKept] : []),
        forecast.balanceSheet,
        forecast.cashFlow
    ];
}

/** Three years: a common life for computers, furniture and small equipment. */
const DEPRECIATION_MONTHS = 36;

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

/**
 * The expense lines, by nature (IFRS for SMEs 5.11): what a cost is,
 * not which page recorded it. In the order they are listed.
 */
export const EXPENSE_NATURES = [
    "Salaries",
    "Premises",
    "Utilities",
    "Software and digital services",
    "Marketing and sales",
    "Professional fees",
    "Insurance",
    "Registration and licence fees",
    "Equipment hire and maintenance",
    "Delivery tools and supplies",
    "Outsourced services",
    "Other expenses"
] as const;

export type ExpenseNature = typeof EXPENSE_NATURES[number];

/**
 * A cost's nature, from where it was recorded (its sourcePath) and,
 * for a cost the path cannot tell (a Legal Entity expense, a cost
 * added on the Financial Foundation page), from its name.
 */
export function expenseNature(line: CostLine): ExpenseNature {
    const path = (token: string) => line.sourcePath.some(entry => entry === token || entry.startsWith(token));
    const name = line.name;
    if (path(FOUNDER_PAY)) {
        return "Salaries";
    }
    if (/insur/i.test(name)) {
        return "Insurance";
    }
    if (path("partners-infrastructure-professionals") || path("partners-offering-professionals") ||
        /accountan|bookkeep|lawyer|solicitor|attorney|legal advice|consultan|tutor|freelanc/i.test(name)) {
        return "Professional fees";
    }
    if (path("resource-group-digital")) {
        return "Software and digital services";
    }
    if (path("resource-group-utilities")) {
        return "Utilities";
    }
    if (path("resource-group-workspace") || /cowork|\brent\b|premises|office|\bdesk\b|fit-?out|studio space/i.test(name)) {
        return "Premises";
    }
    if (path("resource-group-marketing") || path("resource-group-sales") ||
        /market|advertis|promot|\bstand\b|\bfair\b|\bstall\b|network|meetup|linkedin|copywrit|web design|signage|\bads?\b/i.test(name)) {
        return "Marketing and sales";
    }
    if (path("legal-section") || /filing|registration|licen[cs]e|\bfees?\b|publication|incorporation|trade ?mark|confirmation statement/i.test(name)) {
        return "Registration and licence fees";
    }
    if (ASSET_GROUPS.some(group => path(group))) {
        return "Equipment hire and maintenance";
    }
    if (path("section-offering-resources") || path("resource-group-operational") || path("resource-group-production")) {
        return "Delivery tools and supplies";
    }
    if (path("partners-infrastructure-providers") || path("partners-offering-providers")) {
        return "Outsourced services";
    }
    return "Other expenses";
}

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
    // The principal repaid a year past the model too, for the part
    // of a loan due within 12 months of its last month.
    const principalAhead = new Array<number>(MODEL_MONTHS + 12).fill(0);

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
                if (payment.month >= 1 && payment.month <= MODEL_MONTHS + 12) {
                    principalAhead[payment.month - 1] += payment.principal;
                }
                if (payment.month <= MODEL_MONTHS) {
                    loanPrincipal[payment.month - 1] += payment.principal;
                    loanInterest[payment.month - 1] += payment.interest;
                }
            });
        }

    });

    /* Every cost paid, sorted by what it is: equipment and deposits
       (investing: assets, not costs), the owners' drawings (financing:
       taken from profit, not a cost), and every other cost by its
       nature -- paid in the cash flow, and in the profit and loss with
       an annual or quarterly cost spread a month at a time from its
       first payment (what is paid ahead is a prepaid cost). */
    const drawingsTaken = ownersTakeDrawings(legalEntity.organisation.legalForm);
    const drawings = zeros();
    const assetsBought = zeros();
    const depositsPaid = zeros();
    const prepaidChange = zeros();
    const paidByNature = Object.fromEntries(EXPENSE_NATURES.map(nature => [nature, zeros()])) as Record<ExpenseNature, number[]>;
    const expensedByNature = Object.fromEntries(EXPENSE_NATURES.map(nature => [nature, zeros()])) as Record<ExpenseNature, number[]>;
    lines.forEach(line => {
        const paid = costSchedule(line, start);
        const kind = assetOf(line);
        if (kind) {
            add(kind === "equipment" ? assetsBought : depositsPaid, paid);
            return;
        }
        if (drawingsTaken && line.sourcePath.includes(FOUNDER_PAY)) {
            add(drawings, paid);
            return;
        }
        const nature = expenseNature(line);
        add(paidByNature[nature], paid);
        const first = paid.findIndex(amount => amount > 0);
        if ((line.frequency === "annually" || line.frequency === "quarterly") && first >= 0) {
            const monthly = monthlyEquivalent(scheduledAmount(line), line.frequency);
            paid.forEach((amount, index) => {
                const spread = index >= first ? monthly : 0;
                expensedByNature[nature][index] += spread;
                prepaidChange[index] += amount - spread;
            });
        } else {
            add(expensedByNature[nature], paid);
        }
    });

    const depreciation = zeros();
    assetsBought.forEach((amount, month) => {
        for (let index = month; index < Math.min(MODEL_MONTHS, month + DEPRECIATION_MONTHS); index++) {
            depreciation[index] += amount / DEPRECIATION_MONTHS;
        }
    });

    const negative = (values: number[]) => cut(values).map(amount => -amount);
    const some = (values: number[]) => values.some(amount => Math.abs(amount) > 0.005);
    const sum = (rows: { values: number[] }[]) =>
        Array.from({ length }, (_, index) => rows.reduce((total, row) => total + row.values[index], 0));
    const heading = (label: string): ForecastRow => ({ label, kind: "closing", heading: true, values: [] });
    const flow = (label: string, values: number[]): ForecastRow => ({ label, kind: "flow", values });

    /* The profit and loss: revenue when earned, not when paid;
       expenses by nature, down to the operating profit; then other
       income and finance costs. */
    const revenue = cut(earned);
    const costOfSales = cut(variable);
    const gross = revenue.map((amount, index) => amount - costOfSales[index]);
    const expenseRows = [
        ...EXPENSE_NATURES.map(nature => flow(nature, cut(expensedByNature[nature]))),
        flow("Depreciation of equipment", cut(depreciation))
    ].filter(row => some(row.values));
    const expenses = sum(expenseRows);
    const operating = gross.map((amount, index) => amount - expenses[index]);
    const grants = cut(grantsIn);
    const interest = cut(loanInterest);
    const profit = operating.map((amount, index) => amount + grants[index] - interest[index]);

    /* Income tax, where a rate on profit is given: the rate on each
       plan year's profit before tax, and nothing on a loss (no loss
       is carried forward). Accrued month by month in proportion to
       each month's profit, so each year's months add up to exactly
       its tax; owed until paid in the first month of the next plan
       year, and the last year's still owed at the plan's end. */
    const taxRate = incomeTaxRate(foundation);
    const passThrough = taxRate === null && foundation.incomeTax === "pass-through";
    const tax = profit.map(() => 0);
    const taxPaid = profit.map(() => 0);
    if (taxRate !== null) {
        for (let from = 0; from < length; from += 12) {
            const year = profit.slice(from, from + 12);
            const due = Math.max(0, year.reduce((total, amount) => total + amount, 0)) * taxRate;
            const gains = year.reduce((total, amount) => total + Math.max(0, amount), 0);
            year.forEach((amount, offset) => {
                tax[from + offset] = gains > 0 ? due * Math.max(0, amount) / gains : 0;
            });
            if (from + 12 < length) {
                taxPaid[from + 12] = due;
            }
        }
    }
    const netProfit = profit.map((amount, index) => amount - tax[index]);
    // "25%", "21.12%": the rate as it was typed.
    const ratePercent = taxRate === null ? "" : String(Math.round(taxRate * 10000) / 100) + "%";
    const taxRows: ForecastRow[] = taxRate !== null
        ? [flow("Income tax", tax), { ...flow("Net profit", netProfit), total: true }]
        : [
            // Without a rate: said, never guessed.
            { label: "Income tax", kind: "flow", text: passThrough ? "None at business level" : "Not estimated", values: [] },
            ...(passThrough ? [{ ...flow("Net profit", profit), total: true }] : [])
        ];

    const profitAndLoss: ForecastTable = {
        title: "Profit and Loss Forecast",
        rows: [
            flow("Revenue", revenue),
            flow("Cost of sales (variable costs)", costOfSales),
            { ...flow("Gross profit", gross), total: true },
            heading("Operating expenses"),
            ...expenseRows,
            { ...flow("Total operating expenses", expenses), total: true },
            { ...flow("Operating profit", operating), total: true },
            ...(some(grants) ? [flow("Other income (grants)", grants)] : []),
            ...(some(interest) ? [flow("Finance costs (loan interest)", interest)] : []),
            { ...flow("Profit before tax", profit), total: true },
            ...taxRows
        ]
    };

    /* The owners' drawings, set against the profit: what the business
       keeps, which Financial Sustainability shows as revenue less
       costs (its costs count the founder's pay). */
    const kept = netProfit.map((amount, index) => amount - drawings[index]);
    const profitKept: ForecastTable | null = drawingsTaken && some(drawings)
        ? {
            title: "Profit Kept in the Business",
            note: "Profit for the period less the owner's drawings: the result Financial Sustainability shows as revenue less costs, where the founder's pay is a cost.",
            rows: [
                flow(taxRate !== null ? "Profit for the period (after tax)" : "Profit for the period (before tax)", netProfit),
                flow("Less: owner's drawings", negative(drawings)),
                { ...flow("Profit kept in the business", kept), total: true }
            ]
        }
        : null;

    /* The cash flow, by activity (direct method). Money in is positive,
       money out negative; each activity nets to its own total. */
    const operatingRows = [
        flow("Receipts from customers", cut(received)),
        flow("Grants received", cut(grantsIn)),
        ...EXPENSE_NATURES.map(nature => flow(nature, negative(paidByNature[nature]))),
        flow("Variable costs of sales", negative(variable)),
        flow("Interest paid", negative(loanInterest)),
        flow("Income tax paid", negative(taxPaid))
    ].filter(row => some(row.values) || row.label === "Receipts from customers");
    const investingRows = [
        flow("Purchase of equipment", negative(assetsBought)),
        flow("Deposits paid", negative(depositsPaid))
    ].filter(row => some(row.values));
    const financingRows = [
        flow("Capital introduced", cut(capitalIn)),
        flow("Loans received", cut(loansIn)),
        flow("Loan repayments", negative(loanPrincipal)),
        flow("Owner's drawings", negative(drawings))
    ].filter(row => some(row.values));
    const activity = (title: string, rows: ForecastRow[], totalLabel: string): ForecastRow[] =>
        rows.length === 0 ? [] : [heading(title), ...rows, { ...flow(totalLabel, sum(rows)), total: true }];
    const net = sum([...operatingRows, ...investingRows, ...financingRows]);

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
            ...activity("Operating activities", operatingRows, "Net cash from operating activities"),
            ...activity("Investing activities", investingRows, "Net cash used in investing activities"),
            ...activity("Financing activities", financingRows, "Net cash from financing activities"),
            { ...flow("Net change in cash", net), total: true },
            { label: "Cash at start of period", kind: "opening", values: openings },
            { label: "Cash at end of period", kind: "closing", total: true, values: closings }
        ]
    };

    /* The capital-expenditure budget: what is bought to keep. */
    const capitalExpenditure: ForecastTable = {
        title: "Capital Expenditure",
        rows: [
            flow("Equipment", cut(assetsBought)),
            flow("Deposits", cut(depositsPaid)),
            { ...flow("Total capital expenditure", cut(assetsBought).map((amount, index) => amount + depositsPaid[index])), total: true }
        ]
    };

    /* The balance sheet, at the end of each month: current, then
       non-current, as IFRS for SMEs 4.4 classifies it. */
    const running = (values: number[], from = 0) => {
        let total = from;
        return values.map(amount => (total += amount));
    };
    // Cash below zero is money the plan has not found yet: owed, in
    // effect, rather than an asset of less than nothing.
    const cash = closings.map(amount => Math.max(0, amount));
    const shortfall = closings.map(amount => Math.max(0, -amount));
    const receivables = running(cut(earned).map((amount, index) => amount - received[index]));
    const equipment = running(cut(assetsBought).map((amount, index) => amount - depreciation[index]));
    const deposits = running(cut(depositsPaid));
    const prepaid = running(cut(prepaidChange));
    const loansOwed = running(cut(loansIn).map((amount, index) => amount - loanPrincipal[index]), openingLoans);
    // The part of a loan repaid within the next 12 months is current.
    const dueWithinYear = (index: number, owed: number) =>
        Math.min(owed, principalAhead.slice(index, index + 12).reduce((total, amount) => total + amount, 0));
    const loansCurrent = loansOwed.map((owed, index) => dueWithinYear(index + 1, owed));
    const loansLater = loansOwed.map((owed, index) => owed - loansCurrent[index]);
    const openingLoansCurrent = dueWithinYear(0, openingLoans);
    const capital = running(cut(capitalIn), openingCapital);
    const profitToDate = running(netProfit, openingRetained);
    const taxOwed = running(tax.map((amount, index) => amount - taxPaid[index]));
    const drawingsToDate = running(negative(drawings));

    /* At the plan's start: the money in hand (or short), what is owed
       on loans already taken, and the owners' part of the rest. */
    const openingShortfall = Math.max(0, -opening);

    type Line = { label: string; values: number[]; opening: number };
    const shows = (line: Line) => some(line.values) || Math.abs(line.opening) > 0.005;
    const lineRow = (line: Line): ForecastRow => ({ label: line.label, kind: "closing", values: line.values, opening: line.opening });
    const totalOf = (label: string, parts: Line[]): Line => ({
        label,
        values: Array.from({ length }, (_, index) => parts.reduce((total, part) => total + part.values[index], 0)),
        opening: parts.reduce((total, part) => total + part.opening, 0)
    });
    const totalRow = (line: Line): ForecastRow => ({ ...lineRow(line), total: true });
    // A group of lines under its heading, with its total; nothing when
    // every line in it is empty. Cash always shows.
    const group = (title: string, parts: Line[], totalLabel: string, keep: string[] = []) => {
        const shown = parts.filter(part => shows(part) || keep.includes(part.label));
        return {
            total: totalOf(totalLabel, parts),
            rows: shown.length === 0 ? [] : [heading(title), ...shown.map(lineRow), totalRow(totalOf(totalLabel, parts))]
        };
    };

    const currentAssets = group("Current assets", [
        { label: "Cash", values: cash, opening: Math.max(0, opening) },
        { label: "Trade receivables", values: receivables, opening: 0 },
        { label: "Prepaid expenses", values: prepaid, opening: 0 }
    ], "Total current assets", ["Cash"]);
    const nonCurrentAssets = group("Non-current assets", [
        { label: "Equipment (net of depreciation)", values: equipment, opening: 0 },
        { label: "Deposits", values: deposits, opening: 0 }
    ], "Total non-current assets");
    const currentLiabilities = group("Current liabilities", [
        { label: "Cash shortfall (unfunded)", values: shortfall, opening: openingShortfall },
        { label: "Loans: due within 12 months", values: loansCurrent, opening: openingLoansCurrent },
        { label: "Income tax payable", values: taxOwed, opening: 0 }
    ], "Total current liabilities");
    const nonCurrentLiabilities = group("Non-current liabilities", [
        { label: "Loans: due after 12 months", values: loansLater, opening: openingLoans - openingLoansCurrent }
    ], "Total non-current liabilities");
    const equityGroup = group("Equity", [
        { label: drawingsTaken ? "Owner's capital" : "Share capital", values: capital, opening: openingCapital },
        { label: drawingsTaken ? "Accumulated profit" : "Retained earnings", values: profitToDate, opening: openingRetained },
        ...(drawingsTaken ? [{ label: "Less: owner's drawings", values: drawingsToDate, opening: 0 }] : [])
    ], "Total equity", [drawingsTaken ? "Owner's capital" : "Share capital", drawingsTaken ? "Accumulated profit" : "Retained earnings"]);

    const assets = totalOf("Total assets", [currentAssets.total, nonCurrentAssets.total]);
    const liabilities = totalOf("Total liabilities", [currentLiabilities.total, nonCurrentLiabilities.total]);

    const balanceSheet: ForecastTable = {
        title: "Balance Sheet",
        opening: true,
        rows: [
            ...currentAssets.rows,
            ...nonCurrentAssets.rows,
            totalRow(assets),
            ...currentLiabilities.rows,
            ...nonCurrentLiabilities.rows,
            totalRow(liabilities),
            ...equityGroup.rows,
            totalRow(totalOf("Total liabilities and equity", [liabilities, equityGroup.total]))
        ]
    };

    return {
        months: Array.from({ length }, (_, index) => planMonthLabel(start, index + 1)),
        profitAndLoss,
        profitKept,
        balanceSheet,
        cashFlow,
        capitalExpenditure,
        notes: [
            "Figures are estimates from the Business System's Financial Foundation and Financial Sustainability pages.",
            "Cash at the start of the plan is funding already received, less one-time costs paid before the plan (a loss before it starts); confirmed funding is counted when it arrives, and pending funding is not counted.",
            "Equipment is an asset, depreciated evenly over " + DEPRECIATION_MONTHS / 12 +
                " years; a deposit is an asset and never a cost; other one-time costs count when they are paid.",
            "Annual and quarterly costs count a month at a time in the profit and loss; what is paid ahead is a prepaid expense.",
            "Operating expenses are analysed by nature, from where each cost was recorded.",
            "A grant is other income, whenever it arrives; capital put in is the owners' equity.",
            ...(drawingsTaken
                ? ["As a " + legalEntity.organisation.legalForm + ", founders' pay is the owner's drawings: taken from profit, not a cost. " +
                    "It is not a line of the profit and loss: it is set against the profit below it, is a financing payment in the cash flow, and reduces equity on the balance sheet."]
                : []),
            ...(drawingsTaken
                ? [taxRate !== null
                    ? "Profit kept in the business is the profit after tax less the drawings. It matches Financial Sustainability's revenue less costs, month by month, except where the profit and loss also counts one-time costs, depreciation, grants, loan interest or income tax as they fall."
                    : "Profit kept in the business matches Financial Sustainability's revenue less costs, month by month, except where the profit and loss also counts one-time costs, depreciation, grants or loan interest as they fall."]
                : []),
            "The cash flow is grouped into operating, investing and financing activities (direct method); interest paid is an operating payment.",
            "Cash below zero is shown as a current liability, Cash shortfall (unfunded): money the plan has not found yet, not an arranged overdraft.",
            "The part of a loan repaid within the next 12 months is a current liability; the rest is non-current.",
            ...(taxRate !== null
                ? ["Income tax is estimated at a flat " + ratePercent + " of each plan year's profit before tax: none on a loss, and no loss carried forward to a later year. " +
                    "It is accrued month by month in proportion to each month's profit, is a current liability (Income tax payable) until paid, and is paid in the first month of the following plan year; the final plan year's tax is still owed at the plan's end.",
                "Break even, runway and the funding gap on the Financial Foundation and Financial Sustainability pages are before income tax.",
                "VAT or sales tax is not estimated. " +
                    "There are no trade payables: every cost is taken as paid when due, as no supplier payment terms are recorded."]
                : passThrough
                    ? ["There is no income tax at business level: as a pass-through business, its profit is taxed as the owners' personal income, which is not estimated here. " +
                        "VAT or sales tax is not estimated. " +
                        "There are no trade payables: every cost is taken as paid when due, as no supplier payment terms are recorded."]
                    : ["Income tax, and VAT or sales tax, are not estimated: the Foundation answers hold no tax rate. " +
                        "There are no trade payables: every cost is taken as paid when due, as no supplier payment terms are recorded."])
        ]
    };

}

/** One row of a view: a heading has no figures; a text row has words instead. */
export interface ForecastViewRow {
    label: string;
    total?: boolean;
    heading?: boolean;
    /** Words in place of figures ("Not estimated"). */
    text?: string;
    values: number[];
}

/** One table of a view, with its own columns: the balance sheet opens with its Opening one. */
export interface ForecastViewTable {
    title: string;
    /** A line under the title, saying what the table is. */
    note?: string;
    columns: string[];
    /** Which columns are a plan year's subtotal (the monthly or quarterly view's "Year 1"). */
    subtotalColumns: number[];
    rows: ForecastViewRow[];
}

/** A table cut to a period and a last plan year. */
export interface ForecastView {
    /** The period columns every table shares. */
    columns: string[];
    tables: ForecastViewTable[];
}

/** "Opening (Jan 2027)": the balance sheet before the plan's first month. */
function openingColumn(forecast: Forecast): string {
    return "Opening" + (forecast.months[0] ? " (" + forecast.months[0] + ")" : "");
}

/** One column: plan months [from, to), and whether it is a year's subtotal. */
interface Span {
    label: string;
    from: number;
    to: number;
    subtotal: boolean;
}

/** "Jan – Mar 2027", or "Nov 2026 – Jan 2027" across a year's end. */
function monthRange(forecast: Forecast, from: number, to: number): string {
    const first = forecast.months[from] ?? "";
    const last = forecast.months[to - 1] ?? "";
    const [firstMonth, firstYear] = first.split(" ");
    return firstYear && last.endsWith(" " + firstYear) ? firstMonth + " – " + last : first + " – " + last;
}

/**
 * The forecast as columns, up to and including plan year `untilYear`
 * (1 = the plan's first twelve months):
 * - "monthly": every month, each plan year followed by its subtotal;
 * - "quarterly": every quarter of the plan, each plan year followed by
 *   its subtotal -- or, with `quarterlyYears`, only the first that many
 *   years by quarter and the rest by year (the plan's Year 1 detail);
 * - "annual": every plan year.
 * The statements come in the order they are read (forecastTables),
 * unless `tables` names others.
 */
export function forecastView(
    forecast: Forecast,
    period: ForecastPeriod,
    untilYear: number,
    options: { quarterlyYears?: number; tables?: ForecastTable[] } = {}
): ForecastView {

    const months = Math.min(forecast.months.length, Math.max(1, untilYear) * 12);
    const tables = options.tables ?? forecastTables(forecast);
    const years = Math.ceil(months / 12);

    const yearSpan = (year: number): Span => ({
        label: "Year " + (year + 1) + " (" + forecast.months[year * 12] + " – " + forecast.months[Math.min(months, year * 12 + 12) - 1] + ")",
        from: year * 12,
        to: Math.min(months, year * 12 + 12),
        subtotal: false
    });
    const subtotalSpan = (year: number): Span => ({ ...yearSpan(year), label: "Year " + (year + 1), subtotal: true });
    const stepped = (year: number, step: number, name: (index: number, from: number, to: number) => string): Span[] => {
        const spans: Span[] = [];
        for (let from = year * 12, index = 0; from < Math.min(months, year * 12 + 12); from += step, index++) {
            const to = Math.min(months, from + step, year * 12 + 12);
            spans.push({ label: name(index, from, to), from, to, subtotal: false });
        }
        return spans;
    };

    const spans: Span[] = Array.from({ length: years }, (_, year) => {
        if (period === "monthly") {
            return [...stepped(year, 1, (_index, from) => forecast.months[from]), subtotalSpan(year)];
        }
        if (period === "quarterly" && year < (options.quarterlyYears ?? years)) {
            return [
                ...stepped(year, 3, (index, from, to) => "Q" + (index + 1) + " (" + monthRange(forecast, from, to) + ")"),
                subtotalSpan(year)
            ];
        }
        return [yearSpan(year)];
    }).flat();

    /* A row's figure over a span: a flow adds up; an opening takes the
       first month, a closing the last. A figure under half a cent is
       nothing, never "-$0". */
    const cell = (row: ForecastRow, span: Span): number => {
        const slice = row.values.slice(span.from, span.to);
        const amount = row.kind === "opening" ? slice[0]
            : row.kind === "closing" ? slice[slice.length - 1]
                : slice.reduce((total, value) => total + value, 0);
        return Math.abs(amount ?? 0) < 0.005 ? 0 : amount;
    };

    const columns = spans.map(span => span.label);
    const subtotals = spans.map((span, index) => span.subtotal ? index : -1).filter(index => index >= 0);

    // A line with nothing in it, in any column shown, says nothing:
    // left out, in every table alike. Totals, headings and words stay.
    const says = (row: ForecastViewRow) => row.heading || row.total || row.text !== undefined ||
        row.values.some(amount => Math.abs(amount) > 0.005);

    return {
        columns,
        tables: tables.map(table => ({
            title: table.title,
            ...(table.note ? { note: table.note } : {}),
            columns: table.opening ? [openingColumn(forecast), ...columns] : columns,
            subtotalColumns: subtotals.map(index => index + (table.opening ? 1 : 0)),
            rows: table.rows.map(row => ({
                label: row.label,
                total: row.total,
                heading: row.heading,
                ...(row.text !== undefined ? { text: row.text } : {}),
                values: row.heading || row.text !== undefined
                    ? []
                    : [...(table.opening ? [Math.abs(row.opening ?? 0) < 0.005 ? 0 : row.opening ?? 0] : []),
                        ...spans.map(span => cell(row, span))]
            })).filter(says)
        }))
    };

}

/**
 * A monthly or quarterly forecast table split into one table per plan year, each
 * with its own year subtotal -- so a document never has to lay twelve
 * months of every plan year side by side on one page. A table already
 * covering one plan year (or none) comes back unchanged.
 *
 * Uses the table's own subtotalColumns to find each year's boundary,
 * so the Opening column of a table like the Balance Sheet (present
 * once, before the first year) stays with Year 1 and is not repeated.
 */
export function splitMonthlyTableByYear(table: ForecastViewTable): ForecastViewTable[] {

    if (table.subtotalColumns.length <= 1) {
        return [table];
    }

    let start = 0;

    return table.subtotalColumns.map((end, index) => {
        const slice: ForecastViewTable = {
            title: table.title + ": Year " + (index + 1),
            ...(table.note ? { note: table.note } : {}),
            columns: table.columns.slice(start, end + 1),
            subtotalColumns: [end - start],
            rows: table.rows.map(row => ({
                ...row,
                values: row.heading ? [] : row.values.slice(start, end + 1)
            }))
        };
        start = end + 1;
        return slice;
    });

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
        row([table.title, ...table.columns]);
        table.rows.forEach(entry => row([entry.label, ...(entry.text !== undefined ? [entry.text] : entry.values)]));
        lines.push("");
    });

    row(["Notes"]);
    heading.notes.forEach(note => row([note]));

    // A byte-order mark, so a spreadsheet opens "£" and "–" correctly.
    return "﻿" + lines.join("\r\n") + "\r\n";

}
