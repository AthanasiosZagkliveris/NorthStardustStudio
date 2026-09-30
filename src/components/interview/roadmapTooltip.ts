/**
 * Where the Roadmap's hover tooltip goes (see StrategicRoadmapEditor):
 * kept free of the DOM so the placement can be tested on its own.
 */

/** Space kept between the tooltip and the window's edges. */
export const TOOLTIP_EDGE_MARGIN = 8;

/** Space between the tooltip and the bar or chip it describes. */
export const TOOLTIP_GAP = 6;

interface Box {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

/**
 * The tooltip's top-left corner, in window coordinates: ABOVE or
 * BELOW the element, never beside it -- on the side with more room
 * (above when they are equal), so it never covers the element.
 *
 * Its left edge starts where the element is first visible --
 * `visibleLeft` is the left edge of the timeline the reader can see,
 * so a bar scrolled in under the Theme names gets its tooltip over
 * the part that shows, not off in the hidden part. Always held inside
 * the window (and inside `band`, the part of it not under a fixed
 * header or footer, where one is given), so no edge cuts it off.
 */
export function placeTooltip(
    anchor: Box,
    size: { width: number; height: number },
    viewport: { width: number; height: number },
    visibleLeft: number,
    band: { top: number; bottom: number } = { top: 0, bottom: viewport.height }
): { left: number; top: number } {

    const start = Math.max(anchor.left, visibleLeft);

    const left = Math.min(
        Math.max(TOOLTIP_EDGE_MARGIN, start),
        Math.max(TOOLTIP_EDGE_MARGIN, viewport.width - TOOLTIP_EDGE_MARGIN - size.width)
    );

    const lowest = band.top + TOOLTIP_EDGE_MARGIN;
    const highest = band.bottom - TOOLTIP_EDGE_MARGIN - size.height;

    const roomAbove = anchor.top - TOOLTIP_GAP - lowest;
    const roomBelow = band.bottom - TOOLTIP_EDGE_MARGIN - (anchor.bottom + TOOLTIP_GAP);

    const top = roomAbove >= roomBelow
        ? anchor.top - TOOLTIP_GAP - size.height
        : anchor.bottom + TOOLTIP_GAP;

    return { left, top: Math.min(Math.max(lowest, top), Math.max(lowest, highest)) };

}
