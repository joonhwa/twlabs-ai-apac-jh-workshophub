#!/bin/bash
# PostToolUse on Write|Edit

FILE_PATH=$(jq -r '.tool_input.file_path // empty')
[[ -z "$FILE_PATH" ]] && exit 0

case "$FILE_PATH" in
  "$CLAUDE_PROJECT_DIR"/api/*) pkg=api ;;
  "$CLAUDE_PROJECT_DIR"/app/*) pkg=app ;;
  *) exit 0 ;;
esac

"$CLAUDE_PROJECT_DIR/$pkg/node_modules/.bin/prettier" --write --ignore-unknown "$FILE_PATH" >/dev/null \
  || echo "prettier failed on $FILE_PATH" >&2

exit 0
