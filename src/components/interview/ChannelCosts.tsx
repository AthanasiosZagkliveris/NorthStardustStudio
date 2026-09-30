import { KeyboardEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
    type CostCard,
    channelCostLinks,
    channelCostSummary,
    costCardAmountText,
    costCardName,
    findCostCards,
    withChannelCost,
    withoutChannelCost
} from "../../framework/engine/ChannelCosts.ts";
import type { BusinessEngagementValue } from "../../framework/engine/AnswerUtils.ts";
import { UndoService } from "../../services/UndoService";
import { consumeKey } from "./consumeKey.ts";
import { CostPickService } from "./costPick.ts";

import "../../styles/notepad.css";

/*
    A CHANNEL'S COSTS (ChannelCosts.ts), in its cell of the Customer
    Channel table: the cost cards linked to it as chips -- the Notepad's
    chips: "# 3.1.2", the card's name and what it costs -- a summary
    line, and "+ Add cost", which links one by name ("#", as a note
    does), makes one ("Create a cost …"), or picks one on 3.
    Infrastructure & Capability.
*/

export interface ChannelCostsProps {
    segmentId: string;
    /** A channel's id, or its category's row (categoryChannelKey). */
    channelKey: string;
    /** "Channel 3" or "Channel Category Social Media", for its controls' names. */
    what: string;
    /** The anchors that lead back here from the other page. */
    returnTo: string[];
    engagement: BusinessEngagementValue;
    cards: readonly CostCard[];
    currency: string;
    disabled?: boolean;
    onEngagement: (next: BusinessEngagementValue) => void;
    /** "# 3.1.2": where a card is, in numbers. */
    numberOf: (card: CostCard) => string;
    /** Makes a cost card of that name on 3. Infrastructure & Capability; its id, or null. */
    onCreate?: (name: string) => string | null;
    /** Opens a cost card. */
    onOpen?: (card: CostCard) => void;
    /** Opens 3. Infrastructure & Capability to pick a card. */
    onPick?: () => void;
}

