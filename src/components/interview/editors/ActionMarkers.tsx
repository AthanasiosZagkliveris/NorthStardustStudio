import { useAboveTip } from "../../controls/Tooltip.tsx";

import { markTint } from "../../../framework/engine/ActionOrder.ts";
import { consumeKey } from "../fields/consumeKey.ts";

import "../../../styles/numbered-list.css";

/*
    ACTION MARKERS (Customer Channel table). An action line says what it
    is tied to with up to two small symbols under its x:

      - SHARED (placed in more than one row): a link symbol.
      - LINKED TO A RESOURCE: a tag symbol.

    The SHAPE says the kind of tie, the COLOUR says which one: each shared
    action has a colour of its own (a cool palette) and each resource one
    (a warm palette), the same on its symbol, on the 4px line at the edge
    of its action cell (right for shared, left for a resource) and, for a
    resource, on its card. Colour is never the only signal: the shapes
    differ, and each symbol has a name for assistive technology.

    Pointing at a symbol (or focusing it) shows the app's tooltip above its
    ACTION CELL (the line's box), its right edge on the cell's right edge,
    hugging its one line of words; Escape closes it. A click ISOLATES the
    related rows (the editor collapses the others away); a second click,
    Escape or the note in the section's title row puts them back.
*/

/** What is lit by pointing at something: an action's twins, or a resource's actions (by link id). */
export type ActionLit =
    | { kind: "action"; id: string }
    | { kind: "resources"; ids: readonly string[] }
    | null;

/**
 * What the table is isolating (view state, never saved): one action's
 * rows, or the rows of some resources (and the action the click came
 * from, when it came from an action).
 */
export type ActionIsolation =
    | { kind: "action"; segmentId: string; actionId: string }
    | { kind: "resource"; segmentId: string; resourceIds: readonly string[]; fromActionId?: string }
    | null;

/* Tabler's "link" and "tag" (24px, 2px strokes), drawn inline: the
   app has no icon library, and its x is drawn the same way. */
export function MarkIcon({ kind, size = 16 }: { kind: "link" | "tag"; size?: number }) {
    return (
        <svg
            className="action-mark-icon"
            viewBox="0 0 24 24"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {kind === "link"
                ? (
                    <>
                        <path d="M9 15l6 -6" />
                        <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
                        <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />
                    </>
                )
                : (
                    <>
                        <path d="M7.5 7.5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3z" />
                    </>
                )}
        </svg>
    );
}

/**
 * One symbol: a 24 x 24 button around a 16px glyph. Pointing at it or
 * focusing it shows the tooltip (above it, one line); Escape closes it;
 * a click toggles `onToggle` (isolating the related rows), `pressed`
 * says whether it is the one isolating. `colour` is its place in its
 * kind's palette (ActionOrder.ts: past six the hues come round with a
 * pattern).
 */
function ActionSymbol({
    kind, colour, label, text, pressed, onToggle, onHover
}: {
    kind: "shared" | "resource";
    colour: number;
    label: string;
    /** The tooltip: one short line. */
    text: string;
    pressed: boolean;
    onToggle: (symbol: HTMLButtonElement) => void;
    /** Pointing at it lights what it is tied to. */
    onHover?: (on: boolean) => void;
}) {

    /* ABOVE the symbol's action cell (its line's box), the tooltip's right edge on the cell's right edge, kept inside the window; below the cell only where there is no room above. */
    const tip = useAboveTip<HTMLButtonElement>(text, { box: (symbol) => symbol.closest<HTMLElement>(".numbered-list-row") ?? symbol, alignRight: true });

    return (
        <>
            <button
                type="button"
                {...tip.props}
                className={"action-symbol action-symbol-" + kind + " " + markTint(kind, colour)}
                aria-label={label}
                aria-pressed={pressed}
                onMouseEnter={() => { tip.props.onMouseEnter(); onHover?.(true); }}
                onMouseLeave={() => { tip.props.onMouseLeave(); onHover?.(false); }}
                onFocus={() => { tip.props.onFocus(); onHover?.(true); }}
                onBlur={() => { tip.props.onBlur(); onHover?.(false); }}
                onClick={(event) => onToggle(event.currentTarget)}
                onKeyDown={(event) => {
                    if (event.key === "Escape" && tip.props["aria-describedby"]) {
                        consumeKey(event);
                    }
                    tip.props.onKeyDown(event);
                }}
            >
                <MarkIcon kind={kind === "shared" ? "link" : "tag"} />
            </button>
            {tip.node}
        </>
    );

}

/**
 * The link symbol, on every row of an action placed in more than one
 * row: "Shared in 3 places".
 */
export function SharedSymbol({
    places, colour, pressed, onToggle, onHover
}: {
    places: number;
    colour: number;
    pressed: boolean;
    onToggle: (symbol: HTMLButtonElement) => void;
    onHover?: (on: boolean) => void;
}) {
    const text = "Shared in " + places + " places";
    return <ActionSymbol kind="shared" colour={colour} label={text} text={text} pressed={pressed} onToggle={onToggle} onHover={onHover} />;
}

/**
 * The tag symbol, on every action linked to a resource ("Linked to
 * Shopify Basic", or "Linked to 2 resources"). A resource's own card
 * has none: its summary line says "N actions" in words.
 */
export function ResourceSymbol({
    names, colour, pressed, onToggle, onHover
}: {
    names: readonly string[];
    colour: number;
    pressed: boolean;
    onToggle: (symbol: HTMLButtonElement) => void;
    onHover?: (on: boolean) => void;
}) {
    const text = names.length === 1 ? "Linked to " + names[0] : "Linked to " + names.length + " resources";
    return <ActionSymbol kind="resource" colour={colour} label={text} text={text} pressed={pressed} onToggle={onToggle} onHover={onHover} />;
}

/**
 * "Shared: Instagram, Pinterest x" or "Linked: Shopify Basic x", in the
 * section's title row while the table isolates something: the channels
 * that hold the action, or the resources. Every name, wrapping where it
 * must. A click puts every row back.
 */
export function IsolationNote({ kind, names, onClear }: { kind: "shared" | "linked"; names: readonly string[]; onClear: () => void }) {
    const label = (kind === "shared" ? "Shared: " : "Linked: ") + names.join(", ");
    return (
        <button
            type="button"
            className="fold-all-toggle action-isolation-note"
            aria-label={"Show every action again (" + label + ")"}
            onClick={onClear}
        >
            <span className="action-isolation-label">{label}</span>
            <span aria-hidden="true">{" ×"}</span>
        </button>
    );
}
