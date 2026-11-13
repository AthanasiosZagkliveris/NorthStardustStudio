/* Part of BusinessDocuments.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; BusinessDocuments.ts re-exports every part). */

import { workspacesOf, WORKSPACE_GROUP_ID } from "../AnswerUtils.ts";
import { offeringRelationshipsFor } from "../JourneySuggestions.ts";
import { segmentIdentityOf } from "../SegmentContext.ts";
import { BUSINESS_RELATIONSHIP_TYPES, BUSINESS_RESOURCE_GROUPS, BUSINESS_WORKSPACE_KINDS, isPurchaseGroup } from "../AnswerUtils.ts";
import { type ExportContent } from "../ExportContentBuilder.ts";
import { list, offeringName, offeringNames, paragraph } from "../ExportRenderers.ts";
import { allFunding, fundingType, isNonCash, isScheduled, paidBeforePlan, scheduledAmount, statusStanding, monthlyEquivalent, parseAmount, moneyFormatter } from "../FinancialModel.ts";
import { costName, perUnit, priceText, readFoundation, section, text, type FoundationSessions } from "./reading.ts";
import { isEngaged, joinNames, websiteOf } from "./plan.ts";

/* ==========================================================
   The Business Model Canvas
========================================================== */

export const CANVAS_BLOCKS = [
    { id: "partners", title: "Key Partners" },
    { id: "activities", title: "Key Activities" },
    { id: "resources", title: "Key Resources" },
    { id: "propositions", title: "Value Propositions" },
    { id: "relationships", title: "Customer Relationships" },
    { id: "channels", title: "Channels" },
    { id: "segments", title: "Customer Segments" },
    { id: "costs", title: "Cost Structure" },
    { id: "revenue", title: "Revenue Streams" }
] as const;

type CanvasBlockId = typeof CANVAS_BLOCKS[number]["id"];

/**
 * A name with a note in brackets, as one pair of brackets: "Freelance
 * developer (overflow)" and "for Automation Build" make "Freelance
 * developer (overflow, for Automation Build)".
 */
function withBrackets(name: string, note: string): string {
    const base = name.trim();
    if (!note) {
        return base;
    }
    return /\)$/.test(base) ? base.slice(0, -1) + ", " + note + ")" : base + " (" + note + ")";
}

/** A cost paid per unit sold: part of the cost of sales, not a resource the business keeps. */
function isPerUse(frequency: string): boolean {
    return frequency === "per-unit" || frequency === "per-order" || frequency === "per-project" || frequency === "percent-revenue";
}

