/**
 * THE BUSINESS SYSTEM, INFRASTRUCTURE AND CAPABILITY (page 3): resources, activities, partners, costs and responsibilities.
 * Split out of AnswerUtils.ts (still importable from there).
 */
import { parseAmount } from "./Amounts.ts";
import { asObject, asText, randomId } from "./Readers.ts";
import { type DeliveryValue, type FounderPeriod, asDeliveryMap, asFounderPeriod, asHoursPeriod } from "./DemandCapacity.ts";
import { todayIsoDate } from "./AnswerProcess.ts";
import { businessNeedList } from "./AnswerBusinessFoundation.ts";
import { LegalEntityFounderValue } from "./AnswerLegal.ts";
import { founderProfileOf } from "./AnswerFounders.ts";

/* ==================================================================
   Business System -- Infrastructure & Capability (Page 3)

   See AnswerType.BusinessCapability, and the specification at
   docs/specifications/business-system/page-3-infrastructure-and-capability.md.

   Two sections holding the same three subsections:

     Infrastructure        1. Resources  2. Activities  3. Partnerships
     Offering's Capability 1. Resources  2. Activities  3. Partnerships

   Infrastructure is what the ORGANIZATION needs; Offering's
   Capability is what each OFFERING needs on top of it, so every row
   there is additionally linked to one of Page 1's Offerings.

   THE THREE SUBSECTIONS WRITE INTO EACH OTHER, which is the whole
   difficulty of this page. A resource marked "Partners & Suppliers"
   (or a space's "Rent") names a supplier under 3; one marked "Activity"
   chooses an activity under 2 (or makes one with "Other…"); an
   activity's responsible founder collects its name under their own
   Responsibilities in 1. Nothing here is a form that can be filled
   top to bottom and left alone.
================================================================== */

/** Where the organisation's work is carried out. */
export const BUSINESS_WORKSPACE_KINDS = [
    { id: "home", label: "Home" },
    { id: "coworking", label: "Coworking Space" },
    { id: "incubator", label: "Incubator / Accelerator" },
    { id: "dedicated", label: "Dedicated Workspace" },
    { id: "other", label: "Other" }
] as const;

/**
 * What is known about a resource, and what each answer obliges.
 *
 * `action` is the follow-up the specification attaches to the
 * status -- the thing that makes this page a system rather than a
 * list. See the editor, which carries each one out.
 *
 * Rent and Buy are a space's or a vehicle's own words for what
 * were Provided and Costs. ("Needs Investigation" is no longer a status: an earlier answer's is cleared and said in the card's description.)
 */
export const BUSINESS_RESOURCE_STATUSES = [
    {
        id: "exists",
        label: "Exists / Free",
        explanation: "It is already available to the organization at no additional cost."
    },
    {
        id: "rent",
        label: "Rent",
        explanation: "It is rented through a supplier. Choose who."
    },
    {
        id: "partners-suppliers",
        label: "Partners & Suppliers",
        explanation: "It is supplied by a partner or a supplier, or cannot or should not be performed by the founders. Choose who."
    },
    {
        id: "activity",
        label: "Activity",
        explanation: "It can be created, developed or established internally by the founders."
    },
    {
        id: "buy",
        label: "Buy",
        explanation: "It is bought. Record its price."
    },
    {
        id: "costs",
        label: "Costs",
        explanation: "It must be purchased. Record its price and payment frequency."
    }
] as const;

/** The statuses a RESOURCE CARD offers. (A space's are BUSINESS_WORKSPACE_STATUS_IDS; a people card adds one, BUSINESS_PEOPLE_STATUS_IDS.) */
export const BUSINESS_RESOURCE_CARD_STATUS_IDS = ["exists", "partners-suppliers", "activity", "costs"] as const;

/** A people card's (Admin Team, Delivery Team): the common ones. */
export const BUSINESS_PEOPLE_STATUS_IDS = ["exists", "partners-suppliers", "activity", "costs"] as const;

/** The groups whose cards are people. */
export const BUSINESS_PEOPLE_GROUP_IDS = ["admin-team", "delivery-team"] as const;

/**
 * The groups whose cards are SPACES and VEHICLES (in both places): their statuses are Exists / Free, Rent, Activity and Buy. Rent names a supplier of one
 * group (RENT_SUPPLIER_GROUP), whose card holds the rent or the lease; Buy shows the price: One-time for a space, Per unit for a vehicle.
 */
export const BUSINESS_SPACE_GROUP_IDS = ["premises", "workshop-storage", "company-vehicles", "delivery-vehicles"] as const;

/** The statuses of a space or a vehicle. */
export const BUSINESS_SPACE_STATUS_IDS = ["exists", "rent", "activity", "buy"] as const;

export const isSpaceGroup = (groupId: string) => (BUSINESS_SPACE_GROUP_IDS as readonly string[]).includes(groupId);

/** The spaces (not the vehicles): bought One-time, with no Qty. */
export const isSpaceOnlyGroup = (groupId: string) => groupId === "premises" || groupId === "workshop-storage";

/** The one supplier group a Rent names, by place: Property, Vehicles & Facilities; Landlords, Leasing & Warehouses. */
export const RENT_SUPPLIER_GROUP: Record<"infrastructure" | "offering", string> = {
    infrastructure: "property-vehicles-facilities",
    offering: "landlords-leasing-warehouses"
};

/** The statuses a card of this group offers (a group of "" is any). */
export function resourceStatusIds(groupId: string): readonly string[] {
    return isSpaceGroup(groupId)
        ? BUSINESS_SPACE_STATUS_IDS
        : (BUSINESS_PEOPLE_GROUP_IDS as readonly string[]).includes(groupId) ? BUSINESS_PEOPLE_STATUS_IDS : BUSINESS_RESOURCE_CARD_STATUS_IDS;
}

/**
 * A card's status when it is filed in another group: a space or a vehicle's Rent and Buy are another card's Partners & Suppliers and Costs, and the other
 * way round; a status the new group does not offer is cleared.
 */
export function statusInGroup(status: string, groupId: string): string {
    const space = isSpaceGroup(groupId);
    const mapped = space
        ? (status === "partners-suppliers" ? "rent" : status === "costs" ? "buy" : status)
        : (status === "rent" ? "partners-suppliers" : status === "buy" ? "costs" : status);
    return status === "" || resourceStatusIds(groupId).includes(mapped) ? mapped : "";
}

/** Whether a status names a supplier: Partners & Suppliers, or a space's Rent. */
export const usesSupplier = (status: string) => status === "partners-suppliers" || status === "rent";

/**
 * The price a Buy asks for: a space's is One-time, a vehicle's Per unit (with the unit "unit"); what is already there for it is kept.
 */
export function buyCostOf(groupId: string, cost: BusinessCostValue): BusinessCostValue {
    if (isSpaceOnlyGroup(groupId)) {
        return cost.frequency === "" ? { ...cost, frequency: "one-time" } : cost;
    }
    return cost.frequency === "" ? { ...cost, frequency: "per-unit", unit: cost.unit || "unit" } : cost;
}

/** Whether a resource's status says a partner or supplier supplies it. */
export const isPartnered = (status: string) => status === "partners-suppliers";

/** Whether a status says the card is paid for with a price: Costs, or a space's Buy. */
export const isCostingStatus = (status: string) => status === "costs" || status === "buy";

/** The Workspace's statuses: a space's (the Workspace form is the common card now). */
export const BUSINESS_WORKSPACE_STATUS_IDS = [
    "exists", "rent", "activity", "buy"
] as const;

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

export interface BusinessResourceKind { id: string; label: string; help: string }

/**
 * The nine resource categories, each with the groups INFRASTRUCTURE
 * has in it (a group's id is also the id of the subsection that holds
 * its cards). The groups are fixed lists: no "Other" adds one.
 *
 * Founders & Owners, the first group of Human Resources, is the Founders
 * tile and is not listed here; the Offering's groups are
 * BUSINESS_OFFERING_RESOURCE_GROUPS.
 *
 * No letter or number: the page numbers them where it draws them,
 * inside the two groups it arranges them into (see the Capability
 * editor's RESOURCE_GROUPINGS), so the order is written once.
 */
