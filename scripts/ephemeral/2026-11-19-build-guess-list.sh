#!/usr/bin/env bash
# 2026-11-19 — build Bytle's valid-guess list (ADR-0001, QST-GUESS-VALIDITY option A).
#
# Context: Bytle accepts any 5-letter English word (plus the CS answer list,
# which is merged in at runtime by src/game/words.ts). The English list is
# ENABLE (Enhanced North American Benchmark LEXicon), a public-domain word
# list widely used by word games. It includes plurals (STARS, BYTES), which
# the macOS /usr/share/dict/words (Webster's 2nd, 1934) mostly lacks — that
# was the reason for choosing ENABLE over the file already on the machine.
#
# Usage: bash scripts/ephemeral/2026-11-19-build-guess-list.sh <scratch-dir>
#   <scratch-dir> must be an empty directory used only for the download.
# Output: src/game/data/guesses.txt — one lowercase 5-letter word per line.
set -euo pipefail

SCRATCH="${1:?usage: $0 <empty-scratch-dir>}"
URL="https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt"
OUT="src/game/data/guesses.txt"

mkdir -p "$SCRATCH" "$(dirname "$OUT")"
curl -fsSL "$URL" -o "$SCRATCH/enable1.txt"

# Keep only exactly-five-lowercase-letter words; normalize CRLF just in case.
tr -d '\r' < "$SCRATCH/enable1.txt" | grep -E '^[a-z]{5}$' | sort -u > "$OUT"

echo "wrote $(wc -l < "$OUT" | tr -d ' ') words to $OUT"
