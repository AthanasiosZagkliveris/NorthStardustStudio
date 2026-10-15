// First, so that the stylesheets load in the order the app's own interview page loads them (the cascade depends on it).
import "./Conversation";

import { useEffect, useState } from "react";

import { library } from "../library/data/library.ts";
import { CardBuild, FieldBuild } from "../library/inventory/builders.tsx";
import { part } from "../library/inventory/parts.tsx";
import type { Asset } from "../library/model/types.ts";
import "../styles/library.css";

const MODES = ["light", "dark", "sepia"] as const;
const CATEGORIES = ["component", "tile", "frame", "card", "field"] as const;

function Variables({ asset }: { asset: Asset }) {
    const named = asset.variables.map(code => library.variables.find(v => v.code === code)).filter(Boolean);
    return (
        <details className="inventory-variables">
            <summary>{named.length} variables</summary>
            <ul>{named.map(v => <li key={v!.code}><strong>{v!.code} {v!.name}</strong>: {v!.description} ({v!.values.map(x => x.name).join(", ")})</li>)}</ul>
        </details>
    );
}

function Built({ asset }: { asset: Asset }) {
    if (asset.category === "field") {
        return (
            <>
                <FieldBuild asset={asset} />
                {asset.variants.map(variant => (
                    <div key={variant.code} className="inventory-variant" data-variant={variant.code}>
                        <h4>{variant.code} {variant.name}</h4>
                        <p>{variant.edits}</p>
                        {part(asset.code, variant.code)}
                    </div>
                ))}
            </>
        );
    }
    if (asset.category === "card") {
        return (
            <>
                <CardBuild asset={asset} />
                {asset.variants.map(variant => (
                    <div key={variant.code} className="inventory-variant">
                        <h4>{variant.code} {variant.name}</h4>
                        <p>{variant.edits}</p>
                        {asset.code !== "CRD.001" && <CardBuild asset={asset} extra={variant.requires} />}
                    </div>
                ))}
            </>
        );
    }
    return (
        <>
            {part(asset.code)}
            {asset.variants.map(variant => (
                <div key={variant.code} className="inventory-variant" data-variant={variant.code}>
                    <h4>{variant.code} {variant.name}</h4>
                    <p>{variant.edits}</p>
                    {part(asset.code, variant.code)}
                </div>
            ))}
        </>
    );
}

/**
 * THE INVENTORY (development only, /library/inventory): every asset of the library built from its
 * parts (docs/design/08-library-system.md). Components are drawn from the app's own components and
 * classes, fields from components, cards from fields, tiles and frames from their parts. The three
 * reading modes can be switched above.
 */
export default function Inventory() {
    const [mode, setMode] = useState<(typeof MODES)[number]>("light");
    useEffect(() => {
        const root = document.documentElement;
        const before = root.getAttribute("data-theme");
        root.setAttribute("data-theme", mode);
        return () => { if (before) root.setAttribute("data-theme", before); else root.removeAttribute("data-theme"); };
    }, [mode]);

    return (
        <main className="library-page inventory-page">
            <h1>Inventory</h1>
            <p>{library.assets.length} assets built from the library. Development only.</p>
            <p>
                {MODES.map(m => <button key={m} type="button" className="inventory-mode" aria-pressed={mode === m} onClick={() => setMode(m)}>{m}</button>)}
            </p>
            {CATEGORIES.map(category => (
                <section key={category} className="library-asset" data-category={category}>
                    <h2>{category[0].toUpperCase() + category.slice(1)} assets</h2>
                    {library.assets.filter(a => a.category === category).map(asset => (
                        <article key={asset.code} className="inventory-asset" data-asset={asset.code}>
                            <h3>{asset.code} {asset.name}</h3>
                            <p>{asset.summary}</p>
                            <Variables asset={asset} />
                            <Built asset={asset} />
                        </article>
                    ))}
                </section>
            ))}
        </main>
    );
}