export default function ChannelCosts({
    segmentId,
    channelKey,
    what,
    returnTo,
    engagement,
    cards,
    currency,
    disabled = false,
    onEngagement,
    numberOf,
    onCreate,
    onOpen,
    onPick
}: ChannelCostsProps) {

    const linked = channelCostLinks(engagement, segmentId, channelKey, cards);
    const summary = channelCostSummary(linked, currency);

    const [adding, setAdding] = useState(false);
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const box = useRef<HTMLInputElement | null>(null);

    /* The engagement and writer as they are now, for an undo offered a moment ago. */
    const latest = useRef({ engagement, onEngagement });
    latest.current = { engagement, onEngagement };

    useEffect(() => {
        if (adding) {
            box.current?.focus();
        }
    }, [adding]);

    /* What "#…" names: the cards not linked here yet, then "Create a cost". */
    const wanted = query.replace(/^#/, "").trim();
    const free = cards.filter(card => !linked.some(entry => entry.card.id === card.id));
    const matches = findCostCards(free, wanted);
    const exact = cards.some(card => costCardName(card).toLowerCase() === wanted.toLowerCase());
    const canCreate = !!onCreate && wanted.length > 0 && !exact;
    const options = [
        ...matches.map(card => ({ kind: "card" as const, card })),
        ...(canCreate ? [{ kind: "create" as const }] : [])
    ];

    function close() {
        setAdding(false);
        setQuery("");
        setActive(0);
    }

    function link(costId: string) {
        onEngagement(withChannelCost(engagement, segmentId, channelKey, costId));
        close();
    }

    function choose(index: number) {
        const option = options[index];
        if (!option) {
            return;
        }
        if (option.kind === "card") {
            link(option.card.id);
            return;
        }
        const id = onCreate?.(wanted) ?? null;
        if (id) {
            link(id);
        }
    }

    function onKey(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "ArrowDown" && options.length > 0) {
            consumeKey(event);
            setActive(index => (index + 1) % options.length);
        } else if (event.key === "ArrowUp" && options.length > 0) {
            consumeKey(event);
            setActive(index => (index - 1 + options.length) % options.length);
        } else if (event.key === "Enter") {
            consumeKey(event);
            choose(active);
        } else if (event.key === "Escape") {
            consumeKey(event);
            close();
        }
    }

    return (
        <div className="business-channel-costs">

            {linked.length > 0 && (
                <ul className="notepad-chips business-channel-cost-chips" aria-label={"Costs of " + what}>
                    {linked.map(({ link: entry, card, shared }) => (
                        <li key={entry.id} className="notepad-chip">
                            <button
                                type="button"
                                className="notepad-chip-open"
                                title={card.place}
                                onClick={() => onOpen?.(card)}
                            >
                                <span className="notepad-chip-tag">
                                    # <span className="notepad-chip-number">{numberOf(card)}</span>
                                </span>
                                <span className="notepad-chip-description">
                                    {costCardName(card)}
                                    {costCardAmountText(card, currency) && " · " + costCardAmountText(card, currency)}
                                    {shared && " (shared)"}
                                </span>
                            </button>
                            <button
                                type="button"
                                className="notepad-chip-remove"
                                aria-label={"Unlink cost " + costCardName(card) + " from " + what}
                                disabled={disabled}
                                onClick={() => {
                                    onEngagement(withoutChannelCost(engagement, entry.id));
                                    // The link back, into the page as it is then.
                                    UndoService.offer("Cost " + costCardName(card) + " unlinked.", () => {
                                        const now = latest.current;
                                        now.onEngagement(withChannelCost(now.engagement, segmentId, channelKey, card.id));
                                    });
                                }}
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {summary && <p className="business-channel-cost-summary">{summary}</p>}

            {adding
                ? (
                    <div className="business-channel-cost-add">
                        <input
                            ref={box}
                            type="text"
                            className="interview-input"
                            aria-label={"Cost for " + what + ": type # and a cost's name"}
                            placeholder="# Cost name"
                            disabled={disabled}
                            value={query}
                            onChange={(event) => { setQuery(event.target.value); setActive(0); }}
                            onKeyDown={onKey}
                            onBlur={(event) => {
                                if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) {
                                    close();
                                }
                            }}
                        />
                        {wanted.length > 0 || query.startsWith("#")
                            ? (
                                <ul className="notepad-suggestions" role="listbox" aria-label="Costs to link">
                                    {options.length === 0 && <li className="notepad-suggestion-empty">No cost by that name</li>}
                                    {options.map((option, index) => (
                                        <li key={option.kind === "card" ? option.card.id : "create"} role="option" aria-selected={index === active}>
                                            <button
                                                type="button"
                                                className="notepad-suggestion"
                                                onMouseDown={(event) => event.preventDefault()}
                                                onClick={() => choose(index)}
                                            >
                                                {option.kind === "card"
                                                    ? (
                                                        <>
                                                            <span className="notepad-suggestion-label">#{costCardName(option.card)}</span>
                                                            <span className="notepad-suggestion-place">
                                                                {[costCardAmountText(option.card, currency), option.card.place].filter(Boolean).join(" · ")}
                                                            </span>
                                                        </>
                                                    )
                                                    : (
                                                        <>
                                                            <span className="notepad-suggestion-label">{"Create a cost “" + wanted + "”"}</span>
                                                            <span className="notepad-suggestion-place">A new Resource at Costs under 3. Infrastructure &amp; Capability</span>
                                                        </>
                                                    )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )
                            : null}
                        {onPick && (
                            <button
                                type="button"
                                className="notepad-text-button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                    close();
                                    CostPickService.start({ segmentId, channelKey, channelName: what, returnTo });
                                    onPick();
                                }}
                            >
                                Pick a cost card
                            </button>
                        )}
                    </div>
                )
                : (
                    <div className="business-step-add-row">
                        <button
                            type="button"
                            className="strategy-add-button"
                            aria-label={"Add cost for " + what}
                            disabled={disabled}
                            onClick={() => setAdding(true)}
                        >
                            + Add cost
                        </button>
                    </div>
                )}

        </div>
    );

}

/**
 * The card chosen on the other page, linked once the channel's page is
 * back (CostPickService). Called by the page with its value and writer.
 */
export function usePickedCost(engagement: BusinessEngagementValue, onEngagement: (next: BusinessEngagementValue) => void): void {
    useEffect(() => {
        const picked = CostPickService.takePending();
        if (picked) {
            onEngagement(withChannelCost(engagement, picked.segmentId, picked.channelKey, picked.costId));
        }
        // Once, as the page opens.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
}

/**
 * PICKING A COST CARD (CostPickService): on 3. Infrastructure &
 * Capability, while a channel waits for one, a banner says so, the
 * cost cards light up under the pointer, and a click links the one
 * under it -- editing nothing -- and goes back to the channel. Escape
 * goes back without one.
 */
export function CostPicker({ cards, onReturn }: {
    cards: readonly CostCard[];
    /** Back to the channel's page, at these anchors. */
    onReturn?: (anchors: string[]) => void;
}) {

    const pick = useSyncExternalStore(CostPickService.subscribe, CostPickService.current, CostPickService.current);
    const ids = cards.map(card => card.anchors[0]).join(" ");

    useEffect(() => {

        if (!pick) {
            return;
        }

        const root = document.documentElement;
        root.classList.add("cost-picking");
        const candidates = new Map<HTMLElement, string>();
        const mark = () => {
            for (const card of cards) {
                const element = document.querySelector<HTMLElement>('[data-anchor~="' + card.anchors[0].replace(/["\\]/g, "") + '"]');
                if (element && !candidates.has(element)) {
                    element.setAttribute("data-cost-pick", "");
                    candidates.set(element, card.id);
                }
            }
        };
        mark();
        const observer = new MutationObserver(mark);
        observer.observe(document.body, { childList: true, subtree: true });
        let hovered: HTMLElement | null = null;

        const target = (event: Event): HTMLElement | null => {
            const element = event.target as HTMLElement | null;
            if (!element || element.closest(".cost-pick-banner")) {
                return null;
            }
            // The innermost cost card under the pointer.
            for (let at = element.closest<HTMLElement>("[data-cost-pick]"); at; at = at.parentElement?.closest<HTMLElement>("[data-cost-pick]") ?? null) {
                if (candidates.has(at)) {
                    return at;
                }
            }
            return null;
        };

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
            const element = target(event);
            if (!element) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            const back = CostPickService.choose(candidates.get(element)!);
            onReturn?.(back);
        };
        const onKey = (event: globalThis.KeyboardEvent) => {
            if (event.key === "Escape") {
                consumeKey(event);
                const back = CostPickService.cancel();
                onReturn?.(back);
            }
        };

        document.addEventListener("mouseover", onOver, true);
        document.addEventListener("mousedown", onPress, true);
        document.addEventListener("click", onClick, true);
        window.addEventListener("keydown", onKey, true);

        return () => {
            observer.disconnect();
            root.classList.remove("cost-picking");
            hovered?.removeAttribute("data-pick-hover");
            candidates.forEach((_id, element) => element.removeAttribute("data-cost-pick"));
            document.removeEventListener("mouseover", onOver, true);
            document.removeEventListener("mousedown", onPress, true);
            document.removeEventListener("click", onClick, true);
            window.removeEventListener("keydown", onKey, true);
        };

        // The cards by their anchors: a new list of the same cards is the same pick.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pick, ids]);

    if (!pick) {
        return null;
    }

    return (
        <div className="notepad-pick-banner cost-pick-banner" role="status">
            {"Click a cost card to link it to " + pick.channelName + " · Esc to cancel"}
        </div>
    );

}