export const BUSINESS_RESOURCE_GROUPS = [
    {
        id: "workspace",
        label: "Workspace",
        notes: [],
        kinds: [
            { id: "premises", label: "Premises", help: "The space where the team works, owned, rented through a landlord or at home, e.g. Studio rent, Shared-space seat, Home-office allowance, Owned office." }
        ] as BusinessResourceKind[]
    },
    {
        id: "utilities",
        label: "Utilities",
        notes: [
            "A utility category can contain multiple entries, such as additional equipment, maintenance, installation, or professional services.",
            "Record the appropriate provider or activity, and any related costs separately."
        ],
        kinds: [
            { id: "premises-utilities", label: "Premises Utilities", help: "The services the daily operation consumes, e.g. Electricity, Gas heating, Broadband line, Mobile plan." }
        ] as BusinessResourceKind[]
    },
    {
        id: "workstation",
        label: "Workstation",
        notes: [],
        kinds: [
            { id: "furniture-fittings", label: "Furniture & Fittings", help: "The furniture and fittings of the work areas, e.g. Standing desk, Drawing table, Ergonomic chair, Filing cabinet." }
        ] as BusinessResourceKind[]
    },
    {
        id: "equipment",
        label: "Equipment",
        notes: [],
        kinds: [
            { id: "devices-tools", label: "Devices & Tools", help: "The devices and tools the team uses for its own work, bought or leased, e.g. Laptop, Label printer, Mirrorless camera, Vehicle tracker, Protective goggles." }
        ] as BusinessResourceKind[]
    },
    {
        id: "vehicles",
        label: "Vehicles",
        notes: [],
        kinds: [
            { id: "company-vehicles", label: "Company Vehicles", help: "Cars and bikes the company owns or leases for general use, e.g. Sales car, Cargo bike, Minibus lease." },
            { id: "vehicle-running-costs", label: "Vehicle Running Costs", help: "Fuel and the everyday running costs of company vehicles, e.g. Petrol, Electric charging, Car wash, Washer fluid." }
        ] as BusinessResourceKind[]
    },
    {
        id: "digital",
        label: "Digital Infrastructure",
        notes: [],
        kinds: [
            { id: "software-web", label: "Software & Web", help: "Software subscriptions and the public website, e.g. Bookkeeping software, Company website, Shared mailbox, Fleet tracking." },
            { id: "cloud-security", label: "Cloud & Security", help: "Storage, back-up and protection of files and data, e.g. Cloud drive, Nightly back-up, Password vault, Antivirus." }
        ] as BusinessResourceKind[]
    },
    {
        id: "materials",
        label: "Materials & Inventory",
        notes: [],
        kinds: [
            { id: "business-consumables", label: "Business Consumables", help: "Everyday items the business uses up and replaces, e.g. Copy paper, Dish soap, Coffee beans." }
        ] as BusinessResourceKind[]
    },
    {
        id: "documents",
        label: "Documents & Rights",
        notes: [],
        kinds: [
            { id: "insurances", label: "Insurances", help: "Policies that cover the company's liability, premises and people, e.g. Public liability, Cyber, Key person, Directors and officers." },
            { id: "licences", label: "Licences", help: "Paid permissions: the right to use another's work and permits from authorities, e.g. Stock photo licence, Typeface rights, Image library, Staff parking permit." },
            { id: "certificates", label: "Certificates", help: "Certificates and inspections of the premises and the team, e.g. Gas safety certificate, Fire-risk assessment, First-aid award, Energy rating." },
            { id: "tickets-trips", label: "Tickets & Trip Costs", help: "The fares and stops of trips that serve the whole company, e.g. Conference train fare, Hotel for a seminar, Airport taxi, Car park." }
        ] as BusinessResourceKind[]
    },
    {
        id: "hr",
        label: "Human Resources",
        notes: [],
        kinds: [
            { id: "admin-team", label: "Admin Team", help: "Staff and helpers who handle the company's administration, e.g. Operations manager, Bookkeeper, Receptionist, Intern." }
        ] as BusinessResourceKind[]
    }
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
 * The groups whose cards are bought things (assets): a purchase there is
 * priced Per unit, and the quantity multiplies the price. A space bought
 * is One-time.
 */
export const BUSINESS_PURCHASE_GROUP_IDS = [
    "furniture-fittings", "devices-tools", "fixtures-displays", "production-machinery", "company-vehicles", "delivery-vehicles"
] as const;

export const isPurchaseGroup = (groupId: string) => (BUSINESS_PURCHASE_GROUP_IDS as readonly string[]).includes(groupId);

/** The id of a category's group when it has exactly one (nothing is left to choose), else "". */
export function soleGroupOf(groups: readonly { id: string }[] | undefined): string {
    return groups !== undefined && groups.length === 1 ? groups[0].id : "";
}

/**
 * THE PERIOD of an activity group (cost model section 13), as the days its dates must stay inside: Pre-Operational runs from Plan Start to the day before
 * the Opening Date; Operational and Sales & Customer from the Opening Date; Production and Marketing from Plan Start. A bound that is not known (a date
 * not given yet) is "" and holds nothing.
 */
export function activityPeriod(groupId: string, planStart: string, openingDate: string): { from: string; to: string } {
    switch (groupId) {
        case "pre-operational": {
            const opening = isoToTime(openingDate);
            return { from: planStart, to: opening === null ? "" : timeToIso(opening - PAYMENT_DAY) };
        }
        case "operational":
        case "sales":
            return { from: openingDate, to: "" };
        case "production":
        case "marketing":
            return { from: planStart, to: "" };
        default:
            return { from: "", to: "" };
    }
}

/** The last day of an activity: its End date, else its Start date (an activity with no end counts as one day). */
export const activityLastDay = (activity: { startDate: string; endDate: string }) => activity.endDate || activity.startDate;

/** What is wrong with an activity's dates against the period of its group: a start before it, an end after it, an end before its start. */
export function activityDateIssues(activity: { startDate: string; endDate: string }, period: { from: string; to: string }): string[] {
    const issues: string[] = [];
    if (activity.startDate && period.from && activity.startDate < period.from) {
        issues.push("The Start date is before the period begins.");
    }
    if (period.to && ((activity.startDate && activity.startDate > period.to) || (activityLastDay(activity) && activityLastDay(activity) > period.to))) {
        issues.push("The dates run past the end of the period.");
    }
    if (activity.endDate && activity.startDate && activity.endDate < activity.startDate) {
        issues.push("The End date is before the Start date.");
    }
    return issues;
}

/**
 * A resource linked to an activity: the card, and the number of units of it the activity uses when the card has units (a Per unit price: 3 hours, 40 km).
 */
export interface BusinessActivityResource {
    id: string;
    units: string;
}

/** The linked resources whose Start date falls after the activity ends (its End date, else its Start date): a linked card cannot begin later. */
export function resourcesStartingTooLate(activity: { startDate: string; endDate: string }, starts: Readonly<Record<string, string>>, linked: readonly BusinessActivityResource[]): string[] {
    const last = activityLastDay(activity);
    return last === "" ? [] : linked.filter(entry => entry.id !== "" && (starts[entry.id] ?? "") !== "" && starts[entry.id] > last).map(entry => entry.id);
}

/** The most units of a resource an activity (or a performer) can take: the Qty of the card (whole units); null where the card has no limit to give. */
export function unitsCap(quantity: string): number | null {
    const count = Math.floor(parseAmount(quantity) ?? 0);
    return count >= 1 ? count : null;
}

/** Units typed for a resource or a performer, kept whole and never more than the card holds. */
export function cappedUnits(typed: string, quantity: string): string {
    const digits = typed.replace(/\D/g, "").slice(0, 6);
    const cap = unitsCap(quantity);
    return digits !== "" && cap !== null && Number(digits) > cap ? String(cap) : digits;
}

/**
 * THE PAYMENT PLAN of a Per project price (cost model section 13): when the money leaves, not what the cost is. Not ticked, the price is paid in full on the
 * card's Start date. Ticked, its type is one of three; every payment has a percent and a date, and the percents total 100% or the card is incomplete.
 *
 * - Deposit & Balance: a percent at the Start date and the rest on a second date (the End date unless another is given).
 * - Instalments: a number of payments, dated evenly from the Start date to the End date and equal; the dates and amounts can be moved.
 * - Milestones: a title, a percent and a date for each stage.
 */
export const BUSINESS_PAYMENT_PLANS = [
    { id: "deposit-balance", label: "Deposit & Balance" },
    { id: "instalments", label: "Instalments" },
    { id: "milestones", label: "Milestones" }
] as const;

export interface BusinessPaymentLine {
    id: string;
    /** A stage's name (Milestones); "" for the others. */
    title: string;
    percent: string;
    /** An ISO date; "" is the card's Start date for the first line of Deposit & Balance, its End date for the second. */
    date: string;
}

export interface BusinessPaymentPlan {
    on: boolean;
    /** One of BUSINESS_PAYMENT_PLANS' ids, or "". */
    type: string;
    /** The number of Instalments, as typed. */
    count: string;
    lines: BusinessPaymentLine[];
}

export const emptyPaymentPlan = (): BusinessPaymentPlan => ({ on: false, type: "", count: "", lines: [] });

export function asPaymentPlan(value: unknown): BusinessPaymentPlan {
    const plan = asObject(value);
    const type = asText(plan.type);
    return {
        on: plan.on === true,
        type: BUSINESS_PAYMENT_PLANS.some(entry => entry.id === type) ? type : "",
        count: asText(plan.count).replace(/\D/g, "").slice(0, 2),
        lines: (Array.isArray(plan.lines) ? plan.lines : []).slice(0, 60).map(entry => {
            const line = asObject(entry);
            return { id: asText(line.id) || randomId("payment"), title: asText(line.title), percent: businessDecimalText(asText(line.percent)), date: isoDateText(line.date) };
        })
    };
}

export const PAYMENT_DAY = 24 * 60 * 60 * 1000;

export function isoToTime(iso: string): number | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

export function timeToIso(time: number): string {
    return new Date(time).toISOString().slice(0, 10);
}

/** Equal shares of 100%, to two decimals, the last taking what rounding leaves: three are 33.33, 33.33 and 33.34. */
export function equalPercents(count: number): string[] {
    if (count < 1) {
        return [];
    }
    const each = Math.floor(10000 / count) / 100;
    const shares = Array.from({ length: count }, () => each);
    shares[count - 1] = Math.round((100 - each * (count - 1)) * 100) / 100;
    return shares.map(share => String(share));
}

/** INSTALMENTS: `count` equal payments, dated evenly from the Start date to the End date (the first on the Start date, the last on the End date). */
export function instalmentLines(count: number, startDate: string, endDate: string): BusinessPaymentLine[] {
    const first = isoToTime(startDate);
    const last = isoToTime(endDate);
    return equalPercents(count).map((percent, at) => ({
        id: randomId("payment"),
        title: "",
        percent,
        date: first === null ? "" : count === 1 || last === null || last < first ? startDate : timeToIso(first + Math.round((last - first) / PAYMENT_DAY * at / (count - 1)) * PAYMENT_DAY)
    }));
}

/** The payments of a plan as they fall: the first of Deposit & Balance on the Start date, the second on its own date else the End date. */
export function paymentPlanLines(plan: BusinessPaymentPlan, startDate: string, endDate: string): BusinessPaymentLine[] {
    if (plan.type === "instalments" && plan.lines.length > 0) {
        // Instalments are dated evenly from the first to the last: those two are the plan's own dates (the card has no Start or End date while it has a plan), the ones between follow them.
        const count = plan.lines.length;
        const first = plan.lines[0].date || startDate;
        const last = plan.lines[count - 1].date || endDate || first;
        const dated = instalmentLines(count, first, last);
        return plan.lines.map((line, at) => ({ ...line, date: dated[at].date }));
    }
    if (plan.type === "milestones" && plan.lines.length > 0) {
        // Milestones with no date of their own take the card's: the first the Start date, the last the End date, the ones between spread evenly.
        const count = plan.lines.length;
        const first = plan.lines[0].date || startDate;
        const last = plan.lines[count - 1].date || endDate || first;
        const spread = instalmentLines(count, first, last);
        return plan.lines.map((line, at) => ({ ...line, date: line.date || spread[at].date }));
    }

    return plan.type === "deposit-balance"
        ? plan.lines.slice(0, 2).map((line, at) => ({ ...line, date: line.date || (at === 0 ? startDate : endDate) }))
        : plan.lines;
}

/** What the percents of a plan add up to. */
export function paymentPlanTotal(plan: BusinessPaymentPlan): number {
    return Math.round(plan.lines.reduce((sum, line) => sum + (parseAmount(line.percent) ?? 0), 0) * 100) / 100;
}

/**
 * Whether the plan of a Per project price leaves the card incomplete: a plan ticked with no type, percents that do not total 100%, or a payment with no date
 * (for Deposit & Balance, no Start date or no End date to fall back on). Nothing is wrong with a plan that is not ticked.
 */
export function paymentPlanIncomplete(cost: { frequency: string }, plan: BusinessPaymentPlan, startDate: string, endDate: string): boolean {
    if (cost.frequency !== "per-project" || !plan.on) {
        return false;
    }
    if (plan.type === "" || plan.lines.length === 0 || paymentPlanTotal(plan) !== 100) {
        return true;
    }
    if (plan.type === "deposit-balance" && plan.lines.length !== 2) {
        return true;
    }
    return paymentPlanLines(plan, startDate, endDate).some(line => line.date === "");
}

/**
 * THE EXTRAS: optional lines that depend on one card (the card structure's "Extras", cost model section 8). Each is ticked on and typed; none is required.
 * `kind` is what the figure is -- money (in the card's currency), a percent, or a quantity -- and `frequency` how often it is paid.
 */
export const BUSINESS_EXTRAS = {
    "allowance": { label: "Allowance", kind: "money", frequency: "monthly" },
    "commission": { label: "Commission", kind: "percent", frequency: "percent-revenue" },
    "bonus": { label: "Bonus", kind: "money", frequency: "annually" },
    "property-tax": { label: "Commercial property tax", kind: "money", frequency: "annually" },
    "service-charge": { label: "Service charge", kind: "money", frequency: "monthly" },
    "deposit": { label: "Deposit", kind: "money", frequency: "one-time" },
    "handling-pallet": { label: "Handling per pallet", kind: "money", frequency: "per-unit" },
    "road-tax": { label: "Road tax", kind: "money", frequency: "annually" },
    "minimum-order": { label: "Minimum order", kind: "quantity", frequency: "per-unit" },
    "customs-duty": { label: "Customs duty", kind: "percent", frequency: "percent-cost" },
    "clearance-handling": { label: "Clearance and handling", kind: "money", frequency: "per-project" },
    "other-duties": { label: "Other duties", kind: "percent", frequency: "percent-cost" }
} as const;

export type BusinessExtraKey = keyof typeof BUSINESS_EXTRAS;

/** The extras kept on a card: a figure for each one ticked (an extra with nothing typed is not ticked). */
export type BusinessExtrasValue = Partial<Record<BusinessExtraKey, string>>;

/** The people's groups, and the founders (the Founders tile): Allowance, Commission and Bonus. */
export const PEOPLE_EXTRA_KEYS: readonly BusinessExtraKey[] = ["allowance", "commission", "bonus"];

/** The extras a RESOURCE card offers: a bought space has its tax and charge, a bought vehicle its road tax, a person Allowance, Commission and Bonus. */
export function slotExtraKeys(groupId: string, status: string): readonly BusinessExtraKey[] {
    if ((BUSINESS_PEOPLE_GROUP_IDS as readonly string[]).includes(groupId)) {
        return PEOPLE_EXTRA_KEYS;
    }
    if (isSpaceOnlyGroup(groupId)) {
        return isCostingStatus(status) ? ["property-tax", "service-charge"] : [];
    }
    if (groupId === "company-vehicles" || groupId === "delivery-vehicles") {
        return isCostingStatus(status) ? ["road-tax"] : [];
    }
    return [];
}

/** What a landlord or leasing supplier's card is connected to: the rented spaces and vehicles that name it. */
export interface SupplierConnections {
    space: boolean;
    workshop: boolean;
    vehicle: boolean;
}

export function supplierConnections(capability: BusinessCapabilityValue, partnerId: string): SupplierConnections {
    const rented = [
        ...Object.entries(capability.resources).flatMap(([, subsections]) => subsections.map(subsection => ({ groupId: subsection.id, slots: subsection.slots }))),
        ...BUSINESS_OFFERING_RESOURCE_GROUPS.flatMap(category => category.kinds.map(kind => ({
            groupId: kind.id,
            slots: capability.offering.resources.filter(slot => slot.category === category.id && slot.group === kind.id)
        })))
    ].flatMap(entry => entry.slots.filter(slot => slot.status === "rent" && slot.providerId === partnerId).map(() => entry.groupId));
    return {
        space: rented.some(groupId => isSpaceOnlyGroup(groupId)),
        workshop: rented.includes("workshop-storage"),
        vehicle: rented.some(groupId => groupId === "company-vehicles" || groupId === "delivery-vehicles")
    };
}

/** The extras a PARTNER or SUPPLIER card COSTS: a producer's duties and minimum, a landlord's by what is connected to it. */
export function partnerExtraKeys(group: string, connections: SupplierConnections): readonly BusinessExtraKey[] {
    if (group === "producers-wholesalers") {
        return ["minimum-order", "customs-duty", "clearance-handling", "other-duties"];
    }
    if (group === "property-vehicles-facilities" || group === "landlords-leasing-warehouses") {
        return [
            ...(connections.space ? ["deposit", "service-charge", "property-tax"] as const : []),
            ...(connections.workshop && group === "landlords-leasing-warehouses" ? ["handling-pallet"] as const : []),
            ...(connections.vehicle ? ["road-tax"] as const : [])
        ];
    }
    return [];
}

/**
 * The extras a PARTNER or SUPPLIER card SHOWS (the fields): the same as it costs, but a landlord's or lessor's card made by hand and filed in the group, with nothing yet
 * connected to it, shows the group's own (as the card a resource made does); what counts in the costs is still only what is connected.
 */
export function partnerExtraFieldKeys(group: string, connections: SupplierConnections): readonly BusinessExtraKey[] {
    if ((group === "property-vehicles-facilities" || group === "landlords-leasing-warehouses") && !connections.space && !connections.workshop && !connections.vehicle) {
        return group === "landlords-leasing-warehouses" ? ["deposit", "service-charge", "property-tax", "handling-pallet"] : ["deposit", "service-charge", "property-tax"];
    }
    return partnerExtraKeys(group, connections);
}

/**
 * THE SERVICES BUNDLED INTO AN ASSET (rule C2): a Technical Support supplier whose card is named by a Partners & Suppliers status row of an asset card
 * (a bought physical asset: the status Costs or Buy, in a purchase group) builds or installs that asset, so its price is added to the asset's value.
 * The link is the only data. Returns the asset's id by the supplier's id (the first asset that names it).
 */
export function serviceAssetLinks(capability: BusinessCapabilityValue): Record<string, string> {
    const technical = new Set([...capability.providers, ...capability.offering.providers].filter(partner => partner.group === "technical-support").map(partner => partner.id));
    const links: Record<string, string> = {};
    const assets = [
        ...Object.values(capability.resources).flatMap(subsections => subsections.flatMap(subsection => subsection.slots.map(slot => ({ slot, groupId: subsection.id })))),
        ...capability.offering.resources.map(slot => ({ slot, groupId: slot.group }))
    ];
    assets.forEach(({ slot, groupId }) => {
        if (!isCostingStatus(slot.status) || !isPurchaseGroup(groupId)) {
            return;
        }
        const named = (slot.extraStatuses ?? []).filter(row => row.status === "partners-suppliers").map(row => row.providerId);
        named.filter(id => id !== "" && technical.has(id) && !(id in links)).forEach(id => { links[id] = slot.id; });
    });
    return links;
}

/**
 * THE COST OF ONE UNIT OF AN ASSET WITH ITS LINKED SERVICES (cost model, section 4): the price of one unit plus the services bundled into it, shared by the
 * units the card buys. The capitalisation limit is tested on this, never on the invoice of a linked service: a machine of 20,000 and an installation of 1,500
 * are one asset of 21,500. Null while the card has no price.
 */
export function assetUnitCost(capability: BusinessCapabilityValue, slot: BusinessResourceSlotValue): number | null {
    const price = parseAmount(slot.cost.price);
    if (price === null) {
        return null;
    }
    const units = Math.max(1, parseAmount(slot.quantity) ?? 1);
    const services = servicesOfAsset(capability, slot.id).reduce((sum, partner) => sum + (parseAmount(partner.cost.price) ?? 0), 0);
    return Math.round((price + services / units) * 100) / 100;
}

/** The Technical Support suppliers bundled into one asset. */
export const servicesOfAsset = (capability: BusinessCapabilityValue, assetId: string): BusinessPartnerValue[] => {
    const links = serviceAssetLinks(capability);
    return [...capability.providers, ...capability.offering.providers].filter(partner => links[partner.id] === assetId);
};

/**
 * THE GENERATED INSURANCES CARD (rule G1): a premises, company vehicle, delivery vehicle, workshop, machine or event (Site Hire) card that is created gets
 * an Insurances card in Documents & Rights of its place, linked to it. Its End date is the renewal date, the insurer is added with the + status and the
 * cover limit and grade go in the Description. Made once, when the card first has a name; removing the Insurances card does not make it again.
 */
export const INSURED_INFRASTRUCTURE_GROUPS = ["premises", "company-vehicles"];
export const INSURED_OFFERING_GROUPS = ["site-hire", "workshop-storage", "production-machinery", "delivery-vehicles"];

export function withNewInsurances(previous: BusinessCapabilityValue, next: BusinessCapabilityValue): BusinessCapabilityValue {
    const named = (slot: BusinessResourceSlotValue) => slot.name.trim() !== "";
    const before = new Map([
        ...Object.values(previous.resources).flatMap(subsections => subsections.flatMap(subsection => subsection.slots)),
        ...previous.offering.resources
    ].map(slot => [slot.id, slot] as const));
    const fresh = (slot: BusinessResourceSlotValue) => slot.insuranceId === "" && slot.insuresId === "" && named(slot) && !(before.get(slot.id) && named(before.get(slot.id) as BusinessResourceSlotValue));
    const made: BusinessResourceSlotValue[] = [];
    const insurance = (slot: BusinessResourceSlotValue, offering: boolean): BusinessResourceSlotValue => {
        const card: BusinessResourceSlotValue = {
            ...createBusinessResourceSlot(),
            name: "Insurance for " + slot.name.trim(),
            status: "costs",
            insuresId: slot.id,
            startDate: slot.startDate || todayIsoDate(),
            cost: { ...createBusinessCost(), frequency: slot.group === "site-hire" ? "per-project" : "annually" },
            ...(offering ? { category: "documents", group: "insurances", offeringIds: [...slot.offeringIds], offeringShares: { ...slot.offeringShares } } : {})
        };
        made.push(card);
        return card;
    };
    let changed = false;
    const link = (slot: BusinessResourceSlotValue, offering: boolean, groupId: string): BusinessResourceSlotValue => {
        if (!(offering ? INSURED_OFFERING_GROUPS : INSURED_INFRASTRUCTURE_GROUPS).includes(groupId) || !fresh(slot)) {
            return slot;
        }
        changed = true;
        return { ...slot, insuranceId: insurance(slot, offering).id };
    };
    const resources = Object.fromEntries(Object.entries(next.resources).map(([category, subsections]) =>
        [category, subsections.map(subsection => ({ ...subsection, slots: subsection.slots.map(slot => link(slot, false, subsection.id)) }))]
    )) as BusinessCapabilityValue["resources"];
    const offeringResources = next.offering.resources.map(slot => link(slot, true, slot.group));
    if (!changed) {
        return next;
    }
    const infrastructureCards = made.filter(card => card.category === "");
    const documents = resources.documents ?? [];
    const withDocuments = infrastructureCards.length === 0
        ? resources
        : {
            ...resources,
            documents: documents.some(subsection => subsection.id === "insurances")
                ? documents.map(subsection => subsection.id === "insurances" ? { ...subsection, slots: [...subsection.slots, ...infrastructureCards] } : subsection)
                : [...documents, { id: "insurances", name: "", slots: infrastructureCards }]
        };
    return {
        ...next,
        resources: withDocuments,
        offering: { ...next.offering, resources: [...offeringResources, ...made.filter(card => card.category !== "")] }
    };
}

/**
 * WHAT MAY BE WRITTEN IN A CARD'S DESCRIPTION, by group (the card structure): the cover limit and grade of an insurance, the outcome of a certificate, the
 * organisation and terms of a partner, the contact and lead time of a supplier. "" for a group with no hint of its own.
 */
export function noteHint(groupId: string): string {
    switch (groupId) {
        case "insurances":
            return "The cover limit, the grade (mandatory, recommended, optional) and any other detail may be written here. The insurer is added with +, as a Business Services supplier.";
        case "certificates":
            return "The outcome (certificate, test report, permit) and any other detail may be written here. The issuing body or inspector is added with +, as a supplier.";
        case "alliances-networks":
        case "revenue-partners":
        case "accreditation-bodies":
            return "The organisation, the contact and the terms of the agreement may be written here.";
        case "goods-equipment":
        case "business-services":
        case "creative-it-services":
        case "property-vehicles-facilities":
        case "technical-support":
        case "producers-wholesalers":
        case "logistics-fulfilment":
        case "contractors-advisers":
        case "agencies-influencers":
        case "venues-organisers":
        case "landlords-leasing-warehouses":
        case "platforms-payments":
            return "The supplier, the contact, the terms and the lead time may be written here.";
        default:
            return "";
    }
}

/** A supplier connected to a rented vehicle shows a Qty before its price (how many vehicles the lease covers). */
export const supplierHasQuantity = (connections: SupplierConnections) => connections.vehicle;

/** Whether a partner or supplier card has a Qty before its price: a lessor of vehicles, and any card priced Per unit (per hour, per kg ...). */
export const partnerHasQuantity = (connections: SupplierConnections, cost: { frequency: string }) => connections.vehicle || cost.frequency === "per-unit";

/** Extras as saved: the known ones that hold a figure, the figure cleaned to its kind. */
export function asBusinessExtras(value: unknown): BusinessExtrasValue {
    const source = asObject(value);
    const kept: BusinessExtrasValue = {};
    for (const key of Object.keys(BUSINESS_EXTRAS) as BusinessExtraKey[]) {
        const text = key in source ? (BUSINESS_EXTRAS[key].kind === "quantity" ? asText(source[key]).replace(/\D/g, "") : businessDecimalText(asText(source[key]))) : "";
        if (text.length > 0) {
            kept[key] = text;
        }
    }
    return kept;
}

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

/**
 * THE COST OPTIONS AND BILLING TYPES (cost model, section 5). A card in Platforms & Payments, Revenue Partners, Royalties, Insurances or Licences asks for
 * a ready-made option: the option sets the billing type, the billing type sets the driver, and the financial engine routes the cost. (A courier and a
 * campaign are priced one way a card, by an option of their own; they have no billing type.)
 *
 * - Percentage: a rate of the revenue it follows. The driver is locked to % of Rev (a calculated COGS line).
 * - Fixed amount: an amount a month or a year. The driver is Monthly or Annually (an OpEx line).
 * - Lump sum: one amount at the start. The driver is One-time (a Start-up expense, or an intangible asset amortised automatically).
 */
export type BillingType = "percentage" | "fixed" | "lump-sum" | "";

export const BILLING_TYPES: readonly { id: Exclude<BillingType, "">; label: string }[] = [
    { id: "percentage", label: "Percentage" },
    { id: "fixed", label: "Fixed amount" },
    { id: "lump-sum", label: "Lump sum" }
];

export interface BusinessCostOption {
    id: string;
    label: string;
    billing: BillingType;
    /** The drivers the option allows, where its billing type does not say (a courier's, a campaign's). */
    frequencies?: readonly string[];
    /** The unit of a Per unit option. */
    unit?: string;
    /** A calculated line for each employee (key-person or health cover): the price is a month's for one. */
    perEmployee?: boolean;
}

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

/**
 * The activity groups of a place, with the period each one's dates stay
 * inside. Infrastructure's Pre-Operational activities also have a type
 * (BUSINESS_PREOPERATIONAL_TYPES), which is not shown as a category.
 */
export const BUSINESS_ACTIVITY_GROUPS = {
    infrastructure: [
        {
            id: "pre-operational",
            label: "Pre-Operational",
            period: "plan-start-to-opening",
            note: "Anything that runs before opening: machinery and its installation, legal and accounting, testing and training, a launch event."
        },
        {
            id: "operational",
            label: "Operational",
            period: "from-opening",
            note: "Activities required to operate the organization day to day."
        }
    ],
    offering: [
        {
            id: "production",
            label: "Production",
            period: "from-plan-start",
            note: "Activities required to design, develop and deliver the offerings."
        },
        {
            id: "marketing",
            label: "Marketing",
            period: "from-plan-start",
            note: "Activities required to promote the organization and its offerings."
        },
        {
            id: "sales",
            label: "Sales & Customer",
            period: "from-opening",
            note: "Activities required to acquire customers and manage customer relationships."
        }
    ]
} as const;

/** What a Pre-Operational activity is: the type it carries (not shown as a category). */
export const BUSINESS_PREOPERATIONAL_TYPES = [
    { id: "capex", label: "Capital Expenditure" },
    { id: "startup", label: "Start-up Expenses" }
] as const;

/** Every activity group of both places, for the lookups that do not care which place. */
export const BUSINESS_ACTIVITY_CATEGORIES = [
    ...BUSINESS_ACTIVITY_GROUPS.infrastructure,
    ...BUSINESS_ACTIVITY_GROUPS.offering
];

/** The activity groups of a place (the ones a card there can be filed under). */
export const activityGroupsOf = (scope: "infrastructure" | "offering") => BUSINESS_ACTIVITY_GROUPS[scope];

/**
 * Where an activity created from a resource's status is filed.
 *
 * "Activities created or assigned from Infrastructure are placed
 * under the appropriate activity category." Setting one up, or
 * finding out about it, is work required to establish and operate
 * the organisation -- which is Operational, word for word.
 */
export const BUSINESS_DERIVED_ACTIVITY_CATEGORY = "operational";

/**
 * The category an activity made by a resource's status is filed under, by the section the resource is in: work to establish and operate the
 * organization (Infrastructure) is Operational, work to design, develop and deliver an offering (Offering's Capability) is Production. The one place
 * to change that default.
 */
export const DERIVED_ACTIVITY_CATEGORY: Record<"infrastructure" | "offering", string> = {
    infrastructure: BUSINESS_DERIVED_ACTIVITY_CATEGORY,
    offering: "production"
};

/** The category of a NEW Activity or Partner / Provider card: none yet -- the cell reads "Select", the card is incomplete till one is chosen. */
export const UNASSIGNED_CATEGORY = "unassigned";

/** An activity category's name: a built-in's label, else the name the user typed ("" while he has not typed it yet). */
export function activityCategoryLabel(categories: readonly { id: string; name: string }[], id: string): string {
    return BUSINESS_ACTIVITY_CATEGORIES.find(entry => entry.id === id)?.label ?? categories.find(entry => entry.id === id)?.name.trim() ?? "";
}

/** A price and how often it is paid. */
export interface BusinessCostValue {
    price: string;
    /** One of BUSINESS_COST_FREQUENCIES' ids, or "". */
    frequency: string;
    /** Named when the frequency is "other" (no longer offered: an older answer's is moved to the card's description). */
    frequencyOther: string;
    /** What a Per unit price is for ("unit", "order", "hour", "kg"...), or "" for none. */
    unit: string;
    /**
     * An ISO currency code, or "" for the organisation's own -- the
     * currency of the country it is registered in on the Identity
     * System's Legal Entity page.
     *
     * "" rather than that code written in, so a price nobody has
     * changed follows the registration if it changes; only a price
     * the founder has set to something else keeps its own.
     */
    currency: string;
}

/** Digits and at most one ".": what a Quantity, Price or Salary holds. */
export const BUSINESS_PLAIN_NUMBER = /^(\d+\.?\d*|\.\d+)$/;

/**
 * What a Quantity, Price or Salary box keeps of what was typed:
 * its digits and its first ".", nothing else. "£30" becomes "30"
 * as it is typed, rather than being refused as a whole.
 */
export function businessDecimalText(text: string): string {
    const kept = text.replace(/[^\d.]/g, "");
    const point = kept.indexOf(".");
    return point < 0
        ? kept
        : kept.slice(0, point + 1) + kept.slice(point + 1).replace(/\./g, "");
}

/**
 * How many of a resource its price is for: the Quantity, when it is
 * a positive number other than 1. Null when it is empty or 1 -- the
 * price is then the price of the one -- and when it is 0 or not a
 * number at all, which count as 1 rather than as nothing.
 *
 * A per-unit or per-project price is never multiplied: its quantity
 * is not how many were bought -- unless it is a PURCHASE (an asset
 * group's card priced Per unit, see isPurchaseGroup): 3 laptops at
 * 1,000 are 3,000. (A partner or supplier card priced Per unit counts
 * as one too: 0.4 of an hour at 23.50 an hour is 9.40. Stock, a Qty
 * that is the opening stock, is not.)
 */
export function resourceUnitCount(quantity: string, frequency: string, purchase = false): number | null {
    if ((frequency === "per-unit" && !purchase) || frequency === "per-order" || frequency === "per-project" || frequency === "percent-revenue") {
        return null;
    }
    const text = quantity.trim();
    if (!BUSINESS_PLAIN_NUMBER.test(text)) {
        return null;
    }
    const count = Number(text);
    return count > 0 && count !== 1 ? count : null;
}

/** The units a Qty may count with decimals; any other unit takes whole numbers. */
export const BUSINESS_DECIMAL_UNITS = ["hour", "metre", "litre", "kWh"] as const;

/**
 * What a Qty box keeps of what was typed: whole digits, or digits and
 * one "." where the unit is an hour, a metre, a litre or kWh.
 */
export function businessQuantityText(text: string, unit = ""): string {
    const named = unit.trim().toLowerCase();
    return BUSINESS_DECIMAL_UNITS.some(entry => entry.toLowerCase() === named)
        ? businessDecimalText(text)
        : text.replace(/\D/g, "");
}

/**
 * A saved Price or Salary written before those boxes took only
 * numbers, as the plain number it meant: "£30" as "30", "1,200.50"
 * as "1200.50", "30 GBP" as "30".
 *
 * Only where the reading is not in doubt. A currency sign, a
 * three-letter code and spaces go; commas go only when they group
 * thousands. "12,5" could be twelve and a half or a typing slip, and
 * "30 a month" is more than a number, so both are kept as written
 * for the founder to correct. A plain number comes back as it was,
 * so reading a value twice changes nothing.
 */
/**
 * A founder's salary and Frequency, as saved -- or migrated from
 * before the one Frequency: then the salary was always a month's and
 * the hours alone had a period (`hoursPeriod`, a week or a month).
 * That period becomes the founder's, and a monthly salary is turned
 * into that period's (a week's: times 12 / 52), rounded to the cent
 * as every amount is kept -- so every figure calculated from it,
 * converted back to a month, is what it was to within that rounding
 * (at most half a cent a week: about 2 cents a month a founder).
 *
 * A salary kept with more than two decimals (the first version of this
 * migration kept them unrounded) is rounded to the cent, once.
 */
/** An amount to the cent, as plain text: "415.38", "1800". */
export function centsText(amount: number): string {
    return String(Math.round(amount * 100) / 100);
}

export function founderSalaryAndPeriod(founder: Record<string, unknown>): { salary: string; period: FounderPeriod } {
    const typed = businessAmountText(founder.salary);
    const salary = /\.\d{3,}$/.test(typed) && parseAmount(typed) !== null
        ? centsText(parseAmount(typed) ?? 0)
        : typed;
    if (founder.period !== undefined) {
        return { salary, period: asFounderPeriod(founder.period) };
    }
    const period: FounderPeriod = asHoursPeriod(founder.hoursPeriod);
    const monthly = parseAmount(salary);
    return period === "week" && monthly !== null
        ? { salary: centsText(monthly * 12 / 52), period }
        : { salary, period };
}

export function businessAmountText(value: unknown): string {
    const text = asText(value).trim();
    if (text === "" || BUSINESS_PLAIN_NUMBER.test(text)) {
        return text;
    }
    const bare = text
        .replace(/\p{Sc}/gu, "")
        .replace(/^\s*[A-Za-z]{3}\s+|\s+[A-Za-z]{3}\s*$/g, "")
        .replace(/\s+/g, "");
    if (BUSINESS_PLAIN_NUMBER.test(bare)) {
        return bare;
    }
    if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(bare)) {
        return bare.replace(/,/g, "");
    }
    return text;
}

