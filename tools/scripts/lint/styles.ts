/**
 * The style lint (docs/archive/plans/2026-10-14-cleanup-and-library-plans.md, 5.13, layer E): the stylesheets draw with
 * tokens, not with literals. Pure functions from the text of the
 * stylesheets to a list of findings; no file access here, so the test can run
 * them (tools/scripts/lint/lint-styles.mjs reads and writes the files).
 *
 * Four rules:
 *   colour      no colour literal (#hex, rgb(), rgba(), hsl(), hsla(), white,
 *               black) outside the generated tokens; a colour built only from
 *               var() is fine
 *   corner      a corner (border-radius and the four corner properties) is a
 *               token, 0, 50% or 999px (a shape); another px value is a literal
 *   gap         a gap (gap, row-gap, column-gap) is a token, 0 or normal; a
 *               px, em or vw value is a literal
 *   breakpoint  a media or container query uses a boundary of the catalogue in
 *               tokens.ts (CSS cannot read a variable in a query, so the list is
 *               the token)
 *
 * The values the stylesheets already hold are recorded in a baseline
 * (styles-baseline.json): a finding fails the lint only beyond the baseline,
 * so no new literal can come in while the old ones wait for the owner's
 * decisions (docs/archive/plans/2026-10-14-cleanup-and-library-plans.md, 5.14). Comments are never read. Generated
 * files (*.generated.css) are not linted.
 */
import { containerBreakpoints, viewportBreakpoints } from "../../../src/styles/tokens/tokens.ts";

export type Rule = "colour" | "corner" | "gap" | "breakpoint";

export interface Finding {
    readonly rule: Rule;
    readonly file: string;
    readonly line: number;
    /** The literal as written: "#fff", "10px", "(max-width: 900px)". */
    readonly value: string;
}

/** The baseline: for each rule, file and value, how many of them are known. */
export type Baseline = Record<string, Record<string, Record<string, number>>>;

export interface StyleFile {
    readonly name: string;
    readonly text: string;
}

/** Blank out the comments, keeping every newline, so a position still gives its line. */
function withoutComments(text: string): string {
    return text.replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\n]/g, " "));
}

const lineOf = (text: string, at: number) => text.slice(0, at).split("\n").length;

/** The declarations of a stylesheet: property, value and the place of the value. */
function declarations(text: string): { property: string; value: string; at: number }[] {
    const found: { property: string; value: string; at: number }[] = [];
    for (const match of text.matchAll(/([a-zA-Z-]+)\s*:\s*([^;{}]+)(?=[;}])/g)) {
        found.push({ property: match[1], value: match[2], at: match.index + match[0].indexOf(match[2]) });
    }
    return found;
}

const COLOUR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\([^()]*(?:\([^()]*\)[^()]*)*\)|(?<![-\w])(?:white|black)(?![-\w])/g;
const CORNER_PROPERTY = /^border(?:-(?:top|bottom)-(?:left|right))?-radius$/;
const GAP_PROPERTY = /^(?:row-|column-)?gap$/;

