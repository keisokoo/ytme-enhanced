import { ForSyncSettingsType, SettingsType, defaultSettings } from "../settings";

type CheckResult = {
  isYouTube?: boolean, youtubeId?: string, isTheater?: boolean, ytmeEnabled?: string, hasYtmeRoot?: boolean
}
function checkWithClient(tab: chrome.tabs.Tab, callback: (result: CheckResult) => void) {
  try {
    if (!tab.id) return false
    chrome.tabs.sendMessage(tab.id!, { type: 'check' }, (response: CheckResult) => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError)
        chrome.runtime.reload()
        chrome.tabs.reload(tab.id!)
        return false
      }
      callback(response)
      return false
    })
  } catch (error) {
    console.log(error);

  }

}
function buttonAction(tab: chrome.tabs.Tab) {
  try {

    const isYouTube = tab.url?.includes('youtube.com')
    if (!isYouTube && tab.id) {
      chrome.tabs.update(tab.id, { url: 'https://www.youtube.com' })
      return
    }
    checkWithClient(tab, (result) => {
      if (!result) return false
      if (!result.youtubeId) return false
      if (result.isTheater && !result.ytmeEnabled) {
        chrome.runtime.reload()
        chrome.tabs.reload(tab.id!)
        return false
      }
      if (result.isTheater && result.ytmeEnabled) {
        chrome.storage.local.get(null, (settings) => {
          settings = settings as SettingsType
          if (!settings.useFunction) {
            chrome.tabs.sendMessage(tab.id!, {
              type: 'toggleTheater',
              url: tab.url
            }, () => {
              if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError)
              }
            })
            return false
          }
          if (!result.hasYtmeRoot) {
            chrome.runtime.reload()
            chrome.tabs.reload(tab.id!)
            return false
          }
          chrome.tabs.sendMessage(tab.id!, {
            type: 'openOptions',
            url: tab.url
          }, () => {
            if (chrome.runtime.lastError) {
              console.log(chrome.runtime.lastError)
            }
            return false
          })
        })
        return false
      }

    })
  } catch (error) {
    console.log(error);

  }
}
chrome.action.onClicked.addListener(buttonAction)

chrome.commands.onCommand.addListener((command: string, tab) => {
  if (command === '_execute_action') {
    buttonAction(tab)
  }
});
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
    sendResponse({ success: true })
  }
  if (message.type === 'reload') {
    sender.tab && chrome.tabs.reload(sender.tab.id!)
    chrome.runtime.reload()
  }
  return false
})