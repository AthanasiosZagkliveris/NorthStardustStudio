/**
 * Split out of AnswerBusinessCapability.ts (2026-11-11, the folder report's item 6); that file re-exports what is exported here.
 */
import { type BusinessCostValue, type BusinessCostOption, type BillingType, type BusinessResourceKind } from "./types.ts";

/**
 * How often a price is paid (the card's driver). Per unit (with a unit
 * name) and per project are costs of ACTIVITY -- a materials kit per
 * participant, a courier per parcel -- which Sustainability counts
 * against each unit sold rather than against the month; but a purchase
 * of an asset is priced per unit too (see isPurchaseGroup).
 */
export const BUSINESS_COST_FREQUENCIES = [
    { id: "one-time", label: "One-time" },
    { id: "monthly", label: "Monthly" },
    { id: "quarterly", label: "Quarterly" },
    { id: "annually", label: "Annually" },
    { id: "per-unit", label: "Per unit" },
    { id: "per-project", label: "Per project" },
    { id: "percent-revenue", label: "% of Rev" }
] as const;

/** The same nine categories in the Offering's Capability, and the groups it has in each. */
export const BUSINESS_OFFERING_RESOURCE_GROUPS: readonly { id: string; label: string; kinds: readonly BusinessResourceKind[] }[] = [
    { id: "workspace", label: "Workspace", kinds: [
        { id: "site-hire", label: "Site Hire", help: "The site rented for one event or job, e.g. Market pitch fee, Stand levy, Marquee frame, Rehearsal room slot." },
        { id: "workshop-storage", label: "Workshop & Storage", help: "The permanent base where the product is made or stored, e.g. Warehouse bay, Container yard, Shared-kitchen membership, Chiller space." }
    ] },
    { id: "utilities", label: "Utilities", kinds: [
        { id: "process-utilities", label: "Process Utilities", help: "The energy, water and waste services that production consumes, e.g. Firing power, Rinse water, Chemical disposal." }
    ] },
    { id: "workstation", label: "Workstation", kinds: [
        { id: "fixtures-displays", label: "Fixtures & Displays", help: "Fixed installations in your premises for making or showing the product, e.g. Workbench, Pallet racking, Showcase shelves, Sign board." }
    ] },
    { id: "equipment", label: "Equipment", kinds: [
        { id: "production-machinery", label: "Production Machinery", help: "Machines that turn raw materials into finished goods, e.g. Floor loom, Industrial oven, Laser cutter." },
        { id: "devices-tools", label: "Devices & Tools", help: "The tools, instruments and gear used to make or deliver the offering, besides its machines, e.g. Card reader, Stall display kit, Tripod rig, Hard hat, Moisture meter." }
    ] },
    { id: "vehicles", label: "Vehicles", kinds: [
        { id: "delivery-vehicles", label: "Delivery Vehicles", help: "Vans and trucks that carry or install the product, e.g. Transit van, Refrigerated truck, Short-term hire." },
        { id: "delivery-running-costs", label: "Delivery Running Costs", help: "Fuel and the everyday running costs of delivery vehicles, e.g. Diesel, AdBlue, Van valet, Cab air freshener." }
    ] },
    { id: "digital", label: "Digital Infrastructure", kinds: [
        { id: "sales-delivery-tools", label: "Sales & Delivery Tools", help: "Software that takes orders, bookings and payments, then delivers the result, e.g. Web shop, Booking app, Newsletter tool, File transfer." },
        { id: "platforms-apis", label: "Platforms & APIs", help: "Online services your product calls, billed per use, e.g. AI text service, Maps lookup, Address check, Speech transcription." }
    ] },
    { id: "materials", label: "Materials & Inventory", kinds: [
        { id: "materials-stock", label: "Materials & Stock", help: "The materials, parts, packaging and resale goods that each sale uses, e.g. Yarn, Brass fittings, Mailer boxes, Gift wrap, Sample swatches, Resale mugs." }
    ] },
    { id: "documents", label: "Documents & Rights", kinds: [
        { id: "insurances", label: "Insurances", help: "Policies that cover products, jobs and events, e.g. Product recall, Carriage of goods, Event cancellation, Customer default." },
        { id: "licences", label: "Licences", help: "Paid permissions for the offering: the right to use another's work and permits from authorities, e.g. Licensed artwork, Backing track, Patented method, Parking-bay suspension." },
        { id: "royalties", label: "Royalties", help: "Payments that follow the sales or use of another's creation, e.g. Author royalty, Franchise percentage, Patent share, Master-rights split." },
        { id: "certificates", label: "Certificates", help: "Certificates, inspections and the tests behind them, needed to sell or use an offering, e.g. CE-mark testing, Organic certification, Flame trial, Food-safety swab." },
        { id: "tickets-trips", label: "Tickets & Trip Costs", help: "The fares, stops and tolls of trips that the work requires, e.g. Coach ticket, Ferry crossing, Toll bridge, Loading-bay fee." }
    ] },
    { id: "hr", label: "Human Resources", kinds: [
        { id: "delivery-team", label: "Delivery Team", help: "The people who make the product or serve the customer, e.g. Weaver, Instructor, Installer, Barista." }
    ] }
];

