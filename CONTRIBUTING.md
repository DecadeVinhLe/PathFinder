# Contributing to Pathfinder

Thanks for helping out. Pathfinder is a Crusaders project for Swin-Biz Rockstar, so please keep changes small, tested and easy to review.

## Setup

Install [Node.js](https://nodejs.org/) 18 or higher first (pnpm needs it), then install pnpm: `npm install -g pnpm` (or `corepack enable`). The project has no dependencies, so there is no `pnpm install` step.

## Workflow

1. Create a branch from `main`: `git checkout -b feature/short-description`
2. Make your change and run `pnpm run check`
3. Open the site locally (`pnpm run dev`) and click through the page you touched, in **both** English and Vietnamese
4. Open a pull request and describe what changed and why

## Project rules

### 1. Script order matters

There is no bundler. Every file in `src/js/` is a classic `<script>` that shares one global scope, exactly like the original single-file build. A file can only use things declared in files listed **above** it in `index.html`.

When you add a file, place its `<script>` tag after everything it needs. If you move or rename a file, update `index.html`, then run `pnpm run check`: it fails on missing files, orphan files and syntax errors.

### 2. Where things go

| You are adding… | Put it in… |
| --- | --- |
| A stop, route or district | `src/js/data/` |
| Shared helpers, time or rush-hour logic | `src/js/core/` |
| A new tool or page behaviour | `src/js/features/<name>.js` |
| UI text | `src/js/i18n/` (always add **English and Vietnamese**) |
| Styles | `src/css/`, in the file whose topic fits best |
| Images | `public/images/` |

CSS files load in numeric order and later files override earlier ones. Put overrides in a later file instead of using `!important`.

### 3. Translations

Strings use the format `key|English|Vietnamese`, one per line. Reference them in HTML with `data-i="key"` or in JS with `t('key')`. A missing Vietnamese string silently falls back to English, so always add both.

### 4. Data honesty

Weather fallback, traffic levels, parking, ride-hail prices and the metro line are **sample data**. Do not present them as live. If you plug in a real source, register it through `Pathfinder.register(...)` so the result reports where the data came from.

### 5. Accessibility

Keep controls reachable by keyboard, keep visible focus outlines, and check contrast in both the dark and light theme.

## Commit messages

Short and in the present tense, for example `Add arrive-by hint to Journey form`.
