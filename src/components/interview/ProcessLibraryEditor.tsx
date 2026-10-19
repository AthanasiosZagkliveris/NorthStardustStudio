import { Fragment, FocusEvent, MouseEvent, useCallback, useEffect, useMemo, useState } from "react";

import TextField from "../TextField.tsx";
import {
    ProcessLibraryAnswerValue,
    ProcessRecordValue,
    ProcessScheduleValue,
    ProcessSopValue,
    ProcessStepValue,
    createBlankProcess,
    createBlankProcessSop,
    createBlankProcessStep,
    processDisplaySequence,
    sanitizeIdInitials,
    sopDisplaySequence
} from "../../framework/engine/AnswerUtils.ts";
import DateCellInput from "./DateCellInput.tsx";
import { toggledIn } from "./toggledIn.ts";

// Shared, page-unique ids: each of these <datalist>s is rendered
// ONCE for the whole table (its own suggestion set is the same
// regardless of which row's field is focused), rather than one per
// row -- there's only ever one Process Library editor mounted at a
// time, so a fixed id is safe.
const OWNER_SUGGESTIONS_DATALIST_ID = "process-library-owner-suggestions";

interface ProcessLibraryEditorProps {

    value: ProcessLibraryAnswerValue;

    onChange: (value: ProcessLibraryAnswerValue) => void;

    disabled?: boolean;

    /**
     * Existing "Responsible Person or Team" names already entered in
     * this same Organization's Roles & Responsibilities Section (see
     * Conversation.tsx's operationsRoleSuggestions) -- offered as
     * autofill suggestions on the Owner field, the same "suggest
     * what's already been typed elsewhere" convention DynamicTable's
     * own "autofill" column type uses. A Process can still have any
     * Owner text typed freely; this only suggests, never restricts,
     * since Process Library (Section 2) is filled out BEFORE Roles &
     * Responsibilities (Section 4) exists yet on a fresh Organization.
     */
    ownerSuggestions?: string[];

}

const PROCESS_STATUS_OPTIONS = ["Active", "Draft", "Retired"];

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
const DEFAULT_NAME_COLUMN_WIDTH = 122;
const DEFAULT_PURPOSE_COLUMN_WIDTH = 122;
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
const STATUS_COLUMN_WIDTH = Math.max(130, headerMinWidth("Status"));
const ACTIONS_COLUMN_WIDTH = 90;
// The floor a dragged Name/Purpose column can never go below --
// shared by "Process Name"/"SOP Name" (Name column, both tables)
// and "Purpose" (both tables), so it has to fit the longest of all
// three headings even though that means Purpose's own floor ends up
// a little more generous than its own heading strictly needs.
const MIN_RESIZABLE_COLUMN_WIDTH = Math.max(90, headerMinWidth("Process Name"), headerMinWidth("SOP Name"), headerMinWidth("Purpose"));
const MAX_RESIZABLE_COLUMN_WIDTH = 360;