/**
 * The frequencies each group offers (the card structure's "Frequencies offered"), by "place:group". A group not listed offers all seven. A group with ONE
 * frequency has nothing to choose: it is shown as text -- and a One-time one is not shown at all.
 */
export const GROUP_FREQUENCIES: Record<string, readonly string[]> = {
    "infrastructure:premises": ["one-time"],
    "infrastructure:premises-utilities": ["monthly"],
    "infrastructure:furniture-fittings": ["per-unit"],
    "infrastructure:devices-tools": ["per-unit", "monthly"],
    "infrastructure:company-vehicles": ["per-unit"],
    "infrastructure:vehicle-running-costs": ["per-unit", "monthly"],
    "infrastructure:software-web": ["per-unit", "monthly", "annually"],
    "infrastructure:cloud-security": ["monthly"],
    "infrastructure:business-consumables": ["monthly", "per-unit"],
    "infrastructure:insurances": ["annually", "monthly"],
    "infrastructure:licences": ["one-time", "annually", "per-unit"],
    "infrastructure:certificates": ["one-time", "annually"],
    "infrastructure:tickets-trips": ["per-unit", "per-project"],
    "infrastructure:admin-team": ["monthly", "per-unit"],
    "infrastructure:alliances-networks": ["annually"],
    "infrastructure:goods-equipment": ["per-unit"],
    "infrastructure:business-services": ["monthly", "annually", "per-project"],
    "infrastructure:creative-it-services": ["per-project", "monthly"],
    "infrastructure:property-vehicles-facilities": ["monthly"],
    "infrastructure:technical-support": ["per-project", "per-unit", "annually"],
    "offering:site-hire": ["per-project"],
    "offering:workshop-storage": ["one-time"],
    "offering:process-utilities": ["per-unit"],
    "offering:fixtures-displays": ["per-unit"],
    "offering:production-machinery": ["per-unit"],
    "offering:devices-tools": ["per-unit", "annually"],
    "offering:delivery-vehicles": ["per-unit"],
    "offering:delivery-running-costs": ["per-unit"],
    "offering:sales-delivery-tools": ["monthly", "annually"],
    "offering:platforms-apis": ["per-unit"],
    "offering:materials-stock": ["per-unit"],
    "offering:insurances": ["annually", "per-project"],
    "offering:licences": ["one-time", "annually", "per-unit"],
    "offering:royalties": ["percent-revenue", "monthly", "annually", "one-time"],
    "offering:certificates": ["per-project", "annually"],
    "offering:tickets-trips": ["per-unit", "per-project"],
    "offering:delivery-team": ["monthly", "per-unit"],
    "offering:revenue-partners": ["percent-revenue", "per-project"],
    "offering:accreditation-bodies": ["annually"],
    "offering:producers-wholesalers": ["per-unit"],
    "offering:logistics-fulfilment": ["per-unit", "monthly"],
    "offering:contractors-advisers": ["per-project", "per-unit"],
    "offering:agencies-influencers": ["per-project", "monthly"],
    "offering:venues-organisers": ["per-project"],
    "offering:landlords-leasing-warehouses": ["monthly"],
    "offering:platforms-payments": ["percent-revenue", "per-unit", "monthly"]
};

export const BILLING_TYPES: readonly { id: Exclude<BillingType, "">; label: string }[] = [
    { id: "percentage", label: "Percentage" },
    { id: "fixed", label: "Fixed amount" },
    { id: "lump-sum", label: "Lump sum" }
];

export const INSURANCE_OPTIONS: readonly BusinessCostOption[] = [
    { id: "property-liability", label: "Commercial property and liability", billing: "fixed" },
    { id: "key-person-health", label: "Key-person or employee health", billing: "fixed", frequencies: ["monthly"], perEmployee: true }
];

