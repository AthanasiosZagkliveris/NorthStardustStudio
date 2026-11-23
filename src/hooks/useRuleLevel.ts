import { RefObject, useLayoutEffect } from "react";

/**
 * A SIDE PANEL'S RULE LEVEL WITH THE PAGE'S (owner, 2026-11-23 17:28 UTC+2: "The underlines on side panels, and the page, does not match, fix it"): the panel's
 * head (`.notepad-head`, the Notes' and the Calendar's) is as tall as the room from the panel's top to the page title's rule (`.interview-divider`), so the line
 * under the head runs on with the page's. Where the page has no title rule (the Landing page), the head keeps its own height.
 */
export function useRuleLevel(head: RefObject<HTMLElement | null>, active: boolean): void {
    useLayoutEffect(() => {
        const node = head.current;
        if (!active || !node) {
            return;
        }
        const fit = () => {
            node.style.height = "";
            const rule = document.querySelector<HTMLElement>(".interview-header .interview-divider");
            if (!rule || rule.getClientRects().length === 0) {
                return;
            }
            const top = node.getBoundingClientRect().top;
            // (The head's own rule, its bottom border, on the page rule's top edge: the two lines start at one height.)
            const height = rule.getBoundingClientRect().top - top + (parseFloat(getComputedStyle(node).borderBottomWidth) || 0);
            if (height > 24) {
                node.style.height = Math.round(height) + "px";
            }
        };
        fit();
        window.addEventListener("resize", fit);
        window.addEventListener("tiles-fit", fit);
        return () => {
            window.removeEventListener("resize", fit);
            window.removeEventListener("tiles-fit", fit);
        };
    });
}
