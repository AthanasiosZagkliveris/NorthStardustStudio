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

/**
 * Where "Continue" on System Selection leads: the last place worked,
 * as the System and page it names ("3. Business System — 3.
 * Infrastructure & Capability"), or null when nothing has been
 * worked on yet (or the place no longer exists).
 */
export function continuePlace(organizationId: string): {
    system: FrameworkSystem;
    sectionNumber: number;
    anchor?: string;
    label: string;
} | null {

    const place = OrganizationService.getLastPlace(organizationId);

    const system = place ? systems.find(candidate => candidate.number === place.systemNumber) : undefined;

    if (!place || !system) {
        return null;
    }

    try {

        const sections = frameworkRegistry.getFramework(system.id).sections;
        const section = sections[place.sectionIndex];

        if (!section) {
            return null;
        }

        return {
            system,
            sectionNumber: section.number,
            anchor: place.anchor,
            label: system.number + ". " + system.title + " — " + pageRailItems(sections)[place.sectionIndex].label
        };

    } catch {
        return null;
    }

}

/**
 * A System's status for an Organization (see PageStatus.ts), from
 * its saved answers: not started when it has never been opened.
 * Null for a System whose Framework cannot be read -- it has no
 * pages to have a status.
 */
export function systemProgress(organizationId: string, system: FrameworkSystem): PageStatus | null {

    try {

        const session = StorageService.loadInterview(organizationId, system.number)
            ?? new InterviewSession(frameworkRegistry.getFramework(system.id));

        return systemStatus(Array.from(pageStatuses(session, sharedValueResolver(organizationId)).values()));

    } catch {
        return null;
    }

}
