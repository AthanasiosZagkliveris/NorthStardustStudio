import { describe, expect, it } from "vitest";

import { capabilities } from "../../data/capabilities.ts";
import { getCapabilityDescription } from "./CapabilityDescriptions.ts";

/**
 * EACH CAPABILITY HAS ITS OWN DESCRIPTION: the file the descriptions are read from is split at its "---" lines, one Capability per block. The file is saved with Windows
 * line endings, and a split that did not allow for them left the whole file as the first Capability's text and nothing for the others.
 */
describe("the Capability descriptions", () => {

    it("give every Capability its own text, and Foundation only its own", () => {
        for (const { title } of capabilities) {
            const description = getCapabilityDescription(title);
            expect(description, title).toBeDefined();
            expect(description!.paragraphs.length, title).toBeGreaterThan(0);
        }
        const foundation = getCapabilityDescription("Foundation")!;
        expect(foundation.paragraphs.join("\n")).not.toContain("## 02.");
        expect(foundation.paragraphs.join("\n")).not.toContain("---");
        expect(foundation.tagline).toBe("Developing organizational alignment");
    });

});