export interface BusinessFounderValue {
    id: string;
    name: string;
    /** One line per role: a founder is often several things. */
    roles: string[];
    /** The salary for the founder's period (see founderMonthlySalary). */
    salary: string;
    /** Working hours for the period (see DemandCapacity.ts, deliveryHours). */
    hours: string;
    /** Hours for the period available for delivering Offerings: the preferred answer. */
    deliveryHours: string;
    /** Or the percent of working hours spent delivering (see founderDeliveryHours). */
    deliveryShare: string;
    /** The day the founder starts (an ISO date): a founder has a start date only. */
    startDate: string;
    /** The founder's optional Allowance, Commission and Bonus. */
    extras: BusinessExtrasValue;
    /**
     * The founder's Frequency: whether the salary and the hours above
     * are a week's, a month's or a year's; "" is a month. Every
     * calculation converts them to a month.
     */
    period: FounderPeriod;
}

/**
 * One recorded resource.
 *
 * `providerId` and `activityId` are the two ends of this page's
 * cross-references: the first points into 3. Partners & Suppliers (at Partners
 * & Suppliers or Rent), the second at an activity of 2. Activities (at Activity).
 */
export interface BusinessResourceSlotValue {
    id: string;
    name: string;
    quantity: string;
    description: string;
    /** One of BUSINESS_RESOURCE_STATUSES' ids, or "". */
    status: string;
    cost: BusinessCostValue;
    /**
     * A provider when the status is "provided"; an External
     * Professional or Partner when it is "professional".
     */
    providerId: string;
    /**
     * The Page 1 Offerings it serves -- Offering's Capability only. One
     * resource, activity or partner can serve several (the same yarn
     * in two collections).
     */
    offeringIds: string[];
    /** A Workspace card (the Workspace category): its type (BUSINESS_WORKSPACE_KINDS' id), the name of an "Other" one, and its optional deposit. */
    workspaceKind: string;
    workspaceKindOther: string;
    deposit: string;
    /**
     * An OFFERING card's category and group (BUSINESS_OFFERING_RESOURCE_GROUPS' ids); "" while it is in "No category" / "No group". An Infrastructure
     * card has neither: the subsection that holds it is its group.
     */
    category: string;
    group: string;
    /** The day the resource starts (an ISO date, "YYYY-MM-DD"); "" while it is not given. Asked on every card. */
    startDate: string;
    /** The day it ends (an ISO date); optional. */
    endDate: string;
    /** The activity chosen at the status Activity (an id of an activity of its place), "" for none. */
    activityId: string;
    /** Years the asset stays useful to the business (it feeds the depreciation line); "" for the group's default. Asked of an asset bought. */
    usefulLife: string;
    /** The equipment has a warranty (information only), and the day it lasts until (an ISO date). */
    warranty: boolean;
    warrantyUntil: string;
    /** A contract's own rate (a percent) in place of the default one: royalties. Optional. */
    rateOverride: string;
    /** The ready-made cost option of its group (costOptionsOf), which sets the billing type and locks the driver; "" until chosen. */
    costOption: string;
    /** Years an intangible asset (an upfront franchise fee) is amortised over; "" until given. */
    amortisationYears: string;
    /** The optional extras of the card (slotExtraKeys). */
    extras: BusinessExtrasValue;
    /** The payment plan of a Per project price. */
    paymentPlan: BusinessPaymentPlan;
    /** The share of the card each linked Offering carries, by Offering id, when several are linked (they total 100%). */
    offeringShares: Record<string, string>;
    /**
     * The statuses added beside the first with the "+": a further supplier of the same resource (the installer, the insurer...), or a further activity.
     * Each is a row of its own.
     */
    extraStatuses: BusinessStatusRow[];
    /** The Insurances card generated for this card when it was made ("" until then; kept when that card is removed, so it is not made again). */
    insuranceId: string;
    /** On a generated Insurances card: the card it insures ("" for any other). */
    insuresId: string;
}

