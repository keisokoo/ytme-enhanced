import './index.scss'
const originalPushState = history.pushState
function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)

  if (match && match[2].length === 11) {
    return match[2]
  } else {
    return null
  }
}
const currentUrl = () => extractYouTubeId(window.location.href)
let lastUrl = currentUrl()

console.log('lastUrl12', lastUrl)
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (
      mutation.type === 'attributes' &&
      mutation.attributeName === 'href' &&
      lastUrl !== currentUrl()
    ) {
      lastUrl = currentUrl()
      console.log('URL changed to', window.location.href)
    }
  })
})

observer.observe(document.body, { attributes: true, subtree: true })
history.pushState = function (...args) {
  originalPushState.apply(this, args)
  console.log('URL changed to, pushState', window.location.href)
  lastUrl = currentUrl()
}

const originalReplaceState = history.replaceState

history.replaceState = function (...args) {
  originalReplaceState.apply(this, args)
  console.log('URL replaced to, replaceState', window.location.href)
  lastUrl = currentUrl()
}
window.addEventListener('popstate', function (event) {
  console.log('URL changed to, popstate', window.location.href)
  lastUrl = currentUrl()
})
