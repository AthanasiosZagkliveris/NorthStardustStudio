/**
 * Writes src/styles/components.generated.css from the library (src/library/componentTokens.ts): the library is the one
 * place where the height of a cell, the size of a box button or of a mark is written, and the stylesheets read the
 * custom properties with var(). Change a look in the library (the procedure of docs/design/08-library-system.md), run
 * `npm run library:tokens`, and the app follows.
 *
 *   node scripts/library/component-tokens.mjs [--check]
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { renderComponentTokens } from "../../src/library/componentTokens.ts";

const file = "src/styles/components.generated.css";
const text = renderComponentTokens();
if (process.argv.includes("--check")) {
    const now = existsSync(file) ? readFileSync(file, "utf8").split("\r").join("") : "";
    if (now !== text) { console.error("out of date: " + file + " (run npm run library:tokens)"); process.exit(1); }
    console.log("the component tokens are up to date");
} else { writeFileSync(file, text); console.log("wrote " + file); }
