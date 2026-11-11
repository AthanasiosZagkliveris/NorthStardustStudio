/**
 * THE BUSINESS SYSTEM, INFRASTRUCTURE AND CAPABILITY (page 3): resources, activities, partners, costs and responsibilities.
 * Split out of AnswerUtils.ts (still importable from there).
 */
import { parseAmount } from "./Amounts.ts";
import { asObject, asText, randomId } from "./Readers.ts";
import { type FounderPeriod, asDeliveryMap, asFounderPeriod, asHoursPeriod } from "./DemandCapacity.ts";
import { todayIsoDate } from "./AnswerProcess.ts";
import { businessNeedList } from "./AnswerBusinessFoundation.ts";
import { LegalEntityFounderValue } from "./AnswerLegal.ts";
import { founderProfileOf } from "./AnswerFounders.ts";
import { type BusinessCapabilityValue, type BusinessActivityValue, type BusinessResourceSlotValue, type BusinessExtrasValue, type BusinessExtraKey, BUSINESS_EXTRAS, type BusinessCostValue, type BusinessCategoryValue, type BusinessPartnerValue, type BusinessActivityCategoryValue, type BusinessResourceSubsectionValue, type BusinessFounderValue, type BusinessWorkspaceValue, type SupplierConnections, type BusinessResourceKind } from "./capability/types.ts";
import { asPaymentPlan, isoDateText, businessDecimalText, emptyPaymentPlan } from "./capability/paymentPlans.ts";
import { offeringGroupsOf, BUSINESS_OFFERING_RESOURCE_GROUPS, normalCostOf, validCostOption } from "./capability/costOptions.ts";
import { BUSINESS_ACTIVITY_CATEGORIES, BUSINESS_ACTIVITY_GROUPS, UNASSIGNED_CATEGORY, DERIVED_ACTIVITY_CATEGORY, activityGroupsOf, BUSINESS_PREOPERATIONAL_TYPES } from "./capability/activityGroups.ts";
import { PARTNER_CATEGORIES, LEGACY_PARTNER_GROUP, BUSINESS_PARTNER_GROUPS } from "./capability/partnerGroups.ts";
import { asOfferingShares } from "./capability/offeringShares.ts";
export { asOfferingShares, OFFERING_UNITS_KEY, equalOfferingShares, offeringFractions, offeringSharesInUnits, offeringSharesIncomplete, offeringSharesTotal, unitOfferingShares } from "./capability/offeringShares.ts";
export { businessResponsibleId, businessAutoResponsibleId, responsibleIsOff, strategyObjectiveOwnerId, businessPartnerResponsibleId, businessResponsibilitiesTally, RESPONSIBILITIES_OPEN_UP_TO, businessFounderResponsibilities, businessAllActivities } from "./capability/responsibilities.ts";
export { partnerKindOf, partnerNoun, partnerCategoryLabel, PARTNER_CATEGORIES, LEGACY_PARTNER_GROUP, partnerGroupHelp, BUSINESS_PARTNER_GROUPS, groupHelpPoints, groupHelpLines, FOUNDERS_OWNERS_HELP } from "./capability/partnerGroups.ts";
export { activityCategoryLabel, BUSINESS_ACTIVITY_CATEGORIES, BUSINESS_ACTIVITY_GROUPS, UNASSIGNED_CATEGORY, DERIVED_ACTIVITY_CATEGORY, BUSINESS_DERIVED_ACTIVITY_CATEGORY, activityGroupsOf, BUSINESS_PREOPERATIONAL_TYPES } from "./capability/activityGroups.ts";
export { offeringGroupsOf, BUSINESS_OFFERING_RESOURCE_GROUPS, normalCostOf, soleUnitOf, unitsOf, GROUP_UNITS, frequencyIdsOf, BUSINESS_COST_FREQUENCIES, GROUP_FREQUENCIES, validCostOption, costOptionOf, costOptionsOf, COST_OPTIONS, INSURANCE_OPTIONS, costWithOption, optionFrequenciesOf, billingOf, BILLING_TYPES } from "./capability/costOptions.ts";
export { cappedUnits, unitsCap, resourcesStartingTooLate, activityLastDay, activityDateIssues, activityPeriod, PAYMENT_DAY, timeToIso, isoToTime, paymentPlanIncomplete, paymentPlanLines, instalmentLines, equalPercents, paymentPlanTotal, asPaymentPlan, isoDateText, businessDecimalText, BUSINESS_PAYMENT_PLANS, emptyPaymentPlan } from "./capability/paymentPlans.ts";
export { type FounderResponsibility, type BusinessCapabilityValue, type BusinessActivityValue, type BusinessActivityResource, type BusinessResourceSlotValue, type BusinessStatusRow, type BusinessPaymentPlan, type BusinessPaymentLine, type BusinessExtrasValue, type BusinessExtraKey, BUSINESS_EXTRAS, type BusinessCostValue, type BusinessCategoryValue, type BusinessPartnerValue, type BusinessActivityCategoryValue, type BusinessResourceSubsectionValue, type BusinessFounderValue, type BusinessWorkspaceValue, type BusinessCostOption, type BillingType, type SupplierConnections, type BusinessResourceKind } from "./capability/types.ts";

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
        explanation: "It is already available to the organisation at no additional cost."
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

/**
 * The Offering's categories and the partner group that serve a physical item only (doc 28, 11.7): Delivery Vehicles and Delivery Running Costs (Vehicles), Materials & Stock
 * (Materials & Inventory) and Logistics & Fulfilment. While no Offering on Page 1 has a physical item (noPhysicalOffering), Page 3 hides each of them that holds no card: hidden,
 * never deleted, and shown again when an Offering's Type or form (O1) changes.
 */
export const PHYSICAL_RESOURCE_CATEGORY_IDS: readonly string[] = ["vehicles", "materials"];
export const PHYSICAL_PARTNER_GROUP_IDS: readonly string[] = ["logistics-fulfilment"];

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

/** Digits and at most one ".": what a Quantity, Price or Salary holds. */
export const BUSINESS_PLAIN_NUMBER = /^(\d+\.?\d*|\.\d+)$/;

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

/** The statuses a row added with the "+" can have. */
export const BUSINESS_EXTRA_STATUS_IDS = ["partners-suppliers", "activity"] as const;

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