export const COST_OPTIONS: Record<string, readonly BusinessCostOption[]> = {
    "infrastructure:insurances": INSURANCE_OPTIONS,
    "offering:insurances": INSURANCE_OPTIONS,
    "infrastructure:licences": [
        { id: "initial-permit", label: "Initial permit", billing: "lump-sum" },
        { id: "annual-renewal", label: "Annual renewal, music rights, municipal taxes", billing: "fixed" }
    ],
    "offering:licences": [
        { id: "initial-permit", label: "Initial operating licence", billing: "lump-sum" },
        { id: "annual-renewal", label: "Annual renewal", billing: "fixed" }
    ],
    "offering:royalties": [
        { id: "royalty-on-sales", label: "Royalty on sales", billing: "percentage" },
        { id: "fixed-royalty", label: "Fixed royalty", billing: "fixed" },
        { id: "franchise-fee", label: "Upfront franchise or master licence fee", billing: "lump-sum" }
    ],
    "offering:revenue-partners": [
        { id: "affiliate-commission", label: "Affiliate networks and influencer commissions", billing: "percentage" },
        { id: "sales-agents", label: "Sales agents and B2B brokers", billing: "percentage" }
    ],
    "offering:platforms-payments": [
        { id: "payment-gateway", label: "Payment gateway", billing: "percentage" },
        { id: "marketplace-platform", label: "Marketplace or delivery platform", billing: "percentage" },
        { id: "saas-platform", label: "SaaS e-commerce platform", billing: "fixed" }
    ],
    "offering:logistics-fulfilment": [
        { id: "flat-per-parcel", label: "Flat per parcel", billing: "", frequencies: ["per-unit"], unit: "parcel" },
        { id: "by-weight-zone", label: "By weight or zone", billing: "", frequencies: ["per-unit"], unit: "parcel" },
        { id: "monthly-flat-fee", label: "Monthly flat fee", billing: "", frequencies: ["monthly"] },
        { id: "fulfilment-per-item", label: "Fulfilment per item", billing: "", frequencies: ["per-unit"], unit: "order" }
    ],
    "offering:agencies-influencers": [
        { id: "campaign-fee", label: "Campaign fee", billing: "", frequencies: ["per-project"] },
        { id: "monthly-budget", label: "Monthly budget", billing: "", frequencies: ["monthly"] },
        { id: "retainer", label: "Retainer", billing: "", frequencies: ["monthly"] },
        { id: "per-post", label: "Per post", billing: "", frequencies: ["per-unit"], unit: "post" }
    ]
};

/** The cost options of a group (none for a group that asks for no option). */
export const costOptionsOf = (place: "infrastructure" | "offering", groupId: string): readonly BusinessCostOption[] => COST_OPTIONS[place + ":" + groupId] ?? [];

export const costOptionOf = (place: "infrastructure" | "offering", groupId: string, optionId: string): BusinessCostOption | undefined =>
    costOptionsOf(place, groupId).find(option => option.id === optionId);

/** The billing type an option sets ("" for a card with no option, or an option with none). */
export const billingOf = (place: "infrastructure" | "offering", groupId: string, optionId: string): BillingType => costOptionOf(place, groupId, optionId)?.billing ?? "";

/** The drivers a chosen option allows: Percentage is % of Rev, a Lump sum One-time, a Fixed amount Monthly or Annually (as the group offers). */
export function optionFrequenciesOf(place: "infrastructure" | "offering", groupId: string, optionId: string): readonly string[] | null {
    const option = costOptionOf(place, groupId, optionId);
    if (!option) {
        return null;
    }
    if (option.frequencies) {
        return option.frequencies;
    }
    switch (option.billing) {
        case "percentage": return ["percent-revenue"];
        case "lump-sum": return ["one-time"];
        case "fixed": {
            const own = frequencyIdsOf(place, groupId).filter(id => id === "monthly" || id === "annually");
            return own.length > 0 ? own : ["monthly", "annually"];
        }
        default: return null;
    }
}

/**
 * A cost with an option chosen: the driver the option locks (kept when it is one the option allows, else the first), the unit of a Per unit option, and no
 * unit otherwise. Nothing is changed for a card whose option is not one of its group's.
 */
export function costWithOption(cost: BusinessCostValue, place: "infrastructure" | "offering", groupId: string, optionId: string): BusinessCostValue {
    const allowed = optionFrequenciesOf(place, groupId, optionId);
    const option = costOptionOf(place, groupId, optionId);
    if (!allowed || !option) {
        return cost;
    }
    const frequency = allowed.includes(cost.frequency) ? cost.frequency : allowed[0];
    const unit = frequency === "per-unit" ? (option.unit ?? (cost.unit || "unit")) : "";
    return frequency === cost.frequency && unit === cost.unit && cost.frequencyOther === "" ? cost : { ...cost, frequency, unit, frequencyOther: "" };
}

