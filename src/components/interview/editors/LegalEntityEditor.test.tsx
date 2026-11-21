import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import LegalEntityEditor, { foundersTileFace } from "./LegalEntityEditor";
import { typeInto } from "../../../test/interviewTestUtils";
import { asLegalEntityValue, createLegalEntityExpense, createLegalEntityFounder, createLegalEntityRequirement, legalEntitySectionsEmpty } from "../../../framework/engine/answers/AnswerUtils";
import lumenText from "../../../data/examples/lumen-and-loom-studio.json?raw";
import quillText from "../../../data/examples/quillfield-automation-llc.json?raw";

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

    it("freezes where the organisation is, its legal form and its registration authority until a country is chosen, keeping what they hold", () => {

        const empty = asLegalEntityValue(undefined);
        render(<ChainHarness initial={{ ...empty, organisation: { ...empty.organisation, city: "Leeds" } }} />);

        const address = screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement;
        expect(address.closest("fieldset")?.disabled).toBe(true);
        expect(address.value).toBe("Leeds");
        expect((screen.getByRole("textbox", { name: "Registration Authority" }) as HTMLInputElement).closest("fieldset")?.disabled).toBe(true);
        expect((screen.getAllByRole("button", { name: /^Legal Form/ }).find(button => button.classList.contains("option-picker-trigger"))!).closest("fieldset")?.disabled).toBe(true);
        expect(screen.getAllByText("Choose a country first.").length).toBeGreaterThanOrEqual(2);

        fireEvent.click(screen.getByRole("button", { name: /^Country/ }));
        fireEvent.click(screen.getByRole("option", { name: "United Kingdom" }));

        expect((screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement).closest("fieldset")?.disabled).toBe(false);
        // (The country changed from none to one: the address written before it is emptied.)
        expect((screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement).value).toBe("");
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
        expect(document.body.textContent).toContain("The first is the primary activity; add others, up to four in all.");
        expect(document.body.textContent).toContain("(the SIC code)");

    });

    it("names every level as the country's own scheme does, the first level too (Sector and Subsector in the United States)", async () => {

        render(<Where initial={asLegalEntityValue({ organisation: { country: "US", activities: [{ code: "541512", edition: "2022" }] } })} />);
        fireEvent.click(screen.getByRole("button", { name: "Maximise primary activity" }));
        for (const level of ["Sector", "Subsector", "Industry group", "NAICS industry", "National industry"]) {
            // (The scheme's file is read the moment the card opens: under a loaded machine it can take longer than the default second.)
            expect(await screen.findByText(level, undefined, { timeout: 8000 })).toBeTruthy();
        }
        expect(screen.queryByText("Industry")).toBeNull();
        // (Every level's entry is printed as the official document prints it, the code first: 54, 541, 5415, 54151, 541512.)
        for (const [level, code] of [["Sector", "54"], ["Subsector", "541"], ["Industry group", "5415"], ["NAICS industry", "54151"], ["National industry", "541512"]]) {
            // (A level with one entry is a record, not a dropdown: owner, 2026-11-14 14:21.)
            expect((await screen.findAllByLabelText(new RegExp("^" + level + " of the primary activity"), undefined, { timeout: 8000 }))[0].textContent).toMatch(new RegExp("^" + code + " "));
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
        fireEvent.click(screen.getByRole("button", { name: "Maximise primary activity" }));
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

describe("LegalEntityEditor as tiles", () => {

    function Tiled() {
        const [value, setValue] = useState<unknown>(asLegalEntityValue({ expenses: [{ ...createLegalEntityExpense(), name: "Filing fee" }] }));
        return <LegalEntityEditor value={value} onChange={setValue} asTiles />;
    }

    it("is one master tile, Registrations & Expenses (the Organisation and Founders & Ownership are tiles of Definition & Purpose; owner, 2026-11-09; the plan of 2026-11-18, step 3)", () => {
        render(<Tiled />);
        expect([...document.querySelectorAll(".section-tile")].map(tile => tile.getAttribute("data-tile"))).toEqual([
            "legal-entity-registrations"
        ]);
    });

    it("has no Capability tile, with the Founders Profile given too: the skills the business still needs are asked on Capacity & Delivery (owner, 2026-11-16 20:25)", () => {
        render(<LegalEntityEditor value={asLegalEntityValue({})} onChange={() => undefined} asTiles foundersProfile={{ founders: [], teamGaps: "No one sells." }} onChangeFoundersProfile={() => undefined} />);
        expect([...document.querySelectorAll(".section-tile")].map(tile => tile.getAttribute("data-tile"))).toEqual([
            "legal-entity-registrations"
        ]);
        expect(screen.queryByRole("button", { name: /^Capability/ })).toBeNull();
    });

    it("opens a one-owner form's founder card straight: the name a cell, the capital an optional tick beside it that takes only a figure, no number, no ownership table", () => {

        function Sole() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({
                organisation: { country: "US", legalForm: "Sole Proprietorship" },
                founders: [{ ...createLegalEntityFounder(), name: "Jordan Ellis", ownership: "100" }]
            }));
            return <><LegalEntityEditor value={value} onChange={setValue} asTiles foundersOnly onChangeFoundersProfile={() => undefined} /><output data-testid="capital">{String(asLegalEntityValue(value).capitalApplies) + ":" + asLegalEntityValue(value).founders[0].capital}</output></>;
        }
        // (The Founders & Ownership dialog, as the Definition's tile opens it.)
        render(<Sole />);

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

    it("opens a box for each expense, with the add box, in the Expenses sub tile of Registrations & Expenses", () => {
        render(<Tiled />);
        fireEvent.click(document.querySelector("[data-tile=legal-entity-registrations]")!);
        fireEvent.click(document.querySelector("[data-tile=expenses]")!);
        expect(screen.getByRole("button", { name: /Expense 1: Filing fee/ })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Add Card" })).toBeTruthy();
    });

    it("lists every expense and every founder on their tiles, no display cap (the list scrolls; owner, 2026-11-09)", () => {
        const many = Array.from({ length: 11 }, (_entry, at) => at + 1);
        render(<LegalEntityEditor
            value={asLegalEntityValue({
                expenses: many.map(at => ({ ...createLegalEntityExpense(), name: "Fee " + at })),
                founders: many.map(at => ({ ...createLegalEntityFounder(), name: "Founder " + at, ownership: "9" }))
            })}
            onChange={() => undefined}
            asTiles
            onChangeFoundersProfile={() => undefined}
        />);
        // (The list is the tile's links layer, laid over it: every line is there, the list scrolls where they do not all fit. The expenses are on the Expenses sub tile,
        // in the Registrations & Expenses dialog.)
        fireEvent.click(document.querySelector("[data-tile=legal-entity-registrations]")!);
        const lines = [...document.querySelectorAll(".section-tile-list > li")].map(item => item.textContent?.trim() ?? "");
        expect(many.every(at => lines.includes("Fee " + at))).toBe(true);
        // (The founders are on the Founders & Ownership tile, drawn on 1. Definition: its face lists every founder.)
        expect(many.every(at => (foundersTileFace(asLegalEntityValue({ founders: many.map(at => ({ ...createLegalEntityFounder(), name: "Founder " + at, ownership: "9" })) }), true).items ?? []).includes("Founder " + at))).toBe(true);
    });

    it("opens Registrations & Expenses as two sub tiles: Registrations (the formation's and the tax's numbers, the requirements nested), Expenses (owner, 2026-11-19 16:52)", () => {
        render(<Tiled />);
        fireEvent.click(document.querySelector("[data-tile=legal-entity-registrations]")!);
        expect([...document.querySelectorAll(".section-tile-dialog .section-tile")].map(tile => tile.getAttribute("data-tile"))).toEqual(["registration-numbers", "expenses"]);
        fireEvent.click(document.querySelector("[data-tile=registration-numbers]")!);
        // (The requirements are a titled section of nested tiles in the same dialog card, under the numbers.)
        expect(screen.getByRole("heading", { name: "Additional Legal Requirements" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Add Card" })).toBeTruthy();
    });

    it.each([
        ["Lumen & Loom (UK)", lumenText, [
            "Companies House: 16234587", "UK Trade Mark (LUMEN & LOOM): UK00004012345", "Tax Identification Number (UTR): 3456789012", "VAT: GB 412 3456 78", "PAYE Employer Reference: 120/AB45678"
        ]],
        ["Quillfield (US)", quillText, [
            "New York Department of State: KC-2026-0817", "Tax Identification Number (EIN): 93-4567812"
        ]]
    ])("%s: the Registrations tile lists what its dialog holds, in the dialog's order and words, with no status line", (_name, text, numbers) => {
        const saved = (JSON.parse(text) as { systems: Record<string, { responses: Array<{ value?: { formation?: unknown } }> }> }).systems["1"].responses.find(response => response.value?.formation)!.value;
        function Example() {
            const [value, setValue] = useState<unknown>(saved);
            return <LegalEntityEditor value={value} onChange={setValue} asTiles />;
        }
        render(<Example />);
        // (A tile's list is its links layer, laid over it in the tile's slot.)
        const linesOf = (tile: string) => { let at = document.querySelector(`[data-tile=${tile}]`)?.parentElement ?? null; while (at && !at.querySelector(".section-tile-list > li")) { at = at.parentElement; } return [...(at?.querySelectorAll(".section-tile-list") ?? [])].slice(0, 1).flatMap(list => [...list.querySelectorAll(":scope > li")]).map(item => item.textContent?.trim() ?? ""); };
        expect(linesOf("legal-entity-registrations")).toEqual(["Registrations", "Expenses"]);
        fireEvent.click(document.querySelector("[data-tile=legal-entity-registrations]")!);
        // (The Registrations tile lists its numbers, then each requirement it holds.)
        const requirements = asLegalEntityValue(saved).requirements.map(requirement => requirement.name);
        expect(linesOf("registration-numbers")).toEqual([...numbers, ...requirements]);
        // (The dialog holds the same: the registry and the tax number as written there.)
        fireEvent.click(document.querySelector("[data-tile=registration-numbers]")!);
        expect((screen.getByRole("textbox", { name: "Registration Number" }) as HTMLInputElement).value).toBe(numbers[0].split(": ")[1]);
        expect(screen.getByLabelText("Registration Authority").textContent).toBe(numbers[0].split(": ")[0]);
    });

});

describe("LegalEntityEditor the country, the legal form and the activities (the six countries and Other)", () => {

    function Org({ initial }: { initial?: Record<string, unknown> }) {
        const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: initial ?? {} }));
        return <LegalEntityEditor value={value} onChange={setValue} />;
    }

    it("lists the six countries and Other; Other opens the list of every other country", () => {

        render(<Org />);
        fireEvent.click(screen.getByRole("button", { name: /^Country/ }));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Australia", "Canada", "Ireland", "New Zealand", "United Kingdom", "United States of America", "Other"]);
        expect(screen.queryByRole("button", { name: /^Other country/ })).toBeNull();
        fireEvent.click(screen.getByRole("option", { name: "Other" }));
        expect(screen.getByRole("button", { name: /^Other country/ })).toBeTruthy();

    });

    it("gives Other the four generic legal forms and the typed activities; a country of the six keeps its own", () => {

        render(<Org initial={{ country: "FR" }} />);
        fireEvent.click(screen.getAllByRole("button", { name: /^Legal Form/ }).find(button => button.classList.contains("option-picker-trigger"))!);
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Sole Proprietorship", "General Partnership", "Private Limited Company (LLC / Ltd / GmbH)", "Limited Liability Partnership (LLP)"]);
        fireEvent.click(screen.getByRole("option", { name: "Sole Proprietorship" }));
        // The activity and its code are typed.
        expect(screen.getByRole("textbox", { name: "Activity of the primary activity" })).toBeTruthy();
        expect(screen.getByRole("textbox", { name: "Code of the primary activity" })).toBeTruthy();
        cleanup();

        render(<Org initial={{ country: "GB" }} />);
        fireEvent.click(screen.getAllByRole("button", { name: /^Legal Form/ }).find(button => button.classList.contains("option-picker-trigger"))!);
        expect(screen.getAllByRole("option").map(option => option.textContent)).toContain("Sole Trader");
        expect(screen.queryByRole("textbox", { name: "Code of the primary activity" })).toBeNull();

    });

    it("saves a typed activity with its code, and reads it back", () => {

        let saved: ReturnType<typeof asLegalEntityValue> | null = null;
        function Typed() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { country: "FR" } }));
            return <LegalEntityEditor value={value} onChange={next => { saved = asLegalEntityValue(next); setValue(next); }} />;
        }
        render(<Typed />);
        fireEvent.change(screen.getByRole("textbox", { name: "Activity of the primary activity" }), { target: { value: "Web design" } });
        fireEvent.change(screen.getByRole("textbox", { name: "Code of the primary activity" }), { target: { value: "62.01" } });
        expect(saved!.organisation.activities).toEqual([{ code: "62.01", edition: "", name: "Web design" }]);

    });

});

