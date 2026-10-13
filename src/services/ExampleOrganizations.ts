import lumen from "../data/examples/lumen-and-loom-studio.json";
import quillfield from "../data/examples/quillfield-automation-llc.json";

import { OrganizationDocument, OrganizationService } from "./OrganizationService";

/**
 * THE EXAMPLE ORGANIZATIONS the project ships (src/data/examples): each has a fixed id. The Landing page's Reload refreshes every example that is already
 * among the saved Organizations -- its saved document is replaced by the current example file (so a change to an example reaches the app) -- and leaves every
 * other Organization alone. An example is found by its id OR, for a copy that was imported (an import always makes a new id), by its name; the saved
 * copy keeps its own id, name and creation time. An example that was removed, or never added, is not brought back.
 */
const EXAMPLES: readonly { id: string; name: string; document: unknown }[] = [
    { id: (lumen as { id: string }).id, name: (lumen as { name: string }).name, document: lumen },
    { id: (quillfield as { id: string }).id, name: (quillfield as { name: string }).name, document: quillfield }
];

/** Replaces the saved copy of each example that exists; returns the ids it refreshed. */
export function refreshExampleOrganizations(): string[] {

    const saved = OrganizationService.list();
    const refreshed: string[] = [];

    for (const example of EXAMPLES) {
        // (The copy with the example's own id first; otherwise every copy carrying the example's name -- an imported one.)
        const copies = saved.some(entry => entry.id === example.id)
            ? saved.filter(entry => entry.id === example.id)
            : saved.filter(entry => entry.name.trim() === example.name.trim());
        for (const summary of copies) {
            const fresh = JSON.parse(JSON.stringify(example.document)) as OrganizationDocument;
            OrganizationService.saveDocument({ ...fresh, id: summary.id, name: summary.name, createdAt: summary.createdAt });
            refreshed.push(summary.id);
        }
    }

    OrganizationService.flushPendingWrites();

    return refreshed;

}
