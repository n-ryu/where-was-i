import { useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  inProgressTodoAtom,
  pendingTodosAtom,
  completedTodosAtom,
  loadTodosAtom,
  addTodoAtom,
  toggleTodoStatusAtom,
} from '@/stores/todoAtoms'

export const useTodos = () => {
  const inProgressTodo = useAtomValue(inProgressTodoAtom)
  const pendingTodos = useAtomValue(pendingTodosAtom)
  const completedTodos = useAtomValue(completedTodosAtom)
  const loadTodos = useSetAtom(loadTodosAtom)
  const addTodo = useSetAtom(addTodoAtom)
  const toggleStatus = useSetAtom(toggleTodoStatusAtom)

  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  return {
    inProgressTodo,
    pendingTodos,
    completedTodos,
    addTodo,
    toggleStatus,
  }
}
