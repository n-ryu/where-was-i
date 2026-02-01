import { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { motion } from 'framer-motion'
import type { Task, TaskStatus, TaskEventType } from '../types'

export interface TaskListItemProps {
  task: Task
  onStatusChange: (
    id: string,
    status: TaskStatus,
    eventType: TaskEventType
  ) => void
  onUpdate: (id: string, input: { title?: string }) => void
  onDelete: (id: string) => void
}

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
`

const ListItem = styled(motion.li)<{ $status: TaskStatus }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  opacity: ${(props) => (props.$status === 'completed' ? 0.5 : 1)};
  background: ${(props) =>
    props.$status === 'in_progress' ? '#e8f5e9' : '#f5f5f5'};
  border-left: ${(props) =>
    props.$status === 'in_progress'
      ? '4px solid #4caf50'
      : '4px solid transparent'};
`

const Content = styled.div`
  flex: 1;
  cursor: pointer;
`

const Title = styled.div<{ $inProgress?: boolean }>`
  font-weight: ${(props) => (props.$inProgress ? '600' : '500')};
  color: ${(props) => (props.$inProgress ? '#2e7d32' : 'inherit')};
`

const TitleInput = styled.input<{ $inProgress?: boolean }>`
  font-weight: ${(props) => (props.$inProgress ? '600' : '500')};
  color: ${(props) => (props.$inProgress ? '#2e7d32' : 'inherit')};
  font-size: inherit;
  font-family: inherit;
  background: transparent;
  border: none;
  border-bottom: 1px dashed #999;
  outline: none;
  width: 100%;
  padding: 0;
  margin: 0;

  &:focus {
    border-bottom-color: #4caf50;
  }
`

const ElapsedTime = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4caf50;
  margin-top: 4px;
`

const PulsingDot = styled.span`
  width: 8px;
  height: 8px;
  background: #4caf50;
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
`

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.6;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    opacity: 1;
  }
`

const Checkbox = styled.input`
  margin-top: 4px;
`

const DeleteConfirm = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d32f2f;
`

function getLastStartedTime(task: Task): Date | null {
  const startedEvents = task.events.filter((e) => e.eventType === 'started')
  if (startedEvents.length === 0) return null
  return startedEvents[startedEvents.length - 1].timestamp
}

function formatElapsedTime(startTime: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - startTime.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMinutes / 60)
  const remainingMinutes = diffMinutes % 60

  if (diffHours > 0) {
    return `${diffHours}시간 ${remainingMinutes}분 경과`
  }
  return `${diffMinutes}분 경과`
}

export function TaskListItem({
  task,
  onStatusChange,
  onUpdate,
  onDelete,
}: TaskListItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [tick, setTick] = useState(0)

  const isInProgress = task.status === 'in_progress'
  const startedTime = isInProgress ? getLastStartedTime(task) : null
  const elapsedTime = startedTime ? formatElapsedTime(startedTime) : ''

  // 편집 중이거나 저장 직후(DB 반영 대기 중)에는 editTitle 표시
  const displayTitle =
    isEditing || editTitle !== task.title ? editTitle : task.title

  // 실시간 경과 시간 업데이트를 위한 tick
  useEffect(() => {
    if (!isInProgress || !startedTime) {
      return
    }

    const interval = setInterval(() => {
      setTick((t) => t + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isInProgress, startedTime])

  // tick을 사용하여 리렌더링 유도 (린트 경고 방지)
  void tick

  const handleCheckboxChange = () => {
    if (task.status === 'completed') {
      onStatusChange(task.id, 'pending', 'paused')
    } else {
      onStatusChange(task.id, 'completed', 'completed')
    }
  }

  const handleContentClick = () => {
    if (task.status === 'pending') {
      onStatusChange(task.id, 'in_progress', 'started')
    }
  }

  const handleSave = () => {
    onUpdate(task.id, {
      title: editTitle,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(task.title)
    setIsEditing(false)
  }

  const handleDeleteConfirm = () => {
    onDelete(task.id)
    setIsDeleting(false)
  }

  const handleDeleteCancel = () => {
    setIsDeleting(false)
  }

  return (
    <ListItem
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      $status={task.status}
      data-status={task.status}
    >
      <Checkbox
        type="checkbox"
        checked={task.status === 'completed'}
        onChange={handleCheckboxChange}
      />
      <Content onClick={isEditing ? undefined : handleContentClick}>
        {isEditing ? (
          <TitleInput
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave()
              }
            }}
            $inProgress={isInProgress}
            autoFocus
          />
        ) : (
          <Title $inProgress={isInProgress}>{displayTitle}</Title>
        )}
        {isInProgress && elapsedTime && (
          <ElapsedTime>
            <PulsingDot />
            {elapsedTime}
          </ElapsedTime>
        )}
      </Content>
      <Actions>
        {isDeleting ? (
          <DeleteConfirm>
            <span>삭제할까요?</span>
            <IconButton onClick={handleDeleteConfirm} title="확인">
              ✓
            </IconButton>
            <IconButton onClick={handleDeleteCancel} title="취소">
              ✕
            </IconButton>
          </DeleteConfirm>
        ) : isEditing ? (
          <>
            <IconButton onClick={handleSave} title="저장">
              ✓
            </IconButton>
            <IconButton onClick={handleCancel} title="취소">
              ✕
            </IconButton>
          </>
        ) : (
          <>
            <IconButton onClick={() => setIsEditing(true)} title="편집">
              ✎
            </IconButton>
            <IconButton onClick={() => setIsDeleting(true)} title="삭제">
              🗑
            </IconButton>
          </>
        )}
      </Actions>
    </ListItem>
  )
}
