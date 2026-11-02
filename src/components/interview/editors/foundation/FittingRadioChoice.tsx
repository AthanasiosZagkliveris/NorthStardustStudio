import { useLayoutEffect, useRef, useState } from "react";
import RadioChoice from "../../../controls/RadioChoice.tsx";

/**
 * A RADIO CHOICE OF SHORT OPTIONS that stands in ONE row where the whole row fits the column, and in ONE column where it does not: never a row that wraps onto a second line.
 * The width of the row is measured once (the options set in a line); as the column grows or shrinks the choice goes from one to the other.
 */
export default function FittingRadioChoice<T extends string>(props: Omit<Parameters<typeof RadioChoice<T>>[0], "className">) {
    const wrapper = useRef<HTMLDivElement | null>(null);
    const natural = useRef(0);
    const [stacked, setStacked] = useState(false);

    useLayoutEffect(() => {
        const node = wrapper.current;
        const group = node?.firstElementChild as HTMLElement | null | undefined;
        if (!node || !group) {
            return;
        }
        const measure = () => {
            // (The row's own width is read while it stands in a row; while it stands in a column the last reading is kept.)
            if (group.classList.contains("business-segment-row")) {
                natural.current = group.scrollWidth;
            }
            setStacked(natural.current > node.clientWidth + 1);
        };
        measure();
        if (typeof ResizeObserver === "undefined") {
            return;
        }
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        void document.fonts?.ready.then(measure);
        return () => observer.disconnect();
    }, [props.options]);

    return (
        <div ref={wrapper} className="business-segment-fit">
            <RadioChoice {...props} className={stacked ? "legal-entity-radio-stack" : "business-segment-row"} />
        </div>
    );
}
