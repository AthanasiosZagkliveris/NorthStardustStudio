import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import type { FloorLink } from "./capabilityFloor.ts";
import SectionTiles, { DialogHeading, OPEN_EVENT, TILE_DIVIDER, type OpenRequest, type SectionTile, type TileLink } from "./SectionTiles.tsx";
import { LinkSymbol } from "./BusinessCardFields.tsx";
import CardBoxes, { type CardBox, type CardBoxAdd } from "./CardBoxes.tsx";
import SubTiles from "./SubTiles.tsx";
import DateCellInput, { isoToDisplay } from "./DateCellInput.tsx";
import { PreferencesService } from "../../services/PreferencesService.ts";
import { workHue } from "../../framework/engine/WorkColours.ts";

import {
    LEGAL_ENTITY_SECTIONS,
    LegalEntityFounderValue,
    LegalEntityNumberValue,
    LegalEntityTaxStatus,
    LegalEntityValue,
    asLegalEntityValue,
    todayIsoDate,
    createLegalEntityExpense,
    createLegalEntityFounder,
    createLegalEntityNumber,
    createLegalEntityRequirement,
    founderProfileHasContent,
    founderProfileOf,
    legalEntityTotalCapital,
    legalEntityTotalOwnership
} from "../../framework/engine/AnswerUtils.ts";

import {
    COUNTRIES,
    LEGAL_ENTITY_EXPENSE_FREQUENCIES,
    LEGAL_REQUIREMENT_TYPES,
    countryCurrency,
    countrySearchAliases,
    limitedRegistrationNumber,
    registrationNumberRule,
    jurisdictionIsProfiled,
    jurisdictionProfile,
    legalFormOptions,
    postalCodeLabel,
    registrationAuthorityFor,
    sharesTaxAndRegistrationNumber,
    subdivisionOption,
    subdivisionSearchAliases
} from "../../framework/engine/LegalEntityJurisdictions.ts";

import { moneyText } from "../../framework/engine/ExportRenderers.ts";

import { railId } from "./rails/railItems.ts";
import { summaryText } from "./cardSummary.ts";
import FoldAllToggle from "./FoldAllToggle.tsx";
import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";
import CardNameInput from "./CardNameInput.tsx";
import { FieldMark, FieldStatus, FrozenUntil } from "./fieldMarks.tsx";
import { waitingHint } from "../../framework/engine/FieldDependencies.ts";
import { NUMBER_LIMITS, limitedNumberText, numberInputMode } from "./numberInput.ts";
import OptionPicker from "./OptionPicker.tsx";
import { SOURCES } from "../../framework/engine/Sources.ts";
import { UndoService } from "../../services/UndoService";
import StrategyTextArea from "./StrategyTextArea.tsx";
import { BusinessField, OptionalField, OptionalNote } from "./BusinessCardFields.tsx";
import { useItemFolds } from "./useItemFolds.ts";
import FoldArrow from "./FoldArrow.tsx";
import { labelWithCurrency, nameWithCurrency } from "../../framework/engine/Currencies.ts";

/**
 * The last entry in every Legal Form list. The brief forbids
 * prescribing a legal form, and a list of them goes stale the
 * moment a country adds one -- so the way out is always on offer,
 * inside the list rather than as a second field beside it.
 */
const LEGAL_FORM_OTHER = "Other (not listed)";

/**
 * How LEGAL_FORM_OTHER is SHOWN: a picker option holds no bracketed
 * note (docs/ai/layout-rules.md), and the field that follows it names
 * the form. What is saved stays LEGAL_FORM_OTHER.
 */
const OTHER_OPTION = "Other";

/** A saved value as its picker shows it, and back. */
function shownOther(value: string): string {
    return value === LEGAL_FORM_OTHER ? OTHER_OPTION : value;
}

function savedOther(value: string): string {
    return value === OTHER_OPTION ? LEGAL_FORM_OTHER : value;
}

/** Why ownership must total 100%, the "i" beside the running total. */
const TOTAL_OWNERSHIP_HELP: InfoPoint[] = [
    {
        title: "Formula",
        text: "Each owner's % = their shares ÷ total shares, so the total must be 100%"
    }
];

/** How many further numbers a list takes after its first (the registrations, the tax registrations): enough for any real organization, not an invitation to type more. */
const MAX_MORE_NUMBERS = 5;

