/**
 * Split out of AnswerBusinessCapability.ts (2026-11-11, the folder report's item 6); that file re-exports what is exported here.
 */
import { type BusinessCategoryValue } from "./types.ts";

/** The two types of card in Partners & Suppliers; each type's groups (BUSINESS_PARTNER_GROUPS) play the part of categories. */
export const PARTNER_CATEGORIES = [
    { id: "partners", label: "Partners" },
    { id: "suppliers", label: "Suppliers" }
] as const;

/** The groups of each type, by place: fixed lists (21 groups in Infrastructure with the resources', 26 in the Offering with theirs). */
export const BUSINESS_PARTNER_GROUPS: Record<"infrastructure" | "offering", Record<"partners" | "suppliers", readonly { id: string; label: string; help: string }[]>> = {
    infrastructure: {
        partners: [
            { id: "alliances-networks", label: "Alliances & Networks", help: "Organisations you join for the benefit of the whole company, e.g. Trade association, Buying group, Start-up accelerator, Producers cooperative." }
        ],
        suppliers: [
            { id: "goods-equipment", label: "Goods & Equipment", help: "Sellers of furniture, devices and consumables for the company, e.g. Furniture dealer, Stationery merchant, Computer reseller, Water-cooler rental." },
            { id: "business-services", label: "Business Services", help: "Firms that run the administrative side, e.g. Accountant, Lawyer, Insurance broker, Payroll bureau, Business bank, Web host." },
            { id: "creative-it-services", label: "Creative & IT Services", help: "Freelancers and small agencies for design, branding, content or technology work, e.g. Web builder, Brand identity house, Photographer, IT support, Copywriter." },
            { id: "property-vehicles-facilities", label: "Property, Vehicles & Facilities", help: "Owners and caretakers of the premises, and lessors of vehicles, e.g. Landlord, Coworking operator, Cleaner, Car lessor." },
            { id: "technical-support", label: "Technical Support", help: "Outsourced technicians who maintain, repair and install the company's assets, e.g. Electrical engineer, Plumber, Boiler fitter, Network cabling. An installation is linked to the asset it installs." }
        ]
    },
    offering: {
        partners: [
            { id: "revenue-partners", label: "Revenue Partners", help: "Parties who sell for you or send customers, and take a cut of each sale, e.g. Boutique stockist, Distributor, Referral partner, Affiliate blogger, Co-teacher." },
            { id: "accreditation-bodies", label: "Accreditation Bodies", help: "Bodies whose approval gives your work credibility, e.g. Weavers' guild, Craft standards panel, Culinary institute." }
        ],
        suppliers: [
            { id: "producers-wholesalers", label: "Producers & Wholesalers", help: "Producers and wholesalers that sell the materials and parts in the product, e.g. Wool mill, Box maker, Fabric importer, Flour miller." },
            { id: "logistics-fulfilment", label: "Logistics & Fulfilment", help: "Carriers and warehouses that deliver orders to buyers, e.g. Courier, National post, Fulfilment centre, Freight forwarder." },
            { id: "contractors-advisers", label: "Contractors & Advisers", help: "Outsourced specialists who do part of an offering's job or guide it, e.g. Dye works, Freelance developer, Product-safety adviser, Electrician." },
            { id: "agencies-influencers", label: "Agencies & Influencers", help: "Firms and creators paid to spread the word, e.g. Marketing agency, Instagram creator, Poster press, Podcast sponsor." },
            { id: "venues-organisers", label: "Venues & Organisers", help: "Hosts of the places and events where you sell, e.g. Fair organiser, Exhibition hall, Show promoter." },
            { id: "landlords-leasing-warehouses", label: "Landlords, Leasing & Warehouses", help: "Owners of premises used for making or storing stock, and lessors of vehicles, e.g. Estate owner, Depot firm, Chilled-storage outfit, Van leasing specialist." },
            { id: "platforms-payments", label: "Platforms & Payments", help: "Intermediaries between you and the customer who charge a fee, e.g. Online marketplace, Payment processor, App store, Reservation portal." }
        ]
    }
};

/** The help text of Founders & Owners, the first group of Human Resources in Infrastructure (the Founders tile): the help-texts document's own. */
export const FOUNDERS_OWNERS_HELP = "Owners who work in the company and draw pay from it, e.g. Founder salary, Part-time director fee.";

/**
 * THE HELP OF A CATEGORY, as the help-texts document shows it: the text of its one group, or one line for each of its groups ("Company Vehicles: cars and
 * bikes the company owns ..."), the group's name first and its text after it in lower case.
 */
export function groupHelpLines(groups: readonly { label: string; help: string }[]): string[] {
    const usable = groups.filter(group => group.help.length > 0);
    return usable.length === 1 ? [usable[0].help] : usable.map(group => group.label + ": " + group.help.charAt(0).toLowerCase() + group.help.slice(1));
}

/** The same as points of an "i": one group is its text; several are each a bold name and its text (as the Status's "i" lists its options). */
export function groupHelpPoints(groups: readonly { label: string; help: string }[]): (string | { title: string; text: string })[] {
    const usable = groups.filter(group => group.help.length > 0);
    return usable.length === 1 ? [usable[0].help] : usable.map(group => ({ title: group.label, text: group.help }));
}

/** The help text ("i") of a partner or supplier group, "" for none (no group, or an older answer's). */
export function partnerGroupHelp(place: "infrastructure" | "offering", type: string | undefined, group: string): string {
    return type === "partners" || type === "suppliers" ? BUSINESS_PARTNER_GROUPS[place][type].find(entry => entry.id === group)?.help ?? "" : "";
}

/** Where an older answer's Partners and Suppliers are filed: both are Suppliers, the first in the group that holds advisers and services. */
export const LEGACY_PARTNER_GROUP: Record<"infrastructure" | "offering", string> = { infrastructure: "business-services", offering: "contractors-advisers" };

/** A category's name: a built-in's label, else the name the user typed ("" while he has not typed it yet). */
export function partnerCategoryLabel(categories: readonly BusinessCategoryValue[], id: string): string {
    return PARTNER_CATEGORIES.find(entry => entry.id === id)?.label ?? categories.find(entry => entry.id === id)?.name.trim() ?? "";
}

/** What a card of this category is called in a link ("Open Partner", "Open Supplier"): a Supplier only in the Suppliers type. */
export const partnerNoun = (category: string): "Partner" | "Supplier" => category === "suppliers" ? "Supplier" : "Partner";

/** Which of the two stored lists a card counts as (for the Financial Foundation's expense natures): by its category, else by the list it is stored in. */
export function partnerKindOf(partner: { category: string }, stored: "professionals" | "providers"): "professionals" | "providers" {
    return partner.category === "suppliers" ? "providers" : partner.category === "partners" ? "professionals" : stored;
}
