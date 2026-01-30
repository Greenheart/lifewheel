<script lang="ts" module>
    import type { ClassValue, HTMLAttributes } from 'svelte/elements'
</script>

<script lang="ts">
    interface Props extends HTMLAttributes<HTMLAnchorElement> {
        comment: string
        class?: string
    }

    let { comment, class: className }: Props = $props()
</script>

<div class={['comment-view rounded-md bg-gray-800 p-4 text-wrap wrap-anywhere', className]}>
    <p>
        {comment}
    </p>
</div>
