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
            // (SIDEWAYS, THE ARROWS AND BACK ON THE TILES' EDGES (owner, 2026-11-28, phone round 5, points 16 and 21): where the first row of master tiles starts
            // and the last ends, from the window's top and foot -- the rail's "▲" and "▼" and Back stand on them (07-floating-cards-and-page-layout.css).)
            const tiles = [...document.querySelectorAll<HTMLElement>(".section-tiles-quad .section-tile, .capability-systems-frame .section-tile")].map(tile => tile.getBoundingClientRect()).filter(box => box.width > 0);
            if (tiles.length > 0) {
                root.style.setProperty("--phone-tiles-top", Math.round(Math.min(...tiles.map(box => box.top)) + window.scrollY) + "px");
                root.style.setProperty("--phone-tiles-foot", Math.round(window.innerHeight - Math.max(...tiles.map(box => box.bottom)) - window.scrollY) + "px");
            }
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

        // THE SWIPE: a finger that moves sideways at least 60px, twice as far as it moves up or down, presses the arrow on that side: to the left, the next page; to
        // the right, the previous one. On a layer with its own arrows -- a dialog's, a card's, the Workbook's and the Handbook's tabs -- its arrows, the topmost
        // layer's; on a page, the page's (owner, 2026-11-27 19:09 UTC+2, phone round 3, point 3: "drag a finger left/right/up/down to scroll or change pages,
        // wherever possible"). Up and down the page scrolls as it always does. A swipe that starts in a field, an open list, or anything that scrolls sideways
        // itself (a wide table, the band's dots) is that thing's own.
        // (Only where the finger is on what is wider than its scroller -- a table wider than the document -- not anywhere in a document that holds one.)
        const scrollsSideways = (from: Element | null) => {
            let widest = 0;
            for (let node = from; node && node !== document.body; node = node.parentElement) {
                if (node.scrollWidth > node.clientWidth + 1 && widest > node.clientWidth + 1 && /(auto|scroll)/.test(getComputedStyle(node).overflowX)) {
                    return true;
                }
                widest = Math.max(widest, node.getBoundingClientRect().width);
            }
            return false;
        };
        const shown = (button: HTMLButtonElement) => button.offsetWidth > 0 && !button.disabled && getComputedStyle(button).visibility !== "hidden";
        let start: { x: number; y: number } | null = null;
        const onStart = (event: TouchEvent) => {
            const target = event.target as Element | null;
            const inside = target?.closest?.("input, textarea, select, [contenteditable], .popup-panel, [data-scroll-x]") || scrollsSideways(target);
            start = !query.matches || event.touches.length !== 1 || inside ? null : { x: event.touches[0].clientX, y: event.touches[0].clientY };
        };
        const onEnd = (event: TouchEvent) => {
            if (!start || event.changedTouches.length === 0) {
                return;
            }
            const dx = event.changedTouches[0].clientX - start.x;
            const dy = event.changedTouches[0].clientY - start.y;
            start = null;
            if (Math.abs(dx) < 60 || Math.abs(dx) < 2 * Math.abs(dy)) {
                return;
            }
            const direction = dx < 0 ? "next" : "previous";
            // (A layer's arrows first, the topmost -- the last drawn -- of them; with none, the page's.)
            const layer = [...document.querySelectorAll<HTMLButtonElement>(`.page-arrow.carousel-arrow[data-direction="${direction}"]`)].filter(shown);
            const page = [...document.querySelectorAll<HTMLButtonElement>(`.page-arrow[data-direction="${direction}"]:not(.carousel-arrow)`)].filter(shown);
            const covered = document.querySelector(".section-tile-dialog, .floating-card-host") !== null;
            const arrow = layer.length > 0 ? layer[layer.length - 1] : covered ? undefined : page[0];
            arrow?.click();
        };
        document.addEventListener("touchstart", onStart, { passive: true });
        document.addEventListener("touchend", onEnd, { passive: true });

        // THE SCROLL MARKER (owner, 2026-11-27 19:09 UTC+2, phone round 3, point 12: "Long pages get a scroll position marker on the right side, so the user sees
        // how long the text is and where they are"): a phone draws its own scrollbar only while the finger moves; a page or a layer more than a screen and a fifth
        // long keeps a thin marker at the window's right edge, between the title's rule and the footer's band, as long as the part on screen and where it stands.
        const marker = document.createElement("div");
        marker.className = "phone-scroll-marker";
        marker.setAttribute("aria-hidden", "true");
        const thumb = document.createElement("div");
        thumb.className = "phone-scroll-marker-thumb";
        marker.appendChild(thumb);
        document.body.appendChild(marker);
        let scroller: Element = document.scrollingElement ?? document.documentElement;
        const place = () => {
            const long = query.matches && scroller.isConnected && scroller.scrollHeight > scroller.clientHeight * 1.2;
            marker.hidden = !long;
            if (!long) {
                return;
            }
            const page = scroller === document.scrollingElement;
            const box = page ? { top: 0, bottom: window.innerHeight } : scroller.getBoundingClientRect();
            const rule = document.querySelector(".interview-divider")?.getBoundingClientRect().bottom ?? 0;
            const band = [...document.querySelectorAll(".workspace-footer, .carousel-rail")].map(node => node.getBoundingClientRect()).filter(edge => edge.height > 0).reduce((top, edge) => Math.min(top, edge.top), window.innerHeight);
            const top = Math.max(box.top, rule) + 4;
            const bottom = Math.min(box.bottom, band) - 4;
            const track = Math.max(0, bottom - top);
            const size = Math.max(24, track * scroller.clientHeight / scroller.scrollHeight);
            const travel = scroller.scrollHeight - scroller.clientHeight;
            marker.style.top = top + "px";
            marker.style.height = track + "px";
            thumb.style.height = size + "px";
            thumb.style.transform = `translateY(${travel > 0 ? (track - size) * scroller.scrollTop / travel : 0}px)`;
        };
        // (The marker follows what last scrolled: the page, or a layer's own body -- the Handbook's, a dialog's.)
        const onScroll = (event: Event) => {
            // (A DROP-DOWN CLOSES WHEN ITS TITLE SCROLLS UNDER THE PAGE'S TITLE (owner, 2026-11-28, phone round 5, point 8): a chapter's or a Segment's open
            // drop-down stood over the page's title once its own title had gone under it; its arrow is pressed again, as a press elsewhere closes it.)
            if (query.matches) {
                const rule = document.querySelector(".interview-divider")?.getBoundingClientRect().bottom ?? 0;
                document.querySelectorAll<HTMLButtonElement>(".label-arrow[aria-expanded=\"true\"]").forEach(arrow => {
                    if (!arrow.closest(".interview-header") && arrow.getBoundingClientRect().bottom < rule) {
                        arrow.click();
                    }
                });
            }
            const target = event.target;
            scroller = target instanceof Element && target.scrollHeight > target.clientHeight + 1 ? target : document.scrollingElement ?? document.documentElement;
            place();
        };
        const replace = () => {
            if (!scroller.isConnected || scroller.getBoundingClientRect().height === 0) {
                scroller = document.scrollingElement ?? document.documentElement;
            }
            const layer = [...document.querySelectorAll(".section-tile-dialog-body")].filter(body => body.getBoundingClientRect().height > 0 && body.scrollHeight > body.clientHeight + 1).pop();
            if (layer) {
                scroller = layer;
            }
            place();
        };
        let markerFrame = 0;
        const markerWatcher = typeof MutationObserver === "undefined" ? null : new MutationObserver(() => {
            cancelAnimationFrame(markerFrame);
            markerFrame = requestAnimationFrame(replace);
        });
        markerWatcher?.observe(document.body, { childList: true, subtree: true });
        document.addEventListener("scroll", onScroll, { passive: true, capture: true });
        window.addEventListener("resize", replace);
        replace();

        return () => {
            markerWatcher?.disconnect();
            cancelAnimationFrame(markerFrame);
            document.removeEventListener("scroll", onScroll, { capture: true });
            window.removeEventListener("resize", replace);
            marker.remove();
            cancelAnimationFrame(frame);
            watcher?.disconnect();
            query.removeEventListener?.("change", later);
            document.removeEventListener("touchstart", onStart);
            document.removeEventListener("touchend", onEnd);
            root.style.removeProperty("--phone-ground-top");
            root.style.removeProperty("--phone-ground-foot");
            root.style.removeProperty("--phone-tiles-top");
            root.style.removeProperty("--phone-tiles-foot");
        };
    }, []);
}
