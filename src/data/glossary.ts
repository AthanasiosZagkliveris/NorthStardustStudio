import type { SourceId } from "../framework/engine/Sources.ts";

/**
 * THE APP'S OWN TERMS, as the Glossary page shows them (Glossary.tsx) and
 * the search finds them (SearchService): the words the app uses on its
 * pages, each with one plain sentence or two on what it means here, and
 * the reference that backs it where one does (a `SOURCES` entry, cited
 * in the Harvard style beside the meaning and listed on the References
 * page).
 *
 * This list is the owner of what an app term means TO THE APP USER. The
 * developers' glossary (docs/app/glossary.md) says where each one is
 * decided in the documents; where the two meet, the document decides and
 * this sentence follows it. The terms the app user coins (the names of
 * their Segments, Profiles, Offerings ...) are not here: they are read
 * from the open Organisation (GlossaryService.ts).
 */
export interface AppTerm {
    id: string;
    term: string;
    meaning: string;
    /** Other words the search should find it by. */
    also?: readonly string[];
    /** The references that back the meaning. */
    sources?: readonly SourceId[];
    /** WHERE IN THE APP THE TERM IS USED (owner, 2026-11-10: "where in the app does this term exist"; "Clicking on it should direct the user to that specific
     *  field"): its System, its page (the section's number) and the part of it in words; the tile to open there and the field to bring into view (selectors). */
    places?: readonly { system: number; page: number; part: string; tile?: string; field?: string; card?: "amortisationYears" | "usefulLife" }[];
}

