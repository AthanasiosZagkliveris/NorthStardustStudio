/**
 * THE ACTIVITY DETAILS and the Delivery section.
 * One part of the Infrastructure & Capability editor (see BusinessCapabilityEditor.tsx): what it needs of the parts before it comes in as `scope`; what the parts after it need goes out.
 */
import AddButton from "../../../controls/AddButton.tsx";
import NumberCell from "../../../controls/NumberCell.tsx";
import { Fragment, ReactNode, useEffect } from "react";
import TickField from "../../../controls/TickField.tsx";
import TextLink from "../../fields/TextLink.tsx";
import NumberedListInput from "../../fields/NumberedListInput.tsx";
import NotesField from "../../fields/NotesField.tsx";
import { writtenInNames, writtenInRows } from "../../../../framework/engine/SegmentQuestions.ts";
import { SKILLS, SKILLS_HELP, skillCover, skillGroups, skillsOf, teamNames } from "../../../../framework/engine/capability/skills.ts";
import { OPEN_EVENT, type OpenRequest } from "../../tiles/SectionTiles.tsx";
import { BUSINESS_ACTIVITY_CATEGORIES, businessFoundationSegments, equalOfferingShares, soleGroupOf, BUSINESS_PARTNER_GROUPS, resourcesStartingTooLate, cappedUnits, unitsCap, BusinessActivityValue, partnerNoun, BusinessPartnerValue, BusinessResourceSlotValue, createBusinessActivity, createBusinessPartner, createBusinessResourceSlot, resourceUnitCount } from "../../../../framework/engine/AnswerUtils.ts";
import { BusinessCard, LinkSymbol, BusinessEmpty, BusinessField, OptionalField, BusinessRemove, uniqueChoices } from "../../cards/BusinessCardFields.tsx";
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
import { DELIVERY_HELP, NEW_TEAM_CARD, TEAM_HELP, type TeamKind, formatHours, readHours, deliveryIsEmpty, FIXED_ACTIVITY_IDS, ACTIVITY_CATEGORY_ORDER, Scope, blankSlot, blankActivity, blankPartner } from "../BusinessCapabilityModel.ts";
import { offeringStartsById } from "../../../../framework/engine/EffectiveAnswers.ts";
import type { useCapabilityState } from "./useCapabilityState.tsx";
import type { useCapabilityCardFields } from "./useCapabilityCardFields.tsx";
import type { useCapabilityPeopleCards } from "./useCapabilityPeopleCards.tsx";
import { HOLD_UPS, customersPerSession, setupPerUnit } from "../../../../framework/engine/DemandCapacity.ts";
import { PLANNING_CEILING, offeringCount } from "../../../../framework/engine/DemandCapacity.ts";
import { planMonthLabel } from "../../../../framework/engine/FinancialModel.ts";
import { effectiveProfileAnswers } from "../../../../framework/engine/EffectiveAnswers.ts";
import { offeringAnswersById } from "../../../../framework/engine/EffectiveAnswers.ts";
import { LEAD_TIME_WEEKS, SENDING_WEEKS } from "../../../../framework/engine/OfferingQuestions.ts";

type Earlier = ReturnType<typeof useCapabilityState> & ReturnType<typeof useCapabilityCardFields> & ReturnType<typeof useCapabilityPeopleCards>;

