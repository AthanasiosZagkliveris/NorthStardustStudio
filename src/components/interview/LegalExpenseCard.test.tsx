import { PreferencesService } from "../../services/PreferencesService.ts";
import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import LegalEntityEditor from "./editors/LegalEntityEditor";
import { asLegalEntityValue, createLegalEntityExpense } from "../../framework/engine/AnswerUtils";
import { asFinancialFoundationValue, consolidateCosts } from "../../framework/engine/FinancialModel";
import { asBusinessCapabilityValue } from "../../framework/engine/AnswerUtils";

/* H5: a Legal Entity expense has a Date after its name, pays for exactly one registration, and is no place for insurance. */

afterEach(cleanup);

const entity = (expenses: object[]) => asLegalEntityValue({
    organisation: { country: "GB" },
    formation: { status: "registered", registrationNumber: "12345678", date: "2020-02-01" },
    expenses
});

describe("the Legal Entity expense in the value", () => {

    it("has a Date, read as an ISO date", () => {
        expect(createLegalEntityExpense().date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(asLegalEntityValue({ expenses: [{ id: "e", name: "Filing", date: "2027-03-15" }] }).expenses[0].date).toBe("2027-03-15");
        expect(asLegalEntityValue({ expenses: [{ id: "e", name: "Filing", date: "March" }] }).expenses[0].date).toBe("");
    });

    it("links exactly one registration: an earlier answer with several keeps the first", () => {
        expect(asLegalEntityValue({ expenses: [{ id: "e", links: ["a", "b"] }] }).expenses[0].links).toEqual(["a"]);
    });

    it("a one-time expense falls in the month of its own date, else the month of the formation", () => {
        const sources = (expenses: object[]) => ({ legalEntity: entity(expenses), capability: asBusinessCapabilityValue(undefined), resourceGroupLabels: {}, subsectionLabels: {}, currency: "GBP", foundersLinked: false });
        const lines = consolidateCosts(asFinancialFoundationValue({}), sources([
            { id: "dated", name: "Filing fee", cost: "100", frequency: "One time", date: "2027-05-10" },
            { id: "undated", name: "Agent fee", cost: "50", frequency: "One time" }
        ]));
        expect(lines.find(line => line.id === "legal-dated")!.month).toEqual({ month: "05", year: "2027" });
        expect(lines.find(line => line.id === "legal-undated")!.month).toEqual({ month: "02", year: "2020" });
    });

});

describe("the Legal Entity expense card", () => {

    function open(expenses: object[]) {
        let latest: unknown;
        function Harness() {
            const [value, setValue] = useState<unknown>(entity(expenses));
            latest = value;
            return <LegalEntityEditor value={value} onChange={setValue} />;
        }
        render(<Harness />);
        for (const arrow of screen.queryAllByRole("button", { name: /^Maximize/ })) {
            fireEvent.click(arrow);
        }
        return () => asLegalEntityValue(latest);
    }

    it("sets the Date straight after the name, before the Cost", () => {
        open([{ id: "e", name: "Filing fee" }]);
        const date = screen.getByLabelText("Expense 1 date");
        const cost = screen.getByLabelText("Expense 1 cost");
        expect(date.compareDocumentPosition(cost) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("types the Date into the expense", () => {
        const value = open([{ id: "e", name: "Filing fee" }]);
        // (The date cell: typed as the reader's format shows it, taken on leaving the box.)
        const cell = screen.getByLabelText("Expense 1 date");
        fireEvent.change(cell, { target: { value: PreferencesService.getDateFormat() === "US" ? "03/15/2027" : "15/03/2027" } });
        fireEvent.blur(cell);
        expect(value().expenses[0].date).toBe("2027-03-15");
    });

    it("chooses one linked registration from a dropdown; choosing another replaces it", () => {
        const value = open([{ id: "e", name: "Filing fee" }]);
        fireEvent.click(screen.getByRole("button", { name: /^Expense 1 linked registration/ }));
        fireEvent.click(screen.getByRole("option", { name: /: 12345678/ }));
        expect(value().expenses[0].links).toEqual(["formation-registration-number"]);
        expect(screen.queryAllByRole("checkbox", { name: /Registration Number/ })).toHaveLength(0);
    });

    it("keeps insurance out: its help sends insurance, licences and certificates to Documents & Rights", () => {
        open([{ id: "e", name: "Filing fee" }]);
        expect(document.body.textContent).not.toMatch(/insurance\s*,?\s*(and)?\s*the\s*like/i);
    });

});

describe("what cannot be in the Formation's date", () => {
    it("says a registered company's date is not in the future, nor after the Opening Date", async () => {
        const { formationIssues } = await import("./editors/LegalEntityEditor.tsx");
        expect(formationIssues({ status: "registered", date: "2999-01-01" })).toHaveLength(1);
        expect(formationIssues({ status: "registered", date: "2020-05-01" }, "2020-01-01")).toHaveLength(1);
        expect(formationIssues({ status: "registered", date: "2020-05-01" }, "2020-09-01")).toEqual([]);
        expect(formationIssues({ status: "planned", date: "2999-01-01" }, "2020-01-01")).toEqual([]);
    });
});

describe("what a registration number may hold", () => {
    it("takes digits only, no more than the country's, where its shape is digits", async () => {
        const { registrationNumberRule, limitedRegistrationNumber } = await import("../../framework/engine/LegalEntityJurisdictions.ts");
        const eight = registrationNumberRule("8 digits");
        expect(limitedRegistrationNumber("12a34-5678 9", eight)).toBe("12345678");
        expect(limitedRegistrationNumber("SC123456", registrationNumberRule("8 characters"))).toBe("SC123456");
        expect(limitedRegistrationNumber("SC12345678", registrationNumberRule("8 characters"))).toBe("SC123456");
        expect(limitedRegistrationNumber("12-34a567890", registrationNumberRule("EIN: 12-3456789"))).toBe("12-3456789");
        expect(limitedRegistrationNumber("HRB 123456", registrationNumberRule("HRB 12345"))).toBe("HRB 123456");
    });
});
