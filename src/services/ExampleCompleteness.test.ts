import { beforeEach, describe, expect, it } from "vitest";

import lumen from "../data/examples/lumen-and-loom-studio.json";
import quillfield from "../data/examples/quillfield-automation-llc.json";
import { OrganizationService, type OrganizationDocument } from "./OrganizationService";
import { organizationReview } from "./ReviewService";

/**
 * THE EXAMPLES ARE COMPLETE: each example organization, read as the app reads it, leaves nothing for the Review to list (no page, section or card is missing
 * what it needs). The examples are the reference for every check; a change to the interface is followed by a change to them (docs/examples).
 */
beforeEach(() => {
    OrganizationService.flushPendingWrites();
    localStorage.clear();
});

describe.each([["Lumen & Loom Studio", lumen], ["Quillfield Automation LLC", quillfield]])("the example %s", (_name, example) => {

    it("leaves nothing in the Review", () => {
        const document = JSON.parse(JSON.stringify(example)) as OrganizationDocument;
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: document.id, name: document.name, createdAt: document.createdAt }]));
        OrganizationService.saveDocument(document);
        OrganizationService.flushPendingWrites();
        const items = organizationReview(document.id);
        // (The "second look" items are the finance pages' own findings -- a funding gap, a runway -- which the examples keep on purpose.)
        expect(items.filter(item => item.group !== "second-look").map(item => JSON.stringify(item).slice(0, 200))).toEqual([]);
    });

});
