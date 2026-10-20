import { BUSINESS_ACTIVITY_CATEGORIES, DERIVED_ACTIVITY_CATEGORY, BUSINESS_RESOURCE_GROUPS, frequencyIdsOf, unitsOf, BusinessActivityValue, BusinessCapabilityValue, BusinessCostValue, BusinessPartnerValue, BusinessResourceSlotValue, createBusinessActivity, createBusinessPartner, createBusinessResourceSlot } from "../../../framework/engine/AnswerUtils.ts";
import { DeliveryValue } from "../../../framework/engine/DemandCapacity.ts";
import { parseDecimal } from "../../../framework/engine/Amounts.ts";
import { SOURCES } from "../../../framework/engine/Sources.ts";
import { InfoPoint } from "../fields/InfoNote.tsx";

/** The pure part of the Business Capability page (page 3): its texts, constants and the functions that change its answer; the editor (BusinessCapabilityEditor.tsx) draws it. */

/**
 * The guidance and help this page carries.
 *
 * Every explanation behind an "i" is the specification's own
 * (docs/specifications/business-system/page-3-infrastructure-and-capability.md);
 * the guidance above the process line is this page's, as every
 * page writes its own.
 */
/** The last choice of an Activity status's list: it makes a new activity (named in the box that appears). */
export const ADD_ACTIVITY = "+ Add";

export const SECTIONS = {

    infrastructure: {
        instructions: [
            "Record the resources, activities, partners and suppliers the organization needs to establish, operate and deliver.",
            "Mark what each resource needs: it already exists, it is rented or bought, it comes from a partner or a supplier, it needs work, it needs looking into, or it costs money.",
            "Give every activity one person who is responsible for it."
        ],
        note: [
            "Existing or planned resources, activities, partners and suppliers the organization needs to establish, operate, and deliver."
        ],
        resources: ["Physical and digital resources the organization needs to operate."],
        workspace: ["Where the organization's work is carried out."],
        responsibilities: ["This list is developed automatically."],
        activities: [
            "Add activities directly or create them from resources marked Needs Investigation or Needs Activity.",
            "Activities do not record costs directly. Any resulting cost is recorded under the relevant Resource, Partner or Supplier.",
            "Assign one responsible person to each activity."
        ],
        partnerships: [
            "Add Partners & Suppliers directly or create them from Resources or Activities."
        ],
        professionals: [
            "People or firms engaged for work the founders cannot or should not do."
        ],
        providers: [
            "Businesses or services that supply the organization with resources."
        ],
        responsibility: [
            "Who is responsible for making contact and coordinating, and for ensuring the required work or process is completed."
        ]
    },

    offering: {
        instructions: [
            "Record what each Offering needs on top of the organization's own infrastructure, and link it to that Offering.",
            "Identify opportunities to eliminate, share, obtain for free, or source them at the best value.",
            "Use the results to compare offering options and make better decisions."
        ],
        note: [
            "What each Offering needs on top of the organization's own infrastructure: its resources, activities, partners and suppliers, and how it is delivered."
        ]
    }
};

/**
 * What the capacity fields say behind their "i": the founders' hours
 * on each Founder card, and 4. Delivery under Offering's Capability.
 */
export const DELIVERY_HELP = {
    section: [
        "How each Offering is delivered: the hours one unit takes, how long it takes, and who delivers it.",
        "Every Offering has its card here. Leave a card empty if it does not apply."
    ],
    hours: ["Working hours available: about 40 a week (about 173 a month) full-time, fewer while employed elsewhere."],
    deliveryHours: ["Of those, the hours you can give to delivering Offerings. Selling, admin, learning and holidays take the rest, often 30 to 50% for a founder."],
    period: ["The period of the salary and of both hours: a week, a month or a year, whichever you know. Every calculation turns them into a month: a week's at 52 ÷ 12 ≈ 4.33 weeks a month (40 h a week is about 173 h a month), a year's divided by 12."],
    mode: [
        { title: "Per unit", text: "Done once for each unit sold (a project, a product, a session), over its Calendar Time in weeks." },
        { title: "Every month", text: "Ongoing work for each active client every month (a retainer, a subscription). It has no Calendar Time, and it uses founders' hours first." },
        "Match how customers buy under Demand & Conversion on Customer Engagement: an Offering bought every month is delivered every month."
    ],
    recurring: ["A subscription or retainer is served every period. Give each client's hours a week or a month; weekly hours become monthly at about 4.33 weeks a month."],
    share: ["The share of working hours spent delivering Offerings, as recorded before delivery hours were asked for. Enter Delivery Hours instead to replace it."],
    effort: [
        "The working hours one unit of this Offering takes, by each person who works on it.",
        "Founders' hours count against their capacity. External hours are delivered, and paid for, outside it: their cost is recorded with the professional.",
        "To share the work with a partner, add one under 3. Partners & Suppliers and link it to this Offering."
    ],
    capacity: [
        "The budgets below compare this with the hours each Offering's expected sales need.",
        "Recurring work (subscriptions, retainers) uses founders' hours first; what remains is flexible capacity for the other Offerings."
    ],
    expected: ["The expected sales are the Offering's, from Demand & Conversion on Customer Engagement."],
    unit: [
        "One unit is one sale: one project, one product, one session.",
        "For a recurring Offering (a subscription or retainer), one unit is each client, each month: the hours one active client takes a month."
    ],
    duration: ["From start to finish, including waiting for the client: approvals, access, feedback. Not working time: it is not added to the hours, and only sets the pace (hours a week) and how many run at once."],
    constraints: ["Limits such as equipment, availability or lead times."]
};

