import { createContext, useContext, useSyncExternalStore } from "react";
import type { SectionTile } from "./SectionTileTypes.ts";

/*
    A PAGE OF ONE SEGMENT AT A TIME (PageGroups.ts, `oneSegmentAtATime`; the owner's approved plan of 2026-11-18, step 2): the Business System's
    Foundation & Engagement shows the chapter of one Segment, the one chosen on the page's Segment rail: ONE frame holding the Segment's seven Master Tiles
    (owner, 2026-11-19: "Place all the Tiles in the same chapter, adjusting the colours per segment"). The Foundation editor draws the frame of every Segment
    and hides the others; the Engagement editor stays drawn -- so what it does when it opens (its on-open saves) is done for each Segment, as before -- and
    hands each Segment's three tiles to that frame through the page's tile store, by the Segment's id. A jump to a part of a hidden
    Segment (a note, a link, a Glossary place, a search) first shows that Segment, then lands: the same way a jump presses the tile that holds a card.
*/

/** The Segment a page of one Segment at a time shows, and how to show another. */
export interface SegmentPage {

    /** The Segment shown: its id, as both answers key it. */
    segmentId: string;

    /** Shows another Segment. */
    select: (segmentId: string) => void;

    /** The tiles the page's other section gives each Segment's chapter, by the Segment's id. */
    companionTiles: TileStore;

}

export const SegmentPageContext = createContext<SegmentPage | null>(null);

/** The page's chosen Segment, where the page shows one Segment at a time; null on every other page. */
export function useSegmentPage(): SegmentPage | null {
    return useContext(SegmentPageContext);
}

/** The event a jump sends to show a hidden Segment; its detail is the Segment's id. */
export const SHOW_SEGMENT_EVENT = "segment-page:show";

/** The attribute that marks a Segment's frame the page is not showing; its value is the Segment's id. */
export const HIDDEN_SEGMENT_ATTRIBUTE = "data-segment-hidden";

/** The attributes of one Segment's frame on a page of one Segment at a time: hidden, and marked, unless it is the one shown. */
export function segmentFrameAttributes(page: SegmentPage | null, segmentId: string): { hidden?: boolean; "data-segment-hidden"?: string } {
    return page && page.segmentId !== segmentId ? { hidden: true, [HIDDEN_SEGMENT_ATTRIBUTE]: segmentId } : {};
}

/** Shows the Segment an element stands in, where the page hides it; true when it had to (the caller waits a moment, then looks again). */
export function revealSegmentOf(element: Element | null | undefined): boolean {
    const hidden = element?.closest<HTMLElement>("[" + HIDDEN_SEGMENT_ATTRIBUTE + "]");
    if (!hidden) {
        return false;
    }
    document.dispatchEvent(new CustomEvent(SHOW_SEGMENT_EVENT, { detail: hidden.getAttribute(HIDDEN_SEGMENT_ATTRIBUTE) }));
    return true;
}

/** The tiles one editor hands another's chapter, by the Segment's id: set while the giving editor draws, read by the chapter, which draws again when they change. */
export interface TileStore {
    set: (segmentId: string, tiles: SectionTile[]) => void;
    get: (segmentId: string) => SectionTile[];
    /** Tells the chapter the tiles were set again (after the giving editor has drawn). */
    changed: () => void;
    subscribe: (listener: () => void) => () => void;
    version: () => number;
}

export function createTileStore(): TileStore {
    const tiles = new Map<string, SectionTile[]>();
    const listeners = new Set<() => void>();
    let version = 0;
    return {
        set: (segmentId, given) => { tiles.set(segmentId, given); },
        get: segmentId => tiles.get(segmentId) ?? [],
        changed: () => { version++; listeners.forEach(listener => listener()); },
        subscribe: listener => { listeners.add(listener); return () => { listeners.delete(listener); }; },
        version: () => version
    };
}

/** Draws again whenever the other section's tiles change (a chapter that holds them). */
export function useCompanionTiles(page: SegmentPage | null): void {
    const store = page?.companionTiles;
    useSyncExternalStore(store?.subscribe ?? noSubscription, store?.version ?? zero);
}

const noSubscription = () => () => {};
const zero = () => 0;
