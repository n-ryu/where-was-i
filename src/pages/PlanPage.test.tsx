import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PlanPage } from './PlanPage'
import { db } from '../db/database'
import * as taskRepository from '../db/taskRepository'

// useNavigate mock
const mockNavigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}))

function getTodayString(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

function getYesterdayString(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

describe('PlanPage', () => {
  beforeEach(async () => {
    await db.tasks.clear()
    mockNavigate.mockClear()
  })

  afterEach(async () => {
    await db.tasks.clear()
  })

  describe('엔트리 단계', () => {
    it('인사 메시지와 시작하기 버튼이 표시되어야 한다', async () => {
      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('시작하기')).toBeInTheDocument()
      })
      expect(
        screen.getByText('오늘 하루도 화이팅! 계획을 세워볼까요?')
      ).toBeInTheDocument()
    })

    it('시작하기 버튼 클릭 시 다음 단계로 이동해야 한다', async () => {
      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('시작하기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('시작하기'))

      await waitFor(() => {
        expect(screen.getByText('오늘의 계획')).toBeInTheDocument()
      })
    })
  })

  describe('StepIndicator', () => {
    it('시작 후 2단계 진행 표시기가 표시되어야 한다', async () => {
      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('시작하기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('시작하기'))

      await waitFor(() => {
        expect(screen.getByText('미완료 선택')).toBeInTheDocument()
        expect(screen.getByText('과업 추가')).toBeInTheDocument()
      })
    })
  })

  describe('Step 1: 미완료 과업 선택', () => {
    it('어제 이전의 미완료 과업이 표시되어야 한다', async () => {
      const yesterday = getYesterdayString()
      await taskRepository.createTask({ title: '어제 과업', date: yesterday })

      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('시작하기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('시작하기'))

      await waitFor(() => {
        expect(screen.getByText('어제 과업')).toBeInTheDocument()
      })
    })

    it('미완료 과업이 없으면 자동으로 Step 2로 이동해야 한다', async () => {
      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('시작하기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('시작하기'))

      await waitFor(() => {
        expect(screen.getByText('오늘 과업 추가')).toBeInTheDocument()
      })
    })

    it('과업 클릭 시 선택 상태가 토글되어야 한다', async () => {
      const yesterday = getYesterdayString()
      await taskRepository.createTask({ title: '어제 과업', date: yesterday })

      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('시작하기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('시작하기'))

      await waitFor(() => {
        expect(screen.getByText('어제 과업')).toBeInTheDocument()
      })

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      fireEvent.click(checkbox)
      expect(checkbox).toHaveAttribute('aria-checked', 'true')

      fireEvent.click(checkbox)
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })

    it('진행하기 클릭 시 선택된 과업이 오늘로 이동해야 한다', async () => {
      const yesterday = getYesterdayString()
      const task = await taskRepository.createTask({
        title: '어제 과업',
        date: yesterday,
      })

      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('시작하기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('시작하기'))

      await waitFor(() => {
        expect(screen.getByText('어제 과업')).toBeInTheDocument()
      })

      // 과업 선택
      fireEvent.click(screen.getByRole('checkbox'))

      // 진행하기 클릭
      fireEvent.click(screen.getByText('진행하기'))

      await waitFor(async () => {
        const updatedTask = await taskRepository.getTask(task.id)
        expect(updatedTask?.date).toBe(getTodayString())
      })
    })
  })

  describe('Step 2: 오늘 과업 추가', () => {
    it('과업 입력 인풋이 표시되어야 한다', async () => {
      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('시작하기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('시작하기'))

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('새 과업을 입력하세요')
        ).toBeInTheDocument()
      })
    })

    it('새 과업을 추가할 수 있어야 한다', async () => {
      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('시작하기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('시작하기'))

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('새 과업을 입력하세요')
        ).toBeInTheDocument()
      })

      fireEvent.change(screen.getByPlaceholderText('새 과업을 입력하세요'), {
        target: { value: '새 과업' },
      })
      fireEvent.click(screen.getByRole('button', { name: '추가' }))

      await waitFor(() => {
        expect(screen.getByText('새 과업')).toBeInTheDocument()
      })
    })

    it('완료 버튼 클릭 시 메인 화면으로 이동해야 한다', async () => {
      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('시작하기')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('시작하기'))

      await waitFor(() => {
        expect(screen.getByText('완료')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('완료'))

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })
})
