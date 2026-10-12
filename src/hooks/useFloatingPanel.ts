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
    ceiling?: number,
    /**
     * Floats free of every box around it: placed in window
     * coordinates (position: fixed), so a scroller or a clipped
     * label it opens inside cannot cut it off -- a note opened from
     * a table head. Placed by hand, not by the styles below.
     */
    free = false
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

        if (free) {
            placeFree(panel, anchorRect, ceiling);
            return;
        }

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
            // Capped to the side with more room -- and still held
            // inside the window sideways, below.
            const goAbove = roomAbove > roomBelow;
            setAbove(goAbove);
            setMaxHeight(Math.max(goAbove ? roomAbove : roomBelow, 0));
        }

        // It fits: the ceiling is still what holds a long list to a
        // readable length.
        if (needed <= Math.max(roomBelow, roomAbove) && ceiling !== undefined && panel.scrollHeight > ceiling) {
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

    }, [anchorRef, shiftX, ceiling, free]);

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

    // Free: placed by hand (placeFree), hidden until it has been.
    if (free) {
        return { panelRef, panelStyle: { position: "fixed", margin: 0 }, above: false };
    }

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

/**
 * A free panel's place, in window coordinates: over its anchor if it
 * fits, under it if it fits there, else capped to the side with more
 * room; its left edge at the anchor's, pulled back inside the window.
 * Measured and corrected once, so a transformed box around it (which
 * makes "fixed" relative to itself) cannot throw it off.
 */
function placeFree(panel: HTMLElement, anchor: DOMRect, ceiling?: number): void {

    panel.style.maxHeight = "";
    panel.style.overflowY = "";

    const needed = Math.min(panel.scrollHeight, ceiling ?? Infinity);
    const width = panel.getBoundingClientRect().width;

    const roomBelow = window.innerHeight - anchor.bottom - ANCHOR_GAP - EDGE_MARGIN;
    const roomAbove = anchor.top - ANCHOR_GAP - EDGE_MARGIN;

    // (Above the control when it fits there: a note over its "i" leaves what the "i" explains in view; below only where there is no room above.)
    // (Under the "i" where the note would run under the app's header: a note is never half hidden.)
    const header = document.querySelector<HTMLElement>(".app-header")?.getBoundingClientRect().bottom ?? 0;
    const roomUp = Math.min(roomAbove, anchor.top - ANCHOR_GAP - Math.max(header, 0));
    let height = needed;
    let below = false;
    if (needed > roomUp) {
        if (needed <= roomBelow) {
            below = true;
        } else {
            below = roomBelow > roomUp;
            // (Above, the room is what the app's header leaves: a note capped to the window's top edge would run under the header.)
            height = Math.max(below ? roomBelow : roomUp, 0);
        }
    }
    if (height < panel.scrollHeight) {
        panel.style.maxHeight = height + "px";
        panel.style.overflowY = "auto";
    }

    const top = below ? anchor.bottom + ANCHOR_GAP : anchor.top - ANCHOR_GAP - height;
    const left = Math.max(EDGE_MARGIN, Math.min(anchor.left, window.innerWidth - EDGE_MARGIN - width));

    panel.style.left = left + "px";
    panel.style.top = top + "px";

    // Where it landed against where it was meant to: the difference is
    // a transformed box around it, taken off once.
    const landed = panel.getBoundingClientRect();
    if (Math.abs(landed.left - left) > 0.5 || Math.abs(landed.top - top) > 0.5) {
        panel.style.left = (2 * left - landed.left) + "px";
        panel.style.top = (2 * top - landed.top) + "px";
    }

}
