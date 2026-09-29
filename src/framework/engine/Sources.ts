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

/** One reference, as the reader sees it and as it was verified. */
export interface Source {

    /** The page's own title, as the publisher gives it. */
    title: string;

    /** Who publishes it, spelled out ("U.S. Small Business Administration"). */
    publisher: string;

    url: string;

    /** The date the page was last opened and found to support the note (YYYY-MM-DD). */
    checked: string;

}

/**
 * Host endings accepted as a class: a government, a university or
 * an academic network, in the United States and its equivalents
 * elsewhere (gov.uk, ac.uk, edu.au, gov.au, ...: a `gov`, `edu` or
 * `ac` label directly before a two-letter country code).
 */
const ACCEPTED_TOP_LABELS = ["gov", "edu"];
const ACCEPTED_COUNTRY_SECOND_LABELS = ["gov", "edu", "ac"];

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
    "bankofengland.co.uk" // Bank of England
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

/** How a source is named where it is cited: "Publisher, “Title”". */
export function sourceLabel(source: Source): string {
    return source.publisher + ", “" + source.title + "”";
}

/**
 * Every reference the app cites, in one place, so each is checked
 * once and reused wherever the same statement is made.
 */
export const SOURCES = {

    breakEvenPoint: {
        title: "Calculate your startup costs: break-even point",
        publisher: "U.S. Small Business Administration",
        url: "https://www.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs/break-even-point",
        checked: "2026-09-29"
    },

    breakEvenInDollars: {
        title: "Calculate a Break-Even Point in Units and Dollars (Franklin, Graybeal, Cooper)",
        publisher: "OpenStax, Rice University",
        url: "https://openstax.org/books/principles-managerial-accounting/pages/3-2-calculate-a-break-even-point-in-units-and-dollars",
        checked: "2026-09-29"
    },

    contributionMargin: {
        title: "Explain Contribution Margin (Franklin, Graybeal, Cooper)",
        publisher: "OpenStax, Rice University",
        url: "https://openstax.org/books/principles-managerial-accounting/pages/3-1-explain-contribution-margin-and-calculate-contribution-margin-per-unit-contribution-margin-ratio-and-total-contribution-margin",
        checked: "2026-09-29"
    },

    capacityUtilisation: {
        title: "Industrial Production and Capacity Utilization (G.17): About",
        publisher: "Board of Governors of the Federal Reserve System",
        url: "https://www.federalreserve.gov/releases/g17/About.htm",
        checked: "2026-09-29"
    },

    loanRepayment: {
        title: "Long Term Loan Repayment Methods (Gutierrez, Dalsted)",
        publisher: "Colorado State University Extension",
        url: "https://extension.colostate.edu/resource/long-term-loan-repayment-methods/",
        checked: "2026-09-29"
    },

    simpleInterest: {
        title: "Simple Interest (Kirk, Contemporary Mathematics)",
        publisher: "OpenStax, Rice University",
        url: "https://openstax.org/books/contemporary-mathematics/pages/6-3-simple-interest",
        checked: "2026-09-29"
    },

    cashRunway: {
        title: "The Bonfire of VC: Cash Burn, the Good, the Bad & the Ugly (Damodaran)",
        publisher: "NYU Stern School of Business",
        url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/blog/CashBurn.pdf",
        checked: "2026-09-29"
    },

    weeksToMonths: {
        title: "29 CFR § 778.113",
        publisher: "Cornell Law School, Legal Information Institute",
        url: "https://www.law.cornell.edu/cfr/text/29/778.113",
        checked: "2026-09-29"
    },

    contrastRatio: {
        title: "WCAG 2.1: contrast ratio",
        publisher: "W3C",
        url: "https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio",
        checked: "2026-09-29"
    },

    referrals: {
        title: "Maximizing the Benefits of Customer Referrals",
        publisher: "Baylor University, Keller Center for Research",
        url: "https://kellercenter.hankamer.baylor.edu/news/story/2019/maximizing-benefits-customer-referrals",
        checked: "2026-09-29"
    },

    websiteConversion: {
        title: "eCommerce Key Performance Indicators",
        publisher: "U.S. International Trade Administration",
        url: "https://www.trade.gov/ecommerce-key-performance-indicators",
        checked: "2026-09-29"
    },

    repeatCustomers: {
        title: "Customer Acquisition: What You Need To Know",
        publisher: "Penn State Extension",
        url: "https://extension.psu.edu/customer-acquisition-what-you-need-to-know",
        checked: "2026-09-29"
    },

    customerLifetime: {
        title: "Modeling Customer Lifetime Value (Gupta et al., Journal of Service Research)",
        publisher: "UCLA Anderson School of Management",
        url: "https://www.anderson.ucla.edu/sites/default/files/documents/areas/fac/marketing/JSR2006(0).pdf",
        checked: "2026-09-29"
    },

    geometricSeries: {
        title: "Infinite Series (Strang, Herman, Calculus Volume 2)",
        publisher: "OpenStax, Rice University",
        url: "https://openstax.org/books/calculus-volume-2/pages/5-2-infinite-series",
        checked: "2026-09-29"
    }

} satisfies Record<string, Source>;
