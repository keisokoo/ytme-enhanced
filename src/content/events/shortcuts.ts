import { fitToWindowSize } from "../actions/fit-mode"
import { setRepeatASection, setRepeatBSection, toggleRepeat } from "../actions/repeat"
import { restoreTransform, toggleRotate, toggleTranslateMode } from "../actions/update-value"

const shortcuts = [
  {
    key: 'BracketLeft',
    action: setRepeatASection,
    title: 'Set Repeat A Section',
  },
  {
    key: 'BracketRight',
    action: setRepeatBSection,
    title: 'Set Repeat B Section',
  },
  {
    key: 'Backslash',
    action: toggleRepeat,
    title: 'Toggle Repeat',
  },
  {
    key: 'KeyR',
    action: toggleRotate,
    title: 'Toggle Rotate',
  },
  {
    key: 'KeyE',
    action: fitToWindowSize,
    title: 'Fit to Window Size',
  },
  {
    key: 'KeyZ',
    action: toggleTranslateMode,
    title: 'Toggle Translate Mode',
  },
  {
    key: 'KeyX',
    action: restoreTransform,
    title: 'Restore Transform',
  },

]


export function shortcutBind(e: KeyboardEvent) {
  shortcuts.forEach((shortcut) => {
    if (e.code === shortcut.key) {
      shortcut.action()
    }
  })
}