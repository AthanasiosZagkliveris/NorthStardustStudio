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

/** The channel categories whose subchannels take a fee of each sale (a payment, a website's checkout, a marketplace): their cards show the Fees, and a
 *  subchannel named by the user there has its own row in the Global Settings. */
export const FEE_CHANNEL_CATEGORIES: readonly string[] = ["Direct Payment", "Website", "Marketplace"];

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
/** The rows checked on 2026-11-17 (the owner's yes of 07:16; the coordinator's check against each provider's own page, Library proposals/2026-11-17-fee-rows-check.md). */
const CHECKED_17 = "checked 17/11/2026";

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
    "Stripe Terminal", "Stripe", "SumUp", "Square", "Zettle", "Shopify Payments", "PayPal Point of Sale", "PayPal",
    "Etsy", "Amazon Handmade", "Amazon", "eBay (private seller)", "eBay", "Not On The High Street", "Folksy", "Gumroad", "Fiverr", "Upwork", "TikTok Shop", "Meta checkout", "Wolt"
] as const;

/**
 * WHETHER A PROVIDER SELLS IN A COUNTRY (owner, 2026-11-17 07:16): not where the fee data says it is not available there; a country not given, or a provider the
 * data does not list, counts as offered. Read by the Segment's marketplaces and payment services, so a provider is never suggested where it does not sell.
 */
export function providerOffered(provider: string, country: string | undefined): boolean {
    return !country || !CHANNEL_FEE_DATA.some(row => row.provider === provider && row.country === country && row.status === "not-available");
}

