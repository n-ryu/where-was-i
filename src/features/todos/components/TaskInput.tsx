import { useState } from 'react'
import type { FormEvent } from 'react'
import styled from 'styled-components'
import type { TaskInputProps } from '../types'

const Form = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`

const Input = styled.input`
  flex: 1;
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}22;
  }
`

const SubmitButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 1rem;
  cursor: pointer;
  transition: transform 100ms ease, opacity 100ms ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.93);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

export const TaskInput = ({ onAddTodo }: TaskInputProps) => {
  const [value, setValue] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onAddTodo(trimmed)
    setValue('')
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a new task..."
        aria-label="New task title"
      />
      <SubmitButton type="submit" aria-label="Add task" disabled={!value.trim()}>
        +
      </SubmitButton>
    </Form>
  )
}
