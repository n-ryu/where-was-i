import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TimelineItem } from './TimelineItem'
import type { TaskEventType } from '../types'

interface TimelineEvent {
  taskId: string
  taskTitle: string
  eventType: TaskEventType
  timestamp: Date
}

function createEvent(
  eventType: TaskEventType,
  title = '테스트 과업'
): TimelineEvent {
  return {
    taskId: '1',
    taskTitle: title,
    eventType,
    timestamp: new Date('2025-01-15T10:30:00'),
  }
}

describe('TimelineItem', () => {
  it('이벤트 시간이 표시되어야 한다', () => {
    render(<TimelineItem event={createEvent('started')} />)

    expect(screen.getByText('10:30')).toBeInTheDocument()
  })

  it('과업 제목이 표시되어야 한다', () => {
    render(<TimelineItem event={createEvent('started', '코드 리뷰')} />)

    expect(screen.getByText('코드 리뷰')).toBeInTheDocument()
  })

  it('started 이벤트는 "시작" 라벨로 표시되어야 한다', () => {
    render(<TimelineItem event={createEvent('started')} />)

    expect(screen.getByText('시작')).toBeInTheDocument()
  })

  it('paused 이벤트는 "일시정지" 라벨로 표시되어야 한다', () => {
    render(<TimelineItem event={createEvent('paused')} />)

    expect(screen.getByText('일시정지')).toBeInTheDocument()
  })

  it('completed 이벤트는 "완료" 라벨로 표시되어야 한다', () => {
    render(<TimelineItem event={createEvent('completed')} />)

    expect(screen.getByText('완료')).toBeInTheDocument()
  })

  it('cancelled 이벤트는 "취소" 라벨로 표시되어야 한다', () => {
    render(<TimelineItem event={createEvent('cancelled')} />)

    expect(screen.getByText('취소')).toBeInTheDocument()
  })
})
