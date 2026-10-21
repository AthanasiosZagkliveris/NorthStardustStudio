import type { CSSProperties, ReactNode } from "react";

/** The grounds an asset stands on in the gallery: the page, and a System card in the sample's hue. */
export const GROUNDS = ["page", "card"] as const;

/**
 * One sample of an asset: its variant, palette hue, ground and state are
 * written on the wrapper, where tools/scripts/library/run.mjs reads them.
 */
export default function Sample({ variant, hue, ground, state, className, children }: {
    variant: string;
    /** A palette hue, or null for a sample outside any card of a hue. */
    hue: number | null;
    ground: string;
    state: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={"library-sample library-ground-" + ground + (className ? " " + className : "")}
            data-sample=""
            data-variant={variant}
            data-hue={hue === null ? "none" : hue}
            data-ground={ground}
            data-state={state}
            style={hue === null ? undefined : { "--strategy-theme-hue": hue } as CSSProperties}
        >
            {children}
        </div>
    );
}
