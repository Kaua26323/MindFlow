/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/web/views/**/*.hbs',
    './src/web/views/**/*.handlebars',
    './src/**/*.ts',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
      },
    },
  },
  plugins: [],
};
