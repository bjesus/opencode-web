import { For, Show, Match, Switch } from "solid-js";
import type { MessageWithParts } from "../api/types";
import Markdown from "./common/Markdown";

interface MessageItemProps {
  message: MessageWithParts;
}

export default function MessageItem(props: MessageItemProps) {
  const isUser = () => props.message.info.role === "user";
  const isAssistant = () => props.message.info.role === "assistant";

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  const formatTokens = (tokens: any) => {
    if (!tokens) return "";
    const parts = [];
    if (tokens.input) parts.push(`${tokens.input} in`);
    if (tokens.output) parts.push(`${tokens.output} out`);
    if (tokens.reasoning) parts.push(`${tokens.reasoning} reasoning`);
    return parts.join(" • ");
  };

  return (
    <div class={`p-4 ${isUser() ? "flex justify-end" : ""}`}>
      <div class={`max-w-4xl ${isUser() ? "w-auto" : "w-full"}`}>
        <Show when={isUser()}>
          <div class="chat chat-end">
            <div class="chat-bubble chat-bubble-primary">
              <For each={props.message.parts}>
                {(part) => (
                  <Show when={part.type === "text"}>
                    <div class="whitespace-pre-wrap">{(part as any).text}</div>
                  </Show>
                )}
              </For>
            </div>
          </div>
        </Show>

        <Show when={isAssistant()}>
          <div class="space-y-2">
            <Show when={props.message.info.error}>
              <div class="alert alert-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{props.message.info.error?.data.message}</span>
              </div>
            </Show>

            <For each={props.message.parts}>
              {(part) => (
                <Switch>
                  <Match when={part.type === "text"}>
                    <div class="prose max-w-none">
                      <Markdown content={(part as any).text} />
                    </div>
                  </Match>

                  <Match when={part.type === "reasoning"}>
                    <details class="collapse collapse-arrow bg-base-200">
                      <summary class="collapse-title font-medium">
                        Thinking...
                      </summary>
                      <div class="collapse-content">
                        <div class="prose max-w-none">
                          <Markdown content={(part as any).text} />
                        </div>
                      </div>
                    </details>
                  </Match>

                  <Match when={part.type === "tool"}>
                    <div class="card bg-base-200">
                      <div class="card-body p-3">
                        <div class="flex items-center gap-2">
                          <Show
                            when={(part as any).state.status === "running"}
                            fallback={
                              <Show
                                when={
                                  (part as any).state.status === "completed"
                                }
                                fallback={
                                  <Show
                                    when={
                                      (part as any).state.status === "error"
                                    }
                                  >
                                    <span class="text-error">✕</span>
                                  </Show>
                                }
                              >
                                <span class="text-success">✓</span>
                              </Show>
                            }
                          >
                            <span class="loading loading-spinner loading-sm"></span>
                          </Show>
                          <span class="font-mono text-sm">
                            {(part as any).tool}
                          </span>
                        </div>

                        <Show when={(part as any).state.status === "completed"}>
                          <details class="mt-2">
                            <summary class="cursor-pointer text-sm opacity-70">
                              View output
                            </summary>
                            <pre class="text-xs mt-2 overflow-x-auto bg-base-300 p-2 rounded">
                              {(part as any).state.output}
                            </pre>
                          </details>
                        </Show>

                        <Show when={(part as any).state.status === "error"}>
                          <div class="text-error text-sm mt-2">
                            {(part as any).state.error}
                          </div>
                        </Show>
                      </div>
                    </div>
                  </Match>
                </Switch>
              )}
            </For>

            <Show
              when={"tokens" in props.message.info && props.message.info.tokens}
            >
              <div class="text-xs text-base-content/60 mt-2">
                {/* model/mode • tokens • cost */}
                {(() => {
                  const info: any = props.message.info as any;
                  const model =
                    info?.providerID && info?.modelID
                      ? `${info.providerID}/${info.modelID}`
                      : undefined;
                  const mode = info?.mode;
                  const parts: string[] = [];
                  if (model || mode)
                    parts.push([model, mode].filter(Boolean).join(" "));
                  const toks = formatTokens(info.tokens);
                  if (toks) parts.push(toks);
                  if (typeof info.cost === "number")
                    parts.push(formatCost(info.cost));
                  return parts.join(" • ");
                })()}
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
}
