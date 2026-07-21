import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        xp: 'var(--color-xp)',
        streak: 'var(--color-streak)',
        money: 'var(--color-money)',
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: (u: Record<string, Record<string, string>>) => void }) {
      addUtilities({ '.scrollbar-none': { '-ms-overflow-style': 'none', 'scrollbar-width': 'none' }, '.scrollbar-none::-webkit-scrollbar': { display: 'none' } });
    },
  ],
} satisfies Config
