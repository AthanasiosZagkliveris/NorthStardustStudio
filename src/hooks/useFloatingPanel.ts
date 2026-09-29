import { CSSProperties, RefObject, useCallback, useLayoutEffect, useRef, useState } from "react";

/** How close to the window edge a panel may come. */
const EDGE_MARGIN = 12;

/** The gap a panel keeps from the control it belongs to. */
const ANCHOR_GAP = 6;

/**
 * The box a panel is seen through sideways: the window, or the
 * nearest box around it that clips or scrolls its content sideways
 * (a wide table's scroller), whichever is narrower. A panel opened
 * from a table head inside such a scroller is cut off at the
 * scroller's edge, not the window's.
 */
function horizontalBounds(panel: HTMLElement): { left: number; right: number } {
    let left = EDGE_MARGIN;
    let right = window.innerWidth - EDGE_MARGIN;
    for (let box = panel.parentElement; box && box !== document.body; box = box.parentElement) {
        if (getComputedStyle(box).overflowX !== "visible") {
            const rect = box.getBoundingClientRect();
            left = Math.max(left, rect.left + box.clientLeft);
            right = Math.min(right, rect.left + box.clientLeft + box.clientWidth);
            break;
        }
    }
    return { left, right };
}

interface FloatingPanelPlacement {

    /** Attach to the panel that floats. */
    panelRef: RefObject<HTMLDivElement | null>;

    /** Apply to that same panel, alongside its own class. */
    panelStyle: CSSProperties;

    /** True while the panel is opening upwards. */
    above: boolean;

}

/**
 * Keeps a floating panel -- a dropdown, a date grid, a menu -- whole
 * and on screen.
 *
 * THE RULE: a panel that opens must be readable and reachable in
 * full. Never a list whose last option is under the window edge or
 * behind the fixed navigation bar, because an option that cannot be
 * seen cannot be chosen.
 *
 * Three things in order, which is as much as any panel in this app
 * needs:
 *
 *   1. Below the control, if it fits there.
 *   2. Above it, if it fits there instead -- a control near the
 *      bottom of a long page has all its room overhead.
 *   3. Whichever side has more room, capped to that room and made
 *      to scroll. A panel taller than the window itself has
 *      nowhere to go, and scrolling is still reachable.
 *
 * Sideways is the same idea, in one step: a panel running past the
 * right edge -- of the window, or of a scroller it opens inside
 * (horizontalBounds) -- is pulled back by however far it went, never
 * past the left edge.
 *
 * Measured rather than guessed, because the answer depends on where
 * the control has been scrolled to, not on anything knowable when
 * the panel is written. Re-measured on scroll and resize for the
 * same reason.
 *
 * Why not CSS: `position-try-fallbacks` expresses exactly this and
 * is a much better fit, but this app ships in a WebView whose
 * Chromium version comes from whatever the machine has installed --
 * and a panel silently failing to flip on an older one is the bug
 * this exists to prevent.
 */
export function useFloatingPanel(
    open: boolean,
    anchorRef: RefObject<HTMLElement | null>,
    /**
     * A height the panel will not exceed whatever room it has -- a
     * list that shows ten options and scrolls the rest. Given here
     * rather than in CSS so the placement below measures the height
     * the panel will ACTUALLY be: a fifty-row list capped at ten
     * would otherwise be judged too tall for the space and flip
     * upwards for no reason.
     */
    ceiling?: number
): FloatingPanelPlacement {

    const panelRef = useRef<HTMLDivElement | null>(null);

    const [above, setAbove] = useState(false);
    const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
    const [shiftX, setShiftX] = useState(0);

    const place = useCallback(() => {

        const panel = panelRef.current;
        const anchor = anchorRef.current;

        if (!panel || !anchor) {
            return;
        }

        const anchorRect = anchor.getBoundingClientRect();

        // The panel's own natural height, not its current one --
        // once it has been capped, its rendered height is the cap
        // and measuring that would make the cap permanent. Held to
        // the caller's ceiling, which is the height it will render
        // at however much content it holds.
        const needed = Math.min(panel.scrollHeight, ceiling ?? Infinity);

        const roomBelow = window.innerHeight - anchorRect.bottom - ANCHOR_GAP - EDGE_MARGIN;
        const roomAbove = anchorRect.top - ANCHOR_GAP - EDGE_MARGIN;

        if (needed <= roomBelow) {
            setAbove(false);
            setMaxHeight(undefined);
        } else if (needed <= roomAbove) {
            setAbove(true);
            setMaxHeight(undefined);
        } else {
            const goAbove = roomAbove > roomBelow;
            setAbove(goAbove);
            setMaxHeight(Math.max(goAbove ? roomAbove : roomBelow, 0));
            return;
        }

        // It fits: the ceiling is still what holds a long list to a
        // readable length.
        if (ceiling !== undefined && panel.scrollHeight > ceiling) {
            setMaxHeight(ceiling);
        }

        // Horizontal: measured with the current shift removed, so
        // repeated passes settle instead of drifting.
        const panelRect = panel.getBoundingClientRect();
        const naturalLeft = panelRect.left - shiftX;
        const naturalRight = panelRect.right - shiftX;
        const bounds = horizontalBounds(panel);
        const overflowRight = naturalRight - bounds.right;

        setShiftX(overflowRight > 0 ? -Math.min(overflowRight, Math.max(0, naturalLeft - bounds.left)) : 0);

    }, [anchorRef, shiftX, ceiling]);

    useLayoutEffect(() => {

        if (!open) {
            setAbove(false);
            setMaxHeight(undefined);
            setShiftX(0);
            return;
        }

        place();

        // Capture phase: the control may sit inside its own
        // scrolling area, and a scroll there does not bubble.
        window.addEventListener("scroll", place, true);
        window.addEventListener("resize", place);

        return () => {
            window.removeEventListener("scroll", place, true);
            window.removeEventListener("resize", place);
        };

    }, [open, place]);

    const panelStyle: CSSProperties = above
        ? {
            top: "auto",
            bottom: "100%",
            marginTop: 0,
            marginBottom: ANCHOR_GAP,
            transform: shiftX ? `translateX(${shiftX}px)` : undefined,
            maxHeight,
            overflowY: maxHeight === undefined ? undefined : "auto"
        }
        : {
            transform: shiftX ? `translateX(${shiftX}px)` : undefined,
            maxHeight,
            overflowY: maxHeight === undefined ? undefined : "auto"
        };

    return { panelRef, panelStyle, above };

}
