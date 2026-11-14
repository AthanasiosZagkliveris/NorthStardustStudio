import "../../styles/remove-button.css";
import "../../styles/chip.css";

import { PALETTE } from "../../framework/engine/Palette";
import type { AssetContract } from "../contract";
import Sample, { GROUNDS } from "./Sample";

const SHOWN = [{ id: "rest", disabled: false }, { id: "disabled", disabled: true }] as const;

/** The in-cell x, as it stands: inside a 32px chip, at its right end. */
export default function CellRemoveXSamples({ asset }: { asset: AssetContract }) {
    return (
        <>
            {asset.variants.map(variant => (
                <div key={variant.id} className="library-variant">
                    <h3>{variant.id}</h3>
                    <p>{variant.note}</p>
                    <div className="library-grid">
                        {PALETTE.flatMap(colour => GROUNDS.flatMap(ground => SHOWN.map(state => (
                            <Sample key={[variant.id, colour.hue, ground, state.id].join("|")} variant={variant.id} hue={colour.hue} ground={ground} state={state.id}>
                                {variant.id === "action" ? (
                                    <div className="library-cell-x-line">
                                        <span>1. An action of a journey stage</span>
                                        <button type="button" className="cell-remove" aria-label="Remove action (sample)" disabled={state.disabled}>×</button>
                                    </div>
                                ) : (
                                <div className="business-channel-resource-action">
                                    <span className="notepad-chip">
                                        <button type="button" className="notepad-chip-open"><span className="notepad-chip-tag"><span className="notepad-chip-number">#12</span></span><span className="notepad-chip-description">An action</span></button>
                                        <button type="button" className="cell-remove" aria-label="Unlink action (sample)" disabled={state.disabled}>×</button>
                                    </span>
                                </div>
                                )}
                            </Sample>
                        )))) }
                    </div>
                </div>
            ))}
        </>
    );
}
