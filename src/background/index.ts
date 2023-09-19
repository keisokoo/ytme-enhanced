console.log('background')
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) chrome.tabs.reload(tab.id)
  chrome.runtime.reload()
})

function reloadForDev() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError) return
    const activeTab = tabs[0];
    if (activeTab.id) {
      chrome.tabs.reload(activeTab.id)
    }
  });
}