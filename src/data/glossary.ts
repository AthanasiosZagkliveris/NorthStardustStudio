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
}

export const APP_TERMS: readonly AppTerm[] = [
    {
        id: "segment",
        term: "Segment",
        meaning: "A group of your customers who share the same kind of answers: who they are, where they are, what they can spend and how they buy. Each Segment has its own card on Business 1, with its Profiles inside it.",
        also: ["customer group", "target market"],
        sources: ["marketResearch"]
    },
    {
        id: "profile",
        term: "Profile",
        meaning: "One typical person inside a Segment, described by specifics: an exact age, their work, what they care about, how they find, choose, buy and pay. A Profile always belongs to its Segment, and its answers stay within the Segment's.",
        also: ["persona", "customer profile"]
    },
    {
        id: "competitor",
        term: "Competitor",
        meaning: "Another business, or another way of solving the same need, that your customers could choose instead of you.",
        also: ["competition", "competitive analysis"],
        sources: ["marketResearch"]
    },
    {
        id: "offering",
        term: "Offering",
        meaning: "What you sell: a product, a service or a hybrid of the two, with its price, its costs and the sales you expect.",
        also: ["product", "service"]
    },
    {
        id: "value-proposition",
        term: "Value Proposition",
        meaning: "Why a Segment should buy from you rather than from a competitor: the need you meet, what you do differently and the result the buyer gets.",
        sources: ["positioningStatement"]
    },
    {
        id: "positioning",
        term: "Positioning",
        meaning: "The place you choose to hold in your buyers' minds against the competitors: who you serve, how you differ and why it matters to them. The tile is called Early Positioning while planning and launching, Core Market Positioning while managing, and Corporate & Portfolio Positioning while growing.",
        also: ["Early Positioning", "Core Market Positioning", "Corporate & Portfolio Positioning", "strategic positioning"],
        sources: ["strategicPositioning", "positioningTemplate"]
    },
    {
        id: "positioning-statement",
        term: "Positioning statement",
        meaning: "A short statement of who the offering is for, what need it meets, what kind of offering it is, and how it differs from the alternatives.",
        sources: ["positioningStatement", "brandPositioningStatement"]
    },
    {
        id: "business-stage",
        term: "Business stage",
        meaning: "Planning, Launching, Managing or Growing. It is worked out from your Opening Date and the four durations in Global Settings, never chosen, and it decides which Positioning questions are open.",
        also: ["Planning", "Launching", "Managing", "Growing"]
    },
    {
        id: "opening-date",
        term: "Opening Date",
        meaning: "The date your organisation opens for business, on the Organisation tile. The budget before it is the cash you need to raise.",
        also: ["launch date"]
    },
    {
        id: "b2c-b2b",
        term: "B2C and B2B",
        meaning: "Business to consumer: you sell to people who pay for their own or their family's use. Business to business: you sell to companies, organisations or freelancers.",
        also: ["B2C", "B2B", "seller and buyer relationship", "business to consumer", "business to business"],
        sources: ["positioningStatement"]
    },
    {
        id: "buyer-end-user",
        term: "Buyer and end user",
        meaning: "The buyer is the one who pays; the end user is the one who uses what is bought. They are the same person for a Direct Buyer and different people for a Proxy Buyer.",
        also: ["buyer", "end user", "economic buyer", "decision maker"],
        sources: ["buyingRoles"]
    },
    {
        id: "direct-buyer",
        term: "Direct Buyer",
        meaning: "A buyer who buys only for their own use.",
        sources: ["buyingRoles"]
    },
    {
        id: "proxy-buyer",
        term: "Proxy Buyer",
        meaning: "A buyer who buys only on behalf of someone else, so the one who pays is not the one who uses it: a gift, a parent buying for a child, an employer buying for its staff.",
        also: ["gifter"],
        sources: ["buyingRoles"]
    },
    {
        id: "dual-intent-buyer",
        term: "Dual-Intent Buyer",
        meaning: "A buyer who buys one offering to be used by themselves and by others who depend on them, such as a family plan.",
        sources: ["buyingRoles"]
    },
    {
        id: "differentiation",
        term: "Differentiation",
        meaning: "What your offering does differently from the competitors: the gap they leave that you fill, such as a lower cost, more convenience or better performance.",
        sources: ["strategicPositioning"]
    },
    {
        id: "outcome",
        term: "Outcome",
        meaning: "The measurable result the buyer gets from the offering, which is what they are paying for: lower costs, time saved, less risk, higher quality.",
        also: ["ROI", "return on investment"],
        sources: ["strategicPositioning"]
    },
    {
        id: "break-even",
        term: "Break-even point",
        meaning: "The level of sales at which revenue covers all costs, so there is neither profit nor loss. In units: fixed costs ÷ (price − variable cost per unit).",
        also: ["break even", "break-even revenue"],
        sources: ["breakEvenPoint", "breakEvenInDollars"]
    },
    {
        id: "contribution-margin",
        term: "Contribution margin",
        meaning: "What each sale leaves to pay the fixed costs and the profit: price − variable costs. The ratio is that amount ÷ price.",
        also: ["contribution"],
        sources: ["contributionMargin"]
    },
    {
        id: "capacity-utilisation",
        term: "Capacity utilisation",
        meaning: "How much of the time you have available the planned work needs: demand hours ÷ available hours. Above 100% means more work than capacity.",
        also: ["utilisation"],
        sources: ["capacityUtilisation"]
    },
    {
        id: "conversion-rate",
        term: "Conversion rate",
        meaning: "The share of visitors or prospects who buy: 5 purchases from 100 visitors is 5%.",
        also: ["buy rate"],
        sources: ["websiteConversion"]
    },
    {
        id: "referral",
        term: "Referral",
        meaning: "A new customer sent to you by an existing one. Referred customers tend to stay longer and be worth more than customers from other sources.",
        sources: ["referrals"]
    },
    {
        id: "repeat-rate",
        term: "Repeat rate",
        meaning: "The share of customers who buy again. Only their extra purchases are counted, never the customers twice.",
        also: ["repeat customers", "retention"],
        sources: ["repeatCustomers"]
    },
    {
        id: "customer-lifetime",
        term: "Customer lifetime",
        meaning: "How long a client stays on average before leaving: about 1 ÷ the share who cancel each month.",
        also: ["churn", "cancel rate", "customer lifetime value"],
        sources: ["customerLifetime"]
    },
    {
        id: "cash-runway",
        term: "Cash runway",
        meaning: "How long the cash lasts at the present rate of spending: cash ÷ monthly net burn. Here it is the first month the projected balance goes below zero.",
        also: ["runway", "burn rate"],
        sources: ["cashRunway"]
    },
    {
        id: "funding-gap",
        term: "Funding gap",
        meaning: "The funding you still need to find: funding needed − funding available and confirmed."
    },
    {
        id: "loan-repayment",
        term: "Loan repayment",
        meaning: "A fixed payment that covers the interest and repays the loan over a number of periods (an annuity), or an equal part of the loan each period plus its interest.",
        also: ["annuity", "loan payment"],
        sources: ["loanRepayment"]
    },
    {
        id: "simple-interest",
        term: "Simple interest",
        meaning: "Interest on the amount borrowed only, without compounding: principal × rate × time.",
        sources: ["simpleInterest"]
    },
    {
        id: "useful-life",
        term: "Useful life",
        meaning: "The years an asset serves the business before it is worn out, outdated or replaced. Its cost is spread over those years instead of being counted in the year it is bought.",
        also: ["depreciation"],
        sources: ["texasAssetClasses"]
    },
    {
        id: "amortisation",
        term: "Amortisation",
        meaning: "Depreciation for an asset you cannot touch, such as a licence, software, a website or a trademark: its cost is spread over the years it serves the business, in a straight line.",
        also: ["intangible asset", "amortization"],
        sources: ["frs102Intangibles", "ias38Examples", "section197Amortisation"]
    },
    {
        id: "vat-registration",
        term: "VAT registration",
        meaning: "In the UK, a business must register for VAT once its VAT-taxable turnover goes over the threshold set by HMRC.",
        also: ["VAT", "VAT threshold"],
        sources: ["ukVatRegistration"]
    },
    {
        id: "sic-code",
        term: "SIC code",
        meaning: "The UK's code for what a business does (Standard Industrial Classification), chosen when a company is registered with Companies House.",
        also: ["industry code", "activity and code", "classification"],
        sources: ["ukSicCodes"]
    }
];
