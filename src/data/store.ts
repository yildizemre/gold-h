/**
 * Operator actions (doğrula / yanlış alarm / not) live in a tiny in-memory store so a change
 * made in one drawer shows up in the bell, sidebar badge, fraud table and incident center.
 */
import { useSyncExternalStore } from "react";
import { INCIDENTS, type Incident, type Status } from "./incidents";

type State = { status: Record<string, Status>; notes: Record<string, string[]>; read: Record<string, boolean> };

let state: State = { status: {}, notes: {}, read: {} };
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const incidentStore = {
  setStatus(id: string, s: Status) {
    state = { ...state, status: { ...state.status, [id]: s }, read: { ...state.read, [id]: true } };
    emit();
  },
  addNote(id: string, text: string) {
    state = { ...state, notes: { ...state.notes, [id]: [...(state.notes[id] ?? []), text] } };
    emit();
  },
  markRead(id: string) {
    if (state.read[id]) return;
    state = { ...state, read: { ...state.read, [id]: true } };
    emit();
  },
  markAllRead() {
    const read = { ...state.read };
    INCIDENTS.forEach((i) => (read[i.id] = true));
    state = { ...state, read };
    emit();
  },
};

const subscribe = (f: () => void) => {
  subs.add(f);
  return () => subs.delete(f);
};

export function useIncidentState() {
  return useSyncExternalStore(subscribe, () => state);
}

/** Incidents with operator changes applied. */
export function useIncidents(): (Incident & { unread: boolean; notes: string[] })[] {
  const s = useIncidentState();
  return INCIDENTS.map((i) => ({
    ...i,
    status: s.status[i.id] ?? i.status,
    unread: (i.status === "new" || i.status === "review") && !s.read[i.id] && !s.status[i.id],
    notes: [...(i.note ? [i.note] : []), ...(s.notes[i.id] ?? [])],
  }));
}

export function useUnreadCount() {
  return useIncidents().filter((i) => i.unread).length;
}
