import { beforeEach, describe, expect, it } from "vitest";

import { OrganizationService } from "./OrganizationService";
import { followSegmentStarts } from "./storageMigrations";

/* THE SEGMENT'S STARTS FOLLOW THEIR SOURCE AGAIN (B4; owner, 2026-11-17 08:38): saved copies equal to today's start are taken out once; edited ones stay. */
beforeEach(() => {
    OrganizationService.flushPendingWrites();
    localStorage.clear();
});

function withSegments(segments: { questions: Record<string, string[]> }[]) {
    const created = OrganizationService.create("Lumen");
    const document = OrganizationService.loadDocument(created.id)!;
    document.systems["3"] = { responses: [{ sectionNumber: 1, value: { segments } }, { sectionNumber: 2, value: { segments: [] } }] };
    OrganizationService.saveDocument(document);
    return created.id;
}
const segmentsOf = (id: string) => ((OrganizationService.loadDocument(id)!.systems["3"] as { responses: { sectionNumber: number; value: { segments: { questions: Record<string, string[]> }[] } }[] })
    .responses.find(entry => entry.sectionNumber === 1)!.value.segments);

describe("the Segment's copied starts", () => {

    it("takes out each copy equal to its start, keeps a changed one and every other answer, once", () => {
        const id = withSegments([
            { questions: { age: ["peak"], work: ["working"], workenv: ["office"], setting: ["mobile"], pay: ["wallet"] } },
            { questions: { orgtype: ["private"], size: ["micro"], authorise: ["team"] } }
        ]);
        followSegmentStarts(id);
        expect(segmentsOf(id)[0].questions).toEqual({ age: ["peak"], workenv: ["office"], setting: ["mobile"] });
        // (One person decides was the start of a micro firm: the team agreeing is the founder's own answer.)
        expect(segmentsOf(id)[1].questions).toEqual({ orgtype: ["private"], size: ["micro"], authorise: ["team"] });
        expect(OrganizationService.loadDocument(id)!.segmentStartsFollow).toBe(true);
        // (Run again, it leaves an answer the founder gave afterwards alone.)
        const document = OrganizationService.loadDocument(id)!;
        ((document.systems["3"] as { responses: { value: { segments: { questions: Record<string, string[]> }[] } }[] }).responses[0].value.segments[0].questions).work = ["working"];
        OrganizationService.saveDocument(document);
        followSegmentStarts(id);
        expect(segmentsOf(id)[0].questions.work).toEqual(["working"]);
    });

});
