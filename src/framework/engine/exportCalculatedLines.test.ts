import { describe, expect, test } from "vitest";

import { InterviewSession } from "../interview";
import { readFoundation } from "./BusinessDocuments.ts";
import { buildExportContent } from "./export/ExportContentBuilder.ts";
import { frameworkRegistry } from "./FrameworkRegistry.ts";
import { MarkdownExporter } from "./export/MarkdownExporter.ts";
import { asGlobalSettings } from "./GlobalSettings.ts";
import { planMonthLabel } from "./financial/FinancialModel.ts";
import lumenText from "../../data/examples/lumen-and-loom-studio.json?raw";
import quillText from "../../data/examples/quillfield-automation-llc.json?raw";

/* THE EXPORT READS AS THE PAGE DOES (owner, 2026-11-16): with the Global Settings in its context, Page 5's export counts the calculated lines -- fees, on-costs, tax -- as
   the page and the documents do, so its break-even is the page's. */
type Saved = { globalSettings?: unknown; systems: Record<string, Parameters<typeof InterviewSession.fromJSON>[0]> };

describe.each([["Lumen & Loom Studio", lumenText], ["Quillfield Automation", quillText]] as const)("%s: Page 5's export", (name, text) => {

    const saved = JSON.parse(text) as Saved;
    const load = (number: number, id: string) => InterviewSession.fromJSON(saved.systems[String(number)], frameworkRegistry.getFramework(id));

    test("gives the break-even and the exhaustion month the page gives", () => {
        const business = load(3, "business");
        const page = readFoundation({ identity: load(1, "identity"), business, organisationName: name, globalSettings: saved.globalSettings });
        const md = new MarkdownExporter().toMarkdown(business, "Foundation", buildExportContent(business, "Foundation", undefined, undefined, {
            legalEntity: page.legalEntity, currency: page.currency, globalSettings: asGlobalSettings(saved.globalSettings)
        }));
        const month = (index: number | null) => index === null ? "Not reached" : planMonthLabel(page.financial.planStart, index) + " (Month " + index + ")";
        expect(md).toContain("Expected break even: " + month(page.outlook.breakEvenMonth));
        if (page.outlook.exhaustionMonth !== null) {
            expect(md).toContain("Financial exhaustion: " + month(page.outlook.exhaustionMonth));
        }
    });

});
