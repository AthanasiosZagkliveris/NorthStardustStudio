import { RefObject, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { TooltipBox } from "../Tooltip.tsx";

import { NotepadService, type Note } from "../../services/NotepadService";
import { consumeKey } from "../interview/consumeKey";
import { placeTooltip } from "../interview/roadmapTooltip";

/*
    A FIELD IN YOUR NOTES, AND ITS NOTES: pointing at one shows the other.

      - Hovering (or focusing) a noted field or card shows its notes in
        the app's one tooltip (.app-tooltip, as the Roadmap's bars do),
        above it -- or under it where there is no room -- and never
        outside the window; and, with the Notepad open, marks those
        notes and their links there and brings the first into view.
      - Hovering (or focusing) a note or one of its links in the Notepad
        marks the fields and cards it links to on the page.

    "Marked" is the noted stroke stepped outside with its glow
    (.is-noted-hot, notepad.css).
*/

/** The fixed header's and footer's heights: a field under either is out of view. */
const VIEW_TOP = 80;
const VIEW_BOTTOM = 64;

/**
 * The field a noted box stands for, with its label: the box, and the
 * field it answers (label and all) where it has one -- or a card,
 * whose head is its own label row.
 */
function fieldArea(box: HTMLElement): { left: number; right: number; top: number; bottom: number } {
    const field = box.parentElement?.closest<HTMLElement>(".business-foundation-field, .legal-entity-field, .legal-entity-pair, .legal-entity-field-wide, .strategy-metric-field");
    const one = box.getBoundingClientRect();
    if (!field || field.contains(box) === false) {
        return one;
    }
    const other = field.getBoundingClientRect();
    return {
        left: Math.min(one.left, other.left),
        right: Math.max(one.right, other.right),
        top: Math.min(one.top, other.top),
        bottom: Math.max(one.bottom, other.bottom)
    };
}

/** How many notes the tooltip shows before "+N more". */
const TOOLTIP_NOTES = 2;

const HOT = "is-noted-hot";

/** The key of the field or card a noted box stands for. */
export function notedKey(box: Element): string | null {
    return box.closest<HTMLElement>("[data-field-key]")?.dataset.fieldKey ?? null;
}

/** Marks the noted boxes on the page that stand for `keys` (none: clears them). */
export function markFieldsHot(keys: readonly string[]): void {
    for (const element of document.querySelectorAll(".is-noted." + HOT)) {
        element.classList.remove(HOT);
    }
    if (keys.length === 0) {
        return;
    }
    for (const element of document.querySelectorAll(".is-noted")) {
        const key = notedKey(element);
        if (key && keys.includes(key)) {
            element.classList.add(HOT);
        }
    }
}

/** Marks, in the Notepad, the notes linking to `key` and those links (null: clears them); brings the first into view. */
export function markNotesHot(organizationId: string, key: string | null): void {
    const panel = document.querySelector(".notepad-panel");
    for (const element of document.querySelectorAll(".notepad-panel ." + HOT)) {
        element.classList.remove(HOT);
    }
    if (!panel || !key) {
        return;
    }
    let first: HTMLElement | null = null;
    for (const note of panel.querySelectorAll<HTMLElement>("[data-note-id]")) {
        const chips = [...note.querySelectorAll<HTMLElement>("[data-link-key]")]
            .filter(chip => chip.dataset.linkKey === key && chip.dataset.linkOrganization === organizationId);
        if (chips.length > 0) {
            note.classList.add(HOT);
            chips.forEach(chip => chip.classList.add(HOT));
            first ??= note;
        }
    }
    first?.scrollIntoView?.({ block: "nearest" });
}

/** The noted box an event happened in, inside `root`. */
function notedAt(target: EventTarget | null, root: HTMLElement): HTMLElement | null {
    const box = target instanceof Element ? target.closest<HTMLElement>(".is-noted") : null;
    return box && root.contains(box) ? box : null;
}

/**
 * The tooltip and the Notepad marks for the noted fields and cards of
 * one page (`root`, FieldPageProvider's), of `organizationId`.
 */
export function NotedHover({ root, organizationId }: { root: RefObject<HTMLElement | null>; organizationId: string }) {

    const tipId = useId();
    const [shown, setShown] = useState<{ box: HTMLElement; notes: Note[] } | null>(null);
    const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
    const tip = useRef<HTMLDivElement | null>(null);

    useEffect(() => {

        const page = root.current;
        if (!page) {
            return;
        }

        // What the pointer and the focus are on: shown while either is.
        let hovered: HTMLElement | null = null;
        let focused: HTMLElement | null = null;

        const update = () => {
            const box = hovered ?? focused;
            const key = box ? notedKey(box) : null;
            const notes = key ? NotepadService.notesLinking(organizationId, key) : [];
            setShown(previous => {
                if (!box || notes.length === 0) {
                    return null;
                }
                // The same box and notes: the same tooltip, never redrawn.
                if (previous?.box === box && previous.notes.map(note => note.id + note.text).join() === notes.map(note => note.id + note.text).join()) {
                    return previous;
                }
                return { box, notes };
            });
            markNotesHot(organizationId, box && notes.length > 0 ? key : null);
        };

        const onOver = (event: PointerEvent) => {
            const box = notedAt(event.target, page);
            if (box !== hovered) {
                hovered = box;
                update();
            }
        };
        const onLeavePage = (event: PointerEvent) => {
            if (!(event.relatedTarget instanceof Node && page.contains(event.relatedTarget))) {
                hovered = null;
                update();
            }
        };
        const onFocusIn = (event: FocusEvent) => {
            focused = notedAt(event.target, page);
            update();
        };
        const onFocusOut = (event: FocusEvent) => {
            if (!notedAt(event.relatedTarget, page)) {
                focused = null;
                update();
            }
        };
        // Escape puts the tooltip away, and goes no further -- after any
        // popup inside the field has taken it (they stop it on the way,
        // consumeKey), before the page's own Escape (on the window).
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape" && (hovered || focused)) {
                consumeKey(event);
                hovered = null;
                focused = null;
                setShown(null);
                markNotesHot(organizationId, null);
            }
        };

        page.addEventListener("pointerover", onOver);
        page.addEventListener("pointerout", onLeavePage);
        page.addEventListener("focusin", onFocusIn);
        page.addEventListener("focusout", onFocusOut);
        document.addEventListener("keydown", onKey);
        const unsubscribe = NotepadService.subscribe(update);

        return () => {
            page.removeEventListener("pointerover", onOver);
            page.removeEventListener("pointerout", onLeavePage);
            page.removeEventListener("focusin", onFocusIn);
            page.removeEventListener("focusout", onFocusOut);
            document.removeEventListener("keydown", onKey);
            unsubscribe();
            markNotesHot(organizationId, null);
        };

    }, [root, organizationId]);

    // Placed once measured: above the box, or under it, inside the window.
    // Placed above or below the field and its label (placeTooltip, on
    // the side with more room), never over them; again as the page
    // scrolls or the window resizes, so it stays with its field; hidden
    // while the field is out of view (behind the header or the footer).
    useLayoutEffect(() => {
        if (!shown) {
            setPosition(null);
            return;
        }
        const place = () => {
            if (!tip.current) {
                return;
            }
            const anchor = fieldArea(shown.box);
            const box = shown.box.getBoundingClientRect();
            // (No layout at all -- nothing measured -- counts as in view.)
            const laidOut = box.width > 0 || box.height > 0;
            if (laidOut && (box.bottom <= VIEW_TOP || box.top >= window.innerHeight - VIEW_BOTTOM)) {
                setPosition(null);
                return;
            }
            const size = tip.current.getBoundingClientRect();
            setPosition(placeTooltip(anchor, { width: size.width, height: size.height }, { width: window.innerWidth, height: window.innerHeight }, anchor.left, { top: VIEW_TOP, bottom: window.innerHeight - VIEW_BOTTOM }));
        };
        place();
        window.addEventListener("scroll", place, true);
        window.addEventListener("resize", place);
        return () => {
            window.removeEventListener("scroll", place, true);
            window.removeEventListener("resize", place);
        };
    }, [shown]);

    // Described by it, for assistive technology.
    useEffect(() => {
        if (!shown) {
            return;
        }
        const box = shown.box;
        const before = box.getAttribute("aria-describedby");
        box.setAttribute("aria-describedby", before ? before + " " + tipId : tipId);
        return () => {
            if (before) {
                box.setAttribute("aria-describedby", before);
            } else {
                box.removeAttribute("aria-describedby");
            }
        };
    }, [shown, tipId]);

    if (!shown) {
        return null;
    }

    const more = shown.notes.length - TOOLTIP_NOTES;

    return (
        <TooltipBox id={tipId} boxRef={tip} position={position} className="noted-tooltip">
            {shown.notes.slice(0, TOOLTIP_NOTES).map(note => (
                <p key={note.id} className="noted-tooltip-note">{note.text.trim() || "A note with no text yet."}</p>
            ))}
            {more > 0 && <p className="noted-tooltip-more">+{more} more</p>}
        </TooltipBox>
    );

}
