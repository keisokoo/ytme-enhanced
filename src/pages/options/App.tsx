import styled from '@emotion/styled'
import { produce } from 'immer'
import { useEffect, useMemo, useState } from 'react'
import { defaultSelector } from '../../content/injectionStyles'
import { SettingsType, defaultSettings } from '../../settings'
import Toggle from './Toggle'

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
`
const ItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
`

interface AppProps {}
const App = ({ ...props }: AppProps) => {
  const [settings, set_settings] = useState<SettingsType>({
    ...defaultSettings,
  })

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
      <AppWrap>
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
            Restore
          </button>
        </ItemRow>
        <ItemRow></ItemRow>
        <ItemRow>
          <label>{'useFunction'}</label>
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
          <label>{'useShortcut'}</label>
          <Toggle
            active={settings.useShortcut}
            onClick={() => {
              const newSettings = produce(settings, (draft) => {
                draft.useShortcut = !settings.useShortcut
              })
              set_settings(newSettings)
              chrome.storage.local.set(newSettings)
            }}
          />
        </ItemRow>
      </AppWrap>
    </>
  )
}
export default App
