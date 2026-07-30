#!/usr/bin/env bash
# Regenerate lib/github-markdown.css.js from upstream.
#
# After editing, run ./scripts/bundle_css.sh to refresh the bundled CSS.
# Then commit the new lib/github-markdown.css.js.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_CSS="/tmp/gmcss.css"
DEST_JS="$REPO_ROOT/lib/github-markdown.css.js"

echo "→ fetching github-markdown-css v5 from jsDelivr..."
curl -fsSL https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown.css -o "$SRC_CSS"

echo "→ building $DEST_JS..."
python3 << 'PYEOF'
import re, sys

with open("/tmp/gmcss.css", "r") as f:
    css = f.read()

# Strip comments + collapse whitespace
css_clean = re.sub(r"/\*.*?\*/", "", css, flags=re.DOTALL)
css_clean = re.sub(r"\s+", " ", css_clean).strip()

# Escape for JS template literals
escaped = css_clean.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")

with open("lib/github-markdown.css.js", "w") as f:
    f.write(f"""// Bundled github-markdown-css v5 (CC0, sindresorhus).
// To regenerate: ./scripts/bundle_css.sh
// Do not edit by hand.
module.exports = `{escaped}`;
""")

print(f"  ✓ lib/github-markdown.css.js ({len(open('lib/github-markdown.css.js').read())} bytes)")
PYEOF

echo "done. remember to:"
echo "  git add lib/github-markdown.css.js"
echo "  git commit -m 'chore: refresh bundled github-markdown-css'"
echo "  git push"