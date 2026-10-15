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
     "values": {}
    },
    {
     "code": "BTN.ADD.001.002",
     "name": "Add",
     "description": "The plus: adds a card, a row or an entry.",
     "edits": "The symbol is a plus and the colour is the card tint.",
     "values": {}
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
   "summary": "A wide text button that adds a row to a list (+ ADD CHANNEL, + ADD REGISTRATION NUMBER). Measured size not recorded yet.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004"
   ],
   "variants": [],
   "requires": [],
   "catalogue": []
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
   ]
  },
  {
   "code": "TXT.001",
   "name": "text input",
   "category": "component",
   "summary": "A cell the person types text in: a cell with an inset edge and 6px corners.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR006"
   ],
   "variants": [
    {
     "code": "TXT.BOX.001.001",
     "name": "Text box",
     "description": "One line of text, 44px high.",
     "edits": "A single line.",
     "values": {}
    },
    {
     "code": "TXT.ARE.001.002",
     "name": "Text area",
     "description": "Text that grows with its words and wraps.",
     "edits": "Several lines; it grows to fit.",
     "values": {}
    },
    {
     "code": "TXT.NAM.001.003",
     "name": "Name cell",
     "description": "The name of a card in its head, with the order number inside the cell.",
     "edits": "A text area with the order number inside the cell at its left.",
     "values": {}
    },
    {
     "code": "TXT.RDO.001.004",
     "name": "Read-only text",
     "description": "Text the person cannot edit (a number or a name the app fills in).",
     "edits": "No cell edge; the text is plain.",
     "values": {}
    }
   ],
   "requires": [],
   "catalogue": [
    "CO10",
    "CO09"
   ]
  },
  {
   "code": "NUM.001",
   "name": "number box",
   "category": "component",
   "summary": "A cell for a number, right-aligned, 45px high.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR006"
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
     "edits": "Shows a percent sign after it.",
     "values": {}
    },
    {
     "code": "NUM.YRS.001.004",
     "name": "Years",
     "description": "A number of years.",
     "edits": "Whole numbers with the unit years.",
     "values": {}
    }
   ],
   "requires": [],
   "catalogue": [
    "CO07"
   ]
  },
  {
   "code": "DAT.001",
   "name": "date cell",
   "category": "component",
   "summary": "A cell that holds a date, with a calendar button that opens a calendar. 44px high.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR006"
   ],
   "variants": [
    {
     "code": "DAT.CAL.001.001",
     "name": "Calendar",
     "description": "A day, month and year with a calendar button.",
     "edits": "The calendar button opens a day calendar.",
     "values": {}
    },
    {
     "code": "DAT.MON.001.002",
     "name": "Month",
     "description": "A month and year (January 2027) chosen from a month picker.",
     "edits": "The list is a month picker with no days.",
     "values": {}
    }
   ],
   "requires": [],
   "catalogue": [
    "CO01"
   ]
  },
  {
   "code": "LBL.001",
   "name": "label",
   "category": "component",
   "summary": "The words that name a field or a group. Muted colour for a field, bold for a group heading.",
   "variables": [
    "VAR001",
    "VAR003",
    "VAR004",
    "VAR008"
   ],
   "variants": [
    {
     "code": "LBL.SID.001.001",
     "name": "Side label",
     "description": "A label in a column at the left of its control.",
     "edits": "It stands in the label column (177px) beside the control.",
     "values": {}
    },
    {
     "code": "LBL.ABV.001.002",
     "name": "Label above",
     "description": "A label above its control, 6px from it.",
     "edits": "It stands above the control.",
     "values": {}
    },
    {
     "code": "LBL.HEA.001.003",
     "name": "Heading",
     "description": "A bold heading over a group of fields (Description, SWOT Analysis).",
     "edits": "Bold, with the group's rule.",
     "values": {}
    }
   ],
   "requires": [],
   "catalogue": [
    "CO05"
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
     "values": {}
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
   ]
  },
  {
   "code": "RAL.001",
   "name": "rail",
   "category": "component",
   "summary": "A column of bullets and names that moves between the pages, the sections or the cards. It holds the bullets, the arrow, and the Back button.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR007"
   ],
   "variants": [
    {
     "code": "RAL.PAG.001.001",
     "name": "Pages rail",
     "description": "The left rail of the page: one bullet per page, the page names inline from 1700px.",
     "edits": "On the left of the page, with the page arrows.",
     "values": {}
    },
    {
     "code": "RAL.SEC.001.002",
     "name": "Sections rail",
     "description": "The rail beside a dialog or a floating card: a 37px tab below 1700px, the names shown as tooltips.",
     "edits": "A 37px tab; the names appear on hover.",
     "values": {}
    },
    {
     "code": "RAL.NAM.001.003",
     "name": "Named rail",
     "description": "The rail beside a dialog or a card from 1700px: 217px wide with the names shown.",
     "edits": "217px wide with the names inline.",
     "values": {}
    },
    {
     "code": "RAL.NST.001.004",
     "name": "Nested card rail",
     "description": "The rail of a nested card (Goal, Objective, Metric): 88px square with two arrows and the bullets.",
     "edits": "No tab; two arrows and the bullets.",
     "values": {}
    }
   ],
   "requires": [
    {
     "asset": "BUL.001",
     "role": "one bullet per item"
    },
    {
     "asset": "ARW.001",
     "variant": "ARW.PAG.001.001",
     "role": "the page arrows"
    },
    {
     "asset": "BTN.003",
     "role": "returns to the view before"
    }
   ],
   "catalogue": [
    "CO15",
    "CO19"
   ],
   "contracts": [
    "Rails"
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
   "summary": "A tile inside a dialog view that opens a card or a view.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003",
    "VAR004",
    "VAR006"
   ],
   "variants": [],
   "requires": [],
   "catalogue": [
    "CO24"
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
   "code": "TIL.004",
   "name": "tile link",
   "category": "tile",
   "summary": "A link inside a master tile that opens one of the things it lists.",
   "variables": [
    "VAR001",
    "VAR002",
    "VAR003"
   ],
   "variants": [],
   "requires": [],
   "catalogue": [
    "CO17"
   ]
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
     "asset": "RAL.001",
     "variant": "RAL.PAG.001.001",
     "role": "moves between the pages"
    },
    {
     "asset": "ARW.001",
     "variant": "ARW.PAG.001.001",
     "role": "moves to the next or previous page"
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
     "asset": "RAL.001",
     "variant": "RAL.SEC.001.002",
     "role": "moves between the views"
    },
    {
     "asset": "BTN.003",
     "role": "returns to the page"
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
   "requires": [],
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
     "asset": "TXT.001",
     "variant": "TXT.RDO.001.004",
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
     "asset": "TXT.001",
     "variant": "TXT.RDO.001.004",
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
     "asset": "TXT.001",
     "variant": "TXT.RDO.001.004",
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
     "asset": "TXT.001",
     "variant": "TXT.RDO.001.004",
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
     "asset": "TXT.001",
     "variant": "TXT.RDO.001.004",
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
     "asset": "TXT.001",
     "variant": "TXT.RDO.001.004",
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
     "asset": "TXT.001",
     "variant": "TXT.RDO.001.004",
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
     "asset": "TXT.001",
     "variant": "TXT.RDO.001.004",
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
     "asset": "TXT.001",
     "variant": "TXT.RDO.001.004",
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
     "asset": "TXT.001",
     "variant": "TXT.RDO.001.004",
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
    "F075"
   ]
  },
  {
   "code": "FLD.066",
   "name": "Expense 4 name",
   "category": "field",
   "summary": "The Expense 4 name field: a label and text area.",
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
   "name": "Linked registrationi",
   "category": "field",
   "summary": "The Linked registrationi field: a label and dropdown.",
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
    "F081"
   ]
  },
  {
   "code": "FLD.069",
   "name": "Colour 4 name",
   "category": "field",
   "summary": "The Colour 4 name field: a label and text area.",
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
   "code": "FLD.070",
   "name": "Rolei",
   "category": "field",
   "summary": "The Rolei field: a label and dropdown.",
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
   "code": "FLD.071",
   "name": "Colouri",
   "category": "field",
   "summary": "The Colouri field: a label and text box.",
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
   "code": "FLD.072",
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
   "code": "FLD.073",
   "name": "Typeface 3 name",
   "category": "field",
   "summary": "The Typeface 3 name field: a label and text area.",
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
   "code": "FLD.074",
   "name": "text box",
   "category": "field",
   "summary": "The text box field: a label and text box.",
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
    "F092"
   ]
  },
  {
   "code": "FLD.075",
   "name": "Image 4 name",
   "category": "field",
   "summary": "The Image 4 name field: a label and text box.",
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
   "code": "FLD.076",
   "name": "Image 4 description",
   "category": "field",
   "summary": "The Image 4 description field: a label and text area.",
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
   "code": "FLD.077",
   "name": "Segment 1, Profile 3 name",
   "category": "field",
   "summary": "The Segment 1, Profile 3 name field: a label and text area.",
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
   "code": "FLD.078",
   "name": "Specific Personal Informationi",
   "category": "field",
   "summary": "The Specific Personal Informationi field: a label and text area.",
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
   "code": "FLD.079",
   "name": "Psychographicsi",
   "category": "field",
   "summary": "The Psychographicsi field: a label and text area.",
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
   "code": "FLD.080",
   "name": "Social & Interest Hubsi",
   "category": "field",
   "summary": "The Social & Interest Hubsi field: a label and text area.",
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
   "code": "FLD.081",
   "name": "Information & Shopping Habitsi",
   "category": "field",
   "summary": "The Information & Shopping Habitsi field: a label and text area.",
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
   "code": "FLD.082",
   "name": "Goals & Desiresi",
   "category": "field",
   "summary": "The Goals & Desiresi field: a label and text area.",
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
   "code": "FLD.083",
   "name": "Challenges & Problemsi",
   "category": "field",
   "summary": "The Challenges & Problemsi field: a label and text area.",
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
   "code": "FLD.084",
   "name": "Objectionsi",
   "category": "field",
   "summary": "The Objectionsi field: a label and text area.",
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
   "code": "FLD.085",
   "name": "Functionali",
   "category": "field",
   "summary": "The Functionali field: a label and text area.",
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
   "code": "FLD.086",
   "name": "Emotionali",
   "category": "field",
   "summary": "The Emotionali field: a label and text area.",
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
   "code": "FLD.087",
   "name": "Sociali",
   "category": "field",
   "summary": "The Sociali field: a label and text area.",
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
   "code": "FLD.088",
   "name": "Typei",
   "category": "field",
   "summary": "The Typei field: a label and text area, dropdown.",
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
     "asset": "DRP.001",
     "role": "choice"
    }
   ],
   "catalogue": [
    "F117",
    "F120"
   ]
  },
  {
   "code": "FLD.089",
   "name": "Offeringsi",
   "category": "field",
   "summary": "The Offeringsi field: a label and text area.",
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
    "F122"
   ]
  },
  {
   "code": "FLD.090",
   "name": "Marketi",
   "category": "field",
   "summary": "The Marketi field: a label and text area.",
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
   "code": "FLD.091",
   "name": "Customer Acquisitioni",
   "category": "field",
   "summary": "The Customer Acquisitioni field: a label and text area.",
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
   "code": "FLD.092",
   "name": "Customer Experiencei",
   "category": "field",
   "summary": "The Customer Experiencei field: a label and text area.",
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
   "code": "FLD.093",
   "name": "Strengthsi",
   "category": "field",
   "summary": "The Strengthsi field: a label and text area.",
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
    "F130"
   ]
  },
  {
   "code": "FLD.094",
   "name": "Weaknessesi",
   "category": "field",
   "summary": "The Weaknessesi field: a label and text area.",
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
    "F132"
   ]
  },
  {
   "code": "FLD.095",
   "name": "Opportunitiesi",
   "category": "field",
   "summary": "The Opportunitiesi field: a label and text area.",
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
    "F134"
   ]
  },
  {
   "code": "FLD.096",
   "name": "Threatsi",
   "category": "field",
   "summary": "The Threatsi field: a label and text area.",
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
    "F136"
   ]
  },
  {
   "code": "FLD.097",
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
   "code": "FLD.098",
   "name": "Functioni",
   "category": "field",
   "summary": "The Functioni field: a label and text area.",
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
   "code": "FLD.099",
   "name": "Customer Benefiti",
   "category": "field",
   "summary": "The Customer Benefiti field: a label and text area.",
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
   "code": "FLD.100",
   "name": "Content & Scopei",
   "category": "field",
   "summary": "The Content & Scopei field: a label and text area.",
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
   "code": "FLD.101",
   "name": "Purchase & Deliveryi",
   "category": "field",
   "summary": "The Purchase & Deliveryi field: a label and text area.",
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
   "code": "FLD.102",
   "name": "Support & Communicationi",
   "category": "field",
   "summary": "The Support & Communicationi field: a label and text area.",
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
   "code": "FLD.103",
   "name": "Requirements & Conditionsi",
   "category": "field",
   "summary": "The Requirements & Conditionsi field: a label and text area.",
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
   "code": "FLD.104",
   "name": "Subchannel name: Select a subchannel",
   "category": "field",
   "summary": "The Subchannel name: Select a subchannel field: a label and dropdown.",
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
    "F153"
   ]
  },
  {
   "code": "FLD.105",
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
   "code": "FLD.106",
   "name": "Offerings of Subchannel 2: All Offerings",
   "category": "field",
   "summary": "The Offerings of Subchannel 2: All Offerings field: a label and tick box.",
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
    "F158"
   ]
  },
  {
   "code": "FLD.107",
   "name": "Offerings of Subchannel 2: AI Workflow A",
   "category": "field",
   "summary": "The Offerings of Subchannel 2: AI Workflow A field: a label and tick box.",
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
    "F159"
   ]
  },
  {
   "code": "FLD.108",
   "name": "Offerings of Subchannel 2: Automation Bu",
   "category": "field",
   "summary": "The Offerings of Subchannel 2: Automation Bu field: a label and tick box.",
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
    "F160"
   ]
  },
  {
   "code": "FLD.109",
   "name": "Offerings of Subchannel 2: Automation Ca",
   "category": "field",
   "summary": "The Offerings of Subchannel 2: Automation Ca field: a label and tick box.",
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
    "F161"
   ]
  },
  {
   "code": "FLD.110",
   "name": "Journey Stage 1 for Subchannel 2: Select",
   "category": "field",
   "summary": "The Journey Stage 1 for Subchannel 2: Select field: a label and dropdown.",
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
    "F162"
   ]
  },
  {
   "code": "FLD.111",
   "name": "Offerings of Subchannel 4: All Offerings",
   "category": "field",
   "summary": "The Offerings of Subchannel 4: All Offerings field: a label and tick box.",
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
    "F163"
   ]
  },
  {
   "code": "FLD.112",
   "name": "Offerings of Subchannel 4: AI Workflow A",
   "category": "field",
   "summary": "The Offerings of Subchannel 4: AI Workflow A field: a label and tick box.",
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
    "F164"
   ]
  },
  {
   "code": "FLD.113",
   "name": "Offerings of Subchannel 4: Automation Bu",
   "category": "field",
   "summary": "The Offerings of Subchannel 4: Automation Bu field: a label and tick box.",
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
    "F165"
   ]
  },
  {
   "code": "FLD.114",
   "name": "Offerings of Subchannel 4: Automation Ca",
   "category": "field",
   "summary": "The Offerings of Subchannel 4: Automation Ca field: a label and tick box.",
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
    "F166"
   ]
  },
  {
   "code": "FLD.115",
   "name": "Journey Stage 1 for Subchannel 4: Select",
   "category": "field",
   "summary": "The Journey Stage 1 for Subchannel 4: Select field: a label and dropdown.",
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
    "F167"
   ]
  },
  {
   "code": "FLD.116",
   "name": "Offerings of Subchannel 6: All Offerings",
   "category": "field",
   "summary": "The Offerings of Subchannel 6: All Offerings field: a label and tick box.",
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
    "F168"
   ]
  },
  {
   "code": "FLD.117",
   "name": "Offerings of Subchannel 6: AI Workflow A",
   "category": "field",
   "summary": "The Offerings of Subchannel 6: AI Workflow A field: a label and tick box.",
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
    "F169"
   ]
  },
  {
   "code": "FLD.118",
   "name": "Offerings of Subchannel 6: Automation Bu",
   "category": "field",
   "summary": "The Offerings of Subchannel 6: Automation Bu field: a label and tick box.",
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
    "F170"
   ]
  },
  {
   "code": "FLD.119",
   "name": "Offerings of Subchannel 6: Automation Ca",
   "category": "field",
   "summary": "The Offerings of Subchannel 6: Automation Ca field: a label and tick box.",
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
    "F171"
   ]
  },
  {
   "code": "FLD.120",
   "name": "Journey Stage 1 for Subchannel 6: Select",
   "category": "field",
   "summary": "The Journey Stage 1 for Subchannel 6: Select field: a label and dropdown.",
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
    "F172"
   ]
  },
  {
   "code": "FLD.121",
   "name": "Subchannel name",
   "category": "field",
   "summary": "The Subchannel name field: a label and text area.",
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
    "F173"
   ]
  },
  {
   "code": "FLD.122",
   "name": "Offerings of Subchannel 7: All Offerings",
   "category": "field",
   "summary": "The Offerings of Subchannel 7: All Offerings field: a label and tick box.",
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
    "F174"
   ]
  },
  {
   "code": "FLD.123",
   "name": "Offerings of Subchannel 7: AI Workflow A",
   "category": "field",
   "summary": "The Offerings of Subchannel 7: AI Workflow A field: a label and tick box.",
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
    "F175"
   ]
  },
  {
   "code": "FLD.124",
   "name": "Offerings of Subchannel 7: Automation Bu",
   "category": "field",
   "summary": "The Offerings of Subchannel 7: Automation Bu field: a label and tick box.",
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
    "F176"
   ]
  },
  {
   "code": "FLD.125",
   "name": "Offerings of Subchannel 7: Automation Ca",
   "category": "field",
   "summary": "The Offerings of Subchannel 7: Automation Ca field: a label and tick box.",
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
    "F177"
   ]
  },
  {
   "code": "FLD.126",
   "name": "Journey Stage 1 for Subchannel 7: Select",
   "category": "field",
   "summary": "The Journey Stage 1 for Subchannel 7: Select field: a label and dropdown.",
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
    "F178"
   ]
  },
  {
   "code": "FLD.127",
   "name": "Offerings of Subchannel 8: All Offerings",
   "category": "field",
   "summary": "The Offerings of Subchannel 8: All Offerings field: a label and tick box.",
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
    "F179"
   ]
  },
  {
   "code": "FLD.128",
   "name": "Offerings of Subchannel 8: AI Workflow A",
   "category": "field",
   "summary": "The Offerings of Subchannel 8: AI Workflow A field: a label and tick box.",
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
    "F180"
   ]
  },
  {
   "code": "FLD.129",
   "name": "Offerings of Subchannel 8: Automation Bu",
   "category": "field",
   "summary": "The Offerings of Subchannel 8: Automation Bu field: a label and tick box.",
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
    "F181"
   ]
  },
  {
   "code": "FLD.130",
   "name": "Offerings of Subchannel 8: Automation Ca",
   "category": "field",
   "summary": "The Offerings of Subchannel 8: Automation Ca field: a label and tick box.",
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
    "F182"
   ]
  },
  {
   "code": "FLD.131",
   "name": "Journey Stage 1 for Subchannel 8: Select",
   "category": "field",
   "summary": "The Journey Stage 1 for Subchannel 8: Select field: a label and dropdown.",
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
    "F183"
   ]
  },
  {
   "code": "FLD.132",
   "name": "Offerings of Subchannel 9: All Offerings",
   "category": "field",
   "summary": "The Offerings of Subchannel 9: All Offerings field: a label and tick box.",
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
    "F184"
   ]
  },
  {
   "code": "FLD.133",
   "name": "Offerings of Subchannel 9: AI Workflow A",
   "category": "field",
   "summary": "The Offerings of Subchannel 9: AI Workflow A field: a label and tick box.",
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
    "F185"
   ]
  },
  {
   "code": "FLD.134",
   "name": "Offerings of Subchannel 9: Automation Bu",
   "category": "field",
   "summary": "The Offerings of Subchannel 9: Automation Bu field: a label and tick box.",
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
    "F186"
   ]
  },
  {
   "code": "FLD.135",
   "name": "Offerings of Subchannel 9: Automation Ca",
   "category": "field",
   "summary": "The Offerings of Subchannel 9: Automation Ca field: a label and tick box.",
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
    "F187"
   ]
  },
  {
   "code": "FLD.136",
   "name": "Journey Stage 1 for Subchannel 9: Select",
   "category": "field",
   "summary": "The Journey Stage 1 for Subchannel 9: Select field: a label and dropdown.",
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
    "F188"
   ]
  },
  {
   "code": "FLD.137",
   "name": "Offerings of Subchannel 10: All Offering",
   "category": "field",
   "summary": "The Offerings of Subchannel 10: All Offering field: a label and tick box.",
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
    "F189"
   ]
  },
  {
   "code": "FLD.138",
   "name": "Offerings of Subchannel 10: AI Workflow",
   "category": "field",
   "summary": "The Offerings of Subchannel 10: AI Workflow field: a label and tick box.",
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
    "F190"
   ]
  },
  {
   "code": "FLD.139",
   "name": "Offerings of Subchannel 10: Automation B",
   "category": "field",
   "summary": "The Offerings of Subchannel 10: Automation B field: a label and tick box.",
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
    "F191"
   ]
  },
  {
   "code": "FLD.140",
   "name": "Offerings of Subchannel 10: Automation C",
   "category": "field",
   "summary": "The Offerings of Subchannel 10: Automation C field: a label and tick box.",
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
    "F192"
   ]
  },
  {
   "code": "FLD.141",
   "name": "Journey Stage 1 for Subchannel 10: Selec",
   "category": "field",
   "summary": "The Journey Stage 1 for Subchannel 10: Selec field: a label and dropdown.",
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
    "F193"
   ]
  },
  {
   "code": "FLD.142",
   "name": "Offerings of Subchannel 11: All Offering",
   "category": "field",
   "summary": "The Offerings of Subchannel 11: All Offering field: a label and tick box.",
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
    "F194"
   ]
  },
  {
   "code": "FLD.143",
   "name": "Offerings of Subchannel 11: AI Workflow",
   "category": "field",
   "summary": "The Offerings of Subchannel 11: AI Workflow field: a label and tick box.",
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
    "F195"
   ]
  },
  {
   "code": "FLD.144",
   "name": "Offerings of Subchannel 11: Automation B",
   "category": "field",
   "summary": "The Offerings of Subchannel 11: Automation B field: a label and tick box.",
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
    "F196"
   ]
  },
  {
   "code": "FLD.145",
   "name": "Offerings of Subchannel 11: Automation C",
   "category": "field",
   "summary": "The Offerings of Subchannel 11: Automation C field: a label and tick box.",
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
    "F197"
   ]
  },
  {
   "code": "FLD.146",
   "name": "Journey Stage 1 for Subchannel 11: Selec",
   "category": "field",
   "summary": "The Journey Stage 1 for Subchannel 11: Selec field: a label and dropdown.",
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
    "F198"
   ]
  },
  {
   "code": "FLD.147",
   "name": "Legal requirement 6 name",
   "category": "field",
   "summary": "The Legal requirement 6 name field: a label and text area.",
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
   "code": "FLD.148",
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
   "code": "FLD.149",
   "name": "tick box",
   "category": "field",
   "summary": "The tick box field: a label and tick box.",
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
    "F202"
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
     "asset": "FLD.049",
     "role": "common field"
    }
   ],
   "catalogue": [
    "K016",
    "K017"
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
     "asset": "FLD.054",
     "role": "common field"
    },
    {
     "asset": "FLD.049",
     "role": "common field"
    }
   ],
   "catalogue": [
    "K041",
    "K042",
    "K043"
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
   "summary": "The Legal Entity card: a floating card with 3 common fields in a fixed order and 2 kinds that add their own.",
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
     "edits": "Adds the fields FLD.001, FLD.002, FLD.047, FLD.064, FLD.065, FLD.015 to the common fields.",
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
       "asset": "FLD.047",
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
     "edits": "Adds the fields FLD.066, FLD.067, FLD.068 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.066",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.067",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.068",
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
     "asset": "FLD.063",
     "role": "common field"
    },
    {
     "asset": "FLD.017",
     "role": "common field"
    },
    {
     "asset": "FLD.014",
     "role": "common field"
    }
   ],
   "catalogue": [
    "K053",
    "K054"
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
     "edits": "Adds the fields FLD.069, FLD.070, FLD.071, FLD.072 to the common fields.",
     "values": {},
     "requires": [
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
      },
      {
       "asset": "FLD.072",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.ATT.011.002",
     "name": "Add Typeface to Typography & Text Hierarchy",
     "description": "The Add Typeface to Typography & Text Hierarchy kind of the Brand card (no category).",
     "edits": "Adds the fields FLD.073, FLD.070, FLD.072 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.073",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.070",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.072",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.AIT.011.003",
     "name": "Add Image to Brand Images",
     "description": "The Add Image to Brand Images kind of the Brand card (no category).",
     "edits": "Adds the fields FLD.074, FLD.075, FLD.076 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.074",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.075",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.076",
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
     "edits": "Adds the fields FLD.077, FLD.078, FLD.079, FLD.080, FLD.081, FLD.082, FLD.083, FLD.084, FLD.085, FLD.086, FLD.087 to the common fields.",
     "values": {},
     "requires": [
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
      },
      {
       "asset": "FLD.086",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.087",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.ACT.012.002",
     "name": "Add Competitor to Competitors",
     "description": "The Add Competitor to Competitors kind of the Foundation card (no category).",
     "edits": "Adds the fields FLD.088, FLD.089, FLD.090, FLD.091, FLD.092, FLD.093, FLD.094, FLD.095, FLD.096 to the common fields.",
     "values": {},
     "requires": [
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
      }
     ]
    },
    {
     "code": "CRD.AOT.012.003",
     "name": "Add Offering to Offerings",
     "description": "The Add Offering to Offerings kind of the Foundation card (no category).",
     "edits": "Adds the fields FLD.042, FLD.097, FLD.098, FLD.099, FLD.100, FLD.101, FLD.102, FLD.103 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.042",
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
      },
      {
       "asset": "FLD.101",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.102",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.103",
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
   "summary": "The Channel card: a floating card with 1 common fields in a fixed order and 8 kinds that add their own.",
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
     "edits": "Adds the fields FLD.104, FLD.106, FLD.107, FLD.108, FLD.109, FLD.110 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.104",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.106",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.107",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.108",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.109",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.110",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.AST.013.002",
     "name": "Add Subchannel to Website",
     "description": "The Add Subchannel to Website kind of the Channel card (no category).",
     "edits": "Adds the fields FLD.104, FLD.111, FLD.112, FLD.113, FLD.114, FLD.115 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.104",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.111",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.112",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.113",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.114",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.115",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.AAA.013.003",
     "name": "Add Subchannel to Email",
     "description": "The Add Subchannel to Email kind of the Channel card (no category).",
     "edits": "Adds the fields FLD.104, FLD.116, FLD.117, FLD.118, FLD.119, FLD.120 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.104",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.116",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.117",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.118",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.119",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.120",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.AAB.013.004",
     "name": "Add Subchannel to Other",
     "description": "The Add Subchannel to Other kind of the Channel card (no category).",
     "edits": "Adds the fields FLD.121, FLD.122, FLD.123, FLD.124, FLD.125, FLD.126 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.121",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.122",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.123",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.124",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.125",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.126",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.AAC.013.005",
     "name": "Add Subchannel to In Person",
     "description": "The Add Subchannel to In Person kind of the Channel card (no category).",
     "edits": "Adds the fields FLD.104, FLD.127, FLD.128, FLD.129, FLD.130, FLD.131 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.104",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.127",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.128",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.129",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.130",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.131",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.AAD.013.006",
     "name": "Add Subchannel to Direct Payment",
     "description": "The Add Subchannel to Direct Payment kind of the Channel card (no category).",
     "edits": "Adds the fields FLD.104, FLD.132, FLD.133, FLD.134, FLD.135, FLD.136 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.104",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.132",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.133",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.134",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.135",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.136",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.AAE.013.007",
     "name": "Add Subchannel to Online / Live",
     "description": "The Add Subchannel to Online / Live kind of the Channel card (no category).",
     "edits": "Adds the fields FLD.104, FLD.137, FLD.138, FLD.139, FLD.140, FLD.141 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.104",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.137",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.138",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.139",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.140",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.141",
       "role": "field of this kind"
      }
     ]
    },
    {
     "code": "CRD.AAF.013.008",
     "name": "Add Subchannel to File Delivery",
     "description": "The Add Subchannel to File Delivery kind of the Channel card (no category).",
     "edits": "Adds the fields FLD.104, FLD.142, FLD.143, FLD.144, FLD.145, FLD.146 to the common fields.",
     "values": {},
     "requires": [
      {
       "asset": "FLD.104",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.142",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.143",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.144",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.145",
       "role": "field of this kind"
      },
      {
       "asset": "FLD.146",
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
     "asset": "FLD.105",
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
   "code": "CRD.014",
   "name": "other",
   "category": "card",
   "summary": "The other: a floating card with 5 common fields in a fixed order.",
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
     "asset": "FLD.147",
     "role": "common field"
    },
    {
     "asset": "FLD.148",
     "role": "common field"
    },
    {
     "asset": "FLD.088",
     "role": "common field"
    },
    {
     "asset": "FLD.149",
     "role": "common field"
    },
    {
     "asset": "FLD.014",
     "role": "common field"
    }
   ],
   "catalogue": [
    "K069"
   ]
  }
 ]
};
