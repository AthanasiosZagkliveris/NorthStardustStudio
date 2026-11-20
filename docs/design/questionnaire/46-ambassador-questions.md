# 46. The Ambassador: every question and option, as proposed

Status: **proposal**, written 2026-11-12, updated 2026-11-20. The owner approved it on 2026-11-12 (decisions D3, D4, D5 below); it is built in phase 4 (the order of work: doc 49, section 8; numbered 5 until the financials moved last, 2026-11-12). **Built 2026-11-19** (the owner's approved plan of 2026-11-18, §3, B2): BA1 to BA4 and BA6 to BA8 with their starts, the drafts of section 3 (the Imprint's first sentence into its First impression), the Review item and the Business Plan's opening line (`AmbassadorChoices.ts`, `brand/AmbassadorChoices.tsx`). The Values' ids (section 5, step 1) are built the functional items' way: the Values' text stays saved as it was, and their ids stand beside it line for line (`valueIds`, `ValueIds.ts`), made from each line's words where a save has none (a suffix only to tell apart two lines of the same words). BA9 is built on them (2026-11-19): the Values by their ids, then the Segments' Differentiations, its sentence written into the Lasting impression's text by the Imprint's one "Add a draft". Not built yet: the Style suggestions (section 4).

Related: doc 40 (the form of a tile document), doc 39 (what an "i" says), doc 28 (8.3, the Brand System and its evidence), doc 45 (the Values this card reads), doc 47 (the relationship type, J3), doc 44 (the register and the code rule), doc 2 (the sources).

## 1. What the tile is

### 1.1 Today

One chapter of four Master Tiles, each a free text: **Aesthetics**, **Body Language**, **Communication & Voice**, **Imprint** (two texts, the First and the Lasting impression). The Business Plan prints them under "Brand & Voice" in Marketing and Sales. The Style chapter holds Colours (six slots: Primary A and B, Secondary A and B, Neutral A and B), Typography (Primary, Secondary, Optional), Text Hierarchy (H1 to captions), Icon & Logo, and Brand Images (two to five, each with a name and a description).

### 1.2 The approach

