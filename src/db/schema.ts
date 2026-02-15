import Dexie, { type EntityTable } from 'dexie'

type TodoStatus = 'in_progress' | 'pending' | 'completed'

interface Todo {
  id: string
  title: string
  status: TodoStatus
  createdAt: Date
  updatedAt: Date
}

const db = new Dexie('WhereWasIDB') as Dexie & {
  todos: EntityTable<Todo, 'id'>
}

db.version(1).stores({
  todos: 'id, createdAt',
})

db.version(2)
  .stores({
    todos: 'id, status, createdAt',
  })
  .upgrade((tx) => {
    return tx
      .table('todos')
      .toCollection()
      .modify((todo) => {
        todo.status = todo.completed ? 'completed' : 'pending'
        delete todo.completed
      })
  })

export { db }
export type { Todo, TodoStatus }
