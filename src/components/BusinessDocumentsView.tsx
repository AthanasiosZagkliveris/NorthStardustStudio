import TabList from "./controls/TabList.tsx";
import { useMemo, useRef, useState } from "react";
import AddButton from "./controls/AddButton.tsx";
import MenuOption from "./controls/MenuOption.tsx";
import { usePopupDismiss } from "./controls/PopupPanel.tsx";
import WorkbookTools from "./WorkbookTools.tsx";



import { ReviewManager } from "../framework/application/ReviewManager.ts";
import {
    CANVAS_BLOCKS,
    businessModelCanvas,
    businessForecast,
    businessForecastContent,
    businessModelCanvasData,
    businessPlan,
    type FoundationSessions
} from "../framework/engine/BusinessDocuments.ts";
import type { ExportContent } from "../framework/engine/ExportContentBuilder.ts";
import {
    type ForecastPeriod,
    forecastCsv,
    forecastView
} from "../framework/engine/FinancialForecast.ts";
import OptionPicker from "./interview/fields/OptionPicker.tsx";
import { contentSectionsHtml, documentMetaHtml } from "../framework/engine/PdfExporter.ts";
import { OrganizationService } from "../services/OrganizationService";
import { asGlobalSettings } from "../framework/engine/GlobalSettings";
import { StorageService } from "../services/StorageService.ts";
import { systems } from "../data/systems.ts";

import "../styles/business-documents.css";

const reviewManager = new ReviewManager();

/** The four Foundation Systems, in their order. */
const FOUNDATION = systems.filter(system => system.capability === "foundation");

type DocumentId = "plan" | "canvas" | "forecast";

const PERIODS: { id: ForecastPeriod; label: string }[] = [
    { id: "annual", label: "Annually" },
    { id: "quarterly", label: "Quarterly" },
    { id: "monthly", label: "Monthly" }
];

