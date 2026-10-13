import { useEffect } from "react";

/**
 * THE PAGE TAB (docs/ai/tile-and-card-pattern.md, "Rails as a page tab"): the Pages rail and the Sections rail stand in a tab attached to the side of the
 * page's frame, in the frame's own colours -- its ground, its edge, its heading ink -- so the bullets and their names read as part of the page they belong to.
 *
 * The rails stand outside the page's cards, so they cannot inherit a card's colours: this reads them from the first frame (for the left tab) and the last frame (for
 * the right one) of the page as drawn, and sets them on the root: --rail-left-bg / -edge / -ink, --rail-right-bg / -edge / -ink. A page without a frame sets none, and
 * its rails stay as they were, without a tab.
 */
const FRAME = ".conversation-card .business-foundation-card:not(.section-tile-dialog)";
const HEAD = ".answer-column-label, .tiles-frame-head .field-group-title, .business-foundation-subhead, .field-group-title";

const NAMES = ["bg", "edge", "ink"] as const;

function opaque(colour: string): boolean {
    return colour !== "" && colour !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(colour);
}

function colourOf(frame: Element): { bg: string; edge: string; ink: string } | null {
    const style = getComputedStyle(frame);
    if (!opaque(style.backgroundColor)) {
        return null;
    }
    const head = frame.querySelector(HEAD);
    return {
        bg: style.backgroundColor,
        edge: opaque(style.borderTopColor) ? style.borderTopColor : style.color,
        ink: head ? getComputedStyle(head).color : style.color
    };
}

export default function useRailTab() {

    useEffect(() => {

        const root = document.documentElement;
        let frame = 0;

        function set(side: "left" | "right", colours: { bg: string; edge: string; ink: string } | null) {
            NAMES.forEach(name => {
                if (colours) {
                    root.style.setProperty("--rail-" + side + "-" + name, colours[name]);
                } else {
                    root.style.removeProperty("--rail-" + side + "-" + name);
                }
            });
        }

        function read() {
            frame = 0;
            const frames = [...document.querySelectorAll(FRAME)].filter(candidate => candidate.getBoundingClientRect().width > 300);
            set("left", frames.length > 0 ? colourOf(frames[0]) : null);
            set("right", frames.length > 0 ? colourOf(frames[frames.length - 1]) : null);
        }

        function later() {
            if (frame === 0) {
                frame = window.requestAnimationFrame(read);
            }
        }

        const observer = new MutationObserver(later);
        observer.observe(document.body, { childList: true, subtree: true });
        window.addEventListener("resize", later);
        const theme = new MutationObserver(later);
        theme.observe(root, { attributes: true, attributeFilter: ["data-theme", "class"] });
        later();

        return () => {
            observer.disconnect();
            theme.disconnect();
            window.removeEventListener("resize", later);
            if (frame !== 0) {
                window.cancelAnimationFrame(frame);
            }
            set("left", null);
            set("right", null);
        };

    }, []);

}
