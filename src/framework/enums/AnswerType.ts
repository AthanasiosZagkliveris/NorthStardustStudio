export enum AnswerType {

    FreeText = "free-text",

    FixedVariantText = "fixed-variant-text",

    Table = "table",

    Checklist = "checklist",

    /**
     * A fixed set of named cards, each
     * holding its own reorderable list of
     * free-text entries (add/remove/move
     * up/down).
     *
     * Example: a "Revenue Model" answer
     * with a "Revenue Stream" card and a
     * "Revenue Method" card, each listing
     * the organization's own entries.
     */
    CardList = "card-list",

    /**
     * A dynamic, addable set of cards,
     * each with a one-line title and the
     * same fixed set of subtitled text
     * fields.
     *
     * Example: "Customer Profiles", where
     * every card has a title plus Needs/
     * Challenges/Goals text fields, and a
     * "+" control adds another card.
     */
    ProfileCards = "profile-cards"

}