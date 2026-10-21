import "../../styles/remove-button.css";

import { PALETTE } from "../../framework/engine/Palette";
import type { AssetContract, AssetVariant } from "../contract";
import Sample, { GROUNDS } from "./Sample";

const SHOWN = [{ id: "rest", disabled: false }, { id: "disabled", disabled: true }] as const;

export default function RemoveXSamples({ asset }: { asset: AssetContract }) {

    const sample = (variant: AssetVariant, hue: number, ground: string, state: string, disabled: boolean) => (
        <Sample key={[variant.id, hue, ground, state].join("|")} variant={variant.id} hue={hue} ground={ground} state={state}>
            <button
                type="button"
                className={"strategy-box-remove" + (variant.id === "card" ? " card-remove" : "")}
                aria-label={"Remove item (" + variant.id + ")"}
                title={"Remove item (" + variant.id + ")"}
                disabled={disabled}
            >
                ×
            </button>
        </Sample>
    );

    return (
        <>
            {asset.variants.map(variant => (
                <div key={variant.id} className="library-variant">
                    <h3>{variant.id}</h3>
                    <p>{variant.note}</p>
                    <div className="library-grid">
                        {PALETTE.flatMap(colour => GROUNDS.flatMap(ground => SHOWN.map(state => sample(variant, colour.hue, ground, state.id, state.disabled))))}
                    </div>
                </div>
            ))}
        </>
    );

}
