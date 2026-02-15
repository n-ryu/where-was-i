export const theme = {
  colors: {
    primary: '#2563eb',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    accent: '#22c55e',
    accentLight: '#f0fdf4',
    warning: '#f59e0b',
    surfaceAlt: '#f1f5f9',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  fonts: {
    body: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  layout: {
    maxWidth: '430px',
    desktopBg: '#f1f5f9',
  },
} as const

export type Theme = typeof theme
