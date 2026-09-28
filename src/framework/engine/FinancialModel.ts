/*
    The Business System's two Financial pages -- Page 4, Financial
    Foundation, and Page 5, Financial Sustainability -- as data and
    as arithmetic.

    Kept apart from AnswerUtils because most of it is CALCULATION,
    not answer handling: a month-by-month cash model, a loan
    repayment schedule and a break-even analysis. Pure functions of
    plain values, so the whole of it can be tested without drawing a
    page.

    Everything else it reads -- the Legal Entity, Page 1's Offerings,
    Page 3's costs -- arrives already normalised, so this file only
    imports TYPES from AnswerUtils and the two never depend on each
    other at load time.

    Specifications:
    docs/specifications/business-system/page-4-financial-foundation.md
    docs/specifications/business-system/page-5-financial-sustainability.md

    Two decisions the specifications leave open, settled with the
    product owner:

    1. TIME. Page 4 asks once for the month the plan starts; that is
       Month 1, and the model runs MODEL_MONTHS months from it, shown over the plan's chosen length (planLength). Every
       date on both pages is a month picked within it.
    2. CURRENCY. Every total is in the organisation's currency (the
       one its Legal Entity country uses). A cost priced in another
       currency is listed, flagged, and left OUT of every total --
       there are no exchange rates here to convert it with.
*/

import { parseAmount, parseDecimal } from "./Amounts.ts";
import type {
    BusinessCapabilityValue,
    BusinessCostValue,
    LegalEntityValue,
    StrategyMonthValue
} from "./AnswerUtils.ts";
import { resourceUnitCount } from "./AnswerUtils.ts";
import { type CapacityCheck, type DemandValue, capacityCheck, demandResult } from "./DemandCapacity.ts";

/**
 * How many months the model calculates from the plan's first month:
 * the longest plan there is. Every monthly series is this long; what
 * a page shows and judges is cut to the plan's own length (planLength).
 */
export const MODEL_MONTHS = 60;

/** The plan lengths a founder can choose, in years. */
export const PLAN_YEAR_CHOICES = [1, 2, 3, 4, 5] as const;

/**
 * Three years unless chosen: a lender asks for a first year month by
 * month and a profit and loss forecast for three.
 */
export const DEFAULT_PLAN_YEARS = 3;

/** The plan's length in years, as chosen or by default. */
export function planYears(value: { planYears?: string }): number {
    const years = Number(value.planYears);
    return PLAN_YEAR_CHOICES.includes(years as typeof PLAN_YEAR_CHOICES[number]) ? years : DEFAULT_PLAN_YEARS;
}

/** The plan's length in months. */
export function planLength(value: { planYears?: string }): number {
    return planYears(value) * 12;
}

/* ==========================================================
   Small readers
========================================================== */

function asObject(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};
}

