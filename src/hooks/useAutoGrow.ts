import { RefObject, useEffect, useLayoutEffect, useRef } from "react";

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

    // The width the text was last fitted at: a width that changed after that
    // (a container laying out again right after the box mounted: the card
    // columns of a dialog) is a rewrap, even if it settled before the
    // observer below was set up.
    const fittedWidth = useRef(0);

    useLayoutEffect(() => {

        if (enabled) {
            fit(ref.current);
            fittedWidth.current = ref.current?.clientWidth ?? 0;
        }

    }, [ref, value, enabled]);

    useEffect(() => {

        const el = ref.current;

        if (!enabled || !el || typeof ResizeObserver === "undefined") {
            return;
        }

        // Only a width change rewraps the text -- the height changes
        // this hook makes itself must not trigger another fit.
        const refit = () => {

            if (el.clientWidth !== fittedWidth.current) {
                fit(el);
                fittedWidth.current = el.clientWidth;
            }

        };

        refit();

        const observer = new ResizeObserver(refit);

        observer.observe(el);

        return () => observer.disconnect();

    }, [ref, enabled]);

}
