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

            // Free text authored with the "1. "/"2. " numbered-list
            // auto-format (see useListAutoFormat.ts) exports as a
            // real Markdown ordered list, so it still numbers
            // correctly when rendered; plain "• " bullets export as
            // a "- " unordered list, same as every other list block.
            // A Tab-indented item (item.indent > 0) renders nested,
            // via 2 leading spaces per indent level -- enough for
            // common Markdown renderers to read it as a sub-list
            // rather than a sibling at the same level. Numbering
            // stays one flat, always-incrementing sequence regardless
            // of indent (the textarea itself doesn't restart
            // numbering per indent level either -- see
            // useListAutoFormat.ts), so a nested numbered item keeps
            // counting from its parent's sequence rather than
            // starting back at "1.".
            return [
                ...block.items.map((item, index) => {

                    const indent = "  ".repeat(item.indent);
                    const marker = block.ordered ? `${index + 1}.` : "-";

                    return `${indent}${marker} ${item.text}`;

                }),
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