/** A payment service's name in a country: Zettle is PayPal Point of Sale in the US (owner, 2026-11-17 07:16). */
export function paymentServiceName(name: string, country: string | undefined): string {
    return name === "Zettle" && country === "US" ? "PayPal Point of Sale" : name;
}

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
    checked("SumUp", "NZ", "1.7", "0", "0.5", "In person, domestic cards (international cards 2.5%); " + CHECKED_17 + " (sumup.com/en-nz/solo-card-reader)"),

    // (Square: checked 2026-11-17 on its own pages; it does not sell in New Zealand.)
    checked("Square", "GB", "1.75", "0", "0.5", "In person, no fixed fee; " + CHECKED_17 + " (squareup.com/gb/en/pricing)"),
    checked("Square", "IE", "1.75", "0", "0.5", "In person, EU and EEA cards, plus VAT (UK and non-EEA cards add 1.5%); " + CHECKED_17 + " (squareup.com/ie/en/payments/pricing)"),
    checked("Square", "US", "2.6", "0.15", "0.5", "In person; " + CHECKED_17 + " (squareup.com/us/en/pricing)"),
    checked("Square", "CA", "2.5", "0", "0.5", "In person, credit cards (Interac debit 0.75% + C$0.07); " + CHECKED_17 + " (squareup.com/ca/en/payments/our-fees)"),
    checked("Square", "AU", "1.6", "0", "0.5", "In person; " + CHECKED_17 + " (squareup.com/au/en/pricing)"),
    notAvailable("Square", "NZ", "Square does not sell in New Zealand"),

    checked("Zettle", "GB", "1.75", "0", "0.5", "In person; " + CHECKED + " on Zettle's UK pricing page"),
    notChecked("Zettle", "IE", "No official page found for this country"),
    notAvailable("Zettle", "US", "In the US Zettle is PayPal Point of Sale: its own row"),
    notChecked("Zettle", "CA", "No official page found for this country"),
    notChecked("Zettle", "AU", "No official page found for this country"),
    notChecked("Zettle", "NZ", "No official page found for this country"),

    checked("Shopify Payments", "GB", "2", "0.25", "0.5", "Basic plan, online (in person 1.7%); " + CHECKED + " on Shopify's UK pricing page"),
    checked("Shopify Payments", "IE", "2", "0.25", "0.5", "Basic plan, online (in person 1.7%); " + CHECKED + " on Shopify's Ireland pricing page"),
    checked("Shopify Payments", "US", "2.9", "0.30", "0.5", "Basic plan, online (in person 2.6% + $0.10); " + CHECKED + " on Shopify's US pricing page"),
    checked("Shopify Payments", "CA", "2.8", "0.30", "0.5", "Basic plan, online (in person 2.6%); " + CHECKED + " on Shopify's Canada pricing page"),
    checked("Shopify Payments", "AU", "1.7", "0.30", "0.5", "Basic plan, online (in person 1.85%); " + CHECKED + " on Shopify's Australia pricing page"),
    checked("Shopify Payments", "NZ", "2.65", "0.30", "0.5", "Basic plan, online (in person 1.8%); " + CHECKED + " on Shopify's New Zealand pricing page"),

    // (PayPal Point of Sale: Zettle's name in the US, before PayPal so a card named after it takes its own row; checked 2026-11-17.)
    notAvailable("PayPal Point of Sale", "GB", "In the UK it is Zettle: its own row"),
    notAvailable("PayPal Point of Sale", "IE"),
    checked("PayPal Point of Sale", "US", "2.29", "0.09", "0.5", "In person; " + CHECKED_17 + " (paypal.com/us/business/pos-system/pricing)"),
    notAvailable("PayPal Point of Sale", "CA"),
    notAvailable("PayPal Point of Sale", "AU"),
    notAvailable("PayPal Point of Sale", "NZ"),

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
    notAvailable("Amazon Handmade", "IE"),
    checked("Amazon Handmade", "US", "15", "0", "0", "Referral fee, at least $0.30 an item; " + CHECKED_17 + " (sell.amazon.com/programs/handmade)"),
    checked("Amazon Handmade", "CA", "15", "0", "0", "Referral fee; " + CHECKED_17 + " (sell.amazon.ca/programs/handmade)"),
    notAvailable("Amazon Handmade", "AU"),
    notAvailable("Amazon Handmade", "NZ"),

    checked("Amazon", "GB", "15", "0", "0", "Home referral fee: 8% on an item up to £20, 15% above; " + CHECKED + " on Amazon's UK selling fees page"),
    checked("Amazon", "IE", "15", "0", "0", "Referral fee: home 8% on an item up to €20, then 15%; most categories 15%; and €0.99 an item, or €39 a month on the Professional plan; " + CHECKED_17 + " (sellercentral.amazon.ie/welcome/pricing)"),
    checked("Amazon", "US", "15", "0", "0", "Home referral fee; " + CHECKED + " on Amazon's US selling fees page"),
    checked("Amazon", "CA", "15", "0", "0", "Home referral fee; " + CHECKED + " on Amazon's Canada selling fees page"),
    checked("Amazon", "AU", "13", "0", "0", "Home referral fee; " + CHECKED + " on Amazon's Australia selling fees page"),
    notAvailable("Amazon", "NZ", "No Amazon marketplace in New Zealand"),

    // (eBay, checked 2026-11-17: in the UK a private seller pays no final value fee, a business one does; the private row is matched only by its own name.)
    checked("eBay (private seller)", "GB", "0", "0", "0", "A private seller in the UK; " + CHECKED_17 + " (ebay.co.uk help, ids 4822 and 4809)"),
    ...["IE", "US", "CA", "AU", "NZ"].map(country => notAvailable("eBay (private seller)", country, "One rate for every seller here: the eBay row")),
    checked("eBay", "GB", "12.9", "0.30", "0.35", "A business seller: 12.9% + £0.30 an order (£0.40 over £10), and the 0.35% regulatory fee; Home 11.9%; " + CHECKED_17 + " (ebay.co.uk help, ids 4822 and 4809)"),
    notChecked("eBay", "IE", "Not checked yet in Ireland; the 0.35% regulatory fee is known"),
    checked("eBay", "US", "13.6", "0.30", "0", "13.6% + $0.30 an order ($0.40 over $10); " + CHECKED_17 + " (ebay.com seller fees)"),
    checked("eBay", "CA", "13.6", "0.30", "0", "13.6% + C$0.30 an order ($0.40 over $10); " + CHECKED_17 + " (ebay.ca help 4822)"),
    checked("eBay", "AU", "0", "0", "0", "0% up to A$25,000 of sales a year; " + CHECKED_17 + " (ebay.com.au help 4822)"),
    notAvailable("eBay", "NZ", "No eBay site in New Zealand"),

    checked("Not On The High Street", "GB", "25", "0", "0", "25% plus VAT, and a £199 plus VAT joining fee; " + CHECKED_17),
    ...["IE", "US", "CA", "AU", "NZ"].map(country => notAvailable("Not On The High Street", country, "UK sellers only")),

    checked("Folksy", "GB", "6", "0", "0", "6% plus VAT (7.2%), and 15p plus VAT a listing; " + CHECKED_17),
    ...["IE", "US", "CA", "AU", "NZ"].map(country => notAvailable("Folksy", country, "UK sellers only")),

    ...["GB", "IE", "US", "CA", "AU", "NZ"].map(country => checked("Gumroad", country, "10", "0.50", "0", "10% + $0.50 a sale, in every country; " + CHECKED + " on Gumroad's pricing page", "USD")),

    ...["GB", "IE", "US", "CA", "AU", "NZ"].map(country => checked("Fiverr", country, "20", "0", "0", "20% of the order, in every country; " + CHECKED_17 + " (fiverr.com, Fiverr's own guide)")),

    ...["GB", "IE", "US", "CA", "AU", "NZ"].map(country => checked("Upwork", country, "15", "0", "0", "0% to 15% by plan, 15% the rate to use; " + CHECKED_17 + " (upwork.com/i/pricing)")),

    checked("TikTok Shop", "GB", "9", "0", "0", "9% including VAT, varying by category; " + CHECKED_17),
    notChecked("TikTok Shop", "IE", "Not checked yet in Ireland: the rate varies by category"),
    checked("TikTok Shop", "US", "6", "0", "0", "6% for home categories; " + CHECKED_17),
    notAvailable("TikTok Shop", "CA"),
    notAvailable("TikTok Shop", "AU"),
    notAvailable("TikTok Shop", "NZ"),

    notAvailable("Meta checkout", "GB", "Instagram and Facebook Shops send buyers to the seller's own store: Meta charges no selling fee"),
    notAvailable("Meta checkout", "IE"),
    notChecked("Meta checkout", "US", "Checkout moved to the seller's website in 2025"),
    notAvailable("Meta checkout", "CA", "Instagram and Facebook Shops send buyers to the seller's own store: Meta charges no selling fee"),
    notAvailable("Meta checkout", "AU", "Instagram and Facebook Shops send buyers to the seller's own store: Meta charges no selling fee"),
    notAvailable("Meta checkout", "NZ"),

    notAvailable("Wolt", "GB"),
    notAvailable("Wolt", "IE"),
    notAvailable("Wolt", "US"),
    notAvailable("Wolt", "CA"),
    notAvailable("Wolt", "AU"),
    notAvailable("Wolt", "NZ")
];
