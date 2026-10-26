/**
 * THE LEGAL ENTITY page.
 * Split out of AnswerUtils.ts (still importable from there).
 */
import { parseAmount, parseDecimal } from "./Amounts.ts";
import { asText, randomId } from "./Readers.ts";
import { todayIsoDate } from "./AnswerProcess.ts";
import { isoDateText } from "./AnswerBusinessCapability.ts";

/* ==========================================================
   Legal Entity (see AnswerType.LegalEntity)

   One page, six subsections, each a different shape. The value is
   one object so the whole page saves and loads as a unit, and so a
   later subsection can read an earlier one -- an expense names the
   founder responsible for it, and links to a registration number or
   a legal requirement recorded further up.
========================================================== */

/** The six subsections, in the order the page asks them. */
export const LEGAL_ENTITY_SECTIONS = [
    "Organization",
    "Founders & Ownership",
    "Formation & Registration",
    "Tax & Business Registration",
    "Additional Legal Requirements",
    "Legal Entity Expenses"
] as const;

/** What the organization legally is, and where. */
/** One activity: a final code of the classification of the organization's country, and the edition of that classification. */
export interface LegalEntityActivityValue {
    code: string;
    edition: string;
}

export const MAX_ACTIVITIES = 4;

export interface LegalEntityOrganisationValue {
    name: string;
    /** ISO 3166-1 alpha-2, or "" -- see LegalEntityJurisdictions. */
    country: string;
    /**
     * The state, province, canton or emirate, for the four
     * countries where it changes the answers. "" everywhere else,
     * where the question is never asked.
     */
    subdivision: string;

    /** A label from the country's own list, or "" when named below. */
    legalForm: string;
    /**
     * Typed instead of chosen. The brief is explicit that a legal
     * form must never be prescribed, so the list is an offer and
     * this is the way out of it -- including for every country the
     * app carries no list for.
     */
    legalFormOther: string;
    mainActivity: string;
    /**
     * The jurisdiction's own classification code, asked for only
     * where there is one to ask for.
     */
    activityCode: string;
    /**
     * The tick that asks for the code at all (as the consumption tax's
     * tick asks for its number). A page saved before it existed reads
     * as ticked when it already holds a code.
     */
    activityCodeOn: boolean;
    /** Up to four activities, the first the primary one: each the final code of the country's classification and the edition it is from. Levels and titles are looked up from the code. */
    activities: LegalEntityActivityValue[];
    /** (Legacy: the stage was once chosen here. It is now the Opening Date's: see BusinessStage.ts.) plan, launch, manage, grow, or "". */
    businessStage: string;
    /** The seller and buyer relationship (Early Positioning): the chosen ones of b2c, b2b, b2g, g2b; how many follows the business stage (one while planning). An older answer holds one id, or "both" (b2b and b2c). */
    customerType: string[];
    /** The market structure: single or multi (a multi-sided market, a platform), or "". */
    marketType: string;
    /** The audience: the chosen scales (solo, smb, mid, enterprise) for a business or public buyer and life stages (proxy, young, adult, senior) for a consumer. */
    audience: string[];
    /** The differentiation and outcome: the chosen ones of cost, convenience, compliance, premium. */
    outcome: string[];
    /** The End User, asked only when the audience is Proxy Buyers / Gifters (the buyer pays, someone else uses it): ids prefixed by their question, age:, rel:, decides:, wants: (see END_USER_WORDS). */
    endUser: string[];
    /*
     * The registered address, in parts.
     *
     * The Legal Entity brief asked for one whole field including
     * the country, on the grounds that address components differ
     * between countries. It was later asked for in parts instead,
     * which is what an address actually gets used as: a city is
     * searchable, a postal code is validatable, and a single blob
     * is neither. The country stays a separate question about
     * jurisdiction rather than a line of the address.
     */
    addressLine1: string;

