# 51. Delivery and capacity: what the sources say, what the app asks, what could be added

Status: **proposal**, written 2026-11-14, for the owner's decision (owner, 2026-11-14 17:44: "Do online research regarding delivery and capacity of an offering. Compare it with the Delivery dialogue and floated cards, and the Capacity dialogue card. Check if and what is missing."). Nothing here is built.

Related: doc 50 (Sales Forecast, seasons read from D3), doc 43 (the Offering card, O10 and O15), doc 48 (the Financial pages), `src/components/interview/editors/capability/useCapabilityActivityAndDelivery.tsx` (the Delivery dialog and cards), `src/framework/engine/DemandCapacity.ts` (`founderDeliveryHours`, `capacityCheck`), `src/components/interview/editors/FinancialSustainabilityEditor.tsx` ("Can the Expected Sales Be Delivered?").

## 1. What the sources say

### 1.1 Capacity, utilisation and efficiency

- **Design and effective capacity.** Design capacity is the most a business can deliver in ideal conditions; effective capacity is what is left once absences, repairs, restocking and shortages are allowed for. Utilisation is output ÷ design capacity; efficiency is output ÷ effective capacity, and it can pass 100% when fewer setbacks come than planned. Example: 200 bikes a month by design, 150 effective, 160 made: 80% utilisation, about 107% efficiency (Sophia, *Capacity Planning*, adapted from Saylor Academy and NSCC *Operations Management*).
- **Three horizons.** Long term (18 months and more): premises, recruiting and training specialist people; medium term (3 to 18 months): seasonal patterns, shifts, temporary staff; short term (under 3 months): the right people in the right place each day. Long-term choices have long lead times, so a resource can end up short or idle when plans change (The Open University, OpenLearn, *Capacity and demand management*, section 5).
- **Lead, follow or track.** Capacity can be added before demand arrives, after it arrives, or step by step with it (Sophia, *Capacity Planning*). A level plan keeps capacity fixed and is easy to run; a chase plan moves it with the forecast, comes in blocks (one more person, one more shift) and keeps people busier, which can tire them; most services mix the two (OpenLearn, *Capacity and demand management*, section 9).

### 1.2 Throughput, lead time and work in progress

- **Little's Law:** work in progress = throughput × time in the system. Knowing two gives the third. Work in progress above what the bottleneck can take adds waiting and lengthens the time each job takes, while the output stays the same (H. J. James Choo, Project Production Institute, *Little's Law: a practical approach to understanding production system performance*, 2016; John D. C. Little, *Little's Law as viewed on its 50th anniversary*, Operations Research 59(3), 2011).
- **Calendar time is longer than working time.** Each job's time from start to finish holds its working hours and its waiting; at high utilisation the waiting grows fastest (Choo, 2016).

### 1.3 Bottlenecks and constraints

- **The constraint sets the output of the whole business.** Identify it, get the most from it, fit everything else around it, then add to it, and look again for the next one (Theory of Constraints Institute, *Five Focusing Steps*, after Eliyahu M. Goldratt, *The Goal*).
- For a founder-led business the constraint is usually one person's hours or one piece of equipment: a loom, a kiln, a treatment room, a van.

### 1.4 Batches and set-up time

- **Set-up time comes once a batch.** At the same demand, halving the batch doubles the set-ups, so each set-up has to take half as long to keep the same capacity; from batches of 1,000 with a 60-minute changeover to batches of 500 with a 30-minute one (Kaizen Institute, *How can SMED cut batch sizes and increase production flexibility?*).
- For a maker this is the time to warp a loom, fire a kiln, set up a market stall or prepare a kitchen: it divides across the units in the batch.

### 1.5 Service capacity and queues

