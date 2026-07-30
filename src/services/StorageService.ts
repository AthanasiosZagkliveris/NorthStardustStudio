import { InterviewSession } from "../framework/interview";
import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";
import { systems } from "../data/systems";
import { OrganizationService } from "./OrganizationService";

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

            const session = InterviewSession.fromJSON(
                raw as Parameters<typeof InterviewSession.fromJSON>[0],
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
