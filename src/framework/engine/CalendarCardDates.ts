import {
    BusinessCapabilityValue,
    LegalEntityValue,
    paymentPlanLines
} from "./AnswerUtils.ts";

/**
 * THE DATES OF THE CARDS, for the Organization Calendar: every date a card holds, with what it is and whose it is. The Calendar shows them all, and filters them by the
 * KIND of the date (a funnel): the recommended ones are those that call for something to be done on or by the day -- a launch, a contract that ends, a warranty that
 * runs out, an instalment that falls due, a registration fee that comes again.
 */
export type CardDateKind =
    | "opening"
    | "formation"
    | "legal-expense"
    | "start"
    | "end"
    | "warranty"
    | "payment"
    | "activity-start"
    | "activity-end"
    | "founder-start";

/** The kinds, in the order the funnel lists them, each with the words it is known by and whether it is among the recommended ones. */
export const CARD_DATE_KINDS: readonly { id: CardDateKind; label: string; recommended: boolean }[] = [
    { id: "opening", label: "Opening Date", recommended: true },
    { id: "warranty", label: "Warranty ends", recommended: true },
    { id: "payment", label: "Payment due", recommended: true },
    { id: "end", label: "Contract or supply ends", recommended: true },
    { id: "activity-end", label: "Activity deadline", recommended: true },
    { id: "legal-expense", label: "Legal fee", recommended: true },
    { id: "start", label: "Starts (resources, partners, suppliers)", recommended: true },
    { id: "activity-start", label: "Activity starts", recommended: false },
    { id: "founder-start", label: "Founder starts", recommended: false },
    { id: "formation", label: "Formation", recommended: false }
];

export interface CardDate {
    /** Stable: the card's id and the kind. */
    key: string;
    /** ISO "YYYY-MM-DD". */
    date: string;
    kind: CardDateKind;
    /** "Resource", "Activity", "Partner", "Supplier", "Workspace", "Founder", "Expense", "Organization". */
    noun: string;
    /** The card's name. */
    name: string;
    /** What the date is: "Starts", "Ends", "Warranty until", "Payment 2". */
    label: string;
}

const named = (name: string, fallback: string) => name.trim() || fallback;

/** Every date of the Infrastructure & Capability page's cards. */
export function capabilityCardDates(capability: BusinessCapabilityValue, legalExpenses: LegalEntityValue["expenses"] = []): CardDate[] {
    const dates: CardDate[] = [];
    const add = (id: string, date: string, kind: CardDateKind, noun: string, name: string, label: string) => {
        if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            dates.push({ key: id + ":" + kind + ":" + label, date, kind, noun, name, label });
        }
    };

    const resources = [
        ...Object.values(capability.resources).flat().flatMap(subsection => subsection.slots),
        ...capability.offering.resources
    ];
    for (const slot of resources) {
        const name = named(slot.name, "Unnamed resource");
        add(slot.id, slot.startDate, "start", "Resource", name, "Starts");
        add(slot.id, slot.endDate, "end", "Resource", name, "Ends");
        add(slot.id, slot.warrantyUntil, "warranty", "Resource", name, "Warranty until");
        if (slot.paymentPlan.on) {
            paymentPlanLines(slot.paymentPlan, slot.startDate, slot.endDate).forEach((line, at) => add(slot.id, line.date, "payment", "Resource", name, "Payment " + (at + 1)));
        }
    }
    const partners = [...capability.professionals, ...capability.providers, ...capability.offering.professionals, ...capability.offering.providers];
    for (const partner of partners) {
        const noun = partner.category === "suppliers" ? "Supplier" : "Partner";
        const name = named(partner.name, "Unnamed " + noun.toLowerCase());
        add(partner.id, partner.startDate, "start", noun, name, "Starts");
        add(partner.id, partner.endDate, "end", noun, name, "Ends");
        if (partner.paymentPlan.on) {
            paymentPlanLines(partner.paymentPlan, partner.startDate, partner.endDate).forEach((line, at) => add(partner.id, line.date, "payment", noun, name, "Payment " + (at + 1)));
        }
    }

    const activities = [...capability.activities.flatMap(category => category.activities), ...capability.offering.activities];
    for (const activity of activities) {
        const name = named(activity.name, "Unnamed activity");
        add(activity.id, activity.startDate, "activity-start", "Activity", name, "Starts");
        add(activity.id, activity.endDate, "activity-end", "Activity", name, "Deadline");
    }

    for (const founder of capability.founders) {
        add(founder.id, founder.startDate, "founder-start", "Founder", named(founder.name, "Founder"), "Starts");
    }

    for (const expense of legalExpenses) {
        add(expense.id, expense.date, "legal-expense", "Expense", named(expense.name, "Unnamed expense"), "Fee due");
    }

    return dates;
}

/** The dates of the Legal Entity page: the formation (its own date) and each expense. */
export function legalEntityCardDates(entity: LegalEntityValue): CardDate[] {
    const dates: CardDate[] = [];
    const formation = entity.formation.date;
    if (formation && /^\d{4}-\d{2}-\d{2}$/.test(formation)) {
        dates.push({ key: "formation:formation", date: formation, kind: "formation", noun: "Organization", name: entity.organisation.name.trim() || "Organization", label: "Formed" });
    }
    for (const expense of entity.expenses) {
        if (expense.date && /^\d{4}-\d{2}-\d{2}$/.test(expense.date)) {
            dates.push({ key: expense.id + ":legal-expense:Fee due", date: expense.date, kind: "legal-expense", noun: "Expense", name: named(expense.name, "Unnamed expense"), label: "Fee due" });
        }
    }
    return dates;
}

/** The Opening Date (Global Settings). */
export function openingCardDate(openingDate: string): CardDate[] {
    return openingDate && /^\d{4}-\d{2}-\d{2}$/.test(openingDate)
        ? [{ key: "opening:opening", date: openingDate, kind: "opening", noun: "Organization", name: "Opening Date", label: "Opens" }]
        : [];
}
