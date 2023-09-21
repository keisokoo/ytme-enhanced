import { RocketIconsString } from "../../icons/rocket"
import { fitToWindowSize } from "../actions/fit-mode"
import { setRepeatASection, setRepeatBSection, toggleRepeat } from "../actions/repeat"
import { restoreTransform, toggleRotate, toggleTranslateMode } from "../actions/update-value"
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