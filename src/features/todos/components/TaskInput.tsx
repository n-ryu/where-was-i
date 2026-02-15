import { useState } from 'react'
import type { FormEvent } from 'react'
import styled from 'styled-components'
import type { TaskInputProps } from '../types'

const Form = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`

const Input = styled.input`
  flex: 1;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const SubmitButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
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
      <SubmitButton type="submit" aria-label="Add task">
        +
      </SubmitButton>
    </Form>
  )
}
