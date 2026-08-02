import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import InterviewHeader from "../components/interview/InterviewHeader";
import InterviewProgress from "../components/InterviewProgress";
import InterviewSection from "../components/InterviewSection";
import AnswerRenderer from "../components/interview/AnswerRenderer";

import { InterviewManager, ReviewManager } from "../framework/application";
import { InterviewSession } from "../framework/interview";
import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";
import { AnswerDefinition, ValidationIssue, ValidationResult } from "../framework/model";
import { AnswerType } from "../framework/enums/AnswerType";
import {
    CardListAnswerValue,
    defaultAnswerValue,
    generateOperationalLogEntriesFromProcessLibrary,
    isAnswerEmpty,
    isTableRowComplete,
    OperationalLogRowValue,
    processDisplayId,
    ProcessRecordValue,
    sopDisplayId,
    TableAnswerRow,
    visibleTableColumns
} from "../framework/engine/AnswerUtils.ts";
import {
    buildExportContent,
    buildMultiProductExportContent,
    buildSingleProductExportContent
} from "../framework/engine/ExportContentBuilder.ts";

import { StorageService } from "../services/StorageService";
import { OrganizationService } from "../services/OrganizationService";
import { systems } from "../data/systems";

import "../styles/conversation.css";
import "../styles/conversation-layout.css";
import "../styles/system-confirmation.css";

const interviewManager = new InterviewManager();
const reviewManager = new ReviewManager();

type ExportStep = "none" | "warning" | "options";
type CapabilityChoice = "original" | "other";

/**
 * The Product Development System's Export Options offer a choice
 * (item's follow-up request) between exporting just the currently
 * selected Product's own content, or the whole System file covering
 * every Product -- irrelevant to every other System, which only
 * ever exports "system"-scoped (the whole, single-Product-Register-
 * free document it always has).
 */
type ExportScope = "product" | "system";

/**
 * The Operations System's own Export Options offer a similar,
 * but structurally different, choice (item 7 of the same round
 * of feedback as the Process Library row-actions/ID/Shift+Click
 * work): export every Process, just a hand-picked subset of
 * Processes (each with all of its own SOPs), or a hand-picked
 * subset of individual SOPs across any Processes. Irrelevant to
 * every other System.
 */
type OperationsExportScope = "all" | "selected-processes" | "selected-sops";

/**
 * The Operations System's Process Library is always its own
 * Section 2 (Handbook is 1, Operational Log 3, Roles &
 * Responsibilities 4 -- see 08_OperationsSystemAnswer.md).
 */
const OPERATIONS_PROCESS_LIBRARY_SECTION = 2;

/**
 * The Operations System's Operational Log and Roles &
 * Responsibilities Sections -- both now read the Process Library
 * (Section 2) response directly (an entry's optional Process
 * link, and every Responsibility grouping, respectively -- see
 * OperationalLogEditor.tsx / RolesResponsibilitiesEditor.tsx), so
 * both Section numbers are needed when wiring that cross-Section
 * read into export (see handleFinalExport's own sectionBlockOptions
 * below).
 */
const OPERATIONS_OPERATIONAL_LOG_SECTION = 3;
const OPERATIONS_ROLES_SECTION = 4;

/**
 * The Business System's Product Register (Section 5) and the
 * Product Development System's Product Register (Section 1)
 * are the SAME table per Organization (item 7): adding,
 * editing, or removing a row in either one shows up in the
 * other. Everything else about each System's own Sections
 * stays completely separate (see OrganizationService /
 * item 6) -- this is the one deliberate exception.
 */
const SHARED_PRODUCT_REGISTER_BINDINGS: { systemId: string; sectionNumber: number }[] = [
    { systemId: "business", sectionNumber: 5 },
    { systemId: "product-development", sectionNumber: 1 }
];

function isSharedProductRegisterSection(systemId: string | undefined, sectionNumber: number): boolean {
    return SHARED_PRODUCT_REGISTER_BINDINGS.some(
        binding => binding.systemId === systemId && binding.sectionNumber === sectionNumber
    );
}

/**
 * The Publishing System's Content Strategy (Section 1) and the
 * Website System's Website Specification (Section 1) each carry a
 * dedicated "Target Audience" Multi-Part part (see 19_
 * PublishingSystemAnswer.md / 20_WebsiteSystemAnswer.md) that
 * shares ONE row list per Organization -- "fully shared, edit
 * anywhere": editing a row from either Section (or from the Social
 * Media System's own Audience Profiles, see
 * SOCIAL_MEDIA_AUDIENCE_PROFILES_BINDING below) updates it
 * everywhere immediately, the same "one shared table" idea as
 * SHARED_PRODUCT_REGISTER_BINDINGS above, just scoped to one part
 * of a Multi-Part Section instead of a whole Section.
 */
const SHARED_TARGET_AUDIENCE_PART_BINDINGS: { systemId: string; sectionNumber: number; partId: string }[] = [
    { systemId: "publishing", sectionNumber: 1, partId: "target-audience" },
    { systemId: "website", sectionNumber: 1, partId: "target-audience" }
];

function findSharedTargetAudiencePartBinding(
    systemId: string | undefined,
    sectionNumber: number
): { systemId: string; sectionNumber: number; partId: string } | undefined {
    return SHARED_TARGET_AUDIENCE_PART_BINDINGS.find(
        binding => binding.systemId === systemId && binding.sectionNumber === sectionNumber
    );
}

/**
 * The Social Media System's Audience Profiles (Section 1) shares
 * the SAME underlying Target Audience row list as the two bindings
 * above, but its own Table is WIDER -- only its first two data
 * columns (Name, Description) are shared; Interests/Goals/
 * Challenges stay Social-Media-specific per row. Rows are matched
 * across the shared list and this wider table by their Name text
 * (trimmed, case-insensitive) rather than a synthetic row id, the
 * same way SHARED_PRODUCT_REGISTER_BINDINGS's own Product rows are
 * matched by Product name text (see extractProductNames above) --
 * this whole codebase deliberately avoids synthetic row ids.
 */
const SOCIAL_MEDIA_AUDIENCE_PROFILES_BINDING = { systemId: "social-media", sectionNumber: 1 };

function isSocialMediaAudienceProfilesSection(systemId: string | undefined, sectionNumber: number): boolean {
    return systemId === SOCIAL_MEDIA_AUDIENCE_PROFILES_BINDING.systemId
        && sectionNumber === SOCIAL_MEDIA_AUDIENCE_PROFILES_BINDING.sectionNumber;
}

