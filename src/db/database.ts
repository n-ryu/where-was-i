import Dexie, { type EntityTable } from 'dexie'
import type { Goal, Task } from '../types'

const db = new Dexie('where-was-i-db') as Dexie & {
  goals: EntityTable<Goal, 'id'>
  tasks: EntityTable<Task, 'id'>
}

db.version(1).stores({
  goals: 'id, isActive, createdAt',
  tasks: 'id, status, goalId, date, createdAt',
})

export { db }
