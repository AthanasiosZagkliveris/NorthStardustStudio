import LabelArrow from "../../components/interview/fields/LabelArrow";
import { PALETTE } from "../../framework/engine/Palette";
import type { AssetContract, AssetVariant } from "../contract";
import Sample, { GROUNDS } from "./Sample";

const SHOWN = [{ id: "closed", open: false }, { id: "open", open: true }] as const;

export default function LabelArrowSamples({ asset }: { asset: AssetContract }) {

    const sample = (variant: AssetVariant, hue: number, ground: string, state: string, open: boolean) => {

        const arrow = <LabelArrow open={open} label={(open ? "Hide " : "Show ") + variant.id} onToggle={() => undefined} />;

        return (
            <Sample key={[variant.id, hue, ground, state].join("|")} variant={variant.id} hue={hue} ground={ground} state={state}>
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
            </Sample>
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
