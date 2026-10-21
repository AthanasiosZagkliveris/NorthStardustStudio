# The library log

Every change to an asset of the library: added, edited, placed (and where), moved (from where to where), removed. Written by `npm run library:log` from the difference between the library and its last logged state; do not edit by hand.

| Id | Date | Asset | Change | What | Where | Note |
|---|---|---|---|---|---|---|
| L0659 | 2026-10-21 | DRP.001 | edited | dropdown: words |  | Tooltips say one sentence that begins Click to (tipWords, TitleTooltips); the Inventory's filter dropdowns and the calendar's list of ticks (MultiPicker) are the option picker's. Logged by hand on 2026-10-21: the tool finds only changes of the library data, and these were changes of the contracts and of the shared components (document 23) |
| L0658 | 2026-10-21 | DRP.001 | edited | dropdown: component, width rules |  | OptionPicker gets keepWidth (a hugging dropdown alone in its row keeps its longest option's width) and tight (hug without counting the placeholder); the calendar's, the Documents' and the Settings' dropdown cells are the shared one at 44px. Logged by hand on 2026-10-21: the tool finds only changes of the library data, and these were changes of the contracts and of the shared components (document 23) |
| L0657 | 2026-10-21 | ARW.LAB.002.001 | edited | label arrow: variants of use |  | FoldArrow label gets direction (up, down) and pressed: the Inventory's cost order, outlined and filled while chosen. Logged by hand on 2026-10-21: the tool finds only changes of the library data, and these were changes of the contracts and of the shared components (document 23) |
| L0656 | 2026-10-20 | TIK.001 | edited | tick box: component |  | TickField draws a tick and its words as one label (13 places); the label is the field label. Logged by hand on 2026-10-21: the tool finds only changes of the library data, and these were changes of the contracts and of the shared components (document 23) |
| L0655 | 2026-10-20 | FRM.FLC.001.004 | edited | floating card: component |  | The tags above and below a floating card (its title and record time) take the card's own look; the shared controls moved to components/controls. Logged by hand on 2026-10-21: the tool finds only changes of the library data, and these were changes of the contracts and of the shared components (document 23) |
| L0654 | 2026-10-20 | ARW.LAB.002.001 | edited | label arrow: component |  | LabelArrow is merged into FoldArrow (variant label); label-arrow.css keeps the look. Logged by hand on 2026-10-21: the tool finds only changes of the library data, and these were changes of the contracts and of the shared components (document 23) |
| L0653 | 2026-10-20 | ARW.002 | edited | fold arrow: summary, parts, tokens, component, stylesheet |  | The outlined triangle of every page (outline in the ink colour, filled under the pointer and the keyboard focus, no ground, no ring); FoldArrow.tsx is in interview/fields and its rules in fold-arrow.css. Logged by hand on 2026-10-21: the tool finds only changes of the library data, and these were changes of the contracts and of the shared components (document 23) |
| L0652 | 2026-10-17 | PCK.001 | edited | colour picker: look, lookNotes |  | Colour box: no frame |
| L0651 | 2026-10-17 | FLD.054 | edited | Linked Offerings: name, summary |  | Link symbol drawn and 20% on hover, tick box flat when ticked, colour picker card, the Linked to field is Offerings |
| L0650 | 2026-10-17 | PCK.001 | edited | colour picker: lookNotes |  | Link symbol drawn and 20% on hover, tick box flat when ticked, colour picker card, the Linked to field is Offerings |
| L0649 | 2026-10-17 | TIK.001 | edited | tick box: lookNotes |  | Link symbol drawn and 20% on hover, tick box flat when ticked, colour picker card, the Linked to field is Offerings |
| L0648 | 2026-10-17 | BTN.007 | edited | link button: lookNotes |  | Link symbol drawn and 20% on hover, tick box flat when ticked, colour picker card, the Linked to field is Offerings |
| L0647 | 2026-10-16 | PCK.001 | edited | colour picker: look, lookNotes |  | Colour box 32px |
| L0646 | 2026-10-16 | PCK.001 | edited | colour picker: lookNotes |  | Tick box and date cell in a text input's look, calendar button as the + box, months Sept/June/July, colour box inside the hex cell |
| L0645 | 2026-10-16 | DAT.002 | edited | calendar list: lookNotes |  | Tick box and date cell in a text input's look, calendar button as the + box, months Sept/June/July, colour box inside the hex cell |
| L0644 | 2026-10-16 | DAT.001 | edited | date cell: lookNotes |  | Tick box and date cell in a text input's look, calendar button as the + box, months Sept/June/July, colour box inside the hex cell |
| L0643 | 2026-10-16 | TIK.001 | edited | tick box: look, lookNotes |  | Tick box and date cell in a text input's look, calendar button as the + box, months Sept/June/July, colour box inside the hex cell |
| L0642 | 2026-10-16 | TIK.001 | edited | tick box: look, lookNotes |  | Tick box line 2px (drawn box) |
| L0641 | 2026-10-16 | PCK.001 | edited | colour picker: lookNotes |  | Tick box 4px corners, colour picker square with rounded colour, date and month cells one component with one calendar, Logo holder width limit, x above holders |
| L0640 | 2026-10-16 | DAT.002 | edited | calendar list: lookNotes |  | Tick box 4px corners, colour picker square with rounded colour, date and month cells one component with one calendar, Logo holder width limit, x above holders |
| L0639 | 2026-10-16 | DAT.001 | edited | date cell: lookNotes |  | Tick box 4px corners, colour picker square with rounded colour, date and month cells one component with one calendar, Logo holder width limit, x above holders |
| L0638 | 2026-10-16 | TIK.001 | edited | tick box: look, lookNotes |  | Tick box 4px corners, colour picker square with rounded colour, date and month cells one component with one calendar, Logo holder width limit, x above holders |
| L0637 | 2026-10-16 | DAT.002 | edited | calendar list: lookNotes |  | Date cell: the calendar button inside the cell (32px, drawn symbol), the app's own day calendar, the month-and-year form with the same cell |
| L0636 | 2026-10-16 | DAT.001 | edited | date cell: lookNotes |  | Date cell: the calendar button inside the cell (32px, drawn symbol), the app's own day calendar, the month-and-year form with the same cell |
| L0635 | 2026-10-16 | ARW.002 | edited | fold arrow: belongs, look, lookNotes, summary, variants |  | The fold arrow is the 36px card toggle again (label and title arrows its variants), the text toggle's corners are the measured 4px |
| L0634 | 2026-10-16 | BTN.008 | edited | text toggle: look, lookNotes |  | The fold arrow is the 36px card toggle again (label and title arrows its variants), the text toggle's corners are the measured 4px |
| L0633 | 2026-10-16 | SYM.001 | added | card symbol |  | The walk of the running app: unit word px, small bold text, text toggle, card symbol, add buttons and backs as found |
| L0632 | 2026-10-16 | TXS.001 | edited | text: lookNotes, variants |  | The walk of the running app: unit word px, small bold text, text toggle, card symbol, add buttons and backs as found |
| L0631 | 2026-10-16 | BTN.008 | added | text toggle |  | The walk of the running app: unit word px, small bold text, text toggle, card symbol, add buttons and backs as found |
| L0630 | 2026-10-16 | BTN.004 | edited | wide add button: lookNotes |  | The walk of the running app: unit word px, small bold text, text toggle, card symbol, add buttons and backs as found |
| L0629 | 2026-10-16 | BTN.003 | edited | back button: lookNotes |  | The walk of the running app: unit word px, small bold text, text toggle, card symbol, add buttons and backs as found |
| L0628 | 2026-10-16 | BTN.002 | edited | info button: lookNotes |  | The walk of the running app: unit word px, small bold text, text toggle, card symbol, add buttons and backs as found |
| L0627 | 2026-10-16 | BTN.001 | edited | box button: lookNotes |  | The walk of the running app: unit word px, small bold text, text toggle, card symbol, add buttons and backs as found |
| L0626 | 2026-10-16 | DRP.001 | edited | dropdown: lookNotes |  | The ADD buttons scanned in the source: their words recorded in the components |
| L0625 | 2026-10-16 | BTN.005 | edited | add card tile: belongs |  | The ADD buttons scanned in the source: their words recorded in the components |
| L0624 | 2026-10-16 | BTN.004 | edited | wide add button: belongs, variants |  | The ADD buttons scanned in the source: their words recorded in the components |
| L0623 | 2026-10-16 | BTN.001 | edited | box button: belongs |  | The ADD buttons scanned in the source: their words recorded in the components |
| L0622 | 2026-10-16 | FLD.106 | edited | page tag: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0621 | 2026-10-16 | CRD.001 | edited | floating card: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0620 | 2026-10-16 | FLD.105 | edited | Reference or Number: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0619 | 2026-10-16 | FLD.104 | edited | Legal requirement name: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0618 | 2026-10-16 | FLD.103 | edited | Journey Stage: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0617 | 2026-10-16 | FLD.102 | edited | Links: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0616 | 2026-10-16 | FLD.101 | edited | Subchannel name: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0615 | 2026-10-16 | FLD.100 | edited | Requirements & Conditions: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0614 | 2026-10-16 | FLD.099 | edited | Support & Communication: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0613 | 2026-10-16 | FLD.098 | edited | Purchase & Delivery: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0612 | 2026-10-16 | FLD.097 | edited | Content & Scope: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0611 | 2026-10-16 | FLD.096 | edited | Customer Benefit: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0610 | 2026-10-16 | FLD.095 | edited | Function: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0609 | 2026-10-16 | FLD.094 | edited | Functional Needs Addressed: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0608 | 2026-10-16 | FLD.093 | edited | Threats: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0607 | 2026-10-16 | FLD.092 | edited | Opportunities: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0606 | 2026-10-16 | FLD.091 | edited | Weaknesses: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0605 | 2026-10-16 | FLD.090 | edited | Strengths: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0604 | 2026-10-16 | FLD.089 | edited | Customer Experience: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0603 | 2026-10-16 | FLD.088 | edited | Customer Acquisition: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0602 | 2026-10-16 | FLD.087 | edited | Market: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0601 | 2026-10-16 | FLD.086 | edited | Offerings: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0600 | 2026-10-16 | FLD.085 | edited | Social: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0599 | 2026-10-16 | FLD.084 | edited | Emotional: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0598 | 2026-10-16 | FLD.083 | edited | Functional: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0597 | 2026-10-16 | FLD.082 | edited | Objections: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0596 | 2026-10-16 | FLD.081 | edited | Challenges & Problems: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0595 | 2026-10-16 | FLD.080 | edited | Goals & Desires: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0594 | 2026-10-16 | FLD.079 | edited | Information & Shopping Habits: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0593 | 2026-10-16 | FLD.078 | edited | Social & Interest Hubs: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0592 | 2026-10-16 | FLD.077 | edited | Psychographics: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0591 | 2026-10-16 | FLD.076 | edited | Specific Personal Information: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0590 | 2026-10-16 | FLD.075 | edited | Segment, Profile name: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0589 | 2026-10-16 | FLD.074 | edited | Image description: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0588 | 2026-10-16 | FLD.073 | edited | Image name: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0587 | 2026-10-16 | FLD.072 | edited | Typeface name: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0586 | 2026-10-16 | FLD.071 | edited | Usage: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0585 | 2026-10-16 | FLD.070 | edited | Colour: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0584 | 2026-10-16 | FLD.069 | edited | Role: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0583 | 2026-10-16 | FLD.068 | edited | Colour name: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0582 | 2026-10-16 | FLD.067 | edited | Cost ($): requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0581 | 2026-10-16 | FLD.066 | edited | Expense name: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0580 | 2026-10-16 | FLD.065 | edited | Linked registration: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0579 | 2026-10-16 | FLD.064 | edited | Responsibility: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0578 | 2026-10-16 | FLD.063 | edited | Date: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0577 | 2026-10-16 | FLD.062 | edited | Extra: Handling per pallet: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0576 | 2026-10-16 | FLD.061 | edited | Cost options: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0575 | 2026-10-16 | FLD.060 | edited | Extra: Other duties: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0574 | 2026-10-16 | FLD.059 | edited | Extra: Clearance and handling: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0573 | 2026-10-16 | FLD.058 | edited | Extra: Customs duty: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0572 | 2026-10-16 | FLD.057 | edited | Extra: Minimum order: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0571 | 2026-10-16 | FLD.056 | edited | Amortisation period: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0570 | 2026-10-16 | FLD.055 | edited | Rate override: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0569 | 2026-10-16 | FLD.054 | edited | Linked to: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0568 | 2026-10-16 | FLD.053 | edited | Extra: Road tax: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0567 | 2026-10-16 | FLD.052 | edited | Extra: Commercial property tax: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0566 | 2026-10-16 | FLD.051 | edited | Extra: Service charge: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0565 | 2026-10-16 | FLD.050 | edited | Extra: Deposit: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0564 | 2026-10-16 | FLD.049 | edited | Completed: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0563 | 2026-10-16 | FLD.048 | edited | Responsible: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0562 | 2026-10-16 | FLD.047 | edited | Cost: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0561 | 2026-10-16 | FLD.046 | edited | Units: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0560 | 2026-10-16 | FLD.045 | edited | Resource: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0559 | 2026-10-16 | FLD.044 | edited | Resources: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0558 | 2026-10-16 | FLD.043 | edited | Performer: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0557 | 2026-10-16 | FLD.042 | edited | Type: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0556 | 2026-10-16 | FLD.041 | edited | Responsibilities: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0555 | 2026-10-16 | FLD.040 | edited | Delivery Hrs: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0554 | 2026-10-16 | FLD.039 | edited | Working Hrs: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0553 | 2026-10-16 | FLD.038 | edited | Salary: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0552 | 2026-10-16 | FLD.037 | edited | Roles: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0551 | 2026-10-16 | FLD.036 | edited | Extra: Bonus: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0550 | 2026-10-16 | FLD.035 | edited | Extra: Commission: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0549 | 2026-10-16 | FLD.034 | edited | Allowance: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0548 | 2026-10-16 | FLD.033 | edited | Milestone date: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0547 | 2026-10-16 | FLD.032 | edited | Milestone %: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0546 | 2026-10-16 | FLD.031 | edited | Milestone: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0545 | 2026-10-16 | FLD.030 | edited | Instalment lines: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0544 | 2026-10-16 | FLD.029 | edited | Instalments: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0543 | 2026-10-16 | FLD.028 | edited | Balance date: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0542 | 2026-10-16 | FLD.027 | edited | Deposit %: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0541 | 2026-10-16 | FLD.026 | edited | Plan: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0540 | 2026-10-16 | FLD.025 | edited | Payment Plan: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0539 | 2026-10-16 | FLD.024 | edited | Billing type: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0538 | 2026-10-16 | FLD.023 | edited | Cost option: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0537 | 2026-10-16 | FLD.022 | edited | Extra: Road tax (when bought): requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0536 | 2026-10-16 | FLD.021 | edited | Warranty until: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0535 | 2026-10-16 | FLD.020 | edited | Warranty: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0534 | 2026-10-16 | FLD.019 | edited | Useful life: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0533 | 2026-10-16 | FLD.018 | edited | Unit: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0532 | 2026-10-16 | FLD.017 | edited | Frequency: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0531 | 2026-10-16 | FLD.016 | edited | Qty: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0530 | 2026-10-16 | FLD.015 | edited | Record date and time: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0529 | 2026-10-16 | FLD.014 | edited | Description / Relevant Information: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0528 | 2026-10-16 | FLD.013 | edited | Extra: Service charge (when bought): requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0527 | 2026-10-16 | FLD.012 | edited | Extra: Commercial property tax (when bought): requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0526 | 2026-10-16 | FLD.011 | edited | Currency: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0525 | 2026-10-16 | FLD.010 | edited | Price: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0524 | 2026-10-16 | FLD.009 | edited | Activity: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0523 | 2026-10-16 | FLD.008 | edited | Rent: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0522 | 2026-10-16 | FLD.007 | edited | Status: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0521 | 2026-10-16 | FLD.006 | edited | Group: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0520 | 2026-10-16 | FLD.005 | edited | Category: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0519 | 2026-10-16 | FLD.004 | edited | End date: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0518 | 2026-10-16 | FLD.003 | edited | Start date: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0517 | 2026-10-16 | FLD.002 | edited | Name: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0516 | 2026-10-16 | FLD.001 | edited | Number: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0515 | 2026-10-16 | FRM.001 | edited | frame: variants |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0514 | 2026-10-16 | TIL.002 | edited | open tile: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0513 | 2026-10-16 | TIL.001 | edited | master tile: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0512 | 2026-10-16 | BUL.001 | edited | bullet: lookNotes, summary |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0511 | 2026-10-16 | ARW.002 | edited | fold arrow: belongs, defaultVariant, look, summary, variants |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0510 | 2026-10-16 | ARW.001 | edited | arrow: belongs, defaultVariant, summary, variants |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0509 | 2026-10-16 | IMG.001 | edited | image holder: defaultVariant, kind, look, requires, summary, variants |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0508 | 2026-10-16 | PCK.001 | edited | colour picker: requires |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0507 | 2026-10-16 | DAT.002 | added | calendar list |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0506 | 2026-10-16 | DAT.001 | edited | date cell: defaultVariant, kind, requires, summary, variants |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0505 | 2026-10-16 | DIV.001 | edited | divider: belongs, defaultVariant, look, summary, variants |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0504 | 2026-10-16 | TXT.001 | edited | text box: defaultVariant, kind, name, summary, variants |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |
| L0503 | 2026-10-16 | TXS.001 | edited | text: belongs, defaultVariant, kind, look, summary, variants |  | Defaults are the main assets, calendar list back, no weight 600, add buttons updated, bullet contrast recorded |

The older rows are in `10-library-log-archive.md`.
