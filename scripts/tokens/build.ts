/**
 * The colour generator's logic: pure functions from the typed token
 * source (src/styles/tokens/tokens.ts) to the text of the generated
 * files. No file access here, so the test can run it; the script
 * generate.mjs reads and writes the files.
 */
import {
    MODES, cardTint, hues, mixedGrounds, modeSources, pairs, seeds, tintPairs,
    type Mode, type Pair, type TintPair
} from "../../src/styles/tokens/tokens.ts";

/* ---------- Values per reading mode ---------- */

/**
 * Every token of a mode, as the page draws it: the light value,
 * overridden by the mode's own. (Dark and sepia declare only what
 * differs; light declares all.) Auto is not a mode of its own: it is
 * dark or light, as the system says, by ThemeService.
 */
export function resolveMode(mode: Mode): Map<string, string> {
    const values = new Map<string, string>();
    const apply = (from: Mode) => {
        for (const group of [...modeSources[from].groups, ...(modeSources[from].rootGroups ?? [])]) {
            for (const [name, value] of group.tokens) values.set(name, value);
        }
        for (const role of Object.keys(cardTint)) {
            const own = cardTint[role][from];
            if (own) values.set(role, own[0] + "% " + own[1] + "%");
        }
    };
    apply("light");
    if (mode !== "light") apply(mode);
    return values;
}

/* ---------- Colour maths ---------- */

export interface Rgba { r: number; g: number; b: number; a: number }

/** hsl as CSS reads it: hue in degrees, saturation and lightness in percent. */
export function hsl(hue: number, saturation: number, lightness: number): Rgba {
    const s = saturation / 100;
    const l = lightness / 100;
    const k = (n: number) => (n + hue / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const [r, g, b] = [0, 8, 4].map(n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)));
    return { r, g, b, a: 1 };
}

/** A colour as the tokens write it: hex, rgb()/rgba(), or hsl(h s% l%). Null if it is none of those. */
export function parseColour(text: string): Rgba | null {
    const value = text.trim().toLowerCase();
    let match = /^#([0-9a-f]{3,8})$/.exec(value);
    if (match) {
        let hex = match[1];
        if (hex.length === 3 || hex.length === 4) hex = hex.split("").map(c => c + c).join("");
        if (hex.length !== 6 && hex.length !== 8) return null;
        const channel = (at: number) => parseInt(hex.slice(at, at + 2), 16) / 255;
        return { r: channel(0), g: channel(2), b: channel(4), a: hex.length === 8 ? channel(6) : 1 };
    }
    match = /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*(?:[,/]\s*([\d.]+)\s*)?\)$/.exec(value);
    if (match) {
        return { r: Number(match[1]) / 255, g: Number(match[2]) / 255, b: Number(match[3]) / 255, a: match[4] === undefined ? 1 : Number(match[4]) };
    }
    match = /^hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)$/.exec(value);
    if (match) return hsl(Number(match[1]), Number(match[2]), Number(match[3]));
    return null;
}

/** `top` laid over the opaque `base`. */
function over(top: Rgba, base: Rgba): Rgba {
    return {
        r: top.r * top.a + base.r * (1 - top.a),
        g: top.g * top.a + base.g * (1 - top.a),
        b: top.b * top.a + base.b * (1 - top.a),
        a: 1
    };
}

