import { fireEvent, screen } from "@testing-library/react";

/** The fold arrows (.strategy-box-toggle) whose name matches `pattern`. */
export const toggles = (pattern: RegExp) =>
    screen.getAllByRole("button", { name: pattern }).filter(b => b.classList.contains("strategy-box-toggle"));

/** Types `text` one keystroke at a time, the way a number box's limits see it. */
export function typeInto(input: HTMLInputElement, text: string) {
    for (let length = 1; length <= text.length; length++) {
        fireEvent.change(input, { target: { value: text.slice(0, length) } });
    }
}
