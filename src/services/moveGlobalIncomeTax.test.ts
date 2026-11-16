import { beforeEach, describe, expect, it } from "vitest";

import { OrganizationService } from "./OrganizationService";
import { moveGlobalIncomeTax } from "./storageMigrations";

/* THE INCOME TAX RATE HAS ONE OWNER, Page 4's Plan Settings (doc 5, section 5.5.6): a rate saved in the Global Settings is moved there once. */
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
