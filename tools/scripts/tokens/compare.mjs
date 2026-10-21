/**
 * The proof that the generated colours equal the hand-written ones.
 *
 *   node tools/scripts/tokens/compare.mjs <old colors.css> <new css> [<new css> ...]
 *
 * It reads every declaration of the old file and of the new files
 * (taken together), and checks:
 *   1. the same declarations, scope by scope: for every selector,
 *      the same property names with the same values (white space
 *      folded to one space, nothing else normalised);
 *   2. the resolved value of every token in every reading mode
 *      (light = the light scope; dark and sepia = their scope over the
 *      light one), name by name.
 * It prints the counts and exits 1 on any difference.
 *
 * Declaration order inside a scope and comments are not compared: the
 * generated file groups the declarations its own way. A property that
 * is declared twice in one scope would be a difference in value (the
 * last wins), so it is reported rather than folded away.
 */
import { readFileSync } from "node:fs";
import { declarations } from "./css-parse.mjs";

const [oldPath, ...newPaths] = process.argv.slice(2);
if (!oldPath || !newPaths.length) {
    console.error("usage: node tools/scripts/tokens/compare.mjs <old colors.css> <new css> [<new css> ...]");
    process.exit(2);
}

const oldList = declarations(readFileSync(oldPath, "utf8"));
const newList = newPaths.flatMap(path => declarations(readFileSync(path, "utf8")));

/** selector -> property -> value (last wins), and a note for each property declared twice with different values. */
function scopes(list, label) {
    const map = new Map();
    const problems = [];
    for (const { selector, name, value } of list) {
        if (!map.has(selector)) map.set(selector, new Map());
        const scope = map.get(selector);
        if (scope.has(name) && scope.get(name) !== value) problems.push(label + ": " + selector + " declares " + name + " twice with different values");
        scope.set(name, value);
    }
    return { map, problems };
}

const before = scopes(oldList, "old");
const after = scopes(newList, "new");
const differences = [...before.problems, ...after.problems];

/* The scopes are named by their selectors, which may have moved from one rule to another (the title ink sat in three
   small rules and now sits in the mode blocks), so the proof merges every rule of one selector first. */
const selectors = new Set([...before.map.keys(), ...after.map.keys()]);
let declarationsChecked = 0;
for (const selector of selectors) {
    const was = before.map.get(selector) ?? new Map();
    const now = after.map.get(selector) ?? new Map();
    for (const name of new Set([...was.keys(), ...now.keys()])) {
        declarationsChecked++;
        if (!was.has(name)) differences.push("new only: " + selector + " { " + name + ": " + now.get(name) + " }");
        else if (!now.has(name)) differences.push("old only: " + selector + " { " + name + ": " + was.get(name) + " }");
        else if (was.get(name) !== now.get(name)) differences.push("value differs: " + selector + " { " + name + ": " + was.get(name) + " -> " + now.get(name) + " }");
    }
}

/* Resolved per reading mode. */
const modeSelector = {
    light: ":root, .business-document, .business-canvas, .business-forecast-table-wrap",
    dark: ":root[data-theme=\"dark\"]",
    sepia: ":root[data-theme=\"sepia\"]"
};
function resolved(map, mode) {
    const result = new Map();
    for (const [name, value] of map.get(modeSelector.light) ?? []) if (name.startsWith("--")) result.set(name, value);
    // The light block is also declared on :root alone in the old file's title rules; those merged above under ":root".
    for (const [name, value] of map.get(":root") ?? []) if (name.startsWith("--")) result.set(name, value);
    if (mode !== "light") for (const [name, value] of map.get(modeSelector[mode]) ?? []) if (name.startsWith("--")) result.set(name, value);
    return result;
}
const summary = [];
let tokensChecked = 0;
for (const mode of Object.keys(modeSelector)) {
    const was = resolved(before.map, mode);
    const now = resolved(after.map, mode);
    for (const name of new Set([...was.keys(), ...now.keys()])) {
        tokensChecked++;
        if (was.get(name) !== now.get(name)) differences.push("resolved in " + mode + ": " + name + ": " + was.get(name) + " -> " + now.get(name));
    }
    summary.push(mode + ": " + was.size + " tokens old, " + now.size + " new");
}
const names = new Set([...oldList, ...newList].filter(d => d.name.startsWith("--")).map(d => d.name));

console.log("old declarations: " + oldList.length + ", new declarations: " + newList.length);
console.log("distinct custom properties: " + names.size);
console.log("scopes compared: " + selectors.size + ", declarations compared: " + declarationsChecked);
console.log("resolved per mode: " + summary.join("; ") + " (" + tokensChecked + " comparisons)");
if (differences.length) {
    console.error(differences.length + " DIFFERENCE(S):");
    for (const line of differences.slice(0, 100)) console.error("  " + line);
    process.exit(1);
}
console.log("IDENTICAL: every declaration and every resolved token value is the same.");
