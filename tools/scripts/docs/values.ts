/**
 * The numbers in the documents' token tables, read from the code
 * (documentation plan, step 4). A table row whose first cell holds custom
 * properties and whose value cell holds a plain number is compared with what
 * the stylesheets give that property; sync() rewrites a value that differs,
 * so the table cannot go stale. Pure functions; the script and the test read
 * the files.
 *
 * What the code gives a property: the last definition on :root, in the order
 * the app loads the stylesheets (a later file, or a later line, wins); a
 * property defined only inside other rules gives its value when all of those
 * agree. var() and a calc() of plain numbers are worked out. A value that
 * cannot be worked out is "unknown" and is not compared.
 */

/** The stylesheets in the order the app loads them (the cascade's order); a file not listed comes first. */
export const LOAD_ORDER = [
    "colors.generated.css", "sizes.generated.css", "colors.css", "global.css", "remove-button.css", "notepad.css", "focus-mode.css", "search.css",
    "option-picker.css", "theme-switch.css", "undo-toast.css", "app-header.css", "workspace.css", "section-tiles.css", "card-tile.css", "card-folding.css",
    "label-arrow.css", "title-arrow.css", "capability-overview.css", "numbered-list.css", "delivery.css", "page-3-edges.css", "channel-resource-table.css",
    "demand.css", "status-shape.css", "bullet-rail.css", "conversation.css", "conversation-layout.css", "system-confirmation.css"
];

export interface Stylesheet {
    readonly name: string;
    readonly text: string;
}

interface Definition {
    readonly value: string;
    readonly root: boolean;
}

export type Definitions = Map<string, Definition[]>;

export function collectDefinitions(sheets: readonly Stylesheet[]): Definitions {
    const ordered = [...sheets].sort((a, b) => LOAD_ORDER.indexOf(a.name) - LOAD_ORDER.indexOf(b.name));
    const defs: Definitions = new Map();
    for (const sheet of ordered) {
        const text = sheet.text.replace(/\/\*[\s\S]*?\*\//g, "");
        for (const block of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
            // The base value: a rule for :root itself, not for a reading mode or another state of it (:root[data-theme="dark"]).
            const root = block[1].split(",").some(selector => selector.trim() === ":root" || selector.trim() === "html");
            for (const m of block[2].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+)(?:;|$)/gi)) {
                const list = defs.get(m[1]) ?? [];
                list.push({ value: m[2].trim().replace(/\s+/g, " ").replace(/\s*!important$/, ""), root });
                defs.set(m[1], list);
            }
        }
    }
    return defs;
}

/** All the values a property can have (one if it is defined on :root), with var() and calc() worked out as far as they go. */
export function valuesOf(name: string, defs: Definitions, depth = 0): Set<string> {
    const list = defs.get(name);
    if (!list || depth > 8) return new Set();
    const roots = list.filter(d => d.root);
    const chosen = roots.length ? [roots[roots.length - 1]] : list;
    const out = new Set<string>();
    for (const definition of chosen) for (const v of substitute(definition.value, defs, depth + 1)) out.add(evaluate(v));
    return out;
}

/** Replace each var(--x[, fallback]) by every value --x can have. */
function substitute(value: string, defs: Definitions, depth: number): string[] {
    const m = /var\(\s*(--[a-z0-9-]+)\s*(?:,\s*([^()]*))?\)/i.exec(value);
    if (!m) return [value];
    const inner = valuesOf(m[1], defs, depth);
    const options = inner.size ? [...inner] : m[2] !== undefined ? [m[2].trim()] : [];
    if (!options.length) return [value];
    return options.flatMap(option => substitute(value.slice(0, m.index) + option + value.slice(m.index + m[0].length), defs, depth));
}

