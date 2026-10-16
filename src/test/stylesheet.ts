import { readFileSync } from "node:fs";
import { expandImports } from "../../scripts/lint/css-imports.ts";

/**
 * One of the app's stylesheets (src/styles/<name>), as plain text
 * with every run of white space folded to one space, so a test can
 * look for a rule as written. Read from disk because the test
 * runner turns a CSS import into an empty module.
 */
/**
 * A stylesheet as written, with the imports of a sheet that is a list of imports put in place (see
 * scripts/lint/css-imports.ts), line ends as \n.
 */
export function sheetSource(name: string): string {
    const read = (path: string) => readFileSync(new URL("../styles/" + path, import.meta.url), "utf8");
    return expandImports(read(name).replace(/\r\n/g, "\n"), read);
}

export function stylesheet(name: string): string {
    return sheetSource(name).replace(/\s+/g, " ");
}

/**
 * One theme's token block in colors.generated.css, folded as stylesheet() folds
 * it: the light tokens (the first rule), or the
 * :root[data-theme="dark"] or ="sepia" rule.
 */
export function themeBlock(theme: "light" | "dark" | "sepia"): string {
    const css = stylesheet("colors.generated.css");
    const start = theme === "light" ? css.indexOf(":root,") : css.indexOf(":root[data-theme=\"" + theme + "\"] {");
    if (start < 0) throw new Error("no " + theme + " block");
    return css.slice(start, css.indexOf("}", start));
}
