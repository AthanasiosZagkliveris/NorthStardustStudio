import { Fragment, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import InterviewHeader from "../components/interview/InterviewHeader";
import InterviewProgress from "../components/InterviewProgress";
import InterviewSection from "../components/InterviewSection";
import AnswerRenderer from "../components/interview/AnswerRenderer";

import { InterviewManager, ReviewManager } from "../framework/application";
import { InterviewSession } from "../framework/interview";
import {
    currentSituationDraft,
    financialPlanRange,
    businessModelCanvas } from "../framework/engine/BusinessDocuments.ts";
import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";
import { AnswerDefinition, Section, ValidationIssue, ValidationResult } from "../framework/model";
import { AnswerType } from "../framework/enums/AnswerType";
import { financialPlanPeriod } from "../framework/engine/FinancialModel.ts";
import {
    CardListAnswerValue,
    defaultAnswerValue,
    generateOperationalLogEntriesFromProcessLibrary,
    isAnswerEmpty,
    numberedUnitCount,
    isTableRowComplete,
    OperationalLogRowValue,
    processDisplayId,
    ProcessRecordValue,
    sopDisplayId,
    StrategyRangeValue,
    StrategyThemeValue,
    TableAnswerRow,
    asLegalEntityValue,
    asStrategicPeriodValue,
    asStrategyFoundationValue,
    formatRangeShort,
    titleWithPeriod,
    isRangeSet,
    monthIndex,
    strategyGoalsForTheme,
    strategyThemeHasContent,
    visibleTableColumns
} from "../framework/engine/AnswerUtils.ts";
import {
    buildExportContent,
    buildMultiProductExportContent,
    buildSingleProductExportContent
} from "../framework/engine/ExportContentBuilder.ts";
import { countryCurrency } from "../framework/engine/LegalEntityJurisdictions.ts";

import { StorageService } from "../services/StorageService";
import { OrganizationService } from "../services/OrganizationService";
import { PreferencesService } from "../services/PreferencesService";
import { offerRemovalUndo, UndoService } from "../services/UndoService";
import { FocusModeService } from "../services/FocusModeService";
import { useFocusMode } from "../components/FocusModeButton";
import { systems } from "../data/systems";
import { focusField, focusText, jumpTo, type OpenPage } from "../components/interview/jumpTo.ts";
import { FieldPageProvider } from "../components/interview/fieldMarks.tsx";
import BulletRail from "../components/interview/rails/BulletRail";
import PageArrow, { pageKey } from "../components/interview/PageArrow";
import NumberedListStatic from "../components/interview/NumberedListStatic";
import { pageIndexFromRailId, pageRailItems, sectionRailItems } from "../components/interview/rails/railItems";
import { pageStatuses } from "../framework/engine/PageStatus";
import { sectionStatuses } from "../framework/engine/SectionStatus";
import { scrollToRailSection, useActiveRailSection } from "../components/interview/rails/useActiveRailSection";
import { toggledIn } from "../components/interview/toggledIn";

import "../styles/conversation.css";
import "../styles/conversation-layout.css";
import "../styles/system-confirmation.css";

/**
 * Where the Target Audience is answered: the Identity System, on
 * its Definition page, in the Positioning column. Read by the
 * Business System's Foundation page (see targetAudience below).
 */
const IDENTITY_SYSTEM_NUMBER = 1;
const IDENTITY_DEFINITION_SECTION = 1;

/** The Business System: answered before Strategy, which drafts from it. */
const BUSINESS_SYSTEM_NUMBER = 3;

const interviewManager = new InterviewManager();
const reviewManager = new ReviewManager();

/** Titles are matched loosely: trimmed and case-insensitive. */
const normalize = (text: string) => text.trim().toLowerCase();

/**
 * A System, found by its title, and one of its Sections, found by
 * its title; null when either is missing.
 */
function findSystemSection(systemTitle: string, sectionTitle: string) {

    const system = systems.find(candidate => normalize(candidate.title) === normalize(systemTitle));

    if (!system) {
        return null;
    }

    const section = frameworkRegistry
        .getFramework(system.id)
        .sections
        .find(candidate => normalize(candidate.title) === normalize(sectionTitle));

    return section ? { system, section } : null;

}

/**
 * Reads the value behind a Shared Answer -- which lives in the
 * MIRRORED System's own saved session, not this one's (see
 * AnswerType.SharedAnswer).
 *
 * Module-level rather than a method on the component so the
 * "Finish" callback can use it too: that callback is declared
 * before the render body's own early returns (Rules of Hooks), so
 * anything defined further down is out of its scope.
 */
function resolveSharedAnswerValue(
    organizationId: string | null,
    answer: AnswerDefinition
): unknown {

    const reference = answer.sharedSource;

    if (!reference || !organizationId) {
        return undefined;
    }

    const source = findSystemSection(reference.systemTitle, reference.sectionTitle);

    if (!source) {
        return undefined;
    }

    return StorageService
        .loadInterview(organizationId, source.system.number)
        ?.getResponse(source.section.number);

}

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
 * The Product Development System's Product Register is kept in the
 * Organization's shared product list (OrganizationService.products),
 * so the list outlives any one System's answers. The Business System
 * had a Product Register sharing the same list until its nine
 * original pages were retired.
 *
 * Matched by the Section's TITLE, not its number: the Business
 * System's Register moved every time a page was inserted ahead of it,
 * and a number written here went stale with the first move --
 * copying the product list over whichever page had taken its old
 * number.
 */
const SHARED_PRODUCT_REGISTER_BINDINGS: { systemId: string; sectionTitle: string }[] = [
    { systemId: "product-development", sectionTitle: "Product Register" }
];

/** A Section's title, by its number in the current Session. */
function sectionTitleOf(session: InterviewSession, sectionNumber: number): string | undefined {
    return session.getSections().find(section => section.number === sectionNumber)?.title;
}

function isSharedProductRegisterSection(
    systemId: string | undefined,
    sectionTitle: string | undefined
): boolean {
    const title = sectionTitle?.trim().toLowerCase();
    return SHARED_PRODUCT_REGISTER_BINDINGS.some(
        binding => binding.systemId === systemId && binding.sectionTitle.toLowerCase() === title
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
 * matched by Product name text (see extractProductNames below) --
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
 * The incomplete list, gathered into the pages it points at.
 *
 * A validation issue names a unit, not a page: on a Section that
 * numbers its units (see AnswerDefinition.nestedNumbering) eleven
 * issues can come from three pages, and a flat list of eleven
 * names never says so. Grouping turns "go and find these" into
 * "go back to these three pages".
 *
 * A Section reported as a whole carries no `label`, so it becomes
 * a heading with nothing under it -- the page IS the answer that
 * is missing, and there is no smaller thing to name.
 */
function groupValidationIssues(
    issues: ValidationIssue[],
    sections: Section[]
): Array<{
    number: number;
    title: string;
    units: Array<{ label: string; title: string }>;
}> {

    const groups: Array<{
        number: number;
        title: string;
        units: Array<{ label: string; title: string }>;
    }> = [];

    for (const issue of issues) {

        // Which page the issue is on. NOT `sectionNumber`, which on
        // a Section reporting its own units is a running count of
        // units across the whole System ("9" for the ninth column,
        // whatever page it sits on); such an issue names its page
        // in `pageNumber`. A label named in words ("Theme 1, Goal
        // 2") is on its own Section's page.
        const number = issue.pageNumber ?? issue.sectionNumber;

        let group = groups.find(candidate => candidate.number === number);

        if (!group) {
            group = {
                number,
                // The page's own title, which an issue does not
                // carry: its `sectionTitle` is the unit's.
                title: sections.find(section => section.number === number)?.title
                    ?? issue.sectionTitle,
                units: []
            };
            groups.push(group);
        }

        if (issue.label) {
            group.units.push({ label: issue.label, title: issue.sectionTitle });
        }

    }

    return groups;

}

/**
 * Validates a Product Development System Interview Session scoped
 * to a single, currently-selected Product -- rather than
 * `reviewManager.validate` (InterviewValidator), which checks the
 * shared Product Register (Section 1) as a WHOLE Table (every row,
 * every column, of every Product) and Sections 2-7 via whatever the
 * Session's own `responses` happen to hold (only reliable for
 * whichever Product was selected the last time each Section was
 * visited -- see the Conversation component's loading effect).
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

/**
 * A line of authored text with its **bold** runs drawn bold: the page
 * names in a System's introduction, the System names in "Uses from
 * earlier". Anything else is shown as written.
 */
function withBold(text: string): ReactNode[] {

    return text.split(/(\*\*[^*]+\*\*)/).filter(part => part.length > 0).map((part, index) =>
        /^\*\*[^*]+\*\*$/.test(part)
            ? <strong key={index}>{part.slice(2, -2)}</strong>
            : <Fragment key={index}>{part}</Fragment>
    );

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

    // Set only by System Selection's "Continue" line: open the
    // interview itself at `targetSectionNumber` (not its
    // Introduction), and scroll to the section card last worked in,
    // when one was recorded.
    const resume: { anchor?: string } | undefined = location.state?.resume;

    // Set by openField (fieldLocation): open the interview at
    // `targetSectionNumber` and there the one field this names --
    // its card unfolded, the field scrolled to, focused and
    // highlighted (see focusField in jumpTo.ts). A search result for
    // an answer names its text and cards instead (focusText).
    const openingField: { key: string; anchors?: string[]; text?: string; ids?: string[] } | undefined = location.state?.focusField;

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

    // Whether the guidance above the progress line is showing.
    // Starts open: the instructions are what a page is for the first
    // time it is opened, and hiding them by default would leave a
    // new user looking at unexplained boxes.
    const [instructionsOpen, setInstructionsOpen] = useState(true);

    // Focus mode hides the Help with the rest (FocusModeButton).
    const focusMode = useFocusMode();

    // A held-back Strategy System change and what it would cost --
    // removing a Theme that has work under it, or narrowing the
    // Strategic Period past an Objective. `apply` runs it; dismissing
    // the dialog drops it. Rendered as the app's own dialog rather
    // than window.confirm, which the rest of the app avoids too.
    const [strategyPrompt, setStrategyPrompt] = useState<{
        title: string;
        message: string;
        apply: () => void;
    } | null>(null);
    const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
    const [capabilityChoice, setCapabilityChoice] = useState<CapabilityChoice>("original");
    const [otherCapabilityName, setOtherCapabilityName] = useState("");

    // The Business System can export its answers, or the Business
    // Model Canvas they add up to (see BusinessDocuments.ts).
    const [documentChoice, setDocumentChoice] = useState<"answers" | "canvas">("answers");
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

    // ← and → turn the page (pageKey says when they may): set below,
    // once the session's page functions exist, and read by one
    // listener for the page's life.
    const pageTurn = useRef<(direction: "previous" | "next") => void>(() => undefined);
    // Not while the Strategy confirmation or the export flow is open.
    const strategyPromptOpen = useRef(false);
    strategyPromptOpen.current = strategyPrompt !== null;
    const exportOpen = useRef(false);
    exportOpen.current = exportStep !== "none";

    useEffect(() => {
        function onKey(event: KeyboardEvent) {
            const direction = pageKey(event);
            if (direction && !strategyPromptOpen.current && !exportOpen.current) {
                event.preventDefault();
                pageTurn.current(direction);
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Escape acts as "Back" everywhere in the app: first close
    // whichever popup is currently open (here, the Strategy
    // confirmation or the Export flow's own two-step dialog), and
    // only once nothing is open anymore does it fall through to the
    // same navigation the footer's own "Back" link performs.
    useEffect(() => {

        function handleKeyDown(event: KeyboardEvent) {

            if (event.key !== "Escape") {
                return;
            }

            if (strategyPrompt) {
                setStrategyPrompt(null);
                return;
            }

            if (exportStep !== "none") {
                setExportStep("none");
                return;
            }

            // Focus mode shown: Escape leaves it, before leaving the page.
            if (document.documentElement.classList.contains("focus-mode")) {
                FocusModeService.set(false);
                return;
            }

            navigate("/assistant", { state: { capability: system?.capability } });

        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);

    }, [strategyPrompt, exportStep, navigate, system]);

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
                if (resume || openingField) {
                    loadedSession.startInterview();
                }
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
        // (see LocalOrganizationStore) so typing
        // doesn't pay a full-document read-parse-write on every
        // keystroke -- flushing here on cleanup (leaving this System,
        // switching Organizations, or unmounting entirely) guarantees
        // the last edit is on disk before we navigate away, on top of
        // the page unload/hide safety net OrganizationService already
        // registers for closing the app outright.
        return () => {
            OrganizationService.flushPendingWrites();
        };

    }, [system, organizationId, targetSectionNumber, resume, openingField]);

    // The last place worked, for System Selection's "Continue" line:
    // this System and the page open in it, whenever the interview
    // (not its Introduction) is showing. The section card is added
    // by recordFocusedCard below, and kept while the page stays the
    // same.
    const interviewShowing = session?.hasStartedInterview() ?? false;
    const placeIndex = session?.getCurrentSectionIndex();

    useEffect(() => {

        if (!organizationId || !system || !interviewShowing || placeIndex === undefined) {
            return;
        }

        const previous = OrganizationService.getLastPlace(organizationId);
        const samePage = previous?.systemNumber === system.number && previous?.sectionIndex === placeIndex;

        OrganizationService.setLastPlace(organizationId, {
            systemNumber: system.number,
            sectionIndex: placeIndex,
            anchor: samePage ? previous?.anchor : undefined
        });

    }, [organizationId, system, interviewShowing, placeIndex]);

    // Continuing lands on the card last worked in, once the page has
    // drawn it.
    useEffect(() => {

        const anchor = resume?.anchor;

        if (!session || !anchor) {
            return;
        }

        const timer = window.setTimeout(() => scrollToRailSection(anchor), 300);

        return () => window.clearTimeout(timer);

    }, [session, resume]);

    useEffect(() => {

        if (!session || !openingField) {
            return;
        }

        const timer = window.setTimeout(() => openingField.text
            ? focusText(openingField.text, openingField.ids ?? [])
            : focusField(openingField.key, openingField.anchors ?? []), 300);

        return () => window.clearTimeout(timer);

    }, [session, openingField]);

    // The Product Development System's Product Register is kept in
    // the Organization's shared product list (see
    // SHARED_PRODUCT_REGISTER_BINDINGS above). Landing on it pulls
    // in the latest shared rows before anything renders, rather
    // than showing a possibly stale copy from this Session's own
    // last save.
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

        if (isSharedProductRegisterSection(system.id, sectionTitleOf(session, sectionNumber))) {

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

        // What the page held before, so a removal can be undone.
        const changedSection = session.getCurrentSectionNumber();
        const before = session.getResponse(changedSection);

        session.saveCurrentResponse(value);

        if (organizationId && system) {

            const sectionNumber = session.getCurrentSectionNumber();

            const targetAudiencePartBinding = findSharedTargetAudiencePartBinding(system.id, sectionNumber);

            if (isSharedProductRegisterSection(system.id, sectionTitleOf(session, sectionNumber))) {

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

        // A card, row or text just removed can be put back, into the
        // page as it is then: through this same path while the page is
        // open (so whatever it keeps in step is kept), otherwise
        // straight into its stored answer.
        offerRemovalUndo(before, value, () => session.getResponse(changedSection), next => {
            if (session.getCurrentSectionNumber() === changedSection) {
                answerChangeRef.current(next);
            } else {
                session.saveResponse(changedSection, next);
                persistAndRedraw(session);
            }
        });

    }, [session, organizationId, system]);

    // The latest handleAnswerChange, for an undo offered by an earlier one.
    const answerChangeRef = useRef(handleAnswerChange);
    answerChangeRef.current = handleAnswerChange;

    // Another System's interview: a removal on the last one is final.
    useEffect(() => () => UndoService.dismiss(), [session]);

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

        const source = findSystemSection(systemTitle ?? "", sectionTitle);

        if (!source) {
            return [];
        }

        const otherSession = organizationId
            ? StorageService.loadInterview(organizationId, source.system.number)
            : null;

        const response = otherSession ? otherSession.getResponse(source.section.number) : undefined;

        return extractDynamicOptions(source.section.answer, response, cardTitle, normalize);

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


    function toggleSelectedProcess(processIndex: number) {

        setSelectedProcessIndexes(current => toggledIn(current, processIndex));

    }

    function toggleSelectedSop(processIndex: number, sopIndex: number) {

        const key = `${processIndex}:${sopIndex}`;

        setSelectedSopKeys(current => toggledIn(current, key));

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
            system?.id === "business" && documentChoice === "canvas"
                ? businessModelCanvas({
                      identity: organizationId ? StorageService.loadInterview(organizationId, IDENTITY_SYSTEM_NUMBER) : null,
                      business: session,
                      organisationName: organizationName
                  }, capabilityLabel)
            : system?.id === "product-development" && organizationId
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
                // Every other System: what is saved, with the Identity
                // System facts the Business pages are answered against.
                : buildExportContent(session, capabilityLabel, undefined, undefined, {
                      legalEntity,
                      foundersProfile,
                      currency: organisationCurrency
                  });

        if (includeMd) {
            reviewManager.exportMarkdown(session, capabilityLabel, exportContent);
        }

        if (includePdf) {
            reviewManager.exportPdf(session, capabilityLabel, exportContent);
        }

        setExportStep("none");

    }

    // A Shared Answer Section (see AnswerType.SharedAnswer) holds no
    // data of its own: it renders ANOTHER System's Section and reads
    // and writes that System's saved response, so the two are one
    // piece of data edited from two places. Resolved here, once, into
    // the source System, its Section, and its live session.
    function resolveSharedAnswer(answer: AnswerDefinition | undefined) {

        const reference = answer?.sharedSource;

        if (!reference || !organizationId) {
            return null;
        }

        const source = findSystemSection(reference.systemTitle, reference.sectionTitle);

        if (!source) {
            return null;
        }

        const { system: sourceSystem, section: sourceSection } = source;

        // A session only exists once that System has been opened at
        // least once. Falling back to a fresh one means the shared
        // page still works before the source System has ever been
        // visited -- and saving it there is what creates it.
        const sourceSession =
            StorageService.loadInterview(organizationId, sourceSystem.number)
            ?? interviewManager.create(sourceSystem.id);

        return { system: sourceSystem, section: sourceSection, session: sourceSession };

    }

    // What actually renders: the mirrored Section's own definition
    // when this is a Shared Answer, otherwise this Section's own.
    // Shared by the page and the section rail so the rail always
    // lists the sections of the editor actually on screen.
    function resolveEffectiveAnswer(
        section: Section | undefined,
        shared: ReturnType<typeof resolveSharedAnswer>
    ): AnswerDefinition | undefined {

        return shared ? shared.section.answer : section?.answer;

    }

    // The Strategy System's Foundation page (by Answer Structure, not
    // number) and its saved value. Shared by the Strategy pages below
    // and the section rail, which lists the Foundation's Themes on the
    // Strategic Period and Roadmap pages.
    function findStrategyFoundationSection(currentSession: InterviewSession) {

        return currentSession.getFramework().sections.find(
            candidate => candidate.answer?.type === AnswerType.StrategyFoundation
        );

    }

    function resolveStrategyFoundationValue(currentSession: InterviewSession) {

        const foundationSection = findStrategyFoundationSection(currentSession);

        return foundationSection
            ? asStrategyFoundationValue(currentSession.getResponse(foundationSection.number))
            : undefined;

    }

    // Resolved before the early returns below so the section rail's
    // hook can use them; the page reads the same values further down.
    const sharedSource = session
        ? resolveSharedAnswer(session.getCurrentSection()?.answer)
        : null;

    const strategyFoundationValue = session
        ? resolveStrategyFoundationValue(session)
        : undefined;

    // The two bullet rails. Computed before the early returns below
    // (hooks), and simply empty while nothing is loaded.
    // Each page bullet is drawn in its page status (PageStatus.ts),
    // recomputed on every render so an answer given here shows at once.
    const railStatuses = session
        ? pageStatuses(session, (answer) => resolveSharedAnswerValue(organizationId, answer))
        : null;
    const railPages = session
        ? pageRailItems(session.getSections()).map((item, index) => ({
            ...item,
            status: railStatuses?.get(session.getSections()[index].number)
        }))
        : [];
    const railSectionIndex = session?.getCurrentSectionIndex() ?? 0;
    // What renders on this page; also read by the page further down.
    const effectiveAnswer = session
        ? resolveEffectiveAnswer(session.getCurrentSection(), sharedSource)
        : undefined;

    // Columns are numbered continuously across the whole System
    // rather than restarting on each page, so this counts every
    // column on the column-layout Sections BEFORE the current one
    // (a System of three four-column pages therefore runs 1-4, 5-8,
    // 9-12). Counted against THIS System's own pages, not the
    // mirrored System's -- a shared page belongs to the System you
    // are currently in. The answers are identical either way; only
    // the positional index differs.
    // A Section that numbers its own units (see
    // AnswerDefinition.nestedNumbering) starts again from 1 instead,
    // as every Foundation page does. Resolved before the early
    // returns below because the section rail numbers its bullets
    // the same way.
    const columnNumberOffset = !session || effectiveAnswer?.nestedNumbering
        ? 0
        : session.getFramework().sections
            .filter(candidate => candidate.number < (session.getCurrentSection()?.number ?? 0))
            .reduce(
                (total, candidate) => total + numberedUnitCount(
                    candidate.answer,
                    // A Shared Answer counts as whatever it mirrors.
                    (answer: AnswerDefinition) => resolveSharedAnswer(answer)?.section.answer
                ),
                0
            );

    // Each section bullet is drawn in its section's status too
    // (SectionStatus.ts), from the same answers, on every render.
    const railSectionItems = session
        ? sectionRailItems(effectiveAnswer, strategyFoundationValue?.themes ?? [], columnNumberOffset + 1)
        : [];
    const railSectionStatuses = session
        ? sectionStatuses(
            effectiveAnswer,
            sharedSource
                ? resolveSharedAnswerValue(organizationId, session.getCurrentSection()?.answer)
                : session.getResponse(session.getCurrentSection()?.number ?? 0),
            {
                pageDefined: railStatuses?.get(session.getCurrentSection()?.number ?? 0) === "defined",
                themes: strategyFoundationValue?.themes ?? [],
                periodValue: session.getResponse(
                    session.getSections().find(candidate => candidate.answer?.type === AnswerType.StrategicPeriod)?.number ?? 0
                ),
                railIds: railSectionItems.map(item => item.id)
            }
        )
        : null;
    const railSections = railSectionItems.map(item => ({ ...item, status: railSectionStatuses?.get(item.id) }));
    const [activeRailSection, selectRailSection] = useActiveRailSection(railSections.map(item => item.id), railSectionIndex);

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

    // The page arrows (above the rails; beside Start Interview on the
    // Introduction) and ← / →: back to the Introduction from the first
    // page, and no further than the last.
    const previousPage = session.isFirstSection() ? goToIntroduction : previousSection;
    const onLastPage = session.isLastSection();
    pageTurn.current = (direction) => {
        if (showIntroduction) {
            if (direction === "next") {
                startInterview();
            }
            return;
        }
        if (direction === "previous") {
            previousPage();
        } else if (!onLastPage && !nextDisabled) {
            nextSection();
        }
    };

    // A field taking focus names the section card it is in (its
    // `data-rail` marker) as the last place worked -- cheap, and
    // only while the interview itself is showing.
    function recordFocusedCard(event: React.FocusEvent<HTMLElement>) {

        if (!organizationId || !system || !session || showIntroduction) {
            return;
        }

        const anchor = (event.target as HTMLElement).closest<HTMLElement>("[data-rail]")?.dataset.rail;

        if (!anchor) {
            return;
        }

        OrganizationService.setLastPlace(organizationId, {
            systemNumber: system.number,
            sectionIndex: session.getCurrentSectionIndex(),
            anchor
        });

    }

    // The value shown, and where an edit goes. A Shared Answer reads
    // and writes the SOURCE System's stored response, so editing here
    // is editing that System -- there is deliberately no second copy
    // to keep in step.
    const effectiveValue = sharedSource
        ? sharedSource.session.getResponse(sharedSource.section.number)
        : session.getCurrentResponse();

    function handleSharedAnswerChange(value: unknown) {

        if (!sharedSource || !organizationId) {
            return;
        }

        const { session: source, section } = sharedSource;
        const before = source.getResponse(section.number);

        source.saveResponse(section.number, value);

        StorageService.saveInterview(organizationId, source);

        redraw();

        // As handleAnswerChange: a removal can be undone.
        offerRemovalUndo(before, value, () => source.getResponse(section.number), next => {
            source.saveResponse(section.number, next);
            StorageService.saveInterview(organizationId, source);
            redraw();
        });

    }

    // A column-layout page (see AnswerDefinition.columns) lays its
    // Section out as side-by-side columns, and moves its own title up
    // into the Interview Header. Read from the EFFECTIVE answer so a
    // Shared Answer mirroring a column page lays out as one too.
    const isColumnsPage = effectiveAnswer?.columns === true;

    // Pages whose editor owns the full width and carries its own
    // internal headings move their Section title up into the
    // Interview Header, rather than repeating it as a separate
    // heading directly above their own first heading. Column pages
    // do this already; the Brand System's Style and Inventory
    // editors are laid out the same way and read the same.
    const mergesTitleIntoHeader =
        isColumnsPage ||
        effectiveAnswer?.type === AnswerType.BusinessFoundation ||
        effectiveAnswer?.type === AnswerType.BusinessEngagement ||
        effectiveAnswer?.type === AnswerType.BusinessCapability ||
        effectiveAnswer?.type === AnswerType.FinancialFoundation ||
        effectiveAnswer?.type === AnswerType.FinancialSustainability ||
        effectiveAnswer?.type === AnswerType.LegalEntity ||
        effectiveAnswer?.type === AnswerType.FoundersProfile ||
        effectiveAnswer?.type === AnswerType.BrandStyle ||
        effectiveAnswer?.type === AnswerType.BrandInventory ||
        effectiveAnswer?.type === AnswerType.StrategyFoundation ||
        effectiveAnswer?.type === AnswerType.StrategicPeriod ||
        effectiveAnswer?.type === AnswerType.StrategicRoadmap;

    // What the Legal Entity page can answer for the user without
    // asking: the Organization's name and the User's own, both
    // given when the app was set up. Read here because the page
    // itself has no access to either.
    const legalEntityPrefill = {
        organisationName:
            (organizationId && OrganizationService.getSummary(organizationId)?.name) || "",
        founderName: PreferencesService.getUserName()
    };

    /*
        The Target Audience the Business System's Foundation page
        asks the founder to divide into Segments.

        It was answered two Systems earlier, under the Identity
        System's Positioning column ("Who is your target
        audience?"), so the Foundation page shows it rather than
        asking again -- the same reason the Legal Entity page
        prefills the organization's own name above.

        Read straight from storage rather than through a Session:
        this is another System's saved answer, and opening a
        Session for it would run that System's migrations as a
        side effect of drawing a note.
    */
    const targetAudience = (() => {

        if (!organizationId) {
            return "";
        }

        const state = OrganizationService.loadSystemState(
            organizationId,
            IDENTITY_SYSTEM_NUMBER
        ) as { responses?: Array<{ sectionNumber: number; value?: unknown }> } | null;

        const definition = state?.responses?.find(
            response => response.sectionNumber === IDENTITY_DEFINITION_SECTION
        )?.value;

        const positioning = definition &&
            typeof definition === "object" &&
            !Array.isArray(definition)
            ? (definition as Record<string, unknown>).positioning
            : undefined;

        return typeof positioning === "string" ? positioning : "";

    })();

    /* The Vision, from the same Identity answer: shown beside the
       Strategy System's Strategic Compass, which follows from it. */
    const identityVision = (() => {

        if (!organizationId) {
            return "";
        }

        const state = OrganizationService.loadSystemState(
            organizationId,
            IDENTITY_SYSTEM_NUMBER
        ) as { responses?: Array<{ sectionNumber: number; value?: unknown }> } | null;

        const definition = state?.responses?.find(
            response => response.sectionNumber === IDENTITY_DEFINITION_SECTION
        )?.value;

        const vision = definition && typeof definition === "object" && !Array.isArray(definition)
            ? (definition as Record<string, unknown>).vision
            : undefined;

        return typeof vision === "string" ? vision : "";

    })();

    /*
        The currency the organisation is registered in: the country
        chosen on the Identity System's Legal Entity page, through
        the same countryCurrency that page shows beside its own
        amounts. The Business System's Infrastructure & Capability
        page puts it beside every Price, so a founder names the
        currency once, by saying where they are registered.

        Read straight from storage, for the reason targetAudience
        gives, and resolved by Answer Structure rather than by
        Section number. "" when no country has been chosen yet.

        The same page's 2. Founders & Ownership are that page's
        founders too: they are who Infrastructure & Capability lists
        under 1. Founders and names in every Responsibility, and who
        the Founders Profile page draws a card for.
    */
    function identityResponse(type: AnswerType): unknown {

        if (!organizationId) {
            return undefined;
        }

        const identity = systems.find(
            candidate => candidate.number === IDENTITY_SYSTEM_NUMBER
        );

        const section = identity
            ? frameworkRegistry.getFramework(identity.id).sections.find(
                candidate => candidate.answer?.type === type
            )
            : undefined;

        if (!section) {
            return undefined;
        }

        const state = OrganizationService.loadSystemState(
            organizationId,
            IDENTITY_SYSTEM_NUMBER
        ) as { responses?: Array<{ sectionNumber: number; value?: unknown }> } | null;

        return state?.responses?.find(
            response => response.sectionNumber === section.number
        )?.value;

    }

    const legalEntity = asLegalEntityValue(identityResponse(AnswerType.LegalEntity));

    /*
        The Identity System's Founders Profile, as saved: each
        founder's Roles, which Infrastructure & Capability shows
        under 1. Founders, and the profiles the Legal Entity page
        will not drop a founder's row from (see founderProfiles).
    */
    const foundersProfile = identityResponse(AnswerType.FoundersProfile);

    const organisationCurrency = countryCurrency(legalEntity.organisation.country);

    /*
        The Business System's first two pages read the same way the
        Strategy System's three do: Customer Engagement (Page 2) is
        answered entirely against the Segments, Profiles and
        Offerings the Foundation page (Page 1) defines, and refers
        to them rather than asking for them again.

        A Section can only see its own response, so the Foundation's
        is resolved here, once, and handed down -- and so is the way
        back to it, for the links Page 2 draws on the names it
        borrows.

        Resolved by Answer Structure rather than by Section number,
        so this stays correct if the Business pages are reordered.
    */
    const businessFoundationSection = framework.sections.find(
        candidate => candidate.answer?.type === AnswerType.BusinessFoundation
    );

    const businessFoundationValue = businessFoundationSection
        ? session.getResponse(businessFoundationSection.number)
        : undefined;

    const openBusinessFoundation: OpenPage | undefined = businessFoundationSection
        ? (path) => {

            // Sections are numbered from 1; goToSection is 0-based.
            session.goToSection(businessFoundationSection.number - 1);

            persistAndRedraw(session);

            // At the card the link names, or at the top.
            if (path && path.length > 0) {
                jumpTo(path);
            } else {
                scrollToTop();
            }

        }
        : undefined;

    /*
        The two Financial pages read the pages before them: Page 4
        consolidates the costs recorded on Page 3 (and on the Legal
        Entity, resolved above), and Page 5 measures revenue against
        everything Page 4 establishes. Resolved by Answer Structure,
        as Page 1 is.
    */
    const sectionOfType = (type: AnswerType) => framework.sections.find(
        candidate => candidate.answer?.type === type
    );

    const capabilitySection = sectionOfType(AnswerType.BusinessCapability);
    const financialFoundationSection = sectionOfType(AnswerType.FinancialFoundation);
    const financialSustainabilitySection = sectionOfType(AnswerType.FinancialSustainability);
    const businessEngagementSection = sectionOfType(AnswerType.BusinessEngagement);

    const businessCapabilityValue = capabilitySection
        ? session.getResponse(capabilitySection.number)
        : undefined;

    const financialFoundationValue = financialFoundationSection
        ? session.getResponse(financialFoundationSection.number)
        : undefined;

    // Its Demand & Conversion gives the expected sales both Financial pages use.
    const businessEngagementValue = businessEngagementSection
        ? session.getResponse(businessEngagementSection.number)
        : undefined;

    // Its revenue is what Financial Foundation's operating need is net of.
    const financialSustainabilityValue = financialSustainabilitySection
        ? session.getResponse(financialSustainabilitySection.number)
        : undefined;

    const openBusinessSection = (type: AnswerType): OpenPage | undefined => {

        const target = sectionOfType(type);

        if (!target) {
            return undefined;
        }

        return (path) => {
            session.goToSection(target.number - 1);
            persistAndRedraw(session);
            if (path && path.length > 0) {
                jumpTo(path);
            } else {
                scrollToTop();
            }
        };

    };

    /*
        The Legal Entity is another System's page (1. Identity System),
        so it is opened as the Calendar opens a task: the Identity
        System, at its Legal Entity Section. The browser's Back, and the
        app's, return here.
    */
    const identitySystem = systems.find(candidate => candidate.id === "identity");
    const legalEntitySection = identitySystem
        ? frameworkRegistry.getFramework(identitySystem.id).sections
            .find(candidate => candidate.answer?.type === AnswerType.LegalEntity)
        : undefined;
    const openLegalEntity: OpenPage | undefined = identitySystem && legalEntitySection
        ? (path) => {
            if (organizationId) {
                persistAndRedraw(session);
            }
            navigate("/introduction", {
                state: { system: identitySystem, targetSectionNumber: legalEntitySection.number }
            });
            if (path && path.length > 0) {
                jumpTo(path);
            }
        }
        : undefined;


    /*
        The Strategy System's three pages read forward: the Strategic
        Period page develops the Themes the Foundation page defines,
        and the Roadmap draws both. A Section can only see its own
        response, so the other pages' answers are resolved here, once,
        and handed down.

        Resolved by Answer Structure rather than by System number, so
        this stays correct if the Strategy pages are ever reordered.
    */
    const strategyFoundationSection = findStrategyFoundationSection(session);

    const strategicPeriodSection = framework.sections.find(
        candidate => candidate.answer?.type === AnswerType.StrategicPeriod
    );

    // strategyFoundationValue itself is resolved above the early
    // returns (resolveStrategyFoundationValue), for the section rail.

    const strategicPeriodValue = strategicPeriodSection
        ? asStrategicPeriodValue(session.getResponse(strategicPeriodSection.number))
        : undefined;

    /*
        Every number on the Strategic Period page hangs off the
        Strategic Period's own number, which is the LAST of the
        Foundation page's four columns -- not the Foundation
        Section's number, which is 1.
    */
    const strategyThemeNumberPrefix = String(
        numberedUnitCount(strategyFoundationSection?.answer)
    );

    /**
     * Removing a Theme takes everything written under it on the
     * Strategic Period page with it, so this asks first -- but only
     * when there is something to lose. A Theme with nothing recorded
     * against it goes without a dialog, because confirming an
     * inconsequential action just teaches people to dismiss dialogs.
     */
    function guardThemeRemoval(theme: StrategyThemeValue, apply: () => void) {

        if (!strategicPeriodValue || !strategyThemeHasContent(strategicPeriodValue, theme.id)) {
            apply();
            return;
        }

        setStrategyPrompt({
            title: "Remove this Theme?",
            message:
                `"${theme.name.trim() || "Untitled Theme"}" has Goals, Objectives and ` +
                "Initiatives recorded against it on the Strategic Period page. Removing " +
                "the Theme removes all of them, and this cannot be undone.",
            apply
        });

    }

    /**
     * An Objective can only be placed inside the Strategic Period,
     * so narrowing the Period can strand one that was planned in the
     * part being cut away. Rather than silently leaving it outside
     * (where the Roadmap could not draw it), this names the
     * Objectives that would be stranded so the user knows exactly
     * which ones to move.
     */
    function guardPeriodChange(period: StrategyRangeValue, apply: () => void) {

        if (!strategyFoundationValue || !strategicPeriodValue || !isRangeSet(period)) {
            apply();
            return;
        }

        const first = monthIndex(period.start);
        const last = monthIndex(period.end);

        const stranded: string[] = [];

        strategyFoundationValue.themes.forEach((theme, themeIndex) => {

            strategyGoalsForTheme(strategicPeriodValue, theme.id).forEach((goal, goalIndex) => {

                goal.objectives.forEach((objective, objectiveIndex) => {

                    if (!isRangeSet(objective.period)) {
                        return;
                    }

                    const start = monthIndex(objective.period.start);
                    const end = monthIndex(objective.period.end);

                    if (start >= first && end <= last) {
                        return;
                    }

                    // Named as the page shows it, in words, so the
                    // user can find it: "Theme 1, Goal 2, Objective 1".
                    const number =
                        `Theme ${themeIndex + 1}, Goal ${goalIndex + 1}, Objective ${objectiveIndex + 1}:`;

                    stranded.push(
                        `${number} ${objective.name.trim() || "Untitled Objective"} ` +
                        `(${formatRangeShort(objective.period)})`
                    );

                });

            });

        });

        if (stranded.length === 0) {
            apply();
            return;
        }

        setStrategyPrompt({
            title: "Objectives fall outside this period",
            message:
                `${formatRangeShort(period)} no longer covers ` +
                `${stranded.length === 1 ? "this Objective" : "these Objectives"}: ` +
                `${stranded.join("; ")}. Change ` +
                `${stranded.length === 1 ? "its period" : "their periods"} on the ` +
                "Strategic Period page first, or continue and set " +
                `${stranded.length === 1 ? "it" : "them"} again.`,
            apply
        });

    }

    /*
        The Current Situation drafted from the Business System, which
        is answered before Strategy: read from what is saved, on the
        Strategy System only.
    */
    const businessSessions = system?.id === "strategy" && organizationId
        ? {
            identity: StorageService.loadInterview(organizationId, IDENTITY_SYSTEM_NUMBER),
            business: StorageService.loadInterview(organizationId, BUSINESS_SYSTEM_NUMBER),
            organisationName: organizationName
        }
        : null;
    const situationDraft = businessSessions ? currentSituationDraft(businessSessions) : "";

    /* The financial plan's dates, for the Strategic Period to be compared with. */
    const financialPlan = businessSessions ? financialPlanRange(businessSessions) : null;

    /** Refreshing replaces the founder's own words: asked first. */
    function guardSituationRefresh(apply: () => void) {
        setStrategyPrompt({
            title: "Replace your Current Situation?",
            message: "Refresh replaces the text with a new draft from the Business System. " +
                "The changes you made to it will be lost.",
            apply
        });
    }

    /*
        A Business System page, opened from the Strategy System as the
        Legal Entity is opened from Business: that System, at that
        Section. The browser's Back, and the app's, return here.
    */
    const businessSystem = systems.find(candidate => candidate.id === "business");
    const openBusinessPage = (type: AnswerType) => {
        const target = businessSystem
            ? frameworkRegistry.getFramework(businessSystem.id).sections.find(candidate => candidate.answer?.type === type)
            : undefined;
        if (!businessSystem || !target) {
            return;
        }
        if (organizationId) {
            persistAndRedraw(session);
        }
        navigate("/introduction", { state: { system: businessSystem, targetSectionNumber: target.number } });
    };

    const strategyContext =
        strategyFoundationValue && strategicPeriodValue
            ? {
                foundation: strategyFoundationValue,
                period: strategicPeriodValue,
                themeNumberPrefix: strategyThemeNumberPrefix,
                guardThemeRemoval,
                guardPeriodChange,
                situationDraft,
                guardSituationRefresh,
                openBusinessPage,
                financialPlan
            }
            : undefined;

    /*
        The last two Strategy page titles are written with a literal
        "MM/YY - MM/YY" placeholder: it becomes the Strategic Period
        (" · Jan 2027 – Dec 2029") once one is set, and disappears
        until then (see titleWithPeriod).
    */
    // The period a title's "MM/YY - MM/YY" stands for: the Strategic
    // Period on the Strategy pages, the financial plan's months on the
    // Business System's Financial pages (financialPlanPeriod).
    const titlePeriod = strategyFoundationValue?.period ?? (financialFoundationSection
        ? financialPlanPeriod(session.getResponse(financialFoundationSection.number))
        : { start: { month: "", year: "" }, end: { month: "", year: "" } });

    const resolvedSectionTitle: string | undefined = currentSection
        ? titleWithPeriod(currentSection.title, titlePeriod)
        : undefined;

    // A Section that numbers its own units (see
    // AnswerDefinition.nestedNumbering) is itself numbered in the
    // title, so "1. Definition" says which page its "1." to "4."
    // columns are on. Where the numbering runs across the System
    // instead, the columns already carry that count and a Section
    // number in the title would be a second, unrelated one.
    const pageTitle = effectiveAnswer?.nestedNumbering && resolvedSectionTitle
        ? currentSection.number + ". " + resolvedSectionTitle
        : resolvedSectionTitle;

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
    // separate Product picker list that used to sit below the table.
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
                (The Organization Calendar / Capabilities / System
                slide-in panel lives only on the System Selection page.)
            */}
            <AppHeader organizationName={organizationName} focusable={!showIntroduction} />

            <main className="conversation-content" onFocus={recordFocusedCard}>
                <div className="conversation-card">
                    <InterviewHeader
                        systemNumber={String(framework.metadata.systemNumber)}
                        systemName={framework.metadata.systemName}
                        capabilityId={system?.capability}
                        pageTitle={
                            !showIntroduction && mergesTitleIntoHeader
                                ? pageTitle
                                : undefined
                        }
                    />

                    {showIntroduction ? (
                        <section className="interview-section intro-layout">
                            {/*
                                Two rows, so the columns' first lines
                                line up whatever their sizes: the
                                question beside the first fact's title,
                                then the introduction beside the facts
                                (each pair on one baseline). Kept to a
                                reading measure; the facts beside the
                                text on a wide screen, under it on a
                                narrow one (conversation.css).
                            */}

                            {/* The question the System answers: the lead. */}
                            {introduction.guidingQuestion && (
                                <p className="intro-guiding-question">
                                    {introduction.guidingQuestion}
                                </p>
                            )}

                            {/* What the System covers: its scope and its
                                pages, each opening the interview there. */}
                            <h2 className="intro-fact-label intro-covers-label" id="intro-covers">What it covers</h2>

                            <div className="interview-block-content intro-text">
                                {splitIntoSentences(introduction.introductionText).map((sentence, index) => (
                                    <p key={index} className="intro-sentence">
                                        {withBold(sentence)}
                                    </p>
                                ))}
                            </div>

                            {/* Then what it draws from Systems answered
                                earlier, and how long it takes -- each only
                                where the content has it. */}
                            <div className="intro-facts">
                                <div className="intro-fact-text" role="group" aria-labelledby="intro-covers">
                                    {introduction.systemScope && (
                                        <p className="intro-fact-line">{introduction.systemScope}</p>
                                    )}
                                    {/* The app's one shown-not-asked
                                        numbered list: its number column,
                                        its indent and its gap. */}
                                    <NumberedListStatic
                                        lines={pageRailItems(session.getSections()).map(page => ({
                                            key: page.id,
                                            className: "intro-page",
                                            text: (
                                                <button
                                                    type="button"
                                                    className="intro-page-link"
                                                    onClick={() => startInterviewAt(pageIndexFromRailId(page.id))}
                                                >
                                                    {page.label.replace(/^\d+\.\s+/, "")}
                                                </button>
                                            )
                                        }))}
                                    />
                                </div>

                                {introduction.usesFromEarlier && (
                                    <div className="intro-fact">
                                        <h2 className="intro-fact-label">Uses from earlier</h2>
                                        <div className="intro-fact-text">
                                            <p className="intro-fact-line">{withBold(introduction.usesFromEarlier)}</p>
                                        </div>
                                    </div>
                                )}

                                {introduction.thinkingTime && (
                                    <div className="intro-fact">
                                        <h2 className="intro-fact-label">Thinking time</h2>
                                        <div className="intro-fact-text">
                                            <p className="intro-fact-line">{introduction.thinkingTime}</p>
                                            <p className="intro-fact-line intro-fact-note">
                                                You can stop at any time; everything is saved.
                                            </p>
                                        </div>
                                    </div>
                                )}
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

                            <InterviewSection
                                section={currentSection}
                                hideTitle={mergesTitleIntoHeader}
                            />

                            {/*
                                A column-layout page hands its progress
                                line to AnswerRenderer instead, so it can
                                sit between the column questions and the
                                answer boxes -- which are interleaved
                                inside that component, out of reach of a
                                sibling rendered here.
                            */}
                            {!mergesTitleIntoHeader && (
                                <InterviewProgress
                                    current={session.getCurrentSectionIndex() + 1}
                                    total={session.getTotalSections()}
                                />
                            )}

                            {/* Every field knows its key (fieldMarks.tsx). */}
                            <FieldPageProvider
                                organizationId={organizationId}
                                systemNumber={system.number}
                                sectionNumber={currentSection.number}
                                pageTitle={currentSection.number + ". " + (resolvedSectionTitle ?? currentSection.title)}
                            >
                            <AnswerRenderer
                                key={currentSection.number}
                                definition={effectiveAnswer ?? currentSection.answer}
                                value={effectiveValue}
                                onChange={
                                    sharedSource
                                        ? handleSharedAnswerChange
                                        : handleAnswerChange
                                }
                                resolveDynamicOptions={resolveDynamicOptions}
                                rowSelection={productRegisterRowSelection}
                                ownerSuggestions={operationsOwnerSuggestions}
                                processLibraryProcesses={operationsProcesses}
                                columnNumberOffset={columnNumberOffset}
                                legalEntityPrefill={legalEntityPrefill}
                                targetAudience={targetAudience}
                                identityVision={identityVision}
                                businessFoundation={businessFoundationValue}
                                onOpenBusinessFoundation={openBusinessFoundation}
                                organisationCurrency={organisationCurrency}
                                legalEntityFounders={legalEntity.founders}
                                foundersProfile={foundersProfile}
                                legalEntity={legalEntity}
                                businessCapability={businessCapabilityValue}
                                financialFoundation={financialFoundationValue}
                                financialSustainability={financialSustainabilityValue}
                                businessEngagement={businessEngagementValue}
                                onOpenBusinessEngagement={openBusinessSection(AnswerType.BusinessEngagement)}
                                onOpenBusinessCapability={openBusinessSection(AnswerType.BusinessCapability)}
                                onOpenFinancialFoundation={openBusinessSection(AnswerType.FinancialFoundation)}
                                onOpenLegalEntity={openLegalEntity}
                                strategy={strategyContext}
                                showInstructions={instructionsOpen && !focusMode}
                                columnsDivider={
                                    mergesTitleIntoHeader
                                        ? (
                                            <>
                                                {/*
                                                    Sits directly above
                                                    the progress line,
                                                    below the guidance
                                                    it hides -- so the
                                                    control is where
                                                    the thing it acts
                                                    on ends, and the
                                                    line stays the
                                                    boundary between
                                                    reading and
                                                    answering.
                                                */}
                                                <button
                                                    type="button"
                                                    className="interview-help-toggle interview-instructions-toggle"
                                                    aria-expanded={instructionsOpen}
                                                    onClick={() => setInstructionsOpen(open => !open)}
                                                >
                                                    {instructionsOpen ? "Hide Help" : "Need Help?"}
                                                </button>

                                                <InterviewProgress
                                                    current={session.getCurrentSectionIndex() + 1}
                                                    total={session.getTotalSections()}
                                                />
                                            </>
                                        )
                                        : undefined
                                }
                            />
                            </FieldPageProvider>

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

            {/*
                Two bullet rails flank the card once the interview has
                started: the left one lists the System's pages and
                jumps between them; the right one lists the current
                page's sections and scrolls to them. Rendered after
                <main> so the card's own fields come first in the tab
                order -- the rails are position: fixed, so where they
                sit in the DOM does not move them on screen. One
                wrapper holds both, so they start at one height and
                move up together (see bullet-rail.css).
            */}
            {!showIntroduction && (
                <div className="bullet-rails">
                    <div className="bullet-rails-row">
                        <BulletRail
                            side="left"
                            label="Pages"
                            items={railPages}
                            activeId={"page-" + currentSection.number}
                            onSelect={id => goToPage(pageIndexFromRailId(id))}
                            arrow={
                                <PageArrow
                                    direction="previous"
                                    label={session.isFirstSection() ? "Previous page: the Introduction" : undefined}
                                    onClick={previousPage}
                                />
                            }
                        />
                        <BulletRail
                            side="right"
                            label="Sections"
                            items={railSections}
                            activeId={activeRailSection}
                            onSelect={id => {
                                // Pinned first, so the jump's own scroll keeps it.
                                selectRailSection(id);
                                scrollToRailSection(id);
                            }}
                            arrow={onLastPage ? undefined : (
                                <PageArrow direction="next" disabled={nextDisabled} onClick={nextSection} />
                            )}
                        />
                    </div>
                </div>
            )}

            <AppFooter
                onBack={() => navigate("/assistant", { state: { capability: system?.capability } })}
            />

            {strategyPrompt && (
                <div className="confirmation-overlay" onClick={() => setStrategyPrompt(null)}>
                    <div className="confirmation-dialog" onClick={(event) => event.stopPropagation()}>

                        <h2 className="confirmation-title">{strategyPrompt.title}</h2>

                        <p className="confirmation-message">{strategyPrompt.message}</p>

                        <div className="confirmation-actions">

                            <button
                                className="confirmation-button secondary"
                                onClick={() => setStrategyPrompt(null)}
                            >
                                Cancel
                            </button>

                            <button
                                className="confirmation-button primary confirmation-button-danger"
                                onClick={() => {
                                    strategyPrompt.apply();
                                    setStrategyPrompt(null);
                                }}
                            >
                                Continue
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {exportStep === "warning" && (
                <div className="confirmation-overlay" onClick={() => setExportStep("none")}>
                    <div className="confirmation-dialog" onClick={(event) => event.stopPropagation()}>
                        <h2 className="confirmation-title">
                            Sections Incomplete
                        </h2>

                        {/*
                            What the list is and what the two buttons
                            do, before the list rather than after it.
                            A page of red names on their own reads as
                            a refusal; nothing here refuses anything.
                        */}
                        <p className="confirmation-lead">
                            These answers are still empty. Go back and fill them in, or
                            continue and export the System as it stands.
                        </p>

                        {/*
                            Grouped by the page each one is on, so the
                            reader sees three pages to return to
                            rather than eleven names in a column. A
                            page whose whole Section is incomplete is
                            its own heading and has nothing under it,
                            which is what the empty `units` means.
                        */}
                        <ul className="confirmation-warning-list">
                            {groupValidationIssues(validationIssues, framework.sections).map(group => (
                                <li key={group.number} className="confirmation-warning-group">

                                    <span className="confirmation-warning-page">
                                        {group.number}. {group.title}
                                    </span>

                                    {group.units.length > 0 && (
                                        <ul className="confirmation-warning-units">
                                            {group.units.map(unit => (
                                                <li key={unit.label}>
                                                    {unit.label} {unit.title}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

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
                                onClick={() => openExportOptions()}
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

                        {system?.id === "business" && (
                            <div className="export-options-group">
                                <div className="export-options-label">Document</div>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="document-choice"
                                        checked={documentChoice === "answers"}
                                        onChange={() => setDocumentChoice("answers")}
                                    />
                                    The Business System's answers
                                </label>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="document-choice"
                                        checked={documentChoice === "canvas"}
                                        onChange={() => setDocumentChoice("canvas")}
                                    />
                                    Business Model Canvas
                                </label>
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
