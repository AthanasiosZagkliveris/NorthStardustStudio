/**
 * THE EDITOR'S STATE: the writes, the folds, the reads of the other pages and the numbers worked out from them.
 * One part of the Infrastructure & Capability editor (see BusinessCapabilityEditor.tsx): what it needs of the parts before it comes in as `scope`; what the parts after it need goes out.
 */
import { orphanedCards, withInheritedOfferings, type GeneratedCard } from "../../../../framework/engine/GeneratedCards.ts";
import { useEffect, useRef, useState } from "react";
import { BUSINESS_COST_FREQUENCIES, BUSINESS_RESOURCE_GROUPS, BUSINESS_OFFERING_RESOURCE_GROUPS, offeringGroupsOf, soleGroupOf, BUSINESS_PARTNER_GROUPS, partnerGroupHelp, statusInGroup, RENT_SUPPLIER_GROUP, usesSupplier, type BusinessPaymentPlan, BILLING_TYPES, billingOf, costOptionsOf, withNewInsurances, BUSINESS_WORKSPACE_KINDS, BusinessCategoryValue, partnerNoun, BusinessCapabilityValue, BusinessCostValue, BusinessPartnerValue, BusinessResourceSlotValue, asBusinessCapabilityValue, asBusinessEngagementValue, createBusinessPartner, orderedByDate, todayIsoDate, workspacesOf, withLegalEntityFounders } from "../../../../framework/engine/AnswerUtils.ts";
import { LinkSymbol, BusinessField, BusinessText, uniqueChoices } from "../../cards/BusinessCardFields.tsx";
import { moneyFormatter } from "../../../../framework/engine/FinancialModel.ts";
import { PreferencesService } from "../../../../services/PreferencesService.ts";
import { parseAmount } from "../../../../framework/engine/Amounts.ts";
import { randomId } from "../../../../framework/engine/Readers.ts";
import DateCellInput, { isoToDisplay } from "../../fields/DateCellInput.tsx";
import { resourceChannels, resourceReach } from "../../../../framework/engine/ChannelResources.ts";
import OptionPicker from "../../fields/OptionPicker.tsx";
import { useItemFolds } from "../../fields/useItemFolds.ts";
import { ADD_ACTIVITY, Scope, newActivityFor, costInGroup, startOfCard, withActivity, withActivityPatched, OTHER_PARTNER, WORKSPACE_PROVIDER, NO_CATEGORY, NO_GROUP, blankSlot, blankActivity, blankPartner } from "../BusinessCapabilityModel.ts";
import type { BusinessCapabilityEditorProps } from "./types.ts";

