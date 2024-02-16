import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import Icons from 'unplugin-icons/vite'
import { setDefaultResultOrder } from 'dns'

setDefaultResultOrder('verbatim')

export default defineConfig({
    plugins: [sveltekit(), basicSsl(), Icons({ compiler: 'svelte' })],
})
