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

describe('TaskList', () => {
  it('should render in-progress task in a highlighted section', () => {
    const inProgressTodo = makeTodo({
      id: '1',
      title: 'Working on this',
      status: 'in_progress',
    })
    renderWithTheme(
      <TaskList
        inProgressTodo={inProgressTodo}
        pendingTodos={[]}
        completedTodos={[]}
        onToggleStatus={onToggleStatus}
      />,
    )
    expect(screen.getByText('Working on this')).toBeInTheDocument()
    expect(screen.getByLabelText('In progress')).toBeInTheDocument()
  })

  it('should render pending tasks with section label', () => {
    const pendingTodos = [
      makeTodo({ id: '1', title: 'Pending 1' }),
      makeTodo({ id: '2', title: 'Pending 2' }),
    ]
    renderWithTheme(
      <TaskList
        inProgressTodo={null}
        pendingTodos={pendingTodos}
        completedTodos={[]}
        onToggleStatus={onToggleStatus}
      />,
    )
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Pending 1')).toBeInTheDocument()
    expect(screen.getByText('Pending 2')).toBeInTheDocument()
  })

  it('should render completed tasks with section label', () => {
    const completedTodos = [
      makeTodo({ id: '1', title: 'Done 1', status: 'completed' }),
    ]
    renderWithTheme(
      <TaskList
        inProgressTodo={null}
        pendingTodos={[]}
        completedTodos={completedTodos}
        onToggleStatus={onToggleStatus}
      />,
    )
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Done 1')).toBeInTheDocument()
  })

  it('should not render in-progress section when no task is in progress', () => {
    renderWithTheme(
      <TaskList
        inProgressTodo={null}
        pendingTodos={[makeTodo({ id: '1', title: 'Pending' })]}
        completedTodos={[]}
        onToggleStatus={onToggleStatus}
      />,
    )
    expect(screen.queryByLabelText('In progress')).not.toBeInTheDocument()
  })

  it('should display empty state message when no tasks exist', () => {
    renderWithTheme(
      <TaskList
        inProgressTodo={null}
        pendingTodos={[]}
        completedTodos={[]}
        onToggleStatus={onToggleStatus}
      />,
    )
    expect(screen.getByText(/no tasks/i)).toBeInTheDocument()
  })
})
