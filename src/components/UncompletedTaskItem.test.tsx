import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { UncompletedTaskItem } from './UncompletedTaskItem'
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

describe('UncompletedTaskItem', () => {
  const defaultProps = {
    task: createMockTask(),
    onIncludeToday: vi.fn(),
    onCancel: vi.fn(),
    onPostpone: vi.fn(),
  }

  describe('기본 렌더링', () => {
    it('과업 제목이 표시되어야 한다', () => {
      render(<UncompletedTaskItem {...defaultProps} />)
      expect(screen.getByText('미완료 과업')).toBeInTheDocument()
    })

    it('과업 날짜가 표시되어야 한다', () => {
      render(<UncompletedTaskItem {...defaultProps} />)
      expect(screen.getByText('2024-01-01')).toBeInTheDocument()
    })
  })

  describe('액션 버튼', () => {
    it('"오늘 포함" 버튼 클릭 시 onIncludeToday 호출', () => {
      const onIncludeToday = vi.fn()
      render(
        <UncompletedTaskItem
          {...defaultProps}
          onIncludeToday={onIncludeToday}
        />
      )
      fireEvent.click(screen.getByText('오늘 포함'))
      expect(onIncludeToday).toHaveBeenCalledWith('task-1')
    })

    it('"취소" 버튼 클릭 시 onCancel 호출', () => {
      const onCancel = vi.fn()
      render(<UncompletedTaskItem {...defaultProps} onCancel={onCancel} />)
      fireEvent.click(screen.getByText('취소'))
      expect(onCancel).toHaveBeenCalledWith('task-1')
    })

    it('"내일로" 버튼 클릭 시 onPostpone 호출', () => {
      const onPostpone = vi.fn()
      render(<UncompletedTaskItem {...defaultProps} onPostpone={onPostpone} />)
      fireEvent.click(screen.getByText('내일로'))
      expect(onPostpone).toHaveBeenCalledWith('task-1')
    })
  })
})
