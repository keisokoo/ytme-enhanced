
export const attrConfig = {
  attributes: true,
  subtree: false,
  childList: false,
}
export function mutationByAttrWith(
  target: string | Element,
  cb: (mutation: MutationRecord) => void,
  configs?: MutationObserverInit
) {
  const currentTarget =
    typeof target === 'string' ? document.querySelector(target) : target
  if (currentTarget === null) {
    return null
  }
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      cb(mutation)
    })
  })
  observer.observe(currentTarget, configs ?? attrConfig)
  return observer
}
export function WaitUntilAppend(
  target: string,
  childTarget: string,
  cb: (mutation: MutationRecord, target?: HTMLElement) => void,
  configs?: MutationObserverInit,
  nextConfigs?: MutationObserverInit
) {
  if (!document.querySelector(target)) return null
  const observer = new MutationObserver((mutations, observe) => {
    const findMutation = mutations.find((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length === 0) return false
      if (mutation.type === 'childList') {
        const find = Array.from(mutation.addedNodes).find((node) => {
          return (
            node instanceof HTMLElement &&
            node.tagName.toLocaleLowerCase() === childTarget
          )
        })
        if (find && find instanceof HTMLElement) {
          return true
        }
      } else if (
        mutation.target instanceof HTMLElement &&
        mutation.target.tagName.toLocaleLowerCase() === childTarget
      ) {
        return true
      } else {
        return false
      }
      return false
    })
    if (findMutation) {
      const find = Array.from(findMutation.addedNodes).find((node) => {
        return (
          node instanceof HTMLElement &&
          node.tagName.toLocaleLowerCase() === childTarget
        )
      })
      if (find && find instanceof HTMLElement) {
        cb(findMutation)
        mutationByAttrWith(find, cb, nextConfigs)
        observe.disconnect()
        return
      }
      cb(findMutation)
      mutationByAttrWith(findMutation.target as HTMLElement, cb)
      observe.disconnect()
      return
    }
  })
  observer.observe(document.querySelector(target)!, configs)
}
