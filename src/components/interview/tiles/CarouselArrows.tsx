import BackButton from "../../controls/BackButton.tsx";
import { CSSProperties, RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { type CarouselStep } from "./SectionTileTypes.ts";
import { arrowLevel } from "./SectionTileGeometry.tsx";

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
    if (node.querySelector(COMPLETED_CARD)) {
        const root = getComputedStyle(document.documentElement);
        return { bg: style.backgroundColor, edge: root.getPropertyValue("--line-completed").trim() || style.borderTopColor, ink: root.getPropertyValue("--text-completed-ink").trim() || style.color };
    }
    // (A hairline that is a translucent light -- a card's inner light -- is no colour to draw a tab or its bullets in: the layer's own line accent is, as a dialog's tab has it.)
    const translucent = /\/\s*0?\.\d+\)$|rgba\([^)]*,\s*0?\.\d+\)$/.test(style.borderTopColor);
    return { bg: style.backgroundColor, edge: opaque(style.borderTopColor) && !translucent && parseFloat(style.borderTopWidth) > 0 ? style.borderTopColor : "hsl(var(--strategy-theme-hue, 0) var(--theme-line-accent))", ink: style.color };
}


/** Where a layer's page tab starts: 12px under the top of the frame it is attached to (a floating card's own frame, never the box name above it; a dialog's panel). */
export const TAB_DROP = 12;


export function titleTopOf(node: HTMLElement): number {
    const frame = node.querySelector<HTMLElement>(".floating-card-body") ?? node;
    return frame.getBoundingClientRect().top + TAB_DROP;
}


