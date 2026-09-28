import {
    AnswerDefinition,
    AnswerPartDefinition,
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
     * The relative order every "ordered" Shared Field column
     * settles into once moved to the end of its Table (see
     * `reorderFieldColumnsToEnd` below) -- "If there are more
     * that 1 field columns then (1. Scale, 2. Category, 3.
     * Frequency, 4. Status.)". The Platform Field is
     * deliberately NOT one of these -- it stays wherever its
     * own column was declared, since a Platform is usually the
     * subject of a row (e.g. Campaign Tracker's own "Platforms"
     * column) rather than a trailing classification like Status.
     */
    private static readonly ORDERED_FIELD_PRIORITY = ["scale", "category", "frequency", "status"];

    /**
     * Moves every Scale/Category/Frequency/Status Field column
     * (see ORDERED_FIELD_PRIORITY above) to the end of a Table's
     * own column list, in that fixed relative order, while every
     * other column (plain text, Notes, Dynamic Field, Autofill,
     * the Platform Field, ...) keeps its original relative order
     * ahead of them -- "The Field columns should always be at the
     * end, of the table (except the platform)". Applied once, right
     * after a Table's columns are parsed (see `parseSingle`'s Table
     * branch below), so it's automatic for every Table across the
     * whole Framework, including each Table nested inside a Multi-
     * Part Section's own parts (parsed the same way, one part at a
     * time) -- no System content file needs to hand-order its own
     * columns to get this.
     */
    private reorderFieldColumnsToEnd(columns: TableColumnDefinition[]): TableColumnDefinition[] {

        const orderIndex = (column: TableColumnDefinition): number =>
            column.fieldId !== undefined
                ? AnswerParser.ORDERED_FIELD_PRIORITY.indexOf(column.fieldId)
                : -1;

        const regular = columns.filter(column => orderIndex(column) < 0);

        const ordered = columns
            .filter(column => orderIndex(column) >= 0)
            .slice()
            .sort((a, b) => orderIndex(a) - orderIndex(b));

        return [...regular, ...ordered];

    }

    /**
     * Parses a question answer block.
     *
     * The Answer Definition Resource records
     * the structure as a bold Markdown label,
     * e.g. "**Structure:** Free Text". Older
     * or hand-written resources may omit the
     * bold markers, so both are accepted.
     *
     * A Section's block may declare MORE THAN
     * ONE Structure -- e.g. Finance's Financial
     * Risk, written as four separate
     * "**Label**" / "Structure: ..." blocks one
     * after another under the same Section. Each
     * such labeled block (plus, optionally, one
     * UNLABELED block first, if the very first
     * "Structure:" in the markdown isn't preceded
     * by its own "**Label**" line -- see Brand's
     * Color System) becomes one part of a
     * MultiPart answer. A Section with only one
     * Structure declared (the overwhelming
     * majority) parses exactly as it always has --
     * this is purely additive.
     */
    public parse(markdown: string): AnswerDefinition {

        const parts = this.splitParts(markdown);

        if (parts.length > 1) {

            return {

                type: AnswerType.MultiPart,

                tabbed: this.isTabbedMultiPart(markdown) || undefined,

                columns: this.isColumnLayoutMultiPart(markdown) || undefined,

                nestedNumbering: this.isNestedNumbering(markdown) || undefined,

                parts: parts.map((part): AnswerPartDefinition => ({

                    id: part.label.length > 0 ? this.slug(part.label) : "primary",

                    label: part.label,

                    answer: this.parseSingle(part.body)

                }))

            };

        }

        const single = this.parseSingle(parts[0]?.body ?? markdown);

        // A Section declaring its own numbering carries that however
        // it is structured -- the Identity System's Legal Entity page
        // is one Structure rather than a set of columns, and still
        // numbers its six subsections 1 to 6 on their own.
        return this.isNestedNumbering(markdown)
            ? { ...single, nestedNumbering: true }
            : single;

    }

    /**
     * Detects a Section-level "**Tab Group:** Yes" declaration (see
     * AnswerDefinition.tabbed's own doc comment) -- written on its
     * own line ANYWHERE before the first labeled part starts (it has
     * no "Structure:" of its own, so `splitParts` already drops it
     * as unattributed leading content; this only needs to notice it
     * was there).
     */
    private isTabbedMultiPart(markdown: string): boolean {

        return /^\s*\*{0,2}Tab Group:\*{0,2}\s*Yes\s*$/im.test(markdown);

    }

    /**
     * Reads a Shared Answer's `**Source:** <System> / <Section>`
     * line -- which System's Section this one mirrors (see
     * AnswerType.SharedAnswer).
     *
     * The same "System / Section" shape a cross-System
     * `Dynamic Field` reference already uses, so content authors
     * meet one convention for "point at another System", not two.
     * Returns undefined when the line is missing or malformed;
     * the renderer then has nothing to mirror and says so rather
     * than rendering a silently empty page.
     */
    private parseSharedSource(
        markdown: string
    ): { systemTitle: string; sectionTitle: string } | undefined {

        const match = markdown.match(
            /^\s*\*{0,2}Source:\*{0,2}\s*(.+?)\s*\/\s*(.+?)\s*$/im
        );

        if (!match) {
            return undefined;
        }

        return {
            systemTitle: match[1].trim(),
            sectionTitle: match[2].trim()
        };

    }

    /**
     * Detects a Section-level "**Layout:** Columns" declaration (see
     * AnswerDefinition.columns's own doc comment) -- written on its
     * own line ANYWHERE before the first labeled part, exactly like
     * the "Tab Group: Yes" marker above, and dropped by `splitParts`
     * as unattributed leading content for the same reason.
     *
     * Deliberately spelled "Layout: Columns" rather than
     * "Columns: Yes" -- "**Columns:**" is already the Table
     * structure's own keyword for its column list, and reusing it
     * here would make a Multi-Part Section holding a Table
     * ambiguous to read (and to grep).
     */
    private isColumnLayoutMultiPart(markdown: string): boolean {

        return /^\s*\*{0,2}Layout:\*{0,2}\s*Columns\s*$/im.test(markdown);

    }

    /**
     * Detects a Section-level "**Numbering:** Nested" declaration
     * (see AnswerDefinition.nestedNumbering) -- written on its own
     * line beside the Layout line it goes with.
     */
    private isNestedNumbering(markdown: string): boolean {

        return /^\s*\*{0,2}Numbering:\*{0,2}\s*Nested\s*$/im.test(markdown);

    }

    /**
     * Splits a Section's raw Answer Definition
     * markdown into one or more parts, each its
     * own independently-parseable Structure
     * block (see `parse`'s own doc comment for
     * why this is needed at all).
     *
     * A "**Some Title**" line, entirely on its
     * own, immediately followed (skipping only
     * blank lines) by a "Structure:" line marks
     * the START of a new labeled part -- this is
     * exactly the markup pattern every multi-part
     * Answer Definition Resource entry already
     * uses. Any content before the FIRST such
     * marker is kept as an unlabeled leading part
     * ONLY if it itself contains a "Structure:"
     * declaration (i.e. the Section's very first
     * Structure has no "**Label**" of its own);
     * otherwise there's nothing to parse there and
     * it's dropped.
     */
    private splitParts(markdown: string): { label: string; body: string }[] {

        const lines = markdown.split("\n");

        const markers: { label: string; lineIndex: number }[] = [];

        for (let i = 0; i < lines.length; i++) {

            const boldOnlyMatch = lines[i].match(/^\s*\*\*(.+?)\*\*\s*$/);

            if (!boldOnlyMatch) {
                continue;
            }

            let followedByStructure = false;

            for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {

                const candidate = lines[j].trim();

                if (candidate.length === 0) {
                    continue;
                }

                // A bold "**Structure:**" form (Finance/Brand's own
                // style) needs the same leading `\*{0,2}` allowance
                // as the un-bolded "Structure:" form (Governance's) --
                // matching extractStructure's own unanchored version
                // of this same pattern below.
                followedByStructure = /^\*{0,2}Structure:\*{0,2}/.test(candidate);

                break;

            }

            if (followedByStructure) {
                markers.push({ label: boldOnlyMatch[1].trim(), lineIndex: i });
            }

        }

        if (markers.length === 0) {
            return [{ label: "", body: markdown }];
        }

        const parts: { label: string; body: string }[] = [];

        const leading = lines.slice(0, markers[0].lineIndex).join("\n");

        if (/Structure:\*{0,2}/.test(leading)) {
            parts.push({ label: "", body: leading });
        }

        for (let i = 0; i < markers.length; i++) {

            const start = markers[i].lineIndex;
            const end = i + 1 < markers.length ? markers[i + 1].lineIndex : lines.length;

            parts.push({

                label: markers[i].label,

                body: lines.slice(start, end).join("\n")

            });

        }

        return parts;

    }

    /**
     * Parses a single Structure block -- the
     * whole of what `parse` itself used to do
     * before Multi-Part support was added above.
     * Every part of a MultiPart answer is parsed
     * through this same method, one part's own
     * markdown at a time, so a Table/Free Text/
     * etc. part behaves identically whether it's
     * the whole Section's answer or one part of
     * several.
     */
    private parseSingle(markdown: string): AnswerDefinition {

        const structure = this.extractStructure(markdown);

        if (structure === "free text") {

            return {
                type: AnswerType.FreeText
            };

        }

        if (structure === "shared answer") {

            return {

                type: AnswerType.SharedAnswer,

                sharedSource: this.parseSharedSource(markdown)

            };

        }

        if (structure === "business foundation") {

            // Four fixed columns, each a different shape, all
            // declared by the editor rather than by the content --
            // so there is nothing to read out of the Markdown here
            // (the same as "legal entity" below).
            return {
                type: AnswerType.BusinessFoundation
            };

        }

        if (structure === "business engagement") {

            // Two fixed sections, both answered against Page 1's
            // own answer -- so, like "business foundation" above,
            // there is nothing for the content to declare.
            return {
                type: AnswerType.BusinessEngagement
            };

        }

        if (structure === "business capability") {

            // Two fixed sections of three fixed subsections, all
            // declared by the editor -- nothing for the content to
            // read out here, as with the two Business pages above.
            return {
                type: AnswerType.BusinessCapability
            };

        }

        if (structure === "financial foundation") {

            // Four fixed sections, declared by the editor, like the
            // three Business pages before it.
            return {
                type: AnswerType.FinancialFoundation
            };

        }

        if (structure === "financial sustainability") {

            return {
                type: AnswerType.FinancialSustainability
            };

        }

        if (structure === "legal entity") {

            return {
                type: AnswerType.LegalEntity
            };

        }

        if (structure === "brand style") {

            return {
                type: AnswerType.BrandStyle
            };

        }

        if (structure === "brand inventory") {

            return {
                type: AnswerType.BrandInventory
            };

        }

        if (structure === "strategy foundation") {

            return {
                type: AnswerType.StrategyFoundation
            };

        }

        if (structure === "strategic period") {

            return {
                type: AnswerType.StrategicPeriod
            };

        }

        if (structure === "strategic roadmap") {

            return {
                type: AnswerType.StrategicRoadmap
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

                    columns: this.reorderFieldColumnsToEnd(allColumns.slice(1)),

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

                // The Section part may itself be qualified with a
                // leading "System Title / " to point at a Section
                // belonging to a DIFFERENT System (e.g. "Business
                // System / Revenue Model") -- unqualified stays
                // scoped to the current System, exactly as before.
                const sectionPart = dynamicMatch[2].trim();
                const systemQualifiedMatch = sectionPart.match(/^(.+?)\s*\/\s*(.+)$/);

                dynamicSource = systemQualifiedMatch
                    ? {
                        systemTitle: systemQualifiedMatch[1].trim(),
                        sectionTitle: systemQualifiedMatch[2].trim(),
                        cardTitle: dynamicMatch[3].trim()
                    }
                    : {
                        sectionTitle: sectionPart,
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