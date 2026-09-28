/*
    Export blocks for the Answer Structures that have an editor of
    their own -- the pages buildAnswerBlocks has no generic shape for.

    Each turns what a page stores into the same format-agnostic
    blocks every other page exports as (headings, paragraphs, tables,
    lists), so Markdown and PDF need no knowledge of any of them.

    Several pages are answered against other pages -- Customer
    Engagement against Foundation's Segments and Offerings, the two
    Financial pages against the Legal Entity and Infrastructure &
    Capability, the Roadmap against both Strategy pages -- and so read
    them through the ExportContext the caller supplies. Without it they
    still export, naming what they can.

    The same renderers build the Business Model Canvas and the
    Business Plan (see BusinessDocuments.ts).
*/

import { AnswerType } from "../enums/AnswerType.ts";
import { type CapacityCheck, type DemandResult, deliveryAllocation, deliveryEffort, deliveryHours, demandResult, founderDeliveryHours, hasDemand, founderWorkingHours } from "./DemandCapacity.ts";
import type { AnswerDefinition } from "../model/index.ts";
import {
    BRAND_COLOUR_SLOTS,
    BRAND_HIERARCHY_LEVELS,
    BRAND_TYPEFACE_SLOTS,
    BUSINESS_ACTIVITY_CATEGORIES,
    BUSINESS_CHANNEL_ALL_OFFERINGS,
    BUSINESS_COMPETITOR_TYPES,
    BUSINESS_COST_FREQUENCIES,
    BUSINESS_JOURNEY_STAGES,
    BUSINESS_RELATIONSHIP_GOALS,
    BUSINESS_RELATIONSHIP_TYPES,
    BUSINESS_RESOURCE_GROUPS,
    BUSINESS_RESOURCE_STATUSES,
    BUSINESS_WORKSPACE_KINDS,
    type BusinessActivityValue,
    type BusinessCapabilityValue,
    type LegalEntityValue,
    type BusinessCostValue,
    type BusinessCustomerSegmentValue,
    type BusinessPartnerValue,
    type BusinessResourceSlotValue,
    type ExportBlock,
    type ExportContext,
    type StrategyMonthValue,
    STRATEGY_MONTH_NAMES,
    asBrandInventoryValue,
    asBrandStyleValue,
    asBusinessCapabilityValue,
    asBusinessEngagementValue,
    asBusinessFoundationValue,
    asLegalEntityValue,
    asStrategicPeriodValue,
    asStrategyFoundationValue,
    businessFoundationSegments,
    businessFounderResponsibilities,
    businessResponsibleId,
    withLegalEntityFounders
} from "./AnswerUtils.ts";
import {
    COST_BEHAVIOURS,
    COST_FREQUENCIES,
    COST_GROUPS,
    FUNDING_CATEGORIES,
    FUNDING_STATUSES,
    planLength,
    withDemand,
    salesCapacity,
    revenueModelLabel,
    REVENUE_FREQUENCIES,
    asFinancialFoundationValue,
    asFinancialSustainabilityValue,
    consolidateCosts,
    financialPosition,
    formatUnits,
    fundingStanding,
    fundingType,
    loanSchedule,
    moneyFormatter,
    parseAmount,
    planMonthLabel,
    sustainability,
    withPlanStart,
    allFunding,
    spentBeforePlan,
    effectiveVatBasis,
    incomeTaxRate,
    vatBases,
    type CostLine,
    type CostSources,
    type FinancialFoundationValue
} from "./FinancialModel.ts";
import { jurisdictionProfile, COUNTRIES, LEGAL_REQUIREMENT_TYPES } from "./LegalEntityJurisdictions.ts";

/* ==========================================================
   Building blocks
========================================================== */

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export function heading(value: string, level: 1 | 2 = 1): ExportBlock {
    return { kind: "subheading", text: value, level };
}

/** A paragraph, or nothing when there is nothing to say. */
export function paragraph(value: string, label?: string): ExportBlock[] {
    const body = text(value);
    if (!body) {
        return [];
    }
    return [{ kind: "paragraph", text: label ? label + ": " + body : body }];
}

/** A paragraph with its label in bold ("Mission: …"), or nothing when there is nothing to say. */
export function labelled(label: string, value: string): ExportBlock[] {
    const body = text(value);
    return body ? [{ kind: "paragraph", text: body, label }] : [];
}

/** A heading and what is under it, or nothing when nothing is. */
export function titled(title: string, blocks: ExportBlock[]): ExportBlock[] {
    return blocks.length === 0 ? [] : [heading(title), ...blocks];
}

/** Rows whose first cell only names a slot ("Primary A"): kept when another cell says something. */
function answeredRows(rows: string[][]): string[][] {
    return rows.filter(row => row.slice(1).some(cell => text(cell).length > 0));
}

/** A table, or nothing when it has no rows. */
export function table(headers: string[], rows: string[][]): ExportBlock[] {
    const kept = rows.filter(row => row.some(cell => text(cell).length > 0));
    return kept.length === 0 ? [] : [{ kind: "table", headers, rows: kept }];
}

/** "Field: answer" lines, skipping fields left empty. */
export function details(rows: [string, string][]): ExportBlock[] {
    return list(rows
        .filter(([, value]) => text(value).length > 0)
        .map(([field, value]) => field + ": " + text(value)));
}

export function list(items: string[], ordered = false): ExportBlock[] {
    const kept = items.map(text).filter(item => item.length > 0);
    return kept.length === 0
        ? []
        : [{ kind: "list", items: kept.map(item => ({ text: item, indent: 0 })), ordered }];
}

/** "Jan 2027", as the Business Documents write every date. */
function shortMonth(value: StrategyMonthValue): string {
    return month(value).replace(/^([A-Z][a-z]{2})[a-z]+/, "$1");
}

function month(value: StrategyMonthValue): string {
    const m = Number(value.month);
    return m >= 1 && m <= 12 && value.year ? STRATEGY_MONTH_NAMES[m - 1] + " " + value.year : "";
}

