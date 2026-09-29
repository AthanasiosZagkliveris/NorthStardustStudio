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