/** A founder's Frequency: the period of the salary and the hours. */
export const FOUNDER_FREQUENCIES = [
    { id: "week", label: "Weekly" },
    { id: "month", label: "Monthly" },
    { id: "year", label: "Annually" }
] as const;

/** The weekly-to-monthly hours conversion, its "i" beside "a month". */
export const HOURS_PER_MONTH_HELP: InfoPoint[] = [
    { title: "Formula", text: "Monthly hours = Weekly hours × 52 ÷ 12" },
    "A year has 52 weeks and 12 months, so an average month has about 4.33 weeks.",
    { title: "Source", source: SOURCES.weeksToMonths }
];


/** Hours as the capacity lines give them: whole, or to one decimal. */
export function formatHours(hours: number): string {
    return hours.toLocaleString("en-GB", { maximumFractionDigits: hours < 10 ? 1 : 0 });
}

/**
 * A number of hours as typed; null when there is none. Read as the
 * engine reads it (see DemandCapacity.ts), so "12,5" saved before the
 * box took only digits is 12.5 here too.
 */
export function readHours(text: string | undefined): number | null {
    return parseDecimal(text ?? "");
}

/** Whether a Delivery holds nothing typed, and need not be stored. */
export function deliveryIsEmpty(delivery: DeliveryValue): boolean {
    return Object.keys(delivery.hours).length === 0 &&
        delivery.effort.trim() === "" &&
        delivery.duration.trim() === "" &&
        delivery.constraints.trim() === "";
}


/** Which activity categories the page opens with, by id. */
export const FIXED_ACTIVITY_IDS: ReadonlySet<string> =
    new Set(BUSINESS_ACTIVITY_CATEGORIES.map(category => category.id));

/**
 * 2. Activities: making and running the thing, then selling it,
 * numbered 1 to 4 and drawn as four tiles, two by two. A category the
 * founder added earlier is drawn as a tile after them while it holds
 * activities.
 */
export const ACTIVITY_CATEGORY_ORDER: readonly string[] =
    ["pre-operational", "operational"];

/** The two sections of this page, as the value stores them. */
export type Scope = "infrastructure" | "offering";

/**
 * A NEW ACTIVITY, made with "Other…" under a card's Activity status: filed in its place's first category (Operational in Infrastructure, Production in the
 * Offering), starting when the card does, for the card's Offerings -- and, with exactly one named founder, theirs (its Performer and Responsible). With
 * several founders it is left to be assigned (the Review page lists it until then).
 */
export function newActivityFor(scope: Scope, startDate: string, offeringIds: readonly string[], founderIds: readonly string[] = [], madeBy = ""): BusinessActivityValue {
    const soleFounder = founderIds.length === 1 ? founderIds[0] : "";
    return {
        ...createBusinessActivity(DERIVED_ACTIVITY_CATEGORY[scope]),
        madeBy,
        startDate,
        offeringIds: scope === "offering" ? [...offeringIds] : [],
        ...(soleFounder ? { performerIds: [soleFounder], responsibleId: soleFounder } : {})
    };
}

/** The day a card starts (a resource, an activity), "" where it is not found: what a card MADE from it starts on. */
/** A card that changes its category or its group starts its Frequency again: "Select" (empty), or the one frequency its new group offers (nothing is chosen where nothing is to choose). Its unit and a named "other" frequency go with it; the price stays. */
export function costInGroup(cost: BusinessCostValue, place: Scope, groupId: string): BusinessCostValue {
    const offered = groupId && groupId !== NO_GROUP ? frequencyIdsOf(place, groupId) : [];
    const sole = offered.length === 1 ? offered[0] : "";
    return { ...cost, frequency: sole, frequencyOther: "", unit: sole === "per-unit" ? (unitsOf(place, groupId)[0] ?? "unit") : "" };
}

export function startOfCard(capability: BusinessCapabilityValue, id: string): string {
    const slots = [...Object.values(capability.resources).flatMap(subsections => subsections.flatMap(subsection => subsection.slots)), ...capability.offering.resources];
    const activities = [...capability.activities.flatMap(category => category.activities), ...capability.offering.activities];
    return slots.find(slot => slot.id === id)?.startDate ?? activities.find(activity => activity.id === id)?.startDate ?? "";
}

