import { ReactNode } from "react";
import { isoToDisplay } from "../../fields/DateCellInput.tsx";
import { PreferencesService } from "../../../../services/PreferencesService.ts";
import { LegalEntityValue, todayIsoDate, createLegalEntityExpense } from "../../../../framework/engine/AnswerUtils.ts";
import { InfoPoint } from "../../fields/InfoNote.tsx";

/**
 * The last entry in every Legal Form list. The brief forbids
 * prescribing a legal form, and a list of them goes stale the
 * moment a country adds one -- so the way out is always on offer,
 * inside the list rather than as a second field beside it.
 */
export const LEGAL_FORM_OTHER = "Other (not listed)";

/**
 * How LEGAL_FORM_OTHER is SHOWN: a picker option holds no bracketed
 * note (docs/ai/layout-rules.md), and the field that follows it names
 * the form. What is saved stays LEGAL_FORM_OTHER.
 */
export const OTHER_OPTION = "Other";

/** A saved value as its picker shows it, and back. */
export function shownOther(value: string): string {
    return value === LEGAL_FORM_OTHER ? OTHER_OPTION : value;
}

export function savedOther(value: string): string {
    return value === OTHER_OPTION ? LEGAL_FORM_OTHER : value;
}

/** Why ownership must total 100%, the "i" beside the running total. */
export const TOTAL_OWNERSHIP_HELP: InfoPoint[] = [
    {
        title: "Formula",
        text: "Each owner's % = their shares ÷ total shares, so the total must be 100%"
    }
];

/** How many further numbers a list takes after its first (the registrations, the tax registrations): enough for any real organization, not an invitation to type more. */
export const MAX_MORE_NUMBERS = 5;

/** The longest further number (a trade mark, a licence): any characters, no more than this. */
export const MAX_OTHER_NUMBER_LENGTH = 30;

/**
 * The seven answers on this page a founder cannot be expected to
 * know cold, and the most anyone needs to be told about each (see
 * InfoNote). Three points is the cap, and most take fewer: this is
 * a footnote, not a manual.
 *
 * Each one says what the field IS. Not what it is not -- a note
 * that spends a line ruling something out has spent it on the
 * reader's wrong guess rather than on the answer -- and not which
 * answer to give, which is theirs and their jurisdiction's.
 */
export const INFO = {

    activityCode: [
        "The official code for the organization's main activity: it classifies what the organization does.",
        "Asked for when the organization is registered, and on its annual filings where they apply."
    ],

    requirements: [
        "What else the law asks of this organization, if anything applies: for example a licence, a professional registration, or a named officer.",
        "Add one if it applies to your activity, your legal form, or where you are registered. If none does, add none."
    ],

    expenses: [
        "What it costs to register and keep registered: filing, renewal and agent fees. Each pays for one registration.",
        "Insurance, licences and certificates are cards of Documents & Rights on 3. Infrastructure & Capability.",
        "Add the ones that apply. If there are none, add none."
    ],

    mainActivity: [
        "The work the organization actually does, described factually.",
        "Write it as a registry or a bank would expect to read it.",
        "Some countries classify it with an official activity code."
    ],

    legalForm: [
        "Decides who is liable for the organization's debts: the organization, or you personally.",
        "Decides how it is taxed, and whether it must hold share capital.",
        "Choose Other to name a form the list does not carry."
    ],

    capital: [
        "Capital is what the founders put into the organization to start it.",
        "Some legal forms set a minimum amount; many set none.",
        "Tick it to record how much each founder put in."
    ],

    registrationStatus: [
        "Registered: the organization exists in the public register, with a date and a number.",
        "Not yet registered: you are planning it. Choose the legal form you intend to use; the date, the registration number and the tax numbers can wait until it is registered."
    ],
    registrationAuthority: [
        "The body that keeps the public register your organization is listed on.",
        "Filled in from the country you chose. Change it to match yours."
    ],

    taxNumber: [
        "The number the tax office knows the organization by.",
        "In some countries it is the registration number; in others it is issued separately when you register for tax."
    ],

    links: [
        "Says which registration or requirement this expense pays for. Only one can be chosen.",
        "Lists what you have already recorded further up the page."
    ]

};

export interface LegalEntityEditorProps {

    value: unknown;

    /** The Opening Date of the Global Settings: the company cannot be formed after it. */
    openingDate?: string;

    onChange: (value: LegalEntityValue) => void;

    disabled?: boolean;

    /** See BrandStyleEditor.columnsDivider. */
    columnsDivider?: ReactNode;

    /** See AnswerRendererProps.showInstructions. */
    showInstructions?: boolean;

