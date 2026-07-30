import { InterviewSession } from "../interview";
import { buildExportContent, ExportContent } from "./ExportContentBuilder.ts";
import { ExportBlock } from "./AnswerUtils.ts";

function escapeHtml(value: string): string {

    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}

/**
 * Renders a flat, indent-leveled list of items (see
 * ExportBlock's "list" kind in AnswerUtils.ts) as real
 * nested <ul> markup -- a Tab-indented sub-point (see
 * useListAutoFormat.ts) becomes an actual nested list
 * rather than a same-level sibling, so a printed/PDF
 * export visually preserves the hierarchy the user typed.
 *
 * Deliberately renders EVERY list (bullet or numbered) as
 * a <ul> with a manually-written marker span, rather than
 * a real <ol> for numbered ones: a native <ol> restarts its
 * own numbering at 1 inside each nested level, which would
 * make the PDF disagree with the Markdown export (which
 * keeps one flat, always-incrementing count regardless of
 * indent, matching the textarea's own Enter-continuation
 * behavior -- see useListAutoFormat.ts). Writing the number
 * out as text keeps both exports showing the same sequence.
 */
function buildNestedListHtml(items: { text: string; indent: number }[], ordered: boolean): string {

    let html = "";
    const openLevels: number[] = [];
    let counter = 0;

    items.forEach(item => {

        const level = item.indent;

        // Close any list(s) at this level or deeper before placing
        // this item -- it belongs either as a new sibling at an
        // already-open level, or nested one level deeper.
        while (openLevels.length > 0 && level < openLevels[openLevels.length - 1]) {
            html += "</li></ul>";
            openLevels.pop();
        }

        if (openLevels.length === 0 || level > openLevels[openLevels.length - 1]) {

            // A brand-new (possibly nested) level -- opened INSIDE
            // whatever <li> is currently still open (if any), so it
            // renders as that item's sub-list rather than a sibling.
            html += `<ul class="export-list">`;
            openLevels.push(level);

        } else {

            // Same level as the previous item -- close its <li>
            // before starting this one.
            html += "</li>";

        }

        counter += 1;

        const marker = ordered ? `${counter}.` : "•";

        html +=
            `<li><span class="export-list-item">` +
            `<span class="export-list-marker">${escapeHtml(marker)}</span>` +
            `<span>${escapeHtml(item.text)}</span>` +
            `</span>`;

    });

    html += "</li></ul>".repeat(openLevels.length);

    return html;

}

function renderBlockHtml(block: ExportBlock): string {

    switch (block.kind) {

        case "subheading":

            return `<h3>${escapeHtml(block.text)}</h3>`;

        case "paragraph":

            return `<p>${escapeHtml(block.text)}</p>`;

        case "table": {

            const headHtml = block.headers
                .map(header => `<th>${escapeHtml(header)}</th>`)
                .join("");

            const rowsHtml = block.rows.map(row => {

                const cellsHtml = row
                    .map(cell => {

                        const trimmed = cell.trim();

                        return `<td>${trimmed.length > 0 ? escapeHtml(trimmed).replace(/\r?\n/g, "<br>") : "&nbsp;"}</td>`;

                    })
                    .join("");

                return `<tr>${cellsHtml}</tr>`;

            }).join("");

            return `<table class="export-table"><thead><tr>${headHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>`;

        }

        case "checklist": {

            const itemsHtml = block.items.map(item => `
                <li class="${item.checked ? "checked" : ""}">
                    <span class="export-checklist-mark">${item.checked ? "☑" : "☐"}</span>
                    <span>${escapeHtml(item.text)}</span>
                </li>
            `).join("");

            return `<ul class="export-checklist">${itemsHtml}</ul>`;

        }

        case "list":

            // See buildNestedListHtml for why numbered lists still
            // render as <ul> with a written-out "N." marker instead
            // of a real <ol>.
            return buildNestedListHtml(block.items, block.ordered ?? false);

        default:
            return "";

    }

}

/**
 * Exports a completed Interview Session to PDF.
 *
 * Rather than adding a PDF-generation dependency to
 * the project, this renders a print-ready document
 * into a hidden iframe and invokes the platform's
 * native print dialog, where the user picks a PDF
 * destination (e.g. "Microsoft Print to PDF" on
 * Windows, or "Save as PDF").
 *
 * Like the Markdown export, the document contains
 * only the System's identity, the chosen Capability,
 * and each Section's number/title and answer. Help,
 * Questions and Scope content are not included.
 *
 * Every Answer Structure renders with real markup --
 * an actual <table> for Tables, a real checklist for
 * Checklists -- rather than dumping raw Markdown-ish
 * text into a paragraph, which used to leave pipes,
 * asterisks and "- [ ]" syntax visibly unrendered in
 * the printed/PDF output.
 */
