import { ReactNode, useLayoutEffect, useRef, useState } from "react";

/**
 * How many columns of at least `minWidth` fit in `width`, `gap` apart,
 * between one and `maxColumns`.
 */
export function columnCountFor(width: number, minWidth: number, gap: number, maxColumns = Infinity): number {
    if (!(width > 0)) {
        return 1;
    }
    return Math.max(1, Math.min(maxColumns, Math.floor((width + gap) / (minWidth + gap))));
}

/**
 * Card `index` (0-based) of `count` cards goes to column `index % columns`:
 * the NUMBERING STILL COUNTS ACROSS (1 2 3 / 4 5 6), while every column is its
 * own vertical stack.
 */
export function distributeAcross<T>(items: readonly T[], columns: number): T[][] {
    const stacks: T[][] = Array.from({ length: Math.max(1, columns) }, () => []);
    items.forEach((item, index) => stacks[index % stacks.length].push(item));
    return stacks;
}

/**
 * CARDS IN INDEPENDENT COLUMNS (docs/ai/layout-rules.md, "Card columns").
 *
 * As many columns as fit (each at least `minWidth` wide, `maxColumns` at
 * most), recomputed from the container's width as it changes. Card i goes to
 * column (i - 1) mod N, so the numbering reads across -- 1 2 3, then 4 5 6,
 * card 4 under card 1 -- and each column is its own vertical stack with a
 * card gap (--space-card) between its cards, tops aligned. Opening or
 * closing a card moves only the cards below it in ITS column: a grid row
 * would have made the other columns follow its height.
 *
 * The DOM, and so the tab order, runs column by column.
 */
export default function CardColumns({

    items,

    minWidth = 410,

    maxColumns = Infinity,

    className

}: {

    items: ReactNode[];
    /** The least a column is wide, in px. */
    minWidth?: number;
    /** The most columns, however wide the container is. */
    maxColumns?: number;
    className?: string;

}) {

    const element = useRef<HTMLDivElement | null>(null);

    const [columns, setColumns] = useState(1);

    useLayoutEffect(() => {

        const node = element.current;

        if (!node) {
            return;
        }

        const measure = () => {
            const gap = parseFloat(getComputedStyle(node).columnGap) || 12;
            setColumns(columnCountFor(node.clientWidth, minWidth, gap, maxColumns));
        };

        measure();

        if (typeof ResizeObserver === "undefined") {
            return;
        }

        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();

    }, [minWidth, maxColumns]);

    return (
        <div
            ref={element}
            className={"card-columns" + (className ? " " + className : "")}
        >
            {distributeAcross(items, columns).map((stack, index) => (
                <div className="card-column" key={index}>
                    {stack}
                </div>
            ))}
        </div>
    );

}
