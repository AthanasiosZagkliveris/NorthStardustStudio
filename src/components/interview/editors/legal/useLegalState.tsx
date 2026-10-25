/**
 * THE EDITOR'S STATE: the entity, its writes, the country and the registration work out and what the other pages give.
 * One part of LegalEntityEditor (see LegalEntityEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import { ReactNode, useEffect, useRef } from "react";
import FieldRow from "../../fields/FieldRow.tsx";
import TextBox from "../../../controls/TextBox.tsx";
import RemoveButton from "../../../controls/RemoveButton.tsx";
import { OPEN_EVENT, type OpenRequest } from "../../tiles/SectionTiles.tsx";
import { LEGAL_ENTITY_SECTIONS, LegalEntityFounderValue, LegalEntityValue, asLegalEntityValue, createLegalEntityFounder, founderProfileHasContent, founderProfileOf, legalEntityTotalCapital, legalEntityTotalOwnership } from "../../../../framework/engine/AnswerUtils.ts";
import { LEGAL_REQUIREMENT_TYPES, countryCurrency, limitedRegistrationNumber, registrationNumberRule, jurisdictionIsProfiled, jurisdictionProfile, legalFormOptions, postalCodeLabel, registrationAuthorityFor, sharesTaxAndRegistrationNumber, subdivisionOption } from "../../../../framework/engine/LegalEntityJurisdictions.ts";
import { railId } from "../../rails/railItems.ts";
import InfoNote, { InfoPoint } from "../../fields/InfoNote.tsx";
import { FieldMark, FieldStatus } from "../../fields/fieldMarks.tsx";
import { waitingHint } from "../../../../framework/engine/FieldDependencies.ts";
import { SOURCES } from "../../../../framework/engine/Sources.ts";
import { UndoService } from "../../../../services/UndoService";
import { OptionalNote } from "../../cards/BusinessCardFields.tsx";
import { useItemFolds } from "../../fields/useItemFolds.ts";
import { labelWithCurrency, nameWithCurrency } from "../../../../framework/engine/Currencies.ts";
import { LEGAL_FORM_OTHER, LegalEntityEditorProps, withAutoExpenses, withExpensesInOrder } from "./shared.tsx";

export function useLegalState(props: LegalEntityEditorProps) {

    const {

    value,

    openingDate = "",

    onChangeOpeningDate,

    businessStage = "plan",

    onChange,

    disabled = false,

    columnsDivider,

    showInstructions = true,

    frameTitle,

    asTiles = false,

    cardsOnly = false,

    organizationOnly = false,

    audienceOnly = false,

    description,

    onDescriptionChange,

    prefill,

    foundersProfile,

    onChangeFoundersProfile

} = props;

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
    function update(patch: Partial<LegalEntityValue>) {
        // (The expense a ticked requirement makes is made when the requirements change -- the tick, the name -- and not by whatever else is edited: ticking the founders' capital must not make an expense, and an expense the user removed stays removed.)
        onChange(withExpensesInOrder(withAutoExpenses({ ...entity, ...patch }, patch.requirements !== undefined)));
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
                activityCode: "",
                // Nothing carries over to another country: its classification is its own, even where the codes look alike.
                activities: []
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
     * The button that sends an optional field away again: the same
     * ×, box, hover and focus as every other remove in the app, so
     * one action has one look.
     *
     * The glyph is drawn in CSS, so the character here is only what
     * the DOM holds (see `.legal-entity-field-remove`).
     */
    function removeFieldButton(what: string, onRemove: () => void) {
        return (
            <RemoveButton
                aria-label={"Remove " + what}
                disabled={disabled}
                onClick={onRemove} />
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
            /* One field of several in a column: its own holder (for its key, FieldKeys.ts), which adds no box of its own. */
            <FieldRow pair nested={nested} label={label} info={info} remove={onRemove ? removeFieldButton(label, onRemove) : undefined}>
                {control}
            </FieldRow>
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
                    className="interview-input business-foundation-note"
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
            <TextBox
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

    return { amountLabel, amountName, asTiles, cardsOnly, changeRegistrationNumber, chooseCountry, chooseLegalForm, chooseSubdivision, chosenSubdivision, columnsDivider, foundersProfile, onChangeFoundersProfile, description, onDescriptionChange, organizationOnly, audienceOnly, commonRequirementsNote, consumptionTaxNote, countryChosen, currency, disabled, entity, folds, forms, founderLabel, frameTitle, labelled, latest, linkTargets, namedFounders, offerInExpenses, openOnPage, openingDate, onChangeOpeningDate, businessStage, optionalNote, ownershipComplete, ownershipOver, ownershipShort, percent, placeChosen, placeHint, postalLabel, profile, profiled, removeFieldButton, removeFounder, showInstructions, soleFounderForm, soleFounderSettled, soleFounderSurplus, subdivisionSpec, subsection, subsectionNumber, textControl, totalCapital, totalOwnership, update, updateFormation, updateFounder, updateOrganisation, updateTax };

}
