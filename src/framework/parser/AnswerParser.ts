import {
    AnswerDefinition,
    ProfileCardsDefinition,
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

        if (structure === "t-layout text") {

            // Same "Number of Variants:" / "Variant N: Title" markup
            // as Fixed Variant Text -- see AnswerType.TLayoutText's
            // own doc comment for why this reuses that parsing and
            // value shape wholesale rather than declaring a separate
            // one.
            return {

                type: AnswerType.TLayoutText,

                variants: this.parseVariants(markdown)

            };

        }

        if (structure === "table") {

            const allColumns = this.parseColumns(markdown);

            // Column 1 of every Table Answer Definition is
            // always a placeholder for the automatic row-
            // number column the runtime renders itself (see
            // visibleTableColumns) -- its title is normally
            // "#", but a Table may declare a different label
            // (e.g. "Phase") to relabel that column without
            // turning it into a real, editable column.
            const rowNumberColumn = allColumns[0];

            const rowNumberLabel =
                rowNumberColumn && rowNumberColumn.title !== "#"
                    ? rowNumberColumn.title
                    : undefined;

            return {

                type: AnswerType.Table,

                table: {

                    columns: allColumns.slice(1),

                    rowNumberLabel

                }

            };

        }

        if (structure === "checklist") {

            return {
                type: AnswerType.Checklist
            };

        }

        if (structure === "card list") {

            return {

                type: AnswerType.CardList,

                cards: this.parseCards(markdown)

            };

        }

        if (structure === "profile cards") {

            return {

                type: AnswerType.ProfileCards,

                profile: this.parseProfileCards(markdown)

            };

        }

        if (structure === "process library") {

            // No further metadata to parse from Markdown -- unlike
            // Table/CardList/ProfileCards, a Process Library's shape
            // (Process -> SOPs -> Steps, with a fixed field set at
            // each level) is built into the runtime editor itself
            // rather than declared per-System.
            return {
                type: AnswerType.ProcessLibrary
            };

        }

        if (structure === "operational log") {

            // Same reasoning as Process Library above -- a fixed,
            // purpose-built field set (Date / Process ID / Owner of
            // Change / Type / Description / Reason / Outcome) and
            // always-chronological ordering, built into the runtime
            // editor itself rather than declared per-System.
            return {
                type: AnswerType.OperationalLog
            };

        }

        if (structure === "roles responsibilities") {

            // Same reasoning again -- this Structure's whole point
            // is that its content is DERIVED from a Process Library
            // elsewhere in the same System, so there is no column/
            // variant/card set to declare here at all.
            return {
                type: AnswerType.RolesResponsibilities
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
     *
     * A column's raw title may carry one
     * of three optional trailing
     * annotations (checked in this
     * priority order, since "Dynamic
     * Field (...)" and "... Field$"
     * would otherwise both match a plain
     * Shared Field reference):
     *
     * - "Title - Dynamic Field (Section: Card)"
     *   sources this column's dropdown
     *   options from another Section's
     *   live Card List response.
     * - "Title - Autofill" offers every
     *   distinct value already entered
     *   elsewhere in this same column as
     *   the user types (Excel-style).
     * - "Title - X Field" resolves to a
     *   static, registered Shared Field
     *   (Status, Scale, Frequency, ...).
     */
    private parseColumns(markdown: string): TableColumnDefinition[] {

        const columns: TableColumnDefinition[] = [];

        const regex = /Column\s+\d+:\s*(.+)/g;

        let match: RegExpExecArray | null;

        while ((match = regex.exec(markdown)) !== null) {

            let raw = match[1].trim();

            let title = raw;

            let fieldId: string | undefined;
            let dynamicSource: TableColumnDefinition["dynamicSource"];
            let autofill: boolean | undefined;
            let repeatable: boolean | undefined;
            let repeatableValue: boolean | undefined;
            let sumCheck: boolean | undefined;
            let groupSumCheck: boolean | undefined;

            // One or more trailing "[Tag]" markers (checked before
            // every other annotation, and stripped from `raw` so
            // the Dynamic Field / Autofill / Field regexes below --
            // which all anchor on the end of the string -- still
            // match normally) mark a column as list-valued (and, for
            // a paired column, kept in lock-step with the nearest
            // preceding list-valued column), and/or a value that
            // should sum to 100. A column can carry more than one at
            // once, e.g. "Method Mix (%) [Repeatable Value]
            // [Group Sum Check]".
            const tagsMatch = raw.match(/^(.*?)((?:\s*\[[^[\]]+\])+)\s*$/);

            if (tagsMatch) {

                raw = tagsMatch[1].trim();

                const tags = [...tagsMatch[2].matchAll(/\[([^[\]]+)\]/g)]
                    .map(tagGroup => tagGroup[1].trim().toLowerCase());

                if (tags.includes("repeatable")) {
                    repeatable = true;
                }

                if (tags.includes("repeatable value")) {
                    repeatableValue = true;
                }

                if (tags.includes("sum check")) {
                    sumCheck = true;
                }

                if (tags.includes("group sum check")) {
                    groupSumCheck = true;
                }

            }

            title = raw;

            const dynamicMatch = raw.match(
                /(.+?)\s*-\s*Dynamic Field\s*\(\s*(.+?)\s*:\s*(.+?)\s*\)\s*$/i
            );

            const autofillMatch = !dynamicMatch
                ? raw.match(/(.+?)\s*-\s*Autofill\s*$/i)
                : null;

            const fieldMatch = (!dynamicMatch && !autofillMatch)
                ? raw.match(/(.+?)\s*-\s*(.+?)\s+Field$/)
                : null;

            if (dynamicMatch) {

                title = dynamicMatch[1].trim();

                dynamicSource = {
                    sectionTitle: dynamicMatch[2].trim(),
                    cardTitle: dynamicMatch[3].trim()
                };

            } else if (autofillMatch) {

                title = autofillMatch[1].trim();
                autofill = true;

            } else if (fieldMatch) {

                title = fieldMatch[1].trim();
                fieldId = this.slug(fieldMatch[2]);

            }

            columns.push({

                id: this.slug(title),

                title,

                fieldId,

                dynamicSource,

                autofill,

                repeatable,

                repeatableValue,

                sumCheck,

                groupSumCheck

            });

        }

        return columns;

    }

    /**
     * Parses Card List cards.
     */
    private parseCards(markdown: string): VariantDefinition[] {

        const cards: VariantDefinition[] = [];

        const regex = /Card\s+\d+:\s*(.+)/g;

        let match: RegExpExecArray | null;

        while ((match = regex.exec(markdown)) !== null) {

            const title = match[1].trim();

            cards.push({

                id: this.slug(title),

                title

            });

        }

        return cards;

    }

    /**
     * Parses a Profile Cards definition.
     */
    private parseProfileCards(markdown: string): ProfileCardsDefinition {

        const cardLabelMatch = markdown.match(/Card Label:\*{0,2}\s*(.+)/);

        const cardLabel = cardLabelMatch
            ? cardLabelMatch[1].trim()
            : "Card";

        const initialCountMatch = markdown.match(/Initial Cards:\*{0,2}\s*(\d+)/);

        const initialCount = initialCountMatch
            ? Number(initialCountMatch[1])
            : 1;

        const subtitles: VariantDefinition[] = [];

        const subtitleRegex = /Subtitle\s+\d+:\s*(.+)/g;

        let match: RegExpExecArray | null;

        while ((match = subtitleRegex.exec(markdown)) !== null) {

            const title = match[1].trim();

            subtitles.push({

                id: this.slug(title),

                title

            });

        }

        const trailingTitleMatch = markdown.match(/Trailing Card:\*{0,2}\s*(.+)/);

        const trailingPlaceholderMatch = markdown.match(
            /Trailing Card Placeholder:\*{0,2}\s*(.+)/
        );

        const trailingCard = trailingTitleMatch
            ? {
                id: this.slug(trailingTitleMatch[1].trim()),
                title: trailingTitleMatch[1].trim(),
                placeholder: trailingPlaceholderMatch
                    ? trailingPlaceholderMatch[1].trim()
                    : undefined
            }
            : undefined;

        return {

            cardLabel,

            subtitles,

            initialCount,

            trailingCard

        };

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