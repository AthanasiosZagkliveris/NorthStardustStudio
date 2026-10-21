/**
 * THE EXPORT BLOCKS: what a section's answer becomes in a Markdown or PDF export.
 * Split out of AnswerUtils.ts (still importable from there).
 */
import { AnswerDefinition } from "../model/index.ts";
import { AnswerType } from "../enums/AnswerType.ts";
import { LegalEntityValue } from "./AnswerLegal.ts";
import { OperationalLogRowValue, ProcessRecordValue, ProcessStepValue, processDisplayId, resolveProcessLogLabel, sopDisplayId, sortOperationalLogRows } from "./AnswerProcess.ts";
import { CardListAnswerValue, ChecklistItemValue, FixedVariantAnswerValue, ProfileCardsAnswerValue, RolesResponsibilitiesAnswerValue, TableAnswerRow, groupRolesResponsibilities, isCellFilled, visibleTableColumns } from "./AnswerUtils.ts";

/**
 * A structured, format-agnostic piece of exportable
 * Section content. Each export format (Markdown, PDF)
 * renders these idiomatically -- a real <table> in
 * PDF, an escaped pipe table in Markdown, and so on --
 * instead of every format sharing one lossy plain-text
 * shape (which is what made Tables and Checklists show
 * up as raw, unrendered syntax in the PDF export).
 */
export type ExportBlock =
    /** `label`, where there is one, is set in bold before the text: "Mission: …". */
    | { kind: "paragraph"; text: string; label?: string }
    /** Level 2 sits under level 1: a Profile under its Segment. */
    | { kind: "subheading"; text: string; level?: 1 | 2 }
    | { kind: "table"; headers: string[]; rows: string[][] }
    | { kind: "checklist"; items: { text: string; checked: boolean }[] }
    | { kind: "list"; items: { text: string; indent: number }[]; ordered?: boolean }
    /**
     * Pictures, each with its words beneath: the brand's logo, icon
     * and images in the Business Plan's brand guide. `src` is the
     * image as the Brand System saved it, a data URL. `marks`: a logo
     * and an icon, printed smaller than a photograph.
     */
    | { kind: "images"; items: ExportImage[]; marks?: boolean };

/** One picture in an export (see ExportBlock "images", ExportContent.documentLogo). */
export interface ExportImage {
    src: string;
    alt: string;
    /** Set in bold under the picture: "Logo", an image's name. */
    title?: string;
    /** Under the title: what the picture shows. */
    caption?: string;
}

/**
 * Whether a picture can go into an export: a base64 data URL of a
 * PNG, JPEG, GIF, WebP or SVG -- what the Brand System stores. The
 * exports write `src` into markup, so anything else is left out
 * rather than escaped.
 */