    /**
     * No longer asked: the address is one box of as many lines as it
     * needs (addressLine1). A second line saved before is read into it,
     * on a line of its own, and this is always "" (see asLegalEntityValue).
     */
    addressLine2: string;

    /**
     * No longer asked: the City and the postal code are lines of the
     * one address (addressLine1). Saved ones are read into it, and
     * these are always "" (see asLegalEntityValue; addressCity reads
     * the city back where a sentence needs it).
     */
    city: string;

    postalCode: string;
}

export interface LegalEntityFounderValue {
    id: string;
    name: string;
    /** Percent, as typed. */
    ownership: string;
    capital: string;
    /**
     * LEGACY: asked here before the Founders Profile page asked it.
     * Read only to seed that page (see founderProfileOf); the Legal
     * Entity page no longer shows or writes it.
     */
    roles: string[];
    /**
     * LEGACY, as `roles`: a short bio, which seeds the Founders
     * Profile's Relevant Industry Experience.
     */
    experience: string;
}

/** A registration or tax number beyond the first. */
export interface LegalEntityNumberValue {
    id: string;
    /**
     * What this number is called here -- the brief refuses to invent
     * a country-specific field for each one, so the user names it.
     */
    label: string;
    number: string;
}

export interface LegalEntityFormationValue {
    /**
     * "planned": not registered yet, the form and place chosen but no
     * date or numbers to give. "" (or "registered"): registered.
     */
    status: "" | "registered" | "planned";
    /** ISO yyyy-mm-dd, as an input[type=date] stores it. */
    date: string;
    authority: string;
    registrationNumber: string;
    additionalNumbers: LegalEntityNumberValue[];
}

/** Whether the organization is registered for the consumption tax. */
export type LegalEntityTaxStatus = "" | "yes" | "no" | "not-applicable";

export interface LegalEntityTaxValue {
    identificationNumber: string;
    consumptionTaxStatus: LegalEntityTaxStatus;
    consumptionTaxNumber: string;
    additionalRegistrations: LegalEntityNumberValue[];
}

export interface LegalEntityRequirementValue {
    id: string;
    /** An id from LEGAL_REQUIREMENT_TYPES. */
    type: string;
    name: string;
    reference: string;
    notes: string;
    /**
     * "Add to Legal Entity Expenses": whether 6.'s expenses are offered
     * this requirement in their Links. Saved before it was asked: ticked
     * where an expense already links to it.
     */
    offerInExpenses: boolean;
}

export interface LegalEntityExpenseValue {
    id: string;
    name: string;
    /** The date of the expense (an ISO date), straight after the name: it places the cost in a month of the cash flow. */
    date: string;
    /** A founder id, so renaming a founder renames this too. */
    responsibility: string;
    /** The Responsible tick, unticked: no responsible by choice (absent = ticked), as on every card. */
    responsibleOff?: boolean;
    cost: string;
    /** One of LEGAL_ENTITY_EXPENSE_FREQUENCIES. */
    frequency: string;
    /**
     * Ids of what this expense is for -- a registration number or a
     * legal requirement recorded above. Ids rather than typed
     * references, so a link cannot go stale while its target is
     * renamed, and cannot point at something that was deleted.
     * Exactly one: every expense pays for one registration or requirement
     * (a saved answer with several keeps its first).
     */
    links: string[];
    description: string;
    /** The id of the requirement that made this expense ("Add to Legal Entity Expenses"), or "": such an expense is named and linked by its requirement. */
    fromRequirement: string;
}

export interface LegalEntityValue {
    organisation: LegalEntityOrganisationValue;
    /**
     * Whether the founder table asks about capital. Defaults from
     * the chosen legal form and is then the user's to set -- the
     * brief is clear that capital is not universal, and equally
     * clear that the app must not decide it for them.
     */
    capitalApplies: boolean;
    founders: LegalEntityFounderValue[];
    formation: LegalEntityFormationValue;
    tax: LegalEntityTaxValue;
    requirements: LegalEntityRequirementValue[];
    expenses: LegalEntityExpenseValue[];
}


