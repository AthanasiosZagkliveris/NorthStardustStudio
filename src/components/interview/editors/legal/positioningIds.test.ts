import { describe, expect, it } from "vitest";

import { AUDIENCE_WORDS, BUYER_CATEGORY_WORDS, END_USER_WORDS, OUTCOME_WORDS, PURPOSE_WORDS } from "../../../../framework/engine/ActivityClassification.ts";
import { AUDIENCE_IDS, BUYER_CATEGORY_KEYS, MODEL_IDS, OUTCOME_IDS, PURPOSE_IDS, RELATION_IDS_B2B, RELATION_IDS_B2C, USER_AGE_IDS, endUserFrom } from "../../../../framework/engine/PositioningIds.ts";
import { AUDIENCE_SCALES, BUYER_CATEGORIES, BUYER_USER_RELATIONS, FIRST_VERSION_CUSTOMER_TYPES, LIFE_STAGES, OUTCOMES, PURPOSES, USER_LIFE_STAGES } from "./shared.tsx";

const ids = (list: readonly { id: string }[]) => list.map(option => option.id);

describe("the ids of Early Positioning (design document 33): the lists the user sees, the ids a saved answer may hold, and the words of the exports agree", () => {

    it("holds the lists of the editor to the ids the reader accepts", () => {
        expect(ids(FIRST_VERSION_CUSTOMER_TYPES)).toEqual([...MODEL_IDS]);
        expect([...ids(AUDIENCE_SCALES), ...ids(LIFE_STAGES)]).toEqual([...AUDIENCE_IDS]);
        expect(ids(BUYER_CATEGORIES)).toEqual([...BUYER_CATEGORY_KEYS]);
        expect(ids(BUYER_USER_RELATIONS.b2c)).toEqual([...RELATION_IDS_B2C]);
        expect(ids(BUYER_USER_RELATIONS.b2b)).toEqual([...RELATION_IDS_B2B]);
        expect(ids(USER_LIFE_STAGES)).toEqual([...USER_AGE_IDS]);
        expect(ids(OUTCOMES)).toEqual([...OUTCOME_IDS]);
        expect(ids(PURPOSES)).toEqual([...PURPOSE_IDS]);
    });

    it("has words for every id, for the exports and the tile", () => {
        for (const id of AUDIENCE_IDS) expect(AUDIENCE_WORDS[id], id).toBeTruthy();
        for (const id of OUTCOME_IDS) expect(OUTCOME_WORDS[id], id).toBeTruthy();
        for (const id of PURPOSE_IDS) expect(PURPOSE_WORDS[id], id).toBeTruthy();
        for (const model of MODEL_IDS) for (const key of BUYER_CATEGORY_KEYS) expect(BUYER_CATEGORY_WORDS[model + ":" + key], model + ":" + key).toBeTruthy();
        for (const id of [...RELATION_IDS_B2C, ...RELATION_IDS_B2B, ...USER_AGE_IDS]) expect(END_USER_WORDS[id], id).toBeTruthy();
    });

    it("reads an older End User answer: the three relationships stay, the ages fold into the four life stages, the other two questions go", () => {
        expect(endUserFrom(["age:early", "age:child", "age:teen", "age:adult", "age:older", "rel:parent", "rel:family", "rel:friend", "decides:buyer", "wants:enjoy"])).toEqual(["age:minor", "age:adult", "age:senior", "rel:parent", "rel:family", "rel:friend"]);
    });
});
