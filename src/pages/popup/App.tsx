import styled from '@emotion/styled'

const AppWrap = styled.div``

interface AppProps {}
const App = ({ ...props }: AppProps) => {
  return (
    <>
      <AppWrap>
        <button
          onClick={() => {
            chrome.runtime.reload()
          }}
        >
          Reload
        </button>
      </AppWrap>
    </>
  )
}
export default App
