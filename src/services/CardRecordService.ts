import { OrganizationService } from "./OrganizationService.ts";

/**
 * THE RECORD TIME OF A CARD: when the card was first made (or, for a card that was there before this was kept, first opened), written under the card as a note's is
 * ("Recorded 17/10/2026 14:13"). Kept in the organization's own document (`cardTimes`, by card id), so it is saved, exported and imported with it.
 */
export class CardRecordService {

    /** The card's record time (ms), set to now the first time it is asked for; 0 where there is no organization or the document cannot be written. */
    static recordedAt(cardId: string, now = Date.now()): number {
        const organizationId = OrganizationService.getSelected();
        if (!organizationId || cardId === "") {
            return 0;
        }
        const document = OrganizationService.loadDocument(organizationId);
        if (!document) {
            return 0;
        }
        const known = document.cardTimes?.[cardId];
        if (typeof known === "number") {
            return known;
        }
        try {
            OrganizationService.saveDocument({ ...document, cardTimes: { ...document.cardTimes, [cardId]: now } });
        } catch {
            return 0;
        }
        return now;
    }

}
