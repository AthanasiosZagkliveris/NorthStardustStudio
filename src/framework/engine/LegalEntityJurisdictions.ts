/**
 * What the Legal Entity page knows about where an organization is.
 *
 * The page adapts to the Country and Legal Form chosen at the top of
 * it: what the consumption tax is called, which legal forms are
 * offered, whether capital is asked about, and which legal
 * requirements are marked as commonly applying.
 *
 * HOW FAR THIS GOES, AND WHERE IT STOPS
 *
 * Every country in the world can be selected. Only the ones listed
 * in `JURISDICTIONS` below carry a profile; everything else falls
 * back to `NEUTRAL_PROFILE`, which asks the same questions in
 * wording that does not assume any particular legal system.
 *
 * That boundary is deliberate. A profile is a claim about a
 * country's company law, and a wrong one is worse than none: it
 * would hide a field someone needs, or name a tax they do not have,
 * with all the authority of the app saying so. The listed
 * jurisdictions are ones whose forms and consumption-tax naming are
 * stable and widely documented. The rest get a form that works
 * rather than a guess dressed as knowledge.
 *
 * Nothing here is binding on the user. Legal Form always accepts
 * free text alongside the list, capital is a switch the user
 * controls whatever the profile suggests, and every requirement type
 * stays available however it is marked. The profile changes what is
 * OFFERED and what is EMPHASISED, never what is possible.
 *
 * This is not legal advice, and it is not a substitute for asking
 * someone who knows the jurisdiction.
 */

/** A legal form as offered for one country. */
export interface LegalFormOption {

    /** Shown in the list, and stored as the answer. */
    label: string;

    /**
     * Whether founders in this form ordinarily contribute capital.
     * Drives only the DEFAULT of the page's capital switch -- the
     * user can turn it on or off regardless.
     */
    capital: boolean;

    /**
     * Set where the form has exactly ONE owner as a matter of law,
     * not as a matter of circumstance: every sole proprietorship,
     * and the single-member companies built for one person (EURL,
     * SASU, Sociedade Unipessoal, SLU, One Person Company, FZE).
     *
     * NOT set for a form that merely CAN have one owner. A German
     * UG or a UK Ltd is perfectly happy with a single shareholder
     * and equally happy with six, so neither is a claim this page
     * should make on the founder's behalf.
     */
    soleFounder?: boolean;

}

/** What the page knows about one country. */
export interface JurisdictionProfile {

    /**
     * What the consumption tax is called here, as the user would
     * recognise it. Used in the Tax subsection's own wording.
     */
    consumptionTax: string;

    /** The legal forms offered, in the order they are offered. */
    forms: LegalFormOption[];

    /**
     * Requirement types that commonly apply here, by the ids in
     * LEGAL_REQUIREMENT_TYPES. Marked in the picker as a starting
     * point; every other type stays selectable.
     */
    commonRequirements: string[];

    /**
     * Whether this jurisdiction ordinarily issues a business
     * activity classification code (NACE, SIC, NAICS, ...). When it
     * does, the page offers a field for it under Main Activity --
     * which the doc asks to be kept out of the way until it is
     * relevant.
     */
    activityCode?: string;

    /**
     * The body that registers an organization here, prefilled into
     * the Registration Authority field. A starting value, not a
     * list: the field stays plain text, so a founder who registered
     * federally rather than locally, or with a body this app has
     * not heard of, simply types over it.
     */
    registrationAuthority?: string;

    /**
     * What the tax number is called locally (AFM, UTR, EIN, ...).
     * Used only to LABEL the field -- the value itself is free text
     * whatever this says.
     */
    taxIdName?: string;

    /**
     * The shape a registration number takes here, shown as the
     * field's placeholder. Omitted where the format varies or is
     * not something to state with confidence: a wrong hint is
     * worse than none.
     */
    registrationNumberHint?: string;

    /** The shape of the tax identification number ("10 digits"), where it is certain: what can be typed in it follows (registrationNumberRule). */
    taxIdNumberHint?: string;

    /**
     * Set only for the countries where the state, province, canton
     * or emirate genuinely changes the answers -- which registry
     * you deal with, whether a consumption tax applies, and in one
     * case which legal forms exist. Everywhere else this is absent
     * and no such field is shown.
     */
    subdivision?: SubdivisionSpec;

    /**
     * What the postal code is called here: ZIP Code, Postcode,
     * Eircode, CAP. Absent for a country this app carries no
     * profile for, where the field is simply headed "Postal Code".
     */
    postalCodeName?: string;

    /**
     * Set where addresses carry no postal code at all, so the field
     * is not shown. The UAE is the case in this set: mail goes to a
     * PO box rather than to a coded address.
     */
    noPostalCode?: boolean;

    /**
     * Set where one number does both jobs: the registry and the tax
     * office issue and use the same identifier, so asking twice
     * asks the same person for the same thing.
     *
     * True of the Nordics (Organisationsnummer, CVR, Y-tunnus),
     * Belgium, Switzerland, Brazil, Singapore and Portugal.
     *
     * NOT set where the two are merely related. A French VAT number
     * is built from the SIREN and an Australian ABN embeds the ACN,
     * but neither is the same string as the other, and copying one
     * into the other would be wrong.
     */
    sameTaxAndRegistrationNumber?: boolean;

}

/** The sub-national question, for the four countries that need it. */
export interface SubdivisionSpec {

    /** What this level is called here: State, Canton, Emirate. */
    label: string;

    options: SubdivisionOption[];

}

interface SubdivisionOption {

    name: string;

    /**
     * The short code this place is known by, so someone can type
     * "CA" instead of scrolling to California. Absent where there
     * is no code in common use.
     */
    code?: string;

    /** Replaces the country's own registration authority. */
    authority?: string;

    /**
     * True where there is no consumption tax at this level. Five US
     * states levy no state sales tax; the page says so beside the
     * question rather than answering it, since a business can still
     * owe tax elsewhere.
     */
    noConsumptionTax?: boolean;

    /**
     * Replaces the country's legal form list. Only the UAE needs
     * this: a free zone company is a different set of forms from a
     * mainland one.
     */
    forms?: LegalFormOption[];

}

/**
 * The requirement types offered under Additional Legal
 * Requirements. Taken from the Legal Entity brief; the ids are
 * stored, the labels shown.
 */
export const LEGAL_REQUIREMENT_TYPES = [
    { id: "licence", label: "Licence / Permit" },
    { id: "professional", label: "Professional Registration" },
    { id: "additional", label: "Additional Registration" },
    { id: "officer", label: "Company Officer / Legal Role" },
    { id: "beneficial-owner", label: "Beneficial Ownership / Control" },
    { id: "other", label: "Other Legal Requirement" }
] as const;

/** How often a Legal Entity expense recurs. */
export const LEGAL_ENTITY_EXPENSE_FREQUENCIES = [
    "One time",
    "Monthly",
    "Annually"
] as const;

/**
 * Asked of a country with no profile. "Consumption tax" is the
 * neutral term the brief itself reaches for, and naming the common
 * variants beside it saves the user working out which one they are
 * being asked about.
 */
const NEUTRAL_PROFILE: JurisdictionProfile = {
    consumptionTax: "Consumption tax (VAT / GST / Sales Tax)",
    forms: [],
    commonRequirements: []
};

/** Common to most company forms wherever a UBO register exists. */
const EU_COMPANY_REQUIREMENTS = ["beneficial-owner", "officer"];

