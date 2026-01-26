/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#09213d',
                active: '#0cd091',
                danger: '#f16677',
            },
            fontFamily: {
                sans: ['Archia', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
