/**
 * Split out of FinancialSustainabilityEditor.tsx (2026-11-11, the folder report's item 6): parts of FinancialSustainabilityEditor drawn from the values it hands them
 * (each part's context); FinancialSustainabilityEditor keeps a function of the same name that hands them over, so nothing else changed.
 */
import NumberCell from "../../controls/NumberCell.tsx";
import { type LegalEntityValue } from "../../../framework/engine/AnswerUtils.ts";
import { PAYMENT_TIMINGS, REVENUE_DEVELOPMENTS, REVENUE_CHARGES, REVENUE_UNITS, createDetailedVolume, formatUnits, isRecurringRevenue, planMonthLabel, whatItWouldTake, type FinancialSustainabilityValue, type RevenueStreamValue, type StreamAnalysis, allFunding, hasLoans } from "../../../framework/engine/FinancialModel.ts";
import { deliveryAllocation, demandResult } from "../../../framework/engine/DemandCapacity.ts";
import { BusinessAddButton, BusinessCard, BusinessEmpty, BusinessField, OptionalNote, BusinessRemove } from "../cards/BusinessCardFields.tsx";
import { CAPACITY_UTILISATION_HELP, CashTimelineChart, FigureTable, FigureTiles, FinancialBlock, PlanMonthField, SignalList, type TimelineMarker } from "./FinancialParts.tsx";
import { summaryText } from "../cards/cardSummary.ts";
import InfoNote, { type InfoPoint, InfoText } from "../fields/InfoNote.tsx";
import MonthYearPicker from "../fields/MonthYearPicker.tsx";
import { NUMBER_LIMITS, type NumberLimit, limitedNumberText } from "../fields/numberInput.ts";
import { type OpenPage } from "../tiles/jumpTo.ts";
import TextLink from "../fields/TextLink.tsx";
import { BREAK_EVEN_REVENUE_FORMULA, BREAK_EVEN_REVENUE_SECOND_SOURCE, BREAK_EVEN_SOURCE, BREAK_EVEN_UNITS_FORMULA, EXPECTED_BREAK_EVEN_HELP, EXPECTED_REVENUE_HELP, ORDERS_HELP, STATUS_TITLES, STREAM_HELP, TAKE_INFO } from "./financialSustainabilityTexts.ts";

export type StreamCardContext = {
    demand: Record<string, import("C:/Projects/NorthStardustStudio/src/framework/engine/DemandCapacity").DemandValue>;
    capability: import("C:/Projects/NorthStardustStudio/src/framework/engine/AnswerBusinessCapability").BusinessCapabilityValue;
    result: import("C:/Projects/NorthStardustStudio/src/framework/engine/FinancialModel").SustainabilityResult;
    unitName: (stream: RevenueStreamValue) => string;
    offeringName: (stream: RevenueStreamValue) => string;
    folds: import("C:/Projects/NorthStardustStudio/src/components/interview/fields/useItemFolds").ItemFolds;
    disabled: boolean;
    summaryPrice: (stream: RevenueStreamValue) => string;
    onChange: (value: FinancialSustainabilityValue) => void;
    page: FinancialSustainabilityValue;
    groupHead: (title: string, info?: InfoPoint[]) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
    listPicker: (label: string, ariaLabel: string, options: readonly string[], current: string, onNext: (next: string) => void, placeholder: string, info?: InfoPoint[], inline?: boolean) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
    changeStream: (id: string, patch: Partial<RevenueStreamValue>) => void;
    moneyInput: (label: string, ariaLabel: string, current: string, onNext: (next: string) => void, placeholder?: string, info?: InfoPoint[]) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
    textInput: (label: string, ariaLabel: string, current: string, onNext: (next: string) => void, placeholder?: string, info?: InfoPoint[], inline?: boolean, limits?: NumberLimit) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
    capitalized: (word: string) => string;
    plural: (word: string, count: number) => string;
    onOpenEngagement: OpenPage | undefined;
    demandPath: (offeringId: string) => string[];
    start: import("C:/Projects/NorthStardustStudio/src/framework/engine/AnswerStrategy").StrategyMonthValue;
    months: number;
    format: (amount: number) => string;
};

