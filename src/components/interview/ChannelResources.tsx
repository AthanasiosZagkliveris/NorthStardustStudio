import { KeyboardEvent, ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAboveTip } from "./AboveTip.tsx";

import {
    type CostCard,
    actionsServing,
    channelCostSummary,
    channelResourceLinks,
    costCardAmountText,
    sharedResourceLinks,
    costCardName,
    withNewChannelResource,
    existingForTemplate,
    withLinkedExistingCard,
    withNewTemplateCost,
    holdsTemplate,
    templatesForCategory,
    withRenamedCard,
    withResourceAction,
    withoutChannelResource
} from "../../framework/engine/ChannelResources.ts";
import type {
    BusinessCapabilityValue,
    BusinessChannelResourceValue,
    BusinessEngagementValue,
    BusinessSegmentEngagementValue
} from "../../framework/engine/AnswerUtils.ts";
import { UndoService } from "../../services/UndoService";
import { consumeKey } from "./consumeKey.ts";
import type { ActionIsolation, ActionLit } from "./ActionMarkers.tsx";
import { actionPlacements, markTint, resourceColours, tableActionIds } from "../../framework/engine/ActionOrder.ts";

import "../../styles/notepad.css";

/*
    A CHANNEL'S RESOURCES (ChannelResources.ts), in its cell of the
    Customer Channel table: each a small card -- its name (the name of
    its Resource card on 3. Infrastructure & Capability, one name), what
    it costs there ("£150 a month", or "No cost yet"), which opens that
    card, and the channel's actions it serves, linked as a note links a
    place: "#" and the action's total order number in the table with its
    words, or "Link an action" and a click on one in the table; each a
    Notepad chip. Then "+ Add expenses", which
    makes the Resource card -- in Offering's Capability › Resources, linked
    to the channel's Offerings -- and links it, and the channel's summary line.

    "# Link an action" finds any action of the Segment's WHOLE table, not only
    the channel's own: by its total order number ("12", "#12") or by words. A
    card whose action stands in another channel shows in that channel's cell
    too, "via shared action", the words a link to the action's line.
*/

/* ---------- Picking an action in the table (as a note picks a field) ---------- */

interface ActionPick {
    linkId: string;
    /** The actions of the table it may take: its Segment's (a click on any other is left alone). */
    actionIds: readonly string[];
    /** What the resource is called, for the banner. */
    what: string;
    segmentId: string;
}

let picking: ActionPick | null = null;
let chosen: ((actionId: string) => void) | null = null;
const listeners = new Set<() => void>();

export const ActionPickService = {
    current(): ActionPick | null {
        return picking;
    },
    start(pick: ActionPick, onChoose: (actionId: string) => void): void {
        picking = pick;
        chosen = onChoose;
        listeners.forEach(listener => listener());
    },
    finish(actionId: string | null): void {
        const take = chosen;
        picking = null;
        chosen = null;
        listeners.forEach(listener => listener());
        if (actionId && take) {
            take(actionId);
        }
    },
    subscribe(listener: () => void): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }
};

/**
 * While a resource waits for one of its channel's actions: a banner
 * says so, the action lines of the table take the pointer, and a click
 * links the one under it -- editing nothing. Escape cancels.
 */
