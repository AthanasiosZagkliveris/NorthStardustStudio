import { NOT_IN_LIBRARY, type AppLogEntry, type Library, type LibraryLogEntry, type Placement } from "../model/types.ts";
import type { TableData } from "../tables/types.ts";

/**
 * The last logged state of the library, the placements and the tables, and the difference
 * between it and the state now (docs/design/library/08-library-system.md, sections 5 and 6). Every
 * difference is a change that has to be in a log:
 *   the library log:  an asset added, edited or removed; an asset placed, moved or removed (and where)
 *   the app log:      a placement placed, moved or removed (and where; marked not in the library when
 *                     the asset is not in the library: case 3), a table row added, changed or removed
 */
export interface State {
    /** asset code -> the asset as JSON */
    assets: Record<string, string>;
    /** placement key -> position */
    placements: Record<string, number>;
    /** "table code|row id" -> the row as JSON */
    rows: Record<string, string>;
}

const canon = (value: unknown): string => JSON.stringify(value, (_key, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : 1))) : v));

export const placementKey = (p: Placement) => [p.asset, p.variant ?? "", p.system, p.page ?? "", p.chapter ?? "", p.tile ?? "", p.card ?? ""].join("|");
export const whereOf = (p: Placement) => [p.system, p.page, p.chapter, p.tile, p.card].filter(Boolean).join(" / ");
const placementOf = (key: string): Placement => {
    const [asset, variant, system, page, chapter, tile, card] = key.split("|");
    return { asset, ...(variant ? { variant } : {}), system, ...(page ? { page } : {}), ...(chapter ? { chapter } : {}), ...(tile ? { tile } : {}), ...(card ? { card } : {}) };
};

export function stateOf(library: Library, placements: readonly Placement[], tables: readonly TableData[]): State {
    return {
        assets: Object.fromEntries(library.assets.map(a => [a.code, canon(a)])),
        placements: Object.fromEntries(placements.map(p => [placementKey(p), p.position ?? 0])),
        rows: Object.fromEntries(tables.flatMap(t => t.rows.map(r => [t.code + "|" + r.id, canon(r)])))
    };
}

export const emptyState = (): State => ({ assets: {}, placements: {}, rows: {} });

/** The top-level fields of an asset that differ between two JSON texts. */
function changedFields(before: string, after: string): string[] {
    const a = JSON.parse(before) as Record<string, unknown>, b = JSON.parse(after) as Record<string, unknown>;
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(k => canon(a[k]) !== canon(b[k])).sort();
}

export interface Difference {
    library: LibraryLogEntry[];
    app: AppLogEntry[];
}

export function diffState(before: State, after: State, date: string, assetNames: ReadonlyMap<string, string>): Difference {
    const library: LibraryLogEntry[] = [];
    const app: AppLogEntry[] = [];
    for (const code of Object.keys(after.assets)) {
        if (!(code in before.assets)) library.push({ date, asset: code, change: "added", what: assetNames.get(code) ?? code });
        else if (before.assets[code] !== after.assets[code]) library.push({ date, asset: code, change: "edited", what: (assetNames.get(code) ?? code) + ": " + changedFields(before.assets[code], after.assets[code]).join(", ") });
    }
    for (const code of Object.keys(before.assets)) if (!(code in after.assets)) library.push({ date, asset: code, change: "removed", what: code + " is no longer in the library" });

    // Placements: an asset that lost a place and gained another in the same step has moved.
    const added = Object.keys(after.placements).filter(k => !(k in before.placements));
    const removed = Object.keys(before.placements).filter(k => !(k in after.placements));
    const moved = new Set<string>();
    for (const asset of new Set([...added, ...removed].map(k => k.split("|")[0]))) {
        const gone = removed.filter(k => k.startsWith(asset + "|")), gained = added.filter(k => k.startsWith(asset + "|"));
        for (let i = 0; i < Math.min(gone.length, gained.length); i++) {
            moved.add(gone[i]); moved.add(gained[i]);
            const from = whereOf(placementOf(gone[i])), to = whereOf(placementOf(gained[i]));
            const notInLibrary = asset.startsWith(NOT_IN_LIBRARY);
            if (!notInLibrary) library.push({ date, asset, change: "moved", what: asset + " moved", where: "from " + from + " to " + to });
            app.push({ date, change: "moved", where: "from " + from + " to " + to, asset, notInLibrary, what: asset + " moved" });
        }
    }
    for (const key of added.filter(k => !moved.has(k))) {
        const p = placementOf(key), notInLibrary = p.asset.startsWith(NOT_IN_LIBRARY);
        if (!notInLibrary) library.push({ date, asset: p.asset, change: "placed", what: p.asset + " placed", where: whereOf(p) });
        app.push({ date, change: "placed", where: whereOf(p), asset: p.asset, notInLibrary, what: p.asset + " placed" });
    }
    for (const key of removed.filter(k => !moved.has(k))) {
        const p = placementOf(key), notInLibrary = p.asset.startsWith(NOT_IN_LIBRARY);
        if (!notInLibrary) library.push({ date, asset: p.asset, change: "removed", what: p.asset + " removed from a place", where: whereOf(p) });
        app.push({ date, change: "removed", where: whereOf(p), asset: p.asset, notInLibrary, what: p.asset + " removed" });
    }
    for (const key of Object.keys(after.placements)) {
        if (key in before.placements && before.placements[key] !== after.placements[key]) {
            const p = placementOf(key), notInLibrary = p.asset.startsWith(NOT_IN_LIBRARY);
            const text = "position " + before.placements[key] + " to " + after.placements[key];
            if (!notInLibrary) library.push({ date, asset: p.asset, change: "moved", what: p.asset + " moved inside its card", where: whereOf(p) + " (" + text + ")" });
            app.push({ date, change: "moved", where: whereOf(p) + " (" + text + ")", asset: p.asset, notInLibrary, what: p.asset + " moved inside its card" });
        }
    }

    // Table rows: the structure of the app.
    for (const key of Object.keys(after.rows)) {
        const [code, id] = [key.split("|")[0], key.split("|").slice(1).join("|")];
        if (!(key in before.rows)) app.push({ date, change: "placed", where: code + " " + id, notInLibrary: false, what: "row added" });
        else if (before.rows[key] !== after.rows[key]) app.push({ date, change: "edited", where: code + " " + id, notInLibrary: false, what: "row changed: " + changedFields(before.rows[key], after.rows[key]).join(", ") });
    }
    for (const key of Object.keys(before.rows)) if (!(key in after.rows)) app.push({ date, change: "removed", where: key.replace("|", " "), notInLibrary: false, what: "row removed" });
    return { library, app };
}
