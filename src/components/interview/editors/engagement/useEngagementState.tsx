/**
 * THE EDITOR'S STATE: the isolation of one channel, the folds, the reads of the other pages and what is worked out from them.
 * One part of BusinessEngagementEditor (see BusinessEngagementEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import { CSSProperties, FocusEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import GlobalSettingsLink from "../../fields/GlobalSettingsLink.tsx";
import FieldLabel from "../../../controls/FieldLabel.tsx";
import { asGlobalSettings, channelFeeOf } from "../../../../framework/engine/GlobalSettings.ts";
import { asFinancialSustainabilityValue } from "../../../../framework/engine/financial/revenueStored.ts";
import { channelFeeFor } from "../../../../framework/engine/CalculatedLines.ts";
import { moneyText } from "../../../../framework/engine/ExportRenderers.ts";

/** The channel categories that take a fee on a sale: a fee line on their subchannels' cards (doc 50, section 1.3). */
const FEE_CATEGORIES: readonly string[] = ["Direct Payment", "Website", "Marketplace"];
import { ScopeChoice, type OptionScope } from "./EngagementCard.tsx";
import CellRemoveButton from "../../../controls/CellRemoveButton.tsx";
import { BUSINESS_CHANNEL_ALL_OFFERINGS, BusinessChannelValue, BusinessOfferingRelationshipsValue, BusinessRelationshipInteractionValue, BusinessRelationshipTypeValue, BusinessSegmentEngagementValue, asBusinessEngagementValue, businessFoundationSegments, createBusinessOfferingRelationships, createBusinessRelationshipInteraction, createBusinessRelationshipType, createBusinessSegmentEngagement } from "../../../../framework/engine/AnswerUtils.ts";
import { consumeKey } from "../../fields/consumeKey.ts";
import NumberedListInput from "../../fields/NumberedListInput.tsx";
import ChannelResources, { ActionPickService, useLatestEngagement } from "../ChannelResources.tsx";
import { jumpTo } from "../../tiles/jumpTo.ts";
import { rowActions, withChosenAction, withRowLines } from "../../../../framework/engine/ChannelActions.ts";
import { actionAtOrder, actionPlacements, actionRows, channelNamesOf, connectionPaint, markTint, orderAt, orderIn, parseOrderReference, resourceColours, sharedColours } from "../../../../framework/engine/ActionOrder.ts";
import { useChannelColumns } from "../useChannelColumns.ts";
import { noPhysicalOffering, offeringStartsById } from "../../../../framework/engine/EffectiveAnswers.ts";
import { type CostCard, actionResourceLinks, capabilityCards, costCardName } from "../../../../framework/engine/ChannelResources.ts";
import { type ActionIsolation, type ActionLit, ResourceSymbol, SharedSymbol } from "../ActionMarkers.tsx";
import { OPEN_EVENT, type OpenRequest } from "../../tiles/SectionTiles.tsx";
import { asBusinessCapabilityValue, equalOfferingShares } from "../../../../framework/engine/AnswerUtils.ts";
import { useItemFolds } from "../../fields/useItemFolds.ts";
import { toggledIn } from "../../fields/toggledIn.ts";
import { BusinessEngagementEditorProps, CONTENT_OF_THE_TABLE } from "./shared.tsx";
import { dismissedAfter, relationshipTypesOf, withAnswerChannels } from "../../../../framework/engine/JourneySuggestions.ts";

