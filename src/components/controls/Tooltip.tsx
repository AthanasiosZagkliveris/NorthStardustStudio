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

/** Whether a tooltip placed there would cover a control the person may want next (a button, a field, a select): sampled at its corners and its middle. */
function coversControl(left: number, top: number, size: DOMRect, own: HTMLElement): boolean {
    // (Where the page cannot be hit-tested -- a page drawn without a layout -- nothing is covered.)
    if (typeof document.elementFromPoint !== "function") {
        return false;
    }
    const points = [[left + 2, top + 2], [left + size.width - 2, top + 2], [left + 2, top + size.height - 2], [left + size.width - 2, top + size.height - 2], [left + size.width / 2, top + size.height / 2]];
    return points.some(([x, y]) => {
        const hit = document.elementFromPoint(x, y)?.closest("button, select, input, textarea, a[href], [role=combobox], [contenteditable=true]");
        return !!hit && !own.contains(hit) && !hit.contains(own);
    });
}

/**
 * WHERE A TIP STANDS SO IT COVERS NO CONTROL (owner, 2026-11-14 12:40: a tip over the Purchase select): above its box (aboveTipPosition); where that covers a
 * control (a select, a button, a field), the first place that covers none -- under the box, then beside the control, after its right edge or before its left, on its
 * middle; above where every place covers one. Every tooltip of the app stands by it (the icons', the action symbols', the titles').
 */
export function tipPlace(box: DOMRect, size: DOMRect, own: HTMLElement, alignRight = false): { left: number; top: number } {
    const above = aboveTipPosition(box, size, alignRight);
    // (Beside the control itself, not its box: next to the icon the person points at.)
    const icon = own.getBoundingClientRect();
    const middle = Math.max(8, Math.min(icon.top + icon.height / 2 - size.height / 2, window.innerHeight - 8 - size.height));
    const places = [
        above,
        { left: above.left, top: box.bottom + 6 },
        { left: icon.right + 6, top: middle },
        // (After it, at the window's edge where the window is narrow, so long as it stays clear of the control.)
        { left: Math.max(icon.right + 1, window.innerWidth - 8 - size.width), top: middle },
        { left: icon.left - 6 - size.width, top: middle }
    ].filter(place => place.left >= 8 && place.left + size.width <= window.innerWidth - 8 && place.top >= 8 && place.top + size.height <= window.innerHeight - 8);
    return places.find(place => !coversControl(place.left, place.top, size, own)) ?? above;
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
 * centred on it and kept inside the window; below it only where there is no room above. Escape closes it. Nothing but the label's text is the icon's
 * tooltip: the icon keeps its own accessible name.
 *
 * It stands where aboveTipPosition says, from the pointer and from the keyboard alike.
 *
 * Used as a hook: spread props on the icon and draw node anywhere next to it (it is drawn on the page body).
 */
export function useAboveTip<T extends HTMLElement>(text: string, options: {
    /** The box the tip stands above (default: the icon itself). */
    box?: (icon: T) => HTMLElement;
    /** The tip's right edge on the box's right edge, instead of its middle under the pointer. */
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
