import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";

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
import OptionPicker from "../components/interview/OptionPicker.tsx";
import { contentSectionsHtml, documentMetaHtml } from "../framework/engine/PdfExporter.ts";
import { OrganizationService } from "../services/OrganizationService";
import { StorageService } from "../services/StorageService.ts";
import { systems } from "../data/systems.ts";

import "../styles/global.css";
import "../styles/workspace.css";
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

/**
 * The documents the Foundation capability adds up to -- the Business
 * Plan and the Business Model Canvas -- previewed and exported.
 *
 * Built on every visit from what is saved (see BusinessDocuments.ts),
 * so they are never out of date and never edited here: to change a
 * line, change the answer it came from.
 */
export default function BusinessDocuments() {

    const navigate = useNavigate();

    const [organizationId] = useState(() => OrganizationService.getSelected());
    const [documentId, setDocumentId] = useState<DocumentId>("plan");
    const [period, setPeriod] = useState<ForecastPeriod>("annual");
    const [untilYear, setUntilYear] = useState<number | null>(null);

    useEffect(() => {
        if (!organizationId) {
            navigate("/");
        }
    }, [organizationId, navigate]);

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
            organisationName: OrganizationService.getSummary(organizationId)?.name ?? ""
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
        <div className="workspace business-documents">

            <AppHeader organizationName={organizationId ? OrganizationService.getSummary(organizationId)?.name ?? "" : ""} />

            <main className="business-documents-main">

                <div className="business-documents-head">
                    <h1 className="workspace-title">Business Documents</h1>
                    <p className="business-documents-lead">
                        Built from the Foundation capability: Identity, Brand, Business and Strategy.
                        To change a line, change the answer it came from.
                    </p>
                </div>

                {loaded.unfinished.length > 0 && (
                    <p className="business-documents-note" role="status">
                        Not finished yet: {loaded.unfinished.join(", ")}. The documents use what has been answered so far.
                    </p>
                )}

                <div className="business-documents-tabs" role="tablist" aria-label="Document">
                    {([["plan", "Business Plan"], ["canvas", "Business Model Canvas"], ["forecast", "Financial Forecast"]] as const).map(([id, label]) => (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={documentId === id}
                            className={"business-documents-tab" + (documentId === id ? " business-documents-tab-active" : "")}
                            onClick={() => setDocumentId(id)}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {documentId === "forecast" && (
                    <div className="business-documents-actions business-documents-options">
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
                        <button
                            type="button"
                            className="business-documents-button"
                            onClick={exportCsv}
                        >
                            Export CSV
                        </button>
                        <button
                            type="button"
                            className="business-documents-button"
                            disabled={!anySession}
                            onClick={() => anySession && reviewManager.exportMarkdown(anySession, "Foundation",
                                businessForecastContent(loaded.sessions, period, lastYear))}
                        >
                            Export Markdown
                        </button>
                        <button
                            type="button"
                            className="business-documents-button"
                            disabled={!anySession}
                            onClick={() => anySession && reviewManager.exportPdf(anySession, "Foundation",
                                businessForecastContent(loaded.sessions, period, lastYear))}
                        >
                            Export PDF
                        </button>
                    </div>
                )}

                {documentId !== "forecast" && (
                <div className="business-documents-actions">
                    <button
                        type="button"
                        className="business-documents-button"
                        disabled={!anySession}
                        onClick={() => anySession && reviewManager.exportMarkdown(anySession, "Foundation", content)}
                    >
                        Export Markdown
                    </button>
                    <button
                        type="button"
                        className="business-documents-button"
                        disabled={!anySession}
                        onClick={() => anySession && reviewManager.exportPdf(anySession, "Foundation", content)}
                    >
                        Export PDF
                    </button>
                </div>
                )}

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
                        <p className="business-documents-note">
                            The plan runs {planYearCount} {planYearCount === 1 ? "year" : "years"} from {loaded.forecast.forecast.months[0]}.
                            Change its length on 3. Business System → 4. Financial Foundation.
                        </p>
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
                                                    className={table.subtotalColumns.includes(index) ? "business-forecast-subtotal" : undefined}
                                                >
                                                    {column}
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
                        {content.documentSubtitle && <p className="business-document-subtitle">{content.documentSubtitle}</p>}
                        {/* The same escaped HTML the PDF prints, its sections h3s under this h2. */}
                        <div dangerouslySetInnerHTML={{ __html: documentMetaHtml(content) + contentSectionsHtml(content, 3) }} />
                    </article>
                )}

            </main>

            <AppFooter onBack={() => navigate("/assistant", { state: { capability: "foundation" } })} />

        </div>
    );

}
