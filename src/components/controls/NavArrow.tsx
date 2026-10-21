import { ButtonHTMLAttributes, forwardRef } from "react";

import "../../styles/nav-arrow.css";

/**
 * THE NAVIGATION ARROW: every arrow that goes to the previous or the next of something -- a page, a card, a section, a month, a year, a row -- is this one component
 * ("‹" and "›"; "«" and "»" for a longer step; "▲" and "▼" for up and down, `vertical`). Drawn as typed glyphs here and as a shape by the class a place gives it (`page-arrow`,
 * `org-calendar-month-nav-button`, `date-cell-popup-step`; the vertical one is the 32px square of the x and the "+", `nav-arrow-vertical`): the class says only where it
 * stands and how big it is. Its name (`label`) is what a screen reader says and what its tooltip says; a `title` is added only where it says more than the name (a key).
 */
const NavArrow = forwardRef<HTMLButtonElement, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children" | "aria-label"> & {
    direction: "previous" | "next";
    label: string;
    /** A longer step ("«", "»"). */
    long?: boolean;
    /** Up and down ("▲", "▼"): the move of a row. */
    vertical?: boolean;
}>(function NavArrow({ direction, label, long = false, vertical = false, className, ...rest }, ref) {
    const glyph = vertical ? (direction === "previous" ? "▲" : "▼") : direction === "previous" ? (long ? "«" : "‹") : (long ? "»" : "›");
    return (
        <button ref={ref} type="button" data-direction={direction} aria-label={label} className={(vertical ? "nav-arrow-vertical" : "") + (className ? (vertical ? " " : "") + className : "")} {...rest}>
            {glyph}
        </button>
    );
});

export default NavArrow;
