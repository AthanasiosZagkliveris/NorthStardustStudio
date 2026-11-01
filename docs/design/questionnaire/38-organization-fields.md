# 38. The Organization tile: every field and option, as built

Status: **specification**, written 2026-11-01, updated 2026-11-01. Every field of the Organization tile (Identity System, page 1, the tile before Early Positioning) in the order it is asked, with its control, when it is asked, its options, what its "i" says and what it connects to.

Related: doc 39 (Early Positioning, the next tile, in the same form), doc 36 (the Segment's questions), doc 28 (8.5 the tile as designed; 8.2a the stage, the Opening Date and the key dates), doc 35 (the countries, the activity cascade and the codes), doc 33 (the first version: six countries and Other), `src/components/interview/editors/legal/`.

**The tile** is one dialog of two columns with a divider: the left one is where the organization is (name, country, address), the right one is what it is and does (legal form, dates, activities); the Notes stand under both. Controls are the existing ones (text cell, `OptionPicker`, date cell, `ActivitiesField`, the shared optional note). A field that depends on the country waits for it: it is frozen, with a hint saying what to choose first, until the country is chosen. **Connections** are named as in doc 36: *Comes from* is what the field takes from another answer; *Read by* is what reads it (built, and not built yet).

## 1. The left column: where the organization is

### 1. Organization Name

- **Control:** a text cell. Placeholder: "The legal name of the organization".
- **Asked when:** always.
- **The "i":** none.
- **Connections:**
  - *Comes from:* nothing.
  - *Read by (built):* the page's titles and the organization's name across the app, the documents and the exports.

### 2. Country

- **Control:** one choice (the existing picker).
- **Asked when:** always. It comes first because it decides the registry, the tax, the legal forms and the classification of the activities.
- **Options:** the six countries of the first version (United Kingdom, Ireland, United States, Canada, Australia, New Zealand) and Other.
- **The "i":** none.
- **Connections:**
  - *Comes from:* nothing. Changing it empties what depends on it (the state or region, the legal form, the activities).
  - *Read by (built):* the legal forms offered, the registry and the registration fields, the tax name, the currency, the activity classification and its code, the address lines' wording; the Legal Entity page, the financials, the Review, the Calendar and the exports.
  - *Read by (not built yet):* the Segment's first customer question and the lists by country (doc 28, 8.2, "What the Segment will read").

### 3. Other country

- **Control:** one choice (the picker, searchable, with aliases such as "UK" and "USA").
- **Asked when:** Country is Other.
- **Options:** every country but the six.
- **The "i":** none.
- **Connections:** as Country; for these countries the legal form is one of the five generic forms and the activity and its code are typed.

### 4. State or Region

- **Control:** one choice (the picker, searchable; its label is the country's own word, for example State, Province or Region).
- **Asked when:** the country has a subdivision that changes an answer: which registry, whether a consumption tax applies. Not for the countries where it changes nothing. Frozen until the country is chosen.
- **Options:** the country's subdivisions, then Other.
- **The "i":** none.
- **Connections:**
  - *Comes from:* the country.
  - *Read by (built):* the registry, the tax and, where it applies, the legal forms.

### 5. Address

- **Control:** a text box of several lines (at least two, growing with the text). Placeholder: the lines expected, in the country's words (the city, then the street and the country's postal code name, or the street alone where addresses carry no code).
- **Asked when:** a country is chosen (frozen until then).
- **The "i":** none.
- **Connections:**
  - *Comes from:* the country (the placeholder).
  - *Read by (built):* the exports and the documents (the registered address). *Not built yet:* the Segment does not read it (an address in free text cannot start where the customers are).

## 2. The right column: what it is and does

### 6. Legal Form

- **Control:** one choice (the picker), the country's forms and Other; where a country has no list of its own, the five generic forms.
- **Asked when:** a country is chosen (frozen until then).
- **Options:** the country's legal forms (doc 35); Other.
- **The "i" says:** Decides who is liable for the organization's debts: the organization, or you personally. Decides how it is taxed, and whether it must hold share capital. Choose Other to name a form the list does not carry.
- **Connections:**
  - *Comes from:* the country.
  - *Read by (built):* the Name the legal form field; the tax, the Founders' capital question and the Legal Entity page; the documents and the exports.

### 7. Name the legal form

- **Control:** a text cell.
- **Asked when:** the legal form is Other.
- **The "i":** none.

### 8. Registration Date

- **Control:** a date cell.
- **Asked when:** always. It cannot be later than today (the cell's limit), nor later than the Opening Date (the Review says so).
- **The "i" says:** The day the organization was registered with the registry of its country. It is its own date: it does not depend on the registration number, and the number does not depend on it. It cannot be later than today, nor later than the Opening Date: the business cannot open before the company exists.
- **Connections:**
  - *Comes from:* nothing; it is checked against the Opening Date. It is saved with the Legal Entity page's formation.
  - *Read by (built):* the plan's start (the legal expenses), the key dates on the Review and the Calendar.

### 9. Opening Date

- **Control:** a date cell.
- **Asked when:** always. It can be changed at any time.
- **The "i" says:** The day the business opens and issues its first receipt. It sets the stage: planning before it, launching from it. The stage also sets the name of the Positioning tile and how many choices each of its questions allows. When a new date moves the business into another stage, an answer that no longer fits goes back to empty. The days from the plan's start to the day before it are the pre-operational period: every cost is split around it by its own dates. You can change it at any time.
- **Connections:**
  - *Comes from:* nothing (it is saved with the Global Settings).
  - *Read by (built):* the business stage (Planning, Launching, Managing, Growing) and so the name and the limits of Early Positioning (doc 39), the number of Segments, the questions the Segment holds back; the financial plan's pre-operational period; the key dates on the Review and the Calendar.

### 10. Activities

- **Control:** up to four rows, each the existing activities field (a cascade of dropdowns for the six countries, ending in the country's official code; typed activity and code for Other). The first row is required, the others optional.
- **Asked when:** a country is chosen (frozen until then).
- **The "i" says:** The primary activity is required; the others are optional, up to four in all. Each one ends in one official code of your country (the code of its classification scheme); for Other the activity and its code are typed.
- **Connections:**
  - *Comes from:* the country (the classification scheme and its edition).
  - *Read by (built):* the exports and the documents (the activities line).
  - *Read by (not built yet):* the industry pack's examples and the Segment's name suggestions (doc 35, 5.6); it never fills the Segment's industry, which is the customers', not the seller's.

## 3. Under both columns

### 11. Notes

- **Control:** the shared optional note: a tick and the word, the box opening on ticking. It saves the page's Description.
- **Asked when:** always (optional).
- **The "i" says:** Who are you, and what do you do? What do you create or provide? Write it as a registry or a bank would expect to read it. Name, country, address and legal form are above.
- **Connections:**
  - *Read by (built):* the Business Plan's company description and the exports.

**Built on 2026-11-01 (owner's decision):** (1) the empty Country picker shows the country the browser suggests as a soft hint ("Select a country, for example United Kingdom"), from the language's region, else the time zone, for the six countries only; it is never chosen for the user (`BrowserRegion.ts`); (2) the Registration Date is not asked, not required and not checked where the legal form is a sole trader or a sole proprietorship in the six countries (`registrationDateApplies`); what is already saved stays.

The Founders' questions (the capital tick, each founder's roles, hours and contribution) belong to the next tile of the page, not to this one.
