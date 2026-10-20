import BackButton from "../../controls/BackButton.tsx";
import { CSSProperties, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CardRecordService } from "../../../services/CardRecordService.ts";
import { noteMomentText } from "../../notepad/Notepad.tsx";
import { createPortal } from "react-dom";
import { consumeKey } from "../fields/consumeKey.ts";
import InfoNote, { InfoText } from "../fields/InfoNote.tsx";
import { type SectionTile, type TileAdd, type CrumbNote, type CarouselStep, type FloatingItem, type DialogRail } from "./SectionTileTypes.ts";
import { dialogFrame } from "./SectionTileGeometry.tsx";
import { settlePage, InnerBackContext, CrumbsContext, OpenCardContext, InitialBoxContext, type InnerBackApi, type Crumb } from "./DialogLevels.tsx";
import { CARD_LEVEL, CarouselArrows } from "./CarouselArrows.tsx";

/** The record time of a card, under it, as a note's ("Recorded 17/10/2026 14:13"). */
export function FloatingRecord({ id }: { id: string }) {
    const at = useMemo(() => CardRecordService.recordedAt(id), [id]);
    return at > 0 ? <p className="floating-card-recorded">{"Recorded " + noteMomentText(at)}</p> : null;
}


/**
 * The Escape that is typed in the app header (the Notes panel, the reading-version menu, Search) belongs to what is open there: the layers of the page leave it
 * alone and the next Escape, once nothing is open in the header, closes them.
 */
export function headerOwnsEscape(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement | null;
    return !!target?.closest?.(".app-header") && !!document.querySelector(".app-header .notepad-panel, .app-header .theme-switch-list, .app-header .search-overlay, .app-header [aria-expanded=\"true\"]");
}


/**
 * ASKS THE PAGE'S TILES TO OPEN SOMETHING: a card of a tile (`card`, floating) or a section inside a tile's dialog (`tile` and `box`). A card that is linked to another
 * (a Legal expense to its registration, a registration to its expense) says so with this; the tiles that hold it answer.
 */
export const OPEN_EVENT = "section-tiles:open";


/** Closes every dialog and floating card of the page tiles (a card opened from another one, the parent and its child, starts afresh). */
export const CLOSE_TILES_EVENT = "section-tiles:close";


/**
 * FLOATING CARDS (docs/ai/layout-rules.md, "Floating cards"): one card alone -- a founder's, a resource's, an activity's, a
 * partner's, the Workspace form -- or a PAIR stacked (a parent card above its child), over the dimmed page (inert), each with its box
 * name centred above it (the caption, on the backdrop, outside the card), a drop shadow, and a Back button under the stack. Escape,
 * Back and a click on the dimmed space close it. It stands centred over its anchor: the card of the page it belongs to
 * (Infrastructure's or Offering's Capability's) or, the Workspace, the group of tiles; vertically on the middle of the part of the
 * anchor in view between the page heading's underline and the footer, or on the middle of that band where the stack is taller than
 * that part of the anchor.
 */
