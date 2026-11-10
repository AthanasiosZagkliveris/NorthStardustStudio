/* Part of FinancialModel.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; FinancialModel.ts re-exports every part). */

import { workspacesOf, WORKSPACE_GROUP_ID } from "../AnswerUtils.ts";
import { parseAmount, parseDecimal } from "../Amounts.ts";
import { type BillingType, type BusinessPaymentPlan, type BusinessCapabilityValue, type BusinessCostValue, type BusinessPartnerValue, type BusinessResourceSlotValue, type LegalEntityValue, type StrategyMonthValue } from "../AnswerUtils.ts";
import { BUSINESS_EXTRAS, billingOf, isSpaceOnlyGroup, paymentPlanIncomplete, paymentPlanLines, type BusinessExtraKey, type BusinessExtrasValue, isCostingStatus, offeringFractions, isPurchaseGroup, partnerExtraKeys, PEOPLE_EXTRA_KEYS, partnerKindOf, resourceUnitCount, slotExtraKeys, supplierConnections, serviceAssetLinks, partnerHasQuantity, workspaceCardName } from "../AnswerUtils.ts";
import { founderMonthlySalary } from "../DemandCapacity.ts";
import { PER_UNIT_FREQUENCIES, SCHEDULED_FREQUENCIES, type CostBehaviour, type CostFrequency, type CostGroup } from "./lists.ts";
import { EMPTY_MONTH, type CostAsset, type FinancialFoundationValue, type OwnCostValue } from "./stored.ts";
import { MODEL_MONTHS, monthOrdinal, notNegative, planMonth } from "./period.ts";
import { numberAsText } from "./breakEven.ts";

/* ==========================================================
   Page 4 -- costs, consolidated
========================================================== */

/** Where a cost was recorded, for its Source column and its link. */
type CostOrigin =
    | "legal-entity"
    | "founders"
    | "infrastructure"
    | "offering-capability"
    | "own";

/**
 * One cost as the page shows and counts it: its own record, or one
 * read from where it was recorded, classified here.
 */
export interface CostLine {
    id: string;
    name: string;
    origin: CostOrigin;
    /** "Legal Entity → Expenses", "Infrastructure → Utilities → Internet". */
    sourceLabel: string;
    group: CostGroup;
    behaviour: CostBehaviour;
    /**
     * The Offerings it is a cost of: one, or several that share it (the
     * same yarn in two collections). Empty for a cost of the whole
     * organization. A per-unit cost is paid by each unit of any of
     * them; a fixed one is shared out between them.
     */
    offeringIds: string[];
    /** The fraction of the cost each linked Offering carries (they total 1); absent: equal shares. */
    offeringShares?: Record<string, number>;
    /** The first of them, where only one can be shown. */
    offeringId: string;
    /** The amount as recorded, and as a number (null if unreadable). */
    amountText: string;
    amount: number | null;
    /**
     * For a resource bought several at a time: how many, and the price
     * of one. The amount is then their total, so nobody multiplies.
     */
    quantity: number | null;
    unitAmount: number | null;
    currency: string;
    /** Whether it is in the organisation's currency, so counts. */
    counted: boolean;
    frequency: CostFrequency;
    frequencyOther: string;
    /** The frequency where the cost was recorded, before reclassifying. */
    sourceFrequency: CostFrequency;
    month: StrategyMonthValue;
    fixedPart: number | null;
    variablePerUnit: number | null;
    /** For a one-time cost: equipment or a deposit; "" for an expense. */
    asset: CostAsset | "";
    /** The page's own record, editable here; null for a read one. */
    own: OwnCostValue | null;
    /** The asset a Technical Support service builds or installs: its price is added to that asset's value (rule C2). */
    capitalisedInto?: string;
    /** The Start date and the End date of the card the cost was read from (ISO dates; "" when it has none): they place the cost around the Opening Date. */
    startDate?: string;
    endDate?: string;
    /** Where the card is filed on Page 3, for the cost nature: its place and group, its billing type and cost option, and whether it buys a physical asset. */
    place?: "infrastructure" | "offering";
    groupId?: string;
    billing?: BillingType;
    costOption?: string;
    physicalAsset?: boolean;
    /** The card's own useful life (years), amortisation period (years) and rate override (a percent), for the calculated lines. */
    usefulLife?: string;
    amortisationYears?: string;
    rateOverride?: string;
    /** The card's own Qty, as typed: what opening stock is bought in (a Per unit price is the price of one), and how many projects a Per project price is for. */
    cardQuantity?: string;
    /** A Producers & Wholesalers card's Minimum order (X6): the smallest purchase, in units; the forecast buys at least this when a purchase is needed. */
    minimumOrder?: number;
    /** The payment plan of a Per project price: when the money leaves, not what the cost is. */
    paymentPlan?: BusinessPaymentPlan;
    /**
     * Where it was recorded, as a jump path (see jumpTo.ts): the card,
     * then what holds it. Empty for a cost added on this page.
     */
    sourcePath: string[];
}