describe("LegalEntityEditor: a change of country empties the state and the address", () => {

    function Harness({ initial }: { initial: unknown }) {
        const [value, setValue] = useState<unknown>(initial);
        return <LegalEntityEditor value={value} onChange={setValue} />;
    }
    const address = () => (screen.getByRole("textbox", { name: "Address" }) as HTMLTextAreaElement).value;

    it("empties the address and the state the instant the country changes, and keeps them when the same country is chosen again", () => {

        const empty = asLegalEntityValue(undefined);
        render(<Harness initial={{ ...empty, organisation: { ...empty.organisation, country: "US", subdivision: "Delaware", addressLine1: "1 Main Street", city: "Dover", postalCode: "19901" } }} />);
        expect(address()).toContain("1 Main Street");

        fireEvent.click(screen.getByRole("button", { name: /^Country/ }));
        fireEvent.click(screen.getByRole("option", { name: "United States of America" }));
        expect(address()).toContain("1 Main Street");

        fireEvent.click(screen.getByRole("button", { name: /^Country/ }));
        fireEvent.click(screen.getByRole("option", { name: "Canada" }));
        expect(address()).toBe("");

    });

    it("keeps the state, the legal form and the activities when the same country is chosen again (Questions 4, section 9)", () => {

        const empty = asLegalEntityValue(undefined);
        const activities = [{ code: "541511", edition: "" }];
        const initial = { ...empty, organisation: { ...empty.organisation, country: "US", subdivision: "Delaware", legalForm: "Limited Liability Company (LLC)", activities } };
        let saved: { organisation: typeof initial.organisation } = initial;
        render(<LegalEntityEditor value={initial} onChange={(next) => { saved = next as typeof saved; }} />);

        fireEvent.click(screen.getByRole("button", { name: /^Country/ }));
        fireEvent.click(screen.getByRole("option", { name: "United States of America" }));
        expect(saved.organisation.subdivision).toBe("Delaware");
        expect(saved.organisation.legalForm).toBe("Limited Liability Company (LLC)");
        expect(saved.organisation.activities.map(activity => activity.code)).toEqual(["541511"]);

    });

});
