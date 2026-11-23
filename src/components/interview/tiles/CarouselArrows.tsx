import BackButton from "../../controls/BackButton.tsx";
import NavArrow from "../../controls/NavArrow.tsx";
import { CSSProperties, RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { type CarouselStep } from "./SectionTileTypes.ts";
import { arrowLevel } from "./SectionTileGeometry.tsx";
import { type RailSlot, slotMargin, useRailSlot } from "../rails/useRailSlot.ts";
import { isPhone } from "../../../hooks/useVerticalLayout.ts";

/** The carousel arrow's box: the page arrow's (24 x 44), 10% larger. */
export const CAROUSEL_ARROW_WIDTH = 24;

/** The least side of the squeezed Inventory and Completed tiles under the page's two cards. */
export const SQUEEZED_ROW_MIN = 56;


/** How far under the top of a page column's frame every floating card starts (the height of the column's title and its gap): all cards start at one level. */
export const CARD_LEVEL = 62;


/** The space between a carousel arrow and the card or dialog it stands beside. */
export const CAROUSEL_ARROW_GAP = 12;


/**
 * THE CAROUSEL ARROWS: a "‹" at the left and a "›" at the right of the card (or the opened section) that was opened last, which go to the previous or the next one of
 * the same list, in the list's own order and round its ends. They are measured from the box they flank and stand over the page, so they take no room in it.
 * (Alt + the left or right arrow does the same from the keyboard.)
 */
/** The ground, the edge and the ink of the card or dialog a carousel stands beside: its rail's tab takes them (the page tab's rule, on every layer). */
/** A colour with an alpha under 1 (a caption's dark pill, a card's inner light): never a layer's ground. */
export function translucentColour(colour: string): boolean {
    return /\/\s*0?\.\d+\)$|rgba\([^)]*,\s*0?\.\d+\)$/.test(colour);
}


/** What marks a completed activity's card. */
export const COMPLETED_CARD = ".business-capability-activity-completed";

/** A layer that is the Completed's (its dialog, or a completed card in it): grey, and so is what stands with it. */
export const completedLayer = (node: HTMLElement | null | undefined): boolean => !!node && (node.matches(".section-tile-dialog-completed") || !!node.querySelector(COMPLETED_CARD));


export function tabColours(node: HTMLElement): { bg: string; edge: string; ink: string } | null {
    const opaque = (colour: string) => colour !== "" && colour !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(colour);
    // The layer's own ground: the first element, from the layer inward (a few levels), that has an opaque background and is as wide as a card -- a dialog's panel, a card's box.
    // (A floating card is searched inside its own body: its caption and the tooltips are no ground.)
    let level: HTMLElement[] = [node.querySelector<HTMLElement>(".floating-card-body") ?? node];
    let ground: HTMLElement | null = null;
    for (let depth = 0; depth < 14 && !ground && level.length > 0; depth += 1) {
        ground = level.find(candidate => opaque(getComputedStyle(candidate).backgroundColor) && !translucentColour(getComputedStyle(candidate).backgroundColor) && candidate.getBoundingClientRect().width >= 200) ?? null;
        level = level.flatMap(candidate => [...candidate.children].filter((child): child is HTMLElement => child instanceof HTMLElement));
    }
    if (!ground) {
        return null;
    }
    const style = getComputedStyle(ground);
    // A completed card is grey, and so is what stands with it (the tab, its bullets, the arrows): the Completed line, whatever hue the tile gives its neighbours.
    if (completedLayer(node)) {
        const root = getComputedStyle(document.documentElement);
        return { bg: style.backgroundColor, edge: root.getPropertyValue("--line-completed").trim() || style.borderTopColor, ink: root.getPropertyValue("--text-completed-ink").trim() || style.color };
    }
    // (A hairline that is a translucent light -- a card's inner light -- is no colour to draw a tab or its bullets in: the layer's own line accent is, as a dialog's tab has it.)
    const translucent = /\/\s*0?\.\d+\)$|rgba\([^)]*,\s*0?\.\d+\)$/.test(style.borderTopColor);
    return { bg: style.backgroundColor, edge: opaque(style.borderTopColor) && !translucent && parseFloat(style.borderTopWidth) > 0 ? style.borderTopColor : "hsl(var(--strategy-theme-hue, 0) var(--theme-line-accent))", ink: style.color };
}


