import { BehaviorSubject } from "rxjs";


export const defaultSelector = {
  theater_mode_container: '#full-bleed-container',
  page_manager: '#page-manager',
  masthead_container: '#masthead-container',
  video_parent_container: '.html5-video-container'
}
export const selectorsForCheck = {
  ytd_app: 'ytd-app',
  ytd_watch_flexy: 'ytd-watch-flexy',

  ytd_searchbox: 'ytd-searchbox',
  ytd_popup_container: 'ytd-popup-container',
  tp_yt_iron_dropdown: 'tp-yt-iron-dropdown',
}
export type ForSyncSettingsType = {
  [key: string]: unknown
} & SettingsType
export type SettingsType = {
  defaultSelector: typeof defaultSelector
  useShortcut: boolean;
  useFunction: boolean;
  useShortcutOnlyPopupEnabled: boolean
}
export const defaultSettings: SettingsType = {
  defaultSelector: defaultSelector,
  useShortcut: false,
  useFunction: false,
  useShortcutOnlyPopupEnabled: true
}
export const settings = new BehaviorSubject<SettingsType>(defaultSettings)

export async function syncSettings() {
  const result = await chrome.storage.local.get(null) ?? {}
  const nextSettings = { ...defaultSettings, ...result } as SettingsType
  settings.next(nextSettings)
  return nextSettings
}