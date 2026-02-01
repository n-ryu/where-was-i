import { useState } from 'react'
import styled from 'styled-components'
import type { Goal } from '../types'

export interface GoalListItemProps {
  goal: Goal
  onUpdate: (id: string, input: { title?: string; memo?: string }) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
}

const ListItem = styled.li<{ $isActive: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #eee;
  opacity: ${(props) => (props.$isActive ? 1 : 0.5)};
`

const Content = styled.div`
  flex: 1;
`

const Title = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`

const Memo = styled.div`
  font-size: 14px;
  color: #666;
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

export function GoalListItem({
  goal,
  onUpdate,
  onDelete,
  onToggleActive,
}: GoalListItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editTitle, setEditTitle] = useState(goal.title)
  const [editMemo, setEditMemo] = useState(goal.memo || '')

  const handleSave = () => {
    onUpdate(goal.id, { title: editTitle, memo: editMemo })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(goal.title)
    setEditMemo(goal.memo || '')
    setIsEditing(false)
  }

  const handleToggle = () => {
    onToggleActive(goal.id, !goal.isActive)
  }

  const handleDeleteConfirm = () => {
    onDelete(goal.id)
    setIsDeleting(false)
  }

  const handleDeleteCancel = () => {
    setIsDeleting(false)
  }

  if (isEditing) {
    return (
      <ListItem $isActive={goal.isActive}>
        <Checkbox
          type="checkbox"
          checked={goal.isActive}
          onChange={handleToggle}
        />
        <EditForm>
          <Input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="목표 제목"
          />
          <Input
            type="text"
            value={editMemo}
            onChange={(e) => setEditMemo(e.target.value)}
            placeholder="메모"
          />
          <Actions>
            <Button onClick={handleSave}>저장</Button>
            <Button onClick={handleCancel}>취소</Button>
          </Actions>
        </EditForm>
      </ListItem>
    )
  }

  return (
    <ListItem $isActive={goal.isActive}>
      <Checkbox
        type="checkbox"
        checked={goal.isActive}
        onChange={handleToggle}
      />
      <Content>
        <Title>{goal.title}</Title>
        {goal.memo && <Memo>{goal.memo}</Memo>}
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
