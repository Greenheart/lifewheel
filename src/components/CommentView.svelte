<script lang="ts" module>
    import type { HTMLAttributes } from 'svelte/elements'
</script>

<script lang="ts">
    interface Props extends HTMLAttributes<HTMLAnchorElement> {
        textData: string
        hidden?: boolean
    }

    let { textData, hidden }: Props = $props()
</script>

<div
    class={['comment-view rounded-lg border-2 border-white bg-white/10 p-4', hidden && 'invisible']}
>
    <p>
        {textData}
    </p>
</div>
