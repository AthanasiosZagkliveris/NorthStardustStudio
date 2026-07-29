import { useEffect, useRef } from "react";

// How far the pointer has to move (in either direction) before a
// press is treated as the start of a drag-scroll, rather than an
// ordinary click/tap -- without this, simply clicking a card or
// tapping a table cell would occasionally register a few pixels of
// jitter and get mistaken for a drag.
const DRAG_ARM_THRESHOLD = 4;

// A press that starts on one of these (or inside one) never arms a
// drag -- dragging FROM a text field would fight with the browser's
// own text-selection drag, dragging FROM a <select> would fight
// with opening it, and dragging FROM the column-resize handle needs
// to keep doing exactly what it already does. Every other pixel of
// the container -- cell padding, the row-number column, header
// background, gaps between cards, card padding -- still arms a
// drag, which is what makes this feel like "press anywhere and
// drag" rather than a handful of narrow scrollbar-adjacent strips.
const INTERACTIVE_SELECTOR =
    "input, textarea, select, button, a, [contenteditable], .col-resize-handle";

/**
 * Enables click-and-drag ("press and drag left/right to scroll")
 * horizontal panning on a horizontally-scrollable container --
 * attach the returned ref to the same element that has
 * `overflow-x: auto` (or `scroll`) in CSS.
 *
 * A press is only turned into a scroll once the pointer has moved
 * past a small threshold, so an ordinary click still works exactly
 * as before; a press that starts on a genuinely interactive control
 * (a text field, dropdown, button, link, or the table's own column-
 * resize handle) never arms a drag at all, so typing, text
 * selection, clicking, and resizing all keep behaving normally --
 * only the container's own background triggers a drag-scroll.
 */
export function useDragToScroll<T extends HTMLElement>() {

    const ref = useRef<T | null>(null);

    useEffect(() => {

        if (!ref.current) {
            return;
        }

        // A type assertion (not just a control-flow narrowing) --
        // TS's null-narrowing from the guard above doesn't persist
        // into the nested `function` declarations below (they're
        // hoisted, so TS can't prove they only run after the guard
        // has already passed), so `el`'s declared type needs to be
        // non-null outright.
        const el = ref.current as T;

        let pointerId: number | null = null;
        let startX = 0;
        let startY = 0;
        let startScrollLeft = 0;
        let dragging = false;

        // Set the instant a real drag (past the threshold) actually
        // happens, and read/cleared by a capturing "click" listener
        // right after -- without this, releasing the pointer after
        // a drag would still fire an ordinary click on whatever
        // happens to be underneath it (e.g. re-selecting a card the
        // drag happened to end on top of).
        let suppressNextClick = false;

        function onPointerDown(event: PointerEvent) {

            // Only a left-click (mouse) or a single touch/pen
            // contact starts a drag -- a right-click or a
            // secondary touch point should never be hijacked.
            if (event.pointerType === "mouse" && event.button !== 0) {
                return;
            }

            if (event.target instanceof Element && event.target.closest(INTERACTIVE_SELECTOR)) {
                return;
            }

            pointerId = event.pointerId;
            startX = event.clientX;
            startY = event.clientY;
            startScrollLeft = el.scrollLeft;
            dragging = false;

        }

        function onPointerMove(event: PointerEvent) {

            if (pointerId === null || event.pointerId !== pointerId) {
                return;
            }

            const dx = event.clientX - startX;
            const dy = event.clientY - startY;

            if (!dragging) {

                // Require the movement to be both past the
                // threshold AND predominantly horizontal, so a
                // vertical drag (scrolling the page itself) never
                // gets hijacked into a horizontal one just because
                // of a little sideways wobble.
                if (Math.abs(dx) < DRAG_ARM_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) {
                    return;
                }

                dragging = true;
                suppressNextClick = true;

                el.setPointerCapture(pointerId);
                el.classList.add("drag-scrolling");

            }

            // Only prevent default (blocking text selection / the
            // browser's own touch scroll) once a drag has actually
            // been armed -- up to that point the gesture might
            // still turn out to be an ordinary click or a vertical
            // page scroll, neither of which should be interfered
            // with.
            event.preventDefault();

            el.scrollLeft = startScrollLeft - dx;

        }

        function endDrag(event: PointerEvent) {

            if (pointerId === null || event.pointerId !== pointerId) {
                return;
            }

            if (dragging && el.hasPointerCapture(pointerId)) {
                el.releasePointerCapture(pointerId);
            }

            dragging = false;
            pointerId = null;

            el.classList.remove("drag-scrolling");

        }

        function onClickCapture(event: MouseEvent) {

            if (suppressNextClick) {

                event.preventDefault();
                event.stopPropagation();

                suppressNextClick = false;

            }

        }

        el.addEventListener("pointerdown", onPointerDown);
        el.addEventListener("pointermove", onPointerMove);
        el.addEventListener("pointerup", endDrag);
        el.addEventListener("pointercancel", endDrag);
        el.addEventListener("click", onClickCapture, { capture: true });

        return () => {

            el.removeEventListener("pointerdown", onPointerDown);
            el.removeEventListener("pointermove", onPointerMove);
            el.removeEventListener("pointerup", endDrag);
            el.removeEventListener("pointercancel", endDrag);
            el.removeEventListener("click", onClickCapture, { capture: true });

        };

    }, []);

    return ref;

}
