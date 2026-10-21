import BulletRail from "../../components/interview/rails/BulletRail";
import type { RailItem } from "../../components/interview/rails/railItems";
import type { AssetContract } from "../contract";
import Sample from "./Sample";

/** The Pages rail: the Introduction, then pages with their status shapes; the third is lit. */
const PAGES: RailItem[] = [
    { id: "introduction", label: "Introduction", capitals: true },
    { id: "definition", label: "1. Definition", status: "defined" },
    { id: "organization", label: "2. Organization", status: "in-progress" },
    { id: "brand", label: "3. Brand System", status: "not-started" }
];

/** The Sections rail: plain bullets; the first is lit. */
const SECTIONS: RailItem[] = [
    { id: "founders", label: "1. Founders" },
    { id: "responsibilities", label: "2. Responsibilities" },
    { id: "pay", label: "3. Pay" }
];

export default function RailsSamples({ asset }: { asset: AssetContract }) {

    return (
        <>
            {asset.variants.map(variant => {
                const left = variant.id === "pages-left";
                return (
                    <div key={variant.id} className="library-variant">
                        <h3>{variant.id}</h3>
                        <p>{variant.note}</p>
                        <div className="library-grid library-grid-rails">
                            <Sample variant={variant.id} hue={null} ground="page" state="rest" className="library-sample-rails">
                                <div className={"library-rail-stage " + (left ? "library-rail-left" : "library-rail-right")}>
                                    <BulletRail
                                        items={left ? PAGES : SECTIONS}
                                        activeId={left ? "organization" : "founders"}
                                        onSelect={() => undefined}
                                        side={left ? "left" : "right"}
                                        label={left ? "Pages" : "Sections"}
                                    />
                                </div>
                            </Sample>
                        </div>
                    </div>
                );
            })}
        </>
    );

}
