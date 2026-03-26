PRAGMA foreign_keys = ON;

ALTER TABLE workspace_events ADD COLUMN channel TEXT NOT NULL DEFAULT 'workspace';
ALTER TABLE workspace_events ADD COLUMN event_type TEXT NOT NULL DEFAULT 'workspace.event';

UPDATE workspace_events
SET event_type = kind
WHERE kind IS NOT NULL AND event_type = 'workspace.event';

UPDATE workspace_events
SET channel = CASE
  WHEN event_type LIKE 'document.%' THEN 'documents'
  WHEN event_type LIKE 'task.%' THEN 'tasks'
  WHEN event_type LIKE 'comment.%' THEN 'comments'
  WHEN event_type LIKE 'member.%' THEN 'members'
  WHEN event_type LIKE 'file.%' THEN 'files'
  ELSE 'workspace'
END
WHERE channel = 'workspace';
