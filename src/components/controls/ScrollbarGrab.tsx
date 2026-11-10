import { useEffect } from "react";

/**
 * THE GRAB HAND OVER A SCROLL BAR (owner, 2026-11-10: "When there is a scrolling bar, make the cursor as grabbing hand, so it would work as an indicator for
 * the user to move up or down the bar"). The app shows a bar only where a list scrolls on its own (the Inventory, the Forecast's table: global.css hides
 * the rest). A bar is not an element the cursor can be set on, so the box that scrolls is marked while the pointer is over its bar: `data-on-scrollbar`
 * (an open hand), and `data-scrollbar-grabbing` while the bar is held (a closed hand); global.css draws both.
 */
function barUnder(event: PointerEvent): HTMLElement | null {
    let node = event.target instanceof Element ? event.target : null;
    while (node && node !== document.documentElement) {
        if (node instanceof HTMLElement) {
            const rect = node.getBoundingClientRect();
            // (A vertical bar: the box is wider than what it shows; the pointer stands in the strip between them.)
            const vertical = node.offsetWidth - node.clientWidth - node.clientLeft * 2 > 0
                && event.clientX > rect.left + node.clientLeft + node.clientWidth && event.clientX <= rect.right;
            const horizontal = node.offsetHeight - node.clientHeight - node.clientTop * 2 > 0
                && event.clientY > rect.top + node.clientTop + node.clientHeight && event.clientY <= rect.bottom;
            if (vertical || horizontal) {
                return node;
            }
        }
        node = node.parentElement;
    }
    return null;
}

export default function ScrollbarGrab() {

    useEffect(() => {
        let over: HTMLElement | null = null;
        let held: HTMLElement | null = null;
        const move = (event: PointerEvent) => {
            if (held) {
                return;
            }
            const bar = barUnder(event);
            if (bar !== over) {
                over?.removeAttribute("data-on-scrollbar");
                bar?.setAttribute("data-on-scrollbar", "");
                over = bar;
            }
        };
        const down = (event: PointerEvent) => {
            const bar = barUnder(event);
            if (bar) {
                held = bar;
                bar.setAttribute("data-scrollbar-grabbing", "");
            }
        };
        const up = () => {
            held?.removeAttribute("data-scrollbar-grabbing");
            held = null;
        };
        document.addEventListener("pointermove", move, { passive: true });
        document.addEventListener("pointerdown", down, { passive: true });
        document.addEventListener("pointerup", up, { passive: true });
        document.addEventListener("pointercancel", up, { passive: true });
        return () => {
            document.removeEventListener("pointermove", move);
            document.removeEventListener("pointerdown", down);
            document.removeEventListener("pointerup", up);
            document.removeEventListener("pointercancel", up);
        };
    }, []);

    return null;

}
