# North Stardust Studio

A desktop and web app (Tauri 2, React 19, TypeScript, Vite) that interviews the owner of a small organization, one System at a time, and keeps the answers on the user's own device. The Foundation (Identity, Brand, Business and Strategy Systems) is built as pages of tiles that open into cards; the other Systems are interviews drawn from Markdown content in `src/assets/`. Two example organizations are in `src/data/examples/`.

## Run it

- `npm install`, then `npm run dev` (the app at http://localhost:1420; the port is fixed).
- `npm run tauri dev` runs the same frontend in the desktop shell.
- `npm run build` typechecks and builds.

## Check it

- `npx tsc --noEmit`, then `npx vitest run --testTimeout=40000` (the default timeout is too short on a slow machine).
- `npm run tokens:check`, `npm run lint:styles`, `npm run lint:css`, `npm run docs:check`, `npm run tables:check`, `npm run library:check`.
- `npm run check:layout` (with the dev server up): every Foundation page against the layout rulebook.

The full procedure is `docs/ai/toolchain-and-verification-playbook.md`.

## The documents

Everything is in `docs/`; `docs/README.md` indexes it. An assistant starts with `docs/ai/README.md`; the owner starts with `docs/design/05-not-done-yet.md` (what is open) and `docs/design/04-log.md` (what changed).

## Recommended IDE setup

[VS Code](https://code.visualstudio.com/) with [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) and [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).
