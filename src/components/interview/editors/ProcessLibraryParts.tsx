/* Part of ProcessLibraryEditor.tsx (moved out as it was, 2026-11-11: the owner, "can you do them all?"; ProcessLibraryEditor.tsx imports it). */

import { Fragment, type MouseEvent, useState } from "react";
import NavArrow from "../../controls/NavArrow.tsx";
import AddButton from "../../controls/AddButton.tsx";
import RemoveButton from "../../controls/RemoveButton.tsx";
import TextBox from "../../controls/TextBox.tsx";
import OptionPicker, { ValuePicker } from "../fields/OptionPicker.tsx";
import TextField from "../../controls/TextField.tsx";
import { type ProcessRecordValue, type ProcessScheduleValue, type ProcessSopValue, type ProcessStepValue, createBlankProcessSop, createBlankProcessStep, sanitizeIdInitials, sopDisplaySequence } from "../../../framework/engine/AnswerUtils.ts";
import DateCellInput from "../fields/DateCellInput.tsx";
import { toggledIn } from "../fields/toggledIn.ts";
import { OWNER_SUGGESTIONS_DATALIST_ID, SOPS_SPACER_COLUMN_WIDTH, SOPS_STEPS_COLUMN_WIDTH, computeProcessLibraryTableWidth, isNewInitialsGroup } from "./processLibraryColumns.ts";

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
export function ColumnResizeHandle({

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
export function FrequencyCell({

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

            <OptionPicker
                label="How often"
                options={FREQUENCY_PRESET_OPTIONS}
                value={howOften}
                disabled={disabled}
                onChange={(next) => {
                    const keepsSchedule = WEEKDAY_FREQUENCIES.includes(next) || DATE_PICKER_FREQUENCIES.includes(next);
                    onChange({ howOften: next, schedule: keepsSchedule ? schedule : undefined });
                }}
            />

            {needsWeekdayPicker && (
                <div className="process-library-frequency-schedule-field">
                    <ValuePicker
                        label="Day of week"
                        choices={WEEKDAY_OPTIONS.map(option => ({ value: String(option.value), label: option.label }))}
                        value={schedule?.anchorDate ? String(isoWeekday(schedule.anchorDate) ?? "") : ""}
                        disabled={disabled}
                        onChange={(next) => onChange({ howOften, schedule: { anchorDate: nextIsoForWeekday(Number(next)) } })}
                    />
                </div>
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
export function RowActions({

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

                <NavArrow vertical direction="previous" label={`Move ${itemLabel} up`}
                    disabled={disabled || !canMoveUp}
                    onClick={onMoveUp} />

                <NavArrow vertical direction="next" label={`Move ${itemLabel} down`}
                    disabled={disabled || !canMoveDown}
                    onClick={onMoveDown} />

            </div>

            <div className="dynamic-table-row-delete-add">

                <RemoveButton
                    disabled={disabled}
                    aria-label={isOnlyRow ? `Clear ${itemLabel}` : `Remove ${itemLabel}`}
                    onClick={onRemove} />

                <AddButton shape="box" small
                    disabled={disabled}
                    aria-label={`Add ${itemLabel}`}
                    onClick={onAdd} />

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
                                        <TextBox
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
                                    <TextBox
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
export function ProcessCard({
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

                <AddButton className="process-library-add-sop-link"
                    onClick={() => onChange({ ...process, sops: [...sops, createBlankProcessSop()] })}
                    disabled={disabled}>
                    + Add SOP (this process has more than one procedure)
                </AddButton>

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
