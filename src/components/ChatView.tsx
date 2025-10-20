import { For, Show, createEffect, onCleanup, onMount } from 'solid-js';
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
    overscan: 8,
    getItemKey: (index) => currentMessages()[index]?.info.id || index,
    // Measure using offsetHeight for stable sizing
    measureElement: (element) => (element as HTMLElement).offsetHeight,
  });

  // Re-measure and scroll on message length changes
  createEffect(() => {
    const len = currentMessages().length;
    if (len > 0) {
      requestAnimationFrame(() => {
        virtualizer.measure();
        requestAnimationFrame(() => {
          virtualizer.measure();
          if (scrollRef) scrollRef.scrollTop = scrollRef.scrollHeight;
        });
      });
    }
  });

  // Per-row component with ResizeObserver to remeasure on content changes
  function Row(props: { index: number; start: number; key: string; message: any }) {
    let refEl: HTMLDivElement | undefined;
    let ro: ResizeObserver | undefined;

    onMount(() => {
      if (refEl) {
        // Post-paint remeasures to catch async content growth
        requestAnimationFrame(() => {
          if (refEl) virtualizer.measureElement(refEl);
          requestAnimationFrame(() => {
            if (refEl) virtualizer.measureElement(refEl);
          });
        });
        // Observe size changes (e.g., markdown highlight, images loading)
        ro = new ResizeObserver(() => {
          if (refEl) virtualizer.measureElement(refEl);
        });
        ro.observe(refEl);
      }
    });

    onCleanup(() => {
      if (ro && refEl) ro.unobserve(refEl);
      ro?.disconnect();
    });

    return (
      <div
        ref={(el) => (refEl = el)}
        data-index={props.index}
        data-key={props.key}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${props.start}px)`,
          display: 'flow-root', // prevent margin-collapsing
        }}
      >
        <MessageItem message={props.message} />
      </div>
    );
  }

  return (
    <div class="flex-1 flex flex-col overflow-hidden">
      <Show when={currentSession()}>
        <div class="bg-base-200 px-4 py-3 border-b border-base-300 flex items-center justify-between">
          <h1 class="text-lg font-semibold truncate flex-1">
            {currentSession()?.title}
          </h1>
        </div>
      </Show>

      <div ref={scrollRef} class="flex-1 overflow-y-auto overflow-x-hidden">
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
              {(row) => (
                <Row
                  index={row.index}
                  start={row.start}
                  key={String(row.key)}
                  message={currentMessages()[row.index]}
                />
              )}
            </For>
          </div>
        </Show>
      </div>
    </div>
  );
}