export function FloatingCards({
    cards, anchor, fresh = false, pair = false, hue, label, attrs, step, onClose, incomplete = false
}: {
    cards: FloatingItem[];
    /** The arrows beside the card that go to the previous or the next card of its list (none where it stands alone). */
    step?: CarouselStep;
    anchor: HTMLElement | null;
    fresh?: boolean;
    /** A pair opened from a card (it is not closed by the opening of itself). */
    pair?: boolean;
    hue: number;
    label: string;
    attrs?: Record<string, string>;
    /** The card lacks an answer: its frame says so (as its tile does). */
    incomplete?: boolean;
    onClose: () => void;
}) {
    const overlay = useRef<HTMLDivElement | null>(null);
    const panel = useRef<HTMLDivElement | null>(null);
    const [place, setPlace] = useState<{ left: number; top: number; band: number } | null>(null);
    // THE SHADE OF THE CHAPTER BEHIND: the frame the card stands over (its anchor), as it stands, with its own corners.
    const [shade, setShade] = useState<{ left: number; top: number; width: number; height: number; radius: string } | null>(null);
    const closeRef = useRef(onClose);
    closeRef.current = onClose;
    const anchorRef = useRef(anchor);
    anchorRef.current = anchor;
    useEffect(() => () => settlePage(), []);

    useLayoutEffect(() => {
        const node = panel.current;
        if (!node) {
            return;
        }
        // THE SHADE of what a floating card stands over, once, and only where nothing shades it already:
        //  1. the card stands over a CHAPTER (no dialog): the chapter's frame is shaded, with the chapter's own corners;
        //  2. the card stands over a dialog that is not a chapter (the Inventory, the Completed): its TILES are shaded, with the corners of the dialog;
        //  3. the card stands over a chapter beside a dialog of a category: that chapter is already shaded by the dialog's own shade -- the card adds none.
        // It is measured again whenever the page or a box scrolls or the window changes, so it stays where the chapter is.
        const measureShade = () => {
            const dialogs = [...document.querySelectorAll<HTMLElement>(".section-tile-overlay:not(.floating-overlay) > .section-tile-dialog")];
            const dialog = dialogs[dialogs.length - 1];
            let under: HTMLElement | null = null;
            let area: HTMLElement | null = null;
            if (!dialog) {
                under = anchorRef.current;
                area = under;
            } else if (dialog.dataset.tile === "overview" || dialog.dataset.tile === "completed") {
                under = dialog;
                area = dialog.querySelector<HTMLElement>(".card-tile-grid, .card-boxes, .section-tiles");
            }
            let frame = under?.getBoundingClientRect();
            let box = area?.getBoundingClientRect();
            let radius = under ? getComputedStyle(under).borderRadius : "0px";
            // (Where the card stands over TILES -- the Inventory, the Completed -- the shade is the tiles it covers, whole, as one block; with no tile behind it, the card and 12px round it.)
            if (dialog && under === dialog && node) {
                const card = node.getBoundingClientRect();
                const covered = [...dialog.querySelectorAll<HTMLElement>(".card-tile, .section-tile, .card-box")].map(tile => tile.getBoundingClientRect())
                    .filter(tile => tile.width > 0 && tile.left < card.right && tile.right > card.left && tile.top < card.bottom && tile.bottom > card.top);
                const dialogBox = dialog.getBoundingClientRect();
                // (The tiles behind the card, whole, as far as the dialog shows them; with none behind it, the card and 12px round it, as far as the window shows.)
                const sides = covered.length > 0
                    ? {
                        left: Math.max(dialogBox.left, Math.min(...covered.map(tile => tile.left))),
                        right: Math.min(dialogBox.right, Math.max(...covered.map(tile => tile.right))),
                        top: Math.max(dialogBox.top, Math.min(...covered.map(tile => tile.top))),
                        bottom: Math.min(dialogBox.bottom, Math.max(...covered.map(tile => tile.bottom)))
                    }
                    : { left: Math.max(0, card.left - 12), right: Math.min(window.innerWidth, card.right + 12), top: card.top - 12, bottom: Math.min(window.innerHeight, card.bottom + 12) };
                const shape = { ...sides, width: sides.right - sides.left, height: sides.bottom - sides.top, x: sides.left, y: sides.top, toJSON: () => ({}) } as DOMRect;
                box = shape;
                frame = shape;
                radius = getComputedStyle(under).borderRadius === "0px" ? "12px" : getComputedStyle(under).borderRadius;
            }
            const header = document.querySelector<HTMLElement>(".app-header")?.getBoundingClientRect().bottom ?? 0;
            const left = box && frame ? Math.max(box.left, frame.left) : 0;
            const right = box && frame ? Math.min(box.right, frame.right) : 0;
            const top = box && frame ? Math.max(box.top, frame.top, header) : 0;
            const bottom = box && frame ? Math.min(box.bottom, frame.bottom, window.innerHeight) : 0;
            const next = under && right - left > 0 && bottom - top > 0 ? { left, top, width: right - left, height: bottom - top, radius } : null;
            setShade(previous => previous && next && previous.left === next.left && previous.top === next.top && previous.width === next.width && previous.height === next.height ? previous : next);
        };
        const position = () => {
            const width = node.offsetWidth;
            const frame = dialogFrame();
            // (Only the app header cuts a floating card: it scrolls under it, nothing else clips it.)
            const bandTop = document.querySelector<HTMLElement>(".app-header")?.getBoundingClientRect().bottom ?? (frame ? frame.top : 0);
            // (Only the header cuts a card: it runs to the window's bottom, never to the footer.)
            const bandBottom = window.innerHeight - 8;
            const where = anchorRef.current;
            // Across: centred over the anchor (the page's column, or the Workspace's group of tiles).
            const centreX = where ? where.getBoundingClientRect().left + where.getBoundingClientRect().width / 2 : window.innerWidth / 2;
            // Down: the TOP of the first card stands on the top of the first row of tiles of the page's column as the page rests (scrolled up) --
            // that row's top now, plus how far the column's body is scrolled. Its box name stands above that line; a taller stack extends
            // downward and scrolls inside the host (the Back button stays in view at its foot).
            const row = where?.querySelector<HTMLElement>(".section-tile-slot") ?? null;
            const body = node.querySelector<HTMLElement>(".floating-card-body");
            // (Its place in the host's own layout, not its place on the screen: the host may be scrolled.)
            const bodyOffset = body ? body.offsetTop - (body.offsetParent === node ? 0 : (body.offsetParent as HTMLElement | null)?.offsetTop ?? 0) : 0;
            let top: number;
            if (where && body) {
                // EVERY card starts at one level: the first row of tiles of its column (a Workspace group's too) where that stands under the column's title, else where it would stand -- the frame's top plus the height of the title, whatever the column holds (a table, a dialog over it).
                const frameTop = where.getBoundingClientRect().top;
                const rowTop = row ? row.getBoundingClientRect().top : null;
                top = (rowTop !== null && rowTop - frameTop >= 0 && rowTop - frameTop <= 120 ? rowTop : frameTop + CARD_LEVEL) - bodyOffset;
            } else {
                top = bandTop + (bandBottom - bandTop - Math.min(node.scrollHeight, bandBottom - bandTop)) / 2;
            }
            // (Where the first row is out of view -- the cards stacked under 1100px, the page scrolled -- the stack stands at the top of the band instead:
            // under the page heading's underline, never below the point where 200px of it would still show.)
            top = Math.min(Math.max(top, bandTop + 8), Math.max(bandTop + 8, bandBottom - 200));
            const left = Math.max(8, Math.min(centreX - width / 2, window.innerWidth - 8 - width));
            measureShade();
            setPlace(previous => previous && Math.abs(previous.band - bandTop) < 0.5 && Math.abs(previous.left - left) < 0.5 && Math.abs(previous.top - top) < 0.5 ? previous : { left, top, band: bandTop });
        };
        position();
        window.addEventListener("resize", position);
        window.addEventListener("scroll", measureShade, true);
        if (typeof ResizeObserver === "undefined") {
            return () => {
                window.removeEventListener("resize", position);
                window.removeEventListener("scroll", measureShade, true);
            };
        }
        const observer = new ResizeObserver(position);
        observer.observe(node);
        return () => {
            window.removeEventListener("resize", position);
            window.removeEventListener("scroll", measureShade, true);
            observer.disconnect();
        };
    }, []);

    // A new card takes the focus in its name; any other the stack itself, so Escape reaches it.
    // (Once it is placed and shown: a hidden element cannot take the focus.)
    const focused = useRef(false);
    useEffect(() => {
        if (!place || focused.current) {
            return;
        }
        focused.current = true;
        // (A stack taller than the band between the heading and the footer scrolls inside: it always opens at its top, the name of the first card in view.)
        if (panel.current) {
            panel.current.scrollTop = 0;
        }
        const field = fresh ? panel.current?.querySelector<HTMLElement>("textarea.card-name-input") : null;
        (field ?? panel.current)?.focus({ preventScroll: true });
    }, [place, fresh]);

    // The tiles area behind a card stays USABLE (the scrim is only a tint: it takes no clicks). A press anywhere OUTSIDE the card closes it -- on empty space that
    // is the whole effect (back to the view it was opened from); on a tile the press goes on to open that tile in its place. Only the topmost card answers.
    useEffect(() => {
        function onPress(event: MouseEvent) {
            const target = event.target as HTMLElement | null;
            const overlays = document.querySelectorAll(".floating-overlay");
            if (!target || overlays[overlays.length - 1] !== overlay.current) {
                return;
            }
            if (overlay.current?.contains(target) || target.closest("[role=listbox], [role=menu], .app-header")) {
                return;
            }
            closeRef.current();
        }
        document.addEventListener("mousedown", onPress);
        return () => document.removeEventListener("mousedown", onPress);
    }, []);

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key !== "Escape" || event.defaultPrevented || headerOwnsEscape(event)) {
                return;
            }
            consumeKey(event);
            const popup = openPopup(panel.current);
            if (popup) {
                popup.click();
                return;
            }
            // ESCAPE leaves every layer at once (the cards, the dialogs under them): back to the page.
            document.dispatchEvent(new CustomEvent(CLOSE_TILES_EVENT));
        }
        const onCloseAll = () => {
            closeRef.current();
        };
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener(CLOSE_TILES_EVENT, onCloseAll);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener(CLOSE_TILES_EVENT, onCloseAll);
        };
    }, [pair]);

    return createPortal(
        <div
            ref={overlay}
            className="section-tile-overlay floating-overlay business-foundation business-engagement business-capability"
            data-carousel={step ? "" : undefined}
            // (The overlay starts under the app header and scrolls: the header is the only edge that cuts a card.)
            style={place ? { top: place.band } : undefined}
        >
            {/* The chapter behind the card is shaded, the size and shape of its frame, and frozen: a press on it closes the card and does nothing else. */}
            {shade && <div className="floating-chapter-shade" aria-hidden="true" style={{ left: shade.left, top: shade.top, width: shade.width, height: shade.height, borderRadius: shade.radius }} onMouseDown={() => closeRef.current()} />}
            {step && place && <CarouselArrows target={panel} step={step} hue={hue} />}
            <div
                ref={panel}
                className={"floating-card-host floating-card-" + cards[0].kind}
                data-incomplete={incomplete ? "" : undefined}
                role="dialog"
                aria-modal="true"
                aria-label={label}
                tabIndex={-1}
                {...attrs}
                style={{
                    "--strategy-theme-hue": hue,
                    "--floating-hue": hue,
                    left: place ? place.left : 0,
                    top: place ? place.top - place.band : 0,
                    visibility: place ? "visible" : "hidden"
                } as CSSProperties}
            >
                <div className="floating-card-stack">
                    {cards.map(card => (
                        <div className="floating-card-item" key={card.key} data-kind={card.kind} style={card.hue !== undefined ? { "--strategy-theme-hue": card.hue, "--floating-hue": card.hue } as CSSProperties : undefined}>
                            <div className="floating-card-caption">
                                <InfoText text={card.caption}>
                                    {card.note && card.note.length > 0 && <InfoNote label={card.caption} points={card.note} fullList />}
                                </InfoText>
                            </div>
                            <div className={"floating-card-body floating-card-" + card.kind + (card.kind === "card" ? " card-box-open" : "")}>{card.node}</div>
                            <FloatingRecord id={card.key} />
                        </div>
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
}


/**
 * The control of a popup of the dialog's own (a list, an "i") that is open: it
 * takes Escape first.
 */
export function openPopup(dialog: HTMLElement | null): HTMLElement | null {
    return dialog?.querySelector<HTMLElement>('[aria-haspopup][aria-expanded="true"]') ?? null;
}


export function TileDialog({

    tile,

    hue,

    opener,

    initialBox,

    onClose: close,

    onOpenCard,

    step

}: {

    tile: SectionTile;
    /** The arrows beside the dialog: the previous or the next tile of the section. */
    step?: CarouselStep;
    /** The subcategory box the dialog opens on (a list item that named one). */
    initialBox: string | null;
    hue: number;
    /** The tile that opened the dialog: a box inside never exceeds its side. */
    opener: HTMLElement | null;
    onClose: () => void;
    /** A card chosen inside (a card box pressed, a subcategory box that holds one card, a "+" box): it is opened floating, outside the dialog. Null for a tile that keeps its cards in the dialog. */
    onOpenCard: ((id: string, caption: string | undefined, remover: TileAdd | undefined, pointer: boolean, fresh: boolean) => void) | null;

}) {

    // Closing first lets what is inside tidy up (a card left completely blank is removed).
    const closing = useRef(new Set<() => void>());
    const closeRef = useRef(close);
    closeRef.current = close;
    const onClose = () => {
        closing.current.forEach(fn => fn());
        closeRef.current();
    };
    const [tileSize] = useState(() => opener?.getBoundingClientRect().width ?? 0);

    const panel = useRef<HTMLDivElement | null>(null);
    const nameId = useId();

    // The square between the heading's underline and the footer; measured on opening and
    // whenever the window changes size.
    // (Measured when first drawn, not after: the text boxes inside size themselves to the
    // width they are first laid out at.)
    const [square, setSquare] = useState<{ width: number; height: number; top: number; left?: number } | null>(() => dialogFrame(opener));
    useLayoutEffect(() => {
        const onResize = () => setSquare(dialogFrame(opener));
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // The way back inside the dialog's content, if it has one shown (useDialogInnerBack).
    const innerBack = useRef<(() => void) | null>(null);
    const [subtitle, setSubtitle] = useState<string | undefined>(undefined);
    const [crumbs, setCrumbs] = useState<readonly Crumb[]>([]);
    const levels = useRef<({ back: () => void; name?: string; note?: CrumbNote } | null)[]>([]);
    const innerStep = useRef<((direction: 1 | -1) => boolean) | null>(null);
    const stepLevels = useRef<(((direction: 1 | -1) => boolean) | null)[]>([]);
    const railLevels = useRef<(DialogRail | null)[]>([]);
    const [innerRail, setInnerRail] = useState<DialogRail | null>(null);
    const innerContext = useRef<InnerBackApi>({
        set: (depth, back, name, note) => {
            levels.current[depth] = back ? { back, name, note } : null;
            const shown = levels.current.filter((level): level is { back: () => void; name?: string; note?: CrumbNote } => level !== null);
            innerBack.current = shown.length > 0 ? shown[shown.length - 1].back : null;
            const named = shown.filter(level => !!level.name && level.name.trim().length > 0);
            setSubtitle(named.length > 0 ? named.map(level => level.name).join(", ") : undefined);
            // (Kept as it was where nothing changed: a view registers again on every render, and a new array each time would loop.)
            setCrumbs(previous => previous.length === named.length && previous.every((crumb, at) => crumb.name === named[at].name && JSON.stringify(crumb.note) === JSON.stringify(named[at].note))
                ? previous
                : named.map(level => ({ name: level.name as string, note: level.note })));
        },
        onClose: (fn) => {
            closing.current.add(fn);
            return () => { closing.current.delete(fn); };
        },
        tileSize,
        // (Each inner view registers its own way of stepping at its depth; the deepest one answers the arrows.)
        setStep: (depth, next, rail) => {
            stepLevels.current[depth] = next;
            railLevels.current[depth] = next ? rail ?? null : null;
            const shown = stepLevels.current.filter((level): level is (direction: 1 | -1) => boolean => level !== null && level !== undefined);
            innerStep.current = shown.length > 0 ? shown[shown.length - 1] : null;
            // (The deepest level that has a rail of its own answers.)
            const rails = railLevels.current.filter((level): level is DialogRail => level !== null && level !== undefined);
            const deepest = rails.length > 0 ? rails[rails.length - 1] : null;
            setInnerRail(previous => (previous === null && deepest === null) || (previous && deepest && previous.current === deepest.current && previous.items.length === deepest.items.length && previous.items.every((item, at) => item.id === deepest.items[at].id && item.label === deepest.items[at].label))
                ? previous
                : deepest);
        }
    });
    const back = () => (innerBack.current ? innerBack.current() : onClose());

    // A press that starts on the dimmed backdrop and ends on it closes the dialog; one that
    // starts inside the dialog (a text drag) and ends outside never does.
    const pressedBackdrop = useRef(false);

    // Opened with the keyboard on the dialog itself, so Escape reaches it.
    useLayoutEffect(() => {
        panel.current?.focus({ preventScroll: true });
    }, []);

    // (Closed, the page is the default page: no tile grown under a resting pointer.)
    useEffect(() => () => settlePage(), []);

    // The page behind is inert while the dialog is open.
    const host = useRef<HTMLDivElement | null>(null);
    useLayoutEffect(() => {
        const inerted: Element[] = [];
        // (The app header -- the reading version, Notes, Search, Review, Reload -- stays live: a box around it is entered, and only what is beside it made inert.)
        const header = document.querySelector(".app-header");
        const quiet = (parent: Element) => {
            for (const child of Array.from(parent.children)) {
                if (child === host.current || child === header || child.hasAttribute("inert")) {
                    continue;
                }
                if (header && child.contains(header)) {
                    quiet(child);
                    continue;
                }
                child.setAttribute("inert", "");
                inerted.push(child);
            }
        };
        quiet(document.body);
        return () => inerted.forEach(child => child.removeAttribute("inert"));
    }, []);

    // Another card is opened from a card (the parent and its child): this dialog gives way (a blank card is removed, as on closing).
    const closeAll = useRef(onClose);
    closeAll.current = onClose;
    useEffect(() => {
        const handler = () => closeAll.current();
        document.addEventListener(CLOSE_TILES_EVENT, handler);
        return () => document.removeEventListener(CLOSE_TILES_EVENT, handler);
    }, []);

    // Escape closes the dialog, and only it: the key goes no further (it
    // is the page's Back otherwise; see consumeKey). A popup open inside
    // takes its own Escape first (one that has focus answers it itself and
    // the key never gets here); for one that has not, this closes the popup,
    // not the dialog.
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key !== "Escape" || event.defaultPrevented || headerOwnsEscape(event)) {
                return;
            }
            // (A card floating over this dialog takes the key: it closes every layer.)
            if (document.querySelector(".floating-overlay")) {
                return;
            }
            consumeKey(event);
            const popup = openPopup(panel.current);
            if (popup) {
                popup.click();
                return;
            }
            // ESCAPE closes the dialog whatever view of it is open (group, category, section): back to the page.
            onClose();
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
        // onClose is a fresh function each render; closing is all it does.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return createPortal(
        <div
            ref={host}
            className={"section-tile-overlay business-foundation business-engagement business-capability" + (square ? " section-tile-overlay-measured" : "") + (square?.left !== undefined ? " section-tile-overlay-placed" : "") + (tile.wide ? " section-tile-overlay-wide" : "")}
            data-carousel={step ? "" : undefined}
            style={square ? { "--section-dialog-width": square.width + "px", "--section-dialog-height": square.height + "px", "--section-dialog-top": square.top + "px", ...(square.left !== undefined ? { "--section-dialog-left": square.left + "px" } : {}) } as CSSProperties : undefined}
            // (A press on the empty space with a card floating over this dialog closes the card only: the card answers it.)
            onMouseDown={(event) => { pressedBackdrop.current = event.target === event.currentTarget && !document.querySelector(".floating-overlay"); }}
            onClick={(event) => {
                if (event.target === event.currentTarget && pressedBackdrop.current) {
                    back();
                }
                pressedBackdrop.current = false;
            }}
        >
            <div
                ref={panel}
                className={"section-tile-dialog business-foundation-input business-foundation-card" + (tile.channel ? " section-tile-dialog-channel" : "") + (tile.completed ? " section-tile-dialog-completed" : "")}
                role="dialog"
                data-tile={tile.id}
                aria-modal="true"
                aria-labelledby={nameId}
                tabIndex={-1}
                style={{ "--strategy-theme-hue": hue } as CSSProperties}
            >

                <span id={nameId} className="section-tile-dialog-name">{subtitle ? tile.title + ", " + subtitle : tile.title}</span>

                <div className="section-tile-dialog-body">
                    <InnerBackContext.Provider value={innerContext.current}>
                        <CrumbsContext.Provider value={crumbs}>
                            <InitialBoxContext.Provider value={initialBox}>
                                <OpenCardContext.Provider value={onOpenCard}>
                                    {tile.content()}
                                </OpenCardContext.Provider>
                            </InitialBoxContext.Provider>
                        </CrumbsContext.Provider>
                    </InnerBackContext.Provider>
                </div>

                <div className="section-tile-dialog-foot">
                    <BackButton className="section-tile-back" onClick={back} />
                </div>

            </div>

            {step && <CarouselArrows target={panel} step={{ ...step, ...(innerRail ? { items: innerRail.items, current: innerRail.current, go: innerRail.go } : {}), previous: () => { if (!innerStep.current?.(-1)) { step.previous(); } }, next: () => { if (!innerStep.current?.(1)) { step.next(); } } }} hue={hue} back={back} />}
        </div>,
        document.body
    );

}
