import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import LegalEntityEditor from "./LegalEntityEditor";
import { positioningName } from "./legal/shared.tsx";
import { typeInto } from "../../../test/interviewTestUtils";
import { asLegalEntityValue, createLegalEntityExpense, createLegalEntityFounder, createLegalEntityRequirement, legalEntitySectionsEmpty } from "../../../framework/engine/AnswerUtils";

function Harness() {
    const [value, setValue] = useState<unknown>({
        ...asLegalEntityValue(undefined),
        requirements: [createLegalEntityRequirement(), createLegalEntityRequirement()]
    });
    return <LegalEntityEditor value={value} onChange={setValue} />;
}

const toggles = () =>
    screen.getAllByRole("button", { name: /Requirement \d+$/ }).filter(b => b.classList.contains("strategy-box-toggle"));

afterEach(cleanup);

describe("LegalEntityEditor folding", () => {

    it("puts Expand all on the subsection's heading row", () => {

        render(<Harness />);

        const head = screen.getByRole("button", { name: "Expand all legal requirements" }).parentElement!;

        expect(head.classList.contains("fold-group-head")).toBe(true);
        expect(head.querySelector("h3")?.textContent).toMatch(/Additional Legal Requirements/);

    });

    it("starts requirement cards folded and opens a new one", () => {

        render(<Harness />);

        expect(toggles()).toHaveLength(2);
        toggles().forEach(t => expect(t.getAttribute("aria-expanded")).toBe("false"));

        // The add button's text is at LegalEntityEditor.tsx:1961-1971 ("+ Add legal requirement").
        fireEvent.click(screen.getByRole("button", { name: /\+ Add legal requirement/i }));

        const all = toggles();
        expect(all).toHaveLength(3);
        expect(all[2].getAttribute("aria-expanded")).toBe("true");

    });

    // The head every folding card shares (.fold-card-head): the name
    // as text after the number, the rest on a row of its own under it.
    it("shows a folded requirement's name in its head and the rest under it", () => {

        function NamedHarness() {
            const [value, setValue] = useState<unknown>({
                ...asLegalEntityValue(undefined),
                requirements: [{ ...createLegalEntityRequirement(), name: "Publication", reference: "NY LLC Law 206" }]
            });
            return <LegalEntityEditor value={value} onChange={setValue} />;
        }

        render(<NamedHarness />);

        const name = screen.getByText("Publication");
        const summary = screen.getByText("NY LLC Law 206");

        expect(name.classList.contains("strategy-name-static")).toBe(true);
        expect(name.parentElement!.classList.contains("fold-card-head")).toBe(true);
        expect(summary.parentElement).toBe(name.parentElement);
        expect(name.parentElement!.lastElementChild).toBe(summary);

    });

});

describe("LegalEntityEditor number limits", () => {


    function FoundersHarness() {
        const [value, setValue] = useState<unknown>({
            ...asLegalEntityValue(undefined),
            capitalApplies: true,
            formation: { status: "registered", date: "", authority: "", registrationNumber: "" },
            founders: [
                { id: "a", name: "A", ownership: "", capital: "", roles: [""] },
                { id: "b", name: "B", ownership: "", capital: "", roles: [""] }
            ]
        });
        return <LegalEntityEditor value={value} onChange={setValue} />;
    }

    it("takes ownership to three decimals, and no minus sign in capital", () => {

        render(<FoundersHarness />);

        const ownership = screen.getByLabelText("Founder 1 ownership percentage") as HTMLInputElement;
        typeInto(ownership, "33.3333");
        expect(ownership.value).toBe("33.333");

        const capital = screen.getByLabelText(/^Founder 1 .*capital/i) as HTMLInputElement;
        typeInto(capital, "-100");
        expect(capital.value).toBe("");

    });

    it("takes a Formation Date no later than today", () => {

        function Formed() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { country: "GB" }, formation: { registrationNumber: "16234587", date: "2026-03-02" } }));
            return <LegalEntityEditor value={value} onChange={setValue} />;
        }
        render(<Formed />);

        // The popup calendar refuses every day after today: two years past this year, no day can be chosen.
        const cell = screen.getByLabelText("Formation date").closest(".date-cell")!;
        fireEvent.click(cell.querySelector(".date-cell-calendar-button")!);
        for (let i = 0; i < new Date().getFullYear() - 2026 + 2; i++) fireEvent.click(screen.getByLabelText("Next year"));
        const days = [...cell.querySelectorAll<HTMLButtonElement>(".date-cell-popup-day")];
        expect(days.length).toBeGreaterThan(27);
        expect(days.every(day => day.disabled)).toBe(true);


    });

});

