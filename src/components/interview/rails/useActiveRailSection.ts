import { useCallback, useEffect, useRef, useState } from "react";

import { pickActiveRail } from "./railItems";

/** Where content starts below the fixed header (80px + 24px).
 *  Exported only for its test. */
export const RAIL_TOP_CLEARANCE = 104;

// A section counts as "reached" once its top is within this band
// under the header -- about a third of a screen, so the rail moves
// on while the new section is still near the top.
const REACHED_BAND = 240;

// Keys that scroll the page when pressed outside a field.
const SCROLL_KEYS = new Set(["PageUp", "PageDown", "ArrowUp", "ArrowDown", "Home", "End", " "]);

function railElements(ids: readonly string[]): HTMLElement[] {

    return ids
        .map(id => document.querySelector<HTMLElement>('[data-rail="' + CSS.escape(id) + '"]'))
        .filter((element): element is HTMLElement => element !== null);

}

/**
 * Which of the current page's sections the user is in: the one
 * last picked on the rail (pinned until the user scrolls or moves
 * into another section), else the one holding the focused field,
 * else the one scrolled to -- at the very bottom of the page, the
 * last section whose top is showing, so sections the page cannot
 * scroll far enough to reach still get their turn. The page itself
 * (the window) scrolls -- no inner scroll container -- so a window
 * scroll listener is enough. `resetKey` (the page number) sends it
 * back to the first section whenever the page changes.
 *
 * Returns the active id and `select`, which pins a bullet the rail
 * was clicked on so the scroll it starts cannot take it away.
 */
export function useActiveRailSection(
    ids: readonly string[],
    resetKey: unknown
): [string | null, (id: string) => void] {

    const [active, setActive] = useState<string | null>(ids[0] ?? null);
    const key = ids.join("|");

    const pinned = useRef<string | null>(null);

    const select = useCallback((id: string) => {
        pinned.current = id;
        setActive(id);
    }, []);

    // Keyed on `key` (the joined ids) and `resetKey` (the page number)
    // on purpose, not on `ids` itself -- a new array of the same ids
    // would otherwise re-subscribe every render.
    useEffect(() => {

        setActive(ids[0] ?? null);
        pinned.current = null;

        /** The id of the on-screen section holding the focused field, if any. */
        function focusedRail(): string | null {
            const holder = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>("[data-rail]");
            const id = holder?.dataset.rail;
            if (!holder || !id || !ids.includes(id)) {
                return null;
            }
            const rect = holder.getBoundingClientRect();
            return rect.bottom > RAIL_TOP_CLEARANCE && rect.top < window.innerHeight ? id : null;
        }

        /** The last section whose top shows, when the page is scrolled to its bottom. */
        function bottomRail(elements: HTMLElement[]): string | null {
            const atBottom = window.scrollY + window.innerHeight >=
                document.documentElement.scrollHeight - 2;
            if (!atBottom) {
                return null;
            }
            const visible = elements.filter(element => {
                const top = element.getBoundingClientRect().top;
                return top >= RAIL_TOP_CLEARANCE && top < window.innerHeight;
            });
            return visible.length > 0 ? visible[visible.length - 1].dataset.rail ?? null : null;
        }

        function fromScroll() {
            // A bullet picked on the rail holds through the scroll
            // its own jump starts.
            if (pinned.current) {
                setActive(pinned.current);
                return;
            }
            // A focused field outranks the scroll position while its
            // section is still on screen -- otherwise a nudge of the
            // wheel while typing would hand the bullet to the first
            // section of a shared row.
            const focused = focusedRail();
            if (focused) {
                setActive(focused);
                return;
            }
            const elements = railElements(ids);
            if (elements.length === 0) {
                return;
            }
            const bottom = bottomRail(elements);
            if (bottom) {
                setActive(bottom);
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
                if (pinned.current && pinned.current !== id) {
                    pinned.current = null;
                }
                setActive(pinned.current ?? id);
            }
        }

        // Only the user scrolling releases a pin -- the smooth scroll
        // a rail jump starts fires the same scroll events.
        function release() {
            pinned.current = null;
        }

        function fromKey(event: KeyboardEvent) {
            const target = event.target as HTMLElement | null;
            if (!SCROLL_KEYS.has(event.key) ||
                target?.closest("input, textarea, select, [contenteditable]")) {
                return;
            }
            release();
        }

        window.addEventListener("scroll", fromScroll, { passive: true });
        document.addEventListener("focusin", fromFocus);
        window.addEventListener("wheel", release, { passive: true });
        window.addEventListener("touchmove", release, { passive: true });
        window.addEventListener("keydown", fromKey);

        return () => {
            window.removeEventListener("scroll", fromScroll);
            document.removeEventListener("focusin", fromFocus);
            window.removeEventListener("wheel", release);
            window.removeEventListener("touchmove", release);
            window.removeEventListener("keydown", fromKey);
        };

    }, [key, resetKey]);

    return [active, select];

}

/**
 * Takes the user to a section: opens it if it is folded (the same
 * `aria-expanded="false"` toggle jumpTo.ts relies on) and scrolls it
 * just under the header. Scroll only -- keyboard focus stays where it
 * is, so a click never drops the cursor into a field.
 */
export function scrollToRailSection(id: string): void {

    const target = document.querySelector<HTMLElement>('[data-rail="' + CSS.escape(id) + '"]');

    if (!target) {
        return;
    }

    const toggle = target.querySelector<HTMLButtonElement>(':scope > * > .strategy-box-toggle[aria-expanded="false"], :scope > .strategy-box-toggle[aria-expanded="false"]');
    toggle?.click();

    // Next frame, so a section just opened above has its full height.
    window.requestAnimationFrame(() => {
        const top = target.getBoundingClientRect().top + window.scrollY - RAIL_TOP_CLEARANCE;
        const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
        window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
    });

}
