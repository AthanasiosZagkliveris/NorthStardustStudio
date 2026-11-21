import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { OrganizationService } from "./OrganizationService";
import { followSegmentStarts, markIdentitySegments, moveGlobalIncomeTax, swapFinancialPages } from "./storageMigrations";
import { StorageService } from "./StorageService";
import { InterviewSession } from "../framework/interview";
import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";
import { asBusinessFoundationValue, createBusinessCustomerSegment, segmentMadeByIdentity } from "../framework/engine/businessFoundation/foundationPage";
import { LocalNotepadStore, notepadStorageKey } from "./NotepadService";

/* ANSWERS SAVED BY AN OLDER VERSION OF THE APP, and what the app does with them when it loads or saves them: one block for each change. */

describe("an income tax rate saved in the Global Settings", () => {
    /* THE INCOME TAX RATE HAS ONE OWNER, Page 4's Plan Settings (Records 2, section 5.5.6): a rate saved in the Global Settings is moved there once. */
    beforeEach(() => {
        OrganizationService.flushPendingWrites();
        localStorage.clear();
    });

    function withSaved(globalSettings: Record<string, unknown>, plan?: Record<string, unknown>) {
        const created = OrganizationService.create("Quillfield");
        const document = OrganizationService.loadDocument(created.id)!;
        document.globalSettings = globalSettings;
        document.systems["3"] = { responses: plan ? [{ sectionNumber: 4, value: plan }] : [] };
        OrganizationService.saveDocument(document);
        return created.id;
    }
    const planOf = (id: string) => ((OrganizationService.loadDocument(id)!.systems["3"] as { responses: { sectionNumber: number; value: Record<string, unknown> }[] }).responses.find(entry => entry.sectionNumber === 4)?.value);

    describe("moving a Global Settings income tax rate into Page 4", () => {

        it("gives a plan with no basis the rate, and takes it out of the Global Settings, once", () => {
            const id = withSaved({ onCostRate: "13.8", incomeTaxRate: "19" }, { planYears: "3" });
            moveGlobalIncomeTax(id);
            expect(planOf(id)).toEqual({ planYears: "3", incomeTax: "rate", incomeTaxRate: "19" });
            expect(OrganizationService.loadDocument(id)!.globalSettings).toEqual({ onCostRate: "13.8" });
            expect(OrganizationService.loadDocument(id)!.globalIncomeTaxMoved).toBe(true);
        });

        it("keeps a plan's own basis, and makes a plan answer where there was none", () => {
            const kept = withSaved({ incomeTaxRate: "25" }, { incomeTax: "pass-through", incomeTaxRate: "" });
            moveGlobalIncomeTax(kept);
            expect(planOf(kept)).toEqual({ incomeTax: "pass-through", incomeTaxRate: "" });

            const made = withSaved({ incomeTaxRate: "21" });
            moveGlobalIncomeTax(made);
            expect(planOf(made)).toEqual({ incomeTax: "rate", incomeTaxRate: "21" });
        });

        it("changes nothing where no rate was saved", () => {
            const id = withSaved({ onCostRate: "13.8" }, { planYears: "3" });
            moveGlobalIncomeTax(id);
            expect(planOf(id)).toEqual({ planYears: "3" });
        });

    });
});