/**
 * The curated set. Keyed by ISO 3166-1 alpha-2, so the country list
 * and the profiles cannot drift apart.
 */
const JURISDICTIONS: Record<string, JurisdictionProfile> = {

    AT: {
        postalCodeName: "PLZ",
        registrationAuthority: "Firmenbuch (Commercial Register)",
        taxIdName: "Steuernummer",
        consumptionTax: "VAT (USt)",
        activityCode: "ÖNACE code",
        forms: [
            { label: "Einzelunternehmen (sole proprietorship)", capital: false, soleFounder: true },
            { label: "Offene Gesellschaft (OG)", capital: false },
            { label: "Kommanditgesellschaft (KG)", capital: true },
            { label: "Gesellschaft mit beschränkter Haftung (GmbH)", capital: true },
            { label: "Aktiengesellschaft (AG)", capital: true }
        ],
        commonRequirements: [...EU_COMPANY_REQUIREMENTS, "licence"]
    },

    AU: {
        postalCodeName: "Postcode",
        registrationAuthority: "Australian Securities and Investments Commission (ASIC)",
        taxIdName: "ABN",
        registrationNumberHint: "9 digits (ACN)",
        consumptionTax: "GST",
        activityCode: "ANZSIC code",
        forms: [
            { label: "Sole Trader", capital: false, soleFounder: true },
            { label: "Partnership", capital: false },
            { label: "Proprietary Limited Company (Pty Ltd)", capital: true },
            { label: "Public Company (Ltd)", capital: true },
            { label: "Trust", capital: false }
        ],
        commonRequirements: ["officer", "licence"]
    },

    BE: {
        sameTaxAndRegistrationNumber: true,
        postalCodeName: "Postal Code",
        registrationAuthority: "Crossroads Bank for Enterprises (KBO / BCE)",
        taxIdName: "Ondernemingsnummer / numero d'entreprise",
        registrationNumberHint: "10 digits",
        consumptionTax: "VAT (BTW / TVA)",
        activityCode: "NACEBEL code",
        forms: [
            { label: "Entreprise individuelle / Eenmanszaak", capital: false, soleFounder: true },
            { label: "Société à responsabilité limitée (SRL / BV)", capital: true },
            { label: "Société anonyme (SA / NV)", capital: true },
            { label: "Société coopérative (SC / CV)", capital: true }
        ],
        commonRequirements: EU_COMPANY_REQUIREMENTS
    },

    BR: {
        sameTaxAndRegistrationNumber: true,
        postalCodeName: "CEP",
        registrationAuthority: "Junta Comercial (state commercial registry)",
        taxIdName: "CNPJ",
        taxIdNumberHint: "14 digits",
        registrationNumberHint: "14 digits",
        consumptionTax: "Consumption taxes (ICMS / ISS / IPI)",
        activityCode: "CNAE code",
        forms: [
            { label: "Microempreendedor Individual (MEI)", capital: false, soleFounder: true },
            { label: "Empresário Individual", capital: false, soleFounder: true },
            { label: "Sociedade Limitada (Ltda)", capital: true },
            { label: "Sociedade Limitada Unipessoal (SLU)", capital: true, soleFounder: true },
            { label: "Sociedade Anônima (S.A.)", capital: true }
        ],
        commonRequirements: ["additional", "licence"]
    },

    CA: {
        postalCodeName: "Postal Code",
        subdivision: {
            label: "Province or Territory",
            options: [
                { name: "Federal (Corporations Canada)", authority: "Corporations Canada" },
                { name: "Alberta", code: "AB", authority: "Alberta Corporate Registry" },
                { name: "British Columbia", code: "BC", authority: "BC Registries and Online Services" },
                { name: "Manitoba", code: "MB", authority: "Manitoba Companies Office" },
                { name: "New Brunswick", code: "NB", authority: "Service New Brunswick Corporate Registry" },
                { name: "Newfoundland and Labrador", code: "NL", authority: "Registry of Companies" },
                { name: "Northwest Territories", code: "NT", authority: "Northwest Territories Corporate Registries" },
                { name: "Nova Scotia", code: "NS", authority: "Registry of Joint Stock Companies" },
                { name: "Nunavut", code: "NU", authority: "Nunavut Legal Registries" },
                { name: "Ontario", code: "ON", authority: "Ontario Business Registry" },
                { name: "Prince Edward Island", code: "PE", authority: "Prince Edward Island Corporate Registry" },
                { name: "Quebec", code: "QC", authority: "Registraire des entreprises du Quebec" },
                { name: "Saskatchewan", code: "SK", authority: "Information Services Corporation (ISC)" },
                { name: "Yukon", code: "YT", authority: "Yukon Corporate Affairs" }
            ]
        },
        registrationAuthority: "Corporations Canada",
        taxIdName: "Business Number (BN)",
        registrationNumberHint: "9 digits",
        consumptionTax: "GST / HST",
        activityCode: "NAICS code",
        forms: [
            { label: "Sole Proprietorship", capital: false, soleFounder: true },
            { label: "General Partnership", capital: false },
            { label: "Limited Partnership", capital: true },
            { label: "Corporation (federal)", capital: true },
            { label: "Corporation (provincial)", capital: true },
            { label: "Cooperative", capital: true }
        ],
        commonRequirements: ["officer", "licence"]
    },

    CH: {
        sameTaxAndRegistrationNumber: true,
        postalCodeName: "PLZ",
        subdivision: {
            label: "Canton",
            options: [
                { name: "Aargau", code: "AG", authority: "Handelsregisteramt Aargau" },
                { name: "Appenzell Ausserrhoden", code: "AR", authority: "Handelsregisteramt Appenzell Ausserrhoden" },
                { name: "Appenzell Innerrhoden", code: "AI", authority: "Handelsregisteramt Appenzell Innerrhoden" },
                { name: "Basel-Landschaft", code: "BL", authority: "Handelsregisteramt Basel-Landschaft" },
                { name: "Basel-Stadt", code: "BS", authority: "Handelsregisteramt Basel-Stadt" },
                { name: "Bern", code: "BE", authority: "Handelsregisteramt Bern" },
                { name: "Fribourg", code: "FR", authority: "Handelsregisteramt Fribourg" },
                { name: "Geneva", code: "GE", authority: "Handelsregisteramt Geneva" },
                { name: "Glarus", code: "GL", authority: "Handelsregisteramt Glarus" },
                { name: "Graubunden", code: "GR", authority: "Handelsregisteramt Graubunden" },
                { name: "Jura", code: "JU", authority: "Handelsregisteramt Jura" },
                { name: "Lucerne", code: "LU", authority: "Handelsregisteramt Lucerne" },
                { name: "Neuchatel", code: "NE", authority: "Handelsregisteramt Neuchatel" },
                { name: "Nidwalden", code: "NW", authority: "Handelsregisteramt Nidwalden" },
                { name: "Obwalden", code: "OW", authority: "Handelsregisteramt Obwalden" },
                { name: "Schaffhausen", code: "SH", authority: "Handelsregisteramt Schaffhausen" },
                { name: "Schwyz", code: "SZ", authority: "Handelsregisteramt Schwyz" },
                { name: "Solothurn", code: "SO", authority: "Handelsregisteramt Solothurn" },
                { name: "St. Gallen", code: "SG", authority: "Handelsregisteramt St. Gallen" },
                { name: "Thurgau", code: "TG", authority: "Handelsregisteramt Thurgau" },
                { name: "Ticino", code: "TI", authority: "Handelsregisteramt Ticino" },
                { name: "Uri", code: "UR", authority: "Handelsregisteramt Uri" },
                { name: "Valais", code: "VS", authority: "Handelsregisteramt Valais" },
                { name: "Vaud", code: "VD", authority: "Handelsregisteramt Vaud" },
                { name: "Zug", code: "ZG", authority: "Handelsregisteramt Zug" },
                { name: "Zurich", code: "ZH", authority: "Handelsregisteramt Zurich" }
            ]
        },
        registrationAuthority: "Handelsregisteramt (cantonal commercial register)",
        taxIdName: "UID",
        registrationNumberHint: "CHE-123.456.789",
        consumptionTax: "VAT (MWST / TVA)",
        activityCode: "NOGA code",
        forms: [
            { label: "Einzelfirma (sole proprietorship)", capital: false, soleFounder: true },
            { label: "Kollektivgesellschaft", capital: false },
            { label: "GmbH / Sàrl", capital: true },
            { label: "Aktiengesellschaft (AG / SA)", capital: true }
        ],
        commonRequirements: ["officer"]
    },

    DE: {
        postalCodeName: "PLZ",
        registrationAuthority: "Handelsregister (local Amtsgericht)",
        taxIdName: "Steuernummer",
        registrationNumberHint: "HRB 12345",
        consumptionTax: "VAT (Umsatzsteuer)",
        activityCode: "WZ code",
        forms: [
            { label: "Einzelunternehmen (sole proprietorship)", capital: false, soleFounder: true },
            { label: "Gesellschaft bürgerlichen Rechts (GbR)", capital: false },
            { label: "Offene Handelsgesellschaft (OHG)", capital: false },
            { label: "Kommanditgesellschaft (KG)", capital: true },
            { label: "Unternehmergesellschaft (UG, haftungsbeschränkt)", capital: true },
            { label: "Gesellschaft mit beschränkter Haftung (GmbH)", capital: true },
            { label: "Aktiengesellschaft (AG)", capital: true }
        ],
        commonRequirements: [...EU_COMPANY_REQUIREMENTS, "licence"]
    },

    DK: {
        sameTaxAndRegistrationNumber: true,
        postalCodeName: "Postnummer",
        registrationAuthority: "Erhvervsstyrelsen (Danish Business Authority)",
        taxIdName: "CVR number",
        registrationNumberHint: "8 digits",
        consumptionTax: "VAT (moms)",
        forms: [
            { label: "Enkeltmandsvirksomhed (sole proprietorship)", capital: false, soleFounder: true },
            { label: "Interessentskab (I/S)", capital: false },
            { label: "Anpartsselskab (ApS)", capital: true },
            { label: "Aktieselskab (A/S)", capital: true }
        ],
        commonRequirements: EU_COMPANY_REQUIREMENTS
    },

    ES: {
        postalCodeName: "Codigo Postal",
        registrationAuthority: "Registro Mercantil",
        taxIdName: "NIF",
        consumptionTax: "VAT (IVA)",
        activityCode: "CNAE code",
        forms: [
            { label: "Empresario individual (autónomo)", capital: false, soleFounder: true },
            { label: "Sociedad Civil", capital: false },
            { label: "Sociedad Limitada (S.L.)", capital: true },
            { label: "Sociedad Anónima (S.A.)", capital: true },
            { label: "Sociedad Cooperativa", capital: true }
        ],
        commonRequirements: [...EU_COMPANY_REQUIREMENTS, "licence"]
    },

    FI: {
        sameTaxAndRegistrationNumber: true,
        postalCodeName: "Postinumero",
        registrationAuthority: "Patentti- ja rekisterihallitus (PRH)",
        taxIdName: "Y-tunnus",
        registrationNumberHint: "1234567-8",
        consumptionTax: "VAT (ALV)",
        forms: [
            { label: "Toiminimi (sole proprietorship)", capital: false, soleFounder: true },
            { label: "Avoin yhtiö (general partnership)", capital: false },
            { label: "Kommandiittiyhtiö (limited partnership)", capital: true },
            { label: "Osakeyhtiö (Oy)", capital: true },
            { label: "Julkinen osakeyhtiö (Oyj)", capital: true }
        ],
        commonRequirements: EU_COMPANY_REQUIREMENTS
    },

    FR: {
        postalCodeName: "Code postal",
        registrationAuthority: "Greffe du Tribunal de Commerce (RCS)",
        taxIdName: "SIREN",
        registrationNumberHint: "9 digits (SIREN)",
        consumptionTax: "VAT (TVA)",
        activityCode: "Code APE / NAF",
        forms: [
            { label: "Entreprise individuelle / Micro-entreprise", capital: false, soleFounder: true },
            { label: "Entreprise unipersonnelle à responsabilité limitée (EURL)", capital: true, soleFounder: true },
            { label: "Société à responsabilité limitée (SARL)", capital: true },
            { label: "Société par actions simplifiée (SAS)", capital: true },
            { label: "Société par actions simplifiée unipersonnelle (SASU)", capital: true, soleFounder: true },
            { label: "Société anonyme (SA)", capital: true },
            { label: "Société en nom collectif (SNC)", capital: false }
        ],
        commonRequirements: [...EU_COMPANY_REQUIREMENTS, "licence"]
    },

    GR: {
        postalCodeName: "TK (Postal Code)",
        registrationAuthority: "GEMI (General Commercial Registry)",
        taxIdName: "AFM",
        consumptionTax: "VAT (ΦΠΑ)",
        activityCode: "ΚΑΔ code",
        forms: [
            { label: "Ατομική επιχείρηση (sole proprietorship)", capital: false, soleFounder: true },
            { label: "Ομόρρυθμη Εταιρεία (Ο.Ε.)", capital: false },
            { label: "Ετερόρρυθμη Εταιρεία (Ε.Ε.)", capital: true },
            { label: "Ιδιωτική Κεφαλαιουχική Εταιρεία (Ι.Κ.Ε.)", capital: true },
            { label: "Εταιρεία Περιορισμένης Ευθύνης (Ε.Π.Ε.)", capital: true },
            { label: "Ανώνυμη Εταιρεία (Α.Ε.)", capital: true }
        ],
        commonRequirements: [...EU_COMPANY_REQUIREMENTS, "licence"]
    },

    IE: {
        postalCodeName: "Eircode",
        registrationAuthority: "Companies Registration Office (CRO)",
        taxIdName: "Tax Reference Number",
        consumptionTax: "VAT",
        activityCode: "NACE code",
        forms: [
            { label: "Sole Trader", capital: false, soleFounder: true },
            { label: "Partnership", capital: false },
            { label: "Private Company Limited by Shares (LTD)", capital: true },
            { label: "Designated Activity Company (DAC)", capital: true },
            { label: "Company Limited by Guarantee (CLG)", capital: false },
            { label: "Public Limited Company (PLC)", capital: true }
        ],
        commonRequirements: EU_COMPANY_REQUIREMENTS
    },

    IN: {
        postalCodeName: "PIN Code",
        registrationAuthority: "Registrar of Companies (MCA)",
        taxIdName: "PAN",
        registrationNumberHint: "21-character CIN",
        consumptionTax: "GST",
        forms: [
            { label: "Sole Proprietorship", capital: false, soleFounder: true },
            { label: "Partnership Firm", capital: false },
            { label: "Limited Liability Partnership (LLP)", capital: true },
            { label: "One Person Company (OPC)", capital: true, soleFounder: true },
            { label: "Private Limited Company", capital: true },
            { label: "Public Limited Company", capital: true }
        ],
        commonRequirements: ["officer", "additional"]
    },

    IT: {
        postalCodeName: "CAP",
        registrationAuthority: "Registro delle Imprese (Camera di Commercio)",
        taxIdName: "Codice Fiscale",
        registrationNumberHint: "11 digits (Partita IVA)",
        consumptionTax: "VAT (IVA)",
        activityCode: "Codice ATECO",
        forms: [
            { label: "Ditta individuale (sole proprietorship)", capital: false, soleFounder: true },
            { label: "Società in nome collettivo (S.n.c.)", capital: false },
            { label: "Società in accomandita semplice (S.a.s.)", capital: false },
            { label: "Società a responsabilità limitata (S.r.l.)", capital: true },
            { label: "S.r.l. semplificata (S.r.l.s.)", capital: true },
            { label: "Società per azioni (S.p.A.)", capital: true }
        ],
        commonRequirements: [...EU_COMPANY_REQUIREMENTS, "licence"]
    },

    JP: {
        postalCodeName: "Postal Code",
        registrationAuthority: "Legal Affairs Bureau",
        taxIdName: "Corporate Number",
        registrationNumberHint: "13 digits",
        consumptionTax: "Consumption Tax (消費税)",
        forms: [
            { label: "個人事業主 (sole proprietorship)", capital: false, soleFounder: true },
            { label: "合同会社 (GK)", capital: true },
            { label: "株式会社 (KK)", capital: true },
            { label: "合名会社 (general partnership company)", capital: false },
            { label: "合資会社 (limited partnership company)", capital: true }
        ],
        commonRequirements: ["officer"]
    },

    MX: {
        postalCodeName: "Codigo Postal",
        registrationAuthority: "Registro Publico de Comercio",
        taxIdName: "RFC",
        consumptionTax: "VAT (IVA)",
        forms: [
            { label: "Persona Física con Actividad Empresarial", capital: false, soleFounder: true },
            { label: "Sociedad de Responsabilidad Limitada (S. de R.L.)", capital: true },
            { label: "Sociedad Anónima de C.V. (S.A. de C.V.)", capital: true },
            { label: "Sociedad por Acciones Simplificada (S.A.S.)", capital: true }
        ],
        commonRequirements: ["officer", "additional"]
    },

    NL: {
        postalCodeName: "Postcode",
        registrationAuthority: "Kamer van Koophandel (KVK)",
        taxIdName: "RSIN",
        registrationNumberHint: "8 digits (KVK number)",
        consumptionTax: "VAT (BTW)",
        activityCode: "SBI code",
        forms: [
            { label: "Eenmanszaak (sole proprietorship)", capital: false, soleFounder: true },
            { label: "Vennootschap onder firma (VOF)", capital: false },
            { label: "Commanditaire vennootschap (CV)", capital: true },
            { label: "Besloten vennootschap (BV)", capital: true },
            { label: "Naamloze vennootschap (NV)", capital: true },
            { label: "Stichting (foundation)", capital: false }
        ],
        commonRequirements: EU_COMPANY_REQUIREMENTS
    },

    NO: {
        sameTaxAndRegistrationNumber: true,
        postalCodeName: "Postnummer",
        registrationAuthority: "Bronnoysundregistrene",
        taxIdName: "Organisasjonsnummer",
        registrationNumberHint: "9 digits",
        consumptionTax: "VAT (MVA)",
        forms: [
            { label: "Enkeltpersonforetak (sole proprietorship)", capital: false, soleFounder: true },
            { label: "Ansvarlig selskap (ANS / DA)", capital: false },
            { label: "Aksjeselskap (AS)", capital: true },
            { label: "Allmennaksjeselskap (ASA)", capital: true }
        ],
        commonRequirements: ["officer", "beneficial-owner"]
    },

    NZ: {
        postalCodeName: "Postcode",
        registrationAuthority: "New Zealand Companies Office",
        taxIdName: "IRD number",
        consumptionTax: "GST",
        activityCode: "ANZSIC code",
        forms: [
            { label: "Sole Trader", capital: false, soleFounder: true },
            { label: "Partnership", capital: false },
            { label: "Limited Company", capital: true },
            { label: "Look-Through Company (LTC)", capital: true }
        ],
        commonRequirements: ["officer"]
    },

    PL: {
        postalCodeName: "Kod pocztowy",
        registrationAuthority: "Krajowy Rejestr Sadowy (KRS)",
        taxIdName: "NIP",
        registrationNumberHint: "10 digits (NIP)",
        consumptionTax: "VAT",
        activityCode: "PKD code",
        forms: [
            { label: "Jednoosobowa działalność gospodarcza", capital: false, soleFounder: true },
            { label: "Spółka cywilna", capital: false },
            { label: "Spółka jawna", capital: false },
            { label: "Spółka z ograniczoną odpowiedzialnością (sp. z o.o.)", capital: true },
            { label: "Prosta spółka akcyjna (P.S.A.)", capital: true },
            { label: "Spółka akcyjna (S.A.)", capital: true }
        ],
        commonRequirements: EU_COMPANY_REQUIREMENTS
    },

    PT: {
        sameTaxAndRegistrationNumber: true,
        postalCodeName: "Codigo Postal",
        registrationAuthority: "Registo Comercial (IRN)",
        taxIdName: "NIF",
        registrationNumberHint: "9 digits",
        consumptionTax: "VAT (IVA)",
        activityCode: "CAE code",
        forms: [
            { label: "Empresário em nome individual", capital: false, soleFounder: true },
            { label: "Sociedade Unipessoal por Quotas", capital: true, soleFounder: true },
            { label: "Sociedade por Quotas (Lda.)", capital: true },
            { label: "Sociedade Anónima (S.A.)", capital: true }
        ],
        commonRequirements: EU_COMPANY_REQUIREMENTS
    },

    SE: {
        sameTaxAndRegistrationNumber: true,
        postalCodeName: "Postnummer",
        registrationAuthority: "Bolagsverket",
        taxIdName: "Organisationsnummer",
        registrationNumberHint: "123456-7890",
        consumptionTax: "VAT (moms)",
        activityCode: "SNI code",
        forms: [
            { label: "Enskild firma (sole proprietorship)", capital: false, soleFounder: true },
            { label: "Handelsbolag (general partnership)", capital: false },
            { label: "Kommanditbolag (limited partnership)", capital: true },
            { label: "Aktiebolag (AB)", capital: true }
        ],
        commonRequirements: EU_COMPANY_REQUIREMENTS
    },

    SG: {
        sameTaxAndRegistrationNumber: true,
        postalCodeName: "Postal Code",
        registrationAuthority: "Accounting and Corporate Regulatory Authority (ACRA)",
        taxIdName: "UEN",
        consumptionTax: "GST",
        activityCode: "SSIC code",
        forms: [
            { label: "Sole Proprietorship", capital: false, soleFounder: true },
            { label: "Partnership", capital: false },
            { label: "Limited Liability Partnership (LLP)", capital: false },
            { label: "Private Limited Company (Pte Ltd)", capital: true },
            { label: "Public Company Limited by Shares", capital: true }
        ],
        commonRequirements: ["officer", "beneficial-owner"]
    },

    AE: {
        noPostalCode: true,
        subdivision: {
            label: "Emirate or Free Zone",
            options: [
                { name: "Abu Dhabi", authority: "Abu Dhabi Department of Economic Development" },
                { name: "Dubai", authority: "Dubai Department of Economic Development" },
                { name: "Sharjah", authority: "Sharjah Department of Economic Development" },
                { name: "Ajman", authority: "Ajman Department of Economic Development" },
                { name: "Umm Al Quwain", authority: "Umm Al Quwain Department of Economic Development" },
                { name: "Ras Al Khaimah", authority: "Ras Al Khaimah Department of Economic Development" },
                { name: "Fujairah", authority: "Fujairah Department of Economic Development" },
                { name: "Free zone", authority: "Free zone authority", forms: [
                        { label: "Free Zone Limited Liability Company (FZ-LLC)", capital: true },
                        { label: "Free Zone Establishment (FZE)", capital: true, soleFounder: true },
                        { label: "Free Zone Company (FZCO)", capital: true },
                        { label: "Branch of a Foreign Company", capital: false }
                    ] }
            ]
        },
        registrationAuthority: "Department of Economic Development",
        taxIdName: "TRN",
        registrationNumberHint: "15 digits (TRN)",
        consumptionTax: "VAT",
        forms: [
            { label: "Sole Establishment", capital: false, soleFounder: true },
            { label: "Limited Liability Company (LLC)", capital: true },
            { label: "Free Zone Company (FZ-LLC / FZE)", capital: true },
            { label: "Branch of a Foreign Company", capital: false }
        ],
        commonRequirements: ["licence", "officer"]
    },

    GB: {
        postalCodeName: "Postcode",
        registrationAuthority: "Companies House",
        taxIdName: "UTR",
        taxIdNumberHint: "10 digits",
        registrationNumberHint: "8 characters",
        consumptionTax: "VAT",
        activityCode: "SIC code",
        forms: [
            { label: "Sole Trader", capital: false, soleFounder: true },
            { label: "Partnership", capital: false },
            { label: "Limited Liability Partnership (LLP)", capital: false },
            { label: "Private Company Limited by Shares (Ltd)", capital: true },
            { label: "Private Company Limited by Guarantee", capital: false },
            { label: "Public Limited Company (PLC)", capital: true },
            { label: "Community Interest Company (CIC)", capital: true }
        ],
        commonRequirements: ["officer", "beneficial-owner"]
    },

    US: {
        postalCodeName: "ZIP Code",
        subdivision: {
            label: "State",
            options: [
                { name: "Alabama", code: "AL", authority: "Alabama Secretary of State" },
                { name: "Alaska", code: "AK", authority: "Alaska Division of Corporations, Business and Professional Licensing", noConsumptionTax: true },
                { name: "Arizona", code: "AZ", authority: "Arizona Corporation Commission" },
                { name: "Arkansas", code: "AR", authority: "Arkansas Secretary of State" },
                { name: "California", code: "CA", authority: "California Secretary of State" },
                { name: "Colorado", code: "CO", authority: "Colorado Secretary of State" },
                { name: "Connecticut", code: "CT", authority: "Connecticut Secretary of State" },
                { name: "Delaware", code: "DE", authority: "Delaware Division of Corporations", noConsumptionTax: true },
                { name: "District of Columbia", code: "DC", authority: "District of Columbia Secretary of State" },
                { name: "Florida", code: "FL", authority: "Florida Secretary of State" },
                { name: "Georgia", code: "GA", authority: "Georgia Secretary of State" },
                { name: "Hawaii", code: "HI", authority: "Hawaii Department of Commerce and Consumer Affairs" },
                { name: "Idaho", code: "ID", authority: "Idaho Secretary of State" },
                { name: "Illinois", code: "IL", authority: "Illinois Secretary of State" },
                { name: "Indiana", code: "IN", authority: "Indiana Secretary of State" },
                { name: "Iowa", code: "IA", authority: "Iowa Secretary of State" },
                { name: "Kansas", code: "KS", authority: "Kansas Secretary of State" },
                { name: "Kentucky", code: "KY", authority: "Kentucky Secretary of State" },
                { name: "Louisiana", code: "LA", authority: "Louisiana Secretary of State" },
                { name: "Maine", code: "ME", authority: "Maine Secretary of State" },
                { name: "Maryland", code: "MD", authority: "Maryland State Department of Assessments and Taxation" },
                { name: "Massachusetts", code: "MA", authority: "Massachusetts Secretary of the Commonwealth" },
                { name: "Michigan", code: "MI", authority: "Michigan Department of Licensing and Regulatory Affairs (LARA)" },
                { name: "Minnesota", code: "MN", authority: "Minnesota Secretary of State" },
                { name: "Mississippi", code: "MS", authority: "Mississippi Secretary of State" },
                { name: "Missouri", code: "MO", authority: "Missouri Secretary of State" },
                { name: "Montana", code: "MT", authority: "Montana Secretary of State", noConsumptionTax: true },
                { name: "Nebraska", code: "NE", authority: "Nebraska Secretary of State" },
                { name: "Nevada", code: "NV", authority: "Nevada Secretary of State" },
                { name: "New Hampshire", code: "NH", authority: "New Hampshire Secretary of State", noConsumptionTax: true },
                { name: "New Jersey", code: "NJ", authority: "New Jersey Division of Revenue and Enterprise Services" },
                { name: "New Mexico", code: "NM", authority: "New Mexico Secretary of State" },
                { name: "New York", code: "NY", authority: "New York Department of State" },
                { name: "North Carolina", code: "NC", authority: "North Carolina Secretary of State" },
                { name: "North Dakota", code: "ND", authority: "North Dakota Secretary of State" },
                { name: "Ohio", code: "OH", authority: "Ohio Secretary of State" },
                { name: "Oklahoma", code: "OK", authority: "Oklahoma Secretary of State" },
                { name: "Oregon", code: "OR", authority: "Oregon Secretary of State", noConsumptionTax: true },
                { name: "Pennsylvania", code: "PA", authority: "Pennsylvania Department of State" },
                { name: "Rhode Island", code: "RI", authority: "Rhode Island Secretary of State" },
                { name: "South Carolina", code: "SC", authority: "South Carolina Secretary of State" },
                { name: "South Dakota", code: "SD", authority: "South Dakota Secretary of State" },
                { name: "Tennessee", code: "TN", authority: "Tennessee Secretary of State" },
                { name: "Texas", code: "TX", authority: "Texas Secretary of State" },
                { name: "Utah", code: "UT", authority: "Utah Division of Corporations and Commercial Code" },
                { name: "Vermont", code: "VT", authority: "Vermont Secretary of State" },
                { name: "Virginia", code: "VA", authority: "Virginia State Corporation Commission" },
                { name: "Washington", code: "WA", authority: "Washington Secretary of State" },
                { name: "West Virginia", code: "WV", authority: "West Virginia Secretary of State" },
                { name: "Wisconsin", code: "WI", authority: "Wisconsin Department of Financial Institutions" },
                { name: "Wyoming", code: "WY", authority: "Wyoming Secretary of State" }
            ]
        },
        registrationAuthority: "Secretary of State",
        taxIdName: "EIN",
        registrationNumberHint: "EIN: 12-3456789",
        consumptionTax: "Sales Tax",
        activityCode: "NAICS code",
        forms: [
            { label: "Sole Proprietorship", capital: false, soleFounder: true },
            { label: "General Partnership", capital: false },
            { label: "Limited Partnership (LP)", capital: true },
            { label: "Limited Liability Company (LLC)", capital: false },
            { label: "C Corporation", capital: true },
            { label: "S Corporation", capital: true },
            { label: "Nonprofit Corporation", capital: false }
        ],
        commonRequirements: ["licence", "additional"]
    },

    ZA: {
        postalCodeName: "Postal Code",
        registrationAuthority: "Companies and Intellectual Property Commission (CIPC)",
        taxIdName: "Income Tax reference number",
        consumptionTax: "VAT",
        forms: [
            { label: "Sole Proprietor", capital: false, soleFounder: true },
            { label: "Partnership", capital: false },
            { label: "Private Company (Pty) Ltd", capital: true },
            { label: "Public Company (Ltd)", capital: true },
            { label: "Non-Profit Company (NPC)", capital: false }
        ],
        commonRequirements: ["officer", "beneficial-owner"]
    }

};

