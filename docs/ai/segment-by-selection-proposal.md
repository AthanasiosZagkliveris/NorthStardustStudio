# Building a Customer Segment by selection (proposal)

Status: proposal, nothing built. Written 2026-10-12.

## What the app asks today

A Segment has a name and description; each Profile has four written boxes (Specific personal information, Psychographics, Social and interest hubs, Information and shopping habits); the Segment's Description has Demographics, Purchasing power and behaviour, Geographics, and Market size and industry outlook. All are free text.

## What the research says a segment is made of

Segmentation guides (HubSpot, WordStream and others) agree on five families of variables:

| Family | Typical keys |
| --- | --- |
| Demographic | age band, gender, income band, education, household, life stage; in B2B the buyer's role |
| Geographic | country, region, urban or rural, language, climate |
| Psychographic | values, attitudes, aspirations, lifestyle, interests |
| Behavioural | purchase frequency, usage, loyalty, readiness to buy, channels used, price sensitivity |
| Firmographic (B2B) | industry, company size (staff, revenue), growth stage, operating scale |

A usable profile is the combination of a few keys from each family (an "ideal customer profile").

## The idea: choose keys, let the app write the sentence

1. Each existing text box becomes a short list of **key groups**, each with 4 to 8 choices (chips): for Demographics, Age: 18-27, 28-39, 40-54, 55+; Income: low, middle, high; Life stage: students, young families, retired; and so on. Several can be ticked.
2. A ticked chip adds a phrase to the box's text ("Adults 28-39, middle income"); a final line, "+ add your own", takes anything the chips do not cover.
3. The text box stays: it is the app's stored answer and what every later page reads. The chips only write into it and are rebuilt from it where the text matches a chip exactly. So nothing is lost, and old answers keep working.
4. Numbers (market size, share, spend) stay typed; chips are for categories, not figures.

## Does it work?

For Demographics, Geographics, Psychographics (values and interests), Behaviours and Firmographics: yes, these are classifications. For Specific personal information (a named persona), Description and Value Proposition: no, they are narrative; chips could only seed them ("who, need, benefit").

## Other text sections

The same pattern fits where the answer is a list of known kinds: Competitor type and strengths, Offering needs addressed (already ticks), channel kinds (already a picker), Strategy themes (a starter list), Legal requirements (already typed lists). It does not fit reasoning text (goals, purposes, approaches).

## Suggested first step

Build it for the Segment's Demographics and Geographics boxes only: chips write into the existing text, tested by round trip. If used and liked, extend to the other boxes of the Segment and the Profile.

Sources: [WordStream, segmentation variables](https://jump.wordstream.com/what-are-segmentation-variables), [HubSpot, B2B customer segmentation](https://blog.hubspot.com/service/b2b-customer-segmentation), [Koji, firmographic segmentation guide](https://www.koji.so/docs/firmographic-segmentation-guide).
