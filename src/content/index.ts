import { distinctUntilChanged } from 'rxjs'
import { moveIconSvgString } from '../icons/moveIcon'
import { syncSettings } from '../settings'
import { getCurrentVideoSizeByWindow } from './actions/fit-mode'
import {
  createTip,
  deleteTip,
  restoreRepeat
} from './actions/repeat'
import { handleSearchBoxFocused } from './actions/searchBoxFocused'
import { setTransform } from './actions/transform'
import { DragAndZoom } from './actions/translate'
import {
  getVideoInfo
} from './actions/update-value'
import { shortcutBind, } from './events/shortcuts'
import { onTimeUpdate, videoEventGetVideoType } from './events/video'
import './index.scss'
import { applyDynamicStyles } from './initializer/inject-styles'
import { removeConfigs } from './initializer/remove-configs'
import setButton from './initializer/set-buttons'
import { WaitUntilAppend, mutationByAttrWith } from './mutations'
import { extractYouTubeId, toHHMMSS } from './utils'
import { behaviorSubjects, currentUrl } from './variables'


type YTMEActiveType = {
  youtubeId: string | null;
  isTheater: boolean;
}

if (chrome.runtime.lastError) console.log(chrome.runtime.lastError.message);
let loaded = false
const originalPushState = history.pushState
const originalReplaceState = history.replaceState

const {
  transformValue,
  optionsActive,
  transformMode,
  aToB,
} = behaviorSubjects

let dragAndZoomEvent: DragAndZoom | null = null
let videoElement: HTMLVideoElement | null
let videoWrapElement: HTMLElement | null
let videoWrapElementParent: HTMLElement | null
let timeout: number | null = null

let ytmeActive: YTMEActiveType = {
  youtubeId: null,
  isTheater: false
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'check') {
    const currentUrl = window.location.href
    const isYouTube = currentUrl.includes('youtube.com')
    const youtubeId = extractYouTubeId(currentUrl)
    const modeContainer = document.querySelector('ytd-watch-flexy') as HTMLElement
    const isTheater = modeContainer && !modeContainer.hasAttribute('hidden') && (modeContainer.hasAttribute('theater') || modeContainer.hasAttribute('full-bleed-player') || modeContainer.hasAttribute('fullscreen'))
    const ytmeEnabled = document.body.getAttribute('ytme-enabled')
    const ytmeRoot = document.querySelector('[ytme-root]')
    const hasYtmeRoot = ytmeRoot !== null
    if (!loaded) {
      sendResponse({ isYouTube, youtubeId, isTheater, ytmeEnabled })
    }
    if (!isYouTube) {
      sendResponse({ isYouTube })
    }
    if (!youtubeId) {
      sendResponse({ isYouTube })
    }
    if (!isTheater && !ytmeEnabled) {
      const theaterButton = document.querySelector('[aria-keyshortcuts="t"]') as HTMLElement
      theaterButton?.click()
      sendResponse({ isYouTube, youtubeId, isTheater, ytmeEnabled, hasYtmeRoot })
    }
    sendResponse({ isYouTube, youtubeId, isTheater, ytmeEnabled, hasYtmeRoot })
  }
  if (message.type === 'toggleTheater') {
    const theaterButton = document.querySelector('[aria-keyshortcuts="t"]') as HTMLElement
    theaterButton?.click()
  }
  if (message.type === 'openOptions') {
    optionsActive.next(!optionsActive.getValue())
    sendResponse({ success: true })
  }
  return true
})
function handleYtmeActive(value: YTMEActiveType) {
  if (value.isTheater === ytmeActive.isTheater && value.youtubeId === ytmeActive.youtubeId) {
    return
  }
  restoreRepeat()
  ytmeActive = value
  if (value.isTheater && value.youtubeId) {
    waitUntilCheckElements(value.youtubeId)
  } else {
    if (timeout) clearTimeout(timeout)
    removeConfigs()
  }
}


