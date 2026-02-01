import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GoalList } from './GoalList'
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

describe('GoalList', () => {
  const defaultProps = {
    goals: [
      createMockGoal({ id: 'goal-1', title: '목표 1' }),
      createMockGoal({ id: 'goal-2', title: '목표 2' }),
    ],
    onUpdate: vi.fn(),
    onDelete: vi.fn(),
    onToggleActive: vi.fn(),
  }

  it('Goal 목록을 표시한다', () => {
    render(<GoalList {...defaultProps} />)

    expect(screen.getByText('목표 1')).toBeInTheDocument()
    expect(screen.getByText('목표 2')).toBeInTheDocument()
  })

  it('Goal이 없으면 빈 상태 메시지를 표시한다', () => {
    render(<GoalList {...defaultProps} goals={[]} />)

    expect(screen.getByText('등록된 목표가 없습니다')).toBeInTheDocument()
  })

  it('활성 Goal과 비활성 Goal을 다른 스타일로 구분한다', () => {
    const goals = [
      createMockGoal({ id: 'goal-1', title: '활성 목표', isActive: true }),
      createMockGoal({ id: 'goal-2', title: '비활성 목표', isActive: false }),
    ]
    render(<GoalList {...defaultProps} goals={goals} />)

    const activeGoal = screen.getByText('활성 목표').closest('li')
    const inactiveGoal = screen.getByText('비활성 목표').closest('li')

    expect(activeGoal).not.toHaveStyle({ opacity: '0.5' })
    expect(inactiveGoal).toHaveStyle({ opacity: '0.5' })
  })

  it('size prop에 따라 컴팩트/기본 크기로 렌더링한다', () => {
    const { rerender, container } = render(<GoalList {...defaultProps} />)

    const defaultList = container.querySelector('ul')
    expect(defaultList).toHaveAttribute('data-size', 'default')

    rerender(<GoalList {...defaultProps} size="compact" />)
    const compactList = container.querySelector('ul')
    expect(compactList).toHaveAttribute('data-size', 'compact')
  })
})
