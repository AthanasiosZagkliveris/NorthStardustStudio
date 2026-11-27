import { useEffect } from "react";
import { PHONE_QUERY, ROW_OF_FOUR_QUERY } from "./useVerticalLayout.ts";

/** A phone, upright (600px and under) or turned to landscape (under 480px tall): the windows whose pages draw no chapter frames (layout rules, section 23). */
export const ANY_PHONE_QUERY = PHONE_QUERY + ", " + ROW_OF_FOUR_QUERY;

/** The chapters of a page: the box that gives a group of master tiles its ground (a chapter's card, a Segment's chapter, a Capability's Systems). */
const CHAPTERS = ".answer-columns.business-capability > .business-foundation-card, .segment-chapter, .capability-systems-frame, .page-group > .business-foundation-card";

/** A colour with nothing to show. */
const clear = (colour: string) => colour === "" || colour === "transparent" || /rgba\([^)]*,\s*0\)$/.test(colour);

/**
 * A PHONE'S PAGE (owner, 2026-11-27 14:09 to 14:14 UTC+2: "On mobile version, should not exist any chapter frame"; "Use the chapter's colour as background colour
 * for each page"; "the user should be able by finger scrolling, to swap pages"): the page's ground is its chapters' colour -- the first chapter's behind the page's
 * title, the last one's under the last chapter to the window's foot (`--phone-ground-top`, `--phone-ground-foot` on the root; 07-floating-cards-and-page-layout.css)
 * -- and a sideways swipe on the page moves to the previous or the next page, as the page arrows do.
 */
export function usePhonePage(): void {
    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return;
        }
        const root = document.documentElement;
        const query = window.matchMedia(ANY_PHONE_QUERY);

        const paint = () => {
            if (!query.matches) {
                root.style.removeProperty("--phone-ground-top");
                root.style.removeProperty("--phone-ground-foot");
                return;
            }
            const grounds = [...document.querySelectorAll<HTMLElement>(CHAPTERS)]
                .filter(chapter => chapter.offsetWidth > 0)
                .sort((one, other) => one.getBoundingClientRect().top - other.getBoundingClientRect().top)
                .map(chapter => getComputedStyle(chapter).backgroundColor)
                .filter(colour => !clear(colour));
            if (grounds.length === 0) {
                root.style.removeProperty("--phone-ground-top");
                root.style.removeProperty("--phone-ground-foot");
                return;
            }
            root.style.setProperty("--phone-ground-top", grounds[0]);
            root.style.setProperty("--phone-ground-foot", grounds[grounds.length - 1]);
        };

        // (The chapters come and go with the page, a Segment and a Capability: painted again when the page changes.)
        let frame = 0;
        const later = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(paint);
        };
        const watcher = typeof MutationObserver === "undefined" ? null : new MutationObserver(later);
        const main = document.querySelector(".conversation-page") ?? document.body;
        watcher?.observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
        query.addEventListener?.("change", later);
        paint();

        // THE SWIPE: a finger that moves sideways at least 60px, twice as far as it moves up or down, on the page itself (not in a dialog, a card, a field or
        // anything that scrolls sideways), presses the page arrow on that side: to the left, the next page; to the right, the previous one.
        let start: { x: number; y: number } | null = null;
        const onStart = (event: TouchEvent) => {
            const target = event.target as Element | null;
            const inside = target?.closest?.("input, textarea, select, [contenteditable], .section-tile-dialog, .floating-card-host, .popup-panel, [data-scroll-x]");
            start = !query.matches || event.touches.length !== 1 || inside ? null : { x: event.touches[0].clientX, y: event.touches[0].clientY };
        };
        const onEnd = (event: TouchEvent) => {
            if (!start || event.changedTouches.length === 0) {
                return;
            }
            const dx = event.changedTouches[0].clientX - start.x;
            const dy = event.changedTouches[0].clientY - start.y;
            start = null;
            if (Math.abs(dx) < 60 || Math.abs(dx) < 2 * Math.abs(dy) || document.querySelector(".section-tile-dialog, .floating-card-host")) {
                return;
            }
            const direction = dx < 0 ? "next" : "previous";
            const arrow = [...document.querySelectorAll<HTMLButtonElement>(`.page-arrow[data-direction="${direction}"]:not(.carousel-arrow)`)].find(button => button.offsetWidth > 0 && !button.disabled);
            arrow?.click();
        };
        document.addEventListener("touchstart", onStart, { passive: true });
        document.addEventListener("touchend", onEnd, { passive: true });

        return () => {
            cancelAnimationFrame(frame);
            watcher?.disconnect();
            query.removeEventListener?.("change", later);
            document.removeEventListener("touchstart", onStart);
            document.removeEventListener("touchend", onEnd);
            root.style.removeProperty("--phone-ground-top");
            root.style.removeProperty("--phone-ground-foot");
        };
    }, []);
}
