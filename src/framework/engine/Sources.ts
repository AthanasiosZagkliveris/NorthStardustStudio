/**
 * Every reference the app shows -- the "Source:" and "Based on:"
 * links in an "i" note today; help text, document notes, the
 * glossary and checklists later -- is a `Source` from this module,
 * and every one of them must come from an ACCEPTED SOURCE.
 *
 * THE RULE (user rule, 2026-09-29):
 *
 *   Accept -- official government and regulator sites (sba.gov,
 *   irs.gov, sec.gov, investor.gov, consumerfinance.gov, bls.gov,
 *   census.gov, gov.uk including HMRC and Companies House,
 *   europa.eu, national statistics offices, central banks); official
 *   standard setters (IFRS Foundation, FASB, W3C); universities and
 *   their business schools, libraries, law institutes, extension
 *   and small-business-development centres (.edu, .ac.uk and their
 *   equivalents, e.g. Cornell LII); official professional bodies
 *   (AICPA, ACCA, ICAEW, CIMA). SCORE only as an SBA resource
 *   partner page with an identifiable organisation. University-hosted
 *   open textbooks (OpenStax at Rice University) only where the page
 *   names its academic author(s).
 *
 *   Reject -- open-edit or anonymous sources (Wikipedia, forums,
 *   Q&A), content farms, marketing blogs, vendor sites, and
 *   commercial explainer or training sites (Corporate Finance
 *   Institute, Wall Street Prep, WallStreetMojo, Investopedia,
 *   Klipfolio, Umbrex, ...).
 *
 * A domain on the list is necessary, not sufficient: the page itself
 * must be the organisation's own (an .edu subdomain can host a
 * student blog or a spam page) and must support the exact wording
 * it is cited for. Check both before adding a `Source`, and record
 * the date in `checked`.
 *
 * Sources.test.ts scans every source file and content Markdown for
 * external URLs and fails on any whose domain is not accepted here;
 * the few URLs that are not references (XML namespaces, the local
 * dev server) are listed there, each with its reason.
 */

/**
 * One reference, as the reader sees it and as it was verified.
 *
 * Every reference is written in the HARVARD style (Cite Them Right, the
 * style most UK universities teach): in the text, the author and year
 * ("(Gupta et al., 2006)", `harvardCitation`); in the reference list and
 * in an "i" note, the full reference (`harvardReference`):
 *
 *   Author (Year) Title. Available at: URL (Accessed: 1 October 2026).
 *   Author (Year) 'Part', in Book. Place: Publisher. Available at: ...
 *   Author (Year) 'Article', Journal, 9(2), pp. 139-155. Available at: ...
 *
 * The title of the work that stands on its own is in italics: the page
 * or book itself, or the book or journal a part is in.
 */
export interface Source {

    /**
     * Who wrote it, as Harvard lists them: people as "Surname, I." in the
     * order the work gives ("Franklin, M.", "Graybeal, P."), or one
     * organisation that is the author ("Companies House").
     */
    authors: readonly string[];

    /** The authors edited the work rather than wrote it: "(eds)". */
    editors?: boolean;

    /** The year it was published or last updated, as the page shows it; "n.d." when it shows none. */
    year: string;

    /** The page's own title, as the publisher gives it (a part, when `in` names the work it is part of). */
    title: string;

    /** The work the title is part of: a book (with `inBook`), a journal, a series or a website. */
    in?: string;

    /** `in` is a book: "in Book" (a chapter of it), not "Journal" (an article in it). */
    inBook?: boolean;

    /** What follows the title: place and publisher of a book, or volume, issue and pages of an article. */
    details?: string;

    /** Who publishes it, spelled out ("U.S. Small Business Administration"). */
    publisher: string;

    url: string;

    /** The date the page was last opened and found to support the note (YYYY-MM-DD): the reference's "Accessed" date. */
    checked: string;

}

/**
 * Host endings accepted as a class: a government, a university or
 * an academic network, in the United States and its equivalents
 * elsewhere (gov.uk, ac.uk, edu.au, gov.au, ...: a `gov`, `edu` or
 * `ac` label directly before a two-letter country code).
 */
const ACCEPTED_TOP_LABELS = ["gov", "edu"];
const ACCEPTED_COUNTRY_SECOND_LABELS = ["gov", "edu", "ac", "govt"];