function clampResizableColumnWidth(width: number): number {
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
function computeProcessLibraryTableWidth(nameColumnWidth: number, purposeColumnWidth: number, ownerColumnWidth: number): number {

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
const SOPS_STEPS_COLUMN_WIDTH = Math.max(60, headerMinWidth("Steps"));
const SOPS_SPACER_COLUMN_WIDTH = STATUS_COLUMN_WIDTH - SOPS_STEPS_COLUMN_WIDTH;

/**
 * A thin, draggable strip pinned to a resizable column header's
 * right edge (`.process-library-col-resizable` gives the header
 * `position:relative` so this can be `position:absolute` within
 * it) -- dragging it left/right calls `onResize` with how far the
 * pointer moved since the last event, letting the caller grow or
 * shrink its own width state by that amount. Tracks the drag via
 * plain `document`-level listeners (not React state) so dragging
 * stays smooth even when the pointer briefly leaves the handle's own
 * few-pixel hit area mid-drag.
 */
function ColumnResizeHandle({

    onResize,

    label

}: {

    onResize: (deltaX: number) => void;

    label: string;

}) {

    function handleMouseDown(event: MouseEvent<HTMLDivElement>) {

        event.preventDefault();

        let lastClientX = event.clientX;

        function handleMouseMove(moveEvent: globalThis.MouseEvent) {

            const deltaX = moveEvent.clientX - lastClientX;
            lastClientX = moveEvent.clientX;

            onResize(deltaX);

        }

        function handleMouseUp() {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        }

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

    }

    return (

        <div
            className="process-library-col-resize-handle"
            onMouseDown={handleMouseDown}
            role="separator"
            aria-orientation="vertical"
            aria-label={`Resize ${label} column`}
        />

    );

}

// The How Often column's preset choices -- "Custom" (formerly
// "Other") is just a regular preset value now, same as any other
// entry here; picking it no longer reveals a free-text field, only
// its own date picker (see DATE_PICKER_FREQUENCIES below).
const FREQUENCY_PRESET_OPTIONS = [
    "Daily",
    "Weekly",
    "Bi-Weekly",
    "Monthly",
    "Quarterly",
    "Semi-Annually",
    "Annually",
    "As Needed",
    "Custom"
];

// Frequencies whose follow-up control is a weekday picker rather
// than a date picker -- "which day of the week this recurs on" is
// all Weekly/Bi-Weekly ever need; the specific starting date is
// computed automatically (see nextIsoForWeekday below), never typed.
const WEEKDAY_FREQUENCIES = ["Weekly", "Bi-Weekly"];

// Frequencies whose follow-up control is a specific-date picker --
// every occurrence then steps forward from that date at the
// matching cadence (see CalendarTaskService's own
// expandScheduleOccurrences, which is what actually turns this
// into dots on the Organization Calendar). "Custom" belongs here
// too -- it has no defined interval to repeat by, so its one picked
// date just shows once.
const DATE_PICKER_FREQUENCIES = ["Monthly", "Quarterly", "Semi-Annually", "Annually", "Custom"];

// Monday-first, matching the order requested for the picker --
// `value` is JS's own Date.getDay() convention (0 = Sunday) so it
// plugs straight into isoWeekday/nextIsoForWeekday below with no
// translation.
const WEEKDAY_OPTIONS = [
    { label: "Monday", value: 1 },
    { label: "Tuesday", value: 2 },
    { label: "Wednesday", value: 3 },
    { label: "Thursday", value: 4 },
    { label: "Friday", value: 5 },
    { label: "Saturday", value: 6 },
    { label: "Sunday", value: 0 }
];

/** 0 (Sunday) - 6 (Saturday) for a given ISO date, or null if it isn't a complete date yet. */
function isoWeekday(iso: string): number | null {

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());

    if (!match) {
        return null;
    }

    const [, year, month, day] = match;

    return new Date(Number(year), Number(month) - 1, Number(day)).getDay();

}

/** The nearest date on/after today that falls on the given weekday -- today itself counts. */
function nextIsoForWeekday(weekday: number): string {

    const now = new Date();
    const delta = (weekday - now.getDay() + 7) % 7;
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + delta);

    return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}-${String(target.getDate()).padStart(2, "0")}`;

}

/**
 * The How Often cell shared by both the Process table and the
 * SOPs table -- the preset dropdown, plus whichever follow-up
 * control (if any) that preset needs: a weekday picker for Weekly/
 * Bi-Weekly, a date picker for Monthly/Quarterly/Semi-Annually/
 * Annually/Custom, or nothing at all for Daily/As Needed (Daily
 * recurs every day with nothing to pick; As Needed is explicitly
 * irregular). "Custom" is just its own plain preset value -- no
 * free-text field alongside it anymore, only its date picker.
 *
 * Mounted with `key={ownerKey}` (the Process's or SOP's own stable
 * `key`) by both callers, same as before -- there's no more local
 * "showing custom-text mode" state to reset on row identity change,
 * since "Custom" is just a plain preset value now (see the module
 * comment above FREQUENCY_PRESET_OPTIONS).
 */
function FrequencyCell({

    howOften,

    schedule,

    disabled,

    onChange

}: {

    howOften: string;

    schedule?: ProcessScheduleValue;

    disabled: boolean;

    /**
     * A SINGLE combined patch per change -- deliberately not two
     * separate "change How Often" / "change schedule" callbacks.
     * Both the frequency <select> and the weekday/date picker
     * sometimes need to update How Often AND the schedule together
     * in the same interaction (e.g. picking "Daily" both sets
     * `howOften` and clears any leftover `schedule`); two separate
     * calls to the caller's own updateProcess/updateSop in the same
     * synchronous handler would each compute their patch against
     * the SAME stale `process`/`sop` closure, so the second call
     * would silently overwrite the first's change instead of
     * combining with it.
     */
    onChange: (patch: { howOften: string; schedule?: ProcessScheduleValue }) => void;

}) {

    const needsWeekdayPicker = WEEKDAY_FREQUENCIES.includes(howOften);
    const needsDatePicker = DATE_PICKER_FREQUENCIES.includes(howOften);

    return (

        <td className="process-library-col-frequency">

            <select
                className="interview-input"
                aria-label="How often"
                value={howOften}
                disabled={disabled}
                onChange={(event) => {

                    const next = event.target.value;

                    const keepsSchedule = WEEKDAY_FREQUENCIES.includes(next) || DATE_PICKER_FREQUENCIES.includes(next);

                    onChange({ howOften: next, schedule: keepsSchedule ? schedule : undefined });

                }}
            >
                <option value="" disabled>Select</option>
                {FREQUENCY_PRESET_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>

            {needsWeekdayPicker && (
                <select
                    className="interview-input process-library-frequency-schedule-field"
                    aria-label="Day of week"
                    value={schedule?.anchorDate ? String(isoWeekday(schedule.anchorDate) ?? "") : ""}
                    disabled={disabled}
                    onChange={(event) => {
                        onChange({ howOften, schedule: { anchorDate: nextIsoForWeekday(Number(event.target.value)) } });
                    }}
                >
                    <option value="" disabled>Select</option>
                    {WEEKDAY_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            )}

            {needsDatePicker && (
                <div className="process-library-frequency-schedule-field">
                    <DateCellInput
                        value={schedule?.anchorDate ?? ""}
                        disabled={disabled}
                        onChange={(iso) => onChange({ howOften, schedule: iso.trim().length > 0 ? { anchorDate: iso } : undefined })}
                    />
                </div>
            )}

        </td>

    );

}

/**
 * The move-up/move-down/remove/add button cluster every other
 * row-based editor in this app already uses (DynamicTable's own
 * Table rows, and the matching copy Checklist/Card List/Profile
 * Cards render) -- reused here verbatim (same class names, same
 * layout, same "add inserts right after THIS row" and "remove on
 * the last remaining row clears it instead of deleting" behavior)
 * rather than Process/SOP/Step rows having their own bespoke,
 * remove-only control.
 */
function RowActions({

    disabled,

    canMoveUp,

    canMoveDown,

    onMoveUp,

    onMoveDown,

    onRemove,

    onAdd,

    isOnlyRow,

    itemLabel

}: {

    disabled: boolean;

    canMoveUp: boolean;

    canMoveDown: boolean;

    onMoveUp: () => void;

    onMoveDown: () => void;

    onRemove: () => void;

    onAdd: () => void;

    isOnlyRow: boolean;

    itemLabel: string;

}) {

    return (

        <div className="dynamic-table-row-actions">

            <div className="dynamic-table-row-move">

                <button
                    type="button"
                    disabled={disabled || !canMoveUp}
                    className="dynamic-table-row-move-up"
                    aria-label={`Move ${itemLabel} up`}
                    title={`Move ${itemLabel} up`}
                    onClick={onMoveUp}
                >
                    ▲
                </button>

                <button
                    type="button"
                    disabled={disabled || !canMoveDown}
                    className="dynamic-table-row-move-down"
                    aria-label={`Move ${itemLabel} down`}
                    title={`Move ${itemLabel} down`}
                    onClick={onMoveDown}
                >
                    ▼
                </button>

            </div>

            <div className="dynamic-table-row-delete-add">

                <button
                    type="button"
                    disabled={disabled}
                    className="dynamic-table-row-remove"
                    aria-label={isOnlyRow ? `Clear ${itemLabel}` : `Remove ${itemLabel}`}
                    title={isOnlyRow ? `Clear ${itemLabel}` : `Remove ${itemLabel}`}
                    onClick={onRemove}
                >
                    −
                </button>

                <button
                    type="button"
                    disabled={disabled}
                    className="dynamic-table-row-add"
                    aria-label={`Add ${itemLabel}`}
                    title={`Add ${itemLabel}`}
                    onClick={onAdd}
                >
                    +
                </button>

            </div>

        </div>

    );

}

/**
 * Steps table -- shared by both the "0/1 SOP" collapsed case
 * (rendered directly on the Process card) and every SOP's own
 * expanded card once a Process has 2+ SOPs (see
 * ProcessLibraryEditor's own comment on the collapse rule
 * below). A Step always shows at least one row, the same "never
 * fully empty" convention every Table in this app already
 * follows.
 *
 * No "Done" checkbox here -- a Step isn't something to tick off
 * live inside the app, it's a reference instruction. Ticking it
 * off is exactly what the EXPORTED version is for instead (see
 * AnswerUtils.buildAnswerBlocks, which renders Steps as a real
 * checklist -- an actual tickable checkbox once printed or
 * opened in a markdown reader).
 */
function StepsTable({
    steps,
    disabled,
    onChange
}: {
    steps: ProcessStepValue[];
    disabled: boolean;
    onChange: (steps: ProcessStepValue[]) => void;
}) {

    // Defensive: every caller is expected to pass a real array, but
    // this component is reached from more than one place in the
    // tree (collapsed Process card, each expanded SOP row) -- guard
    // here too so a gap anywhere upstream degrades to "shows one
    // blank step" instead of crashing.
    const safeSteps = Array.isArray(steps) && steps.length > 0 ? steps : [createBlankProcessStep()];

    function updateStep(index: number, patch: Partial<ProcessStepValue>) {

        onChange(safeSteps.map((step, candidateIndex) =>
            candidateIndex === index ? { ...step, ...patch } : step
        ));

    }

    function addStep(afterIndex?: number) {

        const newStep = createBlankProcessStep();

        if (afterIndex === undefined) {
            onChange([...safeSteps, newStep]);
            return;
        }

        const next = [...safeSteps];
        next.splice(afterIndex + 1, 0, newStep);
        onChange(next);

    }

    function removeStep(index: number) {

        // At the floor of 1 remaining Step, "remove" clears that
        // Step back to blank instead of doing nothing -- matches
        // DynamicTable's own "clear instead of disable the last
        // row" convention.
        if (safeSteps.length <= 1) {

            onChange(safeSteps.map((step, candidateIndex) =>
                candidateIndex === index ? createBlankProcessStep() : step
            ));

            return;

        }

        onChange(safeSteps.filter((_, candidateIndex) => candidateIndex !== index));

    }

    function moveStep(index: number, direction: -1 | 1) {

        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= safeSteps.length) {
            return;
        }

        const next = [...safeSteps];
        const [moved] = next.splice(index, 1);
        next.splice(targetIndex, 0, moved);
        onChange(next);

    }

    return (

        <div className="process-library-steps">

            <table className="process-library-steps-table">
                <thead>
                    <tr>
                        <th className="process-library-col-step-number">Steps</th>
                        <th>Actions</th>
                        <th className="process-library-col-actions" />
                    </tr>
                </thead>
                <tbody>
                    {safeSteps.map((step, index) => (
                        <tr key={index} data-step-row={index}>
                            <td className="process-library-col-step-number">{index + 1}</td>
                            <td>
                                <TextField list={false} className="interview-input process-library-autogrow-field"
                                    ariaLabel="Step action"
                                            placeholder="What happens in this step"
                                    value={step.action}
                                    disabled={disabled}
                                    onChange={(next) => updateStep(index, { action: next })}
                                />
                            </td>
                            <td className="process-library-col-actions">
                                <RowActions
                                    disabled={disabled}
                                    canMoveUp={index > 0}
                                    canMoveDown={index < safeSteps.length - 1}
                                    onMoveUp={() => moveStep(index, -1)}
                                    onMoveDown={() => moveStep(index, 1)}
                                    onRemove={() => removeStep(index)}
                                    onAdd={() => addStep(index)}
                                    isOnlyRow={safeSteps.length <= 1}
                                    itemLabel="step"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>

    );

}

/**
 * SOPs table -- only ever rendered once a Process has 2+ SOPs
 * (see the collapse rule on ProcessLibraryEditor below). Each
 * row's own ID/Name/Purpose are edited directly in the row, the
 * same inline-editable convention every Table in this app
 * already uses; expanding a row (via its chevron) reveals that
 * SOP's own Steps table underneath it.
 */
function SopsTable({
    sops,
    disabled,
    initiallyExpandSteps,
    nameColumnWidth,
    purposeColumnWidth,
    ownerColumnWidth,
    onResizeName,
    onResizePurpose,
    onChange
}: {
    sops: ProcessSopValue[];
    disabled: boolean;
    initiallyExpandSteps: boolean;
    nameColumnWidth: number;
    purposeColumnWidth: number;
    ownerColumnWidth: number;
    onResizeName: (deltaX: number) => void;
    onResizePurpose: (deltaX: number) => void;
    onChange: (sops: ProcessSopValue[]) => void;
}) {

    // Every SOP row starts COLLAPSED (its own Steps hidden) unless
    // the Process row above was opened with Shift+Click -- see
    // ProcessLibraryEditor's own toggleExpanded. This component
    // remounts fresh (a new `useState` call) every time the
    // Process row's expansion panel is opened, since it's only
    // ever rendered while that panel is mounted at all -- so this
    // initializer re-reads `initiallyExpandSteps` fresh each time,
    // without needing an effect to react to it changing later.
    const [expanded, setExpanded] = useState<Set<number>>(
        () => new Set(initiallyExpandSteps ? sops.map((_, index) => index) : [])
    );

    function toggleExpanded(index: number) {

        setExpanded(previous => toggledIn(previous, index));

    }

    function updateSop(index: number, patch: Partial<ProcessSopValue>) {

        onChange(sops.map((sop, candidateIndex) =>
            candidateIndex === index ? { ...sop, ...patch } : sop
        ));

    }

    function addSop(afterIndex?: number) {

        const newSop = createBlankProcessSop();

        if (afterIndex === undefined) {

            const newIndex = sops.length;
            onChange([...sops, newSop]);
            setExpanded(previous => new Set(previous).add(newIndex));
            return;

        }

        const next = [...sops];
        next.splice(afterIndex + 1, 0, newSop);
        onChange(next);

        setExpanded(previous => {

            // Every SOP at/after the insertion point shifted up by
            // one index -- shift their recorded expand state to
            // match, then mark the newly-inserted SOP expanded.
            const shifted = new Set<number>();

            previous.forEach(existingIndex => {
                shifted.add(existingIndex > afterIndex ? existingIndex + 1 : existingIndex);
            });

            shifted.add(afterIndex + 1);

            return shifted;

        });

    }

    function removeSop(index: number) {

        // A Process always holds at least one SOP (see
        // createBlankProcess/the collapse rule) -- once this
        // brings the count down to 1, the caller (ProcessCard)
        // stops rendering this table at all and shows that
        // remaining SOP's Steps directly instead, which is what
        // actually enforces the floor; this table itself never
        // needs to refuse going below 2.
        if (sops.length <= 1) {
            return;
        }

        onChange(sops.filter((_, candidateIndex) => candidateIndex !== index));

        // `expanded` is keyed by array index (see addSop's own
        // insertion-shift above) -- removing a SOP shifts every
        // later SOP's index down by one, so its recorded expand
        // state has to shift the same way, or the SOP that inherits
        // a lower index ends up rendered expanded/collapsed based on
        // a DIFFERENT SOP's leftover state (e.g. expand SOP #2, then
        // delete SOP #1 -- SOP #2, now at index 0, collapses, while
        // whatever SOP is now at index 1 renders expanded even
        // though it was never opened).
        setExpanded(previous => {

            const next = new Set<number>();

            previous.forEach(existingIndex => {

                if (existingIndex === index) {
                    return;
                }

                next.add(existingIndex > index ? existingIndex - 1 : existingIndex);

            });

            return next;

        });

    }

    function moveSop(index: number, direction: -1 | 1) {

        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= sops.length) {
            return;
        }

        const next = [...sops];
        const [moved] = next.splice(index, 1);
        next.splice(targetIndex, 0, moved);
        onChange(next);

        // The SOP at `index` and the one at `targetIndex` just
        // swapped places -- swap their recorded expand state too, so
        // each SOP's own "expanded" flag keeps following that SAME
        // SOP instead of staying pinned to whichever row position it
        // used to occupy.
        setExpanded(previous => {

            const hadIndex = previous.has(index);
            const hadTarget = previous.has(targetIndex);

            if (hadIndex === hadTarget) {
                return previous;
            }

            const swapped = new Set(previous);

            if (hadIndex) {
                swapped.delete(index);
                swapped.add(targetIndex);
            } else {
                swapped.delete(targetIndex);
                swapped.add(index);
            }

            return swapped;

        });

    }

    return (

        <div className="process-library-sops">

            <table
                className="process-library-sops-table"
                style={{ width: computeProcessLibraryTableWidth(nameColumnWidth, purposeColumnWidth, ownerColumnWidth) }}
            >
                <thead>
                    <tr>
                        <th className="process-library-col-number">#</th>
                        <th className="process-library-col-id">SOP ID</th>
                        <th className="process-library-col-name process-library-col-resizable" style={{ width: nameColumnWidth }}>
                            SOP Name
                            <ColumnResizeHandle onResize={onResizeName} label="SOP Name" />
                        </th>
                        <th className="process-library-col-purpose process-library-col-resizable" style={{ width: purposeColumnWidth }}>
                            Purpose
                            <ColumnResizeHandle onResize={onResizePurpose} label="Purpose" />
                        </th>
                        <th className="process-library-col-owner" style={{ width: ownerColumnWidth }}>SOP Owner</th>
                        <th className="process-library-col-frequency">Frequency</th>
                        <th className="process-library-col-steps" style={{ width: SOPS_STEPS_COLUMN_WIDTH }}>Steps</th>
                        {/* Blank spacer -- makes up the width difference
                            between this table's Steps column and the
                            Process table's own Status column, so the two
                            tables land at the exact same total width and
                            their Actions columns stay lined up. See
                            SOPS_SPACER_COLUMN_WIDTH's own comment above. */}
                        <th className="process-library-col-spacer" style={{ width: SOPS_SPACER_COLUMN_WIDTH }} />
                        <th className="process-library-col-actions" />
                    </tr>
                </thead>
                <tbody>
                    {sops.map((sop, index) => {

                        const sopIdSuffix = `-${sopDisplaySequence(sops, index)}`;
                        const rowClassName = isNewInitialsGroup(sops, index, "SOP")
                            ? "process-library-row process-library-row-group-start"
                            : "process-library-row";

                        return (
                        <Fragment key={index}>
                            <tr className={rowClassName} data-sop-row={index}>
                                <td className="process-library-col-number">
                                    <button
                                        type="button"
                                        className="process-library-expand-toggle"
                                        onClick={() => toggleExpanded(index)}
                                        aria-label={expanded.has(index) ? "Collapse SOP" : "Expand SOP"}
                                        title={expanded.has(index) ? "Collapse" : "Expand"}
                                    >
                                        {expanded.has(index) ? "▾" : "▸"} {index + 1}
                                    </button>
                                </td>
                                <td className="process-library-col-id">
                                    <div className="process-library-id-field-inline">
                                        <input
                                            type="text"
                                            className="interview-input process-library-id-field"
                                            placeholder="SOP"
                                            value={sop.id ?? ""}
                                            disabled={disabled}
                                            onChange={(event) => updateSop(index, { id: sanitizeIdInitials(event.target.value) })}
                                        />
                                        {/* Same inline, single-line auto-generated number as the
                                            Process ID field above -- see the comment there. */}
                                        <span className="process-library-id-number">{sopIdSuffix}</span>
                                    </div>
                                </td>
                                <td className="process-library-col-name">
                                    <TextField list={false} className="interview-input process-library-autogrow-field"
                                        placeholder="SOP Name"
                                        value={sop.name}
                                        disabled={disabled}
                                        onChange={(next) => updateSop(index, { name: next })}
                                    />
                                </td>
                                <td className="process-library-col-purpose">
                                    <TextField list={false} className="interview-input process-library-autogrow-field"
                                        placeholder="What this SOP is for"
                                        value={sop.purpose}
                                        disabled={disabled}
                                        onChange={(next) => updateSop(index, { purpose: next })}
                                    />
                                </td>
                                <td className="process-library-col-owner">
                                    <input
                                        type="text"
                                        className="interview-input"
                                        list={OWNER_SUGGESTIONS_DATALIST_ID}
                                        aria-label="Owner"
                                            placeholder="Who owns this"
                                        value={sop.who}
                                        disabled={disabled}
                                        onChange={(event) => updateSop(index, { who: event.target.value })}
                                    />
                                </td>
                                <FrequencyCell
                                    key={sop.key}
                                    howOften={sop.howOften}
                                    schedule={sop.schedule}
                                    disabled={disabled}
                                    onChange={(patch) => updateSop(index, patch)}
                                />
                                <td className="process-library-col-steps">
                                    {(Array.isArray(sop.steps) ? sop.steps : []).filter(step => step.action.trim().length > 0).length}
                                </td>
                                <td className="process-library-col-spacer" />
                                <td className="process-library-col-actions">
                                    <RowActions
                                        disabled={disabled}
                                        canMoveUp={index > 0}
                                        canMoveDown={index < sops.length - 1}
                                        onMoveUp={() => moveSop(index, -1)}
                                        onMoveDown={() => moveSop(index, 1)}
                                        onRemove={() => removeSop(index)}
                                        onAdd={() => addSop(index)}
                                        isOnlyRow={sops.length <= 1}
                                        itemLabel="SOP"
                                    />
                                </td>
                            </tr>

                            {expanded.has(index) && (
                                <tr className="process-library-expansion-row" data-sop-row={index}>
                                    <td colSpan={9}>
                                        <StepsTable
                                            steps={Array.isArray(sop.steps) ? sop.steps : []}
                                            disabled={disabled}
                                            onChange={(steps) => updateSop(index, { steps })}
                                        />
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                        );

                    })}
                </tbody>
            </table>

        </div>

    );

}

/**
 * A single Process's expanded card -- everything below its own
 * table row. Implements the collapse rule: 0 or 1 SOP shows that
 * SOP's Steps directly, with no SOP-level Name/Purpose fields or
 * SOPs table visible at all; the SOPs table (and each SOP's own
 * Name/Purpose) only appears once a second SOP exists. The
 * underlying data always holds the full three levels -- a
 * Process always has `sops: [at least one]`, and that one SOP's
 * `steps` are exactly what render directly when collapsed -- only
 * what's RENDERED changes, never the shape of what's stored.
 */
function ProcessCard({
    process,
    disabled,
    initiallyExpandSteps,
    nameColumnWidth,
    purposeColumnWidth,
    ownerColumnWidth,
    onResizeName,
    onResizePurpose,
    onChange
}: {
    process: ProcessRecordValue;
    disabled: boolean;
    initiallyExpandSteps: boolean;
    nameColumnWidth: number;
    purposeColumnWidth: number;
    ownerColumnWidth: number;
    onResizeName: (deltaX: number) => void;
    onResizePurpose: (deltaX: number) => void;
    onChange: (process: ProcessRecordValue) => void;
}) {

    // Defensive: `process` is only guaranteed this shape once it
    // has actually round-tripped through this editor. A session
    // saved before this feature existed (see StorageService's own
    // Operations System migration, which normally rewrites this
    // data on load) could in principle still reach here with
    // `sops` missing entirely -- guarding here too means a gap in
    // that migration degrades to "starts blank", never a crash.
    const rawSops = Array.isArray(process.sops) ? process.sops : [];
    const sops = rawSops.length > 0 ? rawSops : [createBlankProcessSop()];

    if (sops.length <= 1) {

        const sop = sops[0];
        const steps = Array.isArray(sop.steps) && sop.steps.length > 0 ? sop.steps : [createBlankProcessStep()];

        return (

            <div className="process-library-card">

                <StepsTable
                    steps={steps}
                    disabled={disabled}
                    onChange={(nextSteps) => onChange({ ...process, sops: [{ ...sop, steps: nextSteps }] })}
                />

                <button
                    type="button"
                    className="process-library-add-link process-library-add-sop-link"
                    onClick={() => onChange({ ...process, sops: [...sops, createBlankProcessSop()] })}
                    disabled={disabled}
                >
                    + Add SOP (this process has more than one procedure)
                </button>

            </div>

        );

    }

    return (

        <div className="process-library-card">

            <SopsTable
                sops={sops}
                disabled={disabled}
                initiallyExpandSteps={initiallyExpandSteps}
                nameColumnWidth={nameColumnWidth}
                purposeColumnWidth={purposeColumnWidth}
                ownerColumnWidth={ownerColumnWidth}
                onResizeName={onResizeName}
                onResizePurpose={onResizePurpose}
                onChange={(nextSops) => onChange({ ...process, sops: nextSops })}
            />

        </div>

    );

}

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
function computeOwnerColumnWidth(processes: ProcessRecordValue[]): number {

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

function sortRowsByInitials<T extends { id?: string }>(rows: T[], fallbackInitials: string): T[] {

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
function isNewInitialsGroup<T extends { id?: string }>(rows: T[], index: number, fallbackInitials: string): boolean {

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
function isAlreadySortedByInitials<T extends { id?: string }>(rows: T[], fallbackInitials: string): boolean {

    const sorted = sortRowsByInitials(rows, fallbackInitials);

    return rows.every((row, index) => row === sorted[index]);

}

/** True once a Process/SOP's How Often has an actual picked date/weekday attached (see ProcessScheduleValue). */
function hasScheduleValue(schedule: ProcessScheduleValue | undefined): boolean {
    return Boolean(schedule && schedule.anchorDate.trim().length > 0);
}

/** True when a Step has never actually been filled in -- exactly what `createBlankProcessStep` produces. */
function isBlankStep(step: ProcessStepValue): boolean {
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
function isBlankSop(sop: ProcessSopValue): boolean {

    return (sop.id ?? "").trim().length === 0
        && sop.name.trim().length === 0
        && sop.purpose.trim().length === 0
        && sop.who.trim().length === 0
        && sop.howOften.trim().length === 0
        && !hasScheduleValue(sop.schedule)
        && (Array.isArray(sop.steps) ? sop.steps : []).every(isBlankStep);

}

/** Same idea as `isBlankSop` above, one level up: a Process nobody has touched since "+ Add Process". */
function isBlankProcess(process: ProcessRecordValue): boolean {

    return (process.id ?? "").trim().length === 0
        && process.name.trim().length === 0
        && process.purpose.trim().length === 0
        && process.who.trim().length === 0
        && process.howOften.trim().length === 0
        && process.status.trim().length === 0
        && !hasScheduleValue(process.schedule)
        && (Array.isArray(process.sops) ? process.sops : []).every(isBlankSop);

}

export default function ProcessLibraryEditor({
    value,
    onChange,
    disabled = false,
    ownerSuggestions = []
}: ProcessLibraryEditorProps) {

    // A Process Library always shows at least one Process --
    // matches every other Table/collection editor's "never fully
    // empty" convention (see DynamicTable's own identical guard).
    useEffect(() => {

        if (value.length === 0) {
            onChange([createBlankProcess()]);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value.length]);

    const processes = value.length > 0 ? value : [createBlankProcess()];

    // Name/Purpose: the user drags these wider or narrower by hand
    // (see ColumnResizeHandle) -- one shared width per column across
    // BOTH the Process table and every Process's own SOPs table, so
    // dragging either table's handle keeps them aligned rather than
    // letting the two tables' Name columns drift to different widths.
    const [nameColumnWidth, setNameColumnWidth] = useState(DEFAULT_NAME_COLUMN_WIDTH);
    const [purposeColumnWidth, setPurposeColumnWidth] = useState(DEFAULT_PURPOSE_COLUMN_WIDTH);

    const handleResizeName = useCallback((deltaX: number) => {
        setNameColumnWidth(previous => clampResizableColumnWidth(previous + deltaX));
    }, []);

    const handleResizePurpose = useCallback((deltaX: number) => {
        setPurposeColumnWidth(previous => clampResizableColumnWidth(previous + deltaX));
    }, []);

    // Owner: NOT manually resized -- automatically sized to fit
    // whatever's currently typed into any Owner field, Process-level
    // or SOP-level, across the whole Process Library (see
    // computeOwnerColumnWidth above). Recomputed only when an Owner
    // value actually changes (not on every unrelated keystroke
    // elsewhere in the table) by keying the memo off a cheap string
    // built from just those values.
    const ownerTextsKey = processes
        .map(process => `${process.who}|${(Array.isArray(process.sops) ? process.sops : []).map(sop => sop.who).join("|")}`)
        .join("||");

    const ownerColumnWidth = useMemo(
        () => computeOwnerColumnWidth(processes),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ownerTextsKey]
    );

    // "When the user revisits the same page, the order should be
    // shaped alphabetically, and with number hierarchy" -- regroup
    // every Process (and every Process's own SOPs) by initials once,
    // the moment this editor mounts, i.e. whenever the person
    // actually revisits this Section. Deliberately mount-only (empty
    // dependency array) rather than re-running on every edit --
    // reordering rows out from under someone mid-keystroke every
    // time they change an ID would be disorienting, so a freshly
    // typed ID only settles into its alphabetical slot the NEXT time
    // this page is opened. `isAlreadySortedByInitials` makes the
    // very common "nothing to do" case a no-op, so opening an
    // already-tidy Process Library doesn't cause an extra render.
    useEffect(() => {

        const needsProcessResort = !isAlreadySortedByInitials(processes, "PRC");
        const needsSopResort = processes.some(process => !isAlreadySortedByInitials(process.sops, "SOP"));

        if (!needsProcessResort && !needsSopResort) {
            return;
        }

        onChange(sortRowsByInitials(processes, "PRC").map(process => ({
            ...process,
            sops: sortRowsByInitials(process.sops, "SOP")
        })));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [expanded, setExpanded] = useState<Set<number>>(() => new Set([0]));

    // Which currently-expanded Processes were opened with Shift
    // held -- read by ProcessCard/SopsTable to decide whether the
    // SOPs table (once a Process has 2+ SOPs) should also start
    // with every SOP's own Steps pre-expanded. A plain click only
    // ever reveals the SOPs themselves; Shift+Click reveals the
    // SOPs AND their Steps in one action.
    const [expandWithSteps, setExpandWithSteps] = useState<Set<number>>(() => new Set());

    function toggleExpanded(index: number, withShift: boolean) {

        const isCurrentlyExpanded = expanded.has(index);

        setExpanded(previous => toggledIn(previous, index));

        // Only worth recording when OPENING (a collapse doesn't
        // need a "how was it opened" flag) -- and re-evaluated
        // fresh every time it opens, so opening once with Shift
        // doesn't "stick" for every future open.
        if (!isCurrentlyExpanded) {

            setExpandWithSteps(previous => {

                const next = new Set(previous);

                if (withShift) {
                    next.add(index);
                } else {
                    next.delete(index);
                }

                return next;

            });

        }

    }

    function updateProcess(index: number, patch: Partial<ProcessRecordValue>) {

        onChange(processes.map((process, candidateIndex) =>
            candidateIndex === index ? { ...process, ...patch } : process
        ));

    }

    function addProcess(afterIndex?: number) {

        const newProcess = createBlankProcess();

        if (afterIndex === undefined) {

            const newIndex = processes.length;
            onChange([...processes, newProcess]);
            setExpanded(previous => new Set(previous).add(newIndex));
            return;

        }

        const next = [...processes];
        next.splice(afterIndex + 1, 0, newProcess);
        onChange(next);

        setExpanded(previous => {

            const shifted = new Set<number>();

            previous.forEach(existingIndex => {
                shifted.add(existingIndex > afterIndex ? existingIndex + 1 : existingIndex);
            });

            shifted.add(afterIndex + 1);

            return shifted;

        });

        // `expandWithSteps` is keyed by the SAME Process index as
        // `expanded` above -- it needs the SAME insertion-shift, or
        // a Process that was previously opened with Shift+Click
        // could end up describing a completely different Process
        // after this insert (this shift was previously missing here
        // even though `expanded` itself already got it).
        setExpandWithSteps(previous => {

            const shifted = new Set<number>();

            previous.forEach(existingIndex => {
                shifted.add(existingIndex > afterIndex ? existingIndex + 1 : existingIndex);
            });

            return shifted;

        });

    }

    function removeProcess(index: number) {

        // At the floor of 1 remaining Process, "remove" clears that
        // Process back to blank (a fresh, single blank SOP/Step)
        // instead of doing nothing -- same "clear instead of
        // disable" convention as Steps above, so the control never
        // looks permanently dead. Index stays the same here (only
        // the content is blanked, nothing is inserted/removed from
        // the array), so `expanded`/`expandWithSteps` need no
        // reindexing in this branch.
        if (processes.length <= 1) {

            onChange(processes.map((process, candidateIndex) =>
                candidateIndex === index ? createBlankProcess() : process
            ));

            return;

        }

        onChange(processes.filter((_, candidateIndex) => candidateIndex !== index));

        // Same reasoning as SopsTable's own removeSop above: dropping
        // a Process shifts every later Process's index down by one,
        // so `expanded`/`expandWithSteps` -- both keyed by index --
        // have to shift the same way, or the Process that inherits a
        // lower index renders expanded/collapsed based on a
        // DIFFERENT Process's leftover state (this was the original,
        // user-visible symptom: expand Process #2, delete Process
        // #1, and the Process now at index 1 -- never actually
        // opened -- renders expanded instead).
        function reindexAfterRemoval(previous: Set<number>): Set<number> {

            const next = new Set<number>();

            previous.forEach(existingIndex => {

                if (existingIndex === index) {
                    return;
                }

                next.add(existingIndex > index ? existingIndex - 1 : existingIndex);

            });

            return next;

        }

        setExpanded(reindexAfterRemoval);
        setExpandWithSteps(reindexAfterRemoval);

    }

    function moveProcess(index: number, direction: -1 | 1) {

        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= processes.length) {
            return;
        }

        const next = [...processes];
        const [moved] = next.splice(index, 1);
        next.splice(targetIndex, 0, moved);
        onChange(next);

        // The Process at `index` and the one at `targetIndex` just
        // swapped places -- swap their recorded expand state (both
        // Sets) too, so each flag keeps following the SAME Process
        // instead of staying pinned to a row position that now holds
        // a different Process.
        function swapAfterMove(previous: Set<number>): Set<number> {

            const hadIndex = previous.has(index);
            const hadTarget = previous.has(targetIndex);

            if (hadIndex === hadTarget) {
                return previous;
            }

            const swapped = new Set(previous);

            if (hadIndex) {
                swapped.delete(index);
                swapped.add(targetIndex);
            } else {
                swapped.delete(targetIndex);
                swapped.add(index);
            }

            return swapped;

        }

        setExpanded(swapAfterMove);
        setExpandWithSteps(swapAfterMove);

    }

    /**
     * "When I stop working on a row, it moves accordingly, based on
     * its alphabetical and numerical order" -- and, per the cleanup
     * request, a row nobody ever filled in quietly disappears
     * instead. Fires on every focus change anywhere inside the
     * table (a single listener here, rather than one per row,
     * because a Process's own `<tr>` and its expansion `<tr>`
     * holding the SOPs/Steps tables are DOM SIBLINGS, not nested --
     * focusout only bubbles through actual ancestors, so a listener
     * on just the summary row would never see blur events from
     * anything nested inside the expansion). `data-process-row` /
     * `data-sop-row` / `data-step-row` (set on both the summary and
     * expansion `<tr>`s at each level) plus `closest()` on both the
     * event's target and relatedTarget is what lets a single
     * handler here work out exactly which row (if any) is actually
     * being left at each of the three levels, all in one pass so
     * the three levels' worth of edits land in a single `onChange`
     * call instead of racing each other.
     */
    function handleProcessLibraryBlur(event: FocusEvent<HTMLTableElement>) {

        if (disabled) {
            return;
        }

        const target = event.target as HTMLElement;
        const related = event.relatedTarget as HTMLElement | null;

        const leftProcessRow = target.closest<HTMLElement>("tr[data-process-row]");

        if (!leftProcessRow) {
            return;
        }

        const leftProcessIndex = Number(leftProcessRow.dataset.processRow);
        const enteredProcessRow = related?.closest<HTMLElement>("tr[data-process-row]") ?? null;
        const enteredProcessIndex = enteredProcessRow ? Number(enteredProcessRow.dataset.processRow) : -1;

        const leftSopRow = target.closest<HTMLElement>("tr[data-sop-row]");
        const leftSopIndex = leftSopRow ? Number(leftSopRow.dataset.sopRow) : -1;
        const enteredSopRow = related?.closest<HTMLElement>("tr[data-sop-row]") ?? null;
        const enteredSopIndex = enteredSopRow ? Number(enteredSopRow.dataset.sopRow) : -1;

        const leftStepRow = target.closest<HTMLElement>("tr[data-step-row]");
        const leftStepIndex = leftStepRow ? Number(leftStepRow.dataset.stepRow) : -1;
        const enteredStepRow = related?.closest<HTMLElement>("tr[data-step-row]") ?? null;
        const enteredStepIndex = enteredStepRow ? Number(enteredStepRow.dataset.stepRow) : -1;

        const process = processes[leftProcessIndex];

        if (!process) {
            return;
        }

        let sops = Array.isArray(process.sops) && process.sops.length > 0 ? process.sops : [createBlankProcessSop()];
        let sopsChanged = false;

        // Step-level cleanup -- only once focus actually leaves the Step row it was in.
        if (leftStepRow && leftStepIndex !== enteredStepIndex) {

            const sopIndexForSteps = leftSopRow ? leftSopIndex : 0;
            const sopForSteps = sops[sopIndexForSteps];

            if (sopForSteps) {

                const steps = Array.isArray(sopForSteps.steps) && sopForSteps.steps.length > 0
                    ? sopForSteps.steps
                    : [createBlankProcessStep()];
                const step = steps[leftStepIndex];

                if (step && isBlankStep(step) && steps.length > 1) {

                    const nextSteps = steps.filter((_, stepIndex) => stepIndex !== leftStepIndex);
                    sops = sops.map((sop, sopIndex) => (sopIndex === sopIndexForSteps ? { ...sop, steps: nextSteps } : sop));
                    sopsChanged = true;

                }

            }

        }

        // SOP-level cleanup/resort -- only once focus leaves that SOP's own row+Steps entirely
        // (a different SOP, or out of the SOPs table/this Process altogether).
        if (leftSopRow && (leftSopIndex !== enteredSopIndex || leftProcessIndex !== enteredProcessIndex)) {

            const sop = sops[leftSopIndex];

            if (sop) {

                if (isBlankSop(sop) && sops.length > 1) {
                    sops = sops.filter((_, sopIndex) => sopIndex !== leftSopIndex);
                    sopsChanged = true;
                } else if (!isAlreadySortedByInitials(sops, "SOP")) {
                    sops = sortRowsByInitials(sops, "SOP");
                    sopsChanged = true;
                }

            }

        }

        let nextProcesses = processes;

        if (sopsChanged) {
            nextProcesses = processes.map((candidate, processIndex) =>
                processIndex === leftProcessIndex ? { ...candidate, sops } : candidate
            );
        }

        let processesChanged = sopsChanged;

        // Process-level cleanup/resort -- only once focus leaves this Process's row+expansion entirely.
        if (leftProcessIndex !== enteredProcessIndex) {

            const currentProcess = nextProcesses[leftProcessIndex];

            if (currentProcess) {

                if (isBlankProcess(currentProcess) && nextProcesses.length > 1) {
                    nextProcesses = nextProcesses.filter((_, processIndex) => processIndex !== leftProcessIndex);
                    processesChanged = true;
                } else if (!isAlreadySortedByInitials(nextProcesses, "PRC")) {
                    nextProcesses = sortRowsByInitials(nextProcesses, "PRC");
                    processesChanged = true;
                }

            }

        }

        if (processesChanged) {
            onChange(nextProcesses);
        }

    }

    return (

        <div className="process-library">

            {/* Lets the table's own generous, readable column widths (see
                conversation.css) exceed the interview card's 850px cap and
                scroll horizontally instead of ever clipping a column's text
                -- the same `.dynamic-table-scroll` convention DynamicTable
                already uses elsewhere in this app. */}
            <div className="process-library-table-scroll">
            <table
                className="process-library-table"
                onBlur={handleProcessLibraryBlur}
                style={{ width: computeProcessLibraryTableWidth(nameColumnWidth, purposeColumnWidth, ownerColumnWidth) }}
            >
                <thead>
                    <tr>
                        <th className="process-library-col-number">#</th>
                        <th className="process-library-col-id">Process ID</th>
                        <th className="process-library-col-name process-library-col-resizable" style={{ width: nameColumnWidth }}>
                            Process Name
                            <ColumnResizeHandle onResize={handleResizeName} label="Process Name" />
                        </th>
                        <th className="process-library-col-purpose process-library-col-resizable" style={{ width: purposeColumnWidth }}>
                            Purpose
                            <ColumnResizeHandle onResize={handleResizePurpose} label="Purpose" />
                        </th>
                        <th className="process-library-col-owner" style={{ width: ownerColumnWidth }}>Process Owner</th>
                        <th className="process-library-col-frequency">Frequency</th>
                        <th className="process-library-col-status" style={{ width: STATUS_COLUMN_WIDTH }}>Status</th>
                        <th className="process-library-col-actions" />
                    </tr>
                </thead>
                <tbody>
                    {processes.map((process, index) => {

                        const sopsCount = Array.isArray(process.sops) ? process.sops.length : 0;
                        const hasMultipleSops = sopsCount >= 2;
                        const isExpanded = expanded.has(index);
                        const processIdSuffix = `-${processDisplaySequence(processes, index)}`;
                        const rowClassName = isNewInitialsGroup(processes, index, "PRC")
                            ? "process-library-row process-library-row-group-start"
                            : "process-library-row";

                        return (

                            <Fragment key={index}>
                                <tr className={rowClassName} data-process-row={index}>
                                    <td className="process-library-col-number">
                                        <button
                                            type="button"
                                            className="process-library-expand-toggle"
                                            onClick={(event: MouseEvent<HTMLButtonElement>) =>
                                                toggleExpanded(index, event.shiftKey)
                                            }
                                            aria-label={isExpanded ? "Collapse process" : "Expand process"}
                                            title={
                                                isExpanded
                                                    ? "Collapse"
                                                    : hasMultipleSops
                                                        ? "Click: view SOPs · Shift+Click: view SOPs with Steps"
                                                        : "Expand"
                                            }
                                        >
                                            {isExpanded ? "▾" : "▸"} {index + 1}
                                        </button>
                                    </td>
                                    <td className="process-library-col-id">
                                        <div className="process-library-id-field-inline">
                                            <input
                                                type="text"
                                                className="interview-input process-library-id-field"
                                                aria-label="Process ID prefix"
                                            placeholder="PRC"
                                                value={process.id ?? ""}
                                                disabled={disabled}
                                                onChange={(event) => updateProcess(index, { id: sanitizeIdInitials(event.target.value) })}
                                            />
                                            {/* The auto-generated number, inline on the SAME line as
                                                the initials input -- never a second stacked line (see
                                                the module comment above sanitizeIdInitials). The input
                                                only ever holds the user's typed initials; this span is
                                                the only place the "-001"-style count is shown, recomputed
                                                fresh every render from this row's position among every
                                                other row sharing the same initials. */}
                                            <span className="process-library-id-number">{processIdSuffix}</span>
                                        </div>
                                    </td>
                                    <td className="process-library-col-name">
                                        <TextField list={false} className="interview-input process-library-autogrow-field"
                                            ariaLabel="Process name"
                                            placeholder="Process Name"
                                            value={process.name}
                                            disabled={disabled}
                                            onChange={(next) => updateProcess(index, { name: next })}
                                        />
                                    </td>
                                    <td className="process-library-col-purpose">
                                        <TextField list={false} className="interview-input process-library-autogrow-field"
                                            ariaLabel="Process purpose"
                                            placeholder="One line"
                                            value={process.purpose}
                                            disabled={disabled}
                                            onChange={(next) => updateProcess(index, { purpose: next })}
                                        />
                                    </td>
                                    <td className="process-library-col-owner">
                                        <input
                                            type="text"
                                            className="interview-input"
                                            list={OWNER_SUGGESTIONS_DATALIST_ID}
                                            aria-label="Owner"
                                            placeholder="Who owns this"
                                            value={process.who}
                                            disabled={disabled}
                                            onChange={(event) => updateProcess(index, { who: event.target.value })}
                                        />
                                    </td>
                                    <FrequencyCell
                                        key={process.key}
                                        howOften={process.howOften}
                                        schedule={process.schedule}
                                        disabled={disabled}
                                        onChange={(patch) => updateProcess(index, patch)}
                                    />
                                    <td className="process-library-col-status">
                                        <select
                                            className="interview-input"
                                            aria-label="Status"
                                            value={process.status}
                                            disabled={disabled}
                                            onChange={(event) => updateProcess(index, { status: event.target.value })}
                                        >
                                            <option value="" disabled>Select</option>
                                            {PROCESS_STATUS_OPTIONS.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="process-library-col-actions">
                                        <RowActions
                                            disabled={disabled}
                                            canMoveUp={index > 0}
                                            canMoveDown={index < processes.length - 1}
                                            onMoveUp={() => moveProcess(index, -1)}
                                            onMoveDown={() => moveProcess(index, 1)}
                                            onRemove={() => removeProcess(index)}
                                            onAdd={() => addProcess(index)}
                                            isOnlyRow={processes.length <= 1}
                                            itemLabel="process"
                                        />
                                    </td>
                                </tr>

                                {isExpanded && (
                                    <tr className="process-library-expansion-row process-library-expansion-row-process" data-process-row={index}>
                                        <td colSpan={8}>
                                            <ProcessCard
                                                process={process}
                                                disabled={disabled}
                                                initiallyExpandSteps={expandWithSteps.has(index)}
                                                nameColumnWidth={nameColumnWidth}
                                                purposeColumnWidth={purposeColumnWidth}
                                                ownerColumnWidth={ownerColumnWidth}
                                                onResizeName={handleResizeName}
                                                onResizePurpose={handleResizePurpose}
                                                onChange={(next) => updateProcess(index, next)}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </Fragment>

                        );

                    })}
                </tbody>
            </table>
            </div>

            <datalist id={OWNER_SUGGESTIONS_DATALIST_ID}>
                {ownerSuggestions.map(name => (
                    <option key={name} value={name} />
                ))}
            </datalist>

        </div>

    );

}
