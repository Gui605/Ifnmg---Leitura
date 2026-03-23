import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class', '.dark-mode'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