/** A status row added with the "+" of a card's Status: its own status and the supplier or activity it names. */
export interface BusinessStatusRow {
    id: string;
    /** One of BUSINESS_EXTRA_STATUS_IDS, or "". */
    status: string;
    providerId: string;
    activityId: string;
}

/** The statuses a row added with the "+" can have. */
export const BUSINESS_EXTRA_STATUS_IDS = ["partners-suppliers", "activity"] as const;

/**
 * One subsection of a resource group: a fixed kind, or a named
 * addition.
 *
 * A fixed kind's id IS the kind's id, never a generated one. The
 * editor has to find a kind's slots while rendering, and a
 * generated id would be a new id on every render -- which is a new
 * card, losing the caret out of whatever was being typed into.
 */
export interface BusinessResourceSubsectionValue {
    id: string;
    /** Only an addition carries one; a fixed kind has its own. */
    name: string;
    slots: BusinessResourceSlotValue[];
}

export interface BusinessActivityValue {
    id: string;
    /**
     * Its category: "operational", "production", "marketing", "sales" or one the user made (BusinessCapabilityValue.activityCategories). An
     * Infrastructure activity is filed in the category it stands in (that is its truth); an Offering's carries it here. A saved Offering activity without
     * one is read as Production (Operational when a resource of Infrastructure made it).
     */
    category: string;
    name: string;
    description: string;
    /**
     * Founder, partner or provider ids: an activity can take more
     * than one person.
     */
    performerIds: string[];
    /**
     * A founder id -- one responsible person, as specified. The one
     * CHOSEN; where the choice is not the founder's to make (see
     * businessAutoResponsibleId) that rule wins, and this is kept
     * for when it stops applying.
     */
    responsibleId: string;
    /**
     * The Responsible tick, unticked: no responsible by choice (the field
     * is removed for this card, responsibleId is cleared). Absent means
     * ticked, the default. See responsibleIsOff.
     */
    responsibleOff?: boolean;
    completed: boolean;
    /**
     * The Page 1 Offerings it serves -- Offering's Capability only. One
     * resource, activity or partner can serve several (the same yarn
     * in two collections).
     */
    offeringIds: string[];
    /** A Pre-Operational activity's type (BUSINESS_PREOPERATIONAL_TYPES' id), "" for any other. */
    type: string;
    /** The card whose Activity status made it with "+ Add" (its name is written there, and the activity's name is a link back to it); "" for one made on its own. */
    madeBy: string;
    /** The day it starts (an ISO date); asked on every card. */
    startDate: string;
    /** The day it ends (an ISO date); optional. */
    endDate: string;
    /** The share of the card each linked Offering carries, by Offering id, when several are linked (they total 100%). */
    offeringShares: Record<string, string>;
    /** The resources the activity uses (the Resources tick), each with the units of it the activity takes when it has units. */
    resources: BusinessActivityResource[];
    /** How many people each performer is, by performer id ("" is one). */
    performerPeople: Record<string, string>;
}

export interface BusinessActivityCategoryValue {
    id: string;
    /** Only an added category carries one. */
    name: string;
    activities: BusinessActivityValue[];
}

/**
 * A CATEGORY the user keeps (Partners & Suppliers': "Legal", "Couriers" ...): an id and the name he typed under "Other". The built-in categories
 * (Partners, Providers) are not stored here.
 */
export interface BusinessCategoryValue {
    id: string;
    name: string;
}

/** The two types of card in Partners & Suppliers; each type's groups (BUSINESS_PARTNER_GROUPS) play the part of categories. */
export const PARTNER_CATEGORIES = [
    { id: "partners", label: "Partners" },
    { id: "suppliers", label: "Suppliers" }
] as const;

/** The groups of each type, by place: fixed lists (21 groups in Infrastructure with the resources', 26 in the Offering with theirs). */
export const BUSINESS_PARTNER_GROUPS: Record<"infrastructure" | "offering", Record<"partners" | "suppliers", readonly { id: string; label: string; help: string }[]>> = {
    infrastructure: {
        partners: [
            { id: "alliances-networks", label: "Alliances & Networks", help: "Organisations you join for the benefit of the whole company, e.g. Trade association, Buying group, Start-up accelerator, Producers cooperative." }
        ],
        suppliers: [
            { id: "goods-equipment", label: "Goods & Equipment", help: "Sellers of furniture, devices and consumables for the company, e.g. Furniture dealer, Stationery merchant, Computer reseller, Water-cooler rental." },
            { id: "business-services", label: "Business Services", help: "Firms that run the administrative side, e.g. Accountant, Lawyer, Insurance broker, Payroll bureau, Business bank, Web host." },
            { id: "creative-it-services", label: "Creative & IT Services", help: "Freelancers and small agencies for design, branding, content or technology work, e.g. Web builder, Brand identity house, Photographer, IT support, Copywriter." },
            { id: "property-vehicles-facilities", label: "Property, Vehicles & Facilities", help: "Owners and caretakers of the premises, and lessors of vehicles, e.g. Landlord, Coworking operator, Cleaner, Car lessor." },
            { id: "technical-support", label: "Technical Support", help: "Outsourced technicians who maintain, repair and install the company's assets, e.g. Electrical engineer, Plumber, Boiler fitter, Network cabling. An installation is linked to the asset it installs." }
        ]
    },
    offering: {
        partners: [
            { id: "revenue-partners", label: "Revenue Partners", help: "Parties who sell for you or send customers, and take a cut of each sale, e.g. Boutique stockist, Distributor, Referral partner, Affiliate blogger, Co-teacher." },
            { id: "accreditation-bodies", label: "Accreditation Bodies", help: "Bodies whose approval gives your work credibility, e.g. Weavers' guild, Craft standards panel, Culinary institute." }
        ],
        suppliers: [
            { id: "producers-wholesalers", label: "Producers & Wholesalers", help: "Producers and wholesalers that sell the materials and parts in the product, e.g. Wool mill, Box maker, Fabric importer, Flour miller." },
            { id: "logistics-fulfilment", label: "Logistics & Fulfilment", help: "Carriers and warehouses that deliver orders to buyers, e.g. Courier, National post, Fulfilment centre, Freight forwarder." },
            { id: "contractors-advisers", label: "Contractors & Advisers", help: "Outsourced specialists who do part of an offering's job or guide it, e.g. Dye works, Freelance developer, Product-safety adviser, Electrician." },
            { id: "agencies-influencers", label: "Agencies & Influencers", help: "Firms and creators paid to spread the word, e.g. Marketing agency, Instagram creator, Poster press, Podcast sponsor." },
            { id: "venues-organisers", label: "Venues & Organisers", help: "Hosts of the places and events where you sell, e.g. Fair organiser, Exhibition hall, Show promoter." },
            { id: "landlords-leasing-warehouses", label: "Landlords, Leasing & Warehouses", help: "Owners of premises used for making or storing stock, and lessors of vehicles, e.g. Estate owner, Depot firm, Chilled-storage outfit, Van leasing specialist." },
            { id: "platforms-payments", label: "Platforms & Payments", help: "Intermediaries between you and the customer who charge a fee, e.g. Online marketplace, Payment processor, App store, Reservation portal." }
        ]
    }
};