const main = async () => {
  loaded = false
  const settings = await syncSettings()
  detectYoutube()
  // 버튼 생성
  if (!settings.useFunction) return
  setButton()

  // a - b loop 이벤트
  aToB.pipe(distinctUntilChanged()).subscribe((value) => {
    const video = document.querySelector('video')
    const aButton = document.getElementById('ytme-a-button')
    const bButton = document.getElementById('ytme-b-button')
    const repeatButton = document.getElementById('ytme-repeat-button')
    if (!video) return
    if (!aButton) return
    if (!bButton) return
    if (!repeatButton) return
    if (value.a !== null) {
      aButton.setAttribute('data-ytme-state', 'active')
      if (value.a < video.duration) {
        aButton.textContent = `A, ${toHHMMSS(value.a)}`
      } else {
        aButton.textContent = `A, Out of range`
      }
      createTip('start', (value.a / video.duration) * 100)
    } else if (value.a === null) {
      aButton.removeAttribute('data-ytme-state')
      aButton.textContent = `A`
      deleteTip('start')
    }
    if (value.b !== null) {
      bButton.setAttribute('data-ytme-state', 'active')
      if (value.b < video.duration) {
        bButton.textContent = `B, ${toHHMMSS(value.b)}`
      } else {
        bButton.textContent = `B, Out of range`
      }
      createTip('end', (value.b / video.duration) * 100)
    } else if (value.b === null) {
      bButton.removeAttribute('data-ytme-state')
      bButton.textContent = `B`
      deleteTip('end')
    }
    if (value.repeat === true) {
      repeatButton.setAttribute('data-ytme-state', 'active')
      repeatButton.textContent = `On`
      video.addEventListener('timeupdate', onTimeUpdate)
    } else if (value.repeat === false) {
      repeatButton.removeAttribute('data-ytme-state')
      repeatButton.textContent = `Off`
      video.removeEventListener('timeupdate', onTimeUpdate)
    }
  })
  // 드래그 이벤트
  transformValue.subscribe((value) => {
    setTransform(value)
  })
  // 기능 버튼 클릭 이벤트
  optionsActive.subscribe((value) => {
    const ytmeRoot = document.querySelector('[ytme-root]') as HTMLElement
    const pageWrap = document.querySelector(settings.defaultSelector.page_manager) as HTMLElement
    if (value) {
      ytmeRoot?.setAttribute('data-ytme-state', 'active')
      if (settings.useShortcut && settings.useShortcutOnlyPopupEnabled) {
        pageWrap?.addEventListener('keydown', shortcutBind)
        ytmeRoot?.addEventListener('keydown', shortcutBind)
        ytmeRoot?.focus()
      }
    } else {
      ytmeRoot?.removeAttribute('data-ytme-state')
      if (!settings.useShortcutOnlyPopupEnabled) transformMode.next(false)
      if (settings.useShortcut && settings.useShortcutOnlyPopupEnabled) {
        pageWrap?.removeEventListener('keydown', shortcutBind)
        ytmeRoot?.removeEventListener('keydown', shortcutBind)
      }
    }
  })

  // transform mode on / off 이벤트
  transformMode.pipe(distinctUntilChanged()).subscribe((value) => {
    const videoContainer = document.querySelector(settings.defaultSelector.theater_mode_container) as HTMLElement
    const transformModeButton = document.querySelector(
      '[ytme-transform]'
    ) as HTMLElement
    if (dragAndZoomEvent && videoContainer) {
      videoContainer.removeEventListener('mousedown', dragAndZoomEvent.on)
      videoContainer.removeEventListener('wheel', dragAndZoomEvent.onWheel)
    }
    if (dragAndZoomEvent) {
      if (value) {
        if (transformModeButton) {
          transformModeButton.setAttribute('data-ytme-state', 'active')
          transformModeButton.innerHTML = `${moveIconSvgString}On`
        }
        videoContainer?.addEventListener('mousedown', dragAndZoomEvent.on, true)
        videoContainer?.addEventListener('wheel', dragAndZoomEvent.onWheel, true)
      } else {
        if (transformModeButton) {
          transformModeButton.removeAttribute('data-ytme-state')
          transformModeButton.innerHTML = `${moveIconSvgString}Off`
        }
        videoContainer?.removeEventListener(
          'mousedown',
          dragAndZoomEvent.on,
          true
        )
        videoContainer?.removeEventListener(
          'wheel',
          dragAndZoomEvent.onWheel,
          true
        )
      }
    }
  })
}
main()
function detectYoutube() {
  function updateLastUrl(mutation: MutationRecord) {
    if (mutation.type === 'attributes') {
      handleYtmeActive({ ...ytmeActive, youtubeId: currentUrl() })
    }
  }
  function checkTheaterMode(mutation: MutationRecord) {
    const mutationTarget = mutation.target as HTMLElement
    if (
      !mutationTarget.hasAttribute('hidden') &&
      (mutationTarget.hasAttribute('theater') ||
        mutationTarget.hasAttribute('full-bleed-player') ||
        mutationTarget.hasAttribute('fullscreen'))
    ) {
      handleYtmeActive({
        isTheater: true, youtubeId: currentUrl()
      })
    } else {
      handleYtmeActive({
        ...ytmeActive,
        isTheater: false,
      })
    }
  }
  function updateFocus(mutation: MutationRecord) {
    if (
      mutation.attributeName === 'focused' ||
      mutation.attributeName === 'has-focus'
    ) {
      handleSearchBoxFocused(
        (mutation.target instanceof HTMLElement &&
          mutation.target.hasAttribute('focused')) ||
        (mutation.target instanceof HTMLElement &&
          mutation.target.hasAttribute('has-focus')))
    }
  }
  // check watch page
  mutationByAttrWith('ytd-app', updateLastUrl)
  // check focus search box
  mutationByAttrWith('ytd-searchbox', updateFocus)
  // check focus header popup
  WaitUntilAppend('ytd-popup-container', 'tp-yt-iron-dropdown', updateFocus, {
    attributes: false,
    subtree: false,
    childList: true,
  })
  // check theater mode
  WaitUntilAppend('ytd-app', 'ytd-watch-flexy', checkTheaterMode, {
    attributes: false,
    subtree: true,
    childList: true,
  })
  history.pushState = function (...args) {
    originalPushState.apply(this, args)
    handleYtmeActive({ ...ytmeActive, youtubeId: currentUrl() })
  }
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args)
    handleYtmeActive({ ...ytmeActive, youtubeId: currentUrl() })
  }
  window.addEventListener('popstate', function () {
    handleYtmeActive({ ...ytmeActive, youtubeId: currentUrl() })
  })

  loaded = true
}

