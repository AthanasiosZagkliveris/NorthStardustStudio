/**
 * THE BOXES AND SECTIONS: the resource, activity and partner boxes and the Infrastructure and Offering sections. These call one another, so they stay in one file.
 * One part of the Infrastructure & Capability editor (see BusinessCapabilityEditor.tsx): what it needs of the parts before it comes in as `scope`; what the parts after it need goes out.
 */
import TickField from "../../../controls/TickField.tsx";
import TextBox from "../../../controls/TextBox.tsx";
import { connectedOfferings } from "../../../../framework/engine/GeneratedCards.ts";
import { ReactNode } from "react";
import { activityGroupsOf, activityCategoryLabel, BUSINESS_RESOURCE_GROUPS, BUSINESS_OFFERING_RESOURCE_GROUPS, soleGroupOf, BUSINESS_PARTNER_GROUPS, groupHelpPoints, FOUNDERS_OWNERS_HELP, BUSINESS_RESOURCE_STATUSES, usesSupplier, activityPeriod, activityDateIssues, BusinessActivityValue, PARTNER_CATEGORIES, partnerCategoryLabel, partnerNoun, BusinessCapabilityValue, BusinessPartnerValue, BusinessResourceSlotValue, businessAutoResponsibleId, responsibleIsOff, createBusinessActivity, UNASSIGNED_CATEGORY, createBusinessResourceSlot, stableCardHue } from "../../../../framework/engine/AnswerUtils.ts";
import { costText } from "../../../../framework/engine/ExportRenderers.ts";
import { MissingScope, OptionalNote, BusinessRemove } from "../../cards/BusinessCardFields.tsx";
import { PreferencesService } from "../../../../services/PreferencesService.ts";
import { isoToDisplay } from "../../fields/DateCellInput.tsx";
import { summaryText } from "../../cards/cardSummary.ts";
import CardBoxes, { CardBox } from "../../cards/CardBoxes.tsx";
import SectionTiles, { ActiveCount, ItemMark, SectionTile, TileAdd, TileLink } from "../../tiles/SectionTiles.tsx";
import SectionView, { CATEGORY_TILE_MIN_CARDS, SubcategoryBox, SubcategoryBoxes, ViewCategory } from "../../tiles/SectionView.tsx";
import { InfoPoint } from "../../fields/InfoNote.tsx";
import { floorRows, tileLines, tileMarks } from "../../tiles/capabilityFloor.ts";
import CardNameInput from "../../cards/CardNameInput.tsx";
import CardNumber from "../../cards/CardNumber.tsx";
import TextLink from "../../fields/TextLink.tsx";
import { SECTIONS, DELIVERY_HELP, Scope, patchSlot, removeSlot, NO_CATEGORY, NO_GROUP, FIXED_KIND_IDS, blankSlot, blankActivity, withBreak } from "../BusinessCapabilityModel.ts";
import type { useCapabilityState } from "./useCapabilityState.tsx";
import type { useCapabilityCardFields } from "./useCapabilityCardFields.tsx";
import type { useCapabilityPeopleCards } from "./useCapabilityPeopleCards.tsx";
import type { useCapabilityActivityAndDelivery } from "./useCapabilityActivityAndDelivery.tsx";

type Earlier = ReturnType<typeof useCapabilityState> & ReturnType<typeof useCapabilityCardFields> & ReturnType<typeof useCapabilityPeopleCards> & ReturnType<typeof useCapabilityActivityAndDelivery>;

export function useCapabilitySections(earlier: Earlier) {

    const { activityAdd, activityCategoryCell, activityResources, capability, cardDates, cardRule, categoryActivityList, categoryInfo, channelCardIds, channelNamesById, channelTileIds, completedActivities, deliveryCard, deliverySection, disabled, discard, formatMoney, founderCard, founderChoices, founderIds, founderItems, founders, groupSlots, legalExpenses, linksSection, offeringAdd, offeringChoices, offeringNumberOf, offeringSlotsIn, offeringsField, onChange, openPair, openingDate, organisationCurrency, partnerAddIn, partnerCard, partnerCardFor, partnersOf, performerChoices, performerCosts, performerFields, planStartDay, resourceCard, responsibilityField, setCategoryActivities, setResponsibilityFolds, subAdd, tileSection, update } = earlier;

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
    const floor = floorRows(capability, legalExpenses, channelToneIds, channelNamesById);
    const missingById = new Map(floor.filter(row => row.missing).map(row => [row.id, row.missing!] as const));
    const floorById = new Map(floor.map(row => [row.id, row]));
    const tileData = (id: string) => {
        const row = floorById.get(id);
        return row ? { lines: tileLines(row, formatMoney), marks: tileMarks(row, tileLines(row, formatMoney)), links: row.links, tone: row.tone, missing: row.missing } : {};
    };
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
                        <TextBox
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
            <MissingScope lacking={missingById.get(activity.id) ?? []} cardId={activity.id} key={activity.id}>{(lacking) => (
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
                    activity.offeringShares,
                    false,
                    activity.madeBy !== "" ? connectedOfferings(capability, activity).ids : []
                )}

                </fieldset>

                {/* A line, then the card's state (Completed), then its links under it. */}
                {cardRule()}

                {/* Done, at the very end (the one card order: fields,
                    Description, links, then the card's state), on the left with the other ticks. */}
                <TickField className="business-capability-done" aria-label={"Activity " + number + " completed"} disabled={disabled} checked={activity.completed} onChange={(event) => onActivity({
                            completed: event.target.checked
                        })}>
                    <span>Completed</span>
                </TickField>

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
    /** The links of a tile's list to the cards it names: each opens that card alone, floating (SectionTiles). */
    function cardLinks(cards: readonly { id: string }[]): TileLink[] {
        return cards.map(card => ({ card: card.id }));
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
    /** What a tile or box lists of the cards it holds: their names ("Unnamed Resource" for one not named yet). */
    function namesOf(cards: readonly { name: string }[], unnamed: string): string[] {
        return cards.map(card => card.name.trim() || unnamed);
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
    const cards = [
        { id: "infrastructure", body: infrastructureSection },
        { id: "offering-capability", body: offeringSection }
    ];

    return { activityBox, activityCardFor, cardLinks, cards, channelToneIds, childCard, floor, missingById, namesOf, parentCard };

}
