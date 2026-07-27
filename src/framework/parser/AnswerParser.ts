import {
    AnswerDefinition,
    TableColumnDefinition,
    VariantDefinition,
} from "../model/index.ts";

import { AnswerType } from "../enums/AnswerType.ts";

/**
 * Parses a Framework answer definition
 * from Markdown.
 */
export class AnswerParser {

    /**
     * Parses a question answer block.
     *
     * The Answer Definition Resource records
     * the structure as a bold Markdown label,
     * e.g. "**Structure:** Free Text". Older
     * or hand-written resources may omit the
     * bold markers, so both are accepted.
     */
    public parse(markdown: string): AnswerDefinition {

        const structure = this.extractStructure(markdown);

        if (structure === "free text") {

            return {
                type: AnswerType.FreeText
            };

        }

        if (structure === "fixed variant text") {

            return {

                type: AnswerType.FixedVariantText,

                variants: this.parseVariants(markdown)

            };

        }

        if (structure === "table") {

            return {

                type: AnswerType.Table,

                table: {

                    columns: this.parseColumns(markdown)

                }

            };

        }

        throw new Error("Unknown answer structure.");

    }

    /**
     * Extracts the declared answer
     * structure, normalized to
     * lowercase for comparison.
     */
    private extractStructure(markdown: string): string | undefined {

        const match = markdown.match(
            /Structure:\*{0,2}\s*(.+)/
        );

        if (!match) {
            return undefined;
        }

        return match[1].trim().toLowerCase();

    }

    /**
     * Parses fixed variants.
     */
    private parseVariants(markdown: string): VariantDefinition[] {

        const variants: VariantDefinition[] = [];

        const regex = /Variant\s+\d+:\s*(.+)/g;

        let match: RegExpExecArray | null;

        while ((match = regex.exec(markdown)) !== null) {

            const title = match[1].trim();

            variants.push({

                id: this.slug(title),

                title

            });

        }

        return variants;

    }

    /**
     * Parses table columns.
     */
    private parseColumns(markdown: string): TableColumnDefinition[] {

        const columns: TableColumnDefinition[] = [];

        const regex = /Column\s+\d+:\s*(.+)/g;

        let match: RegExpExecArray | null;

        while ((match = regex.exec(markdown)) !== null) {

            const raw = match[1].trim();

            let title = raw;

            let fieldId: string | undefined;

            const fieldMatch = raw.match(/(.+?)\s*-\s*(.+?)\s+Field$/);

            if (fieldMatch) {

                title = fieldMatch[1].trim();

                fieldId = this.slug(fieldMatch[2]);

            }

            columns.push({

                id: this.slug(title),

                title,

                fieldId

            });

        }

        return columns;

    }

    /**
     * Converts a title into
     * a Framework identifier.
     */
    private slug(value: string): string {

        return value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    }

}