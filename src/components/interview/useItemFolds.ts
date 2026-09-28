import { useCallback, useMemo, useState } from "react";

import { toggledIn } from "./toggledIn.ts";

/**
 * Which repeatable item cards (Profiles, Resources, Funding Sources…)
 * are open. The inverse of each editor's own `collapsed` set: items
 * start CLOSED so a long list reads as a short list of one-line rows,
 * and only the item being worked on is open. A newly added item is
 * opened with `expand` so it can be filled in straight away.
 *
 * UI state only -- never stored with the answer.
 */
export interface ItemFolds {
    isOpen(id: string): boolean;
    toggle(id: string): void;
    expand(id: string): void;
    setAll(ids: readonly string[], open: boolean): void;
    allOpen(ids: readonly string[]): boolean;
}

export function useItemFolds(): ItemFolds {

    const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

    const toggle = useCallback((id: string) => {
        setExpanded(current => toggledIn(current, id));
    }, []);

    const expand = useCallback((id: string) => {
        setExpanded(current => current.has(id) ? current : new Set(current).add(id));
    }, []);

    const setAll = useCallback((ids: readonly string[], open: boolean) => {
        setExpanded(current => {
            const next = new Set(current);
            ids.forEach(id => open ? next.add(id) : next.delete(id));
            return next;
        });
    }, []);

    return useMemo(() => ({
        isOpen: (id: string) => expanded.has(id),
        toggle,
        expand,
        setAll,
        allOpen: (ids: readonly string[]) => ids.length > 0 && ids.every(id => expanded.has(id))
    }), [expanded, toggle, expand, setAll]);

}
