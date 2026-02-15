import { useState } from 'react'
import { MainPage } from '@/pages/MainPage'
import { HistoryPage } from '@/pages/HistoryPage'

type Page = 'main' | 'history'

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('main')

  switch (currentPage) {
    case 'main':
      return (
        <MainPage onNavigateToHistory={() => setCurrentPage('history')} />
      )
    case 'history':
      return <HistoryPage onNavigateBack={() => setCurrentPage('main')} />
  }
}
