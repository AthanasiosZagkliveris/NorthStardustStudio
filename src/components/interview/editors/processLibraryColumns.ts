/* Part of ProcessLibraryEditor.tsx (moved out as it was, 2026-11-11: the owner, "can you do them all?"; ProcessLibraryEditor.tsx imports it). */

// Shared, page-unique ids: each of these <datalist>s is rendered
// ONCE for the whole table (its own suggestion set is the same
// regardless of which row's field is focused), rather than one per
// row -- there's only ever one Process Library editor mounted at a
// time, so a fixed id is safe.
export const OWNER_SUGGESTIONS_DATALIST_ID = "process-library-owner-suggestions";

import { type ProcessRecordValue, type ProcessScheduleValue, type ProcessSopValue, type ProcessStepValue } from "../../../framework/engine/AnswerUtils.ts";

export const PROCESS_STATUS_OPTIONS = ["Active", "Draft", "Retired"];

// A single offscreen canvas, created lazily and reused for every
// measurement rather than one per call -- same idiom as
// getOwnerMeasureContext below, just with the header's own BOLD
// weight (see `.process-library-table th{font-weight:600}` in
// conversation.css) rather than a field's normal weight, since it's
// header text this one measures.
let headerMeasureContext: CanvasRenderingContext2D | null | undefined;

function getHeaderMeasureContext(): CanvasRenderingContext2D | null {

    if (headerMeasureContext !== undefined) {
        return headerMeasureContext;
    }

    if (typeof document === "undefined") {
        headerMeasureContext = null;
        return headerMeasureContext;
    }

    const context = document.createElement("canvas").getContext("2d");

    if (context) {
        // Bold, matching every <th>'s own rendered weight -- if
        // "Inter" isn't loaded yet this silently falls back to a
        // generic sans-serif, which only ever measures WIDER than
        // Inter actually renders (erring toward extra width, never
        // toward a column coming out narrower than its own heading).
        context.font = "600 14px Inter, sans-serif";
    }

    headerMeasureContext = context;

    return headerMeasureContext;

}

// Cell padding is 10px on each side (see `.process-library-table
// th, td{padding:10px}` in conversation.css) plus a few extra
// pixels so the heading text never sits pixel-flush against its own
// column's border.
const HEADER_TEXT_PADDING = 26;

/**
 * "Set as a general rule the columns cannot get smaller than their
 * Headings' text" -- the minimum pixel width a column needs for its
 * OWN header text to render on one line without clipping or
 * spilling into a neighboring column, measured against the header's
 * actual bold font rather than guessed at. Every fixed column width
 * below is `Math.max`'d against this so a heading's own text is
 * always the FLOOR that width can never fall under, no matter what
 * hand-picked pixel value was chosen for other reasons (fitting a
 * `<select>`'s longest option, an icon cluster, etc). Falls back to
 * a generous per-character estimate when no canvas is available
 * (e.g. a non-browser test runner) -- same reasoning as
 * measureOwnerTextWidth below, erring toward extra width rather
 * than a clipped heading.
 */
function headerMinWidth(text: string): number {

    const context = getHeaderMeasureContext();
    const textWidth = context ? context.measureText(text).width : text.length * 9;

    return Math.ceil(textWidth) + HEADER_TEXT_PADDING;

}

// -----------------------------------------------------------------
// Column widths -- the Process table and the SOPs table share every
// one of these EXCEPT Status (Process-only) and Steps (SOPs-only),
// via the unscoped `.process-library-col-*` classes in
// conversation.css. Name/Purpose are the two the user can drag wider
// (see ColumnResizeHandle below); every other width here is fixed.
// Each is `Math.max`'d against its own heading's `headerMinWidth`
// (see above) -- the general "never smaller than the heading" rule
// -- computed once at module load since header text is static, never
// per-render.
// -----------------------------------------------------------------
// 56, not 40 -- this column now also carries its own extra left
// padding (see `th.process-library-col-number, td.process-library-
// col-number{padding-left:16px}` in conversation.css, added so the
// "#" itself isn't flush against the table's edge). Every box here
// is `box-sizing:border-box` (see the app-wide `*{box-sizing:
// border-box}` reset in global.css), so a column's own declared
// `width` already INCLUDES its padding -- widening the left padding
// without also widening this constant left less room for the actual
// chevron+number toggle than before, and it visibly spilled out of
// its own cell. 56px restores (and slightly improves on) the
// original ~20px of actual content room once the extra 6px of left
// padding and the shared 10px right padding are subtracted back out.
const NUMBER_COLUMN_WIDTH = Math.max(56, headerMinWidth("#"));

