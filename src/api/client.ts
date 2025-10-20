import { createOpencodeClient } from '@opencode-ai/sdk';
import type { components } from '@opencode-ai/sdk';

export type OpenCodeClient = ReturnType<typeof createOpencodeClient>;

export type Session = components['schemas']['Session'];
export type Message = components['schemas']['Message'];
export type Part = components['schemas']['Part'];
export type Provider = components['schemas']['Provider'];
export type Agent = components['schemas']['Agent'];
export type AssistantMessage = components['schemas']['AssistantMessage'];
export type UserMessage = components['schemas']['UserMessage'];

export interface MessageWithParts {
  info: Message;
  parts: Part[];
}

export function createClient(baseUrl: string) {
  return createOpencodeClient({ baseUrl });
}
