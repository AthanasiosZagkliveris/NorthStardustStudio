/**
 * Split out of AnswerBusinessCapability.ts (2026-11-11, the folder report's item 6); that file re-exports what is exported here.
 */
import { type DeliveryValue, type FounderPeriod } from "../DemandCapacity.ts";

export interface BusinessResourceKind { id: string; label: string; help: string }

/**
 * A resource linked to an activity: the card, and the number of units of it the activity uses when the card has units (a Per unit price: 3 hours, 40 km).
 */
export interface BusinessActivityResource {
    id: string;
    units: string;
}

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

/** What a landlord or leasing supplier's card is connected to: the rented spaces and vehicles that name it. */
export interface SupplierConnections {
    space: boolean;
    workshop: boolean;
    vehicle: boolean;
}

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
