import styled from '@emotion/styled'
import React from 'react'

const ToggleWrap = styled.div`
  width: 40px;
  height: 20px;
  border-radius: 10px;
  background-color: #ccc;
  position: relative;
  cursor: pointer;
  &::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #effffd;
    top: 2px;
    left: 2px;
    transition: 0.2s;
  }
  &[data-active='true'] {
    background-color: #00b333;
    &::after {
      left: calc(100% - 18px);
    }
  }
  &[data-disabled='true'] {
    opacity: 0.6;
    background-color: #555555;
    cursor: not-allowed;
    &::after {
      background-color: #bdbdbd;
    }
  }
`

interface ToggleProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  active?: boolean
  disabled?: boolean
}
const Toggle = ({ disabled, active, onClick, ...props }: ToggleProps) => {
  return (
    <>
      <ToggleWrap
        data-active={active}
        data-disabled={disabled}
        onClick={(e) => {
          if (disabled) return
          onClick?.(e)
        }}
        {...props}
      />
    </>
  )
}
export default Toggle
