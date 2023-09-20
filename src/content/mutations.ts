
export const attrConfig = {
  attributes: true,
  subtree: false,
  childList: false,
}
export function mutationByAttrWith(
  target: string | Element,
  cb: (mutation: MutationRecord) => void
) {
  const currentTarget =
    typeof target === 'string' ? document.querySelector(target) : target
  if (currentTarget === null) {
    return
  }
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        cb(mutation)
      }
    })
  })
  observer.observe(currentTarget, attrConfig)
}
export function WaitUntilAppend(
  target: string,
  childTarget: string,
  cb: (mutation: MutationRecord) => void,
  configs?: MutationObserverInit
) {
  if (!document.querySelector(target)) return null
  const observer = new MutationObserver((mutations, observe) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length === 0)
        return
      if (mutation.type === 'childList') {
        const find = Array.from(mutation.addedNodes).find((node) => {
          return (
            node instanceof HTMLElement &&
            node.tagName.toLocaleLowerCase() === childTarget
          )
        })
        if (find && find instanceof HTMLElement) {
          cb(mutation)
          mutationByAttrWith(find, cb)
          observe.disconnect()
        }
      } else if (
        mutation.target instanceof HTMLElement &&
        mutation.target.tagName.toLocaleLowerCase() === childTarget
      ) {
        cb(mutation)
        mutationByAttrWith(mutation.target, cb)
        observe.disconnect()
      }
    })
  })
  observer.observe(document.querySelector(target)!, configs)
}