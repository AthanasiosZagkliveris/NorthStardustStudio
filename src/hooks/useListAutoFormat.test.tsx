import { describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";

import { useListAutoFormat } from "./useListAutoFormat";

// A minimal wrapper that wires the hook onto a real, controlled
// <textarea> exactly the way the hook's own doc comment describes:
// spread onChange/onKeyDown onto the element, merge textareaRef in.
// Firing a DOM `change` event with a chosen target.value AND
// target.selectionStart (rather than simulating literal keystrokes)
// reproduces both a single keystroke and a multi-line paste, because
// the hook itself has no separate "this was a paste" signal to rely
// on -- it detects both the same way, by diffing old vs. new value
// (see handleChange's own comment). That's what makes this a valid,
// deterministic way to drive the exact code path a real paste goes
// through, without needing a synthetic ClipboardEvent.
function TestField({ initialValue }: { initialValue: string }) {

    const [value, setValue] = useState(initialValue);
    const { textareaRef, onChange, onKeyDown } = useListAutoFormat(value, setValue);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            data-testid="field"
        />
    );

}

function getField(): HTMLTextAreaElement {
    return screen.getByTestId("field") as HTMLTextAreaElement;
}

// Fires a `change` event carrying both the new value and where the
// raw (browser-committed) cursor landed -- the two pieces of
// information handleChange actually reads (event.target.value and
// event.target.selectionStart), exactly as a real typed character or
// a real paste would leave them.
function typeOrPaste(field: HTMLTextAreaElement, nextValue: string, rawCursor: number): void {

    fireEvent.change(field, {
        target: { value: nextValue, selectionStart: rawCursor, selectionEnd: rawCursor }
    });

}

afterEach(cleanup);

describe("useListAutoFormat", () => {

    it("turns a plain '- ' at the start of a line into a real bullet", () => {

        render(<TestField initialValue="" />);
        const field = getField();

        // Simulates typing "-" then " " as two separate keystrokes,
        // the same way a real user typing would trigger BULLET_TRIGGER
        // one character at a time.
        typeOrPaste(field, "-", 1);
        typeOrPaste(field, "- ", 2);

        expect(field.value).toBe("• ");

    });

    it("normalizes every '- ' line in a pasted multi-line block into real bullets", () => {

        render(<TestField initialValue="" />);
        const field = getField();

        const pasted = "- First\n- Second\n- Third";

        typeOrPaste(field, pasted, pasted.length);

        expect(field.value).toBe("• First\n• Second\n• Third");

    });

    it("keeps a renumbered run sequential when Enter inserts a new item in the middle", () => {

        render(<TestField initialValue={"1. First\n2. Second\n"} />);
        const field = getField();

        // Cursor at the end of "1. First" (right before its own
        // newline) -- pressing Enter there should insert a new "2. "
        // line and bump the old "2. Second" down to "3. Second".
        const cursor = "1. First".length;
        field.setSelectionRange(cursor, cursor);

        fireEvent.keyDown(field, { key: "Enter" });

        expect(field.value).toBe("1. First\n2. \n3. Second\n");

    });

    // Documents a confirmed, currently-open bug (see
    // docs/ai/outstanding-findings.md, "useListAutoFormat -- cursor
    // lands mid-word after a paste whose renumbering crosses a
    // digit-count boundary"), rather than asserting the bug's
    // behavior as correct. Uses `it.fails` (not a plain `it`, and not
    // `it.skip`) deliberately: the assertions below still run and are
    // still expected to fail internally -- `it.fails` is what reports
    // that as an overall PASS to `npm test` and CI, so this one known
    // issue doesn't leave the suite permanently red and train anyone
    // watching to ignore red checks. The moment the real fix lands,
    // these assertions will start succeeding, which `it.fails` turns
    // into a visible, un-ignorable FAILURE -- the signal to remove the
    // `.fails` modifier and close the Outstanding Findings entry,
    // instead of the fix silently going unnoticed.
    it.fails("keeps the cursor at the end of a pasted numbered block whose renumbering adds a digit", () => {

        const before = Array.from({ length: 9 }, (_, i) => `${i + 1}. Item ${String.fromCharCode(65 + i)}`).join("\n") + "\n";
        // before = "1. Item A\n2. Item B\n...\n9. Item I\n" -- an
        // existing run already at 9, one digit away from the
        // boundary the paste below needs to cross.

        render(<TestField initialValue={before} />);
        const field = getField();

        const pasted = "1. New X\n2. New Y";
        const rawValue = before + pasted;
        const rawCursor = rawValue.length; // cursor lands right after the pasted text, as a real paste leaves it

        typeOrPaste(field, rawValue, rawCursor);

        // The renumbering itself is correct: continuing the existing
        // 1-9 run turns the pasted "1./2." into "10./11.".
        expect(field.value).toBe(before + "10. New X\n11. New Y");

        // The cursor should land at the very end of the now-longer
        // rewritten value (right after "New Y") -- but
        // `pendingSelection` is computed only from
        // normalizeBulletLines' length delta (zero, for a purely
        // numbered paste), never from renumberNumberedBlocks' own
        // delta (+2, for "1."->"10." and "2."->"11."), so it
        // currently lands 2 characters short, inside "New Y" itself.
        expect(field.selectionStart).toBe(field.value.length);

    });

});
