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

            columns.forEach(column => { row[column.id] = ""; });

            return [row];

        }

        case AnswerType.Checklist:
            return [];

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

        default:
            return true;

    }

}

/**
 * Formats a Section response as Markdown lines,
 * following the shape declared by its Answer
 * Definition.
 */
export function formatAnswerAsMarkdown(answer: AnswerDefinition, value: unknown): string[] {

    switch (answer.type) {

        case AnswerType.FreeText: {

            const text = typeof value === "string" ? value.trim() : "";

            return [text];

        }

        case AnswerType.FixedVariantText: {

            const values: FixedVariantAnswerValue =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as FixedVariantAnswerValue
                    : {};

            const lines: string[] = [];

            for (const variant of answer.variants ?? []) {

                lines.push(`**${variant.title}:**`);
                lines.push("");
                lines.push(String(values[variant.id] ?? "").trim());
                lines.push("");

            }

            return lines;

        }

        case AnswerType.Table: {

            const columns = visibleTableColumns(answer.table?.columns ?? []);
            const rows: TableAnswerRow[] = Array.isArray(value) ? value as TableAnswerRow[] : [];

            if (columns.length === 0) {
                return [];
            }

            const lines: string[] = [];

            const headerCells = ["#", ...columns.map(column => column.title)];

            lines.push(`| ${headerCells.join(" | ")} |`);
            lines.push(`| ${headerCells.map(() => "---").join(" | ")} |`);

            rows.forEach((row, index) => {

                const cells = [
                    String(index + 1),
                    ...columns.map(column => {

                        const cell = row[column.id];

                        if (Array.isArray(cell)) {

                            return cell
                                .filter(item => typeof item === "string" && item.trim().length > 0)
                                .map((item, itemIndex) => `${itemIndex + 1}. ${item}`)
                                .join("; ");

                        }

                        return cell === undefined || cell === null ? "" : String(cell);

                    })
                ];

                lines.push(`| ${cells.join(" | ")} |`);

            });

            if (rows.length === 0) {
                lines.push("| _No rows._ |" + " |".repeat(columns.length));
            }

            return lines;

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

            return filled.map(
                item => `- [${item.checked ? "x" : " "}] ${item.text.trim()}`
            );

        }

        default:
            return [];

    }

}
