import { TransformValueType } from "../types"
import { behaviorSubjects } from "../variables"

const { transformValue } = behaviorSubjects

export function setTransform(value: TransformValueType) {
  const videoParentElement = document.querySelector(
    '.html5-video-container'
  ) as HTMLElement
  if (videoParentElement) {
    videoParentElement.style.transform = `translate(${value.translate.x}px, ${value.translate.y}px) rotate(${value.rotate}deg) scale(${value.scale}) scaleX(${value.scaleX})`
  }
  const rotateButton = document.querySelector('[ytme-rotate]') as HTMLElement
  if (rotateButton) {
    rotateButton.setAttribute('rotate', String(value.rotate))
    rotateButton.textContent = value.rotate !== 0 ? 'Rotate:' + value.rotate : 'Rotate'
  }
  const restoreButton = document.querySelector('[ytme-restore]') as HTMLButtonElement
  if (restoreButton) {
    if (value.translate.x === 0 && value.translate.y === 0 && value.rotate === 0 && value.scale === 1 && value.scaleX === 1) {
      restoreButton.setAttribute('disabled', '')
    } else {
      restoreButton.removeAttribute('disabled')
    }
  }
}
export function updateTransform(value: TransformValueType) {
  transformValue.next(value)
}

export function rotateVideoParent(degree: 0 | 90 | 180 | 270) {
  updateTransform({
    ...transformValue.getValue(),
    rotate: degree,
    scale: 1,
  })
}
export function setScaleX(value: -1 | 1) {
  updateTransform({
    ...transformValue.getValue(),
    scaleX: value,
  })
}