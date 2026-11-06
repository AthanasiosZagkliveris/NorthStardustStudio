# 35. The Segment's questions: every question and option as built

Status: **specification**, written 2026-11-01, updated 2026-11-04. Every question of the Segment card in the order it is asked, with its control, when it is asked, its options and what its "i" says. **Who the questions are about:** the questions are written for "your customers" (a direct buyer); when the buyer is a Proxy or Dual-Intent buyer, the buyer's boxes say "your buyers" and the end user's box says "your end users" (`segmentWho`).

Related: doc 36 (the Profile's questions, in the same form), doc 28 (6.3a, the Segment card in the specification), doc 31 (the age terms), doc 33 (the first version; its section 15 holds the thoughts), `src/framework/engine/SegmentQuestions.ts` (where these words are kept; where the two differ, the code is right).

The rules that hold for all of them: a radio is one choice, ticks are several (with a limit where stated); an option says its few words, and what is added in brackets or after a colon (an example, a range, an explanation, a platform or brand) is in the "i" of the question; a box has no free-text note; where they buy on a phone ("On a phone") and no way of paying is chosen yet, "Digital wallets" starts ticked, a starting value the App User can change; a question that the answers above settle is **answered for the App User and not shown** (owner, 2026-11-01): the Positioning scale of a business buyer sets the organisation's type and size; a self-employed customer decides alone; a retiree is not working and retired; an end user's age sets the school stage and removes the work and tool questions that do not apply. A question with only one option left is likewise not shown (there is nothing to choose) and its answer is that option; an answer to a question that is no longer asked, or to an option no longer offered, is removed when the next choice is made. Where Identity chose both relationships (or none), there is no Business Data tick (owner, 2026-11-02): a Segment of people has no Business Data and a Segment of businesses has it and no Demographics. Where Positioning chose both B2C and B2B, the first two Segment cards are made for the App User, with no question: the first of people (B2C), the second of businesses (B2B); one "+ Segment" button adds more, and a Segment added after them has one question that opens its first box, "Who is this Segment's customer?" (People (B2C), Businesses (B2B)). The kind is kept as the presence of the Business Data key in the Segment's Description and is asked the business's questions only (a Segment is one group, never both). What Positioning or the answers above have set in a box is said in one small line under its title ("Set for you from Positioning and your answers above: Size: no employees."), so an answer that is not asked is never silent. A radio whose options are short (each of 24 characters or fewer, 90 in all) stands in one row where the whole row fits its column and in one column where it does not, never in a row that wraps; the others stand in one column. The starting values (the work situation from the age group, a wallet from a phone) are said in the "i". Where Identity chose no relationship, the buyer is read from the buyer's category, then from the audience (a business scale is a business buyer, a life stage a person). Choosing an age term starts the work situation with the one that goes with it (a minor or a young adult: Student; an established, peak or mature adult: Employed; a retiree: Retired) where none is chosen; the App User changes it freely. The two columns are of nearly one height: the boxes are shared between them by their length, each column keeping the order of the boxes. The card is laid out as the Positioning card is (two columns with a divider, each question a band, a double rule between boxes). The box titles are in capitals.




**Connections.** Under each question: *Comes from* is what it takes from Identity or from the Segment's own earlier answers (built); *Read by* is what reads it. Built: the Market document and the export list every answer as it stands once settled against Identity as it is now (an answer to a question Identity no longer asks, or to an option it no longer offers, is left out of them at once, and is removed from the Segment on its next choice), the Business Plan's Market Analysis counts as covered when a market question is answered, and the Segment's own questions follow one another as stated. *Not built yet* is what the design plans to read it (doc 28, 6.3a and 6.5; doc 33, section 15): until it is built, nothing else reads the answer.

**Built (2026-11-04; owner, 2026-11-04): degree and comfort questions use the 1 to 5 rating unless named ranges exist.** A question that asks how comfortable people are with something, or a level or degree (how high, how fast, how crowded), becomes a rating from 1 to 5 (`RatingScale`, doc 21): the numbers 1 to 5 over its five rounds, and what 1 and 5 mean as the first line of its "i" ("1 = Uneasy, 5 = Confident."; owner, 2026-11-04: an end word could stand over two rounds). A question whose options name ranges or kinds keeps its options. Each changed question says how answers saved before it was a rating are read (`asSegmentAnswers`, `SegmentQuestions.ts`); the documents print a rating as "3 of 5 (Fairly comfortable)", the words only at an end or the middle.

| Question | Becomes | Kept as is, and why |
|---|---|---|
| Box 4, 1. and the end user's 8. Online comfort | rating: Uneasy to Confident | |
| Box 5, 2. Growing or shrinking | rating: Shrinking to Booming | |
| Box 5, 4. How crowded | rating: Open to Crowded | |
| Box 1, 8. Household income | rating: Low to High (owner, 2026-11-04, by request: its five bands were already a scale) | |
| Box 1, 9. Gender mix | rating: Mostly men to Mostly women (owner, 2026-11-04, by request); the shares stay in the "i" | |
| Box 2, 2. The kind of area | rating: Rural to Urban (owner, 2026-11-04, by request); three kinds saved before are read as 1, 3 and 5 | |
| Age, education, school stage | | named stages and ranges (doc 31) |
| Where they are | | named places |
| Size of their organisations | | named employee ranges (the EU's) |
| How many potential customers | | named ranges (under 1,000 to 500,000 or more) |
| Work, schedule, pay, socialising, deciding, where they shop | | kinds, not degrees |

## Box 1. Demographics

The people who pay (the buyer is people: B2C alone, or the first of the two Segments made where both are chosen). Questions that have no answer for Minors are skipped for them. The specialised needs (accessibility and caregiving) are not asked here: they belong to the Profile, which is specified in doc 36.

### 1. How old are your customers?

- **Control:** one choice (a radio).
- **Asked when:** The buyer is people. The terms offered follow the buyer's life stage chosen in Positioning: Students / Young Adults: Minors, semi-dependent and Young adults; Workers / Professionals: Established, Peak, Mature; Seniors: Active Retirees and Dependent seniors; none chosen: all seven. Choosing a term starts the work situation (below) where none is chosen.
- **Options:**
  - Minors, semi-dependent 13–17
  - Young adults 18–24
  - Established 25–39
  - Peak 40–54
  - Mature 55–64
  - Active Retirees 65–74
  - Dependent seniors 75+
- **The "i" says:**
  - Minors, semi-dependent: Mid and Late Adolescence, with limited buying power; mostly cash, wallets and gift cards.
  - Credit and long contracts are not open to them. Look up the country's online-consent age and its minimum working age.
  - Choose the group that pays, not the one that uses it.
  - Each age group holds the years from its first number to its last, both included, so no age is in two groups (25–39, then 40–54).
- **Connections:**
  - *Comes from:* Early Positioning: the buyer's life stage (the terms offered) and the seller and buyer relationship (people).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile's typical age is chosen within this group, and the Profiles proposed follow it; the Review checks the online-consent ages.

### 2. What is their highest level of education?

- **Control:** one choice (a radio).
- **Asked when:** The buyer is people, and the age is not Minors.
- **Options:**
  - Did not finish secondary school
  - Secondary school
  - Vocational / technical diploma
  - Bachelor's degree
  - Master's degree
  - Doctorate
- **The "i" says:**
  - Each level includes the ones below it: someone with a Master has a Bachelor.
  - Secondary school: A-levels or the Leaving Certificate (UK, Ireland), a diploma (USA, Canada), Year 12 (Australia, New Zealand).
  - Vocational or technical diploma: a post-school qualification such as a BTEC, a trade certificate or an associate degree.
- **Connections:**
  - *Comes from:* This Segment's age (not asked of Minors).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The order of the Profile's job levels.

### 3. Are your customers working?

- **Control:** one choice (a radio).
- **Asked when:** The buyer is people. For Active Retirees and Dependent seniors it is set to No and not shown.
- **Options:**
  - Yes
  - No
- **The "i" says:**
  - Yes includes working full-time, part-time, on contract or self-employed.
  - No opens a second question about why they are not working.
  - Choosing an age group starts this with the one that goes with it; change it freely.
- **Connections:**
  - *Comes from:* This Segment's age: choosing the age term starts it.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile's job level (for someone working).

### 4. Why are your customers not working?

- **Control:** one choice (a radio).
- **Asked when:** The answer to "Are your customers working?" is No. "Retired" is not offered to Minors. For Active Retirees and Dependent seniors it is set to "Retired" and not shown.
- **Options:**
  - Student
  - Homemaker or carer
  - Looking for work
  - Retired
  - Unable to work
- **The "i" says:**
  - Choose the main reason.
  - Unable to work: sidelined from the workforce by a chronic medical condition, long-term illness or disability. They typically live on fixed support incomes.
- **Connections:**
  - *Comes from:* This Segment's work status and age ("Retired" not for Minors).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Nothing yet.

### 5. Where do your customers mainly work?

- **Control:** one choice (a radio).
- **Asked when:** The answer to "Are your customers working?" is Yes.
- **Options:**
  - At home
  - In an office
  - On site
  - On the road
- **The "i" says:**
  - Where they spend most of their working hours.
  - Remote workers are online through the day; frontline and field workers are mobile, with little screen time on shift.
  - At home: Desk-based, remote
  - On site: Retail, hospitality, healthcare, construction
  - On the road: Logistics, sales, field engineering
- **Connections:**
  - *Comes from:* This Segment's work status.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Channel order (desktop and daytime channels for remote workers) and the customer journey (a thought, doc 33, row 7).

### 6. What is your customers' work schedule?

- **Control:** one choice (a radio).
- **Asked when:** The answer to "Are your customers working?" is Yes.
- **Options:**
  - Standard daytime hours
  - Shifts / varying hours
  - Flexible / their own hours
- **The "i" says:**
  - When they are free to shop and to be reached. Standard daytime workers shop at lunch and in the evening; shift workers have a very different daily routine.
  - Standard daytime hours: Traditional 9-to-5, fixed weekdays
  - Shifts / varying hours: Nights, weekends, rotating rosters
  - Flexible / their own hours: Freelancers, business owners, autonomous professionals
- **Connections:**
  - *Comes from:* This Segment's work status.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The times to reach them in the customer journey (a thought, doc 33, row 7).

### 7. How are your customers paid?

- **Control:** one choice (a radio).
- **Asked when:** The answer to "Are your customers working?" is Yes.
- **Options:**
  - Fixed salary
  - Hourly wage
  - Variable pay
- **The "i" says:**
  - How steady their pay is, not how much it is (that is the household income below).
  - A fixed salary suits regular subscriptions; variable or hourly earners feel sudden cash-flow dips.
  - Fixed salary: Predictable monthly/bi-weekly paycheck
  - Hourly wage: Fluctuating based on scheduled shifts
  - Variable pay: Freelance invoices, commission, seasonal contracts
- **Connections:**
  - *Comes from:* This Segment's work status.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Payment terms the Offering suggests (a thought, doc 33, row 7).

### 8. How high is your customers' household income?

- **Control:** a rating, 1 to 5 (`RatingScale`; owner, 2026-11-04). Answers saved before are read as: Low 1, Lower-middle 2, Middle 3, Upper-middle 4, High 5.
- **Asked when:** The buyer is people, and the age is not Minors.
- **Options:** the points 1 to 5.
- **The "i" says:**
  - 1 = Low, 5 = High.
  - Compare with the typical household income in their country: 3 is around the median.
  - Household income is what the home earns together, not one person's pay.
- **Connections:**
  - *Comes from:* This Segment's age (not asked of Minors).
  - *Read by (built):* The Market document and the export.
  - *Read by (built):* the Profile's E3 starts with "The price / budget" when this is rated 1 (doc 36).
  - *Read by (not built yet):* The Review: the price against what they earn.

### 9. What is the gender mix of your customers?

- **Control:** a rating, 1 to 5 (`RatingScale`; owner, 2026-11-04). Answers saved before are read as: Mostly men 1, Leans men 2, Balanced mix 3, Leans women 4, Mostly women 5.
- **Asked when:** The buyer is people.
- **Options:** the points 1 to 5.
- **The "i" says:**
  - 1 = Mostly men, 5 = Mostly women.
  - 1 is 80% or more men, 2 is 60 to 80%, 3 a balanced mix (40 to 60%), 4 is 60 to 80% women, 5 is 80% or more.
  - Choose 3 when it does not matter for what you sell.
- **Connections:**
  - *Comes from:* Nothing; the seller and buyer relationship (people).
  - *Read by (built):* The Market document and the export.
  - *Read by (built):* the Profile's A2, asked unless this is 3, and started from it: 1 or 2 Man, 4 or 5 Woman (doc 36).
  - *Read by (not built yet):* the Review: the Profile's gender should fit the mix.


## Box 2. Geographics

Both.

### 1. Where are your customers?

- **Control:** one choice (a radio).
- **Asked when:** Always.
- **Options:**
  - In my city / town
  - In my state / region
  - Across my country
  - In several countries
  - Anywhere online
- **The "i" says:**
  - The widest area most of your customers are spread over, now or as you plan it. If it is more than one, make another Segment.
- **Connections:**
  - *Read by (built, 2026-11-04):* the Competitor's K2 takes this list as its options, this Segment's answer first (doc 41).
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Channel suggestions by country; the Review (distant customers and delivery).

### 2. Where do your customers live or work?

- **Control:** a rating, 1 to 5 (`RatingScale`; owner, 2026-11-04). Answers saved before are read as: Rural / remote 1, Suburban 3, Urban 5.
- **Asked when:** Managing and Growing only (held back while Planning and Launching), and only when the answer above is the city or town, the state or region, or the country.
- **Options:** the points 1 to 5.
- **The "i" says:**
  - 1 = Rural, 5 = Urban.
  - 1 is countryside or remote places, 3 the suburbs and towns around a city, 5 a city centre.
  - Asked once the business is managing or growing, and only for customers in one place or one country.
- **Connections:**
  - *Comes from:* This Segment's reach, and the business stage (Organisation: the Opening Date).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Review (remote customers and delivery in person).


## Box 3. Business Data

The buyer is a business, or the Segment is of businesses where both relationships are chosen. For a business buyer this box comes before Geographics.

### 1. What kind of organisation are your customers?

- **Control:** one choice (a radio).
- **Asked when:** The buyer is a business. The types follow the scale chosen in Positioning: Solopreneurs & Freelancers: Self-employed only, so it is set and not shown; Startups & SMBs or Mid-Market: Private business and Non-profit; Enterprise or Public Sector adds Public body.
- **Options:**
  - Private business
  - Public body / Government agency
  - Non-profit / charity / NGO
  - Self-employed / freelancer / sole trader
- **The "i" says:**
  - Private business includes co-operatives. A social enterprise belongs here or under non-profit, by how it is owned.
  - Non-profit includes membership and professional bodies and religious organisations.
  - A public body is for example a government department, council, school or hospital.
  - Self-employed skips the question about size.
  - Private business: For-profit
- **Connections:**
  - *Comes from:* Early Positioning: the seller and buyer relationship (business), (Business Data has no tick).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The tender row for a public body on the Customer Engagement page; the Profile's kind of business.

### 2. How big are your customers' organisations?

- **Control:** one choice (a radio).
- **Asked when:** As above, and the type is not self-employed. When the type is changed to self-employed, an answer already given here is removed at once. The sizes follow the scale chosen in Positioning: Startups & SMBs: Micro and Small; Mid-Market: Medium-sized only (set, not shown); Enterprise or Public Sector: Large only (set, not shown); Solopreneurs & Freelancers: not asked.
- **Options:**
  - Micro, 1–9 employees
  - Small, 10–49 employees
  - Medium-sized, 50–249 employees
  - Large, 250+ employees
- **The "i" says:**
  - The EU's definition of small and medium-sized enterprises: micro under 10 employees, small under 50, medium-sized under 250.
  - Countries define them a little differently; the United States and Canada use other limits.
  - The sizes follow the scale chosen in Positioning.
- **Connections:**
  - *Read by (built, 2026-11-04):* the Competitor's K3 takes this list as its options (doc 41).
  - *Comes from:* This Segment's type of organisation.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Channel suggestions by size.

### 3. Which sector are your customers in?

- **Control:** one choice (a radio).
- **Asked when:** As the type.
- **Options:**
  - Resource extraction & energy
  - Manufacturing & construction
  - Consumer goods & retail
  - Infrastructure & finance
  - Tech, data & media, and business services
  - Human services & public sector, and other services
- **The "i" says:**
  - Six classes over the industries below. If they work in more than one industry, make another Segment.
- **Connections:**
  - *Comes from:* Early Positioning: the relationship (business).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The industry question.

### 4. Which industry are your customers in?

- **Control:** one choice (a radio).
- **Asked when:** After a sector is chosen; offers the industries of that sector.
- **Options:**
  - Farming, forestry and fishing
  - Mining, oil, gas and quarrying
  - Energy, water and waste
  - Manufacturing
  - Construction
  - Wholesale and retail trade
  - Hospitality
  - Arts, sport and recreation
  - Transport, postal and logistics
  - Finance and insurance
  - Real estate and property
  - Software, IT, media and telecoms
  - Professional, scientific and technical services
  - Administrative and support services
  - Government and public administration
  - Education
  - Health and social care
  - Other services
- **The "i" says:**
  - The industries of the sector chosen, as the official schemes (SIC and NACE, NAICS, ANZSIC) name their sections.
  - Government and public administration includes embassies and international bodies. Other services includes households that employ staff, such as cleaners and nannies.
- **Connections:**
  - *Comes from:* This Segment's sector.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile's kind of business; competitor industry overlap; channel suggestions by industry.


## Box 4. Purchasing Power & Behaviour

Part A (every Segment): questions 1 and 2. Part B (the buyer is people): 3 to 6. Part C (every Segment): 7 and 8. Part D (the buyer is a business): 9. A Segment of people is asked parts A, B and C; one of businesses, part D and the questions that are not about people.

### 1. How comfortable are your customers online?

- **Control:** a rating, 1 to 5 (`RatingScale`). Answers saved before 2026-11-04 are read as: Not very comfortable 1, Fairly comfortable 3, Very comfortable 5.
- **Asked when:** Always.
- **Options:** the points 1 to 5.
- **The "i" says:**
  - 1 = Uneasy, 5 = Confident.
  - How easily they use websites, apps and online payment, not whether they own a device.
- **Connections:**
  - *Read by (built, 2026-11-04):* the Profile's C2, not asked when this is rated 1, and D2's start: 4 or 5 starts "Works it out alone", 1 or 2 "Wants to talk to a person" (doc 36).
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Channel order (digital-only channels lower, personal help higher).

### 2. How do your customers like to socialise?

- **Control:** one choice (a radio).
- **Asked when:** The buyer is people.
- **Options:**
  - Mostly online (gaming, community servers, chat apps)
  - Online and in person
  - Mostly in person (events, hospitality, clubs, sports)
  - ("Mostly on their own" removed, owner 2026-11-04: it contradicted the question, which asks how they socialise, and nothing read it; a saved answer of it is dropped when read.)
- **The "i" says:**
  - Where they spend their free time. It decides how they meet brands and products.
- **Connections:**
  - *Comes from:* Early Positioning: the relationship (people).
  - *Read by (built):* The Market document and the export; the Profile's C4 (events) is asked when this is Online and in person or Mostly in person (doc 36).
  - *Read by (not built yet):* The Profile's social and interest hubs.

### 3. Where do your customers discover new products?

- **Control:** ticks, up to 3.
- **Asked when:** Always.
- **Options:**
  - Friends, family and colleagues
  - Online communities / forums
  - Creators / influencers / experts
  - Media, reviews and comparison sites
  - Feeds, ads and marketplace suggestions
- **The "i" says:**
  - Examples: communities such as Reddit, Discord and Facebook Groups; creators on TikTok, Instagram, YouTube and LinkedIn.
  - What you tick here is offered on the Profile as related platforms to choose from.
  - Choose up to three.
- **Connections:**
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile's related platforms; the order of the channels where customers discover you.

### 4. How do your customers share what they like?

- **Control:** ticks, as many as apply.
- **Asked when:** The buyer is people.
- **Exclusion:** choosing "They rarely share what they buy" clears every other choice, and choosing any other way clears it.
- **Options:**
  - They post it publicly on social media
  - They send it to friends in private chats
  - They tell people in person
  - They rarely share what they buy
- **The "i" says:**
  - Private chat apps are for example WhatsApp and iMessage. "They rarely share what they buy" excludes the other three.
- **Connections:**
  - *Comes from:* Early Positioning: the relationship (people).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile's habits.

### 5. What makes your customers go shopping?

- **Control:** ticks, up to 2.
- **Asked when:** The buyer is people.
- **Options:**
  - Boredom or entertainment (browsing feeds, window shopping)
  - Seeing a friend or creator use it
  - A need / problem to solve
  - Sales, seasons or planned gifts
- **The "i" says:**
  - Choose up to two.
- **Connections:**
  - *Comes from:* Early Positioning: the relationship (people).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The customer journey.

### 6. How do your customers usually decide to buy?

- **Control:** one choice (a radio).
- **Asked when:** The buyer is people.
- **Options:**
  - Straight away: They see it, like it and buy it there and then (was "On impulse", renamed 2026-11-06)
  - After comparing options: They weigh prices, features and reviews first
  - On a recommendation: They buy what friends, family or colleagues suggest
  - (Reworded 2026-11-05, owner: "improve the wording of the options". The ids are unchanged. Reading reviews was in two options before; it is comparing now, and advice from people they know is a recommendation, as the Profile's D1 starts already read them.)
- **The "i" says:**
  - Their usual way of buying, the one that fits most of them.
- **Connections:**
  - *Comes from:* Early Positioning: the relationship (people).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile's habits; the customer journey (consideration).

### 7. Where do your customers usually shop?

- **Control:** one choice (a radio).
- **Asked when:** Always.
- **Options:**
  - Online, on a phone
  - Online, on a computer
  - In a shop
  - Both online and in shops
- **The "i" says:**
  - Where most of their purchases start and finish. Choose Both online and in shops when they mix the two about equally.
- **Connections:**
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The order of the channels where customers buy; the customer journey.

### 8. How do your customers pay?

- **Control:** ticks, as many as apply.
- **Asked when:** Always. "Buy Now, Pay Later or financing" is not offered to Minors; "Invoice, bank transfer or purchase order" is not offered when the buyer is people only.
- **Options:**
  - Credit / debit card
  - Digital wallets
  - Cash
  - Buy Now, Pay Later or financing
  - Invoice, bank transfer or purchase order
- **The "i" says:**
  - Digital wallets are for example Apple Pay, Google Pay and PayPal. Buy Now, Pay Later is for example Klarna and Afterpay.
  - Cash is still about one payment in ten in the UK (UK Finance, 2024) [PAY-06].
  - Invoicing is asked for business customers only. Credit and Buy Now, Pay Later are not open to minors.
  - Choosing a phone as where they buy starts Digital wallets here; change it freely.
  - Select all that apply.
- **Connections:**
  - *Comes from:* This Segment's age (credit and Buy Now, Pay Later not for Minors) and Early Positioning's relationship (invoicing for business).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Offering's payment plan (instalments, invoicing) and the Direct Payment channels.

### 9. Who decides to buy?

- **Control:** ticks, as many as apply.
- **Asked when:** The buyer is a business. For a self-employed customer (chosen, or because only freelancers were chosen in Positioning) only "One person decides" is offered, so it is answered and not shown.
- **Options:**
  - One person decides: The person who uses it has the budget and the final say.
  - The team agrees: The people who use it try it and push it upward.
  - A manager signs off: Needs formal approval from a manager or executive.
  - Several departments check: IT or security, legal and finance.
  - Formal procurement: A tender or a request for proposals (RFP), with strict compliance.
- **The "i" says:**
  - Asked for business customers only. A formal procurement loop reveals the tender row on the Customer Engagement page.
  - Select all that apply.
- **Connections:**
  - *Comes from:* Early Positioning: the relationship (business).
  - *Read by (built):* The Market document and the export; the Profile's role in buying (A5 starts with every role where one person decides) and the proposed B2B Profiles by buying role (doc 36, 2).
  - *Read by (not built yet):* the tender row (a formal procurement loop).


## Box 5. Market Size & Industry Outlook

*Order (owner, 2026-11-06): size, then growth, then the changes, then crowding. In Box 4, how they socialise comes before where they discover new products.*

Both.

### 1. How many potential customers are there?

- **Control:** one choice (a radio).
- **Asked when:** Always.
- **Options:**
  - Very small niche, under 1,000
  - Specialist, 1,000–49,999
  - Mid-market, 50,000–499,999
  - Mass market, 500,000 or more
- **The "i" says:**
  - Everyone in the area you serve who could buy it, if every one of them chose you (the total addressable market).
  - For a Segment of businesses, count the organisations, not the people in them.
- **Connections:**
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export; the Business Plan's Market Analysis is covered once a market question is answered.
  - *Read by (not built yet):* The Review.

### 2. Is your market growing or shrinking?

- **Control:** a rating, 1 to 5 (`RatingScale`), the "i" first saying "1 = Shrinking, 5 = Booming.". Answers saved before 2026-11-04 are read as: Shrinking or disrupted 1, Flat / stable 3, Growing steadily 4, Growing fast 5.
- **Asked when:** Always.
- **Options:** the points 1 to 5.
- **The "i" says:**
  - Where the market is heading, apart from its size: a market can be large and declining, or small and expanding fast.
  - 1: falling demand, or deep structural change. 3: flat, a saturated market. 5: an emerging market, growing fast every year.
- **What it is for.** A growing market leaves room for a new business without taking customers from anyone; a shrinking one means winning them from the competitors already there. **As built, it is read only by the Market document and the export** (the Business Plan's Market Analysis). **Proposed (2026-11-04), not built:** the Competitor's K10 (doc 41) offers "Win new customers the market brings" when this is rated 4 or 5, and "Win customers from [competitor]" for a rival rated Strong on few values when it is rated 1 or 2; Strategy's Situation analysis reads it beside the crowding (Box 5, question 4).
- **Connections:**
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export; the Business Plan's Market Analysis is covered once a market question is answered.
  - *Read by (not built yet):* Competitor emphasis (a thought, doc 33, row 2).

### 3. What is changing most for your customers?

- **Control:** ticks, up to 2.
- **Asked when:** Always.
- **Options:**
  - Technology
  - Rules and law
  - The economy
  - Society and lifestyle
  - Supply and delivery
- **The "i" says:**
  - The changes that affect your customers most. Choose up to two.
  - Each Competitor is rated on how every one of these could affect it, the ones ticked here first.
  - Technology: Automation, AI, old systems being replaced
  - Rules and law: New compliance, tax changes, environmental mandates
  - The economy: Inflation, budget cuts, shifts in spending power
  - Society and lifestyle: Remote work, sustainability, changing habits
  - Supply and delivery: Material shortages, logistics costs, local sourcing
- **Connections:**
  - *Read by (built, 2026-11-04):* the Competitor's K9 rates each of these changes, the ones ticked here first (doc 41).
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export; the Business Plan's Market Analysis is covered once a market question is answered.
  - *Read by (not built yet):* The Review.

### 4. How crowded is your market?

- **Control:** a rating, 1 to 5 (`RatingScale`), the "i" first saying "1 = Open, 5 = Crowded.". Answers saved before 2026-11-04 are read as: Open 1, Fragmented 3, Crowded 5.
- **Asked when:** Always.
- **Options:** the points 1 to 5.
- **The "i" says:**
  - Red Ocean and Blue Ocean are the strategy terms of Kim and Mauborgne: a crowded market against an uncontested one.
  - 1: very few direct competitors; the niche is new. 3: many small players, none in control. 5: big established players and price wars.
- **Connections:**
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export; the Business Plan's Market Analysis is covered once a market question is answered.
  - *Read by (not built yet):* Competitor emphasis (a thought, doc 33, row 2).


## The end user (a part of the same card)

Asked when a buyer relationship chosen in Positioning has a Proxy or Dual-Intent buyer. Questions only.

### 1. How old are your customers?

- **Control:** one choice (a radio).
- **Asked when:** A buyer relationship chosen in Positioning has a Proxy or Dual-Intent buyer. The terms follow the end user's life stage chosen in Positioning: Minors: Baby, Child, Teenager; Young Adults: Young adult; Adults: Established, Peak, Mature; Seniors: Active Retirees, Dependent seniors. Not shown when only one term is left.
- **Options:**
  - Baby 0–2
  - Child 3–10
  - Teenager 11–17
  - Young adult 18–24
  - Established 25–39
  - Peak 40–54
  - Mature 55–64
  - Active Retirees 65–74
  - Dependent seniors 75+
- **The "i" says:**
  - Teenager covers Early Adolescence (11 to 13), Mid (13 to 16) and Late (16 to 18).
  - Each age group holds the years from its first number to its last, both included, so no age is in two groups (25–39, then 40–54).
- **Connections:**
  - *Comes from:* Early Positioning: the buyer's category (Proxy or Dual-Intent) and the end user's life stage.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile for the end user (proposed beside the buyer's).

### 2. Which school stage are your customers in?

- **Control:** one choice (a radio).
- **Asked when:** As the end user's life stage, and the relationship is Parent or guardian, or Caregiver. "Secondary school" is not offered when the end user is a Baby or a Child; one already chosen goes when the life stage changes. Not asked of an end user of 18 or more. A Baby: Early years only (set, not shown); a Child: Early years or Primary school; a Teenager: Secondary school only (set, not shown).
- **Options:**
  - Early years
  - Primary school
  - Secondary school
- **The "i" says:**
  - Asked of a parent or guardian, and of a caregiver, who buy for a child. Secondary school is not offered for a Baby or a Child.
- **Connections:**
  - *Comes from:* Early Positioning: the buyer and end user relationship; this part's life stage.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile for the end user.

### 3. Are your customers working?

- **Control:** one choice (a radio).
- **Asked when:** As the end user's life stage, and the relationship is Family member, Spouse or partner, Friend or acquaintance, Commercial & Professional, Other (personal) or Sponsor or funder. Not asked of a Baby or a Child.
- **Options:**
  - Yes
  - No
- **The "i" says:**
  - The same question as for the buyer, asked of the end user: an adult the buyer is related to, or sponsors.
  - Yes includes working full-time, part-time, on contract or self-employed.
  - No opens a second question about why they are not working.
- **Connections:**
  - *Comes from:* Early Positioning: the buyer and end user relationship.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile for the end user.

### 4. Why are your customers not working?

- **Control:** one choice (a radio).
- **Asked when:** As above, and the primary answer to "Are your customers working?" is No. "Retired" is not offered to a Baby, a Child or a Teenager.
- **Options:**
  - Student
  - Homemaker or carer
  - Looking for work
  - Retired
  - Unable to work
- **The "i" says:**
  - Choose the main reason.
  - Unable to work: sidelined from the workforce by a chronic medical condition, long-term illness or disability. They typically live on fixed support incomes.
- **Connections:**
  - *Comes from:* This part's work status and life stage.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Nothing yet.

### 5. What kind of work do your customers do?

- **Control:** one choice (a radio).
- **Asked when:** As the end user's life stage, and the relationship is Employer, Business partner or Other (business).
- **Options** (the nine ISCO-08 major groups, the list of the Profile's A3, doc 36; owner, 2026-11-03) [DEM-13]:
  - Manager / director
  - Professional
  - Technician / associate professional
  - Office / administrative work
  - Service, care or sales work
  - Farming, forestry or fishing
  - Skilled trade
  - Machine operator / driver
  - Routine / manual work
- **The "i" says:**
  - Based on: the ISCO-08 major groups (ILO).
  - Professional: for example a teacher, nurse, engineer or lawyer. Skilled trade: for example an electrician, plumber or chef.
  - Someone who owns and runs a business: Manager / director. Armed forces: choose the group that fits the role.
- **Saved answers:** "Owner or senior executive" (id `owner`) reads as Manager / director.
- **Connections:**
  - *Comes from:* Early Positioning: the buyer and end user relationship.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile for the end user.

### 6. What kind of organisation are their clients?

- **Control:** one choice (a radio).
- **Asked when:** As the end user's life stage, and the relationship is Business serving clients or Professional intermediary.
- **Options:**
  - Private business
  - Public body / Government agency
  - Non-profit / charity / NGO
  - Self-employed / freelancer / sole trader
- **The "i" says:**
  - Asked of a business serving clients and of a professional intermediary.
  - Private business: For-profit
- **Connections:**
  - *Comes from:* Early Positioning: the buyer and end user relationship.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile for the end user.

### 7. How big are their clients' organisations?

- **Control:** one choice (a radio).
- **Asked when:** As the clients' type, and the type is not self-employed.
- **Options:**
  - Micro, 1–9 employees
  - Small, 10–49 employees
  - Medium-sized, 50–249 employees
  - Large, 250+ employees
- **The "i" says:**
  - Skipped for self-employed clients.
- **Connections:**
  - *Comes from:* This part's type of organisation.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Nothing yet.

### 8. How comfortable are your customers online?

- **Control:** the rating of Box 4, question 1, with the same words and the same reading of older answers.
- **Asked when:** As the end user's life stage. Not asked of a Baby.
- **Options:** the points 1 to 5.
- **The "i" says:**
  - How easily they use websites, apps and online payment, not whether they own a device.
- **Connections:**
  - *Comes from:* Early Positioning: the buyer's category.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Channel order for the end user's side.
