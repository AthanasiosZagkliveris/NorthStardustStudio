import {
    createContext,
    ReactNode,
    RefObject,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState
} from "react";

import { useFloatingPanel } from "../../hooks/useFloatingPanel.ts";
import { OrganizationService } from "../../services/OrganizationService";
import {
    FIELD_FLAG_WORDS,
    INVESTIGATION_QUESTION,
    type Annotations,
    type FieldAnnotation,
    type FieldFlag
} from "../../framework/engine/Annotations";
import { fieldKey, isYesNoPair, registerField, slug, type FieldKey, type FieldKind, type FlagOffer, type NoneReason } from "../../framework/engine/FieldKeys";
import { fieldKindOf, flagOfferOf, offersNotApplicable } from "../../framework/engine/FieldKinds";

import { consumeKey } from "./consumeKey.ts";
import FieldStatusLine from "./FieldStatusLine.tsx";

/*
    FLAGS ON ANY FIELD: the shared pieces a label carries.

      <FieldFlagButton label="Legal Form" />    the flag icon after the label
      <FieldStatus label="Legal Form" />        the status line under it

    Both find their field's key (FieldKeys.ts) the same way: the page
    from the AnnotationProvider around the page, then -- from where
    they sit on the page -- the section (the nearest `data-rail`) and
    the card (the nearest `data-anchor`), then the label. A column's
    or a section's own heading names its section instead (`section`).

    TO ENABLE THEM ON A PAGE: render the page inside an
    AnnotationProvider (Conversation.tsx does, for every page), and
    put the two beside a label in its shared label component -- as
    BusinessField, the Legal Entity's labels, the column headings and
    the financial section heads do. Nothing else is needed: the key,
    the menu, the storage and the statuses follow.
*/

interface AnnotationContextValue {
    organizationId: string;
    systemNumber: number;
    sectionNumber: number;
    pageTitle: string;
    annotations: Annotations;
    setAnnotation: (key: FieldKey, annotation: FieldAnnotation | null) => void;
}

const AnnotationContext = createContext<AnnotationContextValue | null>(null);

