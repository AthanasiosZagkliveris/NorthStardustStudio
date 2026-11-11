import { useEffect, type RefObject } from "react";

/**
 * THE CARD'S END TAKES ITS LAST BAND'S COLOUR (owner, 2026-11-09: "The end of all the cards' colour should follow the last field's colour"; docs/ai/tile-and-card-pattern.md,
 * "One band pattern"). A card or a dialog whose bands end above its own foot (its padding, the room a dialog keeps under its content) is painted from the foot of its LAST band
 * down to its end in that band's colour: a tinted last band runs to the card's end, an untinted one leaves the card's own ground. The bands are the `legal-entity-org-section`s, the rows of a Legal card and
 * a founder's bands (owner, 2026-11-11: the Founder card's end in its Skills band's colour); the last is the one that ends lowest (two side by side end together). The colour drawn is said in `data-end-ground` for the card audit.
 *
 * NO SEAM UNDER THE LAST BAND (owner, 2026-11-11: a faint line under the Registrations card's last band). The band's tint is see-through, so where the band and the colour
 * painted under it meet, part of a screen pixel drawn by both shows as a darker line, or by neither as a lighter one; on a display scaled to 125% or 150% a CSS pixel is not a
 * screen pixel and the two cannot be made to meet. So where the last band stands alone under its own divider line (the opaque 1px line between two bands), the colour is
 * painted from the middle of that line down, under the band too, and the band itself is drawn clear (`data-end-band` keeps its colour): the one edge is under the line.
 */
const CLEAR = "transparent";

function isTinted(colour: string): boolean {
    return !!colour && colour !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(colour) && !/\/\s*0\)$/.test(colour);
}

/** The band drawn clear again, its own colour back. */
function restoreBand(band: HTMLElement): void {
    band.style.removeProperty("background-color");
    delete band.dataset.endBand;
}

export function paintCardEnd(card: HTMLElement): void {
    const box = card.getBoundingClientRect();
    const bands = [...card.querySelectorAll<HTMLElement>(".legal-entity-org-section, .legal-entity-grid-requirement > *, .legal-entity-grid-expense-card > *, .founders-profile .founder-band")].filter(band => {
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
    // A band drawn clear by an earlier paint that is no longer the last gets its colour back.
    for (const band of card.querySelectorAll<HTMLElement>("[data-end-band]")) {
        if (band !== last && band.closest(".section-tile-dialog, .floating-card-body") === card) {
            restoreBand(band);
        }
    }
    const ground = last ? (last.dataset.endBand ?? getComputedStyle(last).backgroundColor) : "";
    const tinted = isTinted(ground);
    if (!last || !tinted || lowest >= box.bottom - 1) {
        if (last?.dataset.endBand !== undefined) {
            restoreBand(last);
        }
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
    // Where the colour starts, down the page: the middle of the last band's own divider line, when it stands alone under one (nothing beside it ends with it);
    // otherwise the band's foot, on whole pixels (a stop at a part of a pixel tinted the band's last row twice).
    const lastBox = last.getBoundingClientRect();
    const lastStyle = getComputedStyle(last);
    const line = parseFloat(lastStyle.borderTopWidth) || 0;
    const alone = !bands.some(band => band !== last && Math.abs(band.getBoundingClientRect().bottom - lowest) <= 1);
    const underLine = alone && line >= 1 && lastStyle.borderTopStyle !== "none" && !/\/\s*0?\.\d+\)$|rgba\([^)]*,\s*0?\.\d+\)$/.test(lastStyle.borderTopColor);
    const seam = underLine ? lastBox.top + line / 2 : lowest;
    const stop = (top: number, border: number) => underLine
        ? Math.round((seam - top - border) * 100) / 100
        : Math.round(lowest) - Math.round(top) - border;
    // (Measured in the card's own box: where the colour starts, less its top edge.)
    const from = stop(box.top, card.clientTop);
    // (The vertical dividers below start at the band's foot, as before.)
    const foot = Math.round(lowest) - Math.round(box.top) - card.clientTop;
    if (underLine) {
        if (last.dataset.endBand === undefined) {
            last.dataset.endBand = ground;
            last.style.setProperty("background-color", CLEAR, "important");
        }
    } else if (last.dataset.endBand !== undefined) {
        restoreBand(last);
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
        positions.unshift(Math.round((divider.getBoundingClientRect().left - box.left - card.clientLeft) * 10) / 10 + "px " + foot + "px");
        sizes.unshift("1px calc(100% - " + foot + "px)");
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
        // (Under the line, a box that ends with the band is painted too: the band is drawn clear over it.)
        if (!opaque || (!underLine && r.bottom <= lowest + 1)) {
            continue;
        }
        const at = stop(r.top, inner.clientTop);
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
