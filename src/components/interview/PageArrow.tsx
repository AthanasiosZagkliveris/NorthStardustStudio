/**
 * A page arrow: "‹" (the previous page) or "›" (the next), named
 * "Previous page" / "Next page", its tooltip saying where it goes
 * where that is not simply a page (`label`). Drawn,
 * not typed (.page-arrow, global.css); the character stays as the
 * fallback.
 */
export default function PageArrow({

    direction,

    label,

    disabled = false,

    onClick

}: {

    direction: "previous" | "next";
    label?: string;
    disabled?: boolean;
    onClick: () => void;

}) {

    return (
        <button
            type="button"
            className="page-arrow"
            data-direction={direction}
            aria-label={direction === "previous" ? "Previous page" : "Next page"}
            title={label ?? (direction === "previous" ? "Previous page" : "Next page")}
            disabled={disabled}
            onClick={onClick}
        >
            {direction === "previous" ? "‹" : "›"}
        </button>
    );

}

/**
 * Whether a key press may turn the page: an arrow key pressed with no
 * modifier, where nothing else uses the arrows -- not in a field, a
 * picker, a list, a menu, a movable box, a dialog, the search or the
 * Notepad.
 */
export function pageKey(event: KeyboardEvent): "previous" | "next" | null {

    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
        return null;
    }

    const direction = event.key === "ArrowLeft" ? "previous" : event.key === "ArrowRight" ? "next" : null;

    if (!direction) {
        return null;
    }

    const target = event.target instanceof Element ? event.target : null;

    if (target?.closest([
        "input", "textarea", "select", "[contenteditable=true]",
        "[role=listbox]", "[role=menu]", "[role=menubar]", "[role=slider]", "[role=radiogroup]", "[role=tablist]", "[role=grid]",
        "[role=dialog]", "[role=group][tabindex]", "[aria-haspopup]",
        ".option-picker", ".month-picker", ".notepad-panel", ".search-overlay"
    ].join(", "))) {
        return null;
    }

    // An open dialog or search anywhere: the page is not turned under it.
    if (document.querySelector(".search-overlay, .confirmation-overlay, [role=dialog][aria-modal=true]")) {
        return null;
    }

    return direction;

}
