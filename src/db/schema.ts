import Dexie, { type EntityTable } from 'dexie'

type TodoStatus = 'in_progress' | 'pending' | 'completed'

interface Todo {
  id: string
  title: string
  status: TodoStatus
  createdAt: Date
  updatedAt: Date
}

type TodoHistoryEventType =
  | 'created'
  | 'started'
  | 'stopped'
  | 'completed'
  | 'reopened'

interface TodoHistoryEvent {
  id: string
  todoId: string
  eventType: TodoHistoryEventType
  fromStatus: TodoStatus | null
  toStatus: TodoStatus
  timestamp: Date
}

const db = new Dexie('WhereWasIDB') as Dexie & {
  todos: EntityTable<Todo, 'id'>
  todoHistory: EntityTable<TodoHistoryEvent, 'id'>
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

db.version(3)
  .stores({
    todos: 'id, status, createdAt',
    todoHistory: 'id, todoId, eventType, timestamp',
  })
  .upgrade(async (tx) => {
    const todos = await tx.table('todos').toArray()
    const historyTable = tx.table('todoHistory')
    for (const todo of todos) {
      await historyTable.add({
        id: crypto.randomUUID(),
        todoId: todo.id,
        eventType: 'created',
        fromStatus: null,
        toStatus: todo.status,
        timestamp: todo.createdAt,
      })
    }
  })

export { db }
export type { Todo, TodoStatus, TodoHistoryEvent, TodoHistoryEventType }