/** Saves text as a file, as the other exports do. */
function download(text: string, filename: string, type: string) {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/** On screen, a cover line that only says again the name in the title ("Organisation: …") is left out; the exports print the cover as it is. */
function onScreen(content: ExportContent): ExportContent {
    return { ...content, documentMeta: content.documentMeta?.filter(line => !(line.startsWith("Organisation: ") && (content.documentTitle ?? "").includes(line.slice("Organisation: ".length)))) };
}

/**
 * THE EXPORT OF A DOCUMENT: one button with its symbol and the word, opening a menu of the formats (the sort menu's look, MenuOption); a format
 * pressed is downloaded and the menu closes.
 */
function ExportMenu({ what, options, disabled }: { what: string; options: { label: string; run: () => void }[]; disabled?: boolean }) {
    const [open, setOpen] = useState(false);
    const box = useRef<HTMLDivElement | null>(null);
    usePopupDismiss(open, [box], () => setOpen(false));
    return (
        <div className="strategy-sort" ref={box}>
            <AddButton className="header-tool" aria-label={"Export the " + what} aria-haspopup="menu" aria-expanded={open} disabled={disabled} onClick={() => setOpen(current => !current)}>
                <svg className="header-tool-icon" viewBox="2.97 2.97 14.05 14.05" aria-hidden="true">
                    <path d="M10 3.5v9M6.5 9 10 12.5 13.5 9M4 13.5v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
                <span className="header-tool-word">Export</span>
            </AddButton>
            {open && (
                <div className="strategy-sort-menu" role="menu" aria-label={"Export the " + what + " as"}>
                    {options.map(option => (
                        <MenuOption key={option.label} onClick={() => { setOpen(false); option.run(); }}>{option.label}</MenuOption>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * THE BUSINESS DOCUMENTS, a section of the Workbook (owner, 2026-11-09: "Place the Business Documents in the Workbook, and its sections as subsections"):
 * what the Foundation capability adds up to -- the Business Plan, the Business Model Canvas and the Financial Forecast, its three subsections (a tab each) --
 * previewed and exported. Built on every visit from what is saved (BusinessDocuments.ts), so they are never out of date and never edited here: to change a
 * line, change the answer it came from.
 */
export default function BusinessDocumentsView({ organizationId }: { organizationId: string }) {

    const [documentId, setDocumentId] = useState<DocumentId>("plan");
    const [period, setPeriod] = useState<ForecastPeriod>("annual");
    const [untilYear, setUntilYear] = useState<number | null>(null);

    const loaded = useMemo(() => {

        if (!organizationId) {
            return null;
        }

        OrganizationService.flushPendingWrites();

        const byId = Object.fromEntries(FOUNDATION.map(system => [
            system.id,
            StorageService.loadInterview(organizationId, system.number)
        ]));

        const sessions: FoundationSessions = {
            identity: byId.identity,
            brand: byId.brand,
            business: byId.business,
            strategy: byId.strategy,
            organisationName: OrganizationService.getSummary(organizationId)?.name ?? "",
            globalSettings: asGlobalSettings(OrganizationService.getGlobalSettings(organizationId))
        };

        /* Which Systems are not finished, said rather than enforced:
           a plan drawn from three and a half Systems is still worth
           reading, as long as it says so. */
        const unfinished = FOUNDATION
            .map(system => {
                const session = byId[system.id];
                if (!session) {
                    return system.title + " (not started)";
                }
                return reviewManager.validate(session).valid ? null : system.title;
            })
            .filter((entry): entry is string => entry !== null);

        return {
            sessions,
            unfinished,
            plan: businessPlan(sessions),
            canvas: businessModelCanvas(sessions),
            canvasData: businessModelCanvasData(sessions),
            forecast: businessForecast(sessions)
        };

    }, [organizationId]);

    if (!loaded) {
        return null;
    }

    const content: ExportContent = documentId === "canvas" ? loaded.canvas : loaded.plan;

    /* The forecast: to the plan's last year unless a nearer one is chosen. */
    const planYearCount = loaded.forecast.years;
    const lastYear = Math.min(untilYear ?? planYearCount, planYearCount);
    const view = forecastView(loaded.forecast.forecast, period, lastYear);
    const yearLabel = (year: number) => "Year " + year + " (to " +
        loaded.forecast.forecast.months[Math.min(year * 12, loaded.forecast.forecast.months.length) - 1] + ")";
    const exportCsv = () => download(
        forecastCsv(view, {
            organization: loaded.forecast.name,
            currency: loaded.forecast.currency,
            notes: loaded.forecast.forecast.notes
        }),
        (loaded.forecast.name + " financial forecast " + period)
            .replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() + ".csv",
        "text/csv;charset=utf-8"
    );

    /* Any saved session will do to export from: the document carries
       its own title and content (see ExportContent.documentTitle). */
    const anySession = loaded.sessions.business ?? loaded.sessions.identity ??
        loaded.sessions.brand ?? loaded.sessions.strategy ?? null;

    return (
        <section className="business-documents" aria-label="Business Documents">

                {loaded.unfinished.length > 0 && (
                    <p className="business-documents-note" role="status">
                        Not finished yet: {loaded.unfinished.join(", ")}. The documents use what has been answered so far.
                    </p>
                )}

                <TabList
                    label="Document"
                    tabs={[{ id: "plan", label: "Business Plan" }, { id: "canvas", label: "Business Model Canvas" }, { id: "forecast", label: "Financial Forecast" }]}
                    value={documentId}
                    onChange={setDocumentId}
                />


                {/* ONE EXPORT (owner, 2026-11-09: "a single button, with CSV, MD and PDF drop down options. It should have its symbol too"), in the Workbook's
                    title row with the other buttons (WorkbookTools): the formats the document has, the Forecast's CSV too. */}
                <WorkbookTools>
                    {/* (The Forecast's period and its last year: in the title's row with the Export, owner 2026-11-10.) */}
                    {documentId === "forecast" && (
                        <>
                            <div className="business-documents-option">
                                <span>Period</span>
                                <OptionPicker
                                    label="Forecast period"
                                    placeholder="Select"
                                    options={PERIODS.map(entry => entry.label)}
                                    value={PERIODS.find(entry => entry.id === period)?.label ?? ""}
                                    onChange={(next) => setPeriod(PERIODS.find(entry => entry.label === next)?.id ?? "annual")}
                                />
                            </div>
                            <div className="business-documents-option">
                                <span>Until</span>
                                <OptionPicker
                                    label="Forecast until"
                                    placeholder="Select"
                                    options={Array.from({ length: planYearCount }, (_, index) => yearLabel(index + 1))}
                                    value={yearLabel(lastYear)}
                                    onChange={(next) => setUntilYear(Number(next.split(" ")[1]) || planYearCount)}
                                />
                            </div>
                        </>
                    )}
                    <ExportMenu
                        what={documentId === "plan" ? "Business Plan" : documentId === "canvas" ? "Business Model Canvas" : "Financial Forecast"}
                        disabled={!anySession}
                        options={[
                            ...(documentId === "forecast" ? [{ label: "CSV", run: exportCsv }] : []),
                            { label: "Markdown", run: () => anySession && reviewManager.exportMarkdown(anySession, "Foundation", documentId === "forecast" ? businessForecastContent(loaded.sessions, period, lastYear) : content) },
                            { label: "PDF", run: () => anySession && reviewManager.exportPdf(anySession, "Foundation", documentId === "forecast" ? businessForecastContent(loaded.sessions, period, lastYear) : content) }
                        ]}
                    />
                </WorkbookTools>

                {/* ONE PAGE WITH ITS TABS (owner, 2026-11-10, 18:27: "Connect the tags with the content as a solid page with page tags"): the chosen document is
                    drawn on one sheet under the tabs, the chosen tab opening into it; the Plan's own sheet is that page. */}
                <div className="business-documents-page" role="tabpanel" aria-label={documentId === "plan" ? "Business Plan" : documentId === "canvas" ? "Business Model Canvas" : "Financial Forecast"}>

                {documentId === "canvas" && (
                    <div className="business-canvas-head">
                        <h2 className="business-canvas-title">Business Model Canvas</h2>
                        <p className="business-canvas-organization">{loaded.canvasData.name}</p>
                    </div>
                )}

                {documentId === "canvas" && (
                    /* The canvas as it is drawn on a wall: nine boxes,
                       the offer in the middle, what makes it on the left,
                       who it is for on the right, money along the bottom. */
                    <div className="business-canvas" aria-label={"Business Model Canvas: " + loaded.canvasData.name}>
                        {CANVAS_BLOCKS.map(block => (
                            <section
                                className={"business-canvas-box business-canvas-" + block.id}
                                key={block.id}
                                aria-labelledby={"canvas-" + block.id}
                            >
                                {/* A label, not a heading: see .business-canvas-label. */}
                                <p className="business-canvas-label" id={"canvas-" + block.id}>{block.title}</p>
                                {loaded.canvasData.blocks[block.id].length === 0
                                    ? <p className="business-canvas-empty">Not answered yet.</p>
                                    : (
                                        <ul className="business-hanging-list">
                                            {loaded.canvasData.blocks[block.id].map((entry, index) => (
                                                <li key={entry + index}>{entry}</li>
                                            ))}
                                        </ul>
                                    )}
                            </section>
                        ))}
                    </div>
                )}

                {documentId === "forecast" && (
                    <div className="business-forecast">
                        {/* The logo on the Forecast's cover, as on the Plan's. */}
                        {loaded.plan.documentLogo && (
                            <div className="business-forecast-logo">
                                <div className="business-document-logo">
                                    <img src={loaded.plan.documentLogo.src} alt={loaded.plan.documentLogo.alt} />
                                </div>
                            </div>
                        )}
                        {view.tables.map(table => (
                            <div className="business-forecast-table-wrap" key={table.title}>
                                {/* The table's caption: stays in view while a monthly table scrolls sideways. */}
                                <p className="business-forecast-caption" id={"forecast-" + table.title.replace(/[^A-Za-z0-9]+/g, "-")}>{table.title}</p>
                                {table.note && <p className="business-forecast-table-note">{table.note}</p>}
                                <table
                                    className={"business-forecast-table" + (period === "annual" ? " business-forecast-annual" : "")}
                                    aria-labelledby={"forecast-" + table.title.replace(/[^A-Za-z0-9]+/g, "-")}
                                >
                                    {period === "annual" && (
                                        /* The same widths in all three tables. */
                                        <colgroup>
                                            <col className="business-forecast-label-col" />
                                            {table.columns.map(column => <col className="business-forecast-value-col" key={column} />)}
                                        </colgroup>
                                    )}
                                    <thead>
                                        <tr>
                                            <th scope="col">{loaded.forecast.currency || "Amount"}</th>
                                            {table.columns.map((column, index) => (
                                                <th
                                                    scope="col"
                                                    key={column}
                                                    title={column}
                                                    className={table.subtotalColumns.includes(index) ? "business-forecast-subtotal" : undefined}
                                                >
                                                    {/* A plan year by its number: its months are said once, in the note above and in the tooltip (owner, 2026-11-09). */}
                                                    {column.replace(/ \(.*\)$/, "")}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {table.rows.map(row => row.heading ? (
                                            <tr key={row.label} className="business-forecast-heading">
                                                <th scope="rowgroup">{row.label}</th>
                                                <td colSpan={table.columns.length} />
                                            </tr>
                                        ) : row.text !== undefined ? (
                                            /* Words in place of figures: "Income tax: Not chosen yet". */
                                            <tr key={row.label} className="business-forecast-text">
                                                <th scope="row">{row.label}</th>
                                                {table.columns.map((column, index) => (
                                                    <td
                                                        key={column}
                                                        className={table.subtotalColumns.includes(index) ? "business-forecast-subtotal" : undefined}
                                                    >
                                                        {index === 0 ? row.text : ""}
                                                    </td>
                                                ))}
                                            </tr>
                                        ) : (
                                            <tr key={row.label} className={row.total ? "business-forecast-total" : undefined}>
                                                <th scope="row">{row.label}</th>
                                                {row.values.map((amount, index) => (
                                                    <td
                                                        key={index}
                                                        className={table.subtotalColumns.includes(index) ? "business-forecast-subtotal" : undefined}
                                                    >
                                                        {loaded.forecast.format(amount)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                        <ul className="business-forecast-notes business-hanging-list">
                            {loaded.forecast.forecast.notes.map(note => <li key={note}>{note}</li>)}
                        </ul>
                    </div>
                )}

                {documentId === "plan" && (
                    <article className="business-document">
                        {/* The logo, above the title as on the printed cover. */}
                        {content.documentLogo && (
                            <div className="business-document-logo">
                                <img src={content.documentLogo.src} alt={content.documentLogo.alt} />
                            </div>
                        )}
                        {/* The page's own title is its one h1. */}
                        <h2 className="business-document-title">{content.documentTitle}</h2>
                        {/* (Its subtitle, what it is drawn from and over how long, is the heading's "i" on screen; the exports print it.) */}
                        {/* The same escaped HTML the PDF prints, its sections h3s under this h2. */}
                        <div dangerouslySetInnerHTML={{ __html: documentMetaHtml(onScreen(content)) + contentSectionsHtml(content, 3) }} />
                    </article>
                )}

                </div>

        </section>
    );

}
