import { useEffect, useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  timeBlocksAtom,
  timeMarkersAtom,
  loadHistoryAtom,
  loadTodoLookupAtom,
} from '@/stores/historyAtoms'

export const useHistory = () => {
  const timeBlocks = useAtomValue(timeBlocksAtom)
  const timeMarkers = useAtomValue(timeMarkersAtom)
  const loadHistory = useSetAtom(loadHistoryAtom)
  const loadTodoLookup = useSetAtom(loadTodoLookupAtom)
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  useEffect(() => {
    loadHistory()
    loadTodoLookup()
  }, [loadHistory, loadTodoLookup])

  return { timeBlocks, timeMarkers, selectedDate, setSelectedDate }
}
