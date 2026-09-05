# AGENTS.md — Neon Blackjack

SvelteKit + Svelte 5 (runes) + Tailwind v4 + shadcn-svelte + GSAP. Casino blackjack,
first-person table view. Package manager is **bun** (`bun.lock`, `.npmrc` has
`engine-strict=true`).

## Commands (bun)

```sh
bun run dev        # dev server
bun run format     # prettier --write . — run FIRST, generated ui files use double quotes
bun run lint       # prettier --check . && eslint .
bun run check      # svelte-check (typecheck)
bun run build      # production build
```

Verify order: `format` → `lint` → `check` → `build`. No tests exist in this repo;
verify with `check` + `build` + a `preview` + curl smoke test (expect HTTP 200).

## Architecture

- `src/routes/+page.svelte` — game orchestrator, owns the state machine:
  `betting → insurance → player → dealer → settlement`.
- `src/lib/game/` — pure logic, no UI: `types`, `cards` (6-deck shoe, soft-hand
  valuation), `engine` (rules), `strategy` (basic-strategy hints), `storage`
  (localStorage bankroll/stats/history), `sound` (Web Audio synth, no assets).
- `src/lib/table/` — immersive scene: `TableScene` composes `DealerSpot`,
  `PlayerSpot`, `ChipRail`, `ChipStack`, `StatsDialog`; `chips.ts` (denominations,
  greedy breakdown); `anim.ts` (GSAP Svelte actions: `dealIn`, `popIn`,
  `revealFlip`).
- `src/lib/components/` — `Controls`, `HelpModal`, plus generated `ui/` primitives.
- Rules: dealer stands on all 17, blackjack pays 3:2, split aces get 1 card each,
  **no max bet** (all-in allowed, `MIN_BET = 5` in `storage.ts`).

## Quirks that will bite you

- **No `svelte.config.js`** in this repo (SvelteKit runs via the vite plugin config,
  which also forces runes mode). Don't assume the file exists.
- **shadcn-svelte was installed manually**: the `init` CLI hangs on an interactive
  preset prompt. With `components.json` present, `bun x shadcn-svelte@latest add
<name> -y --skip-preflight` works non-interactively. `components.json` has no
  `$schema` key (editor flags the URL as untrusted — leave it out).
- Generated `ui/` components require `WithElementRef` / `WithoutChildrenOrChild`
  from `$lib/utils.ts` — don't delete those types.
- **Svelte `use:` actions work only on DOM elements, never on components.**
  Wrap shadcn components in a plain `<div use:...>` instead.
- **Portals escape `.dark` wrappers**: bits-ui Dialog/Tooltip/Sonner render into
  `document.body`, so the `dark` class must stay on `<html>` in `src/app.html`
  (with `color-scheme: dark`), not just on a layout div.
- **SSR has no `localStorage`/`window`**: storage helpers guard with
  `typeof localStorage === 'undefined'` and persisted state hydrates inside
  `$effect`; GSAP is only ever touched inside Svelte actions (client-only).
- Icons: `@lucide/svelte` (the `lucide-svelte` package was removed — don't
  reintroduce it).
- `eslint.config.js` disables `svelte/no-navigation-without-resolve` for
  `src/lib/components/ui/**` (generated code) — don't "fix" those files.
- Prettier: tabs, single quotes, no trailing commas, `tailwindStylesheet:
./src/routes/layout.css`. Tailwind v4 theme tokens/keyframes live in `@theme`
  in `layout.css` (plain `@theme`, not `@theme inline`, for fonts/animations).

## Workflow

- Only commit/push when explicitly asked. Commit messages in English,
  conventional style (`feat(table): ...`). Push requires explicit request.