/** Where a layer's page tab starts: 12px under the top of the frame it is attached to (a floating card's own frame, never the box name above it; a dialog's panel). */
export const TAB_DROP = 12;


/**
 * Where the frame stands with every scroll that moves it undone: the layers it stands in scrolled to their tops, and the window scrolled to its top where the frame moves with the page (the dialogs are
 * placed from the page's own heading, so they do). It is the same number wherever the user has scrolled to, so a tab placed from it stays where it is while the dialog scrolls under it.
 * `sample` remembers the last measure: if the window has scrolled since and the frame did not move with it, the frame is fixed to the window and the window's scroll is not undone.
 * Only the scroll SINCE THE LAYER OPENED is undone (`y0`, the first measure's): a dialog opened from a page already scrolled (a stacked page under 1200px) has its
 * tab 12px under its top as it opens (layout rules section 10, "One rail for every layer"; 2026-11-20, 768).
 */
export function titleTopOf(node: HTMLElement, sample?: { current: { y: number; y0: number; top: number; withPage: boolean } | null }): number {
    const frame = node.querySelector<HTMLElement>(".floating-card-body") ?? node;
    let scrolled = 0;
    for (let element: HTMLElement | null = frame.parentElement; element && element !== document.documentElement; element = element.parentElement) {
        scrolled += element.scrollTop;
    }
    const top = frame.getBoundingClientRect().top;
    const previous = sample?.current;
    let withPage = previous?.withPage ?? true;
    if (previous && Math.abs(window.scrollY - previous.y) > 1) {
        withPage = Math.abs((top - previous.top) + (window.scrollY - previous.y)) < 2;
    }
    const y0 = previous?.y0 ?? (sample ? window.scrollY : 0);
    if (sample) {
        sample.current = { y: window.scrollY, y0, top, withPage };
    }
    return top + scrolled + (withPage ? window.scrollY - y0 : 0) + TAB_DROP;
}


