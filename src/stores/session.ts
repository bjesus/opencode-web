import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { Session, MessageWithParts, Part, Message } from '../api/types';

export const [sessions, setSessions] = createSignal<Session[]>([]);
export const [currentSessionId, setCurrentSessionId] = createSignal<string | null>(null);

export const [messages, setMessages] = createStore<Record<string, MessageWithParts[]>>({});

export const [isLoading, setIsLoading] = createSignal(false);
export const [isSending, setIsSending] = createSignal(false);

export function currentSession() {
  const id = currentSessionId();
  if (!id) return null;
  return sessions().find((s) => s.id === id) || null;
}

export function currentMessages(): MessageWithParts[] {
  const id = currentSessionId();
  if (!id) return [];
  return messages[id] || [];
}

export function addSession(session: Session) {
  setSessions((prev) => [session, ...prev]);
}

export function updateSession(session: Session) {
  setSessions((prev) =>
    prev.map((s) => (s.id === session.id ? session : s))
  );
}

export function removeSession(sessionId: string) {
  setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  if (currentSessionId() === sessionId) {
    setCurrentSessionId(null);
  }
}

export function setSessionMessages(sessionId: string, msgs: MessageWithParts[]) {
  setMessages(sessionId, msgs);
}

export function updateMessage(sessionId: string, messageId: string, info: Message) {
  const sessionMessages = messages[sessionId];
  if (!sessionMessages) {
    setMessages(sessionId, [{ info, parts: [] }]);
    return;
  }

  const index = sessionMessages.findIndex((m) => m.info.id === messageId);
  if (index !== -1) {
    setMessages(sessionId, index, 'info', info);
  } else {
    setMessages(sessionId, [...sessionMessages, { info, parts: [] }]);
  }
}

export function updatePart(sessionId: string, messageId: string, part: Part) {
  const sessionMessages = messages[sessionId];
  if (!sessionMessages) {
    setMessages(sessionId, [{ info: { id: messageId } as any, parts: [part] }]);
    return;
  }

  const msgIndex = sessionMessages.findIndex((m) => m.info.id === messageId);
  if (msgIndex === -1) {
    setMessages(sessionId, [...sessionMessages, { info: { id: messageId } as any, parts: [part] }]);
    return;
  }

  const partIndex = sessionMessages[msgIndex].parts.findIndex((p) => p.id === part.id);
  if (partIndex !== -1) {
    setMessages(sessionId, msgIndex, 'parts', partIndex, part);
  } else {
    setMessages(sessionId, msgIndex, 'parts', [...sessionMessages[msgIndex].parts, part]);
  }
}

export function removePart(sessionId: string, messageId: string, partId: string) {
  const sessionMessages = messages[sessionId];
  if (!sessionMessages) return;

  const msgIndex = sessionMessages.findIndex((m) => m.info.id === messageId);
  if (msgIndex !== -1) {
    setMessages(
      sessionId,
      msgIndex,
      'parts',
      sessionMessages[msgIndex].parts.filter((p) => p.id !== partId)
    );
  }
}
