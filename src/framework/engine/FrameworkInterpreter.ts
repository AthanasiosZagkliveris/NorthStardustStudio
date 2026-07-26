import {
    FrameworkDocument,
    Metadata,
    Section,
    SectionBlock
} from "../model";

/**
 * FrameworkInterpreter
 *
 * Converts Framework Markdown into a clean, interview-ready
 * FrameworkDocument.
 *
 * Pipeline:
 *  1. Parse metadata
 *  2. Parse raw sections
 *  3. Normalize sections
 */
export class FrameworkInterpreter {

    public interpret(markdown: string): FrameworkDocument {

        const metadata = this.parseMetadata(markdown);
        const sections = this.normalizeSections(
            this.parseSections(markdown)
        );

        return {
            metadata,
            sections
        };
    }

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

    private parseSections(markdown: string): Section[] {

        const sections: Section[] = [];

        const body = markdown.replace(/^---[\s\S]*?---\r?\n?/, "");
        const lines = body.split(/\r?\n/);

        let current: Section | null = null;
        let heading = "";
        let content: string[] = [];

        const flushBlock = () => {

            if (!current || !heading) {
                content = [];
                return;
            }

            current.blocks.push({
                heading,
                content: content.join("\n").trim()
            });

            heading = "";
            content = [];
        };

        const flushSection = () => {

            if (!current) {
                return;
            }

            flushBlock();
            sections.push(current);
            current = null;
        };

        for (const raw of lines) {

            const line = raw.trim();

            const sectionMatch = line.match(/^#\s+(\d+)\.\s+(.+)$/);

            if (sectionMatch) {

                flushSection();

                current = {
                    number: Number(sectionMatch[1]),
                    title: sectionMatch[2].trim(),
                    blocks: []
                };

                continue;
            }

            if (!current) {
                continue;
            }

            if (/^##\s+/.test(line)) {

                flushBlock();

                heading = line.replace(/^##\s+/, "").trim();

                continue;
            }

            content.push(raw);
        }

        flushSection();

        return sections;
    }

    private normalizeSections(sections: Section[]): Section[] {

        const skipTitles = new Set([
            "overview",
            "system overview",
            "scope",
            "system scope",
            "index"
        ]);

        return sections
            .filter(s => !skipTitles.has(s.title.toLowerCase()))
            .map(section => ({
                ...section,
                blocks: section.blocks
                    .map(block => ({
                        heading: this.clean(block.heading),
                        content: this.clean(block.content)
                    }))
                    .filter(block => block.heading || block.content)
            }));
    }

    private clean(text: string): string {

        return text
            .replace(/^#{1,6}\s*/gm, "")
            .replace(/^###$/gm, "")
            .replace(/^\|(.+)\|$/gm, (_, row) =>
                row.split("|")
                    .map((c: string) => c.trim())
                    .filter((c: string) => c && !/^:?-+:?$/.test(c))
                    .join(" : "))
            .replace(/^\-\s+/gm, "• ")
            .replace(/\r/g, "")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }
}
