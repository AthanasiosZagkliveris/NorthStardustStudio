import ChoiceCard from "../../controls/ChoiceCard.tsx";
import { CSSProperties, Fragment, useState } from "react";
import CardShell from "../cards/CardShell.tsx";
import { OptionalNote } from "../cards/BusinessCardFields.tsx";
import { BUYER_CATEGORIES, BUYER_USER_RELATIONS, USER_LIFE_STAGES, positioningName } from "./legal/shared.tsx";
import { AUDIENCE_WORDS, CUSTOMER_TYPE_WORDS, PURPOSE_WORDS } from "../../../framework/engine/ActivityClassification.ts";
import { AnswerType } from "../../../framework/enums/AnswerType.ts";
import { asLegalEntityValue, isAnswerEmpty } from "../../../framework/engine/AnswerUtils.ts";
import { useDragToScroll } from "../../../hooks/useDragToScroll.ts";
import { FieldMark, FieldPageProvider, FieldStatus, useFieldPage } from "../fields/fieldMarks.tsx";
import SectionTiles, { DialogHeading, TILE_DIVIDER, type SectionTile } from "../tiles/SectionTiles.tsx";
import LegalEntityEditor, { foundersTileFace } from "./LegalEntityEditor.tsx";
import { railId } from "../rails/railItems.ts";
import { LEGAL_ENTITY_SECTIONS } from "../../../framework/engine/AnswerUtils.ts";
import { ImprintFields, NumberedTextList } from "../fields/ColumnFields.tsx";
import { workHue } from "../../../framework/engine/WorkColours.ts";

import { AnswerRendererProps, bindLabelAroundAmpersand, questionLineClass, type PageSectionAnswer } from "./answer/shared.tsx";
export { questionLineClass } from "./answer/shared.tsx";
import { useAnswerState } from "./answer/useAnswerState.tsx";
import type { AnswerScope } from "./answer/scope.ts";
import { renderFreeText, renderFixedVariantText, renderTLayoutText, renderTable } from "./answer/renderTextAnswers.tsx";
import { renderChecklist, renderCardList, renderProfileCards } from "./answer/renderListAnswers.tsx";
import { renderBusinessFoundation, renderBusinessEngagement, renderBusinessCapability, renderFinancialFoundation, renderFinancialSustainability, renderLegalEntity, renderFoundersProfile, renderBrandStyle, renderBrandInventory } from "./answer/renderPageAnswers.tsx";
import { renderProcessLibrary, renderOperationalLog, renderStrategyFoundation, renderStrategicPeriod, renderStrategicRoadmap, renderRolesResponsibilities } from "./answer/renderProcessAndStrategyAnswers.tsx";