function normalizeAudienceName(value: unknown): string {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/**
 * Extracts just the shared { name, description } shape out of a
 * Target Audience Table's own rows (used both for the Publishing/
 * Website Multi-Part part, whose rows already only ever hold these
 * two columns, and for pushing Social Media's wider table's own
 * first two columns back into the shared store).
 */
function extractSharedAudienceRows(rows: unknown): TableAnswerRow[] {

    if (!Array.isArray(rows)) {
        return [];
    }

    return (rows as TableAnswerRow[]).map(row => ({
        name: typeof row?.name === "string" ? row.name : "",
        description: typeof row?.description === "string" ? row.description : ""
    }));

}

/**
 * Reconciles the Social Media System's own wider Audience Profiles
 * rows against the shared Target Audience list -- every shared
 * audience appears, in the shared list's own order, with its Name/
 * Description kept in sync; each row's own Interests/Goals/
 * Challenges are carried over from whichever LOCAL row already had
 * that same Name (case-insensitive), or start blank for an audience
 * newly added elsewhere. Any local row whose Name doesn't (yet)
 * appear in the shared list at all is appended as-is, rather than
 * silently discarded, so typing a brand new audience directly into
 * Social Media never loses data even before its first save round-
 * trips it into the shared store (see handleAnswerChange). Falls
 * back to the local rows unchanged when the shared list is empty
 * (a brand new Organization nobody has entered a Target Audience
 * for yet) so this Table still starts with its usual "at least one
 * row" default instead of an empty table.
 */
function mergeSharedAudienceIntoSocialMediaRows(sharedRows: unknown, localRows: unknown): TableAnswerRow[] {

    const shared = Array.isArray(sharedRows) ? sharedRows as TableAnswerRow[] : [];
    const local = Array.isArray(localRows) ? localRows as TableAnswerRow[] : [];

    if (shared.length === 0) {
        return local;
    }

    const usedLocalIndexes = new Set<number>();

    const merged: TableAnswerRow[] = shared.map(sharedRow => {

        const sharedName = typeof sharedRow.name === "string" ? sharedRow.name : "";

        const matchIndex = local.findIndex(
            (candidate, index) =>
                !usedLocalIndexes.has(index) && normalizeAudienceName(candidate.name) === normalizeAudienceName(sharedName)
        );

        const matched = matchIndex >= 0 ? local[matchIndex] : undefined;

        if (matchIndex >= 0) {
            usedLocalIndexes.add(matchIndex);
        }

        return {
            name: sharedName,
            description: typeof sharedRow.description === "string" ? sharedRow.description : "",
            interests: matched?.interests ?? "",
            goals: matched?.goals ?? "",
            challenges: matched?.challenges ?? ""
        };

    });

    local.forEach((row, index) => {

        if (usedLocalIndexes.has(index)) {
            return;
        }

        if (normalizeAudienceName(row.name).length === 0) {
            return;
        }

        merged.push(row);

    });

    return merged;

}

/**
 * The Product Development System's Sections 2-7 (Product
 * Validation through Product Review) are answered once PER
 * Product, not once per System (see OrganizationService.
 * productAnswers) -- exporting this System needs to include
 * every Product's own answers for these Sections, not just
 * whichever Product happens to be selected right now.
 */
const PRODUCT_DEVELOPMENT_PER_PRODUCT_SECTIONS = new Set([2, 3, 4, 5, 6, 7]);

/**
 * Pulls every non-blank "Product" cell out of the shared
 * Product Register's rows, de-duplicated -- used to populate
 * the Product Development System's product picker (item 7).
 * Rows are matched by their Product name text rather than a
 * synthetic row id, the same way `resolveDynamicOptions`
 * below matches Sections/Cards by title text.
 */
function extractProductNames(rows: unknown): string[] {

    if (!Array.isArray(rows)) {
        return [];
    }

    const names = rows
        .map(row => {
            if (!row || typeof row !== "object") {
                return "";
            }
            const value = (row as Record<string, unknown>)["product"];
            return typeof value === "string" ? value.trim() : "";
        })
        .filter(name => name.length > 0);

    return Array.from(new Set(names));

}

/**
 * Resolves a `TableColumnDefinition.dynamicSource`'s live option
 * list against a source Section's own Answer Definition + current
 * response, regardless of which underlying answer structure that
 * Section actually uses (item's "3rd column Revenue Stream" /
 * Financial Risk "Risk" column follow-up).
 *
 * Supports three shapes, matched by the source Section's own
 * `answer.type`:
 *
 * - Card List: the original, pre-existing behaviour -- finds the
 *   named card (by normalized title) and returns its items' non-
 *   blank text, de-duplicated. (E.g. Business System's Revenue
 *   Model, Section 3, "Revenue Stream" card.)
 * - Table: finds the named column (by normalized title) and
 *   returns that column's own non-blank cell values across every
 *   row, de-duplicated. (E.g. Stakeholder Register pulling from
 *   Stakeholder Categories' "Category" column.)
 * - Multi-Part: recurses into each part's own answer/value in
 *   turn, returning the first part that yields any options. This
 *   is what lets Financial Risk's Evaluation/Mitigation Measures/
 *   Contingency Plan parts each source their shared "Risk" column
 *   from their own sibling Description part, all four parts living
 *   inside the very same Section.
 *
 * Any other answer type (or a card/column/part title that doesn't
 * match) yields no options -- callers already treat an empty list
 * as "nothing entered yet" rather than an error.
 */
function extractDynamicOptions(
    answer: AnswerDefinition,
    value: unknown,
    cardTitle: string,
    normalize: (text: string) => string
): string[] {

    switch (answer.type) {

        case AnswerType.CardList: {

            const card = (answer.cards ?? []).find(
                candidate => normalize(candidate.title) === normalize(cardTitle)
            );

            if (!card) {
                return [];
            }

            const values = (value ?? {}) as CardListAnswerValue;
            const items = values[card.id] ?? [];

            const texts = items
                .map(item => (typeof item.text === "string" ? item.text.trim() : ""))
                .filter(text => text.length > 0);

            return Array.from(new Set(texts));

        }

        case AnswerType.Table: {

            const column = (answer.table?.columns ?? []).find(
                candidate => normalize(candidate.title) === normalize(cardTitle)
            );

            if (!column) {
                return [];
            }

            const rows = Array.isArray(value) ? (value as TableAnswerRow[]) : [];

            const texts = rows
                .map(row => {
                    const cell = row[column.id];
                    return typeof cell === "string" ? cell.trim() : "";
                })
                .filter(text => text.length > 0);

            return Array.from(new Set(texts));

        }

        case AnswerType.MultiPart: {

            const values = (value ?? {}) as Record<string, unknown>;

            for (const part of answer.parts ?? []) {
                const options = extractDynamicOptions(part.answer, values[part.id], cardTitle, normalize);
                if (options.length > 0) {
                    return options;
                }
            }

            return [];

        }

        default:
            return [];

    }

}

/**
 * Validates a Product Development System Interview Session scoped
 * to a single, currently-selected Product -- rather than
 * `reviewManager.validate` (InterviewValidator), which checks the
 * shared Product Register (Section 1) as a WHOLE Table (every row,
 * every column, of every Product) and Sections 2-7 via whatever the
 * Session's own `responses` happen to hold (only reliable for
 * whichever Product was selected the last time each Section was
 * visited -- see the loading effect above).
 *
 * Section 1 only requires THIS Product's own row to be complete
 * (every visible column filled) -- some OTHER Product's row being
 * unfinished shouldn't block finishing THIS Product's interview.
 * Sections 2-7 are read straight from OrganizationService's
 * per-Product storage (the authoritative source, regardless of
 * which Sections the Session happens to have visited for this
 * Product) rather than from `session.getResponse`.
 */
function validateProductDevelopmentForProduct(
    session: InterviewSession,
    organizationId: string,
    productName: string
): ValidationResult {

    const framework = session.getFramework();
    const issues: ValidationIssue[] = [];

    for (const section of framework.sections) {

        if (section.number === 1) {

            const rows = Array.isArray(session.getResponse(1))
                ? session.getResponse(1) as TableAnswerRow[]
                : [];

            const row = rows.find(candidate => {
                const name = candidate["product"];
                return typeof name === "string" && name.trim() === productName;
            });

            const columns = visibleTableColumns(section.answer.table?.columns ?? []);
            const complete = !!row && isTableRowComplete(columns, row);

            if (!complete) {
                issues.push({ sectionNumber: section.number, sectionTitle: section.title });
            }

            continue;

        }

        if (PRODUCT_DEVELOPMENT_PER_PRODUCT_SECTIONS.has(section.number)) {

            const value = OrganizationService.getProductSectionResponse(
                organizationId,
                productName,
                section.number
            );

            if (isAnswerEmpty(section.answer, value)) {
                issues.push({ sectionNumber: section.number, sectionTitle: section.title });
            }

            continue;

        }

        // Fallback for any Section that is neither the shared
        // Product Register nor one of the per-Product Sections --
        // shouldn't normally occur for this System, but checked the
        // same way `reviewManager.validate` would as a safety net.
        if (isAnswerEmpty(section.answer, session.getResponse(section.number))) {
            issues.push({ sectionNumber: section.number, sectionTitle: section.title });
        }

    }

    return { valid: issues.length === 0, issues };

}

/**
 * Validates an Operations System Interview Session the same way
 * `reviewManager.validate` (InterviewValidator) does -- every
 * Section has SOME content -- plus one extra, Operations-specific
 * rule: once a Process has grown to 2+ SOPs, its Owner can no
 * longer be blank.
 *
 * A single-SOP Process is still simple enough that "whoever wrote
 * it down" is usually obvious; once a second SOP exists, the
 * Process is being run by more than one procedure (very often more
 * than one person too), and an unset Owner is exactly the kind of
 * silent gap that only becomes a problem once someone else actually
 * needs to know who to ask. Doesn't block a Process with 0/1 SOP
 * from having a blank Owner -- that's still a legitimate, simple
 * "not assigned yet" state for a Process that hasn't grown into
 * needing one.
 */
function validateOperationsProcessOwnership(
    session: InterviewSession
): ValidationResult {

    const baseline = reviewManager.validate(session);

    const alreadyFlagged = baseline.issues.some(
        issue => issue.sectionNumber === OPERATIONS_PROCESS_LIBRARY_SECTION
    );

    if (alreadyFlagged) {
        // Section 2 is already flagged incomplete for a more basic
        // reason (e.g. no content at all) -- no need for a second,
        // more specific issue for the same Section.
        return baseline;
    }

    const framework = session.getFramework();

    const processLibrarySection = framework.sections.find(
        candidate => candidate.number === OPERATIONS_PROCESS_LIBRARY_SECTION
    );

    if (!processLibrarySection) {
        return baseline;
    }

    const processes =
        (session.getResponse(OPERATIONS_PROCESS_LIBRARY_SECTION) as ProcessRecordValue[] | undefined) ?? [];

    const hasUnownedMultiSopProcess = processes.some(process => {

        const sopCount = Array.isArray(process.sops) ? process.sops.length : 0;
        const owned = typeof process.who === "string" && process.who.trim().length > 0;

        return sopCount >= 2 && !owned;

    });

    if (!hasUnownedMultiSopProcess) {
        return baseline;
    }

    return {
        valid: false,
        issues: [
            ...baseline.issues,
            { sectionNumber: OPERATIONS_PROCESS_LIBRARY_SECTION, sectionTitle: processLibrarySection.title }
        ]
    };

}

/**
 * Splits a block of introduction text into one
 * sentence per entry, so the introduction can be
 * rendered as one short paragraph per sentence
 * instead of one large block of text.
 */
function splitIntoSentences(text: string): string[] {

    const collapsed = text.replace(/\s+/g, " ").trim();

    if (collapsed.length === 0) {
        return [];
    }

    const matches = collapsed.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);

    if (!matches) {
        return [collapsed];
    }

    return matches
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0);

}

