import { describe, expect, test, vi } from "vitest";

import { InterviewSession } from "../interview";
import { asBusinessCapabilityValue, asLegalEntityValue } from "./AnswerUtils.ts";
import { founderMonthlySalary } from "./DemandCapacity.ts";
import { businessForecast, businessPlan } from "./BusinessDocuments.ts";
import { buildExportContent } from "./ExportContentBuilder.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { MarkdownExporter } from "./MarkdownExporter.ts";
import lumenText from "../../data/examples/lumen-and-loom-studio.json?raw";
import quillText from "../../data/examples/quillfield-automation-llc.json?raw";
import goldenText from "./founder-period-golden.json?raw";
import engagementText from "./founder-period-engagement.json?raw";

/*
    A FOUNDER'S ONE FREQUENCY, MIGRATED WITHOUT CHANGING A RESULT.

    A founder's salary was always a month's, and the hours a week's or
    a month's. Now one Frequency (week, month or year) is the period of
    both; an answer saved before is migrated on load -- a week's hours
    turn the monthly salary into a week's -- so that every figure
    calculated from it stays as it was.

    The proof: what the two examples, and the first with its founders'
    hours given a week, calculated BEFORE the change (the forecast to
    the cent, the Business Plan and the Business System's export, both
    of which carry the capacity, sustainability and founders' pay) was
    written down once, from the code as it was (founder-period-
    golden.json, beside this file: the founders' table in full, the
    rest as digests); the same saved answers, loaded and
    migrated now, must calculate exactly that.

    ONE DOCUMENTED EXCEPTION, the weekly fixture: its salary, turned
    into a week's, is kept to the cent (415.38, not 415.3846...), as
    every amount is. Converted back to a month that is at most half a
    cent a week off -- about 2.2 cents a month a founder -- so its
    figures are compared word for word with every number within that:
    2.2 cents x 3 founders x 60 months, under 4 (a cumulative balance
    carries it every month; a figure shown in whole pounds can move by
    1 across a rounding boundary). For it the golden file holds the
    documents' words (numbers blanked, as a digest) and their numbers.
*/

type Example = { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };

/*
    The examples' Customer Engagement page as it was when the golden
    file was written (founder-period-engagement.json): the examples'
    channels have grown since (shared actions, channel resources), which
    changes the documents' words but no figure -- and this test is about
    the founders' figures, so it keeps the page it was written against.

    The Business Plan's digests (and the weekly fixture's plan words)
    were written again, deliberately, when a Metric's "Custom" unit was
    retired: only the Strategy table's Metric rows changed ("36000 £" is
    "£36,000"; "40 hours per build" is "40"), every number as it was.
    Quillfield's again when the address became one box of lines: the
    Company Description's address reads its lines, then the state and
    the country ("Brooklyn, 11201, New York" for "Brooklyn, New York
    11201"), every number as it was. And all three when a typeface's
    "Purpose" became "Usage" (the Typography table's head), every number
    as it was. And again when an Objective's "Owner" became "Responsible" (the
    Objectives and KPI tables' heads), every number as it was. And the
    forecast, plan and export digests (and the weekly fixture's words and
    numbers) once more when the examples' channel resources were moved
    from Infrastructure to Offering's Capability: the founders' table and
    every total (gross, operating and net profit, break even) are as they
    were; only the costs' rows moved (Software and digital services to
    Delivery tools and supplies, and Marketing and sales) and the documents'
    lists of resources by place. And once more when the examples’ channel
    resources were made real: only a cost that exists because of its channel
    (a plan, payment fees, a stall, a courier, a booking tool) stays a
    channel resource, and the tools the work needs anyway (Adobe Creative
    Cloud, Xero, QuickBooks, Google Workspace, Miro and Loom) are Infrastructure
    software; a few real costs were added (a workshop booking app, a card
    reader, the trade fair stand, meetup and LinkedIn costs). The founders’ tables
    are unchanged to the character; the forecast, plan and export digests (and
    the weekly fixture’s words and numbers) were written again from the code
    as it is, with the costs’ rows and totals moved by those cards alone.

    Lumen's Business Plan and export digests (and the weekly fixture's words and numbers)
    were written again for two reasons, no figure changed (the forecast and
    export digests, and every total, are as they were): (1) the Workspace's
    Deposit is a field of the Workspace now, so the £3,750 "Rent deposit (3
    months)" typed on the Financial Foundation became a gathered "Workspace
    deposit" line (same amount, one-time, Establishment, Deposit: only its name
    and its place in the lists moved), and (2) a possible duplicate is warned
    of only for a same-source, same-price, same-frequency, similar-name pair,
    so the Financial Signals no longer carry the old "same leading word" warning.

    The plan and export digests (and the weekly fixture's words and numbers) were written again for these reasons, the founders' tables and revenue as they
    were: (1) a resource's status "Provided" and "Partners" became one, "Partners & Suppliers", so the status words of the documents changed; (2) a card
    that lacks a required answer is counted nowhere (CardCompleteness.ts), which left Quillfield's cost-less "Insurance Professional" out of the lists; and (3)
    the examples' partners and providers were completed (Lumen & Loom: the Accountant's 300 one-time onboarding fee, the Maker Yard's 180 a month service
    charge, two courier resources for DPD Local and Royal Mail, the Lawyer and the weaving tutor linked to activities, "Insurance Professional" removed;
    Quillfield: "Insurance Professional" removed, the web designer and the freelance developer linked to activities), so Lumen & Loom's costs are 300
    one-time and 180 a month higher (its funding gap 17,614 to 20,434, its Total Funding Need 53,344 to 56,164); Quillfield's figures are as they were.

    All three digests of both examples (and the weekly fixture's words and
    numbers) were written again when the costs typed on the Financial
    Foundation were moved to the cards of the earlier sections (the Costs
    section is a generated table now, nothing is typed there). The founders'
    tables, revenue and every cash figure are as they were. Only these moved:
    Lumen's studio fit-out (1,200 one-time) is a Workstation resource, which
    the model counts as equipment, so it is an asset depreciated over three
    years (Premises' first month 2,450 to 1,250, Depreciation 263.89 to 297.22 a
    month) instead of a first-month expense, and its tax follows; Quillfield's
    1,500 copywriting and web design is a Partner now, so it reads under
    Professional fees, not Marketing and sales (the total is the same), and
    its video kit is listed among the Physical resources of the canvas.

    Lumen's forecast, plan and export digests (and the weekly fixture's plan and export words and numbers) were written again when the example was made to
    follow the app's rules: (1) the Accountant was counted twice (a 150 a month "Accountant" expense of the Legal Entity AND the Accountant partner's 300
    one-time fee): the Legal Entity expense is removed and the Accountant partner is the one place, 150 a month, so Total Funding Need 56,164 to 55,864 and the
    funding gap 20,434 to 20,134 (the one-time 300 is gone, the 150 a month stays); (2) the courier cards come from the Customer Engagement page: the channels'
    Channel Resources are the two cards "Parcel delivery to customers" and "Tracked postage for small orders" (status Partners & Suppliers, DPD Local and Royal
    Mail as their Providers), not the providers themselves, and each is linked to its own channel's Offering only. The founders' tables, the revenue and the
    Quillfield digests are as they were.

    J1: all three digests (and the weekly fixture's words and numbers) were written again when both examples were rebuilt in the current structure: every card in its
    category and group, dated, linked to its Offerings, with the suppliers, activities and Opening Date (and the card dates now place a cost in its month of
    the cash flow). The founders' tables differ only in the Responsibilities (the activities moved between groups); the founders' pay, hours and the revenue
    are as they were.

    K0: the digests (and the weekly fixture's words) were written again when "Partners and Providers" became "Partners and Suppliers" in the
    documents (the same length, other letters).
*/
const ENGAGEMENT = JSON.parse(engagementText) as Record<string, unknown>;

