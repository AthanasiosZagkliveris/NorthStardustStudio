import { VariantDefinition } from "./VariantDefinition.ts";

/**
 * Defines a single fixed trailing card
 * appended after a Profile Cards
 * answer's addable cards.
 *
 * Example: Competitor Analysis's
 * "Market Position" card, which is
 * always present (not addable/
 * removable) and holds a single free-
 * text description instead of the
 * subtitled fields every other card
 * has.
 */
export interface ProfileCardsTrailingCard {

    /**
     * Unique Framework identifier.
     */
    id: string;

    /**
     * Display title.
     */
    title: string;

    /**
     * Placeholder text shown in the
     * card's free-text field.
     */
    placeholder?: string;

}

/**
 * Defines a Framework Profile Cards
 * answer: a dynamic, addable set of
 * cards, each with a one-line title
 * and the same fixed set of subtitled
 * text fields.
 */
export interface ProfileCardsDefinition {

    /**
     * Prefix used to auto-number newly
     * added cards (e.g. "Customer Group"
     * becomes "Customer Group 4").
     */
    cardLabel: string;

    /**
     * The subtitled text fields every
     * addable card has.
     *
     * Example:
     * - Needs
     * - Challenges
     * - Goals
     */
    subtitles: VariantDefinition[];

    /**
     * Number of cards shown before the
     * user adds any more.
     */
    initialCount: number;

    /**
     * Optional fixed card appended after
     * the addable cards.
     */
    trailingCard?: ProfileCardsTrailingCard;

}
