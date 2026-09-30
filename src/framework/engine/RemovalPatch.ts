/*
    UNDOING A REMOVAL, for any answer.

    A removal is one change to a page's answer -- a card taken out of
    a list, a row out of a table, an optional text emptied -- and
    whatever the editor tidied up with it (a reference to the removed
    card cleared). removalPatches compares the answer before and after
    and writes down what was taken away: each element that left an
    array (with its place, and the id of the one before it) and each
    value that changed. undoRemoval puts those back into the answer as
    it is NOW, so an edit made elsewhere since is kept:

      - an element goes back at its place (after the element that was
        before it, where elements have ids), with the same id and all
        its data -- unless one with that id is already there;
      - a changed value goes back only where it still holds what the
        removal left, so a field typed into since is not overwritten.

    Arrays whose elements all carry a string `id` are matched by id;
    others by position.
*/

type Segment = string | number | { id: string };

export type RemovalPatch =
    | { kind: "insert"; path: Segment[]; index: number; afterId: string | null; value: unknown }
    | { kind: "set"; path: Segment[]; before: unknown; after: unknown };

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === "object" && !Array.isArray(value);
}

function deepEqual(one: unknown, other: unknown): boolean {
    if (one === other) {
        return true;
    }
    if (Array.isArray(one) && Array.isArray(other)) {
        return one.length === other.length && one.every((item, index) => deepEqual(item, other[index]));
    }
    if (isRecord(one) && isRecord(other)) {
        const keys = new Set([...Object.keys(one), ...Object.keys(other)]);
        for (const key of keys) {
            if (!deepEqual(one[key], other[key])) {
                return false;
            }
        }
        return true;
    }
    return false;
}

/** The id of an element, when it is a record with a string one. */
function idOf(value: unknown): string | null {
    return isRecord(value) && typeof value.id === "string" && value.id !== "" ? value.id : null;
}

/** Whether every element of both arrays has an id, none repeated. */
function keyedById(one: unknown[], other: unknown[]): boolean {
    for (const list of [one, other]) {
        const ids = list.map(idOf);
        if (ids.some(id => id === null) || new Set(ids).size !== ids.length) {
            return false;
        }
    }
    return one.length + other.length > 0;
}

function collect(before: unknown, after: unknown, path: Segment[], out: RemovalPatch[]): void {

    if (deepEqual(before, after)) {
        return;
    }

    if (Array.isArray(before) && Array.isArray(after)) {

        if (keyedById(before, after)) {
            const kept = new Map(after.map(item => [idOf(item) as string, item]));
            before.forEach((item, index) => {
                const id = idOf(item) as string;
                if (kept.has(id)) {
                    collect(item, kept.get(id), [...path, { id }], out);
                } else {
                    out.push({ kind: "insert", path, index, afterId: index > 0 ? idOf(before[index - 1]) : null, value: item });
                }
            });
            return;
        }

        // By position: an element that does not match its counterpart
        // is taken as removed while there are removals to account for.
        let removals = before.length - after.length;
        if (removals < 0) {
            out.push({ kind: "set", path, before, after });
            return;
        }
        let at = 0;
        before.forEach((item, index) => {
            if (at < after.length && deepEqual(item, after[at])) {
                at++;
            } else if (removals > 0) {
                removals--;
                out.push({ kind: "insert", path, index, afterId: null, value: item });
            } else {
                collect(item, after[at], [...path, at], out);
                at++;
            }
        });
        return;

    }

    if (isRecord(before) && isRecord(after)) {
        for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
            collect(before[key], after[key], [...path, key], out);
        }
        return;
    }

    out.push({ kind: "set", path, before, after });

}

/** What a removal took away from `before` to leave `after`. */
export function removalPatches(before: unknown, after: unknown): RemovalPatch[] {
    const out: RemovalPatch[] = [];
    collect(before, after, [], out);
    return out;
}

/** Keys that name or point at things rather than hold what a person wrote. */
function isReferenceKey(key: string): boolean {
    return key === "id" || /Ids?$/.test(key);
}

/** Whether a value holds anything a person wrote: text, a figure, a list of either. */
export function hasContent(value: unknown): boolean {
    if (typeof value === "string") {
        return value.trim() !== "";
    }
    if (typeof value === "number") {
        return Number.isFinite(value) && value !== 0;
    }
    if (Array.isArray(value)) {
        return value.some(hasContent);
    }
    if (isRecord(value)) {
        return Object.entries(value).some(([key, item]) => !isReferenceKey(key) && hasContent(item));
    }
    return false;
}

/** Whether the removal took away something a person wrote (an empty row removed is not worth an undo). */
export function removesContent(patches: readonly RemovalPatch[]): boolean {
    return patches.some(patch => patch.kind === "insert"
        ? hasContent(patch.value)
        : hasContent(patch.before) && !hasContent(patch.after));
}

/** The element of `container` a segment names, or undefined. */
function step(container: unknown, segment: Segment): unknown {
    if (typeof segment === "object") {
        return Array.isArray(container) ? container.find(item => idOf(item) === segment.id) : undefined;
    }
    if (typeof segment === "number") {
        return Array.isArray(container) ? container[segment] : undefined;
    }
    return isRecord(container) ? container[segment] : undefined;
}

/**
 * `root` with the value at `path` replaced by `change(value)`, copied
 * along the way; `root` itself where the path no longer leads anywhere.
 */
function updateAt(root: unknown, path: Segment[], change: (value: unknown) => unknown): unknown {

    if (path.length === 0) {
        return change(root);
    }

    const [segment, ...rest] = path;
    const child = step(root, segment);

    if (typeof segment === "string") {
        if (!isRecord(root)) {
            return root;
        }
        const next = updateAt(child, rest, change);
        return next === child && rest.length > 0 ? root : { ...root, [segment]: next };
    }

    if (!Array.isArray(root) || child === undefined) {
        return root;
    }
    const index = typeof segment === "number" ? segment : root.indexOf(child);
    const next = updateAt(child, rest, change);
    if (next === child) {
        return root;
    }
    const copy = [...root];
    copy[index] = next;
    return copy;

}

/** The value at `path`, or undefined. */
function valueAt(root: unknown, path: Segment[]): unknown {
    return path.reduce<unknown>((value, segment) => step(value, segment), root);
}

/** `current` with what a removal took away (its patches) put back. */
export function undoRemoval(current: unknown, patches: readonly RemovalPatch[]): unknown {

    let next = current;

    for (const patch of patches) {

        if (patch.kind === "set") {
            if (deepEqual(valueAt(next, patch.path), patch.after)) {
                next = patch.path.length === 0 ? patch.before : updateAt(next, patch.path, () => patch.before);
            }
            continue;
        }

        next = updateAt(next, patch.path, list => {
            const array = Array.isArray(list) ? list : list === undefined ? [] : null;
            if (!array) {
                return list;
            }
            const id = idOf(patch.value);
            if (id && array.some(item => idOf(item) === id)) {
                return list;
            }
            let index = Math.min(patch.index, array.length);
            if (id) {
                if (patch.afterId === null) {
                    index = 0;
                } else {
                    const previous = array.findIndex(item => idOf(item) === patch.afterId);
                    if (previous >= 0) {
                        index = previous + 1;
                    }
                }
            }
            const copy = [...array];
            copy.splice(index, 0, patch.value);
            return copy;
        });

    }

    return next;

}
