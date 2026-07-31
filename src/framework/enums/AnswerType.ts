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
    ProfileCards = "profile-cards",

    /**
     * A single card holding exactly 3 fixed variants laid
     * out in a "T" shape instead of tab-switched: the first
     * variant spans the full width across the top, then a
     * horizontal divider, then the second and third variants
     * side by side underneath (a vertical divider between
     * them). All 3 are visible and editable at once -- unlike
     * Fixed Variant Text's own tab-switched cards, where only
     * one variant shows at a time -- because this is meant for
     * a small, always-relevant reference (like an Operations
     * Handbook) that reads best as one glance-able card rather
     * than three separate small documents to click between.
     * Each field starts at a 2-line default height and grows
     * to fit its own content, and the card as a whole grows to
     * fit whichever field is currently tallest.
     *
     * Shares the exact same underlying value shape as Fixed
     * Variant Text (a Record<string,string> keyed by each
     * variant's slugged id) -- a Section can switch between
     * the two Structures without any data migration, since the
     * variant ids themselves don't change.
     *
     * Example: the Operations System's Handbook.
     */
    TLayoutText = "t-layout-text",

    /**
     * A three-level record hierarchy: Processes,
     * each optionally holding several SOPs, each
     * optionally holding several Steps.
     *
     * A Process with 0 or 1 SOP renders its Steps
     * directly -- the SOP level (its own nested
     * table) only appears once a second SOP is
     * added. The data always holds the full three
     * levels; the middle one just doesn't render
     * when there's nothing to disambiguate.
     *
     * Example: the Operations System's Process
     * Library.
     */
    ProcessLibrary = "process-library"

}