/** An option as saved: kept when it is one of the group's, else none. */
export const validCostOption = (place: "infrastructure" | "offering", groupId: string, optionId: string): string =>
    costOptionOf(place, groupId, optionId) ? optionId : "";

/** The frequencies a group offers, in the order of the seven; all seven for a group the list does not know. */
export function frequencyIdsOf(place: "infrastructure" | "offering", groupId: string): readonly string[] {
    // A card with no group yet offers what the groups of its master tile offer, together (never one no group of it has).
    const offered = groupId === ""
        ? [...new Set(Object.entries(GROUP_FREQUENCIES).filter(([key]) => key.startsWith(place + ":")).flatMap(([, ids]) => ids))]
        : GROUP_FREQUENCIES[place + ":" + groupId];
    return offered === undefined ? BUSINESS_COST_FREQUENCIES.map(entry => entry.id) : BUSINESS_COST_FREQUENCIES.map(entry => entry.id).filter(id => offered.includes(id));
}

/**
 * The units a Per unit price can be for, by group (the card structure's "Unit"); "unit" is always one. A group with one unit besides "unit" has nothing to
 * choose: the unit is text. A group not listed has "unit" alone.
 */
export const GROUP_UNITS: Record<string, readonly string[]> = {
    "infrastructure:furniture-fittings": ["item", "set"],
    "infrastructure:devices-tools": ["item", "set"],
    "infrastructure:company-vehicles": ["vehicle"],
    "infrastructure:vehicle-running-costs": ["km", "litre", "kWh", "bill"],
    "infrastructure:software-web": ["seat", "licence", "user"],
    "infrastructure:business-consumables": ["box", "kg", "litre", "bill"],
    "infrastructure:licences": ["seat", "licence", "user"],
    "infrastructure:tickets-trips": ["trip", "ticket", "night", "person"],
    "infrastructure:goods-equipment": ["order", "bill"],
    "infrastructure:technical-support": ["hour", "visit"],
    "offering:process-utilities": ["kWh", "litre", "m³", "bill"],
    "offering:fixtures-displays": ["item", "set"],
    "offering:production-machinery": ["machine", "item"],
    "offering:devices-tools": ["item", "set"],
    "offering:delivery-vehicles": ["vehicle"],
    "offering:delivery-running-costs": ["km", "litre", "delivery", "bill"],
    "offering:platforms-apis": ["call", "token", "request"],
    "offering:materials-stock": ["kg", "metre", "litre", "piece", "box"],
    "offering:licences": ["seat", "licence", "user"],
    "offering:tickets-trips": ["trip", "ticket", "night", "person"],
    "offering:delivery-team": ["hour"],
    "infrastructure:admin-team": ["hour"],
    "offering:producers-wholesalers": ["kg", "metre", "piece", "order"],
    "offering:logistics-fulfilment": ["parcel", "pallet", "order"],
    "offering:contractors-advisers": ["hour", "day"],
    "offering:platforms-payments": ["order", "transaction"],
    "offering:agencies-influencers": ["post"]
};

/** The units of a group, "unit" last (always there). */
export function unitsOf(place: "infrastructure" | "offering", groupId: string): readonly string[] {
    return [...(GROUP_UNITS[place + ":" + groupId] ?? []), "unit"];
}

/** The one unit a group has besides "unit", when it has exactly one (then the unit is text), else "". */
export function soleUnitOf(place: "infrastructure" | "offering", groupId: string): string {
    const specific = unitsOf(place, groupId).filter(unit => unit !== "unit");
    return specific.length === 1 ? specific[0] : "";
}

/**
 * A price with what its group fixes filled in: the one frequency a group offers (when a price is typed and none is set), and for a Per unit price the unit -- the
 * group's only one, else "unit". What is already there is kept.
 */
export function normalCostOf(cost: BusinessCostValue, place: "infrastructure" | "offering", groupId: string): BusinessCostValue {
    const offered = frequencyIdsOf(place, groupId);
    // (Only a card with a price: an empty one is left as it is, so that a blank card is still blank.)
    const frequency = cost.frequency === "" && offered.length === 1 && cost.price.trim() !== "" ? offered[0] : cost.frequency;
    const unit = frequency === "per-unit" && cost.unit === "" ? soleUnitOf(place, groupId) || "unit" : cost.unit;
    return frequency === cost.frequency && unit === cost.unit ? cost : { ...cost, frequency, unit };
}

/** The Offering's groups of one category. */
export function offeringGroupsOf(categoryId: string): readonly BusinessResourceKind[] {
    return BUSINESS_OFFERING_RESOURCE_GROUPS.find(category => category.id === categoryId)?.kinds ?? [];
}
