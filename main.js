/* __  ____ _______     _______ .____ __.____________.__  _____._____
\    \/    X    _  \   _\___   \:    |   \__      __/   \/    /     / x0
:          |    |   \ /    _____|    :    | |    | |          :     | ^67
|    \/    |    |    |     |    |         | |    | |    \/    |     | ^imp!
|    |     :__  :    |     :    |    |    | |    | |    |     |     |_____
|    |_____///\      :      ___/|____|    | |    | |    |_____|_    :    /
|____://///    \\____X_____//// /////:____|  \__/  |____://///  \_______/
/////           ///// /////          /////   ///   /////         /////// */

// md2html enhanced — Obsidian plugin
// Forked from xero/obsidian-md2html (CC0).
// Adds: github-markdown-css wrapping → self-contained GitHub-styled HTML.
//
// Pure JS (no TypeScript build step required). Bundled CSS is inlined as
// a string constant. To rebuild after editing the CSS, see scripts/bundle_css.sh.

const obsidian = require("obsidian");

// GitHub-Markdown CSS v5 — bundled (CC0 from sindresorhus/github-markdown-css).
// To regenerate: ./scripts/bundle_css.sh
const GITHUB_MARKDOWN_CSS = require("./lib/github-markdown.css.js");

// Obsidian-rendered output uses classes (.callout, .markdown-rendered, .internal-link,
// .tag, .image-embed) that github-markdown-css doesn't style. This minimal layer
// makes them look reasonable inside .markdown-body.
const OBSIDIAN_COMPAT_CSS = `
.markdown-body .callout { border-left: 4px solid #888; background: rgba(127,127,127,0.08); padding: 8px 16px; margin: 16px 0; border-radius: 4px; }
.markdown-body .callout-title { display: flex; align-items: center; gap: 6px; font-weight: 600; margin: 0 0 4px 0; }
.markdown-body .callout-content { margin: 0; }
.markdown-body .markdown-rendered pre, .markdown-body .markdown-rendered code { font-size: 0.92em; }
.markdown-body .internal-link { color: inherit; text-decoration: none; }
.markdown-body .internal-link:hover { text-decoration: underline; }
.markdown-body .image-embed, .markdown-body img { max-width: 100%; height: auto; }
.markdown-body .tag { background: rgba(127,127,127,0.18); border-radius: 12px; padding: 0 8px; }
`;

class Md2htmlEnhanced extends obsidian.Plugin {
	clean(s) {
		return s.replace(/display: none/g, "").replace(/--0/g, "color");
	}

	async getRendered() {
		const view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
		let html = "";
		if (view) {
			const last = {
				editor: view.editor.getScrollInfo(),
				preview: view.previewMode.getScroll(),
			};
			let i = 0;
			const cm = view.editor.cm;
			view.previewMode.unfoldAll();
			cm.focus();
			cm.viewState.printing = true;
			cm.measure();
			while (i++ < view.editor.lineCount()) {
				view.editor.scrollTo(0, i * 50);
				view.previewMode.applyScroll(i);
			}
			// small synchronous wait
			const deadline = Date.now() + 50;
			while (Date.now() < deadline) {}
			html = view.contentEl.innerHTML;
			html += view.previewMode.view.contentEl.innerHTML;
			cm.viewState.printing = false;
			cm.measure();
			view.editor.scrollTo(last.editor.left, last.editor.top);
			view.previewMode.applyScroll(last.preview);
			view.previewMode.rerender(true);
		}
		return this.clean(
			'<div class="markdown-reading-view"' +
				html
					.split('<div class="markdown-reading-view"')[1]
					.split('<div class="markdown-source-view')[0],
		);
	}

	async render(md) {
		const comp = new obsidian.Component();
		comp.load();
		const div = createDiv();
		await obsidian.MarkdownRenderer.render(this.app, md, div, "", comp);
		const html = div.innerHTML;
		comp.unload();
		return this.clean(html);
	}

	escapeHtml(s) {
		return s
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}

	buildStandaloneHtml(fragment, title) {
		return `<!DOCTYPE html>
<html lang="en" data-theme="auto">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="generator" content="obsidian-md2html-enhanced (https://github.com/zzeitt/obsidian-md2html-enhanced)">
<title>${this.escapeHtml(title)}</title>
<style>
${GITHUB_MARKDOWN_CSS}
${OBSIDIAN_COMPAT_CSS}
</style>
</head>
<body class="markdown-body">
${fragment}
</body>
</html>`;
	}

	getActiveNoteName() {
		const f = this.app.workspace.getActiveFile();
		return (f && f.basename) || "untitled";
	}

