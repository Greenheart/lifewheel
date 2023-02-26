<script lang="ts" context="module">
    import Button from './Button.svelte'
</script>

<script lang="ts">
    let onPrev: ((event: MouseEvent) => void) | null = () => {}
    let onNext: ((event: MouseEvent) => void) | null = () => {}
</script>

<div class="mx-auto flex max-w-screen-md justify-center">
    <div class="flex w-full max-w-sm justify-between">
        {#if onPrev}
            <Button variant="roundOutline" on:click={onPrev}>←</Button>
        {/if}
        <div class="flex-grow" />
        {#if onNext}
            <Button variant="roundSolid" on:click={onNext}>→</Button>
        {/if}
    </div>
</div>
