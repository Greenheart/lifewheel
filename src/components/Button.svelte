<script lang="ts" context="module">
    import type { HTMLButtonAttributes } from 'svelte/elements'
    import { cx } from '$lib/utils'

    export const variants = {
        solid: 'rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-400/75 px-3 py-2 text-lg text-black hover:from-emerald-500 hover:to-emerald-500/75',
        outline: 'rounded-lg px-3 py-2 text-lg hover:bg-emerald-400/10',
        ghost: 'rounded-lg px-3 py-2 text-lg hover:bg-emerald-400/5 border-transparent hover:border-emerald-500/5 shadow-none',
        roundSolid:
            'bg-gradient-to-br from-emerald-400 to-emerald-400/75 hover:from-emerald-500 hover:to-emerald-500/75 w-12 2xs:w-14 xs:w-16 h-12 2xs:h-14 xs:h-16 text-2xl rounded-full text-black grid place-items-center',
        roundOutline:
            'w-12 2xs:w-14 xs:w-16 h-12 2xs:h-14 xs:h-16 text-2xl rounded-full hover:bg-emerald-400/10 grid place-items-center',
        roundGhost:
            'rounded-full text-lg w-12 2xs:w-14 xs:w-16 h-12 2xs:h-14 xs:h-16 hover:bg-emerald-400/5 border-transparent hover:border-emerald-500/5 shadow-none grid place-items-center',
    }
    export const defaultVariant = 'solid'
    export const defaultClasses =
        'border-2 border-emerald-400 hover:border-emerald-500 shadow-md disabled:cursor-not-allowed disabled:opacity-25'
</script>

<script lang="ts">
    interface $$Props extends HTMLButtonAttributes {
        disabled?: boolean
        variant?: keyof typeof variants
        class?: string
    }
    export let disabled = false
    export let variant: keyof typeof variants = defaultVariant
    let className = ''
    export { className as class }
</script>

<button
    {...$$restProps}
    on:click
    {disabled}
    class={cx(defaultClasses, variants[variant], className)}
>
    <slot />
</button>
