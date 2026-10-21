import { ReactNode } from "react";
import { InfoPoint } from "../fields/InfoNote.tsx";

/**
 * One tile of a SectionTiles grid (docs/ai/layout-rules.md, "Section tiles
 * and dialog").
 */
export interface SectionTile {

    id: string;

    /** The section's name: the tile's one centred title. */
    title: string;

    /**
     * The tile's cards are shown in their dialog (Delivery's cards, in the dialog itself) instead of ONLY as floating cards. Every other kind of card
     * (Resource, Activity, Partner, Provider, channel and finished ones) is presented one way: floating (see `cardsFloatOnly`).
     */
    keepDialog?: boolean;

    /** For each line of `items`, what an incomplete card behind it lacks (a tile of counts -- Inventory --, which has no links to read it from). */
    itemAlerts?: readonly (readonly string[] | undefined)[];

    /** Whether a card of this tile was made by / is linked from a Customer Channel: its floating card then takes the channel's colour (CHANNEL_TILE_HUE). */
    isChannelCard?: (cardId: string) => boolean;

    /** A section tile whose dialog is a VIEW of category tiles (SectionView): it always opens that view, whatever number of cards it holds. */
    view?: boolean;


    /** The section's content, drawn only while its dialog is open. */
    content: () => ReactNode;

    /** The title in sentence case (only its first letter a capital), not in capitals. */
    sentence?: boolean;

    /** One of a page's LARGE tiles (two of them side by side, as large as the four of a 2 x 2 page): every tile of the set carries it. */
    large?: boolean;

    /** The tile's own picture, drawn under its title in place of a list (a colour as a square block, a typeface's specimen). */
    picture?: ReactNode;

    /**
     * A tile of cards made from a Customer Channel: its own hue (the tile
     * and its dialog), apart from the user's own cards.
     */
    channel?: boolean;

    /** What a link calls this tile (see jumpTo.ts): `data-anchor`, space separated. */
    anchor?: string;

    /** The id of the Sections rail's item that stands for this tile (a column page drawn as tiles): `data-rail`. */
    rail?: string;

    /** The ids of the cards inside, so a link to one of them opens this tile (`data-holds`). */
    holds?: readonly string[];

    /**
     * The section holds no cards yet: a small "+" is drawn under the title (decorative; the
     * tile is described as "No items yet"). Opening it shows the creation interface.
     */
    empty?: boolean;

    /**
     * What the section includes, listed under the title in small text (the founders and their
     * rates, the subcategories, the cards' names ...): a decoration of the tile, said again in
     * its accessible name. Not drawn while the tile is `empty`.
     */
    items?: readonly string[];

    /** How each line of `items` is drawn (same order): an empty one (no card in it) is faded; the Channel line is teal; a line with cards a channel made carries a second, teal bullet. */
    itemMarks?: readonly (ItemMark | undefined)[];

    /**
     * The grey tile of the finished ones (Infrastructure's Completed activities): a neutral grey ground and border
     * and grey text, as everything completed is drawn; its dialog is grey too.
     */
    completed?: boolean;

    /**
     * Placed AFTER the others, beside the last of them in the final row (Infrastructure's Completed tile, right of "Sales &
     * Customer"), and not counted in the group's shape: see tailPlacement.
     */
    tail?: boolean;

    /**
     * Where each item of `items` leads when it is pressed (the lists on the tiles are real controls): `{ card }` opens that
     * card ALONE as a floating card, `{ box }` opens the section's dialog on that subcategory; an item without one (or a tile
     * without `links`) is plain text. (A list holds every item and scrolls; there is no "+N more".)
     */
    links?: readonly (TileLink | undefined)[];

    /** The ids of the cards behind each subcategory a `{ box }` link names (so a tile can tell which of its lines hold an incomplete card). */
    boxHolds?: Readonly<Record<string, readonly string[]>>;

    /** The card `{ card }` names, drawn in the floating card; null once it is gone (the floating card closes). */
    cardFor?: (id: string) => ReactNode;

