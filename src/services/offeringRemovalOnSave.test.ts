import { beforeEach, describe, expect, it } from "vitest";

import { OrganizationService } from "./OrganizationService";
import { StorageService } from "./StorageService";
import { InterviewSession } from "../framework/interview";
import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";

/* AN OFFERING REMOVED LEAVES NO CARD POINTING AT IT, WHEN THE BUSINESS SYSTEM IS SAVED (owner, 2026-11-19; offeringRemoval.ts, StorageService.saveInterview): its id
   is unticked on Customer Engagement's channels and Infrastructure & Capability's cards, in the session; the Legal Entity's expenses hold no Offerings (owner,
   2026-11-19 16:52), so the Identity System is left as it was. */
beforeEach(() => {
    OrganizationService.flushPendingWrites();
    localStorage.clear();
});

type Responses = { sectionNumber: number; value: unknown }[];

function organisation() {
    const created = OrganizationService.create("Lumen");
    const document = OrganizationService.loadDocument(created.id)!;
    const offering = (id: string) => ({ id, name: id.toUpperCase() });
    document.systems["3"] = {
        systemNumber: 3, currentSectionIndex: 0, completed: false,
        responses: [
            { sectionNumber: 1, value: { segments: [{ id: "seg", name: "Homes", offerings: [offering("a"), offering("b")] }] } },
            { sectionNumber: 2, value: { segments: [{ segmentId: "seg", channels: [{ id: "c1", category: "website", name: "Shop", offerings: ["a", "b"], stages: [] }] }] } },
            { sectionNumber: 3, value: { offering: { resources: [{ id: "r1", name: "Yarn", offeringIds: ["a", "b"], offeringShares: { a: "50", b: "50" } }], activities: [], professionals: [], providers: [] } } }
        ]
    } as never;
    document.systems["1"] = { responses: [{ sectionNumber: 3, value: { expenses: [{ id: "e1", name: "Licence", offeringIds: ["b"] }, { id: "e2", name: "Fee", offeringIds: ["a"] }] } }] } as never;
    OrganizationService.saveDocument(document);
    return created.id;
}

function businessSession(id: string): InterviewSession {
    const state = OrganizationService.loadSystemState(id, 3) as Parameters<typeof InterviewSession.fromJSON>[0];
    return InterviewSession.fromJSON(state, frameworkRegistry.getFramework("business"));
}

describe("saving the Business System after an Offering is removed", () => {

    it("unticks it on every card that pointed at it, and nowhere else", () => {
        const id = organisation();
        const session = businessSession(id);
        // (Offering b removed from the Foundation.)
        const foundation = session.getResponse(1) as { segments: { offerings: { id: string }[] }[] };
        session.saveResponse(1, { ...foundation, segments: foundation.segments.map(segment => ({ ...segment, offerings: segment.offerings.filter(offering => offering.id !== "b") })) });
        StorageService.saveInterview(id, session);

        const business = (OrganizationService.loadSystemState(id, 3) as { responses: Responses }).responses;
        const value = (number: number) => business.find(response => response.sectionNumber === number)!.value as never;
        expect((value(2) as { segments: { channels: { offerings: string[] }[] }[] }).segments[0].channels[0].offerings).toEqual(["a"]);
        expect((value(3) as { offering: { resources: { offeringIds: string[]; offeringShares: Record<string, string> }[] } }).offering.resources[0]).toMatchObject({ offeringIds: ["a"], offeringShares: { a: "50" } });

        // (An old save's expense that still lists an Offering is left as it was: expenses are the company's, and its list is no longer read.)
        const identity = (OrganizationService.loadDocument(id)!.systems["1"] as { responses: Responses }).responses;
        const expenses = (identity.find(response => response.sectionNumber === 3)!.value as { expenses: { offeringIds: string[] }[] }).expenses;
        expect(expenses.map(expense => expense.offeringIds)).toEqual([["b"], ["a"]]);
    });

    it("changes nothing when no Offering was removed", () => {
        const id = organisation();
        const before = JSON.stringify(OrganizationService.loadDocument(id)!.systems["1"]);
        const session = businessSession(id);
        StorageService.saveInterview(id, session);
        expect(JSON.stringify(OrganizationService.loadDocument(id)!.systems["1"])).toBe(before);
        expect(((OrganizationService.loadSystemState(id, 3) as { responses: Responses }).responses.find(response => response.sectionNumber === 2)!.value as { segments: { channels: { offerings: string[] }[] }[] }).segments[0].channels[0].offerings).toEqual(["a", "b"]);
    });

});
