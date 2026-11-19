/**
 * THE FIELDS OF A CARD: cost, payment plan, deposit, warranty, rate, links and the resource card.
 * One part of the Infrastructure & Capability editor (see BusinessCapabilityEditor.tsx): what it needs of the parts before it comes in as `scope`; what the parts after it need goes out.
 */
import { costIsShared } from "../../../../framework/engine/AnswerUtils.ts";
import CurrencyPicker from "../../fields/CurrencyPicker.tsx";
import TextBox from "../../../controls/TextBox.tsx";
import AddButton from "../../../controls/AddButton.tsx";
import FoldList from "../../fields/FoldList.tsx";
import NumberCell from "../../../controls/NumberCell.tsx";
import { Fragment, ReactNode, useState } from "react";
import { BUSINESS_COST_FREQUENCIES, BUSINESS_EXTRA_STATUS_IDS, PREMISES_GROUP_ID, BUSINESS_RESOURCE_STATUSES, resourceStatusIds, isSpaceOnlyGroup, buyCostOf, offeringSharesTotal, BUSINESS_PAYMENT_PLANS, type BusinessPaymentPlan, type BusinessPaymentLine, instalmentLines, paymentPlanLines, paymentPlanTotal, BUSINESS_EXTRAS, type BusinessExtraKey, type BusinessExtrasValue, servicesOfAsset, billingOf, costWithOption, optionFrequenciesOf, noteHint, slotExtraKeys, frequencyIdsOf, unitsOf, normalCostOf, isPurchaseGroup, isCostingStatus, businessQuantityText, isPartnered, BusinessCapabilityValue, BusinessStatusRow, BusinessCostValue, BusinessResourceSlotValue, businessFoundationSegments, todayIsoDate, resourceUnitCount , OFFERING_BASIS_KEY, SHARE_BASES, SHARE_BASIS_HELP, offeringFractions, offeringSharesFor, shareBasisOf } from "../../../../framework/engine/AnswerUtils.ts";
import { BusinessCard, BusinessEmpty, BusinessField, OptionalField, OptionalNote, BusinessRemove, BusinessText, BusinessTicks, uniqueChoices } from "../../cards/BusinessCardFields.tsx";
import { moneyFormatter } from "../../../../framework/engine/FinancialModel.ts";
import { parseAmount, parseDecimal } from "../../../../framework/engine/Amounts.ts";
import { randomId } from "../../../../framework/engine/Readers.ts";
import DateCellInput from "../../fields/DateCellInput.tsx";
import { NUMBER_LIMITS, limitedNumberText } from "../../fields/numberInput.ts";
import { numberStep } from "../BusinessEngagementModel.ts";
import OptionPicker from "../../fields/OptionPicker.tsx";
import { toggledIn } from "../../fields/toggledIn.ts";
import TextLink from "../../fields/TextLink.tsx";
import { Scope, WARRANTY_GROUPS } from "../BusinessCapabilityModel.ts";
import { BandSection, CardBody } from "../engagement/EngagementCard.tsx";
import type { useCapabilityState } from "./useCapabilityState.tsx";

type Earlier = ReturnType<typeof useCapabilityState>;

