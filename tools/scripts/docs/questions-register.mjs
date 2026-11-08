/**
 * THE QUESTIONS REGISTER (doc 44): every question of the Foundation's cards, card by card in page order and box by box in the card's order, with its position,
 * its permanent code, the key it is saved under, its words, its control, its limit, when it is asked, its starting value, its options and its "i".
 *
 *   node tools/scripts/docs/questions-register.mjs           write docs/design/questionnaire/44-questions-register.md (npm run docs:index runs it)
 *   node tools/scripts/docs/questions-register.mjs --check   write nothing; fail when doc 44 differs from the code, or when a questionnaire
 *                                                             document (27 to 43) cites a question code the register does not know
 *
 * The words, options, limits and "i" texts are read from the code itself: the engine files (`src/framework/engine/*Questions.ts`) and, for the
 * Organisation and Positioning tiles and the box titles, the editors' shared files (bundled in memory with esbuild, which comes with vite). What the
 * code cannot say is kept in the maps below, one line per question: the doc's permanent CODE, when it is asked (a short summary of the doc's "Asked
 * when"), its starting value, and the retired codes with what replaced them.
 *
 * CODES ARE PERMANENT IDS, NOT POSITIONS (owner, 2026-11-08). Never renumber; reorder freely; the register shows the order. A new question takes the
 * next free code (one line in the card's CODES map); a retired code stays listed as retired with what replaced it (the card's RETIRED list).
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const R = fileURLToPath(new URL("../../../", import.meta.url));
const OUT = "docs/design/questionnaire/44-questions-register.md";
const SCRIPT = "tools/scripts/docs/questions-register.mjs";
const SOURCES = [
    "src/framework/engine/SegmentQuestions.ts",
    "src/framework/engine/ProfileQuestions.ts",
    "src/framework/engine/CompetitorQuestions.ts",
    "src/framework/engine/OfferingQuestions.ts",
    "src/components/interview/editors/legal/shared.tsx",
    "src/components/interview/editors/foundation/shared.tsx"
];
/** The line of doc 44 that names the commit it reflects: docs:check does not compare it (it moves with every commit to the sources). */
const REFLECTS = "Reflects the code at commit ";

/* ---------------------------------------------------------------------------------------------------------------------------------------------
   THE CODE MAP: one line per question. [saved id, doc code, asked when, starting value]. The order of a card's questions is the code's order
   (the engine's list, box by box); a map's order does not matter, except for the Organisation and Positioning tiles, whose questions are written in
   their editor (`useLegalFieldsAndSections.tsx`), so their order is kept here.
   --------------------------------------------------------------------------------------------------------------------------------------------- */

const ORGANISATION = [
    { box: "left", code: "1", id: "organisation.name", label: "Organisation Name", control: "text cell", asked: "always", options: "none (placeholder: \"The legal name of the organisation\")" },
    { box: "left", code: "2", id: "organisation.country", label: "Country", control: "OptionPicker", asked: "always", options: "countries", starts: "none: the browser's country is shown as a hint, never chosen" },
    { box: "left", code: "3", id: "organisation.country", label: "Other country", control: "OptionPicker (searchable)", asked: "Country is Other", options: "every country but the six" },
    { box: "left", code: "4", id: "organisation.subdivision", label: "State or Region (the country's own word)", control: "OptionPicker (searchable)", asked: "the country has a subdivision that changes an answer (registry, tax); frozen until the country is chosen", options: "the country's subdivisions, then Other" },
    { box: "left", code: "5", id: "organisation.addressLine1", label: "Address", control: "StrategyTextArea", asked: "a country is chosen, and its State or Region where that is asked", options: "none (placeholder: the lines in the country's words)" },
    { box: "right", code: "6", id: "organisation.legalForm", label: "Legal Form", control: "OptionPicker", asked: "a country is chosen (frozen until then)", options: "the country's legal forms (doc 34), or the four generic forms", info: "legalForm" },
    { box: "right", code: "7", id: "organisation.legalFormOther", label: "Name the legal form", control: "text cell", asked: "the saved legal form is Other (an older answer only)", options: "none" },
    { box: "right", code: "8", id: "formation.date", label: "Registration Date", control: "DateCellInput", asked: "always, except a sole trader or sole proprietorship in the six countries", options: "a date, not later than today", info: "registrationDate" },
    { box: "right", code: "9", id: "`openingDate` (Global Settings)", label: "Opening Date", control: "DateCellInput", asked: "always", options: "a date", info: "openingDate" },
    { box: "right", code: "10", id: "organisation.activities", label: "Activities", control: "ActivitiesField (up to four rows)", asked: "a country is chosen (frozen until then)", options: "the country's activity cascade, ending in its official code; typed for Other", info: "activities" },
    { box: "under", code: "11", id: "the page's Description (`organisation.mainActivity` until written)", label: "Notes", control: "OptionalNote", asked: "always (optional)", options: "none", info: "mainActivity" }
];
const ORGANISATION_BOXES = { left: "The left column: where the organisation is", right: "The right column: what it is and does", under: "Under both columns" };

