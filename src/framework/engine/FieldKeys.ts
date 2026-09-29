/**
 * ONE ADDRESS FOR ANY ANSWERABLE VALUE, CARD OR SECTION.
 *
 * A `FieldKey` names one place an answer is given: the System, the
 * page (Section number) and a PATH inside that page --
 *
 *   "1.1:mission"                        a column of a columns page
 *   "1.3:organization"                   a section of a bespoke page
 *                                        (its rail id, see railItems)
 *   "1.3:organization/legal-form"        a field in it, by its label
 *   "3.3:resource-3f2a/price"            a field in a card, by the
 *                                        card's anchor and the label
 *
 * Flags and notes (the annotations, see Annotations.ts), the Review
 * page, search's field index, scenario overrides, the lender check
 * and the glossary all address fields this way -- never with a key
 * scheme of their own.
 *
 * A path segment is a part id, a rail id, a card anchor or a label's
 * slug; segments are joined with "/" and each is URI-encoded, so an
 * id holding "/" or ":" still round-trips.
 */

export type FieldKey = string;

export interface FieldAddress {

    /** The System's number (1 = Identity). */
    systemNumber: number;

    /** The page's Section number, from 1. */
    sectionNumber: number;

    /** Inside the page: a column or section, then card, then field. */
    path: readonly string[];

}

/** A label as a path segment: "Legal Form" -> "legal-form". */
export function slug(label: string): string {
    return label
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function fieldKey(address: FieldAddress): FieldKey {
    return address.systemNumber + "." + address.sectionNumber + ":" +
        address.path.map(segment => encodeURIComponent(segment)).join("/");
}

/** The address a key names, or null for a string that is not a key. */
export function parseFieldKey(key: FieldKey): FieldAddress | null {

    const match = /^(\d+)\.(\d+):(.*)$/.exec(key);

    if (!match) {
        return null;
    }

    return {
        systemNumber: Number(match[1]),
        sectionNumber: Number(match[2]),
        path: match[3].length > 0 ? match[3].split("/").map(segment => decodeURIComponent(segment)) : []
    };

}

/** The key of the page a key belongs to ("1.3:"), for "everything on this page". */
export function pageKeyPrefix(systemNumber: number, sectionNumber: number): string {
    return systemNumber + "." + sectionNumber + ":";
}

/** Whether `key` lies inside `scope` (the same key, or a path under it). */
export function isWithin(key: FieldKey, scope: FieldKey): boolean {
    return key === scope || key.startsWith(scope.endsWith(":") ? scope : scope + "/");
}

/*
    Reading and writing a value by path. An object is entered by key;
    an array by the id of the element carrying it ("id" field), or by
    its index when the segment is a number and no element has that id.
*/

function step(container: unknown, segment: string): unknown {

    if (Array.isArray(container)) {
        const byId = container.find(item =>
            item && typeof item === "object" && (item as { id?: unknown }).id === segment);
        if (byId !== undefined) {
            return byId;
        }
        return /^\d+$/.test(segment) ? container[Number(segment)] : undefined;
    }

    if (container && typeof container === "object") {
        return (container as Record<string, unknown>)[segment];
    }

    return undefined;

}

/** The value at `path` inside `value`, or undefined where the path does not lead. */
export function readField(value: unknown, path: readonly string[]): unknown {
    return path.reduce<unknown>((current, segment) => step(current, segment), value);
}

/**
 * `value` with `next` at `path`, copied along the path and shared
 * everywhere else. Missing objects on the way are created; a path
 * into an array that names no element leaves the value unchanged.
 */
export function writeField(value: unknown, path: readonly string[], next: unknown): unknown {

    if (path.length === 0) {
        return next;
    }

    const [segment, ...rest] = path;

    if (Array.isArray(value)) {
        let index = value.findIndex(item =>
            item && typeof item === "object" && (item as { id?: unknown }).id === segment);
        if (index < 0 && /^\d+$/.test(segment) && Number(segment) < value.length) {
            index = Number(segment);
        }
        if (index < 0) {
            return value;
        }
        const copy = value.slice();
        copy[index] = writeField(value[index], rest, next);
        return copy;
    }

    const record = value && typeof value === "object" ? value as Record<string, unknown> : {};

    return { ...record, [segment]: writeField(record[segment], rest, next) };

}

/*
    THE FIELD REGISTRY: every field a page shows, with its label and
    page -- what search indexes and what a key names in words. A page
    registers its fields as it renders them (registerField, from the
    shared label components); the Framework adds its columns and
    sections without rendering (pageFields, railItems.ts, which reads
    the definitions).
*/

/**
 * What a field is (FieldKinds.ts): an ANSWER the person gives, or
 * NONE of theirs (see NoneReason).
 */
export type FieldKind = "answer" | "none";

/**
 * Why a field is none of the person's answers:
 *
 *   derived         worked out, read from elsewhere or read-only;
 *   binary          a yes or a no (one tick box, or two choices that
 *                   are each other's "not");
 *   optional-tick   an optional text opened by its own tick box;
 *   status          where a thing stands (Status, Completed);
 *   has-own-option  a choice that holds its own "not yet" answer;
 *   link            a link to another item (Performer, Owner);
 *   display         how figures are shown (Currency, Unit);
 *   name            a card's name: the card stands for it.
 */
export type NoneReason = "derived" | "binary" | "optional-tick" | "status" | "has-own-option" | "link" | "display" | "name";

/**
 * Whether two choices are a yes and a no: "Yes"/"No", or one the
 * other's "not" ("Registered" / "Not yet registered").
 */
export function isYesNoPair(options: readonly string[]): boolean {
    if (options.length !== 2) {
        return false;
    }
    const [one, other] = options.map(option => option.trim().toLowerCase());
    const negative = (text: string) => /^(no|not|none|never)\b/.test(text) || /\bnot\b/.test(text);
    return (one === "yes" && other === "no") || (one === "no" && other === "yes") || negative(one) !== negative(other);
}

export interface FieldEntry {

    key: FieldKey;

    /** The field as its label names it ("Legal Form"). */
    label: string;

    /** The page as its title names it ("3. Legal Entity"). */
    pageTitle: string;

    /** What it is (FieldKinds.ts); absent means an answer. */
    kind?: FieldKind;

    /** With kind "none": why. */
    why?: NoneReason;


}

const registry = new Map<FieldKey, FieldEntry>();

/** Records a field shown on a page (the last label seen for a key wins). */
export function registerField(entry: FieldEntry): void {
    registry.set(entry.key, entry);
}

/** Every field recorded so far, optionally only those of one page. */
export function registeredFields(systemNumber?: number, sectionNumber?: number): FieldEntry[] {
    const prefix = systemNumber !== undefined && sectionNumber !== undefined
        ? pageKeyPrefix(systemNumber, sectionNumber)
        : "";
    return [...registry.values()].filter(entry => entry.key.startsWith(prefix));
}

/** For tests: forgets every recorded field. */
export function clearFieldRegistry(): void {
    registry.clear();
}

/**
 * A page section's segment from its title: its rail id ("Founders &
 * Ownership" -> "founders-ownership"). The rails (railItems.railId)
 * and the editors' `data-rail` markers use this very function, so a
 * section's key and its place on the page can never drift apart.
 */
export function sectionSegment(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
