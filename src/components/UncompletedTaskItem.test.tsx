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
    isSelected: false,
    onToggle: vi.fn(),
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

  describe('선택 상태', () => {
    it('선택되지 않은 상태로 렌더링된다', () => {
      render(<UncompletedTaskItem {...defaultProps} isSelected={false} />)
      const item = screen.getByRole('checkbox')
      expect(item).toHaveAttribute('aria-checked', 'false')
    })

    it('선택된 상태로 렌더링된다', () => {
      render(<UncompletedTaskItem {...defaultProps} isSelected={true} />)
      const item = screen.getByRole('checkbox')
      expect(item).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('토글 동작', () => {
    it('클릭 시 onToggle이 호출된다', () => {
      const onToggle = vi.fn()
      render(<UncompletedTaskItem {...defaultProps} onToggle={onToggle} />)
      fireEvent.click(screen.getByRole('checkbox'))
      expect(onToggle).toHaveBeenCalledWith('task-1')
    })

    it('Enter 키 입력 시 onToggle이 호출된다', () => {
      const onToggle = vi.fn()
      render(<UncompletedTaskItem {...defaultProps} onToggle={onToggle} />)
      fireEvent.keyDown(screen.getByRole('checkbox'), { key: 'Enter' })
      expect(onToggle).toHaveBeenCalledWith('task-1')
    })

    it('Space 키 입력 시 onToggle이 호출된다', () => {
      const onToggle = vi.fn()
      render(<UncompletedTaskItem {...defaultProps} onToggle={onToggle} />)
      fireEvent.keyDown(screen.getByRole('checkbox'), { key: ' ' })
      expect(onToggle).toHaveBeenCalledWith('task-1')
    })
  })

  describe('접근성', () => {
    it('aria-label이 선택 상태를 포함해야 한다', () => {
      render(<UncompletedTaskItem {...defaultProps} isSelected={false} />)
      expect(
        screen.getByLabelText('미완료 과업 - 선택되지 않음')
      ).toBeInTheDocument()
    })

    it('선택 시 aria-label이 업데이트되어야 한다', () => {
      render(<UncompletedTaskItem {...defaultProps} isSelected={true} />)
      expect(screen.getByLabelText('미완료 과업 - 선택됨')).toBeInTheDocument()
    })
  })
})
