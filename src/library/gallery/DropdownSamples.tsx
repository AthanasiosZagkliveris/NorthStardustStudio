import { useState } from "react";

import OptionPicker from "../../components/interview/fields/OptionPicker";
import { PALETTE } from "../../framework/engine/Palette";
import type { AssetContract } from "../contract";
import Sample, { GROUNDS } from "./Sample";

/** What each variant draws: its options and how the picker is asked to size itself. */
const SPECS: Record<string, { options: string[]; hug?: boolean; disabled?: boolean }> = {
    "step-s": { options: ["Yes", "No", "Not sure"] },
    "step-m": { options: ["No tax at business level", "Corporate tax", "Pass-through"] },
    "step-l": { options: ["Private Company Limited by Shares", "Limited Liability Partnership"] },
    "hug": { options: ["Annually", "Monthly", "Quarterly"], hug: true },
    "disabled": { options: ["Yes", "No"], disabled: true }
};

function Picker({ variant }: { variant: string }) {
    const spec = SPECS[variant];
    const [value, setValue] = useState(spec.options[0]);
    // In a page-3 card's field, where the app draws it: the field's rules give the trigger its box (the picker's class alone leaves it unstyled).
    return (
        <div className="business-foundation answer-columns business-capability library-page-3">
            <div className="business-foundation-card">
                <div className="business-foundation-field">
                    <OptionPicker label={"Choice (" + variant + ")"} options={spec.options} value={value} onChange={setValue} hug={spec.hug} disabled={spec.disabled} />
                </div>
            </div>
        </div>
    );
}

export default function DropdownSamples({ asset }: { asset: AssetContract }) {

    return (
        <>
            {asset.variants.map(variant => (
                <div key={variant.id} className="library-variant">
                    <h3>{variant.id}</h3>
                    <p>{variant.note}</p>
                    <div className="library-grid">
                        {PALETTE.flatMap(colour => GROUNDS.map(ground => (
                            <Sample key={[variant.id, colour.hue, ground].join("|")} variant={variant.id} hue={colour.hue} ground={ground} state="rest" className="library-dropdown">
                                <Picker variant={variant.id} />
                            </Sample>
                        )))}
                    </div>
                </div>
            ))}
        </>
    );

}
