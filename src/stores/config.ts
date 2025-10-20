import { createSignal, createEffect } from 'solid-js';

const STORAGE_KEY = 'opencode-config';

export const AVAILABLE_THEMES = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
  'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
  'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade',
  'night', 'coffee', 'winter', 'dim', 'nord', 'sunset'
] as const;

export type Theme = typeof AVAILABLE_THEMES[number];

interface Config {
  apiEndpoint: string;
  theme: Theme;
}

const defaultConfig: Config = {
  apiEndpoint: '',
  theme: 'dark',
};

function loadConfig(): Config {
  const stored = localStorage.getItem(STORAGE_KEY);
  let cfg = defaultConfig;
  if (stored) {
    try {
      cfg = { ...defaultConfig, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Failed to parse stored config:', e);
    }
  }
  const fromEnv = (import.meta as any).env?.VITE_API_DEFAULT as string | undefined;
  if (!cfg.apiEndpoint && fromEnv) {
    cfg = { ...cfg, apiEndpoint: fromEnv };
  }
  return cfg;
}

function saveConfig(config: Config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export const [config, setConfig] = createSignal<Config>(loadConfig());

createEffect(() => {
  saveConfig(config());
  document.documentElement.setAttribute('data-theme', config().theme);
});

export function updateApiEndpoint(endpoint: string) {
  setConfig((c) => ({ ...c, apiEndpoint: endpoint }));
}

export function updateTheme(theme: Theme) {
  setConfig((c) => ({ ...c, theme }));
}
