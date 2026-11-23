import { frameworkRegistry } from "../../framework/engine/FrameworkRegistry";
import { groupOf, isCompanion } from "../../framework/engine/PageGroups";
import { titleWithPeriod } from "../../framework/engine/answers/AnswerStrategy";
import { sectionRailItems } from "../interview/rails/railItems";
import type { FrameworkSystem } from "../../types/system";

const EMPTY_PERIOD = { start: { month: "", year: "" }, end: { month: "", year: "" } };

/**
 * WHAT A SYSTEM HOLDS, LISTED ON ITS TILE (owner, 2026-11-23 15:32 UTC+2: "On the system Tiles, add listed items with their Tiles (Identity -> Organization,
 * Positioning, etc). When there are more than 1 pages, instead of their tiles place their pages."): a System of one page lists its page's tiles (each section's
 * parts, as its Sections rail names them, or the section itself); a System of several pages lists its pages, as its Pages rail names them. Nothing where the
 * System has no content yet.
 */
export function systemContents(system: FrameworkSystem): string[] {
    let sections: readonly { number: number; title: string; answer?: Parameters<typeof sectionRailItems>[0] }[];
    try {
        sections = frameworkRegistry.getFramework(system.id).sections;
    } catch {
        return [];
    }
    const plain = (title: string) => titleWithPeriod(title, EMPTY_PERIOD).replace(/^\d+\.\s+/, "").trim();
    const pages = sections.filter(section => !isCompanion(system.number, section.number));
    if (pages.length > 1) {
        return pages.map(section => groupOf(system.number, section.number)?.title ?? plain(section.title));
    }
    if (pages.length === 0) {
        return [];
    }
    const members = groupOf(system.number, pages[0].number)?.members ?? [pages[0].number];
    return members.flatMap(number => {
        const section = sections.find(candidate => candidate.number === number);
        if (!section) {
            return [];
        }
        const parts = sectionRailItems(section.answer).map(item => item.label.replace(/^\d+\.\s+/, ""));
        return parts.length > 0 ? parts : [plain(section.title)];
    });
}
