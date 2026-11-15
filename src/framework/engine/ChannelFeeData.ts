/*
    THE CHANNEL FEE DATA (owner, 2026-11-15 15:10 and 15:11: "only information that is related to the answers should be presented ... But should exist as
    data in the app information for any listed one"): one row for every payment provider and marketplace the app knows, in each of the six first-version
    countries (GB, IE, US, CA, AU, NZ). A row is one of three:
      - checked: its rate read from the provider's own page, with the date in its note;
      - not checked: the provider is there, its rate not read yet (no rate is stored, or a figure from a secondary source, said so in its note);
      - not available: the provider does not sell there (or charges no selling fee there, its note says why).
    A new Organization's Channel Fee Table starts from these rows; the Global Settings show only those of the Organization's country that its answers use.
    A row with no rate is never charged (channelFeeRowFor). The figures here are the one owner; docs 50 and the specifications point here.
*/

export type ChannelFeeStatus = "checked" | "not-checked" | "not-available";

export interface ChannelFeeDatum {
    /** The provider's name as a card or subchannel names it ("Stripe Terminal" before "Stripe": the more particular name first). */
    provider: string;
    /** The country (ISO code). */
    country: string;
    /** The currency of its fixed fee. */
    currency: string;
    status: ChannelFeeStatus;
    commission: string;
    fixedFee: string;
    chargeback: string;
    note: string;
}

/** The six first-version countries and their currencies. */
export const FEE_COUNTRIES: readonly { code: string; currency: string; name: string }[] = [
    { code: "GB", currency: "GBP", name: "UK" },
    { code: "IE", currency: "EUR", name: "Ireland" },
    { code: "US", currency: "USD", name: "the US" },
    { code: "CA", currency: "CAD", name: "Canada" },
    { code: "AU", currency: "AUD", name: "Australia" },
    { code: "NZ", currency: "NZD", name: "New Zealand" }
];

const currencyOf = (country: string): string => FEE_COUNTRIES.find(entry => entry.code === country)?.currency ?? "";
const nameOf = (country: string): string => FEE_COUNTRIES.find(entry => entry.code === country)?.name ?? country;

const CHECKED = "checked 15/11/2026";

/** A checked row. */
function checked(provider: string, country: string, commission: string, fixedFee: string, chargeback: string, note: string, currency = currencyOf(country)): ChannelFeeDatum {
    return { provider, country, currency, status: "checked", commission, fixedFee, chargeback, note };
}

/** A row not checked yet: no rate unless one is given from a secondary source (its note says so). */
function notChecked(provider: string, country: string, note = "", commission = "", fixedFee = ""): ChannelFeeDatum {
    return { provider, country, currency: currencyOf(country), status: "not-checked", commission, fixedFee, chargeback: "", note: note || "Not checked yet in " + nameOf(country) };
}

/** A row where the provider does not sell. */
function notAvailable(provider: string, country: string, note = ""): ChannelFeeDatum {
    return { provider, country, currency: currencyOf(country), status: "not-available", commission: "", fixedFee: "", chargeback: "", note: note || "Not available in " + nameOf(country) };
}

/** The providers, in the order a name is matched (the more particular first). Every one has a row for each of the six countries (a data check). */
export const CHANNEL_FEE_PROVIDERS = [
    "Stripe Terminal", "Stripe", "SumUp", "Zettle", "Shopify Payments", "PayPal",
    "Etsy", "Amazon Handmade", "Amazon", "Gumroad", "Fiverr", "Upwork", "TikTok Shop", "Meta checkout", "Wolt"
] as const;