export function useCapabilityState(props: BusinessCapabilityEditorProps) {

    const {

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

} = props;

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
    // The value as of the last render: a subcategory box's "+" (subAdd) is asked, when its floating card closes, about the value AFTER the card was made.
    const live = useRef(capability);
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
    const [pair, setPair] = useState<{ parentId: string; childId: string; alone?: boolean } | null>(null);
    // The founder whose card a legal expense is opened under (the expense is drawn by the Legal Entity's tiles: StackUnderContext).
    const [legalUnder, setLegalUnder] = useState<string | null>(null);
    /** The cards whose Links section is open (it starts folded). */
    const [linksOpen, setLinksOpen] = useState<ReadonlySet<string>>(new Set());
    /*
        EXPECTED SALES, from Demand & Conversion on Customer Engagement:
        the page before this one, so already filled in on the way here.
        Never from a later page.
    */
    const engagementValue = asBusinessEngagementValue(engagement);
    /**
     * The cards a Customer Channel made ("+ Add expenses" on a channel,
     * ChannelResources.ts): they get their own tile and colour, apart
     * from the user's own cards, in the category they belong to.
     */
    const channelCardIds: ReadonlySet<string> = new Set(
        engagementValue.channelResources.map(link => link.resourceId)
    );
    /** The channels each card is under, by name ("Social Media › Instagram"): the cards the channels hold, and the Partner or Supplier a held card is connected to. */
    const channelNamesById = (() => {
        const names = new Map<string, string[]>();
        const add = (id: string, name: string) => names.set(id, [...new Set([...(names.get(id) ?? []), name])]);
        engagementValue.channelResources.forEach(link => {
            const channel = engagementValue.segments.find(entry => entry.segmentId === link.segmentId)?.channels.find(entry => entry.id === link.channelId);
            if (channel) {
                add(link.resourceId, [channel.category, channel.name.trim() || "Unnamed channel"].filter(Boolean).join(" › "));
            }
        });
        [...Object.values(capability.resources).flat().flatMap(entry => entry.slots), ...capability.offering.resources].forEach(slot => {
            if (usesSupplier(slot.status) && slot.providerId) {
                (names.get(slot.id) ?? []).forEach(name => add(slot.providerId, name));
            }
        });
        return names;
    })();
    const formatMoney = moneyFormatter(organisationCurrency ?? "");
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
    // The amount of a payment being typed (a payment plan's amount and percent are one figure: the text typed stays as typed).
    // The cards whose optional End date is ticked while it is still empty (a date typed keeps it ticked by itself).
    const [endTicked, setEndTicked] = useState<ReadonlySet<string>>(new Set());
    // What a date refused says (the End date of a Per project card cannot be before a payment, and a payment cannot fall after the End date), by card.
    const [dateNotice, setDateNotice] = useState<{ owner: string; text: string } | null>(null);
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
    /* ---------- 2. Payment plan ---------- */

    /** What a Per project card costs altogether: its price times its Qty (1 where it has none); null while the price is not typed. */
    /** The latest date a Per project card's payment plan pays on ("" while it has none, or it is not a plan). */
    function latestPaymentOf(frequency: string, plan: BusinessPaymentPlan): string {
        return frequency === "per-project" && plan.on ? plan.lines.reduce((latest, line) => line.date > latest ? line.date : latest, "") : "";
    }
    /**
     * Resources whose provider or professional was just created
     * through "Other…", and so still show the box that names it.
     */
    const [naming, setNaming] = useState<ReadonlySet<string>>(new Set());
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
        found = { ...found, status: statusInGroup(found.status, subId), cost: costInGroup(found.cost, "infrastructure", subId) };
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
                            onSlot({ category: id, group, status: statusInGroup(slot.status, group), cost: costInGroup(slot.cost, "offering", group) });
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
                            onSlot({ group: id, status: statusInGroup(slot.status, id), cost: costInGroup(slot.cost, "offering", id) });
                        }
                    },
                    onNew: () => undefined,
                    onRename: () => undefined
                })}
            </>
        );
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
    /** Opens a parent and its child together, stacked, over whatever is open (Back returns to it). */
    function openPair(parentId: string, childId: string, alone = false) {
        // (Over what is open: Back returns to it; Escape closes every layer. `alone`: only the child's card, the parent's is not drawn again.)
        setPair({ parentId, childId, alone });
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
    /** The Category and Group picked on a status row's supplier rows before a name is chosen, by the row's key (a chosen name carries its own). */
    const [cascade, setCascade] = useState<Readonly<Record<string, { category: string; group: string }>>>({});
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

    return { activityRows, capability, cardDates, categoryRow, channelCardIds, channelCategoryText, channelMade, channelNamesById, channelTitle, collapsed, columnsDivider, completedOpen, costOptionRows, dateNotice, defaultRateOf, disabled, discard, engagementValue, financialFoundation, folds, formatMoney, foundation, founders, foundersProfile, globalSettings, helpOpen, latestPaymentOf, legalEntity, legalEntityFounders, legalEntityPrefill, legalExpenses, legalUnder, linksOpen, live, offeringCategoryCells, onChange, onChangeLegalEntity, onOpenFoundation, onOpenLegalEntity, openPair, openingDate, organisationCurrency, pair, partnersOf, patchPartner, pending, rentRow, resourceCategoryCells, responsibilityFolds, responsibilityOff, setCollapsed, setCompletedOpen, setDateNotice, setHelpOpen, setLegalUnder, setLinksOpen, setPair, setPending, setResponsibilityFolds, setResponsibilityOff, showInstructions, stored, supplierRows, value, withDefaultRate, withPartners, write };

}