/** "2026-03-02" as "2 March 2026". */
function isoDate(value: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
    return match
        ? Number(match[3]) + " " + STRATEGY_MONTH_NAMES[Number(match[2]) - 1] + " " + match[1]
        : text(value);
}

/** "1 month", "3 months". */
function monthCount(count: number): string {
    return count + " month" + (count === 1 ? "" : "s");
}

/** "Excluding VAT" as "excluding VAT", keeping acronyms as they are. */
function lowerWords(label: string): string {
    return label.replace(/\b([A-Z])([a-z]+)\b/g, (_, first: string, rest: string) => first.toLowerCase() + rest);
}

function labelOf(options: readonly { id: string; label: string }[], id: string): string {
    return options.find(option => option.id === id)?.label ?? id;
}

/* ==========================================================
   Shared lookups
========================================================== */

function offeringsOf(foundation: unknown) {
    return businessFoundationSegments(foundation).flatMap(segment => segment.offerings);
}

export function offeringName(foundation: unknown, id: string): string {
    return offeringsOf(foundation).find(offering => offering.id === id)?.name.trim() || "";
}

/** Customer Engagement's Demand & Conversion, by Offering id. */
export function demandOf(context: ExportContext) {
    return asBusinessEngagementValue(context.responseOf?.(AnswerType.BusinessEngagement)).demand;
}

/** Several Offerings' names, as a list: "Homeware, Trade Collection". */
export function offeringNames(foundation: unknown, ids: readonly string[]): string {
    return ids.map(id => offeringName(foundation, id)).filter(Boolean).join(", ");
}

/** Page 3's value with the Legal Entity's founders laid over it, as Page 3 shows it. */
export function capabilityOf(value: unknown, context: ExportContext): BusinessCapabilityValue {
    const capability = asBusinessCapabilityValue(value);
    return context.legalEntity
        ? withLegalEntityFounders(capability, context.legalEntity.founders)
        : capability;
}

/** "£1,250 monthly", in the price's own currency. */
export function costText(cost: BusinessCostValue, currency: string): string {
    const price = text(cost.price);
    if (!price) {
        return "";
    }
    const amount = parseAmount(price);
    const code = cost.currency || currency;
    const frequency = cost.frequency === "other"
        ? text(cost.frequencyOther)
        : labelOf(BUSINESS_COST_FREQUENCIES, cost.frequency).toLowerCase();
    return [amount === null ? price : moneyFormatter(code)(amount), frequency].filter(Boolean).join(" ");
}

export function moneyText(value: string, currency: string): string {
    const amount = parseAmount(value);
    return amount === null ? text(value) : moneyFormatter(currency)(amount);
}

/** Resource group ids to their labels (Utilities, Workstation…). */
const RESOURCE_GROUP_LABELS: Record<string, string> = Object.fromEntries(
    BUSINESS_RESOURCE_GROUPS.map(group => [group.id, group.label])
);

/** Fixed subsection ids to their labels (Internet, Furniture…). */
const SUBSECTION_LABELS: Record<string, string> = Object.fromEntries(
    BUSINESS_RESOURCE_GROUPS.flatMap(group => group.kinds.map(kind => [kind.id, kind.label]))
);

/**
 * Everything consolidateCosts reads besides Page 4 itself -- the one
 * place the two Financial pages and the export build it, so all three
 * consolidate the same costs.
 */
export function costSourcesFor(
    legalEntity: LegalEntityValue,
    capability: BusinessCapabilityValue,
    currency: string
): CostSources {
    return {
        legalEntity,
        capability,
        currency,
        foundersLinked: legalEntity.founders.some(founder => founder.name.trim().length > 0),
        resourceGroupLabels: RESOURCE_GROUP_LABELS,
        subsectionLabels: SUBSECTION_LABELS
    };
}

/** Page 4's costs, consolidated exactly as Page 4 shows them. */
export function costLines(page: FinancialFoundationValue, context: ExportContext): CostLine[] {
    const legalEntity = context.legalEntity ?? asLegalEntityValue(undefined);
    return consolidateCosts(page, costSourcesFor(
        legalEntity,
        capabilityOf(context.responseOf?.(AnswerType.BusinessCapability), context),
        context.currency ?? ""
    ));
}

/* ==========================================================
   1. Identity -- Legal Entity
========================================================== */