function asAtGolden(example: Example, name: string): Example {
    const copy = JSON.parse(JSON.stringify(example)) as Example;
    const responses = (copy.systems["3"] as unknown as { responses: { sectionNumber: number; value: unknown }[] }).responses;
    const page = responses.find(response => response.sectionNumber === 2);
    if (page) {
        page.value = ENGAGEMENT[name];
    }
    return copy;
}

const lumen = asAtGolden(JSON.parse(lumenText) as Example, "lumen");
const quill = asAtGolden(JSON.parse(quillText) as Example, "quillfield");

/** Lumen & Loom with every founder's hours given a week, as saved before the change. */
function weekly(example: Example): Example {
    const copy = JSON.parse(JSON.stringify(example)) as Example;
    const business = copy.systems["3"] as unknown as { responses: { value: { founders?: Record<string, unknown>[] } }[] };
    for (const response of business.responses) {
        for (const founder of response.value?.founders ?? []) {
            founder.hoursPeriod = "week";
            founder.hours = "37.5";
            founder.deliveryHours = "26";
        }
    }
    return copy;
}

const FIXTURES: Record<string, Example> = { lumen, quillfield: quill, "lumen-weekly": weekly(lumen) };

const cents = (value: number) => Math.round(value * 100) / 100;

/** A 53-bit digest of a text (cyrb53), as hex: equal texts, equal digests. */
function digest(text: string): string {
    let one = 0xdeadbeef;
    let two = 0x41c6ce57;
    for (let index = 0; index < text.length; index++) {
        const code = text.charCodeAt(index);
        one = Math.imul(one ^ code, 2654435761);
        two = Math.imul(two ^ code, 1597334677);
    }
    one = Math.imul(one ^ (one >>> 16), 2246822507) ^ Math.imul(two ^ (two >>> 13), 3266489909);
    two = Math.imul(two ^ (two >>> 16), 2246822507) ^ Math.imul(one ^ (one >>> 13), 3266489909);
    return (4294967296 * (2097151 & two) + (one >>> 0)).toString(16) + ":" + text.length;
}

