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

function getTomorrowString(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
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

  describe('StepIndicator', () => {
    it('3단계 진행 표시기가 표시되어야 한다', async () => {
      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('미완료 처리')).toBeInTheDocument()
        expect(screen.getByText('과업 생성')).toBeInTheDocument()
        expect(screen.getByText('계획 확정')).toBeInTheDocument()
      })
    })
  })

  describe('Step 1: 미완료 과업 처리', () => {
    it('어제 이전의 미완료 과업이 표시되어야 한다', async () => {
      const yesterday = getYesterdayString()
      await taskRepository.createTask({ title: '어제 과업', date: yesterday })

      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('어제 과업')).toBeInTheDocument()
      })
    })

    it('미완료 과업이 없으면 자동으로 Step 2로 이동해야 한다', async () => {
      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('새 과업 입력')).toBeInTheDocument()
      })
    })

    it('"오늘 포함" 클릭 시 과업 날짜가 오늘로 변경되어야 한다', async () => {
      const yesterday = getYesterdayString()
      const task = await taskRepository.createTask({
        title: '어제 과업',
        date: yesterday,
      })

      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('어제 과업')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('오늘 포함'))

      await waitFor(async () => {
        const updatedTask = await taskRepository.getTask(task.id)
        expect(updatedTask?.date).toBe(getTodayString())
      })
    })

    it('"취소" 클릭 시 과업이 cancelled 상태가 되어야 한다', async () => {
      const yesterday = getYesterdayString()
      const task = await taskRepository.createTask({
        title: '취소할 과업',
        date: yesterday,
      })

      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('취소할 과업')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('취소'))

      await waitFor(async () => {
        const updatedTask = await taskRepository.getTask(task.id)
        expect(updatedTask?.status).toBe('cancelled')
      })
    })

    it('"내일로" 클릭 시 과업 날짜가 내일로 변경되어야 한다', async () => {
      const yesterday = getYesterdayString()
      const task = await taskRepository.createTask({
        title: '미룰 과업',
        date: yesterday,
      })

      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('미룰 과업')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('내일로'))

      await waitFor(async () => {
        const updatedTask = await taskRepository.getTask(task.id)
        expect(updatedTask?.date).toBe(getTomorrowString())
      })
    })

    it('모든 미완료 과업 처리 후 Step 2로 이동해야 한다', async () => {
      const yesterday = getYesterdayString()
      await taskRepository.createTask({ title: '유일한 과업', date: yesterday })

      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByText('유일한 과업')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('취소'))

      await waitFor(() => {
        expect(screen.getByPlaceholderText('새 과업 입력')).toBeInTheDocument()
      })
    })
  })

  describe('Step 2: 오늘 과업 생성', () => {
    it('과업 생성 폼이 표시되어야 한다', async () => {
      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('새 과업 입력')).toBeInTheDocument()
      })
    })

    it('새 과업을 추가할 수 있어야 한다', async () => {
      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('새 과업 입력')).toBeInTheDocument()
      })

      fireEvent.change(screen.getByPlaceholderText('새 과업 입력'), {
        target: { value: '새 과업' },
      })
      fireEvent.click(screen.getByRole('button', { name: '추가' }))

      await waitFor(() => {
        expect(screen.getByText('새 과업')).toBeInTheDocument()
      })
    })

    it('"다음" 버튼 클릭 시 Step 3으로 이동해야 한다', async () => {
      render(<PlanPage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('새 과업 입력')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('다음'))

      await waitFor(() => {
        expect(screen.getByText('확정')).toBeInTheDocument()
      })
    })
  })

  describe('Step 3: 계획 확정', () => {
    it('오늘 과업 목록이 표시되어야 한다', async () => {
      const today = getTodayString()
      await taskRepository.createTask({ title: '오늘 과업', date: today })

      render(<PlanPage />)

      // Step 2로 이동
      await waitFor(() => {
        expect(screen.getByPlaceholderText('새 과업 입력')).toBeInTheDocument()
      })

      // Step 3로 이동
      fireEvent.click(screen.getByText('다음'))

      await waitFor(() => {
        expect(screen.getByText('오늘 과업')).toBeInTheDocument()
      })
    })

    it('"확정" 버튼 클릭 시 메인 화면으로 이동해야 한다', async () => {
      render(<PlanPage />)

      // Step 2로 이동
      await waitFor(() => {
        expect(screen.getByPlaceholderText('새 과업 입력')).toBeInTheDocument()
      })

      // Step 3로 이동
      fireEvent.click(screen.getByText('다음'))

      await waitFor(() => {
        expect(screen.getByText('확정')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('확정'))

      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
    })
  })
})
