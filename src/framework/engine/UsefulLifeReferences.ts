import { SOURCES, type Source } from "./Sources.ts";

/**
 * WHAT A USEFUL LIFE IS, AND WHERE THE DEFAULTS COME FROM (Global Settings > Assets > Default useful life).
 *
 * The useful life of an asset is the number of years it is expected to serve the business before it is worn out, outdated or replaced. The cost is spread over
 * those years (straight line) instead of being counted all in the year it is bought.
 *
 * The figures are the Texas state asset schedule (Texas DFPS, Asset Management Handbook, Appendix B, in months there, years here), read on 2026-10-10. Only what
 * the schedule lists is shown. A group's default is the figure its main items share, or the middle of them; it is edited here, and on a card.
 */

export const USEFUL_LIFE_MEANING: readonly { title: string; text: string }[] = [
    { title: "What it is", text: "The years an asset serves the business before it is worn out, outdated or replaced." },
    { title: "What it does", text: "The cost (CapEx) is spread over those years instead of being counted in the year of purchase." }
];

export const USEFUL_LIFE_SOURCES: readonly Source[] = [SOURCES.texasAssetClasses];

/** One item of an asset group and its useful life in years, as the schedule gives it. */
export interface UsefulLifeItem {
    item: string;
    years: string;
}

/** The popular items of each asset group (USEFUL_LIFE_GROUPS) with their individual useful lives. */
export const USEFUL_LIFE_ITEMS: Record<string, readonly UsefulLifeItem[]> = {
    "furniture-fittings": [
        { item: "Desks, Chairs & Tables", years: "10" },
        { item: "Cabinets & Credenzas", years: "10" },
        { item: "Shelving & Racks", years: "10" }
    ],
    "devices-tools": [
        { item: "Computers", years: "6" },
        { item: "Servers", years: "6" },
        { item: "Monitors", years: "6" },
        { item: "Printers", years: "7" },
        { item: "Tools", years: "7" },
        { item: "Barcode Scanners", years: "6" },
        { item: "Image Scanners", years: "3" },
        { item: "Docking Stations", years: "3" }
    ],
    "company-vehicles": [
        { item: "Cars", years: "5" },
        { item: "Motorcycles", years: "5" },
        { item: "SUVs", years: "7" },
        { item: "Light Trucks", years: "7" },
        { item: "Vans", years: "7" },
        { item: "Minibuses", years: "8" }
    ],
    "fixtures-displays": [
        { item: "Display Cases & Cabinets", years: "10" },
        { item: "Shelving & Racks", years: "10" },
        { item: "Tables", years: "10" },
        { item: "Scales", years: "15" }
    ],
    "production-machinery": [
        { item: "Drills, Saws & Lathes", years: "15" },
        { item: "Woodworking Machines", years: "15" },
        { item: "Conveyors", years: "15" },
        { item: "Pallet Trucks & Lifts", years: "15" },
        { item: "Warehouse Forklifts", years: "12" },
        { item: "Kitchen Equipment", years: "7" },
        { item: "Laundry Equipment", years: "7" },
        { item: "Other Machines", years: "7" }
    ],
    "delivery-vehicles": [
        { item: "Vans", years: "7" },
        { item: "Light Trucks", years: "7" },
        { item: "Medium Trucks", years: "5" },
        { item: "Heavy Trucks", years: "10" },
        { item: "Trailers", years: "10" },
        { item: "Forklifts", years: "7" }
    ]
};

/** The note of one group: each item with its years. */
export function usefulLifePoints(groupId: string): { title: string; text: string }[] {
    return (USEFUL_LIFE_ITEMS[groupId] ?? []).map(entry => ({ title: entry.item, text: entry.years + " years" }));
}
