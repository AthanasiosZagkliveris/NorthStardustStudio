import { InterviewSession } from "../interview";
import { buildExportContent, ExportContent, ExportSectionContent } from "./ExportContentBuilder.ts";
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

    // "export-list-ordered" lets a stylesheet give a numbered list's
    // markers a wider, right-aligned column, so "1." lines up with "10.".
    const listClass = ordered ? "export-list export-list-ordered" : "export-list";

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
            html += `<ul class="${listClass}">`;
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

/**
 * One block as HTML. `subheadingLevel` is the heading level of a
 * level-1 subheading (a level-2 one is one below it): 3 under a
 * Section's own h2, 4 where the Section itself is an h3.
 */
function renderBlockHtml(block: ExportBlock, subheadingLevel = 3): string {

    switch (block.kind) {

        case "subheading": {

            const tag = "h" + (block.level === 2 ? subheadingLevel + 1 : subheadingLevel);

            return `<${tag}>${escapeHtml(block.text)}</${tag}>`;

        }

        case "paragraph":

            return block.label
                ? `<p><strong>${escapeHtml(block.label)}:</strong> ${escapeHtml(block.text)}</p>`
                : `<p>${escapeHtml(block.text)}</p>`;

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
function renderSectionHtml(section: ExportSectionContent, headingTag: "h2" | "h3", subheadingLevel = 3): string {

    const bodyHtml = section.blocks.length > 0
        ? section.blocks.map(block => renderBlockHtml(block, subheadingLevel)).join("")
        : "<p><em>No response.</em></p>";

    return `
        <${headingTag}>${escapeHtml(String(section.number))}. ${escapeHtml(section.title)}</${headingTag}>
        ${bodyHtml}
    `;

}

/**
 * The sections of a document as HTML, every value escaped -- what the
 * PDF prints, and what the Business Documents page previews.
 *
 * The PDF's title is its h1, so its sections are h2s. The page that
 * previews it has its own h1 and the document's title as an h2, so it
 * asks for `sectionLevel` 3: the sections one level down, and their
 * subheadings with them, leaving no heading level skipped.
 */
export function contentSectionsHtml(content: ExportContent, sectionLevel: 2 | 3 = 2): string {
    return content.sections
        .map(section => renderSectionHtml(section, sectionLevel === 3 ? "h3" : "h2", sectionLevel + 1))
        .join("");
}

/** A document's cover lines, the label before the first colon in bold. */
export function documentMetaHtml(content: ExportContent): string {
    const lines = content.documentMeta ?? [];
    return lines.length === 0 ? "" : `<div class="document-meta">${lines.map(line => {
        const at = line.indexOf(": ");
        return at < 0 ? `<p>${escapeHtml(line)}</p>`
            : `<p><strong>${escapeHtml(line.slice(0, at + 1))}</strong> ${escapeHtml(line.slice(at + 2))}</p>`;
    }).join("")}</div>`;
}

/**
 * The Business Model Canvas as it is drawn on a wall: nine boxes, the
 * offer in the middle, what makes it on the left, who it is for on the
 * right, money along the bottom. On a landscape page (see buildHtml).
 */
/**
 * The Business Documents on the app's type scale: 28 the title, 24 a
 * section, 18 the text and the subheadings, 14 tables and small print.
 * The same rhythm as the page that previews them
 * (business-documents.css): more room above a heading than below it,
 * one paragraph gap, one gap around a table, and lists with a hanging
 * marker 0.5em from the text -- numbered ones right-aligned so "1."
 * and "10." line up, and wrapped lines under the first line's text.
 * After the rules it overrides, so it wins on source order.
 */
const DOCUMENT_CSS = `
    h1 { font-size: 28px; line-height: 1.25; margin: 0 0 4px; }
    .capability { font-size: 18px; line-height: 1.5; margin: 0 0 8px; }
    .document-meta { margin: 0 0 24px; }
    .document-meta p { font-size: 14px; line-height: 1.5; margin: 0; }
    h2 { font-size: 24px; line-height: 1.25; margin: 36px 0 12px; }
    h3, h4 { font-size: 18px; line-height: 1.3; font-weight: 700; }
    h3 { margin: 24px 0 8px; }
    h4 { margin: 18px 0 6px; color: #374151; }
    p { font-size: 18px; line-height: 1.5; margin: 0 0 12px; }
    table.export-table { margin: 16px 0; }
    table.export-table th, table.export-table td { font-size: 14px; line-height: 1.35; }
    ul.export-list, ul.export-checklist { font-size: 18px; margin: 0 0 12px; padding: 0; }
    ul.export-list li, ul.export-checklist li { font-size: 18px; line-height: 1.5; margin: 0; }
    ul.export-list li + li, ul.export-checklist li + li { margin-top: 6px; }
    .export-list-item, ul.export-checklist li { display: flex; align-items: baseline; gap: 0.5em; }
    .export-list-marker { flex: none; width: 0.75em; min-width: 0; text-align: right; }
    ul.export-list-ordered > li > .export-list-item > .export-list-marker { width: 1.5em; }
    ul.export-list ul.export-list { margin: 6px 0 0 1.25em; }
    ul.export-list-ordered ul.export-list { margin-left: 2em; }
`;

const CANVAS_CSS = `
    @page { size: landscape; margin: 10mm; }
    body { padding: 0; }
    .export-canvas {
        display: grid;
        grid-template-columns: repeat(10, minmax(0, 1fr));
        grid-template-areas:
            "partners partners activities activities propositions propositions relationships relationships segments segments"
            "partners partners resources  resources  propositions propositions channels      channels      segments segments"
            "costs    costs    costs      costs      costs        revenue      revenue       revenue       revenue  revenue";
        border: 2px solid #1f2937;
        break-inside: avoid;
    }
    .export-canvas-box { border: 1px solid #1f2937; padding: 6px 8px; min-width: 0; overflow-wrap: break-word; }
    .export-canvas-box h3 { margin: 0 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
    .export-canvas-box ul { margin: 0; padding-left: 14px; }
    .export-canvas-box li, .export-canvas-box p { font-size: 10px; line-height: 1.35; margin: 0 0 2px; }
    .export-canvas-partners { grid-area: partners; }
    .export-canvas-activities { grid-area: activities; }
    .export-canvas-resources { grid-area: resources; }
    .export-canvas-propositions { grid-area: propositions; }
    .export-canvas-relationships { grid-area: relationships; }
    .export-canvas-channels { grid-area: channels; }
    .export-canvas-segments { grid-area: segments; }
    .export-canvas-costs { grid-area: costs; }
    .export-canvas-revenue { grid-area: revenue; }
`;

/** The Financial Forecast: wide tables (every month, or every plan
    year), printed sideways rather than shrinking their text. */
const LANDSCAPE_CSS = `
    @page { size: landscape; margin: 10mm; }
`;

function canvasHtml(blocks: NonNullable<ExportContent["canvas"]>): string {
    return `<div class="export-canvas">${blocks.map(block => `
        <section class="export-canvas-box export-canvas-${escapeHtml(block.id)}">
            <h3>${escapeHtml(block.title)}</h3>
            ${block.items.length === 0
                ? "<p><em>Not answered yet.</em></p>"
                : `<ul>${block.items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`}
        </section>`).join("")}</div>`;
}

export class PdfExporter {

    public exportPdf(
        session: InterviewSession,
        capabilityLabel: string,
        contentOverride?: ExportContent
    ): void {

        const content = contentOverride ?? buildExportContent(session, capabilityLabel);
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

        const sectionsHtml = content.canvas ? canvasHtml(content.canvas) : contentSectionsHtml(content);

        // Per-Product Sections (see buildMultiProductExportContent):
        // one heading per Product, with that Product's OWN Sections
        // all together underneath it -- Product 1's Sections in
        // full, then Product 2's, and so on.
        const productGroupsHtml = (content.productGroups ?? []).map(group => {

            const groupSectionsHtml = group.sections
                .map(section => renderSectionHtml(section, "h3"))
                .join("");

            return `
                <h2 class="export-product-group-title">${escapeHtml(group.productName)}</h2>
                ${groupSectionsHtml}
            `;

        }).join("");

        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8" />
                    <title>${escapeHtml(content.documentTitle ?? content.systemNumber + ". " + content.systemName)}</title>
                    <style>
                        body {
                            font-family: Arial, Helvetica, sans-serif;
                            color: #111827;
                            padding: 32px;
                        }
                        h1 { font-size: 26px; margin: 0 0 4px; }
                        .capability { font-size: 14px; color: #444444; margin-bottom: 24px; }
                        .document-meta { margin: -12px 0 24px; }
                        .document-meta p { font-size: 13px; margin: 0 0 2px; color: #374151; }
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
                        h4 {
                            font-size: 13px;
                            margin-top: 10px;
                            margin-bottom: 4px;
                            color: #333333;
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
                            /* A heading on one line: never "Freque / ncy". */
                            white-space: nowrap;
                        }
                        table.export-table td {
                            /* Break only a word too long for its column (a link). */
                            overflow-wrap: break-word;
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
                        ${content.documentTitle ? DOCUMENT_CSS : ""}
                        ${content.canvas ? CANVAS_CSS : content.landscape ? LANDSCAPE_CSS : ""}
                    </style>
                </head>
                <body>
                    ${content.documentTitle
                        ? `<h1>${escapeHtml(content.documentTitle)}</h1>` +
                            (content.documentSubtitle ? `<div class="capability">${escapeHtml(content.documentSubtitle)}</div>` : "") +
                            documentMetaHtml(content)
                        : `<h1>${escapeHtml(content.systemNumber)}. ${escapeHtml(content.systemName)}</h1>
                    <div class="capability"><strong>Capability:</strong> ${escapeHtml(content.capability)}</div>`}
                    ${sectionsHtml}
                    ${productGroupsHtml}
                </body>
            </html>
        `;

    }

}