function outputs(example: Example) {
    const load = (number: number, id: string) =>
        InterviewSession.fromJSON(example.systems[String(number)] ?? { responses: [] } as never, frameworkRegistry.getFramework(id));
    const sessions = {
        identity: load(1, "identity"),
        brand: load(2, "brand"),
        business: load(3, "business"),
        strategy: load(4, "strategy"),
        organisationName: "Example"
    };
    const { forecast } = businessForecast(sessions);
    const tables: Record<string, string[]> = Object.fromEntries(Object.entries(forecast)
        .filter(([, table]) => table && typeof table === "object" && Array.isArray((table as { rows?: unknown }).rows))
        .map(([name, table]) => [name, (table as { rows: { label: string; values: number[] }[] }).rows
            .map(row => row.label + ": " + row.values.map(cents).join(" "))]));
    const legalSection = sessions.identity.getFramework().sections.find(section => section.title === "Legal Entity");
    const legalEntity = asLegalEntityValue(legalSection ? sessions.identity.getResponse(legalSection.number) : undefined);
    const exported = new MarkdownExporter().toMarkdown(sessions.business, "Foundation",
        buildExportContent(sessions.business, "Foundation", undefined, undefined, { legalEntity, currency: "GBP" }));
    const plan = new MarkdownExporter().toMarkdown(sessions.business, "Foundation", businessPlan(sessions));
    return {
        // For the weekly fixture's comparison within the rounding.
        texts: { forecast: JSON.stringify(tables), plan, exported },
        // Read in full where it is short enough to show what changed:
        // the founders' table the export carries (pay and hours a month).
        founders: exported.match(/\| Founder \| Roles \|[^]*?\n\n/)?.[0] ?? "",
        // The rest by a digest: the forecast's every row, to the
        // cent, and both documents, word for word.
        forecast: digest(JSON.stringify(tables)),
        plan: digest(plan),
        exported: digest(exported)
    };
}


describe("a founder's Frequency, migrated", () => {

    // On the day the golden file was written: the documents say what is
    // due "now", so a later day would change their words.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-30T12:00:00"));
    const now = Object.fromEntries(Object.entries(FIXTURES).map(([name, example]) => [name, outputs(example)]));
    vi.useRealTimers();

    const before = JSON.parse(goldenText) as Record<string, Record<string, unknown>>;

    test.each(["lumen", "quillfield"])("%s calculates what it did before, to the cent", (name) => {
        expect(now[name].founders).toBe(before[name].founders);
        expect(now[name].forecast).toBe(before[name].forecast);
        expect(now[name].plan).toBe(before[name].plan);
        expect(now[name].exported).toBe(before[name].exported);
    });

    test("the weekly fixture, its salary kept to the cent, calculates what it did within that", () => {
        const old = before["lumen-weekly"];
        expect(now["lumen-weekly"].founders).toBe(old.founders);
        const NUMBER = /-?\d[\d,]*(?:\.\d+)?/g;
        for (const part of ["forecast", "plan", "exported"] as const) {
            const text = now["lumen-weekly"].texts[part];
            expect(digest(text.replace(NUMBER, "#")), part + ": the words").toBe(old[part + "Shape"]);
            const numbers = (text.match(NUMBER) ?? []).map(number => Number(number.replace(/,/g, "")));
            const was = old[part + "Numbers"] as number[];
            expect(numbers.length).toBe(was.length);
            numbers.forEach((number, index) => expect(Math.abs(number - was[index]), part + " number " + index).toBeLessThan(4));
        }
    });

});

describe("migrating one founder", () => {

    const founder = (fields: Record<string, unknown>) =>
        asBusinessCapabilityValue({ founders: [{ id: "founder-a", name: "A", roles: ["Maker"], ...fields }] }).founders[0];

    test("hours given a week make the monthly salary a week's", () => {
        const migrated = founder({ salary: "1800", hours: "40", deliveryHours: "22", hoursPeriod: "week" });
        expect(migrated.id).toBe("founder-a");
        expect(migrated.period).toBe("week");
        // A week's, kept to the cent, as every amount is.
        expect(migrated.salary).toBe("415.38");
        expect(Math.abs((founderMonthlySalary(migrated) ?? 0) - 1800)).toBeLessThan(0.03);
        expect(migrated.hours).toBe("40");
    });

    test("hours given a month (or before any choice) leave the salary as it was", () => {
        expect(founder({ salary: "1800", hours: "160", hoursPeriod: "month" })).toMatchObject({ salary: "1800", period: "month" });
        expect(founder({ salary: "1800", hours: "160" })).toMatchObject({ salary: "1800", period: "" });
    });

    test("an answer saved with its Frequency is never migrated again", () => {
        const once = founder({ salary: "1800", hoursPeriod: "week" });
        const again = founder({ ...once });
        expect(again.salary).toBe(once.salary);
        expect(again.period).toBe("week");
        expect(founder({ salary: "415", period: "week" }).salary).toBe("415");
    });

    test("a salary kept with more than two decimals is rounded to the cent, once", () => {
        expect(founder({ salary: "415.38461538461536", period: "week" }).salary).toBe("415.38");
    });

    test("a year's salary and hours are a twelfth a month", () => {
        const yearly = founder({ salary: "24000", hours: "1920", deliveryHours: "1200", period: "year" });
        expect(founderMonthlySalary(yearly)).toBe(2000);
    });

});