describe("LegalEntityEditor founders & ownership", () => {

    function FoundersHarness() {
        const [value, setValue] = useState<unknown>({
            ...asLegalEntityValue(undefined),
            capitalApplies: true,
            founders: [
                { id: "a", name: "A", ownership: "60", capital: "100", roles: ["Director"], experience: "Ten years." },
                { id: "b", name: "B", ownership: "40", capital: "", roles: [""] }
            ]
        });
        return <LegalEntityEditor value={value} onChange={setValue} />;
    }

    it("asks each founder's name, ownership and capital, and no longer roles or experience", () => {

        render(<FoundersHarness />);

        const heads = [...document.querySelectorAll(".legal-entity-founders > .legal-entity-column-head")].map(node => node.textContent?.trim());
        expect(heads).toEqual(["Name", "Ownership %", expect.stringMatching(/^Capital/)]);

        expect((screen.getByLabelText("Founder 1 name") as HTMLInputElement).value).toBe("A");
        expect((screen.getByLabelText("Founder 1 ownership percentage") as HTMLInputElement).value).toBe("60");
        expect((screen.getByLabelText(/^Founder 1 .*capital/i) as HTMLInputElement).value).toBe("100");
        expect(screen.getByRole("button", { name: "Remove founder 2" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "+ Add founder" })).toBeTruthy();

        expect(screen.queryByLabelText(/Founder \d roles/)).toBeNull();
        expect(screen.queryByLabelText(/experience/i)).toBeNull();
        expect(screen.queryByRole("button", { name: /experience/i })).toBeNull();

    });

    it("keeps roles and experience saved before, for the Founders Profile to take", () => {

        const entity = asLegalEntityValue({ founders: [{ id: "a", name: "A", ownership: "100", capital: "", roles: ["Director"], experience: "Ten years." }] });
        expect(entity.founders[0].roles).toEqual(["Director"]);
        expect(entity.founders[0].experience).toBe("Ten years.");

        // The founders' subsection is answered by a name alone.
        expect(legalEntitySectionsEmpty(entity)[1]).toBe(false);
        expect(legalEntitySectionsEmpty(asLegalEntityValue({ founders: [{ id: "a", name: "", roles: ["Director"] }] }))[1]).toBe(true);

    });

    // A one-owner form clears the rows nobody answered -- never one
    // holding a profile, or the roles a row saved before still carries.
    it("never clears a founder with a profile when a one-owner form is chosen", () => {

        let saved: unknown;

        function SoleHarness() {
            const [value, setValue] = useState<unknown>({
                ...asLegalEntityValue(undefined),
                organisation: { ...asLegalEntityValue(undefined).organisation, country: "AU" },
                founders: [
                    { id: "a", name: "A", ownership: "", capital: "", roles: [""] },
                    { id: "legacy", name: "", ownership: "", capital: "", roles: ["Director"] },
                    { id: "empty", name: "", ownership: "", capital: "", roles: [""] },
                    { id: "profiled", name: "", ownership: "", capital: "", roles: [""] }
                ]
            });
            return (
                <LegalEntityEditor
                    value={value}
                    onChange={(next) => { saved = next; setValue(next); }}
                    foundersProfile={{ founders: [{ id: "profiled", roles: [""], skills: ["Accounting"] }] }}
                />
            );
        }

        render(<SoleHarness />);

        fireEvent.click(screen.getAllByRole("button", { name: /^Legal Form/ }).find(button => button.classList.contains("option-picker-trigger"))!);
        fireEvent.click(screen.getByRole("option", { name: "Sole Trader" }));

        expect(asLegalEntityValue(saved).founders.map(founder => founder.id)).toEqual(["a", "legacy", "profiled"]);

    });

});

describe("LegalEntityEditor chained answers", () => {

    function ChainHarness({ initial }: { initial: unknown }) {
        const [value, setValue] = useState<unknown>(initial);
        return <LegalEntityEditor value={value} onChange={setValue} />;
    }

    it("freezes where the organization is, its legal form and its registration authority until a country is chosen, keeping what they hold", () => {

        const empty = asLegalEntityValue(undefined);
        render(<ChainHarness initial={{ ...empty, organisation: { ...empty.organisation, city: "Leeds" } }} />);

        const address = screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement;
        expect(address.closest("fieldset")?.disabled).toBe(true);
        expect(address.value).toBe("Leeds");
        expect((screen.getByRole("textbox", { name: "Registration Authority" }) as HTMLInputElement).closest("fieldset")?.disabled).toBe(true);
        expect((screen.getByRole("textbox", { name: "Legal Form" }) as HTMLInputElement).closest("fieldset")?.disabled).toBe(true);
        expect(screen.getAllByText("Choose a country first.").length).toBeGreaterThanOrEqual(2);

        fireEvent.click(screen.getByRole("button", { name: /^Country/ }));
        fireEvent.click(screen.getByRole("option", { name: "United Kingdom" }));

        expect((screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement).closest("fieldset")?.disabled).toBe(false);
        expect((screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement).value).toBe("Leeds");
        expect(screen.queryByText("Choose a country first.")).toBeNull();

    });

});

