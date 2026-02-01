import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { HomePage } from './HomePage'
import { db } from '../db/database'
import * as taskRepository from '../db/taskRepository'

function getTodayString(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

describe('HomePage', () => {
  beforeEach(async () => {
    await db.tasks.clear()
  })

  afterEach(async () => {
    await db.tasks.clear()
  })

  describe('화면 구조', () => {
    it('상단에 새 과업 입력 폼이 표시되어야 한다', async () => {
      render(<HomePage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('새 과업 입력')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '추가' })).toBeInTheDocument()
      })
    })

    it('오늘 날짜의 과업 목록이 표시되어야 한다', async () => {
      const today = getTodayString()
      await taskRepository.createTask({ title: '오늘 과업', date: today })
      await taskRepository.createTask({
        title: '다른 날 과업',
        date: '2020-01-01',
      })

      render(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('오늘 과업')).toBeInTheDocument()
      })
      expect(screen.queryByText('다른 날 과업')).not.toBeInTheDocument()
    })

    it('과업이 없을 때 빈 상태 메시지가 표시되어야 한다', async () => {
      render(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('등록된 과업이 없습니다')).toBeInTheDocument()
      })
    })
  })

  describe('과업 생성', () => {
    it('새 과업을 입력하고 추가하면 오늘 날짜로 과업이 생성되어야 한다', async () => {
      render(<HomePage />)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('새 과업 입력')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('새 과업 입력')
      const button = screen.getByRole('button', { name: '추가' })

      fireEvent.change(input, { target: { value: '새로운 과업' } })
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('새로운 과업')).toBeInTheDocument()
      })

      // DB에서 확인
      const today = getTodayString()
      const tasks = await taskRepository.getTasksByDate(today)
      expect(tasks).toHaveLength(1)
      expect(tasks[0].title).toBe('새로운 과업')
      expect(tasks[0].date).toBe(today)
    })
  })

  describe('과업 상태 변경', () => {
    it('대기중 과업을 클릭하면 진행중으로 전환되어야 한다', async () => {
      const today = getTodayString()
      await taskRepository.createTask({ title: '대기중 과업', date: today })

      render(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('대기중 과업')).toBeInTheDocument()
      })

      // 대기중 과업 클릭
      fireEvent.click(screen.getByText('대기중 과업'))

      await waitFor(() => {
        const inProgressSection = screen.getByTestId('in-progress-section')
        expect(
          within(inProgressSection).getByText('대기중 과업')
        ).toBeInTheDocument()
      })
    })

    it('진행중 과업의 체크박스를 클릭하면 완료 처리되어야 한다', async () => {
      const today = getTodayString()
      const task = await taskRepository.createTask({
        title: '진행중 과업',
        date: today,
      })
      await taskRepository.updateTask(task.id, { status: 'in_progress' })
      await taskRepository.addTaskEvent(task.id, 'started')

      render(<HomePage />)

      await waitFor(() => {
        expect(screen.getByTestId('in-progress-section')).toBeInTheDocument()
      })

      // 진행중 섹션에서 체크박스 클릭
      const inProgressSection = screen.getByTestId('in-progress-section')
      const checkbox = within(inProgressSection).getByRole('checkbox')
      fireEvent.click(checkbox)

      await waitFor(() => {
        const completedSection = screen.getByTestId('completed-section')
        expect(
          within(completedSection).getByText('진행중 과업')
        ).toBeInTheDocument()
      })
    })

    it('과업 전환 시 기존 진행중 과업이 일시정지되어야 한다', async () => {
      const today = getTodayString()
      const task1 = await taskRepository.createTask({
        title: '기존 진행중',
        date: today,
      })
      await taskRepository.updateTask(task1.id, { status: 'in_progress' })
      await taskRepository.addTaskEvent(task1.id, 'started')

      await taskRepository.createTask({ title: '대기중 과업', date: today })

      render(<HomePage />)

      await waitFor(() => {
        expect(screen.getByTestId('in-progress-section')).toBeInTheDocument()
      })

      // 대기중 과업 클릭하여 진행중으로 전환
      const pendingSection = screen.getByTestId('pending-section')
      fireEvent.click(within(pendingSection).getByText('대기중 과업'))

      await waitFor(() => {
        // 새 과업이 진행중
        const inProgressSection = screen.getByTestId('in-progress-section')
        expect(
          within(inProgressSection).getByText('대기중 과업')
        ).toBeInTheDocument()
        // 기존 과업은 대기중으로 이동
        const newPendingSection = screen.getByTestId('pending-section')
        expect(
          within(newPendingSection).getByText('기존 진행중')
        ).toBeInTheDocument()
      })

      // DB에서 paused 이벤트 확인
      const updatedTask1 = await taskRepository.getTask(task1.id)
      const lastEvent = updatedTask1!.events[updatedTask1!.events.length - 1]
      expect(lastEvent.eventType).toBe('paused')
    })
  })

  describe('과업 수정/삭제', () => {
    it('과업 제목을 수정할 수 있어야 한다', async () => {
      const today = getTodayString()
      await taskRepository.createTask({ title: '원래 제목', date: today })

      render(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('원래 제목')).toBeInTheDocument()
      })

      // 편집 버튼 클릭
      const pendingSection = screen.getByTestId('pending-section')
      fireEvent.click(
        within(pendingSection).getByRole('button', { name: '편집' })
      )

      // 제목 수정 (TaskListItem 내부)
      const input = within(pendingSection).getByDisplayValue('원래 제목')
      fireEvent.change(input, { target: { value: '수정된 제목' } })

      // 저장
      fireEvent.click(
        within(pendingSection).getByRole('button', { name: '저장' })
      )

      await waitFor(() => {
        expect(screen.getByText('수정된 제목')).toBeInTheDocument()
      })
    })

    it('과업을 삭제할 수 있어야 한다', async () => {
      const today = getTodayString()
      await taskRepository.createTask({ title: '삭제할 과업', date: today })

      render(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('삭제할 과업')).toBeInTheDocument()
      })

      // 삭제 버튼 클릭
      fireEvent.click(screen.getByRole('button', { name: '삭제' }))

      // 확인 버튼 클릭
      fireEvent.click(screen.getByRole('button', { name: '확인' }))

      await waitFor(() => {
        expect(screen.queryByText('삭제할 과업')).not.toBeInTheDocument()
        expect(screen.getByText('등록된 과업이 없습니다')).toBeInTheDocument()
      })
    })
  })
})
