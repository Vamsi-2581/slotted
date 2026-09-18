#!/usr/bin/env bash
# Runs docs/process/review-prompt.md in fresh Claude Code sessions until
# docs/process/implementation-review.md has no `- [ ]` line left. Each session closes up
# to REVIEW_ITEMS_PER_SESSION items and starts with an empty context, so state
# lives only in the review file, the log file and git.
#
# Termination guarantees:
#   - MAX_ITERATIONS sessions at most.
#   - REVIEW_MAX_WAITS consecutive sessions without a result line (usage limit,
#     network, crash) end the loop.
#   - REVIEW_STALL_LIMIT consecutive sessions that neither close nor block an
#     item end the loop.
#   - An item interrupted REVIEW_ITEM_ATTEMPTS times (START line in the log,
#     no closing entry) is marked [!] by this script and skipped afterwards.
#
# Usage:
#   scripts/review-loop.sh [MAX_ITERATIONS]
# Environment:
#   REVIEW_MODEL             model id (default: claude-fable-5-1)
#   REVIEW_EFFORT            effort level: low, medium, high, xhigh, max (default: high)
#   REVIEW_BRANCH            working branch (default: review/implementation-pass-1)
#   REVIEW_ITEMS_PER_SESSION items one session may close (default: 4)
#   REVIEW_RETRY_WAIT        seconds to sleep after a session without result (default: 900)
#   REVIEW_MAX_WAITS         consecutive no-result sessions tolerated (default: 40)
#   REVIEW_STALL_LIMIT       consecutive no-progress sessions tolerated (default: 2)
#   REVIEW_ITEM_ATTEMPTS     interrupted attempts before an item is blocked (default: 2)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

MAX_ITERATIONS="${1:-40}"
MODEL="${REVIEW_MODEL:-claude-fable-5-1}"
EFFORT="${REVIEW_EFFORT:-high}"
BRANCH="${REVIEW_BRANCH:-review/implementation-pass-1}"
ITEMS_PER_SESSION="${REVIEW_ITEMS_PER_SESSION:-4}"
RETRY_WAIT="${REVIEW_RETRY_WAIT:-900}"
MAX_WAITS="${REVIEW_MAX_WAITS:-40}"
STALL_LIMIT="${REVIEW_STALL_LIMIT:-2}"
ITEM_ATTEMPTS="${REVIEW_ITEM_ATTEMPTS:-2}"
PROMPT_FILE="docs/process/review-prompt.md"
REVIEW_FILE="docs/process/implementation-review.md"
REVIEW_LOG="docs/process/implementation-review-log.md"
LOG_DIR="tools/harness/out/review-loop"
mkdir -p "$LOG_DIR"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "working tree is dirty; commit or stash before starting" >&2
  exit 1
fi

if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

# The log must be tracked: a session that dies leaves START lines in it, and
# revert_dirty_tree would otherwise delete it as an untracked file.
if [[ ! -f "$REVIEW_LOG" ]]; then
  printf '# Implementation review log\n' > "$REVIEW_LOG"
  git add "$REVIEW_LOG"
  git commit -q -m "chore(review): start implementation review log"
fi

ORIGINAL_PUSH_URL="$(git config --get remote.origin.pushurl || true)"
git config remote.origin.pushurl "no-push://disabled-by-review-loop"
restore_push() {
  if [[ -n "$ORIGINAL_PUSH_URL" ]]; then
    git config remote.origin.pushurl "$ORIGINAL_PUSH_URL"
  else
    git config --unset remote.origin.pushurl || true
  fi
}
trap restore_push EXIT

open_count()    { grep -c '^- \[ \] \*\*' "$REVIEW_FILE" || true; }
closed_count()  { grep -c '^- \[x\] \*\*' "$REVIEW_FILE" || true; }
blocked_count() { grep -c '^- \[!\] \*\*' "$REVIEW_FILE" || true; }

revert_dirty_tree() {
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "  dirty tree after session; reverting"
    git checkout -- .
    git clean -fd
  fi
}

# Items with a START line but no "## <ID>" closing entry, counted per ID.
block_exhausted_items() {
  local id starts closes
  for id in $(grep -oE '^START [A-Z]+[0-9]+' "$REVIEW_LOG" | awk '{print $2}' | sort -u); do
    starts="$(grep -cE "^START $id " "$REVIEW_LOG" || true)"
    closes="$(grep -cE "^## $id " "$REVIEW_LOG" || true)"
    if [[ "$closes" -eq 0 && "$starts" -ge "$ITEM_ATTEMPTS" ]] && grep -qE "^- \[ \] \*\*$id " "$REVIEW_FILE"; then
      echo "  item $id interrupted $starts time(s); blocking it"
      sed -i -E "s/^- \[ \] \*\*$id /- [!] **$id /" "$REVIEW_FILE"
      printf '\n## %s — BLOCKED by review-loop (%s)\nInterrupted %s time(s) without a closing entry.\n' \
        "$id" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$starts" >> "$REVIEW_LOG"
      git add "$REVIEW_FILE" "$REVIEW_LOG"
      git commit -q -m "chore(review): block $id after $starts interrupted attempts"
    fi
  done
}

waits=0
stalls=0
for ((i = 1; i <= MAX_ITERATIONS; i++)); do
  block_exhausted_items

  before_open="$(open_count)"
  before_blocked="$(blocked_count)"
  if [[ "$before_open" -eq 0 ]]; then
    echo "[$i] no open item left"
    break
  fi

  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  out="$LOG_DIR/$stamp-iter$i.log"
  echo "[$i] open=$before_open closed=$(closed_count) blocked=$before_blocked; log: $out"

  prompt="$(sed "s/{{ITEMS_PER_SESSION}}/$ITEMS_PER_SESSION/g" "$PROMPT_FILE")"

  set +e
  claude -p "$prompt" \
    --model "$MODEL" \
    --effort "$EFFORT" \
    --dangerously-skip-permissions \
    --output-format text \
    > "$out" 2>&1
  status=$?
  set -e

  result="$(grep -E '^SESSION ' "$out" | tail -n 1 || true)"
  echo "[$i] exit=$status result=${result:-<none>}"

  revert_dirty_tree

  if [[ -z "$result" ]]; then
    waits=$((waits + 1))
    reason="$(grep -iE 'limit|rate|quota|overloaded|ECONN|ETIMEDOUT|529|429' "$out" | head -n 1 || true)"
    echo "[$i] no result (${reason:-unknown}); wait $waits/$MAX_WAITS, sleeping ${RETRY_WAIT}s"
    if [[ "$waits" -ge "$MAX_WAITS" ]]; then
      echo "giving up after $MAX_WAITS consecutive sessions without result"
      break
    fi
    sleep "$RETRY_WAIT"
    continue
  fi
  waits=0

  after_open="$(open_count)"
  after_blocked="$(blocked_count)"
  if [[ "$after_open" -lt "$before_open" || "$after_blocked" -gt "$before_blocked" ]]; then
    stalls=0
  else
    stalls=$((stalls + 1))
    echo "[$i] no progress; stall $stalls/$STALL_LIMIT"
    if [[ "$stalls" -ge "$STALL_LIMIT" ]]; then
      echo "stopping after $STALL_LIMIT sessions without progress"
      break
    fi
  fi

  [[ "$result" == *"remaining=0"* ]] && break
done

echo "open items:    $(open_count)"
echo "closed items:  $(closed_count)"
echo "blocked items: $(blocked_count)"
git log --oneline "$(git merge-base HEAD foundation/wave-0)..HEAD"