/** What an asset is worth: its own cost plus the services bundled into it (counted ones only). */
export function assetValue(lines: readonly CostLine[], assetId: string): number {
    return lines
        .filter(line => line.counted && (line.id === assetId || line.capitalisedInto === assetId))
        .reduce((total, line) => total + (line.amount ?? 0), 0);
}

/** Page 3's frequencies onto this page's. */
function fromCapabilityFrequency(frequency: string, unit = "", purchase = false): CostFrequency {
    /* A purchase of an asset (an asset group's card priced Per unit) is paid once, for its quantity; any other Per unit is a cost of each unit -- per order
       where its unit is the order. A share of revenue is not scheduled here: it is a calculated line of the Financial Foundation (a later task). */
    if (frequency === "per-unit") {
        return purchase ? "one-time" : unit.trim() === "order" ? "per-order" : "per-unit";
    }
    return frequency === "one-time" || frequency === "monthly" || frequency === "quarterly" || frequency === "annually" ||
        frequency === "per-order" || frequency === "per-project"
        ? frequency
        : frequency === "percent-revenue" ? "usage-based"
        : frequency === "other" ? "other" : "monthly";
}

/** The Legal Entity's ("One time", "Monthly", "Annually"). */
function fromLegalFrequency(frequency: string): CostFrequency {
    return frequency === "One time" ? "one-time"
        : frequency === "Annually" ? "annually"
            : frequency === "Monthly" ? "monthly"
                : "other";
}

export interface CostSources {
    legalEntity: LegalEntityValue;
    capability: BusinessCapabilityValue;
    /** Resource group ids to their labels (Utilities, Workstation…). */
    resourceGroupLabels: Record<string, string>;
    /** Fixed subsection ids to their labels (Internet, Furniture…). */
    subsectionLabels: Record<string, string>;
    /** The organisation's currency; "" when not chosen yet. */
    currency: string;
    /**
     * Whether Page 3's founders are the Legal Entity's -- the only
     * founders whose salaries are real. See withLegalEntityFounders.
     */
    foundersLinked: boolean;
}

/**
 * Every cost the organisation has recorded, from wherever it was
 * recorded, with this page's classification laid over it.
 *
 * Read from:
 * - 1. Identity System → 3. Legal Entity → its Expenses;
 * - Page 3 → Infrastructure → 1. Founders' salaries, the Workspace,
 *   every resource marked "Costs", and both kinds of partner;
 * - Page 3 → Offering's Capability → the same, per Offering;
 * - and this page's own + Add Cost.
 *
 * A read cost starts classified by where it came from -- an
 * Offering's cost in the Offering group, a one-time cost as
 * Establishment, anything else as Operating, and Fixed -- and any of
 * that the founder changes here is kept against its id.
 */
