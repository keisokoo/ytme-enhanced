export function setTheaterMode() {
  const theaterButton = document.querySelector('[aria-keyshortcuts="t"]') as HTMLElement
  theaterButton?.click()
}