import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import { businessForecast, businessForecastContent, businessModelCanvas, businessModelCanvasData, businessPlan, currentSituationDraft, financialPlanRange, readFoundation } from "./BusinessDocuments.ts";
import { financialPosition, stressTest, sustainability, whatItWouldTake, withWhatIf } from "./FinancialModel.ts";
import { financialForecast, forecastCsv, forecastView, splitMonthlyTableByYear } from "./FinancialForecast.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { MarkdownExporter } from "./MarkdownExporter.ts";
import exampleText from "../../data/examples/lumen-and-loom-studio.json?raw";

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
            "Marketing and Sales", "Operations", "Management and Organization", "Financial Plan", "Funding Request",
            "Financial Projections", "Strategy and Milestones", "Risks", "Appendix"]) {
            expect(md).toContain(title);
        }
        expect(md).not.toContain("Not answered yet");
        expect(md).toContain("# Business Plan: Lumen & Loom Studio Ltd");
        // Sustainability numbers on from Financial Foundation's three headings (its costs are in the Appendix).
        expect(md).toContain("### 4. Revenue");
        expect(md).toContain("Lumen & Loom Studio Ltd, a private company limited by shares, based in London, United Kingdom, was founded by");
        expect(md).toContain("is seeking £26,000 of additional funding towards a funding gap of £21,150");
    });

    test("the financial forecast adds up, month by month and by year", () => {
        const { forecast, years } = businessForecast(sessions);
        expect(years).toBe(3);
        expect(forecast.months).toHaveLength(36);
        expect(forecast.months[0]).toBe("Oct 2026");

        const row = (label: string) => forecast.cashFlow.rows.find(entry => entry.label === label)!;
        const closing = row("Cash at end of period").values;
        // Each month opens where the last one closed.
        row("Cash at start of period").values.slice(1).forEach((amount, index) => expect(amount).toBeCloseTo(closing[index], 6));

        const annual = forecastView(forecast, "annual", 2);
        expect(annual.columns).toEqual(["Year 1 (Oct 2026 – Sep 2027)", "Year 2 (Oct 2027 – Sep 2028)"]);
        const cash = annual.tables.find(table => table.title === "Cash-Flow Forecast")!;
        const yearClosing = cash.rows.find(entry => entry.label === "Cash at end of period")!.values;
        expect(yearClosing[1]).toBeCloseTo(closing[23], 6);
        const net = cash.rows.find(entry => entry.label === "Net change in cash")!.values;
        expect(net[0]).toBeCloseTo(row("Net change in cash").values.slice(0, 12).reduce((a, b) => a + b, 0), 6);

        // The balance sheet balances, every month.
        const sheet = (label: string) => forecast.balanceSheet.rows.find(entry => entry.label === label)!.values;
        sheet("Total assets").forEach((amount, index) =>
            expect(amount).toBeCloseTo(sheet("Total liabilities and equity")[index], 6));
        // Cash on the balance sheet is never negative: what the plan cannot pay is the
        // cash shortfall (unfunded) beside it. Lumen's thin margin (see the channel
        // resources) leaves the cash flow below zero at month 36 until the angel round
        // and the Kickstarter, which are not yet counted, arrive.
        expect(sheet("Cash")[35]).toBeCloseTo(Math.max(0, closing[35]), 6);
        expect(sheet("Cash shortfall (unfunded)")[35]).toBeCloseTo(Math.max(0, -closing[35]), 6);
        // The looms and furniture are assets, spread over three years.
        expect(sheet("Equipment (net of depreciation)")[0]).toBeGreaterThan(8000);
        expect(forecast.profitAndLoss.rows.some(entry => entry.label === "Other income (grants)")).toBe(true);

        const csv = forecastCsv(forecastView(forecast, "monthly", 1), { organization: "Lumen & Loom", currency: "GBP", notes: forecast.notes });
        const lines = csv.slice(1).split(String.fromCharCode(13, 10));
        expect(lines[0]).toBe("Lumen & Loom: Financial Forecast");
        // Twelve months and the year's subtotal.
        expect(lines[3].split(",")).toHaveLength(14);
        expect(lines[3].split(",")[13]).toBe("Year 1");
    });

});

/* The Quillfield example: a single-member LLC in New York. */
import quillfieldText from "../../data/examples/quillfield-automation-llc.json?raw";

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
        // Never a line of the profit and loss: a financing payment, and less equity.
        expect(forecast.profitAndLoss.rows.some(entry => /drawings/i.test(entry.label))).toBe(false);
        expect(pl("Salaries")).toBeUndefined();
        expect(forecast.cashFlow.rows.find(entry => entry.label === "Owner's drawings")?.values[0]).toBeCloseTo(-4500, 6);
        expect(sheet("Less: owner's drawings")[0]).toBeCloseTo(-4500, 6);
        sheet("Total assets").forEach((amount, index) =>
            expect(amount).toBeCloseTo(sheet("Total liabilities and equity")[index], 6));
        // The annual insurance and fees are a twelfth a month; what is paid ahead is prepaid.
        expect(sheet("Prepaid expenses")[0]).toBeGreaterThan(0);
        // $1,350 of formation fees were paid before the plan: out of the opening cash.
        expect(forecast.cashFlow.rows.find(entry => entry.label === "Cash at start of period")!.values[0]).toBeCloseTo(10650, 6);
    });

    test("a company's founders are paid a salary; a grant is never capital", () => {
        const { forecast } = businessForecast(sessions);
        expect(forecast.profitAndLoss.rows.some(entry => /drawings/i.test(entry.label))).toBe(false);
        expect(forecast.profitKept).toBeNull();
        // Their salaries are a cost, analysed by nature.
        expect(forecast.profitAndLoss.rows.find(entry => entry.label === "Salaries")!.values[0]).toBeCloseTo(5400, 6);
        // Lumen's founders put in £13,000; the Hackney grant is income, not capital.
        expect(forecast.balanceSheet.rows.find(entry => entry.label === "Share capital")!.values[0]).toBeCloseTo(13000, 6);
        expect(forecast.balanceSheet.rows.some(entry => entry.label === "Retained earnings")).toBe(true);
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
        // $3,210 of establishment costs (the $450 video kit and the $60 webcam and headset included) and a $23,638 operating need.
        // The channels' costs now sit on their own cards (Squarespace, Calendly, Mailchimp, Zoom, payment fees, referral
        // fees, meetups, LinkedIn Premium), counted once; the work tools moved to Infrastructure (QuickBooks, Miro and Loom).
        expect(f.position.need).toBeCloseTo(24759.03, 1);
    });

    test("the loan's repayments are scheduled", () => {
        const loan = f.position.loans.find(entry => entry.source.name === "SBA Microloan")!;
        expect(loan.schedule.firstPayment).toBeCloseTo(470.05, 2);
        expect(loan.schedule.totalInterest).toBeCloseTo(1921.64, 1);
    });

    test("the gap is found: $10,650 in hand against $24,759", () => {
        expect(f.position.availableNow).toBeCloseTo(10650, 6);
        expect(f.position.gap).toBeCloseTo(14109.03, 1);
        expect(f.position.signals.some(signal => signal.title === "Funding Gap")).toBe(true);
    });

    test("the $15,000 being sought still leaves cash short once it is repaid", () => {
        expect(f.position.sought).toMatchObject({ amount: 15000, lowestLabel: "Jul 2027" });
        expect(f.position.sought!.shortfall).toBeCloseTo(1258.17, 1);
        expect(f.position.signals.some(signal => signal.title === "Funding Being Sought Falls Short")).toBe(true);
    });

    test("the stress test: short as planned, and more so in every worse case", () => {
        const test = stressTest(f.revenuePage, f.financial, f.lines, f.legalEntity, f.format);
        expect(test.sought).toBe(15000);
        const short = Object.fromEntries(test.scenarios.map(scenario => [scenario.id, Math.round(scenario.shortfall)]));
        expect(short).toEqual({ planned: 1258, sales: 5469, delay: 18649, costs: 2449, late: 7718, downside: 31171 });
        expect(test.scenarios[0].lowestLabel).toBe("Jul 2027");
    });

    test("what it would take: any one of these closes the gap", () => {
        const take = whatItWouldTake(f.revenuePage, f.financial, f.lines, f.legalEntity, f.format);
        expect(take.holds).toBe(false);
        expect(Math.round(take.shortfall)).toBe(1258);
        expect(take.shortBy).toBe("Jun 2027");
        expect({ prices: take.prices, sales: take.sales, costs: take.costs, earlier: take.earlier })
            .toEqual({ prices: 9, sales: 10, costs: 11, earlier: 1 });
    });

    test("what if: prices 30% higher close it; a $16,000 loan does not", () => {
        // 9% is what it takes (above); the what-if is 30%.
        const dearer = withWhatIf(f.revenuePage, { price: 30, volume: 0, delay: 0 }, f.financial.planStart);
        const priced = financialPosition(f.financial, f.lines, f.legalEntity, f.currency, f.format, dearer);
        expect(priced.gap).toBeCloseTo(10698.23, 1);
        expect(priced.sought!.shortfall).toBe(0);

        const bigger = {
            ...f.financial,
            funding: f.financial.funding.map(source => source.name === "SBA Microloan" ? { ...source, amount: "16000" } : source)
        };
        const borrowed = financialPosition(bigger, f.lines, f.legalEntity, f.currency, f.format, f.revenuePage);
        expect(borrowed.sought!.shortfall).toBeCloseTo(414.85, 1);
    });

});

