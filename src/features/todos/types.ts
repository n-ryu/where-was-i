import type { Todo } from '@/db/schema'

export type TodoAction = 'start' | 'stop' | 'complete' | 'reopen'

export interface TaskItemProps {
  todo: Todo
  onToggleStatus: (params: { id: string; action: TodoAction }) => void
}

export interface TaskInputProps {
  onAddTodo: (title: string) => void
}
