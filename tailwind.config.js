/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        coffee: {
          50:  '#F8EFE4',
          100: '#EDD4B8',
          200: '#DDB898',
          300: '#CA9872',
          400: '#B87B52',
          500: '#9B6240',
          600: '#7A4A2C',
          700: '#5C3620',
          800: '#3E2410',
          900: '#2D1A0E',
          950: '#1C0F08',
        },
        ink: {
          900: '#0A0A0A',
          800: '#171717',
          700: '#2A2A2A',
          600: '#3D3D3D',
          500: '#6A6A6A',
          400: '#8A8A8A',
          300: '#B0B0B0',
        },
        cream: {
          50: '#FAFAF8',
          100: '#F5F4F0',
          200: '#EDEAE2',
        },
      },
      fontFamily: {
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        'marquee-reverse': 'marquee-reverse 40s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        shimmer: 'shimmer 2.4s linear infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
