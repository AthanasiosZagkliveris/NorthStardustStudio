import { AnswerDefinition, TableColumnDefinition } from "../model/index.ts";

import { AnswerType } from "../enums/AnswerType.ts";

/**
 * Runtime value shapes produced by AnswerRenderer
 * for each Answer Structure.
 */
export type FixedVariantAnswerValue = Record<string, string>;

/**
 * Filters a raw Table's declared columns down
 * to the columns that should actually be
 * rendered/exported.
 *
 * A column explicitly titled "#" is a manual
 * row-number placeholder in the Answer
 * Definition Resource; the runtime always
 * renders/exports its own row-number column
 * instead, so any such column is dropped here
 * to avoid a duplicate.
 */
export function visibleTableColumns(
    columns: TableColumnDefinition[]
): TableColumnDefinition[] {

    return columns.filter(column => column.title.trim() !== "#");

}

/**
 * Determines whether a table column is a date,
 * so it can be rendered with a native date picker
 * instead of a plain text input.
 */
export function isDateColumn(title: string): boolean {

    return /\bdate\b/i.test(title);

}

export type TableAnswerRow = Record<string, unknown>;

/**
 * A single user-authored Checklist item.
 */
export interface ChecklistItemValue {
    id: string;
    text: string;
    checked: boolean;
}

/**
 * A single user-authored Card List
 * entry (used within one card's list).
 */
export interface CardListItemValue {
    id: string;
    text: string;
}

/**
 * Runtime value shape for a Card List
 * answer: each card's own reorderable
 * list of entries, keyed by card id.
 */
export type CardListAnswerValue = Record<string, CardListItemValue[]>;

/**
 * A single user-authored Profile Card.
 */
export interface ProfileCardValue {
    id: string;
    title: string;
    sections: Record<string, string>;
}

/**
 * Runtime value shape for a Profile
 * Cards answer.
 */
export interface ProfileCardsAnswerValue {
    cards: ProfileCardValue[];
    trailing?: string;
}

/**
 * Determines whether a single table cell has been
 * filled in, aware of the multi-entry ("list") cell
 * shape (an array of strings) as well as plain
 * text/date/field cells (a single string).
 */
function isCellFilled(cell: unknown): boolean {

    if (Array.isArray(cell)) {

        return cell.some(
            item => typeof item === "string" && item.trim().length > 0
        );

    }

    return typeof cell === "string" && cell.trim().length > 0;

}

/**
 * Returns the empty/default value appropriate
 * for the supplied Answer Definition.
 *
 * Used to seed a Section's response before the
 * user has entered anything.
 */
export function defaultAnswerValue(answer: AnswerDefinition): unknown {

    switch (answer.type) {

        case AnswerType.FixedVariantText:
            return {};

        case AnswerType.Table: {

            // Tables always start with one row -- an
            // empty table with only an "Add Row" button
            // reads as broken, not as "nothing entered
            // yet".
            const columns = visibleTableColumns(answer.table?.columns ?? []);

            const row: TableAnswerRow = {};

            // A `repeatable`/`repeatableValue` column's cell holds a
            // LIST of values (see DynamicTable's own `createRow`) --
            // seeded here the same way, so the very first row a
            // fresh Table starts with already has the right shape
            // instead of relying on DynamicTable to paper over a
            // lone scalar default the first time it renders.
            columns.forEach(column => {
                row[column.id] = (column.repeatable || column.repeatableValue) ? [""] : "";
            });

            return [row];

        }

        case AnswerType.Checklist:

            // A Checklist always starts with one blank item --
            // matches Table's "always at least one row" and
            // avoids an empty state where the only thing on
            // screen is an "Add Item" button.
            return [{ id: "checklist-item-default-1", text: "", checked: false }];

        case AnswerType.CardList: {

            const values: CardListAnswerValue = {};

            for (const card of answer.cards ?? []) {
                values[card.id] = [{ id: `${card.id}-default-1`, text: "" }];
            }

            return values;

        }

        case AnswerType.ProfileCards: {

            const profile = answer.profile;
            const count = Math.max(0, profile?.initialCount ?? 1);

            const cards: ProfileCardValue[] = Array.from(
                { length: count },
                (_, index) => ({
                    id: `card-${index + 1}`,
                    title: "",
                    sections: {}
                })
            );

            const value: ProfileCardsAnswerValue = { cards };

            if (profile?.trailingCard) {
                value.trailing = "";
            }

            return value;

        }

        case AnswerType.FreeText:
        default:
            return "";

    }

}

