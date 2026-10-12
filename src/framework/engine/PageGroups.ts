/**
 * PAGES THAT HOLD SEVERAL SECTIONS (the Identity and Brand Systems): a page shows the frames of its sections side by side, as the Business System's
 * Infrastructure & Capability page does. Each section keeps its own saved answer, its own number and its own title (the frame's heading); only the page
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

}

export const PAGE_GROUPS: readonly PageGroup[] = [
    { systemNumber: 1, members: [1, 2], title: "Definition and Ethics", inHeader: true },
    { systemNumber: 1, members: [3, 4], title: "Organization", inHeader: true, frameTitles: ["Legal Entity", "Founders & Capability"] },
    { systemNumber: 2, members: [1, 2], title: "Brand System", inHeader: false },
    // The Strategy System is one page: its Situation & Direction (the Strategic Period's Goals and Objectives are written in each Theme's card there).
    { systemNumber: 4, members: [1], title: "Strategy System", inHeader: false }
];

/**
 * SECTIONS THAT ARE NOT PAGES AT ALL: they keep their place in the saved answer (the Strategy System keeps the Strategic Period's Goals, Objectives,
 * Initiatives and Metrics under its second section, and the Roadmap draws from it) but no page, bullet, arrow or title shows them.
 */
export const HIDDEN_SECTIONS: readonly { systemNumber: number; sections: readonly number[]; primary: number }[] = [
    { systemNumber: 4, sections: [2, 3], primary: 1 }
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
