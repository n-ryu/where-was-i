import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { UncompletedTaskList } from './UncompletedTaskList'
import type { Task, Goal } from '../types'

const createMockTask = (overrides?: Partial<Task>): Task => ({
  id: 'task-1',
  title: '미완료 과업',
  status: 'pending',
  date: '2024-01-01',
  events: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

const createMockGoal = (overrides?: Partial<Goal>): Goal => ({
  id: 'goal-1',
  title: '테스트 목표',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

describe('UncompletedTaskList', () => {
  const defaultProps = {
    tasks: [],
    goals: [],
    onIncludeToday: vi.fn(),
    onCancel: vi.fn(),
    onPostpone: vi.fn(),
  }

  describe('기본 렌더링', () => {
    it('미완료 과업 목록이 표시되어야 한다', () => {
      const tasks = [
        createMockTask({ id: 'task-1', title: '과업 1' }),
        createMockTask({ id: 'task-2', title: '과업 2' }),
      ]
      render(<UncompletedTaskList {...defaultProps} tasks={tasks} />)
      expect(screen.getByText('과업 1')).toBeInTheDocument()
      expect(screen.getByText('과업 2')).toBeInTheDocument()
    })

    it('미완료 과업이 없으면 빈 상태 메시지가 표시되어야 한다', () => {
      render(<UncompletedTaskList {...defaultProps} tasks={[]} />)
      expect(screen.getByText('미완료 과업이 없습니다')).toBeInTheDocument()
    })

    it('과업에 연결된 Goal이 표시되어야 한다', () => {
      const tasks = [createMockTask({ goalId: 'goal-1' })]
      const goals = [createMockGoal({ id: 'goal-1', title: '연결된 목표' })]
      render(
        <UncompletedTaskList {...defaultProps} tasks={tasks} goals={goals} />
      )
      expect(screen.getByText('연결된 목표')).toBeInTheDocument()
    })
  })

  describe('액션 전달', () => {
    it('오늘 포함 액션이 전달되어야 한다', () => {
      const onIncludeToday = vi.fn()
      const tasks = [createMockTask()]
      render(
        <UncompletedTaskList
          {...defaultProps}
          tasks={tasks}
          onIncludeToday={onIncludeToday}
        />
      )
      fireEvent.click(screen.getByText('오늘 포함'))
      expect(onIncludeToday).toHaveBeenCalledWith('task-1')
    })

    it('취소 액션이 전달되어야 한다', () => {
      const onCancel = vi.fn()
      const tasks = [createMockTask()]
      render(
        <UncompletedTaskList
          {...defaultProps}
          tasks={tasks}
          onCancel={onCancel}
        />
      )
      fireEvent.click(screen.getByText('취소'))
      expect(onCancel).toHaveBeenCalledWith('task-1')
    })

    it('내일로 액션이 전달되어야 한다', () => {
      const onPostpone = vi.fn()
      const tasks = [createMockTask()]
      render(
        <UncompletedTaskList
          {...defaultProps}
          tasks={tasks}
          onPostpone={onPostpone}
        />
      )
      fireEvent.click(screen.getByText('내일로'))
      expect(onPostpone).toHaveBeenCalledWith('task-1')
    })
  })
})