const POSITIONING = [
    { box: "left", code: "1", id: "organisation.customerType", label: "Seller & Buyer Relationship", options: "FIRST_VERSION_CUSTOMER_TYPES", limit: "relationship", info: "customerType", asked: "always" },
    { box: "left", code: "2", id: "`organisation.audience` (solo, smb, mid, enterprise)", label: "Audience Specialisation & Scale", options: "AUDIENCE_SCALES", limit: "audience", info: "audienceScale", asked: "B2B is chosen; frozen until a relationship is chosen" },
    { box: "left", code: "3", id: "`organisation.audience` (young, adult, senior)", label: "Buyer's Life-Stage", options: "LIFE_STAGES", limit: "audience", info: "lifeStage", asked: "B2C is chosen" },
    { box: "left", code: "4", id: "`organisation.buyerCategory` (b2c:… and b2b:…)", label: "Buyer's category (with \"(B2C)\" or \"(B2B)\" when both are chosen)", options: "BUYER_CATEGORIES", limit: "one", info: "buyerCategory", asked: "once for each relationship chosen" },
    { box: "left", code: "5", id: "`organisation.endUser` (rel:…)", label: "Buyer & End User relationship", options: "BUYER_USER_RELATIONS", limit: "audience", info: "buyerUserRelation", asked: "the buyer's category is Proxy or Dual-Intent, for that relationship" },
    { box: "left", code: "6", id: "`organisation.endUser` (age:…)", label: "End User's Life-Stage", options: "USER_LIFE_STAGES", limit: "audience", info: "userLifeStage", asked: "B2C with a Proxy or Dual-Intent buyer, and more than one life stage fits (else set, not shown)" },
    { box: "right", code: "7", id: "organisation.purpose", label: "Purpose", options: "PURPOSES", limit: "outcome", info: "purpose", asked: "always; only the purposes that fit the answers above are offered" },
    { box: "under", code: "11", id: "the part's answer, key `positioning`", label: "Notes", options: null, limit: "note", info: null, asked: "always (optional)" }
];
const POSITIONING_BOXES = { left: "The left column: the customers", right: "The right column: what is offered", under: "Under both columns" };
/** Positioning's questions that left the tile (owner, 2026-11-08: "Move all three"): their saved keys stay readable, and each old answer starts its new place. */
const POSITIONING_RETIRED = [
    ["8", "Differentiation (`organisation.differentiation`)", "moved to the Competitor card's Insights & Differentiation, once per Segment after its Competitors: K14 (doc 41); the old answer is its start"],
    ["9", "Outcome for the buyer (`organisation.outcome`)", "moved to the Offering's O4, its one owner, through the crosswalk (doc 34, 5.2a; doc 43); the old answer starts O4's ticks"],
    ["10", "Outcome for the end user (`organisation.outcomeUser`)", "moved to the Segment's End user part (End user, 9), then to each Profile's end-user part: E4 (doc 36, 2.1; 2026-11-08); the old answer is its start"]
];

/** The Segment (doc 35): saved id -> [code, asked when, starts]. The code of a box's question is "Box N, M"; the end user's, "End user, M". */
const SEGMENT_CODES = {
    kind: ["Box 1, 0", "Positioning chose both B2C and B2B, and this is the third Segment or a later one"],
    age: ["Box 1, 1", "the buyer is people; the terms follow the buyer's life stage (Positioning 3)"],
    education: ["Box 1, 2", "the buyer is people and the age is not Minors"],
    work: ["Box 1, 3", "the buyer is people; set to No (not shown) for Active Retirees and Dependent seniors", "from the age group: Minors and Young adults No (then Student), Established to Mature Yes, retirees No (then Retired)"],
    work2: ["Box 1, 4", "Box 1, 3 is No; set to Retired (not shown) for Active Retirees and Dependent seniors", "with Box 1, 3, from the age group"],
    workenv: ["Box 1, 5", "Box 1, 3 is Yes; held back while Planning (owner, 2026-11-08), its saved answer kept"],
    workschedule: ["Box 1, 6", "Box 1, 3 is Yes"],
    workincome: ["Box 1, 7", "Box 1, 3 is Yes; held back while Planning (owner, 2026-11-08), its saved answer kept"],
    income: ["Box 1, 8", "the buyer is people and the age is not Minors"],
    gender: ["Box 1, 9", "the buyer is people"],
    reach: ["Box 2, 1", "always"],
    area: ["Box 2, 2", "Managing or Growing, and Box 2, 1 is the city or town, the state or region, or the country"],
    orgtype: ["Box 3, 1", "the buyer is a business; set (not shown) where the scale leaves one type"],
    size: ["Box 3, 2", "the buyer is a business and not self-employed; set (not shown) where the scale leaves one size"],
    sector: ["Box 3, 3", "the buyer is a business"],
    industry: ["Box 3, 4", "a sector is chosen (that sector's industries)"],
    comfort: ["Box 4, 1", "always"],
    social: ["Box 4, 2", "the buyer is people"],
    discover: ["Box 4, 3", "always (Sales calls or tenders for a business only)"],
    share: ["Box 4, 4", "the buyer is people; held back while Planning (owner, 2026-11-08), its saved answer kept"],
    trigger: ["Box 4, 5", "the buyer is people"],
    path: ["Box 4, 6", "the buyer is people"],
    setting: ["Box 4, 7", "always"],
    pay: ["Box 4, 8", "always", "Digital wallets where they shop on a phone and no way of paying is chosen"],
    authorise: ["Box 4, 9", "the buyer is a business; answered (not shown) for a self-employed customer"],
    tam: ["Box 5, 1", "always"],
    trajectory: ["Box 5, 2", "always"],
    trends: ["Box 5, 3", "always"],
    competition: ["Box 5, 4", "always"],
    "u-age": ["End user, 1", "the Segment's own buyer is Proxy or Dual-Intent; working-age terms only for a business Segment (Young adult to Mature, 2026-11-08); not shown when one term is left"],
    "u-school": ["End user, 2", "the end user is under 18 and the relationship is Parent or guardian, or Caregiver"],
    "u-work": ["End user, 3", "a personal relationship (not a parent or caregiver) or Sponsor or funder; not a Baby or a Child"],
    "u-work2": ["End user, 4", "End user, 3 is No"],
    "u-job": ["End user, 5", "the relationship is Employer, Business partner or Other (business)"],
    "u-orgtype": ["End user, 6", "the relationship is Business serving clients or Professional intermediary"],
    "u-size": ["End user, 7", "as End user, 6, and the clients are not self-employed"],
    "u-comfort": ["End user, 8", "an end user who is not a Baby"]
};
/** The Segment's question asked once in its Competitors column (box `competitors`): listed under the Competitor card, as K14. */
const SEGMENT_ON_COMPETITOR = { differentiation: ["K14", "once per Segment, after its Competitor cards (moved from Positioning 8, 2026-11-08); ordered by Positioning's answers as built", "Positioning's answer saved before 2026-11-08 (`organisation.differentiation`), within the stage's limit; a saved answer wins"] };
/** The Segment's questions that moved on (owner, 2026-11-08): the saved key stays readable and settled, as the start of its new place. */
const SEGMENT_RETIRED = [
    { code: "End user, 9", was: "Outcome for the end user (`u-outcome`; Positioning 10 until 2026-11-08)", by: "each Profile's end-user part: E4 (doc 36, 2.1; 2026-11-08); the Segment's saved answer is its start", owner: "doc 35, The end user" }
];

