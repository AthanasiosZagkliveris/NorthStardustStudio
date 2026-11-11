/* Part of FinancialFoundationEditor.tsx (moved out as it was, 2026-11-11: the owner, "can you do them all?"; FinancialFoundationEditor.tsx imports it). */

import { type FundingCategory } from "../../../framework/engine/FinancialModel.ts";
import { paletteHueNamed } from "../../../framework/engine/Palette.ts";
import { type InfoPoint } from "../fields/InfoNote.tsx";
import { SOURCES } from "../../../framework/engine/Sources.ts";

/* ==========================================================
   What the page says
========================================================== */

export const explain = (list: readonly { label: string; explanation: string }[]): InfoPoint[] =>
    list.map(entry => ({ title: entry.label, text: entry.explanation }));

/** The distinctions the specification asks the "i" controls to make. */
export const DEFINITIONS = {
    cost: { title: "Cost", text: "Money the organisation needs to spend." },
    need: { title: "Funding Need", text: "Money the organisation needs to obtain to support its financial requirements." },
    capital: { title: "Capital", text: "Money contributed to the organisation, particularly by founders or investors." },
    funding: { title: "Funding", text: "Financial resources provided by another source to support the organisation." },
    loan: { title: "Loan", text: "Borrowed money that creates a repayment obligation." },
    revenue: { title: "Revenue", text: "Money generated through the organisation's Offerings. Capital and funding are not revenue." },
    gap: { title: "Funding Gap", text: "The amount of identified financial requirement not covered by available or confirmed financing." },
    runway: { title: "Financial Runway", text: "The estimated period for which available financial resources can support the organisation under current assumptions." }
};

/** The loan payment formula, the "i" beside the repayment figure. */
export const LOAN_PAYMENT_HELP: InfoPoint[] = [
    {
        title: "Formula",
        text: "Payment = P × r ÷ (1 − (1 + r)^−n) (annuity); equal-principal: P ÷ n plus interest"
    },
    "A fixed payment that covers interest and repays the loan over n periods; r is the interest rate for one period (for monthly payments, the monthly rate).",
    { title: "Source", source: SOURCES.loanRepayment }
];

/** The interest-only months before the first repayment, its "i". */
export const LOAN_PRE_INTEREST_HELP: InfoPoint[] = [
    { title: "Formula", text: "Interest = Principal × Rate × Time" },
    "Interest on the amount borrowed only, without compounding.",
    { title: "Source", source: SOURCES.simpleInterest }
];

/** The funding gap formula, added to that figure's own info. */
export const FUNDING_GAP_FORMULA: InfoPoint = {
    title: "Formula",
    text: "Funding gap = Funding needed − Funding available and confirmed"
};

/** The runway formula, added to that figure's own info. */
export const RUNWAY_FORMULA: InfoPoint = {
    title: "Formula",
    text: "Runway = Cash ÷ Monthly net burn (here: the first month the projected balance goes below zero)"
};

export const RUNWAY_SOURCE: InfoPoint = { title: "Based on", source: SOURCES.cashRunway };

export const SECTIONS = {
    costs: {
        title: "Costs",
        instructions: [
            "Review the costs gathered from the Legal Entity and Infrastructure & Capability.",
            "Each cost is grouped by what it supports, how it behaves, and when it is paid; to change one, change it where it was recorded."
        ],
        info: [
            DEFINITIONS.cost,
            "Cost Group says what a cost supports; Behaviour says how it changes with activity; Frequency says when it is paid. They are three different things."
        ] as InfoPoint[]
    },
    need: {
        title: "Funding Need",
        instructions: [
            "Check what has to be financed, calculated from the costs: how much, for what purpose, and when."
        ],
        info: [
            DEFINITIONS.need,
            "A need can be one amount by one date, or several amounts over time."
        ] as InfoPoint[]
    },
    funding: {
        title: "Capital & Funding",
        instructions: [
            "Identify where the money will come from, how certain it is, and when it arrives.",
            "Record what each source obliges: repayments, equity or conditions."
        ],
        info: [
            DEFINITIONS.capital,
            DEFINITIONS.funding,
            DEFINITIONS.loan,
            DEFINITIONS.revenue,
            "Expected, confirmed and available money are different: only money that has arrived counts as money the organisation has."
        ] as InfoPoint[]
    },
    position: {
        title: "Financial Position",
        instructions: [
            "Read the financial picture calculated from Costs, Funding Need and Capital & Funding: is your organisation covered, and for how long?"
        ],
        info: [
            DEFINITIONS.gap,
            DEFINITIONS.runway,
            "Every figure here is an estimate based on the information entered, not financial advice."
        ] as InfoPoint[]
    }
};

/**
 * Each section's own palette colour, as every card on the earlier
 * Business pages has one: rose, periwinkle, sage, sky -- no two
 * neighbours close on the wheel, so none read alike. Fixed rather than
 * hashed from the id, because these four never change and a hash
 * can land two of them side by side.
 */
export const SECTION_HUES: Record<string, number> = {
    "financial-costs": paletteHueNamed("rose"),
    "financial-need": paletteHueNamed("periwinkle"),
    "financial-funding": paletteHueNamed("sage"),
    "financial-position": paletteHueNamed("sky")
};

export const CATEGORY_INFO: Record<FundingCategory, InfoPoint[]> = {
    internal: ["Money from inside your organisation: its founders' capital, reinvested revenue or funds it already holds."],
    external: [
        { title: "Non-repayable", text: "Grants, subsidies and awards: nothing to repay, though often with conditions." },
        { title: "Equity", text: "Investment in exchange for a share of ownership." },
        { title: "Debt", text: "Loans and credit that must be repaid, with interest." }
    ],
    other: ["Reward crowdfunding, friends & family, in-kind contributions and other arrangements."]
};
