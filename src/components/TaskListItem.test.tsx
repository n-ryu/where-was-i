import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TaskListItem } from './TaskListItem'
import type { Task, Goal } from '../types'

const createMockTask = (overrides?: Partial<Task>): Task => ({
  id: 'task-1',
  title: '테스트 과업',
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

describe('TaskListItem', () => {
  const defaultProps = {
    task: createMockTask(),
    goals: [createMockGoal()],
    onStatusChange: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
  }

  describe('기본 렌더링', () => {
    it('Task 제목을 표시한다', () => {
      render(<TaskListItem {...defaultProps} />)
      expect(screen.getByText('테스트 과업')).toBeInTheDocument()
    })

    it('연결된 Goal 이름을 표시한다', () => {
      const task = createMockTask({ goalId: 'goal-1' })
      const goals = [createMockGoal({ id: 'goal-1', title: '연결된 목표' })]
      render(<TaskListItem {...defaultProps} task={task} goals={goals} />)
      expect(screen.getByText('연결된 목표')).toBeInTheDocument()
    })
  })

  describe('상태 표시', () => {
    it('진행중 Task는 강조 스타일로 표시한다', () => {
      const task = createMockTask({ status: 'in_progress' })
      render(<TaskListItem {...defaultProps} task={task} />)
      const listItem = screen.getByRole('listitem')
      expect(listItem).toHaveAttribute('data-status', 'in_progress')
    })

    it('완료된 Task는 체크박스가 체크되고 흐린 스타일로 표시한다', () => {
      const task = createMockTask({ status: 'completed' })
      render(<TaskListItem {...defaultProps} task={task} />)
      const checkbox = screen.getByRole('checkbox')
      const listItem = screen.getByRole('listitem')
      expect(checkbox).toBeChecked()
      expect(listItem).toHaveStyle({ opacity: '0.5' })
    })

    it('대기중 Task는 체크박스가 해제된 상태로 표시한다', () => {
      const task = createMockTask({ status: 'pending' })
      render(<TaskListItem {...defaultProps} task={task} />)
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })
  })

  describe('상태 변경', () => {
    it('대기중 Task 클릭 시 진행중으로 변경하고 started 이벤트를 기록한다', () => {
      const onStatusChange = vi.fn()
      const task = createMockTask({ status: 'pending' })
      render(
        <TaskListItem
          {...defaultProps}
          task={task}
          onStatusChange={onStatusChange}
        />
      )
      const title = screen.getByText('테스트 과업')
      fireEvent.click(title)
      expect(onStatusChange).toHaveBeenCalledWith(
        'task-1',
        'in_progress',
        'started'
      )
    })

    it('대기중 Task 체크박스 클릭 시 즉시 완료로 변경하고 completed 이벤트를 기록한다', () => {
      const onStatusChange = vi.fn()
      const task = createMockTask({ status: 'pending' })
      render(
        <TaskListItem
          {...defaultProps}
          task={task}
          onStatusChange={onStatusChange}
        />
      )
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      expect(onStatusChange).toHaveBeenCalledWith(
        'task-1',
        'completed',
        'completed'
      )
    })

    it('진행중 Task 체크박스 클릭 시 완료로 변경하고 completed 이벤트를 기록한다', () => {
      const onStatusChange = vi.fn()
      const task = createMockTask({ status: 'in_progress' })
      render(
        <TaskListItem
          {...defaultProps}
          task={task}
          onStatusChange={onStatusChange}
        />
      )
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      expect(onStatusChange).toHaveBeenCalledWith(
        'task-1',
        'completed',
        'completed'
      )
    })

    it('완료된 Task 체크박스 해제 시 대기중으로 변경하고 paused 이벤트를 기록한다', () => {
      const onStatusChange = vi.fn()
      const task = createMockTask({ status: 'completed' })
      render(
        <TaskListItem
          {...defaultProps}
          task={task}
          onStatusChange={onStatusChange}
        />
      )
      const checkbox = screen.getByRole('checkbox')
      fireEvent.click(checkbox)
      expect(onStatusChange).toHaveBeenCalledWith('task-1', 'pending', 'paused')
    })
  })

  describe('편집', () => {
    it('편집 버튼 클릭 시 편집 모드로 전환한다', () => {
      render(<TaskListItem {...defaultProps} />)
      fireEvent.click(screen.getByText('편집'))
      expect(screen.getByDisplayValue('테스트 과업')).toBeInTheDocument()
    })

    it('편집 모드에서 제목을 수정할 수 있다', () => {
      render(<TaskListItem {...defaultProps} />)
      fireEvent.click(screen.getByText('편집'))
      const input = screen.getByDisplayValue('테스트 과업')
      fireEvent.change(input, { target: { value: '수정된 과업' } })
      expect(screen.getByDisplayValue('수정된 과업')).toBeInTheDocument()
    })

    it('편집 모드에서 Goal을 변경할 수 있다', () => {
      const goals = [
        createMockGoal({ id: 'goal-1', title: '목표 1' }),
        createMockGoal({ id: 'goal-2', title: '목표 2' }),
      ]
      render(<TaskListItem {...defaultProps} goals={goals} />)
      fireEvent.click(screen.getByText('편집'))
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'goal-2' } })
      expect(select).toHaveValue('goal-2')
    })

    it('저장 버튼 클릭 시 변경 사항을 저장하고 편집 모드를 종료한다', () => {
      const onUpdate = vi.fn()
      render(<TaskListItem {...defaultProps} onUpdate={onUpdate} />)
      fireEvent.click(screen.getByText('편집'))
      const input = screen.getByDisplayValue('테스트 과업')
      fireEvent.change(input, { target: { value: '수정된 과업' } })
      fireEvent.click(screen.getByText('저장'))
      expect(onUpdate).toHaveBeenCalledWith('task-1', {
        title: '수정된 과업',
        goalId: undefined,
      })
      expect(screen.queryByDisplayValue('수정된 과업')).not.toBeInTheDocument()
    })

    it('취소 버튼 클릭 시 변경 사항을 취소하고 편집 모드를 종료한다', () => {
      render(<TaskListItem {...defaultProps} />)
      fireEvent.click(screen.getByText('편집'))
      const input = screen.getByDisplayValue('테스트 과업')
      fireEvent.change(input, { target: { value: '수정된 과업' } })
      fireEvent.click(screen.getByText('취소'))
      expect(screen.queryByDisplayValue('수정된 과업')).not.toBeInTheDocument()
      expect(screen.getByText('테스트 과업')).toBeInTheDocument()
    })
  })

  describe('삭제', () => {
    it('삭제 버튼 클릭 시 삭제 확인 UI를 표시한다', () => {
      render(<TaskListItem {...defaultProps} />)
      fireEvent.click(screen.getByText('삭제'))
      expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument()
    })

    it('삭제 확인 시 onDelete를 호출한다', () => {
      const onDelete = vi.fn()
      render(<TaskListItem {...defaultProps} onDelete={onDelete} />)
      fireEvent.click(screen.getByText('삭제'))
      fireEvent.click(screen.getByText('확인'))
      expect(onDelete).toHaveBeenCalledWith('task-1')
    })

    it('삭제 취소 시 삭제 확인 UI를 닫는다', () => {
      render(<TaskListItem {...defaultProps} />)
      fireEvent.click(screen.getByText('삭제'))
      fireEvent.click(screen.getByText('취소'))
      expect(
        screen.queryByText('정말 삭제하시겠습니까?')
      ).not.toBeInTheDocument()
    })
  })
})
