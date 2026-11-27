import { ComponentProps, Fragment, MouseEvent as ReactMouseEvent, ReactNode, RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import AddButton from "../../controls/AddButton.tsx";
import { type TileLink, type ItemMark } from "./SectionTileTypes.ts";
import { PAGE_STATUS_WORDS } from "../../../framework/engine/status/PageStatus";
import "../../../styles/status-shape.css";
import { incompleteTitle, TILE_DIVIDER, drawnTitle, plainTitle, brokenLines, boldWords, scaleOrigin } from "./SectionTileGeometry.tsx";

/**
 * What a tile or a box shows: its title, centred, and -- while the section holds nothing yet --
 * a small "+" under the title (decorative; the button is described as "No items yet").
 */
/**
 * A SYMBOL IN ITS CARD'S HUE (owner, 2026-11-26 21:32 UTC+2: "Make a rule, and fix it on the root of all the icons, that they take the hue of their cards"; Interface 11,
 * section 8.1): every symbol on a tile -- a Capability's, a System's, a Resource's -- is drawn as a mask of its file over its card's ink (colors.css, .symbol-mark), never
 * as a picture in a colour of its own. Its words are said by the title or the line beside it, so the symbol itself is hidden from assistive technology.
 */
export function SymbolMark({ src, className }: { src: string; className: string }) {
    return <span className={"symbol-mark " + className} style={{ "--symbol": "url(\"" + src + "\")" } as React.CSSProperties} aria-hidden="true" />;
}

export function TileFace({ title, empty, items, glyph = true, alerts, marks, icon, mark, symbol }: { title: string; empty?: boolean; items?: readonly string[]; glyph?: boolean; alerts?: readonly (readonly string[] | undefined)[]; marks?: readonly (ItemMark | undefined)[]; /** A symbol before the title, on its line. */ icon?: string; /** A symbol under the title's words, above its rule. */ mark?: string; /** A symbol that stands for the title where a dialog's titles do not fit (TileTitle, data-title-symbols): a Resource category's. */ symbol?: string }) {
    return (
        <>
            {/* (A title with a forced break is drawn on its lines: the one title that is allowed two.) */}
            {title.includes("\n")
                ? <TileTitle className="section-tile-title-broken">{brokenLines(title).map((part, at) => <Fragment key={at}>{at > 0 && <br />}{drawnTitle(part)}</Fragment>)}</TileTitle>
                : <TileTitle>{icon && <SymbolMark src={icon} className="section-tile-title-icon" />}{mark ? <span className="section-tile-title-words">{drawnTitle(plainTitle(title))}</span> : symbol ? <span className="section-tile-title-named">{drawnTitle(plainTitle(title))}</span> : drawnTitle(plainTitle(title))}{mark && <SymbolMark src={mark} className="section-tile-title-mark" />}{symbol && <SymbolMark src={symbol} className="section-tile-title-symbol" />}</TileTitle>}
            {empty && (
                <>
                    {/* (A tile that has the "+" box does not draw this glyph as well.) */}
                    {glyph && <span className="section-tile-empty" aria-hidden="true">+</span>}
                    <span className="section-tile-empty-note">No items yet</span>
                </>
            )}
            {!empty && items && items.length > 0 && <TileList items={items} alerts={alerts} marks={marks} />}
        </>
    );
}


/**
 * THE LONG TITLE'S SLIDE: a title cut by an ellipsis slides to the left under the pointer (over its tile) to show its whole name, and slides back when the pointer
 * leaves. The title keeps its box -- its size, its place and its rule do not change, only what the box shows (its scroll). It slides whatever the motion setting (it moves only under the pointer, and is the one way to read the cut name).
 */
export function useTitleSlide(ref: RefObject<HTMLElement | null>) {
    useEffect(() => {
        // (A numbered title slides its TEXT: the order number stays where it stands and the text goes behind it.)
        const node = ref.current?.querySelector<HTMLElement>(".section-tile-title-text") ?? ref.current;
        // (A title one types in -- a frame's name -- is its own host.)
        const host = node?.closest<HTMLElement>(".section-tile-slot") ?? node?.closest<HTMLElement>("button, .section-tile") ?? (node instanceof HTMLInputElement ? node : null);
        if (!node || !host || typeof requestAnimationFrame === "undefined") {
            return;
        }
        let frame = 0;
        // (While it slides the title shows its text to the very end: the ellipsis is off, and comes back when the title is home.)
        const slideTo = (target: number) => {
            cancelAnimationFrame(frame);
            const from = node.scrollLeft;
            const distance = Math.abs(target - from);
            if (distance < 1) {
                if (target === 0) {
                    node.style.textOverflow = "";
                }
                return;
            }
            // (About 100px a second, at least a third of a second and at most a second and a half; the way back is quicker.)
            const duration = Math.min(1500, Math.max(target === 0 ? 220 : 350, distance * (target === 0 ? 4 : 10)));
            const began = performance.now();
            const step = (now: number) => {
                const t = Math.min(1, (now - began) / duration);
                node.scrollLeft = from + (target - from) * (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
                if (t < 1) {
                    frame = requestAnimationFrame(step);
                } else if (target === 0) {
                    node.style.textOverflow = "";
                }
            };
            frame = requestAnimationFrame(step);
        };
        const enter = () => {
            // (A title being typed in stays where the cursor puts it.)
            if (node === document.activeElement) {
                return;
            }
            const room = node.scrollWidth - node.clientWidth;
            if (room > 1) {
                node.style.textOverflow = "clip";
                // (The distance is measured now, so a resize or a font change is always counted: the last letter ends at the title's right edge.)
                slideTo(Math.ceil(node.scrollWidth - node.clientWidth));
            }
        };
        const leave = () => {
            if (node !== document.activeElement) {
                slideTo(0);
            }
        };
        host.addEventListener("pointerenter", enter);
        host.addEventListener("pointerleave", leave);
        // (Left after typing, it goes home: the start of the name and its ellipsis.)
        const home = () => slideTo(0);
        node.addEventListener("blur", home);
        return () => {
            cancelAnimationFrame(frame);
            host.removeEventListener("pointerenter", enter);
            host.removeEventListener("pointerleave", leave);
            node.removeEventListener("blur", home);
            node.scrollLeft = 0;
            node.style.textOverflow = "";
        };
    }, [ref]);
}


/**
 * A TILE'S TITLE (docs/ai/09-layout-rules.md, "Tile anatomy"): its last line stands on the line one third
 * down the square, so a long title grows upward. The room above that line holds three lines of the title
 * size at the usual tile; where a title does not fit it (a narrow tile, a long word), it drops to the small
 * size of the type scale -- that title only -- so its first line stays 12px or more from the square's top.
 */
export function TileTitle({ children, className }: { children: ReactNode; className?: string }) {
    const title = useRef<HTMLSpanElement | null>(null);
    useTitleSlide(title);
    useLayoutEffect(() => {
        const node = title.current;
        const tile = node?.closest<HTMLElement>(".section-tile");
        if (!node || !tile) {
            return;
        }
        // EVERY TITLE AT ONE PLACE (layout rules section 8, "Tile anatomy"): it wraps to three lines at most, growing upward; a longer one is cut with an ellipsis and its full text
        // is the tooltip. The list under it starts the same distance under the rule on every tile of a size.
        const apply = () => {
            // (A TITLE THAT WRAPS IS AS WIDE AS ITS LONGEST LINE (layout rules section 8, "Tile anatomy"; 2026-11-20): its rule then runs under its words, as a
            // title broken by hand does, never across the whole tile.)
            tile.removeAttribute("data-title-small");
            tile.closest<HTMLElement>(".section-tile-slot")?.removeAttribute("data-title-small");
            const fitWidth = () => {
            node.style.width = "";
            // (A dialog's title over its symbol stands across the tile, its words centred: never fitted to its widest line.)
            if (node.querySelector(":scope > .section-tile-title-symbol") && tile.closest(".section-tile-dialog[data-symbol-layout]")) {
                return;
            }
            const range = document.createRange();
            // (A title with a symbol under it measures its words alone: TileFace's `mark`.)
            range.selectNodeContents(node.querySelector(".section-tile-title-words") ?? node);
            // (A line is every box that shares its height: the symbol before a title sits a little lower than its words, on the same line.)
            const lines: { top: number; bottom: number; left: number; right: number }[] = [];
            // (The symbol under the words is not a line of them: the rule runs under the words' width.)
            const mark = node.querySelector(".section-tile-title-mark")?.getBoundingClientRect();
            for (const rect of Array.from(range.getClientRects?.() ?? [])) {
                if (rect.width < 0.5 || (mark && rect.top >= mark.top - 0.5 && rect.bottom <= mark.bottom + 0.5)) {
                    continue;
                }
                const line = lines.find(other => rect.top < other.bottom && rect.bottom > other.top);
                if (line) {
                    Object.assign(line, { top: Math.min(line.top, rect.top), bottom: Math.max(line.bottom, rect.bottom), left: Math.min(line.left, rect.left), right: Math.max(line.right, rect.right) });
                } else {
                    lines.push({ top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right });
                }
            }
            if (lines.length > 1) {
                const style = getComputedStyle(node);
                const widest = Math.max(...lines.map(line => line.right - line.left));
                node.style.width = Math.ceil(widest + (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0)) + "px";
            }
            };
            fitWidth();
            // (A MASTER TILE'S TITLE TOO LONG FOR THE ROOM ABOVE ITS LINE DROPS TO THE SMALL SIZE, THAT TITLE ONLY (layout rules section 8, "Tile anatomy": its first line at
            // least 12px from the square's top; 2026-11-20, "BREAK-EVEN & SUSTAINABILITY" at 1366 and 768): the tile and its slot take data-title-small, and it is measured again.)
            // (A WORD WIDER THAN THE TILE takes the small size too: a word is never cut at a letter ("RESOURCE / S"), now that the title keeps the window's size on
            // every tile -- the responsive layout approved, 2026-11-23 23:21 UTC+2, section 4.2. Laid out with its words whole, it runs past its own width.)
            const wordTooWide = (): boolean => {
                const width = node.style.width;
                node.style.width = "";
                node.style.overflowWrap = "normal";
                node.style.wordBreak = "normal";
                const over = node.scrollWidth > node.clientWidth + 1;
                node.style.overflowWrap = "";
                node.style.wordBreak = "";
                node.style.width = width;
                return over;
            };
            // (A tile not shown -- another Segment's chapter, behind the carousel -- measures nothing and needs nothing: it never makes the page's titles small.)
            const shown = tile.getBoundingClientRect().width > 0;
            // (EVERY TILE TITLE ONE SIZE (owner, 2026-11-24 04:54 UTC+2: "All the tiles' titles should have the same size!"): a master tile's title keeps the size
            // and wraps onto its lines; only a word wider than the tile -- never cut at a letter -- takes the small size, and then every title of the page.)
            const quadTile = !!node.closest(".section-tiles-quad");
            // (The same on every page of a window: the longest word of the app's master tile titles, RELATIONSHIP (Customer's Relationship), measured in this title's
            // type against the tile's width -- where it would not stand whole, every master tile takes the small size, whatever its own words.)
            const longestTooWide = (): boolean => {
                const probe = document.createElement("span");
                probe.textContent = "Relationship";
                probe.style.cssText = "position: absolute; visibility: hidden; white-space: nowrap;";
                node.appendChild(probe);
                const width = probe.getBoundingClientRect().width;
                probe.remove();
                const style = getComputedStyle(tile);
                return width > tile.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0) + 0.5;
            };
            const needs = shown && (quadTile ? wordTooWide() || longestTooWide() : node.getBoundingClientRect().top - tile.getBoundingClientRect().top < 12 + tile.clientTop || node.scrollHeight > node.clientHeight + 1 || wordTooWide());
            // (ONE TITLE SIZE ON A PAGE (owner, 2026-11-24 03:14 UTC+2: "Be consistent, use only the same size and style for the text per titles"): where one master tile's
            // title needs the small size, every master tile's title of the page takes it; the others are told to measure again.)
            const quad = !!node.closest(".section-tiles-quad");
            const card = quad ? tile.closest<HTMLElement>(".conversation-card") : null;
            // (Its own need changed: the page's other titles measure again, so a need that has gone -- measured while the tiles were still taking their size -- never
            // keeps the page small.)
            if (quad && tile.hasAttribute("data-title-needs-small") !== needs) {
                tile.toggleAttribute("data-title-needs-small", needs);
                window.requestAnimationFrame(() => window.dispatchEvent(new Event("tile-titles-unified")));
            }
            const small = quad && (card ? card.querySelector(".section-tiles-quad .section-tile[data-title-needs-small]") !== null : needs);
            if (small) {
                tile.setAttribute("data-title-small", "");
                tile.closest<HTMLElement>(".section-tile-slot")?.setAttribute("data-title-small", "");
                fitWidth();
            }
            if (card && card.hasAttribute("data-titles-small") !== small) {
                card.toggleAttribute("data-titles-small", small);
                window.requestAnimationFrame(() => window.dispatchEvent(new Event("tile-titles-unified")));
            }
            // (ONE TITLE SIZE ON A PAGE (owner, 2026-11-24 03:14 UTC+2: "Be consistent, use only the same size and style for the text per titles"): where one master tile's
            // title takes the small size, every master tile's title of the page does (the page's data-titles-small, 01-tiles-and-dialog.css); the others are told to
            // measure again.)

            // The distance from the title's rule to the foot of the title's row: the list under it comes up by that (or goes down, a title of two lines).
            const row = parseFloat(getComputedStyle(tile).gridTemplateRows.split(" ")[0]) || 0;
            const standing = String(row > 0 ? Math.round((row - (node.offsetTop + node.offsetHeight + tile.clientTop)) * 10) / 10 : parseFloat(getComputedStyle(node).marginBottom) || 0) + "px";
            tile.style.setProperty("--tile-lift", standing);
            tile.closest<HTMLElement>(".section-tile-slot")?.style.setProperty("--tile-lift", standing);
            // The list stands exactly one gap (12px) under the rule: what the layout leaves over is taken off (not while the tile is scaled by the pointer).
            const slot = tile.closest<HTMLElement>(".section-tile-slot");
            const list = slot?.querySelector<HTMLElement>(".section-tile-list");
            const box = tile.getBoundingClientRect();
            if (slot && list && Math.abs(box.height - tile.offsetHeight) < 0.5) {
                // (Less the list's own centring in its room: TileList's --list-centre.)
                const extra = list.getBoundingClientRect().top - node.getBoundingClientRect().bottom - 12 - (parseFloat(list.style.getPropertyValue("--list-centre")) || 0);
                if (Math.abs(extra) > 0.2 && Math.abs(extra) < 6) {
                    const corrected = String(Math.round((parseFloat(standing) + extra) * 10) / 10) + "px";
                    tile.style.setProperty("--tile-lift", corrected);
                    slot.style.setProperty("--tile-lift", corrected);
                }
            }
            // (A DIALOG'S TITLES AS THEIR SYMBOLS WHERE THEY DO NOT FIT (owner, 2026-11-24 10:12 UTC+2, the Resources dialog at 1366 x 640: "the used could read only 4
            // letters. Here, place 2 columns, instead of 3, and also replace their titles with their symbols and add tooltips"): a title with a symbol measures its
            // words against a third of the dialog's grid -- three across --; where one does not fit, the dialog takes two across and every such title shows its
            // symbol, its name in the tooltip.)
            const named = node.querySelector<HTMLElement>(":scope > .section-tile-title-named");
            const dialog = named ? tile.closest<HTMLElement>(".section-tile-dialog") : null;
            if (named && dialog) {
                const width = named.getBoundingClientRect().width;
                if (width > 0) {
                    node.setAttribute("data-words-width", String(Math.ceil(width)));
                }
                // (The grid the tiles stand in, its width the dialog's whichever the number across.)
                const box = tile.closest<HTMLElement>(".section-tiles");
                const style = getComputedStyle(tile);
                const three = box && box.clientWidth > 0 ? (box.clientWidth - 2 * 12) / 3 - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0) : Infinity;
                // (WHERE A DIALOG'S TILES ARE TOO SMALL FOR TEXT (owner, 2026-11-25: "When in a dialogue card, the tiles are too small to use text, so we place symbols,
                // keep 3 tiles per row"): a tile under 180px a side (a tablet in portrait three across), beside a phone's; a larger tile keeps its cut title sliding under the pointer.)
                // (And on every touch screen, whatever the tile's size (owner, 2026-11-26 17:04 UTC+2, the touch proposal): a cut title slides only under a pointer,
                // so a finger reads its whole title, over its symbol.)
                const touch = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
                const small = touch || (typeof window.matchMedia === "function" && window.matchMedia("(min-width: 601px)").matches && tile.getBoundingClientRect().width < 180);
                const cut = small && parseFloat(node.getAttribute("data-words-width") ?? "0") > three + 0.5;
                if (tile.hasAttribute("data-title-cut") !== cut) {
                    tile.toggleAttribute("data-title-cut", cut);
                }
                const symbols = dialog.querySelector(".section-tile[data-title-cut]") !== null;
                if (dialog.hasAttribute("data-title-symbols") !== symbols) {
                    dialog.toggleAttribute("data-title-symbols", symbols);
                    window.requestAnimationFrame(() => window.dispatchEvent(new Event("tile-titles-unified")));
                }
                // (A SYMBOL WITH ITS TITLE, OR ALONE (owner, 2026-11-26 16:02 UTC+2, on the dialog tile prototypes: "If a tile has: An add button, icon, and title,
                // then the title should be above the icon. The icon should be centered and have a side (horizontal gap 12px with the add button. If there is only an
                // Icon and an add button, then place the icon in the middle of the tile"): the symbol centred across, at one size, 48px (Material's display size for a
                // symbol; the touch proposal, owner, 2026-11-26 17:04 UTC+2), and 12px clear of the "+" beside it; where a tile leaves it under 44px, the symbol stands
                // alone, its name in the tooltip.)
                let layout: "named" | "alone" | null = null;
                if (symbols) {
                    const plus = tile.parentElement?.querySelector<HTMLElement>(":scope > .section-tile-plus");
                    const side = tile.getBoundingClientRect().width;
                    if (plus && side > 0) {
                        const outer = tile.getBoundingClientRect();
                        const box = plus.getBoundingClientRect();
                        const proper = 48;
                        const across = side - 2 * (outer.right - box.left + 12);
                        layout = across >= 44 ? "named" : "alone";
                        // (Alone: in the middle across, and down in the room above the "+", 12px clear of it: the tile's true middle would meet the "+".)
                        const above = box.top - outer.top - 2 * 12;
                        const size = Math.floor(layout === "named" ? Math.min(proper, across) : Math.min(proper, above));
                        dialog.style.setProperty("--title-symbol-size", String(size) + "px");
                        dialog.style.setProperty("--title-symbol-room", String(Math.floor(box.top - outer.top - 12)) + "px");
                    }
                }
                if (dialog.getAttribute("data-symbol-layout") !== layout) {
                    if (layout) {
                        dialog.setAttribute("data-symbol-layout", layout);
                    } else {
                        dialog.removeAttribute("data-symbol-layout");
                    }
                }
                if (layout === "alone") {
                    tile.setAttribute("data-tip", named.textContent ?? "");
                    tile.setAttribute("data-tip-named", "");
                } else {
                    tile.removeAttribute("data-tip");
                    tile.removeAttribute("data-tip-named");
                }
            }
            // (A title with a forced break says itself on one line: a space where its lines meet.)
            node.title = [...node.childNodes].map(part => part.nodeName === "BR" ? " " : part.textContent ?? "").join("");
        };
        apply();
        // (A symbol in the title takes its height when its picture has loaded: measured again then, so the list stands under it.)
        const pictures = Array.from(node.querySelectorAll("img")).filter(picture => !picture.complete);
        pictures.forEach(picture => picture.addEventListener("load", apply));
        // (And when the type's own font has loaded: its words are wider than the fallback's and may take a line more.)
        let live = true;
        void document.fonts?.ready.then(() => { if (live) apply(); });
        document.fonts?.addEventListener?.("loadingdone", apply);
        window.addEventListener("tile-titles-unified", apply);
        const forget = () => {
            live = false;
            window.removeEventListener("tile-titles-unified", apply);
            pictures.forEach(picture => picture.removeEventListener("load", apply));
            document.fonts?.removeEventListener?.("loadingdone", apply);
        };
        if (typeof ResizeObserver === "undefined") {
            return forget;
        }
        const observer = new ResizeObserver(apply);
        observer.observe(tile);
        return () => {
            forget();
            observer.disconnect();
        };
    });
    const numbered = typeof children === "string" ? /^(\d+\.)\s([\s\S]*)$/.exec(children) : null;
    return (
        <span ref={title} className={"section-tile-title" + (className ? " " + className : "")}>
            {numbered ? <><span className="section-tile-title-number">{numbered[1] + " "}</span><span className="section-tile-title-text">{numbered[2]}</span></> : children}
        </span>
    );
}


