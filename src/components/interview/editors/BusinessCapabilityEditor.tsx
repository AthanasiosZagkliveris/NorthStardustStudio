import { toneHue } from "../tiles/CardTile.tsx";
import CardShell from "../cards/CardShell.tsx";
import AddButton from "../../controls/AddButton.tsx";
import { StackUnderContext } from "../tiles/DialogLevels.tsx";
import LegalEntityEditor from "./LegalEntityEditor.tsx";
import { withoutCards } from "../../../framework/engine/GeneratedCards.ts";
import { CSSProperties, useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { freshCards } from "../cards/freshCards.ts";
import { BUSINESS_CAPABILITY_SECTIONS, BusinessActivityValue, stableCardHue } from "../../../framework/engine/AnswerUtils.ts";
import { MissingMapContext } from "../cards/BusinessCardFields.tsx";
import { asFinancialFoundationValue, moneyFormatter } from "../../../framework/engine/FinancialModel.ts";
import { inventoryClassification } from "../../../framework/engine/InventoryClassification.ts";
import { railId } from "../rails/railItems.ts";
import CardBoxes, { CardBox } from "../cards/CardBoxes.tsx";
import SectionTiles, { SQUEEZED_ROW_MIN, CHANNEL_TILE_HUE, otherColumn, FloatingCards, SectionTile } from "../tiles/SectionTiles.tsx";
import CardTitleHelp from "../cards/CardTitleHelp.tsx";
import CapabilityOverview from "../tiles/CapabilityOverview.tsx";
import { SECTIONS } from "./BusinessCapabilityModel.ts";
import "../../../styles/system-confirmation.css";
import "../../../styles/delivery.css";
import "../../../styles/page-3-edges.css";
import type { BusinessCapabilityEditorProps } from "./capability/types.ts";
import { useCapabilityState } from "./capability/useCapabilityState.tsx";
import { useCapabilityCardFields } from "./capability/useCapabilityCardFields.tsx";
import { useCapabilityPeopleCards } from "./capability/useCapabilityPeopleCards.tsx";
import { useCapabilityActivityAndDelivery } from "./capability/useCapabilityActivityAndDelivery.tsx";
import { useCapabilitySections } from "./capability/useCapabilitySections.tsx";

/**
 * The Business System's Infrastructure & Capability section (see
 * AnswerType.BusinessCapability).
 *
 * Two sections holding the same three subsections: what the
 * ORGANIZATION needs to exist and operate, and what each OFFERING
 * needs on top of that.
 *
 * The three subsections are not three lists. A resource that is
 * "Provided" needs a provider under the third; one that needs
 * making or looking into creates an activity under the second; an
 * activity's responsible founder collects its name under their own
 * Responsibilities in the first. The page is wired to itself, and
 * that wiring is most of what it is for.
 */
export default function BusinessCapabilityEditor(props: BusinessCapabilityEditorProps) {

    const part1 = useCapabilityState(props);
    const part2 = { ...part1, ...useCapabilityCardFields({ ...part1 }) };
    const part3 = { ...part1, ...part2, ...useCapabilityPeopleCards({ ...part1, ...part2 }) };
    const part4 = { ...part1, ...part2, ...part3, ...useCapabilityActivityAndDelivery({ ...part1, ...part2, ...part3 }) };
    const part5 = { ...part1, ...part2, ...part3, ...part4, ...useCapabilitySections({ ...part1, ...part2, ...part3, ...part4 }) };
    const { activityBox, activityCardFor, capability, cardLinks, cards, channelToneIds, childCard, columnsDivider, completedActivities, disabled, discard, financialFoundation, floor, foldingGroup, founderCard, founders, foundersProfile, globalSettings, helpOpen, legalEntity, legalEntityFounders, legalEntityPrefill, legalExpenses, legalUnder, missingById, namesOf, onChangeLegalEntity, openLegalExpense, openingDate, organisationCurrency, pair, parentCard, pending, setCategoryActivities, setHelpOpen, setLegalUnder, setPair, setPending, showInstructions, update, write } = part5;

    // THE INVENTORY AND COMPLETED ROW stands IN THE FOOTER'S BAND (level with the Back link), centred under the two cards, so the cards keep all the room above it; the row takes no room
    // of its own in the page. Where the cards are stacked (a narrow window) it follows them and is squeezed into the room the window leaves (never under SQUEEZED_ROW_MIN, never over 215px).
    useLayoutEffect(() => {
        const squeeze = () => {
            const row = document.querySelector<HTMLElement>(".section-tiles-completed");
            if (!row) {
                return;
            }
            const tiles = row.querySelector<HTMLElement>(".section-tiles");
            const footerBox = document.querySelector<HTMLElement>(".workspace-footer")?.getBoundingClientRect();
            const footer = footerBox?.height ?? 64;
            const cards = [...document.querySelectorAll<HTMLElement>(".answer-columns.business-capability > .business-foundation-card")];
            const stacked = cards.length > 1 && Math.abs(cards[0].getBoundingClientRect().left - cards[1].getBoundingClientRect().left) < 4;
            let side: number;
            if (!stacked && footerBox && tiles) {
                side = Math.min(SQUEEZED_ROW_MIN, Math.round(footer - 8));
                row.style.height = "0";
                row.style.overflow = "visible";
                tiles.style.transform = "";
                const top = row.getBoundingClientRect().top;
                tiles.style.position = "relative";
                tiles.style.zIndex = "40";
                tiles.style.transform = "translateY(" + Math.round(footerBox.top + (footer - side) / 2 - top) + "px)";
            } else {
                row.style.height = "";
                row.style.overflow = "";
                if (tiles) {
                    tiles.style.transform = "";
                    tiles.style.position = "";
                    tiles.style.zIndex = "";
                }
                const room = window.innerHeight - row.getBoundingClientRect().top - footer - 12;
                // (Square, 215px, while the window has the room; the height alone gives way when it has not, so the tiles become rectangles.)
                side = Math.round(Math.max(SQUEEZED_ROW_MIN, Math.min(215, room)));
            }
            row.style.setProperty("--section-tile-size", side + "px");
            // (Squeezed under what a list needs, the tiles keep their titles.)
            if (side < 150) {
                row.setAttribute("data-squeezed", "");
            } else {
                row.removeAttribute("data-squeezed");
            }
        };
        squeeze();
        const later = window.setTimeout(squeeze, 300);
        window.addEventListener("resize", squeeze);
        // (The cards above give the row its room: measured again when they have their size.)
        window.addEventListener("tiles-fit", squeeze);
        return () => {
            window.clearTimeout(later);
            window.removeEventListener("resize", squeeze);
            window.removeEventListener("tiles-fit", squeeze);
        };
    });
    /**
     * WHAT A CARD TILE SAYS (CardTile.tsx -- the same lines as in Inventory): where the card belongs, its status and its cost, its links as circles, the
     * colour of its section. Read from the floor's rows, so the grids of cards and the overlay can never differ.
     */
    // (A card just made and still open is not flagged: the floor reads freshCards, and this renders again when that changes.)
    useSyncExternalStore(freshCards.subscribe, freshCards.snapshot);
    function completedBoxes(group: { id: string; list: BusinessActivityValue[]; done: BusinessActivityValue[] }, first = 1) {
        return group.done.map((activity, position) => activityBox(
            "infrastructure",
            activity,
            first + position,
            (patch) => setCategoryActivities(group.id, group.list.map(entry => entry.id === activity.id ? { ...entry, ...patch } : entry)),
            () => setCategoryActivities(group.id, group.list.filter(entry => entry.id !== activity.id))
        ));
    }
    /**
     * THE "ALL TILES" TILE, beside Completed (outside both sections, under Offering's Capability's card): its dialog lists every Resource, Activity,
     * Partner, Provider, the Workspace, the Founders and the Legal Entity's expenses as tiles (or a table), with filters (CapabilityOverview). A tile of
     * it opens its card floating, as every card does.
     */
    function overviewTile(): SectionTile {
        const rows = floor;
        // (A card that lacks a required answer is counted nowhere.)
        const counts = (kinds: string[]) => rows.filter(row => kinds.includes(row.kind) && !row.missing).length;
        return {
            id: "overview",
            title: "Inventory",
            anchor: "section-overview",
            items: [
                counts(["resource", "workspace", "founder"]) + " resources",
                counts(["activity"]) + " activities",
                counts(["partner", "provider"]) + " partners & suppliers"
            ],
            // (A line is red, and the tile glows, while a card of its kind lacks an answer.)
            itemAlerts: [["resource", "workspace", "founder"], ["activity"], ["partner", "provider"]]
                .map(kinds => floor.filter(row => kinds.includes(row.kind) && row.missing).flatMap(row => row.missing!))
                .map(lacking => lacking.length > 0 ? lacking : undefined),
            isChannelCard: (cardId: string) => channelToneIds.has(cardId),
            // (A card floats in the hue of its tile: Infrastructure's, Offering's, a channel's.)
            hueFor: (cardId: string) => {
                const row = rows.find(entry => entry.id === cardId);
                return row && row.tone !== "legal" ? toneHue(row.tone) : undefined;
            },
            kindFor: () => "card",
            cardFor: (cardId: string) => {
                const index = founders.findIndex(founder => founder.id === cardId);
                if (index >= 0) {
                    return founderCard(founders[index], index, true);
                }
                return parentCard(cardId)?.node ?? childCard(cardId)?.node ?? null;
            },
            content: () => {
                const classes = inventoryClassification(
                    capability, legalEntityFounders, legalExpenses, asFinancialFoundationValue(financialFoundation), organisationCurrency, openingDate, globalSettings
                );
                return <CapabilityOverview rows={rows.map(row => ({ ...row, ...(classes.get(row.id) ?? classes.get("salary-" + row.id) ?? classes.get("legal-" + row.id)) }))} format={moneyFormatter(organisationCurrency)} currency={organisationCurrency} onOpenLegal={legalEntity !== undefined && onChangeLegalEntity ? (id: string) => openLegalExpense(id) : undefined} />;
            }
        };
    }
    /**
     * THE ONE COMPLETED TILE, outside both sections, under Offering's Capability's card: every activity ticked Completed, Infrastructure's (by category) then
     * Offering's. Ticking Completed files an activity here, un-ticking returns it to its own tile. A card of it floats frozen. It exists only while an
     * activity is completed.
     */
    function completedTile(): SectionTile | null {
        const groups = completedActivities();
        const offeringDone = capability.offering.activities.filter(activity => activity.completed);
        const all = [...groups.flatMap(group => group.done), ...offeringDone];
        if (all.length === 0) {
            return null;
        }
        const setOffering = (next: BusinessActivityValue[]) => update({ offering: { ...capability.offering, activities: next } });
        let first = 1;
        const boxes: CardBox[] = [];
        for (const group of groups) {
            const made = completedBoxes(group, first);
            first += made.length;
            boxes.push(...made);
        }
        offeringDone.forEach((activity, position) => boxes.push(activityBox(
            "offering",
            activity,
            first + position,
            (patch) => setOffering(capability.offering.activities.map(entry => entry.id === activity.id ? { ...entry, ...patch } : entry)),
            () => setOffering(capability.offering.activities.filter(entry => entry.id !== activity.id))
        )));
        return {
            id: "completed",
            title: "Completed",
            // (A completed card floats under its own kind's title, as every activity does: not under the tile's.)
            group: "Activities",
            completed: true,
            anchor: "section-completed",
            holds: all.map(activity => activity.id),
            items: namesOf(all, "Unnamed Activity"),
            itemAlerts: all.map(activity => missingById.get(activity.id)),
            links: cardLinks(all),
            // (The hue of the section the activity belongs to.)
            hueFor: (cardId: string) => stableCardHue(groups.some(entry => entry.list.some(activity => activity.id === cardId)) ? "infrastructure" : "offering-capability"),
            // (A card stays open when its Completed tick is taken off: it goes back to its own tile.)
            cardFor: (cardId: string) => {
                const group = groups.find(entry => entry.list.some(activity => activity.id === cardId));
                return group
                    ? activityCardFor("infrastructure", group.list, (next) => setCategoryActivities(group.id, next), cardId)
                    : activityCardFor("offering", capability.offering.activities, setOffering, cardId);
            },
            content: () => foldingGroup(
                "fold-completed",
                "Completed",
                "Completed",
                undefined,
                "business-capability-column",
                () => <CardBoxes label="Completed activities" what="Activity" className="card-boxes-completed" items={boxes} />,
                false
            )
        };
    }
    /* ---------- The page ---------- */

    const heads = [
        {
            number: 1,
            title: "Infrastructure",
            instructions: SECTIONS.infrastructure.instructions,
            note: SECTIONS.infrastructure.note
        },
        {
            number: 2,
            title: "Offering's Capability",
            instructions: SECTIONS.offering.instructions,
            note: SECTIONS.offering.note
        }
    ];
    const completed = completedTile();
    const overview = overviewTile();
    /** Each card of a pair keeps its own colour: the Offering's, Infrastructure's or a channel's teal. */
    const offeringOwns = (id: string) => capability.offering.activities.some(entry => entry.id === id) || capability.offering.professionals.some(entry => entry.id === id) ||
        capability.offering.providers.some(entry => entry.id === id) || capability.offering.resources.some(entry => entry.id === id);
    const pairHue = (id: string) => channelToneIds.has(id) ? CHANNEL_TILE_HUE : stableCardHue(offeringOwns(id) ? "offering-capability" : "infrastructure");
    const pairParent = pair ? parentCard(pair.parentId) : null;
    // (The card below may be any card: an activity or a partner, and also a founder or a resource -- what a Performer, a Responsible or a Resource row of an activity leads to.)
    const pairChild = pair ? childCard(pair.childId) ?? parentCard(pair.childId) : null;
    const legalParent = legalUnder ? parentCard(legalUnder) : null;
    const stackUnder = legalUnder && legalParent ? { item: { key: legalUnder, caption: legalParent.caption, kind: legalParent.kind, node: legalParent.node, hue: pairHue(legalUnder) }, clear: () => setLegalUnder(null) } : null;
    useEffect(() => {
        if (pair && (!pairParent || !pairChild)) {
            setPair(null);
        }
    }, [pair, pairParent, pairChild]);
    return (

        <MissingMapContext.Provider value={missingById}>
        {legalEntity !== undefined && onChangeLegalEntity && (
            <StackUnderContext.Provider value={stackUnder}>
                <LegalEntityEditor value={legalEntity} onChange={onChangeLegalEntity} prefill={legalEntityPrefill} foundersProfile={foundersProfile} openingDate={openingDate} asTiles cardsOnly disabled={disabled} />
            </StackUnderContext.Provider>
        )}
        {pending && (
            <div className="confirmation-overlay" onClick={() => setPending(null)}>
                <div className="confirmation-dialog" role="alertdialog" aria-modal="true" aria-label="Remove the card made for this one?" onClick={(event) => event.stopPropagation()}>
                    <h2 className="confirmation-title">This change leaves {pending.orphans.length === 1 ? "a card" : "cards"} with no use.</h2>
                    <p className="confirmation-question">
                        {pending.orphans.map(card => "“" + card.name + "”").join(", ")} {pending.orphans.length === 1 ? "was" : "were"} made for this card and no other card is linked to {pending.orphans.length === 1 ? "it" : "them"}. If you continue, {pending.orphans.length === 1 ? "it is" : "they are"} removed.
                    </p>
                    <div className="confirmation-actions">
                        <AddButton look="confirmation-button secondary"
                            autoFocus
                            onClick={() => setPending(null)}>Cancel</AddButton>
                        <AddButton look="confirmation-button danger"
                            onClick={() => { const { next, orphans, after } = pending; setPending(null); write(withoutCards(next, orphans.map(card => card.id))); after?.(); }}>Continue</AddButton>
                    </div>
                </div>
            </div>
        )}
        <div
            className="answer-columns business-foundation business-engagement business-capability"
            style={{ "--answer-column-count": 2 } as CSSProperties}
        >

            {columnsDivider && (
                <div className="answer-columns-divider">
                    {columnsDivider}
                </div>
            )}

            {/* One card per section, each in its own colour -- the same card Pages
                1 and 2 use. The column title is the card's one label, its first row
                (no fold arrow, no second label), with the arrow that drops its
                guidance down over the card; nothing in the card folds: the tiles
                are the grouping. */}
            {cards.map((card, cardIndex) => {

                const head = heads[cardIndex];

                return (
                    <CardShell
                        
                        key={card.id}
                        data-anchor={"capability-" + card.id}
                        data-rail={railId(BUSINESS_CAPABILITY_SECTIONS[cardIndex])}
                        style={{
                            "--strategy-theme-hue": stableCardHue(card.id)
                        } as CSSProperties}
                    >

                        <CardTitleHelp
                            number={head.number}
                            title={head.title}
                            lines={head.instructions}
                            enabled={showInstructions}
                            open={helpOpen === head.number}
                            onToggle={() => setHelpOpen(current => current === head.number ? null : head.number)}
                            onClose={() => setHelpOpen(null)}
                        />

                        {/* The title row stays; this body scrolls on its own (conversation.css,
                            "Page 3 scrolls in its cards"). */}
                        <div className="card-scroll">
                            {card.body()}
                        </div>

                    </CardShell>
                );

            })}

            {/* THE ONE COMPLETED TILE: outside both sections, under Offering's Capability's card (its floating cards stand over that card). */}
            <div className="section-tiles-completed" data-anchor="section-completed-tile">
                <SectionTiles
                    incomplete={missingById}
                    blank={discard}
                    label="Inventory"
                    hue={stableCardHue("offering-capability")}
                    tiles={completed ? [overview, completed] : [overview]}
                />
            </div>

            {pair && pairParent && pairChild && (
                <FloatingCards
                    pair
                    anchor={otherColumn(document.querySelector<HTMLElement>('[data-anchor="capability-' + (pairParent.scope === "offering" ? "offering-capability" : "infrastructure") + '"]'))}
                    // (A pair that holds a card in the channel's colour -- one a channel made, or the Partner / Provider / activity it generated -- is teal throughout.)
                    hue={channelToneIds.has(pair.parentId) || channelToneIds.has(pair.childId) ? CHANNEL_TILE_HUE : stableCardHue(pairParent.scope === "offering" ? "offering-capability" : "infrastructure")}
                    label={pair.alone ? pairChild.caption : pairParent.caption + " and " + pairChild.caption}
                    attrs={{ "data-pair": pair.parentId }}
                    cards={[
                        ...(pair.alone ? [] : [{ key: pair.parentId, caption: pairParent.caption, kind: pairParent.kind, node: pairParent.node, hue: pairHue(pair.parentId) }]),
                        { key: pair.childId, caption: pairChild.caption, kind: pairChild.kind ?? "card", node: pairChild.node, hue: pairHue(pair.childId) }
                    ]}
                    onClose={() => setPair(null)}
                />
            )}

        </div>
        </MissingMapContext.Provider>

    );

}
