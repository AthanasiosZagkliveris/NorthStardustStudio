import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import LegalEntityEditor from "./LegalEntityEditor";
import { typeInto } from "../../test/interviewTestUtils";
import { asLegalEntityValue, createLegalEntityRequirement, legalEntitySectionsEmpty } from "../../framework/engine/AnswerUtils";

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

    it("allows a Formation Date up to five years ahead", () => {

        render(<FoundersHarness />);

        const today = new Date();
        const limit = new Date(today.getFullYear() + 5, today.getMonth(), today.getDate());
        const iso = limit.getFullYear() + "-" + String(limit.getMonth() + 1).padStart(2, "0") + "-" +
            String(limit.getDate()).padStart(2, "0");

        expect(screen.getByLabelText("Formation date").getAttribute("max")).toBe(iso);

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
        expect((screen.getByLabelText("Registration Authority") as HTMLInputElement).value).toBe("UK Trade Mark");
        expect((screen.getByLabelText("Registration Number") as HTMLInputElement).value).toBe("UK00004012345");
        expect(screen.queryByRole("button", { name: "Remove registration number 1" })).toBeNull();

        fireEvent.click(screen.getByRole("button", { name: "Remove registration number" }));
        expect((screen.getByLabelText("Registration Authority") as HTMLInputElement).value).toBe("");
        expect((screen.getByLabelText("Registration Number") as HTMLInputElement).value).toBe("");

    });

});

describe("LegalEntityEditor VAT", () => {

    it("asks one tick, its number beside it, and reads a saved \"not applicable\" as not registered", () => {

        const saved = asLegalEntityValue({ organisation: { country: "United Kingdom" }, tax: { consumptionTaxStatus: "not-applicable" } });
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
        expect(row.querySelector("input.interview-input")).toBeTruthy();

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

        const column = document.querySelector(".legal-entity-where")!;
        expect(screen.queryByRole("textbox", { name: "City" })).toBeNull();
        expect(screen.queryByRole("textbox", { name: "Postcode" })).toBeNull();

        const address = screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement;
        expect(address.tagName).toBe("TEXTAREA");
        expect(address.value).toBe("Unit 4\n92 Wallis Road\nLondon\nE9 5LN");
        // The lines expected, in the country's words.
        expect(address.placeholder).toBe("Street\nCity\nPostcode");
        expect(screen.queryByRole("button", { name: /Add Address 2/i })).toBeNull();
        expect(screen.queryByRole("textbox", { name: "Address 2" })).toBeNull();

        // Country comes first, the Address last.
        const order = [...column.querySelectorAll(".option-picker-trigger, input, textarea")];
        expect(order[0].classList.contains("option-picker-trigger")).toBe(true);
        expect(order[order.length - 1]).toBe(address);

    });

    it("names a US address's code the ZIP Code, and a UAE address none", () => {

        const { unmount } = render(<Where initial={asLegalEntityValue({ organisation: { country: "US" } })} />);
        expect((screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement).placeholder).toBe("Street\nCity\nZIP Code");
        unmount();

        render(<Where initial={asLegalEntityValue({ organisation: { country: "AE" } })} />);
        expect((screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement).placeholder).toBe("Street\nCity");

    });

    it("asks the activity code under Main Activity at the small width, with a note and, in the UK, its official list", () => {

        render(<Where initial={asLegalEntityValue({ organisation: { country: "GB", mainActivity: "Weaving" } })} />);

        const code = document.querySelector(".legal-entity-activity-code")!;
        expect(code.querySelector("input.interview-input")).toBeTruthy();
        fireEvent.click(code.querySelector("button")!);
        expect(document.body.textContent).toContain("classifies what the organization does");
        expect(document.querySelector('a[href*="gov.uk/government/publications/standard-industrial-classification"]')).toBeTruthy();

    });

    it("links no list where none is verified (the US)", () => {

        render(<Where initial={asLegalEntityValue({ organisation: { country: "US", mainActivity: "Automation" } })} />);

        const code = document.querySelector(".legal-entity-activity-code")!;
        fireEvent.click(code.querySelector("button")!);
        expect(document.body.textContent).toContain("classifies what the organization does");
        expect(document.querySelector('a[href*="census.gov"]')).toBeNull();

    });

});

describe("LegalEntityEditor formation row", () => {

    function Formation({ initial }: { initial: unknown }) {
        const [value, setValue] = useState<unknown>(initial);
        return <LegalEntityEditor value={value} onChange={setValue} />;
    }

    it("sets Status and Formation Date on one row, each label beside its control, and hides the date while not registered", () => {

        render(<Formation initial={asLegalEntityValue({ organisation: { country: "GB" }, formation: { status: "registered", date: "2026-03-02" } })} />);

        const row = document.querySelector(".legal-entity-side-row")!;
        const fields = [...row.children];
        expect(fields).toHaveLength(2);
        expect(fields[0].querySelector(".option-picker-trigger")).toBeTruthy();
        expect(fields[1].querySelector('input[type="date"]')).toBeTruthy();
        expect(fields[1].textContent).toContain("Date");

        fireEvent.click(screen.getByRole("button", { name: /^Registration status/ }));
        fireEvent.click(screen.getByRole("option", { name: "Not yet registered" }));

        expect(document.querySelector(".legal-entity-side-row")!.children).toHaveLength(1);
        expect(screen.queryByLabelText("Formation date")).toBeNull();
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

    it("asks what the organization is (Legal Form last, under the activity code) beside where it is, in two columns", () => {

        function Org() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { country: "GB", mainActivity: "Weaving" } }));
            return <LegalEntityEditor value={value} onChange={setValue} />;
        }
        render(<Org />);

        const grid = document.querySelector("[data-anchor='legal-section-0'] .legal-entity-grid")!;
        const columns = [...grid.children].filter(child => child.classList.contains("legal-entity-field"));
        expect(columns).toHaveLength(2);
        const what = columns[0];
        const controls = [...what.querySelectorAll(".option-picker-trigger, input, textarea")];
        expect(controls[controls.length - 1].closest(".legal-entity-legal-form")).toBeTruthy();
        expect(controls[controls.length - 2].closest(".legal-entity-activity-code")).toBeTruthy();
        expect(columns[1].classList.contains("legal-entity-where")).toBe(true);

    });

});
