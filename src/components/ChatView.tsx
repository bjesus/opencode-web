import { For, Show, createEffect } from 'solid-js';
import { createVirtualizer } from '@tanstack/solid-virtual';
import type { OpenCodeClient } from '../api/client';
import { currentMessages, currentSession } from '../stores/session';
import MessageItem from './MessageItem';

interface ChatViewProps {
  api: OpenCodeClient | null;
}

export default function ChatView(_props: ChatViewProps) {
  let scrollRef: HTMLDivElement | undefined;

  const virtualizer = createVirtualizer({
    get count() {
      return currentMessages().length;
    },
    getScrollElement: () => scrollRef || null,
    estimateSize: () => 200,
    overscan: 5,
    getItemKey: (index) => currentMessages()[index]?.info.id || index,
    measureElement: (element) => element.getBoundingClientRect().height,
  });

  createEffect(() => {
    const messages = currentMessages();
    if (messages.length > 0) {
      setTimeout(() => {
        if (scrollRef) {
          scrollRef.scrollTop = scrollRef.scrollHeight;
        }
      }, 100);
    }
  });

  return (
    <div class="flex-1 flex flex-col overflow-hidden">
      <Show when={currentSession()}>
        <div class="bg-base-200 px-4 py-3 border-b border-base-300 flex items-center justify-between">
          <h1 class="text-lg font-semibold truncate flex-1">
            {currentSession()?.title}
          </h1>
        </div>
      </Show>

      <div
        ref={scrollRef}
        class="flex-1 overflow-y-auto overflow-x-hidden"
      >
        <Show
          when={currentMessages().length > 0}
          fallback={
            <div class="h-full flex items-center justify-center text-base-content/60">
              <div class="text-center">
                <p class="text-lg mb-2">No messages yet</p>
                <p class="text-sm">Start a conversation by typing a message below</p>
              </div>
            </div>
          }
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            <For each={virtualizer.getVirtualItems()}>
              {(virtualRow) => {
                const message = currentMessages()[virtualRow.index];
                return (
                  <div
                    data-index={virtualRow.index}
                    data-key={virtualRow.key}
                    ref={(el) => virtualizer.measureElement(el)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <MessageItem message={message} />
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
}
