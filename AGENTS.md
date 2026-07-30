# md2html enhanced — agent reference

Obsidian plugin. Single-file pure JS, no build step. Fork of
[xero/obsidian-md2html](https://github.com/xero/obsidian-md2html) (CC0).

## Distribution

- BRAT install via GitHub Releases API (NOT release branch)
- Each release attaches `main.js` + `manifest.json` + optional `styles.css` as assets
- Tag format: exact match to `manifest.version` (no leading `v` — but BRAT coerces both)

## File layout

| File | Purpose |
|------|---------|
| `main.js` | Plugin code (plain JS, `module.exports = Md2htmlEnhanced`) |
| `manifest.json` | Obsidian plugin metadata — required fields: `id`, `name`, `version`, `minAppVersion`, `description`, `author` |
| `versions.json` | Maps plugin version → minimum Obsidian version. Required for community store; optional for BRAT. |
| `lib/github-markdown.css.js` | Bundled github-markdown-css v5 as CommonJS string export |
| `styles.css` | Empty placeholder for plugin-UI styling (we don't need any) |
| `scripts/bundle_css.sh` | Regenerate the bundled CSS from upstream jsDelivr |
| `LICENSE` | CC0-1.0 |
| `AGENTS.md` | This file |

## Commands (registered in onload)

1. `copy note as standalone html (github-styled)` — **main feature**, wraps note in `<div class="markdown-body">` with bundled CSS inlined, copies full HTML to clipboard
2. `export note to .html file (github-styled)` — same content, saved as `{note}.html` in vault root
3. `copy selection html to clipboard` — fragment only, no wrapping
4. `export note to new .md file (html content, obsidian theme)` — original xero behavior, embeds HTML back into a `.md` file
5. `usage & help` — opens settings tab

## Don't manually combine CSS files

If user wants different look, pass `--style custom.css` (not a feature of this plugin — apply before this plugin runs). Inside the plugin's wrapping logic, do NOT hand-edit the bundled CSS — bundle the new file via `./scripts/bundle_css.sh` instead.

## Plugin ID rules (Obsidian)

- `manifest.id` MUST match the folder name in vault: `.obsidian/plugins/{id}/`
- ID is stable API — never change after first release
- ID format: lowercase, alphanumeric, hyphens only

## Release workflow (this repo)

```bash
# 1. commit changes to main
git add -A && git commit -m "..."

# 2. tag (must match manifest.json version exactly, no leading v for canonical Obsidian pattern)
git tag -a 0.1.1 -m "v0.1.1"
git push origin 0.1.1

# 3. create GitHub Release with assets
gh release create 0.1.1 \
  --title "0.1.1" \
  --draft \
  main.js manifest.json styles.css
# Then publish from GitHub UI.
```

## What this plugin deliberately does NOT do

- No `npm install` / `npm run build` — pure JS only, ships pre-compiled
- No source TypeScript files — we write plain JS to avoid iSH limitations
- No CI / GitHub Actions for release — the workflow above is manual; can be automated later with `.github/workflows/release.yml` (matching obsidianmd/obsidian-sample-plugin)
- No community plugin store submission — BRAT distribution only