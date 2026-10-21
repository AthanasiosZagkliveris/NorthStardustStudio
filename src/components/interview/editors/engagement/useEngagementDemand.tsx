/**
 * THE DEMAND AND CONVERSION of each Offering.
 * One part of BusinessEngagementEditor (see BusinessEngagementEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import NumberCell from "../../../controls/NumberCell.tsx";
import FieldLabel from "../../../controls/FieldLabel.tsx";
import { BusinessCustomerSegmentValue } from "../../../../framework/engine/AnswerUtils.ts";
import { DEMAND_SOURCES, DemandSource, DemandValue, createDemand, createDemandSource, demandResult } from "../../../../framework/engine/DemandCapacity.ts";
import { BusinessAddButton, BusinessEmpty, BusinessField, OptionalNote, BusinessRemove, BusinessTickOption, BusinessTicks } from "../../cards/BusinessCardFields.tsx";
import InfoNote, { InfoPoint, InfoText } from "../../fields/InfoNote.tsx";
import { NUMBER_LIMITS, NumberLimit, limitedNumberText, numberInputMode } from "../../fields/numberInput.ts";
import OptionPicker from "../../fields/OptionPicker.tsx";
import StrategyTextArea from "../../fields/StrategyTextArea.tsx";
import FoldArrow from "../../fields/FoldArrow.tsx";
import { DEMAND_COUNT_LIMITS, SECTIONS, DEMAND_BUY_ONCE, DEMAND_BUY_MONTHLY, DEMAND_BUYING_HELP, DEMAND_BY_FIGURE, DEMAND_BY_CALCULATION, DEMAND_CALCULATION_HELP, DEMAND_ASSUMPTIONS_PLACEHOLDER, DEMAND_SOURCE_FORMULA_HELP, DEMAND_ACTIVE_CLIENTS_HELP, DEMAND_MONTHS_TO_NORMAL_HELP, capitalized, channelChoices, numberStep } from "../BusinessEngagementModel.ts";
import { DEMAND_BLOCK_HELP } from "./shared.tsx";
import type { useEngagementState } from "./useEngagementState.tsx";
import type { useEngagementChannelBoxes } from "./useEngagementChannelBoxes.tsx";
import type { useEngagementRelationships } from "./useEngagementRelationships.tsx";

type Earlier = ReturnType<typeof useEngagementState> & ReturnType<typeof useEngagementChannelBoxes> & ReturnType<typeof useEngagementRelationships>;

export function useEngagementDemand(earlier: Earlier) {

    const { disabled, engagement, folds, onChange, segmentOf } = earlier;

    /* ---------- Demand & Conversion ---------- */

    /**
     * What is recorded about how one Offering's customers come, or an
     * empty answer. Keyed by the Offering alone: an Offering belongs to
     * one Segment, so its id is enough.
     */
    function demandOf(offeringId: string): DemandValue {
        return engagement.demand[offeringId] ?? createDemand();
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
        offeringLabel: string
    ) {

        const demand = demandOf(offeringId);

        const result = demandResult(demand);

        /* Folded with the same arrow as the page's sections; folded,
           its head still says what it gives. Unlike the structural
           sections, this starts CLOSED -- see useItemFolds. */
        const foldKey = "demand-" + offeringId;
        const open = folds.isOpen(foldKey);

        const channelOptions: BusinessTickOption[] = channelChoices(
            segmentOf(segment.id).channels
        );

        /* A client on a subscription stays rather than buys again:
           repeat customers are offered only for one-off sales. */
        const available = DEMAND_SOURCES.filter(type =>
            !(demand.recurring && type.oneOffOnly)
        );

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

        function sourceCard(source: DemandSource, index: number) {

            const type = DEMAND_SOURCES.find(entry => entry.id === source.type);
            const what = "customer source " + (index + 1) + " for " + offeringLabel;
            const calculated = source.calculate && (type?.fields.length ?? 0) > 0;
            const part = result.sources.find(entry => entry.id === source.id);
            const excluded = demand.recurring && type?.oneOffOnly === true;

            const counted = !excluded && part?.expected !== null && part?.expected !== undefined;

            /* Why a source is not counted, when it needs saying. */
            const note = excluded
                ? "Not counted: a client who buys every month stays rather than buying again."
                : !counted && type?.id === "repeat" && calculated
                    ? "Repeat purchases come from the customers the other sources bring: complete one of them first."
                    : "";

            return (
                <div className="business-demand-source" key={source.id} data-anchor={"demand-source-" + source.id}>

                    {/* THE CARD'S HEAD: which source, and what it gives. */}
                    <div className="business-demand-source-head">
                        <span className="business-demand-source-title">
                            {"Source " + (index + 1)}
                        </span>
                        {/* The figure and its "i" as ONE unit at the far
                            end, 12px before the × (see
                            .business-demand-figure) -- the "i" never
                            splits the space between them. */}
                        {type && (
                            <span className="business-demand-figure">
                                <span className={"business-demand-pill" + (counted ? "" : " business-demand-pill-pending")}>
                                    {counted ? "About " + part!.expected + perMonth : "Not counted yet"}
                                </span>
                                {/* The formula behind a CALCULATED result,
                                    once it counts: an entered figure has
                                    none to show. */}
                                {counted && calculated && DEMAND_SOURCE_FORMULA_HELP[type.id] && (
                                    <InfoNote
                                        label={type.label + " result"}
                                        points={DEMAND_SOURCE_FORMULA_HELP[type.id]}
                                    />
                                )}
                            </span>
                        )}
                        <BusinessRemove
                            what={capitalized(what)}
                            disabled={disabled}
                            onRemove={() => updateDemand(offeringId, {
                                sources: demand.sources.filter(other => other.id !== source.id)
                            })}
                        />
                    </div>

                    {/* FOUR COLUMNS, labels above: the source and how it is
                        estimated, then its figure or its calculation. */}
                    <div className="business-demand-fields">

                        <BusinessField
                            label="Customer Source"
                            info={available.map(entry => ({ title: entry.label, text: entry.explanation }))}
                        >
                            <OptionPicker
                                label={capitalized(what)}
                                placeholder="Select"
                                hug
                                options={available.map(entry => entry.label)}
                                disabled={disabled}
                                value={type?.label ?? ""}
                                /* The inputs are kept when the source
                                   changes: several share keys ("buy"). */
                                onChange={(next) => changeSource(source.id, {
                                    type: available.find(entry => entry.label === next)?.id ?? ""
                                })}
                            />
                        </BusinessField>

                        {type && type.fields.length > 0 && (
                            <BusinessField label="Estimated" info={DEMAND_CALCULATION_HELP}>
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
                        )}

                        {type && !excluded && (
                            <>
                                {calculated
                                    ? type.fields.map(field => numberField(
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
                                    )}
                            </>
                        )}

                    </div>

                    {note && <p className="business-demand-source-note">{note}</p>}

                    {type && !excluded && (
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
                    )}

                </div>
            );

        }

        return (
            <div
                className="business-demand"
                data-anchor={"demand-" + offeringId}
            >

                <div className="business-demand-head">
                    <div className="business-demand-title-row">
                        <FoldArrow
                            open={open}
                            label={"Demand & Conversion for " + offeringLabel}
                            onToggle={() => folds.toggle(foldKey)}
                        />
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
                    {demand.sources.map(sourceCard)}
                    <BusinessAddButton
                        label="Customer Source"
                        disabled={disabled}
                        onAdd={() => updateDemand(offeringId, {
                            sources: [...demand.sources, createDemandSource()]
                        })}
                    />
                </div>

                {/* HOW IT IS BOUGHT, UNDER THE SOURCES: Customers Buy and,
                    for an Offering kept until cancelled, the share
                    cancelling a month -- one row, labels above. */}
                <div className="business-demand-fields business-demand-buying">
                    <BusinessField label="Customers Buy" info={DEMAND_BUYING_HELP}>
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
                    </BusinessField>
                    {demand.recurring && demand.sources.length > 0 && numberField(
                        "Cancel / Month (%)",
                        "The share of active clients who cancel each month. At 5%, a client stays about 20 months on average.",
                        "Share of clients cancelling a month, " + offeringLabel,
                        "e.g. 5",
                        demand.cancel,
                        (next) => updateDemand(offeringId, { cancel: next }),
                        NUMBER_LIMITS.cancelPercent
                    )}
                </div>

                {demand.sources.length > 0 && (
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
                )}

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

                <div className="business-demand-channels">
                    <FieldLabel className="business-foundation-label">
                        Channels That Bring Them
                    </FieldLabel>
                    {channelOptions.length === 0
                        ? (
                            <BusinessEmpty>
                                No channel recorded for this Segment yet.
                            </BusinessEmpty>
                        )
                        : (
                            <div className="business-demand-ticks">
                                <BusinessTicks
                                    name={"Channels that bring customers for " + offeringLabel}
                                    options={channelOptions}
                                    /* Only ids still on the page: a channel
                                       removed above is no longer offered. */
                                    chosen={demand.channelIds.filter(id =>
                                        channelOptions.some(option => option.id === id)
                                    )}
                                    disabled={disabled}
                                    onChange={(next) => updateDemand(offeringId, {
                                        channelIds: next
                                    })}
                                />
                            </div>
                        )}
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

    return { demandFor, heads };

}
