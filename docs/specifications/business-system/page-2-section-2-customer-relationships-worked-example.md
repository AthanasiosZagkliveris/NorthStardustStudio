# Business System — Page 2, Section 2: worked example and column rules

Status: **specification**, updated 2026-10-29. An example of the requirement as written, with its Profile in the first column; the app keeps the relationship about the Offering (see "As built" in `page-2-section-2-customer-relationships.md`). Its two column rules (the Goal on the interaction, optional; the Goal selector with meanings) are built.

> **3. Business System — Page 2 of 5, Section 2 of 2.**
> A worked example of the structure specified in
> `page-2-section-2-customer-relationships.md`, plus the column
> rules that specification refers to. Not a separate section.

### Empty table

| Customer Profile | Relationship Type ⓘ / Purpose | Offering | Journey Stage / Channel | Approach | Goal ⓘ |
| ---------------- | ----------------------------- | -------- | ----------------------- | -------- | ------ |




## Customer Relationships Table

| Customer Profile        | Relationship Type / Purpose                                                                                             | Offering                | Journey Stage / Channel          | Approach                                                                                    | Goal                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Founder**             | **Personal Assistance**<br><br>**Purpose**<br>Build trust and provide guidance throughout the engagement.               | **Brand System**        | **Evaluation**<br>Website        | Provide clear information and direct guidance to help the Founder make confident decisions. | **Get**<br>Attract and convert suitable customers.                       |
|                         |                                                                                                                         |                         | **Support & Follow Up**<br>Email | Respond to questions and provide assistance when needed.                                    | **Keep**<br>Maintain satisfaction and encourage continued engagement.    |
|                         |                                                                                                                         |                         | **Delivery**<br>Client Portal    | Coordinate approvals, files and delivery in a structured way.                               |                                                                          |
|                         |                                                                                                                         | **Website Development** | **Evaluation**<br>Website        | Explain the offering and help the Founder understand what is involved.                      | **Grow**<br>Develop the relationship through additional or deeper value. |
|                         |                                                                                                                         |                         | **Support & Follow Up**<br>Email | Maintain direct communication throughout the project.                                       |                                                                          |
|                         |                                                                                                                         |                         | **Delivery**<br>Client Portal    | Coordinate feedback, approvals and final deliverables.                                      |                                                                          |
| **Creative Lead**       | **Self-Service**<br><br>**Purpose**<br>Allow the customer to explore and make decisions independently.                  | **Brand System**        | **Discover**<br>Website         | Provide accessible information that allows independent exploration.                         | **Get**<br>Attract and convert suitable customers.                       |
|                         |                                                                                                                         |                         | **Evaluation**<br>Website        | Provide sufficient information for independent assessment.                                  |                                                                          |
|                         | **Personal Assistance**<br><br>**Purpose**<br>Provide guidance when independent exploration is insufficient.            | **Brand System**        | **Evaluation**<br>Website        | Help the Creative Lead assess options and make important decisions.                         | **Keep**<br>Maintain satisfaction and trust.                             |
|                         |                                                                                                                         |                         | **Support & Follow Up**<br>Email | Provide direct assistance when questions or difficulties arise.                             |                                                                          |
|                         |                                                                                                                         | **Website Development** | **Evaluation**<br>Website        | Help assess the development approach and clarify decisions.                                 |                                                                          |
|                         |                                                                                                                         |                         | **Support & Follow Up**<br>Email | Discuss questions, feedback and decisions directly.                                         |                                                                          |
| **Project Coordinator** | **Dedicated Support**<br><br>**Purpose**<br>Ensure smooth coordination and reliable delivery.                           | **Brand System**        | **Delivery**<br>Client Portal    | Coordinate information, approvals and deliverables through a structured process.            | **Keep**<br>Maintain a reliable and effective relationship.              |
|                         |                                                                                                                         |                         | **Support & Follow Up**<br>Email | Resolve coordination questions and maintain communication.                                  |                                                                          |
| **Consultant**          | **Personal Assistance**<br><br>**Purpose**<br>Provide relevant guidance and help the customer achieve a useful outcome. | **Digital Product**     | **Evaluation**<br>Website        | Explain the product and help the Consultant determine whether it fits their needs.          | **Get**<br>Attract and convert suitable customers.                       |
|                         |                                                                                                                         |                         | **Support & Follow Up**<br>Email | Provide assistance when applying the product.                                               | **Grow**<br>Develop the relationship through additional or deeper value. |
|                         |                                                                                                                         | **Portfolio Website**   | **Evaluation**<br>Website        | Help translate professional objectives into website requirements.                           |                                                                          |
|                         |                                                                                                                         |                         | **Delivery**<br>Client Portal    | Coordinate content, feedback and approvals.                                                 |                                                                          |
| **Freelancer**          | **Self-Service**<br><br>**Purpose**<br>Enable efficient independent use with minimal assistance.                        | **Digital Product**     | **Discover**<br>Website         | Provide clear information for independent exploration.                                      | **Get**<br>Attract and convert suitable customers.                       |
|                         |                                                                                                                         |                         | **Purchase**<br>Marketplace      | Provide a straightforward path to purchase.                                                 |                                                                          |
|                         |                                                                                                                         |                         | **Delivery**<br>Marketplace      | Provide immediate access to the purchased product.                                          |                                                                          |
| **Educator**            | **Personal Assistance**<br><br>**Purpose**<br>Support effective collaboration and continued engagement.                 | **Portfolio Website**   | **Evaluation**<br>Website        | Explain the approach and help clarify requirements.                                         | **Keep**<br>Maintain satisfaction and encourage continued engagement.    |
|                         |                                                                                                                         |                         | **Delivery**<br>Client Portal    | Coordinate content, revisions and final delivery.                                           | **Grow**<br>Develop the relationship through additional or deeper value. |
|                         |                                                                                                                         |                         | **Support & Follow Up**<br>Email | Provide follow-up assistance after delivery.                                                |                                                                          |

### One important structural rule

The **Goal belongs to the Journey Stage/interaction**, not necessarily to the whole Profile.

For example:

**Creative Lead → Personal Assistance → Brand System**

could have:

* **Evaluation → Get**
* **Support & Follow Up → Keep**

That is more useful than saying the entire relationship is simply "Get + Keep".

However, I would make the Goal **optional per Journey Stage**, because not every interaction needs a separate strategic goal.

### Goal selector

The dropdown should not just say `Get / Keep / Grow`. Give the user the meaning directly:

| Goal     | User understands it as                                           |
| -------- | ---------------------------------------------------------------- |
| **Get**  | **Attract and convert suitable customers.**                      |
| **Keep** | **Maintain satisfaction and encourage continued engagement.**    |
| **Grow** | **Develop the relationship through additional or deeper value.** |

This makes the terminology usable even for someone who has never encountered the **Get / Keep / Grow** model.

### The resulting relationship logic

**Profile**
→ **Relationship Type + Purpose**
→ **Offering**
→ **Journey Stage + Channel**
→ **Approach**
→ **Goal**

And, crucially:

* **Relationship Type** answers *what kind of relationship?*
* **Purpose** answers *why maintain it?*
* **Offering** answers *for what are we maintaining it?*
* **Journey Stage** answers *when?*
* **Channel** answers *where/how do we interact?*
* **Approach** answers *how do we conduct the interaction?*
* **Goal** answers *what should this interaction help achieve?*

That gives every column a distinct job and avoids duplicating the information already established in **Customer Profiles, Offerings, and Channels**.
