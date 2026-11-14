import { ButtonHTMLAttributes } from "react";

/**
 * THE IN-CELL x (library BTN.XCL.001.003; docs/ai/layout-rules.md, section 10, "Which x"): the x that stands INSIDE a cell, at its right end -- a channel
 * journey stage's action line, a channel expense's linked action (the chip #12, #14 ...; owner, 2026-11-14 12:33 and 12:38). No frame, no outline, no fill: the X alone, in the danger red, on a 24px target (--size-cell-x).
 * Under the pointer or the keyboard focus it grows by a fifth and takes a soft red glow; the focus adds the focus ring; with reduced motion it only glows
 * (remove-button.css). A card's or a row's own x stays the framed RemoveButton. Its name (aria-label) says what it removes.
 */
export default function CellRemoveButton({ className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button type="button" {...rest} className={"cell-remove" + (className ? " " + className : "")}>
            ×
        </button>
    );
}