/** The Profile (doc 36): saved id -> [code, asked when, starts]. A3 and A3b, and the people's and the business's Needs, are one place on the card. */
const PROFILE_CODES = {
    a2: ["A2", "a people Segment whose gender mix is answered and is not 3 (balanced)", "Man where the Segment's gender mix is 1 or 2, Woman where it is 4 or 5"],
    a1: ["A1", "always (held to the Segment's age group)"],
    a7: ["A7", "a people Segment, unless its age group is only Minors"],
    a3: ["A3", "a people Segment whose customers are working (Box 1, 3 is Yes)"],
    a3b: ["A3b", "a business Segment, unless its customers are self-employed (then set to Owner / partner, not shown)", "", "a3"],
    a5: ["A5", "a business Segment, a Segment with an end user, or an age group with Minors", "all five where One person decides; with an end user, Places the order and Makes the final decision; else from the job level"],
    b1: ["B1", "always"],
    c1: ["C1", "always", "from where the Segment shops: a phone, a computer, or both"],
    c2: ["C2", "unless the Segment's online comfort is rated 1"],
    c3: ["C3", "the Segment discovers through online communities / forums"],
    c4: ["C4", "a people Segment that socialises online and in person or mostly in person; every business Segment"],
    d1: ["D1", "unless the Segment buys on impulse or when it urgently needs it", "from the Segment's path: comparing options (reviews), a recommendation (what others recommend)"],
    d2: ["D2", "always", "a formal proposal where the decision has formal procurement; else from online comfort (4 or 5 alone, 1 or 2 a person)"],
    d3: ["D3", "a people Segment"],
    e1: ["E1", "always; in the end user's part where the Segment has an end user"],
    e2: ["E2", "always; in the end user's part where the Segment has an end user"],
    e3: ["E3", "always", "Price where the Segment's household income is rated 1"],
    functional: ["N1", "always (above the numbered list \"Their own tasks\"); in the end user's part where the Segment has an end user"],
    emotional: ["N2", "a people Segment; in the end user's part where it has one"],
    "emotional-b2b": ["N3", "a business Segment; in the end user's part where it has one", "", "emotional"],
    social: ["N4", "a people Segment; in the end user's part where it has one"],
    "social-b2b": ["N5", "a business Segment; in the end user's part where it has one", "", "social"]
};
/**
 * The end user's own questions (doc 36, 2.1; owner, 2026-11-08), saved under `user.questions` on the Profile: saved id -> [code, asked when, starts]. A question the buyer's part
 * asks too keeps its code with the part after it ("A1 (end user)"); a question of the end user's only takes the next free code of its letter (A8, E4). Codes are permanent.
 */
const PROFILE_USER_CODES = {
    a1: ["A1 (end user)", "the Segment has an end user (held to its end-user stage, End user, 1)"],
    a7: ["A7 (end user)", "a people Segment with an end user of 18 or more (End user, 1)"],
    comfort: ["A8", "the Segment has an end user who is not a Baby", "the Segment's End user, 8"],
    outcome: ["E4", "the Segment has an end user (moved from the Segment's End user, 9, 2026-11-08); ordered by Positioning's purposes and life stages", "the Segment's End user, 9 saved before, else Positioning's answer saved before 2026-11-08 (`organisation.outcomeUser`), within the stage's limit; a saved answer wins"]
};
/** Profile questions in the doc that are not built: [code, box, label, control, asked when, after (the saved id they stand after)]. */
const PROFILE_NOT_BUILT = [
    ["A4", "personal", "Which kind of business is it?", "one choice", "a business Segment whose industry is answered", "a3b"],
    ["A6", "personal", "Specialised needs: the optional tick \"Add specialised accessibility or caregiving profiles\", which opens A6a to A6d", "tick", "always (optional)", "a5"],
    ["A6a", "personal", "Do they have specific accessibility or user needs?", "one choice", "the A6 tick is ticked", "a5"],
    ["A6b", "personal", "What is their primary functional limitation category?", "ticks", "A6a is temporary or permanent", "a5"],
    ["A6c", "personal", "Do they balance high-intensity caregiving or family life roles?", "one choice", "the A6 tick is ticked", "a5"],
    ["A6d", "personal", "What is their household or caregiving structure?", "ticks (2 max)", "A6c is any Yes", "a5"]
];
/** Codes the documents list as dropped or merged (doc 36, section 8: the codes of doc 28's Profile). */
const PROFILE_RETIRED = [
    ["P11", "Where do they look (channel categories)", "split into C2, C3 and C4"],
    ["P13", "How do they usually buy", "the Segment asks it (Box 4, 7)"],
    ["P14", "How do they like to pay", "the Segment asks it (Box 4, 8)"],
    ["P15", "Devices", "C1"],
    ["P16", "How comfortable are they online", "the Segment asks it (Box 4, 1)"],
    ["P22", "How is the decision made", "the Segment's Box 4, 9 and A5"]
];
const PROFILE_BOX_TITLES = { goals: "Goals & Desires", challenges: "Challenges & Problems", objections: "Objections", needs: "Needs" };
const PROFILE_SECTION = { personal: "3", psychographics: "4", hubs: "5", habits: "6", goals: "7", challenges: "7", objections: "7", needs: "10" };

/** The Competitor (doc 41): the box of each question (as the card asks them: `PART_QUESTIONS` in `useFoundationSubsections.tsx`), the code is the id in capitals. */
const COMPETITOR_BOXES = [
    ["offerings", ["k1"]], ["market", ["k2", "k3", "k4"]], ["acquisition", ["k5"]], ["experience", ["k6", "k7"]],
    ["swot", ["k8", "k9"]], ["insights", ["k10"]]
];
const COMPETITOR_CONTROLS = {
    k1: "FittingRadioChoice", k4: "RatingScale", k5: "TickField per channel, then OptionPicker per sub-channel", k6: "RatingScaleGroup (selectable, ends in Other)",
    k7: "RatingScaleGroup", k8: "RatingScaleGroup", k9: "RatingScaleGroup", k10: "BusinessTicks"
};
const COMPETITOR_RETIRED = [
    ["K11", "What could you do differently? (its number later on 2026-11-04)", "K10 (renumbered before codes were permanent)"],
    ["K12", "What could you do differently? (its number earlier on 2026-11-04)", "K10 (renumbered before codes were permanent)"],
    ["K13", "What could you do differently? (its first number, 2026-11-04)", "K10 (renumbered before codes were permanent)"]
];