// The Process table's own heading reads "Process ID", the SOPs
// table's reads "SOP ID" (see the two tables' own <thead> below) --
// both share this ONE column width (same reasoning as every other
// shared column), so the floor has to fit whichever heading is
// longer.
const ID_COLUMN_WIDTH = Math.max(104, headerMinWidth("Process ID"), headerMinWidth("SOP ID"));

export const DEFAULT_NAME_COLUMN_WIDTH = 122;

export const DEFAULT_PURPOSE_COLUMN_WIDTH = 122;

// Also shared across "Process Owner" (Process table) / "SOP Owner"
// (SOPs table) -- see ID_COLUMN_WIDTH's own comment just above.
const OWNER_COLUMN_MIN_WIDTH = Math.max(110, headerMinWidth("Process Owner"), headerMinWidth("SOP Owner"));

// Generous enough that even a long "Regional Operations Lead"-style
// title/team name fits with no clipping -- the horizontal-scroll
// fallback on `.process-library-table-scroll` (see conversation.css)
// is what keeps a truly extreme value from breaking the layout,
// exactly the same fallback the user's own manual Name/Purpose
// resize already relies on.
const OWNER_COLUMN_MAX_WIDTH = 420;

const FREQUENCY_COLUMN_WIDTH = Math.max(140, headerMinWidth("Frequency"));

// Wide enough that "Retired" -- the longest of PROCESS_STATUS_OPTIONS
// -- never clips inside the native <select>, arrow icon included.
export const STATUS_COLUMN_WIDTH = Math.max(130, headerMinWidth("Status"));

const ACTIONS_COLUMN_WIDTH = 90;

// The floor a dragged Name/Purpose column can never go below --
// shared by "Process Name"/"SOP Name" (Name column, both tables)
// and "Purpose" (both tables), so it has to fit the longest of all
// three headings even though that means Purpose's own floor ends up
// a little more generous than its own heading strictly needs.
const MIN_RESIZABLE_COLUMN_WIDTH = Math.max(90, headerMinWidth("Process Name"), headerMinWidth("SOP Name"), headerMinWidth("Purpose"));

const MAX_RESIZABLE_COLUMN_WIDTH = 360;

export function clampResizableColumnWidth(width: number): number {
    return Math.min(MAX_RESIZABLE_COLUMN_WIDTH, Math.max(MIN_RESIZABLE_COLUMN_WIDTH, width));
}

/**
 * The Process table and the SOPs table are given an EXPLICIT total
 * `width` (rather than `width:100%`) so `table-layout:fixed` renders
 * every shared column at exactly its declared px width in both
 * tables, with nothing left over for the browser to stretch one
 * table's columns by a different factor than the other's (see the
 * comment on the `.process-library-table`/`.process-library-sops-
 * table` CSS rules for the full story). The two tables' non-shared
 * columns (Status vs Steps) are deliberately given the SAME width
 * (see STATUS_COLUMN_WIDTH/SOPS_STEPS_COLUMN_WIDTH+SOPS_SPACER_
 * COLUMN_WIDTH below) so this one formula produces the correct
 * total for BOTH tables -- which is also exactly what keeps the
 * trailing Actions column (move/remove/add) lined up at the same
 * horizontal position in both.
 */
export function computeProcessLibraryTableWidth(nameColumnWidth: number, purposeColumnWidth: number, ownerColumnWidth: number): number {

    return NUMBER_COLUMN_WIDTH + ID_COLUMN_WIDTH + nameColumnWidth + purposeColumnWidth
        + ownerColumnWidth + FREQUENCY_COLUMN_WIDTH + STATUS_COLUMN_WIDTH + ACTIONS_COLUMN_WIDTH;

}

