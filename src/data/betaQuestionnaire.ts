/*
    THE BETA QUESTIONNAIRE (Research 8; its base: section 8). Every question is one entry of this list: the screen, the
    checks of what is answered and the sending are made from it, so changing, adding or removing a question is changing this
    file (owner, 2026-11-27 21:45 UTC+2: "Beta questionnaire will change, but you can start and build a base").

    A question's number is permanent (as the question codes): a question taken out leaves its number unused. The version goes
    with the answers when they are sent, so answers to a changed questionnaire are never mixed with older ones.
*/

/** Raise it whenever a question, its words or its options change. */
export const BETA_QUESTIONNAIRE_VERSION = 1;

/** The kinds of question, each drawn with one of the app's existing controls (Research 8, section 8.1). */
export type BetaQuestionKind =
    | "consent"   // a tick (TickField)
    | "single"    // one choice (FittingRadioChoice)
    | "multi"     // ticks, up to `max` (TickField)
    | "country"   // the app's country list (OptionPicker)
    | "scale"     // a rating from `from` to `to` (RatingScale)
    | "sus"       // the ten System Usability Scale statements (RatingScaleGroup)
    | "text";     // a short answer (TextField)

/** When a question is asked: always, once for each System the founder used, or once a document was opened. */
export type BetaQuestionWhen = "always" | "per-system" | "documents-opened";

export interface BetaQuestion {
    number: number;
    words: string;
    kind: BetaQuestionKind;
    options?: string[];
    /** For "multi": the most ticks. */
    max?: number;
    /** For "scale": the range and the words at each end. */
    from?: number;
    to?: number;
    lowWords?: string;
    highWords?: string;
    when?: BetaQuestionWhen;
    /** Every question must be answered (owner, 2026-11-27), except where consent must stay a free choice (GDPR). */
    optional?: boolean;
    /** For question 2: the email box it opens when ticked. */
    withEmail?: boolean;
}

export interface BetaSection {
    title: string;
    questions: BetaQuestion[];
}

/** The ten statements of the System Usability Scale (Brooke, 1996), in their published order; "the app" for "this system". */
export const SUS_STATEMENTS: string[] = [
    "I think that I would like to use the app frequently.",
    "I found the app unnecessarily complex.",
    "I thought the app was easy to use.",
    "I think that I would need the support of a technical person to be able to use the app.",
    "I found the various functions in the app were well integrated.",
    "I thought there was too much inconsistency in the app.",
    "I would imagine that most people would learn to use the app very quickly.",
    "I found the app very cumbersome to use.",
    "I felt very confident using the app.",
    "I needed to learn a lot of things before I could get going with the app.",
];

