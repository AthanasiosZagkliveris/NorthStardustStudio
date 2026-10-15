/**
 * Builds the catalogue in memory (node:sqlite) from its sources and returns the
 * database. Nothing is stored between runs: the sources are the record.
 */
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { ASSET_OF, parseVariants, loadAssets, observationsFrom } from "./load.mjs";

const SCHEMA = `
create table variants (id text primary key, title text, place text, section text, category text, grp text, line integer, source text);
create table variant_rows (variant text, row integer, position integer, field text, label text, action text, function text, status text, control text, what text, why text);
create table assets (name text primary key, kind text, summary text, component text, stylesheet text, variants text, states text, tokens text, has_sizes integer, has_anatomy integer, known_findings text);
create table asset_map (thing text primary key, asset text);
create table observations (scan text, id text, system text, page text, path text, kind text, type text, cls text, w real, h real, font real, weight text, radius text, padL real, padT real, padB real, border real, fill integer, shadow text, data text);
create table probe_cards (probe text, system text, page text, path text, plus text, choice text, opened text, width integer, height integer, nfields integer, fields text, tiles_before integer, tiles_after integer);
create table shell_controls (stage text, name text, tag text, cls text, role text, w real, h real, font real, weight text, radius text, border real, cursor text, hover text, focus text);
create table shell_opens (stage text, control text, cls text, role text, box text, text text, navigated text);
create table reactions (where_ text, theme text, kind text, found integer, hover text, focus text, transition text, note text);
create table strategy_boxes (view text, type text, box text, depth integer, w real, h real, radius text, padL real, border real, nfields integer, fields text);
create index obs_type on observations (kind, type);
create index vr_control on variant_rows (control);
`;

export async function build(root = ".") {
    const db = new DatabaseSync(":memory:");
    db.exec(SCHEMA);
    const { variants, rows } = parseVariants(readFileSync(root + "/docs/design/01-current-design.md", "utf8"));
    const insert = (table, record) => {
        const keys = Object.keys(record);
        db.prepare("insert into " + table + " (" + keys.join(",") + ") values (" + keys.map(() => "?").join(",") + ")")
            .run(...keys.map(key => record[key]));
    };
    db.exec("begin");
    for (const variant of variants) insert("variants", { id: variant.id, title: variant.title, place: variant.place, section: variant.section, category: variant.category, grp: variant.group, line: variant.line, source: variant.source });
    for (const row of rows) insert("variant_rows", row);
    for (const asset of await loadAssets()) {
        const { geometry, has_sizes, has_anatomy, ...rest } = asset;
        insert("assets", { ...rest, has_sizes: has_sizes ? 1 : 0, has_anatomy: has_anatomy ? 1 : 0 });
    }
    for (const [thing, asset] of Object.entries(ASSET_OF)) insert("asset_map", { thing, asset });
    const scans = readdirSync(root + "/catalogue/scans").filter(name => name.endsWith(".json"));
    for (const name of scans) {
        for (const record of observationsFrom(root + "/catalogue/scans/" + name, name.replace(/\.json$/, ""))) insert("observations", record);
    }
    // The probes: cards found by pressing a "+" (add probe, dialog plus probe) and the shell around the systems.
    const probeDir = root + "/catalogue/probes";
    for (const name of readdirSync(probeDir).filter(file => file.endsWith(".json"))) {
        const data = JSON.parse(readFileSync(probeDir + "/" + name, "utf8"));
        const probe = name.split("-quillfield")[0];
        for (const r of data.records) {
            if (probe === "strategy-walk") {
                insert("strategy_boxes", { view: r.view, type: r.type ?? r.kind, box: r.kind === "content tile" ? r.view : r.kind, depth: r.depth ?? 0, w: r.w ?? null, h: r.h ?? null, radius: r.radius ?? null, padL: r.padL ?? null, border: r.border ?? null, nfields: (r.fields ?? []).length, fields: (r.fields ?? []).join(" > ") });
            } else if (probe === "reactions") {
                insert("reactions", { where_: r.where, theme: r.theme, kind: r.kind, found: r.found ? 1 : 0, hover: r.hover ?? null, focus: r.focus ?? null, transition: r.transition ?? null, note: r.note ?? null });
            } else if (probe === "shell-probe") {
                if (r.kind === "control") insert("shell_controls", { stage: r.stage, name: r.name, tag: r.tag, cls: r.cls, role: r.role, w: r.w, h: r.h, font: r.font, weight: r.weight, radius: r.radius, border: r.border, cursor: r.cursor, hover: r.hover?.light ?? "", focus: r.focus?.light ?? "" });
                else insert("shell_opens", { stage: r.stage, control: r.control, cls: r.cls, role: r.role, box: r.box, text: r.text, navigated: r.navigated });
            } else if (r.choice === "master tile" || r.choice?.endsWith("options")) continue;
            else insert("probe_cards", {
                probe, system: r.system, page: r.page, path: r.path ?? "", plus: r.plus, choice: r.choice ?? "(new)", opened: r.opened ?? (r.card ? "floating card" : "none"),
                width: r.card?.width ?? null, height: r.card?.height ?? null, nfields: r.card?.fields.length ?? null, fields: r.card ? r.card.fields.join(" > ") : null,
                tiles_before: r.tilesBefore ?? null, tiles_after: r.tilesAfter ?? null
            });
        }
    }
    db.exec("commit");
    return db;
}
