import { createContext } from "react";

interface SettingsContext {
  settings: Settings;
  setSettings: (value: Settings) => void;
}

interface Settings {
  clusteringEnabled: boolean;
}

const SettingsContext = createContext<SettingsContext>({
  settings: { clusteringEnabled: true },
  setSettings: () => {},
});

export { SettingsContext };
