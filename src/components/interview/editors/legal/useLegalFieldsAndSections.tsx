/**
 * THE FIELDS and the first two sections (Organization, Founders & Ownership).
 * One part of LegalEntityEditor (see LegalEntityEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import { ReactNode } from "react";
import FieldRow from "../../fields/FieldRow.tsx";
import TickField from "../../../controls/TickField.tsx";
import AddButton from "../../../controls/AddButton.tsx";
import NumberCell from "../../../controls/NumberCell.tsx";
import RemoveButton from "../../../controls/RemoveButton.tsx";
import { type OpenRequest } from "../../tiles/SectionTiles.tsx";
import { LinkSymbol } from "../../cards/BusinessCardFields.tsx";
import { LEGAL_ENTITY_SECTIONS, LegalEntityNumberValue, createLegalEntityFounder } from "../../../../framework/engine/AnswerUtils.ts";
import { COUNTRIES, countrySearchAliases, subdivisionSearchAliases } from "../../../../framework/engine/LegalEntityJurisdictions.ts";
import InfoNote, { InfoText } from "../../fields/InfoNote.tsx";
import CardNameInput from "../../cards/CardNameInput.tsx";
import { FrozenUntil } from "../../fields/fieldMarks.tsx";
import { waitingHint } from "../../../../framework/engine/FieldDependencies.ts";
import { NUMBER_LIMITS, limitedNumberText } from "../../fields/numberInput.ts";
import OptionPicker from "../../fields/OptionPicker.tsx";
import { SOURCES } from "../../../../framework/engine/Sources.ts";
import StrategyTextArea from "../../fields/StrategyTextArea.tsx";
import { INFO, LEGAL_FORM_OTHER, MAX_OTHER_NUMBER_LENGTH, OTHER_OPTION, TOTAL_OWNERSHIP_HELP, savedOther, shownOther } from "./shared.tsx";
import type { useLegalState } from "./useLegalState.tsx";

type Earlier = ReturnType<typeof useLegalState>;

export function useLegalFieldsAndSections(earlier: Earlier) {

    const { amountLabel, amountName, chooseCountry, chooseLegalForm, chooseSubdivision, countryChosen, currency, disabled, entity, forms, founderLabel, labelled, openOnPage, ownershipComplete, ownershipOver, ownershipShort, percent, placeChosen, placeHint, postalLabel, profile, profiled, removeFieldButton, removeFounder, soleFounderForm, soleFounderSettled, soleFounderSurplus, subdivisionSpec, subsection, subsectionNumber, textControl, totalCapital, totalOwnership, update, updateFounder, updateOrganisation } = earlier;

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
            <FieldRow
                label={label}
                info={info}
                fullList={!!onRemove}
                keyLabel={keyLabel}
                labelExtra={labelExtra}
                wide={wide}
                side={side}
                remove={onRemove ? removeFieldButton(label, onRemove) : undefined}
            >
                {control}
            </FieldRow>
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

                <RemoveButton
                    aria-label={"Remove " + noun.toLowerCase() + " " + (index + 1)}
                    disabled={disabled}
                    onClick={() => onNext(entries.filter(
                        (_candidate, position) => position !== index
                    ))}
                />

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
                        className="interview-input business-foundation-note legal-entity-activity"
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
                                <TickField className="legal-entity-switch" aria-label={"Has a " + profile.activityCode} disabled={disabled} checked={entity.organisation.activityCodeOn} onChange={(event) => updateOrganisation({ activityCodeOn: event.target.checked })}>
                                    <span className="legal-entity-switch-label">{profile.activityCode}</span>
                                </TickField>
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
                        className="interview-input business-foundation-note legal-entity-address"
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

                <TickField className="legal-entity-switch" disabled={disabled} checked={entity.capitalApplies} onChange={(event) => update({
                            capitalApplies: event.target.checked
                        })}>
                    <span className="legal-entity-switch-label">
                        Founders contribute capital to this organization
                    </span>
                </TickField>

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

                                <NumberCell
                                    className="legal-entity-column-centre"
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

                                <NumberCell
                                    className="legal-entity-column-centre"
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
                                <RemoveButton className="card-remove"
                                    aria-label={"Remove founder " + (index + 1)}
                                    disabled={disabled}
                                    onClick={() => removeFounder(index)}
                />
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
                <AddButton className="legal-entity-list-add"
                    disabled={disabled}
                    onClick={() => update({
                        founders: [...entity.founders, createLegalEntityFounder()]
                    })}
                >
                    + Add founder
                </AddButton>
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

    return { expenseSymbol, field, numberList, registrationRequest, section0, section1 };

}
