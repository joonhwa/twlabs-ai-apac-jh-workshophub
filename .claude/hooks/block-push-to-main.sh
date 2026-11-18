#!/bin/bash
# PreToolUse on Bash

COMMAND=$(jq -r '.tool_input.command')

if [[ "$COMMAND" =~ push ]] && [[ "$COMMAND" =~ main ]]; then
  echo "Direct push forbidden" >&2
  exit 2
fi

exit 0

