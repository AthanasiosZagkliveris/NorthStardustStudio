import { describe, expect, it } from "vitest";

import { aestheticsDraft, ambassadorShown, asAmbassadorChoices, brandVoiceLine, characterLimit, lastingImpressionDraft, presenceWords, rememberedOptions, toneWords, voiceDraft, wordsOptions } from "./AmbassadorChoices.ts";

/* THE AMBASSADOR'S CHOICES, BA1 TO BA4 AND BA6 TO BA8 (Questions 11). */
describe("the Ambassador's choices", () => {

    const none = { segments: [] };

    it("keeps known ids and ratings only; a key never set stays missing, so its start keeps following", () => {
        expect(asAmbassadorChoices({ ambassador: { character: ["sincere", "nope", "sincere", "rugged", "exciting"], dress: "nope", energy: 7, tone: { humour: 4, respect: "x" } } }))
            .toEqual({ character: ["sincere", "rugged"], tone: { humour: 4 } });
        expect(asAmbassadorChoices({})).toEqual({});
    });

    it("is one character until Managing, then 2 (K14's pattern)", () => {
        expect(characterLimit("plan")).toBe(1);
        expect(characterLimit("launch")).toBe(1);
        expect(characterLimit("manage")).toBe(2);
        expect(characterLimit("grow")).toBe(2);
    });

    it("starts BA4 and BA6 from the first character, and keeps a rating the founder set", () => {
        const shown = ambassadorShown({ character: ["exciting", "sincere"], energy: 3, tone: { formality: 4 } }, none);
        expect([shown.energy, shown.expression]).toEqual([3, 5]);
        expect(shown.tone).toEqual({ formality: 4, humour: 4, respect: 3, enthusiasm: 5 });
    });

    it("says BA4 in words: a 3 left out, both at 3 balanced", () => {
        expect(presenceWords({ energy: 1, expression: 5 })).toBe("calm and expressive");
        expect(presenceWords({ energy: 3, expression: 2 })).toBe("reserved");
        expect(presenceWords({ energy: 3, expression: 3 })).toBe("balanced");
        expect(presenceWords({})).toBe("");
    });

    it("takes the two tone rows furthest from 3, a tie in the rows' order, never a 3", () => {
        expect(toneWords({ formality: 5, humour: 2, respect: 5, enthusiasm: 2 })).toBe("formal, respectful");
        expect(toneWords({ formality: 3, humour: 1, respect: 3, enthusiasm: 3 })).toBe("serious");
        expect(toneWords({ formality: 3, humour: 3, respect: 3, enthusiasm: 3 })).toBe("balanced");
        expect(toneWords({})).toBe("");
    });

    it("writes the drafts and the Business Plan's line (Questions 11, section 3)", () => {
        const shown = ambassadorShown({ character: ["sincere"], dress: "smart", setting: ["workshop", "outdoors"], words: "plain" }, none);
        expect(aestheticsDraft(shown)).toBe("Our Ambassador is warm and honest, dresses in a smart casual way and is pictured in a workshop or studio and outdoors.");
        expect(voiceDraft(shown)).toBe("They speak in plain, everyday words, with a casual, respectful tone.");
        expect(brandVoiceLine(shown)).toBe("Our brand is warm and honest, with a casual, respectful tone.");
        expect(brandVoiceLine(ambassadorShown({}, none))).toBe("");
        expect(aestheticsDraft(ambassadorShown({ character: ["sincere", "competent"] }, none))).toBe("Our Ambassador is warm and honest as well as capable and reliable.");
    });

    it("offers BA9 the Values by their ids, keeps a tick on a Value still there, and writes the Lasting impression (Questions 11, BA9)", () => {
        const context = { segments: [], values: [{ id: "value-a", text: "Craft over speed" }, { id: "value-b", text: "Honest prices" }] };
        expect(rememberedOptions(context).map(option => option.id)).toEqual(["value-a", "value-b"]);
        const shown = ambassadorShown({ remembered: ["value-b", "value-gone", "value-a"] }, context);
        expect(shown.remembered).toEqual(["value-b", "value-a"]);
        expect(lastingImpressionDraft(shown, context)).toBe("They remember us for Honest prices and Craft over speed.");
        expect(lastingImpressionDraft(ambassadorShown({}, context), context)).toBe("");
    });

    it("puts the trade's own terms first only where every Segment is a business", () => {
        expect(wordsOptions(none).map(option => option.id)).toEqual(["plain", "explained", "trade"]);
        const business = { id: "s", name: "Firms", description: { "business-data": "" }, offerings: [], profiles: [], competitors: [], questions: {}, valueProposition: "" };
        expect(wordsOptions({ segments: [business as never] }).map(option => option.id)).toEqual(["trade", "plain", "explained"]);
    });

});