function legalEntityBlocks(value: unknown, context: ExportContext): ExportBlock[] {

    const entity = asLegalEntityValue(value);
    const organisation = entity.organisation;
    const currency = context.currency ?? "";

    const founderName = (id: string) =>
        entity.founders.find(founder => founder.id === id)?.name.trim() ?? "";

    // The ids LegalEntityEditor's linkTargets gives what an expense is for.
    const numberLabel = (id: string): string => {
        if (id === "formation-registration-number") {
            return "Registration Number: " + entity.formation.registrationNumber;
        }
        if (id === "tax-consumption-number") {
            return "VAT / consumption tax: " + entity.tax.consumptionTaxNumber;
        }
        const extra = [...entity.formation.additionalNumbers, ...entity.tax.additionalRegistrations]
            .find(entry => entry.id === id);
        if (extra) {
            return (extra.label || "Number") + ": " + extra.number;
        }
        const requirement = entity.requirements.find(entry => entry.id === id);
        return requirement ? requirement.name : "";
    };

    return [
        ...titled("Organization", details([
            ["Name", organisation.name],
            ["Main Activity", organisation.mainActivity],
            ["Activity Code", organisation.activityCode],
            ["Legal Form", organisation.legalForm === "Other (not listed)" ? organisation.legalFormOther : organisation.legalForm],
            ["Country", COUNTRIES.find(country => country.code === organisation.country)?.name ?? organisation.country],
            ["Region", organisation.subdivision],
            ["Address", [organisation.addressLine1, organisation.addressLine2, organisation.city, organisation.postalCode]
                .map(text).filter(Boolean).join(", ")]
        ])),

        ...titled("Founders & Ownership", table(
            entity.capitalApplies
                ? ["Founder", "Ownership", "Capital", "Roles"]
                : ["Founder", "Ownership", "Roles"],
            entity.founders.map(founder => entity.capitalApplies
                ? [founder.name, founder.ownership ? founder.ownership + "%" : "", moneyText(founder.capital, currency), founder.roles.filter(Boolean).join(", ")]
                : [founder.name, founder.ownership ? founder.ownership + "%" : "", founder.roles.filter(Boolean).join(", ")])
        )),
        // Each founder's bio, where one is written: prose, so under the table.
        ...(entity.founders.some(founder => text(founder.experience))
            ? [heading("Experience & Skills", 2), ...entity.founders.flatMap((founder, index) =>
                labelled(text(founder.name) || "Founder " + (index + 1), founder.experience))]
            : []),

        ...titled("Formation & Registration", details([
            ["Status", entity.formation.status === "planned" ? "Not yet registered" : ""],
            ["Formation Date", isoDate(entity.formation.date)],
            ["Registration Authority", entity.formation.authority],
            ["Registration Number", entity.formation.registrationNumber],
            ...entity.formation.additionalNumbers.map(entry => [entry.label || "Number", entry.number] as [string, string])
        ])),

        ...titled("Tax & Business Registration", details([
            ["Tax Identification Number", entity.tax.identificationNumber],
            ["Consumption Tax", entity.tax.consumptionTaxStatus === "yes"
                ? "Registered" + (entity.tax.consumptionTaxNumber ? " (" + entity.tax.consumptionTaxNumber + ")" : "")
                : entity.tax.consumptionTaxStatus === "no" ? "Not registered" : ""],
            ...entity.tax.additionalRegistrations.map(entry => [entry.label || "Registration", entry.number] as [string, string])
        ])),

        ...(entity.requirements.length > 0 ? [heading("Additional Legal Requirements")] : []),
        ...table(["Type", "Requirement", "Reference", "Notes"], entity.requirements.map(requirement => [
            labelOf(LEGAL_REQUIREMENT_TYPES, requirement.type), requirement.name, requirement.reference, requirement.notes
        ])),

        ...(entity.expenses.length > 0 ? [heading("Legal Entity Expenses")] : []),
        ...table(["Expense", "Responsibility", "Cost", "Frequency", "For"],
            entity.expenses.map(expense => [
                expense.name, founderName(expense.responsibility), moneyText(expense.cost, currency), expense.frequency,
                expense.links.map(numberLabel).filter(Boolean).join("; ")
            ]))
    ];

}

/* ==========================================================
   2. Brand -- Style and Inventory
========================================================== */

export function brandStyleBlocks(value: unknown): ExportBlock[] {

    const style = asBrandStyleValue(value);

    return [
        ...titled("Colours", table(["Slot", "Name", "HEX", "Usage"], answeredRows(style.colours
            .map((colour, index) => ({ colour, slot: BRAND_COLOUR_SLOTS[index]?.label ?? "Colour " + (index + 1) }))
            .filter(entry => entry.colour.enabled)
            .map(({ colour, slot }) => [slot, colour.name, colour.hex, colour.usage])))),

        ...titled("Typography", table(["Role", "Typeface", "Purpose"], answeredRows(style.typefaces
            .map((typeface, index) => ({ typeface, slot: BRAND_TYPEFACE_SLOTS[index]?.label ?? "Typeface " + (index + 1) }))
            .filter(entry => entry.typeface.enabled)
            .map(({ typeface, slot }) => [slot, typeface.font, typeface.purpose])))),

        ...titled("Text Hierarchy", table(["Level", "Size"], answeredRows(BRAND_HIERARCHY_LEVELS
            .filter(level => style.hierarchy[level.id]?.enabled)
            .map(level => [level.label, text(style.hierarchy[level.id].size) ? style.hierarchy[level.id].size + " px" : ""]))))
    ];

}

export function brandInventoryBlocks(value: unknown): ExportBlock[] {

    const inventory = asBrandInventoryValue(value);
    const file = (asset?: { fileName: string }) => asset?.fileName ?? "";

    return [
        ...titled("Icon & Logo", details([
            ["Icon (SVG)", file(inventory.icon.svg)],
            ["Icon (PNG)", file(inventory.icon.png)],
            ["Logo (SVG)", file(inventory.logo.svg)],
            ["Logo (PNG)", file(inventory.logo.png)]
        ])),
        ...titled("Brand Images", table(["Image", "File", "Description"], inventory.images
            .filter(image => !!image.dataUrl)
            .map(image => [image.name, image.fileName, image.description])))
    ];

}

/* ==========================================================
   3. Business -- Foundation
========================================================== */

const SEGMENT_FIELDS: [string, string][] = [
    ["demographics", "Demographics"], ["geographics", "Geographics"], ["business-data", "Business Data"],
    ["purchasing", "Purchasing Power & Behaviour"], ["market-size", "Market Size & Industry Outlook"]
];
const PROFILE_FIELDS: [string, string][] = [
    ["personal", "Specific Personal Information"], ["psychographics", "Psychographics"],
    ["hubs", "Social & Interest Hubs"], ["habits", "Information & Shopping Habits"]
];
const COMPETITOR_FIELDS: [string, string][] = [
    ["offerings", "Offerings"], ["market", "Market"], ["acquisition", "Customer Acquisition"], ["experience", "Customer Experience"]
];
const OFFERING_FIELDS: [string, string][] = [
    ["function", "Function"], ["benefit", "Customer Benefit"], ["scope", "Content & Scope"],
    ["delivery", "Purchase & Delivery"], ["support", "Support & Communication"], ["requirements", "Requirements & Conditions"]
];

function describe(description: Record<string, string>, fields: [string, string][]): ExportBlock[] {
    return fields.flatMap(([id, label]) => paragraph(description[id] ?? "", label));
}