function asText(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function asList(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

function asTextList(value: unknown): string[] {
    return asList(value).map(asText).filter(entry => entry.length > 0);
}

function financeId(prefix: string): string {
    return prefix + "-" + Math.random().toString(36).slice(2, 10);
}

function asMonth(value: unknown): StrategyMonthValue {
    const source = asObject(value);
    return { month: asText(source.month), year: asText(source.year) };
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
    return allowed.includes(value as T) ? value as T : fallback;
}

/* How a typed amount is read lives in Amounts.ts, so the Identity
   pages can use it too (this engine imports theirs). */
export { parseAmount, parseDecimal };

/*
    GUARDS for answers saved before the pages limited what could be
    typed: the most payments, periods, items in an order and months
    a figure can be, as the pages limit them.
*/
const MAX_PERIODS = 600;
const MAX_ITEMS = 10_000;
const MAX_MONTHS = 60;

/** An amount below 0 counts as 0; nothing stays nothing. */
function notNegative(amount: number | null): number | null {
    return amount === null ? null : Math.max(0, amount);
}

/** A percentage as typed ("5", "5%", "4,5") as a number, or null. */
export function parsePercent(text: string): number | null {
    return parseDecimal(text.replace("%", ""));
}

/* ==========================================================
   Months
========================================================== */

/** The plan's first month, as the month picker stores it. */
export function currentMonth(today: Date = new Date()): StrategyMonthValue {
    return {
        month: String(today.getMonth() + 1).padStart(2, "0"),
        year: String(today.getFullYear())
    };
}

function monthOrdinal(month: StrategyMonthValue): number | null {
    const m = Number(month.month);
    const y = Number(month.year);
    return m >= 1 && m <= 12 && y > 0 ? y * 12 + (m - 1) : null;
}

/**
 * Which month of the plan a picked month is: 1 for the plan's first
 * month. A month before the plan starts counts as Month 1 -- money
 * that arrived or left before the plan is already in the position
 * it starts from. Null when no month has been picked.
 */
export function planMonth(
    start: StrategyMonthValue,
    month: StrategyMonthValue
): number | null {

    const first = monthOrdinal(start);
    const chosen = monthOrdinal(month);

    if (first === null || chosen === null) {
        return null;
    }

    return Math.max(1, chosen - first + 1);

}

/**
 * The page with a plan start to calculate from: the one chosen, or
 * this month until one is. Stored only when the founder chooses it,
 * so an untouched page is not recorded as answered.
 */
export function withPlanStart<T extends { planStart: StrategyMonthValue }>(
    value: T,
    today: Date = new Date()
): T {
    return monthOrdinal(value.planStart) === null
        ? { ...value, planStart: currentMonth(today) }
        : value;
}

/** The calendar month a plan month falls in, as "Mar 2027". */
export function planMonthLabel(start: StrategyMonthValue, index: number): string {

    const first = monthOrdinal(start);

    if (first === null) {
        return "Month " + index;
    }

    const ordinal = first + index - 1;

    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return names[ordinal % 12] + " " + Math.floor(ordinal / 12);

}

/** Whether a month falls inside the plan (for the month pickers). */
export function withinPlan(
    start: StrategyMonthValue,
    month: number,
    year: number,
    months: number = MODEL_MONTHS
): boolean {
    const first = monthOrdinal(start);
    if (first === null) {
        return true;
    }
    const chosen = year * 12 + (month - 1);
    return chosen >= first && chosen < first + months;
}

/* ==========================================================
   Page 4 -- the lists it chooses from
========================================================== */

export const COST_GROUPS = [
    {
        id: "establishment",
        label: "Establishment",
        explanation: "Costs required to establish or launch the organization."
    },
    {
        id: "operating",
        label: "Operating",
        explanation: "Ongoing costs that keep the organization functioning, independently of any one Offering."
    },
    {
        id: "offering",
        label: "Offering",
        explanation: "Costs of creating, delivering or supporting a particular Offering."
    },
    {
        id: "other",
        label: "Other",
        explanation: "Costs that do not reasonably fit the other three groups."
    }
] as const;

export type CostGroup = typeof COST_GROUPS[number]["id"];

export const COST_BEHAVIOURS = [
    {
        id: "fixed",
        label: "Fixed",
        explanation: "Does not materially change with the level of activity over the period."
    },
    {
        id: "variable",
        label: "Variable",
        explanation: "Changes with production, sales, projects or usage."
    },
    {
        id: "semi-variable",
        label: "Semi-variable",
        explanation: "Has a fixed part and a part that changes with activity. Separate the two where you can."
    }
] as const;

export type CostBehaviour = typeof COST_BEHAVIOURS[number]["id"];

export const COST_FREQUENCIES = [
    { id: "one-time", label: "One-time" },
    { id: "monthly", label: "Monthly" },
    { id: "quarterly", label: "Quarterly" },
    { id: "annually", label: "Annually" },
    { id: "per-project", label: "Per project" },
    { id: "per-unit", label: "Per unit" },
    { id: "per-order", label: "Per order" },
    { id: "usage-based", label: "Usage-based" },
    { id: "other", label: "Other" }
] as const;

export type CostFrequency = typeof COST_FREQUENCIES[number]["id"];

/** Frequencies with a place in the calendar. */
const SCHEDULED_FREQUENCIES: readonly CostFrequency[] =
    ["one-time", "monthly", "quarterly", "annually"];

/** Frequencies paid per unit of activity: a variable cost per unit. */
const PER_UNIT_FREQUENCIES: readonly CostFrequency[] = ["per-project", "per-unit", "per-order"];

export const FUNDING_NEED_CATEGORIES = [
    {
        id: "establishment",
        label: "Establishment",
        explanation: "Money required to establish and launch the organization."
    },
    {
        id: "initial-operating",
        label: "Initial Operating Requirement",
        explanation: "Money required to support operations before revenue becomes sufficient."
    },
    {
        id: "offering-launch",
        label: "Offering Development / Launch",
        explanation: "Money required to develop, prepare or launch an Offering before it can generate sufficient revenue."
    },
    {
        id: "other",
        label: "Other",
        explanation: "A requirement outside the three above."
    }
] as const;

export type FundingNeedCategory = typeof FUNDING_NEED_CATEGORIES[number]["id"];

export const FUNDING_CATEGORIES = [
    { id: "internal", label: "Internal" },
    { id: "external", label: "External" },
    { id: "other", label: "Other" }
] as const;

export type FundingCategory = typeof FUNDING_CATEGORIES[number]["id"];

/**
 * What kind of money a funding type is -- what it OBLIGES. The
 * mix, the loan fields and the equity field all turn on this.
 */
export type FundingNature = "capital" | "non-repayable" | "equity" | "debt" | "other";

export const FUNDING_TYPES: readonly {
    id: string;
    label: string;
    category: FundingCategory;
    nature: FundingNature;
    /** The heading it is listed under, inside External. */
    family?: string;
}[] = [
    { id: "founder-capital", label: "Founder's Capital", category: "internal", nature: "capital" },
    { id: "reinvested-revenue", label: "Reinvested Revenue", category: "internal", nature: "capital" },
    { id: "existing-funds", label: "Existing Organizational Funds", category: "internal", nature: "capital" },

    { id: "grant", label: "Grant", category: "external", nature: "non-repayable", family: "Non-repayable" },
    { id: "subsidy", label: "Subsidy", category: "external", nature: "non-repayable", family: "Non-repayable" },
    { id: "award", label: "Award / Competition", category: "external", nature: "non-repayable", family: "Non-repayable" },
    { id: "other-non-repayable", label: "Other Non-repayable Funding", category: "external", nature: "non-repayable", family: "Non-repayable" },

    { id: "angel", label: "Angel Investment", category: "external", nature: "equity", family: "Equity" },
    { id: "venture", label: "Venture Investment", category: "external", nature: "equity", family: "Equity" },
    { id: "equity-investment", label: "Equity Investment", category: "external", nature: "equity", family: "Equity" },
    { id: "equity-crowdfunding", label: "Equity Crowdfunding", category: "external", nature: "equity", family: "Equity" },

    { id: "bank-loan", label: "Bank Loan", category: "external", nature: "debt", family: "Debt" },
    { id: "business-loan", label: "Business Loan", category: "external", nature: "debt", family: "Debt" },
    { id: "microloan", label: "Microloan", category: "external", nature: "debt", family: "Debt" },
    { id: "credit-facility", label: "Credit Facility", category: "external", nature: "debt", family: "Debt" },
    { id: "other-debt", label: "Other Debt", category: "external", nature: "debt", family: "Debt" },

    { id: "reward-crowdfunding", label: "Reward Crowdfunding", category: "other", nature: "other" },
    { id: "friends-family", label: "Friends & Family", category: "other", nature: "other" },
    { id: "in-kind", label: "In-kind Contribution", category: "other", nature: "other" },
    { id: "other", label: "Other", category: "other", nature: "other" }
];

export function fundingType(id: string) {
    return FUNDING_TYPES.find(type => type.id === id);
}

export const FUNDING_STATUSES = [
    { id: "planned", label: "Planned", explanation: "Identified, not yet pursued." },
    { id: "preparing", label: "Preparing", explanation: "An application or proposal is being prepared." },
    { id: "requested", label: "Requested / Applied", explanation: "Asked for; no answer yet." },
    { id: "approved", label: "Approved / Agreed", explanation: "Confirmed, but not all of it has arrived." },
    { id: "received", label: "Received / Available", explanation: "The money has arrived and can be used." },
    { id: "closed", label: "Completed / Closed", explanation: "Fully received; nothing more to come." }
] as const;

export type FundingStatus = typeof FUNDING_STATUSES[number]["id"];

/** Expected ≠ Confirmed ≠ Available. */
export function statusStanding(status: FundingStatus): "pending" | "confirmed" {
    return status === "approved" || status === "received" || status === "closed"
        ? "confirmed"
        : "pending";
}

export const FUNDING_SCHEDULES = [
    { id: "one-time", label: "One-time", explanation: "A single payment." },
    { id: "periodic", label: "Periodic", explanation: "A repeated amount at a set frequency." },
    { id: "milestone", label: "Milestone-based", explanation: "Released as defined milestones or conditions are reached." },
    { id: "other", label: "Other", explanation: "An arrangement that fits none of the above." }
] as const;

export type FundingScheduleKind = typeof FUNDING_SCHEDULES[number]["id"];

export const PERIOD_FREQUENCIES = [
    { id: "monthly", label: "Monthly", months: 1 },
    { id: "quarterly", label: "Quarterly", months: 3 },
    { id: "annually", label: "Annually", months: 12 }
] as const;

export type PeriodFrequency = typeof PERIOD_FREQUENCIES[number]["id"];

function periodMonths(frequency: PeriodFrequency): number {
    return PERIOD_FREQUENCIES.find(entry => entry.id === frequency)?.months ?? 1;
}

export const LOAN_METHODS = [
    {
        id: "annuity",
        label: "Equal payments",
        explanation: "The same payment every time; the interest part shrinks as the loan is repaid."
    },
    {
        id: "equal-principal",
        label: "Equal principal",
        explanation: "The same amount of principal every time, plus that period's interest, so payments fall over time."
    }
] as const;

export type LoanMethod = typeof LOAN_METHODS[number]["id"];

/* ==========================================================
   Page 4 -- what is stored
========================================================== */

/**
 * The part of a cost that belongs to this page: how it is
 * classified, and when a cost with a place in the calendar falls.
 *
 * A cost recorded ELSEWHERE keeps its name, amount and frequency
 * where it was recorded, and only this part is stored here, under
 * the id it has there.
 */
/**
 * What a one-time cost buys, for the forecast: an expense (""), EQUIPMENT
 * the business owns and uses up over time (depreciated), or a DEPOSIT it
 * gets back (an asset, never an expense).
 */
export type CostAsset = "equipment" | "deposit";

export const COST_ASSETS: { id: CostAsset | ""; label: string; explanation: string }[] = [
    { id: "", label: "Expense", explanation: "Used up when it is paid: a fee, a service, a campaign." },
    { id: "equipment", label: "Equipment", explanation: "Something the business owns and uses for years: counted as an asset and spread over three years in the profit and loss." },
    { id: "deposit", label: "Deposit", explanation: "Money paid and returned later, such as a rent deposit: an asset, never a cost." }
];

export interface CostClassification {
    /** For a one-time cost: whether it buys equipment or is a deposit. */
    asset: CostAsset | "";
    group: CostGroup | "";
    behaviour: CostBehaviour | "";
    /** A Page 1 Offering, for the Offering group. */
    offeringId: string;
    /**
     * When a one-time cost is paid, or when a quarterly or annual
     * one is FIRST paid. Unset: the plan's first month.
     */
    month: StrategyMonthValue;
    /** Semi-variable: the fixed part, per period of its frequency. */
    fixedPart: string;
    /** Semi-variable: the variable part, per unit of the Offering. */
    variablePerUnit: string;
    /**
     * A read cost recorded as "Other" where it came from: what it
     * really is, so a "per participant" can count as per unit.
     */
    frequency: CostFrequency | "";
}

/** A cost recorded on this page, because nowhere else records it. */
export interface OwnCostValue extends CostClassification {
    id: string;
    name: string;
    amount: string;
    frequency: CostFrequency | "";
    /** Named when the frequency is "Other". */
    frequencyOther: string;
    description: string;
}

export interface FundingNeedValue {
    id: string;
    name: string;
    category: FundingNeedCategory | "";
    /** One amount by one date, or several amounts over time. */
    timing: "one-time" | "scheduled";
    amount: string;
    month: StrategyMonthValue;
    schedule: { id: string; month: StrategyMonthValue; amount: string }[];
    /** Ids of the costs (consolidated) this need pays for. */
    costIds: string[];
    description: string;
}

export interface LoanTermsValue {
    /** Annual interest rate, percent, as typed. */
    rate: string;
    interestType: "fixed" | "variable" | "";
    /** When the loan is paid out. */
    start: StrategyMonthValue;
    /** When the first repayment falls. */
    repaymentStart: StrategyMonthValue;
    frequency: PeriodFrequency;
    /** Number of repayments. */
    payments: string;
    method: LoanMethod;
}

export interface FundingSourceValue {
    id: string;
    name: string;
    category: FundingCategory;
    /** One of FUNDING_TYPES' ids. */
    type: string;
    provider: string;
    /** The total expected or agreed; a loan's principal. */
    amount: string;
    status: FundingStatus | "";
    /** How much of it has arrived so far. */
    received: string;
    schedule: {
        kind: FundingScheduleKind;
        /** One-time: when. Other: when, if known. */
        month: StrategyMonthValue;
        /** Periodic. */
        periodAmount: string;
        frequency: PeriodFrequency;
        start: StrategyMonthValue;
        periods: string;
        /** Milestone-based. */
        milestones: { id: string; amount: string; month: StrategyMonthValue; condition: string }[];
        /** Other: how it is received. */
        note: string;
    };
    purpose: string;
    /** Ids of the Funding Needs this addresses. */
    needIds: string[];
    conditions: string;
    /** Equity: the share given in exchange, percent, as typed. */
    equity: string;
    loan: LoanTermsValue;
}

/**
 * A founder's capital as the Legal Entity records it. The amount is
 * answered there; only where it stands, and when it arrives, is
 * answered here.
 */
export interface FounderCapitalStanding {
    status: FundingStatus | "";
    month: StrategyMonthValue;
}

/**
 * Whether the amounts on both Financial pages include VAT (or the
 * local consumption tax). A registered business plans excluding it --
 * the tax it charges is not its revenue, and the tax it pays is
 * reclaimed -- while one that is not registered pays it as a cost.
 */
export const VAT_BASES = [
    { id: "excluding", label: "Excluding VAT", explanation: "Registered for VAT: amounts are net. VAT charged is not revenue, and VAT paid is reclaimed." },
    { id: "including", label: "Including VAT", explanation: "Amounts are gross, as paid and charged." },
    { id: "not-registered", label: "Not VAT registered", explanation: "No VAT is charged; VAT paid on purchases is part of their cost." }
] as const;

export type VatBasis = typeof VAT_BASES[number]["id"];

/**
 * The three bases in the words of the country's own tax: "Excluding
 * VAT" in the UK, "Not registered for Sales Tax" in the US. Sales tax
 * is not reclaimed on purchases the way VAT is, so it is explained
 * apart. `taxName` is the jurisdiction's name for it; anything after
 * " (" is dropped ("VAT (USt)" reads "VAT").
 */
export function vatBases(taxName = "VAT"): { id: VatBasis; label: string; explanation: string }[] {
    const tax = taxName.split(" (")[0].trim() || "VAT";
    const salesTax = /sales tax/i.test(tax);
    return [
        {
            id: "excluding",
            label: "Excluding " + tax,
            explanation: salesTax
                ? "Registered to collect " + tax + ": amounts exclude it. The tax collected is paid to the state and is not revenue."
                : "Registered for " + tax + ": amounts are net. " + tax + " charged is not revenue, and " + tax + " paid is reclaimed."
        },
        { id: "including", label: "Including " + tax, explanation: "Amounts are gross, as paid and charged." },
        {
            id: "not-registered",
            label: "Not registered for " + tax,
            explanation: "No " + tax + " is charged; " + tax + " paid on purchases is part of their cost."
        }
    ];
}

export interface FinancialFoundationValue {
    /** Month 1 of the plan. Unset until the founder picks it. */
    planStart: StrategyMonthValue;
    /** "1" to "5" years; "" until chosen (DEFAULT_PLAN_YEARS). */
    planYears: string;
    /** "" until chosen: follow the Legal Entity's VAT registration. */
    vatBasis: VatBasis | "";
    /** Classification of the costs recorded elsewhere, by their id. */
    classified: Record<string, Partial<CostClassification>>;
    costs: OwnCostValue[];
    needs: FundingNeedValue[];
    funding: FundingSourceValue[];
    /** By Legal Entity founder id. */
    founderCapital: Record<string, FounderCapitalStanding>;
}

const EMPTY_MONTH: StrategyMonthValue = { month: "", year: "" };

export function createOwnCost(group: CostGroup | "" = ""): OwnCostValue {
    return {
        id: financeId("cost"),
        name: "",
        amount: "",
        frequency: "",
        frequencyOther: "",
        description: "",
        group,
        behaviour: "",
        offeringId: "",
        month: { ...EMPTY_MONTH },
        fixedPart: "",
        variablePerUnit: "",
        asset: ""
    };
}

export function createFundingNeed(): FundingNeedValue {
    return {
        id: financeId("need"),
        name: "",
        category: "",
        timing: "one-time",
        amount: "",
        month: { ...EMPTY_MONTH },
        schedule: [],
        costIds: [],
        description: ""
    };
}

export function createScheduleEntry() {
    return { id: financeId("when"), month: { ...EMPTY_MONTH }, amount: "" };
}

export function createMilestone() {
    return { id: financeId("milestone"), amount: "", month: { ...EMPTY_MONTH }, condition: "" };
}

export function createFundingSource(category: FundingCategory): FundingSourceValue {
    return {
        id: financeId("funding"),
        name: "",
        category,
        type: "",
        provider: "",
        amount: "",
        status: "",
        received: "",
        schedule: {
            kind: "one-time",
            month: { ...EMPTY_MONTH },
            periodAmount: "",
            frequency: "monthly",
            start: { ...EMPTY_MONTH },
            periods: "",
            milestones: [],
            note: ""
        },
        purpose: "",
        needIds: [],
        conditions: "",
        equity: "",
        loan: {
            rate: "",
            interestType: "",
            start: { ...EMPTY_MONTH },
            repaymentStart: { ...EMPTY_MONTH },
            frequency: "monthly",
            payments: "",
            method: "annuity"
        }
    };
}

const GROUP_IDS = COST_GROUPS.map(entry => entry.id);
const BEHAVIOUR_IDS = COST_BEHAVIOURS.map(entry => entry.id);
const FREQUENCY_IDS = COST_FREQUENCIES.map(entry => entry.id);
const NEED_IDS = FUNDING_NEED_CATEGORIES.map(entry => entry.id);
const CATEGORY_IDS = FUNDING_CATEGORIES.map(entry => entry.id);
const STATUS_IDS = FUNDING_STATUSES.map(entry => entry.id);
const SCHEDULE_IDS = FUNDING_SCHEDULES.map(entry => entry.id);
const PERIOD_IDS = PERIOD_FREQUENCIES.map(entry => entry.id);
const METHOD_IDS = LOAN_METHODS.map(entry => entry.id);

function asClassification(value: unknown): Partial<CostClassification> {

    const source = asObject(value);
    const result: Partial<CostClassification> = {};

    if (GROUP_IDS.includes(source.group as CostGroup)) {
        result.group = source.group as CostGroup;
    }
    if (BEHAVIOUR_IDS.includes(source.behaviour as CostBehaviour)) {
        result.behaviour = source.behaviour as CostBehaviour;
    }
    if (typeof source.offeringId === "string") {
        result.offeringId = source.offeringId;
    }
    if (source.month !== undefined) {
        result.month = asMonth(source.month);
    }
    if (typeof source.fixedPart === "string") {
        result.fixedPart = source.fixedPart;
    }
    if (typeof source.variablePerUnit === "string") {
        result.variablePerUnit = source.variablePerUnit;
    }
    if (FREQUENCY_IDS.includes(source.frequency as CostFrequency)) {
        result.frequency = source.frequency as CostFrequency;
    }
    if (source.asset === "equipment" || source.asset === "deposit" || source.asset === "") {
        result.asset = source.asset;
    }

    return result;

}

export function asFinancialFoundationValue(value: unknown): FinancialFoundationValue {
    const parsed = parseFinancialFoundation(value);
    const categoryOf = (id: string) => NEED_IDS.includes(id as FundingNeedCategory)
        ? id
        : parsed.needs.find(need => need.id === id)?.category ?? "";
    return {
        ...parsed,
        funding: parsed.funding.map(source => ({
            ...source,
            needIds: [...new Set(source.needIds.map(categoryOf).filter(Boolean))]
        }))
    };
}

function parseFinancialFoundation(value: unknown): FinancialFoundationValue {

    const source = asObject(value);

    const classified: Record<string, Partial<CostClassification>> = {};
    Object.entries(asObject(source.classified)).forEach(([id, entry]) => {
        classified[id] = asClassification(entry);
    });

    const founderCapital: Record<string, FounderCapitalStanding> = {};
    Object.entries(asObject(source.founderCapital)).forEach(([id, entry]) => {
        const row = asObject(entry);
        founderCapital[id] = {
            status: oneOf(row.status, STATUS_IDS, "received"),
            month: asMonth(row.month)
        };
    });

    return {

        planStart: asMonth(source.planStart),

        planYears: PLAN_YEAR_CHOICES.map(String).includes(asText(source.planYears)) ? asText(source.planYears) : "",

        vatBasis: oneOf(source.vatBasis, ["excluding", "including", "not-registered", ""] as const, ""),

        classified,

        costs: asList(source.costs).map(entry => {
            const row = asObject(entry);
            return {
                id: asText(row.id) || financeId("cost"),
                name: asText(row.name),
                amount: asText(row.amount),
                frequency: FREQUENCY_IDS.includes(row.frequency as CostFrequency)
                    ? row.frequency as CostFrequency
                    : "",
                frequencyOther: asText(row.frequencyOther),
                description: asText(row.description),
                group: GROUP_IDS.includes(row.group as CostGroup) ? row.group as CostGroup : "",
                behaviour: BEHAVIOUR_IDS.includes(row.behaviour as CostBehaviour)
                    ? row.behaviour as CostBehaviour
                    : "",
                offeringId: asText(row.offeringId),
                month: asMonth(row.month),
                fixedPart: asText(row.fixedPart),
                variablePerUnit: asText(row.variablePerUnit),
                asset: row.asset === "equipment" || row.asset === "deposit" ? row.asset : ""
            };
        }),

        needs: asList(source.needs).map(entry => {
            const row = asObject(entry);
            return {
                id: asText(row.id) || financeId("need"),
                name: asText(row.name),
                category: NEED_IDS.includes(row.category as FundingNeedCategory)
                    ? row.category as FundingNeedCategory
                    : "",
                timing: row.timing === "scheduled" ? "scheduled" : "one-time",
                amount: asText(row.amount),
                month: asMonth(row.month),
                schedule: asList(row.schedule).map(item => {
                    const part = asObject(item);
                    return {
                        id: asText(part.id) || financeId("when"),
                        month: asMonth(part.month),
                        amount: asText(part.amount)
                    };
                }),
                costIds: asTextList(row.costIds),
                description: asText(row.description)
            };
        }),

        funding: asList(source.funding).map(entry => {

            const row = asObject(entry);
            const schedule = asObject(row.schedule);
            const loan = asObject(row.loan);

            return {
                id: asText(row.id) || financeId("funding"),
                name: asText(row.name),
                category: oneOf(row.category, CATEGORY_IDS, "external"),
                type: asText(row.type),
                provider: asText(row.provider),
                amount: asText(row.amount),
                status: STATUS_IDS.includes(row.status as FundingStatus)
                    ? row.status as FundingStatus
                    : "",
                received: asText(row.received),
                schedule: {
                    kind: oneOf(schedule.kind, SCHEDULE_IDS, "one-time"),
                    month: asMonth(schedule.month),
                    periodAmount: asText(schedule.periodAmount),
                    frequency: oneOf(schedule.frequency, PERIOD_IDS, "monthly"),
                    start: asMonth(schedule.start),
                    periods: asText(schedule.periods),
                    milestones: asList(schedule.milestones).map(item => {
                        const milestone = asObject(item);
                        return {
                            id: asText(milestone.id) || financeId("milestone"),
                            amount: asText(milestone.amount),
                            month: asMonth(milestone.month),
                            condition: asText(milestone.condition)
                        };
                    }),
                    note: asText(schedule.note)
                },
                purpose: asText(row.purpose),
                needIds: asTextList(row.needIds),
                conditions: asText(row.conditions),
                equity: asText(row.equity),
                loan: {
                    rate: asText(loan.rate),
                    interestType: loan.interestType === "fixed" || loan.interestType === "variable"
                        ? loan.interestType
                        : "",
                    start: asMonth(loan.start),
                    repaymentStart: asMonth(loan.repaymentStart),
                    frequency: oneOf(loan.frequency, PERIOD_IDS, "monthly"),
                    payments: asText(loan.payments),
                    method: oneOf(loan.method, METHOD_IDS, "annuity")
                }
            };

        }),

        founderCapital

    };

}

/* ==========================================================
   Page 4 -- costs, consolidated
========================================================== */

/** Where a cost was recorded, for its Source column and its link. */
export type CostOrigin =
    | "legal-entity"
    | "founders"
    | "infrastructure"
    | "offering-capability"
    | "own";

/**
 * One cost as the page shows and counts it: its own record, or one
 * read from where it was recorded, classified here.
 */
export interface CostLine {
    id: string;
    name: string;
    origin: CostOrigin;
    /** "Legal Entity → Expenses", "Infrastructure → Utilities → Internet". */
    sourceLabel: string;
    group: CostGroup;
    behaviour: CostBehaviour;
    /**
     * The Offerings it is a cost of: one, or several that share it (the
     * same yarn in two collections). Empty for a cost of the whole
     * organization. A per-unit cost is paid by each unit of any of
     * them; a fixed one is shared out between them.
     */
    offeringIds: string[];
    /** The first of them, where only one can be shown. */
    offeringId: string;
    /** The amount as recorded, and as a number (null if unreadable). */
    amountText: string;
    amount: number | null;
    /**
     * For a resource bought several at a time: how many, and the price
     * of one. The amount is then their total, so nobody multiplies.
     */
    quantity: number | null;
    unitAmount: number | null;
    currency: string;
    /** Whether it is in the organisation's currency, so counts. */
    counted: boolean;
    frequency: CostFrequency;
    frequencyOther: string;
    /** The frequency where the cost was recorded, before reclassifying. */
    sourceFrequency: CostFrequency;
    month: StrategyMonthValue;
    fixedPart: number | null;
    variablePerUnit: number | null;
    /** For a one-time cost: equipment or a deposit; "" for an expense. */
    asset: CostAsset | "";
    /** The page's own record, editable here; null for a read one. */
    own: OwnCostValue | null;
    /**
     * Where it was recorded, as a jump path (see jumpTo.ts): the card,
     * then what holds it. Empty for a cost added on this page.
     */
    sourcePath: string[];
}

/** Page 3's frequencies onto this page's. */
function fromCapabilityFrequency(frequency: string): CostFrequency {
    return frequency === "one-time" || frequency === "monthly" || frequency === "annually" ||
        frequency === "per-unit" || frequency === "per-order" || frequency === "per-project"
        ? frequency
        : frequency === "other" ? "other" : "monthly";
}

/** The Legal Entity's ("One time", "Monthly", "Annually"). */
function fromLegalFrequency(frequency: string): CostFrequency {
    return frequency === "One time" ? "one-time"
        : frequency === "Annually" ? "annually"
            : frequency === "Monthly" ? "monthly"
                : "other";
}

export interface CostSources {
    legalEntity: LegalEntityValue;
    capability: BusinessCapabilityValue;
    /** Resource group ids to their labels (Utilities, Workstation…). */
    resourceGroupLabels: Record<string, string>;
    /** Fixed subsection ids to their labels (Internet, Furniture…). */
    subsectionLabels: Record<string, string>;
    /** The organisation's currency; "" when not chosen yet. */
    currency: string;
    /**
     * Whether Page 3's founders are the Legal Entity's -- the only
     * founders whose salaries are real. See withLegalEntityFounders.
     */
    foundersLinked: boolean;
}

/**
 * Every cost the organisation has recorded, from wherever it was
 * recorded, with this page's classification laid over it.
 *
 * Read from:
 * - 1. Identity System → 3. Legal Entity → its Expenses;
 * - Page 3 → Infrastructure → 1. Founders' salaries, the Workspace,
 *   every resource marked "Costs", and both kinds of partner;
 * - Page 3 → Offering's Capability → the same, per Offering;
 * - and this page's own + Add Cost.
 *
 * A read cost starts classified by where it came from -- an
 * Offering's cost in the Offering group, a one-time cost as
 * Establishment, anything else as Operating, and Fixed -- and any of
 * that the founder changes here is kept against its id.
 */
export function consolidateCosts(
    value: FinancialFoundationValue,
    sources: CostSources
): CostLine[] {

    const lines: CostLine[] = [];

    const read = (
        id: string,
        name: string,
        origin: CostOrigin,
        sourceLabel: string,
        amountText: string,
        currency: string,
        frequency: CostFrequency,
        frequencyOther: string,
        defaultGroup: CostGroup,
        offeringIds: string[],
        quantity: number | null = null,
        /** When the source already says when it was paid. */
        knownMonth: StrategyMonthValue | null = null,
        sourcePath: string[] = []
    ) => {

        const unitAmount = notNegative(parseAmount(amountText));
        const total = quantity !== null && unitAmount !== null
            ? Math.round(unitAmount * quantity * 100) / 100
            : unitAmount;

        const override = value.classified[id] ?? {};

        // Only a cost recorded as "Other" can be reclassified: any
        // other frequency is the source's to change.
        const effectiveFrequency: CostFrequency = frequency === "other" && override.frequency
            ? override.frequency
            : frequency;

        const effectiveCurrency = currency || sources.currency;

        /*
            AN OFFERING'S COST IS ONE RECORDED FOR IT, on Page 3's
            Offering's Capability, and only that: it stays in the
            Offering group, linked to the Offering Page 3 links it to.
            Any other cost can move between Establishment, Operating
            and Other, and is never an Offering's, so never variable.
        */
        const forOffering = defaultGroup === "offering";

        const chosenGroup = override.group && override.group !== "offering" ? override.group : "";

        const group: CostGroup = forOffering
            ? "offering"
            : chosenGroup || (frequency === "one-time" ? "establishment" : defaultGroup);

        lines.push({
            id,
            name: name.trim() || "Unnamed cost",
            origin,
            sourceLabel,
            group,
            // A cost of activity is variable until said otherwise.
            behaviour: !forOffering
                ? "fixed"
                : override.behaviour ||
                    (effectiveFrequency === "per-unit" || effectiveFrequency === "per-project" ? "variable" : "fixed"),
            offeringIds: forOffering ? offeringIds : [],
            offeringId: forOffering ? offeringIds[0] ?? "" : "",
            amountText: quantity !== null && total !== null ? numberAsText(total) : amountText,
            amount: total,
            quantity: quantity !== null && unitAmount !== null ? quantity : null,
            unitAmount: quantity !== null ? unitAmount : null,
            currency: effectiveCurrency,
            counted: !sources.currency || effectiveCurrency === sources.currency,
            frequency: effectiveFrequency,
            frequencyOther,
            sourceFrequency: frequency,
            month: override.month ?? (knownMonth ? { ...knownMonth } : { ...EMPTY_MONTH }),
            fixedPart: notNegative(parseAmount(override.fixedPart ?? "")),
            variablePerUnit: notNegative(parseAmount(override.variablePerUnit ?? "")),
            asset: override.asset ?? "",
            own: null,
            sourcePath
        });

    };

    const fromCost = (
        id: string,
        name: string,
        origin: CostOrigin,
        sourceLabel: string,
        cost: BusinessCostValue,
        defaultGroup: CostGroup,
        offeringIds: string[],
        quantity = "",
        sourcePath: string[] = []
    ) => {
        if (parseAmount(cost.price) === null) {
            return;
        }
        read(
            id, name, origin, sourceLabel, cost.price, cost.currency,
            fromCapabilityFrequency(cost.frequency), cost.frequencyOther,
            defaultGroup, offeringIds, resourceUnitCount(quantity, cost.frequency),
            null, sourcePath
        );
    };

    /* 1. Identity System → Legal Entity. Its one-time fees are paid
       when the organization is formed: before the plan, if it was. */
    const formed = /^(\d{4})-(\d{2})/.exec(sources.legalEntity.formation.date);
    const formationMonth: StrategyMonthValue | null = formed ? { month: formed[2], year: formed[1] } : null;
    sources.legalEntity.expenses.forEach(expense => {
        if (parseAmount(expense.cost) === null) {
            return;
        }
        read(
            "legal-" + expense.id,
            expense.name,
            "legal-entity",
            "Legal Entity → Expenses",
            expense.cost,
            "",
            fromLegalFrequency(expense.frequency),
            "",
            expense.frequency === "One time" ? "establishment" : "operating",
            [],
            null,
            expense.frequency === "One time" ? formationMonth : null,
            ["legal-expense-" + expense.id, "legal-section-5"]
        );
    });

    const capability = sources.capability;

    /* Founders' salaries -- per month, as Page 3 asks for them. */
    if (sources.foundersLinked) {
        capability.founders.forEach(founder => {
            if (parseAmount(founder.salary) === null) {
                return;
            }
            read(
                "salary-" + founder.id,
                "Salary: " + (founder.name.trim() || "Unnamed founder"),
                "founders",
                "Infrastructure → Founders",
                founder.salary,
                "",
                "monthly",
                "",
                "operating",
                [],
                null,
                null,
                ["founder-" + founder.id, "resource-group-founders", "contains-founders", "section-infrastructure-resources", "capability-infrastructure"]
            );
        });
    }

    /* The Workspace, when it costs money. */
    if (capability.workspace.status === "costs") {
        fromCost(
            "workspace", "Workspace", "infrastructure",
            "Infrastructure → Workspace",
            capability.workspace.cost, "operating", [], "",
            ["resource-group-workspace", "contains-workspace", "section-infrastructure-resources", "capability-infrastructure"]
        );
    }

    /* Every resource marked "Costs". */
    Object.entries(capability.resources).forEach(([groupId, subsections]) => {
        subsections.forEach(subsection => {

            const subsectionName = sources.subsectionLabels[subsection.id] ||
                subsection.name.trim() || "Other";

            subsection.slots.forEach(slot => {
                if (slot.status !== "costs") {
                    return;
                }
                fromCost(
                    slot.id,
                    slot.name,
                    "infrastructure",
                    "Infrastructure → " +
                        (sources.resourceGroupLabels[groupId] ?? groupId) +
                        " → " + subsectionName,
                    slot.cost, "operating", [], slot.quantity,
                    [slot.id, "subsection-" + groupId + "-" + subsection.id, "resource-group-" + groupId,
                        "contains-" + groupId, "section-infrastructure-resources", "capability-infrastructure"]
                );
            });

        });
    });

    /* Partnerships & Providers. */
    ([["professionals", "External Professionals & Partners"], ["providers", "Providers"]] as const)
        .forEach(([kind, label]) => {
            capability[kind].forEach(partner => fromCost(
                partner.id, partner.name, "infrastructure",
                "Infrastructure → " + label,
                partner.cost, "operating", [], "",
                [partner.id, "partners-infrastructure-" + kind, "section-infrastructure-partners", "capability-infrastructure"]
            ));
        });

    /* Offering's Capability: an Offering's own costs. */
    capability.offering.resources.forEach(slot => {
        if (slot.status !== "costs") {
            return;
        }
        fromCost(
            slot.id, slot.name, "offering-capability",
            "Offering's Capability → Resources",
            slot.cost, "offering", slot.offeringIds, slot.quantity,
            [slot.id, "section-offering-resources", "capability-offering-capability"]
        );
    });

    ([["professionals", "External Professionals & Partners"], ["providers", "Providers"]] as const)
        .forEach(([kind, label]) => {
            capability.offering[kind].forEach(partner => fromCost(
                partner.id, partner.name, "offering-capability",
                "Offering's Capability → " + label,
                partner.cost, "offering", partner.offeringIds, "",
                [partner.id, "partners-offering-" + kind, "section-offering-partners", "capability-offering-capability"]
            ));
        });

    /* And this page's own. */
    value.costs.forEach(cost => {
        lines.push({
            id: cost.id,
            name: cost.name.trim() || "Unnamed cost",
            origin: "own",
            sourceLabel: "Financial Foundation",
            group: cost.group || "other",
            behaviour: cost.behaviour || "fixed",
            offeringIds: cost.offeringId ? [cost.offeringId] : [],
            offeringId: cost.offeringId,
            amountText: cost.amount,
            amount: notNegative(parseAmount(cost.amount)),
            quantity: null,
            unitAmount: null,
            sourcePath: [],
            currency: sources.currency,
            counted: true,
            frequency: cost.frequency || "one-time",
            sourceFrequency: cost.frequency || "one-time",
            frequencyOther: cost.frequencyOther,
            month: cost.month,
            fixedPart: notNegative(parseAmount(cost.fixedPart)),
            variablePerUnit: notNegative(parseAmount(cost.variablePerUnit)),
            asset: cost.asset,
            own: cost
        });
    });

    return lines;

}

/**
 * A one-time cost paid before the plan starts: already paid, from
 * money that is no longer in the balance the plan starts with, so it
 * is shown but counted nowhere.
 */
export function paidBeforePlan(line: CostLine, start: StrategyMonthValue): boolean {
    const paid = monthOrdinal(line.month);
    const first = monthOrdinal(start);
    return line.frequency === "one-time" && paid !== null && first !== null && paid < first;
}

/**
 * One-time costs paid before the plan starts: already spent, out of the
 * money the organization had, so not in the plan's opening balance.
 */
export function spentBeforePlan(lines: CostLine[], start: StrategyMonthValue): number {
    return lines
        .filter(line => line.counted && line.amount !== null && paidBeforePlan(line, start))
        .reduce((sum, line) => sum + scheduledAmount(line), 0);
}

/**
 * What a cost pays each time it falls due. A semi-variable cost that
 * has been separated pays only its FIXED part on the calendar: its
 * variable part is paid with each unit sold, and counted there (with
 * the costs of sales), so counting the whole amount here too would
 * count the variable part twice.
 */
export function scheduledAmount(line: CostLine): number {
    const separated = line.behaviour === "semi-variable" &&
        (line.fixedPart !== null || line.variablePerUnit !== null);
    return separated ? line.fixedPart ?? 0 : line.amount ?? 0;
}

/** Whether a cost has a place in the calendar this page can model. */
export function isScheduled(line: CostLine): boolean {
    return SCHEDULED_FREQUENCIES.includes(line.frequency);
}

/** Whether a cost is paid per unit of activity. */
export function isPerUnit(line: CostLine): boolean {
    return PER_UNIT_FREQUENCIES.includes(line.frequency);
}

/**
 * A cost's outflow in each month of the plan, index 0 = Month 1.
 * Zero throughout for a cost that is not counted or not scheduled.
 */
export function costSchedule(line: CostLine, start: StrategyMonthValue): number[] {

    const months = new Array<number>(MODEL_MONTHS).fill(0);

    if (!line.counted || line.amount === null || !isScheduled(line) || paidBeforePlan(line, start)) {
        return months;
    }

    let first = (planMonth(start, line.month) ?? 1) - 1;

    // First paid before the plan: the plan picks up its cycle where it
    // falls (an annual cost paid in September falls in September).
    const paidOrdinal = monthOrdinal(line.month);
    const startOrdinal = monthOrdinal(start);
    if (paidOrdinal !== null && startOrdinal !== null && paidOrdinal < startOrdinal) {
        const step = line.frequency === "quarterly" ? 3 : line.frequency === "annually" ? 12 : 1;
        first = ((paidOrdinal - startOrdinal) % step + step) % step;
    }

    const paid = scheduledAmount(line);

    const every = (step: number) => {
        for (let index = first; index < MODEL_MONTHS; index += step) {
            months[index] += paid;
        }
    };

    switch (line.frequency) {
        case "one-time":
            if (first < MODEL_MONTHS) {
                months[first] += paid;
            }
            break;
        case "monthly":
            // A monthly cost runs from the plan's start unless a
            // first month is given.
            every(1);
            break;
        case "quarterly":
            every(3);
            break;
        case "annually":
            every(12);
            break;
    }

    return months;

}

/** A recurring cost's monthly equivalent; 0 for anything else. */
export function monthlyEquivalent(amount: number, frequency: CostFrequency): number {
    switch (frequency) {
        case "monthly": return amount;
        case "quarterly": return amount / 3;
        case "annually": return amount / 12;
        default: return 0;
    }
}

/* ==========================================================
   Page 4 -- funding
========================================================== */

/** Total of a Funding Need: its amount, or its schedule added up. */
export function fundingNeedTotal(need: FundingNeedValue): number {
    return need.timing === "scheduled"
        ? need.schedule.reduce((sum, part) => sum + (parseAmount(part.amount) ?? 0), 0)
        : parseAmount(need.amount) ?? 0;
}

/** One loan repayment. */
export interface LoanPayment {
    /** Plan month, 1-based; may run past the plan's end. */
    month: number;
    payment: number;
    principal: number;
    interest: number;
    remaining: number;
}

export interface LoanSchedule {
    payments: LoanPayment[];
    totalInterest: number;
    /** The first payment that repays principal. */
    firstRepayment?: LoanPayment;
    /** The regular payment (the first one, for equal principal). */
    firstPayment: number;
}

/**
 * A loan's repayments, from its terms -- or null while the terms
 * are not complete enough to calculate them (principal, number of
 * payments and first repayment month are needed; a missing rate
 * means interest-free).
 */
export function loanSchedule(
    source: FundingSourceValue,
    start: StrategyMonthValue
): LoanSchedule | null {

    const principal = parseAmount(source.amount);
    const count = Math.min(MAX_PERIODS, Math.floor(parseDecimal(source.loan.payments) ?? 0));
    const firstMonth = planMonth(start, source.loan.repaymentStart);

    if (principal === null || principal <= 0 || count <= 0 || firstMonth === null) {
        return null;
    }

    const step = periodMonths(source.loan.frequency);
    // A negative rate charges nothing, never less than nothing.
    const annualRate = Math.min(100, Math.max(0, parsePercent(source.loan.rate) ?? 0)) / 100;
    const rate = annualRate * step / 12;

    const payments: LoanPayment[] = [];
    let remaining = principal;
    let totalInterest = 0;

    /*
        INTEREST FROM THE MONTH IT IS DRAWN. Between drawing the loan
        and the first repayment period, interest is paid monthly on
        the whole amount (interest only), as small-business loans with
        a deferred first repayment usually are. The first repayment
        then carries interest for the months since, no more than one
        period's. A loan with no drawdown month is taken as drawn one
        period before its first repayment.
    */
    const monthlyRate = annualRate / 12;
    const drawn = planMonth(start, source.loan.start);
    const drawMonth = drawn !== null && drawn < firstMonth ? drawn : firstMonth - step;
    for (let month = drawMonth + 1; month <= firstMonth - step; month++) {
        const interest = principal * monthlyRate;
        totalInterest += interest;
        payments.push({ month, payment: interest, principal: 0, interest, remaining: principal });
    }
    const firstPeriodMonths = Math.min(step, firstMonth - drawMonth);

    const annuity = rate > 0
        ? principal * rate / (1 - Math.pow(1 + rate, -count))
        : principal / count;

    for (let index = 0; index < count; index++) {

        const interest = index === 0
            ? remaining * monthlyRate * firstPeriodMonths
            : remaining * rate;

        const principalPart = source.loan.method === "equal-principal"
            ? principal / count
            : annuity - interest;

        // The last payment clears whatever rounding has left.
        const paid = index === count - 1 ? remaining : Math.min(principalPart, remaining);

        remaining = Math.max(0, remaining - paid);
        totalInterest += interest;

        payments.push({
            month: firstMonth + index * step,
            payment: paid + interest,
            principal: paid,
            interest,
            remaining
        });

    }

    // The first repayment, not an interest-only month before it.
    const firstRepayment = payments.find(payment => payment.principal > 0) ?? payments[0];
    return { payments, totalInterest, firstPayment: firstRepayment?.payment ?? 0, firstRepayment };

}

/**
 * When a funding source's money arrives, as { plan month, amount }
 * -- the WHOLE amount, whatever has already been received.
 */
function fundingArrivals(
    source: FundingSourceValue,
    start: StrategyMonthValue
): { month: number; amount: number }[] {

    const total = parseAmount(source.amount) ?? 0;
    const nature = fundingType(source.type)?.nature;

    if (nature === "debt") {
        return [{ month: planMonth(start, source.loan.start) ?? 1, amount: total }];
    }

    const schedule = source.schedule;

    switch (schedule.kind) {

        case "periodic": {
            const first = planMonth(start, schedule.start) ?? 1;
            const step = periodMonths(schedule.frequency);
            const periods = Math.min(MAX_PERIODS, Math.floor(parseDecimal(schedule.periods) ?? 0));
            const each = notNegative(parseAmount(schedule.periodAmount)) ??
                (periods > 0 ? total / periods : 0);
            const count = Math.min(MAX_PERIODS, periods > 0 ? periods : (each > 0 ? Math.ceil(total / each) : 0));
            // What arrives stops at the agreed total: the last period
            // is trimmed, and any after it bring nothing.
            let left = total > 0 ? total : each * count;
            return Array.from({ length: count }, (_, index) => {
                const amount = Math.max(0, Math.min(each, left));
                left -= amount;
                return { month: first + index * step, amount };
            }).filter(arrival => arrival.amount > 0);
        }

        case "milestone":
            return schedule.milestones.map(milestone => ({
                month: planMonth(start, milestone.month) ?? 1,
                amount: Math.max(0, parseAmount(milestone.amount) ?? 0)
            }));

        default:
            return [{ month: planMonth(start, schedule.month) ?? 1, amount: total }];

    }

}

/** How much of a source has arrived, is confirmed to come, or is hoped for. */
export interface FundingStanding {
    total: number;
    received: number;
    confirmedFuture: number;
    pending: number;
    /** Future arrivals, by plan month, of what is not yet received. */
    future: { month: number; amount: number }[];
}

export function fundingStanding(
    source: FundingSourceValue,
    start: StrategyMonthValue
): FundingStanding {

    const total = Math.max(0, parseAmount(source.amount) ?? 0);
    const status = source.status || "planned";

    // Received / Available and Completed / Closed mean it has come,
    // unless a smaller amount received says only part of it has.
    const typedReceived = parseAmount(source.received);
    const received = Math.min(total, Math.max(0,
        typedReceived ?? (status === "received" || status === "closed" ? total : 0)
    ));

    // What is still to come, in the order the schedule brings it:
    // what has been received is taken from the earliest arrivals.
    let alreadyIn = received;
    const future: { month: number; amount: number }[] = [];

    fundingArrivals(source, start)
        .sort((a, b) => a.month - b.month)
        .forEach(arrival => {
            const covered = Math.min(alreadyIn, arrival.amount);
            alreadyIn -= covered;
            if (arrival.amount - covered > 0) {
                future.push({ month: arrival.month, amount: arrival.amount - covered });
            }
        });

    // A schedule adding up to less than the total leaves the rest
    // with no date: it is placed at the end of the schedule.
    const scheduled = future.reduce((sum, entry) => sum + entry.amount, 0);
    const outstanding = total - received;
    if (outstanding - scheduled > 0.005) {
        // At the most arrivals a schedule can have, the rest comes
        // with the last of them rather than as one more.
        if (future.length >= MAX_PERIODS) {
            future[future.length - 1].amount += outstanding - scheduled;
        } else {
            future.push({
                month: future.length > 0 ? future[future.length - 1].month : 1,
                amount: outstanding - scheduled
            });
        }
    }

    const remaining = total - received;

    return statusStanding(status) === "confirmed"
        ? { total, received, confirmedFuture: remaining, pending: 0, future }
        : { total, received, confirmedFuture: 0, pending: remaining, future };

}

/** A founder's capital, from the Legal Entity, as a funding source. */
export function founderCapitalSources(
    _value: FinancialFoundationValue,
    legalEntity: LegalEntityValue
): FundingSourceValue[] {

    if (!legalEntity.capitalApplies) {
        return [];
    }

    return legalEntity.founders
        .filter(founder => (parseAmount(founder.capital) ?? 0) > 0)
        /*
            What a founder puts in is in hand when the plan starts:
            the page asks nothing more about it than the Legal Entity
            already has, the founder and the amount.
        */
        .map(founder => {
            return {
                ...createFundingSource("internal"),
                id: "capital-" + founder.id,
                name: "Founder's Capital: " + (founder.name.trim() || "Unnamed founder"),
                type: "founder-capital",
                provider: founder.name,
                amount: founder.capital,
                status: "received",
                schedule: createFundingSource("internal").schedule
            };
        });

}

/* ==========================================================
   Page 4 -- the financial position
========================================================== */

export interface CashMonth {
    /** 1-based. */
    month: number;
    label: string;
    inflow: number;
    outflow: number;
    /** Of the outflow, what repays loans (principal and interest). */
    loanRepayment: number;
    /** Balance at the end of the month. */
    balance: number;
}

export interface Obligation {
    month: number;
    label: string;
    what: string;
    amount: number;
    direction: "in" | "out";
}

export interface Signal {
    tone: "risk" | "caution" | "good" | "info";
    title: string;
    text: string;
}

export interface FinancialPosition {
    currency: string;
    need: number;
    availableNow: number;
    confirmedFuture: number;
    pending: number;
    /** The need less money in hand and confirmed money arriving within the plan. */
    gap: number;
    /**
     * With the funding being sought (pending sources) counted as if it
     * arrived as planned, repayments included: what is still short, and
     * when. Null when nothing is pending.
     */
    sought: { amount: number; shortfall: number; lowestLabel: string } | null;
    /** Months the balance stays at or above zero; null if it never falls within the plan. */
    runwayMonths: number | null;
    /** Whether anything is scheduled to leave at all -- without it, runway means nothing. */
    hasOutflows: boolean;
    timeline: CashMonth[];
    /** By funding nature, confirmed and pending. */
    mix: { nature: FundingNature; label: string; confirmed: number; pending: number }[];
    /** The Funding Need, calculated, by category. */
    needs: CalculatedNeed[];
    /** Per Funding Need, how much linked funding covers it. */
    coverage: { id: string; name: string; need: number; linked: number }[];
    obligations: Obligation[];
    signals: Signal[];
    loans: { source: FundingSourceValue; schedule: LoanSchedule }[];
    /** Costs in the list but left out of the timeline, and why. */
    uncounted: { currency: CostLine[]; unscheduled: CostLine[]; unreadable: CostLine[] };
    /** In-kind contributions: worth this, and not cash. */
    nonCash: number;
    /** Costs that look like the same thing recorded in two places. */
    duplicates: [CostLine, CostLine][];
}

/** Words too common to say two costs are the same thing. */
const COMMON_WORDS = new Set([
    "salary", "cost", "costs", "fees", "service", "services", "annual", "monthly",
    "studio", "office", "other", "general", "the", "and", "for", "with"
]);

function leadingWord(name: string): string {
    return name.toLowerCase().split(/[^a-z]+/).find(word => word.length >= 4 && !COMMON_WORDS.has(word)) ?? "";
}

/**
 * Pairs of costs that are probably ONE cost recorded twice: the same
 * leading word -- "Accountant (annual accounts)" on the Legal Entity
 * and "Accountant" under Partnerships -- in two different places,
 * both priced. Said, not decided: two genuinely different costs can
 * share a word, and only the founder knows.
 */
export function possibleDuplicates(lines: CostLine[]): [CostLine, CostLine][] {
    const priced = lines.filter(line => line.counted && line.amount !== null && line.amount > 0);
    const pairs: [CostLine, CostLine][] = [];
    priced.forEach((line, index) => {
        const word = leadingWord(line.name);
        if (!word) {
            return;
        }
        priced.slice(index + 1).forEach(other => {
            if (other.sourceLabel !== line.sourceLabel && leadingWord(other.name) === word) {
                pairs.push([line, other]);
            }
        });
    });
    return pairs;
}

const NATURE_LABELS: Record<FundingNature, string> = {
    "capital": "Founder's & Own Capital",
    "non-repayable": "Grants & Non-repayable",
    "equity": "Investment (Equity)",
    "debt": "Loans (Debt)",
    "other": "Other"
};

/**
 * The cash the plan starts with and every month after it: what has
 * arrived (less what was spent before the plan), plus confirmed money
 * as it is scheduled to arrive, less every scheduled cost and loan
 * repayment. Pending funding is NOT counted: planned money is not
 * money.
 *
 * `extra` lets Page 5 lay revenue (in) and variable costs (out) over
 * the same months.
 */
export function cashTimeline(
    value: FinancialFoundationValue,
    lines: CostLine[],
    funding: FundingSourceValue[],
    extra?: { inflow: number[]; outflow: number[] }
): { timeline: CashMonth[]; opening: number } {

    const start = value.planStart;

    const inflow = new Array<number>(MODEL_MONTHS).fill(0);
    const outflow = new Array<number>(MODEL_MONTHS).fill(0);
    const loanOut = new Array<number>(MODEL_MONTHS).fill(0);

    let opening = 0;

    funding.forEach(source => {

        if (isNonCash(source)) {
            return;
        }

        const standing = fundingStanding(source, start);

        opening += standing.received;

        if (standing.confirmedFuture > 0) {
            standing.future.forEach(arrival => {
                if (arrival.month <= MODEL_MONTHS) {
                    inflow[arrival.month - 1] += arrival.amount;
                }
            });
        }

        // A loan's repayments are owed once it is confirmed.
        if (fundingType(source.type)?.nature === "debt" &&
            statusStanding(source.status || "planned") === "confirmed") {
            loanSchedule(source, start)?.payments.forEach(payment => {
                if (payment.month <= MODEL_MONTHS) {
                    outflow[payment.month - 1] += payment.payment;
                    loanOut[payment.month - 1] += payment.payment;
                }
            });
        }

    });

    lines.forEach(line => {
        costSchedule(line, start).forEach((amount, index) => {
            outflow[index] += amount;
        });
    });

    if (extra) {
        extra.inflow.forEach((amount, index) => { inflow[index] += amount; });
        extra.outflow.forEach((amount, index) => { outflow[index] += amount; });
    }

    // What was paid before the plan came out of that money.
    opening -= spentBeforePlan(lines, start);

    let balance = opening;

    // Calculated over the whole model, shown over the plan.
    const timeline = inflow.slice(0, planLength(value)).map((incoming, index) => {
        balance += incoming - outflow[index];
        return {
            month: index + 1,
            label: planMonthLabel(start, index + 1),
            inflow: incoming,
            outflow: outflow[index],
            loanRepayment: loanOut[index],
            balance
        };
    });

    return { timeline, opening };

}

/**
 * An in-kind contribution -- a donated loom, free use of a space -- is
 * worth something but is not money: it never pays a bill, so it is
 * recorded and shown, and left out of every cash figure.
 */
export function isNonCash(source: FundingSourceValue): boolean {
    return source.type === "in-kind";
}

/** Months until the balance first falls below zero; null if it never does. */
export function runwayOf(timeline: CashMonth[]): number | null {
    const index = timeline.findIndex(month => month.balance < -0.005);
    return index < 0 ? null : index;
}

/** The VAT basis in force: as chosen, or as the Legal Entity implies. */
export function effectiveVatBasis(value: FinancialFoundationValue, legalEntity: LegalEntityValue): VatBasis {
    return value.vatBasis || (legalEntity.tax.consumptionTaxStatus === "yes" ? "excluding" : "not-registered");
}

/**
 * One Funding Need, calculated: never typed. Its id is its category's,
 * so a funding source can say which need it is for.
 */
export interface CalculatedNeed {
    id: FundingNeedCategory;
    label: string;
    amount: number;
    /** What makes up the amount, for the founder to check it by. */
    parts: { name: string; amount: number; when: string }[];
    /** When the money is needed: a month, or a span of months. */
    when: string;
    note: string;
    /** The Initial Operating Requirement's first year, month by month. */
    months?: OperatingMonth[];
}

export interface OperatingMonth {
    label: string;
    /** Running costs: every recurring cost paid this month. */
    costs: number;
    /** The costs of what is sold this month. */
    variable: number;
    loans: number;
    /** Revenue received this month. */
    revenue: number;
    net: number;
    /** The running total from the plan's start. */
    cumulative: number;
    /** New money needed this month: how much deeper the total falls. */
    needed: number;
}

const NEED_BY_GROUP: Record<CostGroup, FundingNeedCategory> = {
    establishment: "establishment",
    operating: "establishment",
    offering: "offering-launch",
    other: "other"
};

/**
 * THE FUNDING NEED, FROM WHAT IS ALREADY RECORDED.
 *
 * - Establishment, Offering Development / Launch and Other: every
 *   one-time cost in the matching cost group, when it is paid.
 * - Initial Operating Requirement: the money needed to keep going
 *   until revenue covers the running costs. Month by month, every
 *   recurring cost, the variable costs of what is sold, and the
 *   repayments of confirmed loans, less the revenue received (from
 *   Financial Sustainability); the need is the deepest the running
 *   total falls over the whole plan (its first year shown month by
 *   month). With no revenue recorded, it is every running cost over
 *   the plan, and says so.
 */
export function fundingNeeds(
    value: FinancialFoundationValue,
    lines: CostLine[],
    legalEntity: LegalEntityValue,
    revenuePage?: FinancialSustainabilityValue,
    format: (amount: number) => string = moneyFormatter("")
): CalculatedNeed[] {

    const start = value.planStart;
    const length = planLength(value);
    const funding = allFunding(value, legalEntity);

    const oneTime: Record<FundingNeedCategory, CalculatedNeed["parts"]> = {
        "establishment": [], "initial-operating": [], "offering-launch": [], "other": []
    };
    const firstMonth: Record<string, number> = {};
    const lastMonth: Record<string, number> = {};

    const outflow = new Array<number>(MODEL_MONTHS).fill(0);

    lines.forEach(line => {
        if (!line.counted || line.amount === null || !isScheduled(line)) {
            return;
        }
        const schedule = costSchedule(line, start);
        if (line.frequency === "one-time") {
            const category = NEED_BY_GROUP[line.group];
            const index = schedule.findIndex(amount => amount > 0);
            if (index < 0 || index >= length) {
                return;
            }
            oneTime[category].push({ name: line.name, amount: schedule[index], when: planMonthLabel(start, index + 1) });
            firstMonth[category] = Math.min(firstMonth[category] ?? index, index);
            lastMonth[category] = Math.max(lastMonth[category] ?? index, index);
            return;
        }
        schedule.forEach((amount, index) => { outflow[index] += amount; });
    });

    /* Running costs: loans, and what selling costs and brings in. */
    const loanOut = new Array<number>(MODEL_MONTHS).fill(0);
    funding.forEach(source => {
        if (fundingType(source.type)?.nature === "debt" &&
            statusStanding(source.status || "planned") === "confirmed") {
            loanSchedule(source, start)?.payments.forEach(payment => {
                if (payment.month <= MODEL_MONTHS) {
                    loanOut[payment.month - 1] += payment.payment;
                }
            });
        }
    });

    const streams = revenuePage?.streams ?? [];
    const { inflow: received, outflow: variableOut } = revenueFlows(value, lines, funding, revenuePage);

    /*
        THE FIRST YEAR, MONTH BY MONTH: what goes out to keep running,
        what comes in from sales, and the running total. The money
        needed in a month is how much deeper that total falls than it
        has been before; the requirement is their sum, the deepest the
        total falls in the year.
    */
    const yearLength = Math.min(12, length);
    const operatingMonths: OperatingMonth[] = [];
    let running = 0;
    let lowest = 0;
    let lastNeeded = -1;
    for (let index = 0; index < yearLength; index++) {
        const costs = outflow[index];
        const variable = variableOut[index];
        const loans = loanOut[index];
        const revenue = received[index];
        const net = revenue - costs - variable - loans;
        running += net;
        const needed = Math.max(0, lowest - running);
        if (needed > 0.005) {
            lastNeeded = index;
        }
        lowest = Math.min(lowest, running);
        operatingMonths.push({
            label: planMonthLabel(start, index + 1),
            costs, variable, loans, revenue, net,
            cumulative: running,
            needed
        });
    }

    /* After the first year: does the total keep falling? The need
       covers the whole plan, so a deeper point later is counted. */
    let later = running;
    let laterLowest = lowest;
    let laterIndex = -1;
    for (let index = yearLength; index < length; index++) {
        later += received[index] - outflow[index] - variableOut[index] - loanOut[index];
        if (later < laterLowest - 0.005) {
            laterLowest = later;
            laterIndex = index;
        }
    }
    const firstYearLowest = lowest;
    lowest = laterLowest;

    const span = (from: number, to: number) => from === to
        ? planMonthLabel(start, from + 1)
        : planMonthLabel(start, from + 1) + " – " + planMonthLabel(start, to + 1);

    const operatingNote = lastNeeded < 0
        ? "Revenue covers the running costs from the start."
        : (streams.length === 0
            ? "No expected revenue is recorded on Financial Sustainability yet, so every running cost is counted. "
            : "") +
            (laterIndex >= 0
                ? "After the first year the running total falls a further " + format(firstYearLowest - laterLowest) +
                    ", to its lowest in " + planMonthLabel(start, laterIndex + 1) + ": that is counted in this need."
                : "");

    return FUNDING_NEED_CATEGORIES.map(category => {

        if (category.id === "initial-operating") {
            return {
                id: category.id,
                label: category.label,
                amount: -lowest,
                parts: [],
                months: operatingMonths,
                when: lastNeeded < 0 && laterIndex < 0 ? "" : span(0, Math.max(lastNeeded, laterIndex)),
                note: operatingNote.trim()
            };
        }

        const parts = oneTime[category.id];
        return {
            id: category.id,
            label: category.label,
            amount: parts.reduce((sum, part) => sum + part.amount, 0),
            parts,
            when: parts.length === 0 ? "" : span(firstMonth[category.id], lastMonth[category.id]),
            note: ""
        };

    });

}

/**
 * What selling brings in, month by month, as it is received, and what
 * the units sold cost: Financial Sustainability's streams, in the
 * shape cashTimeline adds to its own months. Zero without a page.
 */
export function revenueFlows(
    value: FinancialFoundationValue,
    lines: CostLine[],
    funding: FundingSourceValue[],
    revenuePage?: FinancialSustainabilityValue
): { inflow: number[]; outflow: number[] } {
    const inflow = new Array<number>(MODEL_MONTHS).fill(0);
    const outflow = new Array<number>(MODEL_MONTHS).fill(0);
    const streams = revenuePage?.streams ?? [];
    if (streams.length > 0) {
        const inputs = breakEvenInputs(value, lines, funding);
        streams.forEach(stream => {
            const variable = streamVariableCost(stream, inputs);
            streamRevenue(stream, value.planStart).received.forEach((amount, index) => { inflow[index] += amount; });
            streamVolumes(stream, value.planStart).forEach((units, index) => { outflow[index] += units * variable; });
        });
    }
    return { inflow, outflow };
}

/** Every funding source the page counts: founders' capital, then the rest. */
export function allFunding(
    value: FinancialFoundationValue,
    legalEntity: LegalEntityValue
): FundingSourceValue[] {
    return [...founderCapitalSources(value, legalEntity), ...value.funding];
}

export function financialPosition(
    value: FinancialFoundationValue,
    lines: CostLine[],
    legalEntity: LegalEntityValue,
    currency: string,
    format: (amount: number) => string,
    /** Financial Sustainability's page: the revenue the operating need is net of. */
    revenuePage?: FinancialSustainabilityValue
): FinancialPosition {

    const start = value.planStart;
    const funding = allFunding(value, legalEntity);

    const allStandings = funding.map(source => ({ source, standing: fundingStanding(source, start) }));

    // Cash only, from here on; in-kind is reported apart.
    const standings = allStandings.filter(entry => !isNonCash(entry.source));
    const nonCash = allStandings
        .filter(entry => isNonCash(entry.source))
        .reduce((sum, entry) => sum + entry.standing.total, 0);

    const needs = fundingNeeds(value, lines, legalEntity, revenuePage, format);
    const need = needs.reduce((sum, entry) => sum + entry.amount, 0);
    // In hand: what has arrived, less what was already spent before the plan.
    const availableNow = standings.reduce((sum, entry) => sum + entry.standing.received, 0) -
        spentBeforePlan(lines, start);
    const confirmedFuture = standings.reduce((sum, entry) => sum + entry.standing.confirmedFuture, 0);
    // Confirmed money that arrives within the plan: only it can meet the need.
    const length = planLength(value);
    const confirmedInPlan = standings.reduce((sum, entry) => sum + (entry.standing.confirmedFuture > 0
        ? entry.standing.future.filter(arrival => arrival.month <= length).reduce((total, arrival) => total + arrival.amount, 0)
        : 0), 0);
    const pending = standings.reduce((sum, entry) => sum + entry.standing.pending, 0);

    const withRevenue = (revenuePage?.streams.length ?? 0) > 0;
    const { timeline } = cashTimeline(value, lines, funding,
        withRevenue ? revenueFlows(value, lines, funding, revenuePage) : undefined);
    const runwayMonths = runwayOf(timeline);

    /*
        THE GAP: the need less the money in hand and the confirmed money
        that arrives within the plan. When in the plan the cash runs
        short is the runway's to say.
    */
    const gap = Math.max(0, need - availableNow - confirmedInPlan);

    const lowestOf = (months: CashMonth[]) => months.reduce(
        (low, month) => month.balance < low.balance ? month : low,
        { balance: 0, label: "", month: 0 } as Pick<CashMonth, "balance" | "label" | "month">);

    /*
        WITH THE FUNDING BEING SOUGHT: the same months, as if every
        pending source arrived as planned, its repayments included. A
        loan sized to the gap can still leave the cash short once it
        has to be repaid.
    */
    const sought = pending > 0.005
        ? (() => {
            const asConfirmed = funding.map(source =>
                statusStanding(source.status || "planned") === "confirmed" ? source : { ...source, status: "approved" as const });
            const withSought = cashTimeline(value, lines, asConfirmed,
                withRevenue ? revenueFlows(value, lines, asConfirmed, revenuePage) : undefined).timeline;
            const low = lowestOf(withSought);
            return { amount: pending, shortfall: Math.max(0, -low.balance), lowestLabel: low.label };
        })()
        : null;

    /* The mix. */
    const mix = (Object.keys(NATURE_LABELS) as FundingNature[]).map(nature => {
        const of = standings.filter(entry =>
            (fundingType(entry.source.type)?.nature ?? "other") === nature);
        return {
            nature,
            label: NATURE_LABELS[nature],
            confirmed: of.reduce((sum, entry) =>
                sum + entry.standing.received + entry.standing.confirmedFuture, 0),
            pending: of.reduce((sum, entry) => sum + entry.standing.pending, 0)
        };
    }).filter(entry => entry.confirmed + entry.pending > 0);

    /* Each need, and the funding linked to it. */
    const coverage = needs.filter(entry => entry.amount > 0.005).map(entry => ({
        id: entry.id,
        name: entry.label,
        need: entry.amount,
        linked: standings
            .filter(item => item.source.needIds.includes(entry.id))
            .reduce((sum, item) => sum + item.standing.received + item.standing.confirmedFuture, 0)
    }));

    /* The loans, and what they will cost. */
    const loans = funding
        .filter(source => fundingType(source.type)?.nature === "debt")
        .map(source => ({ source, schedule: loanSchedule(source, start) }))
        .filter((entry): entry is { source: FundingSourceValue; schedule: LoanSchedule } =>
            entry.schedule !== null);

    /* What is coming in the next six months. */
    const obligations: Obligation[] = [];

    lines.forEach(line => {
        if (!line.counted || line.amount === null) {
            return;
        }
        if (line.frequency === "monthly" || !isScheduled(line)) {
            return;
        }
        costSchedule(line, start).forEach((amount, index) => {
            if (amount > 0 && index < 6) {
                obligations.push({
                    month: index + 1,
                    label: planMonthLabel(start, index + 1),
                    what: line.name + (line.frequency === "one-time"
                        ? ""
                        : " (" + (COST_FREQUENCIES.find(f => f.id === line.frequency)?.label ?? "") + ")"),
                    amount,
                    direction: "out"
                });
            }
        });
    });

    loans.forEach(({ source, schedule }) => {
        const first = schedule.payments[0];
        if (first && first.month <= 6) {
            obligations.push({
                month: first.month,
                label: planMonthLabel(start, first.month),
                what: "Repayments begin: " + (source.name.trim() || "loan"),
                amount: first.payment,
                direction: "out"
            });
        }
    });

    standings.forEach(({ source, standing }) => {
        standing.future.forEach(arrival => {
            if (arrival.month <= 6) {
                obligations.push({
                    month: arrival.month,
                    label: planMonthLabel(start, arrival.month),
                    what: (source.name.trim() || fundingType(source.type)?.label || "Funding") +
                        (standing.pending > 0 ? " (not yet confirmed)" : ""),
                    amount: arrival.amount,
                    direction: "in"
                });
            }
        });
    });

    /*
        SIGNIFICANT events only, as the specification asks: at least a
        tenth of an average month's outgoings (and never under 100),
        and no more than ten -- a £14 domain renewal beside a £7,200
        loom purchase is noise, not an obligation to plan for.
    */
    const averageOut = timeline.reduce((sum, entry) => sum + entry.outflow, 0) / Math.max(1, timeline.length);
    const threshold = Math.max(100, averageOut * 0.1);

    const significant = obligations
        .filter(entry => entry.amount >= threshold)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

    obligations.length = 0;
    obligations.push(...significant);

    obligations.sort((a, b) => a.month - b.month || b.amount - a.amount);

    /* What the founder should notice. */
    const signals: Signal[] = [];

    if (need > 0 && gap > 0.005) {
        signals.push({
            tone: "risk",
            title: "Funding Gap",
            text: "Additional financing of " + format(gap) + " is required."
        });
    }

    const lowest = timeline.reduce(
        (worst, month) => month.balance < worst.balance ? month : worst,
        timeline[0]
    );

    if (runwayMonths !== null && need > 0 && gap <= 0.005) {
        const nextIn = timeline.slice(runwayMonths).find(month => month.inflow > 0);
        signals.push({
            tone: "caution",
            title: "Funding Timing",
            text: "Available funds fall below zero in " + timeline[runwayMonths].label +
                (nextIn ? ", before the next scheduled funding in " + nextIn.label : "") +
                ", even though the total identified funding covers the requirement."
        });
    }

    loans.forEach(({ source, schedule }) => {
        const first = schedule.payments[0];
        signals.push({
            tone: "info",
            title: "Loan",
            text: (source.name.trim() || fundingType(source.type)?.label || "Loan") + " repayments begin in " +
                planMonthLabel(start, first.month) + " and create an estimated " +
                (PERIOD_FREQUENCIES.find(f => f.id === source.loan.frequency)?.label ?? "").toLowerCase() +
                " obligation of " + format(schedule.firstPayment) +
                ", with " + format(schedule.totalInterest) + " of interest in total."
        });
    });

    const hasOutflows = timeline.some(month => month.outflow > 0);

    if (!hasOutflows) {
        signals.push({
            tone: "info",
            title: "Runway",
            text: "No scheduled costs are recorded yet, so no runway can be estimated."
        });
    } else if (runwayMonths === null) {
        signals.push({
            tone: "good",
            title: "Runway",
            text: "Based on current available funds, identified costs" + (withRevenue ? " and expected revenue" : "") + ", available funds last beyond the " +
                planLength(value) + "-month plan."
        });
    } else {
        signals.push({
            tone: runwayMonths < 6 ? "risk" : "caution",
            title: "Runway",
            text: "Based on current available funds, identified costs" + (withRevenue ? " and expected revenue" : "") + ", the organization can operate for approximately " +
                runwayMonths + " month" + (runwayMonths === 1 ? "" : "s") +
                " before available funds are exhausted" +
                (lowest ? " (lowest point " + format(lowest.balance) + " in " + lowest.label + ")" : "") + "."
        });
    }

    // The share of the financing itself, as Financial Sustainability
    // measures it: money received, not what is left of it.
    const planned = standings.reduce((sum, entry) => sum + entry.standing.total, 0);
    if (planned > 0 && pending / planned >= 0.5) {
        signals.push({
            tone: "caution",
            title: "Funding Dependency",
            text: "A significant proportion of planned financing (" +
                Math.round(pending / planned * 100) + "%) depends on funding that has not yet been confirmed."
        });
    }

    const uncounted = {
        currency: lines.filter(line => !line.counted),
        unscheduled: lines.filter(line => line.counted && line.amount !== null && !isScheduled(line)),
        unreadable: lines.filter(line => line.amount === null)
    };

    const duplicates = possibleDuplicates(lines);

    duplicates.forEach(([one, other]) => {
        signals.push({
            tone: "caution",
            title: "Possible Duplicate",
            text: "“" + one.name + "” (" + one.sourceLabel + ") and “" + other.name + "” (" + other.sourceLabel +
                ") may be the same cost counted twice. Remove the price from one of them if so."
        });
    });

    if (nonCash > 0) {
        signals.push({
            tone: "info",
            title: "In-kind Contributions",
            text: "In-kind contributions worth " + format(nonCash) +
                " are recorded but not counted as cash: they cannot pay a bill."
        });
    }

    if (uncounted.currency.length > 0) {
        signals.push({
            tone: "caution",
            title: "Other Currencies",
            text: uncounted.currency.length + " cost" + (uncounted.currency.length === 1 ? " is" : "s are") +
                " priced in a currency other than " + (currency || "the organization's") +
                " and left out of every total."
        });
    }

    if (sought && gap > 0.005) {
        signals.push(sought.shortfall > 0.005
            ? {
                tone: "risk",
                title: "Funding Being Sought Falls Short",
                text: "With the " + format(sought.amount) + " being sought, cash still falls " + format(sought.shortfall) +
                    " short in " + sought.lowestLabel + ", once its repayments are counted. Seek more, on longer terms, or reduce costs."
            }
            : {
                tone: "good",
                title: "Funding Being Sought Covers the Gap",
                text: "If the " + format(sought.amount) + " being sought arrives as planned, cash stays above zero, its repayments included."
            });
    }

    /* A loan with no repayment schedule is never repaid in the plan. */
    const unscheduledLoans = funding.filter(source =>
        fundingType(source.type)?.nature === "debt" &&
        (source.status === "approved" || source.status === "received" || source.status === "closed") &&
        loanSchedule(source, start) === null);
    if (unscheduledLoans.length > 0) {
        signals.push({
            tone: "caution",
            title: "Loan Repayments Missing",
            text: unscheduledLoans.map(source => source.name.trim() || "A loan").join(", ") +
                ": give the Repayment Start and Number of Payments, or no repayment or interest is counted."
        });
    }

    return {
        currency, need, availableNow, confirmedFuture, pending, gap, sought,
        runwayMonths, hasOutflows, timeline, mix, needs, coverage, obligations, signals, loans, uncounted,
        nonCash, duplicates
    };

}

/**
 * Which of Page 4's four sections are still empty. The fourth is
 * calculated, so it is never "unanswered".
 */
export function financialFoundationSectionsEmpty(value: unknown): boolean[] {
    const foundation = asFinancialFoundationValue(value);
    return [
        // Costs are mostly read from elsewhere; what this page asks
        // is when the plan starts.
        monthOrdinal(foundation.planStart) === null,
        // Calculated from the costs: nothing to answer.
        false,
        // A founder's capital is answered on the Legal Entity; its
        // standing is kept here once the founder has set it.
        foundation.funding.every(source => (parseAmount(source.amount) ?? 0) === 0) &&
            Object.keys(foundation.founderCapital).length === 0,
        false
    ];
}

export const FINANCIAL_FOUNDATION_SECTIONS = [
    "Costs",
    "Funding Need",
    "Capital & Funding",
    "Financial Position"
] as const;

/* ==========================================================
   Page 5 -- what is stored
========================================================== */

export const REVENUE_MODELS = [
    "Product Sale", "Service Fee", "Subscription", "Licence",
    "Commission", "Usage-based", "Project / Contract", "Other"
] as const;

export const REVENUE_UNITS = [
    "Product", "Project", "Session", "Participant", "Hour", "Day",
    "Client", "Licence", "Subscription", "Other"
] as const;

/**
 * How a stream is charged: the one question that used to be two
 * (Revenue Model and Frequency). A sale or a project is paid once;
 * a subscription or retainer every period, by those active.
 */
export const REVENUE_CHARGES = [
    { id: "per-sale", label: "Per sale", model: "Sale" },
    { id: "per-project", label: "Per project", model: "Project / Contract" },
    { id: "monthly", label: "Monthly", model: "Subscription / Retainer" },
    { id: "quarterly", label: "Quarterly", model: "Subscription / Retainer" },
    { id: "annually", label: "Annually", model: "Subscription / Licence" }
] as const;

/** The revenue model a stream's charging implies, for the documents. */
export function revenueModelLabel(stream: RevenueStreamValue): string {
    return REVENUE_CHARGES.find(entry => entry.id === stream.frequency)?.model ?? "";
}

/** Earlier ways of charging, as the ones asked now. */
function asCharge(frequency: string): RevenueFrequency | "" {
    if (frequency === "per-contract") {
        return "per-project";
    }
    if (frequency === "one-time" || frequency === "usage-based" || frequency === "other") {
        return "per-sale";
    }
    return REVENUE_CHARGES.some(entry => entry.id === frequency) ? frequency as RevenueFrequency : "";
}

export const REVENUE_FREQUENCIES = [
    { id: "one-time", label: "One-time", factor: 1 },
    { id: "per-sale", label: "Per sale", factor: 1 },
    { id: "monthly", label: "Monthly", factor: 1 },
    { id: "quarterly", label: "Quarterly", factor: 1 / 3 },
    { id: "annually", label: "Annually", factor: 1 / 12 },
    { id: "per-project", label: "Per project", factor: 1 },
    { id: "per-contract", label: "Per contract", factor: 1 },
    { id: "usage-based", label: "Usage-based", factor: 1 },
    { id: "other", label: "Other", factor: 1 }
] as const;

export type RevenueFrequency = typeof REVENUE_FREQUENCIES[number]["id"];

/** A recurring charge: its volume is how many are ACTIVE, not sold. */
export function isRecurringRevenue(frequency: string): boolean {
    return frequency === "monthly" || frequency === "quarterly" || frequency === "annually";
}

export const REVENUE_DEVELOPMENTS = [
    { id: "steady", label: "Steady from the start", explanation: "The expected volume from the month revenue begins." },
    { id: "gradual", label: "Gradual build-up", explanation: "Starts lower and grows evenly to the expected volume." },
    { id: "detailed", label: "Month by month", explanation: "Enter the volume for the months that differ." }
] as const;

export type RevenueDevelopment = typeof REVENUE_DEVELOPMENTS[number]["id"];

export const PAYMENT_TIMINGS = [
    { id: "", label: "When earned" },
    { id: "upfront", label: "Upfront" },
    { id: "completion", label: "On completion" },
    { id: "split", label: "Split" },
    { id: "milestone", label: "Milestones" },
    { id: "other", label: "Other" }
] as const;

export type PaymentTiming = typeof PAYMENT_TIMINGS[number]["id"];

export interface RevenueStreamValue {
    /**
     * Months later than planned that customers pay, on top of the
     * payment timing: set only by the stress test, never stored.
     */
    receiptLag?: number;
    id: string;
    /** A Page 1 Offering. */
    offeringId: string;
    model: string;
    modelOther: string;
    price: string;
    unit: string;
    unitOther: string;
    frequency: RevenueFrequency | "";
    /** Units a month at the normal operating level. */
    volume: string;
    /** When revenue begins. Unset: the plan's first month. */
    start: StrategyMonthValue;
    development: RevenueDevelopment;
    /** Gradual: the first month's volume, and months to reach normal. */
    initialVolume: string;
    rampMonths: string;
    /** Month by month: volumes from a month on. */
    detailed: { id: string; month: StrategyMonthValue; volume: string }[];
    /** No longer used: an Offering's costs are recorded on Page 3. Kept empty. */
    variableCost: string;
    /** Units in an average order: what a per-order cost is shared by. "" = 1. */
    itemsPerOrder: string;
    /** What the customer pays towards delivery, per order. */
    deliveryCharge: string;
    paymentTiming: PaymentTiming;
    /** Completion / split: months after the sale the (rest) is paid. */
    paymentDelay: string;
    /** Split / milestone: percent paid at the start. */
    firstPercent: string;
    description: string;
}

export interface FinancialSustainabilityValue {
    streams: RevenueStreamValue[];
}

export function createRevenueStream(): RevenueStreamValue {
    return {
        id: financeId("stream"),
        offeringId: "",
        model: "",
        modelOther: "",
        price: "",
        unit: "",
        unitOther: "",
        frequency: "",
        volume: "",
        start: { ...EMPTY_MONTH },
        development: "steady",
        initialVolume: "",
        rampMonths: "",
        detailed: [],
        variableCost: "",
        itemsPerOrder: "",
        deliveryCharge: "",
        paymentTiming: "",
        paymentDelay: "",
        firstPercent: "",
        description: ""
    };
}

export function createDetailedVolume() {
    return { id: financeId("volume"), month: { ...EMPTY_MONTH }, volume: "" };
}

const DEVELOPMENT_IDS = REVENUE_DEVELOPMENTS.map(entry => entry.id);
const TIMING_IDS = PAYMENT_TIMINGS.map(entry => entry.id);

export function asFinancialSustainabilityValue(value: unknown): FinancialSustainabilityValue {

    const source = asObject(value);

    return {
        streams: asList(source.streams).map(entry => {
            const row = asObject(entry);
            return {
                id: asText(row.id) || financeId("stream"),
                offeringId: asText(row.offeringId),
                model: asText(row.model),
                modelOther: asText(row.modelOther),
                price: asText(row.price),
                unit: asText(row.unit),
                unitOther: asText(row.unitOther),
                frequency: asCharge(asText(row.frequency)),
                volume: asText(row.volume),
                start: asMonth(row.start),
                development: oneOf(row.development, DEVELOPMENT_IDS, "steady"),
                initialVolume: asText(row.initialVolume),
                rampMonths: asText(row.rampMonths),
                detailed: asList(row.detailed).map(item => {
                    const part = asObject(item);
                    return {
                        id: asText(part.id) || financeId("volume"),
                        month: asMonth(part.month),
                        volume: asText(part.volume)
                    };
                }),
                // No longer asked: an Offering's costs are on Page 3.
                variableCost: "",
                itemsPerOrder: asText(row.itemsPerOrder),
                deliveryCharge: asText(row.deliveryCharge),
                paymentTiming: oneOf(row.paymentTiming, TIMING_IDS, ""),
                paymentDelay: asText(row.paymentDelay),
                firstPercent: asText(row.firstPercent),
                description: asText(row.description)
            };
        })
    };

}

export const FINANCIAL_SUSTAINABILITY_SECTIONS = ["Revenue", "Break Even"] as const;

export function financialSustainabilitySectionsEmpty(value: unknown): boolean[] {
    return [asFinancialSustainabilityValue(value).streams.length === 0, false];
}

/* ==========================================================
   Page 5 -- revenue
========================================================== */

/** A stream's price for one unit, as a monthly equivalent. */
export function monthlyPrice(stream: RevenueStreamValue): number | null {
    const price = parseAmount(stream.price);
    if (price === null) {
        return null;
    }
    // What the customer pays for delivery, shared by the order's items.
    const delivery = (parseAmount(stream.deliveryCharge) ?? 0) / itemsPerOrder(stream);
    return (price + delivery) * chargeFactor(stream);
}

/**
 * The share of a charge that falls in one month: 1 for a monthly or
 * one-off charge, a third for a quarterly one, a twelfth for an annual
 * one. A charge's costs per unit are spread the same way.
 */
export function chargeFactor(stream: RevenueStreamValue): number {
    return REVENUE_FREQUENCIES.find(entry => entry.id === stream.frequency)?.factor ?? 1;
}

/**
 * The volume at the normal level: as entered, or, for a stream given
 * month by month, the volume of the last month listed.
 */
export function normalVolume(stream: RevenueStreamValue): number {
    if (stream.development === "detailed") {
        const last = stream.detailed
            .filter(entry => monthOrdinal(entry.month) !== null)
            .sort((a, b) => (monthOrdinal(a.month) ?? 0) - (monthOrdinal(b.month) ?? 0))
            .pop();
        return Math.max(0, parseDecimal(last?.volume ?? "") ?? 0);
    }
    return Math.max(0, parseDecimal(stream.volume) ?? 0);
}

/** Units in an average order: 1 unless said otherwise. */
export function itemsPerOrder(stream: RevenueStreamValue): number {
    const items = parseDecimal(stream.itemsPerOrder);
    // An order holds at least one: fewer counts as 1.
    return items !== null && items >= 1 ? Math.min(MAX_ITEMS, items) : 1;
}

/**
 * The variable cost of one unit of a stream: its Offering's costs per
 * unit, recorded on Page 3, and its costs per order shared by the
 * items in an order.
 */
export function streamVariableCost(stream: RevenueStreamValue, inputs: BreakEvenInputs): number {
    return ((inputs.variableByOffering[stream.offeringId] ?? 0) +
        (inputs.perOrderByOffering[stream.offeringId] ?? 0) / itemsPerOrder(stream)) * chargeFactor(stream);
}

/** Units in each month of the plan, index 0 = Month 1. */
export function streamVolumes(stream: RevenueStreamValue, start: StrategyMonthValue): number[] {

    const volumes = new Array<number>(MODEL_MONTHS).fill(0);
    const normal = Math.max(0, parseDecimal(stream.volume) ?? 0);
    const first = (planMonth(start, stream.start) ?? 1) - 1;

    if (stream.development === "detailed") {

        // Each entry holds from its month until the next one; before
        // the first, nothing.
        const points = stream.detailed
            .map(entry => ({
                index: (planMonth(start, entry.month) ?? 1) - 1,
                volume: Math.max(0, parseDecimal(entry.volume) ?? 0)
            }))
            .sort((a, b) => a.index - b.index);

        let current = 0;
        let next = 0;

        for (let index = 0; index < MODEL_MONTHS; index++) {
            while (next < points.length && points[next].index <= index) {
                current = points[next].volume;
                next++;
            }
            volumes[index] = current;
        }

        return volumes;

    }

    const initial = Math.max(0, parseDecimal(stream.initialVolume) ?? 0);
    const ramp = Math.min(MAX_MONTHS, Math.max(1, Math.floor(parseDecimal(stream.rampMonths) ?? 1)));

    for (let index = first; index < MODEL_MONTHS; index++) {
        const since = index - first;
        volumes[index] = stream.development === "gradual" && since < ramp - 1
            ? initial + (normal - initial) * since / (ramp - 1)
            : normal;
    }

    return volumes;

}

/**
 * Revenue EARNED each month and cash RECEIVED each month. They
 * differ only where the payment timing says so.
 */
export function streamRevenue(
    stream: RevenueStreamValue,
    start: StrategyMonthValue
): { earned: number[]; received: number[] } {

    const price = monthlyPrice(stream) ?? 0;
    const earned = streamVolumes(stream, start).map(volume => volume * price);
    const received = new Array<number>(MODEL_MONTHS).fill(0);

    const delay = Math.min(MAX_MONTHS, Math.max(0, Math.floor(parseDecimal(stream.paymentDelay) ?? 0)));
    const firstShare = Math.min(100, Math.max(0, parsePercent(stream.firstPercent) ?? 50)) / 100;

    const add = (index: number, amount: number) => {
        if (index < MODEL_MONTHS) {
            received[index] += amount;
        }
    };

    /* A quarterly or annual charge paid upfront: what each period
       earns arrives in its first month. */
    const period = stream.frequency === "quarterly" ? 3 : stream.frequency === "annually" ? 12 : 1;
    if (stream.paymentTiming === "upfront" && period > 1) {
        const first = earned.findIndex(amount => amount > 0);
        if (first >= 0) {
            for (let index = first; index < MODEL_MONTHS; index += period) {
                add(index, earned.slice(index, index + period).reduce((sum, amount) => sum + amount, 0));
            }
        }
        return { earned, received: lagged(received, stream.receiptLag) };
    }

    earned.forEach((amount, index) => {
        switch (stream.paymentTiming) {
            case "completion":
                add(index + delay, amount);
                break;
            case "split":
            case "milestone":
                add(index, amount * firstShare);
                add(index + delay, amount * (1 - firstShare));
                break;
            default:
                add(index, amount);
        }
    });

    return { earned, received: lagged(received, stream.receiptLag) };

}

/** Money received some months later than planned: moved on, none lost within the model. */
function lagged(received: number[], months = 0): number[] {
    if (months <= 0) {
        return received;
    }
    const later = new Array<number>(MODEL_MONTHS).fill(0);
    received.forEach((amount, index) => {
        if (index + months < MODEL_MONTHS) {
            later[index + months] += amount;
        }
    });
    return later;
}

/** A month moved by whole months; an unset one counts as the plan's first. */
function shiftMonth(month: StrategyMonthValue, by: number, start: StrategyMonthValue): StrategyMonthValue {
    const base = monthOrdinal(month) ?? monthOrdinal(start);
    if (base === null || by === 0) {
        return month;
    }
    const moved = base + by;
    return { month: String(moved % 12 + 1).padStart(2, "0"), year: String(Math.floor(moved / 12)) };
}

export interface WhatIf {
    /** Percent change in every price. */
    price: number;
    /** Percent change in every volume. */
    volume: number;
    /** Months revenue begins later (negative: earlier). */
    delay: number;
}

/**
 * The revenue assumptions with every price, volume and start moved
 * together -- the what-if on Financial Sustainability. Never stored:
 * it asks "what would it take?", it does not change the plan.
 */
export function withWhatIf(
    page: FinancialSustainabilityValue,
    change: WhatIf,
    start: StrategyMonthValue
): FinancialSustainabilityValue {

    // A price is money, a volume a count: each read as its page reads it.
    const scale = (value: string, percent: number, parse = parseDecimal) => {
        const amount = parse(value);
        return amount === null || percent === 0 ? value : numberAsText(amount * (1 + percent / 100));
    };

    return {
        streams: page.streams.map(stream => ({
            ...stream,
            price: scale(stream.price, change.price, parseAmount),
            volume: scale(stream.volume, change.volume),
            initialVolume: scale(stream.initialVolume, change.volume),
            start: shiftMonth(stream.start, change.delay, start),
            detailed: stream.detailed.map(entry => ({
                ...entry,
                volume: scale(entry.volume, change.volume),
                month: shiftMonth(entry.month, change.delay, start)
            }))
        }))
    };

}

/* ==========================================================
   Page 5 -- break even
========================================================== */

export interface BreakEvenInputs {
    /** Monthly fixed costs, the sum of the parts below. */
    fixed: number;
    parts: { label: string; amount: number }[];
    /** Variable cost per unit read from Page 4, by Offering id. */
    variableByOffering: Record<string, number>;
    /** Cost per ORDER, by Offering id: shared by the items in an order. */
    perOrderByOffering: Record<string, number>;
    /** Why the result is an estimate. */
    caveats: string[];
}

/**
 * A number written back as text, to be read by parseAmount again: at
 * most six decimals, and never exactly three (so "1.545" cannot be
 * read as a thousand five hundred and forty-five).
 */
export function numberAsText(value: number): string {
    const text = String(Math.round(value * 1e6) / 1e6);
    return /[.]\d{3}$/.test(text) ? text + "0" : text;
}

/**
 * The costs break even is measured against, from Page 4.
 *
 * FIXED is the monthly equivalent of every recurring cost, plus
 * loan interest -- a financial cost. Loan PRINCIPAL is not a cost
 * at all but repayment of borrowed money, and one-time costs are
 * what the funding on Page 4 is for, so neither is here.
 *
 * VARIABLE, per unit, is every cost paid per project or per unit and
 * linked to an Offering, plus the variable part of a semi-variable
 * cost that has been separated.
 */
export function breakEvenInputs(
    foundation: FinancialFoundationValue,
    lines: CostLine[],
    funding: FundingSourceValue[]
): BreakEvenInputs {

    let fixedCosts = 0;
    let semiFixed = 0;
    let variableAsFixed = 0;
    let interest = 0;
    const variableByOffering: Record<string, number> = {};
    const perOrderByOffering: Record<string, number> = {};
    /* A per-order cost is counted per order; a stream shares it out. */
    const addPerUnit = (line: CostLine, amount: number) => {
        const into = line.frequency === "per-order" ? perOrderByOffering : variableByOffering;
        line.offeringIds.forEach(id => { into[id] = (into[id] ?? 0) + amount; });
    };
    const caveats: string[] = [];

    let unseparated = 0;
    let unassigned = 0;
    let unmodelled = 0;

    lines.forEach(line => {

        if (!line.counted || line.amount === null) {
            return;
        }

        if (line.behaviour === "semi-variable") {
            const separated = line.fixedPart !== null || line.variablePerUnit !== null;
            if (!separated) {
                unseparated++;
            }
            if (isPerUnit(line)) {
                if (line.offeringIds.length > 0) {
                    addPerUnit(line, line.amount);
                } else {
                    unassigned++;
                }
            } else {
                semiFixed += monthlyEquivalent(
                    separated ? line.fixedPart ?? 0 : line.amount, line.frequency);
            }
            if (line.variablePerUnit !== null && !isPerUnit(line)) {
                const perUnit = line.variablePerUnit;
                line.offeringIds.forEach(id => { variableByOffering[id] = (variableByOffering[id] ?? 0) + perUnit; });
            }
            return;
        }

        if (isPerUnit(line)) {
            if (line.offeringIds.length > 0) {
                addPerUnit(line, line.amount);
            } else {
                unassigned++;
            }
            return;
        }

        // Usage-based or "Other": neither a month nor a unit to count it against.
        if (!isScheduled(line)) {
            unmodelled++;
            return;
        }

        const monthly = monthlyEquivalent(line.amount, line.frequency);

        if (line.behaviour === "variable") {
            variableAsFixed += monthly;
        } else {
            fixedCosts += monthly;
        }

    });

    const start = foundation.planStart;

    funding.forEach(source => {
        if (fundingType(source.type)?.nature !== "debt" ||
            statusStanding(source.status || "planned") !== "confirmed") {
            return;
        }
        const schedule = loanSchedule(source, start);
        if (schedule && schedule.payments.length > 0) {
            const first = schedule.payments[0].month;
            const last = schedule.payments[schedule.payments.length - 1].month;
            const span = Math.max(1, last - first + periodMonths(source.loan.frequency));
            interest += schedule.totalInterest / span;
        }
    });

    if (unseparated > 0) {
        caveats.push(unseparated + " semi-variable cost" + (unseparated === 1 ? " is" : "s are") +
            " not separated into fixed and variable parts, and counted in full as fixed.");
    }
    if (variableAsFixed > 0) {
        caveats.push("Variable costs recorded as a periodic amount are counted with the fixed costs.");
    }
    if (unmodelled > 0) {
        caveats.push(unmodelled + " cost" + (unmodelled === 1 ? " is" : "s are") +
            " paid by usage or on an “Other” basis and not counted. On Financial Foundation, say whether each is per unit, per project or periodic.");
    }
    if (unassigned > 0) {
        caveats.push(unassigned + " per-unit cost" + (unassigned === 1 ? " is" : "s are") +
            " not linked to an Offering, so no revenue stream carries " + (unassigned === 1 ? "it" : "them") + ".");
    }

    const parts = [
        { label: "Recurring fixed costs", amount: fixedCosts },
        { label: "Fixed part of semi-variable costs", amount: semiFixed },
        { label: "Variable costs entered as periodic amounts", amount: variableAsFixed },
        { label: "Loan interest", amount: interest }
    ].filter(part => part.amount > 0.005);

    return {
        fixed: fixedCosts + semiFixed + variableAsFixed + interest,
        parts,
        variableByOffering,
        perOrderByOffering,
        caveats
    };

}

export interface StreamAnalysis {
    stream: RevenueStreamValue;
    price: number | null;
    variable: number;
    /** Whether the variable cost is the founder's own figure. */
    variableOverridden: boolean;
    contribution: number | null;
    /** Units a month at the normal level. */
    volume: number;
    /** Revenue a month at the normal level. */
    revenue: number;
    /** Units this Offering alone would need to cover the fixed costs. */
    breakEvenAlone: number | null;
}

export interface SustainabilityResult {
    inputs: BreakEvenInputs;
    streams: StreamAnalysis[];
    /** At the normal level. */
    expectedRevenue: number;
    expectedContribution: number;
    breakEvenRevenue: number | null;
    /** Multiplier of the expected mix that just covers fixed costs. */
    breakEvenScale: number | null;
    months: {
        month: number;
        label: string;
        revenue: number;
        costs: number;
        position: "below" | "at" | "above";
    }[];
    /** First plan month at or above break even; null if not within the plan. */
    breakEvenMonth: number | null;
    /** Funding-only runway, from Page 4. */
    fundingRunway: number | null;
    /** Revenue-adjusted: first month the balance falls below zero. */
    exhaustionMonth: number | null;
    revenueTimeline: CashMonth[];
    buffer: number | null;
    status: "above" | "sustainable" | "risk" | "not-reached" | "no-revenue";
    signals: Signal[];
}

export function sustainability(
    page: FinancialSustainabilityValue,
    foundation: FinancialFoundationValue,
    lines: CostLine[],
    legalEntity: LegalEntityValue,
    format: (amount: number) => string
): SustainabilityResult {

    const start = foundation.planStart;
    const funding = allFunding(foundation, legalEntity);
    const inputs = breakEvenInputs(foundation, lines, funding);

    const streams: StreamAnalysis[] = page.streams.map(stream => {

        const price = monthlyPrice(stream);
        const variable = streamVariableCost(stream, inputs);
        const contribution = price === null ? null : price - variable;
        const volume = normalVolume(stream);

        return {
            stream,
            price,
            variable,
            variableOverridden: false,
            contribution,
            volume,
            revenue: (price ?? 0) * volume,
            breakEvenAlone: contribution !== null && contribution > 0
                ? inputs.fixed / contribution
                : null
        };

    });

    const expectedRevenue = streams.reduce((sum, entry) => sum + entry.revenue, 0);
    const expectedContribution = streams.reduce(
        (sum, entry) => sum + (entry.contribution ?? 0) * entry.volume, 0);

    // The mix as expected, scaled until its contribution covers the
    // fixed costs: an organisation that sells two things does not
    // break even on either one alone.
    const breakEvenScale = expectedContribution > 0 ? inputs.fixed / expectedContribution : null;
    const breakEvenRevenue = breakEvenScale !== null ? expectedRevenue * breakEvenScale : null;

    /* Month by month. */
    const earned = new Array<number>(MODEL_MONTHS).fill(0);
    const received = new Array<number>(MODEL_MONTHS).fill(0);
    const variableOut = new Array<number>(MODEL_MONTHS).fill(0);

    streams.forEach(entry => {
        const revenue = streamRevenue(entry.stream, start);
        const volumes = streamVolumes(entry.stream, start);
        revenue.earned.forEach((amount, index) => { earned[index] += amount; });
        revenue.received.forEach((amount, index) => { received[index] += amount; });
        volumes.forEach((units, index) => { variableOut[index] += units * entry.variable; });
    });

    const months = earned.slice(0, planLength(foundation)).map((revenue, index) => {
        const costs = inputs.fixed + variableOut[index];
        const difference = revenue - costs;
        return {
            month: index + 1,
            label: planMonthLabel(start, index + 1),
            revenue,
            costs,
            position: (revenue <= 0
                ? "below"
                : Math.abs(difference) < 0.5
                    ? "at"
                    : difference > 0 ? "above" : "below") as "below" | "at" | "above"
        };
    });

    const reached = months.findIndex(month => month.position !== "below");
    const breakEvenMonth = reached >= 0 ? reached + 1 : null;

    const fundingOnly = cashTimeline(foundation, lines, funding);
    const fundingRunway = runwayOf(fundingOnly.timeline);

    const adjusted = cashTimeline(foundation, lines, funding, {
        inflow: received,
        outflow: variableOut
    });
    const exhaustionIndex = runwayOf(adjusted.timeline);
    const exhaustionMonth = exhaustionIndex === null ? null : exhaustionIndex + 1;

    let status: SustainabilityResult["status"];
    if (expectedRevenue <= 0 && !earned.some(amount => amount > 0)) {
        status = "no-revenue";
    } else if (breakEvenMonth === 1 && exhaustionMonth === null) {
        status = "above";
    } else if (breakEvenMonth === null) {
        status = "not-reached";
    } else if (exhaustionMonth !== null && exhaustionMonth <= breakEvenMonth) {
        status = "risk";
    } else {
        status = "sustainable";
    }

    const buffer = breakEvenMonth !== null && exhaustionMonth !== null && exhaustionMonth > breakEvenMonth
        ? exhaustionMonth - breakEvenMonth
        : null;

    /* Signals. */
    const signals: Signal[] = [];

    if (status === "no-revenue") {
        signals.push({
            tone: "info",
            title: "Revenue Not Yet Established",
            text: "No revenue is expected under the current assumptions. Break even cannot be reached from revenue" +
                (exhaustionMonth !== null
                    ? ", and available resources are expected to be exhausted in " + planMonthLabel(start, exhaustionMonth) + "."
                    : ", but available resources last beyond the " + planLength(foundation) + "-month plan.")
        });
    } else if (status === "above") {
        signals.push({
            tone: "good",
            title: "Above Break Even",
            text: "Expected revenue already covers the relevant costs from the first month of the plan."
        });
    } else if (status === "not-reached") {
        signals.push({
            tone: "risk",
            title: "Break Even Not Reached",
            text: "The current revenue assumptions do not show a path to break even within the " +
                planLength(foundation) + "-month plan."
        });
    } else if (status === "risk") {
        signals.push({
            tone: "risk",
            title: "Financial Risk",
            text: "Available resources are expected to be exhausted in " +
                planMonthLabel(start, exhaustionMonth ?? 1) + ", before break even in " +
                planMonthLabel(start, breakEvenMonth ?? 1) +
                ". Additional funding, lower costs, earlier revenue, higher prices or greater volume may be needed."
        });
    } else {
        signals.push({
            tone: "good",
            title: "Sustainable Before Financial Exhaustion",
            text: "Break even is expected in " + planMonthLabel(start, breakEvenMonth ?? 1) +
                (exhaustionMonth === null
                    ? ", and available resources last beyond the " + planLength(foundation) + "-month plan."
                    : ", " + (buffer ?? 0) + " month" + (buffer === 1 ? "" : "s") +
                        " before available resources are expected to be exhausted.")
        });
    }

    if (buffer !== null && buffer <= 2) {
        signals.push({
            tone: "caution",
            title: "Limited Sustainability Buffer",
            text: "Only " + buffer + " month" + (buffer === 1 ? "" : "s") +
                " separate expected break even from financial exhaustion."
        });
    }

    streams.forEach(entry => {
        if (entry.contribution !== null && entry.contribution <= 0) {
            signals.push({
                tone: "risk",
                title: "No Contribution",
                text: "A revenue stream's price does not cover its own variable cost per unit (" +
                    format(entry.contribution) + " per unit), so more volume cannot bring it to break even."
            });
        }
    });

    const fundingPlanned = funding.filter(source => !isNonCash(source)).map(source => fundingStanding(source, start));
    const pending = fundingPlanned.reduce((sum, entry) => sum + entry.pending, 0);
    const all = fundingPlanned.reduce((sum, entry) => sum + entry.total, 0);
    if (all > 0 && pending / all >= 0.5) {
        signals.push({
            tone: "caution",
            title: "Funding Dependency",
            text: "Much of the financing this assessment relies on (" + Math.round(pending / all * 100) +
                "%) is not yet confirmed, and is not counted until it is."
        });
    }

    return {
        inputs, streams, expectedRevenue, expectedContribution,
        breakEvenRevenue, breakEvenScale, months, breakEvenMonth,
        fundingRunway, exhaustionMonth, revenueTimeline: adjusted.timeline,
        buffer, status, signals
    };

}

/* ==========================================================
   Presenting amounts
========================================================== */

/**
 * An amount in a currency, rounded to whole units -- a planning
 * model, not a ledger. Falls back to the plain number with its code
 * when the code is not one the browser knows.
 */
/**
 * The locale a currency is written in at home, so dollars read "$1,200"
 * rather than "US$1,200". Others use the device's own.
 */
const CURRENCY_LOCALES: Record<string, string> = {
    USD: "en-US", GBP: "en-GB", EUR: "en-IE", CAD: "en-CA", AUD: "en-AU", NZD: "en-NZ"
};

export function moneyFormatter(
    currency: string,
    options?: {
        /**
         * Always whole units, even under 1000 with pence -- for a
         * read-only table where several rows sit side by side and a
         * mix of "$496.55" and "$5,263" reads as two different
         * conventions rather than one table. An amount someone can
         * still edit is never drawn from this formatter (it shows
         * the typed text itself), so this never hides pence anyone
         * is actively entering.
         */
        wholeOnly?: boolean;
    }
): (amount: number) => string {

    /* Whole amounts in whole units; an amount with pence keeps them,
       so a £2.20 card is not shown as £2 -- unless `wholeOnly`. */
    const locale = CURRENCY_LOCALES[currency];

    const make = (digits: number) => {
        if (currency) {
            try {
                return new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency,
                    minimumFractionDigits: digits,
                    maximumFractionDigits: digits
                });
            } catch {
                // An unknown code: shown after a plain number below.
            }
        }
        return null;
    };

    const whole = make(0);
    const exact = make(2);
    const plainWhole = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
    const plainExact = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (amount: number) => {
        const rounded = Math.abs(amount) < 0.005 ? 0 : amount;
        // Pence matter only on small amounts; large ones read as whole.
        const withPence = !options?.wholeOnly &&
            Math.abs(rounded) < 1000 && Math.abs(rounded - Math.round(rounded)) >= 0.005;
        const format = withPence ? exact : whole;
        return format
            ? format.format(rounded)
            : (withPence ? plainExact : plainWhole).format(rounded) + (currency ? " " + currency : "");
    };

}