    /** What the tile's floating cards are called above them (their group: "Profiles", "Competitors"), where it is not the tile's own title. */
    group?: string;

    /** The same, by card, where a tile's cards are of several groups. */
    groupFor?: (id: string) => string;

    /** A card's own hue where its tile holds cards of several origins (the Inventory's: Infrastructure's, Offering's, a channel's): the card floats in the hue its tile has. */
    hueFor?: (id: string) => number | undefined;

    /** A card's own name as its name cell holds it ("" where it has none yet): what its bullet in the carousel's rail says. */
    nameFor?: (id: string) => string;

    /** A card that has a parent or a child (a requirement and the expense it made) is drawn with it: the parent above, the child under it, whichever was pressed. */
    pairOf?: (id: string) => { parent: { id: string; caption: string }; child: { id: string; caption: string } } | null;

    /** The look of its floating cards: a founder's (the founder's card width), the Workspace's form, any other card (480px). */
    cardKind?: "card" | "founder";

    /** The look of ONE card where the tile holds cards of several looks (the "Inventory" tile: a founder's, the Workspace's form, any other). */
    kindFor?: (id: string) => "card" | "founder";

    /**
     * Pressing the tile opens this card alone as a floating card, with no dialog around it (the Workspace: its form,
     * centred over its group of tiles).
     */
    direct?: string;

    /** A tile that is not in use yet (a channel not chosen): faded; pressing it does `press` instead of opening a dialog. */
    inactive?: boolean;
    /** Its dialog covers the page (the Roadmap's), as wide as the widest dialogs are, not the width of the card the tile stands in. */
    wide?: boolean;
    /**
     * A DIAGRAM TILE: a category of its own among the Master Tiles. It stands for a drawing that opens in its dialog (the Roadmap, a Gantt diagram),
     * not for a list of what the section holds: a wide banner with a large title and no list, not a square of the page's tile size.
     */
    diagram?: boolean;
    press?: () => void;

    /** The "+" makes the card and opens the tile's DIALOG on it (its box is the new card's id): the card stands where the dialog shows its cards, with no floating card. */
    addOpensDialog?: boolean;

    /** A "+" at the tile's lower right that does this (adds what the tile holds, then the tile opens), for a tile whose items are not cards. */
    plus?: () => void;

    /** A "+" box at the tile's lower right adds a card here and opens it as a floating card (never on an empty-to-be tile of another kind). */
    add?: TileAdd;

    /** Called when a floating card of this tile opens (a founder's Responsibilities start folded). */
    opening?: () => void;

    /** The tile's "i" note: said after the caption of its floating cards (its dialog's header carries it as well). */
    note?: InfoPoint[];

    /** A card's own note where it differs from the tile's (a resource group: the note of the subcategory the card is in). */
    noteFor?: (id: string) => InfoPoint[] | undefined;

}


/** Where an item of a tile's list leads. */
export type TileLink = { card: string } | { box: string };


/** What a tile can add: a card of its own kind, appended to its list. */
export interface TileAdd {

    /** What is added, title case: "Activity" (the box is named "Add Activity to <tile>"). */
    label: string;

    disabled?: boolean;

    /** Creates a blank card and returns its id (it is opened at once). */
    onAdd: () => string;

    /** Where a card made by the "+" tile is opened where no floating card is (a card shown in its place among the others): it is given the new id. */
    onOpen?: (id: string) => void;

    /** True while the card still holds nothing the user wrote. */
    isBlank: (id: string) => boolean;

    /** Removes these cards (a blank one is removed when its floating card is closed). */
    onRemove: (ids: string[]) => void;

}


/** The rail of an inner level of a dialog (the categories of a section, the groups of a category, a dialog's sections): its bullets say the names of the level's own tiles, and replace the page's while the level is open. */
export interface DialogRail {
    items: readonly { id: string; label: string }[];
    current: number;
    go: (id: string) => void;
}