export const CHANNEL_FEE_DATA: readonly ChannelFeeDatum[] = [
    checked("Stripe Terminal", "GB", "1.4", "0.10", "0.5", "In person, UK cards; " + CHECKED + " on Stripe's UK pricing page"),
    checked("Stripe Terminal", "IE", "1.4", "0.10", "0.5", "In person, EEA cards; " + CHECKED + " on Stripe's Ireland pricing page"),
    checked("Stripe Terminal", "US", "2.7", "0.05", "0.5", "In person; " + CHECKED + " on Stripe's US pricing page"),
    checked("Stripe Terminal", "CA", "2.7", "0.05", "0.5", "In person; " + CHECKED + " on Stripe's Canada pricing page"),
    checked("Stripe Terminal", "AU", "1.65", "0.10", "0.5", "In person; " + CHECKED + " on Stripe's Australia pricing page"),
    checked("Stripe Terminal", "NZ", "2.6", "0.05", "0.5", "In person; " + CHECKED + " on Stripe's New Zealand pricing page"),

    checked("Stripe", "GB", "1.5", "0.20", "0.5", "UK standard cards online (premium UK cards 2.8% + 20p, EEA cards 2.5% + 20p, international cards 3.15% + 20p); " + CHECKED + " on Stripe's UK pricing page"),
    checked("Stripe", "IE", "1.5", "0.25", "0.5", "Standard EEA cards online; " + CHECKED + " on Stripe's Ireland pricing page"),
    checked("Stripe", "US", "2.9", "0.30", "0.5", "Domestic cards online; " + CHECKED + " on Stripe's US pricing page"),
    checked("Stripe", "CA", "2.9", "0.30", "0.5", "Domestic cards online; " + CHECKED + " on Stripe's Canada pricing page"),
    checked("Stripe", "AU", "1.65", "0.30", "0.5", "Standard domestic cards online; " + CHECKED + " on Stripe's Australia pricing page"),
    checked("Stripe", "NZ", "2.65", "0.30", "0.5", "Domestic cards online; " + CHECKED + " on Stripe's New Zealand pricing page"),

    checked("SumUp", "GB", "1.69", "0", "0.5", "In person, the rate for AmEx, premium, credit and non-EU cards (payment links and invoices 2.5%); " + CHECKED + " on SumUp's UK pricing page"),
    checked("SumUp", "IE", "1.69", "0", "0.5", "In person; " + CHECKED + " on SumUp's Ireland pricing page"),
    checked("SumUp", "US", "2.6", "0.10", "0.5", "In person (online 3.5% + $0.15); " + CHECKED + " on SumUp's US pricing page"),
    checked("SumUp", "CA", "2.5", "0", "0.5", "In person, credit cards (debit 0.9%); " + CHECKED + " on SumUp's Canada pricing page"),
    checked("SumUp", "AU", "1.4", "0", "0.5", "In person (payment links 2.1%); " + CHECKED + " on SumUp's Australia pricing page"),
    notChecked("SumUp", "NZ"),

    checked("Zettle", "GB", "1.75", "0", "0.5", "In person; " + CHECKED + " on Zettle's UK pricing page"),
    notChecked("Zettle", "IE"),
    notChecked("Zettle", "US"),
    notChecked("Zettle", "CA"),
    notChecked("Zettle", "AU"),
    notChecked("Zettle", "NZ"),

    checked("Shopify Payments", "GB", "2", "0.25", "0.5", "Basic plan, online (in person 1.7%); " + CHECKED + " on Shopify's UK pricing page"),
    checked("Shopify Payments", "IE", "2", "0.25", "0.5", "Basic plan, online (in person 1.7%); " + CHECKED + " on Shopify's Ireland pricing page"),
    checked("Shopify Payments", "US", "2.9", "0.30", "0.5", "Basic plan, online (in person 2.6% + $0.10); " + CHECKED + " on Shopify's US pricing page"),
    checked("Shopify Payments", "CA", "2.8", "0.30", "0.5", "Basic plan, online (in person 2.6%); " + CHECKED + " on Shopify's Canada pricing page"),
    checked("Shopify Payments", "AU", "1.7", "0.30", "0.5", "Basic plan, online (in person 1.85%); " + CHECKED + " on Shopify's Australia pricing page"),
    checked("Shopify Payments", "NZ", "2.65", "0.30", "0.5", "Basic plan, online (in person 1.8%); " + CHECKED + " on Shopify's New Zealand pricing page"),

    checked("PayPal", "GB", "2.9", "0.30", "1", "UK commercial transactions; " + CHECKED + " (paypal.com/uk/business/paypal-business-fees)"),
    checked("PayPal", "IE", "3.4", "0.35", "1", "Commercial transactions; " + CHECKED + " on PayPal's Ireland fees page"),
    checked("PayPal", "US", "3.49", "0.49", "1", "PayPal Checkout; " + CHECKED + " on PayPal's US fees page"),
    checked("PayPal", "CA", "2.9", "0.30", "1", "Commercial transactions; " + CHECKED + " on PayPal's Canada fees page"),
    checked("PayPal", "AU", "2.9", "0.30", "1", "Commercial transactions; " + CHECKED + " on PayPal's Australia fees page"),
    checked("PayPal", "NZ", "3.4", "0.45", "1", "Commercial transactions; " + CHECKED + " on PayPal's New Zealand fees page"),

    checked("Etsy", "GB", "10.5", "0.20", "0", "6.5% transaction fee + 4% + 20p payment processing, and $0.20 a listing; " + CHECKED + " on Etsy's fee pages"),
    checked("Etsy", "IE", "10.5", "0.30", "0", "6.5% transaction fee + 4% + €0.30 payment processing, and $0.20 a listing; " + CHECKED + " on Etsy's fee pages"),
    checked("Etsy", "US", "9.5", "0.25", "0", "6.5% transaction fee + 3% + $0.25 payment processing, and $0.20 a listing; " + CHECKED + " on Etsy's fee pages"),
    checked("Etsy", "CA", "9.5", "0.25", "0", "6.5% transaction fee + 3% + $0.25 payment processing, and $0.20 a listing; " + CHECKED + " on Etsy's fee pages"),
    checked("Etsy", "AU", "9.5", "0.25", "0", "6.5% transaction fee + 3% + $0.25 payment processing, and $0.20 a listing; " + CHECKED + " on Etsy's fee pages"),
    checked("Etsy", "NZ", "9.5", "0.30", "0", "6.5% transaction fee + 3% + $0.30 payment processing, and $0.20 a listing; " + CHECKED + " on Etsy's fee pages"),

    checked("Amazon Handmade", "GB", "12", "0", "0", "Referral fee; " + CHECKED + " on Amazon's UK Handmade page"),
    notChecked("Amazon Handmade", "IE"),
    notChecked("Amazon Handmade", "US"),
    notChecked("Amazon Handmade", "CA"),
    notChecked("Amazon Handmade", "AU"),
    notChecked("Amazon Handmade", "NZ"),

    checked("Amazon", "GB", "15", "0", "0", "Home referral fee: 8% on an item up to £20, 15% above; " + CHECKED + " on Amazon's UK selling fees page"),
    notChecked("Amazon", "IE"),
    checked("Amazon", "US", "15", "0", "0", "Home referral fee; " + CHECKED + " on Amazon's US selling fees page"),
    checked("Amazon", "CA", "15", "0", "0", "Home referral fee; " + CHECKED + " on Amazon's Canada selling fees page"),
    checked("Amazon", "AU", "13", "0", "0", "Home referral fee; " + CHECKED + " on Amazon's Australia selling fees page"),
    notAvailable("Amazon", "NZ", "No Amazon marketplace in New Zealand"),

    ...["GB", "IE", "US", "CA", "AU", "NZ"].map(country => checked("Gumroad", country, "10", "0.50", "0", "10% + $0.50 a sale, in every country; " + CHECKED + " on Gumroad's pricing page", "USD")),

    ...["GB", "IE", "US", "CA", "AU", "NZ"].map(country => notChecked("Fiverr", country, "20% of the order, in every country, from a secondary source (citing the Fiverr Help Centre); not checked against Fiverr's own page", "20", "0")),

    ...["GB", "IE", "US", "CA", "AU", "NZ"].map(country => notChecked("Upwork", country, "0 to 15% of the work (upwork.com/i/pricing); the rate to use not checked yet")),

    ...["GB", "IE", "US", "CA", "AU", "NZ"].map(country => notChecked("TikTok Shop", country)),

    notAvailable("Meta checkout", "GB", "Instagram and Facebook Shops send buyers to the seller's own store: Meta charges no selling fee"),
    notAvailable("Meta checkout", "IE"),
    notChecked("Meta checkout", "US", "Instagram and Facebook checkout: the selling fee not checked yet"),
    notAvailable("Meta checkout", "CA", "Instagram and Facebook Shops send buyers to the seller's own store: Meta charges no selling fee"),
    notAvailable("Meta checkout", "AU", "Instagram and Facebook Shops send buyers to the seller's own store: Meta charges no selling fee"),
    notAvailable("Meta checkout", "NZ"),

    notChecked("Wolt", "GB", "In the UK (careers.wolt.com/locations); its commission not checked yet"),
    notAvailable("Wolt", "IE"),
    notAvailable("Wolt", "US"),
    notAvailable("Wolt", "CA"),
    notAvailable("Wolt", "AU"),
    notAvailable("Wolt", "NZ")
];