describe("a Legal Entity requirement's or expense's name", () => {

    it("is edited in the card's head, beside its number, and wraps and grows as every card's name does", () => {
        render(<Harness />);
        fireEvent.click(screen.getByRole("button", { name: /\+ Add legal requirement/i }));
        const name = screen.getByRole("textbox", { name: "Legal requirement 3 name" });
        expect(name.tagName).toBe("TEXTAREA");
        expect(name.classList.contains("card-name-input")).toBe(true);
        expect(name.closest(".fold-card-head")).toBeTruthy();
        expect(screen.queryByText("Name", { selector: ".field-label, .legal-entity-label" })).toBeNull();
        // Still one line of data.
        fireEvent.change(name, { target: { value: "Companies House\nincorporation" } });
        expect((screen.getByRole("textbox", { name: "Legal requirement 3 name" }) as HTMLTextAreaElement).value).toBe("Companies House incorporation");
    });

});

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

describe("LegalEntityEditor where it is", () => {

    function Where({ initial }: { initial: unknown }) {
        const [value, setValue] = useState<unknown>(initial);
        return <LegalEntityEditor value={value} onChange={setValue} />;
    }

    it("asks Country, then one Address box of lines holding the street, city and postcode saved before", () => {

        const saved = asLegalEntityValue({
            organisation: { country: "GB", mainActivity: "Weaving", addressLine1: "Unit 4", addressLine2: "92 Wallis Road", city: "London", postalCode: "E9 5LN" }
        });
        render(<Where initial={saved} />);

        const column = document.querySelector(".legal-entity-grid-organization > .legal-entity-field")!;
        expect(screen.queryByRole("textbox", { name: "City" })).toBeNull();
        expect(screen.queryByRole("textbox", { name: "Postcode" })).toBeNull();

        const address = screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement;
        expect(address.tagName).toBe("TEXTAREA");
        expect(address.value).toBe("Unit 4\n92 Wallis Road\nLondon\nE9 5LN");
        // The lines expected, in the country's words.
        expect(address.placeholder).toBe("City\nStreet and Postcode");
        expect(screen.queryByRole("button", { name: /Add Address 2/i })).toBeNull();
        expect(screen.queryByRole("textbox", { name: "Address 2" })).toBeNull();

        // Country comes first of the pickers, the Address after it (the Legal Form, the Description and the Business stage follow).
        const country = column.querySelector(".option-picker-trigger")!;
        expect(country.getAttribute("aria-label") ?? country.textContent).toContain("Kingdom");
        expect(country.compareDocumentPosition(address) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    });

    it("names a US address's code the ZIP Code, and a UAE address none", () => {

        const { unmount } = render(<Where initial={asLegalEntityValue({ organisation: { country: "US" } })} />);
        expect((screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement).placeholder).toBe("City\nStreet and ZIP Code");
        unmount();

        render(<Where initial={asLegalEntityValue({ organisation: { country: "AE" } })} />);
        expect((screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement).placeholder).toBe("City\nStreet");

    });

    it("asks the activities in the Performer pattern: the + in the first row, the x in the others, and only the primary required", async () => {

        render(<Where initial={asLegalEntityValue({ organisation: { country: "GB" } })} />);

        const list = document.querySelector(".legal-entity-activities")!;
        // One row to start with, the primary one, open, with the "+" in its x column.
        expect(list.querySelectorAll(".business-capability-performer")).toHaveLength(1);
        expect(screen.getByText("Primary")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Add activity" })).toBeTruthy();
        expect(screen.queryByRole("button", { name: /^Remove .* activity$/ })).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Add activity" }));
        expect(list.querySelectorAll(".business-capability-performer")).toHaveLength(2);
        expect(screen.getByText("Secondary")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Remove secondary activity" })).toBeTruthy();
        // The "i" says which is required, and names the country's code.
        fireEvent.click(screen.getByRole("button", { name: /Activities/ }));
        expect(document.body.textContent).toContain("The primary activity is required; the others are optional, up to four in all.");
        expect(document.body.textContent).toContain("(the SIC code)");

    });

    it("names every level as the country's own scheme does, the first level too (Sector and Subsector in the United States)", async () => {

        render(<Where initial={asLegalEntityValue({ organisation: { country: "US", activities: [{ code: "541512", edition: "2022" }] } })} />);
        fireEvent.click(screen.getByRole("button", { name: "Maximize primary activity" }));
        for (const level of ["Sector", "Subsector", "Industry group", "NAICS industry", "National industry"]) {
            expect(await screen.findByText(level)).toBeTruthy();
        }
        expect(screen.queryByText("Industry")).toBeNull();
        // (Every level's entry is printed as the official document prints it, the code first: 54, 541, 5415, 54151, 541512.)
        for (const [level, code] of [["Sector", "54"], ["Subsector", "541"], ["Industry group", "5415"], ["NAICS industry", "54151"], ["National industry", "541512"]]) {
            expect(screen.getAllByRole("button", { name: new RegExp("^" + level + " of the primary activity") })[0].textContent).toMatch(new RegExp("^" + code + " "));
        }

    });

    it("makes no expense when the founders' capital is switched on: only a requirement's own tick makes one", () => {

        function Capital() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({
                organisation: { country: "US", legalForm: "Sole Proprietorship" },
                requirements: [{ ...createLegalEntityRequirement(), name: "Certificate of Assumed Name", type: "additional", offerInExpenses: true }],
                expenses: [{ ...createLegalEntityExpense(), name: "Certificate of Assumed Name filing" }]
            }));
            return <><LegalEntityEditor value={value} onChange={setValue} /><output data-testid="expenses">{asLegalEntityValue(value).expenses.map(expense => expense.name).join("|")}</output></>;
        }
        render(<Capital />);
        expect(screen.getByTestId("expenses").textContent).toBe("Certificate of Assumed Name filing");
        fireEvent.click(screen.getByRole("checkbox", { name: /Founders contribute capital/ }));
        expect(screen.getByTestId("expenses").textContent).toBe("Certificate of Assumed Name filing");

    });

    it("takes up to four activities: the + goes at four", () => {

        render(<Where initial={asLegalEntityValue({ organisation: { country: "GB" } })} />);
        for (let count = 1; count < 4; count++) {
            fireEvent.click(screen.getByRole("button", { name: "Add activity" }));
        }
        expect(document.querySelectorAll(".legal-entity-activities .business-capability-performer")).toHaveLength(4);
        expect(screen.queryByRole("button", { name: "Add activity" })).toBeNull();
        expect(screen.getByText("Quaternary")).toBeTruthy();

    });

    it("folds a finished activity to its code (with the scheme's initials) and its last category, and shows the saved ones folded", async () => {

        render(<Where initial={asLegalEntityValue({ organisation: { country: "GB", activities: [{ code: "62012", edition: "2007" }] } })} />);

        expect(screen.getByText("SIC 62012")).toBeTruthy();
        expect(await screen.findByText("Business and domestic software development")).toBeTruthy();
        // Folded: no dropdown of the cascade; the arrow opens it.
        expect(screen.queryByText("Section")).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Maximize primary activity" }));
        expect(await screen.findByText("Section")).toBeTruthy();

    });

    it("saves only the final code, and a change of country empties every activity", async () => {

        function Saved() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { country: "GB", activities: [{ code: "62012", edition: "2007" }] } }));
            return <><LegalEntityEditor value={value} onChange={setValue} /><output data-testid="saved">{JSON.stringify((asLegalEntityValue(value) as { organisation: { activities: unknown } }).organisation.activities)}</output></>;
        }
        render(<Saved />);
        expect(screen.getByTestId("saved").textContent).toBe('[{"code":"62012","edition":"2007"}]');

        fireEvent.click(screen.getAllByRole("button", { name: /^Country/ }).find(button => button.classList.contains("option-picker-trigger"))!);
        fireEvent.click(await screen.findByRole("option", { name: "Ireland" }));
        expect(screen.getByTestId("saved").textContent).toBe("[]");
        expect(screen.queryByText("SIC 62012")).toBeNull();

    });

});