/** The longest further number (a trade mark, a licence): any characters, no more than this. */
const MAX_OTHER_NUMBER_LENGTH = 30;


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
const INFO = {

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

interface LegalEntityEditorProps {

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
function yearsAhead(years: number): string {
    const today = new Date();
    const date = new Date(today.getFullYear() + years, today.getMonth(), today.getDate());
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}

/** THE DATE DEFINES THE ORDER (then the number): the expenses stand in the order of their Dates, the earliest first; the same date keeps its place, none goes last. */
function withExpensesInOrder(entity: LegalEntityValue): LegalEntityValue {
    const key = (date: string) => date || "9999-99-99";
    const ordered = entity.expenses.map((expense, at) => ({ expense, at })).sort((a, b) => key(a.expense.date) < key(b.expense.date) ? -1 : key(a.expense.date) > key(b.expense.date) ? 1 : a.at - b.at).map(entry => entry.expense);
    return ordered.every((expense, at) => expense === entity.expenses[at]) ? entity : { ...entity, expenses: ordered };
}

/**
 * THE EXPENSES MADE BY REQUIREMENTS ("Add to Legal Entity Expenses"): a ticked requirement has one expense, named as the requirement is and linked to it; unticked
 * (or removed), its expense goes with it.
 */
function withAutoExpenses(entity: LegalEntityValue, create = true): LegalEntityValue {
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

const shownDay = (iso: string) => isoToDisplay(iso, PreferencesService.getDateFormat()) || iso;

/**
 * The Identity System's Legal Entity page (see
 * AnswerType.LegalEntity).
 *
 * Six subsections in one progressive form, running from the
 * organization itself to its founders, its registration, its tax
 * identity, whatever else the law asks of it, and what all of that
 * costs. Built for a founder rather than a lawyer: every field is
 * answerable without legal or accounting knowledge, and nothing
 * jurisdiction-specific is shown until the jurisdiction is known.
 *
 * The page narrows as it learns. Choosing a Country fixes what the
 * consumption tax is called and which legal forms are offered;
 * choosing a Legal Form sets whether capital is asked about. Both
 * are suggestions the user can override, and for a country this app
 * carries no profile for, the page says so and asks its questions
 * in wording that assumes no particular legal system (see
 * LegalEntityJurisdictions).
 *
 * Everything optional is behind an "+ Add" rather than sitting empty
 * on screen, which is what keeps a page this long readable for the
 * many organizations that need only the first half of it.
 */
export default function LegalEntityEditor({

    value,

    openingDate = "",

    onChange,

    disabled = false,

    columnsDivider,

    showInstructions = true,

    frameTitle,

    asTiles = false,

    prefill,

    foundersProfile

}: LegalEntityEditorProps) {

    // (Read in the order of the Dates, as it is saved after a change: an answer saved before still stands in it.)
    const entity = withExpensesInOrder(withAutoExpenses(asLegalEntityValue(value), false));

    /* The latest answer and handler, for an undo that runs later. */
    const latest = useRef({ value, onChange });
    latest.current = { value, onChange };

    const profile = jurisdictionProfile(entity.organisation.country);
    const profiled = jurisdictionIsProfiled(entity.organisation.country);

    // The state / province / canton / emirate question, asked only
    // where it changes an answer (see SubdivisionSpec).
    const subdivisionSpec = profile.subdivision;

    const chosenSubdivision = subdivisionOption(
        entity.organisation.country,
        entity.organisation.subdivision
    );

    // A UAE free zone company draws on a different set of forms
    // from a mainland one; everywhere else this is the country's.
    const forms = legalFormOptions(
        entity.organisation.country,
        entity.organisation.subdivision
    );

    // Every amount on this page belongs to one legal entity in one
    // country, so one currency covers all of them. Shown beside each
    // amount rather than asked for: the user already answered it by
    // saying where they are registered.
    const currency = countryCurrency(entity.organisation.country);

    // "" where the country codes no addresses, and the field is
    // then not asked for at all.
    const postalLabel = postalCodeLabel(entity.organisation.country);

    /*
        CHAINED ANSWERS (FieldDependencies.ts): where the organization
        is, from the country down -- its state or region where the
        country has them, then the address -- and its legal form and
        registration authority, all wait for the country.
    */
    const countryChosen = entity.organisation.country.trim().length > 0;
    const placeChosen = countryChosen && (!subdivisionSpec || entity.organisation.subdivision.trim().length > 0);
    const placeHint = !countryChosen ? waitingHint("country") : waitingHint(subdivisionSpec?.label ?? "region");

    /** Which Requirement and Expense cards are open -- see useItemFolds. */
    const folds = useItemFolds();

    /** An amount label, with the currency when one is known. */
    function amountLabel(base: string): string {
        return labelWithCurrency(base, currency);
    }

    /** An amount's accessible name, with the currency's code. */
    function amountName(base: string): string {
        return nameWithCurrency(base, currency);
    }

    /** The expenses whose "Responsible" tick is off (it is on until it is taken off). */
    const [noResponsible, setNoResponsible] = useState<ReadonlySet<string>>(new Set());

    function update(patch: Partial<LegalEntityValue>) {
        onChange(withExpensesInOrder(withAutoExpenses({ ...entity, ...patch })));
    }

    /*
        Answering what the app already knows, once, on first open.

        Four fields the user would otherwise retype: the
        organization's name and their own, both given when they set
        the app up; the country, read off the browser's locale; and
        a sole founder's 100% share, which is what one founder owns.

        Only ever written into an EMPTY field, so nothing typed is
        ever replaced -- including on a later visit, where every
        field is already filled and this does nothing at all.
    */
    const prefilled = useRef(false);

    useEffect(() => {

        if (prefilled.current) {
            return;
        }

        prefilled.current = true;

        const organisation = { ...entity.organisation };
        const founders = entity.founders.map(founder => ({ ...founder }));
        let changed = false;

        if (organisation.name.trim().length === 0 && prefill?.organisationName.trim()) {
            organisation.name = prefill.organisationName.trim();
            changed = true;
        }

        if (founders.length === 1) {

            if (founders[0].name.trim().length === 0 && prefill?.founderName.trim()) {
                founders[0].name = prefill.founderName.trim();
                changed = true;
            }

            // One founder owns all of it. Stated rather than left
            // blank, so the page opens in the state it will almost
            // always end in.
            if (founders[0].ownership.trim().length === 0) {
                founders[0].ownership = "100";
                changed = true;
            }

        }

        // Whatever country we have landed on, its registry.
        const authority = registrationAuthorityFor(
            organisation.country,
            organisation.subdivision
        );

        const formation = { ...entity.formation };

        if (authority && formation.authority !== authority) {
            formation.authority = authority;
            changed = true;
        }

        if (changed) {
            onChange({ ...entity, organisation, founders, formation });
        }

    });

    function updateOrganisation(patch: Partial<LegalEntityValue["organisation"]>) {
        update({ organisation: { ...entity.organisation, ...patch } });
    }

    function updateFormation(patch: Partial<LegalEntityValue["formation"]>) {
        update({ formation: { ...entity.formation, ...patch } });
    }

    function updateTax(patch: Partial<LegalEntityValue["tax"]>) {
        update({ tax: { ...entity.tax, ...patch } });
    }

    /**
     * In nine of the countries this app knows, the registry and the
     * tax office use the SAME number, so typing it once is enough
     * (see JurisdictionProfile.sameTaxAndRegistrationNumber).
     *
     * Copied only into an empty tax field, or one still holding the
     * previous registration number -- anything the user typed
     * themselves is left exactly where it is, because a mismatch
     * they entered deliberately is more likely to be right than our
     * assumption.
     */
    function changeRegistrationNumber(typed: string) {

        // (Only what this country's numbers hold can be typed, and no more digits than they have.)
        const next = limitedRegistrationNumber(typed, registrationNumberRule(profile.registrationNumberHint));

        const taxNumber = entity.tax.identificationNumber.trim();

        const copy =
            sharesTaxAndRegistrationNumber(entity.organisation.country) &&
            (taxNumber.length === 0 ||
                taxNumber === entity.formation.registrationNumber.trim());

        update({
            formation: { ...entity.formation, registrationNumber: next },
            tax: copy
                ? { ...entity.tax, identificationNumber: next }
                : entity.tax
        });

    }

    /**
     * Changing country changes what a legal form even means, so the
     * chosen one is cleared with it -- a "GmbH" left standing under
     * "France" would be worse than an empty field. Anything TYPED
     * survives: that was never drawn from the list.
     */
    function chooseCountry(country: string) {

        update({

            organisation: {
                ...entity.organisation,
                country,
                subdivision: "",
                legalForm: "",
                activityCode: ""
            },

            capitalApplies: false,

            // Every identifier here was issued by the country just
            // left, and none of them means anything under the new
            // one -- a UK company number is not a Danish CVR. Left
            // standing they would look like answers, and the copy
            // between the two numbers below would refuse to fill a
            // field that already held one. The lists of additional
            // numbers are the user's own and are not touched.
            formation: {
                ...entity.formation,
                authority: nextAuthority(country, ""),
                registrationNumber: ""
            },

            tax: {
                ...entity.tax,
                identificationNumber: "",
                consumptionTaxNumber: ""
            }

        });

    }

    /**
     * The state, province, canton or emirate. Clears the legal form
     * only where the subdivision decides the list -- a UAE free
     * zone -- since everywhere else the forms are national and a
     * chosen one stays valid.
     */
    function chooseSubdivision(subdivision: string) {

        const formsChange =
            !!subdivisionOption(entity.organisation.country, subdivision)?.forms ||
            !!chosenSubdivision?.forms;

        update({
            organisation: {
                ...entity.organisation,
                subdivision,
                legalForm: formsChange ? "" : entity.organisation.legalForm
            },
            formation: {
                ...entity.formation,
                authority: nextAuthority(entity.organisation.country, subdivision)
            }
        });

    }

    /**
     * What Registration Authority should read after a change of
     * country or subdivision.
     *
     * Replaces the field only when it is empty or still holds the
     * value this app put there. Anything the user typed themselves
     * survives a change of country, because it was their answer and
     * not ours.
     */
    function nextAuthority(country: string, subdivision: string): string {

        const current = entity.formation.authority.trim();

        const ours = registrationAuthorityFor(
            entity.organisation.country,
            entity.organisation.subdivision
        );

        return current.length === 0 || current === ours
            ? registrationAuthorityFor(country, subdivision)
            : entity.formation.authority;

    }

    /**
     * Picking a form suggests whether capital applies. A suggestion
     * only: the switch below is the user's, and nothing here reads
     * it back.
     */
    /**
     * "Add to Legal Entity Expenses": offer a requirement to the expenses'
     * Links, or stop offering it -- which unlinks any expense that linked
     * it, undoably (the tick and the links come back together).
     */
    function offerInExpenses(index: number, offered: boolean) {
        const requirement = entity.requirements[index];
        const requirements = entity.requirements.map((candidate, position) => position === index
            ? { ...candidate, offerInExpenses: offered }
            : candidate);
        if (offered) {
            update({ requirements });
            return;
        }
        const previous = entity;
        const made = previous.expenses.find(expense => expense.fromRequirement === requirement.id);
        update({ requirements });
        if (made && (made.cost.trim() !== "" || made.description.trim() !== "" || made.responsibility !== "")) {
            UndoService.offer("Removed from Legal Entity Expenses.", () => latest.current.onChange(previous));
        }
    }

    function chooseLegalForm(legalForm: string) {

        // "Other" is a way into the field below, not a legal form:
        // it carries no capital convention of its own, and it keeps
        // whatever the user has already typed there.
        const other = legalForm === LEGAL_FORM_OTHER;

        const option = other
            ? undefined
            : forms.find(form => form.label === legalForm);

        update({
            organisation: {
                ...entity.organisation,
                legalForm,
                legalFormOther: other ? entity.organisation.legalFormOther : ""
            },
            capitalApplies: other
                ? entity.capitalApplies
                : (option?.capital ?? false),
            founders: option?.soleFounder ? soleFounderTable() : entity.founders
        });

    }

    /* ---------- Founders ---------- */

    function updateFounder(index: number, patch: Partial<LegalEntityFounderValue>) {
        update({
            founders: entity.founders.map(
                (founder, position) => position === index ? { ...founder, ...patch } : founder
            )
        });
    }

    function removeFounder(index: number) {

        const remaining = entity.founders.length > 1
            ? entity.founders.filter((_founder, position) => position !== index)
            : [createLegalEntityFounder()];

        // Resolving a one-owner form down to its one owner: whatever
        // share was typed while the table held several, the one left
        // holds all of it. Without this the field would lock at a
        // number the form cannot have.
        update({
            founders: soleFounderForm && remaining.length === 1
                ? [{ ...remaining[0], ownership: "100" }]
                : remaining
        });

    }

    /**
     * A row nobody has answered: a percentage alone is not a founder.
     *
     * Roles and experience are asked on 4. Founders Profile now, so a
     * row is also answered when that page holds anything for it --
     * including the Roles and Experience & Skills a row saved before
     * that page existed still carries (see founderProfileOf). Either
     * way, clearing the row would lose them.
     */
    function founderIsEmpty(founder: LegalEntityFounderValue): boolean {
        return founder.name.trim().length === 0 &&
            founder.capital.trim().length === 0 &&
            !founderProfileHasContent(founderProfileOf(founder, foundersProfile));
    }

    /**
     * The founder table as a one-owner legal form leaves it.
     *
     * Rows nobody typed in go, because they were never answers. A
     * row with a name in it STAYS, and the subsection asks the user
     * to resolve it: losing a name they typed to a change of list is
     * not this page's to do, and they may have picked the form by
     * mistake.
     *
     * Where one row is left it owns the whole of it, which is the
     * only share such a form can have.
     */
    function soleFounderTable(): LegalEntityFounderValue[] {

        const kept = entity.founders.filter(
            (founder, index) => index === 0 || !founderIsEmpty(founder)
        );

        return kept.length === 1
            ? [{ ...kept[0], ownership: "100" }]
            : kept;

    }

    /**
     * Whether the chosen legal form has exactly ONE owner as a
     * matter of law -- every sole proprietorship, and the
     * single-member companies built for one person such as an EURL
     * or an FZE (see LegalFormOption.soleFounder).
     *
     * A form that merely PERMITS a single owner is not one of these.
     * A UK Ltd is perfectly happy with one shareholder and equally
     * happy with six, so the page makes no claim about it.
     */
    const soleFounderForm = forms.find(
        form => form.label === entity.organisation.legalForm
    )?.soleFounder === true;

    /**
     * A one-owner form, and one founder is what the table holds. The
     * subsection has nothing further to ask: there is no second row
     * to add, and no share to divide.
     */
    const soleFounderSettled = soleFounderForm && entity.founders.length === 1;

    /**
     * A one-owner form, and the table holds more than one. Only
     * reachable by filling rows in and THEN choosing the form, since
     * empty ones are dropped as it is chosen, so every extra row
     * here holds something the user typed.
     */
    const soleFounderSurplus = soleFounderForm && entity.founders.length > 1;

    const totalOwnership = legalEntityTotalOwnership(entity);
    const totalCapital = legalEntityTotalCapital(entity);

    // Allowing for the rounding a typed "33.33" three times over
    // produces: 99.99 is the answer the user meant.
    const ownershipComplete = Math.abs(totalOwnership - 100) < 0.01;

    /**
     * More than the whole of the organisation has been handed out.
     *
     * The only one of the three states that is an ERROR rather than
     * a stage: under 100% is a table still being filled in, exactly
     * 100% is done, and over 100% cannot be true of any
     * organisation however far through the form the user is.
     */
    const ownershipOver = totalOwnership - 100 > 0.01;

    /**
     * Less than the whole of it has been handed out. A stage rather
     * than a fault: a table on its way to 100% passes through this
     * on every page load, so it is stated, not flagged.
     */
    const ownershipShort = 100 - totalOwnership > 0.01;

    /** A percentage (or the capital total), to as many decimals as it actually has. */
    function percent(value: number): string {
        return value.toFixed(value % 1 === 0 ? 0 : 2);
    }

    /* ---------- The numbers an expense can point at ---------- */

    /**
     * Everything recorded further up this page that an expense could
     * be FOR. Built from the live value rather than stored, so a
     * link can never outlive what it points at.
     */
    const linkTargets: Array<{ id: string; label: string }> = [
        ...(entity.formation.registrationNumber.trim().length > 0
            ? [{
                id: "formation-registration-number",
                label: (entity.formation.authority.trim() || "Registration Number") + ": " + entity.formation.registrationNumber
            }]
            : []),
        ...entity.formation.additionalNumbers
            .filter(entry => entry.label.trim().length > 0 || entry.number.trim().length > 0)
            .map(entry => ({
                id: entry.id,
                label: (entry.label.trim() || "Registration number") +
                    (entry.number.trim() ? ": " + entry.number.trim() : "")
            })),
        ...(entity.tax.consumptionTaxNumber.trim().length > 0
            ? [{
                id: "tax-consumption-number",
                label: profile.consumptionTax + ": " + entity.tax.consumptionTaxNumber
            }]
            : []),
        ...entity.tax.additionalRegistrations
            .filter(entry => entry.label.trim().length > 0 || entry.number.trim().length > 0)
            .map(entry => ({
                id: entry.id,
                label: (entry.label.trim() || "Tax registration") +
                    (entry.number.trim() ? ": " + entry.number.trim() : "")
            })),
        ...entity.requirements
            .filter(requirement => requirement.offerInExpenses && requirement.name.trim().length > 0)
            // A requirement by its name alone: its kind ("Other Legal
            // Requirement") says nothing the name does not.
            .map(requirement => ({
                id: requirement.id,
                label: requirement.name.trim()
            }))
    ];

    /**
     * The consumption tax's "i": what it is, when registering is required
     * (the UK's threshold, from GOV.UK; elsewhere no figure, since none is
     * verified), and what the tick does in this app.
     */
    const consumptionTaxNote: InfoPoint[] = [
        profile.consumptionTax + " is a tax on sales: a registered business adds it to its prices, " +
            "pays it on to the tax authority, and reclaims what it paid on its own purchases.",
        entity.organisation.country === "GB"
            ? "You must register when your taxable turnover for the last 12 months goes over £90,000, " +
                "and you can register below that by choice."
            : "Registration is required once your sales pass the threshold your country sets, and " +
                "some businesses can register by choice. Check with your tax authority.",
        "Ticked, this asks for your " + profile.consumptionTax + " number, and the Financial Foundation " +
            "takes its amounts as excluding " + profile.consumptionTax + " unless you choose otherwise.",
        ...(entity.organisation.country === "GB" ? [{ title: "Source", source: SOURCES.ukVatRegistration }] : [])
    ];

    /** The Type's "i": the kinds of requirement this country usually asks for. */
    const commonRequirementsNote = profile.commonRequirements.length > 0
        ? ["Usually required here: " + LEGAL_REQUIREMENT_TYPES
            .filter(type => profile.commonRequirements.includes(type.id))
            .map(type => type.label)
            .join(", ") + "."]
        : undefined;

    const namedFounders = entity.founders.filter(
        founder => founder.name.trim().length > 0
    );

    /* ---------- Building blocks ---------- */

    /**
     * The number this page gives one of its subsections: "1.". Its
     * own count, not one under the page's number, like every level
     * of the Foundation pages.
     */
    function subsectionNumber(index: number): string {
        return (index + 1) + ".";
    }

    /**
     * `title` overrides the name the Section carries in
     * LEGAL_ENTITY_SECTIONS, for the one subsection that drops half
     * its subject depending on the legal form. The constant itself
     * stays put: the completeness dialog and the stored value are
     * keyed to it.
     *
     * `titleExtra` sits at the far end of the heading's own row --
     * the subsection's "Expand all" (see .fold-group-head).
     *
     * `titleInfo` is the "i" beside the title.
     */
    function subsection(index: number, children: ReactNode, title?: string, titleExtra?: ReactNode, titleInfo?: InfoPoint[]) {

        const heading = (
            <h3 className="legal-entity-section-head">
                <span className="legal-entity-section-number">
                    {subsectionNumber(index)}
                </span>
                <span className="legal-entity-section-title">
                    {title ?? LEGAL_ENTITY_SECTIONS[index]}
                    <FieldMark label={title ?? LEGAL_ENTITY_SECTIONS[index]} section={railId(LEGAL_ENTITY_SECTIONS[index])} />
                    {titleInfo && <InfoNote label={title ?? LEGAL_ENTITY_SECTIONS[index]} points={titleInfo} />}
                </span>
                <FieldStatus label={title ?? LEGAL_ENTITY_SECTIONS[index]} section={railId(LEGAL_ENTITY_SECTIONS[index])} />
            </h3>
        );

        return (
            <section
                className="legal-entity-section"
                data-anchor={"legal-section-" + index}
                data-rail={railId(LEGAL_ENTITY_SECTIONS[index])}
            >

                {titleExtra
                    ? (
                        <div className="fold-group-head">
                            {heading}
                            {titleExtra}
                        </div>
                    )
                    : heading}

                {children}

            </section>
        );

    }

    /**
     * A label and its control, for a column that stacks several of
     * them. `nested` adds the space that tells one pair from the
     * next -- the first pair in a column does not need it.
     *
     * `onRemove` puts a × at the end of the label's line, for a
     * field the user asked for and can send away again.
     */
    function labelled(
        label: string,
        control: ReactNode,
        nested = false,
        onRemove?: () => void,
        info?: InfoPoint[]
    ) {
        return (
            /* One field of several in a column: its own holder (for
               its key, FieldKeys.ts), which adds no box of its own. */
            <div className="legal-entity-pair">
                {onRemove
                    ? (
                        <span
                            className={
                                "legal-entity-label-row" +
                                (nested ? " legal-entity-label-nested" : "")
                            }
                        >
                            <span className="field-label legal-entity-label">{label}<FieldMark label={label} /><FieldStatus label={label} /></span>
                            {removeFieldButton(label, onRemove)}
                        </span>
                    )
                    : info
                        ? (
                            <span
                                className={
                                    "legal-entity-label-info" +
                                    (nested ? " legal-entity-label-nested" : "")
                                }
                            >
                                <span className="field-label legal-entity-label">
                                    <InfoText text={label}>
                                        <InfoNote label={label} points={info} />
                                    </InfoText>
                                    <FieldMark label={label} />
                                    <FieldStatus label={label} />
                                </span>
                            </span>
                        )
                        : (
                            <span
                                className={
                                    "field-label legal-entity-label" +
                                    (nested ? " legal-entity-label-nested" : "")
                                }
                            >
                                {label}
                                <FieldMark label={label} />
                                <FieldStatus label={label} />
                            </span>
                        )}
                {control}
            </div>
        );
    }

    /**
     * The button that sends an optional field away again: the same
     * ×, box, hover and focus as every other remove in the app, so
     * one action has one look.
     *
     * The glyph is drawn in CSS, so the character here is only what
     * the DOM holds (see `.legal-entity-field-remove`).
     */
    function removeFieldButton(what: string, onRemove: () => void) {
        return (
            <button
                type="button"
                className="legal-entity-field-remove"
                aria-label={"Remove " + what}
                title={"Remove " + what}
                disabled={disabled}
                onClick={onRemove}
            >
                ×
            </button>
        );
    }

    /**
     * The long note at the foot of a requirement or an expense
     * card, which most of them never carry: the shared optional
     * field opened by its tick box (OptionalField,
     * BusinessCardFields.tsx).
     */
    function optionalNote(
        label: string,
        ariaLabel: string,
        current: string,
        onNext: (next: string) => void,
        /** The field's key where its label was renamed (FieldKeys.ts). */
        fieldId?: string
    ) {

        return (
            <div className="legal-entity-field-wide">
                <OptionalNote
                    label={label}
                    fieldId={fieldId}
                    className="interview-input legal-entity-note"
                    ariaLabel={ariaLabel}
                    disabled={disabled}
                    value={current}
                    onChange={onNext}
                />
            </div>
        );

    }

    /**
     * A founder field's heading, shown only where the table has
     * stopped being a table (see `.legal-entity-founder-label`).
     * Hidden from screen readers: the field beside it already
     * carries the same words in its own name.
     */
    function founderLabel(text: string) {
        return (
            <span className="legal-entity-founder-label" aria-hidden="true">
                {text}
            </span>
        );
    }

    /** A plain text input, with no label of its own. */
    function textControl(
        ariaLabel: string,
        current: string,
        onNext: (next: string) => void,
        placeholder?: string
    ) {
        return (
            <input
                type="text"
                className="interview-input"
                aria-label={ariaLabel}
                placeholder={placeholder}
                disabled={disabled}
                value={current}
                onChange={(event) => onNext(event.target.value)}
            />
        );
    }

    /** Asks the page's tiles to open a card, or a section of the Registrations. */
    const openOnPage = (request: OpenRequest) => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: request }));

    /** The first expense linked to a registration (its number's or requirement's id), as a link symbol that opens it; nothing where none is. */
    function expenseSymbol(targetId: string, hang = false) {
        const expense = entity.expenses.find(candidate => candidate.links.includes(targetId));
        if (!expense) {
            return null;
        }
        const symbol = <LinkSymbol noun="Expense" name={expense.name.trim() || "Unnamed expense"} onOpen={() => openOnPage({ tile: "legal-entity-expenses", card: expense.id })} />;
        // (Hung in the margin at the left of the number's row, so the columns of the list stay where they are.)
        return hang ? <span className="legal-entity-link-hang">{symbol}</span> : symbol;
    }

    /** Where a registration lives: its card (a requirement), or the section of Registrations that holds its number. */
    function registrationRequest(targetId: string): OpenRequest {
        if (entity.requirements.some(requirement => requirement.id === targetId)) {
            return { tile: "legal-entity-registrations", card: targetId };
        }
        const taxed = targetId === "tax-consumption-number" || entity.tax.additionalRegistrations.some(registration => registration.id === targetId);
        return { tile: "legal-entity-registrations", box: taxed ? "tax" : "formation" };
    }

    /**
     * One labelled control, as a cell of the grid. `onRemove` puts a
     * × at the end of the label's line, for an optional field
     * the user opened and can close again.
     */
    function field(
        label: string,
        control: ReactNode,
        wide = false,
        onRemove?: () => void,
        info?: string[],
        /** The field's key where its label was renamed (FieldKeys.ts). */
        keyLabel?: string,
        /** The label beside the control, on one row (a card's Type, Date, Responsibility). */
        side = false,
        /** A link symbol after the label's words. */
        labelExtra?: ReactNode
    ) {
        return (
            <div className={"legal-entity-field" + (wide ? " legal-entity-field-wide" : "") + (side ? " legal-entity-field-side" : "")}>
                {onRemove
                    ? (
                        <span className="legal-entity-label-row">
                            {/* An optional field can carry a note too. */}
                            {info
                                ? (
                                    <span className="legal-entity-label-info">
                                        <span className="field-label legal-entity-label">
                                            <InfoText text={label}>
                                                <InfoNote label={label} points={info} fullList />
                                            </InfoText>
                                            <FieldMark label={label} />
                                            <FieldStatus label={label} keyLabel={keyLabel} />
                                        </span>
                                    </span>
                                )
                                : <span className="field-label legal-entity-label">{label}<FieldMark label={label} /><FieldStatus label={label} keyLabel={keyLabel} /></span>}
                            {removeFieldButton(label, onRemove)}
                        </span>
                    )
                    : info
                        ? (
                            <span className="legal-entity-label-info">
                                <span className="field-label legal-entity-label">
                                    <InfoText text={label}>
                                        <InfoNote label={label} points={info} />
                                    </InfoText>
                                    <FieldMark label={label} keyLabel={keyLabel} />
                                    <FieldStatus label={label} keyLabel={keyLabel} />
                                    {labelExtra}
                                </span>
                            </span>
                        )
                        : <span className="field-label legal-entity-label">{label}<FieldMark label={label} keyLabel={keyLabel} /><FieldStatus label={label} keyLabel={keyLabel} />{labelExtra}</span>}
                {control}
            </div>
        );
    }

    /** The "+ Add …" lists of extra numbers, shared by subsections 3 and 4. */
    function numberList(
        entries: LegalEntityNumberValue[],
        labelPlaceholder: string,
        onNext: (next: LegalEntityNumberValue[]) => void,
        /** "Registration number" or "Tax registration": the two lists are otherwise alike. */
        noun: string
    ) {

        return entries.map((entry, index) => (

            <div className="legal-entity-number-row" key={entry.id}>

                {expenseSymbol(entry.id, true)}

                {/* A name wraps and grows, never clipped. */}
                <CardNameInput
                    ariaLabel={noun + " " + (index + 1) + " name"}
                    placeholder={labelPlaceholder}
                    disabled={disabled}
                    value={entry.label}
                    onChange={(next) => onNext(entries.map(
                        (candidate, position) => position === index
                            ? { ...candidate, label: next }
                            : candidate
                    ))}
                />

                {/* Free text, not a figure: a long one wraps and grows. */}
                <CardNameInput
                    ariaLabel={noun + " " + (index + 1)}
                    placeholder="Number"
                    disabled={disabled}
                    value={entry.number}
                    onChange={(next) => onNext(entries.map(
                        (candidate, position) => position === index
                            ? { ...candidate, number: next.slice(0, MAX_OTHER_NUMBER_LENGTH) }
                            : candidate
                    ))}
                />

                <button
                    type="button"
                    className="strategy-box-remove"
                    aria-label={"Remove " + noun.toLowerCase() + " " + (index + 1)}
                    title={"Remove " + noun.toLowerCase() + " " + (index + 1)}
                    disabled={disabled}
                    onClick={() => onNext(entries.filter(
                        (_candidate, position) => position !== index
                    ))}
                >
                    ×
                </button>

            </div>

        ));

    }

    const section0 = (
    subsection(0, (
        <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-organization">

            {/*
                Two columns, each one subject, on the
                card's two-column grid: what the
                organization is (its name, what it does,
                the code that classifies that, and its
                legal form), and where it is. Read down a
                column rather than across a grid, so a
                founder answers one question at a time.
            */}

            {/* ---- What it is ---- */}
            <div className="legal-entity-field">

                {labelled(
                    "Organization Name",
                    textControl(
                        "Organization Name",
                        entity.organisation.name,
                        (next) => updateOrganisation({ name: next }),
                        "The legal name of the organization"
                    )
                )}

                {labelled(
                    "Main Activity",
                    <StrategyTextArea
                        className="interview-input legal-entity-note legal-entity-activity"
                        ariaLabel="Main Activity"
                        placeholder="What the organization does, in plain words"
                        disabled={disabled}
                        value={entity.organisation.mainActivity}
                        onChange={(next) => updateOrganisation({ mainActivity: next })}
                    />,
                    true,
                    undefined,
                    INFO.mainActivity
                )}

                {/*
                    Asked for only where the jurisdiction
                    actually issues one: always as a tick row
                    (as the consumption tax), the code's box
                    appearing only while it is ticked.
                */}
                {profile.activityCode && (
                    <div className="legal-entity-activity-code">
                        <div className="legal-entity-activity-code-tick">
                            <span className="legal-entity-switch-cell">
                                <label className="legal-entity-switch">
                                    <input
                                        type="checkbox"
                                        className="brand-tick-box"
                                        aria-label={"Has a " + profile.activityCode}
                                        disabled={disabled}
                                        checked={entity.organisation.activityCodeOn}
                                        onChange={(event) => updateOrganisation({ activityCodeOn: event.target.checked })}
                                    />
                                    <span className="legal-entity-switch-label">{profile.activityCode}</span>
                                </label>
                                <InfoNote
                                    label={profile.activityCode}
                                    points={[
                                        ...INFO.activityCode,
                                        // The official list, where one is verified (Sources.ts).
                                        ...(entity.organisation.country === "GB" ? [{ title: "Source", source: SOURCES.ukSicCodes }] : [])
                                    ]}
                                />
                            </span>
                            {entity.organisation.activityCodeOn && textControl(
                                profile.activityCode,
                                entity.organisation.activityCode,
                                (next) => updateOrganisation({ activityCode: next }),
                                "Optional"
                            )}
                        </div>
                    </div>
                )}

                {/* What it is legally: under the activity it
                    classifies, the Legal Form (its note, and its
                    name when Other), frozen until a country is
                    chosen. The picker takes the column's width. */}
                <div className="legal-entity-legal-form">
                <FrozenUntil answered={countryChosen} hint={waitingHint("country")}>

                {forms.length > 0 ? labelled(
                    "Legal Form",
                    <OptionPicker
                        label="Legal Form"
                        placeholder="Select a legal form"
                        options={[
                            ...forms.map(form => form.label),
                            OTHER_OPTION
                        ]}
                        disabled={disabled}
                        value={shownOther(entity.organisation.legalForm)}
                        onChange={(next) => chooseLegalForm(savedOther(next))}
                    />,
                    true,
                    undefined,
                    INFO.legalForm
                ) : labelled(
                    "Legal Form",
                    textControl(
                        "Legal Form",
                        entity.organisation.legalFormOther,
                        (next) => updateOrganisation({ legalFormOther: next }),
                        "Enter the legal form"
                    ),
                    true
                )}

                {/* Named directly under the list that sent them here. */}
                {forms.length > 0 &&
                    entity.organisation.legalForm === LEGAL_FORM_OTHER &&
                    labelled(
                        "Name the legal form",
                        textControl(
                            "Name the legal form",
                            entity.organisation.legalFormOther,
                            (next) => updateOrganisation({ legalFormOther: next }),
                            "Enter the legal form"
                        ),
                        true
                    )}
                </FrozenUntil>
                </div>

            </div>

            {/* ---- Where it is ----
                Country, then its State or Region where it has
                one (they decide the registry, the tax and the
                legal forms), each the column's width; then the
                Address, one box of as many lines as it needs. */}
            <div className="legal-entity-field legal-entity-where">

                {labelled(
                    "Country",
                    <OptionPicker
                        label="Country"
                        placeholder="Select a country"
                        options={COUNTRIES.map(country => country.name)}
                        // 195 rows: quicker to type three
                        // letters than to scroll to
                        // Zimbabwe, and "UK" or "USA"
                        // find their own.
                        searchable
                        searchAliases={countrySearchAliases()}
                        disabled={disabled}
                        value={
                            COUNTRIES.find(
                                country => country.code === entity.organisation.country
                            )?.name ?? ""
                        }
                        onChange={(next) => chooseCountry(
                            COUNTRIES.find(country => country.name === next)?.code ?? ""
                        )}
                    />
                )}

                {/*
                    Shown only where it changes an answer:
                    which registry you deal with, whether
                    a consumption tax applies, and in the
                    UAE which forms exist. Never for the
                    190 countries where it changes
                    nothing.
                */}
                <FrozenUntil answered={countryChosen} hint={waitingHint("country")}>
                {subdivisionSpec && labelled(
                    subdivisionSpec.label,
                    <OptionPicker
                        label={subdivisionSpec.label}
                        placeholder={"Select a " + subdivisionSpec.label.toLowerCase()}
                        options={[
                            ...subdivisionSpec.options.map(option => option.name),
                            OTHER_OPTION
                        ]}
                        // Typed the same way a country is,
                        // by name or by code.
                        searchable
                        searchAliases={subdivisionSearchAliases(
                            entity.organisation.country
                        )}
                        disabled={disabled}
                        value={shownOther(entity.organisation.subdivision)}
                        onChange={(next) => chooseSubdivision(savedOther(next))}
                    />,
                    true
                )}
                </FrozenUntil>

                <FrozenUntil answered={placeChosen} hint={placeHint}>

                {/* THE WHOLE ADDRESS, ONE BOX: as many lines as it
                    needs (Enter starts the next), at least two,
                    growing with them. Its placeholder shows the lines
                    expected, in the country's own words (its postal
                    code's name; none where addresses carry none). */}
                {labelled(
                    "Address",
                    <StrategyTextArea
                        className="interview-input legal-entity-note legal-entity-address"
                        ariaLabel="Address"
                        placeholder={["City", postalLabel ? "Street and " + postalLabel : "Street"].join("\n")}
                        disabled={disabled}
                        value={entity.organisation.addressLine1}
                        onChange={(next) => updateOrganisation({ addressLine1: next })}
                    />,
                    true
                )}
                </FrozenUntil>

            </div>

            {entity.organisation.country.trim().length > 0 && !profiled && (
                <p className="legal-entity-note-line legal-entity-field-wide">
                    This app holds no legal form or tax detail for the country you
                    chose, so the questions below stay general. Your jurisdiction may
                    require something different, so check with someone who knows
                    it.
                </p>
            )}

        </div>
    ))
    );

    const section1 = (
    subsection(1, (
        <>

            {/*
                Said before the table rather than after
                it, because it changes what the table is
                asking for.
            */}
            {soleFounderSettled && (
                <p className="legal-entity-note-line">
                    {entity.organisation.legalForm} has one owner in law, so this
                    subsection asks for one founder, who owns the whole
                    organization.
                </p>
            )}

            {soleFounderSurplus && (
                <p className="legal-entity-note-line legal-entity-note-warn">
                    {entity.organisation.legalForm} has one owner in law, and more
                    than one founder is listed below. Remove the founders who are
                    not the owner, or choose a different legal form in
                    {" " + subsectionNumber(0) + " " + LEGAL_ENTITY_SECTIONS[0]}.
                </p>
            )}

            {/*
                The "i" sits OUTSIDE the label, not in
                it: anything inside a label toggles the
                tick it belongs to, so a button there
                would turn capital on every time someone
                asked what capital means.
            */}
            <div className="legal-entity-switch-row">

                <label className="legal-entity-switch">
                    <input
                        type="checkbox"
                        className="brand-tick-box"
                        disabled={disabled}
                        checked={entity.capitalApplies}
                        onChange={(event) => update({
                            capitalApplies: event.target.checked
                        })}
                    />
                    <span className="legal-entity-switch-label">
                        Founders contribute capital to this organization
                    </span>
                </label>

                <InfoNote label="Founders contribute capital" points={INFO.capital} />

            </div>

            <div
                className={
                    "legal-entity-founders" +
                    (entity.capitalApplies ? " legal-entity-founders-capital" : "") +
                    (soleFounderSettled ? " legal-entity-founders-no-ownership" : "")
                }
            >

                <span className="legal-entity-column-head">Name</span>

                {/*
                    The number columns are centred, head
                    and value together, so a column of
                    "5", "80" and "100" reads as one
                    column of figures rather than three
                    lines starting at the same margin and
                    ending wherever they happen to.

                    Ownership is not asked at all where
                    the legal form admits one owner: the
                    answer is 100% and nothing else, and a
                    field with one possible value is a
                    question that wastes the reader's
                    time. It is still STORED as 100 (see
                    soleFounderTable), so the answer this
                    page holds is complete either way.
                */}
                {!soleFounderSettled && (
                    <span className="legal-entity-column-head legal-entity-column-centre">
                        Ownership %
                    </span>
                )}
                {entity.capitalApplies && (
                    <span className="legal-entity-column-head legal-entity-column-centre">
                        {amountLabel("Capital")}
                    </span>
                )}
                {entity.founders.map((founder, index) => (

                    <div className="legal-entity-founder-row" key={founder.id}>

                        {/*
                            The column heads again, one
                            per field, for the narrow
                            window where the table stops
                            being a table and each
                            founder becomes a block (see
                            `.legal-entity-founder-label`).
                            Not generated at all above
                            that width, so the row keeps
                            its cells and its subgrid. Hidden from screen
                            readers either way: every
                            field already carries its own
                            name.
                        */}
                        {founderLabel("Name")}

                        {/* The rest of the row: a long name wraps and grows. */}
                        <CardNameInput
                            ariaLabel={"Founder " + (index + 1) + " name"}
                            placeholder="Name"
                            disabled={disabled}
                            value={founder.name}
                            onChange={(next) => updateFounder(index, { name: next })}
                        />

                        {/* Not asked where the form leaves
                            one owner: see the head above. */}
                        {!soleFounderSettled && (
                            <>
                                {founderLabel("Ownership %")}

                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className="interview-input legal-entity-column-centre"
                                    aria-label={"Founder " + (index + 1) + " ownership percentage"}
                                    placeholder="%"
                                    disabled={disabled}
                                    value={founder.ownership}
                                    onChange={(event) => updateFounder(index, {
                                        ownership: limitedNumberText(event.target.value, founder.ownership, NUMBER_LIMITS.ownership)
                                    })}
                                />
                            </>
                        )}

                        {entity.capitalApplies && (
                            <>
                                {founderLabel(amountLabel("Capital"))}

                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className="interview-input legal-entity-column-centre"
                                    aria-label={"Founder " + (index + 1) + " " + amountName("capital")}
                                    placeholder={currency || "Amount"}
                                    disabled={disabled}
                                    value={founder.capital}
                                    onChange={(event) => updateFounder(index, {
                                        capital: limitedNumberText(event.target.value, founder.capital, NUMBER_LIMITS.money)
                                    })}
                                />
                            </>
                        )}

                        {/*
                            The row's delete, alone in the
                            last, flexible cell, at its
                            start, next to Capital. The cell is where Role
                            used to be (roles are asked on
                            4. Founders Profile now), and
                            keeping it is what keeps the
                            row reading [flexible]
                            [numbers] [flexible], with the
                            numbers on the page's middle
                            line -- the same axis as the
                            line between subsections 3
                            and 4.

                            Nothing to remove where the law
                            leaves exactly one row.
                        */}
                        {!soleFounderSettled && (
                            <div className="legal-entity-founder-end">
                                <button
                                    type="button"
                                    className="strategy-box-remove card-remove"
                                    aria-label={"Remove founder " + (index + 1)}
                                    title={"Remove founder " + (index + 1)}
                                    disabled={disabled}
                                    onClick={() => removeFounder(index)}
                                >
                                    ×
                                </button>
                            </div>
                        )}

                    </div>

                ))}

            </div>

            {/*
                Withheld rather than shown and refused: a
                one-owner form has no second founder to
                add, and a button that cannot do anything
                is a question the user has to answer.
            */}
            {!soleFounderForm && (
                <button
                    type="button"
                    className="strategy-add-button legal-entity-list-add"
                    disabled={disabled}
                    onClick={() => update({
                        founders: [...entity.founders, createLegalEntityFounder()]
                    })}
                >
                    + Add founder
                </button>
            )}

            {/* Nothing to total where neither is asked. */}
            {(!soleFounderSettled || entity.capitalApplies) && (
                <div className="legal-entity-totals">

                    {/* The capital first, the ownership badge under it. */}
                    {entity.capitalApplies && (
                        <span className="legal-entity-total">
                            {amountLabel("Total Capital")}
                            : {percent(totalCapital)}
                        </span>
                    )}

                    {/*
                        Flagged, not enforced. Ownership
                        that does not reach 100% is usually
                        a half-finished table rather than a
                        mistake, and a form that refuses to
                        accept it stops the user
                        mid-thought.

                        Gone entirely where the form has
                        one owner: a total of one share
                        that could only ever be 100% adds
                        up to nothing worth reading.
                    */}
                    {!soleFounderSettled && (
                        /*
                            A running total announced as
                            it changes, so the error below
                            reaches a reader who is typing
                            in the column rather than
                            looking at the pill.
                        */
                        <span
                            role="status"
                            className={
                                "legal-entity-total" +
                                (ownershipShort ? " legal-entity-total-short" : "") +
                                (ownershipComplete ? " legal-entity-total-met" : "") +
                                (ownershipOver ? " legal-entity-total-over" : "")
                            }
                        >
                            {ownershipShort && (
                                <span
                                    className="legal-entity-total-open"
                                    aria-hidden="true"
                                />
                            )}
                            {ownershipComplete && (
                                <span
                                    className="legal-entity-total-tick"
                                    aria-hidden="true"
                                />
                            )}
                            {ownershipOver && (
                                <span
                                    className="legal-entity-total-alert"
                                    aria-hidden="true"
                                />
                            )}
                            <InfoText text={"Total Ownership: " + percent(totalOwnership) + "%"}>
                                <InfoNote label="Total ownership" points={TOTAL_OWNERSHIP_HELP} />
                            </InfoText>
                            {ownershipShort && (
                                <span className="legal-entity-total-said">
                                    {percent(100 - totalOwnership)}% still to allocate
                                </span>
                            )}
                            {ownershipComplete && (
                                <span className="legal-entity-total-said">
                                    Fully allocated
                                </span>
                            )}
                            {ownershipOver && (
                                <span className="legal-entity-total-said">
                                    Over by {percent(totalOwnership - 100)}%
                                </span>
                            )}
                        </span>
                    )}


                </div>
            )}

        </>
    ),
        // With no ownership to divide, the subsection is
        // about the founder and nothing else, and its
        // name says so.
        soleFounderSettled ? "Founders" : undefined
    )
    );

    // The registry of the country (or of its state or canton): known, it is filled in and shown as text.
    const ownAuthority = registrationAuthorityFor(entity.organisation.country, entity.organisation.subdivision);

    const section2 = (
    subsection(2, (
        <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-formation">

            {/* ONE SIDE-LABEL ROW SNAPPED TO THE GRID: "Status
                [Registered]" filling column 1 and "Date [date]"
                column 2 of the list below (the Name | Number
                columns), each label on its control's centre line
                (see .legal-entity-side-row). */}
            <div className="legal-entity-field-wide legal-entity-number-row legal-entity-date-row">
                {/* A founder planning the organization has no
                    date or number yet: say so (under the row),
                    and the page asks only where it will be
                    registered. */}
                {/* When it was registered, beside whether it is. */}
                {/* "Date": the card's title says Formation. Its
                    name and its key stay "Formation date". */}
                {entity.formation.status !== "planned" && field(
                    "Date",
                    <DateCellInput
                        ariaLabel="Formation date"
                        // (A registered company has been formed: its day is today or earlier.)
                        max={todayIsoDate()}
                        disabled={disabled}
                        value={entity.formation.date}
                        onChange={(next) => updateFormation({ date: next })}
                    />,
                    false,
                    undefined,
                    undefined,
                    "Formation Date"
                )}
            </div>

            {/* What cannot be: a registered company whose date has not come, and a company formed after the day the business opens. */}
            {formationIssues(entity.formation, openingDate).map(issue => (
                <p key={issue} className="legal-entity-note-line legal-entity-field-wide settings-alarm" role="alert">{issue}</p>
            ))}

            {entity.formation.status === "planned" && (
                <p className="legal-entity-note-line legal-entity-field-wide">
                    Not registered yet: choose the legal form you intend to use above. The registry for your
                    country is filled in. Enter the registration number the registry gives you: the organization is then
                    registered, and its date can be given.
                </p>
            )}

            {/* THE REGISTRATIONS, ONE LIST: every row the same
                [Authority / Name][Number][×] -- the first (where
                the organization is registered, and its number)
                and any further ones -- under one pair of column
                heads; the card's title says "Registration".
                Removing the first moves the next one up;
                removing the only one leaves it empty. Not
                registered yet: only where it will be. */}
            <div className="legal-entity-field-wide legal-entity-registrations">

                <div className="legal-entity-number-row legal-entity-number-head">
                    <span className="legal-entity-label-info">
                        <span className="field-label legal-entity-label">
                            <InfoText text="Authority / Name">
                                <InfoNote label="Authority / Name" points={INFO.registrationAuthority} />
                            </InfoText>
                        </span>
                    </span>
                    <span className="field-label legal-entity-label">Number</span>
                </div>

                <div className="legal-entity-number-row">

                    {/* A name wraps and grows, never clipped. */}
                    {/* The authority is the country's own, filled in for the user and shown as text: nothing to mistype. Only a country the app does not know leaves it to be written. */}
                    <FrozenUntil answered={placeChosen} hint={placeHint}>
                        {ownAuthority
                            ? <span className="legal-entity-readonly-text legal-entity-authority-text" aria-label="Registration Authority">{ownAuthority}</span>
                            : (
                                <CardNameInput
                                    ariaLabel="Registration Authority"
                                    placeholder=""
                                    disabled={disabled}
                                    value={entity.formation.authority}
                                    onChange={(next) => updateFormation({ authority: next })}
                                />
                            )}
                    </FrozenUntil>

                    {/* The number is what registers the organization: it is always asked, and giving it makes the status Registered. */}
                    {expenseSymbol("formation-registration-number", true)}
                    <CardNameInput
                        ariaLabel="Registration Number"
                        // The shape this country issues, where
                        // that is something to say with confidence.
                        placeholder={profile.registrationNumberHint ?? "Number"}
                        disabled={disabled}
                        value={entity.formation.registrationNumber}
                        onChange={changeRegistrationNumber}
                    />

                    {entity.formation.registrationNumber.trim() !== "" && (
                        <button
                            type="button"
                            className="strategy-box-remove"
                            aria-label="Remove registration number"
                            title="Remove registration number"
                            disabled={disabled}
                            onClick={() => {
                                const [next, ...rest] = entity.formation.additionalNumbers;
                                // (The authority stays: it is the country's; the next number moves up into the first row.)
                                updateFormation(next
                                    ? { registrationNumber: next.number, additionalNumbers: rest }
                                    : { registrationNumber: "" });
                            }}
                        >
                            ×
                        </button>
                    )}

                </div>

                {!(entity.formation.status === "planned") && numberList(
                    entity.formation.additionalNumbers,
                    "What this number is called",
                    (next) => updateFormation({ additionalNumbers: next }),
                    "Registration number"
                )}

                {/* A number that looks too short is questioned, not refused. */}
                {entity.formation.registrationNumber.trim() !== "" && entity.formation.registrationNumber.trim().length < 5 && (
                    <p className="legal-entity-note-line legal-entity-field-wide">
                        That looks short for a registration number{profile.registrationNumberHint ? " (the usual shape: " + profile.registrationNumberHint + ")" : ""}. Check it against the registry.
                    </p>
                )}

                {/* At the end of the list: the list-end add
                    button, the list's whole width. */}
                {!(entity.formation.status === "planned") && entity.formation.additionalNumbers.length < MAX_MORE_NUMBERS && (
                    <button
                        type="button"
                        className="strategy-add-button legal-entity-list-add"
                        disabled={disabled}
                        onClick={() => updateFormation({
                            additionalNumbers: [
                                ...entity.formation.additionalNumbers,
                                createLegalEntityNumber()
                            ]
                        })}
                    >
                        + Add registration number
                    </button>
                )}

            </div>

        </div>
    ))
    );

    const section3 = (
    subsection(3, (
        <div className="legal-entity-grid legal-entity-grid-formation">

            <div className="legal-entity-field-wide legal-entity-registrations">

                <div className="legal-entity-number-row">
                    <span className="legal-entity-label-info legal-entity-row-label">
                        <span className="field-label legal-entity-label">
                            <InfoText text={(profile.taxIdName
                                    ? "Tax Identification Number (" + profile.taxIdName + ")"
                                    : "Tax Identification Number")}>
                                <InfoNote label={(profile.taxIdName
                                    ? "Tax Identification Number (" + profile.taxIdName + ")"
                                    : "Tax Identification Number")} points={INFO.taxNumber} />
                            </InfoText>
                        </span>
                    </span>
                    <CardNameInput
                        ariaLabel={(profile.taxIdName
                                    ? "Tax Identification Number (" + profile.taxIdName + ")"
                                    : "Tax Identification Number")}
                        placeholder=""
                        disabled={disabled}
                        value={entity.tax.identificationNumber}
                        // (Where the country's tax number has a certain shape -- the UTR's ten digits -- only that can be typed.)
                        onChange={(next) => updateTax({ identificationNumber: profile.taxIdNumberHint ? limitedRegistrationNumber(next, registrationNumberRule(profile.taxIdNumberHint)) : next })}
                    />
                </div>

                {sharesTaxAndRegistrationNumber(entity.organisation.country) && (
                    <p className="legal-entity-note-line">
                        In this country this is the same number as the Registration
                        Number, so it is filled in from there. Change it if yours
                        differs.
                    </p>
                )}

                {/* Not asked at all where the tax does not exist: five
                    US states levy no sales tax. */}
                {/* Only with a country chosen that has a particular
                    consumption tax (a profiled country); none
                    before, and none for a country without one. */}
                {!countryChosen || !profiled ? null : chosenSubdivision?.noConsumptionTax ? (
                    <p className="legal-entity-note-line">
                        {chosenSubdivision.name} levies no state sales tax, so there is
                        nothing to register here. You may still have to register in
                        other states you sell into.
                    </p>
                ) : (
                    <div className="legal-entity-number-row legal-entity-tax-row">
                        {/* The tick and its words, then their "i" OUTSIDE the
                            label, so reading the note never toggles the tick. */}
                        <span className="legal-entity-switch-cell">
                        <label className="legal-entity-switch">
                            <input
                                type="checkbox"
                                className="brand-tick-box"
                                aria-label={"Registered for " + profile.consumptionTax}
                                disabled={disabled}
                                checked={entity.tax.consumptionTaxStatus === "yes"}
                                onChange={(event) => updateTax({
                                    consumptionTaxStatus:
                                        (event.target.checked ? "yes" : "no") as LegalEntityTaxStatus
                                })}
                            />
                            <span className="legal-entity-switch-label">{profile.consumptionTax}</span>
                        </label>
                        <InfoNote label={profile.consumptionTax} points={consumptionTaxNote} fullList />
                        </span>
                        {entity.tax.consumptionTaxStatus === "yes" && expenseSymbol("tax-consumption-number", true)}
                        {entity.tax.consumptionTaxStatus === "yes" && (
                            <CardNameInput
                                ariaLabel={profile.consumptionTax + " Number"}
                                placeholder={profile.consumptionTax + " Number"}
                                disabled={disabled}
                                value={entity.tax.consumptionTaxNumber}
                                onChange={(next) => updateTax({ consumptionTaxNumber: next })}
                            />
                        )}
                    </div>
                )}

                {/* The heads of the list the user adds to, over its
                    first row: the tax number and the consumption tax
                    above are named beside their numbers, so a card
                    with only those has no heads at all. */}
                {entity.tax.additionalRegistrations.length > 0 && (
                    <div className="legal-entity-number-row legal-entity-number-head">
                        <span className="field-label legal-entity-label">Tax / Registration</span>
                        <span className="field-label legal-entity-label">Number</span>
                    </div>
                )}

                {numberList(
                    entity.tax.additionalRegistrations,
                    "What this registration is called",
                    (next) => updateTax({ additionalRegistrations: next }),
                    "Tax registration"
                )}

                {entity.tax.additionalRegistrations.length < MAX_MORE_NUMBERS && <button
                    type="button"
                    className="strategy-add-button legal-entity-list-add"
                    disabled={disabled}
                    onClick={() => updateTax({
                        additionalRegistrations: [
                            ...entity.tax.additionalRegistrations,
                            createLegalEntityNumber()
                        ]
                    })}
                >
                    + Add tax registration
                </button>}

            </div>

        </div>
    ))
    );

    /** One requirement's card; `always` is the card floating over its tile (open, with no fold arrow). */
    function requirementCard(requirement: LegalEntityValue["requirements"][number], index: number, always = false) {

                const open = always || folds.isOpen(requirement.id);

                /* The name leads the folded head; the
                   summary under it says the rest. */
                const summary = summaryText(
                    LEGAL_REQUIREMENT_TYPES.find(
                        type => type.id === requirement.type
                    )?.label ?? requirement.reference
                );

                return (

                <div className="legal-entity-card" key={requirement.id} data-anchor={"legal-requirement-" + requirement.id}>

                    <div className="legal-entity-card-head fold-card-head fold-card-fixed">

                        {!always && (
<FoldArrow
                                open={open}
                                label={"Requirement " + (index + 1)}
                                onToggle={() => folds.toggle(requirement.id)}
                            />
)}

                        <span className="legal-entity-card-number">
                            {(index + 1) + "."}
                        </span>

                        {/* The name in the head, as on every
                            folding card: edited here while open
                            (it wraps and grows), read here folded. */}
                        {open
                            ? (
                                <CardNameInput
                                    ariaLabel={"Legal requirement " + (index + 1) + " name"}
                                    placeholder="What the requirement is"
                                    disabled={disabled}
                                    value={requirement.name}
                                    onChange={(next) => update({
                                        requirements: entity.requirements.map(
                                            (candidate, position) => position === index
                                                ? { ...candidate, name: next }
                                                : candidate
                                        )
                                    })}
                                />
                            )
                            : (
                                <span className="strategy-name-static" title={requirement.name.trim() || undefined}>
                                    {requirement.name.trim() || "Unnamed requirement"}
                                </span>
                            )}

                        <button
                            type="button"
                            className="strategy-box-remove card-remove"
                            aria-label={"Remove legal requirement " + (index + 1)}
                            title={"Remove legal requirement " + (index + 1)}
                            disabled={disabled}
                            onClick={() => update({
                                requirements: entity.requirements.filter(
                                    (_candidate, position) => position !== index
                                )
                            })}
                        >
                            ×
                        </button>

                        {/* The rest, on a row of its own under
                            the name (see .fold-card-head). */}
                        {!open && summary && (
                            <span className="business-card-summary" title={summary}>{summary}</span>
                        )}

                    </div>

                    {open && (
                    <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-card legal-entity-grid-requirement">

                        {/* Reference or Number | Type, one row on the card's
                            two columns: the reference free text that wraps
                            and grows, the Type at the width its longest
                            option needs. */}
                        {/* Optional, so a tick box: ticked it asks for the reference; unticked it is empty. */}
                        <OptionalField
                            label="Reference or Number"
                            filled={requirement.reference.trim() !== ""}
                            disabled={disabled}
                            onClear={() => update({
                                requirements: entity.requirements.map((candidate, position) => position === index ? { ...candidate, reference: "" } : candidate)
                            })}
                        >
                            <CardNameInput
                                ariaLabel={"Legal requirement " + (index + 1) + " reference or number"}
                                placeholder=""
                                disabled={disabled}
                                value={requirement.reference}
                                onChange={(next) => update({
                                    requirements: entity.requirements.map(
                                        (candidate, position) => position === index
                                            ? { ...candidate, reference: next }
                                            : candidate
                                    )
                                })}
                            />
                        </OptionalField>

                        {/* The kinds this country usually asks for are said
                            in the Type's "i", not in its options. */}
                        {field(
                            "Type",
                            <OptionPicker
                                label={"Legal requirement " + (index + 1) + " type"}
                                options={LEGAL_REQUIREMENT_TYPES.map(type => type.label)}
                                disabled={disabled}
                                hug
                                value={LEGAL_REQUIREMENT_TYPES.find(
                                    candidate => candidate.id === requirement.type
                                )?.label ?? ""}
                                onChange={(next) => update({
                                    requirements: entity.requirements.map(
                                        (candidate, position) => position === index
                                            ? {
                                                ...candidate,
                                                type: LEGAL_REQUIREMENT_TYPES.find(
                                                    type => type.label === next
                                                )?.id ?? ""
                                            }
                                            : candidate
                                    )
                                })}
                            />,
                            false,
                            undefined,
                            commonRequirementsNote,
                            undefined,
                            true
                        )}

                        {/* Under the reference (the next row's first column): whether 6.'s expenses are
                            offered this requirement in their Links. */}
                        <div className="legal-entity-offer-line">
                        <label className="legal-entity-switch legal-entity-offer">
                            <input
                                type="checkbox"
                                className="brand-tick-box"
                                disabled={disabled}
                                checked={requirement.offerInExpenses}
                                onChange={(event) => offerInExpenses(index, event.target.checked)}
                            />
                            <span className="legal-entity-switch-label">Add to Legal Entity Expenses</span>
                        </label>
                        {expenseSymbol(requirement.id)}
                        </div>


                        {/* Named as 6.'s expenses name theirs; its key
                            stays "Relevant Information". */}
                        {optionalNote(
                            "Description / Relevant Information",
                            "Legal requirement " + (index + 1) + " notes",
                            requirement.notes,
                            (next) => update({
                                requirements: entity.requirements.map(
                                    (candidate, position) => position === index
                                        ? { ...candidate, notes: next }
                                        : candidate
                                )
                            }),
                            "Relevant Information"
                        )}

                    </div>
                    )}

                </div>

                );

    }

    /** One expense's card; `always` is the card floating over its tile (open, with no fold arrow). */
    function expenseCard(expense: LegalEntityValue["expenses"][number], index: number, always = false) {

                const open = always || folds.isOpen(expense.id);

                const summary = summaryText(
                    expense.cost ? moneyText(expense.cost, currency) : undefined,
                    expense.frequency
                );

                return (

                <div className="legal-entity-card" key={expense.id} data-anchor={"legal-expense-" + expense.id}>

                    <div className="legal-entity-card-head fold-card-head fold-card-fixed">

                        {!always && (
<FoldArrow
                                open={open}
                                label={"Expense " + (index + 1)}
                                onToggle={() => folds.toggle(expense.id)}
                            />
)}

                        <span className="legal-entity-card-number">
                            {(index + 1) + "."}
                        </span>

                        {/* The name in the head, as on every
                            folding card: edited here while open
                            (it wraps and grows), read here folded. */}
                        {expense.fromRequirement !== ""
                            ? (
                                /* Made by a requirement: named as it is, said as text and a link to it. */
                                <button
                                    type="button"
                                    className="strategy-name-static legal-entity-name-link"
                                    title={"Open the requirement " + expense.name.trim()}
                                    onClick={() => openOnPage({ tile: "legal-entity-registrations", card: expense.fromRequirement })}
                                >
                                    {expense.name.trim() || "Unnamed requirement"}
                                </button>
                            )
                            : open
                            ? (
                                <CardNameInput
                                    ariaLabel={"Expense " + (index + 1) + " name"}
                                    placeholder="What the expense is"
                                    disabled={disabled}
                                    value={expense.name}
                                    onChange={(next) => update({
                                        expenses: entity.expenses.map(
                                            (candidate, position) => position === index
                                                ? { ...candidate, name: next }
                                                : candidate
                                        )
                                    })}
                                />
                            )
                            : (
                                <span className="strategy-name-static" title={expense.name.trim() || undefined}>
                                    {expense.name.trim() || "Unnamed expense"}
                                </span>
                            )}

                        {expense.fromRequirement === "" && <button
                            type="button"
                            className="strategy-box-remove card-remove"
                            aria-label={"Remove expense " + (index + 1)}
                            title={"Remove expense " + (index + 1)}
                            disabled={disabled}
                            onClick={() => update({
                                expenses: entity.expenses.filter(
                                    (_candidate, position) => position !== index
                                )
                            })}
                        >
                            ×
                        </button>}

                        {/* The rest, on a row of its own under
                            the name (see .fold-card-head). */}
                        {!open && summary && (
                            <span className="business-card-summary" title={summary}>{summary}</span>
                        )}

                    </div>

                    {open && (
                    <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-expense legal-entity-grid-card legal-entity-grid-expense-card">

                        {/* The Date straight after the name: it places the cost in a month of the cash flow. */}
                        {field(
                            "Date",
                            <DateCellInput
                                ariaLabel={"Expense " + (index + 1) + " date"}
                                max={yearsAhead(5)}
                                disabled={disabled}
                                value={expense.date}
                                onChange={(next) => update({
                                    expenses: entity.expenses.map(
                                        (candidate, position) => position === index
                                            ? { ...candidate, date: next }
                                            : candidate
                                    )
                                })}
                            />,
                            false,
                            undefined,
                            undefined,
                            undefined,
                            true
                        )}

                        {field(
                            amountLabel("Cost"),
                            <input
                                type="text"
                                inputMode={numberInputMode(NUMBER_LIMITS.money)}
                                className="interview-input"
                                aria-label={"Expense " + (index + 1) + " cost"}
                                placeholder={currency || "Amount"}
                                disabled={disabled}
                                value={expense.cost}
                                onChange={(event) => update({
                                    expenses: entity.expenses.map(
                                        (candidate, position) => position === index
                                            ? { ...candidate, cost: limitedNumberText(event.target.value, expense.cost, NUMBER_LIMITS.money) }
                                            : candidate
                                    )
                                })}
                            />,
                            false,
                            undefined,
                            undefined,
                            undefined,
                            true
                        )}

                        {field(
                            "Frequency",
                            <OptionPicker
                                label={"Expense " + (index + 1) + " frequency"}
                                options={[...LEGAL_ENTITY_EXPENSE_FREQUENCIES]}
                                disabled={disabled}
                                value={expense.frequency}
                                onChange={(next) => update({
                                    expenses: entity.expenses.map(
                                        (candidate, position) => position === index
                                            ? { ...candidate, frequency: next }
                                            : candidate
                                    )
                                })}
                            />,
                            false,
                            undefined,
                            undefined,
                            undefined,
                            true
                        )}

                        {/*
                            The founders named in 2. Founders & Ownership, by
                            id -- so renaming a founder
                            renames them here too, and an
                            expense can never name someone
                            who has been removed.

                            Asked only where there is a
                            choice to be made. One founder
                            answers this by being the only
                            one there is, and none leaves
                            nothing to answer it with, so
                            neither is shown the question.
                        */}
                        {/* "Responsible", as on every other card: a tick, and the picker beside it while it is ticked (unticked, the choice goes). */}
                        {namedFounders.length > 1 && (
                            <BusinessField
                                label="Responsible"
                                inline
                                fieldId="Responsibility"
                                className="legal-entity-field-wide"
                                tick={{
                                    on: !noResponsible.has(expense.id),
                                    onChange: (on) => {
                                        setNoResponsible(current => {
                                            const next = new Set(current);
                                            if (on) {
                                                next.delete(expense.id);
                                            } else {
                                                next.add(expense.id);
                                            }
                                            return next;
                                        });
                                        if (!on && expense.responsibility !== "") {
                                            update({ expenses: entity.expenses.map((candidate, position) => position === index ? { ...candidate, responsibility: "" } : candidate) });
                                        }
                                    },
                                    disabled,
                                    ariaLabel: "Expense " + (index + 1) + " has a responsible"
                                }}
                            >
                            {!noResponsible.has(expense.id) && <OptionPicker
                                label={"Expense " + (index + 1) + " responsibility"}
                                options={namedFounders.map(founder => founder.name)}
                                disabled={disabled}
                                value={
                                    namedFounders.find(
                                        founder => founder.id === expense.responsibility
                                    )?.name ?? ""
                                }
                                onChange={(next) => update({
                                    expenses: entity.expenses.map(
                                        (candidate, position) => position === index
                                            ? {
                                                ...candidate,
                                                responsibility: namedFounders.find(
                                                    founder => founder.name === next
                                                )?.id ?? ""
                                            }
                                            : candidate
                                    )
                                })}
                            />}
                            </BusinessField>
                        )}

                        {/*
                            Exactly one registration or requirement, chosen from what has
                            actually been recorded on this page, so none can go stale.
                        */}
                        {expense.fromRequirement !== ""
                            ? null
                            : linkTargets.length === 0
                            ? (
                                <p className="legal-entity-empty-note legal-entity-field-wide">
                                    Record a registration number or a legal requirement
                                    above, and you can link it here.
                                </p>
                            )
                            : field(
                                "Linked registration",
                                <OptionPicker
                                    label={"Expense " + (index + 1) + " linked registration"}
                                    placeholder="Select"
                                    options={linkTargets.filter(target => !entity.requirements.some(requirement => requirement.id === target.id && requirement.offerInExpenses)).map(target => target.label)}
                                    disabled={disabled}
                                    value={linkTargets.find(target => expense.links.includes(target.id))?.label ?? ""}
                                    onChange={(next) => update({
                                        expenses: entity.expenses.map(
                                            (candidate, position) => position === index
                                                ? { ...candidate, links: [linkTargets.find(target => target.label === next)?.id ?? ""].filter(Boolean) }
                                                : candidate
                                        )
                                    })}
                                />,
                                true,
                                undefined,
                                INFO.links,
                                undefined,
                                false,
                                (() => {
                                    const target = linkTargets.find(entry => expense.links.includes(entry.id));
                                    return target ? <LinkSymbol noun="Registration" name={target.label} onOpen={() => openOnPage(registrationRequest(target.id))} /> : null;
                                })()
                            )}

                        {optionalNote(
                            "Description / Relevant Information",
                            "Expense " + (index + 1) + " description",
                            expense.description,
                            (next) => update({
                                expenses: entity.expenses.map(
                                    (candidate, position) => position === index
                                        ? { ...candidate, description: next }
                                        : candidate
                                )
                            })
                        )}

                    </div>
                    )}

                </div>

                );

    }

    const section4 = (
    subsection(4, (
        <>

            {entity.requirements.map((requirement, index) => requirementCard(requirement, index))}

            <button
                type="button"
                className="strategy-add-button card-list-add"
                disabled={disabled}
                onClick={() => {
                    const requirement = createLegalEntityRequirement();
                    update({
                        requirements: [
                            ...entity.requirements,
                            requirement
                        ]
                    });
                    folds.expand(requirement.id);
                }}
            >
                + Add legal requirement
            </button>

        </>
    ), undefined, (
        <FoldAllToggle
            ids={entity.requirements.map(requirement => requirement.id)}
            folds={folds}
            label="legal requirements"
        />
    ), INFO.requirements)
    );

    const section5 = (
    subsection(5, (
        <>

            {entity.expenses.map((expense, index) => expenseCard(expense, index))}

            <button
                type="button"
                className="strategy-add-button card-list-add"
                disabled={disabled}
                onClick={() => {
                    const expense = createLegalEntityExpense();
                    update({
                        expenses: [...entity.expenses, expense]
                    });
                    folds.expand(expense.id);
                }}
            >
                + Add expense
            </button>

        </>
    ), undefined, (
        <FoldAllToggle
            ids={entity.expenses.map(expense => expense.id)}
            folds={folds}
            label="legal entity expenses"
        />
    ), INFO.expenses)
    );


    /* THE PAGE AS TILES (the page's tile system), one for each of its six sections. A tile opens its section in its dialog: Organization and Founders & Ownership with no
       frame around them, Formation & Registration and Tax & Business Registration in theirs; Additional Legal Requirements and Legal Entity Expenses open a box for each card
       (as the Business System's cards do), and a box opens its card floating. */
    if (asTiles) {
        const lines = (list: readonly string[], count = 4) => list.map(text => text.trim()).filter(text => text.length > 0).slice(0, count);
        const rail = (section: number) => railId(LEGAL_ENTITY_SECTIONS[section]);
        // (Every dialog of the page opens with the one heading the Business System's do: the title, then its "i".)
        const SECTION_INFO: Record<number, InfoPoint[]> = {
            0: ["What the organization is in law: its name, what it does, its legal form and where it is."],
            1: ["Who owns the organization, and how much of it each founder owns."]
        };
        const plain = (section: number, body: ReactNode) => (
            <div className="column-tile-content legal-entity legal-entity-unframed" data-rail={rail(section)}>
                <div className="business-engagement-section-head"><DialogHeading title={LEGAL_ENTITY_SECTIONS[section]} info={SECTION_INFO[section]} /></div>
                <div className="legal-entity-body">{body}</div>
            </div>
        );
        /** A card floating over its tile keeps the page's Legal Entity scope. */
        const floating = (card: ReactNode) => <div className="column-tile-content legal-entity"><div className="legal-entity-body">{card}</div></div>;
        const dialogOf = (section: number, info: InfoPoint[], boxes: ReactNode) => (
            <div className="column-tile-content legal-entity" data-rail={rail(section)}>
                <div className="business-engagement-section-head"><DialogHeading title={section === 5 ? "Expenses" : LEGAL_ENTITY_SECTIONS[section]} info={info} /></div>
                {boxes}
            </div>
        );
        const typeLabel = (requirement: LegalEntityValue["requirements"][number]) => LEGAL_REQUIREMENT_TYPES.find(type => type.id === requirement.type)?.label ?? "";
        /** The circles of a tile: one for each expense linked to any of these registrations. */
        const expenseCircles = (targets: readonly string[]): FloorLink[] => entity.expenses
            .filter(expense => targets.some(target => target !== "" && expense.links.includes(target)))
            .map(expense => ({ id: expense.id, name: expense.name.trim() || "Unnamed expense", type: "expense" as const }));
        /** The circles of an expense: one for each registration (a number, a requirement) it is for. */
        const registrationCircles = (expense: LegalEntityValue["expenses"][number]): FloorLink[] => linkTargets
            .filter(target => expense.links.includes(target.id))
            .map(target => ({ id: target.id, name: target.label, type: "registration" as const }));
        const requirementBoxes: CardBox[] = entity.requirements.map((requirement, index) => ({
            id: requirement.id,
            number: index + 1,
            name: requirement.name,
            unnamed: "Unnamed requirement",
            centred: true,
            // The Type and the Reference or Number (and, where an expense is linked to it, that it has expenses).
            lines: [typeLabel(requirement), requirement.reference.trim(), entity.expenses.some(expense => expense.links.includes(requirement.id)) ? "**Has expenses**" : ""].filter(line => line.length > 0),
            own: true,
            links: expenseCircles([requirement.id]),
            content: () => null
        }));
        /** "Companies House: 16234587" as its name and, under it, the number; a requirement or a name alone is said as it is. */
        const shortRegistration = (label: string): string[] => label.includes(": ") ? [label.slice(0, label.lastIndexOf(": ")), label.slice(label.lastIndexOf(": ") + 2)] : [label];
        const linkedLabel = (expense: LegalEntityValue["expenses"][number]) => linkTargets.find(target => expense.links.includes(target.id))?.label ?? "";
        const expenseBoxes: CardBox[] = entity.expenses.map((expense, index) => ({
            id: expense.id,
            number: index + 1,
            name: expense.name,
            unnamed: "Unnamed expense",
            plain: true,
            // The start date, the registration number it belongs to (RN: ...), and its cost.
            lines: [shownDay(expense.date), ...shortRegistration(linkedLabel(expense)), [expense.cost ? "**" + moneyText(expense.cost, currency) + "**" : "", expense.frequency].filter(Boolean).join(" ")].filter(line => line.length > 0),
            own: true,
            links: registrationCircles(expense),
            content: () => null
        }));
        const addOf = (kind: "requirement" | "expense"): CardBoxAdd => ({
            label: kind === "requirement" ? "legal requirement" : "expense",
            disabled,
            onAdd: () => {
                const made = kind === "requirement" ? createLegalEntityRequirement() : createLegalEntityExpense();
                update(kind === "requirement"
                    ? { requirements: [...asLegalEntityValue(latest.current.value).requirements, made as ReturnType<typeof createLegalEntityRequirement>] }
                    : { expenses: [...asLegalEntityValue(latest.current.value).expenses, made as ReturnType<typeof createLegalEntityExpense>] });
                return made.id;
            },
            isBlank: (id: string) => {
                const card = kind === "requirement"
                    ? asLegalEntityValue(latest.current.value).requirements.find(candidate => candidate.id === id)
                    : asLegalEntityValue(latest.current.value).expenses.find(candidate => candidate.id === id);
                return !card || JSON.stringify({ ...card, id: "" }) === JSON.stringify({ ...(kind === "requirement" ? createLegalEntityRequirement() : createLegalEntityExpense()), id: "" });
            },
            onRemove: (ids: string[]) => update(kind === "requirement"
                ? { requirements: asLegalEntityValue(latest.current.value).requirements.filter(candidate => !ids.includes(candidate.id)) }
                : { expenses: asLegalEntityValue(latest.current.value).expenses.filter(candidate => !ids.includes(candidate.id)) })
        });
        /** A requirement and the expense it made are drawn together, the requirement above. */
        const pairOf = (id: string) => {
            const made = entity.expenses.find(expense => expense.fromRequirement !== "" && (expense.id === id || expense.fromRequirement === id));
            return made && entity.requirements.some(requirement => requirement.id === made.fromRequirement)
                ? { parent: { id: made.fromRequirement, caption: "Additional legal requirement" }, child: { id: made.id, caption: "Expense" } }
                : null;
        };
        const cardOf = (id: string): ReactNode => {
            const requirement = entity.requirements.findIndex(candidate => candidate.id === id);
            if (requirement >= 0) {
                return floating(requirementCard(entity.requirements[requirement], requirement, true));
            }
            const expense = entity.expenses.findIndex(candidate => candidate.id === id);
            return expense >= 0 ? floating(expenseCard(entity.expenses[expense], expense, true)) : null;
        };
        const named = entity.founders.filter(founder => founder.name.trim());
        const foundersListed = named.length === 1
            ? { items: [named[0].name.trim()], marks: [{ centre: true }] }
            : {
                // (A name, then its share after a dash: two columns, the dashes in one.)
                items: lines(named.map(founder => founder.name.trim() + "\u0001" + (founder.ownership.trim() ? "\u2014 " + founder.ownership.trim() + "%" : "")), 8),
                marks: named.map(() => undefined)
            };
        const expenseEntries = entity.expenses.filter(expense => expense.name.trim().length > 0).slice(0, 8);
        // The address: its lines, the city and the post code (the last two) next to each other.
        const written = entity.organisation.addressLine1.split("\n").map(text => text.trim()).filter(text => text.length > 0);
        const addressLines = written.length >= 3 ? [...written.slice(0, written.length - 2), written.slice(-2).join(" ")] : written;
        /** The link of a line that names a registration: the first expense linked to it (a press opens that expense's card). */
        const expenseLink = (targetId: string): TileLink | undefined => {
            const expense = entity.expenses.find(candidate => candidate.links.includes(targetId));
            return expense ? { card: expense.id } : undefined;
        };
        // The lines of the Formation's and the Tax's tiles, each with the registration it names (the expense linked to it gives the line its link).
        const formationEntries = [
            { text: entity.formation.status === "planned" ? "Planned" : "Registered" + (entity.formation.date ? ": " + shownDay(entity.formation.date) : ""), target: "formation-registration-number" },
            { text: entity.formation.authority, target: "" },
            ...entity.formation.additionalNumbers.map(number => ({ text: number.label, target: number.id }))
        ].filter(entry => entry.text.trim().length > 0).slice(0, 6);
        const taxEntries = [
            { text: entity.tax.identificationNumber.trim() ? (profile.taxIdName || "Tax ID") + ": " + entity.tax.identificationNumber.trim() : "", target: "" },
            { text: entity.tax.consumptionTaxStatus === "yes" ? "VAT " + entity.tax.consumptionTaxNumber : "", target: "tax-consumption-number" },
            ...entity.tax.additionalRegistrations.map(registration => ({ text: registration.label, target: registration.id }))
        ].filter(entry => entry.text.trim().length > 0).slice(0, 6);
        const tiles: SectionTile[] = [
            {
                id: "legal-entity-organization", title: "Organization", large: true, rail: rail(0),
                // The name (in bold), its legal form, then the address.
                items: [...lines([entity.organisation.name.trim() ? "**" + entity.organisation.name.trim() + "**" : "", entity.organisation.legalForm]), TILE_DIVIDER, ...addressLines],
                content: () => plain(0, section0)
            },
            {
                id: "legal-entity-founders", title: "Founders & Ownership", large: true, rail: rail(1),
                // Several owners: a bulleted list, each name an em dash and its share. One alone: just the name, in the centre.
                items: foundersListed.items,
                itemMarks: foundersListed.marks,
                content: () => plain(1, section1)
            },
            {
                id: "legal-entity-registrations", title: "Registrations", large: true, rail: rail(2), view: true,
                // The state, then the names of the registration numbers (the formation's, the tax's) and the requirements.
                items: ["Formation & registration", "Tax & business registration", "Additional legal requirements"],
                // (A second bullet, in the link's colour, where a registration of that section is linked to an expense.)
                itemMarks: [{ bullet: true }, { bullet: true }, { bullet: true }],
                links: [{ box: "formation" }, { box: "tax" }, { box: "requirements" }],
                holds: entity.requirements.map(requirement => requirement.id),
                cardFor: cardOf,
                pairOf,
                content: () => (
                    <div className="column-tile-content legal-entity legal-entity-unframed" data-rail={rail(2)}>
                        <div className="business-engagement-section-head"><DialogHeading title="Registrations" /></div>
                        <SubTiles
                            label="Registrations"
                            tiles={[
                                {
                                    id: "formation",
                                    title: "Formation & registration",
                                    items: formationEntries.map(entry => entry.text),
                                    itemMarks: formationEntries.map((_entry, at) => at === 0 ? { plain: true } : { bullet: true }),
                                    links: formationEntries.map(entry => expenseLink(entry.target)),
                                    circles: expenseCircles(["formation-registration-number", ...entity.formation.additionalNumbers.map(number => number.id)]),
                                    content: () => <div className="legal-entity-body legal-entity-subview">{section2}</div>
                                },
                                {
                                    id: "tax",
                                    title: "Tax & business registration",
                                    items: taxEntries.map(entry => entry.text),
                                    itemMarks: taxEntries.map(() => ({ bullet: true })),
                                    links: taxEntries.map(entry => expenseLink(entry.target)),
                                    circles: expenseCircles(["tax-consumption-number", ...entity.tax.additionalRegistrations.map(registration => registration.id)]),
                                    content: () => <div className="legal-entity-body legal-entity-subview">{section3}</div>
                                },
                                {
                                    id: "requirements",
                                    title: "Additional legal requirements",
                                    items: entity.requirements.filter(requirement => requirement.name.trim()).slice(0, 6).map(requirement => requirement.name.trim()),
                                    itemMarks: entity.requirements.filter(requirement => requirement.name.trim()).slice(0, 6).map(() => ({ bullet: true })),
                                    links: entity.requirements.filter(requirement => requirement.name.trim()).slice(0, 6).map(requirement => ({ card: requirement.id })),
                                    circles: expenseCircles(entity.requirements.map(requirement => requirement.id)),
                                    add: addOf("requirement"),
                                    content: () => <CardBoxes items={requirementBoxes} label="Legal requirements" what="Requirement" add={addOf("requirement")} autoStart={false} />
                                }
                            ]}
                        />
                    </div>
                )
            },
            {
                id: "legal-entity-expenses", title: "Expenses", large: true, rail: rail(5), view: true,
                items: expenseEntries.map(expense => expense.name.trim()),
                itemMarks: expenseEntries.map(() => ({ bullet: true })),
                links: expenseEntries.map(expense => ({ card: expense.id })),
                holds: entity.expenses.map(expense => expense.id),
                cardFor: cardOf,
                pairOf,
                add: addOf("expense"),
                content: () => dialogOf(5, INFO.expenses, <CardBoxes items={expenseBoxes} label="Expenses" what="Expense" add={addOf("expense")} />)
            }
        ];
        return (
            <div className="answer-columns business-foundation business-engagement business-capability column-tiles-page" style={{ "--answer-column-count": 1 } as CSSProperties}>
                <div
                    className="business-foundation-input business-foundation-card business-engagement-input"
                    data-anchor="column-tiles"
                    style={{ "--strategy-theme-hue": workHue("define") } as CSSProperties}
                >
                    <div className="card-scroll">
                        <div className="business-capability-section business-capability-tiles-section">
                            {frameTitle ? <div className="business-engagement-section-head tiles-frame-head"><span className="field-group-title business-foundation-subhead">{frameTitle}</span></div> : <div className="business-capability-heading-spacer" aria-hidden="true" />}
                            <SectionTiles label={LEGAL_ENTITY_SECTIONS.join(", ")} hue={workHue("define")} tiles={tiles} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    return (

        <div
            className="brand-style legal-entity"
            style={{ "--answer-column-count": 1 } as CSSProperties}
        >

            <div className="brand-style-head">

                {showInstructions && (
                    <div className="answer-column-questions">
                        <span className="answer-question-line answer-question-line-bullet">
                            • Record what your organization is legally, who owns it, how it
                            was registered, and how it is identified for tax.
                        </span>
                        <span className="answer-question-line answer-question-line-bullet">
                            • Start with the Country and the Legal Form. The rest of the page
                            adjusts to them.
                        </span>
                        <span className="answer-question-line answer-question-line-bullet">
                            • Leave out anything your organization does not have. Use the Add
                            buttons only for what applies to you.
                        </span>
                    </div>
                )}

            </div>

            {columnsDivider && (
                <div className="answer-columns-divider">{columnsDivider}</div>
            )}

            <div className="legal-entity-body">

                {/*
                    Subsections 1 and 2 side by side, each half the page
                    as every subsection here: what the organization is
                    and where, beside who owns it. Each as tall as its
                    own content.
                */}
                <div className="legal-entity-row">

                {/* ---------- 1. Organisation ---------- */}

                {section0}

                {/* ---------- 2. Founders & Ownership ---------- */}

                {section1}

                </div>

                {/*
                    Subsections 3 and 4 side by side: how the organisation is
                    registered, and how it is identified for tax, are
                    the two halves of the same page of paperwork. In
                    the nine countries where one number does both
                    jobs, they are literally the same answer, and
                    seeing them together is what makes that obvious.
                */}
                <div className="legal-entity-row">

                {/* ---------- 3. Formation & Registration ---------- */}

                {section2}

                {/* ---------- 4. Tax & Business Registration ---------- */}

                {/* ONE LIST on the Name | Number columns of 3.: the tax
                    number first (its local name, "UTR", "EIN") beside its
                    box, then the consumption tax as a tick (ticked, its
                    number beside it; unticked, not registered -- which is
                    also the answer where it does not apply), then, under
                    "Tax / Registration" and "Number", any others added,
                    each with its ×. The ×
                    column is kept on every row, so the Number column stands
                    at the same x as 3.'s. */}
                {section3}

                </div>

                {/*
                    The other pair. What else the law asks of this
                    organisation, beside what all of it costs -- a
                    requirement and its expense are usually the same
                    fact counted twice, and an expense here can link
                    straight to a requirement there. Side by side is
                    what makes that reachable without scrolling
                    between them.
                */}
                <div className="legal-entity-row">

                {/* ---------- 5. Additional Legal Requirements ---------- */}

                {section4}

                {/* ---------- 6. Legal Entity Expenses ---------- */}

                {section5}

                </div>

            </div>

        </div>

    );

}
