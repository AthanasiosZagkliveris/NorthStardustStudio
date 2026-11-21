import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import LegalEntityEditor from "../LegalEntityEditor";
import { asLegalEntityValue, createLegalEntityExpense, createLegalEntityRequirement } from "../../../../framework/engine/answers/AnswerUtils";

function Harness() {
    const [value, setValue] = useState<unknown>({
        ...asLegalEntityValue(undefined),
        requirements: [createLegalEntityRequirement(), createLegalEntityRequirement()]
    });
    return <LegalEntityEditor value={value} onChange={setValue} />;
}

afterEach(cleanup);

describe("LegalEntityEditor registrations", () => {

    function Registered() {
        const [value, setValue] = useState<unknown>(() => {
            const base = asLegalEntityValue(undefined);
            return {
                ...base,
                organisation: { ...base.organisation, country: "United Kingdom" },
                formation: {
                    ...base.formation,
                    status: "registered",
                    authority: "Companies House",
                    registrationNumber: "16234587",
                    additionalNumbers: [{ id: "number-1", label: "UK Trade Mark", number: "UK00004012345" }]
                }
            };
        });
        return <LegalEntityEditor value={value} onChange={setValue} />;
    }

    it("heads one list of rows, each with its ×: the first moves the next up, the last leaves one empty row", () => {

        render(<Registered />);

        const heads = document.querySelector(".legal-entity-number-head")?.textContent ?? "";
        expect(heads).toContain("Authority / Name");
        expect(heads).toContain("Number");
        expect(heads).not.toContain("Registration");

        fireEvent.click(screen.getByRole("button", { name: "Remove registration number" }));
        // (The authority is the country's, shown as text; the next number moves up.)
        expect(screen.getByLabelText("Registration Authority").textContent).toBe("Companies House");
        expect((screen.getByLabelText("Registration Number") as HTMLInputElement).value).toBe("UK00004012345");
        expect(screen.queryByRole("button", { name: "Remove registration number 1" })).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: "Remove registration number" }));
        expect(screen.getByLabelText("Registration Authority").textContent).toBe("Companies House");
        expect((screen.getByLabelText("Registration Number") as HTMLInputElement).value).toBe("");

    });

});

describe("LegalEntityEditor VAT", () => {

    it("asks one tick, its number beside it, and reads a saved \"not applicable\" as not registered", () => {

        const saved = asLegalEntityValue({ organisation: { country: "GB" }, tax: { consumptionTaxStatus: "not-applicable" } });
        expect(saved.tax.consumptionTaxStatus).toBe("no");

        function Vat() {
            const [value, setValue] = useState<unknown>(saved);
            return <LegalEntityEditor value={value} onChange={setValue} />;
        }
        render(<Vat />);

        const row = document.querySelector(".legal-entity-tax-row")!;
        expect(row.textContent).not.toContain("Not applicable");
        const tick = row.querySelector("input[type=checkbox]") as HTMLInputElement;
        expect(tick.checked).toBe(false);
        fireEvent.click(tick);
        // Ticked: the number, on the same row.
        expect(row.querySelector(".interview-input:not([type=checkbox])")).toBeTruthy();

    });

});

describe("LegalEntityEditor formation row", () => {

    function Formation({ initial }: { initial: unknown }) {
        const [value, setValue] = useState<unknown>(initial);
        return <LegalEntityEditor value={value} onChange={setValue} />;
    }

    it("puts the Registration Date on the Organisation tile, left of the Opening Date, whether or not a registration number is given", () => {

        render(<Formation initial={asLegalEntityValue({ organisation: { country: "GB" }, formation: { date: "2026-03-02", registrationNumber: "16234587" } })} />);

        // (There is no Status to show: the number registers it. The date is shown either way.)
        const dates = document.querySelector(".legal-entity-org-dates")!;
        const cells = [...dates.children];
        expect(cells).toHaveLength(2);
        expect(cells[0].textContent).toContain("Registration Date");
        expect(cells[1].textContent).toContain("Opening Date");
        expect(cells[0].querySelector(".date-cell")).toBeTruthy();
        expect(screen.queryByLabelText("Registration status")).toBeNull();
        // The registration numbers' card no longer holds a date row.
        expect(document.querySelector(".legal-entity-date-row")).toBeNull();

        fireEvent.change(screen.getByLabelText("Registration Number"), { target: { value: "" } });

        // The date is its own: it stays, with its value, when the number is removed.
        expect(document.querySelector(".legal-entity-org-dates")!.children).toHaveLength(2);
        expect(screen.getByLabelText("Formation date")).toBeTruthy();
        expect(screen.getByText(/Not registered yet/)).toBeTruthy();

    });

});

