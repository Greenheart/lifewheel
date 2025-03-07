import { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        screens: {
            '2xs': '375px',
            xs: '475px',
            ...defaultTheme.screens,
        },
        extend: {
            fontFamily: {
                sans: ['Inter Variable', ...defaultTheme.fontFamily.sans],
            },
        },
    },
} satisfies Config
