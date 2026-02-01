import type { Preview, Decorator } from '@storybook/react'
import { createGlobalStyle } from 'styled-components'
import 'fake-indexeddb/auto'
import { withIndexedDB } from './decorators/IndexedDBDecorator'

const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f5f5f5;
    color: #333;
    line-height: 1.5;
  }
`

const withGlobalStyles: Decorator = (Story) => (
  <>
    <GlobalStyles />
    <Story />
  </>
)

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'padded',
  },
  decorators: [withGlobalStyles, withIndexedDB],
}

export default preview
