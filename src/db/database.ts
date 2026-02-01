import Dexie, { type EntityTable } from 'dexie'
import type { Task } from '../types'

export interface Setting {
  key: string
  value: string
}

const db = new Dexie('where-was-i-db') as Dexie & {
  tasks: EntityTable<Task, 'id'>
  settings: EntityTable<Setting, 'key'>
}

db.version(1).stores({
  tasks: 'id, status, date, createdAt',
})

db.version(2).stores({
  tasks: 'id, status, date, createdAt',
  settings: 'key',
})

export { db }
