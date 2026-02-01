import styled from 'styled-components'
import type { Goal } from '../types'
import { GoalListItem } from './GoalListItem'

export interface GoalListProps {
  goals: Goal[]
  onUpdate: (id: string, input: { title?: string; memo?: string }) => void
  onDelete: (id: string) => void
  onToggleActive: (id: string, isActive: boolean) => void
  size?: 'default' | 'compact'
}

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`

const EmptyMessage = styled.p`
  text-align: center;
  color: #666;
  padding: 24px;
`

export function GoalList({
  goals,
  onUpdate,
  onDelete,
  onToggleActive,
  size = 'default',
}: GoalListProps) {
  if (goals.length === 0) {
    return <EmptyMessage>등록된 목표가 없습니다</EmptyMessage>
  }

  return (
    <List data-size={size}>
      {goals.map((goal) => (
        <GoalListItem
          key={goal.id}
          goal={goal}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </List>
  )
}