/** The help text of Founders & Owners, the first group of Human Resources in Infrastructure (the Founders tile): the help-texts document's own. */
export const FOUNDERS_OWNERS_HELP = "Owners who work in the company and draw pay from it, e.g. Founder salary, Part-time director fee.";

/**
 * THE HELP OF A CATEGORY, as the help-texts document shows it: the text of its one group, or one line for each of its groups ("Company Vehicles: cars and
 * bikes the company owns ..."), the group's name first and its text after it in lower case.
 */
export function groupHelpLines(groups: readonly { label: string; help: string }[]): string[] {
    const usable = groups.filter(group => group.help.length > 0);
    return usable.length === 1 ? [usable[0].help] : usable.map(group => group.label + ": " + group.help.charAt(0).toLowerCase() + group.help.slice(1));
}

/** The same as points of an "i": one group is its text; several are each a bold name and its text (as the Status's "i" lists its options). */
export function groupHelpPoints(groups: readonly { label: string; help: string }[]): (string | { title: string; text: string })[] {
    const usable = groups.filter(group => group.help.length > 0);
    return usable.length === 1 ? [usable[0].help] : usable.map(group => ({ title: group.label, text: group.help }));
}

/** The help text ("i") of a partner or supplier group, "" for none (no group, or an older answer's). */
export function partnerGroupHelp(place: "infrastructure" | "offering", type: string | undefined, group: string): string {
    return type === "partners" || type === "suppliers" ? BUSINESS_PARTNER_GROUPS[place][type].find(entry => entry.id === group)?.help ?? "" : "";
}

/** Where an older answer's Partners and Suppliers are filed: both are Suppliers, the first in the group that holds advisers and services. */
export const LEGACY_PARTNER_GROUP: Record<"infrastructure" | "offering", string> = { infrastructure: "business-services", offering: "contractors-advisers" };

/** A category's name: a built-in's label, else the name the user typed ("" while he has not typed it yet). */
export function partnerCategoryLabel(categories: readonly BusinessCategoryValue[], id: string): string {
    return PARTNER_CATEGORIES.find(entry => entry.id === id)?.label ?? categories.find(entry => entry.id === id)?.name.trim() ?? "";
}

/** What a card of this category is called in a link ("Open Partner", "Open Supplier"): a Supplier only in the Suppliers type. */
export const partnerNoun = (category: string): "Partner" | "Supplier" => category === "suppliers" ? "Supplier" : "Partner";

/** Which of the two stored lists a card counts as (for the Financial Foundation's expense natures): by its category, else by the list it is stored in. */
export function partnerKindOf(partner: { category: string }, stored: "professionals" | "providers"): "professionals" | "providers" {
    return partner.category === "suppliers" ? "providers" : partner.category === "partners" ? "professionals" : stored;
}

export interface BusinessPartnerValue {
    id: string;
    /**
     * Its category: "partners", "providers" or a category the user made (BusinessCapabilityValue.partnerCategories). A saved card without one is read
     * as the list it is in (professionals: Partners, providers: Providers), so nothing is lost.
     */
    category: string;
    name: string;
    description: string;
    /** Its group within the type (BUSINESS_PARTNER_GROUPS' id), "" while it is in "No group". */
    group: string;
    /** A contract's own rate (a percent) in place of the default one: a Revenue Partner's. Optional. */
    rateOverride: string;
    /** The ready-made cost option of its group (costOptionsOf), which sets the billing type and locks the driver; "" until chosen. */
    costOption: string;
    /** A supplier connected to a rented vehicle: how many vehicles its price is for ("" is one). */
    quantity: string;
    /** The optional extras of the card (partnerExtraKeys). */
    extras: BusinessExtrasValue;
    /** The payment plan of a Per project price. */
    paymentPlan: BusinessPaymentPlan;
    /** The share of the card each linked Offering carries, by Offering id, when several are linked (they total 100%). */
    offeringShares: Record<string, string>;
    /** The card whose Status made it with "Other…" (made for that card's Offerings and start); "" for one made on its own. */
    madeBy: string;
    /** The day it starts (an ISO date); asked on every card. */
    startDate: string;
    /** The day it ends (an ISO date); optional. */
    endDate: string;
    /** A founder id: who contacts and coordinates them. */
    responsibleId: string;
    /** The Responsible tick, unticked: no responsible by choice. Absent means ticked. */
    responsibleOff?: boolean;
    cost: BusinessCostValue;
    /**
     * The Page 1 Offerings it serves -- Offering's Capability only. One
     * resource, activity or partner can serve several (the same yarn
     * in two collections).
     */
    offeringIds: string[];
}

/**
 * The whole page.
 *
 * Founders and the Workspace belong to Infrastructure alone -- they
 * are A and B of its Resources, and an Offering does not have its
 * own founders -- so they sit at the top rather than inside a
 * section.
 *
 * Infrastructure's Resources and Activities are grouped (C-F, A-E);
 * Offering's Capability's are flat lists, as its own part of the
 * specification writes them. Both split their Partnerships into
 * professionals and providers, because both sections' status lists
 * send the reader to "A. External Professionals & Partners or
 * B. Providers".
 */
/**
 * A Workspace as the cost model, the exports and the tiles read it: a RESOURCE CARD of the built-in "Workspace" category (resources.workspace), seen through
 * `workspacesOf`. It is not stored apart: a card whose Category is Workspace is the one Resource card with the Workspace form's fields in it (its type, its
 * deposit), and it keeps its id when its Category is changed.
 */
export interface BusinessWorkspaceValue {
    id: string;
    /** The card's name: its type's label ("Dedicated Workspace"), or what the founder wrote. */
    name: string;
    /** One of BUSINESS_WORKSPACE_KINDS' ids, or "". */
    kind: string;
    kindOther: string;
    status: string;
    cost: BusinessCostValue;
    providerId: string;
    /**
     * An optional deposit on the Workspace (an amount, in the cost's
     * currency), meaningful at Costs only. "" = none. The Financial
     * Foundation gathers it as a one-time Deposit asset.
     */
    deposit: string;
}

/** The id of the first Workspace card (the one every earlier answer has). */
export const FIRST_WORKSPACE_ID = "workspace";

/** The built-in Resources category whose cards are Workspaces. */
export const WORKSPACE_GROUP_ID = "workspace";

/** The group of the Workspace category that holds the Workspace cards (the id of their subsection). */
export const PREMISES_GROUP_ID = "premises";

/**
 * The format of a Page 3 answer. Version 3 has the nine categories with their groups, Partners & Suppliers and the current statuses and frequencies;
 * an answer without it is read once into them (see asBusinessCapabilityValue) and written back with it.
 */
export const BUSINESS_CAPABILITY_FORMAT_VERSION = 3;

/**
 * Where the fixed kinds of the five earlier Infrastructure categories are filed now: [category, group]. A kind the user made ("Other") has no group
 * and goes to "No group" of its category, its name written into the description of its cards.
 */
export const LEGACY_KIND_GROUP: Record<string, [string, string]> = {
    workspace: ["workspace", PREMISES_GROUP_ID],
    electricity: ["utilities", "premises-utilities"],
    internet: ["utilities", "premises-utilities"],
    heating: ["utilities", "premises-utilities"],
    cooling: ["utilities", "premises-utilities"],
    water: ["utilities", "premises-utilities"],
    furniture: ["workstation", "furniture-fittings"],
    electrical: ["workstation", "furniture-fittings"],
    supporting: ["workstation", "furniture-fittings"],
    computing: ["equipment", "devices-tools"],
    peripherals: ["equipment", "devices-tools"],
    specialised: ["equipment", "devices-tools"],
    software: ["digital", "software-web"],
    presence: ["digital", "software-web"],
    services: ["digital", "cloud-security"]
};

/** The activity categories an earlier answer had (the same four in both places), for the note an activity that has to leave its category carries. */
export const LEGACY_ACTIVITY_CATEGORY_LABELS: Record<string, string> = {
    operational: "Operational",
    production: "Production",
    marketing: "Marketing",
    sales: "Sales & Customer"
};

/** What a Workspace card is called where cards are listed in the documents and the costs: "Workspace" for the first, "Workspace 2" and on for the others. */
export const workspaceCardName = (index: number) => index === 0 ? "Workspace" : "Workspace " + (index + 1);

/** The Workspace cards of an answer, in order: the resource cards of its Workspace category. */
export function workspacesOf(capability: { resources: Record<string, BusinessResourceSubsectionValue[]> }): BusinessWorkspaceValue[] {
    return (capability.resources[WORKSPACE_GROUP_ID] ?? []).flatMap(subsection => subsection.slots).map(slot => ({
        id: slot.id,
        name: slot.name,
        kind: slot.workspaceKind,
        kindOther: slot.workspaceKindOther,
        status: slot.status,
        cost: slot.cost,
        providerId: slot.providerId,
        deposit: slot.deposit
    }));
}

/** Whether an answer saved before there were Workspace cards held anything in its Workspace (an untouched one made no card then, and makes none now). */
export function legacyWorkspaceSlots(source: Record<string, unknown>): BusinessResourceSlotValue[] {
    const list: unknown[] = Array.isArray(source.workspaces) ? source.workspaces : source.workspace !== undefined ? [source.workspace] : [];
    const seen = new Set<string>();
    return list.flatMap((entry, index) => {
        const workspace = asObject(entry);
        const kind = asText(workspace.kind);
        const cost = asBusinessCost(workspace.cost);
        const status = asText(workspace.status);
        const providerId = asText(workspace.providerId);
        const deposit = businessDecimalText(asText(workspace.deposit));
        if (!kind && !status && !cost.price && !providerId && !deposit) {
            return [];
        }
        let id = asText(workspace.id) || (index === 0 ? FIRST_WORKSPACE_ID : randomId("workspace"));
        const earlierStatus = status === "investigation" ? "Needs Investigation" : "";
        if (seen.has(id)) {
            id = randomId("workspace");
        }
        seen.add(id);
        const label = BUSINESS_WORKSPACE_KINDS.find(entry => entry.id === kind)?.label ?? "";
        const other = asText(workspace.kindOther).trim();
        return [{
            ...createBusinessResourceSlot(),
            id,
            // (Its name is its type's: it stays complete, and the totals are as they were.)
            name: kind === "other" && other ? other : label || workspaceCardName(index),
            description: withEarlier("", "status", earlierStatus),
            status: spaceStatusOf(status),
            cost: normalCostOf(cost, "infrastructure", PREMISES_GROUP_ID),
            providerId,
            workspaceKind: kind,
            workspaceKindOther: asText(workspace.kindOther),
            deposit
        }];
    });
}

export interface BusinessCapabilityValue {

    /** BUSINESS_CAPABILITY_FORMAT_VERSION once read; an answer saved before it is moved to the current categories when it is read. */
    formatVersion?: number;

    founders: BusinessFounderValue[];

    /** C-F, by group id (and the Workspace category: its cards are read through `workspacesOf`). */
    resources: Record<string, BusinessResourceSubsectionValue[]>;

    activities: BusinessActivityCategoryValue[];

    professionals: BusinessPartnerValue[];

    providers: BusinessPartnerValue[];

    /** The categories of Partners & Suppliers the user has made (under "Other"), shared by Infrastructure's and Offering's cards. */
    partnerCategories: BusinessCategoryValue[];

    /** The categories of activities the user has made (under "Other"), shared by Infrastructure's and Offering's activities. */
    activityCategories: BusinessCategoryValue[];

    offering: {
        resources: BusinessResourceSlotValue[];
        activities: BusinessActivityValue[];
        professionals: BusinessPartnerValue[];
        providers: BusinessPartnerValue[];
    };

    /**
     * How each Offering is delivered, by Offering id: the effort one
     * unit takes, how long, and by whom (see DemandCapacity.ts).
     */
    delivery: Record<string, DeliveryValue>;

}

/**
 * THE DATE DEFINES THE ORDER (then the number): every list of cards of the Infrastructure & Capability page -- a resource group's, an activity category's,
 * the partners' and suppliers' -- is kept in the order of the cards' Start dates, the earliest first; a card with the same date keeps its place, a card
 * with no date goes last. The founders keep the order the Legal Entity gives them.
 */
export function orderedByDate(value: BusinessCapabilityValue): BusinessCapabilityValue {
    const byDate = <T extends { startDate: string }>(cards: T[]): T[] => {
        const sorted = cards.map((card, at) => ({ card, at })).sort((a, b) => {
            const first = a.card.startDate || "9999-99-99";
            const second = b.card.startDate || "9999-99-99";
            return first < second ? -1 : first > second ? 1 : a.at - b.at;
        }).map(entry => entry.card);
        return sorted.every((card, at) => card === cards[at]) ? cards : sorted;
    };
    return {
        ...value,
        resources: Object.fromEntries(Object.entries(value.resources).map(([id, subsections]) => [id, subsections.map(subsection => ({ ...subsection, slots: byDate(subsection.slots) }))])),
        activities: value.activities.map(category => ({ ...category, activities: byDate(category.activities) })),
        professionals: byDate(value.professionals),
        providers: byDate(value.providers),
        offering: {
            ...value.offering,
            resources: byDate(value.offering.resources),
            activities: byDate(value.offering.activities),
            professionals: byDate(value.offering.professionals),
            providers: byDate(value.offering.providers)
        }
    };
}

export function createBusinessCost(): BusinessCostValue {
    return { price: "", frequency: "", frequencyOther: "", unit: "", currency: "" };
}

export function createBusinessFounder(): BusinessFounderValue {
    return { id: randomId("founder"), name: "", roles: [""], salary: "", hours: "", deliveryHours: "", deliveryShare: "", period: "", startDate: "", extras: {} };
}

