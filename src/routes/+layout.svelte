<script lang="ts">
    import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from '$lib/constants'
    import '@fontsource-variable/inter'
    import '../app.postcss'

    let { children } = $props()
</script>

<svelte:head>
    <title>{APP_NAME} - {APP_TAGLINE}</title>
    <meta name="description" content={APP_DESCRIPTION} />
</svelte:head>

<main class="min-h-screen bg-gray-900 text-white">
    {@render children()}
</main>