export function createLegalEntityFounder(): LegalEntityFounderValue {
    return { id: randomId("founder"), name: "", ownership: "", capital: "", roles: [""], experience: "" };
}

export function createLegalEntityNumber(): LegalEntityNumberValue {
    return { id: randomId("number"), label: "", number: "" };
}

/** The legal forms that have no company registry (a sole trader is known to the tax office, not to a registry). */
export const NO_REGISTRY_FORM = /sole (trader|proprietor)|self-employed|freelance/i;

/**
 * WHETHER THE ORGANIZATION IS REGISTERED, worked out and never chosen: a registration number is the proof, so a number says registered and none says not yet.
 * A form with no company registry has none to show: it counts as registered once it has a date.
 */
export function formationStatusOf(legalForm: string, registrationNumber: string, date: string): "planned" | "registered" {
    if (registrationNumber.trim().length > 0) {
        return "registered";
    }
    return NO_REGISTRY_FORM.test(legalForm) && date.trim().length > 0 ? "registered" : "planned";
}

export function createLegalEntityRequirement(): LegalEntityRequirementValue {
    return { id: randomId("requirement"), type: "", name: "", reference: "", notes: "", offerInExpenses: false };
}

export function createLegalEntityExpense(): LegalEntityExpenseValue {
    return {
        id: randomId("expense"),
        name: "",
        date: todayIsoDate(),
        responsibility: "",
        cost: "",
        frequency: "",
        links: [],
        description: "",
        fromRequirement: ""
    };
}

export function legalEntityNumberList(value: unknown): LegalEntityNumberValue[] {

    return (Array.isArray(value) ? value : []).map(entry => {

        const row = entry && typeof entry === "object" && !Array.isArray(entry)
            ? entry as Record<string, unknown>
            : {};

        return {
            id: asText(row.id) || randomId("number"),
            label: asText(row.label),
            number: asText(row.number)
        };

    });

}

/** A choice saved as one id (an older answer) or as a list of ids: always a list, without empty entries. */
function asChoices(value: unknown): string[] {
    const list = Array.isArray(value) ? value : [value];
    return list.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0).map(entry => entry.trim());
}