/** A count of units, to one decimal where it is not whole. */
export function formatUnits(value: number): string {
    return Number.isInteger(Math.round(value * 10) / 10)
        ? String(Math.round(value))
        : (Math.round(value * 10) / 10).toFixed(1);
}

/* ==========================================================
   One Offering's costs
========================================================== */

export interface OfferingCosts {
    /** Paid for each unit or project sold. */
    perUnit: { name: string; amount: number; basis: "unit" | "order" | "project" | "variable part" }[];
    /** Paid every period, whatever is sold. */
    recurring: { name: string; monthly: number; frequency: CostFrequency; amount: number }[];
    oneTime: { name: string; amount: number }[];
    variablePerUnit: number;
    fixedMonthly: number;
    oneTimeTotal: number;
}

/**
 * What one Offering costs, from its own lines on Financial Foundation
 * (those recorded on Page 3's Offering's Capability): what each sale
 * costs, what it costs every month regardless, and what it cost to
 * set up. The same figures break even is measured with, per Offering.
 */
export function offeringCosts(lines: CostLine[], offeringId: string): OfferingCosts {

    const result: OfferingCosts = {
        perUnit: [], recurring: [], oneTime: [],
        variablePerUnit: 0, fixedMonthly: 0, oneTimeTotal: 0
    };

    lines.forEach(line => {

        if (!line.offeringIds.includes(offeringId) || !line.counted || line.amount === null) {
            return;
        }

        // A fixed cost several Offerings share is shared out evenly.
        const share = 1 / line.offeringIds.length;
        const shared = line.offeringIds.length > 1 ? " (shared)" : "";

        if (isPerUnit(line)) {
            result.perUnit.push({
                name: line.name,
                amount: line.amount,
                basis: line.frequency === "per-project" ? "project" : line.frequency === "per-order" ? "order" : "unit"
            });
            if (line.frequency !== "per-order") {
                result.variablePerUnit += line.amount;
            }
            return;
        }

        if (line.frequency === "one-time") {
            result.oneTime.push({ name: line.name + shared, amount: line.amount * share });
            result.oneTimeTotal += line.amount * share;
            return;
        }

        if (!isScheduled(line)) {
            return;
        }

        // A semi-variable cost, once separated: its fixed part a
        // month, its variable part with each unit.
        const separated = line.behaviour === "semi-variable" &&
            (line.fixedPart !== null || line.variablePerUnit !== null);
        const fixedAmount = separated ? line.fixedPart ?? 0 : line.amount;

        if (fixedAmount > 0) {
            const monthly = monthlyEquivalent(fixedAmount, line.frequency) * share;
            result.recurring.push({ name: line.name + shared, monthly, frequency: line.frequency, amount: fixedAmount * share });
            result.fixedMonthly += monthly;
        }

        if (separated && line.variablePerUnit !== null && line.variablePerUnit > 0) {
            result.perUnit.push({ name: line.name, amount: line.variablePerUnit, basis: "variable part" });
            result.variablePerUnit += line.variablePerUnit;
        }

    });

    return result;

}

