import { systems } from "../../data/systems";
import { frameworkRegistry } from "../../framework/engine/FrameworkRegistry";
import { registeredFields, parseFieldKey } from "../../framework/engine/FieldKeys";
import { OrganizationService } from "../../services/OrganizationService";
import type { NoteLink } from "../../services/NotepadService";
import { fieldLocation } from "../interview/openField";
import { pageFields, pageRailItems, sectionRailItems } from "../interview/rails/railItems";
import type { FrameworkSystem } from "../../types/system";

/** A place a note can link to, before it is linked (see NoteLink). */
export type Place = Omit<NoteLink, "id">;

/** The Foundation Systems' pages and sections come first: they are where the notes are. */
const FOUNDATION = new Set([1, 2, 3, 4]);

function systemTitle(systemNumber: number): string {
    const system = systems.find(candidate => candidate.number === systemNumber);
    return system ? system.number + ". " + system.title : "";
}

/**
 * Every place of an Organization a note can link to by name ("#"):
 * each System, each page, each page's sections, and every field and
 * card seen on a page so far (the field registry).
 */
export function allPlaces(organizationId: string): Place[] {

    const places: Place[] = [];
    const seen = new Set<string>();
    const add = (place: Place) => {
        const id = place.kind + ":" + place.systemNumber + ":" + (place.sectionNumber ?? "") + ":" + (place.key ?? "");
        if (!seen.has(id)) {
            seen.add(id);
            places.push(place);
        }
    };

    const ordered = [...systems].sort((one, other) =>
        Number(!FOUNDATION.has(one.number)) - Number(!FOUNDATION.has(other.number)) || one.number - other.number);

    for (const system of ordered) {

        add({ organizationId, kind: "system", systemNumber: system.number, label: system.title, place: "" });

        let sections: { number: number; title: string; answer?: Parameters<typeof pageFields>[1]["answer"] }[] = [];
        try {
            sections = frameworkRegistry.exists(system.id) ? frameworkRegistry.getFramework(system.id).sections : [];
        } catch {
            sections = [];
        }

        for (const section of sections) {
            const pageTitle = pageRailItems([section])[0].label;
            add({ organizationId, kind: "page", systemNumber: system.number, sectionNumber: section.number, label: pageTitle, place: systemTitle(system.number) });
            for (const field of pageFields(system.number, section)) {
                add({ organizationId, kind: "field", systemNumber: system.number, sectionNumber: section.number, key: field.key, label: field.label, place: systemTitle(system.number) + " → " + pageTitle });
            }
        }

    }

    for (const entry of registeredFields()) {
        const address = parseFieldKey(entry.key);
        if (!address || entry.kind === "none") {
            continue;
        }
        add({
            organizationId,
            kind: "field",
            systemNumber: address.systemNumber,
            sectionNumber: address.sectionNumber,
            key: entry.key,
            ...(entry.anchors ? { anchors: entry.anchors } : {}),
            label: entry.label,
            place: systemTitle(address.systemNumber) + " → " + entry.pageTitle
        });
    }

    return places;

}

/** The places whose name holds `query`, those it starts first, at most `limit`. */
export function findPlaces(organizationId: string, query: string, limit = 8): Place[] {
    const wanted = query.trim().toLowerCase();
    const scored = allPlaces(organizationId)
        .map(place => ({ place, at: place.label.toLowerCase().indexOf(wanted) }))
        .filter(entry => entry.at >= 0);
    scored.sort((one, other) => Number(one.at !== 0) - Number(other.at !== 0));
    return scored.slice(0, limit).map(entry => entry.place);
}

/**
 * Whether a link still leads somewhere: its Organization is there,
 * and so is the card it names (its innermost anchor's id, looked for
 * in what the Organization has saved). A card named by a fixed
 * anchor (no id in it) is taken to be there.
 */
