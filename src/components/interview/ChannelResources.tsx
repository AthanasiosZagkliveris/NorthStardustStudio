import { KeyboardEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
    type CostCard,
    channelCostSummary,
    channelResourceLinks,
    costCardAmountText,
    sharedResourceLinks,
    costCardName,
    withNewChannelResource,
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

import "../../styles/notepad.css";

/*
    A CHANNEL'S RESOURCES (ChannelResources.ts), in its cell of the
    Customer Channel table: each a small card -- its name (the name of
    its Resource card on 3. Infrastructure & Capability, one name), what
    it costs there ("£150 a month", or "No cost yet"), which opens that
    card, and the channel's actions it serves, linked as a note links a
    place: "#" and an action's words, or "Link an action" and a click on
    one in the table; each a Notepad chip. Then "+ Add resource", which
    makes the Resource card and links it, and the channel's summary line.
*/

/* ---------- Picking an action in the table (as a note picks a field) ---------- */

interface ActionPick {
    linkId: string;
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
            return line && (line.dataset.fieldId ?? "").startsWith("action") ? line : null;
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
    /** "3.2.1.5": where an action is, as a note's chip numbers it. */
    actionNumber: (actionId: string) => string;
    /** Opens the resource's card on 3. Infrastructure & Capability. */
    onOpenCard?: (card: CostCard) => void;
    /** Goes to an action's line in the table. */
    onOpenAction?: (actionId: string) => void;
}

export default function ChannelResources(props: ChannelResourcesProps) {

    const { segment, channelId, what, engagement, capability, cards, currency, disabled = false, onWrite } = props;

    const linked = channelResourceLinks(engagement, segment.segmentId, channelId, cards);
    // Made on other channels, serving this one through an action it shares.
    const shared = sharedResourceLinks(engagement, segment.segmentId, channelId, cards);
    const summary = channelCostSummary([...linked, ...shared].map(entry => entry.card), currency, shared.length > 0);
    const channelName = (id: string) => {
        const channel = segment.channels.find(entry => entry.id === id);
        return channel ? [channel.category, channel.name.trim() || "Unnamed channel"].filter(Boolean).join(" › ") : "another channel";
    };

    /* The page as it is now, for an undo offered a moment ago. */
    const latest = useRef({ engagement, capability, onWrite });
    latest.current = { engagement, capability, onWrite };

    return (
        <div className="business-channel-resources">

            {linked.map(({ link, card }, index) => (
                <ChannelResourceCard
                    key={link.id}
                    {...props}
                    link={link}
                    card={card}
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

            {shared.length > 0 && (
                <ul className="notepad-chips business-channel-resources-shared" aria-label={"Resources serving " + what + " through shared actions"}>
                    {shared.map(({ link, card }) => (
                        <li key={link.id} className="notepad-chip">
                            <button
                                type="button"
                                className="notepad-chip-open"
                                title={"Created on " + channelName(link.channelId)}
                                onClick={() => props.onOpenCard?.(card)}
                            >
                                <span className="notepad-chip-tag">{costCardName(card)}</span>
                                <span className="notepad-chip-description">
                                    {(costCardAmountText(card, currency) || "No cost yet") + " · via shared action"}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {summary && <p className="business-channel-cost-summary">{summary}</p>}

            <div className="business-step-add-row">
                <button
                    type="button"
                    className="strategy-add-button"
                    aria-label={"Add resource for " + what}
                    disabled={disabled}
                    onClick={() => {
                        const made = withNewChannelResource(engagement, capability, segment.segmentId, channelId);
                        onWrite({ capability: made.capability, engagement: made.engagement });
                        window.setTimeout(() => document
                            .querySelector<HTMLTextAreaElement>('[data-channel-resource="' + made.link.id + '"] .business-channel-resource-name')
                            ?.focus(), 0);
                    }}
                >
                    + Add resource
                </button>
            </div>

        </div>
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
    actionNumber,
    onOpenCard,
    onOpenAction,
    link,
    card,
    label,
    onRemove
}: ChannelResourcesProps & {
    link: BusinessChannelResourceValue;
    card: CostCard;
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
    // This channel's actions, every row of it (a shared one too), each once.
    const channel = segment.channels.find(candidate => candidate.id === channelId);
    const channelActions = [...new Set(Object.values(channel?.actionIds ?? {}).flat())];
    const linkedActions = link.actionIds.filter(id => segment.actions.some(action => action.id === id));
    const wanted = query.replace(/^#/, "").trim().toLowerCase();
    const offered = channelActions
        .filter(id => !linkedActions.includes(id) && text(id).trim())
        .filter(id => text(id).toLowerCase().includes(wanted))
        .slice(0, 8);
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

    return (
        <div className="business-channel-resource" data-channel-resource={link.id}>

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
                <button
                    type="button"
                    className="notepad-chip-remove business-channel-resource-remove"
                    aria-label={"Take " + label + " off the channel"}
                    title="Take it off the channel (and its card off Infrastructure & Capability)"
                    disabled={disabled}
                    onClick={onRemove}
                >
                    ×
                </button>
            </div>

            {/* What it costs where it is recorded; a click opens it there. */}
            <button
                type="button"
                className="business-channel-resource-cost"
                title={card.place}
                onClick={() => onOpenCard?.(card)}
            >
                {(cost || "No cost yet") + " · " + linkedActions.length + (linkedActions.length === 1 ? " action" : " actions")}
            </button>

            {linkedActions.length > 0 && (
                <ul className="notepad-chips business-channel-resource-actions" aria-label={"Actions of " + label}>
                    {linkedActions.map(actionId => (
                        <li key={actionId} className="notepad-chip">
                            <button type="button" className="notepad-chip-open" onClick={() => onOpenAction?.(actionId)}>
                                <span className="notepad-chip-tag">
                                    # <span className="notepad-chip-number">{actionNumber(actionId)}</span>
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

            {adding
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
                            {offered.length === 0 && <li className="notepad-suggestion-empty">No action of this channel by that name</li>}
                            {offered.map((actionId, index) => (
                                <li key={actionId} role="option" aria-selected={index === active}>
                                    <button
                                        type="button"
                                        className="notepad-suggestion"
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => linkAction(actionId)}
                                    >
                                        <span className="notepad-suggestion-label">#{text(actionId)}</span>
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
                                    { linkId: link.id, what: name.trim() || label, segmentId: segment.segmentId },
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

/* The engagement as it is when a picked action comes back. */
const latestEngagement: { current: BusinessEngagementValue } = { current: { segments: [], demand: {}, channelResources: [] } };

/** Keeps the engagement a picked action is linked into current. */
export function useLatestEngagement(engagement: BusinessEngagementValue): void {
    latestEngagement.current = engagement;
}
