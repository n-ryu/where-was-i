import type { Preview } from 'storybook'
import { ThemeProvider } from 'styled-components'
import { GlobalStyle } from '../src/styles/GlobalStyle'
import { theme } from '../src/styles/theme'

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    viewport: {
      options: {
        mobile: {
          name: 'Mobile (430px)',
          styles: { width: '430px', height: '932px' },
        },
      },
      defaultViewport: 'mobile',
    },
    backgrounds: {
      default: 'desktop',
      values: [
        { name: 'desktop', value: '#f1f5f9' },
        { name: 'white', value: '#ffffff' },
      ],
    },
  },
}

export default preview
