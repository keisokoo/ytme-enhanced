import { behaviorSubjects } from "../variables"
import { updateTransform } from "./transform"


const { transformValue, videoInfo } = behaviorSubjects


export function fitToWindowSize() {
  const degree = transformValue.getValue().rotate
  const video = document.querySelector('video')
  if (document.body.getAttribute('ytme-enabled') === null) return
  const videoParentElement = document.querySelector(
    '.html5-video-container'
  ) as HTMLElement
  if (videoParentElement) {
    if (degree === 0) {
      updateTransform({
        ...transformValue.getValue(),
        translate: { x: 0, y: 0 },
        rotate: degree,
        scale: 1,
      })
      return
    }
    const currentVideoType = videoInfo.getValue().type ?? 'horizontal'
    let scale = 1
    if (video) {
      if (currentVideoType) {
        const currentRatio = videoInfo.getValue().aspect ?? 0
        const windowRatio = window.innerWidth / window.innerHeight
        const videoSizeWithWindowFilled =
          windowRatio > currentRatio
            ? {
              width:
                (video.videoWidth / video.videoHeight) * window.innerHeight,
              height:
                currentVideoType === 'vertical'
                  ? window.innerHeight
                  : window.innerWidth,
            }
            : {
              width: window.innerWidth,
              height:
                (video.videoHeight / video.videoWidth) * window.innerWidth,
            }
        const videoStyleWidth = videoSizeWithWindowFilled.width
        const videoStyleHeight = videoSizeWithWindowFilled.height

        const reverseWindowRatio = window.innerHeight / window.innerWidth
        if (reverseWindowRatio > currentRatio) {
          scale = window.innerWidth / videoStyleHeight
        } else {
          scale = window.innerHeight / videoStyleWidth
        }
      }
      scale = scale
      updateTransform({
        ...transformValue.getValue(),
        translate: { x: 0, y: 0 },
        rotate: degree,
        scale,
      })
    }
  }
}