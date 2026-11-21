/**
 * PAGES THAT HOLD SEVERAL SECTIONS (the Identity and Brand Systems, and the Business System's Financials): a page shows the frames of its sections side
 * by side, as the Business System's Infrastructure & Capability page does. Each section keeps its own saved answer, its own number and its own title (the frame's heading); only the page
 * is shared. The first section of a page is the page's own; the others are its COMPANIONS, drawn beside it and not pages of their own.
 */
export interface PageGroup {

    /** The System's number. */
    systemNumber: number;

    /** The sections' numbers, the page's own first. */
    members: readonly number[];

    /** The page's name in the pages rail. */
    title: string;

    /** Whether the header says it too (a System of the one page has no need to). */
    inHeader: boolean;

    /** The frames' headings, where they are not the sections' titles. */
    frameTitles?: readonly string[];

    /** Whether the page shows one Segment at a time, chosen on its Segment rail (both sections keyed by the same Segment id: segmentPage.ts). */
    oneSegmentAtATime?: boolean;

    /** The page's sections drawn as ONE chapter of this name, the page's own section drawing it with the tiles the others hand it (joinedChapter.ts). */
    oneChapter?: string;

    /** A section of the page that draws no frame: it hands its tiles to the page's own section's chapter (joinedChapter.ts), which draws them after its own. */
    handsTiles?: number;

}


export const PAGE_GROUPS: readonly PageGroup[] = [
    // (Mission and Vision are saved in Definition, the first section, and drawn in Purpose as one pair tile: Questions 9.)
    // THE IDENTITY SYSTEM, ONE PAGE (owner, 2026-11-20 13:02 UTC+2: "Legal Entity - Move the master Tile to the 1st page, in the Definition Chapter. 1. Identity System
    // will have only one page."): the Legal Entity (section 3) draws no frame; its Registrations & Expenses tile stands in the Definition chapter's fourth place. It keeps
    // its number, its saved answer, its ids and its dialog.
    { systemNumber: 1, members: [1, 2, 3], title: "Identity System", inHeader: false, handsTiles: 3 },
    // (The Founders Profile, the fourth section, is no frame of its own: its founders are tiles in the Founders & Ownership dialog and its Capability a tile beside it. It keeps its saved answer.)
    { systemNumber: 2, members: [1, 2], title: "Brand System", inHeader: false },
    // FOUNDATION & ENGAGEMENT (the owner's approved plan of 2026-11-18, step 2): the Business System's Foundation and Customer Engagement are one page, one Segment at a
    // time, each Segment ONE chapter of its seven Master Tiles in its own hue (owner, 2026-11-19: "Place all the Tiles in the same chapter, adjusting the colours per
    // segment"), headed by its name. Each section keeps its number, its title and its saved answer.
    { systemNumber: 3, members: [1, 2], title: "Foundation & Engagement", inHeader: true, oneSegmentAtATime: true },
    // FINANCIALS (owner, 2026-11-18, step 1; 2026-11-20 02:11 UTC+2: "Maybe they should all be under only one chapter."): Revenue & Pricing and Costs, Funding &
    // Position are one page of ONE chapter, Financial Foundation: its three Master Tiles that ask, Revenue Streams, Costs and Funding (Questions 20, sections 11 and 14).
    // Each section keeps its number, its title and its saved answer.
    { systemNumber: 3, members: [4, 5], title: "Financials", inHeader: true, oneChapter: "Financial Foundation" },
    // The Strategy System is one page: its Situation & Direction (the Strategic Period's Goals and Objectives are written in each Theme's card there).
    { systemNumber: 4, members: [1], title: "Strategy System", inHeader: false }
];

/**
 * SECTIONS THAT ARE NOT PAGES AT ALL: they keep their place in the saved answer (the Strategy System keeps the Strategic Period's Goals, Objectives,
 * Initiatives and Metrics under its second section, and the Roadmap draws from it) but no page, bullet, arrow or title shows them.
 */
export const HIDDEN_SECTIONS: readonly { systemNumber: number; sections: readonly number[]; primary: number }[] = [
    { systemNumber: 4, sections: [2, 3], primary: 1 },
    { systemNumber: 1, sections: [4], primary: 1 }
];

/** Whether the section is kept out of the pages. */
export function isHidden(systemNumber: number | undefined, sectionNumber: number): boolean {
    return systemNumber !== undefined && HIDDEN_SECTIONS.some(entry => entry.systemNumber === systemNumber && entry.sections.includes(sectionNumber));
}

/** The group a section belongs to, if its System groups it. */
export function groupOf(systemNumber: number | undefined, sectionNumber: number): PageGroup | undefined {
    return systemNumber === undefined ? undefined : PAGE_GROUPS.find(group => group.systemNumber === systemNumber && group.members.includes(sectionNumber));
}

/** Whether the section is drawn beside another's, not as a page of its own. */
export function isCompanion(systemNumber: number | undefined, sectionNumber: number): boolean {
    const group = groupOf(systemNumber, sectionNumber);
    return (!!group && group.members[0] !== sectionNumber) || isHidden(systemNumber, sectionNumber);
}

/** The page's own section for any of its sections. */
export function primaryOf(systemNumber: number | undefined, sectionNumber: number): number {
    const hidden = systemNumber === undefined ? undefined : HIDDEN_SECTIONS.find(entry => entry.systemNumber === systemNumber && entry.sections.includes(sectionNumber));
    return hidden?.primary ?? groupOf(systemNumber, sectionNumber)?.members[0] ?? sectionNumber;
}
