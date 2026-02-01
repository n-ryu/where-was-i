import { useState, useEffect, useRef, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from '@tanstack/react-router'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskList, type TaskStatusChange } from '../components/TaskList'
import { FloatingInput } from '../components/FloatingInput'
import { UncompletedTaskList } from '../components/UncompletedTaskList'
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
  padding-bottom: 100px;
  max-width: 600px;
  margin: 0 auto;
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

const bubbleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function PlanPage() {
  const navigate = useNavigate()
  const today = getTodayDate()
  const [currentPhase, setCurrentPhase] = useState<PlanPhase>('entry')
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const [uncompletedStepDone, setUncompletedStepDone] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const uncompletedTasks = useLiveQuery(
    () => getUncompletedTasksBefore(today),
    [today]
  )
  const todayTasks = useLiveQuery(() => getTasksByDate(today), [today])

  const isUncompletedLoaded = uncompletedTasks !== undefined
  const hasUncompletedTasks = isUncompletedLoaded && uncompletedTasks.length > 0

  // 미완료 과업이 없으면 자동으로 create 단계로 간주
  const effectivePhase = useMemo(() => {
    if (
      currentPhase === 'uncompleted' &&
      isUncompletedLoaded &&
      !hasUncompletedTasks
    ) {
      return 'create'
    }
    return currentPhase
  }, [currentPhase, isUncompletedLoaded, hasUncompletedTasks])

  // 스크롤 애니메이션
  useEffect(() => {
    if (containerRef.current?.scrollTo) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [effectivePhase, uncompletedStepDone])

  const handleStart = () => {
    setCurrentPhase('uncompleted')
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
    for (const taskId of selectedTaskIds) {
      await updateTask(taskId, { date: today })
    }
    setUncompletedStepDone(true)
    setCurrentPhase('create')
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

  const showUncompleted = effectivePhase !== 'entry' && hasUncompletedTasks
  const showCreate = effectivePhase === 'create' || uncompletedStepDone

  return (
    <Container ref={containerRef}>
      <ChatContainer>
        {/* 엔트리: 인사 메시지 */}
        <MessageBubble
          $type="system"
          variants={bubbleVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3 }}
        >
          <Greeting>{getGreeting()}</Greeting>
          <SystemMessage>오늘 하루도 화이팅! 계획을 세워볼까요?</SystemMessage>
          {currentPhase === 'entry' && (
            <ActionButton onClick={handleStart} disabled={!isUncompletedLoaded}>
              {isUncompletedLoaded ? '시작하기' : '로딩 중...'}
            </ActionButton>
          )}
        </MessageBubble>

        <AnimatePresence>
          {/* Step 1: 미완료 과업 선택 */}
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
                    tasks={uncompletedTasks || []}
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

          {/* Step 2: 오늘 과업 추가 */}
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
                tasks={todayTasks || []}
                onBatchStatusChange={handleBatchStatusChange}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />

              <ActionButton
                onClick={handleComplete}
                disabled={(todayTasks || []).length === 0}
                style={{ marginTop: 16 }}
              >
                {(todayTasks || []).length > 0
                  ? `${todayTasks?.length}개 과업으로 시작하기`
                  : '과업을 추가해주세요'}
              </ActionButton>
            </SectionCard>
          )}
        </AnimatePresence>
      </ChatContainer>

      {showCreate && (
        <FloatingInput
          placeholder="새 과업을 입력하세요"
          onSubmit={handleCreateTask}
        />
      )}
    </Container>
  )
}
