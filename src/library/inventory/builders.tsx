import type { ReactNode } from "react";

import { library } from "../data/library.ts";
import type { Asset, Requirement } from "../model/types.ts";
import { part } from "./parts.tsx";

const byCode = new Map(library.assets.map(a => [a.code, a]));
export const assetOf = (code: string): Asset => {
    const found = byCode.get(code);
    if (!found) throw new Error("no asset " + code);
    return found;
};

/** A field, built from the components its asset requires (a label, then the controls). */
export function FieldBuild({ asset }: { asset: Asset }) {
    return (
        <div className="business-foundation-field inventory-field" data-asset={asset.code}>
            {asset.requires.map((need, i) => <span key={i} className="inventory-field-part" data-part={need.variant ?? need.asset}>{part(need.asset, need.variant, need.asset.startsWith("LBL.") ? asset.name : need.variant === "TXT.RDO.001.004" ? "(shown, not edited)" : undefined)}</span>)}
        </div>
    );
}

/** A card, built from the floating card base, the name cell and x of its head, and its common fields. */
export function CardBuild({ asset, extra }: { asset: Asset; extra?: readonly Requirement[] }) {
    const needs = [...asset.requires, ...(extra ?? [])];
    const fields: ReactNode[] = needs.filter(n => n.asset.startsWith("FLD.")).map((n, i) => <FieldBuild key={i} asset={assetOf(n.asset)} />);
    return (
        <div className="business-foundation answer-columns business-capability library-page-3 inventory-card" data-asset={asset.code}>
            <div className="business-foundation-card">
                <div className="inventory-card-head">{part("TXT.NAM.001.003")}{part("BTN.DLT.001.001")}</div>
                {fields}
            </div>
        </div>
    );
}