/**
 * Every country, so the list never tells someone their own is not a
 * real place. ISO 3166-1: code and English short name.
 */
export const COUNTRIES: Array<{ code: string; name: string; currency: string }> = [
    { code: "AF", name: "Afghanistan", currency: "AFN" }, { code: "AL", name: "Albania", currency: "ALL" },
    { code: "DZ", name: "Algeria", currency: "DZD" }, { code: "AD", name: "Andorra", currency: "EUR" },
    { code: "AO", name: "Angola", currency: "AOA" }, { code: "AG", name: "Antigua and Barbuda", currency: "XCD" },
    { code: "AR", name: "Argentina", currency: "ARS" }, { code: "AM", name: "Armenia", currency: "AMD" },
    { code: "AU", name: "Australia", currency: "AUD" }, { code: "AT", name: "Austria", currency: "EUR" },
    { code: "AZ", name: "Azerbaijan", currency: "AZN" }, { code: "BS", name: "Bahamas", currency: "BSD" },
    { code: "BH", name: "Bahrain", currency: "BHD" }, { code: "BD", name: "Bangladesh", currency: "BDT" },
    { code: "BB", name: "Barbados", currency: "BBD" }, { code: "BY", name: "Belarus", currency: "BYN" },
    { code: "BE", name: "Belgium", currency: "EUR" }, { code: "BZ", name: "Belize", currency: "BZD" },
    { code: "BJ", name: "Benin", currency: "XOF" }, { code: "BT", name: "Bhutan", currency: "BTN" },
    { code: "BO", name: "Bolivia", currency: "BOB" }, { code: "BA", name: "Bosnia and Herzegovina", currency: "BAM" },
    { code: "BW", name: "Botswana", currency: "BWP" }, { code: "BR", name: "Brazil", currency: "BRL" },
    { code: "BN", name: "Brunei Darussalam", currency: "BND" }, { code: "BG", name: "Bulgaria", currency: "BGN" },
    { code: "BF", name: "Burkina Faso", currency: "XOF" }, { code: "BI", name: "Burundi", currency: "BIF" },
    { code: "CV", name: "Cabo Verde", currency: "CVE" }, { code: "KH", name: "Cambodia", currency: "KHR" },
    { code: "CM", name: "Cameroon", currency: "XAF" }, { code: "CA", name: "Canada", currency: "CAD" },
    { code: "CF", name: "Central African Republic", currency: "XAF" }, { code: "TD", name: "Chad", currency: "XAF" },
    { code: "CL", name: "Chile", currency: "CLP" }, { code: "CN", name: "China", currency: "CNY" },
    { code: "CO", name: "Colombia", currency: "COP" }, { code: "KM", name: "Comoros", currency: "KMF" },
    { code: "CG", name: "Congo", currency: "XAF" }, { code: "CD", name: "Congo (Democratic Republic)", currency: "CDF" },
    { code: "CR", name: "Costa Rica", currency: "CRC" }, { code: "CI", name: "Côte d'Ivoire", currency: "XOF" },
    { code: "HR", name: "Croatia", currency: "EUR" }, { code: "CU", name: "Cuba", currency: "CUP" },
    { code: "CY", name: "Cyprus", currency: "EUR" }, { code: "CZ", name: "Czechia", currency: "CZK" },
    { code: "DK", name: "Denmark", currency: "DKK" }, { code: "DJ", name: "Djibouti", currency: "DJF" },
    { code: "DM", name: "Dominica", currency: "XCD" }, { code: "DO", name: "Dominican Republic", currency: "DOP" },
    { code: "EC", name: "Ecuador", currency: "USD" }, { code: "EG", name: "Egypt", currency: "EGP" },
    { code: "SV", name: "El Salvador", currency: "USD" }, { code: "GQ", name: "Equatorial Guinea", currency: "XAF" },
    { code: "ER", name: "Eritrea", currency: "ERN" }, { code: "EE", name: "Estonia", currency: "EUR" },
    { code: "SZ", name: "Eswatini", currency: "SZL" }, { code: "ET", name: "Ethiopia", currency: "ETB" },
    { code: "FJ", name: "Fiji", currency: "FJD" }, { code: "FI", name: "Finland", currency: "EUR" },
    { code: "FR", name: "France", currency: "EUR" }, { code: "GA", name: "Gabon", currency: "XAF" },
    { code: "GM", name: "Gambia", currency: "GMD" }, { code: "GE", name: "Georgia", currency: "GEL" },
    { code: "DE", name: "Germany", currency: "EUR" }, { code: "GH", name: "Ghana", currency: "GHS" },
    { code: "GR", name: "Greece", currency: "EUR" }, { code: "GD", name: "Grenada", currency: "XCD" },
    { code: "GT", name: "Guatemala", currency: "GTQ" }, { code: "GN", name: "Guinea", currency: "GNF" },
    { code: "GW", name: "Guinea-Bissau", currency: "XOF" }, { code: "GY", name: "Guyana", currency: "GYD" },
    { code: "HT", name: "Haiti", currency: "HTG" }, { code: "HN", name: "Honduras", currency: "HNL" },
    { code: "HU", name: "Hungary", currency: "HUF" }, { code: "IS", name: "Iceland", currency: "ISK" },
    { code: "IN", name: "India", currency: "INR" }, { code: "ID", name: "Indonesia", currency: "IDR" },
    { code: "IR", name: "Iran", currency: "IRR" }, { code: "IQ", name: "Iraq", currency: "IQD" },
    { code: "IE", name: "Ireland", currency: "EUR" }, { code: "IL", name: "Israel", currency: "ILS" },
    { code: "IT", name: "Italy", currency: "EUR" }, { code: "JM", name: "Jamaica", currency: "JMD" },
    { code: "JP", name: "Japan", currency: "JPY" }, { code: "JO", name: "Jordan", currency: "JOD" },
    { code: "KZ", name: "Kazakhstan", currency: "KZT" }, { code: "KE", name: "Kenya", currency: "KES" },
    { code: "KI", name: "Kiribati", currency: "AUD" }, { code: "KW", name: "Kuwait", currency: "KWD" },
    { code: "KG", name: "Kyrgyzstan", currency: "KGS" }, { code: "LA", name: "Laos", currency: "LAK" },
    { code: "LV", name: "Latvia", currency: "EUR" }, { code: "LB", name: "Lebanon", currency: "LBP" },
    { code: "LS", name: "Lesotho", currency: "LSL" }, { code: "LR", name: "Liberia", currency: "LRD" },
    { code: "LY", name: "Libya", currency: "LYD" }, { code: "LI", name: "Liechtenstein", currency: "CHF" },
    { code: "LT", name: "Lithuania", currency: "EUR" }, { code: "LU", name: "Luxembourg", currency: "EUR" },
    { code: "MG", name: "Madagascar", currency: "MGA" }, { code: "MW", name: "Malawi", currency: "MWK" },
    { code: "MY", name: "Malaysia", currency: "MYR" }, { code: "MV", name: "Maldives", currency: "MVR" },
    { code: "ML", name: "Mali", currency: "XOF" }, { code: "MT", name: "Malta", currency: "EUR" },
    { code: "MH", name: "Marshall Islands", currency: "USD" }, { code: "MR", name: "Mauritania", currency: "MRU" },
    { code: "MU", name: "Mauritius", currency: "MUR" }, { code: "MX", name: "Mexico", currency: "MXN" },
    { code: "FM", name: "Micronesia", currency: "USD" }, { code: "MD", name: "Moldova", currency: "MDL" },
    { code: "MC", name: "Monaco", currency: "EUR" }, { code: "MN", name: "Mongolia", currency: "MNT" },
    { code: "ME", name: "Montenegro", currency: "EUR" }, { code: "MA", name: "Morocco", currency: "MAD" },
    { code: "MZ", name: "Mozambique", currency: "MZN" }, { code: "MM", name: "Myanmar", currency: "MMK" },
    { code: "NA", name: "Namibia", currency: "NAD" }, { code: "NR", name: "Nauru", currency: "AUD" },
    { code: "NP", name: "Nepal", currency: "NPR" }, { code: "NL", name: "Netherlands", currency: "EUR" },
    { code: "NZ", name: "New Zealand", currency: "NZD" }, { code: "NI", name: "Nicaragua", currency: "NIO" },
    { code: "NE", name: "Niger", currency: "XOF" }, { code: "NG", name: "Nigeria", currency: "NGN" },
    { code: "KP", name: "North Korea", currency: "KPW" }, { code: "MK", name: "North Macedonia", currency: "MKD" },
    { code: "NO", name: "Norway", currency: "NOK" }, { code: "OM", name: "Oman", currency: "OMR" },
    { code: "PK", name: "Pakistan", currency: "PKR" }, { code: "PW", name: "Palau", currency: "USD" },
    { code: "PS", name: "Palestine", currency: "ILS" }, { code: "PA", name: "Panama", currency: "PAB" },
    { code: "PG", name: "Papua New Guinea", currency: "PGK" }, { code: "PY", name: "Paraguay", currency: "PYG" },
    { code: "PE", name: "Peru", currency: "PEN" }, { code: "PH", name: "Philippines", currency: "PHP" },
    { code: "PL", name: "Poland", currency: "PLN" }, { code: "PT", name: "Portugal", currency: "EUR" },
    { code: "QA", name: "Qatar", currency: "QAR" }, { code: "RO", name: "Romania", currency: "RON" },
    { code: "RU", name: "Russia", currency: "RUB" }, { code: "RW", name: "Rwanda", currency: "RWF" },
    { code: "KN", name: "Saint Kitts and Nevis", currency: "XCD" }, { code: "LC", name: "Saint Lucia", currency: "XCD" },
    { code: "VC", name: "Saint Vincent and the Grenadines", currency: "XCD" }, { code: "WS", name: "Samoa", currency: "WST" },
    { code: "SM", name: "San Marino", currency: "EUR" }, { code: "ST", name: "Sao Tome and Principe", currency: "STN" },
    { code: "SA", name: "Saudi Arabia", currency: "SAR" }, { code: "SN", name: "Senegal", currency: "XOF" },
    { code: "RS", name: "Serbia", currency: "RSD" }, { code: "SC", name: "Seychelles", currency: "SCR" },
    { code: "SL", name: "Sierra Leone", currency: "SLE" }, { code: "SG", name: "Singapore", currency: "SGD" },
    { code: "SK", name: "Slovakia", currency: "EUR" }, { code: "SI", name: "Slovenia", currency: "EUR" },
    { code: "SB", name: "Solomon Islands", currency: "SBD" }, { code: "SO", name: "Somalia", currency: "SOS" },
    { code: "ZA", name: "South Africa", currency: "ZAR" }, { code: "KR", name: "South Korea", currency: "KRW" },
    { code: "SS", name: "South Sudan", currency: "SSP" }, { code: "ES", name: "Spain", currency: "EUR" },
    { code: "LK", name: "Sri Lanka", currency: "LKR" }, { code: "SD", name: "Sudan", currency: "SDG" },
    { code: "SR", name: "Suriname", currency: "SRD" }, { code: "SE", name: "Sweden", currency: "SEK" },
    { code: "CH", name: "Switzerland", currency: "CHF" }, { code: "SY", name: "Syria", currency: "SYP" },
    { code: "TW", name: "Taiwan", currency: "TWD" }, { code: "TJ", name: "Tajikistan", currency: "TJS" },
    { code: "TZ", name: "Tanzania", currency: "TZS" }, { code: "TH", name: "Thailand", currency: "THB" },
    { code: "TL", name: "Timor-Leste", currency: "USD" }, { code: "TG", name: "Togo", currency: "XOF" },
    { code: "TO", name: "Tonga", currency: "TOP" }, { code: "TT", name: "Trinidad and Tobago", currency: "TTD" },
    { code: "TN", name: "Tunisia", currency: "TND" }, { code: "TR", name: "Türkiye", currency: "TRY" },
    { code: "TM", name: "Turkmenistan", currency: "TMT" }, { code: "TV", name: "Tuvalu", currency: "AUD" },
    { code: "UG", name: "Uganda", currency: "UGX" }, { code: "UA", name: "Ukraine", currency: "UAH" },
    { code: "AE", name: "United Arab Emirates", currency: "AED" }, { code: "GB", name: "United Kingdom", currency: "GBP" },
    { code: "US", name: "United States of America", currency: "USD" }, { code: "UY", name: "Uruguay", currency: "UYU" },
    { code: "UZ", name: "Uzbekistan", currency: "UZS" }, { code: "VU", name: "Vanuatu", currency: "VUV" },
    { code: "VA", name: "Vatican City", currency: "EUR" }, { code: "VE", name: "Venezuela", currency: "VES" },
    { code: "VN", name: "Viet Nam", currency: "VND" }, { code: "YE", name: "Yemen", currency: "YER" },
    { code: "ZM", name: "Zambia", currency: "ZMW" }, { code: "ZW", name: "Zimbabwe", currency: "ZWG" }
];

