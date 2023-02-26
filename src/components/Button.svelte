<script lang="ts" context="module">
    import { cx } from '$lib/utils'

    export const variants = {
        solid: 'rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-400/75 px-3 py-2 text-lg text-black shadow-md',
        roundSolid:
            'border-2 border-emerald-400 bg-gradient-to-br from-emerald-400 to-emerald-400/75 w-14 xs:w-16 h-14 xs:h-16 text-2xl shadow-md rounded-full text-black',
        roundOutline:
            'border-2 border-emerald-400 w-14 xs:w-16 h-14 xs:h-16 text-2xl rounded-full shadow-md',
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
