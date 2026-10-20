import { Fragment, ReactNode } from "react";
import { InterviewManager, ReviewManager } from "../framework/application";
import { InterviewSession } from "../framework/interview";
import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";
import { AnswerDefinition, Section, ValidationIssue, ValidationResult } from "../framework/model";
import { AnswerType } from "../framework/enums/AnswerType";
import { CardListAnswerValue, isAnswerEmpty, isTableRowComplete, ProcessRecordValue, TableAnswerRow, visibleTableColumns } from "../framework/engine/AnswerUtils.ts";
import { StorageService } from "../services/StorageService";
import { OrganizationService } from "../services/OrganizationService";
import { systems } from "../data/systems";

/** What the interview page (Conversation.tsx) reads and checks before it draws: where a System's sections are, what is shared between Systems, the validation of a section, and the bold in a sentence. No state, no hooks. */

/**
 * Where the Target Audience is answered: the Identity System, on
 * its Definition page, in the Positioning column. Read by the
 * Business System's Foundation page (see targetAudience below).
 */
export const IDENTITY_SYSTEM_NUMBER = 1;
export const IDENTITY_DEFINITION_SECTION = 1;

/** The Business System: answered before Strategy, which drafts from it. */
export const BUSINESS_SYSTEM_NUMBER = 3;

export const interviewManager = new InterviewManager();
export const reviewManager = new ReviewManager();

/** Titles are matched loosely: trimmed and case-insensitive. */
export const normalize = (text: string) => text.trim().toLowerCase();

/**
 * A System, found by its title, and one of its Sections, found by
 * its title; null when either is missing.
 */
export function findSystemSection(systemTitle: string, sectionTitle: string) {

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
export function resolveSharedAnswerValue(
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

export type ExportStep = "none" | "warning" | "options";
export type CapabilityChoice = "original" | "other";

/**
 * The Product Development System's Export Options offer a choice
 * (item's follow-up request) between exporting just the currently
 * selected Product's own content, or the whole System file covering
 * every Product -- irrelevant to every other System, which only
 * ever exports "system"-scoped (the whole, single-Product-Register-
 * free document it always has).
 */
export type ExportScope = "product" | "system";

/**
 * The Operations System's own Export Options offer a similar,
 * but structurally different, choice (item 7 of the same round
 * of feedback as the Process Library row-actions/ID/Shift+Click
 * work): export every Process, just a hand-picked subset of
 * Processes (each with all of its own SOPs), or a hand-picked
 * subset of individual SOPs across any Processes. Irrelevant to
 * every other System.
 */
export type OperationsExportScope = "all" | "selected-processes" | "selected-sops";

/**
 * The Operations System's Process Library is always its own
 * Section 2 (Handbook is 1, Operational Log 3, Roles &
 * Responsibilities 4 -- see 08_OperationsSystemAnswer.md).
 */
export const OPERATIONS_PROCESS_LIBRARY_SECTION = 2;

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
export const OPERATIONS_OPERATIONAL_LOG_SECTION = 3;
export const OPERATIONS_ROLES_SECTION = 4;

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
export const SHARED_PRODUCT_REGISTER_BINDINGS: { systemId: string; sectionTitle: string }[] = [
    { systemId: "product-development", sectionTitle: "Product Register" }
];

/** A Section's title, by its number in the current Session. */
export function sectionTitleOf(session: InterviewSession, sectionNumber: number): string | undefined {
    return session.getSections().find(section => section.number === sectionNumber)?.title;
}

export function isSharedProductRegisterSection(
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
export const SHARED_TARGET_AUDIENCE_PART_BINDINGS: { systemId: string; sectionNumber: number; partId: string }[] = [
    { systemId: "publishing", sectionNumber: 1, partId: "target-audience" },
    { systemId: "website", sectionNumber: 1, partId: "target-audience" }
];

export function findSharedTargetAudiencePartBinding(
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
export const SOCIAL_MEDIA_AUDIENCE_PROFILES_BINDING = { systemId: "social-media", sectionNumber: 1 };

export function isSocialMediaAudienceProfilesSection(systemId: string | undefined, sectionNumber: number): boolean {
    return systemId === SOCIAL_MEDIA_AUDIENCE_PROFILES_BINDING.systemId
        && sectionNumber === SOCIAL_MEDIA_AUDIENCE_PROFILES_BINDING.sectionNumber;
}

export function normalizeAudienceName(value: unknown): string {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/**
 * Extracts just the shared { name, description } shape out of a
 * Target Audience Table's own rows (used both for the Publishing/
 * Website Multi-Part part, whose rows already only ever hold these
 * two columns, and for pushing Social Media's wider table's own
 * first two columns back into the shared store).
 */
export function extractSharedAudienceRows(rows: unknown): TableAnswerRow[] {

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
export function mergeSharedAudienceIntoSocialMediaRows(sharedRows: unknown, localRows: unknown): TableAnswerRow[] {

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
export const PRODUCT_DEVELOPMENT_PER_PRODUCT_SECTIONS = new Set([2, 3, 4, 5, 6, 7]);

/**
 * Pulls every non-blank "Product" cell out of the shared
 * Product Register's rows, de-duplicated -- used to populate
 * the Product Development System's product picker (item 7).
 * Rows are matched by their Product name text rather than a
 * synthetic row id, the same way `resolveDynamicOptions`
 * below matches Sections/Cards by title text.
 */
export function extractProductNames(rows: unknown): string[] {

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
export function extractDynamicOptions(
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
export function groupValidationIssues(
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
export function validateProductDevelopmentForProduct(
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
export function validateOperationsProcessOwnership(
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
export function splitIntoSentences(text: string): string[] {

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
export function withBold(text: string): ReactNode[] {

    return text.split(/(\*\*[^*]+\*\*)/).filter(part => part.length > 0).map((part, index) =>
        /^\*\*[^*]+\*\*$/.test(part)
            ? <strong key={index}>{part.slice(2, -2)}</strong>
            : <Fragment key={index}>{part}</Fragment>
    );

}

