import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import FoundersProfileEditor from "./FoundersProfileEditor";
import { toggles } from "../../test/interviewTestUtils";
import {
    asFoundersProfileValue,
    type LegalEntityFounderValue
} from "../../framework/engine/AnswerUtils";

const founder = (id: string, name: string, extra: Partial<LegalEntityFounderValue> = {}): LegalEntityFounderValue =>
    ({ id, name, ownership: "", capital: "", roles: [""], experience: "", ...extra });

const ann = founder("a", "Ann Lee");
const bo = founder("b", "Bo Park");

let saved: unknown;

function Harness({ founders, initial }: { founders: LegalEntityFounderValue[]; initial?: unknown }) {
    const [value, setValue] = useState<unknown>(initial);
    return (
        <FoundersProfileEditor
            value={value}
            onChange={(next) => { saved = next; setValue(next); }}
            legalEntityFounders={founders}
        />
    );
}

const open = (name: RegExp) => {
    const toggle = toggles(name)[0];
    if (toggle.getAttribute("aria-expanded") === "false") {
        fireEvent.click(toggle);
    }
};

afterEach(() => {
    cleanup();
    saved = undefined;
});

describe("FoundersProfileEditor founders", () => {

    it("draws one card per named Legal Entity founder, named and numbered as there", () => {

        render(<Harness founders={[ann, founder("x", "  "), bo]} />);

        const names = [...document.querySelectorAll(".legal-entity-card .strategy-name-static")].map(node => node.textContent);
        expect(names).toEqual(["Ann Lee", "Bo Park"]);
        const numbers = [...document.querySelectorAll(".legal-entity-card-number")].map(node => node.textContent);
        expect(numbers).toEqual(["1.", "2."]);
        // Named on the Legal Entity page: shown, never asked, never removed here.
        expect(screen.queryByRole("textbox", { name: /name$/i })).toBeNull();
        expect(screen.queryByRole("button", { name: /^Remove founder/ })).toBeNull();

    });

    it("points to the Legal Entity while it names nobody", () => {

        const onOpen = vi.fn();

        render(
            <FoundersProfileEditor
                value={undefined}
                onChange={() => undefined}
                legalEntityFounders={[founder("x", "")]}
                onOpenLegalEntity={onOpen}
            />
        );

        expect(document.querySelectorAll(".legal-entity-card")).toHaveLength(0);
        fireEvent.click(screen.getByRole("button", { name: "1. Identity System → 3. Legal Entity → 2. Founders & Ownership" }));
        expect(onOpen).toHaveBeenCalledWith(["legal-section-1"]);

    });

    it("starts the cards folded, with the roles under the name, and folds them all at once", () => {

        render(<Harness founders={[ann, bo]} initial={{ founders: [{ id: "a", roles: ["Director", "Designer"] }] }} />);

        toggles(/^Maximize Founder \d$/).forEach(toggle => expect(toggle.getAttribute("aria-expanded")).toBe("false"));
        expect(screen.getByText("Director, Designer").classList.contains("business-card-summary")).toBe(true);

        const all = screen.getByRole("button", { name: "Expand all founders" });
        expect(all.parentElement!.querySelector("h3")?.textContent).toMatch(/Founders/);
        fireEvent.click(all);
        toggles(/Founder \d$/).forEach(toggle => expect(toggle.getAttribute("aria-expanded")).toBe("true"));
        fireEvent.click(screen.getByRole("button", { name: "Collapse all founders" }));
        toggles(/Founder \d$/).forEach(toggle => expect(toggle.getAttribute("aria-expanded")).toBe("false"));

    });

    it("asks each question with its note", () => {

        render(<Harness founders={[ann]} />);
        open(/Founder 1$/);

        for (const label of ["Roles", "Relevant Industry Experience", "Management Experience", "Key Achievements", "Skills, Expertise & Qualifications", "Team Capability Gaps & Cover"]) {
            expect(screen.getByRole("button", { name: label + ": what this means" })).toBeTruthy();
        }
        expect(screen.getByText("Relevant Experience").classList.contains("business-foundation-subhead")).toBe(true);
        expect(screen.getByLabelText("Founder 1 roles 1")).toBeTruthy();
        expect(screen.getByLabelText("Founder 1 relevant industry experience").tagName).toBe("TEXTAREA");
        expect(screen.getByLabelText("Founder 1 relevant industry experience").getAttribute("placeholder"))
            .toBe("Relevant companies, sectors, positions, projects, markets or professional experience");
        // Years are said in the text, where they help: no box of their own.
        expect(screen.queryByLabelText(/years in the industry/)).toBeNull();
        expect(screen.queryByText(/years in the industry/)).toBeNull();
        expect(screen.getByLabelText("Founder 1 management experience").tagName).toBe("TEXTAREA");
        expect(screen.getByLabelText("Team Capability Gaps & Cover").tagName).toBe("TEXTAREA");
        // The subsection, and so its rail item, follows the new name.
        expect(document.querySelector("[data-rail='team-capability-gaps-cover'] h3")?.textContent).toMatch(/Team Capability Gaps & Cover/);

    });

    it("takes as many Key Achievements as there are, and takes an empty line away", () => {

        render(<Harness founders={[ann]} />);
        open(/Founder 1$/);

        const achievement = (n: number) => screen.queryByLabelText("Founder 1 key achievements " + n) as HTMLTextAreaElement | null;

        for (const [n, text] of ["First", "Second", "Third", "Fourth"].entries()) {
            fireEvent.change(achievement(n + 1)!, { target: { value: text } });
            fireEvent.keyDown(achievement(n + 1)!, { key: "Enter" });
        }
        expect(achievement(5)).toBeTruthy();
        expect(achievement(1)!.getAttribute("placeholder")).toBe("What was achieved, your contribution, the measurable result");

        // Backspace on an empty line takes it away.
        fireEvent.keyDown(achievement(5)!, { key: "Backspace" });
        expect(achievement(5)).toBeNull();
        expect(asFoundersProfileValue(saved).founders[0].achievements).toEqual(["First", "Second", "Third", "Fourth"]);

    });

    it("asks Skills, Expertise & Qualifications a typed row at a time", () => {

        render(<Harness founders={[ann]} />);
        open(/Founder 1$/);

        const text = (n: number) => screen.queryByLabelText("Founder 1 skills entry " + n + " text") as HTMLTextAreaElement | null;
        const type = (n: number) => screen.getAllByRole("button", { name: new RegExp("^Founder 1 skills entry " + n + " type") })
            .find(button => button.classList.contains("option-picker-trigger"))!;
        const choose = (n: number, label: string) => {
            fireEvent.click(type(n));
            fireEvent.click(screen.getByRole("option", { name: label }));
        };

        // One row to start, untyped, asking for any kind.
        expect(type(1).textContent).toContain("Type");
        expect(text(1)!.getAttribute("placeholder")).toBe("Skill, expertise, qualification, certification, licence or membership");
        expect(text(2)).toBeNull();

        // The row reads: number, text, type, ×.
        const row = text(1)!.closest(".founders-profile-skill")!;
        expect([...row.children].map(child => child.className.split(" ").pop())).toEqual([
            "founders-profile-skill-number", "founders-profile-skill-text", "option-picker", "strategy-box-remove"
        ]);

        // Its placeholder follows the type chosen.
        choose(1, "Certification");
        expect(text(1)!.getAttribute("placeholder")).toBe("Name and issuing body");
        choose(1, "Skill");
        expect(text(1)!.getAttribute("placeholder")).toBe("e.g. Negotiation");
        fireEvent.change(text(1)!, { target: { value: "Negotiation" } });

        // "+ Add" adds a row; its type is its own.
        fireEvent.click(screen.getByRole("button", { name: "+ Add" }));
        expect(text(2)).toBeTruthy();
        choose(2, "Licence");
        expect(text(2)!.getAttribute("placeholder")).toBe("Licence and where it applies");
        fireEvent.change(text(2)!, { target: { value: "NY notary" } });
        expect(asFoundersProfileValue(saved).founders[0].skills).toEqual([
            { type: "skill", text: "Negotiation" },
            { type: "licence", text: "NY notary" }
        ]);

        // × takes a row away...
        fireEvent.click(screen.getByRole("button", { name: "Remove Founder 1 skills entry 1" }));
        expect(asFoundersProfileValue(saved).founders[0].skills).toEqual([{ type: "licence", text: "NY notary" }]);
        expect(text(2)).toBeNull();

        // ...but the last one is only emptied.
        fireEvent.click(screen.getByRole("button", { name: "Remove Founder 1 skills entry 1" }));
        expect(asFoundersProfileValue(saved).founders[0].skills).toEqual([{ type: "", text: "" }]);
        expect(text(1)!.value).toBe("");

    });

    it("shows skills saved as plain lines, untyped, with nothing lost", () => {

        render(<Harness founders={[ann]} initial={{ founders: [{ id: "a", roles: [""], skills: ["BA (Hons)", "Negotiation"] }] }} />);
        open(/Founder 1$/);

        expect((screen.getByLabelText("Founder 1 skills entry 1 text") as HTMLTextAreaElement).value).toBe("BA (Hons)");
        expect((screen.getByLabelText("Founder 1 skills entry 2 text") as HTMLTextAreaElement).value).toBe("Negotiation");
        expect(screen.getAllByRole("button", { name: /^Founder 1 skills entry 2 type/ })
            .find(button => button.classList.contains("option-picker-trigger"))!.textContent).toContain("Type");

    });

    it("seeds a founder saved on the Legal Entity with roles and experience, and saves it as its own", () => {

        const legacy = founder("a", "Ann Lee", { roles: ["Director"], experience: "Ten years in retail." });

        render(<Harness founders={[legacy, bo]} initial={{ founders: [{ id: "gone", roles: ["Kept"] }], teamGaps: "" }} />);

        const stored = asFoundersProfileValue(saved);
        expect(stored.founders.map(entry => entry.id)).toEqual(["gone", "a", "b"]);
        expect(stored.founders[1].roles).toEqual(["Director"]);
        expect(stored.founders[1].industryExperience).toBe("Ten years in retail.");

        open(/Founder 1$/);
        expect((screen.getByLabelText("Founder 1 roles 1") as HTMLTextAreaElement).value).toBe("Director");
        expect((screen.getByLabelText("Founder 1 relevant industry experience") as HTMLTextAreaElement).value).toBe("Ten years in retail.");

    });

});
