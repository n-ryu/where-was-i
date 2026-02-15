import type { TimeBlock, TimeMarker } from '@/stores/historyAtoms'

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
