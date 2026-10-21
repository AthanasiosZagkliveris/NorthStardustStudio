import { useEffect, useState } from "react";

import AddButton from "../../controls/AddButton.tsx";
import TickField from "../../controls/TickField.tsx";
import { ValuePicker } from "../fields/OptionPicker.tsx";
import {
    OperationalLogAnswerValue,
    ProcessRecordValue,
    processDisplayId,
    resolveProcessId,
    resolveProcessLogLabel
} from "../../../framework/engine/AnswerUtils.ts";
import { isoToDisplay } from "../fields/DateCellInput.tsx";
import { DateFormat, PreferencesService } from "../../../services/PreferencesService.ts";
import NotesField from "../fields/NotesField.tsx";

interface OperationalLogEditorProps {

    value: OperationalLogAnswerValue;

    onChange: (value: OperationalLogAnswerValue) => void;

    disabled?: boolean;

    /**
     * The SAME Operations System session's current Process Library
     * (Section 2) response -- every entry here was auto-generated
     * FROM a change to one of these Processes (see
     * generateOperationalLogEntriesFromProcessLibrary in
     * AnswerUtils.ts, and Conversation.tsx's own call site on
     * leaving Process Library), and its `processKey` resolves back
     * into a "PRC-001 · Name" label / bare "PRC-001" id against
     * this same list for display and filtering.
     */
    processes: ProcessRecordValue[];

}

const NO_FILTER = "";

/**
 * The three age thresholds the user can bulk-delete old Log entries
 * by -- "the user could choose to delete old logs, depending on how
 * long time ago were done (6 months, a year, 2 years)". `months` is
 * the number of calendar months subtracted from today to get the
 * cutoff date (see cutoffIsoDate below); an entry dated BEFORE that
 * cutoff is eligible for deletion, subject to the "never removes a
 * still-current Process/SOP/Step's latest change" guarantee (see
 * `latestRowKeyPerCurrentProcess` in the component below).
 */
const RETENTION_OPTIONS: Array<{ value: string; label: string; months: number }> = [
    { value: "6m", label: "Older than 6 months", months: 6 },
    { value: "1y", label: "Older than 1 year", months: 12 },
    { value: "2y", label: "Older than 2 years", months: 24 }
];

/** Today's date, `months` calendar months back, as an ISO "YYYY-MM-DD" string -- a plain string comparison against `row.date` then sorts correctly, same convention as every other stored date in the Framework. */
function cutoffIsoDate(months: number): string {

    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
    const month = String(cutoff.getMonth() + 1).padStart(2, "0");
    const day = String(cutoff.getDate()).padStart(2, "0");

    return `${cutoff.getFullYear()}-${month}-${day}`;

}


/**
 * The Operations System's Operational Log -- a bespoke editor
 * (not the generic DynamicTable, which every other Table-shaped
 * Section in the app still uses) because this Section isn't
 * independently authored at all: every row is auto-written by
 * Process Library itself (see generateOperationalLogEntriesFromProcessLibrary),
 * one per Process edited since the last time the Log was updated,
 * dated the day that edit happened, with a Description that
 * states only what actually changed (grouped into Updates /
 * Addition / Removal -- see formatProcessChangeDescription).
 * Date, Process ID, Owner of Change, and Description are all
 * read-only here as a result -- the ONE thing a user can actually
 * write into this Section is a Note per entry (e.g. why a change
 * was made, or its outcome), which is exactly what OperationalLogRowValue.notes
 * is for.
 *
 * Entries are always kept sorted chronologically, MOST RECENT
 * first, by the generator itself (see sortOperationalLogRows) --
 * this editor never reorders anything, it only renders whatever
 * order `value` already arrives in. The table can still be
 * filtered by Process or Owner of Change (or narrowed to just the
 * latest change per still-existing Process -- see `showLatestOnly`
 * below) without touching the underlying stored order or content
 * -- filtering is VIEW-ONLY, and every row is addressed by its own
 * stable `key` (never by array/render index), so editing a Note
 * while a filter is active always targets the right entry.
 */
