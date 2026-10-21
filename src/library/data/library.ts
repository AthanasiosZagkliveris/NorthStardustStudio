// The assets library, seeded once by tools/scripts/library/seed-library.mjs from the catalogue (docs/design/07-structure-tables.md).
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
   "description": "How a holder takes more room as the person writes.",
   "values": [
    {
     "name": "fixed space",
     "description": "The cell keeps the space it has."
    },
    {
     "name": "grows down",
     "description": "The cell gets bigger downwards as you type or press Enter."
    },
    {
     "name": "grows under conditions",
     "description": "The cell appears or grows only when a condition is met (a tick opens it, a status shows it)."
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
  },
  {
   "code": "VAR016",
   "name": "options source",
   "description": "Where the options of a dropdown come from.",
   "values": [
    {
     "name": "prefilled",
     "description": "The list is fixed in the app (Status, Frequency, Currency, Unit, Plan, Cost option, Category)."
    },
    {
     "name": "dependent",
     "description": "The list is prefilled but depends on another choice (the Group depends on the Category)."
    },
    {
     "name": "generated",
     "description": "The options come from other inputs (the founders, the activities, the resources, the registrations of the page)."
    }
   ]
  },
  {
   "code": "VAR017",
   "name": "input",
   "description": "What the person can type in a holder.",
   "values": [
    {
     "name": "text",
     "description": "Letters, numbers and signs."
    },
    {
     "name": "numbers only",
     "description": "Only digits can be typed (a decimal also takes the point)."
    }
   ]
  },
  {
   "code": "VAR018",
   "name": "pressed",
   "description": "Whether the text can be pressed.",
   "values": [
    {
     "name": "read only",
     "description": "The text is only read."
    },
    {
     "name": "link",
     "description": "The text opens something: it is underlined or bolder under the pointer and the focus."
    }
   ]
  }
 ],
 "families": [
  {
   "code": "HOLD",
   "name": "Holders",
   "description": "What a person fills in: types, chooses, ticks or picks. Every holder is a cell or a box the person acts in.",
   "characteristics": [
    "Filled in by the person",
    "Text and numbers use the body text, 18px",
    "A cell is 44px high, with 6px corners and a 1px edge",
    "Under the pointer the edge glows; on focus a blue ring; in use the glow and a wire in the contrast colour",
    "A hint (background text) stands behind an empty cell"
   ],
   "groups": [
    {
     "code": "HOLD.CEL",
     "name": "Cell holders",
     "description": "The cells the person writes or chooses in: the holder (text and numbers), the list and the dropdown.",
     "characteristics": [
      "Body text, 18px",
      "6px corners, 1px edge",
      "44px high (a text that grows is at least 44px)"
     ],
     "shared": {
      "fontSize": 18,
      "corners": "6px",
      "border": 1
     }
    },
    {
     "code": "HOLD.DAT",
     "name": "Date cells",
     "description": "The date cell, with its calendar inside it.",
     "characteristics": [
      "A date, chosen in a calendar or written",
      "The calendar opens under the cell"
     ]
    },
    {
     "code": "HOLD.TIK",
     "name": "Tick holders",
     "description": "The boxes the person ticks.",
     "characteristics": [
      "A square box, 24px",
      "Its words stand beside it on one line"
     ]
    },
    {
     "code": "HOLD.PIC",
     "name": "Picker and image holders",
     "description": "The colour swatch and the picture.",
     "characteristics": [
      "Opens the browser's own picker, or shows a picture"
     ]
    }
   ]
  },
  {
   "code": "READ",
   "name": "Readers",
   "description": "The texts that are only read, not filled in: one text component whose variants are presentations; the purpose is given in the field.",
   "characteristics": [
    "Read, not filled in",
    "No cell edge: no border and no fill",
    "Prefilled, or generated by another input",
    "Its style varies with its function, size and style"
   ],
   "shared": {
    "border": 0
   },
   "groups": [
    {
     "code": "READ.TXT",
     "name": "Texts",
     "description": "The text component: size, weight, capitals, italics and underline. A label, a title, a link, a help text and a message are texts used for a purpose, and are told apart by the field or card, not by the component.",
     "characteristics": [
      "Read, not filled in",
      "The body text is 18px; the scale is 14, 18, 24, 28 and 36"
     ]
    }
   ]
  },
  {
   "code": "CTRL",
   "name": "Controls",
   "description": "What a person presses.",
   "characteristics": [
    "Pressed",
    "Hover and focus react: the box fills with its colour, the arrow grows, or the text turns blue",
    "At least 24px, as the WCAG minimum target"
   ],
   "groups": [
    {
     "code": "CTRL.ACT",
     "name": "Action buttons",
     "description": "The buttons that act on a card, a row or a list: the box button (delete, add, shrink), the info button, the wide add button and the Add Card tile.",
     "characteristics": [
      "Pressed to do something to the content",
      "Fills with its colour under the pointer and the focus"
     ]
    },
    {
     "code": "CTRL.TOOL",
     "name": "Tool buttons",
     "description": "The buttons of the app header: an icon with a word.",
     "characteristics": [
      "An icon and a word, in the header",
      "Tinted under the pointer and the focus"
     ]
    },
    {
     "code": "CTRL.NAV",
     "name": "Navigation controls",
     "description": "What moves a person between pages, sections, views and cards: the Back, the arrows and the bullets of the page tags.",
     "characteristics": [
      "Shows where the person is and moves them on",
      "The arrow grows under the pointer; the bullet changes colour or opacity, and the selected bullet is larger"
     ]
    },
    {
     "code": "CTRL.FLD",
     "name": "Fold controls",
     "description": "The triangles that fold and unfold a card, a list or a label.",
     "characteristics": [
      "A triangle; outline at rest, filled under the pointer"
     ]
    }
   ]
  },
  {
   "code": "MARK",
   "name": "Marks",
   "description": "What is shown and is neither read as text nor pressed.",
   "characteristics": [
    "Shown, not filled in",
    "Takes the colour of the card or the reading mode"
   ],
   "groups": [
    {
     "code": "MARK.ICN",
     "name": "Icons",
     "description": "The icons of the systems.",
     "characteristics": [
      "A picture, 36px"
     ]
    },
    {
     "code": "MARK.DIV",
     "name": "Dividers",
     "description": "The lines that divide.",
     "characteristics": [
      "Horizontal or vertical",
      "12px of space either side in a card"
     ]
    }
   ]
  },
  {
   "code": "FRAME",
   "name": "Frames",
   "description": "A rounded, coloured surface, wired or not, that carries information and tools.",
   "characteristics": [
    "Rounded corners, 8px",
    "Coloured by the card, the tile or the reading mode"
   ],
   "shared": {
    "corners": "8px"
   },
   "groups": [
    {
     "code": "FRAME.SUR",
     "name": "Surfaces",
     "description": "The frame and its variants: chapter, tile (master, nested), card (floating, nested), tag.",
     "characteristics": [
      "Carries information and tools"
     ]
    }
   ]
  }
 ],
 "assets": [
  {
   "code": "BTN.001",
   "name": "box button",
   "category": "component",
   "summary": "The box button: a square of 32px with a symbol in it, outlined with no fill at rest, which fills with its colour under the pointer. By default it is the x that removes a card or a field; its variants are the plus that adds and the shrink that shows the nested cards as tiles.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004"
   ],
   "variants": [
    {
     "code": "BTN.ADD.001.001",
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
     },
     "kind": "Button that adds",
     "belongs": "Master tile heads, nested card heads, rows of lists"
    },
    {
     "code": "BTN.SHR.001.002",
     "name": "Shrink",
     "description": "Shows the nested cards of a card as tiles (\"Show the Objectives as tiles\"): the same box with an icon of arrows pointing in.",
     "edits": "The symbol is the shrink icon.",
     "values": {},
     "look": {
      "height": 32,
      "width": 32,
      "fontSize": 0,
      "fontWeight": "400",
      "corners": "6px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 2,
      "scale": "symbol, no text",
      "found": 3
     },
     "kind": "Button that changes a view (cards to tiles)",
     "belongs": "Nested card heads (Goals, Objectives, Metrics)"
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
    "plus corners: the corners of the x, 6px, by the owner's decision (owner, 2026-10-15); the plus measured 8px (107 found).",
    "shrink button (make it tiles): measured 32 by 32px, 8px corners, 2px border, with an icon; by the one rule of the box button (the owner's decision on the x and the plus, owner, 2026-10-15) its corners are 6px.",
    "plus boxes measured 2026-10-16: 32px in cards and rows (107 found) and 36px on the tiles (55, and one of 39px), 8px corners and a 2px line today; the owner's decision is one size, 32px with 6px corners.",
    "walk of the running app 2026-10-16: the plus box on a tile is 36px (about 2,000 found; 39.6px in a few); the plus of a nested head (strategy-box-add) and of a card row (plus-box-small) 32px (the owner's decision: one size, 32px); the x of a nested head 32px (strategy-box-remove) and the x of a list 32px (numbered-list-remove)."
   ],
   "group": "CTRL.ACT",
   "kind": "Button that removes",
   "belongs": "The x of cards and fields; the plus of rows and tiles (Add {card} to {tile}, Add {status} to {card}, Add row, Add item, Add entry, Add another {column}); the shrink of nested cards"
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
    "enlarged, by the owner's decision (owner, 2026-10-15): from 22px to 24px, the WCAG 2.5.8 minimum, so that it no longer needs the spacing exception (567 found at 22px).",
    "walk of the running app 2026-10-16: the info button (info-note-button) is 22 by 22px today (816 found); the owner's decision is 24px."
   ],
   "group": "CTRL.ACT",
   "kind": "Button, round: shows a note",
   "belongs": "Beside the labels and titles of cards, tiles and dialogs"
  },
  {
   "code": "BTN.003",
   "name": "back button",
   "category": "component",
   "summary": "The button that goes back: a word with an arrow or a triangle. By default it is the main Back of the footer of every page (an arrow, BACK in capitals, 18px, weight 500, 83 by 22px); its variant is the section Back of a dialog or a description.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004"
   ],
   "variants": [
    {
     "code": "BTN.SEC.003.001",
     "name": "Section back",
     "description": "The Back of a dialog or a description: a small triangle and the word Back, 18px, weight 400, 25 by 76px. Goes back one view inside the dialog.",
     "edits": "A triangle, the word in the body weight.",
     "values": {},
     "look": {
      "height": 25,
      "width": 76,
      "fontSize": 18,
      "fontWeight": "400",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "body 18",
      "found": 6
     },
     "belongs": "Dialogs and descriptions"
    }
   ],
   "requires": [],
   "catalogue": [
    "CO13"
   ],
   "contracts": [
    "Back button"
   ],
   "group": "CTRL.NAV",
   "lookNotes": [
    "two backs (the owner, owner, 2026-10-15): the main Back of the footer, measured 83 by 22px, 18px, weight 500, capitals, tracking 0.1em; the Back of a dialog or a description, 25 by 76px, 18px, weight 400.",
    "walk of the running app 2026-10-16: the Back of the carousel (carousel-rail-back) is 75.69 by 25px, the Back of a tile view (section-tile-back) 66.56 by 33px, both 18px, weight 400; the main Back 83 by 22px."
   ],
   "kind": "Button, a word: goes back",
   "look": {
    "height": 22,
    "width": 83,
    "fontSize": 18,
    "fontWeight": "500",
    "corners": "0px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 0,
    "scale": "body 18",
    "found": 8
   },
   "belongs": "The footer of every page"
  },
  {
   "code": "BTN.004",
   "name": "wide add button",
   "category": "component",
   "summary": "A text button that adds a row, a card or an entry (+ ADD CHANNEL, + ADD OFFERING, + ADD REGISTRATION NUMBER, + ADD JOURNEY STAGE): 44px high, the words in capitals (18px, weight 500, spaced 0.1em), centred in the button; a 1px solid line in the colour family of the place, 6px corners, a ground of that family. It hugs its words and stands at the left of its column (196 to 310px wide today). Under the pointer the ground takes its hover tone and a 4px glow (18%) appears; on the focus only the glow (28%), no outline; disabled it is faint, with the card's line and the not-allowed cursor. Its variants: the add button across a whole column, and the small text buttons of the notes panel.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004"
   ],
   "variants": [
    {
     "code": "BTN.ROW.004.001",
     "name": "Full-row add",
     "description": "The add button across a whole column (width 100%), the words centred: 668px in the list of the Legal Entity card, 1304px across a chapter (card-list-add and legal-entity-list-add).",
     "edits": "Fills its column; the words are centred.",
     "values": {},
     "look": {
      "height": 44,
      "fontSize": 18,
      "fontWeight": "500",
      "corners": "6px",
      "paddingLeft": 14,
      "paddingTop": 8,
      "border": 1,
      "scale": "body 18",
      "found": 7
     },
     "kind": "Button, wide with words: adds",
     "belongs": "Words: + Add legal requirement, + Add registration number, + Add tax registration (the Legal Entity card's lists)"
    },
    {
     "code": "BTN.SML.004.002",
     "name": "Small add",
     "description": "The small text buttons of a note in the notes panel: Add Date and Link a field, side by side, 14px, padding 4px by 10px (notepad-add).",
     "edits": "14px text, smaller padding.",
     "values": {},
     "look": {
      "height": 32,
      "fontSize": 14,
      "fontWeight": "500",
      "corners": "6px",
      "paddingLeft": 10,
      "paddingTop": 4,
      "border": 1,
      "scale": "small 14",
      "found": 2
     },
     "kind": "Button, small with words: adds a date or links a field",
     "belongs": "The notes panel: + Add note, Add Date, Link a field"
    }
   ],
   "requires": [
    {
     "asset": "BTN.001",
     "variant": "BTN.ADD.001.001",
     "role": "the plus: 32px, at the left of the button, like the plus box"
    }
   ],
   "catalogue": [],
   "look": {
    "height": 44,
    "fontSize": 18,
    "fontWeight": "500",
    "corners": "6px",
    "paddingLeft": 14,
    "paddingTop": 8,
    "border": 1,
    "scale": "body 18",
    "found": 12
   },
   "lookNotes": [
    "found 15 times: Customer Engagement 7, Financial Foundation 3, Foundation 1, Identity (Founders and Registrations) 4; 39px high, type 18, padding 14/8, border 1. They are not a plus box; the one look measured.",
    "height and plus: by the owner's decision (owner, 2026-10-15) the button looks like a cell, so it is 44px high like every cell (it measured 39px); the plus inside it has the size and the place of the plus box, 32px, at the left, like the plus box.",
    "measured 2026-10-16: + Add Channel is 196.95 by 39px in the app today (the 44px height is the owner's decision, with the plus box at the left); text capitals, 18px, weight 500; centred label; the button is left aligned in its column (align-self start); the full-row versions are stretched to 100% with centred words (global.css .card-list-add, .legal-entity-list-add); the notes panel version is 14px with padding 4/10; line 1px solid, radius 6px.",
    "measured 2026-10-16: 39px high today (the 44px is the owner's decision); widths 196.95, 199.94, 287.53, 310.02 (hugging), 668 (the Legal Entity list) and 1304 (a chapter); the notes panel's Add Date and Link a field are 14px with padding 4/10; also found: the option + Add at the end of a dropdown list (an option, not a button) and the plus boxes of the rows.",
    "walk of the running app 2026-10-16: the text add buttons found are + Add Channel (196.95px, 29 pages and cards), + Add Segment (199.94px, Business: Foundation), + Add Funding Source (287.53px, Financial Foundation), and + Add founder, + Add registration number, + Add tax registration (668px, across the column, Identity: Organization); all 39px high, 18px, weight 500, capitals. Words found only in the source, not reached by the walk: + Add Offering, + Add Relationship Type, + Add resource, + Add Colour, + Add Typeface, + Add expense(s)."
   ],
   "group": "CTRL.ACT",
   "kind": "Button, wide with words: adds",
   "belongs": "Words: + Add founder, + Add expense, + Add Colour, + Add Typeface, + Add Offering, + Add Journey Stage, + Add Relationship Type, + Add resource, + Add channel, + Add expenses (opens a menu), and + Add with the kind of nested card in Strategy (Goal, Objective, Metric, Initiative)"
  },
  {
   "code": "BTN.005",
   "name": "add card tile",
   "category": "component",
   "group": "CTRL.ACT",
   "summary": "The button that ends every grid of tiles in an opened tile view: a square tile with a dashed 1px line (the theme's line colour), 8px corners, a plus (24px, weight 400) above the words ADD CARD (14px, weight 700, capitals, the bold tracking), centred both ways. Under the pointer and the focus the dashed line goes, the ground becomes 16% of the tile's colour and the plus and the words take the dark tint of the card's colour; nothing scales. Disabled it is 60% opaque with the not-allowed cursor. One component for every kind of card.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004"
   ],
   "catalogue": [],
   "variants": [
    {
     "code": "BTN.PLS.005.001",
     "name": "Plus tile",
     "description": "The add tile of the profile cards (Identity and Brand): 180px wide, at least 120px high, a dashed 1px line, 10px corners, only a plus in the size of a column title (28px, weight 400); hover: the ground and the line take the colour family's hover tone and the plus its ink.",
     "edits": "Only a plus, wider and with 10px corners.",
     "values": {},
     "look": {
      "height": 120,
      "width": 180,
      "fontSize": 28,
      "fontWeight": "400",
      "corners": "10px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 1,
      "scale": "h2 28",
      "found": 1
     },
     "kind": "Button, a tile: adds a card",
     "belongs": "Identity and Brand pages that list profile cards"
    }
   ],
   "requires": [],
   "look": {
    "height": 107.5,
    "width": 107.5,
    "fontSize": 14,
    "fontWeight": "700",
    "corners": "8px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 1,
    "scale": "small 14",
    "found": 2
   },
   "lookNotes": [
    "measured 107.5 by 107.5px, a dashed 1px edge, 8px corners, 14px bold words under the plus (the Add Card tile moved from the tiles to the buttons, owner, 2026-10-15).",
    "line measured 2026-10-16 (card-tile.css): 1px dashed, in the theme's line colour; the plus is 24px (h3); the words 14px, weight 600, capitals; hover and focus: the line turns transparent, ground 16% of the tile colour, nothing scales.",
    "second version found 2026-10-16: the add tile of the profile cards (profile-card-add-tile): 180px wide, 120px high at least, 1px dashed, 10px corners, a single plus of 28px."
   ],
   "kind": "Button, a tile: adds a card",
   "belongs": "The end of the grid in an opened tile view (+ Add Card); the profile pages (the plus tile)"
  },
  {
   "code": "BTN.006",
   "name": "tool button",
   "category": "component",
   "group": "CTRL.TOOL",
   "summary": "A button of the app header: an icon with a word. Hover and focus tint it. Its variants are the tools: the reading mode, Focus, Search, Notes, Review (with the number of items), Settings, and Refresh (it reloads the app). The Start Interview button of an introduction is the primary variant.",
   "variables": [
    "VAR001",
    "VAR003",
    "VAR004"
   ],
   "catalogue": [],
   "variants": [
    {
     "code": "BTN.RDM.006.001",
     "name": "Reading mode",
     "description": "Opens the list of reading modes (Light, Sepia, Dark, Auto).",
     "edits": "Opens a list.",
     "values": {}
    },
    {
     "code": "BTN.FCS.006.002",
     "name": "Focus",
     "description": "Enters the focus mode.",
     "edits": "Shows the word Focus.",
     "values": {}
    },
    {
     "code": "BTN.SRC.006.003",
     "name": "Search",
     "description": "Opens the search.",
     "edits": "Shows the word Search.",
     "values": {}
    },
    {
     "code": "BTN.NTS.006.004",
     "name": "Notes",
     "description": "Opens the notes panel.",
     "edits": "Shows the word Notes and the number of notes.",
     "values": {}
    },
    {
     "code": "BTN.RVW.006.005",
     "name": "Review",
     "description": "Opens the Review page.",
     "edits": "Shows the word Review and the number of items to look at, in blue.",
     "values": {}
    },
    {
     "code": "BTN.SET.006.006",
     "name": "Settings",
     "description": "Opens the Global Settings page.",
     "edits": "Shows the word Settings.",
     "values": {}
    },
    {
     "code": "BTN.RFR.006.007",
     "name": "Refresh",
     "description": "Reloads the app and refreshes the examples (the control of the landing page).",
     "edits": "Shows the word Reload.",
     "values": {}
    },
    {
     "code": "BTN.STR.006.008",
     "name": "Start Interview",
     "description": "The primary button of an introduction: the words Start Interview and an arrow, white on the primary colour, 268 by 52px.",
     "edits": "Primary fill; larger than a tool button.",
     "values": {},
     "look": {
      "height": 52,
      "width": 269,
      "fontSize": 18,
      "fontWeight": "500",
      "corners": "6px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "body 18",
      "found": 4
     }
    }
   ],
   "requires": [],
   "look": {
    "height": 36,
    "fontSize": 14,
    "fontWeight": "400",
    "corners": "6px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 1,
    "scale": "small 14",
    "found": 62
   },
   "lookNotes": [
    "measured: 36px high, 100 to 135px wide (it follows its words), 14px type, 6px corners, 1px border (header tools; Reload 109 by 36px).",
    "found 62 header tool words on 11 pages, measured 2026-10-16."
   ],
   "kind": "Button, an icon with a word: a tool of the app",
   "belongs": "The app header"
  },
  {
   "code": "BTN.007",
   "name": "link button",
   "category": "component",
   "group": "CTRL.ACT",
   "summary": "A 24px symbol that stands beside a chosen dropdown option and opens the card that the option links to. It was the link symbol; it is a button (the owner, owner, 2026-10-16). Its look is not measured yet.",
   "variables": [
    "VAR001",
    "VAR003",
    "VAR004"
   ],
   "catalogue": [],
   "variants": [],
   "requires": [],
   "look": {
    "height": 24,
    "width": 24,
    "corners": "0px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 0,
    "fontSize": 0,
    "fontWeight": "400",
    "scale": "symbol, no text",
    "found": 72
   },
   "kind": "Button, a symbol: opens the linked card",
   "belongs": "Beside a dropdown choice in a card, between the dropdown and the plus box",
   "lookNotes": [
    "24px, by the owner's decision (owner, 2026-10-16); found 72 times in the card tables (the link symbol rows); it stands between the dropdown and the plus box.",
    "the symbol today is the emoji 🔗, which looks different on every platform; no proper icon exists in the app yet. To do: a 24px chain-link drawn in the text colour (an SVG), in place of the emoji; the calendar symbol 📅 of the date cell is an emoji in the same way.",
    "decided 2026-10-17 (owner): the symbol is a drawn chain (an SVG, 24px), not an emoji, in the tone of the card it stands in (the + box's tone); under the pointer or the keyboard it is 20% larger about its centre, and the box it stands in does not change, so nothing moves."
   ]
  },
  {
   "code": "BTN.008",
   "name": "text toggle",
   "category": "component",
   "group": "CTRL.ACT",
   "summary": "A small text button that folds or unfolds every card of a place at once: Expand all and Collapse all, 14px, weight 400, 95 by 20px, no frame. The words change with its state. (The help toggle, Hide Help, is a toggle too: 18px, weight 500.)",
   "variables": [
    "VAR001",
    "VAR003",
    "VAR004"
   ],
   "catalogue": [],
   "variants": [],
   "requires": [],
   "look": {
    "height": 20,
    "width": 95,
    "corners": "4px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 0,
    "fontSize": 14,
    "fontWeight": "400",
    "scale": "small 14",
    "found": 59
   },
   "kind": "Button, small text: toggles all the folds",
   "belongs": "Business: the pages with folding cards (Expand all, Collapse all); the help toggle of the pages",
   "lookNotes": [
    "found 59 times by the walk of the running app (fold-all-toggle, Expand all, 95.39 by 20px, 14px, weight 400); its reactions are not read yet.",
    "corners corrected 2026-10-16: 4px, as the walk of the app measured them (the library had 0 by assumption)."
   ]
  },
  {
   "code": "TXS.001",
   "name": "text",
   "category": "component",
   "group": "READ.TXT",
   "summary": "By default the body text (18px, regular). Every text that is only read: a label, a title, a link, a help text, a message, a unit word. It is one component; its variants differ only in presentation: size (14, 18, 24, 28, 36), weight, capitals, italics, underline, struck through. The purpose of a text (label, title, help text, message) and its reaction (a link, a toggle) are given in the field or card that uses it. Weights: regular 400 is the ordinary reading weight; medium 500 is a touch heavier (numbers, buttons); bold 700 is clearly heavy (headings, emphasis). Semibold 600 was merged into bold, to keep three steps that can be told apart. Each variant records where its style was seen.",
   "variables": [
    "VAR001",
    "VAR003",
    "VAR004",
    "VAR012",
    "VAR013",
    "VAR018"
   ],
   "catalogue": [
    "T01"
   ],
   "kind": "Text you read",
   "belongs": "Used as: Labels of every field, introduction text, options of a dropdown, the hint inside an empty cell, shown values, generated help text, unit words (the Global Settings page: %, USD, months). Seen on: Identity, Brand, Business, Strategy; classes td 73; span 55; section-tile-list-line 35; intro-sentence 18; 101 of its texts can be pressed.",
   "look": {
    "height": null,
    "fontSize": 18,
    "fontWeight": "400",
    "corners": "0px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 0,
    "scale": "body 18",
    "found": 227
   },
   "lookNotes": [
    "simplified (the owner, owner, 2026-10-16): the label, title, link, help text and message are no longer components; one text with 21 presentations covers all 619 texts measured on the four systems. The old purposes stay in each variant's note, so that it is known in which field, card or tile a style was used.",
    "optimised (the owner, owner, 2026-10-16): 18 presentations; three weights (400, 500, 700; 600 merged into 700); the styles seen only in the Financial sections are left out because they will change (the data excludes the financial classes); a style was added for a completed responsibility; two rare styles (18px capitals, 14px bold) are merged into their neighbours.",
    "walk of the running app 2026-10-16: the unit word px stands after the number cells of Brand: Typography & Text Hierarchy (brand-hierarchy-unit, 18px, weight 400, 15 found); the dropdown values of currencies and periods (USD, Per unit) are body text; the channel table's resource buttons are 14px, weight 600 (the library: 700) and are pressed."
   ],
   "variants": [
    {
     "code": "TXS.BMD.001.001",
     "name": "Body medium",
     "description": "A touch heavier than the body: list numbers, the names in a page tag, the help toggle.",
     "edits": "Medium (500).",
     "values": {
      "VAR012": "prefilled"
     },
     "look": {
      "height": null,
      "fontSize": 18,
      "fontWeight": "500",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "body 18",
      "found": 15
     },
     "kind": "Text you read",
     "belongs": "Used as: List numbers, the names in a page tag, the help toggle. Seen on: Identity, Business; classes list-number 7; bullet-rail-label-text 7; interview-help-toggle.interview-instructions-toggle 1; 54 of its texts can be pressed."
    },
    {
     "code": "TXS.BBD.001.002",
     "name": "Body bold",
     "description": "Clearly heavy: table heads, a heading over a group of fields, the title of a generated tile or card, a strong word, an info note. (Semibold 600 is merged into it.)",
     "edits": "Bold (700).",
     "values": {
      "VAR012": "prefilled"
     },
     "look": {
      "height": null,
      "fontSize": 18,
      "fontWeight": "700",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "body 18",
      "found": 130
     },
     "kind": "Text you read",
     "belongs": "Used as: Table heads, headings of a group of fields, the title of a generated tile or card (a link to its input), strong words, info notes. Seen on: Identity, Brand, Business, Strategy; classes th 53; strong 22; info-note-glue 19; span 17; 2 of its texts can be pressed."
    },
    {
     "code": "TXS.BUL.001.003",
     "name": "Body underlined",
     "description": "A text that opens a page or a view: underlined (the pages of an introduction, an engagement link).",
     "edits": "Regular, underlined.",
     "values": {
      "VAR012": "prefilled"
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
      "found": 11
     },
     "kind": "Text you read, underlined",
     "belongs": "Used as: Page links of an introduction, engagement links. Seen on: Identity, Brand, Business, Strategy; classes intro-page-link 9; business-engagement-link 2; 12 of its texts can be pressed."
    },
    {
     "code": "TXS.BUC.001.004",
     "name": "Body bold underlined capitals",
     "description": "A subtitle: bold, underlined, capitals (What it covers, Uses from earlier, the title of a page tag).",
     "edits": "Bold, underlined, capitals.",
     "values": {
      "VAR012": "prefilled"
     },
     "look": {
      "height": null,
      "fontSize": 18,
      "fontWeight": "700",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "body 18",
      "found": 15
     },
     "kind": "Text you read, underlined, capitals",
     "belongs": "Used as: Underlined subtitles of an introduction, the title of a rail. Seen on: Identity, Brand, Business, Strategy; classes intro-fact-label 8; intro-fact-label.intro-covers-label 4; bullet-rail-title 3."
    },
    {
     "code": "TXS.BBC.001.005",
     "name": "Body bold capitals",
     "description": "The title of a master tile: bold capitals; a long title wraps. (Semibold 600 is merged into bold.)",
     "edits": "Bold, capitals.",
     "values": {
      "VAR012": "prefilled"
     },
     "look": {
      "height": null,
      "fontSize": 18,
      "fontWeight": "700",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "body 18",
      "found": 18
     },
     "kind": "Text you read, capitals",
     "belongs": "Used as: Master tile titles. Seen on: Identity, Brand, Strategy; classes section-tile-title 17; section-tile-title.section-tile-title-broken 1; 34 of its texts can be pressed."
    },
    {
     "code": "TXS.BMC.001.006",
     "name": "Body medium capitals",
     "description": "The words of a button or a rail: medium capitals, spaced 0.1em (Back, Start Interview, Add, the rail labels).",
     "edits": "Medium, capitals, tracking 0.1em.",
     "values": {
      "VAR012": "prefilled"
     },
     "look": {
      "height": null,
      "fontSize": 18,
      "fontWeight": "500",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "body 18",
      "found": 14
     },
     "kind": "Text you read, capitals",
     "belongs": "Used as: Back, Start Interview, the words of the add buttons, the rail labels. Seen on: Identity, Brand, Business, Strategy; classes back-link 8; primary-button.start-arrow-button 4; bullet-rail-label 2; 23 of its texts can be pressed."
    },
    {
     "code": "TXS.BDN.001.007",
     "name": "Body done",
     "description": "A completed responsibility: the text is muted and struck through; a tag in the Completed fold's grey says so in words, because the strike-through alone reads as cancelled (the tag is not a text style).",
     "edits": "Regular, muted, struck through.",
     "values": {
      "VAR012": "prefilled"
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
     },
     "kind": "Text you read, struck through",
     "belongs": "Used as: A founder's completed responsibility (business-capability-responsibility-done). Seen on: not in the default pages."
    },
    {
     "code": "TXS.SML.001.008",
     "name": "Small",
     "description": "The small text: a summary, a save status, a note, a bulleted list, the verification under a cell (danger colour).",
     "edits": "Regular, 14px.",
     "values": {
      "VAR012": "prefilled"
     },
     "look": {
      "height": null,
      "fontSize": 14,
      "fontWeight": "400",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "small 14",
      "found": 13
     },
     "kind": "Text you read",
     "belongs": "Used as: Summary lines, bulleted lists of a tile, the save status, notes, the verification message (danger colour, under the cell, after a missed fill). Seen on: Identity, Brand, Business, Strategy; classes save-status-text 8; business-card-summary 3; brand-specimens-note 1; fold-all-toggle 1; 4 of its texts can be pressed."
    },
    {
     "code": "TXS.SCP.001.009",
     "name": "Small capitals",
     "description": "The words of the header tools and their counts.",
     "edits": "Regular, capitals, 14px.",
     "values": {
      "VAR012": "prefilled"
     },
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
     "kind": "Text you read, underlined",
     "belongs": "Used as: Tool button words and counts. Seen on: not in the default pages."
    },
    {
     "code": "TXS.SBI.001.010",
     "name": "Small bold italic",
     "description": "The i of the info button.",
     "edits": "Bold, italic, 14px.",
     "values": {
      "VAR012": "prefilled"
     },
     "look": {
      "height": null,
      "fontSize": 14,
      "fontWeight": "700",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "small 14",
      "found": 20
     },
     "kind": "Text you read, italic",
     "belongs": "Used as: The i of the info button. Seen on: Business; classes info-note-button 20; 56 of its texts can be pressed."
    },
    {
     "code": "TXS.HTB.001.011",
     "name": "Heading 3 bold",
     "description": "A section heading: a dialog title, a box name above a floating card.",
     "edits": "Bold, 24px.",
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
      "found": 1
     },
     "kind": "Text you read",
     "belongs": "Used as: Dialog titles, box names above a floating card. Seen on: Business; classes strong 1."
    },
    {
     "code": "TXS.HTC.001.012",
     "name": "Heading 3 bold capitals",
     "description": "The name of the organisation in the header and the answer column labels. (Semibold 600 is merged into bold.)",
     "edits": "Bold, capitals, 24px.",
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
      "found": 12
     },
     "kind": "Text you read, capitals",
     "belongs": "Used as: The organisation name in the header, answer column labels. Seen on: Identity, Brand, Business, Strategy; classes app-header-organization-name 8; answer-column-label-number 2; answer-column-label-text 2."
    },
    {
     "code": "TXS.HTI.001.013",
     "name": "Heading 3 medium italic",
     "description": "The guiding question that opens an introduction.",
     "edits": "Medium, italic, 24px.",
     "values": {
      "VAR012": "prefilled"
     },
     "look": {
      "height": null,
      "fontSize": 24,
      "fontWeight": "500",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "h3 24",
      "found": 4
     },
     "kind": "Text you read, italic",
     "belongs": "Used as: The guiding question of an introduction. Seen on: Identity, Brand, Business, Strategy; classes intro-guiding-question 4."
    },
    {
     "code": "TXS.HDC.001.014",
     "name": "Heading 2 bold capitals",
     "description": "A chapter or column title and the subhead of a card. (Semibold 600 is merged into bold.)",
     "edits": "Bold, capitals, 28px; a long title moves horizontally.",
     "values": {
      "VAR012": "prefilled"
     },
     "look": {
      "height": null,
      "fontSize": 28,
      "fontWeight": "700",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "h2 28",
      "found": 5
     },
     "kind": "Text you read, capitals",
     "belongs": "Used as: Chapter titles, column titles, field group subheads. Seen on: Identity, Brand, Strategy; classes field-group-title.business-foundation-subhead 5."
    },
    {
     "code": "TXS.HOB.001.015",
     "name": "Heading 1 bold",
     "description": "The title of the system in the header.",
     "edits": "Bold, 36px.",
     "values": {
      "VAR012": "prefilled"
     },
     "look": {
      "height": null,
      "fontSize": 36,
      "fontWeight": "700",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "h1 36",
      "found": 8
     },
     "kind": "Text you read",
     "belongs": "Used as: The system title (after the system icon). Seen on: Identity, Brand, Business, Strategy; classes h1 8."
    },
    {
     "code": "TXS.HOC.001.016",
     "name": "Heading 1 capitals",
     "description": "The page title in capitals.",
     "edits": "Regular, capitals, 36px.",
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
      "found": 4
     },
     "kind": "Text you read, capitals",
     "belongs": "Used as: The page title. Seen on: Identity, Brand, Business, Strategy; classes interview-header-page-title.interview-header-page-title-capitals 4."
    },
    {
     "code": "TXS.HOR.001.017",
     "name": "Heading 1",
     "description": "The page title in plain letters.",
     "edits": "Regular, 36px.",
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
      "found": 2
     },
     "kind": "Text you read",
     "belongs": "Used as: The page title. Seen on: Identity, Business; classes interview-header-page-title 2."
    },
    {
     "code": "TXS.SBD.001.018",
     "name": "Small bold",
     "values": {
      "VAR012": "generated"
     },
     "description": "A small bold text that opens something: the names of the linked resources in a channel's table (Squarespace Core, Calendly Standard) and their numbers (#12). Weight 600 today, 700 in the library.",
     "edits": "Bold, 14px; pressed.",
     "look": {
      "height": null,
      "fontSize": 14,
      "fontWeight": "700",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "small 14",
      "found": 290
     },
     "kind": "Text you read, pressed",
     "belongs": "Used as: the linked resources of a channel (channel-resource-open, channel-resource-action). Seen on: Business, Customer Engagement; 290 found by the walk."
    }
   ],
   "requires": []
  },
  {
   "code": "DRP.001",
   "name": "dropdown",
   "category": "component",
   "summary": "A cell that opens a list to choose one value from. 44px high, 6px corners, a border, an inset edge. The default is a list of choices; the one variant is the searchable dropdown, whose list has a search box (Currency). Any option may have a reaction (Other opens a text box under the cell); that belongs to the option, not to a variant.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR006",
    "VAR016"
   ],
   "variants": [
    {
     "code": "DRP.SRC.001.001",
     "name": "Searchable",
     "description": "The same dropdown with a search box at the top of its list, for a long list: the person types and the list narrows (Currency).",
     "edits": "The list has a search box.",
     "values": {},
     "kind": "Cell you choose in; the list has a search box"
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
    "cell height, by the owner's decision (owner, 2026-10-15): every cell is 44px high (it measured 45).",
    "options source (the owner asked how dropdowns are divided, owner, 2026-10-15): prefilled (Status, Frequency, Currency, Unit, Plan, Cost option, Category, Type), dependent (Group), generated (Performer, Activity, Resource, Responsibility, Linked registration); With Other adds free entry to a list. The list of every dropdown cell is in tools/catalogue/exports/dropdowns.csv.",
    "Other is a reaction of an option, not a variant (the owner, owner, 2026-10-16); the generated list (Registrations, Expenses) is the variant.",
    "default and searchable only (the owner, owner, 2026-10-16); other forms (a generated list, With Other) are not variants for now, the names can be added later.",
    "an option may be + Add at the end of a list (the activities): choosing it makes an ordinary activity, chooses it and asks its name (a reaction of the option, scanned 2026-10-16)."
   ],
   "group": "HOLD.CEL",
   "kind": "Cell you choose in: one value from a list",
   "belongs": "Cards"
  },
  {
   "code": "TIK.001",
   "name": "tick box",
   "category": "component",
   "summary": "A square box with a tick, 24px. Only the box is the component; the words beside it are a label, and the box with its label is a field.",
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
    "corners": "4px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 1,
    "scale": "body 18",
    "found": 721,
    "width": 24,
    "places": 8
   },
   "lookNotes": [
    "merged into the default: tick box height 18, type 16, corners 0px, padding 0/0, border 0; found 5 times (0.7% of the default's 721); largest difference 2.0px",
    "enlarged, by the owner's decision (owner, 2026-10-15): from 18px to 24px, the WCAG 2.5.8 minimum, so that it no longer needs the spacing exception (721 found at 18px).",
    "the box with its words is a field, not a component (the owner, owner, 2026-10-16): the words are a label.",
    "decided 2026-10-16 (owner): the tick box is 24px with rounded corners of 4px, drawn by the app (not the browser's box); the check is white on the fill.",
    "line corrected 2026-10-16: the drawn tick box has a 2px line in the text colour (the fill when ticked).",
    "decided 2026-10-16 (owner): the tick box has a text input's look: no visible stroke (a 1px transparent line), the recessed inset, the soft glow under the pointer and the ring when active; ticked it is filled with the app's blue with a white check in its exact centre; no bold on hover.",
    "decided 2026-10-17 (owner): ticked, the box is flat (the fill and the check, no inner light or shade); under the pointer it takes a field's soft glow, with no wire drawn on it."
   ],
   "group": "HOLD.TIK",
   "kind": "Tick box: yes or no",
   "belongs": "Cards"
  },
  {
   "code": "TXT.001",
   "name": "text box",
   "category": "component",
   "summary": "The default holder: a one-line cell for text, in the body size, 44px high, 6px corners, a border and an inset edge, fixed space. Its variants change what can be typed and how it grows: free text that grows down, the name cell, whole numbers, decimals and the square number. A text that is only read is not a holder (see the text).",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR006",
    "VAR014",
    "VAR015",
    "VAR017"
   ],
   "variants": [
    {
     "code": "TXT.ARE.001.001",
     "name": "Free text",
     "description": "A description text: the cell gets bigger as you type or press Enter (Description, Offerings, Market).",
     "edits": "Grows with the words; Enter adds a line inside it.",
     "values": {
      "VAR017": "text",
      "VAR014": "grows down"
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
     },
     "kind": "Text cell: grows down as you type"
    },
    {
     "code": "TXT.NAM.001.002",
     "name": "Name cell",
     "description": "The name of a card, on top of the card. The order number is generated automatically and stands inside the cell.",
     "edits": "At the top of a card; the order number is automatic and inside the cell; it wraps and grows.",
     "values": {
      "VAR017": "text",
      "VAR014": "grows down"
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
     },
     "kind": "Text cell: the name of a card, with its automatic number inside"
    },
    {
     "code": "TXT.WHL.001.003",
     "name": "Whole number",
     "description": "Whole numbers only; no more digits than the field requires.",
     "edits": "Numbers only; the digit limit is set by the field.",
     "values": {
      "VAR017": "numbers only",
      "VAR015": "as required",
      "VAR014": "fixed space"
     },
     "kind": "Numbers-only cell: whole numbers, limited digits"
    },
    {
     "code": "TXT.DEC.001.004",
     "name": "Decimal",
     "description": "A number with decimals; no more digits than the field requires.",
     "edits": "Numbers and the decimal point.",
     "values": {
      "VAR017": "numbers only",
      "VAR015": "as required",
      "VAR014": "fixed space"
     },
     "kind": "Numbers-only cell: with decimals, limited digits"
    },
    {
     "code": "TXT.SQR.001.005",
     "name": "Square number",
     "description": "A number in a square box, 44 by 44px, with its unit beside it: % (Deposit %, Milestone %), years (Useful life, Amortisation period) or months (Target operating reserve). Numbers only; the digit limit is set by the field.",
     "edits": "A square box; the unit (%, years, months) stands beside it.",
     "values": {
      "VAR017": "numbers only",
      "VAR015": "as required",
      "VAR014": "fixed space"
     },
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
     },
     "kind": "Numbers-only cell: square, with its unit beside it"
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
    "the holders (owner, 2026-10-15): text and number holders all use the body text (18px); their variants depend on their function. A text that is only read is not a holder.",
    "a holder is one asset with variants (owner, 2026-10-15): its size can change and it takes features (only numbers, the amount of digits, growing down, growing under conditions); the number box is therefore a set of variants of the holder. Measured defaults of the number box: 44px high, 6px corners, padding 10/8 (166 found in 11 places); the percent, years and months boxes are squares of 44 by 44px.",
    "percent boxes: by the owner's decision (owner, 2026-10-15) they are squares, 45 by 45px, padding 4/8 (the 12 percent boxes of Meetup and event costs measured 44 by 45; the 5 size boxes of Typography and Text Hierarchy measured 45 by 45; 2 people boxes 44 by 45; 1 count box 48 by 45).",
    "cell height, by the owner's decision (owner, 2026-10-15): every cell is 44px high (it measured 45). The percent box is a square of 44 by 44px.",
    "years boxes: by the owner's decision (owner, 2026-10-15) they are squares, 44 by 44px, like the percent boxes (8 found: Useful life and Amortisation period).",
    "months box: by the owner's decision (owner, 2026-10-15) months boxes are squares, 44 by 44px, like the percent and years boxes (Target operating reserve in Business, Financial Foundation: the catalogue has no scan of that field, so 1 is the one named by the owner).",
    "digits: by the owner's description (owner, 2026-10-15) a number cell accepts only numbers, and no more digits than the field requires.",
    "the percent, years and months boxes are one variant, the square number (the owner, owner, 2026-10-15): 44 by 44px; the unit is beside it.",
    "the default is the text box, which exists in the app with specific characteristics (the owner, owner, 2026-10-16): 44px high, 6px corners, 1 line, fixed space."
   ],
   "group": "HOLD.CEL",
   "kind": "Text cell: one line, fixed space",
   "belongs": "Cards, chapters, the Workspace"
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
   ],
   "group": "HOLD.CEL",
   "kind": "Text cell with numbered rows: grows down, the numbers inside",
   "belongs": "Cards: Values, Principles, SWOT points, Initiatives"
  },
  {
   "code": "DIV.001",
   "name": "divider",
   "category": "component",
   "summary": "A thin line that divides two groups. By default it is the horizontal line (the page rule, 2px high, and the rule between two groups of rows in a card, 1px, with 12px of space either side); its variant is the vertical line between two columns.",
   "variables": [
    "VAR003"
   ],
   "catalogue": [],
   "variants": [
    {
     "code": "DIV.VER.001.001",
     "name": "Vertical",
     "description": "A line between two columns (answer columns).",
     "edits": "Runs down, 1px wide. Found only in the handbook card, not in the four systems.",
     "values": {},
     "look": {
      "height": null,
      "width": 1,
      "fontSize": 0,
      "fontWeight": "400",
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "scale": "symbol, no text",
      "found": 0
     },
     "belongs": "The handbook card only"
    }
   ],
   "requires": [],
   "lookNotes": [
    "horizontal: the page rule measured 2px (interview-divider); the card rule is 1px (the card rules); the vertical line (answer-columns-divider) was not measured.",
    "measured 2026-10-15: the page rule is 2px high and 1400px wide (.interview-divider); the vertical line (1px) exists only in the handbook card, not in the four systems."
   ],
   "group": "MARK.DIV",
   "kind": "Line that divides",
   "look": {
    "height": 2,
    "fontSize": 0,
    "fontWeight": "400",
    "corners": "0px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 0,
    "scale": "symbol, no text",
    "found": 1
   },
   "belongs": "The page, and between two groups of rows in a card"
  },
  {
   "code": "DAT.001",
   "name": "date cell",
   "category": "component",
   "summary": "A date cell: one long cell that holds the date, with the calendar symbol inside the cell at its right (a button 32px high, like the box buttons), not in a separate square. The cell works as a dropdown: the calendar symbol takes the place of the arrow and the calendar list opens under the cell, where the person chooses. By default it asks for a day, a month and a year; its variant asks only for a month and a year.",
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
     "code": "DAT.MON.001.001",
     "name": "Month and year",
     "description": "Only a month and a year are asked, in a calendar of months with a Month and Year switch (the Strategic Period, the Financial Plan).",
     "edits": "The calendar offers months; the day is not asked.",
     "values": {
      "VAR010": "month"
     },
     "kind": "Date cell: a month"
    }
   ],
   "requires": [
    {
     "asset": "DAT.002",
     "role": "the list that opens under the cell, where the day or the month is chosen"
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
    "dates in the Strategic Period, the Objective cards of a Theme and the Revenue card (Begins): by the owner's decision (owner, 2026-10-15) they are this date cell with a calendar and the choice of a day or only a month; they are month pickers with their own look today (bold, wide-spaced type that cuts the year off: 'September 202').",
    "decided by the owner, owner, 2026-10-16: the long cell and the square calendar symbol are unified (the symbol inside the cell, 32px high); one default for days, months and years, and one for months and years only; the cell works as a dropdown. The day popup today is the browser's own calendar and the symbol is the emoji 📅; both are to be replaced by the app's own.",
    "done 2026-10-16: the calendar button is inside the cell, 32px high with a drawn calendar symbol (an SVG in the text colour, not an emoji); the month-and-year form (the Strategic Period, the Financial Plan) is the same cell with the same symbol inside; the browser's native date input is no longer used.",
    "decided 2026-10-16 (owner): the day cell and the month-and-year cell are one component in two forms: the same cell, width, calendar button (24px symbol on a 32px button), calendar card, arrows, keys and closing; only the grid differs (days, or the months of a year).",
    "decided 2026-10-16 (owner): the date cell and the month cell take a text input's look (no stroke, recessed inset, glow, ring, no bold on hover); the calendar button follows the \"+\" box (BTN.ADD.001.001): the ground of the card, a 2px stroke and the symbol in the darker tone, filled on hover; the cell shows its months as Jan Feb Mar Apr May June July Aug Sept Oct Nov Dec; the calendar closes on a click anywhere outside it."
   ],
   "group": "HOLD.DAT",
   "kind": "Date cell: a day",
   "belongs": "Cards: dates"
  },
  {
   "code": "DAT.002",
   "name": "calendar list",
   "category": "component",
   "summary": "The list a date cell opens, like the list of a dropdown: the person chooses the day (a calendar of days, with Clear and Today) or the month (a calendar of months with a Month and Year switch). It opens under the cell and has rounded corners, 6px like the cells. Today the day list is the browser's own calendar, so its text size and corners are the browser's and cannot be measured or styled; only the month list is the app's own.",
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
     "name": "Days",
     "description": "The calendar of days with Clear and Today.",
     "edits": "A grid of days.",
     "values": {
      "VAR010": "day"
     },
     "kind": "List of a date cell: a calendar of days"
    },
    {
     "code": "DAT.MON.002.002",
     "name": "Months",
     "description": "The months of a year, with a Month and Year switch.",
     "edits": "A grid of months and a Month and Year switch.",
     "values": {
      "VAR010": "month"
     },
     "kind": "List of a date cell: a calendar of months"
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
    "rounded corners: by the owner's decision (owner, 2026-10-15) the popup window has rounded corners of 6px, like the cells. The day popup is the browser's own picker today (square corners, and it cannot be styled), so the app needs its own day calendar to give it rounded corners; the month popup has rounded corners already.",
    "measured 2026-10-16: the day popup is the browser's own calendar (a date input), so its text size and corners are the browser's and cannot be measured or styled; only the month popup of the Strategy pages is the app's own.",
    "done 2026-10-16: the day calendar is the app's own (the list under the date cell: month and year with previous and next arrows, the days from Monday, Today and Clear, 6px corners, a day after the latest or before the earliest allowed is dimmed and cannot be chosen); it closes on a choice, on Escape and on a click elsewhere, as a dropdown's list does.",
    "decided 2026-10-16 (owner): the month calendar is the day calendar's card (head with the double and single arrows and the title, the grid in the same width, a foot), the grid being the twelve months of the year in four columns; its foot offers This month.",
    "decided 2026-10-16 (owner): the calendar card stands on the ground of the card it opens from (the + box's ground), its buttons share one 2px frame so hovering or choosing never changes their size, numbers and letters at the body size; months: Jan Feb Mar Apr May June July Aug Sept Oct Nov Dec."
   ],
   "group": "HOLD.DAT",
   "kind": "List of a date cell: where the day or the month is chosen",
   "belongs": "Under a date cell"
  },
  {
   "code": "PCK.001",
   "name": "colour picker",
   "category": "component",
   "group": "HOLD.PIC",
   "summary": "A square swatch that opens the colour picker of the browser, 44 by 44px, dashed while empty. The hex cell beside it is a holder (a text box that takes #000000); the swatch, the hex cell and their label make the Colour field.",
   "variables": [
    "VAR001",
    "VAR003",
    "VAR004",
    "VAR006"
   ],
   "catalogue": [],
   "variants": [],
   "requires": [
    {
     "asset": "TXT.001",
     "role": "the hex holder beside the swatch"
    }
   ],
   "look": {
    "height": 32,
    "width": 32,
    "fontSize": 0,
    "fontWeight": "400",
    "corners": "6px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 0,
    "scale": "symbol, no text",
    "found": 1,
    "places": 1
   },
   "lookNotes": [
    "measured 44 by 45px, 8px corners, a dashed 1px edge while empty; by the owner's rules (every cell 44px, the corners of the cells) it is 44 by 44px with 6px corners.",
    "the swatch with its hex holder and label is a field, not a component (the owner, owner, 2026-10-16).",
    "decided 2026-10-16 (owner): the cell is a square (44px) with rounded corners, and the colour in it is a square with rounded corners (one step smaller).",
    "decided 2026-10-16 (owner): the colour is a 32px square with rounded corners INSIDE the hex cell at its right end, 6px from the top, bottom and right (as the date cell's calendar button); an x beside the cell, in the card's x column, clears the colour.",
    "size corrected 2026-10-16: the colour is a 32 by 32px box inside the 44px hex cell (the 44px square cell it was is now the hex cell).",
    "decided 2026-10-17 (owner): the colour picker opens a card of the app's own (a square of shades, the hue bar and the R, G and B numbers) on the ground of the card, with the calendar card's corners and closing; the box has no frame.",
    "corrected 2026-10-17: the colour box has no frame (the owner took the wire off) and no text."
   ],
   "kind": "Colour chooser: a swatch",
   "belongs": "Brand: Colours card"
  },
  {
   "code": "IMG.001",
   "name": "image holder",
   "category": "component",
   "group": "HOLD.PIC",
   "summary": "The picture of a brand: by default the brand image, 448 by 252px in a card of 492px, with the x at its corner, its name and note under it. Its variants are the logo and the icon, which are other sizes.",
   "variables": [
    "VAR003",
    "VAR004",
    "VAR006"
   ],
   "catalogue": [],
   "variants": [
    {
     "code": "IMG.LOG.001.001",
     "name": "Logo",
     "description": "The logo of the brand: a wide picture in a slot as wide as the card (668px by 216px); the picture is 650px wide and keeps its own proportions (about 122px high).",
     "edits": "A wide slot; the x at its corner.",
     "values": {},
     "look": {
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "fontSize": 0,
      "fontWeight": "400",
      "scale": "symbol, no text",
      "height": 216,
      "width": 668,
      "found": 1
     },
     "kind": "Image holder: a picture",
     "belongs": "Brand: Icon & Logo card"
    },
    {
     "code": "IMG.ICO.001.002",
     "name": "Icon",
     "description": "The icon of the brand: a square picture, about 249px by 249px, in a slot 300px high with the description cell beside it.",
     "edits": "A square picture; the description beside it.",
     "values": {},
     "look": {
      "corners": "0px",
      "paddingLeft": 0,
      "paddingTop": 0,
      "border": 0,
      "fontSize": 0,
      "fontWeight": "400",
      "scale": "symbol, no text",
      "height": 249,
      "width": 249,
      "found": 1
     },
     "kind": "Image holder: a picture",
     "belongs": "Brand: Icon & Logo card"
    }
   ],
   "requires": [
    {
     "asset": "BTN.001",
     "role": "removes the image"
    }
   ],
   "look": {
    "corners": "0px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 0,
    "fontSize": 0,
    "fontWeight": "400",
    "scale": "symbol, no text",
    "height": 252,
    "width": 448,
    "found": 3
   },
   "lookNotes": [
    "measured 448 by 252px in a card of 492px; the layout of the Brand Images card will change (the owner, owner, 2026-10-15).",
    "three sizes measured 2026-10-16 (Lumen & Loom, 1920px): the logo slot 668 by 216px (picture 650 by 122px), the icon 249 by 249px in a slot 668 by 300px, the brand image 448 by 252px (Quillfield). They differ because the cards differ; the sizes are not yet one rule.",
    "the default is the brand image (448 by 252px), the one image holder measured in a card's own list of images (the owner, owner, 2026-10-16)."
   ],
   "kind": "Image holder: a picture",
   "belongs": "Brand: Images card"
  },
  {
   "code": "ARW.001",
   "name": "arrow",
   "category": "component",
   "summary": "A triangle button that moves to the next or the previous one, 24px wide and 44px high; it grows 1.2 times on hover. By default it is the page arrow at the sides of a page; its variant is the carousel arrow of a dialog or a card.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004"
   ],
   "variants": [
    {
     "code": "ARW.CAR.001.001",
     "name": "Carousel arrow",
     "description": "Moves to the previous or the next card or view inside a dialog or card.",
     "edits": "Sits at the sides of the dialog or the card.",
     "values": {},
     "belongs": "The sides of a dialog or a card"
    }
   ],
   "requires": [],
   "catalogue": [
    "CO14",
    "CO18"
   ],
   "contracts": [
    "Rails"
   ],
   "group": "CTRL.NAV",
   "kind": "Navigation control: a triangle that moves to the next or the previous",
   "belongs": "The sides of a page"
  },
  {
   "code": "ARW.002",
   "name": "fold arrow",
   "category": "component",
   "summary": "A triangle that folds and unfolds a card, a list or a label. By default it is the fold arrow of a card: 36px, a 1px line, 6px corners (the toggle of a nested card, a section, an expanded list). Its variants are the frameless label arrow beside a field label (24px, 6px from the label) and the title arrow beside a chapter or column title (28px).",
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
     "edits": "No frame; 24px; sits 6px from the label.",
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
      "places": 2,
      "width": 24
     },
     "kind": "Fold control, frameless: beside a label",
     "belongs": "Beside a label"
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
     },
     "belongs": "Beside a chapter or column title"
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
    "width": 36,
    "fontSize": 0,
    "fontWeight": "400",
    "corners": "6px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 1,
    "scale": "symbol, no text",
    "found": 319,
    "places": 3
   },
   "lookNotes": [
    "merged by the owner's decision (owner, 2026-10-15): fold arrow height 36, type 18, corners 6px, padding 0/0, border 1; found 10 times (90.9% of the default's 11); largest difference 18.0px",
    "label arrow and title arrow are variants (the owner's decision, owner, 2026-10-15): the same component, function and style; the size follows the text beside it (24px beside a field label, 28px beside a title).",
    "found by the scan 2026-10-16: 21 fold arrows of 36px, on the Business pages (Customer Engagement 11, Financial Foundation 5, Sustainability 5); and 10 label arrows of 24 to 28px. They are the triangles that fold a card or a list (the toggles measured in Arial, not in the app's font).",
    "corrected 2026-10-16: the default is the 36px fold arrow of a card (319 found by the walk of the app, strategy-box-toggle, 36 by 36px, 6px corners, a 1px line); the label arrow and the title arrow are its variants, as decided on 2026-10-15. The default merge had made the label arrow the main asset."
   ],
   "group": "CTRL.FLD",
   "kind": "Fold control: a triangle that folds and unfolds",
   "belongs": "Cards, nested boxes, lists and labels"
  },
  {
   "code": "BUL.001",
   "name": "bullet",
   "category": "component",
   "summary": "The one dot of every page tag. Rest: 12px, the card's tint, no ring. Hover and focus: 15.6px (1.3 times), the fill turns darker, a 3px ring of the tint appears, the label is underlined and, in the compact tag, its name shows as a tooltip. Selected: 17.4px (1.45 times), the fill stays the tint, a 4px light bloom surrounds it (25px in all, the largest mark of the tag) and the label is bold. Hovering the selected bullet only underlines its label. All changes run in 0.2 seconds. Contrast (WCAG 1.4.11, 3:1): the plain dot, used for the Introduction and for every bullet of a card stack, has only 1.7:1 in light, 1.85:1 in dark and 1.7:1 in sepia against the rail, so it fails; the status dot has 5.2, 4.9 and 4.9:1, the hovered dot 7.3, 6.6 and 6.6:1 and the selected dot 5.2, 4.9 and 4.9:1. The rule: every bullet takes at least the status ink at rest.",
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
    "the one bullet of every page tag (the owner, owner, 2026-10-15): there is one type of bullet.",
    "the bullets are navigation controls (the owner, owner, 2026-10-15): they move between pages, sections, views and cards, like the page and carousel arrows.",
    "states measured 2026-10-16 on the Business page tag: rest 12px; hover and focus 15.6px (scale 1.3) with a 3px ring of 40% opacity; selected 17.4px (scale 1.45) with a 4px bloom of 28% opacity. The owner says the selection is much bigger and that this size should be the hovering: waiting for the answer, not applied.",
    "reactions read 2026-10-16 in the app (Business page tag, 1920px): rest 12px, fill rgb(139, 85, 108); hover 15.6px, fill rgb(101, 70, 89), ring 3px; selected 17.4px, fill rgb(139, 85, 108), bloom 4px; transitions 0.2s for size, colour and ring. In the pictures the selected bullet reads as much larger than the hovered one (25px against 22px with its ring).",
    "contrast measured 2026-10-16 against the rail's own ground (Business page tag, light, dark and sepia): plain 1.70, 1.85, 1.67; status 5.17, 4.87, 4.94; hover 7.28, 6.55, 6.61; selected 5.17, 4.87, 4.94. The plain dot (--rail-dot, the ice blue) fails 3:1: the owner asks that no bullet has a contrast problem, so the rest ink of every bullet becomes the status ink; to be applied in the app."
   ],
   "group": "CTRL.NAV",
   "kind": "Navigation control: a dot that shows and moves to a page",
   "belongs": "The page tags of chapters, cards, nested cards and floating cards"
  },
  {
   "code": "ICN.001",
   "name": "system icon",
   "category": "component",
   "group": "MARK.ICN",
   "summary": "The icon of a system, in the header before the system's title. A picture, not a button.",
   "variables": [
    "VAR003",
    "VAR004"
   ],
   "catalogue": [],
   "variants": [],
   "requires": [],
   "look": {
    "height": 36,
    "width": 36,
    "fontSize": 0,
    "fontWeight": "400",
    "corners": "0px",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 0,
    "scale": "symbol, no text",
    "found": 4,
    "places": 4
   },
   "lookNotes": [
    "measured 36 by 36px (one per system)."
   ],
   "kind": "Picture, not a button",
   "belongs": "The header, before the system's title"
  },
  {
   "code": "SYM.001",
   "name": "card symbol",
   "category": "component",
   "group": "MARK.ICN",
   "summary": "A round dot of 12px on a card tile that stands for a linked resource or activity (its aria name says which: Activity: Set up bookkeeping, Resource: Domain). It is pressed and opens the linked card. Its colour is the kind's.",
   "variables": [
    "VAR001",
    "VAR003",
    "VAR004"
   ],
   "catalogue": [],
   "variants": [],
   "requires": [],
   "look": {
    "height": 12,
    "width": 12,
    "corners": "50%",
    "paddingLeft": 0,
    "paddingTop": 0,
    "border": 0,
    "fontSize": 0,
    "fontWeight": "400",
    "scale": "symbol, no text",
    "found": 63
   },
   "kind": "Symbol on a tile, pressed: opens the linked card",
   "belongs": "The card tiles of Business: Infrastructure (activities and resources) and Customer Engagement",
   "lookNotes": [
    "found 63 times by the walk of the running app 2026-10-16 (card-tile-symbol: 33 activity, 30 resource), 12 by 12px, round; its reactions are not read yet."
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
     "asset": "FRM.001",
     "variant": "FRM.MTL.001.002",
     "role": "the surface of the tile"
    },
    {
     "asset": "BTN.001",
     "variant": "BTN.ADD.001.001",
     "role": "adds to the list the tile holds"
    },
    {
     "asset": "TXS.001",
     "variant": "TXS.BBC.001.005",
     "role": "the title of the tile"
    },
    {
     "asset": "TXS.001",
     "variant": "TXS.BUL.001.003",
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
     "asset": "FRM.001",
     "variant": "FRM.NTL.001.003",
     "role": "the surface of the tile"
    },
    {
     "asset": "TXS.001",
     "variant": "TXS.BBD.001.002",
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
   "code": "FRM.001",
   "name": "frame",
   "category": "frame",
   "summary": "A rounded, coloured surface, wired or not, that carries information and tools. Its variants are the chapter, the tile (master, nested), the card (floating, nested) and the tag. Its corners are 8px.",
   "variables": [
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR007"
   ],
   "variants": [
    {
     "code": "FRM.CHP.001.001",
     "name": "Chapter",
     "description": "The frame of a chapter: its title, its fold arrow and its master tiles.",
     "edits": "The surface of a chapter; 1px edge.",
     "values": {},
     "look": {
      "height": null,
      "fontSize": 0,
      "fontWeight": "400",
      "corners": "8px",
      "paddingLeft": 12,
      "paddingTop": 12,
      "border": 1,
      "scale": "symbol, no text",
      "found": 53
     },
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
       "asset": "TXS.001",
       "variant": "TXS.HDC.001.014",
       "role": "the title of the chapter"
      }
     ],
     "belongs": "A page"
    },
    {
     "code": "FRM.MTL.001.002",
     "name": "Master tile",
     "description": "The surface of a master tile: no edge, an inset shadow, 8px corners; 328px wide at 1920px.",
     "edits": "A tile of a chapter.",
     "values": {},
     "look": {
      "height": null,
      "fontSize": 0,
      "fontWeight": "400",
      "corners": "8px",
      "paddingLeft": 12,
      "paddingTop": 12,
      "border": 0,
      "scale": "symbol, no text",
      "found": 53
     },
     "belongs": "A chapter"
    },
    {
     "code": "FRM.NTL.001.003",
     "name": "Nested tile",
     "description": "The surface of a tile inside a dialog view (an open tile): 214px wide at 1920px.",
     "edits": "A tile inside a master tile's dialog.",
     "values": {},
     "look": {
      "height": null,
      "fontSize": 0,
      "fontWeight": "400",
      "corners": "8px",
      "paddingLeft": 12,
      "paddingTop": 12,
      "border": 0,
      "scale": "symbol, no text",
      "found": 188
     },
     "belongs": "A dialog view"
    },
    {
     "code": "FRM.FLC.001.004",
     "name": "Floating card",
     "description": "The surface of a card that floats over the dimmed page: 492px wide in all 173 cards measured (a founder's card is 297px), its height follows its contents (158px to 1403px, 507px on average), 12px padding, 8px corners, an inset edge and a shadow.",
     "edits": "A card over the page.",
     "values": {},
     "look": {
      "height": null,
      "fontSize": 0,
      "fontWeight": "400",
      "corners": "8px",
      "paddingLeft": 12,
      "paddingTop": 12,
      "border": 1,
      "scale": "symbol, no text",
      "found": 186
     },
     "belongs": "Over the dimmed page"
    },
    {
     "code": "FRM.NSC.001.005",
     "name": "Nested card",
     "description": "The surface of a card inside another card (Goal, Objective, Metric): it takes the width of the chapter and follows the card rules.",
     "edits": "A card inside a card; 1px edge.",
     "values": {},
     "look": {
      "height": null,
      "fontSize": 0,
      "fontWeight": "400",
      "corners": "8px",
      "paddingLeft": 12,
      "paddingTop": 12,
      "border": 1,
      "scale": "symbol, no text",
      "found": 12
     },
     "belongs": "Inside a card (Strategy)"
    },
    {
     "code": "FRM.TAG.001.006",
     "name": "Tag",
     "description": "The surface of the page tag (the tab behind the bullets of a page tag). It hugs its content, so it has no standard size and is adjustable: 37px wide with the bullets only (the pages of a system, measured on the Business pages), and as wide as its longest page name when the names are shown (the name box of 3. Infrastructure & Capability is 360px).",
     "edits": "Hugs its content: width and height follow the bullets and the names.",
     "values": {},
     "look": {
      "height": null,
      "fontSize": 0,
      "fontWeight": "400",
      "corners": "8px",
      "paddingLeft": 12,
      "paddingTop": 12,
      "border": 1,
      "scale": "symbol, no text",
      "found": 0
     },
     "belongs": "The side of a page or a card; a single card (a Resource card) has no tag of its own"
    },
    {
     "code": "FRM.TIL.001.007",
     "name": "Tile",
     "description": "The regular tile: a rounded, coloured surface that carries a title and what it holds. The master tile and the nested tile are its variants by where they stand.",
     "edits": "The regular tile surface; 8px corners.",
     "values": {},
     "look": {
      "height": null,
      "fontSize": 0,
      "fontWeight": "400",
      "corners": "8px",
      "paddingLeft": 12,
      "paddingTop": 12,
      "border": 0,
      "scale": "symbol, no text",
      "found": 0
     },
     "belongs": "A chapter or a dialog view"
    },
    {
     "code": "FRM.CRD.001.008",
     "name": "Card",
     "description": "The regular card: a rounded, coloured surface that carries fields and tools. The floating card and the nested card are its variants by where they stand.",
     "edits": "The regular card surface; 8px corners.",
     "values": {},
     "look": {
      "height": null,
      "fontSize": 0,
      "fontWeight": "400",
      "corners": "8px",
      "paddingLeft": 12,
      "paddingTop": 12,
      "border": 1,
      "scale": "symbol, no text",
      "found": 0
     },
     "belongs": "A page or a dialog view"
    }
   ],
   "requires": [],
   "catalogue": [
    "CO16",
    "CO22",
    "CO23",
    "CO24"
   ],
   "group": "FRAME.SUR",
   "lookNotes": [
    "one frame (the owner, owner, 2026-10-15): chapter, tile (master, nested), card (floating, nested) and tag are its variants; corners 8px (measured on the chapter, the tiles and the cards; the tag was not measured).",
    "the frame also has a regular tile and a regular card, and the tag is the page tag (the owner, owner, 2026-10-15).",
    "the master tile and the nested tile have 12px of padding, by the owner's decision (owner, 2026-10-16); measured 13px on every side.",
    "the tag hugs its content (the owner, owner, 2026-10-16): measured 37px wide with bullets only (Business pages, 230px high for 5 pages), 360px for the longest name box; a card stack's tag is 12px wide and 16px per card."
   ],
   "kind": "Surface that carries information and tools"
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "role": "text"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    },
    {
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "DAT.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "DAT.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXS.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.DEC.001.004",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "TXT.001",
     "role": "number",
     "variant": "TXT.WHL.001.003"
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "TXT.001",
     "role": "number",
     "variant": "TXT.WHL.001.003"
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "switches the note on"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.DEC.001.004",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    },
    {
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.SQR.001.005",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "DAT.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "TXT.001",
     "role": "number",
     "variant": "TXT.WHL.001.003"
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXS.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.SQR.001.005",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "DAT.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.WHL.001.003",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "DAT.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.SQR.001.005",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "DAT.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.WHL.001.003",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "TXT.001",
     "role": "number",
     "variant": "TXT.WHL.001.003"
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "TXT.001",
     "role": "number",
     "variant": "TXT.WHL.001.003"
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.WHL.001.003",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.WHL.001.003",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.WHL.001.003",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.WHL.001.003",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXS.001",
     "role": "shown, not edited"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.WHL.001.003",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "TXT.001",
     "role": "number",
     "variant": "TXT.WHL.001.003"
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "TXT.001",
     "role": "number",
     "variant": "TXT.WHL.001.003"
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "TXT.001",
     "role": "number",
     "variant": "TXT.WHL.001.003"
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "TXT.001",
     "role": "number",
     "variant": "TXT.WHL.001.003"
    }
   ],
   "catalogue": [
    "F062"
   ]
  },
  {
   "code": "FLD.054",
   "name": "Linked Offerings",
   "category": "field",
   "summary": "The Offerings field of a card (its label says Offerings): a label and tick list (+ number); with several Offerings the shares count in Units or in %.",
   "variables": [
    "VAR005",
    "VAR006",
    "VAR008"
   ],
   "variants": [],
   "requires": [
    {
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "one tick per entry"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.SQR.001.005",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.SQR.001.005",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.SQR.001.005",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "TXT.001",
     "role": "number",
     "variant": "TXT.WHL.001.003"
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "TXT.001",
     "role": "number",
     "variant": "TXT.WHL.001.003"
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "TXT.001",
     "role": "number",
     "variant": "TXT.WHL.001.003"
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "TXT.001",
     "role": "number",
     "variant": "TXT.WHL.001.003"
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TIK.001",
     "role": "tick"
    },
    {
     "asset": "TXT.001",
     "role": "number",
     "variant": "TXT.WHL.001.003"
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "DAT.001",
     "role": "date"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.WHL.001.003",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.WHL.001.003",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "DRP.001",
     "role": "choice"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
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
     "asset": "TXS.001",
     "role": "the label of the field"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.ARE.001.001",
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
     "asset": "TXS.001",
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
     "asset": "FRM.001",
     "variant": "FRM.FLC.001.004",
     "role": "the surface of the card"
    },
    {
     "asset": "TXS.001",
     "variant": "TXS.HTB.001.011",
     "role": "the name of the tile or box above the card"
    },
    {
     "asset": "TXT.001",
     "variant": "TXT.NAM.001.002",
     "role": "the name of the card"
    },
    {
     "asset": "BTN.001",
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
     "asset": "FLD.009",
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
     "role": "the arrow placed in the tag"
    },
    {
     "asset": "BTN.003",
     "role": "the Back button, where the tag has one"
    },
    {
     "asset": "TXS.001",
     "role": "the names of the items; the title of the tag"
    }
   ],
   "lookNotes": [
    "moved from the components (owner, 2026-10-15): the rail is not a component. The bullet (BUL.001) is the component; the page tag is a field made of bullets, names, the arrow and the Back button."
   ]
  }
 ]
};
