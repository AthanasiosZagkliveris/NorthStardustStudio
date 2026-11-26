import { CSSProperties, KeyboardEvent, ReactNode, RefObject, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * WHERE A TOOLTIP STANDS, ONE PLACE FOR EVERY ONE: ABOVE THE CONTROL IT IS ABOUT, never over it: its bottom is 6px over the control's top, its left edge on the control's left edge
 * (where every pop-up cell starts; or its right edge on the control's right edge); where there is no room above, 6px under the control. Kept inside the window. It never follows the pointer.
 */
export function aboveTipPosition(at: DOMRect, size: DOMRect, alignRight = false): { left: number; top: number } {
    const gap = 6;
    const above = at.top - gap - size.height;
    return {
        left: Math.max(8, Math.min(alignRight ? at.right - size.width : at.left, window.innerWidth - 8 - size.width)),
        top: above >= 8 ? above : at.bottom + gap
    };
}

/**
 * WHERE EVERY TIP STANDS, ONE RULE (owner, 2026-11-21 16:02 UTC+2: "Tooltips should have the same style, and use the same rules about how and where they appear"):
 * above its box, its left edge on the box's left edge (aboveTipPosition); under it only where the window has no room above. The same for every tooltip of the app
 * (the icons', the bullets', the action symbols', the titles'). (Until 2026-11-21 a tip that would cover a control moved under it or beside it, so tips stood in
 * three places; one tip shows at a time, and it goes when the pointer leaves.)
 */
export function tipPlace(box: DOMRect, size: DOMRect, own: HTMLElement, alignRight = false): { left: number; top: number } {
    return aboveTipPosition(grownBox(box, own), size, alignRight);
}

/**
 * A SYMBOL'S TIP STANDS WHERE THE GROWN SYMBOL WILL BE (owner, 2026-11-26 23:04 and 23:10 UTC+2, "Reduce the icons scale over hovering to 10%"; "because the icons over hovering scale up, you must calculate that space,
 * and adjust the tooltips position ahead. Tooltips should appear on specific position, not to change after the icon's scale"): a Resources tile's symbol grows 10%
 * under the pointer from the corner its place in the 3 x 3 sets (01-tiles-and-dialog.css: the top row from its foot, the left column from its right edge ...), so
 * the box its tip stands above is the grown one, worked out before it grows: the tip opens in its one place, 6px over the grown top, at the grown left edge, clear
 * of the pointer at the symbol's middle.
 */
/** How much a tile's symbol grows under the pointer: 10% (workspace.css). */
const SYMBOL_GROWTH = 0.1;

function grownBox(box: DOMRect, own: HTMLElement): DOMRect {
    const item = own.closest<HTMLElement>(".section-tile-list[data-symbols] > li");
    if (!item?.parentElement) {
        return box;
    }
    // (Measured from the symbol's place at rest -- its row item, which never grows --, whether the symbol has grown already or not.)
    box = item.getBoundingClientRect();
    const index = Array.from(item.parentElement.children).indexOf(item);
    const column = index % 3;
    const row = Math.floor(index / 3);
    const extraX = box.width * SYMBOL_GROWTH;
    const extraY = box.height * SYMBOL_GROWTH;
    // (Growing from its right edge (left column), its middle (middle column), its left edge (right column); from its foot (top row), its middle, its top (bottom row).)
    const left = box.left - (column === 0 ? extraX : column === 1 ? extraX / 2 : 0);
    const top = box.top - (row === 0 ? extraY : row === 1 ? extraY / 2 : 0);
    return new DOMRect(left, top, box.width + extraX, box.height + extraY);
}

/** ONE TOOLTIP AT A TIME, app-wide (owner, 2026-11-14 12:40: two "Linked to 2 resources" tips showed at once): the one opened last closes the one before. */
let closeOpenTip: (() => void) | null = null;

/** The event a tip of its own sends as it opens: the title tips (TitleTooltips) close theirs. */
export const OWN_TIP_EVENT = "app-tooltip:own-open";

/** Closes the tip of its own that is open (a title tip opening). */
export function closeOwnTip() {
    closeOpenTip?.();
    closeOpenTip = null;
}

/**
 * THE APP'S TOOLTIP ABOVE ITS ICON, by default (the card structure's display rules): pointing at an icon or focusing it shows the dark label above it,
 * its left edge on the icon's left edge and kept inside the window; below it only where there is no room above. Escape closes it. Nothing but the label's text is the icon's
 * tooltip: the icon keeps its own accessible name.
 *
 * It stands where aboveTipPosition says, from the pointer and from the keyboard alike.
 *
 * Used as a hook: spread props on the icon and draw node anywhere next to it (it is drawn on the page body).
 */
export function useAboveTip<T extends HTMLElement>(text: string, options: {
    /** The box the tip stands above (default: the icon itself). */
    box?: (icon: T) => HTMLElement;
    /** The tip's right edge on the box's right edge, instead of its left edge on the box's left edge. */
    alignRight?: boolean;
} = {}): {
    props: {
        ref: RefObject<T | null>;
        "aria-describedby": string | undefined;
        /** It draws its own tip: the title tips leave it alone. */
        "data-own-tip": string;
        onMouseEnter: () => void;
        onMouseLeave: () => void;
        onFocus: () => void;
        onBlur: () => void;
        onKeyDown: (event: KeyboardEvent) => void;
    };
    node: ReactNode;
} {

    const [open, setOpenState] = useState(false);
    const close = useRef(() => setOpenState(false));
    const setOpen = (next: boolean) => {
        if (next) {
            if (closeOpenTip && closeOpenTip !== close.current) {
                closeOpenTip();
            }
            closeOpenTip = close.current;
            document.dispatchEvent(new CustomEvent(OWN_TIP_EVENT));
        } else if (closeOpenTip === close.current) {
            closeOpenTip = null;
        }
        setOpenState(next);
    };
    const anchor = useRef<T | null>(null);
    const tip = useRef<HTMLDivElement | null>(null);
    const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
    const id = useId();

    useLayoutEffect(() => {
        const icon = anchor.current;
        const panel = tip.current;
        if (!open || !icon || !panel) {
            setPosition(null);
            return;
        }
        const place = () => {
            setPosition(tipPlace((options.box ? options.box(icon) : icon).getBoundingClientRect(), panel.getBoundingClientRect(), icon, options.alignRight));
        };
        place();
        window.addEventListener("scroll", place, true);
        window.addEventListener("resize", place);
        return () => {
            window.removeEventListener("scroll", place, true);
            window.removeEventListener("resize", place);
        };
    }, [open, text]);

    return {
        props: {
            ref: anchor,
            "aria-describedby": open ? id : undefined,
            "data-own-tip": "",
            onMouseEnter: () => setOpen(true),
            onMouseLeave: () => setOpen(false),
            onFocus: () => setOpen(true),
            onBlur: () => setOpen(false),
            onKeyDown: (event: KeyboardEvent) => {
                if (event.key === "Escape" && open) {
                    setOpen(false);
                }
            }
        },
        node: open
            ? <TooltipBox id={id} boxRef={tip} position={position} className="action-tip" hue={anchor.current ? hueOf(anchor.current) : ""}>{text}</TooltipBox>
            : null
    };

}

/**
 * THE TOOLTIP'S BOX, drawn by every tooltip of the app (the icons', the action symbols', the Roadmap's bars', the noted fields'): the dark label on the page body, hidden until it is placed so it never shows for a frame in the wrong spot. Each place chooses where it stands (`position`) and what it says (`children`); `className` adds only that place's own inside look.
 */
/** The card's hue a control stands in (the tooltip takes the card's tint, as every pop-up does), or "" where the control stands in no card. */
export function hueOf(element: HTMLElement): string {
    // (What is done is grey, and so is what is said over it: no hue in a Completed layer.)
    if (element.closest(".section-tile-dialog-completed, .business-capability-activity-completed, .card-boxes-completed")) {
        return "";
    }
    return getComputedStyle(element).getPropertyValue("--strategy-theme-hue").trim();
}

export function TooltipBox({ id, boxRef, position, className, hue, children }: {
    id: string;
    boxRef: RefObject<HTMLDivElement | null>;
    position: { left: number; top: number } | null;
    className?: string;
    /** The hue of the card the control stands in. */
    hue?: string;
    children: ReactNode;
}) {
    return createPortal(
        <div
            className={"app-tooltip" + (className ? " " + className : "")}
            id={id}
            role="tooltip"
            ref={boxRef}
            data-tint={hue ? "" : undefined}
            style={{ ...(position ? { left: position.left, top: position.top } : { left: 0, top: 0, visibility: "hidden" }), ...(hue ? { "--strategy-theme-hue": hue } : {}) } as CSSProperties}
        >
            {children}
        </div>,
        document.body
    );
}