export function ActionPicker() {

    const pick = useSyncExternalStore(ActionPickService.subscribe, ActionPickService.current, ActionPickService.current);

    useEffect(() => {
        if (!pick) {
            return;
        }
        const root = document.documentElement;
        root.classList.add("action-picking");
        const target = (event: Event): HTMLElement | null => {
            const element = event.target as HTMLElement | null;
            const line = element?.closest<HTMLElement>(".business-channel-table textarea[data-field-id]") ?? null;
            return line && (line.dataset.fieldId ?? "").startsWith("action") && (pick.actionIds.length === 0 || pick.actionIds.includes(line.dataset.fieldId ?? ""))
                ? line
                : null;
        };
        let hovered: HTMLElement | null = null;
        const onOver = (event: MouseEvent) => {
            const next = target(event);
            if (next !== hovered) {
                hovered?.removeAttribute("data-pick-hover");
                hovered = next;
                hovered?.setAttribute("data-pick-hover", "");
            }
        };
        const onPress = (event: MouseEvent) => {
            if (target(event)) {
                event.preventDefault();
                event.stopPropagation();
            }
        };
        const onClick = (event: MouseEvent) => {
            const line = target(event);
            if (!line) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            ActionPickService.finish(line.dataset.fieldId ?? null);
        };
        const onKey = (event: globalThis.KeyboardEvent) => {
            if (event.key === "Escape") {
                consumeKey(event);
                ActionPickService.finish(null);
            }
        };
        document.addEventListener("mouseover", onOver, true);
        document.addEventListener("mousedown", onPress, true);
        document.addEventListener("click", onClick, true);
        window.addEventListener("keydown", onKey, true);
        return () => {
            root.classList.remove("action-picking");
            hovered?.removeAttribute("data-pick-hover");
            document.removeEventListener("mouseover", onOver, true);
            document.removeEventListener("mousedown", onPress, true);
            document.removeEventListener("click", onClick, true);
            window.removeEventListener("keydown", onKey, true);
        };
    }, [pick]);

    if (!pick) {
        return null;
    }

    return (
        <div className="notepad-pick-banner" role="status">
            {"Click an action to link it to " + pick.what + " · Esc to cancel"}
        </div>
    );

}

/* ---------- One channel's resources ---------- */

export interface ChannelResourcesProps {
    segment: BusinessSegmentEngagementValue;
    channelId: string;
    /** "Channel 3", for its controls' names. */
    what: string;
    engagement: BusinessEngagementValue;
    capability: BusinessCapabilityValue;
    cards: readonly CostCard[];
    currency: string;
    disabled?: boolean;
    /** Writes either page, or both (capability first). */
    onWrite: (next: { engagement?: BusinessEngagementValue; capability?: BusinessCapabilityValue }) => void;
    /** "#12": where an action stands in the table (its total action order number), in this channel's rows. */
    actionOrder: (actionId: string, channelId: string) => number | undefined;
    /** Opens the resource's card on 3. Infrastructure & Capability (Offering's Capability, or Infrastructure where made before). */
    onOpenCard?: (card: CostCard) => void;
    /** Goes to an action's line in the table. */
    onOpenAction?: (actionId: string) => void;
    /** What the table is lighting (see ActionMarkers.tsx): a resource lit by pointing at it, or at its action's symbol. */
    lit?: ActionLit;
    /** What the table isolates: only the resources involved stay, with no summary and no add. */
    isolated?: ActionIsolation;
    /** A click on a resource's symbol isolates its actions (a second click restores everything). */
    onIsolate?: (next: ActionIsolation, symbol?: HTMLElement) => void;
    /** Pointing at (or focusing) a resource lights its actions in the table. */
    onLit?: (lit: ActionLit) => void;
    /** A channel's CARD says "Expenses" over its list, with the "+" that adds one in the corner (above the x column); each expense has its regular x beside it. */
    heading?: string;
}

