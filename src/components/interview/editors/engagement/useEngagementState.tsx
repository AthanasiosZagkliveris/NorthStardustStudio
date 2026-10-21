/**
 * THE EDITOR'S STATE: the isolation of one channel, the folds, the reads of the other pages and what is worked out from them.
 * One part of BusinessEngagementEditor (see BusinessEngagementEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import { CSSProperties, FocusEvent, useEffect, useMemo, useRef, useState } from "react";
import RemoveButton from "../../../controls/RemoveButton.tsx";
import { BUSINESS_CHANNEL_ALL_OFFERINGS, BusinessChannelValue, BusinessOfferingRelationshipsValue, BusinessRelationshipInteractionValue, BusinessRelationshipTypeValue, BusinessSegmentEngagementValue, asBusinessEngagementValue, businessFoundationSegments, createBusinessOfferingRelationships, createBusinessRelationshipInteraction, createBusinessRelationshipType, createBusinessSegmentEngagement } from "../../../../framework/engine/AnswerUtils.ts";
import { consumeKey } from "../../fields/consumeKey.ts";
import NumberedListInput from "../../fields/NumberedListInput.tsx";
import ChannelResources, { ActionPickService, useLatestEngagement } from "../ChannelResources.tsx";
import { jumpTo } from "../../tiles/jumpTo.ts";
import { rowActions, withChosenAction, withRowLines } from "../../../../framework/engine/ChannelActions.ts";
import { actionAtOrder, actionPlacements, actionRows, channelNamesOf, connectionPaint, markTint, orderAt, orderIn, parseOrderReference, resourceColours, sharedColours } from "../../../../framework/engine/ActionOrder.ts";
import { useChannelColumns } from "../useChannelColumns.ts";
import { type CostCard, actionResourceLinks, capabilityCards, costCardName } from "../../../../framework/engine/ChannelResources.ts";
import { type ActionIsolation, type ActionLit, ResourceSymbol, SharedSymbol } from "../ActionMarkers.tsx";
import { OPEN_EVENT, type OpenRequest } from "../../tiles/SectionTiles.tsx";
import { asBusinessCapabilityValue, equalOfferingShares } from "../../../../framework/engine/AnswerUtils.ts";
import { useItemFolds } from "../../fields/useItemFolds.ts";
import { toggledIn } from "../../fields/toggledIn.ts";
import { BusinessEngagementEditorProps, CONTENT_OF_THE_TABLE } from "./shared.tsx";

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

    asTiles = false

} = props;

    const engagement = asBusinessEngagementValue(value);
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
    /** The cards folded away, by key. Not stored with the answer:
     *  which cards a reader has closed is how they are looking at
     *  the page, not part of what they have said. */
    const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
    /**
     * Which reference headers, Offering reference entries, Channel
     * Categories, per-Offering relationship blocks, Demand &
     * Conversion blocks and Engagement Strategy Journey Stage bands are
     * open. These start CLOSED -- see useItemFolds -- unlike the
     * structural sections and per-type folds around them, which are on
     * `collapsed` and start OPEN (the page's work is in them: a closed Segment left the page empty).
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

        onChange({
            ...engagement,
            segments: known
                ? engagement.segments.map(entry => entry.segmentId === segmentId
                    ? { ...entry, ...patch }
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
                            <RemoveButton className="numbered-list-remove"
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
        return segmentOf(segmentId).offerings.find(
            entry => entry.offeringId === offeringId
        ) ?? createBusinessOfferingRelationships();
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
        fallbacks: readonly string[] = []
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

        return createBusinessRelationshipInteraction();

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
        patch: Partial<BusinessRelationshipInteractionValue>
    ) {

        const type = typeOf(segmentId, offeringId, typeId);

        updateType(segmentId, offeringId, typeId, {
            interactions: {
                ...type.interactions,
                [key]: {
                    ...interactionOf(
                        segmentId, offeringId, typeId, key, fallbacks
                    ),
                    ...patch
                }
            }
        });

    }

    return { asTiles, cards, channelActions, channelCategoryFoldKey, channelCategoryFoldKeys, channelResources, channelTileId, clearIsolation, collapsed, columnsDivider, currency, disabled, engagement, folds, interactionOf, isolated, isolatingSegment, isolationNames, offeringRelationshipsOf, offeringsOfMadeCards, onChange, onOpenCapability, onOpenFoundation, openAction, relatedStages, segmentOf, segments, setLit, toggle, typeOf, updateChannel, updateInteraction, updateOfferingRelationships, updateSegment, updateType, value };

}
