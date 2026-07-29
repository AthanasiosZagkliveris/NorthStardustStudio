import { InterviewSession } from "../interview";
import { buildExportContent } from "./ExportContentBuilder.ts";
import { ExportBlock } from "./AnswerUtils.ts";

/**
 * Escapes a value so it survives being placed inside
 * a Markdown pipe-table cell: backslashes and pipe
 * characters would otherwise be read as column
 * separators, and a literal newline would silently
 * break the table's row structure (Markdown tables
 * cannot contain real line breaks), so newlines become
 * "<br>" instead -- the one part of raw HTML every
 * common Markdown renderer still honours inside a
 * table cell.
 */
function escapeTableCell(text: string): string {

    return text
        .replace(/\\/g, "\\\\")
        .replace(/\|/g, "\\|")
        .replace(/\r?\n/g, "<br>");

}

function renderBlock(block: ExportBlock): string[] {

    switch (block.kind) {

        case "subheading":
            return [`**${block.text}**`, ""];

        case "paragraph":
            return [block.text, ""];

        case "table": {

            const lines: string[] = [];

            lines.push(`| ${block.headers.map(escapeTableCell).join(" | ")} |`);
            lines.push(`| ${block.headers.map(() => "---").join(" | ")} |`);

            block.rows.forEach(row => {
                lines.push(`| ${row.map(escapeTableCell).join(" | ")} |`);
            });

            lines.push("");

            return lines;

        }

        case "checklist":

            return [
                ...block.items.map(item => `- [${item.checked ? "x" : " "}] ${item.text}`),
                ""
            ];

        case "list":

            return [
                ...block.items.map(item => `- ${item}`),
                ""
            ];

        default:
            return [];

    }

}

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

            if (section.blocks.length === 0) {
                lines.push("_No response._");
            } else {
                section.blocks.forEach(block => lines.push(...renderBlock(block)));
            }

            lines.push("");
            lines.push("");

        }

        return lines.join("\n");

    }

}
