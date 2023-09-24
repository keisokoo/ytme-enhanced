import { fitToWindowSizeBy } from "../actions/fit-mode";
import { setRepeatASection, setRepeatBSection, toggleRepeat } from "../actions/repeat";
import { restoreTransform, toggleRotate, toggleScaleX, toggleTransformMode } from "../actions/update-value";
import { behaviorSubjects } from "../variables";

const { optionsActive } = behaviorSubjects

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
    key: 'KeyG',
    action: toggleScaleX,
    title: 'Toggle Flip Horizontal',
  },
  {
    key: 'KeyV',
    action: () => fitToWindowSizeBy('vertical'),
    title: 'Fit to Window Vertical Size',
  },
  {
    key: 'KeyB',
    action: () => fitToWindowSizeBy('horizontal'),
    title: 'Fit to Window Horizontal Size',
  },
  {
    key: 'KeyZ',
    action: toggleTransformMode,
    title: 'Toggle Transform Mode',
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