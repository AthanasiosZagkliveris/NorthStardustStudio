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

/**
 * WHAT A SYSTEM HOLDS, LISTED ON ITS TILE (owner, 2026-11-23 15:32 UTC+2: "On the system Tiles, add listed items with their Tiles (Identity -> Organization,
 * Positioning, etc). When there are more than 1 pages, instead of their tiles place their pages."): a System of one page lists its page's tiles (each section's
 * parts, as its Sections rail names them, or the section itself); a System of several pages lists its pages, as its Pages rail names them. Each line carries
 * its status where the sections' statuses are given (owner, 2026-11-23 16:19 UTC+2: "establish the bullets system ... like the 1st page"): a page's, or the
 * status of the section a part belongs to. Nothing where the System has no content yet.
 */
export function systemContents(system: FrameworkSystem, statuses?: ReadonlyMap<number, PageStatus>): { label: string; status?: PageStatus }[] {
    let sections: readonly { number: number; title: string; answer?: Parameters<typeof sectionRailItems>[0] }[];
    try {
        sections = frameworkRegistry.getFramework(system.id).sections;
    } catch {
        return [];
    }
    const plain = (title: string) => titleWithPeriod(title, EMPTY_PERIOD).replace(/^\d+\.\s+/, "").trim();
    const pages = sections.filter(section => !isCompanion(system.number, section.number));
    if (pages.length > 1) {
        return pages.map(section => {
            const group = groupOf(system.number, section.number);
            return {
                label: group?.title ?? plain(section.title),
                status: statuses ? together((group?.members ?? [section.number]).map(number => statuses.get(number))) : undefined
            };
        });
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
        const status = statuses ? statuses.get(number) ?? "not-started" : undefined;
        const parts = sectionRailItems(section.answer).map(item => item.label.replace(/^\d+\.\s+/, ""));
        return (parts.length > 0 ? parts : [plain(section.title)]).map(label => ({ label, status }));
    });
}
