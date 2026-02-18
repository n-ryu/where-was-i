import type { TimeBlock, TimeMarker } from '@/stores/historyAtoms'
import type { Todo, TodoHistoryEvent } from '@/db/schema'

export const makeTodo = (
  overrides: Partial<Todo> & { id: string; title: string },
): Todo => ({
  status: 'pending',
  createdAt: new Date('2025-06-01T08:00:00'),
  updatedAt: new Date('2025-06-01T08:00:00'),
  ...overrides,
})

export const makeHistoryEvent = (
  overrides: Partial<TodoHistoryEvent> & { todoId: string },
): TodoHistoryEvent => ({
  id: crypto.randomUUID(),
  eventType: 'created',
  fromStatus: null,
  toStatus: 'pending',
  timestamp: new Date('2025-06-01T08:00:00'),
  ...overrides,
})

export const makeTimeBlock = (
  overrides: Partial<TimeBlock> & { todoId: string; todoTitle: string },
): TimeBlock => ({
  startTime: new Date('2025-06-01T09:00:00'),
  endTime: new Date('2025-06-01T10:00:00'),
  endReason: 'stopped',
  ...overrides,
})

export const makeTimeMarker = (
  overrides: Partial<TimeMarker> & { todoId: string; todoTitle: string },
): TimeMarker => ({
  timestamp: new Date('2025-06-01T12:00:00'),
  eventType: 'completed',
  dimmed: false,
  ...overrides,
})

export const sampleDate = new Date('2025-06-01T12:00:00')

export const sampleTimeBlocks: TimeBlock[] = [
  makeTimeBlock({
    todoId: 'todo-1',
    todoTitle: 'Implement user authentication',
    startTime: new Date('2025-06-01T09:00:00'),
    endTime: new Date('2025-06-01T11:30:00'),
    endReason: 'stopped',
  }),
  makeTimeBlock({
    todoId: 'todo-2',
    todoTitle: 'Write API documentation',
    startTime: new Date('2025-06-01T11:30:00'),
    endTime: new Date('2025-06-01T12:00:00'),
    endReason: 'stopped',
  }),
  makeTimeBlock({
    todoId: 'todo-1',
    todoTitle: 'Implement user authentication',
    startTime: new Date('2025-06-01T13:00:00'),
    endTime: new Date('2025-06-01T15:00:00'),
    endReason: 'stopped',
  }),
  makeTimeBlock({
    todoId: 'todo-3',
    todoTitle: 'Review pull request #42',
    startTime: new Date('2025-06-01T15:00:00'),
    endTime: null,
    endReason: 'ongoing',
  }),
]

export const sampleTimeMarkers: TimeMarker[] = [
  makeTimeMarker({
    todoId: 'todo-1',
    todoTitle: 'Implement user authentication',
    timestamp: new Date('2025-06-01T15:00:00'),
  }),
]

export const singleTaskBlocks: TimeBlock[] = [
  makeTimeBlock({
    todoId: 'todo-1',
    todoTitle: 'Implement feature',
    startTime: new Date('2025-06-01T09:00:00'),
    endTime: new Date('2025-06-01T10:30:00'),
    endReason: 'stopped',
  }),
  makeTimeBlock({
    todoId: 'todo-1',
    todoTitle: 'Implement feature',
    startTime: new Date('2025-06-01T14:00:00'),
    endTime: new Date('2025-06-01T16:00:00'),
    endReason: 'stopped',
  }),
]

export const singleTaskMarkers: TimeMarker[] = [
  makeTimeMarker({
    todoId: 'todo-1',
    todoTitle: 'Implement feature',
    timestamp: new Date('2025-06-01T16:00:00'),
  }),
]

export const directCompletionMarkers: TimeMarker[] = [
  makeTimeMarker({
    todoId: 'todo-4',
    todoTitle: 'Quick fix typo',
    timestamp: new Date('2025-06-01T10:30:00'),
  }),
]

export const reopenedTaskBlocks: TimeBlock[] = [
  makeTimeBlock({
    todoId: 'todo-5',
    todoTitle: 'Fix login bug',
    startTime: new Date('2025-06-01T09:00:00'),
    endTime: new Date('2025-06-01T10:00:00'),
    endReason: 'stopped',
  }),
  makeTimeBlock({
    todoId: 'todo-5',
    todoTitle: 'Fix login bug',
    startTime: new Date('2025-06-01T11:00:00'),
    endTime: new Date('2025-06-01T12:30:00'),
    endReason: 'stopped',
  }),
]

