import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TaskForm } from './TaskForm'
import type { Goal } from '../types'

const createMockGoal = (overrides?: Partial<Goal>): Goal => ({
  id: 'goal-1',
  title: '테스트 목표',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

describe('TaskForm', () => {
  const defaultProps = {
    goals: [createMockGoal()],
    onCreate: vi.fn(),
  }

  describe('기본 렌더링', () => {
    it('제목 입력 필드를 표시한다', () => {
      render(<TaskForm {...defaultProps} />)
      expect(screen.getByPlaceholderText('새 과업 입력')).toBeInTheDocument()
    })

    it('Goal 선택 드롭다운을 표시한다', () => {
      render(<TaskForm {...defaultProps} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('생성 버튼을 표시한다', () => {
      render(<TaskForm {...defaultProps} />)
      expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument()
    })
  })

  describe('Goal 선택', () => {
    it('활성 Goal 목록을 드롭다운에 표시한다', () => {
      const goals = [
        createMockGoal({ id: 'goal-1', title: '목표 1', isActive: true }),
        createMockGoal({ id: 'goal-2', title: '목표 2', isActive: true }),
      ]
      render(<TaskForm {...defaultProps} goals={goals} />)
      const select = screen.getByRole('combobox')
      expect(select).toContainHTML('목표 1')
      expect(select).toContainHTML('목표 2')
    })

    it('Goal 없음 옵션을 제공한다', () => {
      render(<TaskForm {...defaultProps} />)
      const select = screen.getByRole('combobox')
      expect(select).toContainHTML('목표 없음')
    })

    it('Goal을 선택하면 선택된 Goal이 표시된다', () => {
      const goals = [createMockGoal({ id: 'goal-1', title: '선택할 목표' })]
      render(<TaskForm {...defaultProps} goals={goals} />)
      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'goal-1' } })
      expect(select).toHaveValue('goal-1')
    })
  })

  describe('Task 생성', () => {
    it('제목 입력 후 생성 버튼 클릭 시 onCreate를 호출한다', () => {
      const onCreate = vi.fn()
      render(<TaskForm {...defaultProps} onCreate={onCreate} />)
      const input = screen.getByPlaceholderText('새 과업 입력')
      fireEvent.change(input, { target: { value: '새로운 과업' } })
      fireEvent.click(screen.getByRole('button', { name: '추가' }))
      expect(onCreate).toHaveBeenCalledWith({
        title: '새로운 과업',
        goalId: undefined,
      })
    })

    it('Goal이 선택된 상태에서 생성 시 goalId를 포함한다', () => {
      const onCreate = vi.fn()
      const goals = [createMockGoal({ id: 'goal-1', title: '목표' })]
      render(<TaskForm {...defaultProps} goals={goals} onCreate={onCreate} />)
      const input = screen.getByPlaceholderText('새 과업 입력')
      const select = screen.getByRole('combobox')
      fireEvent.change(input, { target: { value: '새로운 과업' } })
      fireEvent.change(select, { target: { value: 'goal-1' } })
      fireEvent.click(screen.getByRole('button', { name: '추가' }))
      expect(onCreate).toHaveBeenCalledWith({
        title: '새로운 과업',
        goalId: 'goal-1',
      })
    })

    it('생성 후 입력 필드를 초기화한다', () => {
      render(<TaskForm {...defaultProps} />)
      const input = screen.getByPlaceholderText('새 과업 입력')
      fireEvent.change(input, { target: { value: '새로운 과업' } })
      fireEvent.click(screen.getByRole('button', { name: '추가' }))
      expect(input).toHaveValue('')
    })

    it('제목이 비어있으면 생성 버튼이 비활성화된다', () => {
      render(<TaskForm {...defaultProps} />)
      const button = screen.getByRole('button', { name: '추가' })
      expect(button).toBeDisabled()
    })
  })

  describe('Enter 키 지원', () => {
    it('Enter 키 입력 시 Task를 생성한다', () => {
      const onCreate = vi.fn()
      render(<TaskForm {...defaultProps} onCreate={onCreate} />)
      const input = screen.getByPlaceholderText('새 과업 입력')
      fireEvent.change(input, { target: { value: '새로운 과업' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
      expect(onCreate).toHaveBeenCalledWith({
        title: '새로운 과업',
        goalId: undefined,
      })
    })
  })
})