/** The Offering (doc 43): saved id -> [code, asked when, starts]. */
const OFFERING_CODES = {
    o1: ["O1", "the Type is chosen (the forms follow it)"],
    o2: ["O2", "always", "from the business stage: Planning, Still being built; Launching to Growing, Yes, now"],
    o3: ["O3", "always"],
    o3t: ["O3b", "always (the second row of O3's band)"],
    o4: ["O4", "always", "from the Segment's Differentiation (K14), then the buyer's outcome saved on Positioning before 2026-11-08, through the value crosswalk (up to three)"],
    o6: ["O6", "always", "from O1 (a physical item: Posted / shipped; a digital file: Sent automatically online; and so on)"],
    o7: ["O7", "always"],
    o8: ["O8", "a Profile of the Segment ticked a worry in E3 other than Support"],
    o10: ["O10", "the Type is Service or Hybrid"],
    o14: ["O14", "always"],
    o15: ["O15", "always"],
    o16: ["O16", "always from Launching; held back while Planning (owner, 2026-11-08), its saved answer kept"],
    o17: ["O17", "always from Launching; held back while Planning (owner, 2026-11-08), its saved answer kept"],
    o18: ["O18", "always"]
};
const OFFERING_NOT_BUILT = [
    ["O12", "Is a minimum age to buy it set by law?", "no longer a question: a derived Review item from the activities and the country (proposed, owner 2026-11-06)"]
];
const OFFERING_RETIRED = [
    ["O5", "Benefits (merged)", "O4 (merged 2026-10-26)"],
    ["O9", "What else is included", "the Content & Scope Notes, and O14"],
    ["O11", "What they spend on (doc 28, 6.8)", "not asked: nothing would read it (kept as a thought)"],
    ["O13", "What job does it do for them?", "the Profile's Functional need (doc 36, section 10) and Functional Needs Addressed (retired 2026-11-07)"]
];

/** False positives of the citation check: a token in a questionnaire document that looks like a question code and is not one. [doc number, token, why]. */
const CITATION_ALLOW = [
    ["28", "C5", "doc 28's own earlier ids (the withdrawn list of 2026-10-26), not a Profile code"],
    ["29", "C5", "doc 29's earlier founder question (\"Do you plan to hire?\", merged into its C4), not a Profile code"]
];

/* --------------------------------------------------------------------------------------------------------------------------------------------- */

/** The definitions, bundled in memory: the engine files run as they are; the editors' shared files need their JSX, CSS imports and React. */
async function loadCode() {
    const entry = [
        "export * as segment from './src/framework/engine/SegmentQuestions.ts';",
        "export * as profile from './src/framework/engine/ProfileQuestions.ts';",
        "export * as competitor from './src/framework/engine/CompetitorQuestions.ts';",
        "export * as offering from './src/framework/engine/OfferingQuestions.ts';",
        "export * as legal from './src/components/interview/editors/legal/shared.tsx';",
        "export * as foundation from './src/components/interview/editors/foundation/shared.tsx';",
        "export { ratingScaleMeaning } from './src/components/controls/RatingScaleEnds.tsx';",
        "export { FIRST_VERSION_COUNTRIES } from './src/framework/engine/LegalEntityJurisdictions.ts';"
    ].join("\n");
    const out = await build({
        stdin: { contents: entry, resolveDir: R, loader: "ts" }, bundle: true, write: false, format: "esm", platform: "node",
        jsx: "automatic", loader: { ".css": "empty" }, logLevel: "error"
    });
    return import("data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64"));
}

const cell = text => String(text ?? "").replace(/\|/g, "/").replace(/\s*\n\s*/g, " ").trim() || "–";
const list = options => options.map(option => option.label).join("; ");
/** An "i" point as shown: a string, or a source ("Based on: …"). */
const point = entry => typeof entry === "string" ? entry
    : entry && entry.source ? (entry.title ?? "Based on") + ": " + [entry.source.authors?.join(", "), entry.source.year && "(" + entry.source.year + ")", entry.source.title].filter(Boolean).join(" ")
        : String(entry);
const STAGES = [["plan", "Planning"], ["launch", "Launching"], ["manage", "Managing"], ["grow", "Growing"]];

