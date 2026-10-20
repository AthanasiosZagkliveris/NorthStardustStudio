import { RefObject, useEffect } from "react";

import { UndoService } from "../../../services/UndoService";

/** "Remove Profile 1", "Remove this Offering": what a × removes. */
const REMOVE_NAME = /^Remove (?:this )?(.+)$/;

/** A movable box's name (ReorderControls' useMovableBox), which Delete removes. */
const MOVABLE_NAME = /^(.+)\. Use the arrow keys to move it, Delete to remove it\.$/;

/**
 * EVERY REMOVAL ON A PAGE, MARKED ONCE: a click on any × named
 * "Remove …" inside `root`, or Delete / Backspace on a movable box,
 * tells UndoService that a removal of that thing is starting -- so
 * when the page's answer changes in the same moment, the change can
 * be undone (offerRemovalUndo). Listened for on the way down, before
 * the control's own handler removes it.
 */
export function useRemovalMarks(root: RefObject<HTMLElement | null>): void {

    useEffect(() => {

        const element = root.current;

        if (!element) {
            return;
        }

        function onClick(event: MouseEvent) {
            const button = event.target instanceof Element ? event.target.closest("button") : null;
            if (!button || button.disabled || !element?.contains(button)) {
                return;
            }
            const match = REMOVE_NAME.exec(button.getAttribute("aria-label") ?? "");
            if (match) {
                UndoService.markRemoval(match[1]);
            }
        }

        function onKeyDown(event: KeyboardEvent) {
            if (event.key !== "Delete" && event.key !== "Backspace") {
                return;
            }
            const box = event.target instanceof HTMLElement ? event.target : null;
            const match = MOVABLE_NAME.exec(box?.getAttribute("aria-label") ?? "");
            if (match) {
                UndoService.markRemoval(match[1]);
            }
        }

        element.addEventListener("click", onClick, true);
        element.addEventListener("keydown", onKeyDown, true);

        return () => {
            element.removeEventListener("click", onClick, true);
            element.removeEventListener("keydown", onKeyDown, true);
        };

    }, [root]);

}