/** Every piece of a value that is not inside a var() or a url(). */
function outsideFunctions(value: string): string {
    let out = "";
    let depth = 0;
    let skipping = false;
    for (let at = 0; at < value.length; at++) {
        const rest = value.slice(at);
        if (!skipping && /^(?:var|url)\(/.test(rest)) {
            skipping = true;
            depth = 0;
        }
        const char = value[at];
        if (skipping) {
            if (char === "(") depth++;
            if (char === ")") {
                depth--;
                if (depth === 0) skipping = false;
            }
            out += " ";
        } else {
            out += char;
        }
    }
    return out;
}

/** The allowed spellings of the queries, from the catalogue. */
function catalogue(): Set<string> {
    const allowed = new Set<string>();
    for (const boundary of [...viewportBreakpoints, ...containerBreakpoints]) {
        for (const query of Object.keys(boundary.queries)) allowed.add(query);
    }
    return allowed;
}

export function lintFile(file: StyleFile): Finding[] {
    const text = withoutComments(file.text);
    const findings: Finding[] = [];
    const add = (rule: Rule, at: number, value: string) => findings.push({ rule, file: file.name, line: lineOf(text, at), value });

    for (const { property, value, at } of declarations(text)) {
        // A colour literal anywhere in a value (a fallback inside var() counts: the colour is still a literal).
        const withoutUrls = value.replace(/url\([^)]*\)/g, match => " ".repeat(match.length));
        for (const match of withoutUrls.matchAll(COLOUR)) {
            // hsl(var(--h) var(--s)) and the like are built from tokens only: no number is left once the var() groups are taken out.
            const bare = match[0].replace(/var\([^()]*(?:\([^()]*\)[^()]*)*\)/g, "");
            if (/^(?:rgba?|hsla?)\(/.test(match[0]) && /var\(/.test(match[0]) && !/\d/.test(bare)) continue;
            add("colour", at + match.index, match[0].replace(/\s+/g, " "));
        }
        if (CORNER_PROPERTY.test(property)) {
            for (const piece of outsideFunctions(value.replace(/!important/, "")).split(/[\s/]+/).filter(Boolean)) {
                if (/^\d*\.?\d+(?:px|em|rem)$/.test(piece) && piece !== "999px") add("corner", at, piece);
            }
        }
        if (GAP_PROPERTY.test(property)) {
            for (const piece of outsideFunctions(value.replace(/!important/, "")).split(/\s+/).filter(Boolean)) {
                if (/^\d*\.?\d+(?:px|em|rem|vw|vh)$/.test(piece)) add("gap", at, piece);
            }
        }
    }

    const allowed = catalogue();
    for (const match of text.matchAll(/@(?:media|container)\b([^{]*)\{/g)) {
        for (const condition of match[1].matchAll(/\(\s*(min|max)-(width|height)\s*:\s*([\d.]+)px\s*\)/g)) {
            const spelling = condition[1] + "-" + condition[2] + ": " + condition[3] + "px";
            if (!allowed.has(spelling)) add("breakpoint", match.index, spelling);
        }
    }
    return findings;
}

export function lintStyles(files: readonly StyleFile[]): Finding[] {
    return files.filter(file => !file.name.endsWith(".generated.css")).flatMap(lintFile);
}

/** The findings as a baseline: rule -> file -> value -> count. */
export function toBaseline(findings: readonly Finding[]): Baseline {
    const baseline: Baseline = {};
    for (const finding of findings) {
        const byFile = (baseline[finding.rule] ??= {});
        const byValue = (byFile[finding.file] ??= {});
        byValue[finding.value] = (byValue[finding.value] ?? 0) + 1;
    }
    // Sorted, so the file is stable and a diff shows only what changed.
    const sorted: Baseline = {};
    for (const rule of Object.keys(baseline).sort()) {
        sorted[rule] = {};
        for (const file of Object.keys(baseline[rule]).sort()) {
            sorted[rule][file] = {};
            for (const value of Object.keys(baseline[rule][file]).sort()) sorted[rule][file][value] = baseline[rule][file][value];
        }
    }
    return sorted;
}

export interface Comparison {
    /** Findings beyond the baseline: a new value, or more of a known one. */
    readonly newer: Finding[];
    /** Baseline entries the stylesheets no longer need (fewer of them than recorded). */
    readonly gone: { rule: string; file: string; value: string; recorded: number; now: number }[];
}

export function compareWithBaseline(findings: readonly Finding[], baseline: Baseline): Comparison {
    const seen = new Map<string, number>();
    const newer: Finding[] = [];
    for (const finding of findings) {
        const key = [finding.rule, finding.file, finding.value].join("\u0000");
        const count = (seen.get(key) ?? 0) + 1;
        seen.set(key, count);
        const allowed = baseline[finding.rule]?.[finding.file]?.[finding.value] ?? 0;
        if (count > allowed) newer.push(finding);
    }
    const gone: Comparison["gone"] = [];
    for (const rule of Object.keys(baseline)) {
        for (const file of Object.keys(baseline[rule])) {
            for (const value of Object.keys(baseline[rule][file])) {
                const now = seen.get([rule, file, value].join("\u0000")) ?? 0;
                if (now < baseline[rule][file][value]) gone.push({ rule, file, value, recorded: baseline[rule][file][value], now });
            }
        }
    }
    return { newer, gone };
}
