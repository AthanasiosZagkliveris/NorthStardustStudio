import { InterviewSession } from "../framework/interview";
import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";
import { systems } from "../data/systems";
import { OrganizationService } from "./OrganizationService";
import { IDENTITY_SYSTEM_NUMBER, BRAND_SYSTEM_NUMBER, STRATEGY_SYSTEM_NUMBER, BUSINESS_SYSTEM_NUMBER, swapBusinessAndStrategySequence, makeRoomForBusinessFoundationPage, makeRoomForCustomerEngagementPage, makeRoomForCapabilityPage, makeRoomForFinancialFoundationPage, makeRoomForFinancialSustainabilityPage, retireLegacyBusinessPages, mergeBrandInventoryIntoStyle, handOverAmbassadorPageToBrandSystem, migrateLegacyBrandData, migrateLegacyStrategyData, migrateLegacyIdentityData, migrateLegacyOperationsData, normalizeOperationsSectionsForCurrentSchema } from "./storageMigrations";

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

        // Before anything is read: the Ambassador page moved out of
        // the Identity System and into the Brand System, and that
        // hand-off spans BOTH Systems' saved data -- so it cannot be
        // done by either System's own migration below, which only
        // ever sees one of them. Runs for whichever of the two is
        // opened first, and is a no-op ever after.
        if (
            systemNumber === IDENTITY_SYSTEM_NUMBER ||
            systemNumber === BRAND_SYSTEM_NUMBER
        ) {
            handOverAmbassadorPageToBrandSystem(organizationId);
        }

        // The Brand System's Inventory page became part of the Style page.
        if (systemNumber === BRAND_SYSTEM_NUMBER) {
            mergeBrandInventoryIntoStyle(organizationId);
        }

        // Also before anything is read: the Business and Strategy
        // Systems traded places in the Framework's order, and saved
        // answers are keyed by System NUMBER -- so without this, a
        // Strategy System filled in before the change would open
        // under the Business System, and the other way round. Spans
        // both Systems, so like the hand-off above it cannot belong
        // to either System's own migration.
        if (
            systemNumber === BUSINESS_SYSTEM_NUMBER ||
            systemNumber === STRATEGY_SYSTEM_NUMBER
        ) {
            swapBusinessAndStrategySequence(organizationId);
        }

        // And after the swap, never before it: this one shifts the
        // Sections of whatever is stored at the Business System's
        // number, which is only the right data once the swap above
        // has put it there.
        // In the order the pages were added, never any other: each
        // shifts the Sections the one before it has just moved, so
        // each has to read their new numbers rather than their old
        // ones.
        if (systemNumber === BUSINESS_SYSTEM_NUMBER) {
            makeRoomForBusinessFoundationPage(organizationId);
            makeRoomForCustomerEngagementPage(organizationId);
            makeRoomForCapabilityPage(organizationId);
            makeRoomForFinancialFoundationPage(organizationId);
            makeRoomForFinancialSustainabilityPage(organizationId);
            // Last: it reads the numbers the shifts above have given.
            retireLegacyBusinessPages(organizationId);
        }

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

            let migratedState = restoredState;

            if (system.number === this.OPERATIONS_SYSTEM_NUMBER) {

                migratedState = normalizeOperationsSectionsForCurrentSchema(
                    migrateLegacyOperationsData(restoredState)
                );

            } else if (system.number === IDENTITY_SYSTEM_NUMBER) {

                migratedState = migrateLegacyIdentityData(restoredState);

            } else if (system.number === BRAND_SYSTEM_NUMBER) {

                migratedState = migrateLegacyBrandData(restoredState);

            } else if (system.number === STRATEGY_SYSTEM_NUMBER) {

                migratedState = migrateLegacyStrategyData(restoredState);

            }

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
