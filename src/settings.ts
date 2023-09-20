import { BehaviorSubject } from "rxjs";
import { defaultSelector } from "./content/injectionStyles";

export type SettingsType = {
  [key: string]: any
  defaultSelector: typeof defaultSelector
  useShortcut: boolean;
  useFunction: boolean;
}
export const defaultSettings: SettingsType = {
  defaultSelector: defaultSelector,
  useShortcut: false,
  useFunction: false
}
export const settings = new BehaviorSubject<SettingsType>(defaultSettings)

export function syncSettings() {
  chrome.storage.local.get(null, (result) => {
    if (!result) return
    if (typeof result !== 'object') return
    const nextSettings = { ...defaultSettings, ...result } as SettingsType
    settings.next(nextSettings)
  })
}