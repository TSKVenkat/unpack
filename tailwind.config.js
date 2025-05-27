module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // blue
        accent: '#fbbf24', // yellow
        playfulPink: '#ffb3e6',
        playfulPurple: '#b388ff',
        playfulBlack: '#18181b',
        playfulWhite: '#f9fafb',
        playfulGray: '#e5e7eb',
        playfulRed: '#ff3b3f',
      },
      fontFamily: {
        display: ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        xl: '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        card: '0 4px 24px 0 rgba(0,0,0,0.08)',
        playful: '0 2px 16px 0 rgba(36, 99, 235, 0.12)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}; 