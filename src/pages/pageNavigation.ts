/*
    THE PAGE MOVES (Conversation.tsx): Start Interview, a page named on the opening screen, Next and Previous (which step over a companion
    section), the page rail's jump and the way back to the Introduction; each first writes the Process Library's changes into the Operational
    Log, then saves, redraws and returns to the top. Next on the last page opens the export (the empty answers, or Export Options). Moved out
    of Conversation.tsx as they were (2026-11-11, the owner: "optimise the app and the folders"): a plain function, since they keep nothing
    of their own; Conversation.tsx calls pageNavigation on every draw. Conversation.test.tsx turns the pages.
*/
import type { InterviewSession } from "../framework/interview";
import type { ValidationIssue } from "../framework/model";
import { isCompanion } from "../framework/engine/PageGroups";
import { generateOperationalLogEntriesFromProcessLibrary, OperationalLogRowValue, ProcessRecordValue } from "../framework/engine/AnswerUtils.ts";
import { OrganizationService } from "../services/OrganizationService";
import { StorageService } from "../services/StorageService";
import { reviewManager, resolveSharedAnswerValue, validateProductDevelopmentForProduct, validateOperationsProcessOwnership, OPERATIONS_PROCESS_LIBRARY_SECTION, OPERATIONS_OPERATIONAL_LOG_SECTION, type ExportStep } from "./conversationHelpers";

/** What the page hands in: the open interview (null while it loads), the Organization, the System, and the page's ways to save, move and open the export. */
export interface PageNavigationInput {
    session: InterviewSession | null;
    organizationId: string | null;
    system: { id?: string; number?: number } | undefined;
    persistAndRedraw: (session: InterviewSession) => void;
    scrollToTop: () => void;
    setValidationIssues: (issues: ValidationIssue[]) => void;
    setExportStep: (step: ExportStep) => void;
    openExportOptions: () => void;
}

export function pageNavigation({ session, organizationId, system, persistAndRedraw, scrollToTop, setValidationIssues, setExportStep, openExportOptions }: PageNavigationInput) {

    const groupSystemNumber = system?.number;

    // Start Interview (and → on the Introduction): the System's FIRST
    // page, not the last one visited -- Continue and the rails keep
    // their own places.
    function startInterview() {

        if (!session) {
            return;
        }

        session.startInterview();
        session.goToSection(0);
        persistAndRedraw(session);
        scrollToTop();

    }

    // A page named on the opening screen: the interview, opened there.
    function startInterviewAt(index: number) {

        if (!session) {
            return;
        }

        session.startInterview();
        session.goToSection(index);
        persistAndRedraw(session);
        scrollToTop();

    }

    // The Operations System's Operational Log (Section 3) is no
    // longer independently authored -- it's auto-written FROM
    // Process Library (Section 2) itself, one entry per Process
    // that actually changed since the last time the Log was
    // updated (see generateOperationalLogEntriesFromProcessLibrary
    // in AnswerUtils.ts). The ways to leave Process Library are
    // clicking Next or Previous, or a page on the left bullet rail
    // (goToPage); goToIntroduction is only ever reachable FROM
    // Section 1 -- so this runs at the top of all three handlers
    // below, BEFORE the actual section change, comparing
    // Process Library's current response against each Process's
    // own lastLoggedSnapshot and appending any newly-generated Log
    // rows. It's a no-op (same object identity in, effectively)
    // whenever there's nothing new to log, so calling it
    // unconditionally on every page change while already
    // past Process Library, or while on a different System
    // entirely, is intentionally cheap and harmless.
    function commitProcessLibraryChangesToOperationalLog() {

        if (!session || !organizationId || system?.id !== "operations") {
            return;
        }

        if (session.getCurrentSectionNumber() !== OPERATIONS_PROCESS_LIBRARY_SECTION) {
            return;
        }

        const currentProcesses =
            (session.getResponse(OPERATIONS_PROCESS_LIBRARY_SECTION) as ProcessRecordValue[] | undefined) ?? [];

        const currentLogRows =
            (session.getResponse(OPERATIONS_OPERATIONAL_LOG_SECTION) as OperationalLogRowValue[] | undefined) ?? [];

        const { processes: updatedProcesses, logRows: updatedLogRows } =
            generateOperationalLogEntriesFromProcessLibrary(currentProcesses, currentLogRows);

        session.saveResponse(OPERATIONS_PROCESS_LIBRARY_SECTION, updatedProcesses);
        session.saveResponse(OPERATIONS_OPERATIONAL_LOG_SECTION, updatedLogRows);

    }

    function nextSection() {

        if (!session) {
            return;
        }

        commitProcessLibraryChangesToOperationalLog();

        if (session.isLastSection() || session.getCurrentSectionIndex() >= session.getSections().reduce((last, section, index) => isCompanion(groupSystemNumber, section.number) ? last : index, 0)) {

            if (organizationId) {
                StorageService.saveInterview(organizationId, session);
            }

            // The Product Development System's Sections are
            // completed once PER PRODUCT (see
            // PRODUCT_DEVELOPMENT_PER_PRODUCT_SECTIONS) -- "Finish"
            // should only require the currently selected Product's
            // own Sections (and its own row in the shared Product
            // Register) to be complete, not every OTHER Product's
            // too. See validateProductDevelopmentForProduct's own
            // comment for why this can't just reuse
            // `reviewManager.validate` as-is.
            const selectedProductForValidation =
                system?.id === "product-development" && organizationId
                    ? OrganizationService.getSelectedProductId(organizationId)
                    : undefined;

            const validation =
                selectedProductForValidation && organizationId
                    ? validateProductDevelopmentForProduct(session, organizationId, selectedProductForValidation)
                    : system?.id === "operations"
                        ? validateOperationsProcessOwnership(session)
                        : reviewManager.validate(
                            session,
                            (answer) => resolveSharedAnswerValue(organizationId, answer)
                        );

            if (!validation.valid) {
                setValidationIssues(validation.issues);
                setExportStep("warning");
            } else {
                openExportOptions();
            }

            return;

        }

        session.nextSection();
        while (isCompanion(groupSystemNumber, session.getCurrentSection().number) && !session.isLastSection()) {
            session.nextSection();
        }
        persistAndRedraw(session);
        scrollToTop();

    }

    function previousSection() {

        if (!session) {
            return;
        }

        commitProcessLibraryChangesToOperationalLog();

        if (session.previousSection()) {
            while (isCompanion(groupSystemNumber, session.getCurrentSection().number) && session.previousSection()) {
                // (A companion is not a page: on to the page it stands beside.)
            }
            persistAndRedraw(session);
            scrollToTop();
        }

    }

    // The page rail's own jump: the same bookkeeping Next and
    // Previous do (commit the Process Library, save, redraw, back
    // to the top), to any page at once.
    function goToPage(index: number) {

        if (!session || index === session.getCurrentSectionIndex()) {
            return;
        }

        commitProcessLibraryChangesToOperationalLog();

        if (session.goToSection(index)) {
            persistAndRedraw(session);
            scrollToTop();
        }

    }

    function goToIntroduction() {

        if (!session) {
            return;
        }

        session.viewIntroduction();
        persistAndRedraw(session);
        scrollToTop();

    }

    return { startInterview, startInterviewAt, nextSection, previousSection, goToPage, goToIntroduction };

}