export function CarouselArrows({ target, step, hue, back }: { target: RefObject<HTMLElement | null>; step: CarouselStep; hue: number; back?: () => void }) {
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
        const key = (node.querySelector(COMPLETED_CARD) ? "done:" : "") + modeCount + ":" + measureTick.current + ":" + Math.round(box.width) + ":" + node.className;
        if (tabCache.current?.key !== key) {
            tabCache.current = { key, value: tabColours(node) };
        }
        const tab = tabCache.current.value;
        const titleTop = titleTopOf(node);
        // (The tab stands on the side of the layer that is nearer its end of the page: a layer in the left half has it at its left, one in the right half at its right.)
        const side: "left" | "right" = box.left + box.width / 2 < window.innerWidth / 2 ? "left" : "right";
        setAt(previous => previous && Math.abs(previous.left - left) < 0.5 && Math.abs(previous.right - right) < 0.5 && Math.abs(previous.top - top) < 0.5 && Math.abs(previous.titleTop - titleTop) < 0.5 && previous.side === side && Math.abs(previous.leftEdge - box.left) < 0.5 && previous.tab?.bg === tab?.bg && previous.tab?.edge === tab?.edge && previous.tab?.ink === tab?.ink ? previous : { left, right, top, edge: box.right, leftEdge: box.left, side, titleTop, tab });
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
        const observer = typeof ResizeObserver === "undefined" || !node ? null : new ResizeObserver(again);
        if (node) {
            observer?.observe(node);
        }
        return () => {
            window.removeEventListener("resize", again);
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
    useEffect(() => {
        const check = () => {
            const layers = document.querySelectorAll("[data-carousel]");
            setTopmost(layers.length === 0 || !!layers[layers.length - 1]?.contains(target.current));
        };
        check();
        const observer = typeof MutationObserver === "undefined" ? null : new MutationObserver(check);
        observer?.observe(document.body, { childList: true });
        return () => observer?.disconnect();
    }, [target]);

    // THE TAB STANDS AT THE TOP OF ITS LAYER, level with the layer's title, and never hides the arrow: where the arrow stands in the tab's column, the bullets that would lie under it follow below it (a gap the arrow's size is left in the list).
    const railRef = useRef<HTMLElement | null>(null);
    const [gap, setGap] = useState<{ index: number; size: number } | null>(null);
    const [arrowOnTab, setArrowOnTab] = useState(false);
    const itemCount = step.items?.length ?? 0;
    // (The tab measured again whenever it, or the window, changes size: names arriving, fonts loading, the layer moving.)
    const [railSize, setRailSize] = useState(0);
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
    const railTop = at?.tab ? at.titleTop : null;
    const arrowTop = at?.top ?? 0;
    useLayoutEffect(() => {
        const rail = railRef.current;
        if (!rail || railTop === null) {
            setGap(null);
            setArrowOnTab(false);
            return;
        }
        // (Every line of the tab -- the bullets, then Back -- as it stands without the gap: its measured top, less what the gap itself moved it.)
        const lines = [...rail.querySelectorAll<HTMLElement>("ol > li, .carousel-rail-back")];
        const from = arrowTop - 22 - 8;
        const to = arrowTop + 22 + 8;
        let index = -1;
        let naturalTop = 0;
        for (let position = 0; position < lines.length; position += 1) {
            const box = lines[position].getBoundingClientRect();
            const top = box.top - (gap && position >= gap.index ? gap.size : 0);
            if (index < 0 && top + box.height > from) {
                index = position;
                naturalTop = top;
            }
        }
        const size = index < 0 ? 0 : Math.max(0, to - naturalTop);
        const next = index >= 0 && size > 0 ? { index, size } : null;
        setGap(previous => previous?.index === next?.index && Math.abs((previous?.size ?? 0) - (next?.size ?? 0)) < 0.5 ? previous : next);
        setArrowOnTab(index >= 0 && naturalTop < to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [railTop, arrowTop, itemCount, at?.edge, back, gap?.index, gap?.size, railSize, topmost]);

    if (!at || !topmost) {
        return null;
    }
    return (
        <>
            <button
                type="button"
                className={"page-arrow carousel-arrow" + (arrowOnTab && at.side === "left" ? " carousel-arrow-on-tab" : "")}
                data-completed={target.current?.querySelector(COMPLETED_CARD) ? "" : undefined}
                data-direction="previous"
                aria-label={"Previous " + step.what}
                title={"Previous " + step.what + " (←)"}
                style={{ left: at.left, top: at.top, "--strategy-theme-hue": hue, ...(at.tab ? { "--tab-edge": at.tab.edge } : {}) } as CSSProperties}
                onClick={step.previous}
            >
                ‹
            </button>
            <button
                type="button"
                className={"page-arrow carousel-arrow" + (arrowOnTab && at.side === "right" ? " carousel-arrow-on-tab" : "")}
                data-completed={target.current?.querySelector(COMPLETED_CARD) ? "" : undefined}
                data-direction="next"
                aria-label={"Next " + step.what}
                title={"Next " + step.what + " (→)"}
                style={{ right: at.right, top: at.top, "--strategy-theme-hue": hue, ...(at.tab ? { "--tab-edge": at.tab.edge } : {}) } as CSSProperties}
                onClick={step.next}
            >
                ›
            </button>
            {step.items && step.items.length > 1 && step.go && (
                // The rail under the arrows (the right one's): a bullet for each of the list, this one's lit. A card's bullet says its name in a tooltip (a card is named by the user); a SECTION'S bullet has its name beside it (the tiles' names are given), where the window has the room for it.
                <nav
                    ref={railRef}
                    className={"carousel-rail" + (step.what === "section" && (at.tab && at.side === "left" ? at.left : at.right) >= 160 ? " carousel-rail-named" : "") + (at.tab ? " carousel-rail-tab" : "") + (at.tab && at.side === "left" ? " carousel-rail-tab-left" : "")}
                    aria-label={"Go to a " + step.what}
                    style={{ ...(at.tab && at.side === "left" ? { right: window.innerWidth - at.leftEdge } : { left: at.edge }), top: at.tab ? at.titleTop : at.top + 36, "--rail-label-room": Math.max(0, (at.tab && at.side === "left" ? at.left : at.right) - 8 - 24) + "px", "--strategy-theme-hue": hue, ...(at.tab ? { "--tab-bg": at.tab.bg, "--tab-edge": at.tab.edge, "--tab-ink": at.tab.ink } : {}) } as unknown as CSSProperties}
                >
                    <ol className="bullet-rail-list">
                        {step.items.map((item, position) => (
                            <li key={item.id} style={gap?.index === position ? { marginTop: gap.size } : undefined}>
                                <button
                                    type="button"
                                    className={"bullet-rail-item" + (position === step.current ? " active" : "")}
                                    aria-current={position === step.current ? "true" : undefined}
                                    aria-label={item.label + (item.missing ? " (something is missing)" : "")}
                                    data-missing={item.missing ? "" : undefined}
                                    onClick={() => step.go?.(item.id)}
                                >
                                    <span className="bullet-rail-dot status-shape" aria-hidden="true" />
                                    <span className="strategy-card-nav-tip" aria-hidden="true">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ol>
                    {/* The way back stands in the tab, after the last option (the dialog's own foot no longer has it while the tab does). */}
                    {back && (
                        <BackButton className="carousel-rail-back" style={gap && gap.index === itemCount ? { marginTop: 12 + gap.size } : undefined} onClick={back} aria-label="Back" title="Back" />
                    )}
                </nav>
            )}
        </>
    );
}
