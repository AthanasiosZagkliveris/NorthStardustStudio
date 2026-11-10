import { systems } from "../data/systems";
import { APP_TERMS } from "../data/glossary";
import { OrganizationService } from "./OrganizationService";

/**
 * THE GLOSSARY'S TWO KINDS OF TERM (Glossary.tsx): the app's own words
 * (APP_TERMS, src/data/glossary.ts) and YOUR TERMS -- the names the app
 * user gives the things they describe, read from the saved answers of
 * the open Organisation: a card in one of the lists below, with an id
 * and a name. Each of your terms says what kind of thing it is, where
 * it stands, and opens its card.
 */
export type GlossaryKind = "app" | "yours";

export const GLOSSARY_KINDS: readonly { id: GlossaryKind; label: string }[] = [
    { id: "app", label: "App terms" },
    { id: "yours", label: "Your terms" }
];

/** One of your terms. */
export interface UserTerm {
    /** The card's id: it opens the card (empty for the Organisation itself). */
    cardId: string;
    name: string;
    /** What kind of thing it is, as the app names it ("Segment"). */
    kind: string;
    /** Its own description, where it has one. */
    description: string;
    systemNumber: number;
    sectionNumber: number;
}

/** The saved lists whose cards are named by the app user, and what the app calls one card of each. */
const NAMED_LISTS: Readonly<Record<string, string>> = {
    segments: "Segment",
    profiles: "Profile",
    competitors: "Competitor",
    offerings: "Offering",
    founders: "Founder",
    providers: "Partner or supplier",
    themes: "Strategic Theme",
    objectives: "Objective"
};

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

/** The named cards of one saved page, in the order they are saved. */
export function namedCardsOfPage(value: unknown, systemNumber: number, sectionNumber: number): UserTerm[] {
    const found: UserTerm[] = [];
    const walk = (node: unknown, list: string) => {
        if (!node || typeof node !== "object") {
            return;
        }
        if (Array.isArray(node)) {
            node.forEach(item => walk(item, list));
            return;
        }
        const record = node as Record<string, unknown>;
        const kind = NAMED_LISTS[list];
        const name = text(record.name) || text(record.title);
        if (kind && name && typeof record.id === "string" && record.id !== "") {
            found.push({ cardId: record.id, name, kind, description: text(record.description), systemNumber, sectionNumber });
        }
        Object.entries(record).forEach(([key, child]) => walk(child, key));
    };
    walk(value, "");
    return found;
}

/** Whether a saved answer holds anything the person wrote or chose (an empty page saves empty strings and lists). */
function hasAnswer(value: unknown): boolean {
    if (typeof value === "string") {
        return value.trim() !== "";
    }
    if (typeof value === "number" || typeof value === "boolean") {
        return true;
    }
    if (Array.isArray(value)) {
        return value.some(hasAnswer);
    }
    if (value && typeof value === "object") {
        return Object.entries(value).some(([key, entry]) => key !== "id" && key !== "hue" && hasAnswer(entry));
    }
    return false;
}

export class GlossaryService {

    /** Every term the app user has named in an Organisation, each card once (where it is first saved), the Organisation itself first. */
    static userTerms(organizationId: string): UserTerm[] {
        const document = OrganizationService.loadDocument(organizationId) as { systems?: Record<string, { responses?: { sectionNumber: number; value: unknown }[] }> } | null;
        const name = OrganizationService.getSummary(organizationId)?.name?.trim() ?? "";
        const terms: UserTerm[] = name
            ? [{ cardId: "", name, kind: "Organisation", description: "", systemNumber: 1, sectionNumber: 1 }]
            : [];
        const seen = new Set<string>();
        for (const system of systems) {
            for (const response of document?.systems?.[String(system.number)]?.responses ?? []) {
                for (const term of namedCardsOfPage(response.value, system.number, response.sectionNumber)) {
                    if (!seen.has(term.cardId)) {
                        seen.add(term.cardId);
                        terms.push(term);
                    }
                }
            }
        }
        return terms;
    }

    /** The app's terms, in alphabetical order. */
    /**
     * THE APP'S TERMS THAT HAVE APPEARED (owner, 2026-11-10: "If a term exists in the app but has not appeared yet, it does not need to be in the glossary"):
     * a term is listed once one of the pages it is used on holds a saved answer in one of these Organisations (or with none open, every term).
     */
    static appTermsAppeared(organizationIds: readonly string[]) {
        const terms = GlossaryService.appTerms();
        if (organizationIds.length === 0) {
            return terms;
        }
        const answered = new Set<string>();
        for (const organizationId of organizationIds) {
            const document = OrganizationService.loadDocument(organizationId) as { systems?: Record<string, { responses?: { sectionNumber: number; value: unknown }[] }> } | null;
            for (const [system, entry] of Object.entries(document?.systems ?? {})) {
                for (const response of entry.responses ?? []) {
                    if (hasAnswer(response.value)) {
                        answered.add(system + "." + response.sectionNumber);
                    }
                }
            }
        }
        return terms.filter(term => !term.places || term.places.some(place => answered.has(place.system + "." + place.page)));
    }

    static appTerms() {
        return [...APP_TERMS].sort((one, other) => one.term.localeCompare(other.term, "en-GB", { sensitivity: "base" }));
    }

}
