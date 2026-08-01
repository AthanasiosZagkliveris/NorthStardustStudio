import { Fragment, MouseEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
    ProcessLibraryAnswerValue,
    ProcessRecordValue,
    ProcessScheduleValue,
    ProcessSopValue,
    ProcessStepValue,
    createBlankProcess,
    createBlankProcessSop,
    createBlankProcessStep,
    processDisplayId,
    sopDisplayId
} from "../../framework/engine/AnswerUtils.ts";
import DateCellInput from "./DateCellInput.tsx";

// Shared, page-unique ids: each of these <datalist>s is rendered
// ONCE for the whole table (its own suggestion set is the same
// regardless of which row's field is focused), rather than one per
// row -- there's only ever one Process Library editor mounted at a
// time, so a fixed id is safe.
const OWNER_SUGGESTIONS_DATALIST_ID = "process-library-owner-suggestions";
const PROCESS_ID_SUGGESTIONS_DATALIST_ID = "process-library-process-id-suggestions";
const SOP_ID_SUGGESTIONS_DATALIST_ID = "process-library-sop-id-suggestions";

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
                value={howOften}
                disabled={disabled}
                onChange={(event) => {

                    const next = event.target.value;

                    const keepsSchedule = WEEKDAY_FREQUENCIES.includes(next) || DATE_PICKER_FREQUENCIES.includes(next);

                    onChange({ howOften: next, schedule: keepsSchedule ? schedule : undefined });

                }}
            >
                <option value="" disabled>Select frequency</option>
                {FREQUENCY_PRESET_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>

            {needsWeekdayPicker && (
                <select
                    className="interview-input process-library-frequency-schedule-field"
                    value={schedule?.anchorDate ? String(isoWeekday(schedule.anchorDate) ?? "") : ""}
                    disabled={disabled}
                    onChange={(event) => {
                        onChange({ howOften, schedule: { anchorDate: nextIsoForWeekday(Number(event.target.value)) } });
                    }}
                >
                    <option value="" disabled>Select a weekday</option>
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
 * A single-line-by-default text field that grows taller to fit
 * its own content instead of clipping or scrolling -- the same
 * "no internal scrolling, the row just gets taller" convention
 * DynamicTable's own AutoGrowTextarea (and AnswerRenderer's
 * matching copy for Profile Cards) already uses everywhere else
 * in this app. Process/SOP/Step fields render as plain <input>
 * elsewhere in the app's Tables, but a Process/SOP name or a
 * Step's action text can easily run longer than one line, and
 * clipping that silently (an <input> just scrolls its overflow
 * out of view) hides real content from the user.
 */
function AutoGrowField({

    value,

    placeholder,

    disabled,

    className,

    onChange

}: {

    value: string;

    placeholder?: string;

    disabled?: boolean;

    className?: string;

    onChange: (value: string) => void;

}) {

    const ref = useRef<HTMLTextAreaElement | null>(null);

    function resize(el: HTMLTextAreaElement | null) {

        if (!el) {
            return;
        }

        el.style.height = "auto";

        el.style.height = `${el.scrollHeight}px`;

    }

    const setRef = useCallback((el: HTMLTextAreaElement | null) => {
        ref.current = el;
    }, []);

    useLayoutEffect(() => {

        resize(ref.current);

    }, [value]);

    return (

        <textarea

            ref={setRef}

            className={`interview-input process-library-autogrow-field${className ? ` ${className}` : ""}`}

            rows={1}

            placeholder={placeholder}

            disabled={disabled}

            value={value}

            onChange={(event) => {

                onChange(event.target.value);

                resize(event.target);

            }}

        />

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
                        <th>Action</th>
                        <th className="process-library-col-actions" />
                    </tr>
                </thead>
                <tbody>
                    {safeSteps.map((step, index) => (
                        <tr key={index}>
                            <td className="process-library-col-step-number">{index + 1}</td>
                            <td>
                                <AutoGrowField
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
    onChange
}: {
    sops: ProcessSopValue[];
    disabled: boolean;
    initiallyExpandSteps: boolean;
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

        setExpanded(previous => {

            const next = new Set(previous);

            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }

            return next;

        });

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

    }

    return (

        <div className="process-library-sops">

            <table className="process-library-sops-table">
                <thead>
                    <tr>
                        <th className="process-library-col-number">#</th>
                        <th className="process-library-col-id">ID</th>
                        <th>SOP Name</th>
                        <th>Purpose</th>
                        <th>Owner</th>
                        <th className="process-library-col-frequency">How Often</th>
                        <th className="process-library-col-steps">Steps</th>
                        <th className="process-library-col-actions" />
                    </tr>
                </thead>
                <tbody>
                    {sops.map((sop, index) => (
                        <Fragment key={index}>
                            <tr className="process-library-row">
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
                                    <div className="process-library-id-field-wrap">
                                        <input
                                            type="text"
                                            className="interview-input process-library-id-field"
                                            list={SOP_ID_SUGGESTIONS_DATALIST_ID}
                                            placeholder={sopDisplayId(sops, index)}
                                            value={sop.id ?? ""}
                                            disabled={disabled}
                                            onChange={(event) => updateSop(index, { id: event.target.value })}
                                        />
                                        {/* Read-only preview of the auto-generated ID (initials +
                                            position-based number) -- the input itself only ever
                                            holds the user's typed initials, so without this the
                                            generated number is never actually visible once the
                                            field has a value (the placeholder disappears). */}
                                        <span className="process-library-id-computed">{sopDisplayId(sops, index)}</span>
                                    </div>
                                </td>
                                <td>
                                    <AutoGrowField
                                        placeholder="e.g. Domestic Shipping"
                                        value={sop.name}
                                        disabled={disabled}
                                        onChange={(next) => updateSop(index, { name: next })}
                                    />
                                </td>
                                <td>
                                    <AutoGrowField
                                        placeholder="What this SOP is for"
                                        value={sop.purpose}
                                        disabled={disabled}
                                        onChange={(next) => updateSop(index, { purpose: next })}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="interview-input"
                                        list={OWNER_SUGGESTIONS_DATALIST_ID}
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
                                <tr className="process-library-expansion-row">
                                    <td colSpan={8}>
                                        <StepsTable
                                            steps={Array.isArray(sop.steps) ? sop.steps : []}
                                            disabled={disabled}
                                            onChange={(steps) => updateSop(index, { steps })}
                                        />
                                    </td>
                                </tr>
                            )}
                        </Fragment>
                    ))}
                </tbody>
            </table>

            <datalist id={SOP_ID_SUGGESTIONS_DATALIST_ID}>
                {Array.from(new Set(sops.map(sop => (sop.id ?? "").trim()).filter(text => text.length > 0))).map(id => (
                    <option key={id} value={id} />
                ))}
            </datalist>

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
    onChange
}: {
    process: ProcessRecordValue;
    disabled: boolean;
    initiallyExpandSteps: boolean;
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

                <div className="process-library-card-heading">Steps</div>

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

            <div className="process-library-card-heading">SOPs</div>

            <SopsTable
                sops={sops}
                disabled={disabled}
                initiallyExpandSteps={initiallyExpandSteps}
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
function sortRowsByInitials<T extends { id?: string }>(rows: T[], fallbackInitials: string): T[] {

    return [...rows].sort((a, b) => {

        const aInitials = (a.id ?? "").trim().toUpperCase() || fallbackInitials;
        const bInitials = (b.id ?? "").trim().toUpperCase() || fallbackInitials;

        return aInitials.localeCompare(bInitials);

    });

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

        setExpanded(previous => {

            const next = new Set(previous);

            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }

            return next;

        });

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

    }

    function removeProcess(index: number) {

        // At the floor of 1 remaining Process, "remove" clears that
        // Process back to blank (a fresh, single blank SOP/Step)
        // instead of doing nothing -- same "clear instead of
        // disable" convention as Steps above, so the control never
        // looks permanently dead.
        if (processes.length <= 1) {

            onChange(processes.map((process, candidateIndex) =>
                candidateIndex === index ? createBlankProcess() : process
            ));

            return;

        }

        onChange(processes.filter((_, candidateIndex) => candidateIndex !== index));

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

    }

    return (

        <div className="process-library">

            <table className="process-library-table">
                <thead>
                    <tr>
                        <th className="process-library-col-number">#</th>
                        <th className="process-library-col-id">ID</th>
                        <th className="process-library-col-name">Process Name</th>
                        <th className="process-library-col-purpose">Purpose</th>
                        <th>Owner</th>
                        <th className="process-library-col-frequency">How Often</th>
                        <th>Status</th>
                        <th className="process-library-col-actions" />
                    </tr>
                </thead>
                <tbody>
                    {processes.map((process, index) => {

                        const sopsCount = Array.isArray(process.sops) ? process.sops.length : 0;
                        const hasMultipleSops = sopsCount >= 2;
                        const isExpanded = expanded.has(index);

                        return (

                            <Fragment key={index}>
                                <tr className="process-library-row">
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
                                        <div className="process-library-id-field-wrap">
                                            <input
                                                type="text"
                                                className="interview-input process-library-id-field"
                                                list={PROCESS_ID_SUGGESTIONS_DATALIST_ID}
                                                placeholder={processDisplayId(processes, index)}
                                                value={process.id ?? ""}
                                                disabled={disabled}
                                                onChange={(event) => updateProcess(index, { id: event.target.value })}
                                            />
                                            {/* Same read-only computed-ID preview as the SOP ID
                                                field above -- see the comment there. */}
                                            <span className="process-library-id-computed">{processDisplayId(processes, index)}</span>
                                        </div>
                                    </td>
                                    <td className="process-library-col-name">
                                        <AutoGrowField
                                            placeholder="e.g. Fulfil Orders"
                                            value={process.name}
                                            disabled={disabled}
                                            onChange={(next) => updateProcess(index, { name: next })}
                                        />
                                    </td>
                                    <td className="process-library-col-purpose">
                                        <AutoGrowField
                                            placeholder="One line"
                                            value={process.purpose}
                                            disabled={disabled}
                                            onChange={(next) => updateProcess(index, { purpose: next })}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="text"
                                            className="interview-input"
                                            list={OWNER_SUGGESTIONS_DATALIST_ID}
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
                                    <td>
                                        <select
                                            className="interview-input"
                                            value={process.status}
                                            disabled={disabled}
                                            onChange={(event) => updateProcess(index, { status: event.target.value })}
                                        >
                                            <option value="" disabled>Select an option</option>
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
                                    <tr className="process-library-expansion-row process-library-expansion-row-process">
                                        <td colSpan={8}>
                                            <ProcessCard
                                                process={process}
                                                disabled={disabled}
                                                initiallyExpandSteps={expandWithSteps.has(index)}
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

            <datalist id={OWNER_SUGGESTIONS_DATALIST_ID}>
                {ownerSuggestions.map(name => (
                    <option key={name} value={name} />
                ))}
            </datalist>

            <datalist id={PROCESS_ID_SUGGESTIONS_DATALIST_ID}>
                {Array.from(new Set(processes.map(process => (process.id ?? "").trim()).filter(text => text.length > 0))).map(id => (
                    <option key={id} value={id} />
                ))}
            </datalist>

        </div>

    );

}