function waitUntilCheckElements(youtubeId: string) {
  document.body.setAttribute('ytme-enabled', youtubeId)
  videoElement = document.querySelector('video')
  videoWrapElement = document.querySelector(
    '.html5-video-container'
  ) as HTMLElement
  videoWrapElementParent = videoWrapElement?.parentElement as HTMLElement
  if (videoElement && videoWrapElement && videoWrapElementParent) {
    runYtme({
      video: videoElement,
      videoParentElement: videoWrapElement,
      videoContainer: videoWrapElementParent
    })
  } else {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      waitUntilCheckElements(youtubeId)
    }, 300)
  }
}
async function runYtme(results: {
  video: HTMLVideoElement
  videoParentElement: HTMLElement
  videoContainer: HTMLElement
}) {

  const settings = await syncSettings()
  const {
    video,
    videoParentElement,
    videoContainer
  } = results
  applyDynamicStyles(settings.defaultSelector, {
    disableFunctions: !settings.useFunction,
    experimental: settings.stickyVideo,
  })


  // 드래그 이벤트 생성
  if (!dragAndZoomEvent) {
    dragAndZoomEvent = new DragAndZoom(
      behaviorSubjects.transformValue,
      videoParentElement,
      videoContainer
    )
  }

  // 비디오 정보 확인
  getVideoInfo(video)
  const { resizedWidth, resizedHeight } = getCurrentVideoSizeByWindow(video)

  video.style.width = resizedWidth + 'px'
  video.style.height = resizedHeight + 'px'
  video.addEventListener('loadedmetadata', videoEventGetVideoType)

  const pageWrap = document.querySelector(settings.defaultSelector.page_manager) as HTMLElement

  if (settings.useShortcut && !settings.useShortcutOnlyPopupEnabled) {
    pageWrap?.removeEventListener('keydown', shortcutBind)
    pageWrap?.addEventListener('keydown', shortcutBind)
  }

}