import { RocketIconsString } from "../../icons/rocket"
import { settings } from "../../settings"
import { getStyles } from "../injectionStyles"
import { behaviorSubjects } from "../variables"
import { videoResizeEvent } from "./fit-mode"
import { getVideoInfo } from "./update-value"

const { optionsActive } = behaviorSubjects

export function applyDynamicStyles() {
  if (document.getElementById('ytme-injection-styles')) return
  const styleElement = document.createElement('style')
  styleElement.setAttribute('id', 'ytme-injection-styles')
  styleElement.setAttribute('type', 'text/css')
  styleElement.innerHTML = getStyles()
  document.head.appendChild(styleElement)
}

export function initial() {
  applyDynamicStyles()
  const youtubeControlBottom = document.querySelector('.ytp-chrome-bottom') as HTMLElement
  const ytme_dom = document.createElement('div')
  const ytmeRoot = document.createElement('div')
  ytme_dom.setAttribute('ytme-dom', '')
  ytmeRoot.setAttribute('ytme-root', '')
  if (!youtubeControlBottom) {
    console.log('no youtubeControlBottom');
    return { ytme_dom, ytmeRoot }
  }
  youtubeControlBottom.appendChild(ytme_dom)
  ytme_dom.appendChild(ytmeRoot)
  return { ytme_dom, ytmeRoot }
}

function setButton() {
  if (!settings.getValue().useFunction) return
  if (document.querySelector('[ytme-options]')) {
    document.querySelector('[ytme-options]')!.remove()
  }
  const youtubeRightControls = document.querySelector(
    '.ytp-right-controls'
  ) as HTMLElement
  const ytmeOption = document.createElement('button')
  ytmeOption.setAttribute('ytme-options', '')
  ytmeOption.title = "YTME Functions"
  ytmeOption.innerHTML = RocketIconsString
  ytmeOption.addEventListener('click', () => {
    optionsActive.next(!optionsActive.getValue())
  })
  youtubeRightControls.prepend(ytmeOption)
}

export function videoEventGetVideoType(e: Event) {
  getVideoInfo(e.currentTarget as HTMLVideoElement)
}

export const setConfigs = (youtubeId: string) => {
  document.body.setAttribute('ytme-enabled', youtubeId)
  const video = document.querySelector('video')
  if (video) {
    getVideoInfo(video)
    setButton()
    video.addEventListener('loadedmetadata', videoEventGetVideoType)
  }
}


export function removeConfigs() {
  optionsActive.next(false)
  if (document.querySelector('[ytme-options]')) {
    document.querySelector('[ytme-options]')!.remove()
  }
  if (document.querySelector('[ytme-root]')) {
    document.querySelector('[ytme-root]')!.removeAttribute('data-ytme-state')
  }
  document.body.removeAttribute('ytme-enabled')
  const video = document.querySelector('video')
  if (video) {
    video.removeEventListener('loadedmetadata', videoEventGetVideoType)
    window.removeEventListener('resize', videoResizeEvent)
  }
}