export default function Conversation() {

    const location = useLocation();
    const navigate = useNavigate();

    const system = location.state?.system;

    // Set only by the Organization Calendar's own "Open →" link on
    // a task (see OrganizationCalendarPanel.tsx / SystemSelection.
    // tsx's `openTask`) -- jumps the freshly (re)loaded session
    // straight to this Section instead of wherever it was last
    // left, without disturbing any other Section's saved answer.
    // Sections are numbered from 1 (matches the "N. Section Title"
    // heading and the Calendar's own "8.2"-style origin label);
    // `goToSection` itself is 0-based.
    const targetSectionNumber: number | undefined = location.state?.targetSectionNumber;

    // Every Interview Session now belongs to a specific
    // Organization (see OrganizationService / item 6) -- read
    // once on mount since the Landing page is the only place
    // the selected Organization changes.
    const [organizationId] = useState<string | null>(() => OrganizationService.getSelected());
    const organizationName = organizationId
        ? OrganizationService.getSummary(organizationId)?.name ?? ""
        : "";

    const [session, setSession] = useState<InterviewSession | null>(null);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [, refresh] = useState(0);

    // Export flow -- replaces the old, separate Review/Validation
    // page. Pressing "Finish" on the last Section validates the
    // Interview inline and opens one of these popups instead of
    // navigating away.
    const [exportStep, setExportStep] = useState<ExportStep>("none");
    const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
    const [capabilityChoice, setCapabilityChoice] = useState<CapabilityChoice>("original");
    const [otherCapabilityName, setOtherCapabilityName] = useState("");
    const [includeMd, setIncludeMd] = useState(true);
    const [includePdf, setIncludePdf] = useState(false);

    // Defaults to "system" (the whole file, every Product) so
    // behavior is unchanged for anyone who doesn't touch this new
    // choice -- that was the ONLY export shape the Product
    // Development System produced before this option existed.
    const [exportScope, setExportScope] = useState<ExportScope>("system");

    // Defaults to "all" (every Process, exactly as before this
    // option existed) -- the picker below only appears once a
    // narrower scope is chosen. Both selection Sets are ephemeral
    // (index-keyed, not persisted into the saved Process Library
    // answer) and reset every time the Export Options dialog is
    // reopened, so a stale pick from a previous export can't
    // silently narrow a later one.
    const [operationsExportScope, setOperationsExportScope] = useState<OperationsExportScope>("all");
    const [selectedProcessIndexes, setSelectedProcessIndexes] = useState<Set<number>>(new Set());
    const [selectedSopKeys, setSelectedSopKeys] = useState<Set<string>>(new Set());

    // Escape acts as "Back" everywhere in the app: first close
    // whichever popup is currently open (here, the Export flow's
    // own two-step dialog), and only once nothing is open anymore
    // does it fall through to the same navigation the footer's own
    // "Back" link performs.
    useEffect(() => {

        function handleKeyDown(event: KeyboardEvent) {

            if (event.key !== "Escape") {
                return;
            }

            if (exportStep !== "none") {
                setExportStep("none");
                return;
            }

            navigate("/assistant");

        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);

    }, [exportStep, navigate]);

    useEffect(() => {

        if (!organizationId) {
            setLoadingError("No Organization selected.");
            return;
        }

        if (!system) {
            setLoadingError("No Framework System selected.");
            return;
        }

        try {
            // Resume a previously saved Interview Session for this
            // same Organization + System (e.g. after a page reload),
            // rather than discarding the user's progress. Each
            // Organization keeps its own saved state per System (see
            // OrganizationService / item 6), so switching Systems --
            // or switching Organizations -- always resumes the right
            // Interview instead of a different one's.
            const savedSession = StorageService.loadInterview(organizationId, system.number);

            const loadedSession = savedSession ?? interviewManager.create(system.id);

            if (targetSectionNumber !== undefined) {
                loadedSession.goToSection(targetSectionNumber - 1);
                StorageService.saveInterview(organizationId, loadedSession);
            }

            setSession(loadedSession);
        } catch (error) {
            setLoadingError(
                error instanceof Error
                    ? error.message
                    : "Failed to load Framework."
            );
        }

        // Every answer edit debounces its actual localStorage write
        // (see OrganizationService's DebouncedLocalStorage) so typing
        // doesn't pay a full-document read-parse-write on every
        // keystroke -- flushing here on cleanup (leaving this System,
        // switching Organizations, or unmounting entirely) guarantees
        // the last edit is on disk before we navigate away, on top of
        // the page unload/hide safety net OrganizationService already
        // registers for closing the app outright.
        return () => {
            OrganizationService.flushPendingWrites();
        };

    }, [system, organizationId, targetSectionNumber]);

    // The Business System's Product Register (Section 5) and the
    // Product Development System's Product Register (Section 1)
    // share one row list per Organization (see
    // SHARED_PRODUCT_REGISTER_BINDINGS above). Landing on either
    // one pulls in the latest shared rows -- in case the OTHER
    // System changed them since this Session was last saved --
    // before anything renders, rather than showing a possibly
    // stale copy from this Session's own last save.
    //
    // Separately, the Product Development System's Sections 2-7
    // (Product Validation through Product Review) each have their
    // OWN answers per Product, not one shared answer for whichever
    // Product happened to be selected last -- so landing on any of
    // those Sections swaps in the CURRENTLY selected Product's own
    // saved answers (or a blank one, if that Product has none yet).
    useEffect(() => {

        if (!session || !organizationId || !system) {
            return;
        }

        const sectionNumber = session.getCurrentSectionNumber();

        if (isSharedProductRegisterSection(system.id, sectionNumber)) {

            const sharedProducts = OrganizationService.getProducts(organizationId);

            session.saveResponse(sectionNumber, sharedProducts);
            StorageService.saveInterview(organizationId, session);
            redraw();

            return;

        }

        // Publishing System's Content Strategy / Website System's
        // Website Specification -- swap in the shared Target
        // Audience rows for just this Section's own "target-
        // audience" Multi-Part part, leaving every other part of
        // the Section (Content Goals, Website Purpose, etc.) as
        // this Session already had it.
        const targetAudiencePartBinding = findSharedTargetAudiencePartBinding(system.id, sectionNumber);

        if (targetAudiencePartBinding) {

            const sharedAudiences = OrganizationService.getTargetAudiences(organizationId);

            const currentValue = session.getResponse(sectionNumber);

            const currentParts: Record<string, unknown> =
                currentValue && typeof currentValue === "object" && !Array.isArray(currentValue)
                    ? currentValue as Record<string, unknown>
                    : {};

            session.saveResponse(sectionNumber, {
                ...currentParts,
                [targetAudiencePartBinding.partId]: sharedAudiences
            });

            StorageService.saveInterview(organizationId, session);
            redraw();

            return;

        }

        // Social Media System's own Audience Profiles -- same
        // shared Target Audience list, reconciled into this
        // Section's own WIDER table (see
        // mergeSharedAudienceIntoSocialMediaRows above).
        if (isSocialMediaAudienceProfilesSection(system.id, sectionNumber)) {

            const sharedAudiences = OrganizationService.getTargetAudiences(organizationId);
            const currentRows = session.getResponse(sectionNumber);

            const merged = mergeSharedAudienceIntoSocialMediaRows(sharedAudiences, currentRows);

            session.saveResponse(sectionNumber, merged);
            StorageService.saveInterview(organizationId, session);

            // Any locally-only audience (typed directly into Social
            // Media, not yet reflected in the shared store) round-
            // trips into the shared store right away too, so
            // Publishing/Website see it without waiting for a
            // further edit here.
            OrganizationService.saveTargetAudiences(organizationId, extractSharedAudienceRows(merged));

            redraw();

            return;

        }

        if (system.id === "product-development" && sectionNumber >= 2) {

            const selected = OrganizationService.getSelectedProductId(organizationId);

            if (!selected) {
                return;
            }

            const sectionDefinition = session.getFramework().sections.find(
                candidate => candidate.number === sectionNumber
            );

            if (!sectionDefinition) {
                return;
            }

            const stored = OrganizationService.getProductSectionResponse(
                organizationId,
                selected,
                sectionNumber
            );

            const value = stored ?? defaultAnswerValue(sectionDefinition.answer);

            session.saveResponse(sectionNumber, value);
            StorageService.saveInterview(organizationId, session);
            redraw();

        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, organizationId, system, session?.getCurrentSectionIndex()]);

    function redraw() {
        refresh(value => value + 1);
    }

    function persistAndRedraw(currentSession: InterviewSession) {
        if (organizationId) {
            StorageService.saveInterview(organizationId, currentSession);
        }
        redraw();
    }

    // Every Section/Introduction change should present the new
    // page starting at its top, rather than keeping whatever
    // scroll position the previous (possibly taller) Section left
    // the window at.
    function scrollToTop() {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    function startInterview() {

        if (!session) {
            return;
        }

        session.startInterview();
        persistAndRedraw(session);
        scrollToTop();

    }

    // The Operations System's Operational Log (Section 3) is no
    // longer independently authored -- it's auto-written FROM
    // Process Library (Section 2) itself, one entry per Process
    // that actually changed since the last time the Log was
    // updated (see generateOperationalLogEntriesFromProcessLibrary
    // in AnswerUtils.ts). The only two ways to leave Process
    // Library are clicking Next or Previous (session.goToSection
    // is never called anywhere, and goToIntroduction is only ever
    // reachable FROM Section 1) -- so this runs at the top of both
    // handlers below, BEFORE the actual section change, comparing
    // Process Library's current response against each Process's
    // own lastLoggedSnapshot and appending any newly-generated Log
    // rows. It's a no-op (same object identity in, effectively)
    // whenever there's nothing new to log, so calling it
    // unconditionally on every Next/Previous click while already
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

        if (session.isLastSection()) {

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
                        : reviewManager.validate(session);

            if (!validation.valid) {
                setValidationIssues(validation.issues);
                setExportStep("warning");
            } else {
                openExportOptions();
            }

            return;

        }

        session.nextSection();
        persistAndRedraw(session);
        scrollToTop();

    }

    function previousSection() {

        if (!session) {
            return;
        }

        commitProcessLibraryChangesToOperationalLog();

        if (session.previousSection()) {
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

    // Stabilized so this is the SAME function reference across a
    // keystroke-driven re-render triggered by editing THIS field --
    // this is <AnswerRenderer>'s `onChange` prop, which flows all the
    // way down into <DynamicTable> for Table Sections; a fresh
    // closure every render would defeat DynamicTable's own
    // `React.memo` (see DynamicTable.tsx) every single time, since
    // `onChange` identity is one of its compared props. `persistAndRedraw`
    // is deliberately left out of the dependency list: it only closes
    // over `organizationId` (already a dependency here) and the
    // stable `refresh` state setter, so calling whichever instance of
    // it happened to be in scope when this callback was last built is
    // behaviorally identical to calling the latest one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleAnswerChange = useCallback((value: unknown) => {

        if (!session) {
            return;
        }

        session.saveCurrentResponse(value);

        if (organizationId && system) {

            const sectionNumber = session.getCurrentSectionNumber();

            const targetAudiencePartBinding = findSharedTargetAudiencePartBinding(system.id, sectionNumber);

            if (isSharedProductRegisterSection(system.id, sectionNumber)) {

                OrganizationService.saveProducts(organizationId, Array.isArray(value) ? value : []);

            } else if (targetAudiencePartBinding) {

                const parts: Record<string, unknown> =
                    value && typeof value === "object" && !Array.isArray(value)
                        ? value as Record<string, unknown>
                        : {};

                OrganizationService.saveTargetAudiences(
                    organizationId,
                    extractSharedAudienceRows(parts[targetAudiencePartBinding.partId])
                );

            } else if (isSocialMediaAudienceProfilesSection(system.id, sectionNumber)) {

                OrganizationService.saveTargetAudiences(
                    organizationId,
                    extractSharedAudienceRows(value)
                );

            } else if (system.id === "product-development" && sectionNumber >= 2) {

                const selected = OrganizationService.getSelectedProductId(organizationId);

                if (selected) {
                    OrganizationService.saveProductSectionResponse(
                        organizationId,
                        selected,
                        sectionNumber,
                        value
                    );
                }

            }

        }

        persistAndRedraw(session);

    }, [session, organizationId, system]);

    // Resolves a Table column's live dropdown options from another
    // Section's response (see TableColumnDefinition.dynamicSource) --
    // e.g. a "Revenue Stream" column whose choices should always
    // match whatever the user has entered under the Revenue Model
    // Section's "Revenue Stream" card, or a "Stakeholder" column
    // whose choices should always match the Stakeholder Register
    // Table's own "Stakeholder" column. Matched by normalized title
    // text, the same way Questions/Answers Sections are matched to
    // each other -- and the same "Section: Card" markdown syntax
    // works whether the source is a Card List's card, a Table's
    // column, or (recursing one level) a named part of a Multi-Part
    // Section's own Table/Card List part, so a System's Answer
    // Definition never needs to say which kind of source it's
    // pointing at.
    //
    // `systemTitle`, when present, points at a Section of a
    // DIFFERENT System than the one this session is currently
    // interviewing (e.g. Finance System's Revenue Streams column
    // sourcing its options from the Business System's Revenue
    // Model). That other System's own saved Interview state is
    // read directly through StorageService/OrganizationService --
    // never through `session`, which only ever holds the CURRENT
    // System's Sections/responses -- falling back to that System's
    // freshly-parsed (still response-free) Framework when it has
    // never been opened for this Organization yet, so a not-yet-
    // started System just yields no options rather than an error.
    //
    // Declared here (alongside handleAnswerChange, BEFORE the
    // loadingError/!session early returns below) rather than closer
    // to where `framework`/`currentSection` already exist post-guard,
    // specifically so this can be a real `useCallback` -- React
    // requires every hook to run in the same order on every render,
    // and a hook placed after an early `return` would only run on
    // SOME renders. Guards on `session` itself instead, mirroring
    // handleAnswerChange's own internal check just above. Stabilized
    // on `session`/`organizationId` (a session's Framework, and
    // therefore its Sections, are the same object reference for the
    // session's whole lifetime) so this is <AnswerRenderer>'s
    // `resolveDynamicOptions` prop stays a stable reference across a
    // keystroke-driven re-render too -- both for the `tableColumns`
    // memo inside AnswerRenderer.tsx and, through it, <DynamicTable>'s
    // own `React.memo`.
    const resolveDynamicOptions = useCallback((
        systemTitle: string | undefined,
        sectionTitle: string,
        cardTitle: string
    ): string[] => {

        if (!session) {
            return [];
        }

        const normalize = (text: string) => text.trim().toLowerCase();

        const currentFramework = session.getFramework();

        const isCrossSystem = systemTitle
            && normalize(systemTitle) !== normalize(currentFramework.metadata.systemName ?? "");

        if (!isCrossSystem) {

            const sourceSection = currentFramework.sections.find(
                candidate => normalize(candidate.title) === normalize(sectionTitle)
            );

            if (!sourceSection) {
                return [];
            }

            const response = session.getResponse(sourceSection.number);

            return extractDynamicOptions(sourceSection.answer, response, cardTitle, normalize);

        }

        const otherSystem = systems.find(candidate => normalize(candidate.title) === normalize(systemTitle ?? ""));

        if (!otherSystem) {
            return [];
        }

        const otherFramework = frameworkRegistry.getFramework(otherSystem.id);

        const sourceSection = otherFramework.sections.find(
            candidate => normalize(candidate.title) === normalize(sectionTitle)
        );

        if (!sourceSection) {
            return [];
        }

        const otherSession = organizationId
            ? StorageService.loadInterview(organizationId, otherSystem.number)
            : null;

        const response = otherSession ? otherSession.getResponse(sourceSection.number) : undefined;

        return extractDynamicOptions(sourceSection.answer, response, cardTitle, normalize);

    }, [session, organizationId]);

    // Stabilized (rather than a plain function redeclared every
    // render) for the same reason as resolveDynamicOptions above --
    // this feeds into the Product Register Table's `rowSelection`
    // prop (see productRegisterRowSelection further below). Declared
    // here, before the early returns, for the same Rules-of-Hooks
    // reason. Doesn't touch `session` at all (only `organizationId`),
    // so no internal guard is needed beyond the existing one.
    const selectProduct = useCallback((name: string) => {

        if (!organizationId) {
            return;
        }

        OrganizationService.setSelectedProductId(organizationId, name);
        redraw();

    }, [organizationId]);

    function openExportOptions() {

        // Reset the Operations System's own picker every time the
        // dialog opens, rather than only on mount -- otherwise a
        // scope/selection left over from a previous export (of a
        // since-edited Process Library) could silently narrow a
        // later "export everything" attempt.
        setOperationsExportScope("all");
        setSelectedProcessIndexes(new Set());
        setSelectedSopKeys(new Set());

        setExportStep("options");

    }

    function handleContinueToOptions() {

        openExportOptions();

    }

    function toggleSelectedProcess(processIndex: number) {

        setSelectedProcessIndexes(current => {
            const next = new Set(current);
            if (next.has(processIndex)) {
                next.delete(processIndex);
            } else {
                next.add(processIndex);
            }
            return next;
        });

    }

    function toggleSelectedSop(processIndex: number, sopIndex: number) {

        const key = `${processIndex}:${sopIndex}`;

        setSelectedSopKeys(current => {
            const next = new Set(current);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });

    }

    function handleFinalExport() {

        if (!session) {
            return;
        }

        const framework = session.getFramework();

        const capabilityLabel =
            capabilityChoice === "original"
                ? framework.metadata.capability
                : otherCapabilityName;

        const exportContent =
            system?.id === "product-development" && organizationId
                ? (() => {

                      // One document load for the whole export, rather than
                      // one per (Product, Section) pair -- OrganizationService.
                      // getProductSectionResponse alone would re-parse the
                      // entire Organization document from localStorage once
                      // per lookup here.
                      const allProductAnswers =
                          OrganizationService.getAllProductSectionResponses(organizationId);

                      const getProductSectionResponse = (productName: string, sectionNumber: number) =>
                          allProductAnswers[productName]?.[String(sectionNumber)] ?? null;

                      // "This Product only" (exportScope === "product"): the
                      // shared Product Register (Section 1) narrowed down to
                      // just the selected Product's own row, followed by that
                      // Product's own Sections 2-7 -- everything flattened
                      // into one document, no Product-heading grouping, since
                      // there's only one Product's worth of content here.
                      const selectedProductId =
                          exportScope === "product"
                              ? OrganizationService.getSelectedProductId(organizationId)
                              : undefined;

                      if (selectedProductId) {

                          return buildSingleProductExportContent(
                              session,
                              capabilityLabel,
                              selectedProductId,
                              PRODUCT_DEVELOPMENT_PER_PRODUCT_SECTIONS,
                              getProductSectionResponse,
                              (sectionNumber, response) => {

                                  if (sectionNumber !== 1 || !Array.isArray(response)) {
                                      return response;
                                  }

                                  return (response as TableAnswerRow[]).filter(row => {
                                      const name = row["product"];
                                      return typeof name === "string" && name.trim() === selectedProductId;
                                  });

                              }
                          );

                      }

                      // "Whole System" (exportScope === "system", or no
                      // Product selected): the Product Register in full,
                      // followed by EVERY Product's own Sections 2-7,
                      // grouped one Product at a time (see
                      // buildMultiProductExportContent) -- unchanged from
                      // before this option existed.
                      return buildMultiProductExportContent(
                          session,
                          capabilityLabel,
                          extractProductNames(session.getResponse(1)),
                          PRODUCT_DEVELOPMENT_PER_PRODUCT_SECTIONS,
                          getProductSectionResponse
                      );

                  })()
                : system?.id === "operations"
                ? (() => {

                      // The FULL, unfiltered Process Library, with every
                      // Process/SOP's already-displayed ID (custom or
                      // auto-generated from its ORIGINAL position) stamped
                      // on -- shared by Section 2's own scope-filtered
                      // export below AND, unfiltered, by Sections 3/4's
                      // cross-reference (see BuildAnswerBlocksOptions.
                      // processLibrary): an Operational Log entry or a
                      // Roles & Responsibilities grouping should resolve
                      // against every actual Process, regardless of which
                      // subset the user chose to show under Section 2
                      // itself -- choosing "Selected Processes" narrows
                      // what Section 2 lists, it doesn't mean a Log entry
                      // pointing at an excluded Process should go blank.
                      const allProcessesRaw =
                          (session.getResponse(OPERATIONS_PROCESS_LIBRARY_SECTION) as ProcessRecordValue[] | undefined) ?? [];

                      const stampedAllProcesses = allProcessesRaw.map((process, processIndex) => ({
                          ...process,
                          id: processDisplayId(allProcessesRaw, processIndex),
                          sops: process.sops.map((sop, sopIndex) => ({
                              ...sop,
                              id: sopDisplayId(process.sops, sopIndex)
                          }))
                      }));

                      return buildExportContent(
                          session,
                          capabilityLabel,
                          (sectionNumber, response) => {

                              if (sectionNumber !== OPERATIONS_PROCESS_LIBRARY_SECTION || !Array.isArray(response)) {
                                  return response;
                              }

                              if (operationsExportScope === "selected-processes") {
                                  return stampedAllProcesses.filter((_, processIndex) => selectedProcessIndexes.has(processIndex));
                              }

                              if (operationsExportScope === "selected-sops") {

                                  // Keep only the Processes with at least 1
                                  // selected SOP, and within those, only the
                                  // SOPs the user actually ticked.
                                  return stampedAllProcesses
                                      .map((process, processIndex) => ({
                                          ...process,
                                          sops: process.sops.filter((_sop, sopIndex) =>
                                              selectedSopKeys.has(`${processIndex}:${sopIndex}`)
                                          )
                                      }))
                                      .filter(process => process.sops.length > 0);

                              }

                              return stampedAllProcesses;

                          },
                          (sectionNumber) => {

                              if (sectionNumber === OPERATIONS_PROCESS_LIBRARY_SECTION) {

                                  // The response this Section exports (see
                                  // above) is always `stampedAllProcesses`
                                  // (or a filtered subset of it), whose
                                  // `.id` fields already hold the FINAL
                                  // computed display ID, not raw initials
                                  // -- idsPreResolved tells the export
                                  // block to use them as-is rather than
                                  // recomputing (see its own doc comment
                                  // on BuildAnswerBlocksOptions).
                                  return {
                                      idsPreResolved: true,
                                      forceExpandProcessSops: operationsExportScope === "selected-sops"
                                  };

                              }

                              if (sectionNumber === OPERATIONS_OPERATIONAL_LOG_SECTION || sectionNumber === OPERATIONS_ROLES_SECTION) {

                                  // Unlike the Process Library Section's own
                                  // export above, resolveProcessLogLabel/
                                  // resolveProcessId (used to cross-
                                  // reference a Process from here) compute
                                  // the display ID themselves from raw
                                  // initials -- so this needs the RAW,
                                  // unstamped list, not `stampedAllProcesses`
                                  // (which would double-append a suffix on
                                  // top of the already-final one).
                                  return { processLibrary: allProcessesRaw };

                              }

                              return undefined;

                          }
                      );

                  })()
                : undefined;

        if (includeMd) {
            reviewManager.exportMarkdown(session, capabilityLabel, exportContent);
        }

        if (includePdf) {
            reviewManager.exportPdf(session, capabilityLabel, exportContent);
        }

        setExportStep("none");

    }

    if (loadingError) {
        return <div>{loadingError}</div>;
    }

    if (!session) {
        return <div>Loading...</div>;
    }

    const framework = session.getFramework();
    const introduction = framework.introduction;
    const currentSection = session.getCurrentSection();

    const showIntroduction = !session.hasStartedInterview();

    const canConfirmCapability =
        capabilityChoice === "original" || otherCapabilityName.trim().length > 0;

    // A narrowed Operations export scope needs at least 1 picked
    // Process/SOP to actually produce anything -- otherwise "Export"
    // would silently hand back an empty document.
    const hasValidOperationsSelection =
        operationsExportScope === "all" ||
        (operationsExportScope === "selected-processes" && selectedProcessIndexes.size > 0) ||
        (operationsExportScope === "selected-sops" && selectedSopKeys.size > 0);

    const canExport = (includeMd || includePdf) && hasValidOperationsSelection;

    // Product Development System product picker (item 7): Section
    // 1 (Product Register) requires picking one of its own rows
    // before "Next" unlocks; Sections 2-7 then show that Product's
    // name under their own title (see InterviewSection's subtitle).
    const isProductDevelopmentSystem = system?.id === "product-development";
    const isProductRegisterStep = isProductDevelopmentSystem && currentSection.number === 1;

    const productNames = isProductDevelopmentSystem
        ? extractProductNames(session.getResponse(1))
        : [];

    const storedSelectedProductId = organizationId
        ? OrganizationService.getSelectedProductId(organizationId)
        : undefined;

    const selectedProductName =
        storedSelectedProductId && productNames.includes(storedSelectedProductId)
            ? storedSelectedProductId
            : undefined;

    const showProductSubtitle =
        isProductDevelopmentSystem && currentSection.number >= 2 && !!selectedProductName;

    const nextDisabled = isProductRegisterStep && !selectedProductName;

    // Operations System export scope picker (item 7): the Process
    // Library's own saved Processes/SOPs, read fresh every render
    // so the Export Options dialog always reflects whatever was
    // last saved -- not a stale snapshot from when the dialog first
    // opened.
    const isOperationsSystem = system?.id === "operations";
    const operationsProcesses: ProcessRecordValue[] = isOperationsSystem
        ? ((session.getResponse(OPERATIONS_PROCESS_LIBRARY_SECTION) as ProcessRecordValue[] | undefined) ?? [])
        : [];

    // Owner autofill suggestions for the Process Library (see
    // ProcessLibraryEditor's own `ownerSuggestions` prop): every
    // distinct Owner name ALREADY typed on some other Process --
    // the same Excel-style "suggest what's already been typed
    // elsewhere in this same column" pattern DynamicTable's own
    // "autofill" column type uses, just computed here since
    // Process Library is a bespoke editor, not a DynamicTable.
    // Roles & Responsibilities is no longer a source for this --
    // that Section is now itself DERIVED from Process Library's
    // Owner field (see RolesResponsibilitiesEditor.tsx), so
    // sourcing suggestions from it would be circular.
    const operationsOwnerSuggestions: string[] = isOperationsSystem
        ? Array.from(new Set(
              operationsProcesses
                  .map(process => process.who.trim())
                  .filter(name => name.length > 0)
          ))
        : [];

    // Lets the Product Register table (Section 1) double as the
    // Product picker: clicking a row, or its selection bullet under
    // the "#" column, selects that row's Product -- replacing the
    // separate ProductSelector list that used to sit below the table.
    const productRegisterRowSelection = isProductRegisterStep
        ? {
              isSelected: (row: Record<string, unknown>) => {
                  const name = row["product"];
                  return typeof name === "string" && name.trim() === selectedProductName;
              },
              onSelect: (row: Record<string, unknown>) => {
                  const name = row["product"];
                  if (typeof name === "string" && name.trim().length > 0) {
                      selectProduct(name.trim());
                  }
              }
          }
        : undefined;

    return (
        <div className="conversation-page">
            {/*
                No Organization Calendar / Capabilities / System rail
                here -- that slide-in panel now lives only on the
                System Selection page (see SystemSelection.tsx), not
                inside the interview itself.
            */}
            <AppHeader organizationName={organizationName} />

            <main className="conversation-content">
                <div className="conversation-card">
                    <InterviewHeader
                        systemNumber={String(framework.metadata.systemNumber)}
                        systemName={framework.metadata.systemName}
                        capabilityId={system?.capability}
                    />

                    {showIntroduction ? (
                        <section className="interview-section">
                            <div className="interview-block-content">
                                {splitIntoSentences(introduction.introductionText).map((sentence, index) => (
                                    <p key={index} className="intro-sentence">
                                        {sentence}
                                    </p>
                                ))}
                            </div>

                            <div className="interview-nav">
                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={startInterview}
                                >
                                    Start Interview
                                </button>
                            </div>
                        </section>
                    ) : (
                        <>
                            {showProductSubtitle && (
                                <div className="product-name-banner">
                                    {selectedProductName}
                                </div>
                            )}

                            <InterviewSection section={currentSection} />

                            <InterviewProgress
                                current={session.getCurrentSectionIndex() + 1}
                                total={session.getTotalSections()}
                            />

                            <AnswerRenderer
                                key={currentSection.number}
                                definition={currentSection.answer}
                                value={session.getCurrentResponse()}
                                onChange={handleAnswerChange}
                                resolveDynamicOptions={resolveDynamicOptions}
                                rowSelection={productRegisterRowSelection}
                                ownerSuggestions={operationsOwnerSuggestions}
                                processLibraryProcesses={operationsProcesses}
                            />

                            <div className="interview-nav">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        session.isFirstSection()
                                            ? goToIntroduction
                                            : previousSection
                                    }
                                >
                                    {session.isFirstSection() ? "Introduction" : "Previous"}
                                </button>

                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={nextSection}
                                    disabled={nextDisabled}
                                >
                                    {session.isLastSection() ? "Finish" : "Next"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <AppFooter
                onBack={() => navigate("/assistant")}
            />

            {exportStep === "warning" && (
                <div className="confirmation-overlay" onClick={() => setExportStep("none")}>
                    <div className="confirmation-dialog" onClick={(event) => event.stopPropagation()}>
                        <h2 className="confirmation-title">
                            Sections Incomplete
                        </h2>

                        <ul className="confirmation-warning-list">
                            {validationIssues.map(issue => (
                                <li key={issue.sectionNumber}>
                                    {issue.sectionNumber}. {issue.sectionTitle}
                                </li>
                            ))}
                        </ul>

                        <div className="confirmation-actions">
                            <button
                                className="confirmation-button secondary"
                                onClick={() => setExportStep("none")}
                            >
                                Cancel
                            </button>

                            <button
                                className="confirmation-button primary"
                                onClick={handleContinueToOptions}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {exportStep === "options" && (
                <div className="confirmation-overlay" onClick={() => setExportStep("none")}>
                    <div className="confirmation-dialog export-options-dialog" onClick={(event) => event.stopPropagation()}>
                        <h2 className="confirmation-title">
                            Export Options
                        </h2>

                        {isProductDevelopmentSystem && (
                            <div className="export-options-group">
                                <div className="export-options-label">Include</div>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="export-scope"
                                        checked={exportScope === "product"}
                                        onChange={() => setExportScope("product")}
                                    />
                                    This Product only
                                    {selectedProductName ? ` (${selectedProductName})` : ""}
                                </label>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="export-scope"
                                        checked={exportScope === "system"}
                                        onChange={() => setExportScope("system")}
                                    />
                                    Whole System (all Products)
                                </label>
                            </div>
                        )}

                        {isOperationsSystem && (
                            <div className="export-options-group">
                                <div className="export-options-label">Include</div>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="operations-export-scope"
                                        checked={operationsExportScope === "all"}
                                        onChange={() => setOperationsExportScope("all")}
                                    />
                                    All Processes
                                </label>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="operations-export-scope"
                                        checked={operationsExportScope === "selected-processes"}
                                        onChange={() => setOperationsExportScope("selected-processes")}
                                    />
                                    Selected Processes
                                </label>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="operations-export-scope"
                                        checked={operationsExportScope === "selected-sops"}
                                        onChange={() => setOperationsExportScope("selected-sops")}
                                    />
                                    Selected SOPs
                                </label>

                                {operationsExportScope === "selected-processes" && (
                                    <div className="export-options-picker">
                                        {operationsProcesses.length === 0 && (
                                            <div className="export-options-picker-empty">
                                                No Processes yet.
                                            </div>
                                        )}
                                        {operationsProcesses.map((process, processIndex) => (
                                            <label
                                                key={processIndex}
                                                className="export-options-checkbox export-options-picker-row"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProcessIndexes.has(processIndex)}
                                                    onChange={() => toggleSelectedProcess(processIndex)}
                                                />
                                                {processDisplayId(operationsProcesses, processIndex)}
                                                {" - "}
                                                {process.name?.trim() || "Untitled Process"}
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {operationsExportScope === "selected-sops" && (
                                    <div className="export-options-picker">
                                        {operationsProcesses.length === 0 && (
                                            <div className="export-options-picker-empty">
                                                No Processes yet.
                                            </div>
                                        )}
                                        {operationsProcesses.map((process, processIndex) => (
                                            <div key={processIndex} className="export-options-picker-process">
                                                <div className="export-options-picker-process-name">
                                                    {processDisplayId(operationsProcesses, processIndex)}
                                                    {" - "}
                                                    {process.name?.trim() || "Untitled Process"}
                                                </div>
                                                {process.sops.map((sop, sopIndex) => (
                                                    <label
                                                        key={sopIndex}
                                                        className="export-options-checkbox export-options-picker-row export-options-picker-row-nested"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedSopKeys.has(`${processIndex}:${sopIndex}`)}
                                                            onChange={() => toggleSelectedSop(processIndex, sopIndex)}
                                                        />
                                                        {sopDisplayId(process.sops, sopIndex)}
                                                        {" - "}
                                                        {sop.name?.trim() || "Untitled SOP"}
                                                    </label>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="export-options-group">
                            <div className="export-options-label">Capability</div>

                            <label className="export-options-radio">
                                <input
                                    type="radio"
                                    name="capability-choice"
                                    checked={capabilityChoice === "original"}
                                    onChange={() => setCapabilityChoice("original")}
                                />
                                Original ({framework.metadata.capability})
                            </label>

                            <label className="export-options-radio">
                                <input
                                    type="radio"
                                    name="capability-choice"
                                    checked={capabilityChoice === "other"}
                                    onChange={() => setCapabilityChoice("other")}
                                />
                                Another Capability
                            </label>

                            {capabilityChoice === "other" && (
                                <input
                                    type="text"
                                    className="export-options-text-input"
                                    placeholder="Capability name"
                                    value={otherCapabilityName}
                                    onChange={(event) => setOtherCapabilityName(event.target.value)}
                                />
                            )}
                        </div>

                        <div className="export-options-group">
                            <div className="export-options-label">Format</div>

                            <label className="export-options-checkbox">
                                <input
                                    type="checkbox"
                                    checked={includeMd}
                                    onChange={(event) => setIncludeMd(event.target.checked)}
                                />
                                Markdown (.md)
                            </label>

                            <label className="export-options-checkbox">
                                <input
                                    type="checkbox"
                                    checked={includePdf}
                                    onChange={(event) => setIncludePdf(event.target.checked)}
                                />
                                PDF
                            </label>
                        </div>

                        <div className="confirmation-actions">
                            <button
                                className="confirmation-button secondary"
                                onClick={() => setExportStep("none")}
                            >
                                Cancel
                            </button>

                            <button
                                className="confirmation-button primary"
                                onClick={handleFinalExport}
                                disabled={!canExport || !canConfirmCapability}
                            >
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
