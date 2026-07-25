import { InterviewSession } from "../interview";

/**
 * Exports a completed Interview Session
 * back into Markdown format.
 *
 * The exporter preserves the original
 * Framework structure and appends the
 * user's responses after each Section.
 */
export class MarkdownExporter {

    /**
     * Converts an Interview Session
     * into Markdown.
     */
    public toMarkdown(
        session: InterviewSession
    ): string {

        const framework =
            session.getFramework();

        const lines: string[] = [];

        //
        // Metadata
        //

        lines.push("---");

        lines.push(
            `systemNumber: ${framework.metadata.systemNumber}`
        );

        lines.push(
            `systemName: ${framework.metadata.systemName}`
        );

        lines.push(
            `capability: ${framework.metadata.capability}`
        );

        lines.push(
            `question: ${framework.metadata.question}`
        );

        lines.push(
            `scope: ${framework.metadata.scope}`
        );

        lines.push(
            `version: ${framework.metadata.version}`
        );

        lines.push("---");
        lines.push("");

        //
        // Sections
        //

        for (const section of framework.sections) {

            lines.push(
                `# ${section.number}. ${section.title}`
            );

            lines.push("");

            for (const block of section.blocks) {

                lines.push(
                    `## ${block.heading}`
                );

                lines.push("");

                if (
                    block.content.trim().length > 0
                ) {

                    lines.push(
                        block.content.trim()
                    );

                    lines.push("");

                }

            }

            const response =
                session.getResponse(
                    section.number
                );

            lines.push(
                "## Response"
            );

            lines.push("");

            lines.push(
                response.trim()
            );

            lines.push("");
            lines.push("");

        }

        return lines.join("\n");

    }

}