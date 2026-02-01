import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from './database'
import * as settingsRepository from './settingsRepository'

describe('settingsRepository', () => {
  beforeEach(async () => {
    await db.settings.clear()
  })

  afterEach(async () => {
    await db.settings.clear()
  })

  describe('getSetting / setSetting', () => {
    it('설정이 없으면 null을 반환해야 한다', async () => {
      const value = await settingsRepository.getSetting('apiKey')

      expect(value).toBeNull()
    })

    it('설정을 저장하고 조회할 수 있어야 한다', async () => {
      await settingsRepository.setSetting('apiKey', 'test-api-key')

      const value = await settingsRepository.getSetting('apiKey')
      expect(value).toBe('test-api-key')
    })

    it('설정을 업데이트할 수 있어야 한다', async () => {
      await settingsRepository.setSetting('apiKey', 'old-key')
      await settingsRepository.setSetting('apiKey', 'new-key')

      const value = await settingsRepository.getSetting('apiKey')
      expect(value).toBe('new-key')
    })
  })

  describe('deleteSetting', () => {
    it('설정을 삭제할 수 있어야 한다', async () => {
      await settingsRepository.setSetting('apiKey', 'test-key')
      await settingsRepository.deleteSetting('apiKey')

      const value = await settingsRepository.getSetting('apiKey')
      expect(value).toBeNull()
    })

    it('존재하지 않는 설정을 삭제해도 에러가 발생하지 않아야 한다', async () => {
      await expect(
        settingsRepository.deleteSetting('nonexistent')
      ).resolves.not.toThrow()
    })
  })

  describe('API 키 관리', () => {
    it('API 프로바이더를 저장하고 조회할 수 있어야 한다', async () => {
      await settingsRepository.setSetting('apiProvider', 'anthropic')

      const value = await settingsRepository.getSetting('apiProvider')
      expect(value).toBe('anthropic')
    })

    it('여러 설정을 독립적으로 관리할 수 있어야 한다', async () => {
      await settingsRepository.setSetting('apiProvider', 'openai')
      await settingsRepository.setSetting('apiKey', 'sk-test-key')

      expect(await settingsRepository.getSetting('apiProvider')).toBe('openai')
      expect(await settingsRepository.getSetting('apiKey')).toBe('sk-test-key')
    })
  })
})
