/*
    CHAINED ANSWERS: an answer that depends on another waits for it.
    Someone who does not yet know the country to register in does not
    know the city either -- so a dependent field is FROZEN (shown
    disabled, with "Choose a country first." in its status line) until
    the answer it depends on is given. What a frozen field already holds
    is kept, and shows again once the parent is answered; where the new
    parent answer makes it invalid (a state of another country), the
    page's own rule for that answer applies, as before.

    This list is the one record of the chains. `frozen` chains are
    enforced where their fields are drawn (FrozenUntil, fieldMarks.tsx);
    `conditional` ones need nothing more, because the dependent fields
    are not drawn at all until the parent is answered.
*/

export interface FieldDependency {
    id: string;
    systemNumber: number;
    /** The answer depended on, as its page names it. */
    parent: string;
    /** What waits for it, as the page names them. */
    dependents: string[];
    /** Frozen until answered, or not drawn until answered. */
    how: "frozen" | "conditional";
    /** The status-line hint on a frozen dependent. */
    hint?: string;
}

export const FIELD_DEPENDENCIES: readonly FieldDependency[] = [
    {
        id: "legal-country",
        systemNumber: 1,
        parent: "Legal Entity › Organization › Country",
        dependents: ["State / Region (where the country has them)", "City", "Address", "Postcode / ZIP", "Legal Form", "Formation & Registration › Registration Authority"],
        how: "frozen",
        hint: "Choose a country first."
    },
    {
        id: "legal-subdivision",
        systemNumber: 1,
        parent: "Legal Entity › Organization › State / Region (where the country has them)",
        dependents: ["City", "Address", "Postcode / ZIP", "Formation & Registration › Registration Authority"],
        how: "frozen"
    },
    {
        id: "legal-form",
        systemNumber: 1,
        parent: "Legal Entity › Organization › Legal Form",
        dependents: ["Name the legal form (Other)", "the founders' Capital (whether it applies follows the form)"],
        how: "conditional"
    },
    {
        id: "legal-status",
        systemNumber: 1,
        parent: "Legal Entity › Formation & Registration › Status (Registered)",
        dependents: ["Formation Date", "Registration Number", "extra registration numbers", "Tax Identification Number", "sales-tax registration"],
        how: "conditional"
    },
    {
        id: "funding-type",
        systemNumber: 3,
        parent: "Financial Foundation › a funding source's Funding Type",
        dependents: ["loan terms (Lender, Principal, Interest, Loan Start, Repayments)", "equity terms (Investor, Ownership / Equity)"],
        how: "conditional"
    },
    {
        id: "funding-schedule",
        systemNumber: 3,
        parent: "Financial Foundation › a funding source's Funding Schedule",
        dependents: ["Amount per Period and its frequency", "Milestones"],
        how: "conditional"
    },
    {
        id: "metric-unit",
        systemNumber: 4,
        parent: "Goals & Objectives › a Metric's Unit (Currency)",
        dependents: ["the Metric's currency"],
        how: "conditional"
    }
];

/** A frozen chain's hint for its dependents: "Choose a country first." */
export function waitingHint(parent: string): string {
    const word = parent.trim().toLowerCase();
    return "Choose " + (/^[aeiou]/.test(word) ? "an " : "a ") + word + " first.";
}
