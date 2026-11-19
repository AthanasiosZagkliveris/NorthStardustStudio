import { PREMISES_GROUP_ID, WORKSPACE_GROUP_ID } from "./AnswerBusinessCapability.ts";
import { LEGAL_FEES_CHECKED } from "./LegalStarts.ts";
import { effectiveOfferingAnswers } from "./EffectiveAnswers.ts";
import { segmentIdentityOf, segmentIsBusiness } from "./SegmentContext.ts";
import { streamRevenue } from "./financial/revenue.ts";
import { planMonthLabel } from "./financial/period.ts";
import type { Foundation } from "./businessDocuments/reading.ts";

/*
    (Stage 3, decisions 3 and 4: an insurance premium is costed once, on its Insurance card in Infrastructure & Capability, and business rates with the premises;
    the suggestions say where. The Legal Entity keeps only the requirement.)

    THE LEGAL SUGGESTIONS, STAGE 2 (doc 53, section 6, decisions 1 (b) and (c), 5 and 6; the owner's delegation of 2026-11-19 19:48 UTC+2): what the law asks only
    past a threshold, or where an exemption may apply, is said on the Review, never made unseen -- each with its reason, the month it is required from where a
    forecast says it, and the official page that settles it. A suggestion the Legal Entity already answers (the tax registered, a requirement of that name) is not
    said. Also said: a fee whose official check is over 12 months old, and a United States state the app holds no rules for yet.
*/

export interface LegalSuggestion {
    /** The rule (doc 53): "GB8", "GB13", ... */
    rule: string;
    text: string;
    source: string;
}

/** Each country's consumption-tax threshold over 12 months, in its currency, and its tax's name (doc 53, section 2). Ireland's services figure; its goods figure where
    an Offering is a product. */
const THRESHOLDS: Readonly<Record<string, { name: string; amount: number; goods?: number; symbol: string; source: string }>> = {
    GB: { name: "VAT", amount: 90000, symbol: "£", source: "https://www.gov.uk/register-for-vat" },
    IE: { name: "VAT", amount: 42500, goods: 85000, symbol: "€", source: "https://www.revenue.ie/en/vat/vat-registration/who-should-register-for-vat/index.aspx" },
    CA: { name: "GST/HST", amount: 30000, symbol: "$", source: "https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/rc4022/general-information-gst-hst-registrants.html" },
    AU: { name: "GST", amount: 75000, symbol: "$", source: "https://business.gov.au/registrations/register-for-taxes/register-for-goods-and-services-tax-gst" },
    NZ: { name: "GST", amount: 60000, symbol: "$", source: "https://www.ird.govt.nz/gst/registering-for-gst" }
};

const money = (symbol: string, amount: number) => symbol + Math.round(amount).toLocaleString("en-GB");
const said = (f: Foundation, pattern: RegExp) => f.legalEntity.requirements.some(requirement => pattern.test(requirement.name))
    || f.legalEntity.tax.additionalRegistrations.some(row => pattern.test(row.label))
    || f.legalEntity.expenses.some(expense => pattern.test(expense.name));

/**
 * The month the forecast's turnover passes a threshold (decision 1 (b)): the last 12 months' (the backward test) or one month's alone (the forward test, the
 * next 30 days), whichever comes first; the index of that month, or null within the plan.
 */
export function thresholdMonth(earned: readonly number[], threshold: number): number | null {
    let rolling = 0;
    for (let index = 0; index < earned.length; index++) {
        rolling += earned[index] - (index >= 12 ? earned[index - 12] : 0);
        if (rolling > threshold || earned[index] > threshold) {
            return index;
        }
    }
    return null;
}

