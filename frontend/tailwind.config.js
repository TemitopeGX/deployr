/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: '#030405',
                    surface: '#0a0b0d',
                    card: '#101216',
                    border: 'rgba(255, 255, 255, 0.06)'
                }
            },
            fontFamily: {
                display: ['Outfit', 'sans-serif'],
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
