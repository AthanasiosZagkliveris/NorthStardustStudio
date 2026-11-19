import { createContext, useContext } from "react";

/*
    A PAGE OF ONE SEGMENT AT A TIME (PageGroups.ts, `oneSegmentAtATime`; the owner's approved plan of 2026-11-18, step 2): the Business System's
    Foundation & Engagement shows the chapters of one Segment, the one chosen on the page's Segment rail. Each editor still draws every Segment -- so
    what an editor does when it opens (Engagement's on-open saves) is done for each, as before -- and hides the others. A jump to a part of a hidden
    Segment (a note, a link, a Glossary place, a search) first shows that Segment, then lands: the same way a jump presses the tile that holds a card.
*/

/** The Segment a page of one Segment at a time shows, and how to show another. */
export interface SegmentPage {

    /** The Segment shown: its id, as both answers key it. */
    segmentId: string;

    /** Shows another Segment. */
    select: (segmentId: string) => void;

    /** Where the Segment's own head (its name, its x) stands, over the page's chapters; null until it is drawn. */
    head: HTMLElement | null;

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
