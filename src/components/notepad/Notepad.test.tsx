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
import { UndoService } from "../../services/UndoService";
import { stylesheet } from "../../test/stylesheet";

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
        const second = NotepadService.addNote("");
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
        const note = NotepadService.addNote(organization.id);
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

    it("deletes a note at once and offers it back, where it was, with its id, text and links", () => {
        const organization = OrganizationService.create("Lumen");
        OrganizationService.setSelected(organization.id);
        const older = NotepadService.addNote(organization.id);
        NotepadService.setText(older, "Ask the accountant");
        NotepadService.addLink(older, place(organization.id));
        const newer = NotepadService.addNote(organization.id);
        NotepadService.setText(newer, "Check the market size");
        NotepadService.addNote(organization.id);
        page(organization.id);
        act(() => { fireEvent.click(screen.getByRole("button", { name: /^Notes, 3 notes/ })); });

        // An empty note just goes.
        act(() => { fireEvent.click(screen.getAllByRole("button", { name: "Delete note" })[0]); });
        expect(NotepadService.notes().map(note => note.id)).toEqual([newer, older]);
        expect(UndoService.current()).toBeNull();

        const kept = NotepadService.notes()[1];
        act(() => { fireEvent.click(screen.getAllByRole("button", { name: "Delete note" })[1]); });
        expect(screen.queryByRole("button", { name: "Delete note?" })).toBeNull();
        expect(NotepadService.notes().map(note => note.id)).toEqual([newer]);
        expect(UndoService.current()?.message).toBe("Note removed.");

        act(() => UndoService.undo());
        expect(NotepadService.notes()).toEqual([NotepadService.notes()[0], kept]);
        expect(NotepadService.notes().map(note => note.id)).toEqual([newer, older]);
    });

    it("links a picked field without editing it, and outlines the field as in your notes", () => {
        const organization = OrganizationService.create("Lumen");
        OrganizationService.setSelected(organization.id);
        const note = NotepadService.addNote(organization.id);
        page(organization.id);

        const box = screen.getByLabelText("Market size") as HTMLTextAreaElement;
        expect(box.classList.contains("is-noted")).toBe(false);

        act(() => { NotepadService.open(); });
        act(() => { fireEvent.click(screen.getByRole("button", { name: "Link a field" })); });
        expect(screen.getByRole("status").textContent).toBe("Click a field or card to link it · Esc to cancel");

        act(() => { fireEvent.mouseDown(box); fireEvent.click(box); });

        expect(box.value).toBe("About 40,000 households");
        expect(NotepadService.notes()[0].links[0]).toMatchObject({
            organizationId: organization.id,
            key: "3.1:customer-segment-and-profile/seg-1/market-size-and-industry-outlook",
            anchors: ["seg-1"],
            label: "Market Size & Industry Outlook"
        });
        expect(screen.queryByRole("status")).toBeNull();

        // The field is now drawn in your notes: its box outlined, and said so.
        expect(box.classList.contains("is-noted")).toBe(true);
        expect(box.getAttribute("aria-description")).toBe("In your notes");

        // And no longer once the link is removed.
        act(() => { NotepadService.removeLink(note, NotepadService.notes()[0].links[0].id); });
        expect(box.classList.contains("is-noted")).toBe(false);
    });

    it("shows a noted field's notes on hover and focus, and marks them and the field each way while the Notepad is open", () => {
        const organization = OrganizationService.create("Lumen");
        OrganizationService.setSelected(organization.id);
        const key = "3.1:customer-segment-and-profile/seg-1/market-size-and-industry-outlook";
        const link = { ...place(organization.id), key };
        for (const text of ["Check the census", "Ask the council", "Compare with Lyon"]) {
            const note = NotepadService.addNote(organization.id);
            NotepadService.setText(note, text);
            NotepadService.addLink(note, link);
        }
        page(organization.id);
        const box = screen.getByLabelText("Market size");
        expect(box.classList.contains("is-noted")).toBe(true);

        // Hovered: its notes, newest first, two and a count.
        act(() => { fireEvent.pointerOver(box); });
        const tip = screen.getByRole("tooltip");
        expect([...tip.querySelectorAll(".noted-tooltip-note")].map(note => note.textContent)).toEqual(["Compare with Lyon", "Ask the council"]);
        expect(tip.textContent).toContain("+1 more");
        expect(box.getAttribute("aria-describedby")).toBe(tip.id);
        act(() => { fireEvent.pointerOut(box, { relatedTarget: document.body }); });
        expect(screen.queryByRole("tooltip")).toBeNull();

        // Focused, too; Escape puts it away.
        act(() => { fireEvent.focusIn(box); });
        expect(screen.getByRole("tooltip")).toBeTruthy();
        act(() => { fireEvent.keyDown(box, { key: "Escape" }); });
        expect(screen.queryByRole("tooltip")).toBeNull();

        // With the Notepad open: the field pointed at marks its notes and links there ...
        act(() => { NotepadService.open(); });
        act(() => { fireEvent.pointerOver(box); });
        expect(document.querySelectorAll(".notepad-note.is-noted-hot")).toHaveLength(3);
        expect(document.querySelectorAll(".notepad-chip.is-noted-hot")).toHaveLength(3);
        act(() => { fireEvent.pointerOut(box, { relatedTarget: document.body }); });
        expect(document.querySelectorAll(".notepad-panel .is-noted-hot")).toHaveLength(0);

        // ... and a note pointed at marks the field.
        const note = document.querySelector<HTMLElement>(".notepad-note[data-note-id]")!;
        act(() => { fireEvent.mouseEnter(note); });
        expect(box.classList.contains("is-noted-hot")).toBe(true);
        act(() => { fireEvent.mouseLeave(note); });
        expect(box.classList.contains("is-noted-hot")).toBe(false);
    });

    it("makes a link of what a picked element holds", () => {
        const holder = document.createElement("div");
        holder.dataset.fieldKey = "1.3:organization/legal-form";
        document.body.append(holder);
        expect(linkFor(holder, "org-1")).toMatchObject({ kind: "field", systemNumber: 1, sectionNumber: 3, key: "1.3:organization/legal-form" });
        holder.remove();
    });

});