/**
 * WHAT A SECTION INCLUDES, under its tile's title (docs/ai/09-layout-rules.md, "Tile anatomy"): a
 * bulleted list in small muted text, one line per item cut by an ellipsis; it holds every item and scrolls
 * (a thin themed scrollbar) where they are more than the room under the title. On a page tile the items that lead
 * somewhere are real controls (`links`: a button each, underlined under the pointer and the focus, opening
 * that card alone or the section on that subcategory); the list of a tile
 * without links is decoration -- it says again what the tile's accessible name says -- and hidden from
 * assistive technology.
 */
/**
 * ONE ALIGNMENT FOR THE LISTS OF A GRID OF TILES (owner, 2026-11-20 21:01 UTC+2: "the listed items are not centered aligned, or at least they do not follow the
 * same alignment"; layout rules section 8, "Tile anatomy"): each list is a block centred under its title; the lists of one DIALOG grid (never a page's master tiles)
 * share ONE width, the longest item of any of them (scrolled-away items too), so their bullets or names start at one point in every tile (owner, 21:31).
 * Text (plain or centred lines, a column page's text) and two-column lists keep their own width. Each TileList asks for its grid; one pass a frame.
 */
const gridsToAlign = new Set<HTMLElement>();
let alignFrame = 0;
function alignGridLists(grid: HTMLElement) {
    const lists = Array.from(grid.querySelectorAll<HTMLElement>(":scope > * .section-tile-list")).filter(list =>
        list.children.length > 0
        && !list.classList.contains("section-tile-list-pairs")
        && !list.querySelector(".section-tile-list-plain, .section-tile-list-centre")
        && (!list.closest(".column-tiles-page") || list.querySelector(".section-tile-list-bullet, .section-tile-divider") !== null));
    grid.style.removeProperty("--tile-list-width");
    grid.querySelectorAll(".section-tile-list[data-shared-width]").forEach(list => list.removeAttribute("data-shared-width"));
    const widest = Math.max(0, ...lists.map(list => list.getBoundingClientRect().width));
    if (lists.length > 1 && widest > 0) {
        grid.style.setProperty("--tile-list-width", Math.ceil(widest) + "px");
        lists.forEach(list => list.setAttribute("data-shared-width", ""));
    }
}
function askToAlign(grid: HTMLElement | null | undefined) {
    if (!grid || typeof window === "undefined") {
        return;
    }
    gridsToAlign.add(grid);
    if (alignFrame === 0) {
        alignFrame = window.requestAnimationFrame(() => {
            alignFrame = 0;
            const grids = [...gridsToAlign];
            gridsToAlign.clear();
            grids.filter(each => each.isConnected).forEach(alignGridLists);
        });
    }
}
if (typeof window !== "undefined") {
    // (A new window width changes the tiles' side and the type: every grid on screen lines up again.)
    window.addEventListener("resize", () => document.querySelectorAll<HTMLElement>(".section-tile-dialog :is(.section-tile-slot, .card-tile-slot)").forEach(slot => askToAlign(slot.parentElement)));
}

