import { createContext, useContext } from "react";
import { type TileStore } from "./segmentPage.ts";

/*
    A PAGE OF ONE CHAPTER MADE FROM SEVERAL SECTIONS (PageGroups.ts, `oneChapter`; owner, 2026-11-20 02:11 UTC+2: "The financials should be in a single page. Maybe
    they should all be under only one chapter."): the Financials' two sections draw ONE chapter. The page's other section (Costs, Funding & Position) stays drawn --
    so what it does when it opens is done as before -- and hands its tiles to the page's own section through this store, which draws the one frame, every tile in the
    order each reads only what stands before it (doc 48, section 11). The way Foundation & Engagement joins its two sections (segmentPage.ts), with one key.
*/

/** The key a joined page's tiles are handed under. */
export const JOINED_CHAPTER_KEY = "chapter";

/** The key the Legal Entity hands its tile under, to the Identity System's Definition chapter (PageGroups.ts, `handsTiles`; owner, 2026-11-20 13:02 UTC+2). */
export const HANDED_TILES_KEY = "handed";

/** The key Costs, Funding & Position hands its cash chart under, to the Financials' Cash Flow tile (doc 48, section 13, step 4): the chart's drawing as a tile's content. */
export const CASH_CHARTS_KEY = "cash-charts";

export const JoinedChapterContext = createContext<TileStore | null>(null);

/** The store of the page's one chapter, where the page joins its sections into one; null on every other page. */
export function useJoinedChapter(): TileStore | null {
    return useContext(JoinedChapterContext);
}