export function useCapabilityCardFields(earlier: Earlier) {

    const { shareWeights, activityRows, capability, cardDates, channelCategoryText, channelMade, channelTitle, costOptionRows, dateNotice, defaultRateOf, disabled, foundation, latestPaymentOf, linksOpen, offeringCategoryCells, onChange, onOpenFoundation, openPair, organisationCurrency, rentRow, resourceCategoryCells, setDateNotice, setLinksOpen, supplierRows, withDefaultRate } = earlier;

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
        // (Only what the group offers: a frequency set before its group, or kept from another group, that this group does not offer is not listed -- it moves to the group's own, or to its only one.)
        const frequencyOptions = BUSINESS_COST_FREQUENCIES.filter(entry => offered.includes(entry.id));
        if (where && cost.frequency !== "" && !offered.includes(cost.frequency) && offered.length > 0) {
            const fallback = offered[0];
            queueMicrotask(() => onNext({ ...cost, frequency: fallback, unit: fallback === "per-unit" ? (unitsOf(place, groupId)[0] ?? "unit") : "" }));
        }

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
                        <NumberCell
                            
                            aria-label={what + " price"}
                            disabled={disabled}
                            value={cost.price}
                            onChange={(event) => onNext({
                                ...cost, price: limitedNumberText(event.target.value, cost.price, NUMBER_LIMITS.money)
                            })}
                        />
                    </BusinessField>

                    <div className="business-capability-cost-currency">
                        <CurrencyPicker
                            label={what + " currency"}
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
    const [amountDraft, setAmountDraft] = useState<{ id: string; text: string } | null>(null);
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
            } else if (type === "milestones") {
                // (Milestones start as two, as Deposit & Balance does: a plan of one milestone is not a plan.)
                set({ type, count: "", lines: [blank(), blank()] });
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
        const valueRow = (line: BusinessPaymentLine, label: string, order: string, mode: "free" | "balance" | "deposit" | "instalment", edge = true, spacer = false) => {
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
                <div className={"business-capability-plan-row" + (order || spacer ? " business-capability-plan-row-numbered" : "")} key={line.id + ":values"}>
                    {order && <span className="business-capability-plan-order">{order}</span>}
                    {!order && spacer && <span aria-hidden="true" />}
                    <NumberCell
                        className="business-capability-plan-amount"
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
                    {/* The percent and its sign: the cell stands under the currency's and the instalments' box, the sign after it. */}
                    <span className="business-capability-plan-percent-cell">
                        <NumberCell
                            className="business-capability-plan-percent business-capability-years"
                            aria-label={label + " percent"}
                            placeholder="0"
                            disabled={disabled}
                            readOnly={mode === "balance"}
                            value={line.percent}
                            onChange={(event) => setPercent(limitedNumberText(event.target.value, line.percent, NUMBER_LIMITS.percent))}
                        />
                        <span className="business-capability-plan-percent-sign" aria-hidden="true">%</span>
                    </span>
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
                                <NumberCell kind="int"
                                    className="business-capability-plan-count business-capability-years"
                                    aria-label={what + " number of instalments"}
                                    title="Number of instalments, from 1 to 99"
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

                {/* MILESTONES: two rows each -- its order number and the stage, with the "+" (the first) or the x (any other) -- then its amount, percent and date, in the Instalments' columns. */}
                {plan.on && plan.type === "milestones" && plan.lines.flatMap((line, at) => {
                    const label = what + " milestone " + (at + 1);
                    return [
                        <div className="business-capability-plan-row business-capability-plan-stage business-capability-plan-row-numbered" key={line.id + ":stage"}>
                            <span className="business-capability-plan-order">{(at + 1) + "."}</span>
                            <TextBox
                                className="interview-input"
                                aria-label={label + " title"}
                                placeholder="A milestone, e.g. Prototype ready"
                                disabled={disabled}
                                value={line.title}
                                onChange={(event) => setLine(line.id, { title: event.target.value.slice(0, 80) })}
                            />
                            {at === 0
                                ? (
                                    <AddButton shape="box" small
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
                        valueRow(line, label, "", "free", true, true)
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
    function planTotalOf(price: string, quantity: string): number | null {
        const unit = parseAmount(price);
        return unit === null ? null : Math.round(unit * Math.max(1, Number(quantity) || 1) * 100) / 100;
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

        const options = BUSINESS_RESOURCE_STATUSES.filter(
            status => allowed.includes(status.id)
        );

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

                <BandSection name="type">
                <BusinessField label="Status" info={options.map(status => ({ title: status.label, text: status.explanation }))} inline={false} side>
                    {/* The picker, and beside it the "+" that adds another status row (the Team's place for its "+"). */}
                    <div className="business-capability-performers">
                        <div className="business-capability-performer">
                            {statusPicker}
                            <AddButton shape="box" small
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
                    const rowStatuses = BUSINESS_RESOURCE_STATUSES.filter(status => (BUSINESS_EXTRA_STATUS_IDS as readonly string[]).includes(status.id));
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

                </BandSection>
                <BandSection name="costs">
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
                </BandSection>

            </>
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
                    <NumberCell
                        
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
    function rateOverrideField(what: string, value: string, onNext: (next: string) => void, defaultRate = "") {
        return (
            <OptionalField label="Rate override" inline filled={value.trim() !== ""} onClear={() => onNext("")} disabled={disabled}>
                <NumberCell
                    className="business-capability-years"
                    aria-label={what + " rate override in percent"}
                    placeholder={defaultRate !== "" ? defaultRate + "%" : "%"}
                    disabled={disabled}
                    value={value}
                    onChange={(event) => onNext(limitedNumberText(event.target.value, value, NUMBER_LIMITS.percent))}
                />
            </OptionalField>
        );
    }
    /** A contract's own rate, in place of the default one (a percent). Optional. */
    function amortisationField(what: string, value: string, onNext: (next: string) => void) {
        return (
            <BusinessField label="Amortisation period" side>
                <NumberCell kind="int"
                    className="business-capability-years"
                    aria-label={what + " amortisation period in years"}
                    placeholder="Years"
                    disabled={disabled}
                    value={value}
                    onChange={(event) => onNext(event.target.value.replace(/\D/g, "").slice(0, 3))}
                />
            </BusinessField>
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
                // (A FIELD ON ONE ROW, ITS CELL AT ITS STEP: the tick and its words, the cell, the unit; layout rules section 8; owner, 2026-11-19 13:34 UTC+2.)
                <OptionalField
                    key={key}
                    label={definition.label}
                    inline
                    filled={value !== ""}
                    onClear={() => onNext(Object.fromEntries(Object.entries(extras).filter(([name]) => name !== key)) as BusinessExtrasValue)}
                    disabled={disabled}
                >
                    <div className="business-capability-deposit-row">
                        <NumberCell
                            inputMode={definition.kind === "quantity" ? "numeric" : "decimal"}
                            data-size={numberStep(definition.kind === "percent" ? NUMBER_LIMITS.percent : definition.kind === "quantity" ? { max: 9_999_999, decimals: 0 } : NUMBER_LIMITS.moneyExtra)}
                            aria-label={what + " " + definition.label.toLowerCase()}
                            disabled={disabled}
                            value={value}
                            onChange={(event) => {
                                const next = definition.kind === "quantity"
                                    ? event.target.value.replace(/\D/g, "").slice(0, 7)
                                    : limitedNumberText(event.target.value, value, definition.kind === "percent" ? NUMBER_LIMITS.percent : NUMBER_LIMITS.moneyExtra);
                                onNext({ ...extras, [key]: next });
                            }}
                        />
                        <span className="business-capability-deposit-currency">{suffix}</span>
                    </div>
                </OptionalField>
            );
        });
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
        locked = false,
        /** A generated card keeps the Offerings its connected cards serve (adding is free, removing these is not). */
        kept: readonly string[] = [],
        /** A cost that needs no share: one paid per unit or as a share of revenue -- each Offering pays it in full on what it sells --, or no cost at all (an activity).
            The ticks alone (owner, 2026-11-14 23:30: "70% of 2%, what % gives?"; 2026-11-16); the shares saved stay as they are for another frequency. */
        whole = false
    ) {
        const total = offeringSharesTotal(current, shares);
        const split = !whole && offeringChoices.length > 0 && current.length > 1;
        // HOW IS IT SHARED (owner, 2026-11-16; doc 3, R3): by the hours each Offering uses, by the revenue each brings, in equal parts, or the user's own split.
        const basis = shareBasisOf(current, shares, shareWeights);
        const own = basis === "own";
        const fractions = offeringFractions(current, shares, shareWeights);
        const percentOf = (id: string) => Math.round((fractions[id] ?? 0) * 100);
        const left = 100 - total;
        return (
            <BandSection name="offerings" title="Offerings">
            <BusinessField label="Offerings" className="business-offering-field">
                {/* The user's own split: the percent each carries, totalled first, above the numbers; what is left to share said while it is short. */}
                {split && own && (
                    <p className={"business-capability-total" + (total === 100 ? "" : " business-capability-alarm")}>
                        {total === 100 ? "Total 100%" : left > 0 ? "Total " + total + "%: " + left + "% left to share" : "Total " + total + "%: " + (-left) + "% more than the whole"}
                    </p>
                )}
                {kept.length > 0 && (
                    <p className="business-capability-total">{"Kept while a card connected to it serves them: " + kept.map(id => offeringChoices.find(choice => choice.id === id)?.label ?? "").filter(Boolean).join(", ") + "."}</p>
                )}
                {offeringChoices.length === 0
                    ? <BusinessEmpty>{empty}</BusinessEmpty>
                    : (
                        <BusinessTicks
                            name={name}
                            options={offeringChoices.map(choice => ({ id: choice.id, label: choice.label }))}
                            chosen={current}
                            disabled={disabled || locked}
                            // (The typed shares are kept: an Offering ticked starts at 0, one unticked takes its share with it.)
                            onChange={(requested) => {
                                const next = [...new Set([...requested, ...kept])];
                                onNext({ offeringIds: next, offeringShares: offeringSharesFor(next, shares) });
                            }}
                            // With several Offerings, the percent of the card each carries stands at the end of its own row, in the x's column: the user's own, typed
                            // (a whole number, two digits at most); by any other basis, the percent it comes to, as a record.
                            trailing={split ? Object.fromEntries(current.map(id => [id, own ? (
                                <NumberCell kind="int"
                                    className="business-capability-share"
                                    aria-label={name + " share of " + (offeringChoices.find(choice => choice.id === id)?.label ?? "Offering")}
                                    placeholder="%"
                                    title="Percent of this card"
                                    disabled={disabled || locked}
                                    value={shares[id] ?? ""}
                                    onChange={(event) => onNext({ offeringIds: current, offeringShares: { ...shares, [id]: event.target.value.replace(/\D/g, "").slice(0, 2) } })}
                                />
                            ) : (
                                <span className="business-capability-static-value" aria-label={name + " share of " + (offeringChoices.find(choice => choice.id === id)?.label ?? "Offering")}>{percentOf(id) + "%"}</span>
                            )])) : undefined}
                        />
                    )}
            </BusinessField>
            {split && (
                <BusinessField label="How is it shared?" info={SHARE_BASIS_HELP}>
                    <OptionPicker
                        label={name + " how it is shared"}
                        placeholder="Select"
                        options={SHARE_BASES.map(entry => entry.label)}
                        disabled={disabled || locked}
                        value={SHARE_BASES.find(entry => entry.id === basis)?.label ?? ""}
                        onChange={(next) => {
                            const chosen = SHARE_BASES.find(entry => entry.label === next)?.id ?? basis;
                            // (My own split starts from the split shown, in whole percents that total 100.)
                            const start = chosen === "own" && !own
                                ? (() => {
                                    const whole = current.map(id => percentOf(id));
                                    whole[whole.length - 1] = 100 - whole.slice(0, -1).reduce((sum, amount) => sum + amount, 0);
                                    return Object.fromEntries(current.map((id, at) => [id, String(whole[at])]));
                                })()
                                : Object.fromEntries(current.map(id => [id, shares[id] ?? "0"]));
                            onNext({ offeringIds: current, offeringShares: { ...start, [OFFERING_BASIS_KEY]: chosen } });
                        }}
                    />
                </BusinessField>
            )}
            </BandSection>
        );
    }
    /** A dividing line across the card: above its Completed row and above the links at its foot. */
    function cardRule() {
        return <div className="business-capability-card-rule" role="separator" />;
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
    /** The "Open ..." lines of a card, last in it: one is the line itself; several are a folded section named Links (collapsed, its count beside it). */
    function linksSection(id: string, links: readonly { key: string; noun: string; name: string; onOpen: () => void }[]) {
        if (links.length === 0) {
            return null;
        }
        if (links.length === 1) {
            return <BandSection name="links">{cardRule()}{cardLink(links[0].key, links[0].noun, links[0].name, links[0].onOpen)}</BandSection>;
        }
        const open = linksOpen.has(id);
        // (THE LINKS ARE A BAND OF THEIR OWN COLOUR on a card in bands (owner, 2026-11-18 23:56 UTC+2: "Links should be have a different coloured band"): BandSection
        // "links", drawn in the links' blue; on a card kept as it is, its line and the lines as before.)
        return (
            <BandSection name="links">
            {cardRule()}
            {/* The same row as a founder's Responsibilities: the fold arrow, the label, how many (the shared FoldList). */}
            <FoldList label="Links" name="Links of this card" count={links.length} open={open} onToggle={() => setLinksOpen(current => toggledIn(current, id))}>
                {links.map(link => cardLink(link.key, link.noun, link.name, link.onOpen))}
            </FoldList>
            </BandSection>
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
                // (Used as a Resource, or on its Team -- a Staff card: owner, 2026-11-16 20:22.)
                .filter(activity => activity.resources.some(entry => entry.id === slot.id) || activity.performerIds.includes(slot.id))
                .map(activity => ({ key: activity.id, noun: "Activity", name: activity.name.trim() || "Unnamed Activity", onOpen: () => openPair(activity.id, slot.id) }))
        ];
    }
    /* ---------- 1. Resources ---------- */

    /** One recorded resource, wherever it is filed. */
    /** A card of the Workspace (the Workspace category, in Infrastructure or an Offering, or a Premises card): kept exactly as it is (owner: "never change its interface again"). */
    function workspaceCard(scope: Scope, slot: BusinessResourceSlotValue, groupId: string): boolean {
        return groupId === PREMISES_GROUP_ID || slot.category === "workspace" || (scope === "infrastructure" && (capability.resources.workspace ?? []).some(subsection => subsection.slots.some(entry => entry.id === slot.id)));
    }

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

                <CardBody banded={!workspaceCard(scope, slot, groupId)}>

                <BandSection name="dates">
                {cardDates("Resource " + number, slot.startDate, slot.endDate, onSlot, false, latestPaymentOf(slot.cost.frequency, slot.paymentPlan), slot.cost.frequency === "per-project" && slot.paymentPlan.on)}
                </BandSection>

                {/* Its category and group (Infrastructure's resources): the group it is filed in and its subsection. */}
                <BandSection name="type">
                {scope === "infrastructure" && resourceCategoryCells(slot)}
                {scope === "offering" && !channelMade(scope, slot.id) && offeringCategoryCells(slot, onSlot)}
                {scope === "offering" && channelMade(scope, slot.id) && channelCategoryText(slot)}
                </BandSection>

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
                                <NumberCell
                                    
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

                <BandSection name="costs">
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
                </BandSection>

                <BandSection name="notes">
                <OptionalNote
                    label="Notes"
                    fieldId="Description / Relevant Information"
                    ariaLabel={"Resource " + number + " description"}
                    placeholder={noteHint(groupId)}
                    disabled={disabled}
                    value={slot.description}
                    onChange={(next) => onSlot({ description: next })}
                />
                </BandSection>

                {/* The links last, under the Description (the one card order). */}
                {/* (A Staff card's hours a month they can give: their own row and bar in Capacity & Delivery; doc 52, 14; owner, 2026-11-17.) */}
                <BandSection name="team">
                {scope === "offering" && slot.category === "hr" && (
                    <BusinessField label="Hours a month they can give" side>
                        <NumberCell kind="decimal"
                            data-size={numberStep(NUMBER_LIMITS.hoursMonth)}
                            aria-label={"Resource " + number + " hours a month they can give"}
                            placeholder="h"
                            disabled={disabled}
                            value={slot.hoursAvailable}
                            onChange={(event) => onSlot({ hoursAvailable: limitedNumberText(event.target.value, slot.hoursAvailable, NUMBER_LIMITS.hoursMonth) })}
                        />
                    </BusinessField>
                )}
                </BandSection>
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
                    channelMade(scope, slot.id),
                    [],
                    !costIsShared(slot.cost.frequency, isPurchaseGroup(slot.group))
                )}

                {/* THE CARDS THIS ONE LEADS TO OR IS USED BY (the resource it insures, the activities that list it): at the end of the card. */}
                {linksSection(slot.id, resourceLinks(slot))}

                </CardBody>
            </BusinessCard>
        );
    }

    return { cardRule, costFields, extrasFields, linksSection, offeringChoices, offeringsField, paymentPlanFields, planTotalOf, rateOverrideField, resourceCard };

}