describe("LegalEntityEditor tax list", () => {

    it("names the tax number and VAT beside their boxes, and heads only the registrations added, under them", () => {

        function Tax() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { country: "GB" } }));
            return <LegalEntityEditor value={value} onChange={setValue} />;
        }
        render(<Tax />);

        const list = () => document.querySelectorAll(".legal-entity-registrations")[1] as HTMLElement;
        const heads = () => [...list().querySelectorAll(".legal-entity-number-head")];
        expect(heads()).toHaveLength(0);

        fireEvent.click(screen.getByRole("button", { name: /\+ Add tax registration/i }));

        expect(heads()).toHaveLength(1);
        expect(heads()[0].textContent).toBe("Tax / RegistrationNumber");
        const rows = [...list().children];
        // After the VAT row, before the first added registration.
        expect(rows.indexOf(heads()[0])).toBeGreaterThan(rows.indexOf(list().querySelector(".legal-entity-tax-row")!));
        expect(rows[rows.indexOf(heads()[0]) + 1].querySelector('[aria-label="Tax registration 1 name"]')).toBeTruthy();

    });

});

describe("LegalEntityEditor expense links", () => {

    it("offers a legal requirement by its name alone, and asks the authority with no placeholder", () => {

        function Links() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({
                organisation: { country: "GB" },
                requirements: [{ ...createLegalEntityRequirement(), type: "other", name: "Employers' Liability Insurance", offerInExpenses: true }],
                expenses: [createLegalEntityExpense()]
            }));
            return <LegalEntityEditor value={value} onChange={setValue} />;
        }
        render(<Links />);
        for (const arrow of screen.queryAllByRole("button", { name: /^Maximise/ })) {
            fireEvent.click(arrow);
        }

        expect(screen.getByLabelText("Registration Authority").textContent).toBe("Companies House");

    });

});

describe("LegalEntityEditor requirement type and free-text numbers", () => {

    it("offers plain Type options beside the reference, the country's usual kinds in the Type's note, and Other for a legal form not listed", () => {

        function Requirement() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({
                organisation: { country: "GB", legalForm: "Other (not listed)", legalFormOther: "Charitable Incorporated Organisation" },
                requirements: [{ ...createLegalEntityRequirement(), name: "PSC register", reference: "A long reference that has to wrap onto a second line of its own" }]
            }));
            return <LegalEntityEditor value={value} onChange={setValue} />;
        }
        render(<Requirement />);
        for (const arrow of screen.queryAllByRole("button", { name: /^Maximise/ })) {
            fireEvent.click(arrow);
        }

        // The saved "Other (not listed)" shows as "Other".
        const legalForm = document.querySelector(".legal-entity-legal-form .option-picker-trigger")!;
        expect(legalForm.querySelector(".option-picker-value")?.textContent).toBe("Other");

        const type = screen.getByRole("button", { name: /^Legal requirement 1 type/ });
        fireEvent.click(type);
        const options = screen.getAllByRole("option").map(option => option.textContent);
        expect(options.some(option => option?.includes("("))).toBe(false);

        // The reference is optional, so a tick box (ticked here, it holds one); it is free text that wraps.
        const reference = screen.getByRole("textbox", { name: "Legal requirement 1 reference or number" });
        expect(reference.tagName).toBe("TEXTAREA");
        const referenceField = reference.closest(".optional-field")!;
        expect(referenceField.querySelector('input[type="checkbox"]')).toBeTruthy();
        expect(referenceField.textContent).toContain("Reference or Number");

    });

    it("asks registration and tax numbers as free text that wraps, not one-line inputs", () => {

        render(<Harness />);
        const empty = asLegalEntityValue({ organisation: { country: "GB" }, tax: { consumptionTaxStatus: "yes" } });
        cleanup();
        function Numbers() {
            const [value, setValue] = useState<unknown>(empty);
            return <LegalEntityEditor value={value} onChange={setValue} />;
        }
        render(<Numbers />);
        for (const name of ["Registration Number", /^Tax Identification Number/, "VAT Number"]) {
            expect(screen.getByRole("textbox", { name }).tagName).toBe("TEXTAREA");
        }

    });

});

