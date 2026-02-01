import { useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import styled from 'styled-components'
import { GoalList } from '../components/GoalList'
import {
  getAllGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  setGoalActive,
} from '../db/goalRepository'

const Container = styled.div`
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
`

const Header = styled.h1`
  margin-bottom: 24px;
`

const AddForm = styled.form`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
`

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`

const AddButton = styled.button`
  padding: 12px 24px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #1565c0;
  }
`

export function GoalsPage() {
  const [newTitle, setNewTitle] = useState('')
  const goals = useLiveQuery(() => getAllGoals(), [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedTitle = newTitle.trim()
    if (!trimmedTitle) return

    await createGoal({ title: trimmedTitle })
    setNewTitle('')
  }

  const handleUpdate = async (
    id: string,
    input: { title?: string; memo?: string }
  ) => {
    await updateGoal(id, input)
  }

  const handleDelete = async (id: string) => {
    await deleteGoal(id)
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await setGoalActive(id, isActive)
  }

  return (
    <Container>
      <Header>Goal 관리</Header>
      <AddForm onSubmit={handleSubmit}>
        <Input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="새 목표 입력"
        />
        <AddButton type="submit">추가</AddButton>
      </AddForm>
      <GoalList
        goals={goals || []}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />
    </Container>
  )
}
