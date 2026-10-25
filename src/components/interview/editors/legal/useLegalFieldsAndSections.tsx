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
import { BusinessTicks, LinkSymbol, OptionalNote } from "../../cards/BusinessCardFields.tsx";
import { LEGAL_ENTITY_SECTIONS, LegalEntityNumberValue, createLegalEntityFounder } from "../../../../framework/engine/AnswerUtils.ts";
import { COUNTRIES, countrySearchAliases, subdivisionSearchAliases } from "../../../../framework/engine/LegalEntityJurisdictions.ts";
import InfoNote, { InfoText, type InfoPoint } from "../../fields/InfoNote.tsx";
import CardNameInput from "../../cards/CardNameInput.tsx";
import { FrozenUntil } from "../../fields/fieldMarks.tsx";
import { waitingHint } from "../../../../framework/engine/FieldDependencies.ts";
import { NUMBER_LIMITS, limitedNumberText } from "../../fields/numberInput.ts";
import OptionPicker from "../../fields/OptionPicker.tsx";
import StrategyTextArea from "../../fields/StrategyTextArea.tsx";
import RadioChoice from "../../../controls/RadioChoice.tsx";
import ActivitiesField from "./ActivitiesField.tsx";
import DateCellInput from "../../fields/DateCellInput.tsx";
import { todayIsoDate } from "../../../../framework/engine/AnswerUtils.ts";
import { BUSINESS_STAGE_WORDS } from "../../../../framework/engine/ActivityClassification.ts";
import { AUDIENCE_SCALES, CUSTOMER_TYPES, INFO, JURISDICTIONS, LIFE_STAGES, OUTCOMES, REGULATORY_INTENSITIES, choiceLimit, lockedAudience, LEGAL_FORM_OTHER, MARKET_TYPES, activitiesInfo, formationIssues, type MarketType, MAX_OTHER_NUMBER_LENGTH, OTHER_OPTION, TOTAL_OWNERSHIP_HELP, savedOther, shownOther } from "./shared.tsx";
import type { useLegalState } from "./useLegalState.tsx";

type Earlier = ReturnType<typeof useLegalState>;

