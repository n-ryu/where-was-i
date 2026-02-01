import type {
  Task,
  TaskStatus,
  TaskEventType,
  TaskEvent,
} from '../../src/types'

interface CreateMockTaskOptions {
  id?: string
  title: string
  status?: TaskStatus
  date?: string
  events?: TaskEvent[]
  createdAt?: Date
  updatedAt?: Date
}

let taskIdCounter = 1

export function createMockTask(options: CreateMockTaskOptions): Task {
  const now = new Date()
  const id = options.id || `task-${taskIdCounter++}`

  return {
    id,
    title: options.title,
    status: options.status || 'pending',
    date: options.date || getTodayString(),
    events: options.events || [],
    createdAt: options.createdAt || now,
    updatedAt: options.updatedAt || now,
  }
}

export function createMockEvent(
  eventType: TaskEventType,
  timestamp?: Date
): TaskEvent {
  return {
    eventType,
    timestamp: timestamp || new Date(),
  }
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

function getYesterdayString(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

export function resetTaskIdCounter(): void {
  taskIdCounter = 1
}

// 프리셋 데이터
export const seedPresets = {
  empty: [] as Task[],

  basicTasks: (): Task[] => {
    resetTaskIdCounter()
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    return [
      createMockTask({
        title: '이메일 확인하기',
        status: 'completed',
        events: [
          createMockEvent('started', oneHourAgo),
          createMockEvent('completed', now),
        ],
      }),
      createMockTask({
        title: '회의 준비하기',
        status: 'in_progress',
        events: [
          createMockEvent('started', new Date(now.getTime() - 30 * 60 * 1000)),
        ],
      }),
      createMockTask({
        title: '보고서 작성하기',
        status: 'pending',
      }),
    ]
  },

  withUncompletedTasks: (): Task[] => {
    resetTaskIdCounter()
    const yesterday = getYesterdayString()

    return [
      createMockTask({
        title: '어제 미완료 과업 1',
        status: 'pending',
        date: yesterday,
      }),
      createMockTask({
        title: '어제 미완료 과업 2',
        status: 'in_progress',
        date: yesterday,
        events: [createMockEvent('started')],
      }),
      createMockTask({
        title: '어제 완료한 과업',
        status: 'completed',
        date: yesterday,
        events: [createMockEvent('started'), createMockEvent('completed')],
      }),
    ]
  },

  withTimelineEvents: (): Task[] => {
    resetTaskIdCounter()
    const now = new Date()
    const today = getTodayString()

    const task1StartTime = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    const task1CompleteTime = new Date(now.getTime() - 2 * 60 * 60 * 1000)
    const task2StartTime = new Date(now.getTime() - 90 * 60 * 1000)
    const task2PauseTime = new Date(now.getTime() - 60 * 60 * 1000)
    const task3StartTime = new Date(now.getTime() - 30 * 60 * 1000)

    return [
      createMockTask({
        title: '아침 회의',
        status: 'completed',
        date: today,
        events: [
          createMockEvent('started', task1StartTime),
          createMockEvent('completed', task1CompleteTime),
        ],
      }),
      createMockTask({
        title: '문서 작성',
        status: 'pending',
        date: today,
        events: [
          createMockEvent('started', task2StartTime),
          createMockEvent('paused', task2PauseTime),
        ],
      }),
      createMockTask({
        title: '코드 리뷰',
        status: 'in_progress',
        date: today,
        events: [createMockEvent('started', task3StartTime)],
      }),
    ]
  },

  withSettings: {
    apiProvider: 'openai',
    apiKey: 'sk-test-key-12345',
  },
}

export type SeedPreset = keyof typeof seedPresets
