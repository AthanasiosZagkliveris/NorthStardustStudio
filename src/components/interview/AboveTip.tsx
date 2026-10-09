import { KeyboardEvent, ReactNode, RefObject, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * THE APP'S TOOLTIP ABOVE ITS ICON, by default (the card structure's display rules): pointing at an icon or focusing it shows the dark label above it,
 * centred on it and kept inside the window; below it only where there is no room above. Escape closes it. Nothing but the label's text is the icon's
 * tooltip: the icon keeps its own accessible name.
 *
 * Used as a hook: spread props on the icon and draw node anywhere next to it (it is drawn on the page body).
 */
export function useAboveTip<T extends HTMLElement>(text: string): {
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
            const at = icon.getBoundingClientRect();
            const size = panel.getBoundingClientRect();
            const gap = 6;
            const above = at.top - gap - size.height;
            setPosition({
                left: Math.max(8, Math.min(at.left + at.width / 2 - size.width / 2, window.innerWidth - 8 - size.width)),
                top: above >= 8 ? above : at.bottom + gap
            });
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
            ? createPortal(
                <div
                    className="app-tooltip action-tip"
                    id={id}
                    role="tooltip"
                    ref={tip}
                    style={position ? { left: position.left, top: position.top } : { left: 0, top: 0, visibility: "hidden" }}
                >
                    {text}
                </div>,
                document.body
            )
            : null
    };

}
