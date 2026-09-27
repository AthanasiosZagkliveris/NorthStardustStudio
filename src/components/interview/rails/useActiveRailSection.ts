import { useEffect, useState } from "react";

import { pickActiveRail } from "./railItems";

/** Where content starts below the fixed header (80px + 24px). */
export const RAIL_TOP_CLEARANCE = 104;

// A section counts as "reached" once its top is within this band
// under the header -- about a third of a screen, so the rail moves
// on while the new section is still near the top.
const REACHED_BAND = 240;

function railElements(ids: readonly string[]): HTMLElement[] {

    return ids
        .map(id => document.querySelector<HTMLElement>('[data-rail="' + CSS.escape(id) + '"]'))
        .filter((element): element is HTMLElement => element !== null);

}

/**
 * Which of the current page's sections the user is in: the one
 * holding the focused field when there is one, otherwise the one
 * scrolled to. The page itself (the window) scrolls -- no inner
 * scroll container -- so a window scroll listener is enough.
 * `resetKey` (the page number) sends it back to the first section
 * whenever the page changes.
 */
export function useActiveRailSection(ids: readonly string[], resetKey: unknown): string | null {

    const [active, setActive] = useState<string | null>(ids[0] ?? null);
    const key = ids.join("|");

    // Keyed on `key` (the joined ids) and `resetKey` (the page number)
    // on purpose, not on `ids` itself -- a new array of the same ids
    // would otherwise re-subscribe every render.
    useEffect(() => {

        setActive(ids[0] ?? null);

        function fromScroll() {
            const elements = railElements(ids);
            if (elements.length === 0) {
                return;
            }
            const index = pickActiveRail(
                elements.map(element => element.getBoundingClientRect().top),
                RAIL_TOP_CLEARANCE + REACHED_BAND
            );
            setActive(elements[index].dataset.rail ?? null);
        }

        function fromFocus(event: FocusEvent) {
            const holder = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-rail]");
            const id = holder?.dataset.rail;
            if (id && ids.includes(id)) {
                setActive(id);
            }
        }

        window.addEventListener("scroll", fromScroll, { passive: true });
        document.addEventListener("focusin", fromFocus);

        return () => {
            window.removeEventListener("scroll", fromScroll);
            document.removeEventListener("focusin", fromFocus);
        };

    }, [key, resetKey]);

    return active;

}

/**
 * Takes the user to a section: opens it if it is folded (the same
 * `aria-expanded="false"` toggle jumpTo.ts relies on), scrolls it
 * just under the header, and puts the cursor in its first field.
 */
export function scrollToRailSection(id: string): void {

    const target = document.querySelector<HTMLElement>('[data-rail="' + CSS.escape(id) + '"]');

    if (!target) {
        return;
    }

    const toggle = target.querySelector<HTMLButtonElement>(':scope > * > .strategy-box-toggle[aria-expanded="false"], :scope > .strategy-box-toggle[aria-expanded="false"]');
    toggle?.click();

    // Focus first, then scroll: Chrome cancels an in-progress smooth
    // scroll on a programmatic focus, even with `preventScroll`.
    window.requestAnimationFrame(() => {
        target.querySelector<HTMLElement>("input:not([disabled]), textarea:not([disabled]), select:not([disabled])")
            ?.focus({ preventScroll: true });
        const top = target.getBoundingClientRect().top + window.scrollY - RAIL_TOP_CLEARANCE;
        const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
        window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
    });

}
