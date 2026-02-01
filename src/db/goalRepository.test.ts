import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { db } from './database'
import {
  createGoal,
  getGoal,
  updateGoal,
  deleteGoal,
  getAllGoals,
  getActiveGoals,
  getInactiveGoals,
  setGoalActive,
} from './goalRepository'

describe('GoalRepository', () => {
  beforeEach(async () => {
    await db.open()
  })

  afterEach(async () => {
    await db.goals.clear()
  })

  describe('CRUD', () => {
    it('Goal을 생성할 수 있다', async () => {
      const goal = await createGoal({ title: '운동하기' })

      expect(goal.id).toBeDefined()
      expect(goal.title).toBe('운동하기')
      expect(goal.isActive).toBe(true)
      expect(goal.createdAt).toBeInstanceOf(Date)
      expect(goal.updatedAt).toBeInstanceOf(Date)
    })

    it('Goal을 ID로 조회할 수 있다', async () => {
      const created = await createGoal({ title: '독서하기', memo: '매일 30분' })
      const goal = await getGoal(created.id)

      expect(goal).toBeDefined()
      expect(goal?.title).toBe('독서하기')
      expect(goal?.memo).toBe('매일 30분')
    })

    it('존재하지 않는 Goal 조회 시 undefined를 반환한다', async () => {
      const goal = await getGoal('non-existent-id')
      expect(goal).toBeUndefined()
    })

    it('Goal을 수정할 수 있다', async () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date('2025-01-15T10:00:00'))

      const created = await createGoal({ title: '원래 제목' })

      vi.setSystemTime(new Date('2025-01-15T10:00:01'))
      const updated = await updateGoal(created.id, { title: '수정된 제목' })

      expect(updated?.title).toBe('수정된 제목')
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(
        created.updatedAt.getTime()
      )

      vi.useRealTimers()
    })

    it('Goal을 삭제할 수 있다', async () => {
      const created = await createGoal({ title: '삭제할 목표' })
      await deleteGoal(created.id)
      const goal = await getGoal(created.id)

      expect(goal).toBeUndefined()
    })
  })

  describe('목록 조회', () => {
    beforeEach(async () => {
      await createGoal({ title: '활성 목표 1' })
      await createGoal({ title: '활성 목표 2' })
      const inactive = await createGoal({ title: '비활성 목표' })
      await setGoalActive(inactive.id, false)
    })

    it('모든 Goal을 조회할 수 있다', async () => {
      const goals = await getAllGoals()
      expect(goals).toHaveLength(3)
    })

    it('활성 Goal만 조회할 수 있다', async () => {
      const goals = await getActiveGoals()
      expect(goals).toHaveLength(2)
      expect(goals.every((g) => g.isActive)).toBe(true)
    })

    it('비활성 Goal만 조회할 수 있다', async () => {
      const goals = await getInactiveGoals()
      expect(goals).toHaveLength(1)
      expect(goals.every((g) => !g.isActive)).toBe(true)
    })
  })

  describe('활성/비활성 전환', () => {
    it('Goal을 비활성화할 수 있다', async () => {
      const created = await createGoal({ title: '목표' })
      const updated = await setGoalActive(created.id, false)

      expect(updated?.isActive).toBe(false)
    })

    it('Goal을 활성화할 수 있다', async () => {
      const created = await createGoal({ title: '목표' })
      await setGoalActive(created.id, false)
      const updated = await setGoalActive(created.id, true)

      expect(updated?.isActive).toBe(true)
    })
  })
})