function MultiPartAnswerRenderer({

    definition,

    value,

    onChange,

    disabled,

    resolveDynamicOptions,

    rowSelection,

    ownerSuggestions,

    processLibraryProcesses,

    columnsDivider,

    frameTitle,

    columnNumberOffset,

    legalEntity,

    onChangeLegalEntity,

    legalEntityPrefill,

    foundersProfile,

    openingDate,

    onChangeOpeningDate,

    businessStage = "plan",

    showInstructions = true,

    pageSections,

    onChangeFoundersProfile,

    legalEntitySectionNumber

}: AnswerRendererProps) {

    const fieldPage = useFieldPage();

    const values: Record<string, unknown> =
        value && typeof value === "object" && !Array.isArray(value)
            ? value as Record<string, unknown>
            : {};

    const parts = definition.parts ?? [];

    const [activePartId, setActivePartId] = useState<string | undefined>(parts[0]?.id);

    const tabScrollRef = useDragToScroll<HTMLDivElement>();

    if (definition.tabbed) {

        const activePart =
            parts.find(part => part.id === activePartId) ?? parts[0];

        return (

            <div className="answer-variant-cards-wrapper">

                <div className="answer-variant-cards" ref={tabScrollRef}>

                    {parts.map(part => {

                        const filled = !isAnswerEmpty(part.answer, values[part.id]);

                        const isActive = part.id === activePart?.id;

                        return (

                            <ChoiceCard key={part.id} active={isActive} filled={filled} onClick={() => setActivePartId(part.id)}>{part.label}</ChoiceCard>

                        );

                    })}

                </div>

                {activePart && (

                    <div className="answer-variant-editor">

                        <SingleAnswerRenderer

                            definition={activePart.answer}

                            ariaLabel={activePart.label}

                            value={values[activePart.id]}

                            onChange={(next) => onChange({ ...values, [activePart.id]: next })}

                            disabled={disabled}

                            resolveDynamicOptions={resolveDynamicOptions}

                            rowSelection={rowSelection}

                            ownerSuggestions={ownerSuggestions}

                            processLibraryProcesses={processLibraryProcesses}

                            dynamicOptionsDependency={values}

                        />

                    </div>

                )}

            </div>

        );

    }

    // A column page of FOUR columns (Identity's Definition and Purpose, Brand's Ambassador): the page's tile system instead of four narrow columns.
    // Each tile carries its title and a line or two of what is in it; pressing it opens the column (its questions and its editor) in the tile's dialog.
    if (definition.columns && parts.length === 4) {

        const firstWords = (text: string) => text.replace(/^\s*•\s*/, "").trim().replace(/\s+/g, " ");
        const snippet = (part: (typeof parts)[number], from: Record<string, unknown> = values): string[] => {
            const answered = typeof from[part.id] === "string"
                ? (from[part.id] as string).split("\n").map(firstWords).filter(line => line.length > 0).slice(0, 12)
                : [];
            if (answered.length > 0) {
                return answered;
            }
            // (Nothing written yet: what the column asks, its first line.)
            return (part.questions ?? "").split("\n").map(firstWords).filter(line => line.length > 0).slice(0, 1);
        };

        // The column's guidance is the "i" beside its title.
        const guidance = (part: (typeof parts)[number]): string[] => (part.questions ?? "").split("\n").map(firstWords).map(line => line.replace(/^[-•]\s*/, "")).filter(line => line.length > 0);

        // THE ORGANIZATION TILE takes the Description's place on the Identity System's Definition (design document 28, 8.5): the organization's own fields in its dialog;
        // its Description box is this page's saved Description (the old Main Activity text where nothing was written here).
        const organisation = asLegalEntityValue(legalEntity).organisation;
        const written = organisation.addressLine1.split("\n").map(text => text.trim()).filter(text => text.length > 0);
        const addressLines = written.length >= 3 ? [...written.slice(0, written.length - 2), written.slice(-2).join(" ")] : written;
        const organizationTile = (part: (typeof parts)[number]): SectionTile => ({
            id: "organization",
            title: "Organisation",
            rail: part.id,
            large: true,
            // The name (in bold), its legal form, then the address.
            items: organisation.name.trim() || organisation.legalForm.trim() || addressLines.length > 0
                ? [...[organisation.name.trim() ? "**" + organisation.name.trim() + "**" : "", organisation.legalForm].filter(line => line.trim().length > 0), TILE_DIVIDER, ...addressLines]
                // (Nothing written yet: what the column asks, its first line, as the other tiles do.)
                : snippet(part),
            content: () => (
                <LegalEntityEditor
                    value={legalEntity}
                    prefill={legalEntityPrefill}
                    foundersProfile={foundersProfile}
                    openingDate={openingDate}
                    onChangeOpeningDate={onChangeOpeningDate}
                    organizationOnly
                    description={typeof values[part.id] === "string" ? values[part.id] as string : organisation.mainActivity}
                    onDescriptionChange={(next) => onChange({ ...values, [part.id]: next })}
                    onChange={(next) => onChangeLegalEntity?.(next)}
                    disabled={disabled}
                />
            )
        });

        // THE POSITIONING TILE says what was chosen in three groups, each of one or two bulleted lines, a hairline between two groups: the business (its audience and its buyer's category), the user (only for a Proxy or Dual-Intent buyer: the relationship and the life stage) and the offering (the purposes); a group with no answer is left out; no text.
        const wordsOf = (ids: readonly string[], words: Record<string, string>) => ids.map(id => words[id]).filter((line): line is string => typeof line === "string" && line.length > 0);
        // (The user's words are the card's own, shortened to their first part so that a group takes one line or two: "Friend" for "Friend or acquaintance", "Other relationship" for "Other"; the life stages as they are.)
        const userWords: Record<string, string> = Object.fromEntries([...BUYER_USER_RELATIONS.b2c, ...BUYER_USER_RELATIONS.b2b, ...USER_LIFE_STAGES].map(option => [option.id, option.label === "Other" ? "Other relationship" : option.id.startsWith("rel:") ? option.label.split(" or ")[0] : option.label]));
        // (A buyer's category in the card's words, "Proxy"; where categories of more than one model are chosen, each says its model, "B2C: Direct" and "B2B: Direct", so that two alike are not one word twice.)
        const categoryWord = (id: string): string => {
            const [model, kind] = id.split(":");
            const word = BUYER_CATEGORIES.find(option => option.id === kind)?.label.replace(/ Buyers$/, "") ?? "";
            return word && organisation.buyerCategory.length > 1 ? (CUSTOMER_TYPE_WORDS[model]?.split(" ")[0] ?? model.toUpperCase()) + ": " + word : word;
        };
        const positioningGroups: string[][] = [
            // (The business: its audience, then the buyer's category in the card's words, "Proxy Buyers"; the relationship has its own words only where it has no category yet.)
            [...wordsOf(organisation.customerType.filter(model => !organisation.buyerCategory.some(id => id.startsWith(model + ":"))), CUSTOMER_TYPE_WORDS), ...wordsOf(organisation.audience, AUDIENCE_WORDS), ...organisation.buyerCategory.map(categoryWord).filter(word => word.length > 0)],
            wordsOf(organisation.endUser, userWords),
            // (The differentiation and the outcomes left Positioning on 2026-11-08: they are the Business System's now, so the tile no longer says them.)
            wordsOf(organisation.purpose, PURPOSE_WORDS)
        ].filter(words => words.length > 0);
        // One option on each line, with its bullet, every option said in its own words (no count stands for options left out; the tile ends at a whole line where its square is full, as every tile does); a divider line between two groups.
        // (The tile's divider is one line of its list, as high as a line of text, so the list still ends at a whole line.)
        const positioningItems = positioningGroups.flatMap((words, at) => [...(at > 0 ? [TILE_DIVIDER] : []), ...words]);
        const positioningMarks = positioningItems.map(item => item === TILE_DIVIDER ? undefined : { bullet: true });

        /** The control of a column, drawn with the answer it is saved in (this section's, or another section's of the page). */
        const columnControl = (part: (typeof parts)[number], from: Record<string, unknown>, save: (next: Record<string, unknown>) => void) => (
            part.id === "imprint"
                ? <ImprintFields value={from[part.id]} onChange={(next) => save({ ...from, [part.id]: next })} disabled={disabled} />
                : part.id === "positioning" && onChangeLegalEntity
                    // The Early Positioning text under its questions is the shared optional note (the Notes of every card).
                    ? <OptionalNote label="Notes" fieldId={part.label} ariaLabel="Notes" placeholder="Add a note" value={typeof from[part.id] === "string" ? from[part.id] as string : ""} onChange={(next) => save({ ...from, [part.id]: next })} disabled={disabled} />
                : part.id === "values" || part.id === "principles"
                    ? <NumberedTextList label={part.label} value={from[part.id]} onChange={(next) => save({ ...from, [part.id]: next })} disabled={disabled} />
                    : (
                        <SingleAnswerRenderer
                            definition={part.answer}
                            ariaLabel={part.label}
                            autoGrow
                            value={from[part.id]}
                            onChange={(next) => save({ ...from, [part.id]: next })}
                            disabled={disabled}
                            resolveDynamicOptions={resolveDynamicOptions}
                            rowSelection={rowSelection}
                            ownerSuggestions={ownerSuggestions}
                            processLibraryProcesses={processLibraryProcesses}
                            dynamicOptionsDependency={from}
                        />
                    )
        );

        // PURPOSE (doc 45): the Identity System's second chapter draws its six texts as three pair tiles, Mission & Vision, Values & Principles,
        // Philosophy & Manifesto. Mission and Vision are saved in Definition, the page's first section, under their own keys; Definition does not draw them.
        const holdsPurpose = (candidate: readonly (typeof parts)[number][] | undefined) => !!candidate?.some(part => part.id === "philosophy") && !!candidate?.some(part => part.id === "manifesto");
        const purposeHere = holdsPurpose(parts);
        const purposeBeside = !purposeHere && !!pageSections?.some(section => holdsPurpose(section.definition.parts));
        const definitionBeside = purposeHere ? pageSections?.find(section => section.definition.parts?.some(part => part.id === "mission")) : undefined;

        /** A text of a pair: its column, the answer it is saved in and its saver, and the other section it belongs to (Mission and Vision: Definition). */
        interface PairText { part: (typeof parts)[number]; from: Record<string, unknown>; save: (next: Record<string, unknown>) => void; elsewhere?: PageSectionAnswer }
        const ownText = (id: string): PairText[] => parts.filter(part => part.id === id).map(part => ({ part, from: values, save: (next: Record<string, unknown>) => onChange(next) }));
        const besideText = (id: string): PairText[] => {
            const section = definitionBeside;
            const part = section?.definition.parts?.find(candidate => candidate.id === id);
            if (!section || !part) {
                return [];
            }
            const from = section.value && typeof section.value === "object" && !Array.isArray(section.value) ? section.value as Record<string, unknown> : {};
            return [{ part, from, save: (next: Record<string, unknown>) => section.onChange(next), elsewhere: section }];
        };
        /** A pair tile ("Mission & Vision"): both texts' lines on its face, a hairline between them; its dialog holds the two side by side, each with its heading and its "i". */
        const pairTile = (texts: PairText[]): SectionTile => ({
            id: texts.map(text => text.part.id).join("-"),
            // (A master tile of its chapter: one size with every other, whatever their number; layout rules, section 23.)
            large: true,
            // (A master tile's title may take a forced break: the pair's names on two lines, each whole; layout rules, "A title with a forced break".)
            title: texts.map(text => text.part.label).join(" &\n"),
            rail: texts[0]?.part.id,
            items: texts.flatMap((text, at) => [...(at > 0 ? [TILE_DIVIDER] : []), ...snippet(text.part, text.from)]),
            content: () => (
                // SIDE BY SIDE (owner, 2026-11-09: "place them side by side"): the two texts in the Organisation's two columns, its 1px divider down the middle,
                // one under the other where the window is narrow (the grid's own rule): a principle beside the value it keeps, the Vision beside the Mission.
                <div className="column-tile-content" data-rail={texts[0]?.part.id} role="group" aria-label={texts.map(text => text.part.label).join(" & ")}>
                <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-organization purpose-pair">
                    {texts.map((text) => {
                        const block = (
                            <div className="column-tile-content legal-entity-field" data-rail={text.part.id} role="group" aria-label={text.part.label}>
                                <div className="business-engagement-section-head">
                                    <DialogHeading title={text.part.label} info={guidance(text.part)} />
                                </div>
                                {columnControl(text.part, text.from, text.save)}
                            </div>
                        );
                        return (
                            <Fragment key={text.part.id}>
                                {/* (Each text is marked with the keys of the section it is saved in, Mission and Vision with Definition's: its notes, its search results and Review's "Go there" find it; the dialog stands outside the page's own marks.) */}
                                {fieldPage
                                    ? <FieldPageProvider organizationId={fieldPage.organizationId} systemNumber={fieldPage.systemNumber} sectionNumber={text.elsewhere?.number ?? fieldPage.sectionNumber} pageTitle={fieldPage.pageTitle}>{block}</FieldPageProvider>
                                    : block}
                            </Fragment>
                        );
                    })}
                </div>
                </div>
            )
        });

        const tiles: SectionTile[] = purposeHere
            ? [
                pairTile([...besideText("mission"), ...besideText("vision"), ...ownText("mission"), ...ownText("vision")]),
                pairTile([...ownText("values"), ...ownText("principles")]),
                pairTile([...ownText("philosophy"), ...ownText("manifesto")])
            ].filter(tile => tile.id.length > 0)
            : parts.filter(part => !(purposeBeside && (part.id === "mission" || part.id === "vision"))).map(part => part.id === "description" && onChangeLegalEntity ? organizationTile(part) : ({
            id: part.id,
            large: true,
            // (The Positioning tile is named by the business stage, Early Positioning first; its saved answer keeps the key "positioning".)
            title: part.id === "positioning" ? positioningName(businessStage) : part.label,
            rail: part.id,
            items: part.id === "positioning" && onChangeLegalEntity ? positioningItems : snippet(part),
            itemMarks: part.id === "positioning" && onChangeLegalEntity ? positioningMarks : undefined,
            content: () => (
                <div className="column-tile-content" data-rail={part.id} role="group" aria-label={part.label}>
                    {/* The dialog's title, as every tile's dialog has one. */}
                    <div className="business-engagement-section-head">
                        <DialogHeading title={part.id === "positioning" ? positioningName(businessStage) : part.label} info={guidance(part)} />
                    </div>
                    {/* The Positioning tile opens with who the business sells to and the kind of market (design document 28, 8.2), saved in the Legal Entity answer, above its own text. */}
                    {part.id === "positioning" && onChangeLegalEntity && (
                        <LegalEntityEditor
                            value={legalEntity}
                            businessStage={businessStage}
                            audienceOnly
                            onChange={(next) => onChangeLegalEntity(next)}
                            disabled={disabled}
                        />
                    )}
                    {columnControl(part, values, (next) => onChange(next))}
                </div>
            )
        }));

        // THE FOUNDERS & OWNERSHIP TILE stands on the Identity System's Definition, after the Positioning (owner, 2026-11-09: moved from the Legal
        // Entity). Its answer is still the Legal Entity's and the Founders Profile's, and its fields keep that section's keys (a field page of its own).
        if (onChangeLegalEntity && onChangeFoundersProfile && parts.some(part => part.id === "description") && parts.some(part => part.id === "positioning")) {
            const founders = (
                <LegalEntityEditor
                    value={legalEntity}
                    foundersProfile={foundersProfile}
                    onChangeFoundersProfile={onChangeFoundersProfile}
                    asTiles
                    foundersOnly
                    onChange={(next) => onChangeLegalEntity(next)}
                    disabled={disabled}
                />
            );
            tiles.push({
                id: "legal-entity-founders",
                title: "Founders & Ownership",
                large: true,
                rail: railId(LEGAL_ENTITY_SECTIONS[1]),
                anchor: "legal-section-1",
                ...foundersTileFace(legalEntity, true),
                content: () => fieldPage && legalEntitySectionNumber !== undefined
                    ? <FieldPageProvider organizationId={fieldPage.organizationId} systemNumber={fieldPage.systemNumber} sectionNumber={legalEntitySectionNumber} pageTitle={fieldPage.pageTitle}>{founders}</FieldPageProvider>
                    : founders
            });
        }

        return (
            <div
                className="answer-columns business-foundation business-engagement business-capability column-tiles-page"
                style={{ "--answer-column-count": 1 } as CSSProperties}
            >
                <CardShell
                    
                    data-anchor="column-tiles"
                    style={{ "--strategy-theme-hue": (parts[0]?.id === "philosophy" ? workHue("decide") : workHue("create")) } as CSSProperties}
                >
                    <div className="card-scroll">
                        <div className="business-capability-section business-capability-tiles-section">
                            {frameTitle ? <div className="business-engagement-section-head tiles-frame-head"><span className="field-group-title business-foundation-subhead">{frameTitle}</span></div> : <div className="business-capability-heading-spacer" aria-hidden="true" />}
                            <SectionTiles label={tiles.map(tile => tile.title).join(", ")} hue={(parts[0]?.id === "philosophy" ? workHue("decide") : workHue("create"))} tiles={tiles} />
                        </div>
                    </div>
                </CardShell>
            </div>
        );

    }

    if (definition.columns) {

        return (

            <div
                className="answer-columns"
                style={
                    {
                        "--answer-column-count": parts.length
                    } as CSSProperties
                }
            >

                {/*
                    Labels and questions are separate grid ROWS rather
                    than one stacked block per column. A grid row sizes
                    to its tallest item, so every column's question text
                    begins on the same line even when one title wraps to
                    two lines and its neighbour doesn't.
                */}
                {parts.map((part, index) => (

                    <h3
                        key={`label-${part.id}`}
                        className="answer-column-label"
                        id={`answer-column-label-${part.id}`}
                    >

                        {part.label.length > 0 && (
                            <>
                                {/*
                                    Number and title are separate boxes
                                    (not one "N. Title" string) so a
                                    title that wraps starts its second
                                    line under its own text rather than
                                    under the number -- and so that
                                    stays exact whether the number is
                                    one digit or two.
                                */}
                                <span className="answer-column-label-number">
                                    {(columnNumberOffset ?? 0) + index + 1 + "."}
                                </span>

                                <span className="answer-column-label-text">
                                    {bindLabelAroundAmpersand(part.label)}
                                    <FieldMark label={part.label} section={part.id} />
                                </span>
                                <FieldStatus label={part.label} section={part.id} />
                            </>
                        )}

                    </h3>

                ))}

                {/*
                    The whole guidance row goes when the Help button
                    hides it, rather than each block being emptied:
                    an empty row would still take a grid track and a
                    gap, leaving a band of nothing between the titles
                    and the line.
                */}
                {showInstructions && parts.map(part => (

                    <div key={`questions-${part.id}`} className="answer-column-questions">

                        {/*
                            Split per line rather than left as one
                            "pre-line" run so each line is its own
                            block -- a bullet hangs its wrap under its
                            own text, while an explanation line (no
                            bullet) stays flush to the margin. See
                            .answer-question-line in conversation.css.
                        */}
                        {(part.questions ?? "").split("\n").map((line, lineIndex) => (

                            <span
                                key={lineIndex}
                                className={questionLineClass(line)}
                            >
                                {line}
                            </span>

                        ))}

                    </div>

                ))}

                {columnsDivider && (

                    <div className="answer-columns-divider">
                        {columnsDivider}
                    </div>

                )}

                {parts.map(part => (

                    /*
                        Labelled as a group by its own column heading.
                        The editor inside is a bare <textarea> with no
                        label of its own (see InterviewInput), so
                        without this a screen reader announces twelve
                        identical, unnamed text areas on an Identity
                        page with no way to tell Mission from Vision.
                        `role="group"` + `aria-labelledby` makes each
                        one announce its column name on entry.
                    */
                    <div
                        key={`editor-${part.id}`}
                        className="answer-column-editor"
                        data-rail={part.id}
                        role={part.label.length > 0 ? "group" : undefined}
                        aria-labelledby={
                            part.label.length > 0
                                ? `answer-column-label-${part.id}`
                                : undefined
                        }
                    >

                        <SingleAnswerRenderer

                            definition={part.answer}

                            ariaLabel={part.label}

                            autoGrow

                            value={values[part.id]}

                            onChange={(next) => onChange({ ...values, [part.id]: next })}

                            disabled={disabled}

                            resolveDynamicOptions={resolveDynamicOptions}

                            rowSelection={rowSelection}

                            ownerSuggestions={ownerSuggestions}

                            processLibraryProcesses={processLibraryProcesses}

                            dynamicOptionsDependency={values}

                        />

                    </div>

                ))}

            </div>

        );

    }

    return (

        <div className="answer-multi-part">

            {parts.map(part => (

                <div key={part.id} className="answer-part">

                    {part.label.length > 0 && (
                        <h3 className="answer-part-label">{part.label}</h3>
                    )}

                    <SingleAnswerRenderer

                        definition={part.answer}

                            ariaLabel={part.label}

                        value={values[part.id]}

                        onChange={(next) => onChange({ ...values, [part.id]: next })}

                        disabled={disabled}

                        resolveDynamicOptions={resolveDynamicOptions}

                        rowSelection={rowSelection}

                        ownerSuggestions={ownerSuggestions}

                        processLibraryProcesses={processLibraryProcesses}

                        dynamicOptionsDependency={values}

                    />

                </div>

            ))}

        </div>

    );

}
export default function AnswerRenderer(props: AnswerRendererProps) {

    if (props.definition.type === AnswerType.MultiPart) {
        return <MultiPartAnswerRenderer {...props} />;
    }

    return <SingleAnswerRenderer {...props} />;

}

