import { beforeEach, describe, expect, it } from "vitest";

import { OrganizationService } from "./OrganizationService";
import { markIdentitySegments } from "./storageMigrations";
import { asBusinessFoundationValue, createBusinessCustomerSegment, segmentMadeByIdentity } from "../framework/engine/businessFoundation/foundationPage";

/* THE SEGMENTS THE APP MADE ARE MARKED, BY ID (owner, 2026-11-19; ai-collaboration-rules.md, "Read the app's structure by what a thing is"): the backfill finds
   them once by the rule that made them; from then on `madeBy` says it, wherever the Segment stands. */
beforeEach(() => {
    OrganizationService.flushPendingWrites();
    localStorage.clear();
});

type Segment = { id: string; name: string; madeBy?: string };

function organisation(customerType: string[], segments: Segment[]) {
    const created = OrganizationService.create("Lumen");
    const document = OrganizationService.loadDocument(created.id)!;
    document.systems["1"] = { responses: [{ sectionNumber: 3, value: { organisation: { customerType } } }] };
    document.systems["3"] = { responses: [{ sectionNumber: 1, value: { segments } }, { sectionNumber: 2, value: { segments: [] } }] };
    OrganizationService.saveDocument(document);
    return created.id;
}
const segmentsOf = (id: string) => ((OrganizationService.loadDocument(id)!.systems["3"] as { responses: { sectionNumber: number; value: { segments: Segment[] } }[] })
    .responses.find(entry => entry.sectionNumber === 1)!.value.segments);

describe("the Segments the app made", () => {

    it("marks the first Segment, and the second where Positioning chose both people and businesses, once", () => {
        const id = organisation(["b2c", "b2b"], [{ id: "a", name: "Homes" }, { id: "b", name: "Hotels" }, { id: "c", name: "Added" }]);
        markIdentitySegments(id);
        expect(segmentsOf(id).map(segment => segment.madeBy)).toEqual(["identity", "identity", undefined]);
        expect(OrganizationService.loadDocument(id)!.identitySegmentsMarked).toBe(true);
    });

    it("marks only the first where Positioning chose one kind of customer", () => {
        const id = organisation(["b2b"], [{ id: "a", name: "Firms" }, { id: "b", name: "Added" }]);
        markIdentitySegments(id);
        expect(segmentsOf(id).map(segment => segment.madeBy)).toEqual(["identity", undefined]);
    });

    it("reads \"both\", as the Legal Entity's reader does", () => {
        const id = organisation(["both"], [{ id: "a", name: "Homes" }, { id: "b", name: "Hotels" }]);
        markIdentitySegments(id);
        expect(segmentsOf(id).map(segment => segment.madeBy)).toEqual(["identity", "identity"]);
    });

    it("runs once: a Segment moved or removed afterwards keeps what it is, by its id", () => {
        const id = organisation(["b2c"], [{ id: "a", name: "Homes" }, { id: "b", name: "Added" }]);
        markIdentitySegments(id);
        // (The made Segment removed: the one left is still the user's, though it now stands first.)
        const document = OrganizationService.loadDocument(id)!;
        const responses = (document.systems["3"] as { responses: { sectionNumber: number; value: { segments: Segment[] } }[] }).responses;
        responses[0].value.segments = responses[0].value.segments.filter(segment => segment.id !== "a");
        OrganizationService.saveDocument(document);
        markIdentitySegments(id);
        expect(segmentsOf(id)).toEqual([{ id: "b", name: "Added" }]);
        expect(segmentMadeByIdentity(asBusinessFoundationValue({ segments: segmentsOf(id) }).segments[0])).toBe(false);
    });

    it("keeps the mark through the reader; a new Segment the user adds has none, the one a Foundation always has is the app's", () => {
        expect(asBusinessFoundationValue({ segments: [{ id: "a", madeBy: "identity" }, { id: "b" }] }).segments.map(segmentMadeByIdentity)).toEqual([true, false]);
        expect(segmentMadeByIdentity(createBusinessCustomerSegment())).toBe(false);
        expect(segmentMadeByIdentity(createBusinessCustomerSegment([], "identity"))).toBe(true);
        expect(asBusinessFoundationValue(undefined).segments.map(segmentMadeByIdentity)).toEqual([true]);
    });

});
