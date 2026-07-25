import {
    FrameworkDocument,
    Metadata,
    Section,
    SectionBlock
} from "../model";

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
    public interpret(
        markdown: string
    ): FrameworkDocument {

        return {

            metadata:
                this.parseMetadata(markdown),

            sections:
                this.parseSections(markdown)

        };

    }

    /**
     * Reads the YAML metadata block.
     */
    private parseMetadata(
        markdown: string
    ): Metadata {

        const metadata: Metadata = {

            systemNumber: 0,

            systemName: "",

            capability: "",

            question: "",

            scope: "",

            version: 1

        };

        const match =
            markdown.match(
                /^---\r?\n([\s\S]*?)\r?\n---/
            );

        if (!match) {
            return metadata;
        }

        const yaml = match[1];

        for (const line of yaml.split(/\r?\n/)) {

            const separator =
                line.indexOf(":");

            if (separator < 0) {
                continue;
            }

            const key =
                line.substring(
                    0,
                    separator
                ).trim();

            const value =
                line.substring(
                    separator + 1
                ).trim();

            switch (key) {

                case "systemNumber":

                    metadata.systemNumber =
                        Number(value);

                    break;

                case "systemName":

                    metadata.systemName =
                        value;

                    break;

                case "capability":

                    metadata.capability =
                        value;

                    break;

                case "question":

                    metadata.question =
                        value;

                    break;

                case "scope":

                    metadata.scope =
                        value;

                    break;

                case "version":

                    metadata.version =
                        Number(value);

                    break;

            }

        }

        return metadata;

    }

    /**
     * Parses every Framework Section.
     */
    private parseSections(
        markdown: string
    ): Section[] {

        const sections: Section[] = [];

        const lines =
            markdown.split(/\r?\n/);

        let currentSection:
            Section | null = null;

        let currentHeading = "";

        let currentContent: string[] = [];

        /**
         * Saves the currently collected
         * block into the active Section.
         */
        const saveBlock = () => {

            if (
                !currentSection ||
                currentHeading.length === 0
            ) {
                currentContent = [];
                return;
            }

            const block: SectionBlock = {

                heading:
                    currentHeading,

                content:
                    currentContent
                        .join("\n")
                        .trim()

            };

            currentSection.blocks.push(
                block
            );

            currentHeading = "";

            currentContent = [];

        };

        /**
         * Saves the current Section.
         */
        const saveSection = () => {

            if (!currentSection) {
                return;
            }

            saveBlock();

            sections.push(
                currentSection
            );

            currentSection = null;

        };

        for (const rawLine of lines) {

            const line =
                rawLine.trim();

            //
            // Ignore metadata
            //

            if (line === "---") {
                continue;
            }

            //
            // New Section
            //

            if (
                /^#\s+\d+\./.test(line)
            ) {

                saveSection();

                currentSection = {

                    number:
                        sections.length + 1,

                    title:

                        line.replace(
                            /^#\s+\d+\.\s*/,
                            ""
                        ),

                    blocks: [],

                  
                };

                continue;

            }

            //
            // Ignore everything
            // before first Section
            //

            if (!currentSection) {
                continue;
            }

            //
            // New Block
            //

            if (
                /^##\s+/.test(line)
            ) {

                saveBlock();

                currentHeading =
                    line.replace(
                        /^##\s+/,
                        ""
                    );

                continue;

            }

            //
            // Block content
            //

            currentContent.push(
                rawLine
            );

        }

        saveSection();

        return sections;

    }

}