import { useEffect, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  timeBlocksAtom,
  loadHistoryAtom,
  loadTodoLookupAtom,
} from '@/stores/historyAtoms'

export const useHistory = () => {
  const timeBlocks = useAtomValue(timeBlocksAtom)
  const loadHistory = useSetAtom(loadHistoryAtom)
  const loadTodoLookup = useSetAtom(loadTodoLookupAtom)
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  useEffect(() => {
    loadHistory()
    loadTodoLookup()
  }, [loadHistory, loadTodoLookup])

  return { timeBlocks, selectedDate, setSelectedDate }
}
