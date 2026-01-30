import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),

    compilerOptions: {
        experimental: {
            async: true,
        },
    },

    kit: {
        adapter: adapter(),
        alias: {
            $lib: resolve('./src/lib'),
            $components: resolve('./src/components'),
        },
        paths: {
            base: '/lifewheel',
        },
        embedded: true,
        experimental: {
            remoteFunctions: true,
        },
    },
}

export default config