export function consolidateCosts(
    value: FinancialFoundationValue,
    sources: CostSources
): CostLine[] {

    const lines: CostLine[] = [];

    const read = (
        id: string,
        name: string,
        origin: CostOrigin,
        sourceLabel: string,
        amountText: string,
        currency: string,
        frequency: CostFrequency,
        frequencyOther: string,
        defaultGroup: CostGroup,
        offeringIds: string[],
        quantity: number | null = null,
        /** When the source already says when it was paid. */
        knownMonth: StrategyMonthValue | null = null,
        sourcePath: string[] = []
    ) => {

        const unitAmount = notNegative(parseAmount(amountText));
        const total = quantity !== null && unitAmount !== null
            ? Math.round(unitAmount * quantity * 100) / 100
            : unitAmount;

        const override = value.classified[id] ?? {};

        // Only a cost recorded as "Other" can be reclassified: any
        // other frequency is the source's to change.
        const effectiveFrequency: CostFrequency = frequency === "other" && override.frequency
            ? override.frequency
            : frequency;

        const effectiveCurrency = currency || sources.currency;

        /*
            AN OFFERING'S COST IS ONE RECORDED FOR IT, on Page 3's
            Offering's Capability, and only that: it stays in the
            Offering group, linked to the Offering Page 3 links it to.
            Any other cost can move between Establishment, Operating
            and Other, and is never an Offering's, so never variable.
        */
        const forOffering = defaultGroup === "offering";

        const chosenGroup = override.group && override.group !== "offering" ? override.group : "";

        const group: CostGroup = forOffering
            ? "offering"
            : chosenGroup || (frequency === "one-time" ? "establishment" : defaultGroup);

        lines.push({
            id,
            name: name.trim() || "Unnamed cost",
            origin,
            sourceLabel,
            group,
            // A cost of activity is variable until said otherwise.
            behaviour: !forOffering
                ? "fixed"
                : override.behaviour ||
                    (effectiveFrequency === "per-unit" || effectiveFrequency === "per-project" ? "variable" : "fixed"),
            offeringIds: forOffering ? offeringIds : [],
            offeringId: forOffering ? offeringIds[0] ?? "" : "",
            amountText: quantity !== null && total !== null ? numberAsText(total) : amountText,
            amount: total,
            quantity: quantity !== null && unitAmount !== null ? quantity : null,
            unitAmount: quantity !== null ? unitAmount : null,
            currency: effectiveCurrency,
            counted: !sources.currency || effectiveCurrency === sources.currency,
            frequency: effectiveFrequency,
            frequencyOther,
            sourceFrequency: frequency,
            month: override.month ?? (knownMonth ? { ...knownMonth } : { ...EMPTY_MONTH }),
            fixedPart: notNegative(parseAmount(override.fixedPart ?? "")),
            variablePerUnit: notNegative(parseAmount(override.variablePerUnit ?? "")),
            asset: override.asset ?? "",
            own: null,
            sourcePath
        });

    };

    const fromCost = (
        id: string,
        name: string,
        origin: CostOrigin,
        sourceLabel: string,
        cost: BusinessCostValue,
        defaultGroup: CostGroup,
        offeringIds: string[],
        quantity = "",
        sourcePath: string[] = [],
        purchase = false,
        shares: Record<string, string> = {},
        /** A partner or supplier card: a Per unit price is multiplied by its Qty (0.4 of an hour at 23.50 an hour). */
        multiplyPerUnit = false
    ) => {
        if (parseAmount(cost.price) === null) {
            return;
        }
        const before = lines.length;
        read(
            id, name, origin, sourceLabel, cost.price, cost.currency,
            fromCapabilityFrequency(cost.frequency, cost.unit, purchase), cost.frequencyOther,
            defaultGroup, offeringIds, resourceUnitCount(quantity, multiplyPerUnit && cost.frequency === "per-unit" ? "monthly" : cost.frequency, purchase),
            null, sourcePath
        );
        if (lines.length > before && offeringIds.length > 1) {
            lines[lines.length - 1].offeringShares = offeringFractions(offeringIds, shares);
        }
    };

    /**
     * A card's optional EXTRAS, each ticked one: money (a tax, a charge, a deposit, a bonus, a clearance fee) is one cost line at the extra's own frequency, in
     * the card's currency; a Deposit is an asset returned later, never a cost. A percent of cost (customs duty, other duties: X7, P1) is a line of the card's own
     * kind (its frequency and unit) whose price is the card's price times the rate. A commission (a percent of revenue) is a calculated line of the revenue it
     * follows, as a partner's (X5). A Minimum order is no line: it is the card's floor (X6), kept on the card's own line for the forecast.
     */
    const extraLines = (
        id: string,
        name: string,
        origin: CostOrigin,
        sourceLabel: string,
        extras: BusinessExtrasValue,
        keys: readonly BusinessExtraKey[],
        currency: string,
        defaultGroup: CostGroup,
        offeringIds: string[],
        sourcePath: string[],
        shares: Record<string, string> = {},
        basis?: BusinessCostValue
    ) => {
        for (const key of keys) {
            const definition = BUSINESS_EXTRAS[key];
            const amount = extras[key];
            if (!amount) {
                continue;
            }
            if (definition.kind === "quantity") {
                const floor = parseAmount(amount);
                const own = lines.find(line => line.id === id);
                if (own && floor !== null && floor > 0) {
                    own.minimumOrder = floor;
                }
                continue;
            }
            if (definition.kind === "percent") {
                const rate = parseAmount(amount);
                if (rate === null || rate <= 0) {
                    continue;
                }
                if (definition.frequency === "percent-revenue") {
                    fromCost(
                        id + ":" + key, name + ": " + definition.label.toLowerCase(), origin, sourceLabel,
                        { price: amount, frequency: "percent-revenue", frequencyOther: "", unit: "", currency },
                        defaultGroup, offeringIds, "", sourcePath, false, shares
                    );
                } else if (basis) {
                    const price = parseAmount(basis.price);
                    if (price === null) {
                        continue;
                    }
                    fromCost(
                        id + ":" + key, name + ": " + definition.label.toLowerCase() + " (" + amount + "%)", origin, sourceLabel,
                        { price: String(Math.round(price * rate) / 100), frequency: basis.frequency, frequencyOther: basis.frequencyOther, unit: basis.unit, currency },
                        defaultGroup, offeringIds, "", sourcePath, false, shares
                    );
                }
                continue;
            }
            if (definition.kind !== "money") {
                continue;
            }
            const before = lines.length;
            fromCost(
                id + ":" + key, name + ": " + definition.label.toLowerCase(), origin, sourceLabel,
                { price: amount, frequency: definition.frequency, frequencyOther: "", unit: key === "handling-pallet" ? "pallet" : "", currency },
                defaultGroup, offeringIds, "", sourcePath, false, shares
            );
            if (key === "deposit" && lines.length > before) {
                lines[lines.length - 1].asset = value.classified[id + ":" + key]?.asset ?? "deposit";
            }
        }
    };

    /* 1. Identity System → Legal Entity. Its one-time fees are paid
       when the organization is formed: before the plan, if it was. */
    const formed = /^(\d{4})-(\d{2})/.exec(sources.legalEntity.formation.date);
    const formationMonth: StrategyMonthValue | null = formed ? { month: formed[2], year: formed[1] } : null;
    const monthOfDate = (iso: string): StrategyMonthValue | null => {
        const match = /^(\d{4})-(\d{2})/.exec(iso);
        return match ? { month: match[2], year: match[1] } : null;
    };
    sources.legalEntity.expenses.forEach(expense => {
        if (parseAmount(expense.cost) === null) {
            return;
        }
        read(
            "legal-" + expense.id,
            expense.name,
            "legal-entity",
            "Legal Entity → Expenses",
            expense.cost,
            "",
            fromLegalFrequency(expense.frequency),
            "",
            expense.frequency === "One time" ? "establishment" : "operating",
            [],
            null,
            // (A one-time expense falls in the month of its own date; with none, in the month of the formation.)
            expense.frequency === "One time" ? monthOfDate(expense.date) ?? formationMonth : null,
            ["legal-expense-" + expense.id, "legal-section-5"]
        );
    });

    const capability = sources.capability;

    /* Founders' salaries -- given for the founder's Frequency (a week,
       a month or a year) on Page 3, and counted here a month. */
    if (sources.foundersLinked) {
        capability.founders.forEach(founder => {
            const founderPath = ["founder-" + founder.id, "resource-group-founders", "contains-founders", "section-infrastructure-resources", "capability-infrastructure"];
            extraLines(
                "founder-" + founder.id, founder.name.trim() || "Unnamed founder", "founders", "Infrastructure → Founders",
                founder.extras, PEOPLE_EXTRA_KEYS, "", "operating", [], founderPath
            );
            const monthly = founderMonthlySalary(founder);
            if (monthly === null) {
                return;
            }
            read(
                "salary-" + founder.id,
                "Salary: " + (founder.name.trim() || "Unnamed founder"),
                "founders",
                "Infrastructure → Founders",
                // As typed where it is a month's; a week's or a year's, a month's worth.
                (founder.period === "week" || founder.period === "year") ? String(monthly) : founder.salary,
                "",
                "monthly",
                "",
                "operating",
                [],
                null,
                null,
                ["founder-" + founder.id, "resource-group-founders", "contains-founders", "section-infrastructure-resources", "capability-infrastructure"]
            );
        });
    }

    /* The Workspace, when it costs money. */
    workspacesOf(capability).forEach((workspace, workspaceIndex) => {
      if (isCostingStatus(workspace.status)) {
        fromCost(
            workspace.id, workspace.name.trim() || workspaceCardName(workspaceIndex), "infrastructure",
            "Infrastructure → Workspace",
            workspace.cost, "operating", [], "",
            ["resource-group-workspace", "contains-workspace", "section-infrastructure-resources", "capability-infrastructure"]
        );
        // Its extras (a bought space's tax and charge), kept on the card itself.
        const card = (capability.resources[WORKSPACE_GROUP_ID] ?? []).flatMap(subsection => subsection.slots).find(slot => slot.id === workspace.id);
        if (card) {
            extraLines(
                workspace.id, workspace.name.trim() || workspaceCardName(workspaceIndex), "infrastructure", "Infrastructure → Workspace",
                card.extras, slotExtraKeys("premises", workspace.status), workspace.cost.currency, "operating", [],
                ["resource-group-workspace", "contains-workspace", "section-infrastructure-resources", "capability-infrastructure"]
            );
        }

        /* Its optional Deposit: one-time, an Establishment cost paid at the
           plan's start, treated as a Deposit (an asset returned later, never
           a cost) unless the founder reclassifies it here. In the Workspace's
           currency. */
        const deposit = workspace.deposit;
        if (deposit && parseAmount(deposit) !== null) {
            const before = lines.length;
            read(
                workspace.id + "-deposit", workspaceCardName(workspaceIndex) + " deposit", "infrastructure",
                "Infrastructure → Workspace",
                deposit, workspace.cost.currency,
                "one-time", "", "establishment", [], null,
                monthOrdinal(value.planStart) !== null ? { ...value.planStart } : null,
                ["resource-group-workspace", "contains-workspace", "section-infrastructure-resources", "capability-infrastructure"]
            );
            if (lines.length > before) {
                const line = lines[lines.length - 1];
                line.asset = value.classified[workspace.id + "-deposit"]?.asset ?? "deposit";
            }
        }
      }
    });

    /* Every resource marked "Costs". */
    Object.entries(capability.resources).filter(([groupId]) => groupId !== WORKSPACE_GROUP_ID).forEach(([groupId, subsections]) => {
        subsections.forEach(subsection => {

            const subsectionName = sources.subsectionLabels[subsection.id] ||
                subsection.name.trim() || "Other";

            subsection.slots.forEach(slot => {
                if (!isCostingStatus(slot.status)) {
                    return;
                }
                fromCost(
                    slot.id,
                    slot.name,
                    "infrastructure",
                    "Infrastructure → " +
                        (sources.resourceGroupLabels[groupId] ?? groupId) +
                        " → " + subsectionName,
                    slot.cost, "operating", [], slot.quantity,
                    [slot.id, "subsection-" + groupId + "-" + subsection.id, "resource-group-" + groupId,
                        "contains-" + groupId, "section-infrastructure-resources", "capability-infrastructure"],
                    isPurchaseGroup(subsection.id)
                );
                extraLines(
                    slot.id, slot.name, "infrastructure",
                    "Infrastructure → " + (sources.resourceGroupLabels[groupId] ?? groupId) + " → " + subsectionName,
                    slot.extras, slotExtraKeys(subsection.id, slot.status), slot.cost.currency, "operating", [],
                    [slot.id, "subsection-" + groupId + "-" + subsection.id, "resource-group-" + groupId, "contains-" + groupId, "section-infrastructure-resources", "capability-infrastructure"]
                );
            });

        });
    });

    /* Partners & Suppliers. */
    (["professionals", "providers"] as const)
        .forEach(kind => {
            capability[kind].forEach(partner => {
                const connections = supplierConnections(capability, partner.id);
                const path = [partner.id, "partners-infrastructure-" + partnerKindOf(partner, kind), "section-infrastructure-partners", "capability-infrastructure"];
                const label = "Infrastructure → " + (partnerKindOf(partner, kind) === "providers" ? "Suppliers" : "Partners");
                fromCost(partner.id, partner.name, "infrastructure", label, partner.cost, "operating", [], partnerHasQuantity(connections, partner.cost) ? partner.quantity : "", path, false, {}, true);
                extraLines(partner.id, partner.name, "infrastructure", label, partner.extras, partnerExtraKeys(partner.group, connections), partner.cost.currency, "operating", [], path, {}, partner.cost);
            });
        });

    /* Offering's Capability: an Offering's own costs. */
    capability.offering.resources.forEach(slot => {
        if (!isCostingStatus(slot.status)) {
            return;
        }
        fromCost(
            slot.id, slot.name, "offering-capability",
            "Offering's Capability → Resources",
            slot.cost, "offering", slot.offeringIds, slot.quantity,
            [slot.id, "section-offering-resources", "capability-offering-capability"],
            isPurchaseGroup(slot.group), slot.offeringShares
        );
        extraLines(
            slot.id, slot.name, "offering-capability", "Offering's Capability → Resources",
            slot.extras, slotExtraKeys(slot.group, slot.status), slot.cost.currency, "offering", slot.offeringIds,
            [slot.id, "section-offering-resources", "capability-offering-capability"], slot.offeringShares
        );
    });

    (["professionals", "providers"] as const)
        .forEach(kind => {
            capability.offering[kind].forEach(partner => {
                const connections = supplierConnections(capability, partner.id);
                const path = [partner.id, "partners-offering-" + partnerKindOf(partner, kind), "section-offering-partners", "capability-offering-capability"];
                const label = "Offering's Capability → " + (partnerKindOf(partner, kind) === "providers" ? "Suppliers" : "Partners");
                fromCost(partner.id, partner.name, "offering-capability", label, partner.cost, "offering", partner.offeringIds, partnerHasQuantity(connections, partner.cost) ? partner.quantity : "", path, false, partner.offeringShares, true);
                extraLines(partner.id, partner.name, "offering-capability", label, partner.extras, partnerExtraKeys(partner.group, connections), partner.cost.currency, "offering", partner.offeringIds, path, partner.offeringShares, partner.cost);
            });
        });

    /* A Technical Support service named by an asset card is bundled into that asset. */
    const bundled = serviceAssetLinks(capability);
    lines.forEach(line => {
        if (line.id in bundled) {
            line.capitalisedInto = bundled[line.id];
        }
    });

    /* The dates of the card each cost was read from. */
    const dates = new Map<string, { start: string; end: string }>();
    [...Object.values(capability.resources).flat().flatMap(subsection => subsection.slots), ...capability.offering.resources].forEach(slot => dates.set(slot.id, { start: slot.startDate, end: slot.endDate }));
    [...capability.professionals, ...capability.providers, ...capability.offering.professionals, ...capability.offering.providers]
        .forEach(partner => dates.set(partner.id, { start: partner.startDate, end: partner.endDate }));
    capability.founders.forEach(founder => {
        dates.set("founder-" + founder.id, { start: founder.startDate, end: "" });
        dates.set("salary-" + founder.id, { start: founder.startDate, end: "" });
    });
    sources.legalEntity.expenses.forEach(expense => dates.set("legal-" + expense.id, { start: expense.date, end: "" }));
    lines.forEach(line => {
        const own = dates.get(line.id.split(":")[0]);
        if (own) {
            line.startDate = own.start;
            line.endDate = own.end;
            // THE START DATE PLACES THE COST IN A MONTH OF THE CASH FLOW (cost model, section 2): a card's first month is the month of its Start date, unless a
            // month was chosen on this page. (A Per project card is paid by its own dates; a Per unit cost follows the sales.)
            const dated = monthOfDate(own.start);
            if (dated && line.month.month === "" && line.frequency !== "per-project" && !isPerUnitFrequency(line.frequency)) {
                line.month = dated;
            }
        }
    });

    /* Where each card is filed, its billing type and whether it buys a physical asset: what the cost nature rules ask. */
    const filed = new Map<string, Pick<CostLine, "place" | "groupId" | "billing" | "costOption" | "physicalAsset" | "usefulLife" | "amortisationYears" | "rateOverride" | "cardQuantity" | "paymentPlan">>();
    const fileSlot = (slot: BusinessResourceSlotValue, place: "infrastructure" | "offering", groupId: string) => filed.set(slot.id, {
        place,
        groupId,
        billing: billingOf(place, groupId, slot.costOption),
        costOption: slot.costOption,
        physicalAsset: isCostingStatus(slot.status) && (isPurchaseGroup(groupId) || (isSpaceOnlyGroup(groupId) && slot.status === "buy")),
        usefulLife: slot.usefulLife,
        amortisationYears: slot.amortisationYears,
        rateOverride: slot.rateOverride,
        cardQuantity: slot.quantity,
        paymentPlan: slot.paymentPlan
    });
    Object.values(capability.resources).forEach(subsections => subsections.forEach(subsection => subsection.slots.forEach(slot => fileSlot(slot, "infrastructure", subsection.id))));
    capability.offering.resources.forEach(slot => fileSlot(slot, "offering", slot.group));
    const filePartner = (partner: BusinessPartnerValue, place: "infrastructure" | "offering") => filed.set(partner.id, {
        place, groupId: partner.group, billing: billingOf(place, partner.group, partner.costOption), costOption: partner.costOption, physicalAsset: false,
        usefulLife: "", amortisationYears: "", rateOverride: partner.rateOverride, paymentPlan: partner.paymentPlan
    });
    [...capability.professionals, ...capability.providers].forEach(partner => filePartner(partner, "infrastructure"));
    [...capability.offering.professionals, ...capability.offering.providers].forEach(partner => filePartner(partner, "offering"));
    lines.forEach(line => {
        const own = filed.get(line.id.split(":")[0]);
        if (own) {
            Object.assign(line, own);
        }
        // A dated Per project card is one payment, as a one-time cost is: it stands with the Establishment costs unless a group was chosen on this page.
        if (isProjectPayment(line) && line.group === "operating" && !value.classified[line.id]?.group) {
            line.group = "establishment";
        }
        // A person's commission (a percent of revenue, an extra of its card): a calculated line of the revenue it follows, as a partner's commission.
        if (line.id.includes(":commission") && line.frequency === "usage-based") {
            line.billing = "percentage";
            line.costOption = "affiliate-commission";
        }
    });

    /* And this page's own. */
    value.costs.forEach(cost => {
        lines.push({
            id: cost.id,
            name: cost.name.trim() || "Unnamed cost",
            origin: "own",
            sourceLabel: "Financial Foundation",
            group: cost.group || "operating",
            behaviour: cost.behaviour || "fixed",
            offeringIds: cost.offeringId ? [cost.offeringId] : [],
            offeringId: cost.offeringId,
            amountText: cost.amount,
            amount: notNegative(parseAmount(cost.amount)),
            quantity: null,
            unitAmount: null,
            sourcePath: [],
            currency: sources.currency,
            counted: true,
            frequency: cost.frequency || "one-time",
            sourceFrequency: cost.frequency || "one-time",
            frequencyOther: cost.frequencyOther,
            month: cost.month,
            fixedPart: notNegative(parseAmount(cost.fixedPart)),
            variablePerUnit: notNegative(parseAmount(cost.variablePerUnit)),
            asset: cost.asset,
            own: cost
        });
    });

    return lines;

}

