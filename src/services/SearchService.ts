import { capabilities } from "../data/capabilities";
import { systems } from "../data/systems";
import { answerTexts, entry, type SearchEntry } from "../framework/engine/Search";
import { pageRailItems } from "../components/interview/rails/railItems";
import { allPlaces } from "../components/notepad/notepadPlaces";
import { OrganizationService } from "./OrganizationService";
import { StorageService } from "./StorageService";

/** The Foundation Systems first, then the rest in the app's order (by Capability, then number). */
const ORDER = [...systems].sort((one, other) =>
    Number(one.capability !== "foundation") - Number(other.capability !== "foundation") ||
    capabilities.findIndex(capability => capability.id === one.capability) -
    capabilities.findIndex(capability => capability.id === other.capability) ||
    one.number - other.number);

function systemTitle(systemNumber: number): string {
    const system = systems.find(candidate => candidate.number === systemNumber);
    return system ? system.number + ". " + system.title : "";
}

/**
 * THE SEARCH INDEX of an Organization (Search.ts), built as the search
 * opens: for the Foundation Systems and every other System it has
 * worked on -- their titles and their pages' (Pages); their pages'
 * sections and every field and label seen on a page (Fields, through
 * the field registry, FieldKeys.ts); and what it has written in them
 * (Your answers).
 */
export function organizationSearchIndex(organizationId: string): SearchEntry[] {

    OrganizationService.flushPendingWrites();

    const worked = new Set(OrganizationService.listSystemNumbers(organizationId));
    const included = ORDER.filter(system => system.capability === "foundation" || worked.has(system.number));
    const rankOf = new Map(included.map((system, index) => [system.number, index]));

    const index: SearchEntry[] = [];
    let counter = 0;
    const rank = (systemNumber: number) => (rankOf.get(systemNumber) ?? included.length) * 1_000_000 + counter++;

    // Pages and fields: the places a note can link to, of these Systems.
    for (const place of allPlaces(organizationId)) {
        if (!rankOf.has(place.systemNumber)) {
            continue;
        }
        if (place.kind === "system") {
            index.push(entry("page", systemTitle(place.systemNumber), "System", { systemNumber: place.systemNumber }, rank(place.systemNumber)));
        } else if (place.kind === "page") {
            index.push(entry("page", place.label, place.place, { systemNumber: place.systemNumber, sectionNumber: place.sectionNumber }, rank(place.systemNumber)));
        } else if (place.key) {
            index.push(entry("field", place.label, place.place, {
                systemNumber: place.systemNumber,
                sectionNumber: place.sectionNumber,
                key: place.key,
                ...(place.anchors ? { anchors: place.anchors } : {})
            }, rank(place.systemNumber)));
        }
    }

    // What the Organization has written, page by page.
    for (const system of included) {
        let session: ReturnType<typeof StorageService.loadInterview> = null;
        try {
            session = StorageService.loadInterview(organizationId, system.number);
        } catch {
            session = null;
        }
        if (!session) {
            continue;
        }
        const sections = session.getSections();
        for (const response of session.getResponses()) {
            const section = sections.find(candidate => candidate.number === response.sectionNumber);
            if (!section) {
                continue;
            }
            const place = systemTitle(system.number) + " → " + pageRailItems([section])[0].label;
            for (const { text, ids } of answerTexts(response.value)) {
                index.push(entry("answer", text, place, { systemNumber: system.number, sectionNumber: section.number, text, ids }, rank(system.number)));
            }
        }
    }

    return index;

}