export const BETA_QUESTIONNAIRE: BetaSection[] = [
    {
        title: "Consent",
        questions: [
            { number: 1, words: "I agree that my answers are used to improve North Stardust.", kind: "consent" },
            { number: 2, words: "You may contact me about my answers.", kind: "consent", optional: true, withEmail: true },
        ],
    },
    {
        title: "About you and your business",
        questions: [
            { number: 3, words: "Where is your business today?", kind: "single", options: ["An idea", "Planning to open", "Opened in the last 12 months", "Open for 1 to 3 years", "Open for longer"] },
            { number: 4, words: "How many people run it, you included?", kind: "single", options: ["Just me", "2", "3 to 5", "6 or more"] },
            { number: 5, words: "Who does it sell to?", kind: "multi", options: ["People", "Businesses", "Public bodies"] },
            { number: 6, words: "In which country is it registered, or will it be?", kind: "country" },
            { number: 7, words: "Have you written a business plan before?", kind: "single", options: ["Never", "Once", "Several times"] },
        ],
    },
    {
        title: "Getting started",
        questions: [
            { number: 8, words: "How easy was it to start your first Organisation?", kind: "scale", from: 1, to: 5, lowWords: "Very hard", highWords: "Very easy" },
            { number: 9, words: "What did you expect the app to do for you?", kind: "text" },
            { number: 10, words: "Which System did you start with?", kind: "single", options: ["Identity", "Brand", "Business", "Strategy"] },
        ],
    },
    {
        title: "The Systems",
        questions: [
            { number: 11, words: "How clear were the questions on this System?", kind: "scale", from: 1, to: 5, lowWords: "Unclear", highWords: "Very clear", when: "per-system" },
            { number: 12, words: "How often did a question already know part of your answer from earlier pages?", kind: "single", options: ["Never", "Sometimes", "Often", "Almost always"], when: "per-system" },
            { number: 13, words: "Which question took you longest, and why?", kind: "text", when: "per-system" },
            { number: 14, words: "Which question would you add?", kind: "text", when: "per-system" },
        ],
    },
    {
        title: "The documents",
        questions: [
            { number: 15, words: "Which documents did you open?", kind: "multi", options: ["Business Plan", "Business Model Canvas", "Financial Forecast", "Funding Request", "Financial Plan"], when: "documents-opened" },
            { number: 16, words: "How close was the Business Plan to one you could send to a bank or investor?", kind: "scale", from: 1, to: 5, lowWords: "Far", highWords: "Ready to send", when: "documents-opened" },
            { number: 17, words: "Did any figure surprise you? Which one?", kind: "text", when: "documents-opened" },
            { number: 18, words: "Which format did you export?", kind: "multi", options: ["PDF", "Markdown", "CSV", "None yet"], when: "documents-opened" },
        ],
    },
    {
        title: "Using the app",
        questions: [
            { number: 27, words: "How much do you agree with each of these?", kind: "sus", from: 1, to: 5, lowWords: "Strongly disagree", highWords: "Strongly agree" },
        ],
    },
    {
        title: "Reading and access",
        questions: [
            { number: 19, words: "Which Appearance did you use most?", kind: "single", options: ["Light", "Sepia", "Dark", "Auto"] },
            { number: 20, words: "Did you use the keyboard, a screen reader or zoom to move around the app?", kind: "multi", options: ["Keyboard only", "Screen reader", "Zoom above 150%", "None of these"] },
            { number: 21, words: "Was anything hard to read, reach or press?", kind: "text" },
        ],
    },
    {
        title: "What comes next",
        questions: [
            { number: 22, words: "Which of these would help you most? Choose up to three.", kind: "multi", max: 3, options: ["An AI assistant that suggests answers and checks the plan", "Working on one plan with your team", "Answering by voice", "The app in your language and country", "Saving to the cloud and on more devices", "Templates for your industry", "A pitch deck from your answers", "A link to your accounting software"] },
            { number: 23, words: "What would an AI assistant need to do for you to trust its suggestions?", kind: "text" },
            { number: 24, words: "Would you pay for North Stardust?", kind: "single", options: ["Yes, monthly", "Yes, once", "Only for some features", "No"] },
            { number: 25, words: "How likely are you to recommend North Stardust to another founder?", kind: "scale", from: 0, to: 10, lowWords: "Not likely", highWords: "Very likely" },
            { number: 26, words: "Anything else you would like to tell us?", kind: "text" },
        ],
    },
];

/** Every question, in the order asked. */
export function allBetaQuestions(): BetaQuestion[] {
    return BETA_QUESTIONNAIRE.flatMap(section => section.questions);
}

/** One answer: a choice's words, ticks' words, a number, a text, or the SUS's ten numbers; consent is true when ticked. */
export type BetaAnswer = string | string[] | number | number[] | boolean;

/** Whether an answer counts as given for its question's kind. */
export function isAnswered(question: BetaQuestion, answer: BetaAnswer | undefined): boolean {
    switch (question.kind) {
        case "consent":
            return answer === true;
        case "single":
        case "country":
            return typeof answer === "string" && answer.trim() !== "";
        case "multi":
            return Array.isArray(answer) && answer.length > 0 && (question.max === undefined || answer.length <= question.max);
        case "scale":
            return typeof answer === "number" && answer >= (question.from ?? 1) && answer <= (question.to ?? 5);
        case "sus":
            return Array.isArray(answer) && answer.length === SUS_STATEMENTS.length && answer.every(value => typeof value === "number" && value >= 1 && value <= 5);
        case "text":
            return typeof answer === "string" && answer.trim() !== "";
    }
}

/** The System Usability Scale score out of 100, as published: odd statements score minus 1, even ones 5 minus, the sum times 2.5. */
export function susScore(answers: number[]): number {
    const sum = answers.reduce((total, value, index) => total + (index % 2 === 0 ? value - 1 : 5 - value), 0);
    return sum * 2.5;
}
