import { CSSProperties, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";

import {
    CHANNEL_TILE_HUE,
    CrumbNote,
    InitialBoxContext,
    InnerLevel,
    ItemMark,
    OpenCardContext,
    TileAdd,
    TileFace,
    TileLink,
    TileList,
    plainTitle,
    tileName,
    useDialogInnerBack,
    useDialogInnerStep
} from "./SectionTiles.tsx";
import CardTile, { inwardOrigin, pageTileSide, useTilesAcross } from "./CardTile.tsx";
import type { CardBox } from "./CardBoxes.tsx";
import "../../styles/card-tile.css";

/**
 * THE FEWEST CARDS A CATEGORY NEEDS TO BE A CATEGORY TILE (its cards inside, with its own "+ Add"); one with fewer shows its cards as tiles directly. It is 0:
 * EVERY existing category has its tile from the start (built-in or the user's own), an empty one drawn at 50%; a category of one card is a tile that lists
 * it. One constant: change it here if categories with few cards should fold into loose card tiles again.
 */
export const CATEGORY_TILE_MIN_CARDS = 0;

/*
    ONE GRID OF TILES for everything a dialog shows as tiles: a section's categories and loose cards (SectionView), a category's groups (SubcategoryBoxes).
    Every tile in it is the page tile's size (215px), looks like a page tile (the name with its rule, a list of lines) and has the page tile's hover (lift and
    glow, 110% growing inwards from the side of the grid it stands on); every "+ Add" box is a tile of that size too. The CardTile (CardTile.tsx) is the tile
    of one card; the CategoryTile here is the tile of several.
*/

/** The tile of a CATEGORY (or a group): the section tile's look, its cards' names listed, a "+" of its own at the corner. */
function CategoryTile({
    id, title, anchor, names, ids, alerts, marks, channel, origin, add, what, onOpen, onAdd, onCard, period
}: {
    period?: string;
    id: string;
    title: string;
    anchor?: string;
    names: readonly string[];
    /** The card behind each name (same order): every line is a link that opens its card, as a page tile's lines do. */
    ids?: readonly string[];
    onCard?: (id: string, pointer: boolean) => void;
    alerts?: readonly (readonly string[] | undefined)[];
    /** How each line is drawn (a card a channel made: teal). */
    marks?: readonly (ItemMark | undefined)[];
    channel?: boolean;
    origin: string;
    add: boolean;
    what: string;

    empty?: boolean;
    onOpen: (pointer: boolean) => void;
    onAdd: (pointer: boolean) => void;
}) {
    return (
        <div
            className={"section-tile-slot card-tile-slot" + (add ? " section-tile-slot-plus" : "") + (names.length === 0 ? " section-tile-slot-empty" : "") + (period ? " section-tile-slot-period" : "") + (alerts?.some(entry => entry && entry.length > 0) ? " card-tile-incomplete" : "")}
            style={{ transformOrigin: origin, ...(channel ? { "--strategy-theme-hue": CHANNEL_TILE_HUE } : {}) } as CSSProperties}
        >
            <button
                type="button"
                className={"section-tile section-tile-category" + (channel ? " section-tile-channel" : "")}
                data-opens=""
                data-anchor={anchor ?? "category-" + id}
                aria-label={tileName(title, names)}
                onClick={(event) => onOpen(event.detail > 0)}
            >
                <TileFace title={title} empty={names.length === 0} glyph={false} />
            </button>
            {period && <span className="section-tile-period">{period}</span>}
            {names.length > 0 && (
                <div className="section-tile-links-layer">
                    <TileList
                        items={names}
                        links={ids && onCard ? ids.map((card): TileLink => ({ card })) : undefined}
                        alerts={alerts}
                        marks={marks}
                        title={title}
                        onLink={(link, _from, pointer) => "card" in link && onCard?.(link.card, pointer)}
                    />
                </div>
            )}
            {add && (
                <button
                    type="button"
                    className="plus-box section-tile-plus"
                    aria-label={"Add " + what + " to " + plainTitle(title)}
                    onClick={(event) => onAdd(event.detail > 0)}
                />
            )}
        </div>
    );
}

/**
 * THE ADD CARD TILE that ends every grid of a section, category or group view: ONE component for every kind of card. Half the tile's side, transparent with a
 * dashed edge; it does not grow on hover -- its ground turns semi-transparent and its "+" grows 10%. (What it adds -- a Resource, an Activity, a Partner, a group --
 * is in its tooltip.)
 */
export function AddTile({ label, disabled, across, onAdd, after, column, row }: { label: string; disabled?: boolean; across: number; onAdd: (pointer: boolean) => void; /** The column it stands in, where the boxes keep their places: the one of the box it will add. */ column?: number; /** Its row, with the column. */ row?: number; /** The number of cards before it: it stands in the place after the last of them when its row has room, else at the start of a row of its own. */ after?: number }) {
    return (
        // (In the LAST column of the grid: the empty place at the end of the lowest row of tiles, else a row of its own under them -- at the bottom right.)
        <div className="add-card-slot" style={{ ...(row !== undefined ? { gridRow: row } : {}), gridColumn: column ?? (after === undefined ? across : (after % Math.max(across, 1)) + 1), ...(after !== undefined ? { justifySelf: "start", alignSelf: "start" } : {}) }}>
            <button
                type="button"
                className="add-card-tile"
                aria-label="Add Card"
                title={"Add " + label}
                disabled={disabled}
                onClick={(event) => onAdd(event.detail > 0)}
            >
                <span className="add-card-plus" aria-hidden="true">+</span>
                <span className="add-card-words">Add Card</span>
            </button>
        </div>
    );
}

/** The incomplete ones first, each flagged: the lines of a category tile's list. */
function listOf(cards: readonly { id: string; name: string; unnamed: string; missing?: readonly string[]; tone?: string }[]) {
    const ordered = [...cards].sort((one, other) => Number(!!other.missing?.length) - Number(!!one.missing?.length));
    // (A card made by a Customer Channel -- the channel's tone -- has its line in the channel's teal.)
    return { names: ordered.map(card => card.name.trim() || card.unnamed), ids: ordered.map(card => card.id), alerts: ordered.map(card => card.missing), marks: ordered.map((card): ItemMark => ({ teal: card.tone === "channel" })) };
}

/** One category of a section's cards (Utilities, Operational, Partners, the channel's ...). */
export interface ViewCategory {
    id: string;
    /** Its name: a category tile's title and the dialog's subtitle while it is open. */
    title: string;
    /** Its cards, as the tiles they are. */
    cards: readonly CardBox[];
    /** What a category tile opens: its own view (its cards' tiles with their Add, or its groups). */
    content: () => ReactNode;
    /** The "+" of its category tile: a blank card of this category, opened floating. */
    add?: TileAdd;
    /** A Customer Channel's own cards: the tile keeps the channel's colour. */
    channel?: boolean;
    /** The number of its ACTIVE cards (Activities): it adds up to the overall number next to the dialog's title (not shown on the tile). */
    active?: number;
    /** The "i" note the dialog's header carries after this category's name while it is open (the help texts of its groups). */
    info?: CrumbNote;
    /** The dates the category runs in (an activity group: "01/10/2026 to 30/09/2026"), said under its tile's title. */
    period?: string;
}

/**
 * A SECTION'S VIEW (the dialog a section tile opens): its cards' tiles grouped by CATEGORY. A category with CATEGORY_TILE_MIN_CARDS cards or more is a
 * category tile (pressing it opens that category's own view, Back returns); a category with fewer shows its cards as the card tiles they are. The section's
 * own "+ Add" ends the grid. Pressing a card tile opens its card FLOATING.
 */
export default function SectionView({
    label,
    what,
    categories,
    add
}: {
    /** What the tiles are, for assistive technology: "Resources". */
    label: string;
    /** One card, for assistive technology: "Resource". */
    what: string;
    categories: readonly ViewCategory[];
    /** The section's own Add: a blank card, opened floating (the card then names its category). */
    add?: TileAdd;
}) {
    const initial = useContext(InitialBoxContext);
    const openCard = useContext(OpenCardContext);
    const [openId, setOpenId] = useState<string | null>(() => initial !== null && categories.some(category => category.id === initial) ? initial : null);
    const open = categories.find(category => category.id === openId) ?? null;

    useDialogInnerBack(open ? () => setOpenId(null) : null, open ? plainTitle(open.title) : undefined, open?.info);
    // The carousel arrows keep to this level: with a category open they go to the next category (of the section's tiles), not out to another tile of the page.
    useDialogInnerStep(open
        ? (direction) => {
            const level = categories.filter(category => category.cards.length >= CATEGORY_TILE_MIN_CARDS);
            if (level.length < 2) {
                return false;
            }
            const at = level.findIndex(category => category.id === open.id);
            setOpenId(level[(at + direction + level.length) % level.length].id);
            return true;
        }
        : null,
        // (The rail follows the names of the categories while one is open.)
        open ? { items: categories.filter(category => category.cards.length >= CATEGORY_TILE_MIN_CARDS).map(category => ({ id: category.id, label: plainTitle(category.title) })), current: categories.filter(category => category.cards.length >= CATEGORY_TILE_MIN_CARDS).findIndex(category => category.id === open.id), go: (id: string) => setOpenId(id) } : null);

    const grid = useRef<HTMLDivElement | null>(null);
    const side = useMemo(pageTileSide, []);
    const across = useTilesAcross(grid, side);

    if (open) {
        return <InnerLevel>{open.content()}</InnerLevel>;
    }

    // The tiles in order: a category tile, or the card tiles of a small category.
    type Entry = { key: string; category: ViewCategory; card?: CardBox };
    const entries: Entry[] = categories.flatMap(category => category.cards.length >= CATEGORY_TILE_MIN_CARDS
        ? [{ key: "category-" + category.id, category }]
        : category.cards.map(card => ({ key: card.id, card, category })));
    const total = entries.length + (add ? 1 : 0);

    const create = (adder: TileAdd, pointer: boolean) => {
        if (openCard) {
            openCard(adder.onAdd(), undefined, adder, pointer, true);
        }
    };

    return (
        <div className="card-boxes">
            <div
                ref={grid}
                className="section-tiles card-tile-grid"
                role="group"
                aria-label={label}
                style={{ "--section-tile-size": side + "px", gridTemplateColumns: "repeat(" + across + ", " + side + "px)", maxWidth: "none" } as CSSProperties}
            >
                {entries.map((entry, index) => {
                    const origin = inwardOrigin(index, total, across);
                    if (entry.card) {
                        const item = entry.card;
                        return (
                            <CardTile
                                key={entry.key}
                                id={item.id}
                                name={item.name}
                                unnamed={item.unnamed}
                                number={item.number}
                                lines={item.lines ?? (item.summary && item.summary.trim().length > 0 ? [item.summary] : [])}
                                links={item.links}
                                tone={item.tone ?? (entry.category.channel ? "channel" : "infrastructure")}
                                inactive={item.inactive}
                                missing={item.missing}
                                label={what + " " + item.number + ": " + (item.name.trim() || item.unnamed)}
                                origin={origin}
                                onOpen={(pointer) => openCard?.(item.id, undefined, undefined, pointer, false)}
                            />
                        );
                    }
                    const category = entry.category;
                    const { names, ids, alerts, marks } = listOf(category.cards);
                    return (
                        <CategoryTile
                            key={entry.key}
                            id={category.id}
                            title={category.title}
                            names={names}
                            ids={ids}
                            onCard={(cardId, pointer) => openCard?.(cardId, undefined, undefined, pointer, false)}
                            alerts={alerts}
                            marks={marks}
                            channel={category.channel}
                            period={category.period}
                            origin={origin}
                            add={!!category.add}
                            what={what}
                            onOpen={() => setOpenId(category.id)}
                            onAdd={(pointer) => category.add && create(category.add, pointer)}
                        />
                    );
                })}
                {add && <AddTile label={add.label} disabled={add.disabled} across={across} onAdd={(pointer) => create(add, pointer)} />}
            </div>
        </div>
    );
}

/** One subcategory of a section that has several (Utilities: Electricity, Internet, ...). */
export interface SubcategoryBox {

    id: string;

    /** The subcategory's name: the box's one centred title, and the dialog's subtitle while it is open. */
    title: string;

    /** The subcategory's content (its cards), drawn only while its box is open. */
    content: () => ReactNode;

    /** What a link calls this subcategory: `data-anchor`, space separated. */
    anchor?: string;

    /** The ids of the cards inside, so a link to one of them presses this box (`data-holds`). */
    holds?: readonly string[];

    /** No cards in it yet: the box shows a small "+" under its title. */
    empty?: boolean;

    /** The names of the cards inside, listed under the title. */
    items?: readonly string[];

    /** For each name, what an incomplete card lacks (the line is red, flashing, first). */
    alerts?: readonly (readonly string[] | undefined)[];

    /** For each name, how its line is drawn (a card a Customer Channel made: the channel's teal). */
    itemMarks?: readonly (ItemMark | undefined)[];

    /** The "i" note the dialog's header carries after this subcategory's name while it is open. */
    crumbInfo?: CrumbNote;

    /** A "+" box at the box's lower right: it makes a blank card in this subcategory and opens it floating, under the subcategory's name. */
    add?: TileAdd;

    /** A group the user made ("Add Other") and has not named or put a card in: it is no tile of the grid, and it is taken away when left. */
    blankUnnamed?: boolean;

}

/**
 * A CATEGORY WITH SEVERAL GROUPS (Utilities: Electricity, Internet, ...): inside its dialog a grid of tiles, one per group, each a page tile's size and
 * look (the same tile grid as a section's view); pressing one shows that group's cards in place of the grid (Back and Escape return to the grid first,
 * then close the dialog); a group with exactly one card opens it floating, one with none makes a blank one. The user's own group ("Other") is the Add
 * tile at the end. A category with one group shows its content directly.
 */
export function SubcategoryBoxes({
    items,
    label,
    add
}: {
    items: readonly SubcategoryBox[];
    /** What the boxes are, for assistive technology: "Utilities". */
    label: string;
    /** A section that lets the founder add a subcategory of their own ("Other"): an Add tile after the last, opened at once (named in its own head). */
    add?: { label: string; disabled?: boolean; onAdd: () => string; onDiscard?: (id: string) => void };
}) {

    const initial = useContext(InitialBoxContext);
    const openCard = useContext(OpenCardContext);
    const [openId, setOpenId] = useState<string | null>(() => initial !== null && items.some(item => item.id === initial) ? initial : null);
    const open = items.find(item => item.id === openId) ?? null;

    // A group made with "Add Other" and left without a name or a card is taken away again (when the user goes back from it, or closes the dialog).
    const latest = useRef({ items, add });
    latest.current = { items, add };
    const previous = useRef<string | null>(null);
    useEffect(() => {
        const before = previous.current;
        previous.current = openId;
        if (before && before !== openId && latest.current.items.find(item => item.id === before)?.blankUnnamed) {
            latest.current.add?.onDiscard?.(before);
        }
    }, [openId]);
    useEffect(() => () => {
        const last = previous.current;
        if (last && latest.current.items.find(item => item.id === last)?.blankUnnamed) {
            latest.current.add?.onDiscard?.(last);
        }
    }, []);

    useDialogInnerBack(open ? () => setOpenId(null) : null, open ? plainTitle(open.title) : undefined, open?.crumbInfo);
    // The arrows keep to this level: with a group open they go to the next group of its category.
    useDialogInnerStep(open && items.length > 1
        ? (direction) => {
            const level = items.filter(item => !item.blankUnnamed);
            if (level.length < 2) {
                return false;
            }
            const at = level.findIndex(item => item.id === open.id);
            setOpenId(level[(at + direction + level.length) % level.length].id);
            return true;
        }
        : null,
        // (The rail follows the names of the groups while one is open.)
        open && items.length > 1 ? { items: items.filter(item => !item.blankUnnamed).map(item => ({ id: item.id, label: plainTitle(item.title) })), current: items.filter(item => !item.blankUnnamed).findIndex(item => item.id === open.id), go: (id: string) => setOpenId(id) } : null);

    const grid = useRef<HTMLDivElement | null>(null);
    const side = useMemo(pageTileSide, []);
    const across = useTilesAcross(grid, side);

    // (A category with one group has that group's tile too, empty or not: the arrows that bring the user here never make a card.)

    if (open) {
        return <InnerLevel>{open.content()}</InnerLevel>;
    }

    // (A blank, unnamed group of the user's own is no tile; the one just made is open, so it is never in the grid.)
    const shown = items.filter(item => !item.blankUnnamed);
    const total = shown.length + (add ? 1 : 0);

    return (
        <div className="card-boxes">
            <div
                ref={grid}
                className="section-tiles card-tile-grid"
                role="group"
                aria-label={label}
                style={{ "--section-tile-size": side + "px", gridTemplateColumns: "repeat(" + across + ", " + side + "px)", maxWidth: "none" } as CSSProperties}
            >
                {shown.map((item, index) => {
                    // The lines that hold an incomplete card first.
                    const order = (item.items ?? []).map((_, at) => at).sort((one, other) => Number(!!item.alerts?.[other]?.length) - Number(!!item.alerts?.[one]?.length) || one - other);
                    return (
                        <CategoryTile
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            anchor={item.anchor}
                            names={order.map(at => item.items![at])}
                            ids={item.holds && item.holds.length === (item.items ?? []).length ? order.map(at => item.holds![at]) : undefined}
                            onCard={(cardId, pointer) => openCard?.(cardId, undefined, undefined, pointer, false)}
                            alerts={item.alerts ? order.map(at => item.alerts![at]) : undefined}
                            marks={item.itemMarks ? order.map(at => item.itemMarks![at]) : undefined}
                            origin={inwardOrigin(index, total, across)}
                            add={!!item.add}
                            what={label}
                            onOpen={(pointer) => {
                                if (openCard && item.holds && item.holds.length === 1) {
                                    // A box connected with exactly ONE card opens it, floating.
                                    openCard(item.holds[0], undefined, undefined, pointer, false);
                                } else if (openCard && item.holds && item.holds.length === 0 && item.add) {
                                    // A box with none: one blank card is made and opened (taken away again if left blank).
                                    const adder = item.add as TileAdd;
                                    openCard(adder.onAdd(), undefined, adder, pointer, true);
                                } else {
                                    setOpenId(item.id);
                                }
                            }}
                            onAdd={(pointer) => {
                                const adder = item.add as TileAdd;
                                if (openCard) {
                                    openCard(adder.onAdd(), undefined, adder, pointer, true);
                                }
                            }}
                        />
                    );
                })}
                {add && <AddTile label={add.label} disabled={add.disabled} across={across} onAdd={() => setOpenId(add.onAdd())} />}
            </div>
        </div>
    );

}