/* ==========================================================
   Expected sales from Demand & Conversion
========================================================== */

/**
 * The revenue page with each stream's expected sales taken from
 * Customer Engagement's Demand & Conversion, where that Offering has
 * one that gives a figure. A stream without one keeps the volume
 * entered on Financial Sustainability: an organization that estimates
 * directly is never made to fill in demand.
 *
 * Every calculation that reads the revenue page reads it through this,
 * so the pages, the documents and the forecast agree.
 */
export function withDemand(
    page: FinancialSustainabilityValue,
    demand: Record<string, DemandValue> | undefined
): FinancialSustainabilityValue {
    if (!demand) {
        return page;
    }
    return {
        ...page,
        streams: page.streams.map(stream => {
            const expected = demandResult(demand[stream.offeringId]).expected;
            return expected === null ? stream : { ...stream, volume: numberAsText(expected) };
        })
    };
}

/**
 * Expected sales against deliverable capacity, for the plan: each
 * Offering's volumes month by month (as withDemand gives them) and the
 * founders' delivery hours, compared by capacityCheck. The pages and
 * the documents all read it from here.
 */
export function salesCapacity(
    revenuePage: FinancialSustainabilityValue,
    foundation: FinancialFoundationValue,
    capability: BusinessCapabilityValue
): CapacityCheck | null {
    const volumesByOffering: Record<string, number[]> = {};
    revenuePage.streams.forEach(stream => {
        const volumes = streamVolumes(stream, foundation.planStart);
        const into = volumesByOffering[stream.offeringId] ?? new Array<number>(volumes.length).fill(0);
        volumes.forEach((volume, index) => { into[index] += volume; });
        volumesByOffering[stream.offeringId] = into;
    });
    // Subscriptions and retainers are served every month: they use founders' hours first.
    const recurring = new Set([
        ...revenuePage.streams.filter(stream => isRecurringRevenue(stream.frequency)).map(stream => stream.offeringId),
        ...Object.entries(capability.delivery).filter(([, entry]) => entry.mode === "monthly").map(([offeringId]) => offeringId)
    ]);
    const names: Record<string, string> = Object.fromEntries([
        ...capability.professionals, ...capability.providers,
        ...capability.offering.professionals, ...capability.offering.providers
    ].map(person => [person.id, person.name.trim() || "Unnamed professional"]));
    return capacityCheck(capability.founders, volumesByOffering, capability.delivery, planLength(foundation), recurring, names);
}

