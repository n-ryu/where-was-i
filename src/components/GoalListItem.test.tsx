import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { GoalListItem } from './GoalListItem'
import type { Goal } from '../types'

const createMockGoal = (overrides?: Partial<Goal>): Goal => ({
  id: 'goal-1',
  title: '테스트 목표',
  memo: '테스트 메모',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
})

describe('GoalListItem', () => {
  const defaultProps = {
    goal: createMockGoal(),
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onToggleActive: vi.fn(),
  }

  it('Goal 제목과 메모를 표시한다', () => {
    render(<GoalListItem {...defaultProps} />)

    expect(screen.getByText('테스트 목표')).toBeInTheDocument()
    expect(screen.getByText('테스트 메모')).toBeInTheDocument()
  })

  it('비활성 Goal은 흐리게 표시된다', () => {
    const inactiveGoal = createMockGoal({ isActive: false })
    const { container } = render(
      <GoalListItem {...defaultProps} goal={inactiveGoal} />
    )

    const listItem = container.firstChild as HTMLElement
    expect(listItem).toHaveStyle({ opacity: '0.5' })
  })

  describe('인라인 편집', () => {
    it('편집 버튼 클릭 시 편집 모드로 전환된다', async () => {
      const user = userEvent.setup()
      render(<GoalListItem {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: '편집' }))

      expect(screen.getByDisplayValue('테스트 목표')).toBeInTheDocument()
    })

    it('편집 모드에서 제목을 수정할 수 있다', async () => {
      const user = userEvent.setup()
      render(<GoalListItem {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: '편집' }))
      const titleInput = screen.getByDisplayValue('테스트 목표')
      await user.clear(titleInput)
      await user.type(titleInput, '수정된 목표')

      expect(screen.getByDisplayValue('수정된 목표')).toBeInTheDocument()
    })

    it('편집 모드에서 메모를 수정할 수 있다', async () => {
      const user = userEvent.setup()
      render(<GoalListItem {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: '편집' }))
      const memoInput = screen.getByDisplayValue('테스트 메모')
      await user.clear(memoInput)
      await user.type(memoInput, '수정된 메모')

      expect(screen.getByDisplayValue('수정된 메모')).toBeInTheDocument()
    })

    it('저장 버튼 클릭 시 변경사항이 저장된다', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      render(<GoalListItem {...defaultProps} onUpdate={onUpdate} />)

      await user.click(screen.getByRole('button', { name: '편집' }))
      const titleInput = screen.getByDisplayValue('테스트 목표')
      await user.clear(titleInput)
      await user.type(titleInput, '수정된 목표')
      await user.click(screen.getByRole('button', { name: '저장' }))

      expect(onUpdate).toHaveBeenCalledWith('goal-1', {
        title: '수정된 목표',
        memo: '테스트 메모',
      })
    })

    it('취소 버튼 클릭 시 편집이 취소된다', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      render(<GoalListItem {...defaultProps} onUpdate={onUpdate} />)

      await user.click(screen.getByRole('button', { name: '편집' }))
      const titleInput = screen.getByDisplayValue('테스트 목표')
      await user.clear(titleInput)
      await user.type(titleInput, '수정된 목표')
      await user.click(screen.getByRole('button', { name: '취소' }))

      expect(onUpdate).not.toHaveBeenCalled()
      expect(screen.getByText('테스트 목표')).toBeInTheDocument()
    })
  })

  describe('활성/비활성 토글', () => {
    it('토글 클릭 시 활성 상태가 변경된다', async () => {
      const user = userEvent.setup()
      const onToggleActive = vi.fn()
      render(<GoalListItem {...defaultProps} onToggleActive={onToggleActive} />)

      await user.click(screen.getByRole('checkbox'))

      expect(onToggleActive).toHaveBeenCalledWith('goal-1', false)
    })
  })

  describe('삭제', () => {
    it('삭제 버튼 클릭 시 삭제 확인이 표시된다', async () => {
      const user = userEvent.setup()
      render(<GoalListItem {...defaultProps} />)

      await user.click(screen.getByRole('button', { name: '삭제' }))

      expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument()
    })

    it('삭제 확인 시 Goal이 삭제된다', async () => {
      const user = userEvent.setup()
      const onDelete = vi.fn()
      render(<GoalListItem {...defaultProps} onDelete={onDelete} />)

      await user.click(screen.getByRole('button', { name: '삭제' }))
      await user.click(screen.getByRole('button', { name: '확인' }))

      expect(onDelete).toHaveBeenCalledWith('goal-1')
    })

    it('삭제 취소 시 Goal이 유지된다', async () => {
      const user = userEvent.setup()
      const onDelete = vi.fn()
      render(<GoalListItem {...defaultProps} onDelete={onDelete} />)

      await user.click(screen.getByRole('button', { name: '삭제' }))
      await user.click(screen.getByRole('button', { name: '취소' }))

      expect(onDelete).not.toHaveBeenCalled()
      expect(
        screen.queryByText('정말 삭제하시겠습니까?')
      ).not.toBeInTheDocument()
    })
  })
})
