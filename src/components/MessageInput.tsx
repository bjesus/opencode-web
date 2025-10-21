import { createSignal, onMount, createEffect, Show, For } from "solid-js";
import type { OpenCodeClient, Provider, Agent } from "../api/client";
import {
  currentSessionId,
  currentMessages,
  isSending,
  setIsSending,
} from "../stores/session";

interface MessageInputProps {
  api: OpenCodeClient | null;
}

export default function MessageInput(props: MessageInputProps) {
  const [message, setMessage] = createSignal("");
  const [providers, setProviders] = createSignal<Provider[]>([]);
  const [agents, setAgents] = createSignal<Agent[]>([]);
  const [selectedProvider, setSelectedProvider] = createSignal<string>("");
  const [selectedModel, setSelectedModel] = createSignal<string>("");
  const [selectedAgent, setSelectedAgent] = createSignal<string>("");

  let textareaRef: HTMLTextAreaElement | undefined;

  onMount(async () => {
    if (!props.api) return;

    try {
      const [{ data: providersData }, { data: agentsData }] = await Promise.all(
        [props.api.config.providers(), props.api.app.agents()],
      );

      if (providersData) {
        setProviders(providersData.providers);

        if (providersData.providers.length > 0) {
          const defaultProvider = providersData.providers[0];
          setSelectedProvider(defaultProvider.id);

          const models = Object.keys(defaultProvider.models);
          if (models.length > 0) {
            setSelectedModel(models[0]);
          }
        }
      }

      if (agentsData) {
        setAgents(agentsData.filter((a) => a.mode !== "subagent"));

        if (agentsData.length > 0) {
          const buildAgent = agentsData.find((a) => a.name === "build");
          setSelectedAgent(buildAgent?.name || agentsData[0].name);
        }
      }

      updateFromLastMessage();
    } catch (error) {
      console.error("Failed to load models/agents:", error);
    }
  });

  // Update model/agent selection when messages change
  const updateFromLastMessage = () => {
    const lastMessage = [...currentMessages()]
      .reverse()
      .find((m: any) => m.info.role === "assistant");
    if (lastMessage && "modelID" in lastMessage.info) {
      setSelectedProvider(lastMessage.info.providerID);
      setSelectedModel(lastMessage.info.modelID);
      setSelectedAgent(lastMessage.info.mode);
    }
  };

  createEffect(() => {
    // Watch for changes in current session or messages
    const sessionId = currentSessionId();
    const messages = currentMessages();

    if (sessionId && messages.length > 0) {
      updateFromLastMessage();
    }
  });

  const handleSend = async () => {
    if (!props.api || !message().trim() || isSending() || !currentSessionId()) {
      return;
    }

    const text = message().trim();
    setMessage("");
    setIsSending(true);

    try {
      await props.api.session.prompt({
        path: { id: currentSessionId()! },
        body: {
          model: {
            providerID: selectedProvider(),
            modelID: selectedModel(),
          },
          agent: selectedAgent(),
          parts: [
            {
              type: "text",
              text,
            },
          ],
        },
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message");
      setMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentProvider = () => {
    return providers().find((p) => p.id === selectedProvider());
  };

  const availableModels = () => {
    const provider = currentProvider();
    if (!provider) return [];
    const models = Object.entries(provider.models as Record<string, any>);
    return models.map(([id, model]) => ({ id, name: (model as any).name }));
  };

  return (
    <div class="border-t border-base-300 bg-base-200 p-4">
      <div class="max-w-4xl mx-auto space-y-3">
        <div class="flex gap-2 flex-wrap">
          <select
            class="select select-sm basis-full sm:flex-1 sm:basis-0 min-w-[150px] max-w-none"
            value={selectedProvider()}
            onChange={(e) => {
              setSelectedProvider(e.currentTarget.value);
              const models = availableModels();
              if (models.length > 0) {
                setSelectedModel(models[0].id);
              }
            }}
          >
            <For each={providers()}>
              {(provider) => (
                <option value={provider.id}>{provider.name}</option>
              )}
            </For>
          </select>

          <select
            class="select select-sm basis-full sm:flex-1 sm:basis-0 min-w-[150px] max-w-none"
            value={selectedModel()}
            onChange={(e) => setSelectedModel(e.currentTarget.value)}
          >
            <For each={availableModels()}>
              {(model) => <option value={model.id}>{model.name}</option>}
            </For>
          </select>

          <select
            class="select select-sm basis-full sm:flex-1 sm:basis-0 min-w-[150px] max-w-none"
            value={selectedAgent()}
            onChange={(e) => setSelectedAgent(e.currentTarget.value)}
          >
            <For each={agents()}>
              {(agent) => (
                <option value={agent.name}>
                  {agent.name}{" "}
                  {agent.description ? `- ${agent.description}` : ""}
                </option>
              )}
            </For>
          </select>
        </div>

        <div class="flex gap-2">
          <textarea
            ref={textareaRef}
            class="textarea flex-1 min-h-[60px] max-h-[200px] w-full"
            placeholder="Type a message... (Shift+Enter for new line)"
            value={message()}
            onInput={(e) => setMessage(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending()}
          />
          <button
            class="btn btn-primary"
            onClick={handleSend}
            disabled={!message().trim() || isSending()}
          >
            <Show when={isSending()} fallback="Send">
              <span class="loading loading-spinner loading-sm"></span>
            </Show>
          </button>
        </div>
      </div>
    </div>
  );
}
