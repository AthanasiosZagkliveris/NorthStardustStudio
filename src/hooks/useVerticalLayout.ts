import { useEffect, useState } from "react";

/**
 * THE VERTICAL LAYOUT (layout rules section 23; owner, 2026-11-22 09:52 and 09:58 UTC+2): a window under 1100px wide, or taller than it is wide, stacks the page's chapters
 * (the one query in 07-floating-cards-and-page-layout.css, the same words here), and a dialog's tiles and boxes stand two a row there, one a row on a phone (Android's
 * compact window class, 600px and under).
 */
export const VERTICAL_QUERY = "(max-width: 1099px), (orientation: portrait)";
export const PHONE_QUERY = "(max-width: 600px)";
/**
 * THE MASTER TILES IN ONE ROW OF FOUR (owner, 2026-11-22 19:37 UTC+2, "Build 1-3 for Vertical Lay out"; layout rules section 23): in the vertical layout, a window
 * 880px wide or more (a small laptop, a landscape or a large portrait tablet) has room for the four master tiles of a chapter side by side at a good size.
 */
export const ROW_OF_FOUR_QUERY = "(max-width: 1099px) and (min-width: 880px), (orientation: portrait) and (min-width: 880px)";

/** How many master tiles stand in a row: 4 in the vertical layout from 880px wide, else 2 (the 2 x 2). */
export function masterAcross(): 2 | 4 {
    return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(ROW_OF_FOUR_QUERY).matches ? 4 : 2;
}

/** masterAcross(), kept current as the window turns or is resized. */
export function useMasterAcross(): 2 | 4 {
    const [across, setAcross] = useState(masterAcross);
    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return;
        }
        const query = window.matchMedia(ROW_OF_FOUR_QUERY);
        const update = () => setAcross(masterAcross());
        query.addEventListener?.("change", update);
        update();
        return () => query.removeEventListener?.("change", update);
    }, []);
    return across;
}

/** How many tiles a row a dialog's grid holds in the vertical layout: 2, 1 on a phone, or 0 where the chapters stand side by side (the grid's own rule). */
export function verticalAcross(): number {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return 0;
    }
    if (!window.matchMedia(VERTICAL_QUERY).matches) {
        return 0;
    }
    return window.matchMedia(PHONE_QUERY).matches ? 1 : 2;
}

/** verticalAcross(), kept current as the window turns or is resized. */
export function useVerticalAcross(): number {
    const [across, setAcross] = useState(verticalAcross);
    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return;
        }
        const queries = [window.matchMedia(VERTICAL_QUERY), window.matchMedia(PHONE_QUERY)];
        const update = () => setAcross(verticalAcross());
        queries.forEach(query => query.addEventListener?.("change", update));
        update();
        return () => queries.forEach(query => query.removeEventListener?.("change", update));
    }, []);
    return across;
}

/** Whether the window is a phone's (PHONE_QUERY): there the rails stand in a row in the footer's band (bullet-rail.css), and nothing is placed round an arrow in a column. */
export function isPhone(): boolean {
    return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(PHONE_QUERY).matches;
}
