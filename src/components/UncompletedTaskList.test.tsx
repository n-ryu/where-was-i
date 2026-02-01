import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { UncompletedTaskList } from './UncompletedTaskList'
import type { Task } from '../types'

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

describe('UncompletedTaskList', () => {
  const defaultProps = {
    tasks: [],
    selectedIds: new Set<string>(),
    onToggle: vi.fn(),
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

    it('안내 문구가 표시되어야 한다', () => {
      const tasks = [createMockTask()]
      render(<UncompletedTaskList {...defaultProps} tasks={tasks} />)
      expect(
        screen.getByText('오늘 이어서 진행할 과업을 선택하세요')
      ).toBeInTheDocument()
    })
  })

  describe('선택 상태', () => {
    it('선택된 과업이 표시되어야 한다', () => {
      const tasks = [
        createMockTask({ id: 'task-1', title: '과업 1' }),
        createMockTask({ id: 'task-2', title: '과업 2' }),
      ]
      const selectedIds = new Set(['task-1'])
      render(
        <UncompletedTaskList
          {...defaultProps}
          tasks={tasks}
          selectedIds={selectedIds}
        />
      )
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).toHaveAttribute('aria-checked', 'true')
      expect(checkboxes[1]).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('토글 동작', () => {
    it('과업 클릭 시 onToggle이 호출되어야 한다', () => {
      const onToggle = vi.fn()
      const tasks = [createMockTask({ id: 'task-1', title: '과업 1' })]
      render(
        <UncompletedTaskList
          {...defaultProps}
          tasks={tasks}
          onToggle={onToggle}
        />
      )
      fireEvent.click(screen.getByRole('checkbox'))
      expect(onToggle).toHaveBeenCalledWith('task-1')
    })
  })
})
