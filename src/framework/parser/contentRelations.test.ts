import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * The structural references in the Systems' content, read straight from
 * the Markdown (`ai/07-framework-dsl-grammar.md`):
 *
 * - every `- Dynamic Field (Section: Column)` or
 *   `(System / Section: Column)` names a Section that exists and a column,
 *   card or variant of that title inside it;
 * - every `- <Word> Field` suffix names a Field of the shared registry
 *   (`src/assets/status-scale-frequency-fields.md`);
 * - each System's Answer, Questions and Help files list the same Sections,
 *   by number and title, in the same order. A Help file may instead say
 *   that its help is intentionally absent (Systems 1 to 4).
 *
 * A link that is known to be broken and not yet fixed is listed in KNOWN
 * and tested with `it.fails`, so fixing it turns the test red until the
 * entry is removed (`ai/03-toolchain-and-verification-playbook.md`).
 */

const ROOT = "src/assets/";

interface Section { number: number; title: string; lines: { line: number; text: string }[] }
interface SystemFile { file: string; system: string; sections: Section[] }

function read(folder: string, file: string, suffix = ""): SystemFile {
    const sections: Section[] = [];
    let system = "";
    readFileSync(ROOT + folder + "/" + file, "utf8").split(/\r?\n/).forEach((text, index) => {
        const head = /^# \d+\.\s+(.*?)\s*$/.exec(text);
        if (head) system = head[1].replace(/\s+Help$/, "");
        const sub = /^## (\d+)\.\s+(.*?)\s*$/.exec(text);
        if (sub) {
            const title = suffix ? sub[2].replace(new RegExp("\\s+" + suffix + "$"), "") : sub[2];
            sections.push({ number: Number(sub[1]), title, lines: [] });
        } else if (sections.length) {
            sections[sections.length - 1].lines.push({ line: index + 1, text });
        }
    });
    return { file: folder + "/" + file, system, sections };
}

function filesIn(folder: string): Map<string, string> {
    const byNumber = new Map<string, string>();
    for (const file of readdirSync(ROOT + folder, { recursive: true }).filter((name) => name.endsWith(".md") && !/[\\/]/.test(name))) {
        byNumber.set(file.slice(0, 2), file);
    }
    return byNumber;
}

const answerFiles = filesIn("system-answers");
const questionFiles = filesIn("system-questions");
const helpFiles = filesIn("system-help");
const answers = [...answerFiles.values()].map((file) => read("system-answers", file));
const bySystem = new Map(answers.map((answer) => [answer.system, answer]));

const registry = [...readFileSync(ROOT + "status-scale-frequency-fields.md", "utf8")
    .matchAll(/^## (\w+) Field\s*$/gm)].map((match) => match[1]);

/** Known broken links, by "file:line". Remove an entry once its link is fixed. */
const KNOWN = new Set([
    // The Business System has no "Revenue Model" Section since it became
    // three pages (Foundation, Customer Engagement, Infrastructure & Capability).
    "system-answers/17_FinanceSystemAnswer.md:15",
]);

describe("dynamic field links", () => {
    const links = answers.flatMap((answer) => answer.sections.flatMap((section) =>
        section.lines.flatMap(({ line, text }) =>
            [...text.matchAll(/Dynamic Field \(([^)]*)\)/g)].map((match) => ({ answer, line, ref: match[1] })))));

    it("finds the links to check", () => {
        expect(links.length).toBeGreaterThan(0);
    });

    for (const { answer, line, ref } of links) {
        const where = answer.file + ":" + line;
        const test = KNOWN.has(where) ? it.fails : it;
        test(where + " (" + ref + ") resolves", () => {
            const [systemPart, rest] = ref.includes("/") ? ref.split("/", 2).map((part) => part.trim()) : [answer.system, ref];
            const [sectionTitle, column] = rest.split(":").map((part) => part.trim());
            const target = bySystem.get(systemPart);
            expect(target, "System " + systemPart).toBeDefined();
            const section = target!.sections.find((candidate) => candidate.title === sectionTitle);
            expect(section, "Section " + sectionTitle + " in " + systemPart).toBeDefined();
            const named = section!.lines.some(({ text }) =>
                new RegExp("^\\s*- (Column|Card|Variant|Part) \\d+: " + column.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(\\s|$)").test(text));
            expect(named, "column " + column + " in " + sectionTitle).toBe(true);
        });
    }

    it("lists no fixed link as known", () => {
        const all = new Set(links.map(({ answer, line }) => answer.file + ":" + line));
        expect([...KNOWN].filter((where) => !all.has(where))).toEqual([]);
    });
});

describe("shared field suffixes", () => {
    it("reads the registry", () => {
        expect(registry).toEqual(expect.arrayContaining(["Status", "Scale", "Frequency", "Category", "Platform"]));
    });

    it("name only registered Fields", () => {
        const unknown = answers.flatMap((answer) => answer.sections.flatMap((section) =>
            section.lines.flatMap(({ line, text }) =>
                [...text.matchAll(/ - (\w+) Field\b/g)]
                    .map((match) => match[1])
                    .filter((word) => word !== "Dynamic" && !registry.includes(word))
                    .map((word) => answer.file + ":" + line + " " + word))));
        expect(unknown).toEqual([]);
    });
});

describe("Answer, Questions and Help files", () => {
    it("every System has all three", () => {
        const numbers = [...answerFiles.keys()];
        expect([...questionFiles.keys()].sort()).toEqual(numbers.sort());
        expect([...helpFiles.keys()].sort()).toEqual(numbers.sort());
    });

    for (const [number, file] of answerFiles) {
        const answer = read("system-answers", file);
        const outline = answer.sections.map((section) => section.number + ". " + section.title);

        it(number + " " + answer.system + ": Questions list the same Sections", () => {
            const questions = read("system-questions", questionFiles.get(number)!);
            expect(questions.sections.map((section) => section.number + ". " + section.title)).toEqual(outline);
        });

        it(number + " " + answer.system + ": Help lists the same Sections, or says it is absent", () => {
            const helpFile = helpFiles.get(number)!;
            const help = read("system-help", helpFile, "Help");
            if (help.sections.length === 0) {
                expect(readFileSync(ROOT + "system-help/" + helpFile, "utf8")).toMatch(/intentionally absent/);
                return;
            }
            expect(help.sections.map((section) => section.number + ". " + section.title)).toEqual(outline);
        });
    }
});
