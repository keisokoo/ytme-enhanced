export function handleOpenOptionsPage() {
  try {
    if (chrome.runtime.lastError) return
    chrome.runtime.sendMessage({ type: 'openOptions' }, () => {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError)
      }
    })
  } catch (error) {
    console.log(error);

  }
}

