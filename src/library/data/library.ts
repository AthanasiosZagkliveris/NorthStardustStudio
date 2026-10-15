// The assets library, seeded once by scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).
// From now on the library is the source: it is changed by the procedure of docs/design/08-library-system.md (check, library, library log, inventory, placement, app log).

import type { Library } from "../model/types.ts";

export const library: Library = {
 "variables": [
  {
   "code": "VAR001",
   "name": "state",
   "description": "How the asset looks and reacts at this moment.",
   "values": [
    {
     "name": "rest",
     "description": "Nothing is touching it."
    },
    {
     "name": "hover",
     "description": "The pointer is over it."
    },
    {
     "name": "focus",
     "description": "It has the keyboard focus."
    },
    {
     "name": "active",
     "description": "It is being used (a press, or typing in it)."
    },
    {
     "name": "selected",
     "description": "It is the chosen one of its set (the lit bullet, the open tab)."
    },
    {
     "name": "disabled",
     "description": "It cannot be used now."
    }
   ]
  },
  {
   "code": "VAR002",
   "name": "tint",
   "description": "Whether the asset takes the colour tint of the card, tile or system it stands in.",
   "values": [
    {
     "name": "card tint",
     "description": "It takes the tint of the card or tile it stands in."
    },
    {
     "name": "neutral",
     "description": "It keeps one colour whatever it stands in."
    }
   ]
  },
  {
   "code": "VAR003",
   "name": "reading mode",
   "description": "The colours of the reading mode the app is set to.",
   "values": [
    {
     "name": "light",
     "description": "The light reading mode."
    },
    {
     "name": "dark",
     "description": "The dark reading mode."
    },
    {
     "name": "sepia",
     "description": "The sepia reading mode."
    }
   ]
  },
  {
   "code": "VAR004",
   "name": "size class",
   "description": "The size of the asset on the screen class (tablet 768 to 1199px wide, laptop 1200px wide and under 1250px high, desktop 1200px wide and 1250px high or more).",
   "values": [
    {
     "name": "tablet",
     "description": "A window 768 to 1199px wide."
    },
    {
     "name": "laptop",
     "description": "A window 1200px wide or more and under 1250px high."
    },
    {
     "name": "desktop",
     "description": "A window 1200px wide or more and 1250px high or more."
    }
   ]
  },
  {
   "code": "VAR005",
   "name": "requirement",
   "description": "Whether the person must fill the asset in.",
   "values": [
    {
     "name": "required",
     "description": "It must be filled in."
    },
    {
     "name": "optional",
     "description": "It may stay empty (an optional field is switched on by a tick)."
    },
    {
     "name": "automatic",
     "description": "The app fills it in."
    }
   ]
  },
  {
   "code": "VAR006",
   "name": "content",
   "description": "Whether the asset holds anything yet.",
   "values": [
    {
     "name": "empty",
     "description": "Nothing is in it."
    },
    {
     "name": "filled",
     "description": "Something is in it."
    }
   ]
  },
  {
   "code": "VAR007",
   "name": "place",
   "description": "Where the asset stands.",
   "values": [
    {
     "name": "page",
     "description": "On the page, in a chapter."
    },
    {
     "name": "dialog view",
     "description": "In a view that opens over the page."
    },
    {
     "name": "floating card",
     "description": "In a card that floats over the dimmed page."
    },
    {
     "name": "nested card",
     "description": "In a card inside another card."
    },
    {
     "name": "header",
     "description": "In the app header."
    }
   ]
  },
  {
   "code": "VAR008",
   "name": "label position",
   "description": "Where the label of a field stands against its control.",
   "values": [
    {
     "name": "above",
     "description": "The label is above the control, 6px from it."
    },
    {
     "name": "side",
     "description": "The label is in a column at the side of the control."
    },
    {
     "name": "none",
     "description": "The control has no label."
    }
   ]
  },
  {
   "code": "VAR009",
   "name": "head",
   "description": "How a card names itself.",
   "values": [
    {
     "name": "name cell",
     "description": "The card has a name cell the person fills in, with the order number inside it."
    },
    {
     "name": "inherited name",
     "description": "The name comes from elsewhere and is shown, not edited."
    }
   ]
  },
  {
   "code": "VAR010",
   "name": "date precision",
   "description": "What the person chooses in a calendar: a day, or only a month.",
   "values": [
    {
     "name": "day",
     "description": "A day, month and year."
    },
    {
     "name": "month",
     "description": "Only a month and a year (the day is not asked)."
    }
   ]
  },
  {
   "code": "VAR011",
   "name": "rail display",
   "description": "How much of a rail shows.",
   "values": [
    {
     "name": "bullets only",
     "description": "A narrow tab (37px wide) of bullets; each name shows as a tooltip on hover."
    },
    {
     "name": "with names",
     "description": "The names stand beside the bullets; the rail is as wide as its longest name (145 to 229px measured)."
    }
   ]
  },
  {
   "code": "VAR012",
   "name": "origin",
   "description": "Where the words of a reading text come from.",
   "values": [
    {
     "name": "prefilled",
     "description": "The words are written in the app."
    },
    {
     "name": "generated",
     "description": "The words come from another input (a card's name, a tile that a card generates) and link to it."
    }
   ]
  },
  {
   "code": "VAR013",
   "name": "long text",
   "description": "What a text does when it is too long for its room.",
   "values": [
    {
     "name": "wraps",
     "description": "It continues on the next line."
    },
    {
     "name": "moves",
     "description": "It stays on one line and moves horizontally."
    },
    {
     "name": "one line, cut",
     "description": "It stays on one line and the rest is cut."
    }
   ]
  },
  {
   "code": "VAR014",
   "name": "growth",
   "description": "Whether a holder grows as the person writes.",
   "values": [
    {
     "name": "grows",
     "description": "The cell grows as you type or press Enter."
    },
    {
     "name": "fixed space",
     "description": "The cell keeps the space it has."
    }
   ]
  },
  {
   "code": "VAR015",
   "name": "digit limit",
   "description": "How many digits a number cell accepts.",
   "values": [
    {
     "name": "as required",
     "description": "Only digits can be typed, and no more digits than the field requires; the limit is set by the field."
    }
   ]
  }
 ],
 "assets": [
  {
   "code": "BTN.001",
   "name": "box button",
   "category": "component",
   "summary": "A square button with a symbol in it: the x that deletes and the plus that adds. Its look is outlined, with no fill at rest, and it fills with its colour on hover.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004"
   ],
   "variants": [
    {
     "code": "BTN.DLT.001.001",
     "name": "Delete",
     "description": "The x: removes the card or the field it stands in.",
     "edits": "The symbol is an x and the colour is the red of the card tint.",
     "values": {},
     "look": {
      "height": 32,
      "fontSize": 0,
      "fontWeight": "400",
      "corners": "6px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 2,
      "scale": "symbol, no text",
      "found": 237,
      "places": 11
     }
    },
    {
     "code": "BTN.ADD.001.002",
     "name": "Add",
     "description": "The plus: adds a card, a row or an entry.",
     "edits": "The symbol is a plus and the colour is the card tint.",
     "values": {},
     "look": {
      "height": 32,
      "fontSize": 0,
      "fontWeight": "400",
      "corners": "6px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 2,
      "scale": "symbol, no text",
      "found": 107,
      "places": 1
     }
    }
   ],
   "requires": [],
   "catalogue": [
    "CO12",
    "CO08"
   ],
   "contracts": [
    "Remove x",
    "Plus box"
   ],
   "look": {
    "height": 32,
    "fontSize": 0,
    "fontWeight": "400",
    "corners": "6px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 2,
    "scale": "symbol, no text",
    "found": 237,
    "places": 11
   },
   "lookNotes": [
    "merged by the owner's decision (owner, 2026-10-15): x height 32, type 18, corners 6px, padding 0/0, border 2; found 20 times (8.4% of the default's 237); largest difference 18.0px",
    "merged into the default: x height 32, type 0, corners 6px, padding 0/0, border 1; found 4 times (1.7% of the default's 237); largest difference 1.0px",
    "plus: one size, by the owner's decision (owner, 2026-10-15): 32px, the size of the x and of the plus in cards (107 found). The plus on a master tile (36px, 55 found: Customer Engagement 13, Infrastructure Resources 9, Infrastructure 5, Brand 3, Foundation 3 in the five largest places) takes this size.",
    "plus corners: the corners of the x, 6px, by the owner's decision (owner, 2026-10-15); the plus measured 8px (107 found)."
   ]
  },
  {
   "code": "BTN.002",
   "name": "info button",
   "category": "component",
   "summary": "A round button with an i: it shows the note of the label or title beside it. It is not the box button: its function, shape and purpose differ. It shares only its hover reaction (fills with its colour).",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004"
   ],
   "variants": [],
   "requires": [],
   "catalogue": [
    "CO04"
   ],
   "contracts": [
    "Info note"
   ],
   "look": {
    "height": 24,
    "fontSize": 14,
    "fontWeight": "700",
    "corners": "50%",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 1,
    "scale": "small 14",
    "found": 567,
    "width": 24,
    "places": 9
   },
   "lookNotes": [
    "merged by the owner's decision (owner, 2026-10-15): info height 22, type 18, corners 50%, padding 0/0, border 1; found 70 times (12.3% of the default's 567); largest difference 4.0px",
    "enlarged, by the owner's decision (owner, 2026-10-15): from 22px to 24px, the WCAG 2.5.8 minimum, so that it no longer needs the spacing exception (567 found at 22px)."
   ]
  },
  {
   "code": "BTN.003",
   "name": "back button",
   "category": "component",
   "summary": "The Back button of a dialog, a card stack or a rail: a small triangle and the word Back, placed at the end of the rail or at the bottom of the view.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004"
   ],
   "variants": [],
   "requires": [],
   "catalogue": [
    "CO13"
   ],
   "contracts": [
    "Back button"
   ]
  },
  {
   "code": "BTN.004",
   "name": "wide add button",
   "category": "component",
   "summary": "A wide text button that adds a row to a list (+ ADD CHANNEL, + ADD REGISTRATION NUMBER): 44px high, with the plus box at its left and its words after it.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "BTN.001",
     "variant": "BTN.ADD.001.002",
     "role": "the plus: 32px, at the left of the button, like the plus box"
    }
   ],
   "catalogue": [],
   "look": {
    "height": 44,
    "fontSize": 18,
    "fontWeight": "400",
    "corners": "6px",
    "paddingLeft": 14,
    "paddingTop": 8,
    "border": 1,
    "scale": "body 18",
    "found": 15,
    "places": 4
   },
   "lookNotes": [
    "found 15 times: Customer Engagement 7, Financial Foundation 3, Foundation 1, Identity (Founders and Registrations) 4; 39px high, type 18, padding 14/8, border 1. They are not a plus box; the one look measured.",
    "height and plus: by the owner's decision (owner, 2026-10-15) the button looks like a cell, so it is 44px high like every cell (it measured 39px); the plus inside it has the size and the place of the plus box, 32px, at the left, like the plus box."
   ]
  },
  {
   "code": "DRP.001",
   "name": "dropdown",
   "category": "component",
   "summary": "A cell that opens a list to choose one value from. 45px high, 6px corners, a border, an inset edge.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR006"
   ],
   "variants": [
    {
     "code": "DRP.SRC.001.001",
     "name": "Searchable",
     "description": "A dropdown with a search box in its list (currency, long lists).",
     "edits": "The list has a search box.",
     "values": {}
    },
    {
     "code": "DRP.OTH.001.002",
     "name": "With Other",
     "description": "A dropdown whose last choice is Other, which opens a text box.",
     "edits": "The last choice is Other and it opens a text box under the cell.",
     "values": {}
    }
   ],
   "requires": [],
   "catalogue": [
    "CO02"
   ],
   "contracts": [
    "Dropdown"
   ],
   "look": {
    "height": 44,
    "fontSize": 18,
    "fontWeight": "400",
    "corners": "6px",
    "paddingLeft": 8,
    "paddingTop": 8,
    "border": 1,
    "scale": "body 18",
    "found": 493,
    "places": 8
   },
   "lookNotes": [
    "merged by the owner's decision (owner, 2026-10-15): dropdown height 45, type 18, corners 6px, padding 6/8, border 1; found 43 times (8.7% of the default's 493); largest difference 2.0px",
    "cell height, by the owner's decision (owner, 2026-10-15): every cell is 44px high (it measured 45)."
   ]
  },
  {
   "code": "TIK.001",
   "name": "tick box",
   "category": "component",
   "summary": "A square box with a tick, with its words beside it on one line. 18px.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004"
   ],
   "variants": [],
   "requires": [],
   "catalogue": [
    "CO11"
   ],
   "look": {
    "height": 24,
    "fontSize": 18,
    "fontWeight": "400",
    "corners": "0px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 0,
    "scale": "body 18",
    "found": 721,
    "width": 24,
    "places": 8
   },
   "lookNotes": [
    "merged into the default: tick box height 18, type 16, corners 0px, padding 0/0, border 0; found 5 times (0.7% of the default's 721); largest difference 2.0px",
    "enlarged, by the owner's decision (owner, 2026-10-15): from 18px to 24px, the WCAG 2.5.8 minimum, so that it no longer needs the spacing exception (721 found at 18px)."
   ]
  },
  {
   "code": "TXT.001",
   "name": "text holder",
   "category": "component",
   "summary": "A cell the person fills in with text (letters or numbers), in the body size. A text box keeps its space; a free text grows as you type or press Enter; a name cell stands on top of a card and its order number is generated automatically. A text that is only read is not a holder (see the help text, label, title and link).",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR014",
    "VAR006"
   ],
   "variants": [
    {
     "code": "TXT.BOX.001.001",
     "name": "Text box",
     "description": "One line of text in a cell that keeps its space.",
     "edits": "A single line; fixed space.",
     "values": {
      "VAR014": "fixed space"
     },
     "look": {
      "height": 44,
      "fontSize": 18,
      "fontWeight": "400",
      "corners": "6px",
      "paddingLeft": 10,
      "paddingTop": 8,
      "border": 1,
      "scale": "body 18",
      "found": 24,
      "places": 4
     }
    },
    {
     "code": "TXT.ARE.001.002",
     "name": "Free text",
     "description": "A description text: the cell gets bigger as you type or press Enter (Description, Offerings, Market).",
     "edits": "Grows with the words; Enter adds a line inside it.",
     "values": {
      "VAR014": "grows"
     },
     "look": {
      "height": null,
      "fontSize": 18,
      "fontWeight": "400",
      "corners": "6px",
      "paddingLeft": 10,
      "paddingTop": 8,
      "border": 1,
      "scale": "body 18",
      "found": 282,
      "minHeight": 44,
      "places": 19
     }
    },
    {
     "code": "TXT.NAM.001.003",
     "name": "Name cell",
     "description": "The name of a card, on top of the card. The order number is generated automatically and stands inside the cell.",
     "edits": "At the top of a card; the order number is automatic and inside the cell; it wraps and grows.",
     "values": {
      "VAR014": "grows"
     },
     "look": {
      "height": null,
      "fontSize": 18,
      "fontWeight": "400",
      "corners": "6px",
      "paddingLeft": 38,
      "paddingTop": 8,
      "border": 1,
      "scale": "body 18",
      "found": 138,
      "minHeight": 44
     }
    }
   ],
   "requires": [],
   "catalogue": [
    "CO10",
    "CO09"
   ],
   "look": {
    "height": 44,
    "fontSize": 18,
    "fontWeight": "400",
    "corners": "6px",
    "paddingLeft": 10,
    "paddingTop": 8,
    "border": 1,
    "scale": "body 18",
    "found": 24,
    "places": 4
   },
   "lookNotes": [
    "text box with square corners and no border (the name of Brand Images 1 to 3, 3 found): by the owner's decision (owner, 2026-10-15) the Brand Images follow the new layout, that is, the standard text box.",
    "moved to the name cell, by the owner's decision (owner, 2026-10-15): the text box with padding 38 (the theme name in Strategy, Strategic Period, Financial Stability; 1 found) is a name cell. It is counted in the standard name cell.",
    "free text with square corners and no border (the note of Brand Images 1 to 3, 3 found): by the owner's decision (owner, 2026-10-15) the Brand Images follow the new layout, that is, the standard free text.",
    "app error, by the owner's decision (owner, 2026-10-15): the name cell with padding 12 (the name with suggestions in Customer Engagement, Other, Referral partners; 2 found) is an error of the app and has to take the standard name cell look (padding 38, the number inside). It is counted in the standard name cell.",
    "the holders (owner, 2026-10-15): text and number holders all use the body text (18px); their variants depend on their function. A text that is only read is not a holder."
   ]
  },
  {
   "code": "LST.001",
   "name": "list",
   "category": "component",
   "summary": "A text that needs a list is ONE cell that holds numbered rows divided by thin lines, the numbers inside the cell (Values, Principles, SWOT points, Initiatives, Responsibilities). It grows as rows are added; Enter opens the next row; the rows can be moved and removed.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR006",
    "VAR014"
   ],
   "catalogue": [],
   "variants": [],
   "requires": [],
   "look": {
    "height": null,
    "minHeight": 44,
    "fontSize": 18,
    "fontWeight": "400",
    "corners": "6px",
    "paddingLeft": 12,
    "paddingTop": 8,
    "border": 1,
    "scale": "body 18",
    "found": 129,
    "places": 5
   },
   "lookNotes": [
    "measured (the owner's description, owner, 2026-10-15): the list is one cell, 6px corners and a 1px border; each row is at least 43 to 44px high, divided from the next by a thin line, with its number inside the cell at the left and the text wrapping; the row's own box has 8px corners and no border (inside the cell). The earlier reading, a single line with its number outside the cell, was wrong."
   ]
  },
  {
   "code": "DIV.001",
   "name": "divider",
   "category": "component",
   "summary": "A thin line that divides two groups of rows inside a card, with 12px of space above and below it.",
   "variables": [
    "VAR003"
   ],
   "catalogue": [],
   "variants": [],
   "requires": [],
   "look": {
    "height": 1,
    "fontSize": 0,
    "fontWeight": "400",
    "corners": "0px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 1,
    "scale": "symbol, no text",
    "found": 0
   },
   "lookNotes": [
    "from the card rules (two groups divided by a rule, 12px either side); not a separate element in the scan."
   ]
  },
  {
   "code": "NUM.001",
   "name": "number box",
   "category": "component",
   "summary": "A cell for a number: only digits can be typed, and no more digits than the field requires. In the body size, 44px high. The percent, years and months boxes are squares.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR006",
    "VAR015"
   ],
   "variants": [
    {
     "code": "NUM.WHL.001.001",
     "name": "Whole number",
     "description": "Whole numbers only.",
     "edits": "No decimals.",
     "values": {}
    },
    {
     "code": "NUM.DEC.001.002",
     "name": "Decimal",
     "description": "A number with decimals.",
     "edits": "Decimals allowed.",
     "values": {}
    },
    {
     "code": "NUM.PCT.001.003",
     "name": "Percent",
     "description": "A number from 0 to 100 with a percent sign.",
     "edits": "A square box, 44 by 44px, with a percent sign beside it.",
     "values": {},
     "look": {
      "height": 44,
      "width": 44,
      "fontSize": 18,
      "fontWeight": "400",
      "corners": "6px",
      "paddingLeft": 4,
      "paddingTop": 8,
      "border": 1,
      "scale": "body 18",
      "found": 12
     }
    },
    {
     "code": "NUM.YRS.001.004",
     "name": "Years",
     "description": "A number of years.",
     "edits": "A square box, 44 by 44px, with the word years beside it.",
     "values": {},
     "look": {
      "height": 44,
      "width": 44,
      "fontSize": 18,
      "fontWeight": "400",
      "corners": "6px",
      "paddingLeft": 4,
      "paddingTop": 8,
      "border": 1,
      "scale": "body 18",
      "found": 8
     }
    },
    {
     "code": "NUM.MON.001.005",
     "name": "Months",
     "description": "A number of months (Target operating reserve: 3 months).",
     "edits": "A square box, 44 by 44px, with the word months beside it.",
     "values": {},
     "look": {
      "height": 44,
      "width": 44,
      "fontSize": 18,
      "fontWeight": "400",
      "corners": "6px",
      "paddingLeft": 4,
      "paddingTop": 8,
      "border": 1,
      "scale": "body 18",
      "found": 1,
      "places": 1
     }
    }
   ],
   "requires": [],
   "catalogue": [
    "CO07"
   ],
   "look": {
    "height": 44,
    "fontSize": 18,
    "fontWeight": "400",
    "corners": "6px",
    "paddingLeft": 10,
    "paddingTop": 8,
    "border": 1,
    "scale": "body 18",
    "found": 166,
    "places": 2
   },
   "lookNotes": [
    "percent boxes: by the owner's decision (owner, 2026-10-15) they are squares, 45 by 45px, padding 4/8 (the 12 percent boxes of Meetup and event costs measured 44 by 45; the 5 size boxes of Typography and Text Hierarchy measured 45 by 45; 2 people boxes 44 by 45; 1 count box 48 by 45).",
    "cell height, by the owner's decision (owner, 2026-10-15): every cell is 44px high (it measured 45). The percent box is a square of 44 by 44px.",
    "years boxes: by the owner's decision (owner, 2026-10-15) they are squares, 44 by 44px, like the percent boxes (8 found: Useful life and Amortisation period).",
    "months box: by the owner's decision (owner, 2026-10-15) months boxes are squares, 44 by 44px, like the percent and years boxes (Target operating reserve in Business, Financial Foundation: the catalogue has no scan of that field, so 1 is the one named by the owner).",
    "digits: by the owner's description (owner, 2026-10-15) a number cell accepts only numbers, and no more digits than the field requires."
   ]
  },
  {
   "code": "DAT.001",
   "name": "date cell",
   "category": "component",
   "summary": "A cell that holds a date, with a calendar button that opens a calendar. The calendar lets the person choose a day, or only a month (the variable date precision). 44px high.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR006",
    "VAR010"
   ],
   "variants": [
    {
     "code": "DAT.CAL.001.001",
     "name": "Day calendar",
     "description": "A day, month and year chosen in a calendar.",
     "edits": "The calendar button opens a day calendar.",
     "values": {
      "VAR010": "day"
     }
    },
    {
     "code": "DAT.MON.001.002",
     "name": "Month calendar",
     "description": "The same calendar, set to choose only a month and a year.",
     "edits": "The calendar asks for a month and a year; the day is not asked.",
     "values": {
      "VAR010": "month"
     }
    }
   ],
   "requires": [
    {
     "asset": "DAT.002",
     "role": "the calendar that opens under the cell"
    }
   ],
   "catalogue": [
    "CO01"
   ],
   "look": {
    "height": 44,
    "fontSize": 18,
    "fontWeight": "400",
    "corners": "6px",
    "paddingLeft": 10,
    "paddingTop": 0,
    "border": 1,
    "scale": "body 18",
    "found": 166,
    "places": 2
   },
   "lookNotes": [
    "cell height, by the owner's decision (owner, 2026-10-15): every cell is 44px high (it measured 44). Already 44px.",
    "dates in the Strategic Period, the Objective cards of a Theme and the Revenue card (Begins): by the owner's decision (owner, 2026-10-15) they are this date cell with a calendar and the choice of a day or only a month; they are month pickers with their own look today (bold, wide-spaced type that cuts the year off: 'September 202')."
   ]
  },
  {
   "code": "DAT.002",
   "name": "calendar popup",
   "category": "component",
   "summary": "The window that opens under a date cell: the calendar of days, or the months and years. Rounded corners, 6px like the cells.",
   "variables": [
    "VAR001",
    "VAR003",
    "VAR004",
    "VAR010"
   ],
   "catalogue": [],
   "variants": [
    {
     "code": "DAT.DAY.002.001",
     "name": "Day popup",
     "description": "The calendar of days with Clear and Today.",
     "edits": "A grid of days.",
     "values": {
      "VAR010": "day"
     }
    },
    {
     "code": "DAT.MON.002.002",
     "name": "Month popup",
     "description": "The months of a year, with a Month and Year switch.",
     "edits": "A grid of months and a Month and Year switch.",
     "values": {
      "VAR010": "month"
     }
    }
   ],
   "requires": [],
   "look": {
    "height": null,
    "fontSize": 18,
    "fontWeight": "400",
    "corners": "6px",
    "paddingLeft": 12,
    "paddingTop": 12,
    "border": 1,
    "scale": "body 18",
    "found": 0
   },
   "lookNotes": [
    "rounded corners: by the owner's decision (owner, 2026-10-15) the popup window has rounded corners of 6px, like the cells. The day popup is the browser's own picker today (square corners, and it cannot be styled), so the app needs its own day calendar to give it rounded corners; the month popup has rounded corners already."
   ]
  },
  {
   "code": "LBL.001",
   "name": "label",
   "category": "component",
   "summary": "The words that name a field or a group, in a muted colour. Where it stands against its control (above it, or in a column at the side) belongs to the field, not to the label.",
   "variables": [
    "VAR001",
    "VAR003",
    "VAR004"
   ],
   "variants": [
    {
     "code": "LBL.HEA.001.001",
     "name": "Heading",
     "description": "A bold heading over a group of fields (Description, SWOT Analysis); it differs in style, not in position.",
     "edits": "Bold, with the group's rule.",
     "values": {}
    }
   ],
   "requires": [],
   "catalogue": [
    "CO05"
   ],
   "look": {
    "height": null,
    "fontSize": 18,
    "fontWeight": "400",
    "corners": "0px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 0,
    "scale": "body 18",
    "found": 1223,
    "places": 16
   },
   "lookNotes": [
    "position: by the owner's decision (owner, 2026-10-15) a label has no variants for its position (above, at the side); that information belongs to the field (the variable label position of the field assets).",
    "the label is prefilled text that is read, not filled in; the layout around it is arranged in the field, so what matters here is its size and style (owner, 2026-10-15)."
   ]
  },
  {
   "code": "TTL.001",
   "name": "title",
   "category": "component",
   "summary": "The name of a page, a chapter, a view, a box, a tile or a card, read and not filled in. A title is prefilled, or generated by another input; in a card a generated title replaces the name cell and is a link to the input that generates it. A title that is too long wraps, moves, or keeps one line and is cut, by where it stands.",
   "variables": [
    "VAR003",
    "VAR004",
    "VAR012",
    "VAR013"
   ],
   "catalogue": [],
   "variants": [
    {
     "code": "TTL.PAG.001.001",
     "name": "Page title",
     "description": "The title of the page in the header (3. Business System, 3. Infrastructure & Capability).",
     "edits": "The largest title: 36px (h1).",
     "values": {
      "VAR012": "prefilled"
     },
     "look": {
      "height": null,
      "fontSize": 36,
      "fontWeight": "400",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "h1 36",
      "found": 0
     }
    },
    {
     "code": "TTL.CHP.001.002",
     "name": "Chapter title",
     "description": "The title of a chapter (1. Infrastructure & Capability). Every chapter has a title.",
     "edits": "28px (h2); a title that is too long moves horizontally.",
     "values": {
      "VAR012": "prefilled",
      "VAR013": "moves"
     },
     "look": {
      "height": null,
      "fontSize": 28,
      "fontWeight": "400",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "h2 28",
      "found": 0
     }
    },
    {
     "code": "TTL.DLG.001.003",
     "name": "Dialog title",
     "description": "The title of a dialog and of a section heading (Resources / Digital Infrastructure).",
     "edits": "24px (h3), bold.",
     "values": {
      "VAR012": "prefilled"
     },
     "look": {
      "height": null,
      "fontSize": 24,
      "fontWeight": "700",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "h3 24",
      "found": 0
     }
    },
    {
     "code": "TTL.BOX.001.004",
     "name": "Box name",
     "description": "The name of the tile or box a floating card belongs to, above the card.",
     "edits": "24px (h3), bold; outside the card.",
     "values": {
      "VAR012": "prefilled"
     },
     "look": {
      "height": null,
      "fontSize": 24,
      "fontWeight": "700",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "h3 24",
      "found": 0
     }
    },
    {
     "code": "TTL.MTL.001.005",
     "name": "Master tile title",
     "description": "The title of a master tile, underlined by a rule.",
     "edits": "18px (body), weight 600; a long title wraps (Typography and Text Hierarchy).",
     "values": {
      "VAR012": "prefilled",
      "VAR013": "wraps"
     },
     "look": {
      "height": null,
      "fontSize": 18,
      "fontWeight": "600",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "body 18",
      "found": 0
     }
    },
    {
     "code": "TTL.TIL.001.006",
     "name": "Tile title",
     "description": "The title of a tile that a floating card generates (a Resource tile); it takes the name of the input that generates it.",
     "edits": "18px, weight 600; generated; a long title moves horizontally.",
     "values": {
      "VAR012": "generated",
      "VAR013": "moves"
     },
     "look": {
      "height": null,
      "fontSize": 18,
      "fontWeight": "600",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "body 18",
      "found": 0
     }
    },
    {
     "code": "TTL.CRD.001.007",
     "name": "Card title",
     "description": "The title in a card that replaces the name cell (a generated title): the name is a link to the input that generates it.",
     "edits": "18px; generated; a link to its input; one line, the rest is cut.",
     "values": {
      "VAR012": "generated",
      "VAR013": "one line, cut"
     },
     "look": {
      "height": null,
      "fontSize": 18,
      "fontWeight": "600",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "body 18",
      "found": 0
     }
    },
    {
     "code": "TTL.OPT.001.008",
     "name": "Option title",
     "description": "A title as a dropdown option in a card.",
     "edits": "18px; generated; one line, the rest is cut.",
     "values": {
      "VAR012": "generated",
      "VAR013": "one line, cut"
     },
     "look": {
      "height": null,
      "fontSize": 18,
      "fontWeight": "400",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "body 18",
      "found": 0
     }
    }
   ],
   "requires": [],
   "lookNotes": [
    "sizes from the app's text hierarchy (docs/ai/layout-rules.md, Title sizes: page 36, column 28, dialog and section 24, tile and card names 18; weight 600 on tiles and boxes, 700 on headings); not measured by the scan. The owner's rules (owner, 2026-10-15): two categories, prefilled and generated; a title in a master tile wraps; on a tile or a chapter it moves; as a link or a dropdown option in a card it uses one line and the rest is cut."
   ]
  },
  {
   "code": "LNK.001",
   "name": "link",
   "category": "component",
   "summary": "A text or a symbol that opens something: a tile, a card, a view. It is read and pressed, not filled in; its style varies with its function.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR012"
   ],
   "catalogue": [
    "CO17"
   ],
   "variants": [
    {
     "code": "LNK.TIL.001.001",
     "name": "Tile link",
     "description": "A link inside a master tile that opens one of the things the tile lists.",
     "edits": "Text inside a tile; opens a view or a card.",
     "values": {
      "VAR012": "prefilled"
     }
    },
    {
     "code": "LNK.CRD.001.002",
     "name": "Card name link",
     "description": "The name of a card that is a link to the card that generates it (a child's name links to its parent card): underlined, bolder under the pointer and the focus.",
     "edits": "Underlined; generated; opens the parent card.",
     "values": {
      "VAR012": "generated"
     }
    },
    {
     "code": "LNK.SYM.001.003",
     "name": "Link symbol",
     "description": "The small symbol beside a dropdown choice that shows the choice is a link to another card.",
     "edits": "A symbol, no words.",
     "values": {
      "VAR012": "generated"
     }
    }
   ],
   "requires": [],
   "lookNotes": [
    "the tile link (TIL.004) is a variant of the link (owner, 2026-10-15): labels, links and titles are read, not filled in."
   ]
  },
  {
   "code": "HLP.001",
   "name": "help text",
   "category": "component",
   "summary": "A text that is already there and is not a label or a title: it helps, explains or shows. It is read, not filled in. Its variants follow its style.",
   "variables": [
    "VAR003",
    "VAR004"
   ],
   "catalogue": [],
   "variants": [
    {
     "code": "HLP.INF.001.001",
     "name": "Info text",
     "description": "The note that the i shows (a short sentence or a few points).",
     "edits": "Shown in a note, not in the page.",
     "values": {}
    },
    {
     "code": "HLP.BUL.001.002",
     "name": "Bulleted list",
     "description": "A read-only list of what something includes or holds (the list on a tile).",
     "edits": "Bullets; small text.",
     "values": {},
     "look": {
      "height": null,
      "fontSize": 14,
      "fontWeight": "400",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "small 14",
      "found": 0
     }
    },
    {
     "code": "HLP.NUM.001.003",
     "name": "Numbered list",
     "description": "A read-only numbered list (a founder's roles recalled from the profile).",
     "edits": "Numbers; no cell.",
     "values": {}
    },
    {
     "code": "HLP.SUM.001.004",
     "name": "Summary line",
     "description": "A line that summarises a card or a tile (dates, status, price).",
     "edits": "One short line; small and muted.",
     "values": {},
     "look": {
      "height": null,
      "fontSize": 14,
      "fontWeight": "400",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "small 14",
      "found": 0
     }
    },
    {
     "code": "HLP.VAL.001.005",
     "name": "Shown value",
     "description": "A value the app fills in and shows beside a label (the group of a card, a total).",
     "edits": "Plain text, not a cell.",
     "values": {}
    }
   ],
   "requires": [],
   "look": {
    "height": null,
    "fontSize": 14,
    "fontWeight": "400",
    "corners": "0px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 0,
    "scale": "small 14",
    "found": 0
   },
   "lookNotes": [
    "small text (14px) for lists, summaries and notes: the app's text hierarchy (docs/ai/layout-rules.md, Title sizes). Only the bulleted list and the summary line carry a measured look here."
   ]
  },
  {
   "code": "ARW.001",
   "name": "arrow",
   "category": "component",
   "summary": "A triangle button that moves to the next or the previous one. 24px wide and 44px high; it grows 1.2 times on hover.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004"
   ],
   "variants": [
    {
     "code": "ARW.PAG.001.001",
     "name": "Page arrow",
     "description": "Moves to the previous or the next page.",
     "edits": "Sits at the sides of the page.",
     "values": {}
    },
    {
     "code": "ARW.CAR.001.002",
     "name": "Carousel arrow",
     "description": "Moves to the previous or the next card or view inside a dialog or card.",
     "edits": "Sits at the sides of the dialog or the card.",
     "values": {}
    }
   ],
   "requires": [],
   "catalogue": [
    "CO14",
    "CO18"
   ],
   "contracts": [
    "Rails"
   ]
  },
  {
   "code": "ARW.002",
   "name": "fold arrow",
   "category": "component",
   "summary": "A small triangle that folds and unfolds a card or a list.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004"
   ],
   "variants": [
    {
     "code": "ARW.LAB.002.001",
     "name": "Label arrow",
     "description": "A frameless arrow beside a label that opens a list under it.",
     "edits": "No frame; sits 6px from the label.",
     "values": {},
     "look": {
      "height": 24,
      "fontSize": 18,
      "fontWeight": "400",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "body 18",
      "found": 8,
      "places": 2
     }
    },
    {
     "code": "ARW.TTL.002.002",
     "name": "Title arrow",
     "description": "The label arrow beside a chapter or column title (Infrastructure & Capability): the same frameless triangle, with the same function, at the size of the title.",
     "edits": "The arrow is 28px, the size of a column title (h2), where the label arrow is 24px beside a field label.",
     "values": {},
     "look": {
      "height": 28,
      "width": 28,
      "fontSize": 28,
      "fontWeight": "400",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "h2 28",
      "found": 2,
      "places": 1
     }
    }
   ],
   "requires": [],
   "catalogue": [
    "CO03",
    "CO06"
   ],
   "contracts": [
    "Fold arrow",
    "Label arrow"
   ],
   "look": {
    "height": 36,
    "fontSize": 0,
    "fontWeight": "400",
    "corners": "6px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 1,
    "scale": "symbol, no text",
    "found": 11,
    "places": 1
   },
   "lookNotes": [
    "merged by the owner's decision (owner, 2026-10-15): fold arrow height 36, type 18, corners 6px, padding 0/0, border 1; found 10 times (90.9% of the default's 11); largest difference 18.0px",
    "label arrow and title arrow are variants (the owner's decision, owner, 2026-10-15): the same component, function and style; the size follows the text beside it (24px beside a field label, 28px beside a title)."
   ]
  },
  {
   "code": "BUL.001",
   "name": "bullet",
   "category": "component",
   "summary": "The one dot of every rail: 12px, and 17.4px when it is the selected one. Its colour follows the tint of the card and its reaction (colour or opacity).",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004"
   ],
   "variants": [],
   "requires": [],
   "catalogue": [
    "CO15",
    "CO19"
   ],
   "contracts": [
    "Rails"
   ],
   "lookNotes": [
    "the one bullet of every page tag (the owner, owner, 2026-10-15): there is one type of bullet."
   ]
  },
  {
   "code": "TIL.001",
   "name": "master tile",
   "category": "tile",
   "summary": "The large tile of a chapter: a title, the list of what it holds, and often a plus. Opens a view or a card.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "BTN.001",
     "variant": "BTN.ADD.001.002",
     "role": "adds to the list the tile holds"
    },
    {
     "asset": "TTL.001",
     "variant": "TTL.MTL.001.005",
     "role": "the title of the tile"
    },
    {
     "asset": "LNK.001",
     "variant": "LNK.TIL.001.001",
     "role": "the links it lists"
    }
   ],
   "catalogue": [
    "CO23"
   ]
  },
  {
   "code": "TIL.002",
   "name": "open tile",
   "category": "tile",
   "summary": "A tile inside a dialog view that opens a card or a view. A tile that a floating card generates (a Resource) shows its title on one line, and a title that is too long moves horizontally.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR006"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "TTL.001",
     "variant": "TTL.TIL.001.006",
     "role": "the title, generated by the card"
    }
   ],
   "catalogue": [
    "CO24"
   ],
   "lookNotes": [
    "title: by the owner's decision (owner, 2026-10-15) the tiles that floating cards generate (the Resources tiles) show the title on one line, and a title that is too long moves horizontally instead of being cut off."
   ]
  },
  {
   "code": "TIL.003",
   "name": "add card tile",
   "category": "tile",
   "summary": "A dashed tile with a plus and the words ADD CARD at the end of a row of tiles.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003"
   ],
   "variants": [],
   "requires": [],
   "catalogue": []
  },
  {
   "code": "FRM.001",
   "name": "chapter frame",
   "category": "frame",
   "summary": "A frame on a page that holds master tiles, with a title and, often, a fold arrow and an i.",
   "variables": [
    "VAR003",
    "VAR004"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "ARW.002",
     "role": "folds the chapter"
    },
    {
     "asset": "BTN.002",
     "role": "the note of the chapter title"
    },
    {
     "asset": "TTL.001",
     "variant": "TTL.CHP.001.002",
     "role": "the title of the chapter"
    }
   ],
   "catalogue": [
    "CO16"
   ]
  },
  {
   "code": "FRM.002",
   "name": "page",
   "category": "frame",
   "summary": "A page of a system: the header, the Pages rail, the page arrows and the chapters.",
   "variables": [
    "VAR003",
    "VAR004"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "FLD.106",
     "variant": "FLD.PAG.106.001",
     "role": "moves between the pages"
    },
    {
     "asset": "ARW.001",
     "variant": "ARW.PAG.001.001",
     "role": "moves to the next or previous page"
    },
    {
     "asset": "TTL.001",
     "variant": "TTL.PAG.001.001",
     "role": "the title of the page"
    }
   ],
   "catalogue": [
    "CO25"
   ]
  },
  {
   "code": "FRM.003",
   "name": "dialog view",
   "category": "frame",
   "summary": "A view of tiles that opens over the page, with its own rail, arrows and a Back button.",
   "variables": [
    "VAR003",
    "VAR004"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "FLD.106",
     "variant": "FLD.CAR.106.003",
     "role": "moves between the views or cards"
    },
    {
     "asset": "BTN.003",
     "role": "returns to the page"
    },
    {
     "asset": "TTL.001",
     "variant": "TTL.DLG.001.003",
     "role": "the title of the dialog"
    }
   ],
   "catalogue": [
    "CO21"
   ]
  },
  {
   "code": "FRM.004",
   "name": "box name",
   "category": "frame",
   "summary": "The name of the tile or box a card belongs to, centred above the floating card, 12px from it.",
   "variables": [
    "VAR003"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "TTL.001",
     "variant": "TTL.BOX.001.004",
     "role": "the name of the tile or box"
    }
   ],
   "catalogue": [
    "CO20"
   ]
  },
  {
   "code": "FLD.001",
   "name": "Number",
   "category": "field",
   "summary": "The Number field: a label and read-only.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "HLP.001",
     "variant": "HLP.VAL.001.005",
     "role": "shown, not edited"
    }
   ],
   "catalogue": [
    "F001"
   ]
  },
  {
   "code": "FLD.002",
   "name": "Name",
   "category": "field",
   "summary": "The Name field: a label and text box, dropdown, read-only.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.BOX.001.001",
     "role": "text"
    },
    {
     "asset": "DRP.001",
     "variant": "DRP.OTH.001.002",
     "role": "choice"
    },
    {
     "asset": "HLP.001",
     "variant": "HLP.VAL.001.005",
     "role": "shown, not edited"
    }
   ],
   "catalogue": [
    "F002",
    "F021",
    "F045"
   ]
  },
  {
   "code": "FLD.003",
   "name": "Start date",
   "category": "field",
   "summary": "The Start date field: a label and date cell.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DAT.001",
     "variant": "DAT.CAL.001.001",
     "role": "date"
    }
   ],
   "catalogue": [
    "F004"
   ]
  },
  {
   "code": "FLD.004",
   "name": "End date",
   "category": "field",
   "summary": "The End date field: a label and date cell.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DAT.001",
     "variant": "DAT.CAL.001.001",
     "role": "date"
    }
   ],
   "catalogue": [
    "F005"
   ]
  },
  {
   "code": "FLD.005",
   "name": "Category",
   "category": "field",
   "summary": "The Category field: a label and dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F006"
   ]
  },
  {
   "code": "FLD.006",
   "name": "Group",
   "category": "field",
   "summary": "The Group field: a label and read-only, dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "HLP.001",
     "variant": "HLP.VAL.001.005",
     "role": "shown, not edited"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F007",
    "F020"
   ]
  },
  {
   "code": "FLD.007",
   "name": "Status",
   "category": "field",
   "summary": "The Status field: a label and dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F008"
   ]
  },
  {
   "code": "FLD.008",
   "name": "Rent",
   "category": "field",
   "summary": "The Rent field: a label and dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "variant": "DRP.OTH.001.002",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F010"
   ]
  },
  {
   "code": "FLD.009",
   "name": "Activity",
   "category": "field",
   "summary": "The Activity field: a label and dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "variant": "DRP.OTH.001.002",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F012"
   ]
  },
  {
   "code": "FLD.010",
   "name": "Price",
   "category": "field",
   "summary": "The Price field: a label and number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.DEC.001.002",
     "role": "number"
    }
   ],
   "catalogue": [
    "F013"
   ]
  },
  {
   "code": "FLD.011",
   "name": "Currency",
   "category": "field",
   "summary": "The Currency field: a label and dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "variant": "DRP.SRC.001.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F014"
   ]
  },
  {
   "code": "FLD.012",
   "name": "Extra: Commercial property tax (when bought)",
   "category": "field",
   "summary": "The Extra: Commercial property tax (when bought) field: a label and extra (tick + number).",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "NUM.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F015"
   ]
  },
  {
   "code": "FLD.013",
   "name": "Extra: Service charge (when bought)",
   "category": "field",
   "summary": "The Extra: Service charge (when bought) field: a label and extra (tick + number).",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "NUM.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F016"
   ]
  },
  {
   "code": "FLD.014",
   "name": "Description / Relevant Information",
   "category": "field",
   "summary": "The Description / Relevant Information field: a label and optional note, tick box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "switches the note on"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "the note"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    }
   ],
   "catalogue": [
    "F017",
    "F082"
   ]
  },
  {
   "code": "FLD.015",
   "name": "Record date and time",
   "category": "field",
   "summary": "The Record date and time field: a label and read-only.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "HLP.001",
     "variant": "HLP.VAL.001.005",
     "role": "shown, not edited"
    }
   ],
   "catalogue": [
    "F018"
   ]
  },
  {
   "code": "FLD.016",
   "name": "Qty",
   "category": "field",
   "summary": "The Qty field: a label and number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.DEC.001.002",
     "role": "number"
    }
   ],
   "catalogue": [
    "F022"
   ]
  },
  {
   "code": "FLD.017",
   "name": "Frequency",
   "category": "field",
   "summary": "The Frequency field: a label and read-only, dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "HLP.001",
     "variant": "HLP.VAL.001.005",
     "role": "shown, not edited"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F023",
    "F026"
   ]
  },
  {
   "code": "FLD.018",
   "name": "Unit",
   "category": "field",
   "summary": "The Unit field: a label and dropdown, read-only.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    },
    {
     "asset": "HLP.001",
     "variant": "HLP.VAL.001.005",
     "role": "shown, not edited"
    }
   ],
   "catalogue": [
    "F024",
    "F029"
   ]
  },
  {
   "code": "FLD.019",
   "name": "Useful life",
   "category": "field",
   "summary": "The Useful life field: a label and number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.YRS.001.004",
     "role": "number"
    }
   ],
   "catalogue": [
    "F025"
   ]
  },
  {
   "code": "FLD.020",
   "name": "Warranty",
   "category": "field",
   "summary": "The Warranty field: a label and tick box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    }
   ],
   "catalogue": [
    "F027"
   ]
  },
  {
   "code": "FLD.021",
   "name": "Warranty until",
   "category": "field",
   "summary": "The Warranty until field: a label and date cell.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DAT.001",
     "variant": "DAT.CAL.001.001",
     "role": "date"
    }
   ],
   "catalogue": [
    "F028"
   ]
  },
  {
   "code": "FLD.022",
   "name": "Extra: Road tax (when bought)",
   "category": "field",
   "summary": "The Extra: Road tax (when bought) field: a label and extra (tick + number).",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "NUM.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F030"
   ]
  },
  {
   "code": "FLD.023",
   "name": "Cost option",
   "category": "field",
   "summary": "The Cost option field: a label and dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F031"
   ]
  },
  {
   "code": "FLD.024",
   "name": "Billing type",
   "category": "field",
   "summary": "The Billing type field: a label and read-only.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "HLP.001",
     "variant": "HLP.VAL.001.005",
     "role": "shown, not edited"
    }
   ],
   "catalogue": [
    "F032"
   ]
  },
  {
   "code": "FLD.025",
   "name": "Payment Plan",
   "category": "field",
   "summary": "The Payment Plan field: a label and tick box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    }
   ],
   "catalogue": [
    "F033"
   ]
  },
  {
   "code": "FLD.026",
   "name": "Plan",
   "category": "field",
   "summary": "The Plan field: a label and dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F034"
   ]
  },
  {
   "code": "FLD.027",
   "name": "Deposit %",
   "category": "field",
   "summary": "The Deposit % field: a label and number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.PCT.001.003",
     "role": "number"
    }
   ],
   "catalogue": [
    "F035"
   ]
  },
  {
   "code": "FLD.028",
   "name": "Balance date",
   "category": "field",
   "summary": "The Balance date field: a label and date cell.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DAT.001",
     "variant": "DAT.CAL.001.001",
     "role": "date"
    }
   ],
   "catalogue": [
    "F036"
   ]
  },
  {
   "code": "FLD.029",
   "name": "Instalments",
   "category": "field",
   "summary": "The Instalments field: a label and number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.WHL.001.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F037"
   ]
  },
  {
   "code": "FLD.030",
   "name": "Instalment lines",
   "category": "field",
   "summary": "The Instalment lines field: a label and date cell.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DAT.001",
     "variant": "DAT.CAL.001.001",
     "role": "date"
    }
   ],
   "catalogue": [
    "F038"
   ]
  },
  {
   "code": "FLD.031",
   "name": "Milestone",
   "category": "field",
   "summary": "The Milestone field: a label and text box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.BOX.001.001",
     "role": "text"
    }
   ],
   "catalogue": [
    "F039"
   ]
  },
  {
   "code": "FLD.032",
   "name": "Milestone %",
   "category": "field",
   "summary": "The Milestone % field: a label and number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.PCT.001.003",
     "role": "number"
    }
   ],
   "catalogue": [
    "F040"
   ]
  },
  {
   "code": "FLD.033",
   "name": "Milestone date",
   "category": "field",
   "summary": "The Milestone date field: a label and date cell.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DAT.001",
     "variant": "DAT.CAL.001.001",
     "role": "date"
    }
   ],
   "catalogue": [
    "F041"
   ]
  },
  {
   "code": "FLD.034",
   "name": "Allowance",
   "category": "field",
   "summary": "The Allowance field: a label and number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.WHL.001.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F042"
   ]
  },
  {
   "code": "FLD.035",
   "name": "Extra: Commission",
   "category": "field",
   "summary": "The Extra: Commission field: a label and extra (tick + number).",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "NUM.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F043"
   ]
  },
  {
   "code": "FLD.036",
   "name": "Extra: Bonus",
   "category": "field",
   "summary": "The Extra: Bonus field: a label and extra (tick + number).",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "NUM.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F044"
   ]
  },
  {
   "code": "FLD.037",
   "name": "Roles",
   "category": "field",
   "summary": "The Roles field: a label and read-only.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "HLP.001",
     "variant": "HLP.VAL.001.005",
     "role": "shown, not edited"
    }
   ],
   "catalogue": [
    "F046"
   ]
  },
  {
   "code": "FLD.038",
   "name": "Salary",
   "category": "field",
   "summary": "The Salary field: a label and number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.WHL.001.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F047"
   ]
  },
  {
   "code": "FLD.039",
   "name": "Working Hrs",
   "category": "field",
   "summary": "The Working Hrs field: a label and number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.WHL.001.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F048"
   ]
  },
  {
   "code": "FLD.040",
   "name": "Delivery Hrs",
   "category": "field",
   "summary": "The Delivery Hrs field: a label and number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.WHL.001.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F049"
   ]
  },
  {
   "code": "FLD.041",
   "name": "Responsibilities",
   "category": "field",
   "summary": "The Responsibilities field: a label and read-only.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "HLP.001",
     "variant": "HLP.VAL.001.005",
     "role": "shown, not edited"
    }
   ],
   "catalogue": [
    "F050"
   ]
  },
  {
   "code": "FLD.042",
   "name": "Type",
   "category": "field",
   "summary": "The Type field: a label and dropdown, text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F051",
    "F117",
    "F120",
    "F138"
   ]
  },
  {
   "code": "FLD.043",
   "name": "Performer",
   "category": "field",
   "summary": "The Performer field: a label and dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F052"
   ]
  },
  {
   "code": "FLD.044",
   "name": "Resources",
   "category": "field",
   "summary": "The Resources field: a label and tick box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    }
   ],
   "catalogue": [
    "F053"
   ]
  },
  {
   "code": "FLD.045",
   "name": "Resource",
   "category": "field",
   "summary": "The Resource field: a label and dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F054"
   ]
  },
  {
   "code": "FLD.046",
   "name": "Units",
   "category": "field",
   "summary": "The Units field: a label and number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.WHL.001.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F055"
   ]
  },
  {
   "code": "FLD.047",
   "name": "Cost",
   "category": "field",
   "summary": "The Cost field: a label and read-only, number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "HLP.001",
     "variant": "HLP.VAL.001.005",
     "role": "shown, not edited"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.WHL.001.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F056",
    "F073"
   ]
  },
  {
   "code": "FLD.048",
   "name": "Responsible",
   "category": "field",
   "summary": "The Responsible field: a label and tick + dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F057"
   ]
  },
  {
   "code": "FLD.049",
   "name": "Completed",
   "category": "field",
   "summary": "The Completed field: a label and tick box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    }
   ],
   "catalogue": [
    "F058"
   ]
  },
  {
   "code": "FLD.050",
   "name": "Extra: Deposit",
   "category": "field",
   "summary": "The Extra: Deposit field: a label and extra (tick + number).",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "NUM.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F059"
   ]
  },
  {
   "code": "FLD.051",
   "name": "Extra: Service charge",
   "category": "field",
   "summary": "The Extra: Service charge field: a label and extra (tick + number).",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "NUM.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F060"
   ]
  },
  {
   "code": "FLD.052",
   "name": "Extra: Commercial property tax",
   "category": "field",
   "summary": "The Extra: Commercial property tax field: a label and extra (tick + number).",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "NUM.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F061"
   ]
  },
  {
   "code": "FLD.053",
   "name": "Extra: Road tax",
   "category": "field",
   "summary": "The Extra: Road tax field: a label and extra (tick + number).",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "NUM.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F062"
   ]
  },
  {
   "code": "FLD.054",
   "name": "Linked to",
   "category": "field",
   "summary": "The Linked to field: a label and tick list (+ number).",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "one tick per entry"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.PCT.001.003",
     "role": "the share of each ticked entry"
    }
   ],
   "catalogue": [
    "F063"
   ]
  },
  {
   "code": "FLD.055",
   "name": "Rate override",
   "category": "field",
   "summary": "The Rate override field: a label and number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.PCT.001.003",
     "role": "number"
    }
   ],
   "catalogue": [
    "F064"
   ]
  },
  {
   "code": "FLD.056",
   "name": "Amortisation period",
   "category": "field",
   "summary": "The Amortisation period field: a label and number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.YRS.001.004",
     "role": "number"
    }
   ],
   "catalogue": [
    "F065"
   ]
  },
  {
   "code": "FLD.057",
   "name": "Extra: Minimum order",
   "category": "field",
   "summary": "The Extra: Minimum order field: a label and extra (tick + number).",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "NUM.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F066"
   ]
  },
  {
   "code": "FLD.058",
   "name": "Extra: Customs duty",
   "category": "field",
   "summary": "The Extra: Customs duty field: a label and extra (tick + number).",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "NUM.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F067"
   ]
  },
  {
   "code": "FLD.059",
   "name": "Extra: Clearance and handling",
   "category": "field",
   "summary": "The Extra: Clearance and handling field: a label and extra (tick + number).",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "NUM.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F068"
   ]
  },
  {
   "code": "FLD.060",
   "name": "Extra: Other duties",
   "category": "field",
   "summary": "The Extra: Other duties field: a label and extra (tick + number).",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "NUM.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F069"
   ]
  },
  {
   "code": "FLD.061",
   "name": "Cost options",
   "category": "field",
   "summary": "The Cost options field: a label and dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F070"
   ]
  },
  {
   "code": "FLD.062",
   "name": "Extra: Handling per pallet",
   "category": "field",
   "summary": "The Extra: Handling per pallet field: a label and extra (tick + number).",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "NUM.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F071"
   ]
  },
  {
   "code": "FLD.063",
   "name": "Date",
   "category": "field",
   "summary": "The Date field: a label and date cell, number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DAT.001",
     "variant": "DAT.CAL.001.001",
     "role": "date"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.WHL.001.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F072",
    "F078"
   ]
  },
  {
   "code": "FLD.064",
   "name": "Responsibility",
   "category": "field",
   "summary": "The Responsibility field: a label and dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F074"
   ]
  },
  {
   "code": "FLD.065",
   "name": "Linked registration",
   "category": "field",
   "summary": "The Linked registration field: a label and dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F075",
    "F081"
   ]
  },
  {
   "code": "FLD.066",
   "name": "Expense name",
   "category": "field",
   "summary": "The Expense name field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F076"
   ]
  },
  {
   "code": "FLD.067",
   "name": "Cost ($)",
   "category": "field",
   "summary": "The Cost ($) field: a label and number box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "NUM.001",
     "variant": "NUM.WHL.001.001",
     "role": "number"
    }
   ],
   "catalogue": [
    "F079"
   ]
  },
  {
   "code": "FLD.068",
   "name": "Colour name",
   "category": "field",
   "summary": "The Colour name field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F083"
   ]
  },
  {
   "code": "FLD.069",
   "name": "Role",
   "category": "field",
   "summary": "The Role field: a label and dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F086"
   ]
  },
  {
   "code": "FLD.070",
   "name": "Colour",
   "category": "field",
   "summary": "The Colour field: a label and text box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.BOX.001.001",
     "role": "text"
    }
   ],
   "catalogue": [
    "F088"
   ]
  },
  {
   "code": "FLD.071",
   "name": "Usage",
   "category": "field",
   "summary": "The Usage field: a label and tick box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    }
   ],
   "catalogue": [
    "F089"
   ]
  },
  {
   "code": "FLD.072",
   "name": "Typeface name",
   "category": "field",
   "summary": "The Typeface name field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F090"
   ]
  },
  {
   "code": "FLD.073",
   "name": "Image name",
   "category": "field",
   "summary": "The Image name field: a label and text box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.BOX.001.001",
     "role": "text"
    }
   ],
   "catalogue": [
    "F093"
   ]
  },
  {
   "code": "FLD.074",
   "name": "Image description",
   "category": "field",
   "summary": "The Image description field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F094"
   ]
  },
  {
   "code": "FLD.075",
   "name": "Segment, Profile name",
   "category": "field",
   "summary": "The Segment, Profile name field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F095"
   ]
  },
  {
   "code": "FLD.076",
   "name": "Specific Personal Information",
   "category": "field",
   "summary": "The Specific Personal Information field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F098"
   ]
  },
  {
   "code": "FLD.077",
   "name": "Psychographics",
   "category": "field",
   "summary": "The Psychographics field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F100"
   ]
  },
  {
   "code": "FLD.078",
   "name": "Social & Interest Hubs",
   "category": "field",
   "summary": "The Social & Interest Hubs field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F102"
   ]
  },
  {
   "code": "FLD.079",
   "name": "Information & Shopping Habits",
   "category": "field",
   "summary": "The Information & Shopping Habits field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F104"
   ]
  },
  {
   "code": "FLD.080",
   "name": "Goals & Desires",
   "category": "field",
   "summary": "The Goals & Desires field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F106"
   ]
  },
  {
   "code": "FLD.081",
   "name": "Challenges & Problems",
   "category": "field",
   "summary": "The Challenges & Problems field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F108"
   ]
  },
  {
   "code": "FLD.082",
   "name": "Objections",
   "category": "field",
   "summary": "The Objections field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F110"
   ]
  },
  {
   "code": "FLD.083",
   "name": "Functional",
   "category": "field",
   "summary": "The Functional field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F112"
   ]
  },
  {
   "code": "FLD.084",
   "name": "Emotional",
   "category": "field",
   "summary": "The Emotional field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F114"
   ]
  },
  {
   "code": "FLD.085",
   "name": "Social",
   "category": "field",
   "summary": "The Social field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F116"
   ]
  },
  {
   "code": "FLD.086",
   "name": "Offerings",
   "category": "field",
   "summary": "The Offerings field: a label and text area, tick box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    }
   ],
   "catalogue": [
    "F122",
    "F158",
    "F159",
    "F160",
    "F161",
    "F163",
    "F164",
    "F165",
    "F166",
    "F168",
    "F169",
    "F170",
    "F171",
    "F174",
    "F175",
    "F176",
    "F177",
    "F179",
    "F180",
    "F181",
    "F182",
    "F184",
    "F185",
    "F186",
    "F187",
    "F189",
    "F190",
    "F191",
    "F192",
    "F194",
    "F195",
    "F196",
    "F197"
   ]
  },
  {
   "code": "FLD.087",
   "name": "Market",
   "category": "field",
   "summary": "The Market field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F124"
   ]
  },
  {
   "code": "FLD.088",
   "name": "Customer Acquisition",
   "category": "field",
   "summary": "The Customer Acquisition field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F126"
   ]
  },
  {
   "code": "FLD.089",
   "name": "Customer Experience",
   "category": "field",
   "summary": "The Customer Experience field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F128"
   ]
  },
  {
   "code": "FLD.090",
   "name": "Strengths",
   "category": "field",
   "summary": "The Strengths field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "LST.001",
     "role": "the list of strengths (numbered rows in one cell)"
    }
   ],
   "catalogue": [
    "F130"
   ]
  },
  {
   "code": "FLD.091",
   "name": "Weaknesses",
   "category": "field",
   "summary": "The Weaknesses field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "LST.001",
     "role": "the list of weaknesses (numbered rows in one cell)"
    }
   ],
   "catalogue": [
    "F132"
   ]
  },
  {
   "code": "FLD.092",
   "name": "Opportunities",
   "category": "field",
   "summary": "The Opportunities field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "LST.001",
     "role": "the list of opportunities (numbered rows in one cell)"
    }
   ],
   "catalogue": [
    "F134"
   ]
  },
  {
   "code": "FLD.093",
   "name": "Threats",
   "category": "field",
   "summary": "The Threats field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "LST.001",
     "role": "the list of threats (numbered rows in one cell)"
    }
   ],
   "catalogue": [
    "F136"
   ]
  },
  {
   "code": "FLD.094",
   "name": "Functional Needs Addressed",
   "category": "field",
   "summary": "The Functional Needs Addressed field: a label and tick box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    }
   ],
   "catalogue": [
    "F140"
   ]
  },
  {
   "code": "FLD.095",
   "name": "Function",
   "category": "field",
   "summary": "The Function field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F142"
   ]
  },
  {
   "code": "FLD.096",
   "name": "Customer Benefit",
   "category": "field",
   "summary": "The Customer Benefit field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F144"
   ]
  },
  {
   "code": "FLD.097",
   "name": "Content & Scope",
   "category": "field",
   "summary": "The Content & Scope field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F146"
   ]
  },
  {
   "code": "FLD.098",
   "name": "Purchase & Delivery",
   "category": "field",
   "summary": "The Purchase & Delivery field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F148"
   ]
  },
  {
   "code": "FLD.099",
   "name": "Support & Communication",
   "category": "field",
   "summary": "The Support & Communication field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F150"
   ]
  },
  {
   "code": "FLD.100",
   "name": "Requirements & Conditions",
   "category": "field",
   "summary": "The Requirements & Conditions field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F152"
   ]
  },
  {
   "code": "FLD.101",
   "name": "Subchannel name",
   "category": "field",
   "summary": "The Subchannel name field: a label and dropdown, text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F153",
    "F173"
   ]
  },
  {
   "code": "FLD.102",
   "name": "Links",
   "category": "field",
   "summary": "The Links field: a label and tick box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    }
   ],
   "catalogue": [
    "F157"
   ]
  },
  {
   "code": "FLD.103",
   "name": "Journey Stage",
   "category": "field",
   "summary": "The Journey Stage field: a label and dropdown.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F162",
    "F167",
    "F172",
    "F178",
    "F183",
    "F188",
    "F193",
    "F198"
   ]
  },
  {
   "code": "FLD.104",
   "name": "Legal requirement name",
   "category": "field",
   "summary": "The Legal requirement name field: a label and text area.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.002",
     "role": "text"
    }
   ],
   "catalogue": [
    "F199"
   ]
  },
  {
   "code": "FLD.105",
   "name": "Reference or Number",
   "category": "field",
   "summary": "The Reference or Number field: a label and tick box.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "LBL.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    }
   ],
   "catalogue": [
    "F201"
   ]
  },
  {
   "code": "CRD.001",
   "name": "floating card",
   "category": "card",
   "summary": "The one surface every floating card stands on: 492px wide, 8px corners, 12px padding and 12px between everything, with the box name above it.",
   "variables": [
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR007",
    "VAR009"
   ],
   "variants": [
    {
     "code": "CRD.CRD.001.001",
     "name": "Card",
     "description": "A card of 492px.",
     "edits": "492px wide.",
     "values": {}
    },
    {
     "code": "CRD.FND.001.002",
     "name": "Founder",
     "description": "A founder's card of 297px.",
     "edits": "297px wide.",
     "values": {}
    }
   ],
   "requires": [
    {
     "asset": "FRM.004",
     "role": "the box name above the card"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.NAM.001.003",
     "role": "the name of the card"
    },
    {
     "asset": "BTN.001",
     "variant": "BTN.DLT.001.001",
     "role": "removes the card"
    }
   ],
   "catalogue": [],
   "contracts": [
    "Floating card"
   ]
  },
  {
   "code": "CRD.002",
   "name": "Infrastructure Resource",
   "category": "card",
   "summary": "The Infrastructure Resource card: a floating card with 3 common fields in a fixed order and 15 kinds that add their own.",
   "variables": [
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR005",
    "VAR007",
    "VAR009"
   ],
   "variants": [
    {
     "code": "CRD.PRM.002.001",
     "name": "Premises",
     "description": "The Premises kind of the Infrastructure Resource card (Workspace).",
     "edits": "Adds the fields FLD.004, FLD.005, FLD.006, FLD.007, FLD.008, FLD.009, FLD.010, FLD.011, FLD.012, FLD.013, FLD.014, FLD.015 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.004",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.005",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.006",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.007",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.008",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.009",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.010",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.011",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.012",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.013",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.014",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.015",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.PRE.002.002",
     "name": "Premises Utilities",
     "description": "The Premises Utilities kind of the Infrastructure Resource card (Utilities).",
     "edits": "Adds the fields FLD.004, FLD.005, FLD.006, FLD.007, FLD.009, FLD.016, FLD.010, FLD.011, FLD.017, FLD.014, FLD.015 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.004",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.005",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.006",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.007",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.009",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.010",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.011",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.014",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.015",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.FRN.002.003",
     "name": "Furniture & Fittings",
     "description": "The Furniture & Fittings kind of the Infrastructure Resource card (Workstation).",
     "edits": "Adds the fields FLD.004, FLD.005, FLD.006, FLD.007, FLD.009, FLD.016, FLD.010, FLD.011, FLD.017, FLD.018, FLD.019, FLD.014, FLD.015 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.004",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.005",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.006",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.007",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.009",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.010",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.011",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.019",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.014",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.015",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.DVC.002.004",
     "name": "Devices & Tools",
     "description": "The Devices & Tools kind of the Infrastructure Resource card (Equipment).",
     "edits": "Adds the fields FLD.004, FLD.005, FLD.006, FLD.007, FLD.009, FLD.016, FLD.010, FLD.011, FLD.017, FLD.018, FLD.019, FLD.020, FLD.021, FLD.014, FLD.015 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.004",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.005",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.006",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.007",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.009",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.010",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.011",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.019",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.020",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.021",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.014",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.015",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.CMP.002.005",
     "name": "Company Vehicles",
     "description": "The Company Vehicles kind of the Infrastructure Resource card (Vehicles).",
     "edits": "Adds the fields FLD.004, FLD.005, FLD.006, FLD.007, FLD.008, FLD.009, FLD.016, FLD.010, FLD.011, FLD.017, FLD.018, FLD.019, FLD.022, FLD.014, FLD.015 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.004",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.005",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.006",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.007",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.008",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.009",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.010",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.011",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.019",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.022",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.014",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.015",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.VHC.002.006",
     "name": "Vehicle Running Costs",
     "description": "The Vehicle Running Costs kind of the Infrastructure Resource card (Vehicles).",
     "edits": "Adds the fields FLD.004, FLD.005, FLD.006, FLD.007, FLD.009, FLD.016, FLD.010, FLD.011, FLD.017, FLD.018, FLD.014, FLD.015 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.004",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.005",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.006",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.007",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.009",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.010",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.011",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.014",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.015",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.SFT.002.007",
     "name": "Software & Web",
     "description": "The Software & Web kind of the Infrastructure Resource card (Digital Infrastructure).",
     "edits": "Adds the fields FLD.004, FLD.005, FLD.006, FLD.007, FLD.009, FLD.016, FLD.010, FLD.011, FLD.017, FLD.018, FLD.014, FLD.015 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.004",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.005",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.006",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.007",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.009",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.010",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.011",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.014",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.015",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.CLD.002.008",
     "name": "Cloud & Security",
     "description": "The Cloud & Security kind of the Infrastructure Resource card (Digital Infrastructure).",
     "edits": "Adds the fields FLD.004, FLD.005, FLD.006, FLD.007, FLD.009, FLD.016, FLD.010, FLD.011, FLD.017, FLD.014, FLD.015 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.004",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.005",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.006",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.007",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.009",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.010",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.011",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.014",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.015",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.BSN.002.009",
     "name": "Business Consumables",
     "description": "The Business Consumables kind of the Infrastructure Resource card (Materials & Inventory).",
     "edits": "Adds the fields FLD.004, FLD.005, FLD.006, FLD.007, FLD.009, FLD.016, FLD.010, FLD.011, FLD.017, FLD.018, FLD.014, FLD.015 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.004",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.005",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.006",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.007",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.009",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.010",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.011",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.014",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.015",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.INS.002.010",
     "name": "Insurances",
     "description": "The Insurances kind of the Infrastructure Resource card (Documents & Rights).",
     "edits": "Adds the fields FLD.004, FLD.005, FLD.006, FLD.007, FLD.009, FLD.023, FLD.024, FLD.016, FLD.010, FLD.011, FLD.017, FLD.014, FLD.015 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.004",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.005",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.006",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.007",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.009",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.023",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.024",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.010",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.011",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.014",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.015",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.LCN.002.011",
     "name": "Licences",
     "description": "The Licences kind of the Infrastructure Resource card (Documents & Rights).",
     "edits": "Adds the fields FLD.004, FLD.005, FLD.006, FLD.007, FLD.009, FLD.023, FLD.024, FLD.016, FLD.010, FLD.011, FLD.017, FLD.018, FLD.014, FLD.015 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.004",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.005",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.006",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.007",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.009",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.023",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.024",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.010",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.011",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.014",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.015",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.CRT.002.012",
     "name": "Certificates",
     "description": "The Certificates kind of the Infrastructure Resource card (Documents & Rights).",
     "edits": "Adds the fields FLD.004, FLD.005, FLD.006, FLD.007, FLD.009, FLD.016, FLD.010, FLD.011, FLD.017, FLD.014, FLD.015 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.004",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.005",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.006",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.007",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.009",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.010",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.011",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.014",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.015",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.TCK.002.013",
     "name": "Tickets & Trip Costs",
     "description": "The Tickets & Trip Costs kind of the Infrastructure Resource card (Documents & Rights).",
     "edits": "Adds the fields FLD.004, FLD.005, FLD.006, FLD.007, FLD.009, FLD.016, FLD.010, FLD.011, FLD.017, FLD.018, FLD.025, FLD.026, FLD.027, FLD.028, FLD.029, FLD.030, FLD.031, FLD.032, FLD.033, FLD.014, FLD.015 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.004",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.005",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.006",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.007",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.009",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.010",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.011",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.025",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.026",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.027",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.028",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.029",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.030",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.031",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.032",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.033",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.014",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.015",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.ADM.002.014",
     "name": "Admin Team",
     "description": "The Admin Team kind of the Infrastructure Resource card (Human Resources).",
     "edits": "Adds the fields FLD.004, FLD.005, FLD.006, FLD.007, FLD.009, FLD.016, FLD.010, FLD.011, FLD.017, FLD.034, FLD.035, FLD.036, FLD.014, FLD.015 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.004",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.005",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.006",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.007",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.009",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.010",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.011",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.034",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.035",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.036",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.014",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.015",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.FND.002.015",
     "name": "Founders & Owners",
     "description": "The Founders & Owners kind of the Infrastructure Resource card (Human Resources).",
     "edits": "Adds the fields FLD.037, FLD.038, FLD.017, FLD.039, FLD.040, FLD.034, FLD.035, FLD.036, FLD.041 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.037",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.038",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.039",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.040",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.034",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.035",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.036",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.041",
       "role": "field of this kind"
      }
     ]
    }
   ],
   "requires": [
    {
     "asset": "CRD.001",
     "variant": "CRD.CRD.001.001",
     "role": "the surface it stands on"
    },
    {
     "asset": "FLD.001",
     "role": "common field"
    },
    {
     "asset": "FLD.002",
     "role": "common field"
    },
    {
     "asset": "FLD.003",
     "role": "common field"
    }
   ],
   "catalogue": [
    "K001",
    "K002",
    "K003",
    "K004",
    "K005",
    "K006",
    "K007",
    "K008",
    "K009",
    "K010",
    "K011",
    "K012",
    "K013",
    "K014",
    "K015"
   ]
  },
  {
   "code": "CRD.003",
   "name": "Infrastructure Activity",
   "category": "card",
   "summary": "The Infrastructure Activity card: a floating card with 14 common fields in a fixed order and 2 kinds that add their own.",
   "variables": [
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR005",
    "VAR007",
    "VAR009"
   ],
   "variants": [
    {
     "code": "CRD.PRP.003.001",
     "name": "Pre-Operational",
     "description": "The Pre-Operational kind of the Infrastructure Activity card (no category).",
     "edits": "Adds the fields FLD.042 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.042",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.OPR.003.002",
     "name": "Operational",
     "description": "The Operational kind of the Infrastructure Activity card (no category).",
     "edits": "Has the common fields only.",
     "values": {},
     "requires": []
    }
   ],
   "requires": [
    {
     "asset": "CRD.001",
     "variant": "CRD.CRD.001.001",
     "role": "the surface it stands on"
    },
    {
     "asset": "FLD.001",
     "role": "common field"
    },
    {
     "asset": "FLD.002",
     "role": "common field"
    },
    {
     "asset": "FLD.003",
     "role": "common field"
    },
    {
     "asset": "FLD.004",
     "role": "common field"
    },
    {
     "asset": "FLD.006",
     "role": "common field"
    },
    {
     "asset": "FLD.043",
     "role": "common field"
    },
    {
     "asset": "FLD.044",
     "role": "common field"
    },
    {
     "asset": "FLD.045",
     "role": "common field"
    },
    {
     "asset": "FLD.046",
     "role": "common field"
    },
    {
     "asset": "FLD.047",
     "role": "common field"
    },
    {
     "asset": "FLD.048",
     "role": "common field"
    },
    {
     "asset": "FLD.014",
     "role": "common field"
    },
    {
     "asset": "FLD.015",
     "role": "common field"
    },
    {
     "asset": "DIV.001",
     "role": "divides Completed from the fields above it"
    },
    {
     "asset": "FLD.049",
     "role": "common field"
    }
   ],
   "catalogue": [
    "K016",
    "K017"
   ],
   "lookNotes": [
    "order, by the owner's decision (owner, 2026-10-15): a divider line above Completed, and the Links (Linked to) last, after Completed."
   ]
  },
  {
   "code": "CRD.004",
   "name": "Infrastructure Partner",
   "category": "card",
   "summary": "The Infrastructure Partner card: a floating card with 11 common fields in a fixed order.",
   "variables": [
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR005",
    "VAR007",
    "VAR009"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "CRD.001",
     "variant": "CRD.CRD.001.001",
     "role": "the surface it stands on"
    },
    {
     "asset": "FLD.001",
     "role": "common field"
    },
    {
     "asset": "FLD.002",
     "role": "common field"
    },
    {
     "asset": "FLD.003",
     "role": "common field"
    },
    {
     "asset": "FLD.004",
     "role": "common field"
    },
    {
     "asset": "FLD.006",
     "role": "common field"
    },
    {
     "asset": "FLD.010",
     "role": "common field"
    },
    {
     "asset": "FLD.011",
     "role": "common field"
    },
    {
     "asset": "FLD.017",
     "role": "common field"
    },
    {
     "asset": "FLD.048",
     "role": "common field"
    },
    {
     "asset": "FLD.014",
     "role": "common field"
    },
    {
     "asset": "FLD.015",
     "role": "common field"
    }
   ],
   "catalogue": [
    "K018"
   ]
  },
  {
   "code": "CRD.005",
   "name": "Infrastructure Supplier",
   "category": "card",
   "summary": "The Infrastructure Supplier card: a floating card with 11 common fields in a fixed order and 5 kinds that add their own.",
   "variables": [
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR005",
    "VAR007",
    "VAR009"
   ],
   "variants": [
    {
     "code": "CRD.GDS.005.001",
     "name": "Goods & Equipment",
     "description": "The Goods & Equipment kind of the Infrastructure Supplier card (Goods & Equipment).",
     "edits": "Adds the fields FLD.018 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.BSN.005.002",
     "name": "Business Services",
     "description": "The Business Services kind of the Infrastructure Supplier card (Business Services).",
     "edits": "Adds the fields FLD.025, FLD.026, FLD.027, FLD.028, FLD.029, FLD.030, FLD.031, FLD.032, FLD.033 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.025",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.026",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.027",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.028",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.029",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.030",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.031",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.032",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.033",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.CRT.005.003",
     "name": "Creative & IT Services",
     "description": "The Creative & IT Services kind of the Infrastructure Supplier card (Creative & IT Services).",
     "edits": "Adds the fields FLD.025, FLD.026, FLD.027, FLD.028, FLD.029, FLD.030, FLD.031, FLD.032, FLD.033 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.025",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.026",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.027",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.028",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.029",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.030",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.031",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.032",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.033",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.PRP.005.004",
     "name": "Property, Vehicles & Facilities",
     "description": "The Property, Vehicles & Facilities kind of the Infrastructure Supplier card (Property, Vehicles & Facilities).",
     "edits": "Adds the fields FLD.016, FLD.050, FLD.051, FLD.052, FLD.053 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.050",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.051",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.052",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.053",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.TCH.005.005",
     "name": "Technical Support",
     "description": "The Technical Support kind of the Infrastructure Supplier card (Technical Support).",
     "edits": "Adds the fields FLD.018, FLD.025, FLD.026, FLD.027, FLD.028, FLD.029, FLD.030, FLD.031, FLD.032, FLD.033 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.025",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.026",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.027",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.028",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.029",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.030",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.031",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.032",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.033",
       "role": "field of this kind"
      }
     ]
    }
   ],
   "requires": [
    {
     "asset": "CRD.001",
     "variant": "CRD.CRD.001.001",
     "role": "the surface it stands on"
    },
    {
     "asset": "FLD.001",
     "role": "common field"
    },
    {
     "asset": "FLD.002",
     "role": "common field"
    },
    {
     "asset": "FLD.003",
     "role": "common field"
    },
    {
     "asset": "FLD.004",
     "role": "common field"
    },
    {
     "asset": "FLD.006",
     "role": "common field"
    },
    {
     "asset": "FLD.010",
     "role": "common field"
    },
    {
     "asset": "FLD.011",
     "role": "common field"
    },
    {
     "asset": "FLD.017",
     "role": "common field"
    },
    {
     "asset": "FLD.048",
     "role": "common field"
    },
    {
     "asset": "FLD.014",
     "role": "common field"
    },
    {
     "asset": "FLD.015",
     "role": "common field"
    }
   ],
   "catalogue": [
    "K019",
    "K020",
    "K021",
    "K022",
    "K023"
   ]
  },
  {
   "code": "CRD.006",
   "name": "Offering Resource",
   "category": "card",
   "summary": "The Offering Resource card: a floating card with 17 common fields in a fixed order and 17 kinds that add their own.",
   "variables": [
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR005",
    "VAR007",
    "VAR009"
   ],
   "variants": [
    {
     "code": "CRD.STH.006.001",
     "name": "Site Hire",
     "description": "The Site Hire kind of the Offering Resource card (Workspace).",
     "edits": "Adds the fields FLD.016, FLD.017, FLD.025, FLD.026, FLD.027, FLD.028, FLD.029, FLD.030, FLD.031, FLD.032, FLD.033 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.025",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.026",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.027",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.028",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.029",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.030",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.031",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.032",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.033",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.WRK.006.002",
     "name": "Workshop & Storage",
     "description": "The Workshop & Storage kind of the Offering Resource card (Workspace).",
     "edits": "Adds the fields FLD.008, FLD.012, FLD.013 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.008",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.012",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.013",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.PRC.006.003",
     "name": "Process Utilities",
     "description": "The Process Utilities kind of the Offering Resource card (Utilities).",
     "edits": "Adds the fields FLD.016, FLD.017, FLD.018 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.FXT.006.004",
     "name": "Fixtures & Displays",
     "description": "The Fixtures & Displays kind of the Offering Resource card (Workstation).",
     "edits": "Adds the fields FLD.016, FLD.017, FLD.018, FLD.019 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.019",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.PRD.006.005",
     "name": "Production Machinery",
     "description": "The Production Machinery kind of the Offering Resource card (Equipment).",
     "edits": "Adds the fields FLD.016, FLD.017, FLD.018, FLD.019, FLD.020, FLD.021 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.019",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.020",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.021",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.DVC.006.006",
     "name": "Devices & Tools",
     "description": "The Devices & Tools kind of the Offering Resource card (Equipment).",
     "edits": "Adds the fields FLD.016, FLD.017, FLD.018, FLD.019, FLD.020, FLD.021 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.019",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.020",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.021",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.DLV.006.007",
     "name": "Delivery Vehicles",
     "description": "The Delivery Vehicles kind of the Offering Resource card (Vehicles).",
     "edits": "Adds the fields FLD.008, FLD.016, FLD.017, FLD.018, FLD.019, FLD.022 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.008",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.019",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.022",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.DEL.006.008",
     "name": "Delivery Running Costs",
     "description": "The Delivery Running Costs kind of the Offering Resource card (Vehicles).",
     "edits": "Adds the fields FLD.016, FLD.017, FLD.018 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.SLS.006.009",
     "name": "Sales & Delivery Tools",
     "description": "The Sales & Delivery Tools kind of the Offering Resource card (Digital Infrastructure).",
     "edits": "Adds the fields FLD.016, FLD.017 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.PLT.006.010",
     "name": "Platforms & APIs",
     "description": "The Platforms & APIs kind of the Offering Resource card (Digital Infrastructure).",
     "edits": "Adds the fields FLD.016, FLD.017, FLD.018 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.MTR.006.011",
     "name": "Materials & Stock",
     "description": "The Materials & Stock kind of the Offering Resource card (Materials & Inventory).",
     "edits": "Adds the fields FLD.016, FLD.017, FLD.018 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.INS.006.012",
     "name": "Insurances",
     "description": "The Insurances kind of the Offering Resource card (Documents & Rights).",
     "edits": "Adds the fields FLD.023, FLD.024, FLD.016, FLD.017, FLD.025, FLD.026, FLD.027, FLD.028, FLD.029, FLD.030, FLD.031, FLD.032, FLD.033 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.023",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.024",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.025",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.026",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.027",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.028",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.029",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.030",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.031",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.032",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.033",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.LCN.006.013",
     "name": "Licences",
     "description": "The Licences kind of the Offering Resource card (Documents & Rights).",
     "edits": "Adds the fields FLD.023, FLD.024, FLD.016, FLD.017, FLD.018 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.023",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.024",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.RYL.006.014",
     "name": "Royalties",
     "description": "The Royalties kind of the Offering Resource card (Documents & Rights).",
     "edits": "Adds the fields FLD.023, FLD.024, FLD.016, FLD.017, FLD.055, FLD.056 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.023",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.024",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.055",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.056",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.CRT.006.015",
     "name": "Certificates",
     "description": "The Certificates kind of the Offering Resource card (Documents & Rights).",
     "edits": "Adds the fields FLD.016, FLD.017, FLD.025, FLD.026, FLD.027, FLD.028, FLD.029, FLD.030, FLD.031, FLD.032, FLD.033 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.025",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.026",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.027",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.028",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.029",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.030",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.031",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.032",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.033",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.TCK.006.016",
     "name": "Tickets & Trip Costs",
     "description": "The Tickets & Trip Costs kind of the Offering Resource card (Documents & Rights).",
     "edits": "Adds the fields FLD.016, FLD.017, FLD.018, FLD.025, FLD.026, FLD.027, FLD.028, FLD.029, FLD.030, FLD.031, FLD.032, FLD.033 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.025",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.026",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.027",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.028",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.029",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.030",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.031",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.032",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.033",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.DTD.006.017",
     "name": "Delivery Team",
     "description": "The Delivery Team kind of the Offering Resource card (Human Resources).",
     "edits": "Adds the fields FLD.016, FLD.017, FLD.018, FLD.034, FLD.035, FLD.036 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.034",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.035",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.036",
       "role": "field of this kind"
      }
     ]
    }
   ],
   "requires": [
    {
     "asset": "CRD.001",
     "variant": "CRD.CRD.001.001",
     "role": "the surface it stands on"
    },
    {
     "asset": "FLD.001",
     "role": "common field"
    },
    {
     "asset": "FLD.002",
     "role": "common field"
    },
    {
     "asset": "FLD.003",
     "role": "common field"
    },
    {
     "asset": "FLD.004",
     "role": "common field"
    },
    {
     "asset": "FLD.005",
     "role": "common field"
    },
    {
     "asset": "FLD.006",
     "role": "common field"
    },
    {
     "asset": "FLD.007",
     "role": "common field"
    },
    {
     "asset": "FLD.005",
     "role": "common field"
    },
    {
     "asset": "FLD.006",
     "role": "common field"
    },
    {
     "asset": "FLD.002",
     "role": "common field"
    },
    {
     "asset": "FLD.009",
     "role": "common field"
    },
    {
     "asset": "FLD.007",
     "role": "common field"
    },
    {
     "asset": "FLD.010",
     "role": "common field"
    },
    {
     "asset": "FLD.011",
     "role": "common field"
    },
    {
     "asset": "FLD.014",
     "role": "common field"
    },
    {
     "asset": "FLD.015",
     "role": "common field"
    },
    {
     "asset": "FLD.054",
     "role": "common field"
    }
   ],
   "catalogue": [
    "K024",
    "K025",
    "K026",
    "K027",
    "K028",
    "K029",
    "K030",
    "K031",
    "K032",
    "K033",
    "K034",
    "K035",
    "K036",
    "K037",
    "K038",
    "K039",
    "K040"
   ]
  },
  {
   "code": "CRD.007",
   "name": "Offering Activity",
   "category": "card",
   "summary": "The Offering Activity card: a floating card with 15 common fields in a fixed order and 3 kinds that add their own.",
   "variables": [
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR005",
    "VAR007",
    "VAR009"
   ],
   "variants": [
    {
     "code": "CRD.PRD.007.001",
     "name": "Production",
     "description": "The Production kind of the Offering Activity card (no category).",
     "edits": "Has the common fields only.",
     "values": {},
     "requires": []
    },
    {
     "code": "CRD.MRK.007.002",
     "name": "Marketing",
     "description": "The Marketing kind of the Offering Activity card (no category).",
     "edits": "Has the common fields only.",
     "values": {},
     "requires": []
    },
    {
     "code": "CRD.SLS.007.003",
     "name": "Sales & Customer",
     "description": "The Sales & Customer kind of the Offering Activity card (no category).",
     "edits": "Has the common fields only.",
     "values": {},
     "requires": []
    }
   ],
   "requires": [
    {
     "asset": "CRD.001",
     "variant": "CRD.CRD.001.001",
     "role": "the surface it stands on"
    },
    {
     "asset": "FLD.001",
     "role": "common field"
    },
    {
     "asset": "FLD.002",
     "role": "common field"
    },
    {
     "asset": "FLD.003",
     "role": "common field"
    },
    {
     "asset": "FLD.004",
     "role": "common field"
    },
    {
     "asset": "FLD.006",
     "role": "common field"
    },
    {
     "asset": "FLD.043",
     "role": "common field"
    },
    {
     "asset": "FLD.044",
     "role": "common field"
    },
    {
     "asset": "FLD.045",
     "role": "common field"
    },
    {
     "asset": "FLD.046",
     "role": "common field"
    },
    {
     "asset": "FLD.047",
     "role": "common field"
    },
    {
     "asset": "FLD.048",
     "role": "common field"
    },
    {
     "asset": "FLD.014",
     "role": "common field"
    },
    {
     "asset": "FLD.015",
     "role": "common field"
    },
    {
     "asset": "DIV.001",
     "role": "divides Completed from the fields above it"
    },
    {
     "asset": "FLD.049",
     "role": "common field"
    },
    {
     "asset": "FLD.054",
     "role": "common field"
    }
   ],
   "catalogue": [
    "K041",
    "K042",
    "K043"
   ],
   "lookNotes": [
    "order, by the owner's decision (owner, 2026-10-15): a divider line above Completed, and the Links (Linked to) last, after Completed."
   ]
  },
  {
   "code": "CRD.008",
   "name": "Offering Partner",
   "category": "card",
   "summary": "The Offering Partner card: a floating card with 12 common fields in a fixed order and 2 kinds that add their own.",
   "variables": [
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR005",
    "VAR007",
    "VAR009"
   ],
   "variants": [
    {
     "code": "CRD.RVN.008.001",
     "name": "Revenue Partners",
     "description": "The Revenue Partners kind of the Offering Partner card (Revenue Partners).",
     "edits": "Adds the fields FLD.023, FLD.024, FLD.025, FLD.026, FLD.027, FLD.028, FLD.029, FLD.030, FLD.031, FLD.032, FLD.033, FLD.055 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.023",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.024",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.025",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.026",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.027",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.028",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.029",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.030",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.031",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.032",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.033",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.055",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.ACC.008.002",
     "name": "Accreditation Bodies",
     "description": "The Accreditation Bodies kind of the Offering Partner card (Accreditation Bodies).",
     "edits": "Has the common fields only.",
     "values": {},
     "requires": []
    }
   ],
   "requires": [
    {
     "asset": "CRD.001",
     "variant": "CRD.CRD.001.001",
     "role": "the surface it stands on"
    },
    {
     "asset": "FLD.001",
     "role": "common field"
    },
    {
     "asset": "FLD.002",
     "role": "common field"
    },
    {
     "asset": "FLD.003",
     "role": "common field"
    },
    {
     "asset": "FLD.004",
     "role": "common field"
    },
    {
     "asset": "FLD.006",
     "role": "common field"
    },
    {
     "asset": "FLD.010",
     "role": "common field"
    },
    {
     "asset": "FLD.011",
     "role": "common field"
    },
    {
     "asset": "FLD.017",
     "role": "common field"
    },
    {
     "asset": "FLD.048",
     "role": "common field"
    },
    {
     "asset": "FLD.014",
     "role": "common field"
    },
    {
     "asset": "FLD.015",
     "role": "common field"
    },
    {
     "asset": "FLD.054",
     "role": "common field"
    }
   ],
   "catalogue": [
    "K044",
    "K045"
   ]
  },
  {
   "code": "CRD.009",
   "name": "Offering Supplier",
   "category": "card",
   "summary": "The Offering Supplier card: a floating card with 12 common fields in a fixed order and 7 kinds that add their own.",
   "variables": [
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR005",
    "VAR007",
    "VAR009"
   ],
   "variants": [
    {
     "code": "CRD.PRD.009.001",
     "name": "Producers & Wholesalers",
     "description": "The Producers & Wholesalers kind of the Offering Supplier card (Producers & Wholesalers).",
     "edits": "Adds the fields FLD.018, FLD.057, FLD.058, FLD.059, FLD.060 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.057",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.058",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.059",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.060",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.LGS.009.002",
     "name": "Logistics & Fulfilment",
     "description": "The Logistics & Fulfilment kind of the Offering Supplier card (Logistics & Fulfilment).",
     "edits": "Adds the fields FLD.061, FLD.018 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.061",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.CNT.009.003",
     "name": "Contractors & Advisers",
     "description": "The Contractors & Advisers kind of the Offering Supplier card (Contractors & Advisers).",
     "edits": "Adds the fields FLD.018, FLD.025, FLD.026, FLD.027, FLD.028, FLD.029, FLD.030, FLD.031, FLD.032, FLD.033 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.025",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.026",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.027",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.028",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.029",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.030",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.031",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.032",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.033",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.AGN.009.004",
     "name": "Agencies & Influencers",
     "description": "The Agencies & Influencers kind of the Offering Supplier card (Agencies & Influencers).",
     "edits": "Adds the fields FLD.061, FLD.025, FLD.026, FLD.027, FLD.028, FLD.029, FLD.030, FLD.031, FLD.032, FLD.033 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.061",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.025",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.026",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.027",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.028",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.029",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.030",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.031",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.032",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.033",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.VNS.009.005",
     "name": "Venues & Organisers",
     "description": "The Venues & Organisers kind of the Offering Supplier card (Venues & Organisers).",
     "edits": "Adds the fields FLD.025, FLD.026, FLD.027, FLD.028, FLD.029, FLD.030, FLD.031, FLD.032, FLD.033 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.025",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.026",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.027",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.028",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.029",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.030",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.031",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.032",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.033",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.LND.009.006",
     "name": "Landlords, Leasing & Warehouses",
     "description": "The Landlords, Leasing & Warehouses kind of the Offering Supplier card (Landlords, Leasing & Warehouses).",
     "edits": "Adds the fields FLD.016, FLD.050, FLD.051, FLD.052, FLD.062, FLD.053 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.016",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.050",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.051",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.052",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.062",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.053",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.PLT.009.007",
     "name": "Platforms & Payments",
     "description": "The Platforms & Payments kind of the Offering Supplier card (Platforms & Payments).",
     "edits": "Adds the fields FLD.023, FLD.024, FLD.018 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.023",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.024",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.018",
       "role": "field of this kind"
      }
     ]
    }
   ],
   "requires": [
    {
     "asset": "CRD.001",
     "variant": "CRD.CRD.001.001",
     "role": "the surface it stands on"
    },
    {
     "asset": "FLD.001",
     "role": "common field"
    },
    {
     "asset": "FLD.002",
     "role": "common field"
    },
    {
     "asset": "FLD.003",
     "role": "common field"
    },
    {
     "asset": "FLD.004",
     "role": "common field"
    },
    {
     "asset": "FLD.006",
     "role": "common field"
    },
    {
     "asset": "FLD.010",
     "role": "common field"
    },
    {
     "asset": "FLD.011",
     "role": "common field"
    },
    {
     "asset": "FLD.017",
     "role": "common field"
    },
    {
     "asset": "FLD.048",
     "role": "common field"
    },
    {
     "asset": "FLD.014",
     "role": "common field"
    },
    {
     "asset": "FLD.015",
     "role": "common field"
    },
    {
     "asset": "FLD.054",
     "role": "common field"
    }
   ],
   "catalogue": [
    "K046",
    "K047",
    "K048",
    "K049",
    "K050",
    "K051",
    "K052"
   ]
  },
  {
   "code": "CRD.010",
   "name": "Legal Entity",
   "category": "card",
   "summary": "The Legal Entity card: a floating card with 1 common fields in a fixed order and 3 kinds that add their own.",
   "variables": [
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR005",
    "VAR007",
    "VAR009"
   ],
   "variants": [
    {
     "code": "CRD.LGL.010.001",
     "name": "Legal Entity expense card",
     "description": "The Legal Entity expense card kind of the Legal Entity card (no category).",
     "edits": "Adds the fields FLD.001, FLD.002, FLD.063, FLD.047, FLD.017, FLD.064, FLD.065, FLD.015 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.001",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.002",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.063",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.047",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.064",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.065",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.015",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.ADD.010.002",
     "name": "Add Expense to Expenses",
     "description": "The Add Expense to Expenses kind of the Legal Entity card (no category).",
     "edits": "Adds the fields FLD.066, FLD.063, FLD.067, FLD.017, FLD.065 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.066",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.063",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.067",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.017",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.065",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.ALR.010.003",
     "name": "Add Legal requirement to Additional legal requirements",
     "description": "The Add Legal requirement to Additional legal requirements kind of the Legal Entity card (no category).",
     "edits": "Adds the fields FLD.104, FLD.105, FLD.042 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.104",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.105",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.042",
       "role": "field of this kind"
      }
     ]
    }
   ],
   "requires": [
    {
     "asset": "CRD.001",
     "variant": "CRD.CRD.001.001",
     "role": "the surface it stands on"
    },
    {
     "asset": "FLD.014",
     "role": "common field"
    }
   ],
   "catalogue": [
    "K053",
    "K054",
    "K069"
   ]
  },
  {
   "code": "CRD.011",
   "name": "Brand",
   "category": "card",
   "summary": "The Brand card: a floating card with 0 common fields in a fixed order and 3 kinds that add their own.",
   "variables": [
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR005",
    "VAR007",
    "VAR009"
   ],
   "variants": [
    {
     "code": "CRD.ADD.011.001",
     "name": "Add Colour to Colours",
     "description": "The Add Colour to Colours kind of the Brand card (no category).",
     "edits": "Adds the fields FLD.068, FLD.069, FLD.070, FLD.071 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.068",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.069",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.070",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.071",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.ATT.011.002",
     "name": "Add Typeface to Typography & Text Hierarchy",
     "description": "The Add Typeface to Typography & Text Hierarchy kind of the Brand card (no category).",
     "edits": "Adds the fields FLD.072, FLD.069, FLD.071 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.072",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.069",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.071",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.AIT.011.003",
     "name": "Add Image to Brand Images",
     "description": "The Add Image to Brand Images kind of the Brand card (no category).",
     "edits": "Adds the fields FLD.073, FLD.074 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.073",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.074",
       "role": "field of this kind"
      }
     ]
    }
   ],
   "requires": [
    {
     "asset": "CRD.001",
     "variant": "CRD.CRD.001.001",
     "role": "the surface it stands on"
    }
   ],
   "catalogue": [
    "K055",
    "K056",
    "K057"
   ]
  },
  {
   "code": "CRD.012",
   "name": "Foundation",
   "category": "card",
   "summary": "The Foundation card: a floating card with 0 common fields in a fixed order and 3 kinds that add their own.",
   "variables": [
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR005",
    "VAR007",
    "VAR009"
   ],
   "variants": [
    {
     "code": "CRD.ADD.012.001",
     "name": "Add Profile to Segment Description",
     "description": "The Add Profile to Segment Description kind of the Foundation card (no category).",
     "edits": "Adds the fields FLD.075, FLD.076, FLD.077, FLD.078, FLD.079, FLD.080, FLD.081, FLD.082, FLD.083, FLD.084, FLD.085 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.075",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.076",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.077",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.078",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.079",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.080",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.081",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.082",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.083",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.084",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.085",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.ACT.012.002",
     "name": "Add Competitor to Competitors",
     "description": "The Add Competitor to Competitors kind of the Foundation card (no category).",
     "edits": "Adds the fields FLD.042, FLD.086, FLD.087, FLD.088, FLD.089, FLD.090, FLD.091, FLD.092, FLD.093 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.042",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.086",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.087",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.088",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.089",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.090",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.091",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.092",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.093",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.AOT.012.003",
     "name": "Add Offering to Offerings",
     "description": "The Add Offering to Offerings kind of the Foundation card (no category).",
     "edits": "Adds the fields FLD.042, FLD.094, FLD.095, FLD.096, FLD.097, FLD.098, FLD.099, FLD.100 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.042",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.094",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.095",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.096",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.097",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.098",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.099",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.100",
       "role": "field of this kind"
      }
     ]
    }
   ],
   "requires": [
    {
     "asset": "CRD.001",
     "variant": "CRD.CRD.001.001",
     "role": "the surface it stands on"
    }
   ],
   "catalogue": [
    "K058",
    "K059",
    "K060"
   ]
  },
  {
   "code": "CRD.013",
   "name": "Channel",
   "category": "card",
   "summary": "The Channel card: a floating card with 7 common fields in a fixed order and 8 kinds that add their own.",
   "variables": [
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR005",
    "VAR007",
    "VAR009"
   ],
   "variants": [
    {
     "code": "CRD.ADD.013.001",
     "name": "Add Subchannel to Social Media",
     "description": "The Add Subchannel to Social Media kind of the Channel card (no category).",
     "edits": "Has the common fields only.",
     "values": {},
     "requires": []
    },
    {
     "code": "CRD.AST.013.002",
     "name": "Add Subchannel to Website",
     "description": "The Add Subchannel to Website kind of the Channel card (no category).",
     "edits": "Has the common fields only.",
     "values": {},
     "requires": []
    },
    {
     "code": "CRD.AAA.013.003",
     "name": "Add Subchannel to Email",
     "description": "The Add Subchannel to Email kind of the Channel card (no category).",
     "edits": "Has the common fields only.",
     "values": {},
     "requires": []
    },
    {
     "code": "CRD.AAB.013.004",
     "name": "Add Subchannel to Other",
     "description": "The Add Subchannel to Other kind of the Channel card (no category).",
     "edits": "Has the common fields only.",
     "values": {},
     "requires": []
    },
    {
     "code": "CRD.AAC.013.005",
     "name": "Add Subchannel to In Person",
     "description": "The Add Subchannel to In Person kind of the Channel card (no category).",
     "edits": "Has the common fields only.",
     "values": {},
     "requires": []
    },
    {
     "code": "CRD.AAD.013.006",
     "name": "Add Subchannel to Direct Payment",
     "description": "The Add Subchannel to Direct Payment kind of the Channel card (no category).",
     "edits": "Has the common fields only.",
     "values": {},
     "requires": []
    },
    {
     "code": "CRD.AAE.013.007",
     "name": "Add Subchannel to Online / Live",
     "description": "The Add Subchannel to Online / Live kind of the Channel card (no category).",
     "edits": "Has the common fields only.",
     "values": {},
     "requires": []
    },
    {
     "code": "CRD.AAF.013.008",
     "name": "Add Subchannel to File Delivery",
     "description": "The Add Subchannel to File Delivery kind of the Channel card (no category).",
     "edits": "Has the common fields only.",
     "values": {},
     "requires": []
    }
   ],
   "requires": [
    {
     "asset": "CRD.001",
     "variant": "CRD.CRD.001.001",
     "role": "the surface it stands on"
    },
    {
     "asset": "FLD.101",
     "role": "common field"
    },
    {
     "asset": "FLD.102",
     "role": "common field"
    },
    {
     "asset": "FLD.086",
     "role": "common field"
    },
    {
     "asset": "FLD.086",
     "role": "common field"
    },
    {
     "asset": "FLD.086",
     "role": "common field"
    },
    {
     "asset": "FLD.086",
     "role": "common field"
    },
    {
     "asset": "FLD.103",
     "role": "common field"
    }
   ],
   "catalogue": [
    "K061",
    "K062",
    "K063",
    "K064",
    "K065",
    "K066",
    "K067",
    "K068"
   ]
  },
  {
   "code": "FLD.106",
   "name": "page tag",
   "category": "field",
   "summary": "The page tag: the bullets that move between the pages, the sections of a page, the views or cards of a dialog or a floating card, or the Objectives of a nested card, with their names, the arrow and the Back button. It shows bullets only or the names too (the variable rail display); its height follows the number of items and the elements it holds, and its width the length of the names.",
   "variables": [
    "VAR001",
    "VAR003",
    "VAR004",
    "VAR011"
   ],
   "catalogue": [],
   "variants": [
    {
     "code": "FLD.PAG.106.001",
     "name": "Pages rail",
     "description": "The rail at the left of the page: one bullet per page of the system. Bullets only: 37px wide (94px high for two pages, 128px for three, 230px for six); with names: 209 to 229px wide, 133px high for two pages.",
     "edits": "At the left of the page, with the page arrows.",
     "values": {}
    },
    {
     "code": "FLD.SEC.106.002",
     "name": "Sections rail",
     "description": "The rail at the right of the page: one bullet per section of the page (Customer Channel, Customer Relationship). Bullets only: 37px wide (94px high for two sections, 162px for four); with names: 190px wide, 133px high for two. A page with no sections has only the Next arrow there, 25 by 44px.",
     "edits": "At the right of the page.",
     "values": {}
    },
    {
     "code": "FLD.CAR.106.003",
     "name": "Card rail",
     "description": "The rail beside a dialog or a floating card: one bullet per view or card in it. Bullets only: a 37px tab (76px high for two items, 110 for three, 144 for four, 178 for five, 351 for eight); with names: 145 to 217px wide (131px high for two items, 174 for three, 217 for four, 502 for nine, 668 for thirteen).",
     "edits": "Beside a dialog or a floating card.",
     "values": {}
    },
    {
     "code": "FLD.NST.106.004",
     "name": "Nested card rail",
     "description": "The rail of a nested card (Goal, Objective, Metric): 88 by 88px, two arrows and the bullets, without a tab.",
     "edits": "Inside a nested card; two arrows and the bullets.",
     "values": {}
    }
   ],
   "requires": [
    {
     "asset": "BUL.001",
     "role": "one bullet per item; the bullet colour follows the card's colour and the reaction"
    },
    {
     "asset": "ARW.001",
     "variant": "ARW.PAG.001.001",
     "role": "the arrow placed in the tag"
    },
    {
     "asset": "BTN.003",
     "role": "the Back button, where the tag has one"
    },
    {
     "asset": "LBL.001",
     "role": "the names of the items; the title of the tag"
    }
   ],
   "lookNotes": [
    "moved from the components (owner, 2026-10-15): the rail is not a component. The bullet (BUL.001) is the component; the page tag is a field made of bullets, names, the arrow and the Back button."
   ]
  }
 ]
};
