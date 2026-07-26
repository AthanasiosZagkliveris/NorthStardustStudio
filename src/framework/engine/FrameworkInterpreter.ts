import {
    FrameworkDocument,
    FrameworkIntroduction,
    Metadata,
    Section,
    SectionBlock
} from "../model";

export type FrameworkSource = {
    introductionMarkdown?: string;
    questionsMarkdown?: string;
    helpMarkdown?: string;
    answersMarkdown?: string;
    fieldsMarkdown?: string;
};

type RawSection = {
    number: number;
    title: string;
    lines: string[];
};

/**
 * Converts Framework Markdown into
 * a runtime FrameworkDocument.
 *
 * The interpreter supports both the
 * original single-file Framework and
 * the new multi-file system package.
 *
 * It performs only structural
 * interpretation.
 */
export class FrameworkInterpreter {

    /**
     * Interprets Framework content.
     */
    public interpret(markdown: string): FrameworkDocument;
    public interpret(source: FrameworkSource): FrameworkDocument;
    public interpret(
        input: string | FrameworkSource
    ): FrameworkDocument {

        if (typeof input === "string") {
            return this.interpretLegacy(input);
        }

        return this.interpretPackage(input);
    }

    /**
     * Interprets the original single-file
     * Framework Markdown document.
     */
    private interpretLegacy(markdown: string): FrameworkDocument {

        const metadata = this.parseLegacyMetadata(markdown);
        const body = this.stripFrontMatter(markdown);
        const rawSections = this.parseLegacySections(body);

        return {
            metadata,
            introduction: this.buildLegacyIntroduction(rawSections, metadata),
            sections: this.buildLegacyInterviewSections(rawSections)
        };
    }

    /**
     * Interprets the new multi-file
     * Framework package.
     */
    private interpretPackage(source: FrameworkSource): FrameworkDocument {

        const metadata =
            this.parsePackageMetadata(
                source.questionsMarkdown ?? ""
            );

        const questionSections =
            this.parseQuestionSections(
                source.questionsMarkdown ?? ""
            );

        const introductionMarkdown =
            source.introductionMarkdown ?? "";

        const helpSections =
            this.parseSupplementarySections(
                source.helpMarkdown ?? "",
                "Help",
                title => this.stripHelpSuffix(title)
            );

        const answerSections =
            this.parseSupplementarySections(
                source.answersMarkdown ?? "",
                "Answer Format"
            );

        const introductionText =
            this.findPackageIntroduction(
                introductionMarkdown,
                metadata
            );

        const guidingQuestion =
            metadata.question.trim().length > 0
                ? metadata.question
                : this.extractFirstQuestion(questionSections);

        const introduction =
            this.buildPackageIntroduction(
                metadata,
                introductionText,
                guidingQuestion
            );

        const sections = questionSections.map(section => {

            const normalizedTitle =
                this.normalizeTitle(section.title);

            const blocks: SectionBlock[] = [
                ...section.blocks,
                ...(helpSections.get(normalizedTitle) ?? []),
                ...(answerSections.get(normalizedTitle) ?? [])
            ];

            return {
                ...section,
                blocks
            };
        });

        return {
            metadata: {
                ...metadata,
                question: guidingQuestion
            },
            introduction,
            sections
        };
    }

