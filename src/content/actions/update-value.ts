import { behaviorSubjects } from "../variables"
import { rotateVideoParent, updateTransform } from "./transform"

const { transformValue, videoAspectRatio, translateMode, videoDuration, videoSize } = behaviorSubjects

export function getVideoInfo(video: HTMLVideoElement) {
  const videoWidth = video.videoWidth
  const videoHeight = video.videoHeight
  const aspectRatio = videoWidth / videoHeight
  if (isNaN(aspectRatio)) {
    videoAspectRatio.next(null)
    videoDuration.next(null)
    videoSize.next({ width: 0, height: 0 })
    return
  }
  videoAspectRatio.next(aspectRatio)
  videoDuration.next(video.duration)
  videoSize.next({ width: videoWidth, height: videoHeight })
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