export function CarouselArrows({ target, step, hue, back, side: fixedSide }: { target: RefObject<HTMLElement | null>; step: CarouselStep; hue: number; back?: () => void; /** The tab's side where the layer is as wide as the page (the Workbook's panel: at the left, as a System page's page tab). */ side?: "left" | "right" }) {
    const [at, setAt] = useState<{ left: number; right: number; top: number; edge: number; leftEdge: number; side: "left" | "right"; titleTop: number; tab: { bg: string; edge: string; ink: string } | null } | null>(null);

    // The tab's colours follow the reading mode (light, sepia, dark, auto) while the layer stays open: measured again when it changes.
    const [modeCount, setModeCount] = useState(0);
    useEffect(() => {
        const again = () => window.requestAnimationFrame(() => window.requestAnimationFrame(() => setModeCount(count => count + 1)));
        const observer = new MutationObserver(again);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
        const query = window.matchMedia?.("(prefers-color-scheme: dark)");
        query?.addEventListener?.("change", again);
        return () => {
            observer.disconnect();
            query?.removeEventListener?.("change", again);
        };
    }, []);

    const tabCache = useRef<{ key: string; value: ReturnType<typeof tabColours> } | null>(null);
    const measureTick = useRef(0);
    const restSample = useRef<{ y: number; y0: number; top: number; withPage: boolean } | null>(null);
    // (The room the bullets make round the arrow, as last placed: useRailSlot, below.)
    const railSlot = useRef<RailSlot | null>(null);
    // (The tab's last places: a place that alternates with another is settled -- below.)
    const recentTops = useRef<number[]>([]);

    useLayoutEffect(() => {
        const node = target.current;
        if (!node) {
            return;
        }
        const box = node.getBoundingClientRect();
        // (At the page arrows' own level; the arrows never leave the window.)
        const top = arrowLevel() ?? window.innerHeight / 2;
        const left = Math.max(4, box.left - CAROUSEL_ARROW_GAP - CAROUSEL_ARROW_WIDTH);
        const right = Math.max(4, window.innerWidth - box.right - CAROUSEL_ARROW_GAP - CAROUSEL_ARROW_WIDTH);
        // (The tab's colours walk the layer's boxes and read their styles: kept until the layer is resized, the reading mode changes or the layer is another, not read again at every render -- typing in a card renders it at every key.)
        const key = (completedLayer(node) ? "done:" : "") + modeCount + ":" + measureTick.current + ":" + Math.round(box.width) + ":" + node.className;
        if (tabCache.current?.key !== key) {
            tabCache.current = { key, value: tabColours(node) };
        }
        const tab = tabCache.current.value;
        // (The tab is level with the top of the layer as it stands unscrolled, and always in view; scrolling the layer does not move it.)
        const headerBottom = Math.max(0, document.querySelector(".app-header")?.getBoundingClientRect().bottom ?? 0);
        // (Never so low that the tab's own bullets and Back do not fit above the window's foot -- a lower chapter's dialog at 768px squeezed its Back under its
        // last bullet; layout check, 2026-11-14: its whole height, 12px clear, kept in the window where the window has it.)
        // (Its natural height: the bullets' list may be squeezed by the height it was given, so its own full height is counted.)
        const railList = railRef.current?.querySelector<HTMLElement>(".bullet-rail-list");
        // (Less the room the bullets make round the arrow: where that room falls depends on where the tab stands, so counting it moved the tab, which moved the room, a pixel
        // at a time, until React stopped -- a tab of nine Themes at 1366 x 768, layout check 2026-11-21. Measured without it, the height is the same wherever the tab stands;
        // a tab the arrow then makes taller than the window allows scrolls, its Back in view, as any capped tab.)
        const madeRound = railSlot.current ? railSlot.current.shift + railSlot.current.extra : 0;
        const railHeight = railRef.current ? Math.max(0, railRef.current.scrollHeight + (railList ? Math.max(0, railList.scrollHeight - railList.clientHeight) : 0) - madeRound) : 0;
        // (In a window too short for the tab -- a phone turned to landscape, 390px tall -- the tab's height and its place moved each other a few pixels at a time until
        // React stopped (the Handbook at 844 x 390, 2026-11-24): its place is a whole pixel, and a move under 2px is no move.)
        const placed = Math.round(Math.max(headerBottom + 12, Math.min(titleTopOf(node, restSample), window.innerHeight - Math.max(160, railHeight + 12))));
        // (A place that comes back after one other -- the tab's height and its place each moving the other, back and forth -- settles on the higher of the two.)
        const seen = recentTops.current;
        const titleTop = seen.length >= 2 && seen[seen.length - 2] === placed && seen[seen.length - 1] !== placed ? Math.min(placed, seen[seen.length - 1]) : placed;
        recentTops.current = [...seen.slice(-3), titleTop];
        // (The tab stands on the side of the layer that is nearer its end of the page: a layer in the left half has it at its left, one in the right half at its right.)
        // (A layer as wide as the page -- the Capabilities' dialog, the Workbook's panel -- has its tab at the left, as a System page's page tab: at the right it was
        // squeezed between the layer and the window's edge; owner, 2026-11-22 21:00 UTC+2, "their rails".)
        const pageWide = box.width > window.innerWidth * 0.7;
        const side: "left" | "right" = fixedSide ?? (pageWide || box.left + box.width / 2 < window.innerWidth / 2 ? "left" : "right");
        setAt(previous => previous && Math.abs(previous.left - left) < 0.5 && Math.abs(previous.right - right) < 0.5 && Math.abs(previous.top - top) < 0.5 && Math.abs(previous.titleTop - titleTop) < 2 && previous.side === side && Math.abs(previous.leftEdge - box.left) < 0.5 && previous.tab?.bg === tab?.bg && previous.tab?.edge === tab?.edge && previous.tab?.ink === tab?.ink ? previous : { left, right, top, edge: box.right, leftEdge: box.left, side, titleTop, tab });
    });

    // (Measured again whenever the box or the window changes size.)
    const [, measureAgain] = useState(0);
    useEffect(() => {
        const node = target.current;
        const again = () => {
            measureTick.current += 1;
            measureAgain(count => count + 1);
        };
        window.addEventListener("resize", again);
        // (A layer that moves without changing its size while it settles after growing from its tile is measured again for a moment, so the tab takes its place at the top of its layer and then stays there: scrolling does not move it.)
        const moved = () => measureAgain(count => count + 1);
        let frames = 0;
        let frame = 0;
        const settle = () => {
            moved();
            frames += 1;
            if (frames < 40) {
                frame = window.requestAnimationFrame(settle);
            }
        };
        frame = window.requestAnimationFrame(settle);
        const observer = typeof ResizeObserver === "undefined" || !node ? null : new ResizeObserver(again);
        if (node) {
            observer?.observe(node);
        }
        return () => {
            window.removeEventListener("resize", again);
            window.cancelAnimationFrame(frame);
            observer?.disconnect();
        };
    }, [target]);

    const stepRef = useRef(step);
    stepRef.current = step;
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) {
                return;
            }
            // (The arrow keys alone, where nothing else uses them: not in a field, a picker, a list or a menu.)
            const inside = event.target instanceof Element ? event.target : null;
            if (!event.altKey && inside?.closest("input, textarea, select, [contenteditable=true], [role=listbox], [role=menu], [role=slider], .option-picker, .date-cell, .month-picker")) {
                return;
            }
            // (Only the topmost layer answers.)
            const layers = document.querySelectorAll("[data-carousel]");
            if (layers[layers.length - 1]?.contains(target.current)) {
                event.preventDefault();
                (event.key === "ArrowLeft" ? stepRef.current.previous : stepRef.current.next)();
            }
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [target]);

    // Only the topmost layer shows its arrows and rail: the one under it stands at the same place, and its bullets would overlap the top one's.
    const [topmost, setTopmost] = useState(true);
    // A DIALOG UNDER A FLOATING CARD SHOWS NEITHER ITS ARROWS NOR ITS RAIL (owner, 2026-11-17 00:22, "Hide it"): only the layer opened last has them, whether or not the
    // card has cards beside it; the dialog's rail and arrows come back when the card closes.
    const [covered, setCovered] = useState(false);
    useEffect(() => {
        const check = () => {
            const layers = document.querySelectorAll("[data-carousel]");
            setTopmost(layers.length === 0 || !!layers[layers.length - 1]?.contains(target.current));
            setCovered(!!document.querySelector(".floating-overlay") && !target.current?.closest(".floating-overlay"));
        };
        check();
        const observer = typeof MutationObserver === "undefined" ? null : new MutationObserver(check);
        // (A layer added, or a layer that becomes a carousel after it is drawn -- its data-carousel set once its step is known: the new Theme of a Strategic Period's "+"
        // was one, and the layer under it kept its arrows under the new one's when the page was busy; layout check, 2026-11-21.)
        observer?.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-carousel"] });
        return () => observer?.disconnect();
    }, [target]);

    // THE ARROWS NEVER MOVE and THE TAB'S LIST FLOWS ROUND THE ARROW (docs/ai/09-layout-rules.md, section 10, "Page tab"; owner, 2026-11-09: "If the bullets are a lot,
    // they should continue after the arrow"): both arrows stand at the middle of the layer; where the tab stands under an arrow, its lines run in order at their own
    // pitch and the arrow takes exactly one line's place among them -- the line that would reach it continues right after it, one line's gap on each side -- the list
    // set down by less than one pitch (`shift`) so that the gaps above and below the arrow are the list's own.
    const railRef = useRef<HTMLElement | null>(null);
    // (The tab measured again whenever it, or the window, changes size: names arriving, fonts loading, the layer moving.)
    const [, setRailSize] = useState(0);
    const itemCount = step.items?.length ?? 0;
    // Whether the tab's bullets do not fit the height the window leaves it (they then scroll, with the Back in view).
    const [capped, setCapped] = useState(false);
    useLayoutEffect(() => {
        // (Measured from the bullets' own positions and the height the tab was given, never from the list's scrolling box, so that scrolling it does not change the answer.)
        const rail = railRef.current;
        const list = rail?.querySelector<HTMLElement>(".bullet-rail-list");
        const first = list?.firstElementChild;
        const last = list?.lastElementChild;
        const given = rail ? parseFloat(rail.style.maxHeight) : NaN;
        let next = false;
        if (rail && first && last && Number.isFinite(given)) {
            const back = rail.querySelector<HTMLElement>(".carousel-rail-back");
            const content = last.getBoundingClientRect().bottom - first.getBoundingClientRect().top;
            next = content > given - 24 - (back ? back.offsetHeight + 12 : 0) + 1;
        }
        setCapped(current => current === next ? current : next);
    });
    useEffect(() => {
        const rail = railRef.current;
        const again = () => setRailSize(count => count + 1);
        window.addEventListener("resize", again);
        const observer = typeof ResizeObserver === "undefined" || !rail ? null : new ResizeObserver(again);
        if (rail) {
            observer?.observe(rail);
        }
        return () => {
            window.removeEventListener("resize", again);
            observer?.disconnect();
        };
    }, [at?.edge, at?.tab, topmost]);
    const arrowsTop = at?.top ?? 0;
    // NAMES BY THE ROOM ONLY (owner, 2026-11-18 20:13 UTC+2: "Floated cards - Rails, only with dots and tooltips. Dialogue and Chapters - Rails with dots and names
    // (full size) only when screen size permits"): a floating card's rail (it steps through cards) has its dots and tooltips alone; a dialog's (it steps through
    // sections) shows its names, whole, where the room beside its layer holds the named tab (--rail-tab-named-width, bullet-rail.css), else its dots alone. No caller sets it.
    const room = at ? (at.tab ? (at.side === "left" ? at.leftEdge : window.innerWidth - at.edge) : (at.side === "left" ? at.left : at.right)) : 0;
    const namedWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rail-tab-named-width")) || 220;
    const named = step.what === "section" && room >= namedWidth;

    // (The one placement of every rail: useRailSlot, shared with the page's rails.)
    const slot = useRailSlot(railRef, () => at ? { left: at.side === "left" ? at.left : window.innerWidth - at.right - CAROUSEL_ARROW_WIDTH, right: (at.side === "left" ? at.left : window.innerWidth - at.right - CAROUSEL_ARROW_WIDTH) + CAROUSEL_ARROW_WIDTH, top: at.top - 22, bottom: at.top + 22 } : null, !!at?.tab && !covered && !isPhone());
    railSlot.current = slot;

    if (!at || !topmost || covered) {
        return null;
    }
    return (
        <>
            <NavArrow
                // (Standing in the tab's list, the arrow takes the tab's edge colour as its fill, as it did before the list ran on round it; owner, 2026-11-10: "The
                // carousel arrow in the card tag, fill colour used to be like its wire".)
                className={"page-arrow carousel-arrow" + (slot && at.tab && at.side === "left" ? " carousel-arrow-on-tab" : "")}
                data-completed={completedLayer(target.current) ? "" : undefined}
                direction="previous"
                label={"Previous " + step.what}
                title={"Previous " + step.what + " (←)"}
                style={{ left: at.left, top: arrowsTop, "--strategy-theme-hue": hue, ...(at.tab ? { "--tab-edge": at.tab.edge } : {}) } as CSSProperties}
                onClick={step.previous}
            />
            <NavArrow
                className={"page-arrow carousel-arrow" + (slot && at.tab && at.side === "right" ? " carousel-arrow-on-tab" : "")}
                data-completed={completedLayer(target.current) ? "" : undefined}
                direction="next"
                label={"Next " + step.what}
                title={"Next " + step.what + " (→)"}
                style={{ right: at.right, top: arrowsTop, "--strategy-theme-hue": hue, ...(at.tab ? { "--tab-edge": at.tab.edge } : {}) } as CSSProperties}
                onClick={step.next}
            />
            {step.items && step.items.length > 1 && step.go && (
                // The rail under the arrows (the right one's): a bullet for each of the list, this one's lit; its name beside it where the window has the room for the named tab, else in a tooltip (`named`).
                <nav
                    ref={railRef}
                    className={"carousel-rail" + (named ? " carousel-rail-named" : "") + (at.tab ? " carousel-rail-tab" : "") + (at.tab && capped ? " carousel-rail-capped" : "") + (at.tab && at.side === "left" ? " carousel-rail-tab-left" : "")}
                    aria-label={"Go to a " + step.what}
                    // (A tab stands behind its layer, 1px under the layer's edge, so no gap opens between them: the layer's own edge is what shows where they meet; owner, 2026-11-11.)
                    style={{ ...(at.tab && at.side === "left" ? { right: window.innerWidth - at.leftEdge - 1 } : { left: at.tab ? at.edge - 1 : at.edge }), top: at.tab ? at.titleTop : at.top + 36, ...(at.tab ? { maxHeight: Math.max(120, window.innerHeight - at.titleTop - 12) } : {}), "--rail-label-room": Math.max(0, (at.tab ? (at.side === "left" ? at.leftEdge : window.innerWidth - at.edge) - 25 : at.right) - 8 - (at.tab ? 0 : 24)) + "px", "--strategy-theme-hue": hue, ...(at.tab ? { "--tab-bg": at.tab.bg, "--tab-edge": at.tab.edge, "--tab-ink": at.tab.ink } : {}) } as unknown as CSSProperties}
                >
                    <ol className="bullet-rail-list">
                        {step.items.map((item, position) => (
                            <li key={item.id} style={slotMargin(slot, position) > 0 ? { marginTop: slotMargin(slot, position) } : undefined}>
                                <button
                                    type="button"
                                    className={"bullet-rail-item" + (position === step.current ? " active" : "")}
                                    aria-current={position === step.current ? "true" : undefined}
                                    aria-label={item.label + (item.missing ? " (something is missing)" : "")}
                                    data-missing={item.missing ? "" : undefined}
                                    onClick={() => step.go?.(item.id)}
                                >
                                    <span className="bullet-rail-dot status-shape" aria-hidden="true" />
                                    {/* A name beside its dot where the tab shows names; else the app's one tooltip (TitleTooltips: its name, aria-label), drawn over every
                                        layer -- a tip drawn in the tab stood behind the dialog, as the tab does (owner, 2026-11-18 22:05 UTC+2: "Tooltips are behind the cards"). */}
                                    {named && <span className="strategy-card-nav-tip" aria-hidden="true">{item.label}</span>}
                                </button>
                            </li>
                        ))}
                    </ol>
                    {/* The way back stands in the tab, after the last option (the dialog's own foot no longer has it while the tab does). */}
                    {back && (
                        <BackButton className="carousel-rail-back" style={slot && slot.index === itemCount && slot.extra > 0 ? { marginTop: 12 + slot.extra } : undefined} onClick={back} aria-label="Back" />
                    )}
                </nav>
            )}
        </>
    );
}