    /** The page drawn as four tiles (the page's tile system) instead of one long page; the app draws it so, the editor's own tests the whole page. */
    asTiles?: boolean;

    /** Only the floating cards of the page (a legal card called from another page, e.g. 3. Infrastructure & Capability): the tiles themselves are not drawn. */
    cardsOnly?: boolean;

    /** The frame's heading, on top of its tiles (a page of several sections). */
    frameTitle?: string;

    /**
     * What the app already knows about this organization and the
     * person filling the form in, used to answer the first fields
     * for them (see the prefill effect below). Every one of them is
     * an ordinary editable field afterwards.
     */
    prefill?: {
        organisationName: string;
        founderName: string;
    };

    /**
     * 4. Founders Profile, as saved. A founder with a profile there
     * is never one of the empty rows a one-owner legal form clears
     * away (see founderIsEmpty).
     */
    foundersProfile?: unknown;

}

/** A stored day as the reader's date format shows it (day/month/year or month/day/year); the text itself where it is not a day. */
/** Today, `years` from now, as a date input's "YYYY-MM-DD". */
export function yearsAhead(years: number): string {
    const today = new Date();
    const date = new Date(today.getFullYear() + years, today.getMonth(), today.getDate());
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}

/** THE DATE DEFINES THE ORDER (then the number): the expenses stand in the order of their Dates, the earliest first; the same date keeps its place, none goes last. */
export function withExpensesInOrder(entity: LegalEntityValue): LegalEntityValue {
    const key = (date: string) => date || "9999-99-99";
    const ordered = entity.expenses.map((expense, at) => ({ expense, at })).sort((a, b) => key(a.expense.date) < key(b.expense.date) ? -1 : key(a.expense.date) > key(b.expense.date) ? 1 : a.at - b.at).map(entry => entry.expense);
    return ordered.every((expense, at) => expense === entity.expenses[at]) ? entity : { ...entity, expenses: ordered };
}

/**
 * THE EXPENSES MADE BY REQUIREMENTS ("Add to Legal Entity Expenses"): a ticked requirement has one expense, named as the requirement is and linked to it; unticked
 * (or removed), its expense goes with it.
 */
export function withAutoExpenses(entity: LegalEntityValue, create = true): LegalEntityValue {
    const wanted = entity.requirements.filter(requirement => requirement.offerInExpenses);
    let changed = false;
    // (An expense a saved answer already linked to a ticked requirement becomes the one that requirement made.)
    const adopted = new Set<string>();
    const expenses = entity.expenses.map(expense => {
        if (expense.fromRequirement !== "") {
            return expense;
        }
        const parent = wanted.find(requirement => expense.links.includes(requirement.id)
            && !adopted.has(requirement.id)
            && !entity.expenses.some(other => other.fromRequirement === requirement.id));
        if (!parent) {
            return expense;
        }
        adopted.add(parent.id);
        changed = true;
        return { ...expense, fromRequirement: parent.id };
    });
    const kept = expenses.flatMap(expense => {
        if (expense.fromRequirement === "") {
            return [expense];
        }
        const parent = wanted.find(requirement => requirement.id === expense.fromRequirement);
        if (!parent) {
            changed = true;
            return [];
        }
        if (expense.name === parent.name && expense.links.length === 1 && expense.links[0] === parent.id) {
            return [expense];
        }
        changed = true;
        return [{ ...expense, name: parent.name, links: [parent.id] }];
    });
    const missing = !create ? [] : wanted.filter(requirement => !kept.some(expense => expense.fromRequirement === requirement.id));
    if (!changed && missing.length === 0) {
        return entity;
    }
    return {
        ...entity,
        expenses: [...kept, ...missing.map(requirement => ({ ...createLegalEntityExpense(), name: requirement.name, links: [requirement.id], fromRequirement: requirement.id }))]
    };
}

/** What is wrong with the Formation's date, in words (an empty list when nothing is). */
export function formationIssues(formation: { status: string; date: string }, openingDate = ""): string[] {
    if (formation.status === "planned" || formation.date === "") {
        return [];
    }
    const format = PreferencesService.getDateFormat();
    return [
        ...(formation.date > todayIsoDate() ? ["A registered company has already been formed, so its date cannot be later than today. Correct the date, or remove the registration number if it is not registered yet."] : []),
        ...(openingDate !== "" && formation.date > openingDate ? ["The company is formed (" + isoToDisplay(formation.date, format) + ") after the Opening Date (" + isoToDisplay(openingDate, format) + "): the business cannot open before the company exists. Change one of the two dates."] : [])
    ];
}

export const shownDay = (iso: string) => isoToDisplay(iso, PreferencesService.getDateFormat()) || iso;
