import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { allBetaQuestions, SUS_STATEMENTS, type BetaAnswer } from "../data/betaQuestionnaire";
import { BETA_KEY, BetaQuestionnaireService, missingAnswers } from "./BetaQuestionnaireService";
// @ts-expect-error The receiver is plain JavaScript, run by Cloudflare Pages beside the app.
import { onRequestPost } from "../../functions/api/beta.js";

/** Every required answer of a founder who used Identity and opened a document. */
function answerAll() {
    BetaQuestionnaireService.noteUse({ systems: ["Identity"], documentsOpened: true });
    for (const question of allBetaQuestions()) {
        if (question.optional) {
            continue;
        }
        const value: BetaAnswer = question.kind === "consent" ? true
            : question.kind === "single" || question.kind === "multi" ? (question.kind === "multi" ? [question.options![0]] : question.options![0])
                : question.kind === "country" ? "Greece"
                    : question.kind === "scale" ? question.from!
                        : question.kind === "sus" ? SUS_STATEMENTS.map(() => 3)
                            : "A few words";
        BetaQuestionnaireService.answer(question.when === "per-system" ? question.number + ":Identity" : String(question.number), value);
    }
}

/** The Beta questionnaire on this device (Research 8, section 8.3): answers saved as given, sent once, kept waiting offline, the downloads opened by the receipt. */
describe("the Beta questionnaire's answers", () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => vi.unstubAllGlobals());

    it("keeps every download open outside the Beta", () => {
        expect(BetaQuestionnaireService.downloadsOpen(false)).toBe(true);
        expect(BetaQuestionnaireService.downloadsOpen(true)).toBe(false);
    });

    it("asks each System's questions for every System answered in, and the documents' once one is opened", () => {
        expect(missingAnswers(BetaQuestionnaireService.read())).not.toContain("11:Brand");
        BetaQuestionnaireService.noteUse({ systems: ["Identity", "Brand"] });
        const missing = missingAnswers(BetaQuestionnaireService.read());
        expect(missing).toContain("11:Identity");
        expect(missing).toContain("11:Brand");
        expect(missing).not.toContain("15");
        BetaQuestionnaireService.noteUse({ documentsOpened: true });
        expect(missingAnswers(BetaQuestionnaireService.read())).toContain("15");
    });

    it("sends only once every required answer is given, and asks for the email once contact is allowed", () => {
        expect(BetaQuestionnaireService.send()).toBe(false);
        answerAll();
        BetaQuestionnaireService.answer("2", true);
        expect(missingAnswers(BetaQuestionnaireService.read())).toEqual(["2:email"]);
        BetaQuestionnaireService.email("founder@example.com");
        expect(missingAnswers(BetaQuestionnaireService.read())).toEqual([]);
    });

    it("keeps the answers waiting offline, and sends them when back online", async () => {
        answerAll();
        const post = vi.fn().mockResolvedValue(new Response(JSON.stringify({ receipt: "r-1" }), { status: 200 }));
        vi.stubGlobal("fetch", post);
        vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
        expect(BetaQuestionnaireService.send()).toBe(true);
        await BetaQuestionnaireService.flush();
        expect(post).not.toHaveBeenCalled();
        expect(BetaQuestionnaireService.read().status).toBe("waiting");
        expect(BetaQuestionnaireService.downloadsOpen(true)).toBe(false);

        vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
        await BetaQuestionnaireService.flush();
        expect(post).toHaveBeenCalledTimes(1);
        const sent = JSON.parse(post.mock.calls[0][1].body);
        expect(sent.version).toBe(1);
        expect(sent.email).toBeUndefined();
        expect(BetaQuestionnaireService.read().status).toBe("sent");
        expect(BetaQuestionnaireService.downloadsOpen(true)).toBe(true);
    });

    it("keeps the answers waiting when the receiver does not take them", async () => {
        answerAll();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 503 })));
        BetaQuestionnaireService.send();
        await BetaQuestionnaireService.flush();
        expect(BetaQuestionnaireService.read().status).toBe("waiting");
    });

    it("counts as sent only with the receiver's receipt", async () => {
        answerAll();
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<!doctype html>", { status: 200 })));
        BetaQuestionnaireService.send();
        await BetaQuestionnaireService.flush();
        expect(BetaQuestionnaireService.read().status).toBe("waiting");
    });

    it("starts again for a questionnaire of another version", () => {
        localStorage.setItem(BETA_KEY, JSON.stringify({ version: 0, answers: { 3: "An idea" }, status: "sent" }));
        expect(BetaQuestionnaireService.read()).toEqual({ version: 1, answers: {}, status: "answering" });
    });
});

/** The receiver (functions/api/beta.js): one row for each questionnaire, a receipt back, nothing it does not need. */
describe("the Beta questionnaire's receiver", () => {
    const database = () => {
        const rows: unknown[][] = [];
        return {
            rows,
            prepare: () => ({ run: async () => ({}), bind: (...values: unknown[]) => ({ run: async () => { rows.push(values); return {}; } }) })
        };
    };
    const post = (body: unknown) => new Request("http://localhost/api/beta", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) });

    it("keeps a questionnaire and replies with its receipt, the email only with its permission", async () => {
        const BETA_DB = database();
        const response = await onRequestPost({ request: post({ version: 1, answers: { 1: true, 3: "An idea" }, email: "a@b.co" }), env: { BETA_DB } });
        expect(response.status).toBe(200);
        expect((await response.json()).receipt).toMatch(/[0-9a-f-]{36}/);
        expect(BETA_DB.rows[0][2]).toBe(1);
        expect(BETA_DB.rows[0][4]).toBeNull();
    });

    it("refuses what is not a questionnaire, and waits while the database is not set up", async () => {
        expect((await onRequestPost({ request: post("not json"), env: { BETA_DB: database() } })).status).toBe(400);
        expect((await onRequestPost({ request: post({ answers: [] }), env: { BETA_DB: database() } })).status).toBe(400);
        expect((await onRequestPost({ request: post({ version: 1, answers: {} }), env: {} })).status).toBe(503);
    });

    it("asks for the human check once its secret is set", async () => {
        const response = await onRequestPost({ request: post({ version: 1, answers: {} }), env: { BETA_DB: database(), TURNSTILE_SECRET: "secret" } });
        expect(response.status).toBe(403);
    });
});
