import { behaviorSubjects } from "../variables";

const { aToB } = behaviorSubjects;

export function deleteTip(type: "start" | "end" | "all") {
  if (type === "all") {
    const divList = document.querySelectorAll(".ytme-loop")
    divList.forEach((el) => el.remove())
    return
  }
  const div = document.querySelector(`.ytme-loop-${type}`)
  if (!div) return
  div.remove()
}
export function createTip(type: "start" | "end", percent: number) {
  if (document.querySelector(`.ytme-loop-${type}`)) {
    document.querySelector(`.ytme-loop-${type}`)!.remove()
  }
  const parentElement = document.querySelector(".ytp-progress-bar")
  if (!parentElement) return
  const div = document.createElement("div")
  div.classList.add(`ytme-loop-${type}`)
  div.classList.add(`ytme-loop`)
  div.style.left = percent + "%"
  parentElement.appendChild(div)
}
export function setRepeatASection() {
  const { a, b } = aToB.getValue();
  if (a !== null) {
    setRepeatSection('a')
    return
  }
  const video = document.querySelector('video');
  if (video) {
    const nextA = video.currentTime;
    if (b && nextA > b) {
      return
    }
    setRepeatSection('a', nextA)
  }
}
export function setRepeatBSection() {
  const { a, b } = aToB.getValue();
  if (b !== null) {
    setRepeatSection('b')
    return
  }
  const video = document.querySelector('video');
  if (video) {
    const nextB = video.currentTime;
    if (a && nextB < a) {
      return
    }
    setRepeatSection('b', nextB)
  }
}
export function setRepeatSection(type: 'a' | 'b', value: number | null = null) {
  aToB.next({
    ...aToB.getValue(),
    [type]: value,
  });
}
export function toggleRepeat() {
  aToB.next({
    ...aToB.getValue(),
    repeat: !aToB.getValue().repeat,
  });
}
export function restoreRepeat() {
  aToB.next({
    a: null,
    b: null,
    repeat: false,
  });
}