/**
 * The ISO 4217 currency of the country the organization is
 * registered in, or "" when no country is chosen yet.
 *
 * Every amount on the page is in one currency, because every amount
 * on the page belongs to one legal entity in one jurisdiction: the
 * capital its founders put in, and what registering and maintaining
 * it costs. Showing the code beside each amount saves the user
 * writing it, and saves the next reader guessing.
 */
export function countryCurrency(countryCode: string): string {
    return COUNTRIES.find(country => country.code === countryCode)?.currency ?? "";
}

/**
 * The state, province, canton or emirate chosen, if the country
 * has that question at all.
 */
export function subdivisionOption(
    countryCode: string,
    subdivisionName: string
): SubdivisionOption | undefined {

    return jurisdictionProfile(countryCode).subdivision?.options.find(
        option => option.name === subdivisionName
    );

}

/**
 * The legal forms on offer. Normally the country's own; in the UAE
 * a free zone company is a different set entirely, so the chosen
 * subdivision can replace them.
 */
export function legalFormOptions(
    countryCode: string,
    subdivisionName: string
): LegalFormOption[] {

    // The first published version (design document 33, section 3): the six countries keep their own lists; every other country is "Other" and has the five generic forms.
    if (!FIRST_VERSION_COUNTRIES.includes(countryCode)) {
        return GENERIC_LEGAL_FORMS;
    }
    return subdivisionOption(countryCode, subdivisionName)?.forms
        ?? jurisdictionProfile(countryCode).forms;

}

