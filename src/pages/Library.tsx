import { galleries } from "../library/gallery";
import { assets } from "../library";
import "../styles/library.css";

/**
 * THE LIBRARY GALLERY (development only; App.tsx mounts /library only in
 * `npm run dev`). Draws every asset that has a contract, in each of its
 * variants, states, palette hues and grounds, from the contract itself.
 * scripts/library/run.mjs opens it in each reading mode and window size
 * and measures what the contract says. Nothing here is part of the app.
 */
export default function Library() {

    return (
        <main className="library-page">
            <h1>Library</h1>
            <p>Development only. Each asset is drawn from its contract (src/library); scripts/library/run.mjs measures it.</p>
            {assets.map(asset => {
                const Samples = galleries[asset.name];
                return (
                    <section key={asset.name} className="library-asset" data-asset={asset.name}>
                        <h2>{asset.name}</h2>
                        <p>{asset.summary}</p>
                        {Samples && <Samples asset={asset} />}
                    </section>
                );
            })}
        </main>
    );

}
