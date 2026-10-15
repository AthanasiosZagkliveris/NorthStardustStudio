/**
 * The catalogue's tables, built from their sources (docs/design/05, the owner's
 * plan of 2026-10-15: one internal table of every component, reaction, size,
 * colour, field and type, per card, tile, page and system, to find the
 * similarities, the differences and the gaps before the library is built).
 *
 * Sources:
 *   variants, variant_rows   document 01, Part F (what the user can reach in each card, row by row)
 *   assets                   the asset contracts in src/library
 *   observations             the card scanner's output (scripts/cards/scan.mjs), one scan per file
 *   reactions                the reaction scanner's output (same files, records of kind "reaction")
 *   asset_map                which asset a kind of control, surface or field needs
 */
import { readFileSync } from "node:fs";

/** A cell of a Part F table is several lines joined by <br>. */
const lines = cell => cell.split(/<br\s*\/?>/i).map(text => text.replace(/\*\*/g, "").trim()).filter(Boolean);

/** The function of a field (Part F's Function column) as the kind of control it needs. */
export function controlOf(fn, field = "") {
    const f = fn.toLowerCase();
    const name = field.toLowerCase();
    if (f.startsWith("read-only")) return "read-only";
    if (f.startsWith("subtitle")) return "read-only";
    if (f.startsWith("text box, auto-growing")) return "optional note";
    if (f.startsWith("text box")) return "text box";
    if (f.startsWith("number box")) return "number box";
    if (f.startsWith("calendar")) return "date cell";
    if (f.startsWith("searchable dropdown")) return "dropdown";
    if (f.startsWith("dropdown")) return "dropdown";
    if (f.startsWith("checkbox and number")) return "extra (tick + number)";
    if (f.startsWith("checkboxes")) return "tick list (+ number)";
    if (f.startsWith("checkbox, then a dropdown")) return "tick + dropdown";
    if (f.startsWith("checkbox")) return "tick box";
    if (f.startsWith("link")) return "link symbol";
    if (f.startsWith("button")) {
        if (/remove|×/.test(name)) return "x";
        if (name === "+" || name.startsWith("+")) return "plus";
        return "button";
    }
    return fn ? "other: " + fn : "";
}

/** Where a kind of thing is covered by an asset contract in src/library (null: no asset yet). */
export const ASSET_OF = {
    "x": "Remove x",
    "plus": "Plus box",
    "info": "Info note",
    "fold arrow": "Fold arrow",
    "label arrow": "Label arrow",
    "dropdown": "Dropdown",
    "page rail": "Rails",
    "carousel rail": "Rails",
    "back": "Back button",
    "floating card": "Floating card",
    "tick box": null,
    "text box": null,
    "text area": null,
    "number box": null,
    "date cell": null,
    "label": null,
    "page arrow": null,
    "carousel arrow": null,
    "master tile": null,
    "open tile": null,
    "dialog view": null,
    "chapter frame": null,
    "link": null,
    "link symbol": null,
    "optional note": null,
    "extra (tick + number)": null,
    "tick list (+ number)": null,
    "tick + dropdown": null,
    "read-only": null,
    "button": null
};

/** Part F: the variants (one per card layout) and their rows. */
export function parseVariants(text) {
    const all = text.replace(/\r\n/g, "\n").split("\n");
    const start = all.findIndex(line => line.startsWith("## Part F."));
    const end = all.findIndex((line, index) => index > start && line.startsWith("## Part G."));
    const variants = [];
    const rows = [];
    let current = null;
    for (let at = start; at < end; at++) {
        const line = all[at];
        const heading = /^(#{3,6}) (.+)$/.exec(line);
        if (heading) {
            const title = heading[2].trim();
            if (/ > /.test(title) || /^Legal Entity expense card$/.test(title)) {
                const parts = title.split(" > ");
                current = {
                    id: "v" + String(variants.length + 1).padStart(3, "0"),
                    title,
                    place: parts.length > 1 ? parts[0] : "Identity",
                    section: parts.length > 2 ? parts[1] : "",
                    category: parts.length > 3 ? parts[2] : "",
                    group: parts[parts.length - 1],
                    line: at + 1,
                    source: "docs/design/01-current-design.md Part F"
                };
                variants.push(current);
            } else if (!/^Category: |^Resources$|^Partners$|^Suppliers$|^Activities$/.test(title)) {
                // A heading of another kind (Behind the scenes, Task 1 ...) ends the variant's tables.
                if (!/^Behind the scenes/.test(title)) current = null;
            }
            continue;
        }
        if (!current) continue;
        const row = /^\| (\d+) \| (.+) \|$/.exec(line);
        if (!row) continue;
        const cells = row[2].split(" | ");
        if (cells.length < 6) continue;
        const [field, label, action, fn, status, what, why] = cells;
        const fields = lines(field);
        const labels = lines(label);
        const actions = lines(action);
        const functions = lines(fn);
        const statuses = lines(status).flatMap(item => item.split(" / ").map(part => part.trim()));
        fields.forEach((name, index) => {
            const function_ = functions[index] ?? functions[functions.length - 1] ?? "";
            rows.push({
                variant: current.id,
                row: Number(row[1]),
                position: index + 1,
                field: name,
                label: labels[index] ?? "",
                action: actions[index] ?? "",
                function: function_,
                status: statuses[index] ?? "",
                control: controlOf(function_, name),
                what: (what ?? "").replace(/<br\s*\/?>/gi, " ").replace(/\*\*/g, "").slice(0, 240),
                why: (why ?? "").replace(/<br\s*\/?>/gi, " ").slice(0, 160)
            });
        });
    }
    return { variants, rows };
}

/** The asset contracts of src/library. */
export async function loadAssets() {
    const { assets } = await import("../../src/library/index.ts");
    return assets.map(asset => ({
        name: asset.name,
        kind: asset.kind,
        summary: asset.summary,
        component: asset.component,
        stylesheet: asset.stylesheet,
        variants: asset.variants.map(variant => variant.id).join(", "),
        states: asset.states.join(", "),
        tokens: asset.tokens.join(", "),
        has_sizes: Boolean(asset.sizes),
        has_anatomy: Boolean(asset.anatomy),
        known_findings: Object.keys(asset.knownFindings ?? {}).join(", "),
        geometry: asset.geometry
    }));
}

/** A scan file's records as observation rows. */
export function observationsFrom(file, label) {
    const scan = JSON.parse(readFileSync(file, "utf8"));
    const name = label ?? [scan.example, scan.width, scan.theme].join("-");
    return scan.records.map((record, index) => {
        const { system, page, path, kind, type, cls, w, h, font, weight, radius, padL, padT, padB, border, fill, shadow, ...rest } = record;
        return {
            scan: name, id: name + "#" + index, system, page, path: path ?? "", kind, type, cls: cls ?? "",
            w: w ?? null, h: h ?? null, font: font ?? null, weight: weight ?? null, radius: radius ?? null,
            padL: padL ?? null, padT: padT ?? null, padB: padB ?? null, border: border ?? null,
            fill: fill === undefined ? null : fill ? 1 : 0, shadow: shadow ?? null,
            data: Object.keys(rest).length ? JSON.stringify(rest) : null
        };
    });
}
