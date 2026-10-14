import type { CSSProperties } from "react";

import LabelArrow from "../components/interview/LabelArrow";
import { PALETTE } from "../framework/engine/Palette";
import { assets } from "../library";
import type { AssetContract, AssetVariant } from "../library/contract";
import "../styles/library.css";

/**
 * THE LIBRARY GALLERY (development only; App.tsx mounts /library only in
 * `npm run dev`). Draws every asset that has a contract, in each of its
 * variants, states, palette hues and grounds, from the contract itself.
 * scripts/library/run.mjs opens it in each reading mode and window size
 * and measures what the contract says. Nothing here is part of the app.
 */

const GROUNDS = ["page", "card"] as const;
const SHOWN = [{ id: "closed", open: false }, { id: "open", open: true }] as const;

function LabelArrowSamples({ asset }: { asset: AssetContract }) {

    const sample = (variant: AssetVariant, hue: number, ground: string, state: string, open: boolean) => {

        const arrow = <LabelArrow open={open} label={(open ? "Hide " : "Show ") + variant.id} onToggle={() => undefined} />;

        return (
            <div
                key={[variant.id, hue, ground, state].join("|")}
                className={"library-sample library-ground-" + ground}
                data-sample=""
                data-variant={variant.id}
                data-hue={hue}
                data-ground={ground}
                data-state={state}
                style={{ "--strategy-theme-hue": hue } as CSSProperties}
            >
                {variant.context === "field-label"
                    ? <span className="field-label">{arrow}Responsibilities</span>
                    : (
                        <div className="card-title-row">
                            <h3 className="answer-column-label">
                                <span className="answer-column-label-number">1.</span>
                                <span className="answer-column-label-text">Infrastructure &amp; Capability</span>
                            </h3>
                            {arrow}
                        </div>
                    )}
            </div>
        );

    };

    return (
        <>
            {asset.variants.map(variant => (
                <div key={variant.id} className="library-variant">
                    <h3>{variant.id}: {variant.fontSizePx}px</h3>
                    <p>{variant.note}</p>
                    <div className="library-grid">
                        {PALETTE.flatMap(colour => GROUNDS.flatMap(ground => SHOWN.map(state => sample(variant, colour.hue, ground, state.id, state.open))))}
                    </div>
                </div>
            ))}
        </>
    );

}

export default function Library() {

    return (
        <main className="library-page">
            <h1>Library</h1>
            <p>Development only. Each asset is drawn from its contract (src/library); scripts/library/run.mjs measures it.</p>
            {assets.map(asset => (
                <section key={asset.name} className="library-asset" data-asset={asset.name}>
                    <h2>{asset.name}</h2>
                    <p>{asset.summary}</p>
                    {asset.name === "Label arrow" && <LabelArrowSamples asset={asset} />}
                </section>
            ))}
        </main>
    );

}