/** The page with an activity added to its place. */
export function withActivity(capability: BusinessCapabilityValue, scope: Scope, activity: BusinessActivityValue): BusinessCapabilityValue {
    if (scope === "offering") {
        return { ...capability, offering: { ...capability.offering, activities: [...capability.offering.activities, activity] } };
    }
    const known = capability.activities.some(category => category.id === activity.category);
    return {
        ...capability,
        activities: known
            ? capability.activities.map(category => category.id === activity.category ? { ...category, activities: [...category.activities, activity] } : category)
            : [...capability.activities, { id: activity.category, name: "", activities: [activity] }]
    };
}

/** The page with one activity patched, wherever it is. */
export function withActivityPatched(capability: BusinessCapabilityValue, id: string, patch: Partial<BusinessActivityValue>): BusinessCapabilityValue {
    const map = (list: BusinessActivityValue[]) => list.map(entry => entry.id === id ? { ...entry, ...patch } : entry);
    return {
        ...capability,
        activities: capability.activities.map(category => ({ ...category, activities: map(category.activities) })),
        offering: { ...capability.offering, activities: map(capability.offering.activities) }
    };
}

/** A slot patched wherever it is filed. */
export function patchSlot(base: BusinessCapabilityValue, id: string, patch: Partial<BusinessResourceSlotValue>): BusinessCapabilityValue {
    const mapSlots = (slots: BusinessResourceSlotValue[]) => slots.map(slot => slot.id === id ? { ...slot, ...patch } : slot);
    return {
        ...base,
        resources: Object.fromEntries(Object.entries(base.resources).map(([group, subsections]) => [
            group,
            subsections.map(subsection => subsection.slots.some(slot => slot.id === id) ? { ...subsection, slots: mapSlots(subsection.slots) } : subsection)
        ])),
        offering: { ...base.offering, resources: mapSlots(base.offering.resources) }
    };
}

/** A slot removed wherever it is filed. */
export function removeSlot(base: BusinessCapabilityValue, id: string): BusinessCapabilityValue {
    const keep = (slots: BusinessResourceSlotValue[]) => slots.filter(slot => slot.id !== id);
    return {
        ...base,
        resources: Object.fromEntries(Object.entries(base.resources).map(([group, subsections]) => [
            group,
            subsections.map(subsection => subsection.slots.some(slot => slot.id === id) ? { ...subsection, slots: keep(subsection.slots) } : subsection)
        ])),
        offering: { ...base.offering, resources: keep(base.offering.resources) }
    };
}

/**
 * The last option of a provider or partner picker: one not listed
 * yet. The ellipsis keeps it apart from a partner somebody named
 * "Other", and says choosing it asks for more.
 */
export const OTHER_PARTNER = "Other…";

/** The id prefix of a Provided resource's provider that is the Workspace ("workspace:dedicated"). */
export const WORKSPACE_PROVIDER = "workspace:";

/** Where a NEW Resource card is filed until the founder chooses its Category (and then its Group): it is incomplete till then. */
export const NO_CATEGORY = "unassigned";
export const NO_GROUP = "unassigned";

/** The groups whose cards carry a warranty (equipment), and the ones with a contract's own rate. */
export const WARRANTY_GROUPS: readonly string[] = ["devices-tools", "production-machinery"];

/** Every fixed subsection id across all four resource groups. */
export const FIXED_KIND_IDS: ReadonlySet<string> = new Set(
    BUSINESS_RESOURCE_GROUPS.flatMap(group => group.kinds.map(kind => kind.id))
);

/**
 * True while a card holds nothing the user wrote: every field as a fresh card's (only its id
 * differs). A card left like this when its box is closed is removed again (CardBoxes).
 */
export function sameAsFresh<T extends { id: string }>(card: T | undefined, fresh: T): boolean {
    return card !== undefined && JSON.stringify({ ...card, id: "" }) === JSON.stringify({ ...fresh, id: "" });
}

// (An Offering card's category and group are where it stands, not something the user wrote.)
export const blankSlot = (slot: BusinessResourceSlotValue | undefined) => sameAsFresh(slot && { ...slot, category: "", group: "" }, createBusinessResourceSlot());
// (Its category is where it stands, not something the user wrote.)
export const blankActivity = (activity: BusinessActivityValue | undefined) => sameAsFresh(activity && { ...activity, category: "" }, createBusinessActivity());
// (A partner's group is where it stands -- the type's one group, filed on its own -- not something the user wrote.)
export const blankPartner = (partner: BusinessPartnerValue | undefined) => sameAsFresh(partner && { ...partner, group: "" }, createBusinessPartner("", partner?.category ?? ""));

/**
 * The subcategory names drawn on TWO LINES, in the list of their tile and as the title of their box: a forced break after a fixed word
 * ("Conditioning" and "& Communication" start the second line). The stored id is the subcategory's; the label is read as it was.
 */
export const SUBCATEGORY_BREAKS: Readonly<Record<string, string>> = {
    "Cooling & Air Conditioning": "Cooling & Air\nConditioning",
    "Online Presence & Communication": "Online Presence\n& Communication"
};

export const withBreak = (label: string): string => SUBCATEGORY_BREAKS[label] ?? label;
