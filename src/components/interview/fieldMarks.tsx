import {
    createContext,
    ReactNode,
    RefObject,
    useContext,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from "react";

import { fieldKey, isYesNoPair, registerField, slug, type FieldKey, type FieldKind, type NoneReason } from "../../framework/engine/FieldKeys";
import { fieldKindOf } from "../../framework/engine/FieldKinds";

import FieldStatusLine from "./FieldStatusLine.tsx";
import { NotepadService } from "../../services/NotepadService";
import { useNotesAt } from "../notepad/Notepad.tsx";

/*
    EVERY FIELD KNOWS ITS KEY: the shared pieces a label carries.

      <FieldMark label="Legal Form" />      records the field (FieldKeys.ts)
      <FieldStatus label="Legal Form" />    the status line under the label

    Both find their field's key the same way: the page from the
    FieldPageProvider around the page, then -- from where they sit on
    the page -- the section (the nearest \`data-rail\`) and the card (the
    nearest \`data-anchor\`), then the label. A column's or a section's
    own heading names its section instead (\`section\`).

    The field's holder is marked with its key (\`data-field-key\`), which
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

    return <FieldPageContext.Provider value={value}>{children}</FieldPageContext.Provider>;

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
 * The field's status line (FieldStatusLine) under its label: a marker
 * when a note in the Notepad links here, which opens the Notepad at
 * those notes.
 */
export function FieldStatus({ label, ...place }: { label: string } & FieldPlace) {

    const ref = useRef<HTMLSpanElement | null>(null);
    const page = useContext(FieldPageContext);
    const { key } = useFieldAddress(ref, label, place);
    const notes = useNotesAt(key, page?.organizationId ?? null);

    return (
        <span className="field-status" ref={ref}>
            <FieldStatusLine
                label={label}
                onOpenNotes={notes.length > 0 ? () => NotepadService.open(notes.map(note => note.id)) : undefined}
            />
        </span>
    );

}
