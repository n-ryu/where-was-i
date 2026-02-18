import { useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  completedTodayTodosAtom,
  activeTodayTodosAtom,
  idleTodosAtom,
  loadTodosAtom,
  loadTodayEventsAtom,
  addTodoAtom,
  toggleTodoStatusAtom,
  deleteTodoAtom,
  updateTodoTitleAtom,
} from '@/stores/todoAtoms'

export const useTodos = () => {
  const completedTodayTodos = useAtomValue(completedTodayTodosAtom)
  const activeTodayTodos = useAtomValue(activeTodayTodosAtom)
  const idleTodos = useAtomValue(idleTodosAtom)
  const loadTodos = useSetAtom(loadTodosAtom)
  const loadTodayEvents = useSetAtom(loadTodayEventsAtom)
  const addTodo = useSetAtom(addTodoAtom)
  const toggleStatus = useSetAtom(toggleTodoStatusAtom)
  const deleteTodo = useSetAtom(deleteTodoAtom)
  const updateTodoTitle = useSetAtom(updateTodoTitleAtom)

  useEffect(() => {
    loadTodos()
    loadTodayEvents()
  }, [loadTodos, loadTodayEvents])

  return {
    completedTodayTodos,
    activeTodayTodos,
    idleTodos,
    addTodo,
    toggleStatus,
    deleteTodo,
    updateTodoTitle,
  }
}
