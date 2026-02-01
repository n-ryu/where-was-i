import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { SettingsPage } from './SettingsPage'
import { db } from '../db/database'
import * as settingsRepository from '../db/settingsRepository'

describe('SettingsPage', () => {
  beforeEach(async () => {
    await db.settings.clear()
  })

  afterEach(async () => {
    await db.settings.clear()
  })

  it('페이지 제목이 표시되어야 한다', async () => {
    render(<SettingsPage />)

    expect(screen.getByText('설정')).toBeInTheDocument()
  })

  it('API 프로바이더 선택 옵션이 표시되어야 한다', async () => {
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByLabelText('API 프로바이더')).toBeInTheDocument()
    })
    expect(screen.getByRole('option', { name: 'OpenAI' })).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Anthropic' })
    ).toBeInTheDocument()
  })

  it('API 키 입력 필드가 표시되어야 한다', async () => {
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByLabelText('API 키')).toBeInTheDocument()
    })
  })

  it('저장된 설정을 불러와 표시해야 한다', async () => {
    await settingsRepository.setSetting('apiProvider', 'anthropic')
    await settingsRepository.setSetting('apiKey', 'saved-key')

    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByLabelText('API 프로바이더')).toHaveValue('anthropic')
      expect(screen.getByLabelText('API 키')).toHaveValue('saved-key')
    })
  })

  it('설정을 저장할 수 있어야 한다', async () => {
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByLabelText('API 프로바이더')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('API 프로바이더'), {
      target: { value: 'openai' },
    })
    fireEvent.change(screen.getByLabelText('API 키'), {
      target: { value: 'new-api-key' },
    })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(async () => {
      expect(await settingsRepository.getSetting('apiProvider')).toBe('openai')
      expect(await settingsRepository.getSetting('apiKey')).toBe('new-api-key')
    })
  })

  it('저장 성공 시 메시지가 표시되어야 한다', async () => {
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByLabelText('API 키')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('API 키'), {
      target: { value: 'test-key' },
    })
    fireEvent.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => {
      expect(screen.getByText('설정이 저장되었습니다')).toBeInTheDocument()
    })
  })

  it('API 키를 삭제할 수 있어야 한다', async () => {
    await settingsRepository.setSetting('apiKey', 'existing-key')

    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByLabelText('API 키')).toHaveValue('existing-key')
    })

    fireEvent.click(screen.getByRole('button', { name: '삭제' }))

    await waitFor(async () => {
      expect(screen.getByLabelText('API 키')).toHaveValue('')
      expect(await settingsRepository.getSetting('apiKey')).toBeNull()
    })
  })
})
