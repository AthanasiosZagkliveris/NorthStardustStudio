import { afterEach, describe, expect, it } from "vitest";

import { linkDetail } from "./notepadPlaces";
import { clearFieldRegistry, registerField } from "../../framework/engine/FieldKeys";

afterEach(clearFieldRegistry);

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

});
