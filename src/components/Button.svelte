<script lang="ts" context="module">
    import { cx } from '$lib/utils'

    export const variants = {
        solid: 'rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-400/75 px-3 py-2 text-lg text-black shadow-md',
    }
    export const defaultVariant = 'solid'
</script>

<script lang="ts">
    export let disabled: boolean = false
    export let variant: keyof typeof variants = defaultVariant
    let className = ''
    export { className as class }
</script>

<button on:click {disabled} class={cx(variants[variant], className)}>
    <slot />
</button>
