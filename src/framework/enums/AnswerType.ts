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
    ProcessLibrary = "process-library",

    /**
     * A log of dated entries, always kept sorted
     * chronologically (oldest first) rather than
     * by insertion/manual order, with an optional
     * live reference back to a Process Library
     * entry and a fixed set of change-type choices.
     *
     * Example: the Operations System's Operational
     * Log.
     */
    OperationalLog = "operational-log",

    /**
     * A read-mostly view DERIVED from a Process
     * Library elsewhere in the same System: one
     * group per distinct Process Owner (sorted
     * alphabetically), listing each of their
     * Processes (in Process Library order) as a
     * "Responsibility", with only a per-Process
     * Notes field actually editable here. Owner and
     * Responsibility can only change by editing the
     * Process Library itself.
     *
     * Example: the Operations System's Roles &
     * Responsibilities.
     */
    RolesResponsibilities = "roles-responsibilities",

    /**
     * An ordered sequence of independent sub-answers, each
     * with its own optional label, each its own Answer
     * Structure (Free Text, Table, Fixed Variant Text, ...).
     *
     * Declared in the Answer Definition Resource as more than
     * one "**Label**" / "Structure: ..." block inside the same
     * Section (see AnswerParser.parse) -- e.g. the Finance
     * System's Financial Risk, which is a Description table, an
     * Evaluation table, a Mitigation Measures table, and a
     * Contingency Plan table, one after another, all under the
     * same Section.
     *
     * A response value here is a Record<string, unknown> keyed
     * by each part's own `id`, holding that part's own native
     * value shape -- so an individual part is persisted/
     * exported/validated exactly the way it would be if it were
     * a whole Section on its own.
     */
    MultiPart = "multi-part",

    /**
     * Renders ANOTHER System's Section in place, reading and
     * writing that System's own saved answers rather than keeping
     * a copy of its own. The two Sections are one piece of data
     * seen from two places -- editing either updates the same
     * stored response.
     *
     * Declared as `**Structure:** Shared Answer` plus a
     * `**Source:** <System Title> / <Section Title>` line naming
     * what to mirror. The source Section's own Answer Definition
     * (and its per-part questions) is what actually renders, so
     * the content is authored once and can never drift between
     * the two Systems.
     *
     * Example: the Brand System's Brand Foundation page, which is
     * the Identity System's "Imagine your best Ambassador." page
     * -- the same four columns, the same answers, edited from
     * either System.
     */
    SharedAnswer = "shared-answer",

    /**
     * The Brand System's Style page: a fixed, three-column
     * editor holding a bounded colour palette (up to 6 slots --
     * Primary/Secondary/Neutral in an A and a B column, each with
     * a name, HEX, live swatch and usage note), up to 3 typefaces
     * (font + purpose), and a 5-level text hierarchy sized in px.
     *
     * Hand-built rather than assembled from Tables for the same
     * reason the Process Library is: the slots are fixed and
     * individually labelled, the HEX field drives a live colour
     * sample, and none of that is expressible as rows of a generic
     * table. See Framework Conventions & Patterns on when a
     * bespoke editor is justified.
     */
    BrandStyle = "brand-style",

    /**
     * The Brand System's Inventory page: two columns holding the
     * brand's core image assets -- an Icon and a Logo (each as a
     * PNG and an SVG, with previews), and 2-5 brand images each
     * carrying a name and a short description.
     *
     * Uploaded images are downscaled in the browser and stored
     * inline as data URLs, since this app persists everything to
     * localStorage and has no filesystem access (see
     * BrandInventoryEditor for the size caps that keeps within).
     */
    BrandInventory = "brand-inventory",

    /**
     * The Strategy System's Foundation page: four columns holding
     * the organization's current situation, a four-quadrant SWOT
     * built from lists, its long-term direction, and the Strategic
     * Period -- a start and end month/year plus the Strategic
     * Themes that period is organized around.
     *
     * The Period and Themes defined here are the source the other
     * two Strategy pages read: Section 2 develops each Theme, and
     * Section 3 draws both across a timeline. Neither keeps a copy
     * of them.
     */
    StrategyFoundation = "strategy-foundation",

    /**
     * The Strategy System's Strategic Period page: one box per
     * Theme inherited from the Foundation page, each holding
     * Goals, each Goal holding Objectives, and each Objective
     * holding an Initiative list and Metrics.
     *
     * The Theme name and description are read-only here -- they
     * belong to the Foundation page. Numbering follows the nesting
     * (Theme 4.1, its first Goal 4.1.1, that Goal's first
     * Objective 4.1.1.1, its Initiative list 4.1.1.1.1 and its
     * first Metric 4.1.1.1.2.1) and is derived from position, so
     * reordering renumbers everything automatically.
     */
    StrategicPeriod = "strategic-period",

    /**
     * The Strategy System's Roadmap page: the Strategic Period
     * drawn as a horizontal timeline with a bar for every
     * Objective, grouped under its Theme and Goal, and each
     * Objective's Initiatives listed inside its bar.
     *
     * Generated entirely from the other two pages -- nothing here
     * is editable. The only value it stores is which time markers
     * to draw (fit/month/quarter), which is a view setting rather
     * than content.
     */
    StrategicRoadmap = "strategic-roadmap",

    /**
     * The Identity System's Legal Entity page: what the organization
     * is legally, who owns it, how it was registered, how it is
     * identified for tax, what else the law asks of it, and what all
     * of that costs.
     *
     * Six subsections, each a different shape -- four plain fields,
     * a founder table with a running ownership total, two lists of
     * registration numbers, a conditional tax block, an open list of
     * legal requirements, and an expense table whose rows link back
     * to entries made further up the same page. None of that is a
     * Table or a set of Columns, which is why it is its own
     * Structure rather than an assembly of existing ones (see
     * Framework Conventions & Patterns).
     *
     * What the page offers adapts to the Country and Legal Form
     * chosen at the top of it -- the name of the consumption tax,
     * whether capital is asked about, which legal requirements are
     * marked as commonly applying. See LegalEntityJurisdictions for
     * how far that knowledge goes and where it stops.
     */
    LegalEntity = "legal-entity",

    /**
     * The Identity System's Founders Profile page: one card per
     * founder the Legal Entity page names, asking what lenders and
     * investors read to judge whether this team can carry out the
     * plan -- each founder's roles, industry and management
     * experience, key achievements and skills & qualifications --
     * then which skills the team lacks and how they are covered.
     *
     * The founders themselves (who they are, in what order) belong
     * to Legal Entity › 2. Founders & Ownership; this page only
     * describes them, keyed by the Legal Entity founder's id (see
     * founderProfiles in AnswerUtils). Its own Structure for the
     * same reason Legal Entity is: its cards are drawn from another
     * page's answer, which no Table or Columns layout can do.
     */
    FoundersProfile = "founders-profile",

    /**
     * The Business System's Foundation page (Page 1 of 5): who the
     * organization serves, who else serves them, what it promises,
     * and what it actually sells.
     *
     * Four equal-width columns, which is the one thing here the
     * existing Columns layout already does (see
     * AnswerDefinition.columns). What it cannot do is what each
     * column holds:
     *
     * - Customer Segments and Profiles -- Segment cards with Profile
     *   cards NESTED inside them, capped at 2 and 3 respectively.
     *   ProfileCards has the right field shape but cannot nest, and
     *   enforces no maximum.
     * - Competitors and Alternatives -- cards carrying a SELECT
     *   (competitor Type) alongside their text fields, which no card
     *   structure offers; selects live only in Table columns.
     * - Value Proposition -- free text, but one per Customer
     *   Segment rather than one per page.
     * - Offerings -- cards whose "Needs Addressed" choices are the
     *   Needs typed into the FIRST column of the same page, which
     *   dynamicSource cannot express: it reads a Card List card or a
     *   Table column in another Section, not a sibling column's
     *   bespoke value.
     *
     * So the page is one Structure rather than an assembly of
     * existing ones, for the same reason the Legal Entity page is
     * (see Framework Conventions & Patterns). Its specification is
     * docs/specifications/business-system/page-1-foundation.md, and
     * the mapping that placed it here is the README beside it.
     */
    BusinessFoundation = "business-foundation",

    /**
     * The Business System's Customer Engagement page (Page 2 of 5):
     * how the organization reaches, sells to, delivers to and
     * supports the customers Page 1 defines, and what kind of
     * relationship it maintains with each of them.
     *
     * Two sections that run one after the other rather than side by
     * side -- Channels, then Customer Relationships, which picks the
     * Channels the first one defines.
     *
     * Its own structure, for the same reason Page 1 has one. What no
     * existing Structure can express:
     *
     * - The whole page is answered AGAINST PAGE 1. Its Segments,
     *   Profiles and Offerings are references held by id, never
     *   copies, and dynamicSource reads a Card List card or a Table
     *   column in another Section -- not a bespoke editor's value,
     *   and not three different things out of one.
     * - Channels nest: a category is a container, drawn once, with
     *   its specific channels under it. No card or table nests rows
     *   under a heading that is itself chosen from a fixed list.
     * - A channel's Actions are a list PER SELECTED JOURNEY STAGE,
     *   so the selection of one field builds the slots of another.
     * - Customer Relationships is a four-level tree of exactly that
     *   kind -- Relationship Type -> Offering -> Journey Stage ->
     *   Channel, Approach and Goal -- where every level is built
     *   from what was ticked at the level above. The closest thing
     *   the framework already has is StrategicPeriod, and that is a
     *   different tree.
     *
     * Its specifications are
     * docs/specifications/business-system/page-2-section-1-channels.md
     * and page-2-section-2-customer-relationships.md, with the
     * worked example beside them.
     */
    BusinessEngagement = "business-engagement",

    /**
     * The Business System's Infrastructure & Capability page (Page 3
     * of 5): what the organization needs to exist and operate, and
     * what each Offering needs on top of that.
     *
     * Two sections holding the same three subsections -- Resources,
     * Activities, Partners & Suppliers -- and the reason this is
     * its own Structure rather than an assembly of existing ones is
     * that THE THREE WRITE INTO EACH OTHER:
     *
     * - A resource marked "Provided" needs a provider chosen from
     *   the third subsection, or created there from the resource.
     * - One marked "Needs Activity" or "Needs Investigation" creates
     *   an activity under the second, filed in the right category.
     * - An activity names the founder responsible for it, and that
     *   founder's Responsibilities list in the FIRST subsection is
     *   built from those names rather than typed.
     *
     * No card, table or column structure in the framework can write
     * into a sibling subsection, and none can hold a fixed set of
     * named subsections that also takes additions.
     *
     * Its specification is
     * docs/specifications/business-system/page-3-infrastructure-and-capability.md.
     */
    BusinessCapability = "business-capability",

    /**
     * The Business System's Financial Foundation page (Page 4 of
     * 5): Costs → Funding Need → Capital & Funding → Financial
     * Position.
     *
     * Its own Structure because most of it is READ or CALCULATED:
     * the costs are consolidated from the Legal Entity and Page 3
     * rather than typed again, and the Financial Position -- funding
     * gap, runway, cash timeline, loan repayments -- is worked out
     * from the three sections above it (see FinancialModel.ts).
     *
     * Its specification is
     * docs/specifications/business-system/page-4-financial-foundation.md.
     */
    FinancialFoundation = "financial-foundation",

    /**
     * The Business System's Financial Sustainability page (Page 5 of
     * 5): Revenue, and Break Even measured against the financial
     * position Page 4 establishes -- can revenue cover the costs
     * before the money runs out?
     *
     * Reads Page 1's Offerings and all of Page 4, so it is a Structure
     * of its own for the same reason Page 4 is.
     *
     * Its specification is
     * docs/specifications/business-system/page-5-financial-sustainability.md.
     */
    FinancialSustainability = "financial-sustainability"

}