import { ReactNode } from "react";
import type { OpenPage } from "../../tiles/jumpTo.ts";
import { TableColumn, TableRow } from "../../fields/DynamicTable.tsx";
import type { GlobalSettingsValue } from "../../../../framework/engine/GlobalSettings.ts";
import { AnswerDefinition, TableColumnDefinition } from "../../../../framework/model/index.ts";
import { AnswerType } from "../../../../framework/enums/AnswerType.ts";
import { LegalEntityFounderValue, LegalEntityValue, ProcessRecordValue, StrategicPeriodValue, StrategyFoundationValue, StrategyRangeValue, StrategyThemeValue, isDateColumn, visibleTableColumns } from "../../../../framework/engine/AnswerUtils.ts";

export let checklistItemCounter = 0;

/**
 * Creates a unique id for a newly added Checklist
 * item (used only as a React key / update target,
 * never persisted or exported).
 */
export function createChecklistItemId(): string {

    checklistItemCounter += 1;

    return `checklist-item-${Date.now()}-${checklistItemCounter}`;

}

export let cardListItemCounter = 0;

/**
 * Creates a unique id for a newly added Card List
 * entry (used only as a React key / update target,
 * never persisted or exported).
 */
export function createCardListItemId(): string {

    cardListItemCounter += 1;

    return `cardlist-item-${Date.now()}-${cardListItemCounter}`;

}

export let profileCardCounter = 0;

/**
 * Creates a unique id for a newly added Profile
 * Card (used only as a React key / update target,
 * never persisted or exported).
 */
export function createProfileCardId(): string {

    profileCardCounter += 1;

    return `profile-card-${Date.now()}-${profileCardCounter}`;

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
export function ProfileCardInner({ children }: { children: ReactNode }) {

    return (

        <div className="profile-card-inner">

            {children}

        </div>

    );

}

export interface AnswerRendererProps {

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
    /** Saves the Legal Entity page's answer from another page (3. Infrastructure & Capability's floating legal cards). */
    onChangeLegalEntity?: (value: unknown) => void;
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
export function resolveColumnType(
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

export function toTableColumns(
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
export function bindLabelAroundAmpersand(label: string): string {

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
