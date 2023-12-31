
import { settings } from "../../settings"
import { shortcutBind } from "../events/shortcuts"
import { onTimeUpdate, videoEventGetVideoType, videoResizeEvent } from "../events/video"
import { behaviorSubjects } from "../variables"

const { optionsActive, transformMode, transformValue, aToB } = behaviorSubjects

export function removeConfigs() {
  optionsActive.next(false)
  transformMode.next(false)
  if (document.querySelector('[ytme-root]')) {
    document.querySelector('[ytme-root]')!.removeAttribute('data-ytme-state')
  }
  document.body.removeAttribute('ytme-enabled')
  const video = document.querySelector('video')
  if (video) {
    video.removeEventListener('timeupdate', onTimeUpdate)
    video.removeEventListener('loadedmetadata', videoEventGetVideoType)
    window.removeEventListener('resize', videoResizeEvent)
  }
  const pageWrap = document.querySelector(settings.getValue().defaultSelector.page_manager) as HTMLElement
  pageWrap?.removeEventListener('keydown', shortcutBind)

}