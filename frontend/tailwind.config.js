/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                clinical: {
                    bg: '#f8fafc', // slate-50
                    card: '#ffffff',
                    primary: '#0f172a', // slate-900
                    accent: '#0ea5e9', // sky-500
                    danger: '#ef4444', // red-500
                    safe: '#22c55e', // green-500
                }
            }
        },
    },
    plugins: [],
}
