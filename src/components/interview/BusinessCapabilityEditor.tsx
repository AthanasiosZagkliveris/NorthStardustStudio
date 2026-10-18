import { toneHue } from "./CardTile.tsx";
import "../../styles/system-confirmation.css";
import LegalEntityEditor from "./LegalEntityEditor.tsx";
import { orphanedCards, withInheritedOfferings, withoutCards, type GeneratedCard } from "../../framework/engine/GeneratedCards.ts";
import { CSSProperties, Fragment, ReactNode, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import ResponsibilityFilter from "./ResponsibilityFilter.tsx";
import { freshCards } from "./freshCards.ts";
import {
    BUSINESS_ACTIVITY_CATEGORIES,
    activityGroupsOf,
    BUSINESS_CAPABILITY_SECTIONS,
    BUSINESS_COST_FREQUENCIES,
    DERIVED_ACTIVITY_CATEGORY,
    activityCategoryLabel,
    BUSINESS_RESOURCE_GROUPS,
    BUSINESS_OFFERING_RESOURCE_GROUPS,
    offeringGroupsOf,
    soleGroupOf,
    BUSINESS_EXTRA_STATUS_IDS,
    PREMISES_GROUP_ID,
    BUSINESS_PARTNER_GROUPS,
    partnerGroupHelp,
    groupHelpPoints,
    FOUNDERS_OWNERS_HELP,
    BUSINESS_RESOURCE_STATUSES,
    resourceStatusIds,
    statusInGroup,
    isSpaceOnlyGroup,
    buyCostOf,
    RENT_SUPPLIER_GROUP,
    usesSupplier,
    activityPeriod,
    activityDateIssues,
    resourcesStartingTooLate,
    cappedUnits,
    unitsCap,
    equalOfferingShares,
    offeringSharesTotal,
    offeringSharesInUnits,
    offeringSharesIncomplete,
    unitOfferingShares,
    BUSINESS_PAYMENT_PLANS,
    type BusinessPaymentPlan,
    type BusinessPaymentLine,
    instalmentLines,
    paymentPlanLines,
    paymentPlanTotal,
    BUSINESS_EXTRAS,
    type BusinessExtraKey,
    type BusinessExtrasValue,
    PEOPLE_EXTRA_KEYS,
    partnerExtraKeys,
    supplierConnections,
    servicesOfAsset,
    BILLING_TYPES,
    billingOf,
    costOptionsOf,
    costWithOption,
    optionFrequenciesOf,
    noteHint,
    withNewInsurances,
    partnerHasQuantity,
    slotExtraKeys,
    frequencyIdsOf,
    unitsOf,
    normalCostOf,
    isPurchaseGroup,
    isCostingStatus,
    businessQuantityText,
    isPartnered,
    BUSINESS_WORKSPACE_KINDS,
    BusinessActivityValue,
    BusinessCategoryValue,
    PARTNER_CATEGORIES,
    partnerCategoryLabel,
    partnerNoun,
    LegalEntityExpenseValue,
    BusinessCapabilityValue,
    BusinessStatusRow,
    BusinessCostValue,
    BusinessFounderValue,
    BusinessPartnerValue,
    BusinessResourceSlotValue,
    LegalEntityFounderValue,
    asBusinessCapabilityValue,
    asBusinessEngagementValue,
    businessDecimalText,
    businessFoundationSegments,
    businessAutoResponsibleId,
    businessPartnerResponsibleId,
    responsibleIsOff,
    businessFounderResponsibilities,
    businessResponsibilitiesTally,
    createBusinessActivity,
    UNASSIGNED_CATEGORY,
    createBusinessPartner,
    createBusinessResourceSlot,
    orderedByDate,
    todayIsoDate,
    workspacesOf,
    resourceUnitCount,
    stableCardHue,
    withLegalEntityFounders
} from "../../framework/engine/AnswerUtils.ts";
import { costText } from "../../framework/engine/ExportRenderers.ts";

import {
    BusinessCard,
    MissingMapContext,
    MissingScope,
    LinkSymbol,
    ResponsibleField,
    BusinessEmpty,
    BusinessField,
    BusinessFieldTick,
    OptionalField,
    OptionalNote,
    BusinessRemove,
    BusinessText,
    BusinessTicks,
    uniqueChoices
} from "./BusinessCardFields.tsx";
import {
    DeliveryValue,
    createDelivery,
    deliveryAllocation,
    deliveryHours,
    WEEKS_PER_MONTH,
    demandResult,
    founderDeliveryHours,
    founderWorkingHours
} from "../../framework/engine/DemandCapacity.ts";
import { type GlobalSettingsValue } from "../../framework/engine/GlobalSettings.ts";
import { asFinancialFoundationValue, moneyFormatter } from "../../framework/engine/FinancialModel.ts";
import { inventoryClassification } from "../../framework/engine/InventoryClassification.ts";
import { PreferencesService } from "../../services/PreferencesService.ts";
import { parseAmount, parseDecimal } from "../../framework/engine/Amounts.ts";
import { CURRENCY_CODES, CURRENCY_SEARCH_ALIASES, labelWithCurrency, nameWithCurrency } from "../../framework/engine/Currencies.ts";
import { randomId } from "../../framework/engine/Readers.ts";
import DateCellInput, { isoToDisplay } from "./DateCellInput.tsx";
import { SOURCES } from "../../framework/engine/Sources.ts";
import { railId } from "./rails/railItems.ts";

import { summaryText } from "./cardSummary.ts";
import CardBoxes, { CardBox } from "./CardBoxes.tsx";
import SectionTiles, { SQUEEZED_ROW_MIN, CHANNEL_TILE_HUE, otherColumn, ActiveCount, CrumbNote, DialogHeading, FloatingCards, ItemMark, SectionTile, TileAdd, TileLink, OPEN_EVENT, type OpenRequest } from "./SectionTiles.tsx";
import SectionView, { CATEGORY_TILE_MIN_CARDS, SubcategoryBox, SubcategoryBoxes, ViewCategory } from "./SectionView.tsx";
import { resourceChannels, resourceReach } from "../../framework/engine/ChannelResources.ts";
import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";
import { NUMBER_LIMITS, limitedNumberText } from "./numberInput.ts";
import OptionPicker from "./OptionPicker.tsx";
import type { OpenPage } from "./jumpTo.ts";
import { useItemFolds } from "./useItemFolds.ts";
import FoldArrow from "./FoldArrow.tsx";
import CardTitleHelp from "./CardTitleHelp.tsx";
import LabelArrow from "./LabelArrow.tsx";
import CapabilityOverview from "./CapabilityOverview.tsx";
import { floorRows, tileLines, tileMarks } from "./capabilityFloor.ts";
import CardNameInput from "./CardNameInput.tsx";
import CardNumber from "./CardNumber.tsx";
import NumberedListStatic from "./NumberedListStatic.tsx";
import BulletListStatic from "./BulletListStatic.tsx";
import { CAPACITY_UTILISATION_HELP } from "./FinancialParts.tsx";
import { toggledIn } from "./toggledIn.ts";

import "../../styles/delivery.css";
import "../../styles/page-3-edges.css";
import TextLink from "./TextLink.tsx";

/**
 * The guidance and help this page carries.
 *
 * Every explanation behind an "i" is the specification's own
 * (docs/specifications/business-system/page-3-infrastructure-and-capability.md);
 * the guidance above the process line is this page's, as every
 * page writes its own.
 */
/** The last choice of an Activity status's list: it makes a new activity (named in the box that appears). */
const ADD_ACTIVITY = "+ Add";

const SECTIONS = {

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
const DELIVERY_HELP = {
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
const FOUNDER_FREQUENCIES = [
    { id: "week", label: "Weekly" },
    { id: "month", label: "Monthly" },
    { id: "year", label: "Annually" }
] as const;

/** The weekly-to-monthly hours conversion, its "i" beside "a month". */
const HOURS_PER_MONTH_HELP: InfoPoint[] = [
    { title: "Formula", text: "Monthly hours = Weekly hours × 52 ÷ 12" },
    "A year has 52 weeks and 12 months, so an average month has about 4.33 weeks.",
    { title: "Source", source: SOURCES.weeksToMonths }
];


/** Hours as the capacity lines give them: whole, or to one decimal. */
function formatHours(hours: number): string {
    return hours.toLocaleString("en-GB", { maximumFractionDigits: hours < 10 ? 1 : 0 });
}

/**
 * A number of hours as typed; null when there is none. Read as the
 * engine reads it (see DemandCapacity.ts), so "12,5" saved before the
 * box took only digits is 12.5 here too.
 */
function readHours(text: string | undefined): number | null {
    return parseDecimal(text ?? "");
}

/** Whether a Delivery holds nothing typed, and need not be stored. */
function deliveryIsEmpty(delivery: DeliveryValue): boolean {
    return Object.keys(delivery.hours).length === 0 &&
        delivery.effort.trim() === "" &&
        delivery.duration.trim() === "" &&
        delivery.constraints.trim() === "";
}


/** Which activity categories the page opens with, by id. */
const FIXED_ACTIVITY_IDS: ReadonlySet<string> =
    new Set(BUSINESS_ACTIVITY_CATEGORIES.map(category => category.id));

/**
 * 2. Activities: making and running the thing, then selling it,
 * numbered 1 to 4 and drawn as four tiles, two by two. A category the
 * founder added earlier is drawn as a tile after them while it holds
 * activities.
 */
const ACTIVITY_CATEGORY_ORDER: readonly string[] =
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
function startOfCard(capability: BusinessCapabilityValue, id: string): string {
    const slots = [...Object.values(capability.resources).flatMap(subsections => subsections.flatMap(subsection => subsection.slots)), ...capability.offering.resources];
    const activities = [...capability.activities.flatMap(category => category.activities), ...capability.offering.activities];
    return slots.find(slot => slot.id === id)?.startDate ?? activities.find(activity => activity.id === id)?.startDate ?? "";
}

/** The page with an activity added to its place. */
function withActivity(capability: BusinessCapabilityValue, scope: Scope, activity: BusinessActivityValue): BusinessCapabilityValue {
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
function withActivityPatched(capability: BusinessCapabilityValue, id: string, patch: Partial<BusinessActivityValue>): BusinessCapabilityValue {
    const map = (list: BusinessActivityValue[]) => list.map(entry => entry.id === id ? { ...entry, ...patch } : entry);
    return {
        ...capability,
        activities: capability.activities.map(category => ({ ...category, activities: map(category.activities) })),
        offering: { ...capability.offering, activities: map(capability.offering.activities) }
    };
}

/** A slot patched wherever it is filed. */
function patchSlot(base: BusinessCapabilityValue, id: string, patch: Partial<BusinessResourceSlotValue>): BusinessCapabilityValue {
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
function removeSlot(base: BusinessCapabilityValue, id: string): BusinessCapabilityValue {
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

interface BusinessCapabilityEditorProps {

    value: unknown;

    onChange: (value: BusinessCapabilityValue) => void;

    disabled?: boolean;

    /** See AnswerRendererProps.showInstructions. */
    showInstructions?: boolean;

    /** See AnswerRendererProps.columnsDivider. */
    columnsDivider?: ReactNode;

    /**
     * Page 1's answer. Only its Offerings are read: Offering's
     * Capability links every row it holds to one of them, and an
     * Offering is defined there, never here.
     */
    foundation?: unknown;

    /** Opens Page 1, for the link beside an empty Offering list. */
    onOpenFoundation?: OpenPage;

    /**
     * The currency of the country the organisation is registered
     * in (1. Identity System — 3. Legal Entity), or "" before one
     * is chosen there. Every Price on this page is in it unless the
     * founder picks another for that price.
     */
    organisationCurrency?: string;

    /**
     * The founders answered under 1. Identity System — 3. Legal
     * Entity, 2. Founders & Ownership. They ARE this page's
     * founders: named there, given Roles on 4. Founders Profile,
     * and a Salary here.
     */
    legalEntityFounders?: readonly LegalEntityFounderValue[];
    /** 1. Identity System — 3. Legal Entity's expenses: shown (not opened) among the "Inventory". */
    legalExpenses?: readonly LegalEntityExpenseValue[];
    /** Opens the Identity System's Legal Entity page (a legal expense a founder is responsible for). */
    onOpenLegalEntity?: OpenPage;
    /** The Legal Entity page's answer and how to save it (it belongs to the Identity System): a legal card called from this page floats here, and is edited here. */
    legalEntity?: unknown;
    onChangeLegalEntity?: (value: unknown) => void;
    legalEntityPrefill?: { organisationName: string; founderName: string };
    /** 1. Identity System — 4. Founders Profile, as saved: each founder's Roles. */
    foundersProfile?: unknown;
    /** Customer Engagement: its Demand & Conversion gives each Offering's expected sales. */
    engagement?: unknown;
    /** 4. Finances' saved value: its Plan Start (and its Opening Date) bound the dates of an activity. */
    financialFoundation?: unknown;
    /** The Opening Date (an ISO date), where the Financial Foundation has one. */
    openingDate?: string;
    /** The Global Settings: the default rates a Percentage card shows beside its Rate override. */
    globalSettings?: GlobalSettingsValue;
    /** Opens Customer Engagement: back to a channel after picking its cost here. */
    onOpenEngagement?: OpenPage;

}

/**
 * The Business System's Infrastructure & Capability section (see
 * AnswerType.BusinessCapability).
 *
 * Two sections holding the same three subsections: what the
 * ORGANIZATION needs to exist and operate, and what each OFFERING
 * needs on top of that.
 *
 * The three subsections are not three lists. A resource that is
 * "Provided" needs a provider under the third; one that needs
 * making or looking into creates an activity under the second; an
 * activity's responsible founder collects its name under their own
 * Responsibilities in the first. The page is wired to itself, and
 * that wiring is most of what it is for.
 */
export default function BusinessCapabilityEditor({

    value,

    onChange: onChangeProp,

    disabled = false,

    showInstructions = true,

    columnsDivider,

    foundation,

    onOpenFoundation,

    organisationCurrency = "",

    legalEntityFounders = [],

    legalExpenses = [],
    onOpenLegalEntity,
    legalEntity,
    onChangeLegalEntity,
    legalEntityPrefill,

    foundersProfile,

    engagement,
    financialFoundation,
    openingDate = "",
    globalSettings,

    onOpenEngagement

}: BusinessCapabilityEditorProps) {

    /* A write made since this render began (a card made in an effect, a click): the founders' sync below must not write over it with the value
       this render was drawn with -- it waits for the render that follows, which carries the write. */
    const wrote = useRef(false);
    wrote.current = false;
    const stored = orderedByDate(asBusinessCapabilityValue(value));
    const write = (next: BusinessCapabilityValue) => {
        wrote.current = true;
        // (A premises, vehicle, workshop, machine or event made by this change gets its Insurances card.)
        onChangeProp(orderedByDate(withNewInsurances(stored, next)));
    };
    // A CHANGE THAT LEAVES A GENERATED CARD WITH NO CARD NAMING IT (a Status, Activity, Partner or Supplier changed) is asked about first: Continue removes that card.
    const [pending, setPending] = useState<{ next: BusinessCapabilityValue; orphans: GeneratedCard[]; after?: () => void } | null>(null);
    /** `after` is what goes with the change on the screen (a name box opening): it follows the change only where the change is made, never while it is asked about, and not at all when it is cancelled. */
    const onChange = (changed: BusinessCapabilityValue, after?: () => void) => {
        // (A generated card serves the Offerings its parent serves.)
        const next = withInheritedOfferings(changed);
        const orphans = orphanedCards(stored, next);
        if (orphans.length > 0) {
            setPending({ next, orphans, after });
            return;
        }
        write(next);
        after?.();
    };

    /* The founders as the Legal Entity names them, with the Roles
       their Founders Profile gives them, drawn from the first render
       -- and written back (below), so what is saved says the same as
       what is shown. */
    const capability = withLegalEntityFounders(stored, legalEntityFounders, foundersProfile);

    /** The cards of the page, found by id in the value as of the last render: blank or not, and taken away (a floating card made a moment ago and left blank). */
    const discard = {
        isBlank: (id: string): boolean => {
            const now = live.current;
            const slot = [...Object.values(now.resources).flat().flatMap(entry => entry.slots), ...now.offering.resources].find(entry => entry.id === id);
            if (slot) {
                return blankSlot(slot);
            }
            const activity = [...now.activities.flatMap(group => group.activities), ...now.offering.activities].find(entry => entry.id === id);
            if (activity) {
                return blankActivity(activity);
            }
            const partner = [...now.professionals, ...now.providers, ...now.offering.professionals, ...now.offering.providers].find(entry => entry.id === id);
            if (partner) {
                return blankPartner(partner);
            }
            return false;
        },
        onRemove: (ids: string[]) => {
            const now = live.current;
            const keep = <T extends { id: string }>(list: T[]) => list.filter(entry => !ids.includes(entry.id));
            onChange({
                ...now,
                resources: Object.fromEntries(Object.entries(now.resources).map(([group, entries]) => [group, entries.map(entry => ({ ...entry, slots: keep(entry.slots) }))])),
                activities: now.activities.map(group => ({ ...group, activities: keep(group.activities) })),
                professionals: keep(now.professionals),
                providers: keep(now.providers),
                offering: {
                    ...now.offering,
                    resources: keep(now.offering.resources),
                    activities: keep(now.offering.activities),
                    professionals: keep(now.offering.professionals),
                    providers: keep(now.offering.providers)
                }
            });
        }
    };

    // The value as of the last render: a subcategory box's "+" (subAdd) is asked, when its floating card closes, about the value AFTER the card was made.
    const live = useRef(capability);
    live.current = capability;

    const storedJson = JSON.stringify(stored);
    const syncedJson = JSON.stringify(capability);

    useEffect(() => {
        if (!disabled && syncedJson !== storedJson && !wrote.current) {
            onChange(JSON.parse(syncedJson) as BusinessCapabilityValue);
        }
        // onChange is a fresh function each render; the two
        // serialised values are what decide whether to write.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disabled, storedJson, syncedJson]);

    /** Whether the Legal Entity names anybody yet. */
    const hasLegalFounders = legalEntityFounders.some(
        founder => founder.name.trim().length > 0
    );

    /* Until it does, there is nobody to list or to make
       responsible: founders are answered there, not here. */
    const founders = hasLegalFounders ? capability.founders : [];

    const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

    /**
     * Which card title has its guidance drop-down open (one at a time): none to
     * begin with. View-only, never saved.
     */
    const [helpOpen, setHelpOpen] = useState<number | null>(null);

    /**
     * Which Resource, Founder, Activity and Partner cards are open.
     * These four item kinds start CLOSED -- see useItemFolds --
     * unlike the structural sections, groups and subsections around
     * them, which stay on `collapsed` and so start open.
     */
    const folds = useItemFolds();

    /** Completed lists start folded away: they are what is DONE. */
    const [completedOpen, setCompletedOpen] = useState<ReadonlySet<string>>(new Set());

    /**
     * Each founder's Responsibilities list, where it has been folded
     * or unfolded by hand; otherwise it starts open up to five and
     * folded beyond (see businessResponsibilitiesTally). Kept for as
     * long as the page is open, like every other fold on it.
     */
    const [responsibilityFolds, setResponsibilityFolds] = useState<ReadonlyMap<string, boolean>>(new Map());
    /** The options of a founder's Responsibilities filter ticked OFF (by founder): none, until one is. */
    const [responsibilityOff, setResponsibilityOff] = useState<ReadonlyMap<string, ReadonlySet<string>>>(new Map());

    /* A resource and the activity its status created, shown together (the link in either): the PARENT above, the CHILD below. */
    const [pair, setPair] = useState<{ parentId: string; childId: string } | null>(null);

    /** The cards whose Links section is open (it starts folded). */
    const [linksOpen, setLinksOpen] = useState<ReadonlySet<string>>(new Set());

    // THE INVENTORY AND COMPLETED ROW under the two cards is squeezed into the room the window leaves (never under SQUEEZED_ROW_MIN, never over the page's own 215px).
    useLayoutEffect(() => {
        const squeeze = () => {
            const row = document.querySelector<HTMLElement>(".section-tiles-completed");
            if (!row) {
                return;
            }
            const footer = document.querySelector<HTMLElement>(".workspace-footer")?.offsetHeight ?? 64;
            const room = window.innerHeight - row.getBoundingClientRect().top - footer - 12;
            // (Square, 215px, while the window has the room; the height alone gives way when it has not, so the tiles become rectangles.)
            const side = Math.round(Math.max(SQUEEZED_ROW_MIN, Math.min(215, room)));
            row.style.setProperty("--section-tile-size", side + "px");
            // (Squeezed under what a list needs, the tiles keep their titles.)
            if (side < 150) {
                row.setAttribute("data-squeezed", "");
            } else {
                row.removeAttribute("data-squeezed");
            }
        };
        squeeze();
        const later = window.setTimeout(squeeze, 300);
        window.addEventListener("resize", squeeze);
        return () => {
            window.clearTimeout(later);
            window.removeEventListener("resize", squeeze);
        };
    });


    /**
     * Resources whose provider or professional was just created
     * through "Other…", and so still show the box that names it.
     */
    const [naming, setNaming] = useState<ReadonlySet<string>>(new Set());
    // The amount of a payment being typed (a payment plan's amount and percent are one figure: the text typed stays as typed).
    // The cards whose optional End date is ticked while it is still empty (a date typed keeps it ticked by itself).
    const [endTicked, setEndTicked] = useState<ReadonlySet<string>>(new Set());
    // What a date refused says (the End date of a Per project card cannot be before a payment, and a payment cannot fall after the End date), by card.
    const [dateNotice, setDateNotice] = useState<{ owner: string; text: string } | null>(null);
    const [amountDraft, setAmountDraft] = useState<{ id: string; text: string } | null>(null);

    /** The Category and Group picked on a status row's supplier rows before a name is chosen, by the row's key (a chosen name carries its own). */
    const [cascade, setCascade] = useState<Readonly<Record<string, { category: string; group: string }>>>({});

    function toggle(key: string) {
        setCollapsed(current => toggledIn(current, key));
    }

    function update(patch: Partial<BusinessCapabilityValue>) {
        onChange({ ...capability, ...patch });
    }

    /* ---------- Page 1's Offerings, referenced ---------- */

    /**
     * Every Offering the organisation sells, across every Segment.
     *
     * Flat rather than grouped by Segment: this page is about what
     * an Offering COSTS to make, which has nothing to do with who
     * it is sold to. An Offering sold to two Segments is one
     * Offering with one set of resources.
     */
    const offerings = businessFoundationSegments(foundation)
        .flatMap(segment => segment.offerings);

    const offeringChoices = uniqueChoices(offerings, "Unnamed offering");

    /* ---------- Who can be named ---------- */

    const founderChoices = uniqueChoices(founders, "Unnamed founder");

    /*
        EXPECTED SALES, from Demand & Conversion on Customer Engagement:
        the page before this one, so already filled in on the way here.
        Never from a later page.
    */
    const engagementValue = asBusinessEngagementValue(engagement);
    const demandByOffering = engagementValue.demand;

    /**
     * The cards a Customer Channel made ("+ Add expenses" on a channel,
     * ChannelResources.ts): they get their own tile and colour, apart
     * from the user's own cards, in the category they belong to.
     */
    const channelCardIds: ReadonlySet<string> = new Set(
        engagementValue.channelResources.map(link => link.resourceId)
    );

    /**
     * The channel-made cards that sit in the Channel tile: the blank ones from "+ Add expenses". A card made from a template ("Typical costs for this channel")
     * is filed in its own Category and Group and lives there, in the channel's colour.
     */
    const channelTileIds: ReadonlySet<string> = new Set([
        ...capability.offering.resources.filter(slot => channelCardIds.has(slot.id) && slot.category === "").map(slot => slot.id),
        ...[...capability.offering.professionals, ...capability.offering.providers].filter(partner => channelCardIds.has(partner.id) && partner.group === "").map(partner => partner.id)
    ]);

    /**
     * THE CARDS IN THE CHANNEL'S COLOUR: the cards a channel holds, the activity one of them generated (Needs Activity / Investigation) and the Partner or
     * Provider it is connected to (Partners & Suppliers) -- in tiles and floating cards alike. (The Partner keeps its own Category.)
     */
    const channelToneIds: ReadonlySet<string> = (() => {
        const ids = new Set<string>(channelCardIds);
        const cards = [...Object.values(capability.resources).flat().flatMap(entry => entry.slots), ...capability.offering.resources].filter(slot => channelCardIds.has(slot.id));
        cards.forEach(slot => {
            if (usesSupplier(slot.status) && slot.providerId) {
                ids.add(slot.providerId);
            }
        });
        return ids;
    })();

    /**
     * WHAT A CARD TILE SAYS (CardTile.tsx -- the same lines as in Inventory): where the card belongs, its status and its cost, its links as circles, the
     * colour of its section. Read from the floor's rows, so the grids of cards and the overlay can never differ.
     */
    // (A card just made and still open is not flagged: the floor reads freshCards, and this renders again when that changes.)
    useSyncExternalStore(freshCards.subscribe, freshCards.snapshot);
    const floor = floorRows(capability, legalExpenses, channelToneIds);
    const missingById = new Map(floor.filter(row => row.missing).map(row => [row.id, row.missing!] as const));
    const floorById = new Map(floor.map(row => [row.id, row]));
    const formatMoney = moneyFormatter(organisationCurrency ?? "");

    /** The first day of the plan (Plan Start is a month on 4. Finances); "" until it is given. */
    const planStartDay = (() => {
        const month = asFinancialFoundationValue(financialFoundation).planStart;
        return /^\d{4}$/.test(month.year) && /^\d{1,2}$/.test(month.month) ? month.year + "-" + month.month.padStart(2, "0") + "-01" : "";
    })();
    const tileData = (id: string) => {
        const row = floorById.get(id);
        return row ? { lines: tileLines(row, formatMoney), marks: tileMarks(row, tileLines(row, formatMoney)), links: row.links, tone: row.tone, missing: row.missing } : {};
    };

    /** A card a Customer Channel MADE (in Offering's Capability; a card of Infrastructure only linked from a channel is the user's own). */
    const channelMade = (scope: Scope, id: string) => scope === "offering" && channelCardIds.has(id);

    /**
     * THE TITLE OF A CARD A CUSTOMER CHANNEL MADE is a link to that channel (as an investigated activity's name is a link to its resource): it opens the channel
     * on its page; the other channels the card serves are in the tooltip.
     */
    function channelTitle(cardId: string): { title: string; onClick: () => void } | undefined {
        for (const link of resourceChannels(engagementValue, cardId)) {
            const segment = engagementValue.segments.find(entry => entry.segmentId === link.segmentId);
            const channel = segment?.channels.find(entry => entry.id === link.channelId);
            if (!segment || !channel) {
                continue;
            }
            const first = segment.channels.find(entry => entry.category === channel.category);
            const also = resourceReach(engagementValue, link)
                .map(id => segment.channels.find(entry => entry.id === id)?.name.trim() || "Unnamed channel");
            const name = [channel.category, channel.name.trim() || "Unnamed channel"].filter(Boolean).join(" › ");
            return {
                title: "Channel “" + name + "”" + (also.length > 0 ? ". Also serves: " + also.join(", ") : ""),
                onClick: () => onOpenEngagement?.(["channel-" + channel.id, "channel-category-" + (first?.id ?? channel.id), "engagement-segment-" + segment.segmentId])
            };
        }
        return undefined;
    }
    function expectedFor(offeringId: string): { volume: number; source: string } | null {
        const fromDemand = demandResult(demandByOffering[offeringId]).expected;
        return fromDemand !== null && fromDemand > 0
            ? { volume: fromDemand, source: "Demand & Conversion" }
            : null;
    }

    /* Hours in the unit the founders think in: a week if any founder
       gave their hours a week, with the month beside it. */
    const weeklyView = founders.some(founder => founder.period === "week");
    function inFounderUnit(monthly: number): string {
        // One decimal, so a budget adds up line by line.
        const exact = (hours: number) => hours.toLocaleString("en-GB", { maximumFractionDigits: 1 });
        return weeklyView
            ? exact(monthly / WEEKS_PER_MONTH) + " h a week (" + exact(monthly) + " a month)"
            : exact(monthly) + " h a month";
    }

    /** One founder's month: delivery hours, what each Offering takes, and what is left. */
    function founderBudget(founderId: string) {
        const items = offeringChoices.flatMap(choice => {
            const delivery = capability.delivery[choice.id];
            const perUnit = deliveryAllocation(delivery)[founderId];
            const expected = expectedFor(choice.id);
            if (!perUnit || !expected) {
                return [];
            }
            const monthly = delivery?.mode === "monthly";
            return [{
                id: choice.id,
                label: choice.label + " (" + formatHours(expected.volume) + (monthly ? " clients" : " a month") + ")",
                hours: perUnit * expected.volume,
                monthly
            }];
        });
        // Ongoing work first: it is served every month.
        items.sort((a, b) => Number(b.monthly) - Number(a.monthly));
        return items;
    }


    const founderIds = founders.map(founder => founder.id);

    /**
     * Who can perform an activity: a founder, or somebody engaged
     * under this section's own Partners & Suppliers. Both, and
     * in that order, because an early-stage organisation does most
     * things itself and buys the rest.
     */
    function performerChoices(scope: Scope) {
        return [
            ...founderChoices,
            ...uniqueChoices(
                [...partnersOf(scope, "professionals"), ...partnersOf(scope, "providers")],
                "Unnamed partner"
            )
        ];
    }

    function partnersOf(
        scope: Scope,
        kind: "professionals" | "providers"
    ): BusinessPartnerValue[] {
        return scope === "infrastructure"
            ? capability[kind]
            : capability.offering[kind];
    }

    /** One partner list, replaced inside a given value. */
    function withPartners(
        base: BusinessCapabilityValue,
        scope: Scope,
        kind: "professionals" | "providers",
        next: BusinessPartnerValue[]
    ): BusinessCapabilityValue {
        return scope === "infrastructure"
            ? { ...base, [kind]: next }
            : { ...base, offering: { ...base.offering, [kind]: next } };
    }

    function setPartners(
        scope: Scope,
        kind: "professionals" | "providers",
        next: BusinessPartnerValue[]
    ) {
        onChange(withPartners(capability, scope, kind, next));
    }

    /* ---------- Small shared controls ---------- */

    /**
     * A level of the page that folds: its arrow, its title, and what
     * it holds.
     *
     * Page 2's foldingSection, the same markup and the same arrow,
     * with room for the "i" several of these titles carry -- so a
     * group and its sections fold the way a card does, with the
     * control already learned.
     *
     * `path` is what the arrow announces: the title with everything
     * above it, since "Minimize 1. Founders" alone does not say it
     * sits under Organisational Resources, and the arrows on this
     * page should not have to be told apart by position.
     *
     * The body is a function, so a folded level costs nothing to
     * draw.
     *
     * `foldable` false draws the same title with no arrow and the
     * body always open -- for the columns inside a group (1. Founders,
     * 3. Marketing), which fold with their group rather than alone.
     */
    function foldingGroup(
        key: string,
        title: string,
        path: string,
        info: InfoPoint[] | undefined,
        className: string,
        body: () => ReactNode,
        foldable = true,
        /** What a link calls it (see jumpTo.ts). */
        anchor?: string,
        /**
         * Drawn at the far end of the title's own row: the group's
         * "Expand all" (see .fold-group-head).
         */
        titleExtra?: ReactNode
    ) {

        const open = !foldable || !collapsed.has(key);

        return (
            <div className={className} key={key} data-anchor={anchor}>

                <div className={"business-engagement-section-head" + (titleExtra ? " fold-group-head" : "")}>

                    {foldable && (
                        <FoldArrow open={open} label={path} onToggle={() => toggle(key)} />
                    )}

                    {/* (In a dialog the views opened inside it follow the title on this line, after a slash.) */}
                    <DialogHeading title={title} info={info} />

                    {titleExtra}

                </div>

                {open && body()}

            </div>
        );

    }

    /**
     * A picker that stores an id and shows a name.
     *
     * Everything this page points at -- a founder, a provider, an
     * Offering -- is held by id and named somewhere else, so this
     * is the shape of nearly every choice on it.
     */
    function chooser(
        label: string,
        choices: readonly { id: string; label: string }[],
        current: string,
        onNext: (next: string) => void,
        placeholder: string,
        empty: ReactNode,
        info?: InfoPoint[],
        /** When several pickers share a label: which one this is. */
        ariaLabel?: string,
        inline = false,
        /** The label in the short side-label column, beside a picker as wide as its longest name. */
        side = false,
        /** The label its field key is made from, where the label shown is not the one the key was made from. */
        keyLabel?: string,
        /** A tick next to the label: unticked, the picker is not drawn (see responsibilityField). */
        tick?: BusinessFieldTick,
        /** The picker runs to the right edge of its column (the name cell's, in an opened card) instead of hugging its longest option. */
        fill = false
    ) {
        return (
            <BusinessField label={label} info={info} inline={inline} side={side} fieldId={keyLabel} tick={tick}>
                {choices.length === 0
                    ? <BusinessEmpty>{empty}</BusinessEmpty>
                    : (
                        <OptionPicker
                            label={ariaLabel ?? label}
                            placeholder={placeholder}
                            hug={!fill}
                            fill={fill ? "fit" : false}
                            options={choices.map(choice => choice.label)}
                            disabled={disabled}
                            value={choices.find(
                                choice => choice.id === current
                            )?.label ?? ""}
                            onChange={(next) => onNext(
                                choices.find(choice => choice.label === next)?.id ?? ""
                            )}
                        />
                    )}
            </BusinessField>
        );
    }

    /**
     * The Offerings something on Offering's Capability serves: one or
     * several, ticked. The same yarn can go into two collections, and
     * one tutor can teach two courses.
     */
    function offeringsField(
        current: string[],
        onNext: (next: { offeringIds: string[]; offeringShares: Record<string, string> }) => void,
        name: string,
        empty: ReactNode,
        shares: Record<string, string>,
        /** A card a Customer Channel made carries that channel's Offerings: they change on the channel, not here. */
        locked = false
    ) {
        const total = offeringSharesTotal(current, shares);
        const inUnits = offeringSharesInUnits(shares);
        return (
            <BusinessField label="Offerings" className="business-offering-field">
                {/* With several Offerings: what the shares count in -- Units (each starts at 1) or 100% (each starts equal). */}
                {offeringChoices.length > 0 && current.length > 1 && (
                    <div className="business-offering-mode" role="radiogroup" aria-label={name + " shares count in"}>
                        <label className="business-offering-mode-option">
                            <input
                                type="radio"
                                name={name + ":mode"}
                                aria-label={name + " shares in units"}
                                disabled={disabled}
                                checked={inUnits}
                                onChange={() => onNext({ offeringIds: current, offeringShares: unitOfferingShares(current) })}
                            />
                            <span>Units</span>
                        </label>
                        <label className="business-offering-mode-option">
                            <input
                                type="radio"
                                name={name + ":mode"}
                                aria-label={name + " shares in percent"}
                                disabled={disabled}
                                checked={!inUnits}
                                onChange={() => onNext({ offeringIds: current, offeringShares: equalOfferingShares(current) })}
                            />
                            <span>%</span>
                        </label>
                    </div>
                )}
                {/* With several Offerings, the percent of the card each carries; said first, above the numbers. */}
                {offeringChoices.length > 0 && current.length > 1 && (
                    <>
                        {inUnits
                            ? (offeringSharesIncomplete(current, shares) ? <p className="business-capability-total business-capability-alarm">Every Offering needs at least one unit.</p> : null)
                            : (
                                <p className={"business-capability-total" + (total === 100 ? "" : " business-capability-alarm")}>
                                    {total === 100 ? "Total 100%" : "Total " + total + "%: the shares must total 100%"}
                                </p>
                            )}
                    </>
                )}
                {offeringChoices.length === 0
                    ? <BusinessEmpty>{empty}</BusinessEmpty>
                    : (
                        <BusinessTicks
                            name={name}
                            options={offeringChoices.map(choice => ({ id: choice.id, label: choice.label }))}
                            chosen={current}
                            disabled={disabled || locked}
                            // (Ticking starts the shares equal.)
                            onChange={(next) => onNext({ offeringIds: next, offeringShares: inUnits && next.length > 1 ? unitOfferingShares(next) : equalOfferingShares(next) })}
                            // With several Offerings, the percent of the card each carries stands at the end of its own row, in the x's column (a whole number, two digits at most).
                            trailing={current.length > 1 ? Object.fromEntries(current.map(id => [id, (
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="interview-input business-capability-share"
                                    aria-label={name + " share of " + (offeringChoices.find(choice => choice.id === id)?.label ?? "Offering")}
                                    placeholder={inUnits ? "1" : "%"}
                                    title={inUnits ? "Units of this Offering" : "Percent of this card"}
                                    disabled={disabled || locked}
                                    value={shares[id] ?? ""}
                                    onChange={(event) => onNext({ offeringIds: current, offeringShares: { ...shares, [id]: event.target.value.replace(/\D/g, "").slice(0, inUnits ? 3 : 2) } })}
                                />
                            )])) : undefined}
                        />
                    )}
            </BusinessField>
        );
    }

    /**
     * A price, the currency it is in, and how often it is paid.
     *
     * THE CURRENCY BESIDE THE AMOUNT, in the one field: "30" is not
     * a price until it says 30 of what. It starts as the currency
     * of the country the organisation is registered in -- answered
     * once, on the Legal Entity page -- and can be changed for this
     * price alone, for the software subscription billed in dollars.
     *
     * Choosing the registration's own currency back stores "", so
     * the price follows the registration again rather than holding
     * a copy of it.
     */
    function costFields(
        what: string,
        cost: BusinessCostValue,
        onNext: (next: BusinessCostValue) => void,
        /** A resource's Quantity: any count but 1 makes this the price of one. */
        quantity = "",
        /** A resource's Qty field (and the note under the row), set on the Price's row: Qty | Price | currency | Frequency. */
        quantityField?: { field: ReactNode; note?: ReactNode },
        /**
         * A partner's card: the two columns fill the card, and what is
         * given here (its Responsibility) goes under the Price, one
         * column wide -- as wide as the Frequency beside the Price.
         */
        wide?: { after: ReactNode },
        /** The card is a purchase of an asset (an asset group's): a Per unit price is then multiplied by the Qty. */
        purchase = false,
        /** Where the card is filed: its group offers its own frequencies and units. */
        where?: { scope: Scope; groupId: string; costOption?: string }
    ) {
        const place = where?.scope ?? "infrastructure";
        const groupId = where?.groupId ?? "";

        // THE FREQUENCIES THE GROUP OFFERS (all seven where it is not known; the one already chosen stays offered). One frequency is nothing to choose: it is
        // text, and a One-time one is implied, so it is not shown at all.
        // (A chosen cost option locks the driver to the ones its billing type allows.)
        const offered = where
            ? optionFrequenciesOf(place, groupId, where.costOption ?? "") ?? frequencyIdsOf(place, groupId)
            : BUSINESS_COST_FREQUENCIES.map(entry => entry.id);
        const frequencyOptions = BUSINESS_COST_FREQUENCIES.filter(entry => offered.includes(entry.id) || entry.id === cost.frequency);

        // THE UNIT of a Per unit price, a dropdown of the group's units beside the Frequency, with no label (the currency's way); one unit besides "unit" is text.
        const units = unitsOf(place, groupId);
        const unitIds = cost.unit !== "" && !units.includes(cost.unit) ? [...units.filter(unit => unit !== "unit"), cost.unit, "unit"] : units;
        const specificUnits = unitIds.filter(unit => unit !== "unit");
        // PER UNIT IS ONE OPTION PER UNIT of the group ("Per hour", "Per kg", "Per unit"): choosing one sets the frequency AND the unit, so no list of units
        // follows the Frequency and every list says what it holds.
        const perUnitLabel = (unit: string) => "Per " + (unit || "unit");
        // (A label that is too long for the cell says "rev." for revenue and "proj." for project; where it has the room -- the cell is 160px wide -- the whole words are written.)
        const shortFrequency = (label: string) => label.length >= 14 ? label.replace(/revenue/i, "rev.").replace(/project/i, "proj.").replace(/hour/i, "hr") : label;
        const frequencyChoices: { label: string; frequency: string; unit: string }[] = frequencyOptions.flatMap(entry => entry.id === "per-unit"
            ? (specificUnits.length > 0 ? specificUnits : ["unit"]).map(unit => ({ label: shortFrequency(perUnitLabel(unit)), frequency: "per-unit", unit }))
            : [{ label: shortFrequency(entry.label), frequency: entry.id, unit: "" }]);
        const soleChoice = frequencyChoices.length === 1 ? frequencyChoices[0] : undefined;
        const soleFrequency = soleChoice ? { id: soleChoice.frequency, label: soleChoice.label } : undefined;
        const chosenFrequencyLabel = shortFrequency(cost.frequency === "per-unit"
            ? perUnitLabel(cost.unit)
            : BUSINESS_COST_FREQUENCIES.find(entry => entry.id === cost.frequency)?.label ?? "");
        const unitControl = null;

        const count = resourceUnitCount(quantity, cost.frequency, purchase);
        const unitPrice = parseAmount(cost.price) ?? NaN;
        const total = count !== null && Number.isFinite(unitPrice)
            ? Math.round(unitPrice * count * 100) / 100
            : null;
        return (
            /* ONE ROW (business-capability-cost-row): [Qty] [Price .......] [currency] ... [Frequency], labels above Qty, Price and
               Frequency. The currency's left edge is the side-label pickers' (Status's, Responsible's); the Frequency's right edge is the
               name cell's; the Price takes what is left, 12px from the Qty and 12px from the currency. Under 358px of content the
               Frequency goes under the row (business-capability-costs). */
            <div className="business-capability-costs">
            <div className={"business-capability-cost-grid" +
                (quantityField ? " business-capability-cost-grid-quantity" : "") +
                (wide ? " business-capability-cost-grid-wide" : "")}>

                <div className="business-capability-cost-row">

                    {quantityField?.field}

                    <BusinessField label="Price">
                        {/* A number and nothing else: the currency is beside it, and "per month" is Frequency. */}
                        <input
                            type="text"
                            inputMode="decimal"
                            className="interview-input"
                            aria-label={what + " price"}
                            disabled={disabled}
                            value={cost.price}
                            onChange={(event) => onNext({
                                ...cost, price: limitedNumberText(event.target.value, cost.price, NUMBER_LIMITS.money)
                            })}
                        />
                    </BusinessField>

                    <div className="business-capability-cost-currency">
                        <OptionPicker
                            label={what + " currency"}
                            placeholder="Code"
                            options={CURRENCY_CODES}
                            currency
                            searchable
                            searchPlaceholder="Type"
                            searchAliases={CURRENCY_SEARCH_ALIASES}
                            disabled={disabled}
                            value={cost.currency || organisationCurrency}
                            onChange={(next) => onNext({
                                ...cost,
                                currency: next === organisationCurrency ? "" : next
                            })}
                        />
                    </div>

                    {!(soleFrequency && soleFrequency.id === "one-time") && (
                        <BusinessField label="Frequency">
                            {(() => {
                                const picker = soleFrequency
                                    ? <span className="business-capability-static-value" title={soleFrequency.label}>{soleFrequency.label}</span>
                                    : (
                                        <OptionPicker
                                            label={what + " payment frequency"}
                                            placeholder="Select"
                                            options={frequencyChoices.map(choice => choice.label)}
                                            disabled={disabled}
                                            value={chosenFrequencyLabel}
                                            onChange={(next) => {
                                                const choice = frequencyChoices.find(entry => entry.label === next);
                                                onNext(normalCostOf({
                                                    ...cost,
                                                    frequency: choice?.frequency ?? "",
                                                    unit: choice?.unit ?? "",
                                                    frequencyOther: ""
                                                }, place, groupId));
                                            }}
                                        />
                                    );
                                return unitControl
                                    ? <div className="business-capability-frequency-unit">{picker}{unitControl}</div>
                                    : picker;
                            })()}
                        </BusinessField>
                    )}

                </div>

                {total !== null && (
                    <p className="business-capability-total">
                        Total: {count} × {moneyFormatter(cost.currency || organisationCurrency)(unitPrice)} = {moneyFormatter(cost.currency || organisationCurrency)(total)}
                    </p>
                )}

                {quantityField?.note}

                {cost.frequency === "other" && (
                    <BusinessText
                        label="Which?"
                        ariaLabel={what + " frequency, named"}
                        value={cost.frequencyOther}
                        disabled={disabled}
                        onChange={(next) => onNext({ ...cost, frequencyOther: next })}
                    />
                )}

                {wide?.after && <div className="business-capability-cost-after">{wide.after}</div>}

            </div>
            </div>
        );
    }

    /**
     * The Status field, and everything the chosen status obliges.
     *
     * "Provided" asks which provider, and offers to create one when
     * there are none -- the specification's "A Provider must be
     * defined under 3. Partners & Suppliers". "Costs" asks the
     * price. The two that make work say where that work went, which
     * is the only way a founder can tell the page did anything.
     */
    function statusFields(
        what: string,
        scope: Scope,
        slot: BusinessResourceSlotValue,
        allowed: readonly string[],
        /*
            Patches this slot INSIDE A GIVEN VALUE rather than
            inside the current one, and hands the result back.

            It has to, because one control here changes two things
            at once: the Status sets this slot AND records the
            activity that status obliges under 2. Activities.
            Written as two calls, both would start from the value
            this render was drawn with, and the second would be
            saved over the first.
        */
        applySlot: (
            base: BusinessCapabilityValue,
            patch: Partial<BusinessResourceSlotValue>
        ) => BusinessCapabilityValue,
        /** A resource's Qty field, shown at Costs and Buy only (a space has none). */
        quantityField?: { field: ReactNode; note?: ReactNode },
        /** The card is a purchase of an asset (see costFields). */
        purchase = false,
        /** The group the card is filed in: a Buy asks for the price its group buys with (a space One-time, a vehicle Per unit). */
        groupId = ""
    ) {

        const onSlot = (patch: Partial<BusinessResourceSlotValue>) =>
            onChange(applySlot(capability, patch));

        // (A people card, which can also need an investigation, calls the Activity status "Needs Activity".)
        const options = BUSINESS_RESOURCE_STATUSES.filter(
            status => allowed.includes(status.id)
        ).map(status => status.id === "activity" && allowed.includes("investigation") ? { ...status, label: "Needs Activity" } : status);

        // The statuses added with the "+" (a further supplier: the installer, the insurer ...), each a row of its own.
        const extraRows = slot.extraStatuses ?? [];

        const statusPicker = (
            <OptionPicker
                label={what + " status"}
                placeholder="Select"
                fill="fit"
                options={options.map(status => status.label)}
                disabled={disabled}
                value={options.find(
                    status => status.id === slot.status
                )?.label ?? ""}
                onChange={(next) => {

                    const status = options.find(
                        candidate => candidate.label === next
                    )?.id ?? "";

                    // The status and whatever it asks of the price, in ONE write.
                    onChange(applySlot(capability, { status, ...(status === "buy" ? { cost: buyCostOf(groupId, slot.cost) } : {}) }));

                }}
            />
        );

        return (
            <>

                <BusinessField label="Status" info={options.map(status => ({ title: status.label, text: status.explanation }))} inline={false} side>
                    {/* The picker, and beside it the "+" that adds another status row (the Performer's place for its "+"). */}
                    <div className="business-capability-performers">
                        <div className="business-capability-performer">
                            {statusPicker}
                            <button
                                type="button"
                                className="plus-box plus-box-small"
                                aria-label={"Add Status to " + what}
                                title="Add Status"
                                disabled={disabled}
                                onClick={() => onSlot({ extraStatuses: [...extraRows, { id: randomId("status"), status: "", providerId: "", activityId: "" }] })}
                            />
                        </div>
                    </div>
                </BusinessField>

                {/* A space's or vehicle's Rent: the supplier of the one group (the place's landlords and lessors), whose card holds the rent or lease and its extras;
                    the link symbol beside the name opens it. */}
                {slot.status === "rent" && rentRow(
                    what, scope, slot.id, slot.id, slot.providerId, slot.offeringIds,
                    (base, providerId) => applySlot(base, { providerId })
                )}

                {/* The order under a Partners & Suppliers Status: its Category, its Group, then the Name -- the link symbol beside it opens that card. */}
                {isPartnered(slot.status) && supplierRows(
                    what, scope, slot.id, slot.id, slot.providerId, slot.offeringIds,
                    (base, providerId) => applySlot(base, { providerId })
                )}

                {/* The Activity status: the activities of this place that have not ended at the card's Start date, with their category; "Other…" makes a new one.
                    The link symbol beside the name opens the activity. */}
                {slot.status === "activity" && activityRows(
                    what, scope, slot.id, slot.id, slot.startDate, slot.activityId, slot.offeringIds,
                    (base, activityId) => applySlot(base, { activityId })
                )}

                {/* The status rows added with the "+": the status (Partners & Suppliers or Activity), the × that takes the row away, then the same rows as the first. */}
                {extraRows.map((row, position) => {
                    const rowLabel = what + " status " + (position + 2);
                    const rowStatuses = BUSINESS_RESOURCE_STATUSES.filter(status => (BUSINESS_EXTRA_STATUS_IDS as readonly string[]).includes(status.id))
                        .map(status => status.id === "activity" && allowed.includes("investigation") ? { ...status, label: "Needs Activity" } : status);
                    const patchRow = (base: BusinessCapabilityValue, patch: Partial<BusinessStatusRow>) => applySlot(base, {
                        extraStatuses: extraRows.map(entry => entry.id === row.id ? { ...entry, ...patch } : entry)
                    });
                    return (
                        <Fragment key={row.id}>
                            <BusinessField label="Status" side>
                                <div className="business-capability-performers">
                                    <div className="business-capability-performer">
                                        <OptionPicker
                                            label={rowLabel}
                                            placeholder="Select"
                                            fill="fit"
                                            options={rowStatuses.map(status => status.label)}
                                            disabled={disabled}
                                            value={rowStatuses.find(status => status.id === row.status)?.label ?? ""}
                                            onChange={(next) => onChange(patchRow(capability, { status: rowStatuses.find(status => status.label === next)?.id ?? "" }))}
                                        />
                                        <BusinessRemove
                                            cell
                                            what={rowLabel}
                                            disabled={disabled}
                                            onRemove={() => onSlot({ extraStatuses: extraRows.filter(entry => entry.id !== row.id) })}
                                        />
                                    </div>
                                </div>
                            </BusinessField>
                            {row.status === "partners-suppliers" && supplierRows(
                                rowLabel, scope, row.id, slot.id, row.providerId, slot.offeringIds,
                                (base, providerId) => patchRow(base, { providerId })
                            )}
                            {row.status === "activity" && activityRows(
                                rowLabel, scope, row.id, slot.id, slot.startDate, row.activityId, slot.offeringIds,
                                (base, activityId) => patchRow(base, { activityId })
                            )}
                        </Fragment>
                    );
                })}

                {isCostingStatus(slot.status) && costOptionRows(what, scope, groupId, slot.costOption, (option) => onSlot({ costOption: option, cost: withDefaultRate(costWithOption(slot.cost, scope, groupId, option), scope, groupId, option) }), channelMade(scope, slot.id))}

                {isCostingStatus(slot.status) && costFields(
                    what,
                    slot.cost,
                    (next) => onSlot({ cost: next }),
                    slot.quantity,
                    quantityField,
                    undefined,
                    purchase,
                    { scope, groupId, costOption: slot.costOption }
                )}

                {isCostingStatus(slot.status) && slot.cost.frequency === "per-project" && paymentPlanFields(what, slot.startDate, slot.endDate, slot.paymentPlan, (next, dates) => onSlot({ paymentPlan: next, ...dates }), planTotalOf(slot.cost.price, slot.quantity))}

            </>
        );

    }

    /**
     * A STATUS ROW's ACTIVITY (the status Activity): a Name dropdown of the activities of this place that have not ended at the card's Start date -- each
     * with its category -- and "Other…", which makes a new activity (the only choice while there is none). The link symbol beside the name opens it. An
     * activity is an ordinary one: several cards can choose the same, and nothing is made or taken away when the status changes.
     */
    function activityRows(
        what: string,
        scope: Scope,
        key: string,
        ownerId: string,
        startDate: string,
        activityId: string,
        offeringIds: string[],
        apply: (base: BusinessCapabilityValue, activityId: string) => BusinessCapabilityValue
    ) {

        const all = scope === "offering" ? capability.offering.activities : capability.activities.flatMap(category => category.activities);
        const chosen = all.find(activity => activity.id === activityId);
        // Ended before the card starts: not offered (the one already chosen stays, so it can be seen and changed).
        const open = all.filter(activity => activity.id === activityId || !(startDate && activity.endDate && activity.endDate < startDate));
        const choices = uniqueChoices(
            open.map(activity => ({
                id: activity.id,
                name: activity.name.trim() || "Unnamed activity"
            })),
            "Unnamed activity"
        );

        return (
            <>

                <BusinessField label="Activity" side>
                    <div className="business-capability-performers">
                        <div className="business-capability-performer">
                            <OptionPicker
                                label={what + " activity"}
                                placeholder="Select"
                                fill="fit"
                                options={[...choices.map(choice => choice.label), ADD_ACTIVITY]}
                                disabled={disabled}
                                value={choices.find(choice => choice.id === activityId)?.label ?? ""}
                                onChange={(next) => {

                                    if (next !== ADD_ACTIVITY) {
                                        onChange(apply(capability, choices.find(choice => choice.label === next)?.id ?? ""), () => setNaming(current => {
                                            const kept = new Set(current);
                                            kept.delete(key);
                                            return kept;
                                        }));
                                        return;
                                    }

                                    const made = newActivityFor(scope, startDate, offeringIds, founders.filter(founder => founder.name.trim().length > 0).map(founder => founder.id), ownerId);
                                    onChange(apply(withActivity(capability, scope, made), made.id), () => setNaming(current => new Set(current).add(key)));

                                }}
                            />
                            {chosen && (
                                <LinkSymbol
                                    noun="Activity"
                                    name={chosen.name.trim() || "Unnamed activity"}
                                    onOpen={() => openPair(ownerId, chosen.id)}
                                />
                            )}
                        </div>
                    </div>
                </BusinessField>

                {/* (The name of an activity made here is written here, always: its own card shows it as a link back to this card.) */}
                {chosen && (naming.has(key) || chosen.madeBy === ownerId) && (
                    <BusinessText
                        label="Name the activity"
                        value={chosen.name}
                        disabled={disabled}
                        onChange={(next) => onChange(withActivityPatched(capability, chosen.id, { name: next }))}
                    />
                )}

            </>
        );

    }

    /**
     * A STATUS ROW's PARTNER OR SUPPLIER, in three steps: its Category (Partners or Suppliers), its Group (the type's fixed list in this place) and its
     * Name (the cards of that group, or a new card made with "Other…" in it). The link symbol beside the name opens the card; the row has no "Open ..."
     * line. A Category or Group picked after a name was chosen clears the name, which is no longer one of the list. A dropdown with one option is text.
     *
     * `key` names the row (the card's own id for the first status, the row's for a further one); `ownerId` is the card the link opens from.
     */
    function supplierRows(
        what: string,
        scope: Scope,
        key: string,
        ownerId: string,
        providerId: string,
        offeringIds: string[],
        apply: (base: BusinessCapabilityValue, providerId: string) => BusinessCapabilityValue
    ) {

        const all = [...partnersOf(scope, "professionals"), ...partnersOf(scope, "providers")];
        const chosen = all.find(partner => partner.id === providerId);
        const picked = cascade[key] ?? { category: "", group: "" };

        const category = chosen ? chosen.category : picked.category;
        const type = category === "partners" || category === "suppliers" ? category : undefined;

        const ungrouped = type ? all.filter(partner => partner.category === type && partner.group === "") : [];
        // The Group list holds every group of the place, Partners' first then Suppliers': the group chosen is what says which of the two the card is.
        const everyGroup = [
            ...BUSINESS_PARTNER_GROUPS[scope].partners.map(entry => ({ id: entry.id, label: entry.label, type: "partners" as const })),
            ...BUSINESS_PARTNER_GROUPS[scope].suppliers.map(entry => ({ id: entry.id, label: entry.label, type: "suppliers" as const }))
        ];
        const groupOptions = [
            ...everyGroup,
            // (Cards an earlier answer left with no group stay reachable.)
            ...(ungrouped.length > 0 ? [{ id: NO_GROUP, label: "No group", type: type ?? ("suppliers" as const) }] : [])
        ];
        const group = chosen
            ? (type ? chosen.group || NO_GROUP : "")
            : picked.group || soleGroupOf(groupOptions);

        const inGroup = type && group
            ? all.filter(partner => partner.category === type && (group === NO_GROUP ? partner.group === "" : partner.group === group))
            : [];
        const choices = uniqueChoices(inGroup, "Unnamed " + (type === "partners" ? "partner" : "supplier"));

        // A resource can also be provided BY THE WORKSPACE: the ONE type chosen on the Workspace form (Dedicated Workspace, ...), if any ("Other" is not a type).
        const workspaceKinds = [...new Set(workspacesOf(capability).map(workspace => workspace.kind))]
            .map(id => BUSINESS_WORKSPACE_KINDS.find(entry => entry.id === id && entry.id !== "other"))
            .filter((entry): entry is (typeof BUSINESS_WORKSPACE_KINDS)[number] => entry !== undefined);
        const labelTaken = new Set(choices.map(choice => choice.label));
        const offeredWorkspace = (type && group ? workspaceKinds : [])
            .map(kind => ({ id: WORKSPACE_PROVIDER + kind.id, label: kind.label }))
            .filter(choice => !labelTaken.has(choice.label));

        const viaWorkspace = providerId.startsWith(WORKSPACE_PROVIDER);
        const workspaceKind = viaWorkspace ? BUSINESS_WORKSPACE_KINDS.find(entry => entry.id === providerId.slice(WORKSPACE_PROVIDER.length)) : undefined;
        const workspaceCard = viaWorkspace
            ? workspacesOf(capability).find(entry => entry.kind === providerId.slice(WORKSPACE_PROVIDER.length)) ?? workspacesOf(capability)[0]
            : undefined;

        const owner = what + " supplier";
        const noun = type === "partners" ? "Partner" : "Supplier";

        /** Takes the chosen name away (a new Group asks for another), then does `after` once that is done (asked about first where a generated card would be left with no use). */
        const clearName = (after: () => void) => {
            if (providerId) {
                onChange(apply(capability, ""), after);
            } else {
                after();
            }
        };

        return (
            <>

                {categoryRow({
                    owner,
                    label: "Group",
                    allowNew: false,
                    info: type ? partnerGroupHelp(scope, type, group) : undefined,
                    key: key + ":supplier-group",
                    options: groupOptions,
                    value: groupOptions.find(entry => entry.id === group && (entry.id !== NO_GROUP || entry.type === type))?.label ?? "",
                    custom: undefined,
                    onPick: (id) => {
                        const entry = groupOptions.find(option => option.id === id);
                        if (entry && (id !== group || entry.type !== type)) {
                            clearName(() => setCascade(current => ({ ...current, [key]: { category: entry.type, group: id } })));
                        }
                    },
                    onNew: () => undefined,
                    onRename: () => undefined
                })}

                {((type && group) || viaWorkspace) && (
                    <BusinessField label={noun} side>
                        <div className="business-capability-performers">
                            <div className="business-capability-performer">
                                <OptionPicker
                                    label={what + " " + noun.toLocaleLowerCase()}
                                    placeholder="Select"
                                    fill="fit"
                                    options={[...choices.map(choice => choice.label), ...offeredWorkspace.map(choice => choice.label), OTHER_PARTNER]}
                                    disabled={disabled}
                                    value={viaWorkspace
                                        ? workspaceKind?.label ?? ""
                                        : [...choices, ...offeredWorkspace].find(choice => choice.id === providerId)?.label ?? ""}
                                    onChange={(next) => {

                                        if (next !== OTHER_PARTNER) {
                                            onChange(apply(capability, [...choices, ...offeredWorkspace].find(choice => choice.label === next)?.id ?? ""), () => setNaming(current => {
                                                const kept = new Set(current);
                                                kept.delete(key);
                                                return kept;
                                            }));
                                            return;
                                        }

                                        if (!type) {
                                            return;
                                        }

                                        // A new card, in the Category and Group picked above.
                                        const made: BusinessPartnerValue = {
                                            ...createBusinessPartner("", type),
                                            group: group === NO_GROUP ? "" : group,
                                            startDate: startOfCard(capability, ownerId) || todayIsoDate(),
                                            madeBy: ownerId,
                                            offeringIds: scope === "offering" ? [...offeringIds] : []
                                        };
                                        const stored = type === "suppliers" ? "providers" : "professionals";

                                        onChange(apply(
                                            withPartners(capability, scope, stored, [...partnersOf(scope, stored), made]),
                                            made.id
                                        ), () => setNaming(current => new Set(current).add(key)));

                                    }}
                                />
                                {chosen && (
                                    <LinkSymbol
                                        noun={partnerNoun(chosen.category)}
                                        name={chosen.name.trim() || "Unnamed " + partnerNoun(chosen.category).toLocaleLowerCase()}
                                        onOpen={() => openPair(ownerId, chosen.id)}
                                        title={"Open " + partnerNoun(chosen.category) + " “" + (chosen.name.trim() || "Unnamed") + "”" + (chosen.cost.price.trim() !== "" ? ", " + moneyFormatter(chosen.cost.currency || organisationCurrency)(parseAmount(chosen.cost.price) ?? 0) + " " + (BUSINESS_COST_FREQUENCIES.find(entry => entry.id === chosen.cost.frequency)?.label ?? "").toLowerCase() + " (priced on its card)" : "")}
                                    />
                                )}
                                {!chosen && workspaceCard && (
                                    <LinkSymbol noun="Workspace" name={workspaceKind?.label ?? "Workspace"} onOpen={() => openPair(ownerId, workspaceCard.id)} />
                                )}
                            </div>
                        </div>
                    </BusinessField>
                )}

                {chosen && naming.has(key) && (
                    <BusinessText
                        label={"Name the " + noun.toLocaleLowerCase()}
                        value={chosen.name}
                        disabled={disabled}
                        onChange={(next) => onChange(patchPartner(capability, chosen.id, { name: next }))}
                    />
                )}

            </>
        );

    }

    /**
     * A SPACE'S OR VEHICLE'S RENT: a Name dropdown limited to the ONE supplier group of the place (Property, Vehicles & Facilities in Infrastructure;
     * Landlords, Leasing & Warehouses in the Offering), with "Other…" to make a new card in it. That card holds the rent or the lease and its extras; the
     * link symbol beside the name opens it. (A supplier an earlier answer chose from another group stays chosen, and shown.)
     */
    function rentRow(
        what: string,
        scope: Scope,
        key: string,
        ownerId: string,
        providerId: string,
        offeringIds: string[],
        apply: (base: BusinessCapabilityValue, providerId: string) => BusinessCapabilityValue
    ) {

        const group = RENT_SUPPLIER_GROUP[scope];
        const all = [...partnersOf(scope, "professionals"), ...partnersOf(scope, "providers")];
        const chosen = all.find(partner => partner.id === providerId);
        const listed = all.filter(partner => partner.category === "suppliers" && partner.group === group);
        const choices = uniqueChoices(chosen && !listed.some(partner => partner.id === chosen.id) ? [...listed, chosen] : listed, "Unnamed supplier");

        return (
            <>

                <BusinessField label="Rent" side>
                    <div className="business-capability-performers">
                        <div className="business-capability-performer">
                            <OptionPicker
                                label={what + " rent"}
                                placeholder="Select"
                                fill="fit"
                                options={[...choices.map(choice => choice.label), OTHER_PARTNER]}
                                disabled={disabled}
                                value={choices.find(choice => choice.id === providerId)?.label ?? ""}
                                onChange={(next) => {

                                    if (next !== OTHER_PARTNER) {
                                        onChange(apply(capability, choices.find(choice => choice.label === next)?.id ?? ""), () => setNaming(current => {
                                            const kept = new Set(current);
                                            kept.delete(key);
                                            return kept;
                                        }));
                                        return;
                                    }

                                    // A new card of the one group.
                                    const made: BusinessPartnerValue = {
                                        ...createBusinessPartner("", "suppliers"),
                                        group,
                                        startDate: startOfCard(capability, ownerId) || todayIsoDate(),
                                            madeBy: ownerId,
                                        offeringIds: scope === "offering" ? [...offeringIds] : []
                                    };

                                    onChange(apply(withPartners(capability, scope, "providers", [...partnersOf(scope, "providers"), made]), made.id), () => setNaming(current => new Set(current).add(key)));

                                }}
                            />
                            {chosen && (
                                <LinkSymbol
                                    noun={partnerNoun(chosen.category)}
                                    name={chosen.name.trim() || "Unnamed " + partnerNoun(chosen.category).toLocaleLowerCase()}
                                    onOpen={() => openPair(ownerId, chosen.id)}
                                />
                            )}
                        </div>
                    </div>
                </BusinessField>

                {chosen && naming.has(key) && (
                    <BusinessText
                        label="Name the supplier"
                        value={chosen.name}
                        disabled={disabled}
                        onChange={(next) => onChange(patchPartner(capability, chosen.id, { name: next }))}
                    />
                )}

            </>
        );

    }

    /* ---------- 1. Resources ---------- */

    /** One recorded resource, wherever it is filed. */
    function resourceCard(
        scope: Scope,
        slot: BusinessResourceSlotValue,
        number: number,
        /** See statusFields: patches this slot inside a given value. */
        applySlot: (
            base: BusinessCapabilityValue,
            patch: Partial<BusinessResourceSlotValue>
        ) => BusinessCapabilityValue,
        onRemove: () => void
    ) {

        const onSlot = (patch: Partial<BusinessResourceSlotValue>) =>
            onChange(applySlot(capability, patch));

        // The group the card is filed in: an Infrastructure card's subsection, an Offering card's own.
        const groupId = scope === "offering"
            ? slot.group
            : Object.values(capability.resources).flat().find(subsection => subsection.slots.some(entry => entry.id === slot.id))?.id ?? "";

        return (
            <BusinessCard
                key={slot.id}
                anchor={slot.id}
                className="business-capability-slot"
                kind="Resource"
                number={number}
                name={slot.name}
                /* A card a Customer Channel made is AUTO-GENERATED: its name is shown, not asked (no name cell), and it has no x -- it is renamed
                   and removed only from the channel's cell on Customer Engagement. */
                onName={channelMade(scope, slot.id) ? undefined : (next) => onSlot({ name: next })}
                nameLink={channelMade(scope, slot.id) ? channelTitle(slot.id) : undefined}
                open
                disabled={disabled}
                actions={channelMade(scope, slot.id) ? undefined : (
                    <BusinessRemove
                        what={"Resource " + number}
                        disabled={disabled}
                        onRemove={onRemove}
                    />
                )}
            >

                {cardDates("Resource " + number, slot.startDate, slot.endDate, onSlot, false, latestPaymentOf(slot.cost.frequency, slot.paymentPlan), slot.cost.frequency === "per-project" && slot.paymentPlan.on)}

                {/* Its category and group (Infrastructure's resources): the group it is filed in and its subsection. */}
                {scope === "infrastructure" && resourceCategoryCells(slot)}
                {scope === "offering" && !channelMade(scope, slot.id) && offeringCategoryCells(slot, onSlot)}
                {scope === "offering" && channelMade(scope, slot.id) && channelCategoryText(slot)}

                {/* Status first; the Quantity only at Costs, where it
                    is what the cost is counted by (see statusFields). A
                    Quantity kept from another status is kept, hidden. */}
                {statusFields(
                    "Resource " + number, scope, slot,
                    resourceStatusIds(groupId),
                    applySlot,
                    // (A space is bought as one thing: it has no Qty.)
                    isSpaceOnlyGroup(groupId) ? undefined : {
                        /* How many, as a number: empty is one. What a
                           count cannot say ("3 tables, 6 shelving
                           units") belongs in the Description. 0 is kept
                           as typed, so the box does not change under
                           the caret, but counts as 1 and says so. */
                        field: (
                            <BusinessField label="Qty">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className="interview-input"
                                    aria-label={"Resource " + number + " quantity"}
                                    placeholder="1"
                                    disabled={disabled}
                                    value={slot.quantity}
                                    onChange={(event) => onSlot({
                                        quantity: limitedNumberText(businessQuantityText(event.target.value, slot.cost.unit), slot.quantity, NUMBER_LIMITS.quantity)
                                    })}
                                />
                            </BusinessField>
                        ),
                        note: parseDecimal(slot.quantity) === 0 ? (
                            <p className="business-capability-total">
                                A quantity must be more than 0. It is counted as 1.
                            </p>
                        ) : null
                    },
                    isPurchaseGroup(groupId),
                    groupId
                )}

                {/* Technical Support services that install this asset are part of its value (rule C2). */}
                {(() => {
                    const services = servicesOfAsset(capability, slot.id)
                        .filter(partner => (partner.cost.currency || organisationCurrency) === (slot.cost.currency || organisationCurrency) && parseAmount(partner.cost.price) !== null);
                    const own = parseAmount(slot.cost.price);
                    if (services.length === 0 || own === null) {
                        return null;
                    }
                    const value = own * (resourceUnitCount(slot.quantity, slot.cost.frequency, true) ?? 1)
                        + services.reduce((sum, partner) => sum + (parseAmount(partner.cost.price) ?? 0), 0);
                    return (
                        <p className="business-capability-total">
                            {"Value with its services: " + moneyFormatter(slot.cost.currency || organisationCurrency)(Math.round(value * 100) / 100)}
                        </p>
                    );
                })()}

                {/* A Deposit is the landlord's extra now; one an earlier answer left on a Premises card with no supplier stays here, to be moved or cleared. */}
                {groupId === PREMISES_GROUP_ID && slot.deposit.trim() !== "" && depositField(slot, onSlot)}

                {/* The lower rows of the groups that need them: how long an asset stays useful (an asset bought), a warranty (equipment), a contract's own rate. */}
                {/* (A card's useful life is not asked here: it is the group's, on Global Settings > Useful Life, where each asset's own years are set under its group.) */}
                {WARRANTY_GROUPS.includes(groupId) && warrantyField("Resource " + number, slot.warranty, slot.warrantyUntil, (patch) => onSlot(patch), slot.startDate)}
                {isCostingStatus(slot.status) && billingOf(scope, groupId, slot.costOption) === "percentage" && rateOverrideField("Resource " + number, slot.rateOverride, (next) => onSlot({ rateOverride: next }), defaultRateOf(slot.costOption))}
                {isCostingStatus(slot.status) && groupId === "royalties" && billingOf(scope, groupId, slot.costOption) === "lump-sum" && amortisationField("Resource " + number, slot.amortisationYears, (next) => onSlot({ amortisationYears: next }))}

                {/* The extras this card offers: a bought space's tax and charge, a bought vehicle's road tax, a person's Allowance, Commission and Bonus. */}
                {extrasFields("Resource " + number, slotExtraKeys(groupId, slot.status), slot.extras, slot.cost.currency || organisationCurrency, (next) => onSlot({ extras: next }))}

                <OptionalNote
                    label="Notes"
                    fieldId="Description / Relevant Information"
                    ariaLabel={"Resource " + number + " description"}
                    placeholder={noteHint(groupId)}
                    disabled={disabled}
                    value={slot.description}
                    onChange={(next) => onSlot({ description: next })}
                />

                {/* The links last, under the Description (the one card order). */}
                {scope === "offering" && offeringsField(
                    slot.offeringIds,
                    (next) => onSlot(next),
                    "Resource " + number + " linked Offerings",
                    <>
                        Define an Offering on the Foundation page first
                        {onOpenFoundation && (
                            <>
                                {": "}
                                <TextLink
                                    type="button"
                                    className="business-engagement-link"
                                    onClick={() => onOpenFoundation()}
                                >
                                    open it
                                </TextLink>
                            </>
                        )}
                        .
                    </>,
                    slot.offeringShares,
                    channelMade(scope, slot.id)
                )}

                {/* THE CARDS THIS ONE LEADS TO OR IS USED BY (the resource it insures, the activities that list it): at the end of the card. */}
                {linksSection(slot.id, resourceLinks(slot))}

            </BusinessCard>
        );
    }

    /** A resource card's box: its number and name, the status and the cost on one line. */
    function resourceBox(
        scope: Scope,
        slot: BusinessResourceSlotValue,
        number: number,
        applySlot: (
            base: BusinessCapabilityValue,
            patch: Partial<BusinessResourceSlotValue>
        ) => BusinessCapabilityValue,
        onRemove: () => void
    ): CardBox {
        return {
            id: slot.id,
            number,
            name: slot.name,
            unnamed: "Unnamed Resource",
            summary: summaryText(
                BUSINESS_RESOURCE_STATUSES.find(status => status.id === slot.status)?.label,
                costText(slot.cost, organisationCurrency ?? "")
            ),
            ...tileData(slot.id),
            content: () => resourceCard(scope, slot, number, applySlot, onRemove)
        };
    }

    /**
     * One subsection of a resource group -- Furniture, Internet,
     * Software -- and the slots recorded under it.
     *
     * The subsection is a CONTAINER: a founder records three chairs
     * and a desk under Furniture, not one answer called "Furniture".
     */
    function resourceSubsection(
        groupId: string,
        subsectionId: string,
        title: string,
        _help: string,
        slots: BusinessResourceSlotValue[],
        /**
         * For an "Other" subsection the founder added: its name is
         * theirs to write, in the head where a fixed subsection's
         * title is shown, and it can be removed. Null for the fixed
         * ones, whose names are the specification's.
         */
        own: {
            /** Says which Other this is: there can be several. */
            ariaLabel: string;
            onName: (next: string) => void;
            onRemove: () => void;
        } | null
    ) {

        /** This subsection's slots, replaced inside a given value. */
        const withSlots = (
            base: BusinessCapabilityValue,
            next: BusinessResourceSlotValue[]
        ): BusinessCapabilityValue => {

            const stored = base.resources[groupId] ?? [];

            const known = stored.some(entry => entry.id === subsectionId);

            return {
                ...base,
                resources: {
                    ...base.resources,
                    [groupId]: known
                        ? stored.map(entry => entry.id === subsectionId
                            ? { ...entry, slots: next }
                            : entry)
                        : [
                            ...stored,
                            {
                                id: subsectionId,
                                name: FIXED_KIND_IDS.has(subsectionId) ? "" : title,
                                slots: next
                            }
                        ]
                }
            };

        };

        const setSlots = (next: BusinessResourceSlotValue[]) =>
            onChange(withSlots(capability, next));

        return (
            <div
                className="business-capability-subsection"
                key={subsectionId}
                data-anchor={"subsection-" + groupId + "-" + subsectionId}
            >

                {/* A fixed subsection is named in the dialog's header (after a slash, with its "i"); only one the founder
                    added has a head of its own: its name box and its ×. */}
                {own && (
                    <div className="business-capability-subsection-head fold-group-head">

                        {/* NAMED WHERE IT IS READ, the way a card takes its name in its own head: the box sits where
                            the title of a fixed subsection does, so "Lighting" added under Workstation reads as one of
                            Furniture's kind. */}
                        <input
                            type="text"
                            className="interview-input business-capability-subsection-name"
                            aria-label={own.ariaLabel}
                            placeholder="Name this subsection"
                            disabled={disabled}
                            value={title}
                            onChange={(event) => own.onName(event.target.value)}
                        />

                        <BusinessRemove
                            what={title.trim() || "this unnamed subsection"}
                            disabled={disabled}
                            onRemove={own.onRemove}
                        />

                    </div>
                )}

                {/* The cards as closed square boxes (CardBoxes); an empty subsection opens on one blank card. */}
                <CardBoxes
                    label={title.trim() || "Resources"}
                    what="Resource"
                    items={slots.map((slot, position) => resourceBox(
                        "infrastructure",
                        slot,
                        position + 1,
                        (base, patch) => withSlots(base, slots.map(
                            entry => entry.id === slot.id ? { ...entry, ...patch } : entry
                        )),
                        () => setSlots(slots.filter(entry => entry.id !== slot.id))
                    ))}
                    add={{
                        label: "Resource",
                        disabled,
                        onAdd: () => {
                            const slot = createBusinessResourceSlot();
                            setSlots([...slots, slot]);
                            return slot.id;
                        },
                        isBlank: (id) => blankSlot(slots.find(entry => entry.id === id)),
                        onRemove: (ids) => setSlots(slots.filter(entry => !ids.includes(entry.id)))
                    }}
                />

            </div>
        );

    }

    /**
     * 3 to 6: a group's fixed subsections, any added, and the
     * button that adds one. Its title is drawn by the column that
     * holds it (see resourceColumn).
     */
    function resourceGroup(
        group: typeof BUSINESS_RESOURCE_GROUPS[number]
    ) {

        const stored = capability.resources[group.id] ?? [];

        const fixed = new Set<string>(group.kinds.map(kind => kind.id));

        const added = stored.filter(entry => !fixed.has(entry.id));

        const slotsOf = (id: string) =>
            stored.find(entry => entry.id === id)?.slots ?? [];

        /* SEVERAL SUBCATEGORIES, SO BOXES (SubcategoryBoxes): the dialog opens on
           a square box for each of the group's fixed subsections and any the
           founder added; a box shows that subsection's cards. */
        const items: SubcategoryBox[] = [

            ...group.kinds.map(kind => ({
                id: kind.id,
                title: withBreak(kind.label),
                anchor: "subsection-" + group.id + "-" + kind.id,
                holds: slotsOf(kind.id).map(slot => slot.id),
                empty: slotsOf(kind.id).length === 0,
                items: namesOf(slotsOf(kind.id), "Unnamed Resource"),
                alerts: slotsOf(kind.id).map(slot => missingById.get(slot.id)),
                itemMarks: slotsOf(kind.id).map(slot => ({ teal: channelToneIds.has(slot.id) })),
                crumbInfo: kind.help.length > 0 ? { label: kind.label, points: [kind.help] } : undefined,
                add: subAdd(group.id, kind.id),
                content: () => resourceSubsection(
                    group.id, kind.id, kind.label, kind.help,
                    slotsOf(kind.id), null
                )
            })),

            ...added.map((entry, index) => ({
                id: entry.id,
                title: entry.id === NO_GROUP ? "No group" : entry.name.trim() || "Unnamed Subsection",
                anchor: "subsection-" + group.id + "-" + entry.id,
                holds: entry.slots.map(slot => slot.id),
                empty: entry.slots.length === 0,
                blankUnnamed: entry.id !== NO_GROUP && !entry.name.trim() && entry.slots.length === 0,
                items: namesOf(entry.slots, "Unnamed Resource"),
                alerts: entry.slots.map(slot => missingById.get(slot.id)),
                itemMarks: entry.slots.map(slot => ({ teal: channelToneIds.has(slot.id) })),
                add: subAdd(group.id, entry.id),
                content: () => resourceSubsection(
                    group.id, entry.id,
                    entry.name,
                    "",
                    entry.slots,
                    {
                        ariaLabel: "Name of Other subsection " + (index + 1) +
                            " under " + group.label,
                        onName: (next) => update({
                            resources: {
                                ...capability.resources,
                                [group.id]: stored.map(candidate =>
                                    candidate.id === entry.id
                                        ? { ...candidate, name: next }
                                        : candidate)
                            }
                        }),
                        onRemove: () => update({
                            resources: {
                                ...capability.resources,
                                [group.id]: stored.filter(
                                    candidate => candidate.id !== entry.id
                                )
                            }
                        })
                    }
                )
            }))

        ];

        return (
            <SubcategoryBoxes
                label={group.label}
                items={items}
                /* The groups are a fixed list (the specification's): no "Other" tile adds one. */
                add={undefined}
            />
        );

    }

    /* ---------- 1. Founders ---------- */

    function founderCard(founder: BusinessFounderValue, index: number, always = false) {

        const change = (patch: Partial<BusinessFounderValue>) => update({
            founders: capability.founders.map(
                entry => entry.id === founder.id ? { ...entry, ...patch } : entry
            )
        });

        const responsibilities = businessFounderResponsibilities(
            capability, founder.id, legalExpenses
        );

        const tally = businessResponsibilitiesTally(responsibilities);

        /* The funnel: where a responsibility stands (Infrastructure, Offerings) and what it is (Activities; Resources and Legal have none yet). */
        const filterOff = responsibilityOff.get(founder.id) ?? new Set<string>();
        const KIND_OPTION = { activity: "Activities", partner: "Partners & Suppliers", supplier: "Partners & Suppliers", legal: "Legal" } as const;
        const shownResponsibilities = responsibilities.filter(entry => !filterOff.has(KIND_OPTION[entry.kind]) && (entry.scope === "legal" || !filterOff.has(entry.scope === "offering" ? "Offerings" : "Infrastructure")));

        /* COLLAPSED each time the dialog (or a founder's box) opens: FounderCards
           clears these folds on opening; toggling inside an open dialog works. */
        const responsibilitiesOpen = responsibilityFolds.get(founder.id) ?? false;

        const responsibilitiesId = "responsibilities-" + founder.id;

        const founderLabel = founder.name.trim() || "Founder " + (index + 1);

        const founderDelivery = founderDeliveryHours(founder);

        const workingHours = founderWorkingHours(founder);

        /* The salary and both hours are for the founder's one
           Frequency, a week, a month or a year; the capacity and the
           pay are always counted a month. */
        const period = founder.period || "month";
        const weekly = period === "week";
        const per = weekly ? "a week" : period === "year" ? "a year" : "a month";

        /* Hours in the period chosen; delivery hours never more
           than the working hours typed beside them. */
        const hoursLimit = weekly ? NUMBER_LIMITS.hoursWeek : period === "year" ? NUMBER_LIMITS.hoursYear : NUMBER_LIMITS.hoursMonth;
        const typedWorking = parseDecimal(founder.hours);
        const deliveryLimit = typedWorking !== null
            ? { ...hoursLimit, max: Math.min(hoursLimit.max, typedWorking) }
            : hoursLimit;

        /* Saved as a percent before delivery hours were asked for. */
        const legacyShare = founder.deliveryShare.trim() !== "" &&
            founder.deliveryHours.trim() === "";

        /* Named, added and removed on the Legal Entity page -- so
           the name is shown rather than asked, and there is no ×. */
        return (
            <BusinessCard
                key={founder.id}
                anchor={"founder-" + founder.id}
                kind="Founder"
                className={always ? "business-founder-open" + (capability.founders.length === 1 ? " business-founder-solo" : "") : undefined}
                number={index + 1}
                name={founder.name}
                open={always || folds.isOpen(founder.id)}
                onToggle={always ? undefined : () => folds.toggle(founder.id)}
                disabled={disabled}
                summary={summaryText(founder.roles[0])}
            >

                {cardDates(founderLabel, founder.startDate, "", change, true)}

                {/* Answered on the Founders Profile page, on the founder's own card --
                    shown here, not asked. No label: the roles are a BULLET list of their own
                    (named "Roles" for assistive technology), at the card's content edge. */}
                <div className="business-capability-stack business-founder-roles">

                    {founder.roles.length === 0
                        ? (
                            <BusinessEmpty>
                                No roles yet. Add them under 1. Identity System
                                → 4. Founders Profile → 1. Founders.
                            </BusinessEmpty>
                        )
                        : (
                            <BulletListStatic
                                label="Roles"
                                lines={founder.roles.map((role, position) => ({
                                    key: role + position,
                                    text: role
                                }))}
                            />
                        )}

                </div>

                {/* Pay and time, in the card's two columns (labels
                    above, tops level): Salary | Frequency, then
                    Working Hours | Delivery Hours. The one Frequency is the
                    period of all three -- a salary and hours a week, a
                    month or a year -- and every calculation turns them
                    into a month. The delivery hours are what 4.
                    Delivery under Offering's Capability adds up as the
                    capacity. A salary is paid in the organization's own
                    currency, so it is named in the label, not asked. */}
                <div className="business-founder-fields">
                <div className="business-founder-grid">

                    <BusinessField label={labelWithCurrency("Salary", organisationCurrency)} fieldId="salary">
                        <input
                            type="text"
                            inputMode="decimal"
                            className="interview-input"
                            aria-label={nameWithCurrency(founderLabel + " salary " + per, organisationCurrency)}
                            placeholder={"Salary " + per}
                            disabled={disabled}
                            value={founder.salary}
                            onChange={(event) => change({
                                salary: limitedNumberText(event.target.value, founder.salary, NUMBER_LIMITS.money)
                            })}
                        />
                    </BusinessField>

                    <BusinessField label="Frequency" info={DELIVERY_HELP.period} fieldId="frequency">
                        <OptionPicker
                            label={founderLabel + " frequency of salary and hours"}
                            placeholder="Monthly"
                            options={FOUNDER_FREQUENCIES.map(frequency => frequency.label)}
                            disabled={disabled}
                            value={FOUNDER_FREQUENCIES.find(frequency => frequency.id === (founder.period || "month"))?.label ?? "Monthly"}
                            onChange={(next) => change({
                                period: FOUNDER_FREQUENCIES.find(frequency => frequency.label === next)?.id ?? "month"
                            })}
                        />
                    </BusinessField>

                    <BusinessField label="Working Hours" info={DELIVERY_HELP.hours} fieldId="working-hours">
                        <input
                            type="text"
                            inputMode="decimal"
                            className="interview-input delivery-number"
                            aria-label={founderLabel + " working hours " + per}
                            placeholder={period === "week" ? "40" : period === "year" ? "2080" : "173"}
                            disabled={disabled}
                            value={founder.hours}
                            onChange={(event) => change({
                                hours: limitedNumberText(event.target.value, founder.hours, hoursLimit)
                            })}
                        />
                    </BusinessField>

                    <BusinessField label="Delivery Hours" info={DELIVERY_HELP.deliveryHours} fieldId="delivery-hours">
                        <input
                            type="text"
                            inputMode="decimal"
                            className="interview-input delivery-number"
                            aria-label={founderLabel + " delivery hours " + per}
                            placeholder={period === "week" ? "e.g. 22" : period === "year" ? "e.g. 1150" : "e.g. 96"}
                            disabled={disabled}
                            value={founder.deliveryHours}
                            onChange={(event) => {
                                const next = limitedNumberText(event.target.value, founder.deliveryHours, deliveryLimit);
                                /* Hours given directly replace the
                                   older percent: one answer, not two. */
                                change(next.trim() !== ""
                                    ? { deliveryHours: next, deliveryShare: "" }
                                    : { deliveryHours: next });
                            }}
                        />
                    </BusinessField>

                    {/* The older answer, a percent of working hours:
                        shown only while it is the one there is, so it
                        can still be read and converted. */}
                    {legacyShare && (
                        <BusinessField label="Delivering (%)" info={DELIVERY_HELP.share}>
                            <input
                                type="text"
                                inputMode="decimal"
                                className="interview-input delivery-number"
                                aria-label={founderLabel + " share of working hours spent delivering, percent"}
                                placeholder="60"
                                disabled={disabled}
                                value={founder.deliveryShare}
                                onChange={(event) => change({
                                    deliveryShare: businessDecimalText(event.target.value)
                                })}
                            />
                        </BusinessField>
                    )}

                </div>
                </div>

                {/* One short muted line, the share of the working hours the
                    delivery hours are -- the hours themselves are in the field
                    above. Nothing without working hours. A weekly or yearly
                    Frequency adds the month the capacity counts (not shown
                    elsewhere); a saved percent shows the hours it comes to. */}
                {founderDelivery !== null && (legacyShare || (workingHours !== null && workingHours > 0)) && (
                    <p className="delivery-muted business-founder-share">
                        <InfoText
                            text={legacyShare
                                ? "About " + formatHours(founderDelivery) + " hours a month for delivery"
                                : formatHours(Math.round(founderDelivery / (workingHours ?? 1) * 100)) + "% of working hours" +
                                    (weekly || period === "year" ? ", about " + formatHours(founderDelivery) + " a month" : "")}
                        >
                            {/* The weekly-to-monthly conversion just shown,
                                when that is the one given. */}
                            {!legacyShare && weekly && (
                                <InfoNote label="Hours a month" points={HOURS_PER_MONTH_HELP} />
                            )}
                        </InfoText>
                    </p>
                )}

                {/* The founder's optional Allowance, Commission and Bonus. */}
                {extrasFields(founderLabel, PEOPLE_EXTRA_KEYS, founder.extras, organisationCurrency, (next) => change({ extras: next }))}

                {/* Written by the activities that name this founder
                    as responsible, never typed here -- one fact, one
                    place. It folds, with the cards' own arrow, and
                    says how much of it is done ("3/15"), so
                    a long list can be put away. */}
                <div className="business-foundation-field">

                    <span className="business-foundation-label-info business-capability-responsibilities-head">

                        <span className="field-label business-foundation-label">
                            {responsibilities.length > 0 && (
                                <LabelArrow
                                    open={responsibilitiesOpen}
                                    label={(responsibilitiesOpen ? "Minimize " : "Maximize ") + "Responsibilities of " + founderLabel}
                                    onToggle={() => setResponsibilityFolds(current =>
                                        new Map(current).set(founder.id, !responsibilitiesOpen)
                                    )}
                                />
                            )}
                            <InfoText text="Responsibilities">
                                <InfoNote
                                    label="Responsibilities"
                                    points={SECTIONS.infrastructure.responsibilities}
                                    fullList
                                />
                            </InfoText>
                        </span>

                        {responsibilities.length > 0 && (
                            <span className="field-label field-label-muted business-capability-responsibilities-count">
                                {tally.completed + "/" + tally.total}
                            </span>
                        )}

                        {responsibilities.length > 0 && (
                            <ResponsibilityFilter
                                label={"Filter the Responsibilities of " + founderLabel}
                                off={filterOff}
                                onToggle={(option) => setResponsibilityOff(current => {
                                    const next = new Set(current.get(founder.id) ?? []);
                                    if (next.has(option)) { next.delete(option); } else { next.add(option); }
                                    return new Map(current).set(founder.id, next);
                                })}
                            />
                        )}

                    </span>

                    {responsibilities.length === 0
                        ? (
                            <BusinessEmpty>
                                Nothing yet. Make this founder responsible for an
                                activity under 2. Activities and it appears here.
                            </BusinessEmpty>
                        )
                        : responsibilitiesOpen && (() => {
                            /* What is still to do, numbered; what is
                               done, in its own Completed fold under it
                               -- folded at first, in the grey of the
                               Completed group under 2. Activities --
                               its numbers carrying on from the list's.
                               The order is the Activities'. */
                            const active = shownResponsibilities.filter(entry => !entry.completed);
                            const done = shownResponsibilities.filter(entry => entry.completed);
                            const doneKey = "responsibilities-done-" + founder.id;
                            const doneOpen = completedOpen.has(doneKey);
                            return (
                                <div id={responsibilitiesId}>
                                    {active.length > 0 && (
                                        <NumberedListStatic
                                            flush
                                            lines={active.map((entry, position) => ({
                                                key: entry.id + position,
                                                text: responsibilityLink(founder.id, entry, false)
                                            }))}
                                        />
                                    )}
                                    {done.length > 0 && (
                                        <div className="business-capability-completed">
                                            {/* The same row as Responsibilities': the label arrow, inside the label. */}
                                            <span className="business-foundation-label-info business-capability-responsibilities-head business-capability-completed-head">
                                                <span className="field-label business-foundation-label">
                                                    <LabelArrow
                                                        open={doneOpen}
                                                        label={(doneOpen ? "Minimize " : "Maximize ") + "completed responsibilities of " + founderLabel}
                                                        onToggle={() => setCompletedOpen(current => toggledIn(current, doneKey))}
                                                    />
                                                    {"Completed " + done.length}
                                                </span>
                                            </span>
                                            {doneOpen && (
                                                <div id={doneKey}>
                                                    <NumberedListStatic
                                                        flush
                                                        lines={done.map((entry, position) => ({
                                                            key: entry.id + position,
                                                            text: responsibilityLink(founder.id, entry, true),
                                                            className: "business-capability-responsibility-done"
                                                        }))}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                </div>

            </BusinessCard>
        );

    }

    /* ---------- 2. Payment plan ---------- */

    /** What a Per project card costs altogether: its price times its Qty (1 where it has none); null while the price is not typed. */
    /** The latest date a Per project card's payment plan pays on ("" while it has none, or it is not a plan). */
    function latestPaymentOf(frequency: string, plan: BusinessPaymentPlan): string {
        return frequency === "per-project" && plan.on ? plan.lines.reduce((latest, line) => line.date > latest ? line.date : latest, "") : "";
    }

    function planTotalOf(price: string, quantity: string): number | null {
        const unit = parseAmount(price);
        return unit === null ? null : Math.round(unit * Math.max(1, Number(quantity) || 1) * 100) / 100;
    }

    /**
     * THE PAYMENT PLAN of a Per project price: a tick (after the cost row), then its type -- Deposit & Balance, Instalments or Milestones -- and its
     * payments, each an amount, a percent and a date on one row (the amount and the percent are one figure: typing either sets the other). The percents
     * must total 100% or the card is incomplete. Not ticked, the price is paid in full on the Start date.
     * Deposit & Balance is two rows: the deposit on the Start date, the balance (what the deposit leaves) on its own date, else the End date. Instalments
     * have a one-digit number beside the type: it makes that many equal, numbered rows, dated evenly from the Start date to the End date (a new number
     * makes them again). Milestones are two rows each: the stage with a "+" (an x on any after the first), then its amount, percent and date.
     */
    function paymentPlanFields(
        what: string,
        startDate: string,
        endDate: string,
        plan: BusinessPaymentPlan,
        onNext: (next: BusinessPaymentPlan, dates?: { startDate?: string; endDate?: string }) => void,
        /** What the card costs altogether (the price times its Qty); null while the price is not typed: the amount cells then wait for it. */
        total: number | null
    ) {
        // While a plan is ticked the card's Start and End date are the earliest and the latest payment (they are not asked).
        const set = (patch: Partial<BusinessPaymentPlan>, dates?: { startDate?: string; endDate?: string }) => {
            const next = { ...plan, ...patch };
            const days = next.on ? paymentPlanLines(next, startDate, endDate).map(line => line.date).filter(Boolean).sort() : [];
            onNext(next, days.length > 0 ? { startDate: days[0], endDate: days[days.length - 1], ...dates } : dates);
        };
        const setLine = (id: string, patch: Partial<BusinessPaymentPlan["lines"][number]>) => set({ lines: plan.lines.map(line => line.id === id ? { ...line, ...patch } : line) });
        const sum = paymentPlanTotal(plan);
        const blank = () => ({ id: randomId("payment"), title: "", percent: "", date: "" });
        const choose = (type: string) => {
            if (type === "deposit-balance") {
                set({ type, count: "", lines: [{ ...blank(), percent: "50" }, { ...blank(), percent: "50" }] });
            } else if (type === "instalments") {
                set({ type, count: "", lines: [] });
            } else {
                set({ type, count: "", lines: [blank()] });
            }
        };
        // The number of Instalments: its rows are made again whenever it changes (what was typed in them is lost).
        const setCount = (count: string) => {
            const n = Number(count);
            if (count !== plan.count) {
                {
                const first = plan.lines[0]?.date || startDate || todayIsoDate();
                const last = plan.lines[plan.lines.length - 1]?.date || endDate || first;
                set(n >= 1 ? { count, lines: instalmentLines(n, first, last) } : { count: "", lines: [] });
            }
            }
        };
        const stepCount = (by: number) => setCount(String(Math.min(99, Math.max(1, (Number(plan.count) || 0) + by))));
        const amountOf = (percent: string) => total === null || parseAmount(percent) === null ? "" : String(Math.round(total * (parseAmount(percent) ?? 0)) / 100);
        // The percent and the amount of a payment are one figure written two ways: typing either sets the other. (The amount being typed is kept as typed.)
        const valueRow = (line: BusinessPaymentLine, label: string, order: string, mode: "free" | "balance" | "deposit" | "instalment", edge = true) => {
            const draft = amountDraft?.id === line.id ? amountDraft.text : null;
            const setPercent = (next: string) => {
                if (mode === "deposit") {
                    const rest = Math.round((100 - (Number(next) || 0)) * 100) / 100;
                    set({ lines: plan.lines.map((entry, position) => position === 0 ? { ...entry, percent: next } : { ...entry, percent: String(rest) }) });
                } else {
                    setLine(line.id, { percent: next });
                }
            };
            return (
                <div className={"business-capability-plan-row" + (order ? " business-capability-plan-row-numbered" : "")} key={line.id + ":values"}>
                    {order && <span className="business-capability-plan-order">{order}</span>}
                    <input
                        type="text"
                        inputMode="decimal"
                        className="interview-input business-capability-plan-amount"
                        aria-label={label + " amount"}
                        placeholder={total === null ? "Price?" : "0"}
                        disabled={disabled || total === null}
                        readOnly={mode === "balance"}
                        value={draft ?? amountOf(line.percent)}
                        onChange={(event) => {
                            const text = limitedNumberText(event.target.value, draft ?? amountOf(line.percent), NUMBER_LIMITS.money);
                            setAmountDraft({ id: line.id, text });
                            const amount = parseAmount(text);
                            setPercent(amount === null || total === null || total === 0 ? "" : String(Math.min(100, Math.round(amount / total * 10000) / 100)));
                        }}
                        onBlur={() => setAmountDraft(null)}
                    />
                    <input
                        type="text"
                        inputMode="decimal"
                        className="interview-input business-capability-plan-percent"
                        aria-label={label + " percent"}
                        placeholder="%"
                        disabled={disabled}
                        readOnly={mode === "balance"}
                        value={line.percent}
                        onChange={(event) => setPercent(limitedNumberText(event.target.value, line.percent, NUMBER_LIMITS.percent))}
                    />
                    <DateCellInput
                        ariaLabel={label + " date"}
                        // (No Start or End date bounds the payments: the payments are the card's dates. Instalments: the first and the last are written, the ones between follow them.)
                        disabled={disabled || (mode === "instalment" && !edge)}
                        value={paymentPlanLines(plan, startDate, endDate).find(entry => entry.id === line.id)?.date ?? ""}
                        onChange={(next) => {
                            setDateNotice(null);
                            setLine(line.id, { date: next });
                        }}
                    />
                </div>
            );
        };

        return (
            <>

                <BusinessField
                    label="Payment Plan"
                    inline
                    tick={{
                        on: plan.on,
                        // (A plan has dates to fall between: the card is given a Start and an End date -- today -- where it has none.)
                        onChange: (on) => {
                            const today = todayIsoDate();
                            const start = startDate || today;
                            set({ on }, on ? { ...(startDate === "" ? { startDate: start } : {}), ...(endDate === "" ? { endDate: start > today ? start : today } : {}) } : undefined);
                        },
                        disabled,
                        ariaLabel: what + " payment plan"
                    }}
                >
                    {plan.on && (
                        <div className="business-capability-plan-type">
                            {/* INSTALMENTS: how many (two digits, 1 to 99) stands beside the type; a number makes that many rows, and a new number makes them again. */}
                            {plan.type === "instalments" && (
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="interview-input business-capability-plan-count"
                                    aria-label={what + " number of instalments"}
                                    title="Number of instalments (1 to 99)"
                                    placeholder="No."
                                    disabled={disabled}
                                    value={plan.count}
                                    onChange={(event) => setCount(event.target.value.replace(/\D/g, "").slice(0, 2))}
                                    onKeyDown={(event) => {
                                        // The arrows count up and down (1 to 99).
                                        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                                            event.preventDefault();
                                            stepCount(event.key === "ArrowUp" ? 1 : -1);
                                        }
                                    }}
                                    onWheel={(event) => {
                                        // The wheel too, while the box has the cursor.
                                        if (document.activeElement === event.currentTarget && event.deltaY !== 0) {
                                            stepCount(event.deltaY < 0 ? 1 : -1);
                                        }
                                    }}
                                />
                            )}
                            <OptionPicker
                                label={what + " payment plan type"}
                                placeholder="Select"
                                hug
                                options={BUSINESS_PAYMENT_PLANS.map(entry => entry.label)}
                                disabled={disabled}
                                value={BUSINESS_PAYMENT_PLANS.find(entry => entry.id === plan.type)?.label ?? ""}
                                onChange={(next) => choose(BUSINESS_PAYMENT_PLANS.find(entry => entry.label === next)?.id ?? "")}
                            />
                        </div>
                    )}
                </BusinessField>

                {/* DEPOSIT & BALANCE: two rows, each an amount, a percent and a date; the balance is what the deposit leaves. */}
                {plan.on && plan.type === "deposit-balance" && plan.lines.slice(0, 2).map((line, at) => valueRow(line, what + " " + (at === 0 ? "deposit" : "balance"), "", at === 0 ? "deposit" : "balance"))}

                {/* INSTALMENTS: a row each, numbered. */}
                {plan.on && plan.type === "instalments" && plan.lines.map((line, at) => valueRow(line, what + " instalment " + (at + 1), (at + 1) + ".", "instalment", at === 0 || at === plan.lines.length - 1))}

                {/* MILESTONES: two rows each -- the stage, with the "+" (the first) or the x (any other) -- then its amount, percent and date. */}
                {plan.on && plan.type === "milestones" && plan.lines.flatMap((line, at) => {
                    const label = what + " milestone " + (at + 1);
                    return [
                        <div className="business-capability-plan-row business-capability-plan-stage" key={line.id + ":stage"}>
                            <input
                                type="text"
                                className="interview-input"
                                aria-label={label + " title"}
                                placeholder="Milestone"
                                disabled={disabled}
                                value={line.title}
                                onChange={(event) => setLine(line.id, { title: event.target.value.slice(0, 80) })}
                            />
                            {at === 0
                                ? (
                                    <button
                                        type="button"
                                        className="plus-box plus-box-small"
                                        aria-label={"Add milestone to " + what}
                                        title="Add milestone"
                                        disabled={disabled || plan.lines.length >= 20}
                                        onClick={() => set({ lines: [...plan.lines, blank()] })}
                                    />
                                )
                                : (
                                    <BusinessRemove
                                        cell
                                        what={label}
                                        disabled={disabled}
                                        onRemove={() => set({ lines: plan.lines.filter(entry => entry.id !== line.id) })}
                                    />
                                )}
                        </div>,
                        valueRow(line, label, "", "free")
                    ];
                })}

                {plan.on && plan.type !== "" && plan.lines.length > 0 && (
                    <p className={"business-capability-total" + (sum === 100 ? "" : " business-capability-alarm")}>
                        {sum === 100 ? "Total 100%" : "Total " + sum + "%: the payments must total 100%"}
                    </p>
                )}

                {plan.on && dateNotice !== null && dateNotice.owner === what && (
                    <p className="business-capability-total business-capability-alarm">{dateNotice.text}</p>
                )}

            </>
        );
    }

    /* ---------- 2. Extras ---------- */

    /**
     * THE EXTRAS of a card, one row each, all optional: the tick, then the figure (money in the card's currency, a percent, or a quantity) and, as plain text
     * beside it, how it is counted. Unticking clears the figure. Only a figure typed is kept.
     */
    function extrasFields(
        what: string,
        keys: readonly BusinessExtraKey[],
        extras: BusinessExtrasValue,
        currency: string,
        onNext: (next: BusinessExtrasValue) => void
    ) {
        const counted: Record<string, string> = {
            "monthly": "a month", "annually": "a year", "one-time": "", "per-unit": "each", "per-project": "a shipment",
            "percent-revenue": "% of Rev", "percent-cost": "% of cost"
        };
        return keys.map(key => {
            const definition = BUSINESS_EXTRAS[key];
            const value = extras[key] ?? "";
            const suffix = definition.kind === "money"
                ? [currency, key === "handling-pallet" ? "a pallet" : counted[definition.frequency]].filter(Boolean).join(" ")
                : definition.kind === "percent" ? counted[definition.frequency] : "units";
            return (
                <OptionalField
                    key={key}
                    label={definition.label}
                    filled={value !== ""}
                    onClear={() => onNext(Object.fromEntries(Object.entries(extras).filter(([name]) => name !== key)) as BusinessExtrasValue)}
                    disabled={disabled}
                >
                    <div className="business-capability-deposit-row">
                        <input
                            type="text"
                            inputMode={definition.kind === "quantity" ? "numeric" : "decimal"}
                            className="interview-input"
                            aria-label={what + " " + definition.label.toLowerCase()}
                            disabled={disabled}
                            value={value}
                            onChange={(event) => {
                                const next = definition.kind === "quantity"
                                    ? event.target.value.replace(/\D/g, "").slice(0, 7)
                                    : limitedNumberText(event.target.value, value, definition.kind === "percent" ? NUMBER_LIMITS.percent : NUMBER_LIMITS.money);
                                onNext({ ...extras, [key]: next });
                            }}
                        />
                        <span className="business-capability-deposit-currency">{suffix}</span>
                    </div>
                </OptionalField>
            );
        });
    }

    /* ---------- 2. Lower rows ---------- */

    /** How long the asset stays useful to the business, in years (not how long it lasts): it feeds the depreciation line. Optional. */
    /**
     * THE COST OPTION AND BILLING TYPE, above the cost row, on the groups that ask for a ready-made option (costOptionsOf): the option is chosen, and its
     * billing type (Percentage, Fixed amount or Lump sum) is read-only text; the option locks the Frequency. Nothing for a group with no options.
     */
    function costOptionRows(what: string, place: Scope, groupId: string, optionId: string, onPick: (optionId: string) => void, fixed = false) {
        const options = costOptionsOf(place, groupId);
        if (options.length === 0) {
            return null;
        }
        const billing = billingOf(place, groupId, optionId);
        const chosen = options.find(option => option.id === optionId)?.label ?? "";
        return (
            <>
                {/* A card a Customer Channel made files itself: its cost option is text where it is known. */}
                {fixed && chosen !== ""
                    ? (
                        <BusinessField label="Cost option" side>
                            <span className="business-capability-static-value" title={chosen}>{chosen}</span>
                        </BusinessField>
                    )
                    : <BusinessField label="Cost option" side>
                    <OptionPicker
                        label={what + " cost option"}
                        placeholder="Select"
                        fill="fit"
                        options={options.map(option => option.label)}
                        disabled={disabled}
                        value={options.find(option => option.id === optionId)?.label ?? ""}
                        onChange={(next) => onPick(options.find(option => option.label === next)?.id ?? "")}
                    />
                </BusinessField>}
                {billing !== "" && (
                    <BusinessField label="Billing type" side>
                        <span className="business-capability-static-value" title={BILLING_TYPES.find(entry => entry.id === billing)?.label}>{BILLING_TYPES.find(entry => entry.id === billing)?.label}</span>
                    </BusinessField>
                )}
            </>
        );
    }

    /** A warranty (information only, it locks nothing): its tick, and when it ticked, the day it lasts until in a Calendar beside it. Optional. */
    function warrantyField(what: string, on: boolean, until: string, onNext: (patch: Partial<BusinessResourceSlotValue>) => void, from = "") {
        return (
            <BusinessField
                label="Warranty"
                inline
                tick={{ on, onChange: (next) => onNext(next ? { warranty: true } : { warranty: false, warrantyUntil: "" }), disabled, ariaLabel: what + " warranty" }}
            >
                {on && (
                    <DateCellInput
                        ariaLabel={what + " warranty until"}
                        min={from || undefined}
                        disabled={disabled}
                        value={until}
                        onChange={(next) => onNext({ warrantyUntil: next })}
                    />
                )}
            </BusinessField>
        );
    }

    /** A contract's own rate, in place of the default one (a percent). Optional. */
    function amortisationField(what: string, value: string, onNext: (next: string) => void) {
        return (
            <BusinessField label="Amortisation period" side>
                <input
                    type="text"
                    inputMode="numeric"
                    className="interview-input business-capability-years"
                    aria-label={what + " amortisation period in years"}
                    placeholder="Years"
                    disabled={disabled}
                    value={value}
                    onChange={(event) => onNext(event.target.value.replace(/\D/g, "").slice(0, 3))}
                />
            </BusinessField>
        );
    }

    /** The default rate (a percent) of a cost option, from the Global Settings: what a Rate override replaces. */
    function defaultRateOf(optionId: string): string {
        switch (optionId) {
            case "royalty-on-sales": return globalSettings?.royaltyRate ?? "";
            case "affiliate-commission": return globalSettings?.affiliateRate ?? "";
            case "sales-agents": return globalSettings?.agentRate ?? "";
            default: return "";
        }
    }

    /** A Percentage option with no rate yet starts at the default rate of the Global Settings (the card's price is its rate). */
    function withDefaultRate(cost: BusinessCostValue, place: Scope, groupId: string, optionId: string): BusinessCostValue {
        const rate = defaultRateOf(optionId);
        return billingOf(place, groupId, optionId) === "percentage" && cost.price.trim() === "" && rate !== "" ? { ...cost, price: rate } : cost;
    }

    function rateOverrideField(what: string, value: string, onNext: (next: string) => void, defaultRate = "") {
        return (
            <OptionalField label="Rate override" inline filled={value.trim() !== ""} onClear={() => onNext("")} disabled={disabled}>
                <input
                    type="text"
                    inputMode="decimal"
                    className="interview-input business-capability-years"
                    aria-label={what + " rate override in percent"}
                    placeholder={defaultRate !== "" ? defaultRate + "%" : "%"}
                    disabled={disabled}
                    value={value}
                    onChange={(event) => onNext(limitedNumberText(event.target.value, value, NUMBER_LIMITS.percent))}
                />
            </OptionalField>
        );
    }

    /* ---------- 2. Deposit ---------- */

    /**
     * An optional Deposit on a bought Premises card, as it was on the Workspace form: its tick, then the amount box and the card's currency as plain text
     * (taken from the Price). One-time; an asset, never a cost (the Financial Foundation gathers it as an Establishment Deposit line). The landlord's own
     * extras come with the extras of the cards.
     */
    function depositField(slot: BusinessResourceSlotValue, onSlot: (patch: Partial<BusinessResourceSlotValue>) => void) {
        return (
            <OptionalField
                label="Deposit"
                filled={slot.deposit.trim() !== ""}
                onClear={() => onSlot({ deposit: "" })}
                disabled={disabled}
            >
                <div className="business-capability-deposit-row">
                    <input
                        type="text"
                        inputMode="decimal"
                        className="interview-input"
                        aria-label="Workspace deposit"
                        disabled={disabled}
                        value={slot.deposit}
                        onChange={(event) => onSlot({
                            deposit: limitedNumberText(event.target.value, slot.deposit, NUMBER_LIMITS.money)
                        })}
                    />
                    <span className="business-capability-deposit-currency">
                        {slot.cost.currency || organisationCurrency}
                    </span>
                </div>
            </OptionalField>
        );
    }

    /* ---------- 2. Activities ---------- */

    /**
     * START DATE AND END DATE, straight after the name of every card (a founder has a Start date only). The start is asked of every card;
     * the end is optional. Both are Calendars (DateCellInput) on a side-label row each, like the Status and the Responsible.
     */
    function cardDates(
        what: string,
        startDate: string,
        endDate: string,
        onDates: (patch: { startDate?: string; endDate?: string }) => void,
        startOnly = false,
        /** The latest date of the card's payment plan (a Per project card): the End date cannot be earlier. */
        latestPayment = "",
        /** The card has a payment plan: the plan's own dates stand in for the card's Start and End date, which are not asked. */
        planDriven = false
    ) {
        if (planDriven) {
            return null;
        }
        return (
            <>
                <BusinessField label="Start date" side>
                    <DateCellInput
                        ariaLabel={what + " start date"}
                        disabled={disabled}
                        value={startDate}
                        // (A Start after the End takes the End along with it: the End is never before the Start.)
                        onChange={(next) => onDates(next !== "" && endDate !== "" && next > endDate ? { startDate: next, endDate: next } : { startDate: next })}
                    />
                </BusinessField>
                {!startOnly && (
                    /* The End date is optional: a tick, and the date once it is ticked (unticking takes the date away). */
                    <BusinessField
                        label="End date"
                        side
                        tick={{
                            on: endDate !== "" || endTicked.has(what),
                            onChange: (on) => {
                                setEndTicked(current => {
                                    const next = new Set(current);
                                    if (on) {
                                        next.add(what);
                                    } else {
                                        next.delete(what);
                                    }
                                    return next;
                                });
                                if (!on && endDate !== "") {
                                    onDates({ endDate: "" });
                                }
                                // (Ticked, the End date is today -- or the Start date, where that is later.)
                                if (on && endDate === "") {
                                    const today = todayIsoDate();
                                    onDates({ endDate: startDate > today ? startDate : today });
                                }
                            },
                            disabled,
                            ariaLabel: what + " has an end date"
                        }}
                    >
                        {(endDate !== "" || endTicked.has(what)) && (
                            <DateCellInput
                                ariaLabel={what + " end date"}
                                disabled={disabled}
                                min={startDate || undefined}
                                value={endDate}
                                onChange={(next) => {
                                    if (next !== "" && latestPayment !== "" && next < latestPayment) {
                                        setDateNotice({ owner: what, text: "The End date cannot be earlier than the last payment of the plan (" + isoToDisplay(latestPayment, PreferencesService.getDateFormat()) + ")." });
                                        return;
                                    }
                                    setDateNotice(null);
                                    onDates({ endDate: next });
                                }}
                            />
                        )}
                    </BusinessField>
                )}
            </>
        );
    }


    /**
     * Who performs an activity: one picker per person, since an
     * activity can take several. A person already chosen is not
     * offered again, and a picker is added only once every one
     * shown has somebody in it.
     */
    /** The people a card holds, for the number box of a performer that stands for several. */
    const unitsCapOf = unitsCap;

    function performerFields(
        what: string,
        who: readonly { id: string; label: string }[],
        performerIds: string[],
        onNext: (next: string[]) => void,
        /** How many people each performer is ("" is one), by performer id. */
        people: Record<string, string> = {},
        onPeople?: (next: Record<string, string>) => void,
        /** How many people a performer's card holds (its Qty); a number box shows only for a card that holds several. */
        holds: Record<string, string> = {},
        /** A partner or supplier performer's card, by its id: the link symbol beside it opens that card (a founder has none). */
        links: Record<string, { noun: string; open: () => void }> = {}
    ) {

        // Always one picker, even before anybody is chosen.
        const rows = performerIds.length > 0 ? performerIds : [""];

        const canAdd = rows.every(id => id.length > 0) && rows.length < who.length;

        /* THE LABEL, THEN THE PICKER, on one line; the picker runs to the right edge of the name cell above (it is not limited to its
           longest option here), and at the x's own place, the x's size, stands the "+" that adds a performer (first row) or the x that takes
           this one away (every row after the first). A further performer's row repeats the picker and that place. */
        return (
            <>
            <BusinessField label="Performer" inline className="business-capability-performer-field">
                {who.length === 0
                    ? (
                        <BusinessEmpty>
                            Add a founder, or a partner under 3. Partners & Suppliers.
                        </BusinessEmpty>
                    )
                    : (
                        <div className="business-capability-performers">

                            {rows.map((id, position) => (
                                <div
                                    className="business-capability-performer"
                                    key={position}
                                >

                                    <OptionPicker
                                        label={what + " performer " + (position + 1)}
                                        placeholder="Select"
                                        fill="fit"
                                        options={who
                                            .filter(choice =>
                                                choice.id === id || !rows.includes(choice.id))
                                            .map(choice => choice.label)}
                                        disabled={disabled}
                                        value={who.find(choice => choice.id === id)?.label ?? ""}
                                        onChange={(next) => onNext(rows.map(
                                            (entry, at) => at === position
                                                ? who.find(choice => choice.label === next)?.id ?? ""
                                                : entry
                                        ))}
                                    />

                                    {/* A performer that stands for several people (a team): how many. */}
                                    {onPeople && id !== "" && (unitsCapOf(holds[id] ?? "") ?? 1) > 1 && (
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="interview-input business-capability-people"
                                            aria-label={what + " performer " + (position + 1) + " people"}
                                            placeholder="1"
                                            title="People"
                                            disabled={disabled}
                                            value={people[id] ?? ""}
                                            onChange={(event) => {
                                                const count = cappedUnits(event.target.value, holds[id] ?? "");
                                                onPeople(count === "" ? Object.fromEntries(Object.entries(people).filter(([key]) => key !== id)) : { ...people, [id]: count });
                                            }}
                                        />
                                    )}

                                    {/* (A partner or supplier: the link symbol; every row keeps its place, so the dropdowns end at one x.) */}
                                    {rows.some(entry => links[entry]) && (links[id]
                                        ? <LinkSymbol noun={links[id].noun} name={who.find(choice => choice.id === id)?.label ?? ""} onOpen={links[id].open} />
                                        : <span className="business-capability-row-spacer" aria-hidden="true" />)}

                                    {position > 0
                                        ? (
                                            <BusinessRemove
                                                cell
                                                what={what + " performer " + (position + 1)}
                                                disabled={disabled}
                                                onRemove={() => onNext(rows.filter(
                                                    (_, at) => at !== position
                                                ))}
                                            />
                                        )
                                        : canAdd
                                            ? (
                                                <button
                                                    type="button"
                                                    className="plus-box plus-box-small"
                                                    aria-label={"Add Performer to " + what}
                                                    title="Add Performer"
                                                    disabled={disabled}
                                                    onClick={() => onNext([...rows, ""])}
                                                />
                                            )
                                            : <span className="business-capability-performer-slot" aria-hidden="true" />}

                                </div>
                            ))}

                        </div>
                    )}
            </BusinessField>
            </>
        );

    }

    /**
     * Who is responsible. Chosen -- unless a rule already says who
     * (see businessAutoResponsibleId), in which case it is shown,
     * not asked, and the choice is kept for when the rule stops
     * applying.
     */
    function responsibilityField(
        automatic: string,
        current: string,
        onNext: (next: string) => void,
        info?: InfoPoint[],
        /** Which activity or partner this is, for assistive technology. */
        what?: string,
        /**
         * A partner's card: "Responsible", its label beside its picker in the short side-label
         * column (so it starts where a Resource card's Frequency picker does). Its field key stays
         * the one "Responsibility" made.
         */
        side = false,
        /**
         * The card's Responsible tick: `off` is its stored responsibleOff (absent = ticked);
         * unticking removes the field for the card -- the picker goes, the tick and label stay --
         * and the caller clears the stored choice.
         */
        responsible?: { off: boolean; onChange: (off: boolean) => void }
    ) {

        // A one-founder organisation has no Responsible field: he is responsible
        // (businessAutoResponsibleId, businessPartnerResponsibleId), nothing to show or choose.
        if (founderIds.length === 1) {
            return null;
        }

        // "Responsible" on an activity's card as on a partner's; the field key is
        // still the one "Responsibility" made, so nothing stored or linked changes.
        const label = "Responsible";
        const keyLabel = "Responsibility";

        const tick: BusinessFieldTick | undefined = responsible && {
            on: !responsible.off,
            onChange: (on) => responsible.onChange(!on),
            disabled,
            ariaLabel: what ? what + " has a responsible" : undefined
        };

        // The shared field (BusinessCardFields.tsx) where a card has the Responsible tick and nothing decides who is responsible by rule.
        if (responsible && automatic.length === 0 && founderChoices.length > 0) {
            return (
                <ResponsibleField
                    what={what ?? "Card"}
                    founders={founderChoices}
                    value={current}
                    off={responsible.off}
                    disabled={disabled}
                    info={info}
                    layout={side ? "side" : "inline"}
                    onChange={onNext}
                    onOff={responsible.onChange}
                />
            );
        }

        if (tick && !tick.on) {
            return (
                <BusinessField label={label} info={info} inline={!side} side={side} fieldId={keyLabel} tick={tick}>
                    {null}
                </BusinessField>
            );
        }

        if (automatic.length > 0) {
            return (
                <BusinessField label={label} info={info} inline={!side} side={side} fieldId={keyLabel} tick={tick}>
                    <span className="business-capability-automatic">
                        {founderChoices.find(choice => choice.id === automatic)?.label ?? ""}
                    </span>
                </BusinessField>
            );
        }

        return chooser(
            label,
            founderChoices,
            current,
            onNext,
            "Select",
            "Add a founder under 1. Identity System → 3. Legal Entity → 2. Founders & Ownership.",
            info,
            what ? what + " responsible" : undefined,
            !side,
            side,
            keyLabel,
            tick,
            true
        );

    }

    /** The parent's card, drawn as it is when opened, with the name of the box it belongs to. */
    function parentCard(id: string): { caption: string; scope: Scope; kind: "card" | "founder"; node: ReactNode } | null {
        const founderAt = founders.findIndex(founder => founder.id === id);
        if (founderAt >= 0) {
            return { caption: "Founders", scope: "infrastructure", kind: "card", node: founderCard(founders[founderAt], founderAt, true) };
        }
        for (const subsections of Object.values(capability.resources)) {
            for (const subsection of subsections) {
                const at = subsection.slots.findIndex(candidate => candidate.id === id);
                if (at >= 0) {
                    return {
                        // (The same title whichever way the card is opened: its section's, never its group's.)
                        caption: "Resources",
                        scope: "infrastructure",
                        kind: "card",
                        node: resourceCard("infrastructure", subsection.slots[at], at + 1, (base, patch) => patchSlot(base, id, patch), () => onChange(removeSlot(capability, id)))
                    };
                }
            }
        }
        const at = capability.offering.resources.findIndex(candidate => candidate.id === id);
        if (at < 0) {
            // An activity or a partner / provider on top (an activity's link to the partner who performs it, a partner's to the activities it performs).
            const other = childCard(id);
            if (!other) {
                return null;
            }
            const offeringOwn = capability.offering.activities.some(entry => entry.id === id) ||
                capability.offering.professionals.some(entry => entry.id === id) || capability.offering.providers.some(entry => entry.id === id);
            return { caption: other.caption, scope: offeringOwn ? "offering" : "infrastructure", kind: other.kind ?? "card", node: other.node };
        }
        return {
            caption: channelTileIds.has(id) ? "Channel Resources" : "Resources",
            scope: "offering",
            kind: "card",
            // (Numbered as its tile numbers it: in its own Group's list, or -- a card the Channel's own tile holds -- in that tile's.)
            node: resourceCard("offering", capability.offering.resources[at], offeringNumberOf(capability.offering.resources[at]), (base, patch) => patchSlot(base, id, patch), () => onChange(removeSlot(capability, id)))
        };
    }

    /** The child activity's card, with the name of the box it belongs to. */
    function childCard(id: string): { caption: string; node: ReactNode; kind?: "card" | "founder" } | null {
        for (const category of capability.activities) {
            if (category.activities.some(activity => activity.id === id)) {
                const node = activityCardFor("infrastructure", category.activities, (next) => setCategoryActivities(category.id, next), id);
                return node ? { caption: "Activities", node } : null;
            }
        }
        const node = activityCardFor("offering", capability.offering.activities, (next) => onChange({
            ...capability, offering: { ...capability.offering, activities: next }
        }), id);
        if (node) {
            return { caption: "Activities", node };
        }
        // A partner or provider a resource is connected to.
        for (const scope of ["infrastructure", "offering"] as const) {
            for (const show of ["own", "channel"] as const) {
                const card = partnerCardFor(scope, id, show);
                if (card) {
                    return { caption: show === "channel" ? "Channel Partners" : "Partners & Suppliers", node: card };
                }
            }
        }
        return null;
    }

    /**
     * THE CATEGORY CELL, the same on every card that has one (a Partner / Provider, an Activity): under the name, the label and the drop-down on one row;
     * the built-in categories, the ones the user made, and "Other…", which makes a new one (named in the box that appears; offered afterwards to every card).
     */
    function categoryRow(args: {
        owner: string;
        /** The cell's label (default "Category"). */
        label?: string;
        /** Whether "Other…" (a new one) is offered (default yes). */
        allowNew?: boolean;
        /** The help text of the chosen option (a partner or supplier group's), in the label's "i". */
        info?: string;
        key: string;
        options: readonly { id: string; label: string }[];
        value: string;
        custom: BusinessCategoryValue | undefined;
        onPick: (id: string) => void;
        onNew: (made: BusinessCategoryValue) => void;
        onRename: (name: string) => void;
    }) {
        // A dropdown with ONE option has nothing to choose: it stays a cell like the Category's, drawn as set (not to be pressed).
        const onlyOne = args.allowNew === false && args.options.length === 1;
        return (
            <>
                <BusinessField label={args.label ?? "Category"} side info={args.info ? [args.info] : undefined}>
                    <OptionPicker
                        label={args.owner + " " + (args.label ?? "Category").toLowerCase()}
                        placeholder="Select"
                        fill="fit"
                        options={[...args.options.map(entry => entry.label), ...(args.allowNew === false ? [] : [OTHER_PARTNER])]}
                        disabled={disabled || onlyOne}
                        value={onlyOne ? args.options[0].label : args.value}
                        onChange={(next) => {
                            if (next === OTHER_PARTNER) {
                                const made = { id: randomId("category"), name: "" };
                                args.onNew(made);
                                setNaming(current => new Set(current).add(args.key));
                                return;
                            }
                            setNaming(current => {
                                const kept = new Set(current);
                                kept.delete(args.key);
                                return kept;
                            });
                            args.onPick(args.options.find(entry => entry.label === next)?.id ?? "");
                        }}
                    />
                </BusinessField>

                {args.custom && (naming.has(args.key) || !args.custom.name.trim()) && (
                    <BusinessText
                        label={"Name the " + (args.label ?? "Category").toLowerCase()}
                        value={args.custom.name}
                        disabled={disabled}
                        onChange={args.onRename}
                    />
                )}
            </>
        );
    }

    /**
     * A RESOURCE'S CATEGORY AND GROUP (Infrastructure's resources): the category is the group it is filed in (Utilities, Workstation, Equipment, Digital
     * Infrastructure), the group its subsection (Electricity, Software ... or one the user made). Moving a card to another category files it in that
     * category's one group (else none yet). Its status follows the group it lands in (a space's Rent and Buy, another card's Partners & Suppliers and Costs).
     */
    function moveSlot(base: BusinessCapabilityValue, slotId: string, groupId: string, subId: string, made?: { id: string; name: string }): BusinessCapabilityValue {
        let found: BusinessResourceSlotValue | undefined;
        const without = Object.fromEntries(Object.entries(base.resources).map(([group, subsections]) => [
            group,
            subsections.map(subsection => {
                const slot = subsection.slots.find(entry => entry.id === slotId);
                if (slot) {
                    found = slot;
                }
                return slot ? { ...subsection, slots: subsection.slots.filter(entry => entry.id !== slotId) } : subsection;
            })
        ]));
        if (!found) {
            return base;
        }
        // The statuses follow the group: a space's or vehicle's Rent and Buy are another card's Partners & Suppliers and Costs, and the other way back.
        found = { ...found, status: statusInGroup(found.status, subId) };
        const target = without[groupId] ?? [];
        const has = target.some(subsection => subsection.id === subId);
        const placed = has
            ? target.map(subsection => subsection.id === subId ? { ...subsection, slots: [...subsection.slots, found!] } : subsection)
            : [...target, { id: subId, name: made ? made.name : "", slots: [found] }];
        const fixed = new Set<string>(BUSINESS_RESOURCE_GROUPS.flatMap(group => group.kinds.map(kind => kind.id)));
        const resources = Object.fromEntries(Object.entries({ ...without, [groupId]: placed }).map(([group, subsections]) => [
            group,
            subsections.filter(subsection => fixed.has(subsection.id) || subsection.slots.length > 0 || subsection.name.trim())
        ]));
        return { ...base, resources };
    }

    /** A card a Customer Channel made files itself: its Category and Group stand where the other cards' cells do, as text (nothing to choose). */
    function channelCategoryText(slot: BusinessResourceSlotValue) {
        const category = BUSINESS_OFFERING_RESOURCE_GROUPS.find(entry => entry.id === slot.category);
        const group = category?.kinds.find(kind => kind.id === slot.group);
        return (
            <>
                {category && (
                    <BusinessField label="Category" side>
                        <span className="business-capability-static-value" title={category.label}>{category.label}</span>
                    </BusinessField>
                )}
                {group && (
                    <BusinessField label="Group" side>
                        <span className="business-capability-static-value" title={group.label}>{group.label}</span>
                    </BusinessField>
                )}
            </>
        );
    }

    /** An Offering resource's Category and Group (its own fields; the lists are fixed): the Group is chosen once the Category is. */
    function offeringCategoryCells(slot: BusinessResourceSlotValue, onSlot: (patch: Partial<BusinessResourceSlotValue>) => void) {
        const owner = "Resource " + (slot.name.trim() || "");
        const category = BUSINESS_OFFERING_RESOURCE_GROUPS.find(entry => entry.id === slot.category);
        return (
            <>
                {categoryRow({
                    owner,
                    label: "Category",
                    allowNew: false,
                    key: slot.id + ":offering-category",
                    options: BUSINESS_OFFERING_RESOURCE_GROUPS.map(entry => ({ id: entry.id, label: entry.label })),
                    value: category?.label ?? "",
                    custom: undefined,
                    onPick: (id) => {
                        if (id && id !== slot.category) {
                            const group = soleGroupOf(offeringGroupsOf(id));
                            onSlot({ category: id, group, status: statusInGroup(slot.status, group) });
                        }
                    },
                    onNew: () => undefined,
                    onRename: () => undefined
                })}
                {category && categoryRow({
                    owner,
                    label: "Group",
                    allowNew: false,
                    key: slot.id + ":offering-group",
                    options: category.kinds.map(kind => ({ id: kind.id, label: kind.label })),
                    value: category.kinds.find(kind => kind.id === slot.group)?.label ?? "",
                    custom: undefined,
                    onPick: (id) => {
                        if (id && id !== slot.group) {
                            onSlot({ group: id, status: statusInGroup(slot.status, id) });
                        }
                    },
                    onNew: () => undefined,
                    onRename: () => undefined
                })}
            </>
        );
    }

    function resourceCategoryCells(slot: BusinessResourceSlotValue) {
        const home = Object.entries(capability.resources).flatMap(([groupId, subsections]) => subsections.map(subsection => ({ groupId, subsection })))
            .find(entry => entry.subsection.slots.some(candidate => candidate.id === slot.id));
        if (!home) {
            return null;
        }
        const category = BUSINESS_RESOURCE_GROUPS.find(group => group.id === home.groupId);
        const owner = "Resource " + (slot.name.trim() || "");
        // A card with no Category yet (a new one): the Category cell reads "Select"; choosing one files it there, still without a Group.
        if (!category) {
            return home.groupId !== NO_CATEGORY ? null : categoryRow({
                owner,
                label: "Category",
                allowNew: false,
                key: slot.id + ":resource-category",
                options: BUSINESS_RESOURCE_GROUPS.map(group => ({ id: group.id as string, label: group.label as string })),
                value: "",
                custom: undefined,
                onPick: (id) => {
                    const target = BUSINESS_RESOURCE_GROUPS.find(group => group.id === id);
                    if (target) {
                        onChange(moveSlot(capability, slot.id, target.id, soleGroupOf(target.kinds) || NO_GROUP));
                    }
                },
                onNew: () => undefined,
                onRename: () => undefined
            });
        }
        const stored = capability.resources[home.groupId] ?? [];
        const fixedKinds = new Set<string>(category.kinds.map(kind => kind.id));
        const groups = [
            ...category.kinds.map(kind => ({ id: kind.id, label: kind.label })),
            ...stored.filter(entry => !fixedKinds.has(entry.id) && entry.name.trim()).map(entry => ({ id: entry.id, label: entry.name.trim() }))
        ];
        const custom = stored.find(entry => entry.id === home.subsection.id && !fixedKinds.has(entry.id) && entry.id !== NO_GROUP);
        return (
            <>
                {categoryRow({
                    owner,
                    label: "Category",
                    allowNew: false,
                    key: slot.id + ":resource-category",
                    // (The Workspace is a category of resource cards like the others -- the FIRST: the card keeps its id, and the Workspace form's fields come into it.)
                    options: BUSINESS_RESOURCE_GROUPS.map(group => ({ id: group.id as string, label: group.label as string })),
                    value: category.label,
                    custom: undefined,
                    onPick: (id) => {
                        const target = BUSINESS_RESOURCE_GROUPS.find(group => group.id === id);
                        if (target && target.id !== home.groupId) {
                            // (Another Category: its Group is to be chosen again, but for the Workspace, which has one.)
                            onChange(moveSlot(capability, slot.id, target.id, soleGroupOf(target.kinds) || NO_GROUP));
                        }
                    },
                    onNew: () => undefined,
                    onRename: () => undefined
                })}
                {categoryRow({
                    owner,
                    label: "Group",
                    // (The groups are a fixed list: no "Other…" makes one.)
                    allowNew: false,
                    key: slot.id + ":resource-group",
                    options: groups,
                    value: groups.find(entry => entry.id === home.subsection.id)?.label ?? "",
                    custom: custom ? { id: custom.id, name: custom.name } : undefined,
                    onPick: (id) => {
                        if (id && id !== home.subsection.id) {
                            onChange(moveSlot(capability, slot.id, home.groupId, id));
                        }
                    },
                    onNew: (made) => onChange(moveSlot(capability, slot.id, home.groupId, made.id, made)),
                    onRename: (name) => onChange({
                        ...capability,
                        resources: { ...capability.resources, [home.groupId]: stored.map(entry => entry.id === home.subsection.id ? { ...entry, name } : entry) }
                    })
                })}
            </>
        );
    }

    /** A partner or provider patched wherever it is stored. */
    function patchPartner(base: BusinessCapabilityValue, id: string, patch: Partial<BusinessPartnerValue>): BusinessCapabilityValue {
        const map = (list: BusinessPartnerValue[]) => list.map(entry => entry.id === id ? { ...entry, ...patch } : entry);
        return {
            ...base,
            professionals: map(base.professionals),
            providers: map(base.providers),
            offering: { ...base.offering, professionals: map(base.offering.professionals), providers: map(base.offering.providers) }
        };
    }

    /**
     * THE CATEGORY OF A PARTNER OR PROVIDER, under its name: Partners, Providers, the categories the user made and "Other…", which makes a new one (named in
     * the box that appears). The categories are the organization's, shared by every card (Infrastructure's and Offering's). The same cell stands on the
     * Partner / Provider card and, below the Partner / Provider field, on a resource whose status is Partners & Suppliers.
     */
    function partnerCategoryCell(partner: BusinessPartnerValue, owner: string) {
        const options = [
            ...PARTNER_CATEGORIES.map(entry => ({ id: entry.id as string, label: entry.label as string })),
            ...capability.partnerCategories.filter(entry => entry.name.trim()).map(entry => ({ id: entry.id, label: entry.name.trim() }))
        ];
        const setCategory = (category: string, made?: BusinessCategoryValue) => {
            const place = capability.offering.professionals.some(entry => entry.id === partner.id) || capability.offering.providers.some(entry => entry.id === partner.id) ? "offering" : "infrastructure";
            const groups = category === "partners" || category === "suppliers" ? BUSINESS_PARTNER_GROUPS[place][category] : [];
            const moved = patchPartner(capability, partner.id, { category, group: soleGroupOf(groups) });
            const used = new Set([...moved.professionals, ...moved.providers, ...moved.offering.professionals, ...moved.offering.providers].map(entry => entry.category));
            // (A category the user made and never named, and no card uses, is dropped again.)
            onChange({
                ...moved,
                partnerCategories: [...capability.partnerCategories, ...(made ? [made] : [])].filter(entry => entry.name.trim() || used.has(entry.id))
            });
        };
        return categoryRow({
            owner,
            allowNew: false,
            key: partner.id + ":category",
            options,
            value: partnerCategoryLabel(capability.partnerCategories, partner.category),
            custom: capability.partnerCategories.find(entry => entry.id === partner.category),
            onPick: (id) => setCategory(id || partner.category),
            onNew: (made) => setCategory(made.id, made),
            onRename: (name) => onChange({
                ...capability,
                partnerCategories: capability.partnerCategories.map(entry => entry.id === partner.category ? { ...entry, name } : entry)
            })
        });
    }

    /** A partner or supplier's Group, under its Category: the type's fixed list in this place (a list of one is text). Nothing before the Category is a type. */
    function partnerGroupCell(scope: Scope, partner: BusinessPartnerValue, owner: string) {
        // (A category the user made in an earlier answer keeps its own Category cell.)
        if (capability.partnerCategories.some(entry => entry.id === partner.category)) {
            return null;
        }
        // Every group of the place, Partners' then Suppliers': the group picked says whether the card is a Partner or a Supplier.
        const options = (["partners", "suppliers"] as const).flatMap(type => BUSINESS_PARTNER_GROUPS[scope][type].map(entry => ({ id: entry.id, label: entry.label, type })));
        const current = options.find(entry => entry.type === partner.category && entry.id === partner.group);
        // A card a Customer Channel made files itself: its Group is text where it is known.
        if (channelMade(scope, partner.id) && current) {
            return (
                <BusinessField label="Group" side info={partnerGroupHelp(scope, partner.category, partner.group) ? [partnerGroupHelp(scope, partner.category, partner.group)] : undefined}>
                    <span className="business-capability-static-value" title={current.label}>{current.label}</span>
                </BusinessField>
            );
        }
        return categoryRow({
            owner,
            label: "Group",
            allowNew: false,
            info: partnerGroupHelp(scope, partner.category, partner.group) || undefined,
            key: partner.id + ":partner-group",
            options,
            value: current?.label ?? "",
            custom: undefined,
            onPick: (id) => {
                const picked = options.find(entry => entry.id === id);
                if (picked && picked !== current) {
                    onChange(patchPartner(capability, partner.id, { category: picked.type, group: picked.id }));
                }
            },
            onNew: () => undefined,
            onRename: () => undefined
        });
    }

    /**
     * THE CATEGORY OF AN ACTIVITY, under its name: the one it is filed in. Changing it files it in another (an Infrastructure activity moves to that category's
     * list, an Offering's carries the field). The same cell stands on the Activity card and, below the Status, on a resource that needs an activity or an
     * investigation (the category of the activity its status made).
     */
    function activityCategoryCell(scope: Scope, activity: BusinessActivityValue, owner: string) {
        const options = [
            ...activityGroupsOf(scope).map(entry => ({ id: entry.id as string, label: entry.label as string })),
            ...capability.activityCategories.filter(entry => entry.name.trim()).map(entry => ({ id: entry.id, label: entry.name.trim() }))
        ];
        const setCategory = (category: string, made?: BusinessCategoryValue) => {
            const moved = { ...activity, category };
            let next: BusinessCapabilityValue;
            if (scope === "offering") {
                next = { ...capability, offering: { ...capability.offering, activities: capability.offering.activities.map(entry => entry.id === activity.id ? moved : entry) } };
            } else {
                const emptied = capability.activities.map(container => ({ ...container, activities: container.activities.filter(entry => entry.id !== activity.id) }));
                const known = emptied.some(container => container.id === category);
                const named = (made ? made.name : capability.activityCategories.find(entry => entry.id === category)?.name) ?? "";
                next = {
                    ...capability,
                    activities: known
                        ? emptied.map(container => container.id === category ? { ...container, activities: [...container.activities, moved] } : container)
                        : [...emptied, { id: category, name: named, activities: [moved] }]
                };
            }
            const used = new Set([...next.activities.flatMap(container => container.activities), ...next.offering.activities].map(entry => entry.category));
            // (A category the user made and never named, and no activity is in, is dropped again.)
            onChange({
                ...next,
                activityCategories: [...capability.activityCategories, ...(made ? [made] : [])].filter(entry => entry.name.trim() || used.has(entry.id))
            });
        };
        return categoryRow({
            owner,
            label: "Group",
            allowNew: false,
            key: activity.id + ":category",
            options,
            value: activityCategoryLabel(capability.activityCategories, activity.category),
            custom: capability.activityCategories.find(entry => entry.id === activity.category),
            onPick: (id) => setCategory(id || activity.category),
            onNew: (made) => setCategory(made.id, made),
            onRename: (name) => onChange({
                ...capability,
                activityCategories: capability.activityCategories.map(entry => entry.id === activity.category ? { ...entry, name } : entry),
                activities: capability.activities.map(container => container.id === activity.category ? { ...container, name } : container)
            })
        });
    }

    /**
     * THE ONE LINE THAT LEADS TO A RELATED CARD, the same on every card (a resource's to its provider, a provider's to the resources and activities that use
     * it, an activity's to the partners who perform it): "Open Provider “Name”", the name a real link, one line cut by an ellipsis, the whole text its tooltip;
     * a click opens that card with this one (openPair: this card above, that one below).
     */
    function cardLink(key: string, noun: string, name: string, onOpen: () => void, title?: string) {
        return (
            <p
                key={key}
                className="business-capability-activity-line business-capability-card-link"
                title={title ?? "Open " + noun + " “" + name + "”"}
            >
                {/* The kind as its first letter (R. Resource, A. Activity, P. Partner, S. Supplier), then the name as the link. */}
                <span className="business-capability-card-link-kind" aria-hidden="true">{noun.charAt(0).toUpperCase() + "."}</span>
                <TextLink type="button" className="business-capability-link" aria-label={"Open " + noun + " “" + name + "”"} onClick={onOpen}>
                    {name}
                </TextLink>
            </p>
        );
    }

    /** The cards a resource's card links to, apart from its supplier and its activity (those have their symbol beside their picker): the resource a generated Insurances card insures, and the activities that list it. */
    function resourceLinks(slot: BusinessResourceSlotValue): { key: string; noun: string; name: string; onOpen: () => void }[] {
        const insured = slot.insuresId !== ""
            ? [...Object.values(capability.resources).flat().flatMap(entry => entry.slots), ...capability.offering.resources].find(entry => entry.id === slot.insuresId)
            : undefined;
        return [
            ...(insured ? [{ key: slot.id + ":insures", noun: "Resource", name: insured.name.trim() || "Unnamed Resource", onOpen: () => openPair(slot.id, insured.id) }] : []),
            ...[...capability.activities.flatMap(category => category.activities), ...capability.offering.activities]
                .filter(activity => activity.resources.some(entry => entry.id === slot.id))
                .map(activity => ({ key: activity.id, noun: "Activity", name: activity.name.trim() || "Unnamed Activity", onOpen: () => openPair(activity.id, slot.id) }))
        ];
    }

    /** The "Open ..." lines of a card, last in it: one is the line itself; several are a folded section named Links (collapsed, its count beside it). */
    function linksSection(id: string, links: readonly { key: string; noun: string; name: string; onOpen: () => void }[]) {
        if (links.length === 0) {
            return null;
        }
        if (links.length === 1) {
            return <>{cardRule()}{cardLink(links[0].key, links[0].noun, links[0].name, links[0].onOpen)}</>;
        }
        const open = linksOpen.has(id);
        return (
            <>
            {cardRule()}
            <div className="business-foundation-field business-capability-links">
                {/* The same row as a founder's Responsibilities: the fold arrow, the label, how many. */}
                <span className="business-foundation-label-info business-capability-responsibilities-head business-capability-links-head">
                    <span className="field-label business-foundation-label">
                        <LabelArrow open={open} label={(open ? "Minimize " : "Maximize ") + "Links of this card"} onToggle={() => setLinksOpen(current => toggledIn(current, id))} />
                        Links
                    </span>
                    <span className="field-label field-label-muted business-capability-responsibilities-count">{links.length}</span>
                </span>
                {open && <div className="business-capability-links-list">{links.map(link => cardLink(link.key, link.noun, link.name, link.onOpen))}</div>}
            </div>
            </>
        );
    }

    /** A dividing line across the card: above its Completed row and above the links at its foot. */
    function cardRule() {
        return <div className="business-capability-card-rule" role="separator" />;
    }

    /** A line of a founder's Responsibilities: a link that opens the activity's card (under the founder's), with a tile list item's reaction. */
    function responsibilityLink(founderId: string, entry: { id: string; name: string; kind?: "activity" | "partner" | "supplier" | "legal" }, done: boolean) {
        const letter = entry.kind === "partner" ? "P." : entry.kind === "supplier" ? "S." : entry.kind === "legal" ? "L." : "A.";
        return (
            <span className={"business-capability-responsibility-line" + (done ? " business-capability-responsibility-line-done" : "")}>
                {/* The kind as its first letter, as on the other cards' links (A. Activity). */}
                <span className="business-capability-card-link-kind" aria-hidden="true">{letter}</span>
                <TextLink
                    type="button"
                    className="business-capability-responsibility-link"
                    title={"Open “" + entry.name + "”"}
                    onClick={() => entry.kind === "legal" ? openLegalExpense(entry.id) : openPair(founderId, entry.id)}
                >
                    {entry.name}
                </TextLink>
            </span>
        );
    }

    /** A legal expense belongs to the Identity System: its page opens, and the card with it. */
    function openLegalExpense(id: string) {
        // (Where this page can save the Legal Entity's answer, the card floats here: over the page, as every card.)
        if (legalEntity !== undefined && onChangeLegalEntity) {
            document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: "legal-entity-expenses", card: id } }));
            return;
        }
        onOpenLegalEntity?.();
        window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: "legal-entity-expenses", card: id } })), 700);
    }

    /** Opens a parent and its child together, stacked, over whatever is open (Back returns to it). */
    function openPair(parentId: string, childId: string) {
        // (Over what is open: Back returns to it; Escape closes every layer.)
        setPair({ parentId, childId });
    }

    /** An activity's box: its number and name, who is responsible (else the first line of its description). */
    function activityBox(
        scope: Scope,
        activity: BusinessActivityValue,
        number: number,
        onActivity: (patch: Partial<BusinessActivityValue>) => void,
        onRemove: () => void
    ): CardBox {

        /* Who is responsible, resolved the same way responsibilityField
           shows it: the automatic rule when one applies, else the
           founder chosen -- always among founderChoices, never a
           partner (see responsibilityField). */
        const resolvedResponsibleId = responsibleIsOff(activity) ? "" :
            businessAutoResponsibleId(founderIds, activity.performerIds) ||
            activity.responsibleId;

        // A one-founder organisation shows no Responsible anywhere: he is responsible, so a box does not say so.
        const responsibleName = founderIds.length === 1 ? "" : founderChoices.find(
            choice => choice.id === resolvedResponsibleId
        )?.label ?? "";

        return {
            id: activity.id,
            number,
            name: activity.name,
            unnamed: "Unnamed Activity",
            summary: responsibleName || activity.description.split("\n")[0]?.trim() || "",
            inactive: activity.completed,
            ...tileData(activity.id),
            content: () => activityRow(scope, activity, number, onActivity, onRemove)
        };

    }

    /** What a partner or supplier card costs (its price times its units); null while it has no price. */
    function partnerAmount(partner: BusinessPartnerValue): { amount: number; currency: string } | null {
        const price = parseAmount(partner.cost.price);
        if (price === null) {
            return null;
        }
        const factor = resourceUnitCount(partner.quantity, partner.cost.frequency) ?? 1;
        return { amount: Math.round(price * factor * 100) / 100, currency: partner.cost.currency || organisationCurrency };
    }

    /** The costs of the partners and suppliers an activity names as Performers, one line each, after the last performer. */
    function performerCosts(scope: Scope, activity: BusinessActivityValue) {
        const all = [...partnersOf(scope, "professionals"), ...partnersOf(scope, "providers")];
        const named = activity.performerIds.map(id => all.find(partner => partner.id === id)).filter((partner): partner is BusinessPartnerValue => partner !== undefined);
        if (named.length === 0) {
            return null;
        }
        return (
            <div className="business-capability-resource-costs">
                {named.map(partner => {
                    const own = partnerAmount(partner);
                    return (
                        <p className="business-capability-total business-capability-cost-line" key={partner.id}>
                            <span className="business-capability-cost-name" title={partner.name.trim() || "Unnamed partner"}>{partner.name.trim() || "Unnamed partner"}</span>
                            <span className="business-capability-cost-amount">{own ? moneyFormatter(own.currency)(own.amount) : "no price yet"}</span>
                        </p>
                    );
                })}
            </div>
        );
    }

    /**
     * THE RESOURCES an activity uses: a tick after the Performer opens the resources of its place, each with the units of it the activity takes when it has
     * units (a Per unit price: 3 hours, 40 km). A linked card that begins after the activity ends is said so. After the last, the cost they come to: Cost,
     * or Total when more than two linked cards carry a value.
     */
    function activityResources(
        scope: Scope,
        activity: BusinessActivityValue,
        number: number,
        onActivity: (patch: Partial<BusinessActivityValue>) => void
    ) {
        const candidates = scope === "offering"
            ? capability.offering.resources
            : Object.values(capability.resources).flat().flatMap(subsection => subsection.slots);
        const what = "Activity " + number;
        const nameOf = (slot: BusinessResourceSlotValue) => slot.name.trim() || "Unnamed Resource";
        const rows = activity.resources.length > 0 ? activity.resources : [{ id: "", units: "" }];
        const linked = activity.resources.filter(entry => candidates.some(slot => slot.id === entry.id));
        const late = resourcesStartingTooLate(activity, Object.fromEntries(candidates.map(slot => [slot.id, slot.startDate])), linked);
        const canAdd = rows.every(entry => entry.id !== "") && rows.length < candidates.length;
        const anyUnits = rows.some(entry => candidates.find(candidate => candidate.id === entry.id)?.cost.frequency === "per-unit");
        const setRows = (next: { id: string; units: string }[]) => onActivity({ resources: next });

        // What each linked card comes to for this activity: its price times the units taken (a Per unit price) or its quantity.
        const amountOf = (entry: { id: string; units: string }): { amount: number; currency: string } | null => {
            const slot = candidates.find(candidate => candidate.id === entry.id);
            const price = slot ? parseAmount(slot.cost.price) : null;
            if (!slot || price === null) {
                return null;
            }
            const factor = slot.cost.frequency === "per-unit"
                ? parseDecimal(entry.units) ?? 1
                : resourceUnitCount(slot.quantity, slot.cost.frequency) ?? 1;
            return { amount: Math.round(price * factor * 100) / 100, currency: slot.cost.currency || organisationCurrency };
        };
        // A resource that a partner or supplier provides brings that partner's cost, under its own line.
        const providerOf = (entry: { id: string }) => {
            const slot = candidates.find(candidate => candidate.id === entry.id);
            return slot && slot.status === "partners-suppliers" && slot.providerId
                ? [...partnersOf(scope, "professionals"), ...partnersOf(scope, "providers")].find(partner => partner.id === slot.providerId)
                : undefined;
        };
        const providerValues = linked.flatMap(entry => { const partner = providerOf(entry); return partner ? partnerAmount(partner) ?? [] : []; });
        const values = [...linked.flatMap(entry => amountOf(entry) ?? []), ...providerValues];
        const sameCurrency = values.length > 0 && values.every(value => value.currency === values[0].currency);
        const sum = Math.round(values.reduce((total, value) => total + value.amount, 0) * 100) / 100;

        return (
            <>
            <OptionalField
                label="Resources"
                inline
                filled={activity.resources.some(entry => entry.id !== "")}
                onClear={() => onActivity({ resources: [] })}
                disabled={disabled}
            >
                {candidates.length === 0
                    ? <BusinessEmpty>Add resources under 1. Resources first.</BusinessEmpty>
                    : (
                        <div className="business-capability-performers business-capability-resource-rows">
                            {rows.map((entry, position) => {
                                const slot = candidates.find(candidate => candidate.id === entry.id);
                                const hasUnits = slot !== undefined && slot.cost.frequency === "per-unit";
                                return (
                                    <div className="business-capability-performer business-capability-resource-row" key={position}>
                                        <OptionPicker
                                            label={what + " resource " + (position + 1)}
                                            placeholder="Select"
                                            fill="fit"
                                            options={candidates
                                                .filter(candidate => candidate.id === entry.id || !rows.some(row => row.id === candidate.id))
                                                .map(nameOf)}
                                            disabled={disabled}
                                            value={slot ? nameOf(slot) : ""}
                                            onChange={(next) => setRows(rows.map((row, at) => at === position
                                                ? { id: candidates.find(candidate => nameOf(candidate) === next)?.id ?? "", units: "" }
                                                : row))}
                                        />
                                        {/* The units of it the activity takes, shown beside a resource that has units, never more than it has. */}
                                        {/* (Every row keeps the places of the units and of the link, so the dropdowns end at one x.) */}
                                        {anyUnits && !hasUnits && <span className="business-capability-row-spacer business-capability-row-spacer-units" aria-hidden="true" />}
                                        {slot && hasUnits && (
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                className="interview-input business-capability-people"
                                                aria-label={what + " units of " + nameOf(slot)}
                                                placeholder="1"
                                                title={slot.cost.unit || "unit"}
                                                disabled={disabled}
                                                value={entry.units}
                                                onChange={(event) => setRows(rows.map((row, at) => at === position ? { ...row, units: cappedUnits(event.target.value, slot.quantity) } : row))}
                                            />
                                        )}
                                        {slot
                                            ? <LinkSymbol noun="Resource" name={nameOf(slot)} onOpen={() => openPair(activity.id, slot.id)} />
                                            : <span className="business-capability-row-spacer" aria-hidden="true" />}
                                        {position > 0
                                            ? (
                                                <BusinessRemove
                                                    cell
                                                    what={what + " resource " + (position + 1)}
                                                    disabled={disabled}
                                                    onRemove={() => setRows(rows.filter((_, at) => at !== position))}
                                                />
                                            )
                                            : canAdd
                                                ? (
                                                    <button
                                                        type="button"
                                                        className="plus-box plus-box-small"
                                                        aria-label={"Add Resource to " + what}
                                                        title="Add Resource"
                                                        disabled={disabled}
                                                        onClick={() => setRows([...rows, { id: "", units: "" }])}
                                                    />
                                                )
                                                : <span className="business-capability-performer-slot" aria-hidden="true" />}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                {late.map(id => (
                    <p className="business-capability-total business-capability-alarm" key={id}>
                        {nameOf(candidates.find(slot => slot.id === id) as BusinessResourceSlotValue) + " begins after this activity ends."}
                    </p>
                ))}
            </OptionalField>
            {/* The cost of each linked resource and their total: from the left edge of the card's name cell to its right edge (the card's whole content width). */}
            {linked.length > 0 && (
                <div className="business-capability-resource-costs">
                {/* The estimated cost of EVERY linked card, one line each (a card with no price yet says so); with two or more costs, then the sum. */}
                {linked.map(entry => {
                    const own = amountOf(entry);
                    const slot = candidates.find(candidate => candidate.id === entry.id);
                    const partner = providerOf(entry);
                    const partnerCost = partner ? partnerAmount(partner) : null;
                    return slot
                        ? (
                            <Fragment key={entry.id}>
                                <p className="business-capability-total business-capability-cost-line"><span className="business-capability-cost-name" title={nameOf(slot)}>{nameOf(slot)}</span><span className="business-capability-cost-amount">{own ? moneyFormatter(own.currency)(own.amount) : "no price yet"}</span></p>
                                {partner && <p className="business-capability-total business-capability-cost-line business-capability-cost-sub"><span className="business-capability-cost-name" title={partner.name.trim()}>{partner.name.trim() || "Unnamed partner"}</span><span className="business-capability-cost-amount">{partnerCost ? moneyFormatter(partnerCost.currency)(partnerCost.amount) : "no price yet"}</span></p>}
                            </Fragment>
                        )
                        : null;
                })}
                {sameCurrency && values.length > 1 && (
                    <p className="business-capability-total business-capability-cost-line business-capability-cost-total">
                        <span className="business-capability-cost-name">Total</span>
                        <span className="business-capability-cost-amount">{moneyFormatter(values[0].currency)(sum)}</span>
                    </p>
                )}
                </div>
            )}
            </>
        );
    }

    /** An activity's card, drawn only while its box is open (CardBoxes): always open, no fold arrow. */
    function activityRow(
        scope: Scope,
        activity: BusinessActivityValue,
        number: number,
        onActivity: (patch: Partial<BusinessActivityValue>) => void,
        onRemove: () => void
    ) {

        const who = performerChoices(scope);

        const categoryCell = activityCategoryCell(scope, activity, "Activity " + number);

        // A finished activity is FROZEN: nothing in it can be changed -- but its Completed tick, so it can be unticked (which unfreezes it
        // and files it back in its category).
        const frozen = activity.completed;

        /* The head of a card that does not fold (BusinessCard's): number, name, remove. */
        // The card whose status made this activity, while it is still there and still chooses it.
        const madeFrom = activity.madeBy !== ""
            ? [...Object.values(capability.resources).flat().flatMap(entry => entry.slots), ...capability.offering.resources]
                .filter(slot => slot.id === activity.madeBy && (slot.activityId === activity.id || (slot.extraStatuses ?? []).some(row => row.activityId === activity.id)))
                .map(slot => ({ id: slot.id, name: (slot.name.trim() || "Unnamed Resource") }))[0]
            : undefined;

        const head = (
            <div className="business-capability-activity-head strategy-box-head">

                <CardNumber number={number} />

                {madeFrom
                    ? (
                        /* Made by a card's Activity status: its name is written on that card, and here it is a link to it (as a Customer Channel's card is). */
                        <TextLink
                            type="button"
                            className="business-capability-child-name"
                            title={"Open " + madeFrom.name}
                            aria-label={"Open " + madeFrom.name}
                            onClick={() => openPair(activity.id, madeFrom.id)}
                        >
                            {activity.name.trim() || "Unnamed activity"}
                        </TextLink>
                    )
                    : (
                        <CardNameInput
                            ariaLabel={"Activity " + number + " name"}
                            placeholder="Activity name"
                            disabled={disabled}
                            value={activity.name}
                            onChange={(name) => onActivity({ name })}
                        />
                    )}

                {!madeFrom && (
                    <BusinessRemove
                        what={"Activity " + number}
                        disabled={disabled}
                        onRemove={onRemove}
                    />
                )}

            </div>
        );

        return (
            <MissingScope lacking={missingById.get(activity.id) ?? []} key={activity.id}>{(lacking) => (
            <div
                className={"business-capability-activity business-capability-slot" + (activity.completed ? " business-capability-activity-completed" : "")}
                data-anchor={activity.id}
                data-lacks={lacking.length > 0 ? "|" + lacking.join("|") + "|" : undefined}
                data-frozen={frozen ? "" : undefined}
            >

                {/* Every field of the card is in the fieldset: a finished activity disables them all at once (the Completed tick, below it, is not
                    in it). The fieldset takes no box of its own. */}
                <fieldset className="business-capability-frozen" disabled={frozen}>

                {head}

                {cardDates("Activity " + number, activity.startDate, activity.endDate, onActivity)}

                {/* The period its group runs in, and what is wrong where the dates leave it. */}
                {(() => {
                    const period = activityPeriod(activity.category, planStartDay, openingDate);
                    return (
                        <>
                            {/* (A finished activity is history: its dates are not judged against the period.) */}
                            {(activity.completed ? [] : activityDateIssues(activity, period)).map(issue => (
                                <p className="business-capability-total business-capability-alarm" key={issue}>{issue}</p>
                            ))}
                        </>
                    );
                })()}

                {categoryCell}

                {/* Performer and Responsibility, one under the other, their dropdowns at one x
                    (business-capability-activity-fields). */}
                <div className="business-capability-stack business-capability-activity-fields">

                    {performerFields(
                        "Activity " + number,
                        who,
                        activity.performerIds,
                        (next) => onActivity({ performerIds: next }),
                        activity.performerPeople,
                        (next) => onActivity({ performerPeople: next }),
                        Object.fromEntries([...partnersOf(scope, "professionals"), ...partnersOf(scope, "providers")].map(partner => [partner.id, partner.quantity])),
                        Object.fromEntries([
                            ...founders.map(founder => [founder.id, { noun: "Founder", open: () => openPair(activity.id, founder.id) }] as const),
                            ...[...partnersOf(scope, "professionals"), ...partnersOf(scope, "providers")].map(partner => [partner.id, { noun: partnerNoun(partner.category), open: () => openPair(activity.id, partner.id) }] as const)
                        ])
                    )}

                </div>

                {performerCosts(scope, activity)}

                <div className="business-capability-stack business-capability-activity-fields">

                    {activityResources(scope, activity, number, onActivity)}

                </div>

                {/* Responsible after the Resources and their Cost, its dropdown at the Performer's x. */}
                <div className="business-capability-stack business-capability-activity-fields">

                    {responsibilityField(
                        businessAutoResponsibleId(founderIds, activity.performerIds),
                        activity.responsibleId,
                        (next) => onActivity({ responsibleId: next }),
                        undefined,
                        "Activity " + number,
                        false,
                        {
                            off: responsibleIsOff(activity),
                            onChange: (off) => onActivity(off
                                ? { responsibleOff: true, responsibleId: "" }
                                : { responsibleOff: undefined })
                        }
                    )}

                </div>

                <OptionalNote
                    label="Notes"
                    fieldId="description"
                    ariaLabel={"Activity " + number + " description"}
                    disabled={disabled}
                    value={activity.description}
                    onChange={(next) => onActivity({ description: next })}
                />

                {/* The links last, under the Description. */}
                {scope === "offering" && offeringsField(
                    activity.offeringIds,
                    (next) => onActivity(next),
                    "Activity " + number + " linked Offerings",
                    "Define an Offering on the Foundation page first.",
                    activity.offeringShares
                )}

                </fieldset>

                {/* A line, then the card's state (Completed), then its links under it. */}
                {cardRule()}

                {/* Done, at the very end (the one card order: fields,
                    Description, links, then the card's state), on the left with the other ticks. */}
                <label className="business-capability-done">
                    <input
                        type="checkbox"
                        className="brand-tick-box"
                        aria-label={"Activity " + number + " completed"}
                        disabled={disabled}
                        checked={activity.completed}
                        onChange={(event) => onActivity({
                            completed: event.target.checked
                        })}
                    />
                    <span>Completed</span>
                </label>

                {/* THE CARDS THAT CHOOSE THIS ACTIVITY (a resource whose status is Activity or Needs Activity): a link each, unless the name already is the link to the one that made it. */}
                {linksSection(activity.id, [...Object.values(capability.resources).flat().flatMap(entry => entry.slots), ...capability.offering.resources]
                    .filter(slot => slot.id !== madeFrom?.id && (slot.activityId === activity.id || (slot.extraStatuses ?? []).some(row => row.activityId === activity.id)))
                    .map(slot => ({ key: slot.id + ":chooses", noun: "Resource", name: slot.name.trim() || "Unnamed Resource", onOpen: () => openPair(activity.id, slot.id) })))}

            </div>
            )}</MissingScope>
        );

    }

    /**
     * One list of activities as closed square boxes (CardBoxes): the ACTIVE ones, numbered; the finished ones are
     * not here -- they are filed under the grey Completed tile of their section. The active count is drawn in red because it is the
     * number that means something -- what is left to do.
     */
    function activityList(
        scope: Scope,
        key: string,
        activities: BusinessActivityValue[],
        setActivities: (next: BusinessActivityValue[]) => void
    ) {

        const active = activities.filter(activity => !activity.completed);
        const done = activities.filter(activity => activity.completed);

        const change = (activity: BusinessActivityValue) =>
            (patch: Partial<BusinessActivityValue>) => setActivities(
                activities.map(entry => entry.id === activity.id
                    ? { ...entry, ...patch }
                    : entry)
            );

        const remove = (activity: BusinessActivityValue) => () => setActivities(
            activities.filter(entry => entry.id !== activity.id)
        );

        return (
            <>

                {/* (What is left to do -- the number that matters -- stands next to the dialog's title and on each category's tile.) */}
                <CardBoxes
                    key={key}
                    label="Activities"
                    what="Activity"
                    items={active.map((activity, position) => activityBox(
                        scope, activity, position + 1, change(activity), remove(activity)
                    ))}
                    /* Dragged onto another box, an activity moves there: the order acts on the ACTIVE list shown and is
                       written back into the full list -- the completed ones keep their own order. */
                    onReorder={(from, to) => {
                        const moved = [...active];
                        const [taken] = moved.splice(from, 1);
                        moved.splice(to, 0, taken);
                        setActivities([...moved, ...done]);
                    }}
                    add={{
                        label: "Activity",
                        disabled,
                        onAdd: () => {
                            const activity = createBusinessActivity();
                            setActivities([...activities, activity]);
                            return activity.id;
                        },
                        isBlank: (id) => blankActivity(activities.find(entry => entry.id === id)),
                        onRemove: (ids) => setActivities(activities.filter(entry => !ids.includes(entry.id)))
                    }}
                />

            </>
        );

    }

    /* ---------- 3. Partners & Suppliers ---------- */

    function partnerCard(
        scope: Scope,
        kind: "professionals" | "providers",
        partner: BusinessPartnerValue,
        number: number
    ) {

        const list = partnersOf(scope, kind);

        const change = (patch: Partial<BusinessPartnerValue>) => setPartners(
            scope, kind,
            list.map(entry => entry.id === partner.id ? { ...entry, ...patch } : entry)
        );

        // The resources (and the Workspace) that use this partner or provider: one link each, opening that card with this one.
        const users: { id: string; name: string; noun: string }[] = [
            ...Object.values(capability.resources).flat().flatMap(entry => entry.slots),
            ...capability.offering.resources
        ]
            // (Named by its own status, or by a further status row: a resource can have a supplier for each.)
            .filter(slot => (slot.providerId === partner.id && usesSupplier(slot.status)) || (slot.extraStatuses ?? []).some(row => row.status === "partners-suppliers" && row.providerId === partner.id))
            .map(slot => ({ id: slot.id, name: slot.name.trim() || "Unnamed Resource", noun: "Resource" }));
        workspacesOf(capability).filter(workspace => workspace.providerId === partner.id && workspace.status === "rent").forEach(workspace => {
            // (A Workspace is a Resource like the others: listed once, as the Resource it is.)
            if (users.some(user => user.id === workspace.id)) {
                return;
            }
            users.push({ id: workspace.id, name: BUSINESS_WORKSPACE_KINDS.find(entry => entry.id === workspace.kind)?.label ?? "Workspace", noun: "Workspace" });
        });

        // ... and the activities it performs (the Performer rows of an activity's card name it): one link each.
        [...capability.activities.flatMap(category => category.activities), ...capability.offering.activities]
            .filter(activity => activity.performerIds.includes(partner.id))
            .forEach(activity => users.push({ id: activity.id, name: activity.name.trim() || "Unnamed Activity", noun: "Activity" }));

        return (
            <BusinessCard
                key={partner.id}
                anchor={partner.id}
                className="business-capability-slot"
                kind={kind === "professionals" ? "Professional" : "Provider"}
                number={number}
                name={partner.name}
                /* (A card a Customer Channel made: no name cell and no x -- see resourceCard.) */
                onName={channelMade(scope, partner.id) ? undefined : (next) => change({ name: next })}
                nameLink={channelMade(scope, partner.id) ? channelTitle(partner.id) : undefined}
                open
                disabled={disabled}
                actions={channelMade(scope, partner.id) ? undefined : (
                    <BusinessRemove
                        what={partner.name.trim() || "entry " + number}
                        disabled={disabled}
                        onRemove={() => setPartners(
                            scope, kind,
                            list.filter(entry => entry.id !== partner.id)
                        )}
                    />
                )}
            >

                {cardDates(partner.name.trim() || "Entry " + number, partner.startDate, partner.endDate, change, false, latestPaymentOf(partner.cost.frequency, partner.paymentPlan), partner.cost.frequency === "per-project" && partner.paymentPlan.on)}

                {/* (No Category row: the tile says whether it is a Partner or a Supplier. A card with no type yet, from an earlier answer, keeps the row so it can be given one.) */}
                {capability.partnerCategories.some(entry => entry.id === partner.category) && partnerCategoryCell(partner, partner.name.trim() || "Entry " + number)}

                {partnerGroupCell(scope, partner, partner.name.trim() || "Entry " + number)}

                {/* Price | Frequency first (the Frequency's label above it, as it was), then
                    Responsible on a row of its own: its label beside its picker, in the
                    short side-label column. */}
                {costOptionRows(partner.name.trim() || "Entry " + number, scope, partner.group, partner.costOption, (option) => change({ costOption: option, cost: withDefaultRate(costWithOption(partner.cost, scope, partner.group, option), scope, partner.group, option) }), channelMade(scope, partner.id))}

                {costFields(
                    partner.name.trim() || "Entry " + number,
                    partner.cost,
                    (next) => change({ cost: next }),
                    partnerHasQuantity(supplierConnections(capability, partner.id), partner.cost) ? partner.quantity : "",
                    // A lessor of vehicles, or any card priced Per unit (per hour, per kg ...): how many the price is for, before the price.
                    partnerHasQuantity(supplierConnections(capability, partner.id), partner.cost)
                        ? {
                            field: (
                                <BusinessField label="Qty">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="interview-input"
                                        aria-label={(partner.name.trim() || "Entry " + number) + " quantity"}
                                        placeholder="1"
                                        disabled={disabled}
                                        value={partner.quantity}
                                        onChange={(event) => change({ quantity: businessQuantityText(event.target.value, partner.cost.unit) })}
                                    />
                                </BusinessField>
                            )
                        }
                        : undefined,
                    undefined,
                    // (A Per unit price of a partner or supplier is multiplied by its Qty.)
                    partner.cost.frequency === "per-unit",
                    { scope, groupId: partner.group, costOption: partner.costOption }
                )}

                {partner.cost.frequency === "per-project" && paymentPlanFields(partner.name.trim() || "Entry " + number, partner.startDate, partner.endDate, partner.paymentPlan, (next, dates) => change({ paymentPlan: next, ...dates }), planTotalOf(partner.cost.price, partnerHasQuantity(supplierConnections(capability, partner.id), partner.cost) ? partner.quantity : ""))}

                {/* The extras by what is connected: a landlord's deposit, service charge and property tax, a lessor's road tax; a producer's duties. */}
                {extrasFields(
                    partner.name.trim() || "Entry " + number,
                    partnerExtraKeys(partner.group, supplierConnections(capability, partner.id)),
                    partner.extras, partner.cost.currency || organisationCurrency, (next) => change({ extras: next })
                )}

                {billingOf(scope, partner.group, partner.costOption) === "percentage" && rateOverrideField(
                    partner.name.trim() || "Entry " + number, partner.rateOverride, (next) => change({ rateOverride: next }), defaultRateOf(partner.costOption)
                )}

                {/* Responsible after the payment plan, the extras and the rate override, before the Description (the card structure's order). */}
                {responsibilityField(
                    // One founder: he is responsible (businessPartnerResponsibleId), nothing to choose.
                    businessAutoResponsibleId(founderIds),
                    businessPartnerResponsibleId(partner, founderIds),
                    (next) => change({ responsibleId: next }),
                    SECTIONS.infrastructure.responsibility,
                    partner.name.trim() || "Entry " + number,
                    true,
                    {
                        off: responsibleIsOff(partner),
                        onChange: (off) => change(off
                            ? { responsibleOff: true, responsibleId: "" }
                            : { responsibleOff: undefined })
                    }
                )}

                <OptionalNote
                    label="Notes"
                    fieldId="Description / Relevant Information"
                    ariaLabel={"Entry " + number + " description"}
                    placeholder={noteHint(partner.group)}
                    disabled={disabled}
                    value={partner.description}
                    onChange={(next) => change({ description: next })}
                />

                {/* The links last, under the Description. */}
                {scope === "offering" && offeringsField(
                    partner.offeringIds,
                    (next) => change(next),
                    (partner.name.trim() || "Entry " + number) + " linked Offerings",
                    "Define an Offering on the Foundation page first.",
                    partner.offeringShares,
                    channelMade(scope, partner.id)
                )}

                {/* THE CARDS THAT USE IT (the resources that name it, the activities it performs): at the end of the card, a link each (above this one when opened). */}
                {linksSection(partner.id, users.map(user => ({ key: user.id, noun: user.noun, name: user.name, onOpen: () => openPair(user.id, partner.id) })))}

            </BusinessCard>
        );

    }

    /** A partner's or provider's box: its number and name, the cost and the description on one line. */
    function partnerBox(
        scope: Scope,
        kind: "professionals" | "providers",
        partner: BusinessPartnerValue,
        number: number
    ): CardBox {
        return {
            id: partner.id,
            number,
            name: partner.name,
            unnamed: kind === "professionals" ? "Unnamed Partner" : "Unnamed Provider",
            summary: summaryText(
                costText(partner.cost, organisationCurrency ?? ""),
                partner.description
            ),
            ...tileData(partner.id),
            content: () => partnerCard(scope, kind, partner, number)
        };
    }


    /**
     * 1. Partners and 2. Providers: two kinds of
     * somebody the organisation engages, so two SUBCATEGORY BOXES in the
     * dialog (SubcategoryBoxes); a box shows that kind's column. A tile of
     * channel partners shows the kinds that have some; one kind alone is
     * drawn directly.
     */


    /* ---------- The two sections ---------- */

    /**
     * One of a card's three numbered sections, folding on its own
     * arrow like every level inside it.
     *
     * Its arrow names the CARD too: both cards hold a 1. Resources,
     * a 2. Activities and a 3. Partners & Suppliers, and six
     * arrows announcing three names would be the thing the path is
     * there to prevent.
     */

    /**
     * One activity category's list, and the write that replaces it.
     * The category is stored only once something is written into it.
     */

    /** Replaces one category's activities (the category is stored from the first one written into it). */
    function setCategoryActivities(categoryId: string, next: BusinessActivityValue[]) {

        const stored = capability.activities.find(
            entry => entry.id === categoryId
        );

        update({
            activities: stored
                ? capability.activities.map(entry =>
                    entry.id === categoryId
                        ? { ...entry, activities: next }
                        : entry)
                : [
                    ...capability.activities,
                    { id: categoryId, name: "", activities: next }
                ]
        });

    }

    /**
     * The categories the founder added earlier (not the four fixed ones), titled through uniqueChoices so two
     * unnamed ones read "Untitled Category" and "Untitled category (2)"; a tile while it holds activities.
     */
    function ownCategoryChoices() {
        return uniqueChoices(
            capability.activities.filter(
                category => !FIXED_ACTIVITY_IDS.has(category.id) &&
                    category.activities.length > 0
            ),
            "Untitled Category"
        );
    }

    /** An activity category's title: the fixed name, or the one the founder gave it. */
    function categoryTitle(categoryId: string): string {
        return BUSINESS_ACTIVITY_CATEGORIES.find(entry => entry.id === categoryId)?.label ??
            ownCategoryChoices().find(entry => entry.id === categoryId)?.label ??
            (capability.activities.find(entry => entry.id === categoryId)?.name.trim() || "Untitled Category");
    }

    /**
     * INFRASTRUCTURE'S COMPLETED ACTIVITIES (the grey tile): every finished activity of every category, each still
     * stored in the category it belongs to (ticking Completed on a card only flags it; un-ticking returns it to that
     * category's active list). Up to 8 are card boxes in one flat grid; more than 8 first show BOXES named after the
     * categories that hold finished ones, each opening that category's.
     */
    function completedActivities() {
        const order = [...ACTIVITY_CATEGORY_ORDER, ...capability.activities.map(entry => entry.id).filter(id => !ACTIVITY_CATEGORY_ORDER.includes(id))];
        return order.flatMap(categoryId => {
            const list = categoryActivityList(categoryId);
            const done = list.filter(activity => activity.completed);
            return done.length > 0 ? [{ id: categoryId, title: categoryTitle(categoryId), list, done }] : [];
        });
    }

    function completedBoxes(group: { id: string; list: BusinessActivityValue[]; done: BusinessActivityValue[] }, first = 1) {
        return group.done.map((activity, position) => activityBox(
            "infrastructure",
            activity,
            first + position,
            (patch) => setCategoryActivities(group.id, group.list.map(entry => entry.id === activity.id ? { ...entry, ...patch } : entry)),
            () => setCategoryActivities(group.id, group.list.filter(entry => entry.id !== activity.id))
        ));
    }

    /**
     * THE "ALL TILES" TILE, beside Completed (outside both sections, under Offering's Capability's card): its dialog lists every Resource, Activity,
     * Partner, Provider, the Workspace, the Founders and the Legal Entity's expenses as tiles (or a table), with filters (CapabilityOverview). A tile of
     * it opens its card floating, as every card does.
     */
    function overviewTile(): SectionTile {
        const rows = floor;
        // (A card that lacks a required answer is counted nowhere.)
        const counts = (kinds: string[]) => rows.filter(row => kinds.includes(row.kind) && !row.missing).length;
        return {
            id: "overview",
            title: "Inventory",
            anchor: "section-overview",
            items: [
                counts(["resource", "workspace", "founder"]) + " resources",
                counts(["activity"]) + " activities",
                counts(["partner", "provider"]) + " partners & suppliers"
            ],
            // (A line is red, and the tile glows, while a card of its kind lacks an answer.)
            itemAlerts: [["resource", "workspace", "founder"], ["activity"], ["partner", "provider"]]
                .map(kinds => floor.filter(row => kinds.includes(row.kind) && row.missing).flatMap(row => row.missing!))
                .map(lacking => lacking.length > 0 ? lacking : undefined),
            isChannelCard: (cardId: string) => channelToneIds.has(cardId),
            // (A card floats in the hue of its tile: Infrastructure's, Offering's, a channel's.)
            hueFor: (cardId: string) => {
                const row = rows.find(entry => entry.id === cardId);
                return row && row.tone !== "legal" ? toneHue(row.tone) : undefined;
            },
            kindFor: () => "card",
            cardFor: (cardId: string) => {
                const index = founders.findIndex(founder => founder.id === cardId);
                if (index >= 0) {
                    return founderCard(founders[index], index, true);
                }
                return parentCard(cardId)?.node ?? childCard(cardId)?.node ?? null;
            },
            content: () => {
                const classes = inventoryClassification(
                    capability, legalEntityFounders, legalExpenses, asFinancialFoundationValue(financialFoundation), organisationCurrency, openingDate, globalSettings
                );
                return <CapabilityOverview rows={rows.map(row => ({ ...row, ...(classes.get(row.id) ?? classes.get("salary-" + row.id) ?? classes.get("legal-" + row.id)) }))} format={moneyFormatter(organisationCurrency)} currency={organisationCurrency} onOpenLegal={legalEntity !== undefined && onChangeLegalEntity ? openLegalExpense : undefined} />;
            }
        };
    }

    /**
     * THE ONE COMPLETED TILE, outside both sections, under Offering's Capability's card: every activity ticked Completed, Infrastructure's (by category) then
     * Offering's. Ticking Completed files an activity here, un-ticking returns it to its own tile. A card of it floats frozen. It exists only while an
     * activity is completed.
     */
    function completedTile(): SectionTile | null {
        const groups = completedActivities();
        const offeringDone = capability.offering.activities.filter(activity => activity.completed);
        const all = [...groups.flatMap(group => group.done), ...offeringDone];
        if (all.length === 0) {
            return null;
        }
        const setOffering = (next: BusinessActivityValue[]) => update({ offering: { ...capability.offering, activities: next } });
        let first = 1;
        const boxes: CardBox[] = [];
        for (const group of groups) {
            const made = completedBoxes(group, first);
            first += made.length;
            boxes.push(...made);
        }
        offeringDone.forEach((activity, position) => boxes.push(activityBox(
            "offering",
            activity,
            first + position,
            (patch) => setOffering(capability.offering.activities.map(entry => entry.id === activity.id ? { ...entry, ...patch } : entry)),
            () => setOffering(capability.offering.activities.filter(entry => entry.id !== activity.id))
        )));
        return {
            id: "completed",
            title: "Completed",
            completed: true,
            anchor: "section-completed",
            holds: all.map(activity => activity.id),
            items: namesOf(all, "Unnamed Activity"),
            itemAlerts: all.map(activity => missingById.get(activity.id)),
            links: cardLinks(all),
            // (The hue of the section the activity belongs to.)
            hueFor: (cardId: string) => stableCardHue(groups.some(entry => entry.list.some(activity => activity.id === cardId)) ? "infrastructure" : "offering-capability"),
            // (A card stays open when its Completed tick is taken off: it goes back to its own tile.)
            cardFor: (cardId: string) => {
                const group = groups.find(entry => entry.list.some(activity => activity.id === cardId));
                return group
                    ? activityCardFor("infrastructure", group.list, (next) => setCategoryActivities(group.id, next), cardId)
                    : activityCardFor("offering", capability.offering.activities, setOffering, cardId);
            },
            content: () => foldingGroup(
                "fold-completed",
                "Completed",
                "Completed",
                undefined,
                "business-capability-column",
                () => <CardBoxes label="Completed activities" what="Activity" className="card-boxes-completed" items={boxes} />,
                false
            )
        };
    }

    /** One activity category's activities, as stored (none until written). */
    function categoryActivityList(categoryId: string): BusinessActivityValue[] {
        return capability.activities.find(
            entry => entry.id === categoryId
        )?.activities ?? [];
    }

    /**
     * A section as the content of a tile's dialog: its title row (its "i",
     * its "Expand all") with no arrow, and what it holds.
     */
    function tileSection(
        scope: Scope,
        title: string,
        info: InfoPoint[] | undefined,
        body: () => ReactNode,
        titleExtra?: ReactNode
    ) {
        return foldingGroup(
            "fold-section-" + scope + "-" + title,
            title,
            (scope === "infrastructure" ? "Infrastructure" : "Offering's Capability") +
                " → " + title,
            info,
            "business-capability-section",
            body,
            false,
            undefined,
            titleExtra
        );
    }


    /** The links of a tile's list to the cards it names: each opens that card alone, floating (SectionTiles). */
    function cardLinks(cards: readonly { id: string }[]): TileLink[] {
        return cards.map(card => ({ card: card.id }));
    }

    /** A list of activities' "+" box: a blank activity appended to it. */
    function activityAdd(
        activities: readonly BusinessActivityValue[],
        setActivities: (next: BusinessActivityValue[]) => void,
        category = ""
    ): TileAdd {
        return {
            label: "Activity",
            disabled,
            onAdd: () => {
                const activity = createBusinessActivity(category);
                setActivities([...activities, activity]);
                return activity.id;
            },
            isBlank: (id) => blankActivity(activities.find(entry => entry.id === id)),
            onRemove: (ids) => setActivities(activities.filter(entry => !ids.includes(entry.id)))
        };
    }

    /** One activity's card (by id) out of a list, as it is drawn when its box is open; null once it is gone. */
    function activityCardFor(
        scope: Scope,
        activities: readonly BusinessActivityValue[],
        setActivities: (next: BusinessActivityValue[]) => void,
        id: string
    ): ReactNode {
        const activity = activities.find(entry => entry.id === id);
        if (!activity) {
            // Filed in another category since it was opened (its Category was changed in its card): the card stays open where it now is.
            const home = capability.activities.find(category => category.activities !== activities && category.activities.some(entry => entry.id === id));
            return home && scope === "infrastructure"
                ? activityCardFor(scope, home.activities, (next) => setCategoryActivities(home.id, next), id)
                : null;
        }
        // Numbered in its own list: the active ones, or the finished ones.
        // (Within the view it is listed in: an Offering activity is listed under its category.)
        const view = scope === "offering" ? activities.filter(entry => entry.category === activity.category) : activities;
        // A finished one is listed in the Completed view, numbered along all the finished ones (Infrastructure's by category, then Offering's).
        const finished = [...completedActivities().flatMap(group => group.done), ...capability.offering.activities.filter(entry => entry.completed)];
        const number = activity.completed
            ? finished.findIndex(entry => entry.id === activity.id) + 1
            : view.filter(entry => !entry.completed).indexOf(activity) + 1;
        return activityBox(
            scope,
            activity,
            number,
            (patch) => setActivities(activities.map(entry => entry.id === id ? { ...entry, ...patch } : entry)),
            () => setActivities(activities.filter(entry => entry.id !== id))
        ).content();
    }


    /** One partner's or provider's card (by id), numbered in its kind's list. */
    function partnerCardFor(scope: Scope, id: string, show: "own" | "channel" = "own"): ReactNode {
        // Numbered in the view it is listed in: its category's tiles (the Channel view for a card a channel made), restarting at 1 in each.
        const every = [
            ...partnersOf(scope, "professionals").map(partner => ({ partner, kind: "professionals" as const })),
            ...partnersOf(scope, "providers").map(partner => ({ partner, kind: "providers" as const }))
        ];
        const found = every.find(entry => entry.partner.id === id);
        if (!found || (scope === "offering" && channelTileIds.has(id)) !== (show === "channel")) {
            return null;
        }
        const view = show === "channel"
            ? every.filter(entry => channelTileIds.has(entry.partner.id))
            : every.filter(entry => !(scope === "offering" && channelTileIds.has(entry.partner.id)) && entry.partner.category === found.partner.category);
        return partnerCard(scope, found.kind, found.partner, view.findIndex(entry => entry.partner.id === id) + 1);
    }

    /** What a tile or box lists of the cards it holds: their names ("Unnamed Resource" for one not named yet). */
    function namesOf(cards: readonly { name: string }[], unnamed: string): string[] {
        return cards.map(card => card.name.trim() || unnamed);
    }

    /** The founders on the Founders tile: their names. */
    function founderItems(): string[] {
        // (The names alone: the rate of each founder's responsibilities is in the founder's card.)
        return founders.map((founder, position) => founder.name.trim() || "Founder " + (position + 1));
    }



    /** Every card a resource group holds, in its subcategories (fixed, then added), each with its number in its own subcategory. */
    function groupSlots(groupId: string): { slot: BusinessResourceSlotValue; number: number }[] {
        return (capability.resources[groupId] ?? []).flatMap(subsection => subsection.slots.map((slot, at) => ({ slot, number: at + 1 })));
    }

    /**
     * A resource group's subcategories, as the links of its tile's list. A subcategory that holds exactly ONE card opens that card, floating,
     * under the tile's name; one that holds several opens the section's dialog on that subcategory; an empty one opens the dialog on it,
     * where a blank card is made and waits (the first-open rule of the card boxes).
     */


    /**
     * A subcategory box's "+" box (Electricity, Water, Computing ... and a founder's own "Other"): a blank resource in THAT subcategory, opened
     * floating under the subcategory's name; left completely blank it is taken away again. (The subcategory itself stays.)
     */
    function subAdd(groupId: string, subId: string): TileAdd {
        const storedNow = () => live.current.resources[groupId] ?? [];
        return {
            label: "Resource",
            disabled,
            onAdd: () => {
                const slot = createBusinessResourceSlot();
                const entries = storedNow();
                const known = entries.some(entry => entry.id === subId);
                onChange({
                    ...live.current,
                    resources: {
                        ...live.current.resources,
                        [groupId]: known
                            ? entries.map(entry => entry.id === subId ? { ...entry, slots: [...entry.slots, slot] } : entry)
                            : [...entries, { id: subId, name: "", slots: [slot] }]
                    }
                });
                return slot.id;
            },
            isBlank: (id) => blankSlot(storedNow().flatMap(entry => entry.slots).find(slot => slot.id === id)),
            onRemove: (ids) => onChange({
                ...live.current,
                resources: {
                    ...live.current.resources,
                    [groupId]: storedNow().map(entry => ({ ...entry, slots: entry.slots.filter(slot => !ids.includes(slot.id)) }))
                }
            })
        };
    }

    /* ---------- THE SECTION TILES (one per section) and their views ---------- */

    /**
     * A SECTION'S TILE: the one tile of Resources, of Activities, of Partners & Suppliers. Its list names the categories that hold cards (a category with
     * CATEGORY_TILE_MIN_CARDS or more is a line that opens that category; a smaller one lists its cards); pressing the tile opens the section's VIEW
     * (SectionView): the cards' tiles grouped by category, a category tile for each big one with an Add of its own, and the section's Add. A "+" at the
     * tile's corner adds a blank card of the section and opens it floating.
     */
    function viewTile(args: {
        id: string;
        title: string;
        what: string;
        scope: Scope;
        anchor: string;
        categories: ViewCategory[];
        add: TileAdd;
        note?: InfoPoint[];
        /** The part of the dialog that stands above the view's tiles (an "Active n" count). */
        before?: ReactNode;
    }): SectionTile {
        // (Every category has its tile, empty or not: only the section tile itself is empty when no category exists.)
        const filled = args.categories;
        const big = (category: ViewCategory) => category.cards.length >= CATEGORY_TILE_MIN_CARDS;
        return {
            id: args.id,
            title: args.title,
            anchor: args.anchor,
            note: args.note,
            holds: filled.flatMap(category => category.cards.map(card => card.id)),
            empty: false,
            view: true,
            isChannelCard: (cardId: string) => channelToneIds.has(cardId),
            items: filled.flatMap(category => big(category) ? [category.title] : category.cards.map(card => card.name.trim() || card.unnamed)),
            // A category with no card is faded; Offering's Channel line (Resources) is teal; a line of Offering's Activities / Partners & Suppliers that holds cards a channel made has a teal bullet behind its own.
            itemMarks: filled.flatMap((category): ItemMark[] => big(category)
                ? [{
                    empty: category.cards.length === 0,
                    teal: args.scope === "offering" && args.id === "resources" && !!category.channel,
                    channel: args.scope === "offering" && args.id !== "resources" && category.cards.some(card => channelToneIds.has(card.id))
                }]
                : category.cards.map((card): ItemMark => ({ teal: card.tone === "channel" }))),
            // ("No category" holds the cards still to be filed: its line opens the first card floating, the arrows going through the others.)
            links: filled.flatMap((category): TileLink[] => big(category) ? [category.id === UNASSIGNED_CATEGORY && category.cards.length > 0 ? { card: category.cards[0].id } : { box: category.id }] : category.cards.map(card => ({ card: card.id }))),
            boxHolds: Object.fromEntries(filled.filter(big).map(category => [category.id, category.cards.map(card => card.id)])),
            // (Every card of the section: a resource, an activity, a partner or provider, the Workspace's form.)
            cardFor: (cardId: string) => parentCard(cardId)?.node ?? childCard(cardId)?.node ?? null,
            kindFor: () => "card",
            nameFor: (cardId: string) => filled.flatMap(category => category.cards).find(card => card.id === cardId)?.name ?? "",
            add: args.add,
            content: () => tileSection(args.scope, args.title, args.note, () => (
                <>
                    {args.before}
                    <SectionView label={args.title} what={args.what} categories={args.categories} add={args.add} />
                </>
            ), args.categories.some(category => category.active !== undefined)
                ? (
                    <ActiveCount overall={args.categories.reduce((sum, category) => sum + (category.active ?? 0), 0)} />
                )
                : undefined)
        };
    }

    /** The cards of a list as the CardBox tiles of a category view. */
    function categoryView(
        id: string,
        title: string,
        cards: CardBox[],
        content: () => ReactNode,
        add: TileAdd | undefined,
        channel = false
    ): ViewCategory {
        return { id, title, cards, content, add, channel };
    }

    /** What a category's "i" says: the help texts of its groups (the help-texts document), under the category's name in the dialog's header. */
    function categoryInfo(label: string, lines: CrumbNote["points"]): CrumbNote | undefined {
        return lines.length > 0 ? { label, points: [...lines] } : undefined;
    }

    /** Infrastructure's Resources, by category (the group a card is filed in) -- and the Workspaces, a category of cards like the others. */
    function infrastructureResourceCategories(): ViewCategory[] {
        return [
            // (The Workspace is the FIRST of the groups: a category like the others.)
            ...BUSINESS_RESOURCE_GROUPS.map(group => categoryView(
                group.id,
                group.label,
                groupSlots(group.id).map(({ slot, number }) => resourceBox(
                    "infrastructure", slot, number,
                    (base, patch) => patchSlot(base, slot.id, patch),
                    () => onChange(removeSlot(capability, slot.id))
                )),
                () => resourceGroup(group),
                // (A new card of a category has no Group yet -- but the Workspace's, which has one.)
                subAdd(group.id, soleGroupOf(group.kinds) || NO_GROUP)
            )).map((view, at) => {
                const group = BUSINESS_RESOURCE_GROUPS[at];
                // (Human Resources: Founders & Owners, the Founders tile, comes first.)
                const lines = group.id === "hr"
                    ? groupHelpPoints([{ label: "Founders & Owners", help: FOUNDERS_OWNERS_HELP }, ...group.kinds])
                    : groupHelpPoints(group.kinds);
                return { ...view, info: categoryInfo(group.label, lines) };
            }),
            // The cards that have no Category yet (the new ones): a tile of their own while there are any.
            ...((capability.resources[NO_CATEGORY] ?? []).flatMap(subsection => subsection.slots).length > 0
                ? [categoryView(
                    NO_CATEGORY,
                    "No category",
                    groupSlots(NO_CATEGORY).map(({ slot, number }) => resourceBox(
                        "infrastructure", slot, number,
                        (base, patch) => patchSlot(base, slot.id, patch),
                        () => onChange(removeSlot(capability, slot.id))
                    )),
                    () => <CardBoxes
                        label="No category"
                        what="Resource"
                        items={groupSlots(NO_CATEGORY).map(({ slot, number }) => resourceBox(
                            "infrastructure", slot, number,
                            (base, patch) => patchSlot(base, slot.id, patch),
                            () => onChange(removeSlot(capability, slot.id))
                        ))}
                        add={subAdd(NO_CATEGORY, NO_GROUP)}
                    />,
                    subAdd(NO_CATEGORY, NO_GROUP)
                )]
                : [])
        ];
    }

    /** A blank Offering resource in this category and group ("" for none yet), opened floating; left completely blank it is taken away again. */
    function offeringAdd(categoryId: string, groupId: string): TileAdd {
        const storedNow = () => live.current.offering.resources;
        const set = (next: BusinessResourceSlotValue[]) => onChange({ ...live.current, offering: { ...live.current.offering, resources: next } });
        return {
            label: "Resource",
            disabled,
            onAdd: () => {
                const slot = { ...createBusinessResourceSlot(), category: categoryId, group: groupId };
                set([...storedNow(), slot]);
                return slot.id;
            },
            isBlank: (id) => blankSlot(storedNow().find(entry => entry.id === id)),
            onRemove: (ids) => set(storedNow().filter(entry => !ids.includes(entry.id)))
        };
    }

    /** A card's number in the list its tile draws it in (the box and the card it opens carry the same number). */
    function offeringNumberOf(slot: BusinessResourceSlotValue): number {
        const list = channelTileIds.has(slot.id)
            ? capability.offering.resources.filter(entry => channelTileIds.has(entry.id))
            : offeringSlotsIn(slot.category, slot.category === "" ? undefined : slot.group);
        return Math.max(0, list.findIndex(entry => entry.id === slot.id)) + 1;
    }

    /** The cards of the Offering a customer channel did not make, in one category and group. */
    function offeringSlotsIn(categoryId: string, groupId?: string): BusinessResourceSlotValue[] {
        return capability.offering.resources.filter(slot => !channelTileIds.has(slot.id) && slot.category === categoryId && (groupId === undefined || slot.group === groupId));
    }

    /** The boxes of Offering cards, each patching and removing itself inside the Offering's list. */
    function offeringBoxes(slots: BusinessResourceSlotValue[]) {
        return slots.map(slot => resourceBox(
            "offering", slot, offeringNumberOf(slot),
            (base, patch) => ({ ...base, offering: { ...base.offering, resources: base.offering.resources.map(entry => entry.id === slot.id ? { ...entry, ...patch } : entry) } }),
            () => update({ offering: { ...capability.offering, resources: capability.offering.resources.filter(entry => entry.id !== slot.id) } })
        ));
    }

    /** One category of the Offering's Resources as the content of its tile: a box for each of its fixed groups (and one for the cards with no group yet). */
    function offeringResourceGroup(category: typeof BUSINESS_OFFERING_RESOURCE_GROUPS[number]) {
        const subsection = (id: string, title: string, slots: BusinessResourceSlotValue[], help: string): SubcategoryBox => ({
            id,
            title: withBreak(title),
            anchor: "subsection-offering-" + category.id + "-" + id,
            holds: slots.map(slot => slot.id),
            empty: slots.length === 0,
            items: namesOf(slots, "Unnamed Resource"),
            alerts: slots.map(slot => missingById.get(slot.id)),
            itemMarks: slots.map(slot => ({ teal: channelToneIds.has(slot.id) })),
            crumbInfo: help.length > 0 ? { label: title, points: [help] } : undefined,
            add: offeringAdd(category.id, id === NO_GROUP ? "" : id),
            content: () => (
                <div className="business-capability-subsection" key={id} data-anchor={"subsection-offering-" + category.id + "-" + id}>
                    <CardBoxes label={title.trim() || "Resources"} what="Resource" items={offeringBoxes(slots)} add={offeringAdd(category.id, id === NO_GROUP ? "" : id)} />
                </div>
            )
        });
        const ungrouped = offeringSlotsIn(category.id, "");
        return (
            <SubcategoryBoxes
                label={category.label}
                items={[
                    ...category.kinds.map(kind => subsection(kind.id, kind.label, offeringSlotsIn(category.id, kind.id), kind.help)),
                    ...(ungrouped.length > 0 ? [subsection(NO_GROUP, "No group", ungrouped, "")] : [])
                ]}
            />
        );
    }

    /** Offering's Resources, by category (the nine, as Infrastructure's are), the cards with no category yet, and the ones a Customer Channel made. */
    function offeringResourceCategories(): ViewCategory[] {
        const all = capability.offering.resources;
        const unsorted = offeringSlotsIn("");
        const channel = all.filter(slot => channelTileIds.has(slot.id));
        return [
            ...BUSINESS_OFFERING_RESOURCE_GROUPS.map(category => categoryView(
                category.id,
                category.label,
                offeringBoxes(offeringSlotsIn(category.id)),
                () => offeringResourceGroup(category),
                // (A new card of a category has no Group yet.)
                offeringAdd(category.id, soleGroupOf(category.kinds))
            )).map((view, at) => ({ ...view, info: categoryInfo(BUSINESS_OFFERING_RESOURCE_GROUPS[at].label, groupHelpPoints(BUSINESS_OFFERING_RESOURCE_GROUPS[at].kinds)) })),
            // The cards that have no Category yet (the new ones, and an earlier answer's): a tile of their own while there are any.
            ...(unsorted.length > 0
                ? [categoryView(
                    NO_CATEGORY,
                    "No category",
                    offeringBoxes(unsorted),
                    () => <CardBoxes label="No category" what="Resource" items={offeringBoxes(unsorted)} add={offeringAdd("", "")} />,
                    offeringAdd("", "")
                )]
                : []),
            // (A Channel tile exists only while a channel has made cards.)
            ...(channel.length > 0 ? [categoryView("channel", "Channel", offeringBoxes(channel), () => <CardBoxes label="Channel" what="Resource" items={offeringBoxes(channel)} />, undefined, true)] : [])
        ];
    }

    /** A blank Partner / Provider of this category, opened floating (kept in the list of its kind: Providers, or Partners for every other). */
    function partnerAddIn(scope: Scope, categoryId: string): TileAdd {
        const kind = categoryId === "suppliers" ? "providers" : "professionals";
        return {
            label: partnerNoun(categoryId),
            disabled,
            onAdd: () => {
                const partner = {
                    ...createBusinessPartner("", categoryId),
                    group: categoryId === "partners" || categoryId === "suppliers" ? soleGroupOf(BUSINESS_PARTNER_GROUPS[scope][categoryId]) : ""
                };
                setPartners(scope, kind, [...partnersOf(scope, kind), partner]);
                return partner.id;
            },
            isBlank: (id) => blankPartner([...partnersOf(scope, "professionals"), ...partnersOf(scope, "providers")].find(entry => entry.id === id)),
            onRemove: (ids) => {
                const without = (list: BusinessPartnerValue[]) => list.filter(entry => !ids.includes(entry.id));
                update(scope === "offering"
                    ? { offering: { ...capability.offering, professionals: without(capability.offering.professionals), providers: without(capability.offering.providers) } }
                    : { professionals: without(capability.professionals), providers: without(capability.providers) });
            }
        };
    }

    /** Partners & Suppliers, by category (Partners, Providers, the user's own), and -- Offering's -- the ones a Customer Channel made. */
    function partnerCategories(scope: Scope): ViewCategory[] {
        const every = [
            ...partnersOf(scope, "professionals").map(partner => ({ partner, kind: "professionals" as const })),
            ...partnersOf(scope, "providers").map(partner => ({ partner, kind: "providers" as const }))
        ];
        const made = (entry: { partner: BusinessPartnerValue }) => scope === "offering" && channelTileIds.has(entry.partner.id);
        const boxes = (list: typeof every) => list.map((entry, index) => partnerBox(scope, entry.kind, entry.partner, index + 1));
        const ids = [
            ...PARTNER_CATEGORIES.map(entry => entry.id as string),
            ...capability.partnerCategories.map(entry => entry.id),
            // (The cards that have no Category yet -- the new ones: a tile of their own while there are any.)
            ...(every.some(entry => !made(entry) && entry.partner.category === UNASSIGNED_CATEGORY) ? [UNASSIGNED_CATEGORY] : [])
        ];
        return [
            ...ids.map(id => {
                const list = every.filter(entry => !made(entry) && entry.partner.category === id);
                const label = id === UNASSIGNED_CATEGORY ? "No category" : partnerCategoryLabel(capability.partnerCategories, id) || "Category";
                const add = partnerAddIn(scope, id);
                const view = categoryView(id, label, boxes(list), () => <CardBoxes label={label} what={partnerNoun(id)} items={boxes(list)} add={add} />, add);
                // (Partners and Suppliers: the groups of the category in this place, with their texts.)
                return id === "partners" || id === "suppliers" ? { ...view, info: categoryInfo(label, groupHelpPoints(BUSINESS_PARTNER_GROUPS[scope][id])) } : view;
            }),
            ...(scope === "offering" && every.some(made)
                ? [categoryView("channel", "Channel", boxes(every.filter(made)), () => <CardBoxes label="Channel" what="Partner" items={boxes(every.filter(made))} />, undefined, true)]
                : [])
        ];
    }

    /** Activities, by category (Operational ... and the user's own): Infrastructure's, or Offering's. */
    function activityCategoriesOf(scope: Scope): ViewCategory[] {
        const unassigned = scope === "infrastructure" ? categoryActivityList(UNASSIGNED_CATEGORY) : capability.offering.activities.filter(activity => activity.category === UNASSIGNED_CATEGORY);
        const ids = [
            ...activityGroupsOf(scope).map(entry => entry.id as string),
            ...capability.activityCategories.map(entry => entry.id),
            // (The cards that have no Category yet -- the new ones: a tile of their own while there are any.)
            ...(unassigned.length > 0 ? [UNASSIGNED_CATEGORY] : [])
        ];
        const setOfferingActivities = (next: BusinessActivityValue[]) => update({ offering: { ...capability.offering, activities: next } });
        return ids.map(id => {
            const label = id === UNASSIGNED_CATEGORY ? "No category" : activityCategoryLabel(capability.activityCategories, id) || "Category";
            const list = scope === "infrastructure"
                ? categoryActivityList(id)
                : capability.offering.activities.filter(activity => activity.category === id);
            const setList = (next: BusinessActivityValue[]) => scope === "infrastructure"
                ? setCategoryActivities(id, next)
                : setOfferingActivities([...capability.offering.activities.filter(activity => activity.category !== id), ...next]);
            const active = list.filter(activity => !activity.completed);
            const boxes = active.map((activity, position) => activityBox(
                scope, activity, position + 1,
                (patch) => setList(list.map(entry => entry.id === activity.id ? { ...entry, ...patch } : entry)),
                () => setList(list.filter(entry => entry.id !== activity.id))
            ));
            // The dates its group runs in: Pre-Operational from the plan start to the opening, Operational from the opening on.
            // (Only Infrastructure's groups run in a period; the Offering's activities have no dates of their own to say.)
            const period = scope === "infrastructure" ? activityPeriod(id, planStartDay, openingDate) : { from: "", to: "" };
            const shown = (iso: string) => isoToDisplay(iso, PreferencesService.getDateFormat());
            const periodText = period.from !== "" || period.to !== ""
                ? period.from !== "" && period.to !== "" ? shown(period.from) + " – " + shown(period.to) : period.from !== "" ? "FROM " + shown(period.from) : "TO " + shown(period.to)
                : "";
            const view = categoryView(id, label, boxes, () => activityList(scope, scope + "-activities-" + id, list, setList), activityAdd(list, setList, id));
            return {
                ...view,
                active: active.length,
                period: periodText,
                // (Opened, the category says its dates above its cards.)
                content: () => (
                    <>
                        {periodText && <p className="business-capability-period-line">{periodText}</p>}
                        {view.content()}
                    </>
                )
            };
        });
    }

    function infrastructureSection() {

        const founderTile: SectionTile = {
            id: "founders",
            title: "Founders",
            anchor: "resource-group-founders contains-founders section-infrastructure-founders",
            holds: founders.map(founder => "founder-" + founder.id),
            empty: false,
            items: founderItems(),
            links: cardLinks(founders),
            // A founder's card is a card like the others (the same width), shown as a tile of the Founders tile and opened floating.
            cardFor: (cardId: string) => {
                const index = founders.findIndex(founder => founder.id === cardId || "founder-" + founder.id === cardId);
                return index >= 0 ? founderCard(founders[index], index, true) : null;
            },
            opening: () => setResponsibilityFolds(new Map()),
            // (One founder is a section of its own: its card in the dialog, one of the tiles the arrows go through.)
            view: founders.length === 1,
            content: () => tileSection("infrastructure", "Founders", undefined, () => founders.length === 1 ? founderCard(founders[0], 0, true) : (
                <CardBoxes
                    label="Founders"
                    what="Founder"
                    items={founders.map((founder, index): CardBox => ({
                        id: founder.id,
                        number: index + 1,
                        name: founder.name,
                        unnamed: "Unnamed founder",
                        summary: summaryText(founder.roles[0]),
                        ...tileData(founder.id),
                        content: () => founderCard(founder, index, true)
                    }))}
                />
            ))
        };

        return (
            <div className="business-capability-section business-capability-tiles-section">
                <div className="business-capability-heading-spacer" aria-hidden="true" />
                <SectionTiles
                    incomplete={missingById}
                    blank={discard}
                    label="Infrastructure sections"
                    hue={stableCardHue("infrastructure")}
                    tiles={[
                        founderTile,
                        viewTile({
                            id: "resources", title: "Resources", what: "Resource", scope: "infrastructure", anchor: "section-infrastructure-resources",
                            categories: infrastructureResourceCategories(), add: subAdd(NO_CATEGORY, NO_GROUP), note: SECTIONS.infrastructure.resources
                        }),
                        viewTile({
                            id: "activities", title: "Activities", what: "Activity", scope: "infrastructure", anchor: "section-infrastructure-activities",
                            categories: activityCategoriesOf("infrastructure"),
                            add: activityAdd(categoryActivityList(UNASSIGNED_CATEGORY), (next) => setCategoryActivities(UNASSIGNED_CATEGORY, next), UNASSIGNED_CATEGORY),
                            note: SECTIONS.infrastructure.activities
                        }),
                        viewTile({
                            id: "partners", title: "Partners & Suppliers", what: "Partner", scope: "infrastructure", anchor: "section-infrastructure-partners partners-infrastructure-professionals partners-infrastructure-providers",
                            categories: partnerCategories("infrastructure"), add: partnerAddIn("infrastructure", UNASSIGNED_CATEGORY), note: SECTIONS.infrastructure.partnerships
                        })
                    ]}
                />
            </div>
        );
    }

    /* ---------- 4. Delivery ---------- */

    /**
     * ONE CARD PER OFFERING, WITHOUT ASKING. Every Offering on the
     * Foundation page has its card; its Delivery is stored the first
     * time something is written in it, and dropped again when it is
     * emptied, so an untouched card leaves nothing behind.
     */
    function changeDelivery(offeringId: string, patch: Partial<DeliveryValue>) {
        const shown = capability.delivery[offeringId] ?? createDelivery();
        const next = { ...shown, ...patch };
        const delivery = { ...capability.delivery };
        if (deliveryIsEmpty(next)) {
            delete delivery[offeringId];
        } else {
            delivery[offeringId] = next;
        }
        update({ delivery });
    }

    /**
     * What one Offering's hours mean for the people who give them:
     * - the PACE while one unit runs: working hours spread over its
     *   calendar time, a week, beside the founders' own weekly hours;
     * - the LOAD a month at the expected sales, founders' and external
     *   apart, and how many units run at once.
     */
    function deliveryPace(
        offeringId: string,
        rows: { id: string; label: string; external: boolean }[],
        hours: Record<string, string>,
        recurring: boolean,
        weekly: boolean
    ) {

        const perPerson = rows
            .map(row => ({ ...row, hours: readHours(hours[row.id]) ?? 0 }))
            .filter(row => row.hours > 0);
        if (perPerson.length === 0) {
            return null;
        }

        const delivery = capability.delivery[offeringId];
        const weeks = readHours(delivery?.duration) ?? 0;
        const expected = expectedFor(offeringId);

        // Hours a month for one unit or client, as the capacity counts them.
        const monthlyOf = (value: number) => recurring && weekly ? value * WEEKS_PER_MONTH : value;
        const founders = perPerson.filter(row => !row.external).reduce((sum, row) => sum + monthlyOf(row.hours), 0);
        const external = perPerson.filter(row => row.external).reduce((sum, row) => sum + monthlyOf(row.hours), 0);

        /* Compact labelled lines, one fact each: the pace while one runs, the
           load at the expected sales. */
        return (
            <div className="delivery-pace">

                {!recurring && weeks > 0 && (
                    <p>
                        <span className="delivery-pace-label">While one runs:</span>{" "}
                        {perPerson.map(row => row.label + " " + formatHours(row.hours / weeks) + " h a week").join(", ")}
                        {" for " + formatHours(weeks) + (weeks === 1 ? " week" : " weeks")}
                    </p>
                )}

                {expected
                    ? (
                        <p>
                            <span className="delivery-pace-label">
                                <InfoText text={"At expected sales (" + formatHours(expected.volume) + (recurring ? " active clients" : " a month") + "):"}>
                                    <InfoNote label="Expected sales" points={DELIVERY_HELP.expected} fullList />
                                </InfoText>
                            </span>{" "}
                            {[
                                founders > 0 ? "founders " + inFounderUnit(founders * expected.volume) : "no founders' time",
                                ...(external > 0 ? ["external " + formatHours(external * expected.volume) + " h a month"] : []),
                                ...(!recurring && weeks > 0
                                    ? ["about " + formatHours(Math.max(0.1, Math.round(expected.volume * weeks / WEEKS_PER_MONTH * 10) / 10)) + " running at once"]
                                    : [])
                            ].join(" · ")}
                        </p>
                    )
                    : (
                        <p className="delivery-muted">
                            Add this Offering's expected sales under Demand & Conversion on Customer Engagement to see the hours it takes a month.
                        </p>
                    )}

            </div>
        );

    }

    function deliveryCard(offering: { id: string; label: string }, index: number) {

        const delivery = capability.delivery[offering.id] ?? createDelivery();

        const cardKey = "delivery-" + offering.id;

        /* WHO WORKS ON IT: every founder, and the External
           Professionals linked to this Offering under Offering's
           own 3. Partners & Suppliers. Providers supply things
           rather than hours, and Infrastructure's professionals serve
           the organization, not one Offering. */
        const linkedProfessionals = uniqueChoices(
            capability.offering.professionals.filter(
                professional => professional.offeringIds.includes(offering.id)
            ),
            "Unnamed professional"
        );

        const rows = [
            ...founderChoices.map(choice => ({ ...choice, external: false })),
            ...linkedProfessionals.map(choice => ({ ...choice, external: true }))
        ];

        /* SAVED BEFORE EFFORT WAS SPLIT: one total and who delivered
           it. Shown on its first deliverer until the hours are split,
           and written by person the first time a row changes. */
        const legacy = Object.keys(delivery.hours).length === 0 &&
            delivery.effort.trim() !== "";

        const legacyAllocation = legacy ? deliveryAllocation(delivery) : {};

        const shownHours: Record<string, string> = legacy
            ? Object.fromEntries(
                Object.entries(legacyAllocation)
                    .filter(([personId]) => rows.some(row => row.id === personId))
                    .map(([personId, hours]) => [personId, String(hours)])
            )
            : delivery.hours;

        /* The old total, when nobody shown here delivered it. */
        const legacyHidden = legacy && Object.keys(shownHours).length === 0
            ? Object.values(legacyAllocation).reduce((sum, hours) => sum + hours, 0)
            : 0;

        const setHours = (personId: string, text: string) => {
            const hours = { ...shownHours };
            if (text.trim() === "") {
                delete hours[personId];
            } else {
                hours[personId] = text;
            }
            changeDelivery(offering.id, { hours });
        };

        const sumOf = (external: boolean) => rows
            .filter(row => row.external === external)
            .reduce((sum, row) => sum + (readHours(shownHours[row.id]) ?? 0), 0);

        const foundersTotal = sumOf(false);
        const externalTotal = sumOf(true);
        const total = foundersTotal + externalTotal;

        /* THE FOUNDER CHOOSES how it is delivered: once per unit, over
           some weeks; or every month, for each active client (a
           retainer, a subscription), with no duration. */
        const recurring = delivery.mode === "monthly";

        // How customers buy it, said on Customer Engagement.
        const bought = demandByOffering[offering.id];
        const disagrees = (bought?.sources.length ?? 0) > 0 && bought.recurring !== recurring;
        const weekly = recurring && delivery.period === "week";
        const perUnit = recurring ? (weekly ? " per client a week" : " per client a month") : " per unit";

        return (
            <BusinessCard
                key={cardKey}
                anchor={cardKey}
                className="business-capability-slot delivery-card"
                kind="Offering"
                number={index + 1}
                name={offering.label}
                ariaPrefix="Delivery"
                open
                disabled={disabled}
            >

                {/* A side-label row: the label beside its control, on one
                    centre line, the picker as wide as its longest option. */}
                <BusinessField label="Delivered" info={DELIVERY_HELP.mode} side>
                    <OptionPicker
                        label={offering.label + " delivered per unit or every month"}
                        placeholder="Per unit"
                        hug
                        options={["Per unit", "Every month"]}
                        disabled={disabled}
                        value={recurring ? "Every month" : "Per unit"}
                        onChange={(next) => changeDelivery(offering.id, next === "Every month"
                            ? { mode: "monthly", duration: "" }
                            : { mode: "unit" })}
                    />
                </BusinessField>

                {disagrees && (
                    <p className="delivery-muted delivery-mismatch" role="note">
                        {recurring
                            ? "On Customer Engagement, customers buy this Offering one sale at a time: deliver it Per unit, or change how customers buy."
                            : "On Customer Engagement, customers buy this Offering every month: deliver it Every month, or change how customers buy."}
                    </p>
                )}

                {recurring && (
                    <BusinessField label="Hours Given" info={DELIVERY_HELP.recurring} side>
                        <OptionPicker
                            label={offering.label + " hours given per week or per month"}
                            placeholder="Per month"
                            hug
                            options={["Per month", "Per week"]}
                            disabled={disabled}
                            value={weekly ? "Per week" : "Per month"}
                            onChange={(next) => changeDelivery(offering.id, { period: next === "Per week" ? "week" : "month" })}
                        />
                    </BusinessField>
                )}

                <BusinessField
                    label={recurring ? "Working Hours per Client (" + (weekly ? "a week" : "a month") + "), by person" : "Working Hours per Unit, by person"}
                    info={DELIVERY_HELP.effort}
                >
                    {rows.length === 0
                        ? (
                            <BusinessEmpty>
                                Nobody yet. Add founders under 1. Identity System → 3. Legal Entity → 2. Founders &amp; Ownership,
                                or an external professional under 3. Partners &amp; Providers.
                            </BusinessEmpty>
                        )
                        : (
                            <div className="delivery-effort">

                            <div className="delivery-people">

                                {rows.map(row => (
                                    <div className="delivery-person" key={row.id}>
                                        {/* (Whether a person is a founder or external is said to assistive technology and in the tooltip, not drawn.) */}
                                        <span className="delivery-person-name" title={row.label + (row.external ? " (external)" : " (founder)")}>
                                            {row.label}
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            className="interview-input delivery-number delivery-person-hours"
                                            aria-label={row.label + " hours" + perUnit + " of " + offering.label + (row.external ? " (external)" : " (founder)")}
                                            placeholder="0"
                                            disabled={disabled}
                                            value={shownHours[row.id] ?? ""}
                                            onChange={(event) => setHours(
                                                row.id, limitedNumberText(event.target.value, shownHours[row.id] ?? "", NUMBER_LIMITS.unitHours)
                                            )}
                                        />
                                    </div>
                                ))}

                            </div>

                    {legacy && (
                        <p className="delivery-muted">
                            {"Previously one total" +
                                (legacyHidden > 0 ? " of " + formatHours(legacyHidden) + " h" : "") +
                                ": split it by person."}
                        </p>
                    )}

                    {total > 0 && (
                        <p className="delivery-total">
                            <span>
                                <InfoText
                                    text={"Total: " + formatHours(total) + " h" + perUnit +
                                        (externalTotal > 0
                                            ? " · founders " + formatHours(foundersTotal) +
                                                " h · external " + formatHours(externalTotal) + " h"
                                            : "") +
                                        (weekly ? " (about " + formatHours(total * WEEKS_PER_MONTH) + " h a month)" : "")}
                                >
                                    <InfoNote label={offering.label + " unit"} points={DELIVERY_HELP.unit} fullList />
                                </InfoText>
                            </span>
                        </p>
                    )}

                    {deliveryPace(offering.id, rows, shownHours, recurring, weekly)}

                            </div>
                        )}
                </BusinessField>

                {!recurring && (
                    <BusinessField label="Calendar Time (weeks)" info={DELIVERY_HELP.duration} side>
                        <input
                            type="text"
                            inputMode="decimal"
                            className="interview-input delivery-number"
                            aria-label={offering.label + " calendar time, weeks"}
                            placeholder="e.g. 2"
                            disabled={disabled}
                            value={delivery.duration}
                            onChange={(event) => changeDelivery(offering.id, {
                                duration: limitedNumberText(event.target.value, delivery.duration, NUMBER_LIMITS.weeks)
                            })}
                        />
                    </BusinessField>
                )}

                <OptionalNote
                    label="Constraints"
                    info={DELIVERY_HELP.constraints}
                    ariaLabel={offering.label + " delivery constraints"}
                    disabled={disabled}
                    value={delivery.constraints}
                    onChange={(next) => changeDelivery(offering.id, { constraints: next })}
                />

            </BusinessCard>
        );

    }

    function deliverySection() {

        const available = deliveryHours(founders);

        const perFounder = founders
            .map((founder, position) => ({
                label: founderChoices[position]?.label ?? founder.name,
                hours: founderDeliveryHours(founder)
            }))
            .filter((entry): entry is { label: string; hours: number } => entry.hours !== null);

        return (
            <>

                <div className="delivery-capacity">
                    <p className="delivery-capacity-line">
                        <InfoText
                            text={available === null
                                ? "Add each founder's delivery hours on the Founder cards to see the capacity."
                                : "Founders' delivery capacity: about " + formatHours(available) + " hours a month."}
                        >
                            <InfoNote label="Delivery capacity" points={DELIVERY_HELP.capacity} fullList />
                        </InfoText>
                    </p>
                    {founders.length > 1 && perFounder.length > 0 && (
                        <ul className="delivery-capacity-breakdown">
                            {perFounder.map((entry, position) => (
                                <li key={entry.label + position}>
                                    {entry.label + ": about " + formatHours(entry.hours) + " hours a month"}
                                </li>
                            ))}
                        </ul>
                    )}
                    {/* EACH FOUNDER'S MONTH, as a budget: what they have,
                        what each Offering takes at the expected sales,
                        and what is left. On this page, before
                        Sustainability, so it can be acted on here. */}
                    {founders.map((founder, position) => {
                        const available = founderDeliveryHours(founder);
                        const items = founderBudget(founder.id);
                        if (available === null || items.length === 0) {
                            return null;
                        }
                        const used = items.reduce((sum, item) => sum + item.hours, 0);
                        const left = available - used;
                        const label = founderChoices[position]?.label ?? founder.name;
                        return (
                            <div className="delivery-budget" key={founder.id}>
                                <table className="delivery-budget-table">
                                    <caption>{label}'s month at the expected sales</caption>
                                    <tbody>
                                        <tr>
                                            <th scope="row">Delivery hours</th>
                                            <td>{inFounderUnit(available)}</td>
                                        </tr>
                                        {items.map(item => (
                                            <tr key={item.id}>
                                                <th scope="row">{item.label}</th>
                                                <td>−{inFounderUnit(item.hours)}</td>
                                            </tr>
                                        ))}
                                        <tr className={"delivery-budget-left" + (left < 0 ? " delivery-budget-short" : "")}>
                                            <th scope="row">{left < 0 ? "Short by" : "Left"}</th>
                                            <td>{inFounderUnit(Math.abs(left))}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div
                                    className="delivery-budget-bar"
                                    role="img"
                                    aria-label={label + ": " + formatHours(used) + " of " + formatHours(available) + " delivery hours a month used"}
                                >
                                    <span
                                        className={"delivery-budget-fill" + (left < 0 ? " delivery-budget-fill-short" : "")}
                                        style={{ width: Math.min(100, Math.round(used / Math.max(1, available) * 100)) + "%" }}
                                    />
                                </div>
                                <p className="delivery-muted">
                                    <InfoText
                                        text={Math.round(used / Math.max(1, available) * 100) + "% of " + label +
                                            "'s delivery hours, at the normal level of sales."}
                                    >
                                        <InfoNote label="Capacity used" points={CAPACITY_UTILISATION_HELP} />
                                    </InfoText>
                                    {left < 0 ? " More delivery capacity may be needed: more hours, an external professional for part of the work, or a hire." : ""}
                                </p>
                            </div>
                        );
                    })}

                    {/* An Offering whose hours are recorded but whose
                        sales are not yet expected is not in the budgets:
                        say so, so "Left" is not read as free time. */}
                    {(() => {
                        const missing = offeringChoices.filter(choice =>
                            founders.some(founder => (deliveryAllocation(capability.delivery[choice.id])[founder.id] ?? 0) > 0) &&
                            expectedFor(choice.id) === null
                        );
                        return missing.length > 0 && (
                            <p className="delivery-muted">
                                Not in the budgets yet, with no expected sales: {missing.map(choice => choice.label).join(", ")}.
                                Add them under Demand &amp; Conversion on Customer Engagement.
                            </p>
                        );
                    })()}
                </div>

                {offeringChoices.length === 0
                    ? (
                        <BusinessEmpty>
                            No Offerings yet. Define them on the Foundation page, and each
                            one gets its Delivery card here.
                        </BusinessEmpty>
                    )
                    : (
                        /* Each Offering's Delivery is a card, and each card a tile: pressed, it floats over the page. */
                        <CardBoxes
                            items={offeringChoices.map((choice, at): CardBox => ({ id: "delivery-" + choice.id, number: at + 1, name: choice.label, unnamed: "Unnamed offering", own: true, content: () => null }))}
                            label="Delivery"
                            what="Delivery"
                            autoStart={false}
                        />
                    )}

            </>
        );

    }

    function offeringSection() {

        const setOfferingActivities = (next: BusinessActivityValue[]) => update({
            offering: { ...capability.offering, activities: next }
        });

        const tiles: SectionTile[] = [

            viewTile({
                id: "resources", title: "Resources", what: "Resource", scope: "offering", anchor: "section-offering-resources",
                categories: offeringResourceCategories(), add: offeringAdd("", "")
            }),

            viewTile({
                id: "activities", title: "Activities", what: "Activity", scope: "offering", anchor: "section-offering-activities",
                categories: activityCategoriesOf("offering"), add: activityAdd(capability.offering.activities, setOfferingActivities, UNASSIGNED_CATEGORY),
                note: SECTIONS.infrastructure.activities
            }),

            viewTile({
                id: "partners", title: "Partners & Suppliers", what: "Partner", scope: "offering",
                anchor: "section-offering-partners partners-offering-professionals partners-offering-providers",
                categories: partnerCategories("offering"), add: partnerAddIn("offering", UNASSIGNED_CATEGORY)
            }),

            {
                id: "delivery",
                title: "Delivery",
                anchor: "section-offering-delivery",
                holds: offeringChoices.map(choice => "delivery-" + choice.id),
                // (Its dialog lists a tile for each Offering's Delivery card; a link in its list opens one floating.)
                view: true,
                items: offeringChoices.map(choice => choice.label),
                // An Offering's name opens THAT Offering's Delivery card alone, floating (the rest of the tile opens the dialog).
                links: cardLinks(offeringChoices.map(choice => ({ id: "delivery-" + choice.id }))),
                note: DELIVERY_HELP.section,
                cardFor: (cardId: string) => {
                    const at = offeringChoices.findIndex(choice => "delivery-" + choice.id === cardId);
                    return at >= 0 ? deliveryCard(offeringChoices[at], at) : null;
                },
                content: () => tileSection("offering", "Delivery", DELIVERY_HELP.section, deliverySection)
            },

        ];

        // A 3 × 3 grid by design: four tiles show 2 × 2, five or more (the channels' own) three across.
        /* Parallel to Infrastructure's groups: a heading row, then 12px, then the
           tiles -- here the heading row is only its height (no title: the column
           title above is the card's label), so the first tile row of both cards
           starts at one y. */
        return (
            <div className="business-capability-section business-capability-tiles-section">
                <div className="business-capability-heading-spacer" aria-hidden="true" />
                <SectionTiles
                    incomplete={missingById}
                    blank={discard}
                    label="Offering's Capability sections"
                    hue={stableCardHue("offering-capability")}
                    tiles={tiles}
                />
            </div>
        );

    }

    /* ---------- The page ---------- */

    const heads = [
        {
            number: 1,
            title: "Infrastructure",
            instructions: SECTIONS.infrastructure.instructions,
            note: SECTIONS.infrastructure.note
        },
        {
            number: 2,
            title: "Offering's Capability",
            instructions: SECTIONS.offering.instructions,
            note: SECTIONS.offering.note
        }
    ];

    const cards = [
        { id: "infrastructure", body: infrastructureSection },
        { id: "offering-capability", body: offeringSection }
    ];

    const completed = completedTile();
    const overview = overviewTile();

    /** Each card of a pair keeps its own colour: the Offering's, Infrastructure's or a channel's teal. */
    const offeringOwns = (id: string) => capability.offering.activities.some(entry => entry.id === id) || capability.offering.professionals.some(entry => entry.id === id) ||
        capability.offering.providers.some(entry => entry.id === id) || capability.offering.resources.some(entry => entry.id === id);
    const pairHue = (id: string) => channelToneIds.has(id) ? CHANNEL_TILE_HUE : stableCardHue(offeringOwns(id) ? "offering-capability" : "infrastructure");
    const pairParent = pair ? parentCard(pair.parentId) : null;
    // (The card below may be any card: an activity or a partner, and also a founder or a resource -- what a Performer, a Responsible or a Resource row of an activity leads to.)
    const pairChild = pair ? childCard(pair.childId) ?? parentCard(pair.childId) : null;

    useEffect(() => {
        if (pair && (!pairParent || !pairChild)) {
            setPair(null);
        }
    }, [pair, pairParent, pairChild]);

    return (

        <MissingMapContext.Provider value={missingById}>
        {legalEntity !== undefined && onChangeLegalEntity && (
            <LegalEntityEditor value={legalEntity} onChange={onChangeLegalEntity} prefill={legalEntityPrefill} foundersProfile={foundersProfile} openingDate={openingDate} asTiles cardsOnly disabled={disabled} />
        )}
        {pending && (
            <div className="confirmation-overlay" onClick={() => setPending(null)}>
                <div className="confirmation-dialog" role="alertdialog" aria-modal="true" aria-label="Remove the card made for this one?" onClick={(event) => event.stopPropagation()}>
                    <h2 className="confirmation-title">This change leaves {pending.orphans.length === 1 ? "a card" : "cards"} with no use.</h2>
                    <p className="confirmation-question">
                        {pending.orphans.map(card => "“" + card.name + "”").join(", ")} {pending.orphans.length === 1 ? "was" : "were"} made for this card and no other card is linked to {pending.orphans.length === 1 ? "it" : "them"}. If you continue, {pending.orphans.length === 1 ? "it is" : "they are"} removed.
                    </p>
                    <div className="confirmation-actions">
                        <button type="button" className="confirmation-button secondary" autoFocus onClick={() => setPending(null)}>Cancel</button>
                        <button type="button" className="confirmation-button danger" onClick={() => { const { next, orphans, after } = pending; setPending(null); write(withoutCards(next, orphans.map(card => card.id))); after?.(); }}>Continue</button>
                    </div>
                </div>
            </div>
        )}
        <div
            className="answer-columns business-foundation business-engagement business-capability"
            style={{ "--answer-column-count": 2 } as CSSProperties}
        >

            {columnsDivider && (
                <div className="answer-columns-divider">
                    {columnsDivider}
                </div>
            )}

            {/* One card per section, each in its own colour -- the same card Pages
                1 and 2 use. The column title is the card's one label, its first row
                (no fold arrow, no second label), with the arrow that drops its
                guidance down over the card; nothing in the card folds: the tiles
                are the grouping. */}
            {cards.map((card, cardIndex) => {

                const head = heads[cardIndex];

                return (
                    <div
                        className="business-foundation-input business-foundation-card business-engagement-input"
                        key={card.id}
                        data-anchor={"capability-" + card.id}
                        data-rail={railId(BUSINESS_CAPABILITY_SECTIONS[cardIndex])}
                        style={{
                            "--strategy-theme-hue": stableCardHue(card.id)
                        } as CSSProperties}
                    >

                        <CardTitleHelp
                            number={head.number}
                            title={head.title}
                            lines={head.instructions}
                            enabled={showInstructions}
                            open={helpOpen === head.number}
                            onToggle={() => setHelpOpen(current => current === head.number ? null : head.number)}
                            onClose={() => setHelpOpen(null)}
                        />

                        {/* The title row stays; this body scrolls on its own (conversation.css,
                            "Page 3 scrolls in its cards"). */}
                        <div className="card-scroll">
                            {card.body()}
                        </div>

                    </div>
                );

            })}

            {/* THE ONE COMPLETED TILE: outside both sections, under Offering's Capability's card (its floating cards stand over that card). */}
            <div className="section-tiles-completed" data-anchor="section-completed-tile">
                <SectionTiles
                    incomplete={missingById}
                    blank={discard}
                    label="Inventory"
                    hue={stableCardHue("offering-capability")}
                    tiles={completed ? [overview, completed] : [overview]}
                />
            </div>

            {pair && pairParent && pairChild && (
                <FloatingCards
                    pair
                    anchor={otherColumn(document.querySelector<HTMLElement>('[data-anchor="capability-' + (pairParent.scope === "offering" ? "offering-capability" : "infrastructure") + '"]'))}
                    // (A pair that holds a card in the channel's colour -- one a channel made, or the Partner / Provider / activity it generated -- is teal throughout.)
                    hue={channelToneIds.has(pair.parentId) || channelToneIds.has(pair.childId) ? CHANNEL_TILE_HUE : stableCardHue(pairParent.scope === "offering" ? "offering-capability" : "infrastructure")}
                    label={pairParent.caption + " and " + pairChild.caption}
                    attrs={{ "data-pair": pair.parentId }}
                    cards={[
                        { key: pair.parentId, caption: pairParent.caption, kind: pairParent.kind, node: pairParent.node, hue: pairHue(pair.parentId) },
                        { key: pair.childId, caption: pairChild.caption, kind: pairChild.kind ?? "card", node: pairChild.node, hue: pairHue(pair.childId) }
                    ]}
                    onClose={() => setPair(null)}
                />
            )}

        </div>
        </MissingMapContext.Provider>

    );

}

/**
 * The last option of a provider or partner picker: one not listed
 * yet. The ellipsis keeps it apart from a partner somebody named
 * "Other", and says choosing it asks for more.
 */
const OTHER_PARTNER = "Other…";

/** The id prefix of a Provided resource's provider that is the Workspace ("workspace:dedicated"). */
const WORKSPACE_PROVIDER = "workspace:";

/** Where a NEW Resource card is filed until the founder chooses its Category (and then its Group): it is incomplete till then. */
const NO_CATEGORY = "unassigned";
const NO_GROUP = "unassigned";

/** The groups whose cards carry a warranty (equipment), and the ones with a contract's own rate. */
const WARRANTY_GROUPS: readonly string[] = ["devices-tools", "production-machinery"];

/** Every fixed subsection id across all four resource groups. */
const FIXED_KIND_IDS: ReadonlySet<string> = new Set(
    BUSINESS_RESOURCE_GROUPS.flatMap(group => group.kinds.map(kind => kind.id))
);

/**
 * True while a card holds nothing the user wrote: every field as a fresh card's (only its id
 * differs). A card left like this when its box is closed is removed again (CardBoxes).
 */
function sameAsFresh<T extends { id: string }>(card: T | undefined, fresh: T): boolean {
    return card !== undefined && JSON.stringify({ ...card, id: "" }) === JSON.stringify({ ...fresh, id: "" });
}

// (An Offering card's category and group are where it stands, not something the user wrote.)
const blankSlot = (slot: BusinessResourceSlotValue | undefined) => sameAsFresh(slot && { ...slot, category: "", group: "" }, createBusinessResourceSlot());
// (Its category is where it stands, not something the user wrote.)
const blankActivity = (activity: BusinessActivityValue | undefined) => sameAsFresh(activity && { ...activity, category: "" }, createBusinessActivity());
// (A partner's group is where it stands -- the type's one group, filed on its own -- not something the user wrote.)
const blankPartner = (partner: BusinessPartnerValue | undefined) => sameAsFresh(partner && { ...partner, group: "" }, createBusinessPartner("", partner?.category ?? ""));

/**
 * The subcategory names drawn on TWO LINES, in the list of their tile and as the title of their box: a forced break after a fixed word
 * ("Conditioning" and "& Communication" start the second line). The stored id is the subcategory's; the label is read as it was.
 */
const SUBCATEGORY_BREAKS: Readonly<Record<string, string>> = {
    "Cooling & Air Conditioning": "Cooling & Air\nConditioning",
    "Online Presence & Communication": "Online Presence\n& Communication"
};

const withBreak = (label: string): string => SUBCATEGORY_BREAKS[label] ?? label;
