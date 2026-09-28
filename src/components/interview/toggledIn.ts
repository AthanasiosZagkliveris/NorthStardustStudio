/**
 * A copy of `set` with `key` switched: taken out if it was in, put in
 * if it was not. The one updater behind every open/folded, shown/hidden
 * and selected set the editors keep as UI state.
 */
export function toggledIn<T>(set: ReadonlySet<T>, key: T): Set<T> {
    const next = new Set(set);
    if (next.has(key)) {
        next.delete(key);
    } else {
        next.add(key);
    }
    return next;
}
