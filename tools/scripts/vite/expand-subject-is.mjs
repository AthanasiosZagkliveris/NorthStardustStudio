/**
 * A RULE THE BROWSER FILES BY ITS CLASS (the stylesheet speed-up, 2026-11-28; docs/design/research/12-app-speed.md, section 4). Chrome sorts the rules into
 * buckets by the id, class, attribute or tag of each selector's last compound -- the part that names the element styled -- and tries a rule only on the elements
 * of its bucket. A last compound that is a bare `:is(.a, .b)` belongs to no bucket, so Chrome tries the rule on every element of the page at every restyle
 * (Chrome's selector statistics, 2026-11-28: such rules took four fifths of the selector time).
 *
 * This PostCSS step, run by Vite on every stylesheet, writes such a selector as the list it stands for -- `X :is(.a, .b):focus` as `X .a:focus, X .b:focus` --
 * where that is the same rule exactly: every part of the `:is()` has the same specificity (so each written selector weighs what the `:is()` weighed), none
 * holds a pseudo-element, and the `:is()` starts its compound (a tag stays first). Parts that hold a combinator or a `:has()` stay together in one `:is()`.
 * The stylesheets keep their own words.
 */

/** The parts of `text` split at `separator` characters standing outside brackets, parentheses and quotes. */
function splitTop(text, isSeparator) {
    const parts = [];
    let depth = 0, quote = "", start = 0;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (quote) {
            if (c === "\\") i++;
            else if (c === quote) quote = "";
            continue;
        }
        if (c === "\"" || c === "'") quote = c;
        else if (c === "(" || c === "[") depth++;
        else if (c === ")" || c === "]") depth--;
        else if (depth === 0 && isSeparator(c, i)) {
            parts.push(text.slice(start, i));
            start = i + 1;
        }
    }
    parts.push(text.slice(start));
    return parts;
}

/** Where the last compound of a selector starts (after its last combinator outside brackets). */
function lastCompoundStart(selector) {
    let depth = 0, quote = "", at = 0;
    for (let i = 0; i < selector.length; i++) {
        const c = selector[i];
        if (quote) {
            if (c === "\\") i++;
            else if (c === quote) quote = "";
            continue;
        }
        if (c === "\"" || c === "'") quote = c;
        else if (c === "(" || c === "[") depth++;
        else if (c === ")" || c === "]") depth--;
        else if (depth === 0 && /[\s>+~]/.test(c)) at = i + 1;
    }
    return at;
}

/** A compound's specificity [ids, classes, tags], counting `:is()`/`:not()`/`:has()` as their heaviest part and `:where()` as nothing. */
function specificity(compound) {
    const total = [0, 0, 0];
    const add = part => { total[0] += part[0]; total[1] += part[1]; total[2] += part[2]; };
    let i = 0;
    while (i < compound.length) {
        const c = compound[i];
        if (c === "#") { total[0]++; i = skipName(compound, i + 1); }
        else if (c === ".") { total[1]++; i = skipName(compound, i + 1); }
        else if (c === "[") { total[1]++; i = closing(compound, i, "[", "]") + 1; }
        else if (c === ":") {
            if (compound[i + 1] === ":") return null;
            const end = skipName(compound, i + 1);
            const name = compound.slice(i + 1, end);
            if (compound[end] === "(") {
                const close = closing(compound, end, "(", ")");
                const inner = compound.slice(end + 1, close);
                if (/^(is|not|has|matches)$/.test(name)) {
                    const weights = splitTop(inner, c2 => c2 === ",").map(arg => complexSpecificity(arg.trim()));
                    if (weights.some(w => w === null)) return null;
                    add(weights.reduce((a, b) => compare(a, b) >= 0 ? a : b));
                } else if (name !== "where") {
                    total[1]++;
                }
                i = close + 1;
            } else {
                total[1]++;
                i = end;
            }
        } else if (c === "*") { i++; }
        else if (/[A-Za-z_-]/.test(c)) { total[2]++; i = skipName(compound, i); }
        else return null;
    }
    return total;
}

/** A complex selector's specificity: the sum over its compounds. */
function complexSpecificity(selector) {
    const total = [0, 0, 0];
    for (const compound of splitTop(selector, c => /[\s>+~]/.test(c)).filter(Boolean)) {
        const part = specificity(compound);
        if (!part) return null;
        total[0] += part[0]; total[1] += part[1]; total[2] += part[2];
    }
    return total;
}

function skipName(text, i) {
    while (i < text.length && /[\w-]|\\/.test(text[i])) i += text[i] === "\\" ? 2 : 1;
    return i;
}

function closing(text, open, left, right) {
    let depth = 0;
    for (let i = open; i < text.length; i++) {
        if (text[i] === left) depth++;
        else if (text[i] === right && --depth === 0) return i;
    }
    return text.length;
}

function compare(a, b) {
    return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

/** The selectors one selector stands for, its last compound's leading `:is()` written out; the selector itself where that would not be the same rule. */
export function expandSubject(selector) {
    const start = lastCompoundStart(selector);
    const compound = selector.slice(start);
    if (!compound.startsWith(":is(")) return [selector];
    const close = closing(compound, 3, "(", ")");
    const args = splitTop(compound.slice(4, close), c => c === ",").map(arg => arg.trim());
    const rest = compound.slice(close + 1);
    if (args.length < 2 || args.length > 24 || args.some(arg => arg === "" || /::|:-|&/.test(arg))) return [selector];
    const weights = args.map(complexSpecificity);
    if (weights.some(w => w === null) || weights.some(w => compare(w, weights[0]) !== 0)) return [selector];
    // (A part with a combinator or a :has() cannot be filed by a class either: those parts stay together in one :is(), the others are written out.)
    const plain = args.filter(arg => !/[\s>+~]|:has\(/.test(arg));
    const kept = args.filter(arg => !plain.includes(arg));
    if (plain.length === 0) return [selector];
    const before = selector.slice(0, start);
    return [...plain.map(arg => before + arg + rest), ...(kept.length > 0 ? [before + ":is(" + kept.join(", ") + ")" + rest] : [])];
}

export default function expandSubjectIs() {
    return {
        postcssPlugin: "expand-subject-is",
        Once(root) {
            root.walkRules(rule => {
                if (rule.parent?.type === "atrule" && /keyframes$/i.test(rule.parent.name)) return;
                const selectors = rule.selectors;
                const written = selectors.flatMap(expandSubject);
                if (written.length !== selectors.length && written.length <= 80) {
                    rule.selectors = written;
                }
            });
        }
    };
}
expandSubjectIs.postcss = true;
