import { ForSyncSettingsType, defaultSettings } from "../settings";

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) chrome.tabs.get(tab.id, (tab) => {
    !tab.url?.includes('youtube.com') &&
      tab.id && tab.url && chrome.tabs.update(tab.id, { url: 'https://www.youtube.com' })
  })
})

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      ...defaultSettings,
    })
  } else if (details.reason === 'update') {
    chrome.storage.local.get(null, (results) => {
      const updatedSettings: ForSyncSettingsType = { ...defaultSettings };
      for (const [key] of Object.entries(updatedSettings)) {
        if (Object.prototype.hasOwnProperty.call(results, key)) {
          updatedSettings[key] = results[key];
        }
      }
      chrome.storage.local.set({ ...updatedSettings })
    }
    )
  }
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'openOptions') {
    chrome.runtime.openOptionsPage()
  }
})