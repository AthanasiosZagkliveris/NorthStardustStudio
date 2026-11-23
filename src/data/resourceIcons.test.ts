import { describe, expect, it } from "vitest";
import { getResourceIcon, resourceIconName } from "./resourceIcons";

describe("the Resources' symbols", () => {
    it("names a category's file from its words", () => {
        expect(resourceIconName("Materials & Inventory")).toBe("materials-inventory");
        expect(resourceIconName("Documents & Rights")).toBe("documents-rights");
        expect(resourceIconName("Human Resources")).toBe("human-resources");
    });
    it("has a symbol for each of the nine categories, and none for a founder's own", () => {
        for (const category of ["Workspace", "Utilities", "Workstation", "Equipment", "Vehicles", "Digital Infrastructure", "Materials & Inventory", "Documents & Rights", "Human Resources"]) {
            expect(getResourceIcon(category), category).toBeTruthy();
        }
        expect(getResourceIcon("Boat Hire")).toBeUndefined();
    });
});
