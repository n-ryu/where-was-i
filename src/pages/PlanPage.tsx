import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from '@tanstack/react-router'
import styled from 'styled-components'
import { TaskList, type TaskStatusChange } from '../components/TaskList'
import { TaskForm } from '../components/TaskForm'
import { UncompletedTaskList } from '../components/UncompletedTaskList'
import { StepIndicator } from '../components/StepIndicator'
import {
  getTasksByDate,
  getUncompletedTasksBefore,
  createTask,
  updateTask,
  deleteTask,
  batchUpdateTaskStatus,
} from '../db/taskRepository'

const Container = styled.div`
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
`

const Header = styled.h1`
  margin-bottom: 24px;
  text-align: center;
`

const Section = styled.div`
  margin-bottom: 24px;
`

const SectionTitle = styled.h2`
  font-size: 18px;
  margin-bottom: 16px;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
`

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
`

const PrimaryButton = styled(Button)`
  background: #1976d2;
  color: white;
  border: none;

  &:hover {
    background: #1565c0;
  }
`

type PlanStep = 'uncompleted' | 'create' | 'confirm'

const STEPS = [
  { key: 'uncompleted', label: '미완료 처리' },
  { key: 'create', label: '과업 생성' },
  { key: 'confirm', label: '계획 확정' },
]

function getTodayDate(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

function getTomorrowDate(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

export function PlanPage() {
  const navigate = useNavigate()
  const today = getTodayDate()
  const [userStep, setUserStep] = useState<PlanStep>('uncompleted')

  const uncompletedTasks = useLiveQuery(
    () => getUncompletedTasksBefore(today),
    [today]
  )
  const todayTasks = useLiveQuery(() => getTasksByDate(today), [today])

  // 미완료 과업이 없으면 자동으로 Step 2로 표시
  const { currentStep, completedSteps } = useMemo(() => {
    const hasUncompletedTasks =
      uncompletedTasks !== undefined && uncompletedTasks.length > 0
    const skipUncompleted = userStep === 'uncompleted' && !hasUncompletedTasks

    if (skipUncompleted) {
      return {
        currentStep: 'create' as PlanStep,
        completedSteps: ['uncompleted'],
      }
    }
    if (userStep === 'create') {
      return {
        currentStep: 'create' as PlanStep,
        completedSteps: ['uncompleted'],
      }
    }
    if (userStep === 'confirm') {
      return {
        currentStep: 'confirm' as PlanStep,
        completedSteps: ['uncompleted', 'create'],
      }
    }
    return { currentStep: userStep, completedSteps: [] as string[] }
  }, [userStep, uncompletedTasks])

  const handleIncludeToday = async (taskId: string) => {
    await updateTask(taskId, { date: today })
  }

  const handleCancel = async (taskId: string) => {
    await updateTask(taskId, { status: 'cancelled' })
  }

  const handlePostpone = async (taskId: string) => {
    await updateTask(taskId, { date: getTomorrowDate() })
  }

  const handleCreate = async (input: { title: string }) => {
    await createTask({
      title: input.title,
      date: today,
    })
  }

  const handleBatchStatusChange = async (changes: TaskStatusChange[]) => {
    await batchUpdateTaskStatus(changes)
  }

  const handleUpdate = async (id: string, input: { title?: string }) => {
    await updateTask(id, input)
  }

  const handleDelete = async (id: string) => {
    await deleteTask(id)
  }

  const handleNext = () => {
    if (currentStep === 'create') {
      setUserStep('confirm')
    }
  }

  const handleConfirm = () => {
    navigate({ to: '/' })
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'uncompleted':
        return '미완료 과업 처리'
      case 'create':
        return '오늘 과업 생성'
      case 'confirm':
        return '계획 확정'
    }
  }

  return (
    <Container>
      <Header>오늘의 계획</Header>
      <StepIndicator
        steps={STEPS}
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      <SectionTitle>{getStepTitle()}</SectionTitle>

      {currentStep === 'uncompleted' && (
        <Section>
          <UncompletedTaskList
            tasks={uncompletedTasks || []}
            onIncludeToday={handleIncludeToday}
            onCancel={handleCancel}
            onPostpone={handlePostpone}
          />
        </Section>
      )}

      {currentStep === 'create' && (
        <>
          <Section>
            <TaskForm onCreate={handleCreate} />
          </Section>
          <Section>
            <TaskList
              tasks={todayTasks || []}
              onBatchStatusChange={handleBatchStatusChange}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </Section>
          <ButtonContainer>
            <PrimaryButton onClick={handleNext}>다음</PrimaryButton>
          </ButtonContainer>
        </>
      )}

      {currentStep === 'confirm' && (
        <>
          <Section>
            <TaskList
              tasks={todayTasks || []}
              onBatchStatusChange={handleBatchStatusChange}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </Section>
          <ButtonContainer>
            <PrimaryButton onClick={handleConfirm}>확정</PrimaryButton>
          </ButtonContainer>
        </>
      )}
    </Container>
  )
}
