# Card links: which groups could link to which

Status: **archive**, written 2026-10-14, updated 2026-11-03 (moved here from `design/current/` on 2026-11-03, where it was document 41; before that it was part of document 26). A proposal; nothing of it is built. Where its information now lives: it is held only here; the cards as built are document 26 (`design/current/26-card-structure.md`). Two tables of proposals: which partner and supplier groups each resource group could link to (Task 1), and which partners, suppliers and resources could link to each activity group (Task 2). 

Related: document 26 (card structure, as built), document 21 (the shared components), `docs/design/core/05-not-done-yet.md` (what is not done yet).

### Task 1: resources linked to partners and suppliers of the same place

Each resource group is matched with the groups of partners and suppliers it can use, in the same place. These are the groups offered in the Group step of the status (Partners & Suppliers), and the groups whose Name list opens when the link is chosen. A proposal, to confirm.

#### Infrastructure

| Resource group | Partner and supplier groups it can link to |
|---|---|
| Premises | Property, Vehicles & Facilities (Rent: its card holds the rent and extras); Technical Support (repairs and inspections) |
| Premises Utilities | Property, Vehicles & Facilities; Goods & Equipment |
| Furniture & Fittings | Goods & Equipment (bought or leased) |
| Devices & Tools | Goods & Equipment (bought or leased); Technical Support (repair, set-up) |
| Company Vehicles | Property, Vehicles & Facilities (lease); Goods & Equipment (dealer); Technical Support (servicing) |
| Vehicle Running Costs | Goods & Equipment (fuel and supplies); it is also tied to its vehicle |
| Software & Web | Creative & IT Services (a custom build, linked to the asset); Goods & Equipment (licence vendor) |
| Cloud & Security | Creative & IT Services; Technical Support |
| Business Consumables | Goods & Equipment |
| Insurances | Business Services (broker, insurer) |
| Licences | Business Services (agent, lawyer); Alliances & Networks (a membership licence) |
| Certificates | Technical Support (inspection, testing); Business Services |
| Tickets & Trip Costs | Business Services (travel agents) |
| Admin Team | Business Services (payroll, recruiter); Alliances & Networks (shared staff) |
| Founders & Owners | None: the people are the founders |

#### Offering

| Resource group | Partner and supplier groups it can link to |
|---|---|
| Site Hire | Venues & Organisers |
| Workshop & Storage | Landlords, Leasing & Warehouses (Rent); Contractors & Advisers (repairs) |
| Process Utilities | No direct connection |
| Fixtures & Displays | Producers & Wholesalers (bought); Contractors & Advisers (made or installed) |
| Production Machinery | Producers & Wholesalers (the machine); Contractors & Advisers (its installation, linked to the asset). Gap: leasing a machine has no supplier group |
| Devices & Tools | Producers & Wholesalers; Contractors & Advisers |
| Delivery Vehicles | Landlords, Leasing & Warehouses (lease); Contractors & Advisers (servicing) |
| Delivery Running Costs | No direct connection; it is tied to its vehicle |
| Sales & Delivery Tools | Platforms & Payments (e-commerce platform); Contractors & Advisers |
| Platforms & APIs | Platforms & Payments |
| Materials & Stock | Producers & Wholesalers; Logistics & Fulfilment (delivery of stock) |
| Insurances | Contractors & Advisers (broker). Gap: the Offering place has no Business Services group |
| Licences | Contractors & Advisers; Accreditation Bodies (partner) |
| Royalties | Revenue Partners (the franchisor or licensor) |
| Certificates | Accreditation Bodies (partner); Contractors & Advisers |
| Tickets & Trip Costs | Venues & Organisers (entry fees); Logistics & Fulfilment |
| Delivery Team | Contractors & Advisers (freelancers) |

#### Gaps found

- The Offering place has no Business Services group, so Insurances, Licences and similar cards use Contractors & Advisers.
- Leasing a machine, rather than a space or a vehicle, has no supplier group.

### Task 2: activities, and the partners, suppliers and resources that could link to them

A performer is a founder, then a partner or supplier of the same place. A resource is added with the Resources tick box. Nothing linked gives its cost nature to the activity or takes it from it.

| Place | Activity group | Partners and suppliers that could perform it | Resources that could be linked |
|---|---|---|---|
| Infrastructure | Pre-Operational | Technical Support (installation); Property, Vehicles & Facilities (works on the premises); Creative & IT Services (website, software); Business Services (legal, accounting); partner: Alliances & Networks | Premises, Furniture & Fittings, Devices & Tools, Company Vehicles, Software & Web, Cloud & Security, Licences, Certificates, Insurances, Business Consumables, Admin Team |
| Infrastructure | Operational | Technical Support (scheduled maintenance); Goods & Equipment (supplies); Business Services; Creative & IT Services (updates); partner: Alliances & Networks | Premises Utilities, Vehicle Running Costs, Company Vehicles, Devices & Tools, Software & Web, Cloud & Security, Business Consumables, Insurances, Licences, Tickets & Trip Costs, Admin Team |
| Offering | Production | Producers & Wholesalers; Contractors & Advisers; Logistics & Fulfilment (stock in); partner: Accreditation Bodies | Workshop & Storage, Process Utilities, Production Machinery, Fixtures & Displays, Devices & Tools, Materials & Stock, Licences, Royalties, Certificates, Insurances, Delivery Team |
| Offering | Marketing | Agencies & Influencers; Venues & Organisers; partner: Revenue Partners | Site Hire, Fixtures & Displays, Devices & Tools, Sales & Delivery Tools, Platforms & APIs, Materials & Stock (samples), Tickets & Trip Costs, Insurances (event), Delivery Team (promoters) |
| Offering | Sales & Customer | Logistics & Fulfilment; Platforms & Payments; Venues & Organisers; Contractors & Advisers; partner: Revenue Partners | Delivery Vehicles, Delivery Running Costs, Delivery Team, Site Hire, Sales & Delivery Tools, Platforms & APIs, Materials & Stock, Devices & Tools, Tickets & Trip Costs, Insurances |
