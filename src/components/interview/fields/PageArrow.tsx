import { useLayoutEffect, useRef } from "react";

import NavArrow from "../../controls/NavArrow.tsx";
import { tileGapLevel } from "../tiles/SectionTiles.tsx";

/** How many page arrows are drawn now: the page's two (previous and next) share the one level. */
let mounted = 0;

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

    const node = useRef<HTMLButtonElement | null>(null);

    // Level with the gap between the two rows of the page's tiles (--arrow-level, read by the rails: they follow the arrow).
    useLayoutEffect(() => {
        const root = document.documentElement;
        const level = () => {
            // (The gap between the two rows of the page's tiles; where the page has none, the middle of its frame, the heading's underline to the footer.)
            const y = tileGapLevel();
            if (y !== null) {
                root.style.setProperty("--arrow-level", Math.round(y) + "px");
            }
        };
        mounted += 1;
        level();
        // (The tiles settle to their size a little after the page is drawn: measured again until they have.)
        const later = [100, 250, 500, 900, 1500].map(delay => window.setTimeout(level, delay));
        window.addEventListener("resize", level);
        const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(level);
        observer?.observe(document.body);
        return () => {
            later.forEach(timer => window.clearTimeout(timer));
            window.removeEventListener("resize", level);
            observer?.disconnect();
            // (Only when the last arrow of the page goes: the other one of the pair, still there, keeps standing at it.)
            mounted -= 1;
            if (mounted === 0) {
                root.style.removeProperty("--arrow-level");
            }
        };
    }, []);

    return (
        <NavArrow
            ref={node}
            className="page-arrow"
            direction={direction}
            label={direction === "previous" ? "Previous page" : "Next page"}
            title={label}
            disabled={disabled}
            onClick={onClick}
        />
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