export function streamCardPart(ctx: StreamCardContext, entry: { stream: RevenueStreamValue; orphan: boolean }, index: number) {
const { demand, capability, result, unitName, offeringName, folds, disabled, summaryPrice, onChange, page, groupHead, listPicker, changeStream, moneyInput, textInput, capitalized, plural, onOpenEngagement, demandPath, start, months, format } = ctx;

    const { stream, orphan } = entry;
    const fromDemand = demandResult(demand[stream.offeringId]);
    const allocation = deliveryAllocation(capability.delivery[stream.offeringId]);
    const founderIds = new Set(capability.founders.map(founder => founder.id));
    const founderEffort = Object.entries(allocation)
        .filter(([personId]) => personId === "" || founderIds.has(personId))
        .reduce((sum, [, hours]) => sum + hours, 0);
    const externalEffort = Object.entries(allocation)
        .filter(([personId]) => personId !== "" && !founderIds.has(personId))
        .reduce((sum, [, hours]) => sum + hours, 0);
    const analysis = result.streams.find(item => item.stream.id === stream.id);
    const what = "Revenue Stream " + (index + 1);
    const unit = unitName(stream);
    const perOrder = result.inputs.perOrderByOffering[stream.offeringId] ?? 0;
    const recurring = isRecurringRevenue(stream.frequency);
    const splitPayment = stream.paymentTiming === "split" || stream.paymentTiming === "milestone";
    const delayedPayment = splitPayment || stream.paymentTiming === "completion";

    return (
        <BusinessCard
            key={stream.id}
            kind="Revenue Stream"
            number={index + 1}
            name={orphan ? "Offering removed from the Foundation page" : offeringName(stream)}
            open={folds.isOpen(stream.id)}
            onToggle={() => folds.toggle(stream.id)}
            disabled={disabled}
            anchor={"stream-" + stream.offeringId}
            summary={summaryText(
                summaryPrice(stream),
                REVENUE_CHARGES.find(item => item.id === stream.frequency)?.label ?? stream.frequency
            )}
            actions={orphan && (
                <BusinessRemove
                    what={what}
                    disabled={disabled}
                    onRemove={() => onChange({ ...page, streams: page.streams.filter(item => item.id !== stream.id) })}
                />
            )}
        >

            {/* FOUR SHORT GROUPS, each under its own heading: what
                it costs the customer, how much sells, when the money
                arrives, and (only where it applies) orders. Every
                group shares four columns, labels above, so they line up. */}
            <section className="financial-stream-group">
            {groupHead("Price", STREAM_HELP.price)}
            <div className="financial-inline-grid financial-stream-grid">

                {listPicker("Charged", what + " charged", REVENUE_CHARGES.map(item => item.label),
                    REVENUE_CHARGES.find(item => item.id === stream.frequency)?.label ?? "",
                    (next) => changeStream(stream.id, {
                        frequency: REVENUE_CHARGES.find(item => item.label === next)?.id ?? ""
                    }),
                    "Select",
                    [
                        "Per sale: paid once for each unit sold (a product, a session, an hour).",
                        "Per project: paid once for each project or contract.",
                        "Monthly, quarterly or annually: paid every period by each client subscribed or on a retainer.",
                        "Use Monthly, Quarterly or Annually when customers buy every month under Demand & Conversion on Customer Engagement."
                    ],
                    true)}

                {moneyInput("Price", what + " price", stream.price,
                    (next) => changeStream(stream.id, { price: next }), "0")}
                {listPicker("Per", what + " unit", REVENUE_UNITS, stream.unit,
                    (next) => changeStream(stream.id, { unit: next }), "Unit", undefined, true)}

                {stream.unit === "Other" && textInput("Unit Name", what + " unit, named", stream.unitOther,
                    (next) => changeStream(stream.id, { unitOther: next }), undefined, undefined, true)}

            </div>

            {/* How customers buy is said once, on Customer
                Engagement; a charge that disagrees counts the
                expected sales as the wrong thing. */}
            {(demand[stream.offeringId]?.sources.length ?? 0) > 0 && stream.frequency !== "" &&
                demand[stream.offeringId].recurring !== recurring && (
                <p className="financial-muted financial-mismatch" role="note">
                    {recurring
                        ? "On Customer Engagement, customers buy this Offering one sale at a time, but it is charged every period here: its expected sales would be counted as active clients. Charge it per sale or per project, or change how customers buy."
                        : "On Customer Engagement, customers buy this Offering every month, but it is charged once here: its active clients would be counted as sales a month. Charge it Monthly, Quarterly or Annually, or change how customers buy."}
                </p>
            )}
            </section>

            <section className="financial-stream-group">
            {groupHead("Sales Volume", STREAM_HELP.volume)}
            <div className="financial-inline-grid financial-stream-grid">

                {fromDemand.expected !== null
                    ? (
                        /* Taken from Demand & Conversion: shown, and
                           changed there, never entered twice. */
                        <BusinessField
                            label={recurring ? "Active " + capitalized(plural(unit, 2)) : "Expected Sales"}
                            info={["From this Offering's Demand & Conversion on Customer Engagement: " + fromDemand.working]}
                            inline
                        >
                            <span className="financial-derived">
                                <strong className="business-demand-pill">{formatUnits(fromDemand.expected)}</strong>
                                {recurring ? "" : " a month"}
                                {onOpenEngagement && (
                                    <TextLink
                                        type="button"
                                        className="business-engagement-link financial-cost-link"
                                        onClick={() => onOpenEngagement(demandPath(stream.offeringId))}
                                    >
                                        from Demand & Conversion
                                    </TextLink>
                                )}
                            </span>
                        </BusinessField>
                    )
                    : textInput(
                        recurring ? "Active " + capitalized(plural(unit, 2)) : "Expected Sales",
                        what + " expected volume", stream.volume,
                        (next) => changeStream(stream.id, { volume: next }),
                        "a month",
                        [
                            recurring
                                ? "How many " + plural(unit, 2) + " are paying at the normal operating level. The price is spread evenly over the months it covers."
                                : "How many " + plural(unit, 2) + " are sold in a month at the normal operating level.",
                            "To work it out from where customers come from (referrals, a sales funnel, repeat customers and more), fill in Demand & Conversion for this Offering on Customer Engagement: it then fills this in."
                        ],
                        true,
                        NUMBER_LIMITS.volume
                    )}
                {listPicker("Build-up", what + " revenue development",
                    REVENUE_DEVELOPMENTS.map(item => item.label),
                    REVENUE_DEVELOPMENTS.find(item => item.id === stream.development)?.label ?? "",
                    (next) => changeStream(stream.id, {
                        development: REVENUE_DEVELOPMENTS.find(item => item.label === next)?.id ?? "steady"
                    }),
                    "Select",
                    REVENUE_DEVELOPMENTS.map(item => ({ title: item.label, text: item.explanation })),
                    true)}

                {stream.development === "gradual" && (
                    <>
                        {textInput("First Month", what + " first month volume", stream.initialVolume,
                            (next) => changeStream(stream.id, { initialVolume: next }), "e.g. 1",
                            ["How many " + plural(unit, 2) + " in the month revenue begins."], true, NUMBER_LIMITS.volume)}
                        {textInput("Months to Normal", what + " months to reach normal", stream.rampMonths,
                            (next) => changeStream(stream.id, { rampMonths: next }), "e.g. 6",
                            ["How many months it takes to grow evenly to the normal level."], true, NUMBER_LIMITS.months)}
                    </>
                )}

                {fromDemand.monthsToNormal !== null && (
                    <p className="financial-muted financial-inline-note">
                        Demand & Conversion suggests about {fromDemand.monthsToNormal} months to reach nine tenths of it.
                    </p>
                )}

            </div>
            {stream.development === "detailed" && (
                <BusinessField label="Volume from Each Month">
                    <div className="financial-schedule">
                        {stream.detailed.map((item, position) => (
                            <div className="financial-schedule-row" key={item.id}>
                                <MonthYearPicker
                                    hideLabel
                                    label={what + " volume change " + (position + 1) + " month"}
                                    value={item.month}
                                    disabled={disabled}
                                    firstYear={Number(start.year)}
                                    isAllowed={() => true}
                                    onChange={(next) => changeStream(stream.id, {
                                        detailed: stream.detailed.map(other => other.id === item.id ? { ...other, month: next } : other)
                                    })}
                                />
                                <NumberCell
                                    aria-label={what + " volume change " + (position + 1) + " volume"}
                                    placeholder={plural(unit, 2) + " per month"}
                                    disabled={disabled}
                                    value={item.volume}
                                    onChange={(event) => changeStream(stream.id, {
                                        detailed: stream.detailed.map(other => other.id === item.id
                                            ? { ...other, volume: limitedNumberText(event.target.value, item.volume, NUMBER_LIMITS.volume) } : other)
                                    })}
                                />
                                <BusinessRemove
                                    cell
                                    what={what + " volume change " + (position + 1)}
                                    disabled={disabled}
                                    onRemove={() => changeStream(stream.id, {
                                        detailed: stream.detailed.filter(other => other.id !== item.id)
                                    })}
                                />
                            </div>
                        ))}
                        <BusinessAddButton
                            label="Month"
                            disabled={disabled}
                            onAdd={() => changeStream(stream.id, { detailed: [...stream.detailed, createDetailedVolume()] })}
                        />
                        <span className="financial-muted">Each volume holds until the next month listed.</span>
                    </div>
                </BusinessField>
            )}

            </section>

            {/* When the money arrives, and its orders: side by side on
                one band while payment takes two fields and orders apply,
                each group in two of the four columns, so every field
                stays on the grid above; otherwise, or where the grid is
                narrower, one under the other (conversation.css). */}
            <div className={"financial-stream-band" + (perOrder > 0 && !delayedPayment ? " financial-stream-band-paired" : "")}>

            <section className="financial-stream-group">
            {groupHead("Begins and Payment", STREAM_HELP.timing)}
            <div className="financial-inline-grid financial-stream-grid">

                <PlanMonthField
                    label="Begins"
                    value={stream.start}
                    planStart={start}
                    planMonths={months}
                    disabled={disabled || stream.development === "detailed"}
                    onChange={(next) => changeStream(stream.id, { start: next })}
                    inline
                />

                {listPicker("Customer Pays", what + " payment timing",
                    PAYMENT_TIMINGS.map(item => item.label),
                    PAYMENT_TIMINGS.find(item => item.id === stream.paymentTiming)?.label ?? "",
                    (next) => changeStream(stream.id, {
                        paymentTiming: PAYMENT_TIMINGS.find(item => item.label === next)?.id ?? ""
                    }),
                    "When earned",
                    [
                        "When the money is actually received, if not when the sale is made.",
                        { title: "Upfront", text: "Paid in full when the sale is made." },
                        { title: "On completion", text: "Paid in full the months given after the sale." },
                        { title: "Split", text: "A share when the sale is made, the rest the months given after." },
                        { title: "Milestones", text: "As Split: a share at the start, the rest the months given after, at the milestone." },
                        { title: "Other", text: "Counted when the sale is made; say how under Assumptions." }
                    ],
                    true)}

                {splitPayment && textInput("Upfront (%)", what + " percent paid at start", stream.firstPercent,
                    (next) => changeStream(stream.id, { firstPercent: next }), "e.g. 50",
                    ["The share of the price paid when the sale is made; the rest arrives the months after given beside it."],
                    true, NUMBER_LIMITS.percent)}
                {delayedPayment && textInput(
                    stream.paymentTiming === "completion" ? "Paid After" : "Rest After",
                    what + " payment delay", stream.paymentDelay,
                    (next) => changeStream(stream.id, { paymentDelay: next }), "months",
                    ["Months after the sale."], true, NUMBER_LIMITS.months)}

            </div>
            </section>

            {/* Asked only when this Offering has a cost per order, such as delivery. */}
            {perOrder > 0 && (
                <section className="financial-stream-group">
                {groupHead("Orders & Delivery", ORDERS_HELP)}
                <div className="financial-inline-grid financial-stream-grid">
                        {textInput(
                            "Items per Order",
                            what + " items per order",
                            stream.itemsPerOrder,
                            (next) => changeStream(stream.id, { itemsPerOrder: next }),
                            "1",
                            ["How many " + plural(unit, 2) + " an average order holds. A cost per order, " + format(perOrder) +
                                " here, is shared by them."],
                            true,
                            NUMBER_LIMITS.itemsPerOrder
                        )}
                        {moneyInput(
                            "Delivery Charge",
                            what + " delivery charged per order",
                            stream.deliveryCharge,
                            (next) => changeStream(stream.id, { deliveryCharge: next }),
                            "0 if free",
                            ["What the customer pays towards delivery, per order. It is counted as revenue, shared by the " + plural(unit, 2) + " in the order."]
                        )}
                </div>
                </section>
            )}

            </div>

            {analysis && analysis.price !== null && (
                <p className="financial-stream-result">
                    <span>At the normal level: <strong>{format(analysis.revenue)} a month</strong></span>
                    <span>Left from each {unit} after its costs: <strong>{format(analysis.contribution ?? 0)}</strong></span>
                    {founderEffort + externalEffort > 0 && (
                        <span>
                            Delivery: <strong>about {formatUnits(Math.round(analysis.volume * founderEffort))} founders' hours a month</strong>
                            {externalEffort > 0 && <> and about {formatUnits(Math.round(analysis.volume * externalEffort))} external</>}
                        </span>
                    )}
                </p>
            )}

            <OptionalNote
                label="Assumptions"
                ariaLabel={what + " assumptions"}
                disabled={disabled}
                value={stream.description}
                onChange={(next) => changeStream(stream.id, { description: next })}
            />

        </BusinessCard>
    );

}