export function useEngagementState(props: BusinessEngagementEditorProps) {

    const {

    value,

    onChange,

    disabled = false,

    columnsDivider,

    foundation,

    onOpenFoundation,

    capability,

    onChangeCapability,

    onOpenCapability,

    currency = "",

    globalSettings,

    financialSustainability,

    asTiles = false,

    identity

} = props;

    const engagement = asBusinessEngagementValue(value);
    // (What each Segment's dialogs offer, From your answers until All is chosen: ScopeChoice. Kept here, so every card of the page reads it -- its adds and its
    // removes show with All only; owner, 2026-11-14 11:51: "When the option From your answers is selected, then the delete button, should be hidden".)
    const [scopes, setScopes] = useState<Readonly<Record<string, OptionScope>>>({});
    const showsAll = (segmentId: string) => scopes[segmentId] === "all";
    /** The From your answers / All choice at the head of a Segment's three dialogs: one choice, shared by the three. */
    const scopeChoice = (segmentId: string) => <ScopeChoice group={"option-scope-" + segmentId} value={scopes[segmentId] ?? "answers"} onChange={(next) => setScopes(current => ({ ...current, [segmentId]: next }))} />;
    /* THE RESOURCE CARDS of 3. Infrastructure & Capability a channel's
       resources are, read by id (ChannelResources.ts). */
    const capabilityValue = useMemo(() => asBusinessCapabilityValue(capability), [capability]);
    const cards = useMemo(() => capabilityCards(capabilityValue), [capabilityValue]);
    useLatestEngagement(engagement);
    // The Journey Stage and Channel columns of the Customer Channel table fit their dropdowns.
    useChannelColumns();
    /** What pointing at an action or a resource lights (its twins; a resource's actions), and what
     *  the Customer Channel table isolates (a symbol's click: the others dim). View state: never saved. */
    const [lit, setLit] = useState<ActionLit>(null);
    const [isolated, setIsolated] = useState<ActionIsolation>(null);
    /** The symbol that isolated, to give the keyboard back to when everything is restored. */
    const isolator = useRef<HTMLElement | null>(null);
    /** Isolates (or, given null, restores everything). Starting an isolation takes the top of
     *  that Segment's Customer Channel section (its title row, with the note) to the top of the
     *  window, under the app header -- smoothly, unless motion is reduced; ending one scrolls nothing. */
    function toggleIsolation(next: ActionIsolation, symbol?: HTMLElement) {
        if (symbol) {
            isolator.current = symbol;
        }
        if (next) {
            // Nothing is created while the table is isolated: a "Link an action" click-to-pick in progress ends.
            ActionPickService.finish(null);
        }
        if (next && !isolated) {
            const head = document.querySelector<HTMLElement>(
                '[data-anchor~="engagement-section-' + CSS.escape(next.segmentId + "-channels") + '"] > .business-engagement-section-head'
            );
            if (head) {
                const header = document.querySelector<HTMLElement>(".app-header")?.getBoundingClientRect().height ?? 0;
                // The rows above the window that close would move the page under the scroll (scroll
                // anchoring): off while it settles, so the scroll lands where it was aimed.
                const root = document.documentElement;
                root.style.overflowAnchor = "none";
                window.setTimeout(() => { root.style.overflowAnchor = ""; }, 900);
                window.scrollTo({
                    top: Math.max(0, head.getBoundingClientRect().top + window.scrollY - header),
                    left: 0,
                    behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
                });
            }
        }
        setIsolated(next);
    }
    /** Restores everything (Escape, the title row's note) and puts the keyboard back on the symbol. */
    function clearIsolation() {
        setIsolated(null);
        const symbol = isolator.current;
        window.setTimeout(() => {
            if (symbol?.isConnected) {
                // The keyboard goes back to the symbol; the page does not move to it.
                symbol.focus({ preventScroll: true });
            }
        }, 0);
    }
    useEffect(() => {
        if (!isolated) {
            return;
        }
        const clear = (event: globalThis.KeyboardEvent) => {
            if (event.key === "Escape" && !event.defaultPrevented) {
                // Escape is Back for the page (consumeKey): this press only restores the rows.
                consumeKey(event);
                clearIsolation();
            }
        };
        document.addEventListener("keydown", clear);
        // A click on EMPTY SPACE -- the page's background, a table's blank area, anywhere that is not a
        // control or a cell's content -- restores everything too. It must also have PRESSED on empty
        // space, so a drag that began in a text and ended outside it is not a click on empty space.
        let pressedOnEmpty = false;
        const emptySpace = (target: EventTarget | null) => target instanceof Element && target.closest(CONTENT_OF_THE_TABLE) === null;
        const press = (event: MouseEvent) => {
            pressedOnEmpty = event.button === 0 && emptySpace(event.target);
        };
        const click = (event: MouseEvent) => {
            if (pressedOnEmpty && !event.defaultPrevented && emptySpace(event.target)) {
                pressedOnEmpty = false;
                clearIsolation();
            }
        };
        document.addEventListener("mousedown", press, true);
        document.addEventListener("click", click);
        return () => {
            document.removeEventListener("keydown", clear);
            document.removeEventListener("mousedown", press, true);
            document.removeEventListener("click", click);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isolated]);
    /** The id of the tile of one channel (the group of subchannels of a category), for opening it. */
    const channelTileId = (segmentId: string, groupKey: string) => "channel-tile-" + segmentId + "-" + groupKey;
    /** Goes to an action's first line in the table, and puts the caret in it. */
    function openAction(segmentId: string, actionId: string) {
        const answers = engagement.segments.find(entry => entry.segmentId === segmentId);
        const channel = answers?.channels.find(candidate => Object.values(candidate.actionIds).some(ids => ids.includes(actionId)));
        if (!answers || !channel) {
            return;
        }
        const first = answers.channels.find(candidate => candidate.category === channel.category);
        if (asTiles) {
            // The channel's table is in its tile's dialog: open that first.
            document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: channelTileId(segmentId, first?.id ?? channel.id), box: "open" } }));
            window.setTimeout(() => document.querySelector<HTMLTextAreaElement>('textarea[data-field-id="' + actionId + '"]')?.focus(), 700);
            return;
        }
        jumpTo(["channel-" + channel.id, "channel-category-" + (first?.id ?? channel.id), "engagement-segment-" + segmentId]);
        window.setTimeout(() => document.querySelector<HTMLTextAreaElement>('textarea[data-field-id="' + actionId + '"]')?.focus(), 400);
    }
    /**
     * A CHANNEL AND THE CARDS IT MADE SHARE ITS OFFERINGS: when the channel's Offerings change, the Resource, Partner or Provider cards it made in
     * Offering's Capability take the same ones ("All Offerings" is every Offering), with their shares started equal; on those cards the ticks are locked.
     */
    function offeringsOfMadeCards(channelId: string, offerings: readonly string[], every: readonly string[]) {
        const ids = offerings.includes(BUSINESS_CHANNEL_ALL_OFFERINGS) ? [...every] : [...offerings];
        const made = new Set(engagement.channelResources.filter(link => link.channelId === channelId).map(link => link.resourceId));
        if (!onChangeCapability || made.size === 0) {
            return;
        }
        const retag = <T extends { id: string; offeringIds: string[]; offeringShares: Record<string, string> }>(card: T): T => made.has(card.id) ? { ...card, offeringIds: ids, offeringShares: equalOfferingShares(ids) } : card;
        onChangeCapability({
            ...capabilityValue,
            offering: {
                ...capabilityValue.offering,
                resources: capabilityValue.offering.resources.map(retag),
                professionals: capabilityValue.offering.professionals.map(retag),
                providers: capabilityValue.offering.providers.map(retag)
            }
        });
    }
    /** A channel's resources, in its cell: its small cards, its summary and "+ Add resource". */
    function channelResources(answers: BusinessSegmentEngagementValue, channelId: string, what: string, heading?: string) {
        return (
            <ChannelResources
                heading={heading}
                segment={answers}
                channelId={channelId}
                what={what}
                engagement={engagement}
                capability={capabilityValue}
                cards={cards}
                currency={currency}
                disabled={disabled || !onChangeCapability}
                onWrite={(next) => {
                    if (next.capability) {
                        onChangeCapability?.(next.capability);
                    }
                    if (next.engagement) {
                        onChange(next.engagement);
                    }
                }}
                actionOrder={(actionId, channelId) => orderIn(actionPlacements(answers), actionId, channelId)}
                lit={lit}
                onLit={setLit}
                isolated={isolated}
                onIsolate={toggleIsolation}
                onOpenCard={onOpenCapability ? (card: CostCard) => onOpenCapability(card.anchors) : undefined}
                onOpenAction={(actionId) => openAction(answers.segmentId, actionId)}
            />
        );
    }
    /** Page 1's Segments, read for reference only. */
    const segments = businessFoundationSegments(foundation);
    /* THE SUBCHANNELS THE ANSWERS MAKE are kept as the Segment's own (withAnswerChannels): made when the page opens or an answer changes, so every document
       reads them too. */
    useEffect(() => {
        if (disabled || segments.length === 0) {
            return;
        }
        let changed = false;
        const next = segments.map(segment => {
            const entry = engagement.segments.find(candidate => candidate.segmentId === segment.id);
            const channels = withAnswerChannels(entry?.channels ?? [], entry?.dismissedChannels ?? [], segment, identity);
            if (channels !== (entry?.channels ?? []) && (entry || channels.length > 0)) {
                changed = true;
                return { ...(entry ?? { ...createBusinessSegmentEngagement(segment.id), channels: [] }), channels };
            }
            return entry;
        }).filter((entry): entry is BusinessSegmentEngagementValue => entry !== undefined);
        // (How an Offering's customers buy, kept as its terms say -- O3, offeringStarts --, so every document reads it as the page shows it.)
        const demand = { ...engagement.demand };
        segments.forEach(segment => segment.offerings.forEach(offering => {
            const recurring = offeringStartsById(segments, offering.id, identity).recurring;
            const saved = demand[offering.id];
            if (saved && recurring !== undefined && saved.recurring !== recurring) {
                demand[offering.id] = { ...saved, recurring };
                changed = true;
            }
        }));
        if (changed) {
            const others = engagement.segments.filter(entry => !segments.some(segment => segment.id === entry.segmentId));
            onChange({ ...engagement, segments: [...next, ...others], demand });
        }
    // (Read again whenever the answer or the Foundation changes.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, foundation, identity, disabled]);
    /** NO PHYSICAL ITEM (doc 28, 11.7): while no Offering on Page 1 has one, the Physical Delivery and Retail & Wholesale channels are hidden where a Segment has none (channelCategoryHidden), as Page 3 hides its physical categories. */
    const noPhysical = noPhysicalOffering(segments);
    /** The cards folded away, by key. Not stored with the answer:
     *  which cards a reader has closed is how they are looking at
     *  the page, not part of what they have said. */
    const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
    /**
     * Which reference headers, Offering reference entries, Channel
     * Categories, per-Offering relationship blocks, Demand &
     * Conversion blocks and Engagement Strategy Journey Stage bands are
     * open. These start OPEN (`useItemFolds(true)`: what they hold is the page's work), as the
     * structural sections and per-type folds around them do, which are on `collapsed`.
     */
    const folds = useItemFolds(true);
    /* A CATEGORY FOLDS ITS CHANNELS AWAY. Keyed by the group's first
       channel, for the same reason the group itself is (see
       channelsFor): a key made from the category would change with
       every keystroke typed into it, and the group would fold and
       unfold as it was named. */
    const channelCategoryFoldKey = (segmentId: string, groupKey: string) =>
        "channel-category-" + segmentId + "-" + groupKey;
    /* ---------- Reading and writing one Segment's answer ---------- */

    /**
     * What has been answered for a Segment, or an empty answer for
     * one that has not been touched. Never stored until something
     * is written into it, so opening the page records nothing.
     */
    function segmentOf(segmentId: string): BusinessSegmentEngagementValue {
        return engagement.segments.find(entry => entry.segmentId === segmentId)
            ?? createBusinessSegmentEngagement(segmentId);
    }
    /** One Segment's named Channel Categories' fold keys, grouped
     *  exactly as channelsFor groups them -- for "Expand all". */
    function channelCategoryFoldKeys(segmentId: string): string[] {

        const seen = new Set<string>();

        const keys: string[] = [];

        for (const channel of segmentOf(segmentId).channels) {

            if (seen.has(channel.category)) {
                continue;
            }

            seen.add(channel.category);

            if (channel.category.trim().length > 0) {
                keys.push(channelCategoryFoldKey(segmentId, channel.id));
            }

        }

        return keys;

    }
    function toggle(key: string) {
        setCollapsed(current => toggledIn(current, key));
    }
    /** The Customer Channel table is isolating something of this Segment. */
    function isolatingSegment(segmentId: string): boolean {
        return isolated !== null && isolated.segmentId === segmentId;
    }
    /** Whether an action is part of what is isolated (everything is, while nothing is). */
    function isRelated(segmentId: string, actionId: string): boolean {
        if (!isolated || isolated.segmentId !== segmentId) {
            return true;
        }
        if (isolated.kind === "action") {
            return isolated.actionId === actionId;
        }
        return actionResourceLinks(engagement, segmentId, actionId, cards)
            .some(entry => isolated.resourceIds.includes(entry.link.resourceId));
    }
    /** The note's names: the channels that hold the shared action, or the isolated resources, each once. */
    function isolationNames(): string[] {
        if (!isolated) {
            return [];
        }
        if (isolated.kind === "action") {
            const answers = segmentOf(isolated.segmentId);
            return channelNamesOf(answers, actionPlacements(answers), isolated.actionId);
        }
        return [...new Set(isolated.resourceIds
            .flatMap(id => cards.filter(card => card.id === id))
            .map(card => costCardName(card)))];
    }
    /** The stages of a channel that hold an isolated action. */
    function relatedStages(answers: BusinessSegmentEngagementValue, segmentId: string, channel: BusinessChannelValue): string[] {
        return channel.stages.filter(stage => rowActions(answers, channel.id, stage).ids
            .some(actionId => isRelated(segmentId, actionId)));
    }
    function updateSegment(
        segmentId: string,
        patch: Partial<BusinessSegmentEngagementValue>
    ) {

        const known = engagement.segments.some(
            entry => entry.segmentId === segmentId
        );
        // (A subchannel the answers made and the founder removed stays removed; added again, it is back: dismissedAfter.)
        const withDismissed = (entry: BusinessSegmentEngagementValue): Partial<BusinessSegmentEngagementValue> => patch.channels
            ? { ...patch, dismissedChannels: dismissedAfter(entry.channels, patch.channels, entry.dismissedChannels ?? []) }
            : patch;

        onChange({
            ...engagement,
            segments: known
                ? engagement.segments.map(entry => entry.segmentId === segmentId
                    ? { ...entry, ...withDismissed(entry) }
                    : entry)
                : [
                    ...engagement.segments,
                    { ...createBusinessSegmentEngagement(segmentId), ...patch }
                ]
        });

    }
    /**
     * A row's actions (a channel at one stage): the Segment's shared
     * actions it holds, one per line (ChannelActions.ts). Typing edits
     * the action in every row; choosing one of the Segment's others as
     * it is offered puts the same action on the line; the line's ×
     * takes it out of this row only. An action another row holds too
     * says where, quietly.
     */
    function channelActions(
        segmentId: string,
        answers: BusinessSegmentEngagementValue,
        channelId: string,
        stageId: string,
        label: string
    ) {
        const row = rowActions(answers, channelId, stageId);
        const items = row.texts.length > 0 ? row.texts : [""];
        // The table read down: each line's total order number, the shared actions' and the resources' colours.
        const placements = actionPlacements(answers);
        const sharedColour = sharedColours(placements);
        const resourceColour = resourceColours(engagement, segmentId);
        const others = answers.actions.filter(action => !row.ids.includes(action.id) && action.text.trim().length > 0);
        const write = (next: BusinessSegmentEngagementValue) =>
            updateSegment(segmentId, { channels: next.channels, actions: next.actions });
        return (
            <NumberedListInput
                label={label}
                items={items}
                lineIds={row.ids}
                /* Isolating: Enter opens no new line (nothing is created); a line's text stays editable. */
                maxItems={isolatingSegment(segmentId) ? items.length : undefined}
                disabled={disabled}
                suggestions={[...new Set(others.map(action => action.text))]}
                /* "#12" typed in a line offers action number 12 (its total order number) as the one
                   suggestion -- unless it is on this row already, has no words yet or there is no 12 --
                   and choosing it shares that very action here, as choosing any other suggestion does.
                   Anything else typed stays as typed. */
                reference={(typed) => {
                    const number = parseOrderReference(typed);
                    const id = number === undefined ? undefined : actionAtOrder(placements, number);
                    const action = id === undefined || row.ids.includes(id) ? undefined : answers.actions.find(entry => entry.id === id);
                    return action && action.text.trim().length > 0 ? action.text : undefined;
                }}
                dropEmptyOnBlur
                onAccept={(line, text, typed) => {
                    const number = parseOrderReference(typed);
                    const chosenId = number !== undefined
                        ? actionAtOrder(placements, number)
                        : others.find(action => action.text === text)?.id;
                    if (chosenId) {
                        write(withChosenAction(answers, channelId, stageId, line, chosenId));
                    }
                }}
                onChange={(next, origins) => write(withRowLines(answers, channelId, stageId, next, origins))}
                lineOrder={(line) => {
                    const order = orderAt(placements, channelId, stageId, line);
                    return order === undefined ? null : "#" + order;
                }}
                rowProps={(line) => {
                    const id = row.ids[line];
                    const classes: string[] = ["is-action-line"];
                    // Isolating: the lines that are not part of it collapse away.
                    if (isolatingSegment(segmentId)) {
                        if (!id || !isRelated(segmentId, id)) {
                            classes.push("is-collapsed");
                        } else if (row.ids.slice(0, line).length > 0) {
                            // The first line left standing has no hairline above it (the box's border is there).
                            if (row.ids.slice(0, line).every(earlier => !isRelated(segmentId, earlier))) {
                                classes.push("is-first-shown");
                            }
                        }
                    }
                    if (!id) {
                        return { className: classes.join(" ") };
                    }
                    const sharedAt = sharedColour.get(id);
                    const linked = actionResourceLinks(engagement, segmentId, id, cards);
                    const hues = [...new Set(linked.map(entry => resourceColour.get(entry.link.resourceId) ?? 0))];
                    // The connection lines: a resource's colour(s) down the cell's left edge (split into equal
                    // segments, top to bottom, when there are two or more), a shared action's down its right.
                    const style: Record<string, string> = {};
                    if (hues.length > 0) {
                        // One part of the line per resource; past six resources the hues come round in stripes, then a cross-hatch.
                        const paint = connectionPaint("resource", hues);
                        classes.push("has-line-left");
                        style["--line-left"] = paint.image;
                        style["--line-left-size"] = paint.size;
                        style["--line-left-position"] = paint.position;
                    }
                    if (sharedAt !== undefined) {
                        const paint = connectionPaint("shared", [sharedAt]);
                        classes.push("has-line-right");
                        style["--line-right"] = paint.image;
                        style["--line-right-size"] = paint.size;
                        style["--line-right-position"] = paint.position;
                    }
                    const litResource = lit?.kind === "resources"
                        ? engagement.channelResources.find(entry => lit.ids.includes(entry.id) && entry.actionIds.includes(id))
                        : undefined;
                    const lighting = litResource !== undefined || (lit?.kind === "action" && lit.id === id);
                    if (lighting) {
                        classes.push("is-lit", litResource
                            ? markTint("resource", resourceColour.get(litResource.resourceId) ?? 0)
                            : markTint("shared", sharedAt ?? 0));
                    }
                    return {
                        className: classes.join(" "),
                        style: style as CSSProperties,
                        "data-action-id": id,
                        ...(sharedAt !== undefined
                            ? {
                                onMouseEnter: () => setLit({ kind: "action", id }),
                                onMouseLeave: () => setLit(null),
                                onFocus: () => setLit({ kind: "action", id }),
                                onBlur: (event: FocusEvent<HTMLDivElement>) => {
                                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                                        setLit(null);
                                    }
                                }
                            }
                            : {})
                    };
                }}
                lineEnd={(line) => {
                    const id = row.ids[line];
                    if (!id) {
                        return null;
                    }
                    const rowsHolding = actionRows(placements, id).length;
                    const sharedAt = sharedColour.get(id);
                    const linked = actionResourceLinks(engagement, segmentId, id, cards);
                    const linkIds = linked.map(entry => entry.link.id);
                    const resourceIds = [...new Set(linked.map(entry => entry.link.resourceId))];
                    const resourceNames = [...new Set(linked.map(entry => costCardName(entry.card)))];
                    const sharedPressed = isolated?.kind === "action" && isolated.actionId === id;
                    const resourcePressed = isolated?.kind === "resource" && isolated.segmentId === segmentId
                        && isolated.resourceIds.length === resourceIds.length
                        && resourceIds.every(resourceId => isolated.resourceIds.includes(resourceId));
                    return (
                        <>
                            {(sharedAt !== undefined || linked.length > 0) && (
                                <span className="action-marks">
                                    {sharedAt !== undefined && (
                                        <SharedSymbol
                                            places={rowsHolding}
                                            colour={sharedAt}
                                            pressed={sharedPressed}
                                            onToggle={(symbol) => toggleIsolation(
                                                sharedPressed ? null : { kind: "action", segmentId, actionId: id },
                                                symbol
                                            )}
                                        />
                                    )}
                                    {linked.length > 0 && (
                                        <ResourceSymbol
                                            names={resourceNames}
                                            colour={resourceColour.get(linked[0].link.resourceId) ?? 0}
                                            pressed={resourcePressed}
                                            onHover={(on) => setLit(on ? { kind: "resources", ids: linkIds } : null)}
                                            onToggle={(symbol) => toggleIsolation(
                                                resourcePressed ? null : { kind: "resource", segmentId, resourceIds, fromActionId: id },
                                                symbol
                                            )}
                                        />
                                    )}
                                </span>
                            )}
                            {/* (The in-cell x, frameless, inside the line at its right end: owner, 2026-11-14 12:38.) */}
                            <CellRemoveButton
                                aria-label={"Remove action " + (line + 1) + " from " + label}
                                disabled={disabled}
                                onClick={() => write(withRowLines(
                                    answers, channelId, stageId,
                                    items.filter((_text, index) => index !== line),
                                    items.map((_text, index) => index).filter(index => index !== line)
                                ))} />
                        </>
                    );
                }}
            />
        );
    }
    function updateChannel(
        segmentId: string,
        channelId: string,
        patch: Partial<BusinessChannelValue>
    ) {
        updateSegment(segmentId, {
            channels: segmentOf(segmentId).channels.map(
                channel => channel.id === channelId
                    ? { ...channel, ...patch }
                    : channel
            )
        });
    }
    /*
        The two levels below an Offering are each stored as a chosen
        LIST plus a DETAIL MAP keyed by the same ids -- types and
        typeDetail.

        Two shapes rather than one because unticking must not
        destroy. Unticking is how a founder tries a relationship
        type on for size; it is not a request to throw away the
        Purpose, Approach or Goals written under it. The detail
        outlives the tick, so ticking again brings the work straight
        back -- the same thing Page 1 does with what is written
        under a competitor question its type later hides.
    */

    /** What is kept ABOUT ONE OFFERING, whoever it is sold to. */
    function offeringRelationshipsOf(
        segmentId: string,
        offeringId: string
    ): BusinessOfferingRelationshipsValue {
        const stored = segmentOf(segmentId).offerings.find(
            entry => entry.offeringId === offeringId
        ) ?? { ...createBusinessOfferingRelationships(), offeringId };
        // (The types its answers create, less those removed, then those added; never none -- relationshipTypesOf.)
        return { ...stored, types: relationshipTypesOf(stored.types, stored.dismissed ?? [], segments.find(segment => segment.id === segmentId), offeringId, identity) };
    }
    /** An Offering's relationships as saved: the types the founder added (`types`) and those removed (`dismissed`), before the answers' types are laid in. */
    function storedOfferingRelationshipsOf(segmentId: string, offeringId: string): BusinessOfferingRelationshipsValue {
        return segmentOf(segmentId).offerings.find(entry => entry.offeringId === offeringId) ?? createBusinessOfferingRelationships();
    }
    function updateOfferingRelationships(
        segmentId: string,
        offeringId: string,
        patch: Partial<BusinessOfferingRelationshipsValue>
    ) {

        const segment = segmentOf(segmentId);

        const known = segment.offerings.some(
            entry => entry.offeringId === offeringId
        );

        updateSegment(segmentId, {
            offerings: known
                ? segment.offerings.map(entry => entry.offeringId === offeringId
                    ? { ...entry, ...patch }
                    : entry)
                : [
                    ...segment.offerings,
                    {
                        offeringId,
                        ...createBusinessOfferingRelationships(),
                        ...patch
                    }
                ]
        });

    }
    function typeOf(
        segmentId: string,
        offeringId: string,
        typeId: string
    ): BusinessRelationshipTypeValue {
        return offeringRelationshipsOf(segmentId, offeringId)
            .typeDetail[typeId] ?? createBusinessRelationshipType();
    }
    function updateType(
        segmentId: string,
        offeringId: string,
        typeId: string,
        patch: Partial<BusinessRelationshipTypeValue>
    ) {

        const offering = offeringRelationshipsOf(segmentId, offeringId);

        updateOfferingRelationships(segmentId, offeringId, {
            typeDetail: {
                ...offering.typeDetail,
                [typeId]: {
                    ...typeOf(segmentId, offeringId, typeId),
                    ...patch
                }
            }
        });

    }
    /**
     * One interaction's answers, and how to change them.
     *
     * The Offering, the stage and the channel are not stored -- the
     * Channels table says which interactions exist, and this is
     * only what a person writes about each of them. `key` is what
     * businessInteractionKey makes of those three.
     */
    /**
     * One interaction's answers.
     *
     * `fallbacks` are the keys the same interaction's answers were
     * filed under before a row was one KIND of channel rather than
     * one channel. A row that has nothing of its own takes the
     * first of those that does, so an Approach written when
     * Instagram had a row of its own still shows now that Instagram
     * shares a row with TikTok. Only read, never written -- the
     * first edit files the answer under the current key.
     */
    function interactionOf(
        segmentId: string,
        offeringId: string,
        typeId: string,
        key: string,
        fallbacks: readonly string[] = [],
        /** The Goals a row not answered yet starts with (startGoals). */
        start: readonly string[] = []
    ): BusinessRelationshipInteractionValue {

        const kept = typeOf(segmentId, offeringId, typeId).interactions;

        if (kept[key]) {
            return kept[key];
        }

        for (const fallback of fallbacks) {

            const older = kept[fallback];

            if (older && (older.approach.trim().length > 0 || older.goals.length > 0)) {
                return older;
            }

        }

        return { ...createBusinessRelationshipInteraction(), goals: [...start] };

    }
    function updateInteraction(
        segmentId: string,
        offeringId: string,
        typeId: string,
        key: string,
        /* The same fallbacks the row is READ with. The first edit
           has to start from what the row is showing, or writing an
           Approach would silently drop the Goals shown beside it --
           they came from an older key, and a write that began from
           an empty answer would not carry them over. */
        fallbacks: readonly string[],
        patch: Partial<BusinessRelationshipInteractionValue>,
        start: readonly string[] = []
    ) {

        const type = typeOf(segmentId, offeringId, typeId);

        updateType(segmentId, offeringId, typeId, {
            interactions: {
                ...type.interactions,
                [key]: {
                    ...interactionOf(
                        segmentId, offeringId, typeId, key, fallbacks, start
                    ),
                    ...patch
                }
            }
        });

    }

    /*
        THE FEES A SUBCHANNEL PAYS (doc 50, section 1.4; owner, 2026-11-14 12:00: "For the proposed changes (Fees, Demand recheck) check the best solution and apply
        them"): on a Direct Payment, Website or Marketplace subchannel's card, read only, the row of the Global Settings' Channel Fee Table its name -- or one of its
        expense cards' names -- takes, the date it was checked, and what it takes from one sale of each Offering it serves; the Global Settings stay the one place
        to change it.
    */
    const feeTable = useMemo(() => asGlobalSettings(globalSettings).channelFees, [globalSettings]);
    const streams = useMemo(() => asFinancialSustainabilityValue(financialSustainability).streams, [financialSustainability]);
    function feeBand(channel: BusinessChannelValue, offerings: readonly { id: string; name: string }[]): ReactNode {
        if (!FEE_CATEGORIES.includes(channel.category.trim())) {
            return null;
        }
        const cardNames = engagement.channelResources
            .filter(link => link.channelId === channel.id)
            .map(link => cards.find(card => card.id === link.resourceId))
            .filter((card): card is CostCard => card !== undefined)
            .map(card => costCardName(card));
        const found = channelFeeFor([channel.name, ...cardNames], feeTable);
        const money = (amount: number) => moneyText(String(Math.round(amount * 100) / 100), currency);
        const served = channel.offerings.includes(BUSINESS_CHANNEL_ALL_OFFERINGS) ? offerings : offerings.filter(offering => channel.offerings.includes(offering.id));
        const sales = found ? served.flatMap(offering => {
            const stream = streams.find(entry => entry.offeringId === offering.id);
            const price = Number.parseFloat(stream?.price ?? "");
            const items = Number.parseFloat(stream?.itemsPerOrder ?? "") || 1;
            return Number.isFinite(price) && price > 0 ? [{ name: offering.name.trim() || "Offering", sale: price * items }] : [];
        }) : [];
        const rate = found ? [
            (found.row.commission || "0") + "%",
            ...(Number.parseFloat(found.row.fixedFee) > 0 ? [money(Number.parseFloat(found.row.fixedFee)) + " an order"] : []),
            ...(Number.parseFloat(found.row.chargeback) > 0 ? [found.row.chargeback + "% for chargebacks"] : [])
        ].join(" + ") : "";
        return (
            <div className="business-channel-resources business-channel-resources-sectioned business-channel-fees">
                    <div className="business-channel-resources-head">
                        <FieldLabel className="business-channel-field-label">Fees</FieldLabel>
                    </div>
                    {found ? (
                        <>
                            <p className="business-channel-cost-summary">{rate + " (" + found.row.channel + ")"}</p>
                            {found.row.note.trim() && <p className="business-channel-cost-summary">{found.row.note.trim()}</p>}
                            {sales.map(sale => <p key={sale.name} className="business-channel-cost-summary">{"On a " + money(sale.sale) + " " + sale.name + " sale: about " + money(channelFeeOf(found.row, sale.sale, 1))}</p>)}
                        </>
                    ) : (
                        <p className="business-channel-cost-summary">{"No fee is set for " + (channel.name.trim() || "this subchannel") + " yet: add its row to the Channel Fee Table."}</p>
                    )}
                    <GlobalSettingsLink className="business-channel-fee-link">Change in Global Settings</GlobalSettingsLink>
            </div>
        );
    }

    return { feeBand, scopeChoice, showsAll, identity, storedOfferingRelationshipsOf, asTiles, cards, channelActions, noPhysical, channelCategoryFoldKey, channelCategoryFoldKeys, channelResources, channelTileId, clearIsolation, collapsed, columnsDivider, currency, disabled, engagement, folds, interactionOf, isolated, isolatingSegment, isolationNames, offeringRelationshipsOf, offeringsOfMadeCards, onChange, onOpenCapability, onOpenFoundation, openAction, relatedStages, segmentOf, segments, setLit, toggle, typeOf, updateChannel, updateInteraction, updateOfferingRelationships, updateSegment, updateType, value };

}
