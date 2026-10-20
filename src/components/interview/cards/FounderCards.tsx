import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

import { drawnTitle, useDialogInnerBack, useTitleSlide } from "../tiles/SectionTiles.tsx";

import "../../../styles/section-tiles.css";

/** The most open founder cards the Founders dialog shows (two rows of four). */

/** A founder tile's title (it slides under the pointer to show a long name, as every tile title does). */
function FounderTitle({ children }: { children: ReactNode }) {
    const title = useRef<HTMLSpanElement | null>(null);
    useTitleSlide(title);
    return <span ref={title} className="section-tile-title">{children}</span>;
}

export const MAX_OPEN_FOUNDERS = 8;

/** The most across in a row of open cards. */
export const FOUNDERS_PER_ROW = 4;

/** How many open cards stand in each row for `count` founders (1 to 8): one row up to four, else two balanced rows. */
export function foundersPerRow(count: number): number {
    return count <= FOUNDERS_PER_ROW ? Math.max(1, count) : Math.ceil(count / 2);
}

export interface FounderSummary {
    id: string;
    name: string;
    /** The first role, the box's small second line. */
    role: string;
}

/**
 * THE FOUNDERS' DIALOG CONTENT (docs/ai/layout-rules.md, "Section tiles and
 * dialog"): their cards use the dialog's whole width (every dialog is the page's
 * width).
 *
 *  - 1 to 4 founders: every card OPEN (no fold arrow), side by side in ONE row, the
 *    row centred;
 *  - 5 to 8: two rows of open cards, balanced (5 is 3 + 2), an incomplete last row
 *    centred;
 *    (every open card is one width, a quarter of the dialog's content less the gaps);
 *  - more than 8: each founder a CLOSED SQUARE box (a section tile's look: the
 *    name, the role as a small second line), in a grid. Pressing one opens that
 *    founder's card in place of the grid, one at a time; Back (and Escape)
 *    return to the grid first, then close the dialog.
 */
export default function FounderCards({

    founders,

    renderCard,

    empty,

    onOpening

}: {

    founders: readonly FounderSummary[];
    /** One founder's card; \`always\` is true where it cannot fold (it is shown open). */
    renderCard: (id: string, always: boolean) => ReactNode;
    empty: ReactNode;
    /**
     * Called when the dialog opens (this mounts) and when a founder's box opens its
     * card: the cards' Responsibilities lists start COLLAPSED every time, so the
     * editor clears what was unfolded before.
     */
    onOpening?: () => void;

}) {

    const [openId, setOpenId] = useState<string | null>(null);
    const open = founders.find(founder => founder.id === openId) ?? null;

    useEffect(() => {
        onOpening?.();
        // On opening only; the callback is a fresh function each render.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Back and Escape leave an open founder's card for the grid first.
    useDialogInnerBack(open ? () => setOpenId(null) : null, open ? (open.name.trim() || "Founder " + (founders.findIndex(founder => founder.id === open.id) + 1)) : undefined);

    if (founders.length === 0) {
        return <>{empty}</>;
    }

    if (founders.length <= MAX_OPEN_FOUNDERS) {
        return (
            <div className="founder-rows">
                <div
                    className="founder-row"
                    style={{ "--founders-per-row": foundersPerRow(founders.length) } as CSSProperties}
                >
                    {founders.map(founder => renderCard(founder.id, true))}
                </div>
            </div>
        );
    }

    if (open) {
        return <>{renderCard(open.id, true)}</>;
    }

    return (
        <div className="section-tiles-box">
            <div className="section-tiles section-tiles-founders" role="group" aria-label="Founders">
                {founders.map((founder, index) => (
                    <button
                        type="button"
                        className="section-tile"
                        key={founder.id}
                        data-anchor={"founder-" + founder.id}
                        data-opens=""
                        aria-label={drawnTitle(founder.name.trim().length > 0 ? founder.name : "Founder " + (index + 1))}
                        onClick={() => {
                            onOpening?.();
                            setOpenId(founder.id);
                        }}
                    >
                        <FounderTitle>
                            {founder.name.trim().length > 0 ? founder.name : "Founder " + (index + 1)}
                        </FounderTitle>
                        {founder.role.trim().length > 0 && (
                            <span className="section-tile-sub">{founder.role}</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );

}
