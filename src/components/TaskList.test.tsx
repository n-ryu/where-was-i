import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TaskList } from './TaskList'
import type { Task } from '../types'

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

describe('TaskList', () => {
  const defaultProps = {
    tasks: [
      createMockTask({ id: 'task-1', title: '과업 1' }),
      createMockTask({ id: 'task-2', title: '과업 2' }),
    ],
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
    it('진행중 Task가 목록 최상단에 표시된다', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          title: '대기중 과업',
          status: 'pending',
          createdAt: new Date('2024-01-01T08:00:00'),
        }),
        createMockTask({
          id: 'task-2',
          title: '진행중 과업',
          status: 'in_progress',
          createdAt: new Date('2024-01-01T09:00:00'),
        }),
      ]
      render(<TaskList {...defaultProps} tasks={tasks} />)
      const items = screen.getAllByRole('listitem')
      expect(items[0]).toHaveTextContent('진행중 과업')
      expect(items[1]).toHaveTextContent('대기중 과업')
    })

    it('대기중 Task가 진행중 Task 다음에 표시된다', () => {
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
      const items = screen.getAllByRole('listitem')
      expect(items[0]).toHaveAttribute('data-status', 'in_progress')
      expect(items[1]).toHaveAttribute('data-status', 'pending')
    })

    it('완료된 Task가 대기중 Task 다음에 표시된다', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          title: '완료된 과업',
          status: 'completed',
        }),
        createMockTask({
          id: 'task-2',
          title: '대기중 과업',
          status: 'pending',
        }),
      ]
      render(<TaskList {...defaultProps} tasks={tasks} />)
      const items = screen.getAllByRole('listitem')
      expect(items[0]).toHaveAttribute('data-status', 'pending')
      expect(items[1]).toHaveAttribute('data-status', 'completed')
    })

    it('완료된 Task는 완료 시간 기준으로 정렬한다 (최근 완료가 위)', () => {
      const tasks = [
        createMockTask({
          id: 'task-1',
          title: '먼저 완료',
          status: 'completed',
          events: [
            {
              eventType: 'completed',
              timestamp: new Date('2024-01-01T10:00:00'),
            },
          ],
        }),
        createMockTask({
          id: 'task-2',
          title: '나중에 완료',
          status: 'completed',
          events: [
            {
              eventType: 'completed',
              timestamp: new Date('2024-01-01T12:00:00'),
            },
          ],
        }),
      ]
      render(<TaskList {...defaultProps} tasks={tasks} />)
      const items = screen.getAllByRole('listitem')
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

      const pendingTask = screen.getByText('대기중 과업')
      fireEvent.click(pendingTask)

      // 배치로 상태 변경이 호출되어야 함
      expect(onBatchStatusChange).toHaveBeenCalledWith([
        { id: 'task-2', status: 'in_progress', eventType: 'started' },
        { id: 'task-1', status: 'pending', eventType: 'paused' },
      ])
    })
  })

  describe('스타일', () => {
    it('진행중 Task는 data-status 속성으로 구분할 수 있다', () => {
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
      const items = screen.getAllByRole('listitem')
      expect(items[0]).toHaveAttribute('data-status', 'in_progress')
      expect(items[1]).toHaveAttribute('data-status', 'pending')
    })
  })
})
