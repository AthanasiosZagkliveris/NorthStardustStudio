import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import FoundersProfileEditor from "./FoundersProfileEditor";
import { toggles, typeInto } from "../../test/interviewTestUtils";
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

        for (const label of ["Roles", "Industry Experience", "Management Experience", "Key Achievements", "Skills & Qualifications", "Team Gaps & Cover"]) {
            expect(screen.getByRole("button", { name: label + ": what this means" })).toBeTruthy();
        }
        expect(screen.getByLabelText("Founder 1 roles 1")).toBeTruthy();
        expect(screen.getByLabelText("Founder 1 industry experience").tagName).toBe("TEXTAREA");
        expect(screen.getByLabelText("Founder 1 management experience").tagName).toBe("TEXTAREA");
        expect(screen.getByLabelText("Team Gaps & Cover").tagName).toBe("TEXTAREA");

    });

    it("takes the years as a whole number up to 70", () => {

        render(<Harness founders={[ann]} />);
        open(/Founder 1$/);

        const years = screen.getByLabelText("Founder 1 years in the industry") as HTMLInputElement;
        typeInto(years, "71");
        expect(years.value).toBe("7");
        fireEvent.change(years, { target: { value: "70" } });
        expect(years.value).toBe("70");
        fireEvent.change(years, { target: { value: "70.5" } });
        expect(years.value).toBe("70");
        fireEvent.change(years, { target: { value: "-1" } });
        expect(years.value).toBe("70");

    });

    it("adds and removes list lines, and stops Key Achievements at three", () => {

        render(<Harness founders={[ann]} />);
        open(/Founder 1$/);

        const achievement = (n: number) => screen.queryByLabelText("Founder 1 key achievements " + n) as HTMLTextAreaElement | null;

        fireEvent.change(achievement(1)!, { target: { value: "First" } });
        fireEvent.keyDown(achievement(1)!, { key: "Enter" });
        fireEvent.change(achievement(2)!, { target: { value: "Second" } });
        fireEvent.keyDown(achievement(2)!, { key: "Enter" });
        fireEvent.change(achievement(3)!, { target: { value: "Third" } });
        fireEvent.keyDown(achievement(3)!, { key: "Enter" });
        expect(achievement(4)).toBeNull();
        expect(asFoundersProfileValue(saved).founders[0].achievements).toEqual(["First", "Second", "Third"]);

        // Backspace on an empty line takes it away.
        const skill = (n: number) => screen.queryByLabelText("Founder 1 skills & qualifications " + n) as HTMLTextAreaElement | null;
        fireEvent.keyDown(skill(1)!, { key: "Enter" });
        expect(skill(2)).toBeTruthy();
        fireEvent.keyDown(skill(2)!, { key: "Backspace" });
        expect(skill(2)).toBeNull();

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
        expect((screen.getByLabelText("Founder 1 industry experience") as HTMLTextAreaElement).value).toBe("Ten years in retail.");

    });

});
