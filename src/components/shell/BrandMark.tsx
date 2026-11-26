// THE ORGANISATION'S OWN MARK IN THE HEADER (owner, 2026-11-24 03:14 UTC+2: "If the user has added his logo icon (square) in the brand system, it can be placed as
// an indicator at the other side of the header, where is the workbook, and move the buttons accordingly"): the Brand System's icon (the logo where no icon is
// given), at the header's right end, shown only where its picture is square and only on a phone in landscape (app-header.css). Loaded after the page is drawn
// (AppHeader's lazy import): it reads the Brand System's saved answers.
import { useMemo, useState } from "react";
import { systems } from "../../data/systems";
import { StorageService } from "../../services/StorageService";
import { AnswerType } from "../../framework/enums/AnswerType";
import { asBrandInventoryValue, asBrandStyleValue, brandMarkFile } from "../../framework/engine/answers/AnswerBrand";

const BRAND = systems.find(system => system.id === "brand");

/** The Brand System's icon, else its logo, as a picture's address; null where neither is given. */
function brandMarkOf(organizationId: string): string | null {
    if (!BRAND) {
        return null;
    }
    const session = StorageService.loadInterview(organizationId, BRAND.number);
    const section = session?.getFramework().sections.find(candidate => candidate.answer?.type === AnswerType.BrandStyle);
    const value = section && session ? session.getResponse(section.number) : undefined;
    const inventory = asBrandInventoryValue(asBrandStyleValue(value).inventory);
    return (brandMarkFile(inventory.icon) ?? brandMarkFile(inventory.logo))?.dataUrl ?? null;
}

export default function BrandMark({ organizationId, organizationName }: { organizationId: string; organizationName: string }) {

    const src = useMemo(() => brandMarkOf(organizationId), [organizationId]);
    // (Square: its sides within a tenth of each other, measured once the picture is loaded.)
    const [square, setSquare] = useState(false);

    if (!src) {
        return null;
    }

    return (
        <img
            className="app-brand-mark"
            src={src}
            alt={organizationName}
            title={organizationName}
            data-square={square ? "" : undefined}
            onLoad={(event) => {
                const { naturalWidth: width, naturalHeight: height } = event.currentTarget;
                setSquare(width > 0 && height > 0 && Math.abs(width - height) <= 0.1 * Math.max(width, height));
            }}
        />
    );

}
