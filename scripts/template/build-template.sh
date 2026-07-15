#!/usr/bin/env bash
# build-template.sh — Stage the Munro Code template artifacts
#
# Pulls skills from ~/Projects/zoras-memory-system/skills/ into
# scripts/template/skills/, plus any prompts/inherited/bin we maintain.
#
# Run this before publishing the template to Orgo.
# Idempotent — safe to re-run.

set -euo pipefail

# Resolve to the directory this script lives in
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Source of truth paths
# Skills now live in a Munro-owned folder so we can grow them independently
# of the upstream zoras-memory-system repo.
SKILLS_SRC="$HOME/Projects/Munro/munro-code/munro-skills"
PROMPTS_SRC="$HOME/Projects/Munro/munro-code/munro-prompts"
INHERITED_SRC="$HOME/Projects/Munro/munro-code/munro-inherited"
OPENMONTAGE_SRC="$HOME/Projects/Numin/skills/openmontage-patterns.md"

# Destination paths
SKILLS_DST="./skills"
PROMPTS_DST="./prompts"
INHERITED_DST="./inherited"
BIN_DST="./bin"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Building Munro Code template artifacts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Skills (53 skills from the canonical repo)
echo ""
echo "→ Step 1: Staging skills from $SKILLS_SRC..."
mkdir -p "$SKILLS_DST"
if [[ -d "$SKILLS_SRC" ]]; then
  # Copy all skills except README.md and any dotfiles
  find "$SKILLS_SRC" -maxdepth 1 -mindepth 1 -type d \( -not -name '.DS_Store' \) \
    -exec cp -R {} "$SKILLS_DST/" \;
  echo "  $(ls "$SKILLS_DST" | wc -l) skill folders staged"
else
  echo "  ⚠️  $SKILLS_SRC not found. Skills directory will be empty."
  mkdir -p "$SKILLS_DST"
fi

# 2. Prompts (if they exist)
echo ""
echo "→ Step 2: Staging prompts from $PROMPTS_SRC..."
mkdir -p "$PROMPTS_DST"
if [[ -d "$PROMPTS_SRC" ]]; then
  cp -R "$PROMPTS_SRC/"* "$PROMPTS_DST/" 2>/dev/null || true
  echo "  $(ls "$PROMPTS_DST" 2>/dev/null | wc -l) prompt files staged"
else
  echo "  (no prompts/ source — leaving $PROMPTS_DST empty for now)"
fi

# 3. Inherited disciplines (openmontage-patterns)
echo ""
echo "→ Step 3: Staging inherited disciplines..."
mkdir -p "$INHERITED_DST"
if [[ -f "$OPENMONTAGE_SRC" ]]; then
  cp "$OPENMONTAGE_SRC" "$INHERITED_DST/"
  echo "  openmontage-patterns.md staged"
else
  echo "  ⚠️  $OPENMONTAGE_SRC not found."
fi

# 4. Helpers (the crawl4ai wrapper)
echo ""
echo "→ Step 4: Staging helpers..."
mkdir -p "$BIN_DST"
if [[ -f "$BIN_DST/crawl4ai_helper.py" ]]; then
  echo "  crawl4ai_helper.py already staged ($(wc -l < "$BIN_DST/crawl4ai_helper.py") lines)"
else
  echo "  ⚠️  crawl4ai_helper.py not found in $BIN_DST — write it before publishing."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Build complete. Now publish:"
echo ""
echo "  cd $SCRIPT_DIR"
echo "  curl -X POST \"https://www.orgo.ai/api/templates?auto_build=true&force=true\" \\"
echo "    -H \"Authorization: Bearer \$ORGO_API_KEY\" \\"
echo "    -H \"Content-Type: application/yaml\" \\"
echo "    --data-binary @template.yaml"
echo ""
echo "Then update provision.sh to use template_ref: default/munro-code@1.0.0"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"