/**
 * A one-time cost paid before the plan starts: already paid, from
 * money that is no longer in the balance the plan starts with, so it
 * is shown but counted nowhere.
 */
export function paidBeforePlan(line: CostLine, start: StrategyMonthValue): boolean {
    const paid = monthOrdinal(line.month);
    const first = monthOrdinal(start);
    return line.frequency === "one-time" && paid !== null && first !== null && paid < first;
}

/**
 * One-time costs paid before the plan starts: already spent, out of the
 * money the organization had, so not in the plan's opening balance.
 */
export function spentBeforePlan(lines: CostLine[], start: StrategyMonthValue): number {
    const projects = lines
        .filter(line => line.counted && line.amount !== null && isProjectPayment(line))
        .reduce((sum, line) => sum + projectPayments(line, start).filter(payment => payment.index < 0).reduce((total, payment) => total + payment.amount, 0), 0);
    return projects + lines
        .filter(line => line.counted && line.amount !== null && paidBeforePlan(line, start))
        .reduce((sum, line) => sum + scheduledAmount(line), 0);
}

/**
 * What a cost pays each time it falls due. A semi-variable cost that
 * has been separated pays only its FIXED part on the calendar: its
 * variable part is paid with each unit sold, and counted there (with
 * the costs of sales), so counting the whole amount here too would
 * count the variable part twice.
 */
