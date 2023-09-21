export function handleOpenOptionsPage() {
  if (chrome.runtime.lastError) return
  chrome.runtime.sendMessage({ type: 'openOptions' })
}

