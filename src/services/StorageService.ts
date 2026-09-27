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
     * The Identity System's System number (see data/systems.ts) --
     * the second System whose Section structure changed shape, when
     * its ten single-answer Sections were rebuilt into three
     * column-layout pages (Definition / Expression / Ethics), each
     * holding four Free Text columns.
     *
     * It has since changed again: the Expression (Ambassador) page
     * moved to the Brand System, leaving Definition and Ethics. See
     * handOverAmbassadorPageToBrandSystem, which picks up where the
     * first migration leaves off.
     */
    private static readonly IDENTITY_SYSTEM_NUMBER = 1;

    /**
     * The Brand System's System number (see data/systems.ts) -- the
     * third System whose Section structure changed shape, when its
     * eight Sections were rebuilt into three pages (Brand Foundation
     * / Style / Inventory).
     */
    private static readonly BRAND_SYSTEM_NUMBER = 2;

    /**
     * The Strategy System's System number (see data/systems.ts) --
     * the fourth System whose Section structure changed shape, when
     * its nine flat Sections were rebuilt into three pages
     * (Foundation / The Strategic Period / The Strategic Roadmap).
     *
     * 4 since the Business System moved ahead of it in the
     * Framework's order; see swapBusinessAndStrategySequence.
     */
    private static readonly STRATEGY_SYSTEM_NUMBER = 4;

    /**
     * The Business System's System number (see data/systems.ts).
     *
     * The Business System is answered BEFORE the Strategy System:
     * strategy is a set of choices about a business the founder has
     * already described, so the description comes first.
     */
    private static readonly BUSINESS_SYSTEM_NUMBER = 3;

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
            systemNumber === this.IDENTITY_SYSTEM_NUMBER ||
            systemNumber === this.BRAND_SYSTEM_NUMBER
        ) {
            this.handOverAmbassadorPageToBrandSystem(organizationId);
        }

        // Also before anything is read: the Business and Strategy
        // Systems traded places in the Framework's order, and saved
        // answers are keyed by System NUMBER -- so without this, a
        // Strategy System filled in before the change would open
        // under the Business System, and the other way round. Spans
        // both Systems, so like the hand-off above it cannot belong
        // to either System's own migration.
        if (
            systemNumber === this.BUSINESS_SYSTEM_NUMBER ||
            systemNumber === this.STRATEGY_SYSTEM_NUMBER
        ) {
            this.swapBusinessAndStrategySequence(organizationId);
        }

        // And after the swap, never before it: this one shifts the
        // Sections of whatever is stored at the Business System's
        // number, which is only the right data once the swap above
        // has put it there.
        // In the order the pages were added, never any other: each
        // shifts the Sections the one before it has just moved, so
        // each has to read their new numbers rather than their old
        // ones.
        if (systemNumber === this.BUSINESS_SYSTEM_NUMBER) {
            this.makeRoomForBusinessFoundationPage(organizationId);
            this.makeRoomForCustomerEngagementPage(organizationId);
            this.makeRoomForCapabilityPage(organizationId);
            this.makeRoomForFinancialFoundationPage(organizationId);
            this.makeRoomForFinancialSustainabilityPage(organizationId);
            // Last: it reads the numbers the shifts above have given.
            this.retireLegacyBusinessPages(organizationId);
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

                migratedState = this.normalizeOperationsSectionsForCurrentSchema(
                    this.migrateLegacyOperationsData(restoredState)
                );

            } else if (system.number === this.IDENTITY_SYSTEM_NUMBER) {

                migratedState = this.migrateLegacyIdentityData(restoredState);

            } else if (system.number === this.BRAND_SYSTEM_NUMBER) {

                migratedState = this.migrateLegacyBrandData(restoredState);

            } else if (system.number === this.STRATEGY_SYSTEM_NUMBER) {

                migratedState = this.migrateLegacyStrategyData(restoredState);

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
     * The column ids of the Ambassador page, as
     * AnswerParser.slug derives them from the four column titles
     * in the Answer Definition ("Aesthetics", "Attitude & Body
     * Language", "Communication & Voice", "Imprint").
     *
     * Used to RECOGNISE that page's saved value, which is what
     * tells an Identity session saved before the move apart from
     * one saved after it.
     */
    private static readonly AMBASSADOR_COLUMN_IDS = [
        "aesthetics",
        "attitude-body-language",
        "communication-voice",
        "imprint"
    ];

    /**
     * The Ethics page's own column ids, by the same derivation.
     *
     * Needed for the same reason: Section 3 is no longer evidence of
     * anything on its own. It held Ethics before the move and holds
     * the Legal Entity page after it, so only the SHAPE of what is
     * stored there can tell a session that needs moving from one
     * that has already moved.
     */
    private static readonly ETHICS_COLUMN_IDS = [
        "philosophy",
        "values",
        "principles",
        "manifesto"
    ];

    /** Whether a stored response carries any of these column ids. */
    private static responseHasColumns(
        response: SectionResponse | undefined,
        columnIds: string[]
    ): boolean {

        return !!response &&
            response.value !== null &&
            typeof response.value === "object" &&
            Object.keys(response.value as object).some(key => columnIds.includes(key));

    }

    /**
     * Moves the Ambassador page's saved answers from the Identity
     * System to the Brand System.
     *
     * The page used to live in the Identity System as its Section 2,
     * with the Brand System showing the same answers through a Shared
     * Answer. It is now the Brand System's OWN Section 1, and the
     * Identity System has two pages rather than three -- Ethics
     * moving up from Section 3 to Section 2.
     *
     * That renumbering is why doing nothing is not an option. A
     * session saved before the change holds the Ambassador answers at
     * Section 2, which is now where Ethics renders: left alone, the
     * Ethics page would open showing what the user wrote about their
     * Ambassador, under the Philosophy/Values/Principles/Manifesto
     * headings. Losing the answers would be bad; showing them as
     * something else is worse.
     *
     * Both Systems are rewritten together, and the write is eager
     * rather than left to the caller, because the two halves cannot
     * be staged. The Identity session is the only place the
     * Ambassador answers exist; the moment it is saved in its new
     * two-page shape they are gone, and the Brand System would have
     * nothing left to inherit. So whichever of the two Systems is
     * opened first does the whole hand-off at once.
     *
     * Detection is structural: a response for Section 3, or a
     * Section-2 response carrying the Ambassador page's own column
     * ids. Once moved the data matches neither test, so a later call
     * is a safe no-op (idempotent), and a session saved after the
     * change is left untouched.
     */
    /**
     * The Business System became System 3 and the Strategy System
     * System 4, so that a founder describes the business before
     * choosing a strategy for it.
     *
     * Saved answers are keyed by System number inside the
     * Organization document (see OrganizationService.saveSystemState),
     * so the two Systems' stored state has to trade places along
     * with the numbering. Left alone, a Strategy System filled in
     * before the change would open as the Business System, and the
     * Business System's answers as Strategy -- the same "showing the
     * answers as something else" failure the hand-off above exists
     * to prevent.
     *
     * Detection is a stored flag rather than the structural match
     * used above, because there is nothing structural to match on:
     * both Systems store an ordinary list of Section responses, and
     * a Business answer at Section 1 looks exactly like a Strategy
     * answer at Section 1. The flag makes the swap run once and be a
     * no-op ever after, which matters twice over here -- running it
     * a second time would put everything back.
     */
    private static swapBusinessAndStrategySequence(organizationId: string): void {

        const document = OrganizationService.loadDocument(organizationId);

        if (!document || document.businessStrategySequenceSwapped) {
            return;
        }

        const business = String(this.BUSINESS_SYSTEM_NUMBER);
        const strategy = String(this.STRATEGY_SYSTEM_NUMBER);

        const storedAtBusiness = document.systems[business];
        const storedAtStrategy = document.systems[strategy];

        // The state carries its own systemNumber (see
        // InterviewSession.toJSON), which has to move with it --
        // otherwise the session would be rebuilt against the
        // Framework it just came from.
        const renumber = (state: unknown, systemNumber: number): unknown => {

            if (!state || typeof state !== "object" || Array.isArray(state)) {
                return state;
            }

            return { ...state as Record<string, unknown>, systemNumber };

        };

        if (storedAtBusiness === undefined) {
            delete document.systems[strategy];
        } else {
            document.systems[strategy] = renumber(
                storedAtBusiness,
                this.STRATEGY_SYSTEM_NUMBER
            );
        }

        if (storedAtStrategy === undefined) {
            delete document.systems[business];
        } else {
            document.systems[business] = renumber(
                storedAtStrategy,
                this.BUSINESS_SYSTEM_NUMBER
            );
        }

        document.businessStrategySequenceSwapped = true;

        OrganizationService.saveDocument(document);

    }

    /**
     * Foundation became the Business System's Section 1, and its
     * nine original Sections moved to 2-10 to make room (see
     * 03_BusinessSystemAnswer.md). Those nine are temporary: they
     * are replaced as the five-page structure is built, and the
     * System ends at Foundation / Customers Engagement /
     * Infrastructure & Capability / Financial Foundation /
     * Financial Sustainability.
     *
     * Saved answers are keyed by Section number, so they shift with
     * the pages: an answer written under Section 1 (Business Plan)
     * belongs to Section 2 now that Section 1 is Foundation. Left
     * alone, every one of the nine pages would open showing the
     * previous page's answers.
     *
     * `currentSectionIndex` moves too -- it is a position in the
     * Sections array, and the array grew at the front, so a user
     * last seen on the first page should still be on that same
     * page rather than on Foundation.
     *
     * A flag, and it matters more here than anywhere else: shifting
     * twice would move every answer two pages from its own.
     */
    private static makeRoomForBusinessFoundationPage(organizationId: string): void {
        this.insertBusinessSection(
            organizationId, "businessFoundationPageInserted", 1
        );
    }

    /**
     * Makes room in the Business System for a new Section at
     * `insertedAt`, moving every Section at or past it along by one.
     *
     * One method for all of them because every insertion is the
     * same insertion: the five-page structure arrives a page at a
     * time, each page takes a number the temporary Sections were
     * using, and those Sections move up. Written three times it
     * would be three chances for one of them to drift.
     *
     * `flag` is the Organization's own record that this particular
     * insertion has been applied, and it is what makes the whole
     * thing safe: shifting twice would move every answer two pages
     * from its own. It is written even when the Organization has no
     * Business System answers yet, so the shift cannot be applied
     * later to answers already written against the new numbering.
     *
     * `currentSectionIndex` moves with anything at or past the
     * insertion point, so a reader last seen on a page is still on
     * that page. It is an INDEX, so it is one less than the Section
     * number the same page carries.
     */
    private static insertBusinessSection(
        organizationId: string,
        flag: "businessFoundationPageInserted"
            | "customerEngagementPageInserted"
            | "capabilityPageInserted"
            | "financialFoundationPageInserted"
            | "financialSustainabilityPageInserted",
        insertedAt: number
    ): void {

        const document = OrganizationService.loadDocument(organizationId);

        if (!document || document[flag]) {
            return;
        }

        const stored = document.systems[String(this.BUSINESS_SYSTEM_NUMBER)];

        if (stored && typeof stored === "object" && !Array.isArray(stored)) {

            const state = stored as Record<string, unknown>;

            if (Array.isArray(state.responses)) {
                state.responses = state.responses.map(entry => {

                    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
                        return entry;
                    }

                    const response = entry as Record<string, unknown>;

                    return typeof response.sectionNumber === "number" &&
                        response.sectionNumber >= insertedAt
                        ? { ...response, sectionNumber: response.sectionNumber + 1 }
                        : response;

                });
            }

            if (
                typeof state.currentSectionIndex === "number" &&
                state.currentSectionIndex >= insertedAt - 1
            ) {
                state.currentSectionIndex = state.currentSectionIndex + 1;
            }

        }

        document[flag] = true;

        OrganizationService.saveDocument(document);

    }

    /**
     * Customer Engagement became the Business System's Section 2,
     * and the nine temporary Sections that followed Foundation moved
     * from 2-10 to 3-11 to make room (see
     * 03_BusinessSystemAnswer.md).
     *
     * The same shift the Foundation insertion above performs, and
     * for the same reason -- saved answers are keyed by Section
     * number, so an answer written under Section 2 (Business Plan)
     * belongs to Section 3 now that Section 2 is Customer
     * Engagement. Left alone, all nine pages would open showing the
     * previous page's answers.
     *
     * The ONE difference: this shift starts at 2 rather than at 1.
     * Foundation is Section 1 and stays there, so an answer already
     * written on it must not move -- the insertion is in the middle
     * of the sequence this time, not at the front of it.
     *
     * `currentSectionIndex` moves with anything at or past the
     * insertion point, so a user last seen on a page is still on
     * that same page. A user left on Foundation (index 0) stays on
     * Foundation.
     */
    private static makeRoomForCustomerEngagementPage(organizationId: string): void {
        this.insertBusinessSection(
            organizationId, "customerEngagementPageInserted", 2
        );
    }

    /**
     * Infrastructure & Capability became Section 3, moving the nine
     * temporary Sections from 3-11 to 4-12.
     */
    private static makeRoomForCapabilityPage(organizationId: string): void {
        this.insertBusinessSection(organizationId, "capabilityPageInserted", 3);
    }

    /**
     * Financial Foundation became Section 4, moving the nine
     * temporary Sections from 4-12 to 5-13.
     */
    private static makeRoomForFinancialFoundationPage(organizationId: string): void {
        this.insertBusinessSection(organizationId, "financialFoundationPageInserted", 4);
    }

    /**
     * Financial Sustainability became Section 5, moving them again,
     * from 5-13 to 6-14. Runs after the Financial Foundation shift,
     * reading the numbers that one has just given them.
     */
    private static makeRoomForFinancialSustainabilityPage(organizationId: string): void {
        this.insertBusinessSection(organizationId, "financialSustainabilityPageInserted", 5);
    }

    /** The first Section of the nine retired pages, after both shifts above. */
    private static readonly FIRST_RETIRED_BUSINESS_SECTION = 6;

    /**
     * The Business System's nine original pages were retired once
     * its five-page structure was complete (see
     * 03_BusinessSystemAnswer.md), leaving Sections 1-5.
     *
     * Their answers are keyed by Section number, and left where they
     * were they would reappear on any page later given the number 6
     * or above -- the "showing the answers as something else" failure
     * every migration here exists to prevent. So they are moved OUT of
     * the Business System's responses into the Organization's own
     * `retiredBusinessResponses`: set aside, not deleted.
     *
     * A reader last seen on one of those pages is put on the last
     * page that remains, since a position past the end cannot be
     * opened at all.
     *
     * A flag, like the insertions: run twice, it would set aside
     * whatever a future Section 6 had been given.
     */
    private static retireLegacyBusinessPages(organizationId: string): void {

        const document = OrganizationService.loadDocument(organizationId);

        if (!document || document.legacyBusinessPagesRetired) {
            return;
        }

        const stored = document.systems[String(this.BUSINESS_SYSTEM_NUMBER)];

        if (stored && typeof stored === "object" && !Array.isArray(stored)) {

            const state = stored as Record<string, unknown>;

            if (Array.isArray(state.responses)) {

                const isRetired = (entry: unknown) =>
                    !!entry && typeof entry === "object" && !Array.isArray(entry) &&
                    typeof (entry as Record<string, unknown>).sectionNumber === "number" &&
                    ((entry as Record<string, unknown>).sectionNumber as number) >=
                        this.FIRST_RETIRED_BUSINESS_SECTION;

                const retired = state.responses.filter(isRetired);

                state.responses = state.responses.filter(entry => !isRetired(entry));

                if (retired.length > 0) {
                    document.retiredBusinessResponses = retired;
                }

            }

            const lastIndex = this.FIRST_RETIRED_BUSINESS_SECTION - 2;

            if (typeof state.currentSectionIndex === "number" && state.currentSectionIndex > lastIndex) {
                state.currentSectionIndex = lastIndex;
            }

        }

        document.legacyBusinessPagesRetired = true;

        OrganizationService.saveDocument(document);

    }

    private static handOverAmbassadorPageToBrandSystem(organizationId: string): void {

        const storedIdentityState = OrganizationService.loadSystemState(
            organizationId,
            this.IDENTITY_SYSTEM_NUMBER
        ) as Parameters<typeof InterviewSession.fromJSON>[0] | null;

        if (!storedIdentityState) {
            return;
        }

        // Through the EARLIER rebuild first, so this only ever has
        // to reason about one shape. A session still holding the
        // original ten Free Text Sections has a bare string at
        // Section 3 -- which the Ethics test below would otherwise
        // read as an Ethics page and renumber, wrecking the input
        // that migration needs. Run against its output instead,
        // where Section 3 really is the Ethics page. It returns a
        // current-shape session untouched, so this costs nothing in
        // the ordinary case.
        const identityState = this.migrateLegacyIdentityData(storedIdentityState);

        const identityResponses: SectionResponse[] = identityState.responses ?? [];

        // Both tests are on the SHAPE of what is stored, never on
        // the Section number alone. Section 2 now holds Ethics and
        // Section 3 the Legal Entity page, so a number on its own
        // would match a session that has already moved -- and
        // renumber the Legal Entity page over the top of Ethics.
        const ambassadorResponse = identityResponses.find(response =>
            response.sectionNumber === 2 &&
            this.responseHasColumns(response, this.AMBASSADOR_COLUMN_IDS)
        );

        const ethicsResponse = identityResponses.find(response =>
            response.sectionNumber === 3 &&
            this.responseHasColumns(response, this.ETHICS_COLUMN_IDS)
        );

        if (!ambassadorResponse && !ethicsResponse) {
            return;
        }

        // The Brand System first, so nothing is dropped from the
        // Identity System until it has somewhere to land.
        if (ambassadorResponse) {

            const brandState = OrganizationService.loadSystemState(
                organizationId,
                this.BRAND_SYSTEM_NUMBER
            ) as Parameters<typeof InterviewSession.fromJSON>[0] | null;

            if (brandState) {

                const brandResponses: SectionResponse[] = brandState.responses ?? [];

                // A Shared Answer stored nothing of its own, so
                // Section 1 should be empty here -- but if this
                // Organization has somehow already written to the
                // page since the change, what is there now wins.
                const brandHoldsPage = brandResponses.some(response =>
                    response.sectionNumber === 1 &&
                    response.value !== null &&
                    typeof response.value === "object" &&
                    Object.keys(response.value as object).length > 0
                );

                if (!brandHoldsPage) {

                    OrganizationService.saveSystemState(
                        organizationId,
                        this.BRAND_SYSTEM_NUMBER,
                        {
                            ...brandState,
                            responses: [
                                ...brandResponses.filter(
                                    response => response.sectionNumber !== 1
                                ),
                                { ...ambassadorResponse, sectionNumber: 1 }
                            ]
                        }
                    );

                }

            }

        }

        // Then the Identity System: the Ambassador page goes, and
        // Ethics takes the Section number it vacated. Both are
        // matched by the exact responses found above rather than by
        // number, so nothing else sitting at 2 or 3 is touched.
        const movedIdentityResponses = identityResponses
            .filter(response => response !== ambassadorResponse)
            .map(response => response === ethicsResponse
                ? { ...response, sectionNumber: 2 }
                : response
            );

        OrganizationService.saveSystemState(
            organizationId,
            this.IDENTITY_SYSTEM_NUMBER,
            { ...identityState, responses: movedIdentityResponses }
        );

        console.info(
            "Moved the Ambassador page's answers from the Identity " +
            "System to the Brand System, and renumbered Ethics from " +
            "Section 3 to Section 2."
        );

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
    /**
     * Brings an Identity System session saved against the OLD ten
     * Sections (Mission, Vision, Values, Philosophy, Principles,
     * Manifesto, Brand Personality, Voice Guide, Positioning
     * Statement, Organization Description -- each a single Free Text
     * answer) into the CURRENT three column-layout pages.
     *
     * Seven of the ten map onto a column of the same name and are
     * carried across verbatim; each becomes one key of its new
     * page's composite Multi-Part value, keyed by that column's own
     * slug (see AnswerParser.slug):
     *
     *   old 1  Mission               -> new 1 "mission"
     *   old 2  Vision                -> new 1 "vision"
     *   old 9  Positioning Statement -> new 1 "positioning"
     *   old 3  Values                -> new 3 "values"
     *   old 4  Philosophy            -> new 3 "philosophy"
     *   old 5  Principles            -> new 3 "principles"
     *   old 6  Manifesto             -> new 3 "manifesto"
     *
     * The remaining three (Brand Personality, Voice Guide,
     * Organization Description) have no column in the new structure
     * and are dropped, as is anything previously entered for the new
     * "Description" column's Section, which has no old counterpart.
     * Page 2 (Expression) is entirely new, so nothing maps into it.
     *
     * Detection is purely structural: a legacy session is one that
     * still carries a response for a Section number above 3, or
     * whose Sections 1-3 still hold a bare string (the old Free Text
     * shape) rather than the composite object a column-layout page
     * stores. Once migrated the data matches neither test, so
     * re-running this on a later load is a safe no-op (idempotent),
     * and a session already in the new shape is returned untouched.
     */
    /**
     * Drops a Brand System session saved against the OLD eight
     * Sections (Brand Kit, Logo Specification, Color System,
     * Typography System, Visual Language, Brand Applications, Brand
     * Rules, Asset Inventory) when the System was rebuilt into three
     * pages (Brand Foundation / Style / Inventory).
     *
     * Nothing is carried across, and that is deliberate rather than
     * lazy: the old Sections were Free Text, Fixed Variant Text and a
     * Table, while the new pages hold a structured palette, typeface
     * and image-asset shape. There is no field-level correspondence
     * to map -- the closest pair (old "Color System" table to the new
     * palette) doesn't share a single column definition.
     *
     * Strictly speaking this is belt-and-braces: the new editors'
     * own normalizers (asBrandStyleValue / asBrandInventoryValue)
     * already treat an unrecognised value as empty, so stale data
     * renders as blank rather than wrong. Clearing it stops the
     * orphaned bytes sitting in localStorage forever.
     *
     * Detection is structural: a response for a Section above 3, or
     * a bare string in Sections 1-3 (the old Free Text shape). Once
     * cleared the data matches neither test, so re-running this is a
     * safe no-op, and a session already in the new shape is returned
     * untouched.
     */
    private static migrateLegacyBrandData(
        state: Parameters<typeof InterviewSession.fromJSON>[0]
    ): Parameters<typeof InterviewSession.fromJSON>[0] {

        const responses: SectionResponse[] = state.responses ?? [];

        const looksLegacy = responses.some(response =>
            response.sectionNumber > 3 || typeof response.value === "string"
        );

        // Never clear a session that already holds current-shape
        // data. Legacy detection alone is not enough of a guard: an
        // empty string sitting in one Section next to real answers in
        // another would otherwise take the whole System with it, and
        // for this System that means destroying uploaded images.
        // Bailing out here makes the migration strictly a one-way
        // "nothing worth keeping" cleanup.
        const holdsCurrentData = responses.some(response =>
            response.value !== null &&
            typeof response.value === "object" &&
            Object.keys(response.value as object).length > 0
        );

        if (!looksLegacy || holdsCurrentData) {
            return state;
        }

        console.info(
            "Clearing a legacy Brand System session (from before the " +
            "three-page rebuild). The previous Sections held a " +
            "different shape of answer entirely, with no field-level " +
            "equivalent in the current Brand Foundation / Style / " +
            "Inventory structure."
        );

        return { ...state, responses: [] };

    }

    /**
     * Drops a Strategy System session saved against the OLD nine
     * Sections (Current Situation Analysis, SWOT Analysis, Strategic
     * Compass, Strategic Themes, Goals, Objectives, Key Initiatives,
     * Success Metrics, Strategic Roadmap) when the System was rebuilt
     * into three pages (Foundation / The Strategic Period / The
     * Strategic Roadmap).
     *
     * Nothing is carried across. The old Sections were Fixed Variant
     * Text, Free Text and flat Tables of loose rows; the new pages
     * hold one nested structure in which every Goal belongs to a
     * Theme, every Objective to a Goal, and every Initiative and
     * Metric to an Objective. Even where the titles match, the old
     * data records no such relationships -- an old "Key Initiatives"
     * row names an Objective in free text, which is not the same
     * thing as belonging to one -- so there is nothing that could be
     * mapped across without inventing the structure it is missing.
     *
     * Detection is structural, and the guard is the same one the
     * Brand migration uses: see migrateLegacyBrandData for why a
     * session already holding current-shape data is left alone.
     */
    private static migrateLegacyStrategyData(
        state: Parameters<typeof InterviewSession.fromJSON>[0]
    ): Parameters<typeof InterviewSession.fromJSON>[0] {

        const responses: SectionResponse[] = state.responses ?? [];

        const looksLegacy = responses.some(response =>
            response.sectionNumber > 3 || typeof response.value === "string"
        );

        const holdsCurrentData = responses.some(response =>
            response.value !== null &&
            typeof response.value === "object" &&
            Object.keys(response.value as object).length > 0
        );

        if (!looksLegacy || holdsCurrentData) {
            return state;
        }

        console.info(
            "Clearing a legacy Strategy System session (from before the " +
            "three-page rebuild). The previous Sections held flat, " +
            "unrelated answers with no equivalent in the current " +
            "Theme / Goal / Objective structure."
        );

        return { ...state, responses: [] };

    }

    private static migrateLegacyIdentityData(
        state: Parameters<typeof InterviewSession.fromJSON>[0]
    ): Parameters<typeof InterviewSession.fromJSON>[0] {

        const responses: SectionResponse[] = state.responses ?? [];

        // A bare string value IS the old Free Text shape, and the only
        // reliable signal that this session predates the rebuild. A
        // high Section number deliberately does NOT qualify on its own:
        // a session holding new-format page objects alongside one stale
        // Section-4+ response would then be treated as legacy and
        // rebuilt purely from string values -- of which it has none --
        // silently discarding every answer it actually had.
        const looksLegacy = responses.some(
            response => typeof response.value === "string"
        );

        if (!looksLegacy) {
            return state;
        }

        const findText = (sectionNumber: number): string => {

            const value = responses.find(
                response => response.sectionNumber === sectionNumber
            )?.value;

            return typeof value === "string" ? value : "";

        };

        // Only columns that actually carried text are written, so a
        // half-finished old session doesn't gain a page full of
        // empty-string keys (which `isAnswerEmpty` would otherwise
        // have to reason about).
        const buildPage = (
            columns: Array<{ id: string; sectionNumber: number }>
        ): Record<string, string> => {

            const page: Record<string, string> = {};

            for (const column of columns) {

                const text = findText(column.sectionNumber);

                if (text.trim().length > 0) {
                    page[column.id] = text;
                }

            }

            return page;

        };

        // Any page value ALREADY in the new composite shape is carried
        // across untouched, and wins over anything the rebuild derives
        // for the same column -- so a part-migrated session (new-format
        // pages sitting alongside a leftover legacy string) is never
        // rebuilt out from under the newer data.
        const existingPage = (sectionNumber: number): Record<string, unknown> => {

            const value = responses.find(
                response => response.sectionNumber === sectionNumber
            )?.value;

            return value && typeof value === "object" && !Array.isArray(value)
                ? value as Record<string, unknown>
                : {};

        };

        const definitionPage = {
            ...buildPage([
                { id: "mission", sectionNumber: 1 },
                { id: "positioning", sectionNumber: 9 },
                { id: "vision", sectionNumber: 2 }
            ]),
            ...existingPage(1)
        };

        const expressionPage = existingPage(2);

        const ethicsPage = {
            ...buildPage([
                { id: "philosophy", sectionNumber: 4 },
                { id: "values", sectionNumber: 3 },
                { id: "principles", sectionNumber: 5 },
                { id: "manifesto", sectionNumber: 6 }
            ]),
            ...existingPage(3)
        };

        console.info(
            "Migrating a legacy Identity System session (from before " +
            "the three-page rebuild) into the Definition / Expression " +
            "/ Ethics structure. Mission, Vision, Positioning, " +
            "Philosophy, Values, Principles and Manifesto are " +
            "preserved; Brand Personality, Voice Guide and " +
            "Organization Description have no column in that " +
            "structure and are dropped. The Expression page has since " +
            "moved to the Brand System -- see " +
            "handOverAmbassadorPageToBrandSystem, which runs against " +
            "this output rather than repeating its work."
        );

        const migratedResponses: SectionResponse[] = [];

        if (Object.keys(definitionPage).length > 0) {
            migratedResponses.push({ sectionNumber: 1, value: definitionPage });
        }

        if (Object.keys(expressionPage).length > 0) {
            migratedResponses.push({ sectionNumber: 2, value: expressionPage });
        }

        if (Object.keys(ethicsPage).length > 0) {
            migratedResponses.push({ sectionNumber: 3, value: ethicsPage });
        }

        return {
            ...state,
            responses: migratedResponses
        };

    }

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
                    who: "",
                    howOften: "",
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

                    // Backfilled the same way `key` is above -- any
                    // session saved before Owner/How Often existed on
                    // an SOP (see ProcessSopValue's own doc comment)
                    // simply won't have these fields at all yet.
                    who: typeof sop.who === "string" ? sop.who : "",
                    howOften: typeof sop.howOften === "string" ? sop.howOften : "",

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
        // OperationalLogRowValue fields, then re-sort. Rows left
        // over from the OLD manual-entry days (before the Log
        // became fully auto-generated) that were added via an
        // "Add row" click but never actually filled in -- no
        // date, no Process link, no description, no notes -- carry
        // zero information and are dropped outright here rather
        // than carried forward forever: they'd otherwise sort to
        // the very bottom (see sortOperationalLogRows) and render
        // as a permanent, unexplained blank row with nothing but
        // an empty Notes box, since nothing in the CURRENT app
        // ever creates or cleans up a manually-added row anymore.
        // A row with ANY real content (a date, a Process link, a
        // description, or user-written notes) is always kept.
        const rawLogRows = asRowArray(findResponse(3)?.value).filter(row => {

            const hasDate = asText(row.date).trim().length > 0;
            const hasProcessKey = asText(row.processKey).trim().length > 0;
            const hasDescription = asText(row.description).trim().length > 0;
            const hasNotes = asText(row.notes).trim().length > 0;
            const hasLegacyReason = asText(row.reason).trim().length > 0;
            const hasLegacyOutcome = asText(row.outcome).trim().length > 0;

            return hasDate || hasProcessKey || hasDescription || hasNotes || hasLegacyReason || hasLegacyOutcome;

        });

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
