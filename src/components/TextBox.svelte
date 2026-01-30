<script lang="ts" module>
    import type { CommentState } from '$lib/types'
</script>

<script lang="ts">
    type Props = {
        value: CommentState
    }

    let { value = $bindable() }: Props = $props()
</script>

<div class="autogrow">
    <textarea
        class="comment-textarea"
        rows="2"
        cols="42"
        maxlength="300"
        placeholder="Write your reflection..."
        bind:value
        oninput={(event) => {
            ;(event.currentTarget.parentNode as HTMLElement).dataset.content =
                event.currentTarget.value
        }}
    >
    </textarea>
</div>

<style>
    .autogrow {
        display: grid;
    }

    .autogrow::after {
        content: attr(data-content) ' ';
        white-space: pre-wrap;
        visibility: hidden;
    }

    .autogrow > textarea {
        resize: none;
        overflow: hidden;
    }

    .autogrow > textarea,
    .autogrow::after {
        min-height: 100px;
        width: 100%;
        border-radius: 6px;
        color: white;
        padding: 0.5rem;
        outline: 1px solid white;
        grid-area: 1 / 1 / 2 / 2;
    }
</style>
