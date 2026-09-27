import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import { businessForecast, businessModelCanvas, businessModelCanvasData, businessPlan, currentSituationDraft, financialPlanRange, readFoundation } from "./BusinessDocuments.ts";
import { financialPosition, stressTest, whatItWouldTake, withWhatIf } from "./FinancialModel.ts";
import { forecastCsv, forecastView } from "./FinancialForecast.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { MarkdownExporter } from "./MarkdownExporter.ts";
import exampleText from "../../../docs/examples/lumen-and-loom-studio.json?raw";

/* The two documents, built from the Lumen & Loom Studio example. */

const example = JSON.parse(exampleText) as { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };

const load = (number: number, id: string) =>
    InterviewSession.fromJSON(example.systems[String(number)], frameworkRegistry.getFramework(id));

const sessions = {
    identity: load(1, "identity"),
    brand: load(2, "brand"),
    business: load(3, "business"),
    strategy: load(4, "strategy"),
    organisationName: "Lumen & Loom Studio"
};

const markdown = (content: ReturnType<typeof businessPlan>) =>
    new MarkdownExporter().toMarkdown(sessions.business, "Foundation", content);

describe("business documents", () => {

    test("the canvas fills all nine blocks", () => {
        const data = businessModelCanvasData(sessions);
        for (const [block, entries] of Object.entries(data.blocks)) {
            expect(entries.length, block).toBeGreaterThan(0);
        }
        expect(data.blocks.segments[0]).toContain("Conscious London Homemakers");
        expect(data.blocks.partners.join(" ")).toContain("Accountant");
        // Every bracket closed: "Name (Category)".
        data.blocks.activities.forEach(entry => expect(entry.split("(").length).toBe(entry.split(")").length));
        const md = markdown(businessModelCanvas(sessions));
        expect(md).toContain("# Business Model Canvas: Lumen & Loom Studio Ltd");
        expect(md).not.toContain("Not answered yet");
    });

    test("the plan has every section, answered", () => {
        const md = markdown(businessPlan(sessions));
        for (const title of ["Executive Summary", "Company Description", "Market Analysis", "Products and Services",
            "Marketing and Sales", "Operations", "Management and Team", "Financial Plan", "Funding Request",
            "Strategy and Milestones", "Risks", "Brand"]) {
            expect(md).toContain(title);
        }
        expect(md).not.toContain("Not answered yet");
        expect(md).toContain("# Business Plan: Lumen & Loom Studio Ltd");
        // Financial Sustainability numbers on from Financial Foundation's four headings.
        expect(md).toContain("### 5. Revenue");
        expect(md).toContain("Lumen & Loom Studio Ltd, a private company limited by shares, based in London, United Kingdom, was founded by");
        expect(md).toContain("is seeking £10,670");
    });

    test("the financial forecast adds up, month by month and by year", () => {
        const { forecast, years } = businessForecast(sessions);
        expect(years).toBe(3);
        expect(forecast.months).toHaveLength(36);
        expect(forecast.months[0]).toBe("Oct 2026");

        const row = (label: string) => forecast.cashFlow.rows.find(entry => entry.label === label)!;
        const closing = row("Closing balance").values;
        // Each month opens where the last one closed.
        row("Opening balance").values.slice(1).forEach((amount, index) => expect(amount).toBeCloseTo(closing[index], 6));

        const annual = forecastView(forecast, "annual", 2);
        expect(annual.columns).toEqual(["Year 1 (Oct 2026 – Sep 2027)", "Year 2 (Oct 2027 – Sep 2028)"]);
        const cash = annual.tables[0];
        const yearClosing = cash.rows.find(entry => entry.label === "Closing balance")!.values;
        expect(yearClosing[1]).toBeCloseTo(closing[23], 6);
        const receipts = cash.rows.find(entry => entry.label === "Total receipts")!.values;
        expect(receipts[0]).toBeCloseTo(row("Total receipts").values.slice(0, 12).reduce((a, b) => a + b, 0), 6);

        // The balance sheet balances, every month.
        const sheet = (label: string) => forecast.balanceSheet.rows.find(entry => entry.label === label)!.values;
        sheet("Total assets").forEach((amount, index) =>
            expect(amount).toBeCloseTo(sheet("Total liabilities and equity")[index], 6));
        expect(sheet("Cash")[35]).toBeCloseTo(closing[35], 6);
        // The looms and furniture are assets, spread over three years.
        expect(sheet("Equipment, after depreciation")[0]).toBeGreaterThan(8000);
        expect(forecast.profitAndLoss.rows.some(entry => entry.label === "Grant income")).toBe(true);

        const csv = forecastCsv(forecastView(forecast, "monthly", 1), { organization: "Lumen & Loom", currency: "GBP", notes: forecast.notes });
        const lines = csv.slice(1).split(String.fromCharCode(13, 10));
        expect(lines[0]).toBe("Lumen & Loom: Financial Forecast");
        expect(lines[3].split(",")).toHaveLength(13);
    });

});