/**
 * THE TILE'S CONTENT ON ITS MIDLINE (owner, 2026-11-24 03:14 and 04:24 UTC+2: "place the tile's content ... in the centre of the Tile"; "The blue lines are the mid
 * points"): how far down a list (or a grid of symbols) of this height moves so its middle stands on its tile's middle -- the same line on every tile of a row,
 * whatever its title's lines --, held inside its room (from 12px under the title's rule to the room's foot).
 */
function centresOnMidline(node: HTMLElement): boolean {
    // (Every tile's list -- a page's, a dialog's, the Capabilities' -- but a System's on its Capability's page, whose kind and list stand together: workspace.css.)
    // (Owner, 2026-11-24 04:28 UTC+2: "Check where it is possible and give them space".)
    return node.closest(".capability-system-body") === null;
}

function onMidline(node: HTMLElement, height: number, room: number): number {
    const tile = node.closest(".section-tile-slot")?.querySelector<HTMLElement>(".section-tile");
    if (!tile) {
        return 0;
    }
    const box = tile.getBoundingClientRect();
    const top = node.getBoundingClientRect().top;
    const wanted = (box.top + box.bottom) / 2 - height / 2 - top;
    return Math.floor(Math.max(0, Math.min(wanted, room - height)));
}

export function TileList({
    items: given, links: givenLinks, alerts: givenAlerts, marks: givenMarks, onLink, onPlain
}: {
    items: readonly string[];
    /** For each line, how it is drawn: faded (empty), teal (the Channel), a second teal bullet (it holds a channel's cards). */
    marks?: readonly (ItemMark | undefined)[];
    links?: readonly (TileLink | undefined)[];
    /** For each line, what an incomplete card behind it lacks (the line is then red, flashing). */
    alerts?: readonly (readonly string[] | undefined)[];
    title?: string;
    onLink?: (link: TileLink, from: HTMLElement, pointer: boolean) => void;
    /** A press on a list that has no links (text): what it does. */
    onPlain?: (event: ReactMouseEvent<HTMLUListElement>) => void;
}) {
    // ONE FACE FOR EVERY TILE (owner, 2026-11-18 22:56 UTC+2: "fix the listed items on the financial tiles, to follow the other tiles"): a list of names and figures
    // stands in two columns while every figure is one word (a count, a sum, a percent: Channels & Journey, Costs); where a figure has words ("10 a month", "£11,204 a
    // month", "Jun 2027"), each name has its figure under it in bold and a line between one and the next, as Sales Forecast's -- the same on every page.
    const figureWords = (item: string) => {
        const figure = item.includes("\u0001") ? item.split("\u0001")[1] : "";
        return /^\*\*[^*]*[ \u00a0][^*]*\*\*$/.test(figure);
    };
    const stacking = given.some(figureWords);
    const items: string[] = [];
    const links: (TileLink | undefined)[] = [];
    const alerts: (readonly string[] | undefined)[] = [];
    const marks: (ItemMark | undefined)[] = [];
    given.forEach((item, at) => {
        if (stacking && item.includes("\u0001")) {
            if (items.length > 0 && items[items.length - 1] !== TILE_DIVIDER) {
                items.push(TILE_DIVIDER);
                links.push(undefined);
                alerts.push(undefined);
                marks.push(undefined);
            }
            const [name, figure] = item.split("\u0001");
            items.push(name + (figure ? "\n" + figure : ""));
        } else {
            items.push(item);
        }
        links.push(givenLinks?.[at]);
        alerts.push(givenAlerts?.[at]);
        marks.push(givenMarks?.[at]);
    });
    const list = useRef<HTMLUListElement | null>(null);
    // (Its grid's lists share one width: see askToAlign.)
    useLayoutEffect(() => {
        // (Only in a DIALOG's grid: a page's master tiles keep each list centred on the tile's centre line at its own width; owner, 2026-11-20 21:28 and 21:32 UTC+2.)
        const slot = list.current?.closest<HTMLElement>(".section-tile-slot, .card-tile-slot");
        if (slot?.closest(".section-tile-dialog")) {
            askToAlign(slot.parentElement);
        }
    });
    // The list holds EVERY item and scrolls when they do not all fit under the title (and above the "+" box): a thin themed scrollbar, the wheel scrolls it
    // (not the card behind, until its end), the keyboard walks the links and scrolls them into view. Marked while it scrolls (its layer then takes the wheel).
    const [scrolls, setScrolls] = useState(false);
    useLayoutEffect(() => {
        const node = list.current;
        if (!node) {
            return;
        }
        // HEIGHT DECIDES, NOT LENGTH: on a page tile the list is as tall as the whole items that fit in the room under the title (the layer's second row, less the
        // list's own top margin): it ends at the foot of the last item that fits entirely, so no line is ever cut in half; the rest scrolls.
        const layer = node.parentElement?.classList.contains("section-tile-links-layer") ? node.parentElement : null;
        // (A TITLE ALONE HAS ITS RULE ON THE TILE'S MIDDLE (owner, 2026-11-24 10:12 UTC+2: "When the master tiles have only their titles ..., make sure the title's
        // underline pass through the middle of the tile").)
        const titleOnMiddle = (slot: HTMLElement | null = node.closest<HTMLElement>(".section-tile-slot")) => {
            const tile = slot?.querySelector<HTMLElement>(".section-tile");
            const title = tile?.querySelector<HTMLElement>(".section-tile-title");
            if (!slot || !tile || !title) {
                return;
            }
            slot.style.removeProperty("--title-centre");
            const box = tile.getBoundingClientRect();
            const words = title.getBoundingClientRect();
            // (An Inventory or Completed rectangle has no rule: its words stand on the middle.)
            const line = slot.closest(".section-tiles-completed") ? (words.top + words.bottom) / 2 : words.bottom;
            // (NEVER ABOVE THE TILE'S TOP (owner, 2026-11-27 14:07 UTC+2, a phone turned sideways: "Check the tiles'layout"): a title taller than half the tile -- a
            // Capability's name on two lines with its symbol, in a 131px tile -- stood half above it; its top stays 12px inside the tile, its rule as near the middle as
            // that leaves.)
            slot.style.setProperty("--title-centre", Math.round(Math.max((box.top + box.bottom) / 2 - line, box.top + 12 - words.top)) + "px");
        };
        // (ONE RULE FOR EVERY TILE OF A SCREEN (owner, 2026-11-24 10:12 UTC+2: "cannot have in the same screen size, some cells only with their titles, others with a
        // few symbols, and other with names. The rule should cover them all"): a tile short of room -- its title alone, or a grid of symbols missing rows -- says so,
        // and where one tile of the page (or of the dialog) is short, every tile there shows its title alone.)
        const scopeOfList = (list: Element) => list.closest(".section-tile-dialog, .conversation-card, .capability-tiles");
        const oneRule = () => {
            // (The Inventory and Completed rectangles are buttons of the page, not its master tiles: they keep their own look.)
            if (!layer || !centresOnMidline(node) || node.closest(".section-tiles-completed")) {
                return;
            }
            const short = node.hasAttribute("data-no-room") || (node.hasAttribute("data-symbols") && Number(node.getAttribute("data-symbol-rows") ?? "3") < 3);
            if (node.hasAttribute("data-room-short") !== short) {
                node.toggleAttribute("data-room-short", short);
                window.requestAnimationFrame(() => window.dispatchEvent(new Event("tile-titles-unified")));
            }
            const scope = scopeOfList(node);
            const any = !!scope && Array.from(scope.querySelectorAll<HTMLElement>(".section-tile-list[data-room-short]"))
                .some(other => scopeOfList(other) === scope && (other.closest(".section-tile-slot")?.getClientRects().length ?? 0) > 0);
            // (AN EMPTY TILE OF THE SAME SCREEN TOO (owner, 2026-11-25 15:51 UTC+2, the phone's Resources dialog: Vehicles' title at the top, its neighbours' on the
            // middle): a tile with no list follows its neighbours, its title on the middle where theirs are, at the top where theirs are.)
            if (scope) {
                for (const slot of Array.from(scope.querySelectorAll<HTMLElement>(".section-tile-slot"))) {
                    if (slot.querySelector(".section-tile-list") || scopeOfList(slot) !== scope) {
                        continue;
                    }
                    slot.toggleAttribute("data-title-alone", any);
                    if (any) {
                        titleOnMiddle(slot);
                    } else {
                        slot.style.removeProperty("--title-centre");
                    }
                }
            }
            if (any) {
                node.setAttribute("data-no-room", "");
                node.removeAttribute("data-symbols");
                node.style.removeProperty("translate");
                node.style.removeProperty("--list-centre");
                node.style.removeProperty("--list-air");
                titleOnMiddle();
            }
        };
        const snap = () => {
            snapOwn();
            oneRule();
        };
        const snapOwn = () => {
            if (!layer) {
                // (A LIST WITH NO LINKS LAYER -- a card tile's in a dialog -- ends at a whole item too, inside the room its tile gives it: at 768 a card tile 1px smaller
                // cut its last line by a pixel; layout rules section 9, "A tile's lines"; 2026-11-20.)
                node.style.height = "";
                const room = node.clientHeight;
                if (room <= 0 || node.scrollHeight <= room) {
                    return;
                }
                let fit = 0;
                for (const child of Array.from(node.children) as HTMLElement[]) {
                    const bottom = child.offsetTop - (child.offsetParent === node ? 0 : node.offsetTop) + child.offsetHeight;
                    if (bottom <= room + 0.5) {
                        fit = bottom;
                    } else {
                        break;
                    }
                }
                if (fit > 0) {
                    node.style.height = fit + "px";
                }
                return;
            }
            // (Measured from the list's own place: its centring, below, taken back first.)
            node.style.removeProperty("--list-centre");
            node.style.removeProperty("--list-air");
            const rows = getComputedStyle(layer).gridTemplateRows.split(" ").map(parseFloat);
            // (The list may run 5px past the layer's second row, as far as the top of the "+" box and never under it, and ends 4px under its last line so a
            // descender (g, y, p) is never cut.)
            const room = rows.length > 1 && Number.isFinite(rows[1]) ? rows[1] - (parseFloat(getComputedStyle(node).marginTop) || 0) + 5 : 0;
            if (room <= 0) {
                // (No room at all under the title: the list is not shown -- the title alone, as below.)
                node.setAttribute("data-no-room", "");
                return;
            }
            node.style.height = "auto";
            node.style.maxHeight = "none";
            node.removeAttribute("data-no-room");
            node.closest<HTMLElement>(".section-tile-slot")?.style.removeProperty("--title-centre");
            node.removeAttribute("data-symbols");
            node.style.removeProperty("translate");
            node.querySelectorAll<HTMLElement>("[data-symbol-off]").forEach(line => line.removeAttribute("data-symbol-off"));
            node.querySelectorAll<HTMLElement>("[data-symbol-tip]").forEach(link => {
                link.removeAttribute("data-symbol-tip");
                link.removeAttribute("data-tip");
            });
            // (A paragraph clamped on an earlier measure is measured whole again.)
            node.querySelectorAll<HTMLElement>("[data-clamped]").forEach(line => {
                line.removeAttribute("data-clamped");
                line.style.removeProperty("-webkit-line-clamp");
            });
            const lineHeight = parseFloat(getComputedStyle(node).lineHeight) || 0;
            const column = !!node.closest(".column-tiles-page") && lineHeight > 0;
            let fit = 0;
            let last: HTMLElement | null = null;
            let clamped = false;
            for (const child of Array.from(node.children) as HTMLElement[]) {
                // (Its bottom within the LIST: the list is not the child's offset parent, so the list's own place in the layer is taken away -- else every line looked that much lower and the list was cut a line short.)
                // (An item drawn as its contents -- a pair's row, its name and its figure in the list's two columns -- is measured by its parts.)
                const parts = child.getClientRects().length > 0 && child.offsetHeight > 0 ? [child] : Array.from(child.children) as HTMLElement[];
                const bottom = parts.length > 0 ? Math.max(...parts.map(part => part.getBoundingClientRect().bottom)) - node.getBoundingClientRect().top + node.scrollTop : 0;
                // (With the 4px kept under the last line for its underline, inside the room: a list of 24px rows never reaches the tile's + box.)
                if (bottom + 4 <= room + 0.5) {
                    fit = bottom;
                    last = child;
                } else {
                    // (A PARAGRAPH ENDS AT A WHOLE LINE, WITH AN ELLIPSIS (owner, 2026-11-23 20:06 UTC+2, "do you see anything off?": Mission & Vision, Philosophy &
                    // Manifesto, the Brand's text tiles showed half a line): a column tile's item of one text line takes the whole lines the room holds, its last
                    // one ending in "…" (line-clamp); an item of a name and what is said of it stays whole or goes.)
                    const lines = child.querySelectorAll<HTMLElement>(":scope .section-tile-list-line");
                    const top = child.offsetTop - (child.offsetParent === node ? 0 : node.offsetTop);
                    const whole = column && lines.length === 1 ? Math.floor((room - 4 - top) / lineHeight) : 0;
                    if (whole >= 1) {
                        lines[0].setAttribute("data-clamped", "");
                        lines[0].style.setProperty("-webkit-line-clamp", String(whole));
                        fit = top + whole * lineHeight;
                        last = child;
                        clamped = true;
                    }
                    break;
                }
            }
            // (A list never ends on its own divider: the line under the last whole item goes with the item that did not fit.)
            if (last && last.matches(".section-tile-divider") && last.previousElementSibling) {
                const before = last.previousElementSibling as HTMLElement;
                fit = before.offsetTop - (before.offsetParent === node ? 0 : node.offsetTop) + before.offsetHeight;
            }
            // (A column page's tile of text -- ONE item, a paragraph -- ends at a whole LINE; a list of items there ends at a whole item, so a name never stands
            // without what is said of it and no line is cut through: owner, 2026-11-23 19:41 UTC+2, "Fix the errors", the Strategic Period's and Customer's
            // Relationship's lists.)
            const byLines = column && node.children.length <= 1 && !clamped;
            const whole = byLines
                ? Math.floor(room / lineHeight) * lineHeight
                : Array.from(node.children).length > 0 && fit > 0 ? fit : room;
            node.style.height = Math.min(byLines ? whole : whole + 4, room) + "px";
            // (TOO LITTLE ROOM SHOWS THE TITLE ALONE (owner, 2026-11-23 21:49 UTC+2: "If there is not enough space for listed items or text on the Tiles, then hide it,
            // and keep only the Tile's title, and symbol"): a list or a text cut to less than two lines is not shown; the tile keeps its title and its symbol, and
            // its whole text is in its dialog and its tooltip.)
            // (SYMBOLS WHERE THE NAMES DO NOT FIT (owner, 2026-11-23 23:21 UTC+2, the responsive layout approved, section 4.4): a list cut short whose every line has its
            // symbol -- a Resources tile's categories -- shows the symbols in a grid in the room, each named in its tooltip; a grid that does not fit either goes, as
            // below.)
            const lines = Array.from(node.children) as HTMLElement[];
            if (node.scrollHeight > node.clientHeight + 1 && lines.length > 0 && lines.every(line => line.querySelector(".section-tile-list-fallback"))) {
                // (As many whole rows of symbols as the room holds -- the tile opens on all of them; under one row, the title alone, as below.)
                // (32px symbols 16px apart where three rows of them fit, else 24px ones 12px apart: owner, 2026-11-24 01:59 UTC+2, "when there is space, make the icons
                // 32 px and spread them out more".)
                const width = node.clientWidth;
                // (Their room runs down to the tile's padding, beside the "+": a row that would meet it moves left, below.)
                const tileBottom = (node.closest(".section-tile-slot")?.querySelector<HTMLElement>(".section-tile") ?? layer).getBoundingClientRect().bottom;
                const symbolRoom = Math.max(room, Math.floor(tileBottom - 12 - node.getBoundingClientRect().top));
                const large = symbolRoom >= 3 * 32 + 2 * 16 && width >= 3 * 32 + 2 * 16;
                const symbol = large ? 32 : 24;
                const gap = large ? 16 : 12;
                const rowsFit = Math.min(3, Math.floor((symbolRoom + gap) / (symbol + gap)));
                if (rowsFit >= 1) {
                    node.setAttribute("data-symbols", large ? "large" : "");
                    node.setAttribute("data-symbol-rows", String(rowsFit));
                    node.style.height = (rowsFit * (symbol + gap) - gap) + "px";
                    if (centresOnMidline(node)) {
                        const shift = onMidline(node, rowsFit * (symbol + gap) - gap, Math.min(room, symbolRoom));
                        if (shift > 0) {
                            node.style.setProperty("--list-centre", shift + "px");
                        }
                    }
                    // (The rows the room does not hold are not drawn: the grid stands open for a symbol's growth, so nothing may hang under it.)
                    lines.forEach((line, at) => line.toggleAttribute("data-symbol-off", at >= rowsFit * 3));
                    // (Each symbol says its name in the app's tooltip: its words are read, not drawn, so the tip says them.)
                    lines.forEach(line => {
                        const link = line.querySelector<HTMLElement>(".section-tile-link") ?? line;
                        const name = line.getAttribute("data-tip") ?? line.getAttribute("title") ?? line.textContent?.trim() ?? "";
                        link.setAttribute("data-tip", name);
                        link.setAttribute("data-symbol-tip", "");
                    });
                    // (Clear of the tile's "+" by 12px: where the grid's last row would reach it, every symbol moves left alike -- owner, 2026-11-24 01:59 UTC+2.)
                    const plus = node.closest(".section-tile-slot")?.querySelector<HTMLElement>(".section-tile-plus, .plus-box");
                    const shown = lines.filter(line => !line.hasAttribute("data-symbol-off")).map(line => line.getBoundingClientRect()).filter(box => box.width > 0);
                    if (plus && shown.length > 0) {
                        const box = plus.getBoundingClientRect();
                        const right = Math.max(...shown.map(item => item.right));
                        const bottom = Math.max(...shown.map(item => item.bottom));
                        const over = right - (box.left - 12);
                        if (bottom > box.top && over > 0) {
                            node.style.translate = -Math.ceil(over) + "px 0";
                        }
                    }
                    return;
                }
            }
            const shownHeight = node.clientHeight;
            const cut = node.scrollHeight > shownHeight + 1 || clamped;
            const line = lineHeight > 0 ? lineHeight : parseFloat(getComputedStyle(node).lineHeight) || 24;
            // (Nor is a list whose first item does not fit whole and cannot end at a line: a name with what is said of it, cut under the name.)
            // (Three lines at the least since 2026-11-24 01:59 UTC+2 -- "when there is not much space ... let the tiles show only their titles".)
            if ((cut && shownHeight < 3 * line - 1) || (!byLines && !clamped && fit === 0 && node.children.length > 0)) {
                node.setAttribute("data-no-room", "");
                // (The title alone stands in the tile's middle: the offset from where it stands.)
                const slot = node.closest<HTMLElement>(".section-tile-slot");
                const tile = slot?.querySelector<HTMLElement>(".section-tile");
                const title = tile?.querySelector<HTMLElement>(".section-tile-title");
                if (slot && tile && title && centresOnMidline(node)) {
                    titleOnMiddle();
                }
            }
            // (A MASTER TILE'S LIST IN THE MIDDLE OF ITS ROOM (owner, 2026-11-24 03:14 UTC+2: "Generally place the tile's content (listed items, icons etc.) in the centre of
            // the Tile, and give some space, specially when there is enough"): what the room leaves is shared above and below it.)
            if (centresOnMidline(node) && !node.hasAttribute("data-no-room")) {
                // (Room to spare spreads the lines: up to 8px between two, where the whole list then still stands with room above and below.)
                // (ONE SPACING ON A PAGE (owner, 2026-11-24 05:16 UTC+2, his Identity page: lists side by side spaced unevenly, the Organisation's address cut): each
                // list says the most it allows -- 0 where it is full --, and every list of the page, or of the dialog, takes the least of them; a one-line list asks
                // nothing.)
                const items = Array.from(node.children).filter(child => !child.matches(".section-tile-divider")).length;
                const gaps = Math.max(1, node.children.length - 1);
                const free = room - 5 - node.getBoundingClientRect().height;
                const allows = items > 1 ? (cut ? 0 : Math.max(0, Math.min(8, Math.floor(free / (gaps + 3))))) : 8;
                const before = node.getAttribute("data-air-allows");
                node.setAttribute("data-air-allows", String(allows));
                if (before !== String(allows)) {
                    window.requestAnimationFrame(() => window.dispatchEvent(new Event("tile-titles-unified")));
                }
                const scopeOf = (list: Element) => list.closest(".section-tile-dialog, .conversation-card, .capability-tiles");
                const scope = scopeOf(node);
                const others = scope
                    ? Array.from(scope.querySelectorAll<HTMLElement>(".section-tile-list[data-air-allows]"))
                        .filter(other => other.getClientRects().length > 0 && scopeOf(other) === scope)
                        .map(other => parseFloat(other.getAttribute("data-air-allows") ?? "8"))
                    : [];
                const air = items > 1 && !cut ? Math.min(allows, ...others) : 0;
                if (air >= 2) {
                    const height = node.getBoundingClientRect().height;
                    node.style.setProperty("--list-air", air + "px");
                    node.style.height = (height + air * (node.children.length - 1)) + "px";
                    // (Never a line lost to the spacing: where it would cut the list, it is taken back.)
                    if (node.scrollHeight > node.clientHeight + 1) {
                        node.style.removeProperty("--list-air");
                        node.style.height = height + "px";
                    }
                }
                const shift = onMidline(node, node.getBoundingClientRect().height, room - 5);
                if (shift > 0) {
                    node.style.setProperty("--list-centre", shift + "px");
                }
            }

        };
        const measure = () => {
            snap();
            setScrolls(node.scrollHeight > node.clientHeight + 1);
        };
        measure();
        if (typeof ResizeObserver === "undefined") {
            return;
        }
        const observer = new ResizeObserver(measure);
        observer.observe(layer ?? node);
        // (Measured again when the page's titles take one size: TileTitle.)
        const again = () => window.requestAnimationFrame(measure);
        window.addEventListener("tile-titles-unified", again);
        return () => {
            observer.disconnect();
            window.removeEventListener("tile-titles-unified", again);
        };
    }, [items]);
    const shown = items;
    // (A list of plain lines repeats what the tile's own name and its dialog say, so it is hidden from screen readers -- and so never a Tab stop either, even where
    // it scrolls: a hidden control that takes the focus is the WCAG 4.1.2 failure the standards report found, group A 2. A list of links is read and reached.)
    const live = !!onLink && !!links && links.some(link => link !== undefined);
    return (
        <ul className={"section-tile-list" + (shown.some(item => item.includes("\u0001")) ? " section-tile-list-pairs" : "")} ref={list} onClick={!live ? onPlain : undefined} aria-hidden={live ? undefined : "true"} data-scrolls={scrolls ? "" : undefined} tabIndex={!live ? -1 : scrolls ? 0 : undefined}>
            {shown.map((item, position) => {
                if (item === TILE_DIVIDER) {
                    return <li key={position} className="section-tile-divider" aria-hidden="true" />;
                }
                const link = live ? links?.[position] : undefined;
                // (A space between the lines, which are blocks: the item reads as one phrase to the text and to assistive technology.)
                if (item.includes("\u0001")) {
                    // Two parts set in two columns (a name and its share): the second column starts where every line's does.
                    const [left, right] = item.split("\u0001");
                    return (
                        <li key={position} title={plainTitle(item)}>
                            {/* (A line of two columns that names a card or a box is a link by its name, as every other line of a tile's list: owner, 2026-11-14 11:15.) */}
                            <span className="section-tile-pair-left">{link && onLink
                                ? <button type="button" className="section-tile-link" data-link={"card" in link ? link.card : "box" in link ? link.box : undefined} onClick={(event) => onLink(link, event.currentTarget, event.detail > 0)}>{boldWords(left)}</button>
                                : boldWords(left)}</span>
                            <span className="section-tile-pair-right">{boldWords(right)}</span>
                        </li>
                    );
                }
                const symbol = marks?.[position]?.icon;
                const status = marks?.[position]?.status;
                const fallback = marks?.[position]?.symbol;
                const drawn = <>{fallback && <SymbolMark src={fallback} className="section-tile-list-fallback" />}{status && <span className="status-shape section-tile-list-shape" data-status={status} aria-hidden="true" />}{symbol && <SymbolMark src={symbol} className="section-tile-list-symbol" />}{brokenLines(item).map((part, at, parts) => <Fragment key={at}><span className="section-tile-list-line">{boldWords(part)}</span>{at < parts.length - 1 && " "}</Fragment>)}</>;
                return (
                    <li
                        key={position}
                        className={[
                            alerts?.[position] ? "section-tile-list-alert" : "",
                            marks?.[position]?.empty ? "section-tile-list-empty" : "",
                            marks?.[position]?.teal ? "section-tile-list-teal" : "",
                            marks?.[position]?.channel ? "section-tile-list-channel" : "",
                            marks?.[position]?.bullet ? "section-tile-list-bullet" : "",
                            marks?.[position]?.centre ? "section-tile-list-centre" : "",
                            marks?.[position]?.plain ? "section-tile-list-plain" : "",
                            marks?.[position]?.rule ? "section-tile-list-rule" : "",
                            marks?.[position]?.icon ? "section-tile-list-icon" : "",
                            marks?.[position]?.status ? "section-tile-list-status" : ""
                        ].filter(Boolean).join(" ") || undefined}
                        title={alerts?.[position] ? plainTitle(item).replace(/\*\*/g, "") + ": " + incompleteTitle(alerts[position]!) : (marks?.[position]?.tip ?? plainTitle(item).replace(/\*\*/g, "")) + (marks?.[position]?.status ?", " + PAGE_STATUS_WORDS[marks[position]!.status!] : "")}
                    >
                        {link && onLink
                            ? (
                                <button
                                    type="button"
                                    className="section-tile-link"
                                    data-link={"card" in link ? link.card : "box" in link ? link.box : undefined}
                                    onClick={(event) => onLink(link, event.currentTarget, event.detail > 0)}
                                >
                                    {drawn}
                                </button>
                            )
                            : drawn}
                    </li>
                );
            })}
        </ul>
    );
}

