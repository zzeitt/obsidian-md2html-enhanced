#!/usr/bin/env bash
# Regenerate the bundled github-markdown-css (inlined into main.js).
#
# This is no longer used at runtime — the CSS is now embedded as a string
# constant in main.js (single-file plugin, no separate lib/ folder).
#
# After running this script, the new CSS is at /tmp/gmcss-new.txt.
# Paste its contents into the GITHUB_MARKDOWN_CSS template literal in
# main.js, replacing the existing value. (Run this once after major
# upstream CSS updates; not a regular operation.)
#
# The placeholder `__GITHUB_MARKDOWN_CSS_PLACEHOLDER__` in main.js.tpl
# is replaced during plugin development — see main.js itself for the
# current value.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "→ fetching github-markdown-css v5 from jsDelivr..."
curl -fsSL https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown.css \
  -o /tmp/gmcss-new.txt

echo "→ fetched $(wc -c < /tmp/gmcss-new.txt) bytes"
echo ""
echo "next steps:"
echo "  1. cat /tmp/gmcss-new.txt"
echo "  2. open main.js"
echo "  3. replace the contents of the GITHUB_MARKDOWN_CSS template literal"
echo "  4. (escape any \` and \${ if present, then re-test with node --check main.js)"
