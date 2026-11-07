import { useState } from "react";

import RatingScale, { type Rating } from "../../components/controls/RatingScale";
import RatingScaleGroup from "../../components/controls/RatingScaleGroup";
import { PALETTE } from "../../framework/engine/Palette";
import type { AssetContract } from "../contract";
import Sample, { GROUNDS } from "./Sample";

const ROWS = [{ id: "price", label: "Lower price" }, { id: "speed", label: "Speed" }, { id: "quality", label: "Quality and results" }];

/** One sample, in a page-3 card's band as the app draws it (one column, or one of the Segment card's two). */
function Scale({ variant, columns, name }: { variant: string; columns: 1 | 2; name: string }) {
    const [one, setOne] = useState<Rating | undefined>(variant === "chosen and disabled" ? 4 : undefined);
    const [values, setValues] = useState<Partial<Record<string, Rating>>>(variant === "chosen and disabled" ? { price: 2, speed: 5 } : { speed: 4 });
    const [ticked, setTicked] = useState<string[]>(["speed"]);
    const body = variant === "vertical"
        ? (
            <>
                <p className="library-rating-question">How comfortable are your customers online?</p>
                <RatingScale label="Online comfort" name={name} value={one} onChange={setOne} lowLabel="Uneasy" highLabel="Confident" />
            </>
        )
        : (
            <RatingScaleGroup
                label="What customers value"
                name={name}
                rows={ROWS}
                values={values}
                onChange={(id, next) => setValues(current => ({ ...current, [id]: next }))}
                lowLabel="Weak"
                highLabel="Strong"
                selectable={variant === "selectable"}
                selected={ticked}
                onSelect={(id, on) => setTicked(current => on ? [...current, id] : current.filter(entry => entry !== id))}
                disabled={variant === "chosen and disabled"}
            />
        );
    return (
        <div className={"business-foundation answer-columns business-capability library-page-3 library-rating library-rating-" + columns}>
            <div className="business-foundation-card">
                {/* Two columns stand for the Segment card's: the sample shows one of them, half the card. */}
                <div className="legal-entity-org-section legal-entity-org-band">{body}</div>
            </div>
        </div>
    );
}

export default function RatingScaleSamples({ asset }: { asset: AssetContract }) {

    return (
        <>
            {asset.variants.map(variant => (
                <div key={variant.id} className="library-variant">
                    <h3>{variant.id}</h3>
                    <p>{variant.note}</p>
                    <div className="library-grid library-grid-rating">
                        {/* A single rating in a one-column card and in one of the Segment card's two columns; a group stands only in a one-column card (the Profile's, the Competitor's). */}
                        {PALETTE.slice(0, 2).flatMap(colour => GROUNDS.flatMap(ground => (variant.id === "vertical" ? [1, 2] as const : [1] as const).map(columns => (
                            <Sample key={[variant.id, colour.hue, ground, columns].join("|")} variant={variant.id} hue={colour.hue} ground={ground} state={variant.id === "chosen and disabled" ? "disabled" : "rest"}>
                                <Scale variant={variant.id} columns={columns} name={["rating", variant.id, colour.hue, ground, columns].join("-")} />
                            </Sample>
                        ))))}
                    </div>
                </div>
            ))}
        </>
    );

}
