import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GoalsPage } from './GoalsPage'
import { db } from '../db/database'

// DB 초기화
beforeEach(async () => {
  await db.goals.clear()
})

describe('GoalsPage', () => {
  it('페이지 제목을 표시한다', () => {
    render(<GoalsPage />)

    expect(
      screen.getByRole('heading', { name: 'Goal 관리' })
    ).toBeInTheDocument()
  })

  it('Goal 목록을 표시한다', async () => {
    await db.goals.add({
      id: 'goal-1',
      title: '기존 목표',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    render(<GoalsPage />)

    await waitFor(() => {
      expect(screen.getByText('기존 목표')).toBeInTheDocument()
    })
  })

  describe('새 Goal 추가', () => {
    it('입력 필드에 제목을 입력할 수 있다', async () => {
      const user = userEvent.setup()
      render(<GoalsPage />)

      const input = screen.getByPlaceholderText('새 목표 입력')
      await user.type(input, '새 목표')

      expect(input).toHaveValue('새 목표')
    })

    it('엔터 키로 새 Goal을 추가할 수 있다', async () => {
      const user = userEvent.setup()
      render(<GoalsPage />)

      const input = screen.getByPlaceholderText('새 목표 입력')
      await user.type(input, '새 목표{enter}')

      await waitFor(() => {
        expect(screen.getByText('새 목표')).toBeInTheDocument()
      })
      expect(input).toHaveValue('')
    })

    it('추가 버튼으로 새 Goal을 추가할 수 있다', async () => {
      const user = userEvent.setup()
      render(<GoalsPage />)

      const input = screen.getByPlaceholderText('새 목표 입력')
      await user.type(input, '버튼으로 추가')
      await user.click(screen.getByRole('button', { name: '추가' }))

      await waitFor(() => {
        expect(screen.getByText('버튼으로 추가')).toBeInTheDocument()
      })
      expect(input).toHaveValue('')
    })

    it('빈 제목으로는 Goal을 추가할 수 없다', async () => {
      const user = userEvent.setup()
      // 목록 조회 함수를 spy
      const getAllGoalsSpy = vi.spyOn(db.goals, 'toArray')

      render(<GoalsPage />)

      await user.click(screen.getByRole('button', { name: '추가' }))

      // 빈 제목이면 추가되지 않음 (초기 렌더링 이후 추가 호출 없음)
      const callCountAfterClick = getAllGoalsSpy.mock.calls.length

      await user.click(screen.getByRole('button', { name: '추가' }))

      // 두 번째 클릭에도 DB 조회가 추가로 일어나지 않음 (Goal이 추가되지 않음)
      expect(getAllGoalsSpy.mock.calls.length).toBe(callCountAfterClick)

      getAllGoalsSpy.mockRestore()
    })
  })
})
