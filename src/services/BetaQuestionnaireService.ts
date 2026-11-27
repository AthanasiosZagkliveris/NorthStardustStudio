/*
    THE BETA QUESTIONNAIRE'S ANSWERS ON THIS DEVICE, AND THEIR SENDING (Research 8, sections 8.2 and 8.3).

    The answers save as they are given (one record on this device, with the questionnaire's version), so the questionnaire can be
    left and taken up again. Send keeps them as "waiting" and posts them to the app's own address (`/api/beta`, the Cloudflare
    Pages Function in functions/api/beta.ts); offline, or when the post fails, they wait and are sent again as soon as the device
    is back online (the `online` event) or at the next start. The receipt of a sent questionnaire opens the document downloads on
    this device. Nothing else leaves the device: no Organisation, no document.
*/

import { BETA_QUESTIONNAIRE_ON } from "../data/edition";
import { TurnstileService } from "./TurnstileService";
import { BETA_QUESTIONNAIRE_VERSION, allBetaQuestions, isAnswered, type BetaAnswer, type BetaQuestion } from "../data/betaQuestionnaire";

export const BETA_KEY = "northstardust-beta-questionnaire";

/** The receiver, on the app's own address. */
export const BETA_ENDPOINT = "/api/beta";

/** Said by the questionnaire when its record changes (an answer, a send), so the open screens read it again. */
export const BETA_CHANGED_EVENT = "northstardust-beta-changed";

export type BetaStatus = "answering" | "waiting" | "sent";

export interface BetaRecord {
    version: number;
    /** By question: its number ("3"), or its number and System for a question asked for each System ("11:brand"). */
    answers: Record<string, BetaAnswer>;
    /** Question 2's email, given only with its permission ticked. */
    email?: string;
    /** The Systems the founder has answered in (asked about in questions 11 to 14). */
    systems?: string[];
    /** A document was opened (questions 15 to 18 are asked). */
    documentsOpened?: boolean;
    status: BetaStatus;
    /** The receiver's receipt, once sent. */
    receipt?: string;
}

function fresh(): BetaRecord {
    return { version: BETA_QUESTIONNAIRE_VERSION, answers: {}, status: "answering" };
}

function read(): BetaRecord {
    try {
        const saved = JSON.parse(localStorage.getItem(BETA_KEY) ?? "null") as BetaRecord | null;
        // (A questionnaire of another version starts again: its answers are never mixed with this one's.)
        return saved && saved.version === BETA_QUESTIONNAIRE_VERSION && typeof saved.answers === "object" ? saved : fresh();
    } catch {
        return fresh();
    }
}

function write(record: BetaRecord): void {
    try {
        localStorage.setItem(BETA_KEY, JSON.stringify(record));
    } catch {
        // Not kept: the answers live while the page is open.
    }
    window.dispatchEvent(new Event(BETA_CHANGED_EVENT));
}

/** The key of one answer: the question's number, with its System for a question asked for each System. */
export function answerKey(question: BetaQuestion, system?: string): string {
    return question.when === "per-system" && system ? question.number + ":" + system : String(question.number);
}

/** A plain email shape: something@something.something. */
export function looksLikeEmail(text: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text.trim());
}

/** Whether a question is asked of this founder (the Systems they used; a document opened). */
export function isAsked(question: BetaQuestion, record: BetaRecord): boolean {
    if (question.when === "per-system") {
        return (record.systems ?? []).length > 0;
    }
    if (question.when === "documents-opened") {
        return record.documentsOpened === true;
    }
    return true;
}

/** The answers still to give before Send: the required questions asked and unanswered (each System's apart), and the email once permission is ticked. */
export function missingAnswers(record: BetaRecord): string[] {
    const missing: string[] = [];
    for (const question of allBetaQuestions()) {
        if (!isAsked(question, record)) {
            continue;
        }
        const keys = question.when === "per-system" ? (record.systems ?? []).map(system => answerKey(question, system)) : [String(question.number)];
        for (const key of keys) {
            if (!question.optional && !isAnswered(question, record.answers[key])) {
                missing.push(key);
            }
        }
        if (question.withEmail && record.answers[String(question.number)] === true && !looksLikeEmail(record.email ?? "")) {
            missing.push(question.number + ":email");
        }
    }
    return missing;
}

let sending: Promise<void> | null = null;

export const BetaQuestionnaireService = {

    read,

    /** One answer given (or cleared, with `undefined`). */
    answer(key: string, value: BetaAnswer | undefined): void {
        const record = read();
        if (record.status !== "answering") {
            return;
        }
        if (value === undefined) {
            delete record.answers[key];
        } else {
            record.answers[key] = value;
        }
        write(record);
    },

    email(text: string): void {
        const record = read();
        if (record.status === "answering") {
            write({ ...record, email: text });
        }
    },

    /** What the questionnaire asks about: the Systems with answers, and a document opened. Kept as it grows; never shrinks once answered. */
    noteUse(use: { systems?: string[]; documentsOpened?: boolean }): void {
        const record = read();
        if (record.status !== "answering") {
            return;
        }
        const systems = [...new Set([...(record.systems ?? []), ...(use.systems ?? [])])];
        const documentsOpened = record.documentsOpened === true || use.documentsOpened === true;
        if (systems.length !== (record.systems ?? []).length || documentsOpened !== (record.documentsOpened === true)) {
            write({ ...record, systems, documentsOpened });
        }
    },

    /** Whether the document downloads are open: always outside the Beta; in it, once the questionnaire is sent. */
    downloadsOpen(on: boolean = BETA_QUESTIONNAIRE_ON): boolean {
        return !on || read().status === "sent";
    },

    /** Send pressed: every required answer given, the answers wait to be sent and go now if the device is online. */
    send(): boolean {
        const record = read();
        if (record.status !== "answering" || missingAnswers(record).length > 0) {
            return false;
        }
        write({ ...record, status: "waiting" });
        void BetaQuestionnaireService.flush();
        return true;
    },

    /** Posts waiting answers (online only, one post at a time); kept waiting when the post fails. */
    flush(): Promise<void> {
        if (sending) {
            return sending;
        }
        const record = read();
        if (record.status !== "waiting" || (typeof navigator !== "undefined" && navigator.onLine === false)) {
            return Promise.resolve();
        }
        // (Only what the founder answered goes: the answers, the version and, with its permission, the email.)
        const body = { version: record.version, answers: record.answers, ...(record.answers["2"] === true && record.email ? { email: record.email.trim() } : {}) };
        // (The human check's token is asked for now, as the answers go: Turnstile, where this build has its site key.)
        sending = TurnstileService.token()
            .then(token => fetch(BETA_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(token ? { ...body, token } : body) }))
            .then(async response => {
                if (!response.ok) {
                    return;
                }
                // (Only the receiver's own receipt counts: any other page that answers is not the receiver.)
                const reply = await response.json().catch(() => ({})) as { receipt?: unknown };
                if (typeof reply.receipt === "string" && reply.receipt !== "") {
                    write({ ...read(), status: "sent", receipt: reply.receipt });
                }
            })
            .catch(() => undefined)
            .finally(() => { sending = null; });
        return sending;
    },

    /** At the start of the app: waiting answers go now, and again whenever the device comes back online. */
    start(on: boolean = BETA_QUESTIONNAIRE_ON): void {
        if (!on) {
            return;
        }
        window.addEventListener("online", () => void BetaQuestionnaireService.flush());
        void BetaQuestionnaireService.flush();
    },

};
