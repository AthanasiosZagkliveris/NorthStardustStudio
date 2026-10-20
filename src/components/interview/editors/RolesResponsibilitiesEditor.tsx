import { Fragment } from "react";

import {
    ProcessRecordValue,
    RolesResponsibilitiesAnswerValue,
    groupRolesResponsibilities,
    processDisplayId
} from "../../../framework/engine/AnswerUtils.ts";
import NotesField from "../fields/NotesField.tsx";

interface RolesResponsibilitiesEditorProps {

    value: RolesResponsibilitiesAnswerValue;

    onChange: (value: RolesResponsibilitiesAnswerValue) => void;

    disabled?: boolean;

    /**
     * The SAME Operations System session's current Process Library
     * (Section 2) response -- the actual source of every Owner and
     * Responsibility shown here (see groupRolesResponsibilities).
     * This Section itself only ever stores the per-Process Notes.
     */
    processes: ProcessRecordValue[];

}

/**
 * The Operations System's Roles & Responsibilities -- a
 * "collector" rather than an independently-authored table: every
 * Process with a non-blank Owner in the Process Library (Section
 * 2) becomes one Responsibility row here automatically, grouped
 * under its Owner (one taller group per Owner, not one flat row
 * per Process -- see groupRolesResponsibilities), with the groups
 * sorted alphabetically by Owner and each Owner's own
 * Responsibilities kept in Process Library order. A Process ID
 * column sits between Owner and Responsibility, cross-referencing
 * the same Process in Process Library (and in the Operational
 * Log, whose own entries link back to Processes by this same
 * id). Owner, Process ID, and Responsibility are all read-only
 * text here; the ONLY thing a
 * user can actually type into THIS Section is a Note per
 * Responsibility -- to reassign, rename, or reorder anything,
 * edit the Process Library itself. Matches that: no add/remove/
 * reorder controls of any kind.
 */
export default function RolesResponsibilitiesEditor({

    value,

    onChange,

    disabled = false,

    processes

}: RolesResponsibilitiesEditorProps) {

    const groups = groupRolesResponsibilities(processes, value);

    function updateNotes(processKey: string, notes: string) {

        onChange({ ...value, [processKey]: notes });

    }

    if (groups.length === 0) {

        return (

            <div className="roles-responsibilities-empty">
                No Processes have an Owner assigned yet -- add an Owner to a Process in
                Process Library to see it here.
            </div>

        );

    }

    return (

        <div className="roles-responsibilities">

            <table className="roles-responsibilities-table">

                <thead>

                    <tr>
                        <th className="roles-responsibilities-col-owner">Owner</th>
                        <th className="roles-responsibilities-col-process-id">Process ID</th>
                        <th className="roles-responsibilities-col-responsibility">Responsibility</th>
                        <th>Notes</th>
                    </tr>

                </thead>

                <tbody>

                    {groups.map(group => (

                        <Fragment key={group.owner}>

                            {group.entries.map((entry, entryIndex) => (

                                <tr key={entry.process.key}>

                                    {entryIndex === 0 && (
                                        <td
                                            className="roles-responsibilities-col-owner"
                                            rowSpan={group.entries.length}
                                        >
                                            {group.owner}
                                        </td>
                                    )}

                                    <td className="roles-responsibilities-col-process-id">
                                        {processDisplayId(processes, entry.processIndex)}
                                    </td>

                                    <td className="roles-responsibilities-col-responsibility">
                                        {entry.process.name.trim().length > 0
                                            ? entry.process.name.trim()
                                            : "Untitled Process"}
                                    </td>

                                    <td>
                                        <NotesField
                                            className="roles-responsibilities-autogrow-field"
                                            value={entry.notes}
                                            disabled={disabled}
                                            onChange={(next) => updateNotes(entry.process.key, next)}
                                        />
                                    </td>

                                </tr>

                            ))}

                        </Fragment>

                    ))}

                </tbody>

            </table>

        </div>

    );

}
