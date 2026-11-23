/**
 * THE HANDBOOK'S OWN TEXT (owner, 2026-11-22 18:58 and 19:31 UTC+2: "I want a 'workbook' (possibly different name) for the app, that would exist at the landing
 * page ... the App Guide, Specs & Limitations, and Future Features"; "Handbook sounds good"; "the extra tabs text are necessary for the app user, not the
 * founders!"): what the person using the app needs to know about the app itself -- how to use it, what it covers and where it stops, and what is planned.
 * Written to the app's user, in plain UK English. The team's own documents behind it: docs/guide/01-user-guide.md (the guide), Questions 4 (the specs and
 * limitations) and the Overview, part 5 (the future features); a change there that the user would notice is made here too.
 */

/** One block of a Handbook section: a paragraph, or a list of short points. */
export type HandbookBlock = { text: string } | { points: readonly string[] };

/** A part of a Handbook tab: its heading and its blocks. */
export interface HandbookPart {
    heading: string;
    blocks: readonly HandbookBlock[];
}

/** The App Guide: how to use the app, from the first screen to the tools. */
export const APP_GUIDE: readonly HandbookPart[] = [
    {
        heading: "Getting started",
        blocks: [
            { text: "Tiles helps you write down the decisions a business runs on: who it is, what it sells and to whom, what it needs, what it costs and whether the money works. You answer questions on cards; the app keeps every answer, adds up the figures and writes the documents from them." },
            { points: [
                "Everything saves as you type. \"Saved\" in the header says the last answer is kept.",
                "Your answers stay in this browser on this device. Export an Organisation to keep a copy or to move it to another device.",
                "Every \"i\" is help: press it beside a title, a question or a tile to read what it means and how to answer it.",
                "Back, at the bottom left, and Escape take you back to where you came from."
            ] }
        ]
    },
    {
        heading: "The Organisations screen",
        blocks: [
            { points: [
                "Write your name in the box at the top.",
                "Add: makes a new Organisation; type its name in its row. Press a row to select it: the selected Organisation is the one you work on.",
                "Import: opens an Organisation saved as a file. Export: saves the selected Organisation as a file.",
                "The x inside a row removes that Organisation, after you confirm.",
                "The arrow beside a row opens that Organisation's Capabilities.",
                "Calendar, in the Menu, opens your own Calendar: your general notes, and each Organisation's dates when you tick it under Calendars. Other, in its funnel, sets a period of your own."
            ] },
            { text: "Two example Organisations come with the app, Lumen & Loom Studio and Quillfield Automation: open them to see every page answered. Reload, in the header, refreshes them." }
        ]
    },
    {
        heading: "Systems, pages and tiles",
        blocks: [
            { points: [
                "On the Capabilities page, choose a Capability: its page shows its Systems, each listing its pages, chapters or sections; press a line to go straight there. The arrow beside the Capability's name opens what it is. The arrows and the left and right keys go round the Capabilities. Then choose a System. Its Introduction says what it covers; Start Interview opens its first page.",
                "A System's tile lists what it holds: its PAGES; the CHAPTERS of its one page; or the SECTIONS of its one chapter.",
                "The rail at the left lists the System's pages, each bullet showing its state: empty, in progress or defined. The arrows go to the previous and the next page.",
                "A page holds large tiles. Press a tile to open its dialog; press a card in it to open the card beside the dialog. The arrows beside a card step through its list.",
                "A card that still lacks an answer shows the field in red with a short reason, and its tile flashes until it is given.",
                "Answer the Systems in order: each later page starts from what the earlier ones say."
            ] }
        ]
    },
    {
        heading: "What the symbols mean",
        blocks: [
            { points: [
                "○ An empty circle: not started. Nothing is answered yet.",
                "◐ A half-filled circle: in progress. Some answers are given, some still wait.",
                "● A filled circle: defined. Every answer the page asks for is given.",
                "The shapes stand beside a Capability's Systems, a System's pages, chapters and tiles, and on the rails; the colour is never the only sign.",
                "A short word on a tile (KPI) shows its full name when you hover over it.",
                "› and ‹ arrows go to the next and the previous page; a ▷ beside a title drops its help under it.",
                "+ adds a card or a line. An x removes one, after you confirm where a removal cannot be undone.",
                "The funnel picks what a list shows: All first, or one choice at a time."
            ] }
        ]
    },
    {
        heading: "The header's tools",
        blocks: [
            { text: "Menu, in the header, holds the tools:" },
            { points: [
                "Search (also Ctrl+K): pages, fields, glossary terms and your answers.",
                "Notes: your own notes in a panel at the right. A note can link to a page, a card or a field, and a dated note shows in the Calendar.",
                "Calendar: every date your cards hold, in a panel at the left. Press a day to see what falls on it.",
                "Focus: on the Business System's pages, hides the rails, the help and the header so you can write without distraction.",
                "Settings: the rates and limits every calculation uses.",
                "Appearance: Light, Sepia, Dark, or Auto to follow your computer."
            ] },
            { text: "Workbook, beside Menu, holds one Organisation's documents, review, glossary and card notes. On the Organisations screen the same place holds this Handbook." }
        ]
    },
    {
        heading: "Documents",
        blocks: [
            { text: "Your answers write the Business Plan, the Business Model Canvas, the Financial Forecast, the Funding Request and the Financial Plan. They are in the Workbook and are written again each time you open them, so a change to an answer shows at once. Each downloads as Markdown or PDF, and the Forecast as CSV too." }
        ]
    }
];

