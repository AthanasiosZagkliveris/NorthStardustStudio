/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

import { parseAmount } from "../Amounts.ts";
import { asObject, asText, randomId } from "../Readers.ts";
import { type StrategyMonthValue } from "../AnswerUtils.ts";
import { COST_NATURES, type CostNature } from "./natures.ts";
import { COST_BEHAVIOURS, COST_FREQUENCIES, COST_GROUPS, FUNDING_CATEGORIES, FUNDING_NEED_CATEGORIES, FUNDING_SCHEDULES, FUNDING_STATUSES, LOAN_METHODS, PERIOD_FREQUENCIES, type CostBehaviour, type CostFrequency, type CostGroup, type FundingCategory, type FundingNeedCategory, type FundingScheduleKind, type FundingStatus, type LoanMethod, type PeriodFrequency } from "./lists.ts";
import { PLAN_YEAR_CHOICES, asList, asMonth, asTextList, oneOf } from "./period.ts";

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
    /** The cost nature the user chose in place of the rules' (it applies from the Opening Date only: rule C13). */
    nature?: CostNature | "";
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

interface FundingNeedValue {
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

interface LoanTermsValue {
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
interface FounderCapitalStanding {
    status: FundingStatus | "";
    month: StrategyMonthValue;
}

/**
 * Whether the amounts on both Financial pages include VAT (or the
 * local consumption tax). A registered business plans excluding it --
 * the tax it charges is not its revenue, and the tax it pays is
 * reclaimed -- while one that is not registered pays it as a cost.
 */
const VAT_BASES = [
    { id: "excluding", label: "Excluding VAT", explanation: "Registered for VAT: amounts are net. VAT charged is not revenue, and VAT paid is reclaimed." },
    { id: "including", label: "Including VAT", explanation: "Amounts are gross, as paid and charged." },
    { id: "not-registered", label: "Not VAT registered", explanation: "No VAT is charged; VAT paid on purchases is part of their cost." }
] as const;

export type VatBasis = typeof VAT_BASES[number]["id"];

/**
 * How income tax is estimated: the picker beside the VAT basis. A
 * required answer: until one is chosen ("") the forecast stays before
 * tax and says the basis is not chosen yet.
 */
export const INCOME_TAX_BASES = [
    { id: "pass-through", label: "No tax at business level" },
    { id: "rate", label: "Rate on profit" }
] as const;

export type IncomeTaxBasis = typeof INCOME_TAX_BASES[number]["id"] | "";

/** Whether income tax still needs an answer: no basis, or a rate on profit with no rate. */
export function incomeTaxMissing(value: FinancialFoundationValue): boolean {
    return value.incomeTax === "" || (value.incomeTax === "rate" && parseAmount(value.incomeTaxRate) === null);
}

/**
 * The income tax rate in force, as a fraction: null unless a rate on
 * profit is chosen AND a rate is given. A rate chosen and left blank
 * is not given yet, rather than taxed at nothing.
 */
export function incomeTaxRate(value: FinancialFoundationValue): number | null {
    const rate = value.incomeTax === "rate" ? parseAmount(value.incomeTaxRate) : null;
    return rate === null ? null : Math.min(100, Math.max(0, rate)) / 100;
}

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
    /**
     * Income tax on profit, for the forecast: "" is not chosen yet,
     * "pass-through" is none at business level (the owners pay it
     * personally), "rate" is incomeTaxRate percent of the profit.
     */
    incomeTax: IncomeTaxBasis;
    /** Percent, as typed; read only where incomeTax is "rate". */
    incomeTaxRate: string;
    /** Classification of the costs recorded elsewhere, by their id. */
    classified: Record<string, Partial<CostClassification>>;
    costs: OwnCostValue[];
    needs: FundingNeedValue[];
    funding: FundingSourceValue[];
    /** By Legal Entity founder id. */
    founderCapital: Record<string, FounderCapitalStanding>;
}

export const EMPTY_MONTH: StrategyMonthValue = { month: "", year: "" };

export function createOwnCost(group: CostGroup | "" = ""): OwnCostValue {
    return {
        id: randomId("cost"),
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

export function createMilestone() {
    return { id: randomId("milestone"), amount: "", month: { ...EMPTY_MONTH }, condition: "" };
}

export function createFundingSource(category: FundingCategory): FundingSourceValue {
    return {
        id: randomId("funding"),
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
    if ((COST_NATURES as readonly string[]).includes(source.nature as string)) {
        result.nature = source.nature as CostNature;
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

        // Asked for later: an answer saved before it is not chosen yet.
        incomeTax: oneOf(source.incomeTax, ["pass-through", "rate", ""] as const, ""),
        incomeTaxRate: asText(source.incomeTaxRate),

        classified,

        costs: asList(source.costs).map(entry => {
            const row = asObject(entry);
            return {
                id: asText(row.id) || randomId("cost"),
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
                id: asText(row.id) || randomId("need"),
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
                        id: asText(part.id) || randomId("when"),
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
                id: asText(row.id) || randomId("funding"),
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
                            id: asText(milestone.id) || randomId("milestone"),
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