/**
 * Renders every Answer Structure EXCEPT Multi-Part, which wraps
 * this component once per part (see MultiPartAnswerRenderer
 * above) -- kept as its own component (rather than a branch
 * inside AnswerRenderer itself) specifically so its hooks below
 * stay unconditional for whichever single, concrete `definition.
 * type` it's mounted with, the same Rules-of-Hooks reasoning
 * that already applied before Multi-Part existed.
 */
function SingleAnswerRenderer({

    definition,

    value,

    onChange,

    disabled = false,

    resolveDynamicOptions,

    rowSelection,

    ownerSuggestions,

    processLibraryProcesses,

    dynamicOptionsDependency,

    ariaLabel,

    autoGrow,

    // Used by the Brand System's own editors, which number their
    // sections continuously with the rest of their System and host
    // the progress line inside their own grid -- see
    // BrandStyleEditor. Ignored by every other Answer Structure.
    columnNumberOffset,

    legalEntityPrefill,
    targetAudience,

    identityVision,

    // What the Business System's Customer Engagement page needs
    // from its Foundation page, resolved by the page (see
    // AnswerRendererProps.businessFoundation). Ignored by every
    // other Answer Structure.
    businessFoundation,
    onOpenBusinessFoundation,
    organisationCurrency = "",
    legalEntityFounders,
    foundersProfile,
    legalEntity,
    onChangeLegalEntity,
    onChangeFoundersProfile,
    businessCapability,
    financialFoundation,
    openingDate,
    onChangeOpeningDate,
    businessStage,
    globalSettings,

    financialSustainability,

    businessEngagement,

    onOpenBusinessEngagement,
    onOpenBusinessCapability,
    onChangeBusinessCapability,
    onOpenFinancialFoundation,

    onOpenLegalEntity,

    columnsDivider,

    frameTitle,

    showInstructions = true,

    // What the Strategy System's three pages need from each other,
    // resolved by the page (see AnswerRendererProps.strategy).
    // Ignored by every other Answer Structure.
    strategy

}: AnswerRendererProps) {

    const { fixedVariantOptions, activeVariantId, setActiveVariantId, cardListOptions, activeCardId, setActiveCardId, variantCardsScrollRef, profileCardsScrollRef, tableColumns } = useAnswerState({ definition, value, onChange, resolveDynamicOptions, dynamicOptionsDependency });

    const scope: AnswerScope = { definition, value, onChange, disabled, resolveDynamicOptions, rowSelection, ownerSuggestions, processLibraryProcesses, dynamicOptionsDependency, ariaLabel, autoGrow, columnNumberOffset, legalEntityPrefill, targetAudience, identityVision, businessFoundation, onOpenBusinessFoundation, organisationCurrency, legalEntityFounders, foundersProfile, legalEntity, onChangeLegalEntity, onChangeFoundersProfile, businessCapability, financialFoundation, openingDate, onChangeOpeningDate, businessStage, globalSettings, financialSustainability, businessEngagement, onOpenBusinessEngagement, onOpenBusinessCapability, onChangeBusinessCapability, onOpenFinancialFoundation, onOpenLegalEntity, columnsDivider, frameTitle, showInstructions, strategy, fixedVariantOptions, activeVariantId, setActiveVariantId, cardListOptions, activeCardId, setActiveCardId, variantCardsScrollRef, profileCardsScrollRef, tableColumns };

    switch (definition.type) {

        case AnswerType.FreeText:

            return renderFreeText(scope);

        case AnswerType.FixedVariantText:

            return renderFixedVariantText(scope);

        case AnswerType.TLayoutText:

            return renderTLayoutText(scope);

        case AnswerType.Table:

            return renderTable(scope);

        case AnswerType.Checklist:

            return renderChecklist(scope);

        case AnswerType.CardList:

            return renderCardList(scope);

        case AnswerType.ProfileCards:

            return renderProfileCards(scope);

        case AnswerType.ProcessLibrary:

            return renderProcessLibrary(scope);

        case AnswerType.OperationalLog:

            return renderOperationalLog(scope);

        case AnswerType.BusinessFoundation:

            return renderBusinessFoundation(scope);

        case AnswerType.BusinessEngagement:

            return renderBusinessEngagement(scope);

        case AnswerType.BusinessCapability:

            return renderBusinessCapability(scope);

        case AnswerType.FinancialFoundation:

            return renderFinancialFoundation(scope);

        case AnswerType.FinancialSustainability:

            return renderFinancialSustainability(scope);

        case AnswerType.LegalEntity:

            return renderLegalEntity(scope);

        case AnswerType.FoundersProfile:

            return renderFoundersProfile(scope);

        case AnswerType.BrandStyle:

            return renderBrandStyle(scope);

        case AnswerType.BrandInventory:

            return renderBrandInventory(scope);

        case AnswerType.StrategyFoundation:

            return renderStrategyFoundation(scope);

        case AnswerType.StrategicPeriod:

            return renderStrategicPeriod(scope);

        case AnswerType.StrategicRoadmap:

            return renderStrategicRoadmap(scope);

        case AnswerType.RolesResponsibilities:

            return renderRolesResponsibilities(scope);

        default:

            return null;

    }

}
