import { Show, onMount, onCleanup, createSignal } from "solid-js";
import { config } from "./stores/config";
import { createClient, type OpenCodeClient } from "./api/client";
import { subscribeToEvents } from "./api/sse";
import {
  setSessions,
  currentSessionId,
  setCurrentSessionId,
  setSessionMessages,
  updateMessage,
  updatePart,
} from "./stores/session";
import SessionList from "./components/SessionList";
import ChatView from "./components/ChatView";
import MessageInput from "./components/MessageInput";
import Settings from "./components/Settings";

export default function App() {
  const [api, setApi] = createSignal<OpenCodeClient | null>(null);
  const [showSettings, setShowSettings] = createSignal(false);

  onMount(async () => {
    const endpoint = config().apiEndpoint;

    if (!endpoint) {
      setShowSettings(true);
      return;
    }

    const client = createClient(endpoint);
    setApi(client);

    try {
      const { data: sessionList } = await client.session.list();
      if (!sessionList) throw new Error("Failed to fetch sessions");

      setSessions(sessionList.sort((a, b) => b.time.updated - a.time.updated));

      if (sessionList.length > 0) {
        setCurrentSessionId(sessionList[0].id);
        const { data: msgs } = await client.session.messages({
          path: { id: sessionList[0].id },
        });
        if (msgs) {
          setSessionMessages(sessionList[0].id, msgs);
        }
      }

      const sub: any = await client.event.subscribe();
      const stream = sub?.data?.stream ?? sub?.stream;
      if (stream) {
        subscribeToEvents(stream, {
          onMessageCreated: (data) => {
            updateMessage(data.info.sessionID, data.info.id, data.info);
          },
          onMessageUpdate: (data) => {
            updateMessage(data.info.sessionID, data.info.id, data.info);
          },
          onPartCreated: (data) => {
            updatePart(data.part.sessionID, data.part.messageID, data.part);
          },
          onPartUpdate: (data) => {
            updatePart(data.part.sessionID, data.part.messageID, data.part);
          },
        });
      }
    } catch (error) {
      console.error("Failed to initialize:", error);
      alert("Failed to connect to OpenCode API. Please check your settings.");
      setShowSettings(true);
    }
  });

  onCleanup(() => {
    // Event stream cleanup handled by SDK
  });

  return (
    <div class="h-screen flex flex-col bg-base-100">
      <Show
        when={!showSettings() && config().apiEndpoint}
        fallback={<Settings onClose={() => setShowSettings(false)} />}
      >
        <div class="drawer lg:drawer-open h-full">
          <input id="drawer-toggle" type="checkbox" class="drawer-toggle" />

          <div class="drawer-content flex flex-col max-h-screen">
            <div class="navbar bg-base-200 lg:hidden">
              <div class="flex-none">
                <label for="drawer-toggle" class="btn btn-square btn-ghost">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block w-6 h-6 stroke-current"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                </label>
              </div>
              <div class="flex-1">
                <span class="text-lg font-bold">OpenCode</span>
              </div>
              <div class="flex-none">
                <button
                  class="btn btn-square btn-ghost"
                  onClick={() => setShowSettings(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block w-6 h-6 stroke-current"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    ></path>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex-1 flex flex-col overflow-hidden">
              <ChatView api={api()} />
              <Show when={currentSessionId()}>
                <MessageInput api={api()} />
              </Show>
            </div>
          </div>

          <div class="drawer-side">
            <label for="drawer-toggle" class="drawer-overlay"></label>
            <div class="w-80 h-full bg-base-200 flex flex-col">
              <div class="p-4 flex justify-between items-center border-b border-base-300">
                <h2 class="text-xl font-bold">OpenCode</h2>
                <button
                  class="btn btn-square btn-ghost btn-sm hidden lg:flex"
                  onClick={() => setShowSettings(true)}
                  title="Settings"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block w-5 h-5 stroke-current"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    ></path>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                </button>
              </div>
              <SessionList api={api()} />
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}