export type CapacityBlockContext = {
    onOpenCapability: OpenPage | undefined;
    capacity: import("C:/Projects/NorthStardustStudio/src/framework/engine/DemandCapacity").CapacityCheck | null;
    start: import("C:/Projects/NorthStardustStudio/src/framework/engine/AnswerStrategy").StrategyMonthValue;
    offerings: { id: string; label: string; }[];
};

/**
 * Expected sales against the founders' capacity: the organization's
 * controlled delivery hours. Recurring work (subscriptions,
 * retainers) uses each founder's hours first; what remains is the
 * flexible capacity for the other Offerings. Hours from external
 * professionals are shown apart, as what is delivered outside it.
 * A shortfall is reported as a need for capacity, never as an
 * error, and the sales forecast is left as it is.
 */
export function capacityBlockPart(ctx: CapacityBlockContext) {
const { onOpenCapability, capacity, start, offerings } = ctx;

    const toDelivery = onOpenCapability && (
        <TextLink
            type="button"
            className="business-engagement-link financial-cost-link"
            onClick={() => onOpenCapability(["section-offering-delivery", "capability-offering-capability"])}
        >
            Delivery on Infrastructure & Capability
        </TextLink>
    );

    const info = [
        "Capacity is the founders' delivery hours a month: the time the organisation controls.",
        "Needed: each month's expected sales times each founder's Working Hours per Unit (4. Delivery, on Infrastructure & Capability).",
        "Recurring work (subscriptions, retainers) is served first; what remains is flexible capacity for the other Offerings.",
        "External professionals' hours are delivered outside this capacity; their cost is part of the Offering's costs.",
        "A shortfall does not change the sales forecast: it says more capacity may be needed."
    ];

    if (!capacity) {
        return (
            <FinancialBlock title="Can the Expected Sales Be Delivered?" info={info}>
                <p className="financial-muted">
                    To check, add each founder's delivery hours on the Founder cards, and the hours one unit of each
                    Offering takes, by person, under {toDelivery ?? "Delivery on Infrastructure & Capability"}.
                </p>
            </FinancialBlock>
        );
    }

    const hours = (amount: number) => formatUnits(Math.round(amount)) + " h";
    const month = (index: number) => planMonthLabel(start, index + 1);
    const short = capacity.firstShortfall;
    const nameOf = (id: string) => offerings.find(offering => offering.id === id)?.label ?? "an Offering";

    return (
        <FinancialBlock title="Can the Expected Sales Be Delivered?" info={info}>

            <div className="financial-table-scroll">
                <FigureTable className="financial-capacity-table">
                    <thead>
                        <tr>
                            <th scope="col">Founder</th>
                            <th scope="col">Delivery Hours</th>
                            <th scope="col">Recurring Work</th>
                            <th scope="col">Remaining</th>
                            <th scope="col">Other Offerings</th>
                            <th scope="col">Busiest Month</th>
                        </tr>
                    </thead>
                    <tbody>
                        {capacity.founders.map(founder => {
                            // At the founder's busiest month.
                            const recurring = founder.recurring[founder.peakIndex] ?? 0;
                            const other = founder.other[founder.peakIndex] ?? 0;
                            const over = founder.firstShortfall !== null;
                            return (
                                <tr key={founder.id} className={over ? "financial-capacity-over" : undefined}>
                                    <th scope="row">{founder.name}</th>
                                    <td>{hours(founder.available)}</td>
                                    <td>{hours(recurring)}</td>
                                    <td>{hours(founder.available - recurring)}</td>
                                    <td>{hours(other)}</td>
                                    <td>{month(founder.peakIndex)}{over ? ": short" : ""}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </FigureTable>
            </div>

            <p className={"financial-capacity-verdict" + (short !== null ? " financial-capacity-short" : "")}>
                {short !== null
                    ? <>From <strong>{month(short)}</strong>, the expected sales need more founders' hours than are available.
                        More delivery capacity may be needed: more founder hours, an external professional for part of the work, or a hire.
                        The sales forecast is not changed.</>
                    : <>The expected sales fit the founders' capacity: at the busiest ({month(capacity.peakIndex)}), about {hours(capacity.peak)} of {hours(capacity.available)} a month
                        {" "}
                        {/* Glued: "(80%)", its "i" and the full stop
                            never part (see InfoText). */}
                        <InfoText text={"(" + Math.round(capacity.peak / Math.max(1, capacity.available) * 100) + "%)"}>
                            <InfoNote label="Capacity used" points={CAPACITY_UTILISATION_HELP} />.
                        </InfoText></>}
            </p>

            {capacity.external.length > 0 && (
                <p className="financial-muted">
                    Delivered outside the founders' capacity: {capacity.external
                        .map(entry => entry.name + " about " + hours(entry.peak) + " a month at the busiest").join("; ")}.
                    Their cost is part of the Offering's costs.
                </p>
            )}
            {capacity.unassigned.some(amount => amount > 0.05) && (
                <p className="financial-muted">
                    Some working hours are recorded without saying who works them: they are counted against the founders together.
                    {toDelivery && <> Split it by person under {toDelivery}.</>}
                </p>
            )}
            {capacity.unmeasured.length > 0 && (
                <p className="financial-muted">
                    Not counted, with no working hours recorded: {capacity.unmeasured.map(nameOf).join(", ")}.
                    {toDelivery && <> Add it under {toDelivery}.</>}
                </p>
            )}

        </FinancialBlock>
    );

}

export type TakeBlockContext = {
    hasRevenue: boolean;
    effective: FinancialSustainabilityValue;
    financial: import("C:/Projects/NorthStardustStudio/src/framework/engine/FinancialModel").FinancialFoundationValue;
    lines: import("C:/Projects/NorthStardustStudio/src/framework/engine/FinancialModel").CostLine[];
    legalEntity: LegalEntityValue;
    format: (amount: number) => string;
};

/**
 * WHAT IT WOULD TAKE: the smallest single change that keeps the cash
 * above zero through the plan, each on its own; or, where the plan
 * already holds, how much room it has. Worked out, never asked.
 */
export function takeBlockPart(ctx: TakeBlockContext) {
const { hasRevenue, effective, financial, lines, legalEntity, format } = ctx;

    if (!hasRevenue) {
        return (
            <FinancialBlock title="What It Would Take">
                <BusinessEmpty>
                    Once revenue is expected, this says what it would take to keep the cash above zero: more funding, higher prices, more sales, lower costs or an earlier start.
                </BusinessEmpty>
            </FinancialBlock>
        );
    }

    const take = whatItWouldTake(effective, financial, lines, legalEntity, format);
    const basis = take.sought > 0.5
        ? ", with the " + format(take.sought) + " being sought"
        : "";

    if (take.room) {
        const room = take.room;
        return (
            <FinancialBlock title="What It Would Take" info={TAKE_INFO}>
                <p className="financial-stress-verdict financial-stress-good">
                    The plan holds as it stands{basis}. It has room for any one of these:
                </p>
                <ul className="financial-take-list">
                    <li>Sales up to <strong>{room.sales}%</strong> lower{room.sales >= 100 ? " (or none at all)" : ""}</li>
                    <li>Revenue up to <strong>{room.later} month{room.later === 1 ? "" : "s"}</strong> later{room.later >= 24 ? " or more" : ""}</li>
                    <li>Costs up to <strong>{room.costs}%</strong> higher{room.costs >= 200 ? " or more" : ""}, founders' pay aside</li>
                </ul>
                <p className="financial-muted">Each on its own, with everything else as planned.</p>
            </FinancialBlock>
        );
    }

    const options: string[] = [
        format(take.shortfall) + " more funding, by " + take.shortBy,
        ...(take.prices !== null ? ["Prices " + take.prices + "% higher"] : []),
        ...(take.sales !== null ? ["Sales " + take.sales + "% higher"] : []),
        ...(take.costs !== null ? ["Costs " + take.costs + "% lower, founders' pay aside"] : []),
        ...(take.earlier !== null ? ["Revenue starting " + take.earlier + " month" + (take.earlier === 1 ? "" : "s") + " earlier"] : [])
    ];
    const out: string[] = [
        ...(take.prices === null ? ["prices (not even three times as high)"] : []),
        ...(take.sales === null ? ["sales (not even four times as many)"] : []),
        ...(take.costs === null ? ["costs (not even with every cost but founders' pay removed)"] : []),
        ...(take.earlier === null ? ["an earlier start (not within 12 months)"] : [])
    ];

    return (
        <FinancialBlock title="What It Would Take" info={TAKE_INFO}>
            <p className="financial-stress-verdict financial-stress-risk">
                To keep cash above zero through the plan{basis}, any one of these would do:
            </p>
            <ul className="financial-take-list">
                {options.map(option => <li key={option}>{option}</li>)}
            </ul>
            {out.length > 0 && (
                <p className="financial-muted">Not possible by changing {out.join(", ").replace(/, ([^,]*)$/, " or $1")} alone.</p>
            )}
            <p className="financial-muted">
                Each on its own, with everything else as planned; a mix of smaller changes can do the same.
            </p>
        </FinancialBlock>
    );

}

export type BreakEvenSectionContext = {
    result: import("C:/Projects/NorthStardustStudio/src/framework/engine/FinancialModel").SustainabilityResult;
    start: import("C:/Projects/NorthStardustStudio/src/framework/engine/AnswerStrategy").StrategyMonthValue;
    months: number;
    format: (amount: number) => string;
    onOpenFinancialFoundation: OpenPage | undefined;
    offeringName: (stream: RevenueStreamValue) => string;
    priceLabel: (stream: RevenueStreamValue) => string;
    volumeText: (stream: RevenueStreamValue, units: number, perMonth?: string) => string;
    activityList: (streams: StreamAnalysis[], scale: number) => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
    offeringCostsBlock: () => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
    financial: import("C:/Projects/NorthStardustStudio/src/framework/engine/FinancialModel").FinancialFoundationValue;
    legalEntity: LegalEntityValue;
    stressBlock: () => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
    takeBlock: () => import("C:/Projects/NorthStardustStudio/node_modules/@types/react/index").JSX.Element;
};

export function breakEvenSectionPart(ctx: BreakEvenSectionContext) {
const { result, start, months, format, onOpenFinancialFoundation, offeringName, priceLabel, volumeText, activityList, offeringCostsBlock, financial, legalEntity, stressBlock, takeBlock } = ctx;

    const inputs = result.inputs;

    /* A tile holds the date alone, on one line; which month of the
       plan it is goes beneath it, as every tile's detail does. */
    const ofPlan = (month: number) => "Month " + month + " of the plan";

    const breakEven = result.breakEvenMonth === null
        ? "Not reached"
        : result.breakEvenMonth === 1
            ? "Already above"
            : planMonthLabel(start, result.breakEvenMonth);
    const breakEvenDetail = result.breakEvenMonth === null
        ? "within the " + months + "-month plan"
        : ofPlan(result.breakEvenMonth);

    const exhaustion = result.exhaustionMonth === null
        ? "Beyond the plan"
        : planMonthLabel(start, result.exhaustionMonth);
    const exhaustionDetail = result.exhaustionMonth === null
        ? "of " + months + " months"
        : ofPlan(result.exhaustionMonth);

    // Break even with no exhaustion in sight: the buffer is at
    // least the rest of the plan.
    const bufferLabel = result.buffer !== null
        ? result.buffer + " month" + (result.buffer === 1 ? "" : "s")
        : result.breakEvenMonth !== null && result.exhaustionMonth === null
            ? months + "+ months"
            : "n/a";

    const statusTitle = STATUS_TITLES[result.status];

    const statusTone = result.status === "above" || result.status === "sustainable"
        ? "good"
        : result.status === "no-revenue" ? "neutral" : "risk";

    const markers: TimelineMarker[] = [];
    if (result.breakEvenMonth !== null) {
        markers.push({ month: result.breakEvenMonth, label: "Break even", tone: "good" });
    }
    if (result.exhaustionMonth !== null) {
        markers.push({ month: result.exhaustionMonth, label: "Funds run out", tone: "risk" });
    }

    const reachedIndex = result.breakEvenMonth ?? 0;
    const tableMonths = result.months.slice(0, Math.min(months, Math.max(6, reachedIndex + 2)));

    return (
        <div className="financial-section-body">

            <div className={"financial-headline financial-headline-" + statusTone}>
                <strong>{statusTitle}</strong>
                <span>{result.signals[0]?.text}</span>
            </div>

            <FigureTiles tiles={[
                {
                    label: "Expected Monthly Revenue",
                    value: format(result.expectedRevenue),
                    detail: "at the normal level",
                    info: EXPECTED_REVENUE_HELP
                },
                {
                    label: "Break-Even Revenue",
                    value: result.breakEvenRevenue === null ? "n/a" : format(result.breakEvenRevenue),
                    detail: "a month",
                    info: [
                        "Fixed costs divided by the contribution margin of the expected revenue mix.",
                        BREAK_EVEN_REVENUE_FORMULA,
                        BREAK_EVEN_SOURCE,
                        BREAK_EVEN_REVENUE_SECOND_SOURCE
                    ]
                },
                {
                    label: "Expected Break Even",
                    value: breakEven,
                    detail: breakEvenDetail,
                    tone: result.breakEvenMonth === null ? "risk" : "good",
                    info: EXPECTED_BREAK_EVEN_HELP
                },
                {
                    label: "Financial Exhaustion",
                    value: exhaustion,
                    detail: exhaustionDetail,
                    tone: result.exhaustionMonth !== null ? "risk" : "neutral",
                    info: [
                        "When available cash is expected to run out: funding received or confirmed on Financial Foundation, plus expected revenue as it is received.",
                        "Funding still expected or applied for is not counted until it is confirmed."
                    ]
                },
                {
                    label: "Sustainability Buffer",
                    value: bufferLabel,
                    detail: bufferLabel === "n/a"
                        ? (result.exhaustionMonth !== null ? "funds run out before break even" : "no break even in the plan")
                        : undefined,
                    info: ["Financial Exhaustion minus Break-Even Time: how much time exists between becoming sustainable and running out of resources."]
                }
            ]} />

            <FinancialBlock
                title="Costs Used"
                info={[
                    "Read from Financial Foundation, by behaviour.",
                    "Fixed: the monthly equivalent of every recurring cost, plus loan interest. Loan principal is repayment of borrowed money, kept outside the costs; one-time costs are what the funding is for.",
                    "Variable: per-unit and per-project costs linked to each Offering."
                ]}
            >
                <ul className="financial-cost-inputs">
                    {inputs.parts.length === 0
                        ? <li>No recurring costs recorded on Financial Foundation yet.</li>
                        : inputs.parts.map(part => (
                            <li key={part.label}><span>{part.label}</span><span>{format(part.amount)} / month</span></li>
                        ))}
                    <li className="financial-cost-inputs-total">
                        <span>Fixed costs</span><span>{format(inputs.fixed)} / month</span>
                    </li>
                </ul>
                {inputs.caveats.map(caveat => <p className="financial-muted" key={caveat}>Estimate: {caveat}</p>)}
                {onOpenFinancialFoundation && (
                    <TextLink type="button" className="business-engagement-link" onClick={() => onOpenFinancialFoundation(["financial-costs"])}>
                        Review the costs on Financial Foundation
                    </TextLink>
                )}
            </FinancialBlock>

            {result.streams.length > 0 && (
                <FinancialBlock title="Break-Even Point" info={[
                    "Contribution per unit = price − variable cost per unit.",
                    "Offering break even: the units this Offering alone would need to sell to cover all fixed costs.",
                    "Organisation break even: the expected revenue mix, scaled as a whole until its contribution covers the fixed costs.",
                    BREAK_EVEN_UNITS_FORMULA,
                    BREAK_EVEN_SOURCE
                ]}>
                    <div className="financial-table-scroll">
                        <FigureTable>
                            <thead>
                                <tr>
                                    <th scope="col">Offering</th>
                                    <th scope="col">Price</th>
                                    <th scope="col">Variable Cost</th>
                                    <th scope="col">Contribution</th>
                                    <th scope="col">Break Even Alone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.streams.map(entry => (
                                    <tr key={entry.stream.id}>
                                        <th scope="row">{offeringName(entry.stream)}</th>
                                        <td>{priceLabel(entry.stream)}</td>
                                        <td>{format(entry.variable)}{entry.variableOverridden ? " (entered)" : ""}</td>
                                        <td>{entry.contribution === null ? "n/a" : format(entry.contribution)}</td>
                                        <td>
                                            {entry.breakEvenAlone === null
                                                ? "n/a"
                                                : "≈ " + volumeText(entry.stream, entry.breakEvenAlone, " / month")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </FigureTable>
                    </div>
                    {result.breakEvenScale !== null && result.breakEvenRevenue !== null
                        ? (
                            <div className="financial-result">
                                <strong>Break-even revenue: {format(result.breakEvenRevenue)} / month.</strong>{" "}
                                Equivalent activity, in the expected mix:
                                {activityList(result.streams, result.breakEvenScale)}
                            </div>
                        )
                        : (
                            <p className="financial-result">
                                No break-even point: the expected revenue does not contribute anything above its variable costs.
                            </p>
                        )}
                </FinancialBlock>
            )}

            {result.streams.length > 0 && offeringCostsBlock()}

            <FinancialBlock title="Break-Even Time" info={["The first month in which expected revenue covers that month's costs: the fixed costs, and the variable costs of that month's volume."]}>
                {result.expectedRevenue <= 0
                    ? <BusinessEmpty>With no expected revenue, break even cannot be reached from revenue.</BusinessEmpty>
                    : (
                        <div className="financial-table-scroll">
                            <FigureTable>
                                <thead>
                                    <tr>
                                        <th scope="col">Month</th>
                                        <th scope="col">Expected Revenue</th>
                                        <th scope="col">Costs</th>
                                        <th scope="col">Position</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableMonths.map(month => (
                                        <tr key={month.month} className={month.month === result.breakEvenMonth ? "financial-row-highlight" : undefined}>
                                            <th scope="row">{month.label}</th>
                                            <td>{format(month.revenue)}</td>
                                            <td>{format(month.costs)}</td>
                                            <td>
                                                {month.position === "below"
                                                    ? "Below Break Even"
                                                    : month.position === "at" ? "Break Even" : "Above Break Even"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </FigureTable>
                        </div>
                    )}
            </FinancialBlock>

            <FinancialBlock
                title="Revenue-Adjusted Financial Position"
                info={[
                    "The Financial Foundation timeline with expected revenue received and variable costs paid as they are expected.",
                    "Funding runway (Financial Foundation, without revenue): " + (result.fundingRunway === null
                        ? "beyond the " + months + "-month plan."
                        : result.fundingRunway + (result.fundingRunway === 1 ? " month." : " months."))
                ]}
            >
                {result.revenueTimeline.some(month => month.inflow > 0 || month.outflow > 0 || month.balance !== 0)
                    ? (
                        <CashTimelineChart
                            timeline={result.revenueTimeline}
                            format={format}
                            markers={markers}
                            inLabel="Funding & revenue in"
                            outLabel={hasLoans(allFunding(financial, legalEntity)) ? "Costs & repayments out" : "Costs out"}
                        />
                    )
                    : <BusinessEmpty>Nothing is scheduled to come in or go out yet.</BusinessEmpty>}
            </FinancialBlock>

            {stressBlock()}

{takeBlock()}

            <FinancialBlock title="Sustainability">
                <div className="financial-table-scroll">
                    <FigureTable className="financial-summary">
                        <tbody>
                            <tr><th scope="row">Expected Monthly Revenue</th><td>{format(result.expectedRevenue)}</td></tr>
                            <tr><th scope="row">Break-Even Revenue</th><td>{result.breakEvenRevenue === null ? "n/a" : format(result.breakEvenRevenue)}</td></tr>
                            <tr>
                                <th scope="row">Break-Even Activity</th>
                                <td>{result.breakEvenScale === null ? "n/a" : activityList(result.streams, result.breakEvenScale)}</td>
                            </tr>
                            <tr><th scope="row">Expected Break Even</th><td>{breakEven}</td></tr>
                            <tr><th scope="row">Financial Exhaustion</th><td>{exhaustion}</td></tr>
                            <tr>
                                <th scope="row">Sustainability Buffer</th>
                                <td>{bufferLabel}</td>
                            </tr>
                        </tbody>
                    </FigureTable>
                </div>
                <SignalList signals={result.signals} />
                <p className="financial-muted">
                    Based on the current assumptions only. These are estimates, not guarantees or financial advice.
                </p>
            </FinancialBlock>

        </div>
    );

}
