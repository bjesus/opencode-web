import type { Message, Part } from './types';

export interface EventHandlers {
  onMessageUpdate?: (data: { info: Message }) => void;
  onMessageRemoved?: (data: { sessionID: string; messageID: string }) => void;
  onPartUpdate?: (data: { part: Part }) => void;
  onSessionUpdate?: (data: { session: any }) => void;
}

export async function subscribeToEvents(
  stream: AsyncIterable<any>,
  handlers: EventHandlers
): Promise<void> {
  try {
    for await (const event of stream) {
      if (!event || !event.type) continue;

      switch (event.type) {
        case 'message.updated':
          handlers.onMessageUpdate?.(event.properties);
          break;
        case 'message.removed':
          handlers.onMessageRemoved?.(event.properties);
          break;
        case 'message.part.updated':
          handlers.onPartUpdate?.(event.properties);
          break;
        case 'session.updated':
          handlers.onSessionUpdate?.(event.properties);
          break;
      }
    }
  } catch (error) {
    console.error('SSE error:', error);
  }
}
