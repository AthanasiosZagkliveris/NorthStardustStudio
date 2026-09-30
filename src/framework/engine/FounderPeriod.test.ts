import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import { asBusinessCapabilityValue, asLegalEntityValue } from "./AnswerUtils.ts";
import { parseAmount } from "./Amounts.ts";
import { founderMonthlySalary } from "./DemandCapacity.ts";
import { businessForecast, businessPlan } from "./BusinessDocuments.ts";
import { buildExportContent } from "./ExportContentBuilder.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { MarkdownExporter } from "./MarkdownExporter.ts";
import lumenText from "../../../docs/examples/lumen-and-loom-studio.json?raw";
import quillText from "../../../docs/examples/quillfield-automation-llc.json?raw";
import goldenText from "./founder-period-golden.json?raw";

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
*/

type Example = { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };

const lumen = JSON.parse(lumenText) as Example;
const quill = JSON.parse(quillText) as Example;

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
    const tables = Object.fromEntries(Object.entries(forecast)
        .filter(([, table]) => table && typeof table === "object" && Array.isArray((table as { rows?: unknown }).rows))
        .map(([name, table]) => [name, (table as { rows: { label: string; values: number[] }[] }).rows
            .map(row => row.label + ": " + row.values.map(cents).join(" "))]));
    const legalSection = sessions.identity.getFramework().sections.find(section => section.title === "Legal Entity");
    const legalEntity = asLegalEntityValue(legalSection ? sessions.identity.getResponse(legalSection.number) : undefined);
    const exported = new MarkdownExporter().toMarkdown(sessions.business, "Foundation",
        buildExportContent(sessions.business, "Foundation", undefined, undefined, { legalEntity, currency: "GBP" }));
    const plan = new MarkdownExporter().toMarkdown(sessions.business, "Foundation", businessPlan(sessions));
    return {
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

    const now = Object.fromEntries(Object.entries(FIXTURES).map(([name, example]) => [name, outputs(example)]));

    const before = JSON.parse(goldenText) as typeof now;

    test.each(Object.keys(FIXTURES))("%s calculates what it did before, to the cent", (name) => {
        expect(now[name].founders).toBe(before[name].founders);
        expect(now[name].forecast).toBe(before[name].forecast);
        expect(now[name].plan).toBe(before[name].plan);
        expect(now[name].exported).toBe(before[name].exported);
    });

});

describe("migrating one founder", () => {

    const founder = (fields: Record<string, unknown>) =>
        asBusinessCapabilityValue({ founders: [{ id: "founder-a", name: "A", roles: ["Maker"], ...fields }] }).founders[0];

    test("hours given a week make the monthly salary a week's", () => {
        const migrated = founder({ salary: "1800", hours: "40", deliveryHours: "22", hoursPeriod: "week" });
        expect(migrated.id).toBe("founder-a");
        expect(migrated.period).toBe("week");
        expect(parseAmount(migrated.salary)).toBeCloseTo(1800 * 12 / 52, 10);
        expect(founderMonthlySalary(migrated)).toBeCloseTo(1800, 10);
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

    test("a year's salary and hours are a twelfth a month", () => {
        const yearly = founder({ salary: "24000", hours: "1920", deliveryHours: "1200", period: "year" });
        expect(founderMonthlySalary(yearly)).toBe(2000);
    });

});
