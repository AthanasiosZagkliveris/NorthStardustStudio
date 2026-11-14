/**
 * THE DEMAND AND CONVERSION of each Offering.
 * One part of BusinessEngagementEditor (see BusinessEngagementEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import NumberCell from "../../../controls/NumberCell.tsx";
import FieldLabel from "../../../controls/FieldLabel.tsx";
import { BUSINESS_CHANNEL_ALL_OFFERINGS, BusinessCustomerSegmentValue } from "../../../../framework/engine/AnswerUtils.ts";
import { DEMAND_SOURCES, DemandSource, DemandValue, createDemand, createDemandSource, demandChannelIds, demandResult } from "../../../../framework/engine/DemandCapacity.ts";
import TextLink from "../../fields/TextLink.tsx";
import { OPEN_EVENT, type OpenRequest } from "../../tiles/SectionTiles.tsx";
import { BusinessAddButton, BusinessEmpty, BusinessField, OptionalNote, BusinessRemove, BusinessTickOption } from "../../cards/BusinessCardFields.tsx";
import InfoNote, { InfoPoint, InfoText } from "../../fields/InfoNote.tsx";
import { NUMBER_LIMITS, NumberLimit, limitedNumberText, numberInputMode } from "../../fields/numberInput.ts";
import OptionPicker from "../../fields/OptionPicker.tsx";
import StrategyTextArea from "../../fields/StrategyTextArea.tsx";
import FoldArrow from "../../fields/FoldArrow.tsx";
import { DEMAND_COUNT_LIMITS, SECTIONS, DEMAND_BUY_ONCE, DEMAND_BUY_MONTHLY, DEMAND_BUYING_HELP, DEMAND_BY_FIGURE, DEMAND_BY_CALCULATION, DEMAND_CALCULATION_HELP, DEMAND_SOURCE_CHANNEL_HELP, DEMAND_ASSUMPTIONS_PLACEHOLDER, DEMAND_SOURCE_FORMULA_HELP, DEMAND_ACTIVE_CLIENTS_HELP, DEMAND_MONTHS_TO_NORMAL_HELP, capitalized, channelChoices, numberStep } from "../BusinessEngagementModel.ts";
import { offeringStartsById } from "../../../../framework/engine/EffectiveAnswers.ts";
import { demandSourceOf, demandSuggestions, funnelIsTrial, monthsToClose } from "../../../../framework/engine/JourneySuggestions.ts";
import { BusinessStep } from "../../cards/BusinessCardFields.tsx";
import { DEMAND_BLOCK_HELP } from "./shared.tsx";
import { EngagementBox, EngagementBoxes, EngagementCard, EngagementSection, useSectionFolds } from "./EngagementCard.tsx";
import { SingleColumn } from "../foundation/shared.tsx";
import type { useEngagementState } from "./useEngagementState.tsx";
import type { useEngagementChannelBoxes } from "./useEngagementChannelBoxes.tsx";
import type { useEngagementRelationships } from "./useEngagementRelationships.tsx";

type Earlier = ReturnType<typeof useEngagementState> & ReturnType<typeof useEngagementChannelBoxes> & ReturnType<typeof useEngagementRelationships>;

export function useEngagementDemand(earlier: Earlier) {

    const { channelTileId, disabled, engagement, folds, identity, onChange, openFoundationAt, segmentOf, segments, showsAll } = earlier;
    // (The folds of the floating card's sections: open until folded.)
    const sectionFold = useSectionFolds();

    /* ---------- Demand & Conversion ---------- */

    /**
     * What is recorded about how one Offering's customers come, or an
     * empty answer. Keyed by the Offering alone: an Offering belongs to
     * one Segment, so its id is enough. Not recorded yet, Customers Buy
     * starts from the Offering's O3 on Page 1 (offeringStarts), saved
     * with the first thing written here; what is recorded wins.
     */
    function demandOf(offeringId: string): DemandValue {
        // HOW ITS CUSTOMERS BUY IS THE OFFERING'S TERMS (O3; owner, 2026-11-13 16:50): a subscription, licence, pay as they go or monthly retainer is bought every
        // month until they cancel, any other term one sale at a time (offeringStarts); asked here only where the terms say neither.
        const recurring = offeringStartsById(segments, offeringId, identity).recurring;
        return { ...(engagement.demand[offeringId] ?? createDemand()), ...(recurring !== undefined ? { recurring } : {}) };
    }
    /* The whole engagement is spread, so the Segments' channels and
       relationships are carried through every demand edit. */
    function updateDemand(offeringId: string, patch: Partial<DemandValue>) {
        onChange({
            ...engagement,
            demand: {
                ...engagement.demand,
                [offeringId]: { ...demandOf(offeringId), ...patch }
            }
        });
    }
    /**
     * The Demand & Conversion group under one Offering's relationship:
     * how the Offering is bought, the sources its customers come from
     * (each with a figure, or a calculation), the Expected Sales they
     * add up to, the channels that bring them and what it rests on.
     *
     * All of it is optional. With no source, Sustainability
     * asks for the Offering's volume directly.
     */
    function demandFor(
        segment: BusinessCustomerSegmentValue,
        offeringId: string,
        offeringLabel: string,
        /** As a floating card (opened from its tile in the Demand & Conversion dialog): always open, its title with no fold arrow. */
        asCard = false,
        /**
         * THE OFFERING'S DIALOG OF CARDS (owner, 2026-11-13 16:12: "Make the offering tiles, as a dialogue card, with each Source as an individual Nested Tile"):
         * "expected", the Offering's own card -- how its customers buy, its Expected Sales, the Channels That Bring Them --; a source's id, that source's card.
         */
        part?: string
    ) {

        const demand = demandOf(offeringId);

        const result = demandResult(demand);

        /* Folded with the same arrow as the page's sections; folded,
           its head still says what it gives. Unlike the structural
           sections, this starts OPEN (`useItemFolds(true)`). */
        const foldKey = "demand-" + offeringId;
        const open = asCard || folds.isOpen(foldKey);

        /* THE CHOICES NARROWED BY THE EARLIER ANSWERS (owner, 2026-11-13 13:56: "could the Customer Source, and channel options be auto generated by the previous
           answers? Or could be narrowed down from the total list?"): From your answers, a source's Channel lists the Segment's channels that serve this Offering, and
           its Customer Source the kind its channel's customers come by (demandSourceOf: a website or social media a sales funnel, a shop or market walk-in, a
           referral channel referrals); All lists every one. What a source holds is always listed. */
        const all = showsAll(segment.id);
        const servingChannels = segmentOf(segment.id).channels.filter(channel => all || channel.offerings.includes(BUSINESS_CHANNEL_ALL_OFFERINGS) || channel.offerings.includes(offeringId));
        // (Both ways: a source's kind narrows its channels to those whose customers come so -- a sales funnel the online channels, a walk-in the places, referrals the
        // referral channels; repeat customers, contracts and other kinds any channel --, as its channel narrows its kind; owner, 2026-11-14 11:15.)
        const NARROWED_KINDS = ["funnel", "marketplace", "referrals"];
        const channelOptionsFor = (held: string, kind = ""): BusinessTickOption[] => channelChoices(
            segmentOf(segment.id).channels.filter(channel => channel.id === held || (servingChannels.includes(channel)
                && (all || !NARROWED_KINDS.includes(kind) || demandSourceOf(channel.category) === kind)))
        );

        /* A client on a subscription stays rather than buys again:
           repeat customers are offered only for one-off sales. */
        const available = DEMAND_SOURCES.filter(type =>
            !(demand.recurring && type.oneOffOnly)
        );
        // (Every channel of the Segment: the Channels That Bring Them read their names from it.)
        const channelOptions: BusinessTickOption[] = channelChoices(segmentOf(segment.id).channels);
        const channelOf = (channelId: string) => segmentOf(segment.id).channels.find(channel => channel.id === channelId);
        const availableFor = (source: DemandSource) => {
            const channel = channelOf(source.channelId);
            return all || !channel ? available : available.filter(type => type.id === source.type || type.id === demandSourceOf(channel.category));
        };

        const perMonth = demand.recurring ? " new a month" : " a month";

        /* The folded figure's "i": the one the same figure carries
           open -- the steady level of active clients for a
           subscription, or the formula of the one CALCULATED source
           the sales come from. A sum of several sources, or an
           entered figure, has no single formula to show. */
        const countedSources = demand.sources.filter(source => {
            const type = DEMAND_SOURCES.find(entry => entry.id === source.type);
            const part = result.sources.find(entry => entry.id === source.id);
            return type !== undefined &&
                !(demand.recurring && type.oneOffOnly) &&
                part?.expected !== null && part?.expected !== undefined;
        });
        const onlySource = countedSources.length === 1 ? countedSources[0] : null;
        const onlyType = onlySource
            ? DEMAND_SOURCES.find(entry => entry.id === onlySource.type)
            : undefined;
        const foldedInfo: InfoPoint[] | undefined = result.recurring
            ? DEMAND_ACTIVE_CLIENTS_HELP
            : onlySource?.calculate && onlyType && onlyType.fields.length > 0
                ? DEMAND_SOURCE_FORMULA_HELP[onlyType.id]
                : undefined;

        function changeSource(sourceId: string, patch: Partial<DemandSource>) {
            updateDemand(offeringId, {
                sources: demand.sources.map(source =>
                    source.id === sourceId ? { ...source, ...patch } : source
                )
            });
        }

        function numberField(
            label: string,
            help: string,
            ariaLabel: string,
            placeholder: string,
            value: string,
            onValue: (next: string) => void,
            limits: NumberLimit
        ) {
            return (
                <BusinessField key={label} label={label} info={[help]}>
                    <NumberCell
                        inputMode={numberInputMode(limits)}
                        className="business-demand-number"
                        data-size={numberStep(limits)}
                        aria-label={ariaLabel}
                        placeholder={placeholder}
                        disabled={disabled}
                        value={value}
                        onChange={(event) => onValue(limitedNumberText(event.target.value, value, limits))}
                    />
                </BusinessField>
            );
        }

        function sourceCard(source: DemandSource, index: number, asBox = false, own = false) {

            const type = DEMAND_SOURCES.find(entry => entry.id === source.type);
            const what = "customer source " + (index + 1) + " for " + offeringLabel;
            const calculated = source.calculate && (type?.fields.length ?? 0) > 0;
            const part = result.sources.find(entry => entry.id === source.id);
            const excluded = demand.recurring && type?.oneOffOnly === true;

            const counted = !excluded && part?.expected !== null && part?.expected !== undefined;

            /* Why a source is not counted, when it needs saying. */
            const note = excluded
                ? "Not counted: a client who buys every month keeps buying as a staying client."
                : !counted && type?.id === "repeat" && calculated
                    ? "Repeat purchases come from the customers the other sources bring: complete one of them first."
                    : "";

            /* THE SOURCE'S PIECES, laid out as the page's block lays them (a head, four columns, the basis) or, on the floating card, as a box of bands. */
            const figure = type && (
                <span className="business-demand-figure">
                    <span className={"business-demand-pill" + (counted ? "" : " business-demand-pill-pending")}>
                        {counted ? "About " + part!.expected + perMonth : "Not counted yet"}
                    </span>
                    {/* The formula behind a CALCULATED result, once it counts: an entered figure has none to show. */}
                    {counted && calculated && DEMAND_SOURCE_FORMULA_HELP[type.id] && (
                        <InfoNote
                            label={type.label + " result"}
                            points={DEMAND_SOURCE_FORMULA_HELP[type.id]}
                        />
                    )}
                </span>
            );
            // (With All only, as the adds: owner, 2026-11-14 11:51.)
            const remove = showsAll(segment.id) && (
                <BusinessRemove
                    what={capitalized(what)}
                    disabled={disabled}
                    onRemove={() => updateDemand(offeringId, {
                        sources: demand.sources.filter(other => other.id !== source.id)
                    })}
                />
            );
            const sourcePicker = (
                <BusinessField
                    key="source"
                    label="Customer Source"
                    info={availableFor(source).map(entry => ({ title: entry.label, text: entry.explanation }))}
                >
                    <OptionPicker
                        label={capitalized(what)}
                        placeholder="Select"
                        hug
                        options={availableFor(source).map(entry => entry.label)}
                        disabled={disabled}
                        value={type?.label ?? ""}
                        /* The inputs are kept when the source changes: several share keys ("buy"). */
                        onChange={(next) => changeSource(source.id, {
                            type: available.find(entry => entry.label === next)?.id ?? ""
                        })}
                    />
                </BusinessField>
            );
            // ITS CHANNEL (owner, 2026-11-12: "Fill it from the sources"): the Segment's channel its customers come through; the Offering's Channels That Bring Them are
            // read from these.
            const channelPicker = (
                <BusinessField key="channel" label="Channel" info={DEMAND_SOURCE_CHANNEL_HELP}>
                    <OptionPicker
                        label={"Channel, " + what}
                        placeholder="Select"
                        hug
                        options={channelOptionsFor(source.channelId, source.type).map(option => option.label)}
                        disabled={disabled}
                        value={channelOptions.find(option => option.id === source.channelId)?.label ?? ""}
                        // (A source with no kind yet takes the one its channel's customers come by.)
                        onChange={(next) => {
                            const channelId = channelOptionsFor(source.channelId, source.type).find(option => option.label === next)?.id ?? "";
                            const kind = channelOf(channelId) ? demandSourceOf(channelOf(channelId)!.category) : "";
                            changeSource(source.id, { channelId, ...(source.type === "" && available.some(entry => entry.id === kind) ? { type: kind } : {}) });
                        }}
                    />
                </BusinessField>
            );
            const estimatedPicker = type && type.fields.length > 0 && (
                <BusinessField key="estimated" label="Estimated" info={DEMAND_CALCULATION_HELP}>
                    <OptionPicker
                        label={"How the sales are estimated, " + what}
                        placeholder={DEMAND_BY_FIGURE}
                        hug
                        options={[DEMAND_BY_FIGURE, DEMAND_BY_CALCULATION]}
                        disabled={disabled}
                        value={source.calculate ? DEMAND_BY_CALCULATION : DEMAND_BY_FIGURE}
                        onChange={(next) => changeSource(source.id, {
                            calculate: next === DEMAND_BY_CALCULATION
                        })}
                    />
                </BusinessField>
            );
            // (THE FUNNEL'S MIDDLE STEP, a trial where a Profile compares options by a demo, trial or sample (D1): "Tried it (%)"; doc 50, section 2.5.)
            const trial = type?.id === "funnel" && funnelIsTrial(segment, identity);
            const shown = (field: (typeof DEMAND_SOURCES)[number]["fields"][number]) => trial && field.key === "qualified"
                ? { ...field, label: "Tried it (%)", help: "The share of the prospects that take the demo, trial or sample (your Profiles compare options that way)." }
                : field;
            const figures = type && !excluded && (
                calculated
                    ? type.fields.map(shown).map(field => numberField(
                        field.label,
                        field.help,
                        field.label + ", " + what,
                        field.placeholder,
                        source.inputs[field.key] ?? "",
                        (next) => changeSource(source.id, {
                            inputs: { ...source.inputs, [field.key]: next }
                        }),
                        field.kind === "percent" ? NUMBER_LIMITS.percent : DEMAND_COUNT_LIMITS[field.key] ?? NUMBER_LIMITS.volume
                    ))
                    : numberField(
                        type.id === "repeat"
                            ? "Repeat Sales / Month"
                            : demand.recurring ? "New Clients / Month" : "Sales / Month",
                        demand.recurring
                            ? "New clients expected to join from this source in a normal month."
                            : "Sales expected from this source in a normal month.",
                        "Expected" + perMonth + ", " + what,
                        "e.g. 1",
                        source.estimate,
                        (next) => changeSource(source.id, { estimate: next }),
                        NUMBER_LIMITS.volume
                    )
            );
            // (THE TIME TO BUY, read only, on the Sales funnel and Contracts sources: from "Who decides to buy?" and how they decide; doc 50, section 2.5.)
            const close = type && !excluded && (type.id === "funnel" || type.id === "contracts") ? monthsToClose(segment, identity) : null;
            const closeText = close
                ? "Sales arrive about " + (close.low === close.high ? close.low + (close.low === 1 ? " month" : " months") : close.low + " to " + close.high + " months") + " after first contact, as your buyers decide (Who decides to buy?)."
                : "";
            const noteLine = (note || closeText) && (
                <>
                    {note && <p className="business-demand-source-note">{note}</p>}
                    {closeText && <p className="business-demand-source-note business-demand-close">{closeText}</p>}
                </>
            );
            const basis = type && !excluded && (
                <BusinessField
                    label="Basis"
                    info={["What this source's figure rests on: a test, an enquiry, a promise, past sales."]}
                >
                    <StrategyTextArea
                        className="interview-input business-demand-basis"
                        ariaLabel={"Basis, " + what}
                        placeholder="e.g. 3 of 20 test messages led to a call"
                        disabled={disabled}
                        value={source.basis}
                        onChange={(next) => changeSource(source.id, { basis: next })}
                    />
                </BusinessField>
            );

            // ON THE FLOATING CARD: a box, "Source 1" its title band with its figure and its x at the end; a band for the source, how it is estimated, each figure, the basis.
            // (A SOURCE'S OWN CARD: the default card head -- its number, its kind, its figure under the name, its x -- then its bands.)
            if (own) {
                return (
                    <EngagementCard
                        key={source.id}
                        kind="Customer Source"
                        number={index + 1}
                        name={type?.label ?? ""}
                        emptyName={"Source " + (index + 1)}
                        anchor={"demand-source-" + source.id}
                        headRow={figure || undefined}
                        actions={remove}
                    >
                        <SingleColumn>
                            <EngagementBox
                                bands={[
                                    <div key="source" className="business-demand-fields">{sourcePicker}{channelPicker}</div>,
                                    (estimatedPicker || figures) && <div key="figures" className="business-demand-fields">{estimatedPicker}{figures}</div>,
                                    noteLine,
                                    basis
                                ]}
                            />
                        </SingleColumn>
                    </EngagementCard>
                );
            }
            if (asBox) {
                return (
                    <EngagementBox
                        key={source.id}
                        anchor={"demand-source-" + source.id}
                        title={"Source " + (index + 1)}
                        extra={<>{figure}{remove}</>}
                        // (Short fields side by side, each as narrow as its content -- the source and its channel; how it is estimated and its figures --, as the
                        // page's source rows; the Basis at the card's width: owner, 2026-11-13 00:27, "their cells are by far too wide".)
                        bands={[
                            <div key="source" className="business-demand-fields">{sourcePicker}{channelPicker}</div>,
                            // (How it is estimated and its figures on one row where they fit: owner, 2026-11-13 13:56, "check if more than one field could fit in the same row".)
                            (estimatedPicker || figures) && <div key="figures" className="business-demand-fields">{estimatedPicker}{figures}</div>,
                            noteLine,
                            basis
                        ]}
                    />
                );
            }

            return (
                <div className="business-demand-source" key={source.id} data-anchor={"demand-source-" + source.id}>

                    {/* THE CARD'S HEAD: which source, and what it gives. The figure and its "i" as ONE unit at the far end, 12px before the × (see .business-demand-figure). */}
                    <div className="business-demand-source-head">
                        <span className="business-demand-source-title">
                            {"Source " + (index + 1)}
                        </span>
                        {figure}
                        {remove}
                    </div>

                    {/* FOUR COLUMNS, labels above: the source and how it is estimated, then its figure or its calculation. */}
                    <div className="business-demand-fields">
                        {sourcePicker}
                        {channelPicker}
                        {estimatedPicker}
                        {figures}
                    </div>

                    {noteLine}

                    {basis}

                </div>
            );

        }

        /* THE PIECES UNDER THE SOURCES, laid out by the page's block or by the floating card. */
        // THE ROWS THE FOUNDATION PROPOSES (doc 28, 7.5): one for each Discover channel that serves this Offering, and Contracts or tenders where the buyer decides by a
        // formal tender; each added by its own Add, never written by itself. A channel's row also records the channel.
        const suggestions = (() => {
                    const proposed = demandSuggestions(segment, offeringId, segmentOf(segment.id).channels, demand);
                    return proposed.length > 0 && (
                        <>
                            <BusinessEmpty>Suggested from your Foundation: the Discover channels that serve it{proposed.some(row => row.type === "contracts") ? ", and contracts or tenders for a buyer who decides by tender" : ""}.</BusinessEmpty>
                            {proposed.map(row => {
                                const sourceLabel = DEMAND_SOURCES.find(type => type.id === row.type)?.label ?? "Other";
                                const label = row.channelId ? sourceLabel + ": " + row.label : sourceLabel;
                                return (
                                    <BusinessStep
                                        key={row.type + row.channelId}
                                        kind="add"
                                        what={label + " for " + offeringLabel}
                                        label={label}
                                        disabled={disabled}
                                        onClick={() => updateDemand(offeringId, {
                                            sources: [...demand.sources, createDemandSource(row.type, row.channelId)]
                                        })}
                                    />
                                );
                            })}
                        </>
                    );
                })();
        const addSource = (
                <BusinessAddButton
                    label="Customer Source"
                    disabled={disabled}
                    onAdd={() => updateDemand(offeringId, {
                        sources: [...demand.sources, createDemandSource()]
                    })}
                />
        );
        // HOW IT IS BOUGHT: Customers Buy -- the Offering's terms where they say it (read only, as the Foundation answered it), else asked -- and, for an Offering
        // kept until cancelled, the share cancelling a month.
        const fromTerms = offeringStartsById(segments, offeringId, identity).recurring !== undefined;
        const buyPicker = fromTerms ? (
            <span className="strategy-name-static">{demand.recurring ? DEMAND_BUY_MONTHLY : DEMAND_BUY_ONCE}</span>
        ) : (
            <OptionPicker
                label={"How customers buy " + offeringLabel}
                placeholder={DEMAND_BUY_ONCE}
                hug
                options={[DEMAND_BUY_ONCE, DEMAND_BUY_MONTHLY]}
                disabled={disabled}
                value={demand.recurring ? DEMAND_BUY_MONTHLY : DEMAND_BUY_ONCE}
                onChange={(next) => updateDemand(offeringId, {
                    recurring: next === DEMAND_BUY_MONTHLY
                })}
            />
        );
        const cancelField = demand.recurring && demand.sources.length > 0 && numberField(
            "Cancel / Month (%)",
            "The share of active clients who cancel each month. At 5%, a client stays about 20 months on average.",
            "Share of clients cancelling a month, " + offeringLabel,
            "e.g. 5",
            demand.cancel,
            (next) => updateDemand(offeringId, { cancel: next }),
            NUMBER_LIMITS.cancelPercent
        );
        const buying = (
            <div className="business-demand-fields business-demand-buying">
                <BusinessField label="Customers Buy" info={DEMAND_BUYING_HELP}>
                    {buyPicker}
                </BusinessField>
                {cancelField}
            </div>
        );
        const resultBlock = demand.sources.length > 0 && (
                <div
                    className="business-demand-result"
                    role="status"
                    aria-label={"Expected sales for " + offeringLabel}
                >
                    {result.expected === null
                        ? (
                            <p className="business-demand-result-empty">
                                {result.joining !== null
                                    ? "About " + result.joining + " new clients a month. Enter the share cancelling a month to see the active clients."
                                    : "Complete a source above to see the expected sales."}
                            </p>
                        )
                        : (
                            <>
                                <p className="business-demand-result-main">
                                    {result.recurring
                                        ? (
                                            <>
                                                <InfoText text={"Expected Sales: about " + result.expected + " active clients"}>
                                                    <InfoNote label="Active clients" points={DEMAND_ACTIVE_CLIENTS_HELP} />
                                                </InfoText>
                                                {result.monthsToNormal !== null && (
                                                    <InfoText
                                                        text={", reached in about " + result.monthsToNormal +
                                                            (result.monthsToNormal === 1 ? " month" : " months")}
                                                    >
                                                        <InfoNote label="Months to level" points={DEMAND_MONTHS_TO_NORMAL_HELP} />
                                                    </InfoText>
                                                )}
                                            </>
                                        )
                                        : "Expected Sales: about " + result.expected + " a month"}
                                </p>
                                <ul className="business-demand-working">
                                    {result.sources.filter(part => part.expected !== null).map(part => (
                                        <li key={part.id}>{part.label}: {part.working}.</li>
                                    ))}
                                    {result.recurring && result.joining !== null && (
                                        <li>
                                            {result.sources.filter(part => part.expected !== null).length > 1 ? "Together about " : "About "}{result.joining} new clients a month; with {demand.cancel}% cancelling a month, they level off at about {result.expected} active clients.
                                        </li>
                                    )}
                                </ul>
                            </>
                        )}
                </div>
            );
        const assumptions = (
            <OptionalNote
                label="Assumptions"
                info={["Anything else the figures rest on, beyond each source's basis."]}
                ariaLabel={"Demand assumptions for " + offeringLabel}
                placeholder={DEMAND_ASSUMPTIONS_PLACEHOLDER}
                disabled={disabled}
                value={demand.assumptions}
                onChange={(next) => updateDemand(offeringId, {
                    assumptions: next
                })}
            />
        );
        /*
            CHANNELS THAT BRING THEM, WORKED OUT FROM THE SOURCES (owner, 2026-11-12: "Fill it from the sources"): each source's channel, once, a link that opens it;
            read, never ticked (demandChannelIds). Where a source names no channel, a line says how it joins the list.
        */
        const broughtBy = demandChannelIds(demand).filter(id => channelOptions.some(option => option.id === id));
        const unchannelled = demand.sources.filter(source => source.type !== "" && !channelOptions.some(option => option.id === source.channelId)).length;
        const channelsBringing = (
            <>
                {broughtBy.length > 0 && (
                    <ul className="business-relationship-profile-list">
                        {broughtBy.map(id => (
                            <li key={id}>
                                <TextLink className="business-engagement-link" onClick={() => openChannel(segment, id)}>
                                    {channelOptions.find(option => option.id === id)?.label ?? ""}
                                </TextLink>
                            </li>
                        ))}
                    </ul>
                )}
                {(broughtBy.length === 0 || unchannelled > 0) && (
                    <BusinessEmpty>
                        {broughtBy.length === 0 ? "Choose each Customer Source's channel to list the channels that bring these customers here." : "Choose the channel of each Customer Source to list it here too."}
                    </BusinessEmpty>
                )}
            </>
        );

        /*
            ONE OFFERING'S DEMAND & CONVERSION AS A FLOATING CARD, IN THE DEFAULT LAYOUT (owner, 2026-11-12 18:41: "does not follow the default floated card's lay out ...
            Compare it with a Profile, Competitor or offering floated card"): the Offering card's head (its number and name, the name a link to the Foundation), how its
            customers buy under the name, as the Offering's Type; then three sections: Customer Sources (a box per source; a source is added from the Offering's tile -- a suggested one from its faded line, any other by its "+" with All),
            Expected Sales (the result, the assumptions) and Channels That Bring Them. The same fields and saved answers as the page's block.
        */
        if (asCard && part && part !== "expected") {
            const at = demand.sources.findIndex(source => source.id === part);
            return at < 0 ? null : sourceCard(demand.sources[at], at, true, true);
        }
        // EXPECTED SALES AS A SECTION OF THE OFFERING'S DIALOG (owner, 2026-11-13 16:35): a box of the dialog's own bands, as a Foundation dialog's -- its title band,
        // then how its customers buy, the share cancelling a month, the result and the Assumptions --, and the Channels That Bring Them; the sources' tiles under it.
        if (asCard && part === "expected") {
            const bands = [<BusinessField key="buy" label="Customers Buy" info={DEMAND_BUYING_HELP} inline>{buyPicker}</BusinessField>, cancelField, resultBlock, assumptions].filter(Boolean);
            return (
                <SingleColumn>
                    <EngagementBoxes>{[
                        <EngagementBox key="expected" title="Expected Sales" anchor={"demand-" + offeringId} bands={bands} />,
                        <EngagementBox key="channels" title="Channels That Bring Them" bands={[channelsBringing]} />
                    ]}</EngagementBoxes>
                </SingleColumn>
            );
        }
        if (asCard) {
            const number = segment.offerings.findIndex(offering => offering.id === offeringId) + 1;
            const whose = (segment.name.trim() || "Segment") + ", Offering " + number;
            return (
                <EngagementCard
                    kind="Offering"
                    number={number}
                    name={offeringLabel}
                    anchor={"demand-" + offeringId}
                    onOpenName={openFoundationAt ? () => openFoundationAt(offeringId) : undefined}
                    // (How its customers buy under the name, as the Offering card's Type: its label beside its dropdown.)
                    headRow={<div className="business-field-run business-field-run-compact"><BusinessField label="Customers Buy" info={DEMAND_BUYING_HELP} inline>{buyPicker}</BusinessField></div>}
                >
                    <EngagementSection title="Customer Sources" info={DEMAND_BLOCK_HELP} fold={sectionFold(offeringId + " sources", whose + " → Customer Sources")}>
                        <EngagementBoxes>{demand.sources.map((source, index) => sourceCard(source, index, true))}</EngagementBoxes>
                    </EngagementSection>
                    <EngagementSection title="Expected Sales" fold={sectionFold(offeringId + " expected", whose + " → Expected Sales")}>
                        {/* (Its bands, the tints alternating: the share cancelling a month where it applies, the result, then the Assumptions, the note band.) */}
                        {[cancelField, resultBlock].filter(Boolean).map((band, at) => <div key={at} className={"legal-entity-org-section" + (at % 2 === 1 ? " legal-entity-org-band" : "")}>{band}</div>)}
                        <div className={"legal-entity-org-section business-note-band" + ([cancelField, resultBlock].filter(Boolean).length % 2 === 1 ? " legal-entity-org-band" : "")}>{assumptions}</div>
                    </EngagementSection>
                    <EngagementSection title="Channels That Bring Them" fold={sectionFold(offeringId + " channels", whose + " → Channels That Bring Them")}>
                        <div className="legal-entity-org-section">{channelsBringing}</div>
                    </EngagementSection>
                </EngagementCard>
            );
        }

        return (
            <div
                className="business-demand"
                data-anchor={"demand-" + offeringId}
            >

                <div className="business-demand-head">
                    <div className="business-demand-title-row">
                        {!asCard && (
                            <FoldArrow
                                open={open}
                                label={"Demand & Conversion for " + offeringLabel}
                                onToggle={() => folds.toggle(foldKey)}
                            />
                        )}
                        {/* What the block is for, and where its result is
                            used: one "i" on the title rather than two
                            paragraphs around the fields. */}
                        <span className="field-group-title business-foundation-subhead business-demand-title">
                            <InfoText text={offeringLabel}>
                                <InfoNote label="Demand & Conversion" points={DEMAND_BLOCK_HELP} fullList />
                            </InfoText>
                        </span>
                        {!open && result.expected !== null && (
                            <span className="business-demand-figure">
                                <span className="business-demand-pill">
                                    {result.recurring
                                        ? "Expected Sales: about " + result.expected + " active clients"
                                        : "Expected Sales: about " + result.expected + " a month"}
                                </span>
                                {foldedInfo && (
                                    <InfoNote label="Expected Sales" points={foldedInfo} />
                                )}
                            </span>
                        )}
                    </div>
                </div>

                {open && (<>

                <div className="business-demand-sources">
                    {demand.sources.map((source, index) => sourceCard(source, index))}
                    {/* THE ROWS THE FOUNDATION PROPOSES (doc 28, 7.5): one for each Discover channel that serves this Offering, and Contracts or tenders where the
                        buyer decides by a formal tender; each added by its own Add, never written by itself. A channel's row also records the channel. */}
                    {suggestions}
                    {addSource}
                </div>

                {buying}

                {resultBlock}

                {assumptions}

                <div className="business-demand-channels">
                    <FieldLabel className="business-foundation-label">
                        Channels That Bring Them
                    </FieldLabel>
                    {channelsBringing}
                </div>

                </>)}

            </div>
        );

    }
    /* ---------- The page ---------- */

    /**
     * The two section headings and their guidance -- the same for
     * every Segment, which is why they sit above the process line
     * and outside the input cards.
     *
     * Numbered 1 and 2 on this page, as Page 1's four subsections
     * are numbered 1 to 4: these two are worked in order -- where
     * you reach the customer, then how you keep the relationship
     * going there.
     */
    const heads = [
        {
            number: 1,
            title: "Customer Channel",
            instructions: SECTIONS.channels.instructions
        },
        {
            number: 2,
            title: "Customer Relationship",
            instructions: SECTIONS.relationships.instructions
        }
    ];

    /** A channel named in Channels That Bring Them, opened: its card, in its channel's dialog of Channels & Journey. */
    function openChannel(segment: BusinessCustomerSegmentValue, channelId: string) {
        const channels = segmentOf(segment.id).channels;
        const channel = channels.find(entry => entry.id === channelId);
        if (channel) {
            const first = channels.find(entry => entry.category === channel.category) ?? channel;
            // (Its channel's tile stands in the Channels & Journey dialog: that opens first, then the card.)
            document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: segment.id + ":channels", box: "open" } }));
            window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: channelTileId(segment.id, first.id), card: channel.id } })), 300);
        }
    }
    /** The sources the Foundation suggests for an Offering, each with its words (the faded lines of its tile in Demand & Conversion). */
    function suggestedSources(segment: BusinessCustomerSegmentValue, offeringId: string) {
        return demandSuggestions(segment, offeringId, segmentOf(segment.id).channels, demandOf(offeringId)).map(row => {
            const sourceLabel = DEMAND_SOURCES.find(type => type.id === row.type)?.label ?? "Other";
            // (Its words on a tile: the channel it comes through, or -- with none -- the kind of source, "Contracts or tenders".)
            return { ...row, words: row.channelId ? row.label : sourceLabel };
        });
    }
    /** A suggested source added from its faded line: the source, with its channel. */
    function addSuggestedSource(offeringId: string, row: { type: string; channelId: string }): string {
        const made = createDemandSource(row.type, row.channelId);
        updateDemand(offeringId, { sources: [...demandOf(offeringId).sources, made] });
        return made.id;
    }
    /** The "+" on an Offering's tile in Demand & Conversion (with All): a new Customer Source, its card then opened. */
    function addCustomerSource(offeringId: string): string {
        const made = createDemandSource();
        updateDemand(offeringId, { sources: [...demandOf(offeringId).sources, made] });
        return made.id;
    }

    return { addCustomerSource, addSuggestedSource, demandFor, heads, suggestedSources };

}
