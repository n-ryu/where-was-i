import { screen } from '@testing-library/react'
import { renderWithTheme } from '@/test-utils'
import { TaskList } from './TaskList'
import type { Todo } from '@/db/schema'

const makeTodo = (overrides: Partial<Todo> & { id: string; title: string }): Todo => ({
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const onToggleStatus = vi.fn()
const onDelete = vi.fn()
const onUpdateTitle = vi.fn()

describe('TaskList', () => {
  it('should render active tasks in a highlighted section', () => {
    const activeTodo = makeTodo({
      id: '1',
      title: 'Working on this',
      status: 'in_progress',
    })
    renderWithTheme(
      <TaskList
        completedTodayTodos={[]}
        activeTodayTodos={[activeTodo]}
        idleTodos={[]}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
        onUpdateTitle={onUpdateTitle}
      />,
    )
    expect(screen.getByText('Working on this')).toBeInTheDocument()
    expect(screen.getByLabelText('Active tasks')).toBeInTheDocument()
  })

  it('should render idle tasks with section label', () => {
    const idleTodos = [
      makeTodo({ id: '1', title: 'Idle 1' }),
      makeTodo({ id: '2', title: 'Idle 2' }),
    ]
    renderWithTheme(
      <TaskList
        completedTodayTodos={[]}
        activeTodayTodos={[]}
        idleTodos={idleTodos}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
        onUpdateTitle={onUpdateTitle}
      />,
    )
    expect(screen.getByText('Idle')).toBeInTheDocument()
    expect(screen.getByText('Idle 1')).toBeInTheDocument()
    expect(screen.getByText('Idle 2')).toBeInTheDocument()
  })

  it('should render completed today tasks with section label', () => {
    const completedTodos = [
      makeTodo({ id: '1', title: 'Done 1', status: 'completed' }),
    ]
    renderWithTheme(
      <TaskList
        completedTodayTodos={completedTodos}
        activeTodayTodos={[]}
        idleTodos={[]}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
        onUpdateTitle={onUpdateTitle}
      />,
    )
    expect(screen.getByText('Completed Today')).toBeInTheDocument()
    expect(screen.getByText('Done 1')).toBeInTheDocument()
  })

  it('should not render active section when no active tasks', () => {
    renderWithTheme(
      <TaskList
        completedTodayTodos={[]}
        activeTodayTodos={[]}
        idleTodos={[makeTodo({ id: '1', title: 'Idle' })]}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
        onUpdateTitle={onUpdateTitle}
      />,
    )
    expect(screen.queryByLabelText('Active tasks')).not.toBeInTheDocument()
  })

  it('should display empty state message when no tasks exist', () => {
    renderWithTheme(
      <TaskList
        completedTodayTodos={[]}
        activeTodayTodos={[]}
        idleTodos={[]}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
        onUpdateTitle={onUpdateTitle}
      />,
    )
    expect(screen.getByText(/no tasks/i)).toBeInTheDocument()
  })
})
