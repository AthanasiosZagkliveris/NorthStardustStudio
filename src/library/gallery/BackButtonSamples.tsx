import { PALETTE } from "../../framework/engine/Palette";
import type { AssetContract, AssetVariant } from "../contract";
import Sample, { GROUNDS } from "./Sample";

export default function BackButtonSamples({ asset }: { asset: AssetContract }) {

    const sample = (variant: AssetVariant, hue: number, ground: string) => (
        <Sample key={[variant.id, hue, ground].join("|")} variant={variant.id} hue={hue} ground={ground} state="rest">
            {variant.id === "foot"
                ? (
                    <div className="section-tile-dialog-foot">
                        <button type="button" className="section-tile-back" onClick={() => undefined}>
                            <span className="back-arrow" aria-hidden="true" />
                            {" Back"}
                        </button>
                    </div>
                )
                : (
                    /* The rail tab as the dialog draws it (CarouselArrows, SectionTiles.tsx): the tab's colours stand for the card's frame colours. */
                    <nav className="carousel-rail carousel-rail-named carousel-rail-tab library-tab" aria-label="Go to a section">
                        <ol className="bullet-rail-list">
                            <li>
                                <button type="button" className="bullet-rail-item active" aria-current="true" aria-label="Section">
                                    <span className="bullet-rail-dot status-shape" aria-hidden="true" />
                                    <span className="strategy-card-nav-tip" aria-hidden="true">Section</span>
                                </button>
                            </li>
                        </ol>
                        <button type="button" className="carousel-rail-back" onClick={() => undefined} aria-label="Back" title="Back">
                            <span className="back-arrow" aria-hidden="true" />
                            <span className="carousel-rail-back-word">Back</span>
                        </button>
                    </nav>
                )}
        </Sample>
    );

    return (
        <>
            {asset.variants.map(variant => (
                <div key={variant.id} className="library-variant">
                    <h3>{variant.id}</h3>
                    <p>{variant.note}</p>
                    <div className="library-grid">
                        {PALETTE.flatMap(colour => GROUNDS.map(ground => sample(variant, colour.hue, ground)))}
                    </div>
                </div>
            ))}
        </>
    );

}
