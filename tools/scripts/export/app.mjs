/**
 * THE EXPORT OF THE APP: copies the files the app itself is made of, and nothing else, into a clean folder (exports/app by default), then proves with a build that nothing is missing.
 *
 *   npm run export:app                 export and build with this project's node_modules (fast)
 *   npm run export:app -- --clean      export, then npm install + build in the folder alone (slow; proves the dependency list too)
 *   npm run export:app -- --no-verify  export only
 *   npm run export:app -- --out exports/app-2
 *
 * The app = src/ without the tests, the test helpers, the document tests and the component library (except the library files the app itself imports), the pages that App.tsx
 * loads only in development and their routes (between its "dev-only:start" and "dev-only:end" markers), src-tauri/, public/, index.html, and the settings the build reads.
 * docs/, tools/scripts/, tools/catalogue/ and .github/ are working files and stay out. See docs/design/26-folder-plan.md.
 */
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, rmSync, rmdirSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../../../", import.meta.url)));
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const outArg = args.includes("--out") ? args[args.indexOf("--out") + 1] : "exports/app";
const OUT = resolve(ROOT, outArg);
if (!OUT.startsWith(join(ROOT, "exports") + sep)) {
    console.error("The output folder must be inside exports/ (it is emptied first): " + OUT);
    process.exit(2);
}

const git = (command) => execSync("git " + command, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 }).split("\n").map((line) => line.trim()).filter(Boolean);
const all = git("ls-files -co --exclude-standard").map((file) => file.split("\\").join("/"));

/** What is not part of the app inside src/. */
const isTest = (file) => /\.test\.(ts|tsx)$/.test(file);
const outsideApp = (file) => isTest(file) || file.startsWith("src/test/") || file.startsWith("src/docs/") || file.startsWith("src/library/");
const KEEP_OUTSIDE_SRC = ["index.html", "tsconfig.json", "tsconfig.node.json", "vite.config.ts", "package.json", "package-lock.json"];
const inApp = (file) => (file.startsWith("src/") && !outsideApp(file)) || file.startsWith("src-tauri/") || file.startsWith("public/") || KEEP_OUTSIDE_SRC.includes(file);

const included = new Set(all.filter(inApp));
const pool = new Set(all);

/** The development-only parts of App.tsx: what lies between the markers (a line comment above the declarations, a JSX comment among the routes). */
const START = /(\/\/ dev-only:start[^\n]*\n|[ \t]*\{\/\* dev-only:start \*\/\}[^\n]*\n)/;
const END = /(\/\/ dev-only:end[^\n]*\n|[ \t]*\{\/\* dev-only:end \*\/\}[^\n]*\n)/;
function devOnlyBlocks(text) {
    const blocks = [];
    let rest = text;
    for (;;) {
        const start = START.exec(rest);
        if (!start) break;
        const after = rest.slice(start.index + start[0].length);
        const end = END.exec(after);
        if (!end) throw new Error("App.tsx: a dev-only:start without its dev-only:end");
        blocks.push(after.slice(0, end.index));
        rest = after.slice(end.index + end[0].length);
    }
    return { blocks, without: (() => { let out = ""; let r = text; for (;;) { const s = START.exec(r); if (!s) return out + r; const a = r.slice(s.index + s[0].length); const e = END.exec(a); out += r.slice(0, s.index); r = a.slice(e.index + e[0].length); } })() };
}
const appText = readFileSync(join(ROOT, "src/App.tsx"), "utf8").split("\r\n").join("\n");
const dev = devOnlyBlocks(appText);
if (/dev-only/.test(dev.without)) throw new Error("App.tsx: unbalanced dev-only markers");
const devPages = [...dev.blocks.join("\n").matchAll(/import\(\s*["'](\.\/[^"']+)["']\s*\)/g)]
    .map((match) => ["", ".tsx", ".ts"].map((extension) => "src/" + match[1].slice(2) + extension).find((candidate) => pool.has(candidate)))
    .filter(Boolean);
devPages.forEach((page) => included.delete(page));