describe("LegalEntityEditor formation row", () => {

    function Formation({ initial }: { initial: unknown }) {
        const [value, setValue] = useState<unknown>(initial);
        return <LegalEntityEditor value={value} onChange={setValue} />;
    }

    it("puts the Registration Date on the Organization tile, left of the Opening Date, whether or not a registration number is given", () => {

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

describe("LegalEntityEditor organization columns", () => {

    it("keeps where the organization is on the left (name, country, address) and what it is and does on the right (Legal Form, Opening Date, Activities) with the Description below both, with no Customer or Market type", () => {

        function Org() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { country: "GB", mainActivity: "Weaving" } }));
            return <LegalEntityEditor value={value} onChange={setValue} />;
        }
        render(<Org />);

        const grid = document.querySelector("[data-anchor='legal-section-0'] .legal-entity-grid")!;
        const columns = [...grid.children].filter(child => child.classList.contains("legal-entity-field"));
        expect(columns).toHaveLength(2);
        const labels = (column: Element) => [...column.querySelectorAll(".field-label")].map(label => label.textContent?.replace(/\s+/g, " ").replace(/i$/, "").trim());
        expect(labels(columns[0])).toEqual(["Organization Name", "Country", "Address"]);
        expect(columns[1].classList.contains("legal-entity-questions")).toBe(true);
        expect(labels(columns[1])).toEqual(["Legal Form", "Registration Date", "Opening Date", "Activities", "Primary"]);
        // The Description stands below both columns, after a divider line.
        const below = document.querySelector("[data-anchor='legal-section-0'] .legal-entity-org-body > .legal-entity-org-description")!;
        expect(below.textContent).toContain("Notes");
        expect(below.querySelector("input[type=checkbox]")).toBeTruthy();
        expect(below.previousElementSibling?.getAttribute("role")).toBe("separator");
        expect(grid.textContent).not.toContain("Customer type");
        expect(grid.textContent).not.toContain("Market type");

    });

});

