export const APP_NAME = "Nebula Workspace";
export const SESSION_COOKIE_NAME = "nebula_session";
export const DOCUMENT_WS_PATH = "/collaboration";
export const sessionDurationMs = 1000 * 60 * 60 * 24 * 7;
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export const roleRank = {
  viewer: 0,
  editor: 1,
  manager: 2,
  owner: 3,
} as const;

export const workspaceRoles = Object.keys(roleRank) as Array<keyof typeof roleRank>;

export const DEFAULT_USER_AVATARS = [
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
] as const;

export const MEMBER_ROLES = {
  VIEWER: "viewer",
  EDITOR: "editor",
  MANAGER: "manager",
  OWNER: "owner",
} as const;

export const PROJECT_STATUS = {
  ACTIVE: "active",
  PLANNING: "planning",
  DONE: "done",
} as const;

export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
} as const;

export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export const WORKSPACE_PLAN = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;