function segmentBlocks(segment: BusinessCustomerSegmentValue, index: number): ExportBlock[] {
    return [
        heading("Segment " + (index + 1) + ": " + (segment.name.trim() || "Unnamed segment")),
        ...describe(segment.description, SEGMENT_FIELDS),

        ...segment.profiles.flatMap((profile, position) => [
            heading("Profile " + (index + 1) + "." + (position + 1) + ": " + (profile.name.trim() || "Unnamed profile"), 2),
            ...describe(profile.description, PROFILE_FIELDS),
            ...paragraph(profile.goals, "Goals & Desires"),
            ...paragraph(profile.challenges, "Challenges & Problems"),
            ...paragraph(profile.objections, "Objections"),
            ...paragraph(profile.needs.functional.filter(Boolean).join("; "), "Functional needs"),
            ...paragraph(profile.needs.emotional.filter(Boolean).join("; "), "Emotional needs"),
            ...paragraph(profile.needs.social.filter(Boolean).join("; "), "Social needs")
        ]),

        ...(segment.competitors.length > 0 ? [heading("Competitors and Alternatives", 2)] : []),
        ...segment.competitors.flatMap(competitor => [
            ...paragraph(
                (competitor.name.trim() || "Unnamed competitor") +
                (competitor.type ? " (" + labelOf(BUSINESS_COMPETITOR_TYPES, competitor.type) + ")" : "")
            ),
            ...describe(competitor.description, competitor.type === "substitutes"
                ? [["offerings", "Alternative Solution"], ["market", "Market"], ["experience", "Customer Experience"]]
                : COMPETITOR_FIELDS),
            ...table(["Strengths", "Weaknesses", "Opportunities", "Threats"],
                [[competitor.strengths, competitor.weaknesses, competitor.opportunities, competitor.threats]]),
            ...paragraph(competitor.insights, "Insights & Differentiation")
        ]),

        ...(text(segment.valueProposition) ? [heading("Value Proposition", 2)] : []),
        ...paragraph(segment.valueProposition),

        ...(segment.offerings.length > 0 ? [heading("Offerings", 2)] : []),
        ...segment.offerings.flatMap(offering => [
            ...paragraph((offering.name.trim() || "Unnamed offering") + (offering.category ? " (" + offering.category + ")" : "")),
            ...paragraph(offering.needsAddressed.join("; "), "Needs addressed"),
            ...describe(offering.description, OFFERING_FIELDS)
        ])
    ];
}

function businessFoundationBlocks(value: unknown): ExportBlock[] {
    return asBusinessFoundationValue(value).segments.flatMap(segmentBlocks);
}

/* ==========================================================
   3. Business -- Customer Engagement
========================================================== */

function businessEngagementBlocks(value: unknown, context: ExportContext): ExportBlock[] {

    const foundation = context.responseOf?.(AnswerType.BusinessFoundation);
    const segments = businessFoundationSegments(foundation);
    const engagement = asBusinessEngagementValue(value);
    const stage = (id: string) => labelOf(BUSINESS_JOURNEY_STAGES, id);

    const bySegment = engagement.segments.flatMap((entry, index) => {

        const segment = segments.find(candidate => candidate.id === entry.segmentId);
        const offerings = segment?.offerings ?? [];
        const offering = (id: string) => offerings.find(candidate => candidate.id === id)?.name.trim() || "";

        const channels = entry.channels.filter(channel => channel.name.trim() || channel.category);

        return [
            heading("Segment " + (index + 1) + ": " + (segment?.name.trim() || "Unnamed segment")),

            heading("1. Customer Channel", 2),
            ...table(["Category", "Channel", "Offerings", "Journey Stage", "Actions"], channels.flatMap(channel => {
                const carried = channel.offerings.includes(BUSINESS_CHANNEL_ALL_OFFERINGS)
                    ? "All Offerings"
                    : channel.offerings.map(offering).filter(Boolean).join(", ");
                const stages = channel.stages.length > 0 ? channel.stages : [""];
                return stages.map((stageId, position) => [
                    position === 0 ? channel.category : "",
                    position === 0 ? channel.name + (channel.links.filter(Boolean).length ? " (" + channel.links.filter(Boolean).join(", ") + ")" : "") : "",
                    position === 0 ? carried : "",
                    stageId ? stage(stageId) : "",
                    (channel.actions[stageId] ?? []).filter(Boolean).join("; ")
                ]);
            })),

            heading("2. Customer Relationship", 2),
            ...entry.offerings.flatMap(relationship => {
                const name = offering(relationship.offeringId);
                if (!name || relationship.types.length === 0) {
                    return [];
                }
                return relationship.types.flatMap(typeId => {
                    const detail = relationship.typeDetail[typeId];
                    const rows = BUSINESS_JOURNEY_STAGES.map(journey => {
                        const interaction = detail?.interactions[relationship.offeringId + "|" + journey.id];
                        return interaction ? [
                            journey.label,
                            interaction.approach,
                            interaction.goals.map(goal => labelOf(BUSINESS_RELATIONSHIP_GOALS, goal)).join(", ")
                        ] : ["", "", ""];
                    });
                    return [
                        ...paragraph(name + ": " + labelOf(BUSINESS_RELATIONSHIP_TYPES, typeId)),
                        ...paragraph(detail?.purpose ?? "", "Purpose"),
                        ...table(["Journey Stage", "Approach", "Goal"], rows)
                    ];
                });
            })
        ];

    });

    /* Demand & Conversion: where each Offering's customers come from, and the sales they give. */
    const offeringsById = new Map(segments.flatMap(segment => segment.offerings).map(offering => [offering.id, offering.name.trim()]));
    const demandRows = Object.entries(engagement.demand)
        .filter(([, entry]) => hasDemand(entry))
        .map(([offeringId, entry]) => {
            const result = demandResult(entry);
            return [
                offeringsById.get(offeringId) || "Unnamed offering",
                result.sources.map(source => source.label).join(", "),
                result.expected === null ? "Not complete" : result.working,
                demandBasis(result, entry.assumptions)
            ];
        });

    return [
        ...bySegment,
        ...(demandRows.length > 0
            ? [heading("Demand & Conversion"), ...table(["Offering", "Customer Sources", "Expected Sales", "Assumptions"], demandRows)]
            : [])
    ];

}

