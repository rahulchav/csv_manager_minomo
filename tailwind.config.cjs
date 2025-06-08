const { resolveProjectPath } = require('wasp/dev')

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [resolveProjectPath('./src/**/*.{js,jsx,ts,tsx}')],
	theme: {
		extend: {
			keyframes: {
				'emerge-in': {
				  '0%': { opacity: '0', transform: 'translate(-50%, -50%) scale(0.8)' },
				  '100%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
				},
				'emerge-out': {
				  '0%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
				  '100%': { opacity: '0', transform: 'translate(-50%, -50%) scale(0.8)' },
				},
			  },
			  animation: {
				'emerge-in': 'emerge-in 200ms ease-out forwards',
				'emerge-out': 'emerge-out 200ms ease-in forwards',
			  },
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			}
		}
	},
  plugins: [require("tailwindcss-animate")],
}