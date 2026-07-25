import {
    FrameworkDocument,
    FrameworkIntroduction,
    Metadata,
    Section,
    SectionBlock
} from "../model";

type RawSection = {
    number: number;
    title: string;
    lines: string[];
};

/**
 * Converts Framework Markdown into
 * a runtime FrameworkDocument.
 *
 * The Framework Markdown is the
 * single source of truth.
 *
 * The interpreter performs only
 * structural interpretation.
 *
 * It does not validate the Framework,
 * manage Interviews or populate
 * user responses.
 */
export class FrameworkInterpreter {

    /**
     * Interprets Framework Markdown.
     */
    public interpret(markdown: string): FrameworkDocument {

        const metadata = this.parseMetadata(markdown);
        const body = this.stripFrontMatter(markdown);
        const rawSections = this.parseRawSections(body);

        return {
            metadata,
            introduction: this.buildIntroduction(rawSections, metadata),
            sections: this.buildInterviewSections(rawSections)
        };
    }

    /**
     * Reads the YAML metadata block.
     */
    private parseMetadata(markdown: string): Metadata {

        const metadata: Metadata = {
            systemNumber: 0,
            systemName: "",
            capability: "",
            question: "",
            scope: "",
            version: 1
        };

        const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);

        if (!match) {
            return metadata;
        }

        for (const line of match[1].split(/\r?\n/)) {

            const separator = line.indexOf(":");

            if (separator < 0) {
                continue;
            }

            const key = line.substring(0, separator).trim();
            const value = line.substring(separator + 1).trim();

            switch (key) {
                case "systemNumber":
                    metadata.systemNumber = Number(value);
                    break;
                case "systemName":
                    metadata.systemName = value;
                    break;
                case "capability":
                    metadata.capability = value;
                    break;
                case "question":
                    metadata.question = value;
                    break;
                case "scope":
                    metadata.scope = value;
                    break;
                case "version":
                    metadata.version = Number(value);
                    break;
            }
        }