/** What an Offering's expected sales rest on: each source's basis, then the assumptions overall. */
export function demandBasis(result: DemandResult, assumptions: string): string {
    return [
        ...result.sources.filter(source => source.basis).map(source => source.label + ": " + source.basis),
        assumptions.trim()
    ].filter(Boolean).join(" ");
}

/* ==========================================================
   3. Business -- Infrastructure & Capability
========================================================== */

function partnerRows(
    partners: BusinessPartnerValue[],
    kind: string,
    founderName: (id: string) => string,
    currency: string,
    foundation: unknown,
    withOffering: boolean
): string[][] {
    return partners.map(partner => [
        kind,
        partner.name,
        founderName(partner.responsibleId),
        costText(partner.cost, currency),
        ...(withOffering ? [offeringNames(foundation, partner.offeringIds)] : []),
        partner.description
    ]);
}

function activityRows(
    activities: BusinessActivityValue[],
    category: string,
    people: (id: string) => string,
    founderIds: string[],
    foundation: unknown,
    withOffering: boolean
): string[][] {
    return activities.map(activity => [
        category,
        activity.name,
        activity.performerIds.map(people).filter(Boolean).join(", "),
        people(businessResponsibleId(activity, founderIds)),
        ...(withOffering ? [offeringNames(foundation, activity.offeringIds)] : []),
        activity.completed ? "Completed" : "Active"
    ]);
}

function slotRow(
    slot: BusinessResourceSlotValue,
    place: string,
    people: (id: string) => string,
    currency: string
): string[] {
    const status = labelOf(BUSINESS_RESOURCE_STATUSES, slot.status);
    const detail = slot.status === "costs"
        ? costText(slot.cost, currency)
        : slot.status === "provided" || slot.status === "professional" ? people(slot.providerId) : "";
    return [place, slot.name, slot.quantity, status, detail];
}

function businessCapabilityBlocks(value: unknown, context: ExportContext): ExportBlock[] {

    const capability = capabilityOf(value, context);
    const foundation = context.responseOf?.(AnswerType.BusinessFoundation);
    const currency = context.currency ?? "";

    const everyone = [
        ...capability.founders,
        ...capability.professionals, ...capability.providers,
        ...capability.offering.professionals, ...capability.offering.providers
    ];
    const people = (id: string) => everyone.find(person => person.id === id)?.name.trim() ?? "";
    const founderIds = capability.founders.map(founder => founder.id);

    const workspace = capability.workspace;

    const resourceRows = [
        ...BUSINESS_RESOURCE_GROUPS.flatMap(group => (capability.resources[group.id] ?? []).flatMap(subsection => {
            const place = group.label + " → " + (group.kinds.find(kind => kind.id === subsection.id)?.label ?? (subsection.name.trim() || "Other"));
            return subsection.slots.map(slot => slotRow(slot, place, people, currency));
        }))
    ];

    return [
        heading("1. Infrastructure"),

        heading("Founders", 2),
        ...table(["Founder", "Roles", "Salary / month", "Working Hours / month", "Delivery Hours / month", "Responsibilities"], capability.founders.map(founder => [
            founder.name,
            founder.roles.filter(Boolean).join(", "),
            moneyText(founder.salary, currency),
            // A month, as the capacity is counted; the week as given, beside it.
            founderWorkingHours(founder) === null ? "" : String(Math.round(founderWorkingHours(founder) ?? 0)) +
                (founder.hoursPeriod === "week" ? " (" + founder.hours + " a week)" : ""),
            founderDeliveryHours(founder) === null ? "" : String(Math.round(founderDeliveryHours(founder) ?? 0)) +
                (founder.hoursPeriod === "week" && founder.deliveryHours ? " (" + founder.deliveryHours + " a week)" : ""),
            businessFounderResponsibilities(capability, founder.id)
                .map(entry => entry.name + (entry.completed ? " (completed)" : "")).join("; ")
        ])),

        heading("Workspace", 2),
        ...details([
            ["Workspace", workspace.kind === "other" ? workspace.kindOther : labelOf(BUSINESS_WORKSPACE_KINDS, workspace.kind)],
            ["Status", labelOf(BUSINESS_RESOURCE_STATUSES, workspace.status)],
            ["Cost", workspace.status === "costs" ? costText(workspace.cost, currency) : ""],
            ["Provider", workspace.status === "provided" ? people(workspace.providerId) : ""]
        ]),

        heading("Resources", 2),
        ...table(["Where", "Resource", "Quantity", "Status", "Cost / Provider"], resourceRows),

        heading("Activities", 2),
        ...table(["Category", "Activity", "Performers", "Responsible", "State"], capability.activities.flatMap(category =>
            activityRows(category.activities,
                BUSINESS_ACTIVITY_CATEGORIES.find(entry => entry.id === category.id)?.label ?? (category.name.trim() || "Other"),
                people, founderIds, foundation, false))),

        heading("Partnerships & Providers", 2),
        ...table(["Kind", "Name", "Responsible", "Cost", "Description"], [
            ...partnerRows(capability.professionals, "Professional / Partner", people, currency, foundation, false),
            ...partnerRows(capability.providers, "Provider", people, currency, foundation, false)
        ]),

        heading("2. Offering's Capability"),
        ...table(["Offering", "Resource", "Quantity", "Status", "Cost / Provider"],
            capability.offering.resources.map(slot => {
                const row = slotRow(slot, "", people, currency);
                return [offeringNames(foundation, slot.offeringIds), ...row.slice(1)];
            })),
        ...table(["Category", "Activity", "Performers", "Responsible", "Offering", "State"],
            activityRows(capability.offering.activities, "Offering", people, founderIds, foundation, true)),
        ...table(["Kind", "Name", "Responsible", "Cost", "Offering", "Description"], [
            ...partnerRows(capability.offering.professionals, "Professional / Partner", people, currency, foundation, true),
            ...partnerRows(capability.offering.providers, "Provider", people, currency, foundation, true)
        ]),

        heading("Delivery", 2),
        ...paragraph(deliveryHours(capability.founders) === null
            ? "No founder delivery hours recorded."
            : "Founders' delivery capacity: about " + Math.round(deliveryHours(capability.founders) ?? 0) + " hours a month."),
        ...table(["Offering", "Effort per Unit, by Person", "Total", "Duration (weeks)", "Constraints"],
            Object.entries(capability.delivery).map(([offeringId, entry]) => {
                const allocation = deliveryAllocation(entry);
                const founderIds = new Set(capability.founders.map(founder => founder.id));
                return [
                    offeringName(foundation, offeringId) || "Unnamed offering",
                    Object.entries(allocation).map(([personId, hours]) =>
                        (people(personId) || "Unassigned") + (founderIds.has(personId) || personId === "" ? "" : " (external)") + ": " + hours + " h").join("; "),
                    (deliveryEffort(entry) ?? 0) + " h",
                    entry.duration,
                    entry.constraints
                ];
            }))
    ];

}

