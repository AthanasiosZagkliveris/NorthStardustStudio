import {
    createContext,
    ReactNode,
    RefObject,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from "react";

import { fieldKey, isYesNoPair, registerField, slug, type FieldKey, type FieldKind, type NoneReason } from "../../framework/engine/FieldKeys";
import { fieldKindOf } from "../../framework/engine/FieldKinds";

import FieldStatusLine from "./FieldStatusLine.tsx";
import { NotepadService } from "../../services/NotepadService";
import { useRemovalMarks } from "./removalMarks";
import { NotedHover } from "../notepad/NotedHover";

/*
    EVERY FIELD KNOWS ITS KEY: the shared pieces a label carries.

      <FieldMark label="Legal Form" />      records the field (FieldKeys.ts)
      <FieldStatus label="Legal Form" />    the status line under the label

    Both find their field's key the same way: the page from the
    FieldPageProvider around the page, then -- from where they sit on
    the page -- the section (the nearest `data-rail`) and the card (the
    nearest `data-anchor`), then the label. A column's or a section's
    own heading names its section instead (`section`).

    The field's holder is marked with its key (`data-field-key`), which
    is what opening a field (openField, focusField) and picking one
    look for.

    TO ENABLE ON A PAGE: render the page inside a FieldPageProvider
    (Conversation.tsx does, for every page), and put the two beside a
    label in its shared label component -- as BusinessField, the Legal
    Entity's labels, the column headings and the financial section
    heads do.
*/

interface FieldPageValue {
    organizationId: string;
    systemNumber: number;
    sectionNumber: number;
    pageTitle: string;
}

const FieldPageContext = createContext<FieldPageValue | null>(null);

/** The page every label inside it belongs to. */
export function FieldPageProvider({

    organizationId,

    systemNumber,

    sectionNumber,

    pageTitle,

    children

}: {

    organizationId: string | null;
    systemNumber: number;
    sectionNumber: number;
    pageTitle: string;
    children: ReactNode;

}) {

    const value = useMemo(() => organizationId
        ? { organizationId, systemNumber, sectionNumber, pageTitle }
        : null,
    [organizationId, systemNumber, sectionNumber, pageTitle]);

    const page = useRef<HTMLDivElement | null>(null);

    // Every removal on the page can be undone (removalMarks.ts).
    useRemovalMarks(page);

    // Every control and card on the page gets a key, whether or not a
    // label component marked it (markControls); and what a note in
    // the Notepad links to is drawn so (markNoted).
    useEffect(() => {
        const root = page.current;
        if (!root || !value) {
            return;
        }
        const mark = () => {
            markControls(root, value);
            markNoted(root, value.organizationId);
        };
        mark();
        const observer = new MutationObserver(mark);
        observer.observe(root, { childList: true, subtree: true });
        const unsubscribe = NotepadService.subscribe(() => markNoted(root, value.organizationId));
        return () => {
            observer.disconnect();
            unsubscribe();
        };
    }, [value]);

    return (
        <FieldPageContext.Provider value={value}>
            <div className="field-page" ref={page}>{children}</div>
            {/* A noted field's notes, on hover and focus (NotedHover.tsx). */}
            {value && <NotedHover root={page} organizationId={value.organizationId} />}
        </FieldPageContext.Provider>
    );

}

/** Every control a person answers in (what a note can link to, and openField can focus). */
export const ANSWER_CONTROLS = "input:not([type=hidden]):not([type=file]), textarea, select, .option-picker-trigger, .month-picker-trigger, [contenteditable=true]";

/** The cards a note can link to as a whole. */
const CARDS = ".business-foundation-card, .legal-entity-card, .business-capability-activity, .strategy-theme-box, .strategy-goal-box, .strategy-objective-box, .strategy-metric-box";

/** What a control is called, without the value a picker adds ("Journey Stage 1: Discovery"). */
function controlName(control: HTMLElement): string {
    const name = control.getAttribute("aria-label")
        ?? ((control as HTMLInputElement).labels?.[0] ?? control.closest("label"))?.textContent?.trim()
        ?? control.getAttribute("placeholder") ?? "";
    return control.matches(".option-picker-trigger, .month-picker-trigger") ? name.replace(/:\s[^:]*$/, "") : name;
}

/** The cards around an element, innermost first, inside its page section. */
function anchorsWithin(element: HTMLElement, rail: HTMLElement | null): string[] {
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

/**
 * EVERY CONTROL AND CARD HAS A KEY. A label component marks the field
 * it names (FieldMark); what no label component reaches -- a column's
 * box, a table cell, a line of a list, a card's name -- is marked here,
 * on the control itself, from where it sits: its section, its card and
 * its own accessible name. A card is marked by its section and anchor.
 * So every answer can be linked from a note and opened again.
 */
function markControls(root: HTMLElement, page: FieldPageValue): void {

    for (const card of root.querySelectorAll<HTMLElement>(CARDS)) {
        const anchor = (card.dataset.anchor ?? "").split(/\s+/)[0];
        if (!anchor || card.dataset.fieldKey) {
            continue;
        }
        const rail = card.closest<HTMLElement>("[data-rail]");
        const key = fieldKey({ systemNumber: page.systemNumber, sectionNumber: page.sectionNumber, path: [rail?.dataset.rail, anchor].filter((segment): segment is string => !!segment) });
        const name = card.querySelector<HTMLInputElement>(".strategy-name-input, .card-name-input, input[aria-label$=' name']")?.value.trim()
            || card.querySelector(".strategy-name-static, .strategy-box-number, .card-number")?.textContent?.trim() || anchor;
        card.dataset.fieldKey = key;
        registerField({ key, label: name, pageTitle: page.pageTitle, kind: "answer", anchors: anchorsWithin(card.parentElement ?? card, rail) });
    }

    for (const control of root.querySelectorAll<HTMLElement>(ANSWER_CONTROLS)) {

        const held = control.closest<HTMLElement>("[data-field-key]");
        // Marked already by its label, and not merely by the card around it.
        if (held && !held.matches(CARDS)) {
            continue;
        }

        const name = controlName(control);
        if (!name) {
            continue;
        }

        const rail = control.closest<HTMLElement>("[data-rail]");
        const anchors = anchorsWithin(control, rail);
        // A line with a stable id of its own (a shared channel action) is keyed by it.
        const own = control.dataset.fieldId || slug(name);
        // A column's own box is the column itself.
        const path = [rail?.dataset.rail, anchors[0], rail?.dataset.rail === own && !anchors[0] ? undefined : own]
            .filter((segment): segment is string => !!segment);
        const key = fieldKey({ systemNumber: page.systemNumber, sectionNumber: page.sectionNumber, path });

        if (control.dataset.fieldKey !== key) {
            control.dataset.fieldKey = key;
            registerField({ key, label: name, pageTitle: page.pageTitle, kind: "answer", ...(anchors.length > 0 ? { anchors } : {}) });
        }

    }

}

/** The box a noted field is drawn on: the card itself, or the field's control. */
const NOTED_BOX = "input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea, select, .option-picker-trigger, .month-picker-trigger, [contenteditable=true], .numbered-list-input";

/**
 * IN YOUR NOTES: every field and card a note in the Notepad links to
 * is drawn with a bold orange outline (`.is-noted`, notepad.css) and
 * described to assistive technology as "In your notes". The card's own
 * box, or the field's control (a column's answer box, a list's box).
 */
function markNoted(root: HTMLElement, organizationId: string): void {

    const keys = new Set(NotepadService.notes().flatMap(note => note.links
        .filter(link => link.organizationId === organizationId && link.key)
        .map(link => link.key as string)));

    const noted = new Set<HTMLElement>();
    for (const holder of root.querySelectorAll<HTMLElement>("[data-field-key]")) {
        if (!keys.has(holder.dataset.fieldKey ?? "") || holder.closest("[hidden]")) {
            continue;
        }
        const box = holder.matches(CARDS) || holder.matches(NOTED_BOX)
            ? holder
            : holder.querySelector<HTMLElement>(NOTED_BOX);
        if (box) {
            noted.add(box);
        }
    }

    for (const element of root.querySelectorAll<HTMLElement>(".is-noted")) {
        if (!noted.has(element)) {
            element.classList.remove("is-noted");
            element.removeAttribute("aria-description");
        }
    }
    for (const element of noted) {
        if (!element.classList.contains("is-noted")) {
            element.classList.add("is-noted");
            element.setAttribute("aria-description", "In your notes");
        }
    }

}

/** The page a field is on, for what it shows about the field. */
export function useFieldPage(): FieldPageValue | null {
    return useContext(FieldPageContext);
}

/**
 * Where a field is, found from where it is drawn.
 *
 *   section   a page section's own heading: the section is the field;
 *   card      a card's head: the card is the field (its section and
 *             its own anchor);
 *   rail      the page section, for a field that sits in none;
 *   anchor    the card, for a field whose card sits outside its
 *             section (a Segment's Description);
 *   keyLabel  the label its key is made from, when the label shown
 *             changes with the answer ("<cost name> amount").
 */
export interface FieldPlace {
    section?: string;
    card?: boolean;
    rail?: string;
    anchor?: string;
    keyLabel?: string;
}

export interface FieldAddressing {
    key: FieldKey | null;
    kind: FieldKind;
    anchors: string[];
    section?: string;
}

/** The elements that hold one field: its label, its control, its status line. */
const HOLDER = ".business-foundation-field, .legal-entity-pair, .legal-entity-field, .legal-entity-field-wide, [data-field-holder]";

/** The field's key and where it is, found from where `ref` sits on the page. */
export function useFieldAddress(
    ref: RefObject<HTMLElement | null>,
    label: string,
    place: FieldPlace,
    /** Records the field in the registry: once per field, by its FieldMark. */
    register = false
): FieldAddressing {

    const context = useContext(FieldPageContext);
    const [found, setFound] = useState<FieldAddressing>({ key: null, kind: "none", anchors: [] });
    const { section, card = false, rail: fallbackRail, anchor, keyLabel } = place;

    useLayoutEffect(() => {

        if (!context || !ref.current) {
            return;
        }

        const element = ref.current;
        const railElement = element.closest<HTMLElement>("[data-rail]");
        const rail = section ?? railElement?.dataset.rail ?? fallbackRail;

        // The cards around it, innermost first, inside its section.
        const anchors: string[] = anchor ? [anchor] : [];
        for (let at = anchor ? null : element.closest<HTMLElement>("[data-anchor]"); at; at = at.parentElement?.closest<HTMLElement>("[data-anchor]") ?? null) {
            // Only cards inside its section: the section itself, and
            // what holds it, are not cards of the field.
            if (railElement && (at === railElement || !railElement.contains(at))) {
                break;
            }
            const token = (at.dataset.anchor ?? "").split(/\s+/)[0];
            if (token) {
                anchors.push(token);
            }
        }

        const path = section
            ? [section]
            : card
                ? [rail, anchors[0]].filter((segment): segment is string => !!segment)
                : [rail, anchors[0], slug(keyLabel ?? label)].filter((segment): segment is string => !!segment);

        const key = fieldKey({ systemNumber: context.systemNumber, sectionNumber: context.sectionNumber, path });

        // Opening the field (focusField) looks for this mark.
        const holder = card
            ? element.closest<HTMLElement>("[data-anchor]") ?? element
            : element.closest<HTMLElement>(HOLDER) ?? element;

        // ONE RULE FOR WHAT A FIELD IS (FieldKinds.ts): what the markup
        // shows for itself -- nothing to answer, a yes or a no, an
        // optional text behind its tick box -- and then the table.
        const shown = section || card ? null : markupKind(holder);
        const { kind, why } = shown
            ? { kind: "none" as const, why: shown }
            : fieldKindOf(context.systemNumber, path, card);

        if (register) {
            holder.dataset.fieldKey = key;
            holder.dataset.fieldType = kind;
            registerField({ key, label, pageTitle: context.pageTitle, kind, ...(why ? { why } : {}), ...(anchors.length > 0 ? { anchors } : {}) });
        }

        setFound(previous => previous.key === key && previous.kind === kind && previous.anchors.join(" ") === anchors.join(" ")
            ? previous
            : { key, kind, anchors, section: rail });

    }, [context, ref, label, section, card, fallbackRail, anchor, keyLabel, register]);

    return found;

}

/**
 * What `holder`'s markup says it is, when that settles it: derived
 * when it holds nothing the person types or chooses in; an optional
 * text opened by its tick box (`data-field-kind`); binary when its
 * one control is a tick box, or a choice of a yes and a no
 * (isYesNoPair). Null when the markup does not settle it.
 */
function markupKind(holder: HTMLElement): NoneReason | null {

    if (holder.dataset.fieldKind === "optional" || holder.closest("[data-field-kind=optional]")) {
        return "optional-tick";
    }

    const controls = [...holder.querySelectorAll<HTMLElement>(
        "input:not([type=hidden]), textarea, select, .option-picker, .month-picker, [contenteditable=true]"
    )].filter(control => !control.closest(".option-picker") || control.matches(".option-picker"));

    if (controls.length === 0) {
        return "derived";
    }

    const only = controls.length === 1 ? controls[0] : null;

    if (only?.matches("input[type=checkbox]")) {
        return "binary";
    }

    if (controls.length === 2 && controls.every(control => control.matches("input[type=radio]"))) {
        return "binary";
    }

    const choices = only?.matches(".option-picker")
        ? [...only.querySelectorAll(".option-picker-sizer")].map(option => option.textContent ?? "")
        : only?.matches("select")
            ? [...(only as HTMLSelectElement).options].filter(option => option.value !== "").map(option => option.text)
            : null;

    // The picker's sizers hold its placeholder too: two choices and a
    // placeholder, or two choices one of which is the placeholder.
    if (choices && (isYesNoPair(choices) || isYesNoPair(choices.slice(1)))) {
        return "binary";
    }

    return null;

}

/**
 * Records the field its label names (FieldKeys.ts) and marks its
 * holder with the key. Draws nothing.
 */
export function FieldMark({ label, ...place }: { label: string } & FieldPlace) {

    const ref = useRef<HTMLSpanElement | null>(null);

    useFieldAddress(ref, label, place, true);

    return <span ref={ref} hidden />;

}

/**
 * The field's status line (FieldStatusLine) under its label: what it
 * waits for, when it is frozen behind another answer (FrozenUntil).
 */
export function FieldStatus({ label, ...place }: { label: string } & FieldPlace) {

    const ref = useRef<HTMLSpanElement | null>(null);
    const [waiting, setWaiting] = useState<string | null>(null);

    useFieldAddress(ref, label, place);

    // Read after every render: the chain it sits in may have just been answered.
    useLayoutEffect(() => {
        const next = ref.current?.closest<HTMLElement>("fieldset[data-waiting]")?.dataset.waiting ?? null;
        setWaiting(previous => previous === next ? previous : next);
    });

    return (
        <span className="field-status" ref={ref}>
            <FieldStatusLine
                label={label}
                waiting={waiting ?? undefined}
            />
        </span>
    );

}

/**
 * CHAINED ANSWERS (FieldDependencies.ts): the fields inside wait for
 * another answer. Until it is given they are frozen -- disabled, as a
 * disabled fieldset disables every control in it -- and each says what
 * it waits for in its status line ("Choose a country first."). What
 * they hold is kept. Draws no box of its own: the fields lay out as if
 * it were not there.
 */
export function FrozenUntil({ answered, hint, children }: { answered: boolean; hint: string; children: ReactNode }) {
    return (
        <fieldset className="field-frozen" disabled={!answered} data-waiting={answered ? undefined : hint}>
            {children}
        </fieldset>
    );
}
