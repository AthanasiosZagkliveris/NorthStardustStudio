import { InterviewSession } from "../framework/interview";
import type { SectionResponse } from "../framework/interview";
import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";
import { systems } from "../data/systems";
import { OrganizationService } from "./OrganizationService";
import {
    ProcessRecordValue,
    ProcessSopValue,
    createBlankProcess,
    createBlankProcessSop
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
                ? this.migrateLegacyOperationsData(restoredState)
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
                    name: asText(oldSop["sop-name"]),
                    purpose: "",
                    steps: [{
                        action: asText(oldSop["instructions"]),
                        done: false
                    }]
                }))
                : [createBlankProcessSop()];

            return {
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
