import { screen } from '@testing-library/react'
import { renderWithTheme } from '@/test-utils'
import { App } from './App'

describe('App', () => {
  it('renders the title', () => {
    renderWithTheme(<App />)
    expect(screen.getByText('where was i')).toBeInTheDocument()
  })
})
