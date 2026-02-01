import { useState } from 'react'
import styled from 'styled-components'
import type { Task, Goal, TaskStatus, TaskEventType } from '../types'

export interface TaskListItemProps {
  task: Task
  goals: Goal[]
  onStatusChange: (
    id: string,
    status: TaskStatus,
    eventType: TaskEventType
  ) => void
  onUpdate: (
    id: string,
    input: { title?: string; memo?: string; goalId?: string }
  ) => void
  onDelete: (id: string) => void
}

const ListItem = styled.li<{ $status: TaskStatus }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #eee;
  opacity: ${(props) => (props.$status === 'completed' ? 0.5 : 1)};
  background: ${(props) =>
    props.$status === 'in_progress' ? '#e3f2fd' : 'transparent'};
`

const Content = styled.div`
  flex: 1;
  cursor: pointer;
`

const Title = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`

const Memo = styled.div`
  font-size: 14px;
  color: #666;
`

const GoalTag = styled.span`
  font-size: 12px;
  color: #1976d2;
  background: #e3f2fd;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
`

const Button = styled.button`
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }
`

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
`

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
`

const EditForm = styled.div`
  flex: 1;
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

export function TaskListItem({
  task,
  goals,
  onStatusChange,
  onUpdate,
  onDelete,
}: TaskListItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editMemo, setEditMemo] = useState(task.memo || '')
  const [editGoalId, setEditGoalId] = useState(task.goalId || '')

  const linkedGoal = goals.find((g) => g.id === task.goalId)

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
      memo: editMemo,
      goalId: editGoalId || undefined,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(task.title)
    setEditMemo(task.memo || '')
    setEditGoalId(task.goalId || '')
    setIsEditing(false)
  }

  const handleDeleteConfirm = () => {
    onDelete(task.id)
    setIsDeleting(false)
  }

  const handleDeleteCancel = () => {
    setIsDeleting(false)
  }

  if (isEditing) {
    return (
      <ListItem $status={task.status} data-status={task.status}>
        <Checkbox
          type="checkbox"
          checked={task.status === 'completed'}
          onChange={handleCheckboxChange}
        />
        <EditForm>
          <Input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="과업 제목"
          />
          <Input
            type="text"
            value={editMemo}
            onChange={(e) => setEditMemo(e.target.value)}
            placeholder="메모"
          />
          <Select
            value={editGoalId}
            onChange={(e) => setEditGoalId(e.target.value)}
          >
            <option value="">목표 없음</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </Select>
          <Actions>
            <Button onClick={handleSave}>저장</Button>
            <Button onClick={handleCancel}>취소</Button>
          </Actions>
        </EditForm>
      </ListItem>
    )
  }

  return (
    <ListItem $status={task.status} data-status={task.status}>
      <Checkbox
        type="checkbox"
        checked={task.status === 'completed'}
        onChange={handleCheckboxChange}
      />
      <Content onClick={handleContentClick}>
        <Title>
          {task.title}
          {linkedGoal && <GoalTag>{linkedGoal.title}</GoalTag>}
        </Title>
        {task.memo && <Memo>{task.memo}</Memo>}
      </Content>
      <Actions>
        {isDeleting ? (
          <DeleteConfirm>
            <span>정말 삭제하시겠습니까?</span>
            <Button onClick={handleDeleteConfirm}>확인</Button>
            <Button onClick={handleDeleteCancel}>취소</Button>
          </DeleteConfirm>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)}>편집</Button>
            <Button onClick={() => setIsDeleting(true)}>삭제</Button>
          </>
        )}
      </Actions>
    </ListItem>
  )
}