export function asLegalEntityValue(value: unknown): LegalEntityValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    const organisationSource =
        source.organisation && typeof source.organisation === "object"
            ? source.organisation as Record<string, unknown>
            : {};

    const formationSource =
        source.formation && typeof source.formation === "object"
            ? source.formation as Record<string, unknown>
            : {};

    const taxSource =
        source.tax && typeof source.tax === "object"
            ? source.tax as Record<string, unknown>
            : {};

    const founders = (Array.isArray(source.founders) ? source.founders : []).map(entry => {

        const row = entry && typeof entry === "object" && !Array.isArray(entry)
            ? entry as Record<string, unknown>
            : {};

        return {
            id: asText(row.id) || randomId("founder"),
            name: asText(row.name),
            ownership: asText(row.ownership),
            capital: asText(row.capital),
            /* Legacy, kept for the Founders Profile to seed from (see
               founderProfileOf). A list, and one line of text before
               that: what was typed into the single box is kept, as
               the first role. */
            roles: Array.isArray(row.roles) && row.roles.length > 0
                ? row.roles.map(asText)
                : [asText(row.role)],
            // Asked for later: a founder saved before it has none.
            experience: asText(row.experience)
        };

    });

    // What the expenses link to, for a requirement saved before it said
    // whether it is offered to them.
    const linkedIds = new Set((Array.isArray(source.expenses) ? source.expenses : []).flatMap(entry =>
        entry && typeof entry === "object" && Array.isArray((entry as Record<string, unknown>).links)
            ? ((entry as Record<string, unknown>).links as unknown[]).map(asText)
            : []));

    const requirements = (Array.isArray(source.requirements) ? source.requirements : []).map(entry => {

        const row = entry && typeof entry === "object" && !Array.isArray(entry)
            ? entry as Record<string, unknown>
            : {};

        const id = asText(row.id) || randomId("requirement");

        return {
            id,
            type: asText(row.type),
            name: asText(row.name),
            reference: asText(row.reference),
            notes: asText(row.notes),
            offerInExpenses: typeof row.offerInExpenses === "boolean" ? row.offerInExpenses : linkedIds.has(id)
        };

    });

    const expenses = (Array.isArray(source.expenses) ? source.expenses : []).map(entry => {

        const row = entry && typeof entry === "object" && !Array.isArray(entry)
            ? entry as Record<string, unknown>
            : {};

        return {
            id: asText(row.id) || randomId("expense"),
            name: asText(row.name),
            date: isoDateText(row.date),
            responsibility: asText(row.responsibility),
            ...(row.responsibleOff === true ? { responsibleOff: true } : {}),
            cost: asText(row.cost),
            frequency: asText(row.frequency),
            // (One registration only: an earlier answer's several keep the first.)
            links: (Array.isArray(row.links) ? row.links : []).map(asText).filter(Boolean).slice(0, 1),
            description: asText(row.description),
            fromRequirement: asText(row.fromRequirement)
        };

    });

    const status = asText(taxSource.consumptionTaxStatus);

    return {

        organisation: {
            name: asText(organisationSource.name),
            country: asText(organisationSource.country),
            subdivision: asText(organisationSource.subdivision),
            legalForm: asText(organisationSource.legalForm),
            legalFormOther: asText(organisationSource.legalFormOther),
            mainActivity: asText(organisationSource.mainActivity),
            activityCode: asText(organisationSource.activityCode),
            activityCodeOn: typeof organisationSource.activityCodeOn === "boolean"
                ? organisationSource.activityCodeOn
                : asText(organisationSource.activityCode).trim().length > 0,
            activities: (Array.isArray(organisationSource.activities) ? organisationSource.activities : [])
                .map((entry): LegalEntityActivityValue | null => entry && typeof entry === "object" ? { code: asText((entry as Record<string, unknown>).code).trim(), edition: asText((entry as Record<string, unknown>).edition) } : null)
                .filter((entry): entry is LegalEntityActivityValue => entry !== null && entry.code.length > 0)
                .slice(0, MAX_ACTIVITIES),
            businessStage: asText(organisationSource.businessStage),
            customerType: asChoices(organisationSource.customerType).flatMap(id => id === "both" ? ["b2b", "b2c"] : [id]),
            marketType: asText(organisationSource.marketType),
            audience: asChoices(organisationSource.audience),
            outcome: asChoices(organisationSource.outcome),
            endUser: asChoices(organisationSource.endUser),

            // A page saved while the address was one field keeps
            // what was written in it: the whole thing lands on the
            // first line, which is the only part of it we can know
            // is right.
            // ONE ADDRESS, ONE BOX: the street lines saved before
            // (Address 1, Address 2), then the City, then the postal
            // code, one per line, so nothing saved is lost.
            addressLine1: [
                asText(organisationSource.addressLine1) || asText(organisationSource.address),
                asText(organisationSource.addressLine2),
                asText(organisationSource.city),
                asText(organisationSource.postalCode)
            ].filter(line => line.trim().length > 0).join("\n"),
            addressLine2: "",
            city: "",
            postalCode: ""
        },

        capitalApplies: source.capitalApplies === true,

        // One row from the start: an organization has at least one
        // founder, and an empty table reads as broken rather than as
        // "nobody yet".
        founders: founders.length > 0 ? founders : [createLegalEntityFounder()],

        formation: {
            // (Never chosen: a company with a registration number is registered, one without is not yet.)
            status: formationStatusOf(asText(organisationSource.legalForm), asText(formationSource.registrationNumber), asText(formationSource.date)),
            date: asText(formationSource.date),
            authority: asText(formationSource.authority),
            registrationNumber: asText(formationSource.registrationNumber),
            additionalNumbers: legalEntityNumberList(formationSource.additionalNumbers)
        },

        tax: {
            identificationNumber: asText(taxSource.identificationNumber),
            // The tick is the answer: ticked, registered; unticked, not
            // (or not applicable). A "not applicable" saved while the page
            // asked it separately is read as not registered.
            consumptionTaxStatus:
                status === "yes" || status === "no"
                    ? status
                    : status === "not-applicable" ? "no" : "",
            consumptionTaxNumber: asText(taxSource.consumptionTaxNumber),
            additionalRegistrations: legalEntityNumberList(taxSource.additionalRegistrations)
        },

        // (A "Not applicable" tick saved by an earlier version is
        // simply not read: an empty list says the same.)
        requirements,

        expenses

    };

}

