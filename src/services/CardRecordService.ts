import { OrganizationService } from "./OrganizationService.ts";

/**
 * THE RECORD TIME OF A CARD: when the card was first made (or, for a card that was there before this was kept, first opened), written under the card as a note's is
 * ("Recorded 17/10/2026 14:13"). Kept apart from the answers, in the browser, one list for each organization: it never changes the answer's shape.
 */
const KEY = "northstardust-card-times-";

function read(organizationId: string): Record<string, number> {
    try {
        const stored = JSON.parse(localStorage.getItem(KEY + organizationId) ?? "{}");
        return stored && typeof stored === "object" ? stored as Record<string, number> : {};
    } catch {
        return {};
    }
}

export class CardRecordService {

    /** The card's record time (ms), set to now the first time it is asked for; 0 where there is no organization or no storage. */
    static recordedAt(cardId: string, now = Date.now()): number {
        const organizationId = OrganizationService.getSelected();
        if (!organizationId || cardId === "") {
            return 0;
        }
        const times = read(organizationId);
        if (typeof times[cardId] === "number") {
            return times[cardId];
        }
        try {
            localStorage.setItem(KEY + organizationId, JSON.stringify({ ...times, [cardId]: now }));
        } catch {
            return 0;
        }
        return now;
    }

}
