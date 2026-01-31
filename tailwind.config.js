/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./screens/**/*.{js,jsx,ts,tsx}",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Identidad de Marca
                primary: '#3b82f6',
                primaryDark: '#2563eb',
                secondary: '#8b5cf6',

                // Estados de Dispositivo
                online: '#10b981',
                offline: '#6b7280',
                maintenance: '#f59e0b',

                // Severidad de Alertas
                severityLow: '#10b981',
                severityMedium: '#f59e0b',
                severityHigh: '#f97316',
                severityCritical: '#ef4444',

                // Tipos de Notificación
                alert: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6',
                success: '#10b981',

                // UI Base (Dark Mode)
                background: '#0f172a',
                surface: '#1e293b',
                surfaceLight: '#334155',
                border: '#475569',
                textPrimary: '#f8fafc',
                textSecondary: '#cbd5e1',
                textMuted: '#94a3b8',
            },
        },
    },
    plugins: [],
}
