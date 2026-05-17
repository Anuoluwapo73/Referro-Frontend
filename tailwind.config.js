/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Referro design tokens — matches style.css :root vars
        primary: {
          50:  '#F0F5FF', // --blue-ghost
          100: '#DBEAFE', // --blue-pale
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#1447F5', // --blue (brand)
          700: '#0F3AD4', // --blue-h
          800: '#1E3A8A',
          900: '#1E2A6E',
        },
        ink: {
          DEFAULT: '#0A0F1E', // --ink
          2:       '#111827', // --ink-2
        },
        slate: {
          DEFAULT: '#64748B', // --slate
          light:   '#94A3B8', // --slate-lt
        },
        line:    '#E2E8F0',
        success: { DEFAULT: '#059669', bg: '#ECFDF5' },
        warning: '#F59E0B',
        error:   '#EF4444',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:  '6px',
        md:  '10px',
        lg:  '14px',
        xl:  '18px',
        '2xl': '24px',
      },
      boxShadow: {
        sm:   '0 1px 4px rgba(10,15,30,.06), 0 4px 16px rgba(10,15,30,.04)',
        md:   '0 4px 12px rgba(10,15,30,.07), 0 16px 40px rgba(10,15,30,.06)',
        blue: '0 2px 12px rgba(20,71,245,.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
