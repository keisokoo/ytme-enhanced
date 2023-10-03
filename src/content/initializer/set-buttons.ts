import { closeSVGString } from "../../icons/closeIcon"
import { cogSVGString } from "../../icons/cog"
import { horizontalSvgString } from "../../icons/horizontal"
import { fastBackward, fastForward, skipNext } from "../../icons/mediaIcons"
import { moveIconSvgString } from "../../icons/moveIcon"
import { undoSVGString } from "../../icons/undo"
import { verticalSvgString } from "../../icons/vertical"
import { setRepeatASection, setRepeatBSection, toggleRepeat } from "../actions/repeat"
import { restoreTransform, toggleRotate, toggleScaleX, toggleTransformMode } from "../actions/update-value"
import { fitByWindowHorizontal, fitByWindowVertical } from "../events/funtions"
import { handleOpenOptionsPage } from "../events/openOptions"
import { behaviorSubjects } from "../variables"

const { optionsActive } = behaviorSubjects


let tooltipInterval: NodeJS.Timeout | null = null
const tooltipHoldMax = 3

export default function setButton() {
  if (document.querySelector('[ytme-dom]')) {
    document.querySelector('[ytme-dom]')!.remove()
  }
  const ytme_dom = document.createElement('div')
  const ytmeRoot = document.createElement('div')
  ytmeRoot.tabIndex = 0
  ytme_dom.setAttribute('ytme-dom', '')
  ytmeRoot.setAttribute('ytme-root', '')
  ytme_dom.appendChild(ytmeRoot)
  document.body.appendChild(ytme_dom)
  ytmeRoot.insertAdjacentHTML(
    'afterbegin',
    `
    <div ytme-move-header>
      <div ytme-title>YTME</div>
      <div ytme-header-btn-group>
      <button ytme-skip-next data-title="Skip Next">${skipNext}</button>
      <button ytme-fast-backward data-title="5 Seconds Before">${fastBackward}</button>
      <button ytme-fast-forward data-title="5 Seconds After">${fastForward}</button>
      <button ytme-open-options data-title="Open Options Page">${cogSVGString}</button>
      <button ytme-close-options data-title="Close">${closeSVGString}</button>
      </div>
    </div>
    <div ytme-buttons>
      <div ytme-btn-group>
        <button id="ytme-a-button" ytme-a data-title="Set Loop Start, Shortcuts: [">A</button>
        <button id="ytme-b-button" ytme-b data-title="Set Loop end, Shortcuts: ]">B</button>
        <button id="ytme-repeat-button" ytme-repeat data-title="Turn On/Off Loop, Shortcuts: \\">Off</button>
      </div>
      <div ytme-btn-group>
        <button id="ytme-restore-button" ytme-restore disabled="true" data-title="Restore position values, Shortcuts: x">${undoSVGString}</button>
        <button id="ytme-mirror-button" ytme-mirror data-title="Toggle Mirror, Shortcuts: g">Mirror</button>
        <button id="ytme-transform-button" ytme-transform data-title="Turn On/Off Zoom/Move, Shortcuts: z">${moveIconSvgString}Off</button>
      </div>
      <div ytme-btn-group>
        <button id="ytme-fit-h-button" ytme-fit-v data-title="Fit To Window Height, Shortcuts: v">${verticalSvgString}Fit</button>
        <button id="ytme-fit-v-button" ytme-fit-h data-title="Fit To Window Width, Shortcuts: b">${horizontalSvgString}Fit</button>
        <button id="ytme-rotate-button" ytme-rotate data-title="Rotate, Shortcuts: r">Rotate</button>
      </div>
    </div>
    `
  )
  const aButton = document.getElementById('ytme-a-button')
  const bButton = document.getElementById('ytme-b-button')
  const repeatButton = document.getElementById('ytme-repeat-button')
  const restoreButton = document.getElementById('ytme-restore-button')
  const transformButton = document.getElementById('ytme-transform-button')
  const rotateButton = document.getElementById('ytme-rotate-button')
  const fitHButton = document.getElementById('ytme-fit-h-button')
  const fitVButton = document.getElementById('ytme-fit-v-button')
  const openOptionsPage = document.querySelector('[ytme-open-options]')
  const closeOptions = document.querySelector('[ytme-close-options]')
  const ytmeTitle = document.querySelector('[ytme-title]')

  const ytmeSkipNext = document.querySelector('[ytme-skip-next]')
  const ytmeFastBackward = document.querySelector('[ytme-fast-backward]')
  const ytmeFastForward = document.querySelector('[ytme-fast-forward]')
  const ytmeMirror = document.querySelector('[ytme-mirror]')

  ytmeSkipNext?.addEventListener('click', () => {
    const youtubeNext = document.querySelector('a.ytp-next-button') as HTMLAnchorElement ?? document.querySelector('a[aria-keyshortcuts="SHIFT+n"]') as HTMLAnchorElement
    if (youtubeNext) youtubeNext.click()
  })
  ytmeFastBackward?.addEventListener('click', () => {
    const video = document.querySelector('video') as HTMLVideoElement
    if (video) video.currentTime -= 5
  })
  ytmeFastForward?.addEventListener('click', () => {
    const video = document.querySelector('video') as HTMLVideoElement
    if (video) video.currentTime += 5
  })
  ytmeTitle?.addEventListener('click', () => {
    try {
      chrome.runtime.sendMessage({
        type: 'reload'
      }, () => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError)
        }
        return false
      })
    } catch (error) {
      console.log(error);

    }
  })
  closeOptions?.addEventListener('click', () => {
    optionsActive.next(false)
  })
  ytmeMirror?.addEventListener('click', toggleScaleX)
  openOptionsPage?.addEventListener('click', handleOpenOptionsPage)
  aButton?.addEventListener('click', setRepeatASection)
  bButton?.addEventListener('click', setRepeatBSection)
  repeatButton?.addEventListener('click', toggleRepeat)
  restoreButton?.addEventListener('click', restoreTransform)
  rotateButton?.addEventListener('click', toggleRotate)
  transformButton?.addEventListener('click', toggleTransformMode)
  fitHButton?.addEventListener('click', fitByWindowHorizontal)
  fitVButton?.addEventListener('click', fitByWindowVertical)


  const buttons = document.querySelectorAll('[ytme-root] button[data-title]') as NodeListOf<HTMLButtonElement>


  Array.from(buttons).forEach((button) => {
    button.addEventListener('mouseenter', (e) => {
      if (tooltipInterval) clearInterval(tooltipInterval)
      let tooltipHold = 0
      tooltipInterval = setInterval(() => {
        tooltipHold += 1
        if (tooltipInterval && tooltipHold >= tooltipHoldMax) {
          clearInterval(tooltipInterval)
          const rect = button.getBoundingClientRect();
          const tooltip = document.createElement('div');
          tooltip.classList.add('ytme-tooltip');
          tooltip.style.top = `${rect.top}px`;
          tooltip.style.right = `${window.innerWidth - rect.right}px`;
          tooltip.style.position = 'absolute';
          tooltip.textContent = button.getAttribute('data-title') ?? '';
          ytme_dom.appendChild(tooltip);
        }
      }, 500)
    });
    button.addEventListener('mouseleave', () => {
      if (tooltipInterval) clearInterval(tooltipInterval)
      const tooltips = ytme_dom.querySelectorAll('.ytme-tooltip');
      tooltips.forEach((tooltip) => {
        tooltip.remove();
      });
    });
  })
}