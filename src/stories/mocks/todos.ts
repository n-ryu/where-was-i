import type { Todo } from '@/db/schema'

export const makeTodo = (
  overrides: Partial<Todo> & { id: string; title: string },
): Todo => ({
  status: 'pending',
  createdAt: new Date('2025-06-01T09:00:00'),
  updatedAt: new Date('2025-06-01T09:00:00'),
  ...overrides,
})

export const sampleInProgressTodo = makeTodo({
  id: 'todo-1',
  title: 'Implement user authentication',
  status: 'in_progress',
  updatedAt: new Date('2025-06-01T10:30:00'),
})

export const samplePendingTodos: Todo[] = [
  makeTodo({ id: 'todo-2', title: 'Write API documentation' }),
  makeTodo({ id: 'todo-3', title: 'Review pull request #42' }),
  makeTodo({ id: 'todo-4', title: 'Set up CI/CD pipeline' }),
]

export const sampleCompletedTodos: Todo[] = [
  makeTodo({
    id: 'todo-5',
    title: 'Design database schema',
    status: 'completed',
    updatedAt: new Date('2025-06-01T08:45:00'),
  }),
  makeTodo({
    id: 'todo-6',
    title: 'Configure ESLint rules',
    status: 'completed',
    updatedAt: new Date('2025-05-31T17:00:00'),
  }),
]
