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

<div
    class={[
        'comment-view rounded-lg border-2 border-white bg-white/10 p-4 text-wrap wrap-break-word break-all',
        className,
    ]}
>
    <p>
        {comment}
    </p>
</div>
