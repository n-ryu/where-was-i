# Hooks Configuration Reference

## When to Use Hooks vs CLAUDE.md

- **CLAUDE.md**: Advisory — Claude should do X. May be ignored under context pressure.
- **Hooks**: Deterministic — X will happen every time, guaranteed.

Use hooks for: linting after edits, blocking dangerous commands, enforcing completion criteria.

## Configuration Locations

| Location | Scope | Shareable |
|----------|-------|-----------|
| `~/.claude/settings.json` | All projects | No |
| `.claude/settings.json` | This project | Yes (commit to git) |
| `.claude/settings.local.json` | This project | No (gitignored) |

## Hook Events

| Event | When it fires | Can block? |
|-------|--------------|-----------|
| `SessionStart` | Session begins/resumes | No |
| `UserPromptSubmit` | User submits prompt | Yes |
| `PreToolUse` | Before tool executes | Yes |
| `PostToolUse` | After tool succeeds | No (feedback only) |
| `PostToolUseFailure` | After tool fails | No (feedback only) |
| `PermissionRequest` | Permission dialog shown | Yes |
| `Stop` | Claude finishes responding | Yes (can force continue) |
| `SubagentStart` | Subagent spawns | No |
| `SubagentStop` | Subagent finishes | Yes |
| `Notification` | Notification sent | No |
| `PreCompact` | Before compaction | No |
| `SessionEnd` | Session terminates | No |
| `TaskCompleted` | Task marked complete | Yes |
| `TeammateIdle` | Team teammate going idle | Yes |

## Configuration Format

```json
{
  "hooks": {
    "<EventName>": [
      {
        "matcher": "regex pattern",
        "hooks": [
          {
            "type": "command",
            "command": "your-script.sh",
            "timeout": 600,
            "statusMessage": "Running checks..."
          }
        ]
      }
    ]
  }
}
```

## Matcher Patterns

Matchers are regex strings that filter when hooks fire:

| Event | Matches on | Examples |
|-------|-----------|----------|
| `PreToolUse`, `PostToolUse`, `PermissionRequest` | tool name | `Bash`, `Edit\|Write`, `mcp__.*` |
| `SessionStart` | session source | `startup`, `resume`, `clear`, `compact` |
| `SessionEnd` | exit reason | `clear`, `logout`, `other` |
| `Notification` | notification type | `permission_prompt`, `idle_prompt` |

Omit matcher or use `"*"` to match all occurrences.

## Hook Types

### Command Hooks
```json
{
  "type": "command",
  "command": "your-script.sh",
  "timeout": 600,
  "async": false
}
```

### Prompt Hooks (LLM evaluation)
```json
{
  "type": "prompt",
  "prompt": "Evaluate if Claude should stop: $ARGUMENTS. Check if all tasks are complete.",
  "model": "haiku",
  "timeout": 30
}
```

### Agent Hooks (multi-turn verification)
```json
{
  "type": "agent",
  "prompt": "Verify all tests pass. $ARGUMENTS",
  "timeout": 60
}
```

## Exit Codes

- **Exit 0**: Success. Claude Code parses stdout for JSON output.
- **Exit 2**: Blocking error. stderr fed to Claude as error. Blocks the action (for events that support blocking).
- **Other**: Non-blocking error. stderr shown in verbose mode only.

## JSON Output (on exit 0)

```json
{
  "continue": true,
  "stopReason": "message when continue=false",
  "suppressOutput": false,
  "systemMessage": "warning shown to user"
}
```

### PreToolUse Decision

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "explanation"
  }
}
```

### PostToolUse / Stop Decision

```json
{
  "decision": "block",
  "reason": "explanation shown to Claude"
}
```

## Common Input Fields (stdin JSON)

All hooks receive: `session_id`, `transcript_path`, `cwd`, `permission_mode`, `hook_event_name`.

Tool events also receive: `tool_name`, `tool_input` (and `tool_response` for PostToolUse).

## Common Patterns

### Auto-lint after file changes

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/lint-check.sh"
          }
        ]
      }
    ]
  }
}
```

### Block dangerous commands

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-dangerous.sh"
          }
        ]
      }
    ]
  }
}
```

### Enforce completion criteria

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Check if all tasks are complete: $ARGUMENTS. Respond {\"ok\": true} or {\"ok\": false, \"reason\": \"...\"}."
          }
        ]
      }
    ]
  }
}
```

### Async test runner

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/run-tests.sh",
            "async": true,
            "timeout": 300
          }
        ]
      }
    ]
  }
}
```

## Environment Variables

- `$CLAUDE_PROJECT_DIR`: project root (use for script paths)
- `$CLAUDE_CODE_REMOTE`: `"true"` in remote web environments
- `$CLAUDE_ENV_FILE`: (SessionStart only) file path to persist env vars

## Best Practices

- Use `"$CLAUDE_PROJECT_DIR"` in commands for portable paths
- Always quote shell variables in hook scripts
- Check `stop_hook_active` in Stop hooks to prevent infinite loops
- Hooks are snapshotted at startup — restart session after editing
- Use `/hooks` menu for interactive configuration
- Use `async: true` for long-running tasks that don't need to block

Source: https://code.claude.com/docs/en/hooks
