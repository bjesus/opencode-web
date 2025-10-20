import { createSignal, For } from 'solid-js';
import { config, updateApiEndpoint, updateTheme, AVAILABLE_THEMES, type Theme } from '../stores/config';
import { createClient } from '../api/client';

interface SettingsProps {
  onClose: () => void;
}

export default function Settings(props: SettingsProps) {
  const [endpoint, setEndpoint] = createSignal(config().apiEndpoint || 'http://localhost:9999');
  const [selectedTheme, setSelectedTheme] = createSignal<Theme>(config().theme);
  const [error, setError] = createSignal('');

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    updateTheme(theme);
  };

  const handleSave = async () => {
    const url = endpoint().trim();
    
    if (!url) {
      setError('API endpoint is required');
      return;
    }

    try {
      const client = createClient(url);
      const { data } = await client.session.list();
      if (!data) {
        throw new Error('Failed to connect');
      }
      
      updateApiEndpoint(url);
      updateTheme(selectedTheme());
      setError('');
      window.location.reload();
    } catch (e) {
      setError('Failed to connect to API endpoint. Please check the URL and try again.');
    }
  };

  return (
    <div class="h-screen flex items-center justify-center bg-base-100 p-4">
      <div class="card w-full max-w-lg bg-base-200 shadow-xl">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">OpenCode Settings</h2>
          
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text">API Endpoint</span>
            </label>
            <input
              type="text"
              placeholder="http://localhost:9999"
              class="input input-bordered w-full"
              value={endpoint()}
              onInput={(e) => setEndpoint(e.currentTarget.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
            <label class="label">
              <span class="label-text-alt">
                Enter the URL of your OpenCode API server
              </span>
            </label>
          </div>

          <div class="form-control w-full mt-4">
            <label class="label">
              <span class="label-text">Theme</span>
            </label>
            <select
              class="select select-bordered w-full"
              value={selectedTheme()}
              onChange={(e) => handleThemeChange(e.currentTarget.value as Theme)}
            >
              <For each={AVAILABLE_THEMES}>
                {(theme) => (
                  <option value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                )}
              </For>
            </select>
            <label class="label">
              <span class="label-text-alt">
                Choose your preferred theme
              </span>
            </label>
          </div>

          {error() && (
            <div class="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error()}</span>
            </div>
          )}

          <div class="card-actions justify-end mt-4">
            {config().apiEndpoint && (
              <button class="btn btn-ghost" onClick={props.onClose}>
                Cancel
              </button>
            )}
            <button class="btn btn-primary" onClick={handleSave}>
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
