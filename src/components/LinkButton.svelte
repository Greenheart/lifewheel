<script lang="ts" context="module">
    import { cx } from '$lib/utils'
    import { defaultVariant, variants } from './Button.svelte'
</script>

<script lang="ts">
    export let href: string
    export let variant: keyof typeof variants = defaultVariant
    let className = ''
    export { className as class }
</script>

<a {href} class={cx('block text-center', variants[variant], className)}>
    <slot />
</a>
