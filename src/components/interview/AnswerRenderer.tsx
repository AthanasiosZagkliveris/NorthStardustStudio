import { CSSProperties, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { OpenPage } from "./jumpTo.ts";

import InterviewInput from "./InterviewInput.tsx";
import DynamicTable, { TableColumn, TableRow } from "./DynamicTable.tsx";
import ProcessLibraryEditor from "./ProcessLibraryEditor.tsx";
import OperationalLogEditor from "./OperationalLogEditor.tsx";
import RolesResponsibilitiesEditor from "./RolesResponsibilitiesEditor.tsx";
import BrandStyleEditor from "./BrandStyleEditor.tsx";
import BusinessCapabilityEditor from "./BusinessCapabilityEditor.tsx";
import BusinessEngagementEditor from "./BusinessEngagementEditor.tsx";
import BusinessFoundationEditor from "./BusinessFoundationEditor.tsx";
import FinancialFoundationEditor from "./FinancialFoundationEditor.tsx";
import FinancialSustainabilityEditor from "./FinancialSustainabilityEditor.tsx";
import LegalEntityEditor from "./LegalEntityEditor.tsx";
import FoundersProfileEditor from "./FoundersProfileEditor.tsx";
import BrandInventoryEditor from "./BrandInventoryEditor.tsx";
import StrategyFoundationEditor from "./StrategyFoundationEditor.tsx";
import StrategicPeriodEditor from "./StrategicPeriodEditor.tsx";
import StrategicRoadmapEditor from "./StrategicRoadmapEditor.tsx";

import type { GlobalSettingsValue } from "../../framework/engine/GlobalSettings.ts";
import { AnswerDefinition, TableColumnDefinition } from "../../framework/model/index.ts";

import { AnswerType } from "../../framework/enums/AnswerType.ts";
import {
    CardListAnswerValue,
    CardListItemValue,
    ChecklistItemValue,
    LegalEntityFounderValue,
    LegalEntityValue,
    OperationalLogAnswerValue,
    ProcessLibraryAnswerValue,
    ProcessRecordValue,
    ProfileCardValue,
    ProfileCardsAnswerValue,
    RolesResponsibilitiesAnswerValue,
    StrategicPeriodValue,
    StrategyFoundationValue,
    StrategyRangeValue,
    StrategyThemeValue,
    isAnswerEmpty,
    isDateColumn,
    visibleTableColumns,
    strategyThemeName
} from "../../framework/engine/AnswerUtils.ts";
import { useDragToScroll } from "../../hooks/useDragToScroll.ts";
import { useListAutoFormat } from "../../hooks/useListAutoFormat.ts";
import { FieldMark, FieldStatus } from "./fieldMarks.tsx";
import SectionTiles, { DialogHeading, type SectionTile } from "./SectionTiles.tsx";
import { ImprintFields, NumberedTextList } from "./ColumnFields.tsx";
import { workHue } from "../../framework/engine/WorkColours.ts";

let checklistItemCounter = 0;

/**
 * Creates a unique id for a newly added Checklist
 * item (used only as a React key / update target,
 * never persisted or exported).
 */
function createChecklistItemId(): string {

    checklistItemCounter += 1;

    return `checklist-item-${Date.now()}-${checklistItemCounter}`;

}

let cardListItemCounter = 0;

/**
 * Creates a unique id for a newly added Card List
 * entry (used only as a React key / update target,
 * never persisted or exported).
 */
function createCardListItemId(): string {

    cardListItemCounter += 1;

    return `cardlist-item-${Date.now()}-${cardListItemCounter}`;

}

let profileCardCounter = 0;

/**
 * Creates a unique id for a newly added Profile
 * Card (used only as a React key / update target,
 * never persisted or exported).
 */
function createProfileCardId(): string {

    profileCardCounter += 1;

    return `profile-card-${Date.now()}-${profileCardCounter}`;

}

/**
 * A Profile Card's textarea that grows tall enough to
 * show its entire value with no internal scrolling --
 * matches DynamicTable's AutoGrowTextarea, so a long
 * answer stretches the card's *natural* content height
 * (which ProfileCardInner then measures) instead of
 * scrolling inside a fixed-size box.
 */
function AutoGrowTextarea({

    className,

    value,

    placeholder,

    disabled,

    onChange

}: {

    className: string;

    value: string;

    placeholder?: string;

    disabled?: boolean;

    onChange: (value: string) => void;

}) {

    const ref = useRef<HTMLTextAreaElement | null>(null);

    // "* "/"- " -> bullet, "1. " -> numbered list, Enter continues
    // or exits the current list line -- see useListAutoFormat.ts.
    const listAutoFormat = useListAutoFormat(value, onChange);

    // A stable merged-ref callback (not a fresh arrow function every
    // render) -- both `ref` and `listAutoFormat.textareaRef` are
    // themselves stable (useRef's own object identity never
    // changes), so this only needs to be created once. Without this,
    // React would call the old ref callback with `null` and the new
    // one with the element on every single keystroke (a fresh
    // function reference each render reads as "a different ref" to
    // React), which is harmless here but pure churn.
    const setRefs = useCallback((el: HTMLTextAreaElement | null) => {
        ref.current = el;
        listAutoFormat.textareaRef.current = el;
    }, [listAutoFormat.textareaRef]);

    function resize(el: HTMLTextAreaElement | null) {

        if (!el) {
            return;
        }

        el.style.height = "auto";

        el.style.height = `${el.scrollHeight}px`;

    }

    useLayoutEffect(() => {

        resize(ref.current);

    }, [value]);

    return (

        <textarea

            ref={setRefs}

            className={className}

            rows={1}

            placeholder={placeholder}

            disabled={disabled}

            value={value}

            onChange={(event) => {

                listAutoFormat.onChange(event);

                resize(event.target);

            }}

            onKeyDown={listAutoFormat.onKeyDown}

        />

    );

}

/**
 * Wraps a Profile Card's content. Cards sit in a
 * horizontal, non-wrapping row (see .profile-cards-row)
 * but deliberately do NOT scale their content down or
 * clip it: a card with a lot of text simply grows taller
 * instead (its subtitle textareas are AutoGrowTextarea,
 * so they grow with their own content), and every card in
 * the row stretches to match the tallest one via
 * .profile-cards-row's align-items:stretch. This is just
 * a thin, named wrapper for the padding/layout styling in
 * .profile-card-inner -- no measurement or scaling logic
 * needed.
 */
function ProfileCardInner({ children }: { children: ReactNode }) {

    return (

        <div className="profile-card-inner">

            {children}

        </div>

    );

}

interface AnswerRendererProps {

    definition: AnswerDefinition;

    value: unknown;

    onChange: (value: unknown) => void;

    disabled?: boolean;

    /**
     * Resolves a Table column's live dropdown
     * options from another Section's Card List
     * response (see TableColumnDefinition.dynamicSource).
     *
     * Only needed when this Section's Table has a
     * column that declares a `dynamicSource`;
     * omitted (or returning []) elsewhere.
     */
    resolveDynamicOptions?: (systemTitle: string | undefined, sectionTitle: string, cardTitle: string) => string[];

    /**
     * When provided, this Section's Table (there is at most
     * one Table per Section) becomes a row-picker in addition
     * to an editable table -- each row is clickable/highlighted
     * per `isSelected`, and a selection bullet is rendered under
     * the "#" column. Used by the Product Development System's
     * Product Register step so the user can pick which Product
     * to work on directly from the table, instead of a separate
     * picker list underneath it.
     */
    rowSelection?: {
        isSelected: (row: TableRow, index: number) => boolean;
        onSelect: (row: TableRow, index: number) => void;
    };

    /**
     * Passed straight through to ProcessLibraryEditor's own
     * `ownerSuggestions` prop (see its doc comment) -- ignored by
     * every other Answer Structure. Omitted (or empty) elsewhere.
     */
    ownerSuggestions?: string[];

    /**
     * The SAME Operations System session's current Process
     * Library (Section 2) response -- passed straight through to
     * OperationalLogEditor's and RolesResponsibilitiesEditor's own
     * `processes` prop (see their doc comments for what each does
     * with it). Ignored by every other Answer Structure. Omitted
     * (or empty) elsewhere.
     */
    processLibraryProcesses?: ProcessRecordValue[];

    /**
     * A value to watch, purely for `tableColumns`'s own memoization
     * (see below) -- when omitted, defaults to this instance's own
     * `value`. Multi-Part passes down the WHOLE Section's combined
     * `Record<string, unknown>` (every part's value, not just this
     * part's own slice) instead, so a Table column whose
     * `dynamicSource` self-references a SIBLING part of the same
     * Multi-Part Section (e.g. Financial Risk's Evaluation/
     * Mitigation Measures/Contingency Plan tables sourcing their
     * "Risk" dropdown from the Description table, all four living
     * in the same Section) sees its options refresh live as the
     * user types into that sibling part, instead of staying frozen
     * at whatever was on screen when this part first mounted.
     */
    dynamicOptionsDependency?: unknown;

    /**
     * Rendered as one full-width row of a COLUMN-LAYOUT Multi-Part
     * answer (see AnswerDefinition.columns), between the row of
     * column labels/questions and the row of editors below them --
     * i.e. a continuous horizontal band spanning every column.
     *
     * This exists so the interview's progress line can sit between
     * the question text and the answer boxes: in a column layout
     * those two things are interleaved inside this component, so a
     * sibling rendered before or after it can't land between them.
     * Ignored by every other Answer Structure and layout.
     */
    columnsDivider?: ReactNode;

    /** The frame's heading, on top of its tiles (a page of several sections: "1. Definition"). */
    frameTitle?: string;

    /**
     * How many column-layout columns precede this Section's own, so
     * a Section's columns can be numbered continuously across the
     * whole System rather than restarting at 1 on each page. 0 on a
     * Section that numbers its own units (see
     * AnswerDefinition.nestedNumbering), whose columns read 1, 2, 3
     * on every page. Defaults to 0, i.e. numbering from 1.
     */
    columnNumberOffset?: number;

    /**
     * Handed to the Legal Entity page so it can answer its first
     * fields from what the app already knows (see
     * LegalEntityEditorProps.prefill). Ignored by every other
     * Answer Structure.
     */
    legalEntityPrefill?: { organisationName: string; founderName: string };

    /**
     * The Identity System's Positioning answer, shown by the
     * Business System's Foundation page beside the instruction that
     * asks the founder to divide it into Segments.
     */
    targetAudience?: string;

    /** The Identity System's Vision: shown beside the Strategic Compass. */
    identityVision?: string;

    /**
     * The Business System's Foundation answer (Page 1), handed to
     * the Customer Engagement page (Page 2) -- which is answered
     * entirely against it: its Segments, their Profiles and their
     * Offerings are what that page refers to rather than re-asks.
     * Ignored by every other Answer Structure.
     */
    businessFoundation?: unknown;

    /**
     * Opens the Business System's Foundation page, for the
     * reference links Page 2 draws on the names it borrows from it.
     * Absent when there is nowhere to go, and the names are then
     * drawn as plain text rather than as links that do nothing.
     */
    onOpenBusinessFoundation?: OpenPage;

    /**
     * The currency the organisation is registered in, from the
     * Identity System's Legal Entity page -- "" until a country is
     * chosen there. The Business System's Infrastructure &
     * Capability page offers it beside every Price. Ignored by
     * every other Answer Structure.
     */
    organisationCurrency?: string;

    /**
     * The founders answered under the Identity System's Legal
     * Entity, 2. Founders & Ownership. The Business System's
     * Infrastructure & Capability page lists them under
     * 1. Founders, and the Founders Profile page draws a card for
     * each. Ignored by every other Answer Structure.
     */
    legalEntityFounders?: readonly LegalEntityFounderValue[];

    /**
     * The Identity System's Founders Profile, as saved: each
     * founder's Roles for the Business System's Infrastructure &
     * Capability page, and what keeps a profiled founder's row on
     * the Legal Entity page (see LegalEntityEditorProps.foundersProfile).
     * Ignored by every other Answer Structure.
     */
    foundersProfile?: unknown;

    /**
     * The whole Legal Entity answer, and the Business System's
     * Page 3 and Page 4 answers, for the two Financial pages: Page 4
     * consolidates costs from the Legal Entity and Page 3, and Page 5
     * reads Page 4. Ignored by every other Answer Structure.
     */
    legalEntity?: LegalEntityValue;
    businessCapability?: unknown;
    financialFoundation?: unknown;
    /** The Opening Date (an ISO date) of the Global Settings, for the pages that place costs around it. */
    openingDate?: string;
    onChangeOpeningDate?: (iso: string) => void;
    /** The Global Settings, for the default rates a card shows beside its own. */
    globalSettings?: GlobalSettingsValue;
    /** Sustainability's saved value, for Financial Foundation's operating need. */
    financialSustainability?: unknown;
    /** Customer Engagement's saved value: its Demand & Conversion gives expected sales. */
    businessEngagement?: unknown;
    onOpenBusinessEngagement?: OpenPage;
    onOpenBusinessCapability?: OpenPage;
    /** Writes 3. Infrastructure & Capability from another page (a channel's "Create a cost …"). */
    onChangeBusinessCapability?: (value: unknown) => void;
    onOpenFinancialFoundation?: OpenPage;
    /** 1. Identity System → 3. Legal Entity, from Financial Foundation's costs and the Founders Profile. */
    onOpenLegalEntity?: OpenPage;

    /**
     * Accessible name for the control this Answer renders, when
     * the caller knows its title -- e.g. a column-layout part
     * passes its own column title, so the Identity System's twelve
     * text boxes announce "Mission", "Vision" and so on instead of
     * twelve identical unnamed fields. See InterviewInput.ariaLabel.
     */
    ariaLabel?: string;

    /**
     * Free Text only: the text box grows to fit its content rather
     * than scrolling inside itself. Set by the column layout (see
     * MultiPartAnswerRenderer), whose boxes sit side by side. See
     * InterviewInput.autoGrow.
     */
    autoGrow?: boolean;

    /**
     * Whether a page that carries its own instructions above the
     * progress line should show them.
     *
     * Toggled by the Help button the page renders just above that
     * line (see Conversation.tsx). Hiding them leaves the headings
     * and the answers in place -- what goes away is the guidance,
     * which is what takes up the room once it has been read.
     *
     * Defaults to shown, so anything that does not pass it behaves
     * exactly as it did before.
     */
    showInstructions?: boolean;

    /**
     * Everything the Strategy System's pages need from EACH OTHER.
     *
     * Its three pages read forward -- the Strategic Period page
     * develops the Themes defined on the Foundation page, and the
     * Roadmap draws both -- and a Section can only see its own
     * response. So the page (Conversation.tsx) resolves the other
     * Sections' answers and hands them down here.
     *
     * Ignored by every other Answer Structure, and omitted outside
     * the Strategy System.
     */
    strategy?: {

        /** The Foundation page's answer (Period + Themes). */
        foundation: StrategyFoundationValue;

        /** The Strategic Period page's answer (Goals downward). */
        period: StrategicPeriodValue;

        /**
         * The number the Strategic Period section carries on the
         * Foundation page, which every nested number on page 2
         * hangs off ("4" gives Theme 1 as 4.1).
         */
        themeNumberPrefix: string;

        /**
         * Returns false to abandon removing a Theme -- asked when
         * that Theme already has Goals recorded against it on the
         * Strategic Period page, which removing it would take with
         * it.
         */
        guardThemeRemoval: (theme: StrategyThemeValue, apply: () => void) => void;

        /** The Current Situation drafted from the Business System; "" when it records nothing yet. */
        situationDraft?: string;

        /** Asks before a Refresh replaces the founder's own words. */
        guardSituationRefresh?: (apply: () => void) => void;

        /** Opens a Business System page, by its Answer Structure. */
        openBusinessPage?: (type: AnswerType) => void;

        /** The financial plan's first and last month; null when it has none. */
        financialPlan?: StrategyRangeValue | null;

        /**
         * Returns false to abandon a change to the Strategic
         * Period -- asked when narrowing it would leave an
         * Objective's own period outside it.
         */
        guardPeriodChange: (period: StrategyRangeValue, apply: () => void) => void;

        /** Writes the Strategic Period page's answer (the Foundation page's Strategic Period draws its Themes' tiles). */
        onChangePeriod?: (period: StrategicPeriodValue) => void;

    };

}

/**
 * Adapts a resolved Answer Definition's
 * table columns into the shape expected
 * by DynamicTable.
 *
 * The "#" row-index column is rendered
 * automatically by DynamicTable, so any
 * column explicitly titled "#" is dropped
 * here to avoid a duplicate.
 */
function resolveColumnType(
    column: TableColumnDefinition
): TableColumn["type"] {

    if (column.dynamicSource) {
        return "dynamic-select";
    }

    if (column.autofill) {
        return "autofill";
    }

    if (column.field) {
        return "field";
    }

    if (isDateColumn(column.title)) {
        return "date";
    }

    // A plain, no-suffix column literally titled "Notes" (e.g.
    // "- Column 4: Notes" in a System's markdown, with none of the
    // " - <Type> Field" / "Dynamic Field" / "Autofill" suffixes
    // handled above) is a genuine free-text Notes column, not just
    // incidental text -- "wherever there is a note column or window,
    // it should always have the free text features (bullet points
    // and numbered lists features), and should be regular not bold.
    // Standarise it" / "I meant Notes column or card." Route it
    // through the SAME shared "notes" rendering every other
    // Notes-purpose field in the app uses (see NotesField.tsx and
    // DynamicTable's own "notes" case) instead of the generic "text"
    // column type, which has no placeholder and no guaranteed
    // regular weight.
    // Any column literally titled "Description" gets the exact
    // same Notes-style treatment as "Notes" itself (item: "Whenever
    // there is a Description column table, it should behave as the
    // Notes, its text could be long, and the user could add bullet
    // points or numbers, so each row/card should get longer
    // accordingly") -- Description columns are used throughout the
    // new Financial Model/Financial Risk/Stakeholder Categories/
    // Target Audience tables specifically because free-running notes
    // text is what they're for.
    if (["notes", "description"].includes(column.title.trim().toLowerCase())) {
        return "notes";
    }

    return "text";

}

function toTableColumns(
    columns: TableColumnDefinition[],
    resolveDynamicOptions?: (systemTitle: string | undefined, sectionTitle: string, cardTitle: string) => string[]
): TableColumn[] {

    return visibleTableColumns(columns)

        .map(column => ({

            id: column.id,

            title: column.title,

            type: resolveColumnType(column),

            field: column.field,

            options:
                column.dynamicSource && resolveDynamicOptions
                    ? resolveDynamicOptions(
                        column.dynamicSource.systemTitle,
                        column.dynamicSource.sectionTitle,
                        column.dynamicSource.cardTitle
                    )
                    : undefined,

            repeatable: column.repeatable,

            repeatableValue: column.repeatableValue,

            sumCheck: column.sumCheck,

            groupSumCheck: column.groupSumCheck

        }));

}

/**
 * Renders a Multi-Part answer (see AnswerType.MultiPart) as one
 * part after another, each with its own optional label heading,
 * each delegating its own rendering to `SingleAnswerRenderer` --
 * so a Table/Free Text/etc. part behaves exactly as it would if
 * it were a whole Section's own answer. The composite value is a
 * Record<string, unknown> keyed by each part's own `id`; updating
 * one part's value replaces just that key and leaves every other
 * part's own value untouched.
 *
 * When `definition.tabbed` is set (see its own doc comment), this
 * renders as one flat tab bar instead -- the SAME card-style tab
 * look Fixed Variant Text's own tabs use, reusing its
 * `.answer-variant-card`/`.answer-variant-cards-wrapper` classes,
 * even though here each tab can hold a DIFFERENT Answer Structure
 * (e.g. Financial Model's "Revenue Streams" tab is a Table, while
 * "Funding Sources"/"Financial Objectives"/"Financial Principles"
 * are Free Text) rather than every tab sharing one Structure. The
 * `useState` below is called unconditionally regardless of
 * `tabbed` -- this component is only ever mounted for a MultiPart
 * Section, whose `tabbed`-ness is fixed for that mount's whole
 * lifetime (structural, from the Framework), so calling it
 * unconditionally here is always safe and simply goes unused in
 * the (default) stacked layout.
 *
 * When `definition.columns` is set instead (see its own doc
 * comment), every part renders at once SIDE BY SIDE in equal-width
 * columns, each column carrying its own label and -- unlike either
 * other layout -- its own question text directly above its editor
 * (see AnswerPartDefinition.questions). `tabbed` is checked first,
 * so a Section that somehow declared both still renders as tabs.
 */
/**
 * Picks the wrapping style for one authored question/explanation
 * line.
 *
 * A bullet line (the interpreter emits a literal "• " prefix -- see
 * FrameworkInterpreter's normalizeParagraphLine) hangs its wrapped
 * text under its own words. An explanation line has no bullet to
 * align to, so it stays flush to the margin instead of being
 * indented to a bullet it doesn't have.
 *
 * Exported for reuse by InterviewSection, which renders the same
 * authored lines for every non-column Section.
 */
/**
 * Controls WHERE a two-part "A & B" column title is allowed to
 * break, so it wraps after the "&" rather than wherever the column
 * width happens to run out.
 *
 * "Attitude & Body Language" has three breakable spaces, and the
 * browser picks the last one that fits -- giving "Attitude & Body /
 * Language". Binding "Attitude" to the "&" and binding "Body" to
 * "Language" with non-breaking spaces leaves exactly one breakable
 * space, the one after the "&", so it can only wrap as
 * "Attitude & / Body Language".
 *
 * Non-breaking spaces rather than `white-space:nowrap` on purpose:
 * nowrap would let a long trailing part overflow a narrow column
 * outright, whereas the label's own `overflow-wrap:break-word` can
 * still break a nbsp-joined run as a last resort.
 *
 * A title with no "&" is returned unchanged.
 */
function bindLabelAroundAmpersand(label: string): string {

    const match = label.match(/^(.*?\S)\s*&\s*(\S.*)$/);

    if (!match) {
        return label;
    }

    const NBSP = " ";

    const before = match[1].replace(/\s+/g, NBSP);
    const after = match[2].replace(/\s+/g, NBSP);

    return `${before}${NBSP}& ${after}`;

}

export function questionLineClass(line: string): string {

    return line.trimStart().startsWith("•")
        ? "answer-question-line answer-question-line-bullet"
        : "answer-question-line";

}

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

    showInstructions = true

}: AnswerRendererProps) {

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

                            <button

                                type="button"

                                key={part.id}

                                className={
                                    "answer-variant-card" +
                                    (isActive ? " active" : "") +
                                    (filled ? " filled" : "")
                                }

                                onClick={() => setActivePartId(part.id)}

                            >

                                {part.label}

                                {filled && (
                                    <span className="answer-variant-card-check">
                                        ✓
                                    </span>
                                )}

                            </button>

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

    // A column page of FOUR columns (Identity's Definition and Ethics, Brand's Ambassador): the page's tile system, 2 x 2, instead of four narrow columns.
    // Each tile carries its title and a line or two of what is in it; pressing it opens the column (its questions and its editor) in the tile's dialog.
    if (definition.columns && parts.length === 4) {

        const firstWords = (text: string) => text.replace(/^\s*•\s*/, "").trim().replace(/\s+/g, " ");
        const snippet = (part: (typeof parts)[number]): string[] => {
            const answered = typeof values[part.id] === "string"
                ? (values[part.id] as string).split("\n").map(firstWords).filter(line => line.length > 0).slice(0, 12)
                : [];
            if (answered.length > 0) {
                return answered;
            }
            // (Nothing written yet: what the column asks, its first line.)
            return (part.questions ?? "").split("\n").map(firstWords).filter(line => line.length > 0).slice(0, 1);
        };

        // The column's guidance is the "i" beside its title.
        const guidance = (part: (typeof parts)[number]): string[] => (part.questions ?? "").split("\n").map(firstWords).map(line => line.replace(/^[-•]\s*/, "")).filter(line => line.length > 0);

        const tiles: SectionTile[] = parts.map(part => ({
            id: part.id,
            title: part.label,
            rail: part.id,
            items: snippet(part),
            content: () => (
                <div className="column-tile-content" data-rail={part.id} role="group" aria-label={part.label}>
                    {/* The dialog's title, as every tile's dialog has one. */}
                    <div className="business-engagement-section-head">
                        <DialogHeading title={part.label} info={guidance(part)} />
                    </div>
                    {part.id === "imprint"
                        ? <ImprintFields value={values[part.id]} onChange={(next) => onChange({ ...values, [part.id]: next })} disabled={disabled} />
                        : part.id === "values" || part.id === "principles"
                            ? <NumberedTextList label={part.label} value={values[part.id]} onChange={(next) => onChange({ ...values, [part.id]: next })} disabled={disabled} />
                            : (
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
                            )}
                </div>
            )
        }));

        return (
            <div
                className="answer-columns business-foundation business-engagement business-capability column-tiles-page"
                style={{ "--answer-column-count": 1 } as CSSProperties}
            >
                <div
                    className="business-foundation-input business-foundation-card business-engagement-input"
                    data-anchor="column-tiles"
                    style={{ "--strategy-theme-hue": (parts[0]?.id === "philosophy" ? workHue("decide") : workHue("create")) } as CSSProperties}
                >
                    <div className="card-scroll">
                        <div className="business-capability-section business-capability-tiles-section">
                            {frameTitle ? <div className="business-engagement-section-head tiles-frame-head"><span className="field-group-title business-foundation-subhead">{frameTitle}</span></div> : <div className="business-capability-heading-spacer" aria-hidden="true" />}
                            <SectionTiles label={parts.map(part => part.label).join(", ")} hue={(parts[0]?.id === "philosophy" ? workHue("decide") : workHue("create"))} tiles={tiles} />
                        </div>
                    </div>
                </div>
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
    businessCapability,
    financialFoundation,
    openingDate,
    onChangeOpeningDate,
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

    // Hooks must run unconditionally on every render (regardless
    // of which Answer Structure this Section uses), so the active
    // Fixed Variant Text card and the active Card List card are
    // both tracked here rather than inside the switch case below.
    const fixedVariantOptions =
        definition.type === AnswerType.FixedVariantText
            ? (definition.variants ?? [])
            : [];

    const [activeVariantId, setActiveVariantId] = useState<string | undefined>(
        fixedVariantOptions[0]?.id
    );

    const cardListOptions =
        definition.type === AnswerType.CardList
            ? (definition.cards ?? [])
            : [];

    const [activeCardId, setActiveCardId] = useState<string | undefined>(
        cardListOptions[0]?.id
    );

    // Lets the user press anywhere on these rows' own background
    // and drag left/right to scroll them, same as DynamicTable's
    // own data table -- see useDragToScroll. `variantCardsScrollRef`
    // covers both the Fixed Variant Text and Card List variant-tab
    // rows below (only one of the two ever mounts per Section, so
    // sharing one ref between them is safe); `profileCardsScrollRef`
    // covers the Profile Cards row.
    const variantCardsScrollRef = useDragToScroll<HTMLDivElement>();
    const profileCardsScrollRef = useDragToScroll<HTMLDivElement>();

    // Self-healing safety net for sessions saved before Checklist/
    // Card List always seeded a first entry (see defaultAnswerValue):
    // if a saved response somehow has zero items, add one back --
    // mirrors DynamicTable's own "always at least one row" effect.
    useEffect(() => {

        if (definition.type !== AnswerType.Checklist) {
            return;
        }

        const items = Array.isArray(value) ? value as ChecklistItemValue[] : [];

        if (items.length === 0) {
            onChange([{ id: createChecklistItemId(), text: "", checked: false }]);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [definition.type, Array.isArray(value) ? value.length : -1]);

    useEffect(() => {

        if (definition.type !== AnswerType.CardList) {
            return;
        }

        const cardsDef = definition.cards ?? [];

        const values: CardListAnswerValue =
            value && typeof value === "object" && !Array.isArray(value)
                ? value as CardListAnswerValue
                : {};

        const missing = cardsDef.filter(card => !(values[card.id]?.length));

        if (missing.length > 0) {

            const next = { ...values };

            missing.forEach(card => {
                next[card.id] = [{ id: createCardListItemId(), text: "" }];
            });

            onChange(next);

        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [definition.type, definition.cards, value]);

    // Built unconditionally (Table is only one of the possible Answer
    // Structures, same reasoning as the other hooks above) and
    // memoized so a Table Section's <DynamicTable> (see the Table
    // case below) gets the SAME `columns` array reference across a
    // keystroke-driven re-render, not a freshly rebuilt one every
    // time -- letting `DynamicTable`'s own `React.memo` (see
    // DynamicTable.tsx) actually skip re-rendering the rest of the
    // Table when only some OTHER Section on the page changed, rather
    // than always seeing "columns changed" and re-rendering anyway.
    // `definition` is referentially stable for the lifetime of one
    // Section (Conversation.tsx keys <AnswerRenderer> by Section
    // number, so switching Sections remounts this component instead
    // of just changing the prop), so this only recomputes when it
    // actually needs to -- PLUS whenever `dynamicOptionsDependency`
    // changes (defaulting to this instance's own `value`, so a
    // plain, non-Multi-Part Table still only recomputes on its own
    // edits exactly as before). A Multi-Part Section's sibling parts
    // instead all share the WHOLE Section's combined value as this
    // dependency (see MultiPartAnswerRenderer), so a self-
    // referencing `dynamicSource` (e.g. Financial Risk's Evaluation
    // table sourcing its "Risk" dropdown from the Description
    // table's own "Risk" column, both parts of the same Section)
    // re-resolves its live options as the user types into the
    // SOURCE part, not just once at mount.
    const tableColumns = useMemo(
        () => toTableColumns(definition.table?.columns ?? [], resolveDynamicOptions),
        [definition, resolveDynamicOptions, dynamicOptionsDependency ?? value]
    );

    switch (definition.type) {

        case AnswerType.FreeText:

            return (

                <InterviewInput

                    mode="textarea"

                    ariaLabel={ariaLabel}

                    value={String(value ?? "")}

                    disabled={disabled}

                    onChange={onChange}

                    autoGrow={autoGrow}

                />

            );

        case AnswerType.FixedVariantText: {

            const variants = fixedVariantOptions;

            const values: Record<string, string> =
                value && typeof value === "object" && !Array.isArray(value)
                    ? (value as Record<string, string>)
                    : {};

            const activeVariant =
                variants.find(variant => variant.id === activeVariantId) ??
                variants[0];

            return (

                <div className="answer-variant-cards-wrapper">

                    <div className="answer-variant-cards" ref={variantCardsScrollRef}>

                        {variants.map(variant => {

                            const filled =
                                typeof values[variant.id] === "string" &&
                                values[variant.id].trim().length > 0;

                            const isActive = variant.id === activeVariant?.id;

                            return (

                                <button

                                    type="button"

                                    key={variant.id}

                                    className={
                                        "answer-variant-card" +
                                        (isActive ? " active" : "") +
                                        (filled ? " filled" : "")
                                    }

                                    onClick={() => setActiveVariantId(variant.id)}

                                >

                                    {variant.title}

                                    {filled && (
                                        <span className="answer-variant-card-check">
                                            ✓
                                        </span>
                                    )}

                                </button>

                            );

                        })}

                    </div>

                    {activeVariant && (

                        <div className="answer-variant-editor">

                            <InterviewInput

                                mode="textarea"

                                value={String(values[activeVariant.id] ?? "")}

                                disabled={disabled}

                                onChange={(next) =>

                                    onChange({

                                        ...values,

                                        [activeVariant.id]: next

                                    })

                                }

                            />

                        </div>

                    )}

                </div>

            );

        }

        case AnswerType.TLayoutText: {

            // Same value shape as Fixed Variant Text (see
            // AnswerType.TLayoutText's own doc comment) -- just
            // rendered as one always-all-visible card instead of
            // tab-switched panels. The 1st declared variant spans
            // the top, the 2nd and 3rd sit side by side underneath
            // it. A Section that (mis)declares a variant count other
            // than 3 still renders sensibly: 1 variant is just the
            // top field alone, 2 is top + a single full-width bottom
            // field (no vertical divider, nothing to divide), and
            // anything past the 3rd is simply not shown, since this
            // Structure only has room for 3 -- a 4th field belongs
            // in a Fixed Variant Text or Card List Section instead.
            const variants = definition.variants ?? [];

            const values: Record<string, string> =
                value && typeof value === "object" && !Array.isArray(value)
                    ? (value as Record<string, string>)
                    : {};

            const [topVariant, leftVariant, rightVariant] = variants;

            function updateVariant(variantId: string, text: string) {
                onChange({ ...values, [variantId]: text });
            }

            return (

                <div className="handbook-t-card">

                    {topVariant && (

                        <div className="handbook-t-card-top">

                            <div className="handbook-t-card-label">{topVariant.title}</div>

                            <AutoGrowTextarea
                                className="handbook-t-card-textarea handbook-t-card-textarea-top"
                                placeholder={`Write ${topVariant.title.toLowerCase()}...`}
                                disabled={disabled}
                                value={values[topVariant.id] ?? ""}
                                onChange={(next) => updateVariant(topVariant.id, next)}
                            />

                        </div>

                    )}

                    {(leftVariant || rightVariant) && (

                        <>

                            <div className="handbook-t-card-divider-horizontal" />

                            <div className="handbook-t-card-bottom">

                                {leftVariant && (

                                    <div className="handbook-t-card-column">

                                        <div className="handbook-t-card-label">{leftVariant.title}</div>

                                        <AutoGrowTextarea
                                            className="handbook-t-card-textarea"
                                            placeholder={`Write ${leftVariant.title.toLowerCase()}...`}
                                            disabled={disabled}
                                            value={values[leftVariant.id] ?? ""}
                                            onChange={(next) => updateVariant(leftVariant.id, next)}
                                        />

                                    </div>

                                )}

                                {leftVariant && rightVariant && (
                                    <div className="handbook-t-card-divider-vertical" />
                                )}

                                {rightVariant && (

                                    <div className="handbook-t-card-column">

                                        <div className="handbook-t-card-label">{rightVariant.title}</div>

                                        <AutoGrowTextarea
                                            className="handbook-t-card-textarea"
                                            placeholder={`Write ${rightVariant.title.toLowerCase()}...`}
                                            disabled={disabled}
                                            value={values[rightVariant.id] ?? ""}
                                            onChange={(next) => updateVariant(rightVariant.id, next)}
                                        />

                                    </div>

                                )}

                            </div>

                        </>

                    )}

                </div>

            );

        }

        case AnswerType.Table: {

            const rows: TableRow[] = Array.isArray(value) ? value as TableRow[] : [];

            return (

                <DynamicTable

                    columns={tableColumns}

                    value={rows}

                    disabled={disabled}

                    onChange={onChange}

                    rowNumberLabel={definition.table?.rowNumberLabel}

                    rowSelection={rowSelection}

                />

            );

        }

        case AnswerType.Checklist: {

            const items: ChecklistItemValue[] =
                Array.isArray(value) ? value as ChecklistItemValue[] : [];

            function updateItems(nextItems: ChecklistItemValue[]) {
                onChange(nextItems);
            }

            function addItem() {

                updateItems([
                    ...items,
                    { id: createChecklistItemId(), text: "", checked: false }
                ]);

            }

            function removeItem(itemId: string) {

                // At least one item always stays -- clear it back
                // to blank instead of removing the last row, the
                // same convention DynamicTable uses for its last
                // remaining row.
                if (items.length <= 1) {

                    updateItems(items.map(candidate =>
                        candidate.id === itemId
                            ? { ...candidate, text: "", checked: false }
                            : candidate
                    ));

                    return;

                }

                updateItems(items.filter(candidate => candidate.id !== itemId));

            }

            function moveItem(index: number, direction: -1 | 1) {

                const targetIndex = index + direction;

                if (targetIndex < 0 || targetIndex >= items.length) {
                    return;
                }

                const next = [...items];

                const [moved] = next.splice(index, 1);
                next.splice(targetIndex, 0, moved);

                updateItems(next);

            }

            return (

                <div className="answer-checklist">

                    {items.map((item, index) => (

                        <div key={item.id} className="answer-checklist-row">

                            <input
                                type="checkbox"
                                className="answer-checklist-checkbox"
                                checked={item.checked}
                                disabled={disabled}
                                onChange={() =>

                                    updateItems(items.map(candidate =>
                                        candidate.id === item.id
                                            ? { ...candidate, checked: !candidate.checked }
                                            : candidate
                                    ))

                                }
                            />

                            <input
                                type="text"
                                className="answer-checklist-input"
                                placeholder="Checklist item"
                                disabled={disabled}
                                value={item.text}
                                onChange={(event) =>

                                    updateItems(items.map(candidate =>
                                        candidate.id === item.id
                                            ? { ...candidate, text: event.target.value }
                                            : candidate
                                    ))

                                }
                            />

                            {/* All four row controls grouped together on
                                one side, matching DynamicTable's single
                                combined actions cluster (rather than
                                splitting move to one end and remove/add
                                to the other). */}
                            <div className="dynamic-table-row-actions">

                                <div className="dynamic-table-row-move">

                                    <button
                                        type="button"
                                        className="dynamic-table-row-move-up"
                                        aria-label="Move item up"
                                        title="Move item up"
                                        disabled={disabled || index === 0}
                                        onClick={() => moveItem(index, -1)}
                                    >
                                        ▲
                                    </button>

                                    <button
                                        type="button"
                                        className="dynamic-table-row-move-down"
                                        aria-label="Move item down"
                                        title="Move item down"
                                        disabled={disabled || index === items.length - 1}
                                        onClick={() => moveItem(index, 1)}
                                    >
                                        ▼
                                    </button>

                                </div>

                                <div className="dynamic-table-row-delete-add">

                                    <button
                                        type="button"
                                        className="dynamic-table-row-remove"
                                        aria-label={items.length <= 1 ? "Clear item" : "Remove item"}
                                        title={items.length <= 1 ? "Clear item" : "Remove item"}
                                        disabled={disabled}
                                        onClick={() => removeItem(item.id)}
                                    >
                                        −
                                    </button>

                                    <button
                                        type="button"
                                        className="dynamic-table-row-add"
                                        aria-label="Add item"
                                        title="Add item"
                                        disabled={disabled}
                                        onClick={addItem}
                                    >
                                        +
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            );

        }

        case AnswerType.CardList: {

            const cards = cardListOptions;

            const values: CardListAnswerValue =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as CardListAnswerValue
                    : {};

            const activeCard =
                cards.find(card => card.id === activeCardId) ?? cards[0];

            const activeItems: CardListItemValue[] =
                activeCard ? (values[activeCard.id] ?? []) : [];

            function updateCardItems(cardId: string, items: CardListItemValue[]) {
                onChange({ ...values, [cardId]: items });
            }

            function addCardItem(cardId: string) {

                const items = values[cardId] ?? [];

                updateCardItems(cardId, [
                    ...items,
                    { id: createCardListItemId(), text: "" }
                ]);

            }

            function removeCardItem(cardId: string, itemId: string) {

                const items = values[cardId] ?? [];

                // At least one entry always stays per card -- clear
                // it back to blank instead of removing the last row.
                if (items.length <= 1) {

                    updateCardItems(cardId, items.map(candidate =>
                        candidate.id === itemId ? { ...candidate, text: "" } : candidate
                    ));

                    return;

                }

                updateCardItems(cardId, items.filter(candidate => candidate.id !== itemId));

            }

            function moveCardItem(cardId: string, index: number, direction: -1 | 1) {

                const items = values[cardId] ?? [];
                const targetIndex = index + direction;

                if (targetIndex < 0 || targetIndex >= items.length) {
                    return;
                }

                const next = [...items];

                const [moved] = next.splice(index, 1);
                next.splice(targetIndex, 0, moved);

                updateCardItems(cardId, next);

            }

            return (

                <div className="answer-variant-cards-wrapper">

                    <div className="answer-variant-cards" ref={variantCardsScrollRef}>

                        {cards.map(card => {

                            const items = values[card.id] ?? [];

                            const filled = items.some(
                                item => typeof item.text === "string" && item.text.trim().length > 0
                            );

                            const isActive = card.id === activeCard?.id;

                            return (

                                <button

                                    type="button"

                                    key={card.id}

                                    className={
                                        "answer-variant-card" +
                                        (isActive ? " active" : "") +
                                        (filled ? " filled" : "")
                                    }

                                    onClick={() => setActiveCardId(card.id)}

                                >

                                    {card.title}

                                    {filled && (
                                        <span className="answer-variant-card-check">
                                            ✓
                                        </span>
                                    )}

                                </button>

                            );

                        })}

                    </div>

                    {activeCard && (

                        <div className="answer-checklist">

                            {activeItems.map((item, index) => (

                                <div key={item.id} className="answer-checklist-row">

                                    <input
                                        type="text"
                                        className="answer-checklist-input"
                                        placeholder={`${activeCard.title} entry`}
                                        disabled={disabled}
                                        value={item.text}
                                        onChange={(event) =>

                                            updateCardItems(activeCard.id, activeItems.map(candidate =>
                                                candidate.id === item.id
                                                    ? { ...candidate, text: event.target.value }
                                                    : candidate
                                            ))

                                        }
                                    />

                                    {/* All four row controls grouped together
                                        on one side, matching DynamicTable's
                                        single combined actions cluster. */}
                                    <div className="dynamic-table-row-actions">

                                        <div className="dynamic-table-row-move">

                                            <button
                                                type="button"
                                                className="dynamic-table-row-move-up"
                                                aria-label="Move entry up"
                                                title="Move entry up"
                                                disabled={disabled || index === 0}
                                                onClick={() => moveCardItem(activeCard.id, index, -1)}
                                            >
                                                ▲
                                            </button>

                                            <button
                                                type="button"
                                                className="dynamic-table-row-move-down"
                                                aria-label="Move entry down"
                                                title="Move entry down"
                                                disabled={disabled || index === activeItems.length - 1}
                                                onClick={() => moveCardItem(activeCard.id, index, 1)}
                                            >
                                                ▼
                                            </button>

                                        </div>

                                        <div className="dynamic-table-row-delete-add">

                                            <button
                                                type="button"
                                                className="dynamic-table-row-remove"
                                                aria-label={activeItems.length <= 1 ? "Clear entry" : "Remove entry"}
                                                title={activeItems.length <= 1 ? "Clear entry" : "Remove entry"}
                                                disabled={disabled}
                                                onClick={() => removeCardItem(activeCard.id, item.id)}
                                            >
                                                −
                                            </button>

                                            <button
                                                type="button"
                                                className="dynamic-table-row-add"
                                                aria-label="Add entry"
                                                title="Add entry"
                                                disabled={disabled}
                                                onClick={() => addCardItem(activeCard.id)}
                                            >
                                                +
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            );

        }

        case AnswerType.ProfileCards: {

            const profile = definition.profile;

            const profileValue: ProfileCardsAnswerValue =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as ProfileCardsAnswerValue
                    : { cards: [] };

            const cards: ProfileCardValue[] =
                Array.isArray(profileValue.cards) ? profileValue.cards : [];

            const subtitles = profile?.subtitles ?? [];
            const cardLabel = profile?.cardLabel ?? "Card";
            const trailing = profile?.trailingCard;

            function updateCards(nextCards: ProfileCardValue[]) {
                onChange({ ...profileValue, cards: nextCards });
            }

            function updateTrailing(text: string) {
                onChange({ ...profileValue, trailing: text });
            }

            function addCard() {

                updateCards([
                    ...cards,
                    { id: createProfileCardId(), title: "", sections: {} }
                ]);

            }

            function removeCard(cardId: string) {

                // At least one card always stays -- mirrors the
                // global "always at least one row/item" convention
                // used by DynamicTable, Checklist, and Card List
                // above: pressing remove on the last remaining
                // card clears it back to blank instead of doing
                // nothing (and instead of actually removing it,
                // which would leave the Section with zero cards).
                if (cards.length <= 1) {

                    updateCards(cards.map(card =>
                        card.id === cardId
                            ? { ...card, title: "", sections: {} }
                            : card
                    ));

                    return;

                }

                updateCards(cards.filter(card => card.id !== cardId));

            }

            function updateCardTitle(cardId: string, title: string) {

                updateCards(cards.map(card =>
                    card.id === cardId ? { ...card, title } : card
                ));

            }

            function updateCardSection(cardId: string, subtitleId: string, text: string) {

                updateCards(cards.map(card =>
                    card.id === cardId
                        ? { ...card, sections: { ...card.sections, [subtitleId]: text } }
                        : card
                ));

            }

            return (

                <div className="profile-cards-wrapper">

                    <div className="profile-cards-row" ref={profileCardsScrollRef}>

                        {cards.map((card, index) => (

                            <div key={card.id} className="profile-card">

                                <button
                                    type="button"
                                    className="profile-card-remove"
                                    aria-label={
                                        cards.length <= 1
                                            ? `Clear ${cardLabel} ${index + 1}`
                                            : `Remove ${cardLabel} ${index + 1}`
                                    }
                                    title={cards.length <= 1 ? "Clear" : "Remove"}
                                    disabled={disabled}
                                    onClick={() => removeCard(card.id)}
                                >
                                    ×
                                </button>

                                <ProfileCardInner>

                                    {/* Fixed, non-editable label -- always
                                        reads "Customer Group 1", "Competitor
                                        2", etc. -- kept separate from the
                                        title input below it (an optional
                                        custom name/nickname for the card)
                                        so the card's identity stays visible
                                        even once a custom title is typed. */}
                                    <div className="profile-card-fixed-label">
                                        {cardLabel} {index + 1}
                                    </div>

                                    <input
                                        type="text"
                                        className="answer-checklist-input profile-card-title-input"
                                        placeholder="Add a title..."
                                        disabled={disabled}
                                        value={card.title}
                                        onChange={(event) => updateCardTitle(card.id, event.target.value)}
                                    />

                                    {subtitles.map(subtitle => (

                                        <div key={subtitle.id} className="profile-card-section">

                                            <div className="profile-card-subtitle">
                                                {subtitle.title}
                                            </div>

                                            <AutoGrowTextarea
                                                className="profile-card-subtitle-textarea"
                                                placeholder={`Describe ${subtitle.title.toLowerCase()}...`}
                                                disabled={disabled}
                                                value={card.sections?.[subtitle.id] ?? ""}
                                                onChange={(next) =>
                                                    updateCardSection(card.id, subtitle.id, next)
                                                }
                                            />

                                        </div>

                                    ))}

                                </ProfileCardInner>

                            </div>

                        ))}

                        <button
                            type="button"
                            className="profile-card-add-tile"
                            aria-label={`Add ${cardLabel}`}
                            title={`Add ${cardLabel}`}
                            disabled={disabled}
                            onClick={addCard}
                        >
                            +
                        </button>

                    </div>

                    {trailing && (

                        <div className="profile-card profile-card-trailing">

                            <ProfileCardInner>

                                <div className="profile-card-subtitle">
                                    {trailing.title}
                                </div>

                                {trailing.placeholder && (
                                    <p className="profile-card-trailing-description">
                                        {trailing.placeholder}
                                    </p>
                                )}

                                <AutoGrowTextarea
                                    className="profile-card-subtitle-textarea"
                                    placeholder={trailing.placeholder}
                                    disabled={disabled}
                                    value={profileValue.trailing ?? ""}
                                    onChange={updateTrailing}
                                />

                            </ProfileCardInner>

                        </div>

                    )}

                </div>

            );

        }

        case AnswerType.ProcessLibrary: {

            const processes: ProcessLibraryAnswerValue =
                Array.isArray(value) ? value as ProcessLibraryAnswerValue : [];

            return (

                <ProcessLibraryEditor
                    value={processes}
                    onChange={onChange}
                    disabled={disabled}
                    ownerSuggestions={ownerSuggestions}
                />

            );

        }

        case AnswerType.OperationalLog: {

            const rows: OperationalLogAnswerValue =
                Array.isArray(value) ? value as OperationalLogAnswerValue : [];

            return (

                <OperationalLogEditor
                    value={rows}
                    onChange={onChange}
                    disabled={disabled}
                    processes={processLibraryProcesses ?? []}
                />

            );

        }

        case AnswerType.BusinessFoundation:

            return (

                <BusinessFoundationEditor
                    value={value}
                    showInstructions={showInstructions}
                    columnsDivider={columnsDivider}
                    frameTitle={frameTitle}
                    asTiles
                    targetAudience={targetAudience}
                    onChange={onChange}
                    disabled={disabled}
                />

            );

        case AnswerType.BusinessEngagement:

            return (

                <BusinessEngagementEditor
                    value={value}
                    showInstructions={showInstructions}
                    columnsDivider={columnsDivider}
                    foundation={businessFoundation}
                    onOpenFoundation={onOpenBusinessFoundation}
                    capability={businessCapability}
                    onChangeCapability={onChangeBusinessCapability}
                    onOpenCapability={onOpenBusinessCapability}
                    currency={organisationCurrency}
                    asTiles
                    onChange={onChange}
                    disabled={disabled}
                />

            );

        case AnswerType.BusinessCapability:

            return (

                <BusinessCapabilityEditor
                    value={value}
                    showInstructions={showInstructions}
                    columnsDivider={columnsDivider}
                    foundation={businessFoundation}
                    onOpenFoundation={onOpenBusinessFoundation}
                    organisationCurrency={organisationCurrency}
                    legalEntityFounders={legalEntityFounders}
                    legalExpenses={legalEntity?.expenses}
                    onOpenLegalEntity={onOpenLegalEntity}
                    foundersProfile={foundersProfile}
                    engagement={businessEngagement}
                    financialFoundation={financialFoundation}
                    openingDate={openingDate}
                    globalSettings={globalSettings}
                    onOpenEngagement={onOpenBusinessEngagement}
                    onChange={onChange}
                    disabled={disabled}
                />

            );

        case AnswerType.FinancialFoundation:

            return (

                <FinancialFoundationEditor
                    value={value}
                    showInstructions={showInstructions}
                    columnsDivider={columnsDivider}
                    foundation={businessFoundation}
                    capability={businessCapability}
                    legalEntity={legalEntity}
                    sustainability={financialSustainability}
                    engagement={businessEngagement}
                    currency={organisationCurrency}
                    openingDate={openingDate}
                    globalSettings={globalSettings}
                    onChangeOpeningDate={onChangeOpeningDate}
                    onOpenFoundation={onOpenBusinessFoundation}
                    onOpenCapability={onOpenBusinessCapability}
                    onOpenLegalEntity={onOpenLegalEntity}
                    onChange={onChange}
                    disabled={disabled}
                />

            );

        case AnswerType.FinancialSustainability:

            return (

                <FinancialSustainabilityEditor
                    value={value}
                    showInstructions={showInstructions}
                    columnsDivider={columnsDivider}
                    foundation={businessFoundation}
                    capability={businessCapability}
                    financialFoundation={financialFoundation}
                    engagement={businessEngagement}
                    legalEntity={legalEntity}
                    currency={organisationCurrency}
                    onOpenFoundation={onOpenBusinessFoundation}
                    onOpenFinancialFoundation={onOpenFinancialFoundation}
                    onOpenEngagement={onOpenBusinessEngagement}
                    onOpenCapability={onOpenBusinessCapability}
                    onChange={onChange}
                    disabled={disabled}
                />

            );

        case AnswerType.LegalEntity:

            return (

                <LegalEntityEditor
                    value={value}
                    prefill={legalEntityPrefill}
                    foundersProfile={foundersProfile}
                    openingDate={openingDate}
                    columnsDivider={columnsDivider}
                    frameTitle={frameTitle}
                    showInstructions={showInstructions}
                    asTiles
                    onChange={onChange}
                    disabled={disabled}
                />

            );

        case AnswerType.FoundersProfile:

            return (

                <FoundersProfileEditor
                    value={value}
                    legalEntityFounders={legalEntityFounders}
                    onOpenLegalEntity={onOpenLegalEntity}
                    columnsDivider={columnsDivider}
                    frameTitle={frameTitle}
                    showInstructions={showInstructions}
                    asTiles
                    onChange={onChange}
                    disabled={disabled}
                />

            );

        case AnswerType.BrandStyle:

            return (

                <BrandStyleEditor
                    value={value}
                    startNumber={(columnNumberOffset ?? 0) + 1}
                    columnsDivider={columnsDivider}
                    frameTitle={frameTitle}
                    showInstructions={showInstructions}
                    asTiles
                    onChange={onChange}
                    disabled={disabled}
                />

            );

        case AnswerType.BrandInventory:

            return (

                <BrandInventoryEditor
                    value={value}
                    startNumber={(columnNumberOffset ?? 0) + 1}
                    columnsDivider={columnsDivider}
                    showInstructions={showInstructions}
                    asTiles
                    onChange={onChange}
                    disabled={disabled}
                />

            );

        case AnswerType.StrategyFoundation:

            return (

                <StrategyFoundationEditor
                    value={value}
                    startNumber={(columnNumberOffset ?? 0) + 1}
                    columnsDivider={columnsDivider}
                    showInstructions={showInstructions}
                    onChange={onChange}
                    disabled={disabled}
                    guardThemeRemoval={strategy?.guardThemeRemoval}
                    guardPeriodChange={strategy?.guardPeriodChange}
                    periodTiles={strategy?.onChangePeriod ? (args) => (
                        <StrategicPeriodEditor
                            embedded
                            only={args.only}
                            value={strategy.period}
                            onChange={strategy.onChangePeriod!}
                            foundation={args.foundation}
                            founders={(legalEntityFounders ?? []).filter(founder => founder.name.trim().length > 0)}
                            organisationCurrency={organisationCurrency}
                            disabled={disabled}
                            onEditTheme={args.onEditTheme}
                            onRemoveTheme={args.onRemoveTheme}
                            onAddTheme={args.onAddTheme}
                            trailing={args.trailing}
                            roadmap={() => (
                                <StrategicRoadmapEditor
                                    foundation={args.foundation}
                                    period={strategy.period}
                                    columnsDivider={columnsDivider}
                                    showInstructions={showInstructions}
                                />
                            )}
                        />
                    ) : undefined}
                    vision={identityVision}
                    situationDraft={strategy?.situationDraft ?? ""}
                    guardSituationRefresh={strategy?.guardSituationRefresh}
                    openBusinessPage={strategy?.openBusinessPage}
                    financialPlan={strategy?.financialPlan ?? null}
                />

            );

        // Both of the remaining Strategy pages are drawn from the
        // Foundation page's answer, which lives in ANOTHER Section --
        // so it is handed in rather than read here. Without it there
        // is nothing to develop or draw, and the page says so.
        case AnswerType.StrategicPeriod:

            if (!strategy) {
                return null;
            }

            return (

                <StrategicPeriodEditor
                    value={value}
                    foundation={strategy.foundation}
                    founders={(legalEntityFounders ?? []).filter(founder => founder.name.trim().length > 0)}
                    organisationCurrency={organisationCurrency}
                    columnsDivider={columnsDivider}
                    showInstructions={showInstructions}
                    onChange={onChange}
                    disabled={disabled}
                />

            );

        case AnswerType.StrategicRoadmap:

            if (!strategy) {
                return null;
            }

            // The Roadmap is one large tile of its own, opening the roadmap in its dialog.
            return (
                <div className="answer-columns business-foundation business-engagement business-capability column-tiles-page column-tiles-page-wide" style={{ "--answer-column-count": 1 } as CSSProperties}>
                    <div
                        className="business-foundation-input business-foundation-card business-engagement-input"
                        data-anchor="column-tiles"
                        style={{ "--strategy-theme-hue": workHue("decide") } as CSSProperties}
                    >
                        <div className="card-scroll">
                            <div className="business-capability-section business-capability-tiles-section">
                                <div className="business-capability-heading-spacer" aria-hidden="true" />
                                <SectionTiles
                                    small
                                    label="Roadmap"
                                    hue={workHue("decide")}
                                    tiles={[{
                                        id: "roadmap",
                                        title: "Roadmap",
                                        view: true,
                                        items: strategy.foundation.themes.map(theme => strategyThemeName(theme)).filter(name => name.trim().length > 0).slice(0, 6),
                                        itemMarks: strategy.foundation.themes.map(() => ({ bullet: true })),
                                        content: () => (
                                            <div className="column-tile-content">
                                                <StrategicRoadmapEditor
                                                    foundation={strategy.foundation}
                                                    period={strategy.period}
                                                    columnsDivider={columnsDivider}
                                                    showInstructions={showInstructions}
                                                />
                                            </div>
                                        )
                                    }]}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );

        case AnswerType.RolesResponsibilities: {

            const notes: RolesResponsibilitiesAnswerValue =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as RolesResponsibilitiesAnswerValue
                    : {};

            return (

                <RolesResponsibilitiesEditor
                    value={notes}
                    onChange={onChange}
                    disabled={disabled}
                    processes={processLibraryProcesses ?? []}
                />

            );

        }

        default:

            return null;

    }

}
