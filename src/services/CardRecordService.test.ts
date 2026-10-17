import { beforeEach, describe, expect, it } from "vitest";
import { OrganizationService } from "./OrganizationService";
import { CardRecordService } from "./CardRecordService";

describe("the record time of a card", () => {

    beforeEach(() => localStorage.clear());

    it("is set the first time it is asked for, kept in the organization's document, and does not change", () => {
        const summary = OrganizationService.create("Test Studio");
        OrganizationService.setSelected(summary.id);
        const first = CardRecordService.recordedAt("card-1", 1000);
        expect(first).toBe(1000);
        expect(CardRecordService.recordedAt("card-1", 2000)).toBe(1000);
        expect(OrganizationService.loadDocument(summary.id)?.cardTimes).toEqual({ "card-1": 1000 });
        expect(OrganizationService.exportDocument(summary.id)?.cardTimes).toEqual({ "card-1": 1000 });
    });

});
