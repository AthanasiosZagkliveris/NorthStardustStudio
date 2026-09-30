import { capabilities } from "../data/capabilities";
import { systems } from "../data/systems";
import { reviewItems, type ReviewItem } from "../framework/engine/ReviewItems";
import { OrganizationService } from "./OrganizationService";
import { sharedValueResolver } from "./ProgressService";
import { StorageService } from "./StorageService";

/** The Systems in the app's order: by Capability, then by number. */
const ORDER = [...systems].sort((one, other) =>
    capabilities.findIndex(capability => capability.id === one.capability) -
    capabilities.findIndex(capability => capability.id === other.capability) ||
    one.number - other.number);

/**
 * What is left to look at in an Organization, across the whole app
 * (see ReviewItems.ts): the Foundation Systems, and every other System
 * it has worked on, from what it has saved.
 */
export function organizationReview(organizationId: string): ReviewItem[] {

    OrganizationService.flushPendingWrites();

    const worked = new Set(OrganizationService.listSystemNumbers(organizationId));
    const sessions: Record<number, ReturnType<typeof StorageService.loadInterview>> = {};
    for (const system of ORDER) {
        if (system.capability !== "foundation" && !worked.has(system.number)) {
            continue;
        }
        try {
            sessions[system.number] = StorageService.loadInterview(organizationId, system.number);
        } catch {
            sessions[system.number] = null;
        }
    }

    return reviewItems({
        sessions,
        titles: Object.fromEntries(systems.map(system => [system.number, system.number + ". " + system.title])),
        capabilities: Object.fromEntries(systems.map(system => [system.number, system.capability])),
        order: ORDER.map(system => system.number).filter(number => number in sessions),
        resolveSharedValue: sharedValueResolver(organizationId),
        organisationName: OrganizationService.getSummary(organizationId)?.name ?? ""
    });

}
