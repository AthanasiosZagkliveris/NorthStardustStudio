import { beforeEach, describe, expect, it } from "vitest";

import { OrganizationService } from "./OrganizationService";
import { swapFinancialPages } from "./storageMigrations";

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