export function scheduledAmount(line: CostLine): number {
    const separated = line.behaviour === "semi-variable" &&
        (line.fixedPart !== null || line.variablePerUnit !== null);
    return separated ? line.fixedPart ?? 0 : line.amount ?? 0;
}

/**
 * A PER PROJECT CARD is one price for the project (or Qty of them), paid in full on its Start date or by its payment plan (cost model, section 13; rule X9):
 * a dated payment in the calendar, not a cost of each unit sold. (A cost typed on this page, with no card, is still a cost of each project sold.)
 */
export function isProjectPayment(line: CostLine): boolean {
    // (A card with no Start date has no place in the calendar yet: like an earlier answer, it stays a cost of each project sold.)
    return line.frequency === "per-project" && line.place !== undefined && ((line.startDate ?? "") !== "" || line.paymentPlan?.on === true);
}

/** What a Per project card costs altogether: its price times the number of projects (its Qty, 1 where it has none). */
export function projectTotal(line: CostLine): number {
    return Math.round((line.amount ?? 0) * Math.max(1, parseDecimal(line.cardQuantity ?? "") ?? 1) * 100) / 100;
}

/** The plan month (0-based, negative before the plan) an ISO date falls in; null for no date. */
function planMonthIndex(iso: string, start: StrategyMonthValue): number | null {
    const date = /^(\d{4})-(\d{2})/.exec(iso);
    const first = monthOrdinal(start);
    return date && first !== null ? Number(date[1]) * 12 + Number(date[2]) - 1 - first : null;
}

