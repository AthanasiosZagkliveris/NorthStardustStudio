import { CSSProperties, Fragment, ReactNode, useEffect, useState } from "react";

import {
    BUSINESS_ACTIVITY_CATEGORIES,
    BUSINESS_CAPABILITY_SECTIONS,
    BUSINESS_COST_FREQUENCIES,
    BUSINESS_DERIVED_ACTIVITY_CATEGORY,
    BUSINESS_RESOURCE_GROUPS,
    BUSINESS_RESOURCE_STATUSES,
    BUSINESS_WORKSPACE_KINDS,
    BUSINESS_WORKSPACE_STATUS_IDS,
    BusinessActivityValue,
    BusinessCapabilityValue,
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
    businessFounderResponsibilities,
    businessResponsibilitiesTally,
    createBusinessActivity,
    createBusinessPartner,
    createBusinessResourceSlot,
    resourceUnitCount,
    stableCardHue,
    withLegalEntityFounders
} from "../../framework/engine/AnswerUtils.ts";
import { costText } from "../../framework/engine/ExportRenderers.ts";

import {
    BusinessAddButton,
    BusinessCard,
    BusinessEmpty,
    BusinessField,
    BusinessGroup,
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
import { moneyFormatter } from "../../framework/engine/FinancialModel.ts";
import { parseAmount, parseDecimal } from "../../framework/engine/Amounts.ts";
import { CURRENCY_CODES, CURRENCY_SEARCH_ALIASES, labelWithCurrency, nameWithCurrency } from "../../framework/engine/Currencies.ts";
import { randomId } from "../../framework/engine/Readers.ts";
import { SOURCES } from "../../framework/engine/Sources.ts";
import { railId } from "./rails/railItems.ts";

import { summaryText } from "./cardSummary.ts";
import FoldAllToggle from "./FoldAllToggle.tsx";
import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";
import { NUMBER_LIMITS, limitedNumberText } from "./numberInput.ts";
import OptionPicker from "./OptionPicker.tsx";
import type { OpenPage } from "./jumpTo.ts";
import { useListDrag } from "./ReorderControls.tsx";
import { useItemFolds } from "./useItemFolds.ts";
import FoldArrow from "./FoldArrow.tsx";
import CardNumber from "./CardNumber.tsx";
import CardNameInput from "./CardNameInput.tsx";
import NumberedListStatic from "./NumberedListStatic.tsx";
import { CAPACITY_UTILISATION_HELP } from "./FinancialParts.tsx";
import { toggledIn } from "./toggledIn.ts";

import "../../styles/delivery.css";

/**
 * The guidance and help this page carries.
 *
 * Every explanation behind an "i" is the specification's own
 * (docs/specifications/business-system/page-3-infrastructure-and-capability.md);
 * the guidance above the process line is this page's, as every
 * page writes its own.
 */
const SECTIONS = {

    infrastructure: {
        instructions: [
            "Record the resources, activities and partnerships the organization needs to establish, operate and deliver.",
            "Mark what each resource needs: it already exists, it is provided, it needs an external professional or partner, it needs work, it needs looking into, or it costs money.",
            "Give every activity one person who is responsible for it."
        ],
        note: [
            "Existing or planned resources, activities, and partnerships & providers the organization needs to establish, operate, and deliver."
        ],
        resources: ["Physical and digital resources the organization needs to operate."],
        workspace: ["Where the organization's work is carried out."],
        responsibilities: ["This list is developed automatically."],
        activities: [
            "Add activities directly or create them from resources marked Needs Investigation or Needs Activity.",
            "Activities do not record costs directly. Any resulting cost is recorded under the relevant Resource, Partnership & Provider.",
            "Assign one responsible person to each activity."
        ],
        partnerships: [
            "Add Partnerships & Providers directly or create them from Resources or Activities."
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
            "What each Offering needs on top of the organization's own infrastructure: its resources, activities, partners and providers, and how it is delivered."
        ]
    },

    /* The five statuses and what each one means, behind the "i" on
       every Status field. The follow-up each one obliges is carried
       out by the page rather than described here. */
    status: BUSINESS_RESOURCE_STATUSES.map(status => ({
        title: status.label,
        text: status.explanation
    }))

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
    period: ["Give the hours a week or a month, whichever you know. Weekly hours become monthly at 52 ÷ 12 ≈ 4.33 weeks a month (40 h a week is about 173 h a month)."],
    mode: [
        "Per unit: done once for each unit sold (a project, a product, a session), over its Calendar Time in weeks.",
        "Every month: ongoing work for each active client every month (a retainer, a subscription). It has no Calendar Time, and it uses founders' hours first.",
        "Match how customers buy under Demand & Conversion on Customer Engagement: an Offering bought every month is delivered every month."
    ],
    recurring: ["A subscription or retainer is served every period. Give each client's hours a week or a month; weekly hours become monthly at about 4.33 weeks a month."],
    share: ["The share of working hours spent delivering Offerings, as recorded before delivery hours were asked for. Enter Delivery Hours instead to replace it."],
    effort: [
        "The working hours one unit of this Offering takes, by each person who works on it."
    ],
    unit: [
        "One unit is one sale: one project, one product, one session.",
        "For a recurring Offering (a subscription or retainer), one unit is each client, each month: the hours one active client takes a month."
    ],
    duration: ["From start to finish, including waiting for the client: approvals, access, feedback. Not working time: it is not added to the hours, and only sets the pace (hours a week) and how many run at once."],
    constraints: ["Limits such as equipment, availability or lead times."]
};

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
 * How 1. Resources is arranged: two groups, each holding its
 * sections SIDE BY SIDE.
 *
 * What the organisation IS -- its founders, where they work, what
 * keeps the lights on -- and what it WORKS WITH: the desk, the
 * laptop, the software. Six sections in one stack was a scroll
 * past Founders to reach the one being answered; three across is
 * one glance per group.
 *
 * Numbered straight through, 1 to 6, rather than per group: a
 * section's number is where it sits on the page, and "3. Utilities"
 * is the third thing under Resources whichever group it is in.
 * Founders and Workspace are the page's own; the other four are
 * BUSINESS_RESOURCE_GROUPS, by id.
 */
const RESOURCE_GROUPINGS = [
    {
        id: "organisational",
        label: "Organizational Resources",
        sections: ["founders", "workspace", "utilities"]
    },
    {
        id: "operational",
        label: "Operational Resources",
        sections: ["workstation", "equipment", "digital"]
    }
] as const;

const RESOURCE_SECTION_ORDER: readonly string[] =
    RESOURCE_GROUPINGS.flatMap(grouping => grouping.sections);

/**
 * The same for 2. Activities: making and running the thing, then
 * selling it -- two categories to a group, side by side, numbered
 * 1 to 4 straight through. A category the founder adds belongs to
 * neither, and is drawn after both.
 */
const ACTIVITY_GROUPINGS = [
    {
        id: "operations-production",
        label: "Operations & Production",
        categories: ["operational", "production"]
    },
    {
        id: "market-customer",
        label: "Market & Customer",
        categories: ["marketing", "sales"]
    }
] as const;

const ACTIVITY_CATEGORY_ORDER: readonly string[] =
    ACTIVITY_GROUPINGS.flatMap(grouping => grouping.categories);

/** The two sections of this page, as the value stores them. */
export type Scope = "infrastructure" | "offering";

/**
 * The activity a resource's status creates.
 *
 * "Needs Activity" means somebody has to make the thing; "Needs
 * Investigation" means somebody has to find out about it. Both are
 * work, so both become an activity -- named after the resource, so
 * the list reads as a list of jobs rather than of nouns.
 */
function derivedActivityName(slot: BusinessResourceSlotValue, status: string): string {

    const subject = slot.name.trim().length > 0
        ? slot.name.trim()
        : "this resource";

    return status === "investigation"
        ? "Investigate " + subject
        : "Set up " + subject;

}

/**
 * The page with the activity a slot's new status requires, if it
 * requires one and does not already have it.
 *
 * Idempotent, by the activity's `sourceId`: flipping a status back
 * and forth must not leave four copies of the same job behind. And
 * NON-DESTRUCTIVE in the other direction -- moving a resource off
 * "Needs Activity" leaves the activity alone, because by then it
 * may have a description, a performer and a responsible founder
 * that nothing else knows.
 *
 * With exactly one named founder, the new activity is theirs: its
 * Performer and its Responsibility. With several it is left for the
 * person to assign (the Review page lists it until they do).
 */
export function withDerivedActivity(
    capability: BusinessCapabilityValue,
    scope: Scope,
    slot: BusinessResourceSlotValue,
    status: string,
    founderIds: readonly string[] = []
): BusinessCapabilityValue {

    if (status !== "activity" && status !== "investigation") {
        return capability;
    }

    const already = [
        ...capability.activities.flatMap(category => category.activities),
        ...capability.offering.activities
    ].some(activity => activity.sourceId === slot.id);

    if (already) {
        return capability;
    }

    const soleFounder = founderIds.length === 1 ? founderIds[0] : "";

    const activity: BusinessActivityValue = {
        ...createBusinessActivity(),
        name: derivedActivityName(slot, status),
        sourceId: slot.id,
        offeringIds: scope === "offering" ? [...slot.offeringIds] : [],
        ...(soleFounder ? { performerIds: [soleFounder], responsibleId: soleFounder } : {})
    };

    if (scope === "offering") {
        return {
            ...capability,
            offering: {
                ...capability.offering,
                activities: [...capability.offering.activities, activity]
            }
        };
    }

    const known = capability.activities.some(
        category => category.id === BUSINESS_DERIVED_ACTIVITY_CATEGORY
    );

    return {
        ...capability,
        activities: known
            ? capability.activities.map(category =>
                category.id === BUSINESS_DERIVED_ACTIVITY_CATEGORY
                    ? { ...category, activities: [...category.activities, activity] }
                    : category)
            : [
                ...capability.activities,
                {
                    id: BUSINESS_DERIVED_ACTIVITY_CATEGORY,
                    name: "",
                    activities: [activity]
                }
            ]
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
    /** 1. Identity System — 4. Founders Profile, as saved: each founder's Roles. */
    foundersProfile?: unknown;
    /** Customer Engagement: its Demand & Conversion gives each Offering's expected sales. */
    engagement?: unknown;

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

    onChange,

    disabled = false,

    showInstructions = true,

    columnsDivider,

    foundation,

    onOpenFoundation,

    organisationCurrency = "",

    legalEntityFounders = [],

    foundersProfile,

    engagement

}: BusinessCapabilityEditorProps) {

    const stored = asBusinessCapabilityValue(value);

    /* The founders as the Legal Entity names them, with the Roles
       their Founders Profile gives them, drawn from the first render
       -- and written back (below), so what is saved says the same as
       what is shown. */
    const capability = withLegalEntityFounders(stored, legalEntityFounders, foundersProfile);

    const storedJson = JSON.stringify(stored);
    const syncedJson = JSON.stringify(capability);

    useEffect(() => {
        if (!disabled && syncedJson !== storedJson) {
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

    /**
     * Resources whose provider or professional was just created
     * through "Other…", and so still show the box that names it.
     */
    const [naming, setNaming] = useState<ReadonlySet<string>>(new Set());

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
    const demandByOffering = asBusinessEngagementValue(engagement).demand;
    function expectedFor(offeringId: string): { volume: number; source: string } | null {
        const fromDemand = demandResult(demandByOffering[offeringId]).expected;
        return fromDemand !== null && fromDemand > 0
            ? { volume: fromDemand, source: "Demand & Conversion" }
            : null;
    }

    /* Hours in the unit the founders think in: a week if any founder
       gave their hours a week, with the month beside it. */
    const weeklyView = founders.some(founder => founder.hoursPeriod === "week");
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
     * under this section's own Partnerships & Providers. Both, and
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

                    {info
                        ? (
                            <span className="business-foundation-label-info">
                                <span className="field-group-title business-foundation-subhead">
                                    <InfoText text={title}>
                                        <InfoNote label={title} points={info} fullList />
                                    </InfoText>
                                </span>
                            </span>
                        )
                        : <span className="field-group-title business-foundation-subhead">{title}</span>}

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
        inline = false
    ) {
        return (
            <BusinessField label={label} info={info} inline={inline}>
                {choices.length === 0
                    ? <BusinessEmpty>{empty}</BusinessEmpty>
                    : (
                        <OptionPicker
                            label={ariaLabel ?? label}
                            placeholder={placeholder}
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
        onNext: (next: string[]) => void,
        name: string,
        empty: ReactNode
    ) {
        return (
            <BusinessField label="Linked to">
                {offeringChoices.length === 0
                    ? <BusinessEmpty>{empty}</BusinessEmpty>
                    : (
                        <BusinessTicks
                            name={name}
                            options={offeringChoices.map(choice => ({ id: choice.id, label: choice.label }))}
                            chosen={current}
                            disabled={disabled}
                            onChange={onNext}
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
        quantity = ""
    ) {
        const count = resourceUnitCount(quantity, cost.frequency);
        const unitPrice = parseAmount(cost.price) ?? NaN;
        const total = count !== null && Number.isFinite(unitPrice)
            ? Math.round(unitPrice * count * 100) / 100
            : null;
        return (
            /* One field a line, label beside control: side by side in
               a row, two labelled controls leave each too narrow. */
            <div className="business-capability-stack">

                <BusinessField label={count !== null ? "Price per Unit" : "Price"} inline>
                    <div className="business-capability-price">

                        {/* A number and nothing else: the currency is
                            beside it, and "per month" is Frequency. */}
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

                        <OptionPicker
                            label={what + " currency"}
                            placeholder="Code"
                            options={CURRENCY_CODES}
                            searchable
                            searchAliases={CURRENCY_SEARCH_ALIASES}
                            disabled={disabled}
                            value={cost.currency || organisationCurrency}
                            onChange={(next) => onNext({
                                ...cost,
                                currency: next === organisationCurrency ? "" : next
                            })}
                        />

                    </div>
                    {total !== null && (
                        <p className="business-capability-total">
                            Total: {count} × {moneyFormatter(cost.currency || organisationCurrency)(unitPrice)} = {moneyFormatter(cost.currency || organisationCurrency)(total)}
                        </p>
                    )}
                </BusinessField>

                <BusinessField label="Frequency" inline>
                    <OptionPicker
                        label={what + " payment frequency"}
                        placeholder="Select a frequency"
                        options={BUSINESS_COST_FREQUENCIES.map(entry => entry.label)}
                        disabled={disabled}
                        value={BUSINESS_COST_FREQUENCIES.find(
                            entry => entry.id === cost.frequency
                        )?.label ?? ""}
                        onChange={(next) => onNext({
                            ...cost,
                            frequency: BUSINESS_COST_FREQUENCIES.find(
                                entry => entry.label === next
                            )?.id ?? "",
                            frequencyOther: ""
                        })}
                    />
                </BusinessField>

                {cost.frequency === "other" && (
                    <BusinessText
                        label="Which?"
                        inline
                        ariaLabel={what + " frequency, named"}
                        value={cost.frequencyOther}
                        disabled={disabled}
                        onChange={(next) => onNext({ ...cost, frequencyOther: next })}
                    />
                )}

            </div>
        );
    }

    /**
     * The Status field, and everything the chosen status obliges.
     *
     * "Provided" asks which provider, and offers to create one when
     * there are none -- the specification's "A Provider must be
     * defined under 3. Partnerships & Providers". "Costs" asks the
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
        ) => BusinessCapabilityValue
    ) {

        const onSlot = (patch: Partial<BusinessResourceSlotValue>) =>
            onChange(applySlot(capability, patch));

        const options = BUSINESS_RESOURCE_STATUSES.filter(
            status => allowed.includes(status.id)
        );

        const created = [
            ...capability.activities.flatMap(category => category.activities),
            ...capability.offering.activities
        ].find(activity => activity.sourceId === slot.id);

        return (
            <>

                <BusinessField label="Status" info={SECTIONS.status} inline>
                    <OptionPicker
                        label={what + " status"}
                        placeholder="Select a status"
                        options={options.map(status => status.label)}
                        disabled={disabled}
                        value={options.find(
                            status => status.id === slot.status
                        )?.label ?? ""}
                        onChange={(next) => {

                            const status = options.find(
                                candidate => candidate.label === next
                            )?.id ?? "";

                            // The status and whatever it obliges,
                            // in ONE write.
                            onChange(withDerivedActivity(
                                applySlot(capability, { status }),
                                scope,
                                { ...slot, status },
                                status,
                                founders.filter(founder => founder.name.trim().length > 0).map(founder => founder.id)
                            ));

                        }}
                    />
                </BusinessField>

                {slot.status === "provided" && partnerPicker(
                    what, scope, "providers", slot, applySlot
                )}

                {slot.status === "professional" && partnerPicker(
                    what, scope, "professionals", slot, applySlot
                )}

                {slot.status === "costs" && costFields(
                    what,
                    slot.cost,
                    (next) => onSlot({ cost: next }),
                    slot.quantity
                )}

                {(slot.status === "activity" || slot.status === "investigation") && (
                    <BusinessEmpty>
                        {created
                            ? "Recorded under 2. Activities as “" +
                                (created.name.trim() || "an untitled activity") + "”."
                            : "An activity for this has been recorded under 2. Activities."}
                    </BusinessEmpty>
                )}

            </>
        );

    }

    /**
     * Who a resource is provided by, or which External Professional
     * or Partner takes it on -- chosen from 3. Partnerships &
     * Providers, or named here through "Other…".
     *
     * "Other…" records a new card under 3. Partnerships & Providers
     * and chooses it, in one write (see applySlot), then offers the
     * box that names it. The name typed there IS the card's name --
     * one fact, in one place.
     */
    function partnerPicker(
        what: string,
        scope: Scope,
        kind: "professionals" | "providers",
        slot: BusinessResourceSlotValue,
        applySlot: (
            base: BusinessCapabilityValue,
            patch: Partial<BusinessResourceSlotValue>
        ) => BusinessCapabilityValue
    ) {

        const list = partnersOf(scope, kind);

        const noun = kind === "providers"
            ? "Provider"
            : "External Professional / Partner";

        const choices = uniqueChoices(
            list,
            kind === "providers" ? "Unnamed provider" : "Unnamed partner"
        );

        const chosen = list.find(partner => partner.id === slot.providerId);

        const stopNaming = () => setNaming(current => {
            const next = new Set(current);
            next.delete(slot.id);
            return next;
        });

        return (
            <>

                <BusinessField label={noun} inline>
                    <OptionPicker
                        label={what + " " + noun.toLocaleLowerCase()}
                        placeholder={"Select " + (kind === "providers" ? "a provider" : "a partner")}
                        options={[...choices.map(choice => choice.label), OTHER_PARTNER]}
                        disabled={disabled}
                        value={choices.find(
                            choice => choice.id === slot.providerId
                        )?.label ?? ""}
                        onChange={(next) => {

                            if (next !== OTHER_PARTNER) {
                                stopNaming();
                                onChange(applySlot(capability, {
                                    providerId: choices.find(
                                        choice => choice.label === next
                                    )?.id ?? ""
                                }));
                                return;
                            }

                            const partner: BusinessPartnerValue = {
                                ...createBusinessPartner(),
                                offeringIds: scope === "offering" ? [...slot.offeringIds] : []
                            };

                            onChange(applySlot(
                                withPartners(capability, scope, kind, [...list, partner]),
                                { providerId: partner.id }
                            ));

                            setNaming(current => new Set(current).add(slot.id));

                        }}
                    />
                </BusinessField>

                {/* What it costs is on the provider's own card, so one
                    provider serving several needs is paid for once. */}
                {chosen && chosen.cost.price.trim() !== "" && (
                    <p className="business-capability-total">
                        {moneyFormatter(chosen.cost.currency || organisationCurrency)(parseAmount(chosen.cost.price) ?? 0)}
                        {" "}
                        {(BUSINESS_COST_FREQUENCIES.find(entry => entry.id === chosen.cost.frequency)?.label ?? "").toLowerCase()}
                        , priced on its card under 3. Partnerships & Providers.
                    </p>
                )}

                {chosen && naming.has(slot.id) && (
                    <BusinessText
                        label={"Name the " + noun.toLocaleLowerCase()}
                        value={chosen.name}
                        disabled={disabled}
                        onChange={(next) => setPartners(
                            scope, kind,
                            list.map(partner => partner.id === chosen.id
                                ? { ...partner, name: next }
                                : partner)
                        )}
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

        return (
            <BusinessCard
                key={slot.id}
                anchor={slot.id}
                className="business-capability-slot"
                kind="Resource"
                number={number}
                name={slot.name}
                onName={(next) => onSlot({ name: next })}
                open={folds.isOpen(slot.id)}
                onToggle={() => folds.toggle(slot.id)}
                disabled={disabled}
                summary={summaryText(
                    BUSINESS_RESOURCE_STATUSES.find(status => status.id === slot.status)?.label,
                    costText(slot.cost, organisationCurrency ?? "")
                )}
                actions={
                    <BusinessRemove
                        what={"Resource " + number}
                        disabled={disabled}
                        onRemove={onRemove}
                    />
                }
            >

                <div className="business-capability-stack">

                    {/* How many, as a number: empty is one. What a
                        count cannot say ("3 tables, 6 shelving units")
                        belongs in the Description. 0 is kept as typed,
                        so the box does not change under the caret, but
                        counts as 1 and says so. */}
                    <BusinessField label="Quantity" inline>
                        <input
                            type="text"
                            inputMode="decimal"
                            className="interview-input"
                            aria-label={"Resource " + number + " quantity"}
                            placeholder="1"
                            disabled={disabled}
                            value={slot.quantity}
                            onChange={(event) => onSlot({
                                quantity: limitedNumberText(event.target.value, slot.quantity, NUMBER_LIMITS.quantity)
                            })}
                        />
                        {parseDecimal(slot.quantity) === 0 && (
                            <p className="business-capability-total">
                                A quantity must be more than 0. It is counted as 1.
                            </p>
                        )}
                    </BusinessField>

                </div>

                {statusFields(
                    "Resource " + number, scope, slot,
                    BUSINESS_RESOURCE_STATUSES.map(status => status.id),
                    applySlot
                )}

                <OptionalNote
                    label="Description / Relevant Information"
                    ariaLabel={"Resource " + number + " description"}
                    disabled={disabled}
                    value={slot.description}
                    onChange={(next) => onSlot({ description: next })}
                />

                {/* The links last, under the Description (the one card order). */}
                {scope === "offering" && offeringsField(
                    slot.offeringIds,
                    (next) => onSlot({ offeringIds: next }),
                    "Resource " + number + " linked Offerings",
                    <>
                        Define an Offering on the Foundation page first
                        {onOpenFoundation && (
                            <>
                                {": "}
                                <button
                                    type="button"
                                    className="business-engagement-link"
                                    onClick={() => onOpenFoundation()}
                                >
                                    open it
                                </button>
                            </>
                        )}
                        .
                    </>
                )}

            </BusinessCard>
        );
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
        help: string,
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

        const foldKey = "fold-subsection-" + groupId + "-" + subsectionId;

        const open = !collapsed.has(foldKey);

        const groupLabel = BUSINESS_RESOURCE_GROUPS.find(
            group => group.id === groupId
        )?.label;

        return (
            <div
                className="business-capability-subsection"
                key={subsectionId}
                data-anchor={"subsection-" + groupId + "-" + subsectionId}
            >

                <div className="business-capability-subsection-head fold-group-head">

                    <FoldArrow
                        open={open}
                        label={(groupLabel ? groupLabel + " → " : "") + (title.trim() || "unnamed subsection")}
                        onToggle={() => toggle(foldKey)}
                    />

                    {own
                        ? (
                            /* NAMED WHERE IT IS READ, the way a card
                               takes its name in its own head: the
                               box sits where the title of a fixed
                               subsection does, so "Lighting" added
                               under Workstation reads as one of
                               Furniture's kind. */
                            <input
                                type="text"
                                className="interview-input business-capability-subsection-name"
                                aria-label={own.ariaLabel}
                                placeholder="Name this subsection"
                                disabled={disabled}
                                value={title}
                                onChange={(event) => own.onName(event.target.value)}
                            />
                        )
                        : (
                            <span className="business-foundation-label-info">
                                <span className="business-capability-subhead">
                                    <InfoText text={title}>
                                        {help.length > 0 && (
                                            <InfoNote label={title} points={[help]} fullList />
                                        )}
                                    </InfoText>
                                </span>
                            </span>
                        )}

                    <FoldAllToggle
                        ids={slots.map(slot => slot.id)}
                        folds={folds}
                        label="resources"
                    />

                    {own && (
                        <BusinessRemove
                            what={title.trim() || "this unnamed subsection"}
                            disabled={disabled}
                            onRemove={own.onRemove}
                        />
                    )}

                </div>

                {open && slots.map(slot => resourceCard(
                    "infrastructure",
                    slot,
                    slots.indexOf(slot) + 1,
                    (base, patch) => withSlots(base, slots.map(
                        entry => entry.id === slot.id ? { ...entry, ...patch } : entry
                    )),
                    () => setSlots(slots.filter(entry => entry.id !== slot.id))
                ))}

                {open && (
                    <BusinessAddButton
                        label="Resource"
                        disabled={disabled}
                        onAdd={() => {
                            const slot = createBusinessResourceSlot();
                            setSlots([...slots, slot]);
                            folds.expand(slot.id);
                        }}
                    />
                )}

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

        return (
            <>

                {group.kinds.map(kind => resourceSubsection(
                    group.id, kind.id, kind.label, kind.help,
                    slotsOf(kind.id), null
                ))}

                {added.map((entry, index) => resourceSubsection(
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
                ))}

                {/* The specification's "Other -> Specify/Name":
                    a subsection of the founder's own, for whatever
                    the fixed list does not cover -- named in its
                    own head once it is added. */}
                <BusinessAddButton
                    label="Other"
                    disabled={disabled}
                    onAdd={() => update({
                        resources: {
                            ...capability.resources,
                            [group.id]: [
                                ...stored,
                                {
                                    id: randomId("subsection"),
                                    name: "",
                                    slots: []
                                }
                            ]
                        }
                    })}
                />

            </>
        );

    }

    /* ---------- 1. Founders ---------- */

    function founderCard(founder: BusinessFounderValue, index: number) {

        const change = (patch: Partial<BusinessFounderValue>) => update({
            founders: capability.founders.map(
                entry => entry.id === founder.id ? { ...entry, ...patch } : entry
            )
        });

        const responsibilities = businessFounderResponsibilities(
            capability, founder.id
        );

        const tally = businessResponsibilitiesTally(responsibilities);

        const responsibilitiesOpen = responsibilityFolds.get(founder.id) ?? tally.startsOpen;

        const responsibilitiesId = "responsibilities-" + founder.id;

        const founderLabel = founder.name.trim() || "Founder " + (index + 1);

        const founderDelivery = founderDeliveryHours(founder);

        const workingHours = founderWorkingHours(founder);

        /* Both figures are a week's or a month's, as the founder
           chooses; the capacity is always counted a month. */
        const weekly = founder.hoursPeriod === "week";
        const per = weekly ? "a week" : "a month";

        /* Hours in the period chosen; delivery hours never more
           than the working hours typed beside them. */
        const hoursLimit = weekly ? NUMBER_LIMITS.hoursWeek : NUMBER_LIMITS.hoursMonth;
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
                number={index + 1}
                name={founder.name}
                open={folds.isOpen(founder.id)}
                onToggle={() => folds.toggle(founder.id)}
                disabled={disabled}
                summary={summaryText(founder.roles[0])}
            >

                <div className="business-capability-stack">

                    {/* Answered on the Founders Profile page, on the
                        founder's own card -- shown here, not asked. */}
                    <BusinessField label="Roles">
                        {founder.roles.length === 0
                            ? (
                                <BusinessEmpty>
                                    None yet. Add them under 1. Identity System
                                    → 4. Founders Profile → 1. Founders.
                                </BusinessEmpty>
                            )
                            : (
                                <NumberedListStatic
                                    lines={founder.roles.map((role, position) => ({
                                        key: role + position,
                                        text: role
                                    }))}
                                />
                            )}
                    </BusinessField>

                    {/* Laid out as a Price is, but the currency is
                        not chosen: a salary is paid in the
                        organization's own, so it is shown, not asked.
                        With the hours below, a run of short values
                        whose labels all sit beside them
                        (.business-field-run), under Roles' label above. */}
                    <div className="business-field-run">
                        <BusinessField label={labelWithCurrency("Salary", organisationCurrency)} inline>
                            <div className="business-capability-price">

                                <input
                                    type="text"
                                    inputMode="decimal"
                                    className="interview-input"
                                    aria-label={nameWithCurrency(founderLabel + " salary", organisationCurrency)}
                                    placeholder="Salary per month"
                                    disabled={disabled}
                                    value={founder.salary}
                                    onChange={(event) => change({
                                        salary: limitedNumberText(event.target.value, founder.salary, NUMBER_LIMITS.money)
                                    })}
                                />

                            </div>
                        </BusinessField>
                    </div>

                </div>

                {/* The time this founder has, and how much of it goes
                    on delivering Offerings: what 4. Delivery under
                    Offering's Capability adds up as the capacity. */}
                <div className="delivery-founder-hours business-field-run">

                    <BusinessField label="Hours Given" info={DELIVERY_HELP.period} inline>
                        <OptionPicker
                            label={founderLabel + " hours given per week or per month"}
                            placeholder="Per month"
                            options={["Per month", "Per week"]}
                            disabled={disabled}
                            value={weekly ? "Per week" : "Per month"}
                            onChange={(next) => change({ hoursPeriod: next === "Per week" ? "week" : "month" })}
                        />
                    </BusinessField>

                    <BusinessField label={"Working Hours / " + (weekly ? "Week" : "Month")} info={DELIVERY_HELP.hours} inline>
                        <input
                            type="text"
                            inputMode="decimal"
                            className="interview-input delivery-number"
                            aria-label={founderLabel + " working hours " + per}
                            placeholder={weekly ? "40" : "173"}
                            disabled={disabled}
                            value={founder.hours}
                            onChange={(event) => change({
                                hours: limitedNumberText(event.target.value, founder.hours, hoursLimit)
                            })}
                        />
                    </BusinessField>

                    <BusinessField label={"Delivery Hours / " + (weekly ? "Week" : "Month")} info={DELIVERY_HELP.deliveryHours} inline>
                        <input
                            type="text"
                            inputMode="decimal"
                            className="interview-input delivery-number"
                            aria-label={founderLabel + " delivery hours " + per}
                            placeholder={weekly ? "e.g. 22" : "e.g. 96"}
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
                        <BusinessField label="Delivering (%)" info={DELIVERY_HELP.share} inline>
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

                {founderDelivery !== null && (
                    <p className="delivery-muted">
                        <InfoText
                            text={(legacyShare
                                ? "About " + formatHours(founderDelivery) + " hours a month for delivery"
                                : weekly
                                    ? "Delivery hours: " + formatHours(founderDelivery / WEEKS_PER_MONTH) + " a week, about " +
                                        formatHours(founderDelivery) + " a month"
                                    : "Delivery hours: " + formatHours(founderDelivery) + " a month") +
                                (workingHours !== null && workingHours > 0
                                    ? " (" + formatHours(Math.round(founderDelivery / workingHours * 100)) + "% of working hours)."
                                    : ".")}
                        >
                            {/* The weekly-to-monthly conversion just shown,
                                when that is the one given. */}
                            {!legacyShare && weekly && (
                                <InfoNote label="Hours a month" points={HOURS_PER_MONTH_HELP} />
                            )}
                        </InfoText>
                    </p>
                )}

                {/* Written by the activities that name this founder
                    as responsible, never typed here -- one fact, one
                    place. It folds, with the cards' own arrow, and
                    says how much of it is done ("Completed 3/15"), so
                    a long list can be put away. */}
                <div className="business-foundation-field">

                    <span className="business-foundation-label-info business-capability-responsibilities-head">

                        {responsibilities.length > 0 && (
                            <FoldArrow
                                open={responsibilitiesOpen}
                                label={"Responsibilities of " + founderLabel}
                                onToggle={() => setResponsibilityFolds(current =>
                                    new Map(current).set(founder.id, !responsibilitiesOpen)
                                )}
                            />
                        )}

                        <span className="field-label business-foundation-label">
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
                                {"Completed " + tally.completed + "/" + tally.total}
                            </span>
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
                            const active = responsibilities.filter(entry => !entry.completed);
                            const done = responsibilities.filter(entry => entry.completed);
                            const doneKey = "responsibilities-done-" + founder.id;
                            const doneOpen = completedOpen.has(doneKey);
                            return (
                                <div id={responsibilitiesId}>
                                    {active.length > 0 && (
                                        <NumberedListStatic
                                            lines={active.map((entry, position) => ({
                                                key: entry.name + position,
                                                text: entry.name
                                            }))}
                                        />
                                    )}
                                    {done.length > 0 && (
                                        <div className="business-capability-completed">
                                            <button
                                                type="button"
                                                className="business-capability-completed-head"
                                                aria-expanded={doneOpen}
                                                aria-controls={doneKey}
                                                onClick={() => setCompletedOpen(current => toggledIn(current, doneKey))}
                                            >
                                                {"Completed " + done.length}
                                            </button>
                                            {doneOpen && (
                                                <div id={doneKey}>
                                                    <NumberedListStatic
                                                        start={active.length + 1}
                                                        lines={done.map((entry, position) => ({
                                                            key: entry.name + position,
                                                            text: entry.name,
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

    /* ---------- 2. Workspace ---------- */

    function workspaceFields() {

        const workspace = capability.workspace;

        const change = (patch: Partial<typeof workspace>) => update({
            workspace: { ...workspace, ...patch }
        });

        /* The Workspace answers the same Status question every
           resource does, so it reuses the same control -- shaped
           into a slot for it, since it has no card of its own. */
        const asSlot: BusinessResourceSlotValue = {
            ...createBusinessResourceSlot(),
            id: "workspace",
            name: "Workspace",
            status: workspace.status,
            cost: workspace.cost,
            providerId: workspace.providerId
        };

        return (
            <>

                <div className="business-capability-stack">

                    <BusinessField label="Workspace" inline>
                        <OptionPicker
                            label="Workspace"
                            placeholder="Select a workspace"
                            options={BUSINESS_WORKSPACE_KINDS.map(
                                kind => kind.label
                            )}
                            disabled={disabled}
                            value={BUSINESS_WORKSPACE_KINDS.find(
                                kind => kind.id === workspace.kind
                            )?.label ?? ""}
                            onChange={(next) => change({
                                kind: BUSINESS_WORKSPACE_KINDS.find(
                                    kind => kind.label === next
                                )?.id ?? "",
                                kindOther: ""
                            })}
                        />
                    </BusinessField>

                    {workspace.kind === "other" && (
                        <BusinessText
                            label="Name the workspace"
                            value={workspace.kindOther}
                            disabled={disabled}
                            onChange={(next) => change({ kindOther: next })}
                        />
                    )}

                </div>

                {statusFields(
                    "Workspace",
                    "infrastructure",
                    asSlot,
                    BUSINESS_WORKSPACE_STATUS_IDS,
                    /* The Workspace has no slot of its own, so
                       the three fields the status can set are
                       mapped onto it by hand. */
                    (base, patch) => ({
                        ...base,
                        workspace: {
                            ...base.workspace,
                            ...(patch.status !== undefined
                                ? { status: patch.status } : {}),
                            ...(patch.cost !== undefined
                                ? { cost: patch.cost } : {}),
                            ...(patch.providerId !== undefined
                                ? { providerId: patch.providerId } : {})
                        }
                    })
                )}

            </>
        );

    }

    /* ---------- 2. Activities ---------- */

    /**
     * Who performs an activity: one picker per person, since an
     * activity can take several. A person already chosen is not
     * offered again, and a picker is added only once every one
     * shown has somebody in it.
     */
    function performerFields(
        what: string,
        who: readonly { id: string; label: string }[],
        performerIds: string[],
        onNext: (next: string[]) => void
    ) {

        // Always one picker, even before anybody is chosen.
        const rows = performerIds.length > 0 ? performerIds : [""];

        const canAdd = rows.every(id => id.length > 0) && rows.length < who.length;

        /* One picker and nothing under it is a single value, labelled
           beside it; with a second picker or "+ Add Performer" under
           it, the label goes above, as every multi-line field's does. */
        return (
            <BusinessField label="Performer" inline={rows.length === 1 && !canAdd}>
                {who.length === 0
                    ? (
                        <BusinessEmpty>
                            Add a founder, or a partner under 3. Partnerships & Providers.
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
                                        placeholder="Select a performer"
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

                                    {rows.length > 1 && (
                                        <BusinessRemove
                                            what={what + " performer " + (position + 1)}
                                            disabled={disabled}
                                            onRemove={() => onNext(rows.filter(
                                                (_, at) => at !== position
                                            ))}
                                        />
                                    )}

                                </div>
                            ))}

                            {canAdd && (
                                <BusinessAddButton
                                    label="Performer"
                                    disabled={disabled}
                                    onAdd={() => onNext([...rows, ""])}
                                />
                            )}

                        </div>
                    )}
            </BusinessField>
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
        what?: string
    ) {

        if (automatic.length > 0) {
            return (
                <BusinessField label="Responsibility" info={info} inline>
                    <span className="business-capability-automatic">
                        {founderChoices.find(choice => choice.id === automatic)?.label ?? ""}
                    </span>
                </BusinessField>
            );
        }

        return chooser(
            "Responsibility",
            founderChoices,
            current,
            onNext,
            "Select a founder",
            "Add a founder under 1. Identity System → 3. Legal Entity → 2. Founders & Ownership.",
            info,
            what ? what + " responsibility" : undefined,
            true
        );

    }

    function activityRow(
        scope: Scope,
        activity: BusinessActivityValue,
        number: number,
        /** null for a completed row, which cannot be reordered. */
        drag: ReturnType<typeof useListDrag> | null,
        index: number,
        onActivity: (patch: Partial<BusinessActivityValue>) => void,
        onRemove: () => void
    ) {

        const who = performerChoices(scope);

        // The drag hook supplies a class of its own while a row is
        // being dragged over, so the two are merged rather than one
        // overwriting the other.
        const { className: dropTarget, ...dragProps } = drag ? drag.itemProps(index) : { className: "" };

        const open = folds.isOpen(activity.id);

        /* Who is responsible, resolved the same way responsibilityField
           shows it: the automatic rule when one applies, else the
           founder chosen -- always among founderChoices, never a
           partner (see responsibilityField). */
        const resolvedResponsibleId =
            businessAutoResponsibleId(founderIds, activity.performerIds) ||
            activity.responsibleId;

        const responsibleName = founderChoices.find(
            choice => choice.id === resolvedResponsibleId
        )?.label ?? "";

        const summary = responsibleName ||
            activity.description.split("\n")[0]?.trim() || "";

        return (
            <div
                className={"business-capability-activity " + dropTarget}
                key={activity.id}
                data-anchor={activity.id}
                {...dragProps}
            >

                {/* The head every folding card shares (see
                    .fold-card-head): folded, the name is text and the
                    summary a row of its own under it. */}
                <div className="business-capability-activity-head fold-card-head">

                    <FoldArrow open={open} label={"Activity " + number} onToggle={() => folds.toggle(activity.id)} />

                    <span
                        className={"strategy-box-number" + (drag ? " business-capability-handle" : "")}
                        {...drag?.handleProps}
                    >
                        <span className="list-number">{number + "."}</span>
                    </span>

                    {open
                        ? (
                            <CardNameInput
                                ariaLabel={"Activity " + number + " name"}
                                placeholder="Activity name"
                                disabled={disabled}
                                value={activity.name}
                                onChange={(name) => onActivity({ name })}
                            />
                        )
                        : (
                            <span className="strategy-name-static">
                                {activity.name.trim() || "Unnamed activity"}
                            </span>
                        )}

                    <BusinessRemove
                        what={"Activity " + number}
                        disabled={disabled}
                        onRemove={onRemove}
                    />

                    {!open && summary && (
                        <div className="business-card-summary">{summary}</div>
                    )}

                </div>

                {open && (<>

                {/* Performer and Responsibility side by side (stacked in
                    a narrow card): business-capability-activity-fields. */}
                <div className="business-capability-stack business-capability-activity-fields">

                    {performerFields(
                        "Activity " + number,
                        who,
                        activity.performerIds,
                        (next) => onActivity({ performerIds: next })
                    )}

                    {responsibilityField(
                        businessAutoResponsibleId(founderIds, activity.performerIds),
                        activity.responsibleId,
                        (next) => onActivity({ responsibleId: next }),
                        undefined,
                        "Activity " + number
                    )}

                </div>

                <OptionalNote
                    label="Description"
                    ariaLabel={"Activity " + number + " description"}
                    disabled={disabled}
                    value={activity.description}
                    onChange={(next) => onActivity({ description: next })}
                />

                {/* The links last, under the Description. */}
                {scope === "offering" && offeringsField(
                    activity.offeringIds,
                    (next) => onActivity({ offeringIds: next }),
                    "Activity " + number + " linked Offerings",
                    "Define an Offering on the Foundation page first."
                )}

                {/* Done, at the very end (the one card order: fields,
                    Description, links, then the card's state). */}
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

                </>)}

            </div>
        );

    }

    /**
     * One list of activities: the active ones, then the completed
     * ones folded away behind their own count.
     *
     * The active count is drawn in red because it is the number
     * that means something -- what is left to do.
     */
    function activityList(
        scope: Scope,
        key: string,
        activities: BusinessActivityValue[],
        setActivities: (next: BusinessActivityValue[]) => void,
        /** Rows side by side, for a list with the width to spare. */
        columns = 1
    ) {

        const active = activities.filter(activity => !activity.completed);
        const done = activities.filter(activity => activity.completed);

        return (
            <ActivityList
                scope={scope}
                listKey={key}
                active={active}
                done={done}
                activities={activities}
                setActivities={setActivities}
                completedOpen={completedOpen.has(key)}
                onToggleCompleted={() => setCompletedOpen(current => toggledIn(current, key))}
                renderRow={activityRow}
                columns={columns}
                disabled={disabled}
                onAdded={folds.expand}
            />
        );

    }

    /* ---------- 3. Partnerships & Providers ---------- */

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

        return (
            <BusinessCard
                key={partner.id}
                anchor={partner.id}
                className="business-capability-slot"
                kind={kind === "professionals" ? "Professional" : "Provider"}
                number={number}
                name={partner.name}
                onName={(next) => change({ name: next })}
                open={folds.isOpen(partner.id)}
                onToggle={() => folds.toggle(partner.id)}
                disabled={disabled}
                summary={summaryText(
                    costText(partner.cost, organisationCurrency ?? ""),
                    partner.description
                )}
                actions={
                    <BusinessRemove
                        what={partner.name.trim() || "entry " + number}
                        disabled={disabled}
                        onRemove={() => setPartners(
                            scope, kind,
                            list.filter(entry => entry.id !== partner.id)
                        )}
                    />
                }
            >

                <div className="business-capability-stack">

                    {responsibilityField(
                        businessAutoResponsibleId(founderIds),
                        partner.responsibleId,
                        (next) => change({ responsibleId: next }),
                        SECTIONS.infrastructure.responsibility,
                        partner.name.trim() || "Entry " + number
                    )}

                </div>

                {costFields(
                    partner.name.trim() || "Entry " + number,
                    partner.cost,
                    (next) => change({ cost: next })
                )}

                <OptionalNote
                    label="Description / Relevant Information"
                    ariaLabel={"Entry " + number + " description"}
                    disabled={disabled}
                    value={partner.description}
                    onChange={(next) => change({ description: next })}
                />

                {/* The links last, under the Description. */}
                {scope === "offering" && offeringsField(
                    partner.offeringIds,
                    (next) => change({ offeringIds: next }),
                    (partner.name.trim() || "Entry " + number) + " linked Offerings",
                    "Define an Offering on the Foundation page first."
                )}

            </BusinessCard>
        );

    }

    function partnerGroup(
        scope: Scope,
        kind: "professionals" | "providers",
        title: string,
        note: string[]
    ) {

        const list = partnersOf(scope, kind);

        /* A COLUMN, beside the other kind (see partnerColumns). */
        return (
            <div className="business-capability-column" key={kind} data-anchor={"partners-" + scope + "-" + kind}>

                <BusinessGroup
                    title={title}
                    info={note}
                    titleExtra={
                        <FoldAllToggle
                            ids={list.map(partner => partner.id)}
                            folds={folds}
                            label={kind}
                        />
                    }
                >

                    {list.map((partner, index) => partnerCard(
                        scope, kind, partner, index + 1
                    ))}

                    <BusinessAddButton
                        label={kind === "professionals" ? "Professional" : "Provider"}
                        disabled={disabled}
                        onAdd={() => {
                            const partner = createBusinessPartner();
                            setPartners(scope, kind, [...list, partner]);
                            folds.expand(partner.id);
                        }}
                    />

                </BusinessGroup>

            </div>
        );

    }

    /**
     * 1. External Professionals & Partners BESIDE 2. Providers, in
     * the grid 1. Resources lays its sections out on: two kinds of
     * somebody the organisation engages, read across rather than one
     * long list after the other.
     */
    function partnerColumns(scope: Scope) {
        return (
            <div className="business-capability-columns">

                {partnerGroup(
                    scope, "professionals",
                    "1. External Professionals & Partners",
                    SECTIONS.infrastructure.professionals
                )}

                {partnerGroup(
                    scope, "providers",
                    "2. Providers",
                    SECTIONS.infrastructure.providers
                )}

            </div>
        );
    }

    /* ---------- The two sections ---------- */

    /**
     * One of a card's three numbered sections, folding on its own
     * arrow like every level inside it.
     *
     * Its arrow names the CARD too: both cards hold a 1. Resources,
     * a 2. Activities and a 3. Partnerships & Providers, and six
     * arrows announcing three names would be the thing the path is
     * there to prevent.
     */
    function cardSection(
        scope: Scope,
        title: string,
        info: InfoPoint[] | undefined,
        body: () => ReactNode,
        titleExtra?: ReactNode
    ) {
        const part = /Resources/.test(title) ? "resources"
            : /Activities/.test(title) ? "activities"
                : /Delivery/.test(title) ? "delivery"
                    : "partners";
        return foldingGroup(
            "fold-section-" + scope + "-" + title,
            title,
            (scope === "infrastructure" ? "Infrastructure" : "Offering's Capability") +
                " → " + title,
            info,
            "business-capability-section",
            body,
            true,
            "section-" + scope + "-" + part,
            titleExtra
        );
    }

    /**
     * One section of 1. Resources, as a column of the group it sits
     * in: its number and title, its "i", and what it holds.
     */
    function resourceColumn(
        grouping: typeof RESOURCE_GROUPINGS[number],
        id: string
    ) {

        const title = (RESOURCE_SECTION_ORDER.indexOf(id) + 1) + ". " + (
            id === "founders" ? "Founders"
                : id === "workspace" ? "Workspace"
                    : BUSINESS_RESOURCE_GROUPS.find(group => group.id === id)?.label ?? ""
        );

        const path = "1. Resources → " + grouping.label + " → " + title;

        const key = "fold-resource-section-" + id;

        if (id === "founders") {
            return foldingGroup(
                key, title, path, undefined, "business-capability-column",
                () => (
                    <>

                        {founders.map(founderCard)}

                        {founders.length === 0 && (
                            <BusinessEmpty>
                                Add founders under 1. Identity System → 3. Legal
                                Entity → 2. Founders & Ownership and they appear
                                here.
                            </BusinessEmpty>
                        )}

                    </>
                ),
                false,
                "resource-group-founders"
            );
        }

        if (id === "workspace") {
            return foldingGroup(
                key, title, path, SECTIONS.infrastructure.workspace,
                "business-capability-column", workspaceFields, false,
                "resource-group-workspace"
            );
        }

        const group = BUSINESS_RESOURCE_GROUPS.find(entry => entry.id === id);

        // A section named in RESOURCE_GROUPINGS that the resource
        // groups do not define: nothing to draw.
        if (!group) {
            return null;
        }

        return foldingGroup(
            key, title, path,
            group.notes.length > 0 ? [...group.notes] : undefined,
            "business-capability-column",
            () => resourceGroup(group),
            false,
            "resource-group-" + group.id
        );

    }

    /**
     * One activity category's list, and the write that replaces it.
     * The category is stored only once something is written into it.
     */
    function categoryActivities(categoryId: string) {

        const stored = capability.activities.find(
            entry => entry.id === categoryId
        );

        return activityList(
            "infrastructure",
            "activities-" + categoryId,
            stored?.activities ?? [],
            (next: BusinessActivityValue[]) => update({
                activities: stored
                    ? capability.activities.map(entry =>
                        entry.id === categoryId
                            ? { ...entry, activities: next }
                            : entry)
                    : [
                        ...capability.activities,
                        { id: categoryId, name: "", activities: next }
                    ]
            })
        );

    }

    /** One activity category's activities, as stored (none until written). */
    function categoryActivityList(categoryId: string): BusinessActivityValue[] {
        return capability.activities.find(
            entry => entry.id === categoryId
        )?.activities ?? [];
    }

    /**
     * An activity group's "Expand all", for its TITLE ROW (the category
     * column's, or the Offering's 2. Activities): the active cards only,
     * as the completed ones sit in their own folded list.
     */
    function activityFoldAll(activities: readonly BusinessActivityValue[]) {
        return (
            <FoldAllToggle
                ids={activities.filter(activity => !activity.completed).map(activity => activity.id)}
                folds={folds}
                label="activities"
            />
        );
    }

    function infrastructureSection() {
        return (
            <>

                {cardSection("infrastructure", "1. Resources", SECTIONS.infrastructure.resources, () => (
                    <>

                        {/* TWO GROUPS, EACH ITS SECTIONS SIDE BY SIDE
                            (see RESOURCE_GROUPINGS). A group folds
                            all three of its sections at once; each
                            section folds on its own. */}
                        {RESOURCE_GROUPINGS.map(grouping => foldingGroup(
                            "fold-resources-" + grouping.id,
                            grouping.label,
                            "1. Resources → " + grouping.label,
                            undefined,
                            "business-capability-group",
                            () => (
                                <div className="business-capability-columns business-capability-columns-3">
                                    {grouping.sections.map(
                                        id => resourceColumn(grouping, id)
                                    )}
                                </div>
                            ),
                            true,
                            grouping.sections.map(id => "contains-" + id).join(" ")
                        ))}

                    </>
                ))}

                {cardSection("infrastructure", "2. Activities", SECTIONS.infrastructure.activities, () => (
                    <>

                        {/* The same arrangement: two groups, two
                            categories side by side in each. */}
                        {ACTIVITY_GROUPINGS.map(grouping => foldingGroup(
                            "fold-activities-" + grouping.id,
                            grouping.label,
                            "2. Activities → " + grouping.label,
                            undefined,
                            "business-capability-group",
                            () => (
                                <div className="business-capability-columns">
                                    {grouping.categories.map(id => {

                                        const category = BUSINESS_ACTIVITY_CATEGORIES.find(
                                            entry => entry.id === id
                                        );

                                        const title =
                                            (ACTIVITY_CATEGORY_ORDER.indexOf(id) + 1) +
                                            ". " + (category?.label ?? "");

                                        return foldingGroup(
                                            "fold-activity-category-" + id,
                                            title,
                                            "2. Activities → " + grouping.label +
                                                " → " + title,
                                            category ? [category.note] : undefined,
                                            "business-capability-column",
                                            () => categoryActivities(id),
                                            false,
                                            undefined,
                                            activityFoldAll(categoryActivityList(id))
                                        );

                                    })}
                                </div>
                            )
                        ))}

                        {/* Categories can no longer be added. One a
                            founder added earlier is still shown while
                            it holds activities, so none of them go
                            missing; an empty one is dropped. */}
                        {/* Titled through uniqueChoices, so two
                            unnamed ones read "Untitled category" and
                            "Untitled category (2)" -- and their
                            arrows do not announce alike. */}
                        {uniqueChoices(
                            capability.activities.filter(
                                category => !FIXED_ACTIVITY_IDS.has(category.id) &&
                                    category.activities.length > 0
                            ),
                            "Untitled category"
                        ).map(category => foldingGroup(
                            "fold-activity-category-" + category.id,
                            category.label,
                            "2. Activities → " + category.label,
                            undefined,
                            "business-capability-group",
                            () => categoryActivities(category.id),
                            true,
                            undefined,
                            activityFoldAll(categoryActivityList(category.id))
                        ))}

                    </>
                ))}

                {cardSection("infrastructure", "3. Partnerships & Providers", SECTIONS.infrastructure.partnerships, () => (
                    <>

                        {partnerColumns("infrastructure")}

                    </>
                ))}

            </>
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

        return (
            <div className="delivery-pace">

                {!recurring && weeks > 0 && (
                    <p>
                        <strong>While one runs:</strong>{" "}
                        {perPerson.map(row => row.label + " about " + formatHours(row.hours / weeks) + " h a week").join(", ")}
                        {", for " + formatHours(weeks) + (weeks === 1 ? " week." : " weeks.")}
                    </p>
                )}

                {expected
                    ? (
                        <p>
                            <strong>At the expected sales</strong>{" "}
                            ({formatHours(expected.volume)} {recurring ? "active clients" : "a month"}, from {expected.source}):{" "}
                            {founders > 0 ? "about " + inFounderUnit(founders * expected.volume) + " of founders' time" : "no founders' time"}
                            {external > 0 ? ", and about " + formatHours(external * expected.volume) + " h a month external" : ""}
                            {!recurring && weeks > 0
                                ? ". Usually about " + formatHours(Math.max(0.1, Math.round(expected.volume * weeks / WEEKS_PER_MONTH * 10) / 10)) + " running at once."
                                : "."}
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
           own 3. Partnerships & Providers. Providers supply things
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

                <div className="delivery-inline-grid">
                    <BusinessField label="Delivered" info={DELIVERY_HELP.mode} inline>
                        <OptionPicker
                            label={offering.label + " delivered per unit or every month"}
                            placeholder="Per unit"
                            options={["Per unit", "Every month"]}
                            disabled={disabled}
                            value={recurring ? "Every month" : "Per unit"}
                            onChange={(next) => changeDelivery(offering.id, next === "Every month"
                                ? { mode: "monthly", duration: "" }
                                : { mode: "unit" })}
                        />
                    </BusinessField>
                </div>

                {disagrees && (
                    <p className="delivery-muted delivery-mismatch" role="note">
                        {recurring
                            ? "On Customer Engagement, customers buy this Offering one sale at a time: deliver it Per unit, or change how customers buy."
                            : "On Customer Engagement, customers buy this Offering every month: deliver it Every month, or change how customers buy."}
                    </p>
                )}

                {recurring && (
                    <div className="delivery-inline-grid">
                        <BusinessField label="Hours Given" info={DELIVERY_HELP.recurring} inline>
                            <OptionPicker
                                label={offering.label + " hours given per week or per month"}
                                placeholder="Per month"
                                options={["Per month", "Per week"]}
                                disabled={disabled}
                                value={weekly ? "Per week" : "Per month"}
                                onChange={(next) => changeDelivery(offering.id, { period: next === "Per week" ? "week" : "month" })}
                            />
                        </BusinessField>
                    </div>
                )}

                <BusinessField
                    label={recurring ? "Working Hours per Client (" + (weekly ? "a week" : "a month") + "), by person" : "Working Hours per Unit, by person"}
                    info={DELIVERY_HELP.effort}
                >
                    {rows.length === 0
                        ? (
                            <BusinessEmpty>
                                Nobody yet. Add founders under 1. Identity System → 3. Legal Entity → 2. Founders &amp; Ownership,
                                or an external professional under 3. Partnerships &amp; Providers.
                            </BusinessEmpty>
                        )
                        : (
                            <div className="delivery-people">

                                {rows.map(row => (
                                    <div className="delivery-person" key={row.id}>
                                        <span className="delivery-person-name">
                                            {row.label}
                                            <span className="delivery-person-kind">
                                                {row.external ? " (external)" : " (founder)"}
                                            </span>
                                        </span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            className="interview-input delivery-number delivery-person-hours"
                                            aria-label={row.label + " hours" + perUnit + " of " + offering.label}
                                            placeholder="0"
                                            disabled={disabled}
                                            value={shownHours[row.id] ?? ""}
                                            onChange={(event) => setHours(
                                                row.id, limitedNumberText(event.target.value, shownHours[row.id] ?? "", NUMBER_LIMITS.unitHours)
                                            )}
                                        />
                                        <span className="delivery-person-unit">h</span>
                                    </div>
                                ))}

                            </div>
                        )}

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
                                            ? ": founders " + formatHours(foundersTotal) +
                                                " h, external " + formatHours(externalTotal) + " h"
                                            : "") +
                                        (weekly ? " (about " + formatHours(total * WEEKS_PER_MONTH) + " h a month)" : "")}
                                >
                                    <InfoNote label={offering.label + " unit"} points={DELIVERY_HELP.unit} fullList />
                                </InfoText>
                            </span>
                        </p>
                    )}

                    {deliveryPace(offering.id, rows, shownHours, recurring, weekly)}

                    <p className="delivery-muted">
                        Founders' hours count against their capacity. External hours are
                        delivered, and paid for, outside it: their cost is recorded with
                        the professional.
                    </p>

                    {linkedProfessionals.length === 0 && (
                        <p className="delivery-muted">
                            To share the work with an external professional, add one under
                            3. Partnerships &amp; Providers and link it to this Offering.
                        </p>
                    )}
                </BusinessField>

                {!recurring && (
                <div className="delivery-inline-grid">

                    <BusinessField label="Calendar Time (weeks)" info={DELIVERY_HELP.duration} inline>
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

                </div>
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
                        {available === null
                            ? "Add each founder's delivery hours on the Founder cards to see the capacity."
                            : "Founders' delivery capacity: about " + formatHours(available) + " hours a month."}
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
                    <p className="delivery-muted">
                        The budgets below compare this with the hours each Offering's expected sales need.
                        Recurring work (subscriptions, retainers) uses founders' hours first; what
                        remains is flexible capacity for the other Offerings.
                    </p>

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
                        <div className="business-capability-columns business-capability-columns-3 business-capability-columns-flush">
                            {offeringChoices.map(deliveryCard)}
                        </div>
                    )}

            </>
        );

    }

    function offeringSection() {

        const offeringResources = capability.offering.resources;

        return (
            <>

                {cardSection("offering", "1. Resources", undefined, () => (
                    <>

                        {/* Three across: a resource card is short. */}
                        <div className="business-capability-columns business-capability-columns-3 business-capability-columns-flush">
                        {offeringResources.map((slot, index) => resourceCard(
                            "offering",
                            slot,
                            index + 1,
                            (base, patch) => ({
                                ...base,
                                offering: {
                                    ...base.offering,
                                    resources: base.offering.resources.map(
                                        entry => entry.id === slot.id
                                            ? { ...entry, ...patch }
                                            : entry
                                    )
                                }
                            }),
                            () => update({
                                offering: {
                                    ...capability.offering,
                                    resources: offeringResources.filter(
                                        entry => entry.id !== slot.id
                                    )
                                }
                            })
                        ))}
                        </div>

                        <BusinessAddButton
                            label="Resource"
                            disabled={disabled}
                            onAdd={() => {
                                const slot = createBusinessResourceSlot();
                                update({
                                    offering: {
                                        ...capability.offering,
                                        resources: [...offeringResources, slot]
                                    }
                                });
                                folds.expand(slot.id);
                            }}
                        />

                    </>
                ), (
                    <FoldAllToggle
                        ids={offeringResources.map(slot => slot.id)}
                        folds={folds}
                        label="resources"
                    />
                ))}

                {cardSection("offering", "2. Activities", SECTIONS.infrastructure.activities, () => (
                    <>
                        {activityList(
                            "offering",
                            "offering-activities",
                            capability.offering.activities,
                            (next) => update({
                                offering: { ...capability.offering, activities: next }
                            }),
                            2
                        )}
                    </>
                ), activityFoldAll(capability.offering.activities))}

                {cardSection("offering", "3. Partnerships & Providers", undefined, () => (
                    <>

                        {partnerColumns("offering")}

                    </>
                ))}

                {cardSection("offering", "4. Delivery", DELIVERY_HELP.section, deliverySection)}

            </>
        );

    }

    /* ---------- The page ---------- */

    const heads = [
        {
            number: 1,
            title: "Infrastructure",
            instructions: SECTIONS.infrastructure.instructions
        },
        {
            number: 2,
            title: "Offering's Capability",
            instructions: SECTIONS.offering.instructions
        }
    ];

    const cards = [
        {
            id: "infrastructure",
            number: 1,
            title: "Infrastructure",
            note: SECTIONS.infrastructure.note,
            body: infrastructureSection
        },
        {
            id: "offering-capability",
            number: 2,
            title: "Offering's Capability",
            note: SECTIONS.offering.note,
            body: offeringSection
        }
    ];

    return (

        <div
            className="answer-columns business-foundation business-engagement business-capability"
            style={{ "--answer-column-count": 2 } as CSSProperties}
        >

            {heads.map(head => (
                <h3 className="answer-column-label" key={"title-" + head.number}>
                    <span className="answer-column-label-number">
                        {head.number + "."}
                    </span>
                    <span className="answer-column-label-text">{head.title}</span>
                </h3>
            ))}

            {showInstructions && heads.map(head => (
                <div
                    className="answer-column-questions"
                    key={"questions-" + head.number}
                >
                    {head.instructions.map(line => (
                        <span
                            className="answer-question-line answer-question-line-bullet"
                            key={line}
                        >
                            {"• " + line}
                        </span>
                    ))}
                </div>
            ))}

            {columnsDivider && (
                <div className="answer-columns-divider">
                    {columnsDivider}
                </div>
            )}

            {/* One card per section, each in its own colour -- the
                same card Pages 1 and 2 use, holding the three
                subsections this page asks of both. */}
            {cards.map((card, cardIndex) => {

                const open = !collapsed.has(card.id);

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

                        <div className="strategy-box-head business-foundation-input-head business-capability-card-head fold-card-head">

                            <FoldArrow open={open} label={card.title} onToggle={() => toggle(card.id)} />

                            <CardNumber number={card.number} />

                            <span className="strategy-name-static">
                                <InfoText text={card.title}>
                                    <InfoNote
                                        label={card.title}
                                        points={card.note}
                                        fullList
                                    />
                                </InfoText>
                            </span>

                        </div>

                        {open && (
                            <Fragment key={card.id + "-body"}>
                                {card.body()}
                            </Fragment>
                        )}

                    </div>
                );

            })}

        </div>

    );

}

/**
 * The last option of a provider or partner picker: one not listed
 * yet. The ellipsis keeps it apart from a partner somebody named
 * "Other", and says choosing it asks for more.
 */
const OTHER_PARTNER = "Other…";

/** Every fixed subsection id across all four resource groups. */
const FIXED_KIND_IDS: ReadonlySet<string> = new Set(
    BUSINESS_RESOURCE_GROUPS.flatMap(group => group.kinds.map(kind => kind.id))
);

/**
 * One category's activities: the active ones, drag-reorderable,
 * then the completed ones behind their own fold.
 *
 * Its own component because it holds a hook -- useListDrag -- and a
 * hook cannot live inside a function the editor calls a variable
 * number of times per render.
 */
function ActivityList({

    scope,

    listKey,

    active,

    done,

    activities,

    setActivities,

    completedOpen,

    onToggleCompleted,

    renderRow,

    columns,

    disabled,

    onAdded

}: {

    scope: Scope;
    listKey: string;
    active: BusinessActivityValue[];
    done: BusinessActivityValue[];
    activities: BusinessActivityValue[];
    setActivities: (next: BusinessActivityValue[]) => void;
    completedOpen: boolean;
    onToggleCompleted: () => void;
    renderRow: (
        scope: Scope,
        activity: BusinessActivityValue,
        number: number,
        drag: ReturnType<typeof useListDrag> | null,
        index: number,
        onActivity: (patch: Partial<BusinessActivityValue>) => void,
        onRemove: () => void
    ) => ReactNode;
    columns: number;
    disabled: boolean;
    /** Called with a newly created activity's id, to open its card. */
    onAdded?: (id: string) => void;

}) {

    /* Several rows across, on the grid 1. Resources uses. */
    const rows = (nodes: ReactNode) => columns > 1
        ? (
            <div className="business-capability-columns business-capability-columns-flush">
                {nodes}
            </div>
        )
        : nodes;

    /* Reorder acts on the ACTIVE list the reader can see, and is
       written back into the full list -- the completed ones keep
       their own order behind the fold. */
    const drag = useListDrag((from, to) => {

        const moved = [...active];
        const [taken] = moved.splice(from, 1);

        moved.splice(to, 0, taken);

        setActivities([...moved, ...done]);

    });

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

            {/* What is left to do, which is the number that
                matters. The group's "Expand all" is on its title
                row above (see activityFoldAll), as every group's is. */}
            <span className="business-capability-active" aria-live="polite">
                {"Active " + active.length}
            </span>

            {rows(active.map((activity, index) => renderRow(
                scope, activity, index + 1, drag, index,
                change(activity), remove(activity)
            )))}

            <BusinessAddButton
                label="Activity"
                disabled={disabled}
                onAdd={() => {
                    const activity = createBusinessActivity();
                    setActivities([...activities, activity]);
                    onAdded?.(activity.id);
                }}
            />

            {done.length > 0 && (
                <div className="business-capability-completed">

                    <button
                        type="button"
                        className="business-capability-completed-head"
                        aria-expanded={completedOpen}
                        aria-controls={listKey + "-completed"}
                        onClick={onToggleCompleted}
                    >
                        {/* The arrow is drawn, the same size as every
                            other fold's (see
                            .business-capability-completed-head). */}
                        {"Completed " + done.length}
                    </button>

                    {completedOpen && (
                        <div id={listKey + "-completed"}>
                            {/* No drag: the reorder acts on the active
                                list, and a completed row has no place
                                in it. */}
                            {rows(done.map((activity, index) => renderRow(
                                scope, activity, active.length + index + 1,
                                null, index,
                                change(activity), remove(activity)
                            )))}
                        </div>
                    )}

                </div>
            )}

        </>
    );

}
