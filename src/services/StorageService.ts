import { InterviewSession } from "../framework/interview";
import type { SectionResponse } from "../framework/interview";
import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";
import { systems } from "../data/systems";
import { OrganizationService } from "./OrganizationService";
import {
    OperationalLogRowValue,
    ProcessRecordValue,
    ProcessSopValue,
    ProcessStepValue,
    RolesResponsibilitiesAnswerValue,
    createBlankProcess,
    createBlankProcessSop,
    createOperationalLogRowKey,
    createProcessKey,
    createProcessSopKey,
    createProcessStepKey,
    seedProcessSnapshots,
    sortOperationalLogRows
} from "../framework/engine/AnswerUtils.ts";

export class StorageService {

    /**
     * Resolves the CURRENT Framework structure for a restored
     * session, from the one app-wide `FrameworkRegistry` (shared
     * with `InterviewManager` -- see FrameworkRegistry.ts) so a
     * System already opened via either path is only ever parsed
     * once per app session, not once per registry instance. Every
     * call still reflects whatever Questions/Answers/Help content
     * and Table/Card structure is presently bundled, never a
     * snapshot from whenever a session was first saved -- the
     * registry resolves Frameworks fresh from source, it just
     * caches the parse itself.
     */
    private static readonly registry = frameworkRegistry;

    /**
     * The Operations System's System number (see data/systems.ts)
     * -- the legacy-data migration below only ever applies to
     * sessions for this one System, since it's the only System
     * whose Section structure changed shape (the Process Library
     * rebuild).
     */
    private static readonly OPERATIONS_SYSTEM_NUMBER = 8;

    /**
     * Interview state is now stored per-Organization AND
     * per-System (see OrganizationService), rather than in one
     * single global slot -- so working on the Business System
     * for "Acme Inc" no longer overwrites (or gets overwritten
     * by) progress on the Identity System for "Acme Inc", or
     * on any System for a different Organization entirely.
     */
    static saveInterview(organizationId: string, session: InterviewSession): void {

        const state = session.toJSON();

        OrganizationService.saveSystemState(
            organizationId,
            state.systemNumber,
            state
        );

    }

    static loadInterview(organizationId: string, systemNumber: number): InterviewSession | null {

        const raw = OrganizationService.loadSystemState(organizationId, systemNumber);

        if (!raw) {
            return null;
        }

        try {

            // Older saved sessions persisted the entire parsed
            // Framework (`raw.framework`) instead of just
            // `systemNumber` -- fall back to reading it out of
            // that legacy shape so an in-progress session isn't
            // discarded outright just because the storage format
            // changed. Either way, only the *number* is trusted;
            // the structure itself is always re-resolved below.
            const state = raw as {
                systemNumber?: number;
                framework?: { metadata?: { systemNumber?: number } };
            };

            const resolvedSystemNumber: number | undefined =
                state.systemNumber ?? state.framework?.metadata?.systemNumber;

            const system = systems.find(
                candidate => candidate.number === resolvedSystemNumber
            );

            if (!system) {

                console.warn(
                    "Saved interview session does not reference a " +
                    "known Framework System. Discarding it."
                );

                this.clearInterview(organizationId, systemNumber);

                return null;

            }

            const framework = this.registry.getFramework(system.id);

            const restoredState = raw as Parameters<typeof InterviewSession.fromJSON>[0];

            const migratedState = system.number === this.OPERATIONS_SYSTEM_NUMBER
                ? this.normalizeOperationsSectionsForCurrentSchema(
                    this.migrateLegacyOperationsData(restoredState)
                )
                : restoredState;

            const session = InterviewSession.fromJSON(
                migratedState,
                framework
            );

            if (!this.isCompatible(session)) {

                console.warn(
                    "Saved interview session is from an older, " +
                    "incompatible version of the Framework. Discarding it."
                );

                this.clearInterview(organizationId, systemNumber);

                return null;

            }

            return session;

        } catch (error) {

            console.error(
                "Failed to restore interview session.",
                error
            );

            this.clearInterview(organizationId, systemNumber);

            return null;

        }

    }

