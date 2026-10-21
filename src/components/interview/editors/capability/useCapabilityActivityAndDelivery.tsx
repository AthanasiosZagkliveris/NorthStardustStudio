/**
 * THE ACTIVITY DETAILS and the Delivery section.
 * One part of the Infrastructure & Capability editor (see BusinessCapabilityEditor.tsx): what it needs of the parts before it comes in as `scope`; what the parts after it need goes out.
 */
import AddButton from "../../../controls/AddButton.tsx";
import NumberCell from "../../../controls/NumberCell.tsx";
import { Fragment, ReactNode } from "react";
import { BUSINESS_ACTIVITY_CATEGORIES, soleGroupOf, BUSINESS_PARTNER_GROUPS, resourcesStartingTooLate, cappedUnits, unitsCap, BusinessActivityValue, partnerNoun, BusinessPartnerValue, BusinessResourceSlotValue, createBusinessActivity, createBusinessPartner, createBusinessResourceSlot, resourceUnitCount } from "../../../../framework/engine/AnswerUtils.ts";
import { BusinessCard, LinkSymbol, BusinessEmpty, BusinessField, OptionalField, OptionalNote, BusinessRemove, uniqueChoices } from "../../cards/BusinessCardFields.tsx";
import { DeliveryValue, createDelivery, deliveryAllocation, deliveryHours, WEEKS_PER_MONTH, demandResult, founderDeliveryHours } from "../../../../framework/engine/DemandCapacity.ts";
import { asFinancialFoundationValue, moneyFormatter } from "../../../../framework/engine/FinancialModel.ts";
import { parseAmount, parseDecimal } from "../../../../framework/engine/Amounts.ts";
import CardBoxes, { CardBox } from "../../cards/CardBoxes.tsx";
import { CrumbNote, DialogHeading, TileAdd } from "../../tiles/SectionTiles.tsx";
import InfoNote, { InfoPoint, InfoText } from "../../fields/InfoNote.tsx";
import { NUMBER_LIMITS, limitedNumberText } from "../../fields/numberInput.ts";
import OptionPicker from "../../fields/OptionPicker.tsx";
import FoldArrow from "../../fields/FoldArrow.tsx";
import { CAPACITY_UTILISATION_HELP } from "../FinancialParts.tsx";
import { toggledIn } from "../../fields/toggledIn.ts";
import { DELIVERY_HELP, formatHours, readHours, deliveryIsEmpty, FIXED_ACTIVITY_IDS, ACTIVITY_CATEGORY_ORDER, Scope, blankSlot, blankActivity, blankPartner } from "../BusinessCapabilityModel.ts";
import type { useCapabilityState } from "./useCapabilityState.tsx";
import type { useCapabilityCardFields } from "./useCapabilityCardFields.tsx";
import type { useCapabilityPeopleCards } from "./useCapabilityPeopleCards.tsx";

type Earlier = ReturnType<typeof useCapabilityState> & ReturnType<typeof useCapabilityCardFields> & ReturnType<typeof useCapabilityPeopleCards>;

export function useCapabilityActivityAndDelivery(earlier: Earlier) {

    const { capability, collapsed, disabled, engagementValue, financialFoundation, founderChoices, founders, live, offeringChoices, onChange, openPair, organisationCurrency, partnersOf, setCollapsed, setPartners, update } = earlier;

    /** The first day of the plan (Plan Start is a month on 4. Finances); "" until it is given. */
    const planStartDay = (() => {
        const month = asFinancialFoundationValue(financialFoundation).planStart;
        return /^\d{4}$/.test(month.year) && /^\d{1,2}$/.test(month.month) ? month.year + "-" + month.month.padStart(2, "0") + "-01" : "";
    })();
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
                                        <NumberCell kind="int"
                                            className="business-capability-people"
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
                                                <AddButton shape="box" small
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
                                            <NumberCell kind="int"
                                                className="business-capability-people"
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
                                                    <AddButton shape="box" small
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
    /** One activity category's activities, as stored (none until written). */
    function categoryActivityList(categoryId: string): BusinessActivityValue[] {
        return capability.activities.find(
            entry => entry.id === categoryId
        )?.activities ?? [];
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
    function toggle(key: string) {
        setCollapsed(current => toggledIn(current, key));
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
    /** Every card a resource group holds, in its subcategories (fixed, then added), each with its number in its own subcategory. */
    function groupSlots(groupId: string): { slot: BusinessResourceSlotValue; number: number }[] {
        return (capability.resources[groupId] ?? []).flatMap(subsection => subsection.slots.map((slot, at) => ({ slot, number: at + 1 })));
    }
    /** What a category's "i" says: the help texts of its groups (the help-texts document), under the category's name in the dialog's header. */
    function categoryInfo(label: string, lines: CrumbNote["points"]): CrumbNote | undefined {
        return lines.length > 0 ? { label, points: [...lines] } : undefined;
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
    /** The founders on the Founders tile: their names. */
    function founderItems(): string[] {
        // (The names alone: the rate of each founder's responsibilities is in the founder's card.)
        return founders.map((founder, position) => founder.name.trim() || "Founder " + (position + 1));
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
    const demandByOffering = engagementValue.demand;
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
                                        <NumberCell
                                            className="delivery-number delivery-person-hours"
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
                        <NumberCell
                            className="delivery-number"
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

    return { activityAdd, activityResources, categoryActivityList, categoryInfo, completedActivities, deliveryCard, deliverySection, foldingGroup, founderItems, groupSlots, offeringAdd, partnerAddIn, performerCosts, performerFields, planStartDay, tileSection };

}