/** The stage a test names ("" or planning where none is given). */
function stageKey(stage: string): "plan" | "launch" | "manage" | "grow" {
    return stage === "launch" || stage === "manage" || stage === "grow" ? stage : "plan";
}

describe("LegalEntityEditor Early Positioning questions", () => {

    it("asks the market structure, the seller and buyer relationship, the audience and the outcome, one choice each, and the audience follows the model", () => {

        let saved: ReturnType<typeof asLegalEntityValue> | null = null;
        function Audience() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { customerType: "b2b", audience: "smb" } }));
            return <LegalEntityEditor value={value} audienceOnly onChange={next => { saved = asLegalEntityValue(next); setValue(next); }} />;
        }
        render(<Audience />);

        expect(screen.getByRole("radiogroup", { name: "Market Structure" })).toBeTruthy();
        expect(screen.getByRole("radiogroup", { name: "Seller and Buyer Relationship" })).toBeTruthy();
        expect(screen.getByRole("radiogroup", { name: "Audience Specialization & Scale" })).toBeTruthy();
        expect(screen.getByRole("radiogroup", { name: "Differentiation & Outcome" })).toBeTruthy();
        expect((screen.getByRole("radio", { name: "Startups & SMBs" }) as HTMLInputElement).checked).toBe(true);

        // A consumer market has life stages, not scales, and the old audience goes.
        fireEvent.click(screen.getByRole("radio", { name: "B2C (Business-to-Consumer)" }));
        expect(screen.getByRole("radiogroup", { name: "Buyer's Life-Stage and relationship with the User" })).toBeTruthy();
        expect(screen.queryByRole("radio", { name: "Startups & SMBs" })).toBeNull();
        expect(saved!.organisation.audience).toEqual([]);

        fireEvent.click(screen.getByRole("radio", { name: "Seniors" }));
        fireEvent.click(screen.getByRole("radio", { name: "Convenience-driven" }));
        fireEvent.click(screen.getByRole("radio", { name: "Multi-sided Market / Platform" }));
        expect(saved!.organisation).toMatchObject({ customerType: ["b2c"], audience: ["senior"], outcome: ["convenience"], marketType: "multi" });

    });

});