	async onload() {
		// 1) selection → clipboard (fragment only, no wrapping)
		this.addCommand({
			id: "md2html-enhanced-selection",
			name: "copy selection html to clipboard",
			editorCallback: async (editor) => {
				await navigator.clipboard.writeText(
					await this.render(
						editor.getSelection().replace(/```.*/g, "```"),
					),
				);
				new obsidian.Notice(
					"selection html copied to the clipboard",
					3500,
				);
			},
		});

		// 2) note → clipboard (FULL STANDALONE — main feature of this fork)
		this.addCommand({
			id: "md2html-enhanced-clip",
			name: "copy note as standalone html (github-styled)",
			editorCallback: async () => {
				const fragment = await this.getRendered();
				if (fragment === "")
					return new obsidian.Notice("error. no active document", 3500);
				const html = this.buildStandaloneHtml(
					fragment,
					this.getActiveNoteName(),
				);
				await navigator.clipboard.writeText(html);
				new obsidian.Notice(
					"standalone html (github-styled) copied — paste anywhere",
					4000,
				);
			},
		});

		// 3) note → file (FULL STANDALONE — main feature of this fork)
		this.addCommand({
			id: "md2html-enhanced-file",
			name: "export note to .html file (github-styled)",
			editorCallback: async () => {
				const fragment = await this.getRendered();
				if (fragment === "")
					return new obsidian.Notice("error. no active document", 3500);
				const name = this.getActiveNoteName();
				const html = this.buildStandaloneHtml(fragment, name);
				const target = `${name}.html`;
				const existing = this.app.vault.getAbstractFileByPath(target);
				if (existing) {
					await this.app.vault.modify(existing, html);
				} else {
					await this.app.vault.create(target, html);
				}
				new obsidian.Notice(`exported → ${target}`, 4000);
			},
		});

		// 4) note → new .md file (Obsidian-faithful — xero's original behavior)
		this.addCommand({
			id: "md2html-enhanced-obsidian-theme",
			name: "export note to new .md file (html content, obsidian theme)",
			editorCallback: async () => {
				const fragment = await this.getRendered();
				if (fragment === "")
					return new obsidian.Notice("error. no active document", 3500);
				const file =
					"html-" +
					(this.app.workspace.getActiveFile()
						? this.app.workspace.getActiveFile().name
						: "new");
				await this.app.vault.create(file, fragment);
				new obsidian.Notice("document converted to new html file", 3500);
			},
		});

		// 5) help
		this.addCommand({
			id: "md2html-enhanced-help",
			name: "usage & help",
			callback: async () => {
				this.app.setting.open();
				this.app.setting.openTabById("md2html-enhanced");
			},
		});

		this.addSettingTab(new Md2htmlEnhancedSettingTab(this.app, this));
	}

	onunload() {}
}

class Md2htmlEnhancedSettingTab extends obsidian.PluginSettingTab {
	constructor(app, plugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h1", { text: "md2html enhanced" });
		containerEl.createEl("hr");
		containerEl.createEl("h2", { text: "commands" });
		containerEl.createEl("p", {
			text: "open the command palette (⌘P / Ctrl+P) and search 'md2html'. you get:",
		});
		const ul = containerEl.createEl("ul");
		ul.createEl("li", {
			text: "copy note as standalone html (github-styled) — main feature, wraps your note in <div class=\"markdown-body\"> with github-markdown-css inlined. paste into any browser.",
		});
		ul.createEl("li", {
			text: "export note to .html file (github-styled) — same content, saved as {note}.html in vault root.",
		});
		ul.createEl("li", {
			text: "copy selection html to clipboard — fragment only (no wrapping); for pasting into other notes.",
		});
		ul.createEl("li", {
			text: "export note to new .md file (html content, obsidian theme) — original xero behavior, embeds html back into a .md file.",
		});
		ul.createEl("li", {
			text: "usage & help — opens this settings tab.",
		});
		containerEl.createEl("p", {
			text: "tip: bind any of these to a hotkey in Settings → Hotkeys.",
		});
		containerEl.createEl("hr");
		containerEl.createEl("h2", { text: "about" });
		containerEl.createEl("p", {
			text: "fork of xero/obsidian-md2html (CC0). the original forces Obsidian to render the full document and grabs the DOM — that's how callouts/dataview/embeds are preserved. this fork adds github-markdown-css wrapping on top, so the output is a single self-contained .html.",
		});
		containerEl.createEl("p", {
			text: "github: https://github.com/zzeitt/obsidian-md2html-enhanced",
		});
	}
}

module.exports = Md2htmlEnhanced;