function rows(code) {
    const { segment: S, profile: P, competitor: C, offering: O, legal: L, foundation: F, ratingScaleMeaning, FIRST_VERSION_COUNTRIES } = code;
    const cards = [];
    const control = (question, options) => question.number ? "NumberCell"
        : question.rating && question.many ? "RatingScaleGroup (selectable)"
            : question.rating ? "RatingScale"
                : question.many ? "BusinessTicks" + (question.other ? " (ends in Other, written in)" : "")
                    : S.segmentRowChoice({ ...question, box: "demographics", many: false }, options) ? "FittingRadioChoice" : "RadioChoice";
    const ratingInfo = question => question.rating ? [ratingScaleMeaning(question.rating), ...question.info] : [...question.info];
    const ratingOptions = question => question.many
        ? "ticked, then each rated 1 to 5: " + list(question.options)
        : "the points 1 to 5 (" + question.rating.low + " to " + question.rating.high + ")";

    /* ---- Organisation ---- */
    {
        const region = new Intl.DisplayNames(["en-GB"], { type: "region" });
        const countries = [...FIRST_VERSION_COUNTRIES].map(id => region.of(id)).sort().join("; ") + "; then Other";
        const info = key => key === "activities"
            ? [L.activitiesInfo("GB") + " (for the United Kingdom; each of the six names its own scheme)", "For Other: " + L.activitiesInfo("")]
            : key ? L.INFO[key].map(point) : [];
        cards.push({
            title: "Organisation", where: "Identity System, page 1, the tile Organisation", owner: "37",
            source: "the order and the controls of `src/components/interview/editors/legal/useLegalFieldsAndSections.tsx` (kept in this script), the \"i\" texts from `INFO` in `legal/shared.tsx`",
            boxes: Object.entries(ORGANISATION_BOXES).map(([box, title]) => ({
                title,
                questions: ORGANISATION.filter(entry => entry.box === box).map(entry => ({
                    code: entry.code, id: entry.id, label: entry.label, control: entry.control, max: "", asked: entry.asked, starts: entry.starts ?? "",
                    status: "built", owner: "doc 37, " + entry.code,
                    options: entry.options === "countries" ? countries : entry.options, info: info(entry.info)
                }))
            }))
        });
    }

    /* ---- Positioning ---- */
    {
        const limits = kind => kind === "one" ? "1" : kind === "note" ? "" : STAGES.map(([stage]) => L.choiceLimit(stage, kind) ?? "any").join(" / ");
        const optionsOf = name => name === null ? "none" : name === "BUYER_USER_RELATIONS"
            ? "a consumer buyer: " + list(L.BUYER_USER_RELATIONS.b2c) + ". A business buyer: " + list(L.BUYER_USER_RELATIONS.b2b) + " (only those that fit the category and the life stages)"
            : list(L[name]);
        cards.push({
            title: "Positioning", where: "Identity System, page 1, the tile named by the stage: Early Positioning (Planning, Launching), Core Market Positioning (Managing), Corporate & Portfolio Positioning (Growing)", owner: "38",
            source: "the order of `useLegalFieldsAndSections.tsx` (kept in this script); the options, the limits (`choiceLimit`) and the \"i\" texts from `legal/shared.tsx`. Max is by stage: Planning / Launching / Managing / Growing. Every \"i\" also carries the stage's line (\"At this stage (Planning): choose one. …\")",
            boxes: Object.entries(POSITIONING_BOXES).map(([box, title]) => ({
                title,
                questions: POSITIONING.filter(entry => entry.box === box).map(entry => ({
                    code: entry.code, id: entry.id, label: entry.label,
                    control: entry.limit === "note" ? "OptionalNote" : entry.limit === "one" ? "RadioChoice" : "RadioChoice at 1, BusinessTicks above",
                    max: limits(entry.limit), asked: entry.asked, starts: "", status: "built", owner: "doc 38, " + entry.code,
                    options: optionsOf(entry.options), info: entry.info ? L.INFO[entry.info].map(point) : ["none (the guidance on the statement is on the \"i\" of the dialog's title)"]
                }))
            })),
            retired: POSITIONING_RETIRED.map(([code, was, by]) => ({ code, was, by, owner: "doc 38, 8 to 10" }))
        });
    }

    /* ---- Segment ---- */
    {
        // The End user part stands right after who the buyer is (owner, 2026-11-08, P9a): after Demographics (a business Segment's: after Business Data, which comes first there).
        const boxes = F.SUBSECTIONS.segments.segmentDescription.flatMap(part => part.id === "demographics" ? [[part.id, part.title], ["user", "End user"]] : [[part.id, part.title]]);
        const boxNumber = { demographics: 1, geographics: 2, "business-data": 3, purchasing: 4, "market-size": 5 };
        const kind = {
            id: "kind", box: "demographics", label: "Who is this Segment's customer?", many: false,
            options: [{ id: "people", label: "People (B2C)" }, { id: "business", label: "Businesses (B2B)" }],
            info: ["The Segment is one group: people, or businesses.", "Choosing one changes the questions asked; answers that no longer apply are removed."]
        };
        const questions = [kind, ...S.SEGMENT_QUESTIONS];
        cards.push({
            title: "Segment", where: "Business System, page 1, the Segment's Description (the end user's part in the same card)", owner: "35",
            source: "`SEGMENT_QUESTIONS` in `src/framework/engine/SegmentQuestions.ts` (the card adds Box 1, 0; the Differentiation, saved here too, is listed under the Competitor card as K14); saved under `questions` on the Segment. Max of End user, 9 is by stage: Planning / Launching / Managing / Growing. The words are a direct buyer's (\"your customers\"); a Proxy or Dual-Intent buyer reads \"your buyers\", and the end user's part \"your end users\" (`segmentWho`)",
            boxes: boxes.map(([box, title]) => ({
                title,
                questions: questions.filter(question => question.box === box && !question.startsProfile).map(question => {
                    const [code, asked, starts] = SEGMENT_CODES[question.id] ?? missing("Segment", question.id);
                    const moved = question.fromPositioning;
                    const options = question.rating ? ratingOptions(question)
                        : question.id === "industry" ? S.SEGMENT_SECTORS.map(sector => sector.label + ": " + S.SEGMENT_INDUSTRIES.filter(entry => entry.sector === sector.id).map(entry => entry.label).join(", ")).join(". ")
                            : list(question.options);
                    return {
                        code, id: question.id === "kind" ? "the Description's `" + F.OPTIONAL_DESCRIPTION_PART + "` key, present or not" : question.id,
                        label: question.label, control: moved ? "RadioChoice at 1, BusinessTicks above" : control(question, question.options), max: moved ? STAGES.map(([stage]) => L.choiceLimit(stage, "outcome") ?? "any").join(" / ") : question.max ?? "", asked, starts: starts ?? "",
                        status: "built", owner: "doc 35, " + (box === "user" ? "The end user" : "Box " + boxNumber[box]), options, info: ratingInfo(question)
                    };
                })
            })),
            retired: SEGMENT_RETIRED
        });
    }

    /* ---- Profile ---- */
    {
        const boxes = [
            ...F.SUBSECTIONS.segments.profileDescription.map(part => [part.id, part.title]),
            ...Object.entries(PROFILE_BOX_TITLES)
        ];
        cards.push({
            title: "Profile", where: "Business System, page 1, a Profile of a Segment; where the Segment's buyer is Proxy or Dual-Intent, in two parts, the buyer and the end user (doc 36, 2.1)", owner: "36",
            source: "`PROFILE_QUESTIONS` in `src/framework/engine/ProfileQuestions.ts`; saved under `questions` on the Profile (a rating as `<id>-rating`, an Other as `<id>-other`). The words say \"this person\" until A2 is answered (`profileWho`). A3 and A3b, and the people's and the business's Needs, are one place on the card (one or the other is asked). Where the Segment has an end user, E1, E2 and the Needs stand in the end user's part (`profilePartOf`), written of the end user, the others in the buyer's; the end user's own questions (`PROFILE_USER_QUESTIONS`) are listed last, saved under `user.questions`",
            boxes: boxes.map(([box, title]) => {
                const built = P.PROFILE_QUESTIONS.filter(question => question.box === box).map(question => {
                    const [code, asked, starts, place] = PROFILE_CODES[question.id] ?? missing("Profile", question.id);
                    const options = question.number ? "a number of years, within the Segment's age group"
                        : question.rating ? ratingOptions(question) : question.options.map(option => option.id === "other" && question.other ? "Other (written in)" : option.label).join("; ");
                    return {
                        code, id: question.id, label: P.profileWho(question.label), control: control(question, question.options), max: question.max ?? "", asked, starts: starts ?? "",
                        status: "built", owner: "doc 36, " + (PROFILE_SECTION[box] === "10" ? "10" : code), options, info: ratingInfo(question), place, after: question.id
                    };
                });
                for (const [code, inBox, label, kindOf, asked, after] of PROFILE_NOT_BUILT.filter(entry => entry[1] === box)) {
                    const at = built.findLastIndex(entry => entry.after === after || entry.notAfter === after);
                    built.splice(at + 1, 0, { code, id: "–", label, control: kindOf, max: "", asked, starts: "", status: "not built", owner: "doc 36, " + code.slice(0, 2), notAfter: after, unplaced: true });
                }
                return { title, questions: built };
            }).concat([{
                title: "The end user's own questions (a Segment whose buyer is Proxy or Dual-Intent)",
                questions: P.PROFILE_USER_QUESTIONS.map(question => {
                    const [code, asked, starts] = PROFILE_USER_CODES[question.id] ?? missing("Profile (end user)", question.id);
                    const outcome = question.id === "outcome";
                    const options = question.number ? "a number of years, within the Segment's end-user stage"
                        : question.rating ? ratingOptions(question) : list(question.options);
                    return {
                        code, id: "`user.questions." + question.id + "`", label: P.profileUserWho(question.label),
                        control: outcome ? "RadioChoice at 1, BusinessTicks above" : control(question, question.options),
                        max: outcome ? STAGES.map(([stage]) => L.choiceLimit(stage, "outcome") ?? "any").join(" / ") : question.max ?? "", asked, starts: starts ?? "",
                        status: "built", owner: "doc 36, 2.1", options, info: ratingInfo(question)
                    };
                })
            }]),
            retired: PROFILE_RETIRED.map(([code, was, by]) => ({ code, was, by, owner: "doc 36, 8" }))
        });
    }

    /* ---- Competitor ---- */
    {
        const TYPES = ["direct", "indirect", "substitutes", "internal", "status-quo"];
        const typeNames = Object.fromEntries(TYPES.map((id, at) => [id, F.SUBSECTIONS.competitors.type[at].title]));
        const titles = { ...Object.fromEntries(F.SUBSECTIONS.competitors.description.map(part => [part.id, part.title])), swot: "Competitors SWOT Analysis", insights: "Insights & Differentiation" };
        const OPTIONS = {
            k1: list(C.COMPETITOR_OFFER_OPTIONS),
            k2: list(C.COMPETITOR_REACH_OPTIONS),
            k3: list(C.COMPETITOR_SIZE_OPTIONS),
            k4: "the points 1 to 5 (" + C.COMPETITOR_RATINGS.k4.low + " to " + C.COMPETITOR_RATINGS.k4.high + ")",
            k5: C.COMPETITOR_CHANNEL_OPTIONS.map(channel => channel.label + (C.COMPETITOR_SUBCHANNELS[channel.id] ? " (" + list(C.COMPETITOR_SUBCHANNELS[channel.id]) + ")" : "")).join("; "),
            k6: "the review platforms in the order of the industry and the country, each ticked then rated 1 to 5: " + C.REVIEW_PLATFORMS.map(entry => entry.label + (entry.countries ? " (" + entry.countries.join(", ") + ")" : "")).join("; ") + "; Other (written in)",
            k7: "rows, each rated 1 to 5 (Hard to Easy): " + list(C.COMPETITOR_STAGES),
            k8: "rows, each rated 1 to 5 (Weak to Strong), the Profiles' highest rated first: " + list(C.COMPETITOR_VALUES),
            k9: "rows, each rated 1 to 5 (Threat to Opportunity), the Segment's ticked changes first: " + list(C.COMPETITOR_CHANGES),
            k10: "from the answers above (`competitorOpenings`): the openings each answer makes"
        };
        cards.push({
            title: "Competitor", where: "Business System, page 1, a Competitor of a Segment", owner: "41",
            source: "`CompetitorQuestions.ts` (the words by type, `competitorWording`; who is asked, `competitorAsks`; the options and the \"i\", `COMPETITOR_INFO`); the box of each question and its control as the card asks them (`useFoundationSubsections.tsx`, kept in this script); saved under `questions` on the Competitor",
            boxes: COMPETITOR_BOXES.map(([box, ids]) => ({
                title: titles[box],
                questions: [...ids.map(id => {
                    const asked = TYPES.filter(type => C.competitorAsks(type, id));
                    const words = TYPES.filter(type => type !== "direct" && C.competitorWording(type, id) !== C.competitorWording("direct", id))
                        .map(type => typeNames[type] + ": \"" + C.competitorWording(type, id) + "\"");
                    const rating = C.COMPETITOR_RATINGS[id];
                    const info = [...(rating ? [ratingScaleMeaning(rating)] : []), ...C.COMPETITOR_INFO[id], ...(id === "k6" ? C.REVIEW_PLATFORM_EXAMPLES : []), ...(id === "k8" ? ["(where a Profile chose a value) " + C.COMPETITOR_BAND_LINE] : []), ...(id === "k10" ? ["(and the values that are hard to beat, from the answers above)"] : [])];
                    const radio = S.segmentRowChoice({ id, label: "", box: "demographics", many: false, options: [] }, { k2: C.COMPETITOR_REACH_OPTIONS, k3: C.COMPETITOR_SIZE_OPTIONS }[id] ?? []) ? "FittingRadioChoice" : "RadioChoice";
                    return {
                        code: id.toUpperCase(), id, label: C.competitorWording("direct", id), control: COMPETITOR_CONTROLS[id] ?? radio, max: id === "k10" ? 3 : "",
                        asked: (asked.length === TYPES.length ? "every type" : asked.map(type => typeNames[type]).join(", ")) + (id === "k10" ? ", once an opening exists" : "") + (C.COMPETITOR_HELD_WHILE_PLANNING.includes(id) ? "; held back while Planning (owner, 2026-11-08), its saved answer kept" : ""),
                        starts: "", status: "built", owner: "doc 41, " + id.toUpperCase(), options: OPTIONS[id], info, words
                    };
                }), ...(box === "insights" ? Object.entries(SEGMENT_ON_COMPETITOR).map(([id, [code, asked, starts]]) => {
                    const question = S.SEGMENT_QUESTIONS.find(entry => entry.id === id) ?? missing("Competitor", id);
                    return {
                        code, id: "`" + id + "` on the Segment (`questions`)", label: question.label, control: "RadioChoice at 1, BusinessTicks above",
                        max: STAGES.map(([stage]) => L.choiceLimit(stage, "outcome") ?? "any").join(" / "), asked, starts, status: "built", owner: "doc 41, " + code,
                        options: list(L.DIFFERENTIATIONS), info: L.INFO.differentiation.map(point)
                    };
                }) : [])]
            })),
            retired: COMPETITOR_RETIRED.map(([code, was, by]) => ({ code, was, by, owner: "doc 41, Numbers changed on 2026-11-04" }))
        });
    }

    /* ---- Value Proposition ---- */
    cards.push({ title: "Value Proposition", where: "Business System, page 1, the Segment's Value Proposition", owner: "42", none: "No questions: the tile shows a draft sentence and the open items, read from the answers of the cards above (`valuePropositionDraft`, `valuePropositionOpenItems` in `OfferingQuestions.ts`); doc 42 holds it." });

    /* ---- Offering ---- */
    {
        const hybrid = { type: "Hybrid", worries: P.PROFILE_QUESTIONS.find(question => question.id === "e3").options.map(option => option.id) };
        const optionsOf = id => id === "o1"
            ? "Product: " + list(O.offeringOptions("o1", { type: "Product" })) + ". Service: " + list(O.offeringOptions("o1", { type: "Service" })) + ". Hybrid: both"
            : id === "o3" ? list(O.offeringOptions("o3", {})) + " (A project or contract first where the Segment pays by invoice)"
                : id === "o8" ? "from the Profiles' E3 ticks (Support left out: O7 answers it): " + list(O.offeringOptions("o8", hybrid))
                    : id === "o4" ? list(O.offeringOptions("o4", {})) + " (the list of B1 and K8)"
                        : list(O.offeringOptions(id, {}));
        const notBuilt = OFFERING_NOT_BUILT.map(([code, label, asked]) => ({ code, id: "–", label, control: "none", max: "", asked, starts: "", status: "not built", owner: "doc 43, " + code, unplaced: true }));
        cards.push({
            title: "Offering", where: "Business System, page 1, an Offering of a Segment", owner: "43",
            source: "`OFFERING_QUESTIONS` and `OFFERING_BOX_QUESTIONS` in `src/framework/engine/OfferingQuestions.ts` (the options, `offeringOptions`); saved under `questions` on the Offering. Under the name the card asks the Type (Product, Service, Hybrid), and the Customer Benefit box opens with the Functional Needs Addressed (ticks of the Profiles' numbered tasks; owner, 2026-11-08), neither of them a coded question",
            boxes: F.SUBSECTIONS.offerings.description.map(part => ({
                title: part.title,
                questions: [...(O.OFFERING_BOX_QUESTIONS[part.id] ?? []).flat().map(id => {
                    const question = O.OFFERING_QUESTIONS.find(entry => entry.id === id);
                    const [code, asked, starts] = OFFERING_CODES[id] ?? missing("Offering", id);
                    const shown = O.offeringOptions(id, id === "o8" ? hybrid : { type: "Hybrid" });
                    return {
                        code, id, label: question.label, control: control(question, shown), max: question.max ?? "", asked, starts: starts ?? "",
                        status: "built", owner: "doc 43, " + code.split(" ")[0], options: optionsOf(id),
                        info: id === "o18" ? [...question.info, "(With the Organisation's country chosen, the second line is that country's rule, and its source ends the list, for example: " + O.offeringInfo("o18", { type: "Hybrid", country: "GB" }).slice(1, -2).join(" ") + ")"] : [...question.info]
                    };
                }), ...(part.id === "requirements" ? notBuilt : [])]
            })),
            retired: OFFERING_RETIRED.map(([code, was, by]) => ({ code, was, by, owner: code === "O13" ? "doc 43, O13" : "doc 43, Decided, and still to decide" }))
        });
    }

    // Every engine question has a code, and no code is used twice on a card.
    for (const card of cards) {
        const codes = [...(card.boxes ?? []).flatMap(box => box.questions.map(question => question.code)), ...(card.retired ?? []).map(entry => entry.code)];
        const twice = codes.filter((entry, at) => codes.indexOf(entry) !== at);
        if (twice.length) throw new Error(card.title + ": the code " + twice.join(", ") + " is used twice");
    }
    return cards;
}