    static clearInterview(organizationId: string, systemNumber: number): void {

        OrganizationService.saveSystemState(organizationId, systemNumber, null);

    }

    /**
     * Migrates a legacy Operations System session -- one saved
     * before the Process Library rebuild -- into the current
     * Section structure, preserving the user's previously-entered
     * content instead of discarding it.
     *
     * The OLD Operations System had 5 Sections: 1 Handbook
     * (unchanged), 2 Processes (Table: process-name / purpose /
     * related-sop / status), 3 SOP Library (Table: sop-name /
     * related-process / instructions), 4 Operational Log, 5
     * Roles & Responsibilities.
     *
     * The NEW Operations System has 4 Sections: 1 Handbook
     * (unchanged), 2 Process Library (Process -> SOPs -> Steps),
     * 3 Operational Log (renumbered from 4, same columns), 4
     * Roles & Responsibilities (renumbered from 5, same columns).
     *
     * Detection is purely structural: a Section-2 response whose
     * rows carry the old `process-name` column key (rather than
     * the new `sops` array) is treated as legacy. Once migrated,
     * the data no longer matches that shape, so re-running this
     * on a later load is a safe no-op (idempotent) -- and a
     * session that was always in the new shape is returned
     * untouched.
     */
    private static migrateLegacyOperationsData(
        state: Parameters<typeof InterviewSession.fromJSON>[0]
    ): Parameters<typeof InterviewSession.fromJSON>[0] {

        const responses: SectionResponse[] = state.responses ?? [];

        const findResponse = (sectionNumber: number) =>
            responses.find(response => response.sectionNumber === sectionNumber);

        const asRowArray = (value: unknown): Array<Record<string, unknown>> =>
            Array.isArray(value)
                ? value.filter(
                    (row): row is Record<string, unknown> =>
                        !!row && typeof row === "object"
                )
                : [];

        const asText = (value: unknown): string =>
            typeof value === "string" ? value : "";

        const oldProcessesResponse = findResponse(2);
        const oldProcesses = asRowArray(oldProcessesResponse?.value);

        const looksLegacy = oldProcesses.some(row => "process-name" in row);

        if (!looksLegacy) {
            return state;
        }

        console.info(
            "Migrating a legacy Operations System session (from " +
            "before the Process Library rebuild) into the current " +
            "Process / SOP / Step structure. Previously-entered " +
            "Processes, SOPs, Operational Log, and Roles & " +
            "Responsibilities content is preserved."
        );

        const oldSops = asRowArray(findResponse(3)?.value);

        const migratedProcesses: ProcessRecordValue[] = oldProcesses.map(oldProcess => {

            const processName = asText(oldProcess["process-name"]);

            const matchedSops = oldSops.filter(oldSop =>
                asText(oldSop["related-process"]).trim().toLowerCase() ===
                processName.trim().toLowerCase() &&
                processName.trim().length > 0
            );

            const sops: ProcessSopValue[] = matchedSops.length > 0
                ? matchedSops.map(oldSop => ({
                    key: createProcessSopKey(),
                    name: asText(oldSop["sop-name"]),
                    purpose: "",
                    steps: [{
                        key: createProcessStepKey(),
                        action: asText(oldSop["instructions"]),
                        done: false
                    }]
                }))
                : [createBlankProcessSop()];

            return {
                key: createProcessKey(),
                name: processName,
                purpose: asText(oldProcess["purpose"]),
                who: "",
                howOften: "",
                status: asText(oldProcess["status"]),
                sops
            };

        });

        const migratedResponses: SectionResponse[] = responses.filter(
            response => ![2, 3, 4, 5].includes(response.sectionNumber)
        );

        migratedResponses.push({
            sectionNumber: 2,
            value: migratedProcesses.length > 0 ? migratedProcesses : [createBlankProcess()]
        });

        // Old Operational Log (Section 4) and Roles & Responsibilities
        // (Section 5) kept the exact same column shapes -- only the
        // Section NUMBER moved -- so these are pure data moves, no
        // content transform needed.
        const oldLogResponse = findResponse(4);
        if (oldLogResponse) {
            migratedResponses.push({ sectionNumber: 3, value: oldLogResponse.value });
        }

        const oldRolesResponse = findResponse(5);
        if (oldRolesResponse) {
            migratedResponses.push({ sectionNumber: 4, value: oldRolesResponse.value });
        }

        return {
            ...state,
            responses: migratedResponses
        };

    }