describe("LegalEntityEditor Early Positioning limits by business stage", () => {

    function Stage({ stage, start }: { stage: string; start?: Record<string, unknown> }) {
        const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { businessStage: stage, customerType: ["b2b"], ...start } }));
        return <LegalEntityEditor value={value} businessStage={stageKey(stage)} audienceOnly onChange={setValue} />;
    }

    it("takes one choice while planning and launching, two in the outcome from launching, two in each while managing: the others locked, a note beside the label", () => {

        // Planning: radios, no limit note.
        const planning = render(<Stage stage="plan" />);
        expect(screen.getAllByRole("radio", { name: /Convenience-driven/ })).toHaveLength(1);
        expect(planning.container.querySelector(".business-foundation-tick-note")).toBeNull();
        cleanup();

        // Launching: one relationship, up to two outcomes (ticks, "2 max").
        const launching = render(<Stage stage="launch" />);
        expect(screen.getByRole("radio", { name: "B2B (Business-to-Business)" })).toBeTruthy();
        const outcomes = screen.getByRole("group", { name: "Differentiation & Outcome" });
        const ticks = () => [...outcomes.querySelectorAll("input[type=checkbox]")] as HTMLInputElement[];
        fireEvent.click(ticks()[0]);
        fireEvent.click(ticks()[1]);
        expect(ticks().map(tick => tick.disabled)).toEqual([false, false, true, true]);
        expect([...launching.container.querySelectorAll(".business-foundation-tick-note")].map(note => note.textContent)).toEqual(["2 max"]);
        // A ticked one is never locked: unticking frees the others.
        fireEvent.click(ticks()[0]);
        expect(ticks().map(tick => tick.disabled)).toEqual([false, false, false, false]);
        cleanup();

        // Managing: two relationships as well; the third is locked.
        render(<Stage stage="manage" />);
        const relationships = screen.getByRole("group", { name: "Seller and Buyer Relationship" });
        fireEvent.click(screen.getByRole("checkbox", { name: /B2C/ }));
        expect([...relationships.querySelectorAll("input[type=checkbox]")].map(tick => (tick as HTMLInputElement).disabled)).toEqual([false, false, true, true]);
        // Both a business and a consumer buyer: both audience questions.
        expect(screen.getByRole("group", { name: "Audience Specialization & Scale" })).toBeTruthy();
        expect(screen.getByRole("group", { name: "Buyer's Life-Stage and relationship with the User" })).toBeTruthy();
        cleanup();

        // Growing: any number, no locks, no note.
        const growing = render(<Stage stage="grow" />);
        for (const tick of [...screen.getByRole("group", { name: "Differentiation & Outcome" }).querySelectorAll("input[type=checkbox]")]) fireEvent.click(tick);
        expect([...screen.getByRole("group", { name: "Differentiation & Outcome" }).querySelectorAll("input[type=checkbox]")].every(tick => (tick as HTMLInputElement).checked && !(tick as HTMLInputElement).disabled)).toBe(true);
        expect(growing.container.querySelector(".business-foundation-tick-note")).toBeNull();

    });

    it("reads an older answer: one id, or \"both\" as business-to-business and business-to-consumer", () => {

        const value = asLegalEntityValue({ organisation: { customerType: "both", audience: "smb", outcome: "cost" } });
        expect(value.organisation.customerType).toEqual(["b2b", "b2c"]);
        expect(value.organisation.audience).toEqual(["smb"]);
        expect(value.organisation.outcome).toEqual(["cost"]);

    });

});

/** The Early Positioning questions of one seller and buyer relationship, at a business stage (planning where none is given). */
function Model({ model, saved, stage }: { model: string; saved?: { current: ReturnType<typeof asLegalEntityValue> | null }; stage?: string }) {
    const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { customerType: [model], businessStage: stage ?? "plan" } }));
    return <LegalEntityEditor value={value} businessStage={stageKey(stage ?? "plan")} audienceOnly onChange={next => { if (saved) saved.current = asLegalEntityValue(next); setValue(next); }} />;
}

describe("LegalEntityEditor Early Positioning: the government and the compliance context", () => {

    it("asks a public buyer its jurisdiction scale, then the one last question every model ends with", () => {

        render(<Model model="b2g" />);
        expect(screen.getByRole("radiogroup", { name: "Administrative Level (Jurisdiction Scale)" })).toBeTruthy();
        expect(screen.getByRole("radiogroup", { name: "Differentiation & Outcome" })).toBeTruthy();
        expect(screen.queryByRole("radiogroup", { name: "Audience Specialization & Scale" })).toBeNull();
        expect(screen.getByRole("radio", { name: "Local Government" })).toBeTruthy();
        expect(screen.getByRole("radio", { name: "Regional Administration" })).toBeTruthy();

    });

    it("asks the compliance context the regulatory intensity of the industry, and keeps the outcome when the model changes", () => {

        const saved: { current: ReturnType<typeof asLegalEntityValue> | null } = { current: null };
        render(<Model model="g2b" stage="grow" saved={saved} />);
        expect(screen.getByRole("group", { name: "Regulatory Intensity of the target industry" })).toBeTruthy();
        fireEvent.click(screen.getByRole("checkbox", { name: /Heavily Regulated Markets/ }));
        fireEvent.click(screen.getByRole("checkbox", { name: /Compliance, Risk & Security/ }));
        expect(saved.current!.organisation).toMatchObject({ customerType: ["g2b"], audience: ["heavy"], outcome: ["compliance"] });

        // Another model: the answer of a question no longer asked goes (the audience), the last question's stays.
        fireEvent.click(screen.getByRole("checkbox", { name: /Relationship: B2C/ }));
        expect(saved.current!.organisation).toMatchObject({ customerType: ["b2c", "g2b"], audience: ["heavy"], outcome: ["compliance"] });
        fireEvent.click(screen.getByRole("checkbox", { name: /Relationship: G2B/ }));
        expect(saved.current!.organisation).toMatchObject({ customerType: ["b2c"], audience: [], outcome: ["compliance"] });

    });

});

