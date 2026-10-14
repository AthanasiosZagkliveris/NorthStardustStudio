import "../../styles/conversation.css";
import "../../styles/section-tiles.css";
import "../../styles/page-3-edges.css";

import InfoNote, { InfoText } from "../../components/interview/InfoNote";
import { PALETTE } from "../../framework/engine/Palette";
import type { AssetContract, AssetVariant } from "../contract";
import Sample, { GROUNDS } from "./Sample";

/** A label with its "i" glued to the last word, on one line, as the pages draw it. */
function Label({ variant }: { variant: AssetVariant }) {

    const line = (
        <div className="library-label-line">
            <span className="field-label">
                <InfoText text="Legal form of the organisation">
                    <InfoNote label={"Legal form (" + variant.id + ")"} points={["A short note, as a sentence."]} />
                </InfoText>
            </span>
        </div>
    );

    return variant.id === "page-3" ? <div className="answer-columns business-capability library-page-3">{line}</div> : line;

}

export default function InfoNoteSamples({ asset }: { asset: AssetContract }) {

    return (
        <>
            {asset.variants.map(variant => (
                <div key={variant.id} className="library-variant">
                    <h3>{variant.id}</h3>
                    <p>{variant.note}</p>
                    <div className="library-grid">
                        {(variant.id === "plain" ? [null] : PALETTE.map(colour => colour.hue)).flatMap(hue =>
                            (variant.id === "plain" ? ["page"] : GROUNDS).map(ground => (
                                <Sample key={[variant.id, hue, ground].join("|")} variant={variant.id} hue={hue} ground={ground} state="rest">
                                    <Label variant={variant} />
                                </Sample>
                            ))
                        )}
                    </div>
                </div>
            ))}
        </>
    );

}