export function createBusinessResourceSlot(): BusinessResourceSlotValue {
    return {
        id: randomId("resource"),
        name: "",
        quantity: "1",
        description: "",
        status: "",
        cost: createBusinessCost(),
        providerId: "",
        offeringIds: [],
        workspaceKind: "",
        workspaceKindOther: "",
        deposit: "",
        category: "",
        group: "",
        // (A card begins today unless told otherwise.)
        startDate: todayIsoDate(),
        endDate: "",
        activityId: "",
        usefulLife: "",
        warranty: false,
        warrantyUntil: "",
        rateOverride: "",
        costOption: "",
        amortisationYears: "",
        extras: {},
        paymentPlan: emptyPaymentPlan(),
        offeringShares: {},
        extraStatuses: [],
        insuranceId: "",
        insuresId: ""
    };
}

export function createBusinessActivity(category = ""): BusinessActivityValue {
    return {
        id: randomId("activity"),
        category,
        name: "",
        description: "",
        performerIds: [],
        responsibleId: "",
        completed: false,
        offeringIds: [],
        type: "",
        madeBy: "",
        startDate: todayIsoDate(),
        endDate: "",
        offeringShares: {},
        resources: [],
        performerPeople: {}
    };
}

export function createBusinessPartner(name = "", category = ""): BusinessPartnerValue {
    return {
        id: randomId("partner"),
        category,
        group: "",
        rateOverride: "",
        costOption: "",
        quantity: "",
        extras: {},
        paymentPlan: emptyPaymentPlan(),
        offeringShares: {},
        madeBy: "",
        startDate: todayIsoDate(),
        endDate: "",
        name,
        description: "",
        responsibleId: "",
        cost: createBusinessCost(),
        offeringIds: []
    };
}

/**
 * What Partners opens with: nothing. (It used to be seeded with an Accountant, a Lawyer and an Insurance Professional; a saved answer keeps
 * whatever it holds, these included -- only a page with none stored stops getting them.)
 */
export function seededProfessionals(): BusinessPartnerValue[] {
    return [];
}

export function asBusinessCost(value: unknown): BusinessCostValue {

    const cost = asObject(value);

    /* Per order is Per unit now, with "order" as its unit; the price and the way it is counted are as they were. */
    const perOrder = asText(cost.frequency) === "per-order";

    return {
        price: businessAmountText(cost.price),
        frequency: perOrder ? "per-unit" : asText(cost.frequency),
        frequencyOther: asText(cost.frequencyOther),
        unit: asText(cost.unit) || (perOrder ? "order" : ""),
        currency: asText(cost.currency)
    };

}

/**
 * A cost saved with the frequency "Other" (which is no longer offered): the frequency is cleared -- the card shows incomplete until one is chosen --
 * and what it was called is returned, to be written into the card's description rather than lost.
 */
export function withoutOtherFrequency(cost: BusinessCostValue): { cost: BusinessCostValue; was: string } {
    if (cost.frequency !== "other") {
        return { cost, was: "" };
    }
    return { cost: { ...cost, frequency: "", frequencyOther: "" }, was: cost.frequencyOther.trim() || "Other" };
}

/** A description with what an earlier version of the page called the card, put in front of it so that nothing is lost. */
export function withEarlier(description: string, what: string, was: string): string {
    return (was ? "Earlier " + what + ": " + was + ". " + description : description).trim();
}

/** The status a space (the Workspace form) has in the current statuses, from an earlier answer's. Needs Investigation and Needs Activity were none of its. */
export function spaceStatusOf(status: string): string {
    return status === "provided" || status === "partners-providers" || status === "professional" ? "rent"
        : status === "costs" ? "buy"
        : (BUSINESS_WORKSPACE_STATUS_IDS as readonly string[]).includes(status) ? status : "";
}

/** The status any other card has in the current statuses, from an earlier answer's. */
export function cardStatusOf(status: string): string {
    return status === "provided" || status === "professional" || status === "partners-providers" ? "partners-suppliers"
        : status === "rent" ? "partners-suppliers"
        : status === "buy" ? "costs"
        : status;
}

export function asBusinessResourceSlot(
    entry: unknown,
    workspace = false,
    context: {
        /** The answer was saved before the nine categories (no format version 3): its statuses, frequencies and quantities are moved to the current ones. */
        legacy?: boolean;
        /** The group the card is filed in (an Infrastructure card's subsection, an Offering card's own). */
        groupId?: string;
        /** Its place: the group's frequency and unit are those of the place. */
        place?: "infrastructure" | "offering";
    } = {}
): BusinessResourceSlotValue {

    const slot = asObject(entry);

    /* Quantity took any text before it took only a number. What is
       not a plain number -- "3 tables, 6 shelving units", "6 lamps",
       "8 per workshop" -- is moved to the front of the description
       rather than lost, and the Quantity left empty. Even "6 lamps"
       keeps no 6: a Quantity that was not a number meant the price
       was the total, and a 6 here would multiply it. Once moved,
       the Quantity is "", so reading it again moves nothing. */
    const quantity = asText(slot.quantity).trim();
    const description = asText(slot.description);
    /* Digits and one "." are a number, or one being typed: "3." and
       "." are on their way to one and stay. */
    const moved = !/^\d*\.?\d*$/.test(quantity);

    const groupId = context.groupId ?? "";
    const rawStatus = asText(slot.status);

    /* An earlier answer's status, in the current ones (see the F1 mapping): Provided is Rent on a space and Partners & Suppliers elsewhere; Costs on a
       space is Buy; Needs Investigation belongs to the people cards, and on any other card it is cleared and said in the description. */
    let status = rawStatus;
    let earlierStatus = "";
    if (workspace) {
        status = context.legacy ? spaceStatusOf(rawStatus) : rawStatus;
        if (context.legacy && rawStatus === "investigation") {
            earlierStatus = "Needs Investigation";
        }
    } else if (context.legacy) {
        status = cardStatusOf(rawStatus);
    } else {
        // (Provided and Partners were one status already, before the nine categories.)
        status = rawStatus === "provided" || rawStatus === "professional" ? "partners-suppliers" : rawStatus;
    }
    // Needs Investigation is no longer a status, on any card: it is cleared and said in the description.
    if (status === "investigation") {
        status = "";
        earlierStatus = "Needs Investigation";
    }

    const read = asBusinessCost(slot.cost);
    const { cost: noOther, was: earlierFrequency } = withoutOtherFrequency(read);

    /* A purchase of an asset is priced Per unit: an earlier answer's One-time price in an asset group moves to it (Qty times the price, as before). */
    const cost = context.legacy && isPurchaseGroup(groupId) && isCostingStatus(status) && noOther.frequency === "one-time"
        ? { ...noOther, frequency: "per-unit", unit: noOther.unit || "unit" }
        : noOther;

    return {
        id: asText(slot.id) || randomId("resource"),
        name: asText(slot.name),
        quantity: moved ? "" : quantity,
        description: withEarlier(withEarlier(moved
            ? ("Quantity: " + quantity.replace(/\.$/, "") + ". " + description).trim()
            : description, "frequency", earlierFrequency), "status", earlierStatus),
        status,
        cost: normalCostOf(cost, context.place ?? "infrastructure", groupId),
        providerId: asText(slot.providerId),
        offeringIds: offeringIdsOf(slot),
        workspaceKind: asText(slot.workspaceKind),
        workspaceKindOther: asText(slot.workspaceKindOther),
        deposit: businessDecimalText(asText(slot.deposit)),
        category: asText(slot.category),
        group: asText(slot.group),
        startDate: isoDateText(slot.startDate),
        endDate: isoDateText(slot.endDate),
        activityId: asText(slot.activityId),
        usefulLife: businessDecimalText(asText(slot.usefulLife)),
        warranty: slot.warranty === true,
        warrantyUntil: isoDateText(slot.warrantyUntil),
        rateOverride: businessDecimalText(asText(slot.rateOverride)),
        costOption: validCostOption(context.place ?? "infrastructure", groupId, asText(slot.costOption)),
        amortisationYears: asText(slot.amortisationYears).replace(/\D/g, "").slice(0, 3),
        extras: asBusinessExtras(slot.extras),
        paymentPlan: asPaymentPlan(slot.paymentPlan),
        offeringShares: asOfferingShares(slot.offeringShares, offeringIdsOf(slot)),
        extraStatuses: (Array.isArray(slot.extraStatuses) ? slot.extraStatuses : []).map(entry => {
            const row = asObject(entry);
            return {
                id: asText(row.id) || randomId("status"),
                status: (BUSINESS_EXTRA_STATUS_IDS as readonly string[]).includes(asText(row.status)) ? asText(row.status) : "",
                providerId: asText(row.providerId),
                activityId: asText(row.activityId)
            };
        }),
        insuranceId: asText(slot.insuranceId),
        insuresId: asText(slot.insuresId)
    };

}

/**
 * THE SHARES of the Offerings a card is linked to: the percent of the card each Offering carries, when it is linked to several. They total 100% or the card
 * is incomplete; one Offering carries all of it. Ticking Offerings starts them equal.
 */
export function equalOfferingShares(offeringIds: readonly string[]): Record<string, string> {
    // (Whole percents, of at most two digits: three Offerings are 33, 33 and 34.)
    const each = Math.floor(100 / Math.max(1, offeringIds.length));
    return Object.fromEntries(offeringIds.map((id, at) => [id, String(at === offeringIds.length - 1 ? 100 - each * (offeringIds.length - 1) : each)]));
}

/**
 * THE SHARES COUNT IN UNITS instead of percents when the card says so (a delivery of 3 items of one Offering and 5 of another): a reserved entry of the
 * shares, UNITS_KEY, holds "1". The units are then shares of their own total, and there is nothing to total to 100.
 */
export const OFFERING_UNITS_KEY = "~units";

export const offeringSharesInUnits = (shares: Record<string, string>) => shares[OFFERING_UNITS_KEY] === "1";

/** Every linked Offering one unit, in units. */
export function unitOfferingShares(offeringIds: readonly string[]): Record<string, string> {
    return { ...Object.fromEntries(offeringIds.map(id => [id, "1"])), [OFFERING_UNITS_KEY]: "1" };
}

/** What the typed shares of the linked Offerings add up to (an Offering with none typed counts nothing). */
export function offeringSharesTotal(offeringIds: readonly string[], shares: Record<string, string>): number {
    return Math.round(offeringIds.reduce((sum, id) => sum + (parseAmount(shares[id] ?? "") ?? 0), 0) * 100) / 100;
}

/** Whether a card linked to several Offerings has a share missing, or shares that do not total 100%. One or none: nothing to share. */
export function offeringSharesIncomplete(offeringIds: readonly string[], shares: Record<string, string>): boolean {
    if (offeringSharesInUnits(shares)) {
        return offeringIds.length > 1 && offeringIds.some(id => !((parseAmount(shares[id] ?? "") ?? 0) > 0));
    }
    return offeringIds.length > 1 && (offeringIds.some(id => (shares[id] ?? "") === "") || offeringSharesTotal(offeringIds, shares) !== 100);
}

/** The fraction of a card each linked Offering carries: the typed shares when they total 100%, else equal ones. */
export function offeringFractions(offeringIds: readonly string[], shares: Record<string, string>): Record<string, number> {
    const typed = offeringIds.length > 1 && !offeringSharesIncomplete(offeringIds, shares);
    const whole = offeringSharesInUnits(shares) ? offeringIds.reduce((sum, id) => sum + (parseAmount(shares[id] ?? "") ?? 0), 0) : 100;
    return Object.fromEntries(offeringIds.map(id => [id, typed ? (parseAmount(shares[id] ?? "") ?? 0) / whole : 1 / offeringIds.length]));
}

/** The shares kept: those of the Offerings the card is linked to, cleaned to numbers. */
export function asOfferingShares(value: unknown, offeringIds: readonly string[]): Record<string, string> {
    const source = asObject(value);
    const kept = Object.fromEntries(offeringIds.filter(id => id in source).map(id => [id, businessDecimalText(asText(source[id]))]));
    // A card linked to several Offerings before there were shares was shared equally: it keeps being.
    if (offeringIds.length > 1 && Object.keys(kept).length === 0) {
        return equalOfferingShares(offeringIds);
    }
    return offeringIds.length > 1 && source[OFFERING_UNITS_KEY] === "1" ? { ...kept, [OFFERING_UNITS_KEY]: "1" } : kept;
}

/** An ISO date ("YYYY-MM-DD") as saved; anything else is not a date and reads as none. */
export function isoDateText(value: unknown): string {
    const text = asText(value).trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!match) {
        return "";
    }
    // A real day: 2027-02-30 is none.
    const day = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return day.getUTCFullYear() === Number(match[1]) && day.getUTCMonth() === Number(match[2]) - 1 && day.getUTCDate() === Number(match[3]) ? text : "";
}