/**
 * WHEN A PER PROJECT CARD IS PAID (the payment plan, rule X9): the total split by the plan's percents, each on its own date. Not ticked, or a plan that is
 * not complete, the whole price is paid on the Start date (the plan's first month where it has none). Returns each payment's plan month (0-based, negative
 * when it falls before the plan) and amount.
 */
export function projectPayments(line: CostLine, start: StrategyMonthValue): { index: number; amount: number }[] {
    const total = projectTotal(line);
    const startIndex = planMonthIndex(line.startDate ?? "", start) ?? ((planMonth(start, line.month) ?? 1) - 1);
    const plan = line.paymentPlan;
    if (!plan || !plan.on || paymentPlanIncomplete({ frequency: "per-project" }, plan, line.startDate ?? "", line.endDate ?? "")) {
        return [{ index: startIndex, amount: total }];
    }
    const payments = paymentPlanLines(plan, line.startDate ?? "", line.endDate ?? "")
        .map(entry => ({ index: planMonthIndex(entry.date, start) ?? startIndex, amount: Math.round(total * (parseAmount(entry.percent) ?? 0)) / 100 }));
    // (Rounding leaves a cent or two on the last payment.)
    const rest = Math.round((total - payments.reduce((sum, payment) => sum + payment.amount, 0)) * 100) / 100;
    if (payments.length > 0 && rest !== 0) {
        payments[payments.length - 1].amount = Math.round((payments[payments.length - 1].amount + rest) * 100) / 100;
    }
    return payments;
}

