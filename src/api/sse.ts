import type { Message, Part } from './types';

export interface EventHandlers {
  onMessageCreated?: (data: { info: Message }) => void;
  onMessageUpdate?: (data: { info: Message }) => void;
  onMessageRemoved?: (data: { sessionID: string; messageID: string }) => void;
  onPartCreated?: (data: { part: Part }) => void;
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
        case 'message.created':
          handlers.onMessageCreated?.(event.properties);
          handlers.onMessageUpdate?.(event.properties);
          break;
        case 'message.updated':
          handlers.onMessageUpdate?.(event.properties);
          break;
        case 'message.removed':
          handlers.onMessageRemoved?.(event.properties);
          break;
        case 'message.part.created':
          handlers.onPartCreated?.(event.properties);
          handlers.onPartUpdate?.(event.properties);
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
