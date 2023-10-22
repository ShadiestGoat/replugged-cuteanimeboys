import { settings } from "replugged";

export interface Settings {
  nsfwFilter: string;
}

export enum NSFWFilter {
  UNSET = "0",
  EXCL_SFW = "-1",
  EXCL_NSFW = "1",
}

export const options = [
  {
    label: "SFW & NSFW",
    value: NSFWFilter.UNSET,
  },
  {
    label: "SFW Only",
    value: NSFWFilter.EXCL_SFW,
  },
  {
    label: "NSFW Only",
    value: NSFWFilter.EXCL_NSFW,
  },
]

export const defaultSettings: Partial<Settings> = {
  nsfwFilter: NSFWFilter.UNSET,
};

export const cfg = await settings.init<Settings, keyof typeof defaultSettings>(
  "eu.shadygoat.CuteAnimeBoys",
  defaultSettings,
);
