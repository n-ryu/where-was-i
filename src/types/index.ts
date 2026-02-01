/** Task 상태 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

/** TaskEvent 이벤트 타입 */
export type TaskEventType = 'started' | 'paused' | 'completed' | 'cancelled'

/** Task 이벤트 (상태 변화 기록) */
export interface TaskEvent {
  eventType: TaskEventType
  timestamp: Date
}

/** Task (일일 과업) */
export interface Task {
  id: string
  title: string
  status: TaskStatus
  date: string // YYYY-MM-DD 형식
  events: TaskEvent[]
  createdAt: Date
  updatedAt: Date
}