/** A list of unknowns: what is not a list reads as none. */
export function asArrayOf(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

/** A list now; one Offering before, which is kept as the list's first. */
export function offeringIdsOf(entry: Record<string, unknown>): string[] {
    const list = Array.isArray(entry.offeringIds)
        ? entry.offeringIds.map(asText)
        : [asText(entry.offeringId)];
    return [...new Set(list.filter(id => id.length > 0))];
}

export function asBusinessActivity(entry: unknown, fallbackCategory = ""): BusinessActivityValue {

    const activity = asObject(entry);

    return {
        id: asText(activity.id) || randomId("activity"),
        category: asText(activity.category) || fallbackCategory,
        name: asText(activity.name),
        description: asText(activity.description),
        /* A list now; one id before. The one chosen is kept. An
           empty entry is a picker added and not yet chosen, and
           stays while it is on screen. */
        performerIds: Array.isArray(activity.performerIds)
            ? activity.performerIds.map(asText)
            : [asText(activity.performerId)].filter(id => id.length > 0),
        responsibleId: asText(activity.responsibleId),
        ...(activity.responsibleOff === true ? { responsibleOff: true } : {}),
        completed: activity.completed === true,
        offeringIds: offeringIdsOf(activity),
        type: BUSINESS_PREOPERATIONAL_TYPES.some(entry => entry.id === asText(activity.type)) ? asText(activity.type) : "",
        madeBy: asText(activity.madeBy),
        startDate: isoDateText(activity.startDate),
        endDate: isoDateText(activity.endDate),
        offeringShares: asOfferingShares(activity.offeringShares, offeringIdsOf(activity)),
        resources: (Array.isArray(activity.resources) ? activity.resources : [])
            // (Units are whole numbers. A row still waiting for its resource is kept: its id is "".)
            .map(entry => ({ id: asText(asObject(entry).id), units: asText(asObject(entry).units).replace(/\D/g, "").slice(0, 6) }))
            .filter((entry, at, all) => entry.id === "" || all.findIndex(other => other.id === entry.id) === at),
        performerPeople: Object.fromEntries(Object.entries(asObject(activity.performerPeople))
            .map(([id, people]) => [id, asText(people).replace(/\D/g, "").slice(0, 4)])
            .filter(([, people]) => people !== ""))
    };

}

export function asBusinessPartner(
    entry: unknown,
    fallbackCategory: string,
    context: {
        legacy?: boolean;
        scope?: "infrastructure" | "offering";
        /** The names of the categories the user made, by id (an earlier answer's). */
        categoryNames?: ReadonlyMap<string, string>;
    } = {}
): BusinessPartnerValue {

    const partner = asObject(entry);

    const scope = context.scope ?? "infrastructure";
    const rawCategory = asText(partner.category) || fallbackCategory;
    const description = asText(partner.description);

    let category = rawCategory;
    let group = asText(partner.group);
    let earlierCategory = "";

    if (context.legacy) {
        /* Partners and Suppliers are both Suppliers now (see the F1 mapping): the old Partners in the group that holds advisers and services, the
           old Providers and the categories the user made with no group yet -- the name of such a category goes into the description. */
        if (rawCategory === "partners") {
            category = "suppliers";
            group = LEGACY_PARTNER_GROUP[scope];
        } else if (rawCategory === "providers") {
            category = "suppliers";
            group = "";
        } else if (rawCategory !== UNASSIGNED_CATEGORY) {
            category = "suppliers";
            group = "";
            earlierCategory = context.categoryNames?.get(rawCategory)?.trim() ?? "";
        }
    }

    // (Providers is Suppliers: a list's default category from before the types were Partners and Suppliers.)
    if (category === "providers") {
        category = "suppliers";
    }

    /* A group is one of the type's in this place. */
    if (!(PARTNER_CATEGORIES as readonly { id: string }[]).some(entry => entry.id === category)) {
        group = "";
    } else if (!BUSINESS_PARTNER_GROUPS[scope][category as "partners" | "suppliers"].some(entry => entry.id === group)) {
        group = "";
    }

    const read = asBusinessCost(partner.cost);
    const { cost, was: earlierFrequency } = withoutOtherFrequency(read);

    return {
        id: asText(partner.id) || randomId("partner"),
        category,
        group,
        rateOverride: businessDecimalText(asText(partner.rateOverride)),
        costOption: validCostOption(scope, group, asText(partner.costOption)),
        quantity: businessDecimalText(asText(partner.quantity)),
        extras: asBusinessExtras(partner.extras),
        paymentPlan: asPaymentPlan(partner.paymentPlan),
        offeringShares: asOfferingShares(partner.offeringShares, offeringIdsOf(partner)),
        madeBy: asText(partner.madeBy),
        startDate: isoDateText(partner.startDate),
        endDate: isoDateText(partner.endDate),
        name: asText(partner.name),
        description: withEarlier(withEarlier(description, "frequency", earlierFrequency), "category", earlierCategory),
        responsibleId: asText(partner.responsibleId),
        ...(partner.responsibleOff === true ? { responsibleOff: true } : {}),
        cost: normalCostOf(cost, scope, group),
        offeringIds: offeringIdsOf(partner)
    };

}

export function asBusinessPartnerList(
    value: unknown,
    fallbackCategory: string,
    context: Parameters<typeof asBusinessPartner>[2] = {}
): BusinessPartnerValue[] {
    return (Array.isArray(value) ? value : []).map(entry => asBusinessPartner(entry, fallbackCategory, context));
}

export function asBusinessCategoryList(value: unknown): BusinessCategoryValue[] {
    return (Array.isArray(value) ? value : []).map(entry => {
        const category = asObject(entry);
        return { id: asText(category.id) || randomId("category"), name: asText(category.name) };
    });
}

/**
 * The stored answer in the shape the editor expects.
 *
 * Nothing is invented for an empty page except the three seeded
 * professionals, which the specification asks for by name -- and
 * those are seeded ONCE, by the editor when it first writes, not
 * here. A reader that supplied them would put them back every time
 * a founder deleted one.
 */
export function asBusinessCapabilityValue(value: unknown): BusinessCapabilityValue {

    const source = asObject(value);

    /* An answer saved before the nine categories has no format version: its cards are moved ONCE to the current categories, groups, statuses and
       frequencies (the mapping agreed as F1), and the value is written back carrying the version. A card that fits nowhere is put in "No category" /
       "No group" with what it was written into its description. */
    const legacy = !(typeof source.formatVersion === "number" && source.formatVersion >= BUSINESS_CAPABILITY_FORMAT_VERSION);

    const resources: Record<string, BusinessResourceSubsectionValue[]> = {};

    for (const [category, entries] of Object.entries(asObject(source.resources))) {

        const merged = new Map<string, BusinessResourceSubsectionValue>();

        for (const entry of Array.isArray(entries) ? entries : []) {

            const subsection = asObject(entry);
            const rawId = asText(subsection.id);

            if (rawId.length === 0) {
                continue;
            }

            const target = legacy ? LEGACY_KIND_GROUP[rawId] : undefined;
            const kept = target !== undefined && target[0] === category ? target[1] : "";
            const fixed = BUSINESS_RESOURCE_GROUPS.find(entry => entry.id === category)?.kinds.some(kind => kind.id === rawId) ?? false;
            // A kind the user made, or one no longer there: its cards are in the category's "No group" -- or, where the category has just the one group, in it.
            const made = legacy && kept === "" && !fixed && rawId !== UNASSIGNED_CATEGORY;
            const only = soleGroupOf(BUSINESS_RESOURCE_GROUPS.find(entry => entry.id === category)?.kinds);
            const id = kept ? kept : made || rawId === UNASSIGNED_CATEGORY ? only || UNASSIGNED_CATEGORY : rawId;
            const named = asText(subsection.name).trim();

            const slots = (Array.isArray(subsection.slots) ? subsection.slots : [])
                .map(slot => asBusinessResourceSlot(slot, category === WORKSPACE_GROUP_ID, { legacy, groupId: id, place: "infrastructure" }))
                .map(slot => made ? { ...slot, description: withEarlier(slot.description, "group", named || "Other") } : slot);

            const into = merged.get(id);
            if (into) {
                into.slots.push(...slots);
            } else if (!made || slots.length > 0) {
                merged.set(id, { id, name: made ? "" : asText(subsection.name), slots });
            }

        }

        resources[category] = [...merged.values()];

    }

    // An answer saved before the Workspace was a Resources category: its Workspace(s) become cards of it, ids kept.
    if (!resources[WORKSPACE_GROUP_ID] || resources[WORKSPACE_GROUP_ID].every(subsection => subsection.slots.length === 0)) {
        const legacyWorkspace = legacyWorkspaceSlots(source);
        if (legacyWorkspace.length > 0) {
            resources[WORKSPACE_GROUP_ID] = [{ id: PREMISES_GROUP_ID, name: "", slots: legacyWorkspace }];
        }
    }

    // The activity an earlier answer's status MADE (it named the card in its `sourceId`) is now the one the card chooses: the same activity, an ordinary one.
    const madeBy = new Map<string, string>();
    const noteMade = (entry: unknown) => {
        const made = asObject(entry);
        const from = asText(made.sourceId);
        if (from && asText(made.id) && !madeBy.has(from)) {
            madeBy.set(from, asText(made.id));
        }
    };
    (Array.isArray(source.activities) ? source.activities : []).forEach(container => asArrayOf(asObject(container).activities).forEach(noteMade));
    asArrayOf(asObject(source.offering).activities).forEach(noteMade);
    const choosing = <T extends { id: string; status: string; activityId: string }>(slot: T): T =>
        slot.status === "activity" && slot.activityId === "" && madeBy.has(slot.id) ? { ...slot, activityId: madeBy.get(slot.id) ?? "" } : slot;
    for (const [category, subsections] of Object.entries(resources)) {
        resources[category] = subsections.map(subsection => ({ ...subsection, slots: subsection.slots.map(choosing) }));
    }

    // The categories the user made (an earlier answer's) by id: their names, for the note a card carries when its category goes.
    const userActivityNames = new Map<string, string>();
    for (const entry of asBusinessCategoryList(source.activityCategories)) {
        userActivityNames.set(entry.id, entry.name);
    }

    const rawContainers: BusinessActivityCategoryValue[] = (Array.isArray(source.activities) ? source.activities : [])
        .map(entry => {
            const category = asObject(entry);
            const id = asText(category.id);
            if (id.length > 0 && asText(category.name).trim()) {
                userActivityNames.set(id, asText(category.name));
            }
            return {
                id,
                name: asText(category.name),
                activities: (Array.isArray(category.activities) ? category.activities : []).map(activity => ({ ...asBusinessActivity(activity, id), category: id }))
            };
        })
        .filter(category => category.id.length > 0);

    /** The category an earlier answer's activity is filed under now in this place, and the note it carries when that is "No category". */
    const activityFiledUnder = (scope: "infrastructure" | "offering", id: string): { category: string; earlier: string } => {
        if (id === UNASSIGNED_CATEGORY || BUSINESS_ACTIVITY_GROUPS[scope].some(group => group.id === id)) {
            return { category: id, earlier: "" };
        }
        return { category: UNASSIGNED_CATEGORY, earlier: userActivityNames.get(id)?.trim() || LEGACY_ACTIVITY_CATEGORY_LABELS[id] || id };
    };

    let activityContainers = rawContainers;
    if (legacy) {
        // Infrastructure has two groups now (Pre-Operational and Operational): the other categories' activities are in "No category".
        const regrouped = new Map<string, BusinessActivityCategoryValue>();
        for (const container of rawContainers) {
            for (const activity of container.activities) {
                const filed = activityFiledUnder("infrastructure", container.id);
                const into = regrouped.get(filed.category) ?? { id: filed.category, name: "", activities: [] };
                into.activities.push({ ...activity, category: filed.category, description: withEarlier(activity.description, "category", filed.earlier) });
                regrouped.set(filed.category, into);
            }
        }
        activityContainers = [...regrouped.values()];
    }

    // The categories the user made: the stored list, then any named category an old answer kept only as the container of its activities.
    const activityCategories: BusinessCategoryValue[] = legacy ? [] : asBusinessCategoryList(source.activityCategories);
    if (!legacy) {
        for (const container of activityContainers) {
            if (!BUSINESS_ACTIVITY_CATEGORIES.some(entry => entry.id === container.id) && container.name.trim() && !activityCategories.some(entry => entry.id === container.id)) {
                activityCategories.push({ id: container.id, name: container.name });
            }
        }
    }

    const partnerCategoryNames = new Map<string, string>(asBusinessCategoryList(source.partnerCategories).map(entry => [entry.id, entry.name]));
    const partnerContext = (scope: "infrastructure" | "offering") => ({ legacy, scope, categoryNames: partnerCategoryNames });

    const offering = asObject(source.offering);

    const offeringResource = (entry: unknown): BusinessResourceSlotValue => {
        const read = asBusinessResourceSlot(entry, false, { legacy, groupId: asText(asObject(entry).group), place: "offering" });
        const category = BUSINESS_OFFERING_RESOURCE_GROUPS.some(group => group.id === read.category) ? read.category : "";
        const groups = offeringGroupsOf(category);
        return { ...read, category, group: groups.some(group => group.id === read.group) ? read.group : soleGroupOf(groups) };
    };

    return withDepositsOnLandlords({

        formatVersion: BUSINESS_CAPABILITY_FORMAT_VERSION,

        /* One founder card from the start, like Page 1's one
           Segment and Page 2's one channel: an organisation has at
           least one founder, every Responsibility on this page
           names one, and a section showing nothing but an Add
           button reads as missing rather than as empty.

           Its id is fixed rather than drawn, for the reason
           seededProfessionals gives: this runs while the page is
           being drawn. */
        founders: source.founders === undefined
            ? [{ ...createBusinessFounder(), id: "founder-1" }]
            : (Array.isArray(source.founders) ? source.founders : [])
            .map(entry => {

                const founder = asObject(entry);

                return {
                    id: asText(founder.id) || randomId("founder"),
                    name: asText(founder.name),
                    /* A list now; one line of text before. What
                       was typed into the single box is kept, as
                       the first role, rather than dropped. */
                    roles: typeof founder.roles === "string"
                        ? [founder.roles]
                        : businessNeedList(founder.roles, 1),
                    ...founderSalaryAndPeriod(founder),
                    hours: businessDecimalText(asText(founder.hours)),
                    deliveryHours: businessDecimalText(asText(founder.deliveryHours)),
                    deliveryShare: businessDecimalText(asText(founder.deliveryShare)),
                    startDate: isoDateText(founder.startDate),
                    extras: asBusinessExtras(founder.extras)
                };

            }),

        resources,

        // (An Infrastructure activity's category IS the one it is filed in.)
        activities: activityContainers,

        activityCategories,

        professionals: source.professionals === undefined
            ? seededProfessionals()
            : asBusinessPartnerList(source.professionals, "partners", partnerContext("infrastructure")),

        providers: asBusinessPartnerList(source.providers, "providers", partnerContext("infrastructure")),

        partnerCategories: legacy ? [] : asBusinessCategoryList(source.partnerCategories),

        offering: {
            resources: (Array.isArray(offering.resources) ? offering.resources : []).map(offeringResource).map(choosing),
            // (An Offering activity carries its category: the one it was saved with, else Production.)
            activities: (Array.isArray(offering.activities) ? offering.activities : [])
                .map(entry => {
                    const read = asBusinessActivity(entry, DERIVED_ACTIVITY_CATEGORY.offering);
                    const known = read.category === UNASSIGNED_CATEGORY
                        || activityGroupsOf("offering").some(category => category.id === read.category)
                        || (legacy && read.category in LEGACY_ACTIVITY_CATEGORY_LABELS)
                        || activityCategories.some(category => category.id === read.category);
                    const category = known ? read.category : DERIVED_ACTIVITY_CATEGORY.offering;
                    const filed = legacy ? activityFiledUnder("offering", category) : { category, earlier: "" };
                    return { ...read, category: filed.category, description: withEarlier(read.description, "category", filed.earlier) };
                }),
            professionals: asBusinessPartnerList(offering.professionals, "partners", partnerContext("offering")),
            providers: asBusinessPartnerList(offering.providers, "providers", partnerContext("offering"))
        },

        delivery: asDeliveryMap(source.delivery)

    });

}

/**
 * A Deposit is the landlord's extra (it sits on the supplier card that holds the rent). The deposit an earlier answer kept on a rented Premises card moves to
 * its supplier, unless the supplier already has one; one on a card with no supplier stays where it was.
 */
export function withDepositsOnLandlords(value: BusinessCapabilityValue): BusinessCapabilityValue {
    const spaces = Object.values(value.resources).flat().flatMap(subsection => subsection.slots).filter(slot => slot.deposit !== "" && slot.status === "rent" && slot.providerId !== "");
    if (spaces.length === 0) {
        return value;
    }
    const lists = [value.providers, value.professionals, value.offering.providers, value.offering.professionals].flat();
    const movable = spaces.filter(slot => lists.some(partner => partner.id === slot.providerId));
    if (movable.length === 0) {
        return value;
    }
    const given = new Map<string, string>();
    const moved = new Set<string>();
    for (const slot of movable) {
        const partner = lists.find(entry => entry.id === slot.providerId);
        if (partner && (partner.extras.deposit ?? "") === "" && !given.has(partner.id)) {
            given.set(partner.id, slot.deposit);
            moved.add(slot.id);
        }
    }
    const give = (partner: BusinessPartnerValue): BusinessPartnerValue => given.has(partner.id) ? { ...partner, extras: { ...partner.extras, deposit: given.get(partner.id) } } : partner;
    return {
        ...value,
        resources: Object.fromEntries(Object.entries(value.resources).map(([category, subsections]) => [
            category,
            subsections.map(subsection => ({ ...subsection, slots: subsection.slots.map(slot => moved.has(slot.id) ? { ...slot, deposit: "" } : slot) }))
        ])),
        professionals: value.professionals.map(give),
        providers: value.providers.map(give),
        offering: { ...value.offering, professionals: value.offering.professionals.map(give), providers: value.offering.providers.map(give) }
    };
}

/** Every activity on the page, whichever section or category it is
 *  filed under -- for the lookups that do not care. */
export function businessAllActivities(
    capability: BusinessCapabilityValue
): BusinessActivityValue[] {
    return [
        ...capability.activities.flatMap(category => category.activities),
        ...capability.offering.activities
    ];
}

/**
 * What one founder is responsible for: the name of every activity
 * assigned to them, in page order, and whether it is completed.
 *
 * "This list is developed automatically" -- so it is derived here
 * and shown read-only under the founder, never typed. An activity
 * names its responsible founder; the founder does not name their
 * activities, or the same fact would be recorded twice and be free
 * to disagree with itself.
 */
/** One thing a founder is responsible for: where it stands (Infrastructure, Offering, the Legal Entity) and what it is. */
export interface FounderResponsibility {
    id: string;
    name: string;
    completed: boolean;
    scope: "infrastructure" | "offering" | "legal";
    kind: "activity" | "partner" | "supplier" | "legal";
}

export function businessFounderResponsibilities(
    capability: BusinessCapabilityValue,
    founderId: string,
    /** The Legal Entity's expenses: an expense names the founder responsible for it. */
    legalExpenses: readonly { id: string; name: string; responsibility: string; responsibleOff?: boolean }[] = []
): FounderResponsibility[] {

    if (founderId.length === 0) {
        return [];
    }

    const founderIds = capability.founders.map(founder => founder.id);
    const offeringIds = new Set(capability.offering.activities.map(activity => activity.id));

    const activities = businessAllActivities(capability)
        .filter(activity =>
            businessResponsibleId(activity, founderIds) === founderId &&
            activity.name.trim().length > 0
        )
        .map(activity => ({
            id: activity.id,
            name: activity.name.trim(),
            completed: activity.completed,
            scope: offeringIds.has(activity.id) ? "offering" as const : "infrastructure" as const,
            kind: "activity" as const
        }));

    const partners = (list: readonly BusinessPartnerValue[], scope: "infrastructure" | "offering", kind: "partner" | "supplier") => list
        .filter(partner => businessPartnerResponsibleId(partner, founderIds) === founderId && partner.name.trim().length > 0)
        .map(partner => ({ id: partner.id, name: partner.name.trim(), completed: false, scope, kind }));

    const legal = legalExpenses
        .filter(expense => expense.responsibleOff !== true && expense.responsibility === founderId && expense.name.trim().length > 0)
        .map(expense => ({ id: expense.id, name: expense.name.trim(), completed: false, scope: "legal" as const, kind: "legal" as const }));

    return [
        ...activities,
        ...partners(capability.professionals, "infrastructure", "partner"),
        ...partners(capability.providers, "infrastructure", "supplier"),
        ...partners(capability.offering.professionals, "offering", "partner"),
        ...partners(capability.offering.providers, "offering", "supplier"),
        ...legal
    ];

}

/**
 * How long a founder's Responsibilities list can be and still start
 * open. A longer one starts folded, behind its "Completed n/m"
 * count, so the founder card stays a card rather than a list.
 */
export const RESPONSIBILITIES_OPEN_UP_TO = 5;

/** A founder's Responsibilities, counted: how many are done of how many, and whether the list starts open. */
export function businessResponsibilitiesTally(
    responsibilities: readonly { completed: boolean }[]
): { completed: number; total: number; startsOpen: boolean } {
    return {
        completed: responsibilities.filter(entry => entry.completed).length,
        total: responsibilities.length,
        startsOpen: responsibilities.length <= RESPONSIBILITIES_OPEN_UP_TO
    };
}

/**
 * The Responsible tick was turned off on this card (activity, partner /
 * provider or strategy objective): it has no responsible by choice. The
 * default -- the key absent -- is ticked, so everything stored before the
 * tick existed is unchanged. An unticked card is neither flagged as
 * missing a responsible nor given the sole founder by the rule: the rules
 * of businessAutoResponsibleId apply only while the tick is on.
 */
export function responsibleIsOff(card: { responsibleOff?: boolean }): boolean {
    return card.responsibleOff === true;
}

/**
 * The founder responsible BY RULE, or "" where it is a choice.
 *
 * 1. A one-person organisation: its only founder is responsible for
 *    everything, since there is nobody else it could be.
 * 2. An activity whose Performers include exactly one founder (with
 *    or without partners and providers beside them): that founder is
 *    responsible for it too, and it follows the Performers -- change
 *    them so a different single founder remains, and so does this.
 *    With two or more founders among them somebody has to be chosen
 *    (the choice, kept in responsibleId, is never overridden); with
 *    none it is left empty for Review to list.
 *
 * `performerIds` is omitted for what has no performer -- a partner,
 * where only the first rule applies.
 */
export function businessAutoResponsibleId(
    founderIds: readonly string[],
    performerIds?: readonly string[]
): string {

    if (founderIds.length === 1) {
        return founderIds[0];
    }

    const founders = [...new Set(
        (performerIds ?? []).filter(id => id.length > 0 && founderIds.includes(id))
    )];

    if (founders.length === 1) {
        return founders[0];
    }

    return "";

}

/**
 * Who is responsible for a Partnership / Provider: the founder chosen on its
 * card; and, where the organisation has exactly ONE founder, that founder
 * while nothing (or nobody who is still a founder) is chosen -- he is
 * responsible automatically (businessAutoResponsibleId's first rule). Derived
 * from what is stored, never written back: a choice is never overridden, and
 * with several founders, or none, it is what was chosen ("" until then).
 */
export function businessPartnerResponsibleId(
    partner: { responsibleId: string; responsibleOff?: boolean },
    founderIds: readonly string[]
): string {
    if (responsibleIsOff(partner)) {
        return "";
    }
    if (partner.responsibleId.length > 0 && founderIds.includes(partner.responsibleId)) {
        return partner.responsibleId;
    }
    return businessAutoResponsibleId(founderIds) || partner.responsibleId;
}

/**
 * Who is responsible for a Strategy Objective: the founder chosen on its card;
 * and, where the organisation has exactly ONE founder (who has no Responsible
 * field to choose in), that founder while nothing (or nobody who is still a
 * founder) is chosen. Derived from what is stored, never written back.
 */
export function strategyObjectiveOwnerId(
    objective: { ownerId: string; responsibleOff?: boolean },
    founderIds: readonly string[]
): string {
    return businessPartnerResponsibleId(
        { responsibleId: objective.ownerId, responsibleOff: objective.responsibleOff },
        founderIds
    );
}

/** Who is responsible for an activity: by rule, or as chosen. */
export function businessResponsibleId(
    activity: BusinessActivityValue,
    founderIds: readonly string[]
): string {
    if (responsibleIsOff(activity)) {
        return "";
    }
    return businessAutoResponsibleId(founderIds, activity.performerIds) ||
        activity.responsibleId;
}

/**
 * The page's founders, taken from the Identity System's Legal
 * Entity -- 2. Founders & Ownership -- where they are answered.
 *
 * Each named Legal Entity founder becomes one founder here, under
 * that founder's own id, so every Responsibility on this page points
 * at the same person the Legal Entity does and follows a rename
 * there. The name is the Legal Entity's and the Roles are the
 * Founders Profile's (see founderProfiles -- `profile` is that page's
 * saved value); the Salary asked on this page is kept, found by id or, for founders recorded here
 * before this link existed, by name -- and anything that named such
 * a founder by the old id is moved onto the new one.
 *
 * Returns the value unchanged while the Legal Entity names nobody,
 * so what was recorded here is not wiped by an unanswered page.
 */
export function withLegalEntityFounders(
    capability: BusinessCapabilityValue,
    legalFounders: readonly LegalEntityFounderValue[],
    profile?: unknown
): BusinessCapabilityValue {

    const named = legalFounders.filter(founder => founder.name.trim().length > 0);

    if (named.length === 0) {
        return capability;
    }

    const key = (name: string) => name.trim().toLocaleLowerCase();

    /** Old id -> Legal Entity id, for founders matched by name. */
    const moved = new Map<string, string>();

    const taken = new Set<string>();

    const founders = named.map(legal => {

        const match =
            capability.founders.find(
                founder => founder.id === legal.id && !taken.has(founder.id)
            ) ??
            capability.founders.find(
                founder => !taken.has(founder.id) &&
                    key(founder.name) === key(legal.name)
            );

        if (match) {
            taken.add(match.id);
            if (match.id !== legal.id) {
                moved.set(match.id, legal.id);
            }
        }

        return {
            id: legal.id,
            name: legal.name,
            // The Founders Profile's roles, as answered there.
            roles: founderProfileOf(legal, profile).roles.filter(role => role.trim().length > 0),
            salary: match?.salary ?? "",
            hours: match?.hours ?? "",
            deliveryHours: match?.deliveryHours ?? "",
            period: match?.period ?? "",
            deliveryShare: match?.deliveryShare ?? "",
            startDate: match?.startDate ?? "",
            extras: match?.extras ?? {}
        };

    });

    const remap = (id: string) => moved.get(id) ?? id;

    const activity = (entry: BusinessActivityValue): BusinessActivityValue => ({
        ...entry,
        performerIds: entry.performerIds.map(remap),
        responsibleId: remap(entry.responsibleId)
    });

    const partner = (entry: BusinessPartnerValue): BusinessPartnerValue => ({
        ...entry,
        responsibleId: remap(entry.responsibleId)
    });

    if (moved.size === 0) {
        return { ...capability, founders };
    }

    return {
        ...capability,
        founders,
        activities: capability.activities.map(category => ({
            ...category,
            activities: category.activities.map(activity)
        })),
        professionals: capability.professionals.map(partner),
        providers: capability.providers.map(partner),
        offering: {
            ...capability.offering,
            activities: capability.offering.activities.map(activity),
            professionals: capability.offering.professionals.map(partner),
            providers: capability.offering.providers.map(partner)
        }
    };

}

/**
 * Which of this page's two sections are still empty, in page order.
 *
 * What counts as answered:
 *
 * 1. A named founder. Everything else about the organisation's
 *    infrastructure is recorded by somebody, and the founders are
 *    who that is.
 * 2. A named resource, activity or partner linked to an Offering.
 *    The link is the point of the section -- an unlinked row
 *    belongs in Infrastructure.
 */
export function businessCapabilitySectionsEmpty(value: unknown): boolean[] {

    const capability = asBusinessCapabilityValue(value);

    const infrastructureEmpty = !capability.founders.some(
        founder => founder.name.trim().length > 0
    );

    const named = (entry: { name: string; offeringIds: string[] }) =>
        entry.name.trim().length > 0 && entry.offeringIds.length > 0;

    const offeringEmpty = !(
        capability.offering.resources.some(named) ||
        capability.offering.activities.some(named) ||
        capability.offering.professionals.some(named) ||
        capability.offering.providers.some(named)
    );

    return [infrastructureEmpty, offeringEmpty];

}

export const BUSINESS_CAPABILITY_SECTIONS = [
    "Infrastructure",
    "Offering's Capability"
] as const;