function luminance(colour: Rgba): number {
    const [r, g, b] = [colour.r, colour.g, colour.b].map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio of two opaque colours. */
export function contrast(one: Rgba, other: Rgba): number {
    const [high, low] = [luminance(one), luminance(other)].sort((x, y) => y - x);
    return (high + 0.05) / (low + 0.05);
}

const toHex = (colour: Rgba) => "#" + [colour.r, colour.g, colour.b].map(c => Math.round(Math.min(1, Math.max(0, c)) * 255).toString(16).padStart(2, "0")).join("");

/* ---------- The pair table, measured ---------- */

export interface Measured {
    id: string;
    mode: Mode;
    kind: Pair["kind"];
    min: number;
    ratio: number;
    pass: boolean;
    why: string;
    detail: string;
}

function colourOf(values: Map<string, string>, name: string, mode: Mode): Rgba {
    const text = values.get(name);
    if (text === undefined) throw new Error("a pair names a token that mode " + mode + " does not have: " + name);
    const colour = parseColour(text);
    if (!colour) throw new Error("token " + name + " is not a plain colour: " + text);
    return colour;
}

export function measurePair(pair: Pair, mode: Mode): Measured {
    const values = resolveMode(mode);
    const ground = over(colourOf(values, pair.ground, mode), colourOf(values, pair.under ?? seeds[mode].paper, mode));
    const ink = over(colourOf(values, pair.ink, mode), ground);
    const ratio = contrast(ink, ground);
    return {
        id: pair.id, mode, kind: pair.kind, min: pair.min, ratio, pass: ratio >= pair.min, why: pair.why,
        detail: pair.ink + " on " + pair.ground
    };
}

/** The colour of a card-tint role for a hue: mixed toward the paper when the stylesheets mix that role. */
function tintColour(role: string, hue: number, mode: Mode, values: Map<string, string>): Rgba {
    const own = cardTint[role]?.[mode] ?? cardTint[role]?.light;
    if (!own) throw new Error("no card tint role " + role);
    const plain = hsl(hue, own[0], own[1]);
    if (!mixedGrounds.includes(role)) return plain;
    const weight = Number(String(values.get("theme-ground-weight")).replace("%", "")) / 100;
    const paper = colourOf(values, "theme-ground-paper", mode);
    return { r: plain.r * weight + paper.r * (1 - weight), g: plain.g * weight + paper.g * (1 - weight), b: plain.b * weight + paper.b * (1 - weight), a: 1 };
}

export function measureTintPair(pair: TintPair, mode: Mode): Measured[] {
    const values = resolveMode(mode);
    return hues.map(({ name, hue }) => {
        const ratio = contrast(tintColour(pair.ink, hue, mode, values), tintColour(pair.ground, hue, mode, values));
        return {
            id: pair.id + " / " + name, mode, kind: pair.kind, min: pair.min, ratio, pass: ratio >= pair.min, why: pair.why,
            detail: pair.ink + " on " + pair.ground
        };
    });
}

export function measureAll(): Measured[] {
    const all: Measured[] = [];
    for (const mode of MODES) {
        for (const pair of pairs) all.push(measurePair(pair, mode));
        for (const pair of tintPairs) all.push(...measureTintPair(pair, mode));
    }
    return all;
}

/* ---------- The files ---------- */

const barTop = "/* ==========================================================";
const barEnd = "========================================================== */";

function comment(text: string, indent: string): string {
    const lines = text.split("\n");
    return indent + "/* " + lines.join("\n" + indent + "   ") + " */";
}

/** colors.generated.css: the token blocks of every reading mode. */
export function generateCss(): string {
    const out: string[] = [];
    out.push("/* Generated by scripts/tokens/generate.mjs from src/styles/tokens/tokens.ts.");
    out.push("   Do not edit this file: change tokens.ts and run `npm run tokens`.");
    out.push("   The rules that are not tokens (the documents' paper, the icons' filter,");
    out.push("   the titles' ink) stay in colors.css. */");
    out.push("");
    for (const mode of MODES) {
        const source = modeSources[mode];
        const [title, ...rest] = source.note.split("\n");
        out.push(barTop);
        out.push("   " + title);
        if (rest.length) {
            out.push("");
            out.push(...rest.map(line => "   " + line));
        }
        out.push(barEnd);
        out.push(source.selector + " {");
        out.push("");
        for (const [name, value] of source.properties) out.push("    " + name + ": " + value + ";", "");
        for (const group of source.groups) {
            if (group.note) out.push(comment(group.note, "    "));
            for (const [name, value] of group.tokens) out.push("    --" + name + ": " + value + ";");
            out.push("");
        }
        const roles = Object.keys(cardTint).filter(role => cardTint[role][mode]);
        if (roles.length) {
            out.push(comment("The System colour families, as \"saturation lightness\" for hsl(var(--strategy-theme-hue) ...): the hue comes from the card or Theme they are used in.", "    "));
            for (const role of roles) out.push("    --" + role + ": " + cardTint[role][mode]![0] + "% " + cardTint[role][mode]![1] + "%;");
            out.push("");
        }
        out.push("}");
        out.push("");
        for (const group of source.rootGroups ?? []) {
            out.push(":root {");
            out.push("");
            if (group.note) out.push(comment(group.note, "    "));
            for (const [name, value] of group.tokens) out.push("    --" + name + ": " + value + ";");
            out.push("");
            out.push("}");
            out.push("");
        }
    }
    return out.join("\n");
}

function dtcgColour(colour: Rgba) {
    const round = (n: number) => Math.round(n * 1e6) / 1e6;
    const value: Record<string, unknown> = { colorSpace: "srgb", components: [round(colour.r), round(colour.g), round(colour.b)] };
    if (colour.a !== 1) value.alpha = round(colour.a);
    value.hex = toHex(colour);
    return value;
}

/**
 * tokens.dtcg.json: the colours of every mode as Design Tokens
 * Community Group tokens (format 2025.10), each mode fully resolved.
 * Only plain colours are exported as tokens; the card tint is exported
 * as the colour each palette hue gives (ground mixed toward the paper
 * as drawn). What is not a colour (weights, the tooltip shadow, the
 * chevron image, the saturation/lightness pairs) stays CSS-only and is
 * listed by name under $extensions.
 */
export function generateDtcg(): string {
    const root: Record<string, unknown> = {
        $description: "NorthStardust colour tokens. Generated from src/styles/tokens/tokens.ts by scripts/tokens/generate.mjs; do not edit. Auto is dark or light as the system says, so it has no group of its own."
    };
    const cssOnly: Record<string, string[]> = {};
    for (const mode of MODES) {
        const values = resolveMode(mode);
        const group: Record<string, unknown> = { $type: "color" };
        cssOnly[mode] = [];
        for (const [name, value] of [...values].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
            if (cardTint[name]) continue;
            const colour = parseColour(value);
            if (!colour) { cssOnly[mode].push(name); continue; }
            const cut = name.indexOf("-");
            const family = name.slice(0, cut);
            const leaf = name.slice(cut + 1);
            const holder = (group[family] ??= {}) as Record<string, unknown>;
            holder[leaf] = { $value: dtcgColour(colour) };
        }
        const tint: Record<string, unknown> = {};
        for (const { name, hue } of hues) {
            const byHue: Record<string, unknown> = {};
            for (const role of Object.keys(cardTint)) {
                byHue[role.replace(/^theme-/, "")] = { $value: dtcgColour(tintColour(role, hue, mode, values)) };
            }
            tint[name] = byHue;
        }
        group["card-tint"] = tint;
        root[mode] = group;
    }
    root.$extensions = { "com.northstardust": { cssOnly, seeds } };
    return JSON.stringify(root, null, 2) + "\n";
}

/** contrast-report.md: every pair in every mode. */
export function generateReport(measured: Measured[] = measureAll()): string {
    const out: string[] = [];
    out.push("# Colour contrast report", "");
    out.push("Generated by scripts/tokens/generate.mjs from src/styles/tokens/tokens.ts. Do not edit.", "");
    out.push("Every pair of colours that meet, in every reading mode (auto is dark or light). Text pairs must hold 4.5:1, marks and borders 3:1 (WCAG 2.2, 1.4.3 and 1.4.11). The card-tint pairs are measured for each of the seven palette hues; the worst hue is shown.", "");
    const failures = measured.filter(m => !m.pass);
    out.push(failures.length ? "**" + failures.length + " measurement(s) miss their ratio.**" : "**All " + measured.length + " measurements hold their ratio.**", "");
    for (const mode of MODES) {
        out.push("## " + mode, "");
        out.push("| Pair | Why | Kind | Needs | Ratio | |", "|---|---|---|---|---|---|");
        const rows = measured.filter(m => m.mode === mode);
        const seen = new Set<string>();
        for (const row of rows) {
            const base = row.id.split(" / ")[0];
            if (row.id.includes(" / ")) {
                if (seen.has(base)) continue;
                seen.add(base);
                const group = rows.filter(r => r.id.startsWith(base + " / "));
                const worst = group.reduce((a, b) => (a.ratio <= b.ratio ? a : b));
                out.push("| " + base + " (worst of " + group.length + " hues: " + worst.id.split(" / ")[1] + ") | " + worst.why + " | " + worst.kind + " | " + worst.min + " | " + worst.ratio.toFixed(2) + " | " + (group.every(r => r.pass) ? "ok" : "**MISS**") + " |");
            } else {
                out.push("| " + row.id + " | " + row.why + " | " + row.kind + " | " + row.min + " | " + row.ratio.toFixed(2) + " | " + (row.pass ? "ok" : "**MISS**") + " |");
            }
        }
        out.push("");
    }
    return out.join("\n");
}
