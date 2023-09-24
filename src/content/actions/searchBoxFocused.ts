import { SettingsType } from "../../settings"

export function handleSearchBoxFocused(value: boolean) {
  chrome.storage.local.get(null, (settings) => {
    settings = settings as SettingsType
    if (value) {
      document
        .querySelector(settings.defaultSelector.masthead_container)
        ?.setAttribute('has-focus', '')
    } else {
      document
        .querySelector(settings.defaultSelector.masthead_container)
        ?.removeAttribute('has-focus')
    }
  })
}