export function isExportableImage(src: string): boolean {
    return /^data:image\/(png|jpeg|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(src);
}

/**
 * Per-call rendering tweaks for buildAnswerBlocks, read only by
 * the Answer Structures that need them (currently just Process
 * Library) -- every other Structure ignores this parameter
 * entirely, so it stays optional rather than growing every
 * Structure's own signature.
 */
/**
 * What a page answered against other pages needs to export: the
 * other Sections of its own System, by Answer Structure, and the
 * facts read from the Identity System. See ExportRenderers.ts.
 */
export interface ExportContext {
    responseOf?: (type: AnswerType) => unknown;
    legalEntity?: LegalEntityValue;
    /** The Identity System's Founders Profile, as saved (see founderProfiles). */
    foundersProfile?: unknown;
    currency?: string;
}

export interface BuildAnswerBlocksOptions {

    /** For the pages with an editor of their own (see ExportRenderers.ts). */
    context?: ExportContext;

    /**
     * Process Library only: normally a Process with exactly 1 SOP
     * collapses that SOP's own heading away (see the collapse rule
     * on ProcessLibraryEditor.tsx) and shows its Steps directly
     * under the Process. When exporting a caller-filtered set of
     * SOPs (e.g. the "Selected SOPs" export scope in Conversation.
     * tsx), a Process can end up with just 1 SOP in the filtered
     * data purely because the others were filtered OUT -- not
     * because the Process itself only ever had 1. Collapsing that
     * away would silently hide which specific SOP the user chose
     * to export. Setting this to true always shows each SOP's own
     * "SOP-01.2 · Name" heading, regardless of how many SOPs
     * remain after filtering.
     */
    forceExpandProcessSops?: boolean;

    /**
     * Operational Log and Roles & Responsibilities only: the
     * SAME Operations System session's current Process Library
     * (Section 2) response, needed to resolve an Operational Log
     * entry's `processKey` into a "PRC-001 · Name" label, and to
     * group Roles & Responsibilities' Notes by Process Owner (see
     * groupRolesResponsibilities). The Framework Engine has no
     * built-in notion of "read another Section's response while
     * exporting this one", so the caller (see
     * ExportContentBuilder.buildExportContent's own
     * `sectionBlockOptions` hook, wired up in Conversation.tsx)
     * supplies it explicitly. Omitted (or omitted the calling
     * Section not being Operational Log/Roles & Responsibilities)
     * simply exports with no Process cross-reference resolved --
     * an Operational Log entry's Process shows blank, and Roles &
     * Responsibilities exports empty.
     */
    processLibrary?: ProcessRecordValue[];

    /**
     * Process Library only: when true, every Process/SOP's `.id` in
     * the data being exported is ALREADY the final computed display
     * ID ("PRC-001", not just typed initials like "PRC") -- so this
     * block should use `process.id`/`sop.id` directly rather than
     * running it back through processDisplayId/sopDisplayId.
     *
     * Why this exists: Conversation.tsx's own export flow needs a
     * Process's display ID to reflect its ORIGINAL position in the
     * FULL Process Library, even when the user chose to export only
     * a filtered subset (e.g. "Selected Processes") -- otherwise a
     * Process that was originally 6th would export as "PRC-001"
     * just because it's 1st in the filtered subset. To get that, it
     * pre-computes each ID against the full unfiltered list BEFORE
     * filtering, and sets this flag so this block won't recompute
     * against the (now positionally-meaningless) filtered list's
     * own indices -- recomputing there would both get the number
     * wrong AND double-append a second "-001" on top of the
     * already-final one, since processDisplayId always treats
     * whatever's in `.id` as bare initials to number, never as an
     * already-numbered ID to leave alone.
     */
    idsPreResolved?: boolean;

}

/**
 * Converts a single table cell's raw value into
 * exportable text.
 *
 * A `repeatable`/`repeatableValue` cell's entries are
 * joined with a real newline, one per line, rather than
 * "; " on a single line -- both exporters' own table-
 * cell escaping (MarkdownExporter's `escapeTableCell`,
 * PdfExporter's `renderBlockHtml`) already convert a
 * newline into "<br>", and an ordinary HTML/PDF table
 * cell grows to fit however many lines that produces, so
 * a Revenue Stream with several Revenue Methods (and
 * their paired Method Mix % entries, line-for-line) reads
 * as a short vertical list in its own cell instead of one
 * cramped "1. X; 2. Y; 3. Z" line.
 */
export function cellToText(cell: unknown): string {

    if (Array.isArray(cell)) {

        return cell
            .filter(item => typeof item === "string" && item.trim().length > 0)
            .map((item, index) => `${index + 1}. ${item}`)
            .join("\n");

    }

    return cell === undefined || cell === null ? "" : String(cell);

}

/**
 * Splits free text into paragraphs on blank lines,
 * trimming and dropping any that are empty.
 */
export function toParagraphs(text: string): string[] {

    return text
        .split(/\n{2,}/)
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0);

}

// A line already converted to a bullet by useListAutoFormat.ts's
// live-typing/paste trigger ("• " at the start of the line, exactly
// what gets stored in the raw answer text), OR a plain "- "/"* "
// line that somehow never got converted -- a safety net so a list
// still exports as a real list even if a raw markdown-style marker
// slips through the live editor untouched. Leading whitespace is
// captured (group 1) as the line's indent, added via Tab in the
// textarea -- see TAB_INDENT_UNIT in useListAutoFormat.ts.
//
// The content group is DELIBERATELY optional (`(?: (.*))?`, not a
// required trailing " (.*)") -- a freshly-typed, not-yet-filled-in
// item (just "• " or "1. " with nothing after it, which is exactly
// what the textarea holds the moment you press Enter to start a new
// item) has to still be recognized as a list line. Below, each raw
// line also gets its OWN trailing whitespace stripped before this
// regex ever sees it (see `paragraphToBlocks`), which erases that
// trailing marker space entirely for an empty item -- "• " becomes
// "•", "1. " becomes "1." -- so requiring the space unconditionally
// would silently fail to match those and demote the whole item to
// plain prose, which is exactly the bug this fixes: a paragraph
// gets rendered as one un-broken HTML line, so a handful of empty
// list items came out as a squished-together "1. 2. • •" instead of
// a real (if empty) list.
export const EXPORT_BULLET_LINE = /^(\s*)(?:•|[*-])(?: (.*))?$/;

