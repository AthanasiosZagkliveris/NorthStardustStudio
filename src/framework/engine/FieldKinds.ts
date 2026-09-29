import type { FieldKind, FlagOffer, NoneReason } from "./FieldKeys";

/*
    WHAT EACH FIELD OFFERS BESIDE ITS ANSWER.

    THE FLAG ("Needs investigation") is offered ONLY on the fields
    whose answer is an outside fact to be found out -- the market and
    its customers, external figures, legal and tax requirements. They
    are named one by one, where they are drawn, with `flag` (on
    BusinessField, FieldFlagButton or a card), or by their address in
    FLAGGABLE below for the shared headings and labels that cannot be
    told apart at their call site. "Doesn't apply" is offered only on
    the three legal and tax items (FlagOffer
    "investigation-or-not-applicable"), where it counts as answered.
    Every other field has no flag, required or not.

    THE NOTE is offered on every answer the person gives (kind
    "answer"), and on nothing else (kind "none", NoneReason): worked
    out or read-only, a yes or a no, an optional text behind its tick
    box, a status, a choice with its own "not yet" option, a link to
    another item, a display setting, a card's name. The markup
    settles the first three (fieldAnnotations.tsx); NONE_LABELS the
    rest.

    THE LIST OF FLAGGABLE FIELDS (the report of record):

      1. Identity   Definition: Positioning. Legal Entity: Country,
                    Legal Form; the sales-tax registration (with
                    Doesn't apply); Additional Legal Requirements, the
                    section and each requirement (with Doesn't
                    apply); Legal Entity Expenses, the section and each
                    expense's cost (with Doesn't apply).
      3. Business   Foundation: each Segment's Demographics,
                    Geographics, Business Data, Purchasing Power &
                    Behaviour, Market Size & Industry Outlook; each
                    Profile's Psychographics, Information & Shopping
                    Habits, and its Functional, Emotional and Social
                    needs; each Competitor's Strengths, Weaknesses,
                    Opportunities, Threats and Insights &
                    Differentiation. Customer Engagement: each Demand &
                    Conversion figure. Infrastructure & Capability: the
                    fee of each External Professional & Partner and
                    Provider. Financial Foundation: each cost amount
                    entered there; Amounts (the tax basis); the income
                    Tax Rate; each funding source's amount and terms.
                    Sustainability: each Offering's Price and its
                    expected sales (Expected Sales, First Month).
      4. Strategy   Situation & Direction: SWOT Opportunities and
                    Threats. Goals & Objectives: each Metric's Baseline.
*/

/** Labels (as slugs) that never carry a flag or a note, wherever they are, and why. */
const NONE_LABELS: Record<string, NoneReason> = {
    // States: a Status says where a thing stands, whatever its options.
    "status": "status",
    "completed": "status",
    "done": "status",
    // A choice that holds its own "not yet" answer.
    "income-tax": "has-own-option",
    // Links between items: who or what another item points at.
    "performer": "link",
    "owner": "link",
    "responsibility": "link",
    "provider": "link",
    "linked-to": "link",
    "linked-funding-need": "link",
    // Display settings: how figures are shown, not what they are.
    "currency": "display",
    "unit": "display",
    "hours-per-week": "display",
    "hours-per-month": "display",
    "measurement-frequency": "display",
    // A card's own name: never flagged or noted apart from its card.
    "name": "name"
};

/**
 * Flaggable fields found by address -- System number, the section
 * (rail id), and the label slug (last segment; "*" ends a prefix;
 * absent for the section's own heading). Used where one shared
 * heading or label component draws fields that need telling apart.
 */
const FLAGGABLE: { system: number; section: string; label?: string; offer: FlagOffer }[] = [
    { system: 1, section: "positioning", offer: "investigation" },
    { system: 1, section: "organization", label: "country", offer: "investigation" },
    { system: 1, section: "organization", label: "legal-form", offer: "investigation" },
    { system: 1, section: "additional-legal-requirements", offer: "investigation-or-not-applicable" },
    { system: 1, section: "legal-entity-expenses", offer: "investigation-or-not-applicable" },
    { system: 1, section: "legal-entity-expenses", label: "cost*", offer: "investigation-or-not-applicable" },
    { system: 3, section: "capital-funding", label: "total-amount", offer: "investigation" },
    { system: 3, section: "capital-funding", label: "principal-amount", offer: "investigation" },
    { system: 3, section: "capital-funding", label: "interest-rate-a-year", offer: "investigation" },
    { system: 3, section: "capital-funding", label: "interest-type", offer: "investigation" },
    { system: 3, section: "capital-funding", label: "repayment-frequency", offer: "investigation" },
    { system: 3, section: "capital-funding", label: "number-of-payments", offer: "investigation" },
    { system: 3, section: "capital-funding", label: "repayment-method", offer: "investigation" },
    { system: 3, section: "capital-funding", label: "ownership-equity", offer: "investigation" },
    { system: 3, section: "revenue", label: "price", offer: "investigation" },
    { system: 3, section: "revenue", label: "expected-sales", offer: "investigation" },
    { system: 3, section: "revenue", label: "first-month", offer: "investigation" }
];

function matches(pattern: string, slug: string): boolean {
    return pattern.endsWith("*") ? slug.startsWith(pattern.slice(0, -1)) : pattern === slug;
}

/**
 * A field's kind from its address: `path` is its key's path (page
 * section, card, label slug -- or the section alone, for a section's
 * own heading; or section and card, for a card).
 */
export function fieldKindOf(_systemNumber: number, path: readonly string[], card = false): { kind: FieldKind; why?: NoneReason } {

    const section = path[0] ?? "";
    const label = card ? "" : path.length > 1 ? path[path.length - 1] : "";

    // A section that is one setting or one choice (Income Tax) is
    // named by its section id alone.
    const named = card ? "" : label || section;

    if (named && NONE_LABELS[named]) {
        return { kind: "none", why: NONE_LABELS[named] };
    }

    return { kind: "answer" };

}

/**
 * The flag a field offers by its address (FLAGGABLE), when it is not
 * named where it is drawn. Undefined: no flag.
 */
export function flagOfferOf(systemNumber: number, path: readonly string[], card = false): FlagOffer | undefined {
    const section = path[0] ?? "";
    const label = card ? "" : path.length > 1 ? path[path.length - 1] : "";
    return FLAGGABLE.find(entry => entry.system === systemNumber && entry.section === section &&
        (entry.label === undefined ? !label : !!label && matches(entry.label, label)))?.offer;
}

/** Whether a kind carries the note button. */
export function kindCanBeNoted(kind: FieldKind | undefined): boolean {
    return kind === "answer";
}

/** Whether a flag offer includes "Doesn't apply". */
export function offersNotApplicable(offer: FlagOffer | undefined): boolean {
    return offer === "investigation-or-not-applicable";
}