/** calc() of one operation on plain numbers with the same unit (or a unitless factor) is worked out; anything else is returned as it is. */
export function evaluate(value: string): string {
    const m = /^calc\(\s*(-?\d*\.?\d+)(px|em|%)?\s*([*+/-])\s*(-?\d*\.?\d+)(px|em|%)?\s*\)$/.exec(value);
    if (!m) return value;
    const a = Number(m[1]);
    const b = Number(m[4]);
    const unit = m[2] ?? m[5] ?? "";
    let result: number;
    if (m[3] === "*") {
        if (m[2] && m[5]) return value;
        result = a * b;
    } else if (m[3] === "/") {
        if (m[5]) return value;
        result = a / b;
    } else {
        if ((m[2] ?? "") !== (m[5] ?? "")) return value;
        result = m[3] === "+" ? a + b : a - b;
    }
    return String(Math.round(result * 1e4) / 1e4) + unit;
}

const SIMPLE = /^-?\d*\.?\d+(?:px|em|%)?$/;
export const isSimple = (value: string) => SIMPLE.test(value);

export interface Row {
    readonly line: number;
    readonly names: string[];
    /** The plain numbers of the value cell, one per name (null where the cell is not a plain number). */
    readonly documented: (string | null)[];
}

/**
 * The rows of the tables whose first cell holds custom properties: "| `--a` | 12px | ... |",
 * "| `--a`, `--b` | 6px, 12px | ... |" and "| `--a` / `--b` | 26.3px / 4.5px | ... |".
 */
export function tokenRows(text: string): Row[] {
    const rows: Row[] = [];
    text.split("\n").forEach((line, index) => {
        const m = /^\| (`--[a-z0-9-]+`(?:(?:, | \/ )`--[a-z0-9-]+`)*) \| ([^|]+) \|/.exec(line);
        if (!m) return;
        const names = [...m[1].matchAll(/--[a-z0-9-]+/g)].map(x => x[0]);
        const cell = m[2].trim().replace(/\s*\(.*$/, "");
        const parts = names.length === 1 ? [cell] : cell.split(/\s*[,/]\s*/);
        const documented = names.map((_, k) => (parts.length === names.length && isSimple(parts[k]) ? parts[k] : null));
        rows.push({ line: index + 1, names, documented });
    });
    return rows;
}

export interface Difference {
    readonly line: number;
    readonly name: string;
    readonly documented: string;
    /** What the code gives: one value, or several (ambiguous), or none (the property is not defined). */
    readonly code: string[];
}

/** The plain numbers of the table rows that the code does not give. A value the code cannot give as a plain number is not compared. */
export function differences(text: string, defs: Definitions): Difference[] {
    const found: Difference[] = [];
    for (const row of tokenRows(text)) {
        row.names.forEach((name, k) => {
            const documented = row.documented[k];
            if (documented === null) return;
            const code = [...valuesOf(name, defs)];
            if (defs.has(name) && !code.some(isSimple)) return;
            if (code.includes(documented)) return;
            found.push({ line: row.line, name, documented, code });
        });
    }
    return found;
}

/** The text with each differing plain number replaced by the code's, where the code gives exactly one. */
export function sync(text: string, defs: Definitions): { text: string; changed: Difference[]; unresolved: Difference[] } {
    const lines = text.split("\n");
    const rows = tokenRows(text);
    const changed: Difference[] = [];
    const unresolved: Difference[] = [];
    for (const difference of differences(text, defs)) {
        const simple = difference.code.filter(isSimple);
        const row = rows.find(candidate => candidate.line === difference.line);
        const line = lines[difference.line - 1];
        const cell = /^(\| `[^|]+` \| )([^|]+)( \|)/.exec(line);
        if (simple.length !== 1 || !row || !cell) {
            unresolved.push(difference);
            continue;
        }
        // Replace the plain number that stands at the property's place in the value cell.
        const index = row.names.indexOf(difference.name);
        let seen = -1;
        const rewritten = cell[2].replace(/-?\d*\.?\d+(?:px|em|%)?/g, number => {
            seen++;
            return seen === index && number === difference.documented ? simple[0] : number;
        });
        lines[difference.line - 1] = line.replace(cell[0], cell[1] + rewritten + cell[3]);
        changed.push({ ...difference, code: simple });
    }
    return { text: lines.join("\n"), changed, unresolved };
}
