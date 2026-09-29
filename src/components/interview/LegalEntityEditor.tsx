import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

import {
    LEGAL_ENTITY_SECTIONS,
    LegalEntityFounderValue,
    LegalEntityNumberValue,
    LegalEntityTaxStatus,
    LegalEntityValue,
    asLegalEntityValue,
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
import { FieldFlagButton, FieldStatus } from "./fieldAnnotations.tsx";
import { NUMBER_LIMITS, NumberLimit, limitedNumberText, numberInputMode } from "./numberInput.ts";
import OptionPicker from "./OptionPicker.tsx";
import StrategyTextArea from "./StrategyTextArea.tsx";
import { useItemFolds } from "./useItemFolds.ts";
import FoldArrow from "./FoldArrow.tsx";

/**
 * The last entry in every Legal Form list. The brief forbids
 * prescribing a legal form, and a list of them goes stale the
 * moment a country adds one -- so the way out is always on offer,
 * inside the list rather than as a second field beside it.
 */
const LEGAL_FORM_OTHER = "Other (not listed)";

/** The key the second address line is opened and closed under. */
const ADDRESS_LINE_2 = "address-line-2";

/** Why ownership must total 100%, the "i" beside the running total. */
const TOTAL_OWNERSHIP_HELP: InfoPoint[] = [
    {
        title: "Formula",
        text: "Each owner's % = their shares ÷ total shares, so the total must be 100%"
    }
];

/* Registration status choices. */
const REGISTERED = "Registered";
const NOT_YET_REGISTERED = "Not yet registered";

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

    mainActivity: [
        "The work the organization actually does, described factually.",
        "Write it as a registry or a bank would expect to read it.",
        "Some countries classify it with an official activity code."
    ],

    legalForm: [
        "Decides who is liable for the organization's debts: the organization, or you personally.",
        "Decides how it is taxed, and whether it must hold share capital.",
        "Choose Other (not listed) to name a form the list does not carry."
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
        "Says which registration or requirement this expense pays for.",
        "Lists what you have already recorded further up the page."
    ]

};

interface LegalEntityEditorProps {

    value: unknown;

    onChange: (value: LegalEntityValue) => void;

    disabled?: boolean;

    /** See BrandStyleEditor.columnsDivider. */
    columnsDivider?: ReactNode;

