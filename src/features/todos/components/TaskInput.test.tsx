import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'
import { renderWithTheme } from '@/test-utils'
import { TaskInput } from './TaskInput'

describe('TaskInput', () => {
  it('should render an input field with placeholder text', () => {
    renderWithTheme(<TaskInput onAddTodo={vi.fn()} />)
    expect(screen.getByPlaceholderText(/add/i)).toBeInTheDocument()
  })

  it('should call onAddTodo with the input value when form is submitted', async () => {
    const onAddTodo = vi.fn()
    renderWithTheme(<TaskInput onAddTodo={onAddTodo} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'New task{Enter}')
    expect(onAddTodo).toHaveBeenCalledWith('New task')
  })

  it('should clear the input after submission', async () => {
    renderWithTheme(<TaskInput onAddTodo={vi.fn()} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'New task{Enter}')
    expect(input).toHaveValue('')
  })

  it('should not submit when input is empty', async () => {
    const onAddTodo = vi.fn()
    renderWithTheme(<TaskInput onAddTodo={onAddTodo} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '{Enter}')
    expect(onAddTodo).not.toHaveBeenCalled()
  })

  it('should not submit when input is whitespace only', async () => {
    const onAddTodo = vi.fn()
    renderWithTheme(<TaskInput onAddTodo={onAddTodo} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '   {Enter}')
    expect(onAddTodo).not.toHaveBeenCalled()
  })

  it('should trim whitespace from the submitted title', async () => {
    const onAddTodo = vi.fn()
    renderWithTheme(<TaskInput onAddTodo={onAddTodo} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '  New task  {Enter}')
    expect(onAddTodo).toHaveBeenCalledWith('New task')
  })
})
