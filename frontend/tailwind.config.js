/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'var(--border-color)',
        input: 'var(--border-color)',
        ring: '#2563eb',
        background: 'var(--bg-main)',
        foreground: 'var(--text-primary)',
        primary: {
          DEFAULT: '#2563eb',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'var(--bg-subtle)',
          foreground: 'var(--text-secondary)',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: 'var(--bg-subtle)',
          foreground: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: 'var(--bg-subtle)',
          foreground: 'var(--text-primary)',
        },
        card: {
          DEFAULT: 'var(--bg-card)',
          foreground: 'var(--text-primary)',
        },
        sidebar: {
          DEFAULT: 'var(--bg-sidebar)',
          foreground: 'var(--text-primary)',
        },
        status: {
          online: 'var(--status-online)',
          'online-bg': 'var(--status-online-bg)',
          warning: 'var(--status-warning)',
          'warning-bg': 'var(--status-warning-bg)',
          critical: 'var(--status-critical)',
          'critical-bg': 'var(--status-critical-bg)',
        },
      },
      borderRadius: {
        lg: 'var(--radius-card)',
        md: 'calc(var(--radius-card) - 2px)',
        sm: 'calc(var(--radius-card) - 4px)',
        xl: '20px',
        '2xl': '24px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
      },
    },
  },
  plugins: [],
};