/* ==========================================================
   3. Business -- Financial Foundation
========================================================== */

/**
 * How the Business Plan reads the two Financial pages, where they
 * differ from the System's own export: whole amounts, founders' pay
 * named as the plan names it, and what the plan says elsewhere left
 * out (the costs in its Appendix, the signals under Risks, the
 * capacity under Operations).
 */
export interface FinancialDocumentOptions {
    costName?: (line: CostLine) => string;
    omitCosts?: boolean;
}

/** " Income tax is estimated at 21% …": the forecast's tax basis, where one is chosen. */
function incomeTaxText(page: FinancialFoundationValue): string {
    const rate = incomeTaxRate(page);
    return rate !== null
        ? " Income tax is estimated at " + Math.round(rate * 10000) / 100 + "% of each plan year's profit."
        : page.incomeTax === "pass-through" ? " No income tax at business level (pass-through)." : "";
}

export function financialFoundationBlocks(value: unknown, context: ExportContext, document?: FinancialDocumentOptions): ExportBlock[] {

    const page = withPlanStart(asFinancialFoundationValue(value));
    const start = page.planStart;
    const currency = context.currency ?? "";
    const format = moneyFormatter(currency, document ? { wholeOnly: true } : undefined);
    const legalEntity = context.legalEntity ?? asLegalEntityValue(undefined);
    const foundation = context.responseOf?.(AnswerType.BusinessFoundation);
    const lines = costLines(page, context);
    const position = financialPosition(page, lines, legalEntity, currency, format,
        withDemand(asFinancialSustainabilityValue(context.responseOf?.(AnswerType.FinancialSustainability)), demandOf(context)));
    const funding = allFunding(page, legalEntity);

    const frequencyOf = (line: CostLine) => line.frequency === "other"
        ? (line.frequencyOther ? line.frequencyOther.charAt(0).toUpperCase() + line.frequencyOther.slice(1) : "Other")
        : labelOf(COST_FREQUENCIES, line.frequency);

    // Numbered in order, so leaving the costs out numbers on from 1.
    let number = 0;
    const numbered = (title: string) => heading((++number) + ". " + title);

    return [
        ...paragraph("The plan starts in " + planMonthLabel(start, 1) + " and runs for " + planLength(page) + " months, to " +
            planMonthLabel(start, planLength(page)) + "." + (currency ? " Amounts are in " + currency + ", " : " Amounts are ") +
            lowerWords(labelOf(vatBases(jurisdictionProfile(legalEntity.organisation.country).consumptionTax), effectiveVatBasis(page, legalEntity))) + "." +
            incomeTaxText(page)),

        ...(document?.omitCosts ? [] : [
        numbered("Costs"),
        ...table(["Group", "Cost", "Source", "Amount", "Frequency", "Behaviour", "Offering"], lines.map(line => [
            labelOf(COST_GROUPS, line.group),
            document?.costName ? document.costName(line) : line.name,
            line.sourceLabel,
            line.amount === null ? line.amountText : (line.counted ? format(line.amount) : line.amountText + " " + line.currency + " (not counted)"),
            frequencyOf(line),
            labelOf(COST_BEHAVIOURS, line.behaviour),
            offeringNames(foundation, line.offeringIds)
        ]))
        ]),

        numbered("Funding Need"),
        ...paragraph("Calculated from the recorded costs and the expected revenue."),
        ...table(["Need", "Amount", "When", "Made of"], position.needs.map(need => [
            need.label,
            format(need.amount),
            need.when || "—",
            need.months
                ? "The first year, month by month, below"
                : need.parts.length === 0
                    ? "Nothing recorded"
                    : need.parts.map(part => part.name + " " + format(part.amount)).join("; ")
        ])),
        ...position.needs.filter(need => need.months).flatMap(need => [
            heading(need.label + ": the First Year", 2),
            ...table(["Month", "Running costs", "Costs of sales", "Loan repayments", "Revenue", "Net", "Running total", "Needed"],
                (need.months ?? []).map(entry => [
                    entry.label, format(entry.costs), format(entry.variable), format(entry.loans),
                    format(entry.revenue), format(entry.net), format(entry.cumulative),
                    entry.needed > 0.005 ? format(entry.needed) : ""
                ])),
            ...(need.note ? paragraph(need.note) : [])
        ]),
        ...paragraph("Total Funding Need: " + format(position.need)),

        numbered("Capital & Funding"),
        ...table(["Category", "Source", "Type", "Provider", "Amount", "Status", "Received"], funding.map(source => {
            const standing = fundingStanding(source, start);
            return [
                labelOf(FUNDING_CATEGORIES, source.category),
                source.name,
                fundingType(source.type)?.label ?? "",
                source.provider,
                format(standing.total),
                labelOf(FUNDING_STATUSES, source.status),
                format(standing.received)
            ];
        })),
        ...funding.flatMap(source => {
            const schedule = fundingType(source.type)?.nature === "debt" ? loanSchedule(source, start) : null;
            return schedule ? paragraph(
                (source.name || "Loan") + ": " + format(schedule.firstPayment) + " " +
                source.loan.frequency + " from " + planMonthLabel(start, schedule.payments[0].month) +
                " to " + planMonthLabel(start, schedule.payments[schedule.payments.length - 1].month) +
                ", total interest " + format(schedule.totalInterest) + "."
            ) : [];
        }),

        numbered("Financial Position"),
        ...details([
            ["Funding Need", format(position.need)],
            ["Available Now", format(position.availableNow) + (document && spentBeforePlan(lines, start) > 0.005
                ? " (" + format(position.availableNow + spentBeforePlan(lines, start)) + " received, less " +
                    format(spentBeforePlan(lines, start)) + " of costs paid before the plan)"
                : "")],
            ["Confirmed Future", format(position.confirmedFuture)],
            ["Pending", format(position.pending)],
            ["Funding Gap", format(position.gap)],
            ["Financial Runway", !position.hasOutflows ? "n/a"
                : position.runwayMonths === null ? planLength(page) + "+ months" : monthCount(position.runwayMonths)]
        ]),
        // The plan gathers the signals under its Risks.
        ...(document ? [] : list(position.signals.map(signal => signal.title + ": " + signal.text)))
    ];

}

