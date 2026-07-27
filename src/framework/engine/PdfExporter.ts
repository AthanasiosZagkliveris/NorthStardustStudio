import { InterviewSession } from "../interview";
import { buildExportContent, ExportContent } from "./ExportContentBuilder.ts";

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

        const escape = (value: string): string =>
            value
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

        const sectionsHtml = content.sections.map(section => {

            const hasContent = section.answerLines.some(line => line.trim().length > 0);

            const answerHtml = hasContent
                ? section.answerLines
                    .map(line => `<p>${line.trim().length > 0 ? escape(line) : "&nbsp;"}</p>`)
                    .join("")
                : "<p><em>No response.</em></p>";

            return `
                <h2>${escape(String(section.number))}. ${escape(section.title)}</h2>
                ${answerHtml}
            `;

        }).join("");

        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8" />
                    <title>${escape(content.systemNumber)}. ${escape(content.systemName)}</title>
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
                        p { font-size: 13px; line-height: 1.6; margin: 0 0 8px; }
                    </style>
                </head>
                <body>
                    <h1>${escape(content.systemNumber)}. ${escape(content.systemName)}</h1>
                    <div class="capability"><strong>Capability:</strong> ${escape(content.capability)}</div>
                    ${sectionsHtml}
                </body>
            </html>
        `;

    }

}
