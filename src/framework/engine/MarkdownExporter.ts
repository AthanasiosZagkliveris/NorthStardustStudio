import { InterviewSession } from "../interview";
import { buildExportContent, ExportContent, ExportSectionContent } from "./ExportContentBuilder.ts";
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

        // Level 1 under the Section's own "##" heading, level 2 under that.
        case "subheading":
            return [(block.level === 2 ? "#### " : "### ") + block.text, ""];

        case "paragraph":
            return [(block.label ? "**" + block.label + ":** " : "") + block.text, ""];

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
 * Renders one Section's heading (at the given Markdown heading
 * depth, e.g. "##" for a top-level Section or "###" for a Section
 * nested under a Product group) followed by its answer.
 */
function renderSection(section: ExportSectionContent, headingMarker: string): string[] {

    const lines: string[] = [];

    lines.push(`${headingMarker} ${section.number}. ${section.title}`);
    lines.push("");

    if (section.blocks.length === 0) {
        lines.push("_No response._");
    } else {
        section.blocks.forEach(block => lines.push(...renderBlock(block)));
    }

    lines.push("");
    lines.push("");

    return lines;

}

/**
 * The Business Model Canvas as its grid: the five columns (Key
 * Resources under Key Activities, Channels under Customer
 * Relationships), then Cost Structure beside Revenue Streams.
 */
function renderCanvas(blocks: NonNullable<ExportContent["canvas"]>): string[] {

    const byId = (id: string) => blocks.find(block => block.id === id);
    const cell = (id: string, withTitle = false) => {
        const block = byId(id);
        if (!block) {
            return "";
        }
        const items = block.items.length > 0 ? block.items.map(item => "• " + item).join("\n") : "_Not answered yet._";
        return escapeTableCell((withTitle ? "**" + block.title + "**\n" : "") + items);
    };
    const row = (cells: string[]) => `| ${cells.join(" | ")} |`;
    const top = ["partners", "activities", "propositions", "relationships", "segments"];

    return [
        row(top.map(id => byId(id)?.title ?? "")),
        row(top.map(() => "---")),
        row(top.map(id => cell(id))),
        row(["", cell("resources", true), "", cell("channels", true), ""]),
        "",
        row([byId("costs")?.title ?? "", byId("revenue")?.title ?? ""]),
        row(["---", "---"]),
        row([cell("costs"), cell("revenue")]),
        ""
    ];

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
     *
     * `contentOverride` lets a caller supply already-built
     * `ExportContent` instead of the single-response-per-Section
     * default (see ExportContentBuilder.buildMultiProductExportContent,
     * used by the Product Development System so its export includes
     * every Product's own Sections 2-7, not just whichever Product
     * happens to be selected right now).
     */
    public toMarkdown(
        session: InterviewSession,
        capabilityLabel: string,
        contentOverride?: ExportContent
    ): string {

        const content = contentOverride ?? buildExportContent(session, capabilityLabel);

        const lines: string[] = [];

        if (content.documentTitle) {
            lines.push(`# ${content.documentTitle}`);
            lines.push("");
            if (content.documentSubtitle) {
                lines.push(`**${content.documentSubtitle}**`);
                lines.push("");
            }
            for (const line of content.documentMeta ?? []) {
                lines.push(line + "  ");
            }
            if ((content.documentMeta ?? []).length > 0) {
                lines.push("");
            }
        } else {
            lines.push(`# ${content.systemNumber}. ${content.systemName}`);
            lines.push("");
            lines.push(`**Capability:** ${content.capability}`);
            lines.push("");
        }

        if (content.canvas) {
            lines.push(...renderCanvas(content.canvas));
        } else {
            for (const section of content.sections) {
                lines.push(...renderSection(section, "##"));
            }
        }

        // Per-Product Sections (see buildMultiProductExportContent):
        // one heading per Product, with that Product's OWN Sections
        // all together underneath it -- Product 1's Sections in full,
        // then Product 2's, and so on.
        for (const group of content.productGroups ?? []) {

            lines.push(`## ${group.productName}`);
            lines.push("");

            for (const section of group.sections) {
                lines.push(...renderSection(section, "###"));
            }

        }

        return lines.join("\n");

    }

}
