/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                hr: {
                    primary: '#6366f1', // Indigo 500
                    secondary: '#8b5cf6', // Violet 500
                    bg: '#e0e7ff', // Indigo 100
                },
                candidate: {
                    primary: '#10b981', // Emerald 500
                    secondary: '#0d9488', // Teal 600
                    bg: '#d1fae5', // Emerald 100
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
