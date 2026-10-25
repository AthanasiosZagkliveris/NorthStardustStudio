/**
 * THE LAST FOUR SECTIONS and the requirement and expense cards.
 * One part of LegalEntityEditor (see LegalEntityEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import TickField from "../../../controls/TickField.tsx";
import AddButton from "../../../controls/AddButton.tsx";
import FieldLabel from "../../../controls/FieldLabel.tsx";
import NumberCell from "../../../controls/NumberCell.tsx";
import RemoveButton from "../../../controls/RemoveButton.tsx";
import { BusinessCard, LinkSymbol, ResponsibleField } from "../../cards/BusinessCardFields.tsx";
import DateCellInput from "../../fields/DateCellInput.tsx";
import { LegalEntityTaxStatus, LegalEntityValue, createLegalEntityExpense, createLegalEntityNumber, createLegalEntityRequirement } from "../../../../framework/engine/AnswerUtils.ts";
import { LEGAL_ENTITY_EXPENSE_FREQUENCIES, LEGAL_REQUIREMENT_TYPES, limitedRegistrationNumber, registrationNumberRule, registrationAuthorityFor, sharesTaxAndRegistrationNumber } from "../../../../framework/engine/LegalEntityJurisdictions.ts";
import { moneyText } from "../../../../framework/engine/ExportRenderers.ts";
import { summaryText } from "../../cards/cardSummary.ts";
import FoldAllToggle from "../../fields/FoldAllToggle.tsx";
import InfoNote, { InfoText } from "../../fields/InfoNote.tsx";
import CardNameInput from "../../cards/CardNameInput.tsx";
import { FrozenUntil } from "../../fields/fieldMarks.tsx";
import { NUMBER_LIMITS, limitedNumberText, numberInputMode } from "../../fields/numberInput.ts";
import OptionPicker from "../../fields/OptionPicker.tsx";
import { OptionalField } from "../../cards/BusinessCardFields.tsx";
import { INFO, MAX_MORE_NUMBERS, yearsAhead } from "./shared.tsx";
import type { useLegalState } from "./useLegalState.tsx";
import type { useLegalFieldsAndSections } from "./useLegalFieldsAndSections.tsx";

type Earlier = ReturnType<typeof useLegalState> & ReturnType<typeof useLegalFieldsAndSections>;

export function useLegalCardsAndSections(earlier: Earlier) {

    const { amountLabel, changeRegistrationNumber, chosenSubdivision, commonRequirementsNote, consumptionTaxNote, countryChosen, currency, disabled, entity, expenseSymbol, field, folds, linkTargets, namedFounders, numberList, offerInExpenses, openOnPage, optionalNote, placeChosen, placeHint, profile, profiled, registrationRequest, subsection, update, updateFormation, updateTax } = earlier;

    // The registry of the country (or of its state or canton): known, it is filled in and shown as text.
    const ownAuthority = registrationAuthorityFor(entity.organisation.country, entity.organisation.subdivision);
    const section2 = (
    subsection(2, (
        <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-formation">

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
                        <FieldLabel className="legal-entity-label">
                            <InfoText text="Authority / Name">
                                <InfoNote label="Authority / Name" points={INFO.registrationAuthority} />
                            </InfoText>
                        </FieldLabel>
                    </span>
                    <FieldLabel className="legal-entity-label">Number</FieldLabel>
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
                        <RemoveButton
                            aria-label="Remove registration number"
                            disabled={disabled}
                            onClick={() => {
                                const [next, ...rest] = entity.formation.additionalNumbers;
                                // (The authority stays: it is the country's; the next number moves up into the first row.)
                                updateFormation(next
                                    ? { registrationNumber: next.number, additionalNumbers: rest }
                                    : { registrationNumber: "" });
                            }}
                />
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
                    <AddButton className="legal-entity-list-add"
                        disabled={disabled}
                        onClick={() => updateFormation({
                            additionalNumbers: [
                                ...entity.formation.additionalNumbers,
                                createLegalEntityNumber()
                            ]
                        })}
                    >
                        + Add registration number
                    </AddButton>
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
                        <FieldLabel className="legal-entity-label">
                            <InfoText text={(profile.taxIdName
                                    ? "Tax Identification Number (" + profile.taxIdName + ")"
                                    : "Tax Identification Number")}>
                                <InfoNote label={(profile.taxIdName
                                    ? "Tax Identification Number (" + profile.taxIdName + ")"
                                    : "Tax Identification Number")} points={INFO.taxNumber} />
                            </InfoText>
                        </FieldLabel>
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
                        <TickField className="legal-entity-switch" aria-label={"Registered for " + profile.consumptionTax} disabled={disabled} checked={entity.tax.consumptionTaxStatus === "yes"} onChange={(event) => updateTax({
                                    consumptionTaxStatus:
                                        (event.target.checked ? "yes" : "no") as LegalEntityTaxStatus
                                })}>
                            <span className="legal-entity-switch-label">{profile.consumptionTax}</span>
                        </TickField>
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
                        <FieldLabel className="legal-entity-label">Tax / Registration</FieldLabel>
                        <FieldLabel className="legal-entity-label">Number</FieldLabel>
                    </div>
                )}

                {numberList(
                    entity.tax.additionalRegistrations,
                    "What this registration is called",
                    (next) => updateTax({ additionalRegistrations: next }),
                    "Tax registration"
                )}

                {entity.tax.additionalRegistrations.length < MAX_MORE_NUMBERS && <AddButton className="legal-entity-list-add"
                    disabled={disabled}
                    onClick={() => updateTax({
                        additionalRegistrations: [
                            ...entity.tax.additionalRegistrations,
                            createLegalEntityNumber()
                        ]
                    })}
                >
                    + Add tax registration
                </AddButton>}

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

                <BusinessCard
                    legal
                    key={requirement.id}
                    anchor={"legal-requirement-" + requirement.id}
                    kind="Legal requirement"
                    foldLabel={"Requirement " + (index + 1)}
                    number={index + 1}
                    name={requirement.name}
                    placeholder="What the requirement is"
                    emptyName="Unnamed requirement"
                    disabled={disabled}
                    open={open}
                    onToggle={always ? undefined : () => folds.toggle(requirement.id)}
                    onName={(next) => update({
                        requirements: entity.requirements.map(
                            (candidate, position) => position === index
                                ? { ...candidate, name: next }
                                : candidate
                        )
                    })}
                    summary={summary}
                    actions={(
                        <RemoveButton className="card-remove"
                            aria-label={"Remove legal requirement " + (index + 1)}
                            disabled={disabled}
                            onClick={() => update({
                                requirements: entity.requirements.filter(
                                    (_candidate, position) => position !== index
                                )
                            })}
                        />
                    )}
                >

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
                        <TickField className="legal-entity-switch legal-entity-offer" disabled={disabled} checked={requirement.offerInExpenses} onChange={(event) => offerInExpenses(index, event.target.checked)}>
                            <span className="legal-entity-switch-label">Add to Legal Entity Expenses</span>
                        </TickField>
                        {expenseSymbol(requirement.id)}
                        </div>

                        {/* Named as 6.'s expenses name theirs; its key
                            stays "Relevant Information". */}
                        {optionalNote(
                            "Notes",
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

                </BusinessCard>

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

                <BusinessCard
                    legal
                    key={expense.id}
                    anchor={"legal-expense-" + expense.id}
                    kind="Expense"
                    number={index + 1}
                    name={expense.name}
                    placeholder="What the expense is"
                    emptyName={expense.fromRequirement !== "" ? "Unnamed requirement" : "Unnamed expense"}
                    disabled={disabled}
                    open={open}
                    onToggle={always ? undefined : () => folds.toggle(expense.id)}
                    onName={expense.fromRequirement === "" ? (next) => update({
                        expenses: entity.expenses.map(
                            (candidate, position) => position === index
                                ? { ...candidate, name: next }
                                : candidate
                        )
                    }) : undefined}
                    /* Made by a requirement: named as it is, said as text and a link to it. */
                    nameLink={expense.fromRequirement !== "" ? {
                        className: "strategy-name-static legal-entity-name-link",
                        title: "Open the requirement " + expense.name.trim(),
                        onClick: () => openOnPage({ tile: "legal-entity-registrations", card: expense.fromRequirement })
                    } : undefined}
                    summary={summary}
                    actions={expense.fromRequirement === "" && (
                        <RemoveButton className="card-remove"
                            aria-label={"Remove expense " + (index + 1)}
                            disabled={disabled}
                            onClick={() => update({
                                expenses: entity.expenses.filter(
                                    (_candidate, position) => position !== index
                                )
                            })}
                        />
                    )}
                >

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
                            <NumberCell
                                inputMode={numberInputMode(NUMBER_LIMITS.money)}
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
                            false
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
                            false
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
                            <ResponsibleField
                                what={"Expense " + (index + 1)}
                                layout="inline"
                                className="legal-entity-field-wide"
                                founders={namedFounders.map(founder => ({ id: founder.id, label: founder.name }))}
                                value={expense.responsibility}
                                off={expense.responsibleOff === true}
                                disabled={disabled}
                                onChange={(id) => update({ expenses: entity.expenses.map((candidate, position) => position === index ? { ...candidate, responsibility: id } : candidate) })}
                                onOff={(off) => update({ expenses: entity.expenses.map((candidate, position) => position === index ? (off ? { ...candidate, responsibleOff: true, responsibility: "" } : { ...candidate, responsibleOff: undefined }) : candidate) })}
                            />
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
                            "Notes",
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

                </BusinessCard>

                );

    }
    const section4 = (
    subsection(4, (
        <>

            {entity.requirements.map((requirement, index) => requirementCard(requirement, index))}

            <AddButton className="card-list-add"
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
            </AddButton>

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

            <AddButton className="card-list-add"
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
            </AddButton>

        </>
    ), undefined, (
        <FoldAllToggle
            ids={entity.expenses.map(expense => expense.id)}
            folds={folds}
            label="legal entity expenses"
        />
    ), INFO.expenses)
    );

    return { expenseCard, requirementCard, section2, section3, section4, section5 };

}
