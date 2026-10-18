import { KeyboardEvent, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import TickBox from "../TickBox.tsx";
import RemoveButton from "../RemoveButton.tsx";
import { useNavigate } from "react-router-dom";

import { NotepadService, type Note, type NoteLink } from "../../services/NotepadService";
import { UndoService } from "../../services/UndoService";
import { markFieldsHot } from "./NotedHover";
import { OrganizationService } from "../../services/OrganizationService";
import { CardNotesService } from "../../services/CardNotesService";
import ResponsibilityFilter from "../interview/ResponsibilityFilter.tsx";
import { parseFieldKey, registeredFields } from "../../framework/engine/FieldKeys";
import { consumeKey } from "../interview/consumeKey";
import DateCellInput, { isoToDisplay } from "../interview/DateCellInput";
import { PreferencesService } from "../../services/PreferencesService";

import "../../styles/notepad.css";
import TextLink from "../interview/TextLink.tsx";

/*
    THE NOTEPAD (NotepadService.ts): the header's "Notes" button, the
    panel it opens on the right, and picking a field or card to link.

    The panel slides in from the right OVER the page, between the
    header and the footer: the page does not narrow or move under it,
    and stays clickable -- a field is linked by clicking it -- so a
    click on the page never closes it. It stays open while the person
    works, from page to page, until closed (its ×, the Notes button,
    or Escape).
*/

/** The notepad's notes and view, kept current. */
function useNotepad() {
    const version = useSyncExternalStore(
        NotepadService.subscribe,
        () => NotepadService.notes().length + ":" + JSON.stringify(NotepadService.view()) + ":" + NotepadService.notes().map(note => note.text.length + "/" + note.links.length + "/" + (note.date ?? "")).join(",")
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


/** The header button: icon and word (icon alone when narrow), and how many notes there are. */
export function NotepadButton() {

    const { notes, view } = useNotepad();

    return (
        <button
            type="button"
            className="header-tool"
            aria-expanded={view.open}
            aria-label={"Notes, " + notes.length + (notes.length === 1 ? " note" : " notes")}
            onClick={() => NotepadService.toggle()}
        >
            <svg className="header-tool-icon" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M5 2.5h7.5L16 6v11.5H5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M7.5 9h6M7.5 12h6M7.5 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="header-tool-word">Notes</span>
            {notes.length > 0 && <span className="header-tool-count">{notes.length}</span>}
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

/** A moment as the app writes dates (the user's presentation) and the hour: "12/03/2027 14:05". */
export function noteMomentText(moment: number | Date): string {
    const at = new Date(moment);
    const two = (n: number) => String(n).padStart(2, "0");
    const iso = at.getFullYear() + "-" + two(at.getMonth() + 1) + "-" + two(at.getDate());
    return isoToDisplay(iso, PreferencesService.getDateFormat()) + " " + two(at.getHours()) + ":" + two(at.getMinutes());
}

/** Today, written as the app writes dates. */
export function noteTodayText(now = new Date()): string {
    return noteMomentText(now).split(" ")[0];
}

/** "#query" just before the caret, if the person is naming a place. */
function hashQuery(box: HTMLTextAreaElement): { query: string; start: number } | null {
    const before = box.value.slice(0, box.selectionStart ?? box.value.length);
    const match = /(^|\s)#([^#\n]{0,40})$/.exec(before);
    return match ? { query: match[2], start: before.length - match[2].length - 1 } : null;
}

function NoteCard({ note, focused }: { note: Note; focused: boolean }) {

    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState<Awaited<ReturnType<Places["findPlaces"]>> | null>(null);
    const [active, setActive] = useState(0);
    const [available, setAvailable] = useState<Record<string, boolean>>({});
    // What each link's chip says, worked out from its key (linkDetail).
    const [details, setDetails] = useState<Record<string, { number: string; name: string }>>({});
    const box = useRef<HTMLTextAreaElement | null>(null);
    const card = useRef<HTMLDivElement | null>(null);
    // A note links only into the Organization it belongs to.
    const organizationId = note.organizationId || null;
    const current = OrganizationService.getSelected();

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
                setDetails(Object.fromEntries(note.links.map(link => [link.id, module.linkDetail(link)])));
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
    // Gone while pointed at: nothing stays marked on the page.
    useEffect(() => () => markFieldsHot([]), []);

    // The fields and cards it links to in the open Organization.
    const linkedKeys = note.links
        .filter(link => link.organizationId === current && link.key)
        .map(link => link.key as string);
    // Fields can be picked only in the note's own Organization, while it is open.
    const canPick = !!organizationId && organizationId === current;
    const organizationName = (id: string) => OrganizationService.getSummary(id)?.name ?? "another organization";

    return (
        <div
            className={"notepad-note" + (focused ? " notepad-note-focus" : "")}
            ref={card}
            data-note-id={note.id}
            // Pointed at, the fields and cards it links to are marked on the page (NotedHover.tsx).
            onMouseEnter={() => markFieldsHot(linkedKeys)}
            onMouseLeave={() => markFieldsHot([])}
            onFocus={() => markFieldsHot(linkedKeys)}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    markFieldsHot([]);
                }
            }}
        >

            {/* Above the text, at the right: when the note was written (automatic, read-only), then the note's ×. At once, and the undo toast offers it back; an empty note just goes. */}
            <div className="notepad-note-top">
                {note.createdAt > 0 && <p className="notepad-note-recorded">{"Recorded " + noteMomentText(note.createdAt)}</p>}
                <RemoveButton className="card-remove notepad-note-remove"
                    aria-label="Delete note"
                    onClick={() => {
                        const removed = NotepadService.removeNote(note.id);
                        if (removed && (removed.note.text.trim() !== "" || removed.note.links.length > 0)) {
                            UndoService.offer("Note removed.", () => NotepadService.restoreNote(removed.note, removed.index));
                        }
                    }}
                />
            </div>

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
                        <li
                            key={link.id}
                            className={"notepad-chip" + (available[link.id] === false ? " notepad-chip-gone" : "")}
                            data-link-key={link.key}
                            data-link-organization={link.organizationId}
                            // A link alone marks only its own field.
                            onMouseEnter={() => markFieldsHot(link.key && link.organizationId === current ? [link.key] : [])}
                            onMouseLeave={() => markFieldsHot(linkedKeys)}
                        >
                            <button
                                type="button"
                                className="notepad-chip-open"
                                title={link.place || undefined}
                                disabled={available[link.id] === false}
                                onClick={() => places().then(module => module.openLink(navigate, link))}
                            >
                                {/* "#" and where it is in numbers; under it, the field's own name. */}
                                <span className="notepad-chip-tag">
                                    # <span className="notepad-chip-number">{details[link.id]?.number ?? linkNumber(link)}</span>
                                </span>
                                <span className="notepad-chip-description">
                                    {details[link.id]?.name ?? ""}
                                    {link.organizationId !== note.organizationId && (
                                        <span className="notepad-chip-organization"> · {organizationName(link.organizationId)}</span>
                                    )}
                                    {available[link.id] === false && <span className="notepad-chip-gone-word"> · No longer available</span>}
                                </span>
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
                <div className="notepad-note-actions-text">
                {canPick
                    ? (
                        <TextLink
                            type="button"
                            className="notepad-text-button"
                            aria-pressed={picking}
                            onClick={() => NotepadService.pick(picking ? null : note.id)}
                        >
                            {picking ? "Picking: click a field or card" : "Link a field"}
                        </TextLink>
                    )
                    : null}
                {/* The Date: a tick; ticked, its label becomes the day to pick, and the note stands on that day of the Calendar. */}
                <span className="notepad-date">
                    <TickBox
                        aria-label="Date"
                        checked={!!note.date}
                        onChange={(event) => {
                            const now = new Date();
                            const two = (n: number) => String(n).padStart(2, "0");
                            NotepadService.setDate(note.id, event.target.checked ? now.getFullYear() + "-" + two(now.getMonth() + 1) + "-" + two(now.getDate()) : "");
                        }}
                    />
                    {note.date
                        ? <DateCellInput ariaLabel="Note date" value={note.date} onChange={(next) => NotepadService.setDate(note.id, next)} />
                        : <span className="notepad-date-label">Date</span>}
                </span>
                </div>
            </div>

        </div>
    );

}

interface NoteGroupValue {
    /** The Organization's id, or "" for General. */
    id: string;
    name: string;
    notes: Note[];
    current: boolean;
}

/**
 * The notes by the Organization they were written in: the open one
 * first, the others after in the Organizations' order, then General
 * (written with none open).
 */
function noteGroups(notes: Note[]): NoteGroupValue[] {
    const current = OrganizationService.getSelected() ?? "";
    const known = OrganizationService.list();
    const ids = [...new Set(notes.map(note => note.organizationId))];
    const rank = (id: string) => id === current ? -1 : id === "" ? known.length + 1 : Math.max(0, known.findIndex(entry => entry.id === id));
    return ids.sort((one, other) => rank(one) - rank(other)).map(id => ({
        id,
        name: id === "" ? "General" : OrganizationService.getSummary(id)?.name ?? "An Organization no longer here",
        notes: notes.filter(note => note.organizationId === id),
        current: id === current && id !== ""
    }));
}

/** One Organization's notes: open when it is the open one, folded otherwise, with its count. */
function NoteGroup({ group, focusNoteIds }: { group: NoteGroupValue; focusNoteIds: string[] }) {
    const focused = group.notes.some(note => focusNoteIds.includes(note.id));
    const [open, setOpen] = useState(group.current || focused);
    const id = "notepad-group-" + (group.id || "general");
    return (
        <section className="notepad-group" aria-label={group.name}>
            <button
                type="button"
                className="notepad-group-head"
                aria-expanded={open}
                aria-controls={id}
                onClick={() => setOpen(current => !current)}
            >
                <span className="notepad-group-name">{group.name}</span>
                <span className="notepad-group-count">{group.notes.length}</span>
            </button>
            {open && (
                <div className="notepad-group-notes" id={id}>
                    {group.notes.map(note => (
                        <NoteCard key={note.id} note={note} focused={focusNoteIds.includes(note.id)} />
                    ))}
                </div>
            )}
        </section>
    );
}

/** The panel: every note, newest first, by Organization, with its links. */
export function NotepadPanel() {

    const { notes, view } = useNotepad();
    const panel = useRef<HTMLElement | null>(null);
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
                        NotepadService.addNote(OrganizationService.getSelected() ?? "");
                        window.setTimeout(() => panel.current?.querySelector<HTMLTextAreaElement>(".notepad-note-text")?.focus(), 0);
                    }}
                >
                    + Add note
                </button>
                <button
                    type="button"
                    className="notepad-close"
                    aria-label="Close notes"
                    title="Fold the notes away"
                    onClick={() => NotepadService.close()}
                >
                    ▸
                </button>
            </div>

            {/* ONE scrolling column, padded as every card is: the card notes, then the notes of each Organization. */}
            <div className="notepad-list">
                <CardNotes />
                {notes.length === 0
                    ? <p className="notepad-empty">No notes yet. Add one, and link it to any page, card or field.</p>
                    : noteGroups(notes).map(group => (
                        <NoteGroup key={group.id || "general"} group={group} focusNoteIds={view.focusNoteIds} />
                    ))}
            </div>

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

/** Where a link is, in numbers, until its section is known (linkDetail): its System and page. */
function linkNumber(link: NoteLink): string {
    return [link.systemNumber, link.sectionNumber].filter(part => part !== undefined).join(".");
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

/** The event a card is asked for by (SectionTiles.tsx, OPEN_EVENT): the same string, so this file need not import the tiles. */
const OPEN_CARD_EVENT = "section-tiles:open";

/**
 * THE CARD NOTES: the Notes text of every card of the organization, one row each (the card's name, the page it stands on, the text), under a funnel that chooses
 * which pages to show. A press opens the card on its page.
 */
function CardNotes() {

    const organizationId = OrganizationService.getSelected() ?? "";
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [off, setOff] = useState<ReadonlySet<string>>(new Set());
    const all = useMemo(() => organizationId ? CardNotesService.collect(organizationId) : [], [organizationId, open]);
    const pages = [...new Set(all.map(note => note.page))];
    const shown = all.filter(note => !off.has(note.page));

    if (all.length === 0) {
        return null;
    }

    return (
        <section className="notepad-group notepad-card-notes" aria-label="Card notes">
            <div className="notepad-card-notes-head">
                <button type="button" className="notepad-group-head" aria-expanded={open} onClick={() => setOpen(current => !current)}>
                    <span className="notepad-group-name">Card notes</span>
                    <span className="notepad-group-count">{shown.length}</span>
                </button>
                {open && pages.length > 1 && (
                    <ResponsibilityFilter
                        off={off}
                        options={pages}
                        label="Choose the pages whose card notes show"
                        onToggle={(page) => setOff(current => { const next = new Set(current); if (!next.delete(page)) { next.add(page); } return next; })}
                    />
                )}
            </div>
            {open && (
                <div className="notepad-group-notes">
                    {shown.map(note => (
                        <button
                            key={note.cardId}
                            type="button"
                            className="notepad-card-note"
                            title={"Open " + note.name}
                            onClick={() => places().then(module => {
                                module.openLink(navigate, { organizationId, kind: "page", systemNumber: note.systemNumber, sectionNumber: note.sectionNumber, label: note.page, place: "", id: note.cardId });
                                window.setTimeout(() => document.dispatchEvent(new CustomEvent(OPEN_CARD_EVENT, { detail: { card: note.cardId } })), 900);
                            })}
                        >
                            <span className="notepad-card-note-name">{note.name}</span>
                            <span className="notepad-card-note-page">{note.page}</span>
                            <span className="notepad-card-note-text">{note.text}</span>
                        </button>
                    ))}
                </div>
            )}
        </section>
    );

}
