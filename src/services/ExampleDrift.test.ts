import { describe, expect, it } from "vitest";

import lumen from "../data/examples/lumen-and-loom-studio.json";
import quillfield from "../data/examples/quillfield-automation-llc.json";
import {
    asBrandInventoryValue, asBrandStyleValue, asBusinessCapabilityValue, asBusinessEngagementValue, asBusinessFoundationValue, asFoundersProfileValue,
    asLegalEntityValue, asStrategicPeriodValue, asStrategyFoundationValue
} from "../framework/engine/AnswerUtils";
import { asFinancialFoundationValue, asFinancialSustainabilityValue } from "../framework/engine/FinancialModel";

/**
 * THE EXAMPLES ARE CURRENT: each saved page of an example, read by the app's own reader for that page, comes back as it was saved. A field the interface gained since the
 * example was written (it would be filled with a default), or one it dropped, shows here: the example is then reworked (docs/examples keeps the owner's copy).
 */
const PAGES: { system: number; section: number; name: string; read: (value: unknown) => unknown }[] = [
    { system: 1, section: 3, name: "Legal Entity", read: asLegalEntityValue },
    { system: 1, section: 4, name: "Founders Profile", read: asFoundersProfileValue },
    { system: 2, section: 2, name: "Brand Style", read: (value) => ({ ...(asBrandStyleValue(value) as object) }) },
    { system: 3, section: 1, name: "Business Foundation", read: asBusinessFoundationValue },
    { system: 3, section: 2, name: "Customer Engagement", read: asBusinessEngagementValue },
    { system: 3, section: 3, name: "Infrastructure & Capability", read: asBusinessCapabilityValue },
    { system: 3, section: 4, name: "Financial Foundation", read: asFinancialFoundationValue },
    { system: 3, section: 5, name: "Sustainability", read: asFinancialSustainabilityValue },
    { system: 4, section: 1, name: "Situation & Direction", read: asStrategyFoundationValue },
    { system: 4, section: 2, name: "Goals & Objectives", read: asStrategicPeriodValue }
];

/** The paths where `read` differs from `saved`: added, removed or changed (the first few of each). */
function differences(saved: unknown, read: unknown, path = "", out: string[] = []): string[] {
    if (out.length > 40) {
        return out;
    }
    if (Array.isArray(saved) && Array.isArray(read)) {
        if (saved.length !== read.length) {
            out.push(path + " length " + saved.length + " -> " + read.length);
        }
        saved.forEach((item, at) => differences(item, read[at], path + "[" + at + "]", out));
    } else if (saved && read && typeof saved === "object" && typeof read === "object") {
        const keys = new Set([...Object.keys(saved), ...Object.keys(read)]);
        for (const key of keys) {
            const one = (saved as Record<string, unknown>)[key];
            const other = (read as Record<string, unknown>)[key];
            if (other === undefined && one === undefined) {
                continue;
            }
            if (!(key in (saved as object))) {
                out.push(path + "." + key + " added " + String(JSON.stringify(other)).slice(0, 40));
            } else if (!(key in (read as object))) {
                out.push(path + "." + key + " dropped " + String(JSON.stringify(one)).slice(0, 40));
            } else {
                differences(one, other, path + "." + key, out);
            }
        }
    } else if (JSON.stringify(saved) !== JSON.stringify(read)) {
        out.push(path + " " + JSON.stringify(saved)?.slice(0, 40) + " -> " + JSON.stringify(read)?.slice(0, 40));
    }
    return out;
}

describe.each([["Lumen & Loom Studio", lumen], ["Quillfield Automation LLC", quillfield]])("the example %s", (_name, example) => {

    for (const page of PAGES) {
        it("keeps " + page.system + "." + page.section + " " + page.name + " as the app reads it", () => {
            const state = (example as unknown as { systems: Record<string, { responses: { sectionNumber: number; value: unknown }[] }> }).systems[String(page.system)];
            const saved = state.responses.find(response => response.sectionNumber === page.section)?.value;
            expect(saved).toBeDefined();
            expect(differences(saved, page.read(saved))).toEqual([]);
        });
    }

});

/**
 * UPDATING THE EXAMPLES: \`UPDATE_EXAMPLES=1 npx vitest run src/services/ExampleDrift.test.ts\` writes every page of both examples as the app reads it, into src/data/examples and
 * docs/examples (the owner's copy). Without the variable nothing is written.
 */
describe.skipIf(!process.env.UPDATE_EXAMPLES)("updating the examples", () => {

    it("writes the examples as the app reads them", async () => {
        const { writeFileSync } = await import("node:fs");
        for (const [file, example] of [["lumen-and-loom-studio.json", lumen], ["quillfield-automation-llc.json", quillfield]] as const) {
            const copy = JSON.parse(JSON.stringify(example)) as { systems: Record<string, { responses: { sectionNumber: number; value: unknown }[] }> };
            for (const page of PAGES) {
                const response = copy.systems[String(page.system)].responses.find(entry => entry.sectionNumber === page.section);
                if (response) {
                    response.value = page.read(response.value);
                }
            }
            const text = JSON.stringify(copy, null, 2).split("\n").join("\r\n") + "\r\n";
            writeFileSync("src/data/examples/" + file, text);
            writeFileSync("docs/examples/" + file, text);
        }
    });

});