/** The six countries of the first published version, by code: the United Kingdom, Ireland, the USA, Canada, Australia and New Zealand. Any other country is "Other" (document 33, section 3). */
export const FIRST_VERSION_COUNTRIES: readonly string[] = ["GB", "IE", "US", "CA", "AU", "NZ"];

/** The legal forms of a country that is not one of the six (the owner's list, document 33): the same five whatever the country. */
export const GENERIC_LEGAL_FORMS: LegalFormOption[] = [
    { label: "Sole Proprietorship", capital: false, soleFounder: true },
    { label: "General Partnership", capital: false },
    { label: "Private Limited Company (LLC / Ltd / GmbH)", capital: true },
    { label: "Public Limited Company (PLC / Corp / AG)", capital: true },
    { label: "Limited Liability Partnership (LLP)", capital: false }
];

/**
 * The body to prefill into Registration Authority: the
 * subdivision's own where there is one (a US Secretary of State, a
 * Swiss cantonal register), otherwise the country's.
 */
export function registrationAuthorityFor(
    countryCode: string,
    subdivisionName: string
): string {

    return subdivisionOption(countryCode, subdivisionName)?.authority
        ?? jurisdictionProfile(countryCode).registrationAuthority
        ?? "";

}


/**
 * Names a country is looked for by, beyond its own. Everything
 * here is in addition to the ISO code, which every country gets
 * automatically -- so "GB" already works and this is only for the
 * names people actually type.
 */
