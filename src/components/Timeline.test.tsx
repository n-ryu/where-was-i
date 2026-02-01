import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Timeline } from './Timeline'
import type { TimelineEvent } from './TimelineItem'

function createEvent(
  taskTitle: string,
  hour: number,
  eventType: 'started' | 'paused' | 'completed' | 'cancelled' = 'started'
): TimelineEvent {
  return {
    taskId: `task-${taskTitle}`,
    taskTitle,
    eventType,
    timestamp: new Date(`2025-01-15T${hour.toString().padStart(2, '0')}:00:00`),
  }
}

describe('Timeline', () => {
  it('이벤트가 없으면 빈 상태 메시지가 표시되어야 한다', () => {
    render(<Timeline events={[]} />)

    expect(screen.getByText('오늘의 활동 기록이 없습니다')).toBeInTheDocument()
  })

  it('이벤트가 시간순으로 정렬되어 표시되어야 한다', () => {
    const events = [
      createEvent('과업 B', 14),
      createEvent('과업 A', 9),
      createEvent('과업 C', 11),
    ]

    render(<Timeline events={events} />)

    const items = screen.getAllByText(/과업/)
    expect(items[0]).toHaveTextContent('과업 A')
    expect(items[1]).toHaveTextContent('과업 C')
    expect(items[2]).toHaveTextContent('과업 B')
  })

  it('모든 이벤트가 표시되어야 한다', () => {
    const events = [
      createEvent('코드 리뷰', 10, 'started'),
      createEvent('코드 리뷰', 11, 'completed'),
      createEvent('문서 작성', 12, 'started'),
    ]

    render(<Timeline events={events} />)

    expect(screen.getAllByText('코드 리뷰')).toHaveLength(2)
    expect(screen.getByText('문서 작성')).toBeInTheDocument()
    expect(screen.getAllByText('시작')).toHaveLength(2)
    expect(screen.getByText('완료')).toBeInTheDocument()
  })
})