function missing(card, id) {
    throw new Error(card + ": the question `" + id + "` has no code. Add one line for it to the card's CODES map in " + SCRIPT + " (the next free code; never reuse one).");
}

function render(cards, commit) {
    const md = [
        "# 44. The questions register",
        "",
        "Generated by `node " + SCRIPT + "` (run by `npm run docs:index`; checked by `npm run docs:check`) from the question definitions in the code (`src/framework/engine/SegmentQuestions.ts`, `ProfileQuestions.ts`, `CompetitorQuestions.ts`, `OfferingQuestions.ts`, `src/components/interview/editors/legal/shared.tsx`, `src/components/interview/editors/foundation/shared.tsx`) and the code map kept in the script. Do not edit by hand.",
        "",
        "Status: **generated**, written 2026-11-08. Every question of the Foundation's cards, card by card in page order and box by box in the card's order: its position, its permanent code, the key it is saved under, its words, control, limit, when it is asked, its starting value, its status and the document that owns it; under each box, its options and its \"i\".",
        "",
        REFLECTS + "`" + commit + "` (the last commit that changed the files the questions are read from; `npm run docs:check` does not compare this line).",
        "",
        "Related: doc 37 (the Organisation), doc 38 (Positioning), doc 35 (the Segment), doc 36 (the Profile), doc 41 (the Competitor), doc 42 (the Value Proposition), doc 43 (the Offering), doc 40 (the form of a tile document), [the standard of the documents](../../standard.md).",
        "",
        "> **Codes are permanent ids, not positions (owner, 2026-11-08).** Never renumber; reorder freely; the register shows the order. A new question takes the next free code; a retired code stays listed as retired with what replaced it.",
        "",
        "**How to read it.** *Pos* is the place on the card, counted in the code's order box by box (two questions that stand in one place, one or the other asked, share it; a question not built has none). *Code* is the permanent id the documents cite. *Saved id* is the key in the saved data. *Control* is the existing component that draws it (for a radio, as its full list of options draws it: a radio of short options stands in one row, `FittingRadioChoice`). *Max* is the most ticks allowed. *Asked when* and *Starts* are short; the owner document says them in full. *Status*: built, not built, or retired with what replaced it. Under each box: the options as shown (or where they come from) and the \"i\" as shown. A new question needs one line in the script's code map, or the script stops and names it.",
        ""
    ];
    const counts = [];
    cards.forEach((card, at) => {
        const n = at + 1;
        md.push("## " + n + ". " + card.title, "");
        md.push("*" + card.where + ". Owner: doc " + card.owner + ".*" + (card.source ? " From " + card.source + "." : ""), "");
        if (card.none) {
            md.push(card.none, "");
            counts.push([card.title, 0, 0, 0]);
            return;
        }
        let pos = 0;
        const placed = {};
        let built = 0, notBuilt = 0;
        card.boxes.forEach((box, boxAt) => {
            md.push("### " + n + "." + (boxAt + 1) + " " + box.title, "");
            if (box.questions.length === 0) { md.push("No question.", ""); return; }
            md.push("| Pos | Code | Saved id | Label | Control | Max | Asked when | Starts | Status | Owner |", "|---|---|---|---|---|---|---|---|---|---|");
            for (const question of box.questions) {
                let shownPos = "–";
                if (!question.unplaced) {
                    if (question.place && placed[question.place]) shownPos = placed[question.place];
                    else { pos += 1; shownPos = String(pos); placed[question.id] = shownPos; }
                }
                if (question.status === "built") built += 1; else notBuilt += 1;
                md.push("| " + [shownPos, question.code, (/^[\w.-]+$/.test(question.id) ? "`" + question.id + "`" : question.id), question.label, question.control, question.max, question.asked, question.starts, question.status, question.owner].map(cell).join(" | ") + " |");
            }
            md.push("");
            for (const question of box.questions.filter(entry => entry.options !== undefined)) {
                md.push("- **" + question.code + ". " + question.label + "**");
                if (question.words?.length) md.push("  - Words by type: " + question.words.join("; ") + ".");
                md.push("  - Options: " + cell(question.options) + ".");
                if (question.info.length === 0) md.push("  - \"i\": none.");
                else {
                    md.push("  - \"i\":");
                    for (const entry of question.info) md.push("    - " + cell(entry));
                }
            }
            md.push("");
        });
        const retired = card.retired ?? [];
        md.push("### " + n + "." + (card.boxes.length + 1) + " Retired codes", "");
        if (retired.length === 0) md.push("None.", "");
        else {
            md.push("| Code | Was | Status | Replaced by | Owner |", "|---|---|---|---|---|");
            for (const entry of retired) md.push("| " + [entry.code, entry.was, "retired", entry.by, entry.owner].map(cell).join(" | ") + " |");
            md.push("");
        }
        counts.push([card.title, built, notBuilt, retired.length]);
    });
    md.push("## " + (cards.length + 1) + ". The count", "", "| Card | Built | Not built | Retired |", "|---|---|---|---|");
    for (const [title, built, notBuilt, retired] of counts) md.push("| " + title + " | " + built + " | " + notBuilt + " | " + retired + " |");
    const total = counts.reduce((sum, entry) => [sum[0] + entry[1], sum[1] + entry[2], sum[2] + entry[3]], [0, 0, 0]);
    md.push("| **All** | **" + total[0] + "** | **" + total[1] + "** | **" + total[2] + "** |", "");
    return md.join("\n");
}

