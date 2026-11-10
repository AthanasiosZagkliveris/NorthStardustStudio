/* Part of BusinessDocuments.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; BusinessDocuments.ts re-exports every part). */

import { type ExportContent } from "../ExportContentBuilder.ts";
import { financialForecast, forecastView, splitMonthlyTableByYear, type ForecastPeriod } from "../FinancialForecast.ts";
import { list, paragraph } from "../ExportRenderers.ts";
import { planYears, moneyFormatter } from "../FinancialModel.ts";
import { brandPictures, coverLines, readFoundation, section, type FoundationSessions } from "./reading.ts";
import { forecastTableBlocks } from "./plan.ts";

/* ==========================================================
   The financial forecast
========================================================== */

/** The cash-flow and profit and loss forecast, and what labels it. */
export function businessForecast(sessions: FoundationSessions) {
    const f = readFoundation(sessions, { wholeOnly: true });
    return {
        forecast: financialForecast(f.financial, f.revenuePage, f.lines, f.legalEntity, f.format, f.calculated),
        years: planYears(f.financial),
        currency: f.currency,
        format: f.format,
        name: f.name
    };
}

/** The Financial Forecast as a document, for Markdown and PDF: the same tables the page shows. */
export function businessForecastContent(
    sessions: FoundationSessions,
    period: ForecastPeriod,
    untilYear: number,
    capability = "Foundation"
): ExportContent {
    const f = readFoundation(sessions, { wholeOnly: true });
    const forecast = financialForecast(f.financial, f.revenuePage, f.lines, f.legalEntity, f.format, f.calculated);
    const view = forecastView(forecast, period, untilYear);
    const whole = moneyFormatter(f.currency, { wholeOnly: true });
    // A monthly or quarterly forecast beyond one plan year is too wide
    // for one page -- every month or quarter of every year, side by
    // side -- so it is one table per plan year here, each with its own
    // year subtotal, rather than shrinking the text to fit (see
    // splitMonthlyTableByYear).
    const tables = period === "annual" ? view.tables : view.tables.flatMap(splitMonthlyTableByYear);
    return {
        systemNumber: "",
        // Also the download's file name, so no colon.
        systemName: "Financial Forecast " + f.name + " " + period,
        capability,
        documentTitle: "Financial Forecast: " + f.name,
        documentSubtitle: (period === "monthly" ? "Month by month" : period === "quarterly" ? "Quarter by quarter" : "By plan year") +
            ", from " + forecast.months[0] +
            (f.currency ? ". Amounts in " + f.currency + "." : "."),
        documentMeta: coverLines(f),
        documentLogo: brandPictures(f.brandInventoryValue).logo,
        // Wide tables: printed sideways, in the PDF.
        landscape: true,
        sections: [
            ...tables.map((entry, index) => section(index + 1, entry.title, [
                ...(entry.note ? paragraph(entry.note) : []),
                ...forecastTableBlocks(entry, whole, f.currency)
            ])),
            section(tables.length + 1, "Notes", list(forecast.notes))
        ]
    };
}