    /** See AnswerRendererProps.showInstructions. */
    showInstructions?: boolean;

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

/** Today, `years` from now, as a date input's "YYYY-MM-DD". */
function yearsAhead(years: number): string {
    const today = new Date();
    const date = new Date(today.getFullYear() + years, today.getMonth(), today.getDate());
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

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

    onChange,

    disabled = false,

    columnsDivider,

    showInstructions = true,

    prefill,

    foundersProfile

}: LegalEntityEditorProps) {

    const entity = asLegalEntityValue(value);

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

    /**
     * The optional fields the user has asked to see: an address's
     * second line, a requirement's relevant information, an
     * expense's description. Each is keyed by what it belongs to,
     * so two expenses open and close independently.
     *
     * A field is on show when it has been opened here OR when it
     * already holds something -- which is what carries a filled-in
     * field across a later visit, without a stored flag to keep in
     * step with it. The × beside it clears the value and drops
     * the key, and the "+ Add" button comes back.
     */
    const [opened, setOpened] = useState<ReadonlySet<string>>(new Set());

    /** Which Requirement and Expense cards are open -- see useItemFolds. */
    const folds = useItemFolds();

    function openField(key: string) {
        setOpened(current => new Set(current).add(key));
    }

    function closeField(key: string) {
        setOpened(current => {
            const next = new Set(current);
            next.delete(key);
            return next;
        });
    }

    function fieldShown(key: string, current: string): boolean {
        return opened.has(key) || current.trim().length > 0;
    }

    /** An amount label, with the currency when one is known. */
    function amountLabel(base: string): string {
        return currency ? base + " (" + currency + ")" : base;
    }

    function update(patch: Partial<LegalEntityValue>) {
        onChange({ ...entity, ...patch });
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

        if (formation.authority.trim().length === 0 && authority) {
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
    function changeRegistrationNumber(next: string) {

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
                label: "Registration Number: " + entity.formation.registrationNumber
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
            .filter(requirement => requirement.name.trim().length > 0)
            .map(requirement => ({
                id: requirement.id,
                label: (LEGAL_REQUIREMENT_TYPES.find(type => type.id === requirement.type)?.label
                    ?? "Legal requirement") + ": " + requirement.name.trim()
            }))
    ];

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
     */
    function subsection(index: number, children: ReactNode, title?: string, titleExtra?: ReactNode) {

        const heading = (
            <h3 className="legal-entity-section-head">
                <span className="legal-entity-section-number">
                    {subsectionNumber(index)}
                </span>
                <span className="legal-entity-section-title">
                    {title ?? LEGAL_ENTITY_SECTIONS[index]}
                    <FieldFlagButton label={title ?? LEGAL_ENTITY_SECTIONS[index]} section={railId(LEGAL_ENTITY_SECTIONS[index])} />
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
        info?: string[]
    ) {
        return (
            <>
                {onRemove
                    ? (
                        <span
                            className={
                                "legal-entity-label-row" +
                                (nested ? " legal-entity-label-nested" : "")
                            }
                        >
                            <span className="field-label legal-entity-label">{label}<FieldFlagButton label={label} /></span>
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
                                    <FieldFlagButton label={label} />
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
                                <FieldFlagButton label={label} />
                            </span>
                        )}
                <FieldStatus label={label} />
                {control}
            </>
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
     * card, which most of them never carry.
     *
     * Out of the way until it is asked for: the "+ Add" button
     * stands in its place, and once open a × on its label sends
     * it away again. The × clears what is in it, because a
     * value left behind would open the field on its own at the next
     * visit and the button would never come back.
     *
     * `info` puts a note on the label; `addText` words the button
     * where the label's own wording would not read as one.
     */
    function optionalNote(
        label: string,
        key: string,
        ariaLabel: string,
        current: string,
        onNext: (next: string) => void,
        info?: string[],
        addText?: string
    ) {

        if (!fieldShown(key, current)) {
            return (
                <div className="legal-entity-field-wide">
                    {addFieldButton(addText ?? label, key)}
                </div>
            );
        }

        return field(
            label,
            <StrategyTextArea
                className="interview-input legal-entity-note"
                ariaLabel={ariaLabel}
                disabled={disabled}
                value={current}
                onChange={onNext}
            />,
            true,
            () => {
                closeField(key);
                onNext("");
            },
            info
        );

    }

    /** The button an optional field hides behind until it is wanted. */
    function addFieldButton(label: string, key: string) {
        return (
            <button
                type="button"
                className="strategy-add-button legal-entity-add-inline"
                disabled={disabled}
                onClick={() => openField(key)}
            >
                {"+ Add " + label}
            </button>
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
        info?: string[]
    ) {
        return (
            <div className={"legal-entity-field" + (wide ? " legal-entity-field-wide" : "")}>
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
                                            <FieldFlagButton label={label} />
                                        </span>
                                    </span>
                                )
                                : <span className="field-label legal-entity-label">{label}<FieldFlagButton label={label} /></span>}
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
                                    <FieldFlagButton label={label} />
                                </span>
                            </span>
                        )
                        : <span className="field-label legal-entity-label">{label}<FieldFlagButton label={label} /></span>}
                <FieldStatus label={label} />
                {control}
            </div>
        );
    }

    function text(
        label: string,
        current: string,
        onNext: (next: string) => void,
        placeholder?: string,
        wide = false,
        info?: string[],
        /** When several fields share a label: which one this is. */
        ariaLabel?: string,
        /** A number box: what it accepts. */
        limits?: NumberLimit
    ) {
        return field(
            label,
            <input
                type="text"
                inputMode={limits ? numberInputMode(limits) : undefined}
                className="interview-input"
                aria-label={ariaLabel ?? label}
                placeholder={placeholder}
                disabled={disabled}
                value={current}
                onChange={(event) => onNext(limits
                    ? limitedNumberText(event.target.value, current, limits)
                    : event.target.value)}
            />,
            wide,
            undefined,
            info
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

                <input
                    type="text"
                    className="interview-input"
                    aria-label={noun + " " + (index + 1) + " name"}
                    placeholder={labelPlaceholder}
                    disabled={disabled}
                    value={entry.label}
                    onChange={(event) => onNext(entries.map(
                        (candidate, position) => position === index
                            ? { ...candidate, label: event.target.value }
                            : candidate
                    ))}
                />

                <input
                    type="text"
                    className="interview-input"
                    aria-label={noun + " " + (index + 1)}
                    placeholder="Number"
                    disabled={disabled}
                    value={entry.number}
                    onChange={(event) => onNext(entries.map(
                        (candidate, position) => position === index
                            ? { ...candidate, number: event.target.value }
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

                {/* ---------- 1. Organisation ---------- */}

                {subsection(0, (
                    <div className="legal-entity-grid legal-entity-grid-three">

                        {/*
                            Three columns, each one subject.

                            Who the organisation is and what it does;
                            where it is; and what it is legally. Read
                            down a column rather than across a grid,
                            so a founder answers one question at a
                            time instead of stepping between three.
                        */}

                        {/* ---- Who it is, and what it does ---- */}
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
                                actually issues one, and only once the
                                activity it classifies has been
                                described.
                            */}
                            {profile.activityCode &&
                                entity.organisation.mainActivity.trim().length > 0 &&
                                labelled(
                                    profile.activityCode,
                                    textControl(
                                        profile.activityCode,
                                        entity.organisation.activityCode,
                                        (next) => updateOrganisation({ activityCode: next }),
                                        "Optional"
                                    ),
                                    true
                                )}

                        </div>

                        {/* ---- Where it is ---- */}
                        <div className="legal-entity-field">

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
                            {subdivisionSpec && labelled(
                                subdivisionSpec.label,
                                <OptionPicker
                                    label={subdivisionSpec.label}
                                    placeholder={"Select a " + subdivisionSpec.label.toLowerCase()}
                                    options={[
                                        ...subdivisionSpec.options.map(option => option.name),
                                        LEGAL_FORM_OTHER
                                    ]}
                                    // Typed the same way a country is,
                                    // by name or by code.
                                    searchable
                                    searchAliases={subdivisionSearchAliases(
                                        entity.organisation.country
                                    )}
                                    disabled={disabled}
                                    value={entity.organisation.subdivision}
                                    onChange={chooseSubdivision}
                                />,
                                true
                            )}

                            {labelled(
                                "City",
                                textControl(
                                    "City",
                                    entity.organisation.city,
                                    (next) => updateOrganisation({ city: next })
                                ),
                                true
                            )}

                            {labelled(
                                "Address 1",
                                textControl(
                                    "Address 1",
                                    entity.organisation.addressLine1,
                                    (next) => updateOrganisation({ addressLine1: next }),
                                    "Street and number"
                                ),
                                true
                            )}

                            {/*
                                Behind a button, like everything else
                                optional on this page. Most addresses
                                are one line, and a second empty box
                                on every form is a question nearly
                                nobody has to answer.
                            */}
                            {fieldShown(ADDRESS_LINE_2, entity.organisation.addressLine2)
                                ? labelled(
                                    "Address 2",
                                    textControl(
                                        "Address 2",
                                        entity.organisation.addressLine2,
                                        (next) => updateOrganisation({ addressLine2: next })
                                    ),
                                    true,
                                    () => {
                                        closeField(ADDRESS_LINE_2);
                                        updateOrganisation({ addressLine2: "" });
                                    }
                                )
                                : addFieldButton("Address 2", ADDRESS_LINE_2)}

                            {/* Not every country codes its addresses. */}
                            {postalLabel && labelled(
                                postalLabel,
                                textControl(
                                    postalLabel,
                                    entity.organisation.postalCode,
                                    (next) => updateOrganisation({ postalCode: next })
                                ),
                                true
                            )}

                        </div>

                        {/* ---- What it is legally ---- */}
                        <div className="legal-entity-field">

                            {forms.length > 0 ? labelled(
                                "Legal Form",
                                <OptionPicker
                                    label="Legal Form"
                                    placeholder="Select a legal form"
                                    options={[
                                        ...forms.map(form => form.label),
                                        LEGAL_FORM_OTHER
                                    ]}
                                    disabled={disabled}
                                    value={entity.organisation.legalForm}
                                    onChange={chooseLegalForm}
                                />,
                                false,
                                undefined,
                                INFO.legalForm
                            ) : labelled(
                                "Legal Form",
                                textControl(
                                    "Legal Form",
                                    entity.organisation.legalFormOther,
                                    (next) => updateOrganisation({ legalFormOther: next }),
                                    "Enter the legal form"
                                )
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

                        </div>

                        {entity.organisation.country.trim().length > 0 && !profiled && (
                            <p className="legal-entity-note-line">
                                This app holds no legal form or tax detail for the country you
                                chose, so the questions below stay general. Your jurisdiction may
                                require something different, so check with someone who knows
                                it.
                            </p>
                        )}

                    </div>
                ))}

                {/* ---------- 2. Founders & Ownership ---------- */}

                {subsection(1, (
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

                                    <input
                                        type="text"
                                        className="interview-input"
                                        aria-label={"Founder " + (index + 1) + " name"}
                                        placeholder="Name"
                                        disabled={disabled}
                                        value={founder.name}
                                        onChange={(event) => updateFounder(index, {
                                            name: event.target.value
                                        })}
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
                                                aria-label={"Founder " + (index + 1) + " " + amountLabel("capital")}
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
                                                className="strategy-box-remove"
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
                                className="strategy-add-button"
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

                                {entity.capitalApplies && (
                                    <span className="legal-entity-total">
                                        {amountLabel("Total Capital")}
                                        : {percent(totalCapital)}
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
                )}

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

                {subsection(2, (
                    <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-formation">

                        {/* A founder planning the organization has no
                            date or number yet: say so, and the page
                            asks only where it will be registered. */}
                        {field(
                            "Status",
                            <OptionPicker
                                label="Registration status"
                                placeholder={REGISTERED}
                                options={[REGISTERED, NOT_YET_REGISTERED]}
                                disabled={disabled}
                                value={entity.formation.status === "planned" ? NOT_YET_REGISTERED : REGISTERED}
                                onChange={(next) => updateFormation({
                                    status: next === NOT_YET_REGISTERED ? "planned" : "registered"
                                })}
                            />,
                            true,
                            undefined,
                            INFO.registrationStatus
                        )}

                        {entity.formation.status === "planned" && (
                            <p className="legal-entity-note-line legal-entity-field-wide">
                                Not registered yet: choose the legal form you intend to use above, and where it
                                will be registered. Add the date and numbers once it is registered.
                            </p>
                        )}

                        {/* When it was registered, beside who
                            registered it: one act, two answers. */}
                        {entity.formation.status !== "planned" && field(
                            "Formation Date",
                            <input
                                type="date"
                                className="interview-input"
                                aria-label="Formation Date"
                                max={yearsAhead(5)}
                                disabled={disabled}
                                value={entity.formation.date}
                                onChange={(event) => updateFormation({ date: event.target.value })}
                            />
                        )}

                        {text(
                            "Registration Authority",
                            entity.formation.authority,
                            (next) => updateFormation({ authority: next }),
                            entity.formation.status === "planned"
                                ? "Where the organization will be registered"
                                : "Which authority registered the organization",
                            false,
                            INFO.registrationAuthority
                        )}

                        {/* Nothing left to pair with, so it spans --
                            the same way an unpaired field does in
                            subsections 5 and 6. */}
                        {entity.formation.status !== "planned" && text(
                            "Registration Number",
                            entity.formation.registrationNumber,
                            changeRegistrationNumber,
                            // The shape this country issues, where
                            // that is something to say with
                            // confidence.
                            profile.registrationNumberHint,
                            true
                        )}

                        {entity.formation.status !== "planned" && <div className="legal-entity-field-wide">

                            {numberList(
                                entity.formation.additionalNumbers,
                                "What this number is called",
                                (next) => updateFormation({ additionalNumbers: next }),
                                "Registration number"
                            )}

                            <button
                                type="button"
                                className="strategy-add-button"
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

                        </div>}

                    </div>
                ))}

                {/* ---------- 4. Tax & Business Registration ---------- */}

                {subsection(3, (
                    <div className="legal-entity-grid">

                        {/*
                            Labelled with the local name where there
                            is one: a founder recognises "AFM" or
                            "EIN" on the document in front of them
                            faster than the generic phrase. The value
                            stays free text either way.
                        */}
                        {text(
                            profile.taxIdName
                                ? "Tax Identification Number (" + profile.taxIdName + ")"
                                : "Tax Identification Number",
                            entity.tax.identificationNumber,
                            (next) => updateTax({ identificationNumber: next }),
                            undefined,
                            false,
                            INFO.taxNumber
                        )}

                        {sharesTaxAndRegistrationNumber(entity.organisation.country) && (
                            <p className="legal-entity-note-line">
                                In this country this is the same number as the Registration
                                Number, so it is filled in from there. Change it if yours
                                differs.
                            </p>
                        )}

                        {/*
                            Not asked at all where the tax does not
                            exist: five US states levy no sales tax,
                            and a question with no answer is worse
                            than no question. Everywhere else it is a
                            single tick, because "are you registered"
                            has two answers and a three-option list
                            was two more than it needed.
                        */}
                        {chosenSubdivision?.noConsumptionTax ? (
                            <p className="legal-entity-note-line">
                                {chosenSubdivision.name} levies no state sales tax, so there is
                                nothing to register here. You may still have to register in
                                other states you sell into.
                            </p>
                        ) : (
                            <div className="legal-entity-field-wide">

                                <label className="legal-entity-switch">
                                    <input
                                        type="checkbox"
                                        className="brand-tick-box"
                                        disabled={disabled}
                                        checked={entity.tax.consumptionTaxStatus === "yes"}
                                        onChange={(event) => updateTax({
                                            consumptionTaxStatus:
                                                (event.target.checked ? "yes" : "no") as LegalEntityTaxStatus
                                        })}
                                    />
                                    <span className="legal-entity-switch-label">
                                        {"Registered for " + profile.consumptionTax}
                                    </span>
                                </label>

                                {/* Only once there is a registration to number. */}
                                {entity.tax.consumptionTaxStatus === "yes" && (
                                    <>
                                        <span className="field-label legal-entity-label legal-entity-label-nested">
                                            {profile.consumptionTax + " Number"}
                                        </span>
                                        <input
                                            type="text"
                                            className="interview-input"
                                            aria-label={profile.consumptionTax + " Number"}
                                            disabled={disabled}
                                            value={entity.tax.consumptionTaxNumber}
                                            onChange={(event) => updateTax({
                                                consumptionTaxNumber: event.target.value
                                            })}
                                        />
                                    </>
                                )}

                            </div>
                        )}

                        <div className="legal-entity-field-wide">

                            {numberList(
                                entity.tax.additionalRegistrations,
                                "What this registration is called",
                                (next) => updateTax({ additionalRegistrations: next }),
                                "Tax registration"
                            )}

                            <button
                                type="button"
                                className="strategy-add-button"
                                disabled={disabled}
                                onClick={() => updateTax({
                                    additionalRegistrations: [
                                        ...entity.tax.additionalRegistrations,
                                        createLegalEntityNumber()
                                    ]
                                })}
                            >
                                + Add tax registration
                            </button>

                        </div>

                    </div>
                ))}

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

                {subsection(4, (
                    <>

                        {entity.requirements.length === 0 && (
                            <p className="legal-entity-empty-note">
                                Nothing recorded. Add a requirement if one applies to your
                                activity, your legal form, or where you are registered: for
                                example, a licence, a professional registration, or a named
                                officer.
                            </p>
                        )}

                        {entity.requirements.map((requirement, index) => {

                            const open = folds.isOpen(requirement.id);

                            /* The name leads the folded head; the
                               summary under it says the rest. */
                            const summary = summaryText(
                                LEGAL_REQUIREMENT_TYPES.find(
                                    type => type.id === requirement.type
                                )?.label ?? requirement.reference
                            );

                            return (

                            <div className="legal-entity-card" key={requirement.id}>

                                <div className="legal-entity-card-head fold-card-head">

                                    <FoldArrow
                                        open={open}
                                        label={"Requirement " + (index + 1)}
                                        onToggle={() => folds.toggle(requirement.id)}
                                    />

                                    <span className="legal-entity-card-number">
                                        {(index + 1) + "."}
                                    </span>

                                    {/* Folded, the name is read here, as on
                                        every folding card; open, it is
                                        edited in its own field below. */}
                                    {!open && (
                                        <span className="strategy-name-static">
                                            {requirement.name.trim() || "Unnamed requirement"}
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        className="strategy-box-remove"
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
                                        <span className="business-card-summary">{summary}</span>
                                    )}

                                </div>

                                {open && (
                                <div className="legal-entity-grid legal-entity-grid-pairs">

                                    {/* First, because it is what the
                                        user came to write down: what
                                        the requirement is, beside
                                        what it is called on the
                                        paperwork. */}
                                    {text(
                                        "Name",
                                        requirement.name,
                                        (next) => update({
                                            requirements: entity.requirements.map(
                                                (candidate, position) => position === index
                                                    ? { ...candidate, name: next }
                                                    : candidate
                                            )
                                        }),
                                        "What the requirement is",
                                        false,
                                        undefined,
                                        "Legal requirement " + (index + 1) + " name"
                                    )}

                                    {text(
                                        "Reference or Number",
                                        requirement.reference,
                                        (next) => update({
                                            requirements: entity.requirements.map(
                                                (candidate, position) => position === index
                                                    ? { ...candidate, reference: next }
                                                    : candidate
                                            )
                                        }),
                                        "Optional",
                                        false,
                                        undefined,
                                        "Legal requirement " + (index + 1) + " reference or number"
                                    )}

                                    {/*
                                        After them, on its own line:
                                        the type classifies an answer
                                        already given, and its list is
                                        the widest control here.
                                    */}
                                    {field(
                                        "Type",
                                        <OptionPicker
                                            label={"Legal requirement " + (index + 1) + " type"}
                                            placeholder="Select a type"
                                            options={LEGAL_REQUIREMENT_TYPES.map(type =>
                                                profile.commonRequirements.includes(type.id)
                                                    ? type.label + " (common here)"
                                                    : type.label
                                            )}
                                            disabled={disabled}
                                            value={(() => {
                                                const type = LEGAL_REQUIREMENT_TYPES.find(
                                                    candidate => candidate.id === requirement.type
                                                );
                                                if (!type) {
                                                    return "";
                                                }
                                                return profile.commonRequirements.includes(type.id)
                                                    ? type.label + " (common here)"
                                                    : type.label;
                                            })()}
                                            onChange={(next) => update({
                                                requirements: entity.requirements.map(
                                                    (candidate, position) => position === index
                                                        ? {
                                                            ...candidate,
                                                            type: LEGAL_REQUIREMENT_TYPES.find(
                                                                type => next.startsWith(type.label)
                                                            )?.id ?? ""
                                                        }
                                                        : candidate
                                                )
                                            })}
                                        />,
                                        true
                                    )}

                                    {optionalNote(
                                        "Relevant Information",
                                        requirement.id + ":notes",
                                        "Legal requirement " + (index + 1) + " notes",
                                        requirement.notes,
                                        (next) => update({
                                            requirements: entity.requirements.map(
                                                (candidate, position) => position === index
                                                    ? { ...candidate, notes: next }
                                                    : candidate
                                            )
                                        })
                                    )}

                                </div>
                                )}

                            </div>

                            );

                        })}

                        <button
                            type="button"
                            className="strategy-add-button"
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
                ))}

                {/* ---------- 6. Legal Entity Expenses ---------- */}

                {subsection(5, (
                    <>

                        {entity.expenses.length === 0 && (
                            <p className="legal-entity-empty-note">
                                Nothing recorded. Add what it costs to establish, register
                                and maintain this legal entity.
                            </p>
                        )}

                        {entity.expenses.map((expense, index) => {

                            const open = folds.isOpen(expense.id);

                            const summary = summaryText(
                                expense.cost ? moneyText(expense.cost, currency) : undefined,
                                expense.frequency
                            );

                            return (

                            <div className="legal-entity-card" key={expense.id} data-anchor={"legal-expense-" + expense.id}>

                                <div className="legal-entity-card-head fold-card-head">

                                    <FoldArrow
                                        open={open}
                                        label={"Expense " + (index + 1)}
                                        onToggle={() => folds.toggle(expense.id)}
                                    />

                                    <span className="legal-entity-card-number">
                                        {(index + 1) + "."}
                                    </span>

                                    {/* Folded, the name is read here, as on
                                        every folding card; open, it is
                                        edited in its own field below. */}
                                    {!open && (
                                        <span className="strategy-name-static">
                                            {expense.name.trim() || "Unnamed expense"}
                                        </span>
                                    )}

                                    <button
                                        type="button"
                                        className="strategy-box-remove"
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
                                    </button>

                                    {/* The rest, on a row of its own under
                                        the name (see .fold-card-head). */}
                                    {!open && summary && (
                                        <span className="business-card-summary">{summary}</span>
                                    )}

                                </div>

                                {open && (
                                <div className="legal-entity-grid legal-entity-grid-pairs">

                                    {/*
                                        Paired with Responsibility,
                                        and full width on the visits
                                        where there is only one
                                        founder and no Responsibility
                                        to pair with -- otherwise
                                        Cost would slide up beside it
                                        and break the pair below.
                                    */}
                                    {text(
                                        "Name",
                                        expense.name,
                                        (next) => update({
                                            expenses: entity.expenses.map(
                                                (candidate, position) => position === index
                                                    ? { ...candidate, name: next }
                                                    : candidate
                                            )
                                        }),
                                        "What the expense is",
                                        namedFounders.length <= 1,
                                        undefined,
                                        "Expense " + (index + 1) + " name"
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
                                    {namedFounders.length > 1 && field(
                                        "Responsibility",
                                        <OptionPicker
                                            label={"Expense " + (index + 1) + " responsibility"}
                                            placeholder="Select a founder"
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
                                        />
                                    )}

                                    {text(
                                        amountLabel("Cost"),
                                        expense.cost,
                                        (next) => update({
                                            expenses: entity.expenses.map(
                                                (candidate, position) => position === index
                                                    ? { ...candidate, cost: next }
                                                    : candidate
                                            )
                                        }),
                                        currency || "Amount",
                                        false,
                                        undefined,
                                        "Expense " + (index + 1) + " cost",
                                        NUMBER_LIMITS.money
                                    )}

                                    {field(
                                        "Frequency",
                                        <OptionPicker
                                            label={"Expense " + (index + 1) + " frequency"}
                                            placeholder="Select a frequency"
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
                                        />
                                    )}

                                    {/*
                                        What this expense is for, out
                                        of what has actually been
                                        recorded on this page. A link
                                        that points at nothing is not
                                        offered, so none can go stale.
                                    */}
                                    <div className="legal-entity-field-wide">

                                        <span className="legal-entity-label-info">
                                            <span className="field-label legal-entity-label">
                                                <InfoText text="Links">
                                                    <InfoNote label="Links" points={INFO.links} />
                                                </InfoText>
                                            </span>
                                        </span>

                                        {linkTargets.length === 0 && (
                                            <p className="legal-entity-empty-note">
                                                Record a registration number or a legal requirement
                                                above, and you can link it here.
                                            </p>
                                        )}

                                        <div className="legal-entity-links">
                                            {linkTargets.map(target => (
                                                <label className="legal-entity-link" key={target.id}>
                                                    <input
                                                        type="checkbox"
                                                        className="brand-tick-box"
                                                        disabled={disabled}
                                                        checked={expense.links.includes(target.id)}
                                                        onChange={(event) => update({
                                                            expenses: entity.expenses.map(
                                                                (candidate, position) => position === index
                                                                    ? {
                                                                        ...candidate,
                                                                        links: event.target.checked
                                                                            ? [...candidate.links, target.id]
                                                                            : candidate.links.filter(
                                                                                link => link !== target.id
                                                                            )
                                                                    }
                                                                    : candidate
                                                            )
                                                        })}
                                                    />
                                                    <span className="legal-entity-link-label">
                                                        {target.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>

                                    </div>

                                    {optionalNote(
                                        "Description / Relevant Information",
                                        expense.id + ":description",
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

                        })}

                        <button
                            type="button"
                            className="strategy-add-button"
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
                ))}

                </div>

            </div>

        </div>

    );

}
