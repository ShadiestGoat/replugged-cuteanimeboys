import { settings } from "replugged";

export interface Settings {
  includeNSFW: boolean;
}

export const defaultSettings: Partial<Settings> = {
  includeNSFW: false,
};

export const cfg = await settings.init<Settings, keyof typeof defaultSettings>(
  "eu.shadygoat.CuteAnimeBoys",
  defaultSettings,
);
