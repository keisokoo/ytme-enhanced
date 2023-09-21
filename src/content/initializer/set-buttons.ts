import { cogSVGString } from "../../icons/cog"
import { horizontalSvgString } from "../../icons/horizontal"
import { RocketIconsString } from "../../icons/rocket"
import { verticalSvgString } from "../../icons/vertical"
import { setRepeatASection, setRepeatBSection, toggleRepeat } from "../actions/repeat"
import { restoreTransform, toggleRotate, toggleTransformMode } from "../actions/update-value"
import { fitByWindowHorizontal, fitByWindowVertical } from "../events/funtions"
import { handleOpenOptionsPage } from "../events/openOptions"
import { behaviorSubjects } from "../variables"

const { optionsActive } = behaviorSubjects
export default function setButton(ytmeRoot: HTMLElement, rightControls: HTMLElement) {
  if (document.querySelector('[ytme-options]')) {
    document.querySelector('[ytme-options]')!.remove()
  }
  const ytmeOption = document.createElement('button')
  ytmeOption.setAttribute('ytme-options', '')
  ytmeOption.title = "YTME Functions"
  ytmeOption.innerHTML = RocketIconsString
  ytmeOption.addEventListener('click', () => {
    optionsActive.next(!optionsActive.getValue())
  })
  rightControls.prepend(ytmeOption)
  ytmeRoot.insertAdjacentHTML(
    'afterbegin',
    `
    <div ytme-move-header>
      <div ytme-title>YTME</div>
      <button ytme-open-options>${cogSVGString}</button>
    </div>
    <div ytme-buttons>
      <div ytme-btn-group>
        <button id="ytme-a-button" ytme-a title="Set Loop Start">A</button>
        <button id="ytme-b-button" ytme-b title="Set Loop end">B</button>
        <button id="ytme-repeat-button" ytme-repeat title="Turn On/Off Loop">Off</button>
      </div>
      <div ytme-btn-group>
        <button id="ytme-restore-button" ytme-restore disabled="true" title="Restore Transform">Restore</button>
        <button id="ytme-transform-button" ytme-transform title="Turn On/Off Transform">Transform Off</button>
      </div>
      <div ytme-btn-group>
        <button id="ytme-fit-h-button" ytme-fit-v title="Fit To Window Vertical">${verticalSvgString}Fit</button>
        <button id="ytme-fit-v-button" ytme-fit-h title="Fit To Window Horizontal">${horizontalSvgString}Fit</button>
        <button id="ytme-rotate-button" ytme-rotate title="Rotate">Rotate</button>
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
  const openOptions = document.querySelector('[ytme-open-options]')

  if (openOptions) {
    openOptions.addEventListener('click', handleOpenOptionsPage)
  }
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
  if (transformButton) {
    transformButton.addEventListener('click', toggleTransformMode)
  }
  if (fitHButton) {
    fitHButton.addEventListener('click', fitByWindowHorizontal)
  }
  if (fitVButton) {
    fitVButton.addEventListener('click', fitByWindowVertical)
  }
}