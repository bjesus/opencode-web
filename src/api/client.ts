import { createOpencodeClient } from '@opencode-ai/sdk/client';
// Note: types fallback to any in this build env

export type OpenCodeClient = ReturnType<typeof createOpencodeClient>;

export type Session = any;
export type Message = any;
export type Part = any;
export type Provider = any;
export type Agent = any;
export type AssistantMessage = any;
export type UserMessage = any;

export interface MessageWithParts {
  info: Message;
  parts: Part[];
}

export function createClient(baseUrl: string) {
  return createOpencodeClient({ baseUrl });
}
