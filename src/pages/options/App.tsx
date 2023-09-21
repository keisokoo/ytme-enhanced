import styled from '@emotion/styled'
import { produce } from 'immer'
import { useEffect, useMemo, useState } from 'react'
import { Question } from '../../icons'
import { SettingsType, defaultSelector, defaultSettings } from '../../settings'
import Toggle from './Toggle'
const Wrap = styled.div`
  background-color: #c7c7c7;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`
const AppWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  background-color: #fff;
  padding: 32px;
  border-radius: 8px;
  min-width: 400px;
  max-width: 800px;
  position: relative;
`
const ItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  label {
    display: flex;
    align-items: center;
    gap: 8px;
    svg {
      cursor: pointer;
    }
  }
`
const Tooltip = styled.div`
  position: absolute;
  top: 0px;
  z-index: 11;
  left: 50%;
  transform: translate(-50%, calc(-100% - 8px));
  padding: 8px;
  background-color: #ffd99b;
  color: #000;
  font-size: 16px;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  white-space: pre-line;
  width: 100%;
`
const descripttion = `이것을 활성화하면 기능들의 단축키를 사용합니다.\n\n
a 루프 시작: [\n
b 루프 끝: ]\n
루프 on/off: \\
회전: r\n
화면 맞춤: e\n
이동,확대 모드:z\n
화면 변경 초기화: x\n`
interface AppProps {}
const App = ({ ...props }: AppProps) => {
  const [settings, set_settings] = useState<SettingsType>({
    ...defaultSettings,
  })
  const [openSelectorSettings, set_openSelectorSettings] = useState(false)
  const [tooltip, set_tooltip] = useState('')
  useEffect(() => {
    chrome.storage.local.get(null, (items) => {
      set_settings((items as SettingsType) ?? defaultSettings)
    })
  }, [])
  const currentSelector = useMemo(() => {
    return settings?.defaultSelector as typeof defaultSettings.defaultSelector
  }, [settings])
  return (
    <>
      <Wrap>
        <AppWrap>
          {tooltip && (
            <Tooltip
              onClick={() => {
                set_tooltip('')
              }}
            >
              {tooltip}
            </Tooltip>
          )}
          <ItemRow>
            <label>
              {'use function'}
              <Question
                onMouseEnter={() => {
                  set_tooltip(
                    `Enabling this will create a feature button at the bottom of the video.`
                  )
                }}
              />
            </label>
            <Toggle
              active={settings.useFunction}
              onClick={() => {
                const newSettings = produce(settings, (draft) => {
                  draft.useFunction = !settings.useFunction
                })
                set_settings(newSettings)
                chrome.storage.local.set(newSettings)
              }}
            />
          </ItemRow>
          <ItemRow>
            <label>
              {'use shortcut'}
              <Question
                onMouseEnter={() => {
                  set_tooltip(
                    `Enabling this will allow you to use feature shortcuts.\n\nOpen Functions Popup: \`(Backquote)\n\na Loop start: [\nb Loop end: ]\nLoop on/off: \\ (Backslash) \nRotate: r\nFit to screen vertical: v\nFit to screen horizontal: b\nTransform mode: z\nRestore: x\n`
                  )
                }}
              />
            </label>
            <Toggle
              active={settings.useShortcut}
              disabled={!settings.useFunction}
              onClick={() => {
                const newSettings = produce(settings, (draft) => {
                  draft.useShortcut = !settings.useShortcut
                })
                set_settings(newSettings)
                chrome.storage.local.set(newSettings)
              }}
            />
          </ItemRow>
          <ItemRow>
            <label>
              {'use shortcut only popup enabled'}
              <Question
                onMouseEnter={() => {
                  set_tooltip(
                    `When enabled, shortcuts will be active only when the feature popup is open.`
                  )
                }}
              />
            </label>
            <Toggle
              active={settings.useShortcutOnlyPopupEnabled}
              disabled={!settings.useShortcut}
              onClick={() => {
                const newSettings = produce(settings, (draft) => {
                  draft.useShortcutOnlyPopupEnabled =
                    !settings.useShortcutOnlyPopupEnabled
                })
                set_settings(newSettings)
                chrome.storage.local.set(newSettings)
              }}
            />
          </ItemRow>
          <ItemRow></ItemRow>
          <ItemRow>
            <button
              onClick={() => {
                set_openSelectorSettings((prev) => !prev)
              }}
            >
              {openSelectorSettings ? 'Close' : 'Open'} Selector Settings
            </button>
            <Question
              onMouseEnter={() => {
                set_tooltip(
                  `This option allows you to temporarily change selectors in case they have been altered due to YouTube updates (in the event that updates are delayed). You probably won't need to change this, but just in case.`
                )
              }}
            />
          </ItemRow>
          {openSelectorSettings && (
            <>
              <ItemRow></ItemRow>
              {currentSelector &&
                Object.entries(currentSelector).map(([key, value]) => {
                  return (
                    <ItemRow>
                      <label>{key}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                          const clone = produce(settings, (draft) => {
                            draft.defaultSelector[
                              key as keyof typeof draft.defaultSelector
                            ] = e.target.value
                          })
                          set_settings(clone)
                          chrome.storage.local.set(clone)
                        }}
                      />
                    </ItemRow>
                  )
                })}
              <ItemRow>
                <label>Restore Selectors</label>
                <button
                  onClick={() => {
                    const newSettings = produce(settings, (draft) => {
                      draft.defaultSelector = { ...defaultSelector }
                    })
                    set_settings(newSettings)
                    chrome.storage.local.set(newSettings)
                  }}
                >
                  Restore Selectors
                </button>
              </ItemRow>
            </>
          )}
        </AppWrap>
      </Wrap>
    </>
  )
}
export default App
