const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        screens: {
            '2xs': '375px',
            xs: '475px',
            ...defaultTheme.screens,
        },
        extend: {
            fontFamily: {
                sans: ['Inter var', ...defaultTheme.fontFamily.sans],
            },
        },
    },
}
