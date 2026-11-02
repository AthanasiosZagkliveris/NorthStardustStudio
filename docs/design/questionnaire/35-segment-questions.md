# 35. The Segment's questions: every question and option as built

Status: **specification**, written 2026-11-01, updated 2026-11-02. Every question of the Segment card in the order it is asked, with its control, when it is asked, its options and what its "i" says.

Related: doc 36 (the Profile's questions, in the same form), doc 28 (6.3a, the Segment card in the specification), doc 31 (the age terms), doc 33 (the first version), doc 33 (thoughts, section 6), `src/framework/engine/SegmentQuestions.ts` (where these words are kept; where the two differ, the code is right).

The rules that hold for all of them: a radio is one choice, ticks are several (with a limit where stated); an option says its few words, and what is added in brackets or after a colon (an example, a range, an explanation, a platform or brand) is in the "i" of the question; a box has no free-text note; where they buy on a phone ("On a phone") and no way of paying is chosen yet, "Digital wallets" starts ticked, a starting value the user can change; a question that the answers above settle is **answered for the user and not shown** (owner, 2026-11-01): the Positioning scale of a business buyer sets the organisation's type and size; a self-employed customer decides alone; a retiree is not working and retired; a user's age sets the school stage and removes the work and tool questions that do not apply. A question with only one option left is likewise not shown (there is nothing to choose) and its answer is that option; an answer to a question that is no longer asked, or to an option no longer offered, is removed when the next choice is made. Where Identity chose both relationships (or none), there is no Business Data tick (owner, 2026-11-02): a Segment of people has no Business Data and a Segment of businesses has it and no Demographics. Where Positioning chose both B2C and B2B, the first two Segment cards are made for the user, with no question: the first of people (B2C), the second of businesses (B2B); one "+ Segment" button adds more, and a Segment added after them has one question that opens its first box, "Who is this Segment's customer?" (People (B2C), Businesses (B2B)). The kind is kept as the presence of the Business Data key in the Segment's Description and is asked the business's questions only (a Segment is one group, never both). What Positioning or the answers above have set in a box is said in one small line under its title ("Set for you from Positioning and your answers above: Size: no employees."), so an answer that is not asked is never silent. A radio whose options are short (each of 24 characters or fewer, 90 in all) stands in one row where the whole row fits its column and in one column where it does not, never in a row that wraps; the others stand in one column. The starting values (the work situation from the age group, a wallet from a phone) are said in the "i". Where Identity chose no relationship, the buyer is read from the buyer's category, then from the audience (a business scale is a business buyer, a life stage a person). Choosing an age term starts the work situation with the one that goes with it (a minor or a young adult: Student; an established, peak or mature adult: Employed; a retiree: Retired) where none is chosen; the user changes it freely. The two columns are of nearly one height: the boxes are shared between them by their length, each column keeping the order of the boxes. The card is laid out as the Positioning card is (two columns with a divider, each question a band, a double rule between boxes). The box titles are in capitals.




**Connections.** Under each question: *Comes from* is what it takes from Identity or from the Segment's own earlier answers (built); *Read by* is what reads it. Built: the Market document and the export list every answer as it stands once settled against Identity as it is now (an answer to a question Identity no longer asks, or to an option it no longer offers, is left out of them at once, and is removed from the Segment on its next choice), the Business Plan's Market Analysis counts as covered when a market question is answered, and the Segment's own questions follow one another as stated. *Not built yet* is what the design plans to read it (doc 28, 6.3a and 6.5; doc 33, section 15): until it is built, nothing else reads the answer.

## Box 1. Demographics

The people who pay (the buyer is people: B2C alone, or the first of the two Segments made where both are chosen). Questions that have no answer for Minors are skipped for them. The specialized needs (accessibility and caregiving) are not asked here: they belong to the Profile, which is specified in doc 36.

### 1. What age group are the people who pay?

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
  - Minors, semi-dependent: Mid and Late Adolescence. They have limited buying power and mostly use cash, wallets and gift cards; credit and long contracts are not open to them. Look up the country's online-consent age and its minimum working age.
  - Choose the group that pays, not the one that uses it.
  - Each age group holds the years from its first number to its last, both included, so no age is in two groups (25–39, then 40–54); the engine reads each as from the first up to, but not including, the next group's first.
- **Connections:**
  - *Comes from:* Early Positioning: the buyer's life stage (the terms offered) and the seller and buyer relationship (people).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile's typical age is chosen within this group, and the Profiles proposed follow it; the Review checks the online-consent ages.

### 2. What is the highest level of education most of them have reached?

- **Control:** one choice (a radio).
- **Asked when:** The buyer is people, and the age is not Minors.
- **Options:**
  - Did not finish high school
  - High school
  - Vocational / technical diploma
  - Bachelor's degree
  - Master's degree
  - Doctorate
- **The "i" says:**
  - Each level includes the ones below it: someone with a Master has a Bachelor's degree.
  - Examples: High school is A-levels or the Leaving Certificate (UK, Ireland), a high school diploma (USA, Canada) and Year 12 (Australia, New Zealand). A vocational or technical diploma is a post-school qualification such as a BTEC, a trade certificate or an associate degree.
  - Master's degree: Master
- **Connections:**
  - *Comes from:* This Segment's age (not asked of Minors).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The order of the Profile's job levels.

### 3. Are they working?

- **Control:** one choice (a radio).
- **Asked when:** The buyer is people. For Active Retirees and Dependent seniors it is set to "Not currently working" and not shown.
- **Options:**
  - Working
  - Not currently working
- **The "i" says:**
  - Working includes full-time, part-time, contract and self-employed roles.
  - Not currently working opens a second question about their main daily role.
- **Connections:**
  - *Comes from:* This Segment's age: choosing the age term starts it.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile's job level (for someone working).

### 4. What best describes their situation?

- **Control:** one choice (a radio).
- **Asked when:** The work status is "Not currently working". "Retired" is not offered to Minors. For Active Retirees and Dependent seniors it is set to "Retired" and not shown.
- **Options:**
  - Student
  - Homemaker / carer
  - Looking for work
  - Retired
  - Unable to work (illness / disability)
- **The "i" says:**
  - Choose their dominant daily role.
  - Unable to work: sidelined from the workforce by a chronic medical condition, long-term illness or disability. They typically live on fixed support incomes.
- **Connections:**
  - *Comes from:* This Segment's work status and age ("Retired" not for Minors).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Nothing yet.

### 5. Where do they mainly work?

- **Control:** one choice (a radio).
- **Asked when:** The work status is "Working".
- **Options:**
  - At home
  - In an office
  - On site
  - On the road
- **The "i" says:**
  - Where they spend most of their working hours. Remote workers are online through the day; frontline and field workers are highly mobile but have little screen time during shifts.
  - At home: Desk-based, remote
  - On site: Retail, hospitality, healthcare, construction
  - On the road: Logistics, sales, field engineering
- **Connections:**
  - *Comes from:* This Segment's work status.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Channel order (desktop and daytime channels for remote workers) and the customer journey (a thought, doc 33, row 7).

### 6. When do they work?

- **Control:** one choice (a radio).
- **Asked when:** The work status is "Working".
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

### 7. How is their income paid?

- **Control:** one choice (a radio).
- **Asked when:** The work status is "Working".
- **Options:**
  - Fixed salary
  - Hourly wage
  - Variable
- **The "i" says:**
  - How steady their pay is, not how much it is (that is the household income below). A fixed salary suits regular subscriptions; variable or hourly earners are sensitive to sudden cash-flow dips.
  - Fixed salary: Predictable monthly/bi-weekly paycheck
  - Hourly wage: Fluctuating based on scheduled shifts
  - Variable: Freelance invoices, commission, seasonal contracts
- **Connections:**
  - *Comes from:* This Segment's work status.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Payment terms the Offering suggests (a thought, doc 33, row 7).

### 8. How would you describe their household income?

- **Control:** one choice (a radio).
- **Asked when:** The buyer is people, and the age is not Minors.
- **Options:**
  - Low
  - Lower-middle
  - Middle
  - Upper-middle
  - High
- **The "i" says:**
  - Compare with the typical household income in their country: Middle is around the median, Low and High are the two ends, and Lower-middle and Upper-middle lie between.
  - Household income is what the home earns together, not one person's pay.
- **Connections:**
  - *Comes from:* This Segment's age (not asked of Minors).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Review: the price against what they earn.

### 9. What is the usual gender mix of your customers?

- **Control:** one choice (a radio).
- **Asked when:** The buyer is people.
- **Options:**
  - Mostly men
  - Leans men
  - Balanced mix
  - Leans women
  - Mostly women
- **The "i" says:**
  - The share of your customers who are men or women. Choose Balanced mix when it does not matter for what you sell.
  - Mostly men: 80%+
  - Leans men: 60–80%
  - Balanced mix: 40–60%
  - Leans women: 60–80%
  - Mostly women: 80%+
- **Connections:**
  - *Comes from:* Nothing; the seller and buyer relationship (people).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile's gender (the Review: it should fit the mix).


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
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Channel suggestions by country; the Review (distant customers and delivery).

### 2. Where do they live or work?

- **Control:** one choice (a radio).
- **Asked when:** Managing and Growing only (held back while Planning and Launching), and only when the answer above is the city or town, the state or region, or the country.
- **Options:**
  - Urban
  - Suburban
  - Rural / Remote
- **The "i" says:**
  - The kind of place they live or work in. Asked once the business is managing or growing, and only for customers in one place or one country.
  - Urban: High-density city center
  - Suburban: Residential towns surrounding a city
  - Rural / Remote: Low-density countryside or isolated areas
- **Connections:**
  - *Comes from:* This Segment's reach, and the business stage (Organization: the Opening Date).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Review (remote customers and delivery in person).


## Box 3. Business Data

The buyer is a business, or the Segment is of businesses where both relationships are chosen. For a business buyer this box comes before Geographics.

### 1. What type of organisation are they?

- **Control:** one choice (a radio).
- **Asked when:** The buyer is a business. The types follow the scale chosen in Positioning: Solopreneurs & Freelancers: Self-employed only, so it is set and not shown; Startups & SMBs or Mid-Market: Private business and Non-profit; Enterprise / Public Sector adds Public body.
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

### 2. How big are these organisations?

- **Control:** one choice (a radio).
- **Asked when:** As above, and the type is not self-employed. When the type is changed to self-employed, an answer already given here is removed at once. The sizes follow the scale chosen in Positioning: Startups & SMBs: Micro and Small; Mid-Market: Medium-sized only (set, not shown); Enterprise / Public Sector: Large only (set, not shown); Solopreneurs & Freelancers: not asked.
- **Options:**
  - Micro business
  - Small business
  - Medium-sized business
  - Large enterprise
- **The "i" says:**
  - The EU's definition of small and medium-sized enterprises: micro under 10 employees, small under 50, medium-sized under 250. Countries define them a little differently (the United States and Canada by other limits).
  - Micro business: 1 to 9 employees
  - Small business: 10 to 49 employees
  - Medium-sized business: 50 to 249 employees
  - Large enterprise: 250+ employees
- **Connections:**
  - *Comes from:* This Segment's type of organisation.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Channel suggestions by size.

### 3. Which sector are they in?

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

### 4. Which industry are they in?

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
  - Education and training
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

### 1. How comfortable are they with online tools?

- **Control:** one choice (a radio).
- **Asked when:** Always.
- **Options:**
  - Not comfortable / Traditional
  - Comfortable
  - Very comfortable / Digital native
- **The "i" says:**
  - How easily they use websites, apps and online payment, not whether they own a device.
- **Connections:**
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Channel order (digital-only channels lower, personal help higher).

### 2. Where do they find and check new products?

- **Control:** ticks, up to 3.
- **Asked when:** Always.
- **Options:**
  - Friends, family and colleagues
  - Online communities / forums
  - Creators / influencers / experts
  - Media, reviews and comparison sites
  - Feeds, ads and marketplace suggestions
- **The "i" says:**
  - Examples: communities such as Reddit, Discord and Facebook Groups; creators on TikTok, Instagram, YouTube and LinkedIn. What you tick here is offered on the Profile as related platforms to choose from.
  - Choose up to three.
  - Friends, family and colleagues: friends, family, colleagues
  - Feeds, ads and marketplace suggestions: Feeds, targeted ads, marketplace recommendations
- **Connections:**
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile's related platforms; the order of the channels where customers discover you.

### 3. How do they spend their social time?

- **Control:** one choice (a radio).
- **Asked when:** The buyer is people.
- **Options:**
  - Mostly online
  - Online and in person
  - Mostly in person
  - Not very social / independent
- **The "i" says:**
  - Where they spend their free time. It decides how they meet brands and products.
  - Mostly online: Gaming, community servers, chat apps
  - Mostly in person: Events, hospitality, clubs, sports
- **Connections:**
  - *Comes from:* Early Positioning: the relationship (people).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile's social and interest hubs.

### 4. How do they share what they like?

- **Control:** ticks, as many as apply.
- **Asked when:** The buyer is people.
- **Exclusion:** choosing "They rarely share what they buy" clears every other choice, and choosing any other way clears it.
- **Options:**
  - They post it publicly on social media
  - They send it to friends in private chats
  - They tell people in person
  - They rarely share what they buy
- **The "i" says:**
  - Private chat apps are for example WhatsApp and iMessage. "They don't typically share" excludes the other three.
- **Connections:**
  - *Comes from:* Early Positioning: the relationship (people).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile's habits.

### 5. What usually starts them shopping?

- **Control:** ticks, up to 2.
- **Asked when:** The buyer is people.
- **Options:**
  - Boredom / Entertainment
  - Seeing a friend or creator use it
  - Immediate necessity / specific problem
  - Seasonal trends / sales / planned gifts
- **The "i" says:**
  - Choose up to two.
  - Boredom / Entertainment: Browsing feeds, window shopping
  - Seeing a friend or creator use it: Seeing a friend or creator use a product
- **Connections:**
  - *Comes from:* Early Positioning: the relationship (people).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The customer journey.

### 6. How do they usually decide to buy?

- **Control:** one choice (a radio).
- **Asked when:** The buyer is people.
- **Options:**
  - Impulse buyer
  - The Researcher
  - Social validator
- **The "i" says:**
  - Their usual way of buying, the one that fits most of them.
  - Impulse buyer: Sees it, likes it, buys it at once
  - Researcher: Compares at length before buying
  - Validator: Asks a friend or checks reviews before paying
- **Connections:**
  - *Comes from:* Early Positioning: the relationship (people).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile's habits; the customer journey (consideration).

### 7. Where do they usually buy?

- **Control:** one choice (a radio).
- **Asked when:** Always.
- **Options:**
  - On a phone
  - On a computer
  - In a shop
  - Online and in shops
- **The "i" says:**
  - Where most of their purchases start and finish. Choose Multi-channel when they mix online and in-person about equally.
  - Online and in shops: Mix of online and offline retail
- **Connections:**
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The order of the channels where customers buy; the customer journey.

### 8. How do they prefer to pay?

- **Control:** ticks, as many as apply.
- **Asked when:** Always. "Buy Now, Pay Later / financing" is not offered to Minors; "Invoice / bank transfer / purchase order" is not offered when the buyer is people only.
- **Options:**
  - Credit / debit card
  - Digital wallets
  - Buy Now, Pay Later / financing
  - Invoice / bank transfer / purchase order
- **The "i" says:**
  - Digital wallets are for example Apple Pay, Google Pay and PayPal. Buy Now, Pay Later is for example Klarna and Afterpay.
  - Invoicing is asked for business customers only. Credit and Buy Now, Pay Later are not open to minors.
  - Select all that apply.
- **Connections:**
  - *Comes from:* This Segment's age (credit and Buy Now, Pay Later not for Minors) and Early Positioning's relationship (invoicing for business).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Offering's payment plan (instalments, invoicing) and the Direct Payment channels.

### 9. How is the decision to buy made?

- **Control:** ticks, as many as apply.
- **Asked when:** The buyer is a business. For a self-employed customer (chosen, or because only freelancers were chosen in Positioning) it is set to "Sole practitioner decision" and not shown.
- **Options:**
  - Sole practitioner decision
  - End-user champions / Department consensus
  - Executive / Budget-holder sign-off
  - Multi-department evaluation
  - Formal procurement loop
- **The "i" says:**
  - Asked for business customers only. A formal procurement loop reveals the tender row on the Customer Engagement page.
  - Select all that apply.
  - One person decides: The user has the budget and the final say.
  - The team agrees: Users try it and push it upward.
  - A manager signs off: Needs formal approval from a manager or executive.
  - Several departments check: IT or security, legal and finance.
  - Formal procurement: A tender or a request for proposals (RFP), with strict compliance.
- **Connections:**
  - *Comes from:* Early Positioning: the relationship (business).
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile's part in the purchase and hints; the tender row (a formal procurement loop).


## Box 5. Market Size & Industry Outlook

Both.

### 1. Where is their industry or niche heading?

- **Control:** one choice (a radio).
- **Asked when:** Always.
- **Options:**
  - Growing fast
  - Growing steadily
  - Flat / stable
  - Shrinking / disrupted
- **The "i" says:**
  - Where the market is heading, apart from its size: a market can be large and declining, or small and expanding fast.
  - Growing fast: Emerging market, high year-on-year growth
  - Growing steadily: Mature market, predictable upward trend
  - Flat / stable: Saturated market, consistent volume but low growth
  - Shrinking / disrupted: Shrinking market or undergoing severe structural changes
- **Connections:**
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export; the Business Plan's Market Analysis is covered once a market question is answered.
  - *Read by (not built yet):* Competitor emphasis (a thought, doc 33, row 2).

### 2. How many potential customers are there in all (your Total Addressable Market, TAM)?

- **Control:** one choice (a radio).
- **Asked when:** Always.
- **Options:**
  - Very small niche
  - Specialist
  - Mid-market
  - Mass market
- **The "i" says:**
  - The total number of potential buyers if you had 100% of the market, in the area you serve.
  - Very small niche: Fewer than 1,000 potential customers
  - Specialist: 1,000 to 50,000 potential customers
  - Mid-market: 50,000 to 500,000 potential customers
  - Mass market: 500,000+ potential customers
- **Connections:**
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export; the Business Plan's Market Analysis is covered once a market question is answered.
  - *Read by (not built yet):* The Review.

### 3. Which trends affect your buyers most right now?

- **Control:** ticks, up to 2.
- **Asked when:** Always.
- **Options:**
  - Technological changes
  - Regulatory/Legal shifts
  - Economic pressures
  - Socio-cultural changes
  - Supply chain & infrastructure
- **The "i" says:**
  - Choose up to two.
  - Technology: Automation, AI, old systems being replaced
  - Rules and law: New compliance, tax changes, environmental mandates
  - Money: Inflation, budget cuts, shifts in spending power
  - Society and lifestyle: Remote work, sustainability, changing habits
  - Supply and delivery: Material shortages, logistics costs, local sourcing
- **Connections:**
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export; the Business Plan's Market Analysis is covered once a market question is answered.
  - *Read by (not built yet):* The Review.

### 4. How crowded is their market?

- **Control:** one choice (a radio).
- **Asked when:** Always.
- **Options:**
  - Crowded
  - Fragmented
  - Open
- **The "i" says:**
  - Red Ocean and Blue Ocean are the strategy terms of Kim and Mauborgne: a crowded market against an uncontested one.
  - Crowded: Red Ocean. Dominated by big established players; price wars are common.
  - Fragmented: Many small and medium players; none controls the market.
  - Open: Blue Ocean. Very few direct competitors; the niche is new.
- **Connections:**
  - *Comes from:* Nothing.
  - *Read by (built):* The Market document and the export; the Business Plan's Market Analysis is covered once a market question is answered.
  - *Read by (not built yet):* Competitor emphasis (a thought, doc 33, row 2).


## The user (a part of the same card)

Asked when a buyer relationship chosen in Positioning has a Proxy or Dual-Intent buyer. Questions only.

### 1. What life stage is the user in?

- **Control:** one choice (a radio).
- **Asked when:** A buyer relationship chosen in Positioning has a Proxy or Dual-Intent buyer. The terms follow the user's life stage chosen in Positioning: Minors: Baby, Child, Teenager; Young Adults: Young adult; Adults: Established, Peak, Mature; Seniors: Active Retirees, Dependent seniors. Not shown when only one term is left.
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
  - Each age group holds the years from its first number to its last, both included, so no age is in two groups (25–39, then 40–54); the engine reads each as from the first up to, but not including, the next group's first.
- **Connections:**
  - *Comes from:* Early Positioning: the buyer's category (Proxy or Dual-Intent) and the user's life stage.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile for the user (proposed beside the buyer's).

### 2. What school stage are they at?

- **Control:** one choice (a radio).
- **Asked when:** As the user's life stage, and the relationship is Parent or guardian, or Caregiver. "Secondary school" is not offered when the user is a Baby or a Child; one already chosen goes when the life stage changes. Not asked of a user of 18 or more. A Baby: Early years only (set, not shown); a Child: Early years or Primary school; a Teenager: Secondary school only (set, not shown).
- **Options:**
  - Early years
  - Primary school
  - Secondary school
- **The "i" says:**
  - Asked of a parent or guardian, and of a caregiver, who buy for a child. Secondary school is not offered for a Baby or a Child.
- **Connections:**
  - *Comes from:* Early Positioning: the buyer and user relationship; this part's life stage.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile for the user.

### 3. Are they working?

- **Control:** one choice (a radio).
- **Asked when:** As the user's life stage, and the relationship is Family member, Spouse or partner, Friend, Commercial & Professional, Other (personal) or Sponsor or funder. Not asked of a Baby or a Child.
- **Options:**
  - Working
  - Not currently working
- **The "i" says:**
  - The same question as for the buyer, asked of the user: an adult the buyer is related to, or sponsors.
  - Working includes full-time, part-time, contract and self-employed roles.
  - Not currently working opens a second question about their main daily role.
- **Connections:**
  - *Comes from:* Early Positioning: the buyer and user relationship.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile for the user.

### 4. What best describes their situation?

- **Control:** one choice (a radio).
- **Asked when:** As above, and the primary work status is "Not currently working". "Retired" is not offered to a Baby, a Child or a Teenager.
- **Options:**
  - Student
  - Homemaker / carer
  - Looking for work
  - Retired
  - Unable to work (illness / disability)
- **The "i" says:**
  - Choose their dominant daily role.
  - Unable to work: sidelined from the workforce by a chronic medical condition, long-term illness or disability. They typically live on fixed support incomes.
- **Connections:**
  - *Comes from:* This part's work status and life stage.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Nothing yet.

### 5. What kind of work do they do?

- **Control:** one choice (a radio).
- **Asked when:** As the user's life stage, and the relationship is Employer, Business partner or Other (business).
- **Options:**
  - Owner / senior executive
  - Manager
  - Professional / specialist
  - Technician / skilled trade
  - Administrative / sales / service
  - Operator / labourer
- **The "i" says:**
  - The ISCO-08 major groups, in plain words.
- **Connections:**
  - *Comes from:* Early Positioning: the buyer and user relationship.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile for the user.

### 6. What type of organisation are their clients?

- **Control:** one choice (a radio).
- **Asked when:** As the user's life stage, and the relationship is Business serving clients or Professional intermediary.
- **Options:**
  - Private business
  - Public body / Government agency
  - Non-profit / charity / NGO
  - Self-employed / freelancer / sole trader
- **The "i" says:**
  - Asked of a business serving clients and of a professional intermediary.
  - Private business: For-profit
- **Connections:**
  - *Comes from:* Early Positioning: the buyer and user relationship.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* The Profile for the user.

### 7. How big are the clients' organisations?

- **Control:** one choice (a radio).
- **Asked when:** As the clients' type, and the type is not self-employed.
- **Options:**
  - Micro business
  - Small business
  - Medium-sized business
  - Large enterprise
- **The "i" says:**
  - Skipped for self-employed clients.
  - Micro business: 1 to 9 employees
  - Small business: 10 to 49 employees
  - Medium-sized business: 50 to 249 employees
  - Large enterprise: 250+ employees
- **Connections:**
  - *Comes from:* This part's type of organisation.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Nothing yet.

### 8. How comfortable are they with online tools?

- **Control:** one choice (a radio).
- **Asked when:** As the user's life stage. Not asked of a Baby.
- **Options:**
  - Not comfortable / Traditional
  - Comfortable
  - Very comfortable / Digital native
- **The "i" says:**
  - How easily they use websites, apps and online payment, not whether they own a device.
- **Connections:**
  - *Comes from:* Early Positioning: the buyer's category.
  - *Read by (built):* The Market document and the export.
  - *Read by (not built yet):* Channel order for the user's side.