/** Every code the register knows, for the citation check: the built, the not built and the retired, of the cards whose codes are cited as tokens. */
export function knownCodes(cards) {
    return new Set(cards.flatMap(card => [...(card.boxes ?? []).flatMap(box => box.questions.map(question => question.code)), ...(card.retired ?? []).map(entry => entry.code)]));
}

/**
 * The citations of the questionnaire documents (27 to 43): a token shaped as an Offering code (O1), a Competitor code (K1) or a Profile code (A1 to E3,
 * with a letter after it as A3b) that the register does not know. Links and URLs are left out; a line that says "retired" is not checked; the allow-list
 * holds the false positives.
 */
function citations(known) {
    const dir = R + "docs/design/questionnaire/";
    const found = [];
    for (const name of readdirSync(dir).filter(file => /^(2[7-9]|3\d|4[0-3])-.*\.md$/.test(file))) {
        const doc = name.slice(0, 2);
        readFileSync(dir + name, "utf8").replace(/\r\n/g, "\n").split("\n").forEach((line, at) => {
            if (/retired/i.test(line)) return;
            const text = line.replace(/\]\([^)]*\)/g, "]").replace(/https?:\/\/\S+/g, "");
            for (const match of text.matchAll(/\b(?:O\d{1,2}|K\d{1,2}|[A-E]\d{1,2}[a-d]?)\b/g)) {
                const token = match[0];
                if (known.has(token) || CITATION_ALLOW.some(([inDoc, allowed]) => inDoc === doc && allowed === token)) continue;
                found.push(name + ":" + (at + 1) + "  " + token);
            }
        });
    }
    return found;
}

