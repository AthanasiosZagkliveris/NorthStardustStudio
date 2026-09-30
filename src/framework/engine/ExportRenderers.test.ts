import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import { asLegalEntityValue } from "./AnswerUtils.ts";
import { buildExportContent } from "./ExportContentBuilder.ts";
import { financialFoundationBlocks } from "./ExportRenderers.ts";
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
        expect(outputs.business).toContain("Total Funding Need: £46,400");
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

    test("a saved Address 2 is read as the Address's next line, and exported as its own part", () => {
        const saved = identity.getResponse(legalSection!.number) as { organisation: Record<string, unknown> };
        const migrated = asLegalEntityValue({
            ...saved,
            organisation: { ...saved.organisation, addressLine1: "Unit 4, Maker Yard", addressLine2: "92 Wallis Road" }
        });
        expect(migrated.organisation.addressLine1).toBe("Unit 4, Maker Yard\n92 Wallis Road");
        expect(migrated.organisation.addressLine2).toBe("");

        const session = InterviewSession.fromJSON(example.systems["1"], frameworkRegistry.getFramework("identity"));
        session.saveResponse(legalSection!.number, migrated);
        const content = buildExportContent(session, "Foundation", undefined, undefined, { legalEntity: migrated, currency: "GBP" });
        const markdown = new MarkdownExporter().toMarkdown(session, "Foundation", content);
        expect(markdown).toContain("Unit 4, Maker Yard, 92 Wallis Road, London");
        expect(markdown).not.toContain("Maker Yard\n92");
    });

    test("an address with no second line is kept as it was", () => {
        const migrated = asLegalEntityValue({ organisation: { addressLine1: "1 High Street" } });
        expect(migrated.organisation.addressLine1).toBe("1 High Street");
    });

});