export function useCapabilityActivityAndDelivery(earlier: Earlier) {

    const { capacityRamp, rampPlan, shareWeights, formatMoney, capability, collapsed, disabled, engagementValue, financialFoundation, foundation, founderChoices, founders, foundersProfile, live, offeringChoices, onChange, openPair, organisationCurrency, partnersOf, setCollapsed, setPartners, staffOf, update } = earlier;

    /* LC1, THE SKILLS THE BUSINESS STILL NEEDS (owner, 2026-11-16 20:39), as every reader sees them; the Legal Entity's Gaps and Cover are read into the answer
       once, the first time the page can write (skillsOf: Gaps as Other rows, one a sentence; Cover as the Notes). */
    const legacyGaps = foundersProfile as { teamGaps?: string; teamCover?: string } | undefined;
    const skills = skillsOf(capability, legacyGaps);
    useEffect(() => {
        // (Only where there is old text to read in: a page opened fresh is left as it is.)
        const hasLegacy = !!(legacyGaps?.teamGaps?.trim() || legacyGaps?.teamCover?.trim());
        if (!disabled && hasLegacy && live.current.skillsNeeded === undefined) {
            onChange({ ...live.current, skillsNeeded: skills.ticked, skillsOther: skills.other, skillsNotes: skills.notes });
        }
    // (Once, when the answer has no skills yet and the Legal Entity's Gaps or Cover hold text.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [capability.skillsNeeded === undefined, disabled]);
    const saveSkills = (patch: Partial<{ skillsNeeded: string[]; skillsOther: string[]; skillsNotes: string }>) => {
        const now = skillsOf(live.current, legacyGaps);
        onChange({ ...live.current, skillsNeeded: now.ticked, skillsOther: now.other, skillsNotes: now.notes, ...patch });
    };
    /** Who covers a skill, each a link to its card; with none, "Not covered yet", a link to the Activities its cover comes from. */
    const coverLine = (skillId: string) => {
        const names = teamNames(capability, Object.fromEntries(founderChoices.map(choice => [choice.id, choice.label])));
        const cover = skillCover(capability, skillId, names);
        const offeringSide = skillGroups(skillId).some(group => ["production", "marketing", "sales"].includes(group));
        return (
            <p className="delivery-muted delivery-skill-cover">
                {cover.length > 0
                    ? <>Covered by: {cover.map((entry, at) => <Fragment key={entry.id}>{at > 0 ? ", " : ""}<TextLink onClick={() => openPair(entry.id, entry.id, true)}>{entry.name}</TextLink></Fragment>)}</>
                    : <TextLink onClick={() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { anchor: offeringSide ? "section-offering-activities" : "section-infrastructure-activities" } }))}>Not covered yet</TextLink>}
            </p>
        );
    };
    /** THE SKILLS BAND of Capacity & Delivery: LC1's ticks, each ticked one's cover beside it; Other as a numbered list; one shared Notes. */
    const skillsBand = () => (
        <div className="delivery-capacity delivery-skills">
            <BusinessField label="Which skills does the business still need?" info={SKILLS_HELP}>
                <div className="radio-choice legal-entity-radio-stack" role="group" aria-label="Which skills does the business still need?">
                    {SKILLS.map(skill => {
                        const on = skills.ticked.includes(skill.id);
                        return (
                            <Fragment key={skill.id}>
                                <TickField className="business-foundation-tick" disabled={disabled} checked={on} onChange={(event) => saveSkills({ skillsNeeded: event.currentTarget.checked ? [...skills.ticked, skill.id] : skills.ticked.filter(id => id !== skill.id), ...(skill.id === "other" && !event.currentTarget.checked ? { skillsOther: [] } : {}) })}>
                                    {skill.label}
                                </TickField>
                                {on && skill.id !== "other" && coverLine(skill.id)}
                            </Fragment>
                        );
                    })}
                </div>
                {skills.ticked.includes("other") && (
                    <>
                        <NumberedListInput
                            label="Which skills does the business still need? Other"
                            items={writtenInRows(skills.other)}
                            autoFocusFirst={writtenInNames(skills.other).length === 0}
                            disabled={disabled}
                            onChange={(items) => saveSkills({ skillsOther: items })}
                        />
                        {writtenInNames(skills.other).length > 0 && coverLine("other")}
                    </>
                )}
            </BusinessField>
            <BusinessField label="Notes">
                <NotesField ariaLabel="Skills notes" disabled={disabled} value={skills.notes} onChange={(next) => saveSkills({ skillsNotes: next })} />
            </BusinessField>
        </div>
    );

    /**
     * A NEW CARD FROM AN ACTIVITY'S TEAM (owner, 2026-11-16 20:22: "+ New Card"): a blank Staff (the place's Human Resources group), Partner or Supplier card,
     * linked to the activity's Offerings, put in the Team row at once -- one write, the card and the row together -- and opened beside the activity; a card left
     * blank is taken away by its list as any new card is, and the row then names nobody.
     */
    function newTeamCard(scope: Scope, activityId: string, offeringIds: readonly string[], kind: TeamKind, rows: string[], position: number) {
        const base = live.current;
        const linked = scope === "offering" ? { offeringIds: [...offeringIds], offeringShares: equalOfferingShares([...offeringIds]) } : {};
        let id = "";
        let next: typeof base;
        if (kind === "staff") {
            const slot = { ...createBusinessResourceSlot(), ...(scope === "offering" ? { category: "hr", group: "delivery-team" } : {}), ...linked };
            id = slot.id;
            if (scope === "offering") {
                next = { ...base, offering: { ...base.offering, resources: [...base.offering.resources, slot] } };
            } else {
                const entries = base.resources.hr ?? [];
                const known = entries.some(entry => entry.id === "admin-team");
                next = { ...base, resources: { ...base.resources, hr: known ? entries.map(entry => entry.id === "admin-team" ? { ...entry, slots: [...entry.slots, slot] } : entry) : [...entries, { id: "admin-team", name: "", slots: [slot] }] } };
            }
        } else {
            const category = kind === "partner" ? "partners" : "suppliers";
            const list = kind === "partner" ? "professionals" : "providers";
            const partner = { ...createBusinessPartner("", category), group: soleGroupOf(BUSINESS_PARTNER_GROUPS[scope][category]), ...linked };
            id = partner.id;
            next = scope === "offering"
                ? { ...base, offering: { ...base.offering, [list]: [...base.offering[list], partner] } }
                : { ...base, [list]: [...base[list], partner] };
        }
        const team = rows.map((entry, at) => at === position ? id : entry);
        const patch = (activity: BusinessActivityValue) => activity.id === activityId ? { ...activity, performerIds: team } : activity;
        onChange({ ...next, activities: next.activities.map(category => ({ ...category, activities: category.activities.map(patch) })), offering: { ...next.offering, activities: next.offering.activities.map(patch) } });
        window.setTimeout(() => openPair(activityId, id), 0);
    }

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
        who: readonly { id: string; label: string; group?: string }[],
        performerIds: string[],
        onNext: (next: string[]) => void,
        /** How many people each performer is ("" is one), by performer id. */
        people: Record<string, string> = {},
        onPeople?: (next: Record<string, string>) => void,
        /** How many people a performer's card holds (its Qty); a number box shows only for a card that holds several. */
        holds: Record<string, string> = {},
        /** A partner or supplier performer's card, by its id: the link symbol beside it opens that card (a founder has none). */
        links: Record<string, { noun: string; open: () => void }> = {},
        /** "+ New … card" at the end of the Staff, Partners and Suppliers groups: the card made, put in this row, and opened (newTeamCard). */
        onNew?: (kind: TeamKind, rows: string[], position: number) => void
    ) {

        // Always one picker, even before anybody is chosen.
        const rows = performerIds.length > 0 ? performerIds : [""];

        const canAdd = rows.every(id => id.length > 0) && rows.length < who.length;
        // (The groups in their order, each headed; a "+ New … card" ends Staff, Partners and Suppliers: owner, 2026-11-16 20:42. A group with no card shows its heading
        // and its "+ New" line all the same.)
        const groups: readonly { name: string; kind?: TeamKind }[] = [{ name: "Founders" }, { name: "Staff", kind: "staff" }, { name: "Partners", kind: "partner" }, { name: "Suppliers", kind: "supplier" }];
        const teamOptions = (id: string) => {
            const options: string[] = [];
            const headings: Record<string, string> = {};
            for (const group of groups) {
                const members = who.filter(choice => (choice.group ?? "Founders") === group.name && (choice.id === id || !rows.includes(choice.id))).map(choice => choice.label);
                const lines = [...members, ...(group.kind && onNew ? [NEW_TEAM_CARD[group.kind]] : [])];
                if (lines.length > 0) {
                    headings[lines[0]] = group.name;
                    options.push(...lines);
                }
            }
            return { options, headings };
        };

        /* THE LABEL, THEN THE PICKER, on one line; the picker runs to the right edge of the name cell above (it is not limited to its
           longest option here), and at the x's own place, the x's size, stands the "+" that adds a performer (first row) or the x that takes
           this one away (every row after the first). A further performer's row repeats the picker and that place. */
        return (
            <>
            <BusinessField label="Team" info={TEAM_HELP} inline className="business-capability-performer-field">
                {who.length === 0 && !onNew
                    ? (
                        <BusinessEmpty>
                            Add a founder, staff, or a partner or supplier under 3. Partners & Suppliers.
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
                                        label={what + " team " + (position + 1)}
                                        placeholder="Select"
                                        fill="fit"
                                        options={teamOptions(id).options}
                                        headings={teamOptions(id).headings}
                                        disabled={disabled}
                                        value={who.find(choice => choice.id === id)?.label ?? ""}
                                        onChange={(next) => {
                                            const made = (Object.keys(NEW_TEAM_CARD) as TeamKind[]).find(kind => NEW_TEAM_CARD[kind] === next);
                                            if (made && onNew) {
                                                onNew(made, rows, position);
                                                return;
                                            }
                                            onNext(rows.map(
                                                (entry, at) => at === position
                                                    ? who.find(choice => choice.label === next)?.id ?? ""
                                                    : entry
                                            ));
                                        }}
                                    />

                                    {/* A performer that stands for several people (a team): how many. */}
                                    {onPeople && id !== "" && (unitsCapOf(holds[id] ?? "") ?? 1) > 1 && (
                                        <NumberCell kind="int"
                                            className="business-capability-people"
                                            aria-label={what + " team " + (position + 1) + " people"}
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
                                                what={what + " team " + (position + 1)}
                                                disabled={disabled}
                                                onRemove={() => onNext(rows.filter(
                                                    (_, at) => at !== position
                                                ))}
                                            />
                                        )
                                        : canAdd
                                            ? (
                                                <AddButton shape="box" small
                                                    aria-label={"Add to Team of " + what}
                                                    title="Add to Team"
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
    function partnerAmount(partner: { quantity: string; cost: BusinessPartnerValue["cost"] }): { amount: number; currency: string } | null {
        const price = parseAmount(partner.cost.price);
        if (price === null) {
            return null;
        }
        const factor = resourceUnitCount(partner.quantity, partner.cost.frequency) ?? 1;
        return { amount: Math.round(price * factor * 100) / 100, currency: partner.cost.currency || organisationCurrency };
    }
    /** The costs of the Staff, partners and suppliers on an activity's Team, one line each, after the last of it (a Staff card's as a partner's: owner, 2026-11-16 20:22). */
    function performerCosts(scope: Scope, activity: BusinessActivityValue) {
        const all: { id: string; name: string; quantity: string; cost: BusinessPartnerValue["cost"] }[] = [...staffOf(scope), ...partnersOf(scope, "professionals"), ...partnersOf(scope, "providers")];
        const named = activity.performerIds.map(id => all.find(partner => partner.id === id)).filter((partner): partner is (typeof all)[number] => partner !== undefined);
        if (named.length === 0) {
            return null;
        }
        return (
            <div className="business-capability-resource-costs">
                {named.map(partner => {
                    const own = partnerAmount(partner);
                    return (
                        <p className="business-capability-total business-capability-cost-line" key={partner.id}>
                            <span className="business-capability-cost-name" title={partner.name.trim() || "Unnamed card"}>{partner.name.trim() || "Unnamed card"}</span>
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
                                            // (An optional link: none is an answer too, so one resource stays a choice; owner, 2026-11-14 14:26.)
                                            keepChoice
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
     * above it, since "Minimise 1. Founders" alone does not say it
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
     * emptied (or back to its starts), so an untouched card leaves nothing behind.
     * Not stored yet, it starts from the Offering's answers on Page 1
     * (offeringStarts: Delivered from O3, Calendar Time from O15,
     * Constraints from O10), saved with the first thing written.
     */
    function startedDelivery(offeringId: string): DeliveryValue {
        const starts = offeringStartsById(businessFoundationSegments(foundation), offeringId);
        return {
            ...createDelivery(),
            ...(starts.deliveryMode ? { mode: starts.deliveryMode } : {}),
            ...(starts.duration ? { duration: starts.duration } : {})
        };
    }
    /*
        ONCE, WHERE IT HOLDS TEXT (owner, 2026-11-17; doc 52, DV12): a Delivery card's saved Constraints (DV5, retired) move into "What can hold up delivery?" as Other,
        one row a sentence. And DV1 is O3's record: a saved card whose Delivered differs from what O3 says takes O3's.
    */
    useEffect(() => {
        if (disabled) {
            return;
        }
        const segments = businessFoundationSegments(foundation);
        let changed = false;
        const delivery = { ...live.current.delivery };
        for (const [offeringId, entry] of Object.entries(delivery)) {
            let next = entry;
            if (entry.constraints.trim() !== "" && entry.holdUps.length === 0 && entry.holdUpsOther.length === 0) {
                const rows = entry.constraints.split(/(?<=[.!?])\s+|\n+/).map(text => text.trim()).filter(Boolean);
                next = { ...next, constraints: "", holdUps: ["other"], holdUpsOther: rows };
            }
            const mode = offeringStartsById(segments, offeringId).deliveryMode;
            if (mode && next.mode !== mode && !(mode === "unit" && next.mode === "")) {
                next = { ...next, mode, ...(mode === "monthly" ? { duration: "" } : {}) };
            }
            if (next !== entry) {
                delivery[offeringId] = next;
                changed = true;
            }
        }
        if (changed) {
            onChange({ ...live.current, delivery });
        }
    // (When the saved cards or the Offerings' answers change.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(capability.delivery), JSON.stringify(businessFoundationSegments(foundation).flatMap(segment => segment.offerings.map(offering => offering.id + ":" + JSON.stringify(offering.questions ?? {})))), disabled]);
    function changeDelivery(offeringId: string, patch: Partial<DeliveryValue>) {
        const started = startedDelivery(offeringId);
        const shown = capability.delivery[offeringId] ?? started;
        const next = { ...shown, ...patch };
        const delivery = { ...capability.delivery };
        if (deliveryIsEmpty(next) || JSON.stringify(next) === JSON.stringify(started)) {
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
        recurring: boolean
    ) {

        const perPerson = rows
            .map(row => ({ ...row, hours: readHours(hours[row.id]) ?? 0 }))
            .filter(row => row.hours > 0);
        if (perPerson.length === 0) {
            return null;
        }

        const delivery = capability.delivery[offeringId];
        const expected = expectedFor(offeringId);
        // (A supplier who can hold up delivery adds their lead time to the calendar time: DV13.)
        // (A sole card is the answer, as a one-option picker's record is.)
        const soleOr = <T extends { id: string; offeringIds: string[] }>(cards: T[], id: string) => cards.find(card => card.id === id) ?? (() => { const linked = cards.filter(card => card.offeringIds.includes(offeringId)); return linked.length === 1 ? linked[0] : undefined; })();
        const supplier = delivery && delivery.holdUps.includes("materials") ? soleOr(capability.offering.providers, delivery.supplierId) : undefined;
        const lead = readHours(supplier?.leadWeeks) ?? 0;
        const weeks = (readHours(delivery?.duration) ?? 0) + lead;
        const perSession = customersPerSession(delivery);

        // Hours a month for one unit or client, as the capacity counts them (deliveryAllocation: a session's hours shared, a batch's set-up spread).
        const allocation = deliveryAllocation(delivery ? { ...delivery, hours } : undefined);
        const founders = perPerson.filter(row => !row.external).reduce((sum, row) => sum + (allocation[row.id] ?? 0), 0);
        const external = perPerson.filter(row => row.external).reduce((sum, row) => sum + (allocation[row.id] ?? 0), 0);
        // (Units running at once, Little's Law: what starts a month x the weeks each takes; a session serves several customers.)
        const running = expected ? Math.max(0.1, Math.round(expected.volume / perSession * weeks / WEEKS_PER_MONTH * 10) / 10) : 0;
        const equipment = delivery && delivery.holdUps.includes("equipment") ? soleOr(capability.offering.resources, delivery.equipmentId) : undefined;
        const holds = readHours(delivery?.holdsAtOnce) ?? 0;

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
                                ...(!recurring && weeks > 0 ? ["about " + formatHours(running) + " running at once"] : []),
                                ...(!recurring && weeks > 0 && equipment && holds > 0 ? [(equipment.name.trim() || "the equipment") + " holds " + formatHours(holds)] : [])
                            ].join(" · ")}
                        </p>
                    )
                    : (
                        <p className="delivery-muted">
                            Add this Offering's expected sales under Demand & Conversion on Customer Engagement to see the hours it takes a month.
                        </p>
                    )}

                {/* (DV7 and DV8: more running at once than the equipment holds; owner, 2026-11-17.) */}
                {expected && !recurring && weeks > 0 && equipment && holds > 0 && running > holds && (
                    <p className="delivery-muted" role="note">
                        {"About " + formatHours(running) + " running at once: " + (equipment.name.trim() || "the equipment") + " holds " + formatHours(holds) + ". Plan for a longer Calendar Time, or add to " + (equipment.name.trim() || "the equipment") + "."}
                    </p>
                )}

                {/* (DV13: the supplier's lead time, added to the calendar time.) */}
                {supplier && lead > 0 && (
                    <p className="delivery-muted">
                        {(supplier.name.trim() || "The supplier's order") + " takes " + formatHours(lead) + (lead === 1 ? " week" : " weeks") + " to arrive: order " + formatHours(lead) + (lead === 1 ? " week" : " weeks") + " ahead of the busy months."}
                    </p>
                )}

            </div>
        );

    }
    function deliveryCard(offering: { id: string; label: string }, index: number) {

        const delivery = capability.delivery[offering.id] ?? startedDelivery(offering.id);

        const cardKey = "delivery-" + offering.id;

        /* WHO WORKS ON IT (owner, 2026-11-16 20:22: the Team's list): every founder, and the Offering's Staff, Partners and Suppliers linked to this Offering.
           Their hours are shown, and kept out of the founders' capacity (as a partner's always were) until capacity asks them. */
        const linkedTeam = uniqueChoices(
            [...staffOf("offering"), ...capability.offering.professionals, ...capability.offering.providers].filter(
                card => card.offeringIds.includes(offering.id)
            ),
            "Unnamed card"
        );

        const rows = [
            ...founderChoices.map(choice => ({ ...choice, external: false })),
            ...linkedTeam.map(choice => ({ ...choice, external: true }))
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
        // (DV1 IS O3'S RECORD where O3 is answered: how customers are charged says how it is delivered; owner, 2026-11-17.)
        const starts = offeringStartsById(businessFoundationSegments(foundation), offering.id);
        const recurring = starts.deliveryMode ? starts.deliveryMode === "monthly" : delivery.mode === "monthly";
        const sessions = !recurring && !!starts.sessions;
        const batches = !recurring && !!starts.batches;
        const perSession = sessions ? customersPerSession(delivery) : 1;
        const setup = batches ? setupPerUnit(delivery) : 0;

        // How customers buy it, said on Customer Engagement.
        const bought = demandByOffering[offering.id];
        const disagrees = (bought?.sources.length ?? 0) > 0 && bought.recurring !== recurring;
        const weekly = recurring && delivery.period === "week";
        const perUnit = recurring ? (weekly ? " per client a week" : " per client a month") : sessions ? " per session" : " per unit";

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
                        options={starts.deliveryMode ? [recurring ? "Every month" : "Per unit"] : ["Per unit", "Every month"]}
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

                {/* DV6, customers in one session: a class, a workshop, an event (doc 52; owner, 2026-11-17). */}
                {/* (Under its label: the label is long for the side column, where it sat off the box's centre line; layout check, 2026-11-17.) */}
                {sessions && (
                    <BusinessField label="Customers in one session" info={DELIVERY_HELP.perSession}>
                        <NumberCell kind="int"
                            className="delivery-number"
                            aria-label={offering.label + " customers in one session"}
                            placeholder="1"
                            disabled={disabled}
                            value={delivery.perSession}
                            onChange={(event) => changeDelivery(offering.id, { perSession: limitedNumberText(event.target.value, delivery.perSession, NUMBER_LIMITS.quantity) })}
                        />
                    </BusinessField>
                )}

                {/* DV9 and DV10, a batch's set-up and its units: a Product or Hybrid, not made to order. */}
                {batches && (
                    <>
                        <BusinessField label="Set-up for a batch (hours)" info={DELIVERY_HELP.batch} side>
                            <NumberCell
                                className="delivery-number"
                                aria-label={offering.label + " set-up hours for a batch"}
                                placeholder="0"
                                disabled={disabled}
                                value={delivery.batchSetup}
                                onChange={(event) => changeDelivery(offering.id, { batchSetup: limitedNumberText(event.target.value, delivery.batchSetup, NUMBER_LIMITS.unitHours) })}
                            />
                        </BusinessField>
                        <BusinessField label="Units in a batch" side>
                            <NumberCell kind="int"
                                className="delivery-number"
                                aria-label={offering.label + " units in a batch"}
                                placeholder="1"
                                disabled={disabled}
                                value={delivery.batchUnits}
                                onChange={(event) => changeDelivery(offering.id, { batchUnits: limitedNumberText(event.target.value, delivery.batchUnits, NUMBER_LIMITS.quantity) })}
                            />
                        </BusinessField>
                    </>
                )}

                <BusinessField
                    label={recurring ? "Working Hours per Client (" + (weekly ? "a week" : "a month") + "), by person" : sessions ? "Working Hours per Session, by person" : "Working Hours per Unit, by person"}
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
                                        (weekly ? " (about " + formatHours(total * WEEKS_PER_MONTH) + " h a month)" : "") +
                                        (perSession > 1 ? " · about " + formatHours(Math.round(total / perSession * 100) / 100) + " h a customer" : "") +
                                        (setup > 0 ? " · set-up adds " + formatHours(Math.round(setup * 100) / 100) + " h a unit" : "")}
                                >
                                    <InfoNote label={offering.label + " unit"} points={DELIVERY_HELP.unit} fullList />
                                </InfoText>
                            </span>
                        </p>
                    )}

                    {deliveryPace(offering.id, rows, shownHours, recurring)}

                            </div>
                        )}
                </BusinessField>

                {/* (WHEN MAKING AND SENDING TAKE LONGER THAN CUSTOMERS EXPECT (owner, 2026-11-17): the Calendar Time, a supplier's lead time and the sending (O20) against O15.) */}
                {!recurring && (() => {
                    const answers = offeringAnswersById(businessFoundationSegments(foundation), offering.id);
                    const band = LEAD_TIME_WEEKS[answers.o15?.[0] ?? ""];
                    const supplier = delivery.holdUps.includes("materials") ? capability.offering.providers.find(card => card.id === delivery.supplierId) : undefined;
                    const sending = Math.max(0, ...(answers.o20 ?? []).map(way => SENDING_WEEKS[way] ?? 0));
                    const takes = (readHours(delivery.duration) ?? 0) + (readHours(supplier?.leadWeeks) ?? 0) + sending;
                    if (!band || takes <= band.weeks || takes <= 0) {
                        return null;
                    }
                    return (
                        <p className="delivery-muted delivery-mismatch" role="note">
                            {"Customers expect it " + band.expect + ", and making and sending it takes about " + formatHours(Math.round(takes)) + (Math.round(takes) === 1 ? " week" : " weeks") + ". Keep some ready-made stock, or tell customers " + band.tell + "."}
                        </p>
                    );
                })()}
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

                {/* DV12, WHAT CAN HOLD UP DELIVERY (replaces DV5, Constraints; owner, 2026-11-17): equipment or a workspace (DV7, DV8), materials from a supplier
                    (DV13), Other. Partners' time, seasons, skills, licences and money are read elsewhere: the bars, Busy times, Skills, Registrations, Financial Position. */}
                <BusinessField label="What can hold up delivery?" info={DELIVERY_HELP.holdUps}>
                    <div className="radio-choice legal-entity-radio-stack" role="group" aria-label={offering.label + " what can hold up delivery"}>
                        {HOLD_UPS.map(option => (
                            <TickField key={option.id} className="business-foundation-tick" disabled={disabled} checked={delivery.holdUps.includes(option.id)}
                                onChange={(event) => changeDelivery(offering.id, {
                                    holdUps: event.currentTarget.checked ? [...delivery.holdUps, option.id] : delivery.holdUps.filter(id => id !== option.id),
                                    ...(event.currentTarget.checked ? {} : option.id === "equipment" ? { equipmentId: "", holdsAtOnce: "" } : option.id === "materials" ? { supplierId: "" } : { holdUpsOther: [] })
                                })}>
                                {option.label}
                            </TickField>
                        ))}
                    </div>
                </BusinessField>
                {delivery.holdUps.includes("equipment") && (() => {
                    const owned = uniqueChoices(capability.offering.resources.filter(card => card.offeringIds.includes(offering.id)), "Unnamed resource");
                    return (
                        <>
                            <BusinessField label="Which one?" info={DELIVERY_HELP.equipment} side>
                                {owned.length === 0
                                    ? <span className="delivery-muted">Add this Offering's equipment or workspace under Resources.</span>
                                    : (
                                        <OptionPicker
                                            label={offering.label + " equipment that holds up delivery"}
                                            placeholder="Select"
                                            options={owned.map(choice => choice.label)}
                                            disabled={disabled}
                                            value={owned.find(choice => choice.id === delivery.equipmentId)?.label ?? ""}
                                            onChange={(next) => changeDelivery(offering.id, { equipmentId: owned.find(choice => choice.label === next)?.id ?? "" })}
                                        />
                                    )}
                            </BusinessField>
                            <BusinessField label="How many units can it hold at once?" side>
                                <NumberCell kind="int"
                                    className="delivery-number"
                                    aria-label={offering.label + " units the equipment holds at once"}
                                    placeholder="1"
                                    disabled={disabled}
                                    value={delivery.holdsAtOnce}
                                    onChange={(event) => changeDelivery(offering.id, { holdsAtOnce: limitedNumberText(event.target.value, delivery.holdsAtOnce, NUMBER_LIMITS.quantity) })}
                                />
                            </BusinessField>
                        </>
                    );
                })()}
                {delivery.holdUps.includes("materials") && (() => {
                    const suppliers = uniqueChoices(capability.offering.providers.filter(card => card.offeringIds.includes(offering.id)), "Unnamed supplier");
                    return (
                        <BusinessField label="Which supplier?" side>
                            {suppliers.length === 0
                                ? <span className="delivery-muted">Add this Offering's supplier under Partners &amp; Suppliers.</span>
                                : (
                                    <OptionPicker
                                        label={offering.label + " supplier that holds up delivery"}
                                        placeholder="Select"
                                        options={suppliers.map(choice => choice.label)}
                                        disabled={disabled}
                                        value={suppliers.find(choice => choice.id === delivery.supplierId)?.label ?? ""}
                                        onChange={(next) => changeDelivery(offering.id, { supplierId: suppliers.find(choice => choice.label === next)?.id ?? "" })}
                                    />
                                )}
                        </BusinessField>
                    );
                })()}
                {delivery.holdUps.includes("other") && (
                    <NumberedListInput
                        label={offering.label + " what can hold up delivery, other"}
                        items={writtenInRows(delivery.holdUpsOther)}
                        autoFocusFirst={writtenInNames(delivery.holdUpsOther).length === 0}
                        disabled={disabled}
                        onChange={(items) => changeDelivery(offering.id, { holdUpsOther: items })}
                    />
                )}

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
    const FULL_MONTHS: Record<string, string> = { Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June", Jul: "July", Aug: "August", Sep: "September", Oct: "October", Nov: "November", Dec: "December" };
    /* (The planning ceiling's and the hiring lead time's "i" lines, with their sources last.) */
    const CEILING_HELP = "Above about 85%, waiting and late work grow fast. Based on: Choo, Project Production Institute (2016), after Kingman (1961).";
    const HELP_LEAD_HELP = [
        "Hiring takes about 5 weeks in the UK, then notice and training: about 8 weeks in all. A first employee also needs PAYE registration and Employers' Liability insurance.",
        "Based on: Totaljobs, Hiring Trends Index, Q4 2024 (2025); GOV.UK."
    ];
    /** A person's month as a bar: the hours used of the hours they have, with the planning ceiling marked at 85% (doc 52, 4.1). */
    function budgetBar(label: string, used: number, available: number) {
        return (
            <div
                className="delivery-budget-bar"
                role="img"
                aria-label={label + ": " + formatHours(used) + " of " + formatHours(available) + " delivery hours a month used"}
            >
                <span
                    className={"delivery-budget-fill" + (used > available ? " delivery-budget-fill-short" : "")}
                    style={{ width: Math.min(100, Math.round(used / Math.max(1, available) * 100)) + "%" }}
                />
                <span className="delivery-budget-ceiling" aria-hidden="true" style={{ left: PLANNING_CEILING * 100 + "%" }} />
            </div>
        );
    }
    /** The line under a founder's bar: above the ceiling, what a plan holds best at; at or below it, the room it leaves. */
    function useLine(label: string, used: number, available: number): string {
        const percent = Math.round(used / Math.max(1, available) * 100);
        return percent > PLANNING_CEILING * 100
            ? percent + "% of " + label + "'s delivery hours at the expected sales. A plan holds best at 85% or less: that leaves room for a busy week or a day off."
            : percent + "% of " + label + "'s hours: room for a busy week or a day off.";
    }
    /** "Your customers buy in the evenings and at weekends: plan the delivery hours for those times." -- from the Profiles' D3, for an Offering delivered live. */
    function busyLine() {
        const segments = businessFoundationSegments(foundation);
        const times = new Set<string>();
        for (const segment of segments) {
            const live = segment.offerings.some(entry => offeringStartsById(segments, entry.id).sessions);
            if (!live) {
                continue;
            }
            for (const profile of segment.profiles) {
                (effectiveProfileAnswers(profile, segment, undefined).d3 ?? []).forEach(id => { if (id === "evenings" || id === "weekends") { times.add(id); } });
            }
        }
        if (times.size === 0) {
            return null;
        }
        const words = times.size === 2 ? "in the evenings and at weekends" : times.has("evenings") ? "in the evenings" : "at weekends";
        return <p className="delivery-muted">{"Your customers buy " + words + ": plan the delivery hours for those times."}</p>;
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
                                {budgetBar(label, used, available)}
                                <p className="delivery-muted">
                                    <InfoText text={useLine(label, used, available)}>
                                        <InfoNote label="Capacity used" points={[...CAPACITY_UTILISATION_HELP, CEILING_HELP]} />
                                    </InfoText>
                                </p>
                                {/* WHAT FITS (doc 52, 4.2): above the ceiling, the last Offering in the budget gives way; the sales beyond it stay out of the forecast. */}
                                {(() => {
                                    // (The last Offering in the budget gives way first; where it cannot take all of the excess, the one before it gives way too.)
                                    let excess = used - available * PLANNING_CEILING;
                                    if (excess <= 0.05) {
                                        return null;
                                    }
                                    const giving: { name: string; fit: number; lost: number; revenue: number }[] = [];
                                    for (const item of [...items].reverse()) {
                                        const expected = expectedFor(item.id);
                                        if (excess <= 0.05 || !expected || item.hours <= 0) {
                                            continue;
                                        }
                                        const perUnit = item.hours / expected.volume;
                                        const lost = Math.min(expected.volume, Math.ceil(excess / perUnit - 0.001));
                                        excess -= lost * perUnit;
                                        giving.unshift({
                                            name: offeringChoices.find(choice => choice.id === item.id)?.label ?? "this Offering",
                                            fit: Math.max(0, Math.round((expected.volume - lost) * 10) / 10),
                                            lost,
                                            revenue: (shareWeights.revenue[item.id] ?? 0) / expected.volume * lost
                                        });
                                    }
                                    if (giving.length === 0) {
                                        return null;
                                    }
                                    const and = (parts: string[]) => parts.length < 2 ? parts.join("") : parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
                                    const revenue = giving.reduce((sum, entry) => sum + entry.revenue, 0);
                                    const money = revenue > 0 ? ", about " + formatMoney(Math.round(revenue)) : "";
                                    // (One Offering giving way: what fits and what is left; several: only what needs help, the last in the budget first; coordinator's wording.)
                                    const text = giving.length === 1
                                        ? "At 85% of " + label + "'s hours, about " + offeringCount(giving[0].fit, giving[0].name) + " a month fit. The other " + formatHours(giving[0].lost) + " a month" + money + ", need more hours or help."
                                        : "At 85% of " + label + "'s hours, " + and([...giving].reverse().map(entry => offeringCount(entry.lost, entry.name))) + " a month" + money + ", need more hours or help.";
                                    return <p className="delivery-muted">{text}</p>;
                                })()}
                                {/* WHEN TO ADD HELP (doc 52, 4.3): the month the plan passes 85%, and 8 weeks before it to start looking (5 to hire, 3 for notice and training). */}
                                {(() => {
                                    const load = capacityRamp?.founders.find(entry => entry.id === founder.id);
                                    if (!load || load.firstAboveCeiling === null) {
                                        return null;
                                    }
                                    // (Months in full: "March 2027".)
                                    const full = (label: string) => label.replace(/^[A-Z][a-z]{2}/, short => FULL_MONTHS[short] ?? short);
                                    const passes = full(planMonthLabel(rampPlan.planStart, load.firstAboveCeiling + 1));
                                    const looking = load.firstAboveCeiling - 2;
                                    const lookBy = looking >= 0 ? full(planMonthLabel(rampPlan.planStart, looking + 1)) : "";
                                    const sameYear = lookBy.slice(-4) === passes.slice(-4);
                                    return (
                                        <p className="delivery-muted">
                                            <InfoText text={label + " passes 85% in " + passes + ". " + (lookBy ? "To have help by then, start looking by " + (sameYear ? lookBy.replace(/ \d{4}$/, "") : lookBy) + "." : "To have help by then, start looking now.")}>
                                                <InfoNote label="When to add help" points={HELP_LEAD_HELP} />
                                            </InfoText>
                                        </p>
                                    );
                                })()}
                            </div>
                        );
                    })}

                    {/* PEOPLE WHO SAY THE HOURS THEY CAN GIVE (doc 52, 14): Staff, Partners and Suppliers on a Delivery card, each a row and bar of their own. */}
                    {[...staffOf("offering"), ...capability.offering.professionals, ...capability.offering.providers].map(card => {
                        const given = readHours(card.hoursAvailable) ?? 0;
                        const needed = offeringChoices.reduce((sum, choice) => {
                            const expected = expectedFor(choice.id);
                            return sum + (expected ? (deliveryAllocation(capability.delivery[choice.id])[card.id] ?? 0) * expected.volume : 0);
                        }, 0);
                        if (given <= 0 || needed <= 0) {
                            return null;
                        }
                        const name = card.name.trim() || "Unnamed card";
                        return (
                            <div className="delivery-budget" key={card.id}>
                                {budgetBar(name, needed, given)}
                                <p className="delivery-muted">{name + ": " + formatHours(Math.round(needed * 10) / 10) + " h needed a month, " + formatHours(given) + " h available."}</p>
                            </div>
                        );
                    })}

                    {/* BUSY TIMES (doc 52, 4.4): customers who buy in the evenings or at weekends, of an Offering delivered live. */}
                    {busyLine()}

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

                {skillsBand()}

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
                            cardList
                        />
                    )}

            </>
        );

    }

    return { newTeamCard, activityAdd, activityResources, categoryActivityList, categoryInfo, completedActivities, deliveryCard, deliverySection, foldingGroup, founderItems, groupSlots, offeringAdd, partnerAddIn, performerCosts, performerFields, planStartDay, tileSection };

}
