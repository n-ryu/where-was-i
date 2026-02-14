import Dexie, { type EntityTable } from 'dexie'

interface Todo {
  id: string
  title: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

const db = new Dexie('WhereWasIDB') as Dexie & {
  todos: EntityTable<Todo, 'id'>
}

db.version(1).stores({
  todos: 'id, createdAt',
})

export { db }
export type { Todo }