/** The founders' ownership percentages, added up. */
export function legalEntityTotalOwnership(value: LegalEntityValue): number {

    return value.founders.reduce((total, founder) => {
        // Each share within 0 to 100%, for answers saved before the limit.
        return total + Math.min(100, Math.max(0, parseDecimal(founder.ownership.replace("%", "")) ?? 0));
    }, 0);

}

/** The founders' capital contributions, added up. */
export function legalEntityTotalCapital(value: LegalEntityValue): number {

    return value.founders.reduce((total, founder) => {
        // Read as the financial pages read it: "10,000" is ten thousand.
        // A negative contribution counts as none.
        return total + Math.max(0, parseAmount(founder.capital) ?? 0);
    }, 0);

}

/**
 * Which of the six subsections have nothing in them yet -- what the
 * completeness dialog lists, and what isAnswerEmpty adds up.
 *
 * The last two are deliberately NOT counted. Additional Legal
 * Requirements and Expenses are open lists that a great many
 * organizations correctly leave empty, and a page that can never be
 * finished is a page that stops meaning anything.
 */
/**
 * The City, read back out of the one address where a sentence names it
 * ("based in London"): the line before a last line that is a postal
 * code (short, with a digit), as the address box's placeholder asks
 * the lines to be written. "" where that cannot be told.
 */
export function addressCity(address: string): string {
    const lines = address.split("\n").map(line => line.trim()).filter(Boolean);
    if (lines.length < 3) {
        return "";
    }
    const last = lines[lines.length - 1];
    return /\d/.test(last) && last.length <= 12 ? lines[lines.length - 2] : "";
}

export function legalEntitySectionsEmpty(value: unknown): boolean[] {

    const entity = asLegalEntityValue(value);
    const organisation = entity.organisation;

    const organisationEmpty =
        organisation.name.trim().length === 0 ||
        organisation.country.trim().length === 0 ||
        (organisation.legalForm.trim().length === 0 &&
            organisation.legalFormOther.trim().length === 0) ||
        organisation.mainActivity.trim().length === 0 ||
        organisation.addressLine1.trim().length === 0;

    const foundersEmpty = !entity.founders.some(
        founder => founder.name.trim().length > 0
    );

    // Not registered yet: there is no date or number to give, only
    // where it will be registered.
    const planned = entity.formation.status === "planned";
    const formationEmpty = planned
        ? entity.formation.authority.trim().length === 0
        : entity.formation.date.trim().length === 0 ||
            entity.formation.authority.trim().length === 0 ||
            entity.formation.registrationNumber.trim().length === 0;

    // The consumption tax is a tick now, and an unticked box is a
    // complete answer -- so what is left to ask for is the number
    // the organization is identified by, and the registration
    // number whenever the box IS ticked.
    const taxEmpty = !planned && (
        entity.tax.identificationNumber.trim().length === 0 ||
        (entity.tax.consumptionTaxStatus === "yes" &&
            entity.tax.consumptionTaxNumber.trim().length === 0));

    return [organisationEmpty, foundersEmpty, formationEmpty, taxEmpty, false, false];

}
