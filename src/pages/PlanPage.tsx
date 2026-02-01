import { useLiveQuery } from 'dexie-react-hooks'
import styled from 'styled-components'
import { TaskList, type TaskStatusChange } from '../components/TaskList'
import { TaskForm } from '../components/TaskForm'
import {
  getTasksByDate,
  createTask,
  updateTask,
  deleteTask,
  batchUpdateTaskStatus,
} from '../db/taskRepository'
import { getActiveGoals } from '../db/goalRepository'

const Container = styled.div`
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
`

const Header = styled.h1`
  margin-bottom: 24px;
`

const FormSection = styled.div`
  margin-bottom: 24px;
`

function getTodayDate(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

export function PlanPage() {
  const today = getTodayDate()
  const tasks = useLiveQuery(() => getTasksByDate(today), [today])
  const goals = useLiveQuery(() => getActiveGoals(), [])

  const handleCreate = async (input: { title: string; goalId?: string }) => {
    await createTask({
      title: input.title,
      date: today,
      goalId: input.goalId,
    })
  }

  const handleBatchStatusChange = async (changes: TaskStatusChange[]) => {
    await batchUpdateTaskStatus(changes)
  }

  const handleUpdate = async (
    id: string,
    input: { title?: string; memo?: string; goalId?: string }
  ) => {
    await updateTask(id, input)
  }

  const handleDelete = async (id: string) => {
    await deleteTask(id)
  }

  return (
    <Container>
      <Header>오늘의 과업</Header>
      <FormSection>
        <TaskForm goals={goals || []} onCreate={handleCreate} />
      </FormSection>
      <TaskList
        tasks={tasks || []}
        goals={goals || []}
        onBatchStatusChange={handleBatchStatusChange}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </Container>
  )
}