/* The Quillfield example: a single-member LLC in New York. */
import quillfieldText from "../../../docs/examples/quillfield-automation-llc.json?raw";

describe("the forecast's accounting conventions", () => {

    const quill = JSON.parse(quillfieldText) as typeof example;
    const loadQuill = (number: number, id: string) =>
        InterviewSession.fromJSON(quill.systems[String(number)], frameworkRegistry.getFramework(id));
    // The example holds Identity and Business only: all the forecast reads.
    const quillSessions = {
        ...sessions,
        identity: loadQuill(1, "identity"),
        business: loadQuill(3, "business"),
        organisationName: "Quillfield Automation"
    };

    test("an LLC's founder pay is drawings, and the balance sheet still balances", () => {
        const { forecast } = businessForecast(quillSessions);
        const pl = (label: string) => forecast.profitAndLoss.rows.find(entry => entry.label === label);
        const sheet = (label: string) => forecast.balanceSheet.rows.find(entry => entry.label === label)!.values;
        expect(pl("Owner's drawings (not a cost)")?.values[0]).toBeCloseTo(4500, 6);
        expect(forecast.cashFlow.rows.find(entry => entry.label === "Owner's drawings")?.values[0]).toBeCloseTo(4500, 6);
        sheet("Total assets").forEach((amount, index) =>
            expect(amount).toBeCloseTo(sheet("Total liabilities and equity")[index], 6));
        // The annual insurance and fees are a twelfth a month; what is paid ahead is prepaid.
        expect(sheet("Prepaid costs")[0]).toBeGreaterThan(0);
        // $1,350 of formation fees were paid before the plan: out of the opening cash.
        expect(forecast.cashFlow.rows.find(entry => entry.label === "Opening balance")!.values[0]).toBeCloseTo(10650, 6);
    });

    test("a company's founders are paid a salary; a grant is never capital", () => {
        const { forecast } = businessForecast(sessions);
        expect(forecast.profitAndLoss.rows.some(entry => entry.label.startsWith("Owner's drawings"))).toBe(false);
        // Lumen's founders put in £13,000; the Hackney grant is income, not capital.
        expect(forecast.balanceSheet.rows.find(entry => entry.label === "Capital put in")!.values[0]).toBeCloseTo(13000, 6);
    });

});

