import { InterviewSession } from "../interview";
import { buildExportContent } from "./ExportContentBuilder.ts";

/**
 * Exports a completed Interview Session
 * to Markdown.
 *
 * The exported document intentionally
 * contains only the System's identity, the
 * chosen Capability, and each Section's
 * number/title and answer. Help, Questions
 * and Scope content are not included.
 */
export class MarkdownExporter {

    /**
     * Converts an Interview Session
     * into Markdown.
     */
    public toMarkdown(
        session: InterviewSession,
        capabilityLabel: string
    ): string {

        const content = buildExportContent(session, capabilityLabel);

        const lines: string[] = [];

        lines.push(`# ${content.systemNumber}. ${content.systemName}`);
        lines.push("");
        lines.push(`**Capability:** ${content.capability}`);
        lines.push("");

        for (const section of content.sections) {

            lines.push(`## ${section.number}. ${section.title}`);
            lines.push("");

            const hasContent = section.answerLines.some(line => line.trim().length > 0);

            if (hasContent) {
                lines.push(...section.answerLines);
            } else {
                lines.push("_No response._");
            }

            lines.push("");
            lines.push("");

        }

        return lines.join("\n");

    }

}