/** The page's flags and notes, for every label inside it. */
export function AnnotationProvider({

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

    const [annotations, setAnnotations] = useState<Annotations>(
        () => organizationId ? OrganizationService.getAnnotations(organizationId) : {}
    );

    useEffect(() => {
        if (!organizationId) {
            return;
        }
        setAnnotations(OrganizationService.getAnnotations(organizationId));
        return OrganizationService.subscribeAnnotations(
            () => setAnnotations(OrganizationService.getAnnotations(organizationId))
        );
    }, [organizationId]);

    const setAnnotation = useCallback((key: FieldKey, annotation: FieldAnnotation | null) => {
        if (organizationId) {
            OrganizationService.setAnnotation(organizationId, key, annotation);
        }
    }, [organizationId]);

    const value = useMemo(() => organizationId
        ? { organizationId, systemNumber, sectionNumber, pageTitle, annotations, setAnnotation }
        : null,
    [organizationId, systemNumber, sectionNumber, pageTitle, annotations, setAnnotation]);

    return <AnnotationContext.Provider value={value}>{children}</AnnotationContext.Provider>;

}

/**
 * Where a field is and what it offers, found from where it is drawn.
 *
 *   section   a page section's own heading: the section is the field;
 *   card      a card's head: the card is the field (its section and
 *             its own anchor);
 *   rail      the page section, for a field that sits in none;
 *   anchor    the card, for a field whose card sits outside its
 *             section (a Segment's Description);
 *   keyLabel  the label its key is made from, when the label shown
 *             changes with the answer ("<cost name> amount");
 *   flag      the flag it offers (FieldKinds.ts), named where it is
 *             drawn; otherwise found by its address.
 */
export interface FieldPlace {
    section?: string;
    card?: boolean;
    rail?: string;
    anchor?: string;
    keyLabel?: string;
    flag?: FlagOffer;
}

/** The field's key and where it is, found from where `ref` sits on the page. */
interface FieldAddressing {
    key: FieldKey | null;
    kind: FieldKind;
    flag?: FlagOffer;
    anchors: string[];
    section?: string;
}

/** The elements that hold one field: its label, its control, its status line. */
const HOLDER = ".business-foundation-field, .legal-entity-pair, .legal-entity-field, .legal-entity-field-wide, [data-field-holder]";

function useFieldAddress(
    ref: RefObject<HTMLElement | null>,
    label: string,
    place: FieldPlace,
    /** Records the field in the registry: once per field, by its flag button. */
    register: boolean
): FieldAddressing {

    const context = useContext(AnnotationContext);
    const [found, setFound] = useState<FieldAddressing>({ key: null, kind: "none", anchors: [] });
    const { section, card = false, rail: fallbackRail, anchor, keyLabel, flag: named } = place;

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
        holder.dataset.fieldKey = key;

        // ONE RULE FOR WHAT A FIELD OFFERS (FieldKinds.ts): a field
        // named flaggable is an answer; otherwise what the markup
        // shows for itself -- nothing to answer, a yes or a no, an
        // optional text behind its tick box -- and then the table.
        const flag = named ?? flagOfferOf(context.systemNumber, path, card);
        const shown = flag || section || card ? null : markupKind(holder);
        const { kind, why } = flag
            ? { kind: "answer" as const, why: undefined }
            : shown
                ? { kind: "none" as const, why: shown }
                : fieldKindOf(context.systemNumber, path, card);

        if (register) {
            registerField({ key, label, pageTitle: context.pageTitle, kind, ...(why ? { why } : {}), ...(flag ? { flag } : {}) });
            holder.dataset.fieldType = kind;
            if (flag) {
                holder.dataset.fieldFlag = flag;
            }
        }

        setFound(previous => previous.key === key && previous.kind === kind && previous.flag === flag && previous.anchors.join(" ") === anchors.join(" ")
            ? previous
            : { key, kind, flag, anchors, section: rail });

    }, [context, ref, label, section, card, fallbackRail, anchor, keyLabel, named, register]);

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
        "input:not([type=hidden]):not(.field-flag-research), textarea:not(.field-note-text), select, .option-picker, .month-picker, [contenteditable=true]"
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

/** The annotation on a field, and how to change it. */
export function useFieldAnnotation(ref: RefObject<HTMLElement | null>, label: string, place: FieldPlace, register = false) {

    const context = useContext(AnnotationContext);
    const address = useFieldAddress(ref, label, place, register);
    const annotation = address.key ? context?.annotations[address.key] : undefined;

    const change = useCallback((patch: Partial<FieldAnnotation> | null) => {
        if (!context || !address.key) {
            return;
        }
        if (patch === null) {
            context.setAnnotation(address.key, null);
            return;
        }
        context.setAnnotation(address.key, {
            ...annotation,
            ...patch,
            label,
            pageTitle: context.pageTitle,
            anchors: address.anchors,
            kind: address.kind,
            ...(address.section ? { section: address.section } : {})
        });
    }, [context, address, annotation, label]);

    return {
        present: !!context,
        kind: address.kind,
        flag: address.flag,
        key: address.key,
        annotation: annotation?.builtIn ? undefined : annotation,
        change
    };

}

/**
 * THE FLAG BUTTON after a label (aria "Flag: <field>"), drawn only on
 * the fields that offer a flag (FieldKinds.ts):
 *
 * - most offer one, Needs investigation: the button sets it at once
 *   and opens its one optional line, "What do I need to find out?";
 *   pressed again, it clears it. No menu.
 * - the legal and tax items offer two: the button opens a small menu
 *   -- Needs investigation (with its line), Doesn't apply, and Clear
 *   flag once one is set.
 *
 * Seen on hover or focus of its field on a pointer, always on touch,
 * and always once the field has a flag (global.css). Every label
 * that can carry one renders it: it also records the field in the
 * registry, whatever the field offers.
 */
