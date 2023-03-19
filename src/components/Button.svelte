<script lang="ts" context="module">
    import { cx } from '$lib/utils'

    export const variants = {
        solid: 'rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-400/75 px-3 py-2 text-lg text-black hover:from-emerald-500 hover:to-emerald-500/75',
        outline:
            'rounded-lg px-3 py-2 text-lg hover:from-emerald-500 hover:bg-emerald-400/10 hover:to-emerald-500/75',
        roundSolid:
            'bg-gradient-to-br from-emerald-400 to-emerald-400/75 hover:from-emerald-500 hover:to-emerald-500/75 w-12 2xs:w-14 xs:w-16 h-12 2xs:h-14 xs:h-16 text-2xl rounded-full text-black',
        roundOutline:
            'w-12 2xs:w-14 xs:w-16 h-12 2xs:h-14 xs:h-16 text-2xl rounded-full hover:bg-emerald-400/10',
    }
    export const defaultVariant = 'solid'
    export const defaultClasses = 'border-2 border-emerald-400 hover:border-emerald-500 shadow-md'
</script>

<script lang="ts">
    export let disabled: boolean = false
    export let variant: keyof typeof variants = defaultVariant
    export let type: 'submit' | undefined = undefined
    let className = ''
    export { className as class }
</script>

<button on:click {disabled} class={cx(defaultClasses, variants[variant], className)} {type}>
    <slot />
</button>
