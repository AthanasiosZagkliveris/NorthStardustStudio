/**
 * The documents' references, checked against the code (docs/archive/plans/2026-10-14-cleanup-and-library-plans.md, 5.13
 * and the documentation plan): a document that names a custom property, a
 * class or a file that does not exist is wrong, and this finds it. Pure
 * functions; the test reads the files.
 *
 * What is read: the text in backticks. A custom property is --name, a class
 * is .name (only where the backticked text starts with a dot or a dot follows
 * a space or a bracket), a file is name.ext with ts, tsx, css, mjs, md or json.
 */

export interface References {
    readonly properties: Set<string>;
    readonly classes: Set<string>;
    readonly files: Set<string>;
}

export function extractReferences(text: string): References {
    const properties = new Set<string>();
    const classes = new Set<string>();
    const files = new Set<string>();
    for (const match of text.matchAll(/`([^`\n]+)`/g)) {
        const code = match[1];
        for (const m of code.matchAll(/--[a-z][a-z0-9-]*/gi)) properties.add(m[0]);
        for (const m of code.matchAll(/(?:^|[\s>(,])\.([a-z][a-z0-9_-]{2,})/gi)) classes.add(m[1]);
        for (const m of code.matchAll(/\b([A-Za-z][A-Za-z0-9_.-]*\.(?:tsx?|css|mjs|md|json))\b/g)) files.add(m[1]);
    }
    return { properties, classes, files };
}

export interface Code {
    /** Every custom property defined anywhere in the code. */
    readonly properties: ReadonlySet<string>;
    /** All the text of the stylesheets and components, to look a class name up in. */
    readonly text: string;
    /** The base names of the files of the project. */
    readonly files: ReadonlySet<string>;
}

/** The custom properties a text defines: `--name:` in a stylesheet and "--name" in a string. */
export function definedProperties(text: string): string[] {
    const found: string[] = [];
    for (const m of text.matchAll(/(--[a-z0-9-]+)\s*:/gi)) found.push(m[1]);
    for (const m of text.matchAll(/["'`](--[a-z0-9-]+)["'`]/gi)) found.push(m[1]);
    return found;
}

export interface Missing {
    readonly properties: string[];
    readonly classes: string[];
    readonly files: string[];
}

/**
 * What a document names that the code does not have. `allowed` lists the names
 * the document may use without the code having them (a command-line flag, a
 * property it states is absent). A name ending in "-" is a family (--theme-):
 * it is found if some property starts with it.
 */
export function missingReferences(references: References, code: Code, allowed: ReadonlySet<string> = new Set()): Missing {
    const properties = [...references.properties].filter(name => {
        if (allowed.has(name)) return false;
        if (code.properties.has(name)) return false;
        if (name.endsWith("-")) return ![...code.properties].some(defined => defined.startsWith(name));
        return true;
    });
    const classes = [...references.classes].filter(name => !allowed.has("." + name) && !code.text.includes(name));
    const files = [...references.files].filter(name => !allowed.has(name) && !code.files.has(name.split("/").pop() as string));
    return { properties: properties.sort(), classes: classes.sort(), files: files.sort() };
}
