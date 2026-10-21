/**
 * A sheet that is only a list of imports (src/styles/conversation.css, section-tiles.css: one file per topic in a folder
 * of the same name), read as the single text it was: each `@import "./folder/file.css";` is replaced by the text of that
 * file, in place, so a tool or a test that looks for a rule finds it where it always was. `read` gives the text of a path
 * relative to src/styles.
 */
export function expandImports(text: string, read: (path: string) => string): string {
    return text.replace(/@import\s+"\.\/([^"]+)";[^\n]*\n?/g, (_match, path: string) => expandImports(read(path).replace(/\r\n/g, "\n"), read));
}
