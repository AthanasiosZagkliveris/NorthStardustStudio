/** Whether a colour paints something: not empty, not transparent, not fully clear. */
export function opaque(colour: string): boolean {
    return colour !== "" && colour !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(colour);
}

/**
 * THE FRAME AS IT SHOWS (owner, 2026-11-19, "Where are the page tags"; 23:15 UTC+2, "The dialogue cards' level are different on the Segment. Fix it."): a frame
 * drawn by what holds it -- a Segment's chapter on Foundation & Engagement, whose parts are clear and whose chapter carries the colour -- is read from that holder:
 * the nearest one inside the page's card with a ground of its own. The page's rails take their top from it, and a dialog its top.
 */
export function shownFrame(frame: Element): Element {
    if (opaque(getComputedStyle(frame).backgroundColor)) {
        return frame;
    }
    for (let node = frame.parentElement; node && !node.matches(".conversation-card"); node = node.parentElement) {
        if (opaque(getComputedStyle(node).backgroundColor)) {
            return node;
        }
    }
    return frame;
}