export const reopenedTaskMarkers: TimeMarker[] = [
  makeTimeMarker({
    todoId: 'todo-5',
    todoTitle: 'Fix login bug',
    timestamp: new Date('2025-06-01T10:00:00'),
    dimmed: true,
  }),
  makeTimeMarker({
    todoId: 'todo-5',
    todoTitle: 'Fix login bug',
    timestamp: new Date('2025-06-01T10:30:00'),
    eventType: 'reopened',
  }),
  makeTimeMarker({
    todoId: 'todo-5',
    todoTitle: 'Fix login bug',
    timestamp: new Date('2025-06-01T12:30:00'),
  }),
]

export const sampleTodos: Map<string, Todo> = new Map([
  ['todo-1', makeTodo({ id: 'todo-1', title: 'Implement user authentication', status: 'completed', updatedAt: new Date('2025-06-01T15:00:00') })],
  ['todo-2', makeTodo({ id: 'todo-2', title: 'Write API documentation' })],
  ['todo-3', makeTodo({ id: 'todo-3', title: 'Review pull request #42', status: 'in_progress', updatedAt: new Date('2025-06-01T15:00:00') })],
  ['todo-4', makeTodo({ id: 'todo-4', title: 'Quick fix typo', status: 'completed', updatedAt: new Date('2025-06-01T10:30:00') })],
  ['todo-5', makeTodo({ id: 'todo-5', title: 'Fix login bug', status: 'completed', updatedAt: new Date('2025-06-01T12:30:00') })],
  ['todo-6', makeTodo({ id: 'todo-6', title: 'Update dependencies' })],
  ['todo-7', makeTodo({ id: 'todo-7', title: 'Setup CI pipeline', createdAt: new Date('2025-05-30T08:00:00') })],
])

export const sampleHistoryEvents: TodoHistoryEvent[] = [
  makeHistoryEvent({ todoId: 'todo-1', eventType: 'created', toStatus: 'pending', timestamp: new Date('2025-06-01T08:00:00') }),
  makeHistoryEvent({ todoId: 'todo-1', eventType: 'started', fromStatus: 'pending', toStatus: 'in_progress', timestamp: new Date('2025-06-01T09:00:00') }),
  makeHistoryEvent({ todoId: 'todo-1', eventType: 'stopped', fromStatus: 'in_progress', toStatus: 'pending', timestamp: new Date('2025-06-01T11:30:00') }),
  makeHistoryEvent({ todoId: 'todo-1', eventType: 'started', fromStatus: 'pending', toStatus: 'in_progress', timestamp: new Date('2025-06-01T13:00:00') }),
  makeHistoryEvent({ todoId: 'todo-1', eventType: 'completed', fromStatus: 'in_progress', toStatus: 'completed', timestamp: new Date('2025-06-01T15:00:00') }),
  makeHistoryEvent({ todoId: 'todo-2', eventType: 'created', toStatus: 'pending', timestamp: new Date('2025-06-01T08:00:00') }),
  makeHistoryEvent({ todoId: 'todo-2', eventType: 'started', fromStatus: 'pending', toStatus: 'in_progress', timestamp: new Date('2025-06-01T11:30:00') }),
  makeHistoryEvent({ todoId: 'todo-2', eventType: 'stopped', fromStatus: 'in_progress', toStatus: 'pending', timestamp: new Date('2025-06-01T12:00:00') }),
  makeHistoryEvent({ todoId: 'todo-3', eventType: 'created', toStatus: 'pending', timestamp: new Date('2025-06-01T08:00:00') }),
  makeHistoryEvent({ todoId: 'todo-3', eventType: 'started', fromStatus: 'pending', toStatus: 'in_progress', timestamp: new Date('2025-06-01T15:00:00') }),
  makeHistoryEvent({ todoId: 'todo-6', eventType: 'created', toStatus: 'pending', timestamp: new Date('2025-06-01T08:00:00') }),
  makeHistoryEvent({ todoId: 'todo-7', eventType: 'created', toStatus: 'pending', timestamp: new Date('2025-05-30T08:00:00') }),
]
