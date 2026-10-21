/**
 * Which fields and cards use each component and variant, as one part of the components document
 * (docs/design/14-components-list.md, written by scripts/library/components-list.mjs), from the requirements in the
 * library. This module only returns the lines; it writes no file.
 */
import { library } from "../../src/library/data/library.ts";

const needs = a => [...a.requires, ...a.variants.flatMap(v => v.requires ?? [])];
const users = (asset, variant) => library.assets.filter(a => needs(a).some(r => r.asset === asset && (variant === undefined || r.variant === variant)));
const names = list => [...new Set(list.map(a => a.name))].sort((x, y) => x.localeCompare(y));

/** The lines of the section "Which fields and cards use each component". */
export function usageSection() {
    const out = [];
    const say = (...lines) => out.push(...lines);
    say("## Which fields and cards use each component", "",
        "For each component and variant: the fields, cards and other assets that are built from it. A field uses a component when its requirements name it; the label of every field is the label component.", "");
    for (const a of library.assets.filter(x => x.category === "component")) {
        const all = users(a.code);
        say("### " + a.code + " " + a.name, "", all.length + " assets use it: " + [...new Set(all.map(u => u.category))].map(c => all.filter(u => u.category === c).length + " " + c + (all.filter(u => u.category === c).length === 1 ? "" : "s")).join(", ") + ".", "");
        const fields = all.filter(u => u.category === "field");
        if (fields.length) say("**Fields (" + fields.length + "):** " + names(fields).join("; ") + ".", "");
        const others = all.filter(u => u.category !== "field");
        if (others.length) say("**Other assets:** " + others.map(u => u.code + " " + u.name).join("; ") + ".", "");
        for (const v of a.variants) {
            const vu = users(a.code, v.code);
            if (!vu.length) { say("#### " + v.code + " " + v.name, "", "Used by no field or card yet.", ""); continue; }
            const vf = vu.filter(u => u.category === "field");
            say("#### " + v.code + " " + v.name, "", vu.length + " assets use it.", "");
            if (vf.length) say("**Fields (" + vf.length + "):** " + names(vf).join("; ") + ".", "");
            const vo = vu.filter(u => u.category !== "field");
            if (vo.length) say("**Other assets:** " + vo.map(u => u.code + " " + u.name).join("; ") + ".", "");
        }
    }
    return out;
}
