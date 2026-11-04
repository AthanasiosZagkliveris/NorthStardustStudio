import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import RatingField, { type Rating } from "./RatingField";
import RatingGroup from "./RatingGroup";

/** A rating that keeps its own value, as a card does. */
function Kept({ onChange }: { onChange?: (next: Rating | undefined) => void }) {
    const [value, setValue] = useState<Rating | undefined>(undefined);
    return (
        <RatingField
            label="Good support"
            name="support"
            value={value}
            onChange={next => { setValue(next); onChange?.(next); }}
            lowLabel="Weak"
            highLabel="Strong"
        />
    );
}

describe("RatingField", () => {

    afterEach(() => cleanup());

    it("draws five rounds, low to high, in one named radio group with their words", () => {
        render(<Kept />);
        const group = screen.getByRole("radiogroup", { name: "Good support" });
        const rounds = within(group).getAllByRole("radio");
        expect(rounds.map(round => round.getAttribute("aria-label"))).toEqual([
            "1 of 5, Weak", "2 of 5", "3 of 5", "4 of 5", "5 of 5, Strong"
        ]);
        // One name for the row, so the arrows move along it.
        expect(new Set(rounds.map(round => (round as HTMLInputElement).name))).toEqual(new Set(["support"]));
        // The end words are shown once, over the rounds.
        expect(screen.getAllByText("Weak")).toHaveLength(1);
        expect(screen.getAllByText("Strong")).toHaveLength(1);
        // No word in between (owner, 2026-11-04).
        expect(document.querySelectorAll(".rating-ends > span")).toHaveLength(2);
    });

    it("chooses a round, moves to another, and clears when the chosen round is pressed again", () => {
        const onChange = vi.fn();
        render(<Kept onChange={onChange} />);
        const round = (n: number) => screen.getByRole("radio", { name: new RegExp("^" + n + " of 5") }) as HTMLInputElement;
        fireEvent.click(round(4));
        expect(onChange).toHaveBeenLastCalledWith(4);
        expect(round(4).checked).toBe(true);
        fireEvent.click(round(2));
        expect(onChange).toHaveBeenLastCalledWith(2);
        expect(round(2).checked).toBe(true);
        expect(round(4).checked).toBe(false);
        fireEvent.click(round(2));
        expect(onChange).toHaveBeenLastCalledWith(undefined);
        expect(screen.getAllByRole("radio").some(r => (r as HTMLInputElement).checked)).toBe(false);
    });

    it("chooses from the keyboard: Space on a focused round", () => {
        const onChange = vi.fn();
        render(<Kept onChange={onChange} />);
        const third = screen.getByRole("radio", { name: /^3 of 5/ });
        third.focus();
        expect(document.activeElement).toBe(third);
        // Space on a radio is a click in the browser.
        fireEvent.click(third);
        expect(onChange).toHaveBeenLastCalledWith(3);
    });

    it("cannot be changed while disabled", () => {
        render(<RatingField label="Speed" name="speed" value={3} onChange={() => {}} disabled />);
        for (const round of screen.getAllByRole("radio")) {
            expect((round as HTMLInputElement).disabled).toBe(true);
        }
    });

});

describe("RatingGroup", () => {

    afterEach(() => cleanup());

    it("says the end words once for all rows and gives each row its own group", () => {
        const onChange = vi.fn();
        render(
            <RatingGroup
                label="How do they do on what customers value?"
                name="k9"
                rows={[{ id: "price", label: "Lower price" }, { id: "speed", label: "Speed" }]}
                values={{ speed: 5 }}
                onChange={onChange}
                lowLabel="Weak"
                highLabel="Strong"
            />
        );
        expect(screen.getAllByText("Weak")).toHaveLength(1);
        expect(screen.getAllByText("Strong")).toHaveLength(1);
        const price = screen.getByRole("radiogroup", { name: "Lower price" });
        const speed = screen.getByRole("radiogroup", { name: "Speed" });
        expect((within(speed).getByRole("radio", { name: /^5 of 5/ }) as HTMLInputElement).checked).toBe(true);
        // Each row's rounds have a name of their own, so a choice in one row never moves another.
        expect((within(price).getAllByRole("radio")[0] as HTMLInputElement).name).not.toBe((within(speed).getAllByRole("radio")[0] as HTMLInputElement).name);
        fireEvent.click(within(price).getByRole("radio", { name: /^1 of 5/ }));
        expect(onChange).toHaveBeenLastCalledWith("price", 1);
        fireEvent.click(within(speed).getByRole("radio", { name: /^5 of 5/ }));
        expect(onChange).toHaveBeenLastCalledWith("speed", undefined);
    });

    it("selectable: a ticked row shows its rating, unticking hides and clears it, and the tick works from the keyboard", () => {
        function Reviewed() {
            const [selected, setSelected] = useState<string[]>([]);
            const [values, setValues] = useState<Partial<Record<string, Rating>>>({});
            return (
                <RatingGroup
                    label="Where are they reviewed, and how are they rated?"
                    name="k6"
                    rows={[{ id: "google", label: "Google" }, { id: "trustpilot", label: "Trustpilot" }]}
                    values={values}
                    onChange={(id, next) => setValues(previous => ({ ...previous, [id]: next }))}
                    lowLabel="Poor"
                    highLabel="Excellent"
                    selectable
                    selected={selected}
                    onSelect={(id, on) => setSelected(previous => on ? [...previous, id] : previous.filter(entry => entry !== id))}
                />
            );
        }
        render(<Reviewed />);
        expect(screen.queryByRole("radiogroup", { name: "Google" })).toBeNull();
        const google = screen.getByRole("checkbox", { name: "Google" });
        // Space on a tick box is a click in the browser.
        google.focus();
        fireEvent.click(google);
        const rounds = screen.getByRole("radiogroup", { name: "Google" });
        fireEvent.click(within(rounds).getByRole("radio", { name: /^4 of 5/ }));
        expect((within(rounds).getByRole("radio", { name: /^4 of 5/ }) as HTMLInputElement).checked).toBe(true);
        // Unticked: the rounds go, and ticked again the row starts unrated.
        fireEvent.click(google);
        expect(screen.queryByRole("radiogroup", { name: "Google" })).toBeNull();
        fireEvent.click(google);
        expect(within(screen.getByRole("radiogroup", { name: "Google" })).getAllByRole("radio").some(r => (r as HTMLInputElement).checked)).toBe(false);
        // The end words are still said once.
        expect(screen.getAllByText("Poor")).toHaveLength(1);
        expect(screen.queryByRole("radiogroup", { name: "Trustpilot" })).toBeNull();
    });

    it("shows what a row carries under it", () => {
        render(
            <RatingGroup
                label="How easy do they make each stage for customers?"
                name="k7"
                rows={[{ id: "support", label: "Support & Follow Up", below: <span>Loyalty scheme / rewards</span> }]}
                values={{}}
                onChange={() => {}}
                lowLabel="Hard"
                highLabel="Easy"
            />
        );
        expect(screen.getByText("Loyalty scheme / rewards")).toBeTruthy();
        expect(screen.getByRole("radiogroup", { name: "Support & Follow Up" })).toBeTruthy();
    });

});
