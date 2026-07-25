
---

### `src/framework/README.md`
```md
# Framework Module

The Framework module interprets the North Stardust Framework Markdown files and turns them into runtime data for the AI Assistant.

It is independent of the user interface and contains no React code.

## Purpose

The module is responsible for understanding the Framework language stored in the Markdown files under `assets/OrganizationalSystems/`.

It converts those Markdown documents into runtime interview data that can be used by the AI Assistant and export flow.

## Responsibilities

The Framework module is responsible for:

- reading Framework Markdown documents;
- interpreting Framework structure;
- validating document structure;
- creating the internal runtime interview model;
- supporting the interview flow;
- supporting document export.

The Framework module is not responsible for:

- capability generation;
- system selection UI;
- React components;
- PDF layout;
- application navigation outside the Framework flow.

## Module Structure

### `framework/interpreter/`

Reads Markdown and converts it into runtime Framework data.

### `framework/interview/`

Contains the runtime interview structures used by the AI Assistant.

### `framework/model/`

Contains the runtime document model.

### `framework/validator/`

Checks that Framework documents conform to the official Framework structure.

### `framework/exporter/`

Exports the completed Framework document to Markdown and other formats.

## Data Flow

```text
Markdown File
      │
      ▼
Framework Interpreter
      │
      ▼
Runtime Interview Model
      │
      ▼
Interview Session
      │
      ▼
Validation
      │
      ▼
Export