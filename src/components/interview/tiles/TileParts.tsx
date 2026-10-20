import { ComponentProps, Fragment, MouseEvent as ReactMouseEvent, ReactNode, RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import AddButton from "../../controls/AddButton.tsx";
import { type TileLink, type ItemMark } from "./SectionTileTypes.ts";
import { incompleteTitle, TILE_DIVIDER, drawnTitle, plainTitle, brokenLines, boldWords, scaleOrigin } from "./SectionTileGeometry.tsx";

/**
 * What a tile or a box shows: its title, centred, and -- while the section holds nothing yet --
 * a small "+" under the title (decorative; the button is described as "No items yet").
 */
export function TileFace({ title, empty, items, glyph = true, alerts, marks }: { title: string; empty?: boolean; items?: readonly string[]; glyph?: boolean; alerts?: readonly (readonly string[] | undefined)[]; marks?: readonly (ItemMark | undefined)[] }) {
    return (
        <>
            {/* (A title with a forced break is drawn on its lines: the one title that is allowed two.) */}
            {title.includes("\n")
                ? <TileTitle className="section-tile-title-broken">{brokenLines(title).map((part, at) => <Fragment key={at}>{at > 0 && <br />}{drawnTitle(part)}</Fragment>)}</TileTitle>
                : <TileTitle>{drawnTitle(plainTitle(title))}</TileTitle>}
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
        const host = node?.closest<HTMLElement>(".section-tile-slot") ?? node?.closest<HTMLElement>("button, .section-tile");
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
            const room = node.scrollWidth - node.clientWidth;
            if (room > 1) {
                node.style.textOverflow = "clip";
                // (The distance is measured now, so a resize or a font change is always counted: the last letter ends at the title's right edge.)
                slideTo(Math.ceil(node.scrollWidth - node.clientWidth));
            }
        };
        const leave = () => slideTo(0);
        host.addEventListener("pointerenter", enter);
        host.addEventListener("pointerleave", leave);
        return () => {
            cancelAnimationFrame(frame);
            host.removeEventListener("pointerenter", enter);
            host.removeEventListener("pointerleave", leave);
            node.scrollLeft = 0;
            node.style.textOverflow = "";
        };
    }, [ref]);
}


/**
 * A TILE'S TITLE (docs/ai/layout-rules.md, "Tile anatomy"): its last line stands on the line one third
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
        // ONE LINE, ONE SIZE, ONE PLACE for every title of every tile: no wrapping and no size step; a title too long is cut with an ellipsis and its full text
        // is the tooltip. The list under it starts the same distance under the rule on every tile of a size.
        const apply = () => {
            tile.removeAttribute("data-title-small");
            tile.closest<HTMLElement>(".section-tile-slot")?.removeAttribute("data-title-small");
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
                const extra = list.getBoundingClientRect().top - node.getBoundingClientRect().bottom - 12;
                if (Math.abs(extra) > 0.2 && Math.abs(extra) < 6) {
                    const corrected = String(Math.round((parseFloat(standing) + extra) * 10) / 10) + "px";
                    tile.style.setProperty("--tile-lift", corrected);
                    slot.style.setProperty("--tile-lift", corrected);
                }
            }
            node.title = node.textContent ?? "";
        };
        apply();
        if (typeof ResizeObserver === "undefined") {
            return;
        }
        const observer = new ResizeObserver(apply);
        observer.observe(tile);
        return () => observer.disconnect();
    });
    const numbered = typeof children === "string" ? /^(\d+\.)\s([\s\S]*)$/.exec(children) : null;
    return (
        <span ref={title} className={"section-tile-title" + (className ? " " + className : "")}>
            {numbered ? <><span className="section-tile-title-number">{numbered[1] + " "}</span><span className="section-tile-title-text">{numbered[2]}</span></> : children}
        </span>
    );
}


/**
 * WHAT A SECTION INCLUDES, under its tile's title (docs/ai/layout-rules.md, "Tile anatomy"): a
 * bulleted list in small muted text, one line per item cut by an ellipsis, as many lines as the room
 * under the title holds (measured) and then "+N more" as the last line. On a page tile the items that lead
 * somewhere are real controls (`links`: a button each, underlined under the pointer and the focus, opening
 * that card alone or the section on that subcategory; "+N more" opens the section); the list of a tile
 * without links is decoration -- it says again what the tile's accessible name says -- and hidden from
 * assistive technology.
 */
export function TileList({
    items, links, alerts, marks, onLink, onPlain
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
    const list = useRef<HTMLUListElement | null>(null);
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
        const snap = () => {
            if (!layer) {
                return;
            }
            const rows = getComputedStyle(layer).gridTemplateRows.split(" ").map(parseFloat);
            // (The list may run 5px past the layer's second row, as far as the top of the "+" box and never under it, and ends 4px under its last line so a
            // descender (g, y, p) is never cut.)
            const room = rows.length > 1 && Number.isFinite(rows[1]) ? rows[1] - (parseFloat(getComputedStyle(node).marginTop) || 0) + 5 : 0;
            if (room <= 0) {
                return;
            }
            node.style.height = "auto";
            node.style.maxHeight = "none";
            let fit = 0;
            for (const child of Array.from(node.children) as HTMLElement[]) {
                // (Its bottom within the LIST: the list is not the child's offset parent, so the list's own place in the layer is taken away -- else every line looked that much lower and the list was cut a line short.)
                const bottom = child.offsetTop - (child.offsetParent === node ? 0 : node.offsetTop) + child.offsetHeight;
                if (bottom <= room + 0.5) {
                    fit = bottom;
                } else {
                    break;
                }
            }
            // (A column page's tile shows text: it ends at a whole LINE, not at a whole item.)
            const lineHeight = parseFloat(getComputedStyle(node).lineHeight) || 0;
            const byLines = !!node.closest(".column-tiles-page") && lineHeight > 0;
            const whole = byLines
                ? Math.floor(room / lineHeight) * lineHeight
                : Array.from(node.children).length > 0 && fit > 0 ? fit : room;
            node.style.height = Math.min(byLines ? whole : whole + 4, room) + "px";
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
        return () => observer.disconnect();
    }, [items]);
    const shown = items;
    const live = !!onLink && !!links && links.some(link => link !== undefined);
    return (
        <ul className={"section-tile-list" + (shown.some(item => item.includes("\u0001")) ? " section-tile-list-pairs" : "")} ref={list} onClick={!live ? onPlain : undefined} aria-hidden={live ? undefined : "true"} data-scrolls={scrolls ? "" : undefined} tabIndex={scrolls ? 0 : undefined}>
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
                            <span className="section-tile-pair-left">{boldWords(left)}</span>
                            <span className="section-tile-pair-right">{boldWords(right)}</span>
                        </li>
                    );
                }
                const drawn = brokenLines(item).map((part, at, parts) => <Fragment key={at}><span className="section-tile-list-line">{boldWords(part)}</span>{at < parts.length - 1 && " "}</Fragment>);
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
                            marks?.[position]?.rule ? "section-tile-list-rule" : ""
                        ].filter(Boolean).join(" ") || undefined}
                        title={alerts?.[position] ? plainTitle(item).replace(/\*\*/g, "") + ": " + incompleteTitle(alerts[position]!) : plainTitle(item).replace(/\*\*/g, "")}
                    >
                        {link && onLink
                            ? (
                                <button
                                    type="button"
                                    className="section-tile-link"
                                    data-link={"card" in link ? link.card : link.box}
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
