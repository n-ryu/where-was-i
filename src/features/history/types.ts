import type { TimeBlock } from '@/stores/historyAtoms'

export interface GanttChartProps {
  timeBlocks: TimeBlock[]
  selectedDate: Date
}

export interface DayPickerProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
}
