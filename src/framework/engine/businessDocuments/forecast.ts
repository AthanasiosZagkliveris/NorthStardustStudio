/* Part of BusinessDocuments.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; BusinessDocuments.ts re-exports every part). */

import { type ExportContent } from "../export/ExportContentBuilder.ts";
import { financialForecast, forecastView, splitMonthlyTableByYear, type ForecastPeriod } from "../financial/FinancialForecast.ts";
import { list, paragraph } from "../export/ExportRenderers.ts";
import { planYears, moneyFormatter, allFunding, loanRepaymentNotes } from "../financial/FinancialModel.ts";
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
        name: f.name,
        // (THE TWO CASH CHARTS, the Financials' records moved here (Questions 20, section 14): the funding's month by month, then with the revenue, each once.)
        timeline: f.position.timeline,
        runwayMonths: f.position.runwayMonths,
        revenueTimeline: f.outlook.revenueTimeline,
        breakEvenMonth: f.outlook.breakEvenMonth,
        exhaustionMonth: f.outlook.exhaustionMonth,
        // (THE LOAN REPAYMENTS UNDER THE CASH-FLOW FORECAST (owner, 2026-11-27 03:16 UTC+2; Guide 2, 5.5, row 16): each loan, its status and whether its
        // repayments are counted, then the rule. Empty where no loan is recorded.)
        loanNotes: loanRepaymentNotes(allFunding(f.financial, f.legalEntity), f.financial.planStart, f.format)
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
    const loanNotes = loanRepaymentNotes(allFunding(f.financial, f.legalEntity), f.financial.planStart, f.format);
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
            ...(loanNotes.length > 0 ? [section(tables.length + 1, "Loan Repayments", list(loanNotes))] : []),
            section(tables.length + (loanNotes.length > 0 ? 2 : 1), "Notes", list(forecast.notes))
        ]
    };
}
