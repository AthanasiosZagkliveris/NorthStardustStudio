import { useEffect, useState } from "react";

/**
 * THE VERTICAL LAYOUT (layout rules section 23; owner, 2026-11-22 09:52 and 09:58 UTC+2): a window under 1100px wide, or taller than it is wide, stacks the page's chapters
 * (the one query in 07-floating-cards-and-page-layout.css, the same words here), and a dialog's tiles and boxes stand two a row there, one a row on a phone (Android's
 * compact window class, 600px and under).
 */
// (THE TIERS (owner, 2026-11-23 23:21 UTC+2, the responsive layout approved: docs/archive/proposals/responsive-layout-2026-11-23.md, sections 4.1 and 4.5): the chapters
// stand side by side only in a landscape window 900px wide or more and 640px tall or more; a narrower, portrait or shorter window stacks them.)
export const VERTICAL_QUERY = "(max-width: 900px), (orientation: portrait), (max-height: 639px)";
export const PHONE_QUERY = "(max-width: 600px)";
/**
 * THE MASTER TILES IN ONE ROW OF FOUR (owner, 2026-11-22 19:37 UTC+2, "Build 1-3 for Vertical Lay out"; layout rules section 23): in the vertical layout, a window
 * 880px wide or more (a small laptop, a landscape or a large portrait tablet) has room for the four master tiles of a chapter side by side at a good size.
 */
// (Since 2026-11-23 23:21 UTC+2: only a phone turned to landscape -- under 480px tall -- lays a chapter's four tiles in one row, so a chapter fits one screen height
// (docs/archive/proposals/responsive-layout-2026-11-23.md, section 4.5); a tablet keeps two a row.)
export const ROW_OF_FOUR_QUERY = "(orientation: landscape) and (max-height: 479px)";

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

/** How many tiles a row a dialog's grid holds in the vertical layout: 2 (a phone too), or 0 where the chapters stand side by side (the grid's own rule). */
export function verticalAcross(): number {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
        return 0;
    }
    if (!window.matchMedia(VERTICAL_QUERY).matches) {
        return 0;
    }
    // (Two a row on a phone too (owner, 2026-11-22 20:35 UTC+2, a phone's Profiles tiles the window's width: "fix ... the dialogue tile sizes. Also check the other
    // tiles"), as the master tiles are: one a row made squares as wide as the phone.)
    // (THREE A ROW WIDER THAN A PHONE (owner, 2026-11-26, a tablet in portrait's Resources dialog: "Use 3x grid"): a dialog's grid three across, as where the
    // chapters stand side by side.)
    return window.matchMedia(PHONE_QUERY).matches ? 2 : 3;
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

/**
 * WHERE THE RAILS STAND IN THE FOOTER'S BAND: the stacked layout (VERTICAL_QUERY) and any touch screen (owner, 2026-11-24 00:21 UTC+2: "When the tablet is on
 * landscape, place the rail at the footing"); bullet-rail.css says the same with "(pointer: coarse)".
 */
// (A window 700px tall or less -- a small laptop -- too (owner, 2026-11-24 10:12 UTC+2: "on small laptop ... the navigation arrow to the bottom part, and the rail in the middle").)
// (Since 2026-11-25 the stacked layout alone (owner, 2026-11-25: "Laptop NEVER gets rail at its button!"; "the rail system should be the same across all the app's pages, per screen size"; 2026-11-24 10:12: "On the tablet (landscape), the rail should be at the side").)
export const BAND_QUERY = VERTICAL_QUERY;

/** Whether the page's rails stand in the footer's band (BAND_QUERY). */
export function railsInBand(): boolean {
    return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(BAND_QUERY).matches;
}
