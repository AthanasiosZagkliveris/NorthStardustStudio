import { KeyboardEvent, MouseEvent, ReactNode, RefObject, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * WHERE A TOOLTIP STANDS: ABOVE THE TEXT IT IS ABOUT, never over it: its bottom is 6px over the element's top (a line above), its middle under the cursor
 * (or on the element's middle from the keyboard, or its right edge on the element's right edge); where there is no room above, 6px under the element. Kept inside the window.
 */
export function aboveTipPosition(at: DOMRect, size: DOMRect, point: { x: number } | null, alignRight = false): { left: number; top: number } {
    const gap = 6;
    const above = at.top - gap - size.height;
    return {
        left: Math.max(8, Math.min(alignRight ? at.right - size.width : (point ? point.x : at.left + at.width / 2) - size.width / 2, window.innerWidth - 8 - size.width)),
        top: above >= 8 ? above : at.bottom + gap
    };
}

/**
 * THE APP'S TOOLTIP ABOVE ITS ICON, by default (the card structure's display rules): pointing at an icon or focusing it shows the dark label above it,
 * centred on it and kept inside the window; below it only where there is no room above. Escape closes it. Nothing but the label's text is the icon's
 * tooltip: the icon keeps its own accessible name.
 *
 * Under the POINTER it stands a line above the hovered text -- 6px over its top, its middle under the cursor -- and never over the text; where there is no room above, 6px under the text. From the keyboard it stands centred on its icon.
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
        onMouseEnter: (event?: MouseEvent<T>) => void;
        onMouseMove: (event: MouseEvent<T>) => void;
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
    // Where the pointer is (null while the tip was opened from the keyboard).
    const pointer = useRef<{ x: number; y: number } | null>(null);

    useLayoutEffect(() => {
        const icon = anchor.current;
        const panel = tip.current;
        if (!open || !icon || !panel) {
            setPosition(null);
            return;
        }
        const place = () => {
            setPosition(aboveTipPosition((options.box ? options.box(icon) : icon).getBoundingClientRect(), panel.getBoundingClientRect(), pointer.current, options.alignRight));
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
            onMouseEnter: (event?: MouseEvent<T>) => {
                pointer.current = event ? { x: event.clientX, y: event.clientY } : null;
                setOpen(true);
            },
            onMouseMove: (event: MouseEvent<T>) => {
                pointer.current = { x: event.clientX, y: event.clientY };
            },
            onMouseLeave: () => setOpen(false),
            onFocus: () => {
                pointer.current = null;
                setOpen(true);
            },
            onBlur: () => setOpen(false),
            onKeyDown: (event: KeyboardEvent) => {
                if (event.key === "Escape" && open) {
                    setOpen(false);
                }
            }
        },
        node: open
            ? <TooltipBox id={id} boxRef={tip} position={position} className="action-tip">{text}</TooltipBox>
            : null
    };

}

/**
 * THE TOOLTIP'S BOX, drawn by every tooltip of the app (the icons', the action symbols', the Roadmap's bars', the noted fields'): the dark label on the page body, hidden until it is placed so it never shows for a frame in the wrong spot. Each place chooses where it stands (`position`) and what it says (`children`); `className` adds only that place's own inside look.
 */
export function TooltipBox({ id, boxRef, position, className, children }: {
    id: string;
    boxRef: RefObject<HTMLDivElement | null>;
    position: { left: number; top: number } | null;
    className?: string;
    children: ReactNode;
}) {
    return createPortal(
        <div
            className={"app-tooltip" + (className ? " " + className : "")}
            id={id}
            role="tooltip"
            ref={boxRef}
            style={position ? { left: position.left, top: position.top } : { left: 0, top: 0, visibility: "hidden" }}
        >
            {children}
        </div>,
        document.body
    );
}
