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
// Pure JS, single file. CSS is inlined as a string constant (no require,
// no separate lib/ folder, no asset pipeline). To refresh after CSS upstream
// updates, see scripts/bundle_css.sh.

const obsidian = require("obsidian");

// GitHub-Markdown CSS v5 — bundled (CC0 from sindresorhus/github-markdown-css).
// To regenerate from upstream:
//   1. curl -s https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown.css
//   2. paste into the GITHUB_MARKDOWN_CSS template literal below (escape ` and ${).
// Or run scripts/bundle_css.sh to regenerate automatically.
const GITHUB_MARKDOWN_CSS = `.markdown-body { --base-size-16: 1rem; --base-size-24: 1.5rem; --base-size-4: 0.25rem; --base-size-40: 2.5rem; --base-size-8: 0.5rem; --base-text-weight-medium: 500; --base-text-weight-normal: 400; --base-text-weight-semibold: 600; --fontStack-monospace: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace; --fontStack-sansSerif: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"; --fgColor-accent: Highlight; } @media (prefers-color-scheme: dark) { .markdown-body, [data-theme="dark"] { color-scheme: dark; --fgColor-accent: #4493f8; --bgColor-attention-muted: #bb800926; --bgColor-default: #0d1117; --bgColor-muted: #151b23; --bgColor-neutral-muted: #656c7633; --borderColor-accent-emphasis: #1f6feb; --borderColor-attention-emphasis: #9e6a03; --borderColor-danger-emphasis: #da3633; --borderColor-default: #3d444d; --borderColor-done-emphasis: #8957e5; --borderColor-success-emphasis: #238636; --color-prettylights-syntax-brackethighlighter-angle: #9198a1; --color-prettylights-syntax-brackethighlighter-unmatched: #f85149; --color-prettylights-syntax-carriage-return-bg: #b62324; --color-prettylights-syntax-carriage-return-text: #f0f6fc; --color-prettylights-syntax-comment: #9198a1; --color-prettylights-syntax-constant: #79c0ff; --color-prettylights-syntax-constant-other-reference-link: #a5d6ff; --color-prettylights-syntax-entity: #d2a8ff; --color-prettylights-syntax-entity-tag: #7ee787; --color-prettylights-syntax-keyword: #ff7b72; --color-prettylights-syntax-markup-bold: #f0f6fc; --color-prettylights-syntax-markup-changed-bg: #5a1e02; --color-prettylights-syntax-markup-changed-text: #ffdfb6; --color-prettylights-syntax-markup-deleted-bg: #67060c; --color-prettylights-syntax-markup-deleted-text: #ffdcd7; --color-prettylights-syntax-markup-heading: #1f6feb; --color-prettylights-syntax-markup-ignored-bg: #1158c7; --color-prettylights-syntax-markup-ignored-text: #f0f6fc; --color-prettylights-syntax-markup-inserted-bg: #033a16; --color-prettylights-syntax-markup-inserted-text: #aff5b4; --color-prettylights-syntax-markup-italic: #f0f6fc; --color-prettylights-syntax-markup-list: #f2cc60; --color-prettylights-syntax-meta-diff-range: #d2a8ff; --color-prettylights-syntax-storage-modifier-import: #f0f6fc; --color-prettylights-syntax-string: #a5d6ff; --color-prettylights-syntax-string-regexp: #7ee787; --color-prettylights-syntax-sublimelinter-gutter-mark: #3d444d; --color-prettylights-syntax-variable: #ffa657; --fgColor-attention: #d29922; --fgColor-danger: #f85149; --fgColor-default: #f0f6fc; --fgColor-done: #ab7df8; --fgColor-muted: #9198a1; --fgColor-success: #3fb950; --borderColor-muted: #3d444db3; --color-prettylights-syntax-invalid-illegal-bg: var(--bgColor-danger-muted); --color-prettylights-syntax-invalid-illegal-text: var(--fgColor-danger); --focus-outlineColor: var(--borderColor-accent-emphasis); --borderColor-neutral-muted: var(--borderColor-muted); } } @media (prefers-color-scheme: light) { .markdown-body, [data-theme="light"] { color-scheme: light; --fgColor-danger: #d1242f; --bgColor-attention-muted: #fff8c5; --bgColor-muted: #f6f8fa; --bgColor-neutral-muted: #818b981f; --borderColor-accent-emphasis: #0969da; --borderColor-attention-emphasis: #9a6700; --borderColor-danger-emphasis: #cf222e; --borderColor-default: #d1d9e0; --borderColor-done-emphasis: #8250df; --borderColor-success-emphasis: #1a7f37; --color-prettylights-syntax-brackethighlighter-angle: #59636e; --color-prettylights-syntax-brackethighlighter-unmatched: #82071e; --color-prettylights-syntax-carriage-return-bg: #cf222e; --color-prettylights-syntax-carriage-return-text: #f6f8fa; --color-prettylights-syntax-comment: #59636e; --color-prettylights-syntax-constant: #0550ae; --color-prettylights-syntax-constant-other-reference-link: #0a3069; --color-prettylights-syntax-entity: #6639ba; --color-prettylights-syntax-entity-tag: #0550ae; --color-prettylights-syntax-invalid-illegal-text: var(--fgColor-danger); --color-prettylights-syntax-keyword: #cf222e; --color-prettylights-syntax-markup-changed-bg: #ffd8b5; --color-prettylights-syntax-markup-changed-text: #953800; --color-prettylights-syntax-markup-deleted-bg: #ffebe9; --color-prettylights-syntax-markup-deleted-text: #82071e; --color-prettylights-syntax-markup-heading: #0550ae; --color-prettylights-syntax-markup-ignored-bg: #0550ae; --color-prettylights-syntax-markup-ignored-text: #d1d9e0; --color-prettylights-syntax-markup-inserted-bg: #dafbe1; --color-prettylights-syntax-markup-inserted-text: #116329; --color-prettylights-syntax-markup-list: #3b2300; --color-prettylights-syntax-meta-diff-range: #8250df; --color-prettylights-syntax-string: #0a3069; --color-prettylights-syntax-string-regexp: #116329; --color-prettylights-syntax-sublimelinter-gutter-mark: #818b98; --color-prettylights-syntax-variable: #953800; --fgColor-accent: #0969da; --fgColor-attention: #9a6700; --fgColor-done: #8250df; --fgColor-muted: #59636e; --fgColor-success: #1a7f37; --bgColor-default: #ffffff; --borderColor-muted: #d1d9e0b3; --color-prettylights-syntax-invalid-illegal-bg: var(--bgColor-danger-muted); --color-prettylights-syntax-markup-bold: #1f2328; --color-prettylights-syntax-markup-italic: #1f2328; --color-prettylights-syntax-storage-modifier-import: #1f2328; --fgColor-default: #1f2328; --focus-outlineColor: var(--borderColor-accent-emphasis); --borderColor-neutral-muted: var(--borderColor-muted); } } .markdown-body { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; margin: 0; font-weight: var(--base-text-weight-normal, 400); color: var(--fgColor-default); background-color: var(--bgColor-default); font-family: var(--fontStack-sansSerif, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"); font-size: 16px; line-height: 1.5; word-wrap: break-word; } .markdown-body a { text-decoration: underline; text-underline-offset: .2rem; } .markdown-body .octicon { display: inline-block; fill: currentColor; vertical-align: text-bottom; } .markdown-body h1:hover .anchor .octicon-link:before, .markdown-body h2:hover .anchor .octicon-link:before, .markdown-body h3:hover .anchor .octicon-link:before, .markdown-body h4:hover .anchor .octicon-link:before, .markdown-body h5:hover .anchor .octicon-link:before, .markdown-body h6:hover .anchor .octicon-link:before { width: 16px; height: 16px; content: ' '; display: inline-block; background-color: currentColor; -webkit-mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' aria-hidden='true'><path fill-rule='evenodd' d='M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'></path></svg>"); mask-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' aria-hidden='true'><path fill-rule='evenodd' d='M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'></path></svg>"); } .markdown-body details, .markdown-body figcaption, .markdown-body figure { display: block; } .markdown-body summary { display: list-item; } .markdown-body [hidden] { display: none !important; } .markdown-body a { background-color: rgba(0,0,0,0); color: var(--fgColor-accent); text-decoration: none; } .markdown-body abbr[title] { border-bottom: none; -webkit-text-decoration: underline dotted; text-decoration: underline dotted; } .markdown-body b, .markdown-body strong { font-weight: var(--base-text-weight-semibold, 600); } .markdown-body dfn { font-style: italic; } .markdown-body h1 { margin: .67em 0; font-weight: var(--base-text-weight-semibold, 600); padding-bottom: .3em; font-size: 2em; border-bottom: 1px solid var(--borderColor-muted); } .markdown-body mark { background-color: var(--bgColor-attention-muted); color: var(--fgColor-default); } .markdown-body small { font-size: 90%; } .markdown-body sub, .markdown-body sup { font-size: 75%; line-height: 0; position: relative; vertical-align: baseline; } .markdown-body sub { bottom: -0.25em; } .markdown-body sup { top: -0.5em; } .markdown-body img { border-style: none; max-width: 100%; box-sizing: content-box; } .markdown-body code, .markdown-body kbd, .markdown-body pre, .markdown-body samp { font-family: monospace; font-size: 1em; } .markdown-body figure { margin: 1em var(--base-size-40); } .markdown-body hr { box-sizing: content-box; overflow: hidden; background: rgba(0,0,0,0); border-bottom: 1px solid var(--borderColor-muted); height: .25em; padding: 0; margin: var(--base-size-24) 0; background-color: var(--borderColor-default); border: 0; } .markdown-body input { font: inherit; margin: 0; overflow: visible; font-family: inherit; font-size: inherit; line-height: inherit; } .markdown-body [type=button], .markdown-body [type=reset], .markdown-body [type=submit] { -webkit-appearance: button; appearance: button; } .markdown-body [type=checkbox], .markdown-body [type=radio] { box-sizing: border-box; padding: 0; } .markdown-body [type=number]::-webkit-inner-spin-button, .markdown-body [type=number]::-webkit-outer-spin-button { height: auto; } .markdown-body [type=search]::-webkit-search-cancel-button, .markdown-body [type=search]::-webkit-search-decoration { -webkit-appearance: none; appearance: none; } .markdown-body ::-webkit-input-placeholder { color: inherit; opacity: .54; } .markdown-body ::-webkit-file-upload-button { -webkit-appearance: button; appearance: button; font: inherit; } .markdown-body a:hover { text-decoration: underline; } .markdown-body ::placeholder { color: var(--fgColor-muted); opacity: 1; } .markdown-body hr::before { display: table; content: ""; } .markdown-body hr::after { display: table; clear: both; content: ""; } .markdown-body table { border-spacing: 0; border-collapse: collapse; display: block; width: max-content; max-width: 100%; overflow: auto; font-variant: tabular-nums; } .markdown-body td, .markdown-body th { padding: 0; } .markdown-body details summary { cursor: pointer; } .markdown-body a:focus, .markdown-body [role=button]:focus, .markdown-body input[type=radio]:focus, .markdown-body input[type=checkbox]:focus { outline: 2px solid var(--focus-outlineColor); outline-offset: -2px; box-shadow: none; } .markdown-body a:focus:not(:focus-visible), .markdown-body [role=button]:focus:not(:focus-visible), .markdown-body input[type=radio]:focus:not(:focus-visible), .markdown-body input[type=checkbox]:focus:not(:focus-visible) { outline: solid 1px rgba(0,0,0,0); } .markdown-body a:focus-visible, .markdown-body [role=button]:focus-visible, .markdown-body input[type=radio]:focus-visible, .markdown-body input[type=checkbox]:focus-visible { outline: 2px solid var(--focus-outlineColor); outline-offset: -2px; box-shadow: none; } .markdown-body a:not([class]):focus, .markdown-body a:not([class]):focus-visible, .markdown-body input[type=radio]:focus, .markdown-body input[type=radio]:focus-visible, .markdown-body input[type=checkbox]:focus, .markdown-body input[type=checkbox]:focus-visible { outline-offset: 0; } .markdown-body kbd { display: inline-block; padding: var(--base-size-4); font: 11px var(--fontStack-monospace, ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace); line-height: 10px; color: var(--fgColor-default); vertical-align: middle; background-color: var(--bgColor-muted); border: solid 1px var(--borderColor-neutral-muted); border-bottom-color: var(--borderColor-neutral-muted); border-radius: 6px; box-shadow: inset 0 -1px 0 var(--borderColor-neutral-muted); } .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 { margin-top: var(--base-size-24); margin-bottom: var(--base-size-16); font-weight: var(--base-text-weight-semibold, 600); line-height: 1.25; } .markdown-body h2 { font-weight: var(--base-text-weight-semibold, 600); padding-bottom: .3em; font-size: 1.5em; border-bottom: 1px solid var(--borderColor-muted); } .markdown-body h3 { font-weight: var(--base-text-weight-semibold, 600); font-size: 1.25em; } .markdown-body h4 { font-weight: var(--base-text-weight-semibold, 600); font-size: 1em; } .markdown-body h5 { font-weight: var(--base-text-weight-semibold, 600); font-size: .875em; } .markdown-body h6 { font-weight: var(--base-text-weight-semibold, 600); font-size: .85em; color: var(--fgColor-muted); } .markdown-body p { margin-top: 0; margin-bottom: 10px; } .markdown-body blockquote { margin: 0; padding: 0 1em; color: var(--fgColor-muted); border-left: .25em solid var(--borderColor-default); } .markdown-body ul, .markdown-body ol { margin-top: 0; margin-bottom: 0; padding-left: 2em; } .markdown-body ol ol, .markdown-body ul ol { list-style-type: lower-roman; } .markdown-body ul ul ol, .markdown-body ul ol ol, .markdown-body ol ul ol, .markdown-body ol ol ol { list-style-type: lower-alpha; } .markdown-body dd { margin-left: 0; } .markdown-body tt, .markdown-body code, .markdown-body samp { font-family: var(--fontStack-monospace, ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace); font-size: 12px; } .markdown-body pre { margin-top: 0; margin-bottom: 0; font-family: var(--fontStack-monospace, ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace); font-size: 12px; word-wrap: normal; } .markdown-body .octicon { display: inline-block; overflow: visible !important; vertical-align: text-bottom; fill: currentColor; } .markdown-body input::-webkit-outer-spin-button, .markdown-body input::-webkit-inner-spin-button { margin: 0; appearance: none; } .markdown-body .mr-2 { margin-right: var(--base-size-8, 8px) !important; } .markdown-body::before { display: table; content: ""; } .markdown-body::after { display: table; clear: both; content: ""; } .markdown-body>*:first-child { margin-top: 0 !important; } .markdown-body>*:last-child { margin-bottom: 0 !important; } .markdown-body a:not([href]) { color: inherit; text-decoration: none; } .markdown-body .absent { color: var(--fgColor-danger); } .markdown-body .anchor { float: left; padding-right: var(--base-size-4); margin-left: -20px; line-height: 1; } .markdown-body .anchor:focus { outline: none; } .markdown-body p, .markdown-body blockquote, .markdown-body ul, .markdown-body ol, .markdown-body dl, .markdown-body table, .markdown-body pre, .markdown-body details { margin-top: 0; margin-bottom: var(--base-size-16); } .markdown-body blockquote>:first-child { margin-top: 0; } .markdown-body blockquote>:last-child { margin-bottom: 0; } .markdown-body h1 .octicon-link, .markdown-body h2 .octicon-link, .markdown-body h3 .octicon-link, .markdown-body h4 .octicon-link, .markdown-body h5 .octicon-link, .markdown-body h6 .octicon-link { color: var(--fgColor-default); vertical-align: middle; visibility: hidden; } .markdown-body h1:hover .anchor, .markdown-body h2:hover .anchor, .markdown-body h3:hover .anchor, .markdown-body h4:hover .anchor, .markdown-body h5:hover .anchor, .markdown-body h6:hover .anchor { text-decoration: none; } .markdown-body h1:hover .anchor .octicon-link, .markdown-body h2:hover .anchor .octicon-link, .markdown-body h3:hover .anchor .octicon-link, .markdown-body h4:hover .anchor .octicon-link, .markdown-body h5:hover .anchor .octicon-link, .markdown-body h6:hover .anchor .octicon-link { visibility: visible; } .markdown-body h1 tt, .markdown-body h1 code, .markdown-body h2 tt, .markdown-body h2 code, .markdown-body h3 tt, .markdown-body h3 code, .markdown-body h4 tt, .markdown-body h4 code, .markdown-body h5 tt, .markdown-body h5 code, .markdown-body h6 tt, .markdown-body h6 code { padding: 0 .2em; font-size: inherit; } .markdown-body summary h1, .markdown-body summary h2, .markdown-body summary h3, .markdown-body summary h4, .markdown-body summary h5, .markdown-body summary h6 { display: inline-block; } .markdown-body summary h1 .anchor, .markdown-body summary h2 .anchor, .markdown-body summary h3 .anchor, .markdown-body summary h4 .anchor, .markdown-body summary h5 .anchor, .markdown-body summary h6 .anchor { margin-left: -40px; } .markdown-body summary h1, .markdown-body summary h2 { padding-bottom: 0; border-bottom: 0; } .markdown-body ul.no-list, .markdown-body ol.no-list { padding: 0; list-style-type: none; } .markdown-body ol[type="a s"] { list-style-type: lower-alpha; } .markdown-body ol[type="A s"] { list-style-type: upper-alpha; } .markdown-body ol[type="i s"] { list-style-type: lower-roman; } .markdown-body ol[type="I s"] { list-style-type: upper-roman; } .markdown-body ol[type="1"] { list-style-type: decimal; } .markdown-body div>ol:not([type]) { list-style-type: decimal; } .markdown-body ul ul, .markdown-body ul ol, .markdown-body ol ol, .markdown-body ol ul { margin-top: 0; margin-bottom: 0; } .markdown-body li>p { margin-top: var(--base-size-16); } .markdown-body li+li { margin-top: .25em; } .markdown-body dl { padding: 0; } .markdown-body dl dt { padding: 0; margin-top: var(--base-size-16); font-size: 1em; font-style: italic; font-weight: var(--base-text-weight-semibold, 600); } .markdown-body dl dd { padding: 0 var(--base-size-16); margin-bottom: var(--base-size-16); } .markdown-body table th { font-weight: var(--base-text-weight-semibold, 600); } .markdown-body table th, .markdown-body table td { padding: 6px 13px; border: 1px solid var(--borderColor-default); } .markdown-body table td>:last-child { margin-bottom: 0; } .markdown-body table tr { background-color: var(--bgColor-default); border-top: 1px solid var(--borderColor-muted); } .markdown-body table tr:nth-child(2n) { background-color: var(--bgColor-muted); } .markdown-body table img { background-color: rgba(0,0,0,0); } .markdown-body img[align=right] { padding-left: 20px; } .markdown-body img[align=left] { padding-right: 20px; } .markdown-body .emoji { max-width: none; vertical-align: text-top; background-color: rgba(0,0,0,0); } .markdown-body span.frame { display: block; overflow: hidden; } .markdown-body span.frame>span { display: block; float: left; width: auto; padding: 7px; margin: 13px 0 0; overflow: hidden; border: 1px solid var(--borderColor-default); } .markdown-body span.frame span img { display: block; float: left; } .markdown-body span.frame span span { display: block; padding: 5px 0 0; clear: both; color: var(--fgColor-default); } .markdown-body span.align-center { display: block; overflow: hidden; clear: both; } .markdown-body span.align-center>span { display: block; margin: 13px auto 0; overflow: hidden; text-align: center; } .markdown-body span.align-center span img { margin: 0 auto; text-align: center; } .markdown-body span.align-right { display: block; overflow: hidden; clear: both; } .markdown-body span.align-right>span { display: block; margin: 13px 0 0; overflow: hidden; text-align: right; } .markdown-body span.align-right span img { margin: 0; text-align: right; } .markdown-body span.float-left { display: block; float: left; margin-right: 13px; overflow: hidden; } .markdown-body span.float-left span { margin: 13px 0 0; } .markdown-body span.float-right { display: block; float: right; margin-left: 13px; overflow: hidden; } .markdown-body span.float-right>span { display: block; margin: 13px auto 0; overflow: hidden; text-align: right; } .markdown-body code, .markdown-body tt { padding: .2em .4em; margin: 0; font-size: 85%; white-space: break-spaces; background-color: var(--bgColor-neutral-muted); border-radius: 6px; } .markdown-body code br, .markdown-body tt br { display: none; } .markdown-body del code { text-decoration: inherit; } .markdown-body samp { font-size: 85%; } .markdown-body pre code { font-size: 100%; } .markdown-body pre>code { padding: 0; margin: 0; word-break: normal; white-space: pre; background: rgba(0,0,0,0); border: 0; } .markdown-body .highlight { margin-bottom: var(--base-size-16); } .markdown-body .highlight pre { margin-bottom: 0; word-break: normal; } .markdown-body .highlight pre, .markdown-body pre { padding: var(--base-size-16); overflow: auto; font-size: 85%; line-height: 1.45; color: var(--fgColor-default); background-color: var(--bgColor-muted); border-radius: 6px; } .markdown-body pre code, .markdown-body pre tt { display: inline; padding: 0; margin: 0; overflow: visible; line-height: inherit; word-wrap: normal; background-color: rgba(0,0,0,0); border: 0; } .markdown-body .csv-data td, .markdown-body .csv-data th { padding: 5px; overflow: hidden; font-size: 12px; line-height: 1; text-align: left; white-space: nowrap; } .markdown-body .csv-data .blob-num { padding: 10px var(--base-size-8) 9px; text-align: right; background: var(--bgColor-default); border: 0; } .markdown-body .csv-data tr { border-top: 0; } .markdown-body .csv-data th { font-weight: var(--base-text-weight-semibold, 600); background: var(--bgColor-muted); border-top: 0; } .markdown-body [data-footnote-ref]::before { content: "["; } .markdown-body [data-footnote-ref]::after { content: "]"; } .markdown-body .footnotes { font-size: 12px; color: var(--fgColor-muted); border-top: 1px solid var(--borderColor-default); } .markdown-body .footnotes ol { padding-left: var(--base-size-16); } .markdown-body .footnotes ol ul { display: inline-block; padding-left: var(--base-size-16); margin-top: var(--base-size-16); } .markdown-body .footnotes li { position: relative; } .markdown-body .footnotes li:target::before { position: absolute; top: calc(var(--base-size-8)*-1); right: calc(var(--base-size-8)*-1); bottom: calc(var(--base-size-8)*-1); left: calc(var(--base-size-24)*-1); pointer-events: none; content: ""; border: 2px solid var(--borderColor-accent-emphasis); border-radius: 6px; } .markdown-body .footnotes li:target { color: var(--fgColor-default); } .markdown-body .footnotes .data-footnote-backref g-emoji { font-family: monospace; } .markdown-body .pl-c { color: var(--color-prettylights-syntax-comment); } .markdown-body .pl-c1, .markdown-body .pl-s .pl-v { color: var(--color-prettylights-syntax-constant); } .markdown-body .pl-e, .markdown-body .pl-en { color: var(--color-prettylights-syntax-entity); } .markdown-body .pl-smi, .markdown-body .pl-s .pl-s1 { color: var(--color-prettylights-syntax-storage-modifier-import); } .markdown-body .pl-ent { color: var(--color-prettylights-syntax-entity-tag); } .markdown-body .pl-k { color: var(--color-prettylights-syntax-keyword); } .markdown-body .pl-s, .markdown-body .pl-pds, .markdown-body .pl-s .pl-pse .pl-s1, .markdown-body .pl-sr, .markdown-body .pl-sr .pl-cce, .markdown-body .pl-sr .pl-sre, .markdown-body .pl-sr .pl-sra { color: var(--color-prettylights-syntax-string); } .markdown-body .pl-v, .markdown-body .pl-smw { color: var(--color-prettylights-syntax-variable); } .markdown-body .pl-bu { color: var(--color-prettylights-syntax-brackethighlighter-unmatched); } .markdown-body .pl-ii { color: var(--color-prettylights-syntax-invalid-illegal-text); background-color: var(--color-prettylights-syntax-invalid-illegal-bg); } .markdown-body .pl-c2 { color: var(--color-prettylights-syntax-carriage-return-text); background-color: var(--color-prettylights-syntax-carriage-return-bg); } .markdown-body .pl-sr .pl-cce { font-weight: bold; color: var(--color-prettylights-syntax-string-regexp); } .markdown-body .pl-ml { color: var(--color-prettylights-syntax-markup-list); } .markdown-body .pl-mh, .markdown-body .pl-mh .pl-en, .markdown-body .pl-ms { font-weight: bold; color: var(--color-prettylights-syntax-markup-heading); } .markdown-body .pl-mi { font-style: italic; color: var(--color-prettylights-syntax-markup-italic); } .markdown-body .pl-mb { font-weight: bold; color: var(--color-prettylights-syntax-markup-bold); } .markdown-body .pl-md { color: var(--color-prettylights-syntax-markup-deleted-text); background-color: var(--color-prettylights-syntax-markup-deleted-bg); } .markdown-body .pl-mi1 { color: var(--color-prettylights-syntax-markup-inserted-text); background-color: var(--color-prettylights-syntax-markup-inserted-bg); } .markdown-body .pl-mc { color: var(--color-prettylights-syntax-markup-changed-text); background-color: var(--color-prettylights-syntax-markup-changed-bg); } .markdown-body .pl-mi2 { color: var(--color-prettylights-syntax-markup-ignored-text); background-color: var(--color-prettylights-syntax-markup-ignored-bg); } .markdown-body .pl-mdr { font-weight: bold; color: var(--color-prettylights-syntax-meta-diff-range); } .markdown-body .pl-ba { color: var(--color-prettylights-syntax-brackethighlighter-angle); } .markdown-body .pl-sg { color: var(--color-prettylights-syntax-sublimelinter-gutter-mark); } .markdown-body .pl-corl { text-decoration: underline; color: var(--color-prettylights-syntax-constant-other-reference-link); } .markdown-body [role=button]:focus:not(:focus-visible), .markdown-body [role=tabpanel][tabindex="0"]:focus:not(:focus-visible), .markdown-body button:focus:not(:focus-visible), .markdown-body summary:focus:not(:focus-visible), .markdown-body a:focus:not(:focus-visible) { outline: none; box-shadow: none; } .markdown-body [tabindex="0"]:focus:not(:focus-visible), .markdown-body details-dialog:focus:not(:focus-visible) { outline: none; } .markdown-body g-emoji { display: inline-block; min-width: 1ch; font-family: "Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"; font-size: 1em; font-style: normal !important; font-weight: var(--base-text-weight-normal, 400); line-height: 1; vertical-align: -0.075em; } .markdown-body g-emoji img { width: 1em; height: 1em; } .markdown-body a:has(>p,>div,>pre,>blockquote) { display: block; } .markdown-body a:has(>p,>div,>pre,>blockquote):not(:has(.snippet-clipboard-content,>pre)) { width: fit-content; } .markdown-body a:has(>p,>div,>pre,>blockquote):has(.snippet-clipboard-content,>pre):focus-visible { outline: 2px solid var(--focus-outlineColor); outline-offset: 2px; } .markdown-body .task-list-item { list-style-type: none; } .markdown-body .task-list-item label { font-weight: var(--base-text-weight-normal, 400); } .markdown-body .task-list-item.enabled label { cursor: pointer; } .markdown-body .task-list-item+.task-list-item { margin-top: var(--base-size-4); } .markdown-body .task-list-item .handle { display: none; } .markdown-body .task-list-item-checkbox { margin: 0 .2em .25em -1.4em; vertical-align: middle; } .markdown-body ul:dir(rtl) .task-list-item-checkbox { margin: 0 -1.6em .25em .2em; } .markdown-body ol:dir(rtl) .task-list-item-checkbox { margin: 0 -1.6em .25em .2em; } .markdown-body .contains-task-list:hover .task-list-item-convert-container, .markdown-body .contains-task-list:focus-within .task-list-item-convert-container { display: block; width: auto; height: 24px; overflow: visible; clip-path: none; } .markdown-body ::-webkit-calendar-picker-indicator { filter: invert(50%); } .markdown-body .markdown-alert { padding: var(--base-size-8) var(--base-size-16); margin-bottom: var(--base-size-16); color: inherit; border-left: .25em solid var(--borderColor-default); } .markdown-body .markdown-alert>:first-child { margin-top: 0; } .markdown-body .markdown-alert>:last-child { margin-bottom: 0; } .markdown-body .markdown-alert .markdown-alert-title { display: flex; font-weight: var(--base-text-weight-medium, 500); align-items: center; line-height: 1; } .markdown-body .markdown-alert.markdown-alert-note { border-left-color: var(--borderColor-accent-emphasis); } .markdown-body .markdown-alert.markdown-alert-note .markdown-alert-title { color: var(--fgColor-accent); } .markdown-body .markdown-alert.markdown-alert-important { border-left-color: var(--borderColor-done-emphasis); } .markdown-body .markdown-alert.markdown-alert-important .markdown-alert-title { color: var(--fgColor-done); } .markdown-body .markdown-alert.markdown-alert-warning { border-left-color: var(--borderColor-attention-emphasis); } .markdown-body .markdown-alert.markdown-alert-warning .markdown-alert-title { color: var(--fgColor-attention); } .markdown-body .markdown-alert.markdown-alert-tip { border-left-color: var(--borderColor-success-emphasis); } .markdown-body .markdown-alert.markdown-alert-tip .markdown-alert-title { color: var(--fgColor-success); } .markdown-body .markdown-alert.markdown-alert-caution { border-left-color: var(--borderColor-danger-emphasis); } .markdown-body .markdown-alert.markdown-alert-caution .markdown-alert-title { color: var(--fgColor-danger); } .markdown-body>*:first-child>.heading-element:first-child { margin-top: 0 !important; } .markdown-body .highlight pre:has(+.zeroclipboard-container) { min-height: 52px; }`;

