/**
 * THE BOUNDARIES (docs/design/current/25-folder-plan.md, "The layout to come", step 1): the parts meant to be shared by every page,
 * and later by other apps, import nothing from the pages or the editors, so each can move into a package of its own unchanged.
 *
 *   node tools/scripts/lint/boundaries.mjs            list every import that crosses a boundary; fail when there is one
 *
 * Shared (may import only each other, never a page or an editor): src/components/controls, src/hooks, src/styles/tokens,
 * src/framework, src/services, src/data, src/types. App (may import anything): src/pages, src/components (the rest), src/App.tsx, src/main.tsx.
 * Tests are not checked.
 *
 * KNOWN (the six crossings found when the check was written, 2026-11-11): listed below and allowed, each to be removed when its file
 * moves into the shared part in step 2; any other crossing fails.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, normalize, relative, sep } from "node:path";

const ROOT = process.cwd();
const SHARED = ["src/components/controls", "src/hooks", "src/styles/tokens", "src/framework", "src/services", "src/data", "src/types"];
const APP = ["src/pages", "src/components/interview", "src/components/notepad", "src/components/references"];
// (The top-level files of src/components are app parts too: the header, the footer, the lists.)
const isAppFile = path => APP.some(dir => path === dir || path.startsWith(dir + "/")) ||
    (path.startsWith("src/components/") && path.split("/").length === 3);

const walk = dir => readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
});
const posix = path => relative(ROOT, path).split(sep).join("/");

const KNOWN = new Set([
    "src/components/controls/FoldHead.tsx  ->  src/components/interview/fields/FoldArrow.tsx",
    "src/components/controls/PopupPanel.tsx  ->  src/components/interview/fields/consumeKey.ts",
    "src/framework/engine/ReviewItems.ts  ->  src/components/interview/rails/railItems.ts",
    "src/services/ProgressService.ts  ->  src/components/interview/rails/railItems",
    "src/services/SearchService.ts  ->  src/components/interview/rails/railItems",
    "src/services/SearchService.ts  ->  src/components/notepad/notepadPlaces"
]);

const crossings = [];
const known = [];
for (const dir of SHARED) {
    for (const file of walk(join(ROOT, dir)).filter(path => /\.(ts|tsx)$/.test(path) && !/\.test\.tsx?$/.test(path))) {
        const text = readFileSync(file, "utf8");
        for (const match of text.matchAll(/^\s*(?:import|export)\s[^;]*?from\s+["'](\.[^"']+)["']/gm)) {
            const target = posix(normalize(join(dirname(file), match[1])));
            if (isAppFile(target)) {
                const line = posix(file) + "  ->  " + target;
                (KNOWN.has(line) ? known : crossings).push(line);
            }
        }
    }
}

if (crossings.length) {
    console.error("A shared part imports a page or an editor (" + crossings.length + "):\n  " + crossings.join("\n  "));
    process.exit(1);
}
console.log("The shared parts import no page and no editor" + (known.length ? " (beyond the " + known.length + " known crossings, to go in step 2)." : "."));
const gone = [...KNOWN].filter(line => !known.includes(line));
if (gone.length) {
    console.log("Known crossings no longer found (remove them from KNOWN): " + gone.join("; "));
}