    /**
     * Reads the YAML metadata block from
     * the original single-file Framework.
     */
    private parseLegacyMetadata(markdown: string): Metadata {

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

            const key = this.normalizeMetadataKey(
                line.substring(0, separator).trim()
            );

            const value = line.substring(separator + 1).trim();

            switch (key) {
                case "systemnumber":
                    metadata.systemNumber = Number(value);
                    break;
                case "systemname":
                    metadata.systemName = value;
                    break;
                case "capability":
                    metadata.capability = value;
                    break;
                case "question":
                    metadata.question = value;
                    break;
                case "scope":
                case "systemscope":
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
     * Parses metadata from the new
     * Questions document.
     */
    private parsePackageMetadata(markdown: string): Metadata {

        const metadata: Metadata = {
            systemNumber: 0,
            systemName: "",
            capability: "",
            question: "",
            scope: "",
            version: 1
        };

        const headerLines: string[] = [];
        const lines = markdown.split(/\r?\n/);

        for (const rawLine of lines) {

            const line = rawLine.trim();

            if (/^##\s+\d+\./.test(line)) {
                break;
            }

            if (line.length === 0) {
                continue;
            }

            headerLines.push(rawLine);
        }

        for (const rawLine of headerLines) {

            const separator = rawLine.indexOf(":");

            if (separator < 0) {
                continue;
            }

            const key = this.normalizeMetadataKey(
                rawLine.substring(0, separator).trim()
            );

            const value = rawLine.substring(separator + 1).trim();

            switch (key) {
                case "systemnumber":
                    metadata.systemNumber = Number(value);
                    break;
                case "systemname":
                    metadata.systemName = value;
                    break;
                case "capability":
                    metadata.capability = value;
                    break;
                case "question":
                case "guidingquestion":
                    metadata.question = value;
                    break;
                case "scope":
                case "systemscope":
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
     * from the original single-file
     * Framework document.
     */
    private stripFrontMatter(markdown: string): string {

        return markdown.replace(
            /^---\r?\n[\s\S]*?\r?\n---\r?\n?/,
            ""
        );
    }

    /**
     * Parses top-level sections from the
     * original single-file Framework.
     *
     * Only headings in the form:
     *   # 1. Section Title
     * are treated as Framework sections.
     */
    private parseLegacySections(markdown: string): RawSection[] {

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
     * Builds the original document
     * introduction.
     */
    private buildLegacyIntroduction(
        rawSections: RawSection[],
        metadata: Metadata
    ): FrameworkIntroduction {

        const rootSection = rawSections[0];

        const overviewRaw = rawSections.find(
            section => this.normalizeTitle(section.title) === "overview"
        );

        const rootBlocks = rootSection
            ? this.parseLegacySectionBlocks(rootSection.lines)
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
     * Builds the original interview
     * sections.
     */
    private buildLegacyInterviewSections(rawSections: RawSection[]): Section[] {

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
                this.createRuntimeSection(
                    rawSection,
                    interviewNumber++,
                    true
                )
            );
        }

        return interviewSections;
    }

    /**
     * Parses the section list from the
     * new Questions document.
     */
    private parseQuestionSections(markdown: string): Section[] {

        const sections = this.parseDocumentSections(
            markdown,
            /^##\s+(\d+)\.\s+(.+)$/
        );

        return sections.map(section => ({
            number: section.number,
            title: section.title,
            interview: true,
            blocks: this.parseContentBlocks(section.lines, "Questions")
        }));
    }

    /**
     * Parses supplementary documents such
     * as Help or Answer Format into a
     * section lookup table.
     */
    private parseSupplementarySections(
        markdown: string,
        defaultHeading: string,
        transformTitle: (title: string) => string = title => title
    ): Map<string, SectionBlock[]> {

        const sections = this.parseDocumentSections(
            markdown,
            /^##\s+(\d+)\.\s+(.+)$/
        );

        const lookup = new Map<string, SectionBlock[]>();

        for (const section of sections) {

            lookup.set(
                this.normalizeTitle(
                    transformTitle(section.title)
                ),
                this.parseContentBlocks(
                    section.lines,
                    defaultHeading
                )
            );

        }

        return lookup;
    }

    /**
     * Parses top-level sections from a
     * numbered Markdown document.
     */
    private parseDocumentSections(
        markdown: string,
        sectionPattern: RegExp
    ): RawSection[] {

        const sections: RawSection[] = [];
        const lines = markdown.split(/\r?\n/);

        let current: RawSection | null = null;

        for (const rawLine of lines) {

            const line = rawLine.trim();
            const match = line.match(sectionPattern);

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
     * Converts a raw section body into
     * displayable blocks.
     *
     * If the content uses explicit label
     * lines such as "**Structure:**",
     * each label becomes its own block.
     * Otherwise the whole body is kept as
     * a single block.
     */
    private parseContentBlocks(
        lines: string[],
        defaultHeading: string
    ): SectionBlock[] {

        const blocks: SectionBlock[] = [];
        let currentHeading = defaultHeading;
        let currentContent: string[] = [];
        let sawExplicitHeading = false;

        const flush = () => {

            const content = this.normalizeTextBlock(
                currentContent.join("\n")
            );

            if (!sawExplicitHeading && content.length === 0) {
                currentContent = [];
                return;
            }

            blocks.push({
                heading: currentHeading,
                content
            });

            currentHeading = defaultHeading;
            currentContent = [];
        };

        for (const rawLine of lines) {

            const trimmed = rawLine.trim();

            const labelMatch = trimmed.match(
                /^\*\*(.+?)\*\*:\s*(.*)$/
            );

            if (labelMatch) {

                if (currentContent.length > 0 || sawExplicitHeading) {
                    flush();
                }

                sawExplicitHeading = true;
                currentHeading = this.normalizeInline(labelMatch[1]);
                currentContent = [];

                if (labelMatch[2].trim().length > 0) {
                    currentContent.push(labelMatch[2]);
                }

                continue;
            }

            currentContent.push(rawLine);
        }

        flush();

        return blocks.filter(block =>
            block.heading.trim().length > 0 ||
            block.content.trim().length > 0
        );
    }



    /**
     * Removes the trailing "Help" suffix from
     * section titles.
     */
    private stripHelpSuffix(title: string): string {

        return title
            .replace(/\s+Help$/i, "")
            .trim();
    }
    /**
     * Builds the introduction for the new
     * multi-file Framework package.
     */
    private buildPackageIntroduction(
        metadata: Metadata,
        introductionText: string,
        guidingQuestion: string
    ): FrameworkIntroduction {

        const sections: Section[] = introductionText.trim().length > 0
            ? [
                {
                    number: 0,
                    title: "Introduction",
                    interview: false,
                    blocks: [
                        {
                            heading: "Introduction",
                            content: this.normalizeTextBlock(
                                introductionText
                            )
                        }
                    ]
                }
            ]
            : [];

        return {
            title: metadata.systemName,
            capability: metadata.capability,
            guidingQuestion,
            systemScope: metadata.scope,
            sections
        };
    }

    /**
     * Finds the introduction text for the
     * current system within the shared
     * SystemsIntroduction file.
     */
    private findPackageIntroduction(
        markdown: string,
        metadata: Metadata
    ): string {

        if (!markdown.trim()) {
            return "";
        }

        const sections = this.parseDocumentSections(
            markdown,
            /^##\s+(\d+)\.\s+(.+)$/
        );

        const introByTitle = new Map<string, string>();

        for (const section of sections) {
            introByTitle.set(
                this.normalizeTitle(section.title),
                this.normalizeTextBlock(section.lines.join("\n"))
            );
        }

        const preferredTitle = this.normalizeTitle(
            metadata.systemName
        );

        const byTitle = introByTitle.get(preferredTitle);

        if (byTitle) {
            return byTitle;
        }

        if (metadata.systemNumber > 0) {
            const expectedPrefix = metadata.systemNumber
                .toString()
                .padStart(2, "0");

            for (const [title, content] of introByTitle.entries()) {

                if (title.startsWith(expectedPrefix)) {
                    return content;
                }
            }
        }

        return introByTitle.values().next().value ?? "";
    }

    /**
     * Extracts the first question from the
     * question sections so the Introduction
     * has a useful guiding question.
     */
    private extractFirstQuestion(sections: Section[]): string {

        for (const section of sections) {

            for (const block of section.blocks) {

                const lines = block.content
                    .split(/\r?\n/)
                    .map(line => line.trim());

                for (const line of lines) {

                    const question = line
                        .replace(/^[•*-]\s*/, "")
                        .trim();

                    if (question.length > 0) {
                        return question;
                    }
                }
            }
        }

        return "";
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

        const blocks = this.parseLegacySectionBlocks(rawSection.lines)
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
     * single original Framework section.
     */
    private parseLegacySectionBlocks(lines: string[]): SectionBlock[] {

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

            // Ignore Markdown horizontal rules.
            if (/^-{3,}$/.test(line)) {
                continue;
            }

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

        // Ignore Markdown horizontal rules.
        if (/^-{3,}$/.test(trimmed)) {
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
     * Normalizes a metadata key for
     * matching purposes.
     */
    private normalizeMetadataKey(text: string): string {

        return this.normalizeInline(text)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "");
    }

    /**
     * Escapes a string for use in RegExp.
     */
    private escapeRegex(text: string): string {

        return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
}
