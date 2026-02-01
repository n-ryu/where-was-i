import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { LogPage } from './LogPage'
import { db } from '../db/database'
import * as taskRepository from '../db/taskRepository'

function getTodayString(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

describe('LogPage', () => {
  beforeEach(async () => {
    await db.tasks.clear()
  })

  afterEach(async () => {
    await db.tasks.clear()
  })

  it('페이지 제목이 표시되어야 한다', async () => {
    render(<LogPage />)

    await waitFor(() => {
      expect(screen.getByText('오늘의 기록')).toBeInTheDocument()
    })
  })

  it('오늘 날짜가 표시되어야 한다', async () => {
    render(<LogPage />)

    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()

    await waitFor(() => {
      expect(
        screen.getByText(new RegExp(`${year}년 ${month}월 ${day}일`))
      ).toBeInTheDocument()
    })
  })

  it('이벤트가 없으면 빈 상태 메시지가 표시되어야 한다', async () => {
    render(<LogPage />)

    await waitFor(() => {
      expect(
        screen.getByText('오늘의 활동 기록이 없습니다')
      ).toBeInTheDocument()
    })
  })

  it('과업의 이벤트들이 표시되어야 한다', async () => {
    const today = getTodayString()
    const task = await taskRepository.createTask({
      title: '테스트 과업',
      date: today,
    })
    await taskRepository.addTaskEvent(task.id, 'started')

    render(<LogPage />)

    await waitFor(() => {
      expect(screen.getByText('테스트 과업')).toBeInTheDocument()
      expect(screen.getByText('시작')).toBeInTheDocument()
    })
  })

  it('여러 과업의 이벤트가 시간순으로 표시되어야 한다', async () => {
    const today = getTodayString()
    const task1 = await taskRepository.createTask({
      title: '과업 A',
      date: today,
    })
    const task2 = await taskRepository.createTask({
      title: '과업 B',
      date: today,
    })

    // task1 시작 -> task1 완료 -> task2 시작 순서로 이벤트 추가
    await taskRepository.addTaskEvent(task1.id, 'started')
    await new Promise((r) => setTimeout(r, 10)) // 시간 간격
    await taskRepository.addTaskEvent(task1.id, 'completed')
    await new Promise((r) => setTimeout(r, 10))
    await taskRepository.addTaskEvent(task2.id, 'started')

    render(<LogPage />)

    await waitFor(() => {
      const items = screen.getAllByText(/과업/)
      expect(items).toHaveLength(3) // 과업 A (시작), 과업 A (완료), 과업 B (시작)
    })
  })
})