const COUNTRY_NICKNAMES: Record<string, string> = {
    GB: "UK Great Britain Britain England Scotland Wales",
    US: "USA United States America",
    AE: "UAE Emirates Dubai Abu Dhabi",
    NL: "Holland",
    CH: "Swiss",
    KR: "South Korea",
    CZ: "Czech Republic",
    TR: "Turkey",
    VN: "Vietnam"
};

/**
 * What each country can be found by when typing, keyed by the name
 * shown in the list. Its own code, plus whatever people call it.
 */
export function countrySearchAliases(): Record<string, string> {

    const aliases: Record<string, string> = {};

    for (const country of COUNTRIES) {
        aliases[country.name] = country.code +
            (COUNTRY_NICKNAMES[country.code] ? " " + COUNTRY_NICKNAMES[country.code] : "");
    }

    return aliases;

}

/** The same, for a country's states, provinces or cantons. */
export function subdivisionSearchAliases(countryCode: string): Record<string, string> {

    const aliases: Record<string, string> = {};

    for (const option of jurisdictionProfile(countryCode).subdivision?.options ?? []) {
        if (option.code) {
            aliases[option.name] = option.code;
        }
    }

    return aliases;

}

/**
 * What to head the postal code field with, or "" where the country
 * has none and the field should not be shown at all.
 *
 * A country this app knows nothing about gets the generic name
 * rather than nothing: most countries do use postal codes, and
 * hiding the field on a guess would lose part of an address.
 */