const git = args => { try { return execSync("git " + args, { cwd: R, encoding: "utf8" }).trim(); } catch { return ""; } };

async function main() {
    const check = process.argv.includes("--check");
    const cards = rows(await loadCode());
    const commit = git("log -1 --format=%h -- " + SOURCES.map(path => "\"" + path + "\"").join(" ")) || "uncommitted";
    const text = render(cards, commit);
    const strip = value => value.replace(/\r\n/g, "\n").split("\n").filter(line => !line.startsWith(REFLECTS)).join("\n");
    const problems = [];
    if (check) {
        const saved = existsSync(R + OUT) ? readFileSync(R + OUT, "utf8") : "";
        if (strip(saved) !== strip(text)) problems.push(OUT + " is stale: run `npm run docs:index` and commit the result.");
        for (const entry of citations(knownCodes(cards))) problems.push("unknown question code " + entry + " (add it to the register, write \"retired\" beside it, or add it to CITATION_ALLOW in " + SCRIPT + ")");
        if (problems.length) {
            console.error("The questions register does not hold:\n" + problems.map(problem => "  " + problem).join("\n"));
            process.exit(1);
        }
        console.log("The questions register (doc 44) matches the code, and the questionnaire documents cite only codes it knows.");
        return;
    }
    // (Written with CRLF, as its neighbours in docs/design/questionnaire are.)
    writeFileSync(R + OUT, text.replace(/\n/g, "\r\n"));
    console.log(OUT + " written (" + knownCodes(cards).size + " codes).");
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