/* ==========================================================
   Page 5 -- the stress test
========================================================== */

/*
    THE STRESS TEST A LENDER RUNS: the plan as it stands, and the same
    plan when things go worse than hoped, one at a time and then
    together. Nothing is chosen or saved: the scenarios are fixed, so
    the answer is the same for everyone who reads it.

    The funding being sought (pending sources) is counted as if it
    arrives as planned, repayments included: the question a lender
    asks is whether the plan holds WITH the money requested.
*/

export interface StressScenario {
    id: string;
    label: string;
    breakEvenMonth: number | null;
    /** First month the cash falls below zero; null if it never does. */
    exhaustionMonth: number | null;
    /** The lowest cash balance in the plan, and when. */
    lowest: number;
    lowestLabel: string;
    /** How much more money would keep the cash at zero or above. */
    shortfall: number;
}

export interface StressTest {
    /** The funding being sought, counted in every scenario. */
    sought: number;
    scenarios: StressScenario[];
}

const STRESS_CASES: { id: string; label: string; change: WhatIf; costs: number; lag: number }[] = [
    { id: "planned", label: "As planned", change: { price: 0, volume: 0, delay: 0 }, costs: 0, lag: 0 },
    { id: "sales", label: "Sales 20% lower", change: { price: 0, volume: -20, delay: 0 }, costs: 0, lag: 0 },
    { id: "delay", label: "Revenue 3 months later", change: { price: 0, volume: 0, delay: 3 }, costs: 0, lag: 0 },
    { id: "costs", label: "Costs 10% higher", change: { price: 0, volume: 0, delay: 0 }, costs: 10, lag: 0 },
    { id: "late", label: "Customers pay 1 month later", change: { price: 0, volume: 0, delay: 0 }, costs: 0, lag: 1 },
    { id: "downside", label: "All four together", change: { price: 0, volume: -20, delay: 3 }, costs: 10, lag: 1 }
];