export const APP_TERMS: readonly AppTerm[] = [
    {
        id: "segment",
        term: "Segment",
        places: [{ system: 3, page: 1, part: "a Segment's Description", tile: "button.section-tile[data-field-key$=\"%3Acustomers\"]" }],
        meaning: "A group of your customers who share the same kind of answers: who they are, where they are, what they can spend and how they buy. Each Segment has its own card on Business 1, with its Profiles inside it.",
        also: ["customer group", "target market"],
        sources: ["marketResearch"]
    },
    {
        id: "profile",
        term: "Profile",
        places: [{ system: 3, page: 1, part: "a Segment's Profiles", tile: "button.section-tile[data-field-key$=\"%3Acustomers\"]" }],
        meaning: "One typical person inside a Segment, described by specifics: an exact age, their work, what they care about, how they find, choose, buy and pay. A Profile always belongs to its Segment, and its answers stay within the Segment's.",
        also: ["persona", "customer profile"]
    },
    {
        id: "competitor",
        term: "Competitor",
        places: [{ system: 3, page: 1, part: "a Segment's Competitors", tile: "button.section-tile[data-field-key$=\"%3Acompetitors\"]" }],
        meaning: "Another business, or another way of solving the same need, that your customers could choose to meet it.",
        also: ["competition", "competitive analysis"],
        sources: ["marketResearch"]
    },
    {
        id: "offering",
        term: "Offering",
        places: [{ system: 3, page: 1, part: "a Segment's Offerings", tile: "button.section-tile[data-field-key$=\"%3Aofferings\"]" }, { system: 3, page: 5, part: "Revenue", field: "[data-field-key=\"3.5:revenue\"]" }],
        meaning: "What you sell: a product, a service or a hybrid of the two, with its price, its costs and the sales you expect.",
        also: ["product", "service"]
    },
    {
        id: "value-proposition",
        term: "Value Proposition",
        places: [{ system: 3, page: 1, part: "a Segment's Value Proposition", tile: "button.section-tile[data-field-key$=\"%3Avalue-proposition\"]" }],
        meaning: "Why a Segment chooses to buy from you: the need you meet, what sets you apart and the result the buyer gets.",
        sources: ["positioningStatement"]
    },
    {
        id: "positioning",
        term: "Positioning",
        places: [{ system: 1, page: 1, part: "Core Market Positioning", tile: "button.section-tile[data-field-key=\"1.1:positioning\"]" }],
        meaning: "The place you choose to hold in your buyers' minds against the competitors: who you serve, how you differ and why it matters to them. The tile is called Early Positioning while planning and launching, Core Market Positioning while managing, and Corporate & Portfolio Positioning while growing.",
        also: ["Early Positioning", "Core Market Positioning", "Corporate & Portfolio Positioning", "strategic positioning"],
        sources: ["strategicPositioning", "positioningTemplate"]
    },
    {
        id: "positioning-statement",
        term: "Positioning statement",
        places: [{ system: 1, page: 1, part: "Core Market Positioning", tile: "button.section-tile[data-field-key=\"1.1:positioning\"]" }],
        meaning: "A short statement of who the offering is for, what need it meets, what kind of offering it is, and how it differs from the alternatives.",
        sources: ["positioningStatement", "brandPositioningStatement"]
    },
    {
        id: "business-stage",
        term: "Business stage",
        places: [{ system: 1, page: 1, part: "Core Market Positioning", tile: "button.section-tile[data-field-key=\"1.1:positioning\"]" }],
        meaning: "Planning, Launching, Managing or Growing. It is worked out from your Opening Date and the four durations in Global Settings, never chosen, and it decides which Positioning questions are open.",
        also: ["Planning", "Launching", "Managing", "Growing"]
    },
    {
        id: "opening-date",
        term: "Opening Date",
        places: [{ system: 1, page: 1, part: "the Organisation, Opening Date", tile: "button.section-tile[data-field-key=\"1.1:organization\"]", field: "[data-field-key=\"1.1:organization/opening-date\"]" }],
        meaning: "The date your organisation opens for business, on the Organisation tile. The budget before it is the cash you need to raise.",
        also: ["launch date"]
    },
    {
        id: "b2c-b2b",
        term: "B2C and B2B",
        places: [{ system: 1, page: 1, part: "Core Market Positioning, Seller & Buyer Relationship", tile: "button.section-tile[data-field-key=\"1.1:positioning\"]", field: "[data-field-key=\"1.1:positioning/seller-and-buyer-relationship\"]" }],
        meaning: "Business to consumer: you sell to people who pay for their own or their family's use. Business to business: you sell to companies, organisations or freelancers.",
        also: ["B2C", "B2B", "seller and buyer relationship", "business to consumer", "business to business"],
        sources: ["positioningStatement"]
    },
    {
        id: "buyer-end-user",
        term: "Buyer and end user",
        places: [{ system: 1, page: 1, part: "Core Market Positioning, Seller & Buyer Relationship", tile: "button.section-tile[data-field-key=\"1.1:positioning\"]", field: "[data-field-key=\"1.1:positioning/seller-and-buyer-relationship\"]" }],
        meaning: "The buyer is the one who pays; the end user is the one who uses what is bought. They are the same person for a Direct Buyer and different people for a Proxy Buyer.",
        also: ["buyer", "end user", "economic buyer", "decision maker"],
        sources: ["buyingRoles"]
    },
    {
        id: "direct-buyer",
        term: "Direct Buyer",
        places: [{ system: 1, page: 1, part: "Core Market Positioning, Seller & Buyer Relationship", tile: "button.section-tile[data-field-key=\"1.1:positioning\"]", field: "[data-field-key=\"1.1:positioning/seller-and-buyer-relationship\"]" }],
        meaning: "A buyer who buys only for their own use.",
        sources: ["buyingRoles"]
    },
    {
        id: "proxy-buyer",
        term: "Proxy Buyer",
        places: [{ system: 1, page: 1, part: "Core Market Positioning, Seller & Buyer Relationship", tile: "button.section-tile[data-field-key=\"1.1:positioning\"]", field: "[data-field-key=\"1.1:positioning/seller-and-buyer-relationship\"]" }],
        meaning: "A buyer who buys only on behalf of someone else, so the one who pays is not the one who uses it: a gift, a parent buying for a child, an employer buying for its staff.",
        also: ["gifter"],
        sources: ["buyingRoles"]
    },
    {
        id: "dual-intent-buyer",
        term: "Dual-Intent Buyer",
        places: [{ system: 1, page: 1, part: "Core Market Positioning, Seller & Buyer Relationship", tile: "button.section-tile[data-field-key=\"1.1:positioning\"]", field: "[data-field-key=\"1.1:positioning/seller-and-buyer-relationship\"]" }],
        meaning: "A buyer who buys one offering to be used by themselves and by others who depend on them, such as a family plan.",
        sources: ["buyingRoles"]
    },
    {
        id: "differentiation",
        term: "Differentiation",
        places: [{ system: 3, page: 1, part: "a Segment's Competitors, Differentiation", tile: "button.section-tile[data-field-key$=\"%3Acompetitors\"]" }],
        meaning: "What your offering does differently from the competitors: the gap they leave that you fill, such as a lower cost, more convenience or better performance.",
        sources: ["strategicPositioning"]
    },
    {
        id: "outcome",
        term: "Outcome",
        places: [{ system: 1, page: 1, part: "Core Market Positioning", tile: "button.section-tile[data-field-key=\"1.1:positioning\"]" }],
        meaning: "The measurable result the buyer gets from the offering, which is what they are paying for: lower costs, time saved, less risk, higher quality.",
        also: ["ROI", "return on investment"],
        sources: ["strategicPositioning"]
    },
    {
        id: "break-even",
        term: "Break-even point",
        places: [{ system: 3, page: 5, part: "Break Even", field: "[data-field-key=\"3.5:break-even\"]" }],
        meaning: "The level of sales at which revenue covers all costs, so there is neither profit nor loss. In units: fixed costs ÷ (price − variable cost per unit).",
        also: ["break even", "break-even revenue"],
        sources: ["breakEvenPoint", "breakEvenInDollars"]
    },
    {
        id: "contribution-margin",
        term: "Contribution margin",
        places: [{ system: 3, page: 5, part: "Break Even", field: "[data-field-key=\"3.5:break-even\"]" }],
        meaning: "What each sale leaves to pay the fixed costs and the profit: price − variable costs. The ratio is that amount ÷ price.",
        also: ["contribution"],
        sources: ["contributionMargin"]
    },
    {
        id: "capacity-utilisation",
        term: "Capacity utilisation",
        places: [{ system: 3, page: 5, part: "Break Even, Capacity", field: "[data-field-key=\"3.5:break-even\"]" }],
        meaning: "How much of the time you have available the planned work needs: demand hours ÷ available hours. Above 100% means more work than capacity.",
        also: ["utilisation"],
        sources: ["capacityUtilisation"]
    },
    {
        id: "conversion-rate",
        term: "Conversion rate",
        places: [{ system: 3, page: 2, part: "a Segment's Customer Channels", tile: "button.section-tile[data-field-key^=\"3.2:channel-tile-\"]" }],
        meaning: "The share of visitors or prospects who buy: 5 purchases from 100 visitors is 5%.",
        also: ["buy rate"],
        sources: ["websiteConversion"]
    },
    {
        id: "referral",
        term: "Referral",
        places: [{ system: 3, page: 2, part: "a Segment's Customer Channels", tile: "button.section-tile[data-field-key^=\"3.2:channel-tile-\"]" }],
        meaning: "A new customer sent to you by an existing one. Referred customers tend to stay longer and be worth more than customers from other sources.",
        sources: ["referrals"]
    },
    {
        id: "repeat-rate",
        term: "Repeat rate",
        places: [{ system: 3, page: 2, part: "a Segment's Customer Relationship", field: "[data-field-key^=\"3.2:customer-relationship\"]" }],
        meaning: "The share of customers who buy again. Only their extra purchases are counted, never the customers twice.",
        also: ["repeat customers", "retention"],
        sources: ["repeatCustomers"]
    },
    {
        id: "customer-lifetime",
        term: "Customer lifetime",
        places: [{ system: 3, page: 2, part: "a Segment's Customer Relationship", field: "[data-field-key^=\"3.2:customer-relationship\"]" }],
        meaning: "How long a client stays on average before leaving: about 1 ÷ the share who cancel each month.",
        also: ["churn", "cancel rate", "customer lifetime value"],
        sources: ["customerLifetime"]
    },
    {
        id: "cash-runway",
        term: "Cash runway",
        places: [{ system: 3, page: 4, part: "Financial Position, Runway", field: "[data-field-key=\"3.4:financial-position\"]" }],
        meaning: "How long the cash lasts at the present rate of spending: cash ÷ monthly net burn. Here it is the first month the projected balance goes below zero.",
        also: ["runway", "burn rate"],
        sources: ["cashRunway"]
    },
    {
        id: "funding-gap",
        term: "Funding gap",
        places: [{ system: 3, page: 4, part: "Funding Need, Funding Gap", field: "[data-field-key=\"3.4:funding-need\"]" }],
        meaning: "The funding you still need to find: funding needed − funding available and confirmed."
    },
    {
        id: "loan-repayment",
        term: "Loan repayment",
        places: [{ system: 3, page: 4, part: "Capital & Funding, a loan", field: "[data-field-key=\"3.4:capital-funding\"]" }],
        meaning: "A fixed payment that covers the interest and repays the loan over a number of periods (an annuity), or an equal part of the loan each period plus its interest.",
        also: ["annuity", "loan payment"],
        sources: ["loanRepayment"]
    },
    {
        id: "simple-interest",
        term: "Simple interest",
        places: [{ system: 3, page: 4, part: "Capital & Funding, a loan", field: "[data-field-key=\"3.4:capital-funding\"]" }],
        meaning: "Interest on the amount borrowed only, without compounding: principal × rate × time.",
        sources: ["simpleInterest"]
    },
    {
        id: "useful-life",
        term: "Useful life",
        places: [{ system: 3, page: 3, part: "Useful life", card: "usefulLife" }],
        meaning: "The years an asset serves the business before it is worn out, outdated or replaced. Its cost is spread over those years, a share in each year.",
        also: ["depreciation"],
        sources: ["texasAssetClasses"]
    },
    {
        id: "amortisation",
        term: "Amortisation",
        places: [{ system: 3, page: 3, part: "Amortisation period", card: "amortisationYears" }],
        meaning: "Depreciation for an asset you cannot touch, such as a licence, software, a website or a trademark: its cost is spread over the years it serves the business, in a straight line.",
        also: ["intangible asset", "amortization"],
        sources: ["frs102Intangibles", "ias38Examples", "section197Amortisation"]
    },
    {
        id: "vat-registration",
        term: "VAT registration",
        places: [{ system: 1, page: 3, part: "Registrations, VAT", tile: "button.section-tile[data-field-key=\"1.3:legal-entity-registrations\"]", field: "[data-field-key$=\"registered-for-vat\"]" }],
        meaning: "In the UK, a business must register for VAT once its VAT-taxable turnover goes over the threshold set by HMRC.",
        also: ["VAT", "VAT threshold"],
        sources: ["ukVatRegistration"]
    },
    {
        id: "sic-code",
        term: "SIC code",
        places: [{ system: 1, page: 1, part: "the Organisation, Activities", tile: "button.section-tile[data-field-key=\"1.1:organization\"]", field: "[data-field-key=\"1.1:organization/activities\"]" }],
        meaning: "The UK's code for what a business does (Standard Industrial Classification), chosen when a company is registered with Companies House.",
        also: ["industry code", "activity and code", "classification"],
        sources: ["ukSicCodes"]
    }
];
