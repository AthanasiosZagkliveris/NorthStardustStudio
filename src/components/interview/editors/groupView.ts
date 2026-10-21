import { useSyncExternalStore } from "react";

/**
 * HOW A GROUP OF CARDS UNDER ONE PARENT IS SHOWN (the Goals of a Theme, the Objectives of a Goal, the Metrics of an Objective): ONE card at a
 * time, in the group's place in its parent's layout, or all of them as tiles. A card is brought forward by its arrows (left and right), by its
 * bullet in the card's rail, or by pressing its tile; the symbol of four arrows at the card's x shows the group as tiles. Held in the page, not in
 * the saved answer: a way of looking at the cards, not data.
 */
interface GroupState {
    selected: string;
    tiles: boolean;
    /** Which way the card came in from, for its slide. */
    direction: "next" | "previous";
}

const states = new Map<string, GroupState>();
const listeners = new Set<() => void>();
let version = 0;

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

function write(groupId: string, state: GroupState) {
    states.set(groupId, state);
    version += 1;
    listeners.forEach(listener => listener());
}

export interface GroupView {
    /** The id of the card shown ("" where there is none). */
    selected: string;
    /** Its place among the cards. */
    index: number;
    /** The group is shown as tiles. */
    tiles: boolean;
    direction: "next" | "previous";
    /** Brings a card forward (and leaves the tiles). */
    select: (id: string) => void;
    setTiles: (on: boolean) => void;
}

export function useGroupView(groupId: string, ids: readonly string[]): GroupView {

    useSyncExternalStore(subscribe, () => version);

    const state = states.get(groupId);
    const selected = state && ids.includes(state.selected) ? state.selected : (ids[0] ?? "");
    const index = ids.indexOf(selected);

    return {
        selected,
        index,
        tiles: state?.tiles ?? false,
        direction: state?.direction ?? "next",
        select: (id: string) => {
            const at = ids.indexOf(id);
            write(groupId, { selected: id, tiles: false, direction: at >= 0 && at < index ? "previous" : "next" });
        },
        setTiles: (on: boolean) => write(groupId, { selected, tiles: on, direction: state?.direction ?? "next" })
    };

}
