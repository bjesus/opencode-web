import { For, Show, createSignal } from 'solid-js';
import type { OpenCodeClient } from '../api/client';
import {
  sessions,
  currentSessionId,
  setCurrentSessionId,
  addSession,
  updateSession,
  removeSession,
  setSessionMessages,
} from '../stores/session';

interface SessionListProps {
  api: OpenCodeClient | null;
}

export default function SessionList(props: SessionListProps) {
  const [isCreating, setIsCreating] = createSignal(false);
  const [editingId, setEditingId] = createSignal<string | null>(null);
  const [editingTitle, setEditingTitle] = createSignal('');

  const handleCreateSession = async () => {
    if (!props.api || isCreating()) return;
    
    setIsCreating(true);
    try {
      const { data: session } = await props.api.session.create({ body: {} });
      if (session) {
        addSession(session);
        setCurrentSessionId(session.id);
        setSessionMessages(session.id, []);
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    if (!props.api || sessionId === currentSessionId()) return;
    
    setCurrentSessionId(sessionId);
    try {
      const { data: messages } = await props.api.session.messages({
        path: { id: sessionId },
      });
      if (messages) {
        setSessionMessages(sessionId, messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleStartEdit = (sessionId: string, currentTitle: string) => {
    setEditingId(sessionId);
    setEditingTitle(currentTitle);
  };

  const handleSaveEdit = async (sessionId: string) => {
    if (!props.api) return;
    
    const newTitle = editingTitle().trim();
    if (!newTitle) return;

    try {
      const { data: updated } = await props.api.session.update({
        path: { id: sessionId },
        body: { title: newTitle },
      });
      if (updated) {
        updateSession(updated);
      }
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleForkSession = async (sessionId: string) => {
    if (!props.api) return;

    try {
      // Get the last message from the session to fork from
      const { data: messages } = await props.api.session.messages({
        path: { id: sessionId },
      });
      
      if (!messages || messages.length === 0) {
        alert('Cannot fork an empty session');
        return;
      }

      // Fork from the last message
      const lastMessageId = messages[messages.length - 1].info.id;
      
      const { data: forkedSession } = await props.api.session.create({
        body: {
          parentID: sessionId,
          messageID: lastMessageId,
        },
      });

      if (forkedSession) {
        addSession(forkedSession);
        setCurrentSessionId(forkedSession.id);
        
        // Load messages for the new session
        const { data: forkedMessages } = await props.api.session.messages({
          path: { id: forkedSession.id },
        });
        if (forkedMessages) {
          setSessionMessages(forkedSession.id, forkedMessages);
        }
      }
    } catch (error) {
      console.error('Failed to fork session:', error);
      alert('Failed to fork session');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!props.api) return;
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      await props.api.session.delete({ path: { id: sessionId } });
      removeSession(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  return (
    <div class="flex-1 flex flex-col overflow-hidden">


      <div class="flex-1 overflow-y-auto">
        <For each={sessions()}>
          {(session) => (
            <div
              class={`p-4 border-b border-base-300 cursor-pointer hover:bg-base-300 transition-colors ${
                currentSessionId() === session.id ? 'bg-base-300' : ''
              }`}
              onClick={() => handleSelectSession(session.id)}
            >
              <Show
                when={editingId() === session.id}
                fallback={
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <div class="font-medium truncate">{session.title}</div>
                      <div class="text-sm text-base-content/60">
                        {formatDate(session.time.updated)}
                      </div>
                    </div>
                    <div class="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
                      <label tabindex="0" class="btn btn-ghost btn-xs btn-square">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 stroke-current">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                        </svg>
                      </label>
                      <ul tabindex="0" class="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                          <a onClick={() => handleStartEdit(session.id, session.title)}>
                            Rename
                          </a>
                        </li>
                        <li>
                          <a onClick={() => handleForkSession(session.id)}>
                            Fork Session
                          </a>
                        </li>
                        <li>
                          <a onClick={() => handleDeleteSession(session.id)} class="text-error">
                            Delete
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                }
              >
                <div class="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    class="input input-sm flex-1 w-full max-w-none"
                    value={editingTitle()}
                    onInput={(e) => setEditingTitle(e.currentTarget.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(session.id);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    autofocus
                  />
                  <button
                    class="btn btn-sm btn-primary"
                    onClick={() => handleSaveEdit(session.id)}
                  >
                    ✓
                  </button>
                  <button
                    class="btn btn-sm btn-ghost"
                    onClick={handleCancelEdit}
                  >
                    ✕
                  </button>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