/** The cost of a Per project card as it is incurred: the whole price in the month of its Start date, whenever the money leaves. */
export function projectExpenseSchedule(line: CostLine, start: StrategyMonthValue): number[] {
    const months = new Array<number>(MODEL_MONTHS).fill(0);
    if (!line.counted || line.amount === null || !isProjectPayment(line)) {
        return months;
    }
    const at = planMonthIndex(line.startDate ?? "", start) ?? ((planMonth(start, line.month) ?? 1) - 1);
    if (at >= 0 && at < MODEL_MONTHS) {
        months[at] = projectTotal(line);
    }
    return months;
}

/** Whether a cost has a place in the calendar this page can model. */
export function isScheduled(line: CostLine): boolean {
    return SCHEDULED_FREQUENCIES.includes(line.frequency) || isProjectPayment(line);
}

/** Whether a frequency is paid per unit of activity (per unit, order or project): a variable cost. */
/** Whether a cost is a rate of the revenue it follows (Percentage billing, or the % of Rev driver): its amount is a percent, not money. */
export function isPercentLine(line: Pick<CostLine, "billing" | "frequency">): boolean {
    return line.billing === "percentage" || line.frequency === "usage-based";
}

/** What a cost's amount reads as in a table: money, or "4%" for a rate of revenue. */
export function costAmountShown(line: CostLine, format: (amount: number) => string): string {
    return isPercentLine(line) ? (line.amount === null ? line.amountText : String(Math.round(line.amount * 100) / 100) + "%") : line.amount === null ? line.amountText : format(line.amount);
}

