import { describe, expect, test } from "vitest";
import { InterviewSession } from "../interview";
import { businessForecast, businessModelCanvas, businessModelCanvasData, businessPlan, businessPlanForExport, financialPlan, fundingRequest } from "./BusinessDocuments.ts";
import { forecastCsv, forecastView } from "./financial/FinancialForecast.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { MarkdownExporter } from "./export/MarkdownExporter.ts";
import exampleText from "../../data/examples/lumen-and-loom-studio.json?raw";
import quillfieldText from "../../data/examples/quillfield-automation-llc.json?raw";
import { InterviewValidator } from "./InterviewValidator.ts";
import { AnswerType } from "../enums/AnswerType.ts";
import { buildExportContent } from "./export/ExportContentBuilder.ts";

/** The Business Plan as it exports: with the Financial Documents as its appendix (Questions 20, section 14; owner, 2026-11-20 20:47 UTC+2). */

const planExport = (sessions: Parameters<typeof businessPlan>[0]) => businessPlanForExport(businessPlan(sessions), [fundingRequest(sessions), financialPlan(sessions)]);

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
        expect(data.blocks.segments[0]).toContain("London Homemakers");
        expect(data.blocks.partners.join(" ")).toContain("Accountant");
        // Every bracket closed: "Name (Category)".
        data.blocks.activities.forEach(entry => expect(entry.split("(").length).toBe(entry.split(")").length));
        const md = markdown(businessModelCanvas(sessions));
        expect(md).toContain("# Business Model Canvas: Lumen & Loom Studio Ltd");
        expect(md).not.toContain("Not answered yet");
    });

    test("the plan has every section, answered", () => {
        const md = markdown(planExport(sessions));
        for (const title of ["Executive Summary", "Company Description", "Market Analysis", "Products and Services",
            "Marketing and Sales", "Operations", "Management and Organisation", "Financial Plan", "Funding Request",
            "Financial Projections", "Strategy and Milestones", "Risks", "Appendix"]) {
            expect(md).toContain(title);
        }
        expect(md).not.toContain("Not answered yet");
        expect(md).toContain("# Business Plan: Lumen & Loom Studio Ltd");
        // Sustainability numbers on from Financial Foundation's three headings (its costs are in the Appendix).
        expect(md).toContain("### 4. Revenue");
        expect(md).toContain("Lumen & Loom Studio Ltd, a private company limited by shares, based in London, United Kingdom, was founded by");
        expect(md).toContain("is seeking £26,000 of additional funding towards a funding gap of £23,724");
    });

    test("the financial forecast adds up, month by month and by year", () => {
        const { forecast, years } = businessForecast(sessions);
        expect(years).toBe(3);
        expect(forecast.months).toHaveLength(36);
        expect(forecast.months[0]).toBe("Mar 2026");

        const row = (label: string) => forecast.cashFlow.rows.find(entry => entry.label === label)!;
        const closing = row("Cash at end of period").values;
        // Each month opens where the last one closed.
        row("Cash at start of period").values.slice(1).forEach((amount, index) => expect(amount).toBeCloseTo(closing[index], 6));

        const annual = forecastView(forecast, "annual", 2);
        expect(annual.columns).toEqual(["Year 1 (Mar 2026 – Feb 2027)", "Year 2 (Mar 2027 – Feb 2028)"]);
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
        // The plan starts in Mar 2026 (the first registration fee); the looms and furniture are bought in Oct 2026, when the studio opens.
        const opens = forecast.months.indexOf("Oct 2026");
        expect(opens).toBe(7);
        expect(sheet("Equipment (net of depreciation)")[opens - 1]).toBe(0);
        expect(sheet("Equipment (net of depreciation)")[opens]).toBeGreaterThan(8000);
        expect(forecast.profitAndLoss.rows.some(entry => entry.label === "Other income (grants)")).toBe(true);

        const csv = forecastCsv(forecastView(forecast, "monthly", 1), { organization: "Lumen & Loom", currency: "GBP", notes: forecast.notes });
        const lines = csv.slice(1).split(String.fromCharCode(13, 10));
        expect(lines[0]).toBe("Lumen & Loom: Financial Forecast");
        // Twelve months and the year's subtotal.
        expect(lines[3].split(",")).toHaveLength(14);
        expect(lines[3].split(",")[13]).toBe("Year 1");
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
        new MarkdownExporter().toMarkdown(all.business, "Foundation", planExport(all));
    const partOf = (md: string, title: string) => {
        const from = md.indexOf(title);
        const next = md.slice(from + 1).search(/^## [0-9]+\. /m);
        return md.slice(from, next < 0 ? undefined : from + 1 + next);
    };

    const withoutProfile = () => withAnswer(1, "identity", AnswerType.FoundersProfile, () => ({ founders: [] }));

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
        const plain = partOf(planOf({ ...base(), identity: withoutProfile() }), "## 7. Management and Organisation");
        expect(plain).toContain("### Experience and CVs\n\nNot covered by the Foundation answers.");
        expect(plain).not.toContain("Capability Gaps");
        expect(plain).not.toContain("### Founder Profiles");

        const given = partOf(planOf(base()), "## 7. Management and Organisation");
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
        // Skills and Cover: Capacity & Delivery's LC1, each skill with who covers it (the Team of its activities), then the Notes.
        expect(given).not.toContain("Capability Gaps");
        expect(given).toContain("### Skills and Cover\n\n- Bookkeeping & tax: covered by ");
        expect(given).toContain("- Selling: covered by Jordan Ellis\n");
        expect(given).toContain("- Marketing & social media: covered by Jordan Ellis\n");
        expect(given).toContain("- Cover for holidays or illness: covered by ");
        expect(given).toContain("Brooklyn CPA practice");
    });

    test("Skills and Cover: a skill whose activities have no one on their Team is not covered yet; none at all is not covered", () => {
        const noMarketing = withAnswer(3, "business", AnswerType.BusinessCapability, value => ({
            ...value,
            skillsNeeded: ["marketing"],
            offering: { ...(value.offering as Record<string, unknown>), activities: ((value.offering as { activities: { category: string }[] }).activities).filter(activity => activity.category !== "marketing") }
        }));
        expect(partOf(planOf({ ...base(), business: noMarketing }), "## 7. Management and Organisation")).toContain("- Marketing & social media: not covered yet\n");

        const none = withAnswer(3, "business", AnswerType.BusinessCapability, value => ({ ...value, skillsNeeded: [], skillsOther: [], skillsNotes: "" }));
        expect(partOf(planOf({ ...base(), business: none }), "## 7. Management and Organisation")).toContain("### Skills and Cover\n\nNot covered by the Foundation answers.");
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
        const team = partOf(planOf({ ...base(), identity }), "## 7. Management and Organisation");
        expect(team).toContain("**Key achievements:** \n\n- One\n- Two\n- Three\n- Four\n- Five");
        expect(team).toContain("**Skills, expertise and qualifications:** \n\n- Skill: Negotiation\n- Licence: NY notary\n- Saved before types");
    });

    test("a Legal Entity's roles and experience saved before the Founders Profile reach the plan unopened", () => {
        const md = planOf({ ...base(), identity: legacyIdentity() });
        const team = partOf(md, "## 7. Management and Organisation");
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
        // (Quillfield records its founder's capital since 2026-11-21: review item 4, the owner's 22:56 UTC+2 "Fix them all".)
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
        // (Gaps and Cover are asked on Capacity & Delivery, and exported with the Business System.)
        expect(profile).not.toContain("Capability Gaps");
        const business = loadQuill(3, "business");
        const capability = new MarkdownExporter().toMarkdown(business, "Foundation", buildExportContent(business, "Foundation"));
        expect(capability).toContain("Skills and Cover\n\n- Bookkeeping & tax: covered by ");
        expect(capability).toContain("- Cover for holidays or illness: covered by ");
        expect(capability).toContain("Brooklyn CPA practice");

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
        const marketIds = ["trajectory", "tam", "trends", "competition"];
        const session = loadQuill(3, "business");
        const section = session.getFramework().sections.find(candidate => candidate.answer?.type === AnswerType.BusinessFoundation)!;
        const value = session.getResponse(section.number) as { segments: { questions: Record<string, string[]> }[] };
        session.saveResponse(section.number, {
            ...value,
            segments: value.segments.map((segment, index) => index === 0
                ? { ...segment, questions: { ...Object.fromEntries(Object.entries(segment.questions).filter(([id]) => !marketIds.includes(id))), ...(outlook ? { trajectory: [outlook] } : {}) } }
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
        const md = new MarkdownExporter().toMarkdown(business, "Foundation", planExport(all(business)));
        return md.slice(md.indexOf("## 3. Market Analysis"), md.indexOf("## 4. Products and Services"));
    };
    // A rating since 2026-11-04 (Questions 12): the documents print its point and, at an end, its words.
    const trend = "5";

    test("the plan's Market Analysis gives each segment's market size and outlook, or says it is not covered", () => {
        expect(market(withOutlook(""))).toContain("### Market Size and Industry Outlook\n\nNot covered by the Foundation answers.");
        const given = market(withOutlook(trend));
        expect(given).not.toContain("Not covered by the Foundation answers.");
        expect(given).toContain("Is your market growing or shrinking?: 5 of 5 (Booming)");
    });

    test("the Business System's export carries it", () => {
        const business = withOutlook(trend);
        const md = new MarkdownExporter().toMarkdown(business, "Foundation", buildExportContent(business, "Foundation"));
        expect(md).toContain("Is your market growing or shrinking?: 5 of 5 (Booming)");
    });

});
