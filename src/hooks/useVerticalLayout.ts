import { useEffect, useState } from "react";

/**
 * THE VERTICAL LAYOUT (layout rules section 23; owner, 2026-11-22 09:52 and 09:58 UTC+2): a window under 1100px wide, or taller than it is wide, stacks the page's chapters
 * (the one query in 07-floating-cards-and-page-layout.css, the same words here), and a dialog's tiles and boxes stand two a row there, one a row on a phone (Android's
 * compact window class, 600px and under).
 */
export const VERTICAL_QUERY = "(max-width: 1099px), (orientation: portrait)";
export const PHONE_QUERY = "(max-width: 600px)";

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