/** Specs & Limitations: what the app covers and where it stops. */
export const SPECS_AND_LIMITATIONS: readonly HandbookPart[] = [
    {
        heading: "What the app covers",
        blocks: [
            { points: [
                "Early-stage businesses, run alone or by a small team.",
                "Four Systems of the Foundation: Identity, Brand, Business and Strategy.",
                "Five documents written from the answers: Business Plan, Business Model Canvas, Financial Forecast, Funding Request and Financial Plan."
            ] }
        ]
    },
    {
        heading: "Language and countries",
        blocks: [
            { points: [
                "English only, in UK spelling.",
                "Six countries in full: United Kingdom, Ireland, United States, Canada, Australia and New Zealand, each with its own legal forms and activity codes.",
                "Any other country: four general legal forms, and you type the activity and its code yourself."
            ] }
        ]
    },
    {
        heading: "Markets",
        blocks: [
            { points: [
                "A business that sells to consumers, to businesses, or to both (B2C and B2B).",
                "One-sided markets only: a platform that serves two groups at once, such as buyers and sellers, is not covered yet."
            ] }
        ]
    },
    {
        heading: "Where your answers are kept",
        blocks: [
            { points: [
                "In this browser, on this device. There is no account and no server.",
                "Clearing the browser's data can remove them: export each Organisation now and then to keep a copy."
            ] }
        ]
    },
    {
        heading: "Screens and access",
        blocks: [
            { points: [
                "Works from a phone's width to a wide monitor; the pages stack in a narrow or tall window.",
                "Built to WCAG 2.2 AA: every control can be reached with the keyboard, and text keeps its contrast."
            ] }
        ]
    },
    {
        heading: "Figures",
        blocks: [
            { text: "Every figure is an estimate from your own answers and the rates in Settings. The app does not give tax, legal or investment advice: check the figures with an accountant or adviser before you rely on them." }
        ]
    }
];

/** Future Features: what is planned, none of it built yet. */
export const FUTURE_FEATURES: readonly HandbookPart[] = [
    {
        heading: "Planned",
        blocks: [
            { points: [
                "Capability Generator: drafts an Organisation's capabilities from its answers.",
                "AI Assistant: suggests answers and checks them against what you have already written.",
                "Team working: several people on one Organisation.",
                "Voice: answer the questions by speaking.",
                "More languages and countries.",
                "Scenarios on the Financial Forecast: a base, a low and a high case.",
                "Plan against actual: compare the plan with what really happened.",
                "A storage warning, and asking the browser to keep your answers safe.",
                "Templates and examples by kind of business.",
                "Accounting software links, and reminders you can add to your own calendar."
            ] },
            { text: "None of these is built yet. They are listed so you know what is coming; the order may change." }
        ]
    }
];
