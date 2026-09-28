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
 * The tooltip's top-left corner, in window coordinates.
 *
 * Above the element, starting where the element is first visible --
 * `visibleLeft` is the left edge of the timeline the reader can see,
 * so a bar scrolled in under the Theme names gets its tooltip over
 * the part that shows, not off in the hidden part. Below it when
 * there is no room above. Always held inside the window, so neither
 * edge cuts it off.
 */
export function placeTooltip(
    anchor: Box,
    size: { width: number; height: number },
    viewport: { width: number; height: number },
    visibleLeft: number
): { left: number; top: number } {

    const start = Math.max(anchor.left, visibleLeft);

    const left = Math.min(
        Math.max(TOOLTIP_EDGE_MARGIN, start),
        Math.max(TOOLTIP_EDGE_MARGIN, viewport.width - TOOLTIP_EDGE_MARGIN - size.width)
    );

    const above = anchor.top - TOOLTIP_GAP - size.height;

    const top = above >= TOOLTIP_EDGE_MARGIN
        ? above
        : Math.min(
            anchor.bottom + TOOLTIP_GAP,
            Math.max(TOOLTIP_EDGE_MARGIN, viewport.height - TOOLTIP_EDGE_MARGIN - size.height)
        );

    return { left, top };

}
