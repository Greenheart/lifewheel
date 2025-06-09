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

<div style="border: 2px solid white; padding: 1em; border-radius: 0.5em; background-color: rgba(255, 255, 255, 0.1);" class={['', "comment-view", hidden ? 'hidden-comment' : ''].join(' ')}>
    <p>
        {textData}
    </p>
</div>
