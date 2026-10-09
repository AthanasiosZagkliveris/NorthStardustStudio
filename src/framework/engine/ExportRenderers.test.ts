import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import { addressCity, asLegalEntityValue, createBusinessPartner } from "./AnswerUtils.ts";
import { buildExportContent } from "./ExportContentBuilder.ts";
import { financialFoundationBlocks, partnerRows } from "./ExportRenderers.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { MarkdownExporter } from "./MarkdownExporter.ts";
import exampleText from "../../../docs/examples/lumen-and-loom-studio.json?raw";

/*
    The Lumen & Loom Studio example (docs/examples) exported through
    the real Frameworks: every page of the Foundation capability must
    export what was answered on it -- none of them "No response".
*/

const example = JSON.parse(exampleText) as { systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };

const SYSTEMS = [[1, "identity"], [2, "brand"], [3, "business"], [4, "strategy"]] as const;

const identity = InterviewSession.fromJSON(example.systems["1"], frameworkRegistry.getFramework("identity"));
const legalSection = identity.getFramework().sections.find(section => section.title === "Legal Entity");
const legalEntity = asLegalEntityValue(legalSection ? identity.getResponse(legalSection.number) : undefined);

function markdownFor(number: number, id: string): string {
    const session = InterviewSession.fromJSON(example.systems[String(number)], frameworkRegistry.getFramework(id));
    const content = buildExportContent(session, "Foundation", undefined, undefined, { legalEntity, currency: "GBP" });
    return new MarkdownExporter().toMarkdown(session, "Foundation", content);
}

describe("exporting the Foundation capability", () => {

    const outputs = Object.fromEntries(SYSTEMS.map(([number, id]) => [id, markdownFor(number, id)]));

    test.each(SYSTEMS)("System %i (%s) has no empty page", (_number, id) => {
        expect(outputs[id]).not.toContain("_No response._");
    });

    test("the custom pages carry their answers", () => {
        expect(outputs.identity).toContain("Lumen & Loom Studio Ltd");
        expect(outputs.identity).toMatch(/Maya Chen \| 40/);
        expect(outputs.brand).toContain("Loom Indigo");
        expect(outputs.brand).toContain("herringbone-throw.png");
        expect(outputs.business).toContain("Segment 1: Conscious London Homemakers");
        expect(outputs.business).toContain("1. Customer Channel");
        expect(outputs.business).toContain("8-shaft floor looms");
        expect(outputs.business).toContain("Total Funding Need: £55,864");
        expect(outputs.business).toContain("Break-even revenue");
        expect(outputs.strategy).toContain("Financial Resilience");
        expect(outputs.strategy).toContain("2.1.1 Launch the Trade Collection");
        expect(outputs.strategy).toContain("Goals & Objectives · Oct 2026 – Sep 2029");
        expect(outputs.identity).toContain("Formation Date: 2 March 2026");
    });

    test("the Funding Need table uses an em dash, not \"n/a\", for a $0 need's When", () => {
        const blocks = financialFoundationBlocks(undefined, { legalEntity: asLegalEntityValue(undefined), currency: "USD" });
        const table = blocks.find((block): block is Extract<typeof block, { kind: "table" }> =>
            block.kind === "table" && block.headers.includes("When"));
        expect(table).toBeTruthy();
        expect(table!.rows.some(row => row[2] === "—")).toBe(true);
        expect(table!.rows.some(row => row[2] === "n/a")).toBe(false);
    });

});

describe("the Legal Entity's address, one box of lines", () => {

    test("a saved Address 2, City and Postcode are read as the Address's next lines, and exported as its parts", () => {
        const saved = identity.getResponse(legalSection!.number) as { organisation: Record<string, unknown> };
        const migrated = asLegalEntityValue({
            ...saved,
            organisation: { ...saved.organisation, addressLine1: "Unit 4, Maker Yard", addressLine2: "92 Wallis Road", city: "London", postalCode: "E9 5LN" }
        });
        expect(migrated.organisation.addressLine1).toBe("Unit 4, Maker Yard\n92 Wallis Road\nLondon\nE9 5LN");
        expect(migrated.organisation.addressLine2).toBe("");
        expect(migrated.organisation.city).toBe("");
        expect(migrated.organisation.postalCode).toBe("");

        const session = InterviewSession.fromJSON(example.systems["1"], frameworkRegistry.getFramework("identity"));
        session.saveResponse(legalSection!.number, migrated);
        const content = buildExportContent(session, "Foundation", undefined, undefined, { legalEntity: migrated, currency: "GBP" });
        const markdown = new MarkdownExporter().toMarkdown(session, "Foundation", content);
        expect(markdown).toContain("Unit 4, Maker Yard, 92 Wallis Road, London, E9 5LN");
        expect(markdown).not.toContain("Maker Yard\n92");
    });

    test("an address with no second line is kept as it was", () => {
        const migrated = asLegalEntityValue({ organisation: { addressLine1: "1 High Street" } });
        expect(migrated.organisation.addressLine1).toBe("1 High Street");
    });

    test("a sentence reads the City back from the address's lines, only where it can be told", () => {
        expect(addressCity("Unit 4, Hackney Wick Maker Yard\nLondon\nE9 5LN")).toBe("London");
        expect(addressCity("120 Clinton Street\nBrooklyn\n11201")).toBe("Brooklyn");
        // No postal code line to anchor on, or too few lines: no city.
        expect(addressCity("Office 12, Tower B\nDubai")).toBe("");
        expect(addressCity("1 High Street")).toBe("");
    });

});

describe("a Partnership / Provider's Responsible in the export", () => {

    const names: Record<string, string> = { ann: "Ann", bo: "Bo" };
    const name = (id: string) => names[id] ?? "";
    const rows = (responsibleId: string, founderIds: string[]) =>
        partnerRows([{ ...createBusinessPartner("Printer"), responsibleId }], "Provider", name, "GBP", undefined, false, founderIds)[0][2];

    test("is the one founder of a one-founder organisation when nobody is chosen; a choice is kept; several founders leave it empty until chosen", () => {
        expect(rows("", ["ann"])).toBe("Ann");
        expect(rows("bo", ["ann", "bo"])).toBe("Bo");
        expect(rows("", ["ann", "bo"])).toBe("");
        expect(rows("", [])).toBe("");
    });

    test("is empty when the Responsible tick is off, even for a one-founder organisation", () => {
        const off = (responsibleId: string, founderIds: string[]) =>
            partnerRows([{ ...createBusinessPartner("Printer"), responsibleId, responsibleOff: true }], "Provider", name, "GBP", undefined, false, founderIds)[0][2];
        expect(off("", ["ann"])).toBe("");
        expect(off("bo", ["ann", "bo"])).toBe("");
    });

});