describe("LegalEntityEditor VAT note", () => {

    function Vat({ country }: { country: string }) {
        const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { country } }));
        return <LegalEntityEditor value={value} onChange={setValue} />;
    }

    it("explains the consumption tax beside its tick, outside the label, with the UK threshold and its GOV.UK source", () => {
        render(<Vat country="GB" />);
        const row = document.querySelector(".legal-entity-tax-row")!;
        const note = row.querySelector(".info-note")!;
        expect(note.closest("label")).toBeNull();
        fireEvent.click(note.querySelector("button")!);
        expect(document.body.textContent).toContain("£90,000");
        expect(document.querySelector('a[href*="vat-registration"]')).toBeTruthy();
        expect(document.body.textContent).toContain("excluding VAT");
    });

    it("gives no figure where none is verified", () => {
        render(<Vat country="DE" />);
        fireEvent.click(document.querySelector(".legal-entity-tax-row .info-note button")!);
        expect(document.body.textContent).toContain("threshold your country sets");
        expect(document.body.textContent).not.toContain("£90,000");
    });

});

describe("LegalEntityEditor Add to Legal Entity Expenses", () => {

    it("ticking a requirement makes an expense named as it is and linked to it; unticking takes it away, undoably", () => {

        const requirement = { ...createLegalEntityRequirement(), name: "Company Secretary" };
        let latest: unknown;
        function Offer() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { country: "GB" }, requirements: [requirement], expenses: [] }));
            latest = value;
            return <LegalEntityEditor value={value} onChange={setValue} />;
        }
        render(<Offer />);
        for (const arrow of screen.queryAllByRole("button", { name: /^Maximise/ })) {
            fireEvent.click(arrow);
        }
        const tick = () => screen.getByRole("checkbox", { name: "Add to Legal Entity Expenses" }) as HTMLInputElement;
        expect(asLegalEntityValue(latest).expenses).toHaveLength(0);

        fireEvent.click(tick());
        const made = asLegalEntityValue(latest).expenses;
        expect(made).toHaveLength(1);
        expect(made[0]).toMatchObject({ name: "Company Secretary", links: [requirement.id], fromRequirement: requirement.id });

        fireEvent.click(tick());
        expect(asLegalEntityValue(latest).expenses).toHaveLength(0);
    });

    it("ticks a saved requirement an expense already links to, and leaves the others unticked", () => {
        const linked = { id: "requirement-a", type: "", name: "A", reference: "", notes: "" };
        const unlinked = { id: "requirement-b", type: "", name: "B", reference: "", notes: "" };
        const entity = asLegalEntityValue({ requirements: [linked, unlinked], expenses: [{ id: "e", name: "X", links: ["requirement-a"] }] });
        expect(entity.requirements.map(r => r.offerInExpenses)).toEqual([true, false]);
    });

});

describe("LegalEntityEditor requirement note", () => {

    it("names a requirement's note as the expenses name theirs", () => {
        function Note() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({ requirements: [{ ...createLegalEntityRequirement(), name: "PSC register" }] }));
            return <LegalEntityEditor value={value} onChange={setValue} />;
        }
        render(<Note />);
        for (const arrow of screen.queryAllByRole("button", { name: /^Maximise/ })) {
            fireEvent.click(arrow);
        }
        expect(screen.getAllByText("Notes").length).toBeGreaterThan(0);
        expect(screen.queryByText("Relevant Information", { exact: true })).toBeNull();
    });

});