export class PdfExporter {

    public exportPdf(
        session: InterviewSession,
        capabilityLabel: string
    ): void {

        const content = buildExportContent(session, capabilityLabel);
        const html = this.buildHtml(content);

        const iframe = document.createElement("iframe");

        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.setAttribute("aria-hidden", "true");

        document.body.appendChild(iframe);

        const cleanup = () => {
            if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
            }
        };

        const frameDocument = iframe.contentWindow?.document;

        if (!frameDocument) {
            cleanup();
            return;
        }

        frameDocument.open();
        frameDocument.write(html);
        frameDocument.close();

        iframe.contentWindow?.addEventListener("afterprint", cleanup);

        // Fallback cleanup in case "afterprint" never fires
        // (e.g. the user cancels the print dialog on some platforms).
        setTimeout(cleanup, 60000);

        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
        }, 200);

    }

    private buildHtml(content: ExportContent): string {

        const sectionsHtml = content.sections.map(section => {

            const bodyHtml = section.blocks.length > 0
                ? section.blocks.map(renderBlockHtml).join("")
                : "<p><em>No response.</em></p>";

            return `
                <h2>${escapeHtml(String(section.number))}. ${escapeHtml(section.title)}</h2>
                ${bodyHtml}
            `;

        }).join("");

        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8" />
                    <title>${escapeHtml(content.systemNumber)}. ${escapeHtml(content.systemName)}</title>
                    <style>
                        body {
                            font-family: Arial, Helvetica, sans-serif;
                            color: #111827;
                            padding: 32px;
                        }
                        h1 { font-size: 26px; margin: 0 0 4px; }
                        .capability { font-size: 14px; color: #444444; margin-bottom: 24px; }
                        h2 {
                            font-size: 18px;
                            margin-top: 24px;
                            margin-bottom: 8px;
                            border-bottom: 1px solid #d6d6d6;
                            padding-bottom: 4px;
                            page-break-after: avoid;
                        }
                        h3 {
                            font-size: 14px;
                            margin-top: 14px;
                            margin-bottom: 4px;
                            page-break-after: avoid;
                        }
                        p { font-size: 13px; line-height: 1.6; margin: 0 0 8px; }
                        table.export-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 6px 0 14px;
                            page-break-inside: auto;
                        }
                        table.export-table th,
                        table.export-table td {
                            border: 1px solid #c7c7c7;
                            padding: 6px 8px;
                            font-size: 12px;
                            line-height: 1.45;
                            text-align: left;
                            vertical-align: top;
                        }
                        table.export-table th {
                            background: #f2f4f8;
                            font-weight: 700;
                        }
                        table.export-table tr {
                            page-break-inside: avoid;
                        }
                        ul.export-checklist {
                            list-style: none;
                            margin: 0 0 14px;
                            padding: 0;
                        }
                        ul.export-checklist li {
                            display: flex;
                            align-items: flex-start;
                            gap: 8px;
                            font-size: 13px;
                            line-height: 1.5;
                            margin-bottom: 4px;
                        }
                        .export-checklist-mark {
                            flex-shrink: 0;
                            font-size: 14px;
                        }
                        ul.export-list {
                            list-style: none;
                            margin: 0 0 14px 4px;
                            padding: 0;
                        }
                        ul.export-list li {
                            font-size: 13px;
                            line-height: 1.5;
                            margin-bottom: 4px;
                        }
                        .export-list-item {
                            display: flex;
                            align-items: flex-start;
                            gap: 6px;
                        }
                        .export-list-marker {
                            flex-shrink: 0;
                            font-weight: 600;
                            min-width: 14px;
                        }
                        ul.export-list ul.export-list {
                            margin: 4px 0 0 20px;
                        }
                    </style>
                </head>
                <body>
                    <h1>${escapeHtml(content.systemNumber)}. ${escapeHtml(content.systemName)}</h1>
                    <div class="capability"><strong>Capability:</strong> ${escapeHtml(content.capability)}</div>
                    ${sectionsHtml}
                </body>
            </html>
        `;

    }

}