    /**
     * Brings an Operations System session's Sections 2-4 into the
     * CURRENT schema, unconditionally, on every load -- unlike
     * migrateLegacyOperationsData above (which only ever fires once,
     * on a session from before the 5-Section-to-4-Section rebuild),
     * this always runs, because it's fixing up field-level shape
     * drift rather than a one-time structural rebuild:
     *
     * - Every Process (Section 2) gets a stable `key` backfilled if
     *   it's missing one (any session saved before that field
     *   existed), and likewise every SOP's and every Step's own
     *   `key` -- Operational Log now diffs a Process against its own
     *   `lastLoggedSnapshot` by matching SOPs/Steps BY these keys
     *   (see diffProcessAgainstSnapshot), so they all have to exist
     *   before a Process can be through that cycle even once. Once
     *   every key is in place, `seedProcessSnapshots` silently
     *   captures a baseline `lastLoggedSnapshot` for any Process that
     *   doesn't have one yet -- WITHOUT generating a Log entry (see
     *   its own doc comment) -- so a session's pre-existing Processes
     *   never all look "newly added" the moment the user next leaves
     *   Process Library.
     * - Every Operational Log entry (Section 3) is reshaped into the
     *   current OperationalLogRowValue fields: `key`/`date`/
     *   `processKey`/`ownerOfChange`/`description` are kept as-is
     *   (an entry generated under the OLD manual-entry shape keeps
     *   its own original Description text rather than having it
     *   retroactively regenerated -- there's nothing to diff against
     *   for an edit that already happened before this rebuild). The
     *   OLD `type` field is dropped outright (that categorization is
     *   now folded directly into auto-generated Description text
     *   going forward -- see formatProcessChangeDescription). The OLD
     *   `outcome` field becomes the new `notes` field (a straight
     *   rename, per the user's own request), with any OLD `reason`
     *   text prepended onto it (labeled, so it isn't silently merged
     *   in unmarked) rather than discarded outright, since Reason no
     *   longer has a column of its own but was still user-authored
     *   content. Then re-sorted chronologically, since that's still
     *   a standing invariant.
     * - Roles & Responsibilities (Section 4) is reset to an empty
     *   Notes map if it isn't already in that shape -- unlike the
     *   Log, its old content (free-text Activity / Responsible
     *   Person or Team rows) has no reliable mapping onto "Notes
     *   keyed by Process", so this always starts fresh rather than
     *   guessing wrong. (Owner/Responsibility themselves were never
     *   independently-authored data to begin with -- the whole
     *   point of this rebuild is that they're derived from Process
     *   Library.)
     *
     * Idempotent either way: a session already fully on the current
     * schema is unaffected (every Process/SOP/Step already has a
     * `key`, every Process already has a `lastLoggedSnapshot`, every
     * Log row is already in the current shape, and re-sorting/
     * re-shaping already-correct data is a no-op).
     */
    private static normalizeOperationsSectionsForCurrentSchema(
        state: Parameters<typeof InterviewSession.fromJSON>[0]
    ): Parameters<typeof InterviewSession.fromJSON>[0] {

        const responses: SectionResponse[] = state.responses ?? [];

        const findResponse = (sectionNumber: number) =>
            responses.find(response => response.sectionNumber === sectionNumber);

        const asRowArray = (value: unknown): Array<Record<string, unknown>> =>
            Array.isArray(value)
                ? value.filter(
                    (row): row is Record<string, unknown> =>
                        !!row && typeof row === "object"
                )
                : [];

        const asText = (value: unknown): string =>
            typeof value === "string" ? value : "";

        // Section 2: backfill any missing Process/SOP/Step `key`,
        // then seed `lastLoggedSnapshot` for any Process still
        // missing one (silently -- no Log entries generated here).
        const rawProcesses = asRowArray(findResponse(2)?.value) as unknown as ProcessRecordValue[];

        const keyedProcesses: ProcessRecordValue[] = rawProcesses.map(process => {

            const sops = (Array.isArray(process.sops) ? process.sops : []).map(sop => {

                const steps = (Array.isArray(sop.steps) ? sop.steps : []).map(step => ({

                    ...step,

                    key: typeof step.key === "string" && step.key.trim().length > 0
                        ? step.key
                        : createProcessStepKey()

                } as ProcessStepValue));

                return {

                    ...sop,

                    key: typeof sop.key === "string" && sop.key.trim().length > 0
                        ? sop.key
                        : createProcessSopKey(),

                    steps

                } as ProcessSopValue;

            });

            return {

                ...process,

                key: typeof process.key === "string" && process.key.trim().length > 0
                    ? process.key
                    : createProcessKey(),

                sops

            } as ProcessRecordValue;

        });

        const normalizedProcesses: ProcessRecordValue[] = seedProcessSnapshots(keyedProcesses);

        // Section 3: reshape every entry into the current
        // OperationalLogRowValue fields, then re-sort.
        const rawLogRows = asRowArray(findResponse(3)?.value);

        const normalizedLogRows: OperationalLogRowValue[] = sortOperationalLogRows(
            rawLogRows.map(row => {

                // The OLD `outcome` field becomes `notes` outright
                // (a rename); OLD `reason` text, which no longer has
                // a column of its own, is prepended onto it labeled
                // rather than silently dropped.
                const legacyReason = asText(row.reason).trim();
                const legacyOutcome = asText(row.outcome).trim();

                const notes = typeof row.notes === "string"
                    ? row.notes
                    : [
                        legacyReason.length > 0 ? `Reason: ${legacyReason}` : "",
                        legacyOutcome
                    ].filter(part => part.length > 0).join("\n");

                return {

                    key: typeof row.key === "string" && row.key.trim().length > 0
                        ? row.key
                        : createOperationalLogRowKey(),

                    date: asText(row.date),

                    processKey: asText(row.processKey),

                    ownerOfChange: asText(row.ownerOfChange),

                    description: asText(row.description),

                    notes

                };

            })
        );

        // Section 4: reset to an empty Notes map unless it's
        // already a plain object (not an array) -- see this
        // method's own doc comment for why old free-text content
        // isn't carried forward.
        const rawRoles = findResponse(4)?.value;

        const normalizedRoles: RolesResponsibilitiesAnswerValue =
            rawRoles && typeof rawRoles === "object" && !Array.isArray(rawRoles)
                ? rawRoles as RolesResponsibilitiesAnswerValue
                : {};

        const normalizedResponses: SectionResponse[] = responses.filter(
            response => ![2, 3, 4].includes(response.sectionNumber)
        );

        normalizedResponses.push({
            sectionNumber: 2,
            value: normalizedProcesses.length > 0 ? normalizedProcesses : [createBlankProcess()]
        });

        normalizedResponses.push({ sectionNumber: 3, value: normalizedLogRows });

        normalizedResponses.push({ sectionNumber: 4, value: normalizedRoles });

        return {
            ...state,
            responses: normalizedResponses
        };

    }

    /**
     * Verifies that a restored session's Framework
     * still matches the shape the current app
     * expects.
     *
     * A session saved by an older build of the app
     * may be missing fields (such as each Section's
     * Answer Definition) that the current renderer
     * requires. Resuming such a session would crash
     * the Interview page rather than displaying it,
     * so any structurally incompatible session is
     * treated the same as "no saved session".
     */
    private static isCompatible(session: InterviewSession): boolean {

        try {

            const framework = session.getFramework();

            return framework.sections.every(
                section =>
                    !!section.answer &&
                    typeof section.answer.type === "string"
            );

        } catch {

            return false;

        }

    }

}
