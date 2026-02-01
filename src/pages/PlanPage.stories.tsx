import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, userEvent, within, waitFor } from '@storybook/test'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskList, type TaskStatusChange } from '../components/TaskList'
import { FloatingInput } from '../components/FloatingInput'
import { UncompletedTaskList } from '../components/UncompletedTaskList'
import type { Task } from '../types'

// PlanPage의 핵심 UI를 재구성한 스토리용 레이아웃 컴포넌트

const Container = styled.div`
  padding: 16px;
  padding-bottom: 140px;
  max-width: 600px;
  margin: 0 auto;
  min-height: 100vh;
`

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const MessageBubble = styled(motion.div)<{ $type: 'system' | 'user' }>`
  padding: 16px;
  border-radius: 16px;
  background: ${(props) => (props.$type === 'system' ? '#f0f4f8' : '#e3f2fd')};
  max-width: 85%;
  align-self: ${(props) =>
    props.$type === 'system' ? 'flex-start' : 'flex-end'};
`

const SystemMessage = styled.div`
  font-size: 15px;
  color: #333;
  line-height: 1.5;
`

const Greeting = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1976d2;
`

const ActionButton = styled.button`
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 15px;
  cursor: pointer;
  background: #1976d2;
  color: white;
  border: none;
  margin-top: 12px;

  &:hover {
    background: #1565c0;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`

const SectionCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
`

const SectionTitle = styled.h3`
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  font-weight: 500;
`

const CompletedBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background: #e8f5e9;
  color: #4caf50;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 8px;
`

const SelectedCount = styled.span`
  color: #1976d2;
  font-weight: 500;
`

type PlanPhase = 'entry' | 'uncompleted' | 'create'

interface PlanPageLayoutProps {
  initialPhase?: PlanPhase
  uncompletedTasks?: Task[]
  todayTasks?: Task[]
  onBatchStatusChange?: (changes: TaskStatusChange[]) => void
  onUpdate?: (id: string, input: { title?: string }) => void
  onDelete?: (id: string) => void
  onCreate?: (title: string) => void
  onComplete?: () => void
  onMoveToToday?: (taskIds: string[]) => void
}

function PlanPageLayout({
  initialPhase = 'entry',
  uncompletedTasks: initialUncompletedTasks = [],
  todayTasks: initialTodayTasks = [],
  onBatchStatusChange = fn(),
  onUpdate = fn(),
  onDelete = fn(),
  onCreate = fn(),
  onComplete = fn(),
  onMoveToToday = fn(),
}: PlanPageLayoutProps) {
  const [currentPhase, setCurrentPhase] = useState<PlanPhase>(initialPhase)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const [uncompletedStepDone, setUncompletedStepDone] = useState(
    initialPhase === 'create'
  )
  // 내부 상태로 과업 목록 관리
  const [uncompletedTasks, setUncompletedTasks] = useState<Task[]>(
    initialUncompletedTasks
  )
  const [todayTasks, setTodayTasks] = useState<Task[]>(initialTodayTasks)

  const hasUncompletedTasks = uncompletedTasks.length > 0

  const handleStart = () => {
    if (hasUncompletedTasks) {
      setCurrentPhase('uncompleted')
    } else {
      setCurrentPhase('create')
    }
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

  const handleProceed = () => {
    const selectedIds = Array.from(selectedTaskIds)
    onMoveToToday(selectedIds)

    // 선택된 과업을 오늘 과업으로 이동
    const movedTasks = uncompletedTasks.filter((task) =>
      selectedIds.includes(task.id)
    )
    const remainingTasks = uncompletedTasks.filter(
      (task) => !selectedIds.includes(task.id)
    )

    setTodayTasks((prev) => [...movedTasks, ...prev])
    setUncompletedTasks(remainingTasks)
    setUncompletedStepDone(true)
    setCurrentPhase('create')
  }

  const showUncompleted = currentPhase !== 'entry' && hasUncompletedTasks
  const showCreate = currentPhase === 'create'

  const bubbleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <Container>
      <ChatContainer>
        <MessageBubble
          $type="system"
          variants={bubbleVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3 }}
        >
          <Greeting>좋은 아침이에요!</Greeting>
          <SystemMessage>오늘 하루도 화이팅! 계획을 세워볼까요?</SystemMessage>
          {currentPhase === 'entry' && (
            <ActionButton onClick={handleStart}>시작하기</ActionButton>
          )}
        </MessageBubble>

        <AnimatePresence>
          {showUncompleted && (
            <SectionCard
              key="uncompleted"
              variants={bubbleVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SectionTitle>
                미완료 과업
                {uncompletedStepDone && <CompletedBadge>완료</CompletedBadge>}
              </SectionTitle>

              {!uncompletedStepDone ? (
                <>
                  <SystemMessage style={{ marginBottom: 12, color: '#666' }}>
                    어제 완료하지 못한 과업이 있어요. 오늘 계속할 과업을
                    선택해주세요.
                  </SystemMessage>
                  <UncompletedTaskList
                    tasks={uncompletedTasks}
                    selectedIds={selectedTaskIds}
                    onToggle={handleToggleTask}
                  />
                  <ActionButton onClick={handleProceed}>
                    {selectedTaskIds.size > 0 ? (
                      <>
                        <SelectedCount>{selectedTaskIds.size}개</SelectedCount>{' '}
                        선택 완료
                      </>
                    ) : (
                      '선택 없이 진행'
                    )}
                  </ActionButton>
                </>
              ) : (
                <SystemMessage style={{ color: '#666' }}>
                  {selectedTaskIds.size > 0
                    ? `${selectedTaskIds.size}개의 과업을 오늘 계획에 추가했어요.`
                    : '미완료 과업 없이 진행했어요.'}
                </SystemMessage>
              )}
            </SectionCard>
          )}

          {showCreate && (
            <SectionCard
              key="create"
              variants={bubbleVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <SectionTitle>오늘의 과업</SectionTitle>
              <SystemMessage style={{ marginBottom: 12, color: '#666' }}>
                오늘 할 일을 추가해주세요. 아래 입력창에 과업을 입력하면 돼요.
              </SystemMessage>

              <TaskList
                tasks={todayTasks}
                onBatchStatusChange={onBatchStatusChange}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />

              <ActionButton
                onClick={onComplete}
                disabled={todayTasks.length === 0}
                style={{ marginTop: 16 }}
              >
                {todayTasks.length > 0
                  ? `${todayTasks.length}개 과업으로 시작하기`
                  : '과업을 추가해주세요'}
              </ActionButton>
            </SectionCard>
          )}
        </AnimatePresence>
      </ChatContainer>

      {showCreate && (
        <FloatingInput placeholder="새 과업을 입력하세요" onSubmit={onCreate} />
      )}
    </Container>
  )
}

const meta: Meta<typeof PlanPageLayout> = {
  title: 'Pages/PlanPage',
  component: PlanPageLayout,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onBatchStatusChange: fn(),
    onUpdate: fn(),
    onDelete: fn(),
    onCreate: fn(),
    onComplete: fn(),
    onMoveToToday: fn(),
  },
}

export default meta
type Story = StoryObj<typeof PlanPageLayout>

const mockUncompletedTasks: Task[] = [
  {
    id: 'task-1',
    title: '어제 미완료 과업 1',
    status: 'pending',
    date: '2025-01-30',
    events: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'task-2',
    title: '어제 미완료 과업 2',
    status: 'in_progress',
    date: '2025-01-30',
    events: [{ eventType: 'started', timestamp: new Date() }],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockTodayTasks: Task[] = [
  {
    id: 'task-today-1',
    title: '오늘 추가한 과업',
    status: 'pending',
    date: '2025-01-31',
    events: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const InitialState: Story = {
  args: {
    initialPhase: 'entry',
    uncompletedTasks: mockUncompletedTasks,
  },
}

export const NoUncompletedTasks: Story = {
  args: {
    initialPhase: 'entry',
    uncompletedTasks: [],
  },
}

export const WithUncompletedTasks: Story = {
  args: {
    initialPhase: 'uncompleted',
    uncompletedTasks: mockUncompletedTasks,
  },
}

export const CreatePhase: Story = {
  args: {
    initialPhase: 'create',
    uncompletedTasks: [],
    todayTasks: mockTodayTasks,
  },
}

export const CreatePhaseEmpty: Story = {
  args: {
    initialPhase: 'create',
    uncompletedTasks: [],
    todayTasks: [],
  },
}

export const StartPlanningFlow: Story = {
  args: {
    initialPhase: 'entry',
    uncompletedTasks: mockUncompletedTasks,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 시작하기 버튼 클릭
    const startButton = canvas.getByRole('button', { name: '시작하기' })
    await userEvent.click(startButton)

    // 미완료 과업 섹션이 표시되는지 확인
    await waitFor(() => {
      expect(canvas.getByText('미완료 과업')).toBeVisible()
    })
  },
}

export const SelectAndProceed: Story = {
  args: {
    initialPhase: 'uncompleted',
    uncompletedTasks: mockUncompletedTasks,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // 첫 번째 과업 선택
    const firstTask = canvas.getByText('어제 미완료 과업 1')
    await userEvent.click(firstTask)

    // 선택 완료 버튼 텍스트가 변경되었는지 확인
    await waitFor(() => {
      expect(canvas.getByText('1개')).toBeVisible()
    })

    // 선택 완료 버튼 클릭
    const proceedButton = canvas.getByRole('button', { name: /선택 완료/ })
    await userEvent.click(proceedButton)

    // onMoveToToday가 호출되었는지 확인
    await expect(args.onMoveToToday).toHaveBeenCalledWith(['task-1'])

    // 오늘의 과업 섹션이 표시되는지 확인
    await waitFor(() => {
      expect(canvas.getByText('오늘의 과업')).toBeVisible()
    })
  },
}
