import { defaultSelector } from "../../settings"
import { getStyles } from "../injectionStyles"

export function applyDynamicStyles(selectors?: typeof defaultSelector) {
  if (document.getElementById('ytme-injection-styles')) return
  const styleElement = document.createElement('style')
  styleElement.setAttribute('id', 'ytme-injection-styles')
  styleElement.setAttribute('type', 'text/css')
  styleElement.innerHTML = getStyles(selectors)
  document.head.appendChild(styleElement)
}