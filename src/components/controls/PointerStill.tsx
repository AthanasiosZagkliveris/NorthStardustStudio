import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * NO TILE GROWS UNDER A POINTER THAT HAS NOT MOVED (owner, 2026-11-23 16:21 and 17:28 UTC+2, the Brand tile: "when clicking on it, it seem that there is a bug";
 * "The bug on the Brand Tile/system it is still there"): a page opens with the pointer where it pressed the last one, over whatever tile now stands there, which
 * grew at once over its neighbours. Each new page marks the document `data-pointer-still` until the pointer moves; the tiles' growth under the pointer waits
 * for that move (section-tiles, 04-tile-slot-and-floating-card.css).
 */
export default function PointerStill() {
    const location = useLocation();
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute("data-pointer-still", "");
        let start: { x: number; y: number } | null = null;
        const move = (event: PointerEvent) => {
            // (A real move: a few pixels from where the pointer stood when the page opened -- the browser reports a move as the page under it changes.)
            if (!start) {
                start = { x: event.clientX, y: event.clientY };
                return;
            }
            if (Math.abs(event.clientX - start.x) + Math.abs(event.clientY - start.y) > 3) {
                root.removeAttribute("data-pointer-still");
                window.removeEventListener("pointermove", move);
            }
        };
        window.addEventListener("pointermove", move);
        return () => window.removeEventListener("pointermove", move);
    }, [location.key]);
    return null;
}
