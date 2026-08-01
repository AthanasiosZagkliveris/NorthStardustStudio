import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import {
    OperationalLogAnswerValue,
    ProcessRecordValue,
    processDisplayId,
    resolveProcessId,
    resolveProcessLogLabel
} from "../../framework/engine/AnswerUtils.ts";
import { isoToDisplay } from "./DateCellInput.tsx";
import { DateFormat, PreferencesService } from "../../services/PreferencesService.ts";

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
 * A <textarea> that grows tall enough to show its entire value
 * with no internal scrolling -- same pattern as ProcessLibraryEditor's
 * own local AutoGrowField (deliberately WITHOUT the list auto-format
 * hook DynamicTable's own cells carry, matching that same precedent
 * for a short-to-medium free-text field inside a table-like editor).
 */
function AutoGrowField({

    value,

    placeholder,

    disabled,

    onChange

}: {

    value: string;

    placeholder?: string;

    disabled?: boolean;

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

            className="interview-input operational-log-autogrow-field"

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
 * Entries are always kept sorted chronologically by the generator
 * itself (see sortOperationalLogRows) -- this editor never
 * reorders anything, it only renders whatever order `value`
 * already arrives in. The table can still be filtered by Process
 * or Owner of Change without touching the underlying stored
 * order or content -- filtering is VIEW-ONLY, and every row is
 * addressed by its own stable `key` (never by array/render
 * index), so editing a Note while a filter is active always
 * targets the right entry.
 */
export default function OperationalLogEditor({

    value,

    onChange,

    disabled = false,

    processes

}: OperationalLogEditorProps) {

    const rows = value;

    const [filterProcessKey, setFilterProcessKey] = useState<string>(NO_FILTER);
    const [filterOwner, setFilterOwner] = useState<string>(NO_FILTER);

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

                    <select
                        className="interview-input"
                        value={filterProcessKey}
                        onChange={(event) => setFilterProcessKey(event.target.value)}
                    >
                        <option value={NO_FILTER}>All Processes</option>
                        {filterableProcesses.map(process => {

                            const processIndex = processes.indexOf(process);

                            return (
                                <option key={process.key} value={process.key}>
                                    {resolveProcessLogLabel(process.key, processes) || processDisplayId(processes, processIndex)}
                                </option>
                            );

                        })}
                    </select>

                </label>

                <label className="operational-log-filter">

                    <span className="operational-log-filter-label">Filter by Owner</span>

                    <select
                        className="interview-input"
                        value={filterOwner}
                        onChange={(event) => setFilterOwner(event.target.value)}
                    >
                        <option value={NO_FILTER}>All Owners</option>
                        {filterableOwners.map(owner => (
                            <option key={owner} value={owner}>{owner}</option>
                        ))}
                    </select>

                </label>

                {(filterProcessKey !== NO_FILTER || filterOwner !== NO_FILTER) && (
                    <button
                        type="button"
                        className="operational-log-clear-filters"
                        onClick={() => {
                            setFilterProcessKey(NO_FILTER);
                            setFilterOwner(NO_FILTER);
                        }}
                    >
                        Clear filters
                    </button>
                )}

            </div>

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
                                        <AutoGrowField
                                            value={row.notes}
                                            disabled={disabled}
                                            placeholder="Add a relevant note (optional)"
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
