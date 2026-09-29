import { InterviewSession } from "../framework/interview";
import type { AnswerDefinition } from "../framework/model";
import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";
import { pageStatuses, systemStatus, type PageStatus } from "../framework/engine/PageStatus";
import { systems } from "../data/systems";
import type { FrameworkSystem } from "../types/system";
import { StorageService } from "./StorageService";
import { OrganizationService } from "./OrganizationService";
import { pageRailItems } from "../components/interview/rails/railItems";

const normalize = (text: string) => text.trim().toLowerCase();

/**
 * Reads the value behind a Shared Answer from the saved session of
 * the System it mirrors, as the interview page does -- each mirrored
 * System's session loaded once per resolver.
 */
function sharedValueResolver(organizationId: string): (answer: AnswerDefinition) => unknown {

    const sessions = new Map<number, InterviewSession | null>();

    return (answer) => {

        const reference = answer.sharedSource;

        if (!reference) {
            return undefined;
        }

        const source = systems.find(candidate => normalize(candidate.title) === normalize(reference.systemTitle));

        if (!source) {
            return undefined;
        }

        const section = frameworkRegistry
            .getFramework(source.id)
            .sections
            .find(candidate => normalize(candidate.title) === normalize(reference.sectionTitle));

        if (!section) {
            return undefined;
        }

        if (!sessions.has(source.number)) {
            sessions.set(source.number, StorageService.loadInterview(organizationId, source.number));
        }

        return sessions.get(source.number)?.getResponse(section.number);

    };

}

/** A System's saved session, or null when there is none or it cannot be read. */
function savedSession(organizationId: string, system: FrameworkSystem): InterviewSession | null {

    try {
        return StorageService.loadInterview(organizationId, system.number);
    } catch {
        return null;
    }

}

/**
 * Every page of a System, in order, with its status for an
 * Organization (see PageStatus.ts), from its saved answers; every
 * page not started when the System has never been opened. Null for a
 * System whose Framework cannot be read.
 */
export function systemPages(
    organizationId: string,
    system: FrameworkSystem
): { number: number; title: string; status: PageStatus }[] | null {

    try {

        const session = savedSession(organizationId, system)
            ?? new InterviewSession(frameworkRegistry.getFramework(system.id));

        const statuses = pageStatuses(session, sharedValueResolver(organizationId), {
            systemNumber: system.number,
            annotations: OrganizationService.getAnnotations(organizationId)
        });

        return session.getSections().map(section => ({
            number: section.number,
            title: section.title,
            status: statuses.get(section.number) ?? "not-started"
        }));

    } catch {
        return null;
    }

}

/** Where "Continue" on System Selection leads (see continuePlace). */
export interface ContinuePlace {

    /**
     * "Continue" within the System last worked in; "Next" for the
     * next Foundation System once that one is done.
     */
    prefix: "Continue" | "Next";
    system: FrameworkSystem;
    sectionNumber: number;
    anchor?: string;
    /** "3. Business System — 3. Infrastructure & Capability". */
    label: string;

}

/**
 * Where "Continue" on System Selection leads, from the last place
 * worked and where the pages stand (a page is done only once it is
 * defined; one that needs review is not):
 *
 *   the last page, while it is not done -- "Continue: <System> — <page>";
 *   else that System's first page not done -- "Continue: ...";
 *   else the first Foundation System (1 to 4) with a page not done,
 *   at that page -- "Next: <System> — <page>";
 *   else nothing: the Foundation is done, and there is no line.
 *
 * Null too when nothing has been worked on yet, or the place no
 * longer exists. `pagesOf` reads a System's pages and statuses
 * (systemPages); a test passes its own.
 */
export function continuePlace(
    organizationId: string,
    pagesOf: typeof systemPages = systemPages
): ContinuePlace | null {

    const place = OrganizationService.getLastPlace(organizationId);

    const system = place ? systems.find(candidate => candidate.number === place.systemNumber) : undefined;

    if (!place || !system) {
        return null;
    }

    const pages = pagesOf(organizationId, system);

    if (!pages || !pages[place.sectionIndex]) {
        return null;
    }

    const at = (prefix: ContinuePlace["prefix"], where: FrameworkSystem, list: typeof pages, index: number, anchor?: string): ContinuePlace => ({
        prefix,
        system: where,
        sectionNumber: list[index].number,
        anchor,
        label: where.number + ". " + where.title + " — " + pageRailItems(list)[index].label
    });

    if (pages[place.sectionIndex].status !== "defined") {
        return at("Continue", system, pages, place.sectionIndex, place.anchor);
    }

    const open = pages.findIndex(page => page.status !== "defined");

    if (open >= 0) {
        return at("Continue", system, pages, open);
    }

    const foundation = systems
        .filter(candidate => candidate.capability === "foundation")
        .sort((one, other) => one.number - other.number);

    for (const next of foundation) {

        if (next.number === system.number) {
            continue;
        }

        const nextPages = pagesOf(organizationId, next);
        const first = nextPages ? nextPages.findIndex(page => page.status !== "defined") : -1;

        if (nextPages && first >= 0) {
            return at("Next", next, nextPages, first);
        }

    }

    return null;

}

/**
 * A System's status for an Organization (see PageStatus.ts), from
 * its saved answers: not started when it has never been opened.
 * Null for a System whose Framework cannot be read -- it has no
 * pages to have a status.
 */
export function systemProgress(organizationId: string, system: FrameworkSystem): PageStatus | null {

    const pages = systemPages(organizationId, system);

    return pages ? systemStatus(pages.map(page => page.status)) : null;

}