export function useLegalFieldsAndSections(earlier: Earlier) {

    const { openingDate, onChangeOpeningDate, businessStage, updateFormation, description, onDescriptionChange, amountLabel, amountName, chooseCountry, chooseLegalForm, chooseSubdivision, countryChosen, currency, disabled, entity, forms, founderLabel, labelled, openOnPage, ownershipComplete, ownershipOver, ownershipShort, percent, placeChosen, placeHint, postalLabel, profiled, removeFieldButton, removeFounder, soleFounderForm, soleFounderSettled, soleFounderSurplus, subdivisionSpec, subsection, subsectionNumber, textControl, totalCapital, totalOwnership, update, updateFounder, updateOrganisation } = earlier;

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
        return { tile: "legal-entity-registrations", box: "registration-numbers" };
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
    // THE FIVE QUESTIONS OF EARLY POSITIONING (design document 28, 8.2). The structure of the market and the seller and buyer relationship on the left; the audience (a scale for a
    // business or public buyer, a life stage for a consumer) and the differentiation and outcome on the right. How many choices a question takes follows the business stage (one
    // while planning, up to two while managing, free while growing): a question of one choice is a radio, a question of several is a tick group that LOCKS its other options once
    // the limit is reached (no warning), with its limit beside the label ("2 max"). Saved with the organisation, as its other answers are.
    // (The stage is the Opening Date's and the Global Settings' durations': planning before it, then launching, managing, growing.)
    const stage = businessStage;
    // An "i" says only what holds at the business stage the user is in: the points about the other stages, and the sentences about what is locked or ideal while planning and launching, go.
    const early = stage !== "manage" && stage !== "grow";
    const forStage = (points: InfoPoint[]): InfoPoint[] => points
        .filter(point => typeof point !== "string" || !(early ? /^Multi-sided while managing or growing|^In a multi-sided market, while managing or growing/ : /^Multi-sided while planning or launching/).test(point))
        .map(point => typeof point !== "string" || early ? point : point.replace(/ The ideal beachhead( while planning and launching)?\./, "").replace(/ Locked while planning and launching\./, ""));
    const models = entity.organisation.customerType;
    const modelChosen = models.length > 0;
    // Each market model asks its own audience question (a scale for businesses, a life stage for consumers, an administrative level for the government, a regulatory intensity for the
    // compliance context); the government and the compliance context ask their own trigger, in place of the Differentiation & Outcome of the commercial models.
    const audienceSets = [
        { model: "b2b", label: "Audience Specialization & Scale", group: "legal-entity-audience-scale", options: AUDIENCE_SCALES, info: INFO.audienceScale },
        { model: "b2c", label: "Buyer's Life-Stage and relationship with the User", group: "legal-entity-audience-life", options: LIFE_STAGES, info: INFO.lifeStage },
        { model: "b2g", label: "Administrative Level (Jurisdiction Scale)", group: "legal-entity-audience-jurisdiction", options: JURISDICTIONS, info: INFO.jurisdiction },
        { model: "g2b", label: "Regulatory Intensity of the target industry", group: "legal-entity-audience-regulatory", options: REGULATORY_INTENSITIES, info: INFO.regulatory }
    ] as const;
    // One last question for every model: the main behavioral trigger and the measurable outcome. In a multi-sided market the sides are opened in parallel while managing and growing
    // (more than one model chosen), and then the question is repeated for each side, its answers kept as "side:outcome".
    const SIDE_NAMES: Record<string, string> = { b2c: "B2C", b2b: "B2B", b2g: "B2G", g2b: "G2B" };
    type OutcomeSet = { models: readonly string[]; label: string; group: string; options: readonly { id: string; label: string }[]; info: InfoPoint[] };
    const outcomeSetsFor = (chosen: readonly string[], market: string): OutcomeSet[] =>
        market === "multi" && (stage === "manage" || stage === "grow") && chosen.length > 1
            ? chosen.map(model => ({ models: [model], label: "Differentiation & Outcome (" + (SIDE_NAMES[model] ?? model) + ")", group: "legal-entity-outcome-" + model, options: OUTCOMES.map(option => ({ id: model + ":" + option.id, label: option.label })), info: INFO.outcome }))
            : [{ models: ["b2c", "b2b", "b2g", "g2b"], label: "Differentiation & Outcome", group: "legal-entity-outcome", options: OUTCOMES, info: INFO.outcome }];
    const outcomeSets = outcomeSetsFor(models, entity.organisation.marketType);
    // (Before any model is chosen the commercial questions stand, the audience one frozen.)
    const audienceShown = (set: (typeof audienceSets)[number], chosen: readonly string[]) => chosen.includes(set.model) || (chosen.length === 0 && set.model === "b2b");
    const outcomeShown = (set: OutcomeSet, chosen: readonly string[]) => set.models.some(model => chosen.includes(model)) || (chosen.length === 0 && set.models.includes("b2b" as never));
    const idsOf = (options: readonly { id: string }[]): string[] => options.map(option => option.id);
    const chosenOf = (all: string[], options: readonly { id: string }[]) => all.filter(id => idsOf(options).includes(id));
    /** What a set of models keeps of the saved audience and outcome: the answers of the questions still asked. */
    const kept = (all: string[], sets: readonly { options: readonly { id: string }[] }[], shown: (index: number) => boolean) => all.filter(id => sets.some((set, index) => shown(index) && idsOf(set.options).includes(id)));

    /** One question: a radio where one choice is allowed (and at most one is held), else ticks that lock at the limit. */
    function choice(
        label: string,
        group: string,
        options: readonly { id: string; label: string; locked?: boolean }[],
        selected: string[],
        limit: number | null,
        onNext: (next: string[]) => void,
        info: InfoPoint[],
        frozen?: { answered: boolean; hint: string },
        /** Options not open at this stage (grey, cannot be chosen; one already chosen stays). */
        locked: readonly string[] = []
    ) {
        const radio = limit === 1 && selected.length <= 1;
        // What the business stage allows in this question: how many choices, and which options are not open yet.
        const lockedWords = options.filter(option => locked.includes(option.id)).map(option => option.label);
        const allowed = "At this stage (" + (BUSINESS_STAGE_WORDS[stage] ?? "Planning") + "): "
            + (limit === null ? "choose as many as apply." : limit === 1 ? "choose one." : "choose up to " + limit + ".")
            + (lockedWords.length > 0 ? " Not open yet: " + lockedWords.join(", ") + ". " + (lockedWords.length > 1 ? "They open" : "It opens") + " when the business reaches Managing." : "");
        info = forStage(info);
        const sourceAt = info.findIndex(point => typeof point !== "string" && "source" in point);
        info = sourceAt < 0 ? [...info, allowed] : [...info.slice(0, sourceAt), allowed, ...info.slice(sourceAt)];
        options = options.map(option => locked.includes(option.id) && !selected.includes(option.id) ? { ...option, locked: true } : option);
        // (A radio is one choice and says nothing; ticks say how many.)
        const note = limit === null || radio ? undefined : limit + " max";
        const control = radio
            ? (
                <RadioChoice
                    label={label}
                    group={group}
                    className="legal-entity-radio-stack"
                    disabled={disabled}
                    value={(selected[0] ?? "") as never}
                    onChange={(next) => onNext([next])}
                    options={options as never}
                />
            )
            : (
                <div className="radio-choice legal-entity-radio-stack" role="group" aria-label={label}>
                    <BusinessTicks
                        name={label}
                        disabled={disabled}
                        options={options}
                        chosen={selected}
                        max={limit ?? undefined}
                        onChange={onNext}
                    />
                </div>
            );
        const row = (
            <FieldRow pair fullList label={label} info={info} labelNote={note ? <span className="business-foundation-tick-note">{note}</span> : undefined}>
                {control}
            </FieldRow>
        );
        return frozen ? <FrozenUntil answered={frozen.answered} hint={frozen.hint}>{row}</FrozenUntil> : row;
    }

    const audience = (
        <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-organization legal-entity-audience">

            <div className="legal-entity-field">

                <div className="legal-entity-org-section legal-entity-org-market">
                <FieldRow pair fullList label="Market Structure" info={forStage(INFO.marketType)}>
                    <RadioChoice
                        label="Market Structure"
                        group="legal-entity-market-type"
                        className="legal-entity-radio-stack"
                        disabled={disabled}
                        value={entity.organisation.marketType as MarketType}
                        // (A platform's sides each ask the last question; another structure asks it once: what no longer fits goes.)
                        onChange={(next) => updateOrganisation({
                            marketType: next,
                            outcome: (() => {
                                const sets = outcomeSetsFor(models, next);
                                return kept(entity.organisation.outcome, sets, index => outcomeShown(sets[index], models));
                            })()
                        })}
                        options={MARKET_TYPES}
                    />
                </FieldRow>
                </div>

                <div className="legal-entity-org-section legal-entity-org-customer">
                {choice(
                    "Seller and Buyer Relationship",
                    "legal-entity-customer-type",
                    CUSTOMER_TYPES,
                    models,
                    choiceLimit(stage, "relationship"),
                    // (Another set of models asks other questions: the answers of the questions no longer asked go.)
                    (next) => updateOrganisation({
                        customerType: next,
                        audience: kept(entity.organisation.audience, audienceSets, index => audienceShown(audienceSets[index], next)),
                        outcome: (() => {
                            const sets = outcomeSetsFor(next, entity.organisation.marketType);
                            return kept(entity.organisation.outcome, sets, index => outcomeShown(sets[index], next));
                        })()
                    }),
                    INFO.customerType
                )}
                </div>

            </div>

            <div className="legal-entity-field legal-entity-questions">

                {audienceSets.filter(set => audienceShown(set, models)).map(set => (
                    <div key={set.group} className="legal-entity-org-section legal-entity-org-audience">
                    {choice(
                        set.label,
                        set.group,
                        set.options,
                        chosenOf(entity.organisation.audience, set.options),
                        choiceLimit(stage, "audience"),
                        (next) => updateOrganisation({ audience: [...entity.organisation.audience.filter(id => !idsOf(set.options).includes(id)), ...next] }),
                        set.info,
                        { answered: modelChosen, hint: "Choose a seller and buyer relationship first." },
                        lockedAudience(stage, set.model)
                    )}
                    </div>
                ))}

                {outcomeSets.filter(set => outcomeShown(set, models)).map(set => (
                    <div key={set.group} className="legal-entity-org-section legal-entity-org-outcome">
                    {choice(
                        set.label,
                        set.group,
                        set.options,
                        chosenOf(entity.organisation.outcome, set.options),
                        choiceLimit(stage, "outcome"),
                        (next) => updateOrganisation({ outcome: [...entity.organisation.outcome.filter(id => !idsOf(set.options).includes(id)), ...next] }),
                        set.info
                    )}
                    </div>
                ))}

            </div>

        </div>
    );
    const section0 = (
    subsection(0, (
        <div className="legal-entity-org-body">
        <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-organization">

            {/*
                Two columns on the card's two-column grid (design
                document 28, 8.5): the left one is where the organization
                is (its name, country, address); the right one is what it
                is and does (its legal form, its stage, its activities). The
                description stands below both, across the dialog.
            */}

            {/* ---- Information ---- */}
            <div className="legal-entity-field">

                <div className="legal-entity-org-section legal-entity-org-name">
                {labelled(
                    "Organization Name",
                    textControl(
                        "Organization Name",
                        entity.organisation.name,
                        (next) => updateOrganisation({ name: next }),
                        "The legal name of the organization"
                    )
                )}
                </div>

                <div className="legal-entity-org-section legal-entity-org-country">
                {/* The country first: it decides the registry, the tax, the
                    legal forms and the classification of the activities. */}
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
                    />,
                    false
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
                </div>

                <div className="legal-entity-org-section legal-entity-org-address">
                <FrozenUntil answered={placeChosen} hint={placeHint}>

                {/* THE WHOLE ADDRESS, ONE BOX: free text, as many lines as it
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
                    false
                )}
                </FrozenUntil>
                </div>
            </div>

            {/* ---- Questions ---- */}
            <div className="legal-entity-field legal-entity-questions">

                <div className="legal-entity-org-section legal-entity-org-form">
                {/* What it is legally: the Legal Form (its note, and its
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
                    ),
                    false
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

                {/* The two dates of the opening, side by side: when the organization was registered (once it is: the number given makes it so), and the day the business opens. */}
                <div className="legal-entity-org-dates">
                {entity.formation.status !== "planned" && (
                    <div className="legal-entity-org-section legal-entity-org-registration">
                    {labelled(
                        "Registration Date",
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
                        INFO.registrationDate
                    )}
                    </div>
                )}
                <div className="legal-entity-org-section legal-entity-org-opening">
                {labelled(
                    "Opening Date",
                    <DateCellInput ariaLabel="Opening Date" value={openingDate} onChange={(iso) => onChangeOpeningDate?.(iso)} />,
                    false,
                    undefined,
                    INFO.openingDate
                )}
                </div>
                </div>

                {/* What cannot be: a registered company whose date has not come, and a company formed after the day the business opens. */}
                {formationIssues(entity.formation, openingDate).map(issue => (
                    <p key={issue} className="legal-entity-note-line settings-alarm" role="alert">{issue}</p>
                ))}

                {/* Remounted when the country changes: a change of country empties every activity. */}
                <div className="legal-entity-org-section legal-entity-org-activities">
                {/* Frozen until a country is chosen: the classification the cascade follows is the country's. */}
                <FrozenUntil answered={countryChosen} hint={waitingHint("country")}>
                {labelled(
                    "Activities",
                    <ActivitiesField
                        key={entity.organisation.country}
                        country={entity.organisation.country}
                        activities={entity.organisation.activities}
                        disabled={disabled}
                        onChange={(next) => updateOrganisation({ activities: next })}
                    />,
                    false,
                    undefined,
                    [activitiesInfo(entity.organisation.country)]
                )}
                </FrozenUntil>
                </div>


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

        {/* Below both columns, across the dialog: a divider line, then the Description over the whole width. */}
        <div className="business-capability-card-rule legal-entity-org-rule" role="separator" />

        <div className="legal-entity-org-section legal-entity-org-description">
        {/* The shared optional note: its tick box and the word, the box opening on ticking (as every card's Notes do). */}
        <OptionalNote
            label="Notes"
            fieldId="Description"
            ariaLabel="Notes"
            placeholder="Add a note"
            info={INFO.mainActivity}
            disabled={disabled}
            value={description ?? entity.organisation.mainActivity}
            onChange={(next) => onDescriptionChange ? onDescriptionChange(next) : updateOrganisation({ mainActivity: next })}
        />
        </div>

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

    return { audience, expenseSymbol, field, numberList, registrationRequest, section0, section1 };

}
