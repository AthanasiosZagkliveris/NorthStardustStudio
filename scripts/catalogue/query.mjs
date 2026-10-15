/**
 * Asks the catalogue.
 *
 *   node scripts/catalogue/query.mjs summary
 *   node scripts/catalogue/query.mjs variance [type]        distinct sizes per control type (or surface), counted
 *   node scripts/catalogue/query.mjs needs "Premises"       the assets a variant (title contains the words) needs
 *   node scripts/catalogue/query.mjs uses text box          the variants that use a kind of control
 *   node scripts/catalogue/query.mjs gaps                   what has no asset, no measurement or no card
 *   node scripts/catalogue/query.mjs sql "select ..."       any query
 *   add --md FILE to write the output as Markdown
 */
import { writeFileSync } from "node:fs";
import { build } from "./build.mjs";

const args = process.argv.slice(2).filter(item => !item.startsWith("--") && item !== process.argv[process.argv.indexOf("--md") + 1]);
const mdOut = process.argv.includes("--md") ? process.argv[process.argv.indexOf("--md") + 1] : null;
const [command = "summary", ...rest] = args;
const db = await build(".");
const out = [];

function show(title, rows) {
    out.push("### " + title, "");
    if (!rows.length) { out.push("(nothing)", ""); return; }
    const keys = Object.keys(rows[0]);
    out.push("| " + keys.join(" | ") + " |", "|" + keys.map(() => "---").join("|") + "|");
    for (const row of rows) out.push("| " + keys.map(key => String(row[key] ?? "").replace(/\|/g, "/")).join(" | ") + " |");
    out.push("");
}
const all = (sql, ...params) => db.prepare(sql).all(...params).map(row => ({ ...row }));

if (command === "summary") {
    show("Tables", all(`select 'variants' as t, count(*) as n from variants union all select 'variant_rows', count(*) from variant_rows
        union all select 'assets', count(*) from assets union all select 'observations', count(*) from observations`));
    show("Observations by kind and type", all("select kind, type, count(*) as n from observations group by kind, type order by kind, n desc"));
    show("Part F rows by control", all("select control, count(*) as n, count(distinct variant) as variants from variant_rows group by control order by n desc"));
} else if (command === "variance") {
    const type = rest[0];
    const rows = all(`select kind, type, h || ' high, ' || font || 'px, r ' || radius || ', pad ' || padL || ', border ' || border || case when fill = 1 then ', fills' else ', w ' || cast(round(w) as integer) end as signature,
        count(*) as n, min(cls) as example_class
        from observations where kind in ('control') ${type ? "and type = ?" : ""} group by kind, type, signature order by type, n desc`, ...(type ? [type] : []));
    show("Control sizes (distinct signatures per type)", rows);
    const types = all("select type, count(distinct h || '|' || font || '|' || radius || '|' || padL || '|' || border) as distinct_looks, count(*) as found from observations where kind = 'control' group by type order by distinct_looks desc");
    show("How many distinct looks per type (1 = one look)", types);
} else if (command === "needs") {
    const words = rest.join(" ");
    const list = all("select id, title from variants where title like ?", "%" + words + "%");
    show("Variants matched", list);
    show("Assets these variants need (rows by control, with the asset that covers it)", all(`select v.title, r.control, count(*) as rows, coalesce(m.asset, '(no asset yet)') as asset
        from variant_rows r join variants v on v.id = r.variant left join asset_map m on m.thing = r.control
        where v.title like ? group by v.title, r.control order by v.title, rows desc`, "%" + words + "%"));
} else if (command === "uses") {
    show("Variants using " + rest.join(" "), all(`select v.title, count(*) as rows from variant_rows r join variants v on v.id = r.variant where r.control = ? group by v.title order by rows desc`, rest.join(" ")));
} else if (command === "gaps") {
    show("Kinds of thing in the cards with no asset", all(`select r.control, count(*) as rows, count(distinct r.variant) as variants from variant_rows r left join asset_map m on m.thing = r.control
        where m.asset is null group by r.control order by rows desc`));
    show("Control types measured on the page with no asset", all(`select o.type, count(*) as found from observations o left join asset_map m on m.thing = o.type
        where o.kind in ('control', 'nav') and m.asset is null group by o.type order by found desc`));
    show("Part F control kinds never measured (no matching observed type)", all(`select r.control, count(*) as rows from variant_rows r
        where (case r.control when 'optional note' then 'text area' when 'link symbol' then 'link' else r.control end) not in (select type from observations) group by r.control order by rows desc`));
    show("Assets in the library without sizes table or anatomy", all("select name, has_sizes, has_anatomy from assets where has_sizes = 0 or has_anatomy = 0"));
    show("Variants of Part F that no scan reached (title words not in a scanned path)", all(`select v.title from variants v where not exists
        (select 1 from observations o where o.kind = 'placement' and o.path like '%' || v.grp || '%') order by v.title`));
} else if (command === "tour") {
    // In the order the scan opened them: every view and card, how it opened ("/" in the path: a link was pressed,
    // ">" a tile), what navigation shows in it, and whether its head holds a name cell.
    const system = rest.join(" ");
    show("Tour of " + (system || "all systems"), all(`select o.system, o.page, o.path,
        case when p.path is not null then 'card' else 'dialog view' end as opens,
        case when o.path like '%/%' then 'link' else 'tile' end as pressed,
        group_concat(distinct case when n.type in ('back') then 'Back' when n.type = 'carousel arrow' then 'arrows' when n.type = 'carousel rail' then 'carousel rail' end) as nav,
        case when exists (select 1 from observations c where c.system = o.system and c.page = o.page and c.path = o.path and c.cls like '%card-name-input%') then 'name cell'
             when exists (select 1 from observations c where c.system = o.system and c.page = o.page and c.path = o.path and c.cls like '%channel-resource-name%') then 'name box'
             when p.path is not null then 'no name cell' else '' end as head
        from (select system, page, path, min(rowid) as r from observations where path <> '' ${system ? "and system like ?" : ""} group by system, page, path) o
        left join (select distinct system, page, path from observations where kind = 'placement') p on p.system = o.system and p.page = o.page and p.path = o.path
        left join observations n on n.system = o.system and n.page = o.page and n.path = o.path and n.kind = 'nav'
        group by o.system, o.page, o.path order by o.r`, ...(system ? ["%" + system + "%"] : [])));
} else if (command === "sql") {
    show("Result", all(rest.join(" ")));
} else {
    console.error("unknown command: " + command);
    process.exit(1);
}

const text = out.join("\n") + "\n";
if (mdOut) writeFileSync(mdOut, text);
console.log(text);