/** The canvas as its nine lists -- for the page's own nine-box drawing. */
export function businessModelCanvasData(sessions: FoundationSessions): {
    name: string;
    blocks: Record<CanvasBlockId, string[]>;
} {

    const f = readFoundation(sessions, { wholeOnly: true });
    const { capability } = f;
    const format = moneyFormatter(f.currency, { wholeOnly: true });
    const offeringsFor = (ids: string[]) => offeringNames(f.foundationValue, ids) || "an Offering";

    const engaged = [...capability.professionals, ...capability.providers].filter(isEngaged);
    const partners = [
        ...capability.professionals.filter(isEngaged).map(partner => withBrackets(partner.name, "professional")),
        ...capability.providers.filter(isEngaged).map(partner => withBrackets(partner.name, "provider")),
        ...capability.offering.professionals.map(partner => withBrackets(partner.name, "for " + offeringsFor(partner.offeringIds))),
        ...capability.offering.providers.map(partner => withBrackets(partner.name, "for " + offeringsFor(partner.offeringIds)))
    ].filter(entry => entry && !entry.startsWith("("));
    const partnerIds = new Set([...engaged, ...capability.offering.professionals, ...capability.offering.providers].map(partner => partner.id));
    const partnerNames = [...engaged, ...capability.offering.professionals, ...capability.offering.providers]
        .map(partner => partner.name.trim().toLowerCase()).filter(Boolean);
    // Already under Key Partners: provided by one, or named as one.
    const isPartner = (name: string, providerId: string) => partnerIds.has(providerId) ||
        partnerNames.some(partner => partner === name.trim().toLowerCase());

    /* Key Activities: the crucial work that goes on -- delivering each
       Offering, and marketing and selling it through the channels.
       How customers are kept is the Customer Relationships block, and
       one-off setup tasks are the plan's (Operations: Launch and Setup
       Tasks). */
    const offerings = f.segments.flatMap(segment => segment.offerings).filter(offering => offering.name.trim());
    // By kind of channel, as the Channels block names each one; a
    // payment channel is how a sale is taken, not how it is made.
    const channelKinds = [...new Set(f.engagement.segments.flatMap(entry => entry.channels)
        .filter(channel => channel.name.trim())
        .map(channel => channel.category.trim().toLowerCase())
        .filter(category => category && category !== "other" && !/payment/.test(category)))];
    const hasChannels = f.engagement.segments.some(entry => entry.channels.some(channel => channel.name.trim()));
    const activities = [
        ...offerings.map(offering => "Deliver " + offering.name.trim()),
        ...(hasChannels
            ? ["Marketing and sales" + (channelKinds.length > 0 ? " through " + joinNames(channelKinds) : "")]
            : [])
    ];

    /* Key Resources, by Strategyzer's four kinds: human, physical,
       intellectual and financial. What the business keeps and relies
       on, not a partner's, not a utility it is simply provided with,
       nor a per-use cost of sales. */
    const kept = (group: string, slot: { name: string; status: string; providerId: string; cost: { frequency: string } }, subsection = "") =>
        !!slot.name.trim() &&
        !(group === "utilities" && (slot.status === "partners-suppliers" || slot.status === "exists")) &&
        (!isPerUse(slot.cost.frequency) || (slot.cost.frequency === "per-unit" && isPurchaseGroup(subsection))) &&
        !isPartner(slot.name, slot.providerId);
    const workspaces = workspacesOf(capability)
        .filter(workspace => workspace.kind && !(workspace.status === "rent" && partnerIds.has(workspace.providerId)))
        .map(workspace => BUSINESS_WORKSPACE_KINDS.find(kind => kind.id === workspace.kind)?.label ?? workspace.kindOther)
        .filter(Boolean);
    const namesIn = (groups: string[]) => BUSINESS_RESOURCE_GROUPS.filter(group => groups.includes(group.id))
        .filter(group => group.id !== WORKSPACE_GROUP_ID)
        .flatMap(group => (capability.resources[group.id] ?? [])
            .flatMap(subsection => subsection.slots.filter(slot => kept(group.id, slot, subsection.id)).map(slot => slot.name.trim())));
    const physical = [
        ...workspaces,
        ...namesIn(BUSINESS_RESOURCE_GROUPS.map(group => group.id).filter(id => id !== "digital")),
        ...capability.offering.resources.filter(slot => kept("offering", slot)).map(slot => slot.name.trim())
    ];
    // The software, as its essentials: the first few, and how many more.
    const systems = namesIn(["digital"]);
    const website = websiteOf(f);
    const trademark = [...f.lines.map(line => line.name), ...f.legalEntity.requirements.map(requirement => requirement.name)]
        .some(name => /trade ?mark/i.test(name));
    const intellectual = [
        "the " + f.name + " brand" + (trademark ? " (trade mark)" : ""),
        ...(website ? ["the website " + website] : [])
    ];
    const sought = allFunding(f.financial, f.legalEntity)
        .filter(source => !isNonCash(source) && statusStanding(source.status || "planned") !== "confirmed")
        .filter(source => (parseAmount(source.amount) ?? 0) > 0);
    const financial = [
        ...(f.position.availableNow > 0.5 ? [format(f.position.availableNow) + " in hand"] : []),
        ...(f.position.confirmedFuture > 0.5 ? [format(f.position.confirmedFuture) + " confirmed, still to arrive"] : []),
        ...(f.position.pending > 0.5
            ? [format(f.position.pending) + " sought" + (sought.length > 0
                ? " (" + joinNames(sought.map(source => source.name.trim() || fundingType(source.type)?.label || "funding")) + ")"
                : "")]
            : [])
    ];
    const resources = [
        ...(capability.founders.length > 0 ? ["Human: " + capability.founders.map(founder =>
            withBrackets(founder.name, founder.roles.filter(Boolean).join(", "))).join("; ")] : []),
        ...(physical.length > 0 ? ["Physical: " + physical.join("; ")] : []),
        ...(systems.length > 0
            ? ["Physical (systems): " + systems.slice(0, 3).join("; ") + (systems.length > 3 ? " and " + (systems.length - 3) + " more" : "")]
            : []),
        "Intellectual: " + intellectual.join("; "),
        ...(financial.length > 0 ? ["Financial: " + financial.join("; ")] : [])
    ];

    const propositions = f.segments
        .filter(segment => text(segment.valueProposition))
        .map(segment => (f.segments.length > 1 ? segment.name.trim() + ": " : "") + text(segment.valueProposition));

    // With more than one segment, each relationship names the segment it is with.
    const relationshipLines = f.engagement.segments.flatMap(entry => {
        const segment = f.segments.find(candidate => candidate.id === entry.segmentId);
        // (The list the page shows: offeringRelationshipsFor.)
        return (segment ? offeringRelationshipsFor(entry, segment, segmentIdentityOf(f.legalEntity.organisation)) : []).flatMap(relationship => relationship.types.map(typeId => {
            const offering = segment?.offerings.find(candidate => candidate.id === relationship.offeringId)?.name.trim() ?? "";
            const type = BUSINESS_RELATIONSHIP_TYPES.find(candidate => candidate.id === typeId)?.label ?? typeId;
            return offering ? withBrackets(offering, f.segments.length > 1 ? segment?.name.trim() ?? "" : "") + ": " + type : "";
        })).filter(Boolean);
    });

    const channelLines = [...new Set(f.engagement.segments.flatMap(entry =>
        entry.channels.filter(channel => channel.name.trim()).map(channel => withBrackets(channel.name, channel.category))))];

    const segments = f.segments.map(segment =>
        segment.name.trim() + (segment.profiles.some(profile => profile.name.trim())
            ? ": " + segment.profiles.map(profile => profile.name.trim()).filter(Boolean).join(", ")
            : ""));

    const counted = f.lines.filter(line => line.counted && line.amount !== null);
    // One-time costs within the plan, as the Funding Need counts them:
    // what was paid before it is already spent.
    const oneTime = counted
        .filter(line => line.frequency === "one-time" && !paidBeforePlan(line, f.financial.planStart))
        .reduce((sum, line) => sum + scheduledAmount(line), 0);
    const largest = [...counted]
        .filter(line => isScheduled(line))
        .map(line => ({ line, monthly: line.frequency === "one-time" ? 0 : monthlyEquivalent(line.amount ?? 0, line.frequency) }))
        .filter(entry => entry.monthly > 0)
        .sort((a, b) => b.monthly - a.monthly)
        .slice(0, 5);

    const costs = [
        "Fixed costs: " + format(f.outlook.inputs.fixed) + " a month",
        ...(oneTime > 0 ? ["One-time costs in the plan: " + format(oneTime)] : []),
        ...largest.map(entry => withBrackets(costName(f, entry.line), format(entry.monthly) + " a month")),
        ...f.outlook.streams.filter(entry => entry.variable > 0.005)
            .map(entry => "Variable costs: " + format(entry.variable) + " " + perUnit(entry.stream) +
                " (" + (offeringName(f.foundationValue, entry.stream.offeringId) || "an Offering") + ")")
    ];

    /* Revenue: each stream, from the segment it comes from, as it is
       charged. The working (price times volume) is the plan's. */
    const revenue = [
        ...f.outlook.streams.map(entry => {
            const name = offeringName(f.foundationValue, entry.stream.offeringId) || "Revenue stream";
            const segment = f.segments.find(candidate => candidate.offerings.some(offering => offering.id === entry.stream.offeringId));
            const price = priceText(entry.stream, format);
            const recurring = entry.stream.frequency === "monthly" || entry.stream.frequency === "quarterly" || entry.stream.frequency === "annually";
            return withBrackets(name, segment?.name.trim() ?? "") + ": " + (price || "price not set") + ", " + (recurring ? "recurring" : "one-time");
        }),
        ...(f.outlook.streams.length > 0 ? ["Expected revenue: " + format(f.outlook.expectedRevenue) + " a month at the normal level"] : [])
    ];

    return {
        name: f.name,
        blocks: {
            partners, activities, resources, propositions, relationships: relationshipLines,
            channels: channelLines, segments, costs, revenue
        }
    };

}

export function businessModelCanvas(sessions: FoundationSessions, capability = "Foundation"): ExportContent {

    const data = businessModelCanvasData(sessions);

    return {
        systemNumber: "",
        // Also the download's file name, so no colon.
        systemName: "Business Model Canvas " + data.name,
        capability,
        documentTitle: "Business Model Canvas: " + data.name,
        documentSubtitle: "Drawn from the Business System: Foundation, Customer Engagement, Infrastructure & Capability, Financial Foundation and Sustainability.",
        // Drawn as the nine-block grid by the PDF and the Markdown.
        canvas: CANVAS_BLOCKS.map(block => ({ id: block.id, title: block.title, items: data.blocks[block.id] })),
        sections: CANVAS_BLOCKS.map((block, index) => section(index + 1, block.title,
            data.blocks[block.id].length > 0 ? list(data.blocks[block.id]) : paragraph("Not answered yet.")))
    };

}
