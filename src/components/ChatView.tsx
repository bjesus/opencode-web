import { For, Show, createEffect, onCleanup, onMount, createSignal } from 'solid-js';
import { createVirtualizer } from '@tanstack/solid-virtual';
import type { OpenCodeClient } from '../api/client';
import { currentMessages, currentSession } from '../stores/session';
import MessageItem from './MessageItem';

interface ChatViewProps {
  api: OpenCodeClient | null;
}

export default function ChatView(_props: ChatViewProps) {
  let scrollRef: HTMLDivElement | undefined;
  const [atBottom, setAtBottom] = createSignal(true);

  const updateAtBottom = () => {
    if (!scrollRef) return;
    const delta = scrollRef.scrollHeight - (scrollRef.scrollTop + scrollRef.clientHeight);
    setAtBottom(delta <= 8);
  };

  const scrollToBottom = () => {
    if (!scrollRef) return;
    scrollRef.scrollTo({ top: scrollRef.scrollHeight, behavior: 'smooth' });
  };

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

  // Re-measure on message length change; auto-scroll only if already at bottom
  createEffect(() => {
    const len = currentMessages().length;
    if (len > 0) {
      requestAnimationFrame(() => {
        virtualizer.measure();
        requestAnimationFrame(() => {
          virtualizer.measure();
          if (atBottom() && scrollRef) scrollRef.scrollTop = scrollRef.scrollHeight;
          updateAtBottom();
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
    <div class="h-full flex flex-col overflow-hidden">
      <Show when={currentSession()}>
        <div class="bg-base-200 px-4 py-3 border-b border-base-300 flex items-center justify-between">
          <h1 class="text-lg font-semibold truncate flex-1">
            {currentSession()?.title}
          </h1>
        </div>
      </Show>

      <div class="relative flex-1 min-h-0">
        <div ref={scrollRef} class="h-full overflow-y-auto overflow-x-hidden" onScroll={updateAtBottom}>
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
        <Show when={!atBottom()}>
          <div class="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <button class="btn btn-primary btn-sm shadow pointer-events-auto" onClick={scrollToBottom}>
              Latest
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}
