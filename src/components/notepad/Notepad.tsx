import { KeyboardEvent, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";

import { NotepadService, type Note, type NoteLink } from "../../services/NotepadService";
import { OrganizationService } from "../../services/OrganizationService";
import { parseFieldKey, registeredFields } from "../../framework/engine/FieldKeys";
import { consumeKey } from "../interview/consumeKey";

import "../../styles/notepad.css";

/*
    THE NOTEPAD (NotepadService.ts): the header's "Notes" button, the
    panel it opens on the right, and picking a field or card to link.

    The panel docks: from 1200px wide the page narrows to make room for
    it (\`html.notepad-docked\`, notepad.css), so it never covers the
    page's content column; narrower, it lies over the page's right edge
    with its close button. It stays open while the person works, from
    page to page, until closed (its ×, the button, or Escape).
*/

/** The notepad's notes and view, kept current. */
function useNotepad() {
    const version = useSyncExternalStore(
        NotepadService.subscribe,
        () => NotepadService.notes().length + ":" + JSON.stringify(NotepadService.view()) + ":" + NotepadService.notes().map(note => note.text.length + "/" + note.links.length).join(",")
    );
    void version;
    return { notes: NotepadService.notes(), view: NotepadService.view() };
}

/* The places module reads every System's Framework: loaded when the
   notepad first needs it, never with the page that shows the button. */
type Places = typeof import("./notepadPlaces");
let placesModule: Promise<Places> | null = null;
function places(): Promise<Places> {
    placesModule ??= import("./notepadPlaces");
    return placesModule;
}

const DOCK_FROM = 1200;

/** The header button: icon and word (icon alone when narrow), and how many notes there are. */
export function NotepadButton() {

    const { notes, view } = useNotepad();

    return (
        <button
            type="button"
            className="notepad-button"
            aria-expanded={view.open}
            aria-label={"Notes, " + notes.length + (notes.length === 1 ? " note" : " notes")}
            onClick={() => NotepadService.toggle()}
        >
            <svg className="notepad-button-icon" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 2.5h7.5L16 6v11.5H5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M7.5 9h6M7.5 12h6M7.5 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="notepad-button-word">Notes</span>
            {notes.length > 0 && <span className="notepad-button-count">{notes.length}</span>}
        </button>
    );

}

/** A box that grows with what is in it, for a note. */
function NoteText({ note, onKey, textRef }: {
    note: Note;
    onKey: (event: KeyboardEvent<HTMLTextAreaElement>, element: HTMLTextAreaElement) => boolean;
    textRef: (element: HTMLTextAreaElement | null) => void;
}) {

    const element = useRef<HTMLTextAreaElement | null>(null);

    useLayoutEffect(() => {
        const box = element.current;
        if (!box) {
            return;
        }
        box.style.height = "";
        if (box.scrollHeight > box.clientHeight) {
            box.style.height = (box.scrollHeight + box.offsetHeight - box.clientHeight) + "px";
        }
    }, [note.text]);

    return (
        <textarea
            ref={(box) => { element.current = box; textRef(box); }}
            className="interview-input notepad-note-text"
            aria-label="Note"
            placeholder="Write a note. Type # to link a place."
            rows={2}
            value={note.text}
            onChange={(event) => NotepadService.setText(note.id, event.target.value)}
            onKeyDown={(event) => {
                if (onKey(event, event.currentTarget)) {
                    consumeKey(event);
                }
            }}
        />
    );

}

/** "#query" just before the caret, if the person is naming a place. */
function hashQuery(box: HTMLTextAreaElement): { query: string; start: number } | null {
    const before = box.value.slice(0, box.selectionStart ?? box.value.length);
    const match = /(^|\s)#([^#\n]{0,40})$/.exec(before);
    return match ? { query: match[2], start: before.length - match[2].length - 1 } : null;
}

function NoteCard({ note, focused }: { note: Note; focused: boolean }) {

    const navigate = useNavigate();
    const [confirming, setConfirming] = useState(false);
    const [suggestions, setSuggestions] = useState<Awaited<ReturnType<Places["findPlaces"]>> | null>(null);
    const [active, setActive] = useState(0);
    const [available, setAvailable] = useState<Record<string, boolean>>({});
    const box = useRef<HTMLTextAreaElement | null>(null);
    const card = useRef<HTMLDivElement | null>(null);
    const organizationId = OrganizationService.getSelected();

    useEffect(() => {
        if (focused && typeof card.current?.scrollIntoView === "function") {
            card.current.scrollIntoView({ block: "nearest" });
        }
    }, [focused]);

    useEffect(() => {
        let live = true;
        places().then(module => {
            if (live) {
                setAvailable(Object.fromEntries(note.links.map(link => [link.id, module.linkAvailable(link)])));
            }
        });
        return () => { live = false; };
    }, [note.links]);

    function refresh(element: HTMLTextAreaElement) {
        const found = hashQuery(element);
        if (!found || !organizationId) {
            setSuggestions(null);
            return;
        }
        places().then(module => {
            setSuggestions(module.findPlaces(organizationId, found.query));
            setActive(0);
        });
    }

    function choose(index: number) {
        const element = box.current;
        const place = suggestions?.[index];
        if (!element || !place) {
            return;
        }
        const found = hashQuery(element);
        if (found) {
            // The "#name" typed becomes the chip: out of the text.
            const caret = element.selectionStart ?? element.value.length;
            NotepadService.setText(note.id, (element.value.slice(0, found.start) + element.value.slice(caret)).replace(/\s+$/, (tail) => tail.includes("\n") ? "\n" : ""));
        }
        NotepadService.addLink(note.id, place);
        setSuggestions(null);
        element.focus();
    }

    function onKey(event: KeyboardEvent<HTMLTextAreaElement>, element: HTMLTextAreaElement): boolean {
        if (suggestions && suggestions.length > 0) {
            if (event.key === "ArrowDown") {
                setActive(index => (index + 1) % suggestions.length);
                return true;
            }
            if (event.key === "ArrowUp") {
                setActive(index => (index - 1 + suggestions.length) % suggestions.length);
                return true;
            }
            if (event.key === "Enter" || event.key === "Tab") {
                choose(active);
                return true;
            }
        }
        if (event.key === "Escape" && suggestions) {
            setSuggestions(null);
            return true;
        }
        window.setTimeout(() => refresh(element), 0);
        return false;
    }

    const picking = NotepadService.view().pickingFor === note.id;

    return (
        <div className={"notepad-note" + (focused ? " notepad-note-focus" : "")} ref={card}>

            <NoteText note={note} onKey={onKey} textRef={(element) => { box.current = element; }} />

            {suggestions && (
                <ul className="notepad-suggestions" role="listbox" aria-label="Places to link">
                    {suggestions.length === 0 && <li className="notepad-suggestion-empty">No place by that name</li>}
                    {suggestions.map((place, index) => (
                        <li key={place.kind + (place.key ?? place.sectionNumber ?? place.systemNumber)} role="option" aria-selected={index === active}>
                            <button
                                type="button"
                                className="notepad-suggestion"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => choose(index)}
                            >
                                <span className="notepad-suggestion-label">#{place.label}</span>
                                {place.place && <span className="notepad-suggestion-place">{place.place}</span>}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {note.links.length > 0 && (
                <ul className="notepad-chips" aria-label="Linked places">
                    {note.links.map(link => (
                        <li key={link.id} className={"notepad-chip" + (available[link.id] === false ? " notepad-chip-gone" : "")}>
                            <button
                                type="button"
                                className="notepad-chip-open"
                                title={link.place || undefined}
                                disabled={available[link.id] === false}
                                onClick={() => places().then(module => module.openLink(navigate, link))}
                            >
                                #{link.label}
                                {available[link.id] === false && <span className="notepad-chip-gone-word"> · No longer available</span>}
                            </button>
                            <button
                                type="button"
                                className="notepad-chip-remove"
                                aria-label={"Remove link " + link.label}
                                onClick={() => NotepadService.removeLink(note.id, link.id)}
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="notepad-note-actions">
                <button
                    type="button"
                    className="notepad-text-button"
                    aria-pressed={picking}
                    onClick={() => NotepadService.pick(picking ? null : note.id)}
                >
                    {picking ? "Picking: click a field or card" : "Link a field"}
                </button>
                {confirming
                    ? (
                        <button
                            type="button"
                            className="notepad-text-button notepad-delete-confirm"
                            autoFocus
                            onBlur={() => setConfirming(false)}
                            onClick={() => {
                                // TODO(C1): switch this confirmation to the undo toast.
                                NotepadService.removeNote(note.id);
                            }}
                        >
                            Delete note?
                        </button>
                    )
                    : (
                        <button
                            type="button"
                            className="notepad-note-remove"
                            aria-label="Delete note"
                            onClick={() => setConfirming(true)}
                        >
                            ×
                        </button>
                    )}
            </div>

        </div>
    );

}

/** The panel: every note, newest first, with its links. */
export function NotepadPanel() {

    const { notes, view } = useNotepad();
    const panel = useRef<HTMLElement | null>(null);
    const [wide, setWide] = useState(() => typeof window !== "undefined" && window.innerWidth >= DOCK_FROM);

    useEffect(() => {
        const onResize = () => setWide(window.innerWidth >= DOCK_FROM);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // Docked, the page makes room for it.
    useEffect(() => {
        document.documentElement.classList.toggle("notepad-docked", view.open && wide);
        return () => document.documentElement.classList.remove("notepad-docked");
    }, [view.open, wide]);

    // Escape closes it -- and only it: the key goes no further.
    useEffect(() => {
        if (!view.open) {
            return;
        }
        function onKey(event: globalThis.KeyboardEvent) {
            if (event.key === "Escape" && !NotepadService.view().pickingFor) {
                consumeKey(event);
                NotepadService.close();
            }
        }
        window.addEventListener("keydown", onKey, true);
        return () => window.removeEventListener("keydown", onKey, true);
    }, [view.open]);

    if (!view.open) {
        return null;
    }

    return (
        <aside className="notepad-panel" aria-label="Notes" ref={panel}>

            <div className="notepad-head">
                <h2 className="notepad-title">Notes</h2>
                <button
                    type="button"
                    className="strategy-add-button notepad-add"
                    onClick={() => {
                        NotepadService.addNote();
                        window.setTimeout(() => panel.current?.querySelector<HTMLTextAreaElement>(".notepad-note-text")?.focus(), 0);
                    }}
                >
                    + Add note
                </button>
                <button
                    type="button"
                    className="notepad-close"
                    aria-label="Close notes"
                    onClick={() => NotepadService.close()}
                >
                    ×
                </button>
            </div>

            {notes.length === 0
                ? <p className="notepad-empty">No notes yet. Add one, and link it to any page, card or field.</p>
                : (
                    <div className="notepad-list">
                        {notes.map(note => (
                            <NoteCard key={note.id} note={note} focused={view.focusNoteIds.includes(note.id)} />
                        ))}
                    </div>
                )}

        </aside>
    );

}

/** The cards around an element, innermost first, inside its page section (as FieldMark finds them). */
function anchorsOf(element: HTMLElement): string[] {
    const rail = element.closest<HTMLElement>("[data-rail]");
    const anchors: string[] = [];
    for (let at: HTMLElement | null = element.closest<HTMLElement>("[data-anchor]"); at; at = at.parentElement?.closest<HTMLElement>("[data-anchor]") ?? null) {
        if (rail && (at === rail || !rail.contains(at))) {
            break;
        }
        const token = (at.dataset.anchor ?? "").split(/\s+/)[0];
        if (token) {
            anchors.push(token);
        }
    }
    return anchors;
}

/** What a picked field or card becomes as a link. */
export function linkFor(element: HTMLElement, organizationId: string): Omit<NoteLink, "id"> | null {
    const key = element.dataset.fieldKey;
    const address = key ? parseFieldKey(key) : null;
    if (!key || !address) {
        return null;
    }
    const entry = registeredFields().find(candidate => candidate.key === key);
    const anchors = anchorsOf(element);
    return {
        organizationId,
        kind: "field",
        systemNumber: address.systemNumber,
        sectionNumber: address.sectionNumber,
        key,
        ...(anchors.length > 0 ? { anchors } : {}),
        label: entry?.label ?? (element.querySelector(".field-label")?.textContent?.trim() || key),
        place: entry?.pageTitle ?? ""
    };
}

/**
 * PICKING A FIELD OR CARD: while a note waits for one, a banner says
 * so, the fields and cards that can be linked light up under the
 * pointer, and a click links the one under it -- and edits nothing:
 * the click (and the press before it) goes no further. Escape
 * cancels.
 */
export function NotepadPicker() {

    const { view } = useNotepad();
    const noteId = view.pickingFor;

    useEffect(() => {

        if (!noteId) {
            return;
        }

        const root = document.documentElement;
        root.classList.add("notepad-picking");
        let hovered: HTMLElement | null = null;

        const target = (event: Event): HTMLElement | null => {
            const element = event.target as HTMLElement | null;
            if (!element || element.closest(".notepad-panel, .notepad-pick-banner")) {
                return null;
            }
            return element.closest<HTMLElement>("[data-field-key]");
        };

        const onOver = (event: MouseEvent) => {
            const next = target(event);
            if (next !== hovered) {
                hovered?.removeAttribute("data-pick-hover");
                hovered = next;
                hovered?.setAttribute("data-pick-hover", "");
            }
        };

        const onPress = (event: MouseEvent) => {
            if (target(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        const onClick = (event: MouseEvent) => {
            const element = target(event);
            if (!element) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            const organizationId = OrganizationService.getSelected();
            const link = organizationId ? linkFor(element, organizationId) : null;
            if (link) {
                NotepadService.addLink(noteId, link);
            }
            NotepadService.pick(null);
        };

        const onKey = (event: globalThis.KeyboardEvent) => {
            if (event.key === "Escape") {
                consumeKey(event);
                NotepadService.pick(null);
            }
        };

        document.addEventListener("mouseover", onOver, true);
        document.addEventListener("mousedown", onPress, true);
        document.addEventListener("click", onClick, true);
        window.addEventListener("keydown", onKey, true);

        return () => {
            root.classList.remove("notepad-picking");
            hovered?.removeAttribute("data-pick-hover");
            document.removeEventListener("mouseover", onOver, true);
            document.removeEventListener("mousedown", onPress, true);
            document.removeEventListener("click", onClick, true);
            window.removeEventListener("keydown", onKey, true);
        };

    }, [noteId]);

    if (!noteId) {
        return null;
    }

    return (
        <div className="notepad-pick-banner" role="status">
            Click a field or card to link it · Esc to cancel
        </div>
    );

}

/** The marker a field shows when a note links to it: opens the notepad at those notes. */
export function useNotesAt(key: string | null, organizationId: string | null): Note[] {
    useNotepad();
    return key && organizationId ? NotepadService.notesLinking(organizationId, key) : [];
}

/** Every link in the notepad to an Organization (for tests and the Review page). */
export function linksOf(organizationId: string): NoteLink[] {
    return NotepadService.notes().flatMap(note => note.links.filter(link => link.organizationId === organizationId));
}