- **The texts stay**, with their keys and prompts. Each tile gains a few choices above its text, saved under a new key of the section, and an **"Add a draft"** link that writes a sentence at the end of the text (the Value Proposition's pattern, doc 42).
- **The models:** brand personality (Aaker, 1997, already in doc 2) and the four dimensions of tone of voice (NN/g, opened).
- **Options come from earlier answers** where the app holds them: the Profiles' emotional and social needs, the Values' lines, K14. The relationship type (J3) is read straight into the Body Language draft, with no question of its own.
- **Evidence:** personality is moderate; colour, type and shape links are moderate to weak (doc 28, 8.3). What Style reads from them is labelled "a suggestion".
- **Where the character sits:** first in the Aesthetics tile, the tile the founder meets first, so no tile moves (D5).
- **Quick to answer:** BA1 starts all six ratings and BA8 and BA9 list the founder's own answers; BA3's surroundings are imagined, with no start. A founder in a hurry picks a character, accepts the starts and presses "Add a draft".

### 1.3 The wording rules

Every question follows the wording rules of doc 28, section 4, and these, decided for this card (owner, 2026-11-12):
- an "i" never repeats its label or what the screen already shows (such as the "2 max" chip); references always last;
- each Rating Scale has its row name at 5, and the meaning of 1 and 5 first in its "i";
- every generated sentence uses one phrase per option, in the business's "we" and "our" voice; a phrase that can be joined holds no "and" of its own; lists join as "A, B and C" with `joinNames` (`src/framework/engine/businessDocuments/plan.ts`).

## 2. The questions

Aesthetics holds BA1, BA2, BA3; Body Language BA4; Communication & Voice BA6, BA7; Imprint BA8 (First impression) and BA9 (Lasting impression).

### BA1 (Aesthetics tile, first)

- **Label:** Which character fits your Ambassador best?
- **Control:** one choice at Planning and Launching; ticks, "2 max", from Managing (K14's stage pattern).
- **Options**, each with its own "i" (Aaker's facets) and its draft phrase:

  | id | Label | Its "i" | Draft phrase |
  |---|---|---|---|
  | `sincere` | Warm & honest | Down-to-earth, honest, wholesome and cheerful (Aaker's Sincerity). | warm and honest |
  | `exciting` | Lively & bold | Daring, spirited, imaginative and up-to-date (Aaker's Excitement). | lively and bold |
  | `competent` | Capable & reliable | Reliable, intelligent and successful (Aaker's Competence). | capable and reliable |
  | `sophisticated` | Refined & elegant | Upper-class and charming (Aaker's Sophistication). | refined and elegant |
  | `rugged` | Tough & practical | Outdoorsy and tough (Aaker's Ruggedness). | tough and practical |

- **"i":**
  - Picture your brand as a person: the character people describe after meeting it.
  - Your choice starts the ratings on Body Language and Communication & Voice.
  - Based on: Aaker (1997), *Dimensions of brand personality*.
- **Saved as:** `ambassador.character`.

### BA2 (Aesthetics)

- **Label:** How does your Ambassador dress?
- **Control:** one choice.
- **Options** (id – label – draft phrase):
  - `formal` – Formal / tailored – formal, tailored
  - `smart` – Smart casual – smart casual
  - `relaxed` – Relaxed / casual – relaxed, casual
  - `practical` – Practical / workwear – practical, workwear
  - `creative` – Creative / artistic – creative, artistic
- **"i":**
  - Clothing speaks before a word is said.
  - Colours, grooming and scent go in the text below.
- **Saved as:** `ambassador.dress`.

### BA3 (Aesthetics)

- **Label:** What surroundings suit your Ambassador?
- **The concept** (owner, 2026-11-19 21:44 UTC+2: "He is not a real person, but an idea that the app user could think about him/her. You cannot find him/her in a real place. Read carefully; the i help texts in that section."): the Ambassador is an imagined persona, so BA3 asks for the surroundings the founder pictures the persona in -- the feel of the brand's photos and spaces --, never where the business meets its customers. It has no start (it started from the Offerings' delivery before: withdrawn).
- **Control:** ticks, "2 max".
- **Options** (id – label – draft phrase):
  - `workshop` – A workshop or studio – in a workshop or studio
  - `home` – A calm home – in a calm home
  - `outdoors` – The outdoors – outdoors
  - `city` – A lively city street – on a lively city street
  - `gallery` – A gallery or showroom – in a gallery or showroom
  - `office` – A modern office – in a modern office
  - `cafe` – A café or market – in a café or market
- **"i":**
  - Picture your Ambassador somewhere: the surroundings that carry your brand's feel, in your photos and your spaces.
- **Saved as:** `ambassador.setting` (the ids kept from before keep their answers; "venue" and "online" are no longer offered).

### BA4 (Body Language tile)

- **Label:** How does your Ambassador come across?
- **Control:** two rated rows in the question's own band, one field: the shared Rating Scale group, each row with its own "i" (owner, 2026-11-19 18:32: "Energy and Expression should belong to the field").
- **Rows** (each row's "i"):
  - Energy: "1 = Calm, 5 = Energetic." then "The pace and movement your Ambassador brings."
  - Expression: "1 = Reserved, 5 = Expressive." then "How openly your Ambassador shows feeling."
- **The question's "i":**
  - How your Ambassador stands, moves and reacts.
  - Your character choice starts both ratings.
- **Starts from BA1** (Energy, Expression):
  - Warm & honest: 3, 4
  - Lively & bold: 5, 5
  - Capable & reliable: 2, 2
  - Refined & elegant: 2, 2
  - Tough & practical: 3, 2

  With two characters ticked, the first one sets the start. The mapping is the author's, and the evidence for it is weak (doc 28, 8.3).
- **Saved as:** `ambassador.energy`, `ambassador.expression` (1 to 5).

### BA6 (Communication & Voice tile)

- **Label:** What tone does your Ambassador use?
- **Control:** four rated rows in the question's own band, one field, as BA4's (owner, 2026-11-19 18:32).
- **Rows** (each row's "i", first line):
  - Formality: 1 = Casual, 5 = Formal.
  - Humour: 1 = Serious, 5 = Funny.
  - Respect: 1 = Irreverent, 5 = Respectful.
  - Enthusiasm: 1 = Matter-of-fact, 5 = Enthusiastic.
- **The question's "i":**
  - Your voice stays the same; your tone shifts with the moment. Rate the tone you use most.
  - Your character choice starts all four ratings.
  - Based on: Nielsen Norman Group, *The four dimensions of tone of voice*.
- **Starts from BA1:**

  | Character | Formality | Humour | Respect | Enthusiasm |
  |---|---|---|---|---|
  | Warm & honest | 2 | 3 | 4 | 4 |
  | Lively & bold | 2 | 4 | 3 | 5 |
  | Capable & reliable | 4 | 2 | 4 | 2 |
  | Refined & elegant | 5 | 2 | 5 | 2 |
  | Tough & practical | 2 | 3 | 3 | 2 |

  The mapping is the author's, and the evidence for it is weak.
- **Saved as:** `ambassador.tone: { formality, humour, respect, enthusiasm }`.

### BA7 (Communication & Voice)

- **Label:** Which words suit your customers?
- **Control:** one choice.
- **Options** (id – label – draft phrase):
  - `plain` – Plain, everyday words – plain, everyday words
  - `explained` – Expert words, explained – expert words, explained simply
  - `trade` – The trade's own terms – the trade's own terms
- **Order:** "The trade's own terms" comes first when every Segment is a business (B2B).
- **"i":**
  - Choose the words your customers use themselves.
  - Words to use and words to leave out go in the text below.
- **Saved as:** `ambassador.words`.

### BA8 (Imprint tile, First impression)

- **Label:** How should people feel when they first meet your brand?
- **Control:** ticks, "2 max".
- **Options:** the emotional and social needs ticked on the Profiles of every Segment, the most chosen first. With none ticked yet, the full emotional list.
- **"i":**
  - Chosen from what your customers want to feel, on their Profiles.
  - Your Value Proposition shows how each Offering gives it.
- **Saved as:** `ambassador.feeling` (need ids).

### BA9 (Imprint tile, Lasting impression)

- **Label:** What should people remember you for?
- **Control:** ticks, "2 max".
- **Options:** the lines of your Values, then each Differentiation chosen on your Segments (K14).
- **"i":**
  - The lasting impression: what people repeat about you to a friend.
- **Saved as:** `ambassador.remembered`, which holds Value ids and Differentiation ids.
- **Built after** the Values migration (section 5).
- **K14's phrases** (one list, shared with the Compass draft):

  | K14 id | Label | Phrase |
  |---|---|---|
  | `cost` | Cost-driven | good value |
  | `convenience` | Convenience-driven | making things easy |
  | `compliance` | Compliance, Risk & Security | keeping customers safe |
  | `premium` | Status & Premium | high quality |
  | `performance` | Performance & Innovation | high performance |
  | `ecosystem` | Ecosystem & Integration | fitting the tools customers already use |
  | `personal` | Personal Service & Relationship | personal service |

  A Value line prints as typed.

## 3. The drafts ("Add a draft", written at the end of each text)

- **Aesthetics:** "Our Ambassador is [BA1 phrase], dresses in a [BA2 phrase] way and is pictured [BA3 phrases, joined with 'and']."
  - Example: "Our Ambassador is warm and honest, dresses in a smart casual way and is pictured in a workshop or studio and in a calm home."
- **Body Language:** "They come across as [BA4 in words] and [J3 phrase]."
  - BA4 in words: Energy 1–2 "calm", 4–5 "energetic"; Expression 1–2 "reserved", 4–5 "expressive". A 3 is left out; with both at 3, "balanced".
  - J3 phrase (the most personal type on any Segment):
    - Do-it-yourself help → "let customers help themselves, with help close at hand"
    - Automatic help → "help customers at any hour"
    - A customer community → "bring customers together"
    - Personal help → "step in personally when customers need them"
    - A dedicated person or team → "stay close to every customer"
  - With no J3 yet, the sentence ends after BA4.
- **Communication & Voice:** "They speak in [BA7 phrase], with a [tone words] tone."
  - Tone words: the two BA6 rows furthest from 3, each as the end word it leans to (for example "formal, respectful"). With every row at 3, "balanced".
- **Imprint:** "First impression: people feel [BA8 labels, lower case]. Lasting impression: they remember us for [BA9 phrases]."
- **The Business Plan, Brand & Voice:** one opening line above the four texts: "Our brand is [BA1 phrase], with a [tone words] tone."

## 4. What Style and the Brand Images read (suggestions, labelled)

From BA1, through doc 28, 8.3's table: suggested colour families on the Colours tile, a typeface style on Typography, shapes beside Icon & Logo, image kinds on Brand Images (with BA2 and BA3). Each suggestion is a tile with Add, a one-line reason and its evidence strength; WCAG 1.4.3 applies to every colour suggested for text.

## 5. The Review, the documents and the build

- Review: "Your Ambassador's character: not chosen yet" once any Ambassador text is written.
- Business Plan, Brand & Voice: the opening line given in section 3, above the four texts.

**The build (phase 4):**
1. **The Values gain ids first.** The Values list (`values`, a numbered list of strings) becomes `{ id, text }[]`, ids created on first read, the text kept exactly, the pattern of the functional items' migration of 2026-11-07; a test loads old saves unchanged. BA9 waits for it.
2. BA1 to BA4 and BA6 to BA9, with the drafts and the Review item.
3. The Style suggestions (section 4).

## 6. What changes when an answer above changes

- Changing BA1 moves the starts of BA4 and BA6 where the founder has not changed them (starts follow until changed, `EffectiveAnswers.ts`); a rating the founder set stays.
- BA8's options follow the Profiles' emotional and social needs; a tick on a need no Profile holds any more is removed on the next choice (the rule of every tile).
- BA9's options follow the Values and the Segments' Differentiation the same way.

## 7. Codes

New prefix **BA** (Brand Ambassador), unused in doc 44. BA1 to BA4 and BA6 to BA9 are reserved in the register (doc 44, "Reserved codes", 2026-11-19, B2), BA5 listed there as withdrawn; each moves to its card's section when built. **BA5 is withdrawn** (2026-11-12, before registration): it asked how close the business stays to its customers, which the relationship type (J3, doc 47) answers; the register lists it as withdrawn, never reused. BA4 has two rows (Energy, Expression); a third, Manner, was dropped as BA6's Formality reversed.

## 8. Decided, and still to decide

| # | Decision | Approved (owner, 2026-11-12 14:10) |
|---|---|---|
| D3 | Ambassador questions | BA1 to BA4 and BA6 to BA9; BA5 withdrawn; BA4 with two rows; BA9 after the Values migration |
| D4 | Lift the Brand park | Now for the Ambassador; Style suggestions with the Ambassador phase (phase 4) |
| D5 | Where BA1 sits | First in Aesthetics; no tile moves |

Still to decide: nothing. The starting values of BA4 and BA6 are the author's mapping of Aaker's facets, with weak evidence (doc 28, 8.3); they may change once tested with founders.

## 9. Phrases for the drafts

| Answer | Option → phrase |
|---|---|
| BA1 (draft) | sincere → warm and honest; exciting → lively and bold; competent → capable and reliable; sophisticated → refined and elegant; rugged → tough and practical. Two ticked join with "as well as" |
| BA2 (draft) | formal → formal, tailored; smart → smart casual; relaxed → relaxed, casual; practical → practical, workwear; creative → creative, artistic |
| BA3 (draft, after "is pictured") | workshop → in a workshop or studio; home → in a calm home; outdoors → outdoors; city → on a lively city street; gallery → in a gallery or showroom; office → in a modern office; cafe → in a café or market |
| BA4 (draft) | Energy 1–2 calm, 4–5 energetic; Expression 1–2 reserved, 4–5 expressive; a 3 left out; both at 3 → balanced |
| BA6 tone words | the two rows furthest from 3, as the end word each leans to; a tie goes to the row order Formality, Humour, Respect, Enthusiasm; a row at 3 never used; all at 3 → balanced |
| J3 (Body Language draft) | Do-it-yourself help → let customers help themselves, with help close at hand; Automatic help → help customers at any hour; A customer community → bring customers together; Personal help → step in personally when customers need them; A dedicated person or team → stay close to every customer |
| BA7 (draft) | plain → plain, everyday words; explained → expert words, explained simply; trade → the trade's own terms |
| K14 (BA9, Compass draft, Brand Goal) | cost → good value; convenience → making things easy; compliance → keeping customers safe; premium → high quality; performance → high performance; ecosystem → fitting the tools customers already use; personal → personal service |

## 10. Sources

- Aaker, J.L. (1997) 'Dimensions of brand personality', *Journal of Marketing Research*, 34(3), pp. 347–356 (in doc 2 as BRD-01). Cited from knowledge; to be opened before the "i" copy is locked.
- Moran, K. (2016) *The four dimensions of tone of voice*. Nielsen Norman Group. Available at: https://www.nngroup.com/articles/tone-of-voice-dimensions/ (Accessed: 12 November 2026). Opened.