export default function OperationalLogEditor({

    value,

    onChange,

    disabled = false,

    processes

}: OperationalLogEditorProps) {

    // Defensive: silently drops any row that carries literally no
    // information at all (no date, no Process link, no description,
    // no notes) -- a leftover from the OLD manual-entry days (before
    // this Section became fully auto-generated) that got "Add row"-
    // clicked but never filled in. StorageService's own normalize
    // step (which runs on every session load) already strips these
    // at the source now, but filtering again here means a stray one
    // already sitting in an open session's in-memory state (from
    // before that fix) still disappears the moment anything here
    // re-renders, rather than sitting there forever as an unexplained
    // blank row with nothing but an empty Notes box.
    const rows = value.filter(row =>
        row.date.trim().length > 0
        || row.processKey.trim().length > 0
        || row.description.trim().length > 0
        || row.notes.trim().length > 0
    );

    // The single most recent entry per still-existing Process, by
    // `key` -- shared by BOTH `showLatestOnly` (view-only filter,
    // below) and the retention delete feature below that, since
    // "the latest change of every existing Operation" is exactly
    // what must always be protected from age-based deletion too
    // ("All the last changes of the current operations ... should
    // not [be] removed"). A Process's SOPs/Steps have no
    // `processKey` of their own to protect separately -- every SOP/
    // Step edit is already folded into its PARENT Process's own log
    // entry (see generateOperationalLogEntriesFromProcessLibrary),
    // so protecting a Process's latest entry already protects its
    // SOPs'/Steps' latest recorded changes too. Computed up front
    // (ahead of the `deletableRows`/`visibleRows` filters that both
    // read it) since `rows` is already sorted most-recent-first (see
    // sortOperationalLogRows) -- the FIRST row seen per `processKey`
    // while walking it in order already IS that Process's latest.
    const latestRowKeyPerCurrentProcess = new Set<string>();

    {
        const currentProcessKeys = new Set(processes.map(process => process.key));
        const seenProcessKeys = new Set<string>();

        rows.forEach(row => {

            if (!currentProcessKeys.has(row.processKey) || seenProcessKeys.has(row.processKey)) {
                return;
            }

            seenProcessKeys.add(row.processKey);
            latestRowKeyPerCurrentProcess.add(row.key);

        });

    }

    const [filterProcessKey, setFilterProcessKey] = useState<string>(NO_FILTER);
    const [filterOwner, setFilterOwner] = useState<string>(NO_FILTER);

    // "A filter for presenting the latest change of every existed
    // Operation (not the deleted)" -- when on, narrows the table to
    // just ONE row per Process: the most recent one, and only for a
    // Process that still currently exists in Process Library (a
    // Process since deleted has no entry shown at all, however
    // recent its last logged change was). Since `rows` is already
    // kept sorted most-recent-first (see sortOperationalLogRows),
    // the FIRST row encountered per `processKey` while walking the
    // array in order already IS that Process's most recent entry --
    // no separate re-sort needed here.
    const [showLatestOnly, setShowLatestOnly] = useState(false);

    // Retention delete -- "the user could choose to delete old logs,
    // depending on how long time ago were done". `retentionChoice`
    // is which of RETENTION_OPTIONS is currently picked;
    // `confirmingDelete` arms a two-click confirm (click "Delete" once
    // to see exactly how many entries would go and arm the button,
    // click "Confirm" to actually delete) rather than a native
    // browser confirm() dialog, so this stays fully scriptable/
    // testable and consistent with the rest of this app's own UI.
    // Deliberately operates on the FULL log (`rows`), not just
    // whatever the Process/Owner/latest-only filters above currently
    // narrow the table down to -- a retention cleanup is about the
    // Log's actual age, not what's presently in view.
    const [retentionChoice, setRetentionChoice] = useState<string>(RETENTION_OPTIONS[0].value);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const retentionMonths = RETENTION_OPTIONS.find(option => option.value === retentionChoice)?.months ?? RETENTION_OPTIONS[0].months;
    const retentionCutoff = cutoffIsoDate(retentionMonths);

    // Eligible for deletion: has an actual date (an entry with no
    // date yet has no age to judge it by, so it's left alone rather
    // than guessed at), that date is before the chosen cutoff, AND
    // it is NOT the latest logged change for a Process that still
    // currently exists -- the one hard protection rule the user
    // called out explicitly: "All the last changes of the current
    // operations (Processes, SOPs, Steps), should not removed."
    const deletableRows = rows.filter(row => {

        const date = row.date.trim();

        if (date.length === 0) {
            return false;
        }

        if (date >= retentionCutoff) {
            return false;
        }

        return !latestRowKeyPerCurrentProcess.has(row.key);

    });

    function handleRetentionChoiceChange(next: string) {
        setRetentionChoice(next);
        setConfirmingDelete(false);
    }

    function handleDeleteOldEntries() {

        if (!confirmingDelete) {
            setConfirmingDelete(true);
            return;
        }

        const toDelete = new Set(deletableRows.map(row => row.key));

        onChange(rows.filter(row => !toDelete.has(row.key)));
        setConfirmingDelete(false);

    }

    // The Date column's own US (MM/DD/YYYY) / EU (DD/MM/YYYY)
    // presentation toggle -- same shared, app-wide preference
    // (PreferencesService) DynamicTable's own Date columns and
    // the Organization Calendar toggle too, so switching it
    // anywhere updates every open Date display at once. The
    // underlying stored `row.date` always stays ISO.
    const [dateFormat, setDateFormat] = useState<DateFormat>(PreferencesService.getDateFormat());

    useEffect(() => {

        return PreferencesService.subscribe(() => {
            setDateFormat(PreferencesService.getDateFormat());
        });

    }, []);

    function updateNotes(key: string, notes: string) {

        onChange(rows.map(row => (row.key === key ? { ...row, notes } : row)));

    }

    // Every Process that has anything worth showing -- not just the
    // ones a Log entry already references (`row.processKey`). This
    // dropdown used to be scoped to only logged Processes, with a
    // separate, purely-decorative "View all Processes & SOPs" panel
    // above the table for browsing the rest -- but that panel sat in
    // the normal page flow, so scrolling down to work through the
    // table scrolled it away too, right when it would've been most
    // useful. Folding "browse everything" into this SAME control
    // instead -- it already shows each option as "PRC-01 · Name" via
    // resolveProcessLogLabel below, exactly the ID+Name lookup the
    // old panel offered -- means there's only one place to look, and
    // it's an actual filter, not a list that goes stale the moment
    // you scroll. Picking a Process with no entries yet just shows
    // "No entries match the current filter", which is itself useful
    // information (nothing's been logged for it yet).
    const filterableProcesses = processes.filter(process => {

        const sops = Array.isArray(process.sops) ? process.sops : [];

        return process.name.trim().length > 0 || sops.some(sop => sop.name.trim().length > 0);

    });

    const ownerSuggestions = Array.from(new Set(
        rows.map(row => row.ownerOfChange.trim()).filter(text => text.length > 0)
    ));

    const filterableOwners = ownerSuggestions.slice().sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    const visibleRows = rows.filter(row => {

        if (filterProcessKey !== NO_FILTER && row.processKey !== filterProcessKey) {
            return false;
        }

        if (filterOwner !== NO_FILTER && row.ownerOfChange.trim() !== filterOwner) {
            return false;
        }

        if (showLatestOnly && !latestRowKeyPerCurrentProcess.has(row.key)) {
            return false;
        }

        return true;

    });

    return (

        <div className="operational-log">

            {/* Always rendered, even before any Log entry exists yet
                (unlike the table below) -- the Process picker lists
                EVERY Process that has a name or a named SOP (see
                `filterableProcesses` above), not just ones already
                referenced by a Log entry, so it doubles as a way to
                look up any Process's ID -- "PRC-01 · Fulfil Orders",
                same label the picker always showed -- without needing
                anything logged for it yet. */}
            <div className="operational-log-filters">

                <label className="operational-log-filter">

                    <span className="operational-log-filter-label">Filter by Process</span>

                    <ValuePicker
                        label="Filter by Process"
                        choices={[
                            { value: NO_FILTER, label: "All Processes" },
                            ...filterableProcesses.map(process => ({ value: process.key, label: resolveProcessLogLabel(process.key, processes) || processDisplayId(processes, processes.indexOf(process)) }))
                        ]}
                        value={filterProcessKey}
                        onChange={setFilterProcessKey}
                    />

                </label>

                <label className="operational-log-filter">

                    <span className="operational-log-filter-label">Filter by Owner</span>

                    <ValuePicker
                        label="Filter by Owner"
                        choices={[{ value: NO_FILTER, label: "All Owners" }, ...filterableOwners.map(owner => ({ value: owner, label: owner }))]}
                        value={filterOwner}
                        onChange={setFilterOwner}
                    />

                </label>

                <TickField className="operational-log-filter operational-log-filter-checkbox" checked={showLatestOnly} onChange={(event) => setShowLatestOnly(event.target.checked)}>

                    <span>Latest change per Process only</span>

                </TickField>

                {(filterProcessKey !== NO_FILTER || filterOwner !== NO_FILTER || showLatestOnly) && (
                    <AddButton
                        onClick={() => {
                            setFilterProcessKey(NO_FILTER);
                            setFilterOwner(NO_FILTER);
                            setShowLatestOnly(false);
                        }}>
                        Clear filters
                    </AddButton>
                )}

            </div>

            {/* Age-based bulk delete -- "We need to add a delete
                option, the user could choose to delete old logs,
                depending on how long time ago were done (6 months,
                a year, 2 years)". Operates on the FULL log (see
                `deletableRows` above), independent of whatever the
                filters above currently narrow the table's VIEW down
                to. Never touches the most recent logged change for
                a Process/SOP/Step that still currently exists,
                regardless of that entry's own age (see
                `latestRowKeyPerCurrentProcess`) -- the explicit
                protection the user called out. A two-click confirm
                (the button becomes "Confirm delete" showing the
                exact count once clicked once) stands in for a
                native browser confirm() dialog. */}
            {rows.length > 0 && (

                <div className="operational-log-retention">

                    <label className="operational-log-filter">

                        <span className="operational-log-filter-label">Delete old entries</span>

                        <ValuePicker
                            label="Delete old entries"
                            choices={RETENTION_OPTIONS}
                            value={retentionChoice}
                            onChange={handleRetentionChoiceChange}
                        />

                    </label>

                    <button
                        type="button"
                        className={`operational-log-delete-old${confirmingDelete ? " operational-log-delete-old-confirming" : ""}`}
                        disabled={disabled || deletableRows.length === 0}
                        onClick={handleDeleteOldEntries}
                    >
                        {confirmingDelete
                            ? `Confirm delete of ${deletableRows.length} ${deletableRows.length === 1 ? "entry" : "entries"}`
                            : "Delete old entries"}
                    </button>

                    {confirmingDelete && (
                        <AddButton
                            onClick={() => setConfirmingDelete(false)}>
                            Cancel
                        </AddButton>
                    )}

                    {!confirmingDelete && deletableRows.length === 0 && (
                        <span className="operational-log-retention-hint">
                            No entries older than this are eligible for deletion (protected changes are always kept).
                        </span>
                    )}

                </div>

            )}

            {rows.length === 0 ? (

                <div className="operational-log-empty">
                    No changes logged yet -- editing a Process in Process Library
                    and moving on will automatically add an entry here.
                </div>

            ) : (

                <div className="operational-log-scroll">

                    <table className="operational-log-table">

                        <thead>

                            <tr>
                                <th className="operational-log-col-date">
                                    {/*
                                        No in-table US/DD toggle here anymore --
                                        the Organization Calendar panel (System
                                        Selection page) now owns the single,
                                        app-wide control for this same shared
                                        PreferencesService setting, so this cell
                                        just renders the Date per whatever that
                                        setting currently is (see `dateFormat`
                                        below).
                                    */}
                                    Date
                                </th>
                                <th className="operational-log-col-process">Process ID</th>
                                <th className="operational-log-col-owner">Owner</th>
                                <th>Description</th>
                                <th>Notes</th>
                            </tr>

                        </thead>

                        <tbody>

                            {visibleRows.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="operational-log-empty-filtered">
                                        No entries match the current filter.
                                    </td>
                                </tr>
                            )}

                            {visibleRows.map(row => (

                                <tr key={row.key}>

                                    <td className="operational-log-col-date operational-log-col-readonly">
                                        {isoToDisplay(row.date, dateFormat) || row.date.trim()}
                                    </td>

                                    <td className="operational-log-col-process operational-log-col-readonly">
                                        {resolveProcessId(row.processKey, processes)}
                                    </td>

                                    <td className="operational-log-col-owner operational-log-col-readonly">
                                        {row.ownerOfChange.trim()}
                                    </td>

                                    <td className="operational-log-col-readonly operational-log-description">
                                        {row.description}
                                    </td>

                                    <td>
                                        <NotesField
                                            className="operational-log-autogrow-field"
                                            value={row.notes}
                                            disabled={disabled}
                                            onChange={(next) => updateNotes(row.key, next)}
                                        />
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

}
