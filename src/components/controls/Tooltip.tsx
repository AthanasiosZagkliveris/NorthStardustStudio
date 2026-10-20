import { CSSProperties, KeyboardEvent, ReactNode, RefObject, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * WHERE A TOOLTIP STANDS, ONE PLACE FOR EVERY ONE: ABOVE THE CONTROL IT IS ABOUT, never over it: its bottom is 6px over the control's top, its middle on the control's middle
 * (or its right edge on the control's right edge); where there is no room above, 6px under the control. Kept inside the window. It never follows the pointer.
 */
export function aboveTipPosition(at: DOMRect, size: DOMRect, alignRight = false): { left: number; top: number } {
    const gap = 6;
    const above = at.top - gap - size.height;
    return {
        left: Math.max(8, Math.min(alignRight ? at.right - size.width : at.left + at.width / 2 - size.width / 2, window.innerWidth - 8 - size.width)),
        top: above >= 8 ? above : at.bottom + gap
    };
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
        onMouseEnter: () => void;
        onMouseLeave: () => void;
        onFocus: () => void;
        onBlur: () => void;
        onKeyDown: (event: KeyboardEvent) => void;
    };
    node: ReactNode;
} {

    const [open, setOpen] = useState(false);
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
            setPosition(aboveTipPosition((options.box ? options.box(icon) : icon).getBoundingClientRect(), panel.getBoundingClientRect(), options.alignRight));
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
