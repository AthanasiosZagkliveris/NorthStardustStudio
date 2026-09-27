import { RefObject, useEffect, useLayoutEffect } from "react";

// Sets the textarea's height to fit its content, so it never
// scrolls inside itself. Collapsing to "auto" first lets it shrink
// again; "auto" falls back to the box's own rows/min-height, so
// that stays the minimum.
function fit(el: HTMLTextAreaElement | null) {

    if (!el) {
        return;
    }

    const style = getComputedStyle(el);

    // scrollHeight counts the padding but not the border, so it has
    // to be converted to whatever box `height` sizes.
    const adjustment = style.boxSizing === "border-box"
        ? (parseFloat(style.borderTopWidth) || 0) + (parseFloat(style.borderBottomWidth) || 0)
        : -((parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0));

    el.style.overflowY = "hidden";

    el.style.height = "auto";

    el.style.height = `${el.scrollHeight + adjustment}px`;

}

/**
 * Makes a textarea grow to fit its content: on mount, on every
 * value change, and whenever its width changes (a window resize
 * rewraps the text). Opt-in via `enabled`, so a caller can pass the
 * hook unconditionally.
 */
export function useAutoGrow(

    ref: RefObject<HTMLTextAreaElement | null>,

    value: string,

    enabled = true

) {

    useLayoutEffect(() => {

        if (enabled) {
            fit(ref.current);
        }

    }, [ref, value, enabled]);

    useEffect(() => {

        const el = ref.current;

        if (!enabled || !el || typeof ResizeObserver === "undefined") {
            return;
        }

        // Only a width change rewraps the text -- the height changes
        // this hook makes itself must not trigger another fit.
        let width = el.clientWidth;

        const observer = new ResizeObserver(() => {

            if (el.clientWidth !== width) {
                width = el.clientWidth;
                fit(el);
            }

        });

        observer.observe(el);

        return () => observer.disconnect();

    }, [ref, enabled]);

}
