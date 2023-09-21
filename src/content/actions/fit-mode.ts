import { behaviorSubjects } from "../variables"
import { updateTransform } from "./transform"


const { transformValue, videoInfo } = behaviorSubjects

export function fitToWindowSizeBy(type: 'horizontal' | 'vertical') {
  const video = document.querySelector('video')
  if (video) {
    const currentRatio = videoInfo.getValue().aspect ?? 0
    const windowRatio = window.innerWidth / window.innerHeight
    const ratioWidth = windowRatio > currentRatio ? currentRatio * window.innerHeight : window.innerWidth
    const ratioHeight = ratioWidth / currentRatio
    const rotated = transformValue.getValue().rotate === 90 || transformValue.getValue().rotate === 270
    let nextScale = 1
    if (type === 'horizontal') {
      nextScale = window.innerHeight / (rotated ? ratioWidth : ratioHeight)
    } else {
      nextScale = window.innerWidth / (rotated ? ratioHeight : ratioWidth)
    }
    updateTransform({
      ...transformValue.getValue(),
      translate: { x: 0, y: 0 },
      scale: nextScale,
    })
  }
}
