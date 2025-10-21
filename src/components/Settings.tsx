import { createSignal, For } from "solid-js";
import {
  config,
  updateApiEndpoint,
  updateTheme,
  AVAILABLE_THEMES,
  type Theme,
} from "../stores/config";
import { createClient } from "../api/client";

interface SettingsProps {
  onClose: () => void;
}

export default function Settings(props: SettingsProps) {
  const [endpoint, setEndpoint] = createSignal(
    config().apiEndpoint || "http://localhost:9999",
  );
  const [selectedTheme, setSelectedTheme] = createSignal<Theme>(config().theme);
  const [error, setError] = createSignal("");

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    updateTheme(theme);
  };

  const handleSave = async () => {
    const url = endpoint().trim();

    if (!url) {
      setError("API endpoint is required");
      return;
    }

    try {
      const client = createClient(url);
      const { data } = await client.session.list();
      if (!data) {
        throw new Error("Failed to connect");
      }

      updateApiEndpoint(url);
      updateTheme(selectedTheme());
      setError("");
      window.location.reload();
    } catch (e) {
      setError(
        "Failed to connect to API endpoint. Please check the URL and try again.",
      );
    }
  };

  return (
    <div class="card w-full max-w-lg bg-base-200 shadow-xl">
      <div class="card-body space-y-6">
        <h2 class="card-title text-2xl">OpenCode Settings</h2>

        <div class="space-y-2">
          <label
            for="settings-api-endpoint"
            class="text-sm font-medium text-base-content"
          >
            API Endpoint
          </label>
          <input
            id="settings-api-endpoint"
            type="text"
            placeholder="http://localhost:9999"
            class="input w-full max-w-none"
            value={endpoint()}
            onInput={(e) => setEndpoint(e.currentTarget.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSave();
              }
            }}
          />
          <p class="text-xs text-base-content/70">
            Enter the URL of your OpenCode API server.
          </p>
        </div>

        <div class="space-y-2">
          <label
            for="settings-theme"
            class="text-sm font-medium text-base-content"
          >
            Theme
          </label>
          <select
            id="settings-theme"
            class="select w-full max-w-none"
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
          <p class="text-xs text-base-content/70">
            Choose your preferred theme.
          </p>
        </div>

        {error() && (
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
            <span>{error()}</span>
          </div>
        )}

        <div class="card-actions justify-end gap-2">
          {config().apiEndpoint && (
            <button class="btn btn-ghost" onClick={props.onClose}>
              Close
            </button>
          )}
          <button class="btn btn-primary" onClick={handleSave}>
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
}
