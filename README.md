# md2html enhanced

Fork of [xero/obsidian-md2html](https://github.com/xero/obsidian-md2html) (CC0) that exports Obsidian notes as **self-contained, GitHub-styled standalone HTML**.

The original forces Obsidian's own renderer to draw the full preview, then grabs the DOM — so callouts, dataview, embeds, and every plugin's syntax are preserved exactly as they appear in the editor. This fork adds **github-markdown-css wrapping** on top, so the output is a single `.html` file you can drop into any browser (or attach to email, push to a static site, etc.) and it looks like GitHub markdown — including automatic dark mode.

## Install (via BRAT)

In Obsidian:

1. Install **BRAT** (obsidian42/obsidian42-brat) from Community Plugins if you don't have it.
2. Open BRAT → "Add Beta Plugin" → paste `https://github.com/zzeitt/obsidian-md2html-enhanced`
3. Enable "md2html enhanced" in Settings → Community Plugins.
4. Done — restart once if BRAT asks.

BRAT installs from **GitHub Releases** (not from a branch). Each release on this repo has `main.js` and `manifest.json` attached as release assets, which BRAT fetches via the GitHub Releases API.

## Release workflow

When cutting a new version:

```bash
git tag v0.1.0                              # tag the commit
git push origin v0.1.0                     # push tag
gh release create v0.1.0 \
  main.js manifest.json \
  --title "v0.1.0" \
  --notes "Initial release"                # create release with assets
```

Or via the GitHub UI: Releases → Draft a new release → choose the tag → upload `main.js` and `manifest.json` from `main` branch.

## Usage

Open the command palette (`⌘P` / `Ctrl+P`) and search `md2html`. You get:

| Command | What it does |
|---------|--------------|
| **copy note as standalone html (github-styled)** | Main feature — wraps your note in `<div class="markdown-body">` with github-markdown-css **inlined** (zero external dependencies). Pastes full HTML into clipboard. |
| **export note to .html file (github-styled)** | Same content, saved as `{note}.html` in your vault root. Overwrites if file exists. |
| **copy selection html to clipboard** | Fragment only (no wrapping). For pasting into other Obsidian notes. |
| **export note to new .md file (html content, obsidian theme)** | Original xero behavior — embeds html back into a `.md` file (`html-{note}.md`). Useful if you want the Obsidian theme to render it. |
| **usage & help** | Opens this settings tab. |

Bind any of these to a hotkey in **Settings → Hotkeys**.

## Output format

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My Note</title>
  <style>/* github-markdown-css v5 — inlined (~31KB) */</style>
  <style>/* Obsidian compat (callouts, internal links) */</style>
</head>
<body class="markdown-body">
  <!-- your note's rendered DOM, with callouts/dataview/embeds preserved -->
</body>
</html>
```

The output is **single-file self-contained** — works offline, works in custom URL schemes (`minis://`, `obsidian://`), attaches cleanly to email. Dark mode follows the viewer's OS preference (`prefers-color-scheme: dark`) automatically.

## Why fork?

The original `xero/obsidian-md2html` outputs an HTML **fragment** with no styling — only useful when embedded in a page that already has its own CSS (e.g., another Obsidian theme). For sharing notes with non-Obsidian users, you want a self-contained, readable file — hence this fork.

## Architecture: pure JS, no build step

Unlike most Obsidian plugins (which ship TypeScript and require `npm run build`), this one ships **plain JavaScript** with the CSS bundled as a JS string constant. This means:

- ✅ No `node_modules`, no `npm install`, no build step
- ✅ Anyone can read and modify the source without TypeScript knowledge
- ✅ BRAT installs directly from the repo without anything fancy

Trade-off: the bundled CSS is committed as a 29KB `.js` file rather than generated at build time. Regenerate via `./scripts/bundle_css.sh` after CSS upstream updates.

## Files

```
.
├── main.js                    # Plugin code (plain JS, no build step)
├── lib/
│   └── github-markdown.css.js # Bundled CSS as a CommonJS string export
├── scripts/
│   └── bundle_css.sh          # Helper: re-fetch + rebuild the bundled CSS
├── manifest.json              # Obsidian plugin manifest
└── README.md
```

## License

CC0 (kopimi). Do whatever you like with this. Credit to xero for the original `getRendered()` logic.