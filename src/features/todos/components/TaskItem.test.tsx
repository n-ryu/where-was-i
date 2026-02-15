import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '@/test-utils'
import { TaskItem } from './TaskItem'
import type { Todo } from '@/db/schema'
import type { TaskItemProps } from '../types'

const makeTodo = (overrides?: Partial<Todo>): Todo => ({
  id: '1',
  title: 'Test task',
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const renderTaskItem = (overrides?: Partial<TaskItemProps>) => {
  const onToggleStatus = vi.fn()
  const todo = overrides?.todo ?? makeTodo()
  renderWithTheme(
    <TaskItem
      todo={todo}
      onToggleStatus={onToggleStatus}
      {...overrides}
    />,
  )
  return { onToggleStatus, todo }
}

describe('TaskItem', () => {
  describe('rendering', () => {
    it('should display the task title', () => {
      renderTaskItem({ todo: makeTodo({ title: 'My task' }) })
      expect(screen.getByText('My task')).toBeInTheDocument()
    })

    it('should show an unchecked checkbox for pending tasks', () => {
      renderTaskItem({ todo: makeTodo({ status: 'pending' }) })
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('should show a checked checkbox for completed tasks', () => {
      renderTaskItem({ todo: makeTodo({ status: 'completed' }) })
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    it('should show an unchecked checkbox for in-progress tasks', () => {
      renderTaskItem({ todo: makeTodo({ status: 'in_progress' }) })
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })
  })

  describe('interactions', () => {
    it('should call onToggleStatus with complete when checkbox is clicked on a pending task', async () => {
      const { onToggleStatus } = renderTaskItem({
        todo: makeTodo({ status: 'pending' }),
      })
      await userEvent.click(screen.getByRole('checkbox'))
      expect(onToggleStatus).toHaveBeenCalledWith({
        id: '1',
        action: 'complete',
      })
    })

    it('should call onToggleStatus with complete when checkbox is clicked on an in-progress task', async () => {
      const { onToggleStatus } = renderTaskItem({
        todo: makeTodo({ status: 'in_progress' }),
      })
      await userEvent.click(screen.getByRole('checkbox'))
      expect(onToggleStatus).toHaveBeenCalledWith({
        id: '1',
        action: 'complete',
      })
    })

    it('should call onToggleStatus with reopen when checkbox is clicked on a completed task', async () => {
      const { onToggleStatus } = renderTaskItem({
        todo: makeTodo({ status: 'completed' }),
      })
      await userEvent.click(screen.getByRole('checkbox'))
      expect(onToggleStatus).toHaveBeenCalledWith({
        id: '1',
        action: 'reopen',
      })
    })

    it('should call onToggleStatus with start when body is clicked on a pending task', async () => {
      const { onToggleStatus } = renderTaskItem({
        todo: makeTodo({ status: 'pending' }),
      })
      await userEvent.click(screen.getByText('Test task'))
      expect(onToggleStatus).toHaveBeenCalledWith({
        id: '1',
        action: 'start',
      })
    })

    it('should call onToggleStatus with stop when body is clicked on an in-progress task', async () => {
      const { onToggleStatus } = renderTaskItem({
        todo: makeTodo({ status: 'in_progress' }),
      })
      await userEvent.click(screen.getByText('Test task'))
      expect(onToggleStatus).toHaveBeenCalledWith({
        id: '1',
        action: 'stop',
      })
    })

    it('should not trigger body action when clicking a completed task body', async () => {
      const { onToggleStatus } = renderTaskItem({
        todo: makeTodo({ status: 'completed' }),
      })
      await userEvent.click(screen.getByText('Test task'))
      expect(onToggleStatus).not.toHaveBeenCalled()
    })
  })
})
