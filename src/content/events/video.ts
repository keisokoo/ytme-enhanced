import { rotateVideoParent } from "../actions/transform";
import { getVideoInfo } from "../actions/update-value";
import { behaviorSubjects } from "../variables";

const { aToB, transformValue } = behaviorSubjects;

export function videoEventGetVideoType(e: Event) {
  getVideoInfo(e.currentTarget as HTMLVideoElement)
}
export function onTimeUpdate(e: Event) {
  const videoElement = e.currentTarget as HTMLVideoElement
  const { a, b, repeat } = aToB.getValue()
  if (!repeat) return
  const duration = videoElement.duration
  const nextA = a === null ? 0 : a < 0 ? 0 : a > duration ? 0 : a
  const nextB = b === null ? duration : b < 0 ? duration : b > duration ? duration : b < nextA ? duration : b
  if (videoElement.currentTime < nextA) {
    videoElement.pause()
    videoElement.currentTime = nextA
    videoElement.play()
  } else if (videoElement.currentTime > nextB) {
    videoElement.pause()
    videoElement.currentTime = nextA
    videoElement.play()
  } else if (nextB === duration && videoElement.currentTime === duration) {
    videoElement.pause()
    videoElement.currentTime = nextA
    videoElement.play()
  }
}

// window resize event
let timeout: number | null = null
export function videoResizeEvent() {
  if (transformValue.getValue().rotate === 0) return
  const video = document.querySelector('video')
  if (video) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      rotateVideoParent(transformValue.getValue().rotate)
    }, 150)
  }
}