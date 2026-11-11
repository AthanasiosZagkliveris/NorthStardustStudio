import { OrganizationDocument, OrganizationService } from "./OrganizationService";

/**
 * THE EXAMPLE ORGANIZATIONS the project ships (src/data/examples): each has a fixed id. The Landing page's Reload refreshes every example that is already
 * among the saved Organizations -- its saved document is replaced by the current example file (so a change to an example reaches the app) -- and leaves every
 * other Organization alone. An example is found by its id OR, for a copy that was imported (an import always makes a new id), by its name; the saved
 * copy keeps its own id, name and creation time. An example that was removed, or never added, is not brought back.
 */
async function examples(): Promise<{ id: string; name: string; document: unknown }[]> {
    const files = await Promise.all([import("../data/examples/lumen-and-loom-studio.json"), import("../data/examples/quillfield-automation-llc.json")]);
    return files.map(file => {
        const document = file.default as { id: string; name: string };
        return { id: document.id, name: document.name, document };
    });
}

/** Replaces the saved copy of each example that exists; returns the ids it refreshed. */
export async function refreshExampleOrganizations(): Promise<string[]> {

    const saved = OrganizationService.list();
    const refreshed: string[] = [];

    for (const example of await examples()) {
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
