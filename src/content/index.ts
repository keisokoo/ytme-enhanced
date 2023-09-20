import { distinctUntilChanged } from 'rxjs'
import { fitToWindowSize } from './actions/fit-mode'
import { initial, removeConfigs, setConfigs } from './actions/init'
import {
  createTip,
  deleteTip,
  onTimeUpdate,
  restoreRepeat,
  setRepeatASection,
  setRepeatBSection,
  toggleRepeat,
} from './actions/repeat'
import { shortcutBind } from './actions/shortcuts'
import { setTransform } from './actions/transform'
import { DragAndZoom } from './actions/translate'
import {
  restoreTransform,
  toggleRotate,
  toggleTranslateMode,
} from './actions/update-value'
import './index.scss'
import { defaultSelector } from './injectionStyles'
import { WaitUntilAppend, mutationByAttrWith } from './mutations'
import { toHHMMSS } from './utils'
import { behaviorSubjects, currentUrl } from './variables'

const originalPushState = history.pushState

const main = async () => {
  const {
    ytmeActive,
    searchBoxFocused,
    videoType,
    videoAspectRatio,
    transformValue,
    optionsActive,
    translateMode,
    aToB,
    activeCheck,
  } = behaviorSubjects
  const { ytmeRoot } = initial()
  let dragAndZoomEvent: DragAndZoom | null = null
  const videoParentElement = document.querySelector(
    '.html5-video-container'
  ) as HTMLElement
  const videoContainer = videoParentElement?.parentElement as HTMLElement
  if (videoParentElement && videoContainer) {
    dragAndZoomEvent = new DragAndZoom(
      behaviorSubjects.transformValue,
      videoParentElement,
      videoContainer
    )
  }
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

  translateMode.pipe(distinctUntilChanged()).subscribe((value) => {
    const translateModeButton = document.querySelector(
      '[ytme-translate]'
    ) as HTMLElement
    if (dragAndZoomEvent && translateModeButton) {
      if (value) {
        translateModeButton.setAttribute('data-ytme-state', 'active')
        translateModeButton.textContent = 'Translate On'
        videoContainer.addEventListener('mousedown', dragAndZoomEvent.on, true)
        videoContainer.addEventListener('wheel', dragAndZoomEvent.onWheel, true)
      } else {
        translateModeButton.removeAttribute('data-ytme-state')
        translateModeButton.textContent = 'Translate Off'
        videoContainer.removeEventListener(
          'mousedown',
          dragAndZoomEvent.on,
          true
        )
        videoContainer.removeEventListener(
          'wheel',
          dragAndZoomEvent.onWheel,
          true
        )
      }
    }
  })
  activeCheck.pipe(distinctUntilChanged()).subscribe((value) => {
    if (value) {
      setConfigs(value)
    } else {
      removeConfigs()
    }
  })
  ytmeActive.pipe(distinctUntilChanged()).subscribe((value) => {
    if (value.isTheater && value.youtubeId) {
      activeCheck.next(value.youtubeId)
    } else {
      activeCheck.next('')
    }
    restoreRepeat()
  })
  transformValue.subscribe((value) => {
    setTransform(value)
  })
  videoAspectRatio.subscribe((value) => {
    if (value === null) {
      videoType.next(null)
      return
    }
    if (value <= 1) {
      videoType.next('vertical')
    } else {
      videoType.next('horizontal')
    }
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
  optionsActive.subscribe((value) => {
    const ytmeOption = document.querySelector('[ytme-options]')
    const pageWrap = document.querySelector(defaultSelector.page_manager) as HTMLElement
    if (value) {
      ytmeRoot.setAttribute('data-ytme-state', 'active')
      ytmeOption?.setAttribute('data-ytme-state', 'active')
      pageWrap?.addEventListener('keydown', shortcutBind)
    } else {
      ytmeRoot.removeAttribute('data-ytme-state')
      ytmeOption?.removeAttribute('data-ytme-state')
      translateMode.next(false)
      pageWrap?.removeEventListener('keydown', shortcutBind)
    }
  })

  function updateLastUrl() {
    ytmeActive.next({ ...ytmeActive.getValue(), youtubeId: currentUrl() })
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
  mutationByAttrWith('ytd-app', updateLastUrl)
  WaitUntilAppend('ytd-app', 'ytd-searchbox', updateFocus, {
    attributes: false,
    subtree: true,
    childList: true,
  })
  WaitUntilAppend('ytd-popup-container', 'tp-yt-iron-dropdown', updateFocus, {
    attributes: false,
    subtree: false,
    childList: true,
  })
  WaitUntilAppend('ytd-app', 'ytd-watch-flexy', checkTheaterMode, {
    attributes: false,
    subtree: true,
    childList: true,
  })

  history.pushState = function (...args) {
    originalPushState.apply(this, args)
    ytmeActive.next({ ...ytmeActive.getValue(), youtubeId: currentUrl() })
  }

  const originalReplaceState = history.replaceState

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args)
    ytmeActive.next({ ...ytmeActive.getValue(), youtubeId: currentUrl() })
  }
  window.addEventListener('popstate', function (event) {
    ytmeActive.next({ ...ytmeActive.getValue(), youtubeId: currentUrl() })
  })

  // <div ytme-move-header>
  //   YTME Functions
  // </div>
  ytmeRoot.insertAdjacentHTML(
    'afterbegin',
    `
    <div ytme-buttons>
      <div ytme-btn-group>
        <button id="ytme-a-button" ytme-a title="Set Loop Start">A</button>
        <button id="ytme-b-button" ytme-b title="Set Loop end">B</button>
        <button id="ytme-repeat-button" ytme-repeat title="Turn On/Off Loop">Off</button>
      </div>
      <div ytme-btn-group>
        <button id="ytme-restore-button" ytme-restore disabled="true" title="Restore Transform">Restore</button>
        <button id="ytme-translate-button" ytme-translate title="Turn On/Off Transform">Transform Off</button>
      </div>
      <div ytme-btn-group>
        <button id="ytme-fit-button" ytme-fit title="Fit To Window">Fit</button>
        <button id="ytme-rotate-button" ytme-rotate title="Rotate">Rotate</button>
      </div>
    </div>
    `
  )
  const aButton = document.getElementById('ytme-a-button')
  const bButton = document.getElementById('ytme-b-button')
  const repeatButton = document.getElementById('ytme-repeat-button')
  const restoreButton = document.getElementById('ytme-restore-button')
  const translateButton = document.getElementById('ytme-translate-button')
  const rotateButton = document.getElementById('ytme-rotate-button')
  const fitButton = document.getElementById('ytme-fit-button')

  if (aButton) {
    aButton.addEventListener('click', setRepeatASection)
  }
  if (bButton) {
    bButton.addEventListener('click', setRepeatBSection)
  }
  if (repeatButton) {
    repeatButton.addEventListener('click', toggleRepeat)
  }
  if (restoreButton) {
    restoreButton.addEventListener('click', restoreTransform)
  }
  if (rotateButton) {
    rotateButton.addEventListener('click', toggleRotate)
  }
  if (translateButton) {
    translateButton.addEventListener('click', toggleTranslateMode)
  }
  if (fitButton) {
    fitButton.addEventListener('click', fitToWindowSize)
  }
}
main()

