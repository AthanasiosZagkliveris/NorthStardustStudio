/*
    THE PROCESS LIBRARY (Operations System, page 2): the table of Processes, each with its SOPs and Steps. Split in three on 2026-11-11 (the owner: "can
    you do them all?"), the code moved as it was: this file is the editor; ProcessLibraryParts.tsx holds its parts (the column resize handle, the
    frequency cell, the row actions, the Steps and SOPs tables, a Process card); processLibraryColumns.ts the column widths and the row helpers
    (sorting by initials, blank rows). ProcessLibraryEditor.test.tsx pins what the editor does.
*/
import { Fragment, type FocusEvent, type MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import TextBox from "../../controls/TextBox.tsx";
import OptionPicker from "../fields/OptionPicker.tsx";
import TextField from "../../controls/TextField.tsx";
import { type ProcessLibraryAnswerValue, type ProcessRecordValue, createBlankProcess, createBlankProcessSop, createBlankProcessStep, processDisplaySequence, sanitizeIdInitials } from "../../../framework/engine/AnswerUtils.ts";
import { toggledIn } from "../fields/toggledIn.ts";
import { OWNER_SUGGESTIONS_DATALIST_ID, DEFAULT_NAME_COLUMN_WIDTH, DEFAULT_PURPOSE_COLUMN_WIDTH, PROCESS_STATUS_OPTIONS, STATUS_COLUMN_WIDTH, clampResizableColumnWidth, computeOwnerColumnWidth, computeProcessLibraryTableWidth, isAlreadySortedByInitials, isBlankProcess, isBlankSop, isBlankStep, isNewInitialsGroup, sortRowsByInitials } from "./processLibraryColumns.ts";
import { ColumnResizeHandle, FrequencyCell, ProcessCard, RowActions } from "./ProcessLibraryParts.tsx";

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
                                            <TextBox
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
                                        <TextBox
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
                                        <OptionPicker
                                            label="Status"
                                            options={PROCESS_STATUS_OPTIONS}
                                            value={process.status}
                                            disabled={disabled}
                                            onChange={(next) => updateProcess(index, { status: next })}
                                        />
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
