import { removalPatches, removesContent, undoRemoval } from "../framework/engine/RemovalPatch";

/*
    UNDO AFTER A REMOVAL: one offer at a time, shown by the one undo
    toast (UndoToast.tsx). A new offer replaces the last, which is then
    final.

    Removals reach it two ways:
      - an answer on an interview page: the page marks a removal as it
        starts (markRemoval, from the × or the Delete key that asked
        for it) and, when the answer changes in the same moment, hands
        the answer before and after to offerRemovalUndo, which offers
        to put back what was taken away (RemovalPatch.ts);
      - anything else (a note in the Notepad) offers its own undo.
*/

export interface UndoOffer {
    /** Changes with every offer, so a toast can start its time again. */
    id: number;
    /** "Profile 1 removed." */
    message: string;
    undo: () => void;
}

type Listener = () => void;

let offer: UndoOffer | null = null;
let nextId = 1;
let mark: { what: string; at: number } | null = null;
const listeners = new Set<Listener>();

/** How long a mark waits for its answer to change: the same click, give or take. */
const MARK_LIFETIME = 1000;

function notify(): void {
    listeners.forEach(listener => listener());
}

/** "founder 2" as the start of a sentence: "Founder 2". */
function sentence(what: string): string {
    const trimmed = what.trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export const UndoService = {

    current(): UndoOffer | null {
        return offer;
    },

    /** Offers to undo a removal; replaces any offer already shown. */
    offer(message: string, undo: () => void): void {
        offer = { id: nextId++, message, undo };
        notify();
    },

    /** Undoes what the current offer is for, and closes it. */
    undo(): void {
        const taken = offer;
        offer = null;
        notify();
        taken?.undo();
    },

    /** Closes the offer: the removal is final. */
    dismiss(): void {
        if (offer) {
            offer = null;
            notify();
        }
    },

    /** A removal of `what` ("Profile 1") is starting. */
    markRemoval(what: string): void {
        mark = { what: sentence(what), at: Date.now() };
    },

    /** The removal marked a moment ago, once: null when there is none. */
    takeRemoval(): string | null {
        const taken = mark && Date.now() - mark.at <= MARK_LIFETIME ? mark.what : null;
        mark = null;
        return taken;
    },

    /** Calls `listener` on every change of the offer; returns the unsubscribe. */
    subscribe(listener: Listener): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }

};

/**
 * After an answer changed from `before` to `after`: when a removal was
 * marked and it took away something a person wrote, offers to put it
 * back -- into the answer as it will be then (`read`), through `write`.
 * An empty row removed, or a change nobody marked, offers nothing.
 */
export function offerRemovalUndo(
    before: unknown,
    after: unknown,
    read: () => unknown,
    write: (value: unknown) => void
): void {

    const what = UndoService.takeRemoval();

    if (!what) {
        return;
    }

    const patches = removalPatches(before, after);

    if (!removesContent(patches)) {
        return;
    }

    UndoService.offer(what + " removed.", () => write(undoRemoval(read(), patches)));

}
