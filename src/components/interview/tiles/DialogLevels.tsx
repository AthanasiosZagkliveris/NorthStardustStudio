import { createContext, Fragment, ReactNode, useContext, useEffect, useLayoutEffect, useRef } from "react";
import InfoNote, { InfoPoint, InfoText } from "../fields/InfoNote.tsx";
import { type TileAdd, type CrumbNote, type DialogRail, type FloatingItem } from "./SectionTileTypes.ts";
import { drawnTitle } from "./SectionTileGeometry.tsx";

/**
 * THE FOCUS COMES BACK to the control that opened a dialog or a floating card -- so the keyboard continues from where it was.
 * The focus is restored QUIETLY, however the opener was opened (a mouse click or Enter): no ring on the opener (`data-focus-quiet`) until the
 * next key is used or the focus moves on (the owner's rule, 2026-10-14: the ring does not exist after Escape or Back). `pointer` is kept for
 * the callers; it no longer changes the result.
 */
export function restoreFocus(target: HTMLElement | null, pointer: boolean) {
    if (!target || !target.isConnected) {
        return;
    }
    void pointer;
    {
        target.setAttribute("data-focus-quiet", "");
        const release = () => {
            target.removeAttribute("data-focus-quiet");
            target.removeEventListener("blur", release);
            window.removeEventListener("keydown", release, true);
        };
        target.addEventListener("blur", release);
        window.addEventListener("keydown", release, true);
    }
    target.focus({ preventScroll: true });
}


/** Where the pointer last was (the page tiles settle only until it really moves). */
let lastPointer = { x: -1, y: -1 };

let pointerTracked = false;

let releaseSettled: (() => void) | null = null;


/**
 * THE DEFAULT PAGE AGAIN, after a dialog or a floating card closes (Escape, Back, a click outside): no tile is grown, though the pointer
 * may be resting on one -- the grow waits (`data-tiles-settled` on the root, section-tiles.css) until the pointer really moves.
 */
export function settlePage() {
    const root = document.documentElement;
    releaseSettled?.();
    const at = { ...lastPointer };
    root.setAttribute("data-tiles-settled", "");
    const release = () => {
        root.removeAttribute("data-tiles-settled");
        window.removeEventListener("pointermove", onMove, true);
        releaseSettled = null;
    };
    const onMove = (event: PointerEvent) => {
        if (Math.hypot(event.clientX - at.x, event.clientY - at.y) > 3) {
            release();
        }
    };
    window.addEventListener("pointermove", onMove, true);
    releaseSettled = release;
}


/** Tracks the pointer for settlePage (once, for the whole page). */
export function trackPointer() {
    if (pointerTracked || typeof window === "undefined") {
        return;
    }
    pointerTracked = true;
    window.addEventListener("pointermove", (event) => { lastPointer = { x: event.clientX, y: event.clientY }; }, true);
}


/**
 * A view INSIDE a dialog that Back and Escape leave first (the Founders'
 * closed boxes, once one is open: its card replaces the grid): the content
 * registers the way back while it is shown; the dialog's Back button and
 * Escape take it before closing the dialog.
 */
export interface InnerBackApi {
    /** Registers (or, with a null back, clears) the way back of the view at `depth`. */
    set: (depth: number, back: (() => void) | null, subtitle?: string, note?: CrumbNote) => void;
    /** A function the dialog calls when it is CLOSED (a card still blank is removed). */
    onClose: (fn: () => void) => () => void;
    /** The side of the tile that opened the dialog, in px (0 where unknown): a box never exceeds it. */
    tileSize: number;
    /** Registers (or clears) what the carousel arrows do first while an inner view is open: it steps within the dialog and says whether it did. */
    setStep: (depth: number, step: ((direction: 1 | -1) => boolean) | null, rail?: DialogRail | null) => void;
}


export const InnerBackContext = createContext<InnerBackApi | null>(null);


/** How deep in the dialog's inner views a component stands (0 = the dialog's own content). */
export const InnerDepthContext = createContext(0);


/** What is drawn inside an inner view (a subcategory, a card): one level deeper than the view that shows it. */
export function InnerLevel({ children }: { children: ReactNode }) {
    const depth = useContext(InnerDepthContext);
    return <InnerDepthContext.Provider value={depth + 1}>{children}</InnerDepthContext.Provider>;
}


/**
 * `subtitle` names the inner view (a subcategory, a card); the dialog's accessible
 * name is then "<section> › <subtitle>" (nested views joined in order).
 * Views nest: the one drawn inside another registers one level deeper (InnerLevel), and Back
 * and Escape take the deepest one first.
 */
export function useDialogInnerBack(back: (() => void) | null, subtitle?: string, note?: CrumbNote) {
    const context = useContext(InnerBackContext);
    const depth = useContext(InnerDepthContext);
    // (The way back is read when it is taken, so a new function on every render does not register the view again.)
    const latest = useRef(back);
    latest.current = back;
    const active = back !== null;
    // (The note is data compared by value: the caller builds it afresh on every render.)
    const noteKey = note ? note.label + "\u0000" + JSON.stringify(note.points) : "";
    const noted = useRef(note);
    noted.current = note;
    useLayoutEffect(() => {
        context?.set(depth, active ? () => latest.current?.() : null, subtitle, noted.current);
        return () => context?.set(depth, null);
    }, [context, depth, active, subtitle, noteKey]);
}


