import type { FieldKind, NoneReason } from "./FieldKeys";

/*
    WHAT A FIELD IS: an ANSWER the person gives, or NONE of their
    answers (NoneReason): worked out or read-only, a yes or a no, an
    optional text behind its tick box, a status, a choice with its own
    "not yet" option, a link to another item, a display setting, a
    card's name. The markup settles the first three (fieldMarks.tsx);
    NONE_LABELS the rest. Every field has a key whatever it is
    (FieldKeys.ts); what is done with the kind is up to what reads it.
*/

/** Labels (as slugs) that are never one of the person's answers, wherever they are, and why. */
const NONE_LABELS: Record<string, NoneReason> = {
    // States: a Status says where a thing stands, whatever its options.
    "status": "status",
    "completed": "status",
    "done": "status",
    // A choice that holds its own "not yet" answer.
    "income-tax": "has-own-option",
    // Links between items: who or what another item points at.
    "performer": "link",
    "owner": "link",
    "responsibility": "link",
    "provider": "link",
    "linked-to": "link",
    "linked-funding-need": "link",
    // Display settings: how figures are shown, not what they are.
    "currency": "display",
    "unit": "display",
    "hours-per-week": "display",
    "hours-per-month": "display",
    "measurement-frequency": "display",
    // A card's own name: the card stands for it.
    "name": "name"
};

/**
 * A field's kind from its address: `path` is its key's path (page
 * section, card, label slug -- or the section alone, for a section's
 * own heading; or section and card, for a card).
 */
export function fieldKindOf(_systemNumber: number, path: readonly string[], card = false): { kind: FieldKind; why?: NoneReason } {

    const section = path[0] ?? "";
    const label = card ? "" : path.length > 1 ? path[path.length - 1] : "";

    // A section that is one setting or one choice (Income Tax) is
    // named by its section id alone.
    const named = card ? "" : label || section;

    if (named && NONE_LABELS[named]) {
        return { kind: "none", why: NONE_LABELS[named] };
    }

    return { kind: "answer" };

}

/** Whether a kind is one of the person's own answers. */
export function kindIsAnswer(kind: FieldKind | undefined): boolean {
    return kind === "answer";
}
