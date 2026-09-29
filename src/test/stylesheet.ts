import { readFileSync } from "node:fs";

/**
 * One of the app's stylesheets (src/styles/<name>), as plain text
 * with every run of white space folded to one space, so a test can
 * look for a rule as written. Read from disk because the test
 * runner turns a CSS import into an empty module.
 */
export function stylesheet(name: string): string {
    return readFileSync(new URL("../styles/" + name, import.meta.url), "utf8").replace(/\s+/g, " ");
}

/**
 * One theme's token block in colors.css, folded as stylesheet() folds
 * it: the light tokens (the first rule), or the
 * :root[data-theme="dark"] or ="sepia" rule.
 */
export function themeBlock(theme: "light" | "dark" | "sepia"): string {
    const css = stylesheet("colors.css");
    const start = theme === "light" ? css.indexOf(":root,") : css.indexOf(":root[data-theme=\"" + theme + "\"] {");
    if (start < 0) throw new Error("no " + theme + " block");
    return css.slice(start, css.indexOf("}", start));
}