// A line already recognized as a numbered list item by
// useListAutoFormat.ts (optional indent, digits, a period, then
// optionally a space and content -- see the comment on
// EXPORT_BULLET_LINE for why the content half is optional).
export const EXPORT_NUMBERED_LINE = /^(\s*)\d+\.(?:\s(.*))?$/;

// How many leading-whitespace characters make up one indent step --
// matches TAB_INDENT_UNIT's length in useListAutoFormat.ts (that
// hook is the only thing that ever writes indented list lines, via
// Tab/Shift+Tab). Kept as a separate constant here rather than a
// shared import so this file -- plain export/formatting logic --
// doesn't take on a dependency on a React hook module.
export const EXPORT_INDENT_UNIT_LENGTH = 2;

export function indentLevel(whitespace: string): number {
    return Math.floor(whitespace.length / EXPORT_INDENT_UNIT_LENGTH);
}

/**
 * Converts one paragraph's worth of free text (no blank
 * lines inside it -- those are already paragraph
 * boundaries, see `toParagraphs`) into export blocks,
 * recognizing runs of consecutive "• " bullet lines or
 * "N. " numbered lines (as produced by the textarea's
 * list auto-format feature, see useListAutoFormat.ts) as
 * real list blocks instead of losing their structure --
 * both exporters previously rendered a `paragraph` block
 * as one continuous line, which silently collapsed a
 * hand-typed list down to its bare markers ("• •",
 * "1. 2. 3.") with the line breaks (and so the separation
 * between items) discarded. Each item keeps its own indent
 * level, so a Tab-indented sub-point still renders nested
 * (not flattened to the same level as its parent) in both
 * the Markdown and PDF export.
 *
 * Any other, non-list lines in the paragraph are kept
 * together as a single `paragraph` block, exactly as
 * before.
 */
export function paragraphToBlocks(paragraph: string): ExportBlock[] {

    const blocks: ExportBlock[] = [];
    const lines = paragraph
        .split(/\r?\n/)
        .map(line => line.replace(/\s+$/, ""))
        .filter(line => line.trim().length > 0);

    let listMode: "bullet" | "numbered" | null = null;
    let listItems: { text: string; indent: number }[] = [];
    let proseLines: string[] = [];

    function flushProse() {

        if (proseLines.length > 0) {
            blocks.push({ kind: "paragraph", text: proseLines.join("\n") });
            proseLines = [];
        }

    }

    function flushList() {

        if (listItems.length > 0) {
            blocks.push({ kind: "list", items: listItems, ordered: listMode === "numbered" });
            listItems = [];
        }

        listMode = null;

    }

    for (const line of lines) {

        const bulletMatch = line.match(EXPORT_BULLET_LINE);
        const numberedMatch = line.match(EXPORT_NUMBERED_LINE);

        if (bulletMatch) {

            if (listMode === "numbered") {
                flushList();
            }

            flushProse();
            listMode = "bullet";
            listItems.push({ text: bulletMatch[2] ?? "", indent: indentLevel(bulletMatch[1]) });

        } else if (numberedMatch) {

            if (listMode === "bullet") {
                flushList();
            }

            flushProse();
            listMode = "numbered";
            listItems.push({ text: numberedMatch[2] ?? "", indent: indentLevel(numberedMatch[1]) });

        } else {

            flushList();
            proseLines.push(line.trim());

        }

    }

    flushList();
    flushProse();

    return blocks;

}

/**
 * Converts free text (already known to be non-blank) into
 * export blocks, splitting on blank-line paragraph
 * boundaries and recognizing bullet/numbered list lines
 * within each paragraph -- see `paragraphToBlocks`.
 */
export function toContentBlocks(text: string): ExportBlock[] {

    return toParagraphs(text).flatMap(paragraphToBlocks);

}

/**
 * Builds the exportable content of a Section response,
 * following the shape declared by its Answer
 * Definition. Returns an empty array when there is
 * nothing worth exporting (blank text, an all-blank
 * Table, an empty Checklist), so callers can show a
 * "No response" placeholder consistently.
 */