/** A cost made dearer by a factor. Founders' pay is theirs to set, so it stays. */
function dearer(line: CostLine, factor: number): CostLine {
    if (factor === 1 || line.sourcePath.includes("resource-group-founders")) {
        return line;
    }
    const times = (value: number | null) => value === null ? null : value * factor;
    return {
        ...line,
        amount: times(line.amount),
        unitAmount: times(line.unitAmount),
        fixedPart: times(line.fixedPart),
        variablePerUnit: times(line.variablePerUnit)
    };
}

/** The funding being sought (pending sources), and the plan with it counted as arriving. */
function withFundingSought(foundation: FinancialFoundationValue): { sought: number; foundation: FinancialFoundationValue } {
    const sought = foundation.funding
        .filter(source => !isNonCash(source) && statusStanding(source.status || "planned") !== "confirmed")
        .reduce((sum, source) => sum + (parseAmount(source.amount) ?? 0), 0);
    return {
        sought,
        foundation: {
            ...foundation,
            funding: foundation.funding.map(source =>
                statusStanding(source.status || "planned") === "confirmed" ? source : { ...source, status: "approved" as const })
        }
    };
}

/** One case of the plan: its break even, and its cash at the lowest. */
function planCase(
    page: FinancialSustainabilityValue,
    foundation: FinancialFoundationValue,
    lines: CostLine[],
    legalEntity: LegalEntityValue,
    format: (amount: number) => string,
    change: WhatIf,
    /** Percent change in every cost, founders' pay aside. */
    costs: number,
    /** Months later that customers pay. */
    lag = 0
): Omit<StressScenario, "id" | "label"> {
    const changed = withWhatIf(page, change, foundation.planStart);
    const result = sustainability(
        lag > 0 ? { ...changed, streams: changed.streams.map(stream => ({ ...stream, receiptLag: lag })) } : changed,
        foundation,
        lines.map(line => dearer(line, 1 + costs / 100)),
        legalEntity,
        format
    );
    const low = result.revenueTimeline.reduce(
        (lowest, month) => month.balance < lowest.balance ? month : lowest,
        { balance: Infinity, label: "" } as Pick<CashMonth, "balance" | "label">);
    const lowest = Number.isFinite(low.balance) ? low.balance : 0;
    return {
        breakEvenMonth: result.breakEvenMonth,
        exhaustionMonth: result.exhaustionMonth,
        lowest,
        lowestLabel: low.label,
        shortfall: Math.max(0, -lowest)
    };
}