/**
 * Determines whether a Section response is
 * empty, in a way that is aware of the
 * Section's Answer Structure.
 */
export function isAnswerEmpty(answer: AnswerDefinition, value: unknown): boolean {

    switch (answer.type) {

        case AnswerType.FreeText:
            return typeof value !== "string" || value.trim().length === 0;

        case AnswerType.FixedVariantText: {

            if (!value || typeof value !== "object" || Array.isArray(value)) {
                return true;
            }

            const values = value as FixedVariantAnswerValue;

            return !Object.values(values).some(
                entry => typeof entry === "string" && entry.trim().length > 0
            );

        }

        case AnswerType.Table: {

            if (!Array.isArray(value) || value.length === 0) {
                return true;
            }

            // A row a user has added via "+ Add Row" but left
            // blank should NOT count as a completed answer --
            // every visible column of every row must be filled
            // for the Section to be considered complete.
            const columns = visibleTableColumns(answer.table?.columns ?? []);
            const rows = value as TableAnswerRow[];

            return rows.some(row =>
                columns.some(column => !isCellFilled(row[column.id]))
            );

        }

        case AnswerType.Checklist: {

            if (!Array.isArray(value) || value.length === 0) {
                return true;
            }

            const items = value as ChecklistItemValue[];

            return !items.some(
                item => typeof item.text === "string" && item.text.trim().length > 0
            );

        }

        case AnswerType.CardList: {

            if (!value || typeof value !== "object" || Array.isArray(value)) {
                return true;
            }

            const values = value as CardListAnswerValue;

            return !Object.values(values).some(items =>
                Array.isArray(items) && items.some(
                    item => typeof item.text === "string" && item.text.trim().length > 0
                )
            );

        }

        case AnswerType.ProfileCards: {

            if (!value || typeof value !== "object" || Array.isArray(value)) {
                return true;
            }

            const profileValue = value as ProfileCardsAnswerValue;
            const cards = Array.isArray(profileValue.cards) ? profileValue.cards : [];

            const cardsFilled = cards.some(card =>
                (typeof card.title === "string" && card.title.trim().length > 0) ||
                Object.values(card.sections ?? {}).some(
                    text => typeof text === "string" && text.trim().length > 0
                )
            );

            const trailingFilled =
                typeof profileValue.trailing === "string" &&
                profileValue.trailing.trim().length > 0;

            return !cardsFilled && !trailingFilled;

        }

        default:
            return true;

    }

}

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
    | { kind: "paragraph"; text: string }
    | { kind: "subheading"; text: string }
    | { kind: "table"; headers: string[]; rows: string[][] }
    | { kind: "checklist"; items: { text: string; checked: boolean }[] }
    | { kind: "list"; items: { text: string; indent: number }[]; ordered?: boolean };

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
function cellToText(cell: unknown): string {

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
function toParagraphs(text: string): string[] {

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
const EXPORT_BULLET_LINE = /^(\s*)(?:•|[*-]) (.*)$/;

// A line already recognized as a numbered list item by
// useListAutoFormat.ts (optional indent, digits, a period, one
// space, then content).
const EXPORT_NUMBERED_LINE = /^(\s*)\d+\.\s(.*)$/;

// How many leading-whitespace characters make up one indent step --
// matches TAB_INDENT_UNIT's length in useListAutoFormat.ts (that
// hook is the only thing that ever writes indented list lines, via
// Tab/Shift+Tab). Kept as a separate constant here rather than a
// shared import so this file -- plain export/formatting logic --
// doesn't take on a dependency on a React hook module.
const EXPORT_INDENT_UNIT_LENGTH = 2;

function indentLevel(whitespace: string): number {
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
function paragraphToBlocks(paragraph: string): ExportBlock[] {

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
            listItems.push({ text: bulletMatch[2], indent: indentLevel(bulletMatch[1]) });

        } else if (numberedMatch) {

            if (listMode === "bullet") {
                flushList();
            }

            flushProse();
            listMode = "numbered";
            listItems.push({ text: numberedMatch[2], indent: indentLevel(numberedMatch[1]) });

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
function toContentBlocks(text: string): ExportBlock[] {

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
export function buildAnswerBlocks(answer: AnswerDefinition, value: unknown): ExportBlock[] {

    switch (answer.type) {

        case AnswerType.FreeText: {

            const text = typeof value === "string" ? value.trim() : "";

            return toContentBlocks(text);

        }

        case AnswerType.FixedVariantText: {

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

        default:
            return [];

    }

}
