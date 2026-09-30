import type { FieldKey } from "../framework/engine/FieldKeys";

/*
    THE NOTEPAD: the person's own notes, kept apart from any
    Organization -- not in its document, not in its export. Each note
    is free text with zero or more LINKS, and each link names the
    Organization it belongs to, so one notepad works across them all.

    Kept behind NotepadStore, like the Organizations behind
    OrganizationStore: the local store keeps one notepad per user
    profile in localStorage (the app has one user today, the "default"
    profile); a server-backed store would replace it and nothing else.
*/

/** Where a link leads: a whole System, one page of it, or a section, card or field on a page. */
export type NoteLinkKind = "system" | "page" | "field";

export interface NoteLink {
    id: string;
    organizationId: string;
    kind: NoteLinkKind;
    systemNumber: number;
    /** The page (a Section number); absent for a System. */
    sectionNumber?: number;
    /** The section, card or field (FieldKeys.ts); absent for a System or a page. */
    key?: FieldKey;
    /** The cards to unfold on the way, innermost first (see focusField). */
    anchors?: string[];
    /** What the chip says ("Market Size & Industry Outlook"). */
    label: string;
    /** Where it is, in words ("3. Business System → 1. Foundation"). */
    place: string;
    /**
     * Where it is, in numbers: System, page, section, then each card
     * on the way ("3.5.1.2"), as the page showed them when linked.
     */
    number?: string;
}

export interface Note {
    id: string;
    /**
     * The Organization it was written in, and whose places it links
     * to; "" for a note written with none open ("General").
     */
    organizationId: string;
    text: string;
    links: NoteLink[];
    /** When it was written (ms since the epoch): the notepad lists newest first. */
    createdAt: number;
}

export interface NotepadDocument {
    version: 1;
    notes: Note[];
}

/** Where a notepad is kept (see LocalNotepadStore). */
export interface NotepadStore {
    load(profileId: string): NotepadDocument;
    save(profileId: string, document: NotepadDocument): void;
}

const EMPTY: NotepadDocument = { version: 1, notes: [] };

function asNotepad(value: unknown): NotepadDocument {
    if (!value || typeof value !== "object" || !Array.isArray((value as NotepadDocument).notes)) {
        return { ...EMPTY, notes: [] };
    }
    const notes = (value as NotepadDocument).notes
        .filter(note => note && typeof note.id === "string")
        .map(note => ({
            id: note.id,
            // Older notes: the Organization their first link is in.
            organizationId: typeof note.organizationId === "string"
                ? note.organizationId
                : (Array.isArray(note.links) && typeof note.links[0]?.organizationId === "string" ? note.links[0].organizationId : ""),
            text: typeof note.text === "string" ? note.text : "",
            createdAt: typeof note.createdAt === "number" ? note.createdAt : 0,
            links: Array.isArray(note.links)
                ? note.links.filter(link => link && typeof link.organizationId === "string" && typeof link.systemNumber === "number")
                : []
        }));
    return { version: 1, notes };
}

/** One notepad per user profile, in localStorage. */
export const LocalNotepadStore: NotepadStore = {

    load(profileId: string): NotepadDocument {
        try {
            const raw = localStorage.getItem(notepadStorageKey(profileId));
            return raw ? asNotepad(JSON.parse(raw)) : { ...EMPTY, notes: [] };
        } catch {
            return { ...EMPTY, notes: [] };
        }
    },

    save(profileId: string, document: NotepadDocument): void {
        try {
            localStorage.setItem(notepadStorageKey(profileId), JSON.stringify(document));
        } catch {
            // Storage full or unavailable: the notes stay in memory for
            // this session; nothing else is lost.
        }
    }

};

/** The localStorage key of a profile's notepad. */
export function notepadStorageKey(profileId: string): string {
    return "northstardust-notepad-" + profileId;
}

/** The one profile the app has today. */
export const DEFAULT_PROFILE = "default";

type Listener = () => void;

let store: NotepadStore = LocalNotepadStore;
let profileId = DEFAULT_PROFILE;
let cache: NotepadDocument | null = null;
const listeners = new Set<Listener>();

/** What the panel shows: open or not, which note to bring into view, and picking a field. */
export interface NotepadView {
    open: boolean;
    /** Notes to scroll to and mark (those linking to a field whose marker was pressed). */
    focusNoteIds: string[];
    /** A note waiting for a field or card to be clicked, to link it. */
    pickingFor: string | null;
}