/** The "i" note a view carries in the dialog's header: what it is called and its points (InfoNote). */
export interface CrumbNote {
    label: string;
    points: InfoPoint[];
}


/** The marks of one line of a tile's list (see SectionTile.itemMarks). */
export interface ItemMark {
    /** The category or group holds no card: its line (text and bullet) is drawn 75% transparent. */
    empty?: boolean;
    /** The Channel line of Offering's Resources: its text and bullet in the channel's teal. */
    teal?: boolean;
    /** The line holds cards made by a Customer Channel: a second bullet, in the channel's teal, beside the first. */
    channel?: boolean;
    /** On a column page's tile (text, no bullets): this line is one of a list, so it has its bullet. */
    bullet?: boolean;
    /** On a column page's tile: this line is centred, with no bullet (a name alone, a date). */
    centre?: boolean;
    /** This line has no bullet (the state a list starts with). */
    plain?: boolean;
    /** A hairline stands under this line: it ends one topic of the list and the next begins (the Strategic Period's dates, then its Themes). */
    rule?: boolean;
}


/** Where a floating card is centred: the card of the page the tile stands in (its column), or -- the Workspace -- the tile's group. */
export type FloatingCentre = "column" | "group";


export interface FloatingOpen {
    tileId: string;
    id: string;
    /** The control that opened it: the focus returns to it. */
    opener: HTMLElement;
    /** The button pressed to open it where that was inside a dialog (a card's box): the one that carries the halo while the card is open. */
    pressed?: HTMLElement | null;
    /** What it is centred over. */
    anchor: HTMLElement | null;
    /** Opened by pressing a LINK (a tile's link line, a card's link symbol) rather than its own tile or box: a linked pair is then drawn together. */
    linked?: boolean;
    /** Opened from the Inventory or the Completed tile: alone, no carousel. */
    alone?: boolean;
    /** Opened from a card that stays open (a founder's responsibility): drawn BELOW that card, as a pair (StackUnderContext). */
    under?: boolean;
    /** Added by the "+" box a moment ago: removed again on closing while it is still completely blank. */
    fresh: boolean;
    /** What the box name above the card says where it is not the tile's title (a subcategory's name). */
    caption?: string;
    /** Who removes the card again when it is left blank, where it was not the tile's own "+" (a subcategory box's). */
    remover?: TileAdd;
}


/** What the arrows beside a card or a dialog do: go to the previous or the next one (a carousel, round the ends). */
export interface CarouselStep {
    /** What is stepped through ("card", "section"): the arrows' names. */
    what: string;
    previous: () => void;
    next: () => void;
    /**
     * Every one of the list, in its order, with the name its bullet's tooltip says: the rail of bullets under the arrows (one for each; this one's lit),
     * as the page's own rails -- any arrows that step through a list carry one.
     */
    items?: readonly { id: string; label: string; missing?: boolean }[];
    /** This one's place in `items`. */
    current?: number;
    /** Goes to the one of `items` with this id. */
    go?: (id: string) => void;
}


/** One card of a floating stack: the box name above it (its caption), its kind (its width) and the card. */
export interface FloatingItem {
    key: string;
    /** The name of the tile or box the card belongs to ("Operational", "Providers"): drawn centred ABOVE the card, outside it. */
    caption: string;
    kind: "card" | "founder";
    node: ReactNode;
    /** The card's own colour where it differs from its stack's (a card of Offering's Capability opened from a founder's card keeps the Offering's). */
    hue?: number;
    /** The box's "i" note, after the caption's words (what the dialog's header carries when the box is opened that way). */
    note?: InfoPoint[];
}

export interface OpenRequest { card?: string; tile?: string; box?: string; /** A card just made: left blank, it is taken away when it is closed. */ fresh?: boolean; /** Opened from the Inventory or the Completed tile: the card alone, with no arrows and no rail, as every card opened from them. */ alone?: boolean; /** Opened from a card that stays open: stacked below it (StackUnderContext). */ under?: boolean }