describe("the two Financial pages saved in the old order", () => {
    /* THE TWO FINANCIAL PAGES CHANGE PLACES (Questions 20, section 11; owner, 2026-11-17 07:36): Revenue & Pricing becomes Section 4, Costs, Funding & Position Section 5. */
    beforeEach(() => {
        OrganizationService.flushPendingWrites();
        localStorage.clear();
    });

    type Response = { sectionNumber: number; value: Record<string, unknown> };

    function withSaved(responses: Response[], extra: Record<string, unknown> = {}) {
        const created = OrganizationService.create("Lumen");
        const document = OrganizationService.loadDocument(created.id)!;
        document.systems["3"] = { responses, currentSectionIndex: 3, ...extra };
        OrganizationService.saveDocument(document);
        return created.id;
    }
    const business = (id: string) => OrganizationService.loadDocument(id)!.systems["3"] as { responses: Response[]; currentSectionIndex: number };
    const at = (id: string, section: number) => business(id).responses.find(entry => entry.sectionNumber === section)?.value;

    const foundation = { costs: [{ id: "c1", name: "Loom", amount: "2400" }], funding: [{ id: "f1", amount: "5000" }], planYears: "3" };
    const sustainability = { streams: [{ id: "s1", offeringId: "o1", price: "160", volume: "12" }] };
    const engagement = { segments: [] };

    describe("the two Financial pages change places", () => {

        it("moves an old save's two answers whole, each to the other's Section, and keeps the reader on the same page", () => {
            const id = withSaved([{ sectionNumber: 2, value: engagement }, { sectionNumber: 4, value: foundation }, { sectionNumber: 5, value: sustainability }]);
            swapFinancialPages(id);
            expect(at(id, 4)).toEqual(sustainability);
            expect(at(id, 5)).toEqual(foundation);
            // (Not a field lost, nothing else moved.)
            expect(at(id, 2)).toEqual(engagement);
            expect(business(id).responses).toHaveLength(3);
            // (The reader was on Financial Foundation, page 4: it is page 5 now.)
            expect(business(id).currentSectionIndex).toBe(4);
            expect(OrganizationService.loadDocument(id)!.financialPagesSwapped).toBe(true);
        });

        it("runs once: a save already in the new order is left as it is", () => {
            const id = withSaved([{ sectionNumber: 4, value: sustainability }, { sectionNumber: 5, value: foundation }]);
            swapFinancialPages(id);
            swapFinancialPages(id);
            expect(at(id, 4)).toEqual(foundation);
            expect(at(id, 5)).toEqual(sustainability);
            // (A document saved after the change carries the flag: never swapped.)
            const fresh = withSaved([{ sectionNumber: 4, value: sustainability }, { sectionNumber: 5, value: foundation }]);
            const document = OrganizationService.loadDocument(fresh)!;
            document.financialPagesSwapped = true;
            OrganizationService.saveDocument(document);
            swapFinancialPages(fresh);
            expect(at(fresh, 4)).toEqual(sustainability);
            expect(at(fresh, 5)).toEqual(foundation);
        });

        it("moves a page answered alone, and an organisation with no Business answers only takes the flag", () => {
            const one = withSaved([{ sectionNumber: 4, value: foundation }]);
            swapFinancialPages(one);
            expect(at(one, 4)).toBeUndefined();
            expect(at(one, 5)).toEqual(foundation);
            const other = withSaved([{ sectionNumber: 5, value: sustainability }]);
            swapFinancialPages(other);
            expect(at(other, 4)).toEqual(sustainability);
            const empty = OrganizationService.create("Empty").id;
            swapFinancialPages(empty);
            expect(OrganizationService.loadDocument(empty)!.financialPagesSwapped).toBe(true);
        });

    });
});

describe("an Offering removed before the Business System is saved", () => {
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
});

describe("the Segment starts saved before they followed their source", () => {
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
            ((document.systems["3"] as { responses: { sectionNumber: number; value: { segments: { questions: Record<string, string[]> }[] } }[] }).responses.find(response => response.sectionNumber === 1)!.value.segments[0].questions).work = ["working"];
            OrganizationService.saveDocument(document);
            followSegmentStarts(id);
            expect(segmentsOf(id)[0].questions.work).toEqual(["working"]);
        });

    });
});

describe("the Segments made from the Identity answers", () => {
    /* THE SEGMENTS THE APP MADE ARE MARKED, BY ID (owner, 2026-11-19; 01-ai-collaboration-rules.md, "Read the app's structure by what a thing is"): the backfill finds
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
            const foundation = responses.find(response => response.sectionNumber === 1)!;
            foundation.value.segments = foundation.value.segments.filter(segment => segment.id !== "a");
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
});

describe("a notepad saved before a field was renamed", () => {
    afterEach(() => localStorage.clear());

    describe("a notepad saved before a field was renamed", () => {

        it("leads its links to the fields as they are now", () => {
            localStorage.setItem(notepadStorageKey("profile-1"), JSON.stringify({
                version: 1,
                notes: [{
                    id: "note-1", organizationId: "org-1", text: "Check #hours", createdAt: 1,
                    links: [{
                        id: "link-1", organizationId: "org-1", kind: "field", systemNumber: 3, sectionNumber: 3,
                        key: "3.3:founders/founder-a/working-hours-month", anchors: ["founder-a"],
                        label: "Working Hours / Month", place: "3. Business System"
                    }]
                }]
            }));
            const link = LocalNotepadStore.load("profile-1").notes[0].links[0];
            expect(link.key).toBe("3.3:founders/founder-a/working-hours");
            expect(link.anchors).toEqual(["founder-a"]);
        });

    });
});