// The SOPs table has no Status column of its own -- Steps takes its
// place, but only ever needs to show a 1-2 digit count, nowhere near
// STATUS_COLUMN_WIDTH. Rather than wasting all that width inside the
// Steps column itself, Steps stays compact and a blank spacer column
// picks up the rest of the difference, landing the SOPs table at the
// exact same total width as the Process table (see
// computeProcessLibraryTableWidth above) without changing what the
// Steps column visually looks like.
export const SOPS_STEPS_COLUMN_WIDTH = Math.max(60, headerMinWidth("Steps"));

export const SOPS_SPACER_COLUMN_WIDTH = STATUS_COLUMN_WIDTH - SOPS_STEPS_COLUMN_WIDTH;

/**
 * Regroups a list of ID-bearing rows (every Process, or the SOPs
 * within one Process) so rows sharing the same initials sit
 * together, in alphabetical order of those initials -- see the
 * mount-time effect below for why. `processDisplayId`/`sopDisplayId`
 * only ever compute a NUMBER from a row's position among its own
 * initials group; they never reorder the rows themselves, so
 * without this, a newly-inserted "ORD" row landing in between two
 * "PRC" rows would split what should read as one alphabetically-
 * grouped, cleanly numbered sequence in two. `Array.prototype.sort`
 * is guaranteed stable (ECMA-262 2019+), so rows that already share
 * the same initials keep their existing relative order -- which is
 * exactly the "number hierarchy" (001 before 002 before 003) the
 * display ID's own counting depends on.
 */
// A single offscreen canvas, created lazily and reused for every
// measurement rather than one per call -- `measureText` doesn't
// touch the DOM tree at all (the canvas is never appended anywhere),
// so this costs nothing to keep around for the component's whole
// lifetime.
let ownerMeasureContext: CanvasRenderingContext2D | null | undefined;

function getOwnerMeasureContext(): CanvasRenderingContext2D | null {

    if (ownerMeasureContext !== undefined) {
        return ownerMeasureContext;
    }

    if (typeof document === "undefined") {
        ownerMeasureContext = null;
        return ownerMeasureContext;
    }

    const context = document.createElement("canvas").getContext("2d");

    if (context) {
        // Matches the Owner field's own actual rendered font (see
        // `.process-library .interview-input` in conversation.css --
        // 15px, and global.css's app-wide "Inter" font-family). If
        // "Inter" isn't loaded yet, the canvas silently falls back to
        // a generic sans-serif, which only ever measures WIDER than
        // Inter actually renders -- erring toward extra width, never
        // toward clipping.
        context.font = "15px Inter, sans-serif";
    }

    ownerMeasureContext = context;

    return ownerMeasureContext;

}

function measureOwnerTextWidth(text: string): number {

    const context = getOwnerMeasureContext();

    // No canvas available at all (e.g. a non-browser test runner) --
    // fall back to a per-character estimate generous enough to only
    // ever over-allocate, never clip.
    return context ? context.measureText(text).width : text.length * 9;

}

/**
 * The Owner column's width is never dragged by hand (contrast
 * Name/Purpose, see ColumnResizeHandle above) -- it "automatically
 * adjusts to fit the whole text", recomputed from every Owner value
 * currently typed anywhere in the Process Library (every Process's
 * own Owner AND every one of its SOPs' Owners, not just whichever
 * table happens to be on screen -- both tables share this one width,
 * same as every other shared column, so they stay aligned). Measures
 * actual rendered text width via a canvas (see measureOwnerTextWidth
 * above) rather than guessing from character count, since a run of
 * "W"s and a run of "i"s need very different amounts of room at the
 * same length. `+70` on top of the longest measured value covers the
 * cell's own padding, the input's own padding/border, and the native
 * `<list>` datalist dropdown's arrow indicator -- comfortably bounded
 * (OWNER_COLUMN_MIN_WIDTH/MAX_WIDTH) so one unusually long entry
 * can't blow the column out to an unreasonable size.
 */
export function computeOwnerColumnWidth(processes: ProcessRecordValue[]): number {

    let longestTextWidth = 0;

    processes.forEach(process => {

        longestTextWidth = Math.max(longestTextWidth, measureOwnerTextWidth(process.who.trim()));

        const sops = Array.isArray(process.sops) ? process.sops : [];

        sops.forEach(sop => {
            longestTextWidth = Math.max(longestTextWidth, measureOwnerTextWidth(sop.who.trim()));
        });

    });

    if (longestTextWidth === 0) {
        return OWNER_COLUMN_MIN_WIDTH;
    }

    return Math.min(OWNER_COLUMN_MAX_WIDTH, Math.max(OWNER_COLUMN_MIN_WIDTH, longestTextWidth + 70));

}

