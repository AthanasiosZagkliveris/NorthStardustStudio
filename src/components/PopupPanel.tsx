import { CSSProperties, ReactNode, RefObject, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useFloatingPanel } from "../hooks/useFloatingPanel.ts";
import { consumeKey } from "./interview/consumeKey.ts";

/**
 * THE CLOSING OF EVERY POPUP: a press anywhere outside it closes it, and Escape closes it and goes no further (`consumeKey`: the page behind does not also leave). \`inside\` are the places a press does NOT close it (the control that opens it, and the panel itself where the panel is drawn elsewhere). \`escape\` is false where the popup's own keys answer Escape (a list that has the focus); \`capture\` where a press must be seen before the page's own handlers (a card or a dialog that stops it).
 */
export function usePopupDismiss(open: boolean, inside: readonly RefObject<HTMLElement | null>[], onClose: (reason: "press" | "escape") => void, options: { escape?: boolean; capture?: boolean } = {}): void {
    const { escape = true, capture = false } = options;
    useEffect(() => {
        if (!open) {
            return;
        }
        const away = (event: MouseEvent) => {
            if (!inside.some(ref => ref.current?.contains(event.target as Node))) {
                onClose("press");
            }
        };
        const key = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                consumeKey(event);
                onClose("escape");
            }
        };
        document.addEventListener("mousedown", away, capture);
        if (escape) {
            document.addEventListener("keydown", key);
        }
        return () => {
            document.removeEventListener("mousedown", away, capture);
            document.removeEventListener("keydown", key);
        };
        // (The places and the closing are read when a press comes; the popup opening or closing is what sets the listeners.)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, capture, escape]);
}

/**
 * THE POPUP PANEL: a panel that opens from a control (a note, a colour's picker): drawn OUTSIDE the boxes around its control (in the dialog's overlay, else on the page), so a card or a dialog that clips or stacks its content never cuts it off or paints its own controls over it; placed free of them (below the control if it fits, else above, capped where neither does; placed again when its size changes); the hue of the box it opens from; closed by a press outside and by Escape (\`usePopupDismiss\`).
 */
export default function PopupPanel({ open, onClose, anchorRef, insideRefs = [], className, role = "dialog", ariaLabel, escape = true, focusOnOpen = false, children }: {
    open: boolean;
    /** What closes it: a press outside, or Escape (the focus goes back to the control on Escape). */
    onClose: (reason: "press" | "escape") => void;
    /** The control it opens from: the panel is placed against it, and a press on it does not close the panel (it toggles it). */
    anchorRef: RefObject<HTMLElement | null>;
    /** More places a press does not close it (the control's own box). */
    insideRefs?: readonly RefObject<HTMLElement | null>[];
    className?: string;
    role?: "dialog" | "menu" | "listbox";
    ariaLabel?: string;
    /** False where the panel's own keys answer Escape. */
    escape?: boolean;
    /** The panel takes the focus when it opens (a note a screen reader reads). */
    focusOnOpen?: boolean;
    children: ReactNode;
}) {
    const { panelRef, panelStyle } = useFloatingPanel(open, anchorRef, undefined, true);
    const [hue, setHue] = useState("");
    useEffect(() => {
        if (open && anchorRef.current) {
            setHue(getComputedStyle(anchorRef.current).getPropertyValue("--strategy-theme-hue").trim());
        }
    }, [open, anchorRef]);
    useEffect(() => {
        if (open && focusOnOpen) {
            panelRef.current?.focus({ preventScroll: true });
        }
    }, [open, focusOnOpen, panelRef]);
    usePopupDismiss(open, [anchorRef, panelRef, ...insideRefs], onClose, { escape });
    const host = open ? anchorRef.current?.closest<HTMLElement>(".section-tile-overlay") ?? document.body : null;
    if (!open || !host) {
        return null;
    }
    return createPortal(
        <div
            ref={panelRef}
            className={className}
            role={role}
            tabIndex={focusOnOpen ? -1 : undefined}
            // (With the focus inside the panel, Escape is answered here first, as the page's own Escape would otherwise close what is under it: the document's listener covers a panel that has no focus.)
            onKeyDown={(event) => {
                if (escape && event.key === "Escape") {
                    consumeKey(event);
                    onClose("escape");
                }
            }}
            aria-label={ariaLabel}
            style={{ ...panelStyle, pointerEvents: "auto", ...(hue ? { "--strategy-theme-hue": hue } : {}) } as CSSProperties}
        >
            {children}
        </div>,
        host
    );
}
