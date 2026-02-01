import { useState, type KeyboardEvent, useRef, useEffect } from 'react'
import styled from 'styled-components'

export interface FloatingInputProps {
  placeholder?: string
  onSubmit: (value: string) => void
  autoFocus?: boolean
}

const Container = styled.div`
  position: fixed;
  bottom: 60px; /* 탭바 위 */
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  box-sizing: border-box;
`

const InputWrapper = styled.div`
  display: flex;
  gap: 8px;
  max-width: 600px;
  margin: 0 auto;
`

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  }
`

const SubmitButton = styled.button`
  padding: 12px 20px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  cursor: pointer;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #1565c0;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.4);
  }
`

export function FloatingInput({
  placeholder = '새 과업 입력',
  onSubmit,
  autoFocus = false,
}: FloatingInputProps) {
  const [value, setValue] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleSubmit = () => {
    const trimmedValue = value.trim()
    if (!trimmedValue) return

    onSubmit(trimmedValue)
    setValue('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 한글 IME 조합 중에는 Enter 처리를 무시
    if (isComposing) return
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  return (
    <Container data-testid="floating-input">
      <InputWrapper>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          aria-label={placeholder}
        />
        <SubmitButton
          type="button"
          onClick={handleSubmit}
          disabled={!value.trim()}
          aria-label="추가"
        >
          추가
        </SubmitButton>
      </InputWrapper>
    </Container>
  )
}
