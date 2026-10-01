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
        // No group heading: the Roles alone in one column, then Industry |
        // Management, then Achievements | Skills, on the card's two columns.
        expect(screen.queryByText("Relevant Experience")).toBeNull();
        const rows = [...document.querySelectorAll(".founders-profile-row")];
        expect(rows.map(row => row.querySelectorAll(":scope > .legal-entity-field").length)).toEqual([1, 2, 2]);
        expect(rows.every(row => row.classList.contains("founders-profile-row-two"))).toBe(true);
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

    it("asks Skills, Expertise & Qualifications as a numbered list, each line typed at its end", () => {

        render(<Harness founders={[ann]} />);
        open(/Founder 1$/);

        const text = (n: number) => screen.queryByLabelText("Founder 1 skills entry " + n) as HTMLTextAreaElement | null;
        const type = (n: number) => screen.getByLabelText("Founder 1 skills entry " + n + " type") as HTMLSelectElement;
        const stored = () => asFoundersProfileValue(saved).founders[0].skills;

        // The same list as Roles: one box, no add button, no ×.
        const list = text(1)!.closest(".numbered-list")!;
        expect(list.querySelectorAll(".numbered-list-row")).toHaveLength(1);
        expect(screen.queryByRole("button", { name: /^\+ Add$/ })).toBeNull();
        expect(screen.queryByRole("button", { name: /^Remove Founder 1 skills/ })).toBeNull();
        // The type at the end of the line, inside the box.
        const row = text(1)!.closest(".numbered-list-row")!;
        expect(row.lastElementChild!.contains(type(1))).toBe(true);
        expect([...type(1).options].map(option => option.textContent)).toEqual([
            "Type", "Skill", "Professional / Technical Expertise", "Degree / Qualification",
            "Certification", "Licence", "Membership / Other Credential"
        ]);

        // Untyped, it asks for any kind; typed, for that kind.
        expect(text(1)!.placeholder).toBe("Skill, expertise, qualification, certification, licence or membership");
        fireEvent.change(type(1), { target: { value: "certification" } });
        expect(text(1)!.placeholder).toBe("Name and issuing body");
        fireEvent.change(type(1), { target: { value: "skill" } });
        expect(text(1)!.placeholder).toBe("e.g. Negotiation");
        fireEvent.change(text(1)!, { target: { value: "Negotiation" } });

        // Enter opens the next line, untyped, with a placeholder of its own.
        fireEvent.keyDown(text(1)!, { key: "Enter" });
        expect(type(2).value).toBe("");
        expect(text(2)!.placeholder).toBe("Skill, expertise, qualification, certification, licence or membership");
        fireEvent.change(type(2), { target: { value: "licence" } });
        expect(text(2)!.placeholder).toBe("Licence and where it applies");
        fireEvent.change(text(2)!, { target: { value: "NY notary" } });
        expect(stored()).toEqual([
            { type: "skill", text: "Negotiation" },
            { type: "licence", text: "NY notary" }
        ]);

        // A line opened between them leaves each type with its line.
        fireEvent.keyDown(text(1)!, { key: "Enter" });
        expect(stored()).toEqual([
            { type: "skill", text: "Negotiation" },
            { type: "", text: "" },
            { type: "licence", text: "NY notary" }
        ]);
        expect(type(3).value).toBe("licence");

        // Backspace on the empty one takes it away, and the types follow.
        fireEvent.keyDown(text(2)!, { key: "Backspace" });
        expect(stored()).toEqual([
            { type: "skill", text: "Negotiation" },
            { type: "licence", text: "NY notary" }
        ]);
        expect(type(2).value).toBe("licence");

    });

    it("moves a line's type with it when the line is dragged", () => {

        render(<Harness founders={[ann]} initial={{ founders: [{ id: "a", roles: [""], skills: [
            { type: "skill", text: "Negotiation" },
            { type: "certification", text: "PRINCE2" },
            { type: "", text: "Untyped" }
        ] }] }} />);
        open(/Founder 1$/);

        const rows = [...screen.getByLabelText("Founder 1 skills entry 1").closest(".numbered-list")!
            .querySelectorAll(".numbered-list-row")] as HTMLElement[];
        const dataTransfer = { setData: () => {}, effectAllowed: "", dropEffect: "" };
        fireEvent.mouseDown(rows[0].querySelector(".numbered-list-number")!);
        fireEvent.dragStart(rows[0], { dataTransfer });
        fireEvent.dragOver(rows[2], { dataTransfer });
        fireEvent.drop(rows[2], { dataTransfer });

        expect(asFoundersProfileValue(saved).founders[0].skills).toEqual([
            { type: "certification", text: "PRINCE2" },
            { type: "", text: "Untyped" },
            { type: "skill", text: "Negotiation" }
        ]);
        expect((screen.getByLabelText("Founder 1 skills entry 3 type") as HTMLSelectElement).value).toBe("skill");

    });

    it("shows skills saved as plain lines, untyped, with nothing lost", () => {

        render(<Harness founders={[ann]} initial={{ founders: [{ id: "a", roles: [""], skills: ["BA (Hons)", "Negotiation"] }] }} />);
        open(/Founder 1$/);

        expect((screen.getByLabelText("Founder 1 skills entry 1") as HTMLTextAreaElement).value).toBe("BA (Hons)");
        expect((screen.getByLabelText("Founder 1 skills entry 2") as HTMLTextAreaElement).value).toBe("Negotiation");
        expect((screen.getByLabelText("Founder 1 skills entry 2 type") as HTMLSelectElement).value).toBe("");

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
