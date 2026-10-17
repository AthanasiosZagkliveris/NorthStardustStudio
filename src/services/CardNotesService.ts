import { systems } from "../data/systems";
import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";
import { BRAND_COLOUR_SLOTS, BRAND_TYPEFACE_SLOTS } from "../framework/engine/AnswerUtils";
import { OrganizationService } from "./OrganizationService";

/**
 * THE CARD NOTES: every card's Notes text (its Description / Relevant Information, Usage or Notes -- one kind of text, labelled Notes) gathered from what an organization has
 * saved, so the Notes panel can show them all in one list, by the page they stand on. Read from the saved answers: a card is an object with an id and a name that holds one of
 * these texts.
 */
export interface CardNote {
    /** The card's id: it opens the card. */
    cardId: string;
    name: string;
    text: string;
    systemNumber: number;
    sectionNumber: number;
    /** The page it stands on: the filter's choices. */
    page: string;
}

const TEXT_KEYS = ["description", "usage", "notes", "purpose"] as const;
const NAME_KEYS = ["name", "font", "title"] as const;

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

/** The cards of one saved page that carry a Notes text. */
export function notesOfPage(value: unknown, systemNumber: number, sectionNumber: number, page: string): CardNote[] {
    const found: CardNote[] = [];
    const seen = new Set<string>();
    /** The Brand's cards have no id of their own: their place in the page's lists says it (the id their card is opened by). */
    const brandId = (list: string, at: number, record: Record<string, unknown>): string => {
        if (list === "colours" && record.enabled !== false) {
            return "brand-colour-" + (BRAND_COLOUR_SLOTS[at]?.id ?? "");
        }
        if (list === "typefaces" && record.enabled !== false) {
            return "brand-typeface-" + (BRAND_TYPEFACE_SLOTS[at]?.id ?? "");
        }
        return list === "images" ? "brand-image-" + at : "";
    };
    const walk = (node: unknown, list = "") => {
        if (!node || typeof node !== "object") {
            return;
        }
        if (Array.isArray(node)) {
            node.forEach((item, at) => {
                const record = item as Record<string, unknown> | null;
                if (record && typeof record === "object" && typeof record.id !== "string" && ["colours", "typefaces", "images"].includes(list)) {
                    walk({ ...record, id: brandId(list, at, record) });
                } else {
                    walk(item);
                }
            });
            return;
        }
        const record = node as Record<string, unknown>;
        const note = TEXT_KEYS.map(key => text(record[key])).find(candidate => candidate !== "");
        const name = NAME_KEYS.map(key => text(record[key])).find(candidate => candidate !== "");
        if (note && typeof record.id === "string" && record.id !== "" && !seen.has(record.id)) {
            seen.add(record.id);
            found.push({ cardId: record.id, name: name ?? "Unnamed card", text: note, systemNumber, sectionNumber, page });
        }
        Object.entries(record).forEach(([key, value]) => walk(value, key));
    };
    walk(value);
    return found;
}

export class CardNotesService {

    /** Every card note of an organization, in the order of its systems and pages. */
    static collect(organizationId: string): CardNote[] {
        const document = OrganizationService.loadDocument(organizationId) as { systems?: Record<string, { responses?: { sectionNumber: number; value: unknown }[] }> } | null;
        const notes: CardNote[] = [];
        for (const system of systems) {
            const responses = document?.systems?.[String(system.number)]?.responses ?? [];
            let sections: { number: number; title: string }[] = [];
            try {
                sections = frameworkRegistry.exists(system.id) ? frameworkRegistry.getFramework(system.id).sections : [];
            } catch {
                sections = [];
            }
            for (const response of responses) {
                const section = sections.find(candidate => candidate.number === response.sectionNumber);
                notes.push(...notesOfPage(response.value, system.number, response.sectionNumber, system.number + "." + response.sectionNumber + " " + (section?.title ?? system.title).replace(/\s*MM\/YY.*$/, "")));
            }
        }
        return notes;
    }

}
