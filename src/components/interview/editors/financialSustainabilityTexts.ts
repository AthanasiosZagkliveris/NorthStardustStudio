/* Part of FinancialSustainabilityEditor.tsx (moved out as it was, 2026-11-11: the owner, "can you do them all?"; FinancialSustainabilityEditor.tsx imports it). */

import { paletteHueNamed } from "../../../framework/engine/Palette.ts";
import { SOURCES } from "../../../framework/engine/Sources.ts";
import { type InfoPoint } from "../fields/InfoNote.tsx";

/** How to estimate each group of a revenue stream: the "i" beside its title. */
export const STREAM_HELP: Record<"price" | "volume" | "timing", InfoPoint[]> = {
    price: [
        "Start from what competitors publish (listed on Foundation) and what clients pay today to solve the same problem.",
        "Check it covers the costs of each sale and leaves enough towards the running costs: the card shows what is left from each sale.",
        "Enter prices on the basis chosen under Amounts on Financial Foundation. If you are registered, the tax you collect is not revenue.",
        "Allow for discounts: launch offers and first-client prices are common."
    ],
    volume: [
        "Few organisations sell at the normal level from the first month: a gradual build-up over 6 to 12 months is usual.",
        "For seasons (quieter summers, busy end-of-year gifts), set Build-up to Month by month and enter the months that differ.",
        "Allow for refunds and returns: a share of sales comes back."
    ],
    timing: [
        "Revenue begins after the sales cycle, the time from first contact to a signed sale: for services to businesses it is often 4 to 12 weeks.",
        "One sale often leads to another, such as a build after an audit: start the later stream when the first ones finish.",
        "Money arrives when the customer pays, which can be well after the sale: invoices are often paid 30 days after they are sent, and some later.",
        "Ask for deposits on larger projects: part at signing, the rest on completion."
    ]
};

/** Orders & Delivery's "i": asked only where the Offering has a cost per order. */
export const ORDERS_HELP: InfoPoint[] = [
    "Asked because this Offering has a cost per order, such as delivery, on Infrastructure & Capability.",
    "Items per Order shares that cost between the items in one order; the Delivery Charge is what the customer pays towards it."
];

export const TAKE_INFO: InfoPoint[] = [
    "Worked out from the plan: the smallest single change that keeps the cash at zero or above in every month of the plan, each tried on its own with everything else as planned.",
    "The funding being sought is counted as if it arrives as planned, its repayments included, as in the Stress Test.",
    "Where the plan already holds, it says how far sales, the start of revenue or costs could go against it instead."
];

/** The units formula behind Break Even Alone, added to the block's own info. */
export const BREAK_EVEN_UNITS_FORMULA: InfoPoint = {
    title: "Formula",
    text: "Break-even units = Fixed costs ÷ (Price − Variable cost per unit)"
};

/* One primary source for both break-even formulas, so the two agree. */
export const BREAK_EVEN_SOURCE: InfoPoint = { title: "Source", source: SOURCES.breakEvenPoint };

/** The revenue formula behind Break-Even Revenue, added to its tile's own info. */
export const BREAK_EVEN_REVENUE_FORMULA: InfoPoint = {
    title: "Formula",
    text: "Break-even revenue = Fixed costs ÷ Contribution margin ratio"
};

/* OpenStax follows BREAK_EVEN_SOURCE as the second reference the spec asks for. */
export const BREAK_EVEN_REVENUE_SECOND_SOURCE: InfoPoint = { title: "Also", source: SOURCES.breakEvenInDollars };

/** Expected Monthly Revenue's own tile "i" -- the only headline tile
    that had none, sitting beside figures that all carry one. Nothing
    to cite: it is added up from the Offerings' own prices and sales,
    not read from outside the plan. */
export const EXPECTED_REVENUE_HELP: InfoPoint[] = [
    { title: "Formula", text: "Σ price × expected sales per month, for each Offering" },
    "The revenue the expected sales bring in a normal month.",
    "Calculated from your Offerings' prices and expected sales."
];

/** Expected Break Even's own tile "i", the same gap as above. */
export const EXPECTED_BREAK_EVEN_HELP: InfoPoint[] = [
    "The first month revenue covers costs, based on the build-up of sales you entered."
];

/** Contribution's own formula, the "i" beside its figure on each Offering's card. */
export const CONTRIBUTION_HELP: InfoPoint[] = [
    { title: "Formula", text: "Contribution = Price − Variable costs; ratio = Contribution ÷ Price" },
    "What each sale leaves to pay fixed costs and profit.",
    { title: "Source", source: SOURCES.contributionMargin }
];

export const SECTIONS = {
    revenue: {
        title: "Revenue",
        instructions: [
            "Each Offering has its revenue stream below. For each, say how it is priced, how much sells, and when the money arrives.",
            "Expected sales come from Demand & Conversion on Customer Engagement where it is filled in; otherwise enter them here. Not sure of a figure? The \"i\" beside Price, Sales Volume, and Begins and Payment says how to estimate it.",
            "Write down what each figure rests on under Assumptions: lenders read those first."
        ],
        info: [
            { title: "Revenue", text: "Money generated through the organisation's Offerings." },
            "Funding, loans, founder capital, grants and investment are financing, and this list counts revenue only.",
            "Revenue may be zero at first. That is a valid model for an organisation under development."
        ] as InfoPoint[]
    },
    breakEven: {
        title: "Break Even",
        instructions: [
            "Read how much your organisation must sell to cover its costs, when it is expected to get there, and whether that is before its money runs out."
        ],
        info: [
            { title: "Break-Even Point", text: "The level of revenue or activity at which revenue covers costs." },
            { title: "Break-Even Time", text: "When the organisation is expected to reach that level." },
            { title: "Financial Exhaustion", text: "When available resources are expected to run out, with expected revenue included." },
            "All results are estimates based on the assumptions entered, not guarantees."
        ] as InfoPoint[]
    }
};

/**
 * Each section's own palette colour, apart from each other and from
 * Page 4's four: lavender for Revenue, teal for Break Even.
 */
export const SECTION_HUES: Record<string, number> = {
    "sustainability-revenue": paletteHueNamed("lavender"),
    "sustainability-break-even": paletteHueNamed("teal")
};

export const STATUS_TITLES = {
    above: "Currently Above Break Even",
    sustainable: "Sustainable Before Financial Exhaustion",
    risk: "Financial Risk",
    "not-reached": "Break Even Not Reached",
    "no-revenue": "Revenue Not Yet Established"
} as const;
