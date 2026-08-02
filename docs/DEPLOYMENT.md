# Deployment

## AI Safety

- `AI_WRITE_ENABLED` defaults to `false`.
- Gemini/chat write functions never write directly from a model function call, even if `AI_WRITE_ENABLED=true`.
- AI write requests are stored as `pending_action` rows in `ai_action_log` and are persisted only after the authenticated user confirms them through `/chat/actions/:pendingActionId/confirm`.