/*
    QUILLFIELD, A TEST CASE THAT DOES NOT BALANCE. Its plan seeks a
    $15,000 SBA microloan; kept as it is, it shows the forecast finding
    a gap the funding being sought does not close once its own
    repayments are counted, and what changing the plan does to it.
*/
describe("Quillfield: an unresolved funding gap", () => {

    const quill = JSON.parse(quillfieldText) as typeof example;
    const loadQuill = (number: number, id: string) =>
        InterviewSession.fromJSON(quill.systems[String(number)], frameworkRegistry.getFramework(id));
    const quillSessions = {
        ...sessions,
        identity: loadQuill(1, "identity"),
        business: loadQuill(3, "business"),
        organisationName: "Quillfield Automation"
    };
    const f = readFoundation(quillSessions);

    test("the Current Situation is drafted from the Business System", () => {
        const draft = currentSituationDraft(quillSessions);
        const lines = draft.split("\n");
        expect(lines[0]).toContain("We sell AI Workflow Audit ($2,500 a project)");
        expect(lines[0]).toContain("Automation Care Retainer ($1,200 a month)");
        expect(draft).toContain("Customers find and reach us through");
        expect(draft).toContain("are seeking $15,000 (SBA Microloan)");
        expect(draft).toContain("breaking even in");
        expect(draft).not.toMatch(/undefined|NaN/);
    });

    test("the Strategy System reads the financial plan's dates", () => {
        expect(financialPlanRange(quillSessions)).toEqual({ start: { month: "01", year: "2027" }, end: { month: "12", year: "2029" } });
    });

    test("the Funding Need covers the whole plan", () => {
        // $3,150 of establishment costs (the $450 video kit included) and a $22,815 operating need.
        expect(f.position.need).toBeCloseTo(25965.23, 1);
    });

    test("the loan's repayments are scheduled", () => {
        const loan = f.position.loans.find(entry => entry.source.name === "SBA Microloan")!;
        expect(loan.schedule.firstPayment).toBeCloseTo(470.05, 2);
        expect(loan.schedule.totalInterest).toBeCloseTo(1921.64, 1);
    });

    test("the gap is found: $10,650 in hand against $25,965", () => {
        expect(f.position.availableNow).toBeCloseTo(10650, 6);
        expect(f.position.gap).toBeCloseTo(15315.23, 1);
        expect(f.position.signals.some(signal => signal.title === "Funding Gap")).toBe(true);
    });

    test("the $15,000 being sought still leaves cash short once it is repaid", () => {
        expect(f.position.sought).toMatchObject({ amount: 15000, lowestLabel: "Jul 2027" });
        expect(f.position.sought!.shortfall).toBeCloseTo(2400.41, 1);
        expect(f.position.signals.some(signal => signal.title === "Funding Being Sought Falls Short")).toBe(true);
    });

    test("the stress test: short as planned, and more so in every worse case", () => {
        const test = stressTest(f.revenuePage, f.financial, f.lines, f.legalEntity, f.format);
        expect(test.sought).toBe(15000);
        const short = Object.fromEntries(test.scenarios.map(scenario => [scenario.id, Math.round(scenario.shortfall)]));
        expect(short).toEqual({ planned: 2400, sales: 6484, delay: 19600, costs: 3705, late: 8797, downside: 33710 });
        expect(test.scenarios[0].lowestLabel).toBe("Jul 2027");
    });

    test("what it would take: any one of these closes the gap", () => {
        const take = whatItWouldTake(f.revenuePage, f.financial, f.lines, f.legalEntity, f.format);
        expect(take.holds).toBe(false);
        expect(Math.round(take.shortfall)).toBe(2400);
        expect(take.shortBy).toBe("Jun 2027");
        expect({ prices: take.prices, sales: take.sales, costs: take.costs, earlier: take.earlier })
            .toEqual({ prices: 20, sales: 22, costs: 19, earlier: 1 });
    });

    test("what if: prices 20% higher close it; a $17,000 loan does not", () => {
        const dearer = withWhatIf(f.revenuePage, { price: 20, volume: 0, delay: 0 }, f.financial.planStart);
        const priced = financialPosition(f.financial, f.lines, f.legalEntity, f.currency, f.format, dearer);
        expect(priced.gap).toBeCloseTo(13041.36, 1);
        expect(priced.sought!.shortfall).toBe(0);

        const bigger = {
            ...f.financial,
            funding: f.financial.funding.map(source => source.name === "SBA Microloan" ? { ...source, amount: "17000" } : source)
        };
        const borrowed = financialPosition(bigger, f.lines, f.legalEntity, f.currency, f.format, f.revenuePage);
        expect(borrowed.sought!.shortfall).toBeCloseTo(713.77, 1);
    });

});

/* The Quillfield example answers every section of all four Foundation Systems. */
import { InterviewValidator } from "./InterviewValidator.ts";

describe("the Quillfield example is complete", () => {
    const quill = JSON.parse(quillfieldText) as typeof example;
    const cases: [number, string][] = [[1, "identity"], [2, "brand"], [3, "business"], [4, "strategy"]];
    test.each(cases)("system %i (%s) has nothing missing", (number, id) => {
        const session = InterviewSession.fromJSON(quill.systems[String(number)], frameworkRegistry.getFramework(id));
        const result = new InterviewValidator().validate(session);
        expect(result.valid, JSON.stringify((result as { issues?: unknown }).issues ?? result)).toBe(true);
    });
});
