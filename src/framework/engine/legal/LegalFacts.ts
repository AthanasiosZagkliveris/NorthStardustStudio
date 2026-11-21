import { schemeKeyOf } from "../ActivityClassification.ts";

/*
    THE FACTS THE LAW TURNS ON, READ FROM WHAT IS ALREADY ANSWERED (doc 53, stage 4; owner, 2026-11-19 20:59 UTC+2: "Build only the necessary questions that their
    information cannot be extracted by the existing answers. The questions should be placed to the related section."). The activity code settles most of them:
    what a product is (food, toys, electrical, cosmetics), whether music is part of the business, whether the work is a regulated profession, whether it keeps
    people's details beyond its own staff, marketing and accounts. A question is asked only where the code does not settle it (LegalFacts' `settled...`).
*/

/** The kinds of product a law turns on (O24's options; doc 53, LF6 merged with LF1). "none" stands alone. */
export const PRODUCT_KINDS = [
    { id: "food", label: "Food or drink" },
    { id: "toys", label: "Toys" },
    { id: "electrical", label: "Electrical or electronic" },
    { id: "cosmetics", label: "Cosmetics" },
    { id: "protective", label: "Protective equipment" },
    { id: "none", label: "None of these" }
] as const;

/** A code's digits, its dots and spaces left out ("13.92" and "1392" read alike). */
const digits = (code: string) => code.replace(/\D/g, "");

/** Whether a code starts with any of these prefixes. */
const starts = (code: string, prefixes: readonly string[]) => prefixes.some(prefix => digits(code).startsWith(prefix));

/** The prefixes, by the scheme family: the SIC / NACE / ISIC family shares its divisions; NAICS (US, CA); ANZSIC (AU, NZ). */
type Family = "sic" | "naics" | "anzsic";
const familyOf = (country: string): Family => {
    const scheme = schemeKeyOf(country);
    return scheme === "us" || scheme === "ca" ? "naics" : scheme === "au" || scheme === "nz" ? "anzsic" : "sic";
};

const PRODUCT_CODES: Readonly<Record<Family, Readonly<Record<string, readonly string[]>>>> = {
    // (SIC 2007 / NACE Rev. 2: 10 food, 11 beverages, 47.2 food retail, 56 food service; 32.40 games and toys; 26 computer and electronic, 27 electrical equipment;
    // 20.42 perfumes and toilet preparations.)
    sic: { food: ["10", "11", "472", "56"], toys: ["3240"], electrical: ["26", "27"], cosmetics: ["2042"] },
    // (NAICS 2022: 311 food, 312 beverage, 445 food and beverage retailers, 722 food services; 339930 dolls, toys and games; 334 computer and electronic, 335 electrical
    // equipment; 325620 toilet preparations.)
    naics: { food: ["311", "312", "445", "722"], toys: ["339930"], electrical: ["334", "335"], cosmetics: ["325620"] },
    // (ANZSIC 2006: 11 food product manufacturing, 12 beverage, 45 food and beverage services.)
    anzsic: { food: ["11", "12", "45"] }
};

/** What the activity code says the products are (O24's start); empty where it says nothing. */
export function productKindsFromCode(country: string, code: string): string[] {
    if (!code.trim()) {
        return [];
    }
    const table = PRODUCT_CODES[familyOf(country)];
    return Object.entries(table).filter(([, prefixes]) => starts(code, prefixes)).map(([kind]) => kind);
}

const MUSIC_CODES: Readonly<Record<Family, readonly string[]>> = {
    // (PPL PRS's sectors (pplprs.co.uk/themusiclicence), UK SIC the reference: 47 retail with premises, 55 accommodation, 56 food and drink, 90 arts, 93 sport and
    // recreation (93.13 gyms), 85.52 dance and cultural education, 96.02 hair and beauty, 82.3 events and trade shows, 49.3 taxis and land transport; NAICS 44 and
    // 45 retail, 721 accommodation, 722 food services, 711 performing arts, 713 recreation (713940 fitness), 611610 fine arts schools, 81211 hair, nail and skin
    // care, 56192 conventions and trade shows, 4853 taxis; ANZSIC 39 to 43 retail, 44 accommodation, 45 food and beverage, 90 creative arts, 91 sport and recreation.)
    sic: ["47", "55", "56", "90", "93", "8552", "9602", "823", "493"],
    naics: ["44", "45", "721", "722", "711", "713", "611610", "81211", "56192", "4853"],
    anzsic: ["39", "40", "41", "42", "43", "44", "45", "90", "91"]
};

/** Online-only retail, which plays no music to customers on premises: SIC 47.91, NAICS 4541. */
const MUSIC_EXCEPT: Readonly<Record<Family, readonly string[]>> = { sic: ["4791"], naics: ["4541"], anzsic: [] };

/** Whether the activity code says music, radio or TV is played where people come (the music licence suggested directly, no question); null where it says nothing. */
export function musicFromCode(country: string, code: string): boolean | null {
    const family = familyOf(country);
    return code.trim() && starts(code, MUSIC_CODES[family]) && !starts(code, MUSIC_EXCEPT[family]) ? true : null;
}

const PROFESSION_CODES: Readonly<Record<Family, readonly string[]>> = {
    // (SIC 69 legal and accounting, 71.11 architecture, 86 human health, 66.19 financial advice; NAICS 5411 legal, 5412 accounting, 54131 architects, 621 ambulatory
    // health care, 52393 investment advice; ANZSIC 69 professional services, 84 and 85 health care.)
    sic: ["69", "7111", "86", "6619"], naics: ["5411", "5412", "54131", "621", "52393"], anzsic: ["693", "692", "84", "85"]
};

/** Whether the work is a regulated profession, by the activity code; null where there is no code (then Definition asks). */
export function professionFromCode(country: string, code: string): boolean | null {
    if (!code.trim()) {
        return null;
    }
    return starts(code, PROFESSION_CODES[familyOf(country)]);
}

const PERSONAL_DATA_CODES: Readonly<Record<Family, readonly string[]>> = {
    // (Activities that keep people's details for more than staff, own marketing and accounts: SIC 86 health, 88 social work and childcare, 64 to 66 finance, 69.1 legal,
    // 78 employment, 62 and 63 IT and data; NAICS 62 health and social assistance, 52 finance, 5411 legal, 5613 employment, 518 and 5415 data and IT.)
    sic: ["86", "88", "64", "65", "66", "691", "78", "62", "63"], naics: ["62", "52", "5411", "5613", "518", "5415"], anzsic: ["84", "85", "86", "62", "63", "64", "72", "70"]
};

/** Whether the activity code settles the personal-details question: "other" (the ICO fee needed) where it does; null where it does not (Definition asks, GB only). */
export function personalDataFromCode(country: string, code: string): "other" | null {
    return code.trim() && starts(code, PERSONAL_DATA_CODES[familyOf(country)]) ? "other" : null;
}

/** The legal forms that are a company (HSE40: the close relatives' exemption does not apply to a business incorporated as a limited company). */
export const COMPANY_FORM = /Limited by Shares|Limited by Guarantee|Community Interest Company|\(LLP\)|\(LTD\)|\(DAC\)|\(CLG\)|Pty Ltd|Limited Company|Corporation|\(LLC\)/;