export function isPerUnitFrequency(frequency: CostFrequency): boolean {
    return PER_UNIT_FREQUENCIES.includes(frequency);
}

/** Whether a cost is paid per unit of activity. */
export function isPerUnit(line: CostLine): boolean {
    return isPerUnitFrequency(line.frequency) && !isProjectPayment(line);
}

/**
 * A cost's outflow in each month of the plan, index 0 = Month 1.
 * Zero throughout for a cost that is not counted or not scheduled.
 */
export function costSchedule(line: CostLine, start: StrategyMonthValue): number[] {

    const months = new Array<number>(MODEL_MONTHS).fill(0);

    if (!line.counted || line.amount === null || !isScheduled(line) || paidBeforePlan(line, start)) {
        return months;
    }

    // A Per project card: paid in full on its Start date, or by its payment plan.
    if (isProjectPayment(line)) {
        projectPayments(line, start).forEach(payment => {
            if (payment.index >= 0 && payment.index < MODEL_MONTHS) {
                months[payment.index] += payment.amount;
            }
        });
        return months;
    }

    let first = (planMonth(start, line.month) ?? 1) - 1;

    // First paid before the plan: the plan picks up its cycle where it
    // falls (an annual cost paid in September falls in September).
    const paidOrdinal = monthOrdinal(line.month);
    const startOrdinal = monthOrdinal(start);
    if (paidOrdinal !== null && startOrdinal !== null && paidOrdinal < startOrdinal) {
        const step = line.frequency === "quarterly" ? 3 : line.frequency === "annually" ? 12 : 1;
        first = ((paidOrdinal - startOrdinal) % step + step) % step;
    }

    const paid = scheduledAmount(line);

    // An End date stops a recurring cost from its month (a lease or a subscription that ends).
    const stop = line.endDate ? planMonthIndex(line.endDate, start) : null;
    const last = stop === null ? MODEL_MONTHS - 1 : Math.min(MODEL_MONTHS - 1, stop);

    const every = (step: number) => {
        for (let index = first; index <= last; index += step) {
            months[index] += paid;
        }
    };

    switch (line.frequency) {
        case "one-time":
            if (first < MODEL_MONTHS) {
                months[first] += paid;
            }
            break;
        case "monthly":
            // A monthly cost runs from the plan's start unless a
            // first month is given.
            every(1);
            break;
        case "quarterly":
            every(3);
            break;
        case "annually":
            every(12);
            break;
    }

    return months;

}

/** A recurring cost's monthly equivalent; 0 for anything else. */
/** A day of an ISO date, as a count of days; null where it is not a date. */
export function dayNumber(iso: string): number | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86_400_000 : null;
}

/** The whole months from one ISO date to another (the earlier month counted, the later not): 2027-01-01 to 2027-04-01 is 3. */
export function monthsBetween(from: string, to: string): number {
    const one = /^(\d{4})-(\d{2})/.exec(from);
    const other = /^(\d{4})-(\d{2})/.exec(to);
    return one && other ? (Number(other[1]) - Number(one[1])) * 12 + Number(other[2]) - Number(one[2]) : 0;
}
