import { behaviorSubjects } from "../variables"
import { updateTransform } from "./transform"


const { transformValue, videoInfo } = behaviorSubjects

let fixFitVideoSizeTimer: NodeJS.Timeout | null = null
export function getCurrentVideoSizeByWindow(currentVideo?: HTMLVideoElement, parentElement?: HTMLDivElement | null) {
  const video = currentVideo ?? document.querySelector('video')
  const parentSize = {
    width: parentElement?.clientWidth ?? window.innerWidth,
    height: parentElement?.clientHeight ?? window.innerHeight,
  }
  if (video) {
    const currentRatio = videoInfo.getValue().aspect ?? video.videoWidth / video.videoHeight ?? 0
    const currentRotate = transformValue.getValue().rotate ?? 0
    const windowRatio = parentSize.width / parentSize.height
    const resizedWidth = windowRatio > currentRatio ? currentRatio * parentSize.height : parentSize.width
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

export const fixFitVideoSize = (video: HTMLVideoElement, disabled?: boolean) => {
  video = video ?? document.querySelector('video')
  const parentElement = disabled ? video.parentElement as HTMLDivElement : null
  if (fixFitVideoSizeTimer) clearTimeout(fixFitVideoSizeTimer)
  fixFitVideoSizeTimer = setTimeout(() => {
    const { resizedWidth, resizedHeight } = getCurrentVideoSizeByWindow(video, parentElement)
    video.style.width = resizedWidth + 'px'
    video.style.height = resizedHeight + 'px'
    if (parentElement) {
      const parentRect = parentElement.getBoundingClientRect()
      video.style.left = parentRect.width / 2 - resizedWidth / 2 + 'px'
      video.style.top = parentRect.height / 2 - resizedHeight / 2 + 'px'
    } else {
      video.style.left = window.innerWidth / 2 - resizedWidth / 2 + 'px'
      video.style.top = window.innerHeight / 2 - resizedHeight / 2 + 'px'
    }
  }, 300)
}
