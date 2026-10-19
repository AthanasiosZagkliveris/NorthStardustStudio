import AddButton from "../AddButton.tsx";
import { CSSProperties, ReactNode, useContext, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { freshCards } from "./freshCards.ts";
import { cardNameOf } from "./cardNames.ts";
import "../../styles/section-tiles.css";
import { type SectionTile, type TileLink, type TileAdd, type OpenRequest, type FloatingCentre, type FloatingOpen } from "./SectionTileTypes.ts";
import { cardsFloatOnly, sectionAnchor, otherColumn, acrossFrom, gridColumns, tailPlacement, tileName, plainTitle, scaleOrigin, CHANNEL_TILE_HUE } from "./SectionTileGeometry.tsx";
import { restoreFocus, trackPointer, OpenCardContext, InitialBoxContext } from "./DialogLevels.tsx";
import { TileFace, TileList } from "./TileParts.tsx";
import { SQUEEZED_ROW_MIN } from "./CarouselArrows.tsx";
import { OPEN_EVENT, FloatingCards, TileDialog } from "./FloatingCards.tsx";

export * from "./SectionTileTypes.ts";
export * from "./SectionTileGeometry.tsx";
export * from "./DialogLevels.tsx";
export * from "./TileParts.tsx";
export * from "./CarouselArrows.tsx";
export * from "./FloatingCards.tsx";

/**
 * A GRID OF SECTION TILES, each opening its section in a dialog.
 *
 * A tile is a square button with the section's name centred. Pressing
 * it opens the section's own content in a dialog at the centre of the
 * screen, the page behind it dimmed and inert; Escape, the Back button
 * (lower left) or a click on the dimmed space outside it closes it, and the page is as it was: the scroll position
 * is the page's own (nothing scrolls), the focus returns to the tile, and
 * the folds are kept (they live above, in the editor). Which tile is open
 * is view-only state, never saved; only one dialog is open at a time.
 */
export default function SectionTiles({

    tiles,

    hue,

    label,

    blank,

    incomplete,

    small = false,

    trailing,

    cardsOnly = false

}: {

    /** No tiles are drawn: only their dialogs and floating cards, called for from elsewhere (a legal card on 3. Infrastructure & Capability). */
    cardsOnly?: boolean;

    /** Something that stands in the grid after the last tile, as a tile does (the Strategic Period's "Add Card"). */
    trailing?: ReactNode;

    /** The tiles keep the page's small size, whatever their number (four are not drawn as the 2 x 2 of large tiles). */
    small?: boolean;

    tiles: readonly SectionTile[];
    /**
     * The cards that lack a required answer, by id, with what each lacks (CardCompleteness.ts): in a tile's list its line is red, flashing and FIRST, and the tile
     * has the red flashing glow while it holds one.
     */
    incomplete?: ReadonlyMap<string, readonly string[]>;
    /**
     * Who knows, as of NOW, whether a card is still completely blank and takes it away: asked when a floating card made a moment ago is closed (the
     * adds a tile or a box carries were drawn before the card existed, and cannot see it).
     */
    blank?: Pick<TileAdd, "isBlank" | "onRemove">;
    /** The hue of the card the tiles sit in: the dialog is drawn in it. */
    hue: number;
    /** What the tiles are, for assistive technology: "Resources". */
    label: string;

}) {

    const [openId, setOpenId] = useState<string | null>(null);
    // The subcategory the dialog opens on (a list item of "Utilities" that names one), if any.
    const [openBox, setOpenBox] = useState<string | null>(null);
    const [floating, setFloating] = useState<FloatingOpen | null>(null);

    // (A card just made and still open is not flagged: freshCards.ts.)
    useSyncExternalStore(freshCards.subscribe, freshCards.snapshot);
    const shownIncomplete = incomplete ? new Map([...incomplete].filter(([id]) => !freshCards.has(id))) : undefined;

    // A card made a moment ago and still open carries no error indicator (freshCards.ts).
    const freshId = floating?.fresh ? floating.id : null;
    useEffect(() => {
        if (!freshId) {
            return;
        }
        freshCards.add(freshId);
        return () => freshCards.remove(freshId);
    }, [freshId]);
    const opener = useRef<HTMLElement | null>(null);
    // Whether what is open was opened with the pointer (a mouse click) or the keyboard: the focus comes back to its opener
    // with a visible ring only after the keyboard.
    const openedByPointer = useRef(false);

    // THE FOUR TILES OF A PAGE CARD (2 x 2) are as large as the card's width allows, but never so large that the card and the footer do not both stand in the
    // window: the side is also held to what the window's height leaves under the card's title (measured at the page's top).
    const quadBox = useRef<HTMLDivElement | null>(null);
    // (Two large tiles stand side by side, in one row of the same squares.)
    const big = !small && (tiles.length === 4 || (tiles.length > 0 && tiles.length <= 2 && tiles.every(tile => tile.large)));
    const bigRows = tiles.length === 4 ? 2 : 1;
    useLayoutEffect(() => {
        const box = quadBox.current;
        if (!box || !big) {
            return;
        }
        const fit = () => {
            const top = box.getBoundingClientRect().top + window.scrollY;
            const footer = document.querySelector<HTMLElement>(".workspace-footer")?.offsetHeight ?? 64;
            // (the footer and its 12px, the card's 12px padding, the gap between the two rows)
            // (A page with the Inventory and Completed row under its cards keeps the least of that row in the window: the row is squeezed, the cards keep their size.)
            const below = document.querySelector<HTMLElement>(".section-tiles-completed");
            const reserved = below ? SQUEEZED_ROW_MIN + 12 : 0;
            const side = Math.floor((window.innerHeight - top - footer - 12 - 12 - 12 - reserved) / bigRows);
            box.style.setProperty("--quad-max-side", Math.max(side, 150) + "px");
            // The type of the four tiles from the type scale by their size: 24px titles and 18px lists from 250px a side, else 18px and 14px.
            const actual = Math.min((box.clientWidth - 12) / 2, Math.max(side, 150));
            // (Where the window's height makes the tiles smaller than the width would, the gap between them follows, from 12px: the same proportion.)
            const natural = (box.clientWidth - 12) / 2;
            const gap = natural > 0 ? Math.max(6, Math.min(12, Math.round(12 * actual / natural))) : 12;
            box.style.setProperty("--space-card", gap + "px");
            if (actual >= 250) {
                box.setAttribute("data-large", "");
            } else {
                box.removeAttribute("data-large");
            }
        };
        fit();
        window.addEventListener("resize", fit);
        return () => window.removeEventListener("resize", fit);
    }, [big, bigRows]);

    const open = tiles.find(tile => tile.id === openId) ?? null;
    const openRef = useRef(open);
    openRef.current = open;

    // The shape counts every tile but the tail one (if any), which is placed beside the last of them.
    const others = tiles.filter(tile => !tile.tail);
    const shape = gridColumns(others.length);
    const placement = others.length < tiles.length ? tailPlacement(others.length, shape) : null;
    const columns = placement ? placement.columns : shape;
    const rows = placement ? Math.max(placement.row, Math.ceil(others.length / shape)) : Math.ceil(others.length / shape);

    // Focus goes back to the tile that opened the dialog.
    const wasOpen = useRef(false);
    useLayoutEffect(() => {
        if (open) {
            wasOpen.current = true;
        } else if (wasOpen.current) {
            wasOpen.current = false;
            restoreFocus(opener.current, openedByPointer.current);
        }
    }, [open]);

    const latest = useRef(tiles);
    latest.current = tiles;

    useEffect(() => { trackPointer(); }, []);

    const openDialog = (tile: SectionTile, from: HTMLElement | null, box: string | null = null, pointer = false) => {
        tile.opening?.();
        opener.current = from;
        openedByPointer.current = pointer;
        setOpenBox(box);
        setOpenId(tile.id);
    };

    /* A floating card: THAT card alone, centred (FloatingCard). `centre` says over what: the page's card area, the card of the
       page the tile stands in (a card just added), or the tile's group (the Workspace). */
    const openFloating = (tile: SectionTile, id: string, from: HTMLElement, centre: FloatingCentre, fresh = false, pointer = false, linked = false) => {
        tile.opening?.();
        openedByPointer.current = pointer;
        // The column of the page the tile stands in (Infrastructure's card or Offering's Capability's), or -- the Workspace -- its tile group.
        const anchor = centre === "group"
            ? from.closest<HTMLElement>(".section-tiles-box")
            : otherColumn(sectionAnchor(from));
        setFloating({ tileId: tile.id, id, opener: from, anchor, fresh, linked });
    };

    /** What pressing a tile opens: its card (a tile of one), a new blank card (a tile of none), or its dialog. */
    const openTile = (tile: SectionTile, from: HTMLElement, pointer: boolean) => {
        if (tile.press) {
            tile.press();
            return;
        }
        if (tile.direct && tile.cardFor) {
            openFloating(tile, tile.direct, from, "group", false, pointer);
        } else if (cardsFloatOnly(tile) && !tile.view && tile.holds && tile.holds.length === 1) {
            // A tile connected with exactly ONE card opens that card, floating.
            openFloating(tile, tile.holds[0], from, "column", false, pointer);
        } else if (cardsFloatOnly(tile) && !tile.view && tile.holds && tile.holds.length === 0 && tile.add) {
            // A tile with none: one blank card is made and opened (taken away again if left blank).
            openFloating(tile, tile.add.onAdd(), from, "column", true, pointer);
        } else {
            openDialog(tile, from, null, pointer);
        }
    };

    // The dialog this set of tiles stands in was opened on one of them (a link or a "+" of the tile above it names it): that one opens at once.
    const initialBox = useContext(InitialBoxContext);
    const initialOpened = useRef(false);
    // (Until it has opened, the dialog these tiles stand in is not shown: the card asked for is the first thing seen.)
    const [initialPending, setInitialPending] = useState(initialBox !== null);
    useEffect(() => {
        const timer = window.setTimeout(() => setInitialPending(false), 800);
        return () => window.clearTimeout(timer);
    }, []);
    useEffect(() => {
        if (initialOpened.current || !initialBox) {
            return;
        }
        const found = latest.current.find(tile => tile.id === initialBox);
        if (found) {
            initialOpened.current = true;
            // (After the dialog it stands in has taken its place and size.)
            window.setTimeout(() => {
                // (From its own tile, as if pressed: the dialog takes its place and size from it.)
                const from = document.querySelector<HTMLElement>(`.section-tile[data-tile="${CSS.escape(found.id)}"]`) ?? opener.current ?? document.body;
                openTile(found, from, false);
                setInitialPending(false);
            }, 0);
        }
    });

    // A card or a section asked for from another card (OPEN_EVENT).
    useEffect(() => {
        const answer = (event: Event) => {
            const request = (event as CustomEvent<OpenRequest>).detail;
            const found = latest.current.find(tile => tile.id === request.tile) ?? latest.current.find(tile => !!request.card && tile.holds?.includes(request.card));
            if (!found) {
                return;
            }
            // (Where the tiles are not drawn, the card is called from the page's first column: it opens over the second.)
            const from = opener.current ?? (cardsOnly ? document.querySelector<HTMLElement>(".answer-columns.business-capability > .business-foundation-card") : null) ?? document.body;
            if (request.card && found.cardFor) {
                // (Over the other column of the tile that holds it, where it stands on the page: at the one level of every card.)
                openFloating(found, request.card, document.querySelector<HTMLElement>(`.section-tile[data-tile="${CSS.escape(found.id)}"]`) ?? from, "column", request.fresh === true, false, true);
            } else if (request.box) {
                setFloating(null);
                // (From its own tile where it stands on screen: the dialog takes its place and size from it, not from the page.)
                openDialog(found, document.querySelector<HTMLElement>(`.section-tile[data-tile="${CSS.escape(found.id)}"]`) ?? from, request.box);
            }
        };
        document.addEventListener(OPEN_EVENT, answer);
        return () => document.removeEventListener(OPEN_EVENT, answer);
    });

    const closeFloating = () => {
        const current = floating;
        setFloating(null);
        if (!current) {
            return;
        }
        const tile = latest.current.find(candidate => candidate.id === current.tileId);
        // A card added by the "+" and left completely blank is removed again.
        const remover = blank ?? current.remover ?? tile?.add;
        if (current.fresh && remover?.isBlank(current.id)) {
            remover.onRemove([current.id]);
        }
        // (The focus goes back once the page is no longer inert: after this render. Where a dialog is still open under the card, it is the dialog's.)
        refocus.current = openRef.current ? null : current.opener;
    };
    const refocus = useRef<HTMLElement | null>(null);
    useEffect(() => {
        if (!floating && refocus.current) {
            restoreFocus(refocus.current, openedByPointer.current);
            refocus.current = null;
        }
    }, [floating]);

    const floatingTile = floating ? tiles.find(tile => tile.id === floating.tileId) ?? null : null;
    const floatingCard = floating && floatingTile?.cardFor ? floatingTile.cardFor(floating.id) : null;

    // The button last pressed, kept so that a card opened from a dialog's box knows which box it was.
    const lastPressed = useRef<HTMLElement | null>(null);
    useEffect(() => {
        const press = (event: MouseEvent) => {
            lastPressed.current = (event.target as HTMLElement | null)?.closest?.<HTMLElement>("button, [role=button]") ?? null;
        };
        document.addEventListener("click", press, true);
        return () => document.removeEventListener("click", press, true);
    }, []);

    // THE TILE THAT OPENED A CARD stands out while the card is open: a steady halo in the card's tint (the incomplete card's glow, not flashing), and a link
    // that opened it is bold.
    const openerHue = floatingTile?.channel || (floating && floatingTile?.isChannelCard?.(floating.id)) ? CHANNEL_TILE_HUE : hue;
    const openerEl = floating?.pressed?.isConnected ? floating.pressed : floating?.opener ?? null;
    const floatingId = floating?.id ?? null;
    useEffect(() => {
        if (!openerEl || !openerEl.isConnected) {
            return;
        }
        // The tile or box that holds the card now open (it follows the card when the arrows step to another): found by the card's id; else the control that opened it.
        // (A founder's card is held as "founder-" and its id; its box and its line are named by the id alone.)
        const keys = floatingId ? [floatingId, floatingId.replace(/^founder-/, "")].map(id => CSS.escape(id)) : [];
        const find = (build: (key: string) => string) => keys.map(key => document.querySelector<HTMLElement>(build(key))).find(element => !!element) ?? null;
        const box = find(key => `[data-card-box="${key}"]`);
        const block = find(key => `.section-tile [data-card="${key}"]`);
        // The line of a tile's list that opens this card: the underline moves with the card as the arrows step.
        const line = find(key => `.section-tile-link[data-link="${key}"]`);
        const own = openerEl.closest<HTMLElement>(".section-tile") ?? openerEl.closest(".section-tile-slot")?.querySelector<HTMLElement>(".section-tile") ?? null;
        const tile = box ?? line?.closest(".section-tile-slot")?.querySelector<HTMLElement>(".section-tile") ?? own;
        const marked = [tile, block].filter((element): element is HTMLElement => !!element);
        marked.forEach(element => {
            element.setAttribute("data-opener-tile", "");
            element.style.setProperty("--opener-hue", String(openerHue));
        });
        const link = box ? null : line ?? openerEl;
        link?.setAttribute("data-opener", "");
        return () => {
            marked.forEach(element => {
                element.removeAttribute("data-opener-tile");
                element.style.removeProperty("--opener-hue");
            });
            link?.removeAttribute("data-opener");
        };
    }, [openerEl, openerHue, floatingId]);

    // THE CAROUSEL: the arrows beside the layer opened last. A floating card goes through the cards of its tile (or of its box, where it was opened from one); a
    // dialog goes through the tiles of the section, the ones that have something to open (a tile of none would make a blank card).
    const boxCards = floating && floatingTile ? Object.values(floatingTile.boxHolds ?? {}).find(ids => ids.includes(floating.id)) : undefined;
    const siblingCards = floating && floatingTile ? (boxCards ?? floatingTile.holds ?? []) : [];
    const goFloating = (nextId: string) => {
        if (!floating || siblingCards.length < 2) {
            return;
        }
        // (A card made a moment ago and left blank is taken away, as on closing it.)
        const remover = blank ?? floating.remover ?? floatingTile?.add;
        if (floating.fresh && remover?.isBlank(floating.id)) {
            remover.onRemove([floating.id]);
        }
        setFloating({ ...floating, id: nextId, fresh: false, linked: false });
    };
    const stepFloating = (direction: 1 | -1) => {
        if (!floating || siblingCards.length < 2) {
            return;
        }
        const at = siblingCards.findIndex(item => item === floating.id || item === "founder-" + floating.id);
        goFloating(siblingCards[(at + direction + siblingCards.length) % siblingCards.length]);
    };
    // (A card's bullet says its place: the tile's own name for its cards, and its number.)
    // (A card's bullet says its NAME, as its name cell holds it -- the tile's own name for it, or the line of the tile that opens it -- and, while it has none, its group and number.)
    const cardName = (id: string): string => {
        const named = floatingTile?.nameFor?.(id)?.trim() || cardNameOf(id);
        if (named) {
            return named;
        }
        const at = floatingTile?.links?.findIndex(link => !!link && "card" in link && link.card === id) ?? -1;
        const line = at >= 0 ? floatingTile?.items?.[at] : undefined;
        return line ? plainTitle(line).replace(/\*\*/g, "").trim() : "";
    };
    // (Never "Card 2": a card with no name of its own takes the line of the tile that lists it, in the tile's order; else its group's name.)
    const lineAt = (at: number): string => {
        const line = floatingTile?.items && floatingTile.items.length === siblingCards.length ? floatingTile.items[at] : undefined;
        return line ? plainTitle(line).replace(/\*\*/g, "").trim() : "";
    };
    const floatingItems = siblingCards.map((id, at) => ({ id, missing: !!shownIncomplete?.has(id) || !!shownIncomplete?.has(id.replace(/^founder-/, "")), label: cardName(id) || cardName(id.replace(/^founder-/, "")) || lineAt(at) || (floatingTile?.groupFor?.(id) ?? floatingTile?.group ?? floatingTile?.title ?? "") }));
    const floatingAt = floating ? siblingCards.findIndex(item => item === floating.id || item === "founder-" + floating.id) : -1;
    const steppable = tiles.filter(tile => !(cardsFloatOnly(tile) && !tile.view && tile.holds && tile.holds.length === 0 && tile.add) && !tile.direct);
    const goDialog = (next: SectionTile) => {
        const from = opener.current ?? document.body;
        setOpenId(null);
        openTile(next, from, openedByPointer.current);
    };
    const stepDialog = (direction: 1 | -1) => {
        if (!open || steppable.length < 2) {
            return;
        }
        const at = steppable.findIndex(tile => tile.id === open.id);
        goDialog(steppable[(at + direction + steppable.length) % steppable.length]);
    };

    // The card is gone (its x was pressed) after it was shown: nothing floats any more.
    const shown = useRef<string | null>(null);
    useEffect(() => {
        const key = floating ? floating.tileId + ":" + floating.id : null;
        if (key !== null && floatingCard) {
            shown.current = key;
        } else if (key !== null && shown.current === key) {
            shown.current = null;
            setFloating(null);
        } else if (key === null) {
            shown.current = null;
        }
    }, [floating, floatingCard]);

    return (
        <>

            {/* The box is the size container the tiles measure (a third of its width, less
                the gaps); the group inside is the grid. */}
            {!cardsOnly && (
            <div ref={quadBox} className={"section-tiles-box" + (big ? " section-tiles-quad" : "") + (small ? " section-tiles-small" : "")}>
            <div
                className="section-tiles"
                data-initial-pending={initialPending ? "" : undefined}
                role="group"
                aria-label={label}
                style={{ "--tile-columns": columns } as CSSProperties}
            >
                {tiles.map(tile => {
                    const at = tile.tail && placement
                        ? { row: placement.row - 1, column: placement.column - 1 }
                        : { row: Math.floor(others.indexOf(tile) / shape), column: others.indexOf(tile) % shape };
                    return (
                        <TileSlot
                            key={tile.id}
                            tile={tile}
                            incomplete={shownIncomplete}
                            at={at}
                            columns={columns}
                            rows={rows}
                            style={{
                                ...(tile.channel ? { "--strategy-theme-hue": CHANNEL_TILE_HUE } : {}),
                                // (With a tail tile every tile is placed by hand: the tail's cell may be the shape's extra column.)
                                ...(placement ? { gridRow: at.row + 1, gridColumn: at.column + 1 } : {})
                            } as CSSProperties}
                            onOpen={(from, pointer) => openTile(tile, from, pointer)}
                            onLink={(link, from, pointer) => {
                                if ("box" in link) {
                                    openDialog(tile, from, link.box, pointer);
                                } else {
                                    openFloating(tile, link.card, from, "column", false, pointer);
                                }
                            }}
                            onAdd={(from, pointer) => {
                                if (tile.add && tile.cardFor) {
                                    openFloating(tile, tile.add.onAdd(), from, "column", true, pointer);
                                } else if (tile.add && tile.addOpensDialog) {
                                    openDialog(tile, from, tile.add.onAdd(), pointer);
                                }
                            }}
                        />
                    );
                })}
                {trailing}
            </div>
            </div>
            )}

            {open && (
                <TileDialog
                    key={open.id}
                    tile={open}
                    opener={opener.current}
                    initialBox={openBox}
                    hue={open.channel ? CHANNEL_TILE_HUE : hue}
                    step={steppable.length > 1 && steppable.some(tile => tile.id === open.id) ? { what: "section", previous: () => stepDialog(-1), next: () => stepDialog(1), items: steppable.map(tile => ({ id: tile.id, label: tile.title })), current: steppable.findIndex(tile => tile.id === open.id), go: (id: string) => { const target = steppable.find(tile => tile.id === id); if (target && target.id !== open.id) { goDialog(target); } } } : undefined}
                    onClose={() => setOpenId(null)}
                    onOpenCard={cardsFloatOnly(open) ? (id, caption, remover, pointer, fresh) => {
                        // A card chosen in the dialog's grid (or made by a box's "+"): the dialog closes and the card floats on its section part,
                        // under the box's name (the tile's where none is given).
                        // (The dialog STAYS under the card: Back returns to it, as to the view the card was opened from; Escape closes every layer.)
                        const from = opener.current ?? document.body;
                        openedByPointer.current = pointer;
                        open.opening?.();
                        setFloating({ tileId: open.id, id, opener: from, pressed: lastPressed.current, anchor: acrossFrom(lastPressed.current) ?? otherColumn(sectionAnchor(from)), fresh, caption, remover });
                    } : null}
                />
            )}

            {floating && floatingTile && floatingCard && (
                // (A card chosen on a floating card -- an Objective on its Goal's card -- takes its place: the tile that holds both answers.)
                <OpenCardContext.Provider value={(id, caption, remover, pointer, fresh) => {
                    openedByPointer.current = pointer;
                    setFloating(current => current ? { ...current, id, caption, remover, fresh, linked: true } : current);
                }}>
                <FloatingCards
                    key={floating.tileId + ":" + floating.id}
                    anchor={floating.anchor}
                    fresh={floating.fresh}
                    hue={floatingTile.channel || floatingTile.isChannelCard?.(floating.id) ? CHANNEL_TILE_HUE : floatingTile.hueFor?.(floating.id) ?? hue}
                    incomplete={!!shownIncomplete?.has(floating.id)}
                    label={floatingTile.title}
                    attrs={{ "data-floating": floating.tileId, "data-card-id": floating.id }}
                    step={!floating.fresh && floatingTile.id !== "overview" && floatingTile.id !== "completed" && siblingCards.length > 1 && siblingCards.some(item => item === floating.id || item === "founder-" + floating.id) ? { what: "card", previous: () => stepFloating(-1), next: () => stepFloating(1), items: floatingItems, current: floatingAt, go: (id: string) => { if (id !== floating.id) { goFloating(id); } } } : undefined}
                    cards={(() => {
                        // (A requirement and the expense it made are drawn together only where a LINK was pressed -- the tile's link, a card's link symbol; opened by its own tile or box, a card is alone.)
                        const pair = floating.linked ? floatingTile.pairOf?.(floating.id) : null;
                        const one = (id: string, caption: string, node: ReactNode) => ({ key: id, caption, kind: floatingTile.kindFor?.(id) ?? floatingTile.cardKind ?? "card" as const, node, note: floatingTile.noteFor?.(id) ?? floatingTile.note });
                        if (pair) {
                            const parent = floatingTile.cardFor?.(pair.parent.id);
                            const child = floatingTile.cardFor?.(pair.child.id);
                            if (parent && child) {
                                return [one(pair.parent.id, pair.parent.caption, parent), one(pair.child.id, pair.child.caption, child)];
                            }
                        }
                        return [one(floating.id, floating.caption ?? floatingTile.groupFor?.(floating.id) ?? floatingTile.group ?? floatingTile.title, floatingCard)];
                    })()}
                    onClose={closeFloating}
                />
                </OpenCardContext.Provider>
            )}

        </>
    );

}


/**
 * A PAGE TILE (docs/ai/layout-rules.md, "Tile anatomy" and "Reactions"): the tile's own button (title, the "+" of an empty
 * section), the list of what it includes as real controls laid over it, and -- on the tiles that take new cards -- a "+"
 * box at the lower right. They stand in one slot, the grid item, which is what scales on hover and focus: 150%, the other
 * tiles staying where they are, from the corner (or edge) that keeps it inside its card.
 */
function TileSlot({
    tile, at, columns, rows, style, onOpen, onLink, onAdd, incomplete
}: {
    tile: SectionTile;
    incomplete?: ReadonlyMap<string, readonly string[]>;
    /** Its cell in the group (0 based). */
    at: { row: number; column: number };
    columns: number;
    rows: number;
    style: CSSProperties;
    onOpen: (from: HTMLElement, pointer: boolean) => void;
    onLink: (link: TileLink, from: HTMLElement, pointer: boolean) => void;
    onAdd: (from: HTMLElement, pointer: boolean) => void;
}) {
    const slot = useRef<HTMLDivElement | null>(null);
    // Whether the pointer has been on the tile since it came: its origin is set ONCE for that stay, never again while the pointer is on it.
    const pointed = useRef(false);

    /* THE POINT IT SCALES FROM, set once when the pointer arrives: the corner, edge or centre of its place in the group; moved
       to fit if the card is too narrow. It is measured as the tile RESTS -- its scale and its transition off for the moment --
       and never again while the pointer stays: a press on a list item moves the focus, and measuring then (the tile already
       at 150%, the transition's first frame still the scaled one) took the grown tile for its size, set another origin and
       slid the tile under the pointer between the press and the release, so the click never landed. */
    const aim = () => {
        const node = slot.current;
        if (!node || pointed.current) {
            return;
        }
        pointed.current = true;
        const transform = node.style.transform;
        const transition = node.style.transition;
        node.style.transition = "none";
        node.style.transform = "none";
        const box = node.getBoundingClientRect();
        node.style.transform = transform;
        node.style.transition = transition;
        const room = (node.closest<HTMLElement>(".card-scroll") ?? node.closest<HTMLElement>(".section-tiles-box"))?.getBoundingClientRect();
        node.style.transformOrigin = scaleOrigin(box, room ?? null, at, columns, rows);
    };

    // The lines that hold an incomplete card go FIRST (the order of the links follows), each with what is missing.
    const baseItems = !tile.empty && tile.items && tile.items.length > 0 ? tile.items : null;
    const missingOf = (link: TileLink | undefined): readonly string[] | undefined => {
        if (!link || !incomplete) {
            return undefined;
        }
        if ("card" in link) {
            return incomplete.get(link.card);
        }
        const inside = (tile.boxHolds?.[link.box] ?? []).filter(id => incomplete.has(id));
        return inside.length > 0 ? inside.flatMap(id => incomplete.get(id) ?? []) : undefined;
    };
    const missingAt = (index: number) => tile.itemAlerts?.[index] ?? missingOf(tile.links?.[index]);
    const order = baseItems ? baseItems.map((_, index) => index).sort((one, other) => Number(!!missingAt(other)) - Number(!!missingAt(one)) || one - other) : [];
    const items = baseItems ? order.map(index => baseItems[index]) : null;
    const orderedLinks = baseItems && tile.links ? order.map(index => tile.links![index]) : tile.links;
    const alerts = baseItems ? order.map(index => missingAt(index)) : undefined;
    const marks = baseItems && tile.itemMarks ? order.map(index => tile.itemMarks![index]) : undefined;
    // (A card the tile holds that is not on a line of it -- one with no name yet -- lights the tile all the same.)
    const held = [...(tile.holds ?? []), ...Object.values(tile.boxHolds ?? {}).flat()];
    const anyAlert = (!!alerts && alerts.some(entry => !!entry)) || (!!incomplete && held.some(id => incomplete.has(id)));

    return (
        <div
            ref={slot}
            className={"section-tile-slot" + (tile.diagram ? " section-tile-slot-diagram" : "") + (tile.inactive ? " section-tile-slot-empty" : "") + ((tile.add && tile.cardFor) || tile.plus ? " section-tile-slot-plus" : "") + (tile.sentence ? " section-tile-slot-sentence" : "") + (anyAlert ? " card-tile-incomplete" : "")}
            style={style}
            data-column={at.column}
            data-row={at.row}
            onPointerEnter={aim}
            onPointerMove={aim}
            onPointerLeave={() => { pointed.current = false; }}
            onPointerCancel={() => { pointed.current = false; }}
        >
            <button
                type="button"
                className={"section-tile" + (tile.diagram ? " section-tile-diagram" : "") + (tile.inactive ? " section-tile-inactive" : "") + (tile.channel ? " section-tile-channel" : "") + (tile.completed ? " section-tile-completed" : "")}
                data-tile={tile.id}
                data-anchor={tile.anchor}
                data-rail={tile.rail}
                data-holds={tile.holds && tile.holds.length > 0 ? tile.holds.join(" ") : undefined}
                aria-haspopup="dialog"
                aria-label={tileName(tile.title, tile.empty ? [] : tile.items)}
                data-tail={tile.tail ? "" : undefined}
                onClick={(event) => {
                    // A block of the tile's picture (a colour, an image, a typeface) that names its card opens that card.
                    const hit = (event.target as HTMLElement).closest<HTMLElement>("[data-card]");
                    if (hit?.dataset.card && tile.cardFor) {
                        onLink({ card: hit.dataset.card }, hit, event.detail > 0);
                        return;
                    }
                    onOpen(event.currentTarget, event.detail > 0);
                }}
            >
                <TileFace title={tile.title} empty={tile.empty} glyph={!(tile.add && tile.cardFor)} />
                {tile.picture && <span className="section-tile-picture" aria-hidden="true">{tile.picture}</span>}
            </button>
            {items && (
                <div className="section-tile-links-layer">
                    <TileList
                        items={items}
                        links={orderedLinks}
                        alerts={alerts}
                        marks={marks}
                        title={tile.title}
                        onLink={onLink}
                        onPlain={(event) => {
                            // (Text that scrolls is under the pointer, not the tile's button: a press on it is a press on the tile.)
                            const button = (event.currentTarget as HTMLElement).closest(".section-tile-slot")?.querySelector<HTMLElement>(":scope > .section-tile");
                            if (button) {
                                onOpen(button, event.detail > 0);
                            }
                        }}
                    />
                </div>
            )}
            {tile.add && (tile.cardFor || tile.addOpensDialog) && (
                <AddButton shape="box" className="section-tile-plus"
                    aria-label={"Add " + tile.add.label.charAt(0).toUpperCase() + tile.add.label.slice(1) + " to " + plainTitle(tile.title)}
                    disabled={tile.add.disabled}
                    onClick={(event) => onAdd(event.currentTarget, event.detail > 0)}
                />
            )}
            {tile.plus && (
                <AddButton shape="box" className="section-tile-plus"
                    aria-label={"Add Subchannel to " + plainTitle(tile.title)}
                    onClick={(event) => { tile.plus?.(); if (!tile.press) { onOpen(event.currentTarget.parentElement?.querySelector<HTMLElement>(":scope > .section-tile") ?? event.currentTarget, event.detail > 0); } }}
                />
            )}
        </div>
    );
}
