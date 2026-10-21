import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import AddButton from "./controls/AddButton.tsx";
import { UndoService } from "../services/UndoService";

import "../styles/undo-toast.css";

/** How long an offer stays, while the pointer and the focus are elsewhere. */
export const UNDO_TIME = 10_000;

/** Whether a key press belongs to a place where Ctrl+Z undoes typing. */
function inTextField(target: EventTarget | null): boolean {
    return target instanceof HTMLElement &&
        !!target.closest("input:not([type=checkbox]):not([type=radio]), textarea, select, [contenteditable=true]");
}

/**
 * THE UNDO TOAST, the one for the whole app (UndoService): after a
 * removal, "Profile 1 removed. Undo" at the bottom centre for ten
 * seconds -- the time stops while it is hovered or holds the focus.
 * Ctrl+Z (⌘Z) undoes too while it shows, except inside a text field,
 * where it undoes the typing as ever. Announced politely.
 */
export default function UndoToast() {

    const offer = useSyncExternalStore(UndoService.subscribe, UndoService.current, UndoService.current);

    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);

    // What is left of the time, kept across pauses.
    const left = useRef(UNDO_TIME);

    // A new offer starts the full time again.
    useEffect(() => {
        left.current = UNDO_TIME;
    }, [offer?.id]);

    useEffect(() => {
        if (!offer || hovered || focused) {
            return;
        }
        const started = Date.now();
        const timer = window.setTimeout(() => UndoService.dismiss(), left.current);
        return () => {
            window.clearTimeout(timer);
            left.current = Math.max(0, left.current - (Date.now() - started));
        };
    }, [offer, hovered, focused]);

    // Ctrl+Z / ⌘Z while it shows.
    useEffect(() => {
        if (!offer) {
            return;
        }
        function onKeyDown(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey &&
                event.key.toLowerCase() === "z" && !inTextField(event.target)) {
                event.preventDefault();
                UndoService.undo();
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [offer]);

    // Leaving the page makes the removal final.
    useEffect(() => () => UndoService.dismiss(), []);

    return (
        <div className="undo-toast-region" aria-live="polite" aria-atomic="true">
            {offer && (
                <div
                    className="undo-toast"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onFocus={() => setFocused(true)}
                    onBlur={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                            setFocused(false);
                        }
                    }}
                >
                    <span className="undo-toast-message">{offer.message}</span>
                    <AddButton look="undo-toast-button"
                        onClick={() => {
                            setHovered(false);
                            setFocused(false);
                            UndoService.undo();
                        }}>
                        Undo
                    </AddButton>
                </div>
            )}
        </div>
    );

}
