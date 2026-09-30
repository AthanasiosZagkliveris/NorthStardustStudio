import { afterEach, describe, expect, it, vi } from "vitest";

import { linkDetail } from "./notepadPlaces";
import { clearFieldRegistry, registerField } from "../../framework/engine/FieldKeys";
import { OrganizationService } from "../../services/OrganizationService";

afterEach(() => {
    clearFieldRegistry();
    vi.restoreAllMocks();
});

const link = (key: string, label: string) => {
    const [system, section] = key.split(":")[0].split(".").map(Number);
    return { id: "l1", organizationId: "o1", kind: "field" as const, systemNumber: system, sectionNumber: section, key, label, place: "" };
};

describe("a Notepad link chip's number and name", () => {

    it("numbers a field by its System, page and section, and names it by its label, never its value", () => {
        // Legal Entity › 3. Formation & Registration › Registration Number.
        expect(linkDetail(link("1.3:formation-registration/registration-number", "16234587"))).toEqual({ number: "1.3.3", name: "Registration Number" });
        registerField({ key: "1.3:legal-entity-expenses/legal-expense-expense-e6o4i9lb/expense-1-name", label: "Expense 1 name", pageTitle: "3. Legal Entity" });
        // An expense's Name: its section (6. Legal Entity Expenses) and "Name", not "Companies House incorporation".
        expect(linkDetail(link("1.3:legal-entity-expenses/legal-expense-expense-e6o4i9lb/expense-1-name", "Companies House incorporation"))).toEqual({ number: "1.3.6", name: "Name" });
    });

    it("names a whole card by its section, and a section by its title", () => {
        expect(linkDetail(link("1.3:legal-entity-expenses/legal-expense-expense-e6o4i9lb", "Companies House incorporation"))).toEqual({ number: "1.3.6", name: "Legal Entity Expenses" });
        expect(linkDetail(link("1.3:legal-entity-expenses", "Legal Entity Expenses")).number).toBe("1.3.6");
    });


    it("goes deeper inside a card list: each card's place as it is numbered, from what is saved now", () => {
        const saved = (requirements: { id: string }[], segments: unknown[] = []) => vi.spyOn(OrganizationService, "loadDocument").mockReturnValue({
            systems: {
                "1": { responses: [{ sectionNumber: 3, value: { requirements } }] },
                "3": { responses: [{ sectionNumber: 1, value: { segments } }] }
            }
        } as never);
        saved([{ id: "requirement-aa1" }, { id: "requirement-bb2" }]);
        const requirement = (key: string) => ({ ...link(key, ""), anchors: [] });
        expect(linkDetail(requirement("1.3:additional-legal-requirements/legal-requirement-requirement-aa1")).number).toBe("1.3.5.1");
        expect(linkDetail(requirement("1.3:additional-legal-requirements/legal-requirement-requirement-bb2/reference-or-number")).number).toBe("1.3.5.2");

        // Moved: counted where it is now.
        vi.restoreAllMocks();
        saved([{ id: "requirement-bb2" }, { id: "requirement-aa1" }]);
        expect(linkDetail(requirement("1.3:additional-legal-requirements/legal-requirement-requirement-aa1")).number).toBe("1.3.5.2");

        // Nested: a second Profile in Segment 1.
        vi.restoreAllMocks();
        saved([], [{ id: "seg-a1", profiles: [{ id: "profile-x1" }, { id: "profile-y2" }] }]);
        const profile = { ...link("3.1:customer-segment-and-profile/profile-y2/goals", ""), anchors: ["profile-y2", "seg-a1"] };
        expect(linkDetail(profile).number).toBe("3.1.1.1.2");
    });

});
