import { behaviorSubjects } from "../variables"
import { updateTransform } from "./transform"


const { transformValue, videoInfo } = behaviorSubjects

export function getCurrentVideoSizeByWindow(currentVideo?: HTMLVideoElement) {
  const video = currentVideo ?? document.querySelector('video')
  if (video) {
    const currentRatio = videoInfo.getValue().aspect ?? video.videoWidth / video.videoHeight ?? 0
    const currentRotate = transformValue.getValue().rotate ?? 0
    const windowRatio = window.innerWidth / window.innerHeight
    const resizedWidth = windowRatio > currentRatio ? currentRatio * window.innerHeight : window.innerWidth
    const resizedHeight = resizedWidth / currentRatio
    const rotated = currentRotate === 90 || currentRotate === 270
    return {
      resizedWidth,
      resizedHeight,
      currentWidth: rotated ? resizedHeight : resizedWidth,
      currentHeight: rotated ? resizedWidth : resizedHeight,
    }
  }
  return {
    resizedWidth: 0,
    resizedHeight: 0,
    currentWidth: 0,
    currentHeight: 0,
  }
}

export function fitToWindowSizeBy(type: 'horizontal' | 'vertical') {
  let nextScale = 1
  const { currentWidth, currentHeight } = getCurrentVideoSizeByWindow()
  if (type === 'horizontal') {
    nextScale = window.innerHeight / currentHeight
  } else {
    nextScale = window.innerWidth / currentWidth
  }
  updateTransform({
    ...transformValue.getValue(),
    translate: { x: 0, y: 0 },
    scale: nextScale,
  })
}
