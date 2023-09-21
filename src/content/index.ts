import { distinctUntilChanged } from 'rxjs'
import { syncSettings } from '../settings'
import {
  createTip,
  deleteTip,
  restoreRepeat
} from './actions/repeat'
import { setTransform } from './actions/transform'
import { DragAndZoom } from './actions/translate'
import {
  getVideoInfo
} from './actions/update-value'
import { shortcutBind } from './events/shortcuts'
import { onTimeUpdate, videoEventGetVideoType } from './events/video'
import './index.scss'
import { applyDynamicStyles } from './initializer/inject-styles'
import { removeConfigs } from './initializer/remove-configs'
import setButton from './initializer/set-buttons'
import { WaitUntilAppend, mutationByAttrWith } from './mutations'
import { toHHMMSS } from './utils'
import { behaviorSubjects, currentUrl } from './variables'

const originalPushState = history.pushState
const originalReplaceState = history.replaceState

const {
  ytmeActive,
  searchBoxFocused,
  transformValue,
  optionsActive,
  translateMode,
  aToB,
  activeCheck,
} = behaviorSubjects

let dragAndZoomEvent: DragAndZoom | null = null
let videoElement: HTMLVideoElement | null
let rightControlsElement: HTMLElement | null
let youtubeControlBottomElement: HTMLElement | null
let videoWrapElement: HTMLElement | null
let videoWrapElementParent: HTMLElement | null
let timeout: number | null = null

let activeObserver: MutationObserver | null = null

const main = async () => {
  detectYoutube()
}
main()

function detectYoutube() {
  activeCheck.pipe(distinctUntilChanged()).subscribe((value) => {
    if (value) {
      waitUntilCheckElements(value)
    } else if (value === '') {
      if (timeout) clearTimeout(timeout)
      removeConfigs()
    }
  })
  ytmeActive.pipe(distinctUntilChanged()).subscribe((value) => {
    if (activeObserver) activeObserver.disconnect()
    if (value.youtubeId !== null && activeObserver === null && !value.isTheater) {
      activeObserver = mutationByAttrWith('ytd-watch-flexy', checkTheaterMode)
    }
    if (value.isTheater && value.youtubeId) {
      activeCheck.next(value.youtubeId)
    } else {
      activeCheck.next('')
    }
    restoreRepeat()
  })

  searchBoxFocused.pipe(distinctUntilChanged()).subscribe((value) => {
    if (value) {
      document
        .querySelector('#masthead-container')
        ?.setAttribute('has-focus', '')
    } else {
      document
        .querySelector('#masthead-container')
        ?.removeAttribute('has-focus')
    }
  })

  function updateLastUrl(mutation: MutationRecord) {
    if (mutation.type === 'attributes') {
      ytmeActive.next({ ...ytmeActive.getValue(), youtubeId: currentUrl() })
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
      ytmeActive.next({
        isTheater: true, youtubeId: currentUrl()
      })
    } else {
      ytmeActive.next({
        ...ytmeActive.getValue(),
        isTheater: false,
      })
    }
  }

  function updateFocus(mutation: MutationRecord) {
    if (
      mutation.attributeName === 'focused' ||
      mutation.attributeName === 'has-focus'
    ) {
      searchBoxFocused.next(
        (mutation.target instanceof HTMLElement &&
          mutation.target.hasAttribute('focused')) ||
        (mutation.target instanceof HTMLElement &&
          mutation.target.hasAttribute('has-focus'))
      )
    }
  }
  // check watch page
  mutationByAttrWith('ytd-app', updateLastUrl)
  // check focus search box
  WaitUntilAppend('ytd-app', 'ytd-searchbox', updateFocus, {
    attributes: false,
    subtree: true,
    childList: true,
  })
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
    ytmeActive.next({ ...ytmeActive.getValue(), youtubeId: currentUrl() })
  }
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args)
    ytmeActive.next({ ...ytmeActive.getValue(), youtubeId: currentUrl() })
  }
  window.addEventListener('popstate', function (event) {
    ytmeActive.next({ ...ytmeActive.getValue(), youtubeId: currentUrl() })
  })
}