export default function ChannelResources(props: ChannelResourcesProps) {

    const { segment, channelId, what, engagement, capability, cards, currency, disabled = false, onWrite } = props;

    const linked = channelResourceLinks(engagement, segment.segmentId, channelId, cards);
    // Made on other channels, serving this one through an action it shares.
    const shared = sharedResourceLinks(engagement, segment.segmentId, channelId, cards);
    const summary = channelCostSummary([...linked, ...shared].map(entry => entry.card), currency, shared.length > 0);
    const colours = resourceColours(engagement, segment.segmentId);
    // Isolating (a symbol's click): only the resources involved stay; no summary, no add.
    const isolating = props.isolated != null && props.isolated.segmentId === segment.segmentId ? props.isolated : null;
    const involved = (link: BusinessChannelResourceValue) => !isolating
        || (isolating.kind === "action"
            ? link.actionIds.includes(isolating.actionId)
            : isolating.resourceIds.includes(link.resourceId));
    // The actions of a card shared in here that stand in this channel's rows.
    const serving = (link: BusinessChannelResourceValue) => actionsServing(engagement, segment.segmentId, channelId, link);
    const actionWords = (id: string) => segment.actions.find(action => action.id === id)?.text ?? "";
    const channelName = (id: string) => {
        const channel = segment.channels.find(entry => entry.id === id);
        return channel ? [channel.category, channel.name.trim() || "Unnamed channel"].filter(Boolean).join(" › ") : "another channel";
    };

    /* The page as it is now, for an undo offered a moment ago. */
    const latest = useRef({ engagement, capability, onWrite });
    latest.current = { engagement, capability, onWrite };
    // The typical costs that fit this channel's category: a courier is not offered on an Instagram channel.
    const fitting = templatesForCategory(segment.channels.find(entry => entry.id === channelId)?.category ?? "");
    // The menu of the one "+ Add expense" button.
    const [menuOpen, setMenuOpen] = useState(false);

    // The company's own cards that fit this channel and are not on it yet, each once.
    const existingCosts = [...new Map(
        fitting.flatMap(template => existingForTemplate(engagement, capability, segment.segmentId, channelId, template)).map(entry => [entry.id, entry] as const)
    ).values()];
    /** The channels a card already serves: "Already on: Website › Main Website, ...". */
    const servedBy = (cardId: string) => {
        const channels = engagement.segments.flatMap(entry => entry.channels);
        const names = engagement.channelResources
            .filter(link => link.resourceId === cardId)
            .map(link => channels.find(channel => channel.id === link.channelId))
            .filter((channel): channel is NonNullable<typeof channel> => channel !== undefined)
            .map(channel => (channel.category.trim() ? channel.category + " › " : "") + (channel.name.trim() || "Unnamed channel"));
        return names.length > 0 ? "Already on: " + [...new Set(names)].join(", ") : "Not on a channel yet";
    };

    return (
        <div className={"business-channel-resources" + (props.heading ? " business-channel-resources-sectioned" : "")}>

            {props.heading && (
                <div className="business-channel-resources-head">
                    <span className="business-channel-field-label">{props.heading}</span>
                    {!isolating && (
                        <button
                            type="button"
                            className="strategy-box-add"
                            aria-label={"Add expense to " + what}
                            title="Add expense"
                            aria-expanded={menuOpen}
                            disabled={disabled}
                            onClick={() => setMenuOpen(open => !open)}
                        >
                            +
                        </button>
                    )}
                </div>
            )}

            {linked.map(({ link, card }, index) => involved(link) && (
                <ChannelResourceCard
                    key={link.id}
                    {...props}
                    link={link}
                    card={card}
                    colour={colours.get(link.resourceId) ?? 0}
                    label={"Resource " + (index + 1) + " of " + what}
                    onRemove={() => {
                        const before = { engagement, capability };
                        const next = withoutChannelResource(engagement, capability, link.id);
                        onWrite(next);
                        // Both back: the link, and the card it made.
                        UndoService.offer("Resource " + costCardName(card) + " removed.", () => {
                            const now = latest.current;
                            const restoredLinks = [...now.engagement.channelResources.filter(entry => entry.id !== link.id), link];
                            now.onWrite({
                                capability: next.capability === before.capability ? undefined : before.capability,
                                engagement: { ...now.engagement, channelResources: restoredLinks }
                            });
                        });
                    }}
                />
            ))}

            {shared.length > 0 && (!isolating || isolating.kind === "action") && (
                <ul className="notepad-chips business-channel-resources-shared" aria-label={"Resources serving " + what + " through shared actions"}>
                    {shared.filter(({ link }) => involved(link)).map(({ link, card }) => (
                        <li
                            key={link.id}
                            className={"notepad-chip " + markTint("resource", colours.get(link.resourceId) ?? 0)}
                            onMouseEnter={() => props.onLit?.({ kind: "resources", ids: [link.id] })}
                            onMouseLeave={() => props.onLit?.(null)}
                        >
                            <div className="business-channel-shared-body">
                                <button
                                    type="button"
                                    className="notepad-chip-open"
                                    title={"Created on " + channelName(link.channelId)}
                                    onClick={() => props.onOpenCard?.(card)}
                                >
                                    <span className="notepad-chip-tag">{costCardName(card)}</span>
                                    <span className="notepad-chip-description">{costCardAmountText(card, currency) || "No cost yet"}</span>
                                </button>
                                {/* "via shared action": the action is a link to its line in the table (one link per action when several). */}
                                <span className="business-channel-via-shared">
                                    {"via "}
                                    {serving(link).length === 1
                                        ? (
                                            <ViaActionLink
                                                words="shared action"
                                                order={props.actionOrder(serving(link)[0], channelId)}
                                                text={actionWords(serving(link)[0])}
                                                onOpen={() => props.onOpenAction?.(serving(link)[0])}
                                            />
                                        )
                                        : (
                                            <>
                                                {"shared actions "}
                                                {serving(link).map(actionId => (
                                                    <ViaActionLink
                                                        key={actionId}
                                                        words={"#" + (props.actionOrder(actionId, channelId) ?? "")}
                                                        order={props.actionOrder(actionId, channelId)}
                                                        text={actionWords(actionId)}
                                                        onOpen={() => props.onOpenAction?.(actionId)}
                                                    />
                                                ))}
                                            </>
                                        )}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {summary && !isolating && <p className="business-channel-cost-summary">{summary}</p>}

            {/* ONE BUTTON for every way of adding an expense: a blank one, every typical cost of the channel at once, one typical cost, or a card the company already has
                (Link existing). The menu stays open for the next, and closes with its own "Done". */}
            {!isolating && !props.heading && <div className="business-step-add-row">
                <button
                    type="button"
                    className="strategy-add-button"
                    aria-label={"Add expense to " + what}
                    aria-expanded={menuOpen}
                    disabled={disabled}
                    onClick={() => setMenuOpen(open => !open)}
                >
                    + Add expense
                </button>
            </div>}

            {!isolating && menuOpen && (
                <div className="business-channel-cost-add">
                    <ul className="notepad-suggestions" role="list" aria-label={"Add expense to " + what + " list"}>
                        <li>
                            <button
                                type="button"
                                className="notepad-suggestion"
                                aria-label={"Blank expense for " + what}
                                onClick={() => {
                                    const made = withNewChannelResource(engagement, capability, segment.segmentId, channelId, "");
                                    onWrite({ capability: made.capability, engagement: made.engagement });
                                    setMenuOpen(false);
                                    window.setTimeout(() => document
                                        .querySelector<HTMLTextAreaElement>('[data-channel-resource="' + made.link.id + '"] .business-channel-resource-name')
                                        ?.focus(), 0);
                                }}
                            >
                                <span className="notepad-suggestion-label">Blank expense</span>
                            </button>
                        </li>
                        {/* The typical costs of this channel's kind, each its own option, right after the Blank expense. */}
                        {fitting.filter(template => !holdsTemplate(engagement, capability, segment.segmentId, channelId, template)).map(template => (
                            <li key={template.id}>
                                <button
                                    type="button"
                                    className="notepad-suggestion"
                                    aria-label={"Add new " + template.label + " to " + what}
                                    onClick={() => {
                                        const made = withNewTemplateCost(engagement, capability, segment.segmentId, channelId, template);
                                        onWrite({ capability: made.capability, engagement: made.engagement });
                                    }}
                                >
                                    <span className="notepad-suggestion-label">{template.label}</span>
                                </button>
                            </li>
                        ))}
                        {/* What the company already has, in ONE list under one name: pointing at one says which channels it already serves. */}
                        {existingCosts.length > 0 && (
                            <li className="notepad-suggestion-group" role="group" aria-label="Existing Links">
                                <span className="notepad-suggestion-heading">Existing Links</span>
                                <ul>
                                    {existingCosts.map(existing => (
                                        <ExistingLink
                                            key={existing.id}
                                            name={existing.name}
                                            what={what}
                                            servedBy={servedBy(existing.id)}
                                            onLink={() => {
                                                onWrite({ engagement: withLinkedExistingCard(engagement, segment.segmentId, channelId, existing.id) });
                                            }}
                                        />
                                    ))}
                                </ul>
                            </li>
                        )}
                    </ul>
                </div>
            )}

        </div>
    );

}

/** One of the company's cards that can be linked: a bullet, its name in the default blue, and -- under the pointer -- the app's tooltip, 6px over the cursor, saying which channels it already serves. */
function ExistingLink({ name, what, servedBy, onLink }: { name: string; what: string; servedBy: string; onLink: () => void }) {
    const tip = useAboveTip<HTMLButtonElement>(servedBy);
    return (
        <li className="notepad-suggestion-existing-item">
            <button
                type="button"
                className="notepad-suggestion notepad-suggestion-existing"
                aria-label={"Link existing " + name + " to " + what}
                onClick={onLink}
                {...tip.props}
            >
                <span className="notepad-suggestion-label">{name}</span>
            </button>
            {tip.node}
        </li>
    );
}

function ChannelResourceCard({
    segment,
    channelId,
    engagement,
    capability,
    currency,
    disabled = false,
    onWrite,
    actionOrder,
    onIsolate,
    colour,
    onOpenCard,
    onOpenAction,
    lit,
    onLit,
    isolated,
    heading,
    link,
    card,
    label,
    onRemove
}: ChannelResourcesProps & {
    link: BusinessChannelResourceValue;
    card: CostCard;
    /** Its place in the resource palette (ActionOrder.ts: hue, then pattern). */
    colour: number;
    label: string;
    onRemove: () => void;
}) {

    const [adding, setAdding] = useState(false);
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const box = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (adding) {
            box.current?.focus();
        }
    }, [adding]);

    const text = (id: string) => segment.actions.find(action => action.id === id)?.text ?? "";
    // Every action of the Segment's table (any channel's, a shared one once), in the table's order.
    const tableActions = tableActionIds(actionPlacements(segment));
    const linkedActions = link.actionIds.filter(id => segment.actions.some(action => action.id === id));
    const wanted = query.replace(/^\s*#?\s*/, "").trim().toLowerCase();
    const typedNumber = /^\d+$/.test(wanted) ? Number(wanted) : undefined;
    // Found by its number in the table ("12" or "#12": the exact number first, then numbers
    // that start with it) or by its words.
    const ownActions = new Set(actionPlacements(segment).filter(entry => entry.channelId === channelId).map(entry => entry.actionId));
    const offered = tableActions
        .filter(id => !linkedActions.includes(id) && text(id).trim())
        .filter(id => text(id).toLowerCase().includes(wanted)
            || (typedNumber !== undefined && String(actionOrder(id, channelId) ?? "").startsWith(wanted)))
        // The number typed first, then THIS channel's own actions (in its stage order -- the table's), then the other channels' (in the table's order): what a resource of this channel is linked to is nearly always here.
        .sort((one, other) =>
            (Number(actionOrder(other, channelId) === typedNumber) - Number(actionOrder(one, channelId) === typedNumber))
            || (Number(ownActions.has(other)) - Number(ownActions.has(one))))
        .slice(0, 12);
    const isolating = isolated != null && isolated.segmentId === segment.segmentId;
    // Isolating this resource alone (from its card, or from an action linked only to it).
    const only = isolated?.kind === "resource" && isolating
        && isolated.resourceIds.length === 1 && isolated.resourceIds[0] === link.resourceId;
    const fromAction = isolated?.kind === "resource" && isolating ? isolated.fromActionId : undefined;
    const toggleOnly = (symbol?: HTMLElement) => onIsolate?.(
        only ? null : { kind: "resource", segmentId: segment.segmentId, resourceIds: [link.resourceId] },
        symbol
    );
    const cost = costCardAmountText(card, currency);
    const name = card.name;

    function linkAction(actionId: string) {
        onWrite({ engagement: withResourceAction(engagement, link.id, actionId, true) });
        setAdding(false);
        setQuery("");
    }

    function onKey(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowDown" && offered.length > 0) {
            consumeKey(event);
            setActive(index => (index + 1) % offered.length);
        } else if (event.key === "ArrowUp" && offered.length > 0) {
            consumeKey(event);
            setActive(index => (index - 1 + offered.length) % offered.length);
        } else if (event.key === "Enter") {
            consumeKey(event);
            if (offered[active]) {
                linkAction(offered[active]);
            }
        } else if (event.key === "Escape") {
            consumeKey(event);
            setAdding(false);
            setQuery("");
        }
    }

    const outerRemove = Boolean(heading);
    const row = (content: ReactNode) => outerRemove
        ? (
            <div className="business-channel-resource-row">
                {content}
                <button
                    type="button"
                    className="strategy-box-remove card-remove business-channel-resource-x"
                    aria-label={"Take " + label + " off the channel"}
                    title="Take it off the channel (and its card off Offering's Capability)"
                    disabled={disabled}
                    onClick={onRemove}
                >
                    ×
                </button>
            </div>
        )
        : content;

    return row(
        <div
            className={
                "business-channel-resource " + markTint("resource", colour) +
                (lit?.kind === "resources" && lit.ids.includes(link.id) ? " is-lit" : "")
            }
            data-channel-resource={link.id}
            onMouseEnter={() => onLit?.({ kind: "resources", ids: [link.id] })}
            onMouseLeave={() => onLit?.(null)}
            onFocus={() => onLit?.({ kind: "resources", ids: [link.id] })}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    onLit?.(null);
                }
            }}
        >

            <div className="business-channel-resource-head">
                {/* The Resource card's own name: renamed here, it is renamed there. */}
                <input
                    type="text"
                    className="interview-input business-channel-resource-name"
                    aria-label={label + " name"}
                    placeholder="Resource name"
                    disabled={disabled}
                    value={name}
                    onChange={(event) => onWrite({ capability: withRenamedCard(capability, card.id, event.target.value) })}
                />
                {!outerRemove && (
                    <button
                        type="button"
                        className="notepad-chip-remove business-channel-resource-remove"
                        aria-label={"Take " + label + " off the channel"}
                        title="Take it off the channel (and its card off Offering's Capability)"
                        disabled={disabled}
                        onClick={onRemove}
                    >
                        ×
                    </button>
                )}
            </div>

            {/* What it costs where it is recorded; a click opens it there. */}
            <div className="business-channel-resource-summary">
                <button
                    type="button"
                    className="business-channel-resource-cost"
                    title={card.place}
                    onClick={() => onOpenCard?.(card)}
                >
                    {cost || "No cost yet"}
                </button>
                {" · "}
                {linkedActions.length > 0
                    ? (
                        <button
                            type="button"
                            className="business-channel-resource-cost"
                            aria-pressed={Boolean(only)}
                            title={only ? "Show every action again" : "Show only the actions of this resource"}
                            onClick={(event) => toggleOnly(event.currentTarget)}
                        >
                            {linkedActions.length === 1 ? "action" : linkedActions.length + " actions"}
                        </button>
                    )
                    : <span>no actions</span>}
            </div>

            {linkedActions.length > 0 && (
                <ul className="notepad-chips business-channel-resource-actions" aria-label={"Actions of " + label}>
                    {linkedActions.map(actionId => (
                        <li key={actionId} className={"notepad-chip" + (fromAction === actionId ? " is-picked" : "")}>
                            <button
                                type="button"
                                className="notepad-chip-open"
                                title={"#" + (actionOrder(actionId, channelId) ?? "") + " " + text(actionId)}
                                aria-label={"#" + (actionOrder(actionId, channelId) ?? "") + " " + text(actionId)}
                                onClick={() => onOpenAction?.(actionId)}
                            >
                                <span className="notepad-chip-tag">
                                    <span className="notepad-chip-number">{"#" + (actionOrder(actionId, channelId) ?? "")}</span>
                                </span>
                                <span className="notepad-chip-description">{text(actionId)}</span>
                            </button>
                            <button
                                type="button"
                                className="notepad-chip-remove"
                                aria-label={"Unlink action " + text(actionId) + " from " + label}
                                disabled={disabled}
                                onClick={() => {
                                    onWrite({ engagement: withResourceAction(engagement, link.id, actionId, false) });
                                    UndoService.offer("Action unlinked.", () => onWrite({ engagement: withResourceAction(latestEngagement.current, link.id, actionId, true) }));
                                }}
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {isolating
                ? null
                : adding
                ? (
                    <div className="business-channel-cost-add">
                        <input
                            ref={box}
                            type="text"
                            className="interview-input"
                            aria-label={"Action for " + label + ": type # and its words"}
                            placeholder="# Action"
                            disabled={disabled}
                            value={query}
                            onChange={(event) => { setQuery(event.target.value); setActive(0); }}
                            onKeyDown={onKey}
                            onBlur={(event) => {
                                if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) {
                                    setAdding(false);
                                    setQuery("");
                                }
                            }}
                        />
                        <ul className="notepad-suggestions" role="listbox" aria-label="Actions to link">
                            {offered.length === 0 && <li className="notepad-suggestion-empty">No action of this table by that name or number</li>}
                            {offered.map((actionId, index) => (
                                <li key={actionId} role="option" aria-selected={index === active}>
                                    <button
                                        type="button"
                                        className="notepad-suggestion"
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => linkAction(actionId)}
                                    >
                                        <span className="notepad-suggestion-label">{"#" + (actionOrder(actionId, channelId) ?? "") + " " + text(actionId)}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            className="notepad-text-button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                                setAdding(false);
                                setQuery("");
                                ActionPickService.start(
                                    { linkId: link.id, what: name.trim() || label, segmentId: segment.segmentId, actionIds: tableActions },
                                    (actionId) => onWrite({ engagement: withResourceAction(latestEngagement.current, link.id, actionId, true) })
                                );
                            }}
                        >
                            Link an action
                        </button>
                    </div>
                )
                : (
                    <button
                        type="button"
                        className="notepad-text-button"
                        aria-label={"Link an action to " + label}
                        disabled={disabled}
                        onClick={() => setAdding(true)}
                    >
                        # Link an action
                    </button>
                )}

        </div>
    );

}

/**
 * "shared action" in a card shared into another channel's cell: a link (as
 * "# Link an action" is one) to that action's line in the table.
 */
function ViaActionLink({ words, order, text, onOpen }: { words: string; order: number | undefined; text: string; onOpen: () => void }) {
    return (
        <button
            type="button"
            className="notepad-text-button business-channel-via-link"
            title={"#" + (order ?? "") + (text ? " " + text : "")}
            aria-label={"Go to " + words + (order !== undefined && !words.startsWith("#") ? " #" + order : "") + (text ? ": " + text : "")}
            onClick={onOpen}
        >
            {words}
        </button>
    );
}

/* The engagement as it is when a picked action comes back. */
const latestEngagement: { current: BusinessEngagementValue } = { current: { segments: [], demand: {}, channelResources: [] } };

/** Keeps the engagement a picked action is linked into current. */
export function useLatestEngagement(engagement: BusinessEngagementValue): void {
    latestEngagement.current = engagement;
}
