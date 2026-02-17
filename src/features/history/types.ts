import type { TimeBlock, TimeMarker } from '@/stores/historyAtoms'

export type TodoDayStatus = 'completed' | 'incomplete' | 'inactive'

export interface ActiveTodo {
  todoId: string
  todoTitle: string
  dayStatus: TodoDayStatus
}

export interface GanttChartProps {
  timeBlocks: TimeBlock[]
  timeMarkers: TimeMarker[]
  activeTodos: ActiveTodo[]
  selectedDate: Date
}

export interface DayPickerProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}