- **A service is used as it is made.** Its spare hours are gone once the day passes, so a service firm manages demand and runs different capacity in busy and quiet periods (Gabriel Bitran, MIT OpenCourseWare 15.778, *Management of supply networks for products and services*, 2004; read in excerpt).
- **Queues come from variation.** Arrivals and job lengths vary, so queues form even when capacity is above average demand. Expected queues rise clearly once utilisation passes about 60 to 70%, and at 100% with variation the queue keeps growing. Some customers leave or never join, so the queue shows as lost sales. Pooling work into one queue helps; spare capacity is the price of being available (OpenLearn, *Capacity and demand management*, sections 3 and 11).
- **Waiting grows as 1 ÷ (1 − utilisation).** Waiting is about 2 times the job's own time at 50% busy, 5 times at 80%, 10 times at 90% and 100 times at 99% (John D. Cook, *Server utilization: Joel on queueing*, 2009). Going from 99% to 98% busy halves the waiting (Michel Baudin, *Saturation in manufacturing versus service*, 2017).

### 1.6 A sensible maximum utilisation

- Planners keep a bottleneck below about 80 to 85% busy: above it, the time each job takes is very likely to jump (Choo, 2016, after Kingman, 1961). A plan needs room for illness, a late supplier, a rework or a busy week; at 100%, each of them becomes late work.

### 1.7 Seasons and peaks

- **Seasonality** is a repeating pattern by the year (weather, Christmas, Easter), and by the day or the hour for many services; a narrow sales window makes timing matter most (OpenLearn, *Capacity and demand management*, section 7).
- **Staff for the peak** with overtime, temporary people or outsourcing, planned ahead, and keep cash for peak stock and the quiet months (NI Business Info, *Employing staff in seasonal businesses* and *Considerations for seasonal businesses*; read in excerpt).

### 1.8 Adding capacity: outsourcing, hiring and training

- **Contractors and subcontractors** give flexibility for peaks; they can cost more than an employee's day rate, and the business depends on their standards and availability (NI Business Info, *Advantages and disadvantages of using a contractor or subcontractor*; read in excerpt).
- **Hiring takes weeks.** UK employers took about 5.1 weeks from advert to a filled role in late 2024, larger firms 5.6 (Totaljobs, *Hiring Trends Index, Q4 2024*, 2025); notice periods and training come on top. A first employer registers with HMRC for PAYE before the first payday, up to 2 months ahead, and needs Employers' Liability insurance (GOV.UK, *Employing staff for the first time*; *Register as an employer*).

### 1.9 Equipment, rooms and channels

- **Each resource has its own capacity:** a machine, a room, a station or a vehicle can be the constraint while the people have hours left (Sophia, *Capacity Planning*; Theory of Constraints Institute).
- **Channels share or split capacity.** One pooled queue serves faster than separate ones (OpenLearn, section 11). A live online session can serve a group at once where a home visit serves one, so capacity per channel differs.

## 2. What the app asks today

### 2.1 Infrastructure & Capability › Delivery dialog

- **Founders' delivery capacity:** about N hours a month: each founder's Delivery Hours (or the older share of working hours), in the founder's own period, turned into a month (`founderDeliveryHours`). The "i" says selling, admin, learning and holidays take the rest, often 30 to 50%: this is the effective capacity.
- **Each founder's month at the expected sales:** Delivery hours, each Offering's hours at its expected sales, then "Left" or "Short by", a bar and "99% of Maya Chen's delivery hours, at the normal level of sales", with "More delivery capacity may be needed" when short. The utilisation "i": demand hours ÷ available hours; above 100% means more work than capacity.

### 2.2 The Delivery card, one for each Offering

