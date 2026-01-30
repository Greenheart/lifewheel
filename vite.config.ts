import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import tailwind from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'
import { setDefaultResultOrder } from 'node:dns'

setDefaultResultOrder('verbatim')

export default defineConfig({
    plugins: [sveltekit(), tailwind(), Icons({ compiler: 'svelte' })],
    build: {
        target: 'es2022',
    },
})