/**
 * Named domains accepted one by one: official bodies whose domains
 * the classes above do not cover. Each entry names who it is.
 */
const ACCEPTED_DOMAINS = [
    "europa.eu",          // European Union institutions, incl. Eurostat
    "w3.org",             // W3C, the standard setter for WCAG
    "ifrs.org",           // IFRS Foundation
    "fasb.org",           // Financial Accounting Standards Board
    "aicpa-cima.com",     // AICPA and CIMA
    "aicpa.org",          // American Institute of CPAs
    "accaglobal.com",     // ACCA
    "icaew.com",          // ICAEW
    "openstax.org",       // OpenStax, Rice University: author-named open textbooks only
    "oecd.org",           // OECD, intergovernmental statistics
    "ecb.europa.eu",      // European Central Bank (also covered by europa.eu)
    "bankofengland.co.uk", // Bank of England
    "ontario.ca",         // Government of Ontario (its e-Laws)
    "un.org"              // United Nations, incl. its Statistics Division
];

/** The host of a URL, lower-cased and without "www."; empty when it is not a URL. */
export function hostOf(url: string): string {
    try {
        return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    } catch {
        return "";
    }
}

/** Whether a host is an accepted source's (see the rule above). */
export function isAcceptedHost(host: string): boolean {

    if (!host) {
        return false;
    }

    const labels = host.split(".");
    const last = labels[labels.length - 1];
    const secondLast = labels[labels.length - 2];

    if (ACCEPTED_TOP_LABELS.includes(last)) {
        return true;
    }

    if (last.length === 2 && secondLast && ACCEPTED_COUNTRY_SECOND_LABELS.includes(secondLast)) {
        return true;
    }

    return ACCEPTED_DOMAINS.some(domain => host === domain || host.endsWith("." + domain));

}

/** Whether a URL points at an accepted source. */
export function isAcceptedUrl(url: string): boolean {
    return url.startsWith("https://") && isAcceptedHost(hostOf(url));
}

