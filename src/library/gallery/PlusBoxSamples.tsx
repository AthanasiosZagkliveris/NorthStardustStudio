import "../../styles/section-tiles.css";
import { PALETTE } from "../../framework/engine/Palette";
import type { AssetContract, AssetVariant } from "../contract";
import Sample, { GROUNDS } from "./Sample";

const SHOWN = [{ id: "rest", disabled: false }, { id: "disabled", disabled: true }] as const;

export default function PlusBoxSamples({ asset }: { asset: AssetContract }) {

    const sample = (variant: AssetVariant, hue: number, ground: string, state: string, disabled: boolean) => (
        <Sample
            key={[variant.id, hue, ground, state].join("|")}
            variant={variant.id}
            hue={hue}
            ground={ground}
            state={state}
            className={variant.id === "tile" ? "library-plus-tile" : "library-plus-inline"}
        >
            <button
                type="button"
                className={"plus-box " + (variant.id === "tile" ? "section-tile-plus" : "plus-box-small")}
                aria-label={"Add Item to " + variant.id}
                disabled={disabled}
            />
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
