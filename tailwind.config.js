/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 },
        },
        spinDot: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        truckMove: {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(6px)' },
          '100%': { transform: 'translateX(0)' },
        },
        bounceCheck: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
      animation: {
        pulseSlow: 'pulseSlow 1.8s infinite ease-in-out',
        spinDot: 'spinDot 1.1s infinite linear',
        truckMove: 'truckMove 1.4s infinite ease-in-out',
        bounceCheck: 'bounceCheck 1s infinite',
      },
    },
  },
  plugins: [],
};
