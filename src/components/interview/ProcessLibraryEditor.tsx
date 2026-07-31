import { Fragment, MouseEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
    ProcessLibraryAnswerValue,
    ProcessRecordValue,
    ProcessSopValue,
    ProcessStepValue,
    createBlankProcess,
    createBlankProcessSop,
    createBlankProcessStep,
    processDisplayId,
    sopDisplayId
} from "../../framework/engine/AnswerUtils.ts";

// A shared, page-unique id: the Owner autofill <datalist> is
// rendered ONCE for the whole table (its own suggestion set is the
// same regardless of which row's Owner field is focused), rather
// than one per row -- there's only ever one Process Library editor
// mounted at a time, so a fixed id is safe.
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
    processIndex,
    disabled,
    initiallyExpandSteps,
    onChange
}: {
    sops: ProcessSopValue[];
    processIndex: number;
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
                                    <AutoGrowField
                                        className="process-library-id-field"
                                        placeholder={sopDisplayId(sop, processIndex, index)}
                                        value={sop.id ?? ""}
                                        disabled={disabled}
                                        onChange={(next) => updateSop(index, { id: next })}
                                    />
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
                                    <td colSpan={6}>
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
    processIndex,
    disabled,
    initiallyExpandSteps,
    onChange
}: {
    process: ProcessRecordValue;
    processIndex: number;
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
                processIndex={processIndex}
                disabled={disabled}
                initiallyExpandSteps={initiallyExpandSteps}
                onChange={(nextSops) => onChange({ ...process, sops: nextSops })}
            />

        </div>

    );

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
                        <th>Process Name</th>
                        <th>Purpose</th>
                        <th>Owner</th>
                        <th>How Often</th>
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
                                        <AutoGrowField
                                            className="process-library-id-field"
                                            placeholder={processDisplayId(process, index)}
                                            value={process.id ?? ""}
                                            disabled={disabled}
                                            onChange={(next) => updateProcess(index, { id: next })}
                                        />
                                    </td>
                                    <td>
                                        <AutoGrowField
                                            placeholder="e.g. Fulfil Orders"
                                            value={process.name}
                                            disabled={disabled}
                                            onChange={(next) => updateProcess(index, { name: next })}
                                        />
                                    </td>
                                    <td>
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
                                    <td>
                                        <AutoGrowField
                                            placeholder="e.g. Daily"
                                            value={process.howOften}
                                            disabled={disabled}
                                            onChange={(next) => updateProcess(index, { howOften: next })}
                                        />
                                    </td>
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
                                                processIndex={index}
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

        </div>

    );

}
