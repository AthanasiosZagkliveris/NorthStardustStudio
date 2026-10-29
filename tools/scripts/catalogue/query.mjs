/**
 * Asks the catalogue.
 *
 *   node tools/scripts/catalogue/query.mjs summary
 *   node tools/scripts/catalogue/query.mjs variance [type]        distinct sizes per control type (or surface), counted
 *   node tools/scripts/catalogue/query.mjs needs "Premises"       the assets a variant (title contains the words) needs
 *   node tools/scripts/catalogue/query.mjs uses text box          the variants that use a kind of control
 *   node tools/scripts/catalogue/query.mjs gaps                   what has no asset, no measurement or no card
 *   node tools/scripts/catalogue/query.mjs sql "select ..."       any query
 *   add --md FILE to write the output as Markdown
 */
import { readFileSync, writeFileSync } from "node:fs";
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
} else if (command === "record") {
    // The whole record, printed: what is recorded, the cards by "+", the standard-sequence check, the control
    // looks, the shell, the inconsistencies found and the questions. Written to the file given by --md.
    out.push("# The catalogue record", "", "Generated by `npm run catalogue -- record --md FILE` from the sources: document 35, the card scan, the add probe, the dialog plus probe and the shell probe (Quillfield, 1920px, light for the cards; the three reading modes for the shell's reactions). Do not edit by hand.", "");
    show("What is recorded", all(`select 'card layouts (document 35)' as source, count(*) as n from variants union all select 'field rows (Part F)', count(*) from variant_rows
        union all select 'scan records (pages, tiles, dialogs, cards, controls, navigation)', count(*) from observations
        union all select 'cards opened by a "+" (add probe and dialog plus probe)', count(*) from probe_cards where choice = '(new)'
        union all select 'cards read after each dropdown choice', count(*) from probe_cards where choice <> '(new)'
        union all select 'shell controls (landing, system selection, header, calendar)', count(*) from shell_controls
        union all select 'shell things opened', count(*) from shell_opens`));
    show("Every \"+\": what it opens, the card's size and its fields", all(`select system, page, path, plus, opened, width, height, nfields as fields,
        (select count(distinct c.fields) from probe_cards c where c.plus = p.plus and c.page = p.page and c.choice <> '(new)') as field_sets_by_choice
        from probe_cards p where choice = '(new)' order by system, page, path, plus`));
    show("The standard field sequence against each card opened (head with name cell and x, Start and End date, Description last)", all(`select system, page, plus,
        case when fields like 'text area:% name > x:%' or fields like 'text area:%> x:%' then 'name cell + x' when fields like 'dropdown:%> x:%' then 'dropdown + x' else 'other head' end as head,
        case when fields like '%date cell:Start date%' then 'yes' else 'no' end as start_end_date,
        case when fields like '%Description%' then 'yes' else 'no' end as description,
        case when fields like '%Links%' or fields like '%Linked%' then 'yes' else 'no' end as links
        from probe_cards where choice = '(new)' and fields is not null order by head, system, page`));
    show("Control looks found by the scan (distinct looks per type; 1 = one look)", all(`select type, count(distinct h || '|' || font || '|' || radius || '|' || padL || '|' || border) as distinct_looks, count(*) as found from observations where kind = 'control' group by type order by distinct_looks desc`));
    show("Every card opened has this width (scan and probes)", all(`select width, count(*) as n from probe_cards where width is not null group by width`));
    show("Hover effects found by kind of control (one instance per kind, light mode; the shell's own are in the next table)", all(`select case when hover is null then '(not read)' when hover = '' then '(no change)' else substr(hover, 1, 170) end as hover_effect, count(*) as places, group_concat(distinct kind) as kinds, group_concat(distinct where_) as pages
        from reactions where theme = 'light' and found = 1 group by hover order by places desc`));
    show("Hover effects by reading mode (light, dark, sepia): the colours change, the effect kind stays", all(`select kind, theme, substr(hover, 1, 190) as hover_effect from reactions where found = 1 and hover is not null and hover <> '' and where_ like 'Business%' order by kind, theme`));
    show("Rails and page tags: every rail by place and width (light mode): size, items, what it holds in order", all(`select place, width, rail, cast(w as integer) || 'x' || cast(h as integer) as size, items, tab, dots as bullets_px, substr(holds, 1, 150) as holds_in_order from rails where theme = 'light' order by place, width, rail`));
    show("Rails and page tags: reaction of a plain item and of the lit item (hover and keyboard focus), by kind of rail and width class", all(`select rail, case when width >= 1700 then 'labels inline (>= 1700px)' else 'labels as tooltips (< 1700px)' end as width_class, theme, count(*) as rails, substr(max(hover_plain), 1, 130) as hover_plain_item, substr(max(hover_lit), 1, 130) as hover_lit_item from rails where hover_plain is not null and (hover_plain <> '' or hover_lit <> '') group by rail, width_class, theme order by rail, width_class, theme`));
    show("Interactions with cards: what each tick, dropdown choice and \"+\" did (fields added or removed, height change)", all(`select probe, card, count(*) as actions, min(h) as min_height, max(h) as max_height, count(distinct change) as distinct_changes from card_actions group by probe, card order by probe, card`));
    show("Interactions with cards: ticks and \"+\" in the Subchannel card", all(`select card, action, d_height as height_change, substr(change, 1, 200) as change from card_actions where probe = 'subchannel' and (action like 'tick%' or action like 'plus%') order by card, action`));
    show("What an incomplete card shows (the flashing cell and the line under it), and what the number box does", all(`select card, step, missing, lacks, flashing, value from missing_states order by card, rowid`));
    show("Notes, Search, Review, Global Settings, Inventory, Completed, Calendar: opened and used", all(`select tool, step, url, layers, substr(text, 1, 120) as shows, substr(controls, 1, 120) as controls from tool_steps order by rowid`));
    show("Kinds of control looked for and not found on the pages probed", all(`select distinct kind, where_ from reactions where theme = 'light' and found = 0 order by kind`));
    show("The strategy boxes (Theme, Goal, Objective, Initiatives, Metric) and the three content tiles", all(`select type, replace(box, char(10), ' ') as box, depth, count(*) as found, min(w) as width, min(radius) as corners, max(nfields) as fields from strategy_boxes group by type, box, depth`));
    show("The shell: controls, sizes and reactions", all(`select stage, name, tag, w, h, font, radius, border, cursor, hover, focus from shell_controls order by stage`));
    show("The shell: what each press opens", all(`select stage, control, role, cls, box, navigated, substr(text, 1, 80) as shows from shell_opens`));
    show("Inconsistency: a \"+\" that changes the page in place (no card, no dialog) or opens nothing", all(`select system, page, path, plus, opened, tiles_before, tiles_after from probe_cards where choice = '(new)' and opened in ('in place', 'none') order by system, page`));
    show("Inconsistency: cards whose head is not the name cell with the x", all(`select system, page, plus, substr(fields, 1, 90) as head from probe_cards where choice = '(new)' and fields is not null and not (fields like 'text area:% > x:%') order by system, page`));
    show("Inconsistency: card layouts of Part F that no probe or scan reached", all(`select v.title from variants v where not exists (select 1 from observations o where o.kind = 'placement' and o.path like '%' || v.grp || '%')
        and not exists (select 1 from probe_cards p where p.plus like '%' || v.grp || '%') order by v.title`));
    out.push(readFileSync("tools/catalogue/owner-answers.md", "utf8").split("\r").join(""), "", "### Not recorded yet", "",
        "- The Strategy SWOT cards and the nested Strategy cards (Objective, Metric, Initiative), the Roadmap; the Customer Engagement channel cards below the first level; Financial Foundation and Sustainability (all four pages will change, so they are recorded as they are today).",
        "- Hover and focus in the cards and tiles of the four systems are in the reactions table (one instance per kind, three reading modes), not per card.",
        "- Link looks and destinations are recorded as what they open, not as a link component.",
        "");
} else if (command === "sql") {
    show("Result", all(rest.join(" ")));
} else {
    console.error("unknown command: " + command);
    process.exit(1);
}

const text = out.join("\n") + "\n";
if (mdOut) writeFileSync(mdOut, text);
console.log(text);
