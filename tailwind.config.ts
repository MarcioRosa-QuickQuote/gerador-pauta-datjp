import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'tjpa-blue': '#00274d',
        'tjpa-blue-dark': '#001f3f',
        'tjpa-notification': '#e7f3fe',
        'tjpa-notification-text': '#0d47a1',
      },
      boxShadow: {
        'tjpa-button': '0px 6px 12px rgba(0, 0, 0, 0.40)',
      },
    },
  },
  plugins: [],
};

export default config;