/**
 * THE LINKS LAYER OF A TILE: the list of what the tile includes, as real controls laid over the tile (the same props as `TileList`). Every tile that lists its cards or lines draws it here.
 */
export function TileLinks(props: ComponentProps<typeof TileList>) {
    return (
        <div className="section-tile-links-layer">
            <TileList {...props} />
        </div>
    );
}

/**
 * THE "+" OF A TILE: the add box at its lower right, named "Add <what> to <the tile's title>".
 */
export function TilePlus({ what, title, disabled, onClick }: { what: string; title: string; disabled?: boolean; onClick: (event: ReactMouseEvent<HTMLButtonElement>) => void }) {
    return (
        <AddButton shape="box" className="section-tile-plus"
            aria-label={"Add " + what.charAt(0).toUpperCase() + what.slice(1) + " to " + plainTitle(title)}
            disabled={disabled}
            onClick={onClick}
        />
    );
}

/**
 * WHERE A PAGE TILE SCALES FROM, set once for each stay of the pointer: its place in the group (`at`, of `columns` by `rows`) says the corner, edge or centre, moved to fit where the card is too narrow. Put `slot` on the tile's slot and spread `aimHandlers` on it.
 */
export function useTileAim(at: { row: number; column: number }, columns: number, rows: number) {
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

    return { slot, aimHandlers: { onPointerEnter: aim, onPointerMove: aim, onPointerLeave: () => { pointed.current = false; }, onPointerCancel: () => { pointed.current = false; } } };
}
