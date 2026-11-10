/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

/* ==========================================================
   Page 4 -- the lists it chooses from
========================================================== */

export const COST_GROUPS = [
    {
        id: "establishment",
        label: "Establishment",
        explanation: "Costs required to establish or launch the organisation."
    },
    {
        id: "operating",
        label: "Operating",
        explanation: "Ongoing costs that keep the organisation functioning, independently of any one Offering."
    },
    {
        id: "offering",
        label: "Offering",
        explanation: "Costs of creating, delivering or supporting a particular Offering."
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
    { id: "usage-based", label: "% of Rev" },
    { id: "other", label: "Other" }
] as const;

export type CostFrequency = typeof COST_FREQUENCIES[number]["id"];

/** Frequencies with a place in the calendar. */
export const SCHEDULED_FREQUENCIES: readonly CostFrequency[] =
    ["one-time", "monthly", "quarterly", "annually"];

/** Frequencies paid per unit of activity: a variable cost per unit. */
export const PER_UNIT_FREQUENCIES: readonly CostFrequency[] = ["per-project", "per-unit", "per-order"];

/**
 * The four needs, named and ordered as the four cost groups they
 * are made of (Establishment, Operating, Offering, Other), so a cost
 * and the need it lands in always carry the same name.
 */
export const FUNDING_NEED_CATEGORIES = [
    {
        id: "establishment",
        label: "Establishment",
        explanation: "Money required to establish and launch the organisation."
    },
    {
        id: "initial-operating",
        label: "Operating",
        explanation: "Money required to support operations before revenue becomes sufficient: the running costs, only until revenue covers them.",
        alsoCalled: "Lenders also call this working capital."
    },
    {
        id: "offering-launch",
        label: "Offering",
        explanation: "Money required to develop, prepare or launch an Offering before it can generate sufficient revenue."
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
    { id: "existing-funds", label: "Existing Organisational Funds", category: "internal", nature: "capital" },

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
    { id: "planned", label: "Planned", explanation: "Identified, waiting to be pursued." },
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

export function periodMonths(frequency: PeriodFrequency): number {
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
