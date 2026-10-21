import { ReactNode } from "react";
import { BusinessEngagementValue } from "../../../../framework/engine/AnswerUtils.ts";
import { InfoPoint } from "../../fields/InfoNote.tsx";
import type { OpenPage } from "../../tiles/jumpTo.ts";

export interface BusinessEngagementEditorProps {

    /** The Customer Channel section as a tile for each channel (each opening its table in a dialog), as the other pages are drawn. */
    asTiles?: boolean;

    value: unknown;

    onChange: (value: BusinessEngagementValue) => void;

    disabled?: boolean;

    /** See AnswerRendererProps.showInstructions. */
    showInstructions?: boolean;

    /** See AnswerRendererProps.columnsDivider. */
    columnsDivider?: ReactNode;

    /**
     * Page 1's answer: the Segments, Profiles and Offerings this
     * whole page is answered against.
     *
     * Everything drawn from it is a REFERENCE. Nothing here is
     * copied into this page's own value, which holds ids only -- so
     * renaming a Profile on Page 1 renames it here, and the two
     * pages cannot disagree about what exists.
     */
    foundation?: unknown;

    /**
     * Opens Page 1, for the reference links: "The user must be able
     * to access the relevant source information through links."
     */
    onOpenFoundation?: OpenPage;

    /**
     * 3. Infrastructure & Capability's answer: the Resource cards a
     * channel's resources are (ChannelResources.ts), read by id.
     */
    capability?: unknown;

    /** Writes 3. Infrastructure & Capability (a channel's resource made, renamed or taken away). */
    onChangeCapability?: (value: unknown) => void;

    /** Opens 3. Infrastructure & Capability, at a resource's card. */
    onOpenCapability?: OpenPage;

    /** The organisation's currency, for what a channel's resources cost. */
    currency?: string;

}

/**
 * The Business System's Customer Engagement section (see
 * AnswerType.BusinessEngagement).
 *
 * Two sections, in the order the specifications set: how the
 * organization reaches and serves its customers, and what kind of
 * relationship it keeps with each of them. The second picks the
 * channels the first defines, which is why they are one page and
 * one editor rather than two.
 *
 * THE CUSTOMER SEGMENT OWNS BOTH, exactly as it owns all four of
 * Page 1's subsections. A channel card's reference header shows
 * "the selected Customer Segment", its Profiles and its Offerings;
 * a relationship is held with a Profile, whose Offerings and
 * Channels are that Segment's. So this page is one card per
 * Segment, drawn in that Segment's own colour -- the same card, on
 * the next page, continuing the same work.
 */
/**
 * What is NOT empty space while the Customer Channel table isolates something
 * (a click on it keeps the isolation): any control, a field, a line of an
 * action list (its number, text and symbols), a resource card or chip, a
 * floating list, tooltip or note, and a label.
 */
export const CONTENT_OF_THE_TABLE = [
    "button", "a", "input", "textarea", "select", "label", "summary",
    "[role='button']", "[role='option']", "[role='listbox']", "[role='tooltip']", "[role='dialog']", "[role='status']", "[role='alert']",
    "[contenteditable='true']",
    ".numbered-list-row", ".business-channel-resource", ".notepad-chip", ".option-picker", ".app-tooltip", ".info-note"
].join(", ");

/** What the Demand & Conversion block is for, and where its result goes: its title's "i". */
export const DEMAND_BLOCK_HELP: InfoPoint[] = [
    "Where this Offering\u2019s customers come from, and so how many sales to expect. One source with a figure is enough; add more, or calculate them, as the business develops.",
    "The Expected Sales are used for Delivery on Infrastructure & Capability and for this Offering\u2019s revenue on Sustainability."
];
