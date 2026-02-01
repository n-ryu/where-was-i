import type { Meta, StoryObj } from '@storybook/react'
import { expect, userEvent, within, waitFor } from '@storybook/test'
import { SettingsPage } from './SettingsPage'

const meta: Meta<typeof SettingsPage> = {
  title: 'Pages/SettingsPage',
  component: SettingsPage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof SettingsPage>

export const Default: Story = {}

export const ChangeProvider: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 로딩 완료 대기
    await waitFor(() => {
      expect(canvas.getByLabelText('API 프로바이더')).toBeVisible()
    })

    // API 프로바이더 변경
    const providerSelect = canvas.getByLabelText('API 프로바이더')
    await userEvent.selectOptions(providerSelect, 'anthropic')

    await expect(providerSelect).toHaveValue('anthropic')
  },
}

export const EnterApiKey: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 로딩 완료 대기
    await waitFor(() => {
      expect(canvas.getByLabelText('API 키')).toBeVisible()
    })

    // API 키 입력
    const apiKeyInput = canvas.getByLabelText('API 키')
    await userEvent.type(apiKeyInput, 'sk-test-12345', { delay: 30 })

    await expect(apiKeyInput).toHaveValue('sk-test-12345')
  },
}

export const SaveSettings: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 로딩 완료 대기
    await waitFor(() => {
      expect(canvas.getByLabelText('API 키')).toBeVisible()
    })

    // API 키 입력
    const apiKeyInput = canvas.getByLabelText('API 키')
    await userEvent.type(apiKeyInput, 'sk-new-api-key', { delay: 30 })

    // 저장 버튼 클릭
    const saveButton = canvas.getByRole('button', { name: '저장' })
    await userEvent.click(saveButton)

    // 성공 메시지 확인
    await waitFor(() => {
      expect(canvas.getByText('설정이 저장되었습니다')).toBeVisible()
    })
  },
}

export const DeleteApiKey: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // 로딩 완료 대기
    await waitFor(() => {
      expect(canvas.getByLabelText('API 키')).toBeVisible()
    })

    // API 키 입력
    const apiKeyInput = canvas.getByLabelText('API 키')
    await userEvent.type(apiKeyInput, 'key-to-delete', { delay: 30 })

    // 삭제 버튼 클릭
    const deleteButton = canvas.getByRole('button', { name: '삭제' })
    await userEvent.click(deleteButton)

    // API 키가 비워졌는지 확인
    await expect(apiKeyInput).toHaveValue('')
  },
}