- **Delivered:** Per unit (a project, a product, a session) or Every month (a retainer, a subscription), started from O3; **Hours Given** a week or a month for the second.
- **Working Hours per Unit, by person:** a figure for each founder and each External Professional linked to the Offering; founders' hours count against their capacity, external hours sit outside it.
- **While one runs:** each person's hours a week over the Calendar Time. **At expected sales (N a month):** founders' and external hours a month, and "about N running at once" (expected sales × weeks ÷ 4.33: Little's Law).
- **Calendar Time (weeks):** start to finish, waiting included, started from O15. **Constraints:** free text, started from O10 ("Three floor looms; one weaver keeps about two busy").

### 2.3 Sustainability › "Can the Expected Sales Be Delivered?"

- Month by month across the plan, from the ramp: the founders' hours needed against their hours, recurring work first, external hours apart, and the first month short (`capacityCheck`). A shortfall says more capacity may be needed; the sales forecast stays as it is.

### 2.4 Identity System › Legal Entity › Capability

- **Gaps:** free text, the skills the team lacks. **Cover:** free text, who covers them (freelancers, mentors, an accountant, a planned hire).

## 3. What is missing

| Missing | Why it matters (for an early-stage founder) | Asked elsewhere? | Proposal |
|---|---|---|---|
| **A planning ceiling below 100%** | A plan at 99% has no room for a sick week or a late supplier; waiting and late work grow fast above about 80 to 85% | No: the bar and the check turn only at 100% | Worked out: the bar marks 85%; above it, "At 92%, a busy week or a day off makes work late. A plan holds best at 85% or less." The check on Sustainability names the first month above 85% beside the first month short |
| **The sales the bottleneck can deliver, and the sales lost beyond it** | A shortfall becomes customers turned away or waiting; the plan's revenue assumes them all | Partly: "Short by" in hours; the forecast keeps every sale | Worked out: "At 85% of Maya's hours, about 14 a month can be delivered; the expected 18 leave about 4 a month, about £380, waiting or lost." Read into the plan's text and its risks; the forecast stays as the founder set it |
| **Equipment, room or station limits as a figure** | A loom or a treatment room is often the constraint while the founder still has hours | Partly: Constraints is free text; the Resources cards name the equipment and the Workspace | One optional row on the Delivery card: "Limited by" (a Resource card of this Offering) and "Holds at once" (a figure). Checked against "running at once": "about 4 running at once; the 3 looms hold 3" |
| **Customers served together** | A class, a workshop or a group call serves many in one session; the hours per customer fall with the group size | No | One figure on a Per unit card where O1 is a session, class or event: "Customers in one session" (starts 1). Hours per unit ÷ it. Its "i": a group of 8 in a 2-hour class is 15 minutes each |
| **The busiest month and the busiest times** | Peaks decide the capacity; an average month hides December or Saturday mornings | Partly: D3 ("When does this person usually buy?": evenings, weekends, around seasons); doc 50 proposes a monthly pattern from it | Worked out: once doc 50's seasons are on the ramp, the check reports the busiest month ("December needs 118% of Maya's hours"). Where D3 is Evenings or Weekends and the Offering is delivered live, the dialog says "Your customers buy at evenings and weekends: plan your delivery hours for those times" |
| **When to start adding capacity** | A hire, a trained helper or a contracted freelancer takes weeks; starting at the shortfall month is late | Partly: Cover names who covers; nothing says when | Worked out from the first month above 85%: "To have help by March, start looking by January (about 6 weeks to hire, then training)." Written into the plan's operations and milestones |
| **The hours an External Professional can give** | A freelancer has limits too; external hours count as unlimited today | No | One optional figure on the professional's card: "Hours a month they can give". The check reports external hours above it ("Ana: 30 h needed, 20 h available") |
| **Set-up time for a batch** | For a maker, the set-up (warping, firing, preparing) is a large part of the time and falls per unit with bigger batches | No | Two optional figures on a Per unit card of a Product or Hybrid: "Set-up for a batch (hours)" and "Units in a batch". Hours per unit adds set-up ÷ batch; the card shows "set-up adds 0.5 h a unit" |
| Effective capacity | Holidays, admin and selling come off the hours | Yes: Delivery Hours and its "i" (30 to 50% off) | None |
| Lead time to the customer | Customers ask when they will have it | Yes: O15 and Calendar Time | None |
| Outsourcing for capacity | Freelancers and partners take work in a peak | Yes: External Professionals linked to the Offering, and Cover | None, beyond their hours above |
| Capacity per channel | A live online session and a home visit take different hours | Partly: one Delivery card for each Offering | Covered by "Customers in one session"; a second card per channel waits until an owner example needs it **[D]** |

## 4. Recommendation

In priority order, the worked-out ones first:

1. **The planning ceiling at 85%** on the bar, the dialog and Sustainability's check. No new question; it changes the check and the plan's text.
2. **The sales the bottleneck can deliver** and the sales and revenue beyond it, from the same figures. No new question; it gives the Business Plan a capacity risk in pounds.
3. **When to start adding capacity**, from the first month above 85% and a typical time to hire. No new question; it gives the plan a dated step.
4. **"Limited by" and "Holds at once"** on the Delivery card, checked against "running at once". One optional figure; it turns part of Constraints into a check.
5. **"Customers in one session"** for sessions, classes and events. One figure; it corrects the hours for every group Offering.
6. **The busiest month**, once doc 50's seasons from D3 are on the ramp; the busiest times from D3 now.
7. **"Hours a month they can give"** on an External Professional, and **set-up for a batch** for makers: optional, for the Offerings they fit.

The figures in 1 to 3 are read from answers the founder has already given; 4 to 7 add one optional figure each, shown only on the cards they fit.

## 5. Sources

Read in full unless marked "in excerpt" (read through a search; to be opened in full before an "i" cites it).

- The Open University, OpenLearn, *Capacity and demand management* (2021), sections 3, 5, 7, 9 and 11: https://www.open.edu/openlearn/society-politics-law/criminology/capacity-and-demand-management
- Sophia, *Capacity Planning* (adapted from Saylor Academy and NSCC, *Operations Management*): https://app.sophia.org/tutorials/capacity-planning
- H. J. James Choo, Project Production Institute, *Little's Law: a practical approach to understanding production system performance* (2016): https://projectproduction.org/journal/littles-law-a-practical-approach-to-understanding-production-system-performance/
- John D. C. Little, *Little's Law as viewed on its 50th anniversary*, Operations Research 59(3), 536 to 549 (2011), in excerpt: https://people.cs.umass.edu/~emery/classes/cmpsci691st/readings/OS/Littles-Law-50-Years-Later.pdf
- Theory of Constraints Institute, *Five Focusing Steps* (after Eliyahu M. Goldratt, *The Goal*): https://www.tocinstitute.org/five-focusing-steps.html
- Kaizen Institute, *How can SMED cut batch sizes and increase production flexibility?*: https://kaizen.com/insights/batch-size-reduction-with-smed/
- Gabriel Bitran, MIT OpenCourseWare 15.778, *Management of supply networks for products and services* (2004), key takeaways, in excerpt: https://ocw.mit.edu/courses/15-778-management-of-supply-networks-for-products-and-services-summer-2004/
- John D. Cook, *Server utilization: Joel on queueing* (2009): https://www.johndcook.com/blog/?p=1395
- Michel Baudin, *Saturation in manufacturing versus service* (2017): https://michelbaudin.com/2017/03/22/saturation-in-manufacturing-versus-service/
- NI Business Info, *Employing staff in seasonal businesses*, in excerpt: https://www.nibusinessinfo.co.uk/content/employing-staff-seasonal-businesses
- NI Business Info, *Considerations for seasonal businesses*, in excerpt: https://www.nibusinessinfo.co.uk/content/considerations-seasonal-businesses
- NI Business Info, *Advantages and disadvantages of using a contractor or subcontractor*, in excerpt: https://www.nibusinessinfo.co.uk/content/advantages-and-disadvantages-using-contractor-or-subcontractor
- Totaljobs, *Hiring Trends Index: a look at the recruitment landscape of Q4 2024* (2025): https://www.totaljobs.com/recruiter-advice/hiring-people/hiring-trends-index-a-look-at-the-recruitment-landscape-of-q4-2024/
- GOV.UK, *Employing staff for the first time*: https://www.gov.uk/employing-staff
- GOV.UK, *Register as an employer*: https://www.gov.uk/register-employer
- Nigel Slack, Alistair Brandon-Jones and Robert Johnston, *Operations Management* (Pearson), the standard text for capacity planning and control; cited through the OpenLearn course *Introduction to operations management* (2017), and to be read before an "i" quotes it: https://www.open.edu/openlearn/money-business/business-strategy-studies/introduction-operations-management/content-section-0
