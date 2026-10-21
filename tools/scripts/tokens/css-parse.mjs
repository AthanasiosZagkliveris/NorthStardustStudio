/**
 * A small CSS reader for the colour stylesheet: top-level rules of
 * "selector { declarations }", comments, no at-rules and no nesting.
 * It is used by the comparison script (the proof that the generated
 * CSS equals the hand-written colors.css) and by nothing else, so it
 * knows only what colors.css uses and throws on anything else.
 *
 * Every run of white space in a value is folded to one space (as the
 * tests' stylesheet() helper folds it), so a value that was wrapped
 * over two lines compares equal to the same value on one.
 */

/** Split text at `separator`, outside quotes and parentheses. */
function splitOutside(text, separator) {
    const parts = [];
    let depth = 0;
    let quote = "";
    let start = 0;
    for (let at = 0; at < text.length; at++) {
        const char = text[at];
        if (quote) {
            if (char === quote) quote = "";
        } else if (char === "\"" || char === "'") {
            quote = char;
        } else if (char === "(") {
            depth++;
        } else if (char === ")") {
            depth--;
        } else if (char === separator && depth === 0) {
            parts.push(text.slice(start, at));
            start = at + 1;
        }
    }
    parts.push(text.slice(start));
    return parts;
}

const fold = text => text.replace(/\s+/g, " ").trim();

/**
 * Read a stylesheet into a list of items in source order:
 *   { kind: "comment", text }
 *   { kind: "rule", selector, items: [ { kind: "comment", text } | { kind: "declaration", name, value } ] }
 */
export function parseCss(source) {
    const text = source.replace(/\r\n/g, "\n");
    const items = [];
    let at = 0;
    const readComment = () => {
        const end = text.indexOf("*/", at + 2);
        if (end < 0) throw new Error("unterminated comment");
        const comment = text.slice(at + 2, end);
        at = end + 2;
        return comment;
    };
    while (at < text.length) {
        if (/\s/.test(text[at])) { at++; continue; }
        if (text.startsWith("/*", at)) {
            items.push({ kind: "comment", text: readComment() });
            continue;
        }
        if (text[at] === "@") throw new Error("at-rule at " + at + ": not supported");
        const open = text.indexOf("{", at);
        if (open < 0) throw new Error("rule without a block at " + at);
        const selector = fold(text.slice(at, open));
        at = open + 1;
        const rule = { kind: "rule", selector, items: [] };
        let chunk = "";
        const flush = () => {
            for (const piece of splitOutside(chunk, ";")) {
                const declaration = piece.trim();
                if (!declaration) continue;
                const colon = declaration.indexOf(":");
                if (colon < 0) throw new Error("bad declaration: " + declaration);
                rule.items.push({ kind: "declaration", name: declaration.slice(0, colon).trim(), value: fold(declaration.slice(colon + 1)) });
            }
            chunk = "";
        };
        let quote = "";
        while (at < text.length) {
            const char = text[at];
            if (!quote && text.startsWith("/*", at)) {
                flush();
                rule.items.push({ kind: "comment", text: readComment() });
                continue;
            }
            if (quote) {
                if (char === quote) quote = "";
            } else if (char === "\"" || char === "'") {
                quote = char;
            } else if (char === "}") {
                break;
            } else if (char === "{") {
                throw new Error("nested block at " + at);
            }
            chunk += char;
            at++;
        }
        if (at >= text.length) throw new Error("unterminated block for " + selector);
        flush();
        at++;
        items.push(rule);
    }
    return items;
}

/** Every declaration as { selector, name, value }, in source order. */
export function declarations(source) {
    const list = [];
    for (const item of parseCss(source)) {
        if (item.kind !== "rule") continue;
        for (const inner of item.items) {
            if (inner.kind === "declaration") list.push({ selector: item.selector, name: inner.name, value: inner.value });
        }
    }
    return list;
}
