import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { LocalNotepadStore, NotepadService, notepadStorageKey, DEFAULT_PROFILE } from "../../services/NotepadService";
import { OrganizationService } from "../../services/OrganizationService";
import { clearFieldRegistry } from "../../framework/engine/FieldKeys";
import { BusinessField } from "../interview/BusinessCardFields";
import { FieldPageProvider } from "../interview/fieldMarks";
import { NotepadButton, NotepadPanel, NotepadPicker, linkFor } from "./Notepad";
import { findPlaces, linkAvailable } from "./notepadPlaces";

beforeEach(() => {
    localStorage.clear();
    NotepadService.use(LocalNotepadStore);
});

afterEach(() => {
    cleanup();
    clearFieldRegistry();
    document.documentElement.className = "";
});

const place = (organizationId: string) => ({
    organizationId,
    kind: "field" as const,
    systemNumber: 3,
    sectionNumber: 1,
    key: "3.1:customer-segment-and-profile/seg-1/market-size-and-industry-outlook",
    anchors: ["seg-1"],
    label: "Market Size & Industry Outlook",
    place: "3. Business System → 1. Foundation"
});

describe("the notepad", () => {

    it("belongs to the person, not to an Organization: kept under its own key, newest first", () => {
        const organization = OrganizationService.create("Lumen");
        const first = NotepadService.addNote();
        NotepadService.setText(first, "Ask the accountant");
        const second = NotepadService.addNote([]);
        NotepadService.setText(second, "Check the market size");

        expect(NotepadService.notes().map(note => note.text)).toEqual(["Check the market size", "Ask the accountant"]);
        expect(localStorage.getItem(notepadStorageKey(DEFAULT_PROFILE))).toContain("Ask the accountant");
        expect(JSON.stringify(OrganizationService.exportDocument(organization.id))).not.toContain("Ask the accountant");

        // Read back from storage, as after a reload.
        NotepadService.use(LocalNotepadStore);
        expect(NotepadService.count()).toBe(2);
    });

    it("links a place once, finds the notes that link to a field, and forgets a removed link or note", () => {
        const organization = OrganizationService.create("Lumen");
        const note = NotepadService.addNote();
        NotepadService.addLink(note, place(organization.id));
        NotepadService.addLink(note, place(organization.id));

        expect(NotepadService.notes()[0].links).toHaveLength(1);
        expect(NotepadService.notesLinking(organization.id, place(organization.id).key).map(entry => entry.id)).toEqual([note]);
        expect(NotepadService.notesLinking("another-org", place(organization.id).key)).toEqual([]);

        NotepadService.removeLink(note, NotepadService.notes()[0].links[0].id);
        expect(NotepadService.notes()[0].links).toHaveLength(0);
        NotepadService.removeNote(note);
        expect(NotepadService.count()).toBe(0);
    });

    it("says when a link no longer leads anywhere", () => {
        const organization = OrganizationService.create("Lumen");
        expect(linkAvailable({ ...place(organization.id), id: "l1", anchors: ["resource-group-workspace"] })).toBe(true);
        expect(linkAvailable({ ...place(organization.id), id: "l2", anchors: ["legal-requirement-requirement-x1y2z3"] })).toBe(false);
        OrganizationService.remove(organization.id);
        expect(linkAvailable({ ...place(organization.id), id: "l3" })).toBe(false);
    });

    it("names places by \"#\": Systems, pages and sections", () => {
        const labels = findPlaces("org-1", "Financial").map(entry => entry.label);
        expect(labels).toContain("4. Financial Foundation");
        expect(findPlaces("org-1", "Business System")[0]).toMatchObject({ kind: "system", systemNumber: 3 });
    });

});

describe("the notepad on the page", () => {

    function page(organizationId: string) {
        return render(
            <MemoryRouter>
                <NotepadButton />
                <NotepadPanel />
                <NotepadPicker />
                <FieldPageProvider organizationId={organizationId} systemNumber={3} sectionNumber={1} pageTitle="1. Foundation">
                    <section data-rail="customer-segment-and-profile">
                        <div data-anchor="seg-1">
                            <BusinessField label="Market Size & Industry Outlook">
                                <textarea aria-label="Market size" defaultValue="About 40,000 households" />
                            </BusinessField>
                        </div>
                    </section>
                </FieldPageProvider>
            </MemoryRouter>
        );
    }

    it("opens from the header, with the count, and closes on Escape", () => {
        const organization = OrganizationService.create("Lumen");
        OrganizationService.setSelected(organization.id);
        NotepadService.addNote();
        page(organization.id);

        const button = screen.getByRole("button", { name: "Notes, 1 note" });
        act(() => { fireEvent.click(button); });
        expect(screen.getByRole("complementary", { name: "Notes" })).toBeTruthy();

        act(() => { fireEvent.keyDown(window, { key: "Escape" }); });
        expect(screen.queryByRole("complementary", { name: "Notes" })).toBeNull();
    });

    it("links a picked field without editing it, and marks the field as in your notes", () => {
        const organization = OrganizationService.create("Lumen");
        OrganizationService.setSelected(organization.id);
        const note = NotepadService.addNote();
        page(organization.id);

        expect(screen.queryByRole("button", { name: "In your notes" })).toBeNull();

        act(() => { NotepadService.open(); });
        act(() => { fireEvent.click(screen.getByRole("button", { name: "Link a field" })); });
        expect(screen.getByRole("status").textContent).toBe("Click a field or card to link it · Esc to cancel");

        const box = screen.getByLabelText("Market size") as HTMLTextAreaElement;
        act(() => { fireEvent.mouseDown(box); fireEvent.click(box); });

        expect(box.value).toBe("About 40,000 households");
        expect(NotepadService.notes()[0].links[0]).toMatchObject({
            organizationId: organization.id,
            key: "3.1:customer-segment-and-profile/seg-1/market-size-and-industry-outlook",
            anchors: ["seg-1"],
            label: "Market Size & Industry Outlook"
        });
        expect(screen.queryByRole("status")).toBeNull();

        // The field now says so, and its marker opens the notepad at the note.
        act(() => { NotepadService.close(); });
        act(() => { fireEvent.click(screen.getByRole("button", { name: "In your notes" })); });
        expect(NotepadService.view()).toMatchObject({ open: true, focusNoteIds: [note] });
    });

    it("makes a link of what a picked element holds", () => {
        const holder = document.createElement("div");
        holder.dataset.fieldKey = "1.3:organization/legal-form";
        document.body.append(holder);
        expect(linkFor(holder, "org-1")).toMatchObject({ kind: "field", systemNumber: 1, sectionNumber: 3, key: "1.3:organization/legal-form" });
        holder.remove();
    });

});