/**
 * The carousel arrows of a dialog whose content has sections of its own (the Registrations' three): while one is open, the arrows go to the next or the previous of
 * THEM first; at their end (the handler says it did nothing) they go on to the neighbouring tile of the page.
 */
export function useDialogInnerStep(step: ((direction: 1 | -1) => boolean) | null, rail?: DialogRail | null) {
    const context = useContext(InnerBackContext);
    const depth = useContext(InnerDepthContext);
    const latest = useRef(step);
    latest.current = step;
    const latestRail = useRef(rail);
    latestRail.current = rail;
    const active = step !== null;
    // (The rail is data compared by value: its tiles' ids and names, and the one lit.)
    const railKey = rail ? rail.current + "|" + rail.items.map(item => item.id + ":" + item.label).join("|") : "";
    useLayoutEffect(() => {
        const shown = latestRail.current;
        context?.setStep(depth, active ? (direction) => latest.current?.(direction) ?? false : null, active && shown ? { items: shown.items, current: shown.current, go: (id) => latestRail.current?.go(id) } : null);
        return () => context?.setStep(depth, null, null);
    }, [context, depth, active, railKey]);
}


/** One step down in a dialog's header: the name of the view shown ("Software", a card's name) and the "i" note it carries. */
export interface Crumb {
    name: string;
    note?: CrumbNote;
}


export const CrumbsContext = createContext<readonly Crumb[] | null>(null);


/** What a box inside a dialog calls to open a card it made floating (TileDialog's `onOpenCard`). */
export const OpenCardContext = createContext<((id: string, caption: string | undefined, remover: TileAdd | undefined, pointer: boolean, fresh: boolean) => void) | null>(null);


/** The subcategory box a dialog opens on, if its tile was opened from a list item that names one. */
/**
 * THE CARD A CARD IS OPENED UNDER: a card a founder's responsibility leads to (a legal expense, drawn by another editor) opens
 * BELOW the founder's card, the two stacked as every pair is -- the page that holds the open card gives it here (live, as it
 * draws it) and what to do when the pair is closed.
 */
export const StackUnderContext = createContext<{ item: FloatingItem; clear: () => void } | null>(null);

export const InitialBoxContext = createContext<string | null>(null);


/**
 * A DIALOG'S TITLE (docs/ai/layout-rules.md, "The dialog header"): the section's heading, and -- on the SAME
 * line -- each view shown inside it after a slash: "6. Digital Infrastructure / Software", "Utilities / Electricity /
 * Studio electricity". The title keeps the title style; the slash (8px either side) and the names are the same size, regular,
 * muted; the "i" note stands after the last name (the nearest one that has a note), and a long header cuts the names with an
 * ellipsis (the full name is the tooltip). Outside a dialog, or with nothing opened in it, it is the plain heading.
 */
export function DialogHeading({ title, info, noteSize }: { title: string; info?: InfoPoint[]; noteSize?: "standard" | "wide" | "double" }) {
    const crumbs = useContext(CrumbsContext);
    if (!crumbs || crumbs.length === 0) {
        return info
            ? (
                <span className="business-foundation-label-info">
                    <span className="field-group-title business-foundation-subhead">
                        <InfoText text={drawnTitle(title)}>
                            <InfoNote label={title} points={info} fullList size={noteSize} />
                        </InfoText>
                    </span>
                </span>
            )
            : <span className="field-group-title business-foundation-subhead">{drawnTitle(title)}</span>;
    }
    const note = [...crumbs].reverse().find(crumb => crumb.note)?.note ?? (info ? { label: title, points: info } : null);
    const trailing = note ? <InfoNote label={note.label} points={note.points} fullList size={noteSize} /> : null;
    return (
        <span className="business-foundation-label-info dialog-heading">
            <span className="field-group-title business-foundation-subhead dialog-heading-line">
                <span className="dialog-heading-title">{drawnTitle(title)}</span>
                {crumbs.length > 0 && (
                    // (One row: where the names are too long for it, the line slides to the left -- the root keeps its place, the last name stays in view.)
                    <span className="dialog-heading-trail">
                        <span className="dialog-heading-trail-text">
                            {crumbs.map((crumb, at) => (
                                <Fragment key={at}>
                                    <span className="dialog-heading-slash" aria-hidden="true">/</span>
                                    <span className="dialog-heading-sub" title={crumb.name}>{crumb.name}</span>
                                </Fragment>
                            ))}
                        </span>
                    </span>
                )}
            </span>
            {trailing}
        </span>
    );
}


/** THE OVERALL NUMBER OF ACTIVE CARDS next to a dialog's title (Activities): "ACTIVE 11". */
export function ActiveCount({ overall }: { overall: number }) {
    return <span className="dialog-heading-count" aria-live="polite">{"Active " + overall}</span>;
}


/** The side, in px, of the tile that opened the dialog (0 where unknown). */
export function useDialogTileSize(): number {
    return useContext(InnerBackContext)?.tileSize ?? 0;
}


/** Registers what to do when the dialog is closed (the latest function is called). */
export function useDialogClosing(fn: () => void) {
    const context = useContext(InnerBackContext);
    const latest = useRef(fn);
    latest.current = fn;
    useEffect(() => context?.onClose(() => latest.current()), [context]);
}
