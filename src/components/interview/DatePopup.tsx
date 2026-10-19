import { CSSProperties, ReactNode, RefObject, useEffect, useRef, useState } from "react";

import { useFloatingPanel } from "../../hooks/useFloatingPanel.ts";
import { consumeKey } from "./consumeKey.ts";

/**
 * THE POPUP OF THE DATE CELL AND THE MONTH PICKER, what the two share: it opens under its cell (upwards where there is no room, and free of the card's clipping inside a card, a dialog or a menu), it closes on a press outside it and on Escape (which goes no further), and its head is the same four steps around a title. The two draw their own days or months; the popup's classes (\`date-cell-popup-*\`) are the one look.
 */
export function useDatePopup(anchor: RefObject<HTMLElement | null>): {
    open: boolean;
    close: () => void;
    /** Closes if open; otherwise runs \`before\` (the place sets the month it shows) and opens. */
    toggle: (before: () => void) => void;
    /** On the element that holds the cell and its popup: a press outside it closes. */
    containerRef: RefObject<HTMLDivElement | null>;
    panelRef: RefObject<HTMLDivElement | null>;
    panelStyle: CSSProperties | undefined;
} {
    const [open, setOpen] = useState(false);
    const [free, setFree] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { panelRef, panelStyle } = useFloatingPanel(open, anchor, undefined, free);

    useEffect(() => {
        if (!open) {
            return;
        }
        function onPointerDown(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                consumeKey(event);
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onPointerDown, true);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown, true);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return {
        open,
        close: () => setOpen(false),
        toggle: (before) => {
            if (open) {
                setOpen(false);
                return;
            }
            before();
            setFree(!!anchor.current?.closest(".business-capability, .section-tile-overlay, .section-tile-dialog, .strategy-sort-menu"));
            setOpen(true);
        },
        containerRef,
        panelRef,
        panelStyle
    };
}

/** The popup's head: back by a long step, back by a step, the title, forward by a step, forward by a long step. */
export function DatePopupHead({ title, backLong, back, forward, forwardLong }: {
    title: ReactNode;
    backLong: { label: string; onClick: () => void };
    back: { label: string; onClick: () => void };
    forward: { label: string; onClick: () => void };
    forwardLong: { label: string; onClick: () => void };
}) {
    return (
        <div className="date-cell-popup-head">
            <button type="button" className="date-cell-popup-step" aria-label={backLong.label} onClick={backLong.onClick}>«</button>
            <button type="button" className="date-cell-popup-step" aria-label={back.label} onClick={back.onClick}>‹</button>
            <span className="date-cell-popup-title" aria-live="polite">{title}</span>
            <button type="button" className="date-cell-popup-step" aria-label={forward.label} onClick={forward.onClick}>›</button>
            <button type="button" className="date-cell-popup-step" aria-label={forwardLong.label} onClick={forwardLong.onClick}>»</button>
        </div>
    );
}
