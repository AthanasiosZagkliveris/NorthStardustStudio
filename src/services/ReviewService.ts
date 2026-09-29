import { systems } from "../data/systems";
import { reviewItems, type ReviewItem } from "../framework/engine/ReviewItems";
import { OrganizationService } from "./OrganizationService";
import { sharedValueResolver } from "./ProgressService";
import { StorageService } from "./StorageService";

/** The four Foundation Systems. */
const FOUNDATION = systems.filter(system => system.capability === "foundation");

/**
 * What is left to look at in an Organization's Foundation (see
 * ReviewItems.ts), from what it has saved.
 */
export function organizationReview(organizationId: string): ReviewItem[] {

    OrganizationService.flushPendingWrites();

    const sessions = Object.fromEntries(FOUNDATION.map(system => {
        try {
            return [system.number, StorageService.loadInterview(organizationId, system.number)];
        } catch {
            return [system.number, null];
        }
    }));

    return reviewItems({
        sessions,
        titles: Object.fromEntries(FOUNDATION.map(system => [system.number, system.number + ". " + system.title])),
        resolveSharedValue: sharedValueResolver(organizationId),
        organisationName: OrganizationService.getSummary(organizationId)?.name ?? ""
    });

}
