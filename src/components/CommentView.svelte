<script lang="ts" module>
    import type { HTMLAttributes } from 'svelte/elements'
</script>

<script lang="ts">
    interface Props extends HTMLAttributes<HTMLAnchorElement> {
        textData: string
    }

    let { textData, class: className }: Props = $props()
</script>

<p class={['', className]}>
    {textData}
</p>