describe("notes by Organization", () => {

    it("belong to the Organization they were written in; the open one first and open, the others folded with their counts, General last", () => {
        const lumen = OrganizationService.create("Lumen");
        const quill = OrganizationService.create("Quillfield");
        OrganizationService.setSelected(lumen.id);
        NotepadService.setText(NotepadService.addNote(quill.id), "About Quillfield");
        NotepadService.setText(NotepadService.addNote(""), "A general thought");
        NotepadService.setText(NotepadService.addNote(lumen.id), "About Lumen");

        render(<MemoryRouter><NotepadPanel /></MemoryRouter>);
        act(() => { NotepadService.open(); });

        const heads = screen.getAllByRole("button", { name: /Lumen|Quillfield|General/ }).filter(button => button.classList.contains("notepad-group-head"));
        expect(heads.map(head => head.textContent)).toEqual(["Lumen1", "Quillfield1", "General1"]);
        expect(heads.map(head => head.getAttribute("aria-expanded"))).toEqual(["true", "false", "false"]);
        expect((screen.getAllByRole("textbox", { name: "Note" }) as HTMLTextAreaElement[]).map(box => box.value)).toEqual(["About Lumen"]);

        // Only a note of the open Organization can pick a field on its pages.
        act(() => { fireEvent.click(heads[1]); });
        expect(screen.getAllByRole("button", { name: "Link a field" })).toHaveLength(1);
    });

    it("reads an older note as belonging to its first link's Organization", () => {
        localStorage.setItem(notepadStorageKey(DEFAULT_PROFILE), JSON.stringify({ version: 1, notes: [
            { id: "n1", text: "Old", createdAt: 1, links: [{ id: "l1", organizationId: "org-9", kind: "system", systemNumber: 1, label: "Identity System", place: "" }] },
            { id: "n2", text: "Older", createdAt: 0, links: [] }
        ] }));
        NotepadService.use(LocalNotepadStore);
        expect(NotepadService.notes().map(note => note.organizationId)).toEqual(["org-9", ""]);
    });

});

describe("a field in your notes, pointed at", () => {

    it("draws its stroke inside the box, and outside it (the glow kept) while hovered, focused or its note is hovered", () => {
        const css = stylesheet("notepad.css");
        expect(css).toContain("outline: 4px solid var(--line-noted); outline-offset: -4px;");
        expect(css).toContain(".is-noted.is-noted.is-noted:is(:hover, :focus, :focus-visible, :focus-within, .is-noted-hot) { outline-offset: 0; }");
        expect(css).toContain(".is-noted.is-noted.is-noted:is(:hover, .is-noted-hot):not(:focus, :focus-within):not(:disabled) { box-shadow: 0 0 16px 4px var(--glow-noted); }");
    });

});

describe("what can be clicked in the Notepad", () => {

    it("gives a note a field's hover, and its × the app's one remove button", () => {
        const css = stylesheet("notepad.css");
        expect(css).toContain(".notepad-note:hover { border-color: var(--line-primary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--glow-color) 18%, transparent); }");
        expect(css).not.toMatch(/.notepad-note-remove[,:{ ]/);
        // "Link a field": only its underline thickens.
        expect(css).toContain(".notepad-text-button:hover { text-decoration-thickness: 2px; }");
        expect(stylesheet("remove-button.css")).toContain(".strategy-box-remove{ width:32px; height:32px;");
    });

});