export function postalCodeLabel(countryCode: string): string {

    const profile = jurisdictionProfile(countryCode);

    if (profile.noPostalCode) {
        return "";
    }

    return profile.postalCodeName ?? "Postal Code";

}

/**
 * Whether this country identifies an organization by one number
 * rather than two (see JurisdictionProfile).
 */
export function sharesTaxAndRegistrationNumber(countryCode: string): boolean {
    return jurisdictionProfile(countryCode).sameTaxAndRegistrationNumber === true;
}

/** The profile for a country code, or the neutral one. */
export function jurisdictionProfile(countryCode: string): JurisdictionProfile {
    return JURISDICTIONS[countryCode] ?? NEUTRAL_PROFILE;
}

/**
 * Whether the chosen country is one this app carries real knowledge
 * of. The page says so plainly rather than letting the user assume
 * the absence of a prompt means nothing is required of them.
 */
export function jurisdictionIsProfiled(countryCode: string): boolean {
    return countryCode.length > 0 && countryCode in JURISDICTIONS;
}

/*
 * There was a `legalFormUsesCapital` here. It read the capital
 * convention off the COUNTRY's form list, which stopped being the
 * whole story once a subdivision could replace that list (a UAE
 * free zone). The editor now reads it off `legalFormOptions` --
 * the same list it actually offered -- so the two can never
 * disagree.
 */