// Obsidian-rendered output uses classes (.callout, .markdown-rendered, .internal-link,
// .tag, .image-embed) that github-markdown-css doesn't style. This minimal layer
// makes them look reasonable inside .markdown-body. Also includes the body-level
// padding/centering that github-markdown-css doesn't set on body itself.
const OBSIDIAN_COMPAT_CSS = `
body.markdown-body { max-width: 980px; margin: 0 auto; padding: 32px 24px; box-sizing: border-box; }
@media (max-width: 767px) { body.markdown-body { padding: 16px 12px; } }
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

	// Render a markdown string fragment via Obsidian's MarkdownRenderer.
	// Reliable for any content; doesn't depend on view scroll state.
	async renderFragment(md, sourcePath = "") {
		// Strip Obsidian-specific code blocks from the source markdown BEFORE
		// rendering. Dataview / Journal Nav / frontmatter blocks have their
		// own scoped CSS (Vue data-v-* attrs, custom JS rendering) that
		// doesn't work in a self-contained HTML — easier to remove at
		// the source level than to balance divs in the rendered output.
		const cleaned = this.stripObsidianCodeBlocks(md);
		const comp = new obsidian.Component();
		comp.load();
		const div = createDiv();
		await obsidian.MarkdownRenderer.render(
			this.app,
			cleaned,
			div,
			sourcePath,
			comp,
		);
		const html = div.innerHTML;
		comp.unload();
		return this.clean(html);
	}

	// Remove Obsidian's "named code blocks" (`> [!name]`) for plugin blocks
	// whose output doesn't render meaningfully outside Obsidian. This is much
	// simpler than stripping from the rendered HTML, because the source
	// markdown has clean fenced blocks (no Vue scoped attrs, no nested
	// divs to balance).
	//
	// Default skip list: frontmatter, dataview, journal-nav, and any
	// other `> [!xxx]` code block. Override via the second argument
	// if you need finer control.
	stripObsidianCodeBlocks(md, extraSkipNames = []) {
		const skipNames = new Set([
			"frontmatter",
			"dataview",
			"journal-nav",
			"calendar",
			"kanban",
			"meta-bind",
			"meta-bind-button",
			"meta-bind-input",
			...extraSkipNames,
		]);
		let out = md;

		// 1. Strip YAML frontmatter at the very start of the file:
		//    ---\nkey: value\n---\n
		out = out.replace(
			/^---\s*\n[\s\S]*?\n---\s*(?:\n|$)/,
			"",
		);

		// 2. Strip `> [!name]` code blocks. The block ends at the first
		//    non-`>` line. We strip the entire block (header + body).
		const re = /^(\s*)>\s*\[!([a-z0-9_-]+)\][^\n]*\n((?:\s*>.*\n?)*)/gim;
		out = out.replace(re, (match, indent, name) => {
			if (skipNames.has(name.toLowerCase())) {
				return "";
			}
			return match;
		});

		return out;
	}

	// Read the active note's raw content and render it via MarkdownRenderer.
	// Replaces xero's "scroll-through-preview-and-grab-DOM" trick, which was
	// fragile and sometimes returned empty fragments.
	async getRendered() {
		const file = this.app.workspace.getActiveFile();
		if (!file) return "";
		const content = await this.app.vault.cachedRead(file);
		return await this.renderFragment(content, file.path);
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
					await this.renderFragment(
						editor.getSelection().replace(/```.*/g, "```"),
					),
				);
				new obsidian.Notice(
					"selection html copied to the clipboard",
					3500,
				);
			},
		});

		// 2) note → clipboard (FULL STANDALONE — main feature)
		this.addCommand({
			id: "md2html-enhanced-clip",
			name: "copy note as standalone html (github-styled)",
			editorCallback: async () => {
				const fragment = await this.getRendered();
				if (!fragment)
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

		// 3) note → file (FULL STANDALONE)
		this.addCommand({
			id: "md2html-enhanced-file",
			name: "export note to .html file (github-styled)",
			editorCallback: async () => {
				const fragment = await this.getRendered();
				if (!fragment)
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
				const file = this.app.workspace.getActiveFile();
				if (!file)
					return new obsidian.Notice("error. no active document", 3500);
				const content = await this.app.vault.cachedRead(file);
				const fragment = await this.renderFragment(content, file.path);
				const outName = `html-${file.name}`;
				await this.app.vault.create(outName, fragment);
				new obsidian.Notice(
					`document converted to ${outName}`,
					3500,
				);
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
			text: "fork of xero/obsidian-md2html (CC0). uses Obsidian's MarkdownRenderer for the body (preserves callouts, dataview, embeds) and adds github-markdown-css wrapping for self-contained output.",
		});
		containerEl.createEl("p", {
			text: "github: https://github.com/zzeitt/obsidian-md2html-enhanced",
		});
	}
}

module.exports = Md2htmlEnhanced;