# perfume-web

Next.js app using Next.js 16.2.9, React 19, TypeScript, App Router, Tailwind CSS 4, ESLint, and pnpm.

## Commands

- Install dependencies with `pnpm install`.
- Start development with `pnpm dev`.
- Build production output with `pnpm build`.
- Start a production build with `pnpm start`.
- Lint with `pnpm lint`.

## Project Notes

- Use `pnpm` only. Do not add `package-lock.json` or use npm/yarn for dependency changes.
- App Router files live under `src/app`.
- Keep route UI and colocated route code inside `src/app` unless shared across routes.
- Use TypeScript for application code.
- Keep Tailwind CSS v4 conventions; global styles are in `src/app/globals.css`.
- `pnpm-workspace.yaml` approves the `sharp` and `unrs-resolver` build scripts needed by the current dependency tree.

## Verification

Before handing off web changes, run:

```bash
pnpm lint
pnpm build
```