export function buildAnswerBlocks(
    answer: AnswerDefinition,
    value: unknown,
    options?: BuildAnswerBlocksOptions
): ExportBlock[] {

    switch (answer.type) {

        case AnswerType.FreeText: {

            const text = typeof value === "string" ? value.trim() : "";

            return toContentBlocks(text);

        }

        case AnswerType.FixedVariantText:
        case AnswerType.TLayoutText: {

            const values: FixedVariantAnswerValue =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as FixedVariantAnswerValue
                    : {};

            const blocks: ExportBlock[] = [];

            for (const variant of answer.variants ?? []) {

                const text = String(values[variant.id] ?? "").trim();

                if (text.length === 0) {
                    continue;
                }

                blocks.push({ kind: "subheading", text: variant.title });

                blocks.push(...toContentBlocks(text));

            }

            return blocks;

        }

        case AnswerType.Table: {

            const columns = visibleTableColumns(answer.table?.columns ?? []);
            const rows: TableAnswerRow[] = Array.isArray(value) ? value as TableAnswerRow[] : [];

            if (columns.length === 0) {
                return [];
            }

            // Rows the user never touched (every cell still
            // blank -- e.g. the single default row a fresh
            // Table starts with) are dropped from the export
            // rather than showing up as an empty row.
            const filledRows = rows.filter(
                row => columns.some(column => isCellFilled(row[column.id]))
            );

            if (filledRows.length === 0) {
                return [];
            }

            const headers = ["#", ...columns.map(column => column.title)];

            const dataRows = filledRows.map((row, index) => [
                String(index + 1),
                ...columns.map(column => cellToText(row[column.id]))
            ]);

            return [{ kind: "table", headers, rows: dataRows }];

        }

        case AnswerType.Checklist: {

            const items: ChecklistItemValue[] = Array.isArray(value)
                ? value as ChecklistItemValue[]
                : [];

            const filled = items.filter(
                item => typeof item.text === "string" && item.text.trim().length > 0
            );

            if (filled.length === 0) {
                return [];
            }

            return [{
                kind: "checklist",
                items: filled.map(item => ({ text: item.text.trim(), checked: item.checked }))
            }];

        }

        case AnswerType.CardList: {

            const values: CardListAnswerValue =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as CardListAnswerValue
                    : {};

            const blocks: ExportBlock[] = [];

            for (const card of answer.cards ?? []) {

                const items = (values[card.id] ?? []).filter(
                    item => typeof item.text === "string" && item.text.trim().length > 0
                );

                if (items.length === 0) {
                    continue;
                }

                blocks.push({ kind: "subheading", text: card.title });
                blocks.push({ kind: "list", items: items.map(item => ({ text: item.text.trim(), indent: 0 })) });

            }

            return blocks;

        }

        case AnswerType.ProfileCards: {

            const profileValue: ProfileCardsAnswerValue =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as ProfileCardsAnswerValue
                    : { cards: [] };

            const cards = Array.isArray(profileValue.cards) ? profileValue.cards : [];
            const blocks: ExportBlock[] = [];

            cards.forEach((card, index) => {

                const sections = card.sections ?? {};

                const hasContent =
                    (typeof card.title === "string" && card.title.trim().length > 0) ||
                    Object.values(sections).some(
                        text => typeof text === "string" && text.trim().length > 0
                    );

                if (!hasContent) {
                    return;
                }

                blocks.push({
                    kind: "subheading",
                    text: card.title?.trim().length > 0
                        ? card.title.trim()
                        : `${answer.profile?.cardLabel ?? "Card"} ${index + 1}`
                });

                for (const subtitle of answer.profile?.subtitles ?? []) {

                    const text = String(sections[subtitle.id] ?? "").trim();

                    if (text.length === 0) {
                        continue;
                    }

                    // Bold subsection label ("Strengths", "Needs", ...)
                    // on its own line, with the written text
                    // underneath it -- the same subheading-then-
                    // paragraph(s) pattern already used for the
                    // trailing "Market Position" card below and for
                    // Fixed Variant Text's own variant titles --
                    // rather than inlining "Label: text" onto one
                    // line.
                    blocks.push({ kind: "subheading", text: subtitle.title });

                    blocks.push(...toContentBlocks(text));

                }

            });

            const trailing = answer.profile?.trailingCard;
            const trailingText = String(profileValue.trailing ?? "").trim();

            if (trailing && trailingText.length > 0) {

                blocks.push({ kind: "subheading", text: trailing.title });

                blocks.push(...toContentBlocks(trailingText));

            }

            return blocks;

        }

        case AnswerType.ProcessLibrary: {

            const processes: ProcessRecordValue[] = Array.isArray(value) ? value as ProcessRecordValue[] : [];
            const blocks: ExportBlock[] = [];
            const forceExpandSops = options?.forceExpandProcessSops === true;

            const hasStepContent = (steps: ProcessStepValue[]) =>
                steps.some(step => typeof step.action === "string" && step.action.trim().length > 0);

            // A printable checklist (real "- [ ]" Markdown syntax /
            // an empty checkbox glyph in PDF -- see MarkdownExporter
            // and PdfExporter's own "checklist" block rendering)
            // rather than a plain table: the live editor no longer
            // offers a way to tick a Step off inside the app itself
            // (see ProcessLibraryEditor.tsx), but a printed or
            // exported SOP is exactly the kind of document someone
            // DOES want to physically check items off while
            // following it. `checked` reads whatever `done` value
            // is already stored (forward-compatible with any
            // already-saved data), but nothing in the current editor
            // can set it true anymore, so a fresh Step always starts
            // unchecked here.
            const stepsChecklistBlock = (steps: ProcessStepValue[]): ExportBlock | undefined => {

                const filled = steps.filter(
                    step => typeof step.action === "string" && step.action.trim().length > 0
                );

                if (filled.length === 0) {
                    return undefined;
                }

                return {
                    kind: "checklist",
                    items: filled.map(step => ({
                        text: step.action.trim(),
                        checked: step.done === true
                    }))
                };

            };

            processes.forEach((process, processIndex) => {

                const sops = Array.isArray(process.sops) ? process.sops : [];

                const hasContent =
                    (typeof process.name === "string" && process.name.trim().length > 0) ||
                    (typeof process.purpose === "string" && process.purpose.trim().length > 0) ||
                    sops.some(sop =>
                        (typeof sop.name === "string" && sop.name.trim().length > 0) ||
                        (typeof sop.purpose === "string" && sop.purpose.trim().length > 0) ||
                        hasStepContent(Array.isArray(sop.steps) ? sop.steps : [])
                    );

                if (!hasContent) {
                    return;
                }

                // See BuildAnswerBlocksOptions.idsPreResolved's own
                // doc comment -- when the caller already stamped the
                // final computed ID onto `process.id` (to preserve
                // original-position numbering through export-scope
                // filtering), use it as-is instead of recomputing,
                // which would both get the number wrong and
                // double-append a second suffix on top.
                const processId = options?.idsPreResolved
                    ? (typeof process.id === "string" && process.id.trim().length > 0 ? process.id.trim() : processDisplayId(processes, processIndex))
                    : processDisplayId(processes, processIndex);
                const processName = typeof process.name === "string" ? process.name.trim() : "";

                blocks.push({
                    kind: "subheading",
                    text: processName.length > 0 ? `${processId} · ${processName}` : processId
                });

                if (typeof process.purpose === "string" && process.purpose.trim().length > 0) {
                    blocks.push(...toContentBlocks(process.purpose.trim()));
                }

                const metaParts: string[] = [];

                if (typeof process.who === "string" && process.who.trim().length > 0) {
                    metaParts.push(`Owner: ${process.who.trim()}`);
                }

                if (typeof process.howOften === "string" && process.howOften.trim().length > 0) {
                    metaParts.push(`Frequency: ${process.howOften.trim()}`);
                }

                if (typeof process.status === "string" && process.status.trim().length > 0) {
                    metaParts.push(`Status: ${process.status.trim()}`);
                }

                if (metaParts.length > 0) {
                    blocks.push({ kind: "paragraph", text: metaParts.join(" · ") });
                }

                // Collapse rule (see ProcessLibraryEditor.tsx): 0 or 1
                // SOP renders that SOP's Steps directly under the
                // Process, with no SOP-level heading of its own --
                // UNLESS the caller explicitly asked to always show
                // SOP headings (see forceExpandSops's own doc
                // comment above), because a single remaining SOP
                // here is the result of export-time filtering, not
                // because the Process only ever had one.
                if (sops.length <= 1 && !forceExpandSops) {

                    const steps = Array.isArray(sops[0]?.steps) ? sops[0].steps : [];
                    const checklist = stepsChecklistBlock(steps);

                    if (checklist) {
                        blocks.push(checklist);
                    }

                } else {

                    sops.forEach((sop, sopIndex) => {

                        const steps = Array.isArray(sop.steps) ? sop.steps : [];

                        const sopHasContent =
                            (typeof sop.name === "string" && sop.name.trim().length > 0) ||
                            (typeof sop.purpose === "string" && sop.purpose.trim().length > 0) ||
                            hasStepContent(steps);

                        if (!sopHasContent) {
                            return;
                        }

                        const sopId = options?.idsPreResolved
                            ? (typeof sop.id === "string" && sop.id.trim().length > 0 ? sop.id.trim() : sopDisplayId(sops, sopIndex))
                            : sopDisplayId(sops, sopIndex);
                        const sopName = typeof sop.name === "string" ? sop.name.trim() : "";

                        blocks.push({
                            kind: "subheading",
                            text: sopName.length > 0 ? `${sopId} · ${sopName}` : sopId
                        });

                        if (typeof sop.purpose === "string" && sop.purpose.trim().length > 0) {
                            blocks.push(...toContentBlocks(sop.purpose.trim()));
                        }

                        const sopMetaParts: string[] = [];

                        if (typeof sop.who === "string" && sop.who.trim().length > 0) {
                            sopMetaParts.push(`Owner: ${sop.who.trim()}`);
                        }

                        if (typeof sop.howOften === "string" && sop.howOften.trim().length > 0) {
                            sopMetaParts.push(`Frequency: ${sop.howOften.trim()}`);
                        }

                        if (sopMetaParts.length > 0) {
                            blocks.push({ kind: "paragraph", text: sopMetaParts.join(" · ") });
                        }

                        const checklist = stepsChecklistBlock(steps);

                        if (checklist) {
                            blocks.push(checklist);
                        }

                    });

                }

            });

            return blocks;

        }

        case AnswerType.OperationalLog: {

            const rows: OperationalLogRowValue[] = Array.isArray(value) ? value as OperationalLogRowValue[] : [];
            const processes = options?.processLibrary ?? [];

            const filled = rows.filter(row =>
                (typeof row.date === "string" && row.date.trim().length > 0) ||
                (typeof row.description === "string" && row.description.trim().length > 0)
            );

            if (filled.length === 0) {
                return [];
            }

            const sorted = sortOperationalLogRows(filled);

            const headers = ["#", "Date", "Process", "Owner", "Description", "Notes"];

            const dataRows = sorted.map((row, index) => [
                String(index + 1),
                row.date.trim(),
                resolveProcessLogLabel(row.processKey, processes),
                row.ownerOfChange.trim(),
                row.description.trim(),
                row.notes.trim()
            ]);

            return [{ kind: "table", headers, rows: dataRows }];

        }

        case AnswerType.RolesResponsibilities: {

            const processes = options?.processLibrary ?? [];

            const notes: RolesResponsibilitiesAnswerValue =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as RolesResponsibilitiesAnswerValue
                    : {};

            const groups = groupRolesResponsibilities(processes, notes);

            const blocks: ExportBlock[] = [];

            groups.forEach(group => {

                blocks.push({ kind: "subheading", text: group.owner });

                blocks.push({
                    kind: "table",
                    headers: ["Process ID", "Responsibility", "Notes"],
                    rows: group.entries.map(entry => [
                        processDisplayId(processes, entry.processIndex),
                        entry.process.name.trim().length > 0 ? entry.process.name.trim() : "Untitled Process",
                        entry.notes.trim()
                    ])
                });

            });

            return blocks;

        }

        case AnswerType.MultiPart: {

            const values: Record<string, unknown> =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as Record<string, unknown>
                    : {};

            const blocks: ExportBlock[] = [];

            for (const part of answer.parts ?? []) {

                const partBlocks = buildAnswerBlocks(part.answer, values[part.id], options);

                if (partBlocks.length === 0) {
                    continue;
                }

                if (part.label.length > 0) {
                    blocks.push({ kind: "subheading", text: part.label });
                }

                blocks.push(...partBlocks);

            }

            return blocks;

        }

        default:
            return [];

    }

}