/* ==========================================================
   3. Business -- Financial Sustainability
========================================================== */

export function financialSustainabilityBlocks(value: unknown, context: ExportContext, document?: FinancialDocumentOptions): ExportBlock[] {

    const foundationPage = withPlanStart(asFinancialFoundationValue(context.responseOf?.(AnswerType.FinancialFoundation)));
    const currency = context.currency ?? "";
    const format = moneyFormatter(currency, document ? { wholeOnly: true } : undefined);
    const legalEntity = context.legalEntity ?? asLegalEntityValue(undefined);
    const foundation = context.responseOf?.(AnswerType.BusinessFoundation);
    const lines = costLines(foundationPage, context);
    const result = sustainability(withDemand(asFinancialSustainabilityValue(value), demandOf(context)), foundationPage, lines, legalEntity, format);
    const start = foundationPage.planStart;

    const monthText = (index: number | null) => index === null ? "Not reached" : planMonthLabel(start, index) + " (Month " + index + ")";

    return [
        heading("1. Revenue"),
        ...table(["Revenue Stream", "Model", "Price", "Volume / month", "Revenue / month", "Begins"], result.streams.map(entry => [
            offeringName(foundation, entry.stream.offeringId) || "Unlinked stream",
            revenueModelLabel(entry.stream),
            entry.stream.price
                ? format(parseAmount(entry.stream.price) ?? 0) + " / " + (entry.stream.unit === "Other" ? entry.stream.unitOther : entry.stream.unit || "unit").toLowerCase() +
                    (document
                        // "$1,200 / client a month", as the plan says it elsewhere.
                        ? (entry.stream.frequency === "monthly" ? " a month" : entry.stream.frequency === "quarterly" ? " a quarter"
                            : entry.stream.frequency === "annually" ? " a year" : "")
                        : (REVENUE_FREQUENCIES.find(f => f.id === entry.stream.frequency && f.factor !== 1) ? ", " + entry.stream.frequency : ""))
                : "",
            formatUnits(entry.volume),
            format(entry.revenue),
            (document ? shortMonth(entry.stream.start) : month(entry.stream.start)) || planMonthLabel(start, 1)
        ])),
        ...paragraph("Expected revenue at the normal level: " + format(result.expectedRevenue) + " a month."),

        heading("2. Break Even"),
        ...details([
            ["Fixed costs", format(result.inputs.fixed) + " a month"],
            ["Break-even revenue", result.breakEvenRevenue === null ? "n/a" : format(result.breakEvenRevenue) + " a month"],
            ["Expected break even", monthText(result.breakEvenMonth)],
            ["Financial exhaustion", result.exhaustionMonth === null ? "Beyond the " + planLength(foundationPage) + "-month plan" : monthText(result.exhaustionMonth)],
            ["Sustainability buffer", result.buffer !== null
                ? monthCount(result.buffer)
                : result.breakEvenMonth !== null && result.exhaustionMonth === null ? planLength(foundationPage) + "+ months"
                    // Funds run out first: there is no buffer, and the plan says so.
                    : document ? "None" : "n/a"]
        ]),
        ...table(["Offering", "Contribution / unit", "Break even alone"], result.streams.map(entry => [
            offeringName(foundation, entry.stream.offeringId) || "Unlinked stream",
            entry.contribution === null ? "" : format(entry.contribution),
            entry.breakEvenAlone === null ? "" : formatUnits(entry.breakEvenAlone) + " a month"
        ])),
        ...list(result.inputs.caveats.map(caveat => "Estimate: " + caveat)),
        // The plan gathers the signals under its Risks, and the capacity under its Operations.
        ...(document ? [] : list(result.signals.map(signal => signal.title + ": " + signal.text))),
        ...(document ? [] : capacityBlocks(
            salesCapacity(withDemand(asFinancialSustainabilityValue(value), demandOf(context)), foundationPage,
                capabilityOf(context.responseOf?.(AnswerType.BusinessCapability), context)),
            foundationPage.planStart
        ))
    ];

}

