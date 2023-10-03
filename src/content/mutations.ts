import { devLog } from "./utils"

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
  if (target === 'ytd-app' && childTarget === 'ytd-watch-flexy') {
    devLog('ytd-watch-flexy detector running');
  }

  const observer = new MutationObserver((mutations, observe) => {
    let findMutation = mutations.find((mutation) => {
      if (document.querySelector(target)?.querySelector(childTarget)) {
        return true
      }
      if (mutation.type === 'childList') {
        const find = Array.from(mutation.addedNodes).find((node) => {
          return (
            node instanceof HTMLElement &&
            node.tagName.toLocaleLowerCase() === childTarget
          )
        })
        if (find && find instanceof HTMLElement) {
          return true
        } else {
          return false
        }
      } else if (
        mutation.target instanceof HTMLElement &&
        mutation.target.tagName.toLocaleLowerCase() === childTarget
      ) {
        return true
      } else {
        return false
      }
    })
    if (findMutation) {
      const find = Array.from(findMutation.addedNodes).find((node) => {
        return (
          node instanceof HTMLElement &&
          node.tagName.toLocaleLowerCase() === childTarget
        )
      })
      if (find && find instanceof HTMLElement) {
        findMutation = { ...findMutation, target: find }
        cb(findMutation)
        mutationByAttrWith(find, cb, nextConfigs)
        observe.disconnect()
        devLog('set mutationByAttrWith in find', find);
        return
      }
      const queryFind = document.querySelector(target)?.querySelector(childTarget)
      if (queryFind) {
        findMutation = { ...findMutation, target: queryFind }
        cb(findMutation)
        mutationByAttrWith(queryFind, cb, nextConfigs)
        observe.disconnect()
        devLog('set mutationByAttrWith in queryFind', queryFind);
        return
      }
      cb(findMutation)
      mutationByAttrWith(findMutation.target as HTMLElement, cb)
      devLog('set mutationByAttrWith in findMutation.target', findMutation.target);
      observe.disconnect()
      return
    } else {
      if (target === 'ytd-app' && childTarget === 'ytd-watch-flexy') {
        devLog('in mutation', target, childTarget, 'not found', findMutation);
      }
    }
  })
  if (!document.querySelector(target)) {
    if (target === 'ytd-app' && childTarget === 'ytd-watch-flexy') {
      devLog('WaitUntilAppend', target, childTarget, 'not found');
    }
    return null
  }
  observer.observe(document.querySelector(target)!, configs)
}
