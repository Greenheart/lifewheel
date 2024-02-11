import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),

    kit: {
        adapter: adapter(),
        alias: {
            $lib: resolve('./src/lib'),
            $components: resolve('./src/components'),
            $icons: resolve('./src/icons'),
        },
        paths: {
            base: '/lifewheel',
        },
        embedded: true,
    },
}

export default config
