"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type WorkspaceEvent = {
  id: number;
  channel: string;
  eventType: string;
  payloadJson: string;
  createdAt: number;
};

type WorkspaceEventsContextValue = {
  events: WorkspaceEvent[];
};

const WorkspaceEventsContext = createContext<WorkspaceEventsContextValue>({
  events: [],
});

export function WorkspaceEventsProvider({
  workspaceId,
  children,
}: {
  workspaceId: string;
  children: React.ReactNode;
}) {
  const [events, setEvents] = useState<WorkspaceEvent[]>([]);
  const lastIdRef = useRef(0);

  useEffect(() => {
    const source = new EventSource(`/api/workspaces/${workspaceId}/stream?after=${lastIdRef.current}`);

    source.onmessage = () => {};

    const handler = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as WorkspaceEvent;
        lastIdRef.current = payload.id;
        setEvents((current) => [...current.slice(-40), payload]);
      } catch {
        // ignore malformed events
      }
    };

    source.addEventListener("document.created", handler as EventListener);
    source.addEventListener("document.updated", handler as EventListener);
    source.addEventListener("task.created", handler as EventListener);
    source.addEventListener("comment.created", handler as EventListener);
    source.addEventListener("member.upserted", handler as EventListener);
    source.addEventListener("file.uploaded", handler as EventListener);

    return () => {
      source.close();
    };
  }, [workspaceId]);

  const value = useMemo(
    () => ({
      events,
    }),
    [events],
  );

  return <WorkspaceEventsContext.Provider value={value}>{children}</WorkspaceEventsContext.Provider>;
}

export function useWorkspaceEvents() {
  return useContext(WorkspaceEventsContext);
}
