# The Claude project for NorthStardust

A Claude project (claude.ai, Projects) for planning and review in chat: the design, the wording of the questions, the documents, the next piece of work. It cannot edit the code or run the app; that stays with Claude Code in this repository.

## Set it up (once)

1. Build the files: `npm run project:kit` (writes `claude-project/knowledge/`, about 400 KB, 19 files).
2. In claude.ai: **Projects > Create project**, name it "NorthStardust".
3. **Set project instructions**: paste the whole of `claude-project/instructions.md`.
4. **Add files**: select every file in `claude-project/knowledge/` (except `instructions.md`, which is already the instructions) and upload them.

## Keep it current

The files are a snapshot. After the documents change, run `npm run project:kit` again and replace the files in the project (delete the old ones first, so no stale copy stays). The repository is always the owner: the instructions tell Claude to say when a file looks stale. The folder `knowledge/` is not committed.

## What is in it, and why

| File | Why |
|---|---|
| `instructions.md` | The standing rules and how to answer (the full rules are `ai-collaboration-rules.md`). |
| `README.md`, `app-index.md`, `app-contents.md`, `glossary.md`, `standard.md` | Where everything is, what the words mean, how a document is written. |
| `01-current-design.md`, `21-shared-components.md`, `tile-and-card-pattern.md`, `code-map.md` | What the app is and the shared parts it is built from. |
| `33` to `40` | The first version, the questions of the Segment, Profile, Organization and Positioning, the help-texts guide and the form of a tile document. |
| `05-not-done-yet.md` | What is open. |

Left out on purpose: `layout-rules.md` (230 KB, for the code work), the lists (doc 34), the generated documents and the research.

To add or drop a file, edit the list in `tools/scripts/docs/build-project-kit.mjs`.
