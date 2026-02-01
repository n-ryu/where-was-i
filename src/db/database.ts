import Dexie, { type EntityTable } from 'dexie'
import type { Task } from '../types'

const db = new Dexie('where-was-i-db') as Dexie & {
  tasks: EntityTable<Task, 'id'>
}

db.version(1).stores({
  tasks: 'id, status, date, createdAt',
})

export { db }