export function stressTest(
    page: FinancialSustainabilityValue,
    foundation: FinancialFoundationValue,
    lines: CostLine[],
    legalEntity: LegalEntityValue,
    format: (amount: number) => string
): StressTest {

    // The funding being sought, as if it arrived as planned.
    const { sought, foundation: withSought } = withFundingSought(foundation);

    const scenarios = STRESS_CASES.map(test => ({
        id: test.id,
        label: test.label,
        ...planCase(page, withSought, lines, legalEntity, format, test.change, test.costs, test.lag)
    }));

    return { sought, scenarios };

}

/* ==========================================================
   Page 5 -- what it would take
========================================================== */

/*
    WHAT IT WOULD TAKE: the smallest single change that keeps the cash
    at zero or above through the plan, each on its own with everything
    else as planned, on the stress test's footing (the funding being
    sought counted). Where the plan already holds, the same search
    says how much room it has.

    Each answer is found by halving the range until it is known to a
    whole percent or month: more of a lever never makes the cash worse,
    so the smallest change that works is where it starts to.
*/

export interface WhatItWouldTake {
    sought: number;
    /** The plan as it stands holds: no change is needed. */
    holds: boolean;
    /** Money still needed, and the month the cash first falls short. */
    shortfall: number;
    shortBy: string;
    /** Each lever on its own, in percent or months; null when no change within reach would do. */
    prices: number | null;
    sales: number | null;
    costs: number | null;
    earlier: number | null;
    /** Where the plan holds: how far each could go against it. */
    room: { sales: number; later: number; costs: number } | null;
}

