import { useEffect } from "react";

/**
 * THE SCROLLING RULES OF THE APP (docs/ai/layout-rules.md, "Scrolling"):
 *
 *  1. While a dialog or a floating card is open the page behind it does not scroll: the wheel scrolls what is under the pointer if that can still move that
 *     way, otherwise the open layer itself (a card taller than the window), and never the page.
 *  2. Where a scroller's content is taller than the scroller (a long page, a dialog's grid, a tall card), its end can be scrolled up to a quarter of the window's
 *     height above the bottom (`data-reserve`, a bottom padding of 25vh), so the last lines are read and worked in the middle of the screen, not at the edge.
 */
const RESERVE_SELECTOR = "main.conversation-content, .section-tile-dialog-body, .floating-card-host[data-tall] .floating-card-stack";

export default function useScrollRules() {

    useEffect(() => {

        function canScroll(node: HTMLElement, deltaY: number): boolean {
            const style = getComputedStyle(node);
            if (!/(auto|scroll)/.test(style.overflowY) || node.scrollHeight <= node.clientHeight + 1) {
                return false;
            }
            return deltaY < 0 ? node.scrollTop > 0 : node.scrollTop + node.clientHeight < node.scrollHeight - 1;
        }

        function onWheel(event: WheelEvent) {
            const overlays = document.querySelectorAll<HTMLElement>(".section-tile-overlay");
            if (overlays.length === 0 || event.ctrlKey || event.deltaY === 0) {
                return;
            }
            const layer = overlays[overlays.length - 1];
            let node: Element | null = event.target instanceof Element ? event.target : null;
            while (node && node !== document.documentElement) {
                // (Something inside the open layer that can still move that way takes it as the browser does; the layer itself is moved here, because a dialog's body between the pointer and the layer stops the chain -- overscroll-behavior: contain -- and the wheel over a card would otherwise do nothing.)
                if (node instanceof HTMLElement && node !== layer && canScroll(node, event.deltaY)) {
                    return;
                }
                node = node.parentElement;
            }
            // (Nothing under the pointer can take it: the open layer does, if it can scroll; the page never.)
            event.preventDefault();
            if (canScroll(layer, event.deltaY)) {
                layer.scrollTop += event.deltaY;
            }
        }

        let frame = 0;

        function mark() {
            frame = 0;
            const reserve = window.innerHeight * 0.25;
            document.querySelectorAll<HTMLElement>(RESERVE_SELECTOR).forEach(node => {
                const isPage = node.matches("main.conversation-content");
                const total = isPage ? (document.scrollingElement?.scrollHeight ?? 0) : node.scrollHeight;
                const room = isPage ? window.innerHeight : node.clientHeight;
                const has = node.hasAttribute("data-reserve");
                const without = has ? total - reserve : total;
                const needs = without > room + 2;
                if (needs !== has) {
                    if (needs) {
                        node.setAttribute("data-reserve", "");
                    } else {
                        node.removeAttribute("data-reserve");
                    }
                }
            });
        }

        function later() {
            if (frame === 0) {
                frame = window.requestAnimationFrame(mark);
            }
        }

        document.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("resize", later);
        const observer = new MutationObserver(later);
        observer.observe(document.body, { childList: true, subtree: true });
        later();

        return () => {
            document.removeEventListener("wheel", onWheel);
            window.removeEventListener("resize", later);
            observer.disconnect();
            if (frame !== 0) {
                window.cancelAnimationFrame(frame);
            }
        };

    }, []);

}
