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

export type TableAnswerRow = Record<string, unknown>;

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

        case AnswerType.Table:
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

        case AnswerType.Table:
            return !Array.isArray(value) || value.length === 0;

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

        default:
            return [];

    }

}
