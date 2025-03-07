<script lang="ts" module>
    import type { HTMLAttributes } from 'svelte/elements'
    import type { Snippet } from 'svelte'
    import { defaultVariant, variants, defaultClasses } from './Button.svelte'
</script>

<script lang="ts">
    interface Props extends HTMLAttributes<HTMLAnchorElement> {
        href: string
        variant?: keyof typeof variants
        children: Snippet
    }

    let { href, variant = defaultVariant, class: className, children }: Props = $props()
</script>

<a {href} class={['block text-center', defaultClasses, variants[variant], className]}>
    {@render children()}
</a>