/** An ID-bearing row's own initials, uppercased, falling back to `fallbackInitials` when blank -- the same normalization `sortRowsByInitials` sorts by, factored out so the "did the initials group change?" check below can use the exact same notion of a row's initials. */
function rowInitials(id: string | undefined, fallbackInitials: string): string {
    return (id ?? "").trim().toUpperCase() || fallbackInitials;
}

export function sortRowsByInitials<T extends { id?: string }>(rows: T[], fallbackInitials: string): T[] {

    return [...rows].sort((a, b) => {

        const aInitials = rowInitials(a.id, fallbackInitials);
        const bInitials = rowInitials(b.id, fallbackInitials);

        return aInitials.localeCompare(bInitials);

    });

}

/**
 * "Add a distinction line or a gap, between different processes ID
 * names (the initials.)" -- true for every row EXCEPT the very
 * first, whose own initials differ from the row directly above it
 * (both normalized the same way `sortRowsByInitials` already groups
 * by), so a visibly different border can mark where one ID-initials
 * group ends and the next begins (see `.process-library-row-group-
 * start` in conversation.css). Rows are expected to already be
 * grouped by initials (the mount-time resort effect below, and the
 * on-blur resort in handleProcessLibraryBlur, both guarantee this)
 * -- this only ever needs to compare each row to its immediate
 * predecessor, never search for the group's actual start.
 */
export function isNewInitialsGroup<T extends { id?: string }>(rows: T[], index: number, fallbackInitials: string): boolean {

    if (index === 0) {
        return false;
    }

    return rowInitials(rows[index].id, fallbackInitials) !== rowInitials(rows[index - 1].id, fallbackInitials);

}

/**
 * True when `rows` is already in the "grouped alphabetically by
 * initials" order `sortRowsByInitials` would produce -- lets the
 * mount-time effect below skip its own `onChange` call (and the
 * extra render that would cause) on the very common case where
 * nothing would actually move.
 */
export function isAlreadySortedByInitials<T extends { id?: string }>(rows: T[], fallbackInitials: string): boolean {

    const sorted = sortRowsByInitials(rows, fallbackInitials);

    return rows.every((row, index) => row === sorted[index]);

}

/** True once a Process/SOP's How Often has an actual picked date/weekday attached (see ProcessScheduleValue). */
function hasScheduleValue(schedule: ProcessScheduleValue | undefined): boolean {
    return Boolean(schedule && schedule.anchorDate.trim().length > 0);
}

/** True when a Step has never actually been filled in -- exactly what `createBlankProcessStep` produces. */
export function isBlankStep(step: ProcessStepValue): boolean {
    return step.action.trim().length === 0 && !step.done;
}

/**
 * True when a SOP -- and every Step inside it -- is still exactly
 * what `createBlankProcessSop` produces, i.e. the user added it
 * (via "+ Add SOP") but never actually typed or picked anything
 * into it. Used by the "leaving a row" cleanup below to quietly
 * drop rows nobody ever filled in, so a Process Library never
 * accumulates empty clutter.
 */
export function isBlankSop(sop: ProcessSopValue): boolean {

    return (sop.id ?? "").trim().length === 0
        && sop.name.trim().length === 0
        && sop.purpose.trim().length === 0
        && sop.who.trim().length === 0
        && sop.howOften.trim().length === 0
        && !hasScheduleValue(sop.schedule)
        && (Array.isArray(sop.steps) ? sop.steps : []).every(isBlankStep);

}

/** Same idea as `isBlankSop` above, one level up: a Process nobody has touched since "+ Add Process". */
export function isBlankProcess(process: ProcessRecordValue): boolean {

    return (process.id ?? "").trim().length === 0
        && process.name.trim().length === 0
        && process.purpose.trim().length === 0
        && process.who.trim().length === 0
        && process.howOften.trim().length === 0
        && process.status.trim().length === 0
        && !hasScheduleValue(process.schedule)
        && (Array.isArray(process.sops) ? process.sops : []).every(isBlankSop);

}
