import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

import { OptionalNote } from "./BusinessCardFields";

afterEach(cleanup);

/** An OptionalNote over its own stored value, which the test can read. */
function Harness({ initial, onStore }: { initial: string; onStore: (value: string) => void }) {
    const [value, setValue] = useState(initial);
    return (
        <OptionalNote
            label="Conditions"
            ariaLabel="Loan conditions"
            value={value}
            onChange={(next) => { setValue(next); onStore(next); }}
        />
    );
}

describe("an optional field opened by its tick box", () => {

    it("shows only its tick box and label until ticked, then the field, focused", () => {
        render(<Harness initial="" onStore={() => undefined} />);
        const tick = screen.getByRole("checkbox", { name: "Conditions" });
        expect((tick as HTMLInputElement).checked).toBe(false);
        expect(screen.queryByRole("textbox", { name: "Loan conditions" })).toBeNull();

        act(() => { fireEvent.click(tick); });

        const box = screen.getByRole("textbox", { name: "Loan conditions" });
        expect(document.activeElement).toBe(box);
        expect(box.closest("[data-field-kind=optional]")).toBeTruthy();
    });

    it("loads ticked when it already has content", () => {
        render(<Harness initial="Personal guarantee" onStore={() => undefined} />);
        expect((screen.getByRole("checkbox", { name: "Conditions" }) as HTMLInputElement).checked).toBe(true);
        expect((screen.getByRole("textbox", { name: "Loan conditions" }) as HTMLTextAreaElement).value).toBe("Personal guarantee");
    });

    it("closes straight away when empty", () => {
        render(<Harness initial="" onStore={() => undefined} />);
        const tick = screen.getByRole("checkbox", { name: "Conditions" });
        act(() => { fireEvent.click(tick); });
        act(() => { fireEvent.click(tick); });
        expect(screen.queryByRole("textbox", { name: "Loan conditions" })).toBeNull();
        expect(screen.queryByRole("button", { name: "Remove text?" })).toBeNull();
    });

    it("asks before clearing text, and clears it on the second click", () => {
        let stored = "Personal guarantee";
        render(<Harness initial={stored} onStore={(value) => { stored = value; }} />);
        const tick = screen.getByRole("checkbox", { name: "Conditions" });

        act(() => { fireEvent.click(tick); });

        // Still ticked, still holding its text, until confirmed.
        expect((tick as HTMLInputElement).checked).toBe(true);
        expect(stored).toBe("Personal guarantee");
        const confirm = screen.getByRole("button", { name: "Remove text?" });

        act(() => { fireEvent.click(confirm); });

        expect(stored).toBe("");
        expect((tick as HTMLInputElement).checked).toBe(false);
        expect(screen.queryByRole("textbox", { name: "Loan conditions" })).toBeNull();
    });

    it("keeps nothing hidden, so the documents have nothing hidden to print", () => {
        // Content can never sit behind an unticked box: text shows the
        // field ticked, and unticking clears what the documents read.
        let stored = "Only if the lender asks";
        render(<Harness initial={stored} onStore={(value) => { stored = value; }} />);
        act(() => { fireEvent.click(screen.getByRole("checkbox", { name: "Conditions" })); });
        act(() => { fireEvent.click(screen.getByRole("button", { name: "Remove text?" })); });
        expect(stored).toBe("");
        expect(document.body.textContent).not.toContain("Only if the lender asks");
    });

});
