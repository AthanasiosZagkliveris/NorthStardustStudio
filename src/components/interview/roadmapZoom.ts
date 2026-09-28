/**
 * The Roadmap's two zoom levels and the arithmetic behind them (see
 * StrategicRoadmapEditor). Kept free of React and the DOM so the
 * mapping and the anchoring can be tested on their own.
 */

/** Quarters (the default) or months. */
export type RoadmapZoom = "quarters" | "months";

/**
 * A month column's width once zoomed. 96px holds a month label
 * ("Sep") many times over, and gives a one-quarter Objective 288px
 * -- about 25 characters of bar text at the body size, against the
 * 80-odd pixels ("1. Close the fu…") it has in the quarter view at
 * 1920. Wider and a three-year period stops being scannable by
 * scrolling; narrower and a one-month bar cannot hold its number.
 */
export const ROADMAP_MONTH_WIDTH = 96;

/**
 * How much wheel travel makes one step. A mouse notch reports about
 * 100px in one event; a trackpad or a pinch (ctrl+wheel) sends many
 * small ones, which add up to this before anything changes.
 */
export const ROADMAP_WHEEL_STEP = 50;

/**
 * A pause longer than this ends a wheel gesture. Until it does, the
 * rest of a gesture that has already zoomed is swallowed, so one
 * notch -- or one trackpad flick and its inertia -- is one step.
 */
export const ROADMAP_WHEEL_GESTURE_GAP = 150;

export const ROADMAP_MONTH_LABELS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
] as const;

/**
 * The level a vertical wheel movement asks for, or null when the
 * roadmap is already there -- in which case the wheel is left to
 * scroll the page, so the reader is never trapped. Up (negative
 * deltaY) zooms in.
 */
export function wheelZoomTarget(zoom: RoadmapZoom, deltaY: number): RoadmapZoom | null {

    if (deltaY < 0) {
        return zoom === "quarters" ? "months" : null;
    }

    if (deltaY > 0) {
        return zoom === "months" ? "quarters" : null;
    }

    return null;

}

/** A wheel event's vertical travel in pixels, whatever unit it came in. */
export function wheelPixels(deltaY: number, deltaMode: number): number {

    // 1 = lines, 2 = pages. Either is one whole notch or more.
    if (deltaMode === 1) {
        return deltaY * 16;
    }

    if (deltaMode === 2) {
        return deltaY * ROADMAP_WHEEL_STEP * 4;
    }

    return deltaY;

}

/**
 * Where a month falls across a track, in pixels from its left edge.
 * The same proportion at both levels -- only the track's width
 * changes -- so a bar starts and ends on its own month either way.
 */
export function monthX(month: number, spanStart: number, spanMonths: number, trackWidth: number): number {
    return ((month - spanStart) / spanMonths) * trackWidth;
}

/** How far across a track (0..1) a pointer at clientX sits. */
export function trackFraction(clientX: number, trackLeft: number, trackWidth: number): number {

    if (trackWidth <= 0) {
        return 0;
    }

    return Math.min(1, Math.max(0, (clientX - trackLeft) / trackWidth));

}

/**
 * The scroll offset that puts the same moment back under the
 * pointer once the track has widened.
 *
 * trackOffset is the track's left edge within the scrolling
 * content, pointerOffset the pointer's distance from the scroller's
 * left edge. The point `fraction` of the way across the track sits
 * at trackOffset + fraction * trackWidth in the content, and the
 * pointer shows content position scrollLeft + pointerOffset -- so the
 * two meet when scrollLeft is the difference. The browser clamps it
 * where the timeline runs out.
 */
export function anchoredScrollLeft(
    trackOffset: number,
    trackWidth: number,
    fraction: number,
    pointerOffset: number
): number {
    return trackOffset + fraction * trackWidth - pointerOffset;
}
