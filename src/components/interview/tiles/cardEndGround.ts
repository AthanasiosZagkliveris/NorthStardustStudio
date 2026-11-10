import { useEffect, type RefObject } from "react";

/**
 * THE CARD'S END TAKES ITS LAST BAND'S COLOUR (owner, 2026-11-09: "The end of all the cards' colour should follow the last field's colour"; docs/ai/tile-and-card-pattern.md,
 * "One band pattern"). A card or a dialog whose bands end above its own foot (its padding, the room a dialog keeps under its content) is painted from the foot of its LAST band
 * down to its end in that band's colour: a tinted last band runs to the card's end, an untinted one leaves the card's own ground. The bands are the `legal-entity-org-section`s and the rows of a Legal card;
 * the last is the one that ends lowest (two side by side end together). The colour drawn is said in `data-end-ground` for the card audit.
 */
export function paintCardEnd(card: HTMLElement): void {
    const box = card.getBoundingClientRect();
    const bands = [...card.querySelectorAll<HTMLElement>(".legal-entity-org-section, .legal-entity-grid-requirement > *, .legal-entity-grid-expense-card > *")].filter(band => {
        const r = band.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && band.closest(".section-tile-dialog, .floating-card-body") === card;
    });
    let last: HTMLElement | null = null;
    let lowest = -Infinity;
    for (const band of bands) {
        const bottom = band.getBoundingClientRect().bottom;
        if (bottom > lowest + 0.5) {
            lowest = bottom;
            last = band;
        }
    }
    const ground = last ? getComputedStyle(last).backgroundColor : "";
    const tinted = !!ground && ground !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(ground) && !/\/\s*0\)$/.test(ground);
    // (Measured in the card's own box: where its last band ends, less its top edge.)
    const from = last ? Math.round((lowest - box.top - card.clientTop) * 10) / 10 : 0;
    if (!last || !tinted || lowest >= box.bottom - 1) {
        if (card.dataset.endGround !== undefined) {
            card.style.backgroundImage = "";
            card.style.backgroundPosition = "";
            card.style.backgroundSize = "";
            card.style.backgroundRepeat = "";
            delete card.dataset.endGround;
        }
        for (const inner of card.querySelectorAll<HTMLElement>("[data-end-ground]")) {
            inner.style.removeProperty("background-image");
            delete inner.dataset.endGround;
        }
        return;
    }
    // A vertical divider that ends with the last band (the right column's own left border, as the Value Proposition's needs) runs on to the card's end, through
    // the colour it divides (owner, 2026-11-09: "the vertical divide lines should reach ... the end of its sections (and colour varied part)").
    const dividers = [...card.querySelectorAll<HTMLElement>(".legal-entity-field + .legal-entity-field")].filter(field => {
        const r = field.getBoundingClientRect();
        return parseFloat(getComputedStyle(field).borderLeftWidth) >= 1 && Math.abs(r.bottom - lowest) <= 1 && field.closest(".section-tile-dialog, .floating-card-body") === card;
    });
    const layers = ["linear-gradient(to bottom, transparent " + from + "px, " + ground + " " + from + "px)"];
    const positions = ["0 0"];
    const sizes = ["auto"];
    for (const divider of dividers) {
        const colour = getComputedStyle(divider).borderLeftColor;
        layers.unshift("linear-gradient(" + colour + ", " + colour + ")");
        positions.unshift(Math.round((divider.getBoundingClientRect().left - box.left - card.clientLeft) * 10) / 10 + "px " + from + "px");
        sizes.unshift("1px calc(100% - " + from + "px)");
    }
    const image = layers.join(", ");
    if (card.style.backgroundImage !== image) {
        card.style.backgroundImage = image;
        card.style.backgroundPosition = positions.join(", ");
        card.style.backgroundSize = sizes.join(", ");
        card.style.backgroundRepeat = "no-repeat";
        card.dataset.endGround = ground;
    }
    // A box inside the card with a ground of its own that holds the last band and reaches below it (a Legal card's box, a Profile's card inside its floating
    // body): its end is what shows, so it is painted from the band's foot down too (owner, 2026-11-10: "the last part of the floated cards should have the same
    // colour as their last field").
    for (let inner = last.parentElement; inner && inner !== card; inner = inner.parentElement) {
        const own = getComputedStyle(inner).backgroundColor;
        const opaque = own !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(own) && !/\/\s*0\)$/.test(own);
        const r = inner.getBoundingClientRect();
        if (!opaque || r.bottom <= lowest + 1) {
            continue;
        }
        const at = Math.round((lowest - r.top - inner.clientTop) * 10) / 10;
        const ownImage = "linear-gradient(to bottom, transparent " + at + "px, " + ground + " " + at + "px)";
        if (inner.style.getPropertyValue("background-image") !== ownImage) {
            inner.style.setProperty("background-image", ownImage, "important");
            inner.dataset.endGround = ground;
        }
    }
}

/** Keeps the end of every card and dialog under `root` in its last band's colour while they change (answers, folds, the window). */
export function useCardEndGround(root: RefObject<HTMLElement | null>, active = true): void {
    useEffect(() => {
        const node = root.current;
        if (!node || !active) {
            return;
        }
        let frame = 0;
        const paint = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const cards = [...(node.matches(".section-tile-dialog, .floating-card-body") ? [node] : []), ...node.querySelectorAll<HTMLElement>(".section-tile-dialog, .floating-card-body")];
                cards.forEach(paintCardEnd);
            });
        };
        paint();
        const resize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(paint);
        resize?.observe(node);
        const mutation = typeof MutationObserver === "undefined" ? null : new MutationObserver(paint);
        mutation?.observe(node, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "open", "aria-expanded"] });
        window.addEventListener("resize", paint);
        return () => {
            cancelAnimationFrame(frame);
            resize?.disconnect();
            mutation?.disconnect();
            window.removeEventListener("resize", paint);
        };
    }, [root, active]);
}
