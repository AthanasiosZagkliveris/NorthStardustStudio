import { frameworkRegistry } from "../../framework/engine/FrameworkRegistry";
import { groupOf, isCompanion } from "../../framework/engine/PageGroups";
import { titleWithPeriod } from "../../framework/engine/answers/AnswerStrategy";
import type { PageStatus } from "../../framework/engine/status/PageStatus";
import { sectionRailItems } from "../interview/rails/railItems";
import type { FrameworkSystem } from "../../types/system";

const EMPTY_PERIOD = { start: { month: "", year: "" }, end: { month: "", year: "" } };

/** A page of several sections is defined when all of them are, not started while none is, else in progress (the Pages rail's rule, Conversation.tsx). */
function together(statuses: readonly (PageStatus | undefined)[]): PageStatus {
    return statuses.every(status => status === "defined")
        ? "defined"
        : statuses.every(status => status === undefined || status === "not-started") ? "not-started" : "in-progress";
}

/** One line of a System's tile: its words, the full words where the line shows an abbreviation (its tooltip), its status. */
export interface SystemContentLine {
    label: string;
    full?: string;
    status?: PageStatus;
}

/** What a System's tile lists and the heading over it. */
export interface SystemContents {
    kind: "Pages" | "Chapters" | "Sections";
    lines: SystemContentLine[];
}

/**
 * THE LINE'S WORDS (owner, 2026-11-23 17:28 UTC+2: "No need to repeat the same words, especially when this word is the same with the capability (Quality,
 * Improvemrnt, etc)"; "If there is an abbreviation (KPI), use that word, and on its tolltip use the full wording"): the System's own first word is left off the
 * front of a line that starts with it ("Quality Standards" on the Quality System reads "Standards"; "Financial Model" on the Finance System, "Model"); a line
 * that names its abbreviation in brackets shows the abbreviation, its full words the tooltip.
 */
export function lineWords(label: string, system: FrameworkSystem): SystemContentLine {
    const abbreviation = /^(.+?)\s*\(([A-Z][A-Z0-9&]{1,7})\)$/.exec(label.trim());
    if (abbreviation) {
        return { label: abbreviation[2], full: abbreviation[1].trim() };
    }
    const own = system.title.replace(/ System$/, "").split(/\s+/)[0] ?? "";
    const words = label.trim().split(/\s+/);
    const stem = (word: string) => word.toLowerCase().replace(/[^a-z]/g, "").slice(0, 6);
    if (own.length >= 3 && words.length > 1 && stem(words[0]) === stem(own) && !/^(&|and|of)$/i.test(words[1])) {
        const rest = words.slice(1).join(" ");
        return { label: rest.charAt(0).toUpperCase() + rest.slice(1), full: label.trim() };
    }
    return { label: label.trim() };
}

/**
 * WHAT A SYSTEM HOLDS, LISTED ON ITS TILE (owner, 2026-11-23 17:28 UTC+2: "If a system has more than 1 page, its listed items should be its pages. If a system has
 * only 1 page, its listed items should be its chapters. if a system has only 1 chapter, its listed items should be its master tiles. Add a title above the
 * listed Items explaining (PAGES, CHAPTER, TILES)."): the pages as its Pages rail names them; the chapters of its one page (the page's sections that draw a
 * frame, by their frames' headings); or the master tiles of its one chapter (its section's parts, as its Sections rail names them). Each line carries its
 * status where the sections' statuses are given: a page's, a chapter's, or the status of the section a tile belongs to. Nothing where the System has no content.
 */
export function systemContents(system: FrameworkSystem, statuses?: ReadonlyMap<number, PageStatus>): SystemContents {
    let sections: readonly { number: number; title: string; answer?: Parameters<typeof sectionRailItems>[0] }[];
    try {
        sections = frameworkRegistry.getFramework(system.id).sections;
    } catch {
        return { kind: "Sections", lines: [] };
    }
    const plain = (title: string) => titleWithPeriod(title, EMPTY_PERIOD).replace(/^\d+\.\s+/, "").trim();
    const statusOf = (numbers: readonly number[]) => statuses ? together(numbers.map(number => statuses.get(number))) : undefined;
    const pages = sections.filter(section => !isCompanion(system.number, section.number));
    if (pages.length > 1) {
        return {
            kind: "Pages",
            lines: pages.map(section => {
                const group = groupOf(system.number, section.number);
                return { ...lineWords(group?.title ?? plain(section.title), system), status: statusOf(group?.members ?? [section.number]) };
            })
        };
    }
    if (pages.length === 0) {
        return { kind: "Sections", lines: [] };
    }
    const group = groupOf(system.number, pages[0].number);
    // (The page's chapters: its sections that draw a frame -- not one that hands its tiles to another's, and the page drawn as ONE chapter is one.)
    const framed = group && !group.oneChapter ? group.members.filter(number => number !== group.handsTiles) : [pages[0].number];
    if (framed.length > 1 && group) {
        return {
            kind: "Chapters",
            lines: framed.map((number, at) => {
                const section = sections.find(candidate => candidate.number === number);
                const own = [number, ...(group.handsTiles !== undefined && at === 0 ? [group.handsTiles] : [])];
                return { ...lineWords(group.frameTitles?.[group.members.indexOf(number)] ?? plain(section?.title ?? ""), system), status: statusOf(own) };
            })
        };
    }
    // (One chapter: its master tiles.)
    const members = group?.members ?? [pages[0].number];
    return {
        kind: "Sections",
        lines: members.flatMap(number => {
            const section = sections.find(candidate => candidate.number === number);
            if (!section) {
                return [];
            }
            const status = statuses ? statuses.get(number) ?? "not-started" : undefined;
            const parts = sectionRailItems(section.answer).map(item => item.label.replace(/^\d+\.\s+/, ""));
            return (parts.length > 0 ? parts : [plain(section.title)]).map(label => ({ ...lineWords(label, system), status }));
        })
    };
}
