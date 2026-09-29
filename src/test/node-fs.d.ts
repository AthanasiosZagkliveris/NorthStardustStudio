/* The one Node API the tests use (see stylesheet.ts): the project
   carries no @types/node, and the app itself never touches Node. */
declare module "node:fs" {
    export function readFileSync(path: URL | string, encoding: "utf8"): string;
}
