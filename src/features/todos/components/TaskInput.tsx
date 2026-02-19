import { useState } from 'react'
import type { FormEvent } from 'react'
import styled from 'styled-components'
import type { TaskInputProps } from '../types'

const Form = styled.form`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  padding-bottom: max(${({ theme }) => theme.spacing.sm}, env(safe-area-inset-bottom));
  background: ${({ theme }) => theme.colors.background};
  box-shadow: 0 -1px 6px rgba(0, 0, 0, 0.06);
`

const Input = styled.input`
  flex: 1;
  min-height: 2.5rem;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.background};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}18;
  }
`

const SubmitButton = styled.button`
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  border: none;
  border-radius: 50%;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transition: transform 120ms ease, opacity 120ms ease, background 120ms ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.9);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.border};
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
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M9 15V3M9 3L3.5 8.5M9 3L14.5 8.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </SubmitButton>
    </Form>
  )
}
