import { afterEach, describe, expect, it } from "vitest";

import { LocalNotepadStore, notepadStorageKey } from "./NotepadService";

afterEach(() => localStorage.clear());

describe("a notepad saved before a field was renamed", () => {

    it("leads its links to the fields as they are now", () => {
        localStorage.setItem(notepadStorageKey("profile-1"), JSON.stringify({
            version: 1,
            notes: [{
                id: "note-1", organizationId: "org-1", text: "Check #hours", createdAt: 1,
                links: [{
                    id: "link-1", organizationId: "org-1", kind: "field", systemNumber: 3, sectionNumber: 3,
                    key: "3.3:founders/founder-a/working-hours-month", anchors: ["founder-a"],
                    label: "Working Hours / Month", place: "3. Business System"
                }]
            }]
        }));
        const link = LocalNotepadStore.load("profile-1").notes[0].links[0];
        expect(link.key).toBe("3.3:founders/founder-a/working-hours");
        expect(link.anchors).toEqual(["founder-a"]);
    });

});
