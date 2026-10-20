import FoldArrow from "../../components/interview/fields/FoldArrow";
import { PALETTE } from "../../framework/engine/Palette";
import type { AssetContract } from "../contract";
import Sample, { GROUNDS } from "./Sample";

const SHOWN = [{ id: "closed", open: false }, { id: "open", open: true }] as const;

export default function FoldArrowSamples({ asset }: { asset: AssetContract }) {

    return (
        <>
            {asset.variants.map(variant => (
                <div key={variant.id} className="library-variant">
                    <h3>{variant.id}</h3>
                    <p>{variant.note}</p>
                    <div className="library-grid">
                        {PALETTE.flatMap(colour => GROUNDS.flatMap(ground => SHOWN.map(state => (
                            <Sample key={[variant.id, colour.hue, ground, state.id].join("|")} variant={variant.id} hue={colour.hue} ground={ground} state={state.id}>
                                <FoldArrow open={state.open} label="the section" onToggle={() => undefined} />
                            </Sample>
                        ))))}
                    </div>
                </div>
            ))}
        </>
    );

}
