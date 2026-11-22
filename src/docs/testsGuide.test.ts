import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/* THE TESTS GUIDE NAMES EVERY TEST FILE THERE IS, AND NO OTHER (the review of 2026-11-21, T4: the guide is written by hand, so a test file added,
   moved or removed without the guide is caught here). Each file is listed under its folder ("### src/pages/ (…)") by its name
   ("#### examplePages.lumen.test.tsx (19) …"), a file in a subfolder by its path from that folder ("#### model/check.test.ts (7)"); the counts of tests inside a file are the guide's own and are not compared. When this fails:
   add, move or remove the file's part in docs/testing/01-app-tests-guide.md. */

const GUIDE = "docs/testing/01-app-tests-guide.md";
const root = new URL("../../", import.meta.url);
const guide = readFileSync(new URL(GUIDE, root), "utf8").replace(/\r\n/g, "\n");

/** Every test file of the repository, as "folder/name" from the repository's root. */
function testFiles(): string[] {
    const found: string[] = [];
    for (const top of ["src", "tools"]) {
        for (const file of readdirSync(new URL(top + "/", root), { recursive: true })) {
            if (/\.test\.tsx?$/.test(file)) {
                found.push(top + "/" + file.replace(/\\/g, "/"));
            }
        }
    }
    return found.sort();
}

/** Every test file the guide lists: each name under the folder heading it stands below. */
function listed(): string[] {
    const names: string[] = [];
    let folder = "";
    for (const line of guide.split("\n")) {
        const heading = /^### ((?:src|tools)\/\S*?)\/? (?:with its subfolders? )?\(/.exec(line);
        if (heading) {
            folder = heading[1].replace(/\/$/, "");
            continue;
        }
        if (line.startsWith("## ")) {
            folder = "";
        }
        if (folder && line.startsWith("#### ")) {
            for (const name of line.match(/[\w./-]+\.test\.tsx?/g) ?? []) {
                names.push(folder + "/" + name);
            }
        }
    }
    return names.sort();
}

describe("the tests guide", () => {

    it("lists every test file under its folder, and only those", () => {
        expect(listed()).toEqual(testFiles());
    });

    it("says how many test files there are", () => {
        const count = testFiles().length;
        expect(guide).toContain("tests in " + count.toLocaleString("en-GB") + " files");
    });

});