function waitUntilCheckElements(youtubeId: string) {
  document.body.setAttribute('ytme-enabled', youtubeId)
  videoElement = document.querySelector('video')
  rightControlsElement = document.querySelector('.ytp-right-controls')
  youtubeControlBottomElement = document.querySelector('.ytp-chrome-bottom') as HTMLElement
  videoWrapElement = document.querySelector(
    '.html5-video-container'
  ) as HTMLElement
  videoWrapElementParent = videoWrapElement?.parentElement as HTMLElement
  if (videoElement && rightControlsElement && videoWrapElement && youtubeControlBottomElement && videoWrapElementParent) {
    runYtme({
      video: videoElement,
      rightControls: rightControlsElement,
      videoParentElement: videoWrapElement,
      youtubeControlBottom: youtubeControlBottomElement,
      videoContainer: videoWrapElementParent
    })
  } else {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      waitUntilCheckElements(youtubeId)
    }, 150)
  }
}
async function runYtme(results: {
  video: HTMLVideoElement
  rightControls: HTMLElement
  videoParentElement: HTMLElement
  youtubeControlBottom: HTMLElement
  videoContainer: HTMLElement
}) {
  const settings = await syncSettings()
  const {
    video,
    rightControls,
    videoParentElement,
    youtubeControlBottom,
    videoContainer
  } = results

  applyDynamicStyles(settings.defaultSelector)

  if (!settings.useFunction) return

  // Functions 영역 생성
  if (document.querySelector('[ytme-dom]')) {
    document.querySelector('[ytme-dom]')!.remove()
  }
  const ytme_dom = document.createElement('div')
  const ytmeRoot = document.createElement('div')
  ytme_dom.setAttribute('ytme-dom', '')
  ytmeRoot.setAttribute('ytme-root', '')
  youtubeControlBottom.appendChild(ytme_dom)
  ytme_dom.appendChild(ytmeRoot)

  // 드래그 이벤트 생성
  if (!dragAndZoomEvent) {
    dragAndZoomEvent = new DragAndZoom(
      behaviorSubjects.transformValue,
      videoParentElement,
      videoContainer
    )
  }

  // 버튼 생성
  setButton(ytmeRoot, rightControls)

  // 비디오 정보 확인
  getVideoInfo(video)
  video.addEventListener('loadedmetadata', videoEventGetVideoType)


  if (settings.useShortcut && !settings.useShortcutOnlyPopupEnabled) {
    const pageWrap = document.querySelector(settings.defaultSelector.page_manager) as HTMLElement
    pageWrap?.addEventListener('keydown', shortcutBind)
  }
  // 버튼 클릭 이벤트
  optionsActive.subscribe((value) => {
    const ytmeOption = document.querySelector('[ytme-options]')
    const pageWrap = document.querySelector(settings.defaultSelector.page_manager) as HTMLElement
    if (value) {
      ytmeRoot.setAttribute('data-ytme-state', 'active')
      ytmeOption?.setAttribute('data-ytme-state', 'active')
      if (settings.useShortcut && settings.useShortcutOnlyPopupEnabled) pageWrap?.addEventListener('keydown', shortcutBind)
    } else {
      ytmeRoot.removeAttribute('data-ytme-state')
      ytmeOption?.removeAttribute('data-ytme-state')
      translateMode.next(false)
      if (settings.useShortcut && settings.useShortcutOnlyPopupEnabled) pageWrap?.removeEventListener('keydown', shortcutBind)
    }
  })

  // 드래그 이벤트
  transformValue.subscribe((value) => {
    setTransform(value)
  })

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

  // transform mode on / off 이벤트
  translateMode.pipe(distinctUntilChanged()).subscribe((value) => {
    const translateModeButton = document.querySelector(
      '[ytme-translate]'
    ) as HTMLElement
    if (dragAndZoomEvent) {
      if (value) {
        if (translateModeButton) {
          translateModeButton.setAttribute('data-ytme-state', 'active')
          translateModeButton.textContent = 'Translate On'
        }
        videoContainer?.addEventListener('mousedown', dragAndZoomEvent.on, true)
        videoContainer?.addEventListener('wheel', dragAndZoomEvent.onWheel, true)
      } else {
        if (translateModeButton) {
          translateModeButton.removeAttribute('data-ytme-state')
          translateModeButton.textContent = 'Translate Off'
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