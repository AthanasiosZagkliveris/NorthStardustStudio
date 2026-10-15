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
    db.exec("commit");
    return db;
}
