/**
 * THE FOUNDER AND PARTNER CARDS, and the choosers and category cells they hold.
 * One part of the Infrastructure & Capability editor (see BusinessCapabilityEditor.tsx): what it needs of the parts before it comes in as `scope`; what the parts after it need goes out.
 */
import ListStatic from "../../fields/ListStatic.tsx";
import FieldLabel from "../../../controls/FieldLabel.tsx";
import NumberCell from "../../../controls/NumberCell.tsx";
import { connectedOfferings } from "../../../../framework/engine/GeneratedCards.ts";
import { ReactNode } from "react";
import { legalFormOptions } from "../../../../framework/engine/LegalEntityJurisdictions.ts";
import { asLegalEntityValue } from "../../../../framework/engine/AnswerLegal.ts";
import ResponsibilityFilter from "../../fields/ResponsibilityFilter.tsx";
import { activityGroupsOf, activityCategoryLabel, soleGroupOf, BUSINESS_PARTNER_GROUPS, partnerGroupHelp, usesSupplier, PEOPLE_EXTRA_KEYS, partnerExtraFieldKeys, supplierConnections, billingOf, costWithOption, noteHint, partnerHasQuantity, businessQuantityText, BUSINESS_WORKSPACE_KINDS, BusinessActivityValue, BusinessCategoryValue, PARTNER_CATEGORIES, partnerCategoryLabel, BusinessCapabilityValue, BusinessFounderValue, BusinessPartnerValue, BusinessResourceSlotValue, businessDecimalText, businessAutoResponsibleId, businessPartnerResponsibleId, responsibleIsOff, businessFounderResponsibilities, businessResponsibilitiesTally, createBusinessResourceSlot, workspacesOf } from "../../../../framework/engine/AnswerUtils.ts";
import { BusinessCard, ResponsibleField, BusinessEmpty, BusinessField, BusinessFieldTick, OptionalNote, BusinessRemove, uniqueChoices } from "../../cards/BusinessCardFields.tsx";
import { founderDeliveryHours, founderWorkingHours } from "../../../../framework/engine/DemandCapacity.ts";
import { parseDecimal } from "../../../../framework/engine/Amounts.ts";
import { labelWithCurrency, nameWithCurrency } from "../../../../framework/engine/Currencies.ts";
import { summaryText } from "../../cards/cardSummary.ts";
import { TileAdd, OPEN_EVENT, type OpenRequest } from "../../tiles/SectionTiles.tsx";
import InfoNote, { InfoPoint, InfoText } from "../../fields/InfoNote.tsx";
import { NUMBER_LIMITS, limitedNumberText } from "../../fields/numberInput.ts";
import OptionPicker from "../../fields/OptionPicker.tsx";
import FoldArrow from "../../fields/FoldArrow.tsx";
import { toggledIn } from "../../fields/toggledIn.ts";
import TextLink from "../../fields/TextLink.tsx";
import { SECTIONS, DELIVERY_HELP, FOUNDER_FREQUENCIES, HOURS_PER_MONTH_HELP, formatHours, Scope, costInGroup, blankSlot } from "../BusinessCapabilityModel.ts";
import type { useCapabilityState } from "./useCapabilityState.tsx";
import type { useCapabilityCardFields } from "./useCapabilityCardFields.tsx";

type Earlier = ReturnType<typeof useCapabilityState> & ReturnType<typeof useCapabilityCardFields>;

