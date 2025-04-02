<script lang="ts" module>
    import type { CommentState } from '$lib/types'
</script>

<script lang="ts">
    type Props = {
        commentState: CommentState
    }

    let { commentState = $bindable() }: Props = $props()
</script>

<textarea rows="3" cols="50" class={['']} style="color: black; outline: black; outline-width: 1px; outline-style: dotted;"
    bind:value={commentState}>
</textarea>
