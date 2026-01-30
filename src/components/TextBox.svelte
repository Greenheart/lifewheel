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
    class="comment-textarea"
    rows="2"
    cols="42"
    maxlength="100"
    placeholder="Leave a comment..."
    bind:value={commentState}
>
</textarea>
