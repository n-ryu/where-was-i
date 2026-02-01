import { useState, type KeyboardEvent } from 'react'
import styled from 'styled-components'
import type { Goal } from '../types'

export interface TaskFormProps {
  goals: Goal[]
  onCreate: (input: { title: string; goalId?: string }) => void
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

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;

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

export function TaskForm({ goals, onCreate }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [goalId, setGoalId] = useState('')

  const handleSubmit = () => {
    if (!title.trim()) return
    onCreate({
      title: title.trim(),
      goalId: goalId || undefined,
    })
    setTitle('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && title.trim()) {
      handleSubmit()
    }
  }

  return (
    <Form>
      <Input
        type="text"
        placeholder="새 과업 입력"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
        <option value="">목표 없음</option>
        {goals.map((goal) => (
          <option key={goal.id} value={goal.id}>
            {goal.title}
          </option>
        ))}
      </Select>
      <Button type="button" onClick={handleSubmit} disabled={!title.trim()}>
        추가
      </Button>
    </Form>
  )
}
