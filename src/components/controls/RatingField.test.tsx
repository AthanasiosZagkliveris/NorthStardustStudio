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
            lowLabel="Clear weakness"
            midLabel="Average"
            highLabel="Clear strength"
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
            "1 of 5, Clear weakness", "2 of 5", "3 of 5, Average", "4 of 5", "5 of 5, Clear strength"
        ]);
        // One name for the row, so the arrows move along it.
        expect(new Set(rounds.map(round => (round as HTMLInputElement).name))).toEqual(new Set(["support"]));
        // The end words are shown once, over the rounds.
        expect(screen.getAllByText("Clear weakness")).toHaveLength(1);
        expect(screen.getAllByText("Clear strength")).toHaveLength(1);
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
                lowLabel="Clear weakness"
                highLabel="Clear strength"
            />
        );
        expect(screen.getAllByText("Clear weakness")).toHaveLength(1);
        expect(screen.getAllByText("Clear strength")).toHaveLength(1);
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

});
