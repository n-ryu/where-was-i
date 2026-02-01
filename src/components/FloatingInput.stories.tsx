import type { Meta, StoryObj } from '@storybook/react'
import { fn, expect, userEvent, within } from '@storybook/test'
import styled from 'styled-components'
import { FloatingInput } from './FloatingInput'

const Container = styled.div`
  height: 300px;
  position: relative;
  background: #f5f5f5;
`

const meta: Meta<typeof FloatingInput> = {
  title: 'Components/FloatingInput',
  component: FloatingInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <Container>
        <Story />
      </Container>
    ),
  ],
  args: {
    onSubmit: fn(),
  },
}

export default meta
type Story = StoryObj<typeof FloatingInput>

export const Default: Story = {}

export const CustomPlaceholder: Story = {
  args: {
    placeholder: '오늘의 목표를 입력하세요',
  },
}

export const WithAutoFocus: Story = {
  args: {
    autoFocus: true,
  },
}

export const SubmitInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    const button = canvas.getByRole('button', { name: '추가' })

    // 버튼이 처음에 비활성화되어 있는지 확인
    await expect(button).toBeDisabled()

    // 텍스트 입력
    await userEvent.type(input, '새 과업 추가하기', { delay: 30 })

    // 버튼이 활성화되었는지 확인
    await expect(button).toBeEnabled()

    // 버튼 클릭
    await userEvent.click(button)

    // onSubmit이 호출되었는지 확인
    await expect(args.onSubmit).toHaveBeenCalledWith('새 과업 추가하기')

    // 입력 필드가 비워졌는지 확인
    await expect(input).toHaveValue('')
  },
}

export const EnterKeySubmit: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')

    // 텍스트 입력 후 Enter
    await userEvent.type(input, '엔터로 제출하기{enter}', { delay: 30 })

    // onSubmit이 호출되었는지 확인
    await expect(args.onSubmit).toHaveBeenCalledWith('엔터로 제출하기')
  },
}