export function linkAvailable(link: NoteLink): boolean {

    if (!OrganizationService.getSummary(link.organizationId)) {
        return false;
    }

    if (!systems.some(system => system.number === link.systemNumber)) {
        return false;
    }

    const anchor = link.anchors?.[0];
    const id = anchor ? /[a-z]+-[a-z0-9]*\d[a-z0-9]*(?:-[a-z0-9]+)*$/i.exec(anchor)?.[0] : undefined;
    if (!id) {
        return true;
    }

    const saved = JSON.stringify(OrganizationService.loadDocument(link.organizationId) ?? {});
    // The id itself, or the id without the anchor's own prefix ("legal-requirement-<id>").
    const parts = id.split("-");
    return parts.some((_part, index) => index < parts.length - 1 && saved.includes("\"" + parts.slice(index).join("-") + "\""));

}

type Navigate = (to: string, options?: { state?: unknown }) => void;

/**
 * Opens a linked place: switches to its Organization when another is
 * open, then opens the System, the page, or the field (openField:
 * unfolded, scrolled to, focused and highlighted).
 */
export function openLink(navigate: Navigate, link: NoteLink): void {

    if (OrganizationService.getSelected() !== link.organizationId) {
        OrganizationService.setSelected(link.organizationId);
    }

    const system: FrameworkSystem | undefined = systems.find(candidate => candidate.number === link.systemNumber);

    if (!system) {
        return;
    }

    if (link.kind === "field" && link.key) {
        const location = fieldLocation(link.key, link.anchors ?? []);
        if (location) {
            navigate(location.pathname, { state: location.state });
        }
        return;
    }

    navigate("/introduction", {
        state: link.kind === "page" && link.sectionNumber !== undefined
            ? { system, targetSectionNumber: link.sectionNumber }
            : { system }
    });

}

/** "registration-number" as words: "Registration Number". */
function words(segment: string): string {
    return segment.split("-").filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

/** A path segment that names a card (its anchor holds an id: "legal-expense-expense-e6o4i9lb"). */
function isCardAnchor(segment: string): boolean {
    return /[a-z]+-[a-z0-9]*\d[a-z0-9]*$/i.test(segment) && /\d/.test(segment.split("-").pop() ?? "");
}

/**
 * What a link's chip says, worked out from its key every time (never
 * from text stored with it): WHERE it is as System.page.section --
 * the section (or column) of the page the field is in, numbered as
 * the page's rail numbers it ("1.3.3") -- and WHAT it asks: the
 * field's label ("Registration Number"), or, for a whole card, the
 * section it is in. Never what was typed into it.
 */
export function linkDetail(link: NoteLink): { number: string; name: string } {

    const base = [String(link.systemNumber), ...(link.sectionNumber !== undefined ? [String(link.sectionNumber)] : [])];
    const address = link.key ? parseFieldKey(link.key) : null;

    if (!address || link.sectionNumber === undefined) {
        return { number: base.join("."), name: link.label };
    }

    const system = systems.find(candidate => candidate.number === link.systemNumber);
    let items: { key: string; label: string }[] = [];
    let rawLabels: string[] = [];
    try {
        const section = system && frameworkRegistry.exists(system.id)
            ? frameworkRegistry.getFramework(system.id).sections.find(candidate => candidate.number === link.sectionNumber)
            : undefined;
        if (section) {
            items = pageFields(system!.number, section);
            rawLabels = sectionRailItems(section.answer).map(item => item.label);
        }
    } catch {
        items = [];
    }

    const sectionSegment = address.path[0];
    const at = items.findIndex(item => parseFieldKey(item.key)?.path[0] === sectionSegment);
    const number = at >= 0
        ? [...base, /^(\d+)\./.exec(rawLabels[at] ?? "")?.[1] ?? String(at + 1)].join(".")
        : base.join(".");

    const last = address.path[address.path.length - 1] ?? "";
    let name: string;
    if (address.path.length === 1) {
        // The section itself.
        name = at >= 0 ? items[at].label : words(last);
    } else if (isCardAnchor(last)) {
        // A whole card: the section it belongs to.
        name = at >= 0 ? items[at].label : words(sectionSegment);
    } else {
        // A field: its label as registered where it is known, else its key's words.
        const registered = registeredFields().find(entry => entry.key === link.key)?.label;
        name = registered && !/^\w+ \d+ /.test(registered) ? registered : words(last.replace(/^[a-z]+-\d+-/, ""));
    }

    return { number, name };

}
