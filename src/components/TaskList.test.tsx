import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TaskList } from './TaskList'
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

describe('TaskList', () => {
  const defaultProps = {
    tasks: [
      createMockTask({ id: 'task-1', title: '과업 1' }),
      createMockTask({ id: 'task-2', title: '과업 2' }),
    ],
    goals: [createMockGoal()],
    onBatchStatusChange: vi.fn(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
  }

  describe('기본 렌더링', () => {
    it('Task 목록을 표시한다', () => {
      render(<TaskList {...defaultProps} />)
      expect(screen.getByText('과업 1')).toBeInTheDocument()
      expect(screen.getByText('과업 2')).toBeInTheDocument()
    })

    it('Task가 없으면 빈 상태 메시지를 표시한다', () => {
      render(<TaskList {...defaultProps} tasks={[]} />)
      expect(screen.getByText('등록된 과업이 없습니다')).toBeInTheDocument()
    })
  })

  describe('정렬', () => {
    it('진행중 Task를 별도 영역에 강조하여 표시한다', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          title: '진행중 과업',
          status: 'in_progress',
        }),
        createMockTask({
          id: 'task-2',
          title: '대기중 과업',
          status: 'pending',
        }),
      ]
      render(<TaskList {...defaultProps} tasks={tasks} />)
      const inProgressSection = screen.getByTestId('in-progress-section')
      expect(
        within(inProgressSection).getByText('진행중 과업')
      ).toBeInTheDocument()
    })

    it('대기중 Task를 진행중 Task 아래에 표시한다', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          title: '진행중 과업',
          status: 'in_progress',
        }),
        createMockTask({
          id: 'task-2',
          title: '대기중 과업',
          status: 'pending',
        }),
      ]
      render(<TaskList {...defaultProps} tasks={tasks} />)
      const pendingSection = screen.getByTestId('pending-section')
      expect(
        within(pendingSection).getByText('대기중 과업')
      ).toBeInTheDocument()
    })

    it('완료된 Task를 대기중 Task 아래에 표시한다', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          title: '대기중 과업',
          status: 'pending',
        }),
        createMockTask({
          id: 'task-2',
          title: '완료된 과업',
          status: 'completed',
        }),
      ]
      render(<TaskList {...defaultProps} tasks={tasks} />)
      const completedSection = screen.getByTestId('completed-section')
      expect(
        within(completedSection).getByText('완료된 과업')
      ).toBeInTheDocument()
    })

    it('완료된 Task는 완료 시간 기준으로 정렬한다', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          title: '나중에 완료',
          status: 'completed',
          events: [
            {
              eventType: 'completed',
              timestamp: new Date('2024-01-01T12:00:00'),
            },
          ],
        }),
        createMockTask({
          id: 'task-2',
          title: '먼저 완료',
          status: 'completed',
          events: [
            {
              eventType: 'completed',
              timestamp: new Date('2024-01-01T10:00:00'),
            },
          ],
        }),
      ]
      render(<TaskList {...defaultProps} tasks={tasks} />)
      const completedSection = screen.getByTestId('completed-section')
      const items = within(completedSection).getAllByRole('listitem')
      expect(items[0]).toHaveTextContent('나중에 완료')
      expect(items[1]).toHaveTextContent('먼저 완료')
    })
  })

  describe('상태 전환', () => {
    it('대기중 Task가 진행중으로 전환되면 기존 진행중 Task는 대기중으로 변경된다', () => {
      const onBatchStatusChange = vi.fn()
      const tasks = [
        createMockTask({
          id: 'task-1',
          title: '진행중 과업',
          status: 'in_progress',
        }),
        createMockTask({
          id: 'task-2',
          title: '대기중 과업',
          status: 'pending',
        }),
      ]
      render(
        <TaskList
          {...defaultProps}
          tasks={tasks}
          onBatchStatusChange={onBatchStatusChange}
        />
      )

      const pendingSection = screen.getByTestId('pending-section')
      const pendingTask = within(pendingSection).getByText('대기중 과업')
      fireEvent.click(pendingTask)

      // 배치로 상태 변경이 호출되어야 함
      expect(onBatchStatusChange).toHaveBeenCalledWith([
        { id: 'task-2', status: 'in_progress', eventType: 'started' },
        { id: 'task-1', status: 'pending', eventType: 'paused' },
      ])
    })
  })

  describe('스타일', () => {
    it('진행중 Task와 다른 상태의 Task를 시각적으로 구분한다', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          title: '진행중 과업',
          status: 'in_progress',
        }),
        createMockTask({
          id: 'task-2',
          title: '대기중 과업',
          status: 'pending',
        }),
      ]
      render(<TaskList {...defaultProps} tasks={tasks} />)
      const inProgressSection = screen.getByTestId('in-progress-section')
      expect(inProgressSection).toHaveAttribute('data-highlighted', 'true')
    })
  })
})