/** The files an app file imports (relative specifiers only), resolved to a tracked file. */
const EXTENSIONS = ["", ".ts", ".tsx", ".js", ".mjs", ".css", ".json", "/index.ts", "/index.tsx"];
function importsOf(file) {
    if (!/\.(ts|tsx)$/.test(file)) return [];
    const text = file === "src/App.tsx" ? dev.without : readFileSync(join(ROOT, file), "utf8");
    const found = [];
    for (const match of text.matchAll(/(?:from|import)\s*\(?\s*["'](\.{1,2}\/[^"']+)["']/g)) {
        const target = join(dirname(file), match[1]).split("\\").join("/");
        const hit = EXTENSIONS.map((extension) => target + extension).find((candidate) => pool.has(candidate));
        found.push({ spec: match[1], hit });
    }
    return found;
}

const pulledIn = [];
const problems = [];
const queue = [...included].filter((file) => /\.(ts|tsx)$/.test(file));
const seen = new Set(queue);
while (queue.length) {
    const file = queue.pop();
    for (const { spec, hit } of importsOf(file)) {
        if (!hit) continue; // an import of something that is not a tracked file (the build will tell)
        if (included.has(hit)) continue;
        if (hit.startsWith("src/library/") && !isTest(hit)) {
            included.add(hit); pulledIn.push(hit);
            if (!seen.has(hit)) { seen.add(hit); queue.push(hit); }
        } else if (devPages.includes(hit) || outsideApp(hit) || !inApp(hit)) {
            problems.push(file + " imports " + spec + " (" + hit + "), which is not an app file");
        }
    }
}
if (problems.length) {
    console.error("The app imports files that are not in the app:\n  " + problems.join("\n  "));
    process.exit(1);
}

/** App.tsx without its development-only parts; package.json without the scripts and the test libraries only the working files use. */
function transformed(file) {
    const text = readFileSync(join(ROOT, file), "utf8");
    if (file === "src/App.tsx") {
        return dev.without.split("\n").join(text.includes("\r\n") ? "\r\n" : "\n");
    }
    if (file === "package.json") {
        const pkg = JSON.parse(text);
        const keep = ["dev", "build", "preview", "tauri"];
        pkg.scripts = Object.fromEntries(keep.filter((name) => pkg.scripts[name]).map((name) => [name, pkg.scripts[name]]));
        for (const name of Object.keys(pkg.devDependencies ?? {})) {
            if (/^(vitest|jsdom|playwright|@testing-library\/)/.test(name)) delete pkg.devDependencies[name];
        }
        return JSON.stringify(pkg, null, 2) + "\n";
    }
    return null;
}

/* ---- write ---- */
if (existsSync(OUT)) {
    const link = join(OUT, "node_modules");
    if (existsSync(link) && lstatSync(link).isSymbolicLink()) rmdirSync(link); // only the link, never what it points at
    rmSync(OUT, { recursive: true, force: true });
}
mkdirSync(OUT, { recursive: true });
let count = 0;
for (const file of [...included].sort()) {
    const target = join(OUT, file);
    mkdirSync(dirname(target), { recursive: true });
    const text = transformed(file);
    if (text !== null) writeFileSync(target, text); else copyFileSync(join(ROOT, file), target);
    count += 1;
}
writeFileSync(join(OUT, "README.md"), "# NorthStardustStudio (the app only)\n\nWritten by `npm run export:app` from the working repository: the app's own files, no tests, no documents, no tools. `npm install`, then `npm run dev` or `npm run build`.\n");
if (devPages.length) console.log("Left out as development-only pages: " + devPages.join(", "));
console.log("Exported " + count + " files to " + relative(ROOT, OUT) + " (" + pulledIn.length + " library files the app imports came with it" + (pulledIn.length ? ": " + pulledIn.map((file) => file.replace("src/library/", "")).join(", ") : "") + ").");

/* ---- prove it ---- */
if (flag("--no-verify")) process.exit(0);
const run = (command) => execSync(command, { cwd: OUT, stdio: "inherit" });
try {
    if (flag("--clean")) {
        run("npm install --package-lock-only --ignore-scripts");
        run("npm ci --ignore-scripts");
    } else {
        symlinkSync(join(ROOT, "node_modules"), join(OUT, "node_modules"), "junction");
    }
    run("npm run build");
    console.log("The exported app builds on its own.");
} catch {
    console.error("The exported app does not build: something it needs was left out. See above.");
    process.exitCode = 1;
} finally {
    const link = join(OUT, "node_modules");
    if (existsSync(link) && lstatSync(link).isSymbolicLink()) rmdirSync(link);
}
