
export function extractYouTubeId(url: string): string | null {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)

  if (match && match[2].length === 11) {
    return match[2]
  } else {
    return null
  }
}

export const toHHMMSS = (secondsTime: number) => {
  if (!Number(secondsTime) || !secondsTime) return '00:00'
  let sec_num = Number(secondsTime.toFixed(0))
  let hours: number = Math.floor(sec_num / 3600)
  let minutes: number = Math.floor((sec_num - hours * 3600) / 60)
  let seconds: number = sec_num - hours * 3600 - minutes * 60
  let mileSeconds: number = secondsTime - Math.floor(secondsTime)
  const hourString = hours ? String(hours).padStart(2, '0') + ':' : ''
  const minuteString = minutes ? String(minutes).padStart(2, '0') + ':' : ''
  const secondString = String(seconds).padStart(2, '0')
  const mileSecondString = mileSeconds ? Math.abs(mileSeconds).toFixed(2).replace('0.', '.') : ''

  return `${hourString}${minuteString}${secondString}${mileSecondString}`
}


export const handleGetRectSize = (
  targetElement: HTMLElement,
  option: {
    type?: 'inner' | 'outer'
    threshold?: number
    areaElement?: HTMLElement
    restrictElement?: HTMLElement
  }
) => {
  let bound = option.areaElement
    ? option.areaElement.getBoundingClientRect()
    : document.body.getBoundingClientRect()
  let targetBound = targetElement.getBoundingClientRect()
  let restrictBound = option.restrictElement?.getBoundingClientRect()

  const areaType = option.type === 'inner' ? 1 : -1
  const areaForOuter = option.type === 'inner' ? 0 : 1
  const threshold = option.threshold ?? 0
  let rectSize = {
    w: targetBound.width * areaType,
    h: targetBound.height * areaType,
  }
  let maxSize = {
    x: bound.width / 2 - rectSize.w / 2 + threshold,
    y: bound.height / 2 - rectSize.h / 2 + threshold,
    offset: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    },
  }
  if (restrictBound) {
    let restrictSize = {
      w: restrictBound.width * areaType,
      h: restrictBound.height * areaType,
    }
    maxSize.x = bound.width / 2 - restrictSize.w / 2 + threshold
    maxSize.y = bound.height / 2 - restrictSize.h / 2 + threshold
    maxSize.offset.width = restrictBound.width
    maxSize.offset.height = restrictBound.height

    let portraitOffset = Math.abs(rectSize.h - restrictBound.height)
    let horizontalOffset = Math.abs(rectSize.w - restrictBound.width)
    if (portraitOffset !== 0) {
      maxSize.offset.bottom =
        portraitOffset / 2 - maxSize.offset.height * areaForOuter
      if (targetBound.top - restrictBound.top) {
        maxSize.offset.top = Math.abs(targetBound.top - restrictBound.top) / 2
        maxSize.offset.bottom = Math.abs(
          maxSize.offset.bottom -
          Math.abs(targetBound.top - restrictBound.top) / 2
        )
      }
    }
    if (horizontalOffset !== 0) {
      maxSize.offset.right =
        horizontalOffset / 2 - maxSize.offset.width * areaForOuter
      if (targetBound.left - restrictBound.left) {
        maxSize.offset.left =
          Math.abs(targetBound.left - restrictBound.left) / 2
        maxSize.offset.right = Math.abs(
          maxSize.offset.right -
          Math.abs(targetBound.left - restrictBound.left) / 2
        )
      }
    }
  }

  return maxSize
}
export const areaRestrictions = (
  targetElement: HTMLElement,
  currentPosition: { x: number; y: number },
  option: {
    areaElement?: HTMLElement
    type?: 'inner' | 'outer'
    threshold?: number
    disabled?: {
      x?: boolean
      y?: boolean
    }
    restrictElement?: HTMLElement
  } = {
      type: 'inner',
      threshold: 0,
      disabled: {
        x: false,
        y: false,
      },
    }
) => {
  let { x, y } = currentPosition

  const maxSize = handleGetRectSize(targetElement, {
    ...option,
    areaElement: option.areaElement,
    restrictElement: option.restrictElement
  })
  const disabled = {
    x: option.disabled?.x,
    y: option.disabled?.y,
  }
  if (!disabled.x) {
    const xDiffOffset = maxSize.offset.right - maxSize.offset.left
    if (x < -maxSize.x + xDiffOffset) {
      x = -maxSize.x + xDiffOffset
    }
    if (x > maxSize.x + xDiffOffset) {
      x = maxSize.x + xDiffOffset
    }
  }

  if (!disabled.y) {
    const yDiffOffset = maxSize.offset.bottom - maxSize.offset.top
    if (y < -maxSize.y + yDiffOffset) {
      y = -maxSize.y + yDiffOffset
    }
    if (y > maxSize.y + yDiffOffset) {
      y = maxSize.y + yDiffOffset
    }
  }
  return { x, y }
}