        return metadata;
    }

    /**
     * Removes the YAML metadata block
     * from the document.
     */
    private stripFrontMatter(markdown: string): string {

        return markdown.replace(
            /^---\r?\n[\s\S]*?\r?\n---\r?\n?/,
            ""
        );
    }

    /**
     * Parses top-level sections.
     *
     * Only headings in the form:
     *   # 1. Section Title
     * are treated as Framework sections.
     */
    private parseRawSections(markdown: string): RawSection[] {

        const sections: RawSection[] = [];
        const lines = markdown.split(/\r?\n/);

        let current: RawSection | null = null;

        for (const rawLine of lines) {

            const line = rawLine.trim();
            const match = line.match(/^#\s+(\d+)\.\s+(.+)$/);

            if (match) {

                if (current) {
                    sections.push(current);
                }

                current = {
                    number: Number(match[1]),
                    title: match[2].trim(),
                    lines: []
                };

                continue;
            }

            if (!current) {
                continue;
            }

            current.lines.push(rawLine);
        }

        if (current) {
            sections.push(current);
        }

        return sections;
    }

    /**
     * Builds the document introduction.
     *
     * The first Framework section is the
     * system introduction header.
     * The Overview section is stored as a
     * read-only introduction section.
     */
    private buildIntroduction(
        rawSections: RawSection[],
        metadata: Metadata
    ): FrameworkIntroduction {

        const rootSection = rawSections[0];

        const overviewRaw = rawSections.find(
            section => this.normalizeTitle(section.title) === "overview"
        );

        const rootBlocks = rootSection
            ? this.parseSectionBlocks(rootSection.lines)
            : [];

        const prefaceContent =
            rootBlocks.find(block => !block.heading)?.content ?? "";

        const capability =
            this.extractLabeledValue(prefaceContent, "Capability") ||
            metadata.capability;

        const guidingQuestion =
            this.extractLabeledValue(prefaceContent, "Guiding Question") ||
            metadata.question;

        const systemScope =
            this.normalizeTextBlock(
                rootBlocks.find(
                    block =>
                        this.normalizeTitle(block.heading) === "system scope" ||
                        this.normalizeTitle(block.heading) === "scope"
                )?.content ?? metadata.scope
            );

        const sections: Section[] = [];

        const indexBlock = rootBlocks.find(
            block => this.normalizeTitle(block.heading) === "index"
        );

        if (indexBlock) {

            sections.push({
                number: 0,
                title: "Index",
                interview: false,
                blocks: [
                    {
                        heading: "Index",
                        content: this.normalizeTextBlock(indexBlock.content)
                    }
                ]
            });
        }

        if (overviewRaw) {

            sections.push(
                this.createRuntimeSection(overviewRaw, 1, false)
            );
        }

        return {
            title: rootSection?.title || metadata.systemName,
            capability,
            guidingQuestion,
            systemScope,
            sections
        };
    }

    /**
     * Builds the interview sections.
     *
     * The first interview question is
     * always numbered 1, even though the
     * Markdown section numbering starts
     * earlier.
     */
    private buildInterviewSections(rawSections: RawSection[]): Section[] {

        const interviewSections: Section[] = [];
        let interviewNumber = 1;

        for (let i = 0; i < rawSections.length; i++) {

            const rawSection = rawSections[i];
            const normalizedTitle = this.normalizeTitle(rawSection.title);

            if (
                i === 0 ||
                normalizedTitle === "overview" ||
                normalizedTitle === "index" ||
                normalizedTitle === "system scope" ||
                normalizedTitle === "scope"
            ) {
                continue;
            }

            interviewSections.push(
                this.createRuntimeSection(rawSection, interviewNumber++, true)
            );
        }

        return interviewSections;
    }

    /**
     * Creates a runtime Section from a
     * parsed Markdown section.
     */
    private createRuntimeSection(
        rawSection: RawSection,
        number: number,
        interview: boolean
    ): Section {

        const blocks = this.parseSectionBlocks(rawSection.lines)
            .map(block => ({
                heading: this.normalizeHeading(block.heading),
                content: this.normalizeTextBlock(block.content)
            }))
            .filter(block =>
                block.heading.length > 0 || block.content.length > 0
            );

        return {
            number,
            title: rawSection.title,
            interview,
            blocks
        };
    }

    /**
     * Parses Markdown blocks inside a
     * single Framework section.
     *
     * Content before the first "##"
     * heading is preserved as a block
     * with an empty heading.
     */
    private parseSectionBlocks(lines: string[]): SectionBlock[] {

        const blocks: SectionBlock[] = [];

        let currentHeading = "";
        let currentContent: string[] = [];

        const flushBlock = () => {

            const content = currentContent.join("\n").trim();

            if (!currentHeading && content.length === 0) {
                currentContent = [];
                return;
            }

            blocks.push({
                heading: currentHeading,
                content
            });

            currentHeading = "";
            currentContent = [];
        };

        for (const rawLine of lines) {

            const line = rawLine.trim();
            const match = line.match(/^##\s+(.+)$/);

            if (match) {

                flushBlock();
                currentHeading = match[1].trim();
                continue;
            }

            currentContent.push(rawLine);
        }

        flushBlock();

        return blocks;
    }

    /**
     * Extracts a labeled value from a
     * block of text.
     *
     * Example:
     *   **Capability:** Foundation
     */
    private extractLabeledValue(text: string, label: string): string {

        const lines = text.split(/\r?\n/);

        for (const rawLine of lines) {

            const line = this.normalizeInline(rawLine.trim());

            const match = line.match(
                new RegExp(`^${this.escapeRegex(label)}:\\s*(.+)$`, "i")
            );

            if (match) {
                return match[1].trim();
            }
        }

        return "";
    }

    /**
     * Normalizes a Section heading.
     */
    private normalizeHeading(text: string): string {

        return this.normalizeInline(text).replace(/\s+/g, " ").trim();
    }

    /**
     * Normalizes Markdown inline syntax.
     */
    private normalizeInline(text: string): string {

        return text
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/__(.*?)__/g, "$1")
            .replace(/\*(.*?)\*/g, "$1")
            .replace(/_(.*?)_/g, "$1")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/\s+/g, " ")
            .trim();
    }

    /**
     * Normalizes a block of Markdown text.
     */
    private normalizeTextBlock(text: string): string {

        const lines = text.replace(/\r/g, "").split("\n");
        const output: string[] = [];

        for (let i = 0; i < lines.length; i++) {

            const rawLine = lines[i];
            const line = rawLine.trim();

            if (line.length === 0) {
                output.push("");
                continue;
            }

            if (this.isTableRow(line)) {

                const { lines: tableLines, nextIndex } =
                    this.normalizeTableBlock(lines, i);

                output.push(...tableLines);
                i = nextIndex;
                continue;
            }

            output.push(this.normalizeParagraphLine(rawLine));
        }

        return this.collapseBlankLines(output)
            .join("\n")
            .trim();
    }

    /**
     * Normalizes one paragraph line.
     */
    private normalizeParagraphLine(line: string): string {

        const trimmed = line.trim();

        if (trimmed.length === 0) {
            return "";
        }

        if (/^#{1,6}\s+/.test(trimmed)) {
            return this.normalizeInline(trimmed.replace(/^#{1,6}\s+/, ""));
        }

        if (/^>\s?/.test(trimmed)) {
            return this.normalizeInline(trimmed.replace(/^>\s?/, ""));
        }

        if (/^[-*+]\s+/.test(trimmed)) {
            return "• " + this.normalizeInline(trimmed.replace(/^[-*+]\s+/, ""));
        }

        if (/^\d+\.\s+/.test(trimmed)) {
            return this.normalizeInline(trimmed);
        }

        return this.normalizeInline(trimmed);
    }

    /**
     * Normalizes a Markdown table block
     * into readable lines.
     */
    private normalizeTableBlock(
        lines: string[],
        startIndex: number
    ): { lines: string[]; nextIndex: number } {

        const tableRows: string[] = [];
        let i = startIndex;

        while (i < lines.length) {

            const line = lines[i].trim();

            if (line.length === 0) {
                break;
            }

            if (!this.isTableRow(line) && !this.isTableSeparator(line)) {
                break;
            }

            tableRows.push(line);
            i++;
        }

        const output: string[] = [];

        if (tableRows.length === 0) {
            return { lines: output, nextIndex: startIndex };
        }

        const firstRow = this.splitTableRow(tableRows[0]);
        const hasHeaderSeparator =
            tableRows.length >= 2 && this.isTableSeparator(tableRows[1]);

        if (hasHeaderSeparator) {

            const headers = firstRow;
            const dataRows = tableRows.slice(2);

            for (const row of dataRows) {

                if (!this.isTableRow(row)) {
                    continue;
                }

                const cells = this.splitTableRow(row);

                for (let c = 0; c < cells.length; c++) {

                    const header = headers[c] ?? `Column ${c + 1}`;
                    const value = this.normalizeInline(cells[c]);

                    if (value.length > 0) {
                        output.push(`${header}: ${value}`);
                    }
                }

                output.push("");
            }

        } else {

            for (const row of tableRows) {

                if (this.isTableSeparator(row)) {
                    continue;
                }

                const cells = this.splitTableRow(row)
                    .map(cell => this.normalizeInline(cell))
                    .filter(cell => cell.length > 0);

                if (cells.length > 0) {
                    output.push(cells.join(" | "));
                }
            }
        }

        return {
            lines: this.collapseBlankLines(output),
            nextIndex: i - 1
        };
    }

    /**
     * Splits a Markdown table row into cells.
     */
    private splitTableRow(line: string): string[] {

        return line
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map(cell => cell.trim())
            .filter(cell => cell.length > 0);
    }

    /**
     * Detects whether a line is a table row.
     */
    private isTableRow(line: string): boolean {

        return /^\s*\|.*\|\s*$/.test(line);
    }

    /**
     * Detects whether a line is a table
     * separator row.
     */
    private isTableSeparator(line: string): boolean {

        const cleaned = line
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .trim();

        if (cleaned.length === 0) {
            return false;
        }

        return cleaned.split("|").every(cell => /^:?-{3,}:?$/.test(cell.trim()));
    }

    /**
     * Collapses consecutive blank lines
     * into a single blank line.
     */
    private collapseBlankLines(lines: string[]): string[] {

        const collapsed: string[] = [];
        let previousBlank = false;

        for (const line of lines) {

            const blank = line.trim().length === 0;

            if (blank) {
                if (!previousBlank) {
                    collapsed.push("");
                }
                previousBlank = true;
                continue;
            }

            collapsed.push(line.replace(/\s+$/, ""));
            previousBlank = false;
        }

        return collapsed;
    }

    /**
     * Normalizes a section title for
     * matching purposes.
     */
    private normalizeTitle(text: string): string {

        return this.normalizeInline(text).toLowerCase();
    }

    /**
     * Escapes a string for use in RegExp.
     */
    private escapeRegex(text: string): string {

        return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
}