/** The smallest whole step in [low, high] for which works() is true; null if none. */
function smallest(low: number, high: number, works: (value: number) => boolean): number | null {
    if (!works(high)) {
        return null;
    }
    let bad = low;
    let good = high;
    while (good - bad > 1) {
        const middle = Math.floor((bad + good) / 2);
        if (works(middle)) {
            good = middle;
        } else {
            bad = middle;
        }
    }
    return good;
}

export function whatItWouldTake(
    page: FinancialSustainabilityValue,
    foundation: FinancialFoundationValue,
    lines: CostLine[],
    legalEntity: LegalEntityValue,
    format: (amount: number) => string
): WhatItWouldTake {

    const { sought, foundation: withSought } = withFundingSought(foundation);
    const run = (change: Partial<WhatIf>, costs = 0) =>
        planCase(page, withSought, lines, legalEntity, format, { price: 0, volume: 0, delay: 0, ...change }, costs);
    const holdsWith = (change: Partial<WhatIf>, costs = 0) => run(change, costs).shortfall <= 0.5;

    const planned = run({});
    const holds = planned.shortfall <= 0.5;
    const hasRevenue = page.streams.length > 0;

    if (holds) {
        // How far each could go against the plan before the cash falls short.
        const give = (high: number, fails: (value: number) => boolean) => {
            const first = smallest(0, high, fails);
            return first === null ? high : Math.max(0, first - 1);
        };
        return {
            sought, holds, shortfall: 0, shortBy: "",
            prices: null, sales: null, costs: null, earlier: null,
            room: {
                sales: hasRevenue ? give(100, value => !holdsWith({ volume: -value })) : 0,
                later: hasRevenue ? give(24, value => !holdsWith({ delay: value })) : 0,
                costs: give(200, value => !holdsWith({}, value))
            }
        };
    }

    const firstShort = planned.exhaustionMonth;
    return {
        sought,
        holds,
        shortfall: planned.shortfall,
        shortBy: firstShort === null ? planned.lowestLabel : planMonthLabel(foundation.planStart, firstShort),
        prices: hasRevenue ? smallest(0, 300, value => holdsWith({ price: value })) : null,
        sales: hasRevenue ? smallest(0, 300, value => holdsWith({ volume: value })) : null,
        costs: smallest(0, 100, value => holdsWith({}, -value)),
        earlier: hasRevenue ? smallest(0, 12, value => holdsWith({ delay: -value })) : null,
        room: null
    };

}