/**
 * WHAT A REGISTRATION NUMBER MAY HOLD, from the shape its country states (registrationNumberHint): "8 digits" takes digits only, no more than 8; "8 characters"
 * takes letters and digits, no more than 8; a shape with separators ("123456-7890", "CHE-123.456.789") takes the characters it shows (digits, or digits and
 * letters where it shows letters), no longer than it. A country with no stated shape takes letters, digits and the usual separators, up to 20.
 */
export interface RegistrationNumberRule {
    digitsOnly: boolean;
    max: number;
    /** Whether a character may stand in it. */
    allows: (character: string) => boolean;
}

const isDigit = (character: string) => character >= "0" && character <= "9";
const isLetter = (character: string) => /^[A-Za-z]$/.test(character);

export function registrationNumberRule(hint?: string): RegistrationNumberRule {
    const text = (hint ?? "").replace(/^[^:]*:\s*/, "").trim();
    const digits = /^(\d+) digits/.exec(text);
    if (digits) {
        return { digitsOnly: true, max: Number(digits[1]), allows: isDigit };
    }
    const characters = /^(\d+)[- ]characters?/.exec(text);
    if (characters) {
        return { digitsOnly: false, max: Number(characters[1]), allows: character => isDigit(character) || isLetter(character) };
    }
    if (text !== "") {
        const separators = new Set([...text].filter(character => !isDigit(character) && !isLetter(character) && character !== " "));
        const letters = [...text].some(isLetter);
        return {
            digitsOnly: !letters,
            max: text.length + (letters ? 4 : 0),
            allows: character => isDigit(character) || separators.has(character) || (letters && (isLetter(character) || character === " "))
        };
    }
    return { digitsOnly: false, max: 20, allows: character => isDigit(character) || isLetter(character) || " .-/".includes(character) };
}

/** Text typed into a registration number, cut to what the rule allows: nothing else can be typed, and no more than its length. */
export function limitedRegistrationNumber(text: string, rule: RegistrationNumberRule): string {
    return [...text].filter(rule.allows).join("").slice(0, rule.max);
}
