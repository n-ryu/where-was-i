import { useState, type KeyboardEvent } from 'react'
import styled from 'styled-components'

export interface TaskFormProps {
  onCreate: (input: { title: string }) => void
}

const Form = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
`

const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #1976d2;
  }
`

const Button = styled.button`
  padding: 8px 16px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #1565c0;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`

export function TaskForm({ onCreate }: TaskFormProps) {
  const [title, setTitle] = useState('')

  const handleSubmit = () => {
    if (!title.trim()) return
    onCreate({
      title: title.trim(),
    })
    setTitle('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 한글 IME 조합 중에는 Enter 처리를 무시
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter' && title.trim()) {
      handleSubmit()
    }
  }

  return (
    <Form data-testid="task-form">
      <Input
        type="text"
        placeholder="새 과업 입력"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button type="button" onClick={handleSubmit} disabled={!title.trim()}>
        추가
      </Button>
    </Form>
  )
}
