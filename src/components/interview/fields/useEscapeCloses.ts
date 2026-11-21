import { useEffect, useRef } from "react";

import { consumeKey } from "./consumeKey";

/**
 * A SIDE PANEL'S ESCAPE (the Notes panel, the Calendar opened from the Menu): while `open`, Escape closes the panel -- and only it. The key is taken on the
 * window before anything else hears it (the capture phase) and goes no further (consumeKey), so the interview page does not take it as Back. `skip` says
 * when the panel lets the key pass this time (Notes while it is linking a field).
 */
export function useEscapeCloses(open: boolean, close: () => void, skip: () => boolean = () => false): void {
    const latest = useRef({ close, skip });
    latest.current = { close, skip };
    useEffect(() => {
        if (!open) {
            return;
        }
        function onKey(event: KeyboardEvent) {
            if (event.key === "Escape" && !latest.current.skip()) {
                consumeKey(event);
                latest.current.close();
            }
        }
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [open]);
}
