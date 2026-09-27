import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import LegalEntityEditor from "./LegalEntityEditor";
import { asLegalEntityValue, createLegalEntityRequirement } from "../../framework/engine/AnswerUtils";

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

    function typeInto(input: HTMLInputElement, text: string) {
        for (let length = 1; length <= text.length; length++) {
            fireEvent.change(input, { target: { value: text.slice(0, length) } });
        }
    }

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

        expect(screen.getByLabelText("Formation Date").getAttribute("max")).toBe(iso);

    });

});
