import { useState, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from '@tanstack/react-router'
import styled from 'styled-components'
import { TaskList, type TaskStatusChange } from '../components/TaskList'
import { FloatingInput } from '../components/FloatingInput'
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
  padding-bottom: 100px; /* FloatingInput 공간 */
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

const EntryContainer = styled.div`
  text-align: center;
  padding: 48px 16px;
`

const Greeting = styled.h2`
  font-size: 24px;
  margin-bottom: 16px;
  color: #333;
`

const EntryMessage = styled.p`
  color: #666;
  margin-bottom: 32px;
  font-size: 16px;
`

const StartButton = styled(PrimaryButton)`
  padding: 16px 48px;
  font-size: 18px;
`

type PlanStep = 'entry' | 'uncompleted' | 'create'

const STEPS = [
  { key: 'uncompleted', label: '미완료 선택' },
  { key: 'create', label: '과업 추가' },
]

function getTodayDate(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return '좋은 아침이에요!'
  if (hour < 18) return '좋은 오후예요!'
  return '좋은 저녁이에요!'
}

export function PlanPage() {
  const navigate = useNavigate()
  const today = getTodayDate()
  const [userStep, setUserStep] = useState<PlanStep>('entry')
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())

  const uncompletedTasks = useLiveQuery(
    () => getUncompletedTasksBefore(today),
    [today]
  )
  const todayTasks = useLiveQuery(() => getTasksByDate(today), [today])

  // 현재 단계 계산
  const { currentStep, completedSteps, showStepIndicator } = useMemo(() => {
    // 엔트리 단계에서는 StepIndicator를 숨김
    if (userStep === 'entry') {
      return {
        currentStep: 'entry' as PlanStep,
        completedSteps: [] as string[],
        showStepIndicator: false,
      }
    }

    const hasUncompletedTasks =
      uncompletedTasks !== undefined && uncompletedTasks.length > 0

    // 미완료 과업이 없으면 자동으로 create 단계로
    if (userStep === 'uncompleted' && !hasUncompletedTasks) {
      return {
        currentStep: 'create' as PlanStep,
        completedSteps: ['uncompleted'],
        showStepIndicator: true,
      }
    }

    if (userStep === 'create') {
      return {
        currentStep: 'create' as PlanStep,
        completedSteps: ['uncompleted'],
        showStepIndicator: true,
      }
    }

    return {
      currentStep: userStep,
      completedSteps: [] as string[],
      showStepIndicator: true,
    }
  }, [userStep, uncompletedTasks])

  const handleStart = () => {
    setUserStep('uncompleted')
  }

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev)
      if (next.has(taskId)) {
        next.delete(taskId)
      } else {
        next.add(taskId)
      }
      return next
    })
  }

  const handleProceed = async () => {
    // 선택된 과업들을 오늘 날짜로 변경
    for (const taskId of selectedTaskIds) {
      await updateTask(taskId, { date: today })
    }
    setUserStep('create')
  }

  const handleCreateTask = async (title: string) => {
    await createTask({
      title,
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

  const handleComplete = () => {
    navigate({ to: '/' })
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'uncompleted':
        return '미완료 과업 선택'
      case 'create':
        return '오늘 과업 추가'
      default:
        return ''
    }
  }

  // 엔트리 단계
  if (currentStep === 'entry') {
    return (
      <Container>
        <EntryContainer>
          <Greeting>{getGreeting()}</Greeting>
          <EntryMessage>오늘 하루도 화이팅! 계획을 세워볼까요?</EntryMessage>
          <StartButton onClick={handleStart}>시작하기</StartButton>
        </EntryContainer>
      </Container>
    )
  }

  return (
    <Container>
      <Header>오늘의 계획</Header>
      {showStepIndicator && (
        <StepIndicator
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
      )}

      <SectionTitle>{getStepTitle()}</SectionTitle>

      {currentStep === 'uncompleted' && (
        <Section>
          <UncompletedTaskList
            tasks={uncompletedTasks || []}
            selectedIds={selectedTaskIds}
            onToggle={handleToggleTask}
          />
          <ButtonContainer>
            <PrimaryButton onClick={handleProceed}>진행하기</PrimaryButton>
          </ButtonContainer>
        </Section>
      )}

      {currentStep === 'create' && (
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
            <PrimaryButton onClick={handleComplete}>완료</PrimaryButton>
          </ButtonContainer>
          <FloatingInput
            placeholder="새 과업을 입력하세요"
            onSubmit={handleCreateTask}
          />
        </>
      )}
    </Container>
  )
}
