import { useCallback, useMemo, useState } from "react";

import { toggledIn } from "./toggledIn.ts";

/**
 * Which repeatable item cards and sections (Profiles, Resources, Funding Sources, a Segment...) are open.
 *
 * What a fold HIDES decides where it starts (the owner's rule, 2026-10-17): information, help and links start CLOSED; everything else -- the content the user
 * writes and reads -- starts OPEN (`openByDefault`). A newly added item is opened with `expand` so it can be filled in straight away.
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

export function useItemFolds(openByDefault = false): ItemFolds {

    // The ids that stand OTHER than the default: opened where items start closed, closed where they start open.
    const [changed, setChanged] = useState<ReadonlySet<string>>(new Set());

    const isOpen = useCallback((id: string) => changed.has(id) !== openByDefault, [changed, openByDefault]);

    const toggle = useCallback((id: string) => {
        setChanged(current => toggledIn(current, id));
    }, []);

    const set = useCallback((ids: readonly string[], open: boolean) => {
        setChanged(current => {
            const next = new Set(current);
            ids.forEach(id => open !== openByDefault ? next.add(id) : next.delete(id));
            return next;
        });
    }, [openByDefault]);

    const expand = useCallback((id: string) => set([id], true), [set]);

    return useMemo(() => ({
        isOpen,
        toggle,
        expand,
        setAll: set,
        allOpen: (ids: readonly string[]) => ids.length > 0 && ids.every(isOpen)
    }), [isOpen, toggle, expand, set]);

}