export function FieldFlagButton({ label, ...place }: { label: string } & FieldPlace) {

    const ref = useRef<HTMLSpanElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const { present, flag: offer, annotation, change } = useFieldAnnotation(ref, label, place, true);
    const [open, setOpen] = useState(false);
    const { panelRef, panelStyle } = useFloatingPanel(open, buttonRef);

    useEffect(() => {
        if (!open) {
            return;
        }
        function onPointerDown(event: MouseEvent) {
            if (!ref.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, [open]);

    useEffect(() => {
        if (open) {
            panelRef.current?.querySelector<HTMLElement>("[role=menuitemradio], [role=menuitem], .field-flag-research")?.focus({ preventScroll: true });
        }
    }, [open, panelRef]);

    if (!present || !offer) {
        return <span ref={ref} hidden />;
    }

    const flag = annotation?.flag;
    const menu = offersNotApplicable(offer);

    function close() {
        setOpen(false);
        buttonRef.current?.focus({ preventScroll: true });
    }

    function clear() {
        change({ flag: undefined, research: undefined });
        close();
    }

    function choose(next: FieldFlag) {
        change({ flag: next, research: next === "research" ? annotation?.research ?? "" : undefined });
        if (next !== "research") {
            close();
        }
    }

    function press() {
        if (menu) {
            setOpen(current => !current);
            return;
        }
        if (flag) {
            clear();
            return;
        }
        change({ flag: "research", research: "" });
        setOpen(true);
    }

    const line = flag === "research" && (
        <input
            type="text"
            className="interview-input field-flag-research"
            aria-label={INVESTIGATION_QUESTION}
            placeholder={INVESTIGATION_QUESTION}
            value={annotation?.research ?? ""}
            onChange={(event) => change({ research: event.target.value })}
            onKeyDown={(event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    close();
                }
            }}
        />
    );

    return (
        <span className="field-flag" ref={ref}>

            <button
                type="button"
                ref={buttonRef}
                className="field-flag-button"
                data-active={flag ? "" : undefined}
                aria-label={"Flag: " + label}
                {...(menu
                    ? { "aria-haspopup": "menu" as const, "aria-expanded": open }
                    : { "aria-pressed": !!flag })}
                title={menu ? undefined : flag ? "Clear the flag" : FIELD_FLAG_WORDS.research}
                onClick={press}
            >
                <span aria-hidden="true">⚑</span>
            </button>

            {open && (
                <div
                    className="field-flag-menu"
                    ref={panelRef}
                    style={panelStyle}
                    role={menu ? "menu" : "group"}
                    aria-label={"Flag: " + label}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            consumeKey(event);
                            close();
                        }
                    }}
                >
                    {menu && (["research", "not-applicable"] as FieldFlag[]).map(option => (
                        <button
                            key={option}
                            type="button"
                            role="menuitemradio"
                            aria-checked={flag === option}
                            className="field-flag-option"
                            onClick={() => choose(option)}
                        >
                            {FIELD_FLAG_WORDS[option]}
                        </button>
                    ))}

                    {line}

                    {menu && flag && (
                        <button
                            type="button"
                            role="menuitem"
                            className="field-flag-option field-flag-clear"
                            onClick={clear}
                        >
                            Clear flag
                        </button>
                    )}
                </div>
            )}

        </span>
    );

}

/** The field's status line (FieldStatusLine) under its label: its flag. */
export function FieldStatus({ label, ...place }: { label: string } & FieldPlace) {

    const ref = useRef<HTMLSpanElement | null>(null);
    const { annotation } = useFieldAnnotation(ref, label, place);

    return (
        <span className="field-status" ref={ref}>
            <FieldStatusLine label={label} flag={annotation?.flag} research={annotation?.research} />
        </span>
    );

}
