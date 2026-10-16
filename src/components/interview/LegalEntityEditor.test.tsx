import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import LegalEntityEditor from "./LegalEntityEditor";
import { typeInto } from "../../test/interviewTestUtils";
import { stylesheet } from "../../test/stylesheet";
import { asLegalEntityValue, createLegalEntityExpense, createLegalEntityRequirement, legalEntitySectionsEmpty } from "../../framework/engine/AnswerUtils";

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

        const column = document.querySelector(".legal-entity-where")!;
        expect(screen.queryByRole("textbox", { name: "City" })).toBeNull();
        expect(screen.queryByRole("textbox", { name: "Postcode" })).toBeNull();

        const address = screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement;
        expect(address.tagName).toBe("TEXTAREA");
        expect(address.value).toBe("Unit 4\n92 Wallis Road\nLondon\nE9 5LN");
        // The lines expected, in the country's words.
        expect(address.placeholder).toBe("City\nStreet and Postcode");
        expect(screen.queryByRole("button", { name: /Add Address 2/i })).toBeNull();
        expect(screen.queryByRole("textbox", { name: "Address 2" })).toBeNull();

        // Country comes first, the Address last.
        const order = [...column.querySelectorAll(".option-picker-trigger, input, textarea")];
        expect(order[0].classList.contains("option-picker-trigger")).toBe(true);
        expect(order[order.length - 1]).toBe(address);

    });

    it("names a US address's code the ZIP Code, and a UAE address none", () => {

        const { unmount } = render(<Where initial={asLegalEntityValue({ organisation: { country: "US" } })} />);
        expect((screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement).placeholder).toBe("City\nStreet and ZIP Code");
        unmount();

        render(<Where initial={asLegalEntityValue({ organisation: { country: "AE" } })} />);
        expect((screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement).placeholder).toBe("City\nStreet");

    });

    it("always shows the activity code as a tick row, and its box only while ticked (a saved code loads ticked)", () => {

        const { unmount } = render(<Where initial={asLegalEntityValue({ organisation: { country: "GB" } })} />);
        const tick = () => screen.getByRole("checkbox", { name: "Has a SIC code" }) as HTMLInputElement;
        expect(tick().checked).toBe(false);
        expect(screen.queryByRole("textbox", { name: "SIC code" })).toBeNull();
        fireEvent.click(tick());
        expect(screen.getByRole("textbox", { name: "SIC code" })).toBeTruthy();
        unmount();

        render(<Where initial={asLegalEntityValue({ organisation: { country: "GB", activityCode: "13100" } })} />);
        expect(tick().checked).toBe(true);
        expect((screen.getByRole("textbox", { name: "SIC code" }) as HTMLInputElement).value).toBe("13100");

    });

    it("asks the activity code under Main Activity at the small width, with a note and, in the UK, its official list", () => {

        render(<Where initial={asLegalEntityValue({ organisation: { country: "GB", mainActivity: "Weaving", activityCode: "13100" } })} />);

        const code = document.querySelector(".legal-entity-activity-code")!;
        expect(code.querySelector("input.interview-input")).toBeTruthy();
        fireEvent.click(code.querySelector("button")!);
        expect(document.body.textContent).toContain("classifies what the organization does");
        expect(document.querySelector('a[href*="gov.uk/government/publications/standard-industrial-classification"]')).toBeTruthy();

    });

    it("keeps the activity code's tick row a field gap under the Main Activity box, ticked or not", () => {

        // The column already puts a label gap between its children, so the row's margin is the rest of the 12px;
        // the row is as high as its content (the tick, or the 45px box beside it), never a fixed minimum.
        const css = stylesheet("conversation.css");
        expect(css).toMatch(/\.legal-entity-activity-code > \.legal-entity-activity-code-tick ?\{[^}]*margin-top: ?calc\(var\(--space-field\) - var\(--space-label\)\);[^}]*align-items: ?center;/);
        expect(css).not.toMatch(/\.legal-entity-activity-code > \.legal-entity-activity-code-tick ?\{[^}]*min-height/);

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

        render(<Formation initial={asLegalEntityValue({ organisation: { country: "GB" }, formation: { date: "2026-03-02", registrationNumber: "16234587" } })} />);

        // (There is no Status to show: the number registers it. The date shows once there is a number.)
        const row = document.querySelector(".legal-entity-date-row")!;
        const fields = [...row.children];
        expect(fields).toHaveLength(1);
        expect(screen.queryByLabelText("Registration status")).toBeNull();
        expect(fields[0].querySelector(".date-cell")).toBeTruthy();
        expect(fields[0].textContent).toContain("Date");

        fireEvent.change(screen.getByLabelText("Registration Number"), { target: { value: "" } });

        expect(document.querySelector(".legal-entity-date-row")?.children.length ?? 0).toBe(0);
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
        expect(screen.getAllByText("Description / Relevant Information").length).toBeGreaterThan(0);
        expect(screen.queryByText("Relevant Information", { exact: true })).toBeNull();
    });

});


describe("LegalEntityEditor as tiles", () => {

    function Tiled() {
        const [value, setValue] = useState<unknown>(asLegalEntityValue({ expenses: [{ ...createLegalEntityExpense(), name: "Filing fee" }] }));
        return <LegalEntityEditor value={value} onChange={setValue} asTiles />;
    }

    it("is four large tiles: Organization, Founders & Ownership, Registrations and Expenses", () => {
        render(<Tiled />);
        expect([...document.querySelectorAll(".section-tile")].map(tile => tile.getAttribute("data-tile"))).toEqual([
            "legal-entity-organization", "legal-entity-founders", "legal-entity-registrations", "legal-entity-expenses"
        ]);
    });

    it("opens a box for each expense, with the add box, in its section's dialog", () => {
        render(<Tiled />);
        fireEvent.click(document.querySelector("[data-tile=legal-entity-expenses]")!);
        expect(screen.getByRole("button", { name: /Expense 1: Filing fee/ })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Add Card" })).toBeTruthy();
    });

    it("opens the Registrations as three sub tiles: Formation & registration, Tax & business registration, Additional legal requirements", () => {
        render(<Tiled />);
        fireEvent.click(document.querySelector("[data-tile=legal-entity-registrations]")!);
        expect([...document.querySelectorAll(".section-tile-dialog .section-tile")].map(tile => tile.getAttribute("data-tile"))).toEqual(["formation", "tax", "requirements"]);
        fireEvent.click(document.querySelector("[data-tile=requirements]")!);
        expect(screen.getByRole("button", { name: "Add Card" })).toBeTruthy();
    });

});