let view: NotepadView = { open: false, focusNoteIds: [], pickingFor: null };

function read(): NotepadDocument {
    if (!cache) {
        cache = store.load(profileId);
    }
    return cache;
}

function write(next: NotepadDocument): void {
    cache = next;
    store.save(profileId, next);
    listeners.forEach(listener => listener());
}

function setView(patch: Partial<NotepadView>): void {
    view = { ...view, ...patch };
    listeners.forEach(listener => listener());
}

function newId(prefix: string): string {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

function changeNote(noteId: string, change: (note: Note) => Note): void {
    const document = read();
    write({ ...document, notes: document.notes.map(note => note.id === noteId ? change(note) : note) });
}

/** Whether a link leads to `key` in `organizationId`: the field itself, or a place holding it. */
function linksTo(link: NoteLink, organizationId: string, key: FieldKey): boolean {
    return link.organizationId === organizationId && link.key === key;
}

export const NotepadService = {

    /** For tests: another store and profile, and a fresh start. */
    use(nextStore: NotepadStore, nextProfile = DEFAULT_PROFILE): void {
        store = nextStore;
        profileId = nextProfile;
        cache = null;
        view = { open: false, focusNoteIds: [], pickingFor: null };
    },

    /** Every note, newest first. */
    notes(): Note[] {
        // Newest first; two written in the same moment, the later first.
        return read().notes.map((note, index) => ({ note, index }))
            .sort((one, other) => other.note.createdAt - one.note.createdAt || other.index - one.index)
            .map(entry => entry.note);
    },

    count(): number {
        return read().notes.length;
    },

    /** A new, empty note at the top, in an Organization ("" for none); its id. */
    addNote(organizationId = "", links: NoteLink[] = []): string {
        const note: Note = { id: newId("note"), organizationId, text: "", links, createdAt: Date.now() };
        const document = read();
        write({ ...document, notes: [...document.notes, note] });
        return note.id;
    },

    setText(noteId: string, text: string): void {
        changeNote(noteId, note => ({ ...note, text }));
    },

    /** Removes a note; what it was and where, for restoreNote (null when there was none). */
    removeNote(noteId: string): { note: Note; index: number } | null {
        const document = read();
        const index = document.notes.findIndex(note => note.id === noteId);
        write({ ...document, notes: document.notes.filter(note => note.id !== noteId) });
        if (view.pickingFor === noteId) {
            setView({ pickingFor: null });
        }
        return index >= 0 ? { note: document.notes[index], index } : null;
    },

    /** Puts a removed note back where it was, with its id, text and links (once). */
    restoreNote(note: Note, index: number): void {
        const document = read();
        if (document.notes.some(existing => existing.id === note.id)) {
            return;
        }
        const notes = [...document.notes];
        notes.splice(Math.min(index, notes.length), 0, note);
        write({ ...document, notes });
    },

    /** Links a place to a note, once: a place already linked is not added again. */
    addLink(noteId: string, link: Omit<NoteLink, "id">): void {
        changeNote(noteId, note => note.links.some(existing =>
            existing.organizationId === link.organizationId && existing.kind === link.kind &&
            existing.systemNumber === link.systemNumber && existing.sectionNumber === link.sectionNumber &&
            existing.key === link.key)
            ? note
            : { ...note, links: [...note.links, { ...link, id: newId("link") }] });
    },

    removeLink(noteId: string, linkId: string): void {
        changeNote(noteId, note => ({ ...note, links: note.links.filter(link => link.id !== linkId) }));
    },

    /** The notes that link to a field or card of an Organization, newest first. */
    notesLinking(organizationId: string, key: FieldKey): Note[] {
        return NotepadService.notes().filter(note => note.links.some(link => linksTo(link, organizationId, key)));
    },

    view(): NotepadView {
        return view;
    },

    open(focusNoteIds: string[] = []): void {
        setView({ open: true, focusNoteIds });
    },

    close(): void {
        setView({ open: false, focusNoteIds: [], pickingFor: null });
    },

    toggle(): void {
        if (view.open) {
            NotepadService.close();
        } else {
            NotepadService.open();
        }
    },

    /** Starts (or, with null, ends) picking a field or card for a note. */
    pick(noteId: string | null): void {
        setView({ pickingFor: noteId });
    },

    /** Calls `listener` on every change of the notes or the panel; returns the unsubscribe. */
    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }

};
