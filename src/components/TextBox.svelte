<script lang="ts" module>
    import type { CommentState } from '$lib/types'
</script>

<script lang="ts">
    type Props = {
        commentState: CommentState
    }

    let { commentState = $bindable() }: Props = $props()
</script>

<textarea
    class="comment-textarea min-h-25 w-full resize-none rounded-lg px-2 py-3 text-white outline-1 outline-white"
    rows="2"
    cols="42"
    maxlength="300"
    placeholder="Write your reflection..."
    bind:value={commentState}
>
</textarea>
