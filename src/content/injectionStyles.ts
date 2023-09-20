import { css } from "@emotion/react"
export const defaultSelector = {
  theater_mode_container: '#full-bleed-container',
  page_manager: '#page-manager',
  masthead_container: '#masthead-container',
  video_parent_container: '.html5-video-container'
}
export const getStyles = (selector = {
  ...defaultSelector
}) => {
  const styles = css`
    body[ytme-enabled] ${selector.theater_mode_container} {
      width: 100% !important;
      max-height: 100vh !important;
      height: 100vh !important;
      min-height: auto !important;
  }
    body[ytme-enabled] ${selector.page_manager} {
      margin-top: 0px !important;
  }
    body[ytme-enabled] ${selector.masthead_container} > *:first-of-type {
      opacity: 0;
      transition: 0.3s ease-in-out;
  }
    body[ytme-enabled] ${selector.masthead_container}:hover > *:first-of-type {
      opacity: 1;
  }
    body[ytme-enabled] ${selector.masthead_container}[has-focus] > *:first-of-type {
      opacity: 1;
  }
  ${selector.video_parent_container} {
    transform-origin: center;
    width: 100vw;
    height: 100vh;
  }
  `
  return styles.styles
}

/* video {
  width: 100% !important;
  height: 100% !important;
  top: 0 !important;
  left: 0 !important;
  object-fit: contain !important;
} */