/** How a source is named in one line of plain text: its full Harvard reference. */
export function sourceLabel(source: Source): string {
    return harvardReference(source);
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2026-10-01" as Harvard writes an accessed date: "1 October 2026". */
export function harvardDate(iso: string): string {
    const [year, month, day] = iso.split("-").map(Number);
    return day + " " + MONTHS[month - 1] + " " + year;
}

/** A person ("Franklin, M.") rather than an organisation: a surname, a comma and initials. */
const isPerson = (author: string) => /^[^,]+, (?:[A-Z]\.\s?)+$/.test(author);

/** The authors as the reference list writes them: "Franklin, M., Graybeal, P. and Cooper, D.", four or more as "Gupta, S. et al.". */
function authorList(source: Source): string {
    const names = source.authors;
    const listed = names.length >= 4
        ? names[0] + " et al."
        : names.length <= 1
            ? names[0] ?? ""
            : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
    return listed + (source.editors ? (names.length > 1 ? " (eds)" : " (ed.)") : "");
}

/** The in-text citation: "(Franklin, Graybeal and Cooper, 2019)", "(Gupta et al., 2006)", "(Companies House, 2025)". */
export function harvardCitation(source: Source): string {
    const surnames = source.authors.map(author => isPerson(author) ? author.split(",")[0] : author);
    const who = surnames.length >= 4
        ? surnames[0] + " et al."
        : surnames.length <= 1
            ? surnames[0] ?? ""
            : surnames.slice(0, -1).join(", ") + " and " + surnames[surnames.length - 1];
    return "(" + who + ", " + source.year + ")";
}

/** One piece of a reference as it is drawn: plain, in italics (the title of a work), or the address (a link). */
export interface ReferencePart {
    text: string;
    italic?: boolean;
    link?: boolean;
}

/** The full Harvard reference in its pieces, for the reference list and the "i" notes (HarvardReference.tsx draws them). */
export function harvardParts(source: Source): ReferencePart[] {
    const parts: ReferencePart[] = [{ text: authorList(source) + " (" + source.year + ") " }];
    if (source.in) {
        parts.push({ text: "‘" + source.title + "’, " + (source.inBook ? "in " : "") });
        parts.push({ text: source.in, italic: true });
        parts.push({ text: source.details ? (source.inBook ? ". " : ", ") + source.details + ". " : ". " });
    } else {
        // A title that ends in its own mark ("What's changed?") takes no full stop after it.
        const stop = /[?!]$/.test(source.title) ? " " : ". ";
        parts.push({ text: source.title, italic: true });
        parts.push({ text: source.details ? stop + source.details + ". " : stop });
    }
    parts.push({ text: "Available at: " });
    parts.push({ text: source.url, link: true });
    parts.push({ text: " (Accessed: " + harvardDate(source.checked) + ")." });
    return parts;
}

/** The full Harvard reference as one line of text. */
export function harvardReference(source: Source): string {
    return harvardParts(source).map(part => part.text).join("");
}

/** Every source once, in the order of a Harvard reference list: by the first author, then the year, then the title. */
export function referenceList(): { id: SourceId; source: Source }[] {
    return (Object.entries(SOURCES) as [SourceId, Source][])
        .map(([id, source]) => ({ id, source }))
        .sort((one, other) =>
            harvardReference(one.source).localeCompare(harvardReference(other.source), "en-GB", { sensitivity: "base" }));
}

/**
 * Every reference the app cites, in one place, so each is checked
 * once and reused wherever the same statement is made.
 */
export const SOURCES = {

    ukVatRegistration: {
        authors: ["GOV.UK"],
        year: "2024",
        title: "Register for VAT: When to register for VAT",
        publisher: "GOV.UK",
        url: "https://www.gov.uk/vat-registration/when-to-register",
        checked: "2026-10-01"
    },

    ukSicCodes: {
        authors: ["Companies House"],
        year: "2025",
        title: "Standard industrial classification of economic activities (SIC)",
        publisher: "Companies House",
        url: "https://www.gov.uk/government/publications/standard-industrial-classification-of-economic-activities-sic",
        checked: "2026-10-01"
    },

    breakEvenPoint: {
        authors: ["U.S. Small Business Administration"],
        year: "n.d.",
        title: "Calculate your startup costs: break-even point",
        publisher: "U.S. Small Business Administration",
        url: "https://www.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs/break-even-point",
        checked: "2026-09-29"
    },

    breakEvenInDollars: {
        authors: ["Franklin, M.", "Graybeal, P.", "Cooper, D."],
        year: "2019",
        title: "3.2 Calculate a Break-Even Point in Units and Dollars",
        in: "Principles of Accounting, Volume 2: Managerial Accounting",
        inBook: true,
        details: "Houston, TX: OpenStax, Rice University",
        publisher: "OpenStax, Rice University",
        url: "https://openstax.org/books/principles-managerial-accounting/pages/3-2-calculate-a-break-even-point-in-units-and-dollars",
        checked: "2026-09-29"
    },

    contributionMargin: {
        authors: ["Franklin, M.", "Graybeal, P.", "Cooper, D."],
        year: "2019",
        title: "3.1 Explain Contribution Margin and Calculate Contribution Margin per Unit, Contribution Margin Ratio, and Total Contribution Margin",
        in: "Principles of Accounting, Volume 2: Managerial Accounting",
        inBook: true,
        details: "Houston, TX: OpenStax, Rice University",
        publisher: "OpenStax, Rice University",
        url: "https://openstax.org/books/principles-managerial-accounting/pages/3-1-explain-contribution-margin-and-calculate-contribution-margin-per-unit-contribution-margin-ratio-and-total-contribution-margin",
        checked: "2026-09-29"
    },

    capacityUtilisation: {
        authors: ["Board of Governors of the Federal Reserve System"],
        year: "2026",
        title: "Industrial Production and Capacity Utilization (G.17): About",
        publisher: "Board of Governors of the Federal Reserve System",
        url: "https://www.federalreserve.gov/releases/g17/About.htm",
        checked: "2026-09-29"
    },

    loanRepayment: {
        authors: ["Gutierrez, P.H.", "Dalsted, N.L."],
        year: "2012",
        title: "Long Term Loan Repayment Methods",
        details: "Fort Collins, CO: Colorado State University Extension",
        publisher: "Colorado State University Extension",
        url: "https://extension.colostate.edu/resource/long-term-loan-repayment-methods/",
        checked: "2026-09-29"
    },

    simpleInterest: {
        authors: ["Kirk, D."],
        year: "2023",
        title: "6.3 Simple Interest",
        in: "Contemporary Mathematics",
        inBook: true,
        details: "Houston, TX: OpenStax, Rice University",
        publisher: "OpenStax, Rice University",
        url: "https://openstax.org/books/contemporary-mathematics/pages/6-3-simple-interest",
        checked: "2026-09-29"
    },

    cashRunway: {
        authors: ["Damodaran, A."],
        year: "2016",
        title: "The Bonfire of VC: Cash Burn, the Good, the Bad & the Ugly",
        details: "New York: NYU Stern School of Business",
        publisher: "NYU Stern School of Business",
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/blog/CashBurn.pdf",
        checked: "2026-09-29"
    },

    weeksToMonths: {
        authors: ["Legal Information Institute"],
        year: "2011",
        title: "29 CFR § 778.113: Salaried employees, general",
        details: "Ithaca, NY: Cornell Law School",
        publisher: "Cornell Law School, Legal Information Institute",
        url: "https://www.law.cornell.edu/cfr/text/29/778.113",
        checked: "2026-09-29"
    },

    contrastRatio: {
        authors: ["Kirkpatrick, A.", "O Connor, J.", "Campbell, A.", "Cooper, M."],
        editors: true,
        year: "2025",
        title: "Web Content Accessibility Guidelines (WCAG) 2.1: contrast ratio",
        details: "W3C Recommendation",
        publisher: "W3C",
        url: "https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio",
        checked: "2026-09-29"
    },

    referrals: {
        authors: ["Van den Bulte, C.", "Bayer, E.", "Skiera, B.", "Schmitt, P."],
        year: "2019",
        title: "Maximizing the Benefits of Customer Referrals",
        in: "Keller Center Research Report",
        details: "Baylor University, 1 December",
        publisher: "Baylor University, Keller Center for Research",
        url: "https://kellercenter.hankamer.baylor.edu/news/story/2019/maximizing-benefits-customer-referrals",
        checked: "2026-09-29"
    },

    websiteConversion: {
        authors: ["International Trade Administration"],
        year: "2024",
        title: "eCommerce Key Performance Indicators",
        publisher: "U.S. International Trade Administration",
        url: "https://www.trade.gov/ecommerce-key-performance-indicators",
        checked: "2026-09-29"
    },

    repeatCustomers: {
        authors: ["Berntsen, M.", "Manzo, H."],
        year: "2025",
        title: "Customer Acquisition: What You Need To Know",
        details: "University Park, PA: Penn State Extension",
        publisher: "Penn State Extension",
        url: "https://extension.psu.edu/customer-acquisition-what-you-need-to-know",
        checked: "2026-09-29"
    },

    customerLifetime: {
        authors: ["Gupta, S.", "Hanssens, D.", "Hardie, B.", "Kahn, W.", "Kumar, V.", "Lin, N.", "Ravishanker, N.", "Sriram, S."],
        year: "2006",
        title: "Modeling Customer Lifetime Value",
        in: "Journal of Service Research",
        details: "9(2), pp. 139–155",
        publisher: "UCLA Anderson School of Management",
        url: "https://www.anderson.ucla.edu/sites/default/files/documents/areas/fac/marketing/JSR2006(0).pdf",
        checked: "2026-09-29"
    },

    geometricSeries: {
        authors: ["Strang, G.", "Herman, E."],
        year: "2016",
        title: "5.2 Infinite Series",
        in: "Calculus Volume 2",
        inBook: true,
        details: "Houston, TX: OpenStax, Rice University",
        publisher: "OpenStax, Rice University",
        url: "https://openstax.org/books/calculus-volume-2/pages/5-2-infinite-series",
        checked: "2026-09-29"
    },

    texasAssetClasses: {
        authors: ["Texas Department of Family and Protective Services"],
        year: "2011",
        title: "Appendix B: State Property Class Codes",
        in: "Asset Management Handbook",
        inBook: true,
        details: "Austin, TX: Texas DFPS",
        publisher: "Texas DFPS",
        url: "https://dfps.texas.gov/handbooks/Asset_Management/Files/ASM_px_2.asp",
        checked: "2026-10-10"
    },

    frs102Intangibles: {
        authors: ["ACCA"],
        year: "2018",
        title: "FRS 102 intangible assets: what's changed?",
        publisher: "ACCA",
        url: "https://www.accaglobal.com/gb/en/technical-activities/technical-resources-search/2018/april/FRS102-intangible-assets-whats-changed.html",
        checked: "2026-10-12"
    },

    ias38Examples: {
        authors: ["IFRS Foundation"],
        year: "2024",
        title: "IAS 38 Intangible Assets: Illustrative Examples",
        details: "London: IFRS Foundation",
        publisher: "IFRS Foundation",
        url: "https://www.ifrs.org/content/dam/ifrs/publications/html-standards/english/2024/issued/ias38-ie.html",
        checked: "2026-10-12"
    },

    section197Amortisation: {
        authors: ["Internal Revenue Service"],
        year: "2000",
        title: "T.D. 8865: Amortization of Intangible Property",
        details: "Washington, DC: Department of the Treasury",
        publisher: "IRS",
        url: "https://www.eitc.irs.gov/pub/irs-regs/td8865.pdf",
        checked: "2026-10-12"
    },

    strategicPositioning: {
        authors: ["Institute for Strategy and Competitiveness"],
        year: "n.d.",
        title: "Strategic Positioning",
        details: "Boston, MA: Harvard Business School",
        publisher: "Harvard Business School, Institute for Strategy & Competitiveness",
        url: "https://www.isc.hbs.edu/strategy/business-strategy/Pages/strategic-positioning.aspx",
        checked: "2026-10-25"
    },

    positioningStatement: {
        authors: ["Stayman, D."],
        year: "2015",
        title: "How to Write Market Positioning Statements",
        in: "eCornell #IMPACT",
        details: "Cornell University, 20 March",
        publisher: "eCornell, Cornell University",
        url: "https://ecornell-impact.cornell.edu/how-to-write-market-positioning-statements/",
        checked: "2026-10-25"
    },

    positioningTemplate: {
        authors: ["Loy, T."],
        year: "2007",
        title: "E145 Technology Entrepreneurship, Session 6: Entrepreneurial Marketing",
        details: "Stanford, CA: Stanford University",
        publisher: "Stanford University",
        url: "https://web.stanford.edu/class/e145/2007_fall/startup_mktg_details.shtml",
        checked: "2026-10-25"
    },

    buyingRoles: {
        authors: ["The Open University"],
        year: "n.d.",
        title: "3.4 Business decision makers",
        in: "Understanding your customers",
        inBook: true,
        details: "Milton Keynes: The Open University (OpenLearn)",
        publisher: "The Open University",
        url: "https://www.open.edu/openlearn/money-business/understanding-your-customers/content-section-3.4",
        checked: "2026-10-26"
    },

    marketResearch: {
        authors: ["U.S. Small Business Administration"],
        year: "n.d.",
        title: "Market research and competitive analysis",
        publisher: "U.S. Small Business Administration",
        url: "https://www.sba.gov/business-guide/plan-your-business/market-research-competitive-analysis",
        checked: "2026-10-25"
    },

    brandPositioningStatement: {
        authors: ["Allen, S."],
        year: "2024",
        title: "Crafting the Perfect Brand Positioning Statement",
        in: "Business Insights",
        details: "Harvard Business School Online, 29 October",
        publisher: "Harvard Business School Online",
        url: "https://online.hbs.edu/blog/post/brand-positioning-statement",
        checked: "2026-10-25"
    },

    smallCompanyIntangibleLives: {
        authors: ["U.S. Securities and Exchange Commission"],
        year: "2025",
        title: "Intangible Assets: note to the financial statements for the year ended 30 June 2025 (CIK 1520118)",
        details: "Company filing, EDGAR",
        publisher: "SEC (company filing)",
        url: "https://www.sec.gov/Archives/edgar/data/1520118/000147793225007253/R15.htm",
        checked: "2026-10-12"
    },

    /* THE WORKS THE "Based on:" LINES OF THE "i" NAME (owner, 2026-11-10: "Should I add Osterwalder, and the other works named this way, to the References so
       every 'Based on' line links? - Yes"). Each checked on its page on 2026-11-10; a book or an article by its university library or business-school record. */

    elementsOfValue: {
        authors: ["Almquist, E.", "Senior, J.", "Bloch, N."],
        year: "2016",
        title: "The Elements of Value",
        in: "Harvard Business Review",
        details: "September 2016",
        publisher: "Harvard Business School Publishing",
        url: "https://hbsp.harvard.edu/product/R1609C-PDF-ENG",
        checked: "2026-11-10"
    },

    b2bElementsOfValue: {
        authors: ["Almquist, E.", "Cleghorn, J.", "Sherer, L."],
        year: "2018",
        title: "The B2B Elements of Value",
        in: "Harvard Business Review",
        details: "March-April 2018",
        publisher: "Harvard Business School Publishing",
        url: "https://hbsp.harvard.edu/product/R1802D-PDF-ENG",
        checked: "2026-11-10"
    },

    valuePropositionDesign: {
        authors: ["Osterwalder, A.", "Pigneur, Y.", "Bernarda, G.", "Smith, A."],
        year: "2014",
        title: "Value Proposition Design: How to Create Products and Services Customers Want",
        details: "Hoboken, NJ: Wiley (Ulster University Library record)",
        publisher: "Wiley",
        url: "https://catalogue.library.ulster.ac.uk/items/1418575",
        checked: "2026-11-10"
    },

    marketingManagement: {
        authors: ["Kotler, P.", "Keller, K.L.", "Chernev, A."],
        year: "2022",
        title: "Marketing Management",
        details: "16th global edn. Harlow: Pearson (Ulster University Library record)",
        publisher: "Pearson",
        url: "https://catalogue.library.ulster.ac.uk/items/1508547",
        checked: "2026-11-10"
    },

    householdComposition: {
        authors: ["Office for National Statistics"],
        year: "2023",
        title: "Household composition classifications: Census 2021",
        publisher: "Office for National Statistics",
        url: "https://www.ons.gov.uk/census/census2021dictionary/variablesbytopic/demographyvariablescensus2021/householdcomposition/classifications",
        checked: "2026-11-10"
    },

    isco08: {
        authors: ["International Labour Office"],
        year: "2012",
        title: "International Standard Classification of Occupations: ISCO-08",
        details: "Geneva: ILO (United Nations Statistics Division classification record)",
        publisher: "International Labour Office",
        url: "https://unstats.un.org/unsd/classifications/Family/Detail/1067",
        checked: "2026-11-10"
    },

    ukConsumerContracts: {
        authors: ["UK Government"],
        year: "2013",
        title: "The Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013, regulation 28",
        details: "SI 2013/3134",
        publisher: "legislation.gov.uk",
        url: "https://www.legislation.gov.uk/uksi/2013/3134/regulation/28",
        checked: "2026-11-10"
    },

    euConsumerRights: {
        authors: ["European Parliament and Council of the European Union"],
        year: "2011",
        title: "Directive 2011/83/EU on consumer rights",
        details: "Official Journal of the European Union, L 304",
        publisher: "EUR-Lex",
        url: "https://eur-lex.europa.eu/eli/dir/2011/83/oj",
        checked: "2026-11-10"
    },

    ftcCoolingOff: {
        authors: ["Federal Trade Commission"],
        year: "2024",
        title: "Rule Concerning Cooling-Off Period for Sales Made at Homes or at Certain Other Locations, 16 CFR Part 429",
        details: "Washington, DC: U.S. Government Publishing Office",
        publisher: "U.S. Government Publishing Office",
        url: "https://www.govinfo.gov/content/pkg/CFR-2024-title16-vol1/pdf/CFR-2024-title16-vol1-part429.pdf",
        checked: "2026-11-10"
    },

    ontarioConsumerProtection: {
        authors: ["Government of Ontario"],
        year: "2002",
        title: "Consumer Protection Act, 2002, S.O. 2002, c. 30, Sched. A",
        publisher: "Government of Ontario",
        url: "https://www.ontario.ca/laws/statute/02c30",
        checked: "2026-11-10"
    },

    acccDoorToDoor: {
        authors: ["Australian Competition and Consumer Commission"],
        year: "n.d.",
        title: "Telemarketing and door-to-door sales",
        publisher: "ACCC",
        url: "https://www.accc.gov.au/business/selling-products-and-services/telemarketing-and-door-to-door-sales",
        checked: "2026-11-10"
    },

    nzUninvitedSales: {
        authors: ["Commerce Commission New Zealand"],
        year: "n.d.",
        title: "Door-to-door and telemarketing sales",
        publisher: "Commerce Commission",
        url: "https://comcom.govt.nz/consumers/dealing-with-typical-situations/mobile-traders-and-door-to-door-sales/door-to-door-and-telemarketing-sales",
        checked: "2026-11-10"
    }

} satisfies Record<string, Source>;

/** The name of one registered source. */
export type SourceId = keyof typeof SOURCES;