/** Expected sales against deliverable capacity, in words; nothing when there is no check. */
export function capacityBlocks(capacity: CapacityCheck | null, start: StrategyMonthValue, level: 1 | 2 = 2): ExportBlock[] {
    if (!capacity) {
        return [];
    }
    const hours = (amount: number) => Math.round(amount) + " hours";
    const month = (index: number) => planMonthLabel(start, index + 1);
    return [
        heading("Capacity", level),
        ...paragraph("Capacity is the founders' delivery hours: " + hours(capacity.available) + " a month. " +
            "Recurring work is served first; what remains is flexible capacity for the other Offerings."),
        ...table(["Founder", "Delivery Hours", "Recurring Work", "Remaining", "Other Offerings", "Busiest Month"],
            capacity.founders.map(founder => {
                const recurring = founder.recurring[founder.peakIndex] ?? 0;
                return [
                    founder.name,
                    hours(founder.available),
                    hours(recurring),
                    hours(founder.available - recurring),
                    hours(founder.other[founder.peakIndex] ?? 0),
                    month(founder.peakIndex) + (founder.firstShortfall !== null ? " (short)" : "")
                ];
            })),
        ...paragraph(capacity.firstShortfall !== null
            ? "From " + month(capacity.firstShortfall) + ", the expected sales need more founders' hours than are available. " +
                "More delivery capacity may be needed: more founder hours, an external professional for part of the work, or a hire."
            : "The expected sales fit the founders' capacity: at the busiest (" + month(capacity.peakIndex) + "), about " +
                hours(capacity.peak) + " of " + hours(capacity.available) + " a month."),
        ...(capacity.external.length > 0
            ? paragraph("Delivered outside the founders' capacity: " + capacity.external
                .map(entry => entry.name + " about " + hours(entry.peak) + " a month at the busiest").join("; ") +
                ". Their cost is part of the Offering's costs.")
            : [])
    ];
}

/* ==========================================================
   4. Strategy
========================================================== */

function range(value: { start: StrategyMonthValue; end: StrategyMonthValue }): string {
    return [month(value.start), month(value.end)].filter(Boolean).join(" – ");
}

function strategyFoundationBlocks(value: unknown): ExportBlock[] {

    const foundation = asStrategyFoundationValue(value);

    return [
        heading("1. Current Situation Analysis"),
        ...paragraph(foundation.situation),
        heading("2. SWOT Analysis"),
        ...(["strengths", "weaknesses", "opportunities", "threats"] as const).flatMap(key => [
            heading(key[0].toUpperCase() + key.slice(1), 2),
            ...list(foundation.swot[key] ?? [])
        ]),
        heading("3. Strategic Compass"),
        ...paragraph(foundation.compass),
        heading("4. Strategic Period"),
        ...paragraph(range(foundation.period)),
        ...table(["Theme", "Description"], foundation.themes.map((theme, index) => [
            (index + 1) + ". " + theme.name, theme.description
        ]))
    ];

}

function strategicPeriodBlocks(value: unknown, context: ExportContext): ExportBlock[] {

    const foundation = asStrategyFoundationValue(context.responseOf?.(AnswerType.StrategyFoundation));
    const period = asStrategicPeriodValue(value);

    return foundation.themes.flatMap((theme, themeIndex) => {

        const goals = period.goalsByTheme[theme.id] ?? [];

        return [
            heading("Theme " + (themeIndex + 1) + ": " + (theme.name || "Unnamed theme")),
            ...goals.flatMap((goal, goalIndex) => [
                heading((themeIndex + 1) + "." + (goalIndex + 1) + " " + (goal.name || "Unnamed goal"), 2),
                ...paragraph(goal.description),
                ...goal.objectives.flatMap((objective, objectiveIndex) => [
                    ...paragraph((themeIndex + 1) + "." + (goalIndex + 1) + "." + (objectiveIndex + 1) + " " +
                        (objective.name || "Unnamed objective") + (range(objective.period) ? " (" + range(objective.period) + ")" : "")),
                    ...paragraph(objective.description),
                    ...paragraph(context.legalEntity?.founders.find(founder => founder.id === objective.ownerId)?.name ?? "", "Owner"),
                    ...list(objective.initiatives, true),
                    ...table(["Metric", "Baseline", "Target", "Frequency", "Unit"], objective.metrics.map(metric => [
                        metric.name, metric.baseline, metric.target, metric.frequency,
                        metric.unit === "Custom" ? metric.customUnit
                            : metric.unit === "Currency" ? (metric.currency || context.currency || "Currency")
                                : metric.unit
                    ]))
                ])
            ])
        ];

    });

}

function strategicRoadmapBlocks(context: ExportContext): ExportBlock[] {

    const foundation = asStrategyFoundationValue(context.responseOf?.(AnswerType.StrategyFoundation));
    const period = asStrategicPeriodValue(context.responseOf?.(AnswerType.StrategicPeriod));

    return [
        ...paragraph(range(foundation.period), "Strategic Period"),
        ...table(["Theme", "Objective", "From", "To", "Initiatives"], foundation.themes.flatMap((theme, themeIndex) =>
            (period.goalsByTheme[theme.id] ?? []).flatMap((goal, goalIndex) => goal.objectives.map((objective, objectiveIndex) => [
                theme.name,
                (themeIndex + 1) + "." + (goalIndex + 1) + "." + (objectiveIndex + 1) + " " + objective.name,
                month(objective.period.start),
                month(objective.period.end),
                objective.initiatives.filter(Boolean).join("; ")
            ]))))
    ];

}

/* ==========================================================
   The dispatch
========================================================== */

/**
 * The export blocks for a page with an editor of its own, or null for
 * any other Answer Structure (which buildAnswerBlocks handles).
 */
export function bespokeAnswerBlocks(
    answer: AnswerDefinition,
    value: unknown,
    context: ExportContext = {}
): ExportBlock[] | null {

    switch (answer.type) {
        case AnswerType.LegalEntity: return legalEntityBlocks(value, context);
        case AnswerType.BrandStyle: return brandStyleBlocks(value);
        case AnswerType.BrandInventory: return brandInventoryBlocks(value);
        case AnswerType.BusinessFoundation: return businessFoundationBlocks(value);
        case AnswerType.BusinessEngagement: return businessEngagementBlocks(value, context);
        case AnswerType.BusinessCapability: return businessCapabilityBlocks(value, context);
        case AnswerType.FinancialFoundation: return financialFoundationBlocks(value, context);
        case AnswerType.FinancialSustainability: return financialSustainabilityBlocks(value, context);
        case AnswerType.StrategyFoundation: return strategyFoundationBlocks(value);
        case AnswerType.StrategicPeriod: return strategicPeriodBlocks(value, context);
        case AnswerType.StrategicRoadmap: return strategicRoadmapBlocks(context);
        default: return null;
    }

}
