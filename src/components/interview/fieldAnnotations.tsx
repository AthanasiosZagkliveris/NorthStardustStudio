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
    type Annotations,
    type FieldAnnotation,
    type FieldFlag
} from "../../framework/engine/Annotations";
import { fieldKey, isYesNoPair, registerField, slug, type FieldKey, type FieldKind } from "../../framework/engine/FieldKeys";

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

/** The field's key and where it is, found from where `ref` sits on the page. */
interface FieldAddressing {
    key: FieldKey | null;
    /** An answer the person gives (see FieldEntry.kind): only those carry the menu. */
    answer: boolean;
    anchors: string[];
    section?: string;
}

function useFieldAddress(
    ref: RefObject<HTMLElement | null>,
    label: string,
    section: string | undefined
): FieldAddressing {

    const context = useContext(AnnotationContext);
    const [found, setFound] = useState<FieldAddressing>({ key: null, answer: false, anchors: [] });

    useLayoutEffect(() => {

        if (!context || !ref.current) {
            return;
        }

        const element = ref.current;
        const railElement = element.closest<HTMLElement>("[data-rail]");
        const rail = section ?? railElement?.dataset.rail;

        // The cards around it, innermost first, inside its section.
        const anchors: string[] = [];
        for (let at = element.closest<HTMLElement>("[data-anchor]"); at; at = at.parentElement?.closest<HTMLElement>("[data-anchor]") ?? null) {
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
            : [rail, anchors[0], slug(label)].filter((segment): segment is string => !!segment);

        const key = fieldKey({ systemNumber: context.systemNumber, sectionNumber: context.sectionNumber, path });

        // Opening the field (focusField) looks for this mark.
        const holder = element.closest<HTMLElement>(".business-foundation-field, .legal-entity-field") ?? element;
        holder.dataset.fieldKey = key;

        // ONE RULE FOR WHAT CAN BE FLAGGED (FieldEntry.kind): only an
        // answer the person gives. A column's or section's heading
        // stands for what it holds, and is always one.
        const kind = section ? "answer" : fieldKind(holder);
        const answer = kind === "answer";

        registerField({ key, label, pageTitle: context.pageTitle, kind });
        holder.dataset.fieldType = kind;

        setFound(previous => previous.key === key && previous.answer === answer && previous.anchors.join(" ") === anchors.join(" ")
            ? previous
            : { key, answer, anchors, section: rail });

    }, [context, ref, label, section]);

    return found;

}

/**
 * What kind of field `holder` is (FieldEntry.kind): derived when it
 * holds nothing the person types or chooses in; optional when it is
 * an optional text opened by its tick box (`data-field-kind`);
 * binary when its one control is a tick box, or a choice of a yes and
 * a no (isYesNoPair); otherwise an answer.
 */
function fieldKind(holder: HTMLElement): FieldKind {

    if (holder.dataset.fieldKind === "optional" || holder.closest("[data-field-kind=optional]")) {
        return "optional";
    }

    const controls = [...holder.querySelectorAll<HTMLElement>(
        "input:not([type=hidden]):not(.field-flag-research), textarea, select, .option-picker, .month-picker, [contenteditable=true]"
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

    return "answer";

}

/** The annotation on a field, and how to change it. */
function useFieldAnnotation(ref: RefObject<HTMLElement | null>, label: string, section?: string) {

    const context = useContext(AnnotationContext);
    const address = useFieldAddress(ref, label, section);
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
            ...(address.section ? { section: address.section } : {})
        });
    }, [context, address, annotation, label]);

    return { enabled: !!context && address.answer, key: address.key, annotation, change };

}

const FLAGS: FieldFlag[] = ["not-sure", "research", "not-applicable"];

/**
 * The flag icon after a label, and the small menu it opens: Not sure
 * yet, Needs research (with one optional line: what to find out),
 * Doesn't apply, and Clear flag once flagged. Seen on hover or focus
 * of its field on a pointer, always on touch, and always once the
 * field has a flag (field-annotations CSS, global.css).
 */
export function FieldFlagButton({ label, section }: { label: string; section?: string }) {

    const ref = useRef<HTMLSpanElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const { enabled, annotation, change } = useFieldAnnotation(ref, label, section);
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
            panelRef.current?.querySelector<HTMLElement>("[role=menuitemradio], [role=menuitem]")?.focus({ preventScroll: true });
        }
    }, [open, panelRef]);

    if (!enabled) {
        return <span ref={ref} hidden />;
    }

    const flag = annotation?.flag;

    function close() {
        setOpen(false);
        buttonRef.current?.focus({ preventScroll: true });
    }

    function choose(next: FieldFlag) {
        change({ flag: next, research: next === "research" ? annotation?.research ?? "" : undefined });
        if (next !== "research") {
            close();
        }
    }

    return (
        <span className="field-flag" ref={ref}>

            <button
                type="button"
                ref={buttonRef}
                className="field-flag-button"
                data-active={flag ? "" : undefined}
                aria-label={"Flag or note: " + label}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen(current => !current)}
            >
                <span aria-hidden="true">⚑</span>
            </button>

            {open && (
                <div
                    className="field-flag-menu"
                    ref={panelRef}
                    style={panelStyle}
                    role="menu"
                    aria-label={"Flag or note: " + label}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            consumeKey(event);
                            close();
                        }
                    }}
                >
                    {FLAGS.map(option => (
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

                    {flag === "research" && (
                        <input
                            type="text"
                            className="interview-input field-flag-research"
                            aria-label="What do I need to find out?"
                            placeholder="What do I need to find out?"
                            value={annotation?.research ?? ""}
                            onChange={(event) => change({ research: event.target.value })}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    close();
                                }
                            }}
                        />
                    )}

                    {flag && (
                        <button
                            type="button"
                            role="menuitem"
                            className="field-flag-option field-flag-clear"
                            onClick={() => {
                                change({ flag: undefined, research: undefined });
                                close();
                            }}
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
export function FieldStatus({ label, section }: { label: string; section?: string }) {

    const ref = useRef<HTMLSpanElement | null>(null);
    const { annotation } = useFieldAnnotation(ref, label, section);

    return (
        <span className="field-status" ref={ref}>
            <FieldStatusLine label={label} flag={annotation?.flag} research={annotation?.research} />
        </span>
    );

}
