import { SettingsType, defaultSettings } from "../settings";

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) chrome.tabs.reload(tab.id)
  chrome.runtime.reload()
})

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      ...defaultSettings,
    })
  } else if (details.reason === 'update') {
    chrome.storage.local.get(null, (results) => {
      const updatedSettings: SettingsType = { ...defaultSettings };
      for (const [key] of Object.entries(updatedSettings)) {
        if (Object.prototype.hasOwnProperty.call(results, key)) {
          updatedSettings[key] = results[key];
        }
      }
      console.log('updatedSettings', updatedSettings);

      chrome.storage.local.set({ ...updatedSettings })
    }
    )
  }
})