/** The legal suggestions for the Review (doc 53, stage 2). `today` dates the fees' check. */
export function legalSuggestions(f: Foundation, today: Date = new Date()): LegalSuggestion[] {
    const { country, subdivision, legalForm } = f.legalEntity.organisation;
    const out: LegalSuggestion[] = [];

    // (b) THE CONSUMPTION TAX at its threshold, from the forecast's monthly turnover; once registered, nothing is said.
    const threshold = THRESHOLDS[country];
    if (threshold && f.legalEntity.tax.consumptionTaxStatus !== "yes") {
        const identity = segmentIdentityOf(f.legalEntity.organisation, f.stage);
        const goods = f.segments.some(segment => segment.offerings.some(offering => (effectiveOfferingAnswers(offering, segment, identity).o1 ?? []).includes("physical")));
        const amount = goods && threshold.goods ? threshold.goods : threshold.amount;
        const earned = new Array<number>(120).fill(0);
        f.outlook.streams.forEach(entry => streamRevenue(entry.stream, f.financial.planStart).earned.forEach((value, index) => { earned[index] += value; }));
        const month = thresholdMonth(earned, amount);
        if (month !== null) {
            out.push({
                rule: country + "-tax",
                text: threshold.name + ": register once your turnover passes " + money(threshold.symbol, amount) + " in 12 months (or is expected to within the next 30 days). Your forecast passes it in "
                    + planMonthLabel(f.financial.planStart, month) + ": register within 30 days of it. Registering earlier, by choice, is possible too.",
                source: threshold.source
            });
        }
    }

    if (country === "GB") {
        // (c) THE DATA PROTECTION FEE, where customers' details are kept: a people Segment, or an Offering sold or delivered online; exempt only where the data serves
        // the business's own staff, marketing and accounts -- the ICO's self-assessment settles it.
        const online = f.segments.some(segment => !segmentIsBusiness(segment) || segment.offerings.some(offering => (offering.questions?.o6 ?? []).some(way => ["shipped", "auto", "byyou", "access"].includes(way))));
        if (online && !said(f, /\bICO\b|data protection/i)) {
            out.push({ rule: "GB13", text: "Data protection fee (ICO): a business that keeps its customers' details on a computer usually pays it each year (£52 at the smallest tier, £5 less by Direct Debit); one that keeps them only for its own staff, marketing and accounts is exempt. The ICO's self-assessment, on ico.org.uk, says which.", source: "https://www.gov.uk/government/consultations/data-protection-fee-regime-proposed-changes/outcome/data-protection-fee-regime-government-response" });
        }
        // (c) EMPLOYERS' LIABILITY INSURANCE, once someone is employed; family members, and an owner holding 50% or more, are exempt.
        const staff = f.capability.offering.resources.some(slot => slot.category === "hr") || (f.capability.resources["hr"] ?? []).some(subsection => subsection.slots.length > 0);
        if (staff && !said(f, /employers.? liability/i)) {
            out.push({ rule: "GB11", text: "Employers' liability insurance: required once you employ someone, at least £5 million of cover, its certificate on show; family members, and an owner holding 50% or more of the business, are exempt. Its premium is costed once, as an Insurance card on Infrastructure & Capability (Documents & Rights).", source: "https://www.gov.uk/employers-liability-insurance" });
        }
        // (c) BUSINESS RATES on premises of the business's own; small business rate relief takes them to nothing at a rateable value up to £12,000, tapering to £15,000.
        const premises = (f.capability.resources[WORKSPACE_GROUP_ID] ?? []).some(subsection => subsection.id === PREMISES_GROUP_ID && subsection.slots.length > 0);
        if (premises && !said(f, /business rates/i)) {
            out.push({ rule: "GB17", text: "Business rates: premises of the business's own pay them to the council; small business rate relief takes them to nothing at a rateable value up to £12,000, tapering to £15,000. Your council's bill says which; they are costed with the premises, on Infrastructure & Capability.", source: "https://www.gov.uk/introduction-to-business-rates" });
        }
    }

    // THE UNITED STATES OUTSIDE NEW YORK (decision 6): the federal items are made; the state's own wait for its rules.
    if (country === "US" && subdivision.trim() && !/^(NY|New York)$/i.test(subdivision) && legalForm.trim()) {
        out.push({ rule: "US-state", text: "Check your state's registration and tax rules: the app holds New York's for now, and the federal ones for every state.", source: "https://www.sba.gov/business-guide/launch-your-business/register-your-business" });
    }

    // A FEE WHOSE OFFICIAL CHECK IS OVER 12 MONTHS OLD (decision 5).
    const checked = new Date(LEGAL_FEES_CHECKED + "T00:00:00");
    if (f.legalEntity.expenses.some(expense => expense.rule) && today.getTime() - checked.getTime() > 365 * 24 * 3600 * 1000) {
        out.push({ rule: "fees", text: "The official fees were last checked on " + checked.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) + ": check them again on their official pages.", source: "" });
    }

    return out;
}