describe("LegalEntityEditor Early Positioning: what the stages lock for the government and the compliance context", () => {

    const locked = (name: string) => (screen.getByRole("radio", { name }) as HTMLInputElement).disabled;

    it("locks the central government and the heavily regulated markets while planning and launching, and opens everything from managing", () => {

        for (const stage of ["plan", "launch"]) {
            render(<Model model="b2g" stage={stage} />);
            expect(["Local Government", "Regional Administration", "Institutional / Public Organizations", "Central Government & Ministries"].map(locked)).toEqual([false, false, false, true]);
            cleanup();
            render(<Model model="g2b" stage={stage} />);
            expect(["General Commerce / Mass Market", "Specialized Sectors", "Cross-border Trade", "Heavily Regulated Markets"].map(locked)).toEqual([false, false, false, true]);
            cleanup();
        }

        for (const stage of ["manage", "grow"]) {
            render(<Model model="b2g" stage={stage} />);
            expect(screen.getAllByRole("checkbox").some(box => (box as HTMLInputElement).disabled)).toBe(false);
            cleanup();
        }

    });

});

describe("LegalEntityEditor Early Positioning: the sides of a platform", () => {

    function Sides({ market, stage }: { market: string; stage: string }) {
        const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { customerType: ["b2c", "b2b"], marketType: market, businessStage: stage } }));
        return <LegalEntityEditor value={value} businessStage={stageKey(stage)} audienceOnly onChange={setValue} />;
    }

    it("asks the last question once for each side of a platform while managing and growing, and once otherwise", () => {

        render(<Sides market="multi" stage="manage" />);
        expect(screen.getByRole("group", { name: "Differentiation & Outcome (B2C)" })).toBeTruthy();
        expect(screen.getByRole("group", { name: "Differentiation & Outcome (B2B)" })).toBeTruthy();
        expect(screen.queryByRole("group", { name: "Differentiation & Outcome" })).toBeNull();
        cleanup();

        // The same two models in a single-sided market: one hybrid, one last question.
        render(<Sides market="single" stage="manage" />);
        expect(screen.getByRole("group", { name: "Differentiation & Outcome" })).toBeTruthy();
        expect(screen.queryByRole("group", { name: "Differentiation & Outcome (B2C)" })).toBeNull();
        cleanup();

        // Planning and launching keep to the anchor side: one model, one last question.
        render(<Sides market="multi" stage="launch" />);
        expect(screen.queryByRole("group", { name: "Differentiation & Outcome (B2C)" })).toBeNull();

    });

});

