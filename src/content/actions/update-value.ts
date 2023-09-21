import { behaviorSubjects } from "../variables"
import { rotateVideoParent, updateTransform } from "./transform"

const { transformValue, translateMode, videoInfo } = behaviorSubjects

export function getVideoInfo(video: HTMLVideoElement) {
  const videoWidth = video.videoWidth
  const videoHeight = video.videoHeight
  const aspectRatio = videoWidth / videoHeight
  if (isNaN(aspectRatio)) {
    videoInfo.next({ duration: 0, width: 0, height: 0, aspect: 0, type: null })
    return
  }
  videoInfo.next({ duration: video.duration, width: videoWidth, height: videoHeight, aspect: aspectRatio, type: aspectRatio > 1 ? 'horizontal' : 'vertical' })
}
export const toggleRotate = () => {
  let currentRotate = transformValue.getValue().rotate
  if (currentRotate === 0) {
    currentRotate = 90
  } else if (currentRotate === 90) {
    currentRotate = 270
  } else if (currentRotate === 270) {
    currentRotate = 0
  }
  rotateVideoParent(currentRotate)
}

export const toggleTranslateMode = () => {
  translateMode.next(!translateMode.getValue())
}

export const restoreTransform = () => {
  updateTransform({
    ...transformValue.getValue(),
    translate: { x: 0, y: 0 },
    rotate: 0,
    scale: 1,
  })
}