import { ButtonHTMLAttributes, forwardRef } from "react";

/**
 * THE NAVIGATION ARROW: every arrow that goes to the previous or the next of something -- a page, a card, a section, a month, a year -- is this one component
 * ("‹" and "›"; "«" and "»" for a longer step). Drawn as typed glyphs here and as a shape by the class a place gives it (`page-arrow`, `org-calendar-month-nav-button`,
 * `date-cell-popup-step`): the class says only where it stands and how big it is. Its name (`label`) is what a screen reader says; a tooltip (`title`) is added only
 * where it says more than the name (a key, where it goes).
 */
const NavArrow = forwardRef<HTMLButtonElement, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children" | "aria-label"> & {
    direction: "previous" | "next";
    label: string;
    /** A longer step ("«", "»"). */
    long?: boolean;
}>(function NavArrow({ direction, label, long = false, ...rest }, ref) {
    return (
        <button ref={ref} type="button" data-direction={direction} aria-label={label} {...rest}>
            {direction === "previous" ? (long ? "«" : "‹") : (long ? "»" : "›")}
        </button>
    );
});

export default NavArrow;
