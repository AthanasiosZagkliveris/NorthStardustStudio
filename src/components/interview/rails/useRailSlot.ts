import { RefObject, useLayoutEffect, useRef, useState } from "react";

/** Where the arrow takes its line in a rail's list: the list set down by `shift`, and the line at `index` and those after it set down by `extra` more. */
export type RailSlot = { shift: number; index: number; extra: number };

/** The arrow's box, in the window's coordinates. */
export type ArrowBox = { left: number; right: number; top: number; bottom: number };

/** How far a line of the list is set down by the slot: the first line by the shift, the line at the slot's index by its extra. */
export function slotMargin(slot: RailSlot | null, position: number): number {
    return slot ? (position === 0 ? slot.shift : 0) + (slot.index === position ? slot.extra : 0) : 0;
}

/**
 * ONE PLACEMENT FOR EVERY RAIL (layout rules section 10, "One rail for every layer" and "Page tab"; owner, 2026-11-09: "If the bullets are a lot, they should
 * continue after the arrow"; 2026-11-19 13:04 UTC+2: "Fix it in the root"): a rail's tab starts 12px under its frame's top and its arrow keeps the one arrow level;
 * where the tab stands under the arrow, its lines run in order at their own pitch and the arrow takes exactly one line's place among them -- the line that would
 * reach it continues right after it, one line's gap on each side -- the list set down by less than one pitch (`shift`) so that the gaps above and below the arrow
 * are the list's own. The page's Pages and Sections rails (BulletRail) and every layer's tab (CarouselArrows) use it; no caller places a rail of its own.
 *
 * `lines` are the rail's lines in order (the bullets, then Back); `arrow` gives the arrow's box, or null where there is none.
 */
export function useRailSlot(rail: RefObject<HTMLElement | null>, arrow: () => ArrowBox | null, enabled: boolean, lines = "ol > li, .carousel-rail-back"): RailSlot | null {
    const [slot, setSlot] = useState<RailSlot | null>(null);
    const slotRef = useRef(slot);
    slotRef.current = slot;
    useLayoutEffect(() => {
        const node = rail.current;
        const box = enabled ? arrow() : null;
        if (!node || !box) {
            setSlot(previous => previous === null ? previous : null);
            return;
        }
        // Whether the tab stands under the arrow at all.
        const tab = node.getBoundingClientRect();
        if (box.right <= tab.left || box.left >= tab.right || box.bottom <= tab.top || box.top >= tab.bottom) {
            setSlot(previous => previous === null ? previous : null);
            return;
        }
        // Every line where it stands without the slot: its measured top, less what the slot moved it.
        const applied = slotRef.current;
        const rows = [...node.querySelectorAll<HTMLElement>(lines)].map((line, position) => {
            const r = line.getBoundingClientRect();
            const moved = (applied ? applied.shift : 0) + (applied && position >= applied.index ? applied.extra : 0);
            return { top: r.top - moved, bottom: r.bottom - moved };
        });
        if (rows.length < 2) {
            setSlot(previous => previous === null ? previous : null);
            return;
        }
        const pitch = rows[1].top - rows[0].top;
        const listGap = Math.max(4, rows[0].bottom - rows[0].top > 0 ? pitch - (rows[0].bottom - rows[0].top) : 8);
        // (The arrow keeps the list's gap from a bullet's GROWN edge -- the lit bullet and its bloom, --rail-dot-overhang in bullet-rail.css -- so a grown bullet
        // never touches it; owner, 2026-11-14 13:54: "with the proper gaps (counting the scaling over hovering)".)
        const rootStyle = getComputedStyle(document.documentElement);
        const grow = parseFloat(rootStyle.getPropertyValue("--rail-dot-grow")) || 1;
        const bloom = parseFloat(rootStyle.getPropertyValue("--rail-bloom-width")) || 0;
        const gap = listGap + 12 * (grow - 1) / 2 + bloom * grow;
        // The first line that would reach the arrow (with the list's own gap before it): it and those after it go after the arrow.
        const index = rows.findIndex(line => line.bottom + gap > box.top);
        if (index < 0) {
            setSlot(previous => previous === null ? previous : null);
            return;
        }
        const shift = index > 0 ? Math.max(0, box.top - gap - rows[index - 1].bottom) : 0;
        const extra = Math.max(0, box.bottom + gap - (rows[index].top + shift));
        const next = { shift: Math.round(shift * 10) / 10, index, extra: Math.round(extra * 10) / 10 };
        setSlot(previous => previous && previous.index === next.index && Math.abs(previous.shift - next.shift) < 0.5 && Math.abs(previous.extra - next.extra) < 0.5 ? previous : next);
    });
    return slot;
}
