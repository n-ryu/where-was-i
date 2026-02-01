import styled from 'styled-components'
import type { Task, Goal, TaskStatus, TaskEventType } from '../types'
import { TaskListItem } from './TaskListItem'

export interface TaskStatusChange {
  id: string
  status: TaskStatus
  eventType: TaskEventType
}

export interface TaskListProps {
  tasks: Task[]
  goals: Goal[]
  onBatchStatusChange: (changes: TaskStatusChange[]) => void
  onUpdate: (id: string, input: { title?: string; goalId?: string }) => void
  onDelete: (id: string) => void
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Section = styled.section<{ $highlighted?: boolean }>`
  background: ${(props) => (props.$highlighted ? '#e3f2fd' : 'transparent')};
  border-radius: 8px;
  padding: ${(props) => (props.$highlighted ? '12px' : '0')};
`

const SectionTitle = styled.h3`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
`

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

const EmptyMessage = styled.div`
  text-align: center;
  color: #999;
  padding: 24px;
`

function getCompletedTime(task: Task): number {
  const completedEvent = [...task.events]
    .reverse()
    .find((e) => e.eventType === 'completed')
  return completedEvent ? completedEvent.timestamp.getTime() : 0
}

export function TaskList({
  tasks,
  goals,
  onBatchStatusChange,
  onUpdate,
  onDelete,
}: TaskListProps) {
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress')
  const pendingTasks = tasks.filter((t) => t.status === 'pending')
  const completedTasks = tasks
    .filter((t) => t.status === 'completed')
    .sort((a, b) => getCompletedTime(b) - getCompletedTime(a))

  const handleStatusChange = (
    taskId: string,
    newStatus: TaskStatus,
    eventType: TaskEventType
  ) => {
    const changes: TaskStatusChange[] = [
      { id: taskId, status: newStatus, eventType },
    ]

    // 대기중 Task가 진행중으로 전환되면 기존 진행중 Task를 대기중으로 변경
    if (newStatus === 'in_progress') {
      for (const inProgressTask of inProgressTasks) {
        changes.push({
          id: inProgressTask.id,
          status: 'pending',
          eventType: 'paused',
        })
      }
    }

    onBatchStatusChange(changes)
  }

  if (tasks.length === 0) {
    return <EmptyMessage>등록된 과업이 없습니다</EmptyMessage>
  }

  return (
    <Container>
      {inProgressTasks.length > 0 && (
        <Section
          $highlighted
          data-testid="in-progress-section"
          data-highlighted="true"
        >
          <SectionTitle>진행중</SectionTitle>
          <List>
            {inProgressTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                goals={goals}
                onStatusChange={handleStatusChange}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </List>
        </Section>
      )}

      {pendingTasks.length > 0 && (
        <Section data-testid="pending-section">
          <SectionTitle>대기중</SectionTitle>
          <List>
            {pendingTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                goals={goals}
                onStatusChange={handleStatusChange}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </List>
        </Section>
      )}

      {completedTasks.length > 0 && (
        <Section data-testid="completed-section">
          <SectionTitle>완료</SectionTitle>
          <List>
            {completedTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                goals={goals}
                onStatusChange={handleStatusChange}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </List>
        </Section>
      )}
    </Container>
  )
}