/* The Quillfield example answers every section of all four Foundation Systems. */
import { InterviewValidator } from "./InterviewValidator.ts";

/* The fixes the Business Documents review asked for. */
describe("Quillfield: the documents tie together", () => {

    const quill = JSON.parse(quillfieldText) as typeof example;
    const loadQuill = (number: number, id: string) =>
        InterviewSession.fromJSON(quill.systems[String(number)], frameworkRegistry.getFramework(id));
    const all = {
        identity: loadQuill(1, "identity"),
        brand: loadQuill(2, "brand"),
        business: loadQuill(3, "business"),
        strategy: loadQuill(4, "strategy"),
        organisationName: "Quillfield Automation"
    };
    const f = readFoundation(all);
    const planMd = new MarkdownExporter().toMarkdown(all.business, "Foundation", businessPlan(all));
    const count = (text: string, part: string) => text.split(part).length - 1;

    test("names the channels' journey stages as the page does, and their new channel names", () => {
        expect(planMd).toContain("Main Website");
        expect(planMd).toContain("Event / Talk");
        expect(planMd).toMatch(/Discover, Evaluation/);
        expect(planMd).not.toMatch(/Discovery, /);
        expect(planMd).toContain("Support & Follow Up");
    });

    test("negative cash is funding still to be found, and the balance sheet still balances", () => {
        const { forecast } = businessForecast(all);
        const sheet = (label: string) => forecast.balanceSheet.rows.find(entry => entry.label === label)!;
        const closing = forecast.cashFlow.rows.find(entry => entry.label === "Cash at end of period")!.values;
        // Quillfield's cash runs below zero in 2027.
        expect(Math.min(...closing)).toBeLessThan(0);
        closing.forEach((amount, index) => {
            expect(sheet("Cash").values[index]).toBeCloseTo(Math.max(0, amount), 6);
            expect(sheet("Cash shortfall (unfunded)").values[index]).toBeCloseTo(Math.max(0, -amount), 6);
            expect(sheet("Total assets").values[index]).toBeCloseTo(sheet("Total liabilities and equity").values[index], 6);
        });
        // The opening column balances too.
        expect(sheet("Total assets").opening).toBeCloseTo(sheet("Total liabilities and equity").opening!, 6);
        expect(sheet("Cash").opening).toBeCloseTo(10650, 6);
        expect(forecast.balanceSheet.rows.filter(row => row.heading).map(row => row.label))
            .toEqual(["Current assets", "Non-current assets", "Current liabilities", "Equity"]);
        const view = forecastView(forecast, "annual", 3);
        const balance = view.tables.find(table => table.title === "Balance Sheet")!;
        expect(balance.columns[0]).toBe("Opening (Jan 2027)");
        expect(balance.columns).toHaveLength(4);
    });

    test("profit kept in the business is Sustainability's monthly result", () => {
        // Without the one-time costs (which the profit and loss counts
        // when paid, and Sustainability leaves to the funding),
        // the two agree month by month.
        const onlyRecurring = readFoundation(all);
        // (A dated Per project card is a one-off payment, like a one-time cost: it is no part of the monthly result.)
        const lines = onlyRecurring.lines.filter(line => line.frequency !== "one-time" && line.frequency !== "per-project");
        const forecast = financialForecast(onlyRecurring.financial, onlyRecurring.revenuePage, lines, onlyRecurring.legalEntity, onlyRecurring.format);
        const outlook = sustainability(onlyRecurring.revenuePage, onlyRecurring.financial, lines, onlyRecurring.legalEntity, onlyRecurring.format);
        const after = forecast.profitKept!.rows.find(row => row.label === "Profit kept in the business")!.values;
        outlook.months.forEach((month, index) => expect(after[index]).toBeCloseTo(month.revenue - month.costs, 6));

        // With them, break even still falls in the same month: Jul 2027.
        const full = businessForecast(all).forecast.profitKept!.rows.find(row => row.label === "Profit kept in the business")!.values;
        expect(full.findIndex(amount => amount >= 0) + 1).toBe(f.outlook.breakEvenMonth);
        expect(f.outlook.breakEvenMonth).toBe(7);
    });

    test("founders' pay is the owner's drawings in the plan and the canvas", () => {
        expect(planMd).toContain("Founder pay (owner's drawings): Jordan Ellis");
        expect(planMd).not.toContain("Salary: Jordan Ellis");
        expect(businessModelCanvasData(all).blocks.costs.join(" | ")).toContain("Founder pay (owner's drawings): Jordan Ellis");
    });

    test("the funding request reconciles", () => {
        expect(f.position.need - f.position.availableNow - f.position.confirmedFuture).toBeCloseTo(f.position.gap, 1);
        const request = planMd.slice(planMd.indexOf("Funding Request"));
        expect(request).toContain("Funding need: $24,759");
        expect(request).toContain("Available now: $10,650 ($12,000 received, less $1,350 of costs paid before the plan)");
        expect(request).toContain("Funding gap: $14,109");
        expect(request).toContain("Amount sought: $15,000 (SBA Microloan)");
        expect(request).toContain("Still short after repayments: $1,258 at the lowest point, in Jul 2027");
        expect(request).toContain("| Total | $24,759 |");
    });

    test("with a grant sought instead of a loan, the funding request speaks of no repayments", () => {
        // The same $15,000 sought, as a grant: nothing is repaid.
        const asGrant = JSON.parse(quillfieldText.replace('"type": "microloan"', '"type": "grant"')) as typeof example;
        const business = InterviewSession.fromJSON(asGrant.systems["3"], frameworkRegistry.getFramework("business"));
        const md = new MarkdownExporter().toMarkdown(business, "Foundation", businessPlan({ ...all, business }));
        // The Funding Request section only, up to the next section.
        const from = md.indexOf("Funding Request\n");
        const request = md.slice(from, md.indexOf("\n## ", from + 1));
        expect(request).not.toMatch(/\brepaid\b|\brepayments included\b/);
        expect(request).not.toContain("Still short after repayments");
        expect(request).toMatch(/Still short with the funding sought: (\$[\d,]+ at the lowest point, in \w+ \d{4}, even with the funding sought|Nothing: with the funding sought, cash stays above zero)/);
    });

    test("the plan runs in the standard order: the request, then the financials, then the Appendix", () => {
        const titles = [...planMd.matchAll(/^## [0-9]+\. (.+)$/gm)].map(match => match[1]);
        expect(titles).toEqual(["Executive Summary", "Company Description", "Market Analysis", "Products and Services",
            "Marketing and Sales", "Operations", "Management and Organization", "Strategy and Milestones", "Risks",
            "Funding Request", "Financial Plan", "Financial Projections", "Appendix"]);
        const part = (title: string) => {
            const from = planMd.indexOf(title);
            const next = planMd.slice(from + 1).search(/^## [0-9]+\. /m);
            return planMd.slice(from, next < 0 ? undefined : from + 1 + next);
        };
        // The legal structure under Management, the licences under Operations.
        expect(part("## 7. Management and Organization")).toContain("### Legal Structure");
        expect(part("## 7. Management and Organization")).toContain("Legal form: Limited Liability Company (LLC)");
        expect(part("## 6. Operations")).toContain("### Licences and Registrations");
        expect(part("## 2. Company Description")).not.toContain("Legal Structure");
        // What the answers do not collect is said, not made up.
        expect(part("## 4. Products and Services")).toContain("### Intellectual Property and Product Lifecycle\n\nNot covered by the Foundation answers.");
        // Each founder's profile is, from the Founders Profile.
        expect(part("## 7. Management and Organization")).toContain("### Founder Profiles");
        expect(part("## 7. Management and Organization")).not.toContain("Experience and CVs");
    });

    test("the funding request states its terms, debt and equity, period and repayment", () => {
        const request = planMd.slice(planMd.indexOf("## 10. Funding Request"), planMd.indexOf("## 11. Financial Plan"));
        expect(request).toContain("| Source | Type | Amount | Status | Received | Terms |");
        expect(request).toContain("| SBA Microloan | Microloan | $15,000 | Requested / Applied | $0 | 8% a year, fixed; 36 monthly repayments of $470 from Mar 2027 |");
        expect(request).toContain("**Debt and equity:** Debt: $15,000; equity and owner's capital: $12,000");
        expect(request).toContain("**Period covered:** The plan's 36 months, Jan 2027 – Dec 2029.");
        expect(request).toContain("**Repayment:** SBA Microloan: repaid from the business's cash over 36 repayments, the last in Feb 2030.");
    });

    test("the projections: Year 1 by quarter, the later years by year, capital expenditure and assumptions", () => {
        const projections = planMd.slice(planMd.indexOf("## 12. Financial Projections"), planMd.indexOf("## 13. Appendix"));
        const headings = [...projections.matchAll(/^### (.+)$/gm)].map(match => match[1]);
        expect(headings).toEqual(["Profit and Loss", "Profit Kept in the Business", "Balance Sheet", "Cash Flow", "Capital Expenditure", "Assumptions"]);
        expect(projections).toContain("| USD | Q1 | Q2 | Q3 | Q4 | Year 1 | Year 2 | Year 3 |");
        expect(projections).toContain("**Periods:** Q1: Jan – Mar 2027; Q2: Apr – Jun 2027; Q3: Jul – Sep 2027; Q4: Oct – Dec 2027; Year 2: Jan 2028 – Dec 2028; Year 3: Jan 2029 – Dec 2029.");
        expect(projections).toContain("they are not extended to five years");
        // The drawings are not in the profit and loss; the reconciliation below it ties to Page 5.
        const pl = projections.slice(projections.indexOf("### Profit and Loss"), projections.indexOf("### Profit Kept"));
        expect(pl).not.toMatch(/drawings/i);
        expect(projections).toContain("| Less: owner's drawings | -$13,500 | -$13,500 | -$13,500 | -$13,500 | -$54,000 | -$54,000 | -$54,000 |");
        expect(projections).toContain("the result Sustainability shows as revenue less costs");
        // The $450 video kit and the $60 webcam and headset.
        expect(projections).toContain("| Purchase of equipment | -$510 |");
        expect(projections).toContain("| Total capital expenditure | $510 |");
        expect(projections).toContain("- There is no income tax at business level: as a pass-through business");
    });

    test("the plan carries every saved answer the review asked for", () => {
        const at = (title: string) => planMd.slice(planMd.indexOf(title));
        // The cover.
        expect(planMd).toMatch(/Prepared: [A-Z][a-z]{2} [0-9]{4}/);
        expect(planMd).toContain("Website: quillfieldautomation.com");
        // Financial Projections, with the drawings line.
        expect(at("Financial Projections")).toContain("### Profit and Loss");
        expect(at("Financial Projections")).toContain("### Profit Kept in the Business");
        expect(at("Financial Projections")).toContain("| Profit kept in the business |");
        expect(at("Financial Projections")).toContain("### Balance Sheet");
        // Strategy.
        expect(planMd).toContain("| Internal | • Founder with hands-on automation");
        expect(planMd).toContain("### Key Performance Indicators");
        expect(planMd).toContain("| Confirmed funding | $0 | $15,000 | Monthly | Jordan Ellis |");
        expect(planMd).toContain("### Roadmap");
        expect(planMd).toContain("| 1. Financial Stability | Close the funding gap");
        expect(planMd).toContain("### Current Situation");
        // Identity and legal.
        expect(planMd).toContain("### Manifesto");
        expect(planMd).toContain("Tax identification number (EIN): 93-4567812");
        expect(planMd).toContain("Formation date: Aug 2026");
        // The address's lines (street, city, ZIP), then the state and the country.
        expect(planMd).toContain("120 Clinton Street, Suite 3R, Brooklyn, 11201, New York, United States of America");
        expect(planMd).toContain("| Jordan Ellis | 100% | $12,000 |");
        expect(planMd).toContain("| Full-time (about 37 hours a week) | $4,500 a month (owner's drawings) |");
        // Brand & Voice under Marketing and Sales; the style guide in the Appendix.
        const marketing = planMd.slice(planMd.indexOf("## 5. Marketing and Sales"), planMd.indexOf("## 6. Operations"));
        expect(marketing).toContain("### Brand & Voice");
        expect(marketing).toContain("#### Body Language");
        expect(planMd).not.toMatch(/^## [0-9]+[.] Brand$/m);
        expect(at("## 13. Appendix")).toContain("### Brand Style Guide");
        expect(at("## 13. Appendix")).toContain("### Costs");
        // Products with their prices.
        expect(planMd).toContain("| $2,500 per project | Sale |");
        expect(planMd).toContain("| $1,200 per client a month | Subscription / Retainer |");
    });

    test("the forecast exports as a document", () => {
        const md = new MarkdownExporter().toMarkdown(all.business, "Foundation", businessForecastContent(all, "annual", 3));
        expect(md).toContain("# Financial Forecast: Quillfield Automation LLC");
        expect(md).toContain("## 1. Profit and Loss Forecast");
        expect(md).toContain("## 2. Profit Kept in the Business");
        expect(md).toContain("| Profit kept in the business |");
        expect(md).toContain("| Cash shortfall (unfunded) |");
        expect(md).toContain("| Income tax | None at business level |");
        expect(md).not.toContain("-$0");
    });

    test("the canvas: crucial work, resources by kind, streams by segment", () => {
        const { blocks } = businessModelCanvasData(all);
        const everything = Object.values(blocks).flat();
        everything.forEach(entry => expect(entry, entry).not.toContain(") ("));
        expect(blocks.partners).toContain("Freelance developer (overflow, for Automation Build)");
        expect(blocks.activities).toEqual(["Deliver AI Workflow Audit", "Deliver Automation Build", "Deliver Automation Care Retainer",
            "Marketing and sales through social media, website, email, in person, online / live and file delivery"]);
        // The relationships are their own block, not repeated as activities.
        expect(blocks.activities.join(" ")).not.toMatch(/Support|Assistance|^Run /);
        expect(blocks.activities.join(" ")).not.toContain("Set up bookkeeping");
        expect(planMd).toContain("### Launch and Setup Tasks");
        expect(planMd).toContain("Set up bookkeeping");
        const resources = blocks.resources.join(" ");
        // Strategyzer's four kinds, with the software as its essentials.
        expect(blocks.resources.map(entry => entry.split(":")[0])).toEqual(["Human", "Physical", "Physical (systems)", "Intellectual", "Financial"]);
        // What a channel needs (the website, booking, email, video, event and LinkedIn costs) is an Offering's Capability resource;
        // the tools the work needs anyway (Google Workspace, QuickBooks, Miro and Loom) stay with the systems on Infrastructure.
        expect(resources).toContain("Webcam and headset; Video-conferencing kit (camera, microphone, light); Squarespace Core; Calendly Standard; Mailchimp Standard; Zoom Workplace Pro; LinkedIn Premium Business");
        expect(resources).toContain("Physical (systems): Google Workspace Business Standard; Make.com Core plan; Zapier Professional and 5 more");
        expect(resources).toContain("Intellectual: the Quillfield Automation LLC brand; the website quillfieldautomation.com");
        expect(resources).toContain("Financial: $10,650 in hand; $15,000 sought (SBA Microloan)");
        expect(resources).not.toMatch(/Electricity|AI model and API usage|Coworking Space/);
        expect(blocks.costs).toContain("Founder pay (owner's drawings): Jordan Ellis ($4,500 a month)");
        // $45 of running costs on each month’s retainer (the card or ACH fee is a calculated percent of revenue now, not a cost per unit).
        expect(blocks.costs).toContain("Variable costs: $45 per client a month (Automation Care Retainer)");
        // The audit’s $40 of AI usage (the payment fees and the referral fees are calculated percents of the audit’s revenue).
        expect(blocks.costs).toContain("Variable costs: $40 per project (AI Workflow Audit)");
        expect(blocks.costs.join(" ")).not.toMatch(/[.][0-9][0-9]/);
        expect(blocks.revenue).toContain("AI Workflow Audit (Small professional-services firms in New York City): $2,500 per project, one-time");
        expect(blocks.revenue).toContain("Automation Care Retainer (Small professional-services firms in New York City): $1,200 per client a month, recurring");
        expect(blocks.revenue.join(" ")).not.toContain("×");
        // One segment: the relationships need not name it.
        expect(blocks.relationships).toContain("AI Workflow Audit: Personal Assistance");
        // Two segments (Lumen): each relationship names its segment.
        expect(businessModelCanvasData(sessions).blocks.relationships)
            .toContain("Weaving Workshops (Conscious London Homemakers): Community");
        const content = businessModelCanvas(all, "Deliver Value");
        expect(content.capability).toBe("Deliver Value");
        expect(content.canvas).toHaveLength(9);
        const md = new MarkdownExporter().toMarkdown(all.business, "Deliver Value", content);
        expect(md).toContain("| Key Partners | Key Activities | Value Propositions | Customer Relationships | Customer Segments |");
        expect(md).toContain("| Cost Structure | Revenue Streams |");
    });

    test("the documents' formatting: whole amounts, one date format, bold labels", () => {
        // Whole amounts: no cents anywhere in the plan.
        expect(planMd).not.toMatch(/\$[0-9,]+\.[0-9]{2}/);
        // "Jan 2027", never "January 2027".
        expect(planMd).not.toMatch(/(January|February|March|April|June|July|August|September|October|November|December) 20[0-9]{2}/);
        expect(planMd).toContain("**Mission:**");
        expect(planMd).toContain("#### Values");
        expect(planMd).toContain("#### Principles");
        expect(planMd).toContain("#### Customer Profiles");
        expect(planMd).toContain("#### Competitors");
        expect(planMd).toContain("| Competitor | Type | Strengths | Weaknesses | Insights |");
        // Funds run out before break even: no buffer, said so.
        expect(planMd).toContain("Sustainability buffer: None");
        expect(planMd).toContain("$1,200 / client a month");
        expect(planMd).toContain("Available Now: $10,650 ($12,000 received, less $1,350 of costs paid before the plan)");
        // Segment names lower-case mid-sentence.
        expect(planMd).toContain("to small professional-services firms in New York City.");
        expect(planMd).toContain("### For small professional-services firms in New York City");
        // The costs, by group, with subtotals and a total, without their source.
        const appendix = planMd.slice(planMd.indexOf("## 13. Appendix"));
        expect(appendix).toContain("#### Establishment");
        expect(appendix).toContain("| Subtotal | $1,860 one-time |");
        expect(appendix).toContain("**Total:** $1,860 one-time; $5,231 a month");
        expect(appendix).not.toContain("| Source |");
        // The Roadmap numbers each Theme's Objectives from 1.
        expect(planMd).toContain("| 1. Financial Stability | 1. Close the funding gap (Jan 2027 – Jun 2027)<br>2. Reach monthly break even");
    });

    test("the forecast tables: no all-zero lines, year subtotals by month", () => {
        const { forecast } = businessForecast(all);
        const annual = forecastView(forecast, "annual", 3);
        annual.tables.forEach(table => table.rows
            .filter(row => !row.heading && !row.total && row.text === undefined)
            .forEach(row => expect(row.values.some(amount => Math.abs(amount) > 0.005), row.label).toBe(true)));
        expect(annual.tables.map(table => table.title))
            .toEqual(["Profit and Loss Forecast", "Profit Kept in the Business", "Balance Sheet", "Cash-Flow Forecast"]);
        const byTitle = (view: typeof annual, title: string) => view.tables.find(table => table.title === title)!;
        expect(byTitle(annual, "Cash-Flow Forecast").rows.some(row => row.label === "Interest paid")).toBe(false);
        const monthly = forecastView(forecast, "monthly", 2);
        expect(monthly.columns).toHaveLength(26);
        expect(monthly.columns[12]).toBe("Year 1");
        expect(byTitle(monthly, "Cash-Flow Forecast").subtotalColumns).toEqual([12, 25]);
        expect(byTitle(monthly, "Balance Sheet").subtotalColumns).toEqual([13, 26]);
        const receipts = byTitle(monthly, "Cash-Flow Forecast").rows.find(row => row.label === "Receipts from customers")!.values;
        expect(receipts[12]).toBeCloseTo(receipts.slice(0, 12).reduce((a, b) => a + b, 0), 6);
    });

    test("each financial signal is said once, and capacity once", () => {
        expect(count(planMd, "Funding Dependency:")).toBe(1);
        expect(count(planMd, "Financial Risk:")).toBeLessThanOrEqual(2);
        expect(count(planMd, "Capacity is the founders' delivery hours")).toBe(1);
        expect(planMd).toContain("### Capacity");
    });

    test("Risks does not repeat the SWOT's threats and weaknesses, and points to it", () => {
        const swot = planMd.slice(planMd.indexOf("### SWOT Analysis"), planMd.indexOf("### Strategic Themes"));
        expect(swot).toContain("Larger agencies packaging low-cost automation offers for small firms");
        expect(swot).toContain("A single founder's capacity limits how many builds can run at once");

        const risks = planMd.slice(planMd.indexOf("## 9. Risks"), planMd.indexOf("## 10. Funding Request"));
        expect(risks).toContain("See SWOT: Weaknesses and Threats");
        expect(risks).not.toContain("Larger agencies packaging low-cost automation offers for small firms");
        expect(risks).not.toContain("A single founder's capacity limits how many builds can run at once");
        expect(risks).not.toContain("### External Threats");
        expect(risks).not.toContain("### Internal Weaknesses");
        // What is not in the SWOT stays: the financial signals.
        expect(risks).toContain("### Financial Signals");
        expect(risks).toContain("Funding Dependency:");
    });

    test("the Financial Forecast PDF/Markdown is landscape, and a wide monthly forecast is one table per year", () => {
        const monthly = businessForecastContent(all, "monthly", 3);
        expect(monthly.landscape).toBe(true);
        expect(monthly.sections.map(entry => entry.title)).toEqual([
            "Profit and Loss Forecast: Year 1", "Profit and Loss Forecast: Year 2", "Profit and Loss Forecast: Year 3",
            "Profit Kept in the Business: Year 1", "Profit Kept in the Business: Year 2", "Profit Kept in the Business: Year 3",
            "Balance Sheet: Year 1", "Balance Sheet: Year 2", "Balance Sheet: Year 3",
            "Cash-Flow Forecast: Year 1", "Cash-Flow Forecast: Year 2", "Cash-Flow Forecast: Year 3",
            "Notes"
        ]);
        // Every split table's own table block has one column per month
        // plus its year subtotal (the Balance Sheet's Year 1 also
        // carries the Opening column, once).
        const table = (title: string) => monthly.sections.find(entry => entry.title === title)!.blocks[0] as { kind: "table"; headers: string[] };
        expect(table("Cash-Flow Forecast: Year 1").headers).toHaveLength(1 + 13);
        expect(table("Cash-Flow Forecast: Year 2").headers).toHaveLength(1 + 13);
        expect(table("Balance Sheet: Year 1").headers).toHaveLength(1 + 14);
        expect(table("Balance Sheet: Year 2").headers).toHaveLength(1 + 13);

        // A single plan year is already narrow enough: left as one table.
        const oneYear = businessForecastContent(all, "monthly", 1);
        expect(oneYear.sections.map(entry => entry.title)).toEqual([
            "Profit and Loss Forecast", "Profit Kept in the Business", "Balance Sheet", "Cash-Flow Forecast", "Notes"
        ]);

        // The annual view is narrow regardless of plan length: never split.
        const annual = businessForecastContent(all, "annual", 3);
        expect(annual.landscape).toBe(true);
        expect(annual.sections.map(entry => entry.title)).toEqual([
            "Profit and Loss Forecast", "Profit Kept in the Business", "Balance Sheet", "Cash-Flow Forecast", "Notes"
        ]);
    });

    test("splitMonthlyTableByYear keeps the Opening column with Year 1 only, and each year's own subtotal", () => {
        const { forecast } = businessForecast(all);
        const view = forecastView(forecast, "monthly", 2);
        const cashFlow = view.tables.find(table => table.title === "Cash-Flow Forecast")!;
        const balanceSheet = view.tables.find(table => table.title === "Balance Sheet")!;

        const cashParts = splitMonthlyTableByYear(cashFlow);
        expect(cashParts).toHaveLength(2);
        expect(cashParts[0].columns).toEqual(cashFlow.columns.slice(0, 13));
        expect(cashParts[0].subtotalColumns).toEqual([12]);
        expect(cashParts[1].columns).toEqual(cashFlow.columns.slice(13, 26));
        expect(cashParts[1].subtotalColumns).toEqual([12]);
        const receiptsYear1 = cashParts[0].rows.find(row => row.label === "Receipts from customers")!.values;
        const receiptsYear1FromFull = cashFlow.rows.find(row => row.label === "Receipts from customers")!.values.slice(0, 13);
        expect(receiptsYear1).toEqual(receiptsYear1FromFull);

        const sheetParts = splitMonthlyTableByYear(balanceSheet);
        expect(sheetParts[0].columns[0]).toBe("Opening (Jan 2027)");
        expect(sheetParts[1].columns[0]).not.toBe("Opening (Jan 2027)");

        // A table already one plan year comes back unchanged.
        expect(splitMonthlyTableByYear(forecastView(forecast, "monthly", 1).tables[0])).toEqual([forecastView(forecast, "monthly", 1).tables[0]]);
    });

});

/*
    The statements' structure, as the standards lay them out (IFRS for
    SMEs Sections 4, 5 and 7): checked on both examples -- Lumen, a
    company with a loan, a grant and a deposit; Quillfield, an LLC
    whose owner takes drawings and whose cash runs short.
*/
describe("the forecast statements' structure", () => {

    const quill = JSON.parse(quillfieldText) as typeof example;
    const loadQuill = (number: number, id: string) =>
        InterviewSession.fromJSON(quill.systems[String(number)], frameworkRegistry.getFramework(id));
    const quillSessions = {
        ...sessions,
        identity: loadQuill(1, "identity"),
        business: loadQuill(3, "business"),
        organisationName: "Quillfield Automation"
    };
    const examples: [string, typeof sessions][] = [["Lumen", sessions], ["Quillfield", quillSessions]];

    type Row = { label: string; total?: boolean; heading?: boolean; values: number[]; opening?: number };
    /** The rows under each heading, and the total that closes them. */
    const sections = (rows: Row[]) => {
        const found: { title: string; lines: Row[]; total: Row }[] = [];
        rows.forEach((row, index) => {
            if (!row.heading) {
                return;
            }
            const rest = rows.slice(index + 1);
            const end = rest.findIndex(entry => entry.total || entry.heading);
            found.push({ title: row.label, lines: rest.slice(0, end), total: rest[end] });
        });
        return found;
    };
    const added = (rows: Row[], index: number) => rows.reduce((sum, row) => sum + row.values[index], 0);

    test.each(examples)("%s: the cash flow's activities each add up, and together make the net change in cash", (_, which) => {
        const { forecast } = businessForecast(which);
        const rows = forecast.cashFlow.rows;
        const row = (label: string) => rows.find(entry => entry.label === label)!;
        const activities = sections(rows);
        expect(activities[0].title).toBe("Operating activities");
        expect(activities.every(entry => /^(Operating|Investing|Financing) activities$/.test(entry.title))).toBe(true);
        forecast.months.forEach((_month, index) => {
            activities.forEach(activity => expect(activity.total.values[index], activity.title)
                .toBeCloseTo(added(activity.lines, index), 6));
            expect(row("Net change in cash").values[index]).toBeCloseTo(added(activities.map(entry => entry.total), index), 6);
            expect(row("Cash at end of period").values[index])
                .toBeCloseTo(row("Cash at start of period").values[index] + row("Net change in cash").values[index], 6);
        });
        // Money out is negative: the drawings, repayments and equipment.
        rows.filter(entry => /^(Owner's drawings|Loan repayments|Purchase of equipment|Deposits paid|Interest paid)$/.test(entry.label))
            .forEach(entry => entry.values.forEach(amount => expect(amount, entry.label).toBeLessThanOrEqual(0)));
    });

    test("equipment and deposits are investing; capital, loans and drawings financing", () => {
        const lumen = businessForecast(sessions).forecast.cashFlow.rows.map(row => row.label);
        const under = (rows: string[], heading: string, label: string) => {
            const from = rows.indexOf(heading);
            const to = rows.findIndex((entry, index) => index > from && entry.startsWith("Net cash"));
            return rows.indexOf(label) > from && rows.indexOf(label) < to;
        };
        expect(under(lumen, "Investing activities", "Purchase of equipment")).toBe(true);
        expect(under(lumen, "Investing activities", "Deposits paid")).toBe(true);
        expect(under(lumen, "Financing activities", "Loan repayments")).toBe(true);
        expect(under(lumen, "Operating activities", "Grants received")).toBe(true);
        expect(under(lumen, "Operating activities", "Interest paid")).toBe(true);
        const quillCash = businessForecast(quillSessions).forecast.cashFlow.rows;
        expect(under(quillCash.map(row => row.label), "Financing activities", "Owner's drawings")).toBe(true);
        // The $450 video kit and the $60 webcam and headset are investing, not operating payments.
        expect(quillCash.find(row => row.label === "Purchase of equipment")!.values.reduce((a, b) => a + b, 0)).toBeCloseTo(-510, 6);
    });

    test.each(examples)("%s: the balance sheet is classified, its groups add up, and it balances", (_, which) => {
        const { forecast } = businessForecast(which);
        const rows = forecast.balanceSheet.rows;
        const row = (label: string) => rows.find(entry => entry.label === label);
        const groups = sections(rows);
        const total = (label: string) => groups.find(entry => entry.total.label === label)?.total;
        // Every month, and the Opening column (-1).
        const columns = [...forecast.months.map((_month, index) => index), -1];
        const at = (entry: Row | undefined, index: number) => !entry ? 0 : index < 0 ? entry.opening ?? 0 : entry.values[index];
        columns.forEach(index => {
            groups.forEach(group => expect(at(group.total, index), group.title)
                .toBeCloseTo(group.lines.reduce((sum, line) => sum + at(line, index), 0), 6));
            expect(at(row("Total assets"), index))
                .toBeCloseTo(at(total("Total current assets"), index) + at(total("Total non-current assets"), index), 6);
            expect(at(row("Total liabilities"), index))
                .toBeCloseTo(at(total("Total current liabilities"), index) + at(total("Total non-current liabilities"), index), 6);
            expect(at(row("Total liabilities and equity"), index))
                .toBeCloseTo(at(row("Total liabilities"), index) + at(total("Total equity"), index), 6);
            expect(at(row("Total assets"), index)).toBeCloseTo(at(row("Total liabilities and equity"), index), 6);
        });
    });

    test("a loan's next 12 months of repayments are current, the rest non-current", () => {
        const { forecast } = businessForecast(sessions);
        const sheet = (label: string) => forecast.balanceSheet.rows.find(entry => entry.label === label)!;
        const repaid = forecast.cashFlow.rows.find(entry => entry.label === "Loan repayments")!.values.map(amount => -amount);
        // Lumen's £15,000 Start Up Loan runs 60 months: both parts show.
        expect(sheet("Loans: due within 12 months").values[0]).toBeCloseTo(repaid.slice(1, 13).reduce((a, b) => a + b, 0), 6);
        expect(sheet("Loans: due after 12 months").values[0]).toBeGreaterThan(0);
        expect(sheet("Loans: due within 12 months").opening! + sheet("Loans: due after 12 months").opening!).toBeCloseTo(15000, 6);
    });

    test.each(examples)("%s: the profit and loss runs by nature down to profit before tax, then its income tax", (name, which) => {
        const { forecast } = businessForecast(which);
        const rows = forecast.profitAndLoss.rows;
        const row = (label: string) => rows.find(entry => entry.label === label);
        const expenses = sections(rows).find(entry => entry.title === "Operating expenses")!;
        expect(expenses.total.label).toBe("Total operating expenses");
        expect(expenses.lines.some(line => /Establishment|Operating costs|Offering costs/.test(line.label))).toBe(false);
        forecast.months.forEach((_month, index) => {
            expect(expenses.total.values[index]).toBeCloseTo(added(expenses.lines, index), 6);
            expect(row("Operating profit")!.values[index])
                .toBeCloseTo(row("Gross profit")!.values[index] - expenses.total.values[index], 6);
            expect(row("Profit before tax")!.values[index]).toBeCloseTo(row("Operating profit")!.values[index] +
                (row("Other income (grants)")?.values[index] ?? 0) - (row("Finance costs (loan interest)")?.values[index] ?? 0), 6);
        });
        // Lumen (a UK Ltd) at a 19% rate on profit; Quillfield (a single-member LLC) pass-through.
        expect(rows.slice(-2).map(entry => entry.label)).toEqual(["Income tax", "Net profit"]);
        expect(row("Income tax")!.text).toBe(name === "Lumen" ? undefined : "None at business level");
    });

    test("Quillfield: profit, less the owner's drawings, is the profit kept in the business", () => {
        const { forecast } = businessForecast(quillSessions);
        const kept = forecast.profitKept!;
        const line = (label: string) => kept.rows.find(entry => entry.label === label)!.values;
        const profit = forecast.profitAndLoss.rows.find(entry => entry.label === "Profit before tax")!.values;
        forecast.months.forEach((_month, index) => {
            expect(line("Profit for the period (before tax)")[index]).toBeCloseTo(profit[index], 6);
            expect(line("Less: owner's drawings")[index]).toBeCloseTo(-4500, 6);
            expect(line("Profit kept in the business")[index]).toBeCloseTo(profit[index] - 4500, 6);
        });
        // By plan year too, directly below the profit and loss.
        const annual = forecastView(forecast, "annual", 3);
        expect(annual.tables[1].title).toBe("Profit Kept in the Business");
        expect(annual.tables[1].rows.find(entry => entry.label === "Less: owner's drawings")!.values).toEqual([-54000, -54000, -54000]);
    });

    test("the quarterly view: four quarters and the year, adding up to the annual figures", () => {
        const { forecast } = businessForecast(quillSessions);
        const quarterly = forecastView(forecast, "quarterly", 3);
        const annual = forecastView(forecast, "annual", 3);
        expect(quarterly.columns.slice(0, 5)).toEqual(["Q1 (Jan – Mar 2027)", "Q2 (Apr – Jun 2027)", "Q3 (Jul – Sep 2027)", "Q4 (Oct – Dec 2027)", "Year 1"]);
        expect(quarterly.columns).toHaveLength(15);
        const pl = (view: typeof annual) => view.tables[0].rows.find(row => row.label === "Revenue")!.values;
        expect(pl(quarterly)[4]).toBeCloseTo(pl(quarterly).slice(0, 4).reduce((a, b) => a + b, 0), 6);
        expect(pl(quarterly)[9]).toBeCloseTo(pl(annual)[1], 6);
        const sheet = (view: typeof annual) => view.tables.find(table => table.title === "Balance Sheet")!
            .rows.find(row => row.label === "Total assets")!.values;
        // A balance takes the quarter's last month: Q4 is the year's end.
        expect(sheet(quarterly)[4]).toBeCloseTo(sheet(quarterly)[5], 6);
        expect(sheet(quarterly)[5]).toBeCloseTo(sheet(annual)[1], 6);

        // The plan's view: Year 1 by quarter, then by year.
        const plan = forecastView(forecast, "quarterly", 3, { quarterlyYears: 1 });
        expect(plan.columns).toEqual(["Q1 (Jan – Mar 2027)", "Q2 (Apr – Jun 2027)", "Q3 (Jul – Sep 2027)", "Q4 (Oct – Dec 2027)", "Year 1",
            "Year 2 (Jan 2028 – Dec 2028)", "Year 3 (Jan 2029 – Dec 2029)"]);
        expect(plan.tables[0].subtotalColumns).toEqual([4]);
        expect(pl(plan).slice(4)).toEqual(pl(annual));

        // Its document splits by year, like the monthly one.
        const content = businessForecastContent(quillSessions, "quarterly", 2);
        expect(content.sections[0].title).toBe("Profit and Loss Forecast: Year 1");
        expect(content.systemName).toContain("quarterly");
    });

});

describe("the Quillfield example is complete", () => {
    const quill = JSON.parse(quillfieldText) as typeof example;
    const cases: [number, string][] = [[1, "identity"], [2, "brand"], [3, "business"], [4, "strategy"]];
    test.each(cases)("system %i (%s) has nothing missing", (number, id) => {
        const session = InterviewSession.fromJSON(quill.systems[String(number)], frameworkRegistry.getFramework(id));
        const result = new InterviewValidator().validate(session);
        expect(result.valid, JSON.stringify((result as { issues?: unknown }).issues ?? result)).toBe(true);
    });
});

/* The optional answers: shown where given, "not covered" where not. */
import { AnswerType } from "../enums/AnswerType.ts";
import { buildExportContent } from "./ExportContentBuilder.ts";

describe("the optional answers in the documents", () => {

    const quill = JSON.parse(quillfieldText) as typeof example;
    /** Quillfield, freshly loaded, with one page's answer changed. */
    const withAnswer = (number: number, id: string, type: AnswerType, change: (value: Record<string, unknown>) => Record<string, unknown>) => {
        const session = InterviewSession.fromJSON(quill.systems[String(number)], frameworkRegistry.getFramework(id));
        const section = session.getFramework().sections.find(candidate => candidate.answer?.type === type)!;
        session.saveResponse(section.number, change(session.getResponse(section.number) as Record<string, unknown>));
        return session;
    };
    const loadQuill = (number: number, id: string) =>
        InterviewSession.fromJSON(quill.systems[String(number)], frameworkRegistry.getFramework(id));
    const base = () => ({
        identity: loadQuill(1, "identity"),
        brand: loadQuill(2, "brand"),
        business: loadQuill(3, "business"),
        strategy: loadQuill(4, "strategy"),
        organisationName: "Quillfield Automation"
    });
    const planOf = (all: ReturnType<typeof base>) =>
        new MarkdownExporter().toMarkdown(all.business, "Foundation", businessPlan(all));
    const partOf = (md: string, title: string) => {
        const from = md.indexOf(title);
        const next = md.slice(from + 1).search(/^## [0-9]+\. /m);
        return md.slice(from, next < 0 ? undefined : from + 1 + next);
    };

    const withoutProfile = () => withAnswer(1, "identity", AnswerType.FoundersProfile, () => ({ founders: [], teamGaps: "" }));

    /* A Legal Entity saved before the Founders Profile existed: its
       row carries the roles and a bio, and there is no page 4 answer. */
    const legacyIdentity = () => {
        const session = withAnswer(1, "identity", AnswerType.LegalEntity, value => ({
            ...value,
            founders: (value.founders as Record<string, unknown>[]).map(founder => ({
                ...founder,
                roles: ["Principal Consultant"],
                experience: "Eight years building workflow automation for accounting firms."
            }))
        }));
        const section = session.getFramework().sections.find(candidate => candidate.answer?.type === AnswerType.FoundersProfile)!;
        session.saveResponse(section.number, undefined);
        return session;
    };

    test("the founders' profiles replace the \"not covered\" lines under Management", () => {
        const plain = partOf(planOf({ ...base(), identity: withoutProfile() }), "## 7. Management and Organization");
        expect(plain).toContain("### Experience and CVs\n\nNot covered by the Foundation answers.");
        expect(plain).toContain("### Capability Gaps and Cover\n\nNot covered by the Foundation answers.");
        expect(plain).not.toContain("### Founder Profiles");

        const given = partOf(planOf(base()), "## 7. Management and Organization");
        expect(given).not.toContain("Not covered by the Foundation answers.");
        expect(given).toContain("| Founder | Ownership | Capital | Roles | Commitment | Pay |");
        expect(given).toContain("| Founder & Automation Consultant, Solutions Architect | Full-time (about 37 hours a week) |");
        expect(given).toContain("Founder & Automation Consultant, Solutions Architect");
        expect(given).toContain("### Founder Profiles\n\n#### Jordan Ellis");
        expect(given).not.toContain("Years in the industry");
        expect(given).toContain("**Relevant industry experience:** Nine years in IT and automation");
        expect(given).toContain("**Management experience:** Led a team of four implementation consultants");
        expect(given).toContain("**Key achievements:** \n\n- Designed an invoice-intake automation");
        // By type, in the page's order, each after its type.
        expect(given).toContain("**Skills, expertise and qualifications:** \n\n" +
            "- Skill: Python and API integration\n" +
            "- Professional / Technical Expertise: Workflow mapping and process design\n" +
            "- Professional / Technical Expertise: Data security and access control for client records\n" +
            "- Degree / Qualification: BS in Information Systems\n" +
            "- Certification: Certified in Microsoft Power Platform and Zapier\n");
        expect(given).toContain("### Capability Gaps and Cover\n\nAs a one-person LLC");
    });

    test("every achievement reaches the plan, and untyped skills come last, as written", () => {
        const identity = withAnswer(1, "identity", AnswerType.FoundersProfile, value => ({
            ...value,
            founders: (value.founders as Record<string, unknown>[]).map(founder => ({
                ...founder,
                achievements: ["One", "Two", "Three", "Four", "Five"],
                skills: ["Saved before types", { type: "licence", text: "NY notary" }, { type: "skill", text: "Negotiation" }]
            }))
        }));
        const team = partOf(planOf({ ...base(), identity }), "## 7. Management and Organization");
        expect(team).toContain("**Key achievements:** \n\n- One\n- Two\n- Three\n- Four\n- Five");
        expect(team).toContain("**Skills, expertise and qualifications:** \n\n- Skill: Negotiation\n- Licence: NY notary\n- Saved before types");
    });

    test("a Legal Entity's roles and experience saved before the Founders Profile reach the plan unopened", () => {
        const md = planOf({ ...base(), identity: legacyIdentity() });
        const team = partOf(md, "## 7. Management and Organization");
        expect(team).toContain("Principal Consultant");
        expect(team).toContain("**Relevant industry experience:** Eight years building workflow automation for accounting firms.");
        // And under the canvas's Key Resources.
        const all = { ...base(), identity: legacyIdentity() };
        expect(new MarkdownExporter().toMarkdown(all.business, "Foundation", businessModelCanvas(all)))
            .toContain("Human: Jordan Ellis (Principal Consultant)");
    });

    test("the Identity System's export: the Legal Entity's owners, then each founder's profile", () => {
        const identity = loadQuill(1, "identity");
        const md = new MarkdownExporter().toMarkdown(identity, "Foundation", buildExportContent(identity, "Foundation"));
        const legal = md.slice(md.indexOf("## 3. Legal Entity"), md.indexOf("## 4. Founders Profile"));
        expect(legal).toContain("| Founder | Ownership | Capital |\n");
        expect(legal).not.toContain("Roles");
        expect(legal).not.toContain("Experience & Skills");

        const profile = md.slice(md.indexOf("## 4. Founders Profile"));
        expect(profile).toContain("### Founders\n\n#### Jordan Ellis");
        expect(profile).toContain("**Roles:** Founder & Automation Consultant, Solutions Architect");
        expect(profile).not.toContain("Years in the Industry");
        expect(profile).toContain("**Relevant Industry Experience:** Nine years in IT and automation");
        expect(profile).toContain("**Management Experience:** Led a team of four");
        expect(profile).toContain("**Key Achievements:** \n\n- Designed an invoice-intake automation");
        expect(profile).toContain("**Skills, Expertise & Qualifications:** \n\n- Skill: Python and API integration\n");
        expect(profile).toContain("- Certification: Certified in Microsoft Power Platform and Zapier");
        expect(profile).toContain("### Capability Gaps & Cover\n\nAs a one-person LLC");

        const legacy = legacyIdentity();
        expect(new MarkdownExporter().toMarkdown(legacy, "Foundation", buildExportContent(legacy, "Foundation")))
            .toContain("**Relevant Industry Experience:** Eight years building workflow automation for accounting firms.");
    });

});

describe("the industry outlook in the documents", () => {

    const quill = JSON.parse(quillfieldText) as typeof example;
    const loadQuill = (number: number, id: string) =>
        InterviewSession.fromJSON(quill.systems[String(number)], frameworkRegistry.getFramework(id));
    const withOutlook = (outlook: string) => {
        const session = loadQuill(3, "business");
        const section = session.getFramework().sections.find(candidate => candidate.answer?.type === AnswerType.BusinessFoundation)!;
        const value = session.getResponse(section.number) as { segments: { description: Record<string, string> }[] };
        session.saveResponse(section.number, {
            ...value,
            segments: value.segments.map((segment, index) => index === 0
                ? { ...segment, description: { ...segment.description, "market-size": outlook } }
                : segment)
        });
        return session;
    };
    const all = (business: InterviewSession) => ({
        identity: loadQuill(1, "identity"),
        brand: loadQuill(2, "brand"),
        business,
        strategy: loadQuill(4, "strategy"),
        organisationName: "Quillfield Automation"
    });
    const market = (business: InterviewSession) => {
        const md = new MarkdownExporter().toMarkdown(business, "Foundation", businessPlan(all(business)));
        return md.slice(md.indexOf("## 3. Market Analysis"), md.indexOf("## 4. Products and Services"));
    };
    const trend = "AI tools are moving into everyday office software, and firms now expect them.";

    test("the plan's Market Analysis gives each segment's market size and outlook, or says it is not covered", () => {
        expect(market(withOutlook(""))).toContain("### Market Size and Industry Outlook\n\nNot covered by the Foundation answers.");
        const given = market(withOutlook(trend));
        expect(given).not.toContain("Not covered by the Foundation answers.");
        expect(given).toContain("**Market size and outlook:** " + trend);
    });

    test("the Business System's export carries it", () => {
        const business = withOutlook(trend);
        const md = new MarkdownExporter().toMarkdown(business, "Foundation", buildExportContent(business, "Foundation"));
        expect(md).toContain("Market Size & Industry Outlook: " + trend);
    });

});

/* Income tax: not chosen yet, none at business level, or a rate on profit. */
import { asFinancialFoundationValue, financialFoundationSectionsEmpty } from "./FinancialModel.ts";

describe("income tax in the forecast", () => {

    const quill = JSON.parse(quillfieldText) as typeof example;
    const loadQuill = (number: number, id: string) =>
        InterviewSession.fromJSON(quill.systems[String(number)], frameworkRegistry.getFramework(id));
    /** An example's sessions with the Financial Foundation's income tax set. */
    const taxed = (which: "Lumen" | "Quillfield", incomeTax: string, incomeTaxRate = "") => {
        const business = which === "Lumen"
            ? InterviewSession.fromJSON(example.systems["3"], frameworkRegistry.getFramework("business"))
            : loadQuill(3, "business");
        const section = business.getFramework().sections.find(candidate => candidate.answer?.type === AnswerType.FinancialFoundation)!;
        business.saveResponse(section.number, { ...(business.getResponse(section.number) as object), incomeTax, incomeTaxRate });
        return which === "Lumen"
            ? { ...sessions, business }
            : { ...sessions, identity: loadQuill(1, "identity"), business, organisationName: "Quillfield Automation" };
    };
    type Row = { label: string; values: number[]; text?: string; opening?: number };
    const rowOf = (rows: Row[], label: string) => rows.find(entry => entry.label === label);
    const yearTotals = (values: number[]) =>
        Array.from({ length: Math.ceil(values.length / 12) }, (_, year) =>
            values.slice(year * 12, year * 12 + 12).reduce((a, b) => a + b, 0));
    const added = (values: number[]) => values.reduce((a, b) => a + b, 0);

    test("saved answers without it load as not chosen, and the page asks for it", () => {
        const value = asFinancialFoundationValue({ planYears: "3" });
        expect(value.incomeTax).toBe("");
        expect(value.incomeTaxRate).toBe("");
        expect(asFinancialFoundationValue({ incomeTax: "bogus" }).incomeTax).toBe("");
        const section = sessions.business.getFramework().sections.find(candidate => candidate.answer?.type === AnswerType.FinancialFoundation)!;
        const saved = sessions.business.getResponse(section.number) as object;
        expect(financialFoundationSectionsEmpty({ ...saved, incomeTax: "pass-through" })[0]).toBe(false);
        expect(financialFoundationSectionsEmpty({ ...saved, incomeTax: "" })[0]).toBe(true);
        expect(financialFoundationSectionsEmpty({ ...saved, incomeTax: "rate", incomeTaxRate: "" })[0]).toBe(true);
        expect(financialFoundationSectionsEmpty({ ...saved, incomeTax: "rate", incomeTaxRate: "19" })[0]).toBe(false);
    });

    test("not chosen yet: the statements stay before tax, and say so", () => {
        const { forecast } = businessForecast(taxed("Lumen", ""));
        expect(rowOf(forecast.profitAndLoss.rows, "Income tax")).toMatchObject({ text: "Not chosen yet" });
        expect(forecast.notes.join(" ")).toContain("Income tax is not included: no income tax basis has been chosen on Financial Foundation.");
        expect(forecast.notes.join(" ")).not.toMatch(/income tax[^.]*not estimated/i);
    });

    test("not chosen yet: the statements are as they were before income tax was asked", () => {
        // Lumen's answers as saved before the question existed: no incomeTax keys at all.
        const legacy = taxed("Lumen", "");
        const section = legacy.business.getFramework().sections.find(candidate => candidate.answer?.type === AnswerType.FinancialFoundation)!;
        const { incomeTax: _tax, incomeTaxRate: _rate, ...saved } = legacy.business.getResponse(section.number) as Record<string, unknown>;
        legacy.business.saveResponse(section.number, saved);
        const before = businessForecast(legacy).forecast;
        const after = businessForecast(taxed("Lumen", "")).forecast;
        expect(after.profitAndLoss).toEqual(before.profitAndLoss);
        expect(after.balanceSheet).toEqual(before.balanceSheet);
        expect(after.cashFlow).toEqual(before.cashFlow);
        expect(after.notes).toEqual(before.notes);
    });

    test("pass-through: no tax at business level, net profit is the profit before tax", () => {
        const { forecast } = businessForecast(taxed("Quillfield", "pass-through"));
        const rows = forecast.profitAndLoss.rows;
        expect(rowOf(rows, "Income tax")).toMatchObject({ text: "None at business level" });
        expect(rowOf(rows, "Net profit")!.values).toEqual(rowOf(rows, "Profit before tax")!.values);
        expect(rowOf(forecast.balanceSheet.rows, "Income tax payable")).toBeUndefined();
        expect(forecast.notes.join(" ")).toContain("pass-through");
    });

    test.each(["Lumen", "Quillfield"] as const)("%s at 25 percent: tax on each year's profit, accrued, and paid the next year", (which) => {
        const { forecast } = businessForecast(taxed(which, "rate", "25"));
        const pl = forecast.profitAndLoss.rows;
        const before = rowOf(pl, "Profit before tax")!.values;
        const tax = rowOf(pl, "Income tax")!.values;
        const net = rowOf(pl, "Net profit")!.values;
        expect(rowOf(pl, "Income tax")!.text).toBeUndefined();

        // Per plan year: max(0, profit before tax) x 25%, no loss carried forward.
        const expected = yearTotals(before).map(amount => Math.max(0, amount) * 0.25);
        yearTotals(tax).forEach((amount, year) => expect(amount).toBeCloseTo(expected[year], 6));
        expect(expected.some(amount => amount > 0), "a year with profit to tax").toBe(true);
        // Accrued on the year-to-date profit: none while the year is still at a loss.
        let toDate = 0;
        let taxToDate = 0;
        tax.forEach((amount, month) => {
            if (month % 12 === 0) {
                toDate = 0;
                taxToDate = 0;
            }
            toDate += before[month];
            taxToDate += amount;
            expect(taxToDate).toBeCloseTo(Math.max(0, toDate) * 0.25, 6);
            expect(net[month]).toBeCloseTo(before[month] - amount, 6);
        });

        // Paid in cash in the first month of the next plan year; the last year's is still owed.
        const paid = rowOf(forecast.cashFlow.rows, "Income tax paid")?.values ?? forecast.months.map(() => 0);
        const payable = rowOf(forecast.balanceSheet.rows, "Income tax payable")!.values;
        paid.forEach((amount, month) => {
            const due = month % 12 === 0 && month > 0 ? expected[month / 12 - 1] : 0;
            expect(amount).toBeCloseTo(-due, 6);
        });
        expected.forEach((amount, year) => expect(payable[year * 12 + 11]).toBeCloseTo(amount, 6));

        // The balance sheet still balances.
        const sheet = (label: string) => rowOf(forecast.balanceSheet.rows, label)!;
        forecast.months.forEach((_month, index) =>
            expect(sheet("Total assets").values[index]).toBeCloseTo(sheet("Total liabilities and equity").values[index], 6));
        expect(sheet("Total assets").opening).toBeCloseTo(sheet("Total liabilities and equity").opening!, 6);

        // The cash flow still reconciles: activities add up, and cash rolls forward.
        const cash = forecast.cashFlow.rows;
        const change = rowOf(cash, "Net change in cash")!.values;
        const totals = cash.filter(entry => /^Net cash/.test(entry.label));
        forecast.months.forEach((_month, index) => {
            expect(change[index]).toBeCloseTo(totals.reduce((sum, entry) => sum + entry.values[index], 0), 6);
            expect(rowOf(cash, "Cash at end of period")!.values[index])
                .toBeCloseTo(rowOf(cash, "Cash at start of period")!.values[index] + change[index], 6);
        });
        const untaxed = businessForecast(taxed(which, "")).forecast.cashFlow.rows;
        expect(added(rowOf(cash, "Net cash from operating activities")!.values))
            .toBeCloseTo(added(rowOf(untaxed, "Net cash from operating activities")!.values) + added(paid), 6);

        // What is kept in the business is after tax.
        if (forecast.profitKept) {
            expect(rowOf(forecast.profitKept.rows, "Profit for the period (after tax)")!.values).toEqual(net);
        }

        const notes = forecast.notes.join(" ");
        expect(notes).toContain("25%");
        expect(notes).toContain("no loss carried forward");
        expect(notes).toContain("paid in the first month of the following plan year");
        expect(notes).toContain("before income tax");
    });

    test("the Business System export says which basis is used", () => {
        const all = taxed("Quillfield", "rate", "21");
        const md = new MarkdownExporter().toMarkdown(all.business, "Foundation", buildExportContent(all.business, "Foundation"));
        expect(md).toContain("Income tax is estimated at 21% of each plan year's profit.");
        const through = taxed("Quillfield", "pass-through");
        expect(new MarkdownExporter().toMarkdown(through.business, "Foundation", buildExportContent(through.business, "Foundation")))
            .toContain("No income tax at business level (pass-through).");
    });

});
