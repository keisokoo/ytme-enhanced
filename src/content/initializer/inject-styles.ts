import { defaultSelector } from "../../settings"
import { InjectStyleOptions, getStyles } from "../injectionStyles"

export function applyDynamicStyles(selectors?: typeof defaultSelector, options?: InjectStyleOptions) {
  if (document.getElementById('ytme-injection-styles')) {
    document.getElementById('ytme-injection-styles')!.remove()
  }
  const styleElement = document.createElement('style')
  styleElement.setAttribute('id', 'ytme-injection-styles')
  styleElement.setAttribute('type', 'text/css')
  styleElement.innerHTML = getStyles(selectors, options)
  document.head.appendChild(styleElement)
}