export function useCapabilityPeopleCards(earlier: Earlier) {

    const { capability, cardDates, categoryRow, channelCardIds, channelMade, channelTitle, completedOpen, costFields, costOptionRows, defaultRateOf, disabled, extrasFields, folds, founders, latestPaymentOf, legalEntity, legalExpenses, linksSection, live, offeringsField, onChange, onChangeLegalEntity, onOpenLegalEntity, openPair, organisationCurrency, partnersOf, patchPartner, paymentPlanFields, planTotalOf, rateOverrideField, responsibilityFolds, responsibilityOff, setCompletedOpen, setLegalUnder, setPair, setResponsibilityFolds, setResponsibilityOff, withDefaultRate, withPartners } = earlier;

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
    function update(patch: Partial<BusinessCapabilityValue>) {
        onChange({ ...capability, ...patch });
    }
    /** A legal expense belongs to the Identity System: its page opens, and the card with it. */
    function openLegalExpense(id: string, under?: string) {
        // (From a founder's card, below it, the two stacked as a pair is; from the Inventory, the card alone.)
        const detail: OpenRequest = { tile: "legal-entity-expenses", card: id, alone: under === undefined, under: under !== undefined };
        setLegalUnder(under ?? null);
        // (A pair already standing -- an activity a responsibility led to -- gives its place to this one.)
        setPair(null);
        // (Where this page can save the Legal Entity's answer, the card floats here: over the page, as every card.)
        if (legalEntity !== undefined && onChangeLegalEntity) {
            document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail }));
            return;
        }
        onOpenLegalEntity?.();
        window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail })), 700);
    }
    /** A line of a founder's Responsibilities: a link that opens the linked card ALONE (the founder's card, which holds the line, is not drawn twice), with a tile list item's reaction. */
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
                    onClick={() => entry.kind === "legal" ? openLegalExpense(entry.id) : openPair(founderId, entry.id, true)}
                >
                    {entry.name}
                </TextLink>
            </span>
        );
    }
    /* ---------- 1. Founders ---------- */

    // A legal form with ONE owner in law (a sole proprietorship, a sole trader ...): the Founders' dialog is the founder's card itself, as on the Legal Entity page -- no frame of its own inside the dialog's.
    const organisation = asLegalEntityValue(legalEntity).organisation;
    const oneOwner = legalEntity !== undefined
        && legalFormOptions(organisation.country, organisation.subdivision).find(form => form.label === organisation.legalForm)?.soleFounder === true;
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
                className={always ? "business-founder-open" + (capability.founders.length === 1 ? " business-founder-solo" : "") + (oneOwner && capability.founders.length === 1 ? " business-founder-unframed" : "") : undefined}
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
                            <ListStatic marker="bullet"
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
                        <NumberCell
                            
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
                        <NumberCell
                            className="delivery-number"
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
                        <NumberCell
                            className="delivery-number"
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
                            <NumberCell
                                className="delivery-number"
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

                        <FieldLabel className="business-foundation-label">
                            {responsibilities.length > 0 && (
                                <FoldArrow variant="label"
                                    open={responsibilitiesOpen}
                                    name={(responsibilitiesOpen ? "Minimize " : "Maximize ") + "Responsibilities of " + founderLabel}
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
                        </FieldLabel>

                        {responsibilities.length > 0 && (
                            <FieldLabel className="field-label-muted business-capability-responsibilities-count">
                                {tally.completed + "/" + tally.total}
                            </FieldLabel>
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
                                        <ListStatic
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
                                                <FieldLabel className="business-foundation-label">
                                                    <FoldArrow variant="label"
                                                        open={doneOpen}
                                                        name={(doneOpen ? "Minimize " : "Maximize ") + "completed responsibilities of " + founderLabel}
                                                        onToggle={() => setCompletedOpen(current => toggledIn(current, doneKey))}
                                                    />
                                                    {"Completed " + done.length}
                                                </FieldLabel>
                                            </span>
                                            {doneOpen && (
                                                <div id={doneKey}>
                                                    <ListStatic
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
    /**
     * The channel-made cards that sit in the Channel tile: the blank ones from "+ Add expenses". A card made from a template ("Typical costs for this channel")
     * is filed in its own Category and Group and lives there, in the channel's colour.
     */
    const channelTileIds: ReadonlySet<string> = new Set([
        ...capability.offering.resources.filter(slot => channelCardIds.has(slot.id) && slot.category === "").map(slot => slot.id),
        ...[...capability.offering.professionals, ...capability.offering.providers].filter(partner => channelCardIds.has(partner.id) && partner.group === "").map(partner => partner.id)
    ]);
    /** The cards of the Offering a customer channel did not make, in one category and group. */
    function offeringSlotsIn(categoryId: string, groupId?: string): BusinessResourceSlotValue[] {
        return capability.offering.resources.filter(slot => !channelTileIds.has(slot.id) && slot.category === categoryId && (groupId === undefined || slot.group === groupId));
    }
    /** A card's number in the list its tile draws it in (the box and the card it opens carry the same number). */
    function offeringNumberOf(slot: BusinessResourceSlotValue): number {
        const list = channelTileIds.has(slot.id)
            ? capability.offering.resources.filter(entry => channelTileIds.has(entry.id))
            : offeringSlotsIn(slot.category, slot.category === "" ? undefined : slot.group);
        return Math.max(0, list.findIndex(entry => entry.id === slot.id)) + 1;
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
    function setPartners(
        scope: Scope,
        kind: "professionals" | "providers",
        next: BusinessPartnerValue[]
    ) {
        onChange(withPartners(capability, scope, kind, next));
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
            const moved = patchPartner(capability, partner.id, { category, group: soleGroupOf(groups), cost: costInGroup(partner.cost, place, soleGroupOf(groups)) });
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
                    onChange(patchPartner(capability, partner.id, { category: picked.type, group: picked.id, cost: costInGroup(partner.cost, scope, picked.id) }));
                }
            },
            onNew: () => undefined,
            onRename: () => undefined
        });
    }
    const founderIds = founders.map(founder => founder.id);
    /* ---------- Who can be named ---------- */

    const founderChoices = uniqueChoices(founders, "Unnamed founder");
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
                                    <NumberCell kind="int"
                                        
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
                    partnerExtraFieldKeys(partner.group, supplierConnections(capability, partner.id)),
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
                    channelMade(scope, partner.id),
                    partner.madeBy !== "" ? connectedOfferings(capability, partner).ids : []
                )}

                {/* THE CARDS THAT USE IT (the resources that name it, the activities it performs): at the end of the card, a link each (above this one when opened). */}
                {linksSection(partner.id, users.map(user => ({ key: user.id, noun: user.noun, name: user.name, onOpen: () => openPair(user.id, partner.id) })))}

            </BusinessCard>
        );

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

    return { activityCategoryCell, channelTileIds, founderCard, founderChoices, founderIds, offeringNumberOf, offeringSlotsIn, openLegalExpense, partnerCard, partnerCardFor, performerChoices, responsibilityField, setCategoryActivities, setPartners, subAdd, update };

}