describe("The name of the positioning tile follows the business stage", () => {

    it("is Early Positioning while planning and launching (and before a stage is chosen), Core Market Positioning while managing, Corporate & Portfolio Positioning while growing", () => {

        expect(["", "plan", "launch"].map(positioningName)).toEqual(["Early Positioning", "Early Positioning", "Early Positioning"]);
        expect(positioningName("manage")).toBe("Core Market Positioning");
        expect(positioningName("grow")).toBe("Corporate & Portfolio Positioning");

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
        for (const arrow of screen.queryAllByRole("button", { name: /^Maximize/ })) {
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
        for (const arrow of screen.queryAllByRole("button", { name: /^Maximize/ })) {
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
        for (const arrow of screen.queryAllByRole("button", { name: /^Maximize/ })) {
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
        for (const arrow of screen.queryAllByRole("button", { name: /^Maximize/ })) {
            fireEvent.click(arrow);
        }
        expect(screen.getAllByText("Notes").length).toBeGreaterThan(0);
        expect(screen.queryByText("Relevant Information", { exact: true })).toBeNull();
    });

});


describe("LegalEntityEditor as tiles", () => {

    function Tiled() {
        const [value, setValue] = useState<unknown>(asLegalEntityValue({ expenses: [{ ...createLegalEntityExpense(), name: "Filing fee" }] }));
        return <LegalEntityEditor value={value} onChange={setValue} asTiles />;
    }

    it("is three large tiles: Founders & Ownership, Registrations and Expenses (the Organization is a tile of page 1)", () => {
        render(<Tiled />);
        expect([...document.querySelectorAll(".section-tile")].map(tile => tile.getAttribute("data-tile"))).toEqual([
            "legal-entity-founders", "legal-entity-registrations", "legal-entity-expenses"
        ]);
    });

    it("opens a one-owner form's founder card straight: the name a cell, the capital an optional tick beside it that takes only a figure, no number, no ownership table", () => {

        function Sole() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({
                organisation: { country: "US", legalForm: "Sole Proprietorship" },
                founders: [{ ...createLegalEntityFounder(), name: "Jordan Ellis", ownership: "100" }]
            }));
            return <><LegalEntityEditor value={value} onChange={setValue} asTiles onChangeFoundersProfile={() => undefined} /><output data-testid="capital">{String(asLegalEntityValue(value).capitalApplies) + ":" + asLegalEntityValue(value).founders[0].capital}</output></>;
        }
        render(<Sole />);
        fireEvent.click(document.querySelector("[data-tile=legal-entity-founders]")!);

        expect((screen.getByRole("textbox", { name: "Founder 1 name" }) as HTMLTextAreaElement).value).toBe("Jordan Ellis");
        // (No number before the name, no ownership table, no "founders contribute capital" tick: one owner, the whole of it.)
        expect(document.querySelector(".section-tile-dialog .legal-entity-card-number, .column-tile-content .legal-entity-card-number")).toBeNull();
        expect(screen.queryByRole("checkbox", { name: /Founders contribute capital/ })).toBeNull();
        expect(screen.queryByRole("textbox", { name: /ownership percentage/ })).toBeNull();
        // The capital is optional: a tick box with its word, the cell only once ticked.
        expect(screen.queryByRole("textbox", { name: "Founder 1 Capital ($)" })).toBeNull();
        fireEvent.click(screen.getByRole("checkbox", { name: /Capital \(\$\)/ }));
        const cell = screen.getByRole("textbox", { name: "Founder 1 Capital ($)" });
        expect(screen.getByTestId("capital").textContent).toBe("false:");
        // It takes a figure only: letters are refused, and the box keeps what it had.
        fireEvent.change(cell, { target: { value: "gvch" } });
        expect(screen.getByTestId("capital").textContent).toBe("false:");
        fireEvent.change(cell, { target: { value: "5000" } });
        expect(screen.getByTestId("capital").textContent).toBe("true:5000");
        fireEvent.change(cell, { target: { value: "5000x" } });
        expect(screen.getByTestId("capital").textContent).toBe("true:5000");
        // Unticked, the capital goes and is no longer asked of anyone.
        fireEvent.click(screen.getByRole("checkbox", { name: /Capital \(\$\)/ }));
        expect(screen.getByTestId("capital").textContent).toBe("false:");

    });

    it("opens a box for each expense, with the add box, in its section's dialog", () => {
        render(<Tiled />);
        fireEvent.click(document.querySelector("[data-tile=legal-entity-expenses]")!);
        expect(screen.getByRole("button", { name: /Expense 1: Filing fee/ })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Add Card" })).toBeTruthy();
    });

    it("opens the Registrations as two sub tiles: Registration Numbers (the formation's and the tax's), Additional legal requirements", () => {
        render(<Tiled />);
        fireEvent.click(document.querySelector("[data-tile=legal-entity-registrations]")!);
        expect([...document.querySelectorAll(".section-tile-dialog .section-tile")].map(tile => tile.getAttribute("data-tile"))).toEqual(["registration-numbers", "requirements"]);
        fireEvent.click(document.querySelector("[data-tile=requirements]")!);
        expect(screen.getByRole("button", { name: "Add Card" })).toBeTruthy();
    });

});

describe("LegalEntityEditor Early Positioning: the End User of Proxy Buyers / Gifters", () => {

    it("asks the four End User questions only for Proxy Buyers / Gifters, and drops their answers with it", () => {

        const saved: { current: ReturnType<typeof asLegalEntityValue> | null } = { current: null };
        render(<Model model="b2c" stage="manage" saved={saved} />);
        expect(screen.queryByRole("group", { name: "End User Age Group" })).toBeNull();

        fireEvent.click(screen.getByRole("checkbox", { name: /Proxy Buyers/ }));
        expect(screen.getByRole("group", { name: "End User Age Group" })).toBeTruthy();
        expect(screen.getByRole("group", { name: "Buyer's relationship with the End User" })).toBeTruthy();
        expect(screen.getByRole("radiogroup", { name: "Who chooses: the Buyer or the End User" })).toBeTruthy();
        expect(screen.getByRole("group", { name: "What matters most to the End User" })).toBeTruthy();

        fireEvent.click(screen.getByRole("checkbox", { name: /Children \(6 to 12\)/ }));
        fireEvent.click(screen.getByRole("radio", { name: "The End User asks, the Buyer approves" }));
        expect(saved.current!.organisation.endUser).toEqual(["age:child", "decides:asks"]);

        // Another life stage: the End User is no longer asked, and its answers go.
        fireEvent.click(screen.getByRole("checkbox", { name: /Proxy Buyers/ }));
        expect(saved.current!.organisation.endUser).toEqual([]);
        expect(screen.queryByRole("group", { name: "End User Age Group" })).toBeNull();

    });

    it("limits the End User's age groups by the stage, as the audience is limited", () => {

        render(<Model model="b2c" stage="plan" />);
        fireEvent.click(screen.getByRole("radio", { name: /Proxy Buyers/ }));
        // While planning each question is one choice: a radio.
        expect(screen.getByRole("radiogroup", { name: "End User Age Group" })).toBeTruthy();
        expect(screen.getByRole("radiogroup", { name: "What matters most to the End User" })).toBeTruthy();

    });

});
