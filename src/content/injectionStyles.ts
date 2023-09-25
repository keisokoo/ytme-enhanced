import { css } from "@emotion/react"
import { defaultSelector } from "../settings"

export type InjectStyleOptions = {
  experimental?: boolean
  disableFunctions?: boolean
}
export const getStyles = (selector = {
  ...defaultSelector
}, options?: InjectStyleOptions) => {
  const experimentalStyles = css`
  body[ytme-enabled] #primary ytd-comment-thread-renderer{
    box-sizing: border-box;
    padding: 8px;
    border-radius: 8px;
  }
  html[dark] body[ytme-enabled] #primary ytd-comment-thread-renderer:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
  html[dark] body[ytme-enabled] #primary #below {
    padding: 8px;
    box-sizing: border-box;
    border-radius: 8px;
    background-color: rgba(0, 0, 0, 0.5);
  }
  html[dark] body[ytme-enabled] #secondary {
    margin-top: 0px;
  }
  html[dark] body[ytme-enabled] #secondary #related {
    padding: 8px;
    box-sizing: border-box;
    border-radius: 8px;
    background-color: rgba(0, 0, 0, 0.5);
  }
  html:not([dark]) body[ytme-enabled] #primary ytd-comment-thread-renderer:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
  html:not([dark]) body[ytme-enabled] #primary #below {
    padding: 8px;
    box-sizing: border-box;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.5);
  }
  html:not([dark]) body[ytme-enabled] #secondary {
    margin-top: 0px;
  }
  html:not([dark]) body[ytme-enabled] #secondary #related {
    padding: 8px;
    box-sizing: border-box;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.5);
  }
  body[ytme-enabled] div[ytme-dom] > div[ytme-root] {
    position: fixed;
  }
  `
  const styles = css`
    body[ytme-enabled] ${selector.theater_mode_container} {
      width: 100% !important;
      max-height: 100vh !important;
      height: 100vh !important;
      min-height: auto !important;
      ${options?.experimental ? `
      position: sticky !important;
      top: 0 !important;
      ` : ''}
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
  ${options?.disableFunctions ? `` : `
  body ${selector.video_parent_container} {
    transform-origin: center;
    width: 100%;
    height: 100%;
  }
  body[ytme-enabled] ${selector.video_parent_container} {
    transform-origin: center;
    width: 100vw;
    height: 100vh;
  }
  `}
  
  ${options?.experimental ? experimentalStyles : ''}
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


// @media screen and (max-width: 1920px) {
//   body[ytme-enabled] #contents {
//   column-count: 4;
//   }
// }
// @media screen and (max-width: 1600px) {
//   body[ytme-enabled] #contents {
//   column-count: 4;
//   }
// }
// @media screen and (max-width: 1280px) {
//   body[ytme-enabled] #contents {
//   column-count: 3;
//   }
// }
// @media screen and (max-width: 1024px) {
//   body[ytme-enabled] #contents {
//   column-count: 2;
//   }
// }
// @media screen and (max-width: 768px) {
//   body[ytme-enabled] #contents {
//   column-count: 1;
//   }
// }