import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, userEvent, within } from '@storybook/test'
import { TaskForm } from './TaskForm'

const meta: Meta<typeof TaskForm> = {
  title: 'Components/TaskForm',
  component: TaskForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    onCreate: fn(),
  },
}

export default meta
type Story = StoryObj<typeof TaskForm>

export const Default: Story = {}

export const WithInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('새 과업 입력')
    const button = canvas.getByRole('button', { name: '추가' })

    // 버튼이 처음에 비활성화되어 있는지 확인
    await expect(button).toBeDisabled()

    // 텍스트 입력
    await userEvent.type(input, '새로운 과업', { delay: 50 })

    // 버튼이 활성화되었는지 확인
    await expect(button).toBeEnabled()

    // 버튼 클릭
    await userEvent.click(button)

    // onCreate가 호출되었는지 확인
    await expect(args.onCreate).toHaveBeenCalledWith({ title: '새로운 과업' })

    // 입력 필드가 비워졌는지 확인
    await expect(input).toHaveValue('')
  },
}

export const EnterKeySubmit: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('새 과업 입력')

    // 텍스트 입력 후 Enter
    await userEvent.type(input, '엔터로 제출{enter}', { delay: 30 })

    // onCreate가 호출되었는지 확인
    await expect(args.onCreate).toHaveBeenCalledWith({ title: '엔터로 제출' })
  },
}

export const DisabledWhenEmpty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button', { name: '추가' })

    // 버튼이 비활성화되어 있는지 확인
    await expect(button).toBeDisabled()
  },
}

export const WhitespaceOnly: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('새 과업 입력')
    const button = canvas.getByRole('button', { name: '추가' })

    // 공백만 입력
    await userEvent.type(input, '   ')

    // 버튼이 여전히 비활성화되어 있는지 확인
    await expect(button).toBeDisabled()

    // 클릭해도 onCreate가 호출되지 않음
    await userEvent.click(button)
    await expect(args.onCreate).not.toHaveBeenCalled()
  },
}
